import { Navbar } from '@/components/shared/Navbar'
import { ResearchHubClient } from '@/components/research/ResearchHubClient'
import { FlaskConical, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { LicenseType } from '@/lib/types'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { MOCK_LISTINGS, MOCK_MAP_ENTRIES, MOCK_PROFILE, filterListings, paginate } from '@/lib/mock-data'

const PAGE_SIZE = 30

interface SearchParams {
  search?: string
  license_type?: LicenseType
  status?: string
  page?: string
}

export const metadata = {
  title: 'Research Hub — Poloko IKS',
  description:
    'Browse published studies, licensed datasets, and open research pipelines derived from Botswana\'s indigenous knowledge systems.',
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page   = Math.max(1, parseInt(params.page ?? '1', 10))

  // Mock user — always researcher
  const user    = MOCK_PROFILE
  const profile = MOCK_PROFILE

  // Mock: no pending admin notifications
  const pendingCount = 0

  // Filter + paginate mock research listings
  const filtered = filterListings(MOCK_LISTINGS, {
    search:       params.search,
    license_type: params.license_type,
    status:       params.status,
  })
  const { data: listings, total: count, totalPages } = paginate(filtered, page, PAGE_SIZE)

  // Map entries (from knowledge vault for cross-module map)
  const mapEntries = MOCK_MAP_ENTRIES

  const canPublish = ['researcher', 'admin'].includes(profile.role)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile.role} pendingNotifications={pendingCount} />

      {/* Skip to content */}
      <a href="#research-listings" className="skip-nav">Skip to research listings</a>

      {/* ── Page header ────────────────────────────────────────────── */}
      <header className="border-b-2 border-[#E8DDD0] bg-white px-4 sm:px-6 pt-8 pb-6">
        <div className="max-w-screen-xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <li><Link href="/" className="hover:text-[#2D6A4F] transition-colors font-medium">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><span className="text-[#4B5563] font-semibold" aria-current="page">Research Hub</span></li>
            </ol>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {/* Icon + heading */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-12 w-12 flex items-center justify-center rounded-2xl border shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #F0F7F4, #E8F5EE)', borderColor: '#95D5B2' }}
                  aria-hidden="true"
                >
                  <FlaskConical className="h-6 w-6 text-[#2D6A4F]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] leading-tight">
                    Research Hub
                  </h1>
                  {/* Setswana label */}
                  <p className="text-xs text-[#9C8070] font-semibold tracking-wide mt-0.5">
                    <span lang="tn" title="Setswana: Place of Research">Lefelo la Patlisiso</span>
                    {' '}·{' '}
                    <span className="font-normal">Studies, licensing &amp; collaboration</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#4B5563] max-w-lg leading-relaxed mb-4">
                Browse published studies, licensed datasets, and open research pipelines
                derived from Botswana&apos;s indigenous knowledge systems.
              </p>

              {/* Quick-link chips */}
              <div className="flex flex-wrap gap-2" role="list" aria-label="Quick filters">
                {[
                  { label: 'Open for Collaboration', href: '/research?status=open_for_collaboration' },
                  { label: 'Free Research',           href: '/research?license_type=cc_by'           },
                  { label: 'Browse Vault',            href: '/vault'                                 },
                  { label: 'Learning Hub',            href: '/learn'                                 },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    role="listitem"
                    className="text-xs px-3 py-1.5 rounded-full border border-[#E8DDD0] bg-white text-[#6B5344] hover:border-[#95D5B2] hover:text-[#2D6A4F] hover:bg-[#F7FBF8] transition-all font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {canPublish ? (
                <Link
                  href="/research/new"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                  style={{ background: 'var(--r-primary)' }}
                  aria-label="Publish a new research listing"
                >
                  <FlaskConical className="h-4 w-4" aria-hidden="true" />
                  Publish Research
                </Link>
              ) : (
                !user && (
                  <div className="text-right">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm"
                      style={{ background: 'var(--r-primary)' }}
                    >
                      Join to Publish
                    </Link>
                    <p className="text-xs text-[#9CA3AF] mt-1.5">Researcher accounts are free</p>
                  </div>
                )
              )}

              <Link
                href="/vault"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5344] hover:text-[#2D6A4F] border border-[#E8DDD0] hover:border-[#95D5B2] px-3 py-1.5 rounded-lg transition-all"
                aria-label="Browse the Knowledge Vault"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Knowledge Vault
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sage green kente-style accent stripe */}
      <div
        className="h-1 shrink-0"
        aria-hidden="true"
        style={{
          background: 'repeating-linear-gradient(90deg, #2D6A4F 0px, #2D6A4F 20px, #40916C 20px, #40916C 40px, #95D5B2 40px, #95D5B2 60px, #D8F3E3 60px, #D8F3E3 80px)',
        }}
      />

      {/* Main */}
      <main id="research-listings" tabIndex={-1} className="flex flex-col flex-1 outline-none">
        <ResearchHubClient
          listings={listings}
          mapEntries={mapEntries}
          error={undefined}
          totalCount={count}
          totalPages={totalPages}
          currentPage={page}
          currentFilters={{
            search:       params.search,
            license_type: params.license_type,
            status:       params.status,
          }}
          licenseLabels={LICENSE_TYPE_LABELS}
          userRole={profile.role}
          userId={user.id}
        />
      </main>
    </div>
  )
}
