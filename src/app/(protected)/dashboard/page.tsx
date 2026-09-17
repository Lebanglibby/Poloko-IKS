import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { KnowledgeCard } from '@/components/vault/KnowledgeCard'
import { ResearchCard } from '@/components/research/ResearchCard'
import { formatDate } from '@/lib/utils'
import {
  BookOpen, FlaskConical, Eye, Download,
  Clock, CheckCircle2, Plus, Leaf, ArrowRight,
} from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  community_member: 'Community Member',
  researcher:       'Researcher',
  elder:            'Community Elder',
  admin:            'Administrator',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: myEntries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: myListings } = await supabase
    .from('research_listings')
    .select('*, profiles(full_name)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

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

  const totalViews     = myListings?.reduce((s, l) => s + (l.view_count     ?? 0), 0) ?? 0
  const totalDownloads = myListings?.reduce((s, l) => s + (l.download_count ?? 0), 0) ?? 0
  const isElder        = ['elder', 'admin'].includes(profile.role)
  const isResearcher   = ['researcher', 'admin'].includes(profile.role)

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} pendingNotifications={pendingCount ?? 0} />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#9A3412] to-[#B45309] rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-orange-200 text-sm font-medium mb-1">
                {ROLE_LABELS[profile.role] ?? profile.role}
                {profile.community && ` · ${profile.community}`}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Dumela, {profile.full_name?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-orange-200 text-sm">
                Member since {formatDate(profile.created_at)}
              </p>
            </div>
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Leaf className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/submit"
              className="inline-flex items-center gap-2 bg-white text-[#9A3412] px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors shadow-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Share Knowledge
            </Link>
            <Link href="/vault"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
              Browse Archive <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen,  label: 'My Submissions',   value: myEntries?.length    ?? 0, bg: 'bg-[#FEF9F0] border-[#FDBA74]',   iconColor: 'text-[#9A3412]'  },
            { icon: FlaskConical, label: 'My Research',   value: myListings?.length   ?? 0, bg: 'bg-[#F0FDF4] border-[#BBF7D0]',   iconColor: 'text-[#15803D]'  },
            { icon: Eye,       label: 'Total Views',      value: totalViews,                bg: 'bg-[#EFF6FF] border-blue-200',     iconColor: 'text-blue-600'   },
            { icon: Download,  label: 'Total Downloads',  value: totalDownloads,            bg: 'bg-[#FFFBEB] border-[#FDE68A]',   iconColor: 'text-[#B45309]'  },
          ].map(({ icon: Icon, label, value, bg, iconColor }) => (
            <div key={label} className={`rounded-2xl border p-5 bg-white ${bg.split(' ')[1]}`} style={{ background: 'white', borderColor: bg.split(' ')[1]?.replace('border-[', '').replace(']', '') }}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${bg.split(' ')[0]}`}>
                <Icon className={`h-4.5 w-4.5 ${iconColor}`} style={{ width: 18, height: 18 }} aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">{value.toLocaleString()}</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending access requests */}
        {isElder && pendingRequests && pendingRequests.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                Pending Access Requests
                <span className="bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-xs px-2 py-0.5 rounded-full font-semibold">
                  {pendingCount}
                </span>
              </h2>
              <Link href="/access-requests" className="text-sm text-[#9A3412] font-semibold hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white border border-[#E8DDD0] rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">
                      {req.knowledge_entries?.title ?? 'Unknown entry'}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Access level: {req.knowledge_entries?.access_tier} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <Link href="/access-requests"
                    className="shrink-0 text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] px-3 py-1.5 rounded-lg hover:bg-[#FEF3C7] transition-colors">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My knowledge submissions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
              My Knowledge Submissions
            </h2>
            <Link href="/submit" className="text-sm text-[#9A3412] font-semibold hover:underline flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add entry
            </Link>
          </div>
          {!myEntries || myEntries.length === 0 ? (
            <EmptyCard
              message="You haven&apos;t shared any knowledge entries yet."
              action={{ href: '/submit', label: 'Share your first entry' }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEntries.map(entry => (
                <KnowledgeCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* Research listings */}
        {isResearcher && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                My Research Listings
              </h2>
              <Link href="/research/new" className="text-sm text-[#15803D] font-semibold hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Publish research
              </Link>
            </div>
            {!myListings || myListings.length === 0 ? (
              <EmptyCard
                message="You haven&apos;t published any research listings yet."
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

function EmptyCard({ message, action }: { message: string; action?: { href: string; label: string } }) {
  return (
    <div className="bg-white border-2 border-dashed border-[#E8DDD0] rounded-2xl p-10 text-center">
      <CheckCircle2 className="h-10 w-10 text-[#E8DDD0] mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-[#9CA3AF]" dangerouslySetInnerHTML={{ __html: message }} />
      {action && (
        <Link href={action.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9A3412] hover:underline">
          {action.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
