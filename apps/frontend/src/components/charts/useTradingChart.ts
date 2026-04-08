import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';
import { ChartType, getChartTheme, getDefaultChartOptions, PRICE_SCALE_MODES, VOLUME_SCALE_MARGINS } from './chartConfig';
import { ChartRefs, DataTracker, OHLCData } from './chartTypes';
import {
  toChartTime,
  processDataForChart,
  toCandleData,
  toLineData,
  toVolumeData,
  deduplicateByTime,
  calculateOHLC,
  isTrendDown,
  loadChartConfig,
  saveChartConfig,
} from './chartUtils';

interface UseTradingChartOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
  chartType: ChartType;
  priceScaleMode: 'normal' | 'percent' | 'log';
  autoScale: boolean;
  magnetEnabled: boolean;
  onCrosshairMove?: (data: OHLCData | null) => void;
}

interface UseTradingChartReturn {
  chartRefs: ChartRefs;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
  handleToggleMagnet: () => void;
  updatePriceScale: (mode: 'normal' | 'percent' | 'log', autoScale: boolean) => void;
}

export function useTradingChart({
  containerRef,
  data,
  liveTick,
  assetName,
  chartType,
  priceScaleMode,
  autoScale,
  magnetEnabled,
  onCrosshairMove,
}: UseTradingChartOptions): UseTradingChartReturn {
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const dataTrackerRef = useRef<DataTracker>({ asset: '', interval: '', length: 0, firstTs: 0 });
  const isDarkRef = useRef(false);

  // Check dark mode once
  useEffect(() => {
    isDarkRef.current = document.documentElement.classList.contains('dark');
  }, []);

  // 1. Initialize chart (runs once)
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, getDefaultChartOptions(isDarkRef.current));
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [containerRef]);

  // 2. Update price scale options
  const updatePriceScale = useCallback((mode: 'normal' | 'percent' | 'log', auto: boolean) => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      rightPriceScale: {
        mode: PRICE_SCALE_MODES[mode],
        autoScale: auto,
      },
    });
  }, []);

  useEffect(() => {
    updatePriceScale(priceScaleMode, autoScale);
  }, [priceScaleMode, autoScale, updatePriceScale]);

  // 3. Create/update series when chartType changes
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing series
    if (mainSeriesRef.current) {
      chartRef.current.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    const theme = getChartTheme(isDarkRef.current);
    const isDown = isTrendDown(data);

    // Create main series based on chart type
    let mainSeries: ISeriesApi<'Candlestick' | 'Line' | 'Area'>;

    if (chartType === 'candle') {
      mainSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: theme.bullishColor,
        downColor: theme.bearishColor,
        borderVisible: true,
        wickUpColor: theme.bullishColor,
        wickDownColor: theme.bearishColor,
        borderUpColor: theme.bullishColor,
        borderDownColor: theme.bearishColor,
      }) as ISeriesApi<'Candlestick'>;
    } else if (chartType === 'line') {
      mainSeries = chartRef.current.addSeries(LineSeries, {
        color: theme.lineColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      }) as ISeriesApi<'Line'>;
    } else {
      const areaColors = isDown ? theme.areaDown : theme.areaUp;
      mainSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: areaColors.line,
        topColor: areaColors.top,
        bottomColor: areaColors.bottom,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      }) as ISeriesApi<'Area'>;
    }

    mainSeriesRef.current = mainSeries;

    // Create volume series
    const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chartRef.current.priceScale('volume').applyOptions({ scaleMargins: VOLUME_SCALE_MARGINS });
    volumeSeriesRef.current = volumeSeries;

    // Subscribe to crosshair moves
    chartRef.current.subscribeCrosshairMove((param) => {
      if (param.seriesData && param.seriesData.size > 0 && mainSeriesRef.current && onCrosshairMove) {
        const point = param.seriesData.get(mainSeriesRef.current) as any;
        if (point) {
          if (chartType === 'candle') {
            const change = point.close - point.open;
            const changePercent = point.open !== 0 ? (change / point.open) * 100 : 0;
            onCrosshairMove({
              open: point.open,
              high: point.high,
              low: point.low,
              close: point.close,
              change,
              changePercent,
            });
          } else {
            onCrosshairMove({
              open: 0,
              high: 0,
              low: 0,
              close: point.value,
              change: 0,
              changePercent: 0,
            });
          }
        } else {
          onCrosshairMove(null);
        }
      }
    });

    // Reset data tracker to force setData on new series
    dataTrackerRef.current = { asset: '', interval: '', length: 0, firstTs: 0 };
  }, [chartType, data, onCrosshairMove]);

  // 4. Set/update data when data or asset changes
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) return;

    const firstTs = new Date(data[0].timestamp).getTime();
    const lengthDiff = Math.abs(data.length - dataTrackerRef.current.length);
    const isNewContext = dataTrackerRef.current.asset !== assetName;
    const isBulkUpdate = lengthDiff > 1 || firstTs !== dataTrackerRef.current.firstTs;

    if (isNewContext || isBulkUpdate) {
      const processedData = processDataForChart(data);
      const theme = getChartTheme(isDarkRef.current);

      if (chartType === 'candle') {
        const candleData = deduplicateByTime(toCandleData(processedData));
        (mainSeriesRef.current as ISeriesApi<'Candlestick'>).setData(candleData);
      } else {
        const lineData = deduplicateByTime(toLineData(processedData));
        (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).setData(lineData);
      }

      const volumeData = deduplicateByTime(toVolumeData(processedData, isDarkRef.current));
      volumeSeriesRef.current.setData(volumeData);

      chartRef.current?.timeScale().fitContent();
      dataTrackerRef.current = { asset: assetName, interval: '', length: data.length, firstTs };
    } else {
      dataTrackerRef.current.length = data.length;
    }
  }, [data, assetName, chartType]);

  // 5. Handle live tick updates (efficient incremental update)
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !liveTick) return;

    const time = toChartTime(liveTick.timestamp);
    const theme = getChartTheme(isDarkRef.current);

    try {
      if (chartType === 'candle') {
        (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update({
          time,
          open: Number(liveTick.open),
          high: Number(liveTick.high),
          low: Number(liveTick.low),
          close: Number(liveTick.close),
        });
      } else {
        (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).update({
          time,
          value: Number(liveTick.close),
        });
      }

      volumeSeriesRef.current.update({
        time,
        value: Number(liveTick.volume || 0),
        color: Number(liveTick.close) >= Number(liveTick.open) ? theme.volumeUp : theme.volumeDown,
      });
    } catch {
      // Ignore errors from duplicate timestamps
    }
  }, [liveTick, chartType]);

  // 6. Update crosshair mode
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      crosshair: {
        mode: magnetEnabled ? CrosshairMode.Magnet : CrosshairMode.Normal,
      },
    });
  }, [magnetEnabled]);

  // Helper functions
  const handleZoomIn = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 0.7;
      timeScale.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 1.4;
      timeScale.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  }, []);

  const handleReset = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const handleToggleMagnet = useCallback(() => {
    // This is handled by the parent component state
  }, []);

  return {
    chartRefs: {
      chart: chartRef.current,
      mainSeries: mainSeriesRef.current as any,
      volumeSeries: volumeSeriesRef.current as any,
    },
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleToggleMagnet,
    updatePriceScale,
  };
}

