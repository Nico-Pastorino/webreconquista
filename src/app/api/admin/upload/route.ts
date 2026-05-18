import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { saveUploadedImage } from '@/lib/queries'

const BUCKET = 'product-images'
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB per compressed blob

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url, key }
}

async function uploadToStorage(
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  blob: Blob,
): Promise<string> {
  const endpoint = `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'false',
    },
    body: blob,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase Storage error ${res.status}: ${text}`)
  }
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const cfg = getSupabaseConfig()
  if (!cfg) {
    return NextResponse.json(
      { error: 'Supabase Storage no configurado. Agregá SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY a las variables de entorno.' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const thumbnailBlob = formData.get('thumbnail') as Blob | null
  const mediumBlob = formData.get('medium') as Blob | null
  const filename = (formData.get('filename') as string | null) ?? 'imagen'

  if (!thumbnailBlob || !mediumBlob) {
    return NextResponse.json({ error: 'Se requieren los campos thumbnail y medium' }, { status: 400 })
  }
  if (thumbnailBlob.size > MAX_BYTES || mediumBlob.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo comprimido supera el límite de 2 MB' }, { status: 413 })
  }

  const slug = filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'imagen'

  const ts = Date.now()
  const folder = new Date().toISOString().slice(0, 7) // YYYY-MM
  const thumbPath = `${folder}/${ts}-${slug}-thumb.webp`
  const mediumPath = `${folder}/${ts}-${slug}-medium.webp`

  try {
    const [thumbnailUrl, mediumUrl] = await Promise.all([
      uploadToStorage(cfg.url, cfg.key, thumbPath, thumbnailBlob),
      uploadToStorage(cfg.url, cfg.key, mediumPath, mediumBlob),
    ])

    const image = await saveUploadedImage(slug, thumbnailUrl, mediumUrl)
    return NextResponse.json({ image })
  } catch (err) {
    console.error('[upload] error:', err)
    const msg = err instanceof Error ? err.message : 'Error al subir imagen'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
