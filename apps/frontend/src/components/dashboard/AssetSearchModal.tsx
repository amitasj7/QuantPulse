"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { useMarketStore } from "@/stores/useMarketStore";
import { useUIStore } from "@/stores/useUIStore";

export function AssetSearchModal() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const { commodities, solarAssets, liveTicks, setSelectedAssetId } = useMarketStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Group all assets for search
  const allAssets = useMemo(() => {
    return Object.values({ ...commodities, ...solarAssets });
  }, [commodities, solarAssets]);

  // Filter based on query
  const filteredAssets = useMemo(() => {
    if (!query.trim()) return allAssets.slice(0, 15); // Show top 15 by default
    const q = query.toLowerCase();
    
    return allAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        (asset.symbol && asset.symbol.toLowerCase().includes(q)) ||
        (asset.category && asset.category.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [allAssets, query]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isSearchOpen]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setSearchOpen(false)}
      />

      {/* Modal / Command Palette */}
      <div className="bg-surface border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Input */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-background/50">
          <Search className="h-5 w-5 text-text-secondary mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-text-secondary text-base sm:text-lg"
            placeholder="Search symbols, commodities, or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setSearchOpen(false)}
            className="p-1.5 ml-2 hover:bg-border rounded-md text-text-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {filteredAssets.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredAssets.map((asset) => {
                const live = liveTicks[asset.assetId];
                const change = live?.percentChange || 0;
                const isUp = change >= 0;

                return (
                  <button
                    key={asset.assetId}
                    className="flex w-full items-center justify-between p-3 rounded-lg hover:bg-background transition-colors border border-transparent hover:border-border text-left group"
                    onClick={() => {
                      setSelectedAssetId(asset.assetId);
                      setSearchOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-lg bg-surface border border-border group-hover:bg-bullish/10 group-hover:border-bullish/30 transition-colors ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                        <TrendingUp className={`h-5 w-5 ${isUp ? '' : 'rotate-180'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{asset.symbol || asset.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary uppercase">{asset.exchange}</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">{asset.name} • {asset.category}</div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className="font-mono font-medium text-foreground">
                        {live 
                          ? (live.priceINR > 0 ? `₹${live.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `$${live.priceUSD.toFixed(3)}`) 
                          : '---'}
                      </span>
                      {live && (
                        <span className={`text-xs font-mono font-semibold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                          {change > 0 && '+'}{change.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-text-secondary">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-base font-medium">No assets found</p>
              <p className="text-xs mt-1">Try searching for "Gold", "Solar", or "ENERGY".</p>
            </div>
          )}
        </div>
        
        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-border bg-background/50 text-[10px] text-text-secondary flex justify-between items-center">
          <span>Navigate using <kbd className="border border-border rounded px-1 ml-1 bg-surface font-sans">↑</kbd> <kbd className="border border-border rounded px-1 bg-surface font-sans">↓</kbd></span>
          <span><kbd className="border border-border rounded px-1.5 py-0.5 bg-surface font-sans">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
