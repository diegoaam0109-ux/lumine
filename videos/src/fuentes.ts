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

// Archivo variable con eje de ancho (la de la página comercial: font-stretch 68–112%)
const VARIABLE: [string, string][] = [
  ['archivo-latin-wdth-normal.woff2', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'],
  ['archivo-latin-ext-wdth-normal.woff2', 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'],
]

const espera = delayRender('Cargando tipografías')
Promise.all([
  ...VARIABLE.map(([archivo, rango]) =>
    new FontFace('Archivo Var', `url(${staticFile('fuentes/' + archivo)})`, { weight: '100 900', stretch: '62% 125%', unicodeRange: rango })
      .load()
      .then((f) => (document.fonts as unknown as Set<FontFace>).add(f)),
  ),
  ...LISTA.map(([familia, archivo, peso, estilo]) =>
    new FontFace(familia, `url(${staticFile('fuentes/' + archivo)})`, { weight: peso, style: estilo })
      .load()
      .then((f) => (document.fonts as unknown as Set<FontFace>).add(f)),
  ),
]).then(() => continueRender(espera))

export const F = {
  titular: '"Archivo SemiExpanded", sans-serif',
  cifra: '"Archivo Condensed", sans-serif',
  texto: 'Figtree, sans-serif',
  mono: '"IBM Plex Mono", monospace',
  serif: '"Instrument Serif", serif',
  /** Archivo variable: usar con fontStretch (68% monumental, 75% cifras, 112% titulares) */
  archivo: '"Archivo Var", sans-serif',
}
