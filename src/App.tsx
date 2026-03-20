import { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw, LogOut, Loader2 } from 'lucide-react'
import { TooltipProvider } from './components/ui/Tooltip'
import { TotalsBar } from './components/TotalsBar'
import { Section } from './components/Section'
import { Login } from './pages/Login'
import { usePrices } from './hooks/usePrices'
import { useBalances } from './hooks/useBalances'
import { useConfig } from './hooks/useConfig'
import { onAuthChange, signOut, supabase } from './lib/supabase'
import { cn } from './lib/cn'
import type { User } from '@supabase/supabase-js'
import staticConfig from '../config.json'
import './index.css'

const { project, refresh_interval_seconds: refreshIntervalSeconds = 60 } = staticConfig

// Apply accent color from config
const accentColor = project.accent || '#00e5a0'
document.documentElement.style.setProperty('--accent', accentColor)
document.title = project.name

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = checking auth
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const {
      data: { subscription },
    } = onAuthChange(setUser)
    return () => subscription.unsubscribe()
  }, [])

  // ── Config from Supabase ──────────────────────────────────────────────────

  const { groups, loading: configLoading, error: configError, reload: reloadConfig } = useConfig()

  // ── Balances ──────────────────────────────────────────────────────────────

  const { prices, refetch: refetchPrices } = usePrices()
  const { loadAll, getEntity } = useBalances(groups, prices)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetchPrices()
    loadAll()
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }, [loadAll, refetchPrices])

  // Always keep a ref pointing to the latest refresh callback so effects
  // never hold a stale closure without needing refresh in their dep arrays.
  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
  })

  // Load balances once config is ready
  useEffect(() => {
    if (!configLoading && groups.length > 0) void refreshRef.current()
  }, [configLoading, groups.length])

  // Auto-refresh on interval (refreshIntervalSeconds is a module-level constant)
  useEffect(() => {
    timerRef.current = setInterval(() => void refreshRef.current(), refreshIntervalSeconds * 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={20} className="text-muted animate-spin" />
      </div>
    )
  }

  if (user === null) return <Login />

  // ── Config error ──────────────────────────────────────────────────────────

  if (configError) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div
          className="max-w-md bg-surface border border-crimson/30 rounded-xl p-6
                        font-mono text-[11px] text-crimson"
        >
          <p className="font-bold text-sm mb-2">⚠ Error cargando config desde Supabase</p>
          <p className="text-crimson/70 mb-4">{configError}</p>
          <button
            onClick={reloadConfig}
            className="px-3 py-1.5 border border-crimson/30 rounded text-[9px]
                             uppercase tracking-wider hover:border-crimson transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="relative z-10">
        {/* Header */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between
                           px-8 py-[18px] border-b border-border
                           bg-bg/85 backdrop-blur-md"
        >
          <div
            className="flex items-center gap-2.5 font-mono uppercase tracking-[0.2em]
                          text-[color:var(--accent)]"
          >
            <div
              className="w-[30px] h-[30px] border-[1.5px] border-[color:var(--accent)]
                            rounded-md flex items-center justify-center text-sm"
            >
              ◈
            </div>
            <div>
              <div className="text-[12px]">{project.name}</div>
              {project.tagline && (
                <div className="text-[9px] text-muted tracking-[0.15em] mt-0.5 normal-case">
                  {project.tagline}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-muted hidden sm:block">{user.email}</span>

            <div className="w-px h-4 bg-border" />

            <div
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase
                            tracking-[0.2em] text-[color:var(--accent)]"
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]
                              animate-[pulse_2s_infinite]"
              />
              Live
            </div>

            <button
              onClick={refresh}
              disabled={isRefreshing || configLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded',
                'border border-border2 text-muted',
                'font-mono text-[9px] uppercase tracking-[0.1em]',
                'transition-all duration-200 cursor-pointer',
                'hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]',
                'disabled:opacity-50 disabled:cursor-default',
              )}
            >
              <RefreshCw
                size={11}
                strokeWidth={2.5}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            <button
              onClick={signOut}
              title="Cerrar sesión"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded',
                'border border-border2 text-muted',
                'font-mono text-[9px] uppercase tracking-[0.1em]',
                'transition-all duration-200 cursor-pointer',
                'hover:border-crimson hover:text-crimson',
              )}
            >
              <LogOut size={11} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="px-8 py-7 max-w-[1440px] mx-auto">
          {configLoading ? (
            <div
              className="flex items-center justify-center py-24 gap-3
                              font-mono text-[10px] text-muted"
            >
              <Loader2 size={14} className="animate-spin" />
              Cargando configuración…
            </div>
          ) : (
            <>
              <TotalsBar groups={groups} getEntity={getEntity} lastRefresh={lastRefresh} />
              {groups.map((group) => (
                <Section key={group.id} group={group} getEntity={getEntity} />
              ))}
            </>
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}
