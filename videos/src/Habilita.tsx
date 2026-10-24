/* Video 02 · Lumine Habilita y el kit como recurso de formación (18 s, 1920 × 1080, sin audio).
   Identidad (0–3 s) · diagnóstico y ruta (3–6 s) · laboratorio 3D del kit (6–14 s) · cierre (14–18 s).
   Datos de src/data.js: 39 competencias (N1 7 · N2 23 · N3 8 · N4 1), bloques y módulos reales.
   El visor reutiliza la geometría de src/engine3d.js (ver kit3d.ts). */
import { type CSSProperties, Fragment, useLayoutEffect, useRef } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { F } from './fuentes'
import { ancla, type Camara, dibujar } from './kit3d'
import { Emblema, Palabra } from './logo'
import { avance, C, entrada, Escena, Esquinas, Etiqueta, FPS, Nota, Rejilla, s, T, Titular } from './marca'

export const DURACION_HABILITA = s(18)
const INICIO = { identidad: 0, ruta: s(3), kit: s(6), cierre: s(14) }

export function Habilita() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={INICIO.ruta + T}><EscenaIdentidad /></Sequence>
      <Sequence from={INICIO.ruta} durationInFrames={INICIO.kit - INICIO.ruta + T}><EscenaRuta /></Sequence>
      <Sequence from={INICIO.kit}><EscenaKit /></Sequence>
    </AbsoluteFill>
  )
}

function Marca({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: C.fg, ...style }}>
      <Emblema style={{ width: 52, height: 52 }} />
      <Palabra style={{ height: 26, width: 26 * (584 / 96) }} />
      <span style={{ width: 2, height: 34, background: C.line2, margin: '0 6px' }} />
      <span style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: '0.24em', color: '#b7c1c4' }}>HABILITA</span>
    </div>
  )
}

/* ---------- 0–3 s · identidad y propósito ---------- */
function EscenaIdentidad() {
  const f = useCurrentFrame()
  const giro = interpolate(f, [0, INICIO.ruta + T], [-16, -10])
  return (
    <Escena fundido={false}>
      <Rejilla foco={[0.7, 0.5]} />
      {/* portada real de la demo de Habilita, como panel de fondo */}
      <div style={{ position: 'absolute', left: 900, top: 214, width: 1120, perspective: 1600, ...entrada(f, 4, 18, 30) }}>
        <div style={{ transform: `rotateY(${giro}deg)`, transformOrigin: '0% 50%', position: 'relative', border: `1px solid ${C.line2}`, boxShadow: '0 40px 90px -20px rgba(0,0,0,.9), 0 0 80px rgba(34,184,240,.10)' }}>
          <Img src={staticFile('img/habilita-portada.png')} style={{ width: '100%', display: 'block', opacity: 0.9 }} />
          <Esquinas largo={34} />
        </div>
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,3,4,1) 0%, rgba(2,3,4,.95) 40%, rgba(2,3,4,.15) 56%, rgba(2,3,4,0) 100%)' }} />
      <Marca style={{ position: 'absolute', left: 96, top: 76, ...entrada(f, 0, 12, 0) }} />
      <div style={{ position: 'absolute', left: 96, top: 300, width: 900 }}>
        <Etiqueta n="00" style={entrada(f, 4, 12)}>Técnico instalador · Lumine Motors</Etiqueta>
        <div style={{ marginTop: 34, ...entrada(f, 8, 16) }}>
          <Titular fuerte={<>Lumine<br />Habilita</>} size={124} />
        </div>
        <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 72, lineHeight: 1.05, color: C.accent, marginTop: 28, ...entrada(f, 18, 16) }}>
          Del diagnóstico al aprendizaje aplicado
        </div>
      </div>
      <Nota style={{ position: 'absolute', left: 96, bottom: 84, opacity: avance(f, 30, 12) }}>Demostración del sistema propuesto</Nota>
    </Escena>
  )
}

