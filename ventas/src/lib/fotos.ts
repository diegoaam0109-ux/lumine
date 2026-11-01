/* Imágenes conceptuales de Lumine (hechas con IA y revisadas por el equipo).
   Son visualizaciones: la configuración real de cada instalación se define en el diagnóstico. */
import portada from '@/assets/fotos/portada-rayos-x.webp'
import kit from '@/assets/fotos/kit-completo.webp'
import motor from '@/assets/fotos/motor.webp'
import baterias from '@/assets/fotos/baterias.webp'
import control from '@/assets/fotos/control.webp'
import particulares from '@/assets/fotos/particulares.webp'
import flotas from '@/assets/fotos/flotas.webp'
import bencinera from '@/assets/fotos/bencinera.webp'
import taller from '@/assets/fotos/taller.webp'
import seguridad from '@/assets/fotos/seguridad.webp'
// versiones para el modo claro (fondo blanco o de día), hechas con ChatGPT desde las mismas referencias
import portadaClaro from '@/assets/fotos/claro/portada-rayos-x.webp'
import kitClaro from '@/assets/fotos/claro/kit-completo.webp'
import motorClaro from '@/assets/fotos/claro/motor.webp'
import bateriasClaro from '@/assets/fotos/claro/baterias.webp'
import controlClaro from '@/assets/fotos/claro/control.webp'
import particularesClaro from '@/assets/fotos/claro/particulares.webp'
import bencineraClaro from '@/assets/fotos/claro/bencinera.webp'
import tallerClaro from '@/assets/fotos/claro/taller.webp'
import seguridadClaro from '@/assets/fotos/claro/seguridad.webp'

/** `claro`: la versión que se muestra en modo claro; sin ella, la foto oscura se ve en ambos temas. */
export type Foto = { src: string; alt: string; claro?: string }
export const FOTOS = {
  portada: { src: portada, claro: portadaClaro, alt: 'Sedán en vista de rayos X con el kit Lumine: banco de baterías y motor eléctrico en el eje trasero' },
  kit: { src: kit, claro: kitClaro, alt: 'Vista de conjunto conceptual de los componentes del kit híbrido Lumine' },
  motor: { src: motor, claro: motorClaro, alt: 'Render conceptual de motor eléctrico compacto' },
  baterias: { src: baterias, claro: bateriasClaro, alt: 'Render conceptual de banco plano de baterías LFP' },
  control: { src: control, claro: controlClaro, alt: 'Render de unidad electrónica de control en aluminio' },
  particulares: { src: particulares, claro: particularesClaro, alt: 'Sedán negro de uso laboral en Santiago' },
  flotas: { src: flotas, alt: 'Flota de sedanes grafito en un patio nocturno' },
  bencinera: { src: bencinera, claro: bencineraClaro, alt: 'Sedán negro pasa frente a una estación de combustible sin detenerse' },
  taller: { src: taller, claro: tallerClaro, alt: 'Taller con sedanes en elevadores y técnicos trabajando en el eje trasero' },
  seguridad: { src: seguridad, claro: seguridadClaro, alt: 'Técnico con careta y guantes aislantes revisa el cableado de alta tensión' },
} satisfies Record<string, Foto>
