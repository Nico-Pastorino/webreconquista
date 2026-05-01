'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, RefreshCw } from 'lucide-react'
import type { PublicDollarQuote } from '@/lib/dollar-api'

interface Props {
  currentRate: number
  lastUpdatedAt?: string | null
  publicQuote?: PublicDollarQuote | null
}

export default function DollarEditor({ currentRate, lastUpdatedAt = null, publicQuote = null }: Props) {
  const router = useRouter()
  const [rate, setRate] = useState(currentRate.toString())
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!rate || isNaN(Number(rate))) {
      setError('Ingresá un valor válido')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/dollar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: parseFloat(rate) }),
      })
      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncFromApi() {
    setSyncing(true)
    setError('')
    try {
      const res = await fetch('/api/admin/dollar', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'No se pudo sincronizar')
        return
      }

      setRate(String(data.rate))
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSyncing(false)
    }
  }

  const preview = 1099 * (parseFloat(rate) || 0)

  return (
    <div className="max-w-sm">
      <div className="surface-card rounded-[2rem] p-8">
        <p className="admin-section-heading">Valor actual</p>
        <p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[#111111]">
          ${currentRate.toLocaleString('es-AR')}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#666666]">ARS por USD</p>
        {lastUpdatedAt && (
          <p className="mt-3 text-xs text-[#6B7280]">
            Última actualización guardada: {new Date(lastUpdatedAt).toLocaleString('es-AR')}
          </p>
        )}

        <div className="mt-8 space-y-5">
          {publicQuote && (
            <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F5F5F7] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#666666]">
                API pública · {publicQuote.name}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                ${publicQuote.sell.toLocaleString('es-AR')}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Compra ${publicQuote.buy.toLocaleString('es-AR')} · Actualizado {new Date(publicQuote.updatedAt).toLocaleString('es-AR')}
              </p>
              <button
                onClick={handleSyncFromApi}
                disabled={syncing}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sincronizando
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Usar cotización pública
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#111111]">Nuevo valor</label>
            <input
              type="number"
              placeholder="1200"
              min="1"
              step="1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full rounded-[22px] border border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
            />
            {error && <p className="text-xs text-[#666666]">{error}</p>}
          </div>

          <div className="rounded-[22px] bg-[#f5f5f7] px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#666666]">Preview iPhone $1,099</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111111]">
              ${preview.toLocaleString('es-AR')} ARS
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || syncing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
          >
            {saved ? (
              <><Check className="h-4 w-4" /> Guardado</>
            ) : loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando
              </>
            ) : 'Actualizar dólar'}
          </button>
        </div>
      </div>
    </div>
  )
}