/* ---------- 3–6 s · diagnóstico de brecha y ruta ---------- */
const NIVELES = [
  { n: 'N1', t: 'Seguridad', k: 7 },
  { n: 'N2', t: 'Instalación', k: 23 },
  { n: 'N3', t: 'Autonomía', k: 8 },
  { n: 'N4', t: 'Formador', k: 1 },
]
// selección ilustrativa de competencias ya dominadas (no es el resultado de un técnico real)
const RECONOCIDA = new Set(['N2-0', 'N2-1', 'N2-4', 'N2-5', 'N2-8', 'N2-11', 'N2-12', 'N2-15', 'N2-19', 'N2-22', 'N3-2', 'N3-5'])
const RUTA = ['Recepción y diagnóstico', 'Montaje sin energía', 'Integración y energización']

function EscenaRuta() {
  const f = useCurrentFrame()
  const marca = avance(f, 34, 18) // momento en que se ve la brecha
  let idx = 0
  return (
    <Escena>
      <Rejilla foco={[0.4, 0.45]} />
      <div style={{ position: 'absolute', left: 96, top: 84 }}>
        <Etiqueta n="01" style={entrada(f, 4, 12)}>Diagnóstico y ruta</Etiqueta>
        <div style={{ marginTop: 24, ...entrada(f, 8, 14) }}>
          <Titular fuerte="Forma solo" acento="lo que falta" size={78} una />
        </div>
      </div>
      {/* mapa de 39 competencias */}
      <div style={{ position: 'absolute', left: 96, top: 296, right: 96 }}>
        {NIVELES.map((nv, r) => (
          <div key={nv.n} style={{ display: 'flex', alignItems: 'center', height: 78, ...entrada(f, 10 + r * 4, 12, 10) }}>
            <div style={{ width: 300, display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.accent }}>{nv.n}</span>
              <span style={{ fontFamily: F.texto, fontSize: 30, color: '#c3ccd0' }}>{nv.t}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {Array.from({ length: nv.k }, (_, i) => {
                const id = nv.n + '-' + i
                const ap = avance(f, 12 + (idx++) * 0.55, 8)
                const sabe = RECONOCIDA.has(id)
                const brecha = !sabe
                return (
                  <div
                    key={id}
                    style={{
                      width: 52, height: 52, opacity: ap, transform: `scale(${0.6 + 0.4 * ap})`,
                      background: sabe ? interpolateColor(marca, '#22313a', '#1c2429') : `rgba(34,184,240,${0.16 + 0.10 * marca})`,
                      border: `2px solid ${brecha ? `rgba(34,184,240,${0.5 + 0.5 * marca})` : '#2e3438'}`,
                      boxShadow: brecha && marca > 0 ? `0 0 ${16 * marca}px rgba(34,184,240,.45)` : undefined,
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', marginTop: 22, marginLeft: 300, ...entrada(f, 36, 12, 8) }}>
          <Leyenda color="#1c2429" borde="#2e3438" texto="Ya la domina: se reconoce" />
          <Leyenda color="rgba(34,184,240,.26)" borde={C.accent} texto="Brecha: se forma" />
          <Nota style={{ fontSize: 22, color: C.warn }}>Selección ilustrativa</Nota>
        </div>
      </div>
      {/* ruta: bloques reales del nivel 2 */}
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 96, ...entrada(f, 46, 14) }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: '0.16em', color: C.muted, marginBottom: 18 }}>TU RUTA · NIVEL 2</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {RUTA.map((m, i) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 22, ...entrada(f, 48 + i * 6, 12, 0) }}>
              <div style={{ padding: '18px 28px', border: `1px solid ${i === 0 ? C.accent : C.line2}`, background: i === 0 ? 'rgba(34,184,240,.12)' : C.surface, fontFamily: F.texto, fontWeight: 700, fontSize: 36, color: C.fg, whiteSpace: 'nowrap' }}>
                {m}
              </div>
              {i < RUTA.length - 1 && <span style={{ fontFamily: F.mono, fontSize: 36, color: C.accent }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </Escena>
  )
}
function Leyenda({ color, borde, texto }: { color: string; borde: string; texto: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 30, height: 30, background: color, border: `2px solid ${borde}` }} />
      <span style={{ fontFamily: F.texto, fontSize: 30, color: '#c3ccd0' }}>{texto}</span>
    </div>
  )
}
function interpolateColor(p: number, a: string, b: string) {
  const h = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16))
  const A = h(a), B = h(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * p)).join(',')})`
}

/* ---------- 6–18 s · laboratorio 3D del kit y cierre ---------- */
const PIEZAS = [
  { id: 'motor', t: 'Asistencia eléctrica trasera', sub: 'Eje trasero · kit Lumine', mod: 'Montaje sin energía · C14', desde: s(2.2) },
  { id: 'bateria', t: 'Banco de baterías', sub: 'Guarda la energía regenerada', mod: 'Montaje sin energía · C15', desde: s(4.0) },
  { id: 'ecu', t: 'Unidad de control', sub: 'Decide cuándo asiste', mod: 'Integración y energización · C22', desde: s(5.8) },
]
const W = 1920, H = 1080

function EscenaKit() {
  const f = useCurrentFrame()
  const cierre = INICIO.cierre - INICIO.kit // 240: comienza el cierre (14 s)
  const pc = avance(f, cierre, s(1.1), Easing.inOut(Easing.cubic))
  const xray = avance(f, s(0.6), s(0.9), Easing.inOut(Easing.cubic))
  const ex = avance(f, s(1.4), s(1.8), Easing.inOut(Easing.cubic)) * (1 - pc)
  const activa = PIEZAS.filter((p) => f >= p.desde && f < cierre).pop()
  const cam: Camara = {
    yaw: interpolate(f, [0, cierre, cierre + s(1.2)], [-0.95, -0.95 + 0.85, -0.55], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) }),
    pitch: interpolate(f, [0, cierre], [0.22, 0.34], { extrapolateRight: 'clamp' }),
    dist: 7.2,
    ex,
    xray: xray * (1 - 0.4 * pc),
    sel: activa ? activa.id : null,
    t: f / FPS,
    cx: 0.36 + 0.14 * pc,
    cy: 0.64 - 0.32 * pc,
    escala: 0.98 - 0.22 * pc,
  }
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!
    dibujar(ctx, W * 2, H * 2, cam)
  })
  const vis = 1 - avance(f, cierre - 6, 12) // etiquetas de piezas
  return (
    <Escena>
      <Rejilla foco={[0.38, 0.55]} fuerza={1.2} />
      <canvas ref={ref} width={W * 2} height={H * 2} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
      {/* encabezado y modos reales del laboratorio */}
      <div style={{ position: 'absolute', left: 96, top: 84, opacity: vis }}>
        <Etiqueta n="02" style={entrada(f, 6, 12)}>Formación · laboratorio 3D</Etiqueta>
        <div style={{ marginTop: 22, ...entrada(f, 10, 14) }}>
          <Titular fuerte="Reconoce" acento="el sistema" size={72} una />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1236, top: 236, display: 'flex', alignItems: 'center', gap: 14, ...entrada(f, 14, 12), opacity: Math.min(vis, avance(f, 14, 12)) }}>
        <span style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: '0.14em', color: C.muted, marginRight: 6 }}>MODOS</span>
        <Modo texto="Rayos X" on={xray > 0.5} />
        <Modo texto="Despiece" on={ex > 0.5} />
      </div>
      {/* tres piezas, cada una con su competencia */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: vis }}>
        {PIEZAS.map((p, i) => {
          const a = avance(f, p.desde, 12)
          if (a <= 0) return null
          const [x, y] = ancla(p.id, cam, W, H)
          const cy = 330 + i * 196 + 52
          const on = activa?.id === p.id
          return (
            <g key={p.id} opacity={a * (on ? 1 : 0.4)}>
              <polyline points={`${x},${y} ${1180},${cy} ${1236},${cy}`} fill="none" stroke={C.accent} strokeWidth={2.5} />
              <circle cx={x} cy={y} r={9} fill={C.accent} />
              <circle cx={x} cy={y} r={20} fill="none" stroke={C.accent} strokeOpacity={0.5} strokeWidth={2} />
            </g>
          )
        })}
      </svg>
      <div style={{ position: 'absolute', left: 1236, right: 96, top: 330, display: 'flex', flexDirection: 'column', gap: 26, opacity: vis }}>
        {PIEZAS.map((p, i) => {
          const a = avance(f, p.desde, 12)
          const on = activa?.id === p.id
          return (
            <div key={p.id} style={{ position: 'relative', height: 170, padding: '20px 26px', background: on ? 'rgba(10,22,28,.92)' : 'rgba(10,13,15,.82)', border: `1px solid ${on ? C.accent : C.line2}`, opacity: a * (on ? 1 : 0.55), transform: `translateX(${(1 - a) * 30}px)` }}>
              {on && <Esquinas />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 44, height: 44, background: C.accent, color: C.onAccent, display: 'grid', placeItems: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 36, color: C.fg, lineHeight: 1.05 }}>{p.t}</span>
              </div>
              <div style={{ fontFamily: F.texto, fontSize: 28, color: '#c3ccd0', marginTop: 12 }}>{p.sub}</div>
              <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, marginTop: 8 }}>{p.mod}</div>
            </div>
          )
        })}
      </div>
      <Nota style={{ position: 'absolute', left: 96, bottom: 84, opacity: Math.min(avance(f, s(2.0), 12), vis) }}>
        Vista didáctica del kit · no es un procedimiento de desmontaje
      </Nota>
      {f >= cierre - 2 && <Cierre f={f - cierre} />}
    </Escena>
  )
}
function Modo({ texto, on }: { texto: string; on: boolean }) {
  return (
    <span style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${on ? C.accent : C.line2}`, background: on ? 'rgba(34,184,240,.16)' : 'rgba(10,13,15,.8)', color: on ? C.fg : C.muted, fontFamily: F.texto, fontWeight: 700, fontSize: 26 }}>
      {texto}
    </span>
  )
}

