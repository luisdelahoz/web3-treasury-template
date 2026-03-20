import type { AlertLevel, AssetRow, Threshold } from '../types'

/**
 * Evaluates an asset balance against its threshold config.
 * Returns: 'critical' | 'warn' | 'ok'
 */
export function getAlertLevel(
  balance: number | null | undefined,
  thresholds: Threshold | null | undefined,
): AlertLevel {
  if (!thresholds || balance === null || balance === undefined) return 'ok'
  if (thresholds.critical !== undefined && balance <= thresholds.critical) return 'critical'
  if (thresholds.warn !== undefined && balance <= thresholds.warn) return 'warn'
  return 'ok'
}

/**
 * Given all asset rows in a card, returns the worst alert level.
 */
export function getCardAlertLevel(rows: AssetRow[]): AlertLevel {
  if (!rows?.length) return 'ok'
  if (rows.some((r) => r.alertLevel === 'critical')) return 'critical'
  if (rows.some((r) => r.alertLevel === 'warn')) return 'warn'
  return 'ok'
}
