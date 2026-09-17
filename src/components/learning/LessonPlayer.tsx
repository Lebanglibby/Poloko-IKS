'use client'

import { useState } from 'react'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Lesson } from '@/lib/types'

interface Props {
  lesson: Lesson
}

/* ─── Detect embed vs direct video ─────────────────────────────────────────── */
function isYouTubeEmbed(url: string) {
  return url.includes('youtube.com/embed') || url.includes('youtu.be')
}

function toYouTubeEmbed(url: string): string {
  // Accept both watch?v= and youtu.be formats
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  const id = watchMatch?.[1] ?? shortMatch?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : url
}

/* ─── Image gallery ─────────────────────────────────────────────────────────── */
function ImageGallery({ urls, title }: { urls: string[]; title: string }) {
  const [active, setActive] = useState(0)
  if (!urls.length) return null
  return (
    <div className="rounded-2xl border border-[#E8DDD0] overflow-hidden bg-[#FDFBF7]">
      {/* Main image */}
      <div className="relative aspect-video bg-[#F3F0EB] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[active]}
          alt={urls.length > 1 ? `Photo ${active + 1} of ${urls.length} for "${title}"` : `Photo for "${title}"`}
          className="w-full h-full object-contain"
        />
        {/* External link */}
        <a href={urls[active]} target="_blank" rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 text-[#4B5563] hover:text-[#92400E] border border-[#E8DDD0] transition-colors"
          aria-label={`Open photo ${active + 1} in new tab`}>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        {/* Prev/next arrows */}
        {urls.length > 1 && (
          <>
            <button
              onClick={() => setActive(a => Math.max(0, a - 1))}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-[#4B5563] hover:text-[#92400E] border border-[#E8DDD0] transition-colors disabled:opacity-30"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setActive(a => Math.min(urls.length - 1, a + 1))}
              disabled={active === urls.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-[#4B5563] hover:text-[#92400E] border border-[#E8DDD0] transition-colors disabled:opacity-30"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {urls.length > 1 && (
        <div className="flex gap-2 p-3 border-t border-[#E8DDD0] overflow-x-auto" role="tablist" aria-label="Photo thumbnails">
          {urls.map((u, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              aria-label={`View photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`shrink-0 h-12 w-16 rounded-xl border-2 overflow-hidden transition-all ${
                active === i ? 'border-[#92400E]' : 'border-[#E8DDD0] hover:border-[#FDE68A]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main player ───────────────────────────────────────────────────────────── */
export function LessonPlayer({ lesson }: Props) {
  if (lesson.content_type === 'video' && lesson.video_url) {
    const embedUrl = isYouTubeEmbed(lesson.video_url)
      ? lesson.video_url
      : toYouTubeEmbed(lesson.video_url)

    const isEmbed = embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com')

    return (
      <div className="video-aspect shadow-sm" aria-label={`Video for lesson: ${lesson.title}`}>
        {isEmbed ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // Direct video file
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={lesson.video_url}
            controls
            playsInline
            aria-label={`Video: ${lesson.title}`}
          />
        )}
      </div>
    )
  }

  if (lesson.content_type === 'image_gallery' && lesson.image_urls && lesson.image_urls.length > 0) {
    return <ImageGallery urls={lesson.image_urls} title={lesson.title} />
  }

  // Text-only lesson has no top-level media widget — content rendered in page
  return null
}
