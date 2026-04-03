import axios from 'axios';
import WebSocket from 'ws';
import { NormalizedTick } from '@quantpulse/shared';

/**
 * Angel One SmartAPI Connector (WebSocket + REST Fallback)
 * 
 * Primary: Real-time MCX data via SmartAPI WebSocket (Smart Stream)
 * Fallback: REST polling via Market Data API every 30s
 * 
 * Flow:
 *   1. Generate TOTP → Login → Get JWT + Feed Token
 *   2. Download scrip master → Find MCX futures tokens
 *   3. Connect WebSocket for real-time LTP ticks
 *   4. Fall back to REST polling if WS fails
 *   5. Auto-refresh session every 6 hours
 */

const BASE_URL = 'https://apiconnect.angelone.in';
const WS_URL = 'wss://smartapisocket.angelone.in/smart-stream';

interface ScripToken {
  symboltoken: string;
  tradingsymbol: string;
  name: string;
  exchange: string;
  assetId: string;
}

const MCX_SCRIP_SEARCH: Record<string, string[]> = {
  'MCX_GOLD':      ['GOLD', 'GOLDM'],
  'MCX_SILVER':    ['SILVER', 'SILVERM'],
  'MCX_CRUDEOIL':  ['CRUDEOIL', 'CRUDEOILM'],
  'MCX_ALUMINIUM': ['ALUMINIUM', 'ALUMINI'],
  'MCX_COPPER':    ['COPPER'],
  'MCX_STEEL':     ['STEELLONG'],
};

export class AngelOneConnector {
  private restTimer: NodeJS.Timeout | null = null;
  private sessionRefreshTimer: NodeJS.Timeout | null = null;
  private ws: WebSocket | null = null;
  private wsReconnectTimer: NodeJS.Timeout | null = null;
  private jwtToken: string = '';
  private feedToken: string = '';
  private scripTokens: ScripToken[] = [];
  private lastPrices: Record<string, number> = {};
  private useWebSocket: boolean = true;
  private wsConnected: boolean = false;

  // Token → assetId reverse map for WebSocket tick parsing
  private tokenToAssetId: Map<string, string> = new Map();

  constructor(
    private onTick: (tick: NormalizedTick) => void,
    private config: {
      apiKey: string;
      clientId: string;
      password: string;
      totpSecret: string;
    },
  ) {}

  async start() {
    console.log('[AngelOne] Initializing SmartAPI connector...');

    try {
      await this.login();
      await this.loadScripMaster();

      // Try WebSocket first, fall back to REST
      if (this.useWebSocket && this.feedToken) {
        this.connectWebSocket();
      }

      // Start REST polling as fallback (runs alongside WS, skipped if WS is healthy)
      this.restTimer = setInterval(() => {
        if (!this.wsConnected) {
          this.pollREST();
        }
      }, 30_000);

      // Also do an initial REST poll immediately
      this.pollREST();

      // Auto-refresh session every 6 hours
      this.sessionRefreshTimer = setInterval(async () => {
        console.log('[AngelOne] Refreshing session...');
        try {
          await this.login();
          // Reconnect WS with new tokens
          if (this.useWebSocket) {
            this.disconnectWebSocket();
            this.connectWebSocket();
          }
        } catch (e: any) {
          console.error('[AngelOne] Session refresh failed:', e.message);
        }
      }, 6 * 60 * 60_000);

      console.log(`[AngelOne] Active with ${this.scripTokens.length} MCX symbols.`);
    } catch (err: any) {
      console.error(`[AngelOne] Failed to start: ${err.message}`);
    }
  }

