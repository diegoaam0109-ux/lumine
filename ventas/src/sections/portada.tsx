import * as React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BatteryCharging, Cpu, Menu, ShieldCheck, Wrench, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Escena3D, Logo, irA } from '@/components/comunes'
import { cn } from '@/lib/utils'

const LINKS: [string, string][] = [['como-funciona', 'Cómo funciona'], ['ahorro', 'Ahorro'], ['flotas', 'Flotas'], ['compatibilidad', 'Compatibilidad'], ['preguntas', 'Preguntas']]

export function Nav() {
  const { scrollY } = useScroll()
  const [solido, setSolido] = React.useState(false)
  const [abierto, setAbierto] = React.useState(false)
  useMotionValueEvent(scrollY, 'change', v => setSolido(v > 24))
  const ir = (id: string) => { setAbierto(false); irA(id) }
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
      <nav aria-label="Principal" className={cn('mx-auto flex h-16 max-w-7xl items-center gap-4 rounded-full px-4 transition-all duration-300 md:px-6', solido || abierto ? 'vidrio' : 'border border-transparent')}>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lumine Motors, volver arriba" className="shrink-0"><Logo /></button>
        <div className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => ir(id)} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">{l}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button size="sm" onClick={() => ir('agendar')} className="hidden sm:inline-flex">Agendar diagnóstico</Button>
          <Button size="icon" variant="fantasma" className="lg:hidden" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto} onClick={() => setAbierto(a => !a)}>
            {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>
      <AnimatePresence>
        {abierto ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="vidrio mx-auto mt-2 flex max-w-7xl flex-col gap-1 rounded-3xl p-3 lg:hidden">
            {LINKS.map(([id, l]) => <button key={id} type="button" onClick={() => ir(id)} className="rounded-2xl px-4 py-3.5 text-left text-base font-medium hover:bg-white/[0.06]">{l}</button>)}
            <Button size="lg" onClick={() => ir('agendar')} className="mt-1">Agendar diagnóstico</Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

const CHIPS = [
  { ic: Zap, k: 'Eje trasero', t: 'Motor eléctrico', c: 'left-[2%] top-[14%]', d: 0 },
  { ic: BatteryCharging, k: 'Al frenar', t: 'Recupera energía', c: 'right-[0%] top-[36%]', d: 0.6 },
  { ic: Cpu, k: 'Unidad de control', t: 'Decide cuándo asistir', c: 'left-[8%] bottom-[12%]', d: 1.2 },
]

export function Hero() {
  const quieto = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yAuto = useTransform(scrollYProgress, [0, 1], [0, 140])
  const opac = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const lineas = ['Tu auto.', 'Ahora', 'híbrido.']
  return (
    <section ref={ref} className="ambiente relative overflow-hidden pt-28 md:pt-32" aria-labelledby="hero-t">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 pb-16 md:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-24">
        <motion.div style={quieto ? undefined : { opacity: opac }} className="relative z-10 flex flex-col gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_12px_#22B8F0]" /> Kit de hibridación para tu auto actual
          </motion.span>
          <h1 id="hero-t" className="display text-[clamp(50px,7.6vw,112px)]">
            {lineas.map((l, i) => (
              <span key={l} className="-mt-[0.14em] block overflow-hidden pb-[0.04em] pt-[0.14em]">
                <motion.span className={cn('block', i === 2 && 'text-brand [text-shadow:0_0_42px_rgba(34,184,240,0.45)]')}
                  initial={quieto ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }} className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Sumamos un motor eléctrico en el eje trasero de tu auto. Tu motor original queda intacto y una unidad de control con IA decide, en cada momento, cuándo asistir.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => irA('compatibilidad')} className="group">
              ¿Mi auto es compatible? <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <button type="button" onClick={() => irA('ahorro')} className="text-base font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">Calcula cuánto gastas hoy</button>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }} className="mt-2 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-2"><Wrench className="size-4 text-brand" aria-hidden="true" /> No cambias de auto</li>
            <li className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-brand" aria-hidden="true" /> Freno y ABS originales mandan</li>
            <li className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-brand" aria-hidden="true" /> Técnicos certificados</li>
          </motion.ul>
        </motion.div>

        <motion.div style={quieto ? undefined : { y: yAuto }} className="relative aspect-square w-full max-lg:max-h-[440px] lg:aspect-[1/1.02]">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }} className="absolute inset-0">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(34,184,240,0.22),transparent_65%)] blur-2xl" aria-hidden="true" />
            <Escena3D className="absolute inset-0" etiqueta="Auto genérico en 3D con el kit Lumine en el eje trasero, en vista de rayos X" opciones={{ auto: true, xray: true }} alListo={a => a.vista(-0.95, 0.28, 6.9)} />
          </motion.div>
          {CHIPS.map(c => (
            <motion.div key={c.t} className={cn('vidrio pointer-events-none absolute z-10 flex items-center gap-3 rounded-2xl px-4 py-3 max-sm:scale-90', c.c)}
              initial={{ opacity: 0, y: 16 }} animate={quieto ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -10, 0] }}
              transition={quieto ? { duration: 0.4 } : { opacity: { duration: 0.6, delay: 0.9 + c.d * 0.3 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: c.d } }}>
              <span className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand"><c.ic className="size-5" aria-hidden="true" /></span>
              <span className="flex flex-col leading-tight"><small className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand">{c.k}</small><b className="text-sm">{c.t}</b></span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Franja />
    </section>
  )
}

function Franja() {
  const items = ['Motor original intacto', 'Frenado regenerativo', 'Unidad de control con IA', 'Instalación por técnicos certificados', 'Pruebas previas a la certificación', 'Telemetría del ahorro real', 'Particulares y flotas']
  const fila = (oculta: boolean) => (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={oculta || undefined}>
      {items.map(t => <span key={t} className="flex items-center gap-4 whitespace-nowrap font-display text-lg font-bold uppercase tracking-wide text-muted-foreground [font-stretch:115%] md:text-xl"><i className="size-2 rotate-45 rounded-[2px] bg-brand shadow-[0_0_10px_#22B8F0]" />{t}</span>)}
    </div>
  )
  return (
    <div className="relative border-y border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <p className="sr-only">{items.join(', ')}</p>
      <div className="flex w-max animate-[marquesina_40s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">{fila(false)}{fila(true)}</div>
    </div>
  )
}
