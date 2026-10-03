import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* Botón estilo shadcn con la voz de la página:
   - acento: bloque rectangular celeste (como el amarillo de Lamborghini, un solo acento por pantalla)
   - borde: rectángulo con línea fina
   - pildora: control de navegación redondeado (AWE)
   - fantasma: solo texto en mayúsculas mono con flecha */
const buttonVariants = cva(
  'group/btn inline-flex items-center justify-center gap-3 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        acento: 'bg-accent text-accent-ink hover:shadow-[0_0_0_1px_var(--accent),0_18px_50px_-12px_var(--glow)] active:translate-y-px',
        borde: 'border border-line-2 text-fg hover:border-fg',
        pildora: 'rounded-full bg-control text-fg hover:bg-line-2',
        fantasma: 'text-fg hover:text-accent-text',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-9 px-4 text-[11px]',
        lg: 'h-14 px-8 text-[12.5px]',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'acento', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
