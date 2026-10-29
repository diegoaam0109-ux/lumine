/* Visor del kit de Lumine Habilita, adaptado para video.
   Geometría, anclas y colores copiados de src/engine3d.js (laboratorio 3D de Habilita):
   el mismo auto de baja poligonización con el kit en el eje trasero.
   Cambios para video: el estado de cámara llega por cuadro (determinista, sin requestAnimationFrame
   ni interacción) y se agrega un brillo celeste a las piezas del kit para leerlas desde lejos. */

type V3 = [number, number, number]
type Parte = { id: string; grupo: string; color: number[]; faces: V3[][]; alpha: number; ex: V3; pick?: string; c: V3; n: V3[] }

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
const avg = (pts: V3[]): V3 => { const s: V3 = [0, 0, 0]; for (const p of pts) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2] } return [s[0] / pts.length, s[1] / pts.length, s[2] / pts.length] }

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): V3[][] {
  const v = (x: number, y: number, z: number): V3 => [x, y, z]
  return [
    [v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], [v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0)],
    [v(x0, y1, z0), v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0)], [v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1)],
    [v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0)], [v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1)],
  ]
}
function extrude(prof: [number, number][], z0: number, z1: number): V3[][] {
  const f: V3[][] = [prof.map(([x, y]) => [x, y, z1] as V3), prof.slice().reverse().map(([x, y]) => [x, y, z0] as V3)]
  for (let i = 0; i < prof.length; i++) { const [x1, y1] = prof[i], [x2, y2] = prof[(i + 1) % prof.length]; f.push([[x1, y1, z0], [x2, y2, z0], [x2, y2, z1], [x1, y1, z1]]) }
  return f
}
function cylZ(cx: number, cy: number, cz: number, r: number, len: number, seg = 14): V3[][] {
  const f: V3[][] = []; const z0 = cz - len / 2, z1 = cz + len / 2
  const ring = (z: number) => Array.from({ length: seg }, (_, i) => { const a = (i / seg) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3 })
  const A = ring(z0), B = ring(z1)
  for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; f.push([A[i], A[j], B[j], B[i]]) }
  f.push(B.slice()); f.push(A.slice().reverse())
  return f
}
function tubo(a: V3, b: V3, w: number): V3[][] {
  const d = norm(sub(b, a)); const up: V3 = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]
  const s1 = norm(cross(d, up)), s2 = norm(cross(d, s1))
  const off = (p: V3, i: number, j: number): V3 => [p[0] + (s1[0] * i + s2[0] * j) * w, p[1] + (s1[1] * i + s2[1] * j) * w, p[2] + (s1[2] * i + s2[2] * j) * w]
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  const A = c.map(([i, j]) => off(a, i, j)), B = c.map(([i, j]) => off(b, i, j))
  const f: V3[][] = []; for (let i = 0; i < 4; i++) { const k = (i + 1) % 4; f.push([A[i], A[k], B[k], B[i]]) }
  return f
}

