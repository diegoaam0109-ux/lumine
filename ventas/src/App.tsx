import { MotionConfig } from 'framer-motion'
import { Cifras, Franja, Hero, Manifiesto, Nav } from '@/sections/portada'
import { ComoFunciona, ParaQuien } from '@/sections/venta'
import { Calculadora, Compatibilidad } from '@/sections/herramientas'
import { Agendar, BarraMovil, Confianza, Pie, Preguntas, Proceso } from '@/sections/cierre'

/* Página comercial de Lumine Motors (particulares y flotas) */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenido" className="t-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">Saltar al contenido</a>
      <Nav />
      <main id="contenido">
        <Hero />
        <Manifiesto />
        <ComoFunciona />
        <Franja />
        <ParaQuien />
        <Cifras />
        <Calculadora />
        <Compatibilidad />
        <Proceso />
        <Confianza />
        <Preguntas />
        <Agendar />
      </main>
      <Pie />
      <BarraMovil />
    </MotionConfig>
  )
}
