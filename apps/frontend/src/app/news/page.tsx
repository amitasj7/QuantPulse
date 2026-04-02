"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

export default function NewsPage() {
  const news = [
    { title: 'Gold prices hit all-time high amid global uncertainty', time: '2 hours ago', category: 'Metals' },
    { title: 'Solar module prices drop as polysilicon supply increases', time: '4 hours ago', category: 'Renewables' },
    { title: 'OPEC+ announces surprise oil production cut', time: '5 hours ago', category: 'Energy' },
    { title: 'Copper supply constraints delay major infrastructure projects', time: '8 hours ago', category: 'Metals' },
    { title: 'US natural gas inventories higher than 5-year average', time: '12 hours ago', category: 'Energy' },
    { title: 'Silver follows gold rally on safe-haven demand', time: '1 day ago', category: 'Metals' },
  ];

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
                  <Newspaper className="h-8 w-8 text-bullish" />
                  Market News
                </h1>
                <p className="text-text-secondary mt-1">Latest headlines and financial insights.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, i) => (
                <Card key={i} className="bg-surface border-border shadow-sm dark:shadow-none hover:border-bullish/30 transition-all group cursor-pointer flex flex-col">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-background text-text-secondary rounded-md uppercase tracking-wider">{item.category}</span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-bullish transition-colors leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-end">
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      Brief summary of the news article goes here. It provides a little more context about the market movement and expected future trends.
                    </p>
                    <div className="flex justify-end">
                      <ExternalLink className="h-4 w-4 text-text-secondary group-hover:text-bullish transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
