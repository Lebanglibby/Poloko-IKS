import Link from 'next/link'
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[#E8DDD0] bg-white mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9A3412]">
            <Leaf className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-[#9A3412]">Poloko IKS</span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { href: '/vault',     label: 'Knowledge Vault' },
            { href: '/map',       label: 'Resource Map'    },
            { href: '/research',  label: 'Research Hub'    },
            { href: '/dashboard', label: 'Dashboard'       },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-[#9CA3AF] hover:text-[#9A3412] transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[#D4C4B0] w-full md:w-auto text-center md:text-right">
          Open Source · MIT License · Built for Botswana
        </p>
      </div>
    </footer>
  )
}
