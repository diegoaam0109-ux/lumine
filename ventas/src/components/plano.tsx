import { motion, useReducedMotion } from 'framer-motion'

/* Plano técnico del kit (SVG propio, vectorial): un auto genérico en vista lateral,
   con el kit Lumine en el eje trasero. Se dibuja al entrar en pantalla. */

const CARROCERIA = 'M110 330 L100 285 Q100 255 130 245 L420 212 Q470 160 540 132 Q560 126 600 125 L850 125 Q880 126 905 140 L1040 205 Q1080 215 1090 240 L1096 290 Q1096 330 1080 330 L1002 330 A72 72 0 0 0 858 330 L322 330 A72 72 0 0 0 178 330 Z'
const VENTANAS = ['M452 210 L548 145 Q560 138 590 137 L698 137 L698 210 Z', 'M714 137 L846 137 Q868 138 886 148 L980 208 L714 210 Z']
const LINEAS = ['M706 130 L706 322', 'M446 216 L452 322', 'M960 214 L962 322', 'M130 262 L180 258', 'M1060 222 L1088 236']

export const PIEZAS_PLANO = [
  { n: '01', t: 'Motor original', d: 'Intacto, con su tracción delantera.', x: 372, y: 262, lx: 150 },
  { n: '02', t: 'Unidad de control', d: 'Decide cuándo asistir y corta ante fallas.', x: 552, y: 268, lx: 470 },
  { n: '03', t: 'Banco de baterías', d: 'Guarda la energía del frenado.', x: 742, y: 298, lx: 720 },
  { n: '04', t: 'Motor eléctrico', d: 'En el eje trasero, con freno regenerativo.', x: 930, y: 318, lx: 960 },
]

