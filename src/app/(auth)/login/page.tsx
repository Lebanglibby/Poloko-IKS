'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">

      {/* Top bar */}
      <div className="border-b border-[#E8DDD0] bg-white px-6 py-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 w-fit group"
          aria-label="Back to Poloko IKS home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9A3412] group-hover:bg-[#7C2D12] transition-colors">
            <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-[#9A3412] group-hover:text-[#7C2D12] transition-colors">
            Poloko IKS
          </span>
        </Link>
      </div>

      {/* Kente accent */}
      <div className="h-1 kente-stripe shrink-0" aria-hidden="true" />

      {/* Form card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DDD0] w-full max-w-md p-8">

          {/* Icon + heading */}
          <div className="text-center mb-8">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C44B1A)' }}
            >
              <Leaf className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008]">Welcome back</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Sign in to your Poloko IKS account</p>
          </div>

          <form
            onSubmit={handleLogin}
            noValidate
            aria-label="Sign in form"
            aria-describedby={error ? 'login-error' : undefined}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-required="true"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-[#1F2937]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#9A3412] hover:underline transition-colors"
                  aria-label="Forgot your password? Reset it here"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  aria-required="true"
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 pr-11 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                >
                  {showPw
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye    className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                id="login-error"
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#9A3412] font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Browse without account */}
          <div className="mt-5 pt-5 border-t border-[#F3F0EB] text-center">
            <Link
              href="/vault"
              className="text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
            >
              Browse the archive without signing in →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
