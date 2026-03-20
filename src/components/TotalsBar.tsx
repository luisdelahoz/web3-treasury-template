import { formatUSD, formatTime, formatDate } from '../lib/formatters'
import type { Group, EntityState } from '../types'

interface TotalCardProps {
  label: string
  value: string
  sub?: string
  large?: boolean
}

function TotalCard({ label, value, sub, large }: TotalCardProps) {
  return (
    <div className="accent-top relative bg-surface border border-border rounded-lg px-5 py-4 overflow-hidden">
      <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted mb-2.5">
        {label}
      </div>
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

interface TotalsBarProps {
  groups: Group[]
  getEntity: (entity: Group['entities'][number], groupId: string) => EntityState
  lastRefresh: Date | null
}

export function TotalsBar({ groups, getEntity, lastRefresh }: TotalsBarProps) {
  const groupTotals = groups.map((group) =>
    group.entities.reduce((sum, entity) => {
      const state = getEntity(entity, group.id)
      return sum + state.rows.reduce((rowSum, row) => rowSum + (row.usd || 0), 0)
    }, 0),
  )
  const grandTotal = groupTotals.reduce((sum, groupTotal) => sum + groupTotal, 0)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-9">
      <TotalCard
        label="Portfolio Total"
        value={grandTotal ? formatUSD(grandTotal) : '—'}
        sub="USD estimado"
      />
      {groups.map((group, index) => (
        <TotalCard
          key={group.id}
          label={group.label}
          value={groupTotals[index] ? formatUSD(groupTotals[index]) : '—'}
          sub={`${group.entities.length} entidades`}
        />
      ))}
      <TotalCard
        label="Actualización"
        value={lastRefresh ? formatTime(lastRefresh) : '—'}
        sub={lastRefresh ? formatDate(lastRefresh) : 'Sin datos'}
        large
      />
    </div>
  )
}
