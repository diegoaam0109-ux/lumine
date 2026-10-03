import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Activity, BatteryCharging, Building2, Cable, Car, CalendarClock, Cpu, Gauge, Leaf, Route, ShieldCheck, Truck, Wallet, Zap } from 'lucide-react'
import { Encabezado, Escena3D, PorConfirmar } from '@/components/comunes'
import type { Lab3DApi } from '@/lib/lab3d'
import { DATOS } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* ---------- Para quién: particulares y flotas ---------- */
const PERFILES = {
  particular: {
    l: 'Particulares', ic: Car,
    titulo: 'Gasta menos en bencina sin cambiar de auto.',
    puntos: [
      { ic: Wallet, t: 'Menos combustible', d: 'El motor eléctrico asiste cuando más consume el auto: al partir y al acelerar.', dato: DATOS.ahorroPct ? `${DATOS.ahorroPct.min} a ${DATOS.ahorroPct.max}% menos` : null, que: 'Ahorro esperado' },
      { ic: Car, t: 'Tu mismo auto', d: 'Sin vender, sin endeudarte en un auto nuevo. El motor original y la tracción delantera quedan como están.' },
      { ic: Leaf, t: 'Menos emisiones', d: 'Cada litro que no quemas es CO₂ que no sale por el escape.' },
      { ic: ShieldCheck, t: 'Seguridad intacta', d: 'El freno, el ABS y el control de estabilidad originales siempre mandan sobre el kit.' },
    ],
  },
  flota: {
    l: 'Flotas', ic: Truck,
    titulo: 'Baja el costo por kilómetro de toda tu flota.',
    puntos: [
      { ic: Gauge, t: 'Ahorro que se multiplica', d: 'Los autos que más kilómetros hacen son los que más ganan con la asistencia eléctrica.' },
      { ic: Activity, t: 'Ahorro medido, no prometido', d: 'La telemetría compara el ahorro real de cada vehículo con el estimado.' },
      { ic: CalendarClock, t: 'Instalación por etapas', d: 'Planificamos la flota por tandas para que la operación no se detenga.', dato: DATOS.instalacion, que: 'Tiempo de instalación' },
      { ic: Building2, t: 'Postventa del kit', d: 'Mantención programada y recalibración según pauta, por los mismos técnicos certificados.' },
    ],
  },
} as const
type Perfil = keyof typeof PERFILES

