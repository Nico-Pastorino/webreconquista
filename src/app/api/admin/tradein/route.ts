import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllTradeInValues } from '@/lib/queries'
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

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { model, capacity, battery_state, value_usd } = await req.json()
  const value = await (await getStorage()).upsertTradeInValue({
    model,
    capacity,
    battery_state,
    value_usd: Number(value_usd),
  })
  revalidatePath('/canje')
  return NextResponse.json({ value }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id } = await req.json()
  const deleted = await (await getStorage()).deleteTradeInValue(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
  revalidatePath('/canje')
  return NextResponse.json({ ok: true })
}
