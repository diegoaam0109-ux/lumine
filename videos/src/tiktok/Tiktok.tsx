/* Video vertical «El kit, para el curioso» (1080 × 1920, con narración, música y subtítulos).
   La narración y los tiempos de cada palabra salen de narracion/narrar.py (tiempos.json):
   las escenas empiezan cuando empieza su frase, así la imagen siempre acompaña lo que se dice.
   Zonas seguras de TikTok: nada importante arriba de y = 220, bajo y = 1500 ni en los 150 px de la derecha
   entre y = 900 y 1500 (botones). */
import { useLayoutEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from 'remotion'
import { F } from '../fuentes'
import { ancla, type Camara, dibujar } from '../kit3d'
import { Emblema, Palabra as PalabraLogo } from '../logo'
import { avance, C, Esquinas, FPS } from '../marca'
import tiempos from './tiempos.json'

type Linea = (typeof tiempos.lineas)[number]
type Pal = Linea['palabras'][number]
const W = 1080, H = 1920
const LINEAS = tiempos.lineas
const fr = (t: number) => Math.round(t * FPS)
const ADELANTO = 0.12 // la imagen entra un poco antes que la voz
export const DURACION_TIKTOK = fr(tiempos.duracion + 2.4)

const linea = (escena: string) => LINEAS.find((l) => l.escena === escena)!
const inicio = (escena: string) => fr(linea(escena).inicio - ADELANTO)
/** Momento (en cuadros, relativo al inicio de la escena) en que se dice una palabra. */
function cuando(escena: string, palabra: string) {
  const l = linea(escena)
  const p = l.palabras.find((x) => x.t.toLowerCase().replace(/[^a-záéíóúñ0-9%]/g, '').startsWith(palabra.toLowerCase()))
  return p ? fr(p.i) - inicio(escena) : 0
}
const indice = (t: number) => {
  let k = 0
  LINEAS.forEach((l, i) => { if (t >= l.inicio - ADELANTO) k = i })
  return k
}

const MONO: CSSProperties = { fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.14em' }
const ancho = (estirar: number, peso: number): CSSProperties => ({ fontFamily: F.archivo, fontStretch: `${estirar}%`, fontWeight: peso })
const Serif = ({ children, k = 1.12 }: { children: ReactNode; k?: number }) => (
  <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontStretch: '100%', textTransform: 'none', letterSpacing: '-0.01em', fontSize: `${k}em`, color: C.accent }}>{children}</span>
)

/* ---------- composición ---------- */
export function Tiktok() {
  const tramo = (k: number) => {
    const desde = inicio(LINEAS[k].escena)
    const hasta = k + 1 < LINEAS.length ? inicio(LINEAS[k + 1].escena) + 8 : DURACION_TIKTOK
    return { from: desde, durationInFrames: hasta - desde }
  }
  const voz = { ini: fr(LINEAS[0].inicio), fin: fr(LINEAS[LINEAS.length - 1].fin) }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Capa3D />
      {LINEAS.map((l, k) => {
        const Esc = ESCENAS[l.escena]
        return (
          <Sequence key={l.escena} {...tramo(k)}>
            <Entra primera={k === 0}><Esc /></Entra>
          </Sequence>
        )
      })}
      <Encabezado />
      <Subtitulos />
      <Grano />
      {/* sonido: voz, base musical (baja mientras se habla) y efectos en los cambios de escena */}
      <Audio src={staticFile('audio/narracion.wav')} />
      <Audio src={staticFile('audio/musica.wav')} volume={(c) => interpolate(c, [0, voz.ini, voz.ini + 12, voz.fin - 6, voz.fin + 10, DURACION_TIKTOK - 30, DURACION_TIKTOK], [0.42, 0.42, 0.14, 0.14, 0.5, 0.5, 0], { extrapolateRight: 'clamp' })} />
      {LINEAS.slice(1).map((l) => (
        <Sequence key={'b' + l.escena} from={Math.max(0, inicio(l.escena) - 6)} durationInFrames={20}><Audio src={staticFile('audio/barrido.wav')} volume={0.32} /></Sequence>
      ))}
      <Sequence from={inicio('gancho') + cuando('gancho', 'híbrido')} durationInFrames={30}><Audio src={staticFile('audio/golpe.wav')} volume={0.6} /></Sequence>
      <Sequence from={inicio('ahorro') + cuando('ahorro', '20')} durationInFrames={30}><Audio src={staticFile('audio/golpe.wav')} volume={0.45} /></Sequence>
      <Sequence from={inicio('cierre')} durationInFrames={30}><Audio src={staticFile('audio/golpe.wav')} volume={0.6} /></Sequence>
    </AbsoluteFill>
  )
}

