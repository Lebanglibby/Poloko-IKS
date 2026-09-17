'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { generateEntryHash } from '@/lib/hash'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import type { LicenseType, ListingStatus } from '@/lib/types'
import { Shield, Loader2, CheckCircle2, FlaskConical } from 'lucide-react'

export default function NewResearchPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [status, setStatus] = useState<ListingStatus>('draft')
  const [licenseType, setLicenseType] = useState<LicenseType>('cc_by')
  const [price, setPrice] = useState('0')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isCommercial = licenseType === 'commercial' || licenseType === 'custom'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate SHA-256 hash for the research listing
      const hash = await generateEntryHash({
        title,
        description: abstract,
        submittedBy: 'researcher',
      })
      setGeneratedHash(hash)

      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          status,
          license_type: licenseType,
          price: isCommercial ? parseFloat(price) || 0 : 0,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          sha256_hash: hash,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to publish listing')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push(`/research/${json.data.id}`), 1500)
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Research listing created!</h2>
          <p className="text-sm text-gray-500 mt-1">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="h-5 w-5 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">Publish Research</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Publish your compiled study, product formulation, or technical framework.
          Set your license terms and start tracking usage and attribution.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Anti-inflammatory Properties of Morula Bark Extracts"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Abstract</label>
            <textarea
              rows={6}
              value={abstract}
              onChange={e => setAbstract(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Summarise your research methodology, key findings, and implications for indigenous knowledge application…"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Publication Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ListingStatus)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft (private, not visible yet)</option>
              <option value="published">Published (public)</option>
              <option value="open_for_collaboration">Open for Collaboration</option>
            </select>
          </div>

          {/* License */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">License Type</label>
            <select
              value={licenseType}
              onChange={e => setLicenseType(e.target.value as LicenseType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {!isCommercial
                ? 'Open license — free for reuse under the selected terms'
                : 'Commercial license — set your price below'}
            </p>
          </div>

          {/* Price (commercial only) */}
          {isCommercial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price (BWP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">BWP</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ethnobotany, morula, anti-inflammatory, Kalahari"
            />
          </div>

          {/* Hash display */}
          {generatedHash && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-700" />
                <span className="text-sm font-medium text-blue-800">Proof of Authorship Generated</span>
              </div>
              <p className="text-xs text-blue-700 font-mono break-all">{generatedHash}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Publishing…' : 'Publish Research Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
