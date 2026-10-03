import { MotionConfig } from 'framer-motion'
import { Hero, Nav } from '@/sections/portada'
import { ComoFunciona, ParaQuien } from '@/sections/venta'
import { Calculadora, Compatibilidad } from '@/sections/herramientas'
import { Agendar, BarraMovil, Confianza, Pie, Preguntas, Proceso } from '@/sections/cierre'

/* Página comercial de Lumine Motors (particulares y flotas) */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">Saltar al contenido</a>
      <Nav />
      <main id="contenido">
        <Hero />
        <ParaQuien />
        <ComoFunciona />
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
