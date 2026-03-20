export function fmtBalance(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  if (n === 0) return '0'
  if (n < 0.0001) return '< 0.0001'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(4)
}

export function fmtUSD(n) {
  if (!n || n === 0) return ''
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(2)
}

export function shortAddr(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export function fmtTime(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(date) {
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}
