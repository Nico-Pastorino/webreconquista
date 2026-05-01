'use client'

import { useState } from 'react'
import type { TradeInValue } from '@/types'
import { Trash2, Plus } from 'lucide-react'

const BATTERY_OPTIONS = [
  { value: 'excelente', label: 'Excelente (> 85%)' },
  { value: 'bueno', label: 'Bueno (70-85%)' },
  { value: 'regular', label: 'Regular (< 70%)' },
]
const STATE_LABELS: Record<string, string> = { excelente: 'Excelente', bueno: 'Bueno', regular: 'Regular' }

interface Props { initialValues: TradeInValue[] }

const inputCls = 'w-full rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#111111] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'

export default function TradeInManager({ initialValues }: Props) {
  const [values, setValues] = useState(initialValues)
  const [form, setForm] = useState({ model: '', capacity: '', battery_state: 'excelente', value_usd: '' })
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleAdd() {
    if (!form.model || !form.capacity || !form.value_usd) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/tradein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value_usd: parseFloat(form.value_usd) }),
      })
      const data = await res.json()
      setValues((prev) => {
        const exists = prev.find((v) => v.id === data.value.id)
        return exists ? prev.map((v) => (v.id === data.value.id ? data.value : v)) : [...prev, data.value]
      })
      setForm({ model: '', capacity: '', battery_state: 'excelente', value_usd: '' })
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta entrada?')) return
    setDeleting(id)
    try {
      await fetch('/api/admin/tradein', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setValues((prev) => prev.filter((v) => v.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const grouped = values.reduce<Record<string, TradeInValue[]>>((acc, v) => {
    acc[v.model] = acc[v.model] ?? []
    acc[v.model].push(v)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([model, entries]) => (
        <div key={model} className="surface-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-[#eaeaea] bg-[#f5f5f7] px-5 py-3.5">
            <p className="text-sm font-semibold tracking-[-0.02em] text-[#111111]">{model}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eaeaea]">
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#666666]">Capacidad</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#666666]">Batería</th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-[0.18em] text-[#666666]">Valor USD</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {entries
                .sort((a, b) => a.capacity.localeCompare(b.capacity) || a.battery_state.localeCompare(b.battery_state))
                .map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#f5f5f7]/50">
                    <td className="px-5 py-3 font-medium text-[#111111]">{entry.capacity}</td>
                    <td className="px-5 py-3 text-[#666666]">{STATE_LABELS[entry.battery_state]}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#111111]">${entry.value_usd}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111] disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      {values.length === 0 && (
        <div className="surface-card rounded-[2rem] py-12 text-center">
          <p className="text-sm text-[#666666]">No hay entradas. Agregá la primera.</p>
        </div>
      )}

      <div className="surface-muted p-6">
        <p className="admin-section-heading mb-5">Agregar entrada</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Modelo</label>
            <input placeholder="iPhone 14" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Capacidad</label>
            <input placeholder="128GB" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Estado batería</label>
            <select value={form.battery_state} onChange={(e) => setForm((f) => ({ ...f, battery_state: e.target.value }))} className={inputCls + ' appearance-none'}>
              {BATTERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Valor USD</label>
            <input type="number" placeholder="350" min="0" value={form.value_usd} onChange={(e) => setForm((f) => ({ ...f, value_usd: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !form.model || !form.capacity || !form.value_usd}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>
    </div>
  )
}
