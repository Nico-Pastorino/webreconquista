'use client'

import { useState } from 'react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { formatARS, formatUSD } from '@/lib/calculations'
import type { TradeInResult } from '@/types'

interface Props {
  models: string[]
  productPriceUsd?: number
  dollarRate: number
}

const BATTERY_OPTIONS = [
  { value: 'excelente', label: 'Excelente (batería > 85%)' },
  { value: 'bueno', label: 'Bueno (batería 70-85%)' },
  { value: 'regular', label: 'Regular (batería < 70%)' },
]

export default function TradeInSimulator({ models, productPriceUsd, dollarRate }: Props) {
  const [selectedModel, setSelectedModel] = useState('')
  const [capacities, setCapacities] = useState<string[]>([])
  const [selectedCapacity, setSelectedCapacity] = useState('')
  const [batteryState, setBatteryState] = useState('excelente')
  const [result, setResult] = useState<TradeInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCaps, setLoadingCaps] = useState(false)

  async function handleModelChange(model: string) {
    setSelectedModel(model)
    setSelectedCapacity('')
    setResult(null)
    if (!model) return
    setLoadingCaps(true)
    try {
      const res = await fetch(`/api/tradein/capacities?model=${encodeURIComponent(model)}`)
      const data = await res.json()
      setCapacities(data.capacities ?? [])
      if (data.capacities?.[0]) setSelectedCapacity(data.capacities[0])
    } finally {
      setLoadingCaps(false)
    }
  }

  async function handleCalculate() {
    if (!selectedModel || !selectedCapacity) return
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams({
        model: selectedModel,
        capacity: selectedCapacity,
        battery: batteryState,
        ...(productPriceUsd ? { productPrice: String(productPriceUsd) } : {}),
      })
      const res = await fetch(`/api/tradein?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const modelOptions = [
    { value: '', label: 'Seleccioná tu modelo' },
    ...models.map((m) => ({ value: m, label: m })),
  ]
  const capacityOptions = loadingCaps
    ? [{ value: '', label: 'Cargando...' }]
    : [
        { value: '', label: 'Seleccioná capacidad' },
        ...capacities.map((c) => ({ value: c, label: c })),
      ]

  return (
    <div className="rounded-[36px] bg-white p-7 shadow-[0_28px_70px_rgba(17,17,17,0.06)] sm:p-9">
      <h3 className="mb-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
        Simulador Plan Canje
      </h3>
      <p className="mb-8 max-w-md text-sm leading-7 text-[#6B7280]">
        Ingresá los datos de tu iPhone usado y te decimos cuánto vale.
      </p>
      <p className="mb-8 text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">
        Dólar de referencia ${dollarRate}
      </p>

      <div className="flex flex-col gap-5">
        <Select
          label="Modelo de tu iPhone"
          options={modelOptions}
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
        />
        {selectedModel && (
          <Select
            label="Capacidad"
            options={capacityOptions}
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
          />
        )}
        {selectedModel && selectedCapacity && (
          <Select
            label="Estado de la batería"
            options={BATTERY_OPTIONS}
            value={batteryState}
            onChange={(e) => setBatteryState(e.target.value)}
          />
        )}

        <Button
          onClick={handleCalculate}
          loading={loading}
          disabled={!selectedModel || !selectedCapacity}
          className="mt-2 w-full"
          size="lg"
        >
          Calcular valor de canje
        </Button>
      </div>

      {result && (
        <div className="premium-surface mt-8 rounded-[30px] p-6">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">
            Resultado
          </p>
          <div className="space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">Valor de tu usado</span>
              <span className="text-right font-semibold text-[#111111]">
                {formatARS(result.trade_in_value_ars)} ({formatUSD(result.trade_in_value_usd)})
              </span>
            </div>
            {productPriceUsd && (
              <>
                <div className="my-4 border-t border-black/6" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="block text-sm text-[#6B7280]">Pagás</span>
                    <span className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">{formatARS(result.final_price_ars)}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">{formatUSD(result.final_price_usd)} USD</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
