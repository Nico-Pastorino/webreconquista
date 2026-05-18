'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import type { ExchangeRate } from '@/types'
import { useToast } from '@/components/ui/Toast'

interface Props {
  currentRate: ExchangeRate | null
  latestError?: string | null
}

const FALLBACK_RATE: ExchangeRate = {
  id: 1,
  api_value: 1200,
  admin_margin: 0,
  final_value: 1200,
  source: 'legacy_fallback',
  last_api_update: null,
  last_manual_update: null,
  updated_at: new Date().toISOString(),
}

export default function DollarEditor({ currentRate, latestError = null }: Props) {
  const router = useRouter()
  const toast = useToast()
  const rate = currentRate ?? FALLBACK_RATE
  const [margin, setMargin] = useState(rate.admin_margin.toString())
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [marginError, setMarginError] = useState('')

  async function handleSave() {
    const parsedMargin = Number(margin)
    if (margin === '' || !Number.isFinite(parsedMargin) || parsedMargin < 0) {
      setMarginError('Ingresá un margen válido mayor o igual a 0')
      return
    }
    setLoading(true)
    setMarginError('')
    try {
      const res = await fetch('/api/admin/dollar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_margin: parsedMargin }),
      })
      if (res.ok) {
        toast.success('Margen guardado')
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? 'Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncFromApi() {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/dollar', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.warning(data.error ?? 'No se pudo actualizar la cotización. Se mantiene el último valor válido.')
        return
      }
      setMargin(String(data.rate.admin_margin))
      toast.success('Cotización actualizada')
      router.refresh()
    } finally {
      setSyncing(false)
    }
  }

  const parsedMargin = Number(margin)
  const previewFinalRate = rate.api_value + (Number.isFinite(parsedMargin) ? parsedMargin : 0)
  const preview = 1099 * previewFinalRate

  return (
    <div className="max-w-sm">
      <div className="surface-card rounded-[2rem] p-8">
        <p className="admin-section-heading">Dólar aplicado</p>
        <p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[#111111]">
          ${rate.final_value.toLocaleString('es-AR')}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#666666]">ARS por USD final</p>

        <div className="mt-8 space-y-5">
          <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F5F5F7] px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#666666]">Dólar API actual</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              ${rate.api_value.toLocaleString('es-AR')}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Última actualización API: {rate.last_api_update ? new Date(rate.last_api_update).toLocaleString('es-AR') : 'nunca'}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Última modificación manual: {rate.last_manual_update ? new Date(rate.last_manual_update).toLocaleString('es-AR') : 'nunca'}
            </p>
            <button
              onClick={handleSyncFromApi}
              disabled={syncing || loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Actualizando
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Actualizar ahora
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#111111]">Margen sobre dólar</label>
            <input
              type="number"
              placeholder="30"
              min="0"
              step="1"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full rounded-[22px] border border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
            />
            {marginError && <p className="text-xs text-[#666666]">{marginError}</p>}
          </div>

          <div className="rounded-[22px] bg-[#f5f5f7] px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#666666]">Dólar final con margen</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111111]">
              ${previewFinalRate.toLocaleString('es-AR')} ARS
            </p>
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
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando
              </>
            ) : 'Guardar margen'}
          </button>
        </div>
      </div>
    </div>
  )
}
