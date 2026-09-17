import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* ─── GET /api/enrolments?course_id=xxx — check enrolment status ─────────── */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ enrolled: false })

  const courseId = new URL(req.url).searchParams.get('course_id')
  if (!courseId) return NextResponse.json({ error: 'course_id required' }, { status: 400 })

  const { data } = await supabase
    .from('course_enrolments')
    .select('id, completed_lesson_ids, completed_at, enrolled_at')
    .eq('course_id', courseId)
    .eq('learner_id', user.id)
    .single()

  return NextResponse.json({ enrolled: !!data, enrolment: data ?? null })
}

/* ─── POST /api/enrolments — enrol in a course ───────────────────────────────
   Body: { course_id }
   For paid courses, payment is stubbed — enrolment is created immediately.
──────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { course_id } = await req.json()
  if (!course_id) return NextResponse.json({ error: 'course_id required' }, { status: 400 })

  // Ensure course exists and is approved
  const { data: course } = await supabase
    .from('courses')
    .select('id, status, price_bwp, title, enrolment_count')
    .eq('id', course_id)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  if (course.status !== 'approved') {
    return NextResponse.json({ error: 'Course is not available for enrolment' }, { status: 400 })
  }

  // Check for existing enrolment
  const { data: existing } = await supabase
    .from('course_enrolments')
    .select('id')
    .eq('course_id', course_id)
    .eq('learner_id', user.id)
    .single()

  if (existing) return NextResponse.json({ message: 'Already enrolled', enrolment: existing })

  // Create enrolment
  const { data, error } = await supabase
    .from('course_enrolments')
    .insert({
      course_id,
      learner_id:           user.id,
      completed_lesson_ids: [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment enrolment_count
  await supabase
    .from('courses')
    .update({ enrolment_count: (course.enrolment_count ?? 0) + 1 })
    .eq('id', course_id)

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id:    user.id,
    action:      'view',
    target_type: 'knowledge_entry', // reuse closest existing action type
    target_id:   course_id,
    metadata:    { action_detail: 'enrol', course_title: course.title },
  })

  return NextResponse.json({ data }, { status: 201 })
}

/* ─── PATCH /api/enrolments — mark a lesson complete ────────────────────────
   Body: { course_id, lesson_id }
──────────────────────────────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { course_id, lesson_id } = await req.json()
  if (!course_id || !lesson_id) {
    return NextResponse.json({ error: 'course_id and lesson_id required' }, { status: 400 })
  }

  const { data: enrolment } = await supabase
    .from('course_enrolments')
    .select('id, completed_lesson_ids')
    .eq('course_id', course_id)
    .eq('learner_id', user.id)
    .single()

  if (!enrolment) return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })

  const existing = enrolment.completed_lesson_ids ?? []
  if (existing.includes(lesson_id)) {
    return NextResponse.json({ message: 'Lesson already marked complete', enrolment })
  }

  const updated = [...existing, lesson_id]

  // Check if all course lessons are now complete
  const { data: allLessons } = await supabase
    .from('lessons').select('id').eq('course_id', course_id)
  const allDone = allLessons && allLessons.every(l => updated.includes(l.id))

  const { data, error } = await supabase
    .from('course_enrolments')
    .update({
      completed_lesson_ids: updated,
      completed_at:         allDone ? new Date().toISOString() : null,
    })
    .eq('id', enrolment.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, course_completed: allDone })
}
