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
    icon: [
      { url: '/favicon.ico',       type: 'image/x-icon' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'STORE RQTA',
    images: [{ url: '/favicon-512.png', width: 512, height: 512 }],
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
