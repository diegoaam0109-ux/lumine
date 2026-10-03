import * as React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, ClipboardCheck, Gauge, HardHat, Loader2, Mail, MessageCircle, ShieldCheck, Stethoscope, Wrench } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Aparecer, Encabezado, Logo, PorConfirmar, irA } from '@/components/comunes'
import { DATOS, HECHOS } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* ---------- Proceso: línea que se dibuja al bajar ---------- */
const ETAPAS = [
  { ic: Stethoscope, t: 'Diagnóstico', d: 'Revisamos tu auto: tracción, eje trasero, frenos, fallas previas y tu uso real. Si no te conviene, te lo decimos con evidencia y no instalamos.' },
  { ic: Wrench, t: 'Instalación', d: 'Un duo de técnicos certificados monta el motor, el banco de baterías y la unidad de control, con los torques del fabricante.', dato: DATOS.instalacion, que: 'Tiempo de instalación' },
  { ic: ClipboardCheck, t: 'Pruebas y certificación', d: 'Aislación, termografía, dinamómetro y pruebas previas a la certificación. El informe técnico lo firma nuestro Responsable Técnico.' },
  { ic: Gauge, t: 'Postventa', d: 'Mantención programada del kit y telemetría que compara tu ahorro real con el estimado.', dato: DATOS.garantia, que: 'Garantía' },
]
export function Proceso() {
  const ref = React.useRef<HTMLDivElement>(null)
  const quieto = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const alto = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section id="proceso" className="relative scroll-mt-24 border-t border-white/10 py-24 md:py-32" aria-labelledby="pr-t">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Encabezado id="pr-t" centro eyebrow="El proceso" titulo={<>De tu auto de siempre<br />a <span className="text-brand">tu auto híbrido.</span></>} />
        <div ref={ref} className="relative">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-white/10 md:left-1/2" aria-hidden="true" />
          <motion.div style={{ height: quieto ? '100%' : alto }} className="absolute left-6 top-2 w-px bg-brand shadow-[0_0_14px_#22B8F0] md:left-1/2" aria-hidden="true" />
          <ol className="flex flex-col gap-12 md:gap-16">
            {ETAPAS.map((e, i) => (
              <Aparecer as="li" key={e.t} className={cn('relative grid grid-cols-[48px_1fr] gap-5 md:grid-cols-2 md:gap-14', i % 2 && 'md:[&>div:last-child]:order-first md:[&>div:last-child]:text-right')}>
                <span className="relative z-10 grid size-12 place-items-center rounded-2xl border border-brand/40 bg-[#0b1013] text-brand shadow-[0_0_30px_-6px_rgba(34,184,240,0.6)] md:absolute md:left-1/2 md:-translate-x-1/2"><e.ic className="size-5" aria-hidden="true" /></span>
                <div className="hidden md:block" />
                <div className={cn('flex flex-col gap-2', i % 2 ? 'md:items-end md:pr-14' : 'md:pl-14')}>
                  <span className="eyebrow">Paso {i + 1}</span>
                  <h3 className="font-display text-2xl font-extrabold [font-stretch:110%] md:text-3xl">{e.t}</h3>
                  <p className="max-w-md leading-relaxed text-muted-foreground">{e.d}</p>
                  {'que' in e ? <div className="mt-1">{e.dato ? <span className="font-semibold text-brand">{e.que}: {e.dato}</span> : <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">{e.que}: <PorConfirmar que={e.que} /></span>}</div> : null}
                </div>
              </Aparecer>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------- Confianza: técnicos certificados y seguridad ---------- */
export function Confianza() {
  const quieto = useReducedMotion()
  return (
    <section id="confianza" className="relative scroll-mt-24 overflow-hidden border-t border-white/10 py-24 md:py-32" aria-labelledby="cn-t">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <Encabezado id="cn-t" eyebrow="Confianza" titulo={<>Alta tensión,<br /><span className="text-brand">en manos certificadas.</span></>} bajada="Tu auto no lo toca cualquiera. Cada técnico Lumine se forma y se valida en el taller, nivel por nivel, en el sistema Lumine Habilita." />
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { ic: HardHat, t: 'Siempre en duo', d: 'Uno ejecuta y el otro es encargado de seguridad: puede detener el trabajo.' },
              { ic: ShieldCheck, t: 'Seguridad con norma', d: 'Reglas de oro y equipo dieléctrico según la guía alemana DGUV 209-093.' },
              { ic: BadgeCheck, t: 'Credencial verificable', d: 'Cada técnico tiene una credencial con código que cambia con cada nivel validado.' },
              { ic: ClipboardCheck, t: 'Todo queda registrado', d: 'Diagnóstico, montaje, mediciones y pruebas, en el informe técnico de tu auto.' },
            ].map((x, i) => (
              <Aparecer as="li" i={i} key={x.t} className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-card p-5">
                <x.ic className="size-6 text-brand" aria-hidden="true" /><b>{x.t}</b><span className="text-sm leading-relaxed text-muted-foreground">{x.d}</span>
              </Aparecer>
            ))}
          </ul>
        </div>
        <div className="relative flex justify-center [perspective:1200px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,184,240,0.2),transparent_60%)] blur-3xl" aria-hidden="true" />
          <motion.div initial={quieto ? false : { rotateY: -18, rotateX: 8, opacity: 0, y: 30 }} whileInView={{ rotateY: -8, rotateX: 4, opacity: 1, y: 0 }} whileHover={quieto ? undefined : { rotateY: 0, rotateX: 0, scale: 1.02 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 80, damping: 16 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[26px] border border-brand/40 bg-[radial-gradient(420px_220px_at_100%_0%,rgba(34,184,240,0.3),transparent_65%),linear-gradient(140deg,#0d1a21,#070a0c)] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
            role="img" aria-label="Ejemplo de credencial de un técnico certificado Lumine">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,#22B8F0,transparent)]" />
            <div className="flex items-center justify-between"><Logo /><span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Técnico instalador</span></div>
            <div className="mt-6 flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-2xl bg-brand font-display text-4xl font-black text-[#061015] shadow-[0_0_30px_rgba(34,184,240,0.5)]">3</span>
              <div><b className="text-xl">Técnico de ejemplo</b><p className="text-sm text-muted-foreground">Nivel 3 · Autónomo</p>
                <div className="mt-2 flex gap-1">{[1, 2, 3, 4].map(n => <i key={n} className={cn('h-1.5 w-5 rounded-full', n < 3 ? 'bg-white' : n === 3 ? 'bg-brand' : 'bg-white/20')} />)}</div></div>
            </div>
            <div className="mt-6 grid grid-cols-[1fr_96px] items-end gap-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm"><dt className="text-muted-foreground">Estado</dt><dd className="font-bold text-ok">Vigente</dd><dt className="text-muted-foreground">Seguridad</dt><dd>Revalidada</dd><dt className="text-muted-foreground">Código</dt><dd className="font-mono">LH3-····-···</dd></dl>
              <div className="grid aspect-square grid-cols-7 gap-[3px] rounded-xl bg-white p-2" aria-hidden="true">
                {Array.from({ length: 49 }, (_, k) => { const x = k % 7, y = Math.floor(k / 7); const f = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4); return <i key={k} className={cn('rounded-[1px]', f || (x * 3 + y * 5) % 4 === 0 ? 'bg-[#0b0f11]' : 'bg-transparent')} /> })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Preguntas frecuentes ---------- */
export function Preguntas() {
  const faq: [string, React.ReactNode][] = [
    ['¿Qué autos pueden llevar el kit?', <>{HECHOS.elegibilidad} Autos con ABS, airbags y control de estabilidad sí pueden. Usa el verificador de arriba y lo confirmamos en el diagnóstico.</>],
    ['¿Cuánto voy a ahorrar?', <>Depende de cuánto y cómo manejas: el kit asiste sobre todo al partir y al acelerar. Te damos una estimación en el diagnóstico y después la telemetría mide el ahorro real. {DATOS.ahorroPct ? `Rango esperado: ${DATOS.ahorroPct.min} a ${DATOS.ahorroPct.max}%.` : <>Rango de ahorro: <PorConfirmar que="Ahorro" /></>}</>],
    ['¿Cuánto cuesta?', <>Depende del modelo y de la configuración. {DATOS.precio ? `Desde $${DATOS.precio.desde.toLocaleString('es-CL')}.` : <>Precio: <PorConfirmar que="Precio" /></>} El diagnóstico te deja el valor exacto para tu auto.</>],
    ['¿Pierdo los frenos o el ABS de mi auto?', <>No. {HECHOS.sistemasOriginales} {HECHOS.capaSeguridad}</>],
    ['¿Qué pasa con mi motor original?', HECHOS.ejeTrasero + ' Si el kit está apagado, tu auto anda como siempre.'],
    ['¿Es legal circular con el kit?', <>La instalación modifica tu auto, por eso pasa por pruebas previas a la certificación y el informe técnico para inscribir la alteración lo firma nuestro Responsable Técnico. El reglamento chileno para estos kits está en elaboración: te explicamos en el diagnóstico en qué etapa está.</>],
    ['¿La batería es peligrosa?', <>Se trata como lo que es: alta tensión. La montan y la revisan técnicos certificados en seguridad eléctrica, se mide la aislación antes de energizar y la unidad de control corta ante sobretemperatura.</>],
    ['¿Tienen planes para flotas?', <>Sí. Planificamos la instalación por etapas para no detener tu operación y medimos con telemetría el ahorro real de cada vehículo.</>],
  ]
  return (
    <section id="preguntas" className="relative scroll-mt-24 border-t border-white/10 py-24 md:py-32" aria-labelledby="fq-t">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Encabezado id="fq-t" centro eyebrow="Preguntas" titulo={<>Lo que todos <span className="text-brand">preguntan.</span></>} />
        <Aparecer>
          <Accordion type="single" collapsible className="border-t border-white/10">
            {faq.map(([q, a], i) => <AccordionItem key={q} value={'p' + i}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
          </Accordion>
        </Aparecer>
      </div>
    </section>
  )
}

/* ---------- Agendar diagnóstico ---------- */
type Estado = 'editando' | 'enviando' | 'listo' | 'demo' | 'error'
export function Agendar() {
  const [f, setF] = React.useState({ nombre: '', telefono: '', correo: '', comuna: '', auto: '', tipo: 'particular', flota: '' })
  const [estado, setEstado] = React.useState<Estado>('editando')
  const [err, setErr] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail || {}; setF(x => ({ ...x, auto: d.auto || x.auto, tipo: d.tipo || x.tipo })) }
    window.addEventListener('lumine:prefill', h); return () => window.removeEventListener('lumine:prefill', h)
  }, [])
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(x => ({ ...x, [k]: e.target.value }))
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.nombre.trim().length < 3) er.nombre = 'Escribe tu nombre.'
    if (!/^[+\d\s()-]{8,}$/.test(f.telefono.trim())) er.telefono = 'Revisa el teléfono.'
    if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo.trim())) er.correo = 'Revisa el correo.'
    if (f.auto.trim().length < 2) er.auto = 'Cuéntanos qué auto tienes.'
    setErr(er); if (Object.keys(er).length) return
    if (!DATOS.formularioUrl) { setEstado('demo'); return }
    setEstado('enviando')
    try { const r = await fetch(DATOS.formularioUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(f) }); setEstado(r.ok ? 'listo' : 'error') }
    catch { setEstado('error') }
  }
  const campo = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={'f-' + k} className="text-sm font-semibold">{label}</label>
      <input id={'f-' + k} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? 'f-' + k + '-e' : undefined}
        className={cn('h-12 rounded-2xl border bg-white/[0.03] px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand', err[k] ? 'border-red-400' : 'border-white/15')} {...props} />
      {err[k] ? <span id={'f-' + k + '-e'} className="text-sm text-red-400">{err[k]}</span> : null}
    </div>
  )
  return (
    <section id="agendar" className="relative scroll-mt-24 overflow-hidden border-t border-white/10 py-24 md:py-32" aria-labelledby="ag-t">
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(34,184,240,0.18),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <Encabezado id="ag-t" eyebrow="Agenda" titulo={<>Empieza con un <span className="text-brand">diagnóstico.</span></>} bajada="Revisamos tu auto y tu uso, y te decimos con evidencia si el kit te conviene. Si no, no instalamos." />
          <ul className="flex flex-col gap-3 text-muted-foreground">
            {['Te contactamos para coordinar día y lugar.', 'Diagnóstico de tu auto y de tu uso real.', 'Propuesta con el valor exacto para tu modelo.'].map(t => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />{t}</li>)}
          </ul>
          <div className="flex flex-wrap gap-3 text-sm">
            {DATOS.whatsapp ? <a className="inline-flex items-center gap-2 font-semibold text-brand hover:underline" href={'https://wa.me/' + DATOS.whatsapp}><MessageCircle className="size-4" /> WhatsApp</a> : <span className="inline-flex items-center gap-2 text-muted-foreground"><MessageCircle className="size-4" /> WhatsApp: <PorConfirmar que="WhatsApp de ventas" /></span>}
            {DATOS.correo ? <a className="inline-flex items-center gap-2 font-semibold text-brand hover:underline" href={'mailto:' + DATOS.correo}><Mail className="size-4" /> {DATOS.correo}</a> : null}
          </div>
        </div>
        <Aparecer i={1} className="vidrio relative rounded-[28px] p-6 md:p-8">
          <AnimatePresence mode="wait">
            {estado === 'editando' || estado === 'enviando' || estado === 'error' ? (
              <motion.form key="f" onSubmit={enviar} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {campo('nombre', 'Nombre', { autoComplete: 'name', placeholder: 'Nombre y apellido' })}
                  {campo('telefono', 'Teléfono', { autoComplete: 'tel', inputMode: 'tel', placeholder: '+56 9 ...' })}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {campo('correo', 'Correo (opcional)', { autoComplete: 'email', type: 'email', placeholder: 'nombre@correo.cl' })}
                  {campo('comuna', 'Comuna', { autoComplete: 'address-level2', placeholder: 'Ej.: Providencia' })}
                </div>
                {campo('auto', 'Tu auto', { placeholder: 'Marca, modelo y año' })}
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold">Es para</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[['particular', 'Mi auto'], ['flota', 'Mi flota']].map(([v, l]) => (
                      <label key={v} className={cn('flex h-12 cursor-pointer items-center justify-center rounded-2xl border text-sm font-semibold transition-colors', f.tipo === v ? 'border-brand bg-brand/12 text-brand' : 'border-white/15 hover:border-white/30')}>
                        <input type="radio" name="tipo" value={v} checked={f.tipo === v} onChange={set('tipo')} className="sr-only" />{l}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {f.tipo === 'flota' ? campo('flota', '¿Cuántos vehículos?', { inputMode: 'numeric', placeholder: 'Ej.: 25' }) : null}
                {estado === 'error' ? <p className="text-sm text-red-400" role="alert">No se pudo enviar. Intenta de nuevo en un momento.</p> : null}
                <Button size="lg" type="submit" disabled={estado === 'enviando'} className="mt-2">
                  {estado === 'enviando' ? <><Loader2 className="size-5 animate-spin" /> Enviando…</> : <><CalendarCheck className="size-5" /> Agendar diagnóstico</>}
                </Button>
                <p className="text-xs text-muted-foreground">Usamos tus datos solo para coordinar el diagnóstico, según la Ley 19.628 de protección de la vida privada.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-10 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid size-16 place-items-center rounded-full bg-brand/15 text-brand"><CheckCircle2 className="size-8" /></motion.span>
                <h3 className="font-display text-2xl font-extrabold [font-stretch:110%]">{estado === 'listo' ? '¡Listo, ' + f.nombre.split(' ')[0] + '!' : 'Así se vería al enviar'}</h3>
                <p className="max-w-sm text-muted-foreground">{estado === 'listo' ? 'Te contactamos pronto para coordinar tu diagnóstico.' : 'Esta es una vista de demostración: el formulario todavía no está conectado a ventas, así que tus datos no se enviaron.'}</p>
                <Button variant="borde" onClick={() => setEstado('editando')}>Volver al formulario</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Aparecer>
      </div>
    </section>
  )
}

export function Pie() {
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex max-w-sm flex-col gap-3"><Logo /><p className="text-sm text-muted-foreground">Kit de hibridación para autos de tracción delantera. Instalado por técnicos certificados en Chile.</p></div>
        <nav aria-label="Pie" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          {[['como-funciona', 'Cómo funciona'], ['ahorro', 'Ahorro'], ['compatibilidad', 'Compatibilidad'], ['proceso', 'Proceso'], ['flotas', 'Flotas'], ['preguntas', 'Preguntas']].map(([id, l]) => <button key={id} type="button" onClick={() => irA(id)} className="text-left text-muted-foreground hover:text-foreground">{l}</button>)}
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/10 px-5 pt-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
        <span>© {new Date().getFullYear()} Lumine Motors</span>
        <span>Los datos comerciales marcados «Por confirmar» se publican cuando estén validados.</span>
      </div>
    </footer>
  )
}

/* barra fija en teléfono con la acción principal */
export function BarraMovil() {
  const { scrollYProgress } = useScroll()
  const [ver, setVer] = React.useState(false)
  useMotionValueEvent(scrollYProgress, 'change', v => setVer(v > 0.06 && v < 0.92))
  return (
    <motion.div initial={false} animate={{ opacity: ver ? 1 : 0, y: ver ? 0 : 20 }} transition={{ duration: 0.25 }} className={cn('fixed inset-x-3 bottom-3 z-40 sm:hidden', !ver && 'pointer-events-none')} aria-hidden={!ver || undefined}>
      <Button size="lg" className="w-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]" onClick={() => irA('agendar')}>Agendar diagnóstico <ArrowRight className="size-5" /></Button>
    </motion.div>
  )
}
