import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/audit
 * Returns audit logs for the authenticated user's content.
 * Query params: target_type, page, limit
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('target_type')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = (page - 1) * limit

  // Get IDs of content owned by this user
  const [knowledgeIds, researchIds] = await Promise.all([
    supabase
      .from('knowledge_entries')
      .select('id')
      .eq('submitted_by', user.id),
    supabase
      .from('research_listings')
      .select('id')
      .eq('author_id', user.id),
  ])

  const ownedIds = [
    ...(knowledgeIds.data?.map(r => r.id) ?? []),
    ...(researchIds.data?.map(r => r.id) ?? []),
  ]

  if (ownedIds.length === 0) {
    return NextResponse.json({ data: [], pagination: { page, limit, total: 0, pages: 0 } })
  }

  let query = supabase
    .from('audit_logs')
    .select('*, profiles(full_name)', { count: 'exact' })
    .in('target_id', ownedIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (targetType) query = query.eq('target_type', targetType)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  })
}

/**
 * POST /api/audit
 * Internal: log an action against a piece of content.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const { action, target_type, target_id, metadata } = body

  if (!action || !target_type || !target_id) {
    return NextResponse.json({ error: 'action, target_type, target_id are required' }, { status: 400 })
  }

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: user?.id ?? null,
    action,
    target_type,
    target_id,
    metadata: metadata ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
