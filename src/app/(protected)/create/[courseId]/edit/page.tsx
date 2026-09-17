'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import {
  COURSE_CATEGORY_LABELS, COURSE_CATEGORY_EMOJI,
  SKILL_LEVEL_LABELS, COURSE_STATUS_LABELS, COURSE_STATUS_STYLES,
} from '@/lib/constants'
import type { CourseCategory, SkillLevel, CourseStatus } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, Shield, Send, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EditCoursePage() {
  const params   = useParams()
  const courseId = params.courseId as string
  const router   = useRouter()
  const supabase = createClient()

  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  const [title,       setTitle]       = useState('')
  const [subtitle,    setSubtitle]    = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState<CourseCategory>('traditional_crafts')
  const [skillLevel,  setSkillLevel]  = useState<SkillLevel>('beginner')
  const [language,    setLanguage]    = useState<'en' | 'tn'>('en')
  const [priceBwp,    setPriceBwp]    = useState('0')
  const [coverUrl,    setCoverUrl]    = useState('')
  const [previewUrl,  setPreviewUrl]  = useState('')
  const [status,      setStatus]      = useState<CourseStatus>('draft')
  const [rejectionNote, setRejectionNote] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('courses').select('*').eq('id', courseId).single()
      .then(({ data }) => {
        if (!data) { router.push('/create'); return }
        setTitle(data.title ?? '')
        setSubtitle(data.subtitle ?? '')
        setDescription(data.description ?? '')
        setCategory(data.category)
        setSkillLevel(data.skill_level)
        setLanguage(data.language)
        setPriceBwp(String(data.price_bwp ?? 0))
        setCoverUrl(data.cover_image_url ?? '')
        setPreviewUrl(data.preview_video_url ?? '')
        setStatus(data.status)
        setRejectionNote(data.rejection_note ?? null)
        setLoading(false)
      })
  }, [courseId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    const res = await fetch('/api/courses', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id:         courseId,
        title:             title.trim(),
        subtitle:          subtitle.trim()    || null,
        description:       description.trim() || null,
        category, skill_level: skillLevel, language,
        price_bwp:         parseFloat(priceBwp) || 0,
        cover_image_url:   coverUrl.trim()    || null,
        preview_video_url: previewUrl.trim()  || null,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Save failed'); setSaving(false); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  async function handleSubmitForReview() {
    setSubmitting(true); setError(null)
    const res = await fetch('/api/courses', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, status: 'pending_review' }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Submission failed'); setSubmitting(false); return }
    setStatus('pending_review')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#92400E]" />
      </div>
    )
  }

  const statusStyle = COURSE_STATUS_STYLES[status]
  const canSubmit   = status === 'draft' || status === 'rejected'

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <Link href="/create" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#92400E] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to My Courses
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderColor: '#FDE68A' }} aria-hidden="true">
              <GraduationCap className="h-6 w-6 text-[#92400E]" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-[#1A1008]">Edit Course</h1>
              <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border mt-1"
                style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                {COURSE_STATUS_LABELS[status]}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {status === 'approved' && (
              <Link href={`/learn/${courseId}`} target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] transition-all">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View Live
              </Link>
            )}
            <Link href={`/create/${courseId}/lessons/new`}
              className="btn-learn inline-flex items-center gap-1.5 text-xs" style={{ padding: '8px 14px', fontSize: 12 }}>
              + Add Lesson
            </Link>
          </div>
        </div>

        {/* Rejection feedback */}
        {status === 'rejected' && rejectionNote && (
          <div className="rounded-2xl border-2 p-4 mb-6" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <p className="text-sm font-bold text-[#B91C1C] mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" aria-hidden="true" /> Elder Board Feedback
            </p>
            <p className="text-sm text-[#991B1B] leading-relaxed">{rejectionNote}</p>
            <p className="text-xs text-[#9CA3AF] mt-2">Make the requested changes and resubmit for review.</p>
          </div>
        )}

        <form onSubmit={handleSave} noValidate className="space-y-5 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm">
          {/* Title */}
          <div>
            <label htmlFor="e-title" className="block text-sm font-bold text-[#1F2937] mb-1.5">Title *</label>
            <input id="e-title" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]" />
          </div>

          {/* Subtitle */}
          <div>
            <label htmlFor="e-subtitle" className="block text-sm font-bold text-[#1F2937] mb-1.5">Subtitle <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
            <input id="e-subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="e-desc" className="block text-sm font-bold text-[#1F2937] mb-1.5">Description</label>
            <textarea id="e-desc" rows={5} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors resize-none bg-[#FDFBF7]" />
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-2" id="e-cat-label">Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-labelledby="e-cat-label">
              {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(([val, label]) => (
                <label key={val} className={cn('flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium',
                  category === val ? 'border-[#92400E] bg-[#FFFBEB] text-[#92400E]' : 'border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#FDE68A]')}>
                  <input type="radio" name="e-category" value={val} checked={category === val} onChange={() => setCategory(val)} className="sr-only" />
                  <span aria-hidden="true">{COURSE_CATEGORY_EMOJI[val]}</span>{label}
                </label>
              ))}
            </div>
          </div>

          {/* Skill + language */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="e-skill" className="block text-sm font-bold text-[#1F2937] mb-1.5">Skill Level</label>
              <select id="e-skill" value={skillLevel} onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#92400E] transition-colors">
                {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="e-lang" className="block text-sm font-bold text-[#1F2937] mb-1.5">Language</label>
              <select id="e-lang" value={language} onChange={e => setLanguage(e.target.value as 'en' | 'tn')}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#92400E] transition-colors">
                <option value="en">English</option>
                <option value="tn">Setswana</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="e-price" className="block text-sm font-bold text-[#1F2937] mb-1.5">Price (BWP)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9CA3AF]">BWP</span>
              <input id="e-price" type="number" min="0" step="0.01" value={priceBwp} onChange={e => setPriceBwp(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl pl-14 pr-4 py-3 text-sm text-[#1F2937] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]" />
            </div>
          </div>

          {/* URLs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="e-cover" className="block text-sm font-bold text-[#1F2937] mb-1.5">Cover Image URL</label>
              <input id="e-cover" type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                placeholder="https://..." />
            </div>
            <div>
              <label htmlFor="e-preview" className="block text-sm font-bold text-[#1F2937] mb-1.5">Preview Video URL</label>
              <input id="e-preview" type="url" value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                placeholder="https://youtube.com/embed/..." />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button type="submit" disabled={saving} aria-busy={saving}
              className={cn('flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-sm btn-learn')}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Saving…</> : saved ? <><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Saved!</> : 'Save Changes'}
            </button>

            {canSubmit && (
              <button type="button" onClick={handleSubmitForReview} disabled={submitting} aria-busy={submitting}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-[#14532D] text-[#14532D] bg-[#DCFCE7] hover:bg-[#BBF7D0] transition-all disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {submitting ? 'Submitting…' : 'Submit for Elder Review'}
              </button>
            )}
          </div>

          {status === 'pending_review' && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: 'var(--l-elder-bg)', border: '1px solid var(--l-elder-border)' }}>
              <Shield className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--l-elder)' }} aria-hidden="true" />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--l-elder)' }}>
                This course is currently under Elder Board review. You will be notified of their decision.
              </p>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
