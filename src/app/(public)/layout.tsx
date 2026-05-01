import { getSiteSettings } from '@/lib/queries'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import type { SiteSettings } from '@/types'

export const revalidate = 60

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '5491100000000',
  whatsapp_message: 'Hola! Me interesa: ',
  store_name: 'Store RQTA',
  store_tagline: 'Comprá Apple. Sin intermediarios.',
  trade_in_enabled: true,
  show_usd_price: true,
  show_installments: true,
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settings = DEFAULT_SETTINGS
  try {
    settings = await getSiteSettings()
  } catch {
    // DB no conectada — usar valores por defecto
  }

  return (
    <div className="flex min-h-screen flex-col text-[#111111]">
      <Navbar />
      <main className="flex-1 px-0 pt-32 lg:pt-36">{children}</main>
      <Footer storeName={settings.store_name} />
    </div>
  )
}
