"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Newspaper, ExternalLink, DollarSign } from "lucide-react";
import { TickerTape } from "@/components/dashboard/TickerTape";
import { WatchlistPanel } from "@/components/dashboard/WatchlistPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TradingChart } from "@/components/charts/TradingChart";
import { useMarketStore } from "@/stores/useMarketStore";

export default function Dashboard() {
  const { 
    commodities, 
    solarAssets, 
    historicalData, 
    liveTicks, 
    news,
    forexRate,
    selectedAssetId,
    setSelectedAssetId
  } = useMarketStore();

  const [dashboardCards, setDashboardCards] = useState<string[]>([]);
  
  useEffect(() => {
    const keys = Object.keys(commodities);
    if (dashboardCards.length === 0 && keys.length > 0) {
      setDashboardCards(keys.slice(0, 4));
    }
  }, [commodities, dashboardCards.length]);

  const selectedMeta = commodities[selectedAssetId] || solarAssets[selectedAssetId];
  const selectedHistory = historicalData[selectedAssetId] || [];
  const selectedLiveTick = liveTicks[selectedAssetId];

  const solarList = Object.keys(solarAssets);

  // Sentiment color helper
  const sentimentColor = (s: string | null) => {
    if (s === 'POSITIVE') return 'text-bullish bg-bullish/10';
    if (s === 'NEGATIVE') return 'text-bearish bg-bearish/10';
    return 'text-text-secondary bg-surface';
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        <TickerTape />

        {/* Main Content Area: Content + Watchlist */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main scrollable content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Page Title + Forex Badge */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Market Overview</h1>
                  <p className="text-text-secondary mt-1">Real-time commodity and solar industry insights.</p>
                </div>
                <div className="flex items-center gap-3">
                  {forexRate && (
                    <Badge variant="outline" className="bg-surface text-foreground border-border px-3 py-1 font-medium text-sm rounded-md">
                      <DollarSign className="h-3.5 w-3.5 mr-1.5 text-text-secondary" />
                      USD/INR: ₹{forexRate.rate.toFixed(2)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-bullish/10 text-bullish border-bullish/20 px-3 py-1 font-medium text-sm rounded-md backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-bullish mr-2 animate-pulse"></div>
                    Live Data
                  </Badge>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards.map((id, index) => {
                  const item = commodities[id] || solarAssets[id] || { name: id };
                  const live = liveTicks[id];
                  const price = live 
                    ? (live.priceINR > 0 
                        ? `₹${live.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
                        : `$${live.priceUSD?.toFixed(3) || "0.000"}`)
                    : "---";
                  const change = live ? live.percentChange : 0;
                  const isUp = change >= 0;

                  return (
                    <Card 
                      key={`card-${index}-${id}`} 
                      className="bg-surface border-border backdrop-blur-md overflow-hidden relative group hover:border-text-secondary/50 transition-all duration-300 shadow-sm dark:shadow-none cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-dashed"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", id);
                        e.dataTransfer.effectAllowed = "copyMove";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedAsset = e.dataTransfer.getData("text/plain");
                        if (draggedAsset && draggedAsset !== id) {
                          const newCards = [...dashboardCards];
                          newCards[index] = draggedAsset;
                          setDashboardCards(newCards);
                        }
                      }}
                    >
                      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                        {isUp ? <TrendingUp size={64} /> : <TrendingUp size={64} className="rotate-180" />}
                      </div>
                      <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-text-secondary uppercase tracking-wider">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex items-baseline justify-between">
                          <div className="text-3xl font-bold tracking-tight text-foreground">{price}</div>
                          <div className={`flex items-center text-sm font-semibold px-2 py-1 rounded-md ${isUp ? 'text-bullish bg-bullish/10' : 'text-bearish bg-bearish/10'}`}>
                            {change > 0 && '+'}{change.toFixed(2)}%
                            {isUp ? <ArrowUpRight className="ml-1 h-4 w-4" /> : <ArrowDownRight className="ml-1 h-4 w-4" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Main Chart Real-time */}
              <Card 
                className="bg-surface border-border backdrop-blur-md min-h-[500px] flex flex-col shadow-sm dark:shadow-none border-2 border-transparent hover:border-dashed hover:border-text-secondary/50 transition-all"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedAsset = e.dataTransfer.getData("text/plain");
                  if (draggedAsset) {
                    setSelectedAssetId(draggedAsset);
                  }
                }}
              >
                <CardContent className="flex-1 flex flex-col p-0 relative overflow-hidden w-full">
                  {selectedHistory.length > 0 ? (
                    <TradingChart 
                      data={selectedHistory} 
                      liveTick={selectedLiveTick} 
                      assetName={selectedMeta?.name || selectedAssetId} 
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 opacity-50">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-surface border border-border flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-text-secondary animate-pulse" />
                      </div>
                      <p className="text-sm text-text-secondary mt-2">Connecting to Data Stream...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Market News Section */}
              <Card className="bg-surface border-border backdrop-blur-md shadow-sm dark:shadow-none">
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-text-secondary" />
                      Market News
                    </CardTitle>
                    <span className="text-xs text-text-secondary">{news.length} articles</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {news.length > 0 ? (
                    <div className="space-y-4">
                      {news.map((item) => (
                        <a 
                          key={item.id} 
                          href={item.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.commodity && (
                                <Badge variant="outline" className="text-xs border-border px-1.5 py-0 shrink-0">
                                  {item.commodity.symbol}
                                </Badge>
                              )}
                              {item.sentiment && (
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sentimentColor(item.sentiment)}`}>
                                  {item.sentiment}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-bullish transition-colors">
                              {item.title}
                            </p>
                            {item.summary && (
                              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.summary}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-text-secondary">{item.sourceName}</span>
                              <span className="text-xs text-text-secondary">•</span>
                              <span className="text-xs text-text-secondary">
                                {new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-text-secondary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No news articles available yet.</p>
                      <p className="text-xs mt-1">News will appear here once the database is seeded.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </main>

          {/* Right Sidebar — Watchlist (hidden on small screens) */}
          <aside className="hidden xl:block w-72 shrink-0">
            <WatchlistPanel />
          </aside>

        </div>
      </div>
    </div>
  );
}