/** Entrada rápida de cada escena: aparece y se asienta (corte con energía, estilo TikTok). */
function Entra({ children, primera }: { children: ReactNode; primera?: boolean }) {
  const f = useCurrentFrame()
  const o = primera ? 1 : avance(f, 0, 7)
  const e = primera ? 1 : interpolate(f, [0, 10], [1.06, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${e})` }}>{children}</AbsoluteFill>
}

function Grano() {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile('img/grano.png')})`, backgroundPosition: `${(f * 73) % 320}px ${(f * 151) % 320}px`, opacity: 0.05, mixBlendMode: 'screen', pointerEvents: 'none' }} />
}

/* ---------- encabezado: cuatro partes, como en el video de referencia ---------- */
const PARTES: { t: string; escenas: string[] }[] = [
  { t: 'Qué es', escenas: ['kit', 'motor', 'bateria', 'control'] },
  { t: 'Cómo funciona', escenas: ['ciudad', 'frenar', 'acelerar'] },
  { t: 'Seguridad y ahorro', escenas: ['intacto', 'ahorro', 'aviso'] },
  { t: '¿Tu auto puede?', escenas: ['quien', 'puede', 'diagnostico'] },
]
function Encabezado() {
  const f = useCurrentFrame()
  const k = indice(f / FPS)
  const esc = LINEAS[k].escena
  const parte = PARTES.findIndex((p) => p.escenas.includes(esc))
  const visible = avance(f, inicio('kit'), 10) * (1 - avance(f, inicio('cierre'), 8))
  if (visible <= 0) return null
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, top: 236, opacity: visible }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {PARTES.map((p, i) => {
          const desde = inicio(p.escenas[0])
          const ultima = p.escenas[p.escenas.length - 1]
          const hasta = fr(linea(ultima).fin)
          const prog = Math.max(0, Math.min(1, (f - desde) / (hasta - desde)))
          return (
            <div key={p.t} style={{ flex: 1, height: 6, background: 'rgba(236,236,236,.18)' }}>
              <div style={{ height: '100%', width: `${prog * 100}%`, background: C.accent, boxShadow: i === parte ? '0 0 12px rgba(34,184,240,.8)' : undefined }} />
            </div>
          )
        })}
      </div>
      {parte >= 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, ...MONO, fontSize: 28 }}>
          <span style={{ color: C.accent, fontWeight: 700 }}>Parte {parte + 1} de 4</span>
          <span style={{ color: C.fg }}>{PARTES[parte].t}</span>
        </div>
      )}
    </div>
  )
}

