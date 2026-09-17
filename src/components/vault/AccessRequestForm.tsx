'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  entryId: string
}

export function AccessRequestForm({ entryId }: Props) {
  const [justification, setJustification] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: entryId,
          justification: justification.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Failed to submit request')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setErrorMsg('An unexpected error occurred.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
        <CheckCircle2 className="h-4 w-4" />
        Request submitted — awaiting review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Justification <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Briefly explain why you need access to this entry…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>
      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === 'loading' ? 'Submitting…' : 'Request Access'}
      </button>
    </form>
  )
}
