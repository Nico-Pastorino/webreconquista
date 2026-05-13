import CatalogPageContent from '@/components/public/CatalogPageContent'
import { getDollarRate, getInstallmentPlans, getProducts, getSiteSettings } from '@/lib/queries'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Category } from '@/types'
import { connection } from 'next/server'

interface CategoryCatalogPageProps {
  category: Category
}

export async function buildCategoryCatalogMetadata(category: Category) {
  return {
    title: `${CATEGORY_LABELS[category]} | Store RQTA`,
  }
}

export default async function CategoryCatalogPage({ category }: CategoryCatalogPageProps) {
  await connection()

  let products: import('@/types').ProductCard[] = []
  let dollarRate = 1200
  let installmentPlans: import('@/types').InstallmentPlan[] = []
  let settings = { show_usd_price: true }

  try {
    ;[products, dollarRate, installmentPlans, settings] = await Promise.all([
      getProducts(category),
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  return (
    <CatalogPageContent
      title={CATEGORY_LABELS[category]}
      description={`${products.length} productos disponibles en esta categoría.`}
      products={products}
      activeCategory={category}
      dollarRate={dollarRate}
      installmentPlans={installmentPlans}
      showUSD={settings.show_usd_price}
    />
  )
}
