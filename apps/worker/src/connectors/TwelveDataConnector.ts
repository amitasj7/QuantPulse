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

export class TwelveDataConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;
  private usdInrRate: number = 83.5; // Default, will be updated by ForexConnector

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
    // Poll immediately, then every 60 seconds
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
        
        // Single symbol returns { price: "..." }, multiple returns { "SYM": { price: "..." } }
        const rawPrice = priceData?.price ? parseFloat(priceData.price) : null;
        
        if (rawPrice === null || isNaN(rawPrice)) {
          console.warn(`[TwelveData] No price data for ${tdSymbol}`);
          continue;
        }

        const priceUSD = rawPrice;
        const priceINR = priceUSD * this.usdInrRate;

        const tick: NormalizedTick = {
          assetId,
          priceINR,
          priceUSD,
          open: priceINR,
          high: priceINR,
          low: priceINR,
          close: priceINR,
          volume: 0,
          percentChange: 0,
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
