import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#111111]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-[22px] border border-[#eaeaea] bg-white px-5 py-3 text-sm text-[#111111] placeholder:text-[#8d8d8d] transition-colors outline-none focus:border-[#111111] focus:ring-4 focus:ring-black/5',
            error && 'border-[#111111]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#666666]">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export default Input
