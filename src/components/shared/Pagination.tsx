import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  page: number
  totalPages: number
  buildHref: (page: number) => string
}

export function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < totalPages

  const win   = 2
  const start = Math.max(1, page - win)
  const end   = Math.min(totalPages, page + win)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const base    = 'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all'
  const active  = 'border-[#9A3412] bg-[#9A3412] text-white shadow-sm'
  const normal  = 'border-[#E8DDD0] text-[#4B5563] bg-white hover:border-[#9A3412] hover:text-[#9A3412]'
  const disabled = 'border-transparent text-[#D4C4B0] pointer-events-none'

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      <Link
        href={hasPrev ? buildHref(page - 1) : '#'}
        aria-disabled={!hasPrev}
        aria-label="Previous page"
        className={cn(base, hasPrev ? normal : disabled)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
      </Link>

      {start > 1 && (
        <>
          <Link href={buildHref(1)} className={cn(base, normal)}>1</Link>
          {start > 2 && <span className="px-1 text-[#D4C4B0] text-sm">…</span>}
        </>
      )}

      {pages.map(n => (
        <Link
          key={n}
          href={buildHref(n)}
          className={cn(base, n === page ? active : normal)}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-[#D4C4B0] text-sm">…</span>}
          <Link href={buildHref(totalPages)} className={cn(base, normal)}>{totalPages}</Link>
        </>
      )}

      <Link
        href={hasNext ? buildHref(page + 1) : '#'}
        aria-disabled={!hasNext}
        aria-label="Next page"
        className={cn(base, hasNext ? normal : disabled)}
      >
        Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  )
}