function construir(): Parte[] {
  const P: Parte[] = []
  const parte = (id: string, grupo: string, color: number[], faces: V3[][], o?: Partial<Parte>) =>
    P.push(Object.assign({ id, grupo, color, faces, alpha: 1, ex: [0, 0, 0] as V3, c: [0, 0, 0] as V3, n: [] as V3[] }, o || {}))
  const baja: [number, number][] = [[-2.12, 0.30], [2.10, 0.30], [2.16, 0.62], [2.10, 0.96], [1.60, 1.00], [-1.00, 0.93], [-2.02, 0.80], [-2.16, 0.60]]
  parte('carroceria', 'body', [104, 118, 126], extrude(baja, -0.84, 0.84))
  parte('cabina', 'glass', [92, 140, 160], extrude([[-1.00, 0.93], [1.60, 1.00], [0.92, 1.42], [-0.30, 1.42]], -0.72, 0.72), { alpha: 0.42 })
  const rueda = (x: number, z: number, trasera?: boolean) => parte('rueda' + x + z, trasera ? 'rear' : 'base', [26, 30, 33], cylZ(x, 0.32, z, 0.32, 0.22, 16))
  rueda(-1.36, -0.80); rueda(-1.36, 0.80); rueda(1.36, -0.80, true); rueda(1.36, 0.80, true)
  parte('combustion', 'base', [96, 106, 112], box(-1.95, -1.15, 0.42, 0.82, -0.42, 0.42), { pick: 'combustion', ex: [-0.25, 0.75, 0] })
  parte('eje', 'rear', [70, 80, 86], cylZ(1.36, 0.32, 0, 0.05, 1.44, 8), { ex: [0, 0.55, 0] })
  parte('motor', 'kit', [34, 184, 240], cylZ(1.36, 0.32, 0, 0.17, 0.42, 16), { pick: 'motor', ex: [0, 0.95, 0] })
  parte('regen1', 'kit', [120, 214, 247], cylZ(1.36, 0.32, -0.66, 0.22, 0.05, 16), { pick: 'regen', ex: [0, 0.75, -0.25] })
  parte('regen2', 'kit', [120, 214, 247], cylZ(1.36, 0.32, 0.66, 0.22, 0.05, 16), { pick: 'regen', ex: [0, 0.75, 0.25] })
  parte('bateria', 'kit', [24, 150, 205], box(0.55, 1.05, 0.40, 0.62, -0.55, 0.55), { pick: 'bateria', ex: [0, 1.55, 0] })
  parte('ecu', 'kit', [230, 244, 250], box(-0.78, -0.48, 0.70, 0.84, 0.12, 0.40), { pick: 'ecu', ex: [0, 1.35, 0.3] })
  const naranja = [242, 140, 40]
  parte('cable1', 'kit', naranja, tubo([1.05, 0.46, 0.2], [1.25, 0.40, 0.12], 0.028), { pick: 'cables', ex: [0, 1.2, 0] })
  parte('cable2', 'kit', naranja, tubo([1.05, 0.46, -0.2], [1.25, 0.40, -0.12], 0.028), { pick: 'cables', ex: [0, 1.2, 0] })
  parte('senal', 'kit', [150, 170, 180], tubo([-0.48, 0.74, 0.26], [0.55, 0.55, 0.3], 0.016), { pick: 'ecu', ex: [0, 1.25, 0.3] })
  parte('obd', 'base', [200, 210, 214], box(-1.05, -0.92, 0.66, 0.74, 0.30, 0.42), { pick: 'obd', ex: [0, 0.9, 0] })
  for (const p of P) {
    p.c = avg(p.faces.flat())
    p.n = p.faces.map((f) => { let n = norm(cross(sub(f[1], f[0]), sub(f[2], f[0]))); const fc = avg(f); if (dot(n, sub(fc, p.c)) < 0) n = [-n[0], -n[1], -n[2]]; return n })
  }
  return P
}
const PARTES = construir()
export const ANCLAS: Record<string, V3> = { motor: [1.36, 0.32, 0], regen: [1.36, 0.32, 0.66], bateria: [0.8, 0.62, 0], ecu: [-0.63, 0.84, 0.26], cables: [1.15, 0.44, 0.16], combustion: [-1.55, 0.82, 0], obd: [-0.98, 0.74, 0.36] }

export type Camara = { yaw: number; pitch: number; dist: number; ex: number; xray: number; sel: string | string[] | null; t: number; cx?: number; cy?: number; escala?: number }

function proyector(st: Camara, w: number, h: number) {
  const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch)
  const f = Math.min(w * 1.22, h * 1.6) * (st.escala ?? 1)
  const ox = w * (st.cx ?? 0.5), oy = h * (st.cy ?? 0.54)
  return (p: V3): [number, number, number] => {
    const tx = p[0] - 0.05, ty = p[1] - 0.62, tz = p[2]
    const x1 = tx * cy - tz * sy, z1 = tx * sy + tz * cy
    const y2 = ty * cp - z1 * sp, z2 = ty * sp + z1 * cp + st.dist
    return [ox + (x1 * f) / z2, oy - (y2 * f) / z2, z2]
  }
}
const desplazamiento = (p: Parte, ex: number): V3 => [p.ex[0] * ex, p.ex[1] * ex, p.ex[2] * ex]

/** Punto en pantalla del ancla de una pieza (para las líneas de las etiquetas). */
export function ancla(id: string, st: Camara, w: number, h: number): [number, number] {
  const pieza = PARTES.find((p) => (p.pick || p.id) === id)!
  const o = desplazamiento(pieza, st.ex)
  const a = ANCLAS[id]
  const q = proyector(st, w, h)([a[0] + o[0], a[1] + o[1], a[2] + o[2]])
  return [q[0], q[1]]
}

const L = norm([-0.45, 0.85, -0.55])

