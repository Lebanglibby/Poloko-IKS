import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { formatDate } from '@/lib/utils'
import { Eye, Download, FileText, Code2, Upload, CheckCircle2, BarChart3 } from 'lucide-react'

const ACTION_CONFIG = {
  view: { icon: Eye, label: 'Viewed', color: 'text-blue-600 bg-blue-50' },
  download: { icon: Download, label: 'Downloaded', color: 'text-green-600 bg-green-50' },
  cite: { icon: FileText, label: 'Cited', color: 'text-purple-600 bg-purple-50' },
  api_access: { icon: Code2, label: 'API Access', color: 'text-amber-600 bg-amber-50' },
  submit: { icon: Upload, label: 'Submitted', color: 'text-gray-600 bg-gray-50' },
  verify: { icon: CheckCircle2, label: 'Verified', color: 'text-emerald-600 bg-emerald-50' },
}

export default async function AuditPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get content owned by this user
  const [{ data: myEntryIds }, { data: myListingIds }] = await Promise.all([
    supabase.from('knowledge_entries').select('id, title').eq('submitted_by', user.id),
    supabase.from('research_listings').select('id, title').eq('author_id', user.id),
  ])

  const ownedIds = [
    ...(myEntryIds?.map(r => r.id) ?? []),
    ...(myListingIds?.map(r => r.id) ?? []),
  ]

  const { data: logs } = ownedIds.length > 0
    ? await supabase
        .from('audit_logs')
        .select('*, profiles(full_name)')
        .in('target_id', ownedIds)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  // Compute summary stats
  const stats = {
    total: logs?.length ?? 0,
    views: logs?.filter(l => l.action === 'view').length ?? 0,
    downloads: logs?.filter(l => l.action === 'download').length ?? 0,
    api_access: logs?.filter(l => l.action === 'api_access').length ?? 0,
  }

  // Build a title lookup map
  const titleMap: Record<string, string> = {}
  myEntryIds?.forEach(e => { titleMap[e.id] = e.title })
  myListingIds?.forEach(l => { titleMap[l.id] = l.title })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile.role} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-green-700" />
          <h1 className="text-2xl font-bold text-gray-900">Attribution & Audit Log</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Track who views, downloads, cites, or accesses your knowledge entries and research listings.
        </p>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: stats.total, color: 'bg-gray-50' },
            { label: 'Views', value: stats.views, color: 'bg-blue-50' },
            { label: 'Downloads', value: stats.downloads, color: 'bg-green-50' },
            { label: 'API Accesses', value: stats.api_access, color: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4`}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Log table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
          </div>

          {!logs || logs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity recorded yet.</p>
              <p className="text-xs mt-1">Once others view or download your content, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map(log => {
                const config = ACTION_CONFIG[log.action as keyof typeof ACTION_CONFIG]
                const Icon = config?.icon ?? Eye

                return (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config?.color ?? 'bg-gray-50 text-gray-600'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.profiles?.full_name ?? 'Anonymous'}</span>
                        {' '}{config?.label?.toLowerCase() ?? log.action}{' '}
                        <span className="text-gray-600 truncate">
                          {titleMap[log.target_id] ?? log.target_id.slice(0, 8) + '…'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {log.target_type === 'knowledge_entry' ? 'Knowledge Entry' : 'Research Listing'}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <> · {JSON.stringify(log.metadata)}</>
                        )}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400 shrink-0">{formatDate(log.created_at)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
