import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductImage from '@/components/ui/ProductImage'

export default function ProductPlaceholderCard({ title = 'Producto Apple disponible en breve' }: { title?: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <ProductImage
        alt="Imagen próximamente"
        className="mb-6 aspect-square rounded-[1.25rem] bg-gray-100"
        imageClassName="p-10"
      />
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">
        Próximamente
      </p>
      <h3 className="mb-4 text-lg font-semibold leading-snug tracking-[-0.03em] text-[#111111]">
        {title}
      </h3>
      <div className="mt-auto flex flex-col gap-1.5">
        <p className="text-[1.95rem] font-semibold tracking-[-0.05em] text-[#111111]">$0</p>
        <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">USD 0</p>
        <p className="mt-1 text-sm text-[#6B7280]">Cuotas a confirmar</p>
        <Link href="/contacto" className="mt-7 inline-flex w-fit items-center gap-1 text-sm font-medium text-[#111111]">
          Consultar disponibilidad
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
