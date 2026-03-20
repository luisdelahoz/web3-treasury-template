import { cn } from '../lib/cn'
import { fmtBalance, fmtUSD } from '../lib/formatters'

const ALERT_ROW = {
  ok:       '',
  warn:     'bg-amber/5 border-l-2 border-l-amber/60',
  critical: 'bg-crimson/5 border-l-2 border-l-crimson/60',
}
const ALERT_BALANCE = {
  ok:       'text-text',
  warn:     'text-amber',
  critical: 'text-crimson',
}
const ALERT_SYMBOL = {
  ok:       'text-text',
  warn:     'text-amber font-bold',
  critical: 'text-crimson font-bold',
}

export function AssetRow({ symbol, name, bal, usd, alertLevel = 'ok' }) {
  return (
    <div className={cn(
      'flex items-center gap-2.5 px-4 py-2.5 transition-colors',
      'border-b border-border/50 last:border-b-0 hover:bg-white/[0.02]',
      ALERT_ROW[alertLevel],
    )}>
      <span className={cn('font-mono text-[10px] w-14 shrink-0', ALERT_SYMBOL[alertLevel])}>
        {symbol}
      </span>
      <span className="text-[10px] text-muted flex-1 truncate">{name}</span>
      <span className={cn('font-mono text-[11px] font-bold text-right whitespace-nowrap', ALERT_BALANCE[alertLevel])}>
        {fmtBalance(bal)}
      </span>
      <span className="font-mono text-[9px] text-muted min-w-[68px] text-right whitespace-nowrap">
        {fmtUSD(usd)}
      </span>
    </div>
  )
}

export function AssetRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/50 last:border-b-0">
      <div className="skeleton h-2.5 w-12 rounded" />
      <div className="skeleton h-2.5 flex-1 rounded mx-2" />
      <div className="skeleton h-2.5 w-[70px] rounded" />
    </div>
  )
}