/* ---------- subtítulos: grupos cortos, la palabra que se dice va resaltada ---------- */
type Grupo = { palabras: Pal[]; i: number; f: number }
const GRUPOS: Grupo[] = LINEAS.flatMap((l) => {
  const gs: Pal[][] = []
  let cur: Pal[] = []
  for (const p of l.palabras) {
    cur.push(p)
    const largo = cur.reduce((s, x) => s + x.t.length + 1, 0)
    if (cur.length >= 3 || /[,.?!…:]$/.test(p.t) || largo >= 15) { gs.push(cur); cur = [] }
  }
  if (cur.length) gs.push(cur)
  return gs.map((g, k) => ({ palabras: g, i: g[0].i, f: k + 1 < gs.length ? gs[k + 1][0].i : l.fin + 0.1 }))
})
function Subtitulos() {
  const f = useCurrentFrame()
  const t = f / FPS
  const g = GRUPOS.find((x) => t >= x.i - 0.04 && t < x.f)
  if (!g) return null
  const d = f - fr(g.i - 0.04)
  const pop = interpolate(d, [0, 5], [0.86, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) })
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1300, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', transform: `scale(${pop})`, ...ancho(100, 800), fontSize: 84, lineHeight: 1.12, letterSpacing: '-0.015em', color: C.fg, textAlign: 'center' }}>
        {g.palabras.map((p, k) => {
          const actual = g.palabras.reduce((a, x, j) => (t >= x.i - 0.04 ? j : a), 0)
          const ahora = k === actual
          const dicha = k < actual
          const texto = p.t.replace(/[.,:]$/, '')
          return (
            <span key={k} style={{
              padding: '0 14px', background: ahora ? C.accent : 'transparent', color: ahora ? C.onAccent : dicha ? C.fg : 'rgba(236,236,236,.62)',
              textShadow: ahora ? 'none' : '0 4px 18px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.9)', boxShadow: ahora ? '0 8px 30px rgba(34,184,240,.45)' : undefined,
            }}>{texto}</span>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- piezas de escena ---------- */
function Titular({ children, desde = 0, size = 112, style }: { children: ReactNode; desde?: number; size?: number; style?: CSSProperties }) {
  const f = useCurrentFrame()
  const s = spring({ frame: f - desde, fps: FPS, config: { damping: 14, mass: 0.6 } })
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, top: 340, ...ancho(112, 800), fontSize: size, lineHeight: 0.98, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, textShadow: '0 6px 30px rgba(0,0,0,.8)', ...style }}>
      {children}
    </div>
  )
}
function Foto({ src, de = 1.1, a = 1.2, dx = 0, origen = '50% 50%', brillo = 0.7, posicion = '50% 50%', durS = 5 }: { src: string; de?: number; a?: number; dx?: number; origen?: string; brillo?: number; posicion?: string; durS?: number }) {
  const f = useCurrentFrame()
  const p = Math.min(1, f / (durS * FPS))
  return (
    <AbsoluteFill style={{ transform: `translateX(${dx * p}px) scale(${de + (a - de) * p})`, transformOrigin: origen }}>
      <Img src={staticFile('img/' + src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posicion, filter: `brightness(${brillo})` }} />
    </AbsoluteFill>
  )
}
const Velo = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(2,3,4,.85) 0%, rgba(2,3,4,.25) 30%, rgba(2,3,4,.25) 58%, rgba(2,3,4,.92) 74%, #020304 100%)' }} />
function Rejilla() {
  return (
    <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(186,215,247,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(186,215,247,.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 50% at 50% 45%, #000, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 45%, #000, transparent 80%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 45%, rgba(34,184,240,.14), transparent 70%)' }} />
    </AbsoluteFill>
  )
}
function Chip({ children, desde = 0, style, ambar }: { children: ReactNode; desde?: number; style?: CSSProperties; ambar?: boolean }) {
  const f = useCurrentFrame()
  const s = spring({ frame: f - desde, fps: FPS, config: { damping: 13, mass: 0.5 } })
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '16px 26px', ...MONO, fontSize: 32, fontWeight: 700, color: ambar ? C.warn : C.fg, background: ambar ? 'rgba(2,3,4,.8)' : 'rgba(10,13,15,.86)', border: ambar ? `3px dashed ${C.warn}` : `2px solid ${C.accent}`, opacity: Math.min(1, s * 1.5), transform: `scale(${0.7 + 0.3 * s})`, ...style }}>
      {children}
    </div>
  )
}
const Check = () => <span style={{ width: 44, height: 44, background: C.accent, color: C.onAccent, display: 'grid', placeItems: 'center', fontFamily: F.texto, fontWeight: 800, fontSize: 30, flexShrink: 0 }}>✓</span>
function Nota({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: 'absolute', left: 64, right: 160, top: 1200, ...MONO, fontSize: 24, color: '#aab4b8', ...style }}>{children}</div>
}

