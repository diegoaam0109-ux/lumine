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
    accent1: '22B8F0', accent2: '4ADE80', accent3: 'F5B94A', accent4: 'F87171',
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
//   ok = hecho o realizado (verde) · no = lo que la marca no promete (rojo)
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
  background: { path: A('cierre-escenario.jpg') },
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
  habilita: `Fuentes: Ley N° 21.735; Ley N° 16.744; Ley N° 19.728; elaboración propia (${INF}, Tablas N° 14 a 16 y Anexo N° 7).`,
  nomina: `Fuentes: Ley N° 21.735; Ley N° 16.744; Ley N° 19.728; elaboración propia (${INF}, Tablas N° 14 a 16 y Anexo N° 7).`,
  flujo: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4 y Tabla N° 17). Imágenes ilustrativas de la operación proyectada.`,
  controles: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4, Tabla N° 17 y Anexo N° 8). Tiempos estimados. Imágenes ilustrativas de la operación proyectada.`,
  gantt: `Fuente: elaboración propia (${INF}, Figura N° 5). Mes 1 = enero de 2027 (supuesto).`,
  resultados: `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 a 21).`,
  dolar: `Fuente: elaboración propia (${INF}, Tabla N° 21). Dólar base $965,71.`,
  conclusiones: `Fuente: elaboración propia con base en ${INF} (§3.4 y Figura N° 6).`,
  indice: `Las fuentes de cada tema están al pie de su diapositiva.`,
  'a-hipotesis': `Fuente: elaboración propia (${INF}, Tabla N° 3). Significancia de 5%.`,
  'a-dudas': `Fuentes: Ley N° 19.496; borrador de reglamento MTT (2021); elaboración propia (${INF}, Tabla N° 4).`,
  'a-mix': `Fuente: elaboración propia (${INF}, Tabla N° 8).`,
  'a-red': `Fuente: elaboración propia (${INF}, Tabla N° 7). Montos netos; sin tarifas públicas de redes de talleres en Chile.`,
  'a-mercado': `Fuentes: INE (2025); Centro UC en Emol (2026); Descubre (2026); Fielbaum y Tirachini (2021); Massiani y Gohs (2015).`,
  'a-perfiles': `Fuente: elaboración propia (${INF}, Tabla N° 13).`,
  'a-rentas': `Fuentes: ChileTrabajos (2026); Indeed Chile (2026); MiFuturo (2026); Ley N° 21.830; elaboración propia (Tablas N° 14 y 15).`,
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
  mono(s, [{ text: 'FASE 3 · CAPÍTULO III', options: { color: C.accent1 } }, { text: '  ·  PLAN DE MARKETING, OPERACIONES Y RECURSOS HUMANOS', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  s.addText([
    { text: 'LUMINE MOTORS', options: { breakLine: true } },
    { text: 'tu mismo auto, ahora híbrido.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 36 } },
  ], { placeholder: 'title' });
  // frase explicativa que pide la guía del curso (tipo de solución y necesidad)
  T(s, 'Kit que hibrida autos a combustión de tracción delantera para gastar menos bencina sin cambiar de auto.', { x: M, y: 3.42, w: 3.55, h: 1.5, fontSize: 18, color: C.text1, lineSpacingMultiple: 1.05 });
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

// =====================================================================
// APERTURAS · una por plan, con foto del kit de identidad (sin datos: no compiten con los gráficos)
// =====================================================================
function apertura(n, plan, temas, foto, rotulo) {
  const s = pres.addSlide({ masterName: 'APERTURA', sectionTitle: SEC });
  s.background = { path: A(foto) };
  mono(s, `PLAN ${n} DE 3`, { x: M, y: 1.75, w: 5, h: 0.32, color: C.accent1 });
  const th = plan.split('\n').length * 0.82;
  T(s, plan, { x: M, y: 2.12, w: 8.5, h: th, fontFace: F_TIT, fontSize: 54, valign: 'top', lineSpacingMultiple: 0.88 });
  T(s, 'tres planes, un mismo gatillo.', { x: M, y: 2.12 + th + 0.12, w: 9.2, h: 0.7, fontFace: F_SER, italic: true, fontSize: TX.acento, color: C.accent1 });
  const ly = 2.12 + th + 1.0;
  linea(s, M, ly, 4.6, 0, C.accent1, 1);
  temas.forEach((t, i) => T(s, t, { x: M, y: ly + 0.15 + i * 0.4, w: 4.6, h: 0.34, fontSize: TX.cuerpo, color: C.text2 }));
  mono(s, rotulo, { x: R - 6.0, y: 6.96, w: 5.1, h: 0.26, align: 'right', fontSize: TX.inst });
  return s;
}
D['apertura-mkt'] = () => apertura(1, 'MARKETING', ['Objetivos y segmentación', 'Investigación y estrategia', 'Precio, demanda y presupuesto'], 'apertura-marketing.jpg', 'IMAGEN ILUSTRATIVA');
D['apertura-rrhh'] = () => apertura(2, 'RECURSOS\nHUMANOS', ['Estructura y dotación', 'Lumine Habilita', 'Nómina'], 'apertura-rrhh.jpg', 'OPERACIÓN PROYECTADA · IMAGEN ILUSTRATIVA');
D['apertura-ops'] = () => apertura(3, 'OPERACIONES', ['Flujo y puntos de control', 'Cronograma', 'Resultados y riesgo cambiario'], 'apertura-operaciones.jpg', 'OPERACIÓN PROYECTADA · IMAGEN ILUSTRATIVA');

// CIERRE · logotipo gigante sobre el escenario (motivo de la marca)
D.cierre = () => {
  const s = pres.addSlide({ masterName: 'CIERRE', sectionTitle: SEC });
  T(s, [{ text: 'TRES PLANES, ', options: {} }, { text: 'un mismo gatillo.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 48 } }], { x: M, y: 1.35, w: CW, h: 0.9, fontFace: F_TIT, fontSize: 40 });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: M, y: 2.45, w: 8, h: 0.36, fontSize: 20, color: C.text1 });
  const pw = CW, ph = pw * 96 / 584;
  s.addImage({ path: A('palabra.png'), x: M, y: 7.5 - ph - 0.45, w: pw, h: ph, altText: 'LUMINE' });
  return s;
};

// =====================================================================
// 3.1.1 OBJETIVOS
// =====================================================================
D.objetivos = () => {
  const s = contenido('PLAN DE MARKETING · OBJETIVOS', '299 VEHÍCULOS EL PRIMER AÑO,', 'la referencia al quinto.');
  T(s, [{ text: 'Meta a cinco años: ', options: { bold: true } }, { text: 'ser la referencia de la hibridación de posventa en Chile.', options: { color: C.text2 } }], { x: M, y: Y0, w: CW, h: 0.45, fontSize: TX.cuerpoL });
  const ly = 3.28;
  mono(s, 'METAS DEL PRIMER AÑO', { x: M, y: ly, w: 5, h: 0.4, valign: 'middle', color: C.text1 });
  const n = 4, gap = 0.3, tw = (CW - (n - 1) * gap) / n, ty = 3.78, th = 1.42;
  [['299', 'instalaciones'], ['3', 'casos con ahorro medido'], ['80%', 'clientes satisfechos'], ['15%', 'llega por recomendación']].forEach(([v, k], i) => {
    const x = M + i * (tw + gap);
    if (i === 0) cajaHot(s, x, ty, tw, th); else caja(s, x, ty, tw, th);
    numero(s, v, { x: x + 0.25, y: ty + 0.06, w: tw - 0.5, h: 0.7, fontSize: TX.cifraXL, color: i === 0 ? C.accent1 : C.text1 });
    T(s, k, { x: x + 0.25, y: ty + 0.76, w: tw - 0.4, h: 0.62, fontSize: TX.cuerpo });
  });
  const hy = 5.38;
  mono(s, 'INSTALACIONES PROPIAS POR AÑO', { x: M, y: hy, w: 6, h: 0.4, valign: 'middle', color: C.text1 });
  const lx = M + 0.2, lw = CW - 0.4, ly2 = hy + 0.9, step = lw / 4;
  linea(s, lx, ly2, lw, 0, C.accent5, 1.25);
  [['AÑO 1', '299'], ['AÑO 2', '869'], ['AÑO 3', '1.674'], ['AÑO 4', '2.268'], ['AÑO 5', '2.851']].forEach(([a, v], i) => {
    const cx = lx + i * step, bw = 2.4, bx = Math.min(Math.max(cx - bw / 2, M), R - bw);
    const al = i === 0 ? 'left' : i === 4 ? 'right' : 'center';
    s.addShape(S.ellipse, { x: cx - 0.09, y: ly2 - 0.09, w: 0.18, h: 0.18, fill: { color: i === 0 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.25 } });
    mono(s, a, { x: bx + (i === 0 ? 0.25 : 0), y: ly2 - 0.38, w: bw - (i === 0 || i === 4 ? 0.25 : 0), h: 0.28, align: al, color: C.accent1 });
    numero(s, v, { x: bx, y: ly2 + 0.08, w: bw, h: 0.5, fontSize: TX.cifraS, valign: 'top', align: al });
  });
  return s;
};

// =====================================================================
// 3.1.2 SEGMENTACIÓN
// =====================================================================
D.segmentacion = () => {
  const s = contenido('PLAN DE MARKETING · SEGMENTACIÓN', 'EL CLIENTE SE DEFINE POR SU AUTO,', 'no por su edad.');
  T(s, [{ text: 'Condición: ', options: { bold: true } }, { text: 'auto liviano, a combustión y con tracción delantera.', options: { color: C.text2 } }], { x: M, y: Y0, w: CW, h: 0.45, fontSize: TX.cuerpoL });
  const n = 4, gap = 0.3, cw = (CW - (n - 1) * gap) / n, cy = 3.2, ch = 2.55;
  [['GEOGRÁFICA', '36,8%', 'del parque, en la Región Metropolitana (RM)'], ['DEMOGRÁFICA', '4 roles', 'usa, decide, paga o influye'], ['PSICOGRÁFICA', '5 motivos', 'el ahorro es uno de ellos'], ['CONDUCTUAL', '6 ejes', 'la intensidad de uso es la que manda']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap), hot = i === 3;
    if (hot) cajaHot(s, x, cy, cw, ch); else caja(s, x, cy, cw, ch);
    mono(s, k, { x: x + 0.22, y: cy + 0.18, w: cw - 0.44, h: 0.3, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: x + 0.22, y: cy + 0.52, w: cw - 0.44, h: 0.66, fontSize: TX.cifra, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.22, y: cy + 1.22, w: cw - 0.36, h: 1.25, fontSize: TX.cuerpo, color: hot ? C.text1 : C.text2 });
  });
  const by = 5.96;
  regla(s, by - 0.1, M, CW, C.accent1);
  mono(s, 'PUNTO DE ENTRADA', { x: M, y: by, w: 4, h: 0.3, color: C.accent1 });
  T(s, 'Uso laboral intensivo en la RM: colectivos, taxis y aplicaciones.', { x: M, y: by + 0.34, w: CW, h: 0.5, fontSize: TX.sub, bold: true });
  return s;
};

// =====================================================================
// 3.1.3 INVESTIGACIÓN DE MERCADO · cuatro etapas en una sola línea
// =====================================================================
D.investigacion = () => {
  const s = contenido('PLAN DE MARKETING · INVESTIGACIÓN DE MERCADO', 'SEIS HIPÓTESIS', 'antes de fijar el precio.');
  const n = 4, colW = CW / n, ly = Y0 + 0.12;
  linea(s, M + 0.1, ly, CW - colW + 0.1, 0, C.accent5, 1.5);
  linea(s, M + 0.1, ly, 0.0001, 0, C.accent1, 1.5);
  [['PROFUNDIDAD', '1', 'conductor de aplicaciones', true], ['EXPERTOS', '4', 'expertos del rubro', false], ['CLIENTES', '5', 'perfiles de cliente', false], ['ENCUESTA', '150', 'encuestas por cuotas', false]].forEach(([k, v, u, hecho], i) => {
    const x = M + i * colW;
    s.addShape(S.ellipse, { x: x + 0.01, y: ly - 0.1, w: 0.2, h: 0.2, fill: { color: hecho ? C.accent1 : C.background1 }, line: { color: hecho ? C.accent1 : C.text2, width: 1.5 } });
    mono(s, `ETAPA ${i + 1}`, { x, y: ly + 0.24, w: colW - 0.2, h: 0.28, color: hecho ? C.accent1 : C.text2 });
    T(s, k.charAt(0) + k.slice(1).toLowerCase(), { x, y: ly + 0.44, w: colW - 0.2, h: 0.56, fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 34 : 26, color: hecho ? C.accent1 : C.text1 });
    numero(s, v, { x, y: ly + 1.0, w: colW - 0.2, h: 0.72, fontSize: TX.cifraXL, valign: 'top', color: hecho ? C.accent1 : C.text1 });
    T(s, u, { x, y: ly + 1.7, w: colW - 0.3, h: 0.62, fontSize: TX.cuerpo, color: C.text2 });
    marca(s, hecho ? 'ok' : 'pen', hecho ? 'REALIZADA' : 'POR REALIZAR', x, ly + 2.38);
  });
  const by = 5.74;
  regla(s, by - 0.12, M, CW, C.accent1);
  mono(s, 'LA HIPÓTESIS QUE MÁS DECIDE', { x: M, y: by, w: 6, h: 0.3, color: C.text1 });
  T(s, '«La barrera es la confianza, no el precio.»', { x: M, y: by + 0.32, w: 8.2, h: 0.6, fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 34 : 26, color: C.accent1 });
  T(s, 'Muestra por cuotas: resultados indicativos (±8% con 150 casos).', { x: M + 8.3, y: by + 0.3, w: CW - 8.3, h: 0.66, fontSize: TX.etq, color: C.text2, valign: 'middle' });
  return s;
};

// =====================================================================
// 3.1.4 MATRIZ DE ANSOFF Y VENTAJA COMPETITIVA
// =====================================================================
D.ansoff = () => {
  const s = contenido('PLAN DE MARKETING · MATRIZ DE ANSOFF', 'UN PRODUCTO NUEVO', 'en un mercado que ya existe.');
  // matriz sin cajas: cruz de ejes fina, cuatro cuadrantes y la ruta de crecimiento dibujada en celeste
  const ax = M + 0.55, gx = ax + 0.15, gw = 7.55, qw = gw / 2, hy = Y0 + 0.4, gy = hy + 0.06, qh = 1.86;
  mono(s, 'PRODUCTO EXISTENTE', { x: gx, y: Y0, w: qw, h: 0.32, align: 'center', color: C.text2 });
  mono(s, 'PRODUCTO NUEVO', { x: gx + qw, y: Y0, w: qw, h: 0.32, align: 'center', color: C.text1 });
  [['MERCADO EXISTENTE', gy], ['MERCADO NUEVO', gy + qh]].forEach(([t, y]) => {
    T(s, t, { x: M + 0.27 - qh / 2, y: y + qh / 2 - 0.2, w: qh, h: 0.4, rotate: 270, fontFace: F_MONO, fontSize: TX.etq, color: C.text2, charSpacing: 1, align: 'center', valign: 'middle' });
  });
  // cuadrante de entrada: resplandor localizado, superficie apenas teñida y esquinas de visor
  const ex = gx + qw, ey = gy;
  s.addImage({ path: A('brillo.png'), x: ex - 1.0, y: ey - 0.8, w: qw + 2.0, h: qh + 1.6, altText: '' });
  s.addShape(S.rect, { x: ex, y: ey, w: qw, h: qh, fill: { color: HOT, transparency: 15 }, line: { type: 'none' } });
  visor(s, ex + 0.06, ey + 0.06, qw - 0.12, qh - 0.12);
  // diversificación adelantada: borde punteado
  s.addShape(S.rect, { x: gx + qw + 0.06, y: gy + qh + 0.06, w: qw - 0.12, h: qh - 0.12, fill: { color: C.background1, transparency: 100 }, line: { color: C.accent1, width: 1, dashType: 'dash' } });
  // ejes
  linea(s, gx, gy + qh, gw, 0, C.accent5, 1);
  linea(s, gx + qw, gy, 0, 2 * qh, C.accent5, 1);
  linea(s, gx, gy, 0, 2 * qh, C.accent5, 0.75);
  linea(s, gx, gy + 2 * qh, gw, 0, C.accent5, 0.75);
  const Q = [
    [1, 0, '1', 'AÑO 1 · ENTRADA', 'Desarrollo de producto', 'Sin oferta en Chile', true],
    [0, 0, '2', 'AÑO 2', 'Penetración', 'Más clientes, mismo mercado'],
    [1, 1, '2', 'DESDE EL AÑO 2', 'Diversificación', 'Calibración y kits para talleres', true],
    [0, 1, '3', 'AÑO 3', 'Desarrollo de mercado', 'Flotas y regiones'],
  ];
  // los nodos rodean la cruz de ejes (izquierda: junto al eje; derecha: al inicio) para que la ruta no cruce texto
  const nodo = (c, r) => [gx + c * qw + (c ? 0.62 : qw - 0.62), gy + r * qh + 0.62];
  Q.forEach(([c, r, n, a, t, d, on]) => {
    const x = gx + c * qw, y = gy + r * qh, [nx, ny] = nodo(c, r);
    s.addShape(S.ellipse, { x: nx - 0.27, y: ny - 0.27, w: 0.54, h: 0.54, fill: { color: on ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.5 } });
    T(s, n, { x: nx - 0.27, y: ny - 0.27, w: 0.54, h: 0.54, align: 'center', valign: 'middle', fontFace: F_CON, bold: true, fontSize: 22, color: on ? C.background1 : C.accent1 });
    const tx = c ? x + 1.05 : x + 0.3, tw = qw - 1.35, dos = t.length > 16;
    mono(s, a, { x: tx, y: y + 0.2, w: tw + 0.1, h: 0.3, color: C.accent1 });
    T(s, t, { x: tx, y: y + 0.5, w: tw, h: dos ? 0.74 : 0.38, fontSize: TX.cuerpoL, bold: true, lineSpacingMultiple: 0.92 });
    T(s, d, { x: tx, y: y + (dos ? 1.24 : 0.92), w: tw, h: 0.6, fontSize: 18, color: on ? C.text1 : C.text2, lineSpacingMultiple: 0.95 });
  });
  // ruta: 1 → 2 (penetración) → 3 (desarrollo de mercado); 1 ⇢ 2 (diversificación, adelantada)
  const [x1, y1] = nodo(1, 0), [x2, y2] = nodo(0, 0), [x3, y3] = nodo(0, 1), [x4, y4] = nodo(1, 1);
  flecha(s, x1 - 0.32, y1, -(x1 - x2 - 0.66), 0, C.accent1, 1.75);
  flecha(s, x2, y2 + 0.32, 0, y3 - y2 - 0.66, C.accent1, 1.75);
  flecha(s, x1, y1 + 0.32, 0, y4 - y1 - 0.66, C.accent1, 1.75, 'dash');
  // ventaja competitiva sostenible (observación del profesor guía), con la unidad de control donde vive la calibración
  const cx = gx + gw + 0.45, cw = R - cx;
  foto(s, 'ansoff-unidad.jpg', cx, Y0, cw, 0.95, 'Unidad de control del kit (imagen ilustrativa)');
  mono(s, 'IMAGEN ILUSTRATIVA', { x: cx + 0.12, y: Y0 + 0.95 - 0.3, w: cw - 0.24, h: 0.24, fontSize: 10, color: C.text2 });
  mono(s, 'VENTAJA COMPETITIVA\nSOSTENIBLE', { x: cx, y: Y0 + 1.1, w: cw, h: 0.58, color: C.accent1 });
  T(s, 'La biblioteca de calibraciones', { x: cx, y: Y0 + 1.72, w: cw, h: 0.84, fontSize: 26, bold: true, lineSpacingMultiple: 0.92 });
  T(s, 'Crece con cada instalación y es lo más difícil de copiar.', { x: cx, y: Y0 + 2.6, w: cw, h: 0.62, fontSize: 18, color: C.text2 });
  linea(s, cx, Y0 + 3.3, cw, 0, C.accent1, 1);
  T(s, 'Por eso la red parte en el año 2: se vende mientras es exclusiva.', { x: cx, y: Y0 + 3.38, w: cw, h: 0.82, fontSize: 18, color: C.text1 });
  return s;
};

// =====================================================================
// 3.1.5 POSICIONAMIENTO
// =====================================================================
D.posicionamiento = () => {
  const s = contenido('PLAN DE MARKETING · POSICIONAMIENTO', 'EL ESPACIO VACÍO:', 'ahorrar sin cambiar de auto.');
  const px = 3.45, pw = R - px, rows = [[3.12, 1.38], [4.5, 0.86], [5.36, 1.06]];
  const lo = Math.log10(0.5), hi = Math.log10(26), x0 = px + 1.1, xw = pw - 1.25;
  const X = v => v === 0 ? px + 0.5 : x0 + (Math.log10(v) - lo) / (hi - lo) * xw;
  [['Conserva su auto', 'sin límite de edad'], ['Conserva su auto', 'con límite de edad'], ['Cambia de auto', '']].forEach(([a, b], i) => {
    const [y, h] = rows[i];
    s.addShape(S.rect, { x: px, y, w: pw, h, fill: { color: i === 0 ? HOT : C.background2 }, line: { color: C.background1, width: 2 } });
    T(s, b ? [{ text: a, options: { breakLine: true, bold: true } }, { text: b, options: { color: C.text2 } }] : [{ text: a, options: { bold: true } }], { x: M, y, w: px - M - 0.2, h, align: 'right', valign: 'middle', fontSize: TX.cuerpo });
  });
  marca(s, 'est', 'ESTIMACIÓN · LUMINE: PRECIO DE REFERENCIA Y AHORRO SIMULADO', R, Y0, { alignRight: true });
  const ay = 6.44;
  linea(s, px, ay, pw, 0, C.text2, 0.75);
  [[0, '$0'], [1, '$1 M'], [5, '$5 M'], [10, '$10 M'], [20, '$20 M']].forEach(([v, l]) => {
    linea(s, X(v), ay, 0, 0.06, C.text2, 0.75);
    mono(s, l, { x: X(v) - 0.6, y: ay + 0.07, w: 1.2, h: 0.3, align: 'center' });
  });
  const r1 = rows[0];
  s.addShape(S.rect, { x: X(0.62), y: r1[0] + 0.12, w: X(7.2) - X(0.62), h: r1[1] - 0.24, fill: { color: HOT, transparency: 100 }, line: { color: C.accent1, width: 1, dashType: 'sysDot' } });
  T(s, 'Espacio hoy sin oferta', { x: X(0.62) + 0.18, y: r1[0] + r1[1] - 0.62, w: 4.2, h: 0.4, fontSize: TX.cuerpo, color: C.accent1, bold: true });
  s.addShape(S.ellipse, { x: X(0) - 0.1, y: r1[0] + 0.24, w: 0.2, h: 0.2, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, 'No hacer nada', { x: X(0) - 0.5, y: r1[0] + 0.5, w: 1.0, h: 0.8, fontSize: TX.etq, align: 'center', bold: true });
  const lyL = r1[0] + 0.42;
  s.addShape(S.rect, { x: X(4.29), y: lyL - 0.06, w: X(4.99) - X(4.29), h: 0.12, fill: { color: C.accent1 }, line: { type: 'none' } });
  [4.29, 4.99].forEach(v => s.addShape(S.ellipse, { x: X(v) - 0.12, y: lyL - 0.12, w: 0.24, h: 0.24, fill: { color: C.accent1 }, line: { type: 'none' } }));
  const bx = X(8.2), bw = R - bx - 0.15;
  cajaHot(s, bx, r1[0] + 0.16, bw, r1[1] - 0.32);
  T(s, 'LUMINE', { x: bx + 0.1, y: r1[0] + 0.24, w: bw - 0.2, h: 0.42, fontSize: TX.cuerpoL, bold: true, align: 'center' });
  numero(s, '$4,3–5,0 M', { x: bx + 0.1, y: r1[0] + 0.66, w: bw - 0.2, h: 0.5, fontSize: TX.cifraS, color: C.accent1, align: 'center', valign: 'top' });
  const r2 = rows[1];
  s.addShape(S.rect, { x: X(0.9), y: r2[0] + r2[1] - 0.26, w: X(1.8) - X(0.9), h: 0.12, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'Gas  ', options: { bold: true } }, { text: '$0,9–1,8 M · solo autos de hasta 7 años', options: { color: C.text2 } }], { x: X(0.9) - 0.1, y: r2[0] + 0.08, w: 7.2, h: 0.4, fontSize: TX.cuerpo });
  const r3 = rows[2];
  [['Híbrido usado', '$9,5–13 M', 9.5, 13], ['Eléctrico nuevo', 'desde $14 M', 13.99, 26]].forEach(([t, d, a, b], i) => {
    const y = r3[0] + 0.1 + i * 0.47;
    s.addShape(S.rect, { x: X(a), y: y + 0.15, w: X(b) - X(a), h: 0.12, fill: { color: C.text2 }, line: { type: 'none' } });
    s.addShape(S.ellipse, { x: X(a) - 0.09, y: y + 0.12, w: 0.18, h: 0.18, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, [{ text: t + '  ', options: { bold: true } }, { text: d, options: { color: C.text2 } }], { x: X(a) - 5.0, y: y - 0.02, w: 4.82, h: 0.42, fontSize: TX.cuerpo, align: 'right', valign: 'middle' });
  });
  return s;
};

// =====================================================================
// 3.1.6 MIX: PRODUCTO Y PRECIO · Esencial, Plus y recuperación de la inversión
// =====================================================================
D.precio = () => {
  const s = contenido('PLAN DE MARKETING · MIX: PRODUCTO Y PRECIO', 'PLUS CUESTA 16% MÁS', 'y ahorra 24% más.');
  // dos fichas de versión: Esencial en grafito, Plus con el acento (resplandor, borde superior y visor)
  const cw = 3.72, gap = 0.36, ch = 4.08;
  [['ESENCIAL', '$4.290.000', '15%', '$117.069', false], ['PLUS', '$4.990.000', '20%', '$145.327', true]].forEach(([k, p, prom, ah, hot], i) => {
    const x = M + i * (cw + gap), y = Y0, px = x + 0.3, pw = cw - 0.6;
    if (hot) s.addImage({ path: A('brillo.png'), x: x - 0.9, y: y - 0.6, w: cw + 1.8, h: ch + 1.2, altText: '' });
    s.addShape(S.rect, { x, y, w: cw, h: ch, fill: { color: hot ? HOT : C.background2 }, line: { color: hot ? C.accent1 : C.accent5, width: hot ? 1 : 0.75 } });
    s.addShape(S.rect, { x, y, w: cw, h: 0.06, fill: { color: hot ? C.accent1 : C.text2 }, line: { type: 'none' } });
    if (hot) visor(s, x, y, cw, ch);
    mono(s, k, { x: px, y: y + 0.26, w: pw, h: 0.3, fontSize: 18, color: hot ? C.accent1 : C.text1 });
    numero(s, p, { x: px, y: y + 0.6, w: pw + 0.2, h: 0.78, fontSize: 48, valign: 'top', color: hot ? C.accent1 : C.text1 });
    marca(s, 'sup', 'REFERENCIA · CON IVA', px, y + 1.42);
    regla(s, y + 2.0, px, pw, C.accent5);
    // dos cifras distintas: el máximo simulado en ciudad y el ahorro mensual estimado de un colectivo
    mono(s, 'AHORRO MÁXIMO EN CIUDAD', { x: px, y: y + 2.14, w: pw, h: 0.28, fontSize: 14 });
    T(s, [{ text: 'hasta ', options: { fontFace: F_BODY, bold: false, fontSize: 20, color: C.text2 } }, { text: prom }], { x: px, y: y + 2.4, w: pw, h: 0.62, fontFace: F_CON, bold: true, fontSize: 40, valign: 'bottom', color: C.text1 });
    mono(s, 'AHORRO DE UN COLECTIVO', { x: px, y: y + 3.14, w: pw, h: 0.28, fontSize: 14 });
    T(s, [{ text: ah }, { text: ' al mes', options: { fontFace: F_BODY, bold: false, fontSize: 20, color: C.text2 } }], { x: px, y: y + 3.4, w: pw, h: 0.56, fontFace: F_CON, bold: true, fontSize: 36, valign: 'bottom', color: hot ? C.accent1 : C.text1 });
  });
  // recuperación de la inversión: gráfico editable, Plus en celeste y Esencial en gris
  const gx = M + 2 * cw + gap + 0.5, gw = R - gx;
  mono(s, 'MESES PARA RECUPERAR LA INVERSIÓN', { x: gx, y: Y0, w: gw, h: 0.6, color: C.text1 });
  leyenda(s, [[HEX.dk2, 'Esencial'], [HEX.accent1, 'Plus']], gx, Y0 + 0.64);
  s.addChart(pres.ChartType.bar, [
    { name: 'Esencial', labels: ['Colectivo', 'Aplicación'], values: [36.6, 28.9] },
    { name: 'Plus', labels: ['Colectivo', 'Aplicación'], values: [34.3, 27.5] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: Y0 + 1.02, w: gw + 0.1, h: 1.7, barDir: 'col', barGapWidthPct: 55, barOverlapPct: -8,
    chartColors: [HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 44,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 20,
    objectName: 'Meses para recuperar la inversión por versión',
  }));
  marca(s, 'est', 'ESTIMACIÓN · SIMULADO', gx, Y0 + 2.8);
  linea(s, gx, Y0 + 3.3, gw, 0, C.accent1, 1);
  T(s, [{ text: 'Plus cuesta $700.000 más, ', options: { bold: true } }, { text: 'pero cada punto de ahorro sale más barato.', options: { color: C.text2 } }], { x: gx, y: Y0 + 3.38, w: gw, h: 0.82, fontSize: 18 });
  return s;
};

// =====================================================================
// 3.1.7 DEMANDA Y PRONÓSTICO · series con etiquetas legibles
// =====================================================================
D.demanda = () => {
  const s = contenido('PLAN DE MARKETING · DEMANDA Y PRONÓSTICO DE VENTAS', 'MÁS DEMANDA QUE CAPACIDAD', 'desde el año 1.');
  const kw = (CW - 0.4) / 2;
  [['SEGMENTO LABORAL · RM', '162.780', 'vehículos de colectivos, taxis y aplicaciones'], ['ADOPCIÓN AL AÑO 5', '11,1%', 'del segmento: bajo el 16% de los primeros adoptantes']].forEach(([k, v, d], i) => {
    const x = M + i * (kw + 0.4);
    mono(s, k, { x, y: Y0, w: kw, h: 0.3, color: C.accent1 });
    numero(s, v, { x, y: Y0 + 0.32, w: 2.3, h: 0.66, fontSize: TX.cifra, valign: 'top' });
    T(s, d, { x: x + 2.35, y: Y0 + 0.36, w: kw - 2.35, h: 0.66, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
  });
  marca(s, 'est', 'ESTIMACIÓN', R, Y0 - 0.06, { alignRight: true });
  const hy = 3.85;
  regla(s, hy - 0.12, M, CW);
  mono(s, 'VEHÍCULOS POR AÑO', { x: M, y: hy, w: 3.2, h: 0.38, valign: 'middle', color: C.text1 });
  leyenda(s, [[HEX.accent5, 'Demanda atendible'], [HEX.accent1, 'Instalaciones propias'], [HONDO, 'Kits a la red']], M + 2.95, hy);
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
    { name: 'Kits a la red', labels: AÑOS, values: [0, 365, 1074, 3287, 7773] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: hy + 0.42, w: CW + 0.2, h: 2.18, barDir: 'col', barGapWidthPct: 45, barOverlapPct: 0,
    chartColors: [HEX.accent5, HEX.accent1, HONDO], valAxisMinVal: 0, valAxisMaxVal: 8900,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 17,
    objectName: 'Pronóstico de ventas por año',
  }));
  T(s, [{ text: 'El límite es físico: ', options: { bold: true } }, { text: 'técnicos y espacio. Lo demás lo atiende la red.', options: { color: C.text2 } }], { x: M, y: 6.48, w: CW, h: 0.4, fontSize: TX.cuerpo });
  return s;
};

// =====================================================================
// 3.1.8 PRESUPUESTO DE MARKETING
// =====================================================================
D['presupuesto-mkt'] = () => {
  const s = contenido('PLAN DE MARKETING · PRESUPUESTO', '$80,9 MILLONES EL PRIMER AÑO:', 'el 6,8% de los ingresos.');
  const lw = 8.15;
  mono(s, 'MILLONES DE PESOS NETOS POR AÑO', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  leyenda(s, [[HEX.accent1, 'Clientes piloto'], [HONDO, 'Pauta digital'], [HEX.dk2, 'Comisiones'], [HEX.accent5, 'Otras']], M, Y0 + 0.38, { sep: 0.32 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Clientes piloto', labels: AÑOS, values: [49.47, 23.75, 23.75, 23.75, 23.75] },
    { name: 'Pauta digital', labels: AÑOS, values: [14.40, 18.00, 24.00, 24.00, 30.00] },
    { name: 'Comisiones', labels: AÑOS, values: [4.92, 15.58, 30.30, 42.45, 56.98] },
    { name: 'Otras', labels: AÑOS, values: [12.15, 22.65, 38.22, 44.14, 52.96] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.8, w: lw + 0.1, h: YF - Y0 - 0.8, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 35,
    chartColors: [HEX.accent1, HONDO, HEX.dk2, HEX.accent5], valAxisMinVal: 0, valAxisMaxVal: 168,
    showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<13]"";0', dataLabelFontSize: 18, dataLabelColor: HEX.lt1,
    objectName: 'Presupuesto de marketing por partida',
  }));
  const cx = M + lw + 0.42, cw = R - cx, ch = YF - Y0;
  cajaHot(s, cx, Y0, cw, ch);
  mono(s, 'EN CINCO AÑOS', { x: cx + 0.25, y: Y0 + 0.22, w: cw - 0.5, h: 0.3, color: C.accent1 });
  numero(s, '$575 M', { x: cx + 0.25, y: Y0 + 0.56, w: cw - 0.5, h: 0.8, fontSize: TX.cifraXL, valign: 'top', color: C.accent1 });
  regla(s, Y0 + 1.5, cx + 0.25, cw - 0.5);
  mono(s, '% DE LOS INGRESOS PROPIOS', { x: cx + 0.25, y: Y0 + 1.64, w: cw - 0.4, h: 0.6 });
  [['Año 1', '6,8%'], ['Año 2', '2,3%'], ['Año 5', '1,5%']].forEach(([a, p], i) => {
    const y = Y0 + 2.32 + i * 0.6;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent6);
    T(s, a, { x: cx + 0.25, y, w: 1.6, h: 0.6, valign: 'middle', fontSize: TX.cuerpoL });
    numero(s, p, { x: cx + 1.6, y, w: cw - 1.85, h: 0.6, fontSize: TX.cifraS + 2, align: 'right', valign: 'middle', color: i === 0 ? C.accent1 : C.text1 });
  });
  return s;
};

// =====================================================================
// 3.2.1 ESTRUCTURA (organigrama) · la dotación va en la diapositiva siguiente
// =====================================================================
D.estructura = () => {
  const s = contenido('RECURSOS HUMANOS · ESTRUCTURA', 'CRECE EL NÚMERO DE PERSONAS,', 'no la estructura.');
  // leyenda de las cifras de cada caja: personas al abrir y al año 5
  mono(s, 'ORGANIGRAMA · PERSONAS AL ABRIR Y AL AÑO 5', { x: M, y: Y0, w: 7, h: 0.32, color: C.text1 });
  const n = 5, gap = 0.2, bw = (CW - (n - 1) * gap) / n, bh = 1.45;
  const gw = 3.8, gx = M + (CW - gw) / 2, gy = Y0 + 0.44, gh = 0.66;
  cajaHot(s, gx, gy, gw, gh);
  T(s, 'Gerencia General', { x: gx, y: gy, w: gw, h: gh, align: 'center', valign: 'middle', fontSize: TX.cuerpoL, bold: true });
  const ry = gy + gh + 0.44, busY = gy + gh + 0.22;
  linea(s, gx + gw / 2, gy + gh, 0, busY - gy - gh, C.text2, 1);
  linea(s, M + bw / 2, busY, CW - bw, 0, C.text2, 1);
  [['Responsable Técnico', '1', '3'], ['Calibración', '1', '4'], ['Comercial y Postventa', '1', '4'], ['Comercial de Empresas', '0', '2'], ['Administración', '1', '1']].forEach(([t, a, b], i) => {
    const x = M + i * (bw + gap), fut = i === 3;
    linea(s, x + bw / 2, busY, 0, ry - busY, C.text2, 1);
    if (fut) cajaFutura(s, x, ry, bw, bh); else caja(s, x, ry, bw, bh);
    T(s, t, { x: x + 0.1, y: ry + 0.08, w: bw - 0.2, h: 0.7, align: 'center', valign: 'middle', fontSize: TX.cuerpo, bold: true });
    if (a === b) numero(s, a, { x, y: ry + 0.82, w: bw, h: 0.52, align: 'center', valign: 'middle', fontSize: TX.cifraS, color: C.accent1 });
    else transicion(s, a, b, x + bw / 2, ry + 0.82, 0.52, { wa: 0.8, color: fut ? C.text1 : C.accent1, colorA: C.text2 });
  });
  const sy = ry + bh + 0.26, sh = 0.68, sw = 2 * bw + gap;
  linea(s, M + bw / 2, ry + bh, 0, sy - ry - bh, C.text2, 1);
  caja(s, M, sy, sw, sh);
  T(s, 'Técnicos', { x: M + 0.2, y: sy, w: 2.0, h: sh, valign: 'middle', fontSize: TX.cuerpoL, bold: true });
  transicion(s, '2', '36', M + sw - 1.25, sy + 0.06, sh - 0.12, { wa: 0.9, size: TX.cifraM, color: C.accent1 });
  cajaFutura(s, M + sw + 0.4, sy + 0.16, 0.6, 0.4);
  T(s, 'Punteado: se suma después de abrir.', { x: M + sw + 1.15, y: sy, w: CW - sw - 1.15, h: sh, valign: 'middle', fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// 3.2.1 DOTACIÓN · evolución de personas al cierre de cada año
D.dotacion = () => {
  const s = contenido('RECURSOS HUMANOS · DOTACIÓN', 'DE 13 A 56 PERSONAS EN CINCO AÑOS;', 'casi dos de cada tres son técnicos.');
  const lw = 8.1;
  mono(s, 'PERSONAS AL CIERRE DE CADA AÑO', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Dotación', labels: ['Pre', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], values: [5, 13, 21, 33, 40, 56] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.4, w: lw + 0.1, h: YF - Y0 - 0.4, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 64,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 26,
    objectName: 'Dotación al cierre de cada año',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  foto(s, 'dotacion-equipo.jpg', cx, Y0, cw, 1.15, 'Equipo de técnicos de Lumine (operación proyectada)');
  const by = Y0 + 1.32;
  cajaHot(s, cx, by, cw, 1.75);
  mono(s, 'TÉCNICOS AL AÑO 5', { x: cx + 0.25, y: by + 0.18, w: cw - 0.5, h: 0.3, color: C.accent1 });
  T(s, [{ text: '36', options: { fontFace: F_CON, bold: true, fontSize: TX.cifraXL, color: C.accent1 } }, { text: '  de 56', options: { fontFace: F_CON, bold: true, fontSize: TX.cifraS, color: C.text1 } }], { x: cx + 0.25, y: by + 0.46, w: cw - 0.5, h: 0.78, valign: 'bottom' });
  T(s, 'personas del equipo', { x: cx + 0.25, y: by + 1.24, w: cw - 0.5, h: 0.4, fontSize: TX.cuerpo, color: C.text2 });
  T(s, 'Nadie se contrata antes de que la carga lo justifique.', { x: cx, y: by + 1.9, w: cw, h: 0.98, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// =====================================================================
// 3.2.3 LUMINE HABILITA · niveles N1 a N4 (el presupuesto va en la diapositiva siguiente)
// =====================================================================
D.habilita = () => {
  const s = contenido('RECURSOS HUMANOS · POLÍTICA', 'TÉCNICOS FORMADOS EN CASA', 'con Lumine Habilita.');
  const lw = 8.55;
  mono(s, 'LUMINE HABILITA · RENTA BRUTA MENSUAL POR NIVEL', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  const gap = 0.16, sw = (lw - 3 * gap) / 4, base = YF - 0.62;
  [['N1', 'Aprende', '$750 mil'], ['N2', 'Instala', '$850 mil'], ['N3', 'Autónomo', '$1,0 M'], ['N4', 'Forma', '$1,15 M']].forEach(([k, d, r], i) => {
    const x = M + i * (sw + gap), h = 1.75 + i * 0.5, y = base - h, hot = i === 3;
    if (hot) cajaHot(s, x, y, sw, h); else caja(s, x, y, sw, h);
    tag(s, k, x + 0.18, y + 0.2, { off: i < 2, w: 0.72, h: 0.46, size: 20 });
    T(s, d, { x: x + 0.18, y: y + 0.78, w: sw - 0.3, h: 0.45, fontSize: TX.sub, bold: true });
    numero(s, r, { x: x + 0.18, y: y + h - 0.7, w: sw - 0.3, h: 0.58, fontSize: TX.cifraS + 2, valign: 'bottom', color: hot ? C.accent1 : C.text1 });
  });
  T(s, 'Del N1 al N4 en unos ocho meses, con bono por nivel.', { x: M, y: base + 0.14, w: lw, h: 0.45, fontSize: TX.cuerpoL, color: C.text1 });
  const cx = M + lw + 0.45, cw = R - cx;
  [['39', 'competencias'], ['4', 'niveles'], ['392', 'horas de formación']].forEach(([v, k], i) => {
    const y = Y0 + 0.42 + i * 1.26;
    regla(s, y, cx, cw, i === 0 ? C.accent1 : C.accent5);
    numero(s, v, { x: cx, y: y + 0.08, w: cw, h: 0.72, fontSize: TX.cifraXL, valign: 'top', color: C.text1 });
    T(s, k, { x: cx, y: y + 0.78, w: cw, h: 0.4, fontSize: TX.cuerpo, color: C.text2 });
  });
  return s;
};

// 3.2.4 PRESUPUESTO DE RECURSOS HUMANOS · nómina por instalación
D.nomina = () => {
  const s = contenido('RECURSOS HUMANOS · PRESUPUESTO', 'NÓMINA POR INSTALACIÓN:', 'costo a la mitad.');
  const lw = 8.15;
  mono(s, 'NÓMINA POR INSTALACIÓN · MILES DE $', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Costo por instalación', labels: AÑOS, values: [508, 306, 257, 253, 265] }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.4, w: lw + 0.1, h: YF - Y0 - 0.95, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 580,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 26,
    objectName: 'Costo de nómina por instalación propia',
  }));
  marca(s, 'sup', 'SUPUESTO · SIN REAJUSTES', M, YF - 0.42);
  const cx = M + lw + 0.42, cw = R - cx;
  cajaHot(s, cx, Y0, cw, 2.5);
  mono(s, 'NÓMINA TOTAL\nMILLONES DE $', { x: cx + 0.25, y: Y0 + 0.2, w: cw - 0.4, h: 0.6, color: C.accent1 });
  transicion(s, '152', '755', cx + cw / 2, Y0 + 0.92, 0.8, { wa: 1.4, size: TX.cifra, color: C.accent1 });
  T(s, 'del año 1 al año 5', { x: cx + 0.25, y: Y0 + 1.84, w: cw - 0.5, h: 0.4, fontSize: TX.cuerpo, color: C.text2, align: 'center' });
  T(s, 'Los cargos fijos se reparten en más autos.', { x: cx, y: Y0 + 2.8, w: cw, h: 1.0, fontSize: TX.cuerpoL, bold: true });
  return s;
};

// =====================================================================
// 3.3.1 FLUJO OPERACIONAL · el proceso (los controles van en la diapositiva siguiente)
// =====================================================================
D.flujo = () => {
  const s = contenido('OPERACIONES · FLUJO OPERACIONAL', 'EL NEGOCIO MIDE Y RECOMIENDA;', 'el cliente decide.');
  const et = [
    ['CAPTACIÓN', 'Cotiza en la web', 'El estimador da ahorro y plazo.'],
    ['ASESORÍA', 'El cliente decide', 'Puede medir una semana antes.'],
    ['TALLER', 'Una jornada', '8,4 horas y cuatro controles.'],
    ['CERTIFICACIÓN', 'Sale certificado', 'Firma del Responsable Técnico.'],
    ['POSTVENTA', 'Ahorro medido', 'Informe a los tres meses.'],
  ];
  const rh = 0.8, c1 = M + 0.95, c2 = M + 3.85, c3 = M + 6.95, fw = 1.3, fh = 0.66;
  const alt = ['Cotización en la web', 'Diagnóstico con telemetría', 'Dúo de técnicos instalando el kit', 'Entrega del auto certificado', 'Centro de control que mide el ahorro'];
  linea(s, M + 0.31, Y0 + rh / 2, 0, rh * (et.length - 1), C.accent5, 1.5);
  et.forEach(([e, t, d], i) => {
    const y = Y0 + i * rh, hot = i === 2;
    if (hot) { s.addShape(S.rect, { x: M - 0.1, y: y + 0.04, w: CW + 0.2, h: rh - 0.08, fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } }); visor(s, M - 0.1, y + 0.04, CW + 0.2, rh - 0.08); }
    else if (i) regla(s, y, c1, R - c1, C.accent5);
    tag(s, '0' + (i + 1), M, y + (rh - 0.42) / 2, { w: 0.62, h: 0.42, size: TX.etq, off: !hot });
    mono(s, e, { x: c1, y, w: c2 - c1 - 0.2, h: rh, valign: 'middle', color: hot ? C.accent1 : C.text2 });
    T(s, t, { x: c2, y, w: c3 - c2 - 0.2, h: rh, valign: 'middle', fontSize: TX.sub, bold: true, color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: c3, y, w: R - fw - 0.25 - c3, h: rh, valign: 'middle', fontSize: TX.cuerpo, color: hot ? C.text1 : C.text2 });
    foto(s, `flujo-${i + 1}.jpg`, R - fw, y + (rh - fh) / 2, fw, fh, alt[i], hot ? C.accent1 : C.accent5);
  });
  return s;
};

// 3.3.1 PUNTOS DE CONTROL · la jornada de instalación y la capacidad
D.controles = () => {
  const s = contenido('OPERACIONES · PUNTOS DE CONTROL', 'UNA JORNADA DE 8,4 HORAS,', 'cuatro controles.');
  numero(s, '8,4 h', { x: M, y: Y0, w: 2.6, h: 0.86, fontSize: TX.cifraXL, valign: 'middle', color: C.accent1 });
  T(s, [{ text: 'Un vehículo por jornada', options: { bold: true, breakLine: true } }, { text: 'Dúo con un técnico de nivel 3.', options: { color: C.text2 } }], { x: M + 2.6, y: Y0, w: 5.2, h: 0.86, fontSize: TX.cuerpoL, valign: 'middle' });
  foto(s, 'controles-banco.jpg', R - 3.6, Y0 - 0.06, 3.6, 1.0, 'Auto con el kit en el banco de pruebas');
  const py = 3.86;
  marca(s, 'est', 'ESTIMACIÓN · TIEMPOS', R, py - 0.05, { alignRight: true });
  regla(s, py - 0.14, M, CW, C.accent1);
  mono(s, 'CUATRO CONTROLES · SI FALLA, SE DETIENE', { x: M, y: py, w: CW, h: 0.3, color: C.accent1 });
  const n = 4, gap = 0.22, pw = (CW - (n - 1) * gap) / n, by = py + 0.44, bh = 1.15;
  ['¿Vehículo apto?', '¿Masa y ejes?', '¿Aislación?', '¿Dinamómetro?'].forEach((q, i) => {
    const x = M + i * (pw + gap);
    caja(s, x, by, pw, bh);
    tag(s, '0' + (i + 1), x + 0.2, by + 0.2, { w: 0.6, h: 0.38, size: TX.etq });
    T(s, q, { x: x + 0.2, y: by + 0.64, w: pw - 0.3, h: 0.42, fontSize: TX.cuerpoL, bold: true });
    if (i < n - 1) flecha(s, x + pw + 0.03, by + bh / 2, gap - 0.06, 0, C.accent1, 1.5);
  });
  const cy = by + bh + 0.3;
  T(s, 'El límite de capacidad son las horas de los dúos.', { x: M, y: cy, w: CW, h: 0.45, fontSize: TX.sub, bold: true });
  T(s, 'Un dinamómetro por local basta, incluso con seis dúos.', { x: M, y: cy + 0.48, w: CW, h: 0.4, fontSize: TX.cuerpo, color: C.text2 });
  return s;
};

// =====================================================================
// 3.3.2 CRONOGRAMA EJECUTIVO (la Carta Gantt completa va en el anexo A11)
// =====================================================================
D.gantt = () => {
  const s = contenido('OPERACIONES · CRONOGRAMA DE IMPLEMENTACIÓN', 'ABRIR EN ENERO DE 2027', 'depende de un reglamento.');
  const x0 = M + 3.05, xw = R - x0, w26 = 1.45, w1 = 2.4, wy = (xw - w26 - w1) / 4;
  const P = m => m <= 1 ? x0 + (m + 3) / 4 * w26 : m <= 13 ? x0 + w26 + (m - 1) / 12 * w1 : x0 + w26 + w1 + (m - 13) / 12 * wy;
  const top = Y0 + 0.46, rh = 0.62;
  const filas = ['Permisos, homologación y primer dúo', 'Reglamento Ley 21.793', 'Talleres propios', 'Dúos del taller 1', 'Red de talleres'];
  const bottom = top + filas.length * rh;
  [['2026', -3, 1], ['AÑO 1 · 2027', 1, 13], ['AÑO 2', 13, 25], ['AÑO 3', 25, 37], ['AÑO 4', 37, 49], ['AÑO 5', 49, 61]].forEach(([t, a, b], i) => {
    mono(s, t, { x: P(a), y: Y0, w: P(b) - P(a), h: 0.34, align: 'center', valign: 'middle', color: i === 1 ? C.accent1 : C.text1 });
    if (i > 0) linea(s, P(a), top - 0.08, 0, bottom - top + 0.16, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  filas.forEach((nom, fi) => {
    const y = top + fi * rh;
    if (fi) regla(s, y, M, CW, C.accent6);
    T(s, nom, { x: M, y, w: x0 - M - 0.2, h: rh, align: 'right', valign: 'middle', fontSize: TX.etq + 2, bold: fi === 1, color: fi === 1 ? C.accent3 : C.text1 });
  });
  const fila = i => top + i * rh, mid = i => fila(i) + rh / 2;
  const barra = (i, a, b, color, txt, tc) => {
    s.addShape(S.rect, { x: P(a), y: fila(i) + 0.1, w: P(b) - P(a), h: rh - 0.2, fill: { color }, line: { type: 'none' } });
    if (txt) T(s, txt, { x: P(a), y: fila(i), w: P(b) - P(a), h: rh, align: 'center', valign: 'middle', fontSize: TX.etq, bold: true, color: tc || C.background1 });
  };
  const rombo = (i, m, txt) => {
    s.addShape(S.diamond, { x: P(m) - 0.15, y: mid(i) - 0.15, w: 0.3, h: 0.3, fill: { color: C.accent1 }, line: { color: C.background1, width: 0.5 } });
    if (txt) T(s, txt, { x: P(m) + 0.2, y: fila(i), w: 1.3, h: rh, valign: 'middle', fontSize: TX.etq + 2, bold: true });
  };
  barra(0, -3, 1, C.accent1);
  s.addShape(S.star5, { x: P(0) - 0.2, y: mid(1) - 0.2, w: 0.4, h: 0.4, fill: { color: C.accent3 }, line: { type: 'none' } });
  T(s, 'debe estar vigente antes de vender', { x: P(0) + 0.32, y: fila(1), w: 6.0, h: rh, valign: 'middle', fontSize: TX.cuerpo, bold: true, color: C.accent3 });
  rombo(2, 1, 'Taller 1'); rombo(2, 25, 'Taller 2'); rombo(2, 49, 'Taller 3');
  barra(3, 1, 20, '1D4F66', 'del dúo 1 al 6 · meses 1 a 20', C.text1);
  barra(4, 13, 61, C.accent1);
  [[25, '3'], [37, '9'], [49, '20'], [61, '42']].forEach(([m, t]) => T(s, t, { x: P(m) - 0.75, y: fila(4), w: 0.62, h: rh, fontFace: F_CON, fontSize: TX.sub + 2, align: 'right', valign: 'middle', color: C.background1, bold: true }));
  marca(s, 'sup', 'SUPUESTO · MES 1 = ENERO DE 2027', M, bottom + 0.16);
  marca(s, 'pen', 'CONDICIÓN PENDIENTE · REGLAMENTO', R, bottom + 0.16, { alignRight: true });
  return s;
};

// =====================================================================
// 3.3.3 RESULTADOS · evolución económica (la sensibilidad al dólar va en la diapositiva siguiente)
// =====================================================================
D.resultados = () => {
  const s = contenido('OPERACIONES · PRESUPUESTO Y RESULTADO', 'GANANCIA DESDE EL AÑO 2', 'en las dos líneas.');
  const lw = 8.15;
  mono(s, 'RESULTADO POR LÍNEA · MILLONES DE PESOS', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  leyenda(s, [[HEX.accent1, 'Línea propia'], [HONDO, 'Red de talleres']], M, Y0 + 0.38);
  s.addChart(pres.ChartType.bar, [
    { name: 'Línea propia', labels: AÑOS, values: [-130.2, 159.9, 444.8, 694.7, 869.9] },
    { name: 'Red de talleres', labels: AÑOS, values: [0, 142.1, 415.2, 1233.2, 2889.5] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.8, w: lw + 0.1, h: YF - Y0 - 1.3, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.accent1, HONDO], valAxisMinVal: -700, valAxisMaxVal: 3250,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;−#,##0;;', dataLabelFontSize: 18,
    catAxisLabelPos: 'low', objectName: 'Resultado referencial por línea de negocio',
  }));
  marca(s, 'sup', 'SUPUESTO · 60% PLUS · RESULTADO REFERENCIAL', M, YF - 0.42);
  const cx = M + lw + 0.42, cw = R - cx;
  caja(s, cx, Y0, cw, 2.05);
  mono(s, 'INVERSIÓN POR LOCAL', { x: cx + 0.25, y: Y0 + 0.2, w: cw - 0.5, h: 0.3, color: C.accent1 });
  numero(s, '$81 M', { x: cx + 0.25, y: Y0 + 0.5, w: cw - 0.5, h: 0.72, fontSize: TX.cifraXL, valign: 'top' });
  T(s, 'casi la mitad, el dinamómetro', { x: cx + 0.25, y: Y0 + 1.24, w: cw - 0.4, h: 0.7, fontSize: TX.cuerpo, color: C.text2 });
  const my = Y0 + 2.25;
  cajaHot(s, cx, my, cw, YF - my);
  mono(s, 'MARGEN AL AÑO 5', { x: cx + 0.25, y: my + 0.2, w: cw - 0.5, h: 0.3, color: C.accent1 });
  [['Línea propia', '7,7%', 2.0], ['Red', 'cerca de 10%', 0.8]].forEach(([k, v, kw], i) => {
    const y = my + 0.62 + i * 0.68;
    if (i) regla(s, y, cx + 0.25, cw - 0.5, C.accent5);
    T(s, k, { x: cx + 0.25, y, w: kw, h: 0.68, valign: 'middle', fontSize: TX.cuerpo });
    numero(s, v, { x: cx + 0.25 + kw, y, w: cw - 0.5 - kw, h: 0.68, fontSize: i ? 28 : TX.cifraS + 2, align: 'right', valign: 'middle', color: i ? C.text1 : C.accent1 });
  });
  return s;
};

// 3.3.3 SENSIBILIDAD CAMBIARIA
D.dolar = () => {
  const s = contenido('OPERACIONES · SENSIBILIDAD CAMBIARIA', 'EL RIESGO ES EL DÓLAR:', 'un alza de 10% casi borra el resultado.');
  mono(s, 'RESULTADO PROPIO AL AÑO 5 · MILLONES DE $', { x: M, y: Y0, w: 8, h: 0.3, color: C.text1 });
  mono(s, 'MARGEN', { x: R - 1.7, y: Y0, w: 1.7, h: 0.3, align: 'right', color: C.text1 });
  const filas = [['Dólar −10%', 1646.9, '1.647', '14,6%', C.text2], ['Base', 869.9, '870', '7,7%', C.accent1], ['Dólar +10%', 92.9, '93', '0,8%', C.accent4]];
  const lx = M + 2.55, bwMax = 6.0, rh = 1.05, y1 = Y0 + 0.5;
  filas.forEach(([k, v, t, mg, color], i) => {
    const y = y1 + i * rh, w = Math.max(bwMax * v / 1646.9, 0.08);
    regla(s, y, M, CW, C.accent6);
    T(s, k, { x: M, y, w: 2.35, h: rh, valign: 'middle', align: 'right', fontSize: TX.sub, bold: i === 2, color: i === 2 ? C.accent4 : C.text1 });
    s.addShape(S.rect, { x: lx, y: y + 0.22, w, h: rh - 0.44, fill: { color }, line: { type: 'none' } });
    numero(s, t, { x: lx + w + 0.18, y, w: 1.8, h: rh, valign: 'middle', fontSize: TX.cifraM, color: i === 2 ? C.accent4 : C.text1 });
    numero(s, mg, { x: R - 1.7, y, w: 1.7, h: rh, align: 'right', valign: 'middle', fontSize: TX.cifraS, color: i === 2 ? C.accent4 : i === 1 ? C.accent1 : C.text1 });
  });
  regla(s, y1 + 3 * rh, M, CW, C.accent6);
  const ny = y1 + 3 * rh + 0.22;
  T(s, [{ text: 'El 82% del costo del kit está en dólares: ', options: { bold: true } }, { text: 'el plan financiero evaluará coberturas.', options: { color: C.text2 } }], { x: M, y: ny, w: CW, h: 0.45, fontSize: TX.cuerpoL });
  return s;
};

// =====================================================================
// 3.4 CONCLUSIONES · tres planes, un mismo gatillo
// =====================================================================
D.conclusiones = () => {
  const s = contenido('CONCLUSIONES DEL CAPÍTULO', 'TRES CONCLUSIONES', 'y dos preguntas por resolver.');
  const n = 3, gap = 0.3, cw = (CW - (n - 1) * gap) / n, ch = 2.62;
  [['OPORTUNIDAD', '367 > 299', 'Más demanda que capacidad desde el año 1.'], ['VENTAJA', 'Biblioteca', 'Ahorra sin cambiar de auto y es difícil de copiar.'], ['TRES PLANES, UN MISMO GATILLO', '80%', 'De capacidad: suma dúos, personas y talleres.']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    if (hot) cajaHot(s, x, Y0, cw, ch); else caja(s, x, Y0, cw, ch);
    tag(s, '0' + (i + 1), x + 0.25, Y0 + 0.22, { w: 0.6, h: 0.38, size: TX.etq });
    mono(s, k, { x: x + 1.0, y: Y0 + 0.22, w: cw - 1.15, h: 0.38, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    numero(s, v, { x: x + 0.25, y: Y0 + 0.72, w: cw - 0.5, h: 0.78, fontSize: TX.cifraXL, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.25, y: Y0 + 1.58, w: cw - 0.45, h: 0.95, fontSize: TX.cuerpo });
  });
  const qy = 5.5;
  regla(s, qy - 0.12, M, CW, C.accent3);
  mono(s, 'POR RESOLVER', { x: M, y: qy, w: 5, h: 0.3, color: C.accent3 });
  const qw = (CW - 0.4) / 2;
  ['¿El reglamento admitirá el kit, y desde cuándo?', '¿El ahorro medido confirma los precios?'].forEach((q, i) => {
    T(s, q, { x: M + i * (qw + 0.4), y: qy + 0.36, w: qw, h: 0.95, fontFace: F_SER, italic: true, fontSize: 28, color: C.text1 });
  });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces
// =====================================================================
D.indice = (primera) => {
  const s = contenido('MATERIAL DE APOYO', 'ANEXO', 'para preguntas.', 'A');
  T(s, 'No se presenta: se hace clic en el tema y se salta directo.', { x: M, y: Y0 - 0.06, w: CW, h: 0.4, fontSize: TX.cuerpo, color: C.text2 });
  const colW = (CW - 0.35) / 2, rowH = 0.6, y0 = Y0 + 0.5, porCol = Math.ceil(G.ANEXO.length / 2);
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
    T(s, q, { x: x + 0.25, y, w: 2.35, h: ch, valign: 'middle', fontFace: F_SER, italic: true, fontSize: TIPO === 'A' ? 30 : 24, color: C.accent1 });
    T(s, r, { x: x + 2.7, y: y + 0.14, w: cw - 2.85, h: 0.66, fontSize: TX.cuerpo, bold: true, valign: 'middle' });
    T(s, b, { x: x + 2.7, y: y + 0.84, w: cw - 2.85, h: 0.66, fontSize: TX.cuerpo, color: C.text2, valign: 'top' });
  });
  const ly = Y0 + 2 * ch + 0.18 + 0.12;
  mono(s, 'LO QUE LA MARCA NO PROMETE', { x: M, y: ly, w: 6, h: 0.3, color: C.accent3 });
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
    x: gx - 0.1, y: Y0 + 0.85, w: gw + 0.1, h: 2.55, chartColors: [HEX.accent1], lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 11,
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
  const s = contenido('RECURSOS HUMANOS · COMPENSACIONES', 'EL SUPERIOR GANA MÁS;', 'entre áreas decide la escasez.');
  const lw = 8.15;
  mono(s, 'RENTA BRUTA MENSUAL · MILES DE PESOS', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  const cargos = ['Gerente General', 'Responsable Técnico', 'Calibración', 'Técnico N4', 'Técnico N3', 'Administración', 'Comercial', 'Técnico N1', 'Asistentes'];
  const rentas = [2000, 1800, 1700, 1150, 1000, 900, 850, 750, 692];
  s.addChart(pres.ChartType.bar, [{ name: 'Renta bruta', labels: cargos, values: rentas }], Object.assign({}, ejes, {
    x: M - 0.1, y: Y0 + 0.36, w: lw + 0.1, h: YF - Y0 - 0.36, barDir: 'bar', barGapWidthPct: 28, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 2450, catAxisLabelFontFace: F_BODY, catAxisLabelFontSize: 16,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 18,
    objectName: 'Renta bruta mensual por cargo',
  }));
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
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent4],
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
    numero(s, v, { x: cx + 2.0, y, w: cw - 2.25, h: 0.66, fontSize: TX.cifraS, align: 'right', valign: 'middle', color: i === 1 ? C.accent4 : C.text1 });
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
  const col = { p: C.accent1, o: '1D4F66', a: C.accent3 };
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
        s.addShape(S.star5, { x: hx - 0.17, y: cy - 0.17, w: 0.34, h: 0.34, fill: { color: C.accent3 }, line: { type: 'none' } });
        T(s, txt, { x: hx + 0.28, y, w: 6.0, h: rh, valign: 'middle', fontSize: TX.etq + 2, color: C.accent3, bold: true });
      } else if (it[0] === 'n') {
        const [, m, txt] = it;
        T(s, txt, { x: P(m) - 0.62, y, w: 0.54, h: rh, fontFace: F_CON, fontSize: TX.cuerpo, align: 'right', valign: 'middle', color: C.background1, bold: true });
      }
    });
    y += rh;
  });
  const ly = bottom + 0.14;
  let lx = M;
  [['rect', C.accent1, 'Actividad principal'], ['rect', '1D4F66', 'Operación'], ['rect', C.accent3, 'Preapertura de taller'], ['diamond', C.text1, 'Apertura o dúo nuevo'], ['star5', C.accent3, 'Hito crítico']].forEach(([sh, c, t]) => {
    s.addShape(S[sh], { x: lx, y: ly + 0.08, w: 0.24, h: 0.24, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.34, y: ly, w: t.length * 0.112 + 0.1, h: 0.4, fontSize: TX.etq, valign: 'middle', color: C.text1 });
    lx += 0.34 + t.length * 0.112 + 0.4;
  });
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
