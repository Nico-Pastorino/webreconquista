import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('airpods')
}

export default async function AirpodsPage() {
  return <CategoryCatalogPage category="airpods" />
}
