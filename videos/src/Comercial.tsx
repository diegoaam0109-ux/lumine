/* Video 01 · Página comercial de Lumine Motors (20 s, 1920 × 1080, sin audio) · versión 2.
   Sigue el recorrido real de la página, el mismo de la lámina 8: Conoce → Calcula → Verifica → Agenda.
   Cada escena recrea un componente de ventas/src en movimiento (portada, calculadora, verificador y
   formulario de agenda) sobre las fotos de la página. La calculadora usa la fórmula de la página
   (ahorroPct 20, base 4,33 semanas al mes) y parte de sus valores iniciales (40 km, 5 días, 12 km/L).
   La versión 1 (fotos con texto) quedó en el historial de git. */
import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from 'remotion'
import { F } from './fuentes'
import { Emblema, Palabra } from './logo'
import { avance, C, entrada, Esquinas, FPS, Nota, pesos, Rejilla, s } from './marca'

/* ---------- escenario de la demostración (ver NOTA_PRODUCCION.md) ---------- */
export const ESCENARIO = { kmDia: 180, diasSemana: 6, rendimiento: 10, precioLitro: 1459, combustible: 'Bencina 93', ahorroPct: 20, semanasMes: 4.33 }
const INICIAL = { kmDia: 40, diasSemana: 5, rendimiento: 12 } // valores con que abre la calculadora de la página
const calcular = (km: number, dias: number, rend: number) => {
  const gasto = ((km * dias * ESCENARIO.semanasMes) / rend) * ESCENARIO.precioLitro
  const ahorro = gasto * (ESCENARIO.ahorroPct / 100)
  return { gasto, ahorro, conKit: gasto - ahorro, anual: ahorro * 12 }
}
export const FINAL = calcular(ESCENARIO.kmDia, ESCENARIO.diasSemana, ESCENARIO.rendimiento)
// 682.286,76 · 136.457,352 · 545.829,408 · 1.637.488,224

export const DURACION_COMERCIAL = s(20)
const INICIO = { conoce: 0, calcula: s(4), verifica: s(9.5), agenda: s(14.2), cierre: s(17.3) }
const PASOS = ['Conoce', 'Calcula', 'Verifica', 'Agenda']
const BARRIDO = 18 // transición principal: barrido celeste de 0,6 s

const ancho = (estirar: number, peso: number): CSSProperties => ({ fontFamily: F.archivo, fontStretch: `${estirar}%`, fontWeight: peso })
const MONO: CSSProperties = { fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.14em' }

export function Comercial() {
  const tramo = (a: number, b: number) => ({ from: a, durationInFrames: b - a + BARRIDO })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...tramo(INICIO.conoce, INICIO.calcula)}><Conoce /></Sequence>
      <Sequence {...tramo(INICIO.calcula, INICIO.verifica)}><Barrido><Calcula /></Barrido></Sequence>
      <Sequence {...tramo(INICIO.verifica, INICIO.agenda)}><Barrido><Verifica /></Barrido></Sequence>
      <Sequence {...tramo(INICIO.agenda, INICIO.cierre)}><Barrido><Agenda /></Barrido></Sequence>
      <Sequence from={INICIO.cierre}><Barrido><Cierre /></Barrido></Sequence>
      <BarraSuperior />
      <Grano />
    </AbsoluteFill>
  )
}

/* ---------- piezas comunes ---------- */
function Barrido({ children }: { children: ReactNode }) {
  const f = useCurrentFrame()
  const p = avance(f, 0, BARRIDO, Easing.inOut(Easing.cubic))
  return (
    <>
      <AbsoluteFill style={{ clipPath: p < 1 ? `inset(0 ${(1 - p) * 100}% 0 0)` : undefined, background: C.bg, overflow: 'hidden' }}>{children}</AbsoluteFill>
      {p < 1 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: p * 1920 - 2, width: 4, background: 'linear-gradient(180deg, transparent, #9be3ff 20%, #22B8F0 50%, #9be3ff 80%, transparent)', boxShadow: '0 0 40px 10px rgba(34,184,240,.55)', opacity: Math.min(1, (1 - p) * 6) }} />
      )}
    </>
  )
}

