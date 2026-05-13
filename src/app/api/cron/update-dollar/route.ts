import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { fetchOfficialDollarQuote } from '@/lib/dollar-api'
import { getExchangeRate, recordExchangeRateError, updateExchangeRateFromApi } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

function revalidateDollarConsumers() {
  revalidatePath('/', 'layout')
  revalidatePath('/productos')
  revalidatePath('/iphone')
  revalidatePath('/iphone/sellados-nuevos')
  revalidatePath('/iphone/seminuevos')
  revalidatePath('/ipad')
  revalidatePath('/mac')
  revalidatePath('/watch')
  revalidatePath('/airpods')
  revalidatePath('/accesorios')
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const quote = await fetchOfficialDollarQuote()
    const result = await updateExchangeRateFromApi(Number(quote.sell), 'api_cron')
    if (result.error) {
      return NextResponse.json({
        ok: false,
        error: 'No se pudo actualizar la cotización. Se mantiene el último valor válido.',
        details: result.error,
        rate: result.rate,
      }, { status: 502 })
    }
    revalidateDollarConsumers()
    return NextResponse.json({ ok: true, rate: result.rate, quote })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo obtener la cotización pública'
    await recordExchangeRateError(message, 'api_cron').catch(() => {})
    return NextResponse.json({
      ok: false,
      error: 'No se pudo actualizar la cotización. Se mantiene el último valor válido.',
      details: message,
      rate: await getExchangeRate(),
    }, { status: 502 })
  }
}
