import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-green-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          This page doesn&apos;t exist. It may have been moved, or the knowledge entry you&apos;re looking for requires access approval.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/vault"
            className="border border-green-200 text-green-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Browse the Vault
          </Link>
        </div>
      </div>
    </div>
  )
}
