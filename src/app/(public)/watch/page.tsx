import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('watch')
}

export default async function WatchPage() {
  return <CategoryCatalogPage category="watch" />
}
