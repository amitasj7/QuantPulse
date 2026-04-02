import axios from 'axios';

/**
 * Forex Connector
 * 
 * Fetches the real USD/INR exchange rate from ExchangeRate-API.
 * Free tier: 1,500 requests/month.
 * Polls every 30 minutes.
 */

export class ForexConnector {
  private timer: NodeJS.Timeout | null = null;
  private apiKey: string;
  private currentRate: number = 83.5; // fallback default

  constructor(
    apiKey: string,
    private onRateUpdate: (rate: number) => void,
    private onForexTick?: (pair: string, rate: number, timestamp: Date) => void,
  ) {
    this.apiKey = apiKey;
  }

  getRate(): number {
    return this.currentRate;
  }

  start() {
    console.log('[ForexConnector] Starting USD/INR rate polling...');
    this.fetchRate();
    // Poll every 30 minutes
    this.timer = setInterval(() => this.fetchRate(), 30 * 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[ForexConnector] Stopped.');
  }

  private async fetchRate() {
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/USD`,
        { timeout: 10000 }
      );

      const inrRate = response.data?.conversion_rates?.INR;

      if (inrRate && !isNaN(inrRate)) {
        this.currentRate = inrRate;
        this.onRateUpdate(inrRate);
        
        // Also persist forex rate if callback provided
        if (this.onForexTick) {
          this.onForexTick('USD_INR', inrRate, new Date());
        }

        console.log(`[ForexConnector] USD/INR = ₹${inrRate.toFixed(2)}`);
      } else {
        console.warn('[ForexConnector] Could not parse INR rate from response');
      }
    } catch (err: any) {
      console.error(`[ForexConnector] API error: ${err.message}`);
    }
  }
}
