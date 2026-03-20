import { useState, useEffect, useCallback } from 'react'
import type { PricesMap } from '../types'

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd'

interface UsePricesResult {
  prices:  PricesMap
  loading: boolean
  refetch: () => Promise<void>
}

export function usePrices(): UsePricesResult {
  const [prices,  setPrices]  = useState<PricesMap>({ ethereum: 0, 'matic-network': 0 })
  const [loading, setLoading] = useState(true)

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(COINGECKO_URL)
      const data = await response.json() as Record<string, { usd?: number }>
      setPrices({
        ethereum:        data?.ethereum?.usd          || 0,
        'matic-network': data?.['matic-network']?.usd || 0,
      })
    } catch (error) {
      console.warn('CoinGecko fetch failed', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  return { prices, loading, refetch: fetchPrices }
}
