
'use client';
import { useState } from "react";
import { Play, Upload, Bot, Share2, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface SidebarProps {
  onAnalyze: (q: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function Sidebar({ onAnalyze, isLoading = false, error }: SidebarProps) {
  const [query, setQuery] = useState("Look for black hoodie, approx 5ft, seen entering white vehicle with another individual");
  return (
    <aside className="w-full md:w-96 border-r border-slate-800 bg-aegis-card/50">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold">Configure Agent Tasks</h2>
      </div>
      <div className="p-4 space-y-4">
        <section className="rounded-lg border border-slate-800 bg-aegis-card p-4 shadow-glow">
          <div className="flex items-center gap-2 mb-2 font-medium text-aegis-primary"><Upload size={18}/> Watch & Analyze CCTV Footage</div>
          <label htmlFor="q" className="sr-only">Suspect search query</label>
          <textarea id="q" value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full focus-ring rounded-md bg-[#0e1520] border border-slate-700 p-2 text-sm" rows={4} aria-describedby="q-help" />
          <div id="q-help" className="text-xs text-slate-400 mt-1">Use natural language. Example: “red jacket near station 3PM”</div>
          <button 
            onClick={()=>onAnalyze(query)} 
            disabled={isLoading || !query.trim()}
            className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-aegis-primary text-black hover:opacity-90 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <Play size={16}/>}
            {isLoading ? "Analyzing..." : "Launch Aegis"}
          </button>
          
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-800 bg-aegis-card p-4">
          <div className="flex items-center gap-2 mb-2 font-medium text-aegis-contrast"><Share2 size={18}/> Post Alert on Social</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> X</label>
            <label className="flex items-center gap-2"><input type="checkbox"/> CNN</label>
            <label className="flex items-center gap-2"><input type="checkbox"/> Fox</label>
          </div>
          <div className="mt-2 text-xs text-slate-400">Voice: <label className="ml-2"><input type="radio" name="v" defaultChecked/> Female</label> <label className="ml-2"><input type="radio" name="v"/> Male</label></div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-aegis-card p-4">
          <div className="flex items-center gap-2 mb-2 font-medium text-aegis-primary"><Bot size={18}/> Aegis Bot</div>
          <p className="text-xs text-slate-400 mb-2">Ask Gemini to summarize findings or check compliance.</p>
          <a className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-slate-700 hover:bg-[#0e1520] focus-ring" href="#chat">Open Chat</a>
        </section>
      </div>
    </aside>
  );
}
