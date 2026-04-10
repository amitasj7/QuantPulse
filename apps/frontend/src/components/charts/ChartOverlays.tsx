"use client";

import { memo } from 'react';
import { OHLCData } from './chartTypes';
import { ChartType } from './chartConfig';

interface ChartOverlaysProps {
  assetName: string;
  activeInterval: string;
  chartType: ChartType;
  headerData: OHLCData | null;
  lastPrice: string;
  onBuy: () => void;
  onSell: () => void;
}

export const ChartOverlays = memo(function ChartOverlays({
  assetName,
  activeInterval,
  chartType,
  headerData,
  lastPrice,
  onBuy,
  onSell,
}: ChartOverlaysProps) {
  const isUp = headerData ? headerData.close >= headerData.open : true;

  return (
    <div className="absolute top-0 left-0 z-10 w-full p-2 pointer-events-none flex flex-col gap-2">
      {/* OHLC Header */}
      {headerData && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold text-foreground bg-surface/50 backdrop-blur rounded px-1">
            {assetName} • {activeInterval.toUpperCase()}
          </span>
          {chartType === 'candle' && (
            <div className="flex gap-2">
              <span className="text-text-secondary text-[10px]">
                O <span className="text-foreground font-semibold text-xs">{headerData.open != null ? Number(headerData.open).toFixed(2) : '0.00'}</span>
              </span>
              <span className="text-text-secondary text-[10px]">
                H <span className="text-foreground font-semibold text-xs">{headerData.high != null ? Number(headerData.high).toFixed(2) : '0.00'}</span>
              </span>
              <span className="text-text-secondary text-[10px]">
                L <span className="text-foreground font-semibold text-xs">{headerData.low != null ? Number(headerData.low).toFixed(2) : '0.00'}</span>
              </span>
              <span className="text-text-secondary text-[10px]">
                C{' '}
                <span className={`font-semibold text-xs ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                  {headerData.close != null ? Number(headerData.close).toFixed(2) : '0.00'}
                </span>
              </span>
              <span className={`font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                {headerData.change > 0 && '+'}
                {headerData.change != null ? Number(headerData.change).toFixed(2) : '0.00'} ({headerData.changePercent > 0 && '+'}
                {headerData.changePercent != null ? Number(headerData.changePercent).toFixed(2) : '0.00'}%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Trading Buttons */}
      <div className="flex items-center gap-1 pointer-events-auto mt-1 ml-1 w-max">
        <button
          onClick={onSell}
          className="flex flex-col items-center justify-center bg-surface/80 backdrop-blur border border-bearish/50 hover:bg-bearish hover:text-white text-bearish rounded-l-md px-3 py-1 transition-all group"
        >
          <span className="text-sm font-bold group-hover:text-white">{lastPrice}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-white/80">Sell</span>
        </button>
        <div className="w-[1px] bg-border h-full" />
        <button
          onClick={onBuy}
          className="flex flex-col items-center justify-center bg-surface/80 backdrop-blur border border-blue-500/50 hover:bg-blue-600 hover:text-white text-blue-500 rounded-r-md px-3 py-1 transition-all group"
        >
          <span className="text-sm font-bold group-hover:text-white">{lastPrice}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-white/80">Buy</span>
        </button>
      </div>
    </div>
  );
});
