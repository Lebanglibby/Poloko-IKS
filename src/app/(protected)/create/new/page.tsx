'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import {
  COURSE_CATEGORY_LABELS,
  COURSE_CATEGORY_EMOJI,
  SKILL_LEVEL_LABELS,
} from '@/lib/constants'
import type { CourseCategory, SkillLevel, Course } from '@/lib/types'
import {
  GraduationCap, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, ImageIcon, Shield, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TITLE_MAX       = 120
const SUBTITLE_MAX    = 160
const DESC_MAX        = 2000

function CharCounter({ current, max, id }: { current: number; max: number; id: string }) {
  const remaining = max - current
  const warn  = remaining < max * 0.15
  const limit = remaining < 0
  return (
    <span id={id} aria-live="polite" className={cn('text-xs', limit ? 'text-[#B91C1C] font-bold' : warn ? 'text-[#B45309]' : 'text-[#9CA3AF]')}>
      {current}/{max}
    </span>
  )
}

export default function NewCoursePage() {
  const router = useRouter()

  const [title,       setTitle]       = useState('')
  const [subtitle,    setSubtitle]    = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState<CourseCategory>('traditional_crafts')
  const [skillLevel,  setSkillLevel]  = useState<SkillLevel>('beginner')
  const [language,    setLanguage]    = useState<'en' | 'tn'>('en')
  const [priceBwp,    setPriceBwp]    = useState('0')
  const [coverUrl,    setCoverUrl]    = useState('')
  const [previewUrl,  setPreviewUrl]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState(false)
  const [newCourseId, setNewCourseId] = useState<string | null>(null)

  const isFree = parseFloat(priceBwp) === 0 || priceBwp === ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('A course title is required.'); return }
    if (title.length > TITLE_MAX) { setError(`Title must be ${TITLE_MAX} characters or fewer.`); return }
    setLoading(true); setError(null)

    try {
      const res = await fetch('/api/courses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:             title.trim(),
          subtitle:          subtitle.trim()    || null,
          description:       description.trim() || null,
          category,
          skill_level:       skillLevel,
          language,
          price_bwp:         parseFloat(priceBwp) || 0,
          cover_image_url:   coverUrl.trim()    || null,
          preview_video_url: previewUrl.trim()  || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to create course'); setLoading(false); return }

      // Optimistic course — stored for instant display on /learn
      const optimisticCourse: Course = {
        id:                json.data?.id ?? `optimistic-${Date.now()}`,
        title:             title.trim(),
        subtitle:          subtitle.trim() || null,
        description:       description.trim() || null,
        category,
        skill_level:       skillLevel,
        language,
        creator_id:        'demo-user-0001',
        cover_image_url:   coverUrl.trim()   || null,
        preview_video_url: previewUrl.trim() || null,
        price_bwp:         parseFloat(priceBwp) || 0,
        status:            'pending_review',
        rejection_note:    null,
        reviewed_by:       null,
        reviewed_at:       null,
        enrolment_count:   0,
        rating_avg:        0,
        sha256_hash:       `pending-${Date.now()}`,
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString(),
        profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
        lessons:           [],
      }
      try {
        localStorage.setItem('poloko_pending_course', JSON.stringify(optimisticCourse))
      } catch { /* storage unavailable — no-op */ }

      setNewCourseId(json.data?.id ?? optimisticCourse.id)
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (success && newCourseId) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center bg-white rounded-3xl p-10 shadow-sm max-w-sm mx-auto border-2" style={{ borderColor: '#FDE68A' }}>
            <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}>
              <CheckCircle2 className="h-10 w-10 text-[#92400E]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008] mb-2">Course created!</h1>
            <p className="text-xs text-[#9C8070] mb-4 italic" lang="tn">Kosi e Bopilwe — Your course has been saved</p>
            <p className="text-sm text-[#6B5344] leading-relaxed mb-6">
              Your course is saved as a draft. Add lessons, then submit for Elder Board review to publish it.
            </p>
            <div className="flex flex-col gap-2">
              <Link href={`/create/${newCourseId}/lessons/new`} className="btn-learn w-full flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Add First Lesson
              </Link>
              <a
                href="/learn"
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold border-2 border-[#FDE68A] text-[#92400E] hover:bg-[#FFFBEB] transition-colors"
              >
                See My Course in Learning Hub →
              </a>
              <Link href="/create" className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition-colors py-1">
                Back to My Courses
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/create" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#92400E] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to My Courses
        </Link>

        <div className="mb-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm" style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderColor: '#FDE68A' }} aria-hidden="true">
              <GraduationCap className="h-6 w-6 text-[#92400E]" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">Create a Course</h1>
              <p className="text-xs text-[#9C8070] font-semibold mt-0.5" lang="tn">Bopa Kosi — Share your knowledge</p>
            </div>
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Create your course, add lessons, then submit for Elder Board review.
            Once approved it will be live in the Learning Hub and you can start earning.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Create course form" className="space-y-6 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm">

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="title" className="text-sm font-bold text-[#1F2937]">Course Title <span className="text-[#B91C1C]" aria-hidden="true">*</span></label>
              <CharCounter current={title.length} max={TITLE_MAX} id="title-c" />
            </div>
            <input id="title" required value={title} onChange={e => setTitle(e.target.value)} aria-describedby="title-c"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
              placeholder="e.g. Traditional Tswana Basket Weaving" />
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="subtitle" className="text-sm font-bold text-[#1F2937]">Subtitle <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <CharCounter current={subtitle.length} max={SUBTITLE_MAX} id="sub-c" />
            </div>
            <input id="subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} aria-describedby="sub-c"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
              placeholder="e.g. From Mokola palm to a finished lekupa in 8 lessons" />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="desc" className="text-sm font-bold text-[#1F2937]">Description</label>
              <CharCounter current={description.length} max={DESC_MAX} id="desc-c" />
            </div>
            <textarea id="desc" rows={5} value={description} onChange={e => setDescription(e.target.value)} aria-describedby="desc-c"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors resize-none bg-[#FDFBF7]"
              placeholder="What will learners be able to do after this course? What materials do they need? Who is this for?" />
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-3" id="cat-label">Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-labelledby="cat-label">
              {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(([val, label]) => (
                <label key={val} className={cn('flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium',
                  category === val ? 'border-[#92400E] bg-[#FFFBEB] text-[#92400E]' : 'border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#FDE68A]')}>
                  <input type="radio" name="category" value={val} checked={category === val} onChange={() => setCategory(val)} className="sr-only" />
                  <span aria-hidden="true">{COURSE_CATEGORY_EMOJI[val]}</span>
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Skill level + language */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill" className="block text-sm font-bold text-[#1F2937] mb-1.5">Skill Level</label>
              <select id="skill" value={skillLevel} onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#92400E] transition-colors">
                {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][]).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lang" className="block text-sm font-bold text-[#1F2937] mb-1.5">Language</label>
              <select id="lang" value={language} onChange={e => setLanguage(e.target.value as 'en' | 'tn')}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#92400E] transition-colors">
                <option value="en">English</option>
                <option value="tn">Setswana</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-bold text-[#1F2937] mb-1.5">Price (BWP)</label>
            <p className="text-xs text-[#9CA3AF] mb-2">Enter 0 for a free course. Paid courses generate direct income for you as the creator.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9CA3AF]">BWP</span>
              <input id="price" type="number" min="0" step="0.01" value={priceBwp} onChange={e => setPriceBwp(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl pl-14 pr-4 py-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
                placeholder="0.00" />
            </div>
            {!isFree && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--l-primary)' }}>
                💳 Learners pay BWP {parseFloat(priceBwp || '0').toFixed(2)} to enrol
              </p>
            )}
          </div>

          {/* Cover image URL */}
          <div>
            <label htmlFor="cover" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              <ImageIcon className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
              Cover Image URL <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <input id="cover" type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
              placeholder="https://example.com/cover.jpg" />
            <p className="text-xs text-[#9CA3AF] mt-1">Paste a publicly accessible image URL. Recommended size: 1200×675px.</p>
          </div>

          {/* Preview video URL */}
          <div>
            <label htmlFor="preview" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              Preview Video URL <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <input id="preview" type="url" value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
              placeholder="https://youtube.com/embed/..." />
            <p className="text-xs text-[#9CA3AF] mt-1">A short teaser shown on the course page before enrolment.</p>
          </div>

          {/* Elder review note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border" style={{ background: 'var(--l-elder-bg)', borderColor: 'var(--l-elder-border)' }}>
            <Shield className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--l-elder)' }} aria-hidden="true" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--l-elder)' }}>
              After you add lessons and submit for review, the Elder Board will check your course for
              cultural accuracy and appropriateness before it goes live. This usually takes 1–3 days.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} aria-busy={loading} className="btn-learn w-full justify-center">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Saving…' : 'Save Course & Add Lessons'}
          </button>
        </form>
      </main>
    </div>
  )
}
