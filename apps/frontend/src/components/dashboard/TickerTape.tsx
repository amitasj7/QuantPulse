"use client";

import { useMarketStore } from "@/stores/useMarketStore";

export function TickerTape() {
  const { liveTicks, commodities } = useMarketStore();
  
  // Transform map into array of strings for ticker
  const items = Object.values(liveTicks).map(tick => {
    const meta = commodities[tick.assetId] || { name: tick.assetId };
    return {
      name: meta.name,
      price: tick.priceINR > 0 ? `₹${tick.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `$${tick.priceUSD.toFixed(2)}`,
      change: `${tick.percentChange > 0 ? '+' : ''}${tick.percentChange.toFixed(2)}%`,
      up: tick.percentChange >= 0,
    };
  });

  if (items.length === 0) return <div className="h-10 w-full bg-slate-900 border-b border-white/10" />;

  return (
    <div className="w-full bg-slate-900 border-b border-white/10 overflow-hidden flex h-10 items-center text-xs sm:text-sm font-medium">
      <div className="flex animate-ticker whitespace-nowrap min-w-max">
        {/* Render items multiple times for seamless loop */}
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-white/10">
            <span className="text-slate-300">{item.name}</span>
            <span className="text-white">{item.price}</span>
            <span className={item.up ? "text-emerald-400" : "text-rose-400"}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
