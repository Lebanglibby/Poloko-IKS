'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, Leaf, ChevronLeft, ChevronRight,
  LayoutList, Map as MapIcon, Globe, Lock, Shield, SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeCard } from '@/components/vault/KnowledgeCard'
import { VaultDetailDrawer } from '@/components/vault/VaultDetailDrawer'
import { ResearchMapPanel, type MapEntry } from '@/components/research/ResearchMapPanel'
import type { KnowledgeEntry, KnowledgeCategory, AccessTier } from '@/lib/types'

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden" aria-hidden="true">
      <div className="h-1.5 skeleton" />
      <div className="p-5 space-y-3">
        <div className="flex gap-3">
          <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
        <div className="skeleton h-3 w-full rounded ml-[52px]" />
        <div className="skeleton h-3 w-2/3 rounded ml-[52px]" />
        <div className="skeleton h-6 w-32 rounded-full ml-[52px]" />
        <div className="border-t border-[#F3F0EB] pt-3 flex gap-3">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-16 text-center px-4">
      <div
        className="h-20 w-20 rounded-3xl bg-[#FEF9F0] border-2 border-[#E8DDD0] flex items-center justify-center float-gentle"
        aria-hidden="true"
      >
        <Leaf className="h-10 w-10 text-[#D4C4B0]" />
      </div>
      <div>
        {hasFilters ? (
          <>
            <p className="text-base font-bold text-[#1F2937]">No entries match your filters</p>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs">
              Try broadening your search or removing a filter to find what you&apos;re looking for.
            </p>
            <button
              onClick={onClear}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9A3412] text-white text-sm font-semibold hover:bg-[#7C2D12] transition-colors shadow-sm"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear all filters
            </button>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-[#1F2937]">The vault is empty</p>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs">
              Be the first to contribute — share traditional knowledge to start the archive.
            </p>
            {/* Setswana encouragement */}
            <p className="text-xs text-[#B45309] mt-3 font-semibold italic" lang="tn">
              &ldquo;Tlhagisa Kitso ya Gago&rdquo;
            </p>
            <p className="text-xs text-[#9CA3AF]">Share your knowledge</p>
            <a
              href="/submit"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9A3412] text-white text-sm font-semibold hover:bg-[#7C2D12] transition-colors shadow-sm"
            >
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              Submit an entry
            </a>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Category quick-browse chips ─────────────────────────────────────────────── */
const CATEGORY_CHIPS = [
  { value: 'flora_medicinal',      label: 'Medicinal Plants',      emoji: '🌿' },
  { value: 'traditional_practice', label: 'Traditional Practices', emoji: '🏺' },
  { value: 'conservation',         label: 'Conservation',          emoji: '🌍' },
  { value: 'cultural_narrative',   label: 'Cultural Stories',      emoji: '📖' },
  { value: 'resource_location',    label: 'Resource Locations',    emoji: '📍' },
] as const

/* ─── Tier quick-filter buttons ───────────────────────────────────────────────── */
const TIER_CHIPS = [
  { value: 'public',     label: 'Public',     icon: Globe,   active: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',  inactive: 'text-[#4B5563] border-[#E8DDD0] hover:border-[#15803D] hover:text-[#15803D]' },
  { value: 'restricted', label: 'Restricted', icon: Lock,    active: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',  inactive: 'text-[#4B5563] border-[#E8DDD0] hover:border-[#B45309] hover:text-[#B45309]' },
  { value: 'sacred',     label: 'Sacred',     icon: Shield,  active: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',  inactive: 'text-[#4B5563] border-[#E8DDD0] hover:border-[#B91C1C] hover:text-[#B91C1C]' },
] as const

/* ─── Active filter chip ──────────────────────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-[#FEF2E8] text-[#9A3412] border border-[#FDBA74]">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="rounded-full p-0.5 hover:bg-[#FDBA74]/40 transition-colors"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  )
}

/* ─── Props ───────────────────────────────────────────────────────────────────── */
interface Props {
  entries: KnowledgeEntry[]
  mapEntries: MapEntry[]
  categoryLabels: Record<string, string>
  error?: string
  totalCount: number
  totalPages: number
  currentPage: number
  currentFilters: { search?: string; category?: KnowledgeCategory; tier?: AccessTier }
  userRole: string | null
  userId: string | null
}

/* ─── Main component ──────────────────────────────────────────────────────────── */
export function VaultBrowseClient({
  entries, mapEntries, categoryLabels, error,
  totalCount, totalPages, currentPage, currentFilters,
  userRole, userId,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [mobileView, setMobileView]       = useState<'list' | 'map'>('list')
  const [filtersOpen, setFiltersOpen]     = useState(false)

  const [search,   setSearch]   = useState(currentFilters.search   ?? '')
  const [category, setCategory] = useState(currentFilters.category ?? '')
  const [tier,     setTier]     = useState(currentFilters.tier     ?? '')

  /* ── URL helpers ────────────────────────────────────────────────────── */
  function buildUrl(o: { search?: string; category?: string; tier?: string; page?: number } = {}) {
    const qs = new URLSearchParams()
    const s = o.search   !== undefined ? o.search   : (currentFilters.search   ?? '')
    const c = o.category !== undefined ? o.category : (currentFilters.category ?? '')
    const t = o.tier     !== undefined ? o.tier     : (currentFilters.tier     ?? '')
    const p = o.page ?? 1
    if (s) qs.set('search', s)
    if (c) qs.set('category', c)
    if (t) qs.set('tier', t)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/vault${q ? `?${q}` : ''}`
  }

  function navigate(url: string) { startTransition(() => router.push(url)) }
  function clearAll() { setSearch(''); setCategory(''); setTier(''); navigate('/vault') }
  const hasFilters = !!(currentFilters.search || currentFilters.category || currentFilters.tier)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(buildUrl({ search, category: category || '', tier: tier || '', page: 1 }))
  }

  function handleCategoryChip(val: string) {
    const next = category === val ? '' : val
    setCategory(next)
    navigate(buildUrl({ category: next, page: 1 }))
  }

  function handleTierChip(val: string) {
    const next = tier === val ? '' : val
    setTier(next)
    navigate(buildUrl({ tier: next, page: 1 }))
  }

  const handleSelect  = useCallback((entry: KnowledgeEntry) => { setSelectedEntry(entry); setDrawerOpen(true) }, [])
  const handleClose   = useCallback(() => setDrawerOpen(false), [])
  const handleMapSel  = useCallback((id: string) => {
    const match = entries.find(e => e.id === id)
    if (match) { setSelectedEntry(match); setDrawerOpen(true) }
  }, [entries])

  /* ── Result count message for screen readers ─────────────────────── */
  const resultMsg = isPending
    ? 'Loading entries…'
    : `${totalCount.toLocaleString()} entr${totalCount === 1 ? 'y' : 'ies'} found${totalPages > 1 ? `, page ${currentPage} of ${totalPages}` : ''}`

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto space-y-3">

          {/* Row 1: search + controls */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Search the knowledge archive"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search knowledge entries…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl text-[#1F2937] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/20 transition-all"
                  aria-label="Search knowledge entries"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
                  filtersOpen
                    ? 'border-[#9A3412] bg-[#FEF2E8] text-[#9A3412]'
                    : 'border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412]'
                )}
                aria-expanded={filtersOpen}
                aria-controls="vault-filter-panel"
                aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>Filters</span>
                {hasFilters && (
                  <span
                    className="h-2 w-2 rounded-full bg-[#9A3412]"
                    aria-label="Filters active"
                  />
                )}
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm"
                aria-label="Submit search"
              >
                Search
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#9A3412] transition-colors"
                  aria-label="Clear all active filters"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear all
                </button>
              )}

              {/* Mobile list/map toggle */}
              <div
                className="ml-auto lg:hidden flex rounded-xl border border-[#E8DDD0] overflow-hidden"
                role="group"
                aria-label="Toggle between list and map view"
              >
                {([['list', LayoutList, 'Switch to list view'], ['map', MapIcon, 'Switch to map view']] as const).map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMobileView(id)}
                    className={cn('px-3 py-2 transition-colors', mobileView === id ? 'bg-[#FEF2E8] text-[#9A3412]' : 'text-[#9CA3AF] hover:text-[#4B5563]')}
                    aria-label={label}
                    aria-pressed={mobileView === id}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: category chips — emoji separated from text for screen readers */}
            <div
              className="flex flex-wrap gap-2 mt-3"
              role="group"
              aria-label="Browse by category"
            >
              {CATEGORY_CHIPS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChip(value)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                    category === value
                      ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-sm'
                      : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#9A3412] hover:text-[#9A3412] hover:bg-[#FEF9F0]'
                  )}
                  aria-pressed={category === value}
                  aria-label={`${category === value ? 'Remove' : 'Filter by'} ${label}`}
                >
                  <span aria-hidden="true">{emoji} </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Expanded filters panel */}
            {filtersOpen && (
              <div
                id="vault-filter-panel"
                className="mt-3 pt-3 border-t border-[#F3F0EB] space-y-3"
              >
                <div>
                  <p
                    className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2"
                    id="tier-filter-label"
                  >
                    Access Level
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="tier-filter-label"
                  >
                    <button
                      type="button"
                      onClick={() => handleTierChip('')}
                      className={cn('px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                        !tier ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#1F2937]'
                      )}
                      aria-pressed={!tier}
                      aria-label={tier ? 'Remove access level filter' : 'Showing all access levels'}
                    >
                      All Levels
                    </button>
                    {TIER_CHIPS.map(({ value, label, icon: Icon, active, inactive }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleTierChip(value)}
                        className={cn('flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all bg-white', tier === value ? active : inactive)}
                        aria-pressed={tier === value}
                        aria-label={`${tier === value ? 'Remove' : 'Filter by'} ${label} access`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Active filters — click to remove">
                {currentFilters.search   && <FilterPill label={`"${currentFilters.search}"`} onRemove={() => navigate(buildUrl({ search: '', page: 1 }))} />}
                {currentFilters.category && <FilterPill label={categoryLabels[currentFilters.category] ?? currentFilters.category} onRemove={() => navigate(buildUrl({ category: '', page: 1 }))} />}
                {currentFilters.tier     && <FilterPill label={currentFilters.tier.charAt(0).toUpperCase() + currentFilters.tier.slice(1)} onRemove={() => navigate(buildUrl({ tier: '', page: 1 }))} />}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Split body ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-16rem)]">

          {/* ── Card list ──────────────────────────────────────────────── */}
          <section
            className={cn(
              'flex flex-col lg:w-[440px] xl:w-[480px] shrink-0',
              mobileView === 'map' ? 'hidden' : 'flex w-full'
            )}
            aria-label="Knowledge entries list"
          >
            {/* Result count — polite live region */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p
                className="text-sm text-[#9CA3AF]"
                aria-live="polite"
                aria-atomic="true"
                aria-label={resultMsg}
              >
                {isPending ? (
                  <span>Loading&hellip;</span>
                ) : (
                  <>
                    <span className="font-semibold text-[#4B5563]">{totalCount.toLocaleString()}</span>
                    {' '}{totalCount === 1 ? 'entry' : 'entries'} found
                    {totalPages > 1 && (
                      <span className="text-[#B8A898]"> · Page {currentPage} of {totalPages}</span>
                    )}
                  </>
                )}
              </p>
              {!isPending && totalCount > 0 && (
                <p className="text-xs text-[#B8A898] hidden sm:block">
                  Select any entry for details
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1">
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                : entries.length === 0
                ? <EmptyState hasFilters={hasFilters} onClear={clearAll} />
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
              <nav
                aria-label={`Pagination — page ${currentPage} of ${totalPages}`}
                className="flex items-center justify-center gap-3 pt-5 shrink-0 border-t border-[#E8DDD0] mt-4"
              >
                <button
                  onClick={() => navigate(buildUrl({ page: currentPage - 1 }))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>

                <span className="text-sm text-[#9CA3AF] px-2" aria-current="page">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => navigate(buildUrl({ page: currentPage + 1 }))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Go to next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </section>

          {/* ── Map panel ─────────────────────────────────────────────── */}
          <section
            className={cn(
              'flex-1 min-w-0',
              mobileView === 'map' ? 'flex w-full' : 'hidden lg:flex'
            )}
            aria-label="Interactive map of knowledge entry locations"
          >
            <ResearchMapPanel
              entries={mapEntries}
              selectedId={selectedEntry?.id}
              onSelectEntry={handleMapSel}
              className="w-full h-full"
            />
          </section>
        </div>
      </div>

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
