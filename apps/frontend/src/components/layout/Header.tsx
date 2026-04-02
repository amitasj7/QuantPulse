"use client";

import { Search, UserCircle, Menu } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

export function Header() {
  const { toggleSidebar, setSearchOpen } = useUIStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/80 backdrop-blur-md shrink-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-text-secondary hover:text-foreground rounded-md hover:bg-surface transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div 
          className="max-w-xl hidden sm:flex items-center relative w-full cursor-pointer group"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4 absolute left-3 text-text-secondary group-hover:text-bullish transition-colors" />
          <input 
            type="text" 
            readOnly
            placeholder="Search commodities, indices, solar assets..." 
            className="w-full bg-surface border border-border cursor-pointer rounded-full h-10 pl-10 pr-4 text-sm focus:outline-none hover:border-text-secondary/50 text-foreground placeholder-text-secondary transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bullish opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-bullish"></span>
          </span>
          <span className="text-xs font-semibold text-bullish uppercase tracking-widest hidden sm:inline-block">Market Open</span>
        </div>
        <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-foreground">
          <UserCircle className="h-8 w-8 text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
