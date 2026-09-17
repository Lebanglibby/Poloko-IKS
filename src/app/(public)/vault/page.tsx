import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { VaultBrowseClient } from '@/components/vault/VaultBrowseClient'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { Leaf, BookOpen } from 'lucide-react'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'
import Link from 'next/link'

const PAGE_SIZE = 30

interface SearchParams {
  category?: KnowledgeCategory
  tier?: AccessTier
  search?: string
  page?: string
}

export const metadata = {
  title: 'Knowledge Vault — Poloko IKS',
  description:
    'Browse traditional practices, medicinal plants, conservation wisdom, and cultural narratives preserved from communities across Botswana.',
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params   = await searchParams
  const supabase = await createClient()
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset   = (page - 1) * PAGE_SIZE

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const { count: pendingCount } = user && profile?.role === 'admin'
    ? await supabase
        .from('access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
    : { count: 0 }

  let query = supabase
    .from('knowledge_entries')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.category) query = query.eq('category', params.category)
  if (params.tier)     query = query.eq('access_tier', params.tier)
  if (params.search)   query = query.ilike('title', `%${params.search}%`)

  const { data: entries, error, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const { data: mapEntries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude',  'is', null)
    .not('longitude', 'is', null)
    .limit(300)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} pendingNotifications={pendingCount ?? 0} />

      {/* ── Skip to content ───────────────────────────────────────────── */}
      <a href="#vault-entries" className="skip-nav">Skip to archive entries</a>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <header className="border-b-2 border-[#E8DDD0] bg-white px-4 sm:px-6 pt-8 pb-6">
        <div className="max-w-screen-xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <li><Link href="/" className="hover:text-[#9A3412] transition-colors font-medium">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><span className="text-[#4B5563] font-semibold" aria-current="page">Knowledge Vault</span></li>
            </ol>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {/* Icon + heading */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-12 w-12 flex items-center justify-center rounded-2xl border border-[#FDBA74] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #FEF2E8, #FEF9F0)' }}
                  aria-hidden="true"
                >
                  <Leaf className="h-6 w-6 text-[#9A3412]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] leading-tight">
                    Knowledge Vault
                  </h1>
                  {/* Setswana label */}
                  <p className="text-xs text-[#9C8070] font-semibold tracking-wide mt-0.5">
                    <span lang="tn" title="Setswana: Mirror/Vault of Knowledge">Seipone sa Kitso</span>
                    {' '}·{' '}
                    <span className="font-normal">Botswana&apos;s living heritage archive</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#4B5563] max-w-lg leading-relaxed mb-4">
                Browse traditional practices, medicinal plants, conservation wisdom, and cultural
                narratives — preserved from communities across Botswana.
              </p>

              {/* Category count teaser pills */}
              <div className="flex flex-wrap gap-2" role="list" aria-label="Archive categories">
                {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([, label]) => (
                  <span
                    key={label}
                    role="listitem"
                    className="text-xs px-2.5 py-1 rounded-full bg-[#F5F0E8] border border-[#E5D8C8] text-[#6B5344] font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {user ? (
                <a
                  href="/submit"
                  className="inline-flex items-center gap-2 text-sm font-bold bg-[#9A3412] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm hover:shadow-md"
                  aria-label="Share new knowledge with the archive"
                >
                  <Leaf className="h-4 w-4" aria-hidden="true" />
                  Share Knowledge
                </a>
              ) : (
                <div className="text-right">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-sm font-bold bg-[#9A3412] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Leaf className="h-4 w-4" aria-hidden="true" />
                    Join to Contribute
                  </Link>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">
                    Free · No card required
                  </p>
                </div>
              )}

              {/* Link to map view */}
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5344] hover:text-[#9A3412] border border-[#E8DDD0] hover:border-[#9A3412] px-3 py-1.5 rounded-lg transition-all"
                aria-label="View all entries on the resource map"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                View on map
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5344] hover:text-[#92400E] border border-[#E8DDD0] hover:border-[#FDE68A] px-3 py-1.5 rounded-lg transition-all"
                aria-label="Go to the Learning Hub"
              >
                🎓 Learning Hub
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Kente accent stripe below header ──────────────────────────── */}
      <div className="h-1 kente-stripe" aria-hidden="true" />

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main id="vault-entries" tabIndex={-1} className="flex flex-col flex-1 outline-none">
        <VaultBrowseClient
          entries={entries ?? []}
          mapEntries={mapEntries ?? []}
          categoryLabels={KNOWLEDGE_CATEGORY_LABELS}
          error={error?.message}
          totalCount={count ?? 0}
          totalPages={totalPages}
          currentPage={page}
          currentFilters={{ search: params.search, category: params.category, tier: params.tier }}
          userRole={profile?.role ?? null}
          userId={user?.id ?? null}
        />
      </main>
    </div>
  )
}
