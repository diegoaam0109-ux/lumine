/* Video 01 · Página comercial de Lumine Motors (20 s, 1920 × 1080, sin audio).
   Recorrido: auto con el kit (0–4 s) · uso en ciudad (4–7 s) · calculadora y ahorro (7–12 s)
   · taller y atención (12–16 s) · cierre con solicitud de diagnóstico (16–20 s).
   Fórmula y valores tomados de ventas/src (calculadora: ahorroPct 20, base 4,33 semanas al mes). */
import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { F } from './fuentes'
import { Emblema, Palabra } from './logo'
import { avance, C, entrada, Escena, Esquinas, Etiqueta, Foto, Nota, pesos, Rejilla, s, T, Titular, Velo } from './marca'

/* ---------- escenario de la demostración (ver NOTA_PRODUCCION.md) ---------- */
export const ESCENARIO = { kmDia: 180, diasSemana: 6, rendimiento: 10, precioLitro: 1459, combustible: 'Bencina 93', ahorroPct: 20, semanasMes: 4.33 }
const litrosMes = (ESCENARIO.kmDia * ESCENARIO.diasSemana * ESCENARIO.semanasMes) / ESCENARIO.rendimiento
export const GASTO_MES = litrosMes * ESCENARIO.precioLitro // 682.286,76
export const AHORRO_MES = GASTO_MES * (ESCENARIO.ahorroPct / 100) // 136.457,352
export const CON_KIT_MES = GASTO_MES - AHORRO_MES // 545.829,408
export const AHORRO_ANO = AHORRO_MES * 12 // 1.637.488,224

export const DURACION_COMERCIAL = s(20)
const INICIO = { auto: 0, uso: s(4), ahorro: s(7), taller: s(12), cierre: s(16) }

export function Comercial() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={INICIO.uso + T}><EscenaAuto /></Sequence>
      <Sequence from={INICIO.uso} durationInFrames={INICIO.ahorro - INICIO.uso + T}><EscenaUso /></Sequence>
      <Sequence from={INICIO.ahorro} durationInFrames={INICIO.taller - INICIO.ahorro + T}><EscenaAhorro /></Sequence>
      <Sequence from={INICIO.taller} durationInFrames={INICIO.cierre - INICIO.taller + T}><EscenaTaller /></Sequence>
      <Sequence from={INICIO.cierre}><EscenaCierre /></Sequence>
    </AbsoluteFill>
  )
}

/* ---------- 0–4 s · el auto con el kit a la vista ---------- */
const RX = { ancho: 1672, k: 1920 / 1672 } // la foto llena el cuadro (misma proporción 16:9)
function Logo({ alto = 52, style }: { alto?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: alto * 0.32, color: C.fg, ...style }}>
      <Emblema style={{ width: alto, height: alto }} />
      <Palabra style={{ height: alto * 0.5, width: alto * 0.5 * (584 / 96) }} />
    </div>
  )
}

function Pin({ x, y, hacia, largo, titulo, sub, original = false, desde }: { x: number; y: number; hacia: 'arriba' | 'abajo'; largo: number; titulo: string; sub: string; original?: boolean; desde: number }) {
  const f = useCurrentFrame()
  const p = avance(f, desde, 16)
  const col = original ? '#c9d1d4' : C.accent
  const y2 = hacia === 'arriba' ? y - largo * p : y + largo * p
  return (
    <>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width={1920} height={1080}>
        <line x1={x} y1={y} x2={x} y2={y2} stroke={col} strokeWidth={2} opacity={0.9 * p} />
        <circle cx={x} cy={y} r={10 * p} fill={col} />
        <circle cx={x} cy={y} r={22 * p} fill="none" stroke={col} strokeOpacity={0.45 * p} strokeWidth={2} />
      </svg>
      <div
        style={{
          position: 'absolute', left: x - 18, top: hacia === 'arriba' ? y - largo - 96 : y + largo + 12,
          opacity: avance(f, desde + 8, 12), padding: '12px 20px', background: 'rgba(2,3,4,.78)',
          borderLeft: `3px solid ${col}`, whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 34, color: C.fg, lineHeight: 1.1 }}>{titulo}</div>
        <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: original ? C.muted : C.accent, marginTop: 4 }}>{sub}</div>
      </div>
    </>
  )
}