  stop() {
    if (this.restTimer) clearInterval(this.restTimer);
    if (this.sessionRefreshTimer) clearInterval(this.sessionRefreshTimer);
    if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer);
    this.disconnectWebSocket();
    console.log('[AngelOne] Stopped.');
  }

  // ========== AUTH ==========

  private async login() {
    let totpCode: string;
    try {
      const { authenticator } = await import('otplib');
      totpCode = authenticator.generate(this.config.totpSecret);
    } catch (e) {
      throw new Error('Failed to generate TOTP. Ensure "otplib" is installed.');
    }

    const response = await axios.post(
      `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
      {
        clientcode: this.config.clientId,
        password: this.config.password,
        totp: totpCode,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': 'AA:BB:CC:DD:EE:FF',
          'Accept': 'application/json',
          'X-PrivateKey': this.config.apiKey,
        },
        timeout: 15000,
      }
    );

    const result = response.data;
    if (!result.status || !result.data?.jwtToken) {
      throw new Error(`Login failed: ${result.message || 'Unknown error'}`);
    }

    this.jwtToken = result.data.jwtToken;
    this.feedToken = result.data.feedToken || '';
    console.log(`[AngelOne] Login successful. JWT + FeedToken acquired.`);
  }

  // ========== SCRIP MASTER ==========

  private async loadScripMaster() {
    console.log('[AngelOne] Loading MCX scrip master...');

    const response = await axios.get(
      'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
      { timeout: 30000 }
    );

    const allScrips: any[] = response.data;
    this.scripTokens = [];
    this.tokenToAssetId.clear();

    for (const [assetId, searchTerms] of Object.entries(MCX_SCRIP_SEARCH)) {
      const mcxMatches = allScrips
        .filter((s: any) =>
          s.exch_seg === 'MCX' &&
          searchTerms.some(term => s.symbol?.startsWith(term)) &&
          s.instrumenttype === 'FUTCOM'
        )
        .sort((a: any, b: any) =>
          new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
        );

      if (mcxMatches.length > 0) {
        const nearestFuture = mcxMatches[0];
        this.scripTokens.push({
          symboltoken: nearestFuture.token,
          tradingsymbol: nearestFuture.symbol,
          name: nearestFuture.name,
          exchange: 'MCX',
          assetId,
        });
        this.tokenToAssetId.set(nearestFuture.token, assetId);
        console.log(`  → ${assetId}: ${nearestFuture.symbol} (token: ${nearestFuture.token})`);
      } else {
        console.warn(`  ⚠ ${assetId}: No MCX futures contract found`);
      }
    }
  }

  // ========== WEBSOCKET (Real-time Ticks) ==========

  private connectWebSocket() {
    if (!this.feedToken || this.scripTokens.length === 0) {
      console.warn('[AngelOne] Cannot connect WS: missing feedToken or scrip tokens');
      return;
    }

    const wsUrl = `${WS_URL}?clientCode=${this.config.clientId}&feedToken=${this.feedToken}&apiKey=${this.config.apiKey}`;

    console.log('[AngelOne] Connecting WebSocket for real-time MCX ticks...');

    try {
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'x-api-key': this.config.apiKey,
          'x-client-code': this.config.clientId,
          'x-feed-token': this.feedToken,
        },
      });

      this.ws.on('open', () => {
        console.log('[AngelOne] WebSocket connected ✅');
        this.wsConnected = true;

        // Subscribe to all MCX tokens in LTP mode (mode = 1)
        const tokenList = this.scripTokens.map(s => s.symboltoken);
        const subscribeMsg = JSON.stringify({
          correlationID: `quant_${Date.now()}`,
          action: 1, // Subscribe
          params: {
            mode: 2, // 2 = Quote (includes OHLC), 1 = LTP only
            tokenList: [
              {
                exchangeType: 5, // MCX
                tokens: tokenList,
              },
            ],
          },
        });

        this.ws!.send(subscribeMsg);
        console.log(`[AngelOne] Subscribed to ${tokenList.length} MCX tokens via WebSocket`);
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          this.parseBinaryTick(data);
        } catch (e: any) {
          // Might be a JSON error/info message
          try {
            const jsonMsg = JSON.parse(data.toString());
            if (jsonMsg.errorCode) {
              console.warn(`[AngelOne WS] Error: ${jsonMsg.errorMessage || jsonMsg.errorCode}`);
            }
          } catch {
            // Binary parsing failed, skip
          }
        }
      });

      this.ws.on('error', (err) => {
        console.error(`[AngelOne WS] Error: ${err.message}`);
        this.wsConnected = false;
      });

      this.ws.on('close', (code, reason) => {
        console.warn(`[AngelOne WS] Disconnected (code: ${code}). Reconnecting in 10s...`);
        this.wsConnected = false;
        this.wsReconnectTimer = setTimeout(() => this.connectWebSocket(), 10000);
      });

    } catch (err: any) {
      console.error(`[AngelOne] WebSocket connection failed: ${err.message}`);
      this.wsConnected = false;
    }
  }

  private disconnectWebSocket() {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
    this.wsConnected = false;
  }

  /**
   * Parse binary tick data from Angel One Smart Stream
   * 
   * Quote mode (mode=2) per token:
   * - subscription_mode: 1 byte (uint8)
   * - exchange_type: 1 byte (uint8)
   * - token: 25 bytes (ascii, null-padded)
   * - sequence_number: 8 bytes (int64 LE)
   * - exchange_timestamp: 8 bytes (int64 LE, epoch ms)
   * - ltp: 4 bytes (int32 LE, price * 100)
   * - last_traded_qty: 4 bytes (int32 LE)
   * - avg_trade_price: 4 bytes (int32 LE, price * 100)
   * - volume: 4 bytes (int32 LE)
   * - total_buy_qty: 8 bytes (int64 LE)
   * - total_sell_qty: 8 bytes (int64 LE)
   * - open: 4 bytes (int32 LE, price * 100)
   * - high: 4 bytes (int32 LE, price * 100)
   * - low: 4 bytes (int32 LE, price * 100)
   * - close: 4 bytes (int32 LE, price * 100)
   */
  private parseBinaryTick(data: Buffer) {
    if (data.length < 47) return; // Too small for even LTP

    let offset = 0;
    const mode = data.readUInt8(offset); offset += 1;
    const exchangeType = data.readUInt8(offset); offset += 1;

    // Read token (25 bytes, null-terminated ASCII)
    const tokenBuf = data.subarray(offset, offset + 25);
    const token = tokenBuf.toString('ascii').replace(/\0/g, '').trim();
    offset += 25;

    // Sequence number (8 bytes)
    offset += 8; // skip

    // Exchange timestamp (8 bytes, epoch ms)
    const timestampLow = data.readUInt32LE(offset);
    const timestampHigh = data.readUInt32LE(offset + 4);
    const exchangeTimestamp = timestampLow + timestampHigh * 0x100000000;
    offset += 8;

    // LTP (4 bytes, price * 100)
    const ltp = data.readInt32LE(offset) / 100;
    offset += 4;

    const assetId = this.tokenToAssetId.get(token);
    if (!assetId) return;

    let open = ltp, high = ltp, low = ltp, close = ltp, volume = 0;

    // If Quote mode (mode=2), parse additional OHLCV fields
    if (mode === 2 && data.length >= 91) {
      offset += 4; // last_traded_qty
      offset += 4; // avg_trade_price
      volume = data.readInt32LE(offset); offset += 4;
      offset += 8; // total_buy_qty
      offset += 8; // total_sell_qty
      open = data.readInt32LE(offset) / 100; offset += 4;
      high = data.readInt32LE(offset) / 100; offset += 4;
      low = data.readInt32LE(offset) / 100; offset += 4;
      close = data.readInt32LE(offset) / 100; offset += 4;
    }

    const prevPrice = this.lastPrices[assetId] || ltp;
    const percentChange = prevPrice !== 0 ? ((ltp - prevPrice) / prevPrice) * 100 : 0;
    this.lastPrices[assetId] = ltp;

    const tick: NormalizedTick = {
      assetId,
      priceINR: ltp, // MCX data is already in INR
      priceUSD: 0,
      open,
      high,
      low,
      close,
      volume,
      percentChange,
      sourceProvider: 'BROKER',
      interval: 'raw',
      timestamp: new Date(exchangeTimestamp || Date.now()),
    };

    this.onTick(tick);
  }

  // ========== REST FALLBACK ==========

  private async pollREST() {
    if (this.scripTokens.length === 0 || !this.jwtToken) return;

    const now = new Date();

    for (const scrip of this.scripTokens) {
      try {
        const response = await axios.post(
          `${BASE_URL}/rest/secure/angelbroking/market/v1/quote/`,
          {
            mode: 'OHLC',
            exchangeTokens: {
              MCX: [scrip.symboltoken],
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.jwtToken}`,
              'Content-Type': 'application/json',
              'X-UserType': 'USER',
              'X-SourceID': 'WEB',
              'X-ClientLocalIP': '127.0.0.1',
              'X-ClientPublicIP': '127.0.0.1',
              'X-MACAddress': 'AA:BB:CC:DD:EE:FF',
              'Accept': 'application/json',
              'X-PrivateKey': this.config.apiKey,
            },
            timeout: 10000,
          }
        );

        const quoteData = response.data?.data?.fetched?.[0];
        if (!quoteData || !quoteData.ltp) continue;

        const priceINR = parseFloat(quoteData.ltp);
        const open = parseFloat(quoteData.open || quoteData.ltp);
        const high = parseFloat(quoteData.high || quoteData.ltp);
        const low = parseFloat(quoteData.low || quoteData.ltp);
        const close = priceINR;
        const volume = parseInt(quoteData.tradeVolume || '0');

        const prevPrice = this.lastPrices[scrip.assetId] || priceINR;
        const percentChange = prevPrice !== 0 ? ((priceINR - prevPrice) / prevPrice) * 100 : 0;
        this.lastPrices[scrip.assetId] = priceINR;

        const tick: NormalizedTick = {
          assetId: scrip.assetId,
          priceINR,
          priceUSD: 0,
          open,
          high,
          low,
          close,
          volume,
          percentChange,
          sourceProvider: 'BROKER',
          interval: 'raw',
          timestamp: now,
        };

        this.onTick(tick);
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.warn('[AngelOne] Session expired, re-logging in...');
          await this.login().catch(() => {});
          return;
        }
        console.error(`[AngelOne] REST error for ${scrip.assetId}: ${err.message}`);
      }

      await new Promise(r => setTimeout(r, 500));
    }

    if (!this.wsConnected) {
      console.log(`[AngelOne] REST poll: ${this.scripTokens.length} MCX prices at ${now.toLocaleTimeString()}`);
    }
  }
}
