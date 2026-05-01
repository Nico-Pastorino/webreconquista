import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/queries'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProductBySlug(id)
    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ product }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}
