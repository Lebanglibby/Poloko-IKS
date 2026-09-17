'use client'

import { Eye, Download, Users, Tag, FlaskConical, ArrowUpRight, Zap } from 'lucide-react'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { ResearchListing } from '@/lib/types'
import { cn } from '@/lib/utils'

/* ─── Status config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  published: {
    label: 'Published',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
    dot: 'bg-slate-400',
  },
  open_for_collaboration: {
    label: 'Open for Collaboration',
    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    dot: 'bg-blue-400',
  },
} as const

interface Props {
  listing: ResearchListing
  /** When true, renders as a clickable card (link-style).
   *  When false (split-screen list), fires onSelect instead. */
  selected?: boolean
  onSelect?: (listing: ResearchListing) => void
}

export function ResearchCard({ listing, selected = false, onSelect }: Props) {
  const status = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.published
  const isCollab = listing.status === 'open_for_collaboration'

  function handleClick() {
    onSelect?.(listing)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(listing)
    }
  }

  return (
    <article
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`Research listing: ${listing.title}`}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        onSelect ? 'cursor-pointer select-none' : 'cursor-default',
        selected
          ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
          : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800',
        isCollab && !selected && 'hover:border-blue-500/30 hover:shadow-blue-500/5 hover:shadow-lg'
      )}
    >
      {/* Collab glow stripe */}
      {isCollab && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"
          aria-hidden="true"
        />
      )}

      {/* Selected indicator stripe */}
      {selected && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600"
          aria-hidden="true"
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-2.5">
        {/* Icon */}
        <div className={cn(
          'mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border',
          selected
            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
            : isCollab
            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
            : 'border-slate-700 bg-slate-700/50 text-slate-400 group-hover:border-slate-600 group-hover:text-slate-300'
        )}>
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-sm font-semibold leading-snug transition-colors',
            selected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-white'
          )}>
            {truncate(listing.title, 68)}
          </h3>
          {listing.profiles?.full_name && (
            <p className="text-xs text-slate-500 mt-0.5">
              {listing.profiles.full_name}
              {listing.profiles.community && (
                <span className="text-slate-600"> · {listing.profiles.community}</span>
              )}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span
          className={cn(
            'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
            status.classes
          )}
          aria-label={`Status: ${status.label}`}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
          {status.label}
        </span>
      </div>

      {/* ── Abstract ───────────────────────────────────────────────────────── */}
      {listing.abstract && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3 pl-11">
          {listing.abstract}
        </p>
      )}

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-700/50 my-3" aria-hidden="true" />

      {/* ── License + Price row ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {listing.license_type ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {LICENSE_TYPE_LABELS[listing.license_type]}
          </span>
        ) : (
          <span className="text-[10px] text-slate-600 italic">No license set</span>
        )}
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            listing.price === 0 ? 'text-emerald-400' : 'text-slate-100'
          )}
          aria-label={listing.price === 0 ? 'Free' : `BWP ${listing.price.toFixed(2)}`}
        >
          {listing.price === 0 ? (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" aria-hidden="true" />
              Free
            </span>
          ) : (
            `BWP ${listing.price.toFixed(2)}`
          )}
        </span>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" aria-hidden="true" />
          <span>{listing.view_count.toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" aria-hidden="true" />
          <span>{listing.download_count.toLocaleString()}</span>
        </span>
        {listing.collaborators && listing.collaborators.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>{listing.collaborators.length}</span>
          </span>
        )}
        <span className="ml-auto">{formatRelativeDate(listing.created_at)}</span>
        {onSelect && (
          <ArrowUpRight
            className={cn(
              'h-3 w-3 transition-all duration-200',
              selected ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* ── Tags ───────────────────────────────────────────────────────────── */}
      {listing.tags && listing.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3" aria-label="Tags">
          {listing.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-slate-700/60 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700"
            >
              <Tag className="h-2.5 w-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
          {listing.tags.length > 3 && (
            <span className="text-[10px] text-slate-600 self-center">
              +{listing.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
