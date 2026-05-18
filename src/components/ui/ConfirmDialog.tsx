'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

interface ConfirmContextType {
  _show: (pending: PendingConfirm) => void
}

// ─── Context ──────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const [exiting, setExiting] = useState(false)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback(
    (value: boolean) => {
      if (!pending) return
      setExiting(true)
      const captured = pending
      setTimeout(() => {
        captured.resolve(value)
        setPending(null)
        setExiting(false)
      }, 180)
    },
    [pending],
  )

  const _show = useCallback((p: PendingConfirm) => {
    setExiting(false)
    setPending(p)
  }, [])

  // ESC to cancel
  useEffect(() => {
    if (!pending) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, dismiss])

  // Focus the default button when dialog opens
  useEffect(() => {
    if (pending && !exiting) {
      setTimeout(() => {
        if (pending.variant === 'destructive') {
          cancelBtnRef.current?.focus()
        } else {
          confirmBtnRef.current?.focus()
        }
      }, 50)
    }
  }, [pending, exiting])

  // Prevent body scroll while open
  useEffect(() => {
    if (pending) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [pending])

  return (
    <ConfirmContext.Provider value={{ _show }}>
      {children}

      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-msg"
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${
            exiting ? 'dialog-backdrop-out' : 'dialog-backdrop-in'
          }`}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => dismiss(false)}
        >
          <div
            className={`relative w-full max-w-[356px] overflow-hidden rounded-[28px] bg-[#18181b] p-7 shadow-[0_32px_64px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.08] ${
              exiting ? 'dialog-panel-out' : 'dialog-panel-in'
            }`}
            onClick={(e) => e.stopPropagation()}
            // Focus trap: keep tab within the dialog
            onKeyDown={(e) => {
              if (e.key !== 'Tab') return
              const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean) as HTMLButtonElement[]
              if (!focusable.length) return
              const first = focusable[0]
              const last = focusable[focusable.length - 1]
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus()
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus()
              }
            }}
          >
            {/* Icon */}
            <div
              className={`mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-full ${
                pending.variant === 'destructive'
                  ? 'bg-red-500/[0.15]'
                  : 'bg-amber-500/[0.15]'
              }`}
            >
              {pending.variant === 'destructive' ? (
                <Trash2 className="h-[18px] w-[18px] text-red-400" />
              ) : (
                <AlertTriangle className="h-[18px] w-[18px] text-amber-400" />
              )}
            </div>

            {/* Content */}
            <h2
              id="confirm-title"
              className="text-[17px] font-semibold leading-snug tracking-[-0.025em] text-white"
            >
              {pending.title}
            </h2>
            <p id="confirm-msg" className="mt-2.5 text-sm leading-relaxed text-zinc-400">
              {pending.message}
            </p>
            {pending.detail && (
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {pending.detail}
              </p>
            )}

            {/* Buttons */}
            <div className="mt-7 flex gap-2.5">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => dismiss(false)}
                className="flex-1 rounded-full border border-white/[0.1] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/75 transition-all hover:bg-white/[0.11] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {pending.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={() => dismiss(true)}
                className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 ${
                  pending.variant === 'destructive'
                    ? 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-400'
                    : 'bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:ring-white/40'
                }`}
              >
                {pending.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => ctx._show({ ...options, resolve })),
    [ctx],
  )
}
