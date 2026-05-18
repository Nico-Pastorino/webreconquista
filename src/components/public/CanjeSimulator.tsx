'use client'

import { useState } from 'react'
import { MessageCircle, RotateCcw } from 'lucide-react'
import { formatARS, formatUSD } from '@/lib/calculations'
import { buildWhatsAppUrl } from '@/lib/utils'
import type { TradeInResult } from '@/types'

interface Props {
  models: string[]
  dollarRate: number
  whatsappNumber: string
}

const BATTERY_OPTIONS = [
  { value: '100-90',   label: '100% a 90%' },
  { value: '89-70',    label: '89% a 70%' },
  { value: 'MENOS-70', label: 'Menos de 70%' },
]


const selectCls =
  'w-full appearance-none rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5 disabled:opacity-50'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-[#374151]">
      {children}
    </label>
  )
}

export default function CanjeSimulator({ models, dollarRate, whatsappNumber }: Props) {
  const [selectedModel, setSelectedModel] = useState('')
  const [capacities, setCapacities] = useState<string[]>([])
  const [selectedCapacity, setSelectedCapacity] = useState('')
  const [batteryState, setBatteryState] = useState('100-90')
  const [result, setResult] = useState<TradeInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCaps, setLoadingCaps] = useState(false)

  const fieldsReady = selectedModel && selectedCapacity

  async function handleModelChange(model: string) {
    setSelectedModel(model)
    setSelectedCapacity('')
    setResult(null)
    if (!model) return
    setLoadingCaps(true)
    try {
      const res = await fetch(`/api/tradein/capacities?model=${encodeURIComponent(model)}`)
      const data = await res.json()
      const caps: string[] = data.capacities ?? []
      setCapacities(caps)
      if (caps[0]) setSelectedCapacity(caps[0])
    } finally {
      setLoadingCaps(false)
    }
  }

  async function handleCalculate() {
    if (!fieldsReady) return
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams({
        model: selectedModel,
        capacity: selectedCapacity,
        battery: batteryState,
      })
      const res = await fetch(`/api/tradein?${params}`)
      if (res.ok) setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
  }

  // WhatsApp message
  const batteryLabel = BATTERY_OPTIONS.find((o) => o.value === batteryState)?.label ?? batteryState

  const waMsg = result
    ? [
        'Hola, quiero consultar por un Plan Canje en Store RQTA.',
        '',
        'Mi equipo:',
        `• Modelo: ${selectedModel}`,
        `• Capacidad: ${selectedCapacity}`,
        `• Batería: ${batteryLabel}`,
        `• Valor estimado: ${formatUSD(result.trade_in_value_usd)} (${formatARS(result.trade_in_value_ars)})`,
        '',
        '¿Están disponibles para coordinarlo?',
      ].join('\n')
    : ''

  const waUrl = result && whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, waMsg)
    : null

  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-7 sm:p-8">
      {/* Card header */}
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9CA3AF]">
        Simulador
      </p>
      <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#111111] sm:text-2xl">
        Cuánto vale tu iPhone
      </h2>

      {/* Form */}
      <div className="mt-6 flex flex-col gap-5">
        {/* Model */}
        <div>
          <FieldLabel>Modelo</FieldLabel>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className={selectCls}
          >
            <option value="">Seleccioná tu modelo</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        {selectedModel && (
          <div>
            <FieldLabel>Capacidad</FieldLabel>
            <select
              value={selectedCapacity}
              onChange={(e) => { setSelectedCapacity(e.target.value); setResult(null) }}
              disabled={loadingCaps}
              className={selectCls}
            >
              {loadingCaps
                ? <option>Cargando…</option>
                : capacities.map((c) => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>
        )}

        {/* Battery */}
        {fieldsReady && (
          <div>
            <FieldLabel>Batería</FieldLabel>
            <select
              value={batteryState}
              onChange={(e) => { setBatteryState(e.target.value); setResult(null) }}
              className={selectCls}
            >
              {BATTERY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}



        {/* Calculate / Result */}
        {fieldsReady && !result && (
          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="mt-1 w-full rounded-full bg-[#111111] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
          >
            {loading ? 'Calculando…' : 'Calcular valor de canje'}
          </button>
        )}

        {result && (
          <>
            {/* Result box */}
            <div className="rounded-[18px] bg-[#f7f5f2] px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9CA3AF]">
                Valor estimado
              </p>
              <p className="mt-2 text-[2.25rem] font-semibold leading-none tracking-[-0.04em] text-[#111111]">
                {formatARS(result.trade_in_value_ars)}
              </p>
              <p className="mt-1.5 text-xs text-[#9CA3AF]">
                {formatUSD(result.trade_in_value_usd)} · Dólar ${dollarRate.toLocaleString('es-AR')}
              </p>
            </div>

            {/* CTA */}
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#111111] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f]"
              >
                <MessageCircle className="h-4 w-4" />
                Reservar canje
              </a>
            ) : (
              <div className="rounded-full bg-[#f5f5f7] py-3.5 text-center text-xs text-[#9CA3AF]">
                WhatsApp no configurado
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="flex w-full items-center justify-center gap-1.5 text-xs text-[#9CA3AF] transition-colors hover:text-[#666]"
            >
              <RotateCcw className="h-3 w-3" />
              Volver a calcular
            </button>
          </>
        )}
      </div>
    </div>
  )
}
