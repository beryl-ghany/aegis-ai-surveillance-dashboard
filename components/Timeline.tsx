
import { Detection } from "../lib/types";

export default function Timeline({ items }: { items: Detection[] }) {
  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-lg p-4 bg-aegis-card" aria-label="Suspect timeline">
      <ol className="flex gap-8 min-w-[600px]">
        {items.map((i, idx)=> (
          <li key={i.id} className="relative">
            <div className="w-2 h-2 rounded-full bg-aegis-primary mx-auto mb-2 shadow-glow"></div>
            <div className="text-xs text-center whitespace-nowrap">{i.time}</div>
            <div className="text-[11px] mt-1 text-slate-400 text-center">{i.camera}</div>
            {idx < items.length-1 && <div className="absolute left-1/2 top-1 w-24 h-[2px] bg-aegis-contrast"></div>}
          </li>
        ))}
      </ol>
    </div>
  )
}
