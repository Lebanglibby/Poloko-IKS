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

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden">
      <div className="h-1.5 skeleton" />
      <div className="p-5 space-y-3">
        <div className="flex gap-3">
          <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-5 w-20 rounded-full shrink-0" />
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

/* ─── Filter pill ────────────────────────────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-[#FEF2E8] text-[#9A3412] border border-[#FDBA74]">
      {label}
      <button onClick={onRemove} aria-label={`Remove: ${label}`}
        className="rounded-full p-0.5 hover:bg-[#FDBA74]/40 transition-colors">
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

export function ResearchHubClient({
  listings, mapEntries, error, totalCount, totalPages, currentPage,
  currentFilters, licenseLabels, userRole, userId,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedListing, setSelectedListing] = useState<ResearchListing | null>(null)
  const [drawerOpen, setDrawerOpen]             = useState(false)
  const [mobileView, setMobileView]             = useState<'list' | 'map'>('list')
  const [filtersOpen, setFiltersOpen]           = useState(false)

  const [search,      setSearch]      = useState(currentFilters.search       ?? '')
  const [licenseType, setLicenseType] = useState<LicenseType | ''>(currentFilters.license_type ?? '')
  const [status,      setStatus]      = useState(currentFilters.status        ?? '')

  function buildUrl(o: Partial<typeof currentFilters & { page?: number }> = {}) {
    const qs = new URLSearchParams()
    const s  = o.search       !== undefined ? o.search       : (currentFilters.search       ?? '')
    const l  = o.license_type !== undefined ? o.license_type : (currentFilters.license_type ?? '')
    const st = o.status       !== undefined ? o.status       : (currentFilters.status        ?? '')
    const p  = o.page ?? 1
    if (s)  qs.set('search', s)
    if (l)  qs.set('license_type', l)
    if (st) qs.set('status', st)
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

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search research listings…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl text-[#1F2937] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#9A3412] focus:ring-2 focus:ring-[#9A3412]/20 transition-all"
                  aria-label="Search research"
                />
              </div>

              <button type="button" onClick={() => setFiltersOpen(v => !v)}
                className={cn('flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
                  filtersOpen ? 'border-[#9A3412] bg-[#FEF2E8] text-[#9A3412]' : 'border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412]'
                )}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {hasFilters && <span className="h-2 w-2 rounded-full bg-[#9A3412]" aria-hidden="true" />}
              </button>

              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm">
                Search
              </button>

              {hasFilters && (
                <button type="button" onClick={clearAll} className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#9A3412] transition-colors">
                  <X className="h-4 w-4" aria-hidden="true" /> Clear all
                </button>
              )}

              <div className="ml-auto lg:hidden flex rounded-xl border border-[#E8DDD0] overflow-hidden">
                {([['list', LayoutList, 'List'], ['map', MapIcon, 'Map']] as const).map(([id, Icon, label]) => (
                  <button key={id} type="button" onClick={() => setMobileView(id)}
                    className={cn('px-3 py-2 transition-colors', mobileView === id ? 'bg-[#FEF2E8] text-[#9A3412]' : 'text-[#9CA3AF] hover:text-[#4B5563]')}
                    aria-label={`${label} view`} aria-pressed={mobileView === id}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {filtersOpen && (
              <div className="mt-3 pt-3 border-t border-[#F3F0EB] flex flex-wrap gap-2 items-center">
                <select value={licenseType} onChange={e => setLicenseType(e.target.value as LicenseType | '')}
                  className="bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl px-3 py-2 text-sm text-[#4B5563] focus:outline-none focus:border-[#9A3412] transition-all"
                  aria-label="Filter by license">
                  <option value="">All Licenses</option>
                  {(Object.entries(licenseLabels) as [LicenseType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl px-3 py-2 text-sm text-[#4B5563] focus:outline-none focus:border-[#9A3412] transition-all"
                  aria-label="Filter by status">
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="open_for_collaboration">Open for Collaboration</option>
                </select>
              </div>
            )}

            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentFilters.search       && <FilterPill label={`"${currentFilters.search}"`} onRemove={() => navigate(buildUrl({ search: '', page: 1 }))} />}
                {currentFilters.license_type && <FilterPill label={licenseLabels[currentFilters.license_type]} onRemove={() => navigate(buildUrl({ license_type: undefined, page: 1 }))} />}
                {currentFilters.status       && <FilterPill label={currentFilters.status} onRemove={() => navigate(buildUrl({ status: undefined, page: 1 }))} />}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Split body ───────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}
        <div className="flex gap-6 h-[calc(100vh-16rem)]">
          {/* Card list */}
          <section className={cn('flex flex-col lg:w-[440px] xl:w-[480px] shrink-0', mobileView === 'map' ? 'hidden' : 'flex w-full')} aria-label="Research listings">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-sm text-[#9CA3AF]" aria-live="polite" aria-atomic="true">
                {isPending ? 'Loading…' : `${totalCount.toLocaleString()} listing${totalCount !== 1 ? 's' : ''}${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`}
              </p>
              {!isPending && totalCount > 0 && <p className="text-xs text-[#9CA3AF]">Tap to view full details</p>}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1">
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                : listings.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#FEF9F0] border border-[#E8DDD0] flex items-center justify-center">
                      <FlaskConical className="h-8 w-8 text-[#D4C4B0]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#4B5563]">No listings found</p>
                      <p className="text-sm text-[#9CA3AF] mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Check back soon.'}</p>
                      {hasFilters && <button onClick={clearAll} className="mt-3 text-sm font-semibold text-[#9A3412] hover:underline">Clear filters</button>}
                    </div>
                  </div>
                )
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

            {totalPages > 1 && !isPending && (
              <div className="flex items-center justify-center gap-3 pt-5 shrink-0 border-t border-[#E8DDD0] mt-4">
                <button onClick={() => navigate(buildUrl({ page: currentPage - 1 }))} disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </button>
                <span className="text-sm text-[#9CA3AF]">{currentPage} of {totalPages}</span>
                <button onClick={() => navigate(buildUrl({ page: currentPage + 1 }))} disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page">
                  Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>

          {/* Map panel */}
          <section className={cn('flex-1 min-w-0 lg:flex hidden', mobileView === 'map' ? 'flex w-full' : 'hidden')} aria-label="Location map">
            <ResearchMapPanel entries={mapEntries} selectedId={selectedListing?.id} onSelectEntry={handleMapSelect} className="w-full h-full" />
          </section>
        </div>
      </div>

      <ResearchDetailDrawer listing={selectedListing} isOpen={drawerOpen} onClose={handleCloseDrawer} userRole={userRole} userId={userId} />
    </>
  )
}
