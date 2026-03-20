import { useState, useEffect, useCallback } from 'react'
import { fetchGroups } from '../lib/supabase'

/**
 * Loads groups + entities + assets + thresholds from Supabase.
 * Returns the same shape as the static config.json `groups` array
 * so the rest of the app is unchanged.
 *
 * { groups, loading, error, reload }
 */
export function useConfig() {
  const [groups,  setGroups]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGroups()
      setGroups(data)
    } catch (err) {
      console.error('useConfig error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { groups, loading, error, reload: load }
}
