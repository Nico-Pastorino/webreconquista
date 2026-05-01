'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InstallmentPlan } from '@/types'
import { Trash2, Plus } from 'lucide-react'

interface Props {
  initialPlans: InstallmentPlan[]
}

const inputCls = 'rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#111111] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'

export default function InstallmentsManager({ initialPlans }: Props) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [newMonths, setNewMonths] = useState('')
  const [newSurcharge, setNewSurcharge] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)

  async function toggleActive(plan: InstallmentPlan) {
    setSaving(true)
    await fetch('/api/admin/installments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, active: !plan.active }),
    })
    setPlans((p) => p.map((pl) => (pl.id === plan.id ? { ...pl, active: !pl.active } : pl)))
    setSaving(false)
  }

  async function updatePlan(plan: InstallmentPlan, field: string, value: string) {
    const updated = { ...plan, [field]: field === 'surcharge_pct' ? parseFloat(value) : value }
    setPlans((p) => p.map((pl) => (pl.id === plan.id ? updated : pl)))
    await fetch('/api/admin/installments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    router.refresh()
  }

  async function deletePlan(id: number) {
    if (!confirm('¿Eliminar este plan?')) return
    await fetch('/api/admin/installments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setPlans((p) => p.filter((pl) => pl.id !== id))
  }

  async function addPlan() {
    if (!newMonths || !newSurcharge) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/installments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          months: parseInt(newMonths),
          surcharge_pct: parseFloat(newSurcharge),
          label: newLabel || null,
        }),
      })
      const data = await res.json()
      setPlans((p) => {
        const exists = p.find((pl) => pl.id === data.plan.id)
        return exists ? p.map((pl) => (pl.id === data.plan.id ? data.plan : pl)) : [...p, data.plan]
      })
      setNewMonths('')
      setNewSurcharge('')
      setNewLabel('')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Tabla */}
      <div className="surface-card overflow-hidden rounded-[2rem]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eaeaea] bg-[#f5f5f7]">
              <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Cuotas</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Recargo %</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Etiqueta</th>
              <th className="px-5 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Activo</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaeaea]">
            {plans
              .sort((a, b) => a.months - b.months)
              .map((plan) => (
                <tr key={plan.id} className="hover:bg-[#f5f5f7]/50">
                  <td className="px-5 py-4 font-semibold tracking-[-0.02em] text-[#111111]">{plan.months}x</td>
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      defaultValue={plan.surcharge_pct}
                      min="0"
                      step="0.5"
                      onBlur={(e) => updatePlan(plan, 'surcharge_pct', e.target.value)}
                      className={inputCls + ' w-20'}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      defaultValue={plan.label ?? ''}
                      onBlur={(e) => updatePlan(plan, 'label', e.target.value)}
                      className={inputCls + ' w-48'}
                      placeholder="ej: 3 cuotas sin interés"
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleActive(plan)}
                      disabled={saving}
                      className={`relative h-5 w-9 rounded-full transition-colors ${plan.active ? 'bg-black' : 'bg-[#d6d6d6]'}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${plan.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Agregar */}
      <div className="surface-muted p-6">
        <p className="admin-section-heading mb-5">Agregar nuevo plan</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Cuotas</label>
            <input type="number" placeholder="3" min="1" value={newMonths} onChange={(e) => setNewMonths(e.target.value)} className={inputCls + ' w-full'} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Recargo %</label>
            <input type="number" placeholder="0" min="0" step="0.5" value={newSurcharge} onChange={(e) => setNewSurcharge(e.target.value)} className={inputCls + ' w-full'} />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-xs text-[#666666]">Etiqueta (opcional)</label>
            <input type="text" placeholder="3 cuotas sin interés" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className={inputCls + ' w-full'} />
          </div>
        </div>
        <button
          onClick={addPlan}
          disabled={adding || !newMonths || !newSurcharge}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar plan
        </button>
      </div>
    </div>
  )
}
