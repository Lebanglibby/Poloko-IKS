import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/research
 * Query params: status, license_type, search, page, limit
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const licenseType = searchParams.get('license_type')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = (page - 1) * limit

  let query = supabase
    .from('research_listings')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .neq('status', 'draft')            // drafts are private
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (licenseType) query = query.eq('license_type', licenseType)
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
 * POST /api/research
 * Publish a new research listing. Requires researcher role.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify researcher role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['researcher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Researcher role required' }, { status: 403 })
  }

  const body = await request.json()
  const {
    title, abstract, status, license_type,
    license_terms, price, tags, sha256_hash,
  } = body

  if (!title || !sha256_hash) {
    return NextResponse.json({ error: 'title and sha256_hash are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('research_listings')
    .insert({
      title,
      abstract,
      status: status ?? 'draft',
      license_type,
      license_terms: license_terms ?? null,
      price: price ?? 0,
      author_id: user.id,
      sha256_hash,
      tags: tags ?? [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
