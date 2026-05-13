import { getDollarRate, getInstallmentPlans, getProducts, getSiteSettings } from '@/lib/queries'
import CatalogPageContent from '@/components/public/CatalogPageContent'
import { connection } from 'next/server'

export const revalidate = 300

export const metadata = {
  title: 'iPhone Sellados Nuevos',
  description: 'iPhone sellados nuevos disponibles en STORE RQTA. Garantía oficial, cuotas y envío.',
}

export default async function IphoneSelladosNuevosPage() {
  await connection()

  let products: import('@/types').ProductCard[] = []
  let dollarRate = 1200
  let installmentPlans: import('@/types').InstallmentPlan[] = []
  let settings = { show_usd_price: true }

  try {
    ;[products, dollarRate, installmentPlans, settings] = await Promise.all([
      getProducts('iphone', 'Sellado Nuevo'),
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  return (
    <CatalogPageContent
      title="iPhone Sellados Nuevos"
      description="iPhone sin abrir, con garantía oficial Apple."
      products={products}
      activeCategory="iphone"
      dollarRate={dollarRate}
      installmentPlans={installmentPlans}
      showUSD={settings.show_usd_price}
    />
  )
}