/* ---------- capa 3D: el mismo visor de Lumine Habilita, compartido entre escenas ---------- */
const CANVAS = { top: 520, h: 800 }
type Toma = Omit<Camara, 't'>
const TOMAS: Record<string, Toma> = {
  frenar: { yaw: -0.35, pitch: 0.26, dist: 7.0, ex: 0, xray: 1, sel: 'regen', escala: 1.08, cy: 0.58 },
  acelerar: { yaw: 0.25, pitch: 0.3, dist: 7.0, ex: 0, xray: 1, sel: 'motor', escala: 1.08, cy: 0.58 },
  intacto: { yaw: -2.35, pitch: 0.32, dist: 7.0, ex: 0, xray: 0.75, sel: 'combustion', escala: 1.25, cy: 0.54 },
  puede: { yaw: -2.0, pitch: 0.34, dist: 7.0, ex: 0, xray: 0.4, sel: ['rueda-1.36-0.8', 'rueda-1.360.8', 'combustion'], escala: 1.22, cy: 0.56 },
}
function camaraEn(f: number): { cam: Camara; esc: string; vis: number } {
  const k = indice(f / FPS)
  const esc = LINEAS[k].escena
  const toma = TOMAS[esc]
  const t0 = inicio(esc)
  const previa = k > 0 ? TOMAS[LINEAS[k - 1].escena] : undefined
  const p = avance(f, t0, 18, Easing.inOut(Easing.cubic))
  const mezcla = (a: number, b: number) => (previa ? a + (b - a) * p : b)
  const base = toma ?? previa ?? TOMAS.frenar
  const deriva = (f - t0) * 0.0025
  const cam: Camara = {
    yaw: (previa && toma ? mezcla(previa.yaw, toma.yaw) : base.yaw) + deriva,
    pitch: previa && toma ? mezcla(previa.pitch, toma.pitch) : base.pitch,
    dist: base.dist, ex: 0,
    xray: previa && toma ? mezcla(previa.xray, toma.xray) : base.xray,
    sel: base.sel, t: f / FPS, escala: base.escala, cy: base.cy,
  }
  // visible solo en sus escenas, con fundido corto al entrar y al salir
  const enEscena = !!toma
  const sale = k + 1 < LINEAS.length ? inicio(LINEAS[k + 1].escena) : DURACION_TIKTOK
  const vis = enEscena ? Math.min(previa ? 1 : avance(f, t0, 8), TOMAS[LINEAS[k + 1]?.escena] ? 1 : 1 - avance(f, sale - 2, 8)) : 0
  return { cam, esc, vis }
}
function Capa3D() {
  const f = useCurrentFrame()
  const { cam, esc, vis } = camaraEn(f)
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (ctx) dibujar(ctx, W * 2, CANVAS.h * 2, cam)
  })
  if (vis <= 0) return null
  const flujo = esc === 'frenar' ? ['regen', 'bateria'] : esc === 'acelerar' ? ['bateria', 'motor'] : null
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <canvas ref={ref} width={W * 2} height={CANVAS.h * 2} style={{ position: 'absolute', left: 0, top: CANVAS.top, width: W, height: CANVAS.h }} />
      {flujo && <Flujo cam={cam} de={flujo[0]} a={flujo[1]} f={f} />}
    </AbsoluteFill>
  )
}
/** Puntos de energía que viajan entre dos piezas del kit. */
function Flujo({ cam, de, a, f }: { cam: Camara; de: string; a: string; f: number }) {
  const [x1, y1] = ancla(de, cam, W, CANVAS.h)
  const [x2, y2] = ancla(a, cam, W, CANVAS.h)
  const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - 120
  const punto = (u: number) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * cx + u ** 2 * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * cy + u ** 2 * y2 + CANVAS.top]
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <path d={`M ${x1} ${y1 + CANVAS.top} Q ${cx} ${cy + CANVAS.top} ${x2} ${y2 + CANVAS.top}`} fill="none" stroke={C.accent} strokeOpacity={0.35} strokeWidth={4} strokeDasharray="10 14" strokeDashoffset={-f * 3} />
      {Array.from({ length: 7 }, (_, i) => {
        const u = ((f / 36 + i / 7) % 1)
        const [x, y] = punto(u)
        return <circle key={i} cx={x} cy={y} r={11 - Math.abs(u - 0.5) * 8} fill="#9be3ff" style={{ filter: 'drop-shadow(0 0 10px #22B8F0)' }} />
      })}
    </svg>
  )
}

