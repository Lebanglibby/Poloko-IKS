import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ResearchCard } from '@/components/research/ResearchCard'
import { Pagination } from '@/components/shared/Pagination'
import { FlaskConical, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import type { LicenseType } from '@/lib/types'

const PAGE_SIZE = 24

interface SearchParams {
  search?: string
  license_type?: LicenseType
  status?: string
  page?: string
}

export default async function ResearchPage({
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
    .from('research_listings')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.search) query = query.ilike('title', `%${params.search}%`)
  if (params.license_type) query = query.eq('license_type', params.license_type)
  if (params.status) query = query.eq('status', params.status)

  const { data: listings, error, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildHref(p: number) {
    const qs = new URLSearchParams()
    if (params.search) qs.set('search', params.search)
    if (params.license_type) qs.set('license_type', params.license_type)
    if (params.status) qs.set('status', params.status)
    if (p > 1) qs.set('page', String(p))
    const q = qs.toString()
    return `/research${q ? `?${q}` : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile?.role} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="h-5 w-5 text-blue-700" />
              <h1 className="text-2xl font-bold text-gray-900">Research Hub</h1>
            </div>
            <p className="text-gray-500 text-sm max-w-xl">
              Published studies, product formulations, and technical frameworks derived
              from Botswana&apos;s indigenous knowledge systems
            </p>
          </div>
          {profile?.role && ['researcher', 'admin'].includes(profile.role) && (
            <Link
              href="/research/new"
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Publish Research
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-[57px] z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <form className="flex-1 min-w-[200px] relative" method="GET">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Search research listings…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {params.license_type && <input type="hidden" name="license_type" value={params.license_type} />}
            {params.status && <input type="hidden" name="status" value={params.status} />}
          </form>

          <form method="GET">
            <select
              name="license_type"
              defaultValue={params.license_type ?? ''}
              onChange={e => (e.target.closest('form') as HTMLFormElement)?.submit()}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Licenses</option>
              {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {params.search && <input type="hidden" name="search" value={params.search} />}
            {params.status && <input type="hidden" name="status" value={params.status} />}
          </form>

          <form method="GET">
            <select
              name="status"
              defaultValue={params.status ?? ''}
              onChange={e => (e.target.closest('form') as HTMLFormElement)?.submit()}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="open_for_collaboration">Open for Collaboration</option>
            </select>
            {params.search && <input type="hidden" name="search" value={params.search} />}
            {params.license_type && <input type="hidden" name="license_type" value={params.license_type} />}
          </form>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 mb-6 text-sm">
            {error.message}
          </div>
        )}

        {!listings || listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No research listings found.</p>
            {(params.search || params.license_type || params.status) && (
              <a href="/research" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                Clear filters
              </a>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {count ?? listings.length} listing{(count ?? listings.length) !== 1 ? 's' : ''} found
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map(listing => (
                <ResearchCard key={listing.id} listing={listing} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </>
        )}
      </main>
    </div>
  )
}
