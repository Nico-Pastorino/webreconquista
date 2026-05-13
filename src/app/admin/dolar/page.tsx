export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getExchangeRate, getLatestExchangeRateError } from '@/lib/queries'
import DollarEditor from '@/components/admin/DollarEditor'

export default async function AdminDollarPage() {
  await requireAdminSession()
  const [current, latestError] = await Promise.all([
    getExchangeRate(),
    getLatestExchangeRateError(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="admin-section-heading mb-3">Cotización</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Valor del Dólar</h1>
        <p className="mt-1 text-sm text-[#666666]">
          Este valor se usa para convertir todos los precios de USD a ARS automáticamente.
          Última actualización: {current ? new Date(current.updated_at).toLocaleString('es-AR') : 'nunca'}
        </p>
      </div>
      <DollarEditor currentRate={current} latestError={latestError} />
    </div>
  )
}
