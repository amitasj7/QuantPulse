import { CrosshairMode, LineStyle, ColorType, LineWidth } from 'lightweight-charts';

// Time intervals for the top toolbar
export const TIME_INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
] as const;

// Time range options for bottom toolbar (TradingView style)
export const TIME_RANGES = [
  { label: '1D', value: '1D', days: 1, defaultInterval: '5m' },
  { label: '5D', value: '5D', days: 5, defaultInterval: '15m' },
  { label: '1M', value: '1M', days: 30, defaultInterval: '4H' },
  { label: '3M', value: '3M', days: 90, defaultInterval: '1d' },
  { label: '6M', value: '6M', days: 180, defaultInterval: '1d' },
  { label: 'YTD', value: 'YTD', days: 0, defaultInterval: '1w' },
  { label: '1Y', value: '1Y', days: 365, defaultInterval: '1w' },
  { label: 'ALL', value: 'ALL', days: 0, defaultInterval: '1w' },
] as const;

// Chart type options
export const CHART_TYPES = ['candle', 'line', 'area'] as const;
export type ChartType = typeof CHART_TYPES[number];

// Price scale modes
export const PRICE_SCALE_MODES = {
  normal: 0,
  log: 1,
  percent: 2,
} as const;

// Theme colors
export const getChartTheme = (isDark: boolean) => ({
  textColor: isDark ? '#94A3B8' : '#475569',
  gridColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
  borderColor: isDark ? '#1E293B' : '#E2E8F0',
  crosshairColor: '#0ECB81',
  bullishColor: '#089981',
  bearishColor: '#F23645',
  volumeUp: 'rgba(16, 185, 129, 0.3)',
  volumeDown: 'rgba(244, 63, 94, 0.3)',
  areaUp: {
    line: '#34a853',
    top: 'rgba(52, 168, 83, 0.4)',
    bottom: 'rgba(52, 168, 83, 0.0)',
  },
  areaDown: {
    line: '#ea4335',
    top: 'rgba(234, 67, 53, 0.4)',
    bottom: 'rgba(234, 67, 53, 0.0)',
  },
  lineColor: '#2962FF',
});

// Default chart options
export const getDefaultChartOptions = (isDark: boolean) => {
  const theme = getChartTheme(isDark);
  return {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: theme.textColor,
    },
    grid: {
      vertLines: { color: theme.gridColor },
      horzLines: { color: theme.gridColor },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1 as LineWidth,
        color: theme.crosshairColor,
        style: LineStyle.Dashed,
        labelBackgroundColor: theme.crosshairColor,
      },
      horzLine: {
        width: 1 as LineWidth,
        color: theme.crosshairColor,
        style: LineStyle.Dashed,
        labelBackgroundColor: theme.crosshairColor,
      },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      borderVisible: false,
      borderColor: theme.borderColor,
    },
    rightPriceScale: {
      borderVisible: false,
      borderColor: theme.borderColor,
    },
    autoSize: true,
  };
};

// Volume scale margins
export const VOLUME_SCALE_MARGINS = { top: 0.85, bottom: 0 };

// Local storage keys
export const getChartConfigKey = (assetName: string) => `chart_config_${assetName}`;