function EscenaAuto() {
  const f = useCurrentFrame()
  const dur = INICIO.uso + T
  // acercamiento lento con el mismo origen que la foto, para que los marcadores sigan a las piezas
  const esc = interpolate(f, [0, dur], [1.0, 1.07])
  const O = [1152, 640]
  const pt = (ix: number, iy: number): [number, number] => [O[0] + (ix * RX.k - O[0]) * esc, O[1] + (iy * RX.k - O[1]) * esc]
  const [mx, my] = pt(470, 478)
  const [bx, by] = pt(760, 590)
  const [rx, ry] = pt(1112, 560)
  return (
    <Escena fundido={false}>
      <AbsoluteFill style={{ transform: `scale(${esc})`, transformOrigin: `${O[0]}px ${O[1]}px`, opacity: avance(f, 0, 10) }}>
        <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <Velo fondo="linear-gradient(180deg, rgba(2,3,4,.92) 0%, rgba(2,3,4,.55) 24%, rgba(2,3,4,0) 42%, rgba(2,3,4,0) 78%, rgba(2,3,4,.75) 100%)" />
      <Logo style={{ position: 'absolute', left: 96, top: 72, ...entrada(f, 2, 12, 0) }} />
      <div style={{ position: 'absolute', left: 96, top: 166 }}>
        <div style={entrada(f, 6, 16)}>
          <Titular fuerte="Tu auto," acento="ahora híbrido" size={100} una />
        </div>
      </div>
      <Pin x={mx} y={my} hacia="arriba" largo={150} titulo="Motor original" sub="Queda intacto" original desde={34} />
      <Pin x={bx} y={by} hacia="abajo" largo={150} titulo="Banco de baterías" sub="Kit Lumine" desde={46} />
      <Pin x={rx} y={ry} hacia="arriba" largo={190} titulo="Asistencia eléctrica" sub="Eje trasero · kit" desde={58} />
      <Nota style={{ position: 'absolute', right: 96, bottom: 84, opacity: avance(f, 20, 12) }}>Imagen conceptual</Nota>
    </Escena>
  )
}

/* ---------- 4–7 s · uso del auto en la ciudad: los datos de la calculadora ---------- */
function Dato({ valor, unidad, etiqueta, desde }: { valor: number; unidad?: string; etiqueta: string; desde: number }) {
  const f = useCurrentFrame()
  const p = avance(f, desde, 18, Easing.out(Easing.cubic))
  return (
    <div style={{ ...entrada(f, desde, 12), minWidth: 0 }}>
      <div style={{ fontFamily: F.cifra, fontWeight: 700, fontSize: 150, lineHeight: 0.86, color: C.fg, letterSpacing: '-0.01em' }}>
        {Math.round(valor * p)}
        {unidad && <span style={{ fontSize: 64, color: C.accent, marginLeft: 12 }}>{unidad}</span>}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b7c1c4', marginTop: 18 }}>{etiqueta}</div>
    </div>
  )
}

function EscenaUso() {
  const f = useCurrentFrame()
  const dur = INICIO.ahorro - INICIO.uso + T
  return (
    <Escena>
      <Foto src="lumine-05-colectivero-santiago.jpg" dur={dur} de={1.08} a={1.15} dx={-60} origen="60% 55%" />
      <Velo fondo="linear-gradient(180deg, rgba(2,3,4,.82) 0%, rgba(2,3,4,.2) 30%, rgba(2,3,4,0) 45%, rgba(2,3,4,.55) 62%, rgba(2,3,4,.94) 100%)" />
      <div style={{ position: 'absolute', left: 96, top: 92 }}>
        <Etiqueta n="01" style={entrada(f, 4, 12)}>Tu uso, tu cálculo</Etiqueta>
        <div style={{ marginTop: 26, ...entrada(f, 8, 14) }}>
          <Titular fuerte="Tu ruta," acento="todos los días" size={84} una />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 84 }}>
        <div style={{ position: 'relative', padding: '40px 48px 34px', background: 'rgba(2,3,4,.62)', border: `1px solid ${C.line2}`, opacity: avance(f, 10, 12) }}>
          <Esquinas />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
            <Dato valor={ESCENARIO.kmDia} unidad="km" etiqueta="al día" desde={16} />
            <Dato valor={ESCENARIO.diasSemana} etiqueta="días a la semana" desde={26} />
            <Dato valor={ESCENARIO.rendimiento} unidad="km/L" etiqueta="rendimiento" desde={36} />
          </div>
          <div style={{ marginTop: 30, paddingTop: 22, borderTop: `1px solid ${C.line2}`, fontFamily: F.texto, fontSize: 34, color: '#c3ccd0', ...entrada(f, 48, 12, 10) }}>
            {ESCENARIO.combustible} · <b style={{ color: C.fg }}>{pesos(ESCENARIO.precioLitro)} por litro</b>
            <span style={{ color: C.muted }}> · precio de ejemplo de la página, no verificado hoy</span>
          </div>
        </div>
      </div>
    </Escena>
  )
}

