import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard(); if (err) return err
  const storage = await getStorage()
  const [groups, options] = await Promise.all([
    storage.getFinancingGroups(),
    storage.getFinancingOptions(),
  ])
  return NextResponse.json({ groups, options })
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { name, sort_order } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  const group = await (await getStorage()).createFinancingGroup({ name: name.trim(), sort_order })
  revalidatePath('/', 'layout')
  return NextResponse.json({ group }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id, name, active, sort_order } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const group = await (await getStorage()).updateFinancingGroup({
    id: Number(id),
    name: name?.trim() ?? '',
    active: Boolean(active),
    sort_order: Number(sort_order ?? 0),
  })
  if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ group })
}

export async function DELETE(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { id } = await req.json()
  const deleted = await (await getStorage()).deleteFinancingGroup(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
