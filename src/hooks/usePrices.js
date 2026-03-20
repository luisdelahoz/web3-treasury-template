import { useState, useEffect, useCallback } from 'react'

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd'

export function usePrices() {
  const [prices, setPrices] = useState({ ethereum: 0, 'matic-network': 0 })
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch(COINGECKO_URL)
      const d = await r.json()
      setPrices({
        ethereum:       d?.ethereum?.usd          || 0,
        'matic-network': d?.['matic-network']?.usd || 0,
      })
    } catch (e) {
      console.warn('CoinGecko fetch failed', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { prices, loading, refetch: fetch_ }
}
