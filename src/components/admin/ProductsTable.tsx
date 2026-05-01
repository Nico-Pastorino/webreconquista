'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatARS } from '@/lib/calculations'
import { Pencil, Trash2 } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/utils'
import ProductImage from '@/components/ui/ProductImage'

interface Props {
  products: Product[]
  dollarRate: number
}

export default function ProductsTable({ products, dollarRate }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="surface-card overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eaeaea] bg-[#f5f5f7]">
              <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Producto</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Categoría</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">USD</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">ARS</th>
              <th className="px-5 py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#666666]">Estado</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaeaea]">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-[#f5f5f7]/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[14px] bg-[#f5f5f7]">
                      <ProductImage
                        imageUrl={p.image_url}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="h-full w-full"
                        imageClassName="p-1"
                        placeholderLabel="Sin imagen"
                      />
                    </div>
                    <div>
                      <p className="font-medium tracking-[-0.02em] text-[#111111] line-clamp-1">{p.name}</p>
                      {p.featured && (
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[#666666]">Destacado</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#666666]">
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </td>
                <td className="px-5 py-4 text-right font-medium text-[#111111]">
                  ${Number(p.price_usd).toLocaleString('en-US')}
                </td>
                <td className="px-5 py-4 text-right text-[#666666]">
                  {formatARS(Number(p.price_usd) * dollarRate)}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${p.active ? 'bg-[#f5f5f7] text-[#111111]' : 'bg-[#f5f5f7] text-[#999999]'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="rounded-full border border-[#eaeaea] p-2 text-[#666666] transition-colors hover:border-[#d1d5db] hover:bg-[#f5f5f7] hover:text-[#111111]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deleting === p.id}
                      className="rounded-full border border-[#eaeaea] p-2 text-[#666666] transition-colors hover:border-[#d1d5db] hover:bg-[#f5f5f7] hover:text-[#111111] disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#666666]">
              No hay productos.{' '}
              <Link href="/admin/productos/nuevo" className="text-[#111111] underline underline-offset-4">
                Creá el primero →
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
