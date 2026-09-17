import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ResearchHubClient } from '@/components/research/ResearchHubClient'
import { FlaskConical } from 'lucide-react'
import Link from 'next/link'
import type { LicenseType } from '@/lib/types'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'

const PAGE_SIZE = 30

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

  /* Fetch pending access request count for notification bell */
  const { count: pendingCount } = user && profile?.role === 'admin'
    ? await supabase
        .from('access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
    : { count: 0 }

  /* Main listings query */
  let query = supabase
    .from('research_listings')
    .select('*, profiles(full_name, community), collaborators:research_collaborators(id, collaborator_id, contribution, credit_share, joined_at, profiles(full_name))', { count: 'exact' })
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.search)       query = query.ilike('title', `%${params.search}%`)
  if (params.license_type) query = query.eq('license_type', params.license_type)
  if (params.status)       query = query.eq('status', params.status)

  const { data: listings, error, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  /* Geo-tagged vault entries for the map panel */
  const { data: mapEntries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude',  'is', null)
    .not('longitude', 'is', null)
    .limit(200)

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
                <FlaskConical className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <h1 className="text-lg font-bold text-slate-100">Research Hub</h1>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                Module 2
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Published studies, licensed datasets, and collaborative research pipelines
              derived from Botswana&apos;s indigenous knowledge systems.
            </p>
          </div>

          {profile?.role && ['researcher', 'admin'].includes(profile.role) && (
            <Link
              href="/research/new"
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg transition-colors"
            >
              + Publish Research
            </Link>
          )}
        </div>
      </header>

      {/* ── Main split layout + filter bar wired in client ────────────────── */}
      <ResearchHubClient
        listings={listings ?? []}
        mapEntries={mapEntries ?? []}
        error={error?.message}
        totalCount={count ?? 0}
        totalPages={totalPages}
        currentPage={page}
        currentFilters={{
          search:       params.search,
          license_type: params.license_type,
          status:       params.status,
        }}
        licenseLabels={LICENSE_TYPE_LABELS}
        userRole={profile?.role ?? null}
        userId={user?.id ?? null}
      />
    </div>
  )
}
