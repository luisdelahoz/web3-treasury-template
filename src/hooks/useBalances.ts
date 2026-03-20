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
  const networkConfig = NETWORKS[network]
  const apiKey = API_KEYS[network]
  const apiUrl = `${networkConfig.explorer}?module=account&action=balance&address=${address}&tag=latest${apiKey ? '&apikey=' + apiKey : ''}`
  const apiResponse = (await (await fetch(apiUrl)).json()) as ExplorerResponse
  if (apiResponse.status !== '1')
    throw new Error(apiResponse.message || apiResponse.result || 'API error')
  return parseFloat(apiResponse.result) / 1e18
}

async function fetchERC20(
  wallet: string,
  token: string,
  decimals: number,
  network: NetworkKey,
): Promise<number> {
  const networkConfig = NETWORKS[network]
  const apiKey = API_KEYS[network]
  const apiUrl = `${networkConfig.explorer}?module=account&action=tokenbalance&contractaddress=${token}&address=${wallet}&tag=latest${apiKey ? '&apikey=' + apiKey : ''}`
  const apiResponse = (await (await fetch(apiUrl)).json()) as ExplorerResponse
  if (apiResponse.status !== '1')
    throw new Error(apiResponse.message || apiResponse.result || 'API error')
  return parseFloat(apiResponse.result) / Math.pow(10, decimals)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseBalancesResult {
  loadAll: () => void
  loadEntity: (entity: Entity, groupId: string) => Promise<void>
  getEntity: (entity: Entity, groupId: string) => EntityState
}

export function useBalances(groups: Group[], prices: PricesMap): UseBalancesResult {
  const [balances, setBalances] = useState<BalancesMap>({})

  const buildCacheKey = (entity: Entity, groupId: string) =>
    `${groupId}-${entity.address.toLowerCase()}-${entity.network}`

  const setEntityState = (cacheKey: string, patch: Partial<EntityState>) =>
    setBalances((prev) => ({
      ...prev,
      [cacheKey]: { ...prev[cacheKey], ...patch } as EntityState,
    }))

  const loadEntity = useCallback(
    async (entity: Entity, groupId: string) => {
      const cacheKey = buildCacheKey(entity, groupId)
      const networkConfig = NETWORKS[entity.network]
      if (!networkConfig) return

      setEntityState(cacheKey, { status: 'loading', rows: [], error: null })

      try {
        const rows: AssetRow[] = await Promise.all(
          entity.assets.map(async (asset) => {
            if (asset.type === 'native') {
              const balance = await fetchNative(entity.address, entity.network)
              const usdValue = balance * (prices[networkConfig.geckoId] || 0)
              return {
                symbol: networkConfig.nativeSymbol,
                name: networkConfig.label,
                balance,
                usdValue,
                alertLevel: getAlertLevel(balance, asset.thresholds),
              }
            } else {
              const balance = await fetchERC20(
                entity.address,
                asset.address!,
                asset.decimals,
                entity.network,
              )
              return {
                symbol: asset.symbol,
                name: (asset.address ?? '').slice(0, 10) + '…',
                balance,
                usdValue: 0,
                alertLevel: getAlertLevel(balance, asset.thresholds),
              }
            }
          }),
        )
        setEntityState(cacheKey, { status: 'ok', rows, error: null, updatedAt: new Date() })
      } catch (error) {
        setEntityState(cacheKey, {
          status: 'error',
          rows: [],
          error: error instanceof Error ? error.message : String(error),
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
    balances[buildCacheKey(entity, groupId)] ?? { status: 'idle', rows: [], error: null }

  return { loadAll, loadEntity, getEntity }
}
