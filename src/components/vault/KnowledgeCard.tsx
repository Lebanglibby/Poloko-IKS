'use client'

import {
  MapPin, CheckCircle2, Clock, Tag, Leaf, ArrowRight, Shield,
} from 'lucide-react'
import { AccessTierBadge } from './AccessTierBadge'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { KnowledgeEntry } from '@/lib/types'

/* ─── Category colours — warm earth tones ───────────────────────────────────── */
const CAT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  traditional_practice: { bg: 'bg-orange-50',  text: 'text-orange-800',  border: 'border-orange-200' },
  flora_medicinal:      { bg: 'bg-green-50',   text: 'text-green-800',   border: 'border-green-200'  },
  conservation:         { bg: 'bg-teal-50',    text: 'text-teal-800',    border: 'border-teal-200'   },
  cultural_narrative:   { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200'  },
  resource_location:    { bg: 'bg-blue-50',    text: 'text-blue-800',    border: 'border-blue-200'   },
}

interface Props {
  entry: KnowledgeEntry
  onSelect?: (entry: KnowledgeEntry) => void
  selected?: boolean
}

export function KnowledgeCard({ entry, onSelect, selected = false }: Props) {
  const cat = CAT_STYLES[entry.category] ?? { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' }
  const isRestricted = entry.access_tier === 'restricted'
  const isSacred     = entry.access_tier === 'sacred'

  function handleClick() { onSelect?.(entry) }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(entry) }
  }

  return (
    <article
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`${entry.title} — ${KNOWLEDGE_CATEGORY_LABELS[entry.category]}`}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden card-lift',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#9A3412] focus-visible:ring-offset-2',
        onSelect ? 'cursor-pointer' : 'cursor-default',
        selected
          ? 'border-[#9A3412] shadow-md shadow-[#9A3412]/10 ring-2 ring-[#9A3412]/20'
          : isSacred
          ? 'border-[#FECACA] hover:border-[#FCA5A5]'
          : isRestricted
          ? 'border-[#FDE68A] hover:border-[#FCD34D]'
          : 'border-[#E8DDD0] hover:border-[#D4C4B0]'
      )}
    >
      {/* Colour-coded top strip */}
      <div
        className={cn(
          'h-1.5 w-full',
          selected      ? 'bg-[#9A3412]' :
          isSacred      ? 'bg-[#B91C1C]' :
          isRestricted  ? 'bg-[#B45309]' :
          entry.verified ? 'bg-[#15803D]' : 'bg-[#D4C4B0]'
        )}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-3">
          {/* Category icon */}
          <div
            className={cn(
              'mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border',
              cat.bg, cat.border
            )}
            aria-hidden="true"
          >
            <Leaf className={cn('h-5 w-5', cat.text)} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-bold text-base leading-snug transition-colors',
              selected ? 'text-[#9A3412]' : 'text-[#1F2937] group-hover:text-[#9A3412]'
            )}>
              {truncate(entry.title, 60)}
            </h3>
            {entry.profiles?.full_name && (
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                {entry.profiles.full_name}
                {entry.profiles.community && ` · ${entry.profiles.community}`}
              </p>
            )}
          </div>
        </div>

        {/* ── Description ──────────────────────────────────────────────── */}
        {entry.description && (
          <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2 mb-4 pl-[52px]">
            {entry.description}
          </p>
        )}

        {/* ── Access tier badge ─────────────────────────────────────────── */}
        <div className="pl-[52px] mb-3">
          <AccessTierBadge tier={entry.access_tier} variant="badge" />
        </div>

        {/* ── Meta row ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm border-t border-[#F3F0EB] pt-3">
          {/* Category chip */}
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', cat.bg, cat.text, cat.border)}>
            {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
          </span>

          {/* Verification */}
          {entry.verified ? (
            <span className="flex items-center gap-1 text-[#15803D] text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#B45309] text-xs font-medium">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Awaiting verification
            </span>
          )}

          {/* Geo-tag */}
          {entry.latitude && entry.longitude && (
            <span className="flex items-center gap-1 text-[#9CA3AF] text-xs">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Location recorded
            </span>
          )}

          <span className="ml-auto text-xs text-[#9CA3AF]">
            {formatRelativeDate(entry.created_at)}
          </span>
        </div>

        {/* ── Tags ─────────────────────────────────────────────────────── */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pl-[52px]" aria-label="Tags">
            {entry.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2 py-0.5 rounded-full"
              >
                <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="text-xs text-[#9CA3AF]">+{entry.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* ── Protected record footer ───────────────────────────────────── */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F3F0EB]">
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Shield className="h-3.5 w-3.5 text-[#D4C4B0]" aria-hidden="true" />
            <span>Protected Heritage Record</span>
          </div>
          {onSelect && (
            <span className={cn(
              'flex items-center gap-1 text-xs font-semibold transition-colors',
              selected ? 'text-[#9A3412]' : 'text-[#9CA3AF] group-hover:text-[#9A3412]'
            )}>
              View details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
