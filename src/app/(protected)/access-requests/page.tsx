import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { formatDate } from '@/lib/utils'
import { AccessTierBadge } from '@/components/vault/AccessTierBadge'
import { Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'

export default async function AccessRequestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const isApprover = ['elder', 'admin'].includes(profile.role)

  // Fetch requests — approvers see all pending, others see their own
  type AccessRequestRow = {
    id: string
    status: string
    justification: string | null
    created_at: string
    knowledge_entries: { title: string; access_tier: string; id: string } | null
    profiles: { full_name: string | null } | null
  }
  const baseQuery = supabase
    .from('access_requests')
    .select('id, status, justification, created_at, knowledge_entries(id, title, access_tier), profiles(full_name)')
    .order('created_at', { ascending: false })

  const { data: requests } = (isApprover
    ? await (baseQuery.eq('status', 'pending') as unknown as Promise<{ data: AccessRequestRow[] | null }>)
    : await (baseQuery.eq('requester_id', user.id) as unknown as Promise<{ data: AccessRequestRow[] | null }>))

  async function handleDecision(formData: FormData) {
    'use server'
    const requestId = formData.get('requestId') as string
    const decision = formData.get('decision') as 'approved' | 'denied'
    const serverSupabase = await createClient()
    const { data: { user: serverUser } } = await serverSupabase.auth.getUser()
    if (!serverUser) return

    await serverSupabase
      .from('access_requests')
      .update({
        status: decision,
        approver_id: serverUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    redirect('/access-requests')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile.role} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isApprover ? 'Pending Access Requests' : 'My Access Requests'}
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          {isApprover
            ? 'Review and approve or deny requests to access restricted and sacred knowledge entries.'
            : 'Track the status of your access requests to restricted or sacred knowledge entries.'}
        </p>

        {!requests || requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {isApprover ? 'No pending requests to review.' : 'You have no access requests.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-medium text-gray-900">{req.knowledge_entries?.title}</h3>
                      {req.knowledge_entries?.access_tier && (
                        <AccessTierBadge tier={req.knowledge_entries.access_tier as 'public' | 'restricted' | 'sacred'} />
                      )}
                    </div>

                    {isApprover && (
                      <p className="text-sm text-gray-500 mb-1">
                        Requested by: <span className="font-medium">{req.profiles?.full_name ?? 'Unknown'}</span>
                      </p>
                    )}

                    {req.justification && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                        <span className="font-medium text-gray-700">Justification: </span>
                        {req.justification}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">Submitted {formatDate(req.created_at)}</p>
                  </div>

                  <div className="shrink-0">
                    {req.status === 'pending' && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {req.status === 'denied' && (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        <XCircle className="h-3 w-3" /> Denied
                      </span>
                    )}
                  </div>
                </div>

                {/* Approver actions */}
                {isApprover && req.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <form action={handleDecision}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve Access
                      </button>
                    </form>
                    <form action={handleDecision}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="decision" value="denied" />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Deny
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
