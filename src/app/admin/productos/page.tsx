export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getAllProductsAdmin, getDollarRate } from '@/lib/queries'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ProductsTable from '@/components/admin/ProductsTable'

export default async function AdminProductsPage() {
  await requireAdminSession()
  const [products, dollarRate] = await Promise.all([getAllProductsAdmin(), getDollarRate()])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-section-heading mb-3">Productos</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Productos</h1>
          <p className="mt-1 text-sm text-[#666666]">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-[#1f1f1f]"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>
      <ProductsTable products={products} dollarRate={dollarRate} />
    </div>
  )
}
