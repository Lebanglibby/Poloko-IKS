'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { generateEntryHash } from '@/lib/hash'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'
import {
  Shield, MapPin, Tag, Loader2, CheckCircle2,
  Globe, Lock, ArrowLeft, AlertCircle, Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/* ─── Access level options ───────────────────────────────────────────────────── */
const ACCESS_OPTIONS: {
  value: AccessTier
  label: string
  desc: string
  icon: typeof Globe
  activeBg: string
  activeBorder: string
  activeText: string
}[] = [
  {
    value:        'public',
    label:        'Public',
    desc:         'Visible to everyone. No account needed to read.',
    icon:         Globe,
    activeBg:     'bg-[#F0FDF4]',
    activeBorder: 'border-[#BBF7D0]',
    activeText:   'text-[#15803D]',
  },
  {
    value:        'restricted',
    label:        'Restricted',
    desc:         'Verified researchers may apply for access.',
    icon:         Lock,
    activeBg:     'bg-[#FFFBEB]',
    activeBorder: 'border-[#FDE68A]',
    activeText:   'text-[#B45309]',
  },
  {
    value:        'sacred',
    label:        'Sacred',
    desc:         'Elder Board approval required before anyone may view.',
    icon:         Shield,
    activeBg:     'bg-[#FEF2F2]',
    activeBorder: 'border-[#FECACA]',
    activeText:   'text-[#B91C1C]',
  },
]

/* ─── Character counter ──────────────────────────────────────────────────────── */
function CharCounter({
  current, max, id,
}: { current: number; max: number; id: string }) {
  const remaining = max - current
  const warn = remaining < max * 0.15
  const limit = remaining < 0
  return (
    <span
      id={id}
      aria-live="polite"
      aria-label={`${remaining} characters remaining`}
      className={cn(
        'text-xs ml-auto',
        limit ? 'char-counter-limit font-bold' :
        warn  ? 'char-counter-warn' :
        'text-[#9CA3AF]'
      )}
    >
      {current}/{max}
    </span>
  )
}

/* ─── Field wrapper with label + optional counter ────────────────────────────── */
function Field({
  label, htmlFor, required, hint, children, counter,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  counter?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-bold text-[#1F2937]">
          {label}
          {required && (
            <span className="text-[#B91C1C] ml-1" aria-hidden="true">*</span>
          )}
        </label>
        {counter}
      </div>
      {hint && (
        <p id={`${htmlFor}-hint`} className="text-xs text-[#9CA3AF] mb-2 leading-relaxed">
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

const TITLE_MAX       = 120
const DESCRIPTION_MAX = 1200
const TAGS_MAX        = 200

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function SubmitPage() {
  const router = useRouter()

  const [title,         setTitle]         = useState('')
  const [description,   setDescription]   = useState('')
  const [category,      setCategory]      = useState<KnowledgeCategory>('traditional_practice')
  const [accessTier,    setAccessTier]    = useState<AccessTier>('public')
  const [language,      setLanguage]      = useState<'en' | 'tn'>('en')
  const [tags,          setTags]          = useState('')
  const [latitude,      setLatitude]      = useState('')
  const [longitude,     setLongitude]     = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [success,       setSuccess]       = useState(false)
  const [submittedId,   setSubmittedId]   = useState<string | null>(null)

  /* ── Client-side validation ──────────────────────────────────────── */
  function validate(): string | null {
    if (!title.trim())               return 'A title is required.'
    if (title.length > TITLE_MAX)    return `Title must be ${TITLE_MAX} characters or fewer.`
    if (description.length > DESCRIPTION_MAX) return `Description must be ${DESCRIPTION_MAX} characters or fewer.`
    if (latitude && (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90))
      return 'Latitude must be a valid number between −90 and 90.'
    if (longitude && (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180))
      return 'Longitude must be a valid number between −180 and 180.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    setError(null)

    try {
      const hash = await generateEntryHash({ title, description, submittedBy: 'user' })
      setGeneratedHash(hash)

      const res  = await fetch('/api/knowledge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          access_tier: accessTier,
          language,
          tags:      tags.split(',').map(t => t.trim()).filter(Boolean),
          latitude:  latitude  ? parseFloat(latitude)  : null,
          longitude: longitude ? parseFloat(longitude) : null,
          sha256_hash: hash,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Submission failed. Please try again.')
        setLoading(false)
        return
      }
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
          <div className="text-center bg-white border-2 border-[#BBF7D0] rounded-3xl p-10 shadow-sm max-w-sm mx-auto">
            {/* Animated success icon */}
            <div className="h-20 w-20 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-[#15803D]" aria-hidden="true" />
            </div>

            <h1 className="font-display text-2xl text-[#1A1008] mb-2">
              Ke a leboga!
            </h1>
            <p className="text-xs text-[#9C8070] mb-4 italic" lang="tn">
              &ldquo;Thank you&rdquo; in Setswana
            </p>
            <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
              Your knowledge has been submitted and given a unique tamper-proof record identifier.
              It will be visible in the archive once verified by community members.
            </p>

            {/* Hash preview on success */}
            {generatedHash && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 mb-6 text-left">
                <p className="text-xs font-semibold text-[#14532D] mb-1 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  Your record identifier
                </p>
                <p
                  className="font-mono text-[10px] text-[#15803D] break-all select-all leading-relaxed"
                  aria-label="SHA-256 record identifier"
                >
                  {generatedHash}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {submittedId && (
                <a
                  href={`/vault/${submittedId}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm"
                >
                  View My Entry
                </a>
              )}
              <Link
                href="/vault"
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] transition-colors"
              >
                Browse the Archive
              </Link>
              <button
                onClick={() => {
                  setSuccess(false); setGeneratedHash(null); setSubmittedId(null)
                  setTitle(''); setDescription(''); setTags(''); setLatitude(''); setLongitude('')
                }}
                className="text-xs text-[#9CA3AF] hover:text-[#4B5563] transition-colors py-1"
              >
                Submit another entry
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
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#9A3412] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        {/* Page heading */}
        <div className="mb-7">
          <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] mb-1">
            Share Knowledge with the Archive
          </h1>
          <p className="text-xs text-[#9C8070] font-semibold mb-3" lang="tn">
            Tlhagisa Kitso — Contribute to the living heritage
          </p>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Every entry receives a unique SHA-256 tamper-proof record identifier at submission —
            protecting your community&apos;s knowledge against biopiracy and unauthorised use.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Submit knowledge entry form"
          aria-describedby={error ? 'submit-error' : undefined}
          className="space-y-6 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm"
        >

          {/* ── Title ─────────────────────────────────────────────── */}
          <Field
            label="Title"
            htmlFor="title"
            required
            hint="A clear, descriptive name for this piece of knowledge."
            counter={
              <CharCounter
                current={title.length}
                max={TITLE_MAX}
                id="title-counter"
              />
            }
          >
            <input
              id="title"
              type="text"
              required
              maxLength={TITLE_MAX + 20}
              value={title}
              onChange={e => setTitle(e.target.value)}
              aria-describedby="title-hint title-counter"
              aria-required="true"
              className={cn(
                'w-full border-2 rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF]',
                'focus:outline-none transition-colors bg-[#FDFBF7]',
                title.length > TITLE_MAX
                  ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                  : 'border-[#E8DDD0] focus:border-[#9A3412]'
              )}
              placeholder="e.g. Mophane Worm Harvesting Practices"
            />
          </Field>

          {/* ── Description ───────────────────────────────────────── */}
          <Field
            label="Description"
            htmlFor="description"
            hint="Describe this knowledge, its cultural context, traditional use, and significance."
            counter={
              <CharCounter
                current={description.length}
                max={DESCRIPTION_MAX}
                id="desc-counter"
              />
            }
          >
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-describedby="description-hint desc-counter"
              className={cn(
                'w-full border-2 rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF]',
                'focus:outline-none transition-colors resize-none bg-[#FDFBF7]',
                description.length > DESCRIPTION_MAX
                  ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                  : 'border-[#E8DDD0] focus:border-[#9A3412]'
              )}
              placeholder="Describe this knowledge, its context, traditional use, and cultural significance…"
            />
          </Field>

          {/* ── Category ──────────────────────────────────────────── */}
          <Field label="Category" htmlFor="category">
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value as KnowledgeCategory)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#9A3412] transition-colors"
            >
              {(Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [KnowledgeCategory, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>

          {/* ── Access level ──────────────────────────────────────── */}
          <div>
            <p
              className="text-sm font-bold text-[#1F2937] mb-1"
              id="access-level-label"
            >
              Who can see this entry?
            </p>
            <p className="text-xs text-[#9CA3AF] mb-3">
              Your community decides. You can request a change later through an Elder.
            </p>
            <div
              className="grid sm:grid-cols-3 gap-3"
              role="radiogroup"
              aria-labelledby="access-level-label"
            >
              {ACCESS_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = accessTier === opt.value
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      active
                        ? `${opt.activeBg} ${opt.activeBorder}`
                        : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                    )}
                  >
                    <input
                      type="radio"
                      name="access_tier"
                      value={opt.value}
                      checked={active}
                      onChange={() => setAccessTier(opt.value)}
                      className="sr-only"
                    />
                    <Icon
                      className={cn('h-4 w-4', active ? opt.activeText : 'text-[#9CA3AF]')}
                      aria-hidden="true"
                    />
                    <p className={cn('text-sm font-bold', active ? opt.activeText : 'text-[#1F2937]')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-[#9CA3AF] leading-snug">{opt.desc}</p>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ── Language ──────────────────────────────────────────── */}
          <Field
            label="Language of this entry"
            htmlFor="language"
            hint="Select the primary language in which this knowledge is recorded."
          >
            <select
              id="language"
              value={language}
              onChange={e => setLanguage(e.target.value as 'en' | 'tn')}
              aria-describedby="language-hint"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#9A3412] transition-colors"
            >
              <option value="en">English</option>
              <option value="tn">Setswana</option>
            </select>
          </Field>

          {/* ── Keywords ──────────────────────────────────────────── */}
          <Field
            label="Keywords"
            htmlFor="tags"
            hint="Comma-separated keywords that help others discover this entry."
            counter={
              <CharCounter current={tags.length} max={TAGS_MAX} id="tags-counter" />
            }
          >
            <div className="relative">
              <Tag
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]"
                aria-hidden="true"
              />
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                aria-describedby="tags-hint tags-counter"
                className="w-full pl-10 pr-4 border-2 border-[#E8DDD0] rounded-xl py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                placeholder="medicinal, Okavango, dry-season, bark"
              />
            </div>
          </Field>

          {/* ── Location ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
              <p className="text-sm font-bold text-[#1F2937]" id="location-label">
                Location
                <span className="font-normal text-[#9CA3AF] ml-1">(optional)</span>
              </p>
            </div>
            <p id="location-hint" className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">
              Geo-tag this entry so it appears on the resource map. Botswana latitudes are
              typically −18 to −27, longitudes 20 to 30.
              {accessTier !== 'public' && (
                <span className="text-[#B45309] font-medium">
                  {' '}Exact coordinates will be protected based on the access level you selected above.
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3" aria-labelledby="location-label location-hint">
              <div>
                <label htmlFor="lat" className="block text-xs font-semibold text-[#6B5344] mb-1">
                  Latitude
                </label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                  placeholder="-22.33"
                  aria-label="Latitude (decimal degrees, e.g. -22.33 for Gaborone)"
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-xs font-semibold text-[#6B5344] mb-1">
                  Longitude
                </label>
                <input
                  id="lng"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors bg-[#FDFBF7]"
                  placeholder="25.91"
                  aria-label="Longitude (decimal degrees, e.g. 25.91 for Gaborone)"
                />
              </div>
            </div>
          </div>

          {/* ── Media upload hint ─────────────────────────────────── */}
          <div className="rounded-xl border-2 border-dashed border-[#E8DDD0] bg-[#FDFBF7] p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ImageIcon className="h-5 w-5 text-[#D4C4B0]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#9CA3AF]">Photos &amp; Media</p>
            </div>
            <p className="text-xs text-[#B8A898] leading-relaxed max-w-xs mx-auto">
              Photo attachments can be added after submission from your entry&apos;s detail page.
              Supported formats: JPG, PNG, WEBP.
            </p>
          </div>

          {/* ── Hash preview ──────────────────────────────────────── */}
          {generatedHash && (
            <div
              className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4"
              role="status"
              aria-label="Tamper-proof record identifier generated"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#14532D]">
                  Record protected — unique identifier created
                </span>
              </div>
              <p className="text-xs text-[#15803D] font-mono break-all select-all">
                {generatedHash}
              </p>
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && (
            <div
              id="submit-error"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Submit ────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading || title.length > TITLE_MAX || description.length > DESCRIPTION_MAX}
            aria-busy={loading}
            className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Creating record & submitting…' : 'Submit to the Archive'}
          </button>

          <p className="text-xs text-center text-[#9CA3AF]">
            By submitting, you confirm this knowledge may be shared per the access level you selected above.
          </p>
        </form>
      </main>
    </div>
  )
}
