import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/queries'
import type { Category } from '@/types'

export const revalidate = 60 // ISR: revalidar cada 60s

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cat = searchParams.get('cat') as Category | null
    const products = await getProducts(cat ?? undefined)
    return NextResponse.json({ products }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
