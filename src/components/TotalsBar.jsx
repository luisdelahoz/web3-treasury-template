import { fmtUSD, fmtTime, fmtDate } from '../lib/formatters'

function TotalCard({ label, value, sub, large }) {
  return (
    <div className="accent-top relative bg-surface border border-border rounded-lg px-5 py-4 overflow-hidden">
      <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted mb-2.5">{label}</div>
      <div
        className="font-extrabold text-[color:var(--accent)] leading-none tracking-tight"
        style={{ fontSize: large ? 18 : 22 }}
      >
        {value || '—'}
      </div>
      {sub && <div className="font-mono text-[9px] text-muted mt-1">{sub}</div>}
    </div>
  )
}

export function TotalsBar({ groups, getEntity, lastRefresh }) {
  const groupTotals = groups.map(group =>
    group.entities.reduce((acc, entity) => {
      const state = getEntity(entity, group.id)
      return acc + (state?.rows?.reduce((a, r) => a + (r.usd || 0), 0) || 0)
    }, 0)
  )
  const grand = groupTotals.reduce((a, b) => a + b, 0)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-9">
      <TotalCard label="Portfolio Total" value={grand ? fmtUSD(grand) : '—'} sub="USD estimado" />
      {groups.map((g, i) => (
        <TotalCard key={g.id} label={g.label} value={groupTotals[i] ? fmtUSD(groupTotals[i]) : '—'} sub={`${g.entities.length} entidades`} />
      ))}
      <TotalCard
        label="Actualización"
        value={lastRefresh ? fmtTime(lastRefresh) : '—'}
        sub={lastRefresh ? fmtDate(lastRefresh) : 'Sin datos'}
        large
      />
    </div>
  )
}
