import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Aparecer, Encabezado, Escena3D, Etiqueta, PorConfirmar } from '@/components/comunes'
import type { Lab3DApi } from '@/lib/lab3d'
import { DATOS } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* ---------- Para quién: dos paneles enfrentados, particulares y flotas ---------- */
const PERFILES = [
  {
    k: 'A', l: 'Particulares',
    titulo: <>Gasta menos en bencina <span className="t-serif normal-case text-accent-text">sin cambiar de auto.</span></>,
    puntos: [
      { t: 'Menos combustible', d: 'El motor eléctrico asiste cuando más consume el auto: al partir y al acelerar.', dato: DATOS.ahorroPct ? `${DATOS.ahorroPct.min} a ${DATOS.ahorroPct.max}% menos` : null, que: 'Ahorro esperado' },
      { t: 'Tu mismo auto', d: 'Sin vender ni endeudarte. El motor original y la tracción delantera quedan como están.' },
      { t: 'Menos emisiones', d: 'Cada litro que no quemas es CO₂ que no sale por el escape.' },
      { t: 'Seguridad intacta', d: 'El freno, el ABS y el control de estabilidad originales siempre mandan sobre el kit.' },
    ],
  },
  {
    k: 'B', l: 'Flotas',
    titulo: <>Baja el costo por kilómetro <span className="t-serif normal-case text-accent-text">de toda tu flota.</span></>,
    puntos: [
      { t: 'Ahorro que se multiplica', d: 'Los autos que más kilómetros hacen son los que más ganan con la asistencia eléctrica.' },
      { t: 'Medido, no prometido', d: 'La telemetría compara el ahorro real de cada vehículo con el estimado.' },
      { t: 'Instalación por etapas', d: 'Planificamos la flota por tandas para que la operación no se detenga.', dato: DATOS.instalacion, que: 'Tiempo de instalación' },
      { t: 'Postventa del kit', d: 'Mantención programada y recalibración según pauta, por los mismos técnicos certificados.' },
    ],
  },
]

