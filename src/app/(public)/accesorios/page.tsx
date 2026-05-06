import CategoryCatalogPage, { buildCategoryCatalogMetadata } from '@/components/public/CategoryCatalogPage'

export async function generateMetadata() {
  return buildCategoryCatalogMetadata('accesorios')
}

export default async function AccesoriosPage() {
  return <CategoryCatalogPage category="accesorios" />
}
