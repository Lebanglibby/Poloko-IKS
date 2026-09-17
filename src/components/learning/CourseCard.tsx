import Link from 'next/link'
import { Users, BookOpen, Clock, Zap } from 'lucide-react'
import { ElderApprovalBadge } from './ElderApprovalBadge'
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_EMOJI, SKILL_LEVEL_LABELS } from '@/lib/constants'
import type { Course, CourseCategory, SkillLevel } from '@/lib/types'

const CATEGORY_CLASS: Record<CourseCategory, string> = {
  traditional_crafts:   'cat-crafts',
  culinary_heritage:    'cat-culinary',
  cultural_arts:        'cat-arts',
  natural_building:     'cat-building',
  ecological_practices: 'cat-ecology',
  modern_fusion:        'cat-fusion',
}

interface Props {
  course: Course
}

export function CourseCard({ course }: Props) {
  const catClass  = CATEGORY_CLASS[course.category] ?? 'cat-crafts'
  const isFree    = course.price_bwp === 0
  const lessonCount = (course as Course & { lessons?: { id: string }[] }).lessons?.length ?? null

  return (
    <Link
      href={`/learn/${course.id}`}
      className="group block bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden l-card-lift focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#92400E] focus-visible:ring-offset-2"
      aria-label={`${course.title} — ${COURSE_CATEGORY_LABELS[course.category]} — ${isFree ? 'Free' : `BWP ${course.price_bwp.toFixed(2)}`}`}
    >
      {/* Cover image / emoji placeholder */}
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={
          course.cover_image_url
            ? { backgroundImage: `url(${course.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #FEF3C7, #FDE68A, #FFFBEB)' }
        }
      >
        {!course.cover_image_url && (
          <span className="text-6xl" aria-hidden="true">
            {COURSE_CATEGORY_EMOJI[course.category]}
          </span>
        )}
        {/* Elder badge overlay — compact */}
        <div className="absolute top-2.5 right-2.5">
          <ElderApprovalBadge size="compact" />
        </div>
        {/* Kente bottom strip */}
        <div className="absolute bottom-0 left-0 right-0 h-1 l-kente-stripe" aria-hidden="true" />
      </div>

      <div className="p-4">
        {/* Category chip */}
        <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mb-2 ${catClass}`}>
          <span aria-hidden="true">{COURSE_CATEGORY_EMOJI[course.category]} </span>
          {COURSE_CATEGORY_LABELS[course.category]}
        </span>

        {/* Title */}
        <h3 className="font-bold text-[#1F2937] text-sm leading-snug group-hover:text-[#92400E] transition-colors line-clamp-2 mb-1">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="text-xs text-[#9CA3AF] line-clamp-1 mb-2">{course.subtitle}</p>
        )}

        {/* Creator */}
        {course.profiles?.full_name && (
          <p className="text-xs text-[#6B5344] mb-3">
            <span className="sr-only">By </span>{course.profiles.full_name}
            {course.profiles.community && <span className="text-[#9CA3AF]"> · {course.profiles.community}</span>}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-[#F3F0EB] text-[#6B5344] border border-[#E5D8C8] font-medium">
            {SKILL_LEVEL_LABELS[course.skill_level as SkillLevel]}
          </span>
          {lessonCount !== null && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden="true" />
            {course.enrolment_count}
          </span>
        </div>

        {/* Price footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F3F0EB]">
          <span
            className="text-base font-bold"
            style={{ color: isFree ? 'var(--l-free)' : '#1F2937' }}
            aria-label={isFree ? 'Free course' : `Price: BWP ${course.price_bwp.toFixed(2)}`}
          >
            {isFree
              ? <span className="flex items-center gap-1"><Zap className="h-4 w-4" aria-hidden="true" />Free</span>
              : `BWP ${course.price_bwp.toFixed(2)}`
            }
          </span>
          <span className="text-xs text-[#9CA3AF] group-hover:text-[#92400E] transition-colors font-semibold">
            View course →
          </span>
        </div>
      </div>
    </Link>
  )
}
