import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/access
 * Submit a request to access a restricted or sacred knowledge entry.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Support both JSON body and form data
  let entryId: string | null = null
  let justification: string | null = null

  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = await request.json()
    entryId = body.entry_id
    justification = body.justification ?? null
  } else {
    const formData = await request.formData()
    entryId = formData.get('entry_id') as string | null
    justification = formData.get('justification') as string | null
  }

  if (!entryId) {
    return NextResponse.json({ error: 'entry_id is required' }, { status: 400 })
  }

  // Check entry exists and is not public
  const { data: entry } = await supabase
    .from('knowledge_entries')
    .select('id, access_tier')
    .eq('id', entryId)
    .single()

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  if (entry.access_tier === 'public') {
    return NextResponse.json({ error: 'This entry is already publicly accessible' }, { status: 400 })
  }

  // Check for existing pending request
  const { data: existing } = await supabase
    .from('access_requests')
    .select('id, status')
    .eq('entry_id', entryId)
    .eq('requester_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: `You already have a ${existing.status} request for this entry` },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      entry_id: entryId,
      requester_id: user.id,
      justification,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, message: 'Access request submitted successfully' }, { status: 201 })
}

/**
 * GET /api/access
 * Fetch access requests (admin/elder = all pending; user = own requests)
 */
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isApprover = profile && ['elder', 'admin'].includes(profile.role)

  const query = supabase
    .from('access_requests')
    .select('*, knowledge_entries(title, access_tier), profiles(full_name)')
    .order('created_at', { ascending: false })

  const { data, error } = isApprover
    ? await query.eq('status', 'pending')
    : await query.eq('requester_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
