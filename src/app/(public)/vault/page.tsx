import { createClient } from '@/lib/supabase/server'
import { KnowledgeCard } from '@/components/vault/KnowledgeCard'
import { Navbar } from '@/components/shared/Navbar'
import { Pagination } from '@/components/shared/Pagination'
import { Search, Leaf } from 'lucide-react'
import { KNOWLEDGE_CATEGORY_LABELS, ACCESS_TIER_LABELS } from '@/lib/constants'
import type { KnowledgeCategory, AccessTier } from '@/lib/types'

const PAGE_SIZE = 24

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
  const params = await searchParams
  const supabase = await createClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  let query = supabase
    .from('knowledge_entries')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.category) query = query.eq('category', params.category)
  if (params.tier) query = query.eq('access_tier', params.tier)
  if (params.search) query = query.ilike('title', `%${params.search}%`)

  const { data: entries, error, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildHref(p: number) {
    const qs = new URLSearchParams()
    if (params.search) qs.set('search', params.search)
    if (params.category) qs.set('category', params.category)
    if (params.tier) qs.set('tier', params.tier)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/vault${q ? `?${q}` : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile?.role} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-5 w-5 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Vault</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Botswana&apos;s preserved indigenous knowledge — traditional practices, medicinal plants, conservation wisdom
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-[57px] z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          {/* Search */}
          <form className="flex-1 min-w-[200px] relative" method="GET">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Search knowledge entries…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.tier && <input type="hidden" name="tier" value={params.tier} />}
          </form>

          {/* Category filter */}
          <form method="GET">
            <select
              name="category"
              defaultValue={params.category ?? ''}
              onChange={e => (e.target.closest('form') as HTMLFormElement)?.submit()}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {(Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [KnowledgeCategory, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {params.search && <input type="hidden" name="search" value={params.search} />}
            {params.tier && <input type="hidden" name="tier" value={params.tier} />}
          </form>

          {/* Tier filter */}
          <form method="GET">
            <select
              name="tier"
              defaultValue={params.tier ?? ''}
              onChange={e => (e.target.closest('form') as HTMLFormElement)?.submit()}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Access Tiers</option>
              {(Object.entries(ACCESS_TIER_LABELS) as [AccessTier, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {params.search && <input type="hidden" name="search" value={params.search} />}
            {params.category && <input type="hidden" name="category" value={params.category} />}
          </form>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 mb-6 text-sm">
            Failed to load entries: {error.message}
          </div>
        )}

        {!entries || entries.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Leaf className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No knowledge entries found.</p>
            {(params.search || params.category || params.tier) && (
              <a href="/vault" className="text-green-600 text-sm mt-2 inline-block hover:underline">
                Clear filters
              </a>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {count ?? entries.length} entr{(count ?? entries.length) === 1 ? 'y' : 'ies'} found
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {entries.map(entry => (
                <KnowledgeCard key={entry.id} entry={entry} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </>
        )}
      </main>
    </div>
  )
}
