import type { InstallmentOption } from '@/types'
import { formatARS } from '@/lib/calculations'

interface Props {
  options: InstallmentOption[]
}

export default function InstallmentsTable({ options }: Props) {
  if (!options.length) return null

  return (
    <div className="overflow-hidden rounded-[30px] bg-[#f8f8f9]">
      <div className="px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">
          Planes de pago
        </p>
      </div>
      <div className="divide-y divide-black/6">
        {options.map((opt) => (
          <div key={opt.months} className="flex items-center justify-between px-6 py-4.5">
            <div>
              <p className="text-sm font-medium text-[#111111]">{opt.label}</p>
              <p className="text-xs text-[#6B7280]">Total: {formatARS(opt.total_ars)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">{formatARS(opt.monthly_ars)}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6B7280]">por mes</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
