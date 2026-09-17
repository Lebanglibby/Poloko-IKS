import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/verify
 * Community verification of a knowledge entry.
 * Sets verified = true and verified_by = current user's id.
 * Requires: authenticated user who is NOT the submitter.
 * Logs a 'verify' audit event.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { entry_id } = body

  if (!entry_id) {
    return NextResponse.json({ error: 'entry_id is required' }, { status: 400 })
  }

  // Fetch the entry to check it exists and is accessible
  const { data: entry, error: fetchError } = await supabase
    .from('knowledge_entries')
    .select('id, title, submitted_by, verified')
    .eq('id', entry_id)
    .single()

  if (fetchError || !entry) {
    return NextResponse.json({ error: 'Entry not found or access denied' }, { status: 404 })
  }

  // Cannot verify your own submission
  if (entry.submitted_by === user.id) {
    return NextResponse.json(
      { error: 'You cannot verify your own submission' },
      { status: 403 }
    )
  }

  // Already verified — idempotent, still succeed
  if (entry.verified) {
    return NextResponse.json({ message: 'Entry is already verified' }, { status: 200 })
  }

  // Mark as verified
  const { error: updateError } = await supabase
    .from('knowledge_entries')
    .update({ verified: true, verified_by: user.id })
    .eq('id', entry_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Log the verify event in audit trail
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'verify',
    target_type: 'knowledge_entry',
    target_id: entry_id,
    metadata: { title: entry.title },
  })

  return NextResponse.json({ success: true, message: 'Entry verified successfully' }, { status: 200 })
}
