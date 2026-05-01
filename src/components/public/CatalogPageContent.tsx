import Link from 'next/link'
import ProductCard from '@/components/public/ProductCard'
import ProductPlaceholderCard from '@/components/public/ProductPlaceholderCard'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Category, InstallmentPlan, ProductCard as ProductCardType } from '@/types'

export const CATALOG_CATEGORIES = ['iphone', 'ipad', 'mac', 'watch', 'airpods', 'accesorios'] as Category[]

interface CatalogPageContentProps {
  title: string
  description: string
  products: ProductCardType[]
  activeCategory?: Category
  q?: string
  dollarRate: number
  installmentPlans: InstallmentPlan[]
  showUSD: boolean
}

export default function CatalogPageContent({
  title,
  description,
  products,
  activeCategory,
  q,
  dollarRate,
  installmentPlans,
  showUSD,
}: CatalogPageContentProps) {
  const categoryHref = (category: Category) =>
    category === 'accesorios' ? '/productos?cat=accesorios' : `/${category}`

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="mb-14 max-w-3xl">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Catálogo</p>
        <h1 className="text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]">{title}</h1>
        <p className="mt-4 text-base leading-8 text-[#6B7280]">{description}</p>
      </div>

      <div className="mb-8 rounded-[2rem] border border-[#ECECEF] bg-[#F5F5F7] p-3 sm:p-4">
        <form action="/productos" className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input type="hidden" name="cat" value={activeCategory ?? ''} />
          <div className="flex-1">
            <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
            <input
              id="catalog-search"
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Buscar por nombre"
              className="w-full rounded-full border border-transparent bg-white px-5 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#E5E7EB]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1F1F1F]"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="mb-14 flex flex-wrap gap-3">
        <Link
          href="/productos"
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-black text-white'
              : 'bg-[#F5F5F7] text-[#6B7280] hover:bg-[#ECECEF] hover:text-[#111111]'
          }`}
        >
          Todos
        </Link>
        {CATALOG_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={categoryHref(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-black text-white'
                : 'bg-[#F5F5F7] text-[#6B7280] hover:bg-[#ECECEF] hover:text-[#111111]'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dollarRate={dollarRate}
              installmentPlans={installmentPlans}
              showUSD={showUSD}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-white px-6 py-16 text-center">
            <p className="text-xl font-semibold tracking-[-0.03em] text-[#111111]">
              {q ? 'No encontramos resultados para tu búsqueda.' : 'Todavía no hay productos publicados en esta sección.'}
            </p>
            <p className="mt-3 text-sm text-[#6B7280]">
              {q ? 'Probá otro nombre o explorá otra categoría.' : 'Mientras tanto, podés consultar disponibilidad y recibir atención directa.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductPlaceholderCard key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
