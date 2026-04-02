import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

/**
 * Angel One SmartAPI Connector
 * 
 * Fetches real-time MCX commodity data from Angel One broker API.
 * Uses TOTP-based auto-login for session management.
 * 
 * Requires: otplib (npm install otplib)
 * 
 * Flow:
 *   1. Generate TOTP from secret
 *   2. Login to get JWT token + feed token
 *   3. Fetch MCX scrip tokens from master file
 *   4. Poll LTP every 30 seconds using Market Data API
 *   5. Auto-refresh session daily
 */

// Angel One API base URL
const BASE_URL = 'https://apiconnect.angelone.in';

// MCX commodity asset mapping (will be populated from scrip master)
interface ScripToken {
  symboltoken: string;
  tradingsymbol: string;
  name: string;
  exchange: string;
  assetId: string; // Our internal ID
}

// Map our assetIds to Angel One MCX trading symbol search terms
const MCX_SCRIP_SEARCH: Record<string, string[]> = {
  'MCX_GOLD':      ['GOLD', 'GOLDM'],
  'MCX_SILVER':    ['SILVER', 'SILVERM'],
  'MCX_CRUDEOIL':  ['CRUDEOIL', 'CRUDEOILM'],
  'MCX_ALUMINIUM': ['ALUMINIUM', 'ALUMINI'],
  'MCX_COPPER':    ['COPPER'],
  'MCX_STEEL':     ['STEELLONG'],
};

export class AngelOneConnector {
  private timer: NodeJS.Timeout | null = null;
  private sessionRefreshTimer: NodeJS.Timeout | null = null;
  private jwtToken: string = '';
  private feedToken: string = '';
  private scripTokens: ScripToken[] = [];
  private lastPrices: Record<string, number> = {};

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
      // Step 1: Login
      await this.login();
      
      // Step 2: Load MCX scrip tokens
      await this.loadScripMaster();

      // Step 3: Start polling LTP
      this.poll();
      this.timer = setInterval(() => this.poll(), 30_000); // Every 30 seconds

      // Step 4: Auto-refresh session every 6 hours
      this.sessionRefreshTimer = setInterval(() => {
        console.log('[AngelOne] Refreshing session...');
        this.login().catch(e => console.error('[AngelOne] Session refresh failed:', e.message));
      }, 6 * 60 * 60_000);

      console.log(`[AngelOne] Active with ${this.scripTokens.length} MCX symbols.`);
    } catch (err: any) {
      console.error(`[AngelOne] Failed to start: ${err.message}`);
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.sessionRefreshTimer) clearInterval(this.sessionRefreshTimer);
    console.log('[AngelOne] Stopped.');
  }

  /**
   * Login using TOTP-based authentication
   */
  private async login() {
    // Generate TOTP code
    let totpCode: string;
    try {
      // Dynamic import for otplib (ESM/CJS compatibility)
      const { authenticator } = await import('otplib');
      totpCode = authenticator.generate(this.config.totpSecret);
    } catch (e) {
      throw new Error('Failed to generate TOTP. Ensure "otplib" is installed: npm install otplib');
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
    console.log(`[AngelOne] Login successful. Token acquired.`);
  }

  /**
   * Download the OpenAPI Scrip Master to find MCX symbol tokens
   */
  private async loadScripMaster() {
    console.log('[AngelOne] Loading MCX scrip master...');

    const response = await axios.get(
      'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
      { timeout: 30000 }
    );

    const allScrips: any[] = response.data;

    // Filter MCX scrips that match our commodities
    this.scripTokens = [];

    for (const [assetId, searchTerms] of Object.entries(MCX_SCRIP_SEARCH)) {
      // Find the nearest-month futures contract for each commodity
      const mcxMatches = allScrips
        .filter((s: any) =>
          s.exch_seg === 'MCX' &&
          searchTerms.some(term => s.symbol?.startsWith(term)) &&
          s.instrumenttype === 'FUTCOM'
        )
        .sort((a: any, b: any) => {
          // Sort by expiry to get nearest month
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
        });

      if (mcxMatches.length > 0) {
        const nearestFuture = mcxMatches[0];
        this.scripTokens.push({
          symboltoken: nearestFuture.token,
          tradingsymbol: nearestFuture.symbol,
          name: nearestFuture.name,
          exchange: 'MCX',
          assetId,
        });
        console.log(`  → ${assetId}: ${nearestFuture.symbol} (token: ${nearestFuture.token})`);
      } else {
        console.warn(`  ⚠ ${assetId}: No MCX futures contract found`);
      }
    }
  }

  /**
   * Poll LTP for all tracked MCX symbols
   */
  private async poll() {
    if (this.scripTokens.length === 0 || !this.jwtToken) return;

    const now = new Date();

    for (const scrip of this.scripTokens) {
      try {
        const response = await axios.post(
          `${BASE_URL}/rest/secure/angelbroking/market/v1/quote/`,
          {
            mode: 'LTP',
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
        if (!quoteData || !quoteData.ltp) {
          continue;
        }

        const priceINR = parseFloat(quoteData.ltp);
        const prevPrice = this.lastPrices[scrip.assetId] || priceINR;
        const percentChange = prevPrice !== 0 ? ((priceINR - prevPrice) / prevPrice) * 100 : 0;
        this.lastPrices[scrip.assetId] = priceINR;

        const tick: NormalizedTick = {
          assetId: scrip.assetId,
          priceINR,
          priceUSD: 0, // MCX data is already in INR
          open: priceINR,
          high: priceINR,
          low: priceINR,
          close: priceINR,
          volume: 0,
          percentChange,
          sourceProvider: 'BROKER',
          interval: 'raw',
          timestamp: now,
        };

        this.onTick(tick);
      } catch (err: any) {
        // Session expired — try re-login
        if (err.response?.status === 401) {
          console.warn('[AngelOne] Session expired, re-logging in...');
          await this.login().catch(() => {});
          return;
        }
        console.error(`[AngelOne] LTP fetch error for ${scrip.assetId}: ${err.message}`);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`[AngelOne] Fetched ${this.scripTokens.length} MCX prices at ${now.toLocaleTimeString()}`);
  }
}
