import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/keys
 * Returns API keys owned by the authenticated user.
 */
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, label, listing_id, usage_count, is_active, expires_at, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/**
 * POST /api/keys
 * Generate a new API key for the authenticated user.
 * Body: { label?: string, listing_id?: string, expires_in_days?: number }
 * Returns the raw key once — it is never stored in plaintext.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only researchers and admins can create API keys
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['researcher', 'admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Researcher or admin role required to generate API keys' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { label, listing_id, expires_in_days } = body

  // Generate a cryptographically secure random key
  const rawKey = generateSecureKey()

  // Hash the key for storage (we never store the plaintext)
  const keyHash = await hashKey(rawKey)

  const expiresAt = expires_in_days
    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      key_hash: keyHash,
      owner_id: user.id,
      listing_id: listing_id ?? null,
      label: label ?? null,
      expires_at: expiresAt,
    })
    .select('id, label, listing_id, usage_count, is_active, expires_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return the raw key once — the caller must save it immediately
  return NextResponse.json({
    data,
    raw_key: rawKey,
    warning: 'Save this key immediately — it will never be shown again.',
  }, { status: 201 })
}

/**
 * DELETE /api/keys
 * Revoke (deactivate) an API key. Body: { key_id: string }
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { key_id } = body

  if (!key_id) {
    return NextResponse.json({ error: 'key_id is required' }, { status: 400 })
  }

  // Only allow the owner to revoke their own key
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', key_id)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSecureKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return 'pik_' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashKey(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
