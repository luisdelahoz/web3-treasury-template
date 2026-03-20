import { useState, useCallback } from 'react'
import { NETWORKS, API_KEYS } from '../lib/constants'
import { getAlertLevel } from '../lib/thresholds'

async function fetchNative(address, network) {
  const net = NETWORKS[network]
  const key = API_KEYS[network]
  const url = `${net.explorer}?module=account&action=balance&address=${address}&tag=latest${key ? '&apikey=' + key : ''}`
  const d = await (await fetch(url)).json()
  if (d.status !== '1') throw new Error(d.message || d.result || 'API error')
  return parseFloat(d.result) / 1e18
}

async function fetchERC20(wallet, token, decimals, network) {
  const net = NETWORKS[network]
  const key = API_KEYS[network]
  const url = `${net.explorer}?module=account&action=tokenbalance&contractaddress=${token}&address=${wallet}&tag=latest${key ? '&apikey=' + key : ''}`
  const d = await (await fetch(url)).json()
  if (d.status !== '1') throw new Error(d.message || d.result || 'API error')
  return parseFloat(d.result) / Math.pow(10, decimals)
}

export function useBalances(groups, prices) {
  const [balances, setBalances] = useState({})

  const entityKey = (entity, groupId) =>
    `${groupId}-${entity.address.toLowerCase()}-${entity.network}`

  const setEntity = (key, patch) =>
    setBalances(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const loadEntity = useCallback(async (entity, groupId) => {
    const key = entityKey(entity, groupId)
    const net = NETWORKS[entity.network]
    if (!net) return

    setEntity(key, { status: 'loading', rows: [], error: null })

    try {
      const rows = await Promise.all(
        entity.assets.map(async asset => {
          if (asset.type === 'native') {
            const bal = await fetchNative(entity.address, entity.network)
            const usd = bal * (prices[net.geckoId] || 0)
            return {
              symbol: net.nativeSym,
              name: net.label,
              bal, usd,
              alertLevel: getAlertLevel(bal, asset.thresholds),
            }
          } else {
            const bal = await fetchERC20(entity.address, asset.address, asset.decimals, entity.network)
            return {
              symbol: asset.symbol,
              name: asset.address.slice(0, 10) + '…',
              bal, usd: 0,
              alertLevel: getAlertLevel(bal, asset.thresholds),
            }
          }
        })
      )
      setEntity(key, { status: 'ok', rows, error: null, updatedAt: new Date() })
    } catch (err) {
      setEntity(key, { status: 'error', rows: [], error: err.message, updatedAt: new Date() })
    }
  }, [prices])

  const loadAll = useCallback(() => {
    groups.forEach(group =>
      group.entities.forEach(entity => loadEntity(entity, group.id))
    )
  }, [groups, loadEntity])

  const getEntity = (entity, groupId) =>
    balances[entityKey(entity, groupId)] || { status: 'idle', rows: [], error: null }

  return { loadAll, loadEntity, getEntity }
}
