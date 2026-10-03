import * as React from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUp, Bot, Car, CheckCircle2, CircleHelp, RotateCcw, Truck, XCircle } from 'lucide-react'
import { PromptButton, PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from '@/components/ui/ai-prompt-box'
import { Button } from '@/components/ui/button'
import { Aparecer, Encabezado, PorConfirmar, irA } from '@/components/comunes'
import { DATOS, clp } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* número que se anima al cambiar */
function AnimNum({ valor, formato = clp }: { valor: number; formato?: (n: number) => string }) {
  const quieto = useReducedMotion()
  const mv = useMotionValue(valor)
  const txt = useTransform(mv, v => formato(v))
  React.useEffect(() => { if (quieto) { mv.set(valor); return } const c = animate(mv, valor, { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }); return () => c.stop() }, [valor, quieto, mv])
  return <motion.span>{txt}</motion.span>
}

function Deslizador({ id, label, valor, set, min, max, paso = 1, unidad, ayuda }: { id: string; label: string; valor: number; set: (n: number) => void; min: number; max: number; paso?: number; unidad: string; ayuda?: string }) {
  const pct = ((valor - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold">{label}</label>
        <span className="font-display text-xl font-extrabold tabular-nums [font-stretch:110%]">{valor.toLocaleString('es-CL')} <small className="text-sm font-semibold text-muted-foreground">{unidad}</small></span>
      </div>
      <input id={id} type="range" min={min} max={max} step={paso} value={valor} onChange={e => set(Number(e.target.value))} aria-describedby={ayuda ? id + '-a' : undefined}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#22B8F0] [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-[0_0_0_6px_rgba(34,184,240,0.2)]"
        style={{ background: `linear-gradient(90deg, #22B8F0 ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }} />
      {ayuda ? <span id={id + '-a'} className="text-xs text-muted-foreground">{ayuda}</span> : null}
    </div>
  )
}

/* ---------- Calculadora: cuánto gastas hoy y cuánto vale cada 10% ---------- */
export function Calculadora() {
  const [tipo, setTipo] = React.useState<'particular' | 'flota'>('particular')
  const [km, setKm] = React.useState(40)
  const [dias, setDias] = React.useState(5)
  const [rend, setRend] = React.useState(12)
  const [precio, setPrecio] = React.useState(1300)
  const [autos, setAutos] = React.useState(20)
  const cambiarTipo = (t: 'particular' | 'flota') => { setTipo(t); if (t === 'flota') { setKm(180); setDias(6) } else { setKm(40); setDias(5) } }
  const n = tipo === 'flota' ? autos : 1
  const kmMes = km * dias * 4.33
  const mes = (kmMes / Math.max(1, rend)) * precio * n
  const anual = mes * 12
  const cada10 = anual * 0.1
  const ahorro = DATOS.ahorroPct
  return (
    <section id="ahorro" className="relative scroll-mt-24 border-t border-white/10 py-24 md:py-32" aria-labelledby="ah-t">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Encabezado id="ah-t" eyebrow="Ahorro" titulo={<>Primero, mira cuánto <span className="text-brand">gastas hoy.</span></>} bajada="Mueve los controles con tus datos reales. El cálculo es solo tuyo: no se guarda ni se envía." />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <Aparecer className="flex flex-col gap-7 rounded-[28px] border border-white/10 bg-card p-6 md:p-8">
            <div role="tablist" aria-label="Tipo de uso" className="inline-flex self-start rounded-full bg-white/[0.05] p-1">
              {([['particular', 'Mi auto', Car], ['flota', 'Mi flota', Truck]] as const).map(([k, l, Ic]) => (
                <button key={k} role="tab" aria-selected={tipo === k} onClick={() => cambiarTipo(k)} className={cn('relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors', tipo === k ? 'text-[#041016]' : 'text-muted-foreground hover:text-foreground')}>
                  {tipo === k ? <motion.span layoutId="calc-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 380, damping: 32 }} /> : null}
                  <Ic className="relative size-4" aria-hidden="true" /><span className="relative">{l}</span>
                </button>
              ))}
            </div>
            {tipo === 'flota' ? <Deslizador id="c-autos" label="Vehículos en la flota" valor={autos} set={setAutos} min={2} max={300} unidad="autos" /> : null}
            <Deslizador id="c-km" label={tipo === 'flota' ? 'Kilómetros al día, por auto' : 'Kilómetros al día'} valor={km} set={setKm} min={5} max={tipo === 'flota' ? 500 : 200} paso={5} unidad="km" />
            <Deslizador id="c-dias" label="Días de uso a la semana" valor={dias} set={setDias} min={1} max={7} unidad="días" />
            <Deslizador id="c-rend" label="Rendimiento actual" valor={rend} set={setRend} min={5} max={25} unidad="km/L" ayuda="Lo que rinde hoy tu auto en ciudad." />
            <div className="flex flex-col gap-2">
              <label htmlFor="c-precio" className="text-sm font-semibold">Precio del litro de bencina</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-4 focus-within:border-brand">
                <span className="text-muted-foreground">$</span>
                <input id="c-precio" type="number" inputMode="numeric" min={500} max={3000} value={precio} onChange={e => setPrecio(Math.max(0, Number(e.target.value) || 0))} className="h-12 w-full bg-transparent text-lg font-semibold tabular-nums outline-none" />
              </div>
              <span className="text-xs text-muted-foreground">Ponle el precio de tu bencinera: cambia cada semana.</span>
            </div>
          </Aparecer>
          <Aparecer i={1} className="relative flex flex-col gap-6 overflow-hidden rounded-[28px] border border-brand/30 bg-[radial-gradient(600px_300px_at_100%_0%,rgba(34,184,240,0.22),transparent_70%)] bg-card p-6 md:p-8">
            <div>
              <span className="eyebrow">{tipo === 'flota' ? 'Tu flota gasta hoy' : 'Tu auto gasta hoy'}</span>
              <p className="mt-3 font-display text-[clamp(44px,6vw,76px)] font-extrabold leading-none tabular-nums [font-stretch:112%]"><AnimNum valor={mes} /><small className="ml-2 text-xl font-semibold text-muted-foreground">al mes</small></p>
              <p className="mt-2 text-lg text-muted-foreground"><AnimNum valor={anual} /> al año en combustible</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-sm text-muted-foreground">Cada 10% de ahorro equivale a</span>
              <p className="mt-1 font-display text-3xl font-extrabold text-brand tabular-nums [font-stretch:110%]"><AnimNum valor={cada10} /> <small className="text-base font-semibold text-muted-foreground">al año</small></p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/15 p-5">
              <span className="text-sm font-semibold">Ahorro con el kit Lumine</span>
              {ahorro ? (
                <p className="font-display text-3xl font-extrabold text-ok [font-stretch:110%]"><AnimNum valor={anual * ahorro.min / 100} /> a <AnimNum valor={anual * ahorro.max / 100} /> <small className="text-base font-semibold text-muted-foreground">al año</small></p>
              ) : (
                <div className="flex flex-col gap-2"><PorConfirmar que="Porcentaje de ahorro" /><span className="text-sm text-muted-foreground">Depende de tu uso. Lo estimamos en el diagnóstico y después lo medimos en tu auto con telemetría.</span></div>
              )}
            </div>
            <Button size="lg" className="mt-auto group" onClick={() => irA('compatibilidad')}>Ver si mi auto es compatible <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></Button>
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
    <section id="compatibilidad" className="relative scroll-mt-24 border-t border-white/10 bg-[radial-gradient(800px_400px_at_80%_0%,rgba(34,184,240,0.1),transparent_70%)] py-24 md:py-32" aria-labelledby="co-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Encabezado id="co-t" eyebrow="Compatibilidad" titulo={<>¿Tu auto <span className="text-brand">puede?</span></>} bajada="Tres preguntas y te decimos si tu auto es candidato. Sin registrarte." />
          <Aparecer i={2} className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />El kit va en el eje trasero de autos con tracción delantera.</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />El modelo tiene que estar en nuestra biblioteca de calibraciones: eso lo confirmamos en el diagnóstico.</p>
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />Autos con ABS, airbags y control de estabilidad sí pueden: esos sistemas siguen mandando.</p>
          </Aparecer>
        </div>
        <Aparecer i={1} className="flex h-[min(640px,80svh)] min-h-[480px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1013] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand"><Bot className="size-5" aria-hidden="true" /></span><span className="flex flex-col leading-tight"><b className="text-sm">Verificador Lumine</b><small className="text-xs text-muted-foreground">Guiado · no usa IA ni guarda datos</small></span></span>
            <Button size="sm" variant="fantasma" onClick={iniciar} aria-label="Empezar de nuevo"><RotateCcw className="size-4" /> Reiniciar</Button>
          </div>
          <div ref={lista} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 md:px-5" role="log" aria-live="polite" aria-label="Conversación del verificador">
            <AnimatePresence initial={false}>
              {msgs.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                  className={cn('max-w-[88%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed', m.de === 'bot' ? 'self-start rounded-bl-md bg-white/[0.06]' : 'self-end rounded-br-md bg-brand font-medium text-[#041016]')}>
                  {m.texto}
                </motion.div>
              ))}
              {escribiendo ? (
                <motion.div key="esc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1.5 self-start rounded-3xl rounded-bl-md bg-white/[0.06] px-4 py-4" aria-label="Escribiendo">
                  {[0, 1, 2].map(i => <motion.i key={i} className="size-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="border-t border-white/10 p-3 md:p-4">
            {ops ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {ops.map(([v, l]) => (
                  <motion.button key={v} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => elegir(paso as keyof typeof PREGUNTAS, v, l)}
                    className="min-h-11 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-[#041016]">{l}</motion.button>
                ))}
              </div>
            ) : null}
            {paso === 'fin' && !escribiendo ? (
              <div className="flex flex-wrap gap-2">
                <Button className="flex-1" onClick={() => { window.dispatchEvent(new CustomEvent('lumine:prefill', { detail: r })); irA('agendar') }}>Agendar diagnóstico <ArrowRight className="size-4" /></Button>
                <Button variant="borde" onClick={iniciar}><RotateCcw className="size-4" /> Otro auto</Button>
              </div>
            ) : (
              <PromptInput value={texto} onValueChange={setTexto} onSubmit={enviarAuto} disabled={paso !== 'auto' || escribiendo} className="rounded-[22px] border-white/15 bg-white/[0.03] focus-within:border-brand/60">
                <PromptInputTextarea placeholder={paso === 'auto' ? 'Marca, modelo y año de tu auto' : 'Elige una opción arriba'} aria-label="Marca, modelo y año de tu auto" />
                <PromptInputActions className="justify-end px-1 pb-1">
                  <PromptInputAction tooltip="Enviar">
                    <PromptButton type="button" size="icon" aria-label="Enviar" onClick={enviarAuto} disabled={paso !== 'auto' || texto.trim().length < 2}
                      className={cn('size-9 rounded-full transition-all', texto.trim().length >= 2 ? 'bg-brand text-[#041016] hover:bg-brand-soft' : 'bg-white/10 text-muted-foreground')}>
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
      <span className="inline-flex items-center gap-2 font-bold text-warn"><XCircle className="size-5" aria-hidden="true" /> Por ahora, no</span>
      <span>El kit va en el eje trasero y necesita que {auto} sea de tracción delantera. Si te equivocaste, reinicia: en el diagnóstico lo revisamos igual.</span>
    </div>
  )
  const seguro = r.traccion === 'si'
  return (
    <div className="flex flex-col gap-3">
      <span className={cn('inline-flex items-center gap-2 font-bold', seguro ? 'text-ok' : 'text-brand')}>{seguro ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <CircleHelp className="size-5" aria-hidden="true" />}{seguro ? 'Buen candidato' : 'Puede ser candidato'}</span>
      <span>{seguro ? `${auto} cumple lo básico.` : `Revisamos la tracción de ${auto} en el diagnóstico.`} Lo último que confirmamos es que su modelo esté en nuestra biblioteca de calibraciones.</span>
      {r.km === 'bajo' ? <span className="text-muted-foreground">Con poco uso diario el ahorro es menor. Si no te conviene, el diagnóstico te lo dice con evidencia y no instalamos.</span> : null}
      {r.km === 'alto' ? <span className="text-muted-foreground">Con muchos kilómetros al día, cada punto de ahorro pesa más en tu bolsillo.</span> : null}
      {r.tipo === 'flota' ? <span className="text-muted-foreground">Para flotas armamos un plan por etapas, sin detener tu operación.</span> : null}
    </div>
  )
}
