import { cn } from '@/lib/utils'
import type { AccessTier } from '@/lib/types'
import { Globe, Lock, Shield, CheckCircle2 } from 'lucide-react'

/* ─── Tier config — plain language, warm colours ─────────────────────────────── */
const TIER_CONFIG = {
  public: {
    shortLabel:  'Public',
    longLabel:   'Public — Free Access',
    description: 'This knowledge is freely available to everyone.',
    icon:        Globe,
    badge:       'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    banner:      'bg-[#F0FDF4] border-[#BBF7D0]',
    bannerText:  'text-[#14532D]',
    bannerDesc:  'text-[#15803D]',
    dot:         'bg-[#15803D]',
    iconColor:   'text-[#15803D]',
  },
  restricted: {
    shortLabel:  'Restricted',
    longLabel:   'Restricted — Researcher Access',
    description: 'Verified researchers and community members may apply to view this entry.',
    icon:        Lock,
    badge:       'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    banner:      'bg-[#FFFBEB] border-[#FDE68A]',
    bannerText:  'text-[#78350F]',
    bannerDesc:  'text-[#B45309]',
    dot:         'bg-[#B45309]',
    iconColor:   'text-[#B45309]',
  },
  sacred: {
    shortLabel:  'Sacred',
    longLabel:   'Sacred — Community Protected',
    description: 'This knowledge is protected under community sovereignty. Elder Board approval is required before access is granted.',
    icon:        Shield,
    badge:       'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    banner:      'bg-[#FEF2F2] border-[#FECACA]',
    bannerText:  'text-[#7F1D1D]',
    bannerDesc:  'text-[#B91C1C]',
    dot:         'bg-[#B91C1C]',
    iconColor:   'text-[#B91C1C]',
  },
} as const

interface Props {
  tier: AccessTier
  /** 'badge'      — compact inline pill (default)
   *  'indicator'  — dot + short label
   *  'banner'     — full-width info box with description */
  variant?: 'badge' | 'indicator' | 'banner'
  className?: string
}

export function AccessTierBadge({ tier, variant = 'badge', className }: Props) {
  const conf = TIER_CONFIG[tier]
  const Icon = conf.icon

  if (variant === 'indicator') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', className)}>
        <span className={cn('h-2 w-2 rounded-full shrink-0', conf.dot)} aria-hidden="true" />
        <span className={conf.iconColor}>{conf.shortLabel}</span>
      </span>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        role="status"
        aria-label={`Access level: ${conf.longLabel}`}
        className={cn(
          'w-full flex items-start gap-3 rounded-2xl border px-4 py-4',
          conf.banner,
          className
        )}
      >
        <div className={cn(
          'mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          tier === 'public'     ? 'bg-[#DCFCE7]' :
          tier === 'restricted' ? 'bg-[#FEF3C7]' : 'bg-[#FEE2E2]'
        )}>
          <Icon className={cn('h-4 w-4', conf.iconColor)} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className={cn('text-sm font-bold leading-tight', conf.bannerText)}>
            {tier === 'public'     && '✓ Public Record — Free Access'}
            {tier === 'restricted' && 'Restricted — Apply for Researcher Access'}
            {tier === 'sacred'     && 'Sacred Heritage — Elder Board Approval Required'}
          </p>
          <p className={cn('text-sm mt-1 leading-relaxed', conf.bannerDesc)}>
            {conf.description}
          </p>
        </div>
      </div>
    )
  }

  /* default: badge */
  return (
    <span
      role="status"
      aria-label={`Access level: ${conf.longLabel}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        conf.badge,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {conf.longLabel}
    </span>
  )
}

/* ─── Verified badge (separate, reusable) ────────────────────────────────────── */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
        className
      )}
      aria-label="Community verified record"
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      Verified Record
    </span>
  )
}
