import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

function validateSinInteres(label: string | null | undefined, surcharge: number): string | null {
  if (!label) return null
  const l = label.toLowerCase()
  if ((l.includes('sin interés') || l.includes('sin recargo') || l.includes('sin interes')) && surcharge > 0) {
    return 'Si la etiqueta dice "sin interés" o "sin recargo", el recargo debe ser 0.'
  }
  return null
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { group_id, installments, surcharge_pct, label, sort_order } = await req.json()

  if (!group_id || !installments || installments < 1) {
    return NextResponse.json({ error: 'group_id e installments son requeridos (installments >= 1)' }, { status: 400 })
  }
  if (surcharge_pct < 0) {
    return NextResponse.json({ error: 'El recargo no puede ser negativo' }, { status: 400 })
  }
  const labelError = validateSinInteres(label, Number(surcharge_pct))
  if (labelError) return NextResponse.json({ error: labelError }, { status: 400 })

  const option = await (await getStorage()).createFinancingOption({
    group_id: Number(group_id),
    installments: Number(installments),
    surcharge_pct: Number(surcharge_pct),
    label: label?.trim() || null,
    sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
  })
  revalidatePath('/', 'layout')
  return NextResponse.json({ option }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id, group_id, installments, surcharge_pct, label, active, sort_order } = await req.json()

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  if (Number(installments) < 1) return NextResponse.json({ error: 'Las cuotas deben ser >= 1' }, { status: 400 })
  if (Number(surcharge_pct) < 0) return NextResponse.json({ error: 'El recargo no puede ser negativo' }, { status: 400 })
  const labelError = validateSinInteres(label, Number(surcharge_pct))
  if (labelError) return NextResponse.json({ error: labelError }, { status: 400 })

  const option = await (await getStorage()).updateFinancingOption({
    id: Number(id),
    group_id: Number(group_id),
    installments: Number(installments),
    surcharge_pct: Number(surcharge_pct),
    label: label?.trim() || null,
    active: Boolean(active),
    sort_order: Number(sort_order ?? 0),
  })
  if (!option) return NextResponse.json({ error: 'Opción no encontrada' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ option })
}

export async function DELETE(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id } = await req.json()
  const deleted = await (await getStorage()).deleteFinancingOption(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Opción no encontrada' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
