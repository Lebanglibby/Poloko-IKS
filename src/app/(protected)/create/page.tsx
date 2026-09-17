import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import {
  COURSE_CATEGORY_LABELS,
  COURSE_CATEGORY_EMOJI,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_STYLES,
} from '@/lib/constants'
import {
  GraduationCap, Plus, Eye, Users, BookOpen,
  Clock, Pencil, ArrowRight, AlertCircle,
} from 'lucide-react'
import type { CourseCategory, CourseStatus } from '@/lib/types'

export const metadata = {
  title: 'My Courses — Poloko IKS Learning Hub',
}

export default async function MyCoursesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: courses } = await supabase
    .from('courses')
    .select('*, lessons(id)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    total:     courses?.length ?? 0,
    approved:  courses?.filter(c => c.status === 'approved').length ?? 0,
    pending:   courses?.filter(c => c.status === 'pending_review').length ?? 0,
    learners:  courses?.reduce((s, c) => s + (c.enrolment_count ?? 0), 0) ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <li><Link href="/dashboard" className="hover:text-[#92400E] transition-colors font-medium">Dashboard</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/learn" className="hover:text-[#92400E] transition-colors font-medium">Learning Hub</Link></li>
            <li aria-hidden="true">/</li>
            <li><span className="text-[#4B5563] font-semibold" aria-current="page">My Courses</span></li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderColor: '#FDE68A' }}
              aria-hidden="true"
            >
              <GraduationCap className="h-6 w-6 text-[#92400E]" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">My Courses</h1>
              <p className="text-xs text-[#9C8070] font-semibold mt-0.5">
                Create, manage, and track your knowledge courses
              </p>
            </div>
          </div>
          <Link
            href="/create/new"
            className="btn-learn inline-flex items-center gap-2"
            aria-label="Create a new course"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses',    value: stats.total,    icon: BookOpen, bg: '#FFFBEB', border: '#FDE68A',   color: '#92400E' },
            { label: 'Live',             value: stats.approved, icon: Eye,      bg: '#F0F7F4', border: '#95D5B2',   color: '#2D6A4F' },
            { label: 'Pending Review',   value: stats.pending,  icon: Clock,    bg: '#FFFBEB', border: '#FDE68A',   color: '#B45309' },
            { label: 'Total Learners',   value: stats.learners, icon: Users,    bg: '#F3F0EB', border: '#E5D8C8',   color: '#6B5344' },
          ].map(({ label, value, icon: Icon, bg, border, color }) => (
            <div key={label} className="r-stat-card rounded-2xl p-5 border" style={{ background: bg, borderColor: border }}>
              <Icon className="h-4 w-4 mb-2" style={{ color }} aria-hidden="true" />
              <div className="text-2xl font-bold text-[#1F2937]">{value}</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending review notice */}
        {stats.pending > 0 && (
          <div
            className="flex items-start gap-3 rounded-2xl border-2 p-4 mb-6"
            style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
            role="status"
          >
            <AlertCircle className="h-5 w-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-[#78350F]">
              <strong>{stats.pending} course{stats.pending !== 1 ? 's' : ''}</strong> awaiting Elder Board review.
              You will be notified when the board approves or returns them.
            </p>
          </div>
        )}

        {/* Courses list */}
        {!courses || courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8DDD0]">
            <div
              className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-4 float-gentle"
              style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}
              aria-hidden="true"
            >
              <GraduationCap className="h-10 w-10 text-[#FDE68A]" />
            </div>
            <h2 className="font-display text-xl text-[#1A1008] mb-2">No courses yet</h2>
            <p className="text-sm text-[#9CA3AF] max-w-xs mx-auto mb-6">
              Share your traditional knowledge — create your first course and start earning.
            </p>
            <Link href="/create/new" className="btn-learn inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map(course => {
              const statusStyle = COURSE_STATUS_STYLES[course.status as CourseStatus] ?? COURSE_STATUS_STYLES.draft
              const lessonCount = (course.lessons as { id: string }[] | null)?.length ?? 0
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm flex items-start gap-4"
                >
                  {/* Cover / emoji */}
                  <div
                    className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0 text-3xl border"
                    style={
                      course.cover_image_url
                        ? { backgroundImage: `url(${course.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 }
                        : { background: '#FFFBEB', borderColor: '#FDE68A' }
                    }
                    aria-hidden="true"
                  >
                    {!course.cover_image_url && COURSE_CATEGORY_EMOJI[course.category as CourseCategory]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                      <h2 className="font-bold text-[#1F2937] text-base leading-snug truncate max-w-lg">
                        {course.title}
                      </h2>
                      <span
                        className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border"
                        style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                      >
                        {COURSE_STATUS_LABELS[course.status as CourseStatus]}
                      </span>
                    </div>

                    <p className="text-xs text-[#9CA3AF] mb-2">
                      {COURSE_CATEGORY_LABELS[course.category as CourseCategory]}
                      {' · '}
                      {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                      {' · '}
                      {course.enrolment_count} learner{course.enrolment_count !== 1 ? 's' : ''}
                      {course.price_bwp > 0 && ` · BWP ${course.price_bwp.toFixed(2)}`}
                      {course.price_bwp === 0 && ' · Free'}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Link
                        href={`/create/${course.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] transition-all"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        Edit Course
                      </Link>
                      <Link
                        href={`/create/${course.id}/lessons/new`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] transition-all"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        Add Lesson
                      </Link>
                      {course.status === 'approved' && (
                        <Link
                          href={`/learn/${course.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all btn-learn"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                        >
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          View Live
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
