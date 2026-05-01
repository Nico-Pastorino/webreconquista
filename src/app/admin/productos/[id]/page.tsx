export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getProductByIdAdmin } from '@/lib/queries'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  await requireAdminSession()
  const { id } = await params
  const product = await getProductByIdAdmin(Number(id))
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8">
        <Link href="/admin/productos" className="mb-4 flex items-center gap-1 text-sm text-[#666666] hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>
        <p className="admin-section-heading mb-3">Edición</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Editar producto</h1>
        <p className="mt-1 text-sm text-[#666666]">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
