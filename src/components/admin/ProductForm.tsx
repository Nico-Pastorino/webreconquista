'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'
import ProductImage from '@/components/ui/ProductImage'

const CATEGORIES = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'mac', label: 'Mac' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'airpods', label: 'AirPods' },
  { value: 'accesorios', label: 'Accesorios' },
]

interface Props {
  product?: Product
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#111111]">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-[1.2rem] border border-[#e5e7eb] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] outline-none transition-colors focus:border-[#d1d5db] focus:ring-4 focus:ring-black/5'

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'iphone',
    price_usd: product?.price_usd?.toString() ?? '',
    image_url: product?.image_url ?? '',
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    description: product?.description ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body = { ...form, price_usd: parseFloat(form.price_usd) }
      const res = isEdit
        ? await fetch(`/api/admin/products/${product!.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      if (res.ok) {
        router.push('/admin/productos')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      {error && (
        <div className="mb-6 rounded-[22px] border border-[#eaeaea] bg-[#f5f5f7] px-5 py-3.5 text-sm text-[#111111]">
          {error}
        </div>
      )}

      <div className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nombre del producto">
              <input
                type="text"
                placeholder="iPhone 15 Pro 256GB"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Categoría">
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputCls + ' appearance-none'}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Precio en USD">
            <input
              type="number"
              placeholder="999"
              min="0"
              step="0.01"
              value={form.price_usd}
              onChange={(e) => set('price_usd', e.target.value)}
              required
              className={inputCls}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="URL de imagen">
              <input
                type="url"
                placeholder="Opcional: https://..."
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                className={inputCls}
              />
              <div className="mt-3 h-20 w-20 overflow-hidden rounded-[18px] border border-[#eaeaea] bg-[#f5f5f7]">
                <ProductImage
                  imageUrl={form.image_url}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="h-full w-full"
                  imageClassName="p-2"
                  placeholderLabel="Sin imagen"
                />
              </div>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descripción breve del producto..."
                className={inputCls + ' resize-none'}
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => set('featured', !form.featured)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.featured ? 'bg-black' : 'bg-[#d6d6d6]'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-[#111111]">Producto destacado</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => set('active', !form.active)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.active ? 'bg-black' : 'bg-[#d6d6d6]'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-[#111111]">Activo (visible en tienda)</span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-full border border-[#d6d6d6] px-6 py-3 text-sm font-medium text-[#111111] transition-colors hover:border-[#d1d5db] hover:bg-[#f5f5f7]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-50"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
