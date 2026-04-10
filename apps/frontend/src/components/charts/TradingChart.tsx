"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';
import { Undo2, Redo2, Camera, Save, Settings } from 'lucide-react';

import { ChartType, getChartTheme, getDefaultChartOptions, PRICE_SCALE_MODES, VOLUME_SCALE_MARGINS, TIME_RANGES } from './chartConfig';
import { OHLCData, DataTracker } from './chartTypes';
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
  getIntervalForRange,
  generateScreenshotFilename,
} from './chartUtils';
import { ChartToolbar } from './ChartToolbar';
import { TimeRangeFilter } from './TimeRangeFilter';
import { ChartSidebar } from './ChartSidebar';
import { ChartOverlays } from './ChartOverlays';
import { IndicatorPanel, AlertPanel, SettingsPanel } from './ChartPanels';
import { useLiveClock, useUndoRedo } from './useTradingChart';

interface TradingChartProps {
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
  onIntervalChange?: (interval: string) => void;
  onRangeChange?: (range: string, days: number) => void;
}

export function TradingChart({
  data,
  liveTick,
  assetName,
  onIntervalChange,
  onRangeChange,
}: TradingChartProps) {
  // Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const dataTrackerRef = useRef<DataTracker>({ asset: '', interval: '', length: 0, firstTs: 0 });

  // State
  const [activeInterval, setActiveInterval] = useState('1d');
  const [activeRange, setActiveRange] = useState('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [priceScaleMode, setPriceScaleMode] = useState<'normal' | 'percent' | 'log'>('normal');
  const [autoScale, setAutoScale] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(false);
  const [activeTool, setActiveTool] = useState('crosshair');
  const [headerData, setHeaderData] = useState<OHLCData | null>(null);

  // Panel states
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Hooks
  const currentTime = useLiveClock();
  const { undoStack, redoStack, pushUndo, popUndo, popRedo, pushRedo, canUndo, canRedo } = useUndoRedo();

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

  // 1. Chart initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const chart = createChart(chartContainerRef.current, getDefaultChartOptions(isDark));
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // 2. Price scale updates
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      rightPriceScale: {
        mode: PRICE_SCALE_MODES[priceScaleMode],
        autoScale,
      },
    });
  }, [priceScaleMode, autoScale]);

  // 3. Series management
  useEffect(() => {
    if (!chartRef.current) return;

    if (mainSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(mainSeriesRef.current);
      } catch {}
      mainSeriesRef.current = null;
    }
    if (volumeSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(volumeSeriesRef.current);
      } catch {}
      volumeSeriesRef.current = null;
    }

    const theme = getChartTheme(document.documentElement.classList.contains('dark'));
    const isDown = isTrendDown(data);

    let mainSeries: ISeriesApi<any>;

    if (chartType === 'candle') {
      mainSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: theme.bullishColor,
        downColor: theme.bearishColor,
        borderVisible: true,
        wickUpColor: theme.bullishColor,
        wickDownColor: theme.bearishColor,
        borderUpColor: theme.bullishColor,
        borderDownColor: theme.bearishColor,
      });
    } else if (chartType === 'line') {
      mainSeries = chartRef.current.addSeries(LineSeries, {
        color: theme.lineColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });
    } else {
      const areaColors = isDown ? theme.areaDown : theme.areaUp;
      mainSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: areaColors.line,
        topColor: areaColors.top,
        bottomColor: areaColors.bottom,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });
    }
    mainSeriesRef.current = mainSeries;

    const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chartRef.current.priceScale('volume').applyOptions({ scaleMargins: VOLUME_SCALE_MARGINS });
    volumeSeriesRef.current = volumeSeries;

    // Crosshair subscription
    chartRef.current.subscribeCrosshairMove((param) => {
      if (param.seriesData && param.seriesData.size > 0 && mainSeriesRef.current) {
        const point = param.seriesData.get(mainSeriesRef.current) as any;
        if (point && chartType === 'candle') {
          const change = point.close - point.open;
          const changePercent = point.open !== 0 ? (change / point.open) * 100 : 0;
          setHeaderData({
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
            change,
            changePercent,
          });
        }
      }
    });

    dataTrackerRef.current = { asset: '', interval: '', length: 0, firstTs: 0 };
  }, [chartType, data]);

  // 4. Data binding
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !data?.length) return;

    const firstTs = new Date(data[0].timestamp).getTime();
    const isNewContext = dataTrackerRef.current.asset !== assetName;
    const isBulkUpdate = Math.abs(data.length - dataTrackerRef.current.length) > 1 || firstTs !== dataTrackerRef.current.firstTs;

    if (isNewContext || isBulkUpdate) {
      const processedData = processDataForChart(data);
      const theme = getChartTheme(document.documentElement.classList.contains('dark'));

      if (chartType === 'candle') {
        const candleData = deduplicateByTime(toCandleData(processedData));
        mainSeriesRef.current.setData(candleData);
      } else {
        const lineData = deduplicateByTime(toLineData(processedData));
        mainSeriesRef.current.setData(lineData);
      }

      const volumeData = deduplicateByTime(toVolumeData(processedData, document.documentElement.classList.contains('dark')));
      volumeSeriesRef.current.setData(volumeData);

      chartRef.current?.timeScale().fitContent();
      dataTrackerRef.current = { asset: assetName, interval: activeInterval, length: data.length, firstTs };
    } else {
      dataTrackerRef.current.length = data.length;
    }
  }, [data, assetName, activeInterval, chartType]);

  // 5. Live tick updates
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !liveTick) return;

    const time = toChartTime(liveTick.timestamp);
    const theme = getChartTheme(document.documentElement.classList.contains('dark'));

    try {
      if (chartType === 'candle') {
        mainSeriesRef.current.update({
          time,
          open: Number(liveTick.open),
          high: Number(liveTick.high),
          low: Number(liveTick.low),
          close: Number(liveTick.close),
        });
      } else {
        mainSeriesRef.current.update({ time, value: Number(liveTick.close) });
      }

      volumeSeriesRef.current.update({
        time,
        value: Number(liveTick.volume || 0),
        color: Number(liveTick.close) >= Number(liveTick.open) ? theme.volumeUp : theme.volumeDown,
      });

      // Update header with live data
      const ohlc = calculateOHLC(liveTick, data);
      if (ohlc) setHeaderData(ohlc);
    } catch {}
  }, [liveTick, chartType, data]);

  // Update header on data change
  useEffect(() => {
    const ohlc = calculateOHLC(undefined, data);
    if (ohlc) setHeaderData(ohlc);
  }, [data]);

  // Handlers
  const handleIntervalChange = useCallback((interval: string) => {
    pushUndo(`interval:${activeInterval}`);
    setActiveInterval(interval);
    onIntervalChange?.(interval);
  }, [activeInterval, pushUndo, onIntervalChange]);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    pushUndo(`chartType:${chartType}`);
    setChartType(type);
  }, [chartType, pushUndo]);

  const handleRangeChange = useCallback((range: string, days: number) => {
    setActiveRange(range);
    
    // Auto-select appropriate interval
    const targetInterval = getIntervalForRange(range);
    if (targetInterval !== activeInterval) {
      setActiveInterval(targetInterval);
      onIntervalChange?.(targetInterval);
    }

    onRangeChange?.(range, days);

    // Fit content for ALL or YTD
    if (range === 'ALL' || days === 0) {
      chartRef.current?.timeScale().fitContent();
      return;
    }

    // Set visible range
    if (chartRef.current && data.length > 0) {
      const timeScale = chartRef.current.timeScale();
      const totalBars = data.length;
      const from = Math.max(0, totalBars - Math.min(days * 24, totalBars));
      timeScale.setVisibleLogicalRange({ from, to: totalBars });
    }
  }, [activeInterval, onIntervalChange, onRangeChange, data.length]);

  const handleUndo = useCallback(() => {
    const action = popUndo();
    if (!action) return;
    
    const [type, value] = action.split(':');
    pushRedo(action);
    
    if (type === 'interval') {
      setActiveInterval(value);
      onIntervalChange?.(value);
    } else if (type === 'chartType') {
      setChartType(value as ChartType);
    }
  }, [popUndo, pushRedo, onIntervalChange]);

  const handleRedo = useCallback(() => {
    const action = popRedo();
    if (!action) return;
    
    const [type, value] = action.split(':');
    pushUndo(action);
    
    if (type === 'interval') {
      setActiveInterval(value);
      onIntervalChange?.(value);
    } else if (type === 'chartType') {
      setChartType(value as ChartType);
    }
  }, [popRedo, pushUndo, onIntervalChange]);

  const handleScreenshot = useCallback(() => {
    const filename = generateScreenshotFilename(assetName, activeInterval);
    const canvas = chartContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [assetName, activeInterval]);

  const handleSaveChart = useCallback(() => {
    saveChartConfig(assetName, {
      activeInterval,
      chartType,
      priceScaleMode,
      autoScale,
      magnetEnabled,
    });
  }, [assetName, activeInterval, chartType, priceScaleMode, autoScale, magnetEnabled]);

  const handleZoomIn = useCallback(() => {
    const timeScale = chartRef.current?.timeScale();
    const range = timeScale?.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 0.7;
      timeScale?.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const timeScale = chartRef.current?.timeScale();
    const range = timeScale?.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 1.4;
      timeScale?.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  }, []);

  const handleReset = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const handleToggleMagnet = useCallback(() => {
    setMagnetEnabled(prev => {
      const newValue = !prev;
      chartRef.current?.applyOptions({
        crosshair: { mode: newValue ? CrosshairMode.Magnet : CrosshairMode.Normal },
      });
      return newValue;
    });
  }, []);

  const handleTogglePercent = useCallback(() => {
    setPriceScaleMode(prev => prev === 'percent' ? 'normal' : 'percent');
  }, []);

  const handleToggleLog = useCallback(() => {
    setPriceScaleMode(prev => prev === 'log' ? 'normal' : 'log');
  }, []);

  const handleToggleAutoScale = useCallback(() => {
    setAutoScale(prev => !prev);
  }, []);

  const lastPrice = headerData?.close != null ? Number(headerData.close).toFixed(2) : '0.00';

  return (
    <div className="w-full h-full flex flex-col bg-surface border-none overflow-hidden shrink-0">
      {/* Top Toolbar */}
      <ChartToolbar
        assetName={assetName}
        activeInterval={activeInterval}
        chartType={chartType}
        showIndicatorPanel={showIndicatorPanel}
        showAlertPanel={showAlertPanel}
        onIntervalChange={handleIntervalChange}
        onChartTypeChange={handleChartTypeChange}
        onToggleIndicatorPanel={() => setShowIndicatorPanel(p => !p)}
        onToggleAlertPanel={() => setShowAlertPanel(p => !p)}
      >
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded transition-colors hidden sm:block ${canUndo ? 'hover:bg-surface text-text-secondary hover:text-foreground' : 'text-text-secondary/30 cursor-not-allowed'}`}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded transition-colors hidden sm:block ${canRedo ? 'hover:bg-surface text-text-secondary hover:text-foreground' : 'text-text-secondary/30 cursor-not-allowed'}`}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
        <button onClick={handleScreenshot} className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-colors" title="Screenshot">
          <Camera className="h-4 w-4" />
        </button>
        <button onClick={handleSaveChart} className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-colors" title="Save Chart Config">
          <Save className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowSettingsPanel(p => !p)}
          className={`p-1.5 rounded transition-colors ${showSettingsPanel ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'}`}
          title="Chart Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </ChartToolbar>

      {/* Panels */}
      <IndicatorPanel isOpen={showIndicatorPanel} onClose={() => setShowIndicatorPanel(false)} />
      <AlertPanel isOpen={showAlertPanel} onClose={() => setShowAlertPanel(false)} assetName={assetName} />
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        autoScale={autoScale}
        magnetEnabled={magnetEnabled}
        priceScaleMode={priceScaleMode}
        onToggleAutoScale={handleToggleAutoScale}
        onToggleMagnet={handleToggleMagnet}
        onToggleLog={handleToggleLog}
        onTogglePercent={handleTogglePercent}
      />

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-row relative h-full min-h-0">
        {/* Left Sidebar */}
        <ChartSidebar
          activeTool={activeTool}
          magnetEnabled={magnetEnabled}
          onToolSelect={setActiveTool}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleMagnet={handleToggleMagnet}
        />

        {/* Chart Container */}
        <div className="flex-1 relative min-h-[300px] w-full h-full bg-background/50">
          <ChartOverlays
            assetName={assetName}
            activeInterval={activeInterval}
            chartType={chartType}
            headerData={headerData}
            lastPrice={lastPrice}
            onBuy={() => alert(`BUY order placed for ${assetName} at ${lastPrice}`)}
            onSell={() => alert(`SELL order placed for ${assetName} at ${lastPrice}`)}
          />
          <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Bottom Time Range Filter */}
      <TimeRangeFilter
        activeRange={activeRange}
        currentTime={currentTime}
        priceScaleMode={priceScaleMode}
        autoScale={autoScale}
        onRangeChange={handleRangeChange}
        onTogglePercent={handleTogglePercent}
        onToggleLog={handleToggleLog}
        onToggleAutoScale={handleToggleAutoScale}
        onReset={handleReset}
      />
    </div>
  );
}