function Grano() {
  const f = useCurrentFrame()
  const x = (f * 73) % 320, y = (f * 151) % 320
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile('img/grano.png')})`, backgroundPosition: `${x}px ${y}px`, opacity: 0.05, mixBlendMode: 'screen', pointerEvents: 'none' }} />
}

function Logo({ alto = 44, style }: { alto?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: alto * 0.3, color: C.fg, ...style }}>
      <Emblema style={{ width: alto, height: alto }} />
      <Palabra style={{ height: alto * 0.5, width: alto * 0.5 * (584 / 96) }} />
    </div>
  )
}

/** Barra fija: logo y el recorrido de la página (los mismos cuatro pasos de la lámina 8). */
function BarraSuperior() {
  const f = useCurrentFrame()
  const limites = [INICIO.conoce, INICIO.calcula, INICIO.verifica, INICIO.agenda, INICIO.cierre]
  const activo = limites.findIndex((l, i) => f >= l && f < limites[i + 1])
  const o = avance(f, 4, 14) * (1 - avance(f, INICIO.cierre + 4, 14))
  return (
    <div style={{ position: 'absolute', left: 96, right: 96, top: 56, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: o }}>
      <Logo />
      <div style={{ display: 'flex', gap: 10 }}>
        {PASOS.map((p, i) => {
          const on = i === activo
          const hecho = i < activo
          const prog = on ? (f - limites[i]) / (limites[i + 1] - limites[i]) : hecho ? 1 : 0
          return (
            <div key={p} style={{ position: 'relative', padding: '12px 20px', border: `1px solid ${on ? C.accent : C.line2}`, background: on ? 'rgba(34,184,240,.14)' : 'rgba(2,3,4,.6)', display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: on || hecho ? C.accent : C.dim }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ ...MONO, fontSize: 22, color: on ? C.fg : hecho ? '#aab4b8' : '#6b7478' }}>{p}</span>
              <i style={{ position: 'absolute', left: 0, bottom: -1, height: 3, width: `${prog * 100}%`, background: C.accent }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Seccion({ n, children, style }: { n: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, ...MONO, fontSize: 22, color: C.muted, ...style }}>
      <span style={{ color: C.accent, fontWeight: 700 }}>{n}</span>
      <span style={{ width: 48, height: 2, background: C.line2 }} />
      {children}
    </div>
  )
}

function Boton({ children, fantasma, brillo = 0, style }: { children: ReactNode; fantasma?: boolean; brillo?: number; style?: CSSProperties }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 14, height: 76, whiteSpace: 'nowrap', padding: '0 34px', ...MONO, fontSize: 24, fontWeight: 700,
      background: fantasma ? `rgba(34,184,240,${0.14 * brillo})` : C.accent, color: fantasma ? C.fg : C.onAccent,
      border: fantasma ? `1px solid ${brillo > 0 ? C.accent : C.line2}` : 'none',
      boxShadow: brillo > 0 ? `0 0 ${36 * brillo}px rgba(34,184,240,${0.55 * brillo})` : undefined, ...style,
    }}>
      {children}
    </div>
  )
}
const Flecha = () => <span style={{ fontFamily: F.texto, fontWeight: 700 }}>↗</span>

/* ---------- 01 · Conoce (0–4 s): la portada de la página con un escaneo que revela el kit ---------- */
function FotoPortada({ f, dur, filtro }: { f: number; dur: number; filtro?: string }) {
  const esc = interpolate(f, [0, dur], [1.02, 1.09])
  return (
    <AbsoluteFill style={{ transform: `translateX(250px) scale(${esc})`, transformOrigin: '60% 55%' }}>
      <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filtro }} />
    </AbsoluteFill>
  )
}
function Conoce() {
  const f = useCurrentFrame()
  const dur = INICIO.calcula + BARRIDO
  const scan = avance(f, 6, 42, Easing.inOut(Easing.cubic))
  const sube = avance(f, 22, 34, Easing.bezier(0.16, 1, 0.3, 1))
  const destello = interpolate(f, [52, 82], [-30, 130], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {/* el auto sin el kit a la vista y, tras el escaneo, en rayos X */}
      <AbsoluteFill style={{ opacity: avance(f, 0, 10) }}><FotoPortada f={f} dur={dur} filtro="grayscale(1) brightness(.32) contrast(1.15)" /></AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - scan) * 100}% 0 0)` }}><FotoPortada f={f} dur={dur} /></AbsoluteFill>
      {scan > 0 && scan < 1 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: scan * 1920 - 1, width: 3, background: '#9be3ff', boxShadow: '0 0 30px 8px rgba(34,184,240,.7), 0 0 120px 40px rgba(34,184,240,.18)' }} />
      )}
      {/* velos de la página para que el texto se lea */}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, #020304 0%, rgba(2,3,4,.88) 24%, rgba(2,3,4,.3) 46%, transparent 64%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, #020304 0%, rgba(2,3,4,.7) 16%, transparent 40%), linear-gradient(180deg, rgba(2,3,4,.92) 0%, transparent 22%)' }} />
      <Rejilla foco={[0.3, 0.5]} fuerza={0.7} />
      <div style={{ position: 'absolute', left: 96, right: 96, top: 156, display: 'flex', justifyContent: 'space-between', ...MONO, fontSize: 22, color: C.muted, opacity: avance(f, 8, 12) }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><i style={{ width: 10, height: 10, background: C.accent }} />Kit de hibridación · Chile</span>
        <span>LM—001 / Particulares y flotas</span>
      </div>
      <div style={{ position: 'absolute', left: 96, top: 290 }}>
        <div style={{ ...ancho(112, 800), fontSize: 84, lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, ...entrada(f, 16, 16) }}>
          Tu auto, <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontStretch: '100%', textTransform: 'none', fontSize: '1.15em', color: C.accent }}>ahora</span>
        </div>
        <div style={{ overflow: 'hidden', paddingTop: 10 }}>
          <div style={{
            ...ancho(68, 700), fontSize: 340, lineHeight: 0.84, letterSpacing: '-0.01em', textTransform: 'uppercase', transform: `translateY(${(1 - sube) * 100}%)`,
            backgroundImage: `linear-gradient(100deg, transparent ${destello - 12}%, rgba(255,255,255,.95) ${destello}%, transparent ${destello + 12}%), linear-gradient(180deg, #ececec 40%, rgba(236,236,236,.45) 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingTop: '0.08em',
          }}>
            Híbrido
          </div>
        </div>
        <div style={{ display: 'flex', gap: 36, marginTop: 30, ...MONO, fontSize: 24, color: C.fg, opacity: avance(f, 46, 14) }}>
          {['Motor original intacto', 'Asistencia eléctrica trasera', 'Freno y ABS originales mandan'].map((l) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}><i style={{ width: 10, height: 10, background: C.accent }} />{l}</span>
          ))}
        </div>
      </div>
      {/* pie de la portada con sus dos botones; «Calcula tu gasto» se ilumina y lleva al paso 2 */}
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 72, paddingTop: 28, borderTop: `1px solid ${C.line2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...entrada(f, 56, 14, 12) }}>
        <span style={{ fontFamily: F.texto, fontSize: 32, color: '#c3ccd0', maxWidth: 760, lineHeight: 1.35 }}>Sumamos asistencia eléctrica en el eje trasero. Tu motor original queda intacto.</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Boton>¿Mi auto es compatible? <Flecha /></Boton>
          <Boton fantasma brillo={avance(f, 92, 14)}>Calcula tu gasto</Boton>
        </div>
      </div>
      <Nota style={{ position: 'absolute', right: 96, top: 214, fontSize: 20, opacity: avance(f, 30, 12) }}>Imagen conceptual</Nota>
    </AbsoluteFill>
  )
}

