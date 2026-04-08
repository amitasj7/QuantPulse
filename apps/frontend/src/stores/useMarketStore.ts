import { create } from 'zustand';
import { NormalizedTick } from '@quantpulse/shared';
import { 
  getCommodities, 
  getSolarMetrics, 
  getPriceHistory, 
  getNews, 
  getLatestForexRate,
  NewsItem,
  ForexRateItem,
} from '../lib/api';

interface Commodity {
  id: string;
  assetId: string;
  name: string;
  symbol: string;
  category: string;
  unit: string;
  exchange: string;
  prices?: NormalizedTick[];
}

interface MarketState {
  commodities: Record<string, Commodity>;
  solarAssets: Record<string, Commodity>;
  historicalData: Record<string, NormalizedTick[]>;
  liveTicks: Record<string, NormalizedTick>;
  news: NewsItem[];
  forexRate: ForexRateItem | null;
  loading: boolean;
  selectedAssetId: string;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  refreshPrices: () => Promise<void>;
  fetchHistory: (assetId: string, interval?: string) => Promise<void>;
  fetchNews: (commodityId?: string) => Promise<void>;
  fetchForexRate: () => Promise<void>;
  updateLiveTick: (tick: NormalizedTick) => void;
  setSelectedAssetId: (assetId: string) => void;
  addCommodity: (commodity: Commodity) => void;
  removeCommodity: (assetId: string) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  commodities: {},
  solarAssets: {},
  historicalData: {},
  liveTicks: {},
  news: [],
  forexRate: null,
  loading: false,
  selectedAssetId: 'MCX_GOLD',

  fetchInitialData: async () => {
    set({ loading: true });
    try {
      const [comms, solar] = await Promise.all([
        getCommodities(),
        getSolarMetrics(),
      ]);

      const commMap: Record<string, Commodity> = {};
      const solarMap: Record<string, Commodity> = {};
      const liveTicksMap: Record<string, NormalizedTick> = { ...get().liveTicks };

      // Helper: map a DB PriceHistory row into a valid NormalizedTick
      const toTick = (assetId: string, row: any): NormalizedTick => {
        const priceINR = Number(row.priceINR) || 0;
        const priceUSD = Number(row.priceUSD) || 0;
        return {
          assetId,
          priceINR,
          priceUSD,
          open: Number(row.open) || priceINR,
          high: Number(row.high) || priceINR,
          low: Number(row.low) || priceINR,
          close: Number(row.close) || priceINR,
          volume: Number(row.volume) || 0,
          percentChange: Number(row.percentChange) || 0,
          sourceProvider: (row.sourceProvider as 'BROKER' | 'GLOBAL_API') || 'BROKER',
          interval: row.interval || 'raw',
          timestamp: new Date(row.timestamp),
        };
      };

      comms.forEach((c: any) => {
        commMap[c.assetId] = c;
        // Always seed liveTick from latest DB price row (overwritten by WS later)
        if (c.prices && c.prices.length > 0) {
          liveTicksMap[c.assetId] = toTick(c.assetId, c.prices[0]);
        }
      });

      solar.forEach((s: any) => {
        solarMap[s.assetId] = s;
        if (s.prices && s.prices.length > 0) {
          if (!liveTicksMap[s.assetId]) {
            liveTicksMap[s.assetId] = toTick(s.assetId, s.prices[0]);
          }
        }
      });

      set({ 
        commodities: commMap, 
        solarAssets: solarMap,
        liveTicks: liveTicksMap,
        loading: false 
      });

      // Also fetch news and forex in background
      get().fetchNews(get().selectedAssetId);
      get().fetchForexRate();
      get().fetchHistory(get().selectedAssetId);
    } catch (e) {
      console.error('Failed to fetch initial market data', e);
      set({ loading: false });
    }
  },

  refreshPrices: async () => {
    try {
      const [comms, solar] = await Promise.all([
        getCommodities(),
        getSolarMetrics(),
      ]);

      const toTick = (assetId: string, row: any): NormalizedTick => {
        const priceINR = Number(row.priceINR) || 0;
        const priceUSD = Number(row.priceUSD) || 0;
        return {
          assetId,
          priceINR,
          priceUSD,
          open: Number(row.open) || priceINR,
          high: Number(row.high) || priceINR,
          low: Number(row.low) || priceINR,
          close: Number(row.close) || priceINR,
          volume: Number(row.volume) || 0,
          percentChange: Number(row.percentChange) || 0,
          sourceProvider: (row.sourceProvider as 'BROKER' | 'GLOBAL_API') || 'BROKER',
          interval: row.interval || 'raw',
          timestamp: new Date(row.timestamp),
        };
      };

      set((state) => {
        const liveTicksMap = { ...state.liveTicks };
        // Update ticks from DB only if no more recent WS tick exists
        comms.forEach((c: any) => {
          if (c.prices && c.prices.length > 0) {
            const dbTick = toTick(c.assetId, c.prices[0]);
            const existing = liveTicksMap[c.assetId];
            if (!existing || new Date(dbTick.timestamp) >= new Date(existing.timestamp)) {
              liveTicksMap[c.assetId] = dbTick;
            }
          }
        });
        solar.forEach((s: any) => {
          if (s.prices && s.prices.length > 0) {
            const dbTick = toTick(s.assetId, s.prices[0]);
            const existing = liveTicksMap[s.assetId];
            if (!existing || new Date(dbTick.timestamp) >= new Date(existing.timestamp)) {
              liveTicksMap[s.assetId] = dbTick;
            }
          }
        });
        return { liveTicks: liveTicksMap };
      });
    } catch (e) {
      console.error('Failed to refresh prices', e);
    }
  },

  fetchHistory: async (assetId: string, interval?: string) => {
    try {
      const history = await getPriceHistory(assetId, 200, interval);
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

  fetchNews: async (commodityId?: string) => {
    try {
      const news = await getNews(10, commodityId);
      set({ news });
    } catch (e) {
      console.error('Failed to fetch news', e);
    }
  },

  fetchForexRate: async () => {
    try {
      const rate = await getLatestForexRate('USD_INR');
      set({ forexRate: rate });
    } catch (e) {
      console.error('Failed to fetch forex rate', e);
    }
  },

  updateLiveTick: (tick: NormalizedTick) => {
    set((state) => {
      const currentHistory = state.historicalData[tick.assetId] || [];
      
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
    get().fetchNews(assetId);
  },

  addCommodity: (commodity: Commodity) => {
    set((state) => ({
      commodities: { ...state.commodities, [commodity.assetId]: commodity }
    }));
  },

  removeCommodity: (assetId: string) => {
    set((state) => {
      const newComms = { ...state.commodities };
      delete newComms[assetId];
      // Switch selected asset if the deleted one was selected
      let newSelected = state.selectedAssetId;
      if (newSelected === assetId) {
        newSelected = Object.keys(newComms)[0] || 'MCX_GOLD';
      }
      return { commodities: newComms, selectedAssetId: newSelected };
    });
  }
}));
