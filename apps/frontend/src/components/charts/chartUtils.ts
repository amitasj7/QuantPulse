import { Time } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';
import { CandleData, LineData, VolumeData } from './chartTypes';
import { getChartTheme } from './chartConfig';

/**
 * Convert timestamp to chart Time format (Unix seconds)
 */
export const toChartTime = (timestamp: string | Date): Time => {
  return Math.floor(new Date(timestamp).getTime() / 1000) as Time;
};

/**
 * Validate and filter data points with proper timestamps
 */
export const filterValidData = (data: NormalizedTick[]): NormalizedTick[] => {
  return data.filter(t => !isNaN(new Date(t.timestamp).getTime()));
};

/**
 * Remove outliers using IQR method (3*IQR range)
 */
export const removeOutliers = (data: NormalizedTick[]): NormalizedTick[] => {
  if (data.length <= 5) return data;

  const prices = data.map(t => Number(t.close)).filter(p => p > 0).sort((a, b) => a - b);
  
  if (prices.length <= 4) return data;

  const q1 = prices[Math.floor(prices.length * 0.25)];
  const q3 = prices[Math.floor(prices.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 3 * iqr;
  const upperBound = q3 + 3 * iqr;

  return data.filter(t => {
    const price = Number(t.close);
    return price >= lowerBound && price <= upperBound;
  });
};

/**
 * Sort data by timestamp ascending
 */
export const sortByTime = (data: NormalizedTick[]): NormalizedTick[] => {
  return [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

/**
 * Deduplicate data by time (keep latest)
 */
export const deduplicateByTime = <T extends { time: Time }>(data: T[]): T[] => {
  return Array.from(new Map(data.map(item => [item.time, item])).values());
};

/**
 * Transform normalized ticks to candlestick data
 */
export const toCandleData = (data: NormalizedTick[]): CandleData[] => {
  return data.map(t => ({
    time: toChartTime(t.timestamp),
    open: Number(t.open),
    high: Number(t.high),
    low: Number(t.low),
    close: Number(t.close),
  }));
};

/**
 * Transform normalized ticks to line/area data
 */
export const toLineData = (data: NormalizedTick[]): LineData[] => {
  return data.map(t => ({
    time: toChartTime(t.timestamp),
    value: Number(t.close),
  }));
};

/**
 * Transform normalized ticks to volume data
 */
export const toVolumeData = (data: NormalizedTick[], isDark: boolean): VolumeData[] => {
  const theme = getChartTheme(isDark);
  return data.map(t => ({
    time: toChartTime(t.timestamp),
    value: Number(t.volume || 0),
    color: Number(t.close) >= Number(t.open) ? theme.volumeUp : theme.volumeDown,
  }));
};

/**
 * Process data for chart: sort, validate, remove outliers
 */
export const processDataForChart = (data: NormalizedTick[]): NormalizedTick[] => {
  const sorted = sortByTime(data);
  const valid = filterValidData(sorted);
  return removeOutliers(valid);
};

/**
 * Calculate OHLC data from tick or data array
 */
export const calculateOHLC = (liveTick: NormalizedTick | undefined, data: NormalizedTick[]) => {
  const source = liveTick ?? (data.length > 0 ? data[data.length - 1] : null);
  
  if (!source) return null;

  const change = source.close - source.open;
  const changePercent = source.open !== 0 ? (change / source.open) * 100 : 0;

  return {
    open: source.open,
    high: source.high,
    low: source.low,
    close: source.close,
    change,
    changePercent,
  };
};

/**
 * Determine if price trend is down based on first and last valid closes
 */
export const isTrendDown = (data: NormalizedTick[]): boolean => {
  if (!data || data.length === 0) return false;
  
  const firstValid = data.find(d => Number(d.close) > 0);
  const lastValid = [...data].reverse().find(d => Number(d.close) > 0);
  
  if (!firstValid || !lastValid) return false;
  
  return Number(lastValid.close) < Number(firstValid.close);
};

/**
 * Format current time with timezone
 */
export const formatCurrentTime = (): string => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hrs = Math.floor(absOffset / 60);
  const mins = absOffset % 60;
  const offsetStr = `UTC${sign}${hrs}:${mins.toString().padStart(2, '0')}`;
  
  return `${timeStr} ${offsetStr}`;
};

/**
 * Generate screenshot filename
 */
export const generateScreenshotFilename = (assetName: string, interval: string): string => {
  const date = new Date().toISOString().slice(0, 10);
  return `${assetName}_${interval}_${date}.png`;
};

/**
 * Save chart config to localStorage
 */
export const saveChartConfig = (
  assetName: string,
  config: {
    activeInterval: string;
    chartType: string;
    priceScaleMode: string;
    autoScale: boolean;
    magnetEnabled: boolean;
  }
) => {
  localStorage.setItem(`chart_config_${assetName}`, JSON.stringify(config));
};

/**
 * Load chart config from localStorage
 */
export const loadChartConfig = (assetName: string) => {
  try {
    const saved = localStorage.getItem(`chart_config_${assetName}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

/**
 * Get the appropriate interval for a time range
 */
export const getIntervalForRange = (range: string): string => {
  const rangeIntervalMap: Record<string, string> = {
    '1D': '5m',
    '5D': '15m',
    '1M': '4H',
    '3M': '1d',
    '6M': '1d',
    'YTD': '1w',
    '1Y': '1w',
    'ALL': '1w',
  };
  return rangeIntervalMap[range] || '1d';
};
