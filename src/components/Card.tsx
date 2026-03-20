import { NETWORKS } from '../lib/constants'
import { shortenAddress, formatUSD, formatTime } from '../lib/formatters'
import { getCardAlertLevel } from '../lib/thresholds'
import { AssetRow, AssetRowSkeleton } from './AssetRow'
import { AlertBadge } from './ui/AlertBadge'
import { cn } from '../lib/cn'
import type { Entity, EntityState, EntityStatus, NetworkCls } from '../types'

// ── Status dot ────────────────────────────────────────────────────────────────

const STATUS_DOT_CLASS: Record<EntityStatus, string> = {
  idle:    'bg-dim',
  loading: 'bg-amber animate-[pulse_1.4s_infinite]',
  ok:      'bg-green',
  error:   'bg-crimson',
}

function StatusDot({ status }: { status: EntityStatus }) {
  return (
    <div className={cn('w-[7px] h-[7px] rounded-full', STATUS_DOT_CLASS[status])} />
  )
}

// ── Network color map ─────────────────────────────────────────────────────────

interface NetworkColors {
  avatar: string
  pill:   string
}

const NET_COLORS: Record<NetworkCls, NetworkColors> = {
  eth:  { avatar: 'bg-eth/10 border border-eth/25 text-eth',   pill: 'bg-eth/10  text-eth  border border-eth/20'  },
  poly: { avatar: 'bg-poly/10 border border-poly/25 text-poly', pill: 'bg-poly/10 text-poly border border-poly/20' },
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  entity: Entity
  state:  EntityState
  style?: React.CSSProperties
}

export function Card({ entity, state, style }: CardProps) {
  const network     = NETWORKS[entity.network] ?? NETWORKS.ethereum
  const status      = state.status
  const rows        = state.rows
  const totalUSD    = rows.reduce((sum, row) => sum + (row.usd || 0), 0)
  const cardAlert   = getCardAlertLevel(rows)
  const netColors   = NET_COLORS[network.cls]

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
            {network.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-text leading-tight">{entity.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[8px] text-muted">{shortenAddress(entity.address)}</span>
              <span className={cn('font-mono text-[7px] font-bold tracking-wide px-1 py-px rounded uppercase', netColors.pill)}>
                {network.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <AlertBadge level={cardAlert} rows={rows} />
            <StatusDot status={status} />
          </div>
          <div className="font-mono text-[7px] text-muted">
            {state.updatedAt ? formatTime(state.updatedAt) : '—'}
          </div>
        </div>
      </div>

      {/* Assets */}
      <div>
        {status === 'loading' || status === 'idle'
          ? entity.assets.map((_, index) => <AssetRowSkeleton key={index} />)
          : status === 'error'
          ? (
            <div className="px-4 py-3.5 font-mono text-[9px] text-crimson flex items-center gap-1.5">
              ⚠ {state.error}
            </div>
          )
          : rows.map((row, index) => <AssetRow key={index} {...row} />)
        }
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted">
          Total estimado
        </span>
        <span className="font-mono text-xs font-bold text-[color:var(--accent)]">
          {status === 'ok' ? (totalUSD ? formatUSD(totalUSD) : '—') : '—'}
        </span>
      </div>
    </div>
  )
}