/* ---------- 02 · Calcula (4–9,5 s): la calculadora con los deslizadores en movimiento ---------- */
const COMBUSTIBLES = [['93', 1459], ['95', 1502], ['97', 1554], ['Diésel', 1393]] as const // ventas/src/lib/datos.ts

function Deslizador({ n, label, valor, unidad, min, max, activo }: { n: string; label: string; valor: number; unidad: string; min: number; max: number; activo: boolean }) {
  const pct = ((valor - min) / (max - min)) * 100
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ ...MONO, fontSize: 22, color: activo ? C.fg : C.muted, display: 'flex', gap: 14 }}><span style={{ color: C.dim }}>{n}</span>{label}</span>
        <span style={{ ...ancho(75, 600), fontSize: 56, lineHeight: 0.9, color: activo ? C.accent : C.fg, fontVariantNumeric: 'tabular-nums' }}>
          {valor}<small style={{ ...MONO, fontSize: 20, color: C.muted, marginLeft: 10 }}>{unidad}</small>
        </span>
      </div>
      <div style={{ position: 'relative', height: 4, marginTop: 22, background: C.line2 }}>
        <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: C.accent }} />
        <i style={{ position: 'absolute', left: `calc(${pct}% - 17px)`, top: -15, width: 34, height: 34, background: C.accent, border: `5px solid ${C.bg}`, boxShadow: `0 0 0 2px ${C.accent}, 0 0 ${activo ? 34 : 18}px rgba(34,184,240,${activo ? 0.8 : 0.45})` }} />
      </div>
    </div>
  )
}

