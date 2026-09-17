import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* ─── GET /api/lessons?course_id=xxx ─────────────────────────────────────────
   Returns lessons for a given course, ordered by sort_order.
   RLS ensures only enrolled learners (or owner/admin) can see non-preview lessons
   for paid courses.
──────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const courseId = new URL(req.url).searchParams.get('course_id')
  if (!courseId) return NextResponse.json({ error: 'course_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/* ─── POST /api/lessons — add a lesson to a course ───────────────────────────
   Body: course_id, title, content_type, video_url?, image_urls?, text_content?,
         materials_list?, duration_mins?, sort_order, is_free_preview?, description?
──────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const {
    course_id, title, content_type, video_url, image_urls,
    text_content, materials_list, duration_mins, sort_order,
    is_free_preview, description,
  } = body

  if (!course_id) return NextResponse.json({ error: 'course_id is required' }, { status: 400 })
  if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  if (!content_type)  return NextResponse.json({ error: 'content_type is required' }, { status: 400 })

  // Verify course ownership
  const { data: course } = await supabase
    .from('courses').select('creator_id').eq('id', course_id).single()
  if (course?.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden — you do not own this course' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id,
      title:           title.trim(),
      description:     description?.trim() ?? null,
      content_type,
      video_url:       video_url      ?? null,
      image_urls:      image_urls     ?? null,
      text_content:    text_content   ?? null,
      materials_list:  materials_list ?? null,
      duration_mins:   duration_mins  ?? null,
      sort_order:      sort_order     ?? 0,
      is_free_preview: is_free_preview ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

/* ─── PATCH /api/lessons — update a lesson ───────────────────────────────────
   Body: lesson_id, ...fields to update
──────────────────────────────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { lesson_id, ...updates } = body
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  // Verify ownership via course
  const { data: lesson } = await supabase
    .from('lessons').select('course_id').eq('id', lesson_id).single()
  const { data: course } = lesson
    ? await supabase.from('courses').select('creator_id').eq('id', lesson.course_id).single()
    : { data: null }

  if (course?.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('lessons').update(updates).eq('id', lesson_id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/* ─── DELETE /api/lessons — remove a lesson ─────────────────────────────────
   Body: { lesson_id }
──────────────────────────────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { lesson_id } = await req.json()
  if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

  const { data: lesson } = await supabase
    .from('lessons').select('course_id').eq('id', lesson_id).single()
  const { data: course } = lesson
    ? await supabase.from('courses').select('creator_id').eq('id', lesson.course_id).single()
    : { data: null }

  if (course?.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('lessons').delete().eq('id', lesson_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
