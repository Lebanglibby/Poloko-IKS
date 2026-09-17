'use client'

import {
  MapPin, CheckCircle2, Clock, Tag, ArrowRight, Shield,
  Leaf, Sprout, TreePine, ScrollText, Globe,
} from 'lucide-react'
import { AccessTierBadge } from './AccessTierBadge'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { KnowledgeEntry } from '@/lib/types'

/* ─── Per-category visual style ─────────────────────────────────────────────── */
const CAT_CONFIG: Record<string, {
  bg: string; text: string; border: string
  Icon: typeof Leaf
  iconBg: string; iconColor: string
}> = {
  traditional_practice: {
    bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200',
    Icon: ScrollText,
    iconBg: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-700',
  },
  flora_medicinal: {
    bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200',
    Icon: Sprout,
    iconBg: 'bg-green-50 border-green-200', iconColor: 'text-green-700',
  },
  conservation: {
    bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200',
    Icon: TreePine,
    iconBg: 'bg-teal-50 border-teal-200', iconColor: 'text-teal-700',
  },
  cultural_narrative: {
    bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
    Icon: ScrollText,
    iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-700',
  },
  resource_location: {
    bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200',
    Icon: Globe,
    iconBg: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-700',
  },
}

const DEFAULT_CAT = {
  bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200',
  Icon: Leaf,
  iconBg: 'bg-stone-50 border-stone-200', iconColor: 'text-stone-500',
}

function tierStripClass(tier: string, verified: boolean, selected: boolean) {
  if (selected)              return 'bg-[#8B2500]'
  if (tier === 'sacred')     return 'bg-[#B91C1C]'
  if (tier === 'restricted') return 'bg-[#B45309]'
  if (verified)              return 'bg-[#15803D]'
  return 'bg-[#D4C4B0]'
}

interface Props {
  entry: KnowledgeEntry
  onSelect?: (entry: KnowledgeEntry) => void
  selected?: boolean
}

export function KnowledgeCard({ entry, onSelect, selected = false }: Props) {
  const cat     = CAT_CONFIG[entry.category] ?? DEFAULT_CAT
  const CatIcon = cat.Icon

  const isRestricted = entry.access_tier === 'restricted'
  const isSacred     = entry.access_tier === 'sacred'

  const ariaLabel = [
    entry.title,
    KNOWLEDGE_CATEGORY_LABELS[entry.category] ?? entry.category,
    entry.verified ? 'Community verified' : 'Awaiting verification',
    isSacred     ? 'Sacred — Elder Board protected' :
    isRestricted ? 'Restricted access' :
                   'Publicly accessible',
    entry.profiles?.community ? `From ${entry.profiles.community}` : '',
  ].filter(Boolean).join('. ')

  function handleClick()  { onSelect?.(entry) }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(entry) }
  }

  return (
    <article
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden card-lift',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#8B2500] focus-visible:ring-offset-2',
        onSelect ? 'cursor-pointer' : 'cursor-default',
        selected
          ? 'border-[#8B2500] shadow-md shadow-[#8B2500]/10 ring-2 ring-[#8B2500]/20'
          : isSacred
          ? 'border-[#FECACA] hover:border-[#FCA5A5]'
          : isRestricted
          ? 'border-[#FDE68A] hover:border-[#FCD34D]'
          : 'border-[#E8DDD0] hover:border-[#D4C4B0]'
      )}
    >
      <div className={cn('h-1.5 w-full', tierStripClass(entry.access_tier, entry.verified, selected))} aria-hidden="true" />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border', cat.iconBg)} aria-hidden="true">
            <CatIcon className={cn('h-5 w-5', cat.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-bold text-base leading-snug transition-colors', selected ? 'text-[#8B2500]' : 'text-[#1F2937] group-hover:text-[#8B2500]')}>
              {truncate(entry.title, 60)}
            </h3>
            {entry.profiles?.full_name && (
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                <span className="sr-only">Submitted by </span>
                {entry.profiles.full_name}
                {entry.profiles.community && (
                  <><span aria-hidden="true"> · </span><span className="sr-only">, from </span>{entry.profiles.community}</>
                )}
              </p>
            )}
          </div>
        </div>

        {entry.description && (
          <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2 mb-4 pl-[52px]">
            {entry.description}
          </p>
        )}

        <div className="pl-[52px] mb-3">
          <AccessTierBadge tier={entry.access_tier} variant="badge" />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm border-t border-[#F3F0EB] pt-3">
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', cat.bg, cat.text, cat.border)} aria-label={`Category: ${KNOWLEDGE_CATEGORY_LABELS[entry.category]}`}>
            {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
          </span>
          {entry.verified ? (
            <span className="flex items-center gap-1 text-[#15803D] text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /><span>Verified</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#B45309] text-xs font-medium">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /><span>Awaiting verification</span>
            </span>
          )}
          {entry.latitude && entry.longitude && (
            <span className="flex items-center gap-1 text-[#9CA3AF] text-xs" aria-label="Has location recorded">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /><span aria-hidden="true">Location recorded</span>
            </span>
          )}
          <span className="ml-auto text-xs text-[#9CA3AF]" aria-label={`Added ${formatRelativeDate(entry.created_at)}`}>
            <span aria-hidden="true">{formatRelativeDate(entry.created_at)}</span>
          </span>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pl-[52px]" aria-label="Tags">
            {entry.tags.slice(0, 4).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2 py-0.5 rounded-full">
                <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />{tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="text-xs text-[#9CA3AF]" aria-label={`${entry.tags.length - 4} more tags`}>+{entry.tags.length - 4} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F3F0EB]">
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Shield className="h-3.5 w-3.5 text-[#D4C4B0]" aria-hidden="true" />
            <span>Protected Heritage Record</span>
          </div>
          {onSelect && (
            <span className={cn('flex items-center gap-1 text-xs font-semibold transition-colors', selected ? 'text-[#8B2500]' : 'text-[#9CA3AF] group-hover:text-[#8B2500]')} aria-hidden="true">
              View details<ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
