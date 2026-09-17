'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Lock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/shared/ToastProvider'
import type { AccessTier } from '@/lib/types'

interface Props {
  entryId: string
  tier?: AccessTier
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
      const res  = await fetch('/api/access', {
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
          ? 'The Elder Board will review your request soon.'
          : 'You will be notified when your request is reviewed.',
      })
    } catch {
      const msg = 'An unexpected error occurred. Please try again.'
      setErrorMsg(msg)
      setState('error')
      toast({ type: 'error', message: msg })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={cn(
        'rounded-2xl border p-5 text-center',
        isSacred ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#FDE68A] bg-[#FFFBEB]'
      )}>
        <div className={cn(
          'h-10 w-10 rounded-full mx-auto mb-3 flex items-center justify-center',
          isSacred ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'
        )}>
          {isSacred
            ? <Shield className="h-5 w-5 text-[#B91C1C]" aria-hidden="true" />
            : <Lock className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
          }
        </div>
        <p className="text-sm font-semibold text-[#1F2937] mb-1">Sign in to request access</p>
        <p className="text-sm text-[#4B5563] mb-4">
          You need an account to request access to this {isSacred ? 'sacred' : 'restricted'} entry.
        </p>
        <a
          href="/login"
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-colors shadow-sm',
            isSacred ? 'bg-[#B91C1C] hover:bg-[#991B1B]' : 'bg-[#9A3412] hover:bg-[#7C2D12]'
          )}
        >
          Sign In to Continue
        </a>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
        <div className="h-9 w-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-[#15803D]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#14532D]">Request submitted successfully</p>
          <p className="text-xs text-[#15803D] mt-0.5">
            {isSacred ? 'The Elder Board will review your request.' : 'You will be notified within 48 hours.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Request access form">
      {/* Tier info */}
      <div className={cn(
        'flex items-start gap-3 rounded-2xl border p-4',
        isSacred ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#FDE68A] bg-[#FFFBEB]'
      )}>
        <div className={cn(
          'shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isSacred ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'
        )}>
          {isSacred
            ? <Shield className="h-4 w-4 text-[#B91C1C]" aria-hidden="true" />
            : <Lock className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
          }
        </div>
        <div>
          <p className={cn('text-sm font-bold', isSacred ? 'text-[#7F1D1D]' : 'text-[#78350F]')}>
            {isSacred ? 'Elder Board Approval Required' : 'Restricted Access Entry'}
          </p>
          <p className={cn('text-xs mt-1 leading-relaxed', isSacred ? 'text-[#B91C1C]' : 'text-[#B45309]')}>
            {isSacred
              ? 'This knowledge is protected under community sovereignty. Your request will be carefully reviewed by the Elder Board before any access is granted.'
              : 'Please provide a reason for your access request. Researchers and community members will be reviewed within 48 hours.'
            }
          </p>
        </div>
      </div>

      {/* Justification */}
      <div>
        <label htmlFor={`just-${entryId}`} className="block text-sm font-semibold text-[#1F2937] mb-1.5">
          Why do you need access?{' '}
          <span className="font-normal text-[#9CA3AF]">(optional but recommended)</span>
        </label>
        <textarea
          id={`just-${entryId}`}
          rows={3}
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Briefly explain your purpose or affiliation…"
          className="w-full border-2 border-[#E8DDD0] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9A3412] transition-colors resize-none bg-white"
        />
      </div>

      {state === 'error' && errorMsg && (
        <p className="text-sm text-red-600 font-medium" role="alert">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          isSacred
            ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white'
            : 'bg-[#9A3412] hover:bg-[#7C2D12] text-white'
        )}
        aria-busy={state === 'loading'}
      >
        {state === 'loading'
          ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
          : isSacred
          ? <><Shield className="h-4 w-4" aria-hidden="true" /> Submit to Elder Board</>
          : <><Lock className="h-4 w-4" aria-hidden="true" /> Request Access</>
        }
      </button>
    </form>
  )
}
