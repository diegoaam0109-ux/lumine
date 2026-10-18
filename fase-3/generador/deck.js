// Presentación de la Fase 3 · Capítulo III: Plan de Marketing, Operaciones y Recursos Humanos de Lumine Motors
// Mismo sistema visual que la presentación de Control de Gestión (control-de-gestion/generador/deck.js):
// escenario negro, un solo acento celeste, titulares anchos en mayúsculas con acento en serif itálica,
// etiquetas mono de instrumento, esquinas de visor, rótulos numerados y números condensados.
// Todas las cifras salen del informe de la Fase 3; lo que falta se marca «Por confirmar».
//
// Rediseño de legibilidad (octubre de 2026): la presentación se lee desde el fondo de una sala universitaria.
// Escala tipográfica fija (ver TX): titulares 34 pt con acento de 40 pt, cuerpo de 20 a 24 pt, etiquetas de
// gráficos de 16 pt o más, cifras de 30 a 48 pt, notas de 14 a 16 pt y elementos institucionales de 11 a 12 pt.
// Si algo no cabe con esos tamaños, se redistribuye o se divide la diapositiva; nunca se achica la letra.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {}; // una función por diapositiva; el orden lo pone guion.js
const OUT = process.argv[2] || 'Grupo_01_LumineMotors_Fase3.pptx';
const A = f => path.join(__dirname, 'assets', f);

// ---------- tema ----------
// Juegos tipográficos. C (elegido por el equipo el 17-10-2026, «deportiva»): titulares en Michroma (estilo Eurostile)
// y el resto en la familia Archivo: acento en itálica liviana, texto normal, etiquetas semicondensadas y cifras condensadas.
// B es igual pero con titulares en Archivo Expanded; A es el de la marca (serif itálica y mono). Se comparan con
// LUMINE_TIPO=A|B|C. Los .ttf de Archivo se crean con mkfonts.py; Michroma viene estática de @fontsource/michroma.
const JUEGOS = {
  A: ['Archivo SemiExpanded ExtraBold', 'Archivo Condensed', 'Figtree', 'IBM Plex Mono', 'Instrument Serif'],
  B: ['Archivo Expanded ExtraBold', 'Archivo Condensed', 'Archivo', 'Archivo SemiCondensed Medium', 'Archivo Expanded Light'],
  C: ['Michroma', 'Archivo Condensed', 'Archivo', 'Archivo SemiCondensed Medium', 'Archivo Expanded Light'],
};
const TIPO = process.env.LUMINE_TIPO || 'C';
// el «%» de Michroma es un dibujo estilizado (o/o) que se lee mal: en los titulares se escribe con Archivo
const F_PCT = 'Archivo Expanded ExtraBold';
const [F_TIT, F_CON, F_BODY, F_MONO, F_SER] = JUEGOS[TIPO];
const THEME = {
  name: 'Lumine',
  headFontFace: F_TIT,
  bodyFontFace: F_BODY,
  // escenario oscuro: el texto (dk1) es claro y el fondo (lt1) es negro, como la página
  colors: {
    dk1: 'ECECEC', lt1: '020304', dk2: '8B9598', lt2: '0A0D0F',
    accent1: '22B8F0', accent2: '8B9598', accent3: '4A5257', accent4: 'ECECEC', // solo la paleta de Lumine
    accent5: '2E3438', accent6: '101417', hlink: '22B8F0', folHlink: '0A6F9E',
  },
};
const HEX = THEME.colors;
const HONDO = '0A6F9E'; // celeste profundo: segunda serie de un gráfico, sin sumar otro color
const HOT = '0B1A22';   // relleno de la caja destacada
const GRAFITO = '1A1E22'; // superficie grafito de controles y segunda serie neutra

// Escala tipográfica (pt). Es la regla de toda la presentación.
const TX = {
  tit: 34, acento: TIPO === 'A' ? 40 : 34,  // titulares (el acento serif es más angosto que una sans ancha)
  sub: 24,                   // subtítulos y frases de cierre de una lámina
  cuerpo: 20, cuerpoL: 22,   // texto
  etq: 16,                   // etiquetas de gráficos y de cajas (mínimo)
  marca: 14,                 // marcas de estado (estimación, supuesto, por confirmar)
  inst: 11,                  // elementos institucionales: curso, fuente, numeración
  cifra: 44, cifraXL: 48, cifraM: 36, cifraS: 30,
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,333 × 7,5 in
pres.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo';
pres.company = 'Lumine Motors';
pres.title = 'Fase 3 · Plan de Marketing, Operaciones y Recursos Humanos · Lumine Motors';
pres.subject = 'Integrador II: Taller de Empresas · ICMA 1001 · Grupo 1';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const C = pres.SchemeColor;
const S = pres.ShapeType;

const W = 13.333, M = 0.6, CW = W - 2 * M, R = W - M;
const LOGO_H = 0.22, LOGO_W = LOGO_H * (127.25 / 26);
const CURSO = 'INTEGRADOR II · ICMA 1001 · GRUPO 1';
const Y0 = 2.62;   // inicio del contenido, bajo el titular
const YF = 6.82;   // fin del contenido, sobre la fuente al pie

// ---------- formato chileno ----------
const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = (n, d = 1) => { const [e, f] = Math.abs(n).toFixed(d).split('.'); return (n < 0 ? '−' : '') + miles(e) + (f ? ',' + f : ''); };

// ---------- piezas del sistema visual ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: TX.cuerpo, color: C.text1, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: TX.etq, color: C.text2, charSpacing: 1 }, o));
function linea(s, x, y, w, h, color = C.accent5, width = 0.75, o = {}) {
  s.addShape(S.line, Object.assign({ x, y, w, h, line: { color, width } }, o));
}
// flecha recta (horizontal o vertical)
function flecha(s, x, y, w, h, color = C.accent1, width = 1.5, dash) {
  s.addShape(S.line, { x, y, w, h, line: { color, width, endArrowType: 'triangle', dashType: dash || 'solid' } });
}
// esquinas de visor (HUD), apenas por fuera de la caja
function visor(s, x, y, w, h, color = C.accent1, k = 0.17, d = 0.06) {
  const L = (a, b, c, e) => linea(s, a, b, c, e, color, 1.25);
  x -= d; y -= d; w += 2 * d; h += 2 * d;
  L(x, y, k, 0); L(x, y, 0, k);
  L(x + w - k, y, k, 0); L(x + w, y, 0, k);
  L(x, y + h, k, 0); L(x, y + h - k, 0, k);
  L(x + w - k, y + h, k, 0); L(x + w, y + h - k, 0, k);
}
function caja(s, x, y, w, h, o = {}) {
  s.addShape(S.rect, Object.assign({ x, y, w, h, fill: { color: C.background2 }, line: { color: C.accent5, width: 0.75 } }, o));
}
const cajaHot = (s, x, y, w, h) => { caja(s, x, y, w, h, { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } }); visor(s, x, y, w, h); };
const cajaFutura = (s, x, y, w, h) => caja(s, x, y, w, h, { line: { color: C.text2, width: 1, dashType: 'dash' } });
// rótulo numerado: cuadro celeste con número oscuro (o grafito para lo original)
function tag(s, n, x, y, o = {}) {
  const w = o.w || 0.62, h = o.h || 0.38, on = !o.off;
  s.addShape(S.rect, { x, y, w, h, fill: { color: on ? C.accent1 : C.accent5 }, line: { type: 'none' } });
  T(s, n, { x, y, w, h, fontFace: F_MONO, fontSize: o.size || TX.etq, bold: true, color: on ? C.background1 : C.text1, align: 'center', valign: 'middle' });
}
// Marcas de estado: separan hechos de supuestos, estimaciones y condiciones pendientes.
// El tipo se dice en palabras (ESTIMACIÓN, SUPUESTO, POR CONFIRMAR…) y además cambia el borde:
//   est = estimación o pronóstico (raya) · sup = supuesto o referencia (puntos) · pen = pendiente (línea continua)
//   ok = hecho o realizado (celeste) · no = lo que la marca no promete o un riesgo (blanco humo)
const MARCA = {
  est: { color: C.text2, dash: 'dash' },
  sup: { color: C.text2, dash: 'sysDot' },
  pen: { color: C.text2, dash: 'solid' },
  ok: { color: C.accent1, dash: 'dash' },
  no: { color: C.text1, dash: 'dash' },
};
const anchoMarca = (t, size = TX.marca) => 0.32 + t.length * (size * 0.6 + 1) / 72;
function marca(s, tipo, text, x, y, o = {}) {
  const st = MARCA[tipo], size = o.size || TX.marca, h = o.h || 0.4, w = o.w || anchoMarca(text, size);
  const xx = o.alignRight ? x - w : x;
  s.addShape(S.rect, { x: xx, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color: st.color, width: 1, dashType: st.dash } });
  mono(s, text, { x: xx + 0.12, y, w: w - 0.24, h, fontSize: size, color: st.color, valign: 'middle', align: o.align || 'center', charSpacing: 1 });
  return w;
}
// foto complementaria con borde fino; las fotos se recortan a la medida exacta en componer.py
function foto(s, archivo, x, y, w, h, alt, borde = C.accent5) {
  s.addImage({ path: A(archivo), x, y, w, h, altText: alt });
  s.addShape(S.rect, { x, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color: borde, width: 0.75 } });
}
// fondos con atmósfera (componer.py): «rejilla» para estrategia, «horizonte» para procesos; datos y anexo en negro puro
const fondo = (s, n) => { s.background = { path: A(`fondo-${n}.jpg`) }; };
// resplandor celeste localizado detrás del dato o bloque protagonista (PNG con transparencia)
const brillo = (s, x, y, w, h, k = 0.9) => s.addImage({ path: A('brillo.png'), x: x - k, y: y - 0.7 * k, w: w + 2 * k, h: h + 1.4 * k, altText: '' });
// número grande condensado (voz de tablero)
const numero = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: TX.cifra, color: C.text1, valign: 'bottom' }, o));
// dos cifras con una flecha dibujada entre ellas (las tipografías de la marca no traen «→»)
function transicion(s, a, b, cx, y, h, o = {}) {
  const size = o.size || TX.cifraS, color = o.color || C.text1, wa = o.wa || 1.6, g = o.gap || 0.24;
  numero(s, a, { x: cx - g - wa, y, w: wa, h, fontSize: size, align: 'right', valign: 'middle', color: o.colorA || C.text2 });
  flecha(s, cx - g + 0.06, y + h / 2, 2 * g - 0.12, 0, o.colorFlecha || C.accent1, 1.75);
  numero(s, b, { x: cx + g, y, w: wa, h, fontSize: size, align: 'left', valign: 'middle', color });
}
// fila de tabla con regla fina inferior
const regla = (s, y, x = M, w = CW, color = C.accent5) => linea(s, x, y, w, 0, color, 0.75);
// leyenda dibujada (más grande y legible que la del gráfico)
function leyenda(s, items, x, y, o = {}) {
  const size = o.size || TX.etq;
  let xx = x;
  items.forEach(([color, t]) => {
    s.addShape(S.rect, { x: xx, y: y + 0.08, w: 0.22, h: 0.22, fill: { color }, line: { type: 'none' } });
    T(s, t, { x: xx + 0.32, y, w: t.length * size * 0.55 / 72 + 0.2, h: 0.38, fontSize: size, valign: 'middle', color: C.text1 });
    xx += 0.32 + t.length * size * 0.55 / 72 + (o.sep || 0.45);
  });
}

// ---------- marcos (layouts) ----------
const logo = { image: { path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' } };
// Fondos con imagen: se componen con componer.py desde integrador-2/identidad (degradado horneado).
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('portada-premium.jpg') },
  objects: [
    logo,
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.42, w: 11.0, h: 1.62, fontFace: F_TIT, fontSize: 58, color: C.text1, align: 'left', valign: 'top', margin: 0, lineSpacingMultiple: 0.9 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'APERTURA',
  background: { color: C.background1 },
  objects: [logo],
  slideNumber: { x: R - 0.8, y: 7.02, w: 0.8, h: 0.26, fontFace: F_MONO, fontSize: 12, color: HEX.accent1, align: 'right', margin: 0 },
});
pres.defineSlideMaster({
  title: 'CIERRE',
  background: { path: A('cierre-premium.jpg') },
  objects: [logo],
});
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: C.background1 },
  margin: [0.5, M, 0.6, M],
  objects: [
    logo,
    { text: { text: CURSO, options: { x: 6.2, y: 0.4, w: R - 6.2, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: TX.inst, color: C.text2, charSpacing: 1.5, margin: 0 } } },
    { placeholder: { options: { name: 'etiqueta', type: 'body', x: M, y: 0.92, w: CW, h: 0.3, fontFace: F_MONO, fontSize: 12, color: C.text2, charSpacing: 1.5, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.36, w: CW, h: 1.2, fontFace: F_TIT, fontSize: TX.tit, color: C.text1, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.86 }, text: '' } },
  ],
  slideNumber: { x: R - 0.8, y: 7.02, w: 0.8, h: 0.26, fontFace: F_MONO, fontSize: 12, color: HEX.accent1, align: 'right', margin: 0 },
});