/* ---------- escenas ---------- */
function Gancho() {
  const f = useCurrentFrame()
  const pan = interpolate(f, [0, 100], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
  const scan = avance(f, cuando('gancho', 'pero') - 6, 26, Easing.inOut(Easing.cubic))
  const hibrido = cuando('gancho', 'híbrido')
  const golpe = spring({ frame: f - hibrido, fps: FPS, config: { damping: 9, mass: 0.6 } })
  // la foto (16:9) se recorre de la parte delantera a la trasera del auto
  const foto = (filtro?: string) => (
    <AbsoluteFill style={{ transform: `translateX(${interpolate(pan, [0, 1], [700, -880])}px) scale(${1.0 + 0.06 * pan})` }}>
      <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ position: 'absolute', top: 360, left: -1200, height: 1560, width: 1560 * (1672 / 941), maxWidth: 'none', filter: filtro }} />
    </AbsoluteFill>
  )
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {foto('grayscale(1) brightness(.35) contrast(1.2)')}
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - scan) * 100}% 0 0)` }}>{foto()}</AbsoluteFill>
      {scan > 0 && scan < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: scan * W - 2, width: 4, background: '#9be3ff', boxShadow: '0 0 34px 10px rgba(34,184,240,.7)' }} />}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #020304 0%, rgba(2,3,4,.75) 14%, rgba(2,3,4,0) 30%, rgba(2,3,4,0) 62%, rgba(2,3,4,.9) 72%, #020304 100%)' }} />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 290, ...ancho(112, 800), fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, ...{ opacity: avance(f, 2, 8) } }}>
        ¿Tu auto<br /><Serif>a bencina…</Serif>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 560, ...ancho(68, 700), fontSize: 300, lineHeight: 0.86, textTransform: 'uppercase', opacity: Math.min(1, golpe * 1.5), transform: `scale(${0.6 + 0.4 * golpe})`, transformOrigin: '0% 50%',
        backgroundImage: 'linear-gradient(180deg, #ffffff 30%, rgba(155,227,255,.7) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 40px rgba(34,184,240,.45))' }}>
        híbrido?
      </div>
    </AbsoluteFill>
  )
}

function Kit() {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Rejilla />
      <Titular>El kit<br /><Serif>Lumine</Serif></Titular>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 640, height: 560, transform: `scale(${interpolate(f, [0, 130], [1.0, 1.08])})` }}>
        <Img src={staticFile('img/lumine-02-despiece.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%' }} />
        <Esquinas largo={40} grosor={3} />
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1215, display: 'flex', gap: 16 }}>
        <Chip desde={cuando('kit', 'suma')}>Se suma</Chip>
        <Chip desde={cuando('kit', 'reemplaza')}>No reemplaza nada</Chip>
      </div>
    </AbsoluteFill>
  )
}

function Pieza({ n, img, titulo, chip, escena, gira = 0 }: { n: string; img: string; titulo: ReactNode; chip: string; escena: string; gira?: number }) {
  const f = useCurrentFrame()
  const s = spring({ frame: f - 2, fps: FPS, config: { damping: 15, mass: 0.7 } })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Rejilla />
      <div style={{ position: 'absolute', right: 64, top: 330, ...ancho(75, 600), fontSize: 200, lineHeight: 0.8, color: 'rgba(34,184,240,.22)' }}>{n}</div>
      <Titular style={{ top: 360, right: 300 }} size={104}>{titulo}</Titular>
      <div style={{ position: 'absolute', left: (W - 640) / 2, top: 620, width: 640, height: 640, opacity: Math.min(1, s * 1.4), transform: `scale(${0.8 + 0.2 * s}) rotate(${(1 - s) * gira}deg)` }}>
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 55%, rgba(34,184,240,.28), transparent 62%)' }} />
        <Img src={staticFile('img/' + img)} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${interpolate(f, [0, 120], [1, 1.07])})` }} />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 1210 }}><Chip desde={cuando(escena, escena === 'motor' ? 'atrás' : escena === 'bateria' ? 'banco' : 'decide')}>{chip}</Chip></div>
    </AbsoluteFill>
  )
}

