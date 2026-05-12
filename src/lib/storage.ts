import { promises as fs } from 'node:fs'
import path from 'node:path'
import type {
  Category,
  DollarRate,
  FinancingGroup,
  FinancingOption,
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
  product_label?: string | null
}

type ProductUpdateInput = ProductInput

type DemoStoreData = {
  counters: {
    product: number
    installment: number
    tradeIn: number
    dollar: number
    financingGroup: number
    financingOption: number
  }
  products: Product[]
  installment_plans: InstallmentPlan[]
  dollar_rate: DollarRate
  trade_in_values: TradeInValue[]
  site_settings: SiteSettings
  financing_groups: FinancingGroup[]
  financing_options: FinancingOption[]
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

type FinancingGroupCreateInput = {
  name: string
  sort_order?: number
}

type FinancingGroupUpdateInput = {
  id: number
  name: string
  active: boolean
  sort_order: number
}

type FinancingOptionCreateInput = {
  group_id: number
  installments: number
  surcharge_pct: number
  label?: string | null
  sort_order?: number
}

type FinancingOptionUpdateInput = {
  id: number
  group_id: number
  installments: number
  surcharge_pct: number
  label?: string | null
  active: boolean
  sort_order: number
}

type TradeInCreateInput = {
  model: string
  capacity: string
  battery_state: TradeInValue['battery_state']
  value_usd: number
  active?: boolean
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
    product_label: product.product_label ?? null,
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price_usd: Number(product.price_usd),
    image_url: product.image_url ?? null,
    specs: product.specs ?? null,
    product_label: product.product_label ?? null,
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
    product_label: input.product_label ?? null,
  }
}

async function readDemoStore(): Promise<DemoStoreData> {
  const raw = await fs.readFile(DEMO_STORE_PATH, 'utf8')
  const data = JSON.parse(raw) as DemoStoreData
  // Garantizar arrays aunque el JSON sea viejo
  data.financing_groups = data.financing_groups ?? []
  data.financing_options = data.financing_options ?? []
  data.counters.financingGroup = data.counters.financingGroup ?? data.financing_groups.length
  data.counters.financingOption = data.counters.financingOption ?? data.financing_options.length
  return data
}

