'use client'

import { Eye, Download, Users, Tag, FlaskConical, ArrowRight, Zap } from 'lucide-react'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { ResearchListing } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  published:              { label: 'Published',               badge: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]', dot: 'bg-[#15803D]' },
  draft:                  { label: 'Draft',                   badge: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]', dot: 'bg-[#9CA3AF]' },
  open_for_collaboration: { label: 'Open for Collaboration',  badge: 'bg-blue-50    text-blue-700  border-blue-200',  dot: 'bg-blue-500'  },
} as const

interface Props {
  listing: ResearchListing
  selected?: boolean
  onSelect?: (listing: ResearchListing) => void
}

export function ResearchCard({ listing, selected = false, onSelect }: Props) {
  const status = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.published
  const isCollab = listing.status === 'open_for_collaboration'

  function handleClick() { onSelect?.(listing) }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(listing) }
  }

  return (
    <article
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`Research: ${listing.title}`}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden card-lift',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#9A3412] focus-visible:ring-offset-2',
        onSelect ? 'cursor-pointer' : 'cursor-default',
        selected
          ? 'border-[#9A3412] shadow-md shadow-[#9A3412]/10 ring-2 ring-[#9A3412]/20'
          : isCollab
          ? 'border-blue-200 hover:border-blue-300'
          : 'border-[#E8DDD0] hover:border-[#D4C4B0]'
      )}
    >
      {/* Top accent strip */}
      <div className={cn('h-1.5 w-full', selected ? 'bg-[#9A3412]' : isCollab ? 'bg-blue-500' : 'bg-[#D4C4B0]')} aria-hidden="true" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            'mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border',
            selected     ? 'bg-[#FEF2E8] border-[#FDBA74] text-[#9A3412]' :
            isCollab     ? 'bg-blue-50 border-blue-200 text-blue-600' :
            'bg-[#FEF9F0] border-[#E8DDD0] text-[#9CA3AF] group-hover:border-[#FDBA74] group-hover:text-[#9A3412]'
          )} aria-hidden="true">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-bold text-base leading-snug transition-colors', selected ? 'text-[#9A3412]' : 'text-[#1F2937] group-hover:text-[#9A3412]')}>
              {truncate(listing.title, 68)}
            </h3>
            {listing.profiles?.full_name && (
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                {listing.profiles.full_name}
                {listing.profiles.community && ` · ${listing.profiles.community}`}
              </p>
            )}
          </div>
          <span className={cn('shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', status.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {/* Abstract */}
        {listing.abstract && (
          <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-2 mb-4 pl-[52px]">
            {listing.abstract}
          </p>
        )}

        {/* License + price */}
        <div className="flex items-center justify-between mb-3 pl-[52px]">
          {listing.license_type ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-xs font-medium">
              {LICENSE_TYPE_LABELS[listing.license_type]}
            </span>
          ) : (
            <span className="text-xs text-[#9CA3AF] italic">No license set</span>
          )}
          <span className={cn('text-base font-bold', listing.price === 0 ? 'text-[#15803D]' : 'text-[#1F2937]')}
            aria-label={listing.price === 0 ? 'Free' : `BWP ${listing.price.toFixed(2)}`}>
            {listing.price === 0
              ? <span className="flex items-center gap-1"><Zap className="h-4 w-4" aria-hidden="true" />Free</span>
              : `BWP ${listing.price.toFixed(2)}`
            }
          </span>
        </div>

        {/* Stats + date */}
        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] border-t border-[#F3F0EB] pt-3">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" aria-hidden="true" />{listing.view_count.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" aria-hidden="true" />{listing.download_count.toLocaleString()}</span>
          {listing.collaborators && listing.collaborators.length > 0 && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden="true" />{listing.collaborators.length}</span>
          )}
          <span className="ml-auto">{formatRelativeDate(listing.created_at)}</span>
          {onSelect && (
            <span className={cn('flex items-center gap-0.5 font-semibold transition-colors', selected ? 'text-[#9A3412]' : 'text-[#D4C4B0] group-hover:text-[#9A3412]')}>
              Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
            {listing.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2 py-0.5 rounded-full">
                <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />{tag}
              </span>
            ))}
            {listing.tags.length > 3 && <span className="text-xs text-[#9CA3AF] self-center">+{listing.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </article>
  )
}
