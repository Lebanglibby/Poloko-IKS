'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, FlaskConical,
  ChevronLeft, ChevronRight, LayoutList, Map as MapIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResearchCard } from '@/components/research/ResearchCard'
import { ResearchDetailDrawer } from '@/components/research/ResearchDetailDrawer'
import { ResearchMapPanel, type MapEntry } from '@/components/research/ResearchMapPanel'
import type { ResearchListing, LicenseType } from '@/lib/types'

/* ─── Skeleton cards ─────────────────────────────────────────────────────────── */
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
      <div className="border-t border-slate-700/40 pt-3 flex justify-between">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-5 w-16 rounded" />
      </div>
    </div>
  )
}

/* ─── Filter chip ────────────────────────────────────────────────────────────── */
function FilterChip({
  label, active, onRemove,
}: { label: string; active: boolean; onRemove: () => void }) {
  if (!active) return null
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
      {label}
      <button onClick={onRemove} aria-label={`Remove filter: ${label}`} className="rounded-full p-0.5 hover:bg-emerald-500/20 transition-colors">
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    </span>
  )
}

/* ─── Props ──────────────────────────────────────────────────────────────────── */
interface Props {
  listings: ResearchListing[]
  mapEntries: MapEntry[]
  error?: string
  totalCount: number
  totalPages: number
  currentPage: number
  currentFilters: {
    search?: string
    license_type?: LicenseType
    status?: string
  }
  licenseLabels: Record<LicenseType, string>
  userRole: string | null
  userId: string | null
}

