import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

/**
 * TwelveData Connector — "Gold Standard" Edition
 * 
 * Fetches REAL commodity prices from Twelve Data API using proper symbols:
 *   - XAU/USD  → Gold      (USD per troy ounce)
 *   - XAG/USD  → Silver    (USD per troy ounce)
 *   - CL       → Crude Oil (USD per barrel, NYMEX)
 *   - XCU/USD  → Copper    (USD per pound)
 *   - ALI/USD  → Aluminium (Not available directly — we use LME proxy)
 * 
 * Also fetches proxy equities for assets without direct commodity symbols:
 *   - MCX_CEMENT → CX (Cemex proxy)
 *   - MCX_STEEL  → X  (US Steel proxy)
 *   - Solar chain → DQ, JKS, CSIQ, FSLR, ENPH
 *
 * Unit conversions applied to match Indian MCX standards:
 *   - Gold:   XAU/USD per troy oz → INR per 10g
 *   - Silver: XAG/USD per troy oz → INR per kg
 *   - Copper: per pound → INR per kg
 *   - Crude:  per barrel → INR per barrel (same unit)
 * 
 * Free tier: ~800 API credits/day, 8 per minute.
 * Polls every 5 minutes.
 */

// ─── SYMBOL DEFINITIONS ───────────────────────────────────

// Direct commodity symbols from Twelve Data
const COMMODITY_SYMBOLS: Record<string, { 
  tdSymbol: string; 
  unitConversion: number; 
  premium: number;
  description: string;
}> = {
  'MCX_GOLD': {
    tdSymbol: 'XAU/USD',
    // 1 troy oz = 31.1035g → per 10g = multiply by (10 / 31.1035) = 0.32151
    unitConversion: 10 / 31.1035,
    premium: 1.13, // ~13% India premium (customs duty 9% + GST 3% + local 1%)
    description: 'Gold (per 10g)',
  },
  'MCX_SILVER': {
    tdSymbol: 'XAG/USD',
    // 1 troy oz = 31.1035g → per kg = multiply by (1000 / 31.1035) = 32.151
    unitConversion: 1000 / 31.1035,
    premium: 1.10, // ~10% India premium
    description: 'Silver (per kg)',
  },
  'MCX_CRUDEOIL': {
    tdSymbol: 'CL',
    // Already per barrel, MCX crude is also per barrel
    unitConversion: 1,
    premium: 1.0,
    description: 'Crude Oil (per barrel)',
  },
  'MCX_COPPER': {
    tdSymbol: 'XCU/USD',
    // XCU/USD is USD per pound → convert to per kg: 1 lb = 0.453592 kg → ×(1/0.453592) = 2.2046
    unitConversion: 1 / 0.453592,
    premium: 1.0,
    description: 'Copper (per kg)',
  },
  'MCX_ALUMINIUM': {
    tdSymbol: 'ALI/USD',
    // ALI/USD is USD per metric ton → convert to per kg: ×(1/1000)
    unitConversion: 1 / 1000,
    premium: 1.0,
    description: 'Aluminium (per kg)',
  },
};

// Proxy equity symbols for non-commodity assets (no unit conversion needed)
const EQUITY_PROXY_SYMBOLS: Record<string, string> = {
  'MCX_CEMENT': 'CX',         // Cemex as proxy
  'MCX_STEEL': 'X',           // US Steel as proxy
  'POLYSILICON_USD': 'DQ',    // Daqo New Energy
  'SOLAR_WAFER': 'JKS',       // Jinko Solar
  'SOLAR_CELL': 'CSIQ',       // Canadian Solar
  'SOLAR_MODULE_WATT': 'FSLR',// First Solar
  'SOLAR_FINISHED': 'ENPH',   // Enphase Energy
};

