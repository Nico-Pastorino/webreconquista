'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Search, X, Check, ImageIcon, Upload, Loader2,
  AlertCircle, Link as LinkIcon, AlertTriangle, ChevronLeft,
} from 'lucide-react'
import {
  PRODUCT_IMAGE_LIBRARY,
  LIBRARY_CATEGORIES,
  findLibraryImageBySrc,
  type LibraryCategory,
} from '@/lib/product-image-library'
import type { UploadedImage } from '@/types'

// ─── Types ────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (src: string) => void
}

type SourceFilter = 'all' | 'local' | 'upload' | 'external'

interface UnifiedImage {
  id: string
  name: string
  category: string
  src: string
  thumbnailSrc: string
  alt: string
  sourceType: 'local' | 'upload' | 'external'
}

// ─── Constants ────────────────────────────────────────────────

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 5 * 1024 * 1024
const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript):/i
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|#|$)/i

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'local',    label: 'Locales' },
  { value: 'upload',   label: 'Subidas' },
  { value: 'external', label: 'Link externo' },
]

// badge styles per source type
const BADGE: Record<UnifiedImage['sourceType'], string> = {
  local:    'bg-[#f0f0f2] text-[#666]',
  upload:   'bg-blue-50 text-blue-600',
  external: 'bg-amber-50 text-amber-700',
}
const BADGE_LABEL: Record<UnifiedImage['sourceType'], string> = {
  local:    'Local',
  upload:   'Subida',
  external: 'Link',
}

// ─── Helpers ──────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────

