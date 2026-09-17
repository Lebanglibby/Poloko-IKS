'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Loader2, Eye, EyeOff, Users, FlaskConical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string; icon: typeof Users }[] = [
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
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
      <div className="border-b border-[#E8DDD0] bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit" aria-label="Back to home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9A3412]">
            <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-[#9A3412]">Poloko IKS</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DDD0] w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <div className="h-14 w-14 bg-[#9A3412] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Leaf className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Join Poloko IKS</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Create your free account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            {/* Role picker */}
            <div>
              <p className="text-sm font-semibold text-[#1F2937] mb-2">I am joining as…</p>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  const active = role === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        active
                          ? 'border-[#9A3412] bg-[#FEF9F0]'
                          : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={active}
                        onChange={() => setRole(opt.value)}
                        className="sr-only"
                      />
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? 'bg-[#FEF2E8]' : 'bg-[#F3F0EB]'}`}>
                        <Icon className={`h-4 w-4 ${active ? 'text-[#9A3412]' : 'text-[#9CA3AF]'}`} aria-hidden="true" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? 'text-[#9A3412]' : 'text-[#1F2937]'}`}>{opt.label}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#1F2937] mb-1.5">Full Name</label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                placeholder="Kabo Modise"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2937] mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 pr-11 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Community */}
            <div>
              <label htmlFor="community" className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Community or Organisation <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <input
                id="community"
                type="text"
                value={community}
                onChange={e => setCommunity(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                placeholder="e.g. Okavango Research Institute"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Creating account…' : 'Create My Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9CA3AF] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#9A3412] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
