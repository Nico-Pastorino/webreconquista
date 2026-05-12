/**
 * Seed Supabase desde database/demo-store.json
 *
 * Uso:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/seed-supabase.ts
 *
 * Requiere: DATABASE_URL configurada con la conexión real de Supabase.
 * Ejecutar solo localmente, nunca en producción.
 */

import path from 'path'
import { promises as fs } from 'fs'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL || DATABASE_URL.includes('user:password@host')) {
  console.error('❌ DATABASE_URL no configurada o es un placeholder.')
  console.error('   Ejecutar: DATABASE_URL="postgresql://..." npx tsx scripts/seed-supabase.ts')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 })

async function main() {
  const jsonPath = path.join(process.cwd(), 'database', 'demo-store.json')
  const raw = await fs.readFile(jsonPath, 'utf8')
  const store = JSON.parse(raw)

  console.log('📦 Iniciando seed en Supabase...\n')

  // ── Productos ─────────────────────────────────────────────
  const products = store.products ?? []
  if (products.length > 0) {
    console.log(`→ Insertando ${products.length} productos...`)
    for (const p of products) {
      await sql`
        INSERT INTO products (slug, name, category, price_usd, image_url, featured, active, description, specs, product_label, created_at)
        VALUES (
          ${p.slug}, ${p.name}, ${p.category}, ${Number(p.price_usd)},
          ${p.image_url ?? null}, ${p.featured ?? false}, ${p.active ?? true},
          ${p.description ?? null},
          ${p.specs ? JSON.stringify(p.specs) : null},
          ${p.product_label ?? null},
          ${p.created_at ?? new Date().toISOString()}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name         = EXCLUDED.name,
          category     = EXCLUDED.category,
          price_usd    = EXCLUDED.price_usd,
          image_url    = EXCLUDED.image_url,
          featured     = EXCLUDED.featured,
          active       = EXCLUDED.active,
          description  = EXCLUDED.description,
          specs        = EXCLUDED.specs,
          product_label = EXCLUDED.product_label
      `
    }
    console.log(`   ✓ ${products.length} productos OK`)
  }

  // ── Dollar rate ───────────────────────────────────────────
  const rate = store.dollar_rate?.rate
  if (rate) {
    console.log(`→ Insertando tipo de cambio: $${rate}...`)
    await sql`
      INSERT INTO dollar_rate (rate, updated_at)
      VALUES (${Number(rate)}, NOW())
      ON CONFLICT DO NOTHING
    `
    console.log('   ✓ Dollar rate OK')
  }

  // ── Financing groups ──────────────────────────────────────
  const groups = store.financing_groups ?? []
  if (groups.length > 0) {
    console.log(`→ Insertando ${groups.length} grupos de financiación...`)
    for (const g of groups) {
      await sql`
        INSERT INTO financing_groups (id, name, active, sort_order)
        VALUES (${g.id}, ${g.name}, ${g.active ?? true}, ${g.sort_order ?? 0})
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active
      `
    }
    console.log('   ✓ Financing groups OK')
  }

  // ── Financing options ─────────────────────────────────────
  const options = store.financing_options ?? []
  if (options.length > 0) {
    console.log(`→ Insertando ${options.length} opciones de financiación...`)
    for (const o of options) {
      await sql`
        INSERT INTO financing_options (id, group_id, installments, surcharge_pct, label, active, sort_order)
        VALUES (${o.id}, ${o.group_id}, ${o.installments}, ${Number(o.surcharge_pct)}, ${o.label ?? null}, ${o.active ?? true}, ${o.sort_order ?? 0})
        ON CONFLICT (id) DO UPDATE SET surcharge_pct = EXCLUDED.surcharge_pct, label = EXCLUDED.label, active = EXCLUDED.active
      `
    }
    console.log('   ✓ Financing options OK')
  }

  // ── Trade-in values ───────────────────────────────────────
  const tradeIns = store.trade_in_values ?? []
  if (tradeIns.length > 0) {
    console.log(`→ Insertando ${tradeIns.length} valores de plan canje...`)
    for (const t of tradeIns) {
      await sql`
        INSERT INTO trade_in_values (model, capacity, battery_state, value_usd, active)
        VALUES (${t.model}, ${t.capacity}, ${t.battery_state}, ${Number(t.value_usd)}, ${t.active ?? true})
        ON CONFLICT (model, capacity, battery_state) DO UPDATE
          SET value_usd = EXCLUDED.value_usd, active = EXCLUDED.active
      `
    }
    console.log('   ✓ Trade-in values OK')
  }

  // ── Site settings ─────────────────────────────────────────
  const settings = store.site_settings ?? {}
  if (Object.keys(settings).length > 0) {
    console.log('→ Insertando configuración del sitio...')
    for (const [key, value] of Object.entries(settings)) {
      await sql`
        INSERT INTO site_settings (key, value)
        VALUES (${key}, ${String(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `
    }
    console.log('   ✓ Site settings OK')
  }

  console.log('\n✅ Seed completado exitosamente.')
  await sql.end()
}

main().catch((err) => {
  console.error('\n❌ Error durante el seed:', err.message)
  process.exit(1)
})
