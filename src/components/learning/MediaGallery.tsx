import Link from 'next/link'
import { PlayCircle, Image as ImageIcon } from 'lucide-react'
import { COURSE_CATEGORY_LABELS } from '@/lib/constants'
import type { MediaItem, CourseCategory } from '@/lib/types'

interface Props {
  items: MediaItem[]
}

export function MediaGallery({ items }: Props) {
  if (!items.length) return null

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      role="list"
      aria-label="Media demonstrations and photo series"
    >
      {items.map(item => {
        const isVideo    = item.content_type === 'video'
        const thumbUrl   = item.image_urls?.[0] ?? null
        const hasContent = isVideo ? !!item.video_url : !!thumbUrl

        return (
          <div
            key={item.id}
            role="listitem"
            className="group bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden l-card-lift"
            aria-label={`${item.title}${item.profiles?.full_name ? ` by ${item.profiles.full_name}` : ''}`}
          >
            {/* Thumbnail */}
            <div
              className="relative h-32 flex items-center justify-center overflow-hidden"
              style={
                thumbUrl
                  ? { backgroundImage: `url(${thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }
              }
            >
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isVideo
                  ? <PlayCircle className="h-10 w-10 text-white drop-shadow-lg" aria-hidden="true" />
                  : <ImageIcon  className="h-8 w-8 text-white drop-shadow-lg" aria-hidden="true" />
                }
              </div>

              {/* Content type badge */}
              <div className="absolute top-2 left-2">
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>
                  {isVideo ? <PlayCircle className="h-2.5 w-2.5" aria-hidden="true" /> : <ImageIcon className="h-2.5 w-2.5" aria-hidden="true" />}
                  {isVideo ? 'Video' : 'Photos'}
                </span>
              </div>

              {!thumbUrl && !isVideo && (
                <span className="text-4xl" aria-hidden="true">🖼️</span>
              )}
              {!thumbUrl && isVideo && (
                <PlayCircle className="h-10 w-10 text-[#FDE68A]" aria-hidden="true" />
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-xs text-[#1F2937] leading-snug line-clamp-2 group-hover:text-[#92400E] transition-colors mb-1">
                {item.title}
              </h3>
              {item.category && (
                <p className="text-[10px] text-[#9CA3AF]">
                  {COURSE_CATEGORY_LABELS[item.category as CourseCategory]}
                </p>
              )}
              {item.profiles?.full_name && (
                <p className="text-[10px] text-[#B45309] mt-0.5 font-medium">{item.profiles.full_name}</p>
              )}

              {/* Watch / View link */}
              {hasContent && (
                <a
                  href={isVideo ? item.video_url! : item.image_urls![0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-[#92400E] hover:underline"
                  aria-label={`${isVideo ? 'Watch' : 'View'}: ${item.title}`}
                >
                  {isVideo ? 'Watch →' : 'View →'}
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
