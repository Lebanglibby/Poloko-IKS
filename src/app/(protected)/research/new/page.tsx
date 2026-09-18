'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { LicenseSelector } from '@/components/research/LicenseSelector'
import { generateEntryHash } from '@/lib/hash'
import type { LicenseType, ListingStatus, ResearchListing } from '@/lib/types'
import {
  Shield, Loader2, CheckCircle2, FlaskConical,
  ArrowLeft, AlertCircle, Tag, Users, BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/* ─── Publication status options ─────────────────────────────────────────────── */
const STATUS_OPTIONS: {
  value: ListingStatus
  label: string
  desc: string
  icon: typeof BookOpen
  activeBg: string
  activeBorder: string
  activeText: string
}[] = [
  {
    value:        'draft',
    label:        'Save as Draft',
    desc:         'Only you can see this. Come back to publish later.',
    icon:         BookOpen,
    activeBg:     'bg-[#F3F0EB]',
    activeBorder: 'border-[#D4C4B0]',
    activeText:   'text-[#6B5344]',
  },
  {
    value:        'published',
    label:        'Publish Now',
    desc:         'Visible to all users immediately.',
    icon:         FlaskConical,
    activeBg:     'bg-[#F0F7F4]',
    activeBorder: 'border-[#95D5B2]',
    activeText:   'text-[#2D6A4F]',
  },
  {
    value:        'open_for_collaboration',
    label:        'Open for Collaboration',
    desc:         'Published and actively inviting contributors.',
    icon:         Users,
    activeBg:     'bg-[#F0FAFA]',
    activeBorder: 'border-[#7FCFD2]',
    activeText:   'text-[#0D7377]',
  },
]

const TITLE_MAX    = 160
const ABSTRACT_MAX = 2000

/* ─── Char counter ───────────────────────────────────────────────────────────── */
function CharCounter({ current, max, id }: { current: number; max: number; id: string }) {
  const remaining = max - current
  const warn  = remaining < max * 0.15
  const limit = remaining < 0
  return (
    <span
      id={id}
      aria-live="polite"
      aria-label={`${remaining} characters remaining`}
      className={cn(
        'text-xs',
        limit ? 'text-[#B91C1C] font-bold' : warn ? 'text-[#B45309]' : 'text-[#9CA3AF]'
      )}
    >
      {current}/{max}
    </span>
  )
}

export default function NewResearchPage() {
  const router = useRouter()

  const [title,         setTitle]         = useState('')
  const [abstract,      setAbstract]      = useState('')
  const [status,        setStatus]        = useState<ListingStatus>('draft')
  const [licenseType,   setLicenseType]   = useState<LicenseType>('cc_by')
  const [price,         setPrice]         = useState('0')
  const [tags,          setTags]          = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [success,       setSuccess]       = useState(false)
  const [submittedId,   setSubmittedId]   = useState<string | null>(null)

  const isCommercial = licenseType === 'commercial' || licenseType === 'custom'

  function validate(): string | null {
    if (!title.trim())                return 'A title is required.'
    if (title.length > TITLE_MAX)     return `Title must be ${TITLE_MAX} characters or fewer.`
    if (abstract.length > ABSTRACT_MAX) return `Abstract must be ${ABSTRACT_MAX} characters or fewer.`
    if (isCommercial && parseFloat(price) < 0) return 'Price cannot be negative.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    setError(null)

    try {
      const hash = await generateEntryHash({ title, description: abstract, submittedBy: 'researcher' })
      setGeneratedHash(hash)

      // Optimistic listing — stored in localStorage for instant display on /research
      const optimisticListing: ResearchListing = {
        id:                `optimistic-${Date.now()}`,
        title,
        abstract,
        full_document_url: null,
        status,
        license_type:      licenseType,
        license_terms:     null,
        price:             isCommercial ? parseFloat(price) || 0 : 0,
        author_id:         'demo-user-0001',
        sha256_hash:       hash,
        view_count:        0,
        download_count:    0,
        tags:              tags.split(',').map(t => t.trim()).filter(Boolean),
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString(),
        profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
        collaborators:     [],
      }
      try {
        localStorage.setItem('poloko_pending_listing', JSON.stringify(optimisticListing))
      } catch { /* storage unavailable — no-op */ }

      const res = await fetch('/api/research', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          status,
          license_type: licenseType,
          price:        isCommercial ? parseFloat(price) || 0 : 0,
          tags:         tags.split(',').map(t => t.trim()).filter(Boolean),
          sha256_hash:  hash,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to publish'); setLoading(false); return }
      setSubmittedId(json.data?.id ?? null)
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  /* ── Success screen ──────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className="text-center bg-white rounded-3xl p-10 shadow-sm max-w-sm mx-auto border-2"
            style={{ borderColor: '#95D5B2' }}
          >
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: '#F0F7F4', border: '2px solid #95D5B2' }}
            >
              <CheckCircle2 className="h-10 w-10 text-[#2D6A4F]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008] mb-1">Research listing created!</h1>
            <p className="text-xs text-[#9C8070] mb-4 italic" lang="tn">
              &ldquo;Patlisiso e Bopilwe&rdquo; — Your research has been recorded
            </p>

            {generatedHash && (
              <div
                className="rounded-xl p-3 mb-5 text-left"
                style={{ background: '#F0F7F4', border: '1px solid #95D5B2' }}
              >
                <p className="text-xs font-semibold text-[#2D6A4F] mb-1 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  Authorship identifier
                </p>
                <p className="font-mono text-[10px] text-[#40916C] break-all select-all leading-relaxed">
                  {generatedHash}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <a
                href="/research"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: 'var(--r-primary)' }}
              >
                See My Listing in Research Hub →
              </a>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#95D5B2] hover:text-[#2D6A4F] transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => { setSuccess(false); setGeneratedHash(null); setSubmittedId(null); setTitle(''); setAbstract(''); setTags('') }}
                className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition-colors py-1"
              >
                Publish another listing
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Form ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#2D6A4F] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Research Hub
        </Link>

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ background: 'linear-gradient(135deg, #F0F7F4, #E8F5EE)', borderColor: '#95D5B2' }}
              aria-hidden="true"
            >
              <FlaskConical className="h-6 w-6 text-[#2D6A4F]" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">Publish Research</h1>
              <p className="text-xs text-[#9C8070] font-semibold mt-0.5" lang="tn">
                Bopa Patlisiso — Share your study
              </p>
            </div>
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Publish your compiled study, formulation, or technical framework. Set your license
            terms and start tracking usage and attribution automatically. Every listing receives
            a tamper-proof authorship record.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Publish research listing form"
          aria-describedby={error ? 'publish-error' : undefined}
          className="space-y-6 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm"
        >

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="title" className="text-sm font-bold text-[#1F2937]">
                Title <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <CharCounter current={title.length} max={TITLE_MAX} id="title-counter" />
            </div>
            <input
              id="title"
              required
              maxLength={TITLE_MAX + 20}
              value={title}
              onChange={e => setTitle(e.target.value)}
              aria-required="true"
              aria-describedby="title-counter"
              className={cn(
                'w-full border-2 rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition-colors bg-[#FDFBF7]',
                title.length > TITLE_MAX
                  ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                  : 'border-[#E8DDD0] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10'
              )}
              placeholder="e.g. Anti-inflammatory Properties of Morula Bark Extracts"
            />
          </div>

          {/* Abstract */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="abstract" className="text-sm font-bold text-[#1F2937]">Abstract</label>
              <CharCounter current={abstract.length} max={ABSTRACT_MAX} id="abstract-counter" />
            </div>
            <p id="abstract-hint" className="text-xs text-[#9CA3AF] mb-2">
              Summarise your methodology, key findings, and implications.
            </p>
            <textarea
              id="abstract"
              rows={6}
              value={abstract}
              onChange={e => setAbstract(e.target.value)}
              aria-describedby="abstract-hint abstract-counter"
              className={cn(
                'w-full border-2 rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition-colors resize-none bg-[#FDFBF7]',
                abstract.length > ABSTRACT_MAX
                  ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                  : 'border-[#E8DDD0] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10'
              )}
              placeholder="Summarise your research methodology, key findings, and implications…"
            />
          </div>

          {/* Publication status */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-1" id="status-label">
              Publication Status
            </p>
            <p className="text-xs text-[#9CA3AF] mb-3">
              You can change this at any time after publishing.
            </p>
            <div className="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="status-label">
              {STATUS_OPTIONS.map(opt => {
                const Icon   = opt.icon
                const active = status === opt.value
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      active
                        ? `${opt.activeBg} ${opt.activeBorder}`
                        : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={active}
                      onChange={() => setStatus(opt.value)}
                      className="sr-only"
                    />
                    <Icon className={cn('h-4 w-4', active ? opt.activeText : 'text-[#9CA3AF]')} aria-hidden="true" />
                    <p className={cn('text-sm font-bold', active ? opt.activeText : 'text-[#1F2937]')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-[#9CA3AF] leading-snug">{opt.desc}</p>
                  </label>
                )
              })}
            </div>
          </div>

          {/* License — full LicenseSelector component */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-1" id="license-label">
              License Type
            </p>
            <p className="text-xs text-[#9CA3AF] mb-3">
              Choose how others may use your research. You can update this after publishing.
            </p>
            <LicenseSelector
              value={licenseType}
              onChange={setLicenseType}
              aria-labelledby="license-label"
            />
          </div>

          {/* Price — only for commercial/custom */}
          {isCommercial && (
            <div>
              <label htmlFor="price" className="block text-sm font-bold text-[#1F2937] mb-1.5">
                Price (BWP)
              </label>
              <p className="text-xs text-[#9CA3AF] mb-2">
                Set your access price in Botswana Pula. Enter 0 for free access.
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9CA3AF]">BWP</span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl pl-14 pr-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-colors bg-[#FDFBF7]"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Keywords */}
          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              <Tag className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
              Keywords
              <span className="font-normal text-[#9CA3AF] ml-1">(comma-separated)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-colors bg-[#FDFBF7]"
              placeholder="ethnobotany, morula, anti-inflammatory"
            />
          </div>

          {/* Hash preview */}
          {generatedHash && (
            <div
              className="rounded-2xl p-4"
              role="status"
              aria-label="Authorship record created"
              style={{ background: '#F0F7F4', border: '1px solid #95D5B2' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#2D6A4F]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#2D6A4F]">Authorship record created</span>
              </div>
              <p className="text-xs font-mono text-[#40916C] break-all select-all">{generatedHash}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              id="publish-error"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || title.length > TITLE_MAX || abstract.length > ABSTRACT_MAX}
            aria-busy={loading}
            className="w-full text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm"
            style={{ background: 'var(--r-primary)' }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Publishing…' : 'Publish Research Listing'}
          </button>

          <p className="text-xs text-center text-[#9CA3AF]">
            By publishing, you confirm you hold or have licensed the rights to this content.
          </p>
        </form>
      </main>
    </div>
  )
}
