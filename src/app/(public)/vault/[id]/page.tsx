import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { AccessTierBadge } from '@/components/vault/AccessTierBadge'
import { VerifyEntryButton } from '@/components/vault/VerifyEntryButton'
import { AccessRequestForm } from '@/components/vault/AccessRequestForm'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { MapPin, Tag, Shield, CheckCircle2, Clock, ArrowLeft, Lock } from 'lucide-react'

export default async function KnowledgeEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  // Fetch the entry — RLS will block if user lacks access
  const { data: entry, error } = await supabase
    .from('knowledge_entries')
    .select('*, profiles(full_name, community)')
    .eq('id', id)
    .single()

  if (error || !entry) {
    // Check if the entry exists but is restricted
    const { data: exists } = await supabase
      .from('knowledge_entries')
      .select('id, access_tier')
      .eq('id', id)
      .single()

    if (exists) {
      // Entry exists but user doesn't have access — show access request prompt
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar userRole={profile?.role} />
          <div className="max-w-lg mx-auto px-6 py-20 text-center">
            <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-sm text-gray-500 mb-6">
              This knowledge entry is classified as{' '}
              <strong>{exists.access_tier}</strong>. You need approval to view its contents.
            </p>
            {user ? (
              <div className="max-w-sm mx-auto text-left">
                <AccessRequestForm entryId={id} />
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors inline-block"
              >
                Sign in to request access
              </Link>
            )}
          </div>
        </div>
      )
    }

    notFound()
  }

  // Log view
  if (user) {
    supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'view',
      target_type: 'knowledge_entry',
      target_id: id,
    }).then(() => {})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile?.role} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/vault" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Knowledge Vault
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-xl font-bold text-gray-900">{entry.title}</h1>
                <AccessTierBadge tier={entry.access_tier} className="shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-5">
                <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                  {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                </span>
                {entry.verified ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Community Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Clock className="h-3 w-3" /> Pending verification
                  </span>
                )}
                {entry.language === 'tn' && (
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Setswana</span>
                )}
              </div>

              {entry.description && (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {entry.description}
                </p>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {entry.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      <Tag className="h-2.5 w-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            {entry.latitude && entry.longitude && entry.access_tier === 'public' && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-700" /> Location
                </h2>
                <p className="text-sm text-gray-600">
                  {entry.latitude.toFixed(6)}°, {entry.longitude.toFixed(6)}°
                </p>
                <Link
                  href={`/map?highlight=${entry.id}`}
                  className="text-xs text-green-600 mt-2 inline-block hover:underline"
                >
                  View on resource map →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Submitter */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Submitted by</h3>
              <p className="text-sm font-medium text-gray-900">{entry.profiles?.full_name ?? 'Anonymous'}</p>
              {entry.profiles?.community && (
                <p className="text-xs text-gray-400 mt-0.5">{entry.profiles.community}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">{formatDate(entry.created_at)}</p>
            </div>

            {/* Biopiracy Shield */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-700" />
                <span className="text-xs font-semibold text-green-800">Biopiracy Shield</span>
              </div>
              <p className="text-xs font-mono text-green-700 break-all">{entry.sha256_hash}</p>
              <p className="text-xs text-green-600 mt-2">
                SHA-256 hash — immutable proof of prior art recorded at submission
              </p>
            </div>

            {/* Community verification action */}
            {user && !entry.verified && user.id !== entry.submitted_by && (
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                <h3 className="text-xs font-semibold text-amber-800 mb-2">Community Verification</h3>
                <p className="text-xs text-amber-700 mb-3">
                  Do you have knowledge of this practice? Help verify this entry.
                </p>
                <VerifyEntryButton entryId={entry.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
