'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, X, Check, ImageIcon, Upload, Loader2, AlertCircle, Link as LinkIcon, AlertTriangle, ExternalLink } from 'lucide-react'
import {
  PRODUCT_IMAGE_LIBRARY,
  LIBRARY_CATEGORIES,
  findLibraryImageBySrc,
  type LibraryCategory,
} from '@/lib/product-image-library'
import type { UploadedImage } from '@/types'

interface Props {
  value: string
  onChange: (src: string) => void
}

type Tab = 'library' | 'uploads' | 'external'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 5 * 1024 * 1024
const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript):/i
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|#|$)/i

function validateExternalUrl(url: string): { ok: boolean; error?: string; warning?: string } {
  const t = url.trim()
  if (!t) return { ok: false, error: 'La URL no puede estar vacía.' }
  if (BLOCKED_PROTOCOLS.test(t)) return { ok: false, error: 'Tipo de URL no permitido.' }
  if (!t.startsWith('https://')) return { ok: false, error: 'La URL debe comenzar con https://' }
  if (!IMAGE_EXT_RE.test(t)) {
    return { ok: true, warning: 'La URL no termina en una extensión de imagen conocida. Igualmente podés guardarla.' }
  }
  return { ok: true }
}

async function compressToWebP(file: File, maxPx: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight))
      const w = Math.round(img.naturalWidth * ratio)
      const h = Math.round(img.naturalHeight * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas no disponible'))
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compresión fallida'))),
        'image/webp',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagen inválida')) }
    img.src = url
  })
}

