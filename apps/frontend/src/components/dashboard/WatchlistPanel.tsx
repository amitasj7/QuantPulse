"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Star, Plus } from "lucide-react";
import { useMarketStore } from "@/stores/useMarketStore";
import { useUIStore } from "@/stores/useUIStore";

interface WatchlistCategory {
  label: string;
  key: string;
  isOpen: boolean;
}

export function WatchlistPanel() {
  const { commodities, solarAssets, liveTicks, selectedAssetId, setSelectedAssetId } = useMarketStore();
  const setSearchOpen = useUIStore(state => state.setSearchOpen);

  const [categories, setCategories] = useState<WatchlistCategory[]>([
    { label: 'Metals', key: 'METAL', isOpen: true },
    { label: 'Energy', key: 'ENERGY', isOpen: true },
    { label: 'Industrial', key: 'INDUSTRIAL', isOpen: false },
    { label: 'Solar', key: 'SOLAR', isOpen: false },
  ]);

  const toggleCategory = (key: string) => {
    setCategories(prev => prev.map(c => 
      c.key === key ? { ...c, isOpen: !c.isOpen } : c
    ));
  };

  // Group all assets by category
  const allAssets = useMemo(() => {
    const combined = { ...commodities, ...solarAssets };
    return Object.values(combined);
  }, [commodities, solarAssets]);

  const getAssetsByCategory = (categoryKey: string) => {
    return allAssets.filter(a => a.category === categoryKey);
  };

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border overflow-hidden">
      {/* Watchlist Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <Star className="h-4 w-4 text-bullish" />
          Watchlist
        </h3>
        <button 
          onClick={() => setSearchOpen(true)}
          className="text-text-secondary hover:text-foreground transition-colors hover:bg-background/50 p-1 rounded-md" 
          title="Add symbol"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Column Header */}
      <div className="grid grid-cols-[16fr_12fr_9fr_11fr] gap-1 px-4 py-2 text-[10px] uppercase tracking-wider text-text-secondary font-semibold border-b border-border/50 shrink-0">
        <span>Symbol</span>
        <span className="text-right">Last</span>
        <span className="text-right">Chg</span>
        <span className="text-right">Chg%</span>
      </div>

      {/* Scrollable Category Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {categories.map((cat) => {
          const assets = getAssetsByCategory(cat.key);
          if (assets.length === 0) return null;

          return (
            <div key={cat.key}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex items-center gap-1.5 w-full px-4 py-2 text-xs font-bold text-text-secondary hover:text-foreground hover:bg-background/50 transition-colors uppercase tracking-wider"
              >
                {cat.isOpen 
                  ? <ChevronDown className="h-3 w-3" /> 
                  : <ChevronRight className="h-3 w-3" />
                }
                {cat.label}
                <span className="ml-auto text-[10px] text-text-secondary/60 font-normal">{assets.length}</span>
              </button>

              {/* Asset Rows */}
              {cat.isOpen && assets.map((asset) => {
                const tick = liveTicks[asset.assetId];
                const isSelected = asset.assetId === selectedAssetId;
                
                const price = tick 
                  ? (tick.priceINR > 0 ? tick.priceINR : tick.priceUSD) 
                  : 0;
                const change = tick ? (tick.close - tick.open) : 0;
                const changePercent = tick ? tick.percentChange : 0;
                const isUp = changePercent >= 0;

                // Format price for display
                const formattedPrice = tick
                  ? (tick.priceINR > 0 
                      ? tick.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      : tick.priceUSD.toFixed(3))
                  : '—';

                return (
                  <button
                    key={asset.assetId}
                    onClick={() => setSelectedAssetId(asset.assetId)}
                    className={`grid grid-cols-[16fr_12fr_9fr_11fr] gap-1 w-full px-4 py-2 text-xs transition-colors ${
                      isSelected 
                        ? 'bg-bullish/10 border-l-2 border-bullish' 
                        : 'hover:bg-background/50 border-l-2 border-transparent'
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", asset.assetId);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    {/* Symbol & name */}
                    <div className="text-left min-w-0 pr-1">
                      <div className="font-bold text-foreground truncate">{asset.symbol}</div>
                      <div className="text-[10px] text-text-secondary truncate">{asset.name}</div>
                    </div>

                    {/* Last price */}
                    <div className={`text-right font-mono font-medium ${isUp ? 'text-foreground' : 'text-foreground'}`}>
                      {formattedPrice}
                    </div>

                    {/* Change */}
                    <div className={`text-right font-mono text-[11px] ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {change !== 0 ? (change > 0 ? '+' : '') + change.toFixed(1) : '—'}
                    </div>

                    {/* Change % */}
                    <div className={`text-right font-mono text-[11px] font-semibold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {changePercent !== 0 ? (changePercent > 0 ? '+' : '') + changePercent.toFixed(2) + '%' : '—'}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
