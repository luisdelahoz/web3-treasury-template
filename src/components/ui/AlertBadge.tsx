import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Tooltip } from './Tooltip'
import type { AlertLevel, AssetRow } from '../../types'

interface LevelConfig {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  label: string
  className: string
}

const LEVEL_CONFIG: Record<Exclude<AlertLevel, 'ok'>, LevelConfig> = {
  warn: {
    Icon: AlertTriangle,
    label: 'Warning',
    className: 'bg-amber/10 border-amber/30 text-amber',
  },
  critical: {
    Icon: AlertOctagon,
    label: 'Critical',
    className: 'bg-crimson/10 border-crimson/30 text-crimson',
  },
}

interface AlertBadgeProps {
  level: AlertLevel
  rows: AssetRow[]
}

/**
 * Small badge shown in the card header when one or more assets
 * are below their threshold. Wraps in a Tooltip listing which assets.
 */
export function AlertBadge({ level, rows }: AlertBadgeProps) {
  if (level === 'ok') return null

  const config = LEVEL_CONFIG[level]
  const alertedAssets = rows
    .filter((row) => row.alertLevel === 'warn' || row.alertLevel === 'critical')
    .map((row) => `${row.symbol} (${row.balance.toFixed(4)})`)
    .join(', ')

  return (
    <Tooltip content={`Low balance: ${alertedAssets}`} side="left">
      <span
        className={cn(
          'inline-flex items-center gap-1',
          'px-1.5 py-0.5 rounded border',
          'font-mono text-[9px] font-bold uppercase tracking-wider',
          'cursor-default select-none',
          config.className,
        )}
      >
        <config.Icon size={9} strokeWidth={2.5} />
        {config.label}
      </span>
    </Tooltip>
  )
}
