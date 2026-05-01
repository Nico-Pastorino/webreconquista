import { NextRequest, NextResponse } from 'next/server'
import { getTradeInCapacities } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const model = new URL(req.url).searchParams.get('model')
  if (!model) return NextResponse.json({ capacities: [] })
  const capacities = await getTradeInCapacities(model)
  return NextResponse.json({ capacities }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
