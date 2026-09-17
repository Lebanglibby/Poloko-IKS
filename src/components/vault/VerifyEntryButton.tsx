'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface Props {
  entryId: string
}

export function VerifyEntryButton({ entryId }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { toast } = useToast()

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
        toast({ type: 'error', message: json.error ?? 'Verification failed' })
        return
      }
      setState('done')
      toast({ type: 'success', message: 'Entry verified', description: 'Your community verification has been recorded.' })
    } catch {
      const msg = 'An unexpected error occurred.'
      setErrorMsg(msg)
      setState('error')
      toast({ type: 'error', message: msg })
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Verified — thank you!
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleVerify}
        disabled={state === 'loading'}
        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        aria-busy={state === 'loading'}
        aria-label="Verify this knowledge entry"
      >
        {state === 'loading'
          ? <><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Verifying…</>
          : <><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Verify this Entry</>
        }
      </button>
      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-400 mt-1.5" role="alert">{errorMsg}</p>
      )}
    </div>
  )
}
