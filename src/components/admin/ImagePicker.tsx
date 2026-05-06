'use client'

import { useState, useCallback } from 'react'
import { Search, X, Check, ImageIcon, Upload } from 'lucide-react'
import {
  PRODUCT_IMAGE_LIBRARY,
  LIBRARY_CATEGORIES,
  findLibraryImageBySrc,
  type LibraryCategory,
} from '@/lib/product-image-library'

interface Props {
  value: string
  onChange: (src: string) => void
}

export default function ImagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<LibraryCategory | 'all'>('all')
  // IDs de imágenes que fallaron al cargar — se ocultan automáticamente
  const [failed, setFailed] = useState<Set<string>>(new Set())

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

  const openPicker = () => {
    setSearch('')
    setCategory('all')
    setOpen(true)
  }

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Miniatura actual */}
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 flex w-full flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl sm:mx-4 sm:max-w-2xl max-h-[90dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eaeaea]">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">
                  Biblioteca de imágenes
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {PRODUCT_IMAGE_LIBRARY.length} imágenes disponibles
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

            {/* Search + Filters */}
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

            {/* Grid */}
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
                        {/* Checkmark */}
                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black">
                            <Check className="h-3 w-3 text-white" />
                          </span>
                        )}
                        {/* Imagen */}
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
                        {/* Nombre */}
                        <p className="line-clamp-2 px-0.5 text-[10px] font-medium leading-tight text-[#374151]">
                          {img.name}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer — upload futuro */}
            <div className="border-t border-[#eaeaea] px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#9CA3AF]">
                  ¿No encontrás la imagen? Podés agregar imágenes locales en{' '}
                  <code className="font-mono text-[11px]">/public/product-library/</code>
                </p>
                <button
                  type="button"
                  title="Próximamente"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] cursor-not-allowed"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Subir imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
