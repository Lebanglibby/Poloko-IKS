/**
 * SHA-256 hashing utility — Poloko Biopiracy Shield
 * Generates cryptographic proof-of-prior-art for uploaded knowledge assets.
 */

/**
 * Compute SHA-256 hash of a string (e.g. title + description + timestamp).
 * Used for text-based knowledge entries.
 */
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(hashBuffer)
}

/**
 * Compute SHA-256 hash of a File or Blob.
 * Used for uploaded documents, images, and audio files.
 */
export async function hashFile(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return bufferToHex(hashBuffer)
}

/**
 * Generate a canonical hash for a knowledge entry at submission time.
 * Combines content fields + ISO timestamp for immutable proof of prior art.
 */
export async function generateEntryHash(params: {
  title: string
  description: string
  submittedBy: string
  timestamp?: string
}): Promise<string> {
  const { title, description, submittedBy, timestamp = new Date().toISOString() } = params
  const canonical = `${title}::${description}::${submittedBy}::${timestamp}`
  return hashText(canonical)
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer)
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}
