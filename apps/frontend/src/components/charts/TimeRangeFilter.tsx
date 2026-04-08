"use client";

import { memo, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { TIME_RANGES } from './chartConfig';

interface TimeRangeFilterProps {
  activeRange: string;
  currentTime: string;
  priceScaleMode: 'normal' | 'percent' | 'log';
  autoScale: boolean;
  onRangeChange: (range: string, days: number) => void;
  onTogglePercent: () => void;
  onToggleLog: () => void;
  onToggleAutoScale: () => void;
  onReset: () => void;
}

export const TimeRangeFilter = memo(function TimeRangeFilter({
  activeRange,
  currentTime,
  priceScaleMode,
  autoScale,
  onRangeChange,
  onTogglePercent,
  onToggleLog,
  onToggleAutoScale,
  onReset,
}: TimeRangeFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateValue, setCustomDateValue] = useState('');

  return (
    <div className="h-8 flex items-center justify-between px-3 border-t border-border shrink-0 bg-background/50 text-[10px] sm:text-[11px] font-medium z-20 relative">
      <div className="flex items-center gap-1">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value, range.days)}
            className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
              activeRange === range.value
                ? 'bg-bullish text-white'
                : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            {range.label}
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-1" />

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`p-1 rounded transition-colors ${
            showDatePicker
              ? 'bg-surface text-foreground'
              : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
        </button>

        {/* Date Picker Popover */}
        {showDatePicker && (
          <div className="absolute left-32 bottom-full mb-1 w-[280px] bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-base font-bold text-foreground">Go to</span>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-text-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 px-3 py-1.5 border-b border-border">
              <button className="text-foreground font-semibold border-b-2 border-foreground pb-1 -mb-[3px]">
                Date
              </button>
              <button className="text-text-secondary hover:text-foreground pb-1 -mb-[3px] transition-colors">
                Custom range
              </button>
            </div>
            <div className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateValue}
                  onChange={(e) => setCustomDateValue(e.target.value)}
                  className="flex-1 bg-surface border border-bullish rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-bullish"
                />
                <input
                  type="time"
                  defaultValue="00:00"
                  className="w-[100px] bg-surface border border-border rounded px-2 py-1.5 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-border"
                />
              </div>
              <div className="bg-surface/50 rounded flex flex-col items-center justify-center py-4 text-xs text-text-secondary border border-border/50">
                <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                <span>Select a native browser date</span>
              </div>
            </div>
            <div className="px-3 py-2 border-t border-border flex justify-end gap-2 bg-surface/30">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-3 py-1.5 rounded border border-border text-foreground hover:bg-surface transition-colors text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-1.5 rounded bg-foreground text-background hover:bg-text-secondary transition-colors text-xs font-bold"
              >
                Go to
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 text-text-secondary">
        <span className="font-mono text-foreground font-semibold tracking-wide hidden sm:block text-[11px]">
          {currentTime}
        </span>
        <div className="w-px h-4 bg-border hidden sm:block" />
        
        <button
          onClick={onReset}
          className="hover:text-foreground px-1.5 py-0.5 rounded hover:bg-surface-hover transition-colors hidden md:block"
          title="Reset view"
        >
          ext
        </button>
        
        <button
          onClick={onTogglePercent}
          className={`px-1.5 py-0.5 rounded transition-colors hidden md:block ${
            priceScaleMode === 'percent'
              ? 'text-bullish bg-bullish/10 font-bold'
              : 'hover:text-foreground hover:bg-surface-hover'
          }`}
          title="Percentage scale"
        >
          %
        </button>
        
        <button
          onClick={onToggleLog}
          className={`px-1.5 py-0.5 rounded transition-colors hidden md:block ${
            priceScaleMode === 'log'
              ? 'text-bullish bg-bullish/10 font-bold'
              : 'hover:text-foreground hover:bg-surface-hover'
          }`}
          title="Logarithmic scale"
        >
          log
        </button>
        
        <button
          onClick={onToggleAutoScale}
          className={`px-1.5 py-0.5 uppercase font-bold rounded transition-colors ${
            autoScale
              ? 'text-bullish bg-bullish/10'
              : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
          }`}
          title={`Auto-scale ${autoScale ? 'ON' : 'OFF'}`}
        >
          adj
        </button>
      </div>
    </div>
  );
});
