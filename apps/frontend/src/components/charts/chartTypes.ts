import { Time, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';
import { ChartType } from './chartConfig';

// Main series type union
export type MainSeries = ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>;
export type VolumeSeries = ISeriesApi<'Histogram'>;

// Chart instance refs
export interface ChartRefs {
  chart: IChartApi | null;
  mainSeries: MainSeries | null;
  volumeSeries: VolumeSeries | null;
}

// Candlestick data point
export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Line/Area data point
export interface LineData {
  time: Time;
  value: number;
}

// Volume data point
export interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

// OHLC header display data
export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

// Chart state
export interface ChartState {
  activeInterval: string;
  activeRange: string;
  chartType: ChartType;
  priceScaleMode: 'normal' | 'percent' | 'log';
  autoScale: boolean;
  magnetEnabled: boolean;
}

// Saved chart config
export interface SavedChartConfig {
  activeInterval?: string;
  chartType?: ChartType;
  priceScaleMode?: 'normal' | 'percent' | 'log';
  autoScale?: boolean;
  magnetEnabled?: boolean;
}

// Props for TradingChart
export interface TradingChartProps {
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
  onIntervalChange?: (interval: string) => void;
  onRangeChange?: (range: string, days: number) => void;
}

// Data tracker for efficient updates
export interface DataTracker {
  asset: string;
  interval: string;
  length: number;
  firstTs: number;
}

// Tool definition for sidebar
export interface ToolDefinition {
  id: string;
  label: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }> | null;
}

// Left sidebar tools config
export type LeftSidebarTool = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

// Panel visibility state
export interface PanelState {
  showIndicatorPanel: boolean;
  showAlertPanel: boolean;
  showSettingsPanel: boolean;
  showDatePicker: boolean;
}
