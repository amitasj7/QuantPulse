"use client";

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries } from 'lightweight-charts';
import { NormalizedTick } from '@quantpulse/shared';

interface TradingChartProps {
  data: NormalizedTick[];
  liveTick?: NormalizedTick;
  assetName: string;
}

export function TradingChart({ data, liveTick, assetName }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Setup the chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94A3B8', // text-slate-400
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#0ECB81', style: 3 },
        horzLine: { width: 1, color: '#0ECB81', style: 3 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // 2. Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', // emerald-500
      downColor: '#F43F5E', // rose-500
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
    });

    seriesRef.current = candleSeries;

    // 3. Transform Initial Data
    if (data && data.length > 0) {
      // Sort in ascending order internally for TradingView
      const formattedData = [...data].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(t => ({
        time: (new Date(t.timestamp).getTime() / 1000) as Time,
        open: t.open,
        high: t.high,
        low: t.low,
        close: t.close,
      }));
      
      // Remove possible duplicates by using a Set/Map logic if needed, but assuming data is clean
      // TradingView strict mode: time must be strictly increasing. 
      // Filter out duplicate identical timestamps
      const uniqueData = Array.from(new Map(formattedData.map(item => [item.time, item])).values());

      candleSeries.setData(uniqueData);
    }

    // Cleanup
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
      seriesRef.current = null;
    };
  }, [data]); // Re-create chart only when massive history loads

  // 4. Handle Live Updates Effect
  useEffect(() => {
    if (!seriesRef.current || !liveTick) return;

    // Convert live tick into TV format
    const tvTick = {
      time: (new Date(liveTick.timestamp).getTime() / 1000) as Time,
      open: liveTick.open,
      high: liveTick.high,
      low: liveTick.low,
      close: liveTick.close,
    };

    // Update the last candle or add a new one magically
    try {
      seriesRef.current.update(tvTick);
    } catch(e) {
      console.warn("TradingView update skip (timestamp mismatch)", e);
    }
  }, [liveTick]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full absolute inset-0" 
      />
    </div>
  );
}