export default function ImagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  // filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<LibraryCategory | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')

  // local library — track failed URLs
  const [failed, setFailed] = useState<Set<string>>(new Set())

  // uploaded/external images from DB
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploadedFetched, setUploadedFetched] = useState(false)

  // upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // "agregar por link" form
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [extUrl, setExtUrl] = useState('')
  const [extName, setExtName] = useState('')
  const [extValidation, setExtValidation] = useState<ReturnType<typeof validateExternalUrl> | null>(null)
  const [savingExt, setSavingExt] = useState(false)
  const [extError, setExtError] = useState<string | null>(null)

  const markFailed = useCallback((id: string) => {
    setFailed((prev) => new Set([...prev, id]))
  }, [])

  const current = findLibraryImageBySrc(value)

  // ── Unified image array ────────────────────────────────────

  const allImages = useMemo<UnifiedImage[]>(() => {
    const fromUploaded: UnifiedImage[] = uploadedImages.map((img) => ({
      id: `db:${img.id}`,
      name: img.filename,
      category: 'sin-categoría',
      src: img.medium_url,
      thumbnailSrc: img.thumbnail_url,
      alt: img.filename,
      sourceType: img.source_type === 'external' ? 'external' : 'upload',
    }))

    const fromLocal: UnifiedImage[] = PRODUCT_IMAGE_LIBRARY
      .filter((img) => !failed.has(img.id))
      .map((img) => ({
        id: `local:${img.id}`,
        name: img.name,
        category: img.category,
        src: img.src,
        thumbnailSrc: img.src,
        alt: img.alt,
        sourceType: 'local',
      }))

    // Uploaded/external first (most recent), then local library
    return [...fromUploaded, ...fromLocal]
  }, [uploadedImages, failed])

  // ── Filtered array ─────────────────────────────────────────

  const filtered = useMemo(() => {
    return allImages.filter((img) => {
      // source filter
      if (sourceFilter !== 'all' && img.sourceType !== sourceFilter) return false

      // category filter
      if (categoryFilter !== 'all') {
        if (img.sourceType === 'local') {
          if (img.category !== categoryFilter) return false
        } else {
          // uploads/externals are uncategorized: only show when source filter explicitly selects them
          if (sourceFilter === 'all') return false
        }
      }

      // search (name + alt)
      if (search) {
        const q = search.toLowerCase()
        if (!img.name.toLowerCase().includes(q) && !img.alt.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [allImages, sourceFilter, categoryFilter, search])

  // ── Counts for header ──────────────────────────────────────

  const countLocal = PRODUCT_IMAGE_LIBRARY.length
  const countUploaded = uploadedImages.filter((i) => i.source_type === 'supabase').length
  const countExternal = uploadedImages.filter((i) => i.source_type === 'external').length
  const countTotal = countLocal + uploadedImages.length

  // ── Data fetching ──────────────────────────────────────────

  async function fetchUploadedImages() {
    if (uploadedFetched) return
    setLoadingImages(true)
    try {
      const res = await fetch('/api/admin/images')
      if (res.ok) {
        const data = await res.json()
        setUploadedImages(data.images ?? [])
        setUploadedFetched(true)
      }
    } finally {
      setLoadingImages(false)
    }
  }

  // ── Open / close ───────────────────────────────────────────

  function openPicker() {
    setSearch('')
    setCategoryFilter('all')
    setSourceFilter('all')
    setShowLinkForm(false)
    setUploadError(null)
    setExtUrl('')
    setExtName('')
    setExtValidation(null)
    setExtError(null)
    setOpen(true)
    fetchUploadedImages()
  }

  function closePicker() {
    setOpen(false)
  }

  // ESC to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showLinkForm) setShowLinkForm(false)
        else closePicker()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, showLinkForm])

  // ── Select image ───────────────────────────────────────────

  const select = useCallback(
    (src: string) => {
      onChange(src)
      setOpen(false)
    },
    [onChange],
  )

  // ── Upload file ────────────────────────────────────────────

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

  // ── External link form ─────────────────────────────────────

  function handleExtUrlChange(v: string) {
    setExtUrl(v)
    setExtError(null)
    setExtValidation(v.trim() ? validateExternalUrl(v) : null)
  }

  function openLinkForm() {
    setExtUrl('')
    setExtName('')
    setExtValidation(null)
    setExtError(null)
    setShowLinkForm(true)
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

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* Trigger */}
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

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closePicker}
          />

          {/* Panel */}
          <div className="relative z-10 flex w-full flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl sm:mx-4 sm:max-w-2xl max-h-[90dvh]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#eaeaea]">
              <div>
                <h2 className="text-base font-semibold tracking-[-0.03em] text-[#111111]">
                  Biblioteca de imágenes
                </h2>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                  <span>{countTotal} total</span>
                  <span>·</span>
                  <span>{countLocal} locales</span>
                  {countUploaded > 0 && <><span>·</span><span>{countUploaded} subidas</span></>}
                  {countExternal > 0 && <><span>·</span><span>{countExternal} links</span></>}
                </div>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="rounded-full border border-[#eaeaea] p-2 text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Content area ── */}
            {showLinkForm ? (
              /* ── Link form panel ── */
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <button
                  type="button"
                  onClick={() => setShowLinkForm(false)}
                  className="mb-5 flex items-center gap-1.5 text-xs font-medium text-[#666] transition-colors hover:text-[#111]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Volver a la biblioteca
                </button>

                <div className="mb-4 flex gap-2.5 rounded-[1rem] bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p>
                    Las imágenes por link no consumen Supabase Storage pero dependen del servidor externo.
                    Si el link deja de funcionar, la imagen no se verá.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* URL */}
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

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#374151]">
                      Nombre <span className="font-normal text-[#9CA3AF]">(opcional)</span>
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
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[0.875rem] border border-[#e5e7eb] bg-[#f5f5f7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={extUrl} alt="preview" loading="lazy" className="h-full w-full object-contain p-1.5" />
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingExt ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                    {savingExt ? 'Guardando…' : 'Guardar y usar esta imagen'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Filters bar ── */}
                <div className="space-y-2.5 border-b border-[#eaeaea] px-6 py-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="search"
                      placeholder="Buscar por nombre…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-[#e5e7eb] bg-[#f5f5f7] py-2 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5"
                      autoFocus
                    />
                  </div>

                  {/* Category pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                    {LIBRARY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategoryFilter(cat.value)}
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          categoryFilter === cat.value
                            ? 'bg-black text-white'
                            : 'bg-[#f5f5f7] text-[#6B7280] hover:bg-[#ececec] hover:text-[#111]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Origin pills */}
                  <div className="flex gap-1.5">
                    {SOURCE_FILTERS.map((sf) => (
                      <button
                        key={sf.value}
                        type="button"
                        onClick={() => setSourceFilter(sf.value)}
                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          sourceFilter === sf.value
                            ? 'bg-[#111111] text-white'
                            : 'border border-[#e5e7eb] text-[#6B7280] hover:border-[#d1d5db] hover:text-[#111]'
                        }`}
                      >
                        {sf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Grid ── */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {loadingImages && uploadedImages.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-[#9CA3AF]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                      <ImageIcon className="mb-2 h-8 w-8" />
                      <p className="text-sm">Sin resultados</p>
                      {(search || categoryFilter !== 'all' || sourceFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => { setSearch(''); setCategoryFilter('all'); setSourceFilter('all') }}
                          className="mt-2 text-xs text-[#666] underline underline-offset-2 hover:text-[#111]"
                        >
                          Limpiar filtros
                        </button>
                      )}
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
                            {/* Selected checkmark */}
                            {isSelected && (
                              <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black">
                                <Check className="h-3 w-3 text-white" />
                              </span>
                            )}

                            {/* Source badge */}
                            <span
                              className={`absolute left-2 top-2 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${BADGE[img.sourceType]}`}
                            >
                              {BADGE_LABEL[img.sourceType]}
                            </span>

                            {/* Thumbnail */}
                            <div className="aspect-square w-full overflow-hidden rounded-[0.875rem] bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.thumbnailSrc}
                                alt={img.alt}
                                loading="lazy"
                                onError={
                                  img.sourceType === 'local'
                                    ? () => markFailed(img.id.replace('local:', ''))
                                    : undefined
                                }
                                className="h-full w-full object-contain p-2"
                              />
                            </div>

                            {/* Name */}
                            <p className="line-clamp-2 px-0.5 text-[10px] font-medium leading-tight text-[#374151]">
                              {img.name}
                            </p>
                          </button>
                        )
                      })}

                      {/* Loading indicator for when local images are shown but uploads still loading */}
                      {loadingImages && (
                        <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-[#f5f5f7]">
                          <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Footer ── */}
            <div className="border-t border-[#eaeaea] px-6 py-3.5">
              {uploadError && (
                <div className="mb-3 flex items-start gap-2 rounded-[1rem] bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-[#9CA3AF]">JPG · PNG · WebP · máx. 5 MB</p>
                <div className="flex items-center gap-2">
                  {/* Add by link */}
                  {!showLinkForm && (
                    <button
                      type="button"
                      onClick={openLinkForm}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#111] hover:text-[#111]"
                    >
                      <LinkIcon className="h-3 w-3" />
                      Agregar por link
                    </button>
                  )}
                  {/* Upload file */}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {uploading ? 'Subiendo…' : 'Subir imagen'}
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
