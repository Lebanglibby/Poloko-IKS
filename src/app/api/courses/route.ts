import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEntryHash } from '@/lib/hash'

/* ─── GET /api/courses — public catalogue ────────────────────────────────────
   Returns approved courses only (status = 'approved').
   Optional query params: category, skill_level, search, page, limit
──────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const category    = searchParams.get('category')
  const skill_level = searchParams.get('skill_level')
  const search      = searchParams.get('search')
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit       = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))
  const offset      = (page - 1) * limit

  let query = supabase
    .from('courses')
    .select('*, profiles(full_name, community)', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category)    query = query.eq('category', category)
  if (skill_level) query = query.eq('skill_level', skill_level)
  if (search)      query = query.ilike('title', `%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  })
}

/* ─── POST /api/courses — create a course (auth required) ───────────────────
   Body: title, subtitle?, description?, category, skill_level, language,
         price_bwp, cover_image_url?, preview_video_url?
──────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { title, subtitle, description, category, skill_level, language, price_bwp, cover_image_url, preview_video_url } = body

  if (!title?.trim())    return NextResponse.json({ error: 'Title is required' },    { status: 400 })
  if (!category)         return NextResponse.json({ error: 'Category is required' }, { status: 400 })

  // Generate tamper-proof hash of the course syllabus at creation
  const sha256_hash = await generateEntryHash({
    title,
    description: description ?? '',
    submittedBy: user.id,
  })

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title:             title.trim(),
      subtitle:          subtitle?.trim() ?? null,
      description:       description?.trim() ?? null,
      category,
      skill_level:       skill_level ?? 'beginner',
      language:          language    ?? 'en',
      creator_id:        user.id,
      price_bwp:         price_bwp   ?? 0,
      cover_image_url:   cover_image_url   ?? null,
      preview_video_url: preview_video_url ?? null,
      status:            'draft',
      sha256_hash,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

/* ─── PATCH /api/courses — update course (author or admin only) ──────────── */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { course_id, ...updates } = body
  if (!course_id) return NextResponse.json({ error: 'course_id required' }, { status: 400 })

  // Verify ownership (RLS handles the rest, but explicit check gives better error)
  const { data: existing } = await supabase
    .from('courses').select('creator_id, status').eq('id', course_id).single()

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isOwner = existing?.creator_id === user.id
  const isAdmin = ['admin', 'elder'].includes(profile?.role ?? '')

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Elders/admins can approve or reject; creators can only update non-status fields
  const allowedUpdates = isAdmin
    ? updates
    : Object.fromEntries(
        Object.entries(updates).filter(([k]) => k !== 'status' && k !== 'reviewed_by' && k !== 'reviewed_at')
      )

  if (isAdmin && updates.status === 'approved') {
    allowedUpdates.reviewed_by = user.id
    allowedUpdates.reviewed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('courses')
    .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
    .eq('id', course_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
