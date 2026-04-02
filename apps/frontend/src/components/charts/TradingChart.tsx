"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, HistogramSeries, ColorType } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';

interface TradingChartProps {
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
  onIntervalChange?: (interval: string) => void;
}

const TIME_INTERVALS = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'Max', value: 'max' },
];

export function TradingChart({ data, liveTick, assetName, onIntervalChange }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [activeInterval, setActiveInterval] = useState('1m');

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

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94A3B8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#0ECB81', style: 3, labelBackgroundColor: '#0ECB81' },
        horzLine: { width: 1, color: '#0ECB81', style: 3, labelBackgroundColor: '#0ECB81' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
        borderColor: isDark ? '#1E293B' : '#E2E8F0',
      },
      rightPriceScale: {
        borderVisible: false,
        borderColor: isDark ? '#1E293B' : '#E2E8F0',
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
    });
    candleSeriesRef.current = candleSeries;

    // Volume histogram series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Set data
    if (data && data.length > 0) {
      const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const validData = sortedData.filter(t => !isNaN(new Date(t.timestamp).getTime()));

      const candleData = validData.map(t => ({
        time: Math.floor(new Date(t.timestamp).getTime() / 1000) as Time,
        open: Number(t.open),
        high: Number(t.high),
        low: Number(t.low),
        close: Number(t.close),
      }));

      const volumeData = validData.map(t => ({
        time: Math.floor(new Date(t.timestamp).getTime() / 1000) as Time,
        value: Number(t.volume || 0),
        color: Number(t.close) >= Number(t.open) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
      }));

      // Deduplicate
      const uniqueCandle = Array.from(new Map(candleData.map(item => [item.time, item])).values());
      const uniqueVolume = Array.from(new Map(volumeData.map(item => [item.time, item])).values());

      candleSeries.setData(uniqueCandle);
      volumeSeries.setData(uniqueVolume);
    }

    // Crosshair move handler for OHLC updates
    chart.subscribeCrosshairMove((param) => {
      if (param.seriesData && param.seriesData.size > 0) {
        const candlePoint = param.seriesData.get(candleSeries) as any;
        if (candlePoint) {
          const change = candlePoint.close - candlePoint.open;
          const changePercent = candlePoint.open !== 0 ? (change / candlePoint.open) * 100 : 0;
          setHeaderData({
            open: candlePoint.open,
            high: candlePoint.high,
            low: candlePoint.low,
            close: candlePoint.close,
            change,
            changePercent,
          });
        }
      }
    });

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
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [data]);

  // Live tick updates
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !liveTick) return;

    const time = Math.floor(new Date(liveTick.timestamp).getTime() / 1000) as Time;
    
    try {
      candleSeriesRef.current.update({
        time,
        open: Number(liveTick.open),
        high: Number(liveTick.high),
        low: Number(liveTick.low),
        close: Number(liveTick.close),
      });
      volumeSeriesRef.current.update({
        time,
        value: Number(liveTick.volume || 0),
        color: Number(liveTick.close) >= Number(liveTick.open) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
      });
    } catch (e) {
      // Ignore timestamp ordering issues
    }
  }, [liveTick]);

  const handleIntervalChange = (interval: string) => {
    setActiveInterval(interval);
    onIntervalChange?.(interval);
  };

  const isUp = headerData ? headerData.close >= headerData.open : true;

  return (
    <div className="w-full h-full flex flex-col">
      {/* OHLC Header Bar */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs font-mono border-b border-border/50 overflow-x-auto shrink-0">
        <span className="font-bold text-foreground text-sm whitespace-nowrap">{assetName}</span>
        {headerData && (
          <>
            <span className="text-text-secondary whitespace-nowrap">O <span className="text-foreground">{headerData.open.toFixed(2)}</span></span>
            <span className="text-text-secondary whitespace-nowrap">H <span className="text-foreground">{headerData.high.toFixed(2)}</span></span>
            <span className="text-text-secondary whitespace-nowrap">L <span className="text-foreground">{headerData.low.toFixed(2)}</span></span>
            <span className="text-text-secondary whitespace-nowrap">C <span className={isUp ? 'text-bullish' : 'text-bearish'}>{headerData.close.toFixed(2)}</span></span>
            <span className={`whitespace-nowrap font-semibold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
              {headerData.change > 0 && '+'}{headerData.change.toFixed(2)} ({headerData.changePercent > 0 && '+'}{headerData.changePercent.toFixed(2)}%)
            </span>
          </>
        )}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative min-h-[300px] w-full h-full">
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Time Interval Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-border/50 shrink-0">
        {TIME_INTERVALS.map((interval) => (
          <button
            key={interval.value}
            onClick={() => handleIntervalChange(interval.value)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeInterval === interval.value
                ? 'bg-bullish text-white'
                : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            {interval.label}
          </button>
        ))}
      </div>
    </div>
  );
}
