import { promises as fs } from 'node:fs'
import path from 'node:path'
import type {
  Category,
  DollarRate,
  InstallmentPlan,
  Product,
  ProductCard,
  SiteSettings,
  TradeInValue,
} from '@/types'
import { slugify } from './calculations'
import { hasUsableDatabaseUrl } from './env'
import { getSql } from './db'

type ProductInput = {
  name: string
  category: Category
  price_usd: number
  image_url?: string | null
  featured?: boolean
  active?: boolean
  description?: string | null
  specs?: Record<string, string> | null
}

type ProductUpdateInput = ProductInput

type DemoStoreData = {
  counters: {
    product: number
    installment: number
    tradeIn: number
    dollar: number
  }
  products: Product[]
  installment_plans: InstallmentPlan[]
  dollar_rate: DollarRate
  trade_in_values: TradeInValue[]
  site_settings: SiteSettings
}

type InstallmentCreateInput = {
  months: number
  surcharge_pct: number
  label?: string | null
}

type InstallmentUpdateInput = {
  id: number
  months: number
  surcharge_pct: number
  label?: string | null
  active: boolean
}

type TradeInCreateInput = {
  model: string
  capacity: string
  battery_state: TradeInValue['battery_state']
  value_usd: number
}

type SiteSettingsUpdate = Partial<SiteSettings>

const DEMO_STORE_PATH = path.join(process.cwd(), 'database', 'demo-store.json')

function toProductCard(product: Product): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price_usd: Number(product.price_usd),
    image_url: product.image_url ?? null,
    featured: product.featured,
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price_usd: Number(product.price_usd),
    image_url: product.image_url ?? null,
    specs: product.specs ?? null,
  }
}

function normalizeProductPayload(input: ProductInput | ProductUpdateInput) {
  return {
    ...input,
    image_url: typeof input.image_url === 'string' && input.image_url.trim() ? input.image_url.trim() : null,
    featured: input.featured ?? false,
    active: input.active ?? true,
    description: input.description ?? null,
    specs: input.specs ?? null,
  }
}

async function readDemoStore(): Promise<DemoStoreData> {
  const raw = await fs.readFile(DEMO_STORE_PATH, 'utf8')
  return JSON.parse(raw) as DemoStoreData
}

