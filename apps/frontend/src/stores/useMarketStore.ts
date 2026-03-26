import { create } from 'zustand';
import { NormalizedTick } from '@quantpulse/shared';
import { getCommodities, getSolarMetrics, getPriceHistory } from '../lib/api';

interface Commodity {
  id: string;
  assetId: string;
  name: string;
  category: string;
  prices?: NormalizedTick[];
}

interface MarketState {
  commodities: Record<string, Commodity>;
  solarAssets: Record<string, Commodity>;
  historicalData: Record<string, NormalizedTick[]>;
  liveTicks: Record<string, NormalizedTick>;
  loading: boolean;
  selectedAssetId: string;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  fetchHistory: (assetId: string) => Promise<void>;
  updateLiveTick: (tick: NormalizedTick) => void;
  setSelectedAssetId: (assetId: string) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  commodities: {},
  solarAssets: {},
  historicalData: {},
  liveTicks: {},
  loading: false,
  selectedAssetId: 'MCX_GOLD',

  fetchInitialData: async () => {
    set({ loading: true });
    try {
      const [comms, solar] = await Promise.all([
        getCommodities(),
        getSolarMetrics()
      ]);

      const commMap: Record<string, Commodity> = {};
      const solarMap: Record<string, Commodity> = {};
      const liveTicksMap: Record<string, NormalizedTick> = { ...get().liveTicks };

      comms.forEach((c: any) => {
        commMap[c.assetId] = c;
        if (c.prices && c.prices.length > 0) {
          if (!liveTicksMap[c.assetId]) {
             liveTicksMap[c.assetId] = c.prices[0];
          }
        }
      });

      solar.forEach((s: any) => {
        solarMap[s.assetId] = s;
        if (s.prices && s.prices.length > 0) {
          if (!liveTicksMap[s.assetId]) {
            liveTicksMap[s.assetId] = s.prices[0];
          }
        }
      });

      set({ 
        commodities: commMap, 
        solarAssets: solarMap,
        liveTicks: liveTicksMap,
        loading: false 
      });
    } catch (e) {
      console.error('Failed to fetch initial market data', e);
      set({ loading: false });
    }
  },

  fetchHistory: async (assetId: string) => {
    try {
      const history = await getPriceHistory(assetId, 100);
      set((state) => ({
        historicalData: {
          ...state.historicalData,
          [assetId]: history,
        }
      }));
    } catch (e) {
      console.error('Failed to fetch historical data', e);
    }
  },

  updateLiveTick: (tick: NormalizedTick) => {
    set((state) => {
      const currentHistory = state.historicalData[tick.assetId] || [];
      
      // Prevent duplicate rendering if timestamp is identical
      const lastCandle = currentHistory[currentHistory.length - 1];
      let newHistory = [...currentHistory];
      
      if (lastCandle && new Date(lastCandle.timestamp).getTime() === new Date(tick.timestamp).getTime()) {
        newHistory[newHistory.length - 1] = tick;
      } else {
        newHistory.push(tick);
      }

      return {
        liveTicks: {
          ...state.liveTicks,
          [tick.assetId]: tick,
        },
        historicalData: {
          ...state.historicalData,
          [tick.assetId]: newHistory,
        }
      };
    });
  },

  setSelectedAssetId: (assetId: string) => {
    set({ selectedAssetId: assetId });
    get().fetchHistory(assetId);
  }
}));
