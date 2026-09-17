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

/* ─── Loading skeleton ───────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden" aria-hidden="true">
      <div className="h-1.5 skeleton" />
      <div className="p-5 space-y-3">
        <div className="flex gap-3">
          <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-5 w-24 rounded-full shrink-0" />
        </div>
        <div className="skeleton h-3 w-full rounded ml-[52px]" />
        <div className="skeleton h-3 w-2/3 rounded ml-[52px]" />
        <div className="flex justify-between ml-[52px]">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="border-t border-[#F3F0EB] pt-3 flex gap-2">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
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
        className="h-20 w-20 rounded-3xl bg-[#F0F7F4] border-2 border-[#D8F3E3] flex items-center justify-center float-gentle"
        aria-hidden="true"
      >
        <FlaskConical className="h-10 w-10 text-[#95D5B2]" />
      </div>
      <div>
        {hasFilters ? (
          <>
            <p className="text-base font-bold text-[#1F2937]">No listings match your filters</p>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs">
              Try broadening your search or removing a filter.
            </p>
            <button
              onClick={onClear}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
              style={{ background: 'var(--r-primary)' }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear all filters
            </button>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-[#1F2937]">No research published yet</p>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs">
              Be the first to publish a study derived from Botswana&apos;s indigenous knowledge.
            </p>
            <p className="text-xs text-[#40916C] mt-3 font-semibold italic" lang="tn">
              &ldquo;Patlisiso e Bopa Bokamoso&rdquo;
            </p>
            <p className="text-xs text-[#9CA3AF]">Research shapes the future</p>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Active filter pill ─────────────────────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-[#F0F7F4] text-[#2D6A4F] border border-[#95D5B2]">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="rounded-full p-0.5 hover:bg-[#95D5B2]/30 transition-colors"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
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
  currentFilters: { search?: string; license_type?: LicenseType; status?: string }
  licenseLabels: Record<LicenseType, string>
  userRole: string | null
  userId: string | null
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export function ResearchHubClient({
  listings, mapEntries, error, totalCount, totalPages, currentPage,
  currentFilters, licenseLabels, userRole, userId,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedListing, setSelectedListing] = useState<ResearchListing | null>(null)
  const [drawerOpen,      setDrawerOpen]       = useState(false)
  const [mobileView,      setMobileView]       = useState<'list' | 'map'>('list')
  const [filtersOpen,     setFiltersOpen]      = useState(false)

  const [search,      setSearch]      = useState(currentFilters.search       ?? '')
  const [licenseType, setLicenseType] = useState<LicenseType | ''>(currentFilters.license_type ?? '')
  const [status,      setStatus]      = useState(currentFilters.status        ?? '')

  /* ── URL helpers ─────────────────────────────────────────────────── */
  function buildUrl(o: Partial<typeof currentFilters & { page?: number }> = {}) {
    const qs = new URLSearchParams()
    const s  = o.search       !== undefined ? o.search       : (currentFilters.search       ?? '')
    const l  = o.license_type !== undefined ? o.license_type : (currentFilters.license_type ?? '')
    const st = o.status       !== undefined ? o.status       : (currentFilters.status        ?? '')
    const p  = o.page ?? 1
    if (s)  qs.set('search',  s)
    if (l)  qs.set('license_type', l)
    if (st) qs.set('status',  st)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/research${q ? `?${q}` : ''}`
  }

  function navigate(url: string) { startTransition(() => router.push(url)) }
  function clearAll() { setSearch(''); setLicenseType(''); setStatus(''); navigate('/research') }
  const hasFilters = !!(currentFilters.search || currentFilters.license_type || currentFilters.status)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(buildUrl({ search, license_type: licenseType || undefined, status: status || undefined, page: 1 }))
  }

  const handleSelectListing = useCallback((listing: ResearchListing) => { setSelectedListing(listing); setDrawerOpen(true) }, [])
  const handleCloseDrawer   = useCallback(() => setDrawerOpen(false), [])
  const handleMapSelect     = useCallback((id: string) => {
    const match = listings.find(l => l.id === id)
    if (match) { setSelectedListing(match); setDrawerOpen(true) }
  }, [listings])

  const resultMsg = isPending
    ? 'Loading listings…'
    : `${totalCount.toLocaleString()} listing${totalCount !== 1 ? 's' : ''}${totalPages > 1 ? `, page ${currentPage} of ${totalPages}` : ''}`

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div
        className="border-b-2 border-[#E8DDD0] bg-white px-4 sm:px-6 py-4 sticky top-16 z-30"
        style={{ boxShadow: '0 2px 8px rgba(45,106,79,0.06)' }}
      >
        <div className="max-w-screen-xl mx-auto space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Search research listings"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search studies, authors, keywords…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl text-[#1F2937] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
                  aria-label="Search research listings"
                  autoComplete="off"
                />
              </div>

              {/* Filters toggle */}
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
                  filtersOpen
                    ? 'border-[#2D6A4F] bg-[#F0F7F4] text-[#2D6A4F]'
                    : 'border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#2D6A4F] hover:text-[#2D6A4F]'
                )}
                aria-expanded={filtersOpen}
                aria-controls="research-filter-panel"
                aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {hasFilters && (
                  <span className="h-2 w-2 rounded-full bg-[#2D6A4F]" aria-label="Filters active" />
                )}
              </button>

              {/* Search submit */}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
                style={{ background: 'var(--r-primary)' }}
                aria-label="Submit search"
              >
                Search
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#2D6A4F] transition-colors"
                  aria-label="Clear all active filters"
                >
                  <X className="h-4 w-4" aria-hidden="true" /> Clear all
                </button>
              )}

              {/* Mobile list/map toggle */}
              <div
                className="ml-auto lg:hidden flex rounded-xl border border-[#E8DDD0] overflow-hidden"
                role="group"
                aria-label="Toggle list or map view"
              >
                {([['list', LayoutList, 'Switch to list view'], ['map', MapIcon, 'Switch to map view']] as const).map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMobileView(id)}
                    className={cn(
                      'px-3 py-2 transition-colors',
                      mobileView === id ? 'bg-[#F0F7F4] text-[#2D6A4F]' : 'text-[#9CA3AF] hover:text-[#4B5563]'
                    )}
                    aria-label={label}
                    aria-pressed={mobileView === id}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded filters */}
            {filtersOpen && (
              <div
                id="research-filter-panel"
                className="mt-3 pt-3 border-t border-[#F3F0EB] flex flex-wrap gap-3 items-center"
              >
                <select
                  value={licenseType}
                  onChange={e => setLicenseType(e.target.value as LicenseType | '')}
                  className="bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl px-3 py-2 text-sm text-[#4B5563] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
                  aria-label="Filter by license type"
                >
                  <option value="">All Licenses</option>
                  {(Object.entries(licenseLabels) as [LicenseType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl px-3 py-2 text-sm text-[#4B5563] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
                  aria-label="Filter by publication status"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="open_for_collaboration">Open for Collaboration</option>
                </select>
              </div>
            )}

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Active filters — click to remove">
                {currentFilters.search       && <FilterPill label={`"${currentFilters.search}"`} onRemove={() => navigate(buildUrl({ search: '', page: 1 }))} />}
                {currentFilters.license_type && <FilterPill label={licenseLabels[currentFilters.license_type]} onRemove={() => navigate(buildUrl({ license_type: undefined, page: 1 }))} />}
                {currentFilters.status       && <FilterPill label={currentFilters.status} onRemove={() => navigate(buildUrl({ status: undefined, page: 1 }))} />}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Split body ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-16rem)]">

          {/* Card list */}
          <section
            className={cn('flex flex-col lg:w-[440px] xl:w-[480px] shrink-0', mobileView === 'map' ? 'hidden' : 'flex w-full')}
            aria-label="Research listings"
          >
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
                    {' '}listing{totalCount !== 1 ? 's' : ''}
                    {totalPages > 1 && <span className="text-[#B8A898]"> · Page {currentPage} of {totalPages}</span>}
                  </>
                )}
              </p>
              {!isPending && totalCount > 0 && (
                <p className="text-xs text-[#B8A898] hidden sm:block">Select to view details</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1">
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                : listings.length === 0
                ? <EmptyState hasFilters={hasFilters} onClear={clearAll} />
                : listings.map(l => (
                  <ResearchCard
                    key={l.id}
                    listing={l}
                    selected={selectedListing?.id === l.id && drawerOpen}
                    onSelect={handleSelectListing}
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#2D6A4F] hover:text-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </button>
                <span className="text-sm text-[#9CA3AF]" aria-current="page">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => navigate(buildUrl({ page: currentPage + 1 }))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#2D6A4F] hover:text-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Go to next page"
                >
                  Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </section>

          {/* Map panel */}
          <section
            className={cn('flex-1 min-w-0', mobileView === 'map' ? 'flex w-full' : 'hidden lg:flex')}
            aria-label="Interactive map of knowledge resource locations"
          >
            <ResearchMapPanel
              entries={mapEntries}
              selectedId={selectedListing?.id}
              onSelectEntry={handleMapSelect}
              className="w-full h-full"
            />
          </section>
        </div>
      </div>

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
