'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { generateEntryHash } from '@/lib/hash'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import type { LicenseType, ListingStatus } from '@/lib/types'
import { Shield, Loader2, CheckCircle2, FlaskConical, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS: { value: ListingStatus; label: string; desc: string }[] = [
  { value: 'draft',                   label: 'Save as Draft',              desc: 'Only you can see this — not yet published.'        },
  { value: 'published',               label: 'Publish',                    desc: 'Visible to all users immediately.'                 },
  { value: 'open_for_collaboration',  label: 'Open for Collaboration',     desc: 'Published and accepting contributors.'             },
]

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

  const isCommercial = licenseType === 'commercial' || licenseType === 'custom'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const hash = await generateEntryHash({ title, description: abstract, submittedBy: 'researcher' })
      setGeneratedHash(hash)

      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, abstract, status,
          license_type: licenseType,
          price: isCommercial ? parseFloat(price) || 0 : 0,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          sha256_hash: hash,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to publish'); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push(`/research/${json.data.id}`), 1500)
    } catch {
      setError('An unexpected error occurred.')
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
          <h2 className="text-xl font-bold text-[#1F2937] mb-2">Research listing created!</h2>
          <p className="text-sm text-[#9CA3AF]">Taking you to your listing now…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/research" className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#9A3412] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Research Hub
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[#FEF2E8] border border-[#FDBA74] flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Publish Research</h1>
            <p className="text-sm text-[#9CA3AF]">Share your study with the Poloko IKS community</p>
          </div>
        </div>
        <p className="text-sm text-[#4B5563] mb-7 leading-relaxed">
          Publish your compiled study, formulation, or technical framework. Set your license terms
          and start tracking usage and attribution automatically.
        </p>

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
              placeholder="e.g. Anti-inflammatory Properties of Morula Bark Extracts"
            />
          </div>

          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-bold text-[#1F2937] mb-1.5">Abstract</label>
            <textarea
              id="abstract"
              rows={6}
              value={abstract}
              onChange={e => setAbstract(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors resize-none"
              placeholder="Summarise your research methodology, key findings, and implications…"
            />
          </div>

          {/* Publication status */}
          <div>
            <p className="text-sm font-bold text-[#1F2937] mb-2">Publication Status</p>
            <div className="grid sm:grid-cols-3 gap-3" role="radiogroup">
              {STATUS_OPTIONS.map(opt => {
                const active = status === opt.value
                return (
                  <label key={opt.value}
                    className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      active ? 'border-[#9A3412] bg-[#FEF9F0]' : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0]'
                    }`}>
                    <input type="radio" name="status" value={opt.value} checked={active}
                      onChange={() => setStatus(opt.value)} className="sr-only" />
                    <p className={`text-sm font-bold ${active ? 'text-[#9A3412]' : 'text-[#1F2937]'}`}>{opt.label}</p>
                    <p className="text-xs text-[#9CA3AF] leading-snug">{opt.desc}</p>
                  </label>
                )
              })}
            </div>
          </div>

          {/* License */}
          <div>
            <label htmlFor="license" className="block text-sm font-bold text-[#1F2937] mb-1.5">License Type</label>
            <select
              id="license"
              value={licenseType}
              onChange={e => setLicenseType(e.target.value as LicenseType)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] bg-white focus:outline-none focus:border-[#9A3412] transition-colors"
            >
              {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-[#9CA3AF] mt-1.5">
              {isCommercial ? 'Commercial — set your access price below.' : 'Open license — free for reuse under the selected terms.'}
            </p>
          </div>

          {/* Price */}
          {isCommercial && (
            <div>
              <label htmlFor="price" className="block text-sm font-bold text-[#1F2937] mb-1.5">Price (BWP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9CA3AF]">BWP</span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border-2 border-[#E8DDD0] rounded-xl pl-14 pr-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              Keywords <span className="font-normal text-[#9CA3AF]">(comma-separated)</span>
            </label>
            <input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors"
              placeholder="ethnobotany, morula, anti-inflammatory"
            />
          </div>

          {/* Hash preview */}
          {generatedHash && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#14532D]">Authorship record created</span>
              </div>
              <p className="text-xs text-[#15803D] font-mono break-all">{generatedHash}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Publishing…' : 'Publish Research Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
