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
  created_at: string
}

export interface InstallmentPlan {
  id: number
  months: number
  surcharge_pct: number // 0 = sin recargo, 20 = 20%
  label: string | null  // ej: "3 cuotas sin interés"
  active: boolean
}

export interface DollarRate {
  id: number
  rate: number          // valor del dólar en ARS
  updated_at: string
}

export interface TradeInValue {
  id: number
  model: string         // ej: "iPhone 13"
  capacity: string      // ej: "128GB"
  battery_state: 'excelente' | 'bueno' | 'regular'
  value_usd: number
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

// --- Computed / presentation types ---

export interface ProductCard {
  id: number
  slug: string
  name: string
  category: Category
  price_usd: number
  image_url: string | null
  featured: boolean
}

export interface InstallmentOption {
  months: number
  label: string
  monthly_ars: number
  total_ars: number
}

export interface TradeInResult {
  trade_in_value_usd: number
  trade_in_value_ars: number
  final_price_usd: number
  final_price_ars: number
}