async function writeDemoStore(store: DemoStoreData): Promise<void> {
  await fs.writeFile(DEMO_STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

const demoStorage = {
  async getProducts(category?: Category): Promise<ProductCard[]> {
    const store = await readDemoStore()
    return store.products
      .filter((product) => product.active && (!category || product.category === category))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(toProductCard)
  },

  async getFeaturedProducts(): Promise<ProductCard[]> {
    const store = await readDemoStore()
    return store.products
      .filter((product) => product.active && product.featured)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map(toProductCard)
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const store = await readDemoStore()
    const product = store.products.find((item) => item.slug === slug && item.active)
    return product ? normalizeProduct(product) : null
  },

  async getProductById(id: number): Promise<Product | null> {
    const store = await readDemoStore()
    const product = store.products.find((item) => item.id === id)
    return product ? normalizeProduct(product) : null
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    const store = await readDemoStore()
    return [...store.products]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(normalizeProduct)
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const store = await readDemoStore()
    const normalized = normalizeProductPayload(input)
    const id = store.counters.product + 1
    const baseSlug = slugify(normalized.name)
    let slug = baseSlug
    let suffix = 2
    while (store.products.some((product) => product.slug === slug)) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const product: Product = {
      id,
      slug,
      name: normalized.name,
      category: normalized.category,
      price_usd: Number(normalized.price_usd),
      image_url: normalized.image_url,
      featured: normalized.featured,
      active: normalized.active,
      description: normalized.description,
      specs: normalized.specs,
      created_at: new Date().toISOString(),
    }

    store.counters.product = id
    store.products.unshift(product)
    await writeDemoStore(store)
    return normalizeProduct(product)
  },

  async updateProduct(id: number, input: ProductUpdateInput): Promise<Product | null> {
    const store = await readDemoStore()
    const normalized = normalizeProductPayload(input)
    const index = store.products.findIndex((product) => product.id === id)
    if (index === -1) return null

    const current = store.products[index]
    const baseSlug = slugify(normalized.name)
    let slug = baseSlug
    let suffix = 2
    while (store.products.some((product) => product.id !== id && product.slug === slug)) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const updated: Product = {
      ...current,
      slug,
      name: normalized.name,
      category: normalized.category,
      price_usd: Number(normalized.price_usd),
      image_url: normalized.image_url,
      featured: normalized.featured,
      active: normalized.active,
      description: normalized.description,
      specs: normalized.specs,
    }

    store.products[index] = updated
    await writeDemoStore(store)
    return normalizeProduct(updated)
  },

  async deleteProduct(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const nextProducts = store.products.filter((product) => product.id !== id)
    if (nextProducts.length === store.products.length) return false
    store.products = nextProducts
    await writeDemoStore(store)
    return true
  },

  async getDollarRate(): Promise<number> {
    const store = await readDemoStore()
    return Number(store.dollar_rate.rate ?? 1200)
  },

  async getDollarRateRecord(): Promise<DollarRate | null> {
    const store = await readDemoStore()
    return {
      ...store.dollar_rate,
      rate: Number(store.dollar_rate.rate),
    }
  },

  async updateDollarRate(rate: number): Promise<DollarRate> {
    const store = await readDemoStore()
    const nextId = (store.dollar_rate?.id ?? store.counters.dollar) || 1
    const updated: DollarRate = {
      id: nextId,
      rate: Number(rate),
      updated_at: new Date().toISOString(),
    }
    store.counters.dollar = Math.max(store.counters.dollar, nextId)
    store.dollar_rate = updated
    await writeDemoStore(store)
    return updated
  },

  async getInstallmentPlans(activeOnly = true): Promise<InstallmentPlan[]> {
    const store = await readDemoStore()
    return store.installment_plans
      .filter((plan) => !activeOnly || plan.active)
      .sort((a, b) => a.months - b.months)
      .map((plan) => ({ ...plan, surcharge_pct: Number(plan.surcharge_pct) }))
  },

  async getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
    return demoStorage.getInstallmentPlans(false)
  },

  async createInstallmentPlan(input: InstallmentCreateInput): Promise<InstallmentPlan> {
    const store = await readDemoStore()
    const existingIndex = store.installment_plans.findIndex((plan) => plan.months === input.months)
    if (existingIndex >= 0) {
      const updated = {
        ...store.installment_plans[existingIndex],
        surcharge_pct: Number(input.surcharge_pct),
        label: input.label ?? null,
      }
      store.installment_plans[existingIndex] = updated
      await writeDemoStore(store)
      return updated
    }

    const id = store.counters.installment + 1
    const plan: InstallmentPlan = {
      id,
      months: input.months,
      surcharge_pct: Number(input.surcharge_pct),
      label: input.label ?? null,
      active: true,
    }
    store.counters.installment = id
    store.installment_plans.push(plan)
    await writeDemoStore(store)
    return plan
  },

  async updateInstallmentPlan(input: InstallmentUpdateInput): Promise<InstallmentPlan | null> {
    const store = await readDemoStore()
    const index = store.installment_plans.findIndex((plan) => plan.id === input.id)
    if (index === -1) return null
    const updated: InstallmentPlan = {
      id: input.id,
      months: input.months,
      surcharge_pct: Number(input.surcharge_pct),
      label: input.label ?? null,
      active: input.active,
    }
    store.installment_plans[index] = updated
    await writeDemoStore(store)
    return updated
  },

  async deleteInstallmentPlan(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const nextPlans = store.installment_plans.filter((plan) => plan.id !== id)
    if (nextPlans.length === store.installment_plans.length) return false
    store.installment_plans = nextPlans
    await writeDemoStore(store)
    return true
  },

  async getTradeInModels(): Promise<string[]> {
    const store = await readDemoStore()
    return [...new Set(store.trade_in_values.map((value) => value.model))].sort((a, b) => a.localeCompare(b))
  },

  async getTradeInCapacities(model: string): Promise<string[]> {
    const store = await readDemoStore()
    return [...new Set(store.trade_in_values.filter((value) => value.model === model).map((value) => value.capacity))].sort((a, b) => a.localeCompare(b))
  },

  async getTradeInEntry(model: string, capacity: string, batteryState: string): Promise<TradeInValue | null> {
    const store = await readDemoStore()
    return store.trade_in_values.find((value) => value.model === model && value.capacity === capacity && value.battery_state === batteryState) ?? null
  },

  async getAllTradeInValues(): Promise<TradeInValue[]> {
    const store = await readDemoStore()
    return [...store.trade_in_values].sort((a, b) =>
      a.model.localeCompare(b.model) ||
      a.capacity.localeCompare(b.capacity) ||
      a.battery_state.localeCompare(b.battery_state),
    )
  },

  async getTradeInCount(): Promise<number> {
    const store = await readDemoStore()
    return store.trade_in_values.length
  },

  async upsertTradeInValue(input: TradeInCreateInput): Promise<TradeInValue> {
    const store = await readDemoStore()
    const existingIndex = store.trade_in_values.findIndex(
      (value) =>
        value.model === input.model &&
        value.capacity === input.capacity &&
        value.battery_state === input.battery_state,
    )

    if (existingIndex >= 0) {
      const updated = {
        ...store.trade_in_values[existingIndex],
        value_usd: Number(input.value_usd),
      }
      store.trade_in_values[existingIndex] = updated
      await writeDemoStore(store)
      return updated
    }

    const id = store.counters.tradeIn + 1
    const value: TradeInValue = {
      id,
      model: input.model,
      capacity: input.capacity,
      battery_state: input.battery_state,
      value_usd: Number(input.value_usd),
    }
    store.counters.tradeIn = id
    store.trade_in_values.push(value)
    await writeDemoStore(store)
    return value
  },

  async deleteTradeInValue(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const nextValues = store.trade_in_values.filter((value) => value.id !== id)
    if (nextValues.length === store.trade_in_values.length) return false
    store.trade_in_values = nextValues
    await writeDemoStore(store)
    return true
  },

  async getSiteSettings(): Promise<SiteSettings> {
    const store = await readDemoStore()
    return {
      whatsapp_number: store.site_settings.whatsapp_number ?? '5491100000000',
      whatsapp_message: store.site_settings.whatsapp_message ?? 'Hola! Me interesa: ',
      store_name: store.site_settings.store_name ?? 'Store RQTA',
      store_tagline: store.site_settings.store_tagline ?? '',
      trade_in_enabled: store.site_settings.trade_in_enabled !== false,
      show_usd_price: store.site_settings.show_usd_price !== false,
      show_installments: store.site_settings.show_installments !== false,
    }
  },

  async updateSiteSettings(updates: SiteSettingsUpdate): Promise<SiteSettings> {
    const store = await readDemoStore()
    store.site_settings = {
      ...store.site_settings,
      ...updates,
    }
    await writeDemoStore(store)
    return store.site_settings
  },
}

const postgresStorage = {
  async getProducts(category?: Category): Promise<ProductCard[]> {
    const sql = getSql()
    const rows = category
      ? await sql<ProductCard[]>`
          SELECT id, slug, name, category, price_usd, image_url, featured
          FROM products
          WHERE active = TRUE AND category = ${category}
          ORDER BY featured DESC, created_at DESC
        `
      : await sql<ProductCard[]>`
          SELECT id, slug, name, category, price_usd, image_url, featured
          FROM products
          WHERE active = TRUE
          ORDER BY featured DESC, created_at DESC
        `
    return rows.map((row) => ({ ...row, price_usd: Number(row.price_usd) }))
  },

  async getFeaturedProducts(): Promise<ProductCard[]> {
    const sql = getSql()
    const rows = await sql<ProductCard[]>`
      SELECT id, slug, name, category, price_usd, image_url, featured
      FROM products
      WHERE active = TRUE AND featured = TRUE
      ORDER BY created_at DESC
      LIMIT 8
    `
    return rows.map((row) => ({ ...row, price_usd: Number(row.price_usd) }))
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const sql = getSql()
    const rows = await sql<Product[]>`SELECT * FROM products WHERE slug = ${slug} AND active = TRUE LIMIT 1`
    return rows[0] ? normalizeProduct(rows[0]) : null
  },

  async getProductById(id: number): Promise<Product | null> {
    const sql = getSql()
    const rows = await sql<Product[]>`SELECT * FROM products WHERE id = ${id} LIMIT 1`
    return rows[0] ? normalizeProduct(rows[0]) : null
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    const sql = getSql()
    const rows = await sql<Product[]>`SELECT * FROM products ORDER BY created_at DESC`
    return rows.map(normalizeProduct)
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const sql = getSql()
    const normalized = normalizeProductPayload(input)
    const slug = slugify(normalized.name)
    const rows = await sql<Product[]>`
      INSERT INTO products (slug, name, category, price_usd, image_url, featured, active, description, specs)
      VALUES (${slug}, ${normalized.name}, ${normalized.category}, ${normalized.price_usd}, ${normalized.image_url}, ${normalized.featured}, ${normalized.active}, ${normalized.description}, ${normalized.specs ? JSON.stringify(normalized.specs) : null})
      RETURNING *
    `
    return normalizeProduct(rows[0])
  },

  async updateProduct(id: number, input: ProductUpdateInput): Promise<Product | null> {
    const sql = getSql()
    const normalized = normalizeProductPayload(input)
    const rows = await sql<Product[]>`
      UPDATE products
      SET name = ${normalized.name}, category = ${normalized.category}, price_usd = ${normalized.price_usd},
          image_url = ${normalized.image_url}, featured = ${normalized.featured}, active = ${normalized.active},
          description = ${normalized.description}, specs = ${normalized.specs ? JSON.stringify(normalized.specs) : null}
      WHERE id = ${id}
      RETURNING *
    `
    return rows[0] ? normalizeProduct(rows[0]) : null
  },

  async deleteProduct(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM products WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  async getDollarRate(): Promise<number> {
    const sql = getSql()
    const rows = await sql<DollarRate[]>`SELECT rate FROM dollar_rate ORDER BY id DESC LIMIT 1`
    return Number(rows[0]?.rate ?? 1200)
  },

  async getDollarRateRecord(): Promise<DollarRate | null> {
    const sql = getSql()
    const rows = await sql<DollarRate[]>`SELECT * FROM dollar_rate ORDER BY id DESC LIMIT 1`
    return rows[0] ? { ...rows[0], rate: Number(rows[0].rate) } : null
  },

  async updateDollarRate(rate: number): Promise<DollarRate> {
    const sql = getSql()
    const rows = await sql<DollarRate[]>`
      UPDATE dollar_rate
      SET rate = ${rate}, updated_at = NOW()
      WHERE id = (SELECT id FROM dollar_rate ORDER BY id DESC LIMIT 1)
      RETURNING *
    `
    return { ...rows[0], rate: Number(rows[0].rate) }
  },

  async getInstallmentPlans(activeOnly = true): Promise<InstallmentPlan[]> {
    const sql = getSql()
    const rows = activeOnly
      ? await sql<InstallmentPlan[]>`SELECT * FROM installment_plans WHERE active = TRUE ORDER BY months ASC`
      : await sql<InstallmentPlan[]>`SELECT * FROM installment_plans ORDER BY months ASC`
    return rows.map((plan) => ({ ...plan, surcharge_pct: Number(plan.surcharge_pct) }))
  },

  async getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
    return postgresStorage.getInstallmentPlans(false)
  },

  async createInstallmentPlan(input: InstallmentCreateInput): Promise<InstallmentPlan> {
    const sql = getSql()
    const rows = await sql<InstallmentPlan[]>`
      INSERT INTO installment_plans (months, surcharge_pct, label)
      VALUES (${input.months}, ${input.surcharge_pct}, ${input.label ?? null})
      ON CONFLICT (months) DO UPDATE SET surcharge_pct = EXCLUDED.surcharge_pct, label = EXCLUDED.label
      RETURNING *
    `
    return { ...rows[0], surcharge_pct: Number(rows[0].surcharge_pct) }
  },

  async updateInstallmentPlan(input: InstallmentUpdateInput): Promise<InstallmentPlan | null> {
    const sql = getSql()
    const rows = await sql<InstallmentPlan[]>`
      UPDATE installment_plans
      SET months = ${input.months}, surcharge_pct = ${input.surcharge_pct}, label = ${input.label ?? null}, active = ${input.active}
      WHERE id = ${input.id}
      RETURNING *
    `
    return rows[0] ? { ...rows[0], surcharge_pct: Number(rows[0].surcharge_pct) } : null
  },

  async deleteInstallmentPlan(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM installment_plans WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  async getTradeInModels(): Promise<string[]> {
    const sql = getSql()
    const rows = await sql<{ model: string }[]>`SELECT DISTINCT model FROM trade_in_values ORDER BY model ASC`
    return rows.map((row) => row.model)
  },

  async getTradeInCapacities(model: string): Promise<string[]> {
    const sql = getSql()
    const rows = await sql<{ capacity: string }[]>`
      SELECT DISTINCT capacity FROM trade_in_values WHERE model = ${model} ORDER BY capacity ASC
    `
    return rows.map((row) => row.capacity)
  },

  async getTradeInEntry(model: string, capacity: string, batteryState: string): Promise<TradeInValue | null> {
    const sql = getSql()
    const rows = await sql<TradeInValue[]>`
      SELECT * FROM trade_in_values
      WHERE model = ${model} AND capacity = ${capacity} AND battery_state = ${batteryState}
      LIMIT 1
    `
    return rows[0] ?? null
  },

  async getAllTradeInValues(): Promise<TradeInValue[]> {
    const sql = getSql()
    return sql<TradeInValue[]>`SELECT * FROM trade_in_values ORDER BY model, capacity, battery_state`
  },

  async getTradeInCount(): Promise<number> {
    const sql = getSql()
    const rows = await sql<{ count: string }[]>`SELECT COUNT(*) FROM trade_in_values`
    return Number(rows[0]?.count ?? 0)
  },

  async upsertTradeInValue(input: TradeInCreateInput): Promise<TradeInValue> {
    const sql = getSql()
    const rows = await sql<TradeInValue[]>`
      INSERT INTO trade_in_values (model, capacity, battery_state, value_usd)
      VALUES (${input.model}, ${input.capacity}, ${input.battery_state}, ${input.value_usd})
      ON CONFLICT (model, capacity, battery_state) DO UPDATE SET value_usd = EXCLUDED.value_usd
      RETURNING *
    `
    return { ...rows[0], value_usd: Number(rows[0].value_usd) }
  },

  async deleteTradeInValue(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM trade_in_values WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  async getSiteSettings(): Promise<SiteSettings> {
    const sql = getSql()
    const rows = await sql<{ key: string; value: string }[]>`SELECT key, value FROM site_settings`
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]))
    return {
      whatsapp_number: map.whatsapp_number ?? '5491100000000',
      whatsapp_message: map.whatsapp_message ?? 'Hola! Me interesa: ',
      store_name: map.store_name ?? 'Store RQTA',
      store_tagline: map.store_tagline ?? '',
      trade_in_enabled: map.trade_in_enabled === 'true',
      show_usd_price: map.show_usd_price !== 'false',
      show_installments: map.show_installments !== 'false',
    }
  },

  async updateSiteSettings(updates: SiteSettingsUpdate): Promise<SiteSettings> {
    const sql = getSql()
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        sql`
          INSERT INTO site_settings (key, value) VALUES (${key}, ${String(value)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `,
      ),
    )
    return postgresStorage.getSiteSettings()
  },
}

type Storage = typeof demoStorage

export async function getStorage(): Promise<Storage> {
  return hasUsableDatabaseUrl() ? postgresStorage : demoStorage
}
