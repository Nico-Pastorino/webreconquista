import type {
  InstallmentPlan,
  InstallmentOption,
  FinancingGroup,
  FinancingOption,
  ComputedInstallmentOption,
  ComputedFinancingGroup,
  TradeInValue,
  TradeInResult,
} from '@/types'

export function calcPriceARS(priceUsd: number, dollarRate: number): number {
  return Math.ceil(priceUsd * dollarRate)
}

// Cálculo flat (usado por ProductCard para la cuota destacada)
export function calcInstallments(
  priceUsd: number,
  dollarRate: number,
  plans: InstallmentPlan[],
): InstallmentOption[] {
  const baseARS = calcPriceARS(priceUsd, dollarRate)

  return plans
    .filter((p) => p.active)
    .sort((a, b) => a.months - b.months)
    .map((plan) => {
      const totalARS = Math.ceil(baseARS * (1 + plan.surcharge_pct / 100))
      const monthlyARS = Math.ceil(totalARS / plan.months)
      return {
        months: plan.months,
        label: plan.label ?? `${plan.months} cuotas`,
        monthly_ars: monthlyARS,
        total_ars: totalARS,
        surcharge_pct: plan.surcharge_pct,
      }
    })
}

// Cálculo agrupado (usado por la página de detalle del producto)
export function calcGroupedInstallments(
  priceUsd: number,
  dollarRate: number,
  groups: FinancingGroup[],
  options: FinancingOption[],
): ComputedFinancingGroup[] {
  const baseARS = calcPriceARS(priceUsd, dollarRate)

  return groups
    .filter((g) => g.active)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((group) => {
      const groupOptions: ComputedInstallmentOption[] = options
        .filter((o) => o.group_id === group.id && o.active)
        .sort((a, b) => a.sort_order - b.sort_order || a.installments - b.installments)
        .map((opt) => {
          const totalARS = Math.ceil(baseARS * (1 + opt.surcharge_pct / 100))
          const monthlyARS = Math.ceil(totalARS / opt.installments)
          return {
            id: opt.id,
            installments: opt.installments,
            label: opt.label ?? `${opt.installments} cuotas`,
            monthly_ars: monthlyARS,
            total_ars: totalARS,
            surcharge_pct: opt.surcharge_pct,
          }
        })
      return { id: group.id, name: group.name, options: groupOptions }
    })
    .filter((g) => g.options.length > 0)
}

// Retorna la mejor cuota para mostrar en cards:
// 1. Mayor cantidad de cuotas sin recargo
// 2. Mayor cantidad de cuotas en general
export function calcBestInstallment(options: InstallmentOption[]): InstallmentOption | null {
  if (!options.length) return null

  const noSurcharge = options.filter((o) => o.surcharge_pct === 0)
  if (noSurcharge.length > 0) {
    return noSurcharge.reduce((best, opt) => (opt.months > best.months ? opt : best))
  }

  return options.reduce((best, opt) => (opt.months > best.months ? opt : best))
}

export function calcTradeIn(
  productPriceUsd: number,
  dollarRate: number,
  tradeInEntry: TradeInValue,
): TradeInResult {
  const finalUsd = Math.max(0, productPriceUsd - tradeInEntry.value_usd)
  return {
    trade_in_value_usd: tradeInEntry.value_usd,
    trade_in_value_ars: calcPriceARS(tradeInEntry.value_usd, dollarRate),
    final_price_usd: finalUsd,
    final_price_ars: calcPriceARS(finalUsd, dollarRate),
  }
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return (
    'USD ' +
    new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount)
  )
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
