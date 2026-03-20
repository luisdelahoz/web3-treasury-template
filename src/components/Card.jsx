import { NETWORKS } from '../lib/constants'
import { shortAddr, fmtUSD, fmtTime } from '../lib/formatters'
import { getCardAlertLevel } from '../lib/thresholds'
import { AssetRow, AssetRowSkeleton } from './AssetRow'
import { AlertBadge } from './ui/AlertBadge'
import { cn } from '../lib/cn'

function StatusDot({ status }) {
  const cls = {
    idle:    'bg-dim',
    loading: 'bg-amber animate-[pulse_1.4s_infinite]',
    ok:      'bg-green',
    error:   'bg-crimson',
  }[status] || 'bg-dim'

  return <div className={cn('w-[7px] h-[7px] rounded-full', cls)} />
}

export function Card({ entity, state, style }) {
  const net      = NETWORKS[entity.network] || NETWORKS.ethereum
  const status   = state?.status || 'idle'
  const rows     = state?.rows   || []
  const total    = rows.reduce((acc, r) => acc + (r.usd || 0), 0)
  const cardAlert = getCardAlertLevel(rows)

  const netColors = {
    eth:  { avatar: 'bg-eth/10 border border-eth/25 text-eth',   pill: 'bg-eth/10  text-eth  border border-eth/20'  },
    poly: { avatar: 'bg-poly/10 border border-poly/25 text-poly', pill: 'bg-poly/10 text-poly border border-poly/20' },
  }[net.cls]

  return (
    <div
      className="bg-surface border border-border rounded-[10px] overflow-hidden
                 transition-[border-color,transform] duration-200 animate-fade-up
                 hover:border-border2 hover:-translate-y-px"
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm shrink-0', netColors.avatar)}>
            {net.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-text leading-tight">{entity.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[8px] text-muted">{shortAddr(entity.address)}</span>
              <span className={cn('font-mono text-[7px] font-bold tracking-wide px-1 py-px rounded uppercase', netColors.pill)}>
                {net.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {/* Alert badge — only shown when there's an issue */}
            <AlertBadge level={cardAlert} rows={rows} />
            <StatusDot status={status} />
          </div>
          <div className="font-mono text-[7px] text-muted">
            {state?.updatedAt ? fmtTime(state.updatedAt) : '—'}
          </div>
        </div>
      </div>

      {/* Assets */}
      <div>
        {status === 'loading' || status === 'idle'
          ? entity.assets.map((_, i) => <AssetRowSkeleton key={i} />)
          : status === 'error'
          ? (
            <div className="px-4 py-3.5 font-mono text-[9px] text-crimson flex items-center gap-1.5">
              ⚠ {state.error}
            </div>
          )
          : rows.map((r, i) => <AssetRow key={i} {...r} />)
        }
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted">
          Total estimado
        </span>
        <span className="font-mono text-xs font-bold text-[color:var(--accent)]">
          {status === 'ok' ? (total ? fmtUSD(total) : '—') : '—'}
        </span>
      </div>
    </div>
  )
}
