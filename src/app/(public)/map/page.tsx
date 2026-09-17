import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ResourceMap } from '@/components/map/ResourceMap'
import { Map, Globe, Lock, Shield, BookOpen } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Resource Map — Poloko IKS',
  description:
    'Interactive map of geo-tagged indigenous knowledge assets and natural resource locations across Botswana.',
}

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  const legend = [
    {
      icon:  Globe,
      color: '#15803D',
      bg:    'bg-[#F0FDF4]',
      label: 'Public',
      desc:  'Exact location shown',
    },
    {
      icon:  Lock,
      color: '#B45309',
      bg:    'bg-[#FFFBEB]',
      label: 'Restricted',
      desc:  'Approximate area only',
    },
    {
      icon:  Shield,
      color: '#B91C1C',
      bg:    'bg-[#FEF2F2]',
      label: 'Sacred',
      desc:  'Region only — protected',
    },
  ]

  const entryCount = entries?.length ?? 0

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} />

      {/* Skip nav */}
      <a href="#map-canvas" className="skip-nav">Skip to map</a>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className="border-b-2 border-[#E8DDD0] bg-white px-4 sm:px-6 pt-8 pb-5">
        <div className="max-w-screen-xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <li>
                <Link href="/" className="hover:text-[#9A3412] transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-[#4B5563] font-semibold" aria-current="page">
                  Resource Map
                </span>
              </li>
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
                  <Map className="h-6 w-6 text-[#9A3412]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008] leading-tight">
                    Resource Map
                  </h1>
                  <p className="text-xs text-[#9C8070] font-semibold tracking-wide mt-0.5">
                    <span lang="tn" title="Setswana: Map of Resources">Mmapa wa Methopo</span>
                    {' '}·{' '}
                    <span className="font-normal">Knowledge locations across Botswana</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#4B5563] max-w-xl leading-relaxed mb-4">
                Interactive map of geo-tagged indigenous knowledge assets and natural resource
                locations. Click any marker to view entry details. Sacred and restricted entries
                have their exact coordinates protected.
              </p>

              {/* Legend */}
              <div className="flex flex-wrap gap-2" role="list" aria-label="Map legend — marker colours and their meaning">
                {legend.map(({ icon: Icon, color, bg, label, desc }) => (
                  <div
                    key={label}
                    role="listitem"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8DDD0] ${bg}`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0 border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="text-[#1F2937] font-semibold text-xs">{label}</span>
                    <span className="text-[#9CA3AF] text-xs hidden sm:inline">— {desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: entry count + vault link */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {entryCount > 0 && (
                <div
                  className="text-right px-4 py-2.5 rounded-xl bg-[#FEF9F0] border border-[#FDBA74]"
                  aria-label={`${entryCount} geo-tagged entries visible on the map`}
                >
                  <p className="text-lg font-bold text-[#9A3412] leading-none">{entryCount}</p>
                  <p className="text-xs text-[#9C8070] mt-0.5">geo-tagged entries</p>
                </div>
              )}
              <Link
                href="/vault"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5344] hover:text-[#9A3412] border border-[#E8DDD0] hover:border-[#9A3412] px-3 py-1.5 rounded-lg transition-all"
                aria-label="Browse all entries in the Knowledge Vault"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Browse all entries
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

      {/* Kente accent stripe */}
      <div className="h-1 kente-stripe" aria-hidden="true" />

      {/* ── Map + accessible fallback ───────────────────────────────── */}
      <main id="map-canvas" tabIndex={-1} className="flex-1 relative min-h-[500px] sm:min-h-[600px] outline-none">
        <ResourceMap entries={entries ?? []} />

        {/* Accessible text alternative for screen readers / no-JS */}
        <noscript>
          <div className="p-6 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl m-4">
            <p className="text-sm font-semibold text-[#B45309]">
              JavaScript is required to display the interactive map.
            </p>
            <p className="text-sm text-[#4B5563] mt-1">
              <Link href="/vault" className="underline text-[#9A3412]">Browse the Knowledge Vault</Link>
              {' '}to explore all entries as a list instead.
            </p>
          </div>
        </noscript>

        {/* Screen-reader summary of plotted entries */}
        {entryCount > 0 && (
          <p className="sr-only" aria-live="polite">
            {entryCount} knowledge entr{entryCount === 1 ? 'y' : 'ies'} plotted on the map.
            Public entries show exact locations. Restricted entries show approximate areas.
            Sacred entries show region only. Click a marker to open entry details,
            or{' '}
            <Link href="/vault">browse the full list in the Knowledge Vault</Link>.
          </p>
        )}
      </main>
    </div>
  )
}
