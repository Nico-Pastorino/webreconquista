import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getSiteSettings } from '@/lib/queries'
import { getStorage } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

async function guard() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard(); if (err) return err
  const settings = await getSiteSettings()
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  const err = await guard(); if (err) return err
  const updates: Record<string, string> = await req.json()
  await (await getStorage()).updateSiteSettings({
    whatsapp_number: updates.whatsapp_number,
    whatsapp_message: updates.whatsapp_message,
    store_name: updates.store_name,
    store_tagline: updates.store_tagline,
    trade_in_enabled: updates.trade_in_enabled === 'true',
    show_usd_price: updates.show_usd_price === 'true',
    show_installments: updates.show_installments === 'true',
  })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
