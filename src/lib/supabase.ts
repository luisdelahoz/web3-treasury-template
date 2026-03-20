import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { Asset, Entity, Group, NetworkKey, AssetType, Threshold } from '../types'

// ── Client ────────────────────────────────────────────────────────────────────

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// ── Raw DB row types ──────────────────────────────────────────────────────────

interface DbGroup {
  id: string
  label: string
  icon: string
  sort_order: number
}

interface DbEntity {
  id: string
  name: string
  address: string
  network: NetworkKey
  group_id: string
  enabled: boolean
  sort_order: number
}

interface DbAsset {
  id: string
  entity_id: string
  type: AssetType
  symbol: string
  decimals: number | null
  address: string | null
  sort_order: number
}

interface DbThreshold {
  id: string
  asset_id: string
  warn: number
  critical: number
}

// ── Config query ──────────────────────────────────────────────────────────────
// Fetches the full config tree in 4 queries and assembles it into:
//
// [
//   {
//     id, label, icon,
//     entities: [
//       { id, name, address, network,
//         assets: [{ id, type, symbol, address, decimals, thresholds }] }
//     ]
//   }
// ]

export async function fetchGroups(): Promise<Group[]> {
  // 1. Groups
  const { data: groups, error: gErr } = await supabase
    .from('groups')
    .select('*')
    .order('sort_order')
  if (gErr) throw gErr

  // 2. Entities
  const { data: entities, error: eErr } = await supabase
    .from('entities')
    .select('*')
    .eq('enabled', true)
    .order('sort_order')
  if (eErr) throw eErr

  // 3. Assets
  const { data: assets, error: aErr } = await supabase
    .from('assets')
    .select('*')
    .order('sort_order')
  if (aErr) throw aErr

  // 4. Thresholds
  const { data: thresholds, error: tErr } = await supabase.from('thresholds').select('*')
  if (tErr) throw tErr

  // ── Assemble ──────────────────────────────────────────────────────────────

  const thresholdsByAsset = Object.fromEntries(
    (thresholds as DbThreshold[]).map((threshold) => [
      threshold.asset_id,
      { warn: threshold.warn, critical: threshold.critical } satisfies Threshold,
    ]),
  )

  type AssetWithMeta = Asset & { _entityId: string }
  type EntityWithMeta = Entity & { _groupId: string }

  const assetsWithMeta: AssetWithMeta[] = (assets as DbAsset[]).map((asset) => ({
    id: asset.id,
    type: asset.type,
    symbol: asset.symbol,
    address: asset.address ?? undefined,
    decimals: asset.decimals ?? 18,
    thresholds: thresholdsByAsset[asset.id] ?? null,
    _entityId: asset.entity_id,
  }))

  const entitiesWithMeta: EntityWithMeta[] = (entities as DbEntity[]).map((entity) => ({
    id: entity.id,
    name: entity.name,
    address: entity.address,
    network: entity.network,
    assets: assetsWithMeta
      .filter((asset) => asset._entityId === entity.id)
      .map(({ _entityId: _dropped, ...rest }) => rest),
    _groupId: entity.group_id,
  }))

  return (groups as DbGroup[]).map((group) => ({
    id: group.id,
    label: group.label,
    icon: group.icon,
    entities: entitiesWithMeta
      .filter((entity) => entity._groupId === group.id)
      .map(({ _groupId: _dropped, ...rest }) => rest),
  }))
}
