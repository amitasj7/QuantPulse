"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export default function CommoditiesPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                  <LineChart className="h-8 w-8 text-bullish" />
                  MCX Commodities
                </h1>
                <p className="text-text-secondary mt-1">Detailed view of commodity markets and historical trends.</p>
              </div>
            </div>

            <Card className="bg-surface border-border shadow-sm dark:shadow-none">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-foreground">Market Data</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type="text" placeholder="Search commodities..." className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-sm focus:outline-none focus:border-bullish text-foreground placeholder-text-secondary" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left relative">
                    <thead className="text-xs text-text-secondary uppercase bg-surface-hover border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Commodity</th>
                        <th className="px-6 py-4 font-semibold text-right">Price (INR)</th>
                        <th className="px-6 py-4 font-semibold text-right">24h Change</th>
                        <th className="px-6 py-4 font-semibold">Volume</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Gold', 'Silver', 'Crude Oil', 'Natural Gas', 'Copper', 'Zinc'].map((item, i) => (
                        <tr key={item} className="border-b border-border hover:bg-surface-hover/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{item}</td>
                          <td className="px-6 py-4 text-right font-mono">₹{(Math.random() * 50000 + 1000).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${i % 2 === 0 ? 'text-bullish bg-bullish/10' : 'text-bearish bg-bearish/10'}`}>
                              {i % 2 === 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {(Math.random() * 5).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-mono">{(Math.random() * 10000).toFixed(0)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex h-2 w-2 rounded-full bg-bullish animate-pulse"></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
