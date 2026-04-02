import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

/**
 * TwelveData Connector
 * 
 * Fetches real MCX commodity prices from Twelve Data API.
 * Free tier: ~800 requests/day, 8 per minute.
 * Polls every 60 seconds to stay within limits.
 */

// MCX asset ID → Twelve Data symbol mapping
const MCX_SYMBOL_MAP: Record<string, string> = {
  'MCX_GOLD': 'XAU/USD',
  'MCX_SILVER': 'XAG/USD', 
  'MCX_CRUDEOIL': 'CL',
  'MCX_ALUMINIUM': 'ALI/USD',
  'MCX_COPPER': 'HG',
};

/**
 * Unit conversion factors:
 * Twelve Data returns international prices in specific units.
 * We need to convert to Indian MCX-standard units.
 *
 * XAU/USD = USD per 1 troy ounce (31.1035g) → MCX Gold = INR per 10g
 *   Factor: (1 / 31.1035) * 10 = 0.32151 (convert per-oz to per-10g)
 *
 * XAG/USD = USD per 1 troy ounce (31.1035g) → MCX Silver = INR per Kg
 *   Factor: (1 / 31.1035) * 1000 = 32.151 (convert per-oz to per-kg)
 *
 * CL = USD per barrel → MCX Crude = INR per barrel (same unit, no conversion)
 *   Factor: 1
 *
 * ALI/USD = USD per metric ton → MCX Aluminium = INR per Kg
 *   Factor: 1 / 1000 = 0.001 (convert per-ton to per-kg)
 *
 * HG = USD cents per pound → MCX Copper = INR per Kg
 *   Factor: (1/100) * (1/0.453592) = 0.02205 (cents→dollar, lb→kg)
 */
const UNIT_CONVERSION: Record<string, number> = {
  'MCX_GOLD':      (1 / 31.1035) * 10,     // per troy oz → per 10g
  'MCX_SILVER':    (1 / 31.1035) * 1000,    // per troy oz → per kg
  'MCX_CRUDEOIL':  1,                        // per barrel → per barrel
  'MCX_ALUMINIUM': 1 / 1000,                // per metric ton → per kg
  'MCX_COPPER':    (1 / 100) * (1 / 0.453592), // cents/lb → USD/kg
};

// Indian import duty + GST premium (~12-15% for gold, ~10% for silver)
// This accounts for customs duty, GST, and local premium
const INDIA_PREMIUM: Record<string, number> = {
  'MCX_GOLD':      1.13,  // ~13% (9% customs + 3% GST + 1% premium)
  'MCX_SILVER':    1.10,  // ~10% 
  'MCX_CRUDEOIL':  1.0,   // No premium, international price
  'MCX_ALUMINIUM': 1.0,
  'MCX_COPPER':    1.0,
};

export class TwelveDataConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;
  private usdInrRate: number = 83.5; // Default, will be updated by ForexConnector
  private lastPrices: Record<string, number> = {}; // Track for % change

  constructor(
    private onTick: (tick: NormalizedTick) => void,
    apiKey: string,
  ) {
    this.apiKey = apiKey;
  }

  setForexRate(rate: number) {
    this.usdInrRate = rate;
  }

  start() {
    console.log('[TwelveData] Starting real market data polling...');
    this.fetchAll();
    this.timer = setInterval(() => this.fetchAll(), 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[TwelveData] Stopped.');
  }

  private async fetchAll() {
    const symbols = Object.values(MCX_SYMBOL_MAP).join(',');

    try {
      const response = await axios.get('https://api.twelvedata.com/price', {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const data = response.data;
      const now = new Date();

      for (const [assetId, tdSymbol] of Object.entries(MCX_SYMBOL_MAP)) {
        const priceData = data[tdSymbol] || data;
        
        const rawPrice = priceData?.price ? parseFloat(priceData.price) : null;
        
        if (rawPrice === null || isNaN(rawPrice)) {
          console.warn(`[TwelveData] No price data for ${tdSymbol}`);
          continue;
        }

        // Apply unit conversion + INR conversion + India premium
        const unitFactor = UNIT_CONVERSION[assetId] || 1;
        const premium = INDIA_PREMIUM[assetId] || 1;
        
        const priceUSD = rawPrice * unitFactor;                      // Convert to MCX unit in USD
        const priceINR = priceUSD * this.usdInrRate * premium;       // Convert to INR + duty

        // Calculate % change from previous tick
        const prevPrice = this.lastPrices[assetId] || priceINR;
        const percentChange = prevPrice !== 0 ? ((priceINR - prevPrice) / prevPrice) * 100 : 0;
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

      console.log(`[TwelveData] Fetched ${Object.keys(MCX_SYMBOL_MAP).length} prices at ${now.toLocaleTimeString()}`);
    } catch (err: any) {
      console.error(`[TwelveData] API error: ${err.message}`);
    }
  }
}
