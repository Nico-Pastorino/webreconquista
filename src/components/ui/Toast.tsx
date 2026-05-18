'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
  exiting: boolean
}

export interface ToastAPI {
  success: (message: string, duration?: number) => void
  error:   (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info:    (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastAPI | null>(null)

// ─── Individual toast ──────────────────────────────────────────

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-400" />,
  error:   <XCircle      className="h-[18px] w-[18px] text-red-400" />,
  warning: <AlertTriangle className="h-[18px] w-[18px] text-amber-400" />,
  info:    <Info          className="h-[18px] w-[18px] text-blue-400" />,
}

const ICON_BG: Record<ToastType, string> = {
  success: 'bg-emerald-500/[0.15]',
  error:   'bg-red-500/[0.15]',
  warning: 'bg-amber-500/[0.15]',
  info:    'bg-blue-500/[0.15]',
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastItem
  onRemove: (id: string) => void
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex w-full items-center gap-3 rounded-[16px] bg-[#18181b] px-4 py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.08] sm:w-auto sm:min-w-[280px] sm:max-w-[360px] ${
        toast.exiting ? 'toast-out' : 'toast-in'
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_BG[toast.type]}`}
      >
        {ICON[toast.type]}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug text-white">
        {toast.message}
      </p>

      {/* Close */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Cerrar"
        className="shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-zinc-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function startExit(id: string) {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 240)
  }

  function add(type: ToastType, message: string, duration = 4000) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, type, message, duration, exiting: false }])
    setTimeout(() => startExit(id), duration)
  }

  const api: ToastAPI = {
    success: (m, d) => add('success', m, d),
    error:   (m, d) => add('error',   m, d),
    warning: (m, d) => add('warning', m, d),
    info:    (m, d) => add('info',    m, d),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container — top-right desktop, bottom mobile */}
      {toasts.length > 0 && (
        <div
          aria-label="Notificaciones"
          className="fixed bottom-5 left-4 right-4 z-[300] flex flex-col gap-2.5 sm:bottom-auto sm:left-auto sm:right-5 sm:top-5 sm:items-end"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={startExit} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
