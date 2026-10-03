import * as React from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { ArrowUp, CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react'
import { PromptButton, PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { Aparecer, Encabezado, Flecha, irA } from '@/components/comunes'
import { COMBUSTIBLES, DATOS, clp } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* número que se anima al cambiar */
function AnimNum({ valor, formato = clp }: { valor: number; formato?: (n: number) => string }) {
  const quieto = useReducedMotion()
  const mv = useMotionValue(valor)
  const txt = useTransform(mv, v => formato(v))
  React.useEffect(() => { if (quieto) { mv.set(valor); return } const c = animate(mv, valor, { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }); return () => c.stop() }, [valor, quieto, mv])
  return <motion.span>{txt}</motion.span>
}

/* control de instrumento: etiqueta mono, lectura grande, riel fino */
function Deslizador({ id, n, label, valor, set, min, max, paso = 1, unidad, ayuda }: { id: string; n: string; label: string; valor: number; set: (n: number) => void; min: number; max: number; paso?: number; unidad: string; ayuda?: string }) {
  const pct = ((valor - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="t-label flex items-center gap-3 text-muted"><span className="text-dim">{n}</span>{label}</label>
        <span className="t-num text-[34px] leading-none text-fg">{valor.toLocaleString('es-CL')}<small className="t-label-sm ml-2 text-muted">{unidad}</small></span>
      </div>
      <input id={id} type="range" min={min} max={max} step={paso} value={valor} onChange={e => set(Number(e.target.value))} aria-describedby={ayuda ? id + '-a' : undefined}
        className="rango" style={{ ['--p' as string]: pct + '%' }} />
      <div className="t-label-sm flex justify-between text-dim" aria-hidden="true"><span>{min.toLocaleString('es-CL')}</span><span>{max.toLocaleString('es-CL')}</span></div>
      {ayuda ? <span id={id + '-a'} className="text-sm text-muted">{ayuda}</span> : null}
    </div>
  )
}

/* selector segmentado de bordes rectos */
function Segmentos<T extends string>({ valor, set, ops, etiqueta, id }: { valor: T; set: (v: T) => void; ops: [T, string][]; etiqueta: string; id: string }) {
  return (
    <div role="tablist" aria-label={etiqueta} className="grid grid-cols-2 border border-line-2 p-1">
      {ops.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={valor === k} onClick={() => set(k)} className={cn('t-label relative h-11 transition-colors', valor === k ? 'text-accent-ink' : 'text-muted hover:text-fg')}>
          {valor === k ? <motion.span layoutId={id} className="absolute inset-0 bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 36 }} /> : null}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------- Calculadora: lo que gastas hoy y lo que ahorras con el kit ---------- */
const AHORRO = (DATOS.ahorroPct ?? 20) / 100
export function Calculadora() {
  const [tipo, setTipo] = React.useState<'particular' | 'flota'>('particular')
  const [comb, setComb] = React.useState<string>(COMBUSTIBLES.tipos[0].k)
  const [precio, setPrecio] = React.useState<number>(COMBUSTIBLES.tipos[0].precio)
  const [km, setKm] = React.useState(40)
  const [dias, setDias] = React.useState(5)
  const [rend, setRend] = React.useState(12)
  const [autos, setAutos] = React.useState(20)
  const flota = tipo === 'flota'
  const cambiarTipo = (t: 'particular' | 'flota') => { setTipo(t); if (t === 'flota') { setKm(180); setDias(6) } else { setKm(40); setDias(5) } }
  const C = COMBUSTIBLES.tipos.find(x => x.k === comb) ?? COMBUSTIBLES.tipos[0]
  const elegir = (k: string) => { const x = COMBUSTIBLES.tipos.find(t => t.k === k)!; setComb(k); setPrecio(x.precio) }
  const n = flota ? autos : 1
  const litrosMes = (km * dias * 4.33 / Math.max(1, rend)) * n
  const gastoMes = litrosMes * precio
  const ahorroMes = gastoMes * AHORRO
  const conLumine = gastoMes - ahorroMes
  const co2Anio = litrosMes * AHORRO * 12 * C.co2
  const entero = (v: number) => Math.round(v).toLocaleString('es-CL')
  return (
    <section id="ahorro" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="ah-t">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Encabezado n="03" etiqueta="Ahorro" id="ah-t" titulo={<>Calcula lo que <span className="t-serif normal-case text-accent-text">dejas de gastar.</span></>} bajada={<>Con tus datos y el precio de hoy. Estimamos un <b className="font-semibold text-fg">{Math.round(AHORRO * 100)}% menos de combustible</b> con el kit; el cálculo es solo tuyo, no se guarda ni se envía.</>} />
        <div className="grid border border-line lg:grid-cols-[0.95fr_1.15fr]">
          {/* entrada */}
          <Aparecer className="flex flex-col gap-6 border-line bg-surface p-5 max-lg:border-b md:p-10 lg:border-r">
            <Segmentos id="calc-seg" etiqueta="Tipo de uso" valor={tipo} set={cambiarTipo} ops={[['particular', 'Mi auto'], ['flota', 'Mi flota']]} />
            <fieldset className="flex flex-col gap-3 border-t border-line pt-5">
              <legend className="t-label mb-3 flex items-center gap-3 text-muted"><span className="text-dim">01</span>Combustible y precio de hoy</legend>
              <div className="grid grid-cols-4 gap-1">
                {COMBUSTIBLES.tipos.map(x => (
                  <button key={x.k} type="button" aria-pressed={comb === x.k} onClick={() => elegir(x.k)}
                    className={cn('flex flex-col items-start gap-1 border px-3 py-2.5 text-left transition-colors', comb === x.k ? 'border-accent bg-accent/10' : 'border-line-2 hover:border-fg')}>
                    <span className={cn('t-label', comb === x.k ? 'text-accent-text' : 'text-fg')}>{x.l}</span>
                    <span className="t-label-sm text-muted">${x.precio.toLocaleString('es-CL')}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-baseline gap-2 border-b border-line-2 transition-colors focus-within:border-accent">
                <label htmlFor="c-precio" className="t-label-sm shrink-0 text-muted">Precio litro $</label>
                <input id="c-precio" type="number" inputMode="numeric" min={500} max={3000} value={precio} onChange={e => setPrecio(Math.max(0, Number(e.target.value) || 0))} className="t-num h-12 w-full bg-transparent text-right text-[30px] text-fg outline-none" />
              </div>
              <span className="text-xs leading-relaxed text-dim">{COMBUSTIBLES.fuente}, al {COMBUSTIBLES.fecha}. Si tu bencinera cobra distinto, cámbialo.</span>
            </fieldset>
            {flota ? <Deslizador id="c-autos" n="02" label="Vehículos" valor={autos} set={setAutos} min={2} max={300} unidad="autos" /> : null}
            <Deslizador id="c-km" n={flota ? '03' : '02'} label={flota ? 'Km al día, por auto' : 'Km al día'} valor={km} set={setKm} min={5} max={flota ? 500 : 200} paso={5} unidad="km" />
            <Deslizador id="c-dias" n={flota ? '04' : '03'} label="Días por semana" valor={dias} set={setDias} min={1} max={7} unidad="días" />
            <Deslizador id="c-rend" n={flota ? '05' : '04'} label="Rendimiento" valor={rend} set={setRend} min={5} max={25} unidad="km/L" ayuda="Lo que rinde hoy tu auto en ciudad." />
          </Aparecer>
          {/* lectura */}
          <Aparecer i={1} className="grano relative flex flex-col overflow-hidden bg-well">
            <div className="foco absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative flex items-center justify-between border-b border-line px-5 py-3 md:px-10">
              <span className="t-label-sm flex items-center gap-2 text-muted"><i className="parpadeo size-1.5 bg-accent" />Lectura en vivo</span>
              <span className="t-label-sm text-dim max-sm:hidden">{flota ? n + ' vehículos' : '1 vehículo'} · {C.l === 'Diésel' ? 'diésel' : 'bencina ' + C.l}</span>
            </div>
            <div className="relative flex flex-1 flex-col gap-9 p-5 md:p-10">
              <div aria-live="polite">
                <span className="t-label text-muted">{flota ? 'Tu flota ahorra' : 'Ahorras'} con Lumine</span>
                <p className="t-num mt-4 text-[clamp(60px,8.5vw,136px)] leading-[0.85] text-accent-text" data-ahorro-mes><AnimNum valor={ahorroMes} /></p>
                <p className="t-label mt-3 text-muted">al mes · <span className="text-fg"><AnimNum valor={ahorroMes * 12} /></span> al año</p>
              </div>
              {/* comparación hoy / con Lumine */}
              <div className="flex flex-col gap-4">
                {[
                  { l: 'Hoy gastas', v: gastoMes, w: 1, c: 'bg-fg/80' },
                  { l: 'Con Lumine', v: conLumine, w: 1 - AHORRO, c: 'bg-accent' },
                ].map(b => (
                  <div key={b.l} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-4"><span className="t-label-sm text-muted">{b.l}</span><span className="t-num text-2xl leading-none text-fg"><AnimNum valor={b.v} /><small className="t-label-sm ml-1.5 text-muted">/mes</small></span></div>
                    <div className="relative h-3 bg-line"><motion.i className={cn('absolute inset-y-0 left-0', b.c)} initial={{ width: 0 }} whileInView={{ width: b.w * 100 + '%' }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} /></div>
                  </div>
                ))}
                <span className="t-label-sm self-end text-accent-text">−{Math.round(AHORRO * 100)}% de combustible</span>
              </div>
              <dl className="grid border-y border-line sm:grid-cols-3">
                {[
                  { k: 'Litros menos', v: <AnimNum valor={litrosMes * AHORRO} formato={entero} />, u: 'al mes' },
                  { k: 'CO₂ evitado', v: <AnimNum valor={co2Anio} formato={v => entero(v)} />, u: 'kg al año' },
                  { k: 'En 5 años', v: <AnimNum valor={ahorroMes * 60} />, u: 'a precio de hoy' },
                ].map((x, i) => (
                  <div key={x.k} className={cn('grid min-w-0 grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 py-4 sm:flex sm:flex-col sm:gap-2 sm:py-5', i > 0 && 'border-line max-sm:border-t sm:border-l sm:pl-3 md:pl-5', i < 2 && 'sm:pr-3')}>
                    <dt className="t-label-sm text-muted">{x.k}</dt>
                    <dd className="t-num row-span-2 truncate text-right text-[clamp(24px,2.4vw,34px)] leading-none sm:text-left">{x.v}</dd>
                    <span className="t-label-sm text-dim">{x.u}</span>
                  </div>
                ))}
              </dl>
              <p className="text-xs leading-relaxed text-dim">Estimación con {Math.round(AHORRO * 100)}% menos de combustible. El ahorro real depende de tu ruta y de cómo manejas: lo confirmamos en el diagnóstico y lo medimos en tu auto con telemetría.</p>
              <Button size="lg" className="mt-auto w-full" onClick={() => irA('compatibilidad')}>Ver si mi auto es compatible <Flecha /></Button>
            </div>
          </Aparecer>
        </div>
      </div>
    </section>
  )
}

/* ---------- Verificador de compatibilidad (guiado, sin IA) ---------- */
type Msg = { de: 'bot' | 'yo'; texto: React.ReactNode; id: number }
type Resp = { auto?: string; anio?: number; traccion?: 'si' | 'no' | 'nose'; km?: 'bajo' | 'medio' | 'alto'; tipo?: 'particular' | 'flota' }
const MARCAS = ['toyota', 'chevrolet', 'hyundai', 'kia', 'nissan', 'suzuki', 'peugeot', 'renault', 'mazda', 'volkswagen', 'ford', 'honda', 'mitsubishi', 'citroen', 'citroën', 'fiat', 'chery', 'mg', 'great wall', 'jac', 'subaru', 'skoda', 'seat', 'opel', 'dodge', 'jeep', 'ssangyong', 'byd', 'changan', 'geely', 'haval', 'dfsk', 'baic', 'mahindra']
const PREGUNTAS = {
  traccion: { q: '¿Es de tracción delantera? Si no sabes, no pasa nada.', ops: [['si', 'Sí, delantera'], ['no', 'No, trasera o 4x4'], ['nose', 'No sé']] as [string, string][] },
  km: { q: '¿Cuántos kilómetros recorre al día, más o menos?', ops: [['bajo', 'Menos de 30 km'], ['medio', '30 a 80 km'], ['alto', 'Más de 80 km']] as [string, string][] },
  tipo: { q: '¿Es para ti o para una flota?', ops: [['particular', 'Para mí'], ['flota', 'Para una flota']] as [string, string][] },
}
type Paso = 'auto' | keyof typeof PREGUNTAS | 'fin'

export function Compatibilidad() {
  const [msgs, setMsgs] = React.useState<Msg[]>([])
  const [paso, setPaso] = React.useState<Paso>('auto')
  const [r, setR] = React.useState<Resp>({})
  const [texto, setTexto] = React.useState('')
  const [escribiendo, setEscribiendo] = React.useState(false)
  const lista = React.useRef<HTMLDivElement>(null)
  const nid = React.useRef(0)
  const gen = React.useRef(0) // cada reinicio invalida las respuestas pendientes
  const quieto = useReducedMotion()
  const decir = React.useCallback((de: Msg['de'], t: React.ReactNode) => setMsgs(m => [...m, { de, texto: t, id: ++nid.current }]), [])
  const bot = React.useCallback((t: React.ReactNode, luego?: () => void) => {
    setEscribiendo(true)
    const g = gen.current
    window.setTimeout(() => { if (g !== gen.current) return; setEscribiendo(false); decir('bot', t); luego?.() }, quieto ? 50 : 650)
  }, [decir, quieto])
  const iniciar = React.useCallback(() => {
    gen.current++; setMsgs([]); setR({}); setPaso('auto'); setTexto(''); setEscribiendo(false)
    bot(<>Hola. Te digo en un minuto si tu auto puede llevar el kit. <b>¿Qué auto tienes?</b> Marca, modelo y año, por ejemplo «Toyota Yaris 2016».</>)
  }, [bot])
  React.useEffect(() => { iniciar() }, [iniciar])
  React.useEffect(() => { const el = lista.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: quieto ? 'auto' : 'smooth' }) }, [msgs, escribiendo, quieto])

  const preguntar = (p: keyof typeof PREGUNTAS) => { setPaso(p); bot(PREGUNTAS[p].q) }
  const enviarAuto = () => {
    const t = texto.trim(); if (t.length < 2 || paso !== 'auto') return
    decir('yo', t); setTexto('')
    const anio = Number((t.match(/\b(19[5-9]\d|20[0-4]\d)\b/) || [])[1]) || undefined
    const marca = MARCAS.find(m => t.toLowerCase().includes(m))
    setR(x => ({ ...x, auto: t, anio }))
    const eco = marca ? `Anotado: ${marca.replace(/^./, c => c.toUpperCase())}${anio ? ' ' + anio : ''}.` : 'Anotado.'
    bot(eco, () => preguntar('traccion'))
  }
  const elegir = (p: keyof typeof PREGUNTAS, v: string, l: string) => {
    decir('yo', l)
    const nr = { ...r, [p]: v } as Resp
    setR(nr)
    if (p === 'traccion' && v === 'no') { setPaso('fin'); bot(<Resultado r={nr} />); return }
    if (p === 'traccion') preguntar('km')
    else if (p === 'km') preguntar('tipo')
    else { setPaso('fin'); bot(<Resultado r={nr} />) }
  }
  const ops = paso !== 'auto' && paso !== 'fin' && !escribiendo ? PREGUNTAS[paso].ops : null
  return (
    <section id="compatibilidad" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="co-t">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Encabezado n="04" etiqueta="Compatibilidad" id="co-t" titulo={<>¿Tu auto <span className="t-serif normal-case text-accent-text">puede?</span></>} bajada="Tres preguntas y te decimos si tu auto es candidato. Sin registrarte." apilado />
          <ol className="flex flex-col">
            {['El kit va en el eje trasero de autos con tracción delantera.', 'El modelo tiene que estar en nuestra biblioteca de calibraciones: eso lo confirmamos en el diagnóstico.', 'Autos con ABS, airbags y control de estabilidad sí pueden: esos sistemas siguen mandando.'].map((t, i) => (
              <Aparecer as="li" i={i} key={t} className="grid grid-cols-[44px_1fr] gap-3 border-t border-line py-5 text-[15px] leading-relaxed text-muted">
                <span className="t-label-sm pt-1 text-accent-text">R{i + 1}</span>{t}
              </Aparecer>
            ))}
          </ol>
        </div>
        <Aparecer i={1} className="visor flex h-[min(680px,82svh)] min-h-[500px] flex-col border border-line bg-surface">
          <i className="esq a" /><i className="esq b" /><i className="esq c" /><i className="esq d" />
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="flex flex-col gap-0.5"><span className="t-label flex items-center gap-2 text-fg"><i className="parpadeo size-1.5 bg-accent" />Verificador Lumine</span><small className="t-label-sm text-dim">Guiado · no usa IA ni guarda datos</small></span>
            <Button size="sm" variant="fantasma" onClick={iniciar} aria-label="Empezar de nuevo"><RotateCcw className="size-4" /> Reiniciar</Button>
          </div>
          <div ref={lista} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 md:px-5" role="log" aria-live="polite" aria-label="Conversación del verificador">
            <AnimatePresence initial={false}>
              {msgs.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                  className={cn('max-w-[88%] px-4 py-3 text-[15px] leading-relaxed', m.de === 'bot' ? 'self-start border-l-2 border-accent bg-well' : 'self-end bg-accent font-medium text-accent-ink')}>
                  {m.texto}
                </motion.div>
              ))}
              {escribiendo ? (
                <motion.div key="esc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1.5 self-start border-l-2 border-accent bg-well px-4 py-4" aria-label="Escribiendo">
                  {[0, 1, 2].map(i => <motion.i key={i} className="size-1.5 bg-muted" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="border-t border-line p-3 md:p-4">
            {ops ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {ops.map(([v, l]) => (
                  <motion.button key={v} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => elegir(paso as keyof typeof PREGUNTAS, v, l)}
                    className="t-label min-h-11 border border-accent/50 px-4 py-2 text-accent-text transition-colors hover:bg-accent hover:text-accent-ink">{l}</motion.button>
                ))}
              </div>
            ) : null}
            {paso === 'fin' && !escribiendo ? (
              <div className="flex flex-wrap gap-2">
                <Button className="flex-1" onClick={() => { window.dispatchEvent(new CustomEvent('lumine:prefill', { detail: r })); irA('agendar') }}>Agendar diagnóstico <Flecha /></Button>
                <Button variant="borde" onClick={iniciar}><RotateCcw className="size-4" /> Otro auto</Button>
              </div>
            ) : (
              <PromptInput value={texto} onValueChange={setTexto} onSubmit={enviarAuto} disabled={paso !== 'auto' || escribiendo} className="focus-within:border-accent">
                <PromptInputTextarea placeholder={paso === 'auto' ? 'Marca, modelo y año de tu auto' : 'Elige una opción arriba'} aria-label="Marca, modelo y año de tu auto" />
                <PromptInputActions className="justify-end px-1 pb-1">
                  <PromptInputAction tooltip="Enviar">
                    <PromptButton type="button" size="icon" aria-label="Enviar" onClick={enviarAuto} disabled={paso !== 'auto' || texto.trim().length < 2}
                      className={cn('size-9 rounded-none transition-all', texto.trim().length >= 2 ? 'bg-accent text-accent-ink hover:bg-accent' : 'bg-control text-muted hover:bg-control')}>
                      <ArrowUp className="size-4" />
                    </PromptButton>
                  </PromptInputAction>
                </PromptInputActions>
              </PromptInput>
            )}
          </div>
        </Aparecer>
      </div>
    </section>
  )
}

function Resultado({ r }: { r: Resp }) {
  const auto = r.auto || 'tu auto'
  if (r.traccion === 'no') return (
    <div className="flex flex-col gap-2">
      <span className="t-label inline-flex items-center gap-2 text-warn"><XCircle className="size-5" aria-hidden="true" /> Por ahora, no</span>
      <span>El kit va en el eje trasero y necesita que {auto} sea de tracción delantera. Si te equivocaste, reinicia: en el diagnóstico lo revisamos igual.</span>
    </div>
  )
  const seguro = r.traccion === 'si'
  return (
    <div className="flex flex-col gap-3">
      <span className={cn('t-label inline-flex items-center gap-2', seguro ? 'text-ok' : 'text-accent-text')}>{seguro ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <CircleHelp className="size-5" aria-hidden="true" />}{seguro ? 'Buen candidato' : 'Puede ser candidato'}</span>
      <span>{seguro ? `${auto} cumple lo básico.` : `Revisamos la tracción de ${auto} en el diagnóstico.`} Lo último que confirmamos es que su modelo esté en nuestra biblioteca de calibraciones.</span>
      {r.km === 'bajo' ? <span className="text-muted">Con poco uso diario el ahorro es menor. Si no te conviene, el diagnóstico te lo dice con evidencia y no instalamos.</span> : null}
      {r.km === 'alto' ? <span className="text-muted">Con muchos kilómetros al día, cada punto de ahorro pesa más en tu bolsillo.</span> : null}
      {r.tipo === 'flota' ? <span className="text-muted">Para flotas armamos un plan por etapas, sin detener tu operación.</span> : null}
    </div>
  )
}
