import { NextRequest, NextResponse } from 'next/server'
import { getTradeInEntry, getDollarRate } from '@/lib/queries'
import { calcTradeIn } from '@/lib/calculations'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const model = searchParams.get('model')
  const capacity = searchParams.get('capacity')
  const battery = searchParams.get('battery')
  const productPrice = searchParams.get('productPrice')

  if (!model || !capacity || !battery) {
    return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })
  }

  const entry = await getTradeInEntry(model, capacity, battery)
  if (!entry) {
    return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 })
  }

  const dollarRate = await getDollarRate()
  const priceUsd = productPrice ? parseFloat(productPrice) : 0
  const result = calcTradeIn(priceUsd, dollarRate, entry)

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