function Ciudad() {
  const f = useCurrentFrame()
  const palabras = ['Frenas.', 'Aceleras.', 'Frenas.', 'Aceleras.']
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Foto src="lumine-05-colectivero-santiago.jpg" de={1.15} a={1.3} dx={-120} posicion="62% 50%" brillo={0.75} durS={3} />
      <Velo />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 360 }}>
        {palabras.map((p, i) => {
          const d = 4 + i * 12
          const s = spring({ frame: f - d, fps: FPS, config: { damping: 12, mass: 0.5 } })
          return (
            <div key={i} style={{ ...ancho(68, 700), fontSize: 190, lineHeight: 0.86, textTransform: 'uppercase', color: i % 2 ? C.accent : C.fg, opacity: Math.min(1, s * 1.5) * (i < 2 ? 1 : 0.35), transform: `translateX(${(1 - s) * (i % 2 ? 120 : -120)}px)` }}>{p}</div>
          )
        })}
      </div>
      <Nota>Imagen conceptual</Nota>
    </AbsoluteFill>
  )
}

function Escena3D({ titulo, chips, nota }: { titulo: ReactNode; chips?: { t: ReactNode; en: number }[]; nota?: string }) {
  return (
    <AbsoluteFill>
      <Rejilla />
      <Titular>{titulo}</Titular>
      {chips && (
        <div style={{ position: 'absolute', left: 64, right: 64, top: 1150, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {chips.map((c, i) => <div key={i} style={{ marginTop: i ? 14 : 0 }}><Chip desde={c.en}>{c.t}</Chip></div>)}
        </div>
      )}
      {nota && <Nota style={{ top: 1250 }}>{nota}</Nota>}
    </AbsoluteFill>
  )
}

function Intacto() {
  const items = [
    { t: 'Motor original', en: cuando('intacto', 'motor') },
    { t: 'Caja', en: cuando('intacto', 'caja') },
    { t: 'Freno y ABS mandan', en: cuando('intacto', 'abs') },
  ]
  const f = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Rejilla />
      <Titular>Tu auto<br /><Serif>sigue mandando</Serif></Titular>
      <div style={{ position: 'absolute', left: 64, top: 1080, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((x) => {
          const s = spring({ frame: f - x.en, fps: FPS, config: { damping: 13, mass: 0.5 } })
          return (
            <div key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 24px 12px 12px', background: 'rgba(10,13,15,.88)', border: `1px solid ${C.line2}`, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -60}px)`, ...MONO, fontSize: 30, fontWeight: 700, color: C.fg }}>
              <Check />{x.t}
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

function Ahorro() {
  const f = useCurrentFrame()
  const en = cuando('ahorro', '20')
  const n = Math.round(20 * avance(f, en - 4, 16, Easing.out(Easing.cubic)))
  const s = spring({ frame: f - (en - 4), fps: FPS, config: { damping: 10, mass: 0.6 } })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Foto src="lumine-13-bencinera.jpg" de={1.2} a={1.32} dx={80} posicion="45% 50%" brillo={0.55} />
      <Velo />
      <Titular>¿Cuánto<br /><Serif>ahorra?</Serif></Titular>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 690, opacity: Math.min(1, s * 1.5), transform: `scale(${0.7 + 0.3 * s})`, transformOrigin: '0% 50%' }}>
        <div style={{ ...MONO, fontSize: 40, color: C.fg }}>Hasta</div>
        <div style={{ ...ancho(75, 600), fontSize: 380, lineHeight: 0.85, color: C.accent, textShadow: '0 0 60px rgba(34,184,240,.5)' }}>{n}<span style={{ fontSize: '0.6em' }}>%</span></div>
        <div style={{ ...ancho(112, 800), fontSize: 54, textTransform: 'uppercase', color: C.fg, marginTop: 10 }}>menos bencina<br />en ciudad</div>
      </div>
      <Nota style={{ top: 1210, color: C.warn }}>Estimación · imagen conceptual</Nota>
    </AbsoluteFill>
  )
}

function Aviso() {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Foto src="lumine-13-bencinera.jpg" de={1.32} a={1.4} dx={40} posicion="45% 50%" brillo={0.3} durS={4} />
      <Velo />
      <div style={{ position: 'absolute', left: 64, top: 380, ...ancho(75, 600), fontSize: 260, lineHeight: 0.85, color: 'rgba(34,184,240,.35)' }}>20%</div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 720, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start' }}>
        <Chip ambar desde={cuando('aviso', 'estimación')} style={{ fontSize: 40 }}>Estimación de ingeniería</Chip>
        <Chip ambar desde={cuando('aviso', 'todavía')} style={{ fontSize: 34 }}>No medida en autos chilenos</Chip>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1010, fontFamily: F.texto, fontSize: 40, lineHeight: 1.3, color: '#c3ccd0', opacity: avance(f, cuando('aviso', 'medida'), 10) }}>
        Lo confirmamos en el diagnóstico con tu ruta real.
      </div>
    </AbsoluteFill>
  )
}

function Quien() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Foto src="lumine-05-colectivero-santiago.jpg" de={1.25} a={1.35} dx={60} posicion="58% 50%" brillo={0.8} />
      <Velo />
      <Titular>Para quien<br /><Serif>maneja mucho</Serif></Titular>
      <div style={{ position: 'absolute', left: 64, top: 1000, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <Chip desde={cuando('quien', 'colectiveros')}>Colectiveros</Chip>
        <Chip desde={cuando('quien', 'conductores')}>Conductores de aplicación</Chip>
      </div>
      <Nota style={{ top: 1200 }}>Imagen conceptual</Nota>
    </AbsoluteFill>
  )
}

function Puede() {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Rejilla />
      <Titular>¿Tu auto<br /><Serif>puede?</Serif></Titular>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1110, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 24px 12px 12px', background: 'rgba(10,13,15,.9)', border: `2px solid ${C.accent}`, ...MONO, fontSize: 30, fontWeight: 700, color: C.fg, opacity: avance(f, cuando('puede', 'tracción'), 8) }}>
          <Check />Tracción delantera
        </div>
        <div style={{ ...MONO, fontSize: 24, color: '#aab4b8', paddingLeft: 12, opacity: avance(f, cuando('puede', 'candidato'), 8) }}>+ modelo en la biblioteca de calibraciones</div>
      </div>
    </AbsoluteFill>
  )
}

function Diagnostico() {
  const f = useCurrentFrame()
  const sello = spring({ frame: f - cuando('diagnostico', 'si'), fps: FPS, config: { damping: 10, mass: 0.6 } })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Foto src="lumine-16-taller.jpg" de={1.15} a={1.25} dx={-60} posicion="55% 40%" brillo={0.62} />
      <Velo />
      <Titular>Primero,<br /><Serif>un diagnóstico</Serif></Titular>
      <div style={{ position: 'absolute', left: 64, top: 1020, padding: '22px 30px', border: `3px solid ${C.accent}`, background: 'rgba(2,3,4,.85)', transform: `rotate(-3deg) scale(${1.3 - 0.3 * sello})`, opacity: Math.min(1, sello * 1.4), ...MONO, fontSize: 36, fontWeight: 700, color: C.fg }}>
        Si no te conviene,<br /><span style={{ color: C.accent }}>no se instala</span>
      </div>
      <Nota style={{ top: 1250 }}>Proceso propuesto · imagen conceptual</Nota>
    </AbsoluteFill>
  )
}

