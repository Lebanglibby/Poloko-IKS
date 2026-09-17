'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import {
  KeyRound, Plus, Trash2, Copy, CheckCircle2,
  Loader2, AlertTriangle, Eye, EyeOff
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
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [listingId, setListingId] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim() || null,
          listing_id: listingId || null,
          expires_in_days: expiresInDays ? parseInt(expiresInDays, 10) : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to create key')
        return
      }
      setNewKey(json.raw_key)
      setKeys(prev => [json.data, ...prev])
      setLabel('')
      setListingId('')
      setExpiresInDays('')
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId }),
      })
      if (res.ok) {
        setKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k))
      }
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

  return (
    <div className="space-y-6">
      {/* New key revealed */}
      {newKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Save your API key now</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This key will not be shown again. Copy it and store it securely.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
            <code className="flex-1 text-xs font-mono text-gray-800 break-all">{newKey}</code>
            <button
              onClick={copyKey}
              className="shrink-0 text-amber-700 hover:text-amber-900 transition-colors"
              title="Copy key"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-amber-600 hover:text-amber-800 underline"
          >
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-700" />
            Your API Keys
          </h2>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-sm bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Key
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border border-gray-100 rounded-lg p-4 mb-4 space-y-3 bg-gray-50">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Label <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. My Research App"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Scope to listing <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={listingId}
                  onChange={e => setListingId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All published listings</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:w-1/2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expires in <span className="text-gray-400 font-normal">(days, optional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={expiresInDays}
                onChange={e => setExpiresInDays(e.target.value)}
                placeholder="e.g. 90"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {creating ? 'Generating…' : 'Generate Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {keys.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No API keys yet.</p>
            <p className="text-xs mt-1">Generate a key to start using the Poloko Research API.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {keys.map(key => (
              <div key={key.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {key.label ?? 'Unnamed key'}
                    </span>
                    {key.is_active ? (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">Active</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Revoked</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Created {formatDate(key.created_at)}
                    {key.expires_at && ` · Expires ${formatDate(key.expires_at)}`}
                    {' · '}{key.usage_count.toLocaleString()} request{key.usage_count !== 1 ? 's' : ''}
                  </p>
                  {key.listing_id && (
                    <p className="text-xs text-blue-600 mt-0.5">Scoped to specific listing</p>
                  )}
                </div>
                {key.is_active && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="shrink-0 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="Revoke key"
                  >
                    {revoking === key.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />
                    }
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage instructions */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">How to use your API key</h3>
        <pre className="text-xs bg-white border border-gray-100 rounded-lg p-3 overflow-x-auto text-gray-600">
{`curl https://your-domain.com/api/v1/datasets \\
  -H "Authorization: Bearer pik_your_key_here"`}
        </pre>
        <p className="text-xs text-gray-400 mt-2">
          Returns paginated JSON of published research listings you have access to.
          Add <code className="bg-gray-100 px-1 rounded">?page=2&limit=25</code> for pagination.
        </p>
      </div>
    </div>
  )
}
