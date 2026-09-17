'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { LESSON_TYPE_LABELS } from '@/lib/constants'
import type { LessonContentType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  PlayCircle, Image as ImageIcon, FileText, Plus, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CONTENT_ICONS = {
  video:         PlayCircle,
  image_gallery: ImageIcon,
  text:          FileText,
} as const

const TITLE_MAX   = 120
const DESC_MAX    = 400
const CONTENT_MAX = 5000

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

export default function NewLessonPage() {
  const params   = useParams()
  const courseId = params.courseId as string
  const router   = useRouter()
  const supabase = createClient()

  const [courseTitle,   setCourseTitle]   = useState<string>('')
  const [title,         setTitle]         = useState('')
  const [description,   setDescription]   = useState('')
  const [contentType,   setContentType]   = useState<LessonContentType>('video')
  const [videoUrl,      setVideoUrl]      = useState('')
  const [imageUrls,     setImageUrls]     = useState<string[]>([''])
  const [textContent,   setTextContent]   = useState('')
  const [materials,     setMaterials]     = useState<string[]>([''])
  const [durationMins,  setDurationMins]  = useState('')
  const [sortOrder,     setSortOrder]     = useState(0)
  const [isFreePreview, setIsFreePreview] = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [success,       setSuccess]       = useState(false)
  const [addAnother,    setAddAnother]    = useState(false)

  useEffect(() => {
    supabase.from('courses').select('title').eq('id', courseId).single()
      .then(({ data }) => { if (data) setCourseTitle(data.title) })
    // Get current lesson count for default sort_order
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', courseId)
      .then(({ count }) => setSortOrder(count ?? 0))
  }, [courseId]) // eslint-disable-line react-hooks/exhaustive-deps

  function resetForm() {
    setTitle(''); setDescription(''); setVideoUrl(''); setImageUrls(['']); setTextContent('')
    setMaterials(['']); setDurationMins(''); setIsFreePreview(false)
    setSuccess(false); setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Lesson title is required.'); return }
    if (contentType === 'video' && !videoUrl.trim()) { setError('A video URL is required for video lessons.'); return }
    setLoading(true); setError(null)

    const cleanImages = imageUrls.filter(u => u.trim())
    const cleanMats   = materials.filter(m => m.trim())

    const res = await fetch('/api/lessons', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id:       courseId,
        title:           title.trim(),
        description:     description.trim() || null,
        content_type:    contentType,
        video_url:       contentType === 'video'         ? videoUrl.trim() : null,
        image_urls:      contentType === 'image_gallery' ? cleanImages     : null,
        text_content:    contentType === 'text'          ? textContent     : null,
        materials_list:  cleanMats.length > 0 ? cleanMats : null,
        duration_mins:   durationMins ? parseInt(durationMins, 10) : null,
        sort_order:      sortOrder,
        is_free_preview: isFreePreview,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to save lesson'); setLoading(false); return }

    setSortOrder(s => s + 1)
    setSuccess(true)
    setLoading(false)

    if (addAnother) { resetForm() }
  }

  if (success && !addAnother) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center bg-white rounded-3xl p-10 shadow-sm max-w-sm mx-auto border-2" style={{ borderColor: '#FDE68A' }}>
            <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#FFFBEB', border: '2px solid #FDE68A' }}>
              <CheckCircle2 className="h-10 w-10 text-[#92400E]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008] mb-2">Lesson saved!</h1>
            <p className="text-sm text-[#6B5344] leading-relaxed mb-6">
              Your lesson has been added to <strong>{courseTitle}</strong>.
              Add more lessons or go back to the course editor.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={resetForm} className="btn-learn w-full flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Another Lesson
              </button>
              <Link href={`/create/${courseId}/edit`}
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#FDE68A] hover:text-[#92400E] transition-colors">
                Back to Course Editor
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

        <Link href={`/create/${courseId}/edit`} className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#92400E] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {courseTitle || 'Course'}
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">Add a Lesson</h1>
          {courseTitle && <p className="text-sm text-[#9C8070] mt-0.5">Adding to <strong className="text-[#6B5344]">{courseTitle}</strong></p>}
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Add lesson form" className="space-y-6 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm">

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="l-title" className="text-sm font-bold text-[#1F2937]">Lesson Title *</label>
              <CharCounter current={title.length} max={TITLE_MAX} id="l-title-c" />
            </div>
            <input id="l-title" required value={title} onChange={e => setTitle(e.target.value)} aria-describedby="l-title-c"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] focus:ring-2 focus:ring-[#92400E]/10 transition-colors bg-[#FDFBF7]"
              placeholder="e.g. Preparing the Mokola Palm Fronds" />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="l-desc" className="text-sm font-bold text-[#1F2937]">Description <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <CharCounter current={description.length} max={DESC_MAX} id="l-desc-c" />
            </div>
            <textarea id="l-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} aria-describedby="l-desc-c"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors resize-none bg-[#FDFBF7]"
              placeholder="Brief overview of what this lesson covers…" />
          </div>

          {/* Content type selector */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-3" id="ct-label">Content Type</p>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="ct-label">
              {(Object.entries(LESSON_TYPE_LABELS) as [LessonContentType, string][]).map(([val, lbl]) => {
                const Icon = CONTENT_ICONS[val]
                return (
                  <label key={val} className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center',
                    contentType === val ? 'border-[#92400E] bg-[#FFFBEB] text-[#92400E]' : 'border-[#E8DDD0] bg-white text-[#4B5563] hover:border-[#FDE68A]')}>
                    <input type="radio" name="content_type" value={val} checked={contentType === val} onChange={() => setContentType(val)} className="sr-only" />
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs font-semibold leading-tight">{lbl}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Content fields per type */}
          {contentType === 'video' && (
            <div>
              <label htmlFor="l-video" className="block text-sm font-bold text-[#1F2937] mb-1.5">Video URL *</label>
              <input id="l-video" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                placeholder="https://youtube.com/embed/... or direct video URL" />
              <p className="text-xs text-[#9CA3AF] mt-1">Paste a YouTube embed URL or direct video link.</p>
            </div>
          )}

          {contentType === 'image_gallery' && (
            <div>
              <p className="text-sm font-bold text-[#1F2937] mb-2">Image URLs</p>
              <div className="space-y-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={url} onChange={e => { const n = [...imageUrls]; n[i] = e.target.value; setImageUrls(n) }}
                      className="flex-1 border-2 border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                      placeholder={`Image ${i + 1} URL`} type="url" aria-label={`Image ${i + 1} URL`} />
                    {imageUrls.length > 1 && (
                      <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                        className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors" aria-label={`Remove image ${i + 1}`}>
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setImageUrls([...imageUrls, ''])}
                  className="text-xs font-semibold text-[#92400E] hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" aria-hidden="true" /> Add image URL
                </button>
              </div>
            </div>
          )}

          {contentType === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="l-text" className="text-sm font-bold text-[#1F2937]">Step-by-Step Instructions</label>
                <CharCounter current={textContent.length} max={CONTENT_MAX} id="l-text-c" />
              </div>
              <textarea id="l-text" rows={12} value={textContent} onChange={e => setTextContent(e.target.value)} aria-describedby="l-text-c"
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors resize-none bg-[#FDFBF7] font-mono"
                placeholder="Step 1: Soak the Mokola palm fronds overnight in water&#10;Step 2: Strip the outer fibres from each frond…" />
            </div>
          )}

          {/* Materials */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-2">🧺 Materials &amp; Tools <span className="font-normal text-[#9CA3AF]">(optional)</span></p>
            <div className="space-y-2">
              {materials.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input value={m} onChange={e => { const n = [...materials]; n[i] = e.target.value; setMaterials(n) }}
                    className="flex-1 border-2 border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                    placeholder={`e.g. Mokola palm fronds`} aria-label={`Material ${i + 1}`} />
                  {materials.length > 1 && (
                    <button type="button" onClick={() => setMaterials(materials.filter((_, j) => j !== i))}
                      className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors" aria-label={`Remove material ${i + 1}`}>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setMaterials([...materials, ''])}
                className="text-xs font-semibold text-[#92400E] hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" aria-hidden="true" /> Add material
              </button>
            </div>
          </div>

          {/* Duration + free preview */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="l-dur" className="block text-sm font-bold text-[#1F2937] mb-1.5">Duration (minutes) <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <input id="l-dur" type="number" min="1" value={durationMins} onChange={e => setDurationMins(e.target.value)}
                className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#92400E] transition-colors bg-[#FDFBF7]"
                placeholder="e.g. 15" />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: isFreePreview ? '#92400E' : '#E8DDD0', background: isFreePreview ? '#FFFBEB' : 'white' }}>
                <input type="checkbox" checked={isFreePreview} onChange={e => setIsFreePreview(e.target.checked)}
                  className="mt-0.5 accent-[#92400E] h-4 w-4" aria-describedby="preview-hint" />
                <div>
                  <p className="text-sm font-bold" style={{ color: isFreePreview ? '#92400E' : '#1F2937' }}>Free Preview Lesson</p>
                  <p id="preview-hint" className="text-xs text-[#9CA3AF] mt-0.5 leading-snug">Allow non-enrolled visitors to see this lesson</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button type="submit" disabled={loading} aria-busy={loading} onClick={() => setAddAnother(false)} className="btn-learn flex items-center gap-2">
              {loading && !addAnother && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save Lesson
            </button>
            <button type="submit" disabled={loading} aria-busy={loading} onClick={() => setAddAnother(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-[#FDE68A] text-[#92400E] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-all disabled:opacity-60">
              {loading && addAnother && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <Plus className="h-4 w-4" aria-hidden="true" /> Save &amp; Add Another
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
