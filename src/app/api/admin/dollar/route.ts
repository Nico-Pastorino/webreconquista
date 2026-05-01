import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getStorage } from '@/lib/storage'
import { fetchOfficialDollarQuote } from '@/lib/dollar-api'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const { rate } = await req.json()
  if (!rate || isNaN(Number(rate))) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }
  await (await getStorage()).updateDollarRate(Number(rate))
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, rate })
}

export async function POST() {
  const err = await guard(); if (err) return err

  try {
    const quote = await fetchOfficialDollarQuote()
    const updated = await (await getStorage()).updateDollarRate(Number(quote.sell))
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true, rate: updated.rate, quote })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo obtener la cotización pública'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
