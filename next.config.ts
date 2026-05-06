import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Dominios permitidos para next/image (optimización automática WebP/AVIF)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
      },
      {
        protocol: 'https',
        hostname: '**.apple.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.istore.com.ar',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    // Formatos modernos — el browser elige el mejor soportado
    formats: ['image/avif', 'image/webp'],
    // Tamaños de thumbnails para catálogo (evita cargar imagen full)
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [48, 96, 128, 256, 384],
    // Cache de imágenes optimizadas: 30 días
    minimumCacheTTL: 2592000,
  },
  // Headers de seguridad
  async headers() {
    const baseHeaders = [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]

    if (process.env.NODE_ENV !== 'production') {
      return baseHeaders
    }

    return [
      ...baseHeaders,
      // Cachear assets estáticos agresivamente solo en producción.
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  // Compresión de respuestas
  compress: true,
  // Logging reducido en prod
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
