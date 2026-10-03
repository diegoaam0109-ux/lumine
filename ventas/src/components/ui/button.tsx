import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* Botón estilo shadcn con las variantes de la marca */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px',
  {
    variants: {
      variant: {
        default: 'bg-brand text-[#041016] shadow-[0_10px_30px_-10px_rgba(34,184,240,0.7)] hover:bg-brand-soft hover:shadow-[0_14px_40px_-10px_rgba(34,184,240,0.85)]',
        claro: 'bg-foreground text-background hover:bg-white',
        borde: 'border border-white/15 bg-white/[0.03] text-foreground hover:bg-white/[0.08] hover:border-white/30',
        fantasma: 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-7 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
