/**
 * Evaluates an asset balance against its threshold config.
 *
 * Threshold config (in config.json per asset):
 *   "thresholds": { "warn": 1000, "critical": 200 }
 *
 * Returns: 'critical' | 'warn' | 'ok'
 */
export function getAlertLevel(balance, thresholds) {
  if (!thresholds || balance === null || balance === undefined) return 'ok'
  if (thresholds.critical !== undefined && balance <= thresholds.critical) return 'critical'
  if (thresholds.warn     !== undefined && balance <= thresholds.warn)     return 'warn'
  return 'ok'
}

/**
 * Given all asset rows in a card, returns the worst alert level.
 * Used to show a badge on the card header.
 */
export function getCardAlertLevel(rows) {
  if (!rows?.length) return 'ok'
  if (rows.some(r => r.alertLevel === 'critical')) return 'critical'
  if (rows.some(r => r.alertLevel === 'warn'))     return 'warn'
  return 'ok'
}
