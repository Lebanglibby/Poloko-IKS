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
    .from('research_listings')
    .select(
      '*, profiles(full_name, community), collaborators:research_collaborators(id, collaborator_id, contribution, credit_share, joined_at, profiles(full_name))',
      { count: 'exact' }
    )
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (params.search)       query = query.ilike('title', `%${params.search}%`)
  if (params.license_type) query = query.eq('license_type', params.license_type)
  if (params.status)       query = query.eq('status', params.status)

  const { data: listings, error, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const { data: mapEntries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude',  'is', null)
    .not('longitude', 'is', null)
    .limit(200)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} pendingNotifications={pendingCount ?? 0} />

      <header className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#FEF2E8] border border-[#FDBA74]">
                <FlaskConical className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F2937]">Research Hub</h1>
                <p className="text-sm text-[#9CA3AF]">Published studies & collaborative research</p>
              </div>
            </div>
            <p className="text-sm text-[#4B5563] max-w-lg mt-2 leading-relaxed">
              Browse published studies, licensed datasets, and open research pipelines
              derived from Botswana&apos;s indigenous knowledge systems.
            </p>
          </div>

          {profile?.role && ['researcher', 'admin'].includes(profile.role) && (
            <Link
              href="/research/new"
              className="shrink-0 flex items-center gap-2 text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              + Publish Research
            </Link>
          )}
        </div>
      </header>

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
