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

      <header className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#FEF2E8] border border-[#FDBA74]">
                <Leaf className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F2937]">Knowledge Vault</h1>
                <p className="text-sm text-[#9CA3AF]">Botswana&apos;s living heritage archive</p>
              </div>
            </div>
            <p className="text-sm text-[#4B5563] max-w-lg mt-2 leading-relaxed">
              Browse traditional practices, medicinal plants, conservation wisdom, and cultural
              narratives preserved from communities across Botswana.
            </p>
          </div>

          {user && (
            <a
              href="/submit"
              className="shrink-0 flex items-center gap-2 text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              + Share Knowledge
            </a>
          )}
        </div>
      </header>

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
    </div>
  )
}