function Cierre() {
  const f = useCurrentFrame()
  const s = spring({ frame: f - 2, fps: FPS, config: { damping: 12, mass: 0.7 } })
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Rejilla />
      <div style={{ position: 'absolute', left: -280, right: -280, top: 640, height: 900, opacity: avance(f, 0, 10), transform: `scale(${interpolate(f, [0, 90], [0.96, 1.02])})`, maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)' }}>
        <Img src={staticFile('img/lumine-01-rayos-x.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: Math.min(1, s * 1.4), transform: `scale(${0.85 + 0.15 * s})`, color: C.fg }}>
        <Emblema style={{ width: 150, height: 150 }} />
        <PalabraLogo style={{ height: 96, width: 96 * (584 / 96) }} />
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1290, textAlign: 'center', ...ancho(112, 800), fontSize: 76, lineHeight: 1, textTransform: 'uppercase', color: C.fg, opacity: avance(f, fr(linea('cierre').fin) - inicio('cierre'), 10) }}>
        El mismo auto,<br /><Serif>ahora híbrido.</Serif>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1560, textAlign: 'center', ...MONO, fontSize: 24, color: '#9aa5a9', opacity: avance(f, 20, 12) }}>
        Lumine Motors · proyecto en desarrollo<br />ahorro estimado, no medido · imágenes conceptuales
      </div>
    </AbsoluteFill>
  )
}

