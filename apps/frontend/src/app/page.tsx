"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { TickerTape } from "@/components/dashboard/TickerTape";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TradingChart } from "@/components/charts/TradingChart";
import { useMarketStore } from "@/stores/useMarketStore";
import { socketClient } from "@/lib/socket";

export default function Dashboard() {
  const { 
    commodities, 
    solarAssets, 
    historicalData, 
    liveTicks, 
    fetchInitialData,
    updateLiveTick,
    selectedAssetId 
  } = useMarketStore();

  useEffect(() => {
    // 1. Fetch initial states
    fetchInitialData();
    useMarketStore.getState().fetchHistory(selectedAssetId);
    
    // 2. Connect to real-time market socket
    socketClient.connect();

    // 3. Setup incoming tick listener
    const unsubscribe = socketClient.onTick((tick) => {
      updateLiveTick(tick);
    });

    return () => {
      unsubscribe();
      socketClient.disconnect();
    };
  }, [fetchInitialData, updateLiveTick, selectedAssetId]);

  // When commodities load, subscribe to all their sockets
  useEffect(() => {
    const assetsToSubscribe = [
      ...Object.keys(commodities),
      ...Object.keys(solarAssets)
    ];
    if (assetsToSubscribe.length > 0) {
      socketClient.subscribe(assetsToSubscribe);
    }
  }, [commodities, solarAssets]);

  // Aggregate selected asset data 
  const selectedMeta = commodities[selectedAssetId] || solarAssets[selectedAssetId];
  const selectedHistory = historicalData[selectedAssetId] || [];
  const selectedLiveTick = liveTicks[selectedAssetId];

  // Helper arrays for Dashboard formatting
  const top4List = Object.keys(commodities).slice(0, 4);
  const solarList = Object.keys(solarAssets);

  return (
    <div className="flex h-screen bg-[#06080A] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        <TickerTape />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Market Overview</h1>
                <p className="text-slate-400 mt-1">Real-time commodity and solar industry insights.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-medium text-sm rounded-md backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                  Live Data
                </Badge>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {top4List.map((id) => {
                const item = commodities[id];
                const live = liveTicks[id];
                const price = live?.priceINR.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || "0.00";
                const change = live ? live.percentChange : 0;
                const isUp = change >= 0;

                return (
                  <Card key={item.name} className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden relative group hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/40">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isUp ? <TrendingUp size={64} /> : <TrendingUp size={64} className="rotate-180" />}
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-bold tracking-tight text-white">₹{price}</div>
                        <div className={`flex items-center text-sm font-semibold px-2 py-1 rounded-md ${isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                          {change > 0 && '+'}{change.toFixed(2)}%
                          {isUp ? <ArrowUpRight className="ml-1 h-4 w-4" /> : <ArrowDownRight className="ml-1 h-4 w-4" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Main Charts & Solar Widget Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Chart Real-time */}
              <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-md min-h-[400px] flex flex-col shadow-xl shadow-black/40">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="text-lg text-white">Price History ({selectedMeta?.name || 'Loading...'})</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-0 relative overflow-hidden h-[400px]">
                  {selectedHistory.length > 0 ? (
                    <TradingChart 
                      data={selectedHistory} 
                      liveTick={selectedLiveTick} 
                      assetName={selectedMeta?.name || ""} 
                    />
                  ) : (
                    <div className="text-center p-8 z-10 opacity-50">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-slate-400 animate-pulse" />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Connecting to Data Stream...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Solar Supply Chain Waterfall */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl shadow-black/40">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="text-lg text-white">Solar Industry Prices</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {solarList.map((id, i) => {
                      const item = solarAssets[id];
                      const live = liveTicks[id];
                      const change = live ? live.percentChange : 0;
                      
                      return (
                        <div key={item.name} className="relative">
                          {i !== solarList.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-white/10"></div>
                          )}
                          
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 z-10">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-200">{item.name}</span>
                                <span className="font-bold text-white tracking-wide">
                                  ${live?.priceUSD.toFixed(3) || "0.000"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-500">Global Avg.</span>
                                <span className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {change > 0 && '+'}{change.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
