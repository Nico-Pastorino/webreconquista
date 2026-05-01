import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('iphone')
}

export default async function IphonePage() {
  return <CategoryCatalogPage category="iphone" />
}
