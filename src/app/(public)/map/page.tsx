import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ResourceMap } from '@/components/map/ResourceMap'
import { Map } from 'lucide-react'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  // Fetch geo-tagged entries (public only for unauthenticated, RLS handles the rest)
  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, access_tier, latitude, longitude, verified')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole={profile?.role} />

      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Map className="h-5 w-5 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-900">Resource Map</h1>
          </div>
          <p className="text-sm text-gray-500">
            Interactive map of geo-tagged indigenous knowledge assets and natural resource locations across Botswana
          </p>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Public
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Restricted (approximate location)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Sacred (region only)
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <ResourceMap entries={entries ?? []} />
      </div>
    </div>
  )
}
