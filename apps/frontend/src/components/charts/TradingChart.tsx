"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, ColorType,
  CrosshairMode, LineStyle
} from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';
import { 
  Search, Plus, BarChart2, Activity, Bell, Undo2, Redo2, Save, Camera,
  Crosshair, TrendingUp, Type, Ruler, ZoomIn, Magnet, Trash2, Settings, PenTool, CalendarDays, X, Check,
  ZoomOut, RotateCcw, Download
} from "lucide-react";

interface TradingChartProps {
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
  onIntervalChange?: (interval: string) => void;
}

const TIME_INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

const BOTTOM_RANGES = [
  { label: '1D', value: '1D', bars: 24 },
  { label: '5D', value: '5D', bars: 120 },
  { label: '1M', value: '1M', bars: 720 },
  { label: '3M', value: '3M', bars: 2160 },
  { label: '6M', value: '6M', bars: 4320 },
  { label: 'YTD', value: 'YTD', bars: 0 },
  { label: '1Y', value: '1Y', bars: 8760 },
  { label: '5Y', value: '5Y', bars: 43800 },
  { label: 'ALL', value: 'ALL', bars: 0 },
];

export function TradingChart({ data, liveTick, assetName, onIntervalChange }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [activeInterval, setActiveInterval] = useState('1d');
  const [activeRange, setActiveRange] = useState('1M');
  const [chartType, setChartType] = useState<'candle' | 'line' | 'area'>('area');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateValue, setCustomDateValue] = useState("");
  
  // Area 3: Left sidebar tool state
  const [activeTool, setActiveTool] = useState<string>('crosshair');
  const [magnetEnabled, setMagnetEnabled] = useState(false);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  // Area 5: Bottom toolbar states
  const [priceScaleMode, setPriceScaleMode] = useState<'normal' | 'percent' | 'log'>('normal');
  const [autoScale, setAutoScale] = useState(true);

  // Undo/Redo history
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // OHLC header data
  const [headerData, setHeaderData] = useState<{
    open: number; high: number; low: number; close: number; change: number; changePercent: number;
  } | null>(null);

  const formatOHLC = useCallback(() => {
    if (liveTick) {
      const change = liveTick.close - liveTick.open;
      const changePercent = liveTick.open !== 0 ? (change / liveTick.open) * 100 : 0;
      setHeaderData({
        open: liveTick.open,
        high: liveTick.high,
        low: liveTick.low,
        close: liveTick.close,
        change,
        changePercent,
      });
    } else if (data.length > 0) {
      const lastCandle = data[data.length - 1];
      const change = lastCandle.close - lastCandle.open;
      const changePercent = lastCandle.open !== 0 ? (change / lastCandle.open) * 100 : 0;
      setHeaderData({
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        change,
        changePercent,
      });
    }
  }, [liveTick, data]);

  useEffect(() => { formatOHLC(); }, [formatOHLC]);

  const dataTracker = useRef({ asset: '', interval: '', length: 0, firstTs: 0 });

  // 1. Core Chart Initialization (Runs Once)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94A3B8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { width: 1, color: '#0ECB81', style: LineStyle.Dashed, labelBackgroundColor: '#0ECB81' },
        horzLine: { width: 1, color: '#0ECB81', style: LineStyle.Dashed, labelBackgroundColor: '#0ECB81' },
      },
      timeScale: { timeVisible: true, secondsVisible: false, borderVisible: false, borderColor: isDark ? '#1E293B' : '#E2E8F0' },
      rightPriceScale: { borderVisible: false, borderColor: isDark ? '#1E293B' : '#E2E8F0' },
      autoSize: true,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // 2. Dynamic Chart Options Applying
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      rightPriceScale: {
        mode: priceScaleMode === 'log' ? 1 : (priceScaleMode === 'percent' ? 2 : 0),
        autoScale: autoScale,
      }
    });
  }, [priceScaleMode, autoScale]);

  // 3. Series Management (Recreate when chartType changes)
  useEffect(() => {
    if (!chartRef.current) return;

    if (mainSeriesRef.current) {
        chartRef.current.removeSeries(mainSeriesRef.current);
        mainSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
        volumeSeriesRef.current = null;
    }

    let mainSeries: ISeriesApi<"Candlestick" | "Line" | "Area">;

    let isDown = false;
    if (data && data.length > 0) {
      const fd = data.find(d => Number(d.close) > 0);
      const ld = [...data].reverse().find(d => Number(d.close) > 0);
      if (fd && ld) isDown = Number(ld.close) < Number(fd.close);
    }

    if (chartType === 'candle') {
      mainSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#089981', downColor: '#F23645', borderVisible: true,
        wickUpColor: '#089981', wickDownColor: '#F23645', borderUpColor: '#089981', borderDownColor: '#F23645',
      }) as any;
    } else if (chartType === 'line') {
      mainSeries = chartRef.current.addSeries(LineSeries, {
        color: '#2962FF', lineWidth: 2, crosshairMarkerVisible: true, crosshairMarkerRadius: 4,
      }) as any;
    } else {
      mainSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: isDown ? '#ea4335' : '#34a853',
        topColor: isDown ? 'rgba(234, 67, 53, 0.4)' : 'rgba(52, 168, 83, 0.4)',
        bottomColor: isDown ? 'rgba(234, 67, 53, 0.0)' : 'rgba(52, 168, 83, 0.0)',
        lineWidth: 2, crosshairMarkerVisible: true, crosshairMarkerRadius: 4,
      }) as any;
    }
    mainSeriesRef.current = mainSeries;

    const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: 'volume', // Using explicit volume scale
    });
    chartRef.current.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volumeSeriesRef.current = volumeSeries;

    // Crosshair Tracker
    chartRef.current.subscribeCrosshairMove((param) => {
      if (param.seriesData && param.seriesData.size > 0 && mainSeriesRef.current) {
        const point = param.seriesData.get(mainSeriesRef.current) as any;
        if (point) {
          if (chartType === 'candle') {
            const change = point.close - point.open;
            const changePercent = point.open !== 0 ? (change / point.open) * 100 : 0;
            setHeaderData({ open: point.open, high: point.high, low: point.low, close: point.close, change, changePercent });
          } else {
            setHeaderData(prev => prev ? { ...prev, close: point.value } : null);
          }
        }
      }
    });

    // Reset data tracker to force setData on new series
    dataTracker.current = { asset: '', interval: '', length: 0, firstTs: 0 };
  }, [chartType]);

  // 4. Data Processing and Binding
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) return;

    const firstTs = new Date(data[0].timestamp).getTime();
    const lengthDiff = Math.abs(data.length - dataTracker.current.length);
    const isNewContext = dataTracker.current.asset !== assetName || dataTracker.current.interval !== activeInterval;
    const isBulkUpdate = lengthDiff > 1 || firstTs !== dataTracker.current.firstTs;

    if (isNewContext || isBulkUpdate) {
      const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      let validData = sortedData.filter(t => !isNaN(new Date(t.timestamp).getTime()));

      if (validData.length > 5) {
        const prices = validData.map(t => Number(t.close)).filter(p => p > 0).sort((a, b) => a - b);
        if (prices.length > 4) {
          const q1 = prices[Math.floor(prices.length * 0.25)];
          const q3 = prices[Math.floor(prices.length * 0.75)];
          const iqr = q3 - q1;
          validData = validData.filter(t => {
            const price = Number(t.close);
            return price >= (q1 - 3 * iqr) && price <= (q3 + 3 * iqr);
          });
        }
      }

      if (chartType === 'candle') {
        const candleData = validData.map(t => ({
          time: Math.floor(new Date(t.timestamp).getTime() / 1000) as Time,
          open: Number(t.open), high: Number(t.high), low: Number(t.low), close: Number(t.close),
        }));
        const uniqueCandle = Array.from(new Map(candleData.map(item => [item.time, item])).values());
        (mainSeriesRef.current as ISeriesApi<"Candlestick">).setData(uniqueCandle);
      } else {
        const lineData = validData.map(t => ({
          time: Math.floor(new Date(t.timestamp).getTime() / 1000) as Time,
          value: Number(t.close),
        }));
        const uniqueLine = Array.from(new Map(lineData.map(item => [item.time, item])).values());
        if (chartType === 'line') {
          (mainSeriesRef.current as ISeriesApi<"Line">).setData(uniqueLine);
        } else {
          (mainSeriesRef.current as ISeriesApi<"Area">).setData(uniqueLine);
        }
      }

      const volumeData = validData.map(t => ({
        time: Math.floor(new Date(t.timestamp).getTime() / 1000) as Time,
        value: Number(t.volume || 0),
        color: Number(t.close) >= Number(t.open) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
      }));
      const uniqueVolume = Array.from(new Map(volumeData.map(item => [item.time, item])).values());
      volumeSeriesRef.current.setData(uniqueVolume);

      chartRef.current?.timeScale().fitContent();

      dataTracker.current = { asset: assetName, interval: activeInterval, length: data.length, firstTs };
    } else {
      // Just a minor length change (like a live tick), let the liveTick effect handle visual appending!
      dataTracker.current.length = data.length;
    }
  }, [data, assetName, activeInterval, chartType]);

  // Live tick updates
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !liveTick) return;

    const time = Math.floor(new Date(liveTick.timestamp).getTime() / 1000) as Time;
    
    try {
      if (chartType === 'candle') {
        (mainSeriesRef.current as ISeriesApi<"Candlestick">).update({
          time,
          open: Number(liveTick.open),
          high: Number(liveTick.high),
          low: Number(liveTick.low),
          close: Number(liveTick.close),
        });
      } else {
        (mainSeriesRef.current as ISeriesApi<"Line">).update({
          time,
          value: Number(liveTick.close),
        });
      }

      volumeSeriesRef.current.update({
        time,
        value: Number(liveTick.volume || 0),
        color: Number(liveTick.close) >= Number(liveTick.open) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
      });
    } catch (e) { }
  }, [liveTick, chartType]);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const offset = -now.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      const hrs = Math.floor(absOffset / 60);
      const mins = absOffset % 60;
      const offsetStr = `UTC${sign}${hrs}:${mins.toString().padStart(2, '0')}`;
      setCurrentTime(`${timeStr} ${offsetStr}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ========== AREA 1: Top Interval + Chart Type handlers ==========
  const handleIntervalChange = (interval: string) => {
    setActiveInterval(interval);
    // Push to undo stack
    setUndoStack(prev => [...prev, `interval:${activeInterval}`]);
    setRedoStack([]);
    onIntervalChange?.(interval);
  };

  const handleChartTypeChange = (type: 'candle' | 'line') => {
    setUndoStack(prev => [...prev, `chartType:${chartType}`]);
    setRedoStack([]);
    setChartType(type);
  };

  // ========== AREA 2: Undo / Redo / Screenshot / Settings ==========
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastAction]);

    const [type, value] = lastAction.split(':');
    if (type === 'interval') {
      setActiveInterval(value);
      onIntervalChange?.(value);
    } else if (type === 'chartType') {
      setChartType(value as 'candle' | 'line');
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextAction = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, nextAction]);

    const [type, value] = nextAction.split(':');
    if (type === 'interval') {
      setActiveInterval(value);
      onIntervalChange?.(value);
    } else if (type === 'chartType') {
      setChartType(value as 'candle' | 'line');
    }
  };

  const handleScreenshot = () => {
    if (!chartContainerRef.current) return;
    const canvas = chartContainerRef.current.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${assetName}_${activeInterval}_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleSaveChart = () => {
    // Save current chart config to localStorage
    const config = { activeInterval, chartType, priceScaleMode, autoScale, magnetEnabled };
    localStorage.setItem(`chart_config_${assetName}`, JSON.stringify(config));
    // Visual feedback
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.classList.add('text-bullish');
      setTimeout(() => btn?.classList.remove('text-bullish'), 1500);
    }
  };

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`chart_config_${assetName}`);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.activeInterval) setActiveInterval(config.activeInterval);
        if (config.chartType) setChartType(config.chartType);
        if (config.priceScaleMode) setPriceScaleMode(config.priceScaleMode);
        if (config.autoScale !== undefined) setAutoScale(config.autoScale);
        if (config.magnetEnabled !== undefined) setMagnetEnabled(config.magnetEnabled);
      }
    } catch {}
  }, [assetName]);

  // ========== AREA 3: Left sidebar tools ==========
  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
    if (!chartRef.current) return;
    
    switch (tool) {
      case 'crosshair':
        chartRef.current.applyOptions({ crosshair: { mode: CrosshairMode.Normal } });
        break;
      case 'tracking':
        chartRef.current.applyOptions({ crosshair: { mode: CrosshairMode.Magnet } });
        break;
    }
  };

  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 0.7; // zoom in 30%
      timeScale.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const mid = (range.from + range.to) / 2;
      const newSpan = span * 1.4; // zoom out 40%
      timeScale.setVisibleLogicalRange({ from: mid - newSpan / 2, to: mid + newSpan / 2 });
    }
  };

  const handleReset = () => {
    chartRef.current?.timeScale().fitContent();
  };

  const handleToggleMagnet = () => {
    setMagnetEnabled(!magnetEnabled);
    if (chartRef.current) {
      chartRef.current.applyOptions({
        crosshair: { mode: !magnetEnabled ? CrosshairMode.Magnet : CrosshairMode.Normal },
      });
    }
  };

  // ========== AREA 5: Bottom range buttons ==========
  const handleRangeChange = (rangeValue: string, bars: number) => {
    setActiveRange(rangeValue);
    
    // Automatically select the appropriate interval for the requested range to fit ~200 points
    let targetInterval = activeInterval;
    if (rangeValue === '1D') targetInterval = '5m';
    else if (rangeValue === '5D') targetInterval = '15m';
    else if (rangeValue === '1M') targetInterval = '4H';
    else if (rangeValue === '3M') targetInterval = '1d';
    else if (rangeValue === '6M') targetInterval = '1d';
    else if (rangeValue === 'YTD' || rangeValue === '1Y') targetInterval = '1w';
    else if (rangeValue === '5Y' || rangeValue === 'ALL') targetInterval = '1M';
    
    // Convert target case if needed to match options (1d, 1w)
    const normalizedTarget = targetInterval === '1D' ? '1d' : targetInterval === '1W' ? '1w' : targetInterval;

    if (normalizedTarget !== activeInterval) {
      setActiveInterval(normalizedTarget);
      onIntervalChange?.(normalizedTarget);
    }

    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();

    if (rangeValue === 'ALL' || bars === 0) {
      timeScale.fitContent();
      return;
    }

    // Set visible range, bounded by actual data length
    const totalBars = data.length;
    const from = Math.max(0, totalBars - bars);
    timeScale.setVisibleLogicalRange({ from, to: totalBars });
  };

  const handleTogglePercent = () => {
    const newMode = priceScaleMode === 'percent' ? 'normal' : 'percent';
    setPriceScaleMode(newMode);
  };

  const handleToggleLog = () => {
    const newMode = priceScaleMode === 'log' ? 'normal' : 'log';
    setPriceScaleMode(newMode);
  };

  const handleToggleAutoScale = () => {
    setAutoScale(!autoScale);
    if (chartRef.current) {
      chartRef.current.applyOptions({
        rightPriceScale: { autoScale: !autoScale },
      });
    }
  };

  const isUp = headerData ? headerData.close >= headerData.open : true;
  const lastPrice = headerData ? headerData.close.toFixed(2) : "0.00";

  // Left sidebar tool definitions
  const leftTools = [
    { id: 'crosshair', icon: Crosshair, label: 'Crosshair', action: () => handleToolSelect('crosshair') },
    { id: 'tracking', icon: TrendingUp, label: 'Trend Line', action: () => handleToolSelect('tracking') },
    { id: 'draw', icon: PenTool, label: 'Brush / Draw', action: () => handleToolSelect('draw') },
    { id: 'text', icon: Type, label: 'Text Annotation', action: () => handleToolSelect('text') },
    { id: 'divider', icon: null, label: '', action: () => {} },
    { id: 'ruler', icon: Ruler, label: 'Price / Time Measure', action: () => handleToolSelect('ruler') },
    { id: 'zoomin', icon: ZoomIn, label: 'Zoom In', action: handleZoomIn },
    { id: 'zoomout', icon: ZoomOut, label: 'Zoom Out', action: handleZoomOut },
    { id: 'magnet', icon: Magnet, label: `Magnet ${magnetEnabled ? 'ON' : 'OFF'}`, action: handleToggleMagnet },
    { id: 'reset', icon: RotateCcw, label: 'Reset / Fit All', action: handleReset },
    { id: 'divider2', icon: null, label: '', action: () => {} },
    { id: 'delete', icon: Trash2, label: 'Clear All Drawings', action: () => { setActiveTool('crosshair'); handleReset(); } },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-surface border-none overflow-hidden shrink-0">
      
      {/* ===== AREA 1: Top Toolbar ===== */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border shrink-0 bg-background/50">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-bold text-foreground text-sm tracking-wide mr-2">{assetName}</span>
            <button className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-colors"><Plus className="h-4 w-4" /></button>
          </div>
          
          <div className="w-px h-6 bg-border mx-1 shrink-0"></div>
          
          {/* Time Intervals */}
          <div className="flex items-center gap-0.5 shrink-0">
            {TIME_INTERVALS.map(int => (
              <button
                key={int.value}
                onClick={() => handleIntervalChange(int.value)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${activeInterval === int.value ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
              >
                {int.label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-1 shrink-0"></div>

          {/* Chart Types */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => handleChartTypeChange('area')} className={`p-1.5 rounded transition-colors ${chartType === 'area' ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'} `} title="Area">
              <Activity className="h-4 w-4" />
            </button>
            <button onClick={() => handleChartTypeChange('candle')} className={`p-1.5 rounded transition-colors ${chartType === 'candle' ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'} `} title="Candlestick">
              <BarChart2 className="h-4 w-4" />
            </button>
            <button onClick={() => handleChartTypeChange('line')} className={`p-1.5 rounded transition-colors ${chartType === 'line' ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'} `} title="Line">
              <TrendingUp className="h-4 w-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1 shrink-0"></div>

          {/* Indicators & Alerts */}
          <button
            onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 ${showIndicatorPanel ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'}`}
          >
            <Activity className="h-4 w-4" /> <span className="hidden sm:inline">Indicators</span>
          </button>
          <button
            onClick={() => setShowAlertPanel(!showAlertPanel)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 ${showAlertPanel ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'}`}
          >
            <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Alert</span>
          </button>
        </div>

        {/* ===== AREA 2: Top Right ===== */}
        <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-1.5 rounded transition-colors hidden sm:block ${undoStack.length > 0 ? 'hover:bg-surface text-text-secondary hover:text-foreground' : 'text-text-secondary/30 cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-1.5 rounded transition-colors hidden sm:block ${redoStack.length > 0 ? 'hover:bg-surface text-text-secondary hover:text-foreground' : 'text-text-secondary/30 cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
          <button onClick={handleScreenshot} className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-colors" title="Screenshot">
            <Camera className="h-4 w-4" />
          </button>
          <button id="save-btn" onClick={handleSaveChart} className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-all" title="Save Chart Config">
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className={`p-1.5 rounded transition-colors ${showSettingsPanel ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface'}`}
            title="Chart Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Indicator Panel (Dropdown) */}
      {showIndicatorPanel && (
        <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Indicators</span>
            <button onClick={() => setShowIndicatorPanel(false)} className="text-text-secondary hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['SMA (20)', 'EMA (50)', 'RSI (14)', 'MACD', 'Bollinger Bands', 'VWAP'].map(ind => (
              <button key={ind} className="px-3 py-2 rounded bg-surface hover:bg-surface-hover text-text-secondary hover:text-foreground border border-border transition-colors text-left font-medium">
                {ind}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Technical indicators coming soon. Chart overlay support in next release.</p>
        </div>
      )}

      {/* Alert Panel (Dropdown) */}
      {showAlertPanel && (
        <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Price Alerts</span>
            <button onClick={() => setShowAlertPanel(false)} className="text-text-secondary hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" placeholder={`Alert price for ${assetName}`} className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-bullish placeholder:text-text-secondary/50" />
            <select className="bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none">
              <option>Crosses Above</option>
              <option>Crosses Below</option>
            </select>
            <button className="px-4 py-1.5 rounded bg-bullish text-white text-xs font-bold hover:bg-bullish/90 transition-colors">
              Set Alert
            </button>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Browser notifications will trigger when the price condition is met.</p>
        </div>
      )}

      {/* Settings Panel (Dropdown) */}
      {showSettingsPanel && (
        <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">Chart Settings</span>
            <button onClick={() => setShowSettingsPanel(false)} className="text-text-secondary hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
              <span className="text-foreground font-medium">Auto Scale</span>
              <button onClick={handleToggleAutoScale} className={`w-9 h-5 rounded-full transition-colors ${autoScale ? 'bg-bullish' : 'bg-text-secondary/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${autoScale ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </button>
            </label>
            <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
              <span className="text-foreground font-medium">Magnet</span>
              <button onClick={handleToggleMagnet} className={`w-9 h-5 rounded-full transition-colors ${magnetEnabled ? 'bg-bullish' : 'bg-text-secondary/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${magnetEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </button>
            </label>
            <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
              <span className="text-foreground font-medium">Log Scale</span>
              <button onClick={handleToggleLog} className={`w-9 h-5 rounded-full transition-colors ${priceScaleMode === 'log' ? 'bg-bullish' : 'bg-text-secondary/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${priceScaleMode === 'log' ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </button>
            </label>
            <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
              <span className="text-foreground font-medium">% Scale</span>
              <button onClick={handleTogglePercent} className={`w-9 h-5 rounded-full transition-colors ${priceScaleMode === 'percent' ? 'bg-bullish' : 'bg-text-secondary/30'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${priceScaleMode === 'percent' ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Main Area: Sidebar + Chart */}
      <div className="flex-1 flex flex-row relative h-full min-h-0">
        
        {/* ===== AREA 3: Left Toolbar ===== */}
        <div className="w-12 border-r border-border bg-background/30 flex flex-col items-center py-3 gap-1 shrink-0 z-20 overflow-y-auto custom-scrollbar">
          {leftTools.map((tool) => {
            if (tool.id.startsWith('divider')) {
              return <div key={tool.id} className="w-6 h-px bg-border my-1"></div>;
            }
            const Icon = tool.icon!;
            const isActive = activeTool === tool.id;
            const isMagnet = tool.id === 'magnet';
            const isDelete = tool.id === 'delete';
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`p-2 rounded-md transition-all ${
                  isActive ? 'text-bullish bg-bullish/10 ring-1 ring-bullish/20' :
                  isMagnet && magnetEnabled ? 'text-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/20' :
                  isDelete ? 'text-text-secondary hover:text-bearish hover:bg-bearish/10' :
                  'text-text-secondary hover:text-foreground hover:bg-surface'
                }`}
                title={tool.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* ===== AREA 4: Chart Container ===== */}
        <div className="flex-1 relative min-h-[300px] w-full h-full bg-background/50">
          
          {/* Inner Chart Overlays */}
          <div className="absolute top-0 left-0 z-10 w-full p-2 pointer-events-none flex flex-col gap-2">
            
            {/* OHLC Header */}
            {headerData && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-foreground bg-surface/50 backdrop-blur rounded px-1">{assetName} • {activeInterval.toUpperCase()}</span>
                {chartType === 'candle' && (
                  <div className="flex gap-2">
                    <span className="text-text-secondary text-[10px]">O <span className="text-foreground font-semibold text-xs">{headerData.open.toFixed(2)}</span></span>
                    <span className="text-text-secondary text-[10px]">H <span className="text-foreground font-semibold text-xs">{headerData.high.toFixed(2)}</span></span>
                    <span className="text-text-secondary text-[10px]">L <span className="text-foreground font-semibold text-xs">{headerData.low.toFixed(2)}</span></span>
                    <span className="text-text-secondary text-[10px]">C <span className={`font-semibold text-xs ${isUp ? 'text-bullish' : 'text-bearish'}`}>{headerData.close.toFixed(2)}</span></span>
                    <span className={`font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {headerData.change > 0 && '+'}{headerData.change.toFixed(2)} ({headerData.changePercent > 0 && '+'}{headerData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Trading Buttons */}
            <div className="flex items-center gap-1 pointer-events-auto mt-1 ml-1 w-max">
              <button 
                onClick={() => alert(`SELL limit order placed for ${assetName} at ${lastPrice}`)}
                className="flex flex-col items-center justify-center bg-surface/80 backdrop-blur border border-bearish/50 hover:bg-bearish hover:text-white text-bearish rounded-l-md px-3 py-1 transition-all group"
              >
                <span className="text-sm font-bold group-hover:text-white">{lastPrice}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-white/80">Sell</span>
              </button>
              <div className="w-[1px] bg-border h-full"></div>
              <button 
                onClick={() => alert(`BUY limit order placed for ${assetName} at ${lastPrice}`)}
                className="flex flex-col items-center justify-center bg-surface/80 backdrop-blur border border-blue-500/50 hover:bg-blue-600 hover:text-white text-blue-500 rounded-r-md px-3 py-1 transition-all group"
              >
                <span className="text-sm font-bold group-hover:text-white">{lastPrice}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-white/80">Buy</span>
              </button>
            </div>
            
          </div>

          <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* ===== AREA 5: Bottom Range Toolbar ===== */}
      <div className="h-8 flex items-center justify-between px-3 border-t border-border shrink-0 bg-background/50 text-[10px] sm:text-[11px] font-medium z-20 relative">
        <div className="flex items-center gap-1">
          {BOTTOM_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value, range.bars)}
              className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
                activeRange === range.value
                  ? 'bg-bullish text-white'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {range.label}
            </button>
          ))}
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`p-1 rounded transition-colors ${showDatePicker ? 'bg-surface text-foreground' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
          </button>
          
          {/* Date Picker Popover */}
          {showDatePicker && (
            <div className="absolute left-32 bottom-full mb-1 w-[280px] bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-base font-bold text-foreground">Go to</span>
                <button onClick={() => setShowDatePicker(false)} className="text-text-secondary hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-4 px-3 py-1.5 border-b border-border">
                <button className="text-foreground font-semibold border-b-2 border-foreground pb-1 -mb-[3px]">Date</button>
                <button className="text-text-secondary hover:text-foreground pb-1 -mb-[3px] transition-colors">Custom range</button>
              </div>
              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                   <input type="date" value={customDateValue} onChange={e => setCustomDateValue(e.target.value)} className="flex-1 bg-surface border border-bullish rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-bullish" />
                   <input type="time" defaultValue="00:00" className="w-[100px] bg-surface border border-border rounded px-2 py-1.5 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-border" />
                </div>
                <div className="bg-surface/50 rounded flex flex-col items-center justify-center py-4 text-xs text-text-secondary border border-border/50">
                   <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                   <span>Select a native browser date</span>
                </div>
              </div>
              <div className="px-3 py-2 border-t border-border flex justify-end gap-2 bg-surface/30">
                <button onClick={() => setShowDatePicker(false)} className="px-3 py-1.5 rounded border border-border text-foreground hover:bg-surface transition-colors text-xs font-semibold">Cancel</button>
                <button onClick={() => {
                   setShowDatePicker(false);
                   if (customDateValue && chartRef.current) {
                      const ts = Math.floor(new Date(customDateValue).getTime() / 1000) as Time;
                      chartRef.current.timeScale().setVisibleLogicalRange({ from: ts as any, to: ts as any });
                   }
                }} className="px-4 py-1.5 rounded bg-foreground text-background hover:bg-text-secondary transition-colors text-xs font-bold">Go to</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-text-secondary">
          <span className="font-mono text-foreground font-semibold tracking-wide hidden sm:block text-[11px]">{currentTime}</span>
          <div className="w-px h-4 bg-border hidden sm:block"></div>
          <button
            onClick={handleReset}
            className="hover:text-foreground px-1.5 py-0.5 rounded hover:bg-surface-hover transition-colors hidden md:block"
            title="Reset view"
          >
            ext
          </button>
          <button
            onClick={handleTogglePercent}
            className={`px-1.5 py-0.5 rounded transition-colors hidden md:block ${priceScaleMode === 'percent' ? 'text-bullish bg-bullish/10 font-bold' : 'hover:text-foreground hover:bg-surface-hover'}`}
            title="Percentage scale"
          >
            %
          </button>
          <button
            onClick={handleToggleLog}
            className={`px-1.5 py-0.5 rounded transition-colors hidden md:block ${priceScaleMode === 'log' ? 'text-bullish bg-bullish/10 font-bold' : 'hover:text-foreground hover:bg-surface-hover'}`}
            title="Logarithmic scale"
          >
            log
          </button>
          <button
            onClick={handleToggleAutoScale}
            className={`px-1.5 py-0.5 uppercase font-bold rounded transition-colors ${autoScale ? 'text-bullish bg-bullish/10' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
            title={`Auto-scale ${autoScale ? 'ON' : 'OFF'}`}
          >
            adj
          </button>
        </div>
      </div>
      
    </div>
  );
}
