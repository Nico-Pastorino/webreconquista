import type { InstallmentPlan, InstallmentOption, TradeInValue, TradeInResult } from '@/types'

export function calcPriceARS(priceUsd: number, dollarRate: number): number {
  return Math.ceil(priceUsd * dollarRate)
}

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
      }
    })
}

export function calcBestInstallment(options: InstallmentOption[]): InstallmentOption | null {
  // Retorna la opción con más cuotas (la más destacada para mostrar en cards)
  if (!options.length) return null
  return options[options.length - 1]
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
