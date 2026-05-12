import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AnimateOnScroll from '@/components/ui/AnimateOnScroll'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'STORE RQTA',
    template: '%s | STORE RQTA',
  },
  description: 'Tienda Apple con interfaz minimalista, productos seleccionados y una experiencia premium.',
  keywords: ['iPhone', 'iPad', 'Mac', 'Apple Watch', 'AirPods', 'Apple Argentina'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/brand/store-rqta-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'STORE RQTA',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-white text-black">
        {children}
        <AnimateOnScroll />
      </body>
    </html>
  )
}
