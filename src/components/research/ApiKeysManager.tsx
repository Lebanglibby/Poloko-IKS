'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import {
  KeyRound, Plus, Trash2, Copy, CheckCircle2,
  Loader2, AlertTriangle, X,
} from 'lucide-react'

interface ApiKey {
  id: string
  label: string | null
  listing_id: string | null
  usage_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface Listing {
  id: string
  title: string
}

interface Props {
  initialKeys: ApiKey[]
  listings: Listing[]
}

export function ApiKeysManager({ initialKeys, listings }: Props) {
  const [keys,          setKeys]          = useState<ApiKey[]>(initialKeys)
  const [showForm,      setShowForm]      = useState(false)
  const [label,         setLabel]         = useState('')
  const [listingId,     setListingId]     = useState('')
  const [expiresInDays, setExpiresInDays] = useState('')
  const [creating,      setCreating]      = useState(false)
  const [newKey,        setNewKey]        = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [revoking,      setRevoking]      = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/keys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          label:           label.trim() || null,
          listing_id:      listingId || null,
          expires_in_days: expiresInDays ? parseInt(expiresInDays, 10) : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to create key'); return }
      setNewKey(json.raw_key)
      setKeys(prev => [json.data, ...prev])
      setLabel(''); setListingId(''); setExpiresInDays('')
      setShowForm(false)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm('Revoke this API key? All integrations using it will stop working immediately.')) return
    setRevoking(keyId)
    try {
      const res = await fetch('/api/keys', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key_id: keyId }),
      })
      if (res.ok) setKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k))
    } finally {
      setRevoking(null)
    }
  }

  function copyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass = 'w-full border-2 border-[#E8DDD0] rounded-xl px-3 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] bg-[#FDFBF7] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-all'

  return (
    <div className="space-y-6">

      {/* ── New key one-time reveal ──────────────────────────────── */}
      {newKey && (
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5" role="alert">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#78350F]">Save your API key now</p>
              <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">
                This key will <strong>not</strong> be shown again. Copy it and store it securely
                in a password manager or environment variable.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#FDE68A] rounded-xl px-3 py-2.5 mb-3">
            <code className="flex-1 text-xs font-mono text-[#1F2937] break-all">{newKey}</code>
            <button
              onClick={copyKey}
              className="shrink-0 transition-colors"
              style={{ color: copied ? '#2D6A4F' : '#B45309' }}
              aria-label={copied ? 'Copied!' : 'Copy API key'}
            >
              {copied
                ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                : <Copy        className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="flex items-center gap-1 text-xs text-[#B45309] hover:text-[#78350F] transition-colors underline"
            aria-label="Dismiss this API key reveal"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            I&apos;ve saved it — dismiss
          </button>
        </div>
      )}

      {/* ── Keys panel ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#1F2937] flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#40916C]" aria-hidden="true" />
            Your API Keys
          </h2>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-sm font-bold text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
            style={{ background: 'var(--r-primary)' }}
            aria-expanded={showForm}
            aria-controls="create-key-form"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New Key
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            id="create-key-form"
            onSubmit={handleCreate}
            className="rounded-xl border border-[#E8DDD0] bg-[#F7FBF8] p-4 mb-5 space-y-4"
            aria-label="Create new API key"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="keyLabel" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Label <span className="font-normal text-[#9CA3AF]">(optional)</span>
                </label>
                <input
                  id="keyLabel"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. My Research App"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="keyListing" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Scope to listing <span className="font-normal text-[#9CA3AF]">(optional)</span>
                </label>
                <select
                  id="keyListing"
                  value={listingId}
                  onChange={e => setListingId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All published listings</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:w-1/2">
              <label htmlFor="keyExpiry" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Expires in <span className="font-normal text-[#9CA3AF]">(days, optional)</span>
              </label>
              <input
                id="keyExpiry"
                type="number"
                min="1"
                value={expiresInDays}
                onChange={e => setExpiresInDays(e.target.value)}
                placeholder="e.g. 90"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />{error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                aria-busy={creating}
                className="flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 shadow-sm"
                style={{ background: 'var(--r-primary)' }}
              >
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {creating ? 'Generating…' : 'Generate Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#95D5B2] hover:text-[#2D6A4F] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Keys list */}
        {keys.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-[#F0F7F4] border border-[#D8F3E3] flex items-center justify-center mx-auto mb-3">
              <KeyRound className="h-8 w-8 text-[#95D5B2]" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#4B5563]">No API keys yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs mx-auto">
              Generate a key to start using the Poloko Research API in your applications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F0EB]">
            {keys.map(key => (
              <div key={key.id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#1F2937] truncate">
                      {key.label ?? 'Unnamed key'}
                    </span>
                    {key.is_active ? (
                      <span className="text-xs bg-[#F0F7F4] text-[#2D6A4F] border border-[#95D5B2] px-2 py-0.5 rounded-full font-medium shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-[#F3F0EB] text-[#9CA3AF] border border-[#E5D8C8] px-2 py-0.5 rounded-full font-medium shrink-0">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    Created <time dateTime={key.created_at}>{formatDate(key.created_at)}</time>
                    {key.expires_at && <> · Expires <time dateTime={key.expires_at}>{formatDate(key.expires_at)}</time></>}
                    {' · '}
                    <span className="font-medium text-[#6B5344]">{key.usage_count.toLocaleString()}</span>
                    {' '}request{key.usage_count !== 1 ? 's' : ''}
                  </p>
                  {key.listing_id && (
                    <p className="text-xs text-[#40916C] mt-0.5 font-medium">
                      Scoped to specific listing
                    </p>
                  )}
                </div>
                {key.is_active && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="shrink-0 flex items-center gap-1 text-xs border px-2.5 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                    style={{
                      color:       '#B91C1C',
                      borderColor: '#FECACA',
                      background:  '#FEF2F2',
                    }}
                    aria-label={`Revoke key ${key.label ?? 'Unnamed key'}`}
                  >
                    {revoking === key.id
                      ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      : <Trash2  className="h-3 w-3" aria-hidden="true" />}
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Usage instructions ───────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E8DDD0] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#40916C]" aria-hidden="true" />
          How to use your API key
        </h3>
        <pre
          className="text-xs rounded-xl p-4 overflow-x-auto leading-relaxed"
          style={{ background: '#F0F7F4', border: '1px solid #95D5B2', color: '#1B4332' }}
        >
{`curl https://your-domain.com/api/v1/datasets \\
  -H "Authorization: Bearer pik_your_key_here"`}
        </pre>
        <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
          Returns paginated JSON of published research listings you have licensed access to.
          Append{' '}
          <code
            className="px-1 rounded text-[10px]"
            style={{ background: '#F0F7F4', color: '#2D6A4F', border: '1px solid #95D5B2' }}
          >
            ?page=2&amp;limit=25
          </code>
          {' '}for pagination.
        </p>
      </div>
    </div>
  )
}
