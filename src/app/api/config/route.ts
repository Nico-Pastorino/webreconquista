import { NextResponse } from 'next/server'
import { getDollarRate, getInstallmentPlans, getSiteSettings } from '@/lib/queries'
import { DEFAULT_DOLLAR_RATE, DEFAULT_SITE_SETTINGS, logDatabaseError } from '@/lib/env'

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
  } catch (error) {
    logDatabaseError('api/config', error)
    return NextResponse.json({
      dollarRate: DEFAULT_DOLLAR_RATE,
      installmentPlans: [],
      settings: DEFAULT_SITE_SETTINGS,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    })
  }
}
