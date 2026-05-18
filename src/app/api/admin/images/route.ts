import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getUploadedImages, saveUploadedImage } from '@/lib/queries'

const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript):/i

function validateExternalUrl(url: string): { ok: boolean; error?: string; warning?: string } {
  const trimmed = url.trim()
  if (!trimmed) return { ok: false, error: 'La URL no puede estar vacía.' }
  if (!trimmed.startsWith('https://')) return { ok: false, error: 'La URL debe comenzar con https://' }
  if (BLOCKED_PROTOCOLS.test(trimmed)) return { ok: false, error: 'Tipo de URL no permitido.' }
  const hasImageExt = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|#|$)/i.test(trimmed)
  if (!hasImageExt) {
    return { ok: true, warning: 'La URL no parece terminar en una extensión de imagen conocida.' }
  }
  return { ok: true }
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const images = await getUploadedImages()
  return NextResponse.json({ images })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { url?: string; filename?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const url = (body.url ?? '').trim()
  const validation = validateExternalUrl(url)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const filename = (body.filename ?? '').trim() || url.split('/').pop()?.split('?')[0] || 'imagen-externa'

  try {
    const image = await saveUploadedImage(filename, url, url, {
      source_type: 'external',
      external_url: url,
    })
    return NextResponse.json({ image, warning: validation.warning ?? null })
  } catch (err) {
    console.error('[images POST] error:', err)
    return NextResponse.json({ error: 'Error al guardar la imagen.' }, { status: 500 })
  }
}
