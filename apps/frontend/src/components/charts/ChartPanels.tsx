"use client";

import { memo } from 'react';
import { X, Activity, Bell } from 'lucide-react';

// Indicator Panel
interface IndicatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndicatorPanel = memo(function IndicatorPanel({ isOpen, onClose }: IndicatorPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">Indicators</span>
        <button onClick={onClose} className="text-text-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {['SMA (20)', 'EMA (50)', 'RSI (14)', 'MACD', 'Bollinger Bands', 'VWAP'].map((ind) => (
          <button
            key={ind}
            className="px-3 py-2 rounded bg-surface hover:bg-surface-hover text-text-secondary hover:text-foreground border border-border transition-colors text-left font-medium"
          >
            {ind}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-text-secondary mt-2">
        Technical indicators coming soon. Chart overlay support in next release.
      </p>
    </div>
  );
});

// Alert Panel
interface AlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
}

export const AlertPanel = memo(function AlertPanel({ isOpen, onClose, assetName }: AlertPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">Price Alerts</span>
        <button onClick={onClose} className="text-text-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={`Alert price for ${assetName}`}
          className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-bullish placeholder:text-text-secondary/50"
        />
        <select className="bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none">
          <option>Crosses Above</option>
          <option>Crosses Below</option>
        </select>
        <button className="px-4 py-1.5 rounded bg-bullish text-white text-xs font-bold hover:bg-bullish/90 transition-colors">
          Set Alert
        </button>
      </div>
      <p className="text-[10px] text-text-secondary mt-2">
        Browser notifications will trigger when the price condition is met.
      </p>
    </div>
  );
});

// Settings Panel
interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoScale: boolean;
  magnetEnabled: boolean;
  priceScaleMode: 'normal' | 'percent' | 'log';
  onToggleAutoScale: () => void;
  onToggleMagnet: () => void;
  onToggleLog: () => void;
  onTogglePercent: () => void;
}

export const SettingsPanel = memo(function SettingsPanel({
  isOpen,
  onClose,
  autoScale,
  magnetEnabled,
  priceScaleMode,
  onToggleAutoScale,
  onToggleMagnet,
  onToggleLog,
  onTogglePercent,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur px-4 py-3 z-30 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-foreground">Chart Settings</span>
        <button onClick={onClose} className="text-text-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
          <span className="text-foreground font-medium">Auto Scale</span>
          <button
            onClick={onToggleAutoScale}
            className={`w-9 h-5 rounded-full transition-colors ${autoScale ? 'bg-bullish' : 'bg-text-secondary/30'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${autoScale ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
          <span className="text-foreground font-medium">Magnet</span>
          <button
            onClick={onToggleMagnet}
            className={`w-9 h-5 rounded-full transition-colors ${magnetEnabled ? 'bg-bullish' : 'bg-text-secondary/30'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${magnetEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
          <span className="text-foreground font-medium">Log Scale</span>
          <button
            onClick={onToggleLog}
            className={`w-9 h-5 rounded-full transition-colors ${priceScaleMode === 'log' ? 'bg-bullish' : 'bg-text-secondary/30'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${priceScaleMode === 'log' ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border">
          <span className="text-foreground font-medium">% Scale</span>
          <button
            onClick={onTogglePercent}
            className={`w-9 h-5 rounded-full transition-colors ${priceScaleMode === 'percent' ? 'bg-bullish' : 'bg-text-secondary/30'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${priceScaleMode === 'percent' ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </label>
      </div>
    </div>
  );
});
