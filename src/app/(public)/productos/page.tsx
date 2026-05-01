import { getDollarRate, getInstallmentPlans, getProducts, getSiteSettings } from '@/lib/queries'
import CatalogPageContent, { CATALOG_CATEGORIES } from '@/components/public/CatalogPageContent'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Category } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ cat?: string; q?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { cat } = await searchParams
  return {
    title: cat ? `${CATEGORY_LABELS[cat] ?? cat} | Productos` : 'Todos los productos',
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const { cat, q } = await searchParams
  const activeCategory = CATALOG_CATEGORIES.includes(cat as Category) ? (cat as Category) : undefined

  let products: import('@/types').ProductCard[] = []
  let dollarRate = 1200
  let installmentPlans: import('@/types').InstallmentPlan[] = []
  let settings = { show_usd_price: true }

  try {
    ;[products, dollarRate, installmentPlans, settings] = await Promise.all([
      getProducts(activeCategory),
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  const filtered = q
    ? products.filter((product) => product.name.toLowerCase().includes(q.toLowerCase()))
    : products

  return (
    <CatalogPageContent
      title={activeCategory ? CATEGORY_LABELS[activeCategory] : 'Todos los productos'}
      description={`${filtered.length} productos presentados con foco en imagen, precio y claridad.`}
      products={filtered}
      activeCategory={activeCategory}
      q={q}
      dollarRate={dollarRate}
      installmentPlans={installmentPlans}
      showUSD={settings.show_usd_price}
    />
  )
}
