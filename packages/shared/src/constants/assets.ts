/**
 * Asset Constants
 * 
 * All tracked commodities and solar assets.
 * From Men.md + Implementation_details.json
 */

// MCX Commodity Assets
export const MCX_ASSETS = {
  ALUMINIUM: { id: 'MCX_ALUMINIUM', name: 'Aluminium', unit: 'INR/Kg', exchange: 'MCX' },
  SILVER: { id: 'MCX_SILVER', name: 'Silver', unit: 'INR/Kg', exchange: 'MCX' },
  GOLD: { id: 'MCX_GOLD', name: 'Gold', unit: 'INR/10g', exchange: 'MCX' },
  STEEL: { id: 'MCX_STEEL', name: 'Steel', unit: 'INR/Kg', exchange: 'MCX' },
  COPPER: { id: 'MCX_COPPER', name: 'Copper', unit: 'INR/Kg', exchange: 'MCX' },
  CEMENT: { id: 'MCX_CEMENT', name: 'Cement', unit: 'INR/Bag', exchange: 'MCX' },
  CRUDE_OIL: { id: 'MCX_CRUDEOIL', name: 'Crude Oil', unit: 'INR/Barrel', exchange: 'MCX' },
} as const;

// Solar Industry Assets
export const SOLAR_ASSETS = {
  POLYSILICON: { id: 'POLYSILICON_USD', name: 'Polysilicon', unit: 'USD/Kg' },
  WAFER: { id: 'SOLAR_WAFER', name: 'Wafer (Mono N-Type CZ)', unit: 'USD/Piece' },
  CELL: { id: 'SOLAR_CELL', name: 'Solar Cell', unit: 'USD/Watt' },
  MODULE: { id: 'SOLAR_MODULE_WATT', name: 'Solar Module', unit: 'USD/Watt' },
  FINISHED_PRODUCT: { id: 'SOLAR_FINISHED', name: 'Finished Product', unit: 'USD/Watt' },
} as const;

// Forex
export const FOREX_ASSETS = {
  USD_INR: { id: 'USD_INR_FOREX', name: 'USD/INR', unit: 'INR' },
} as const;

// All tracked asset IDs
export const ALL_ASSET_IDS = [
  ...Object.values(MCX_ASSETS).map((a) => a.id),
  ...Object.values(SOLAR_ASSETS).map((a) => a.id),
  ...Object.values(FOREX_ASSETS).map((a) => a.id),
] as const;
