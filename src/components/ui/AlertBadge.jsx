import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Tooltip } from './Tooltip'

const LEVEL_CONFIG = {
  warn: {
    Icon:      AlertTriangle,
    label:     'Warning',
    className: 'bg-amber/10 border-amber/30 text-amber',
  },
  critical: {
    Icon:      AlertOctagon,
    label:     'Critical',
    className: 'bg-crimson/10 border-crimson/30 text-crimson',
  },
}

/**
 * Small badge shown in the card header when one or more assets
 * are below their threshold. Wraps in a Tooltip listing which assets.
 *
 * Props:
 *   level   — 'warn' | 'critical'
 *   rows    — asset rows array (to build tooltip content)
 */
export function AlertBadge({ level, rows }) {
  if (level === 'ok' || !level) return null

  const cfg = LEVEL_CONFIG[level]
  const alertedAssets = rows
    .filter(r => r.alertLevel === 'warn' || r.alertLevel === 'critical')
    .map(r => `${r.symbol} (${r.bal?.toFixed ? r.bal.toFixed(4) : r.bal})`)
    .join(', ')

  return (
    <Tooltip content={`Low balance: ${alertedAssets}`} side="left">
      <span
        className={cn(
          'inline-flex items-center gap-1',
          'px-1.5 py-0.5 rounded border',
          'font-mono text-[9px] font-bold uppercase tracking-wider',
          'cursor-default select-none',
          cfg.className
        )}
      >
        <cfg.Icon size={9} strokeWidth={2.5} />
        {cfg.label}
      </span>
    </Tooltip>
  )
}
