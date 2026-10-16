import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowUpRight, CircleDashed, Moon, Sun } from 'lucide-react'
import { Lab3D, type Lab3DApi } from '@/lib/lab3d'
import { cn } from '@/lib/utils'
import { Emblema, Palabra } from '@/components/logo-vectorial'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-fg', className)} role="img" aria-label="Lumine Motors">
      <Emblema className="size-[26px] shrink-0" />
      <Palabra className="h-[15px] w-auto shrink-0" />
    </span>
  )
}

/** Etiqueta de instrumento: mono, mayúsculas, con índice opcional */
export function Etiqueta({ children, n, className, punto }: { children: React.ReactNode; n?: string; className?: string; punto?: boolean }) {
  return (
    <span className={cn('t-label inline-flex items-center gap-3 text-muted', className)}>
      {punto ? <i className="parpadeo size-1.5 bg-accent" aria-hidden="true" /> : null}
      {n ? <span className="text-accent-text">{n}</span> : null}
      {n ? <i className="h-px w-6 bg-line-2" aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  )
}

/** Dato comercial que todavía no existe: se muestra, nunca se inventa */
export function PorConfirmar({ que }: { que?: string }) {
  return (
    <span className="por-confirmar" title={que ? que + ': dato comercial en preparación' : 'Dato comercial en preparación'}>
      <CircleDashed className="size-3" aria-hidden="true" /> Por confirmar
    </span>
  )
}

const subir: Variants = {
  oculto: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
}
/** Aparece al entrar en pantalla */
export function Aparecer({ children, i = 0, className, as = 'div' }: { children: React.ReactNode; i?: number; className?: string; as?: 'div' | 'li' | 'article' }) {
  const quieto = useReducedMotion()
  const M = as === 'li' ? motion.li : as === 'article' ? motion.article : motion.div
  if (quieto) { const T = as; return <T className={className}>{children}</T> }
  return <M className={className} variants={subir} custom={i} initial="oculto" whileInView="visible" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>{children}</M>
}

/** Encabezado de sección: índice mono a la izquierda, titular grande y bajada */
export function Encabezado({ n, etiqueta, titulo, bajada, id, centro, apilado }: { n: string; etiqueta: string; titulo: React.ReactNode; bajada?: React.ReactNode; id?: string; centro?: boolean; apilado?: boolean }) {
  return (
    <div className={cn('mb-14 md:mb-20', centro ? 'mx-auto flex max-w-4xl flex-col items-center text-center' : apilado ? 'flex flex-col gap-8' : 'grid gap-8 md:grid-cols-[220px_1fr] md:gap-12')}>
      <Aparecer><Etiqueta n={n}>{etiqueta}</Etiqueta></Aparecer>
      <div className={cn('flex flex-col gap-6', centro && 'mt-6 items-center')}>
        <Aparecer i={1}><h2 id={id} className="t-titulo text-[clamp(38px,6.2vw,92px)]">{titulo}</h2></Aparecer>
        {bajada ? <Aparecer i={2}><p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{bajada}</p></Aparecer> : null}
      </div>
    </div>
  )
}

/** Flecha que se desplaza al pasar el cursor */
export function Flecha() { return <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true" /> }

/** Auto 3D de Lumine (motor propio en canvas, sin librerías) */
export function Escena3D({ opciones, className, etiqueta, alListo }: { opciones?: Record<string, unknown>; className?: string; etiqueta: string; alListo?: (api: Lab3DApi) => void }) {
  const host = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = host.current
    if (!el) return
    const a = Lab3D.crear(el, Object.assign({ hotspots: false, interactivo: true, etiqueta }, opciones || {}))
    alListo?.(a)
    return () => { a.destruir(); el.innerHTML = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div ref={host} className={cn('lab-stage', className)} />
}

export function irA(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

/* ---------- tema oscuro / claro ---------- */
export type Tema = 'oscuro' | 'claro'
export function temaInicial(): Tema {
  try { const t = localStorage.getItem('lumine-tema'); if (t === 'claro' || t === 'oscuro') return t } catch { /* sin almacenamiento */ }
  return 'oscuro'
}
export function aplicarTema(t: Tema) {
  document.documentElement.dataset.tema = t
  const m = document.querySelector('meta[name="theme-color"]')
  if (m) m.setAttribute('content', t === 'claro' ? '#f5f5f7' : '#020304')
  try { localStorage.setItem('lumine-tema', t) } catch { /* sin almacenamiento */ }
}
export function useTema() {
  const [tema, setTema] = React.useState<Tema>(() => (document.documentElement.dataset.tema as Tema) || 'oscuro')
  const cambiar = React.useCallback(() => setTema(t => { const n = t === 'oscuro' ? 'claro' : 'oscuro'; aplicarTema(n); return n }), [])
  return { tema, cambiar }
}
export function InterruptorTema({ className }: { className?: string }) {
  const { tema, cambiar } = useTema()
  const oscuro = tema === 'oscuro'
  return (
    <button type="button" onClick={cambiar} aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={oscuro ? 'Modo claro' : 'Modo oscuro'}
      className={cn('relative flex h-9 w-[68px] items-center rounded-full bg-control p-1 transition-colors hover:bg-line-2', className)}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 34 }} className={cn('grid size-7 place-items-center rounded-full bg-fg text-bg', oscuro ? 'ml-0' : 'ml-auto')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={tema} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {oscuro ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  )
}
