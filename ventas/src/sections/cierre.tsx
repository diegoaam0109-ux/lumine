import * as React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { CheckCircle2, Loader2, Mail, MessageCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Aparecer, Encabezado, Etiqueta, Flecha, Logo, PorConfirmar, irA } from '@/components/comunes'
import { DATOS, HECHOS } from '@/lib/datos'
import { cn } from '@/lib/utils'

/* ---------- Proceso: cuatro columnas numeradas, la barra se llena al entrar ---------- */
const ETAPAS = [
  { t: 'Diagnóstico', d: 'Revisamos tu auto: tracción, eje trasero, frenos, fallas previas y tu uso real. Si no te conviene, te lo decimos con evidencia y no instalamos.' },
  { t: 'Instalación', d: 'Un duo de técnicos certificados monta el motor, el banco de baterías y la unidad de control, con los torques del fabricante.', dato: DATOS.instalacion, que: 'Tiempo de instalación' },
  { t: 'Pruebas', d: 'Aislación, termografía, dinamómetro y pruebas previas a la certificación. El informe técnico lo firma nuestro Responsable Técnico.' },
  { t: 'Postventa', d: 'Mantención programada del kit y telemetría que compara tu ahorro real con el estimado.', dato: DATOS.garantia, que: 'Garantía' },
]
export function Proceso() {
  const quieto = useReducedMotion()
  return (
    <section id="proceso" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="pr-t">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Encabezado n="05" etiqueta="El proceso" id="pr-t" titulo={<>De tu auto de siempre<br />a <span className="t-serif normal-case text-accent-text">tu auto híbrido.</span></>} />
      </div>
      <ol className="mx-auto grid max-w-[1440px] border-y border-line sm:grid-cols-2 lg:grid-cols-4">
        {ETAPAS.map((e, i) => (
          <Aparecer as="li" i={i} key={e.t} className={cn('group relative flex min-h-[340px] flex-col gap-5 border-line px-5 pb-10 pt-8 transition-colors duration-500 hover:bg-surface md:px-8', i < 3 && 'lg:border-r', i % 2 === 0 && 'sm:border-r', i < 2 && 'sm:max-lg:border-b', i < 3 && 'max-sm:border-b')}>
            <motion.i className="absolute inset-x-0 top-0 h-[3px] origin-left bg-accent" initial={quieto ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-15% 0px' }} transition={{ duration: 1.1, delay: 0.2 + i * 0.18, ease: [0.76, 0, 0.24, 1] }} aria-hidden="true" />
            <span className="t-label-sm flex justify-between text-muted"><span>Paso</span><span className="text-dim">{i + 1} / 4</span></span>
            <span className="t-num text-[96px] leading-[0.8] text-fg transition-colors duration-500 group-hover:text-accent-text">0{i + 1}</span>
            <h3 className="t-titulo mt-auto text-[28px]">{e.t}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{e.d}</p>
            {'que' in e ? <div className="flex flex-wrap items-center gap-2">{e.dato ? <span className="t-label text-accent-text">{e.que}: {e.dato}</span> : <><span className="t-label-sm text-muted">{e.que}</span><PorConfirmar que={e.que} /></>}</div> : null}
          </Aparecer>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Confianza: técnicos certificados y seguridad ---------- */
export function Confianza() {
  const quieto = useReducedMotion()
  const puntos = [
    { t: 'Siempre en duo', d: 'Uno ejecuta y el otro es encargado de seguridad: puede detener el trabajo.' },
    { t: 'Seguridad con norma', d: 'Reglas de oro y equipo dieléctrico según la guía alemana DGUV 209-093.' },
    { t: 'Credencial verificable', d: 'Cada técnico tiene una credencial con código que cambia con cada nivel validado.' },
    { t: 'Todo queda registrado', d: 'Diagnóstico, montaje, mediciones y pruebas, en el informe técnico de tu auto.' },
  ]
  return (
    <section id="confianza" className="grano relative scroll-mt-20 overflow-hidden border-t border-line bg-surface py-24 md:py-36" aria-labelledby="cn-t">
      <div className="rejilla absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_60%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-16 px-5 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Encabezado n="06" etiqueta="Confianza" id="cn-t" apilado titulo={<>Alta tensión,<br /><span className="t-serif normal-case text-accent-text">en manos certificadas.</span></>} bajada="Tu auto no lo toca cualquiera. Cada técnico Lumine se forma y se valida en el taller, nivel por nivel, en el sistema Lumine Habilita." />
          <ul className="grid border-t border-line sm:grid-cols-2">
            {puntos.map((x, i) => (
              <Aparecer as="li" i={i} key={x.t} className={cn('flex flex-col gap-2 border-b border-line py-6', i % 2 === 0 ? 'sm:border-r sm:pr-6' : 'sm:pl-6')}>
                <span className="t-label-sm text-accent-text">C{i + 1}</span>
                <b className="text-lg font-semibold">{x.t}</b>
                <span className="text-[15px] leading-relaxed text-muted">{x.d}</span>
              </Aparecer>
            ))}
          </ul>
        </div>
        <div className="relative flex justify-center [perspective:1400px]">
          <div className="foco absolute -inset-20" aria-hidden="true" />
          <motion.div initial={quieto ? false : { rotateY: -22, rotateX: 10, opacity: 0, y: 40 }} whileInView={{ rotateY: -9, rotateX: 4, opacity: 1, y: 0 }} whileHover={quieto ? undefined : { rotateY: 0, rotateX: 0, scale: 1.02 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 70, damping: 16 }}
            className="visor relative w-full max-w-[440px] border border-line-2 bg-[#05080a] p-7 text-[#ececec] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]"
            role="img" aria-label="Ejemplo de credencial de un técnico certificado Lumine">
            <i className="esq a" /><i className="esq b" /><i className="esq c" /><i className="esq d" />
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#22B8F0,transparent)]" />
            <div className="flex items-center justify-between"><Logo className="text-[#ececec]" /><span className="t-label-sm text-[#8b9598]">Técnico instalador</span></div>
            <div className="mt-8 flex items-end gap-5">
              <span className="t-mono-xl text-[120px] text-[#22B8F0]">3</span>
              <div className="pb-2"><b className="t-titulo text-2xl">Técnico de ejemplo</b><p className="t-label mt-1 text-[#8b9598]">Nivel 3 · Autónomo</p>
                <div className="mt-3 flex gap-1">{[1, 2, 3, 4].map(n => <i key={n} className={cn('h-1 w-7', n < 3 ? 'bg-[#ececec]' : n === 3 ? 'bg-[#22B8F0]' : 'bg-[#2e3438]')} />)}</div></div>
            </div>
            <div className="mt-8 grid grid-cols-[1fr_92px] items-end gap-5 border-t border-[#1f2427] pt-5">
              <dl className="t-label-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2"><dt className="text-[#8b9598]">Estado</dt><dd className="text-[#4ADE80]">Vigente</dd><dt className="text-[#8b9598]">Seguridad</dt><dd>Revalidada</dd><dt className="text-[#8b9598]">Código</dt><dd>LH3-····-···</dd></dl>
              <div className="grid aspect-square grid-cols-7 gap-[3px] bg-[#ececec] p-2" aria-hidden="true">
                {Array.from({ length: 49 }, (_, k) => { const x = k % 7, y = Math.floor(k / 7); const f = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4); return <i key={k} className={cn(f || (x * 3 + y * 5) % 4 === 0 ? 'bg-[#05080a]' : 'bg-transparent')} /> })}
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
    <section id="preguntas" className="relative scroll-mt-20 border-t border-line bg-bg py-24 md:py-36" aria-labelledby="fq-t">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Encabezado n="07" etiqueta="Preguntas" id="fq-t" apilado titulo={<>Lo que todos <span className="t-serif normal-case text-accent-text">preguntan.</span></>} bajada="Y si no está aquí, pregúntalo en el diagnóstico: no tiene costo de compromiso." />
        </div>
        <Aparecer>
          <Accordion type="single" collapsible className="border-t border-line">
            {faq.map(([q, a], i) => <AccordionItem key={q} value={'p' + i}><AccordionTrigger n={String(i + 1).padStart(2, '0')}>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
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
  const campo = (k: keyof typeof f, n: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={'f-' + k} className="t-label-sm flex gap-2 text-muted"><span className="text-dim">{n}</span>{label}</label>
      <input id={'f-' + k} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} aria-describedby={err[k] ? 'f-' + k + '-e' : undefined}
        className={cn('h-12 border-b bg-transparent text-lg text-fg outline-none transition-colors placeholder:text-dim focus:border-accent', err[k] ? 'border-crit' : 'border-line-2')} {...props} />
      {err[k] ? <span id={'f-' + k + '-e'} className="t-label-sm pt-1 text-crit">{err[k]}</span> : null}
    </div>
  )
  return (
    <section id="agendar" className="grano relative scroll-mt-20 overflow-hidden border-t border-line bg-bg py-24 md:py-36" aria-labelledby="ag-t">
      <div className="foco absolute inset-0 opacity-80 [background-position:50%_0]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Aparecer><Etiqueta n="08" punto>Agenda</Etiqueta></Aparecer>
        <Aparecer i={1}>
          <h2 id="ag-t" className="t-mono-xl mt-8 text-[clamp(64px,13vw,220px)]">Empieza con un<br /><span className="t-serif normal-case text-accent-text [font-size:0.9em]">diagnóstico.</span></h2>
        </Aparecer>
        <div className="mt-14 grid gap-14 border-t border-line pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="flex flex-col gap-8">
            <p className="max-w-md text-lg leading-relaxed text-muted">Revisamos tu auto y tu uso, y te decimos con evidencia si el kit te conviene. Si no, no instalamos.</p>
            <ol className="flex flex-col border-t border-line">
              {['Te contactamos para coordinar día y lugar.', 'Diagnóstico de tu auto y de tu uso real.', 'Propuesta con el valor exacto para tu modelo.'].map((t, i) => (
                <li key={t} className="grid grid-cols-[44px_1fr] border-b border-line py-4 text-[15px]"><span className="t-label-sm pt-0.5 text-accent-text">0{i + 1}</span>{t}</li>
              ))}
            </ol>
            <div className="flex flex-col gap-3">
              {DATOS.whatsapp ? <a className="t-label inline-flex items-center gap-2 text-accent-text hover:underline" href={'https://wa.me/' + DATOS.whatsapp}><MessageCircle className="size-4" /> WhatsApp</a> : <span className="t-label-sm inline-flex flex-wrap items-center gap-2 text-muted"><MessageCircle className="size-4" /> WhatsApp <PorConfirmar que="WhatsApp de ventas" /></span>}
              {DATOS.correo ? <a className="t-label inline-flex items-center gap-2 text-accent-text hover:underline" href={'mailto:' + DATOS.correo}><Mail className="size-4" /> {DATOS.correo}</a> : null}
            </div>
          </div>
          <Aparecer i={1} className="visor relative border border-line bg-surface/80 p-6 backdrop-blur-sm md:p-10">
            <i className="esq a" /><i className="esq b" /><i className="esq c" /><i className="esq d" />
            <AnimatePresence mode="wait">
              {estado === 'editando' || estado === 'enviando' || estado === 'error' ? (
                <motion.form key="f" onSubmit={enviar} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-7">
                  <div className="grid gap-7 sm:grid-cols-2">
                    {campo('nombre', '01', 'Nombre', { autoComplete: 'name', placeholder: 'Nombre y apellido' })}
                    {campo('telefono', '02', 'Teléfono', { autoComplete: 'tel', inputMode: 'tel', placeholder: '+56 9 ...' })}
                  </div>
                  <div className="grid gap-7 sm:grid-cols-2">
                    {campo('correo', '03', 'Correo (opcional)', { autoComplete: 'email', type: 'email', placeholder: 'nombre@correo.cl' })}
                    {campo('comuna', '04', 'Comuna', { autoComplete: 'address-level2', placeholder: 'Ej.: Providencia' })}
                  </div>
                  {campo('auto', '05', 'Tu auto', { placeholder: 'Marca, modelo y año' })}
                  <fieldset className="flex flex-col gap-3">
                    <legend className="t-label-sm mb-3 flex gap-2 text-muted"><span className="text-dim">06</span>Es para</legend>
                    <div className="grid grid-cols-2 border border-line-2 p-1">
                      {[['particular', 'Mi auto'], ['flota', 'Mi flota']].map(([v, l]) => (
                        <label key={v} className={cn('t-label flex h-11 cursor-pointer items-center justify-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent', f.tipo === v ? 'bg-accent text-accent-ink' : 'text-muted hover:text-fg')}>
                          <input type="radio" name="tipo" value={v} checked={f.tipo === v} onChange={set('tipo')} className="sr-only" />{l}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {f.tipo === 'flota' ? campo('flota', '07', '¿Cuántos vehículos?', { inputMode: 'numeric', placeholder: 'Ej.: 25' }) : null}
                  {estado === 'error' ? <p className="t-label-sm text-crit" role="alert">No se pudo enviar. Intenta de nuevo en un momento.</p> : null}
                  <Button size="lg" type="submit" disabled={estado === 'enviando'} className="mt-2 w-full">
                    {estado === 'enviando' ? <><Loader2 className="size-5 animate-spin" /> Enviando…</> : <>Agendar diagnóstico <Flecha /></>}
                  </Button>
                  <p className="text-xs leading-relaxed text-dim">Usamos tus datos solo para coordinar el diagnóstico, según la Ley 19.628 de protección de la vida privada.</p>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 py-12 text-center">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid size-16 place-items-center border border-accent text-accent-text"><CheckCircle2 className="size-8" /></motion.span>
                  <h3 className="t-titulo text-3xl">{estado === 'listo' ? '¡Listo, ' + f.nombre.split(' ')[0] + '!' : 'Así se vería al enviar'}</h3>
                  <p className="max-w-sm text-muted">{estado === 'listo' ? 'Te contactamos pronto para coordinar tu diagnóstico.' : 'Esta es una vista de demostración: el formulario todavía no está conectado a ventas, así que tus datos no se enviaron.'}</p>
                  <Button variant="borde" onClick={() => setEstado('editando')}>Volver al formulario</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Aparecer>
        </div>
      </div>
    </section>
  )
}

export function Pie() {
  const links: [string, string][] = [['como-funciona', 'Cómo funciona'], ['para-quien', 'Para quién'], ['ahorro', 'Ahorro'], ['compatibilidad', 'Compatibilidad'], ['proceso', 'Proceso'], ['preguntas', 'Preguntas']]
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg pt-16">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:grid-cols-[1fr_auto] md:px-10">
        <div className="flex max-w-sm flex-col gap-4"><Logo /><p className="text-[15px] leading-relaxed text-muted">Kit de hibridación para autos de tracción delantera. Instalado por técnicos certificados en Chile.</p></div>
        <nav aria-label="Pie" className="grid grid-cols-2 gap-x-14 gap-y-3">
          {links.map(([id, l], i) => <button key={id} type="button" onClick={() => irA(id)} className="t-label flex gap-3 text-left text-muted transition-colors hover:text-fg"><span className="text-dim">0{i + 1}</span>{l}</button>)}
        </nav>
      </div>
      <div className="mx-auto mt-16 max-w-[1440px] px-5 md:px-10" aria-hidden="true">
        <span className="wordmark !h-auto w-full text-fg opacity-90" />
      </div>
      <div className="mx-auto mt-10 flex max-w-[1440px] flex-col gap-2 border-t border-line px-5 py-6 md:flex-row md:justify-between md:px-10">
        <span className="t-label-sm text-dim">© {new Date().getFullYear()} Lumine Motors</span>
        <span className="t-label-sm text-dim">Los datos marcados «Por confirmar» se publican cuando estén validados.</span>
      </div>
    </footer>
  )
}

/* barra fija en teléfono con la acción principal */
export function BarraMovil() {
  const { scrollYProgress } = useScroll()
  const [ver, setVer] = React.useState(false)
  useMotionValueEvent(scrollYProgress, 'change', v => setVer(v > 0.06 && v < 0.9))
  return (
    <motion.div initial={false} animate={{ opacity: ver ? 1 : 0, y: ver ? 0 : 20 }} transition={{ duration: 0.25 }} className={cn('fixed inset-x-3 bottom-3 z-40 sm:hidden', !ver && 'pointer-events-none')} aria-hidden={!ver || undefined}>
      <Button size="lg" className="w-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]" onClick={() => irA('agendar')} tabIndex={ver ? 0 : -1}>Agendar diagnóstico <Flecha /></Button>
    </motion.div>
  )
}
