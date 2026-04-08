"use client";

import { Search, UserCircle, Menu, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { toggleSidebar, setSearchOpen } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        
        <div className="relative" ref={dropdownRef}>
          {isAuthenticated && user ? (
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-surface px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-border"
            >
              <img src={user.avatarUrl} alt="Admin" className="h-8 w-8 rounded-full border border-border object-cover" />
              <div className="hidden sm:flex flex-col items-start px-1">
                <span className="text-sm font-bold text-foreground leading-none">{user.name}</span>
                <span className="text-[10px] text-text-secondary font-medium mt-0.5 uppercase tracking-wider">Admin</span>
              </div>
              <ChevronDown className="h-3 w-3 text-text-secondary hidden sm:block" />
            </button>
          ) : (
            <button 
              onClick={() => router.push('/admin/login')}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-foreground transition-colors border border-border"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          )}

          {/* Profile Dropdown */}
          {profileOpen && isAuthenticated && user && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border/50 flex flex-col gap-1">
                <span className="text-sm font-bold text-foreground">{user.name}</span>
                <span className="text-xs text-text-secondary font-mono truncate">{user.email}</span>
              </div>
              <div className="py-2 flex flex-col">
                <button 
                  onClick={() => { setProfileOpen(false); router.push('/admin/dashboard'); }}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-foreground hover:bg-background/50 flex items-center gap-2 transition-colors w-full text-left"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin Panel
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); router.push('/admin/dashboard?tab=profile'); }}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-foreground hover:bg-background/50 flex items-center gap-2 transition-colors w-full text-left"
                >
                  <Settings className="h-4 w-4" /> Edit Profile
                </button>
              </div>
              <div className="border-t border-border/50 py-2 flex flex-col">
                <button 
                  onClick={() => { setProfileOpen(false); logout(); router.push('/'); }}
                  className="px-4 py-2 text-sm text-bearish hover:bg-bearish/10 flex items-center gap-2 transition-colors w-full text-left font-semibold"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
