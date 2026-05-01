export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getAllTradeInValues } from '@/lib/queries'
import TradeInManager from '@/components/admin/TradeInManager'

export default async function AdminTradeInPage() {
  await requireAdminSession()
  const values = await getAllTradeInValues()

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="admin-section-heading mb-3">Plan Canje</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Plan Canje</h1>
        <p className="mt-1 text-sm text-[#666666]">
          Configurá los valores de iPhone usados para el plan canje
        </p>
      </div>
      <TradeInManager initialValues={values} />
    </div>
  )
}
