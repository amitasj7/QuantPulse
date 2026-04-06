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
      timestamp: raw.timestamp,
      priceINR: raw.price,
      priceUSD: raw.price / this.usdInrRate,
      percentChange: 0, // TODO: Calculate from historical data
      open: raw.price,   // Fallback to current price if open not available
      high: raw.price,
      low: raw.price,
      close: raw.price,
      volume: 0,
      interval: '1m',    // Default interval for live ticks
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
      timestamp: raw.timestamp,
      priceINR: raw.priceUSD * this.usdInrRate,
      priceUSD: raw.priceUSD,
      percentChange: 0,
      open: raw.priceUSD * this.usdInrRate, 
      high: raw.priceUSD * this.usdInrRate,
      low: raw.priceUSD * this.usdInrRate,
      close: raw.priceUSD * this.usdInrRate,
      volume: 0,
      interval: '1m',
      sourceProvider: 'GLOBAL_API',
    };
  }
}
