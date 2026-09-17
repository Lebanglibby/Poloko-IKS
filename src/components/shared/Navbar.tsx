'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Leaf, BookOpen, Map, FlaskConical, LayoutDashboard,
  LogOut, KeyRound, Bell, Search, Globe, ChevronDown,
  User, ShieldCheck, Users, Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'

/* ─── Role meta ─────────────────────────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, { label: string; color: string; icon: typeof User }> = {
  admin:            { label: 'Admin',            color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Crown },
  elder:            { label: 'Community Elder',  color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',   icon: ShieldCheck },
  researcher:       { label: 'Researcher',       color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',      icon: FlaskConical },
  community_member: { label: 'Community Member', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Users },
}

/* ─── Nav links ─────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/vault',     label: { en: 'Knowledge Vault', tn: 'Letlole la Kitso' }, icon: BookOpen },
  { href: '/map',       label: { en: 'Resource Map',    tn: 'Mmepameno'        }, icon: Map      },
  { href: '/research',  label: { en: 'Research Hub',    tn: 'Setsi sa Dipatlisiso' }, icon: FlaskConical },
  { href: '/dashboard', label: { en: 'Dashboard',       tn: 'Laesense'         }, icon: LayoutDashboard, authRequired: true },
  { href: '/api-keys',  label: { en: 'API Keys',        tn: 'Dikirii tsa API'  }, icon: KeyRound, roles: ['researcher', 'admin'] },
]

interface NavbarProps {
  userRole?: string | null
  pendingNotifications?: number
}

export function Navbar({ userRole, pendingNotifications = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [lang, setLang] = useState<'en' | 'tn'>('en')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchVal.trim()) return
    const destination = pathname.startsWith('/research') ? '/research' : '/vault'
    router.push(`${destination}?search=${encodeURIComponent(searchVal.trim())}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  const roleConf = userRole ? ROLE_CONFIG[userRole] : null
  const RoleIcon = roleConf?.icon ?? User

  return (
    <>
      {/* ── Main bar ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Poloko IKS — Home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/30 group-hover:bg-emerald-600/30 transition-colors">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            </span>
            <span className="font-bold text-slate-100 text-sm tracking-tight hidden sm:block">
              Poloko <span className="text-emerald-400">IKS</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-700 hidden sm:block" aria-hidden="true" />

          {/* Nav links */}
          <div className="flex items-center gap-0.5 overflow-x-auto flex-1" role="list">
            {NAV_LINKS.map(({ href, label, icon: Icon, authRequired, roles }) => {
              if (authRequired && !userRole) return null
              if (roles && (!userRole || !roles.includes(userRole))) return null
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  role="listitem"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                    active
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {label[lang]}
                </Link>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Universal search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                searchOpen
                  ? 'bg-slate-700 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
              aria-label="Toggle universal search"
              aria-expanded={searchOpen}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'tn' : 'en')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label={lang === 'en' ? 'Switch to Setswana' : 'Switch to English'}
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="uppercase tracking-wide hidden sm:block">{lang}</span>
            </button>

            {/* Notification bell */}
            {userRole && (
              <Link
                href="/access-requests"
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label={`Notifications${pendingNotifications > 0 ? `, ${pendingNotifications} pending` : ''}`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {pendingNotifications > 0 && (
                  <span
                    className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white leading-none"
                    aria-hidden="true"
                  >
                    {pendingNotifications > 9 ? '9+' : pendingNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-slate-700 mx-1" aria-hidden="true" />

            {/* Auth controls */}
            {userRole ? (
              <>
                {/* Submit CTA */}
                <Link
                  href="/submit"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  + {lang === 'en' ? 'Submit' : 'Romela'}
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      profileOpen
                        ? 'bg-slate-700 border-slate-600 text-slate-200'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      roleConf?.color
                    )}
                    aria-label="User profile menu"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >
                    <RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden md:block">{roleConf?.label ?? userRole}</span>
                    <ChevronDown className={cn('h-3 w-3 transition-transform', profileOpen && 'rotate-180')} aria-hidden="true" />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-700 bg-slate-800 shadow-xl shadow-black/40 py-1 z-50"
                      role="menu"
                      aria-label="User menu"
                    >
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        Dashboard
                      </Link>
                      <Link
                        href="/audit"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        Audit Log
                      </Link>
                      <div className="my-1 h-px bg-slate-700" role="separator" />
                      <button
                        role="menuitem"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {lang === 'en' ? 'Sign In' : 'Tsena'}
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {lang === 'en' ? 'Register' : 'Ikwadise'}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Universal search bar (expandable) ─────────────────────────────── */}
        {searchOpen && (
          <div className="border-t border-slate-700/60 bg-slate-900/98 px-4 sm:px-6 py-3">
            <form onSubmit={handleSearch} className="max-w-screen-xl mx-auto">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Search knowledge entries, research listings, categories…'
                      : 'Batla dipotso tsa kitso, dipatlisiso…'
                  }
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  aria-label="Universal search"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <kbd className="hidden sm:flex h-5 items-center px-1.5 rounded bg-slate-700 text-[10px] text-slate-400 font-mono border border-slate-600">
                    ↵
                  </kbd>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchVal('') }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-1"
                    aria-label="Close search"
                  >
                    esc
                  </button>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 mt-2.5 flex-wrap" role="group" aria-label="Quick filter chips">
                {['Traditional Practices', 'Medicinal Plants', 'Conservation', 'Cultural Narratives', 'Open Collaboration'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSearchVal(chip)}
                    className="px-2.5 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}
      </nav>
    </>
  )
}
