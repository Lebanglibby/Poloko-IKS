import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { formatDate } from '@/lib/utils'
import { Eye, Download, FileText, Code2, Upload, CheckCircle2, BarChart3 } from 'lucide-react'

const ACTION_CONFIG = {
  view:       { icon: Eye,          label: 'Viewed',      bg: 'bg-blue-50',        text: 'text-blue-600'   },
  download:   { icon: Download,     label: 'Downloaded',  bg: 'bg-[#F0FDF4]',     text: 'text-[#15803D]'  },
  cite:       { icon: FileText,     label: 'Cited',       bg: 'bg-purple-50',      text: 'text-purple-600' },
  api_access: { icon: Code2,        label: 'API Access',  bg: 'bg-[#FFFBEB]',     text: 'text-[#B45309]'  },
  submit:     { icon: Upload,       label: 'Submitted',   bg: 'bg-[#F3F0EB]',     text: 'text-[#4B5563]'  },
  verify:     { icon: CheckCircle2, label: 'Verified',    bg: 'bg-[#F0FDF4]',     text: 'text-[#15803D]'  },
}

export default async function AuditPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

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

  const stats = {
    total:      logs?.length ?? 0,
    views:      logs?.filter(l => l.action === 'view').length     ?? 0,
    downloads:  logs?.filter(l => l.action === 'download').length ?? 0,
    api_access: logs?.filter(l => l.action === 'api_access').length ?? 0,
  }

  const titleMap: Record<string, string> = {}
  myEntryIds?.forEach(e => { titleMap[e.id] = e.title })
  myListingIds?.forEach(l => { titleMap[l.id] = l.title })

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[#FEF2E8] border border-[#FDBA74] flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Attribution &amp; Usage Log</h1>
            <p className="text-sm text-[#9CA3AF]">Track who views, downloads, and cites your content</p>
          </div>
        </div>
        <p className="text-sm text-[#4B5563] mb-7 leading-relaxed max-w-xl">
          Every time someone views, downloads, or cites your knowledge entries or research listings,
          it&apos;s recorded here with full attribution details.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: stats.total,      bg: 'bg-[#F3F0EB]'  },
            { label: 'Views',        value: stats.views,      bg: 'bg-[#EFF6FF]'  },
            { label: 'Downloads',    value: stats.downloads,  bg: 'bg-[#F0FDF4]'  },
            { label: 'API Accesses', value: stats.api_access, bg: 'bg-[#FFFBEB]'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-[#E8DDD0] rounded-2xl p-5`}>
              <div className="text-2xl font-bold text-[#1F2937]">{s.value.toLocaleString()}</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Log */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F0EB]">
            <h2 className="text-sm font-bold text-[#1F2937]">Recent Activity</h2>
          </div>
          {!logs || logs.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 text-[#D4C4B0]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#4B5563]">No activity recorded yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Once others interact with your content, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F0EB]">
              {logs.map(log => {
                const conf = ACTION_CONFIG[log.action as keyof typeof ACTION_CONFIG]
                const Icon = conf?.icon ?? Eye
                return (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FDFBF7] transition-colors">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${conf?.bg ?? 'bg-[#F3F0EB]'}`}>
                      <Icon className={`h-4 w-4 ${conf?.text ?? 'text-[#4B5563]'}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1F2937]">
                        <span className="font-semibold">{log.profiles?.full_name ?? 'Anonymous'}</span>
                        {' '}{conf?.label?.toLowerCase() ?? log.action}{' '}
                        <span className="text-[#4B5563] truncate">
                          {titleMap[log.target_id] ?? log.target_id.slice(0, 8) + '…'}
                        </span>
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {log.target_type === 'knowledge_entry' ? 'Knowledge Entry' : 'Research Listing'}
                      </p>
                    </div>
                    <span className="text-xs text-[#9CA3AF] shrink-0">{formatDate(log.created_at)}</span>
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
