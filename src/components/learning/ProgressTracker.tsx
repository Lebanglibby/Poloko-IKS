import Link from 'next/link'
import { CheckCircle2, Trophy } from 'lucide-react'
import type { Lesson } from '@/lib/types'

interface Props {
  lessons: Lesson[]
  completedIds: string[]
  courseId: string
  completedAt: string | null
}

export function ProgressTracker({ lessons, completedIds, courseId, completedAt }: Props) {
  const total     = lessons.length
  const completed = completedIds.length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone   = completed === total && total > 0

  return (
    <div
      className="rounded-2xl border-2 p-5"
      style={{ background: allDone ? 'var(--l-elder-bg)' : '#FFFBEB', borderColor: allDone ? 'var(--l-elder-border)' : '#FDE68A' }}
      role="region"
      aria-label={`Course progress: ${pct}% complete`}
    >
      {allDone ? (
        /* Course complete state */
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 lesson-check-enter"
            style={{ background: 'var(--l-elder-border)', border: '2px solid var(--l-elder-border)' }}>
            <Trophy className="h-6 w-6" style={{ color: 'var(--l-elder)' }} aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--l-elder)' }}>
              Course Complete! 🎉
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
              You&apos;ve completed all {total} lessons.
              {completedAt && ` Finished on ${new Date(completedAt).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
            </p>
          </div>
        </div>
      ) : (
        /* In-progress state */
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[#92400E]">Your Progress</p>
            <span className="text-sm font-bold text-[#92400E]" aria-hidden="true">
              {completed}/{total} lessons
            </span>
          </div>

          {/* Progress bar */}
          <div className="l-progress-bar mb-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% complete`}>
            <div className="l-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* Lesson dots */}
          <div className="flex gap-1 flex-wrap" aria-label="Lesson completion status">
            {lessons.map(l => {
              const done = completedIds.includes(l.id)
              return (
                <Link
                  key={l.id}
                  href={`/learn/${courseId}/lesson/${l.id}`}
                  className="h-3 w-3 rounded-full transition-all hover:scale-125"
                  style={{ background: done ? 'var(--l-elder)' : '#FDE68A', border: `1px solid ${done ? 'var(--l-elder-border)' : '#FCD34D'}` }}
                  aria-label={`${done ? 'Completed' : 'Incomplete'}: ${l.title}`}
                  title={l.title}
                />
              )
            })}
          </div>

          {pct > 0 && (
            <p className="text-xs text-[#B45309] mt-2">
              Keep going — {total - completed} lesson{total - completed !== 1 ? 's' : ''} to go!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
