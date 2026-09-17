'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Users, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function CollaboratePage() {
  const params = useParams()
  const listingId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [contribution, setContribution] = useState('')
  const [creditShare, setCreditShare] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be signed in to apply.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('research_collaborators')
      .insert({
        listing_id: listingId,
        collaborator_id: user.id,
        contribution,
        credit_share: creditShare ? parseFloat(creditShare) : null,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push(`/research/${listingId}`), 1500)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Collaboration request sent!</h2>
          <p className="text-sm text-gray-500 mt-1">Returning to the research listing…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">
        <Link
          href={`/research/${listingId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listing
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">Apply to Collaborate</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Describe how you can contribute to this research. The author will review your application
          and assign intellectual credit if accepted.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-100 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              How can you contribute? <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={contribution}
              onChange={e => setContribution(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your expertise, what data or analysis you can contribute, and your methodology…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proposed Credit Share (%)
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={creditShare}
              onChange={e => setCreditShare(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 25"
            />
            <p className="text-xs text-gray-400 mt-1">
              The primary author will confirm final credit allocation.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Submitting…' : 'Submit Collaboration Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
