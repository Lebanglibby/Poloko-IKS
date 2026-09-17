import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { VaultBrowseClient } from '@/components/vault/VaultBrowseClient'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { Leaf } from 'lucide-react'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'

const PAGE_SIZE = 30

interface SearchParams {
  category?: KnowledgeCategory
  tier?: AccessTier
  search?: string
  page?: string
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params  = await searchParams
  const supabase = await createClient()
  const page    = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset  = (page - 1) * PAGE_SIZE

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  /* Pending count for notification bell */
  const { count: pendingCount } = user && profile?.role === 'admin'
    ? await supabase
        .from('access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
    : { count: 0 }

  /* Main entries query */
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

  /* Map entries — all geotagged */
  const { data: mapEntries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude',  'is', null)
    .not('longitude', 'is', null)
    .limit(300)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar
        userRole={profile?.role}
        pendingNotifications={pendingCount ?? 0}
      />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-5">
        <div className="max-w-screen-xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <h1 className="text-lg font-bold text-slate-100">Knowledge Vault</h1>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                Module 1
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Botswana&apos;s preserved indigenous knowledge — traditional practices,
              medicinal plants, conservation wisdom, and cultural narratives.
            </p>
          </div>

          {user && (
            <a
              href="/submit"
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg transition-colors"
            >
              + Submit Knowledge
            </a>
          )}
        </div>
      </header>

      {/* ── Split layout wired to client ─────────────────────────────────── */}
      <VaultBrowseClient
        entries={entries ?? []}
        mapEntries={mapEntries ?? []}
        categoryLabels={KNOWLEDGE_CATEGORY_LABELS}
        error={error?.message}
        totalCount={count ?? 0}
        totalPages={totalPages}
        currentPage={page}
        currentFilters={{
          search:   params.search,
          category: params.category,
          tier:     params.tier,
        }}
        userRole={profile?.role ?? null}
        userId={user?.id ?? null}
      />
    </div>
  )
}
