import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[32px] border border-[#eaeaea] bg-white',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