export function dibujar(ctx: CanvasRenderingContext2D, w: number, h: number, st: Camara) {
  const proyectar = proyector(st, w, h)
  ctx.clearRect(0, 0, w, h)
  // piso: grilla del taller
  ctx.lineWidth = 1.2
  for (let i = -6; i <= 6; i++) {
    for (const eje of [0, 1]) {
      const a = eje ? proyectar([i * 0.6, 0, -3.6]) : proyectar([-3.6, 0, i * 0.6])
      const b = eje ? proyectar([i * 0.6, 0, 3.6]) : proyectar([3.6, 0, i * 0.6])
      if (a[2] <= 0.2 || b[2] <= 0.2) continue
      ctx.strokeStyle = 'rgba(120,200,240,' + (i === 0 ? 0.16 : 0.07) + ')'
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
    }
  }
  // sombra y reflejo celeste bajo el eje trasero
  const s0 = proyectar([0, 0, 0])
  const g = ctx.createRadialGradient(s0[0], s0[1], 4, s0[0], s0[1], Math.max(40, w * 0.32))
  g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(s0[0], s0[1], w * 0.34, h * 0.09, 0, 0, Math.PI * 2); ctx.fill()
  const s1 = proyectar([1.0, 0, 0])
  const g2 = ctx.createRadialGradient(s1[0], s1[1], 2, s1[0], s1[1], w * 0.22)
  g2.addColorStop(0, `rgba(34,184,240,${0.10 + 0.12 * st.xray})`); g2.addColorStop(1, 'rgba(34,184,240,0)')
  ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(s1[0], s1[1], w * 0.24, h * 0.07, 0, 0, Math.PI * 2); ctx.fill()

  const lista: { pr: [number, number, number][]; z: number; p: Parte; luz: number; alpha: number; elegido: boolean; back: boolean }[] = []
  for (const p of PARTES) {
    const off = desplazamiento(p, st.ex)
    let alpha = p.alpha
    const cuerpo = p.grupo === 'body' || p.grupo === 'glass'
    if (cuerpo) {
      const rx = p.grupo === 'glass' ? 0.05 : 0.08
      alpha = alpha + (rx - alpha) * st.xray
      if (st.ex > 0.01) alpha = Math.min(alpha, 1 - st.ex * 0.86)
    }
    if (alpha <= 0.01) continue
    const sels = Array.isArray(st.sel) ? st.sel : st.sel ? [st.sel] : []
    const elegido = sels.includes(p.pick ?? '') || sels.includes(p.id)
    for (let i = 0; i < p.faces.length; i++) {
      const f = p.faces[i].map((v) => [v[0] + off[0], v[1] + off[1], v[2] + off[2]] as V3)
      const pr = f.map(proyectar)
      if (pr.some((q) => q[2] <= 0.2)) continue
      let area = 0; for (let k = 0; k < pr.length; k++) { const a = pr[k], b = pr[(k + 1) % pr.length]; area += a[0] * b[1] - b[0] * a[1] }
      const transp = alpha < 0.99
      if (area >= 0 && !transp) continue
      const z = pr.reduce((s, q) => s + q[2], 0) / pr.length
      const luz = 0.34 + 0.66 * Math.max(0, dot(p.n[i], L))
      lista.push({ pr, z, p, luz, alpha, elegido, back: area >= 0 })
    }
  }
  lista.sort((a, b) => b.z - a.z)
  const pulso = 0.5 + 0.5 * Math.sin(st.t * 4)
  for (const it of lista) {
    const c = it.p.color; let k = it.luz
    if (it.elegido) k = Math.min(1.35, k + 0.25 + pulso * 0.15)
    const col = 'rgba(' + Math.min(255, (c[0] * k) | 0) + ',' + Math.min(255, (c[1] * k) | 0) + ',' + Math.min(255, (c[2] * k) | 0) + ',' + (it.back ? it.alpha * 0.5 : it.alpha) + ')'
    ctx.beginPath(); ctx.moveTo(it.pr[0][0], it.pr[0][1]); for (let i = 1; i < it.pr.length; i++) ctx.lineTo(it.pr[i][0], it.pr[i][1]); ctx.closePath()
    const kit = it.p.grupo === 'kit'
    if (kit) { ctx.shadowColor = it.elegido ? 'rgba(80,210,255,.9)' : 'rgba(34,184,240,.45)'; ctx.shadowBlur = (it.elegido ? 26 : 12) * (w / 1920) }
    ctx.fillStyle = col; ctx.fill()
    ctx.shadowBlur = 0
    const cuerpo = it.p.grupo === 'body' || it.p.grupo === 'glass'
    if (cuerpo && (st.xray > 0.05 || st.ex > 0.01)) { ctx.strokeStyle = `rgba(160,215,240,${0.1 + 0.22 * Math.max(st.xray, st.ex)})`; ctx.lineWidth = 1.4 * (w / 1920); ctx.stroke() }
    else if (it.elegido) { ctx.strokeStyle = 'rgba(160,235,255,.95)'; ctx.lineWidth = 2.4 * (w / 1920); ctx.stroke() }
    else if (kit) { ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1 * (w / 1920); ctx.stroke() }
    else { ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 0.8 * (w / 1920); ctx.stroke() }
  }
}
