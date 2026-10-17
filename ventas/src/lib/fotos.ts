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

export const FOTOS = {
  portada: { src: portada, alt: 'Sedán en vista de rayos X con el kit Lumine: banco de baterías y motor eléctrico en el eje trasero' },
  kit: { src: kit, alt: 'Vista de conjunto conceptual de los componentes del kit híbrido Lumine' },
  motor: { src: motor, alt: 'Render conceptual de motor eléctrico compacto sobre fondo negro' },
  baterias: { src: baterias, alt: 'Render conceptual de banco plano de baterías LFP' },
  control: { src: control, alt: 'Render de unidad electrónica de control en aluminio' },
  particulares: { src: particulares, alt: 'Sedán negro de uso laboral en Santiago de noche' },
  flotas: { src: flotas, alt: 'Flota de sedanes grafito en un patio nocturno' },
  bencinera: { src: bencinera, alt: 'Sedán negro pasa frente a una estación de combustible sin detenerse' },
  taller: { src: taller, alt: 'Taller con sedanes en elevadores y técnicos trabajando en el eje trasero' },
  seguridad: { src: seguridad, alt: 'Técnico con careta y guantes aislantes revisa el cableado de alta tensión' },
}
export type Foto = (typeof FOTOS)[keyof typeof FOTOS]
