import { createClient } from '@supabase/supabase-js'

// ── Client ────────────────────────────────────────────────────────
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// ── Auth helpers ──────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// ── Config query ──────────────────────────────────────────────────
// Fetches the full config tree in 4 queries and assembles it into
// the same shape the rest of the app already expects:
//
// [
//   {
//     id: 'wallets', label: 'Wallets', icon: '◈',
//     entities: [
//       {
//         id, name, address, network,
//         assets: [
//           { id, type, symbol, address, decimals,
//             thresholds: { warn, critical } | null }
//         ]
//       }
//     ]
//   }
// ]

export async function fetchGroups() {
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
  const { data: thresholds, error: tErr } = await supabase
    .from('thresholds')
    .select('*')
  if (tErr) throw tErr

  // ── Assemble ────────────────────────────────────────────────────
  const thresholdsByAsset = Object.fromEntries(
    thresholds.map(t => [t.asset_id, { warn: t.warn, critical: t.critical }])
  )

  const assetsWithThresholds = assets.map(a => ({
    id:         a.id,
    type:       a.type,
    symbol:     a.symbol,
    address:    a.address,
    decimals:   a.decimals ?? 18,
    thresholds: thresholdsByAsset[a.id] ?? null,
    _entityId:  a.entity_id,            // internal, stripped below
  }))

  const entitiesWithAssets = entities.map(e => ({
    id:      e.id,
    name:    e.name,
    address: e.address,
    network: e.network,
    assets:  assetsWithThresholds
               .filter(a => a._entityId === e.id)
               .map(({ _entityId, ...rest }) => rest),
    _groupId: e.group_id,               // internal, stripped below
  }))

  return groups.map(g => ({
    id:       g.id,
    label:    g.label,
    icon:     g.icon,
    entities: entitiesWithAssets
                .filter(e => e._groupId === g.id)
                .map(({ _groupId, ...rest }) => rest),
  }))
}
