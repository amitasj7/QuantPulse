import axios from 'axios';
import { NormalizedTick } from '@quantpulse/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
});

export const getCommodities = async () => {
  const { data } = await api.get('/commodities');
  return data;
};

export const getSolarMetrics = async () => {
  const { data } = await api.get('/solar/supply-chain');
  return data;
};

export const getPriceHistory = async (assetId: string, limit = 100): Promise<NormalizedTick[]> => {
  const { data } = await api.get(`/commodities/${assetId}/prices`, {
    params: { limit },
  });
  return data;
};
