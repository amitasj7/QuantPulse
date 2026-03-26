"use client";

import { Search, UserCircle, Menu } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-[#0B0E11]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="max-w-xl hidden sm:flex items-center relative w-full">
          <Search className="h-4 w-4 absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search commodities, indices, solar assets..." 
            className="w-full bg-white/5 border border-white/10 rounded-full h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-400 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest hidden sm:inline-block">Market Open</span>
        </div>
        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white">
          <UserCircle className="h-8 w-8 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