/* ---------- 7–12 s · el ahorro estimado ---------- */
function Barra({ etiqueta, valor, ancho, celeste, desde }: { etiqueta: string; valor: ReactNode; ancho: number; celeste?: boolean; desde: number }) {
  const f = useCurrentFrame()
  return (
    <div style={entrada(f, desde, 12)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: '0.14em', textTransform: 'uppercase', color: celeste ? C.accent : '#b7c1c4' }}>{etiqueta}</span>
        <span style={{ fontFamily: F.cifra, fontWeight: 700, fontSize: 76, color: C.fg, lineHeight: 1 }}>{valor}</span>
      </div>
      <div style={{ marginTop: 16, height: 30, background: C.well, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${ancho * 100}%`, background: celeste ? C.accent : '#5b6468', boxShadow: celeste ? '0 0 32px rgba(34,184,240,.45)' : undefined }} />
      </div>
    </div>
  )
}

function EscenaAhorro() {
  const f = useCurrentFrame()
  const dur = INICIO.taller - INICIO.ahorro + T
  const cuenta = avance(f, 12, 46, Easing.out(Easing.cubic)) // termina en 9,0 s: quedan 3 s de lectura
  const ahorro = AHORRO_MES * cuenta
  const conKit = GASTO_MES - ahorro
  return (
    <Escena>
      <Foto src="lumine-13-bencinera.jpg" dur={dur} de={1.06} a={1.12} dx={30} origen="70% 50%" brillo={0.85} />
      <Velo fondo="linear-gradient(90deg, rgba(2,3,4,.92) 0%, rgba(2,3,4,.78) 40%, rgba(2,3,4,.45) 62%, rgba(2,3,4,.78) 100%)" />
      <Rejilla foco={[0.28, 0.5]} fuerza={0.9} />
      <div style={{ position: 'absolute', left: 96, top: 92 }}>
        <Etiqueta n="02" style={entrada(f, 4, 12)}>Ahorro estimado</Etiqueta>
      </div>
      {/* cifra protagonista */}
      <div style={{ position: 'absolute', left: 96, top: 210, width: 900 }}>
        <div style={{ display: 'inline-block', padding: '10px 22px', background: C.accent, color: C.onAccent, fontFamily: F.titular, fontWeight: 800, fontSize: 40, letterSpacing: '-0.01em', ...entrada(f, 8, 12) }}>
          HASTA 20%
        </div>
        <div style={{ fontFamily: F.texto, fontSize: 40, color: '#c3ccd0', marginTop: 34, ...entrada(f, 10, 12) }}>Ahorrarías al mes</div>
        <div style={{ fontFamily: F.cifra, fontWeight: 700, fontSize: 236, lineHeight: 0.9, color: C.accent, letterSpacing: '-0.01em', textShadow: '0 0 60px rgba(34,184,240,.35)', marginTop: 6, ...entrada(f, 12, 10, 12) }}>
          {pesos(ahorro)}
        </div>
        <div style={{ fontFamily: F.texto, fontSize: 46, color: C.fg, marginTop: 20, ...entrada(f, 52, 12) }}>
          <b>{pesos(AHORRO_ANO)}</b> <span style={{ color: '#c3ccd0' }}>al año</span>
        </div>
      </div>
      {/* comparación en dos barras */}
      <div style={{ position: 'absolute', left: 1070, right: 96, top: 300, display: 'flex', flexDirection: 'column', gap: 54 }}>
        <Barra etiqueta="Hoy gastas" valor={pesos(GASTO_MES)} ancho={1} desde={14} />
        <Barra etiqueta="Con Lumine" valor={pesos(conKit)} ancho={1 - 0.2 * cuenta} celeste desde={20} />
        <div style={{ fontFamily: F.texto, fontSize: 30, color: '#aab4b8', ...entrada(f, 30, 12) }}>Al mes, con {ESCENARIO.kmDia} km diarios, {ESCENARIO.diasSemana} días por semana y {ESCENARIO.rendimiento} km/L</div>
      </div>
      <Nota punteada style={{ position: 'absolute', left: 96, bottom: 84, fontSize: 26, ...entrada(f, 40, 12, 8) }}>
        Escenario ilustrativo con 20% de ahorro supuesto · estimación, no medición
      </Nota>
    </Escena>
  )
}

/* ---------- 12–16 s · del interés a la atención en el taller ---------- */
const PASOS = [
  { t: 'Estima tu ahorro', d: 'En la página' },
  { t: 'Solicita un diagnóstico', d: 'Con tus datos' },
  { t: 'Atención en taller', d: 'Revisión del auto' },
  { t: 'Instalación y entrega', d: 'Si decides instalar' },
]
function EscenaTaller() {
  const f = useCurrentFrame()
  const dur = INICIO.cierre - INICIO.taller + T
  const linea = avance(f, 10, 60, Easing.inOut(Easing.cubic))
  return (
    <Escena>
      <Foto src="lumine-16-taller.jpg" dur={dur} de={1.04} a={1.1} origen="55% 40%" brillo={0.75} />
      <Velo fondo="linear-gradient(180deg, rgba(2,3,4,.86) 0%, rgba(2,3,4,.25) 32%, rgba(2,3,4,.25) 50%, rgba(2,3,4,.9) 76%, rgba(2,3,4,.97) 100%)" />
      <div style={{ position: 'absolute', left: 96, top: 92 }}>
        <Etiqueta n="03" style={entrada(f, 4, 12)}>Del interés a la atención</Etiqueta>
        <div style={{ marginTop: 26, ...entrada(f, 8, 14) }}>
          <Titular fuerte="De la web" acento="al taller" size={84} una />
        </div>
      </div>
      <Nota style={{ position: 'absolute', right: 96, top: 100, opacity: avance(f, 14, 12) }}>Proceso propuesto · imagen conceptual</Nota>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 96 }}>
        <div style={{ position: 'relative', height: 4, background: C.line2, marginBottom: 40, marginLeft: 36, marginRight: 36 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${linea * 100}%`, background: C.accent, boxShadow: '0 0 18px rgba(34,184,240,.6)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36 }}>
          {PASOS.map((p, i) => {
            const d = 12 + i * 14
            return (
              <div key={p.t} style={entrada(f, d, 12)}>
                <div style={{ width: 72, height: 72, background: i === 3 ? 'transparent' : C.accent, border: i === 3 ? `2px solid ${C.accent}` : undefined, color: i === 3 ? C.accent : C.onAccent, display: 'grid', placeItems: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 30 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 40, color: C.fg, marginTop: 22, lineHeight: 1.1 }}>{p.t}</div>
                <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aab4b8', marginTop: 10 }}>{p.d}</div>
              </div>
            )
          })}
        </div>
      </div>
    </Escena>
  )
}

/* ---------- 16–20 s · cierre: el auto y la solicitud de diagnóstico ---------- */
function EscenaCierre() {
  const f = useCurrentFrame()
  const esc = interpolate(f, [0, s(2)], [0.9, 0.84], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <Escena>
      <Rejilla foco={[0.5, 0.42]} fuerza={1.1} />
      <AbsoluteFill style={{ transform: `translateY(-118px) scale(${esc})`, maskImage: 'radial-gradient(ellipse 60% 62% at 52% 56%, #000 55%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 62% at 52% 56%, #000 55%, transparent 100%)' }}>
        <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <Logo alto={48} style={{ position: 'absolute', left: 96, top: 72, ...entrada(f, 6, 12, 0) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center' }}>
        <div style={entrada(f, 10, 16)}>
          <Titular fuerte="Estima tu ahorro." size={92} />
        </div>
        <div style={{ ...entrada(f, 20, 16), fontFamily: F.serif, fontStyle: 'italic', fontSize: 112, lineHeight: 1.05, color: C.accent, marginTop: 4 }}>
          Solicita un diagnóstico.
        </div>
      </div>
      <Nota style={{ position: 'absolute', left: 96, right: 96, bottom: 84, textAlign: 'center', fontSize: 24, color: '#9aa5a9', opacity: avance(f, 34, 14) }}>
        Ahorro: estimación de ingeniería con 20% supuesto, no medida en autos chilenos · imágenes conceptuales
      </Nota>
    </Escena>
  )
}
