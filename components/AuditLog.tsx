
export type AuditEvent = { time: string; actor: string; action: string; detail?: string };
export default function AuditLog({ items }: { items: AuditEvent[] }){
  return (
    <div className="border border-slate-800 rounded-lg bg-aegis-card" aria-label="Audit log">
      <div className="px-3 py-2 border-b border-slate-800 text-sm font-medium">Audit Log</div>
      <ul className="divide-y divide-slate-800 text-sm">
        {items.map((e, i)=> (
          <li key={i} className="p-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">{e.actor}</span>
              <span className="text-xs text-slate-400">{e.time}</span>
            </div>
            <div className="text-xs">{e.action}</div>
            {e.detail && <div className="text-[11px] text-slate-400 mt-1">{e.detail}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}
