import { useState, useEffect, useCallback } from 'react'
import { fetchGroups } from '../lib/supabase'
import type { Group } from '../types'

interface UseConfigResult {
  groups: Group[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * Loads groups + entities + assets + thresholds from Supabase.
 * Returns the same shape as the static config.json `groups` array.
 */
export function useConfig(): UseConfigResult {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGroups()
      setGroups(data)
    } catch (error) {
      console.error('useConfig error:', error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { groups, loading, error, reload: load }
}
