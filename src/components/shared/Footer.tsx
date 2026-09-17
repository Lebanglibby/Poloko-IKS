import Link from 'next/link'
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <span>Poloko IKS — Built for Botswana &amp; future generations</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/vault" className="hover:text-gray-600 transition-colors">Knowledge Vault</Link>
          <Link href="/map" className="hover:text-gray-600 transition-colors">Resource Map</Link>
          <Link href="/research" className="hover:text-gray-600 transition-colors">Research Hub</Link>
          <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
        </div>
        <p className="text-xs text-gray-300 w-full md:w-auto">
          Open Source · MIT License · Track 04 Hackathon 2026
        </p>
      </div>
    </footer>
  )
}