// Hook for managing chart state with localStorage persistence
export function useChartState(assetName: string) {
  const [activeInterval, setActiveInterval] = useState('1d');
  const [activeRange, setActiveRange] = useState('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [priceScaleMode, setPriceScaleMode] = useState<'normal' | 'percent' | 'log'>('normal');
  const [autoScale, setAutoScale] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    const config = loadChartConfig(assetName);
    if (config) {
      if (config.activeInterval) setActiveInterval(config.activeInterval);
      if (config.chartType) setChartType(config.chartType);
      if (config.priceScaleMode) setPriceScaleMode(config.priceScaleMode);
      if (config.autoScale !== undefined) setAutoScale(config.autoScale);
      if (config.magnetEnabled !== undefined) setMagnetEnabled(config.magnetEnabled);
    }
  }, [assetName]);

  // Save config when state changes
  const saveConfig = useCallback(() => {
    saveChartConfig(assetName, {
      activeInterval,
      chartType,
      priceScaleMode,
      autoScale,
      magnetEnabled,
    });
  }, [assetName, activeInterval, chartType, priceScaleMode, autoScale, magnetEnabled]);

  return {
    activeInterval,
    setActiveInterval,
    activeRange,
    setActiveRange,
    chartType,
    setChartType,
    priceScaleMode,
    setPriceScaleMode,
    autoScale,
    setAutoScale,
    magnetEnabled,
    setMagnetEnabled,
    saveConfig,
  };
}

// Hook for undo/redo functionality
export function useUndoRedo() {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const pushUndo = useCallback((action: string) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const popUndo = useCallback(() => {
    if (undoStack.length === 0) return null;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    return lastAction;
  }, [undoStack]);

  const popRedo = useCallback(() => {
    if (redoStack.length === 0) return null;
    const nextAction = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    return nextAction;
  }, [redoStack]);

  const pushRedo = useCallback((action: string) => {
    setRedoStack(prev => [...prev, action]);
  }, []);

  return {
    undoStack,
    redoStack,
    pushUndo,
    popUndo,
    popRedo,
    pushRedo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}

// Hook for live clock display
export function useLiveClock() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
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
      setCurrentTime(`${timeStr} ${offsetStr}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}
