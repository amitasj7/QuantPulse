import { NormalizedTick } from '@quantpulse/shared';

// Base prices to simulate around
const MCX_ASSETS = [
  { id: 'MCX_GOLD', baseScore: 62450 },
  { id: 'MCX_SILVER', baseScore: 74200 },
  { id: 'MCX_CRUDEOIL', baseScore: 6305 },
  { id: 'MCX_ALUMINIUM', baseScore: 202.40 },
  { id: 'MCX_COPPER', baseScore: 720.15 },
  { id: 'MCX_STEEL', baseScore: 45000 },
];

export class MCXConnector {
  private timer: NodeJS.Timeout | null = null;
  private currentPrices: Record<string, number> = {};

  constructor(private onTick: (tick: NormalizedTick) => void) {
    MCX_ASSETS.forEach(a => {
      this.currentPrices[a.id] = a.baseScore;
    });
  }

  start() {
    console.log('[MCXConnector] Starting live connection simulator...');
    // Simulate high frequency tick every 2 seconds
    this.timer = setInterval(() => this.generateTicks(), 2000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    console.log('[MCXConnector] Stopped.');
  }

  private generateTicks() {
    const now = new Date();
    // Randomly update 2 to 4 assets per tick to simulate real uneven market activity
    const numToUpdate = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...MCX_ASSETS].sort(() => 0.5 - Math.random()).slice(0, numToUpdate);

    for (const asset of shuffled) {
      const current = this.currentPrices[asset.id];
      // Random walk: +- 0.05% change
      const changePercent = (Math.random() - 0.5) * 0.001; 
      const newPrice = current * (1 + changePercent);
      
      this.currentPrices[asset.id] = newPrice;

      // Ensure open/high/low/close context is somewhat realistic for a 1-minute mock
      const tick: NormalizedTick = {
        assetId: asset.id,
        priceINR: newPrice,
        priceUSD: newPrice / 83.5, // Fake USD conversion
        open: current,
        high: Math.max(current, newPrice),
        low: Math.min(current, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 50) + 1,
        percentChange: changePercent * 100,
        sourceProvider: 'BROKER',
        interval: 'raw',
        timestamp: now,
      };

      this.onTick(tick);
    }
  }
}