export function ParaQuien() {
  return (
    <section id="para-quien" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="pq-t">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Encabezado n="02" etiqueta="Para quién" id="pq-t" titulo={<>Para quien maneja.<br /><span className="text-dim">Y para quien administra.</span></>} />
      </div>
      <div className="mx-auto grid max-w-[1440px] border-y border-line lg:grid-cols-2">
        {PERFILES.map((P, pi) => (
          <article key={P.k} className={cn('group relative flex flex-col overflow-hidden px-5 py-12 transition-colors duration-500 hover:bg-surface md:px-10 md:py-16', pi === 0 && 'border-line max-lg:border-b lg:border-r')} aria-labelledby={'pq-' + P.k}>
            <span className="t-mono-xl pointer-events-none absolute -right-4 -top-6 select-none text-[clamp(160px,22vw,300px)] contorno opacity-60 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">{P.k}</span>
            <Aparecer className="relative">
              <Etiqueta n={'0' + (pi + 1)}>{P.l}</Etiqueta>
            </Aparecer>
            <h3 id={'pq-' + P.k} className="t-titulo relative mt-8 max-w-[16ch] text-[clamp(30px,3.6vw,54px)]">{P.titulo}</h3>
            <ul className="relative mt-12 flex flex-col">
              {P.puntos.map((x, i) => (
                <motion.li key={x.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[44px_1fr] gap-4 border-t border-line py-5 md:grid-cols-[56px_1fr_auto]">
                  <span className="t-label-sm pt-1 text-dim">{P.k}.{i + 1}</span>
                  <div className="flex flex-col gap-1.5">
                    <b className="text-lg font-semibold">{x.t}</b>
                    <p className="max-w-md text-[15px] leading-relaxed text-muted">{x.d}</p>
                  </div>
                  {'que' in x ? <div className="col-start-2 md:col-start-3 md:pt-1">{x.dato ? <span className="t-num text-2xl text-accent-text">{x.dato}</span> : <PorConfirmar que={x.que} />}</div> : null}
                </motion.li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Cómo funciona: el kit se arma en 3D al bajar, dentro de un visor ---------- */
const PASOS = [
  { k: 'Tu auto', t: 'Llega tal como es.', d: 'Motor a combustión y tracción delantera, sin cambios. El kit se suma: no reemplaza nada.', piezas: [] as string[], foco: 'combustion' },
  { k: 'Eje trasero', t: 'Motor eléctrico y frenado regenerativo.', d: 'Asiste al partir y al acelerar, y recupera energía cada vez que frenas.', piezas: ['motor', 'regen'], foco: 'motor' },
  { k: 'Energía', t: 'Banco de baterías.', d: 'Guarda la energía que recupera el frenado y la entrega al motor eléctrico.', piezas: ['bateria'], foco: 'bateria' },
  { k: 'Alta tensión', t: 'Cableado protegido.', d: 'Rutas, fijaciones y protecciones. Se mide la aislación y se revisa con termografía antes de entregar.', piezas: ['cables'], foco: 'cables' },
  { k: 'Inteligencia', t: 'Unidad de control con IA.', d: 'Decide cuándo asistir y corta el torque ante patinaje, falla o sobretemperatura. El freno y el ABS originales siempre mandan.', piezas: ['ecu'], foco: 'ecu' },
  { k: 'Resultado', t: 'Tu auto, ahora híbrido.', d: 'Pruebas previas a la certificación, informe técnico firmado y telemetría para medir el ahorro real.', piezas: [], foco: null },
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
  const nn = (i: number) => String(i + 1).padStart(2, '0')
  return (
    <section id="como-funciona" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="cf-t">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Encabezado n="01" etiqueta="Cómo funciona" id="cf-t" titulo={<>Baja y míralo <span className="t-serif normal-case text-accent-text">armarse.</span></>} bajada="Esto es lo que instala un duo de técnicos Lumine en tu auto, en el mismo orden en que se hace en el taller." />
        <div className="grid gap-0 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="sticky top-[76px] z-10 h-[42svh] min-h-[260px] lg:top-28 lg:h-[min(72svh,640px)]">
            <div className="visor grano relative h-full overflow-hidden border border-line bg-surface">
              <div className="rejilla absolute inset-0" aria-hidden="true" />
              <div className="foco absolute inset-0 opacity-70" aria-hidden="true" />
              {quieto ? null : <span className="barrido" aria-hidden="true" />}
              <Escena3D className="absolute inset-0" etiqueta="Recorrido 3D: el kit Lumine se arma pieza por pieza" opciones={{ auto: false, visibles: [] }} alListo={a => { api.current = a; a.vista(-1.2, 0.3, 7.4) }} />
              <i className="esq a" /><i className="esq b" /><i className="esq c" /><i className="esq d" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-line bg-bg/60 px-4 py-2.5 backdrop-blur-md" aria-hidden="true">
                <span className="t-label-sm flex items-center gap-2 text-muted"><i className="parpadeo size-1.5 bg-accent" />Visor de montaje</span>
                <span className="t-label-sm text-fg"><span className="text-accent-text">{nn(paso)}</span> / {nn(PASOS.length - 1)}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={paso} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="t-label absolute bottom-10 left-4 text-fg" aria-hidden="true">
                  {PASOS[paso].k}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-4 bottom-4 flex gap-1" aria-hidden="true">
                {PASOS.map((_, i) => <i key={i} className={cn('h-[3px] flex-1 transition-colors duration-500', i <= paso ? 'bg-accent' : 'bg-line-2')} />)}
              </div>
            </div>
          </div>
          <div>
            {PASOS.map((x, i) => (
              <div key={x.t} ref={el => { refs.current[i] = el }} data-i={i} className="flex min-h-[62svh] flex-col justify-end pb-[12svh] lg:min-h-[64svh] lg:justify-center lg:pb-0">
                <motion.div animate={quieto ? undefined : { opacity: paso === i ? 1 : 0.22 }} transition={{ duration: 0.45 }} className="flex flex-col gap-5 border-t border-line pt-6">
                  <span className="t-label flex items-center gap-3"><span className="text-accent-text">{nn(i)}</span><i className="h-px w-6 bg-line-2" /><span className="text-muted">{x.k}</span></span>
                  <h3 className="t-titulo text-[clamp(28px,3.2vw,46px)]">{x.t}</h3>
                  <p className="max-w-md text-lg leading-relaxed text-muted">{x.d}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
