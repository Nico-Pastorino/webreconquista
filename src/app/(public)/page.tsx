import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BadgeCheck, CreditCard, Headphones, Laptop, Package, RefreshCw, Smartphone, Tablet, Watch } from 'lucide-react'
import { getFeaturedProducts, getDollarRate, getInstallmentPlans, getSiteSettings } from '@/lib/queries'
import ProductCard from '@/components/public/ProductCard'
import ProductPlaceholderCard from '@/components/public/ProductPlaceholderCard'
import Hero from '@/components/public/Hero'
import type { InstallmentPlan, ProductCard as ProductCardType, SiteSettings } from '@/types'

export const revalidate = 60

const CATEGORIES = [
  { id: 'iphone', label: 'iPhone', href: '/iphone', icon: Smartphone },
  { id: 'ipad', label: 'iPad', href: '/ipad', icon: Tablet },
  { id: 'mac', label: 'Mac', href: '/mac', icon: Laptop },
  { id: 'watch', label: 'Watch', href: '/watch', icon: Watch },
  { id: 'airpods',    label: 'AirPods',    href: '/airpods',    icon: Headphones },
  { id: 'accesorios', label: 'Accesorios', href: '/accesorios', icon: Package    },
]

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '5491100000000',
  whatsapp_message: 'Hola! Me interesa: ',
  store_name: 'Store RQTA',
  store_tagline: 'Productos Apple, sin vueltas.',
  trade_in_enabled: true,
  show_usd_price: true,
  show_installments: true,
}

export default async function HomePage() {
  let featured: ProductCardType[] = []
  let dollarRate = 1200
  let installmentPlans: InstallmentPlan[] = []
  let settings = DEFAULT_SETTINGS

  try {
    ;[featured, dollarRate, installmentPlans, settings] = await Promise.all([
      getFeaturedProducts(),
      getDollarRate(),
      getInstallmentPlans(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  return (
    <>
      <Hero storeName={settings.store_name} tradeInEnabled={settings.trade_in_enabled} />

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="reveal-heading mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Categorías</p>
              <h2 className="reveal-heading text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]" style={{ transitionDelay: '80ms' }}>Explorá por producto.</h2>
            </div>
            <Link href="/productos" className="hidden items-center gap-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-60 md:inline-flex">
              Ver catálogo <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="stagger-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex min-h-[180px] flex-col justify-between rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D1D5DB] hover:shadow-[0_20px_44px_rgba(0,0,0,0.08)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#111111]">
                  <Icon className="h-5 w-5 text-[#111111] transition-colors duration-300 group-hover:text-white" />
                </span>
                <div>
                  <p className="text-xl font-semibold tracking-[-0.03em] text-[#111111]">{label}</p>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-[#6B7280]">
                    Explorá modelos, precios y disponibilidad de forma clara.
                  </p>
                  <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#111111]">
                    Explorar <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F7] py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="reveal-heading mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Selección</p>
              <h2 className="reveal-heading text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]" style={{ transitionDelay: '80ms' }}>Productos destacados.</h2>
              <p className="reveal-heading mt-4 max-w-xl text-base leading-8 text-[#6B7280]" style={{ transitionDelay: '160ms' }}>
                El producto es el protagonista: imagen grande, precio visible y lectura rápida.
              </p>
            </div>
            <Link href="/productos" className="inline-flex items-center gap-2 text-sm font-medium text-[#111111] transition-opacity hover:opacity-60">
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="stagger-grid grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featured.length > 0
              ? featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    dollarRate={dollarRate}
                    installmentPlans={installmentPlans}
                    showUSD={settings.show_usd_price}
                  />
                ))
              : ['iPhone 15 Pro', 'iPhone 14', 'MacBook Air', 'AirPods Pro'].map((label) => (
                  <ProductPlaceholderCard key={label} title={label} />
                ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="reveal-heading mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Beneficios</p>
            <h2 className="reveal-heading text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]" style={{ transitionDelay: '80ms' }}>Compra clara y experiencia cuidada.</h2>
          </div>
          <div className="stagger-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: BadgeCheck, title: 'Garantía oficial', description: 'Cobertura clara y confianza real en cada compra.' },
              { icon: CreditCard, title: 'Cuotas visibles', description: 'Opciones de pago entendibles desde el primer vistazo.' },
              { icon: RefreshCw, title: 'Plan Canje', description: 'Tu usado entra como parte de pago sin fricción.' },
              { icon: ArrowUpRight, title: 'Atención directa', description: 'Consultas rápidas por WhatsApp y resolución simple.' },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="group rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D1D5DB] hover:shadow-[0_20px_44px_rgba(0,0,0,0.07)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F5F7] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#111111]">
                  <Icon className="h-5 w-5 text-[#111111] transition-colors duration-300 group-hover:text-white" />
                </span>
                <p className="mt-6 text-xl font-semibold tracking-[-0.03em] text-[#111111]">{title}</p>
                <p className="mt-3 max-w-xs text-sm leading-7 text-[#6B7280]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="reveal-heading rounded-[2rem] border border-[#ECECEF] bg-[#F5F5F7] px-8 py-14 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.07)] md:px-12 md:py-16">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Plan Canje</p>
            <h2 className="text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]">Entregá tu iPhone y pagá la diferencia.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-[1.625] text-[#6B7280]">
              Si ya tenés un iPhone, calculá el valor de tu usado y acelerá la compra del próximo.
            </p>
            <Link href="/plan-canje" className="btn-apple-primary mt-8">
              Ir al Plan Canje
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
