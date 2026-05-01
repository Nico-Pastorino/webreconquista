import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SiteLogoProps {
  className?: string
  imageClassName?: string
  surface?: 'none' | 'light'
  priority?: boolean
}

export default function SiteLogo({
  className,
  imageClassName,
  surface = 'none',
  priority = false,
}: SiteLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        surface === 'light' && 'rounded-2xl bg-white px-3 py-2',
        className,
      )}
    >
      <Image
        src="/brand/store-rqta-logo.png"
        alt="Store RQTA"
        width={760}
        height={420}
        priority={priority}
        className={cn('h-auto w-[108px] object-contain sm:w-[116px]', imageClassName)}
      />
    </div>
  )
}
