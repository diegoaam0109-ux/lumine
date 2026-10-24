/* Piezas comunes de los dos videos: colores, tiempos y motivos de la marca
   (rejilla con foco, etiqueta con índice, esquinas de visor, foto con acercamiento lento). */
import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { F } from './fuentes'

export const C = {
  bg: '#020304',
  surface: '#0a0d0f',
  well: '#101417',
  fg: '#ececec',
  muted: '#8b9598',
  dim: '#4b5154',
  line: '#1f2427',
  line2: '#2e3438',
  accent: '#22B8F0',
  onAccent: '#031015',
  warn: '#F5B94A',
  cable: '#FF8A1F',
}

export const FPS = 30
/** Duración de las transiciones entre escenas (0,5 s). */
export const T = 15
export const s = (seg: number) => Math.round(seg * FPS)

const suave = Easing.bezier(0.2, 0.7, 0.2, 1)

/** 0 → 1 entre dos cuadros, con la curva de la marca. */
export function avance(frame: number, desde: number, dur: number, curva = suave) {
  return interpolate(frame, [desde, desde + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva })
}

/** Entrada estándar: sube 24 px y aparece. */
export function entrada(frame: number, desde: number, dur = 14, dy = 24): CSSProperties {
  const p = avance(frame, desde, dur)
  return { opacity: p, transform: `translateY(${(1 - p) * dy}px)` }
}

/** Escena que aparece con un fundido sobre la anterior (la transición principal). */
export function Escena({ children, fundido = true, salida }: { children: ReactNode; fundido?: boolean; salida?: number }) {
  const f = useCurrentFrame()
  let o = fundido ? avance(f, 0, T, Easing.inOut(Easing.cubic)) : 1
  if (salida !== undefined) o *= 1 - avance(f, salida, T, Easing.inOut(Easing.cubic))
  return <AbsoluteFill style={{ opacity: o, background: C.bg, overflow: 'hidden' }}>{children}</AbsoluteFill>
}

/** Rejilla de 64 px casi invisible con máscara radial y un foco celeste. */
export function Rejilla({ foco = [0.5, 0.5], fuerza = 1 }: { foco?: [number, number]; fuerza?: number }) {
  const [x, y] = foco
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(186,215,247,${0.05 * fuerza}) 1px, transparent 1px), linear-gradient(90deg, rgba(186,215,247,${0.05 * fuerza}) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          backgroundPosition: '-1px -1px',
          maskImage: `radial-gradient(ellipse 70% 70% at ${x * 100}% ${y * 100}%, #000 0%, transparent 75%)`,
          WebkitMaskImage: `radial-gradient(ellipse 70% 70% at ${x * 100}% ${y * 100}%, #000 0%, transparent 75%)`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 40% at ${x * 100}% ${y * 100}%, rgba(34,184,240,${0.13 * fuerza}), transparent 70%)` }} />
    </AbsoluteFill>
  )
}

/** Foto a pantalla completa con acercamiento lento (Ken Burns) en coordenadas de la escena. */
export function Foto({ src, dur, de = 1.04, a = 1.12, dx = 0, dy = 0, origen = '50% 50%', brillo = 1 }: {
  src: string; dur: number; de?: number; a?: number; dx?: number; dy?: number; origen?: string; brillo?: number
}) {
  const f = useCurrentFrame()
  const p = interpolate(f, [0, dur], [0, 1], { extrapolateRight: 'clamp' })
  const esc = de + (a - de) * p
  return (
    <AbsoluteFill style={{ transform: `translate(${dx * p}px, ${dy * p}px) scale(${esc})`, transformOrigin: origen }}>
      <Img src={staticFile('img/' + src)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: brillo !== 1 ? `brightness(${brillo})` : undefined }} />
    </AbsoluteFill>
  )
}

/** Degradado para que el texto se lea sobre una foto. */
export function Velo({ fondo }: { fondo: string }) {
  return <AbsoluteFill style={{ background: fondo }} />
}

/** Etiqueta con índice: «01 —— TEXTO». */
export function Etiqueta({ n, children, style }: { n?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.mono, fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, ...style }}>
      {n && <span style={{ color: C.accent, fontWeight: 700 }}>{n}</span>}
      {n && <span style={{ width: 56, height: 2, background: C.line2 }} />}
      <span>{children}</span>
    </div>
  )
}

/** Titular de la marca: palabras en Archivo mayúsculas + remate en serif itálica celeste. */
export function Titular({ fuerte, acento, size = 96, style, una = false }: { fuerte: ReactNode; acento?: ReactNode; size?: number; style?: CSSProperties; una?: boolean }) {
  return (
    <div style={{ fontFamily: F.titular, fontWeight: 800, fontSize: size, lineHeight: 0.98, letterSpacing: '-0.025em', textTransform: 'uppercase', color: C.fg, ...style }}>
      {fuerte}
      {acento && (
        <>
          {una ? ' ' : <br />}
          <span style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: '-0.01em', color: C.accent, fontSize: size * 1.18 }}>{acento}</span>
        </>
      )}
    </div>
  )
}

/** Cuatro escuadras celestes de 2 px en las esquinas de una caja. */
export function Esquinas({ largo = 26, grosor = 2, color = C.accent }: { largo?: number; grosor?: number; color?: string }) {
  const b = `${grosor}px solid ${color}`
  const base: CSSProperties = { position: 'absolute', width: largo, height: largo }
  return (
    <>
      <i style={{ ...base, left: -1, top: -1, borderLeft: b, borderTop: b }} />
      <i style={{ ...base, right: -1, top: -1, borderRight: b, borderTop: b }} />
      <i style={{ ...base, left: -1, bottom: -1, borderLeft: b, borderBottom: b }} />
      <i style={{ ...base, right: -1, bottom: -1, borderRight: b, borderBottom: b }} />
    </>
  )
}

/** Nota mono pequeña pero legible (aclaraciones honestas: imagen conceptual, supuesto, etc.). */
export function Nota({ children, style, punteada = false }: { children: ReactNode; style?: CSSProperties; punteada?: boolean }) {
  return (
    <div
      style={{
        fontFamily: F.mono, fontSize: 24, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aab4b8',
        ...(punteada ? { border: `2px dashed ${C.warn}`, color: C.warn, padding: '12px 20px', background: 'rgba(2,3,4,.72)' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Pesos chilenos: $136.457 */
export function pesos(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
