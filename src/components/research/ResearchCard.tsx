import Link from 'next/link'
import { Eye, Download, Users, Tag } from 'lucide-react'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { formatRelativeDate, truncate } from '@/lib/utils'
import type { ResearchListing } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  open_for_collaboration: 'bg-blue-50 text-blue-700',
}

const STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft',
  open_for_collaboration: 'Open for Collaboration',
}

interface Props {
  listing: ResearchListing
}

export function ResearchCard({ listing }: Props) {
  return (
    <Link href={`/research/${listing.id}`}>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
            {truncate(listing.title, 65)}
          </h3>
          <span className={cn('text-xs px-2.5 py-0.5 rounded-full shrink-0 font-medium', STATUS_STYLES[listing.status])}>
            {STATUS_LABELS[listing.status]}
          </span>
        </div>

        {/* Author */}
        {listing.profiles?.full_name && (
          <p className="text-xs text-gray-400 mb-3">by {listing.profiles.full_name}</p>
        )}

        {/* Abstract */}
        {listing.abstract && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.abstract}</p>
        )}

        {/* License & Price */}
        <div className="flex items-center justify-between mb-3">
          {listing.license_type && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              {LICENSE_TYPE_LABELS[listing.license_type]}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900 ml-auto">
            {listing.price === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `BWP ${listing.price.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {listing.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" /> {listing.download_count}
          </span>
          {listing.collaborators && listing.collaborators.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {listing.collaborators.length} collaborator{listing.collaborators.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="ml-auto">{formatRelativeDate(listing.created_at)}</span>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {listing.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
