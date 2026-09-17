import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/knowledge
 * Query params: category, tier, search, page, limit
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const tier = searchParams.get('tier')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = (page - 1) * limit

  let query = supabase
    .from('knowledge_entries')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category', category)
  if (tier) query = query.eq('access_tier', tier)
  if (search) query = query.ilike('title', `%${search}%`)

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
 * POST /api/knowledge
 * Create a new knowledge entry. Requires authentication.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title, description, category, access_tier,
    language, latitude, longitude, tags, sha256_hash,
  } = body

  if (!title || !category || !sha256_hash) {
    return NextResponse.json({ error: 'title, category, and sha256_hash are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert({
      title,
      description,
      category,
      access_tier: access_tier ?? 'public',
      language: language ?? 'en',
      submitted_by: user.id,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      tags: tags ?? [],
      sha256_hash,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log submission in audit trail
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'submit',
    target_type: 'knowledge_entry',
    target_id: data.id,
    metadata: { title },
  })

  return NextResponse.json({ data }, { status: 201 })
}
