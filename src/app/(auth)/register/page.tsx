'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Loader2, Eye, EyeOff, Users, FlaskConical, AlertCircle, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

/* ─── Role options ────────────────────────────────────────────────────────────── */
const ROLE_OPTIONS: {
  value: UserRole
  label: string
  desc: string
  icon: typeof Users
}[] = [
  {
    value: 'community_member',
    label: 'Community Member',
    desc:  'I want to share and verify traditional knowledge from my community.',
    icon:  Users,
  },
  {
    value: 'researcher',
    label: 'Researcher',
    desc:  'I want to access, study, and publish research based on indigenous knowledge.',
    icon:  FlaskConical,
  },
]

/* ─── Password strength ───────────────────────────────────────────────────────── */
interface PasswordStrength {
  score: number   // 0–4
  label: string
  color: string
  width: string
}

function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: '', color: '#E5D8C8', width: '0%' }
  let score = 0
  if (pw.length >= 8)              score++
  if (pw.length >= 12)             score++
  if (/[A-Z]/.test(pw))            score++
  if (/[0-9!@#$%^&*]/.test(pw))   score++

  const levels: PasswordStrength[] = [
    { score: 1, label: 'Weak',      color: '#EF4444', width: '25%'  },
    { score: 2, label: 'Fair',      color: '#F59E0B', width: '50%'  },
    { score: 3, label: 'Good',      color: '#3B82F6', width: '75%'  },
    { score: 4, label: 'Strong',    color: '#15803D', width: '100%' },
  ]
  return levels[score - 1] ?? { score: 0, label: '', color: '#E5D8C8', width: '0%' }
}

/* ─── Page ────────────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [role,      setRole]      = useState<UserRole>('community_member')
  const [community, setCommunity] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  const pwStrength = useMemo(() => getPasswordStrength(password), [password])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, community } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id:        data.user.id,
        full_name: fullName,
        role,
        community: community || null,
      })
    }

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
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DDD0] w-full max-w-lg p-8">

          {/* Icon + heading */}
          <div className="text-center mb-8">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C44B1A)' }}
            >
              <Leaf className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008]">Join Poloko IKS</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Free forever · No card required
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            noValidate
            aria-label="Create account form"
            aria-describedby={error ? 'register-error' : undefined}
            className="space-y-5"
          >

            {/* Role picker */}
            <div>
              <p
                className="text-sm font-semibold text-[#1F2937] mb-2"
                id="role-label"
              >
                I am joining as…
              </p>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="role-label">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  const active = role === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        active
                          ? 'border-[#9A3412] bg-[#FEF9F0]'
                          : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={active}
                        onChange={() => setRole(opt.value)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center',
                          active ? 'bg-[#FEF2E8]' : 'bg-[#F3F0EB]'
                        )}
                      >
                        <Icon
                          className={cn('h-4 w-4', active ? 'text-[#9A3412]' : 'text-[#9CA3AF]')}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className={cn('text-sm font-semibold', active ? 'text-[#9A3412]' : 'text-[#1F2937]')}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Full Name <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                aria-required="true"
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                placeholder="Kabo Modise"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Email Address <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-required="true"
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password + strength */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Password <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  aria-required="true"
                  aria-describedby="pw-strength-label"
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 pr-11 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                  placeholder="At least 8 characters"
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

              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div
                    className="w-full h-1.5 rounded-full bg-[#F3F0EB] overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="pw-bar h-full"
                      style={{
                        width:           pwStrength.width,
                        backgroundColor: pwStrength.color,
                      }}
                    />
                  </div>
                  <p
                    id="pw-strength-label"
                    className="text-xs mt-1 font-medium"
                    style={{ color: pwStrength.color }}
                    aria-live="polite"
                    aria-label={`Password strength: ${pwStrength.label}`}
                  >
                    {pwStrength.label && `Password strength: ${pwStrength.label}`}
                    {pwStrength.score < 3 && password.length >= 8 && (
                      <span className="text-[#9CA3AF] font-normal ml-1">
                        — try adding numbers or uppercase letters
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Community / Organisation */}
            <div>
              <label htmlFor="community" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Community or Organisation
                <span className="font-normal text-[#9CA3AF] ml-1">(optional)</span>
              </label>
              <input
                id="community"
                type="text"
                autoComplete="organization"
                value={community}
                onChange={e => setCommunity(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/10 transition-colors bg-[#FDFBF7]"
                placeholder="e.g. Okavango Research Institute"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                id="register-error"
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DDD0]">
              <Shield className="h-4 w-4 text-[#9A3412] mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-[#6B5344] leading-relaxed">
                Your data is stored securely and never sold. Community knowledge you contribute
                remains governed by the access level you set. You can delete your account at any time.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Creating account…' : 'Create My Free Account'}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#9A3412] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
