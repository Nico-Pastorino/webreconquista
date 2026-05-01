import { NextRequest, NextResponse } from 'next/server'
import { createAdminSession, destroyAdminSession, verifyAdminPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }
    await createAdminSession()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}

export async function DELETE() {
  await destroyAdminSession()
  return NextResponse.json({ ok: true })
}
