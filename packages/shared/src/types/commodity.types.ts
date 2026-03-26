/**
 * Commodity Types
 */

export interface Commodity {
  id: string;
  name: string;
  symbol: string;
  category: CommodityCategory;
  unit: string;
  exchange: string;
}

export type CommodityCategory = 'METAL' | 'ENERGY' | 'INDUSTRIAL' | 'SOLAR';

export interface CommodityPrice {
  commodityId: string;
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  percentageChange: number;
  volume: number;
  timestamp: string;
}

export interface OHLCCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export type CandleInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
