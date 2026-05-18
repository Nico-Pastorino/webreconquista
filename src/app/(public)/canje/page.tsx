import { getDollarRate, getTradeInModels, getSiteSettings } from '@/lib/queries'
import CanjeSimulator from '@/components/public/CanjeSimulator'
import { buildWhatsAppUrl } from '@/lib/utils'
import { connection } from 'next/server'
import Link from 'next/link'

export const revalidate = 120

export const metadata = {
  title: 'Plan Canje iPhone | Valorá tu usado',
  description: 'Entregá tu iPhone usado y conseguí el nuevo pagando solo la diferencia. Cotización inmediata.',
}

const STEPS = [
  {
    n: '01',
    title: 'Cotizá online',
    desc: 'Completá el simulador. La estimación llega en segundos y queda guardada por 48 hs.',
  },
  {
    n: '02',
    title: 'Coordinamos retiro',
    desc: 'Te visitamos en CABA y GBA, o recibimos tu equipo por encomienda asegurada.',
  },
  {
    n: '03',
    title: 'Acreditamos en tu compra',
    desc: 'Inspeccionamos en 24 hs y descontamos el monto final del Apple que elijas.',
  },
] as const

export default async function CanjecPage() {
  await connection()

  let dollarRate = 1200
  let models: string[] = []
  let settings = {
    trade_in_enabled: true,
    whatsapp_number: '',
    whatsapp_message: 'Hola! Quiero consultar por el Plan Canje.',
  }

  try {
    ;[dollarRate, models, settings] = await Promise.all([
      getDollarRate(),
      getTradeInModels(),
      getSiteSettings() as Promise<typeof settings>,
    ])
  } catch {
    // fallbacks
  }

  if (!settings.trade_in_enabled) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-32 text-center">
        <p className="text-[#666666]">El plan canje no está disponible en este momento.</p>
      </div>
    )
  }

  const waContactUrl = settings.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, '¿Dudas? Quiero hablar con un asesor del Plan Canje.')
    : null

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-[#0f0f0f] px-5 py-20 text-center sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5a5a5a] sm:text-[11px]">
            Plan Canje
          </p>
          <h1 className="text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Tu iPhone vale más{' '}
            <span className="text-[#5a5a5a]">de lo que pensás.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#666666] sm:text-base sm:leading-relaxed">
            Recibimos tu equipo usado y lo descontamos del próximo.
            <br className="hidden sm:block" />
            Cotización inmediata, retiro sin vueltas.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-white px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">

            {/* LEFT — Simulator */}
            <div>
              {models.length > 0 ? (
                <CanjeSimulator
                  models={models}
                  dollarRate={dollarRate}
                  whatsappNumber={settings.whatsapp_number}
                />
              ) : (
                <div className="rounded-[28px] border border-[#E5E7EB] bg-[#f5f5f7] p-10 text-center">
                  <p className="text-sm text-[#666666]">
                    No hay modelos disponibles para canje en este momento.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — Cómo funciona */}
            <div className="lg:pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF] sm:text-[11px]">
                Cómo funciona
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-3xl md:text-4xl">
                Tres pasos. Sin sorpresas.
              </h2>

              <div className="mt-10 flex flex-col gap-8">
                {STEPS.map((step) => (
                  <div key={step.n} className="flex gap-5">
                    <span className="mt-0.5 w-7 shrink-0 text-sm font-medium text-[#C0C0C0]">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-base font-semibold tracking-[-0.02em] text-[#111111]">
                        {step.title}
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-7 text-[#6B7280]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp link */}
              <div className="mt-10 flex items-center justify-between border-t border-[#F0F0F0] pt-7">
                <p className="text-sm text-[#9CA3AF]">
                  ¿Dudas? Coordinamos por WhatsApp.
                </p>
                {waContactUrl ? (
                  <Link
                    href={waContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-[#111111] transition-colors hover:text-[#444]"
                  >
                    Hablar con un asesor
                    <span className="ml-0.5 text-base">›</span>
                  </Link>
                ) : (
                  <Link
                    href="/contacto"
                    className="flex items-center gap-1 text-sm font-medium text-[#111111] transition-colors hover:text-[#444]"
                  >
                    Hablar con un asesor
                    <span className="ml-0.5 text-base">›</span>
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
