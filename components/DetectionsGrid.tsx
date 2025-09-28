
import { Detection } from "../lib/types";
import TruthMeter from "./TruthMeter";

export default function DetectionsGrid({ items }: { items: Detection[] }){
  return (
    <div className="grid md:grid-cols-2 gap-4" aria-label="Detections list">
      {items.map((d)=> (
        <div key={d.id} className="border border-slate-800 rounded-lg overflow-hidden bg-aegis-card">
          <div className="relative">
            <img src={d.thumbnail || "https://via.placeholder.com/800x450?text=Inpainted+Frame"} alt="Detection frame" className="w-full h-44 object-cover"/>
            <span className="absolute top-2 left-2 text-[11px] bg-aegis-primary/80 text-black rounded px-2 py-1">Suspect match</span>
            <span className="absolute top-2 right-2 text-[11px] bg-aegis-contrast/80 rounded px-2 py-1">{d.confidence}%</span>
          </div>
          <div className="p-3 text-xs flex items-center justify-between">
            <div>{d.time} • {d.camera}</div>
            <div className="text-slate-400">{d.lat.toFixed(2)},{d.lng.toFixed(2)}</div>
          </div>
          <div className="px-3 pb-3">
            <TruthMeter value={d.confidence}/>
          </div>
        </div>
      ))}
    </div>
  )
}
