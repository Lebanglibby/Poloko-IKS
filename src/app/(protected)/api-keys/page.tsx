import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ApiKeysManager } from '@/components/research/ApiKeysManager'
import { KeyRound } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'API Keys — Poloko IKS Research Hub',
}

export default async function ApiKeysPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!['researcher', 'admin'].includes(profile.role)) redirect('/dashboard')

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, label, listing_id, usage_count, is_active, expires_at, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: listings } = await supabase
    .from('research_listings')
    .select('id, title')
    .eq('author_id', user.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <li><Link href="/dashboard" className="hover:text-[#2D6A4F] transition-colors font-medium">Dashboard</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/research" className="hover:text-[#2D6A4F] transition-colors font-medium">Research Hub</Link></li>
            <li aria-hidden="true">/</li>
            <li><span className="text-[#4B5563] font-semibold" aria-current="page">API Keys</span></li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm"
            style={{ background: 'linear-gradient(135deg, #F0F7F4, #E8F5EE)', borderColor: '#95D5B2' }}
            aria-hidden="true"
          >
            <KeyRound className="h-6 w-6 text-[#2D6A4F]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#1A1008]">API Keys</h1>
            <p className="text-xs text-[#9C8070] font-semibold mt-0.5">
              Poloko Research API — programmatic access
            </p>
          </div>
        </div>
        <p className="text-sm text-[#4B5563] mb-8 leading-relaxed max-w-xl">
          Generate keys to access your research data programmatically via the Poloko Research API.
          Each key is shown <strong>once</strong> at creation — store it securely.
        </p>

        <ApiKeysManager initialKeys={keys ?? []} listings={listings ?? []} />
      </main>
    </div>
  )
}
