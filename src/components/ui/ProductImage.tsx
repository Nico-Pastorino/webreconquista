'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn, hasRenderableImage } from '@/lib/utils'

interface ProductImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  imageClassName?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  placeholderLabel?: string
}

// Domains already whitelisted in next.config.ts remotePatterns.
// External URLs that match → next/image (optimized).
// Everything else → plain <img> with lazy loading.
const SAFE_PATTERNS = [
  /^\//, // local / public
  /^https:\/\/([^/]+\.)?apple\.com\//,
  /^https:\/\/store\.storeimages\.cdn-apple\.com\//,
  /^https:\/\/([^/]+\.)?supabase\.(co|in)\//,
  /^https:\/\/images\.unsplash\.com\//,
  /^https:\/\/cdn\.istore\.com\.ar\//,
  /^https:\/\/([^/]+\.)?cloudinary\.com\//,
]

function isNextImageCompatible(url: string): boolean {
  return SAFE_PATTERNS.some((p) => p.test(url))
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F5F7] px-3 text-center text-[#BBBBBE]">
      <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
      <span className="text-[11px] font-medium tracking-[0.04em]">{label}</span>
    </div>
  )
}

export default function ProductImage({
  imageUrl,
  alt,
  className,
  imageClassName,
  sizes,
  priority,
  fill = false,
  width,
  height,
  placeholderLabel = 'Imagen próximamente',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  const showImage = hasRenderableImage(imageUrl) && !hasError

  if (!showImage) {
    return (
      <div
        className={cn('relative overflow-hidden', className)}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <Placeholder label={placeholderLabel} />
      </div>
    )
  }

  const src = imageUrl!

  // For external domains not in next.config.ts, use a plain <img> to avoid
  // "Invalid src" errors. The container mimics what next/image fill would render.
  if (!isNextImageCompatible(src)) {
    return (
      <div
        className={cn('relative overflow-hidden', className)}
        style={!fill && width && height ? { width, height } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className={cn(
            fill ? 'absolute inset-0 h-full w-full object-contain' : 'h-full w-full object-contain',
            imageClassName,
          )}
        />
      </div>
    )
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setHasError(true)}
          className={cn('object-contain', imageClassName)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 80}
          height={height ?? 80}
          priority={priority}
          onError={() => setHasError(true)}
          className={cn('h-full w-full object-contain', imageClassName)}
        />
      )}
    </div>
  )
}
