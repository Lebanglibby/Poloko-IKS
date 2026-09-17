import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Simple top bar */}
      <div className="border-b border-[#E8DDD0] bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9A3412]">
            <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-[#9A3412]">Poloko IKS</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 bg-[#FEF2E8] border border-[#FDBA74] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Leaf className="h-10 w-10 text-[#9A3412]" aria-hidden="true" />
          </div>
          <h1 className="text-6xl font-bold text-[#9A3412] mb-3">404</h1>
          <h2 className="text-xl font-bold text-[#1F2937] mb-3">Page not found</h2>
          <p className="text-[#4B5563] text-sm leading-relaxed mb-8">
            This page doesn&apos;t exist or may have moved. If you were looking for
            a knowledge entry, it may require access approval to view.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/"
              className="flex items-center gap-2 bg-[#9A3412] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
              Go to Home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/vault"
              className="flex items-center gap-2 border-2 border-[#E8DDD0] text-[#4B5563] px-5 py-2.5 rounded-xl text-sm font-bold hover:border-[#9A3412] hover:text-[#9A3412] transition-colors">
              Browse the Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
