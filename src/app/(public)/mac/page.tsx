import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('mac')
}

export default async function MacPage() {
  return <CategoryCatalogPage category="mac" />
}
