/**
 * Solar Industry Types
 */

export interface SolarPrice {
  assetId: string;
  name: string;
  pricePerUnit: number;
  unit: string;       // e.g., 'USD/Watt', 'USD/Kg'
  currency: 'USD' | 'INR';
  percentageChange: number;
  timestamp: string;
}

export interface SolarSupplyChain {
  polysilicon: SolarPrice;
  wafer: SolarPrice;
  cell: SolarPrice;
  module: SolarPrice;
}

export type SolarAssetType = 'POLYSILICON' | 'WAFER' | 'CELL' | 'MODULE' | 'FINISHED_PRODUCT';
