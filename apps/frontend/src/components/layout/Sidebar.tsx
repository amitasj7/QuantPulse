"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Sun, 
  Home, 
  LineChart, 
  Newspaper, 
  Bell, 
  Settings,
  X,
  Moon,
  Monitor
} from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSidebarOpen]);

  // Handle Hydration for Theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply Theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Remove both explicitly first, then add if needed
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      if (isSystemDark) root.classList.add('dark');
      else root.classList.add('light'); // Optional depending on how light is set
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Ensure hydration matches text rendering
  const isLight = mounted && theme === 'light';
  const isDark = mounted && theme === 'dark';
  const isSystem = mounted && theme === 'system';

  return (
    <>
      {/* Backdrop overlay (click outside) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 border-r border-border bg-background/95 backdrop-blur-md flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <div className="font-bold text-xl flex items-center gap-2 text-foreground">
            <BarChart3 className="text-bullish h-6 w-6" />
            Quant<span className="text-bullish">Pulse</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-text-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col py-6 px-4 gap-2 flex-1 overflow-y-auto custom-scrollbar">
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface text-foreground font-medium">
            <Home className="h-5 w-5 text-bullish" />
            Dashboard
          </Link>
          <Link href="/commodities" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors font-medium">
            <LineChart className="h-5 w-5" />
            MCX Commodities
          </Link>
          <Link href="/solar" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors font-medium">
            <Sun className="h-5 w-5" />
            Solar Industry
          </Link>
          <Link href="/news" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors font-medium">
            <Newspaper className="h-5 w-5" />
            Market News
          </Link>
          <Link href="/alerts" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors font-medium">
            <Bell className="h-5 w-5" />
            Alerts
          </Link>
        </div>

        <div className="p-4 mt-auto border-t border-border flex flex-col gap-4">
          
          {/* Theme Toggle */}
          <div className="flex items-center bg-surface rounded-lg p-1">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${isLight ? 'bg-bullish text-white shadow-sm' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
              title="Light Mode"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${isDark ? 'bg-bullish text-white shadow-sm' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
              title="Dark Mode"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${isSystem ? 'bg-bullish text-white shadow-sm' : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'}`}
              title="System Default"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          <Link href="/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors font-medium">
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
