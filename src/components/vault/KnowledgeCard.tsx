import Link from 'next/link'
import { MapPin, CheckCircle2, Clock, Tag } from 'lucide-react'
import { AccessTierBadge } from './AccessTierBadge'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { KnowledgeEntry } from '@/lib/types'

interface Props {
  entry: KnowledgeEntry
}

export function KnowledgeCard({ entry }: Props) {
  return (
    <Link href={`/vault/${entry.id}`}>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-green-200 transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
            {truncate(entry.title, 60)}
          </h3>
          <AccessTierBadge tier={entry.access_tier} className="shrink-0" />
        </div>

        {/* Description */}
        {entry.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {entry.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
            {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
          </span>

          {entry.verified ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <Clock className="h-3 w-3" />
              Pending verification
            </span>
          )}

          {(entry.latitude && entry.longitude) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Geo-tagged
            </span>
          )}

          <span className="ml-auto">{formatRelativeDate(entry.created_at)}</span>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="text-xs text-gray-400">+{entry.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Hash preview */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-300 font-mono">
            SHA-256: {entry.sha256_hash.slice(0, 16)}…
          </span>
        </div>
      </div>
    </Link>
  )
}
