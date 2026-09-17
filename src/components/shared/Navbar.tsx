'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Leaf, BookOpen, Map, FlaskConical, LayoutDashboard,
  LogOut, KeyRound, Bell, Search, Globe, ChevronDown,
  Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'

/* ─── Role labels ────────────────────────────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  admin:            'Administrator',
  elder:            'Community Elder',
  researcher:       'Researcher',
  community_member: 'Community Member',
}

/* ─── Nav links ──────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/vault',     label: { en: 'Knowledge Vault',  tn: 'Letlole la Kitso'     }, icon: BookOpen      },
  { href: '/map',       label: { en: 'Resource Map',     tn: 'Mmepameno'            }, icon: Map           },
  { href: '/research',  label: { en: 'Research Hub',     tn: 'Setsi sa Dipatlisiso' }, icon: FlaskConical  },
  { href: '/dashboard', label: { en: 'My Dashboard',     tn: 'Laesense ya me'       }, icon: LayoutDashboard, authRequired: true },
  { href: '/api-keys',  label: { en: 'API Keys',         tn: 'Dikirii tsa API'      }, icon: KeyRound,       roles: ['researcher', 'admin'] },
]

interface NavbarProps {
  userRole?: string | null
  pendingNotifications?: number
}

export function Navbar({ userRole, pendingNotifications = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const [lang, setLang]           = useState<'en' | 'tn'>('en')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const [menuOpen, setMenuOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const searchRef  = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchVal.trim()) return
    const dest = pathname.startsWith('/research') ? '/research' : '/vault'
    router.push(`${dest}?search=${encodeURIComponent(searchVal.trim())}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  return (
    <>
      {/* ── Main bar ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 bg-white border-b border-[#E8DDD0] shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Poloko IKS — Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9A3412] shadow-sm">
              <Leaf className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} aria-hidden="true" />
            </span>
            <div className="hidden sm:block leading-tight">
              <span className="block font-bold text-[#9A3412] text-base tracking-tight">Poloko IKS</span>
              <span className="block text-[10px] text-[#9CA3AF] tracking-wide uppercase font-medium">
                {lang === 'en' ? 'Indigenous Knowledge Vault' : 'Letlole la Kitso ya Setso'}
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1 mx-2" role="list">
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
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    active
                      ? 'bg-[#FEF2E8] text-[#9A3412] font-semibold'
                      : 'text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0]'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label[lang]}
                </Link>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                searchOpen
                  ? 'bg-[#FEF2E8] text-[#9A3412]'
                  : 'text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0]'
              )}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'tn' : 'en')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8DDD0] bg-white text-sm font-medium text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] transition-colors"
              aria-label={lang === 'en' ? 'Switch to Setswana' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="font-semibold">{lang === 'en' ? 'EN' : 'TN'}</span>
            </button>

            {/* Notification bell */}
            {userRole && (
              <Link
                href="/access-requests"
                className="relative p-2 rounded-lg text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors"
                aria-label={`Notifications${pendingNotifications > 0 ? `, ${pendingNotifications} pending approvals` : ''}`}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {pendingNotifications > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B45309] text-[9px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {pendingNotifications > 9 ? '9+' : pendingNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Auth area */}
            {userRole ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                    profileOpen
                      ? 'border-[#9A3412] bg-[#FEF2E8] text-[#9A3412]'
                      : 'border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412]'
                  )}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="Your account"
                >
                  <span className="h-6 w-6 rounded-full bg-[#FEF2E8] border border-[#FDBA74] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#9A3412]" aria-hidden="true">
                      {(ROLE_LABELS[userRole] ?? userRole).charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span className="hidden lg:block max-w-[120px] truncate">
                    {ROLE_LABELS[userRole] ?? userRole}
                  </span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform', profileOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#E8DDD0] bg-white shadow-lg shadow-[#9A3412]/5 py-1.5 z-50"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-[#F3F0EB] mb-1">
                      <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1F2937] mt-0.5">
                        {ROLE_LABELS[userRole] ?? userRole}
                      </p>
                    </div>
                    {[
                      { href: '/dashboard', label: 'My Dashboard',  icon: LayoutDashboard },
                      { href: '/submit',    label: 'Submit Knowledge', icon: Leaf          },
                      { href: '/audit',     label: 'Audit Log',     icon: KeyRound        },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#FEF9F0] hover:text-[#9A3412] transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Icon className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-[#F3F0EB]" role="separator" />
                    <button
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors"
                >
                  {lang === 'en' ? 'Sign In' : 'Tsena'}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm"
                >
                  {lang === 'en' ? 'Register' : 'Ikwadise'}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-[#4B5563] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <X className="h-5 w-5" aria-hidden="true" />
                : <Menu className="h-5 w-5" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="border-t border-[#E8DDD0] bg-[#FDFBF7] px-4 sm:px-6 py-4">
            <form onSubmit={handleSearch} className="max-w-screen-xl mx-auto">
              <div className="relative max-w-2xl mx-auto">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Search for knowledge, plants, practices, stories…'
                      : 'Batla kitso, dimela, ditso…'
                  }
                  className="w-full pl-12 pr-24 py-3 rounded-xl bg-white border-2 border-[#E8DDD0] text-[#1F2937] placeholder-[#9CA3AF] text-base focus:outline-none focus:border-[#9A3412] transition-colors shadow-sm"
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#9A3412] text-white text-sm font-semibold hover:bg-[#7C2D12] transition-colors"
                >
                  {lang === 'en' ? 'Search' : 'Batla'}
                </button>
              </div>
              {/* Category chips */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center" role="group" aria-label="Browse by category">
                {[
                  { en: 'Medicinal Plants', tn: 'Dimela tsa Kalafi' },
                  { en: 'Traditional Practices', tn: 'Ditlwaelo' },
                  { en: 'Conservation', tn: 'Bolokosetso' },
                  { en: 'Cultural Stories', tn: 'Ditso tsa Setso' },
                  { en: 'Open for Collaboration', tn: 'Tirisano' },
                ].map(chip => (
                  <button
                    key={chip.en}
                    type="button"
                    onClick={() => setSearchVal(chip[lang])}
                    className="px-3.5 py-1.5 rounded-full text-sm bg-white border border-[#E8DDD0] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors"
                  >
                    {chip[lang]}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* ── Mobile menu ─────────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E8DDD0] bg-white px-4 py-3 space-y-1" role="menu">
            {NAV_LINKS.map(({ href, label, icon: Icon, authRequired, roles }) => {
              if (authRequired && !userRole) return null
              if (roles && (!userRole || !roles.includes(userRole))) return null
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    active
                      ? 'bg-[#FEF2E8] text-[#9A3412]'
                      : 'text-[#4B5563] hover:bg-[#FEF9F0] hover:text-[#9A3412]'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label[lang]}
                </Link>
              )
            })}
            <div className="border-t border-[#F3F0EB] pt-3 mt-2 space-y-1">
              <button
                onClick={() => setLang(l => l === 'en' ? 'tn' : 'en')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#4B5563] hover:bg-[#FEF9F0] hover:text-[#9A3412] transition-colors"
              >
                <Globe className="h-5 w-5" aria-hidden="true" />
                {lang === 'en' ? 'Switch to Setswana' : 'Switch to English'}
              </button>
              {userRole ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sign out
                </button>
              ) : (
                <>
                  <Link href="/login" role="menuitem" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#4B5563] hover:bg-[#FEF9F0]">
                    Sign In
                  </Link>
                  <Link href="/register" role="menuitem" className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-semibold bg-[#9A3412] text-white hover:bg-[#7C2D12] transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
