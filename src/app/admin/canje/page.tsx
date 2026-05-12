export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getAllTradeInValues } from '@/lib/queries'
import TradeInManager from '@/components/admin/TradeInManager'

export default async function AdminTradeInPage() {
  await requireAdminSession()
  let values: import('@/types').TradeInValue[] = []
  try {
    values = await getAllTradeInValues()
  } catch (err) {
    console.error('[Admin/canje] data fetch error:', err)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-section-heading mb-2">Plan Canje</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Plan Canje</h1>
          <p className="mt-1 text-sm text-[#666666]">
            Administrá los valores de equipos usados. Editá precios en línea y guardá en bloque.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-medium text-[#666]">
            {values.length} entradas
          </span>
          <span className="rounded-full bg-[#f5f5f7] px-4 py-1.5 text-xs font-medium text-[#666]">
            {new Set(values.map((v) => v.model)).size} modelos
          </span>
        </div>
      </div>
      <TradeInManager initialValues={values} />
    </div>
  )
}
