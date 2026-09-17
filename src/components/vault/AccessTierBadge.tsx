import { cn } from '@/lib/utils'
import type { AccessTier } from '@/lib/types'
import { Shield, Lock, Globe } from 'lucide-react'

/* ─── Tier visual config ─────────────────────────────────────────────────────── */
const TIER_CONFIG = {
  public: {
    label: 'Public',
    icon: Globe,
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot:   'bg-emerald-400',
    glow:  'shadow-emerald-500/10',
  },
  restricted: {
    label: 'Restricted',
    icon: Lock,
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dot:   'bg-amber-400',
    glow:  'shadow-amber-500/10',
  },
  sacred: {
    label: 'Sacred',
    icon: Shield,
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    dot:   'bg-red-400',
    glow:  'shadow-red-500/10',
  },
} as const

interface Props {
  tier: AccessTier
  /** 'badge' (default): compact pill with icon
   *  'indicator': dot + label, for sidebars / detail views
   *  'banner': full-width warning bar */
  variant?: 'badge' | 'indicator' | 'banner'
  className?: string
}

export function AccessTierBadge({ tier, variant = 'badge', className }: Props) {
  const conf = TIER_CONFIG[tier]
  const Icon = conf.icon

  if (variant === 'indicator') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
        <span
          className={cn('h-1.5 w-1.5 rounded-full', conf.dot)}
          aria-hidden="true"
        />
        <span className={cn(
          tier === 'public'     ? 'text-emerald-400' :
          tier === 'restricted' ? 'text-amber-400' :
          'text-red-400'
        )}>
          {conf.label}
        </span>
      </span>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        role="status"
        aria-label={`Access tier: ${conf.label}`}
        className={cn(
          'w-full flex items-start gap-3 rounded-xl border px-4 py-3',
          tier === 'public'
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : tier === 'restricted'
            ? 'border-amber-500/20 bg-amber-500/5'
            : 'border-red-500/20 bg-red-500/5',
          className
        )}
      >
        <Icon
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            tier === 'public' ? 'text-emerald-400' :
            tier === 'restricted' ? 'text-amber-400' :
            'text-red-400'
          )}
          aria-hidden="true"
        />
        <div>
          <p className={cn(
            'text-sm font-semibold',
            tier === 'public' ? 'text-emerald-300' :
            tier === 'restricted' ? 'text-amber-300' :
            'text-red-300'
          )}>
            {tier === 'public' && 'Public Access'}
            {tier === 'restricted' && 'Restricted — Apply for Access'}
            {tier === 'sacred' && 'Sacred — Elder Board Approval Required'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {tier === 'public' && 'This entry is freely viewable and downloadable by anyone.'}
            {tier === 'restricted' && 'Verified researchers and community members may request access with justification.'}
            {tier === 'sacred' && 'This knowledge is protected under community sovereignty. Elder Board approval is mandatory before access is granted.'}
          </p>
        </div>
      </div>
    )
  }

  /* default: badge */
  return (
    <span
      role="status"
      aria-label={`Access tier: ${conf.label}`}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border shadow-sm',
        conf.badge,
        conf.glow,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {conf.label}
    </span>
  )
}