function Calcula() {
  const f = useCurrentFrame()
  const dur = INICIO.verifica - INICIO.calcula + BARRIDO
  // movimientos programados de los deslizadores (valores redondeados al paso de la página)
  const pk = avance(f, 16, 30, Easing.inOut(Easing.cubic))
  const pd = avance(f, 44, 10, Easing.inOut(Easing.cubic))
  const pr = avance(f, 54, 14, Easing.inOut(Easing.cubic))
  const km = Math.round((INICIAL.kmDia + (ESCENARIO.kmDia - INICIAL.kmDia) * pk) / 5) * 5
  const dias = Math.round(INICIAL.diasSemana + (ESCENARIO.diasSemana - INICIAL.diasSemana) * pd)
  const rend = Math.round(INICIAL.rendimiento + (ESCENARIO.rendimiento - INICIAL.rendimiento) * pr)
  const v = calcular(km, dias, rend)
  const moviendo = f < 16 ? -1 : f < 46 ? 0 : f < 56 ? 1 : f < 70 ? 2 : -1
  const listo = avance(f, 70, 12) // cifra final estable desde los 6,3 s
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, dur], [1.1, 1.16])})` }}>
        <Img src={staticFile('img/lumine-13-bencinera.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 55%', filter: 'brightness(.5)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(2,3,4,.75) 0%, rgba(2,3,4,.55) 24%, rgba(2,3,4,.9) 34%)' }} />
      <div style={{ position: 'absolute', left: 96, top: 158, display: 'flex', alignItems: 'baseline', gap: 40 }}>
        <Seccion n="03" style={entrada(f, 10, 12)}>Ahorro</Seccion>
        <div style={{ ...ancho(112, 800), fontSize: 64, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, ...entrada(f, 12, 14) }}>
          Calcula lo que <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontStretch: '100%', textTransform: 'none', fontSize: '1.18em', color: C.accent }}>dejas de gastar.</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, top: 272, bottom: 72, display: 'grid', gridTemplateColumns: '0.95fr 1.15fr', border: `1px solid ${C.line2}`, ...entrada(f, 8, 16, 30) }}>
        {/* entrada de datos */}
        <div style={{ background: 'rgba(10,13,15,.94)', padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 22, borderRight: `1px solid ${C.line2}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.line2}`, padding: 5 }}>
            <div style={{ ...MONO, fontSize: 22, height: 56, display: 'grid', placeItems: 'center', background: C.accent, color: C.onAccent, fontWeight: 700 }}>Mi auto</div>
            <div style={{ ...MONO, fontSize: 22, height: 56, display: 'grid', placeItems: 'center', color: C.muted }}>Mi flota</div>
          </div>
          <div>
            <div style={{ ...MONO, fontSize: 20, color: C.muted, marginBottom: 12, display: 'flex', gap: 14 }}><span style={{ color: C.dim }}>01</span>Combustible y precio de hoy</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {COMBUSTIBLES.map(([l, p], i) => (
                <div key={l} style={{ padding: '12px 16px', border: `1px solid ${i === 0 ? C.accent : C.line2}`, background: i === 0 ? 'rgba(34,184,240,.10)' : 'transparent' }}>
                  <div style={{ ...MONO, fontSize: 24, color: i === 0 ? C.accent : C.fg }}>{l}</div>
                  <div style={{ ...MONO, fontSize: 20, color: C.muted, marginTop: 4 }}>{pesos(p)}</div>
                </div>
              ))}
            </div>
          </div>
          <Deslizador n="02" label="Km al día" valor={km} unidad="km" min={5} max={200} activo={moviendo === 0} />
          <Deslizador n="03" label="Días por semana" valor={dias} unidad="días" min={1} max={7} activo={moviendo === 1} />
          <Deslizador n="04" label="Rendimiento" valor={rend} unidad="km/L" min={5} max={25} activo={moviendo === 2} />
        </div>
        {/* lectura en vivo */}
        <div style={{ position: 'relative', background: 'rgba(16,20,23,.94)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 50% at 30% 34%, rgba(34,184,240,${0.10 + 0.08 * listo}), transparent 70%)` }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '20px 40px', borderBottom: `1px solid ${C.line}`, ...MONO, fontSize: 20, color: C.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><i style={{ width: 10, height: 10, background: C.accent, opacity: f % 30 < 18 ? 1 : 0.3 }} />Lectura en vivo</span>
            <span style={{ color: C.dim }}>1 vehículo · bencina 93</span>
          </div>
          <div style={{ position: 'relative', padding: '30px 40px 28px', display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
            <div>
              <div style={{ ...MONO, fontSize: 22, color: C.muted }}>Ahorras con Lumine</div>
              <div style={{ ...ancho(75, 600), fontSize: 196, lineHeight: 0.85, color: C.accent, marginTop: 14, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 ${50 * listo}px rgba(34,184,240,.45)` }}>{pesos(v.ahorro)}</div>
              <div style={{ ...MONO, fontSize: 22, color: C.muted, marginTop: 14 }}>al mes · <span style={{ color: C.fg }}>{pesos(v.anual)}</span> al año</div>
            </div>
            {[{ l: 'Hoy gastas', val: v.gasto, w: 1, c: 'rgba(236,236,236,.8)' }, { l: 'Con Lumine', val: v.conKit, w: 0.8, c: C.accent }].map((b, i) => (
              <div key={b.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ ...MONO, fontSize: 22, color: i ? C.accent : C.muted }}>{b.l}</span>
                  <span style={{ ...ancho(75, 600), fontSize: 50, lineHeight: 1, color: C.fg, fontVariantNumeric: 'tabular-nums' }}>{pesos(b.val)}<small style={{ ...MONO, fontSize: 18, color: C.muted, marginLeft: 8 }}>/mes</small></span>
                </div>
                <div style={{ position: 'relative', height: 12, background: C.line, marginTop: 10 }}>
                  <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${b.w * avance(f, 20 + i * 6, 24) * 100}%`, background: b.c, boxShadow: i ? '0 0 20px rgba(34,184,240,.6)' : undefined }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
              <Nota punteada style={{ fontSize: 20, padding: '10px 16px' }}>Escenario ilustrativo con 20% de ahorro supuesto</Nota>
              <span style={{ ...MONO, fontSize: 22, color: C.accent, whiteSpace: 'nowrap' }}>−20% de combustible</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ---------- 03 · Verifica (9,5–14,2 s): el verificador guiado de compatibilidad ---------- */
type Msg = { de: 'bot' | 'yo'; t: ReactNode; en: number; ops?: string[] }
const AUTO = 'Toyota Yaris 2016' // el ejemplo que da la propia página
const CHAT: Msg[] = [
  { de: 'bot', t: <>Hola. <b>¿Qué auto tienes?</b> Marca, modelo y año.</>, en: 6 },
  { de: 'yo', t: AUTO, en: 30 },
  { de: 'bot', t: '¿Es de tracción delantera?', en: 38, ops: ['Sí, delantera', 'No, trasera o 4x4', 'No sé'] },
  { de: 'yo', t: 'Sí, delantera', en: 52 },
  { de: 'bot', t: '¿Cuántos kilómetros recorre al día?', en: 58, ops: ['Menos de 30 km', '30 a 80 km', 'Más de 80 km'] },
  { de: 'yo', t: 'Más de 80 km', en: 72 },
  { de: 'bot', t: '¿Es para ti o para una flota?', en: 78 },
  { de: 'yo', t: 'Para mí', en: 88 },
]
function Verifica() {
  const f = useCurrentFrame()
  const dur = INICIO.agenda - INICIO.verifica + BARRIDO
  const tecleo = Math.round(AUTO.length * avance(f, 12, 16, Easing.linear))
  const resultado = 96
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `translateX(${interpolate(f, [0, dur], [-120, -190])}px) scale(1.12)` }}>
        <Img src={staticFile('img/lumine-05-colectivero-santiago.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', filter: 'brightness(.8)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,3,4,.9) 0%, rgba(2,3,4,.55) 30%, rgba(2,3,4,.15) 46%, rgba(2,3,4,.85) 58%, #020304 70%), linear-gradient(180deg, rgba(2,3,4,.85) 0%, transparent 26%, transparent 70%, rgba(2,3,4,.9) 100%)' }} />
      <div style={{ position: 'absolute', left: 96, top: 170, width: 760 }}>
        <Seccion n="04" style={entrada(f, 10, 12)}>Compatibilidad</Seccion>
        <div style={{ ...ancho(112, 800), fontSize: 112, lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, marginTop: 26, ...entrada(f, 12, 14) }}>
          ¿Tu auto<br /><span style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontStretch: '100%', textTransform: 'none', fontSize: '1.15em', color: C.accent }}>puede?</span>
        </div>
        <div style={{ fontFamily: F.texto, fontSize: 34, lineHeight: 1.35, color: '#c3ccd0', marginTop: 26, ...entrada(f, 18, 14) }}>Tres preguntas y te decimos si tu auto es candidato. Sin registrarte.</div>
      </div>
      <Nota style={{ position: 'absolute', left: 96, bottom: 72, fontSize: 20, opacity: avance(f, 20, 12) }}>Imagen conceptual</Nota>
      {/* el verificador */}
      <div style={{ position: 'absolute', left: 1010, right: 96, top: 156, bottom: 72, background: 'rgba(10,13,15,.95)', border: `1px solid ${C.line2}`, display: 'flex', flexDirection: 'column', ...entrada(f, 6, 16, 30) }}>
        <Esquinas largo={30} />
        <div style={{ padding: '22px 30px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ ...MONO, fontSize: 22, color: C.fg, display: 'flex', alignItems: 'center', gap: 12 }}><i style={{ width: 10, height: 10, background: C.accent }} />Verificador Lumine</div>
          <div style={{ ...MONO, fontSize: 18, color: C.muted, marginTop: 6 }}>Guiado · no usa IA ni guarda datos</div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 14, padding: '20px 30px' }}>
          {CHAT.filter((m) => f >= m.en).map((m, i) => {
            const elegida = CHAT.find((x) => x.en > m.en && x.de === 'yo')
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.de === 'bot' ? 'flex-start' : 'flex-end', gap: 10, ...entrada(f, m.en, 8, 16) }}>
                <div style={{ maxWidth: '88%', padding: '14px 20px', fontFamily: F.texto, fontSize: 28, lineHeight: 1.3, ...(m.de === 'bot' ? { borderLeft: `3px solid ${C.accent}`, background: C.well, color: C.fg } : { background: C.accent, color: C.onAccent, fontWeight: 700 }) }}>{m.t}</div>
                {m.ops && elegida && f < elegida.en && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {m.ops.map((o) => {
                      const es = o === elegida.t && f >= elegida.en - 6
                      return <span key={o} style={{ ...MONO, fontSize: 20, padding: '10px 14px', border: `1px solid ${es ? C.accent : C.line2}`, background: es ? 'rgba(34,184,240,.18)' : 'transparent', color: es ? C.fg : C.muted }}>{o}</span>
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {f >= resultado && (
            <div style={{ borderLeft: `3px solid ${C.accent}`, background: C.well, padding: '18px 22px', ...entrada(f, resultado, 10, 16) }}>
              <div style={{ ...MONO, fontSize: 24, color: '#4ADE80', fontWeight: 700 }}>✓ Buen candidato</div>
              <div style={{ fontFamily: F.texto, fontSize: 26, lineHeight: 1.35, color: C.fg, marginTop: 8 }}>{AUTO} cumple lo básico. Falta confirmar su modelo en la biblioteca de calibraciones.</div>
              <Boton brillo={avance(f, resultado + 14, 12)} style={{ marginTop: 16, height: 64, fontSize: 22, opacity: avance(f, resultado + 8, 10) }}>Agendar diagnóstico <Flecha /></Boton>
            </div>
          )}
        </div>
        <div style={{ margin: '0 30px 24px', height: 68, border: `1px solid ${tecleo > 0 && f < 30 ? C.accent : C.line2}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: F.texto, fontSize: 26, color: f < 30 && tecleo > 0 ? C.fg : C.dim }}>
          {f < 30 && tecleo > 0 ? AUTO.slice(0, tecleo) : 'Marca, modelo y año de tu auto'}
          {f < 30 && tecleo > 0 && <i style={{ width: 2, height: 30, background: C.accent, marginLeft: 3, opacity: f % 16 < 9 ? 1 : 0 }} />}
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ---------- 04 · Agenda (14,2–17,3 s): el formulario llega con el auto ya ingresado ---------- */
function Campo({ n, label, valor, vacio, resalta = 0, etiqueta }: { n: string; label: string; valor: string; vacio?: boolean; resalta?: number; etiqueta?: string }) {
  return (
    <div>
      <div style={{ ...MONO, fontSize: 20, color: C.muted, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: C.dim }}>{n}</span>{label}
        {etiqueta && <span style={{ marginLeft: 'auto', color: C.accent, opacity: resalta }}>{etiqueta}</span>}
      </div>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', borderBottom: `2px solid ${resalta > 0 ? C.accent : C.line2}`, fontFamily: F.texto, fontSize: 32, color: vacio ? C.dim : C.fg, background: `rgba(34,184,240,${0.08 * resalta})`, paddingLeft: resalta > 0 ? 10 : 0 }}>{valor}</div>
    </div>
  )
}
function Agenda() {
  const f = useCurrentFrame()
  const dur = INICIO.cierre - INICIO.agenda + BARRIDO
  const llega = spring({ frame: f - 18, fps: FPS, config: { damping: 18 } })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, dur], [1.06, 1.12])})`, transformOrigin: '40% 40%' }}>
        <Img src={staticFile('img/lumine-16-taller.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', filter: 'brightness(.62)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,3,4,.94) 0%, rgba(2,3,4,.75) 40%, rgba(2,3,4,.35) 54%, rgba(2,3,4,.85) 62%), linear-gradient(180deg, rgba(2,3,4,.8) 0%, transparent 25%)' }} />
      <Rejilla foco={[0.25, 0.55]} fuerza={0.8} />
      <div style={{ position: 'absolute', left: 96, top: 166, width: 860 }}>
        <Seccion n="08" style={entrada(f, 10, 12)}>Agenda</Seccion>
        <div style={{ ...ancho(68, 700), fontSize: 176, lineHeight: 0.84, textTransform: 'uppercase', color: C.fg, marginTop: 30, ...entrada(f, 12, 16) }}>Empieza con un</div>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 158, lineHeight: 1, color: C.accent, ...entrada(f, 18, 16) }}>diagnóstico.</div>
        <div style={{ fontFamily: F.texto, fontSize: 32, lineHeight: 1.35, color: '#c3ccd0', marginTop: 22, maxWidth: 760, ...entrada(f, 24, 14) }}>Revisamos tu auto y tu uso, y te decimos con evidencia si el kit te conviene. Si no, no instalamos.</div>
      </div>
      <Nota style={{ position: 'absolute', left: 96, bottom: 72, fontSize: 20, opacity: avance(f, 26, 12) }}>Proceso propuesto · imagen conceptual</Nota>
      <div style={{ position: 'absolute', left: 1040, right: 96, top: 156, bottom: 72, background: 'rgba(10,13,15,.95)', border: `1px solid ${C.line2}`, padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 26, ...entrada(f, 6, 16, 30) }}>
        <Campo n="01" label="Nombre" valor="Nombre y apellido" vacio />
        <Campo n="02" label="Teléfono" valor="+56 9 ..." vacio />
        <Campo n="05" label="Tu auto" valor={AUTO} resalta={llega} etiqueta="Desde el verificador" />
        <div>
          <div style={{ ...MONO, fontSize: 20, color: C.muted, display: 'flex', gap: 12 }}><span style={{ color: C.dim }}>06</span>Es para</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.line2}`, padding: 5, marginTop: 12 }}>
            <div style={{ ...MONO, fontSize: 22, height: 54, display: 'grid', placeItems: 'center', background: `rgba(34,184,240,${llega})`, color: llega > 0.5 ? C.onAccent : C.muted, fontWeight: 700 }}>Mi auto</div>
            <div style={{ ...MONO, fontSize: 22, height: 54, display: 'grid', placeItems: 'center', color: C.muted }}>Mi flota</div>
          </div>
        </div>
        <Boton brillo={0.6 + 0.4 * Math.sin((f / FPS) * 4) * avance(f, 34, 10)} style={{ width: '100%', marginTop: 8, opacity: avance(f, 26, 12) }}>Agendar diagnóstico <Flecha /></Boton>
        <div style={{ ...MONO, fontSize: 18, color: C.muted, textAlign: 'center', opacity: avance(f, 30, 12) }}>Demostración · el formulario no se envía</div>
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.line}`, paddingTop: 22, ...entrada(f, 40, 12, 10) }}>
          <div style={{ ...MONO, fontSize: 20, color: C.accent }}>Luego, si decides instalar</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.texto, fontSize: 30, color: C.fg, marginTop: 10, whiteSpace: 'nowrap' }}>
            <span>Diagnóstico en taller</span><span style={{ color: C.accent }}>→</span><span>Instalación y entrega</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ---------- cierre (17,3–20 s): el auto y la invitación ---------- */
