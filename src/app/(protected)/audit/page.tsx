import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { formatDate } from '@/lib/utils'
import {
  Eye, Download, FileText, Code2, Upload,
  CheckCircle2, BarChart3, FlaskConical,
} from 'lucide-react'
import Link from 'next/link'

/* ─── Action config — uses warm and semantic colours, no default Tailwind blue ── */
const ACTION_CONFIG = {
  view:       { icon: Eye,          label: 'Viewed',     bg: '#F0F7F4',   text: '#40916C'  },
  download:   { icon: Download,     label: 'Downloaded', bg: '#F0FDF4',   text: '#15803D'  },
  cite:       { icon: FileText,     label: 'Cited',      bg: '#F5F0E8',   text: '#6B5344'  },
  api_access: { icon: Code2,        label: 'API Access', bg: '#FFFBEB',   text: '#B45309'  },
  submit:     { icon: Upload,       label: 'Submitted',  bg: '#F3F0EB',   text: '#4B5563'  },
  verify:     { icon: CheckCircle2, label: 'Verified',   bg: '#F0FDF4',   text: '#15803D'  },
}

/* ─── Stat card config ────────────────────────────────────────────────────────── */
const STAT_CARDS = [
  { key: 'total',      label: 'Total Events', bg: '#F3F0EB',   border: '#E5D8C8', icon: BarChart3,   iconColor: '#6B5344'  },
  { key: 'views',      label: 'Views',        bg: '#F0F7F4',   border: '#95D5B2', icon: Eye,          iconColor: '#40916C'  },
  { key: 'downloads',  label: 'Downloads',    bg: '#F0FDF4',   border: '#BBF7D0', icon: Download,     iconColor: '#15803D'  },
  { key: 'api_access', label: 'API Accesses', bg: '#FFFBEB',   border: '#FDE68A', icon: FlaskConical, iconColor: '#B45309'  },
] as const

export default async function AuditPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const [{ data: myEntryIds }, { data: myListingIds }] = await Promise.all([
    supabase.from('knowledge_entries').select('id, title').eq('submitted_by', user.id),
    supabase.from('research_listings').select('id, title').eq('author_id',   user.id),
  ])

  const ownedIds = [
    ...(myEntryIds?.map(r => r.id)  ?? []),
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
    views:      logs?.filter(l => l.action === 'view').length       ?? 0,
    downloads:  logs?.filter(l => l.action === 'download').length   ?? 0,
    api_access: logs?.filter(l => l.action === 'api_access').length ?? 0,
  }

  const titleMap: Record<string, string> = {}
  myEntryIds?.forEach(e  => { titleMap[e.id] = e.title })
  myListingIds?.forEach(l => { titleMap[l.id] = l.title })

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <li><Link href="/dashboard" className="hover:text-[#2D6A4F] transition-colors font-medium">Dashboard</Link></li>
            <li aria-hidden="true">/</li>
            <li><span className="text-[#4B5563] font-semibold" aria-current="page">Attribution Log</span></li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
            style={{ background: 'linear-gradient(135deg, #F0F7F4, #E8F5EE)', borderColor: '#95D5B2' }}
            aria-hidden="true"
          >
            <BarChart3 className="h-6 w-6 text-[#2D6A4F]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">Attribution &amp; Usage Log</h1>
            <p className="text-xs text-[#9C8070] font-semibold mt-0.5">
              Track who views, downloads, and cites your content
            </p>
          </div>
        </div>
        <p className="text-sm text-[#4B5563] mb-7 leading-relaxed max-w-xl">
          Every interaction with your knowledge entries and research listings is recorded here
          with full attribution details — your immutable proof of intellectual impact.
        </p>

        {/* ── Stats grid ─────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          role="list"
          aria-label="Usage summary"
        >
          {STAT_CARDS.map(({ key, label, bg, border, icon: Icon, iconColor }) => (
            <div
              key={key}
              role="listitem"
              className="r-stat-card rounded-2xl p-5 border"
              style={{ background: bg, borderColor: border }}
              aria-label={`${label}: ${stats[key as keyof typeof stats].toLocaleString()}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">
                {stats[key as keyof typeof stats].toLocaleString()}
              </div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Activity log ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-sm">

          {/* Header */}
          <div className="px-5 py-4 border-b border-[#F3F0EB] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1F2937]">Recent Activity</h2>
            <span className="text-xs text-[#9CA3AF]">Last {Math.min(logs?.length ?? 0, 100)} events</span>
          </div>

          {!logs || logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-[#F0F7F4] border border-[#D8F3E3] flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <BarChart3 className="h-8 w-8 text-[#95D5B2]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563]">No activity recorded yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs mx-auto">
                Once others view, download, or cite your content, every interaction will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F0EB]">
              {logs.map(log => {
                const conf = ACTION_CONFIG[log.action as keyof typeof ACTION_CONFIG]
                const Icon = conf?.icon ?? Eye
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#FDFBF7] transition-colors"
                  >
                    {/* Action icon */}
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: conf?.bg ?? '#F3F0EB' }}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" style={{ color: conf?.text ?? '#4B5563' }} />
                    </div>

                    {/* Event description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1F2937]">
                        <span className="font-semibold">
                          {log.profiles?.full_name ?? 'Anonymous'}
                        </span>
                        {' '}
                        <span className="text-[#6B5344]">
                          {conf?.label?.toLowerCase() ?? log.action}
                        </span>
                        {' '}
                        <span className="text-[#4B5563] truncate">
                          {titleMap[log.target_id]
                            ? <em className="not-italic font-medium">{titleMap[log.target_id]}</em>
                            : <span className="font-mono text-xs">{log.target_id.slice(0, 8)}…</span>
                          }
                        </span>
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {log.target_type === 'knowledge_entry' ? 'Knowledge Entry' : 'Research Listing'}
                      </p>
                    </div>

                    {/* Date */}
                    <time
                      dateTime={log.created_at}
                      className="text-xs text-[#9CA3AF] shrink-0"
                    >
                      {formatDate(log.created_at)}
                    </time>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tip: logs limited to 100 */}
        {logs && logs.length === 100 && (
          <p className="text-xs text-center text-[#9CA3AF] mt-4">
            Showing the 100 most recent events. Export coming soon.
          </p>
        )}
      </main>
    </div>
  )
}
