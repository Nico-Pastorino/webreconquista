'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Headphones, Laptop, Smartphone, Tablet } from 'lucide-react'

interface Props {
  storeName: string
  tradeInEnabled?: boolean
}

const PREVIEWS = [
  { label: 'iPhone',  Icon: Smartphone },
  { label: 'Mac',     Icon: Laptop     },
  { label: 'iPad',    Icon: Tablet     },
  { label: 'AirPods', Icon: Headphones },
]

export default function Hero({ tradeInEnabled = true }: Props) {
  const [mounted, setMounted] = useState(false)
  const sectionRef  = useRef<HTMLElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.style.background = ''
      document.body.style.background = ''
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (sectionRef.current) {
        sectionRef.current.style.opacity = String(Math.max(0, 1 - y / 650))
      }
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${y * 0.12}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative -mt-32 bg-[#0a0a0a] lg:-mt-36"
      style={{ willChange: 'opacity' }}
    >
      {/* ── Radial glow ───────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 28%, rgba(255,255,255,0.11) 0%, transparent 70%)',
          animation: 'dotGridIn 2.5s ease-out both',
        }}
      />

      {/* ── Dot grid ──────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 30%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 30%, black 0%, transparent 80%)',
          animation: 'dotGridIn 2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        }}
      />

      <div
        ref={parallaxRef}
        className="relative mx-auto w-full max-w-7xl px-6 pb-0 pt-[8rem] sm:pt-[11rem] lg:px-8 lg:pt-[15rem]"
        style={{ willChange: 'transform' }}
      >
        <div className="mx-auto max-w-4xl text-center">

          {/* ── Logo + marca ───────────────────────────────────── */}
          <div
            className={`flex flex-col items-center gap-3 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '0ms' } as React.CSSProperties}
          >
            <Image
              src="/brand/store-rqta-logo.png"
              alt="Store RQTA"
              width={760}
              height={420}
              priority
              className="h-auto w-[84px] object-contain sm:w-[100px]"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.86 }}
            />

            {/* Divisor sutil */}
            <div
              className="h-px w-8"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            />

            {/* Firma geográfica — "Reconquista" con protagonismo */}
            <p
              style={{
                fontSize: '0.63rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.30em',
                color: 'rgba(255,255,255,0.38)',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.28em' }}>
                Reconquista
              </span>
              {' '}·{' '}
              <span>Apple Premium Store</span>
            </p>
          </div>

          {/* ── Headline ───────────────────────────────────────── */}
          <h1
            className={`mt-8 text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[1.06] tracking-[-0.045em] sm:mt-10 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '140ms', color: '#ffffff' } as React.CSSProperties}
          >
            Comprá Apple.{' '}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Sin intermediarios.</span>
          </h1>

          {/* ── Subtítulo ──────────────────────────────────────── */}
          <p
            className={`mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '260ms', color: 'rgba(255,255,255,0.5)' } as React.CSSProperties}
          >
            Productos seleccionados, precios claros y una experiencia premium.
          </p>

          {/* ── CTAs ───────────────────────────────────────────── */}
          <div
            className={`mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '380ms' } as React.CSSProperties}
          >
            <Link href="/productos" className="btn-apple-light">
              Ver productos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {tradeInEnabled && (
              <Link href="/plan-canje" className="btn-apple-ghost">
                Plan Canje
              </Link>
            )}
          </div>

        </div>

        {/* ── Visual showcase ────────────────────────────────── */}
        <div
          className={`mx-auto mt-14 max-w-5xl sm:mt-20 ${mounted ? 'anim-scale-in' : 'opacity-0'}`}
          style={{ '--delay': '500ms' } as React.CSSProperties}
        >
          <div
            className="relative overflow-hidden rounded-t-[2rem] border border-b-0 px-6 pt-8 sm:px-10 sm:pt-10"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PREVIEWS.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="hero-preview-card flex flex-col items-center gap-4 rounded-[1.25rem] px-4 py-7 sm:py-9"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                </div>
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
              style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
