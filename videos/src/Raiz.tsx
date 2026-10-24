import { Composition } from 'remotion'
import { Comercial, DURACION_COMERCIAL } from './Comercial'
import { DURACION_HABILITA, Habilita } from './Habilita'
import { FPS } from './marca'
import './fuentes'

export function Raiz() {
  return (
    <>
      <Composition id="Comercial" component={Comercial} durationInFrames={DURACION_COMERCIAL} fps={FPS} width={1920} height={1080} />
      <Composition id="Habilita" component={Habilita} durationInFrames={DURACION_HABILITA} fps={FPS} width={1920} height={1080} />
    </>
  )
}
