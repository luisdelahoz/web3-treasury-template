// ── Primitives ────────────────────────────────────────────────────────────────

export type AlertLevel = 'critical' | 'warn' | 'ok'
export type EntityStatus = 'idle' | 'loading' | 'ok' | 'error'
export type AssetType = 'native' | 'erc20'
export type NetworkKey = 'ethereum' | 'polygon'
export type NetworkCls = 'eth' | 'poly'

// ── Network ───────────────────────────────────────────────────────────────────

export interface NetworkConfig {
  icon: string
  label: string
  colorVariant: NetworkCls
  nativeSymbol: string
  geckoId: string
  explorer: string
  envKey: string
}

// ── Domain models ─────────────────────────────────────────────────────────────

export interface Threshold {
  warn: number
  critical: number
}

export interface Asset {
  id: string
  type: AssetType
  symbol: string
  decimals: number
  address?: string
  thresholds: Threshold | null
}

export interface Entity {
  id: string
  name: string
  address: string
  network: NetworkKey
  assets: Asset[]
}

export interface Group {
  id: string
  label: string
  icon: string
  entities: Entity[]
}

// ── Balance state ─────────────────────────────────────────────────────────────

export interface AssetRow {
  symbol: string
  name: string
  balance: number
  usdValue: number
  alertLevel: AlertLevel
}

export interface EntityState {
  status: EntityStatus
  rows: AssetRow[]
  error: string | null
  updatedAt?: Date
}

export type BalancesMap = Record<string, EntityState>

// ── Prices ────────────────────────────────────────────────────────────────────

export type PricesMap = Record<string, number>
