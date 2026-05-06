import type { ComputedFinancingGroup } from '@/types'
import { formatARS } from '@/lib/calculations'

interface Props {
  groups: ComputedFinancingGroup[]
}

export default function InstallmentsTable({ groups }: Props) {
  if (!groups.length) return null

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">
        Planes de pago
      </p>

      {groups.map((group) => (
        <div key={group.id} className="overflow-hidden rounded-[30px] bg-[#f8f8f9]">
          <div className="px-6 py-4 border-b border-black/6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#111111]">
              {group.name}
            </p>
          </div>
          <div className="divide-y divide-black/6">
            {group.options.map((opt) => {
              const sinInteres = opt.surcharge_pct === 0
              const showTotal = opt.installments > 1 && opt.surcharge_pct > 0

              return (
                <div key={opt.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{opt.label}</p>
                    {sinInteres && opt.installments > 1 && (
                      <p className="text-xs text-[#22c55e] font-medium">Sin interés</p>
                    )}
                    {showTotal && (
                      <p className="text-xs text-[#6B7280]">Total: {formatARS(opt.total_ars)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {opt.installments === 1 ? (
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">
                        {formatARS(opt.total_ars)}
                      </p>
                    ) : (
                      <>
                        <p className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">
                          {formatARS(opt.monthly_ars)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B7280]">por mes</p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
