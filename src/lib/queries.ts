import type {
  Product,
  ProductCard,
  InstallmentPlan,
  FinancingGroup,
  FinancingOption,
  DollarRate,
  ExchangeRate,
  TradeInValue,
  SiteSettings,
  Category,
} from '@/types'
import { getStorage } from './storage'
import { DEFAULT_DOLLAR_RATE, DEFAULT_SITE_SETTINGS, logDatabaseError } from './env'

async function withReadFallback<T>(context: string, fallback: T, query: () => Promise<T>): Promise<T> {
  try {
    return await query()
  } catch (error) {
    logDatabaseError(context, error)
    return fallback
  }
}

// ─── Productos ───────────────────────────────────────────────

export async function getProducts(category?: Category, label?: string): Promise<ProductCard[]> {
  return withReadFallback('getProducts', [], async () => (await getStorage()).getProducts(category, label))
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return withReadFallback('getFeaturedProducts', [], async () => (await getStorage()).getFeaturedProducts())
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return withReadFallback('getProductBySlug', null, async () => (await getStorage()).getProductBySlug(slug))
}

export async function getProductByIdAdmin(id: number): Promise<Product | null> {
  return withReadFallback('getProductByIdAdmin', null, async () => (await getStorage()).getProductById(id))
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  return withReadFallback('getAllProductsAdmin', [], async () => (await getStorage()).getAllProductsAdmin())
}

// ─── Configuración global ─────────────────────────────────────

export async function getDollarRate(): Promise<number> {
  return withReadFallback('getDollarRate', DEFAULT_DOLLAR_RATE, async () => (await getStorage()).getDollarRate())
}

export async function getDollarRateRecord(): Promise<DollarRate | null> {
  return withReadFallback('getDollarRateRecord', null, async () => (await getStorage()).getDollarRateRecord())
}

export async function getExchangeRate(): Promise<ExchangeRate | null> {
  return withReadFallback('getExchangeRate', null, async () => (await getStorage()).getExchangeRate())
}

export async function updateExchangeRateFromApi(apiValue: number, source: 'api_cron' | 'api_manual_refresh') {
  return (await getStorage()).updateExchangeRateFromApi(apiValue, source)
}

export async function updateExchangeRateMargin(adminMargin: number): Promise<ExchangeRate> {
  return (await getStorage()).updateExchangeRateMargin(adminMargin)
}

export async function recordExchangeRateError(errorMessage: string, source: 'api_cron' | 'api_manual_refresh'): Promise<void> {
  return (await getStorage()).recordExchangeRateError(errorMessage, source)
}

export async function getLatestExchangeRateError(): Promise<string | null> {
  return withReadFallback('getLatestExchangeRateError', null, async () => (await getStorage()).getLatestExchangeRateError())
}

export async function getInstallmentPlans(): Promise<InstallmentPlan[]> {
  return withReadFallback('getInstallmentPlans', [], async () => (await getStorage()).getInstallmentPlans())
}

export async function getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
  return withReadFallback('getAllInstallmentPlans', [], async () => (await getStorage()).getAllInstallmentPlans())
}

export async function getFinancingGroups(activeOnly = false): Promise<FinancingGroup[]> {
  return withReadFallback('getFinancingGroups', [], async () => (await getStorage()).getFinancingGroups(activeOnly))
}

export async function getFinancingOptions(groupId?: number, activeOnly = false): Promise<FinancingOption[]> {
  return withReadFallback('getFinancingOptions', [], async () => (await getStorage()).getFinancingOptions(groupId, activeOnly))
}

// ─── Plan Canje ───────────────────────────────────────────────

export async function getTradeInModels(): Promise<string[]> {
  return withReadFallback('getTradeInModels', [], async () => (await getStorage()).getTradeInModels())
}

export async function getTradeInCapacities(model: string): Promise<string[]> {
  return withReadFallback('getTradeInCapacities', [], async () => (await getStorage()).getTradeInCapacities(model))
}

export async function getTradeInEntry(
  model: string,
  capacity: string,
  batteryState: string,
): Promise<TradeInValue | null> {
  return withReadFallback('getTradeInEntry', null, async () => (await getStorage()).getTradeInEntry(model, capacity, batteryState))
}

export async function getAllTradeInValues(): Promise<TradeInValue[]> {
  return withReadFallback('getAllTradeInValues', [], async () => (await getStorage()).getAllTradeInValues())
}

export async function getTradeInCount(): Promise<number> {
  return withReadFallback('getTradeInCount', 0, async () => (await getStorage()).getTradeInCount())
}

export async function upsertManyTradeInValues(
  inputs: { model: string; capacity: string; battery_state: TradeInValue['battery_state']; value_usd: number; active?: boolean }[]
): Promise<TradeInValue[]> {
  return (await getStorage()).upsertManyTradeInValues(inputs)
}

export async function updateTradeInValueActive(id: number, active: boolean): Promise<TradeInValue | null> {
  return (await getStorage()).updateTradeInValueActive(id, active)
}

// ─── Site Settings ────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  return withReadFallback('getSiteSettings', DEFAULT_SITE_SETTINGS, async () => (await getStorage()).getSiteSettings())
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const storage = await getStorage()
  const booleanKeys = new Set<keyof SiteSettings>(['trade_in_enabled', 'show_usd_price', 'show_installments'])
  const normalized =
    booleanKeys.has(key as keyof SiteSettings)
      ? value === 'true'
      : value

  await storage.updateSiteSettings({ [key]: normalized } as Partial<SiteSettings>)
}
