'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, Leaf,
  ChevronLeft, ChevronRight, LayoutList, Map as MapIcon,
  Globe, Lock, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeCard } from '@/components/vault/KnowledgeCard'
import { VaultDetailDrawer } from '@/components/vault/VaultDetailDrawer'
import { ResearchMapPanel, type MapEntry } from '@/components/research/ResearchMapPanel'
import type { KnowledgeEntry, KnowledgeCategory, AccessTier } from '@/lib/types'

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/60 p-4 space-y-3">
      <div className="flex gap-3">
        <div className="skeleton h-8 w-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded-full shrink-0" />
      </div>
      <div className="skeleton h-3 w-full rounded ml-11" />
      <div className="skeleton h-3 w-2/3 rounded ml-11" />
      <div className="border-t border-slate-700/40 pt-3 flex gap-2">
        <div className="skeleton h-5 w-20 rounded-md" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    </div>
  )
}

/* ─── Filter chip ────────────────────────────────────────────────────────────── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="rounded-full p-0.5 hover:bg-emerald-500/20 transition-colors"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    </span>
  )
}

/* ─── Tier quick-filter buttons ──────────────────────────────────────────────── */
const TIER_FILTERS: { tier: AccessTier; label: string; icon: typeof Globe; color: string }[] = [
  { tier: 'public',     label: 'Public',     icon: Globe,   color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
  { tier: 'restricted', label: 'Restricted', icon: Lock,    color: 'text-amber-400   border-amber-500/30   hover:bg-amber-500/10'   },
  { tier: 'sacred',     label: 'Sacred',     icon: Shield,  color: 'text-red-400     border-red-500/30     hover:bg-red-500/10'     },
]

/* ─── Props ──────────────────────────────────────────────────────────────────── */
interface Props {
  entries: KnowledgeEntry[]
  mapEntries: MapEntry[]
  categoryLabels: Record<string, string>
  error?: string
  totalCount: number
  totalPages: number
  currentPage: number
  currentFilters: {
    search?: string
    category?: KnowledgeCategory
    tier?: AccessTier
  }
  userRole: string | null
  userId: string | null
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export function VaultBrowseClient({
  entries,
  mapEntries,
  categoryLabels,
  error,
  totalCount,
  totalPages,
  currentPage,
  currentFilters,
  userRole,
  userId,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /* Drawer state */
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [drawerOpen, setDrawerOpen]       = useState(false)

  /* Mobile view toggle */
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

  /* Filter form state */
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search,      setSearch]      = useState(currentFilters.search   ?? '')
  const [category,    setCategory]    = useState(currentFilters.category ?? '')
  const [tier,        setTier]        = useState(currentFilters.tier     ?? '')

  /* ── URL helpers ──────────────────────────────────────────────────────── */
  function buildUrl(overrides: {
    search?: string; category?: string; tier?: string; page?: number
  } = {}) {
    const qs = new URLSearchParams()
    const s  = overrides.search   !== undefined ? overrides.search   : (currentFilters.search   ?? '')
    const c  = overrides.category !== undefined ? overrides.category : (currentFilters.category ?? '')
    const t  = overrides.tier     !== undefined ? overrides.tier     : (currentFilters.tier     ?? '')
    const p  = overrides.page ?? 1
    if (s)  qs.set('search',   s)
    if (c)  qs.set('category', c)
    if (t)  qs.set('tier',     t)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/vault${q ? `?${q}` : ''}`
  }

  function navigate(url: string) {
    startTransition(() => router.push(url))
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(buildUrl({ search, category: category || '', tier: tier || '', page: 1 }))
  }

  function clearAll() {
    setSearch(''); setCategory(''); setTier('')
    navigate('/vault')
  }

  const hasFilters = !!(currentFilters.search || currentFilters.category || currentFilters.tier)

  /* ── Card interactions ────────────────────────────────────────────────── */
  const handleSelect = useCallback((entry: KnowledgeEntry) => {
    setSelectedEntry(entry)
    setDrawerOpen(true)
  }, [])

  const handleClose = useCallback(() => setDrawerOpen(false), [])

  const handleMapSelect = useCallback((id: string) => {
    const match = entries.find(e => e.id === id)
    if (match) { setSelectedEntry(match); setDrawerOpen(true) }
  }, [entries])

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-14 z-30">
        <div className="max-w-screen-xl mx-auto">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search knowledge entries…"
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  aria-label="Search knowledge entries"
                />
              </div>

              {/* Access tier quick filters */}
              <div
                className="hidden sm:flex items-center gap-1 border border-slate-700 rounded-lg p-0.5 bg-slate-800/60"
                role="group"
                aria-label="Filter by access tier"
              >
                <button
                  type="button"
                  onClick={() => { setTier(''); navigate(buildUrl({ tier: '', page: 1 })) }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
                    !tier ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                  )}
                  aria-pressed={!tier}
                >
                  All
                </button>
                {TIER_FILTERS.map(({ tier: t, label, icon: Icon, color }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTier(tier === t ? '' : t); navigate(buildUrl({ tier: tier === t ? '' : t, page: 1 })) }}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors border',
                      tier === t
                        ? cn(color, 'bg-slate-700 border-opacity-60')
                        : cn('border-transparent text-slate-500 hover:text-slate-300', color.split(' ').filter(c => c.startsWith('hover:')).join(' '))
                    )}
                    aria-pressed={tier === t}
                    aria-label={`Filter: ${label}`}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {/* More filters toggle */}
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                  filtersOpen
                    ? 'bg-slate-700 border-slate-600 text-slate-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                )}
                aria-expanded={filtersOpen}
                aria-label="More filter options"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">More</span>
                {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />}
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Search
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Clear all filters"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
                </button>
              )}

              {/* Mobile list/map toggle */}
              <div className="ml-auto flex lg:hidden items-center rounded-lg border border-slate-700 overflow-hidden">
                {[
                  { id: 'list', Icon: LayoutList, label: 'List view' },
                  { id: 'map',  Icon: MapIcon,    label: 'Map view'  },
                ].map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMobileView(id as 'list' | 'map')}
                    className={cn(
                      'px-2.5 py-1.5 text-xs transition-colors',
                      mobileView === id ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                    )}
                    aria-label={label}
                    aria-pressed={mobileView === id}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded: category filter */}
            {filtersOpen && (
              <div className="mt-3 pt-3 border-t border-slate-700/40 flex flex-wrap gap-2 items-center">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {(Object.entries(categoryLabels) as [KnowledgeCategory, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>

                {/* Tier select (mobile fallback) */}
                <select
                  value={tier}
                  onChange={e => setTier(e.target.value)}
                  className="sm:hidden bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  aria-label="Filter by access tier"
                >
                  <option value="">All Tiers</option>
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                  <option value="sacred">Sacred</option>
                </select>
              </div>
            )}

            {/* Active chip row */}
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2" role="group" aria-label="Active filters">
                {currentFilters.search   && <FilterChip label={`"${currentFilters.search}"`}          onRemove={() => navigate(buildUrl({ search:   '', page: 1 }))} />}
                {currentFilters.category && <FilterChip label={categoryLabels[currentFilters.category] ?? currentFilters.category} onRemove={() => navigate(buildUrl({ category: '', page: 1 }))} />}
                {currentFilters.tier     && <FilterChip label={currentFilters.tier.charAt(0).toUpperCase() + currentFilters.tier.slice(1)} onRemove={() => navigate(buildUrl({ tier: '', page: 1 }))} />}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Split-screen body ────────────────────────────────────────────── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400" role="alert">
            {error}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-13rem)]">

          {/* ── Left: Entry list ─────────────────────────────────────────── */}
          <section
            className={cn(
              'flex flex-col overflow-hidden rounded-xl',
              'lg:flex lg:w-[420px] xl:w-[460px] shrink-0',
              mobileView === 'map' ? 'hidden' : 'flex w-full'
            )}
            aria-label="Knowledge entries list"
          >
            {/* List header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <p
                className="text-xs text-slate-500"
                aria-live="polite"
                aria-atomic="true"
              >
                {isPending
                  ? 'Loading…'
                  : `${totalCount.toLocaleString()} entr${totalCount === 1 ? 'y' : 'ies'}${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`
                }
              </p>
              {totalCount > 0 && !isPending && (
                <span className="text-[10px] text-slate-600">Click an entry to view details</span>
              )}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 pr-1">
              {isPending
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : entries.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-slate-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">No entries found</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {hasFilters ? 'Try adjusting your filters.' : 'The vault is empty.'}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={clearAll}
                          className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </div>
                )
                : entries.map(entry => (
                  <KnowledgeCard
                    key={entry.id}
                    entry={entry}
                    selected={selectedEntry?.id === entry.id && drawerOpen}
                    onSelect={handleSelect}
                  />
                ))
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isPending && (
              <div className="flex items-center justify-center gap-2 pt-4 shrink-0 border-t border-slate-700/40 mt-3">
                <button
                  onClick={() => navigate(buildUrl({ page: currentPage - 1 }))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 bg-slate-800 hover:border-slate-600 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Prev
                </button>
                <span className="text-xs text-slate-500 px-2 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => navigate(buildUrl({ page: currentPage + 1 }))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 bg-slate-800 hover:border-slate-600 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>

          {/* ── Right: Map panel ─────────────────────────────────────────── */}
          <section
            className={cn(
              'flex-1 min-w-0',
              'lg:flex hidden',
              mobileView === 'map' ? 'flex w-full' : 'hidden'
            )}
            aria-label="Geo-location map"
          >
            <ResearchMapPanel
              entries={mapEntries}
              selectedId={selectedEntry?.id}
              onSelectEntry={handleMapSelect}
              className="w-full h-full"
            />
          </section>
        </div>
      </div>

      {/* ── Vault detail drawer ──────────────────────────────────────────── */}
      <VaultDetailDrawer
        entry={selectedEntry}
        isOpen={drawerOpen}
        onClose={handleClose}
        userId={userId}
        userRole={userRole}
      />
    </>
  )
}
