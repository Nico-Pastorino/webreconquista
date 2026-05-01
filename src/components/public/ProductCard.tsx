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

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative mb-6 aspect-square overflow-hidden rounded-[1.25rem] bg-gray-100">
        <ProductImage
          imageUrl={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full"
          imageClassName="p-8 transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </p>

        <h3 className="mb-4 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.03em] text-[#111111]">
          {product.name}
        </h3>

        <div className="mt-auto">
          <p className="text-[1.95rem] font-semibold tracking-[-0.05em] text-[#111111]">
            {formatARS(priceARS)}
          </p>
          {showUSD && (
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6B7280]">
              {formatUSD(product.price_usd)} USD
            </p>
          )}
          {best && (
            <p className="mt-2 text-sm text-[#6B7280]">
              {best.months}x {formatARS(best.monthly_ars)}
            </p>
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
