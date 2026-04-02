"use client";

import { useMarketStore } from "@/stores/useMarketStore";

export function TickerTape() {
  const { liveTicks, commodities, solarAssets } = useMarketStore();
  
  // Transform map into array of strings for ticker
  const items = Object.values(liveTicks)
    .filter(tick => tick && tick.assetId && tick.assetId !== 'undefined' && String(tick.assetId).trim() !== '')
    .map(tick => {
    const meta = commodities[tick.assetId] || solarAssets[tick.assetId] || ({} as any);
    // Format fallback name: MCX_GOLD → Gold, SOLAR_MODULE_WATT → Solar Module Watt
    const fallbackName = String(tick.assetId)
      .replace(/^MCX_/, '')
      .replace(/^SOLAR_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const resolvedName = (meta.name && String(meta.name).trim()) || fallbackName;
    
    return {
      assetId: tick.assetId,
      name: resolvedName || 'Unknown',
      symbol: meta.symbol || 'N/A',
      unit: meta.unit || 'Contract',
      category: meta.category || 'Commodity',
      exchange: meta.exchange || 'LIVE',
      price: tick.priceINR > 0 ? `₹${tick.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `$${tick.priceUSD.toFixed(3)}`,
      change: `${tick.percentChange > 0 ? '+' : ''}${tick.percentChange.toFixed(2)}%`,
      up: tick.percentChange >= 0,
    };
  });

  if (items.length === 0) return <div className="h-10 w-full bg-slate-900 border-b border-border" />;

  return (
    <div className="group/tape w-full bg-background border-b border-border overflow-visible flex h-10 items-center text-xs sm:text-sm font-medium shrink-0 z-[60] relative">
      <div className="flex animate-ticker group-hover/tape:[animation-play-state:paused] whitespace-nowrap min-w-max h-full">
        {/* Render items multiple times for seamless loop */}
        {[...items, ...items, ...items].map((item, i) => (
          <div 
            key={`${item.assetId}-${i}`} 
            className="group/item relative flex items-center gap-2 px-6 border-r h-full border-border hover:bg-surface-hover transition-colors cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", item.assetId);
              e.dataTransfer.effectAllowed = "copy";
            }}
          >
            <span className="text-text-secondary font-semibold">{item.name}</span>
            <span className="text-foreground tracking-tight">{item.price}</span>
            <span className={item.up ? "text-bullish" : "text-bearish"}>
              {item.change}
            </span>

            {/* Hover Details Card */}
            <div className="absolute top-11 left-1/2 -translate-x-1/2 w-52 p-3 bg-surface border border-border shadow-md rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all z-[100] text-left pointer-events-none">
              <div className="flex items-start justify-between mb-2">
                <span className="font-bold text-foreground truncate max-w-[120px]">{item.name}</span>
                <span className="text-[10px] font-bold bg-background border border-border px-1.5 py-0.5 rounded text-text-secondary uppercase">{item.symbol}</span>
              </div>
              <div className="relative pt-2 border-t border-border/70 space-y-1.5 text-[11px] text-text-secondary font-medium">
                <div className="flex justify-between items-center whitespace-normal">
                  <span>Unit Size:</span>
                  <span className="text-foreground">{item.unit}</span>
                </div>
                <div className="flex justify-between items-center whitespace-normal">
                  <span>Category:</span>
                  <span className="text-foreground">{item.category}</span>
                </div>
                <div className="flex justify-between items-center whitespace-normal">
                  <span>Exchange:</span>
                  <span className="text-foreground">{item.exchange}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
