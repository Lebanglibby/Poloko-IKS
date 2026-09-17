import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ElderApprovalBadge } from '@/components/learning/ElderApprovalBadge'
import { EnrolButton } from '@/components/learning/EnrolButton'
import { CreatorProfile } from '@/components/learning/CreatorProfile'
import { ProgressTracker } from '@/components/learning/ProgressTracker'
import {
  COURSE_CATEGORY_LABELS,
  COURSE_CATEGORY_EMOJI,
  SKILL_LEVEL_LABELS,
  LESSON_TYPE_LABELS,
} from '@/lib/constants'
import {
  ArrowLeft, Clock, Users, BookOpen, PlayCircle,
  Image as ImageIcon, FileText, Zap, Lock, CheckCircle2,
} from 'lucide-react'
import type { CourseCategory, LessonContentType } from '@/lib/types'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const { data: course, error } = await supabase
    .from('courses')
    .select('*, profiles(full_name, community)')
    .eq('id', courseId)
    .single()

  if (error || !course || course.status !== 'approved') notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  // Check enrolment
  const { data: enrolment } = user
    ? await supabase
        .from('course_enrolments')
        .select('id, completed_lesson_ids, completed_at')
        .eq('course_id', courseId)
        .eq('learner_id', user.id)
        .single()
    : { data: null }

  const isEnrolled  = !!enrolment
  const isFree      = course.price_bwp === 0
  const isCreator   = user?.id === course.creator_id
  const totalMins   = lessons?.reduce((s, l) => s + (l.duration_mins ?? 0), 0) ?? 0
  const completedIds = enrolment?.completed_lesson_ids ?? []

  const CONTENT_ICON = {
    video:         PlayCircle,
    image_gallery: ImageIcon,
    text:          FileText,
  } as const

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile?.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF] flex-wrap">
            <li><Link href="/" className="hover:text-[#92400E] transition-colors font-medium">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/learn" className="hover:text-[#92400E] transition-colors font-medium">Learning Hub</Link></li>
            <li aria-hidden="true">/</li>
            <li><span className="text-[#4B5563] font-semibold truncate max-w-[200px] inline-block align-bottom" aria-current="page">{course.title}</span></li>
          </ol>
        </nav>

        <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#92400E] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Learning Hub
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main column ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-sm">
              {/* Cover image */}
              <div
                className="h-52 sm:h-64 flex items-center justify-center relative"
                style={
                  course.cover_image_url
                    ? { backgroundImage: `url(${course.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: 'linear-gradient(135deg, #FEF3C7, #FDE68A, #FFFBEB)' }
                }
              >
                {!course.cover_image_url && (
                  <span className="text-8xl" aria-hidden="true">
                    {COURSE_CATEGORY_EMOJI[course.category as CourseCategory]}
                  </span>
                )}
                {/* Amber top strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 l-kente-stripe" aria-hidden="true" />
              </div>

              <div className="p-6">
                {/* Category + level */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border cat-crafts"
                    style={{ background: 'var(--l-primary-light)', color: 'var(--l-primary)', borderColor: 'var(--l-primary-border)' }}>
                    <span aria-hidden="true">{COURSE_CATEGORY_EMOJI[course.category as CourseCategory]} </span>
                    {COURSE_CATEGORY_LABELS[course.category as CourseCategory]}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F3F0EB] text-[#6B5344] border border-[#E5D8C8]">
                    {SKILL_LEVEL_LABELS[course.skill_level]}
                  </span>
                  {course.language === 'tn' && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]" lang="tn">
                      Setswana
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] leading-tight mb-2">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-[#6B5344] text-base mb-4">{course.subtitle}</p>
                )}

                {/* Elder approval — prominent */}
                <ElderApprovalBadge size="full" />

                {/* Stats row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-[#9CA3AF]">
                  {lessons && lessons.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {totalMins > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {totalMins < 60 ? `${totalMins} min` : `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {course.enrolment_count} learner{course.enrolment_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress (enrolled learners only) */}
            {isEnrolled && lessons && lessons.length > 0 && (
              <ProgressTracker
                lessons={lessons}
                completedIds={completedIds}
                courseId={courseId}
                completedAt={enrolment?.completed_at ?? null}
              />
            )}

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-sm">
                <h2 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                  About this course
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            )}

            {/* Lessons list */}
            {lessons && lessons.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#F3F0EB]">
                  <h2 className="text-sm font-bold text-[#1F2937]">Course Lessons</h2>
                </div>
                <ol className="divide-y divide-[#F3F0EB]">
                  {lessons.map((lesson, idx) => {
                    const Icon        = CONTENT_ICON[lesson.content_type as LessonContentType] ?? PlayCircle
                    const isDone      = completedIds.includes(lesson.id)
                    const canAccess   = isEnrolled || isFree || lesson.is_free_preview || isCreator
                    const lessonHref  = canAccess ? `/learn/${courseId}/lesson/${lesson.id}` : undefined

                    return (
                      <li key={lesson.id}>
                        <div
                          className="flex items-center gap-4 px-5 py-4 hover:bg-[#FDFBF7] transition-colors"
                          role={lessonHref ? undefined : 'presentation'}
                        >
                          {/* Number / check */}
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border-2"
                            style={isDone
                              ? { background: 'var(--l-elder-bg)', borderColor: 'var(--l-elder-border)', color: 'var(--l-elder)' }
                              : { background: '#F3F0EB', borderColor: '#E5D8C8', color: '#9CA3AF' }
                            }
                            aria-hidden="true"
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            {lessonHref ? (
                              <Link
                                href={lessonHref}
                                className="text-sm font-semibold text-[#1F2937] hover:text-[#92400E] transition-colors line-clamp-1"
                              >
                                {lesson.title}
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold text-[#9CA3AF] line-clamp-1">{lesson.title}</p>
                            )}
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {LESSON_TYPE_LABELS[lesson.content_type as LessonContentType]}
                              </span>
                              {lesson.duration_mins && (
                                <span className="text-xs text-[#9CA3AF]">{lesson.duration_mins} min</span>
                              )}
                              {lesson.is_free_preview && !isEnrolled && (
                                <span className="text-xs font-bold text-[#0F766E]">Free Preview</span>
                              )}
                            </div>
                          </div>

                          {/* Lock or play */}
                          {canAccess ? (
                            lessonHref && (
                              <Link href={lessonHref} className="shrink-0 text-[#B45309] hover:text-[#92400E] transition-colors" aria-label={`Start lesson: ${lesson.title}`}>
                                <PlayCircle className="h-5 w-5" aria-hidden="true" />
                              </Link>
                            )
                          ) : (
                            <Lock className="h-4 w-4 text-[#D4C4B0] shrink-0" aria-label="Enrol to unlock" />
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Price + enrol card */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <div className="flex items-baseline gap-1 mb-1">
                {isFree ? (
                  <span className="text-2xl font-bold flex items-center gap-1.5" style={{ color: 'var(--l-free)' }}>
                    <Zap className="h-5 w-5" aria-hidden="true" /> Free
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-[#1F2937]">BWP {course.price_bwp.toFixed(2)}</span>
                )}
              </div>
              {!isFree && (
                <p className="text-xs text-[#9CA3AF] mb-3">
                  Paid — income goes directly to the creator
                </p>
              )}

              <EnrolButton
                courseId={courseId}
                isFree={isFree}
                isEnrolled={isEnrolled}
                isAuthenticated={!!user}
                firstLessonId={lessons?.[0]?.id ?? null}
              />

              {!user && (
                <p className="text-xs text-center text-[#9CA3AF] mt-3">
                  <Link href="/register" className="text-[#92400E] font-semibold hover:underline">Create a free account</Link>
                  {' '}to track your progress
                </p>
              )}
            </div>

            {/* Creator profile */}
            {course.profiles && (
              <CreatorProfile
                name={course.profiles.full_name ?? 'Community Creator'}
                community={course.profiles.community}
              />
            )}

            {/* Course details */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-4">Course Details</h3>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Category',    value: COURSE_CATEGORY_LABELS[course.category as CourseCategory] },
                  { label: 'Level',       value: SKILL_LEVEL_LABELS[course.skill_level]                    },
                  { label: 'Language',    value: course.language === 'tn' ? 'Setswana' : 'English'         },
                  { label: 'Lessons',     value: `${lessons?.length ?? 0}` },
                  { label: 'Learners',    value: `${course.enrolment_count}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-[#9CA3AF]">{label}</dt>
                    <dd className="font-semibold text-[#4B5563]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
