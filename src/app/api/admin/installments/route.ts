import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllInstallmentPlans } from '@/lib/queries'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard(); if (err) return err
  const plans = await getAllInstallmentPlans()
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { months, surcharge_pct, label } = await req.json()
  const plan = await (await getStorage()).createInstallmentPlan({
    months: Number(months),
    surcharge_pct: Number(surcharge_pct),
    label: label ?? null,
  })
  revalidatePath('/', 'layout')
  return NextResponse.json({ plan }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id, months, surcharge_pct, label, active } = await req.json()
  const plan = await (await getStorage()).updateInstallmentPlan({
    id: Number(id),
    months: Number(months),
    surcharge_pct: Number(surcharge_pct),
    label: label ?? null,
    active: Boolean(active),
  })
  if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ plan })
}

export async function DELETE(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id } = await req.json()
  const deleted = await (await getStorage()).deleteInstallmentPlan(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