const ESCENAS: Record<string, () => ReactElement> = {
  gancho: Gancho,
  kit: Kit,
  motor: () => <Pieza n="01" img="motor.webp" titulo={<>Motor<br /><Serif>eléctrico</Serif></>} chip="Eje trasero" escena="motor" gira={-6} />,
  bateria: () => <Pieza n="02" img="baterias.webp" titulo={<>Banco de<br /><Serif>baterías</Serif></>} chip="Guarda la energía" escena="bateria" gira={4} />,
  control: () => <Pieza n="03" img="control.webp" titulo={<>Unidad de<br /><Serif>control</Serif></>} chip="Decide cuándo ayudar" escena="control" gira={-4} />,
  ciudad: Ciudad,
  frenar: () => <Escena3D titulo={<>Al frenar,<br /><Serif>recupera</Serif></>} chips={[{ t: 'Energía → baterías', en: cuando('frenar', 'recupera') }]} />,
  acelerar: () => <Escena3D titulo={<>Al acelerar,<br /><Serif>empuja</Serif></>} chips={[{ t: 'La bencina se esfuerza menos', en: cuando('acelerar', 'bencina') }]} />,
  intacto: Intacto,
  ahorro: Ahorro,
  aviso: Aviso,
  quien: Quien,
  puede: Puede,
  diagnostico: Diagnostico,
  cierre: Cierre,
}
