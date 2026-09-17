'use client'

import { Eye, Download, Users, Tag, FlaskConical, ArrowRight, Zap } from 'lucide-react'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { ResearchListing } from '@/lib/types'
import { cn } from '@/lib/utils'

/* ─── Status badge config — sage green system ───────────────────────────────── */
const STATUS_CONFIG = {
  published: {
    label: 'Published',
    badge: 'bg-[#F0F7F4] text-[#2D6A4F] border-[#95D5B2]',
    dot:   'bg-[#2D6A4F]',
  },
  draft: {
    label: 'Draft',
    badge: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
    dot:   'bg-[#9CA3AF]',
  },
  open_for_collaboration: {
    label: 'Open for Collaboration',
    badge: 'bg-[#F0FAFA] text-[#0D7377] border-[#7FCFD2]',
    dot:   'bg-[#0D7377]',
  },
} as const

interface Props {
  listing: ResearchListing
  selected?: boolean
  onSelect?: (listing: ResearchListing) => void
}

export function ResearchCard({ listing, selected = false, onSelect }: Props) {
  const status  = STATUS_CONFIG[listing.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.published
  const isCollab = listing.status === 'open_for_collaboration'

  /* Composite aria-label for screen readers */
  const ariaLabel = [
    listing.title,
    status.label,
    listing.price === 0 ? 'Free' : `BWP ${listing.price.toFixed(2)}`,
    listing.profiles?.community ? `by ${listing.profiles.full_name} from ${listing.profiles.community}` : listing.profiles?.full_name ? `by ${listing.profiles.full_name}` : '',
  ].filter(Boolean).join('. ')

  function handleClick()  { onSelect?.(listing) }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(listing) }
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
        'group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden r-card-lift',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2',
        onSelect ? 'cursor-pointer' : 'cursor-default',
        selected
          ? 'border-[#2D6A4F] shadow-md shadow-[#2D6A4F]/10 ring-2 ring-[#2D6A4F]/15'
          : isCollab
          ? 'border-[#7FCFD2] hover:border-[#0D7377]'
          : 'border-[#E8DDD0] hover:border-[#95D5B2]'
      )}
    >
      {/* Colour-coded top strip */}
      <div
        className={cn(
          'h-1.5 w-full',
          selected   ? 'bg-[#2D6A4F]' :
          isCollab   ? 'bg-[#0D7377]' :
          listing.status === 'draft' ? 'bg-[#D4C4B0]' :
          'bg-[#40916C]'
        )}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className={cn(
              'mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border transition-colors',
              selected
                ? 'bg-[#F0F7F4] border-[#95D5B2] text-[#2D6A4F]'
                : isCollab
                ? 'bg-[#F0FAFA] border-[#7FCFD2] text-[#0D7377]'
                : 'bg-[#F5F8F6] border-[#E8DDD0] text-[#9CA3AF] group-hover:border-[#95D5B2] group-hover:text-[#40916C]'
            )}
            aria-hidden="true"
          >
            <FlaskConical className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-bold text-base leading-snug transition-colors',
              selected ? 'text-[#2D6A4F]' : 'text-[#1F2937] group-hover:text-[#2D6A4F]'
            )}>
              {truncate(listing.title, 68)}
            </h3>
            {listing.profiles?.full_name && (
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                <span className="sr-only">By </span>
                {listing.profiles.full_name}
                {listing.profiles.community && (
                  <><span aria-hidden="true"> · </span>{listing.profiles.community}</>
                )}
              </p>
            )}
          </div>

          {/* Status badge */}
          <span className={cn('shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', status.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {/* ── Abstract ────────────────────────────────────────────── */}
        {listing.abstract && (
          <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2 mb-4 pl-[52px]">
            {listing.abstract}
          </p>
        )}

        {/* ── License + price ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 pl-[52px]">
          {listing.license_type ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5F8F6] text-[#40916C] border border-[#95D5B2] text-xs font-medium">
              {LICENSE_TYPE_LABELS[listing.license_type]}
            </span>
          ) : (
            <span className="text-xs text-[#9CA3AF] italic">No license set</span>
          )}

          <span
            className={cn('text-base font-bold', listing.price === 0 ? 'text-[#2D6A4F]' : 'text-[#1F2937]')}
            aria-label={listing.price === 0 ? 'Free' : `BWP ${listing.price.toFixed(2)}`}
          >
            {listing.price === 0
              ? <span className="flex items-center gap-1"><Zap className="h-4 w-4" aria-hidden="true" />Free</span>
              : `BWP ${listing.price.toFixed(2)}`
            }
          </span>
        </div>

        {/* ── Stats + date ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] border-t border-[#F3F0EB] pt-3">
          <span className="flex items-center gap-1" aria-label={`${listing.view_count.toLocaleString()} views`}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {listing.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" aria-label={`${listing.download_count.toLocaleString()} downloads`}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {listing.download_count.toLocaleString()}
          </span>
          {listing.collaborators && listing.collaborators.length > 0 && (
            <span className="flex items-center gap-1" aria-label={`${listing.collaborators.length} contributors`}>
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {listing.collaborators.length}
            </span>
          )}
          <span className="ml-auto">{formatRelativeDate(listing.created_at)}</span>
          {onSelect && (
            <span className={cn(
              'flex items-center gap-0.5 font-semibold transition-colors',
              selected ? 'text-[#2D6A4F]' : 'text-[#D4C4B0] group-hover:text-[#2D6A4F]'
            )} aria-hidden="true">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* ── Tags ─────────────────────────────────────────────────── */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
            {listing.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2 py-0.5 rounded-full">
                <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />{tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span className="text-xs text-[#9CA3AF] self-center" aria-label={`${listing.tags.length - 3} more tags`}>
                +{listing.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
