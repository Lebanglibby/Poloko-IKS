'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { generateEntryHash } from '@/lib/hash'
import { KNOWLEDGE_CATEGORY_LABELS, ACCESS_TIER_LABELS } from '@/lib/constants'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'
import { Shield, MapPin, Tag, Loader2, CheckCircle2 } from 'lucide-react'

export default function SubmitPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<KnowledgeCategory>('traditional_practice')
  const [accessTier, setAccessTier] = useState<AccessTier>('public')
  const [language, setLanguage] = useState<'en' | 'tn'>('en')
  const [tags, setTags] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedHash, setGeneratedHash] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Step 1: Generate SHA-256 hash (Biopiracy Shield)
      const hash = await generateEntryHash({
        title,
        description,
        submittedBy: 'user', // actual user ID appended server-side
      })
      setGeneratedHash(hash)

      // Step 2: Submit to API
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          access_tier: accessTier,
          language,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          sha256_hash: hash,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to submit entry')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push(`/vault/${json.data.id}`), 1500)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Entry submitted!</h2>
          <p className="text-sm text-gray-500 mt-1">Redirecting to your entry…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Knowledge Entry</h1>
          <p className="text-sm text-gray-500">
            Share traditional knowledge, plant properties, or conservation practices.
            A SHA-256 cryptographic hash will be generated automatically to protect your submission.
          </p>
        </div>

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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Mophane Worm Harvesting Practices in Lephalale"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Describe the knowledge, its context, traditional use, and significance…"
            />
          </div>

          {/* Category & Access Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as KnowledgeCategory)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {(Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [KnowledgeCategory, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Access Tier
              </label>
              <select
                value={accessTier}
                onChange={e => setAccessTier(e.target.value as AccessTier)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {(Object.entries(ACCESS_TIER_LABELS) as [AccessTier, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {accessTier === 'sacred' && 'Elder approval required for access'}
                {accessTier === 'restricted' && 'Researcher application required'}
                {accessTier === 'public' && 'Visible to everyone'}
              </p>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as 'en' | 'tn')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="tn">Setswana</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Tag className="h-3.5 w-3.5 inline mr-1" />
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="medicinal, Okavango, dry-season, bark"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Latitude (e.g. -20.1234)"
              />
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Longitude (e.g. 23.4567)"
              />
            </div>
            {accessTier !== 'public' && (
              <p className="text-xs text-amber-600 mt-1">
                Precise coordinates will be protected based on your access tier setting.
              </p>
            )}
          </div>

          {/* SHA-256 hash preview */}
          {generatedHash && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-800">Biopiracy Shield Active</span>
              </div>
              <p className="text-xs text-green-700 font-mono break-all">{generatedHash}</p>
              <p className="text-xs text-green-600 mt-1">
                SHA-256 hash generated — timestamped proof of prior art recorded.
              </p>
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
            className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Generating hash & submitting…' : 'Submit Knowledge Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}
