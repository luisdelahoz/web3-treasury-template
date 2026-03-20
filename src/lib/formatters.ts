export function formatBalance(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'
  if (value === 0) return '0'
  if (value < 0.0001) return '< 0.0001'
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K'
  return value.toFixed(4)
}

export function formatUSD(value: number | null | undefined): string {
  if (!value || value === 0) return ''
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

export function shortenAddress(address: string): string {
  return address.slice(0, 6) + '…' + address.slice(-4)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}
