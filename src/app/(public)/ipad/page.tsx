import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('ipad')
}

export default async function IpadPage() {
  return <CategoryCatalogPage category="ipad" />
}
