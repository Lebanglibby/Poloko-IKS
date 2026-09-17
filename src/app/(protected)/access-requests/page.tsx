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

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const isApprover = ['elder', 'admin'].includes(profile.role)

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
    const decision  = formData.get('decision') as 'approved' | 'denied'
    const srv = await createClient()
    const { data: { user: u } } = await srv.auth.getUser()
    if (!u) return
    await srv.from('access_requests').update({
      status: decision, approver_id: u.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId)
    redirect('/access-requests')
  }

  const STATUS_BADGES: Record<string, { icon: typeof Clock; label: string; classes: string }> = {
    pending:  { icon: Clock,         label: 'Pending review', classes: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' },
    approved: { icon: CheckCircle2,  label: 'Approved',       classes: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]' },
    denied:   { icon: XCircle,       label: 'Denied',         classes: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' },
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar userRole={profile.role} />

      <main className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">
              {isApprover ? 'Access Requests to Review' : 'My Access Requests'}
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              {isApprover ? 'Approve or deny requests for restricted and sacred entries' : 'Track your requests to view protected entries'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {!requests || requests.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#E8DDD0] rounded-2xl p-14 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#E8DDD0] mx-auto mb-3" aria-hidden="true" />
              <p className="text-base font-semibold text-[#4B5563]">
                {isApprover ? 'No pending requests' : 'No requests yet'}
              </p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                {isApprover
                  ? 'All caught up — no pending access requests to review.'
                  : 'When you request access to a restricted entry, it will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => {
                const badge = STATUS_BADGES[req.status] ?? STATUS_BADGES.pending
                const BadgeIcon = badge.icon
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-[#1F2937]">
                            {req.knowledge_entries?.title ?? 'Unknown entry'}
                          </h3>
                          {req.knowledge_entries?.access_tier && (
                            <AccessTierBadge
                              tier={req.knowledge_entries.access_tier as 'public' | 'restricted' | 'sacred'}
                              variant="badge"
                            />
                          )}
                        </div>

                        {isApprover && req.profiles?.full_name && (
                          <p className="text-sm text-[#4B5563] mb-2">
                            Requested by: <span className="font-semibold">{req.profiles.full_name}</span>
                          </p>
                        )}

                        {req.justification && (
                          <div className="bg-[#FDFBF7] border border-[#E8DDD0] rounded-xl px-4 py-3 mt-2">
                            <p className="text-sm text-[#4B5563]">
                              <span className="font-semibold text-[#1F2937]">Reason: </span>
                              {req.justification}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-[#9CA3AF] mt-3">Submitted {formatDate(req.created_at)}</p>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.classes}`}>
                        <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {badge.label}
                      </span>
                    </div>

                    {isApprover && req.status === 'pending' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-[#F3F0EB]">
                        <form action={handleDecision}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <input type="hidden" name="decision"   value="approved" />
                          <button type="submit"
                            className="flex items-center gap-2 bg-[#15803D] hover:bg-[#14532D] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Approve Access
                          </button>
                        </form>
                        <form action={handleDecision}>
                          <input type="hidden" name="requestId" value={req.id} />
                          <input type="hidden" name="decision"   value="denied" />
                          <button type="submit"
                            className="flex items-center gap-2 border-2 border-[#FECACA] text-[#B91C1C] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#FEF2F2] transition-colors">
                            <XCircle className="h-4 w-4" aria-hidden="true" /> Deny
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
