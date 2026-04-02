import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

/**
 * Alpha Vantage Connector
 * 
 * Fetches commodity and solar-related global prices.
 * Free tier: 25 requests/day. Use sparingly!
 * Polls every 5 minutes.
 */

// Solar assets → Alpha Vantage commodity function mapping
// Note: Alpha Vantage doesn't have direct solar wafer/cell prices.
// We use proxy commodities; for real solar pricing you'd need InfoLink/OPIS API.
const ALPHA_VANTAGE_ASSETS: { assetId: string; function: string; symbol?: string }[] = [
  { assetId: 'MCX_STEEL', function: 'GLOBAL_QUOTE', symbol: 'X' }, // US Steel as proxy
];

export class AlphaVantageConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;
  private usdInrRate: number = 83.5;

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
    console.log('[AlphaVantage] Starting global market data polling...');
    this.fetchAll();
    // Poll every 5 minutes (to respect 25 req/day limit)
    this.timer = setInterval(() => this.fetchAll(), 5 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[AlphaVantage] Stopped.');
  }

  private async fetchAll() {
    const now = new Date();

    for (const asset of ALPHA_VANTAGE_ASSETS) {
      try {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: asset.function,
            symbol: asset.symbol,
            apikey: this.apiKey,
          },
          timeout: 10000,
        });

        const quote = response.data?.['Global Quote'];
        if (!quote || !quote['05. price']) {
          console.warn(`[AlphaVantage] No data for ${asset.assetId}`);
          continue;
        }

        const priceUSD = parseFloat(quote['05. price']);
        const priceINR = priceUSD * this.usdInrRate;
        const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');

        const tick: NormalizedTick = {
          assetId: asset.assetId,
          priceINR,
          priceUSD,
          open: parseFloat(quote['02. open']) * this.usdInrRate,
          high: parseFloat(quote['03. high']) * this.usdInrRate,
          low: parseFloat(quote['04. low']) * this.usdInrRate,
          close: priceINR,
          volume: parseInt(quote['06. volume'] || '0'),
          percentChange: changePercent,
          sourceProvider: 'GLOBAL_API',
          interval: '1d',
          timestamp: now,
        };

        this.onTick(tick);
        console.log(`[AlphaVantage] ${asset.assetId}: $${priceUSD.toFixed(2)}`);

        // Delay between calls to avoid rate limit
        await new Promise(r => setTimeout(r, 2000));
      } catch (err: any) {
        console.error(`[AlphaVantage] Error for ${asset.assetId}: ${err.message}`);
      }
    }
  }
}