/* ─── Main client component ──────────────────────────────────────────────────── */
export function ResearchHubClient({
  listings,
  mapEntries,
  error,
  totalCount,
  totalPages,
  currentPage,
  currentFilters,
  licenseLabels,
  userRole,
  userId,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /* UI state */
  const [selectedListing, setSelectedListing] = useState<ResearchListing | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [filtersOpen, setFiltersOpen] = useState(false)

  /* Local filter state (kept in sync with URL on submit) */
  const [search, setSearch] = useState(currentFilters.search ?? '')
  const [licenseType, setLicenseType] = useState<LicenseType | ''>(currentFilters.license_type ?? '')
  const [status, setStatus] = useState(currentFilters.status ?? '')

  /* ── Build query URL ──────────────────────────────────────────────────── */
  function buildUrl(overrides: Partial<typeof currentFilters & { page?: number }> = {}) {
    const qs = new URLSearchParams()
    const s = overrides.search       ?? (overrides.search === '' ? '' : currentFilters.search)
    const l = overrides.license_type ?? (overrides.license_type === '' ? '' : currentFilters.license_type)
    const st = overrides.status      ?? (overrides.status === '' ? '' : currentFilters.status)
    const p = overrides.page ?? 1

    if (s)  qs.set('search', s)
    if (l)  qs.set('license_type', l)
    if (st) qs.set('status', st)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/research${q ? `?${q}` : ''}`
  }

  function navigate(url: string) {
    startTransition(() => router.push(url))
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(buildUrl({ search, license_type: licenseType || undefined, status: status || undefined, page: 1 }))
  }

  function clearAllFilters() {
    setSearch('')
    setLicenseType('')
    setStatus('')
    navigate('/research')
  }

  const hasFilters = !!(currentFilters.search || currentFilters.license_type || currentFilters.status)

  /* ── Card select ──────────────────────────────────────────────────────── */
  const handleSelectListing = useCallback((listing: ResearchListing) => {
    setSelectedListing(listing)
    setDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  /* ── Map entry select: find matching listing and open drawer ──────────── */
  const handleMapSelectEntry = useCallback((id: string) => {
    const match = listings.find(l => l.id === id)
    if (match) {
      setSelectedListing(match)
      setDrawerOpen(true)
    }
  }, [listings])

  /* ── Map entries: merge listing data with geo entries ────────────────── */
  const enrichedMapEntries: MapEntry[] = mapEntries.map(me => ({
    ...me,
    // if a matching listing is selected, surface it
  }))

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-14 z-30">
        <div className="max-w-screen-xl mx-auto">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  name="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search research listings…"
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  aria-label="Search research listings"
                />
              </div>

              {/* Filter toggle */}
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
                aria-label="Toggle filter options"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Filters
                {hasFilters && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                )}
              </button>

              {/* Search submit */}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                aria-label="Apply search"
              >
                Search
              </button>

              {/* Clear */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Clear all filters"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </button>
              )}

              {/* Mobile view toggle */}
              <div className="ml-auto flex lg:hidden items-center rounded-lg border border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className={cn('px-2.5 py-1.5 text-xs transition-colors', mobileView === 'list' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300')}
                  aria-label="List view"
                  aria-pressed={mobileView === 'list'}
                >
                  <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('map')}
                  className={cn('px-2.5 py-1.5 text-xs transition-colors', mobileView === 'map' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300')}
                  aria-label="Map view"
                  aria-pressed={mobileView === 'map'}
                >
                  <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {filtersOpen && (
              <div className="mt-3 flex flex-wrap gap-2 items-center pt-3 border-t border-slate-700/40">
                {/* License filter */}
                <select
                  value={licenseType}
                  onChange={e => setLicenseType(e.target.value as LicenseType | '')}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  aria-label="Filter by license type"
                >
                  <option value="">All Licenses</option>
                  {(Object.entries(licenseLabels) as [LicenseType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="open_for_collaboration">Open for Collaboration</option>
                </select>

                {/* Quick chips */}
                <div className="flex flex-wrap gap-1.5 ml-1" role="group" aria-label="Quick category chips">
                  {['Medicinal', 'Conservation', 'Cultural', 'Open Collab'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => { setSearch(chip); }}
                      className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filter chips row */}
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2" role="group" aria-label="Active filters">
                <FilterChip
                  label={`"${currentFilters.search}"`}
                  active={!!currentFilters.search}
                  onRemove={() => navigate(buildUrl({ search: '', page: 1 }))}
                />
                <FilterChip
                  label={currentFilters.license_type ? licenseLabels[currentFilters.license_type] : ''}
                  active={!!currentFilters.license_type}
                  onRemove={() => navigate(buildUrl({ license_type: undefined, page: 1 }))}
                />
                <FilterChip
                  label={currentFilters.status ?? ''}
                  active={!!currentFilters.status}
                  onRemove={() => navigate(buildUrl({ status: undefined, page: 1 }))}
                />
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

          {/* ── Left: Card list ──────────────────────────────────────────── */}
          <section
            className={cn(
              'flex flex-col gap-0 overflow-hidden rounded-xl',
              'lg:flex lg:w-[420px] xl:w-[460px] shrink-0',
              mobileView === 'map' ? 'hidden' : 'flex w-full'
            )}
            aria-label="Research listings"
          >
            {/* List header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <p className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
                {isPending
                  ? 'Loading…'
                  : `${totalCount.toLocaleString()} listing${totalCount !== 1 ? 's' : ''}${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`
                }
              </p>
              {totalCount > 0 && (
                <span className="text-[10px] text-slate-600">
                  Click a card to view details
                </span>
              )}
            </div>

            {/* Scrollable card list */}
            <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 pr-1">
              {isPending ? (
                Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              ) : listings.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-slate-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">No listings found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {hasFilters ? 'Try adjusting your filters.' : 'Check back later.'}
                    </p>
                    {hasFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                listings.map(listing => (
                  <ResearchCard
                    key={listing.id}
                    listing={listing}
                    selected={selectedListing?.id === listing.id && drawerOpen}
                    onSelect={handleSelectListing}
                  />
                ))
              )}
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
              entries={enrichedMapEntries}
              selectedId={selectedListing?.id}
              onSelectEntry={handleMapSelectEntry}
              className="w-full h-full"
            />
          </section>
        </div>
      </div>

      {/* ── Detail drawer ────────────────────────────────────────────────── */}
      <ResearchDetailDrawer
        listing={selectedListing}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        userRole={userRole}
        userId={userId}
      />
    </>
  )
}
