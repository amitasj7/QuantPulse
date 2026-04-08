"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Activity, Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!emailOrMobile || !password) {
      setError("Please fill in all fields");
      return;
    }

    const success = login({ emailOrMobile, password });
    if (success) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Try admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bullish/10 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Activity className="h-8 w-8 text-bullish animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Gateway</h1>
          <p className="text-text-secondary mt-2">Secure terminal access for QuantPulse</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          {error && (
            <div className="bg-bearish/10 border border-bearish/50 text-bearish text-sm px-4 py-3 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input 
                  type="text" 
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl h-11 pl-10 pr-4 text-sm focus:outline-none focus:border-bullish focus:ring-1 focus:ring-bullish transition-all"
                  placeholder="admin@domain.com or +91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Terminal Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl h-11 pl-10 pr-4 text-sm focus:outline-none focus:border-bullish focus:ring-1 focus:ring-bullish transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-11 bg-bullish hover:bg-bullish/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
            >
              Authenticate <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        <p className="text-center text-xs text-text-secondary mt-8">
          Authorized personnel only. Data actively monitored.
        </p>
      </div>
    </div>
  );
}
