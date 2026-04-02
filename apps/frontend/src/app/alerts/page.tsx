"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, AlertTriangle, Info, BellRing } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    { type: 'critical', title: 'Silver Price Target Reached', message: 'MCX Silver has crossed ₹80,000 threshold.', time: '10 mins ago', icon: <BellRing className="text-bearish" /> },
    { type: 'warning', title: 'High Volatility Detected', message: 'Crude Oil options show 30% implied volatility spike.', time: '1 hour ago', icon: <AlertTriangle className="text-amber-500" /> },
    { type: 'info', title: 'Solar Wafer Shipment Delay', message: 'Global delays reported from TopCon manufacturers.', time: '4 hours ago', icon: <Info className="text-blue-500" /> },
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
                  <Bell className="h-8 w-8 text-bullish" />
                  Alerts & Notifications
                </h1>
                <p className="text-text-secondary mt-1">Manage your price triggers and market volatility alerts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
                {alerts.map((alert, i) => (
                  <Card key={i} className="bg-surface border-border shadow-sm dark:shadow-none hover:border-text-secondary/30 transition-colors">
                    <CardHeader className="p-4 flex flex-row items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 border border-border">
                        {alert.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                          {alert.title}
                          <span className="text-xs font-normal text-text-secondary">{alert.time}</span>
                        </CardTitle>
                        <CardDescription className="text-text-secondary mt-1">{alert.message}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Active Triggers</h2>
                <Card className="bg-surface border-border shadow-sm dark:shadow-none">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Gold Target</p>
                        <p className="text-xs text-text-secondary">&gt; ₹65,000</p>
                      </div>
                      <div className="h-4 w-8 bg-bullish rounded-full relative cursor-pointer">
                        <div className="h-3 w-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-border"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Crude Stop Loss</p>
                        <p className="text-xs text-text-secondary">&lt; ₹6,200</p>
                      </div>
                      <div className="h-4 w-8 bg-background border border-border rounded-full relative cursor-pointer">
                        <div className="h-3 w-3 bg-text-secondary rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
