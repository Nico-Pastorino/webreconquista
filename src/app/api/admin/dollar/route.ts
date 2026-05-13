import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { fetchOfficialDollarQuote } from '@/lib/dollar-api'
import { revalidatePath } from 'next/cache'
import { getExchangeRate, recordExchangeRateError, updateExchangeRateFromApi, updateExchangeRateMargin } from '@/lib/queries'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
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

export async function GET() {
  const err = await guard(); if (err) return err
  const rate = await getExchangeRate()
  return NextResponse.json({ rate })
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { admin_margin } = await req.json()
  const margin = Number(admin_margin)
  if (!Number.isFinite(margin) || margin < 0) {
    return NextResponse.json({ error: 'El margen debe ser un número mayor o igual a 0' }, { status: 400 })
  }
  const rate = await updateExchangeRateMargin(margin)
  revalidateDollarConsumers()
  return NextResponse.json({ ok: true, rate })
}

export async function POST() {
  const err = await guard(); if (err) return err

  try {
    const quote = await fetchOfficialDollarQuote()
    const result = await updateExchangeRateFromApi(Number(quote.sell), 'api_manual_refresh')
    if (result.error) {
      return NextResponse.json({
        error: 'No se pudo actualizar la cotización. Se mantiene el último valor válido.',
        details: result.error,
        rate: result.rate,
      }, { status: 502 })
    }
    revalidateDollarConsumers()
    return NextResponse.json({ ok: true, rate: result.rate, quote })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo obtener la cotización pública'
    await recordExchangeRateError(message, 'api_manual_refresh').catch(() => {})
    return NextResponse.json({
      error: 'No se pudo actualizar la cotización. Se mantiene el último valor válido.',
      details: message,
      rate: await getExchangeRate(),
    }, { status: 502 })
  }
}
