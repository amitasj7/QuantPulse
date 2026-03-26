/**
 * Data Normalizer
 * 
 * Adapter/Facade pattern to normalize data from different sources:
 * - MCX data: INR/Kg
 * - Global Solar data: USD/Watt
 * 
 * Converts all ticks to a unified schema.
 */

import { NormalizedTick } from '@quantpulse/shared';

export class DataNormalizer {
  private usdInrRate = 83.5; // Default, updated periodically

  setForexRate(rate: number): void {
    this.usdInrRate = rate;
  }

  normalizeBrokerTick(raw: {
    symbol: string;
    price: number;
    timestamp: Date;
  }): NormalizedTick {
    return {
      assetId: raw.symbol,
      timestamp: raw.timestamp.toISOString(),
      currentPriceINR: raw.price,
      currentPriceUSD: raw.price / this.usdInrRate,
      percentageChange24h: 0, // TODO: Calculate from historical data
      sourceProvider: 'BROKER',
    };
  }

  normalizeGlobalTick(raw: {
    symbol: string;
    priceUSD: number;
    timestamp: Date;
  }): NormalizedTick {
    return {
      assetId: raw.symbol,
      timestamp: raw.timestamp.toISOString(),
      currentPriceINR: raw.priceUSD * this.usdInrRate,
      currentPriceUSD: raw.priceUSD,
      percentageChange24h: 0,
      sourceProvider: 'GLOBAL_API',
    };
  }
}
