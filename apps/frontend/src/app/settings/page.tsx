"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, User, Key, Globe, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <Settings className="h-8 w-8 text-bullish" />
                Settings
              </h1>
              <p className="text-text-secondary mt-1">Manage your account preferences and API integrations.</p>
            </div>

            <Card className="bg-surface border-border shadow-sm dark:shadow-none">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile Settings
                </CardTitle>
                <CardDescription className="text-text-secondary">Update your personal information and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Full Name</label>
                    <input type="text" defaultValue="Arbitrage Trader" className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:border-bullish text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Email Address</label>
                    <input type="email" defaultValue="trader@quantpulse.com" className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:border-bullish text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border shadow-sm dark:shadow-none">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Trading Environment
                </CardTitle>
                <CardDescription className="text-text-secondary">Configure your live feeds and database sync rates.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="font-semibold text-sm">Real-time WebSocket Data</h4>
                    <p className="text-xs text-text-secondary">Enable live price ticking</p>
                  </div>
                  <div className="h-6 w-10 bg-bullish rounded-full relative cursor-pointer shadow-inner">
                    <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <Database className="h-4 w-4" /> Data Retention Period
                  </label>
                  <select className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:border-bullish text-foreground">
                    <option>7 Days Setup</option>
                    <option>30 Days History</option>
                    <option>90 Days History</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border shadow-sm dark:shadow-none">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5" /> Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <button className="px-4 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-surface-hover transition-colors text-foreground">
                  Change Password
                </button>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
