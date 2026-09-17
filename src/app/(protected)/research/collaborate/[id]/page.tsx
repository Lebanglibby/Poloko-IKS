'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { createClient } from '@/lib/supabase/client'
import {
  Users, ArrowLeft, Loader2, CheckCircle2,
  FlaskConical, AlertCircle, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CONTRIBUTION_MAX = 1200

/* ─── Char counter ───────────────────────────────────────────────────────────── */
function CharCounter({ current, max, id }: { current: number; max: number; id: string }) {
  const remaining = max - current
  const warn  = remaining < max * 0.15
  const limit = remaining < 0
  return (
    <span
      id={id}
      aria-live="polite"
      className={cn('text-xs', limit ? 'text-[#B91C1C] font-bold' : warn ? 'text-[#B45309]' : 'text-[#9CA3AF]')}
    >
      {current}/{max}
    </span>
  )
}

export default function CollaboratePage() {
  const params    = useParams()
  const listingId = params.id as string
  const router    = useRouter()
  const supabase  = createClient()

  const [contribution, setContribution] = useState('')
  const [creditShare,  setCreditShare]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)

  /* Fetch listing title for context */
  const [listingTitle, setListingTitle] = useState<string | null>(null)
  useEffect(() => {
    supabase
      .from('research_listings')
      .select('title')
      .eq('id', listingId)
      .single()
      .then(({ data }) => { if (data) setListingTitle(data.title) })
  }, [listingId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contribution.trim()) { setError('Please describe your contribution.'); return }
    if (contribution.length > CONTRIBUTION_MAX) {
      setError(`Description must be ${CONTRIBUTION_MAX} characters or fewer.`)
      return
    }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in to apply.'); setLoading(false); return }

    const { error: insertError } = await supabase
      .from('research_collaborators')
      .insert({
        listing_id:     listingId,
        collaborator_id: user.id,
        contribution,
        credit_share: creditShare ? parseFloat(creditShare) : null,
      })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    setSuccess(true)
  }

  /* ── Success screen ──────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className="text-center bg-white rounded-3xl p-10 shadow-sm max-w-sm mx-auto border-2"
            style={{ borderColor: '#7FCFD2' }}
          >
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: '#F0FAFA', border: '2px solid #7FCFD2' }}
            >
              <CheckCircle2 className="h-10 w-10" style={{ color: '#0D7377' }} aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-[#1A1008] mb-2">Application submitted!</h1>
            <p className="text-sm text-[#6B5344] leading-relaxed mb-6">
              Your collaboration application has been sent to the research author.
              You&apos;ll be contacted if they accept your contribution.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`/research/${listingId}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: 'var(--r-teal)' }}
              >
                View Research Listing
              </a>
              <Link
                href="/research"
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#7FCFD2] hover:text-[#0D7377] transition-colors"
              >
                Browse Research Hub
              </Link>
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

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          href={`/research/${listingId}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#0D7377] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to listing
        </Link>

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ background: 'linear-gradient(135deg, #F0FAFA, #E0F5F6)', borderColor: '#7FCFD2' }}
              aria-hidden="true"
            >
              <Users className="h-6 w-6" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">Apply to Collaborate</h1>
              <p className="text-xs text-[#9C8070] font-semibold mt-0.5">
                Intellectual credit tracked on submission
              </p>
            </div>
          </div>

          {/* Listing context pill */}
          {listingTitle && (
            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl border"
              style={{ background: '#F0FAFA', borderColor: '#7FCFD2' }}
            >
              <FlaskConical className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#0D7377' }} aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#085F63' }}>Applying for</p>
                <p className="text-sm font-bold text-[#1F2937] mt-0.5">{listingTitle}</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
          Describe how you can contribute to this research. The author will review your application
          and assign intellectual credit if accepted. Your contribution will be permanently attributed
          in the Poloko IKS authorship record.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Collaboration application form"
          aria-describedby={error ? 'collab-error' : undefined}
          className="space-y-5 bg-white rounded-2xl border border-[#E8DDD0] p-6 sm:p-8 shadow-sm"
        >

          {/* Contribution */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="contribution" className="text-sm font-bold text-[#1F2937]">
                How can you contribute?{' '}
                <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <CharCounter current={contribution.length} max={CONTRIBUTION_MAX} id="contribution-counter" />
            </div>
            <p id="contribution-hint" className="text-xs text-[#9CA3AF] mb-2 leading-relaxed">
              Describe your expertise, what data or analysis you can provide, and your methodology.
            </p>
            <textarea
              id="contribution"
              required
              rows={6}
              value={contribution}
              onChange={e => setContribution(e.target.value)}
              aria-required="true"
              aria-describedby="contribution-hint contribution-counter"
              className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-colors resize-none bg-[#FDFBF7]"
              placeholder="e.g. I have field research data from the Okavango region on this plant compound collected over three seasons, including spectroscopy analysis…"
            />
          </div>

          {/* Credit share */}
          <div>
            <label htmlFor="creditShare" className="block text-sm font-bold text-[#1F2937] mb-1.5">
              Proposed Credit Share (%)
              <span className="font-normal text-[#9CA3AF] ml-1">(optional)</span>
            </label>
            <p id="credit-hint" className="text-xs text-[#9CA3AF] mb-2 leading-relaxed">
              Suggest a percentage of intellectual credit. The primary author confirms the final
              allocation. Typical contributor shares range from 5%–40%.
            </p>
            <div className="flex items-center gap-3">
              <input
                id="creditShare"
                type="number"
                min="1"
                max="99"
                value={creditShare}
                onChange={e => setCreditShare(e.target.value)}
                aria-describedby="credit-hint"
                className="w-32 border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-colors bg-[#FDFBF7]"
                placeholder="e.g. 25"
              />
              <span className="text-sm text-[#9CA3AF]">percent</span>
              {creditShare && parseFloat(creditShare) > 0 && parseFloat(creditShare) < 100 && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: '#F0FAFA', color: '#0D7377', border: '1px solid #7FCFD2' }}
                >
                  {creditShare}% proposed
                </span>
              )}
            </div>
          </div>

          {/* Attribution note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[#E8DDD0] bg-[#FDFBF7]">
            <Shield className="h-4 w-4 text-[#40916C] mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-[#6B5344] leading-relaxed">
              Approved contributions are permanently recorded in the Poloko IKS authorship log
              and attributed to your profile — this is immutable proof of your intellectual work.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              id="collab-error"
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
            disabled={loading}
            aria-busy={loading}
            className="w-full text-white py-3 rounded-xl font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm text-sm"
            style={{ background: 'var(--r-teal)' }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Submitting…' : 'Submit Collaboration Application'}
          </button>

          <p className="text-xs text-center text-[#9CA3AF]">
            Your application will be reviewed by the research author.
          </p>
        </form>
      </main>
    </div>
  )
}
