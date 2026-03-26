import Link from "next/link";
import { 
  BarChart3, 
  Sun, 
  Home, 
  LineChart, 
  Newspaper, 
  Bell, 
  Settings 
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/10 bg-[#0B0E11]/80 backdrop-blur-md hidden md:flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="font-bold text-xl flex items-center gap-2 text-white">
          <BarChart3 className="text-emerald-400 h-6 w-6" />
          Quant<span className="text-emerald-400">Pulse</span>
        </div>
      </div>
      
      <div className="flex flex-col py-6 px-4 gap-2 flex-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 text-white font-medium">
          <Home className="h-5 w-5 text-emerald-400" />
          Dashboard
        </Link>
        <Link href="/commodities" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
          <LineChart className="h-5 w-5" />
          MCX Commodities
        </Link>
        <Link href="/solar" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
          <Sun className="h-5 w-5" />
          Solar Industry
        </Link>
        <Link href="/news" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
          <Newspaper className="h-5 w-5" />
          Market News
        </Link>
        <Link href="/alerts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
          <Bell className="h-5 w-5" />
          Alerts
        </Link>
      </div>

      <div className="p-4 mt-auto">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