export function Plano({ className }: { className?: string }) {
  const quieto = useReducedMotion()
  const dibujo = (delay: number, dur = 1.6) => quieto
    ? {}
    : { initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, margin: '-15% 0px' }, transition: { pathLength: { duration: dur, delay, ease: [0.65, 0, 0.35, 1] as const }, opacity: { duration: 0.2, delay } } }
  const aparece = (delay: number) => quieto
    ? {}
    : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-15% 0px' }, transition: { duration: 0.6, delay } }
  return (
    <svg viewBox="0 0 1200 430" className={className} role="img" aria-label="Plano del kit Lumine: auto en vista lateral con el motor original adelante, la unidad de control, el banco de baterías y el motor eléctrico en el eje trasero">
      <defs>
        <pattern id="plano-rejilla" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="var(--grid)" strokeWidth="1" /></pattern>
        <linearGradient id="plano-suelo" x1="0" x2="1"><stop offset="0" stopColor="var(--line-2)" stopOpacity="0" /><stop offset=".5" stopColor="var(--line-2)" /><stop offset="1" stopColor="var(--line-2)" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1200" height="430" fill="url(#plano-rejilla)" />
      {/* suelo y cotas */}
      <line x1="40" y1="372" x2="1160" y2="372" stroke="url(#plano-suelo)" strokeWidth="1.5" />
      <g stroke="var(--dim)" strokeWidth="1" fill="none">
        <path d="M250 392 V404 M930 392 V404 M250 398 H930" />
      </g>
      <text x="590" y="420" textAnchor="middle" className="fill-[var(--muted)] font-mono text-[13px] uppercase tracking-[0.2em]">Distancia entre ejes · sin cambios</text>

      {/* carrocería, ventanas y líneas de puertas */}
      <motion.path d={CARROCERIA} fill="none" stroke="var(--fg)" strokeOpacity=".75" strokeWidth="2" strokeLinejoin="round" {...dibujo(0, 2.2)} />
      {VENTANAS.map((d, i) => <motion.path key={d} d={d} fill="var(--fg)" fillOpacity=".04" stroke="var(--fg)" strokeOpacity=".4" strokeWidth="1.5" {...dibujo(0.6 + i * 0.2)} />)}
      {LINEAS.map((d, i) => <motion.path key={d} d={d} fill="none" stroke="var(--fg)" strokeOpacity=".3" strokeWidth="1.2" {...dibujo(1 + i * 0.1, 0.8)} />)}

      {/* ruedas */}
      {[250, 930].map((cx, i) => (
        <g key={cx}>
          <motion.circle cx={cx} cy="320" r="52" fill="var(--bg)" stroke="var(--fg)" strokeOpacity=".8" strokeWidth="2" {...dibujo(0.4 + i * 0.2, 1.2)} />
          <motion.circle cx={cx} cy="320" r="32" fill="none" stroke="var(--fg)" strokeOpacity=".35" strokeWidth="1.5" {...dibujo(0.7 + i * 0.2, 1)} />
          <circle cx={cx} cy="320" r="7" fill="var(--fg)" fillOpacity=".6" />
        </g>
      ))}

      {/* motor original (adelante) */}
      <motion.g {...aparece(1.4)}>
        <rect x="326" y="236" width="104" height="54" rx="4" fill="var(--fg)" fillOpacity=".06" stroke="var(--fg)" strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M340 250 H416 M340 263 H416 M340 276 H416" stroke="var(--fg)" strokeOpacity=".25" />
      </motion.g>

      {/* kit Lumine */}
      <motion.g {...aparece(1.8)}>
        {/* cables de alta tensión */}
        <path d="M842 300 C870 300 872 318 886 318" fill="none" stroke="#FF8A1F" strokeWidth="3" strokeLinecap="round" />
        <path d="M640 300 C606 300 604 270 582 270" fill="none" stroke="#FF8A1F" strokeWidth="3" strokeLinecap="round" />
        {/* unidad de control */}
        <rect x="522" y="254" width="60" height="32" rx="3" fill="var(--accent)" fillOpacity=".18" stroke="var(--accent)" strokeWidth="1.8" />
        <path d="M532 264 H572 M532 272 H562" stroke="var(--accent)" strokeWidth="1.5" />
        {/* banco de baterías */}
        <rect x="640" y="282" width="202" height="36" rx="3" fill="var(--accent)" fillOpacity=".14" stroke="var(--accent)" strokeWidth="1.8" />
        {Array.from({ length: 7 }, (_, k) => <line key={k} x1={665 + k * 25} y1="286" x2={665 + k * 25} y2="314" stroke="var(--accent)" strokeOpacity=".55" />)}
        {/* motor eléctrico en el eje trasero */}
        <rect x="884" y="302" width="92" height="36" rx="8" fill="var(--accent)" fillOpacity=".3" stroke="var(--accent)" strokeWidth="2" />
        <path d="M896 312 H964 M896 320 H964 M896 328 H964" stroke="var(--accent)" strokeOpacity=".7" />
      </motion.g>
      {/* pulso de energía por el cable */}
      {quieto ? null : <circle r="4" fill="#FF8A1F"><animateMotion dur="2.4s" repeatCount="indefinite" path="M642 300 C606 300 604 270 582 270" keyPoints="1;0" keyTimes="0;1" calcMode="linear" /></circle>}
      {quieto ? null : <circle r="4" fill="#FF8A1F"><animateMotion dur="1.6s" repeatCount="indefinite" path="M842 300 C870 300 872 318 886 318" /></circle>}

      {/* llamadas */}
      {PIEZAS_PLANO.map((p, i) => (
        <motion.g key={p.n} {...aparece(2.2 + i * 0.15)}>
          <path d={`M${p.x} ${p.y} V${62 + (i % 2) * 18} H${p.lx}`} fill="none" stroke={i ? 'var(--accent)' : 'var(--muted)'} strokeOpacity=".7" strokeWidth="1" />
          <circle cx={p.x} cy={p.y} r="4" fill={i ? 'var(--accent)' : 'var(--muted)'} />
          <rect x={p.lx - 2} y={44 + (i % 2) * 18} width="26" height="20" fill={i ? 'var(--accent)' : 'var(--control)'} />
          <text x={p.lx + 11} y={58 + (i % 2) * 18} textAnchor="middle" className={(i ? 'fill-[#031015]' : 'fill-[var(--fg)]') + ' font-mono text-[12px] font-medium'}>{p.n}</text>
          <text x={p.lx + 32} y={58 + (i % 2) * 18} className="fill-[var(--fg)] font-mono text-[13px] uppercase tracking-[0.14em]">{p.t}</text>
        </motion.g>
      ))}
    </svg>
  )
}
