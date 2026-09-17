'use client'

/**
 * Lightweight toast system for Poloko IKS.
 * Usage:
 *   const { toast } = useToast()
 *   toast({ type: 'success', message: 'Hash copied!' })
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number  // ms; default 4000
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

/* ─── Context ────────────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/* ─── Icon & colour map ──────────────────────────────────────────────────────── */
const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle2
  bar: string
  iconColor: string
  bg: string
  border: string
  title: string
}> = {
  success: {
    icon: CheckCircle2,
    bar:       'bg-emerald-500',
    iconColor: 'text-emerald-400',
    bg:        'bg-slate-800',
    border:    'border-emerald-500/30',
    title:     'text-slate-100',
  },
  error: {
    icon: XCircle,
    bar:       'bg-red-500',
    iconColor: 'text-red-400',
    bg:        'bg-slate-800',
    border:    'border-red-500/30',
    title:     'text-slate-100',
  },
  warning: {
    icon: AlertTriangle,
    bar:       'bg-amber-500',
    iconColor: 'text-amber-400',
    bg:        'bg-slate-800',
    border:    'border-amber-500/30',
    title:     'text-slate-100',
  },
  info: {
    icon: Info,
    bar:       'bg-blue-500',
    iconColor: 'text-blue-400',
    bg:        'bg-slate-800',
    border:    'border-blue-500/30',
    title:     'text-slate-100',
  },
}

/* ─── Individual toast item ──────────────────────────────────────────────────── */
function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const conf = TOAST_CONFIG[t.type]
  const Icon = conf.icon
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const duration = t.duration ?? 4000
    timerRef.current = setTimeout(() => onDismiss(t.id), duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [t.id, t.duration, onDismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'toast-enter relative w-80 rounded-xl border shadow-xl shadow-black/40 overflow-hidden',
        conf.bg, conf.border
      )}
    >
      {/* Coloured leading bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', conf.bar)} aria-hidden="true" />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', conf.iconColor)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', conf.title)}>{t.message}</p>
          {t.description && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(t.id)}
          className="shrink-0 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ─── Provider ───────────────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]) // cap at 5
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
