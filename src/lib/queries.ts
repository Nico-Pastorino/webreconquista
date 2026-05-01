import type {
  Product,
  ProductCard,
  InstallmentPlan,
  DollarRate,
  TradeInValue,
  SiteSettings,
  Category,
} from '@/types'
import { getStorage } from './storage'

// ─── Productos ───────────────────────────────────────────────

export async function getProducts(category?: Category): Promise<ProductCard[]> {
  return (await getStorage()).getProducts(category)
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return (await getStorage()).getFeaturedProducts()
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getStorage()).getProductBySlug(slug)
}

export async function getProductByIdAdmin(id: number): Promise<Product | null> {
  return (await getStorage()).getProductById(id)
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  return (await getStorage()).getAllProductsAdmin()
}

// ─── Configuración global ─────────────────────────────────────

export async function getDollarRate(): Promise<number> {
  return (await getStorage()).getDollarRate()
}

export async function getDollarRateRecord(): Promise<DollarRate | null> {
  return (await getStorage()).getDollarRateRecord()
}

export async function getInstallmentPlans(): Promise<InstallmentPlan[]> {
  return (await getStorage()).getInstallmentPlans()
}

export async function getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
  return (await getStorage()).getAllInstallmentPlans()
}

// ─── Plan Canje ───────────────────────────────────────────────

export async function getTradeInModels(): Promise<string[]> {
  return (await getStorage()).getTradeInModels()
}

export async function getTradeInCapacities(model: string): Promise<string[]> {
  return (await getStorage()).getTradeInCapacities(model)
}

export async function getTradeInEntry(
  model: string,
  capacity: string,
  batteryState: string,
): Promise<TradeInValue | null> {
  return (await getStorage()).getTradeInEntry(model, capacity, batteryState)
}

export async function getAllTradeInValues(): Promise<TradeInValue[]> {
  return (await getStorage()).getAllTradeInValues()
}

export async function getTradeInCount(): Promise<number> {
  return (await getStorage()).getTradeInCount()
}

// ─── Site Settings ────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await getStorage()).getSiteSettings()
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
