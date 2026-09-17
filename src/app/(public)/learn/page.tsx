import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { CourseCatalogue } from '@/components/learning/CourseCatalogue'
import { MediaGallery } from '@/components/learning/MediaGallery'
import {
  COURSE_CATEGORY_LABELS,
  COURSE_CATEGORY_EMOJI,
  SKILL_LEVEL_LABELS,
} from '@/lib/constants'
import { GraduationCap, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { CourseCategory, SkillLevel } from '@/lib/types'

export const metadata = {
  title: 'Learning Hub — Poloko IKS',
  description:
    'Learn traditional skills, crafts, and cultural practices from Botswana\'s knowledge holders. Every course is Elder Board approved.',
}

interface SearchParams {
  category?: CourseCategory
  skill_level?: SkillLevel
  search?: string
  page?: string
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params   = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const PAGE_SIZE = 12
  const page   = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('courses')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.category)    query = query.eq('category',    params.category)
  if (params.skill_level) query = query.eq('skill_level', params.skill_level)
  if (params.search)      query = query.ilike('title',    `%${params.search}%`)

  const { data: courses, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Featured: most recently approved, up to 3
  const { data: featured } = await supabase
    .from('courses')
    .select('*, profiles(full_name, community)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)

  // Media gallery items
  const { data: mediaItems } = await supabase
    .from('media_items')
    .select('*, profiles(full_name, community)')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} />

      {/* Skip nav */}
      <a href="#course-catalogue" className="skip-nav">Skip to courses</a>

      {/* ── Hero header ──────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #78350F 0%, #92400E 40%, #B45309 75%, #D97706 100%)',
        }}
      >
        {/* Kente top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 l-kente-stripe" aria-hidden="true" />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-pattern-dots" aria-hidden="true" />
        {/* Warm glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FDE68A 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
              aria-hidden="true"
            >
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight">
                Learning Hub
              </h1>
              <p className="text-amber-200 text-sm font-semibold mt-1 tracking-wide">
                <span lang="tn" title="Setswana: Education / Learning">Thuto</span>
                {' '}·{' '}
                Traditional skills for future generations
              </p>
            </div>
          </div>

          <p className="text-amber-100/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Learn basket weaving, natural cooking, cultural arts, and sustainable practices
            directly from Botswana&apos;s knowledge holders. Every course is reviewed and
            approved by the Elder Board before it goes live.
          </p>

          {/* Category quick-browse */}
          <div className="flex flex-wrap gap-2" role="list" aria-label="Browse by category">
            {Object.entries(COURSE_CATEGORY_LABELS).map(([value, label]) => {
              const emoji = COURSE_CATEGORY_EMOJI[value as CourseCategory]
              return (
                <Link
                  key={value}
                  href={`/learn?category=${value}`}
                  role="listitem"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background:   params.category === value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
                    color:        params.category === value ? '#78350F' : 'rgba(255,255,255,0.9)',
                    border:       params.category === value ? '1px solid white' : '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative z-10" aria-hidden="true">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="#FDFBF7" />
          </svg>
        </div>
      </header>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8DDD0] px-4 sm:px-6 py-4">
        <div className="max-w-screen-xl mx-auto">
          <ul className="flex flex-wrap items-center justify-center gap-5 sm:gap-8" role="list">
            {[
              { icon: '✅', text: 'Every course Elder Board approved'      },
              { icon: '🌿', text: 'Taught by community knowledge holders' },
              { icon: '🎓', text: 'Learn at your own pace'                 },
              { icon: '💳', text: 'Creators earn in BWP'                   },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm font-medium text-[#6B5344]">
                <span aria-hidden="true">{icon}</span>
                {text}
              </li>
            ))}
            {/* Cross-module quick links */}
            <li className="hidden sm:flex items-center gap-2 border-l border-[#E8DDD0] pl-5 ml-2">
              <Link href="/vault"    className="text-xs font-semibold text-[#9CA3AF] hover:text-[#8B2500] transition-colors">📚 Vault</Link>
              <span className="text-[#E8DDD0]">·</span>
              <Link href="/research" className="text-xs font-semibold text-[#9CA3AF] hover:text-[#2D6A4F] transition-colors">🔬 Research</Link>
              <span className="text-[#E8DDD0]">·</span>
              <Link href="/map"      className="text-xs font-semibold text-[#9CA3AF] hover:text-[#8B2500] transition-colors">🗺️ Map</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Featured courses ─────────────────────────────────────── */}
      {featured && featured.length > 0 && !params.category && !params.search && page === 1 && (
        <section aria-labelledby="featured-heading" className="px-4 sm:px-6 py-10 bg-[#FDFBF7]">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
              <h2 id="featured-heading" className="font-display text-2xl text-[#1A1008]">
                Recently Approved
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(course => (
                <Link
                  key={course.id}
                  href={`/learn/${course.id}`}
                  className="group block bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden l-card-lift"
                >
                  {/* Cover image */}
                  <div
                    className="h-40 bg-[#F5F0E8] flex items-center justify-center relative overflow-hidden"
                    style={course.cover_image_url ? { backgroundImage: `url(${course.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!course.cover_image_url && (
                      <span className="text-5xl" aria-hidden="true">
                        {COURSE_CATEGORY_EMOJI[course.category as CourseCategory]}
                      </span>
                    )}
                    {/* Elder badge overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'var(--l-elder-bg)', color: 'var(--l-elder)', border: '1px solid var(--l-elder-border)' }}>
                      ✓ Elder Approved
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-[#B45309] mb-1">
                      {COURSE_CATEGORY_LABELS[course.category as CourseCategory]}
                    </p>
                    <h3 className="font-bold text-[#1F2937] text-sm leading-snug group-hover:text-[#92400E] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1">{course.profiles?.full_name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold" style={{ color: course.price_bwp === 0 ? 'var(--l-free)' : '#1F2937' }}>
                        {course.price_bwp === 0 ? 'Free' : `BWP ${course.price_bwp.toFixed(2)}`}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">
                        {course.enrolment_count} learner{course.enrolment_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main catalogue ───────────────────────────────────────── */}
      <main id="course-catalogue" tabIndex={-1} className="flex-1 outline-none">
        <CourseCatalogue
          courses={courses ?? []}
          totalCount={count ?? 0}
          totalPages={totalPages}
          currentPage={page}
          currentFilters={{
            category:    params.category,
            skill_level: params.skill_level,
            search:      params.search,
          }}
          categoryLabels={COURSE_CATEGORY_LABELS}
          skillLabels={SKILL_LEVEL_LABELS}
          userRole={profile?.role ?? null}
          userId={user?.id ?? null}
        />
      </main>

      {/* ── Media gallery ────────────────────────────────────────── */}
      {mediaItems && mediaItems.length > 0 && (
        <section aria-labelledby="gallery-heading" className="bg-white border-t-2 border-[#E8DDD0] px-4 sm:px-6 py-12">
          <div className="max-w-screen-xl mx-auto">
            <div className="mb-6">
              <h2 id="gallery-heading" className="font-display text-2xl sm:text-3xl text-[#1A1008] mb-1">
                Demonstrations &amp; Media
              </h2>
              <p className="text-sm text-[#6B5344]">
                Free short videos and photo series from community practitioners
              </p>
            </div>
            <MediaGallery items={mediaItems} />
          </div>
        </section>
      )}
    </div>
  )
}
