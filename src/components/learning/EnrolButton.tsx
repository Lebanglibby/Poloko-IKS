'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, BookOpen, Zap, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface Props {
  courseId: string
  isFree: boolean
  isEnrolled: boolean
  isAuthenticated: boolean
  firstLessonId: string | null
}

export function EnrolButton({ courseId, isFree, isEnrolled, isAuthenticated, firstLessonId }: Props) {
  const [loading, setLoading] = useState(false)
  const router    = useRouter()
  const { toast } = useToast()

  /* Already enrolled → go to first lesson */
  if (isEnrolled && firstLessonId) {
    return (
      <Link
        href={`/learn/${courseId}/lesson/${firstLessonId}`}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white btn-learn"
        aria-label="Continue learning — go to first lesson"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Continue Learning
      </Link>
    )
  }

  if (isEnrolled) {
    return (
      <div
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'var(--l-elder-bg)', color: 'var(--l-elder)', border: '2px solid var(--l-elder-border)' }}
        role="status"
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Enrolled
      </div>
    )
  }

  /* Not authenticated → prompt to register/login */
  if (!isAuthenticated) {
    return (
      <div className="space-y-2">
        <Link
          href={`/register?redirect=/learn/${courseId}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white btn-learn"
        >
          {isFree ? (
            <><Zap className="h-4 w-4" aria-hidden="true" /> Enrol Free</>
          ) : (
            <><BookOpen className="h-4 w-4" aria-hidden="true" /> Enrol Now</>
          )}
        </Link>
        <p className="text-xs text-center text-[#9CA3AF]">
          <Link href={`/login?redirect=/learn/${courseId}`} className="text-[#92400E] font-semibold hover:underline">
            Sign in
          </Link>
          {' '}if you already have an account
        </p>
      </div>
    )
  }

  async function handleEnrol() {
    setLoading(true)
    try {
      const res = await fetch('/api/enrolments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ course_id: courseId }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast({ type: 'error', message: json.error ?? 'Enrolment failed. Please try again.' })
        return
      }
      toast({ type: 'success', message: 'You\'re enrolled!', description: 'Start your first lesson now.' })
      router.refresh()
    } catch {
      toast({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleEnrol}
      disabled={loading}
      aria-busy={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white btn-learn disabled:opacity-60 disabled:cursor-not-allowed"
      aria-label={isFree ? 'Enrol in this course for free' : 'Enrol in this course'}
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enrolling…</>
      ) : isFree ? (
        <><Zap className="h-4 w-4" aria-hidden="true" /> Enrol Free</>
      ) : (
        <><BookOpen className="h-4 w-4" aria-hidden="true" /> Enrol Now</>
      )}
    </button>
  )
}
