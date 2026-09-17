'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface Props { entryId: string }

export function VerifyEntryButton({ entryId }: Props) {
  const [state, setState]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { toast }             = useToast()

  async function handleVerify() {
    setState('loading')
    setErrorMsg(null)
    try {
      const res  = await fetch('/api/verify', {
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
      toast({ type: 'success', message: 'Entry verified — thank you!', description: 'Your community verification has been recorded in the archive.' })
    } catch {
      const msg = 'An unexpected error occurred.'
      setErrorMsg(msg)
      setState('error')
      toast({ type: 'error', message: msg })
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-[#15803D] shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-[#14532D]">Thank you for verifying!</p>
          <p className="text-xs text-[#15803D] mt-0.5">Your verification helps build trust in the archive.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleVerify}
        disabled={state === 'loading'}
        className="flex items-center gap-2 text-sm font-bold bg-[#15803D] hover:bg-[#14532D] text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
        aria-busy={state === 'loading'}
        aria-label="Verify this knowledge entry as accurate"
      >
        {state === 'loading'
          ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…</>
          : <><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Mark as Verified</>
        }
      </button>
      {state === 'error' && errorMsg && (
        <p className="text-sm text-red-600 font-medium mt-2" role="alert">{errorMsg}</p>
      )}
    </div>
  )
}
