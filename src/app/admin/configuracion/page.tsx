export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getSiteSettings } from '@/lib/queries'
import SettingsForm from '@/components/admin/SettingsForm'

const DEFAULT_SETTINGS = {
  whatsapp_number: '5491100000000',
  whatsapp_message: 'Hola! Me interesa: ',
  store_name: 'Store RQTA',
  store_tagline: '',
  trade_in_enabled: true,
  show_usd_price: true,
  show_installments: true,
}

export default async function AdminSettingsPage() {
  await requireAdminSession()
  let settings = DEFAULT_SETTINGS
  try {
    settings = await getSiteSettings()
  } catch (err) {
    console.error('[Admin/configuracion] data fetch error:', err)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="admin-section-heading mb-3">Ajustes</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Configuración</h1>
        <p className="mt-1 text-sm text-[#666666]">Ajustes generales de la tienda</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
