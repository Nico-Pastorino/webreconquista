'use client'

import { useState, useMemo } from 'react'
import type { TradeInValue } from '@/types'
import { ChevronDown, ChevronRight, Copy, Plus, Trash2, Zap } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────

const CONDITIONS = ['excelente', 'bueno', 'regular'] as const
type Condition = (typeof CONDITIONS)[number]
const COND_LABELS: Record<Condition, string> = { excelente: 'Excelente', bueno: 'Bueno', regular: 'Regular' }

const DEFAULT_CAPACITIES = ['64GB', '128GB', '256GB', '512GB', '1TB']

const GENERATION_LABELS: Record<string, string> = {
  '12': 'iPhone 12', '13': 'iPhone 13', '14': 'iPhone 14',
  '15': 'iPhone 15', '16': 'iPhone 16', '17': 'iPhone 17',
}

function extractGeneration(model: string): string {
  const m = model.match(/iPhone\s+(\d+)/)
  return m ? m[1] : 'otro'
}

function sortCapacity(a: string, b: string): number {
  const order = ['64GB', '128GB', '256GB', '512GB', '1TB']
  const ai = order.indexOf(a)
  const bi = order.indexOf(b)
  if (ai === -1 && bi === -1) return a.localeCompare(b)
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

function sortModel(a: string, b: string): number {
  const genA = parseInt(extractGeneration(a)) || 99
  const genB = parseInt(extractGeneration(b)) || 99
  if (genA !== genB) return genA - genB
  return a.localeCompare(b)
}

// ─── Shared styles ────────────────────────────────────────────
const inputCls = 'w-full rounded-[14px] border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111111] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'
const btnPrimary = 'inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50'
const btnSecondary = 'inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#f5f5f7] disabled:opacity-50'

// ─── Toggle ───────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${checked ? 'bg-black' : 'bg-[#d1d5db]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────

interface Props { initialValues: TradeInValue[] }

type PendingEdit = { value_usd: string }

export default function TradeInManager({ initialValues }: Props) {
  const [values, setValues] = useState<TradeInValue[]>(initialValues)
  const [pendingEdits, setPendingEdits] = useState<Record<number, PendingEdit>>({})
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [genFilter, setGenFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [panel, setPanel] = useState<'none' | 'add' | 'quick' | 'duplicate'>('none')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Grouping ───────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Record<Condition, TradeInValue | undefined>>> = {}
    for (const v of values) {
      map[v.model] ??= {}
      map[v.model][v.capacity] ??= { excelente: undefined, bueno: undefined, regular: undefined }
      map[v.model][v.capacity][v.battery_state] = v
    }
    return map
  }, [values])

  const models = useMemo(() => Object.keys(grouped).sort(sortModel), [grouped])
  const generations = useMemo(() => [...new Set(models.map(extractGeneration))].sort((a, b) => parseInt(a) - parseInt(b)), [models])

  const filteredModels = useMemo(() => models.filter((m) => {
    if (search && !m.toLowerCase().includes(search.toLowerCase())) return false
    if (genFilter && extractGeneration(m) !== genFilter) return false
    if (statusFilter !== 'all') {
      const caps = grouped[m]
      const allEntries = Object.values(caps).flatMap((c) => Object.values(c)).filter(Boolean) as TradeInValue[]
      const hasActive = allEntries.some((v) => v.active)
      if (statusFilter === 'active' && !hasActive) return false
      if (statusFilter === 'inactive' && hasActive) return false
    }
    return true
  }), [models, grouped, search, genFilter, statusFilter])

  // ─── Pending edits ──────────────────────────────────────────
  function editValue(id: number, val: string) {
    setPendingEdits((prev) => ({ ...prev, [id]: { value_usd: val } }))
  }

  function cancelEdits() {
    setPendingEdits({})
  }

  async function saveEdits() {
    if (!Object.keys(pendingEdits).length) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(pendingEdits).map(([id, edit]) =>
          fetch('/api/admin/tradein', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: Number(id), value_usd: Number(edit.value_usd) }),
          }).then((r) => r.json())
        )
      )
      // Apply edits locally
      setValues((prev) =>
        prev.map((v) => {
          const edit = pendingEdits[v.id]
          return edit ? { ...v, value_usd: Number(edit.value_usd) } : v
        })
      )
      setPendingEdits({})
      showToast('Cambios guardados')
    } catch {
      showToast('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ─── Toggle active ──────────────────────────────────────────
  async function toggleActive(id: number, current: boolean) {
    setTogglingId(id)
    const next = !current
    setValues((prev) => prev.map((v) => (v.id === id ? { ...v, active: next } : v)))
    try {
      await fetch('/api/admin/tradein', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: next }),
      })
    } catch {
      setValues((prev) => prev.map((v) => (v.id === id ? { ...v, active: current } : v)))
      showToast('Error al cambiar estado')
    } finally {
      setTogglingId(null)
    }
  }

  async function toggleModelActive(model: string, makeActive: boolean) {
    const modelEntries = values.filter((v) => v.model === model)
    setValues((prev) => prev.map((v) => (v.model === model ? { ...v, active: makeActive } : v)))
    try {
      await Promise.all(
        modelEntries.map((v) =>
          fetch('/api/admin/tradein', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: v.id, active: makeActive }),
          })
        )
      )
      showToast(makeActive ? 'Modelo activado' : 'Modelo desactivado')
    } catch {
      setValues((prev) => prev.map((v) => (v.model === model ? { ...v, active: !makeActive } : v)))
      showToast('Error al cambiar estado del modelo')
    }
  }

  // ─── Delete entry ────────────────────────────────────────────
  async function deleteEntry(id: number) {
    if (!confirm('¿Eliminar esta entrada?')) return
    await fetch('/api/admin/tradein', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setValues((prev) => prev.filter((v) => v.id !== id))
    showToast('Entrada eliminada')
  }

  const hasPending = Object.keys(pendingEdits).length > 0

  // ─── Expand helpers ──────────────────────────────────────────
  function toggleExpand(model: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(model)) next.delete(model); else next.add(model)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Pending save bar */}
      {hasPending && (
        <div className="flex items-center justify-between rounded-[18px] bg-[#fffbeb] border border-[#fde68a] px-5 py-3">
          <p className="text-sm font-medium text-[#92400e]">
            {Object.keys(pendingEdits).length} cambio(s) pendiente(s)
          </p>
          <div className="flex gap-2">
            <button onClick={cancelEdits} className={btnSecondary}>Cancelar</button>
            <button onClick={saveEdits} disabled={saving} className={btnPrimary}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar modelo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[180px] flex-1 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#d1d5db]"
        />
        <select
          value={genFilter}
          onChange={(e) => setGenFilter(e.target.value)}
          className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#d1d5db]"
        >
          <option value="">Todas las generaciones</option>
          {generations.map((g) => (
            <option key={g} value={g}>{GENERATION_LABELS[g] ?? `iPhone ${g}`}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#d1d5db]"
        >
          <option value="all">Todos</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>
        <div className="flex gap-2 sm:ml-auto">
          <button onClick={() => setPanel(panel === 'quick' ? 'none' : 'quick')} className={btnSecondary}>
            <Zap className="h-4 w-4" /> Carga rápida
          </button>
          <button onClick={() => setPanel(panel === 'add' ? 'none' : 'add')} className={btnPrimary}>
            <Plus className="h-4 w-4" /> Agregar modelo
          </button>
        </div>
      </div>

      {/* Panels */}
      {panel === 'quick' && (
        <QuickLoadPanel
          models={models}
          onDone={(newVals) => {
            setValues((prev) => {
              const map = new Map(prev.map((v) => [`${v.model}|${v.capacity}|${v.battery_state}`, v]))
              for (const v of newVals) map.set(`${v.model}|${v.capacity}|${v.battery_state}`, v)
              return [...map.values()]
            })
            setPanel('none')
            showToast('Combinaciones creadas')
          }}
          onClose={() => setPanel('none')}
        />
      )}

      {panel === 'add' && (
        <AddModelPanel
          existingModels={models}
          onDone={(newVals) => {
            setValues((prev) => {
              const map = new Map(prev.map((v) => [`${v.model}|${v.capacity}|${v.battery_state}`, v]))
              for (const v of newVals) map.set(`${v.model}|${v.capacity}|${v.battery_state}`, v)
              return [...map.values()]
            })
            setPanel('none')
            showToast('Modelo creado')
          }}
          onClose={() => setPanel('none')}
        />
      )}

      {panel === 'duplicate' && (
        <DuplicatePanel
          models={models}
          values={values}
          onDone={(newVals) => {
            setValues((prev) => {
              const map = new Map(prev.map((v) => [`${v.model}|${v.capacity}|${v.battery_state}`, v]))
              for (const v of newVals) map.set(`${v.model}|${v.capacity}|${v.battery_state}`, v)
              return [...map.values()]
            })
            setPanel('none')
            showToast('Modelo duplicado')
          }}
          onClose={() => setPanel('none')}
        />
      )}

      {/* Model list */}
      {filteredModels.length === 0 && (
        <div className="rounded-[2rem] border border-[#eaeaea] bg-[#f5f5f7] py-14 text-center">
          <p className="text-sm text-[#666666]">No hay modelos que coincidan con el filtro.</p>
        </div>
      )}

      {filteredModels.map((model) => {
        const caps = grouped[model]
        const sortedCaps = Object.keys(caps).sort(sortCapacity)
        const isOpen = expanded.has(model)
        const allEntries = sortedCaps.flatMap((c) => CONDITIONS.map((cond) => caps[c][cond]).filter(Boolean)) as TradeInValue[]
        const isModelActive = allEntries.some((v) => v.active)

        return (
          <div key={model} className="overflow-hidden rounded-[1.5rem] border border-[#eaeaea] bg-white">
            {/* Model header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#eaeaea] bg-[#f5f5f7] px-5 py-3">
              <button
                onClick={() => toggleExpand(model)}
                className="flex flex-1 items-center gap-2 text-left text-sm font-semibold tracking-[-0.02em] text-[#111111]"
              >
                {isOpen ? <ChevronDown className="h-4 w-4 text-[#666]" /> : <ChevronRight className="h-4 w-4 text-[#666]" />}
                {model}
                <span className="text-xs font-normal text-[#666]">({sortedCaps.length} cap.)</span>
              </button>
              <div className="flex items-center gap-3">
                <Toggle
                  checked={isModelActive}
                  onChange={() => toggleModelActive(model, !isModelActive)}
                />
                <button
                  onClick={() => { setPanel('duplicate'); }}
                  title="Duplicar modelo"
                  className="rounded-full border border-[#eaeaea] p-1.5 text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Capacity table */}
            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#eaeaea]">
                      <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-[#666]">Capacidad</th>
                      {CONDITIONS.map((c) => (
                        <th key={c} className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-[#666]">
                          {COND_LABELS[c]} (USD)
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#666]">Activo</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {sortedCaps.map((cap) => {
                      const row = caps[cap]
                      // active = true if at least one entry in this cap row is active
                      const capEntries = CONDITIONS.map((c) => row[c]).filter(Boolean) as TradeInValue[]
                      const isCapActive = capEntries.some((v) => v.active)

                      return (
                        <tr key={cap} className={`hover:bg-[#fafafa] ${!isCapActive ? 'opacity-50' : ''}`}>
                          <td className="px-5 py-3 font-medium text-[#111]">{cap}</td>
                          {CONDITIONS.map((cond) => {
                            const entry = row[cond]
                            if (!entry) {
                              return <td key={cond} className="px-4 py-3 text-right text-[#ccc]">—</td>
                            }
                            const pending = pendingEdits[entry.id]
                            const displayVal = pending !== undefined ? pending.value_usd : String(entry.value_usd)
                            const isDirty = pending !== undefined

                            return (
                              <td key={cond} className="px-4 py-3 text-right">
                                <div className="relative inline-flex items-center">
                                  <span className="mr-1 text-[#999]">$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={displayVal}
                                    onChange={(e) => editValue(entry.id, e.target.value)}
                                    className={`w-20 rounded-[10px] border px-2 py-1 text-right text-sm tabular-nums outline-none transition-colors focus:ring-2 focus:ring-black/10 ${isDirty ? 'border-amber-400 bg-amber-50 font-semibold text-[#92400e]' : 'border-transparent bg-transparent hover:border-[#e5e7eb] focus:border-[#d1d5db]'}`}
                                  />
                                </div>
                              </td>
                            )
                          })}
                          <td className="px-4 py-3 text-center">
                            {capEntries[0] && (
                              <Toggle
                                checked={isCapActive}
                                disabled={togglingId !== null}
                                onChange={() => {
                                  // Toggle all entries in this cap
                                  capEntries.forEach((v) => toggleActive(v.id, v.active))
                                }}
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {capEntries.map((v) => (
                                <button
                                  key={v.id}
                                  onClick={() => deleteEntry(v.id)}
                                  title={`Eliminar ${COND_LABELS[v.battery_state]}`}
                                  className="rounded-full border border-[#eaeaea] p-1.5 text-[#999] transition-colors hover:border-red-300 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Add Model Panel ──────────────────────────────────────────

function AddModelPanel({
  existingModels,
  onDone,
  onClose,
}: {
  existingModels: string[]
  onDone: (vals: TradeInValue[]) => void
  onClose: () => void
}) {
  const [modelName, setModelName] = useState('')
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set(['128GB', '256GB', '512GB']))
  const [customCap, setCustomCap] = useState('')
  const [excelente, setExcelente] = useState('0')
  const [bueno, setBueno] = useState('0')
  const [regular, setRegular] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleCap(cap: string) {
    setSelectedCaps((prev) => {
      const next = new Set(prev)
      if (next.has(cap)) next.delete(cap); else next.add(cap)
      return next
    })
  }

  async function handleCreate() {
    setError('')
    const name = modelName.trim()
    if (!name) return setError('El nombre del modelo es obligatorio.')
    if (existingModels.includes(name)) return setError('Ya existe un modelo con ese nombre.')
    if (selectedCaps.size === 0) return setError('Seleccioná al menos una capacidad.')
    if (Number(excelente) < 0 || Number(bueno) < 0 || Number(regular) < 0) return setError('Los valores deben ser ≥ 0.')

    setLoading(true)
    const entries = [...selectedCaps].flatMap((cap) =>
      CONDITIONS.map((cond) => ({
        model: name,
        capacity: cap,
        battery_state: cond,
        value_usd: Number(cond === 'excelente' ? excelente : cond === 'bueno' ? bueno : regular),
        active: true,
      }))
    )
    try {
      const res = await fetch('/api/admin/tradein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      })
      const data = await res.json()
      onDone(data.values ?? [])
    } catch {
      setError('Error al crear el modelo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[#e5e7eb] bg-[#fafafa] p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#111]">Agregar nuevo modelo</p>
        <button onClick={onClose} className="text-xs text-[#666] hover:text-[#111]">Cerrar</button>
      </div>
      {error && <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Nombre del modelo</label>
          <input
            placeholder="Ej: iPhone 18 Pro"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Capacidades</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CAPACITIES.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCap(cap)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedCaps.has(cap) ? 'bg-black text-white' : 'border border-[#e5e7eb] bg-white text-[#666] hover:bg-[#f5f5f7]'}`}
              >
                {cap}
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                placeholder="Otra"
                value={customCap}
                onChange={(e) => setCustomCap(e.target.value)}
                className="w-20 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => { if (customCap.trim()) { toggleCap(customCap.trim()); setCustomCap('') } }}
                className="rounded-full border border-[#e5e7eb] bg-white px-2 py-1 text-xs hover:bg-[#f5f5f7]"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Valores iniciales USD</label>
          <div className="grid grid-cols-3 gap-2">
            {[['Excelente', excelente, setExcelente], ['Bueno', bueno, setBueno], ['Regular', regular, setRegular]].map(
              ([label, val, setter]) => (
                <div key={label as string} className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#999]">{label as string}</span>
                  <input
                    type="number"
                    min="0"
                    value={val as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={handleCreate} disabled={loading} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {loading ? 'Creando…' : 'Crear modelo'}
        </button>
        <button onClick={onClose} className={btnSecondary}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── Quick Load Panel ─────────────────────────────────────────

function QuickLoadPanel({
  models,
  onDone,
  onClose,
}: {
  models: string[]
  onDone: (vals: TradeInValue[]) => void
  onClose: () => void
}) {
  const [modelName, setModelName] = useState('')
  const [customModelName, setCustomModelName] = useState('')
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set(['128GB', '256GB', '512GB']))
  const [excelente, setExcelente] = useState('')
  const [bueno, setBueno] = useState('')
  const [regular, setRegular] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const effectiveModel = modelName === '__custom__' ? customModelName.trim() : modelName

  function toggleCap(cap: string) {
    setSelectedCaps((prev) => {
      const next = new Set(prev)
      if (next.has(cap)) next.delete(cap); else next.add(cap)
      return next
    })
  }

  async function handleCreate() {
    setError('')
    if (!effectiveModel) return setError('Seleccioná o escribí un modelo.')
    if (selectedCaps.size === 0) return setError('Seleccioná al menos una capacidad.')
    if (excelente === '' || bueno === '' || regular === '') return setError('Completá los tres valores.')
    if (Number(excelente) < 0 || Number(bueno) < 0 || Number(regular) < 0) return setError('Los valores deben ser ≥ 0.')

    setLoading(true)
    const entries = [...selectedCaps].flatMap((cap) =>
      CONDITIONS.map((cond) => ({
        model: effectiveModel,
        capacity: cap,
        battery_state: cond,
        value_usd: Number(cond === 'excelente' ? excelente : cond === 'bueno' ? bueno : regular),
        active: true,
      }))
    )
    try {
      const res = await fetch('/api/admin/tradein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      })
      const data = await res.json()
      onDone(data.values ?? [])
    } catch {
      setError('Error al crear combinaciones.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[#e5e7eb] bg-[#fafafa] p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#111]">Carga rápida — crear combinaciones</p>
        <button onClick={onClose} className="text-xs text-[#666] hover:text-[#111]">Cerrar</button>
      </div>
      {error && <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Modelo</label>
          <select value={modelName} onChange={(e) => setModelName(e.target.value)} className={inputCls + ' appearance-none'}>
            <option value="">Seleccioná un modelo</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
            <option value="__custom__">+ Modelo personalizado</option>
          </select>
          {modelName === '__custom__' && (
            <input
              placeholder="Nombre del modelo"
              value={customModelName}
              onChange={(e) => setCustomModelName(e.target.value)}
              className={inputCls}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Capacidades</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CAPACITIES.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCap(cap)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedCaps.has(cap) ? 'bg-black text-white' : 'border border-[#e5e7eb] bg-white text-[#666] hover:bg-[#f5f5f7]'}`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-xs font-medium text-[#666]">Valor por estado (se aplica a todas las capacidades seleccionadas)</label>
          <div className="grid grid-cols-3 gap-3">
            {[['Excelente', excelente, setExcelente], ['Bueno', bueno, setBueno], ['Regular', regular, setRegular]].map(
              ([label, val, setter]) => (
                <div key={label as string} className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#999]">{label as string}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={val as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
      {effectiveModel && selectedCaps.size > 0 && (
        <p className="mt-3 text-xs text-[#666]">
          Se crearán {selectedCaps.size * 3} combinaciones: {[...selectedCaps].join(', ')} × Excelente / Bueno / Regular
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <button onClick={handleCreate} disabled={loading} className={btnPrimary}>
          <Zap className="h-4 w-4" />
          {loading ? 'Creando…' : 'Crear combinaciones'}
        </button>
        <button onClick={onClose} className={btnSecondary}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── Duplicate Panel ──────────────────────────────────────────

function DuplicatePanel({
  models,
  values,
  onDone,
  onClose,
}: {
  models: string[]
  values: TradeInValue[]
  onDone: (vals: TradeInValue[]) => void
  onClose: () => void
}) {
  const [source, setSource] = useState('')
  const [targetName, setTargetName] = useState('')
  const [adjustment, setAdjustment] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDuplicate() {
    setError('')
    const target = targetName.trim()
    if (!source) return setError('Seleccioná un modelo de origen.')
    if (!target) return setError('Ingresá el nombre del nuevo modelo.')
    if (models.includes(target)) return setError('Ya existe un modelo con ese nombre.')

    const pct = Number(adjustment) / 100
    const sourceEntries = values.filter((v) => v.model === source)
    if (sourceEntries.length === 0) return setError('El modelo origen no tiene entradas.')

    const entries = sourceEntries.map((v) => ({
      model: target,
      capacity: v.capacity,
      battery_state: v.battery_state,
      value_usd: Math.round(v.value_usd * (1 + pct)),
      active: true,
    }))

    setLoading(true)
    try {
      const res = await fetch('/api/admin/tradein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      })
      const data = await res.json()
      onDone(data.values ?? [])
    } catch {
      setError('Error al duplicar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[#e5e7eb] bg-[#fafafa] p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#111]">Duplicar modelo existente</p>
        <button onClick={onClose} className="text-xs text-[#666] hover:text-[#111]">Cerrar</button>
      </div>
      {error && <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Copiar desde</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls + ' appearance-none'}>
            <option value="">Seleccioná modelo</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Nuevo modelo</label>
          <input
            placeholder="Ej: iPhone 18 Pro"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#666]">Ajuste % (opcional)</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              className={inputCls + ' pr-8'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999]">%</span>
          </div>
          <p className="text-[10px] text-[#999]">Positivo (+10) = aumentar. Negativo (-5) = reducir.</p>
        </div>
      </div>
      {source && targetName.trim() && (
        <p className="mt-3 text-xs text-[#666]">
          Se copiarán {values.filter((v) => v.model === source).length} entradas de &quot;{source}&quot; → &quot;{targetName.trim()}&quot;
          {Number(adjustment) !== 0 && ` con ajuste ${adjustment}%`}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <button onClick={handleDuplicate} disabled={loading} className={btnPrimary}>
          <Copy className="h-4 w-4" />
          {loading ? 'Duplicando…' : 'Duplicar modelo'}
        </button>
        <button onClick={onClose} className={btnSecondary}>Cancelar</button>
      </div>
    </div>
  )
}