function Cierre() {
  const f = useCurrentFrame()
  const esc = interpolate(f, [0, s(2)], [0.9, 0.84], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const destello = interpolate(f, [10, 46], [-20, 120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Rejilla foco={[0.5, 0.42]} fuerza={1.1} />
      <AbsoluteFill style={{ transform: `translateY(-112px) scale(${esc})`, maskImage: 'radial-gradient(ellipse 60% 62% at 52% 56%, #000 55%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 62% at 52% 56%, #000 55%, transparent 100%)' }}>
        <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <AbsoluteFill style={{ background: `linear-gradient(105deg, transparent ${destello - 10}%, rgba(155,227,255,.16) ${destello}%, transparent ${destello + 10}%)`, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
      <Logo alto={56} style={{ position: 'absolute', left: 0, right: 0, top: 72, justifyContent: 'center', ...entrada(f, 8, 14, 0) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center' }}>
        <div style={{ ...ancho(112, 800), fontSize: 96, lineHeight: 0.95, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, ...entrada(f, 10, 16) }}>Estima tu ahorro.</div>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 116, lineHeight: 1.05, color: C.accent, marginTop: 4, ...entrada(f, 18, 16) }}>Solicita un diagnóstico.</div>
      </div>
      <Nota style={{ position: 'absolute', left: 96, right: 96, bottom: 72, textAlign: 'center', fontSize: 22, color: '#9aa5a9', opacity: avance(f, 30, 14) }}>
        Ahorro: estimación de ingeniería con 20% supuesto, no medida en autos chilenos · imágenes conceptuales
      </Nota>
    </AbsoluteFill>
  )
}
