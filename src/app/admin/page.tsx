export const dynamic = 'force-dynamic'

import { requireAdminSession } from '@/lib/auth'
import { getAllProductsAdmin, getDollarRate, getSiteSettings } from '@/lib/queries'
import { formatARS } from '@/lib/calculations'
import { Package, DollarSign, Star } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireAdminSession()

  const [products, dollarRate, settings] = await Promise.all([
    getAllProductsAdmin(),
    getDollarRate(),
    getSiteSettings(),
  ])

  const activeProducts = products.filter((p) => p.active).length
  const featuredProducts = products.filter((p) => p.featured).length

  const stats = [
    { label: 'Productos activos', value: activeProducts, icon: Package, href: '/admin/productos' },
    { label: 'Valor del dólar', value: `$${dollarRate.toLocaleString('es-AR')}`, icon: DollarSign, href: '/admin/dolar' },
    { label: 'Destacados', value: featuredProducts, icon: Star, href: '/admin/productos' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10">
        <p className="admin-section-heading">Panel de control</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111]">{settings.store_name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B7280]">
          Vista general de productos, cotización y operación diaria de la tienda.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group surface-card rounded-[1.75rem] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.06)]"
          >
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F5F7]">
              <s.icon className="h-5 w-5 text-[#666666]" />
            </span>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">{s.value}</p>
            <p className="mt-1 text-sm text-[#666666]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="surface-card overflow-hidden rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4">
          <p className="admin-section-heading">Últimos productos</p>
          <Link href="/admin/productos" className="text-xs text-[#666666] underline underline-offset-4 hover:text-[#111111]">
            Ver todos
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="divide-y divide-[#eaeaea]">
            {products.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/admin/productos/${p.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#f5f5f7]/50"
              >
                <div>
                  <p className="text-sm font-medium tracking-[-0.02em] text-[#111111]">{p.name}</p>
                  <p className="mt-0.5 text-xs capitalize text-[#666666]">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tracking-[-0.02em] text-[#111111]">
                    {formatARS(Number(p.price_usd) * dollarRate)}
                  </p>
                  <span className={`text-[11px] uppercase tracking-[0.14em] ${p.active ? 'text-[#666666]' : 'text-[#999999]'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-[#666666]">Todavía no hay productos cargados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
