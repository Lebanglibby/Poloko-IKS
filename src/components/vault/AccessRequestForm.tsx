'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Lock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/shared/ToastProvider'
import type { AccessTier } from '@/lib/types'

interface Props {
  entryId: string
  tier?: AccessTier
  /** If false, show sign-in prompt instead of form */
  isAuthenticated?: boolean
}

export function AccessRequestForm({ entryId, tier = 'restricted', isAuthenticated = true }: Props) {
  const [justification, setJustification] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { toast } = useToast()

  const isSacred = tier === 'sacred'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId, justification: justification.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Failed to submit request')
        setState('error')
        toast({ type: 'error', message: json.error ?? 'Failed to submit request' })
        return
      }
      setState('done')
      toast({
        type: 'success',
        message: 'Access request submitted',
        description: isSacred
          ? 'The Elder Board will review your request.'
          : 'You will be notified when reviewed.',
      })
    } catch {
      const msg = 'An unexpected error occurred.'
      setErrorMsg(msg)
      setState('error')
      toast({ type: 'error', message: msg })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={cn(
        'rounded-xl border p-4 text-center',
        isSacred
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
      )}>
        <Lock className={cn('h-5 w-5 mx-auto mb-2', isSacred ? 'text-red-400' : 'text-amber-400')} aria-hidden="true" />
        <p className="text-xs text-slate-300 mb-3">
          Sign in to request access to this {isSacred ? 'sacred' : 'restricted'} entry.
        </p>
        <a
          href="/login"
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
            isSacred
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          )}
        >
          Sign In
        </a>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        Request submitted — awaiting{isSacred ? ' Elder Board' : ''} review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Request access form">
      {/* Tier warning banner */}
      <div className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
        isSacred
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
      )}>
        {isSacred
          ? <Shield className="h-4 w-4 text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
          : <Lock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        }
        <div>
          <p className={cn('text-xs font-semibold', isSacred ? 'text-red-300' : 'text-amber-300')}>
            {isSacred ? 'Elder Board Approval Required' : 'Restricted Access'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isSacred
              ? 'This entry is protected under community sovereignty. Your request will be reviewed by the Elder Board before any access is granted.'
              : 'Provide a justification for your request. Approved researchers and community members will be notified within 48 hours.'
            }
          </p>
        </div>
      </div>

      {/* Justification textarea */}
      <div>
        <label
          htmlFor={`justification-${entryId}`}
          className="block text-xs font-medium text-slate-300 mb-1.5"
        >
          Justification{' '}
          <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea
          id={`justification-${entryId}`}
          rows={3}
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Briefly explain why you need access to this entry…"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all resize-none"
        />
      </div>

      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-400" role="alert">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          isSacred
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        )}
        aria-busy={state === 'loading'}
      >
        {state === 'loading'
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Submitting…</>
          : isSacred
          ? <><Shield className="h-3.5 w-3.5" aria-hidden="true" /> Submit to Elder Board</>
          : <><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Request Access</>
        }
      </button>
    </form>
  )
}
