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
  const shouldRenderImage = hasRenderableImage(imageUrl)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#F3F4F6]',
        className,
      )}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {shouldRenderImage ? (
        fill ? (
          <Image
            src={imageUrl!}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn('object-contain', imageClassName)}
          />
        ) : (
          <Image
            src={imageUrl!}
            alt={alt}
            width={width ?? 80}
            height={height ?? 80}
            priority={priority}
            className={cn('h-full w-full object-contain', imageClassName)}
          />
        )
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-[#9CA3AF]">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[11px] font-medium tracking-[0.02em]">{placeholderLabel}</span>
        </div>
      )}
    </div>
  )
}
