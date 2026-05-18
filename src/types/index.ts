export type Category =
  | 'iphone'
  | 'ipad'
  | 'mac'
  | 'watch'
  | 'airpods'
  | 'accesorios'

export interface Product {
  id: number
  slug: string
  name: string
  category: Category
  price_usd: number
  image_url: string | null
  featured: boolean
  active: boolean
  description: string | null
  specs: Record<string, string> | null
  /** 'Sellado Nuevo' | 'Seminuevo' | null */
  product_label: string | null
  created_at: string
}

// InstallmentPlan: usado internamente para backward-compat con ProductCard y catálogos
export interface InstallmentPlan {
  id: number
  months: number
  surcharge_pct: number
  label: string | null
  active: boolean
}

export interface DollarRate {
  id: number
  rate: number
  updated_at: string
}

export type ExchangeRateSource =
  | 'api_cron'
  | 'api_manual_refresh'
  | 'admin_margin_update'
  | 'legacy_fallback'
  | 'seed'

export interface ExchangeRate {
  id: number
  api_value: number
  admin_margin: number
  final_value: number
  source: ExchangeRateSource
  last_api_update: string | null
  last_manual_update: string | null
  updated_at: string
}

export interface ExchangeRateHistory {
  id: number
  api_value: number | null
  admin_margin: number | null
  final_value: number | null
  source: ExchangeRateSource
  error_message: string | null
  created_at: string
}

export interface TradeInValue {
  id: number
  model: string
  capacity: string
  /** '100-90' = 100% a 90% | '89-70' = 89% a 70% | 'MENOS-70' = Menos de 70% */
  battery_state: '100-90' | '89-70' | 'MENOS-70'
  value_usd: number
  active: boolean
}

export interface SiteSettings {
  whatsapp_number: string
  whatsapp_message: string
  store_name: string
  store_tagline: string
  trade_in_enabled: boolean
  show_usd_price: boolean
  show_installments: boolean
}

// --- Nuevo modelo de planes de financiación agrupados ---

export interface FinancingGroup {
  id: number
  name: string
  active: boolean
  sort_order: number
}

export interface FinancingOption {
  id: number
  group_id: number
  installments: number
  surcharge_pct: number
  label: string | null
  active: boolean
  sort_order: number
}

// --- Computed / presentation types ---

export interface ProductCard {
  id: number
  slug: string
  name: string
  category: Category
  price_usd: number
  image_url: string | null
  featured: boolean
  product_label: string | null
}

export interface InstallmentOption {
  months: number
  label: string
  monthly_ars: number
  total_ars: number
  surcharge_pct: number
}

export interface ComputedInstallmentOption {
  id: number
  installments: number
  label: string
  monthly_ars: number
  total_ars: number
  surcharge_pct: number
}

export interface ComputedFinancingGroup {
  id: number
  name: string
  options: ComputedInstallmentOption[]
}

export interface TradeInResult {
  trade_in_value_usd: number
  trade_in_value_ars: number
  final_price_usd: number
  final_price_ars: number
}

export interface UploadedImage {
  id: number
  filename: string
  thumbnail_url: string
  medium_url: string
  created_at: string
}
