
export default function TruthMeter({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
        <span>Confidence</span><span>{v}%</span>
      </div>
      <div className="h-2 w-full bg-[#0e1520] rounded">
        <div className="h-2 rounded bg-aegis-primary" style={{ width: v+'%' }}/>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">Predictions are probabilistic — not evidence.</div>
    </div>
  )
}
