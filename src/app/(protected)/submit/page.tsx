'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { generateEntryHash } from '@/lib/hash'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'
import { Shield, MapPin, Tag, Loader2, CheckCircle2, Globe, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const ACCESS_OPTIONS: { value: AccessTier; label: string; desc: string; colour: string }[] = [
  { value: 'public',     label: 'Public',     desc: 'Visible to everyone — no account needed.',           colour: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'  },
  { value: 'restricted', label: 'Restricted', desc: 'Verified researchers may request access.',           colour: 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'  },
  { value: 'sacred',     label: 'Sacred',     desc: 'Elder Board approval required before anyone views.', colour: 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'  },
]

export default function SubmitPage() {
  const router = useRouter()
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [category,     setCategory]     = useState<KnowledgeCategory>('traditional_practice')
  const [accessTier,   setAccessTier]   = useState<AccessTier>('public')
  const [language,     setLanguage]     = useState<'en' | 'tn'>('en')
  const [tags,         setTags]         = useState('')
  const [latitude,     setLatitude]     = useState('')
  const [longitude,    setLongitude]    = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    try {
      const hash = await generateEntryHash({ title, description, submittedBy: 'user' })
      setGeneratedHash(hash)

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, category,
          access_tier: accessTier,
          language,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          latitude:    latitude  ? parseFloat(latitude)  : null,
          longitude:   longitude ? parseFloat(longitude) : null,
          sha256_hash: hash,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to submit entry'); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push(`/vault/${json.data.id}`), 1500)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center bg-white border border-[#E8DDD0] rounded-2xl p-12 shadow-sm max-w-sm mx-4">
          <div className="h-16 w-16 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#15803D]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-[#1F2937] mb-2">Entry submitted!</h2>
          <p className="text-sm text-[#9CA3AF]">Taking you to your entry now…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#9A3412] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
        </Link>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Share Knowledge with the Archive</h1>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Share traditional knowledge, plant properties, cultural stories, or conservation
            practices. Every entry receives a unique tamper-proof record identifier to protect your submission.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm">

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
              placeholder="e.g. Mophane Worm Harvesting Practices"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-[#1F2937] mb-1.5">Description</label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors resize-none"
              placeholder="Describe this knowledge, its context, traditional use, and cultural significance…"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-[#1F2937] mb-1.5">Category</label>
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
          </div>

          {/* Access level */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-2">Who can see this entry?</p>
            <div className="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Access level">
              {ACCESS_OPTIONS.map(opt => {
                const Icon = opt.value === 'public' ? Globe : opt.value === 'restricted' ? Lock : Shield
                const active = accessTier === opt.value
                return (
                  <label key={opt.value}
                    className={`flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      active ? opt.colour : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                    }`}>
                    <input
                      type="radio"
                      name="access_tier"
                      value={opt.value}
                      checked={active}
                      onChange={() => setAccessTier(opt.value)}
                      className="sr-only"
                    />
                    <Icon className={`h-4 w-4 ${active ? opt.colour.split(' ')[2] : 'text-[#9CA3AF]'}`} aria-hidden="true" />
                    <p className={`text-sm font-bold ${active ? opt.colour.split(' ')[2] : 'text-[#1F2937]'}`}>{opt.label}</p>
                    <p className="text-xs text-[#9CA3AF] leading-snug">{opt.desc}</p>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-bold text-[#1F2937] mb-1.5">Language</label>
            <select
              id="language"
              value={language}
              onChange={e => setLanguage(e.target.value as 'en' | 'tn')}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#9A3412] transition-colors"
            >
              <option value="en">English</option>
              <option value="tn">Setswana</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              <Tag className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
              Keywords <span className="font-normal text-[#9CA3AF]">(comma-separated)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
              placeholder="medicinal, Okavango, dry-season, bark"
            />
          </div>

          {/* Location */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-1.5">
              <MapPin className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
              Location <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lat" className="sr-only">Latitude</label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
                  placeholder="Latitude (e.g. -20.12)"
                />
              </div>
              <div>
                <label htmlFor="lng" className="sr-only">Longitude</label>
                <input
                  id="lng"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
                  placeholder="Longitude (e.g. 23.45)"
                />
              </div>
            </div>
            {accessTier !== 'public' && (
              <p className="text-xs text-[#B45309] mt-1.5 flex items-center gap-1">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Exact coordinates will be protected based on your access level setting.
              </p>
            )}
          </div>

          {/* Hash preview */}
          {generatedHash && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#14532D]">Record protected — unique identifier created</span>
              </div>
              <p className="text-xs text-[#15803D] font-mono break-all">{generatedHash}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Creating record & submitting…' : 'Submit to the Archive'}
          </button>
        </form>
      </div>
    </div>
  )
}
