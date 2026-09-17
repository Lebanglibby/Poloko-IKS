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

  const { data: entry, error } = await supabase
    .from('knowledge_entries')
    .select('*, profiles(full_name, community)')
    .eq('id', id)
    .single()

  if (error || !entry) {
    const { data: exists } = await supabase
      .from('knowledge_entries')
      .select('id, access_tier')
      .eq('id', id)
      .single()

    if (exists) {
      return (
        <div className="min-h-screen bg-[#FDFBF7]">
          <Navbar userRole={profile?.role} />
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto mb-5">
              <Lock className="h-8 w-8 text-[#B91C1C]" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Access Restricted</h1>
            <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
              This knowledge entry is classified as{' '}
              <strong className="text-[#1F2937]">{exists.access_tier}</strong>.
              You need approval to view its contents.
            </p>
            {user ? (
              <div className="max-w-sm mx-auto text-left">
                <AccessRequestForm entryId={id} tier={exists.access_tier as 'restricted' | 'sacred'} isAuthenticated />
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login"
                  className="block bg-[#9A3412] hover:bg-[#7C2D12] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                  Sign in to request access
                </Link>
                <Link href="/vault"
                  className="block text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                  ← Back to the archive
                </Link>
              </div>
            )}
          </div>
        </div>
      )
    }
    notFound()
  }

  if (user) {
    supabase.from('audit_logs').insert({
      actor_id: user.id, action: 'view',
      target_type: 'knowledge_entry', target_id: id,
    }).then(() => {})
  }

  const canVerify = user && !entry.verified && user.id !== entry.submitted_by && entry.access_tier === 'public'

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile?.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <Link href="/vault"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#9A3412] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Knowledge Vault
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title card */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-bold text-[#1F2937] leading-snug">{entry.title}</h1>
                <AccessTierBadge tier={entry.access_tier} variant="badge" className="shrink-0 mt-1" />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs mb-5">
                <span className="bg-[#F3F0EB] text-[#4B5563] px-2.5 py-1 rounded-full font-medium">
                  {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                </span>
                {entry.verified ? (
                  <span className="flex items-center gap-1 text-[#15803D] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Community Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#B45309] font-medium">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Awaiting verification
                  </span>
                )}
                {entry.language === 'tn' && (
                  <span className="bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] px-2.5 py-1 rounded-full font-medium">
                    Setswana
                  </span>
                )}
              </div>

              {entry.description && (
                <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                  {entry.description}
                </p>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5" aria-label="Tags">
                  {entry.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2.5 py-1 rounded-full">
                      <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            {entry.latitude && entry.longitude && entry.access_tier === 'public' && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
                  Location
                </h2>
                <p className="text-sm text-[#4B5563] font-mono">
                  {entry.latitude.toFixed(6)}°, {entry.longitude.toFixed(6)}°
                </p>
                <Link href={`/map?highlight=${entry.id}`}
                  className="text-sm text-[#9A3412] font-semibold mt-2.5 inline-block hover:underline">
                  View on resource map →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Submitter */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-3">Submitted by</h3>
              <p className="text-sm font-semibold text-[#1F2937]">{entry.profiles?.full_name ?? 'Anonymous'}</p>
              {entry.profiles?.community && (
                <p className="text-xs text-[#9CA3AF] mt-0.5">{entry.profiles.community}</p>
              )}
              <p className="text-xs text-[#9CA3AF] mt-1.5">{formatDate(entry.created_at)}</p>
            </div>

            {/* Protected record */}
            <div className="bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#14532D]">Protected Heritage Record</span>
              </div>
              <p className="text-[11px] font-mono text-[#15803D] break-all leading-relaxed">{entry.sha256_hash}</p>
              <p className="text-xs text-[#15803D] mt-2">
                Unique tamper-proof identifier — immutable proof registered at time of submission.
              </p>
            </div>

            {/* Verify */}
            {canVerify && (
              <div className="bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] p-5">
                <h3 className="text-sm font-bold text-[#78350F] mb-2">Help Verify This Entry</h3>
                <p className="text-xs text-[#B45309] mb-4 leading-relaxed">
                  Do you have knowledge of this practice? Your verification helps the community.
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
