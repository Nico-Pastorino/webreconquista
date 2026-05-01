export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  await requireAdminSession()
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8">
        <Link href="/admin/productos" className="mb-4 flex items-center gap-1 text-sm text-[#666666] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a productos
        </Link>
        <p className="admin-section-heading mb-3">Alta de producto</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  )
}
