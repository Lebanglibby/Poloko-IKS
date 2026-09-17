'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  entryId: string
}

export function VerifyEntryButton({ entryId }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleVerify() {
    setState('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Verification failed')
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
        Verified — thank you!
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleVerify}
        disabled={state === 'loading'}
        className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60 flex items-center gap-1.5"
      >
        {state === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
        {state === 'loading' ? 'Verifying…' : 'Verify this Entry'}
      </button>
      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-600 mt-1.5">{errorMsg}</p>
      )}
    </div>
  )
}
