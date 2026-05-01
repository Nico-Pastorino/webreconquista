import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'subtle'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]',
        {
          'border-[#d9d9d9] bg-white text-[#111111]': variant === 'default',
          'border-[#eaeaea] bg-[#f5f5f7] text-[#666666]': variant === 'subtle',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