/* ---------- 14–18 s · cierre de formación ---------- */
const ETAPAS = [
  { n: '01', t: 'Identificar', d: 'Diagnóstico de brecha' },
  { n: '02', t: 'Practicar', d: 'Módulos, laboratorio y dúo' },
  { n: '03', t: 'Validar', d: 'Etapa aparte: en taller, con evaluador', aparte: true },
]
function Cierre({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <Marca style={{ position: 'absolute', left: 96, top: 76, ...entrada(f, 6, 12, 0) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center' }}>
        <div style={entrada(f, 12, 16)}>
          <Titular fuerte="Identificar. Practicar." size={80} />
        </div>
        <div style={{ ...entrada(f, 20, 16), fontFamily: F.serif, fontStyle: 'italic', fontSize: 100, lineHeight: 1.05, color: C.accent, marginTop: 2 }}>Validar competencias.</div>
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 84, display: 'grid', gridTemplateColumns: '1fr 1fr 64px 1.25fr', alignItems: 'stretch' }}>
        {ETAPAS.map((e, i) => (
          <Fragment key={e.n}>
            {e.aparte && <div style={{ display: 'grid', placeItems: 'center', ...entrada(f, 34, 12, 0) }}><span style={{ width: 2, height: '80%', background: C.line2 }} /></div>}
            <div style={{ padding: '20px 26px', marginRight: i < 1 ? 24 : 0, border: e.aparte ? `2px dashed ${C.accent}` : `1px solid ${C.line2}`, background: e.aparte ? 'rgba(34,184,240,.06)' : 'rgba(10,13,15,.85)', ...entrada(f, 28 + i * 6, 12) }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: C.accent }}>{e.n}</span>
                <span style={{ fontFamily: F.titular, fontWeight: 800, fontSize: 38, letterSpacing: '-0.02em', textTransform: 'uppercase', color: C.fg }}>{e.t}</span>
              </div>
              <div style={{ fontFamily: F.texto, fontSize: 30, color: '#c3ccd0', marginTop: 8 }}>{e.d}</div>
            </div>
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  )
}
