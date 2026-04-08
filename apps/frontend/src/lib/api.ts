import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : (process.env.BACKEND_URL || 'http://localhost:4000'));

export const api = axios.create({
  baseURL: API_URL,
});

export const getCommodities = async () => {
  const { data } = await api.get('/commodities');
  return data;
};

export const getCommoditiesByCategory = async (category: string) => {
  const { data } = await api.get('/commodities', { params: { category } });
  return data;
};

export const getCommodityDetail = async (assetId: string) => {
  const { data } = await api.get(`/commodities/${assetId}`);
  return data;
};

export const getSolarMetrics = async () => {
  const { data } = await api.get('/solar/supply-chain');
  return data;
};

export const getPriceHistory = async (assetId: string, limit = 100, interval?: string): Promise<NormalizedTick[]> => {
  const { data } = await api.get(`/commodities/${assetId}/prices`, {
    params: { limit, ...(interval ? { interval } : {}) },
  });
  return data;
};

// News API
export interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  sentiment: string | null;
  publishedAt: string;
  commodity: { assetId: string; name: string; symbol: string } | null;
}

export const getNews = async (limit = 20, commodityId?: string): Promise<NewsItem[]> => {
  const { data } = await api.get('/news', {
    params: { limit, ...(commodityId ? { commodityId } : {}) },
  });
  return data;
};

export const getNewsByCommodity = async (assetId: string, limit = 10): Promise<NewsItem[]> => {
  const { data } = await api.get(`/news/commodity/${assetId}`, {
    params: { limit },
  });
  return data;
};

// Forex API
export interface ForexRateItem {
  id: string;
  pair: string;
  rate: number;
  timestamp: string;
}

export const getLatestForexRate = async (pair = 'USD_INR'): Promise<ForexRateItem> => {
  const { data } = await api.get('/forex/latest', { params: { pair } });
  return data;
};
