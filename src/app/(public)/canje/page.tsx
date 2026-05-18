import { getDollarRate, getTradeInModels, getSiteSettings } from '@/lib/queries'
import TradeInSimulator from '@/components/public/TradeInSimulator'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { connection } from 'next/server'

export const revalidate = 120

export const metadata = {
  title: 'Plan Canje iPhone | Valorá tu usado',
  description: 'Entregá tu iPhone usado y conseguí el nuevo pagando solo la diferencia.',
}

export default async function CanjecPage() {
  await connection()

  let dollarRate = 1200
  let models: string[] = []
  let settings = { trade_in_enabled: true, whatsapp_number: '' }

  try {
    ;[dollarRate, models, settings] = await Promise.all([
      getDollarRate(),
      getTradeInModels(),
      getSiteSettings(),
    ])
  } catch {
    // DB no conectada
  }

  if (!settings.trade_in_enabled) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-24 text-center lg:px-8">
        <p className="text-[#666666]">El plan canje no está disponible en este momento.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 md:py-20 lg:px-8 lg:py-24">
      <div className="mb-8 max-w-4xl md:mb-16">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#6B7280] sm:mb-5 sm:text-[11px]">Plan Canje</p>
        <h1 className="max-w-3xl text-left text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl md:text-5xl lg:text-7xl">
          Tu próximo iPhone empieza con el actual.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280] sm:mt-6 sm:text-base sm:leading-relaxed md:text-lg">
          Entregá tu usado, conocé el valor al instante y entendé exactamente cuánto pagás.
        </p>
      </div>

      <div className="grid gap-6 md:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-8 max-w-md md:mb-12">
            <RefreshCw className="h-5 w-5 text-[#111111] sm:h-6 sm:w-6" />
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:mt-8 sm:text-3xl">¿Cómo funciona?</h2>
            <p className="mt-3 text-sm leading-7 text-[#6B7280] sm:mt-4">
              Un flujo directo: seleccionás tu modelo, vemos el valor y calculamos la diferencia.
            </p>
          </div>
          <div className="flex flex-col gap-7">
            {[
              {
                step: '01',
                title: 'Seleccioná tu modelo',
                desc: 'Indicanos el modelo, capacidad y estado de tu iPhone actual.',
              },
              {
                step: '02',
                title: 'Conocé el valor',
                desc: 'Te mostramos el valor estimado de tu usado en el acto.',
              },
              {
                step: '03',
                title: 'Elegí tu nuevo iPhone',
                desc: 'Calculamos la diferencia a pagar por el modelo que querés.',
              },
              {
                step: '04',
                title: 'Cerramos el trato',
                desc: 'Coordinamos por WhatsApp y listo. Simple y transparente.',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-sm font-medium text-[#111111]">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[#111111]">{item.title}</p>
                    <p className="mt-2 max-w-md text-sm leading-7 text-[#6B7280]">{item.desc}</p>
                  </div>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">Por qué canjearnos</p>
            <div className="flex flex-col gap-4">
              {[
                'Valoración justa y transparente',
                'Sin intermediarios',
                'Proceso rápido',
                'Mejor precio del mercado',
              ].map((b) => (
                <div key={b} className="flex items-center justify-between gap-4 text-sm text-[#111111]">
                  <span>{b}</span>
                  <ArrowRight className="h-4 w-4 text-[#666666]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-5 max-w-xl md:mb-8">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#6B7280] sm:mb-4 sm:text-[11px]">Simulador</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-3xl">Calculá el valor de tu iPhone.</h2>
          </div>
          {models.length > 0 ? (
            <TradeInSimulator models={models} dollarRate={dollarRate} whatsappNumber={settings.whatsapp_number} />
          ) : (
            <div className="rounded-[36px] border border-[#ECECEF] bg-[#F5F5F7] p-10 text-center">
              <p className="text-[#666666]">
                No hay modelos disponibles para canje en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
