import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAllProductsAdmin } from '@/lib/queries'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard(); if (err) return err
  const products = await getAllProductsAdmin()
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const err = await guard(); if (err) return err
  try {
    const body = await req.json()
    const { name, category, price_usd, image_url, featured, active, description, specs, product_label } = body
    if (!name || !category || !price_usd) {
      return NextResponse.json({ error: 'Campos requeridos: name, category, price_usd' }, { status: 400 })
    }
    const product = await (await getStorage()).createProduct({
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
    revalidatePath('/productos')
    revalidatePath('/')
    return NextResponse.json({ product }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
