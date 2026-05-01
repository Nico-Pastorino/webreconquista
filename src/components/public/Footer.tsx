import Link from 'next/link'
import SiteLogo from '@/components/shared/SiteLogo'

export default function Footer({ storeName }: { storeName: string }) {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]">
          <div>
            <SiteLogo surface="light" className="mb-5" imageClassName="w-[120px] sm:w-[132px]" />
            <p className="max-w-sm text-sm leading-7 text-white/45">
              Productos Apple seleccionados. Atención directa, cuotas claras y experiencia premium.
            </p>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/30">Productos</p>
            {[
              ['iPhone', '/iphone'],
              ['iPad', '/ipad'],
              ['Mac', '/mac'],
              ['Watch', '/watch'],
              ['AirPods', '/airpods'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="mb-2 block text-sm text-white/50 transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </div>
          <div>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/30">Servicios</p>
            <Link href="/plan-canje" className="mb-2 block text-sm text-white/50 transition-colors hover:text-white">Plan Canje</Link>
            <Link href="/contacto" className="mb-2 block text-sm text-white/50 transition-colors hover:text-white">Contacto</Link>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/30">Beneficios</p>
            {['Garantía oficial', 'Envíos a todo el país', 'Hasta 12 cuotas', 'Canje de iPhone'].map((b) => (
              <p key={b} className="mb-2 text-sm text-white/45">{b}</p>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-6">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} {storeName}</p>
          <p className="text-xs text-white/25">Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}
