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
          background: 'radial-gradient(ellipse 80% 55% at 50% 28%, rgba(255,255,255,0.10) 0%, transparent 70%)',
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

          {/* ── Logo grande ────────────────────────────────────── */}
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
              className="h-auto w-24 object-contain sm:w-32 lg:w-40"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.90 }}
            />
          </div>

          {/* ── Pill — Apple Premium Store ──────────────────────── */}
          <div
            className={`mt-5 flex justify-center ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '100ms' } as React.CSSProperties}
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1"
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.35)' }}
              />
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 500,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.40)',
                }}
              >
                Apple Premium Store
              </span>
            </div>
          </div>

          {/* ── Reconquista — display dominante ────────────────── */}
          <p
            className={`mt-6 font-semibold leading-none tracking-[-0.04em] sm:mt-7 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{
              '--delay': '200ms',
              fontSize: 'clamp(2.8rem, 10vw, 6.5rem)',
              color: '#ffffff',
            } as React.CSSProperties}
          >
            Reconquista
          </p>

          {/* ── Headline secundario ─────────────────────────────── */}
          <h1
            className={`mt-5 text-base font-medium leading-snug tracking-[-0.01em] sm:mt-6 sm:text-lg md:text-xl ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '320ms', color: 'rgba(255,255,255,0.45)' } as React.CSSProperties}
          >
            Comprá Apple.{' '}
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>Sin intermediarios.</span>
          </h1>

          {/* ── CTAs ───────────────────────────────────────────── */}
          <div
            className={`mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row ${mounted ? 'anim-fade-up' : 'opacity-0'}`}
            style={{ '--delay': '420ms' } as React.CSSProperties}
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
          style={{ '--delay': '540ms' } as React.CSSProperties}
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
