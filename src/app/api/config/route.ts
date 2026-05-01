import { NextResponse } from 'next/server'
import { getDollarRate, getInstallmentPlans, getSiteSettings } from '@/lib/queries'

// Datos globales: dólar, cuotas, settings — muy cacheados
export const revalidate = 120

export async function GET() {
  try {
    const [dollarRate, installmentPlans, settings] = await Promise.all([
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
    return NextResponse.json({ dollarRate, installmentPlans, settings }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Error de configuración' }, { status: 500 })
  }
}