export class TwelveDataConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;
  private usdInrRate: number = 83.5; // Default, updated by ForexConnector
  private lastPrices: Record<string, number> = {};

  constructor(
    private onTick: (tick: NormalizedTick) => void,
    apiKey: string,
  ) {
    this.apiKey = apiKey;
  }

  setForexRate(rate: number) {
    this.usdInrRate = rate;
    console.log(`[TwelveData] USD/INR rate updated to ₹${rate.toFixed(2)}`);
  }

  start() {
    console.log('[TwelveData] Starting global spot data polling (every 5 min)...');
    console.log(`[TwelveData] USD/INR rate: ₹${this.usdInrRate}`);
    this.fetchAll();
    this.timer = setInterval(() => this.fetchAll(), 5 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[TwelveData] Stopped.');
  }

  private async fetchAll() {
    await this.fetchCommodities();
    // Small delay between calls to avoid rate limit
    await new Promise(r => setTimeout(r, 2000));
    await this.fetchEquityProxies();
  }

  /**
   * Fetch REAL commodity prices (Gold, Silver, Crude, Copper, Aluminium)
   * These use proper commodity symbols and require unit conversion.
   */
  private async fetchCommodities() {
    const symbols = Object.values(COMMODITY_SYMBOLS).map(c => c.tdSymbol).join(',');

    try {
      const response = await axios.get('https://api.twelvedata.com/price', {
        params: { symbol: symbols, apikey: this.apiKey },
        timeout: 10000,
      });

      const data = response.data;
      if (data?.code === 429 || data?.status === 'error') {
        console.warn(`[TwelveData] API error: ${data.message}`);
        return;
      }

      const now = new Date();

      for (const [assetId, config] of Object.entries(COMMODITY_SYMBOLS)) {
        // When requesting multiple symbols, response is keyed by symbol
        // When requesting a single symbol, response is the price directly
        const priceData = data[config.tdSymbol] || data;
        const rawPriceUSD = priceData?.price ? parseFloat(priceData.price) : null;

        if (rawPriceUSD === null || isNaN(rawPriceUSD) || rawPriceUSD <= 0) {
          console.warn(`[TwelveData] No price for ${config.tdSymbol} (${config.description})`);
          continue;
        }

        // Step 1: Convert to MCX unit (e.g., per troy oz → per 10g)
        const priceUSD_mcxUnit = rawPriceUSD * config.unitConversion;

        // Step 2: Convert USD → INR
        const priceINR_base = priceUSD_mcxUnit * this.usdInrRate;

        // Step 3: Apply India premium (customs + GST + local)
        const priceINR = priceINR_base * config.premium;

        // Calculate % change from last tick
        const prevPrice = this.lastPrices[assetId] || priceINR;
        const percentChange = prevPrice !== 0
          ? ((priceINR - prevPrice) / prevPrice) * 100
          : 0;
        this.lastPrices[assetId] = priceINR;

        const tick: NormalizedTick = {
          assetId,
          priceINR,
          priceUSD: priceUSD_mcxUnit,
          open: priceINR,
          high: priceINR,
          low: priceINR,
          close: priceINR,
          volume: 0,
          percentChange,
          sourceProvider: 'GLOBAL_API',
          interval: 'raw',
          timestamp: now,
        };

        this.onTick(tick);
        console.log(`  ✓ ${assetId}: $${rawPriceUSD.toFixed(2)} → ₹${priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${config.description}`);
      }
    } catch (err: any) {
      console.error(`[TwelveData] Commodity fetch error: ${err.message}`);
    }
  }

  /**
   * Fetch proxy equity prices for non-commodity assets (Cement, Steel, Solar)
   * These are USD stock prices × USD/INR rate, no unit conversion.
   */
  private async fetchEquityProxies() {
    const symbols = Object.values(EQUITY_PROXY_SYMBOLS).join(',');

    try {
      const response = await axios.get('https://api.twelvedata.com/price', {
        params: { symbol: symbols, apikey: this.apiKey },
        timeout: 10000,
      });

      const data = response.data;
      if (data?.code === 429 || data?.status === 'error') {
        console.warn(`[TwelveData] API error (equities): ${data.message}`);
        return;
      }

      const now = new Date();

      for (const [assetId, tdSymbol] of Object.entries(EQUITY_PROXY_SYMBOLS)) {
        const priceData = data[tdSymbol] || data;
        const priceUSD = priceData?.price ? parseFloat(priceData.price) : null;

        if (priceUSD === null || isNaN(priceUSD) || priceUSD <= 0) {
          continue;
        }

        const priceINR = priceUSD * this.usdInrRate;

        const prevPrice = this.lastPrices[assetId] || priceINR;
        const percentChange = prevPrice !== 0
          ? ((priceINR - prevPrice) / prevPrice) * 100
          : 0;
        this.lastPrices[assetId] = priceINR;

        const tick: NormalizedTick = {
          assetId,
          priceINR,
          priceUSD,
          open: priceINR,
          high: priceINR,
          low: priceINR,
          close: priceINR,
          volume: 0,
          percentChange,
          sourceProvider: 'GLOBAL_API',
          interval: 'raw',
          timestamp: now,
        };

        this.onTick(tick);
      }
    } catch (err: any) {
      console.error(`[TwelveData] Equity proxy fetch error: ${err.message}`);
    }
  }
}
