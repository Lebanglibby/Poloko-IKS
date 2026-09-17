'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, BookOpen, Map, FlaskConical, LayoutDashboard, LogOut, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/vault', label: 'Knowledge Vault', icon: BookOpen },
  { href: '/map', label: 'Resource Map', icon: Map },
  { href: '/research', label: 'Research Hub', icon: FlaskConical },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound, roles: ['researcher', 'admin'] },
]

export function Navbar({ userRole }: { userRole?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-700" />
          <span className="font-bold text-green-800">Poloko IKS</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon, authRequired, roles }) => {
            if (authRequired && !userRole) return null
            if (roles && (!userRole || !roles.includes(userRole))) return null
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {userRole ? (
            <>
              <Link
                href="/submit"
                className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                + Submit Knowledge
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-green-700">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
