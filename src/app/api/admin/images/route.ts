import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getUploadedImages } from '@/lib/queries'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const images = await getUploadedImages()
  return NextResponse.json({ images })
}
