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
        <div className="mx-auto max-w-3xl text-center">

          {/* ── Logo ───────────────────────────────────────────── */}
          <div
            className={`flex justify-center ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '0ms' } as React.CSSProperties}
          >
            <Image
              src="/brand/store-rqta-logo.png"
              alt="Store RQTA"
              width={760}
              height={420}
              priority
              className="h-auto w-20 object-contain sm:w-28 lg:w-36"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
            />
          </div>

          {/* ── Reconquista (heading de marca) ─────────────────── */}
          <p
            className={`mt-5 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:mt-6 sm:text-4xl lg:text-5xl ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '100ms', color: '#ffffff' } as React.CSSProperties}
          >
            Reconquista
          </p>

          {/* ── Apple Premium Store ─────────────────────────────── */}
          <p
            className={`mt-2 text-[10px] font-medium uppercase tracking-[0.38em] sm:text-xs ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '180ms', color: 'rgba(255,255,255,0.38)' } as React.CSSProperties}
          >
            Apple Premium Store
          </p>

          {/* ── Divisor ────────────────────────────────────────── */}
          <div
            className={`mx-auto mt-7 h-px w-10 sm:mt-8 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '220ms', background: 'rgba(255,255,255,0.12)' } as React.CSSProperties}
          />

          {/* ── Headline — rol secundario ───────────────────────── */}
          <h1
            className={`mt-7 text-2xl font-semibold leading-snug tracking-[-0.03em] sm:mt-8 sm:text-3xl md:text-4xl ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '300ms', color: 'rgba(255,255,255,0.72)' } as React.CSSProperties}
          >
            Comprá Apple.{' '}
            <span style={{ color: 'rgba(255,255,255,0.28)' }}>Sin intermediarios.</span>
          </h1>

          {/* ── Subtítulo ──────────────────────────────────────── */}
          <p
            className={`mx-auto mt-4 max-w-md text-sm leading-relaxed sm:text-base ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '400ms', color: 'rgba(255,255,255,0.38)' } as React.CSSProperties}
          >
            Productos seleccionados, precios claros y una experiencia premium.
          </p>

          {/* ── CTAs ───────────────────────────────────────────── */}
          <div
            className={`mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '500ms' } as React.CSSProperties}
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
          style={{ '--delay': '620ms' } as React.CSSProperties}
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
