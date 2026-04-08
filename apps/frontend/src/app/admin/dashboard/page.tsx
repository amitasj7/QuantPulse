"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMarketStore } from "@/stores/useMarketStore";
import { Header } from "@/components/layout/Header";
import { ShieldAlert, Trash2, Plus, GripVertical, Settings, Users, Database } from "lucide-react";

// Fallback mock stocks that can be added if not already tracked
const AVAILABLE_EXTERNAL_STOCKS = [
  { assetId: 'MCX_PLATINUM', name: 'Platinum', symbol: 'PLAT', category: 'METAL', unit: 'INR/1g', exchange: 'MCX' },
  { assetId: 'MCX_ZINC', name: 'Zinc Mini', symbol: 'ZINC', category: 'METAL', unit: 'INR/Kg', exchange: 'MCX' },
  { assetId: 'MCX_NATGAS', name: 'Natural Gas', symbol: 'GAS', category: 'ENERGY', unit: 'INR/mmBtu', exchange: 'MCX' },
  { assetId: 'GLOBAL_LITHIUM', name: 'Lithium Ores', symbol: 'LI', category: 'INDUSTRIAL', unit: 'USD/Kg', exchange: 'GLOBAL' }
];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabQuery = searchParams.get('tab');
  
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const { commodities, removeCommodity, addCommodity } = useMarketStore();
  
  const [activeTab, setActiveTab] = useState(activeTabQuery || "stocks");

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editMobile, setEditMobile] = useState(user?.mobile || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || "");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (activeTabQuery) setActiveTab(activeTabQuery);
  }, [activeTabQuery]);

  if (!isAuthenticated || !user) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      email: editEmail,
      mobile: editMobile,
      avatarUrl: editAvatar
    });
    alert("Profile configurations updated successfully sequence.");
  };

  const currentTrackedIds = Object.keys(commodities);
  const addableStocks = AVAILABLE_EXTERNAL_STOCKS.filter(s => !currentTrackedIds.includes(s.assetId));

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Reusing Global Header to satisfy the top right profile icon requirement dynamically */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar Layout */}
        <div className="w-64 border-r border-border bg-surface shrink-0 hidden md:flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold tracking-tight text-bullish flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Admin Hub
            </h2>
            <p className="text-xs text-text-secondary mt-1">Superuser access configuration</p>
          </div>
          <div className="flex flex-col p-4 gap-2">
            <button 
              onClick={() => setActiveTab('stocks')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === 'stocks' ? 'bg-bullish text-white' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
            >
              <Database className="h-4 w-4" /> Stock Registry
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === 'profile' ? 'bg-bullish text-white' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
            >
              <Users className="h-4 w-4" /> Identity & Access
            </button>
            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm text-text-secondary hover:text-foreground hover:bg-surface-hover opacity-50 cursor-not-allowed`}
            >
              <Settings className="h-4 w-4" /> System Config
            </button>
          </div>
        </div>

        {/* Admin Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bullish/5 via-background to-background pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Profile Configuration</h1>
                <p className="text-text-secondary mb-8">Manage authentication boundaries and visual identity.</p>

                <form onSubmit={handleProfileSave} className="bg-surface border border-border p-8 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-8 mb-8">
                    <img src={editAvatar} alt="Avatar" className="h-24 w-24 rounded-full border border-border shadow-2xl object-cover shrink-0" />
                    <div className="w-full space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Avatar URI</label>
                        <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg h-10 px-3 text-sm focus:border-bullish focus:outline-none focus:ring-1 focus:ring-bullish transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg h-10 px-3 text-sm focus:border-bullish focus:outline-none focus:ring-1 focus:ring-bullish" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Mobile Access</label>
                      <input value={editMobile} onChange={e => setEditMobile(e.target.value)} type="text" className="w-full bg-background border border-border rounded-lg h-10 px-3 text-sm focus:border-bullish focus:outline-none focus:ring-1 focus:ring-bullish" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-secondary mb-1">Security Email</label>
                      <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-lg h-10 px-3 text-sm focus:border-bullish focus:outline-none focus:ring-1 focus:ring-bullish" />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button type="submit" className="bg-bullish hover:bg-bullish/90 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md">
                      Update Profile Blueprint
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'stocks' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Stock Registry</h1>
                <p className="text-text-secondary mb-8">Globally add or revoke access to live commodity tracking tools.</p>

                {/* Section: Tracked Stocks (Revoke) */}
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Currently Bound Assets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {Object.values(commodities).map((stock) => (
                    <div key={stock.assetId} className="flex flex-row items-center justify-between p-4 bg-surface border border-border rounded-xl shadow-sm group">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-text-secondary opacity-30 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <p className="font-bold text-foreground leading-none">{stock.name}</p>
                          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">{stock.category} • {stock.exchange}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeCommodity(stock.assetId)}
                        className="p-2 text-bearish hover:bg-bearish hover:text-white border border-bearish/20 rounded-lg transition-colors shadow-sm"
                        title="Revoke Network Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Section: External Stocks (Add) */}
                {addableStocks.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Discoverable Networks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addableStocks.map((stock) => (
                        <div key={stock.assetId} className="flex flex-row items-center justify-between p-4 bg-surface border border-dashed border-text-secondary/30 rounded-xl group relative overflow-hidden">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-bullish/10 flex items-center justify-center text-bullish font-bold text-xs ring-1 ring-bullish/20">
                              {stock.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground leading-none">{stock.name}</p>
                              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">{stock.category} • {stock.exchange}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => addCommodity(stock as any)}
                            className="bg-bullish hover:bg-bullish/90 text-white font-bold text-xs px-3 py-1.5 rounded-md transition-all shadow-md flex items-center gap-1.5"
                          >
                            <Plus className="h-3 w-3" /> Grant
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {addableStocks.length === 0 && (
                  <div className="text-center p-8 bg-surface/50 border border-border rounded-xl">
                    <p className="text-text-secondary font-medium">All known external discovery targets have tracking access mapped currently.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-background flex justify-center items-center font-bold text-text-secondary">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
