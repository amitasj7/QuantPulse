import axios from 'axios';
import Redis from 'ioredis';

/**
 * Forex Connector (via Twelve Data)
 * 
 * Fetches real USD/INR exchange rate from Twelve Data API.
 * Stores the latest rate in Redis as a global variable for instant access.
 * Also persists to TimescaleDB for historical tracking.
 * 
 * Polls every 30 minutes.
 */

export class ForexConnector {
  private timer: NodeJS.Timeout | null = null;
  private twelveApiKey: string;
  private currentRate: number = 83.5; // fallback default
  private redis: Redis | null = null;

  constructor(
    twelveApiKey: string,
    private onRateUpdate: (rate: number) => void,
    private onForexTick?: (pair: string, rate: number, timestamp: Date) => void,
    redis?: Redis,
  ) {
    this.twelveApiKey = twelveApiKey;
    this.redis = redis || null;
  }

  getRate(): number {
    return this.currentRate;
  }

  start() {
    console.log('[Forex] Starting USD/INR rate polling via Twelve Data (every 30 min)...');
    this.fetchRate();
    // Poll every 30 minutes
    this.timer = setInterval(() => this.fetchRate(), 30 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[Forex] Stopped.');
  }

  private async fetchRate() {
    try {
      const response = await axios.get('https://api.twelvedata.com/price', {
        params: {
          symbol: 'USD/INR',
          apikey: this.twelveApiKey,
        },
        timeout: 10000,
      });

      const priceStr = response.data?.price;
      const inrRate = priceStr ? parseFloat(priceStr) : NaN;

      if (!isNaN(inrRate) && inrRate > 0) {
        this.currentRate = inrRate;
        this.onRateUpdate(inrRate);

        // Store in Redis as global variable for instant access
        if (this.redis) {
          const forexData = {
            pair: 'USD_INR',
            rate: inrRate,
            timestamp: new Date().toISOString(),
            source: 'TwelveData',
          };
          await this.redis.set('forex:USD_INR', JSON.stringify(forexData));
          await this.redis.set('forex:USD_INR:rate', inrRate.toString());
        }

        // Persist to DB for history
        if (this.onForexTick) {
          this.onForexTick('USD_INR', inrRate, new Date());
        }

        console.log(`[Forex] USD/INR = ₹${inrRate.toFixed(2)} (via Twelve Data, stored in Redis)`);
      } else {
        console.warn('[Forex] Could not parse INR rate from Twelve Data response');
      }
    } catch (err: any) {
      console.error(`[Forex] API error: ${err.message}`);
    }
  }
}
