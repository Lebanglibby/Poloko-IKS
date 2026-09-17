import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/hash
 * Generates a SHA-256 hash for a text payload (server-side fallback).
 * Body: { content: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return NextResponse.json({
      hash,
      timestamp: new Date().toISOString(),
      algorithm: 'SHA-256',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate hash' }, { status: 500 })
  }
}
