"use client";

import { memo } from 'react';
import { Plus, BarChart2, Activity, Bell, TrendingUp } from 'lucide-react';
import { TIME_INTERVALS, ChartType } from './chartConfig';

interface ChartToolbarProps {
  assetName: string;
  activeInterval: string;
  chartType: ChartType;
  showIndicatorPanel: boolean;
  showAlertPanel: boolean;
  onIntervalChange: (interval: string) => void;
  onChartTypeChange: (type: ChartType) => void;
  onToggleIndicatorPanel: () => void;
  onToggleAlertPanel: () => void;
  children?: React.ReactNode;
}

export const ChartToolbar = memo(function ChartToolbar({
  assetName,
  activeInterval,
  chartType,
  showIndicatorPanel,
  showAlertPanel,
  onIntervalChange,
  onChartTypeChange,
  onToggleIndicatorPanel,
  onToggleAlertPanel,
  children,
}: ChartToolbarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-3 border-b border-border shrink-0 bg-background/50">
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
        {/* Asset Name */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-bold text-foreground text-sm tracking-wide mr-2">
            {assetName}
          </span>
          <button className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-foreground transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Time Intervals */}
        <div className="flex items-center gap-0.5 shrink-0">
          {TIME_INTERVALS.map((int) => (
            <button
              key={int.value}
              onClick={() => onIntervalChange(int.value)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                activeInterval === int.value
                  ? 'text-bullish bg-bullish/10'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {int.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Chart Types */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onChartTypeChange('area')}
            className={`p-1.5 rounded transition-colors ${
              chartType === 'area'
                ? 'text-bullish bg-bullish/10'
                : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
            title="Area"
          >
            <Activity className="h-4 w-4" />
          </button>
          <button
            onClick={() => onChartTypeChange('candle')}
            className={`p-1.5 rounded transition-colors ${
              chartType === 'candle'
                ? 'text-bullish bg-bullish/10'
                : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
            title="Candlestick"
          >
            <BarChart2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onChartTypeChange('line')}
            className={`p-1.5 rounded transition-colors ${
              chartType === 'line'
                ? 'text-bullish bg-bullish/10'
                : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
            title="Line"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border mx-1 shrink-0" />

        {/* Indicators & Alerts */}
        <button
          onClick={onToggleIndicatorPanel}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 ${
            showIndicatorPanel
              ? 'text-bullish bg-bullish/10'
              : 'text-text-secondary hover:text-foreground hover:bg-surface'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Indicators</span>
        </button>
        <button
          onClick={onToggleAlertPanel}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 ${
            showAlertPanel
              ? 'text-bullish bg-bullish/10'
              : 'text-text-secondary hover:text-foreground hover:bg-surface'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Alert</span>
        </button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
        {children}
      </div>
    </div>
  );
});
