/* Tipografías de la marca (las mismas .ttf de control-de-gestion/fuentes). Se cargan antes del primer cuadro. */
import { continueRender, delayRender, staticFile } from 'remotion'

const LISTA: [string, string, string, string][] = [
  ['Archivo SemiExpanded', 'ArchivoSemiExpanded-ExtraBold.ttf', '800', 'normal'],
  ['Archivo Condensed', 'ArchivoCondensed-Bold.ttf', '700', 'normal'],
  ['Archivo Condensed', 'ArchivoCondensed-Regular.ttf', '400', 'normal'],
  ['Figtree', 'Figtree-Regular.ttf', '400', 'normal'],
  ['Figtree', 'Figtree-Bold.ttf', '700', 'normal'],
  ['IBM Plex Mono', 'IBMPlexMono-Regular.ttf', '400', 'normal'],
  ['IBM Plex Mono', 'IBMPlexMono-Bold.ttf', '700', 'normal'],
  ['Instrument Serif', 'InstrumentSerif-Italic.ttf', '400', 'italic'],
]

const espera = delayRender('Cargando tipografías')
Promise.all(
  LISTA.map(([familia, archivo, peso, estilo]) =>
    new FontFace(familia, `url(${staticFile('fuentes/' + archivo)})`, { weight: peso, style: estilo })
      .load()
      .then((f) => (document.fonts as unknown as Set<FontFace>).add(f)),
  ),
).then(() => continueRender(espera))

export const F = {
  titular: '"Archivo SemiExpanded", sans-serif',
  cifra: '"Archivo Condensed", sans-serif',
  texto: 'Figtree, sans-serif',
  mono: '"IBM Plex Mono", monospace',
  serif: '"Instrument Serif", serif',
}
