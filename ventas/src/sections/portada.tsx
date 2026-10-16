import * as React from 'react'
import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Aparecer, Escena3D, Etiqueta, Flecha, InterruptorTema, Logo, irA } from '@/components/comunes'
import { cn } from '@/lib/utils'
import { PIEZAS_PLANO, Plano } from '@/components/plano'

const LINKS: [string, string][] = [['como-funciona', 'Cómo funciona'], ['para-quien', 'Para quién'], ['ahorro', 'Ahorro'], ['compatibilidad', 'Compatibilidad'], ['preguntas', 'Preguntas']]

/* ---------- navegación: píldoras de instrumento (AWE) ---------- */
export function Nav() {
  const { scrollY } = useScroll()
  const [solido, setSolido] = React.useState(false)
  const [abierto, setAbierto] = React.useState(false)
  useMotionValueEvent(scrollY, 'change', v => setSolido(v > 40))
  React.useEffect(() => { document.body.style.overflow = abierto ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [abierto])
  const ir = (id: string) => { setAbierto(false); setTimeout(() => irA(id), abierto ? 250 : 0) }
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-500', solido && !abierto ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent')}>
      <nav aria-label="Principal" className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-5 md:px-10">
        <button type="button" onClick={() => { setAbierto(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Lumine Motors, volver arriba" className="shrink-0"><Logo /></button>
        <div className="mx-auto hidden items-center gap-2 lg:flex">
          {LINKS.map(([id, l], i) => (
            <button key={id} type="button" onClick={() => ir(id)} className="t-label flex h-9 items-center gap-2 rounded-full bg-control/70 px-4 text-fg transition-colors hover:bg-line-2">
              <span className="text-dim">0{i + 1}</span>{l}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <InterruptorTema />
          <Button size="sm" onClick={() => ir('agendar')} className="hidden sm:inline-flex">Agendar diagnóstico <Flecha /></Button>
          <Button size="icon" variant="pildora" className="lg:hidden" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto} onClick={() => setAbierto(a => !a)}>
            {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>
      <AnimatePresence>
        {abierto ? (
          <motion.div initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-x-0 bottom-0 top-[72px] flex flex-col justify-between bg-bg px-5 pb-8 pt-6 lg:hidden">
            <ul className="flex flex-col">
              {LINKS.map(([id, l], i) => (
                <motion.li key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="border-b border-line">
                  <button type="button" onClick={() => ir(id)} className="flex w-full items-baseline gap-4 py-4 text-left">
                    <span className="t-label text-accent-text">0{i + 1}</span><span className="t-titulo text-[34px]">{l}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <Button size="lg" onClick={() => ir('agendar')} className="w-full">Agendar diagnóstico <Flecha /></Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

/* ---------- portada: el auto frente a una palabra monumental ---------- */
const LECTURAS = [
  { k: 'Motor original', v: 'Intacto', c: 'left-5 bottom-[7%] md:left-10' },
  { k: 'Freno · ABS', v: 'Originales mandan', c: 'right-5 top-[30%] text-right md:right-10' },
  { k: 'Eje trasero', v: 'Asistencia eléctrica', c: 'right-5 bottom-[7%] text-right md:right-10' },
]
export function Hero() {
  const quieto = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yPalabra = useTransform(scrollYProgress, [0, 1], [0, 220])
  const yAuto = useTransform(scrollYProgress, [0, 1], [0, -60])
  const escala = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const ocultar = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  return (
    <section ref={ref} className="grano relative flex min-h-[100svh] flex-col overflow-hidden bg-bg pt-[72px]" aria-labelledby="hero-t">
      <div className="rejilla absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" aria-hidden="true" />
      <div className="foco absolute inset-0" aria-hidden="true" />
      {/* encabezado del escenario */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] items-start justify-between px-5 pt-6 md:px-10">
        <Etiqueta punto>Kit de hibridación · Chile</Etiqueta>
        <span className="t-label hidden text-muted sm:block">LM—001 / Particulares y flotas</span>
      </div>
      {/* palabra monumental + auto */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <h1 id="hero-t" className="relative z-0 flex w-full flex-col items-center text-center">
          <motion.span initial={quieto ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="t-titulo text-[clamp(26px,4.2vw,64px)]">
            Tu auto, <span className="t-serif text-[1.15em] normal-case text-accent-text">ahora</span>
          </motion.span>
          <motion.span style={quieto ? undefined : { y: yPalabra }} className="block overflow-hidden px-2">
            <motion.span initial={quieto ? false : { y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="t-mono-xl block bg-[linear-gradient(180deg,var(--fg)_35%,color-mix(in_srgb,var(--fg)_10%,transparent)_92%)] bg-clip-text pt-[0.1em] text-[clamp(110px,27vw,430px)] text-transparent">
              Híbrido
            </motion.span>
          </motion.span>
        </h1>
        <motion.div style={quieto ? undefined : { y: yAuto, scale: escala }} className="absolute inset-x-0 bottom-[2%] top-[22%] z-10 md:top-[18%]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.5 }} className="absolute inset-0">
            <Escena3D className="absolute inset-0" etiqueta="Auto genérico en 3D con el kit Lumine en el eje trasero, en vista de rayos X" opciones={{ auto: true, xray: true }} alListo={a => a.vista(-0.95, 0.24, 6.3)} />
          </motion.div>
        </motion.div>
        {/* lecturas de instrumento */}
        <motion.div style={quieto ? undefined : { opacity: ocultar }} className="pointer-events-none absolute inset-0 z-20 max-sm:hidden" aria-hidden="true">
          {LECTURAS.map((l, i) => (
            <motion.div key={l.k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.2, duration: 0.8 }} className={cn('absolute flex flex-col gap-1', l.c)}>
              <span className="t-label-sm text-muted">{l.k}</span>
              <span className="t-label flex items-center gap-2 text-fg"><i className="parpadeo size-1.5 bg-accent" />{l.v}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* pie del escenario */}
      <motion.div style={quieto ? undefined : { opacity: ocultar }} className="relative z-30 mx-auto grid w-full max-w-[1440px] gap-6 border-t border-line px-5 py-6 md:grid-cols-[1fr_auto] md:items-end md:px-10 md:py-8">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Sumamos un motor eléctrico en el eje trasero de tu auto. Tu motor original queda intacto y una unidad de control con IA decide cuándo asistir.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.8 }} className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => irA('compatibilidad')}>¿Mi auto es compatible? <Flecha /></Button>
          <Button size="lg" variant="fantasma" onClick={() => irA('ahorro')}>Calcula tu gasto</Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------- manifiesto (voz editorial AWE) ---------- */
export function Manifiesto() {
  return (
    <section className="relative border-t border-line bg-bg py-28 md:py-44" aria-labelledby="mf-t">
      <div className="mx-auto max-w-[1200px] px-5 text-center md:px-10">
        <Aparecer><Etiqueta n="00">Manifiesto</Etiqueta></Aparecer>
        <Aparecer i={1}>
          <h2 id="mf-t" className="mt-10 font-display text-[clamp(40px,7vw,112px)] font-semibold uppercase leading-[0.92] tracking-[-0.03em] [font-stretch:95%]">
            No cambies de auto.<br /><span className="t-serif text-[1.08em] normal-case text-accent-text">Hazlo híbrido.</span>
          </h2>
        </Aparecer>
        <Aparecer i={2}><p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-muted">El auto que ya pagaste sigue siendo tuyo. Le sumamos asistencia eléctrica, la instala un duo de técnicos certificados y la medimos con telemetría.</p></Aparecer>
      </div>
      <div className="mx-auto mt-20 max-w-[1440px] px-5 md:mt-28 md:px-10">
        <div className="visor border border-line bg-surface">
          <i className="esq a" /><i className="esq b" /><i className="esq c" /><i className="esq d" />
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 md:px-6">
            <span className="t-label-sm flex items-center gap-2 text-muted"><i className="parpadeo size-1.5 bg-accent" />Plano · vista lateral</span>
            <span className="t-label-sm text-dim max-sm:hidden">LM—001 · Kit eje trasero</span>
          </div>
          <div className="overflow-hidden px-2 py-6 md:px-8 md:py-10"><Plano className="mx-auto block h-auto w-full max-w-[1200px] max-sm:-mx-[6%] max-sm:w-[112%] max-sm:max-w-none" /></div>
          <ul className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {PIEZAS_PLANO.map((p, i) => (
              <li key={p.n} className={cn('flex flex-col gap-1.5 border-line p-4 text-left md:p-6', i % 2 === 0 && 'border-r', i < 2 && 'max-lg:border-b', i === 1 && 'lg:border-r', i === 2 && 'lg:border-r')}>
                <span className="t-label-sm flex items-center gap-2"><span className={cn('px-1.5 py-0.5', i ? 'bg-accent text-accent-ink' : 'bg-control text-fg')}>{p.n}</span><span className="text-fg">{p.t}</span></span>
                <span className="text-sm leading-relaxed text-muted">{p.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- cifras: solo hechos del sistema, nada inventado ---------- */
function Contador({ a }: { a: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const visto = useInView(ref, { once: true, margin: '-15% 0px' })
  const quieto = useReducedMotion()
  React.useEffect(() => {
    const el = ref.current; if (!el || !visto) return
    if (quieto) { el.textContent = String(a); return }
    const c = animate(0, a, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: v => { el.textContent = String(Math.round(v)) } })
    return () => c.stop()
  }, [visto, a, quieto])
  return <span ref={ref}>0</span>
}
export function Cifras() {
  const c = [
    { n: 1, u: 'eje', d: 'El kit va solo en el eje trasero de tu auto.' },
    { n: 0, u: 'cambios', d: 'a tu motor a combustión y a tu tracción delantera.' },
    { n: 39, u: 'competencias', d: 'validadas en el taller a cada técnico instalador.' },
    { n: 4, u: 'niveles', d: 'de certificación técnica, de aprendiz a formador.' },
  ]
  return (
    <section className="border-t border-line bg-bg" aria-label="Lumine en cifras">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
        {c.map((x, i) => (
          <Aparecer i={i} key={x.u} className={cn('flex flex-col gap-4 border-line px-5 py-10 md:px-10 md:py-16', i % 2 === 0 && 'border-r', i < 2 && 'max-lg:border-b', i === 1 && 'lg:border-r', i === 2 && 'lg:border-r')}>
            <span className="t-label-sm text-dim">0{i + 1}</span>
            <span className="t-num text-[clamp(64px,9vw,140px)] leading-none"><Contador a={x.n} /></span>
            <span className="t-label text-accent-text">{x.u}</span>
            <span className="max-w-[26ch] text-sm leading-relaxed text-muted">{x.d}</span>
          </Aparecer>
        ))}
      </div>
    </section>
  )
}

export function Franja() {
  const items = ['Motor original intacto', 'Frenado regenerativo', 'Unidad de control con IA', 'Técnicos certificados', 'Pruebas previas a la certificación', 'Telemetría del ahorro real', 'Particulares y flotas']
  const fila = (oculta: boolean) => (
    <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden={oculta || undefined}>
      {items.map(t => <span key={t} className="t-mono-xl flex items-center gap-12 whitespace-nowrap text-[clamp(40px,6vw,88px)] contorno">{t}<i className="size-3 rotate-45 bg-accent" /></span>)}
    </div>
  )
  return (
    <div className="relative overflow-hidden border-y border-line bg-bg py-8">
      <p className="sr-only">{items.join(', ')}</p>
      <div className="flex w-max animate-[marquesina_60s_linear_infinite] motion-reduce:animate-none">{fila(false)}{fila(true)}</div>
    </div>
  )
}
