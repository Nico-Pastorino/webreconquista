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

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {showImage ? (
        fill ? (
          <Image
            src={imageUrl!}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setHasError(true)}
            className={cn('object-contain', imageClassName)}
          />
        ) : (
          <Image
            src={imageUrl!}
            alt={alt}
            width={width ?? 80}
            height={height ?? 80}
            priority={priority}
            onError={() => setHasError(true)}
            className={cn('h-full w-full object-contain', imageClassName)}
          />
        )
      ) : (
        <Placeholder label={placeholderLabel} />
      )}
    </div>
  )
}