// Fuente al pie de cada diapositiva (guía de presentación de Integrador II): toda cifra lleva su fuente en la misma lámina.
// Las referencias son las del informe de la Fase 3 y su bibliografía.
const INF = 'Informe Fase 3';
const FUENTES = {
  mercado: `Fuentes: INE (2025), parque de vehículos 2024; SII (2025); Fielbaum y Tirachini (2021); elaboración propia (${INF}, §3.1.1 y §3.1.2, Tablas N° 1, 9 y 10).`,
  validar: `Fuente: elaboración propia (${INF}, §3.1.3, Tablas N° 2 y 3). Muestra no probabilística: resultados indicativos.`,
  oportunidad: `Fuentes: Ansoff (1965); KMcheck, Autofact, Mercado Libre y Abastible (2026); Gasco (s.f.); elaboración propia (${INF}, §3.1.4 y §3.1.5).`,
  alternativas: `Fuentes: elaboración propia (${INF}, Tablas N° 5 y 6; Anexos N° 2 y 9). Ahorros simulados, no medidos en autos chilenos.`,
  canal: `Fuente: elaboración propia (${INF}, §3.1.6 y §3.1.8, Tablas N° 8 y 11). Montos netos de IVA.`,
  personas: `Fuentes: borrador de reglamento MTT (2021); elaboración propia (${INF}, Figura N° 3 y Tabla N° 12).`,
  proceso: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4, Tabla N° 17 y Anexo N° 8). Tiempos estimados. Imágenes ilustrativas.`,
  escalar: `Fuente: elaboración propia (${INF}, Figura N° 5, §3.1.7 y §3.2.1). Mes 1 = enero de 2027 (supuesto).`,
  numeros: `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 a 21). Dólar base $965,71.`,
  objetivos: `Fuente: elaboración propia con base en ${INF} (§3.1.1, Tablas N° 1 y 10).`,
  segmentacion: `Fuentes: INE (2025), parque de vehículos 2024; SII (2025); Fielbaum y Tirachini (2021); elaboración propia (${INF}, §3.1.2).`,
  investigacion: `Fuente: elaboración propia (${INF}, §3.1.3, Tablas N° 2 y 3). Muestra no probabilística: resultados indicativos.`,
  ansoff: `Fuentes: Ansoff (1965); elaboración propia (${INF}, §3.1.4, §3.1.5.4, §3.2.1 y Figura N° 1).`,
  posicionamiento: `Fuentes: KMcheck (2026); Autofact (2026); Mercado Libre (2026); Abastible (2026); Gasco (s.f.); BioBioChile (2026); elaboración propia (Anexo N° 2).`,
  precio: `Fuentes: elaboración propia (${INF}, Tablas N° 5 y 6; Anexos N° 2 y 9); Banco Central de Chile (2026), tasa de consumo.`,
  demanda: `Fuentes: INE (2025); Centro UC en Emol (2026); Descubre (2026); Massiani y Gohs (2015); elaboración propia (Tabla N° 10, Anexo N° 4).`,
  'presupuesto-mkt': `Fuente: elaboración propia (${INF}, Tabla N° 11). Montos netos de IVA.`,
  estructura: `Fuentes: borrador de reglamento MTT (2021); elaboración propia (${INF}, Figura N° 3 y Tabla N° 12).`,
  dotacion: `Fuentes: borrador de reglamento MTT (2021); elaboración propia (${INF}, Figura N° 3 y Tabla N° 12). Imágenes ilustrativas de la operación proyectada.`,
  habilita: `Fuentes: Ley N° 21.735; Ley N° 16.744; Ley N° 19.728; elaboración propia (${INF}, §3.2.3, Tablas N° 14 a 16 y Anexo N° 7). Código QR: demostración de Lumine Habilita.`,
  nomina: `Fuentes: Ley N° 21.735; Ley N° 16.744; Ley N° 19.728; elaboración propia (${INF}, Tablas N° 14 a 16 y Anexo N° 7).`,
  flujo: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4 y Tabla N° 17). Imágenes ilustrativas de la operación proyectada.`,
  controles: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4, Tabla N° 17 y Anexo N° 8). Tiempos estimados. Imágenes ilustrativas de la operación proyectada.`,
  gantt: `Fuente: elaboración propia (${INF}, Figura N° 5). Mes 1 = enero de 2027 (supuesto).`,
  resultados: `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 a 21).`,
  dolar: `Fuente: elaboración propia (${INF}, Tabla N° 21). Dólar base $965,71.`,
  conclusiones: `Fuente: elaboración propia con base en ${INF} (§3.4 y Figura N° 6).`,
  indice: `Las fuentes de cada tema están al pie de su diapositiva.`,
  mix: `Fuente: elaboración propia (${INF}, §3.1.6 y Tabla N° 8).`,
  'presupuesto-ops': `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18, 19 y 21). Dólar base $965,71.`,
  'a-pronostico': `Fuentes: INE (2025); Massiani y Gohs (2015); elaboración propia (${INF}, Tabla N° 10 y Anexo N° 4).`,
  'a-recuperacion': `Fuentes: elaboración propia (${INF}, Tabla N° 6 y §3.1.6.2); Banco Central de Chile (2026), tasa de consumo.`,
  'a-resultados': `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 a 21). Dólar base $965,71.`,
  'a-hipotesis': `Fuente: elaboración propia (${INF}, Tabla N° 3). Significancia de 5%.`,
  'a-dudas': `Fuentes: Ley N° 19.496; borrador de reglamento MTT (2021); elaboración propia (${INF}, Tabla N° 4).`,
  'a-mix': `Fuente: elaboración propia (${INF}, Tabla N° 8).`,
  'a-red': `Fuente: elaboración propia (${INF}, Tabla N° 7). Montos netos; sin tarifas públicas de redes de talleres en Chile.`,
  'a-mercado': `Fuentes: INE (2025); Centro UC en Emol (2026); Descubre (2026); Fielbaum y Tirachini (2021); Massiani y Gohs (2015).`,
  'a-perfiles': `Fuente: elaboración propia (${INF}, Tabla N° 13).`,
  'a-rentas': `Fuentes: ChileTrabajos (2026); Indeed Chile (2026); MiFuturo (2026); Ley N° 21.830; elaboración propia (${INF}, Tablas N° 14 a 16).`,
  'a-jornada': `Fuentes: borrador de reglamento MTT (2021), arts. 11 y 12; elaboración propia (${INF}, Anexo N° 8). Tiempos estimados.`,
  'a-inversion': `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 y 19).`,
  'a-sensibilidad': `Fuente: elaboración propia (${INF}, Tabla N° 21). Dólar base $965,71.`,
  'a-gantt': `Fuente: elaboración propia (${INF}, Figura N° 5). Mes 1 = enero de 2027 (supuesto).`,
};

// diapositiva de contenido: etiqueta (índice + sección), titular con acento en serif y fuente al pie
let SEC = null, ANEXO_ACTUAL = null, INDICE_ANEXO = null, CLAVE = null, NUM = 0;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(etiqueta, titulo, acento, codigo) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SEC });
  let n = codigo || String(++NUM).padStart(2, '0');
  if (ANEXO_ACTUAL) {
    n = ANEXO_ACTUAL.codigo; etiqueta = 'ANEXO · ' + etiqueta;
    // vuelta al índice del anexo, bajo el nombre del curso
    s.addText('VOLVER AL ÍNDICE DEL ANEXO', { x: 7.7, y: 0.7, w: R - 7.7, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 12, color: C.accent1, charSpacing: 1, margin: 0, hyperlink: { slide: INDICE_ANEXO, tooltip: 'Volver al índice del anexo' } });
  }
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  const partes = (titulo + ' ').split(/(%)/).filter(Boolean).map(t => t === '%' && TIPO === 'C' ? { text: t, options: { fontFace: F_PCT } } : { text: t });
  s.addText([...partes, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: TX.acento } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.94, w: R - M - 1.0, h: 0.42, valign: 'top', fontSize: TX.inst, color: C.text2 });
  return s;
}

const ejes = { // estilo común de gráficos: etiquetas grandes, rejilla casi invisible
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: F_MONO, catAxisLabelFontSize: 18,
  valAxisLabelColor: HEX.dk2, valAxisLabelFontFace: F_MONO, valAxisLabelFontSize: 16,
  valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
  catAxisLineColor: HEX.accent5, valAxisLineShow: false, valAxisHidden: true,
  dataLabelFontFace: F_CON, dataLabelFontSize: 20, dataLabelFontBold: true, dataLabelColor: HEX.dk1,
  legendFontFace: F_BODY, legendFontSize: 16, legendColor: HEX.dk1, showLegend: false,
  chartArea: { fill: { color: HEX.lt1 } }, plotArea: { fill: { color: HEX.lt1 } },
  showTitle: false,
};
const AÑOS = ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'];

// =====================================================================
// PORTADA
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 12 });
  mono(s, [{ text: 'CAPÍTULO III', options: { color: C.accent1 } }, { text: '  ·  PLAN DE MARKETING, OPERACIONES Y RECURSOS HUMANOS', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  s.addText([
    { text: 'LUMINE MOTORS', options: { breakLine: true } },
    { text: 'reconversión híbrida · Fase 3', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 40 } },
  ], { placeholder: 'title' });
  // datos del curso: jerarquía secundaria, sobre el negro de la esquina inferior izquierda
  const iy = 5.42;
  linea(s, M, iy, 1.2, 0, C.accent1, 1.25);
  T(s, [
    { text: 'Integrador II · ICMA 1001 · Grupo 1', options: { breakLine: true, bold: true, color: C.text1 } },
    { text: 'Universidad Andrés Bello · Facultad de Economía y Negocios · Ingeniería Comercial', options: { breakLine: true } },
    { text: 'Profesor: Roberto Brito', options: { breakLine: true } },
    { text: 'Diego Alarcón · Benjamín Torres · Lukas Verdugo' },
  ], { x: M, y: iy + 0.16, w: 3.75, h: 1.55, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.12 });
  // anotación de ingeniería: qué se conserva y qué suma el kit (coordenadas del auto en portada-premium.jpg)
  const by = 6.74;
  const puntos = [[5.48, 4.97, 'MOTOR ORIGINAL', 'intacto'], [7.58, 5.58, 'BATERÍA', 'bajo el piso'], [10.18, 5.51, 'TRACCIÓN ELÉCTRICA', 'eje trasero']];
  linea(s, puntos[0][0], by, puntos[2][0] - puntos[0][0], 0, C.text2, 0.75);
  puntos.forEach(([x, y, k, v]) => {
    linea(s, x, y + 0.07, 0, by - y - 0.07, C.text2, 0.75, { line: { color: C.text2, width: 0.75, dashType: 'sysDot' } });
    s.addShape(S.ellipse, { x: x - 0.06, y: y - 0.06, w: 0.12, h: 0.12, fill: { color: C.accent1 }, line: { color: C.text1, width: 0.75 } });
    s.addShape(S.rect, { x: x - 0.035, y: by - 0.035, w: 0.07, h: 0.07, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, [{ text: k, options: { breakLine: true, fontFace: F_MONO, charSpacing: 1, color: C.text1 } }, { text: v, options: { color: C.text2 } }], { x: x - 1.1, y: by + 0.1, w: 2.2, h: 0.5, align: 'center', fontSize: 12 });
  });
  mono(s, 'ILUSTRACIÓN DEL KIT', { x: R - 3.0, y: 0.7, w: 3.0, h: 0.26, align: 'right', fontSize: TX.inst });
  return s;
};

// CIERRE · el auto de la portada, más cerca
D.cierre = () => {
  const s = pres.addSlide({ masterName: 'CIERRE', sectionTitle: SEC });
  T(s, [{ text: 'TRES PLANES.', options: { breakLine: true } }, { text: 'UN MISMO GATILLO.', options: { color: C.accent1 } }], { x: M, y: 1.05, w: CW, h: 1.62, fontFace: F_TIT, fontSize: 50, lineSpacingMultiple: 0.95 });
  linea(s, M, 2.92, 0.9, 0, C.accent1, 1.25);
  mono(s, 'GRACIAS  ·  ¿PREGUNTAS?', { x: M, y: 3.04, w: 8, h: 0.4, fontSize: 18, color: C.text1 });
  mono(s, 'ILUSTRACIÓN DEL KIT', { x: R - 3.0, y: 7.08, w: 3.0, h: 0.24, align: 'right', fontSize: TX.inst });
  return s;
};

// =====================================================================
// 02 · VALIDAR ANTES DE VENDER · cuatro etapas de la investigación en una sola línea

// =====================================================================
// 05 · LA DEMANDA DETERMINA EL CRECIMIENTO · demanda potencial, atendible, capacidad y red
// =====================================================================
D.demanda = () => {
  const s = contenido('PLAN DE MARKETING · DEMANDA Y PRONÓSTICO DE VENTAS', 'HAY MÁS DEMANDA', 'que capacidad.');
  fondo(s, 'rejilla');
  T(s, [{ text: 'Modelo de Bass: ', options: { bold: true } }, { text: 'el 11,1% del segmento laboral adopta el kit al año 5.', options: { color: C.text2 } }], { x: M, y: Y0, w: 9.2, h: 0.4, fontSize: 20, valign: 'middle' });
  marca(s, 'est', 'ESTIMACIÓN', R, Y0, { alignRight: true });
  const hy = Y0 + 0.62;
  leyenda(s, [[HEX.dk2, 'Demanda atendible'], [HEX.accent1, 'Instalaciones propias: el pronóstico de ventas']], M, hy, { sep: 0.5, size: 16 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: hy + 0.44, w: CW + 0.2, h: YF - hy - 0.96, barDir: 'col', barGapWidthPct: 55, barOverlapPct: 0,
    chartColors: [HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 8000,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 20,
    objectName: 'Demanda atendible y pronóstico de ventas por año',
  }));
  T(s, [{ text: 'El límite es físico: técnicos y espacio. ', options: { bold: true } }, { text: 'Desde el año 2, la diferencia la atiende la red de talleres.', options: { color: C.text2 } }], { x: M, y: YF - 0.44, w: CW, h: 0.42, fontSize: 18, valign: 'middle' });
  return s;
};

// =====================================================================
// 08 · LUMINE HABILITA · escalera N1 a N4, rentas y costo de personal
// =====================================================================
D.habilita = () => {
  const s = contenido('RECURSOS HUMANOS · POLÍTICA DE PERSONAS Y PRESUPUESTO', 'LUMINE HABILITA:', 'técnicos formados en casa.');
  fondo(s, 'horizonte');
  const lw = 7.9;
  mono(s, 'RUTA DE N1 A N4 · RENTA BRUTA MENSUAL', { x: M, y: Y0, w: 5.5, h: 0.3, color: C.text1 });
  // escalera: cada nivel sube; nombre, etapa de la ruta y renta en zonas separadas para que nada se monte
  const gap = 0.16, sw = (lw - 3 * gap) / 4, base = YF - 0.55;
  [['N1', 'Aprende', '2 meses de formación', '$750 mil'], ['N2', 'Instala', '3 meses supervisado', '$850 mil'], ['N3', 'Autónomo', '90 días de período autónomo', '$1,0 M'], ['N4', 'Forma', 'forma y valida a otros', '$1,15 M']].forEach(([k, d, e, r], i) => {
    const x = M + i * (sw + gap), h = 2.3 + i * 0.4, y = base - h, hot = i === 3;
    if (hot) { brillo(s, x, y, sw, h, 0.5); cajaHot(s, x, y, sw, h); } else caja(s, x, y, sw, h, { line: { color: i ? C.text2 : C.accent5, width: 0.75 } });
    s.addShape(S.rect, { x, y, w: sw, h: 0.05, fill: { color: hot ? C.accent1 : C.text2 }, line: { type: 'none' } });
    tag(s, k, x + 0.18, y + 0.2, { off: i < 2, w: 0.72, h: 0.44, size: 20 });
    T(s, d, { x: x + 0.18, y: y + 0.74, w: sw - 0.24, h: 0.42, fontSize: 21, bold: true });
    T(s, e, { x: x + 0.18, y: y + 1.16, w: sw - 0.3, h: 0.5, fontSize: 16, color: C.text2, lineSpacingMultiple: 0.95 });
    numero(s, r, { x: x + 0.18, y: y + h - 0.62, w: sw - 0.3, h: 0.52, fontSize: TX.cifraS + 2, valign: 'bottom', color: hot ? C.accent1 : C.text1 });
  });
  T(s, [{ text: 'Del N1 al N4 en unos ocho meses, ', options: { bold: true } }, { text: 'con un bono por nivel validado.', options: { color: C.text2 } }], { x: M, y: base + 0.1, w: lw, h: 0.42, fontSize: 18 });
  const cx = M + lw + 0.45, cw = R - cx;
  regla(s, Y0, cx, cw, C.accent1);
  let ix = cx;
  [['39', 'competencias', 1.6], ['4', 'niveles', 1.0], ['392', 'horas', cw - 2.6]].forEach(([v, k, w]) => {
    numero(s, v, { x: ix, y: Y0 + 0.08, w, h: 0.62, fontSize: 38, valign: 'top' });
    T(s, k, { x: ix, y: Y0 + 0.7, w, h: 0.3, fontSize: 15, color: C.text2 });
    ix += w;
  });
  // presupuesto de personas: la nómina total y, debajo, lo que pesa en cada auto
  const ny = Y0 + 1.22;
  regla(s, ny, cx, cw, C.accent5);
  mono(s, 'NÓMINA · MILLONES DE $ · AÑO 1 Y AÑO 5', { x: cx, y: ny + 0.08, w: cw, h: 0.28, fontSize: 13 });
  transicion(s, '152', '755', cx + 1.55, ny + 0.38, 0.62, { wa: 1.1, size: 36, color: C.text1 });
  T(s, 'por auto, baja de $508 mil a $253 mil', { x: cx, y: ny + 1.02, w: cw, h: 0.32, fontSize: 15, color: C.text2 });
  // la plataforma ya existe: código QR a la demostración
  const qy = ny + 1.5, qs = YF - qy;
  regla(s, qy - 0.08, cx, cw, C.accent5);
  s.addImage({ path: A('qr-habilita.png'), x: cx, y: qy + 0.04, w: qs - 0.08, h: qs - 0.08, altText: 'Código QR a la demostración de Lumine Habilita' });
  const tx = cx + qs + 0.12, tw = R - tx;
  mono(s, 'YA FUNCIONA', { x: tx, y: qy + 0.12, w: tw, h: 0.28, fontSize: 13, color: C.accent1 });
  T(s, 'Pruébala: Lumine Habilita, versión de demostración', { x: tx, y: qy + 0.42, w: tw, h: 0.84, fontSize: 16, bold: true });
  return s;
};

// =====================================================================
// 10 · ESCALAR SIN ADELANTARSE A LA DEMANDA · cronograma ejecutivo y gatillo (la Gantt completa va en A11)
// =====================================================================
D.escalar = () => {
  const s = contenido('OPERACIONES · CARTA GANTT Y GATILLO', 'UN DÚO MÁS', 'cuando la demanda pasa el 80%.');
  const x0 = M + 2.7, xw = R - x0, w26 = 1.3, w1 = 2.6, wy = (xw - w26 - w1) / 4;
  const P = m => m <= 1 ? x0 + (m + 3) / 4 * w26 : m <= 13 ? x0 + w26 + (m - 1) / 12 * w1 : x0 + w26 + w1 + (m - 13) / 12 * wy;
  const top = Y0 + 0.44, rh = 0.52;
  const filas = ['Preparación', 'Reglamento', 'Dúos en operación', 'Talleres propios', 'Red de talleres'];
  const bottom = top + filas.length * rh;
  [['2026', -3, 1], ['AÑO 1', 1, 13], ['AÑO 2', 13, 25], ['AÑO 3', 25, 37], ['AÑO 4', 37, 49], ['AÑO 5', 49, 61]].forEach(([t, a, b], i) => {
    mono(s, t, { x: P(a), y: Y0, w: P(b) - P(a), h: 0.34, align: 'center', valign: 'middle', color: i === 1 ? C.accent1 : C.text1 });
    if (i > 0) linea(s, P(a), top - 0.08, 0, bottom - top + 0.12, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  const fila = i => top + i * rh, mid = i => fila(i) + rh / 2;
  filas.forEach((nom, fi) => {
    if (fi) regla(s, fila(fi), M, CW, C.accent6);
    T(s, nom, { x: M, y: fila(fi), w: x0 - M - 0.2, h: rh, align: 'right', valign: 'middle', fontSize: 17, bold: fi === 1 });
  });
  const barra = (i, a, b, color, txt, tc) => {
    s.addShape(S.rect, { x: P(a), y: fila(i) + 0.12, w: P(b) - P(a), h: rh - 0.24, fill: { color }, line: { type: 'none' } });
    if (txt) T(s, txt, { x: P(a), y: fila(i), w: P(b) - P(a), h: rh, align: 'center', valign: 'middle', fontFace: F_CON, fontSize: 22, bold: true, color: tc || C.background1 });
  };
  const rombo = (i, m, txt) => {
    s.addShape(S.diamond, { x: P(m) - 0.15, y: mid(i) - 0.15, w: 0.3, h: 0.3, fill: { color: C.accent1 }, line: { color: C.text1, width: 0.75 } });
    if (txt) T(s, txt, { x: P(m) + 0.22, y: fila(i), w: 1.4, h: rh, valign: 'middle', fontSize: 17, bold: true });
  };
  // 0 · preparación (mes −3 a 1)
  barra(0, -3, 1, C.accent1);
  // 1 · condición externa: un solo marcador, antes de vender
  s.addShape(S.star5, { x: P(0) - 0.2, y: mid(1) - 0.2, w: 0.4, h: 0.4, fill: { color: C.text1 }, line: { type: 'none' } });
  T(s, [{ text: 'Ley N° 21.793: ', options: { bold: true } }, { text: 'condición externa, vigente antes de vender', options: { color: C.text2 } }], { x: P(0) + 0.3, y: fila(1), w: R - P(0) - 0.4, h: rh, valign: 'middle', fontSize: 17 });
  // 2 · dúos al cierre de cada año: el número crece con el gatillo
  [[1, 13, '3'], [13, 25, '6'], [25, 37, '12'], [37, 49, '12'], [49, 61, '18']].forEach(([a, b, t], k) => {
    s.addShape(S.rect, { x: P(a) + 0.04, y: fila(2) + 0.1, w: P(b) - P(a) - 0.08, h: rh - 0.2, fill: { color: C.accent1, transparency: 70 - k * 15 }, line: { color: C.accent1, width: 0.75 } });
    T(s, t, { x: P(a), y: fila(2), w: P(b) - P(a), h: rh, align: 'center', valign: 'middle', fontFace: F_CON, fontSize: 24, bold: true, color: C.text1 });
  });
  // 3 · talleres propios: preapertura de tres meses y apertura
  barra(3, 22, 25, HEX.dk2); barra(3, 46, 49, HEX.dk2);
  rombo(3, 1, 'Taller 1'); rombo(3, 25, 'Taller 2'); rombo(3, 49, 'Taller 3');
  // 4 · red de talleres certificados
  barra(4, 13, 61, '4A5257');
  [[25, '3'], [37, '9'], [49, '20'], [61, '42']].forEach(([m, t]) => T(s, t, { x: P(m) - 0.75, y: fila(4), w: 0.62, h: rh, fontFace: F_CON, fontSize: TX.sub, align: 'right', valign: 'middle', color: C.text1, bold: true }));
  regla(s, bottom, M, CW, C.accent6);
  mono(s, 'MES 1 = ENERO DE 2027 (SUPUESTO) · NÚMEROS AL CIERRE DE CADA AÑO', { x: M, y: bottom + 0.06, w: CW, h: 0.28, fontSize: 12 });
  // el gatillo, en una línea
  const gy = bottom + 0.46, gh = YF - gy;
  s.addShape(S.rect, { x: M, y: gy, w: CW, h: gh, fill: { color: HOT }, line: { color: C.accent1, width: 1 } });
  visor(s, M, gy, CW, gh);
  mono(s, 'GATILLO', { x: M + 0.25, y: gy, w: 1.4, h: gh, valign: 'middle', color: C.accent1 });
  T(s, [{ text: 'Dos meses sobre el 80%: entra un dúo. ', options: { bold: true } }, { text: 'Con seis dúos, abre otro taller.', options: { bold: true, color: C.accent1 } }], { x: M + 1.55, y: gy, w: CW - 1.8, h: gh, fontSize: 19, valign: 'middle' });
  return s;
};

// =====================================================================
// VERSIÓN EJECUTIVA · 12 láminas (portada y cierre aparte). Cada una fusiona dos o más láminas de la versión larga.
// =====================================================================


// 03 · Ansoff y posicionamiento
D.oportunidad = () => {
  const s = contenido('PLAN DE MARKETING · ANSOFF Y POSICIONAMIENTO', 'UNA OPORTUNIDAD', 'sin oferta en Chile.');
  fondo(s, 'rejilla');
  const gx = M + 0.5, gw = 6.0, qw = gw / 2, gy = Y0 + 0.42, qh = (YF - gy) / 2;
  mono(s, 'PRODUCTO EXISTENTE', { x: gx, y: Y0, w: qw, h: 0.32, align: 'center', fontSize: 14, color: C.text2 });
  mono(s, 'PRODUCTO NUEVO', { x: gx + qw, y: Y0, w: qw, h: 0.32, align: 'center', fontSize: 14, color: C.text1 });
  [['MERCADO EXISTENTE', gy], ['MERCADO NUEVO', gy + qh]].forEach(([t, y]) => {
    T(s, t, { x: M + 0.22 - qh / 2, y: y + qh / 2 - 0.2, w: qh, h: 0.4, rotate: 270, fontFace: F_MONO, fontSize: 14, color: C.text2, charSpacing: 1, align: 'center', valign: 'middle' });
  });
  const ex = gx + qw, ey = gy;
  s.addImage({ path: A('brillo.png'), x: ex - 0.8, y: ey - 0.6, w: qw + 1.6, h: qh + 1.2, altText: '' });
  s.addShape(S.rect, { x: ex, y: ey, w: qw, h: qh, fill: { color: HOT, transparency: 15 }, line: { type: 'none' } });
  visor(s, ex + 0.06, ey + 0.06, qw - 0.12, qh - 0.12);
  s.addShape(S.rect, { x: gx + qw + 0.06, y: gy + qh + 0.06, w: qw - 0.12, h: qh - 0.12, fill: { color: C.background1, transparency: 100 }, line: { color: C.accent1, width: 1, dashType: 'dash' } });
  linea(s, gx, gy + qh, gw, 0, C.accent5, 1);
  linea(s, gx + qw, gy, 0, 2 * qh, C.accent5, 1);
  linea(s, gx, gy, 0, 2 * qh, C.accent5, 0.75);
  linea(s, gx, gy + 2 * qh, gw, 0, C.accent5, 0.75);
  // cada cuadrante: año, estrategia y, solo donde aporta, a qué se refiere
  const Q = [
    [1, 0, '1', 'AÑO 1 · ENTRADA', 'Desarrollo de producto', 'sin oferta en Chile', true],
    [0, 0, '2', 'AÑO 2', 'Penetración', ''],
    [1, 1, '2', 'DESDE EL AÑO 2', 'Diversificación', 'calibraciones y kits para otros talleres', true],
    [0, 1, '3', 'AÑO 3', 'Desarrollo de mercado', 'flotas y regiones'],
  ];
  const nodo = (c, r) => [gx + c * qw + (c ? 0.42 : qw - 0.42), gy + r * qh + 0.46];
  Q.forEach(([c, r, n, a, t, d, on]) => {
    const x = gx + c * qw, y = gy + r * qh, [nx, ny] = nodo(c, r), tx = c ? x + 0.82 : x + 0.16, tw = qw - 0.98;
    s.addShape(S.ellipse, { x: nx - 0.23, y: ny - 0.23, w: 0.46, h: 0.46, fill: { color: on ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.5 } });
    T(s, n, { x: nx - 0.23, y: ny - 0.23, w: 0.46, h: 0.46, align: 'center', valign: 'middle', fontFace: F_CON, bold: true, fontSize: 20, color: on ? C.background1 : C.accent1 });
    mono(s, a, { x: tx, y: y + 0.16, w: tw + 0.1, h: 0.28, fontSize: 13, color: C.accent1 });
    T(s, t, { x: tx, y: y + 0.5, w: tw + 0.06, h: 0.74, fontSize: 20, bold: true, lineSpacingMultiple: 0.9, valign: 'top' });
    if (d) T(s, d, { x: tx, y: y + 1.28, w: tw, h: 0.6, fontSize: 17, color: on ? C.text1 : C.text2, lineSpacingMultiple: 0.95 });
  });
  const [x1, y1] = nodo(1, 0), [x2, y2] = nodo(0, 0), [x3, y3] = nodo(0, 1), [x4, y4] = nodo(1, 1);
  flecha(s, x1 - 0.28, y1, -(x1 - x2 - 0.56), 0, C.accent1, 1.75);
  flecha(s, x2, y2 + 0.28, 0, y3 - y2 - 0.56, C.accent1, 1.75);
  flecha(s, x1, y1 + 0.28, 0, y4 - y1 - 0.56, C.accent1, 1.75, 'dash');
  // posicionamiento: el eje dice el precio; los rótulos, solo lo que el eje no dice
  const px = gx + gw + 0.5, pw = R - px, lc = 2.75, sx = px + lc + 0.1, sw = R - sx - 0.05;
  const X = v => sx + Math.min(v, 26) / 26 * sw;
  mono(s, 'AHORRAR SIN CAMBIAR DE AUTO', { x: px, y: Y0, w: pw, h: 0.32, fontSize: 14, color: C.text1 });
  const ay = Y0 + 0.64;
  mono(s, 'INVERSIÓN INICIAL', { x: px, y: ay - 0.3, w: lc, h: 0.26, fontSize: 12 });
  linea(s, sx, ay, sw, 0, C.text2, 0.75);
  [[0, '$0'], [10, '$10 M'], [20, '$20 M']].forEach(([v, l]) => {
    linea(s, X(v), ay - 0.05, 0, 0.05, C.text2, 0.75);
    mono(s, l, { x: X(v) - 0.5, y: ay - 0.3, w: 1.0, h: 0.24, align: 'center', fontSize: 12 });
  });
  const grupos = [
    ['CONSERVA SU AUTO', [['No hacer nada', '', 0, 0, 0], ['Conversión a gas', 'hasta 7 años de antigüedad', 0.9, 1.8, 0], ['Lumine', 'sin límite de antigüedad', 4.29, 4.99, 1]]],
    ['CAMBIA DE AUTO', [['Híbrido usado', '', 9.5, 13, 0], ['Eléctrico nuevo', '', 13.99, 26, 0]]],
  ];
  let y = ay + 0.14;
  const rh = 0.46;
  grupos.forEach(([g, filas]) => {
    mono(s, g, { x: px, y, w: pw, h: 0.26, fontSize: 12, color: C.text2 });
    y += 0.28;
    filas.forEach(([t, d, a, b, lu]) => {
      const h = d ? rh + 0.14 : rh;
      if (lu) { brillo(s, px, y, pw, h, 0.3); s.addShape(S.rect, { x: px - 0.08, y: y + 0.02, w: pw + 0.08, h: h - 0.04, fill: { color: HOT }, line: { color: C.accent1, width: 0.75 } }); }
      else regla(s, y + h, px, pw, C.accent6);
      T(s, d ? [{ text: t, options: { bold: true, breakLine: true, color: lu ? C.accent1 : C.text1 } }, { text: d, options: { fontSize: 14, bold: false, color: lu ? C.text1 : C.text2 } }] : t,
        { x: px + 0.04, y, w: lc, h, fontSize: 18, bold: true, color: lu ? C.accent1 : C.text1, valign: 'middle', lineSpacingMultiple: 0.9 });
      if (b > a) s.addShape(S.rect, { x: X(a), y: y + h / 2 - 0.06, w: Math.max(X(b) - X(a), 0.06), h: 0.12, fill: { color: lu ? C.accent1 : C.text2 }, line: { type: 'none' } });
      s.addShape(S.ellipse, { x: X(a) - 0.09, y: y + h / 2 - 0.09, w: 0.18, h: 0.18, fill: { color: lu ? C.accent1 : C.text1 }, line: { type: 'none' } });
      y += h;
    });
    y += 0.08;
  });
  return s;
};

// 04 · producto y precio
D.alternativas = () => {
  const s = contenido('PLAN DE MARKETING · PRODUCTO Y PRECIO', 'UN MISMO AUTO,', 'dos alternativas.');
  fondo(s, 'rejilla');
  const cw = 3.6, gap = 0.34, ch = 3.1;
  [['ESENCIAL', '$4.290.000', '15%', false], ['PLUS', '$4.990.000', '20%', true]].forEach(([k, p, prom, hot], i) => {
    const x = M + i * (cw + gap), y = Y0, px = x + 0.3, pw = cw - 0.6;
    if (hot) s.addImage({ path: A('brillo.png'), x: x - 0.8, y: y - 0.5, w: cw + 1.6, h: ch + 1.0, altText: '' });
    s.addShape(S.rect, { x, y, w: cw, h: ch, fill: { color: hot ? HOT : C.background2 }, line: { color: hot ? C.accent1 : C.accent5, width: hot ? 1 : 0.75 } });
    s.addShape(S.rect, { x, y, w: cw, h: 0.06, fill: { color: hot ? C.accent1 : C.text2 }, line: { type: 'none' } });
    if (hot) visor(s, x, y, cw, ch);
    mono(s, k, { x: px, y: y + 0.24, w: pw, h: 0.3, fontSize: 18, color: hot ? C.accent1 : C.text1 });
    if (hot) marca(s, 'ok', 'RECOMENDADO', x + cw - 0.3, y + 0.2, { alignRight: true, h: 0.34, size: 12, w: 1.75 });
    numero(s, p, { x: px, y: y + 0.6, w: pw + 0.2, h: 0.74, fontSize: 46, valign: 'top', color: hot ? C.accent1 : C.text1 });
    mono(s, 'PRECIO DE REFERENCIA · CON IVA', { x: px, y: y + 1.34, w: pw, h: 0.26, fontSize: 12 });
    regla(s, y + 1.82, px, pw, C.accent5);
    T(s, [{ text: 'hasta ', options: { fontFace: F_BODY, bold: false, fontSize: 20, color: C.text2 } }, { text: prom }], { x: px, y: y + 1.94, w: pw, h: 0.8, fontFace: F_CON, bold: true, fontSize: 58, valign: 'bottom', color: C.text1 });
    T(s, 'menos bencina en ciudad', { x: px, y: y + 2.66, w: pw, h: 0.36, fontSize: 18, color: C.text2 });
  });
  T(s, [{ text: 'Plus: ', options: { bold: true, color: C.accent1 } }, { text: '16% más caro, ', options: { bold: true } }, { text: '24% más ahorro.', options: { bold: true } }], { x: M, y: Y0 + ch + 0.16, w: 2 * cw + gap, h: 0.46, fontSize: 22 });
  marca(s, 'est', 'AHORROS SIMULADOS · PRECIOS A VALIDAR CON LA ENCUESTA', M, Y0 + ch + 0.72, { h: 0.36, size: 13 });
  // el kit como protagonista: misma estructura, distinta potencia
  const gx = M + 2 * cw + gap + 0.45, gw = R - gx, ih = YF - Y0;
  foto(s, 'producto-kit.jpg', gx, Y0, gw, ih, 'Kit Lumine: batería bajo el piso y tracción eléctrica en el eje trasero (ilustración)');
  mono(s, 'ILUSTRACIÓN DEL KIT', { x: gx + 0.16, y: Y0 + 0.14, w: gw - 0.3, h: 0.24, fontSize: 11, color: C.text2 });
  T(s, 'Misma estructura; cambia la potencia de los motores.', { x: gx + 0.16, y: Y0 + ih - 0.62, w: gw - 0.3, h: 0.5, fontSize: 16, color: C.text1, valign: 'bottom' });
  return s;
};


// 07 · estructura y dotación
D.personas = () => {
  const s = contenido('RECURSOS HUMANOS · ESTRUCTURA Y DOTACIÓN', 'DE 13 A 56 PERSONAS', 'en cinco años.');
  const lw = 5.95;
  mono(s, 'PERSONAS AL CIERRE DE CADA AÑO', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Dotación', labels: ['Pre', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], values: [5, 13, 21, 33, 40, 56] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.4, w: lw + 0.1, h: YF - Y0 - 0.98, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 64,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 24,
    objectName: 'Dotación al cierre de cada año',
  }));
  T(s, [{ text: 'Al año 5: 3 talleres propios, 18 dúos, 36 técnicos. ', options: { bold: true } }, { text: 'La red contrata a los suyos.', options: { color: C.text2 } }], { x: M, y: YF - 0.5, w: lw + 0.2, h: 0.48, fontSize: 16, valign: 'middle' });
  // organigrama funcional: cinco áreas bajo la Gerencia; los técnicos dependen del Responsable Técnico
  const ox = M + lw + 0.5, ow = R - ox;
  mono(s, 'ORGANIGRAMA · AL ABRIR Y AL AÑO 5', { x: ox, y: Y0, w: ow, h: 0.3, color: C.text1 });
  const gy = Y0 + 0.4, gh = 0.5;
  cajaHot(s, ox, gy, ow, gh);
  T(s, 'Gerencia General', { x: ox, y: gy, w: ow, h: gh, align: 'center', valign: 'middle', fontSize: 18, bold: true });
  const filas = [['Responsable Técnico', '1', '3', 0], ['Técnicos en dúos', '2', '36', 1], ['Ingeniería de Calibración', '1', '4', 0], ['Comercial y Postventa', '1', '4', 0], ['Comercial de Empresas', '0', '2', 0, true], ['Administración y Personas', '1', '1', 0]];
  const r0 = gy + gh + 0.16, rh = 0.53, spx = ox + 0.2;
  linea(s, spx, gy + gh, 0, r0 + 5 * rh + 0.22 - gy - gh, C.text2, 1);
  filas.forEach(([t, a, b, sub, fut], i) => {
    const y = r0 + i * rh, bx = sub ? ox + 0.9 : ox + 0.45, bw = R - bx, bh = 0.44;
    if (sub) { linea(s, ox + 0.65, y - 0.09, 0, bh / 2 + 0.09, C.text2, 1); linea(s, ox + 0.65, y + bh / 2, bx - ox - 0.65, 0, C.text2, 1); }
    else linea(s, spx, y + bh / 2, bx - spx, 0, C.text2, 1);
    if (sub) { brillo(s, bx, y, bw, bh, 0.3); s.addShape(S.rect, { x: bx, y, w: bw, h: bh, fill: { color: HOT }, line: { color: C.accent1, width: 1 } }); }
    else if (fut) cajaFutura(s, bx, y, bw, bh);
    else caja(s, bx, y, bw, bh, { line: { color: C.accent5, width: 0.75 } });
    T(s, fut ? [{ text: t }, { text: ' · mes 46', options: { fontSize: 13, bold: false, color: C.text2 } }] : t, { x: bx + 0.15, y, w: bw - 1.6, h: bh, fontSize: 16, bold: true, valign: 'middle', color: sub ? C.accent1 : C.text1 });
    if (a === b) numero(s, a, { x: R - 1.55, y, w: 1.4, h: bh, align: 'center', valign: 'middle', fontSize: 24, color: C.accent1 });
    else transicion(s, a, b, R - 0.85, y, bh, { wa: 0.55, size: 24, color: sub || !fut ? C.accent1 : C.text1, colorA: C.text2, gap: 0.2 });
  });
  return s;
};

// 09 · flujo operacional y puntos de control
D.proceso = () => {
  const s = contenido('OPERACIONES · DIAGRAMA DE FLUJO', 'DE LA COTIZACIÓN', 'a la postventa.');
  fondo(s, 'horizonte');
  const et = [['CAPTACIÓN', 'Cotiza en la web', 1], ['ASESORÍA', 'El cliente decide', 1], ['TALLER', 'Una jornada', 0], ['CERTIFICACIÓN', 'Sale certificado', 0], ['POSTVENTA', 'Ahorro medido', 1]];
  const alt = ['Cotización en la web', 'Diagnóstico con telemetría', 'Dúo de técnicos instalando el kit', 'Entrega del auto certificado', 'Centro de control que mide el ahorro'];
  const n = 5, gap = 0.22, cw = (CW - (n - 1) * gap) / n, fh = 1.42, ty = Y0 + fh + 0.34;
  linea(s, M + 0.2, ty, CW - 0.4, 0, C.accent5, 1.25);
  et.forEach(([e, t, cli], i) => {
    const x = M + i * (cw + gap), hot = i === 2, col = cli ? C.accent1 : C.text2;
    foto(s, `proceso-${i + 1}.jpg`, x, Y0, cw, fh, alt[i], hot ? C.accent1 : C.accent5);
    s.addShape(S.ellipse, { x, y: ty - 0.21, w: 0.42, h: 0.42, fill: { color: hot ? C.accent1 : C.background1 }, line: { color: col, width: 1.75 } });
    T(s, String(i + 1), { x, y: ty - 0.21, w: 0.42, h: 0.42, align: 'center', valign: 'middle', fontFace: F_CON, bold: true, fontSize: 18, color: hot ? C.background1 : col });
    if (i < n - 1) flecha(s, x + cw - 0.3, ty, gap + 0.22, 0, C.accent1, 1.5);
    mono(s, e, { x, y: ty + 0.32, w: cw, h: 0.26, fontSize: 13, color: col });
    T(s, t, { x, y: ty + 0.6, w: cw, h: 0.4, fontSize: 19, bold: true, color: hot ? C.accent1 : C.text1 });
  });
  // leyenda mínima: el color del número dice si la etapa es con el cliente o técnica
  const ly = ty + 1.08;
  [[C.accent1, 'Con el cliente'], [C.text2, 'Técnica']].forEach(([c, t], i) => {
    const x = M + i * 2.4;
    s.addShape(S.ellipse, { x, y: ly + 0.07, w: 0.22, h: 0.22, fill: { color: C.background1 }, line: { color: c, width: 1.75 } });
    T(s, t, { x: x + 0.32, y: ly, w: 2.0, h: 0.36, fontSize: 15, color: C.text2, valign: 'middle' });
  });
  // la jornada del taller y sus controles, en una sola franja
  const by = ly + 0.5;
  regla(s, by, M, CW, C.accent1);
  numero(s, '8,4 h', { x: M, y: by + 0.1, w: 2.2, h: YF - by - 0.1, fontSize: 44, valign: 'middle', color: C.accent1 });
  const cx = M + 2.35, pg = 0.24, pw = (R - cx - 3 * pg) / 4, ch = YF - by - 0.24;
  ['¿Vehículo apto?', '¿Masa y ejes?', '¿Aislación?', '¿Dinamómetro?'].forEach((q, i) => {
    const x = cx + i * (pw + pg), y = by + 0.16;
    caja(s, x, y, pw, ch, { line: { color: C.text2, width: 0.75 } });
    s.addShape(S.rect, { x, y, w: 0.06, h: ch, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, q, { x: x + 0.12, y, w: pw - 0.16, h: ch, fontSize: 17, bold: true, align: 'center', valign: 'middle' });
    if (i < 3) flecha(s, x + pw + 0.02, y + ch / 2, pg - 0.04, 0, C.accent1, 1.5);
  });
  return s;
};

// 11 · inversión, gasto, resultado por línea y riesgo cambiario
D['a-resultados'] = () => {
  const s = contenido('OPERACIONES · RESULTADO Y RIESGO', 'RESULTADO REFERENCIAL', 'por línea de negocio.');
  const lw = 6.7;
  mono(s, 'RESULTADO REFERENCIAL POR LÍNEA · MILLONES DE $', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  leyenda(s, [[HEX.accent1, 'Talleres propios'], [HEX.dk2, 'Red de talleres']], M, Y0 + 0.36);
  s.addChart(pres.ChartType.bar, [
    { name: 'Talleres propios', labels: AÑOS, values: [-130.2, 159.9, 444.8, 694.7, 869.9] },
    { name: 'Red de talleres', labels: AÑOS, values: [0, 142.1, 415.2, 1233.2, 2889.5] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.76, w: lw + 0.1, h: YF - Y0 - 1.24, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.accent1, HEX.dk2], valAxisMinVal: -700, valAxisMaxVal: 3250,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;−#,##0;;', dataLabelFontSize: 16,
    catAxisLabelPos: 'low', catAxisLabelFontSize: 16, objectName: 'Resultado referencial por línea de negocio',
  }));
  marca(s, 'est', 'PROYECCIÓN REFERENCIAL · 60% PLUS · SIN IMPUESTOS', M, YF - 0.38, { h: 0.34, size: 12 });
  const rx = M + lw + 0.45, rw = R - rx, kw = (rw - 0.3) / 2;
  [['INVERSIÓN POR LOCAL', '$81 M', 'casi la mitad, el dinamómetro'], ['GASTO OPERACIONAL', '$9.606 M', 'al año 5; el kit es más del 90%']].forEach(([k, v, d], i) => {
    const x = rx + i * (kw + 0.3);
    regla(s, Y0, x, kw, C.accent5);
    mono(s, k, { x, y: Y0 + 0.08, w: kw, h: 0.28, fontSize: 12 });
    numero(s, v, { x, y: Y0 + 0.36, w: kw, h: 0.6, fontSize: 34, valign: 'top' });
    T(s, d, { x, y: Y0 + 0.96, w: kw, h: 0.5, fontSize: 15, color: C.text2 });
  });
  // margen propio al año 5 según el dólar: el riesgo se lee por la magnitud
  const my = Y0 + 1.62;
  linea(s, rx, my, rw, 0, C.accent1, 1);
  mono(s, 'MARGEN PROPIO AL AÑO 5 · DÓLAR', { x: rx, y: my + 0.08, w: rw, h: 0.28, fontSize: 13, color: C.accent1 });
  const filas = [['Dólar −10%', 1646.9, '1.647', '14,6%', C.text2, 30], ['Base', 869.9, '870', '7,7%', C.accent1, 34], ['Dólar +10%', 92.9, '93', '0,8%', C.text1, 44]];
  const bx = rx + 1.45, bmax = 1.25, rh = 0.62;
  filas.forEach(([k, v, t, mg, color, size], i) => {
    const y = my + 0.44 + i * rh, w = Math.max(bmax * v / 1646.9, 0.06), riesgo = i === 2;
    T(s, k, { x: rx, y, w: 1.4, h: rh, fontSize: 17, bold: riesgo || i === 1, valign: 'middle' });
    s.addShape(S.rect, { x: bx, y: y + 0.17, w, h: rh - 0.34, fill: { color }, line: { type: 'none' } });
    numero(s, t, { x: bx + w + 0.08, y, w: 0.8, h: rh, fontSize: 18, valign: 'middle', color: C.text2 });
    numero(s, mg, { x: R - 1.45, y, w: 1.45, h: rh, align: 'right', valign: 'middle', fontSize: size, color: i === 1 ? C.accent1 : riesgo ? C.text1 : C.text2 });
  });
  T(s, [{ text: 'Red: cerca de 10%. ', options: { bold: true } }, { text: '82% del kit se paga en dólares.', options: { color: C.text2 } }], { x: rx, y: my + 0.44 + 3 * rh + 0.04, w: rw, h: 0.36, fontSize: 15 });
  return s;
};


// =====================================================================
// 12 · TRES PLANES, UN MISMO GATILLO · conclusiones y preguntas abiertas
// =====================================================================
D.conclusiones = () => {
  const s = contenido('CONCLUSIONES DEL CAPÍTULO', 'TRES PLANES', 'que se mueven juntos.');
  fondo(s, 'rejilla');
  const n = 3, gap = 0.3, cw = (CW - (n - 1) * gap) / n, ch = 2.0;
  [['MARKETING', '367 > 299', 'Más demanda que capacidad desde el año 1.'], ['RECURSOS HUMANOS', '8 meses', 'para formar a un técnico N4 en casa.'], ['OPERACIONES', '8,4 h', 'por auto, con cuatro controles.']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap);
    caja(s, x, Y0, cw, ch, { line: { color: C.text2, width: 0.75 } });
    tag(s, '0' + (i + 1), x + 0.25, Y0 + 0.2, { w: 0.6, h: 0.36, size: 15, off: true });
    mono(s, k, { x: x + 1.0, y: Y0 + 0.2, w: cw - 1.15, h: 0.36, valign: 'middle', color: C.text1 });
    numero(s, v, { x: x + 0.25, y: Y0 + 0.6, w: cw - 0.5, h: 0.72, fontSize: TX.cifraXL, valign: 'top' });
    T(s, d, { x: x + 0.25, y: Y0 + 1.34, w: cw - 0.45, h: 0.6, fontSize: 17, color: C.text2 });
  });
  // lo que los une: el gatillo
  const gy = Y0 + ch + 0.2, gh = 0.72;
  brillo(s, M, gy, 3.0, gh, 0.5);
  cajaHot(s, M, gy, CW, gh);
  numero(s, '80%', { x: M + 0.3, y: gy, w: 1.9, h: gh, fontSize: 48, valign: 'middle', color: C.accent1 });
  T(s, [{ text: 'Un mismo gatillo ', options: { bold: true } }, { text: 'suma dúos, personas y talleres en los tres planes.', options: { color: C.text1 } }], { x: M + 2.3, y: gy, w: CW - 2.6, h: gh, fontSize: 20, valign: 'middle' });
  // el puente a la fase siguiente
  const qy = gy + gh + 0.18;
  mono(s, 'LO QUE SIGUE · PLAN FINANCIERO', { x: M, y: qy, w: 6, h: 0.3, color: C.accent1 });
  const qw = (CW - 0.4) / 2;
  ['¿La encuesta confirma el precio?', '¿Cómo nos cubrimos del dólar?'].forEach((q, i) => {
    T(s, q, { x: M + i * (qw + 0.4), y: qy + 0.32, w: qw, h: 0.48, fontFace: F_SER, italic: true, fontSize: 20, color: C.text1 });
  });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces
// =====================================================================
D.indice = (primera) => {
  const s = contenido('MATERIAL DE APOYO', 'ANEXO', 'para preguntas.', 'A');
  fondo(s, 'rejilla');
  T(s, 'No se presenta: se hace clic en el tema y se salta directo.', { x: M, y: Y0 - 0.06, w: CW, h: 0.4, fontSize: TX.cuerpo, color: C.text2 });
  const colW = (CW - 0.35) / 2, rowH = 0.52, y0 = Y0 + 0.5, porCol = Math.ceil(G.ANEXO.length / 2);
  G.ANEXO.forEach((a, i) => {
    const c = i < porCol ? 0 : 1, r = i % porCol, x = M + c * (colW + 0.35), y = y0 + r * rowH, n = primera + i;
    regla(s, y, x, colW);
    tag(s, a.codigo, x, y + 0.11, { w: 0.62, h: 0.38, size: TX.etq });
    s.addText(a.titulo, { x: x + 0.76, y, w: colW - 1.76, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: TX.cuerpo, color: C.text1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('LÁM. ' + n, { x: x + colW - 1.0, y, w: 1.0, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: TX.marca, color: C.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    if (r === porCol - 1 || i === G.ANEXO.length - 1) regla(s, y + rowH, x, colW);
  });
  return s;
};

// A1 · hipótesis de la investigación (Tabla N° 3)
D['a-hipotesis'] = () => {
  const s = contenido('INVESTIGACIÓN DE MERCADO · HIPÓTESIS', 'SEIS HIPÓTESIS', 'y su prueba.');
  const h = [
    ['H1', 'El uso laboral tiene más intención de compra que el particular.', 'Z DOS PROPORCIONES'],
    ['H2', 'La intención no cambia con la edad ni el género.', 'CHI-CUADRADO'],
    ['H3', 'El ahorro predomina, pero la mayoría valora otro motivo.', 'Z UNA PROPORCIÓN'],
    ['H4', 'La barrera principal es la confianza, no el precio.', 'Z UNA PROPORCIÓN'],
    ['H5', 'Los respaldos externos dan más confianza que el taller.', 'T RELACIONADAS'],
    ['H6', 'Se prefiere hibridar antes que gas, cambiar de auto o nada.', 'Z UNA PROPORCIÓN'],
  ];
  const rh = 0.62, y0 = Y0 + 0.4, tc = R - 2.95;
  mono(s, 'HIPÓTESIS', { x: M + 0.9, y: Y0, w: 4, h: 0.3, color: C.text1 });
  mono(s, 'PRUEBA', { x: tc, y: Y0, w: 2.95, h: 0.3, color: C.text1 });
  h.forEach(([k, t, p], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, CW);
    tag(s, k, M, y + 0.12, { w: 0.68, h: 0.38, size: TX.etq, off: i !== 3 });
    T(s, t, { x: M + 0.9, y, w: tc - M - 1.05, h: rh, valign: 'middle', fontSize: TX.cuerpo, bold: i === 3 });
    mono(s, p, { x: tc, y, w: 2.95, h: rh, valign: 'middle', color: C.accent1 });
  });
  regla(s, y0 + h.length * rh, M, CW);
  return s;
};

// A2 · dudas del cliente (Tabla N° 4) y límites de la promesa
D['a-dudas'] = () => {
  const s = contenido('POSICIONAMIENTO · DUDAS DEL CLIENTE', 'CUATRO DUDAS,', 'cuatro respaldos.');
  const d = [
    ['¿Funciona?', 'Hasta 20% menos bencina en ciudad.', 'Estimador con intervalo y telemetría.'],
    ['¿Daña mi auto?', 'No toca el motor ni la transmisión.', 'Se conservan el circuito de freno y el ABS.'],
    ['¿Pasa la revisión?', 'Sale del taller con certificado.', 'Lo firma el Responsable Técnico.'],
    ['¿Se enchufa?', 'No.', 'La batería se carga al frenar.'],
  ];
  const gap = 0.24, cw = (CW - gap) / 2, ch = 1.56;
  d.forEach(([q, r, b], i) => {
    const x = M + (i % 2) * (cw + gap), y = Y0 + Math.floor(i / 2) * (ch + 0.18);
    caja(s, x, y, cw, ch);
    const est = { 0: ['est', 'SIMULADO'], 2: ['pen', 'POR CONFIRMAR'] }[i];
    T(s, q, { x: x + 0.25, y, w: 2.35, h: est ? ch - 0.42 : ch, valign: 'middle', fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 30 : 24, color: C.accent1 });
    if (est) marca(s, est[0], est[1], x + 0.25, y + ch - 0.52, { h: 0.34, size: 12 });
    T(s, r, { x: x + 2.7, y: y + 0.14, w: cw - 2.85, h: 0.66, fontSize: TX.cuerpo, bold: true, valign: 'middle' });
    T(s, b, { x: x + 2.7, y: y + 0.84, w: cw - 2.85, h: 0.66, fontSize: TX.cuerpo, color: C.text2, valign: 'top' });
  });
  const ly = Y0 + 2 * ch + 0.18 + 0.12;
  mono(s, 'LO QUE LA MARCA NO PROMETE', { x: M, y: ly, w: 6, h: 0.3, color: C.text1 });
  let x = M;
  ['«CERO EMISIONES»', '«20% GARANTIZADO»', '«HOMOLOGADO»', 'EXENCIÓN DE RESTRICCIÓN'].forEach(t => { x += marca(s, 'no', t, x, ly + 0.36, { h: 0.38 }) + 0.22; });
  return s;
};

// A3 · mezcla de marketing (Tabla N° 8)
D['a-mix'] = () => {
  const s = contenido('MIX DE MARKETING · RESUMEN', 'DOS LÍNEAS,', 'una misma mezcla.');
  const filas = [
    ['PRODUCTO', 'Kit Esencial o Plus en una jornada', 'Licencia, kits y certificación'],
    ['PRECIO', '$4,29 M y $4,99 M con IVA', 'Entrada y cobros recurrentes'],
    ['PLAZA', 'Web y talleres propios en la RM', 'Talleres con exclusividad comunal'],
    ['PROMOCIÓN', 'Estimador, pilotos y referidos', 'Visitas, ferias y casos'],
    ['PERSONAS', 'Dúos con un N3 o N4', 'Técnicos validados por Lumine'],
  ];
  const kw = 2.25, c1 = M + kw, cw = (R - c1 - 0.3) / 2, c2 = c1 + cw + 0.3, rh = 0.7;
  mono(s, 'CLIENTE FINAL', { x: c1, y: Y0, w: cw, h: 0.3, color: C.accent1 });
  mono(s, 'RED DE TALLERES', { x: c2, y: Y0, w: cw, h: 0.3, color: C.accent1 });
  filas.forEach(([k, a, b], i) => {
    const y = Y0 + 0.42 + i * rh;
    regla(s, y, M, CW);
    mono(s, k, { x: M, y, w: kw - 0.2, h: rh, valign: 'middle', color: C.text1 });
    T(s, a, { x: c1, y, w: cw, h: rh, valign: 'middle', fontSize: TX.cuerpo });
    T(s, b, { x: c2, y, w: cw, h: rh, valign: 'middle', fontSize: TX.cuerpo, color: C.text2 });
  });
  regla(s, Y0 + 0.42 + filas.length * rh, M, CW);
  return s;
};

// A4 · cobros a la red (Tabla N° 7)
D['a-red'] = () => {
  const s = contenido('MIX · PRECIO PARA LA RED', 'INGRESO RECURRENTE:', 'el 96% del margen al año\u00A05.');
  const t = [
    ['ENTRADA', '$7,14 M', 'una vez', 'Exclusividad comunal y formación'],
    ['KIT CON LICENCIA', '$3,81 M', 'por instalación', 'Plus; Esencial, $3,33 M'],
    ['CERTIFICACIÓN', '$2,4 M', 'cada año', 'Desde el segundo año'],
    ['HABILITA', '$35 mil', 'al mes por técnico', 'Formación y validación'],
  ];
  const n = 4, gap = 0.25, cw = (CW - (n - 1) * gap) / n, ch = 3.0;
  t.forEach(([k, v, f, d], i) => {
    const x = M + i * (cw + gap);
    if (i === 1) cajaHot(s, x, Y0, cw, ch); else caja(s, x, Y0, cw, ch);
    mono(s, k, { x: x + 0.22, y: Y0 + 0.2, w: cw - 0.4, h: 0.3, color: C.accent1 });
    numero(s, v, { x: x + 0.22, y: Y0 + 0.56, w: cw - 0.44, h: 0.72, fontSize: TX.cifra, valign: 'top' });
    T(s, f, { x: x + 0.22, y: Y0 + 1.32, w: cw - 0.4, h: 0.4, fontSize: TX.cuerpo, bold: true });
    T(s, d, { x: x + 0.22, y: Y0 + 1.8, w: cw - 0.4, h: 0.95, fontSize: TX.cuerpo, color: C.text2 });
  });
  regla(s, 5.8, M, CW, C.accent1);
  T(s, [{ text: '42 talleres y 7.773 kits al año 5, ', options: { bold: true } }, { text: 'sin activos fijos.', options: { color: C.text2 } }], { x: M, y: 5.88, w: CW, h: 0.46, fontSize: TX.sub });
  marca(s, 'sup', 'MONTOS NETOS · A VALIDAR CON LOS PRIMEROS TALLERES', M, 6.42, { h: 0.38 });
  return s;
};

// A5 · tamaño del mercado y adopción
D['a-mercado'] = () => {
  const s = contenido('DEMANDA · MERCADO Y ADOPCIÓN', '162.780 VEHÍCULOS DE TECHO;', '11,1% adoptado al año\u00A05.');
  const lw = 5.0;
  [['TAM · CHILE', '4.409.729', 'autos y taxis a combustión'], ['SAM · RM', '1.685.930', 'lo que atiende el taller propio'], ['SEGMENTO LABORAL', '162.780', 'colectivos, taxis y aplicaciones']].forEach(([k, v, d], i) => {
    const y = Y0 + i * 1.38, hot = i === 2;
    regla(s, y, M, lw, hot ? C.accent1 : C.accent5);
    mono(s, k, { x: M, y: y + 0.1, w: lw, h: 0.3, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: M, y: y + 0.42, w: 2.55, h: 0.66, fontSize: TX.cifraM, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: M + 2.6, y: y + 0.42, w: lw - 2.6, h: 0.86, fontSize: TX.cuerpo, color: C.text2 });
  });
  const gx = M + lw + 0.45, gw = R - gx;
  mono(s, 'ADOPCIÓN ACUMULADA · MODELO DE BASS', { x: gx, y: Y0, w: gw, h: 0.3, color: C.text1 });
  marca(s, 'est', 'ESTIMACIÓN', R, Y0 + 0.4, { alignRight: true });
  s.addChart(pres.ChartType.line, [{ name: 'Adopción acumulada', labels: AÑOS, values: [0.0038, 0.0114, 0.0265, 0.0560, 0.1108] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: Y0 + 0.85, w: gw + 0.1, h: 2.55, chartColors: [HEX.accent1], lineSize: 3, lineDash: ['dash'], lineDataSymbol: 'circle', lineDataSymbolSize: 11,
    valAxisMinVal: 0, valAxisMaxVal: 0.14,
    showValue: true, dataLabelPosition: 't', dataLabelFormatCode: '0.0%', dataLabelFontSize: 20,
    objectName: 'Adopción acumulada del segmento laboral',
  }));
  T(s, 'Aun si solo el 40% del segmento adoptara, la demanda cubre el año 5.', { x: gx, y: Y0 + 3.5, w: gw, h: 0.7, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// A6 · perfiles de cargo (Tabla N° 13)
D['a-perfiles'] = () => {
  const s = contenido('RECURSOS HUMANOS · PERFILES DE CARGO', 'CADA CARGO RESPONDE', 'por un resultado crítico.');
  const p = [
    ['Gerente General', 'Autoriza cada paso de crecimiento si la caja lo cubre.'],
    ['Responsable Técnico', 'Arma los dúos, valida ascensos y firma cada auto.'],
    ['Ingeniería de Calibración', 'Certifica cada modelo y cuida que el ahorro real calce.'],
    ['Comercial y Postventa', 'Convierte cotizaciones sin prometer de más.'],
    ['Administración y Personas', 'Que ningún auto espere un kit; sueldos al día.'],
    ['Técnico Instalador', 'Instala según el procedimiento y las cinco reglas de oro.'],
    ['Comercial de Empresas', 'Suma solo talleres que cumplan el reglamento.'],
    ['Asistente de Postventa', 'Que ninguna mantención ni garantía se pierda.'],
    ['Asistente de Administración', 'Despacha kits y baterías con su trazabilidad.'],
  ];
  const rh = 0.46, c2 = M + 4.05;
  p.forEach(([c, r], i) => {
    const y = Y0 - 0.08 + i * rh;
    regla(s, y, M, CW, C.accent5);
    T(s, c, { x: M, y, w: 3.95, h: rh, valign: 'middle', fontSize: TX.cuerpo, bold: true, color: i === 5 ? C.accent1 : C.text1 });
    T(s, r, { x: c2, y, w: R - c2, h: rh, valign: 'middle', fontSize: TX.cuerpo, color: C.text2 });
  });
  regla(s, Y0 - 0.08 + p.length * rh, M, CW, C.accent5);
  return s;
};

// A7 · rentas (Tabla N° 14) y bonos (Tabla N° 15)
D['a-rentas'] = () => {
  const s = contenido('RECURSOS HUMANOS · COMPENSACIONES Y NÓMINA', 'EL SUPERIOR GANA MÁS;', 'entre áreas decide la escasez.');
  const lw = 8.15;
  mono(s, 'RENTA BRUTA MENSUAL · MILES DE PESOS', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  const cargos = ['Gerente General', 'Responsable Técnico', 'Calibración', 'Técnico N4', 'Técnico N3', 'Administración', 'Comercial', 'Técnico N1', 'Asistentes'];
  const rentas = [2000, 1800, 1700, 1150, 1000, 900, 850, 750, 692];
  s.addChart(pres.ChartType.bar, [{ name: 'Renta bruta', labels: cargos, values: rentas }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.36, w: lw + 0.1, h: YF - Y0 - 0.92, barDir: 'bar', barGapWidthPct: 24, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 2450, catAxisLabelFontFace: F_BODY, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 18,
    objectName: 'Renta bruta mensual por cargo',
  }));
  // la serie anual de nómina por instalación (Tabla N° 16), que la exposición resume en la lámina 08
  regla(s, YF - 0.5, M, lw, C.accent5);
  T(s, [{ text: 'Nómina por instalación, años 1 a 5 (miles de $): ', options: { bold: true } }, { text: '508 · 306 · 257 · 253 · 265', options: { color: C.accent1, bold: true } }], { x: M, y: YF - 0.44, w: lw, h: 0.42, fontSize: 16, valign: 'middle' });
  const cx = M + lw + 0.42, cw = R - cx, ch = YF - Y0;
  cajaHot(s, cx, Y0, cw, ch);
  mono(s, 'BONO POR NIVEL\nVALIDADO', { x: cx + 0.25, y: Y0 + 0.2, w: cw - 0.4, h: 0.6, color: C.accent1 });
  [['N2', '$200 mil'], ['N3', '$300 mil'], ['N4', '$350 mil']].forEach(([k, v], i) => {
    const y = Y0 + 0.9 + i * 0.62;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent5);
    tag(s, k, cx + 0.25, y + 0.12, { w: 0.66, h: 0.38, size: TX.etq });
    numero(s, v, { x: cx + 1.0, y, w: cw - 1.25, h: 0.62, fontSize: TX.cifraS, align: 'right', valign: 'middle' });
  });
  const ty = Y0 + 0.9 + 3 * 0.62;
  linea(s, cx + 0.25, ty, cw - 0.5, 0, C.accent1, 1);
  T(s, 'Total', { x: cx + 0.25, y: ty, w: 1.5, h: 0.7, valign: 'middle', fontSize: TX.cuerpoL, bold: true });
  numero(s, '$850 mil', { x: cx + 1.0, y: ty, w: cw - 1.25, h: 0.7, fontSize: TX.cifraM, align: 'right', valign: 'middle', color: C.accent1 });
  T(s, 'Los comerciales suman comisión.', { x: cx + 0.25, y: ty + 0.72, w: cw - 0.45, h: 0.64, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// A8 · jornada de instalación (Anexo N° 8)
D['a-jornada'] = () => {
  const s = contenido('OPERACIONES · JORNADA DE INSTALACIÓN', 'UN VEHÍCULO POR JORNADA:', '8,4 horas.');
  const b = [['Seguridad', 0.4], ['Recepción', 0.4], ['Montaje y pesaje', 3.3], ['Integración', 1.8], ['Calibración', 0.8], ['Pruebas', 1.0], ['Cierre', 0.7]];
  const total = 8.4;
  mono(s, 'HORAS POR BLOQUE · DÚO CON UN N3', { x: M, y: Y0, w: 7, h: 0.3, color: C.text1 });
  marca(s, 'est', 'ESTIMACIÓN · TIEMPOS', R, Y0 - 0.05, { alignRight: true });
  let x = M;
  const by = Y0 + 0.42, bh = 0.78;
  b.forEach(([t, h], i) => {
    const w = CW * h / total, hot = i === 2 || i === 3;
    s.addShape(S.rect, { x: x + 0.02, y: by, w: w - 0.04, h: bh, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    numero(s, dec(h), { x, y: by, w, h: bh, align: 'center', valign: 'middle', fontSize: w > 0.9 ? TX.cifraS : 22, color: hot ? C.background1 : C.text1 });
    mono(s, String(i + 1), { x, y: by + bh + 0.04, w, h: 0.3, align: 'center', color: hot ? C.accent1 : C.text2 });
    x += w;
  });
  // leyenda con los siete bloques, en orden (los bloques cortos no tienen espacio para su nombre)
  const ly = by + bh + 0.42, lc = CW / 4;
  b.forEach(([t], i) => {
    const xx = M + (i % 4) * lc, yy = ly + Math.floor(i / 4) * 0.4, hot = i === 2 || i === 3;
    tag(s, String(i + 1), xx, yy + 0.02, { w: 0.4, h: 0.34, size: TX.etq, off: !hot });
    T(s, t, { x: xx + 0.52, y: yy, w: lc - 0.6, h: 0.38, valign: 'middle', fontSize: TX.cuerpo, bold: hot, color: hot ? C.accent1 : C.text1 });
  });
  T(s, 'Montaje e integración concentran 5,1 de las 8,4 horas.', { x: M, y: ly + 0.86, w: CW, h: 0.42, fontSize: TX.cuerpoL, bold: true });
  const py = 5.76;
  regla(s, py - 0.1, M, CW, C.accent1);
  mono(s, 'CUATRO CONTROLES · SI FALLA, SE DETIENE', { x: M, y: py, w: CW, h: 0.3, color: C.accent1 });
  const pw = (CW - 0.6) / 4;
  ['¿Vehículo apto?', '¿Masa y ejes?', '¿Aislación?', '¿Dinamómetro?'].forEach((q, i) => {
    const xx = M + i * (pw + 0.2);
    caja(s, xx, py + 0.36, pw, 0.7);
    s.addShape(S.rect, { x: xx, y: py + 0.36, w: 0.07, h: 0.7, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, q, { x: xx + 0.25, y: py + 0.36, w: pw - 0.32, h: 0.7, valign: 'middle', fontSize: TX.cuerpo, bold: true });
  });
  return s;
};

// A9 · inversión (Tabla N° 18) y gasto operacional (Tabla N° 19)
D['a-inversion'] = () => {
  const s = contenido('OPERACIONES · INVERSIÓN Y GASTO', 'LA INVERSIÓN SIGUE AL GATILLO;', 'el gasto, al kit.');
  const gw = (CW - 0.5) / 2, ghh = 3.2;
  mono(s, 'INVERSIÓN · MILLONES DE $', { x: M, y: Y0, w: gw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Inversión', labels: AÑOS, values: [71.2, 10.1, 81.3, 0, 81.3] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.36, w: gw + 0.1, h: ghh, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 96, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0;;"—"', dataLabelFontSize: 22,
    objectName: 'Inversión en equipamiento por año',
  }));
  T(s, 'Un local nuevo en los años 1, 3 y 5.', { x: M, y: Y0 + ghh + 0.5, w: gw, h: 0.45, fontSize: TX.cuerpo, color: C.text2 });
  const gx = M + gw + 0.5;
  mono(s, 'GASTO OPERACIONAL · MILLONES DE $', { x: gx, y: Y0, w: gw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Gasto operacional', labels: AÑOS, values: [1064.1, 2945.4, 5657.9, 7623.5, 9605.8] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: Y0 + 0.36, w: gw + 0.1, h: ghh, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 11200, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 22,
    objectName: 'Gasto operacional por año',
  }));
  T(s, 'El kit es más del 90% de cada año.', { x: gx, y: Y0 + ghh + 0.5, w: gw, h: 0.45, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// A10 · sensibilidad (Tabla N° 21)
D['a-sensibilidad'] = () => {
  const s = contenido('OPERACIONES · SENSIBILIDAD', 'EL DÓLAR PESA MÁS', 'que el precio y la mezcla.');
  const lw = 8.15;
  mono(s, 'RESULTADO PROPIO AL AÑO 5 · MILLONES DE $', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Resultado', labels: ['Dólar −10%', 'Precio +5%', 'Plus 80%', 'Base', 'Plus 40%', 'Precio −5%', 'Dólar +10%'], values: [1646.9, 1433.0, 993.7, 869.9, 746.1, 306.9, 92.9] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.36, w: lw + 0.1, h: YF - Y0 - 0.36, barDir: 'bar', barGapWidthPct: 28, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2, HEX.dk2, HEX.dk1],
    valAxisMinVal: 0, valAxisMaxVal: 2000, catAxisLabelFontSize: 17,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 20,
    objectName: 'Sensibilidad del resultado al quinto año',
  }));
  const cx = M + lw + 0.42, cw = R - cx;
  cajaHot(s, cx, Y0, cw, 2.75);
  mono(s, 'MARGEN SOBRE VENTAS', { x: cx + 0.25, y: Y0 + 0.22, w: cw - 0.4, h: 0.3, color: C.accent1 });
  [['Base', '7,7%'], ['Dólar +10%', '0,8%'], ['Dólar −10%', '14,6%']].forEach(([k, v], i) => {
    const y = Y0 + 0.66 + i * 0.66;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent5);
    T(s, k, { x: cx + 0.25, y, w: 2.1, h: 0.66, valign: 'middle', fontSize: TX.cuerpo });
    numero(s, v, { x: cx + 2.0, y, w: cw - 2.25, h: 0.66, fontSize: i === 1 ? TX.cifraM : TX.cifraS, align: 'right', valign: 'middle', color: i === 0 ? C.accent1 : C.text1 });
  });
  T(s, 'El 82% del costo del kit está en dólares: el plan financiero evaluará coberturas.', { x: cx, y: Y0 + 2.98, w: cw, h: 1.25, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// A11 · Carta Gantt detallada (Figura N° 5): el detalle que la exposición resume en el cronograma ejecutivo
D['a-gantt'] = () => {
  const s = contenido('OPERACIONES · CARTA GANTT DE IMPLEMENTACIÓN', 'CARTA GANTT', 'completa.');
  const x0 = M + 3.2, xw = R - x0, u = xw / 31;
  const P = m => x0 + u * (m < 0 ? m + 3 : m <= 13 ? m + 2 : 15 + (m - 13) / 3); // inicio del mes m (mes 1 = enero 2027)
  const top = Y0 + 0.42, rh = 0.46;
  const filas = [
    ['Investigación y permisos', [['bar', -3, 1, 'p']]],
    ['Homologación y primer dúo', [['bar', -2, 1, 'p']]],
    ['Reglamento Ley 21.793', [['star', -1, 'debe estar vigente antes de vender']]],
    ['Taller 1: dúos 1 a 6', [['hito', 1, '1'], ['bar', 4, 6, 'o'], ['hito', 6, '2'], ['bar', 10, 12, 'o'], ['hito', 12, '3'], ['bar', 12, 14, 'o'], ['hito', 14, '4'], ['bar', 16, 18, 'o'], ['hito', 18, '5'], ['bar', 18, 20, 'o'], ['hito', 20, '6']]],
    ['Calibración de modelos', [['bar', 1, 13, 'p', 'dos al mes'], ['bar', 13, 61, 'o', 'uno al mes']]],
    ['Red de talleres', [['bar', 13, 61, 'p'], ['n', 25, '3'], ['n', 37, '9'], ['n', 49, '20'], ['n', 61, '42']]],
    ['Talleres 2 y 3', [['bar', 22, 25, 'a'], ['bar', 25, 37, 'o', 'taller 2'], ['hito', 25], ['bar', 46, 49, 'a'], ['bar', 49, 61, 'o', 'taller 3'], ['hito', 49]]],
  ];
  const bottom = top + filas.length * rh;
  [['2026', -3, 1], ['AÑO 1 · 2027', 1, 13], ['AÑO 2', 13, 25], ['AÑO 3', 25, 37], ['AÑO 4', 37, 49], ['AÑO 5', 49, 61]].forEach(([t, a, b], i) => {
    mono(s, t, { x: P(a), y: Y0, w: P(b) - P(a), h: 0.32, align: 'center', valign: 'middle', color: i === 1 ? C.accent1 : C.text1, charSpacing: 0.5 });
    if (i > 0) linea(s, P(a), top - 0.06, 0, bottom - top + 0.12, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  let y = top;
  const col = { p: C.accent1, o: '4A5257', a: HEX.dk2 };
  filas.forEach(([nom, items], fi) => {
    if (fi) regla(s, y, M, CW, C.accent6);
    T(s, nom, { x: M, y, w: x0 - M - 0.15, h: rh, align: 'right', valign: 'middle', fontSize: TX.etq + 1 });
    // las barras primero, para que los rombos y sus números queden encima
    items.slice().sort((p, q) => (p[0] === 'bar' ? 0 : 1) - (q[0] === 'bar' ? 0 : 1)).forEach(it => {
      const cy = y + rh / 2;
      if (it[0] === 'bar') {
        const [, a, b, c, txt] = it, bx = P(a), bw = P(b) - P(a);
        s.addShape(S.rect, { x: bx, y: y + 0.07, w: bw, h: rh - 0.14, fill: { color: col[c] }, line: { type: 'none' } });
        if (txt) T(s, txt, { x: bx, y, w: bw, h: rh, align: 'center', valign: 'middle', fontSize: TX.etq, bold: true, color: c === 'p' ? C.background1 : C.text1 });
      } else if (it[0] === 'hito') {
        const [, m, txt] = it, hx = P(m);
        s.addShape(S.diamond, { x: hx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: C.text1 }, line: { color: C.background1, width: 0.5 } });
        if (txt) mono(s, txt, { x: hx + 0.08, y: y - 0.08, w: 0.3, h: 0.28, fontSize: TX.etq, color: C.text1, bold: true });
      } else if (it[0] === 'star') {
        const [, m, txt] = it, hx = P(m) + u / 2;
        s.addShape(S.star5, { x: hx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, fill: { color: C.text1 }, line: { type: 'none' } });
        T(s, txt, { x: hx + 0.28, y, w: 6.0, h: rh, valign: 'middle', fontSize: TX.etq + 2, color: C.text1, bold: true });
      } else if (it[0] === 'n') {
        const [, m, txt] = it;
        T(s, txt, { x: P(m) - 0.62, y, w: 0.54, h: rh, fontFace: F_CON, fontSize: TX.cuerpo, align: 'right', valign: 'middle', color: C.background1, bold: true });
      }
    });
    y += rh;
  });
  const ly = bottom + 0.14;
  let lx = M;
  [['rect', C.accent1, 'Actividad principal'], ['rect', '4A5257', 'Operación'], ['rect', HEX.dk2, 'Preapertura de taller'], ['diamond', C.text1, 'Apertura o dúo nuevo'], ['star5', C.text1, 'Hito crítico']].forEach(([sh, c, t]) => {
    s.addShape(S[sh], { x: lx, y: ly + 0.08, w: 0.24, h: 0.24, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.34, y: ly, w: t.length * 0.112 + 0.1, h: 0.4, fontSize: TX.etq, valign: 'middle', color: C.text1 });
    lx += 0.34 + t.length * 0.112 + 0.4;
  });
  return s;
};

D.objetivos = () => {
  const s = contenido('PLAN DE MARKETING · OBJETIVOS', 'EL PRIMER AÑO', 'decide el resto.');
  fondo(s, 'rejilla');
  mono(s, 'OBJETIVO GENERAL · CINCO AÑOS', { x: M, y: Y0, w: CW, h: 0.3, color: C.accent1 });
  T(s, 'Ser la referencia de la hibridación de posventa en Chile.', { x: M, y: Y0 + 0.36, w: CW, h: 0.46, fontSize: TX.sub, bold: true });
  const ey = Y0 + 1.04;
  regla(s, ey, M, CW, C.accent5);
  mono(s, 'OBJETIVOS ESPECÍFICOS · AÑO 1', { x: M, y: ey + 0.16, w: CW, h: 0.3, color: C.text1 });
  // el protagonista: la meta de instalaciones
  const hy = ey + 0.56;
  brillo(s, M, hy + 0.35, 2.6, 0.9, 0.7);
  numero(s, '299', { x: M, y: hy, w: 3.7, h: 1.42, fontSize: 104, valign: 'top', color: C.accent1 });
  T(s, 'vehículos instalados', { x: M, y: hy + 1.42, w: 3.7, h: 0.4, fontSize: TX.cuerpoL });
  // tres metas de apoyo, separadas por reglas verticales
  const kx = M + 4.1, kw = (R - kx) / 3;
  [['3', 'casos con ahorro medido en nueve meses'], ['80%', 'de clientes satisfechos'], ['15%', 'de clientes llega por recomendación']].forEach(([v, d], i) => {
    const x = kx + i * kw;
    linea(s, x, hy + 0.12, 0, 1.66, C.accent5, 0.75);
    numero(s, v, { x: x + 0.32, y: hy + 0.08, w: kw - 0.4, h: 0.92, fontSize: 60, valign: 'top' });
    T(s, d, { x: x + 0.32, y: hy + 1.04, w: kw - 0.5, h: 0.74, fontSize: TX.cuerpo, color: C.text2 });
  });
  return s;
};

D.segmentacion = () => {
  const s = contenido('PLAN DE MARKETING · SEGMENTACIÓN', 'EL CLIENTE SE DEFINE', 'por su auto.');
  fondo(s, 'rejilla');
  // la condición técnica: tres rasgos del auto
  const lw = 6.75, gap = 0.2, tw = (lw - 2 * gap) / 3, th = 1.16;
  mono(s, 'EL AUTO QUE PUEDE LLEVAR EL KIT', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  ['Liviano', 'A combustión', 'Tracción delantera'].forEach((t, i) => {
    const x = M + i * (tw + gap), y = Y0 + 0.42;
    caja(s, x, y, tw, th, { line: { color: C.accent5, width: 0.75 } });
    s.addShape(S.rect, { x, y, w: tw, h: 0.05, fill: { color: C.text2 }, line: { type: 'none' } });
    mono(s, '0' + (i + 1), { x: x + 0.2, y: y + 0.18, w: 0.6, h: 0.28, color: C.accent1 });
    T(s, t, { x: x + 0.2, y: y + 0.46, w: tw - 0.3, h: 0.62, fontSize: 21, bold: true, valign: 'top', lineSpacingMultiple: 0.92 });
  });
  T(s, 'El kit va en el eje trasero: por eso manda la tracción.', { x: M, y: Y0 + 1.7, w: lw, h: 0.36, fontSize: 17, color: C.text2 });
  // el punto de entrada, protagonista
  const bx = M + lw + 0.45, bw = R - bx, bh = 2.06;
  brillo(s, bx, Y0, bw, bh, 0.5);
  cajaHot(s, bx, Y0, bw, bh);
  mono(s, 'PUNTO DE ENTRADA · USO LABORAL', { x: bx + 0.28, y: Y0 + 0.2, w: bw - 0.5, h: 0.3, color: C.accent1 });
  numero(s, '162.780', { x: bx + 0.28, y: Y0 + 0.48, w: bw - 0.5, h: 0.88, fontSize: 60, valign: 'top', color: C.accent1 });
  T(s, 'colectivos, taxis y aplicaciones en la Región Metropolitana', { x: bx + 0.28, y: Y0 + 1.42, w: bw - 0.5, h: 0.6, fontSize: 17, color: C.text1 });
  // las cuatro variables, con la conductual destacada
  const vy = Y0 + 2.42, n = 4, cg = 0.3, cw = (CW - (n - 1) * cg) / n;
  [['GEOGRÁFICA', 'RM primero', '36,8% del parque nacional'], ['DEMOGRÁFICA', 'Cuatro roles', 'usa, decide, paga o influye'], ['PSICOGRÁFICA', 'Cinco motivos', 'no solo el ahorro'], ['CONDUCTUAL', 'Intensidad de uso', 'decide en cuánto se paga el kit']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + cg), hot = i === 3;
    linea(s, x, vy, cw, 0, hot ? C.accent1 : C.accent5, hot ? 2 : 0.75);
    mono(s, k, { x, y: vy + 0.14, w: cw, h: 0.28, fontSize: 14, color: hot ? C.accent1 : C.text2 });
    T(s, v, { x, y: vy + 0.46, w: cw, h: 0.42, fontSize: 21, bold: true, color: hot ? C.accent1 : C.text1 });
    T(s, d, { x, y: vy + 0.88, w: cw - 0.1, h: 0.62, fontSize: 17, color: hot ? C.text1 : C.text2 });
  });
  return s;
};

D.investigacion = () => {
  const s = contenido('PLAN DE MARKETING · INVESTIGACIÓN DE MERCADO', 'VALIDAR', 'antes de vender.');
  fondo(s, 'rejilla');
  mono(s, 'DISEÑO MIXTO Y SECUENCIAL · DE LO CUALITATIVO A LO CUANTITATIVO', { x: M, y: Y0, w: CW, h: 0.3, color: C.text1 });
  const n = 3, colW = CW / n, ly = Y0 + 0.56;
  linea(s, M + 0.1, ly, CW - colW + 0.1, 0, C.text2, 1.25, { line: { color: C.text2, width: 1.25, dashType: 'dash' } });
  [['Expertos', '4', 'Estado, academia, industria y taller'], ['Clientes', '5', 'en profundidad, una por perfil'], ['Encuesta', '150', 'personas, muestreo por cuotas']].forEach(([k, v, u], i) => {
    const x = M + i * colW, hot = i === 2;
    s.addShape(S.ellipse, { x: x + 0.01, y: ly - 0.11, w: 0.22, h: 0.22, fill: { color: hot ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.5 } });
    mono(s, `ETAPA ${i + 1}`, { x, y: ly + 0.26, w: colW - 0.2, h: 0.28, color: C.accent1 });
    T(s, k, { x, y: ly + 0.5, w: colW - 0.2, h: 0.5, fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 34 : 26, color: C.text1 });
    numero(s, v, { x, y: ly + 0.98, w: colW - 0.2, h: 0.7, fontSize: 50, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, u, { x, y: ly + 1.66, w: colW - 0.3, h: 0.36, fontSize: 17, color: C.text2 });
  });
  // seis hipótesis: lo que esperamos encontrar, con la que más decide
  const by = 5.32;
  regla(s, by, M, CW, C.accent1);
  numero(s, '6', { x: M, y: by + 0.1, w: 0.9, h: 1.2, fontSize: 88, valign: 'top', color: C.accent1 });
  mono(s, 'HIPÓTESIS · LA QUE MÁS DECIDE', { x: M + 1.05, y: by + 0.16, w: 6.5, h: 0.3, color: C.text1 });
  marca(s, 'est', 'MUESTRA POR CUOTAS · RESULTADOS INDICATIVOS', R, by + 0.12, { alignRight: true, h: 0.36, size: 13 });
  T(s, '«La barrera es la confianza, no el precio.»', { x: M + 1.05, y: by + 0.5, w: CW - 1.05, h: 0.52, fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 34 : 26, color: C.accent1 });
  T(s, 'Las otras cinco miden quién compra primero, los motivos, los respaldos y las alternativas.', { x: M + 1.05, y: by + 1.04, w: CW - 1.05, h: 0.4, fontSize: 16, color: C.text2 });
  return s;
};

D.mix = () => {
  const s = contenido('PLAN DE MARKETING · MIX DE SERVICIOS (7 P)', 'EL AHORRO SE VE', 'antes de pagar.');
  fondo(s, 'horizonte');
  const P7 = [
    ['PRODUCTO', 'Kit Esencial o Plus, certificado en una jornada'],
    ['PRECIO', '$4,29 M y $4,99 M con IVA; cuotas con convenio'],
    ['PLAZA', 'Web y taller propio en la RM; la red, en regiones'],
    ['PROMOCIÓN', 'Estimador, clientes piloto, casos medidos y referidos'],
    ['PERSONAS', 'Un dúo con un técnico N3 o N4'],
    ['PROCESOS', 'Cinco etapas; instalar lo decide el cliente'],
    ['EVIDENCIA FÍSICA', 'Certificado, sello e informe mensual de ahorro'],
  ];
  const n = 4, gap = 0.22, tw = (CW - (n - 1) * gap) / n, th = (YF - Y0 - gap) / 2;
  P7.forEach(([k, t], i) => {
    const x = M + (i % n) * (tw + gap), y = Y0 + Math.floor(i / n) * (th + gap);
    caja(s, x, y, tw, th, { line: { color: C.accent5, width: 0.75 } });
    tag(s, String(i + 1), x + 0.2, y + 0.2, { w: 0.42, h: 0.36, size: 15, off: true });
    mono(s, k, { x: x + 0.74, y: y + 0.2, w: tw - 0.9, h: 0.36, fontSize: 14, color: C.accent1, valign: 'middle' });
    T(s, t, { x: x + 0.2, y: y + 0.74, w: tw - 0.38, h: th - 0.9, fontSize: 19, bold: true, lineSpacingMultiple: 0.98 });
  });
  // la idea que ordena las siete variables
  const x = M + 3 * (tw + gap), y = Y0 + th + gap;
  brillo(s, x, y, tw, th, 0.4);
  cajaHot(s, x, y, tw, th);
  mono(s, 'UNA SOLA PROMESA', { x: x + 0.22, y: y + 0.2, w: tw - 0.4, h: 0.36, fontSize: 14, color: C.accent1, valign: 'middle' });
  T(s, 'Conoce su ahorro antes de pagar y lo comprueba después.', { x: x + 0.22, y: y + 0.66, w: tw - 0.4, h: th - 0.8, fontSize: 19, color: C.text1, lineSpacingMultiple: 0.98 });
  return s;
};

D['presupuesto-mkt'] = () => {
  const s = contenido('PLAN DE MARKETING · PRESUPUESTO', 'EL PRIMER AÑO', 'se invierte en evidencia.');
  fondo(s, 'horizonte');
  const lw = 8.0;
  mono(s, 'POR OBJETIVO Y TAREA · MILLONES DE $', { x: M, y: Y0, w: 7.0, h: 0.3, color: C.text1 });
  leyenda(s, [[HEX.accent1, 'Clientes piloto'], ['A9B1B4', 'Pauta digital'], ['6B7579', 'Comisiones'], ['3A4146', 'Otras']], M, Y0 + 0.4, { sep: 0.3, size: 15 });
  const TOT = ['Año 1 · 80,9', 'Año 2 · 80,0', 'Año 3 · 116,3', 'Año 4 · 134,3', 'Año 5 · 163,7'];
  s.addChart(pres.ChartType.bar, [
    { name: 'Clientes piloto', labels: TOT, values: [49.47, 23.75, 23.75, 23.75, 23.75] },
    { name: 'Pauta digital', labels: TOT, values: [14.40, 18.00, 24.00, 24.00, 30.00] },
    { name: 'Comisiones', labels: TOT, values: [4.92, 15.58, 30.30, 42.45, 56.98] },
    { name: 'Otras', labels: TOT, values: [12.15, 22.65, 38.22, 44.14, 52.96] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.86, w: lw + 0.1, h: YF - Y0 - 0.86, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 38,
    chartColors: [HEX.accent1, 'A9B1B4', '6B7579', '3A4146'], valAxisMinVal: 0, valAxisMaxVal: 168,
    showValue: false, catAxisLabelFontSize: 15, objectName: 'Presupuesto de marketing por partida',
  }));
  const kx = M + lw + 0.5, kw = R - kx;
  brillo(s, kx, Y0 + 0.2, kw, 1.4, 0.4);
  cajaHot(s, kx, Y0, kw, 2.0);
  mono(s, 'AÑO 1', { x: kx + 0.25, y: Y0 + 0.18, w: kw - 0.4, h: 0.3, color: C.accent1 });
  numero(s, '$80,9 M', { x: kx + 0.25, y: Y0 + 0.46, w: kw - 0.4, h: 0.8, fontSize: 52, valign: 'top', color: C.accent1 });
  T(s, '25 clientes piloto a mitad de precio, por su caso medido', { x: kx + 0.25, y: Y0 + 1.26, w: kw - 0.4, h: 0.62, fontSize: 15, color: C.text1 });
  const y2 = Y0 + 2.3;
  regla(s, y2, kx, kw, C.accent5);
  mono(s, 'CINCO AÑOS', { x: kx, y: y2 + 0.14, w: kw, h: 0.3 });
  numero(s, '$575 M', { x: kx, y: y2 + 0.44, w: kw, h: 0.8, fontSize: 52, valign: 'top' });
  T(s, 'netos de IVA; desde el año 3 pesan más las comisiones', { x: kx, y: y2 + 1.24, w: kw, h: 0.6, fontSize: 16, color: C.text2 });
  return s;
};

D['presupuesto-ops'] = () => {
  const s = contenido('OPERACIONES · PRESUPUESTO', 'LA INVERSIÓN SIGUE AL GATILLO;', 'el gasto, al kit.');
  const gw = (CW - 0.5) / 2, ghh = 2.66;
  mono(s, 'INVERSIÓN EN EQUIPAMIENTO · MILLONES DE $', { x: M, y: Y0, w: gw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Inversión', labels: AÑOS, values: [71.2, 10.1, 81.3, 0, 81.3] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.36, w: gw + 0.1, h: ghh, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 96, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0;;"—"', dataLabelFontSize: 22,
    objectName: 'Inversión en equipamiento por año',
  }));
  T(s, 'Un local nuevo en los años 1, 3 y 5.', { x: M, y: Y0 + ghh + 0.42, w: gw, h: 0.44, fontSize: 17, color: C.text2 });
  const gx = M + gw + 0.5;
  mono(s, 'GASTO OPERACIONAL · MILLONES DE $', { x: gx, y: Y0, w: gw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Gasto operacional', labels: AÑOS, values: [1064.1, 2945.4, 5657.9, 7623.5, 9605.8] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: Y0 + 0.36, w: gw + 0.1, h: ghh, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 11200, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 22,
    objectName: 'Gasto operacional por año',
  }));
  T(s, 'El kit es más del 90% de cada año.', { x: gx, y: Y0 + ghh + 0.42, w: gw, h: 0.44, fontSize: 17, color: C.text2 });
  // el riesgo que se desprende del gasto: el kit se paga en dólares
  const ry = YF - 0.78, rhh = 0.78;
  s.addShape(S.rect, { x: M, y: ry, w: CW, h: rhh, fill: { color: HOT }, line: { color: C.accent1, width: 1 } });
  visor(s, M, ry, CW, rhh);
  mono(s, 'RIESGO', { x: M + 0.25, y: ry, w: 1.3, h: rhh, valign: 'middle', color: C.accent1 });
  T(s, [{ text: 'El 82% del kit se paga en dólares: ', options: { bold: true } }, { text: 'si el dólar sube 10%, el margen del año 5 cae de 7,7% a 0,8%.', options: { color: C.text1 } }], { x: M + 1.45, y: ry, w: CW - 1.7, h: rhh, fontSize: 17, valign: 'middle' });
  return s;
};

D['a-pronostico'] = () => {
  const s = contenido('DEMANDA · PRONÓSTICO POR LÍNEA', 'PRONÓSTICO POR LÍNEA:', 'talleres propios y red.');
  const hy = Y0;
  leyenda(s, [[HEX.dk2, 'Demanda atendible (RM)'], [HEX.accent1, 'Instalaciones propias'], ['4A5257', 'Kits a la red (RM y regiones)']], M, hy, { sep: 0.4, size: 16 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
    { name: 'Kits a la red', labels: AÑOS, values: [0, 365, 1074, 3287, 7773] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: hy + 0.46, w: CW + 0.2, h: YF - hy - 1.06, barDir: 'col', barGapWidthPct: 45, barOverlapPct: 0,
    chartColors: [HEX.dk2, HEX.accent1, '4A5257'], valAxisMinVal: 0, valAxisMaxVal: 8900,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 18,
    objectName: 'Pronóstico de ventas por línea',
  }));
  T(s, [{ text: 'La red suma regiones: ', options: { bold: true } }, { text: 'al año 5, 4.286 kits en la RM y 3.487 fuera de ella.', options: { color: C.text2 } }], { x: M, y: YF - 0.5, w: CW, h: 0.48, fontSize: 18, valign: 'middle' });
  return s;
};

D['a-recuperacion'] = () => {
  const s = contenido('PRECIO · RECUPERACIÓN DE LA INVERSIÓN', 'SE PAGA EN 28 A 37 MESES,', 'dentro del ciclo del auto.');
  const c1 = M + 5.0, cw = (R - c1 - 0.3) / 2, c2 = c1 + cw + 0.3, rh = 0.54;
  mono(s, 'ESENCIAL', { x: c1, y: Y0, w: cw, h: 0.3, color: C.text1 });
  mono(s, 'PLUS', { x: c2, y: Y0, w: cw, h: 0.3, color: C.accent1 });
  const filas = [
    ['Ahorro mensual del colectivo de referencia', '$117.069', '$145.327'],
    ['Meses para recuperar · colectivo', '36,6', '34,3'],
    ['Meses para recuperar · aplicación', '28,9', '27,5'],
    ['Precio por punto de ahorro del colectivo', '$295.862', '$277.222'],
  ];
  filas.forEach(([k, a, b], i) => {
    const y = Y0 + 0.42 + i * rh;
    regla(s, y, M, CW);
    T(s, k, { x: M, y, w: c1 - M - 0.2, h: rh, valign: 'middle', fontSize: 18 });
    numero(s, a, { x: c1, y, w: cw, h: rh, valign: 'middle', fontSize: 30 });
    numero(s, b, { x: c2, y, w: cw, h: rh, valign: 'middle', fontSize: 30, color: C.accent1 });
  });
  regla(s, Y0 + 0.42 + filas.length * rh, M, CW);
  const fy = Y0 + 0.42 + filas.length * rh + 0.26;
  mono(s, 'FINANCIAMIENTO · CUOTA DE PLUS', { x: M, y: fy, w: CW, h: 0.3, color: C.accent1 });
  marca(s, 'est', 'AHORRO SIMULADO · BENCINA A $1.459 · 10 KM/L', R, fy - 0.04, { alignRight: true, h: 0.34, size: 12 });
  T(s, [{ text: '$159.967 al mes ', options: { bold: true } }, { text: 'a 48 meses al 25,6% anual de consumo: más que el ahorro del colectivo.', options: { color: C.text2 } }], { x: M, y: fy + 0.36, w: CW, h: 0.4, fontSize: 17 });
  T(s, [{ text: '$92.042 al mes ', options: { bold: true, color: C.accent1 } }, { text: 'con condiciones como las de BancoEstado a taxis y colectivos (0,82% al mes, 72 cuotas).', options: { color: C.text2 } }], { x: M, y: fy + 0.8, w: CW, h: 0.4, fontSize: 17 });
  return s;
};

// ---------- orden de la exposición (guion.js) y anexo ----------
const nota = x => x.texto ? `${x.quien.toUpperCase()} · ${G.segundos(x.texto)} s\n\n${x.texto}` : `${x.quien.toUpperCase()} · ${x.nota}`;
let quienAnterior = null, parte = 0;
// LUMINE_PILOTO=portada,precio,ansoff arma solo esas láminas (propuestas para aprobar), con su numeración real
const PILOTO = process.env.LUMINE_PILOTO ? process.env.LUMINE_PILOTO.split(',') : null;
G.PRINCIPAL.forEach(x => {
  if (x.quien !== quienAnterior) { abrirSeccion(`${++parte} · ${x.quien}`); quienAnterior = x.quien; }
  if (!D[x.d]) throw new Error('Falta la diapositiva ' + x.d);
  if (PILOTO && !PILOTO.includes(x.d)) { if (!/^(portada|apertura-|cierre)/.test(x.d)) NUM++; return; }
  CLAVE = x.d;
  D[x.d]().addNotes(nota(x));
});
if (!PILOTO) {
abrirSeccion('Anexo');
INDICE_ANEXO = G.PRINCIPAL.length + 1;
CLAVE = 'indice';
D.indice(INDICE_ANEXO + 1).addNotes('ANEXO · No se presenta. Cada tema tiene un enlace a su diapositiva; cada diapositiva del anexo tiene un enlace de vuelta a este índice.');
G.ANEXO.forEach(a => {
  ANEXO_ACTUAL = a;
  CLAVE = a.d;
  if (!D[a.d]) throw new Error('Falta la diapositiva ' + a.d);
  D[a.d]().addNotes(`ANEXO ${a.codigo} · Solo si preguntan.\n\n${a.apoyo}`);
});
ANEXO_ACTUAL = null;
}

// pptxgenjs escribe la paleta de Office: se reemplaza por la de Lumine en ppt/theme/theme1.xml
async function aplicarTema(archivo, tema) {
  const zip = await JSZip.loadAsync(fs.readFileSync(archivo));
  const parte = 'ppt/theme/theme1.xml';
  const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const esquema = `<a:clrScheme name="${tema.name}">` + slots.map(k => `<a:${k}><a:srgbClr val="${tema.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const xml = (await zip.file(parte).async('string'))
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => esquema)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, a) => `${a}${tema.name}"`);
  if (!xml.includes(esquema)) throw new Error('No se encontró la paleta del tema');
  zip.file(parte, xml);
  fs.writeFileSync(archivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

// ---------- tipografías incrustadas ----------
// Sin esto, PowerPoint reemplaza las fuentes de la marca por Calibri o Arial en cualquier computador que no las tenga
// instaladas. Se incrustan como PowerPoint (ppt/fonts/*.fntdata en formato EOT sin comprimir, que lee T2Embed).
// Las nueve son OFL con fsType 0, es decir, se permite incrustarlas.
const ARCHIVOS = {
  A: [{ regular: 'ArchivoSemiExpanded-ExtraBold.ttf' }, { regular: 'ArchivoCondensed-Regular.ttf', bold: 'ArchivoCondensed-Bold.ttf' },
    { regular: 'Figtree-Regular.ttf', bold: 'Figtree-Bold.ttf' }, { regular: 'IBMPlexMono-Regular.ttf', bold: 'IBMPlexMono-Bold.ttf' },
    { regular: 'InstrumentSerif-Regular.ttf', italic: 'InstrumentSerif-Italic.ttf' }],
  B: [{ regular: 'ArchivoExpanded-ExtraBold.ttf' }, { regular: 'ArchivoCondensed-Regular.ttf', bold: 'ArchivoCondensed-Bold.ttf' },
    { regular: 'Archivo-Regular.ttf', bold: 'Archivo-Bold.ttf' }, { regular: 'ArchivoSemiCondensed-Medium.ttf', bold: 'ArchivoSemiCondensed-Bold.ttf' },
    { regular: 'ArchivoExpandedLight-Regular.ttf', italic: 'ArchivoExpandedLight-Italic.ttf' }],
  C: [{ regular: 'Michroma-Regular.ttf' }, { regular: 'ArchivoCondensed-Regular.ttf', bold: 'ArchivoCondensed-Bold.ttf' },
    { regular: 'Archivo-Regular.ttf', bold: 'Archivo-Bold.ttf' }, { regular: 'ArchivoSemiCondensed-Medium.ttf', bold: 'ArchivoSemiCondensed-Bold.ttf' },
    { regular: 'ArchivoExpandedLight-Regular.ttf', italic: 'ArchivoExpandedLight-Italic.ttf' }],
};
const FUENTES_PPTX = JUEGOS[TIPO].map((f, i) => [f, ARCHIVOS[TIPO][i]]);
if (TIPO === 'C') FUENTES_PPTX.push([F_PCT, { regular: 'ArchivoExpanded-ExtraBold.ttf' }]);
function ttfAEot(ttf) {
  const tablas = {};
  for (let i = 0, n = ttf.readUInt16BE(4); i < n; i++) {
    const r = 12 + 16 * i;
    tablas[ttf.toString('latin1', r, r + 4)] = ttf.readUInt32BE(r + 8);
  }
  const os2 = tablas['OS/2'], head = tablas.head, name = tablas.name;
  const nombre = id => { // registro Windows, Unicode, inglés (EE. UU.); EOT lo pide en UTF-16LE
    const cuenta = ttf.readUInt16BE(name + 2), base = name + ttf.readUInt16BE(name + 4);
    for (let i = 0; i < cuenta; i++) {
      const r = name + 6 + 12 * i;
      if (ttf.readUInt16BE(r) === 3 && ttf.readUInt16BE(r + 2) === 1 && ttf.readUInt16BE(r + 4) === 0x409 && ttf.readUInt16BE(r + 6) === id) {
        const b = Buffer.from(ttf.subarray(base + ttf.readUInt16BE(r + 10), base + ttf.readUInt16BE(r + 10) + ttf.readUInt16BE(r + 8)));
        return b.swap16();
      }
    }
    throw new Error('La fuente no tiene el nombre ' + id);
  };
  const familia = nombre(1);
  const cadenas = [familia, nombre(2), nombre(5), nombre(4)];
  const fijo = Buffer.alloc(82);
  fijo.writeUInt32LE(ttf.length, 4);
  fijo.writeUInt32LE(0x00020001, 8);                       // versión 2.1, sin compresión ni XOR
  ttf.copy(fijo, 16, os2 + 32, os2 + 42);                   // PANOSE
  fijo.writeUInt8(1, 26);                                   // DEFAULT_CHARSET
  fijo.writeUInt8(ttf.readUInt16BE(os2 + 62) & 1, 27);     // itálica
  fijo.writeUInt32LE(ttf.readUInt16BE(os2 + 4), 28);       // peso
  fijo.writeUInt16LE(ttf.readUInt16BE(os2 + 8), 32);       // fsType
  fijo.writeUInt16LE(0x504C, 34);                           // número mágico
  for (let i = 0; i < 4; i++) fijo.writeUInt32LE(ttf.readUInt32BE(os2 + 42 + 4 * i), 36 + 4 * i);
  for (let i = 0; i < 2; i++) fijo.writeUInt32LE(ttf.readUInt32BE(os2 + 78 + 4 * i), 52 + 4 * i);
  fijo.writeUInt32LE(ttf.readUInt32BE(head + 8), 60);      // checkSumAdjustment
  const partes = [fijo];
  cadenas.forEach(c => { const t = Buffer.alloc(4); t.writeUInt16LE(c.length, 2); partes.push(t, c); });
  partes.push(Buffer.alloc(4));                             // Padding5 y RootString vacío
  partes.push(ttf);
  const eot = Buffer.concat(partes);
  eot.writeUInt32LE(eot.length, 0);
  return { eot, familia: familia.toString('utf16le') };
}
async function incrustarFuentes(archivo) {
  const zip = await JSZip.loadAsync(fs.readFileSync(archivo));
  const dir = path.join(__dirname, '..', 'fuentes');
  let rels = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
  let n = 0, lista = '';
  FUENTES_PPTX.forEach(([typeface, estilos]) => {
    lista += `<p:embeddedFont><p:font typeface="${typeface}" charset="0"/>`;
    ['regular', 'bold', 'italic', 'boldItalic'].filter(k => estilos[k]).forEach(k => {
      const { eot, familia } = ttfAEot(fs.readFileSync(path.join(dir, estilos[k])));
      if (familia !== typeface) throw new Error(`${estilos[k]} se llama «${familia}», no «${typeface}»`);
      n++;
      zip.file(`ppt/fonts/font${n}.fntdata`, eot);
      rels = rels.replace('</Relationships>', `<Relationship Id="rIdFuente${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font${n}.fntdata"/></Relationships>`);
      lista += `<p:${k} r:id="rIdFuente${n}"/>`;
    });
    lista += '</p:embeddedFont>';
  });
  zip.file('ppt/_rels/presentation.xml.rels', rels);
  let pr = await zip.file('ppt/presentation.xml').async('string');
  if (!/<p:notesSz[^>]*\/>/.test(pr)) throw new Error('No se encontró p:notesSz en presentation.xml');
  pr = pr.replace(/<p:presentation\b/, '<p:presentation embedTrueTypeFonts="1"')
    .replace(/(<p:notesSz[^>]*\/>)/, `$1<p:embeddedFontLst>${lista}</p:embeddedFontLst>`);
  zip.file('ppt/presentation.xml', pr);
  let tipos = await zip.file('[Content_Types].xml').async('string');
  if (!tipos.includes('Extension="fntdata"')) tipos = tipos.replace('<Default ', '<Default Extension="fntdata" ContentType="application/x-fontdata"/><Default ');
  zip.file('[Content_Types].xml', tipos);
  fs.writeFileSync(archivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return n;
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await aplicarTema(OUT, THEME);
  console.log('tipografías incrustadas:', await incrustarFuentes(OUT));
  console.log('listo', OUT, '·', G.PRINCIPAL.length, 'diapositivas +', G.ANEXO.length + 1, 'de anexo');
})();
