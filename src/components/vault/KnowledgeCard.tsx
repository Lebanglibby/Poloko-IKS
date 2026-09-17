'use client'

import {
  MapPin, CheckCircle2, Clock, Tag, Leaf,
  ArrowUpRight, Shield,
} from 'lucide-react'
import { AccessTierBadge } from './AccessTierBadge'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { KnowledgeEntry } from '@/lib/types'

/* ─── Category icon colours ──────────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  traditional_practice: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  flora_medicinal:      { bg: 'bg-green-500/10   border-green-500/20',   text: 'text-green-400'   },
  conservation:         { bg: 'bg-teal-500/10    border-teal-500/20',    text: 'text-teal-400'    },
  cultural_narrative:   { bg: 'bg-amber-500/10   border-amber-500/20',   text: 'text-amber-400'   },
  resource_location:    { bg: 'bg-blue-500/10    border-blue-500/20',    text: 'text-blue-400'    },
}

interface Props {
  entry: KnowledgeEntry
  /** When provided, card acts as a button firing this callback instead of navigating */
  onSelect?: (entry: KnowledgeEntry) => void
  selected?: boolean
}

export function KnowledgeCard({ entry, onSelect, selected = false }: Props) {
  const catStyle = CATEGORY_STYLES[entry.category] ?? {
    bg: 'bg-slate-700/40 border-slate-700',
    text: 'text-slate-400',
  }

  function handleClick() { onSelect?.(entry) }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(entry) }
  }

  const isRestricted = entry.access_tier === 'restricted'
  const isSacred     = entry.access_tier === 'sacred'

  return (
    <article
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`Knowledge entry: ${entry.title}`}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        onSelect ? 'cursor-pointer select-none' : 'cursor-default',
        /* Selected */
        selected
          ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
          : isSacred
          /* Sacred — subtle red tint border on hover */
          ? 'border-slate-700/60 bg-slate-800/60 hover:border-red-500/25 hover:bg-red-500/3'
          : isRestricted
          ? 'border-slate-700/60 bg-slate-800/60 hover:border-amber-500/25 hover:bg-amber-500/3'
          : 'border-slate-700/60 bg-slate-800/60 hover:border-emerald-500/20 hover:bg-slate-800'
      )}
    >
      {/* Selected stripe */}
      {selected && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600"
          aria-hidden="true"
        />
      )}

      {/* Sacred / restricted left accent */}
      {!selected && isSacred && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-red-500 to-red-700 opacity-60"
          aria-hidden="true"
        />
      )}
      {!selected && isRestricted && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-amber-500 to-amber-700 opacity-60"
          aria-hidden="true"
        />
      )}

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-2.5">
        {/* Category icon badge */}
        <div
          className={cn(
            'mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border',
            selected
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              : catStyle.bg + ' ' + catStyle.text
          )}
          aria-hidden="true"
        >
          <Leaf className="h-3.5 w-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-sm font-semibold leading-snug transition-colors',
            selected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-white'
          )}>
            {truncate(entry.title, 65)}
          </h3>
          {entry.profiles?.full_name && (
            <p className="text-xs text-slate-500 mt-0.5">
              {entry.profiles.full_name}
              {entry.profiles.community && (
                <span className="text-slate-600"> · {entry.profiles.community}</span>
              )}
            </p>
          )}
        </div>

        {/* Access tier badge */}
        <AccessTierBadge tier={entry.access_tier} variant="badge" className="shrink-0" />
      </div>

      {/* ── Description ──────────────────────────────────────────────────── */}
      {entry.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3 pl-11">
          {entry.description}
        </p>
      )}

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-700/40 my-3" aria-hidden="true" />

      {/* ── Meta row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        {/* Category chip */}
        <span className={cn(
          'px-2 py-0.5 rounded-md border font-medium',
          catStyle.bg, catStyle.text
        )}>
          {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
        </span>

        {/* Verification status */}
        {entry.verified ? (
          <span className="flex items-center gap-1 text-emerald-400" aria-label="Community verified">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400" aria-label="Pending verification">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Pending
          </span>
        )}

        {/* Geo tag */}
        {entry.latitude && entry.longitude && (
          <span className="flex items-center gap-1 text-slate-500" aria-label="Geo-tagged location">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            Geo-tagged
          </span>
        )}

        <span className="ml-auto text-slate-600">{formatRelativeDate(entry.created_at)}</span>

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

      {/* ── Tags ─────────────────────────────────────────────────────────── */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3" aria-label="Tags">
          {entry.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-slate-700/60 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700"
            >
              <Tag className="h-2.5 w-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="text-[10px] text-slate-600 self-center">
              +{entry.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* ── SHA-256 footer (always visible, progressive disclosure) ──────── */}
      <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-2">
        <Shield className="h-3 w-3 text-slate-600 shrink-0" aria-hidden="true" />
        <span className="text-[10px] font-mono text-slate-600 truncate" aria-label="SHA-256 hash preview">
          {entry.sha256_hash.slice(0, 20)}…
        </span>
      </div>
    </article>
  )
}
