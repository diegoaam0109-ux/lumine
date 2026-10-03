import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { CircleDashed } from 'lucide-react'
import { Lab3D, type Lab3DApi } from '@/lib/lab3d'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-foreground', className)} role="img" aria-label="Lumine Motors">
      <span className="emblem" aria-hidden="true" />
      <span className="wordmark" aria-hidden="true" />
    </span>
  )
}

/** Dato comercial que todavía no existe: se muestra, nunca se inventa */
export function PorConfirmar({ que }: { que?: string }) {
  return (
    <span className="por-confirmar" title={que ? que + ': dato comercial en preparación' : 'Dato comercial en preparación'}>
      <CircleDashed className="size-3.5" aria-hidden="true" />
      Por confirmar
    </span>
  )
}

const subir: Variants = {
  oculto: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] } }),
}

/** Aparece al entrar en pantalla (y queda quieto con movimiento reducido) */
export function Aparecer({ children, i = 0, className, as = 'div' }: { children: React.ReactNode; i?: number; className?: string; as?: 'div' | 'li' | 'article' }) {
  const quieto = useReducedMotion()
  const M = as === 'li' ? motion.li : as === 'article' ? motion.article : motion.div
  if (quieto) { const T = as; return <T className={className}>{children}</T> }
  return (
    <M className={className} variants={subir} custom={i} initial="oculto" whileInView="visible" viewport={{ once: true, margin: '0px 0px -12% 0px' }}>
      {children}
    </M>
  )
}

export function Encabezado({ eyebrow, titulo, bajada, centro = false, id }: { eyebrow: string; titulo: React.ReactNode; bajada?: React.ReactNode; centro?: boolean; id?: string }) {
  return (
    <div className={cn('mb-12 flex max-w-3xl flex-col gap-4 md:mb-16', centro && 'mx-auto items-center text-center')}>
      <Aparecer><span className="eyebrow">{eyebrow}</span></Aparecer>
      <Aparecer i={1}><h2 id={id} className="display text-[clamp(34px,5.4vw,68px)]">{titulo}</h2></Aparecer>
      {bajada ? <Aparecer i={2}><p className="text-lg leading-relaxed text-muted-foreground md:text-xl">{bajada}</p></Aparecer> : null}
    </div>
  )
}

/** Auto 3D de Lumine (motor propio en canvas, sin librerías) */
export const Escena3D = React.forwardRef<Lab3DApi | null, { opciones?: Record<string, unknown>; className?: string; etiqueta: string; alListo?: (api: Lab3DApi) => void }>(
  function Escena3D({ opciones, className, etiqueta, alListo }, ref) {
    const host = React.useRef<HTMLDivElement>(null)
    const api = React.useRef<Lab3DApi | null>(null)
    React.useImperativeHandle(ref, () => api.current as Lab3DApi, [])
    React.useEffect(() => {
      if (!host.current) return
      const a = Lab3D.crear(host.current, Object.assign({ hotspots: false, interactivo: true, etiqueta }, opciones || {}))
      api.current = a
      alListo?.(a)
      return () => { a.destruir(); if (host.current) host.current.innerHTML = '' }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return <div ref={host} className={cn('lab-stage', className)} />
  },
)

export function irA(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}