export function ParaQuien() {
  const [p, setP] = React.useState<Perfil>('particular')
  const P = PERFILES[p]
  return (
    <section id="flotas" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32" aria-labelledby="pq-t">
      <Encabezado id="pq-t" eyebrow="Para quién" titulo={<>Para quien maneja.<br /><span className="text-brand">Y para quien administra.</span></>} />
      <div role="tablist" aria-label="Tipo de cliente" className="vidrio mb-10 inline-flex rounded-full p-1.5">
        {(Object.keys(PERFILES) as Perfil[]).map(k => {
          const X = PERFILES[k]
          return (
            <button key={k} role="tab" aria-selected={p === k} onClick={() => setP(k)} className={cn('relative inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors', p === k ? 'text-[#041016]' : 'text-muted-foreground hover:text-foreground')}>
              {p === k ? <motion.span layoutId="pq-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 380, damping: 32 }} /> : null}
              <X.ic className="relative size-4" aria-hidden="true" /><span className="relative">{X.l}</span>
            </button>
          )
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={p} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
          <h3 className="mb-8 max-w-2xl font-display text-3xl font-extrabold [font-stretch:110%] md:text-4xl">{P.titulo}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {P.puntos.map((x, i) => (
              <motion.article key={x.t} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.45 }}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-card p-6 transition-colors hover:border-brand/50">
                <span className="absolute -right-10 -top-10 size-32 rounded-full bg-brand/10 blur-2xl transition-opacity group-hover:opacity-100 md:opacity-0" aria-hidden="true" />
                <span className="grid size-11 place-items-center rounded-2xl bg-brand/12 text-brand"><x.ic className="size-5" aria-hidden="true" /></span>
                <b className="text-lg">{x.t}</b>
                <p className="text-sm leading-relaxed text-muted-foreground">{x.d}</p>
                {'que' in x ? <div className="mt-auto pt-2">{x.dato ? <span className="font-display text-2xl font-extrabold text-brand">{x.dato}</span> : <PorConfirmar que={x.que} />}</div> : null}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

/* ---------- Cómo funciona: el kit se arma en 3D al bajar ---------- */
const PASOS = [
  { k: 'Tu auto', t: 'Llega tal como es.', d: 'Motor a combustión y tracción delantera, sin cambios. El kit se suma: no reemplaza nada.', piezas: [] as string[], foco: 'combustion', ic: Car },
  { k: 'Eje trasero', t: 'Motor eléctrico y frenado regenerativo.', d: 'Asiste al partir y al acelerar, y recupera energía cada vez que frenas.', piezas: ['motor', 'regen'], foco: 'motor', ic: Zap },
  { k: 'Energía', t: 'Banco de baterías.', d: 'Guarda la energía que recupera el frenado y la entrega al motor eléctrico.', piezas: ['bateria'], foco: 'bateria', ic: BatteryCharging },
  { k: 'Alta tensión', t: 'Cableado protegido.', d: 'Rutas, fijaciones y protecciones. Se mide la aislación y se revisa con termografía antes de entregar.', piezas: ['cables'], foco: 'cables', ic: Cable },
  { k: 'Inteligencia', t: 'Unidad de control con IA.', d: 'Decide cuándo asistir y corta el torque ante patinaje, falla o sobretemperatura. El freno y el ABS originales siempre mandan.', piezas: ['ecu'], foco: 'ecu', ic: Cpu },
  { k: 'Resultado', t: 'Tu auto, ahora híbrido.', d: 'Pruebas previas a la certificación, informe técnico firmado y telemetría para medir el ahorro real.', piezas: [], foco: null, ic: Route },
]

export function ComoFunciona() {
  const quieto = useReducedMotion()
  const api = React.useRef<Lab3DApi | null>(null)
  const [paso, setPaso] = React.useState(0)
  const refs = React.useRef<(HTMLDivElement | null)[]>([])
  React.useEffect(() => {
    const movil = window.matchMedia('(max-width: 1023px)').matches
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) setPaso(Number((e.target as HTMLElement).dataset.i)) }, { rootMargin: movil ? '-66% 0px -24% 0px' : '-45% 0px -45% 0px' })
    refs.current.forEach(r => r && io.observe(r))
    return () => io.disconnect()
  }, [])
  React.useEffect(() => {
    const a = api.current; if (!a) return
    a.mostrar(PASOS.slice(0, paso + 1).flatMap(x => x.piezas))
    PASOS[paso].piezas.forEach((pz, k) => setTimeout(() => a.aparecer(pz), k * 300))
    a.modo({ xray: paso > 0 })
    const f = PASOS[paso].foco
    if (f) a.enfocar(f); else { a.soltar(); a.vista(-0.75, 0.32, 7.4) }
    if (paso === 0) a.vista(-1.2, 0.3, 7.4)
  }, [paso])
  return (
    <section id="como-funciona" className="relative scroll-mt-24 border-t border-white/10 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(34,184,240,0.08),transparent_70%)] py-24 md:py-32" aria-labelledby="cf-t">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Encabezado id="cf-t" eyebrow="Cómo funciona" titulo={<>Baja y míralo <span className="text-brand">armarse.</span></>} bajada="Esto es lo que instala un duo de técnicos Lumine en tu auto, en el mismo orden en que se hace en el taller." />
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="sticky top-20 z-10 h-[42svh] min-h-[260px] lg:top-28 lg:h-[min(70svh,600px)]">
            <div className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#070b0e] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(34,184,240,0.14),transparent_70%)]" aria-hidden="true" />
              <Escena3D className="absolute inset-0" etiqueta="Recorrido 3D: el kit Lumine se arma pieza por pieza" opciones={{ auto: false, visibles: [] }} alListo={a => { api.current = a; a.vista(-1.2, 0.3, 7.4) }} />
              <div className="absolute inset-x-4 bottom-4 flex gap-1.5" aria-hidden="true">
                {PASOS.map((_, i) => <motion.i key={i} className="h-1 flex-1 rounded-full bg-white/15" animate={{ backgroundColor: i <= paso ? '#22B8F0' : 'rgba(255,255,255,0.15)' }} transition={{ duration: 0.4 }} />)}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={paso} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="vidrio absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  {String(paso + 1).padStart(2, '0')} · {PASOS[paso].k}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div>
            {PASOS.map((x, i) => (
              <div key={x.t} ref={el => { refs.current[i] = el }} data-i={i} className="flex min-h-[62svh] flex-col justify-end pb-[12svh] lg:min-h-[64svh] lg:justify-center lg:pb-0">
                <motion.div animate={quieto ? undefined : { opacity: paso === i ? 1 : 0.25, x: paso === i ? 0 : 12 }} transition={{ duration: 0.45 }} className="flex flex-col gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand/12 text-brand"><x.ic className="size-6" aria-hidden="true" /></span>
                  <span className="eyebrow">{String(i + 1).padStart(2, '0')} · {x.k}</span>
                  <h3 className="display text-[clamp(30px,3.6vw,48px)]">{x.t}</h3>
                  <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{x.d}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

