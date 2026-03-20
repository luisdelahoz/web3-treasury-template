import { Card } from './Card'
import { fmtUSD } from '../lib/formatters'

export function Section({ group, getEntity }) {
  const groupTotal = group.entities.reduce((acc, entity) => {
    const state = getEntity(entity, group.id)
    return acc + (state?.rows?.reduce((a, r) => a + (r.usd || 0), 0) || 0)
  }, 0)

  return (
    <section className="mb-11">
      <div className="flex items-center gap-3.5 mb-4">
        <span className="text-sm text-[color:var(--accent)] opacity-70">{group.icon || '◈'}</span>
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-muted">
          {group.label}
        </span>
        <span className="bg-surface2 border border-border text-muted font-mono text-[9px] px-2 py-0.5 rounded-full">
          {group.entities.length}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[11px] font-bold text-[color:var(--accent)]">
          {groupTotal ? fmtUSD(groupTotal) : '—'}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {group.entities.length === 0
          ? (
            <div className="col-span-full text-center py-12 font-mono text-[10px] text-muted
                            border border-dashed border-border rounded-lg">
              Sin entidades en este grupo.
            </div>
          )
          : group.entities.map((entity, i) => (
              <Card
                key={`${entity.address}-${entity.network}`}
                entity={entity}
                state={getEntity(entity, group.id)}
                style={{ animationDelay: `${i * 55}ms` }}
              />
            ))
        }
      </div>
    </section>
  )
}
