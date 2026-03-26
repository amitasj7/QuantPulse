import { NormalizedTick } from '@quantpulse/shared';

// Base prices to simulate around
const SOLAR_ASSETS = [
  { id: 'POLYSILICON_USD', baseScore: 8.45 },
  { id: 'SOLAR_WAFER', baseScore: 0.025 },
  { id: 'SOLAR_CELL', baseScore: 0.050 },
  { id: 'SOLAR_MODULE_WATT', baseScore: 0.120 },
  { id: 'SOLAR_FINISHED', baseScore: 0.250 },
];

export class SolarConnector {
  private timer: NodeJS.Timeout | null = null;
  private currentPrices: Record<string, number> = {};

  constructor(private onTick: (tick: NormalizedTick) => void) {
    SOLAR_ASSETS.forEach(a => {
      this.currentPrices[a.id] = a.baseScore;
    });
  }

  start() {
    console.log('[SolarConnector] Starting polling for Global Solar APIs...');
    // Solar data updates less frequently (simulate every 10 secs)
    this.timer = setInterval(() => this.pollEndpoints(), 10000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    console.log('[SolarConnector] Stopped.');
  }

  private pollEndpoints() {
    const now = new Date();
    
    for (const asset of SOLAR_ASSETS) {
      const current = this.currentPrices[asset.id];
      // Slow drift
      const changePercent = (Math.random() - 0.5) * 0.0002; 
      const newPrice = current * (1 + changePercent);
      
      this.currentPrices[asset.id] = newPrice;

      const tick: NormalizedTick = {
        assetId: asset.id,
        priceINR: newPrice * 83.5,
        priceUSD: newPrice,
        open: current,
        high: Math.max(current, newPrice),
        low: Math.min(current, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 5000),
        percentChange: changePercent * 100,
        sourceProvider: 'GLOBAL_API',
        interval: 'raw',
        timestamp: now,
      };

      this.onTick(tick);
    }
  }
}
