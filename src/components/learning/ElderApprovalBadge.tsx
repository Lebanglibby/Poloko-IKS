import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'

interface Props {
  size?: 'compact' | 'full'
  className?: string
}

export function ElderApprovalBadge({ size = 'compact', className }: Props) {
  if (size === 'full') {
    return (
      <div
        className={cn('flex items-center gap-3 rounded-2xl border-2 p-4 elder-badge-pulse', className)}
        style={{ background: 'var(--l-elder-bg)', borderColor: 'var(--l-elder-border)' }}
        role="status"
        aria-label="This course has been reviewed and approved by the Elder Board"
      >
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#BBF7D0', border: '1px solid var(--l-elder-border)' }}
          aria-hidden="true"
        >
          <ShieldCheck className="h-5 w-5" style={{ color: 'var(--l-elder)' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--l-elder)' }}>
            Elder Board Approved
          </p>
          <p className="text-xs mt-0.5 leading-snug" style={{ color: '#166534' }}>
            Reviewed for cultural accuracy and community appropriateness
          </p>
        </div>
      </div>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', className)}
      style={{ background: 'var(--l-elder-bg)', color: 'var(--l-elder)', borderColor: 'var(--l-elder-border)' }}
      role="status"
      aria-label="Elder Board approved"
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Elder Approved
    </span>
  )
}
