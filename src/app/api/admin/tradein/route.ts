import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllTradeInValues, upsertManyTradeInValues, updateTradeInValueActive } from '@/lib/queries'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard(); if (err) return err
  const values = await getAllTradeInValues()
  return NextResponse.json({ values })
}

// POST: crear/upsert — acepta un objeto o un array de objetos
export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  const body = await req.json()

  if (Array.isArray(body)) {
    // Bulk upsert
    const validated = body.map((item) => ({
      model: String(item.model ?? '').trim(),
      capacity: String(item.capacity ?? '').trim(),
      battery_state: item.battery_state as '100-90' | '89-70' | 'MENOS-70',
      value_usd: Number(item.value_usd ?? 0),
      active: item.active !== false,
    }))
    const invalid = validated.find(
      (v) => !v.model || !v.capacity || !['100-90', '89-70', 'MENOS-70'].includes(v.battery_state) || v.value_usd < 0
    )
    if (invalid) return NextResponse.json({ error: 'Datos inválidos en alguna entrada' }, { status: 400 })
    const values = await upsertManyTradeInValues(validated)
    revalidatePath('/canje')
    revalidatePath('/plan-canje')
    return NextResponse.json({ values }, { status: 201 })
  }

  // Single upsert
  const { model, capacity, battery_state, value_usd } = body
  if (!model || !capacity || !['100-90', '89-70', 'MENOS-70'].includes(battery_state)) {
    return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
  }
  const value = await (await getStorage()).upsertTradeInValue({
    model: String(model).trim(),
    capacity: String(capacity).trim(),
    battery_state,
    value_usd: Number(value_usd ?? 0),
    active: body.active !== false,
  })
  revalidatePath('/canje')
  revalidatePath('/plan-canje')
  return NextResponse.json({ value }, { status: 201 })
}

// PATCH: actualizar value_usd de una entrada existente por ID
export async function PATCH(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id, value_usd, active } = await req.json()

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const storage = await getStorage()

  if (typeof active === 'boolean') {
    const updated = await storage.updateTradeInValueActive(Number(id), active)
    if (!updated) return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
    revalidatePath('/canje')
    revalidatePath('/plan-canje')
    return NextResponse.json({ value: updated })
  }

  if (value_usd === undefined) return NextResponse.json({ error: 'value_usd requerido' }, { status: 400 })
  if (Number(value_usd) < 0) return NextResponse.json({ error: 'value_usd debe ser >= 0' }, { status: 400 })

  // Use upsert by fetching existing entry first, then upserting with new value
  const all = await getAllTradeInValues()
  const entry = all.find((v) => v.id === Number(id))
  if (!entry) return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })

  const updated = await storage.upsertTradeInValue({
    model: entry.model,
    capacity: entry.capacity,
    battery_state: entry.battery_state,
    value_usd: Number(value_usd),
    active: entry.active,
  })
  revalidatePath('/canje')
  revalidatePath('/plan-canje')
  return NextResponse.json({ value: updated })
}

export async function DELETE(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id } = await req.json()
  const deleted = await (await getStorage()).deleteTradeInValue(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
  revalidatePath('/canje')
  revalidatePath('/plan-canje')
  return NextResponse.json({ ok: true })
}
