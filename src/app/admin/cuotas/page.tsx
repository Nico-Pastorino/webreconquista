export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getFinancingGroups, getFinancingOptions } from '@/lib/queries'
import InstallmentsManager from '@/components/admin/InstallmentsManager'

export default async function AdminInstallmentsPage() {
  await requireAdminSession()
  const [groups, options] = await Promise.all([
    getFinancingGroups(),
    getFinancingOptions(),
  ])
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8">
        <p className="admin-section-heading mb-3">Financiación</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Planes de cuotas</h1>
        <p className="mt-1 text-sm text-[#666666]">
          Creá grupos por banco o tarjeta y configurá las cuotas dentro de cada uno.
        </p>
      </div>
      <InstallmentsManager initialGroups={groups} initialOptions={options} />
    </div>
  )
}
