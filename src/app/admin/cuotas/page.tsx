export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getAllInstallmentPlans } from '@/lib/queries'
import InstallmentsManager from '@/components/admin/InstallmentsManager'

export default async function AdminInstallmentsPage() {
  await requireAdminSession()
  const plans = await getAllInstallmentPlans()
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8">
        <p className="admin-section-heading mb-3">Financiación</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Planes de cuotas</h1>
        <p className="mt-1 text-sm text-[#666666]">Configurá los planes de financiación disponibles</p>
      </div>
      <InstallmentsManager initialPlans={plans} />
    </div>
  )
}
