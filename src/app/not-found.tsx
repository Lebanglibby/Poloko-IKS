import Link from 'next/link'
import { Leaf, ArrowRight, BookOpen, FlaskConical, GraduationCap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Simple top bar */}
      <div className="border-b border-[#E8DDD0] bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit group" aria-label="Back to Poloko IKS home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9A3412] group-hover:bg-[#7C2D12] transition-colors">
            <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-[#9A3412]">Poloko IKS</span>
        </Link>
      </div>

      {/* Kente accent */}
      <div className="h-1 kente-stripe" aria-hidden="true" />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">

          {/* Illustration */}
          <div className="h-24 w-24 bg-[#FEF2E8] border-2 border-[#FDBA74] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Leaf className="h-12 w-12 text-[#9A3412]" aria-hidden="true" />
          </div>

          <h1 className="font-display text-6xl text-[#9A3412] mb-3">404</h1>
          <h2 className="font-display text-2xl text-[#1A1008] mb-3">Page not found</h2>
          <p className="text-[#6B5344] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            This page doesn&apos;t exist or may have moved. If you were looking for
            a knowledge entry, it may require access approval to view.
          </p>

          {/* Primary actions */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#9A3412] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Go to Home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Module quick-links */}
          <div className="border-t border-[#E8DDD0] pt-8">
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-4">
              Or explore one of our modules
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                {
                  href:    '/vault',
                  icon:    BookOpen,
                  label:   'Knowledge Vault',
                  sub:     'Browse traditional knowledge',
                  accent:  '#9A3412',
                  accentBg:'#FEF2E8',
                  border:  '#FDBA74',
                },
                {
                  href:    '/research',
                  icon:    FlaskConical,
                  label:   'Research Hub',
                  sub:     'Published studies & data',
                  accent:  '#2D6A4F',
                  accentBg:'#F0F7F4',
                  border:  '#95D5B2',
                },
                {
                  href:    '/learn',
                  icon:    GraduationCap,
                  label:   'Learning Hub',
                  sub:     'Elder-approved courses',
                  accent:  '#92400E',
                  accentBg:'#FFFBEB',
                  border:  '#FDE68A',
                },
              ].map(({ href, icon: Icon, label, sub, accent, accentBg, border }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center hover:-translate-y-1 transition-all"
                  style={{ background: accentBg, borderColor: border }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'white', border: `1px solid ${border}` }}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: accent }}>{label}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-tight">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
