import { getDollarRate, getInstallmentPlans, getProducts, getSiteSettings } from '@/lib/queries'
import CatalogPageContent from '@/components/public/CatalogPageContent'
import { connection } from 'next/server'

export const revalidate = 300

export const metadata = {
  title: 'iPhone Seminuevos',
  description: 'iPhone seminuevos certificados disponibles en STORE RQTA.',
}

export default async function IphoneSeminuevosPage() {
  await connection()

  let products: import('@/types').ProductCard[] = []
  let dollarRate = 1200
  let installmentPlans: import('@/types').InstallmentPlan[] = []
  let settings = { show_usd_price: true }

  try {
    ;[products, dollarRate, installmentPlans, settings] = await Promise.all([
      getProducts('iphone', 'Seminuevo'),
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  return (
    <CatalogPageContent
      title="iPhone Seminuevos"
      description="iPhone usados certificados con garantía."
      products={products}
      activeCategory="iphone"
      dollarRate={dollarRate}
      installmentPlans={installmentPlans}
      showUSD={settings.show_usd_price}
    />
  )
}
