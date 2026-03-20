import { useState, useCallback } from 'react'
import { NETWORKS, API_KEYS } from '../lib/constants'
import { getAlertLevel } from '../lib/thresholds'
import type {
  Entity,
  Group,
  NetworkKey,
  EntityState,
  BalancesMap,
  PricesMap,
  AssetRow,
} from '../types'

// ── Explorer API ──────────────────────────────────────────────────────────────

interface ExplorerResponse {
  status: string
  message: string
  result: string
}

async function fetchNative(address: string, network: NetworkKey): Promise<number> {
  const net = NETWORKS[network]
  const key = API_KEYS[network]
  const url = `${net.explorer}?module=account&action=balance&address=${address}&tag=latest${key ? '&apikey=' + key : ''}`
  const d = (await (await fetch(url)).json()) as ExplorerResponse
  if (d.status !== '1') throw new Error(d.message || d.result || 'API error')
  return parseFloat(d.result) / 1e18
}

async function fetchERC20(
  wallet: string,
  token: string,
  decimals: number,
  network: NetworkKey,
): Promise<number> {
  const net = NETWORKS[network]
  const key = API_KEYS[network]
  const url = `${net.explorer}?module=account&action=tokenbalance&contractaddress=${token}&address=${wallet}&tag=latest${key ? '&apikey=' + key : ''}`
  const d = (await (await fetch(url)).json()) as ExplorerResponse
  if (d.status !== '1') throw new Error(d.message || d.result || 'API error')
  return parseFloat(d.result) / Math.pow(10, decimals)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseBalancesResult {
  loadAll: () => void
  loadEntity: (entity: Entity, groupId: string) => Promise<void>
  getEntity: (entity: Entity, groupId: string) => EntityState
}

export function useBalances(groups: Group[], prices: PricesMap): UseBalancesResult {
  const [balances, setBalances] = useState<BalancesMap>({})

  const entityKey = (entity: Entity, groupId: string) =>
    `${groupId}-${entity.address.toLowerCase()}-${entity.network}`

  const setEntity = (key: string, patch: Partial<EntityState>) =>
    setBalances((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch } as EntityState,
    }))

  const loadEntity = useCallback(
    async (entity: Entity, groupId: string) => {
      const key = entityKey(entity, groupId)
      const net = NETWORKS[entity.network]
      if (!net) return

      setEntity(key, { status: 'loading', rows: [], error: null })

      try {
        const rows: AssetRow[] = await Promise.all(
          entity.assets.map(async (asset) => {
            if (asset.type === 'native') {
              const bal = await fetchNative(entity.address, entity.network)
              const usd = bal * (prices[net.geckoId] || 0)
              return {
                symbol: net.nativeSym,
                name: net.label,
                bal,
                usd,
                alertLevel: getAlertLevel(bal, asset.thresholds),
              }
            } else {
              const bal = await fetchERC20(
                entity.address,
                asset.address!,
                asset.decimals,
                entity.network,
              )
              return {
                symbol: asset.symbol,
                name: (asset.address ?? '').slice(0, 10) + '…',
                bal,
                usd: 0,
                alertLevel: getAlertLevel(bal, asset.thresholds),
              }
            }
          }),
        )
        setEntity(key, { status: 'ok', rows, error: null, updatedAt: new Date() })
      } catch (err) {
        setEntity(key, {
          status: 'error',
          rows: [],
          error: err instanceof Error ? err.message : String(err),
          updatedAt: new Date(),
        })
      }
    },
    [prices],
  )

  const loadAll = useCallback(() => {
    groups.forEach((group) => group.entities.forEach((entity) => loadEntity(entity, group.id)))
  }, [groups, loadEntity])

  const getEntity = (entity: Entity, groupId: string): EntityState =>
    balances[entityKey(entity, groupId)] ?? { status: 'idle', rows: [], error: null }

  return { loadAll, loadEntity, getEntity }
}
