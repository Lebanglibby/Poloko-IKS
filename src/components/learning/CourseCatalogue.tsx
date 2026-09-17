'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { CourseCard } from './CourseCard'
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_EMOJI, SKILL_LEVEL_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Course, CourseCategory, SkillLevel } from '@/lib/types'

function CourseSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden" aria-hidden="true">
      <div className="h-44 skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-1/3 rounded-full" />
        <div className="skeleton h-5 w-4/5 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="border-t border-[#F3F0EB] pt-3 flex justify-between">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}

interface Props {
  courses: Course[]
  totalCount: number
  totalPages: number
  currentPage: number
  currentFilters: { category?: string; skill_level?: string; search?: string }
  categoryLabels: Record<string, string>
  skillLabels: Record<string, string>
  userRole: string | null
  userId: string | null
}

export function CourseCatalogue({
  courses, totalCount, totalPages, currentPage,
  currentFilters, categoryLabels, skillLabels,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search,      setSearch]      = useState(currentFilters.search      ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const hasFilters = !!(currentFilters.category || currentFilters.skill_level || currentFilters.search)

  function buildUrl(o: { category?: string; skill_level?: string; search?: string; page?: number } = {}) {
    const qs  = new URLSearchParams()
    const s   = o.search      !== undefined ? o.search      : (currentFilters.search      ?? '')
    const c   = o.category    !== undefined ? o.category    : (currentFilters.category    ?? '')
    const sk  = o.skill_level !== undefined ? o.skill_level : (currentFilters.skill_level ?? '')
    const p   = o.page ?? 1
    if (s)  qs.set('search',      s)
    if (c)  qs.set('category',    c)
    if (sk) qs.set('skill_level', sk)
    if (p > 1) qs.set('page',     String(p))
    const q = qs.toString()
    return `/learn${q ? `?${q}` : ''}`
  }

  function navigate(url: string) { startTransition(() => router.push(url)) }
  function clearAll() { setSearch(''); navigate('/learn') }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(buildUrl({ search, page: 1 }))
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-[#E8DDD0] p-4 mb-6 shadow-sm"
        style={{ boxShadow: '0 2px 8px rgba(146,64,14,0.06)' }}
      >
        <form onSubmit={handleSearch} role="search" aria-label="Search courses">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-all"
                aria-label="Search courses"
              />
            </div>
            <button type="button" onClick={() => setFiltersOpen(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors',
                filtersOpen ? 'border-[#92400E] bg-[#FFFBEB] text-[#92400E]' : 'border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#92400E] hover:text-[#92400E]'
              )}
              aria-expanded={filtersOpen} aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {hasFilters && <span className="h-2 w-2 rounded-full bg-[#92400E]" aria-label="Filters active" />}
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm btn-learn" style={{ padding: '10px 20px' }}>
              Search
            </button>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#92400E] transition-colors" aria-label="Clear all filters">
                <X className="h-4 w-4" aria-hidden="true" /> Clear all
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {filtersOpen && (
            <div className="mt-3 pt-3 border-t border-[#F3F0EB] space-y-3">
              {/* Category chips */}
              <div>
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2" id="cat-filter-label">Category</p>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cat-filter-label">
                  <button type="button" onClick={() => navigate(buildUrl({ category: '', page: 1 }))}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      !currentFilters.category ? 'bg-[#92400E] text-white border-[#92400E]' : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#FDE68A]'
                    )} aria-pressed={!currentFilters.category}>
                    All
                  </button>
                  {(Object.entries(categoryLabels) as [CourseCategory, string][]).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => navigate(buildUrl({ category: val, page: 1 }))}
                      className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        currentFilters.category === val ? 'bg-[#92400E] text-white border-[#92400E]' : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#FDE68A]'
                      )} aria-pressed={currentFilters.category === val}>
                      <span aria-hidden="true">{COURSE_CATEGORY_EMOJI[val]}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Skill level chips */}
              <div>
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2" id="skill-filter-label">Skill Level</p>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="skill-filter-label">
                  <button type="button" onClick={() => navigate(buildUrl({ skill_level: '', page: 1 }))}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      !currentFilters.skill_level ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#1F2937]'
                    )} aria-pressed={!currentFilters.skill_level}>
                    All Levels
                  </button>
                  {(Object.entries(skillLabels) as [SkillLevel, string][]).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => navigate(buildUrl({ skill_level: val, page: 1 }))}
                      className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        currentFilters.skill_level === val ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white text-[#4B5563] border-[#E8DDD0] hover:border-[#1F2937]'
                      )} aria-pressed={currentFilters.skill_level === val}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#9CA3AF]" aria-live="polite" aria-atomic="true">
          {isPending ? 'Loading…' : (
            <><span className="font-semibold text-[#4B5563]">{totalCount.toLocaleString()}</span> course{totalCount !== 1 ? 's' : ''} found</>
          )}
        </p>
      </div>

      {/* Course grid */}
      {isPending ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8DDD0]">
          <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
          <p className="text-base font-bold text-[#1F2937]">No courses found</p>
          <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs mx-auto">
            {hasFilters ? 'Try a different category or remove filters.' : 'Check back soon — more courses are coming.'}
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="mt-4 btn-learn inline-flex items-center gap-1.5" style={{ padding: '8px 16px', fontSize: 13 }}>
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isPending && (
        <nav aria-label={`Pagination — page ${currentPage} of ${totalPages}`} className="flex items-center justify-center gap-3 mt-10">
          <button onClick={() => navigate(buildUrl({ page: currentPage - 1 }))} disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Go to previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </button>
          <span className="text-sm text-[#9CA3AF]" aria-current="page">Page {currentPage} of {totalPages}</span>
          <button onClick={() => navigate(buildUrl({ page: currentPage + 1 }))} disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Go to next page">
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
