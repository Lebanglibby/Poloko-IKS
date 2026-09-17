import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * External Research API — GET /api/v1/datasets
 * Authenticated via Bearer API key.
 * Returns licensed, structured research data for third-party consumption.
 */
export async function GET(request: NextRequest) {
  // Extract Bearer token
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'API key required. Provide Authorization: Bearer <api_key>' },
      { status: 401 }
    )
  }

  const rawKey = authHeader.slice(7)

  // Hash the incoming key to compare against stored hashes
  const encoder = new TextEncoder()
  const keyData = encoder.encode(rawKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData)
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const supabase = createAdminClient()

  // Validate API key
  const { data: apiKey, error: keyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (keyError || !apiKey) {
    return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 })
  }

  // Check expiry
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return NextResponse.json({ error: 'API key has expired' }, { status: 403 })
  }

  // Increment usage count
  await supabase
    .from('api_keys')
    .update({ usage_count: apiKey.usage_count + 1 })
    .eq('id', apiKey.id)

  // Log API access in audit trail
  if (apiKey.listing_id) {
    await supabase.from('audit_logs').insert({
      actor_id: apiKey.owner_id,
      action: 'api_access',
      target_type: 'research_listing',
      target_id: apiKey.listing_id,
      metadata: { api_key_id: apiKey.id, key_label: apiKey.label },
    })
  }

  // Fetch the licensed dataset
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = (page - 1) * limit

  let query = supabase
    .from('research_listings')
    .select('id, title, abstract, license_type, tags, created_at, profiles(full_name)')
    .eq('status', 'published')
    .range(offset, offset + limit - 1)

  // If key is scoped to a specific listing, filter to it
  if (apiKey.listing_id) {
    query = query.eq('id', apiKey.listing_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    api_version: 'v1',
    platform: 'Poloko IKS',
    data,
    pagination: { page, limit },
    attribution: 'Data provided under the licensing terms agreed with the originating researcher.',
  })
}
