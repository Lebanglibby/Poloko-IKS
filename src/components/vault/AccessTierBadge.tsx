import { cn } from '@/lib/utils'
import { ACCESS_TIER_LABELS, ACCESS_TIER_COLORS } from '@/lib/constants'
import type { AccessTier } from '@/lib/types'
import { Shield, Lock, Globe } from 'lucide-react'

const ICONS = {
  public: Globe,
  restricted: Lock,
  sacred: Shield,
}

interface Props {
  tier: AccessTier
  className?: string
}

export function AccessTierBadge({ tier, className }: Props) {
  const Icon = ICONS[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        ACCESS_TIER_COLORS[tier],
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {ACCESS_TIER_LABELS[tier]}
    </span>
  )
}
