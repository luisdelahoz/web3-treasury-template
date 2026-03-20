import { useState } from 'react'
import { LogIn, Loader2 } from 'lucide-react'
import { signIn } from '../lib/supabase'
import { cn } from '../lib/cn'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      // onAuthChange in App.tsx will pick up the new session automatically
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
               linear-gradient(rgba(0,229,160,0.018) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,229,160,0.018) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div
          className="flex items-center justify-center gap-2.5 mb-8
                        font-mono uppercase tracking-[0.2em] text-[color:var(--accent)]"
        >
          <div
            className="w-8 h-8 border-[1.5px] border-[color:var(--accent)]
                          rounded-md flex items-center justify-center text-base"
          >
            ◈
          </div>
          <span className="text-sm">Treasury Monitor</span>
        </div>

        {/* Card */}
        <div
          className="accent-top relative bg-surface border border-border rounded-xl
                        px-8 py-8 overflow-hidden"
        >
          <h1 className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mb-6">
            Acceso
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={cn(
                  'bg-surface2 border border-border rounded px-3 py-2',
                  'font-mono text-[11px] text-text placeholder:text-dim',
                  'outline-none transition-colors',
                  'focus:border-[color:var(--accent)]',
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'bg-surface2 border border-border rounded px-3 py-2',
                  'font-mono text-[11px] text-text placeholder:text-dim',
                  'outline-none transition-colors',
                  'focus:border-[color:var(--accent)]',
                )}
              />
            </div>

            {error && (
              <p
                className="font-mono text-[9px] text-crimson bg-crimson/5
                            border border-crimson/20 rounded px-3 py-2"
              >
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'flex items-center justify-center gap-2 mt-2',
                'bg-[color:var(--accent)] text-bg',
                'font-mono text-[10px] uppercase tracking-[0.15em] font-bold',
                'px-4 py-2.5 rounded transition-opacity',
                'disabled:opacity-60 disabled:cursor-default',
                'hover:opacity-90',
              )}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[8px] text-dim mt-4">
          Gestiona usuarios en Supabase → Authentication
        </p>
      </div>
    </div>
  )
}
