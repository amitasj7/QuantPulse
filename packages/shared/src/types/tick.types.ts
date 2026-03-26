/**
 * Normalized Tick Schema
 * 
 * From Implementation_details.json → Problem #2 (Data Normalization)
 * All incoming ticks (MCX + Global) are converted to this format.
 */

export interface NormalizedTick {
  assetId: string;
  timestamp: string;          // ISO8601
  currentPriceINR: number;
  currentPriceUSD: number;
  percentageChange24h: number;
  sourceProvider: SourceProvider;
}

export type SourceProvider = 'BROKER' | 'GLOBAL_API';
