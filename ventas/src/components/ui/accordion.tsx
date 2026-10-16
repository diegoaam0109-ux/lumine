import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Acordeón estilo shadcn (Radix), con líneas finas e índice mono */
const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn('border-b border-line', className)} {...props} />)
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { n?: string }
>(({ className, children, n, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn('group flex flex-1 items-center gap-5 py-6 text-left text-lg font-semibold transition-colors hover:text-accent-text md:text-xl', className)}
      {...props}
    >
      {n ? <span className="t-label-sm w-7 shrink-0 text-dim transition-colors group-data-[state=open]:text-accent-text" aria-hidden="true">{n}</span> : null}
      <span className="flex-1">{children}</span>
      <span className="grid size-9 shrink-0 place-items-center border border-line-2 transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-accent group-data-[state=open]:bg-accent group-data-[state=open]:text-accent-ink">
        <Plus className="size-4" aria-hidden="true" />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-7 pl-12 pr-14 text-[16px] leading-relaxed', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
