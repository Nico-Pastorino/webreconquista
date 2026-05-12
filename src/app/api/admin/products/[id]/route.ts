import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard(); if (err) return err
  const { id } = await params
  const body = await req.json()
  const { name, category, price_usd, image_url, featured, active, description, specs, product_label } = body
  try {
    const product = await (await getStorage()).updateProduct(Number(id), {
      name,
      category,
      price_usd: Number(price_usd),
      image_url,
      featured,
      active,
      description,
      specs,
      product_label: product_label ?? null,
    })
    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    revalidatePath('/productos')
    revalidatePath('/')
    return NextResponse.json({ product })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard(); if (err) return err
  const { id } = await params
  const deleted = await (await getStorage()).deleteProduct(Number(id))
  if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  revalidatePath('/productos')
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
