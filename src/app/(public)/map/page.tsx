import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ResourceMap } from '@/components/map/ResourceMap'
import { Map, Globe, Lock, Shield } from 'lucide-react'

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
    { icon: Globe,  color: '#15803D', label: 'Public',                       bg: 'bg-[#F0FDF4]' },
    { icon: Lock,   color: '#B45309', label: 'Restricted (approximate area)', bg: 'bg-[#FFFBEB]' },
    { icon: Shield, color: '#B91C1C', label: 'Sacred (region only)',          bg: 'bg-[#FEF2F2]' },
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar userRole={profile?.role} />

      <header className="border-b border-[#E8DDD0] bg-white px-4 sm:px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#FEF2E8] border border-[#FDBA74]">
              <Map className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937]">Resource Map</h1>
              <p className="text-sm text-[#9CA3AF]">Knowledge locations across Botswana</p>
            </div>
          </div>
          <p className="text-sm text-[#4B5563] max-w-xl leading-relaxed mb-4">
            Interactive map of geo-tagged indigenous knowledge assets and natural resource
            locations. Click any marker to view entry details.
          </p>
          <div className="flex flex-wrap gap-3" role="list" aria-label="Map legend">
            {legend.map(({ icon: Icon, color, label, bg }) => (
              <div key={label} role="listitem"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8DDD0] ${bg} text-sm`}>
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="text-[#4B5563] font-medium text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 relative min-h-[500px] sm:min-h-[600px]">
        <ResourceMap entries={entries ?? []} />
      </div>
    </div>
  )
}
