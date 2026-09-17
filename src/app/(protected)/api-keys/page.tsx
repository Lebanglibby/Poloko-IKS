import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ApiKeysManager } from '@/components/research/ApiKeysManager'
import { KeyRound } from 'lucide-react'

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

  if (!['researcher', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch existing keys (no raw_key — hashes only)
  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, label, listing_id, usage_count, is_active, expires_at, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's published listings for scoping keys
  const { data: listings } = await supabase
    .from('research_listings')
    .select('id, title')
    .eq('author_id', user.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile.role} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="h-5 w-5 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Generate keys to access your research data programmatically via the Poloko Research API.
          Each key is shown once at creation — store it securely.
        </p>

        <ApiKeysManager
          initialKeys={keys ?? []}
          listings={listings ?? []}
        />
      </main>
    </div>
  )
}