export default function ImagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('library')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<LibraryCategory | 'all'>('all')
  const [failed, setFailed] = useState<Set<string>>(new Set())

  // uploads tab
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // external tab
  const [extUrl, setExtUrl] = useState('')
  const [extName, setExtName] = useState('')
  const [extValidation, setExtValidation] = useState<ReturnType<typeof validateExternalUrl> | null>(null)
  const [savingExt, setSavingExt] = useState(false)
  const [extError, setExtError] = useState<string | null>(null)

  const markFailed = useCallback((id: string) => {
    setFailed((prev) => new Set([...prev, id]))
  }, [])

  const current = findLibraryImageBySrc(value)

  const filtered = PRODUCT_IMAGE_LIBRARY.filter((img) => {
    if (failed.has(img.id)) return false
    const matchCat = category === 'all' || img.category === category
    const matchSearch = img.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const select = useCallback(
    (src: string) => {
      onChange(src)
      setOpen(false)
    },
    [onChange],
  )

  async function fetchUploadedImages() {
    setLoadingImages(true)
    try {
      const res = await fetch('/api/admin/images')
      if (res.ok) {
        const data = await res.json()
        setUploadedImages(data.images ?? [])
      }
    } finally {
      setLoadingImages(false)
    }
  }

  function openPicker() {
    setSearch('')
    setCategory('all')
    setUploadError(null)
    setExtUrl('')
    setExtName('')
    setExtValidation(null)
    setExtError(null)
    setOpen(true)
  }

  function switchTab(t: Tab) {
    setTab(t)
    if (t === 'uploads' && uploadedImages.length === 0 && !loadingImages) {
      fetchUploadedImages()
    }
    if (t === 'external') {
      setExtError(null)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError(null)
    if (!ACCEPTED.includes(file.type)) {
      setUploadError('Solo se aceptan JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      setUploadError('La imagen no puede superar 5 MB.')
      return
    }

    setUploading(true)
    try {
      const [thumbnail, medium] = await Promise.all([
        compressToWebP(file, 400, 0.70),
        compressToWebP(file, 900, 0.75),
      ])
      const fd = new FormData()
      fd.append('thumbnail', thumbnail, 'thumb.webp')
      fd.append('medium', medium, 'medium.webp')
      fd.append('filename', file.name.replace(/\.[^.]+$/, ''))

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Error al subir imagen.')
        return
      }
      setUploadedImages((prev) => [data.image, ...prev])
      onChange(data.image.medium_url)
      setOpen(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setUploading(false)
    }
  }

  function handleExtUrlChange(v: string) {
    setExtUrl(v)
    setExtError(null)
    if (v.trim()) setExtValidation(validateExternalUrl(v))
    else setExtValidation(null)
  }

  async function handleSaveExternal() {
    const v = validateExternalUrl(extUrl)
    setExtValidation(v)
    if (!v.ok) return

    setSavingExt(true)
    setExtError(null)
    try {
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extUrl.trim(), filename: extName.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setExtError(data.error ?? 'Error al guardar la URL.')
        return
      }
      setUploadedImages((prev) => [data.image, ...prev])
      onChange(extUrl.trim())
      setOpen(false)
    } catch (err) {
      setExtError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setSavingExt(false)
    }
  }

  const extValid = extValidation?.ok ?? false

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-[#f5f5f7]">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={current?.alt ?? 'Imagen seleccionada'}
                className="h-full w-full object-contain p-1.5"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-[#9CA3AF]" />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-[#111111]">
              {current?.name ?? (value ? 'Imagen personalizada' : 'Sin imagen')}
            </p>
            <button
              type="button"
              onClick={openPicker}
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1f1f1f]"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {value ? 'Cambiar imagen' : 'Elegir imagen'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 flex w-full flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl sm:mx-4 sm:max-w-2xl max-h-[90dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eaeaea]">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">
                  Biblioteca de imágenes
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {PRODUCT_IMAGE_LIBRARY.length} imágenes en biblioteca
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#eaeaea] p-2 text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-0">
              {([
                { key: 'library', label: 'Biblioteca' },
                { key: 'uploads', label: 'Mis imágenes' },
                { key: 'external', label: 'Agregar por link' },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    tab === key
                      ? 'bg-black text-white'
                      : 'bg-[#f5f5f7] text-[#6B7280] hover:bg-[#ececec] hover:text-[#111]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Library tab ── */}
            {tab === 'library' && (
              <>
                <div className="px-6 py-4 space-y-3 border-b border-[#eaeaea]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="search"
                      placeholder="Buscar por nombre…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-[#e5e7eb] bg-[#f5f5f7] py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {LIBRARY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                          category === cat.value
                            ? 'bg-black text-white'
                            : 'bg-[#f5f5f7] text-[#6B7280] hover:bg-[#ececec] hover:text-[#111111]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm">Sin resultados para &ldquo;{search}&rdquo;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {filtered.map((img) => {
                        const isSelected = img.src === value
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => select(img.src)}
                            className={`group relative flex flex-col gap-2 rounded-[1.25rem] border-2 p-2 text-left transition-all ${
                              isSelected
                                ? 'border-black bg-black/5'
                                : 'border-transparent bg-[#f5f5f7] hover:border-[#d1d5db] hover:bg-white'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black">
                                <Check className="h-3 w-3 text-white" />
                              </span>
                            )}
                            <div className="aspect-square w-full overflow-hidden rounded-[0.875rem] bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                                onError={() => markFailed(img.id)}
                                className="h-full w-full object-contain p-2"
                              />
                            </div>
                            <p className="line-clamp-2 px-0.5 text-[10px] font-medium leading-tight text-[#374151]">
                              {img.name}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Uploads tab ── */}
            {tab === 'uploads' && (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingImages ? (
                  <div className="flex items-center justify-center py-12 text-[#9CA3AF]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : uploadedImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm">Todavía no subiste ninguna imagen.</p>
                    <p className="mt-1 text-xs">Usá el botón &ldquo;Subir imagen&rdquo; de abajo o &ldquo;Agregar por link&rdquo;.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {uploadedImages.map((img) => {
                      const displayUrl = img.medium_url
                      const isSelected = displayUrl === value
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => select(displayUrl)}
                          className={`group relative flex flex-col gap-2 rounded-[1.25rem] border-2 p-2 text-left transition-all ${
                            isSelected
                              ? 'border-black bg-black/5'
                              : 'border-transparent bg-[#f5f5f7] hover:border-[#d1d5db] hover:bg-white'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black">
                              <Check className="h-3 w-3 text-white" />
                            </span>
                          )}
                          {img.source_type === 'external' && (
                            <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">
                              <ExternalLink className="h-2.5 w-2.5" />
                              link
                            </span>
                          )}
                          <div className="aspect-square w-full overflow-hidden rounded-[0.875rem] bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.thumbnail_url}
                              alt={img.filename}
                              loading="lazy"
                              className="h-full w-full object-contain p-2"
                            />
                          </div>
                          <p className="line-clamp-2 px-0.5 text-[10px] font-medium leading-tight text-[#374151]">
                            {img.filename}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── External link tab ── */}
            {tab === 'external' && (
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Disclaimer */}
                <div className="mb-5 flex gap-2.5 rounded-[1.25rem] bg-amber-50 px-4 py-3.5 text-xs leading-6 text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium">Imagen por link externo</p>
                    <p className="mt-0.5 text-amber-600">
                      No consume Supabase Storage, pero depende del servidor externo.
                      Si el link deja de funcionar, la imagen no se verá.
                      Para mejor rendimiento, se recomienda subir imágenes WebP optimizadas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* URL field */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#374151]">
                      URL de la imagen <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={extUrl}
                        onChange={(e) => handleExtUrlChange(e.target.value)}
                        className="w-full rounded-[1rem] border border-[#e5e7eb] bg-[#f5f5f7] py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
                        autoFocus
                      />
                    </div>
                    {/* Inline validation */}
                    {extValidation && !extValidation.ok && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {extValidation.error}
                      </p>
                    )}
                    {extValidation?.warning && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {extValidation.warning}
                      </p>
                    )}
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#374151]">
                      Nombre <span className="text-[#9CA3AF] font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: iPhone 16 Pro Negro"
                      value={extName}
                      onChange={(e) => setExtName(e.target.value)}
                      className="w-full rounded-[1rem] border border-[#e5e7eb] bg-[#f5f5f7] py-2.5 px-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  {/* Preview */}
                  {extValid && extUrl && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-[#374151]">Vista previa</p>
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1rem] border border-[#e5e7eb] bg-[#f5f5f7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={extUrl}
                          alt="preview"
                          loading="lazy"
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                    </div>
                  )}

                  {extError && (
                    <div className="flex items-start gap-2 rounded-[1rem] bg-red-50 px-4 py-3 text-xs text-red-600">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {extError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!extValid || savingExt}
                    onClick={handleSaveExternal}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingExt ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                    {savingExt ? 'Guardando…' : 'Guardar y usar esta imagen'}
                  </button>
                </div>
              </div>
            )}

            {/* Footer — upload button (visible on library + uploads tabs) */}
            {tab !== 'external' && (
              <div className="border-t border-[#eaeaea] px-6 py-4">
                {uploadError && (
                  <div className="mb-3 flex items-start gap-2 rounded-[1rem] bg-red-50 px-4 py-3 text-xs text-red-600">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {uploadError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9CA3AF]">
                    JPG, PNG o WebP · máx. 5 MB
                  </p>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#111] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {uploading ? 'Subiendo…' : 'Subir imagen'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
