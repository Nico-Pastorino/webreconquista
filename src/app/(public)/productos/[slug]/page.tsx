import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getProductBySlug,
  getDollarRate,
  getFinancingGroups,
  getFinancingOptions,
  getSiteSettings,
  getTradeInModels,
} from '@/lib/queries'
import {
  calcPriceARS,
  calcGroupedInstallments,
  formatARS,
  formatUSD,
} from '@/lib/calculations'
import InstallmentsTable from '@/components/public/InstallmentsTable'
import TradeInSimulator from '@/components/public/TradeInSimulator'
import { buildWhatsAppUrl, CATEGORY_LABELS } from '@/lib/utils'
import { ArrowLeft, MessageCircle, Shield, Truck, RefreshCw } from 'lucide-react'
import ProductImage from '@/components/ui/ProductImage'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)
    if (!product) return { title: 'Producto no encontrado' }
    return {
      title: `${product.name} | Precio y cuotas`,
      description: product.description ?? `Comprá ${product.name} con garantía y envío.`,
    }
  } catch {
    return { title: 'Producto | STORE RQTA' }
  }
}

const DEFAULT_SETTINGS = {
  whatsapp_number: '5491100000000',
  whatsapp_message: 'Hola! Me interesa: ',
  store_name: 'Store RQTA',
  store_tagline: '',
  trade_in_enabled: true,
  show_usd_price: true,
  show_installments: true,
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  let product = null
  let dollarRate = 1200
  let groups: import('@/types').FinancingGroup[] = []
  let options: import('@/types').FinancingOption[] = []
  let settings = DEFAULT_SETTINGS
  let tradeInModels: string[] = []

  try {
    ;[product, dollarRate, groups, options, settings, tradeInModels] = await Promise.all([
      getProductBySlug(slug),
      getDollarRate(),
      getFinancingGroups(true),
      getFinancingOptions(undefined, true),
      getSiteSettings(),
      getTradeInModels(),
    ])
  } catch (err) {
    console.error('[ProductDetail] data fetch error:', err)
  }

  if (!product) notFound()

  const priceARS = calcPriceARS(product.price_usd, dollarRate)
  const computedGroups = calcGroupedInstallments(product.price_usd, dollarRate, groups, options)

  // Opción de 1 pago sin recargo para mostrar destacada en el bloque de precio
  const singlePayment = computedGroups
    .flatMap((g) => g.options)
    .find((o) => o.installments === 1 && o.surcharge_pct === 0)

  const categoryHref = `/${product.category}`
  const isIphone = product.category === 'iphone'
  const whatsappMsg = `${settings.whatsapp_message}${product.name} - ${formatARS(priceARS)}`
  const whatsappUrl = buildWhatsAppUrl(settings.whatsapp_number, whatsappMsg)
  const specs = product.specs as Record<string, string> | null

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 md:py-20 lg:px-8 lg:py-24">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#6B7280] md:mb-12">
        <Link href="/productos" className="flex items-center gap-1 transition-colors hover:text-[#111111]">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>
        <span>/</span>
        <Link href={categoryHref} className="transition-colors hover:text-[#111111]">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-[#111111]">{product.name}</span>
      </nav>

      <div className="grid items-start gap-6 md:gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-14">
        {/* Columna izquierda: imagen + trade-in debajo en desktop */}
        <div className="flex flex-col gap-6">
          <div className={
            isIphone
              ? 'relative aspect-square overflow-hidden rounded-[2rem] bg-[#F5F5F7]'
              : 'relative aspect-square isolate overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/[0.07]'
          }>
            <ProductImage
              imageUrl={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={isIphone ? 'h-full w-full bg-[#F5F5F7]' : 'h-full w-full bg-white'}
              imageClassName={
                isIphone
                  ? 'object-contain scale-[1.35] transition-transform duration-500'
                  : 'object-contain mix-blend-multiply p-12 sm:p-16 transition-transform duration-500'
              }
              priority
            />
          </div>

          {/* Trade-in bajo la imagen — solo desktop */}
          {isIphone && settings.trade_in_enabled && tradeInModels.length > 0 && (
            <div className="hidden lg:block rounded-[2rem] border border-[#E5E7EB] bg-white p-6">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Plan Canje</p>
              <h2 className="mb-5 text-xl font-semibold tracking-[-0.04em] text-[#111111]">
                Entregá tu iPhone y pagá la diferencia.
              </h2>
              <TradeInSimulator
                models={tradeInModels}
                productPriceUsd={product.price_usd}
                dollarRate={dollarRate}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 md:gap-8">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">
              {CATEGORY_LABELS[product.category]}
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-4xl md:text-5xl">
              {product.name}
            </h1>
          </div>

          {/* Bloque de precio — sin dólar de referencia */}
          <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-4xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl md:text-6xl">
                {formatARS(priceARS)}
              </p>
              {settings.show_usd_price && (
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                  {formatUSD(product.price_usd)}
                </p>
              )}
            </div>
            {singlePayment && (
              <p className="mt-5 rounded-[1.5rem] bg-[#f8f8f9] px-6 py-5 text-sm leading-7 text-[#6B7280]">
                {singlePayment.label}: {formatARS(singlePayment.total_ars)}
              </p>
            )}
          </div>

          {/* Tabla de cuotas agrupada */}
          {settings.show_installments && computedGroups.length > 0 && (
            <InstallmentsTable groups={computedGroups} />
          )}

          {product.description && (
            <p className="max-w-xl text-base leading-8 text-[#6B7280]">{product.description}</p>
          )}

          {specs && Object.keys(specs).length > 0 && (
            <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">Especificaciones</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="rounded-[1.5rem] bg-[#F5F5F7] px-5 py-5">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">{k}</dt>
                    <dd className="mt-2 text-sm font-medium text-[#111111]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-full bg-black px-7 py-4 text-base font-medium text-white transition-colors hover:bg-[#1f1f1f]"
          >
            <MessageCircle className="h-5 w-5" />
            Consultar por WhatsApp
          </a>

          <div className="grid gap-3 rounded-[1.5rem] border border-[#ECECEF] bg-[#F5F5F7] p-4 sm:gap-4 sm:rounded-[2rem] sm:p-6">
            {[
              { icon: Shield, text: 'Garantía oficial 12 meses' },
              { icon: Truck, text: 'Envío a todo el país' },
              { icon: RefreshCw, text: 'Plan Canje disponible' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-[#6B7280]">
                <Icon className="h-4 w-4 text-[#111111]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade-in full-width — solo mobile */}
      {isIphone && settings.trade_in_enabled && tradeInModels.length > 0 && (
        <div className="mt-16 lg:hidden">
          <div className="mb-8">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Plan Canje</p>
            <h2 className="text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#111111]">Entregá tu iPhone y pagá la diferencia.</h2>
            <p className="mt-4 text-base leading-8 text-[#6B7280]">
              Entregá tu iPhone usado y pagá solo la diferencia
            </p>
          </div>
          <div className="max-w-xl">
            <TradeInSimulator
              models={tradeInModels}
              productPriceUsd={product.price_usd}
              dollarRate={dollarRate}
            />
          </div>
        </div>
      )}
    </div>
  )
}
