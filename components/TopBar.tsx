
import Logo from "./Logo";
import dynamic from "next/dynamic";
import { ShieldCheck, Bell, Settings } from "lucide-react";

// Make ThemeToggle client-side only
const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div className="w-9 h-9 rounded-md bg-aegis-card animate-pulse"></div>
  )
});

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-aegis-bg/80 backdrop-blur supports-[backdrop-filter]:bg-aegis-bg/60">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="sr-only">Aegis Dashboard</span>
          <div className="hidden sm:block text-sm text-slate-400">AI Shield for Real-Time Surveillance</div>
        </div>
        <nav aria-label="Global actions" className="flex items-center gap-3">
          <button aria-label="Notifications" className="focus-ring p-2 rounded-md hover:bg-aegis-card"><Bell size={18}/></button>
          <ThemeToggle />
          <button aria-label="Settings" className="focus-ring p-2 rounded-md hover:bg-aegis-card"><Settings size={18}/></button>
          <div className="inline-flex items-center gap-2 text-xs bg-aegis-card border border-slate-800 px-2 py-1 rounded-md text-aegis-mint">
            <ShieldCheck size={14}/> <span>Compliance: OK</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
