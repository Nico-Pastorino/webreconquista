import Link from 'next/link'
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { getSiteSettings } from '@/lib/queries'
import { buildWhatsAppUrl } from '@/lib/utils'

export const metadata = {
  title: 'Contacto | Store RQTA',
  description: 'Contactate con Store RQTA por WhatsApp para consultar disponibilidad y atención personalizada.',
}

export default async function ContactPage() {
  let settings = {
    whatsapp_number: '5491100000000',
    whatsapp_message: 'Hola! Quiero hacer una consulta en Store RQTA.',
    store_name: 'Store RQTA',
  }

  try {
    const siteSettings = await getSiteSettings()
    settings = {
      whatsapp_number: siteSettings.whatsapp_number,
      whatsapp_message: siteSettings.whatsapp_message,
      store_name: siteSettings.store_name,
    }
  } catch {
    // defaults seguros
  }

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.whatsapp_message || 'Hola! Quiero hacer una consulta en Store RQTA.',
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">Contacto</p>
        <h1 className="text-5xl font-semibold tracking-tight text-[#111111] md:text-7xl">Atención directa, sin intermediarios.</h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
          Consultá disponibilidad, cuotas, plan canje o cualquier detalle del producto por WhatsApp.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[40px] border border-[#ECECEF] bg-[#F5F5F7] px-8 py-10 text-left">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_14px_30px_rgba(17,17,17,0.08)]">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Escribinos ahora.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[#6B7280]">
            Respondemos consultas sobre stock, modelos, métodos de pago y canje de forma simple y personalizada.
          </p>
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1F1F1F]"
          >
            Ir a WhatsApp
          </Link>
        </div>

        <div className="grid gap-8 self-center">
          <div>
            <Phone className="h-5 w-5 text-[#111111]" />
            <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#111111]">Contacto principal</p>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">{settings.whatsapp_number}</p>
          </div>
          <div>
            <ShieldCheck className="h-5 w-5 text-[#111111]" />
            <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#111111]">Lo que podés consultar</p>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">
              Disponibilidad, precios, cuotas, canje, reservas y coordinación de entrega.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
