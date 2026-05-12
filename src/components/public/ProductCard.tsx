import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ProductCard as ProductCardType, InstallmentPlan } from '@/types'
import { calcPriceARS, calcInstallments, calcBestInstallment, formatARS, formatUSD } from '@/lib/calculations'
import { CATEGORY_LABELS } from '@/lib/utils'
import ProductImage from '@/components/ui/ProductImage'

interface Props {
  product: ProductCardType
  dollarRate: number
  installmentPlans: InstallmentPlan[]
  showUSD?: boolean
}

export default function ProductCard({ product, dollarRate, installmentPlans, showUSD = true }: Props) {
  const priceARS = calcPriceARS(product.price_usd, dollarRate)
  const options = calcInstallments(product.price_usd, dollarRate, installmentPlans)
  const best = calcBestInstallment(options)

  let bestLabel: string | null = null
  if (best) {
    if (best.months === 1 && best.surcharge_pct === 0) {
      bestLabel = `1 pago sin recargo`
    } else if (best.surcharge_pct === 0) {
      bestLabel = `Hasta ${best.months} cuotas sin interés de ${formatARS(best.monthly_ars)}`
    } else {
      bestLabel = `Hasta ${best.months} cuotas de ${formatARS(best.monthly_ars)}`
    }
  }

  // iPhone: la imagen del CDN trae fondo gris incorporado.
  // Solución: contenedor gris que hace match + imagen escalada al 135% para
  // que el fondo gris llene el contenedor y no se vea como un recuadro.
  const isIphone = product.category === 'iphone'

  const containerClass = isIphone
    ? 'relative mb-6 aspect-square overflow-hidden rounded-[1.25rem] bg-[#F5F5F7]'
    : 'relative mb-6 aspect-square isolate overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-black/[0.06]'

  const imgWrapperClass = isIphone
    ? 'h-full w-full bg-[#F5F5F7]'
    : 'h-full w-full bg-white'

  const imgClass = isIphone
    ? 'object-contain scale-[1.35] transition-transform duration-500 group-hover:scale-[1.42]'
    : 'object-contain mix-blend-multiply p-5 transition-transform duration-500 group-hover:scale-[1.04]'

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={containerClass}>
        <ProductImage
          imageUrl={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={imgWrapperClass}
          imageClassName={imgClass}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </p>
          {product.product_label && (
            <span className="rounded-full border border-[#E5E7EB] bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-medium tracking-[0.06em] text-[#6B7280]">
              {product.product_label}
            </span>
          )}
        </div>

        <h3 className="mb-4 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.03em] text-[#111111]">
          {product.name}
        </h3>

        <div className="mt-auto">
          <p className="text-[1.95rem] font-semibold tracking-[-0.05em] text-[#111111]">
            {formatARS(priceARS)}
          </p>
          {showUSD && (
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6B7280]">
              {formatUSD(product.price_usd)}
            </p>
          )}
          {bestLabel && (
            <p className="mt-2 text-sm text-[#6B7280]">{bestLabel}</p>
          )}
        </div>

        <span className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-medium text-[#111111]">
          Ver producto
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
