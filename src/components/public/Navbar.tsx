'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Airplay, ChevronDown, ChevronRight, Headphones, House, Laptop, Menu, MessageCircle, Package, RefreshCw, Smartphone, Tablet, Watch, X } from 'lucide-react'

const IPHONE_SUB = [
  { label: 'Ver todos los iPhone', href: '/iphone' },
  { label: 'Sellados Nuevos',      href: '/iphone/sellados-nuevos' },
  { label: 'Seminuevos',           href: '/iphone/seminuevos' },
]

const NAV_ITEMS = [
  { label: 'Inicio',     href: '/',           icon: House,      highlight: false, dropdown: false },
  { label: 'iPad',       href: '/ipad',        icon: Tablet,     highlight: false, dropdown: false },
  { label: 'Mac',        href: '/mac',         icon: Laptop,     highlight: false, dropdown: false },
  { label: 'Watch',      href: '/watch',       icon: Watch,      highlight: false, dropdown: false },
  { label: 'AirPods',    href: '/airpods',     icon: Headphones, highlight: false, dropdown: false },
  { label: 'Accesorios', href: '/accesorios',  icon: Package,    highlight: false, dropdown: false },
  { label: 'Plan Canje', href: '/plan-canje',  icon: RefreshCw,      highlight: true,  dropdown: false },
  { label: 'Contacto',  href: '/contacto',    icon: MessageCircle,  highlight: false, dropdown: false },
]

const linkCls = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-white/62 transition-colors hover:bg-white/7 hover:text-white whitespace-nowrap'
const highlightCls = 'inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/8 px-3 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/14 hover:text-white whitespace-nowrap'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [iphoneOpen, setIphoneOpen] = useState(false)
  const [mobileIphoneOpen, setMobileIphoneOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIphoneOpen(true)
  }
  function closeDropdown() {
    closeTimer.current = setTimeout(() => setIphoneOpen(false), 120)
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between rounded-full border border-white/10 bg-[rgba(17,17,17,0.82)] px-3 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 rounded-full px-3 py-2 text-white transition-opacity hover:opacity-85" aria-label="Store RQTA">
            <span className="text-[15px] font-medium tracking-[-0.03em]">Store</span>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
              RQTA
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {/* iPhone con dropdown */}
            <div
              className="relative"
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <button
                type="button"
                className={linkCls + ' gap-1'}
                aria-expanded={iphoneOpen}
              >
                <Smartphone className="h-3 w-3 shrink-0" />
                iPhone
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-150 ${iphoneOpen ? 'rotate-180' : ''}`} />
              </button>

              {iphoneOpen && (
                <div
                  className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <div className="min-w-[196px] overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(17,17,17,0.96)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    {IPHONE_SUB.map(({ label, href }, i) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIphoneOpen(false)}
                        className={`flex items-center rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/8 hover:text-white ${i === 0 ? 'text-white/50' : 'text-white/80'}`}
                      >
                        {i === 0 && <Smartphone className="mr-2 h-3 w-3 shrink-0 opacity-50" />}
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resto de items */}
            {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => (
              <Link
                key={href}
                href={href}
                className={highlight ? highlightCls : linkCls}
              >
                <Icon className="h-3 w-3 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden h-4 w-px bg-white/15 lg:block" />
            <Link
              href="/productos"
              className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90 whitespace-nowrap sm:inline-flex"
            >
              <Airplay className="h-3.5 w-3.5" />
              Ver productos
            </Link>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/12 lg:hidden"
              aria-label="Abrir menú"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────── */}
        {open && (
          <div className="mx-auto mt-3 max-w-[1160px] rounded-[28px] border border-white/10 bg-[rgba(17,17,17,0.94)] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1">

              {/* iPhone expandible */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileIphoneOpen((p) => !p)}
                  className="flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-sm font-medium text-white/78 transition-colors hover:bg-white/7 hover:text-white"
                >
                  <span className="inline-flex items-center gap-3">
                    <Smartphone className="h-4 w-4" />
                    iPhone
                  </span>
                  <ChevronDown className={`h-4 w-4 text-white/32 transition-transform duration-200 ${mobileIphoneOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileIphoneOpen && (
                  <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/8 pl-3">
                    {IPHONE_SUB.map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => { setOpen(false); setMobileIphoneOpen(false) }}
                        className="rounded-[16px] px-3.5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/6 hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Resto de items */}
              {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={
                    highlight
                      ? 'flex items-center justify-between rounded-[20px] border border-white/12 bg-white/6 px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                      : 'flex items-center justify-between rounded-[20px] px-4 py-3 text-sm font-medium text-white/78 transition-colors hover:bg-white/7 hover:text-white'
                  }
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/32" />
                </Link>
              ))}

              <Link
                href="/productos"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-3 text-sm font-medium text-[#111111]"
              >
                <Airplay className="h-4 w-4" />
                Ver productos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
