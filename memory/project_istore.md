---
name: Project iStore Reconquista
description: E-commerce Apple full-stack, Next.js 16, PostgreSQL/demo-store JSON, stack y estructura completa
type: project
---

Tienda online Apple llamada Store RQTA. Stack: Next.js 16 (App Router), TypeScript, Tailwind, PostgreSQL o demo-store JSON según env.

**Why:** E-commerce local para venta de productos Apple con cuotas, canje y configuración desde admin.

**Estructura:**
- `src/app/(public)/` — Páginas públicas
- `src/app/admin/` — Panel admin
- `src/app/api/admin/` — API routes del admin
- `src/components/public/` — Componentes públicos
- `src/components/admin/` — Componentes admin
- `src/lib/calculations.ts` — Lógica de precios y cuotas (única fuente de verdad)
- `src/lib/storage.ts` — Acceso a datos (demo JSON o PostgreSQL)
- `src/lib/queries.ts` — Funciones de consulta de alto nivel
- `database/demo-store.json` — Datos en modo sin DB
- `database/schema.sql` — Schema PostgreSQL

**Modelo de financiación (actualizado mayo 2026):**
- Tablas: `financing_groups` (grupos por banco/tarjeta) y `financing_options` (cuotas por grupo)
- API: `/api/admin/financing-groups` y `/api/admin/financing-options`
- Admin: `InstallmentsManager` (agrupado, con CRUD de grupos y opciones inline)
- Público: `InstallmentsTable` (muestra grupos con sus cuotas calculadas)
- `getInstallmentPlans()` retorna flat de financing_options (backward-compat con ProductCard y catálogos)

**Regla de precio:**
precio_ars = ceil(price_usd * dollar_rate)
total_financiado = ceil(precio_ars * (1 + surcharge_pct / 100))
cuota = ceil(total_financiado / installments)

**La web pública NO muestra el valor del dólar.** Solo visible en admin (/admin/dolar).

**How to apply:** Mantener esta regla de cálculo en `calculations.ts`. Nunca mostrar `dollarRate` en páginas públicas.
