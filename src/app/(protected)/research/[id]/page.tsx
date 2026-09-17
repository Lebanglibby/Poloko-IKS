import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { DownloadButton } from '@/components/research/DownloadButton'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import {
  Eye, Download, Users, Shield, Tag,
  ArrowLeft, UserPlus, Zap, FlaskConical,
} from 'lucide-react'

/* ─── Status badge styles — sage green system ───────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  published:              'bg-[#F0F7F4] text-[#2D6A4F] border-[#95D5B2]',
  draft:                  'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
  open_for_collaboration: 'bg-[#F0FAFA] text-[#0D7377] border-[#7FCFD2]',
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: listing, error } = await supabase
    .from('research_listings')
    .select('*, profiles(full_name, community)')
    .eq('id', id)
    .single()

  if (error || !listing) notFound()

  /* Fire-and-forget audit log */
  if (user) {
    supabase.from('audit_logs').insert({
      actor_id:    user.id,
      action:      'view',
      target_type: 'research_listing',
      target_id:   id,
    }).then(() => {})
  }

  const { data: collaborators } = await supabase
    .from('research_collaborators')
    .select('*, profiles(full_name)')
    .eq('listing_id', id)

  const isAuthor        = user?.id === listing.author_id
  const isOpenForCollab = listing.status === 'open_for_collaboration'

  const statusLabel =
    listing.status === 'open_for_collaboration'
      ? 'Open for Collaboration'
      : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile?.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <li><Link href="/" className="hover:text-[#2D6A4F] transition-colors font-medium">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/research" className="hover:text-[#2D6A4F] transition-colors font-medium">Research Hub</Link></li>
            <li aria-hidden="true">/</li>
            <li><span className="text-[#4B5563] font-semibold truncate max-w-[180px] inline-block align-bottom" aria-current="page">{listing.title}</span></li>
          </ol>
        </nav>

        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#2D6A4F] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Research Hub
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main column ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-sm">
              {/* Sage stripe top */}
              <div
                className="h-1 -mx-6 -mt-6 mb-5 rounded-t-2xl"
                aria-hidden="true"
                style={{
                  background: isOpenForCollab
                    ? 'linear-gradient(90deg, #0D7377, #0F8F94)'
                    : 'linear-gradient(90deg, #2D6A4F, #40916C)',
                }}
              />

              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ background: isOpenForCollab ? '#F0FAFA' : '#F0F7F4', borderColor: isOpenForCollab ? '#7FCFD2' : '#95D5B2' }}
                    aria-hidden="true"
                  >
                    <FlaskConical className="h-5 w-5" style={{ color: isOpenForCollab ? '#0D7377' : '#2D6A4F' }} />
                  </div>
                  <h1 className="text-2xl font-bold text-[#1F2937] leading-snug">{listing.title}</h1>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[listing.status] ?? STATUS_STYLES.published}`}
                >
                  {statusLabel}
                </span>
              </div>

              {listing.profiles && (
                <p className="text-sm text-[#9CA3AF] mb-4">
                  by{' '}
                  <span className="font-semibold text-[#4B5563]">{listing.profiles.full_name}</span>
                  {listing.profiles.community && (
                    <span className="text-[#9CA3AF]"> · {listing.profiles.community}</span>
                  )}
                </p>
              )}

              {listing.abstract && (
                <div>
                  <h2 className="text-sm font-bold text-[#1F2937] mb-2">About this research</h2>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{listing.abstract}</p>
                </div>
              )}

              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5" aria-label="Tags">
                  {listing.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2.5 py-1 rounded-full"
                    >
                      <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contributors */}
            {collaborators && collaborators.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#40916C]" aria-hidden="true" />
                  Contributors
                </h2>
                <div className="space-y-3">
                  {collaborators.map(c => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-xl border border-[#E8DDD0]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{c.profiles?.full_name}</p>
                        {c.contribution && (
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{c.contribution}</p>
                        )}
                      </div>
                      {c.credit_share != null && (
                        <span className="text-xs bg-[#F0F7F4] text-[#2D6A4F] border border-[#95D5B2] px-2.5 py-1 rounded-full font-medium">
                          {c.credit_share}% credit
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaboration CTA — teal accent */}
            {isOpenForCollab && user && !isAuthor && (
              <div
                className="rounded-2xl border-2 p-6"
                style={{ background: 'var(--r-teal-light)', borderColor: 'var(--r-teal-border)' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#CCF0F1', border: '1px solid var(--r-teal-border)' }}
                  >
                    <UserPlus className="h-5 w-5" style={{ color: 'var(--r-teal)' }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#085F63' }}>
                      This research is open for collaboration
                    </h3>
                    <p className="text-sm mt-1 mb-4 leading-relaxed" style={{ color: 'var(--r-teal)' }}>
                      Contribute your expertise to help complete this study and receive intellectual
                      attribution credit for your work.
                    </p>
                    <Link
                      href={`/research/collaborate/${id}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
                      style={{ background: 'var(--r-teal)' }}
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Apply to Collaborate
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Pricing & download */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <div className="flex items-baseline gap-1 mb-1">
                {listing.price === 0 ? (
                  <span
                    className="text-2xl font-bold flex items-center gap-1.5"
                    style={{ color: 'var(--r-primary)' }}
                  >
                    <Zap className="h-5 w-5" aria-hidden="true" /> Free
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-[#1F2937]">BWP {listing.price.toFixed(2)}</span>
                )}
              </div>
              {listing.license_type && (
                <p className="text-xs text-[#9CA3AF] mb-4">
                  {LICENSE_TYPE_LABELS[listing.license_type as keyof typeof LICENSE_TYPE_LABELS]}
                </p>
              )}
              {listing.full_document_url ? (
                <DownloadButton
                  listingId={listing.id}
                  documentUrl={listing.full_document_url}
                  isFree={listing.price === 0}
                />
              ) : (
                <div className="w-full text-center py-3 text-sm text-[#9CA3AF] border-2 border-dashed border-[#E8DDD0] rounded-xl bg-[#FDFBF7]">
                  Document not yet uploaded
                </div>
              )}
            </div>

            {/* Usage stats */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-4">Usage</h3>
              <div className="space-y-3">
                {[
                  { icon: Eye,      label: 'Views',        value: listing.view_count       },
                  { icon: Download, label: 'Downloads',    value: listing.download_count   },
                  { icon: Users,    label: 'Contributors', value: collaborators?.length ?? 0 },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-[#9CA3AF]">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                    </span>
                    <span className="font-bold text-[#1F2937]">{value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authorship record — keeps semantic green as this is about verification */}
            <div className="bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-sm font-bold text-[#14532D]">Verified Authorship Record</span>
              </div>
              <p
                className="text-[11px] font-mono text-[#15803D] break-all leading-relaxed select-all"
                aria-label="SHA-256 authorship hash"
              >
                {listing.sha256_hash}
              </p>
              <p className="text-xs text-[#15803D] mt-2">
                Published{' '}
                <time dateTime={listing.created_at}>{formatDate(listing.created_at)}</time>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
