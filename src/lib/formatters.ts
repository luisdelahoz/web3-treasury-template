export function formatBalance(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '—'
  if (n === 0) return '0'
  if (n < 0.0001) return '< 0.0001'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(4)
}

export function formatUSD(n: number | null | undefined): string {
  if (!n || n === 0) return ''
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(2)
}

export function shortenAddress(addr: string): string {
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}
