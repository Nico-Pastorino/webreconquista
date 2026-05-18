'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FinancingGroup, FinancingOption } from '@/types'
import { Trash2, Plus, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

interface Props {
  initialGroups: FinancingGroup[]
  initialOptions: FinancingOption[]
}

const inputCls =
  'rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-[#111111] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        value ? 'bg-black' : 'bg-[#d6d6d6]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function validateLabel(label: string, surcharge: number): string | null {
  const l = label.toLowerCase()
  if ((l.includes('sin interés') || l.includes('sin recargo') || l.includes('sin interes')) && surcharge > 0) {
    return 'Si dice "sin interés" o "sin recargo", el recargo debe ser 0.'
  }
  return null
}

export default function InstallmentsManager({ initialGroups, initialOptions }: Props) {
  const router = useRouter()
  const [groups, setGroups] = useState<FinancingGroup[]>(initialGroups)
  const [options, setOptions] = useState<FinancingOption[]>(initialOptions)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set(initialGroups.map((g) => g.id)))

  // Nuevo grupo
  const [newGroupName, setNewGroupName] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)

  // Edición inline de grupo
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')

  // Nueva opción por grupo
  const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null)
  const [newInstallments, setNewInstallments] = useState('')
  const [newSurcharge, setNewSurcharge] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newOptionError, setNewOptionError] = useState('')

  // Edición inline de opción
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null)
  const [editOpt, setEditOpt] = useState<Partial<FinancingOption>>({})
  const [editOptError, setEditOptError] = useState('')

  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  function toggleExpand(groupId: number) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  async function createGroup() {
    if (!newGroupName.trim()) return
    setAddingGroup(true)
    try {
      const res = await fetch('/api/admin/financing-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setGroups((g) => [...g, data.group])
        setExpandedGroups((prev) => new Set([...prev, data.group.id]))
        setNewGroupName('')
      }
    } finally {
      setAddingGroup(false)
    }
  }

  async function toggleGroupActive(group: FinancingGroup) {
    const newActive = !group.active
    // Actualización optimista: cambia el estado antes de esperar la API
    setGroups((g) => g.map((gr) => (gr.id === group.id ? { ...gr, active: newActive } : gr)))
    const res = await fetch('/api/admin/financing-groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...group, active: newActive }),
    })
    if (!res.ok) {
      // Revertir si falló
      setGroups((g) => g.map((gr) => (gr.id === group.id ? { ...gr, active: group.active } : gr)))
    }
  }

  async function saveGroupName(group: FinancingGroup) {
    const name = editingGroupName.trim()
    if (!name) return
    setBusy(true)
    const res = await fetch('/api/admin/financing-groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...group, name }),
    })
    const data = await res.json()
    if (res.ok) {
      setGroups((g) => g.map((gr) => (gr.id === group.id ? data.group : gr)))
    }
    setEditingGroupId(null)
    setBusy(false)
  }

  async function deleteGroup(id: number) {
    const ok = await confirm({
      title: 'Eliminar grupo',
      message: '¿Querés eliminar este grupo y todas sus cuotas?',
      detail: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    })
    if (!ok) return
    await fetch('/api/admin/financing-groups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setGroups((g) => g.filter((gr) => gr.id !== id))
    setOptions((o) => o.filter((op) => op.group_id !== id))
    toast.success('Grupo eliminado')
    router.refresh()
  }

  async function addOption(groupId: number) {
    setNewOptionError('')
    const inst = parseInt(newInstallments)
    const surch = parseFloat(newSurcharge)
    if (!inst || inst < 1) { setNewOptionError('Las cuotas deben ser >= 1'); return }
    if (isNaN(surch) || surch < 0) { setNewOptionError('El recargo no puede ser negativo'); return }
    const labelErr = validateLabel(newLabel, surch)
    if (labelErr) { setNewOptionError(labelErr); return }

    setBusy(true)
    try {
      const res = await fetch('/api/admin/financing-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          installments: inst,
          surcharge_pct: surch,
          label: newLabel.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setNewOptionError(data.error ?? 'Error'); return }
      setOptions((o) => [...o, data.option])
      setNewInstallments('')
      setNewSurcharge('')
      setNewLabel('')
      setAddingOptionFor(null)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function toggleOptionActive(opt: FinancingOption) {
    const newActive = !opt.active
    // Actualización optimista: cambia el estado antes de esperar la API
    setOptions((o) => o.map((op) => (op.id === opt.id ? { ...op, active: newActive } : op)))
    const res = await fetch('/api/admin/financing-options', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...opt, active: newActive }),
    })
    if (!res.ok) {
      // Revertir si falló
      setOptions((o) => o.map((op) => (op.id === opt.id ? { ...op, active: opt.active } : op)))
    }
  }

  async function saveOption() {
    setEditOptError('')
    const inst = Number(editOpt.installments)
    const surch = Number(editOpt.surcharge_pct)
    if (inst < 1) { setEditOptError('Las cuotas deben ser >= 1'); return }
    if (surch < 0) { setEditOptError('El recargo no puede ser negativo'); return }
    const labelErr = validateLabel(editOpt.label ?? '', surch)
    if (labelErr) { setEditOptError(labelErr); return }

    setBusy(true)
    const res = await fetch('/api/admin/financing-options', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editOpt),
    })
    const data = await res.json()
    if (!res.ok) { setEditOptError(data.error ?? 'Error'); setBusy(false); return }
    setOptions((o) => o.map((op) => (op.id === editOpt.id ? data.option : op)))
    setEditingOptionId(null)
    setBusy(false)
  }

  async function deleteOption(id: number) {
    const ok = await confirm({
      title: 'Eliminar cuota',
      message: '¿Querés eliminar esta opción de pago?',
      detail: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    })
    if (!ok) return
    await fetch('/api/admin/financing-options', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setOptions((o) => o.filter((op) => op.id !== id))
    toast.success('Cuota eliminada')
    router.refresh()
  }

  const groupOptions = (groupId: number) =>
    options.filter((o) => o.group_id === groupId).sort((a, b) => a.sort_order - b.sort_order || a.installments - b.installments)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Lista de grupos */}
      {groups
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
        .map((group) => {
          const isExpanded = expandedGroups.has(group.id)
          const opts = groupOptions(group.id)
          const isEditingGroup = editingGroupId === group.id

          return (
            <div key={group.id} className="overflow-hidden rounded-[2rem] border border-[#eaeaea] bg-white">
              {/* Cabecera del grupo */}
              <div className="flex items-center gap-3 border-b border-[#eaeaea] bg-[#f5f5f7] px-5 py-4">
                {isEditingGroup ? (
                  <>
                    <input
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      className={inputCls + ' flex-1'}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveGroupName(group) }}
                      autoFocus
                    />
                    <button onClick={() => saveGroupName(group)} disabled={busy} className="rounded-full border border-[#eaeaea] p-1.5 text-black hover:bg-black hover:text-white transition-colors">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingGroupId(null)} className="rounded-full border border-[#eaeaea] p-1.5 text-[#666] hover:border-[#111] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => toggleExpand(group.id)} className="flex flex-1 items-center gap-2 text-left">
                      <span className="font-semibold tracking-[-0.02em] text-[#111111]">{group.name}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-[#666]" /> : <ChevronDown className="h-4 w-4 text-[#666]" />}
                    </button>
                    <Toggle value={group.active} onChange={() => toggleGroupActive(group)} />
                    <button
                      onClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name) }}
                      className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Opciones del grupo */}
              {isExpanded && (
                <div>
                  {opts.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#eaeaea]">
                          <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Cuotas</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Recargo %</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Etiqueta</th>
                          <th className="px-5 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Activo</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaeaea]">
                        {opts.map((opt) => {
                          const isEditingOpt = editingOptionId === opt.id
                          return (
                            <tr key={opt.id} className="hover:bg-[#f9f9f9]">
                              {isEditingOpt ? (
                                <>
                                  <td className="px-5 py-3">
                                    <input
                                      type="number"
                                      min="1"
                                      value={editOpt.installments ?? ''}
                                      onChange={(e) => setEditOpt((o) => ({ ...o, installments: Number(e.target.value) }))}
                                      className={inputCls + ' w-16'}
                                    />
                                  </td>
                                  <td className="px-5 py-3">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={editOpt.surcharge_pct ?? ''}
                                      onChange={(e) => setEditOpt((o) => ({ ...o, surcharge_pct: Number(e.target.value) }))}
                                      className={inputCls + ' w-20'}
                                    />
                                  </td>
                                  <td className="px-5 py-3" colSpan={2}>
                                    <input
                                      type="text"
                                      value={editOpt.label ?? ''}
                                      onChange={(e) => setEditOpt((o) => ({ ...o, label: e.target.value }))}
                                      className={inputCls + ' w-full'}
                                      placeholder="ej: 3 cuotas sin interés"
                                    />
                                    {editOptError && <p className="mt-1 text-xs text-red-500">{editOptError}</p>}
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex gap-1.5">
                                      <button onClick={saveOption} disabled={busy} className="rounded-full border border-[#eaeaea] p-1.5 text-black hover:bg-black hover:text-white transition-colors">
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                      <button onClick={() => { setEditingOptionId(null); setEditOptError('') }} className="rounded-full border border-[#eaeaea] p-1.5 text-[#666] hover:border-[#111] transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-5 py-3.5 font-semibold tracking-[-0.02em] text-[#111111]">{opt.installments}x</td>
                                  <td className="px-5 py-3.5 text-[#6B7280]">{opt.surcharge_pct}%</td>
                                  <td className="px-5 py-3.5 text-[#6B7280]">{opt.label ?? <span className="italic text-[#aaa]">sin etiqueta</span>}</td>
                                  <td className="px-5 py-3.5 text-center">
                                    <Toggle value={opt.active} onChange={() => toggleOptionActive(opt)} />
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => { setEditingOptionId(opt.id); setEditOpt({ ...opt }); setEditOptError('') }}
                                        className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteOption(opt.id)}
                                        className="rounded-full border border-[#eaeaea] p-1.5 text-[#666666] transition-colors hover:border-red-400 hover:text-red-500"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-5 py-4 text-sm text-[#aaa]">Sin cuotas configuradas.</p>
                  )}

                  {/* Formulario nueva opción */}
                  {addingOptionFor === group.id ? (
                    <div className="border-t border-[#eaeaea] bg-[#f9f9f9] px-5 py-4">
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Nueva cuota</p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-[#666]">Cuotas</label>
                          <input
                            type="number"
                            placeholder="3"
                            min="1"
                            value={newInstallments}
                            onChange={(e) => setNewInstallments(e.target.value)}
                            className={inputCls + ' w-20'}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-[#666]">Recargo %</label>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.5"
                            value={newSurcharge}
                            onChange={(e) => setNewSurcharge(e.target.value)}
                            className={inputCls + ' w-24'}
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <label className="text-xs text-[#666]">Etiqueta (opcional)</label>
                          <input
                            type="text"
                            placeholder="3 cuotas sin interés"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className={inputCls + ' w-full'}
                          />
                        </div>
                      </div>
                      {newOptionError && <p className="mt-2 text-xs text-red-500">{newOptionError}</p>}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => addOption(group.id)}
                          disabled={busy || !newInstallments || newSurcharge === ''}
                          className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar
                        </button>
                        <button
                          onClick={() => { setAddingOptionFor(null); setNewOptionError('') }}
                          className="rounded-full border border-[#eaeaea] px-4 py-2 text-sm text-[#666] hover:border-[#111] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-[#eaeaea] px-5 py-3">
                      <button
                        onClick={() => { setAddingOptionFor(group.id); setNewInstallments(''); setNewSurcharge(''); setNewLabel(''); setNewOptionError('') }}
                        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#111111]"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar cuota a {group.name}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

      {/* Crear nuevo grupo */}
      <div className="rounded-[2rem] border border-dashed border-[#d1d5db] bg-[#fafafa] p-6">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Nuevo plan de financiación</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="ej: Banco Nación"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
            className={inputCls + ' flex-1'}
          />
          <button
            onClick={createGroup}
            disabled={addingGroup || !newGroupName.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Crear plan
          </button>
        </div>
      </div>
    </div>
  )
}
