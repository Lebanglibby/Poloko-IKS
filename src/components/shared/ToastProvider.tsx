'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle2; bar: string; iconBg: string; iconColor: string; bg: string; border: string
}> = {
  success: {
    icon:      CheckCircle2,
    bar:       'bg-[#15803D]',
    iconBg:    'bg-[#F0FDF4]',
    iconColor: 'text-[#15803D]',
    bg:        'bg-white',
    border:    'border-[#BBF7D0]',
  },
  error: {
    icon:      XCircle,
    bar:       'bg-red-600',
    iconBg:    'bg-red-50',
    iconColor: 'text-red-600',
    bg:        'bg-white',
    border:    'border-red-200',
  },
  warning: {
    icon:      AlertTriangle,
    bar:       'bg-[#B45309]',
    iconBg:    'bg-[#FFFBEB]',
    iconColor: 'text-[#B45309]',
    bg:        'bg-white',
    border:    'border-[#FDE68A]',
  },
  info: {
    icon:      Info,
    bar:       'bg-blue-600',
    iconBg:    'bg-blue-50',
    iconColor: 'text-blue-600',
    bg:        'bg-white',
    border:    'border-blue-200',
  },
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const conf   = TOAST_CONFIG[t.type]
  const Icon   = conf.icon
  const timer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timer.current = setTimeout(() => onDismiss(t.id), t.duration ?? 4500)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [t.id, t.duration, onDismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'toast-enter relative w-80 rounded-2xl border shadow-lg shadow-[#1F2937]/8 overflow-hidden',
        conf.bg, conf.border
      )}
    >
      {/* Left colour bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', conf.bar)} aria-hidden="true" />

      <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
        <div className={cn('shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5', conf.iconBg)}>
          <Icon className={cn('h-4 w-4', conf.iconColor)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1F2937]">{t.message}</p>
          {t.description && (
            <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">{t.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(t.id)}
          className="shrink-0 p-1 rounded-lg text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F0EB] transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev.slice(-4), { ...opts, id }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
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
