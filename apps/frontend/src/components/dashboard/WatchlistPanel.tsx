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
      <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
        <button className="font-bold text-sm text-foreground flex items-center gap-1 hover:bg-surface-hover px-1.5 py-0.5 rounded transition-colors">
          Watchlist
          <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="text-text-secondary hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-surface-hover" title="Add symbol">
            <Plus className="h-4 w-4" />
          </button>
          <button className="text-text-secondary hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-surface-hover">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="12" height="10" rx="2"/><path d="M7 4v10M11 4v10"/></svg>
          </button>
          <button className="text-text-secondary hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-surface-hover">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4.5" cy="9" r="1"/><circle cx="9" cy="9" r="1"/><circle cx="13.5" cy="9" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* Column Header */}
      <div className="grid grid-cols-[14fr_10fr_8fr_9fr] gap-1 px-4 py-1.5 text-[11px] text-text-secondary border-b border-border/50 shrink-0">
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
                className="flex items-center gap-1.5 w-full px-4 py-2 text-[11px] text-text-secondary hover:text-foreground hover:bg-background/50 transition-colors uppercase"
              >
                {cat.isOpen 
                  ? <ChevronDown className="h-3.5 w-3.5" /> 
                  : <ChevronRight className="h-3.5 w-3.5" />
                }
                {cat.label}
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
                    className={`grid grid-cols-[14fr_10fr_8fr_9fr] items-center gap-1 w-full px-4 py-1 text-xs transition-colors ${
                      isSelected 
                        ? 'bg-surface-hover border-border' 
                        : 'hover:bg-background/50 border-transparent'
                    } border-t border-b border-transparent hover:border-border`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", asset.assetId);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    {/* Symbol & Logo */}
                    <div className="flex items-center gap-2 text-left min-w-0 pr-1">
                      <div className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-foreground text-background'}`}>
                        {asset.symbol.substring(0, 2)}
                      </div>
                      <div className="flex items-baseline gap-1 truncate">
                        <span className="font-bold text-foreground text-[12px]">{asset.symbol}</span>
                        <span className="text-[10px] text-text-secondary/70 font-black">•</span>
                      </div>
                    </div>

                    {/* Last price */}
                    <div className="text-right text-[12px] font-medium text-foreground">
                      {formattedPrice}
                    </div>

                    {/* Change */}
                    <div className={`text-right text-[12px] ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {change !== 0 ? (change > 0 ? '+' : '') + change.toFixed(1) : '—'}
                    </div>

                    {/* Change % */}
                    <div className={`text-right text-[12px] font-medium tracking-tight ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
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
