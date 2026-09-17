import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/download
 * Records a download event: increments download_count on the listing
 * and writes a 'download' audit log entry.
 * Body: { listing_id: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const { listing_id } = body

  if (!listing_id) {
    return NextResponse.json({ error: 'listing_id is required' }, { status: 400 })
  }

  // Fetch current count (also validates listing exists)
  const { data: listing, error: fetchError } = await supabase
    .from('research_listings')
    .select('id, title, download_count, full_document_url')
    .eq('id', listing_id)
    .single()

  if (fetchError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Increment download_count atomically using RPC or a simple update
  await supabase
    .from('research_listings')
    .update({ download_count: listing.download_count + 1 })
    .eq('id', listing_id)

  // Log the download event
  await supabase.from('audit_logs').insert({
    actor_id: user?.id ?? null,
    action: 'download',
    target_type: 'research_listing',
    target_id: listing_id,
    metadata: { title: listing.title },
  })

  return NextResponse.json({
    success: true,
    download_url: listing.full_document_url,
  })
}
