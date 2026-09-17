import { Eye, Download, FileText, Code2, Upload, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { AuditLog } from '@/lib/types'

const ACTION_CONFIG = {
  view: { icon: Eye, label: 'Viewed', color: 'text-blue-600 bg-blue-50' },
  download: { icon: Download, label: 'Downloaded', color: 'text-green-600 bg-green-50' },
  cite: { icon: FileText, label: 'Cited', color: 'text-purple-600 bg-purple-50' },
  api_access: { icon: Code2, label: 'API Access', color: 'text-amber-600 bg-amber-50' },
  submit: { icon: Upload, label: 'Submitted', color: 'text-gray-600 bg-gray-50' },
  verify: { icon: CheckCircle2, label: 'Verified', color: 'text-emerald-600 bg-emerald-50' },
}

interface Props {
  logs: AuditLog[]
  titleMap?: Record<string, string>
}

export function AuditLogTable({ logs, titleMap = {} }: Props) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No activity recorded yet.
      </div>
    )
  }

  return (
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
                <span className="text-gray-600">
                  {titleMap[log.target_id] ?? log.target_id.slice(0, 8) + '…'}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {log.target_type === 'knowledge_entry' ? 'Knowledge Entry' : 'Research Listing'}
              </p>
            </div>

            <span className="text-xs text-gray-400 shrink-0">{formatDate(log.created_at)}</span>
          </div>
        )
      })}
    </div>
  )
}
