import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { LessonPlayer } from '@/components/learning/LessonPlayer'
import { COURSE_CATEGORY_LABELS, LESSON_TYPE_LABELS } from '@/lib/constants'
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  BookOpen, CheckCircle2, Lock,
} from 'lucide-react'
import type { CourseCategory, LessonContentType } from '@/lib/types'

export default async function LessonViewPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  // Fetch the course
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, category, creator_id, price_bwp, status')
    .eq('id', courseId)
    .single()

  if (!course || course.status !== 'approved') notFound()

  // Fetch the specific lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .eq('course_id', courseId)
    .single()

  if (!lesson) notFound()

  // Fetch all lessons for nav and progress
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, sort_order, content_type, duration_mins, is_free_preview')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  // Check access
  const isFree      = course.price_bwp === 0
  const isPreview   = lesson.is_free_preview
  const isCreator   = user?.id === course.creator_id

  const { data: enrolment } = user
    ? await supabase
        .from('course_enrolments')
        .select('id, completed_lesson_ids, completed_at')
        .eq('course_id', courseId)
        .eq('learner_id', user.id)
        .single()
    : { data: null }

  const isEnrolled = !!enrolment
  const canAccess  = isFree || isPreview || isEnrolled || isCreator

  // Gate: not accessible → redirect to course page
  if (!canAccess) {
    redirect(`/learn/${courseId}`)
  }

  // Prev / next lesson navigation
  const currentIdx  = allLessons?.findIndex(l => l.id === lessonId) ?? 0
  const prevLesson  = allLessons?.[currentIdx - 1] ?? null
  const nextLesson  = allLessons?.[currentIdx + 1] ?? null
  const completedIds = enrolment?.completed_lesson_ids ?? []
  const isDone       = completedIds.includes(lessonId)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} />

      {/* ── Lesson top bar ─────────────────────────────────────── */}
      <div
        className="sticky top-16 z-30 bg-white border-b-2 border-[#E8DDD0] px-4 sm:px-6 py-3"
        style={{ boxShadow: '0 2px 8px rgba(146,64,14,0.06)' }}
      >
        <div className="max-w-screen-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/learn/${courseId}`}
              className="shrink-0 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#92400E] hover:bg-[#FFFBEB] transition-colors"
              aria-label="Back to course"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-[#9CA3AF] font-medium truncate">
                {COURSE_CATEGORY_LABELS[course.category as CourseCategory]}
              </p>
              <p className="text-sm font-bold text-[#1F2937] truncate">{course.title}</p>
            </div>
          </div>

          {/* Lesson counter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#9CA3AF] hidden sm:block">
              Lesson {currentIdx + 1} of {allLessons?.length ?? 1}
            </span>
            {isDone && (
              <span className="flex items-center gap-1 text-xs font-semibold lesson-check-enter" style={{ color: 'var(--l-elder)' }}>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Done
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Lesson content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Lesson header */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] leading-tight mb-1">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                <span>{LESSON_TYPE_LABELS[lesson.content_type as LessonContentType]}</span>
                {lesson.duration_mins && (
                  <><span aria-hidden="true">·</span><span>{lesson.duration_mins} min</span></>
                )}
                {lesson.is_free_preview && !isEnrolled && (
                  <span className="font-semibold text-[#0F766E]">Free Preview</span>
                )}
              </div>
            </div>

            {/* Media player */}
            <LessonPlayer lesson={lesson} />

            {/* Description */}
            {lesson.description && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#1F2937] mb-2">About this lesson</h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">{lesson.description}</p>
              </div>
            )}

            {/* Text content */}
            {lesson.text_content && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                  Step-by-Step Instructions
                </h2>
                <div className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line prose-sm max-w-none">
                  {lesson.text_content}
                </div>
              </div>
            )}

            {/* Materials list */}
            {lesson.materials_list && lesson.materials_list.length > 0 && (
              <div className="rounded-2xl border-2 p-5" style={{ background: 'var(--l-primary-light)', borderColor: 'var(--l-primary-border)' }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--l-primary)' }}>
                  🧺 Materials &amp; Tools Needed
                </h2>
                <ul className="space-y-2" aria-label="Materials list">
                  {lesson.materials_list.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--l-primary)' }}>
                      <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--l-primary-mid)' }} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mark complete / locked next prompt */}
            {isEnrolled && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {!isDone ? (
                  <form action="/api/enrolments" method="POST">
                    {/* Client-side handled by EnrolButton — placeholder for server form */}
                    <button
                      type="button"
                      id="mark-complete-btn"
                      data-course-id={courseId}
                      data-lesson-id={lessonId}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-sm btn-learn"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mark as Complete
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold lesson-check-enter"
                    style={{ background: 'var(--l-elder-bg)', color: 'var(--l-elder)', border: '1px solid var(--l-elder-border)' }}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Lesson completed
                  </div>
                )}
              </div>
            )}

            {/* Prev / next nav */}
            <div className="flex items-center gap-3 pt-2">
              {prevLesson ? (
                <Link
                  href={`/learn/${courseId}/lesson/${prevLesson.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] transition-all"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Link>
              ) : <div />}

              {nextLesson && (
                <Link
                  href={`/learn/${courseId}/lesson/${nextLesson.id}`}
                  className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm btn-learn"
                >
                  Next lesson
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {/* ── Sidebar: lesson list ─────────────────────────────── */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#F3F0EB]">
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">All Lessons</p>
              </div>
              <ol className="divide-y divide-[#F3F0EB] max-h-[60vh] overflow-y-auto">
                {allLessons?.map((l, idx) => {
                  const isDoneL    = completedIds.includes(l.id)
                  const isCurrent  = l.id === lessonId
                  const canAccL    = isFree || l.is_free_preview || isEnrolled || isCreator
                  return (
                    <li key={l.id}>
                      {canAccL ? (
                        <Link
                          href={`/learn/${courseId}/lesson/${l.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#FDFBF7] transition-colors"
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span
                            className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2"
                            style={isDoneL
                              ? { background: 'var(--l-elder-bg)',  borderColor: 'var(--l-elder-border)', color: 'var(--l-elder)'  }
                              : isCurrent
                              ? { background: 'var(--l-primary-light)', borderColor: 'var(--l-primary-border)', color: 'var(--l-primary)' }
                              : { background: '#F3F0EB', borderColor: '#E5D8C8', color: '#9CA3AF' }
                            }
                            aria-hidden="true"
                          >
                            {isDoneL ? '✓' : idx + 1}
                          </span>
                          <p className={`text-xs leading-snug line-clamp-2 ${isCurrent ? 'font-bold text-[#92400E]' : 'text-[#4B5563]'}`}>
                            {l.title}
                          </p>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 opacity-50">
                          <Lock className="h-4 w-4 text-[#D4C4B0] shrink-0" aria-hidden="true" />
                          <p className="text-xs text-[#9CA3AF] line-clamp-2">{l.title}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
              <div className="px-4 py-3 border-t border-[#F3F0EB]">
                <Link
                  href={`/learn/${courseId}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] hover:text-[#92400E] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to course overview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