async function writeDemoStore(store: DemoStoreData): Promise<void> {
  // Guard: never attempt to write files in production (Vercel filesystem is read-only).
  // If this is reached in production, it means DATABASE_URL is not configured.
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL no está configurada en Vercel. ' +
      'Ir a: Vercel → Project → Settings → Environment Variables → agregar DATABASE_URL con la cadena de conexión de Supabase (Transaction Pooler, puerto 6543).'
    )
  }
  await fs.writeFile(DEMO_STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

const demoStorage = {
  async getProducts(category?: Category, label?: string): Promise<ProductCard[]> {
    const store = await readDemoStore()
    return store.products
      .filter((product) =>
        product.active &&
        (!category || product.category === category) &&
        (!label || product.product_label === label)
      )
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
      product_label: normalized.product_label,
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
      product_label: normalized.product_label,
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

  // getInstallmentPlans: retorna opciones activas de financing_options mapeadas
  // a InstallmentPlan para backward-compat con ProductCard y catálogos
  async getInstallmentPlans(): Promise<InstallmentPlan[]> {
    const store = await readDemoStore()
    const activeGroups = new Set(store.financing_groups.filter((g) => g.active).map((g) => g.id))
    return store.financing_options
      .filter((o) => o.active && activeGroups.has(o.group_id))
      .sort((a, b) => a.installments - b.installments)
      .map((o) => ({
        id: o.id,
        months: o.installments,
        surcharge_pct: Number(o.surcharge_pct),
        label: o.label,
        active: o.active,
      }))
  },

  async getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
    const store = await readDemoStore()
    return store.financing_options
      .sort((a, b) => a.installments - b.installments)
      .map((o) => ({
        id: o.id,
        months: o.installments,
        surcharge_pct: Number(o.surcharge_pct),
        label: o.label,
        active: o.active,
      }))
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

  // ─── Financing Groups ─────────────────────────────────────────

  async getFinancingGroups(activeOnly = false): Promise<FinancingGroup[]> {
    const store = await readDemoStore()
    return store.financing_groups
      .filter((g) => !activeOnly || g.active)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  },

  async createFinancingGroup(input: FinancingGroupCreateInput): Promise<FinancingGroup> {
    const store = await readDemoStore()
    const id = (store.counters.financingGroup ?? 0) + 1
    const maxOrder = store.financing_groups.reduce((m, g) => Math.max(m, g.sort_order), 0)
    const group: FinancingGroup = {
      id,
      name: input.name,
      active: true,
      sort_order: input.sort_order ?? maxOrder + 1,
    }
    store.counters.financingGroup = id
    store.financing_groups.push(group)
    await writeDemoStore(store)
    return group
  },

  async updateFinancingGroup(input: FinancingGroupUpdateInput): Promise<FinancingGroup | null> {
    const store = await readDemoStore()
    const index = store.financing_groups.findIndex((g) => g.id === input.id)
    if (index === -1) return null
    const updated: FinancingGroup = { id: input.id, name: input.name, active: input.active, sort_order: input.sort_order }
    store.financing_groups[index] = updated
    await writeDemoStore(store)
    return updated
  },

  async deleteFinancingGroup(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const next = store.financing_groups.filter((g) => g.id !== id)
    if (next.length === store.financing_groups.length) return false
    store.financing_groups = next
    store.financing_options = store.financing_options.filter((o) => o.group_id !== id)
    await writeDemoStore(store)
    return true
  },

  // ─── Financing Options ────────────────────────────────────────

  async getFinancingOptions(groupId?: number, activeOnly = false): Promise<FinancingOption[]> {
    const store = await readDemoStore()
    return store.financing_options
      .filter((o) => (!groupId || o.group_id === groupId) && (!activeOnly || o.active))
      .sort((a, b) => a.sort_order - b.sort_order || a.installments - b.installments)
      .map((o) => ({ ...o, surcharge_pct: Number(o.surcharge_pct) }))
  },

  async createFinancingOption(input: FinancingOptionCreateInput): Promise<FinancingOption> {
    const store = await readDemoStore()
    const id = (store.counters.financingOption ?? 0) + 1
    const groupOptions = store.financing_options.filter((o) => o.group_id === input.group_id)
    const maxOrder = groupOptions.reduce((m, o) => Math.max(m, o.sort_order), 0)
    const option: FinancingOption = {
      id,
      group_id: input.group_id,
      installments: input.installments,
      surcharge_pct: Number(input.surcharge_pct),
      label: input.label ?? null,
      active: true,
      sort_order: input.sort_order ?? maxOrder + 1,
    }
    store.counters.financingOption = id
    store.financing_options.push(option)
    await writeDemoStore(store)
    return option
  },

  async updateFinancingOption(input: FinancingOptionUpdateInput): Promise<FinancingOption | null> {
    const store = await readDemoStore()
    const index = store.financing_options.findIndex((o) => o.id === input.id)
    if (index === -1) return null
    const updated: FinancingOption = {
      id: input.id,
      group_id: input.group_id,
      installments: input.installments,
      surcharge_pct: Number(input.surcharge_pct),
      label: input.label ?? null,
      active: input.active,
      sort_order: input.sort_order,
    }
    store.financing_options[index] = updated
    await writeDemoStore(store)
    return updated
  },

  async deleteFinancingOption(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const next = store.financing_options.filter((o) => o.id !== id)
    if (next.length === store.financing_options.length) return false
    store.financing_options = next
    await writeDemoStore(store)
    return true
  },

  // ─── Trade-In ─────────────────────────────────────────────────

  async getTradeInModels(): Promise<string[]> {
    const store = await readDemoStore()
    const cap: (v: TradeInValue) => boolean = (v) => v.active !== false
    return [...new Set(store.trade_in_values.filter(cap).map((v) => v.model))].sort((a, b) => a.localeCompare(b))
  },

  async getTradeInCapacities(model: string): Promise<string[]> {
    const store = await readDemoStore()
    return [...new Set(
      store.trade_in_values
        .filter((v) => v.model === model && v.active !== false)
        .map((v) => v.capacity)
    )].sort((a, b) => a.localeCompare(b))
  },

  async getTradeInEntry(model: string, capacity: string, batteryState: string): Promise<TradeInValue | null> {
    const store = await readDemoStore()
    return store.trade_in_values.find(
      (v) => v.model === model && v.capacity === capacity && v.battery_state === batteryState && v.active !== false
    ) ?? null
  },

  async getAllTradeInValues(): Promise<TradeInValue[]> {
    const store = await readDemoStore()
    return [...store.trade_in_values]
      .map((v) => ({ ...v, active: v.active !== false }))
      .sort((a, b) =>
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
      (v) => v.model === input.model && v.capacity === input.capacity && v.battery_state === input.battery_state,
    )

    if (existingIndex >= 0) {
      const updated: TradeInValue = {
        ...store.trade_in_values[existingIndex],
        value_usd: Number(input.value_usd),
        active: input.active !== undefined ? input.active : (store.trade_in_values[existingIndex].active !== false),
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
      active: input.active !== false,
    }
    store.counters.tradeIn = id
    store.trade_in_values.push(value)
    await writeDemoStore(store)
    return value
  },

  async upsertManyTradeInValues(inputs: TradeInCreateInput[]): Promise<TradeInValue[]> {
    const store = await readDemoStore()
    const results: TradeInValue[] = []
    for (const input of inputs) {
      const idx = store.trade_in_values.findIndex(
        (v) => v.model === input.model && v.capacity === input.capacity && v.battery_state === input.battery_state,
      )
      if (idx >= 0) {
        const updated: TradeInValue = { ...store.trade_in_values[idx], value_usd: Number(input.value_usd), active: input.active !== false }
        store.trade_in_values[idx] = updated
        results.push(updated)
      } else {
        const id = store.counters.tradeIn + 1
        const value: TradeInValue = {
          id, model: input.model, capacity: input.capacity, battery_state: input.battery_state,
          value_usd: Number(input.value_usd), active: input.active !== false,
        }
        store.counters.tradeIn = id
        store.trade_in_values.push(value)
        results.push(value)
      }
    }
    await writeDemoStore(store)
    return results
  },

  async updateTradeInValueActive(id: number, active: boolean): Promise<TradeInValue | null> {
    const store = await readDemoStore()
    const idx = store.trade_in_values.findIndex((v) => v.id === id)
    if (idx === -1) return null
    store.trade_in_values[idx] = { ...store.trade_in_values[idx], active }
    await writeDemoStore(store)
    return { ...store.trade_in_values[idx] }
  },

  async deleteTradeInValue(id: number): Promise<boolean> {
    const store = await readDemoStore()
    const nextValues = store.trade_in_values.filter((v) => v.id !== id)
    if (nextValues.length === store.trade_in_values.length) return false
    store.trade_in_values = nextValues
    await writeDemoStore(store)
    return true
  },

  // ─── Site Settings ────────────────────────────────────────────

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
  async getProducts(category?: Category, label?: string): Promise<ProductCard[]> {
    const sql = getSql()
    try {
      let rows: ProductCard[]
      if (category && label) {
        rows = await sql<ProductCard[]>`
          SELECT id, slug, name, category, price_usd, image_url, featured, product_label
          FROM products
          WHERE active = TRUE AND category = ${category} AND product_label = ${label}
          ORDER BY featured DESC, created_at DESC
        `
      } else if (category) {
        rows = await sql<ProductCard[]>`
          SELECT id, slug, name, category, price_usd, image_url, featured, product_label
          FROM products WHERE active = TRUE AND category = ${category}
          ORDER BY featured DESC, created_at DESC
        `
      } else {
        rows = await sql<ProductCard[]>`
          SELECT id, slug, name, category, price_usd, image_url, featured, product_label
          FROM products WHERE active = TRUE ORDER BY featured DESC, created_at DESC
        `
      }
      return rows.map((row) => ({ ...row, price_usd: Number(row.price_usd), product_label: row.product_label ?? null }))
    } catch (err: unknown) {
      // Fallback: if product_label column doesn't exist (old schema), query without it
      const pgErr = err as { code?: string }
      if (pgErr?.code === '42703') {
        console.warn('[Storage] product_label column missing — run migration-002. Falling back.')
        const rows = category
          ? await sql<ProductCard[]>`SELECT id,slug,name,category,price_usd,image_url,featured FROM products WHERE active=TRUE AND category=${category} ORDER BY featured DESC,created_at DESC`
          : await sql<ProductCard[]>`SELECT id,slug,name,category,price_usd,image_url,featured FROM products WHERE active=TRUE ORDER BY featured DESC,created_at DESC`
        return rows.map((r) => ({ ...r, price_usd: Number(r.price_usd), product_label: null }))
      }
      throw err
    }
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
    return rows.map((row) => ({ ...row, price_usd: Number(row.price_usd), product_label: null }))
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
      INSERT INTO products (slug, name, category, price_usd, image_url, featured, active, description, specs, product_label)
      VALUES (${slug}, ${normalized.name}, ${normalized.category}, ${normalized.price_usd}, ${normalized.image_url}, ${normalized.featured}, ${normalized.active}, ${normalized.description}, ${normalized.specs ? JSON.stringify(normalized.specs) : null}, ${normalized.product_label})
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
          description = ${normalized.description}, specs = ${normalized.specs ? JSON.stringify(normalized.specs) : null},
          product_label = ${normalized.product_label}
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

  // getInstallmentPlans: retorna opciones activas mapeadas a InstallmentPlan
  async getInstallmentPlans(): Promise<InstallmentPlan[]> {
    const sql = getSql()
    const rows = await sql<FinancingOption[]>`
      SELECT fo.* FROM financing_options fo
      JOIN financing_groups fg ON fg.id = fo.group_id
      WHERE fo.active = TRUE AND fg.active = TRUE
      ORDER BY fo.installments ASC
    `
    return rows.map((o) => ({
      id: o.id,
      months: o.installments,
      surcharge_pct: Number(o.surcharge_pct),
      label: o.label,
      active: o.active,
    }))
  },

  async getAllInstallmentPlans(): Promise<InstallmentPlan[]> {
    const sql = getSql()
    const rows = await sql<FinancingOption[]>`SELECT * FROM financing_options ORDER BY installments ASC`
    return rows.map((o) => ({
      id: o.id,
      months: o.installments,
      surcharge_pct: Number(o.surcharge_pct),
      label: o.label,
      active: o.active,
    }))
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

  // ─── Financing Groups (postgres) ──────────────────────────────

  async getFinancingGroups(activeOnly = false): Promise<FinancingGroup[]> {
    const sql = getSql()
    const rows = activeOnly
      ? await sql<FinancingGroup[]>`SELECT * FROM financing_groups WHERE active = TRUE ORDER BY sort_order ASC, id ASC`
      : await sql<FinancingGroup[]>`SELECT * FROM financing_groups ORDER BY sort_order ASC, id ASC`
    return rows
  },

  async createFinancingGroup(input: FinancingGroupCreateInput): Promise<FinancingGroup> {
    const sql = getSql()
    const rows = await sql<FinancingGroup[]>`
      INSERT INTO financing_groups (name, active, sort_order)
      VALUES (${input.name}, TRUE, COALESCE(${input.sort_order ?? null}, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM financing_groups)))
      RETURNING *
    `
    return rows[0]
  },

  async updateFinancingGroup(input: FinancingGroupUpdateInput): Promise<FinancingGroup | null> {
    const sql = getSql()
    const rows = await sql<FinancingGroup[]>`
      UPDATE financing_groups SET name = ${input.name}, active = ${input.active}, sort_order = ${input.sort_order}
      WHERE id = ${input.id} RETURNING *
    `
    return rows[0] ?? null
  },

  async deleteFinancingGroup(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM financing_groups WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  // ─── Financing Options (postgres) ─────────────────────────────

  async getFinancingOptions(groupId?: number, activeOnly = false): Promise<FinancingOption[]> {
    const sql = getSql()
    const rows = groupId
      ? activeOnly
        ? await sql<FinancingOption[]>`SELECT * FROM financing_options WHERE group_id = ${groupId} AND active = TRUE ORDER BY sort_order ASC, installments ASC`
        : await sql<FinancingOption[]>`SELECT * FROM financing_options WHERE group_id = ${groupId} ORDER BY sort_order ASC, installments ASC`
      : activeOnly
        ? await sql<FinancingOption[]>`SELECT * FROM financing_options WHERE active = TRUE ORDER BY sort_order ASC, installments ASC`
        : await sql<FinancingOption[]>`SELECT * FROM financing_options ORDER BY sort_order ASC, installments ASC`
    return rows.map((o) => ({ ...o, surcharge_pct: Number(o.surcharge_pct) }))
  },

  async createFinancingOption(input: FinancingOptionCreateInput): Promise<FinancingOption> {
    const sql = getSql()
    const rows = await sql<FinancingOption[]>`
      INSERT INTO financing_options (group_id, installments, surcharge_pct, label, active, sort_order)
      VALUES (
        ${input.group_id}, ${input.installments}, ${input.surcharge_pct}, ${input.label ?? null}, TRUE,
        COALESCE(${input.sort_order ?? null}, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM financing_options WHERE group_id = ${input.group_id}))
      )
      RETURNING *
    `
    return { ...rows[0], surcharge_pct: Number(rows[0].surcharge_pct) }
  },

  async updateFinancingOption(input: FinancingOptionUpdateInput): Promise<FinancingOption | null> {
    const sql = getSql()
    const rows = await sql<FinancingOption[]>`
      UPDATE financing_options
      SET group_id = ${input.group_id}, installments = ${input.installments}, surcharge_pct = ${input.surcharge_pct},
          label = ${input.label ?? null}, active = ${input.active}, sort_order = ${input.sort_order}
      WHERE id = ${input.id} RETURNING *
    `
    return rows[0] ? { ...rows[0], surcharge_pct: Number(rows[0].surcharge_pct) } : null
  },

  async deleteFinancingOption(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM financing_options WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  // ─── Trade-In (postgres) ──────────────────────────────────────

  async getTradeInModels(): Promise<string[]> {
    const sql = getSql()
    // Filter active=TRUE only if column exists (new schema); fall back to all rows
    try {
      const rows = await sql<{ model: string }[]>`SELECT DISTINCT model FROM trade_in_values WHERE active = TRUE ORDER BY model ASC`
      return rows.map((r) => r.model)
    } catch {
      const rows = await sql<{ model: string }[]>`SELECT DISTINCT model FROM trade_in_values ORDER BY model ASC`
      return rows.map((r) => r.model)
    }
  },

  async getTradeInCapacities(model: string): Promise<string[]> {
    const sql = getSql()
    try {
      const rows = await sql<{ capacity: string }[]>`
        SELECT DISTINCT capacity FROM trade_in_values WHERE model = ${model} AND active = TRUE ORDER BY capacity ASC
      `
      return rows.map((r) => r.capacity)
    } catch {
      const rows = await sql<{ capacity: string }[]>`
        SELECT DISTINCT capacity FROM trade_in_values WHERE model = ${model} ORDER BY capacity ASC
      `
      return rows.map((r) => r.capacity)
    }
  },

  async getTradeInEntry(model: string, capacity: string, batteryState: string): Promise<TradeInValue | null> {
    const sql = getSql()
    try {
      const rows = await sql<TradeInValue[]>`
        SELECT * FROM trade_in_values
        WHERE model = ${model} AND capacity = ${capacity} AND battery_state = ${batteryState} AND active = TRUE
        LIMIT 1
      `
      return rows[0] ? { ...rows[0], value_usd: Number(rows[0].value_usd) } : null
    } catch {
      const rows = await sql<TradeInValue[]>`
        SELECT * FROM trade_in_values
        WHERE model = ${model} AND capacity = ${capacity} AND battery_state = ${batteryState}
        LIMIT 1
      `
      return rows[0] ? { ...rows[0], value_usd: Number(rows[0].value_usd), active: true } : null
    }
  },

  async getAllTradeInValues(): Promise<TradeInValue[]> {
    const sql = getSql()
    const rows = await sql<TradeInValue[]>`SELECT * FROM trade_in_values ORDER BY model, capacity, battery_state`
    return rows.map((r) => ({ ...r, value_usd: Number(r.value_usd) }))
  },

  async getTradeInCount(): Promise<number> {
    const sql = getSql()
    const rows = await sql<{ count: string }[]>`SELECT COUNT(*) FROM trade_in_values`
    return Number(rows[0]?.count ?? 0)
  },

  async upsertTradeInValue(input: TradeInCreateInput): Promise<TradeInValue> {
    const sql = getSql()
    // Base insert compatible with both old schema (no active/timestamps) and new schema.
    // active defaults to TRUE via column default — no explicit insert needed.
    const rows = await sql<TradeInValue[]>`
      INSERT INTO trade_in_values (model, capacity, battery_state, value_usd)
      VALUES (${input.model}, ${input.capacity}, ${input.battery_state}, ${input.value_usd})
      ON CONFLICT (model, capacity, battery_state) DO UPDATE
        SET value_usd = EXCLUDED.value_usd
      RETURNING *
    `
    const row = rows[0]
    return { ...row, value_usd: Number(row.value_usd), active: row.active ?? true }
  },

  async upsertManyTradeInValues(inputs: TradeInCreateInput[]): Promise<TradeInValue[]> {
    const results: TradeInValue[] = []
    for (const input of inputs) {
      results.push(await postgresStorage.upsertTradeInValue(input))
    }
    return results
  },

  async updateTradeInValueActive(id: number, active: boolean): Promise<TradeInValue | null> {
    const sql = getSql()
    try {
      const rows = await sql<TradeInValue[]>`
        UPDATE trade_in_values SET active = ${active} WHERE id = ${id} RETURNING *
      `
      return rows[0] ? { ...rows[0], value_usd: Number(rows[0].value_usd) } : null
    } catch {
      // active column may not exist in older schema — return row as-is with toggled value
      const rows = await sql<TradeInValue[]>`SELECT * FROM trade_in_values WHERE id = ${id}`
      return rows[0] ? { ...rows[0], value_usd: Number(rows[0].value_usd), active } : null
    }
  },

  async deleteTradeInValue(id: number): Promise<boolean> {
    const sql = getSql()
    const rows = await sql<{ id: number }[]>`DELETE FROM trade_in_values WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },

  // ─── Site Settings (postgres) ─────────────────────────────────

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
  if (hasUsableDatabaseUrl()) return postgresStorage

  // In production (Vercel), never use the JSON-based demo storage —
  // the filesystem is read-only and writes will throw EROFS.
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL no está configurada en Vercel. ' +
      'Ir a: Vercel → Project → Settings → Environment Variables → agregar DATABASE_URL con la cadena de conexión de Supabase. ' +
      'En Supabase: Project → Settings → Database → Connection String → Transaction pooler (puerto 6543).'
    )
  }

  // Local development fallback: use the JSON demo store (read/write works locally)
  return demoStorage
}
