import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { KnowledgeCard } from '@/components/vault/KnowledgeCard'
import { ResearchCard } from '@/components/research/ResearchCard'
import { USER_ROLE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import {
  BookOpen, FlaskConical, Eye, Download,
  Clock, CheckCircle2, Plus, LayoutDashboard
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch user's knowledge submissions
  const { data: myEntries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch user's research listings (researchers only)
  const { data: myListings } = await supabase
    .from('research_listings')
    .select('*, profiles(full_name)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

  // Fetch pending access requests (elders/admins)
  type PendingRequest = {
    id: string
    created_at: string
    knowledge_entries: { title: string; access_tier: string } | null
  }
  const { data: pendingRequests, count: pendingCount } = await supabase
    .from('access_requests')
    .select('id, created_at, knowledge_entries(title, access_tier)', { count: 'exact' })
    .eq('status', 'pending')
    .limit(5) as unknown as { data: PendingRequest[] | null; count: number | null; error: unknown }

  // Stats
  const totalViews = myListings?.reduce((sum, l) => sum + (l.view_count ?? 0), 0) ?? 0
  const totalDownloads = myListings?.reduce((sum, l) => sum + (l.download_count ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile.role} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-green-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Dumela, {profile.full_name?.split(' ')[0] ?? 'there'}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {USER_ROLE_LABELS[profile.role]}
            {profile.community && ` · ${profile.community}`}
            {' · '}Member since {formatDate(profile.created_at)}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-green-700" />}
            label="Knowledge Submissions"
            value={myEntries?.length ?? 0}
            bg="bg-green-50"
          />
          <StatCard
            icon={<FlaskConical className="h-5 w-5 text-blue-700" />}
            label="Research Listings"
            value={myListings?.length ?? 0}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-purple-700" />}
            label="Total Views"
            value={totalViews}
            bg="bg-purple-50"
          />
          <StatCard
            icon={<Download className="h-5 w-5 text-amber-700" />}
            label="Total Downloads"
            value={totalDownloads}
            bg="bg-amber-50"
          />
        </div>

        {/* Pending access requests — elders/admins only */}
        {['elder', 'admin'].includes(profile.role) && pendingRequests && pendingRequests.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Access Requests
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              </h2>
              <Link href="/access-requests" className="text-sm text-green-700 hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white border border-amber-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.knowledge_entries?.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Access tier: {req.knowledge_entries?.access_tier} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <Link
                    href="/access-requests"
                    className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Knowledge Submissions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-700" />
              My Knowledge Submissions
            </h2>
            <Link href="/submit" className="text-sm text-green-700 hover:underline flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add entry
            </Link>
          </div>
          {!myEntries || myEntries.length === 0 ? (
            <EmptyState
              message="You haven't submitted any knowledge entries yet."
              action={{ href: '/submit', label: 'Submit your first entry' }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEntries.map(entry => (
                <KnowledgeCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* My Research Listings */}
        {['researcher', 'admin'].includes(profile.role) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-blue-700" />
                My Research Listings
              </h2>
              <Link href="/research/new" className="text-sm text-blue-700 hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Publish research
              </Link>
            </div>
            {!myListings || myListings.length === 0 ? (
              <EmptyState
                message="You haven't published any research listings yet."
                action={{ href: '/research/new', label: 'Publish your first study' }}
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myListings.map(listing => (
                  <ResearchCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function EmptyState({ message, action }: {
  message: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
      <CheckCircle2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
      <p className="text-sm text-gray-400">{message}</p>
      {action && (
        <Link href={action.href} className="text-sm text-green-700 mt-2 inline-block hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  )
}
