import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  page: number
  totalPages: number
  /** Build the href for a given page number — caller injects current search params */
  buildHref: (page: number) => string
}

export function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < totalPages

  // Show a window of up to 5 page numbers centred on the current page
  const window = 2
  const start = Math.max(1, page - window)
  const end = Math.min(totalPages, page + window)
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      <Link
        href={hasPrev ? buildHref(page - 1) : '#'}
        aria-disabled={!hasPrev}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-colors',
          hasPrev
            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'border-transparent text-gray-300 pointer-events-none'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Link>

      {start > 1 && (
        <>
          <Link href={buildHref(1)} className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            1
          </Link>
          {start > 2 && <span className="px-2 text-gray-400 text-sm">…</span>}
        </>
      )}

      {pageNumbers.map(n => (
        <Link
          key={n}
          href={buildHref(n)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm border transition-colors',
            n === page
              ? 'border-green-600 bg-green-600 text-white font-medium'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400 text-sm">…</span>}
          <Link href={buildHref(totalPages)} className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={hasNext ? buildHref(page + 1) : '#'}
        aria-disabled={!hasNext}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-colors',
          hasNext
            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'border-transparent text-gray-300 pointer-events-none'
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
