import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { DownloadButton } from '@/components/research/DownloadButton'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import {
  Eye, Download, Users, Shield, Tag,
  ArrowLeft, UserPlus
} from 'lucide-react'

export default async function ResearchDetailPage({
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

  const { data: listing, error } = await supabase
    .from('research_listings')
    .select('*, profiles(full_name, community)')
    .eq('id', id)
    .single()

  if (error || !listing) notFound()

  // Log view in audit trail (fire and forget)
  if (user) {
    supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'view',
      target_type: 'research_listing',
      target_id: id,
    }).then(() => {})
  }

  // Fetch collaborators
  const { data: collaborators } = await supabase
    .from('research_collaborators')
    .select('*, profiles(full_name)')
    .eq('listing_id', id)

  const isAuthor = user?.id === listing.author_id
  const isOpenForCollab = listing.status === 'open_for_collaboration'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile?.role} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back */}
        <Link href="/research" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Research Hub
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                  listing.status === 'published' ? 'bg-green-50 text-green-700' :
                  listing.status === 'open_for_collaboration' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {listing.status === 'open_for_collaboration' ? 'Open for Collaboration' :
                   listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>

              {listing.profiles && (
                <p className="text-sm text-gray-500 mb-4">
                  by <span className="font-medium text-gray-700">{listing.profiles.full_name}</span>
                  {listing.profiles.community && ` · ${listing.profiles.community}`}
                </p>
              )}

              {listing.abstract && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Abstract</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{listing.abstract}</p>
                </div>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {listing.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      <Tag className="h-2.5 w-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Collaborators */}
            {collaborators && collaborators.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-700" />
                  Contributors
                </h2>
                <div className="space-y-3">
                  {collaborators.map(c => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.profiles?.full_name}</p>
                        {c.contribution && <p className="text-xs text-gray-400">{c.contribution}</p>}
                      </div>
                      {c.credit_share && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {c.credit_share}% credit
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaboration CTA */}
            {isOpenForCollab && user && !isAuthor && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-blue-700 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">This research is open for collaboration</h3>
                    <p className="text-xs text-blue-700 mt-1 mb-3">
                      Contribute your expertise to help complete this study and receive intellectual credit.
                    </p>
                    <Link
                      href={`/research/collaborate/${id}`}
                      className="text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors inline-block"
                    >
                      Apply to Collaborate
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Access & Pricing */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {listing.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `BWP ${listing.price.toFixed(2)}`
                )}
              </div>
              {listing.license_type && (
                <p className="text-xs text-gray-500 mb-4">
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
                <div className="w-full text-center py-2.5 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  Document not yet uploaded
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Usage Statistics
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Eye className="h-3.5 w-3.5" /> Views
                  </span>
                  <span className="font-semibold text-gray-900">{listing.view_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Download className="h-3.5 w-3.5" /> Downloads
                  </span>
                  <span className="font-semibold text-gray-900">{listing.download_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Users className="h-3.5 w-3.5" /> Collaborators
                  </span>
                  <span className="font-semibold text-gray-900">{collaborators?.length ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Proof of authorship */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-700" />
                <span className="text-xs font-semibold text-gray-700">Proof of Authorship</span>
              </div>
              <p className="text-xs font-mono text-gray-400 break-all">{listing.sha256_hash}</p>
              <p className="text-xs text-gray-400 mt-1.5">
                Published {formatDate(listing.created_at)}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
