// Presentación de la Fase 3 · Capítulo III: Plan de Marketing, Operaciones y Recursos Humanos de Lumine Motors
// Mismo sistema visual que la presentación de Control de Gestión (control-de-gestion/generador/deck.js):
// escenario negro, un solo acento celeste, titulares anchos en mayúsculas con acento en serif itálica,
// etiquetas mono de instrumento, esquinas de visor, rótulos numerados y números condensados.
// Todas las cifras salen del informe de la Fase 3; lo que falta se marca «Por confirmar».
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {}; // una función por diapositiva; el orden lo pone guion.js
const OUT = process.argv[2] || 'Grupo_01_LumineMotors_Fase3.pptx';
const A = f => path.join(__dirname, 'assets', f);

// ---------- tema ----------
const F_TIT = 'Archivo SemiExpanded ExtraBold';
const F_CON = 'Archivo Condensed';
const F_BODY = 'Figtree';
const F_MONO = 'IBM Plex Mono';
const F_SER = 'Instrument Serif';
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

// ---------- formato chileno ----------
const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = (n, d = 1) => { const [e, f] = Math.abs(n).toFixed(d).split('.'); return (n < 0 ? '−' : '') + miles(e) + (f ? ',' + f : ''); };

// ---------- piezas del sistema visual (las mismas de Control de Gestión) ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: 14, color: C.text1, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: 9.5, color: C.text2, charSpacing: 1.5 }, o));
function linea(s, x, y, w, h, color = C.accent5, width = 0.75, o = {}) {
  s.addShape(S.line, Object.assign({ x, y, w, h, line: { color, width } }, o));
}
// flecha recta (horizontal o vertical)
function flecha(s, x, y, w, h, color = C.accent1, width = 1.25, dash) {
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
const cajaFutura = (s, x, y, w, h) => caja(s, x, y, w, h, { line: { color: C.text2, width: 0.75, dashType: 'dash' } });
// rótulo numerado: cuadro celeste con número oscuro (o gris para lo original)
function tag(s, n, x, y, o = {}) {
  const w = o.w || 0.38, h = o.h || 0.27, on = !o.off;
  s.addShape(S.rect, { x, y, w, h, fill: { color: on ? C.accent1 : C.accent5 }, line: { type: 'none' } });
  T(s, n, { x, y, w, h, fontFace: F_MONO, fontSize: o.size || 9.5, bold: true, color: on ? C.background1 : C.text1, align: 'center', valign: 'middle' });
}
// marcador con borde punteado (el «Por confirmar» de la página)
function chip(s, text, x, y, w, color = C.accent3, o = {}) {
  const h = o.h || 0.28;
  s.addShape(S.rect, { x, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color, width: 0.75, dashType: 'dash' } });
  mono(s, text, { x: x + 0.08, y, w: w - 0.16, h, fontSize: o.size || 8.5, color, valign: 'middle', align: o.align || 'left', charSpacing: 1.2, fit: 'shrink' });
}
const porConfirmar = (s, x, y, w = 1.6, o = {}) => chip(s, 'POR CONFIRMAR', x, y, w, C.accent3, o);
// punto de instrumento
const punto = (s, x, y, color = C.accent1, k = 0.075) => s.addShape(S.rect, { x, y, w: k, h: k, fill: { color }, line: { type: 'none' } });
// número grande condensado (voz de tablero)
const numero = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: 54, color: C.text1, valign: 'bottom' }, o));
// fila de tabla con regla fina inferior
const regla = (s, y, x = M, w = CW, color = C.accent5) => linea(s, x, y, w, 0, color, 0.75);
// rombo de decisión con texto adentro
function rombo(s, text, x, y, w, h, hot) {
  s.addText(text, { shape: S.diamond, x, y, w, h, fill: { color: hot ? HOT : C.background2 }, line: { color: C.accent1, width: 1 }, fontFace: F_BODY, fontSize: 9.5, color: C.text1, align: 'center', valign: 'middle', margin: 0, lang: 'es-CL' });
}
// paso de un diagrama: caja con texto centrado
function paso(s, text, x, y, w, h, o = {}) {
  const st = o.hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } }
    : o.futuro ? { line: { color: C.text2, width: 0.75, dashType: 'dash' } }
    : o.alerta ? { line: { color: C.accent3, width: 0.75 } } : {};
  caja(s, x, y, w, h, st);
  T(s, text, { x: x + 0.08, y, w: w - 0.16, h, fontSize: o.size || 10.5, align: 'center', valign: 'middle', color: o.color || C.text1, bold: !!o.bold });
}

// ---------- marcos (layouts) ----------
const logo = { image: { path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' } };
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('fondo-portada.jpg') },
  objects: [
    logo,
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.62, w: CW, h: 1.95, fontFace: F_TIT, fontSize: 60, color: C.text1, align: 'center', valign: 'top', margin: 0, lineSpacingMultiple: 0.86 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: C.background1 },
  margin: [0.5, M, 0.6, M],
  objects: [
    logo,
    { text: { text: CURSO, options: { x: 6.2, y: 0.4, w: R - 6.2, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 9, color: C.text2, charSpacing: 1.5, margin: 0 } } },
    { placeholder: { options: { name: 'etiqueta', type: 'body', x: M, y: 1.0, w: CW, h: 0.28, fontFace: F_MONO, fontSize: 10, color: C.text2, charSpacing: 1.5, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.38, w: CW, h: 1.02, fontFace: F_TIT, fontSize: 30, color: C.text1, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.88 }, text: '' } },
  ],
  slideNumber: { x: R - 0.8, y: 6.98, w: 0.8, h: 0.24, fontFace: F_MONO, fontSize: 9, color: HEX.accent1, align: 'right', margin: 0 },
});
pres.defineSlideMaster({
  title: 'CIERRE',
  background: { path: A('fondo-cierre.jpg') },
  objects: [
    logo,
    { image: { path: A('palabra.png'), x: M, y: 4.62, w: CW, h: CW * 96 / 584, altText: 'LUMINE' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.45, w: CW, h: 1.9, fontFace: F_TIT, fontSize: 30, color: C.text1, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.9 }, text: '' } },
  ],
});

// Fuente al pie de cada diapositiva (guía de presentación de Integrador II): toda cifra lleva su fuente en la misma lámina.
// Las referencias son las del informe de la Fase 3 y su bibliografía.
const INF = 'Informe Fase 3';
const FUENTES = {
  objetivos: `Fuente: elaboración propia con base en ${INF} (§3.1.1, Tablas N° 1 y 10).`,
  segmentacion: `Fuentes: INE (2025), parque de vehículos 2024; SII (2025); Fielbaum y Tirachini (2021); elaboración propia (${INF}, §3.1.2).`,
  investigacion: `Fuente: elaboración propia (${INF}, §3.1.3, Tablas N° 2 y 3). Muestra no probabilística: resultados indicativos.`,
  ansoff: `Fuentes: Ansoff (1965); elaboración propia (${INF}, §3.1.4, Figura N° 1).`,
  posicionamiento: `Fuentes: KMcheck (2026); Autofact (2026); Mercado Libre (2026); Abastible (2026); Gasco (s.f.); BioBioChile (2026); elaboración propia (Anexo N° 2).`,
  precio: `Fuentes: elaboración propia (${INF}, Tablas N° 5 y 6; Anexos N° 2 y 9); Banco Central de Chile (2026), tasa de consumo.`,
  demanda: `Fuentes: INE (2025); Centro UC en Emol (2026); Descubre (2026); Massiani y Gohs (2015); elaboración propia (Tabla N° 10, Anexo N° 4).`,
  'presupuesto-mkt': `Fuente: elaboración propia (${INF}, Tabla N° 11). Montos netos de IVA.`,
  estructura: `Fuentes: borrador de reglamento MTT (2021); elaboración propia (${INF}, Figura N° 3 y Tabla N° 12).`,
  rrhh: `Fuentes: Ley N° 21.735; Ley N° 16.744; Ley N° 19.728; elaboración propia (${INF}, Tablas N° 14 a 16 y Anexo N° 7).`,
  flujo: `Fuentes: borrador de reglamento MTT (2021), arts. 11 a 18; elaboración propia (${INF}, Figura N° 4 y Tabla N° 17).`,
  gantt: `Fuente: elaboración propia (${INF}, Figura N° 5). Mes 1 = enero de 2027 (supuesto).`,
  'presupuesto-ops': `Fuentes: Dynojet Research (2016); Importadora JAK (2026); elaboración propia (${INF}, Tablas N° 18 a 21).`,
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
};

// diapositiva de contenido: etiqueta (índice + sección), titular con acento en serif y fuente al pie
let SEC = null, ANEXO_ACTUAL = null, INDICE_ANEXO = null, CLAVE = null;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(n, etiqueta, titulo, acento) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SEC });
  if (ANEXO_ACTUAL) {
    n = ANEXO_ACTUAL.codigo; etiqueta = 'ANEXO · ' + etiqueta;
    // vuelta al índice del anexo, bajo el nombre del curso
    s.addText('↩ ÍNDICE DEL ANEXO', { x: 8.7, y: 0.7, w: R - 8.7, h: 0.22, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 8.5, color: C.accent1, charSpacing: 1.5, margin: 0, hyperlink: { slide: INDICE_ANEXO, tooltip: 'Volver al índice del anexo' } });
  }
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  s.addText([{ text: titulo + ' ' }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 35 } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.94, w: R - M - 0.9, h: 0.3, valign: 'middle', fontSize: 9, color: C.text2, fit: 'shrink' });
  return s;
}
// marca de supuesto o estimación del equipo (guía: diferenciar hechos de hipótesis)
const supuesto = (s, text, x, y, w, o = {}) => chip(s, text, x, y, w, C.accent3, o);

const ejes = { // estilo común de gráficos: etiquetas mono grises, rejilla casi invisible
  catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: F_MONO, catAxisLabelFontSize: 10,
  valAxisLabelColor: HEX.dk2, valAxisLabelFontFace: F_MONO, valAxisLabelFontSize: 9,
  valGridLine: { color: '1F2427', size: 0.75 }, catGridLine: { style: 'none' },
  catAxisLineColor: HEX.accent5, valAxisLineShow: false,
  dataLabelFontFace: F_MONO, dataLabelFontSize: 10, dataLabelColor: HEX.dk1,
  legendFontFace: F_MONO, legendFontSize: 10, legendColor: HEX.dk2,
  chartArea: { fill: { color: HEX.lt1 } }, plotArea: { fill: { color: HEX.lt1 } },
  showTitle: false,
};
const AÑOS = ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'];

// =====================================================================
// PORTADA
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 9 });
  mono(s, 'FASE 3 · CAPÍTULO III: PLAN DE MARKETING, OPERACIONES Y RECURSOS HUMANOS', { x: M, y: 1.12, w: CW, h: 0.3, align: 'center', valign: 'middle', fontSize: 10 });
  s.addText([
    { text: 'LUMINE MOTORS', options: { breakLine: true } },
    { text: 'reconversión híbrida.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 76 } },
  ], { placeholder: 'title' });
  // frase explicativa (guía: tipo de solución y necesidad, 15 a 20 palabras)
  T(s, 'Kit que hibrida autos a combustión de tracción delantera para gastar menos bencina sin cambiar de auto.', { x: M, y: 3.66, w: CW, h: 0.36, align: 'center', fontSize: 17, color: C.text1 });
  const pw = 5.6, ph = pw * 740 / 2400;
  s.addImage({ path: A('plano.png'), x: (W - pw) / 2, y: 4.12, w: pw, h: ph, altText: 'Plano del kit Lumine: auto en vista lateral con el motor eléctrico en el eje trasero' });
  linea(s, M, 5.95, CW, 0, C.accent5);
  const filas = [
    [['UNIVERSIDAD', 'Universidad Andrés Bello · Facultad de Economía y Negocios · Ingeniería Comercial', 7.4], ['CURSO', 'Integrador II: Taller de Empresas · ICMA 1001', 4.73]],
    [['GRUPO', '1', 1.1], ['PROFESOR', 'Roberto Brito', 2.4], ['INTEGRANTES', 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', 8.63]],
  ];
  filas.forEach((cols, f) => {
    let x = M;
    const y = 6.07 + f * 0.62;
    cols.forEach(([k, v, w]) => {
      mono(s, k, { x, y, w, h: 0.22, fontSize: 8 });
      T(s, v, { x, y: y + 0.22, w: w - 0.15, h: 0.32, fontSize: 13.5 });
      x += w;
    });
  });
  return s;
};

// =====================================================================
// 3.1.1 OBJETIVOS
// =====================================================================
D.objetivos = () => {
  const s = contenido('01', 'PLAN DE MARKETING · OBJETIVOS', '299 VEHÍCULOS EL PRIMER AÑO,', 'la referencia al quinto.');
  // objetivo general
  const gx = M, gy = 2.55, gw = 3.9, gh = 2.35;
  cajaHot(s, gx, gy, gw, gh);
  mono(s, 'OBJETIVO GENERAL · CINCO AÑOS', { x: gx + 0.25, y: gy + 0.2, w: gw - 0.5, h: 0.24, fontSize: 9, color: C.accent1 });
  T(s, 'Ser la referencia de la hibridación de posventa en Chile.', { x: gx + 0.25, y: gy + 0.5, w: gw - 0.5, h: 0.8, fontSize: 15.5, bold: true });
  T(s, 'Tres talleres propios en la Región Metropolitana y una red certificada que instale con los patrones de Lumine en todas las regiones.', { x: gx + 0.25, y: gy + 1.38, w: gw - 0.5, h: 0.9, fontSize: 12, color: C.text2 });
  // metas del primer año
  const mx = gx + gw + 0.4, mw = R - mx, n = 5, gap = 0.15, tw = (mw - (n - 1) * gap) / n;
  mono(s, 'METAS DEL PRIMER AÑO', { x: mx, y: gy - 0.02, w: mw, h: 0.24, fontSize: 9, color: C.text1 });
  const metas = [
    ['299', 'vehículos instalados', 'Uso laboral de la RM'],
    [null, 'cotizaciones digitales', 'Según la conversión medida'],
    ['3', 'casos con ahorro medido', 'Publicados en nueve meses'],
    ['80%', 'clientes satisfechos', 'Nota 4 o 5 de 5, a los tres meses'],
    ['15%', 'clientes por recomendación', 'Pregunta de origen del formulario'],
  ];
  metas.forEach(([v, k, d], i) => {
    const x = mx + i * (tw + gap), y = gy + 0.32, h = gh - 0.32;
    caja(s, x, y, tw, h);
    tag(s, '0' + (i + 1), x + 0.15, y + 0.15, { off: v === null });
    if (v) numero(s, v, { x: x + 0.15, y: y + 0.38, w: tw - 0.3, h: 0.72, fontSize: 44, color: i === 0 ? C.accent1 : C.text1 });
    else porConfirmar(s, x + 0.15, y + 0.72, tw - 0.3, { size: 7 });
    T(s, k, { x: x + 0.15, y: y + 1.12, w: tw - 0.3, h: 0.42, fontSize: 11.5, bold: true });
    T(s, d, { x: x + 0.15, y: y + 1.52, w: tw - 0.3, h: 0.48, fontSize: 10, color: C.text2 });
  });
  // hitos de los años 1 a 5
  const hy = 5.08;
  mono(s, 'HITOS · INSTALACIONES PROPIAS Y RED POR AÑO', { x: M, y: hy, w: 6, h: 0.24, fontSize: 9, color: C.text1 });
  supuesto(s, 'PRONÓSTICO · ESCENARIO BASE', R - 2.75, hy - 0.03, 2.75, { align: 'center' });
  const lx = M + 0.2, lw = CW - 0.4, ly = hy + 0.66;
  linea(s, lx, ly, lw, 0, C.accent5, 1.25);
  const hitos = [
    ['AÑO 1', '299', 'Un taller · tres dúos'],
    ['AÑO 2', '869', 'Seis dúos · 3 talleres certificados'],
    ['AÑO 3', '1.674', 'Taller 2 · 9 certificados · 1.ª flota'],
    ['AÑO 4', '2.268', 'Dos talleres llenos · 20 certificados'],
    ['AÑO 5', '2.851', 'Tercer taller · 42 certificados'],
  ];
  const step = lw / (hitos.length - 1);
  hitos.forEach(([a, v, d], i) => {
    const cx = lx + i * step, bw = 2.6;
    const bx = Math.min(Math.max(cx - bw / 2, M), R - bw);
    s.addShape(S.ellipse, { x: cx - 0.07, y: ly - 0.07, w: 0.14, h: 0.14, fill: { color: i === 0 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.25 } });
    mono(s, a, { x: bx, y: ly - 0.36, w: bw, h: 0.22, fontSize: 8.5, align: i === 0 ? 'left' : i === hitos.length - 1 ? 'right' : 'center', color: C.accent1 });
    const al = i === 0 ? 'left' : i === hitos.length - 1 ? 'right' : 'center';
    numero(s, v, { x: bx, y: ly + 0.12, w: bw, h: 0.48, fontSize: 28, valign: 'top', align: al });
    T(s, d, { x: bx, y: ly + 0.6, w: bw, h: 0.42, fontSize: 10.5, color: C.text2, align: al });
  });
  return s;
};

// =====================================================================
// 3.1.2 SEGMENTACIÓN
// =====================================================================
D.segmentacion = () => {
  const s = contenido('02', 'PLAN DE MARKETING · SEGMENTACIÓN', 'EL CLIENTE SE DEFINE POR SU AUTO,', 'no por su edad.');
  const lw = 4.4, y0 = 2.55;
  mono(s, 'DELIMITACIÓN · SIN ESTO NO HAY COMPRA', { x: M, y: y0, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  const cond = [
    ['Técnica', 'Liviano, a combustión y con tracción delantera: el kit va sobre el eje trasero.'],
    ['Acceso', 'Que llegue al taller: todo Chile, salvo Rapa Nui, Juan Fernández y la Antártica.'],
    ['Unidad', 'Persona natural vinculada a un vehículo que cumpla la condición técnica.'],
  ];
  const rh = 0.78;
  cond.forEach(([t, d], i) => {
    const y = y0 + 0.34 + i * rh;
    regla(s, y, M, lw);
    tag(s, '0' + (i + 1), M, y + 0.12);
    T(s, t, { x: M + 0.55, y: y + 0.08, w: lw - 0.55, h: 0.3, fontSize: 14, bold: true });
    T(s, d, { x: M + 0.55, y: y + 0.38, w: lw - 0.55, h: 0.4, fontSize: 11, color: C.text2 });
  });
  regla(s, y0 + 0.34 + 3 * rh, M, lw);
  T(s, 'La antigüedad del auto y la capacidad de pago no delimitan el mercado.', { x: M, y: y0 + 0.42 + 3 * rh, w: lw, h: 0.42, fontSize: 10.5, color: C.text2, italic: true });
  // cuatro variables
  const gx = M + lw + 0.4, gw = R - gx, gap = 0.2, cw = (gw - gap) / 2, ch = 1.42;
  const vars = [
    ['GEOGRÁFICA', '36,8%', 'del parque está en la Región Metropolitana (RM); el ahorro varía, pero no desaparece.'],
    ['DEMOGRÁFICA', '4 roles', 'Usuario, dueño efectivo, decisor o pagador e influyentes.'],
    ['PSICOGRÁFICA', '5 motivos', 'Ahorro, ambiente, anticipación normativa, innovación y apego al auto.'],
    ['CONDUCTUAL', '6 dimensiones', 'La intensidad y el tipo de uso fijan cuándo el ahorro paga la inversión.'],
  ];
  vars.forEach(([k, v, d], i) => {
    const x = gx + (i % 2) * (cw + gap), y = y0 + Math.floor(i / 2) * (ch + gap), hot = i === 3;
    if (hot) cajaHot(s, x, y, cw, ch); else caja(s, x, y, cw, ch);
    mono(s, k, { x: x + 0.2, y: y + 0.15, w: cw - 0.4, h: 0.22, fontSize: 8.5, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: x + 0.2, y: y + 0.36, w: cw - 0.4, h: 0.55, fontSize: 30, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.2, y: y + 0.9, w: cw - 0.4, h: 0.52, fontSize: 11, color: C.text2 });
  });
  // punto de entrada y empresas
  const by = 5.85;
  regla(s, by - 0.1, M, CW, C.accent1);
  punto(s, M, by + 0.1);
  mono(s, 'PUNTO DE ENTRADA', { x: M + 0.17, y: by, w: 3, h: 0.26, valign: 'middle', fontSize: 9, color: C.accent1 });
  T(s, 'Uso laboral de alta intensidad en la RM: colectivos, taxis y aplicaciones.', { x: M, y: by + 0.3, w: 5.4, h: 0.55, fontSize: 13.5, bold: true });
  const ex = M + 5.9, ew = R - ex;
  mono(s, 'MERCADO DE EMPRESAS', { x: ex, y: by, w: ew, h: 0.26, valign: 'middle', fontSize: 9, color: C.text1 });
  const emp = [['14.473', 'autos arrendados a conductores'], ['408', 'líneas de colectivos'], ['22.447', 'talleres mecánicos']];
  const eww = ew / 3;
  emp.forEach(([v, d], i) => {
    numero(s, v, { x: ex + i * eww, y: by + 0.27, w: eww, h: 0.36, fontSize: 20, valign: 'top' });
    T(s, d, { x: ex + i * eww, y: by + 0.6, w: eww - 0.1, h: 0.3, fontSize: 10.5, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.1.3 INVESTIGACIÓN DE MERCADO
// =====================================================================
D.investigacion = () => {
  const s = contenido('03', 'PLAN DE MARKETING · INVESTIGACIÓN DE MERCADO', 'SEIS HIPÓTESIS', 'antes de fijar el precio.');
  const y0 = 2.55, n = 4, gap = 0.35, cw = (CW - (n - 1) * gap) / n, ch = 2.28;
  mono(s, 'DISEÑO MIXTO, SECUENCIAL Y EXPLORATORIO · CUATRO ETAPAS', { x: M, y: y0, w: CW, h: 0.24, fontSize: 9, color: C.text1 });
  const et = [
    ['EXPLORATORIA', '1', 'conductor de aplicaciones', '100.000 km al año; un ahorro de 5% a 10% ya le parece motivo.', true],
    ['EXPERTOS', '4', 'expertos', 'Estado, academia, industria y mecánica.', false],
    ['CLIENTES', '5', 'perfiles más', 'Ruta larga, colectivo o taxi, dueño que no maneja, familiar y traslado.', false],
    ['ENCUESTA', '150', 'casos, mínimo 100', 'Por cuotas en la RM: 23 preguntas y 7 minutos.', false],
  ];
  et.forEach(([k, v, u, d, hecho], i) => {
    const x = M + i * (cw + gap), y = y0 + 0.32;
    caja(s, x, y, cw, ch);
    if (i < n - 1) flecha(s, x + cw + 0.04, y + ch / 2, gap - 0.08, 0, C.accent1, 1.25);
    tag(s, '0' + (i + 1), x + 0.18, y + 0.16, { off: !hecho });
    mono(s, k, { x: x + 0.65, y: y + 0.16, w: cw - 0.8, h: 0.27, valign: 'middle', fontSize: 9, color: C.text1 });
    numero(s, v, { x: x + 0.18, y: y + 0.48, w: 1.3, h: 0.6, fontSize: 38, valign: 'top', color: hecho ? C.accent1 : C.text1 });
    T(s, u, { x: x + 0.18, y: y + 1.06, w: cw - 0.36, h: 0.28, fontSize: 12, bold: true });
    T(s, d, { x: x + 0.18, y: y + 1.34, w: cw - 0.36, h: 0.48, fontSize: 10, color: C.text2 });
    chip(s, hecho ? 'REALIZADA' : 'POR REALIZAR', x + 0.18, y + ch - 0.4, 1.45, hecho ? C.accent2 : C.accent3);
  });
  // hipótesis y muestra
  const by = 5.58, lw = 7.6;
  mono(s, 'QUÉ PONE A PRUEBA · 3 DE 6 HIPÓTESIS (ANEXO A1)', { x: M, y: by - 0.2, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  const h = [['H1', 'El uso laboral tiene más intención de compra que el particular.'], ['H4', 'La barrera principal es la confianza, no el precio.'], ['H6', 'Se prefiere hibridar antes que gas, cambiar de auto o no hacer nada.']];
  h.forEach(([k, t], i) => {
    const y = by + 0.12 + i * 0.37;
    regla(s, y, M, lw, C.accent6);
    tag(s, k, M, y + 0.06, { w: 0.42 });
    T(s, t, { x: M + 0.6, y, w: lw - 0.6, h: 0.38, valign: 'middle', fontSize: 12 });
  });
  const cx = M + lw + 0.45, cw2 = R - cx, cy = by - 0.2, ch2 = 1.45;
  caja(s, cx, cy, cw2, ch2);
  mono(s, 'MUESTRA POR CUOTAS', { x: cx + 0.2, y: cy + 0.14, w: cw2 - 0.4, h: 0.22, fontSize: 8.5, color: C.accent1 });
  numero(s, '±8,0%', { x: cx + 0.2, y: cy + 0.35, w: 1.9, h: 0.6, fontSize: 34, valign: 'top' });
  T(s, 'Error de referencia con 150 casos. Una muestra aleatoria exigiría 385: los resultados son indicativos.', { x: cx + 2.05, y: cy + 0.4, w: cw2 - 2.25, h: 0.95, fontSize: 10.5, color: C.text2 });
  T(s, 'Precio con el método de Van Westendorp.', { x: cx + 0.2, y: cy + 1.02, w: 1.85, h: 0.38, fontSize: 9.5, color: C.text2 });
  return s;
};

// =====================================================================
// 3.1.4 MATRIZ DE ANSOFF
// =====================================================================
D.ansoff = () => {
  const s = contenido('04', 'PLAN DE MARKETING · MATRIZ DE ANSOFF', 'UN PRODUCTO NUEVO', 'en un mercado que ya existe.');
  const gx = M + 0.55, gw = 8.25, gapX = 0.55, gapY = 0.5, qw = (gw - gapX) / 2, gy = 2.88, qh = 1.68;
  mono(s, 'PRODUCTO EXISTENTE', { x: gx, y: 2.52, w: qw, h: 0.24, fontSize: 9, align: 'center', color: C.text1 });
  mono(s, 'PRODUCTO NUEVO', { x: gx + qw + gapX, y: 2.52, w: qw, h: 0.24, fontSize: 9, align: 'center', color: C.text1 });
  T(s, 'MERCADO EXISTENTE', { x: M - 0.95 + 0.12, y: gy + qh / 2 - 0.13, w: 2.0, h: 0.26, rotate: 270, fontFace: F_MONO, fontSize: 8.5, color: C.text1, charSpacing: 1.5, align: 'center' });
  T(s, 'MERCADO NUEVO', { x: M - 0.95 + 0.12, y: gy + qh + gapY + qh / 2 - 0.13, w: 2.0, h: 0.26, rotate: 270, fontFace: F_MONO, fontSize: 8.5, color: C.text1, charSpacing: 1.5, align: 'center' });
  const q = [
    [0, 0, 'PENETRACIÓN', 'AÑO 2', 'Más clientes del mismo mercado: uso medio, recomendación y el mecánico de confianza como canal.', 'normal'],
    [1, 0, 'DESARROLLO DE PRODUCTO', 'AÑO 1 · AQUÍ ENTRA LUMINE', 'Hibridación aditiva certificada, sin oferta en Chile, para conductores que ya buscan gastar menos.', 'hot'],
    [0, 1, 'DESARROLLO DE MERCADO', 'AÑO 3', 'Flotas y regiones a través de la red certificada, y convenios con líneas de colectivos.', 'normal'],
    [1, 1, 'DIVERSIFICACIÓN RELACIONADA', 'DESDE EL AÑO 2', 'Patrones de calibración, kits por volumen y certificación con Habilita, vendidos a otros talleres.', 'futuro'],
  ];
  q.forEach(([c, r, t, a, d, st]) => {
    const x = gx + c * (qw + gapX), y = gy + r * (qh + gapY);
    if (st === 'hot') cajaHot(s, x, y, qw, qh);
    else if (st === 'futuro') caja(s, x, y, qw, qh, { fill: { color: HOT }, line: { color: C.accent1, width: 1, dashType: 'dash' } });
    else caja(s, x, y, qw, qh);
    T(s, t, { x: x + 0.22, y: y + 0.16, w: qw - 0.44, h: 0.3, fontSize: 13, bold: true, charSpacing: 1 });
    mono(s, a, { x: x + 0.22, y: y + 0.47, w: qw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
    T(s, d, { x: x + 0.22, y: y + 0.78, w: qw - 0.44, h: 0.8, fontSize: 11.5, color: st === 'normal' ? C.text2 : C.text1 });
  });
  // ruta de crecimiento
  const midY0 = gy + qh / 2;
  flecha(s, gx + qw + gapX - 0.05, midY0, -(gapX - 0.1), 0);
  mono(s, 'AÑO 2', { x: gx + qw + 0.02, y: midY0 - 0.27, w: gapX - 0.04, h: 0.2, fontSize: 7.5, align: 'center', color: C.accent1, charSpacing: 0.5 });
  flecha(s, gx + 0.45, gy + qh + 0.05, 0, gapY - 0.1);
  mono(s, 'AÑO 3', { x: gx + 0.55, y: gy + qh + 0.14, w: 0.8, h: 0.22, fontSize: 8, color: C.accent1 });
  flecha(s, gx + 2 * qw + gapX - 0.45, gy + qh + 0.05, 0, gapY - 0.1, C.accent1, 1.25, 'dash');
  mono(s, 'AÑO 2', { x: gx + 2 * qw + gapX - 1.35, y: gy + qh + 0.14, w: 0.8, h: 0.22, fontSize: 8, align: 'right', color: C.accent1 });
  // por qué se adelanta la diversificación
  const cx = gx + gw + 0.45, cw = R - cx, cy = 2.88, ch = 2 * qh + gapY;
  caja(s, cx, cy, cw, ch);
  mono(s, 'UNA EXCEPCIÓN DELIBERADA', { x: cx + 0.22, y: cy + 0.18, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  T(s, 'La diversificación se adelanta al año 2.', { x: cx + 0.22, y: cy + 0.48, w: cw - 0.44, h: 0.6, fontSize: 15, bold: true });
  T(s, 'El valor de la calibración depende de su exclusividad, que se agota con el tiempo.', { x: cx + 0.22, y: cy + 1.15, w: cw - 0.44, h: 0.75, fontSize: 11.5, color: C.text2 });
  regla(s, cy + 1.98, cx + 0.22, cw - 0.44);
  T(s, 'Cada taller de la red devuelve sus datos: la red alimenta la biblioteca en vez de diluirla.', { x: cx + 0.22, y: cy + 2.1, w: cw - 0.44, h: 0.8, fontSize: 11.5, color: C.text2 });
  regla(s, cy + 2.95, cx + 0.22, cw - 0.44);
  mono(s, 'TALLERES PROPIOS', { x: cx + 0.22, y: cy + 3.07, w: cw - 0.44, h: 0.22, fontSize: 8, color: C.text1 });
  T(s, 'Segundo en el mes 25 y tercero en el 49.', { x: cx + 0.22, y: cy + 3.32, w: cw - 0.44, h: 0.45, fontSize: 11.5, color: C.text2 });
  return s;
};

// =====================================================================
// 3.1.5 POSICIONAMIENTO
// =====================================================================
D.posicionamiento = () => {
  const s = contenido('05', 'PLAN DE MARKETING · POSICIONAMIENTO', 'EL ESPACIO VACÍO:', 'ahorrar sin cambiar de auto.');
  const px = 3.25, pw = R - px, rows = [[2.55, 1.35], [4.0, 1.0], [5.1, 1.32]];
  // escala logarítmica de inversión (millones de pesos); $0 va aparte a la izquierda
  const lo = Math.log10(0.5), hi = Math.log10(26), x0 = px + 1.0, xw = pw - 1.15;
  const X = v => v === 0 ? px + 0.42 : x0 + (Math.log10(v) - lo) / (hi - lo) * xw;
  const etq = [['Conserva su auto', 'sin límite de antigüedad'], ['Conserva su auto', 'con límite de antigüedad'], ['Debe reemplazar', 'su auto']];
  rows.forEach(([y, h], i) => {
    s.addShape(S.rect, { x: px, y, w: pw, h, fill: { color: i === 0 ? HOT : C.background2 }, line: { type: 'none' } });
    T(s, [{ text: etq[i][0], options: { breakLine: true, bold: i === 0 } }, { text: etq[i][1], options: { color: C.text2 } }], { x: M, y, w: px - M - 0.2, h, align: 'right', valign: 'middle', fontSize: 12.5 });
  });
  mono(s, 'QUÉ EXIGE AL CONDUCTOR', { x: M, y: 2.28, w: 2.6, h: 0.22, fontSize: 8, align: 'right' });
  // eje
  const ay = 6.47;
  linea(s, px, ay, pw, 0, C.text2, 0.75);
  [[0, '$0'], [1, '$1 M'], [2, '$2 M'], [5, '$5 M'], [10, '$10 M'], [20, '$20 M']].forEach(([v, l]) => {
    linea(s, X(v), ay, 0, 0.06, C.text2, 0.75);
    mono(s, l, { x: X(v) - 0.5, y: ay + 0.07, w: 1.0, h: 0.2, fontSize: 8, align: 'center' });
  });
  mono(s, 'INVERSIÓN INICIAL DEL CONDUCTOR · MILLONES DE PESOS · ESCALA LOGARÍTMICA', { x: px, y: ay + 0.27, w: pw, h: 0.2, fontSize: 7.5, align: 'center' });
  // fila 1: espacio vacío, no hacer nada y Lumine
  const r1 = rows[0];
  s.addShape(S.rect, { x: X(0.62), y: r1[0] + 0.12, w: X(7.2) - X(0.62), h: r1[1] - 0.24, fill: { color: HOT, transparency: 100 }, line: { color: C.accent1, width: 0.75, dashType: 'sysDot' } });
  T(s, 'Espacio hoy sin oferta: ahorrar sin reemplazar el auto', { x: X(0.62) + 0.15, y: r1[0] + r1[1] - 0.48, w: 4.2, h: 0.26, fontSize: 10.5, color: C.accent1, bold: true });
  s.addShape(S.ellipse, { x: X(0) - 0.08, y: r1[0] + 0.35, w: 0.16, h: 0.16, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'No hacer nada', options: { breakLine: true, bold: true } }, { text: 'sin ahorro', options: { color: C.text2 } }], { x: X(0) - 0.55, y: r1[0] + 0.58, w: 1.1, h: 0.5, fontSize: 10, align: 'center' });
  const lyL = r1[0] + 0.43;
  s.addShape(S.rect, { x: X(4.29), y: lyL - 0.04, w: X(4.99) - X(4.29), h: 0.08, fill: { color: C.accent1 }, line: { type: 'none' } });
  [4.29, 4.99].forEach(v => s.addShape(S.ellipse, { x: X(v) - 0.09, y: lyL - 0.09, w: 0.18, h: 0.18, fill: { color: C.accent1 }, line: { type: 'none' } }));
  mono(s, 'ESENCIAL · PLUS', { x: X(4.29) - 0.6, y: lyL + 0.14, w: 1.9, h: 0.2, fontSize: 7.5, align: 'center', color: C.accent1 });
  supuesto(s, 'LUMINE: PRECIO DE REFERENCIA · AHORRO SIMULADO', R - 3.9, 2.25, 3.9, { size: 7.5, align: 'center', h: 0.24 });
  const bx = X(8.2), bw = R - bx - 0.15;
  cajaHot(s, bx, r1[0] + 0.2, bw, r1[1] - 0.4);
  T(s, 'LUMINE MOTORS', { x: bx + 0.15, y: r1[0] + 0.3, w: bw - 0.3, h: 0.3, fontSize: 13, bold: true, align: 'center' });
  T(s, [{ text: '$4,3 M y $5,0 M', options: { breakLine: true } }, { text: 'hasta 15% y 20% menos bencina' }], { x: bx + 0.1, y: r1[0] + 0.6, w: bw - 0.2, h: 0.42, fontSize: 10, color: C.accent1, align: 'center' });
  // fila 2: gas
  const r2 = rows[1], gy = r2[0] + r2[1] - 0.3;
  s.addShape(S.rect, { x: X(0.9), y: gy, w: X(1.8) - X(0.9), h: 0.1, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'Conversión a gas  ', options: { bold: true } }, { text: '$0,9–1,8 M · hasta 35% · máx. 7 años (GLP)', options: { color: C.text2 } }], { x: X(0.9) - 0.1, y: r2[0] + 0.12, w: 5.6, h: 0.3, fontSize: 11 });
  // fila 3: reemplazar el auto
  const r3 = rows[2];
  const alt = [['Híbrido usado', '$9,5–13 M', 9.5, 13], ['Híbrido nuevo', 'desde $12,0 M (ligero)', 11.99, 16.49], ['Eléctrico nuevo', 'desde $14,0 M · se enchufa', 13.99, 26]];
  alt.forEach(([t, d, a, b], i) => {
    const y = r3[0] + 0.2 + i * 0.36;
    s.addShape(S.rect, { x: X(a), y: y + 0.08, w: X(b) - X(a), h: 0.1, fill: { color: C.text2 }, line: { type: 'none' } });
    s.addShape(S.ellipse, { x: X(a) - 0.07, y: y + 0.06, w: 0.14, h: 0.14, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, [{ text: t + '  ', options: { bold: true } }, { text: d, options: { color: C.text2 } }], { x: X(a) - 4.55, y: y - 0.02, w: 4.4, h: 0.3, fontSize: 11, align: 'right' });
  });
  return s;
};

// =====================================================================
// 3.1.6 MIX: PRODUCTO Y PRECIO
// =====================================================================
D.precio = () => {
  const s = contenido('06', 'PLAN DE MARKETING · MIX: PRODUCTO Y PRECIO', 'PLUS CUESTA 16% MÁS', 'y ahorra 24% más.');
  const y0 = 2.55, cw = 3.05, ch = 3.25, gap = 0.25;
  const v = [
    ['ESENCIAL', '$4.290.000', 'Hasta 15% menos bencina', '2 × 4.000 W', '$117.069', '$454.226', false],
    ['PLUS', '$4.990.000', 'Hasta 20% menos bencina', '2 × 6.000 W', '$145.327', '$683.376', true],
  ];
  v.forEach(([k, p, prom, mot, ah, mg, hot], i) => {
    const x = M + i * (cw + gap);
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    mono(s, k, { x: x + 0.22, y: y0 + 0.18, w: 1.4, h: 0.24, fontSize: 9, color: hot ? C.accent1 : C.text1 });
    if (hot) chip(s, 'RECOMENDADA', x + cw - 1.45, y0 + 0.16, 1.25, C.accent1);
    numero(s, p, { x: x + 0.2, y: y0 + 0.45, w: cw - 0.4, h: 0.6, fontSize: 34, valign: 'top', color: hot ? C.accent1 : C.text1 });
    supuesto(s, 'PRECIO DE REFERENCIA · CON IVA', x + 0.22, y0 + 1.02, 2.45, { size: 7, h: 0.24 });
    const filas = [['PROMESA · SIMULADA', prom],['MOTORES EN RUEDA', mot], ['AHORRO DEL COLECTIVO', ah + ' al mes'], ['MARGEN POR KIT', mg]];
    filas.forEach(([a, b], j) => {
      const y = y0 + 1.38 + j * 0.45;
      regla(s, y, x + 0.22, cw - 0.44, C.accent6);
      mono(s, a, { x: x + 0.22, y: y + 0.04, w: cw - 0.44, h: 0.18, fontSize: 7.5 });
      T(s, b, { x: x + 0.22, y: y + 0.2, w: cw - 0.44, h: 0.24, fontSize: 12, bold: j >= 2 });
    });
  });
  // gráfico: meses para recuperar la inversión
  const gx = M + 2 * cw + gap + 0.5, gw = R - gx;
  mono(s, 'MESES PARA RECUPERAR LA INVERSIÓN', { x: gx, y: y0, w: gw, h: 0.24, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Esencial', labels: ['Colectivo', 'Aplicación'], values: [36.6, 28.9] },
    { name: 'Plus', labels: ['Colectivo', 'Aplicación'], values: [34.3, 27.5] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 2.95, barDir: 'col', barGapWidthPct: 60,
    chartColors: [HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 42, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 12, dataLabelFontBold: true,
    catAxisLabelFontSize: 11, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', objectName: 'Meses para recuperar la inversión por versión',
  }));
  // tira inferior: garantía, financiamiento y precio a validar
  const by = 6.05, iw = (CW - 0.6) / 3;
  const it = [
    ['GARANTÍA', 'Kit e instalación: 3 años o 200.000 km. Batería: 5 años o 300.000 km.', C.accent1],
    ['FINANCIAMIENTO', 'Cuota de Plus a 48 meses: $159.967 al 25,6% anual. El convenio busca una línea preferente.', C.accent1],
    ['A VALIDAR', 'Precios de referencia: la encuesta los ajusta con el método de Van Westendorp.', C.accent3],
  ];
  it.forEach(([k, d, col], i) => {
    const x = M + i * (iw + 0.3);
    regla(s, by - 0.08, x, iw);
    punto(s, x, by + 0.08, col);
    mono(s, k, { x: x + 0.17, y: by, w: iw - 0.2, h: 0.24, valign: 'middle', fontSize: 8.5, color: C.text1 });
    T(s, d, { x, y: by + 0.28, w: iw, h: 0.5, fontSize: 10.5, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.1.7 DEMANDA Y PRONÓSTICO
// =====================================================================
D.demanda = () => {
  const s = contenido('07', 'PLAN DE MARKETING · DEMANDA Y PRONÓSTICO DE VENTAS', 'MÁS DEMANDA QUE CAPACIDAD', 'desde el año 1.');
  const y0 = 2.55, lw = 3.7;
  mono(s, 'TAMAÑO DEL MERCADO · VEHÍCULOS (2024)', { x: M, y: y0, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  const emb = [['TAM · MERCADO TOTAL · CHILE', '4.409.729', 1.0], ['SAM · DISPONIBLE · RM', '1.685.930', 0.78], ['SEGMENTO LABORAL · RM', '162.780', 0.56]];
  emb.forEach(([k, v, f], i) => {
    const y = y0 + 0.34 + i * 0.88, w = lw * f;
    const hot = i === 2;
    caja(s, M, y, w, 0.76, hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } } : {});
    mono(s, k, { x: M + 0.15, y: y + 0.08, w: lw - 0.3, h: 0.2, fontSize: 7.5, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: M + 0.15, y: y + 0.28, w: w - 0.3, h: 0.44, fontSize: 24, valign: 'top' });
  });
  T(s, 'Taxis 22.838 · colectivos 12.982 · aplicaciones 126.960 (estimación propia).', { x: M, y: y0 + 2.98, w: lw, h: 0.45, fontSize: 10.5, color: C.text2 });
  regla(s, y0 + 3.5, M, lw);
  mono(s, 'ADOPCIÓN · MODELO DE BASS', { x: M, y: y0 + 3.6, w: lw, h: 0.22, fontSize: 8.5, color: C.accent1 });
  T(s, [{ text: '11,1% del segmento al año 5, ', options: { bold: true } }, { text: 'bajo el 16% de innovadores y adoptadores tempranos.', options: { color: C.text2 } }], { x: M, y: y0 + 3.86, w: lw, h: 0.5, fontSize: 11 });
  // gráfico: demanda, instalaciones propias y red
  const gx = M + lw + 0.45, gw = R - gx;
  mono(s, 'VEHÍCULOS POR AÑO · ESCENARIO BASE', { x: gx, y: y0, w: gw, h: 0.24, fontSize: 9, color: C.text1 });
  supuesto(s, 'ESTIMACIÓN · MODELO DE BASS', R - 2.6, y0 - 0.03, 2.6, { align: 'center' });
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
    { name: 'Kits vendidos a la red', labels: AÑOS, values: [0, 365, 1074, 3287, 7773] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 3.55, barDir: 'col', barGapWidthPct: 45, barOverlapPct: 0,
    chartColors: [HEX.accent5, HEX.accent1, HONDO], valAxisMinVal: 0, valAxisMaxVal: 8500, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;;', dataLabelFontSize: 8.5,
    catAxisLabelFontSize: 10.5, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 9.5, objectName: 'Pronóstico de ventas por año',
  }));
  T(s, [{ text: 'Pronóstico = el menor entre demanda y capacidad. ', options: { bold: true } }, { text: 'El límite es físico, técnicos y espacio: lo que los talleres propios no cubren lo instala la red.', options: { color: C.text2 } }], { x: gx, y: y0 + 3.95, w: gw, h: 0.45, fontSize: 11 });
  return s;
};

// =====================================================================
// 3.1.8 PRESUPUESTO DE MARKETING
// =====================================================================
D['presupuesto-mkt'] = () => {
  const s = contenido('08', 'PLAN DE MARKETING · PRESUPUESTO', '$80,9 MILLONES EL PRIMER AÑO:', 'el 6,8% de los ingresos.');
  const y0 = 2.55, lw = 7.7;
  mono(s, 'POR PARTIDA · MILLONES DE PESOS NETOS', { x: M, y: y0, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  supuesto(s, 'PAUTA: DECISIÓN DE INVERSIÓN', M + lw - 2.7, y0 - 0.03, 2.7, { align: 'center' });
  // Tabla N° 11 del informe, agrupada: clientes piloto, pauta digital, comisiones y el resto de las partidas
  s.addChart(pres.ChartType.bar, [
    { name: 'Clientes piloto', labels: AÑOS, values: [49.47, 23.75, 23.75, 23.75, 23.75] },
    { name: 'Pauta digital', labels: AÑOS, values: [14.40, 18.00, 24.00, 24.00, 30.00] },
    { name: 'Comisiones de venta', labels: AÑOS, values: [4.92, 15.58, 30.30, 42.45, 56.98] },
    { name: 'Otras partidas', labels: AÑOS, values: [12.15, 22.65, 38.22, 44.14, 52.96] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.3, w: lw + 0.1, h: 3.95, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 55,
    chartColors: [HEX.accent1, HONDO, HEX.dk2, HEX.accent5], valAxisMinVal: 0, valAxisMaxVal: 180, valAxisMajorUnit: 40,
    valAxisLabelFormatCode: '0', showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<7]"";0.0', dataLabelFontSize: 8.5, dataLabelColor: HEX.lt1, dataLabelFontBold: true,
    catAxisLabelFontSize: 10.5, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 9.5, objectName: 'Presupuesto de marketing por partida',
  }));
  // totales por año
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 4.25);
  visor(s, cx, y0, cw, 4.25);
  mono(s, 'TOTAL · MILLONES', { x: cx + 0.25, y: y0 + 0.18, w: 2.2, h: 0.22, fontSize: 8.5, color: C.accent1 });
  mono(s, '% INGRESOS', { x: cx + cw - 1.45, y: y0 + 0.18, w: 1.2, h: 0.22, fontSize: 7.5, align: 'right' });
  const tot = [['Año 1', '80,9', '6,8%'], ['Año 2', '80,0', '2,3%'], ['Año 3', '116,3', ''], ['Año 4', '134,3', ''], ['Año 5', '163,7', '1,5%']];
  tot.forEach(([a, v, p], i) => {
    const y = y0 + 0.5 + i * 0.47;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent6);
    T(s, a, { x: cx + 0.25, y, w: 1.0, h: 0.47, valign: 'middle', fontSize: 12.5 });
    T(s, v, { x: cx + 1.2, y, w: 1.15, h: 0.47, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 19, color: i === 0 ? C.accent1 : C.text1 });
    T(s, p || '—', { x: cx + cw - 1.3, y, w: 1.05, h: 0.47, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 15, color: p ? C.text1 : C.accent5 });
  });
  const gy = y0 + 0.5 + 5 * 0.47;
  linea(s, cx + 0.25, gy, cw - 0.5, 0, C.accent1, 1);
  T(s, 'Cinco años', { x: cx + 0.25, y: gy, w: 1.3, h: 0.5, valign: 'middle', fontSize: 13, bold: true });
  T(s, '575,2', { x: cx + 1.2, y: gy, w: 1.15, h: 0.5, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 21, color: C.accent1 });
  T(s, 'Por objetivo y tarea, no por porcentaje de ventas. El año 1 concentra el lanzamiento y 25 clientes piloto con 50% de descuento.', { x: cx + 0.25, y: gy + 0.58, w: cw - 0.5, h: 0.75, fontSize: 10, color: C.text2 });
  return s;
};

// =====================================================================
// 3.2.1 ESTRUCTURA Y DOTACIÓN
// =====================================================================
D.estructura = () => {
  const s = contenido('09', 'RECURSOS HUMANOS · ESTRUCTURA Y DOTACIÓN', 'CRECE EL NÚMERO DE PERSONAS,', 'no la estructura.');
  // organigrama dibujado con formas
  const ox = M, ow = 7.75, y0 = 2.55;
  mono(s, 'ORGANIGRAMA · PERSONAS AL ABRIR → AL CIERRE DEL AÑO 5', { x: ox, y: y0, w: ow, h: 0.24, fontSize: 9, color: C.text1 });
  const n = 5, gap = 0.13, bw = (ow - (n - 1) * gap) / n, bh = 0.92;
  const gw = 2.7, gx = ox + (ow - gw) / 2, gy = y0 + 0.36, gh = 0.62;
  cajaHot(s, gx, gy, gw, gh);
  T(s, [{ text: 'Gerencia General', options: { bold: true, breakLine: true } }, { text: '1 · depende de los accionistas', options: { color: C.accent1, fontSize: 9.5 } }], { x: gx, y: gy, w: gw, h: gh, align: 'center', valign: 'middle', fontSize: 12 });
  const ry = gy + gh + 0.42, busY = gy + gh + 0.2;
  linea(s, gx + gw / 2, gy + gh, 0, busY - gy - gh, C.text2, 0.75);
  linea(s, ox + bw / 2, busY, ow - bw, 0, C.text2, 0.75);
  const areas = [
    ['Responsable Técnico', '1 → 3 · uno por taller', false],
    ['Ingeniería de Calibración', '1 → 4', false],
    ['Comercial y Postventa', '1 → 4', false],
    ['Comercial de Empresas', '0 → 2 · desde el año 4', true],
    ['Administración y Personas', '1', false],
  ];
  areas.forEach(([t, d, fut], i) => {
    const x = ox + i * (bw + gap);
    linea(s, x + bw / 2, busY, 0, ry - busY, C.text2, 0.75, fut ? { line: { color: HEX.dk2, width: 0.75, dashType: 'dash' } } : {});
    if (fut) cajaFutura(s, x, ry, bw, bh); else caja(s, x, ry, bw, bh);
    T(s, t, { x: x + 0.06, y: ry + 0.08, w: bw - 0.12, h: 0.5, align: 'center', valign: 'middle', fontSize: 10.5, bold: true });
    T(s, d, { x: x + 0.06, y: ry + 0.58, w: bw - 0.12, h: 0.28, align: 'center', valign: 'middle', fontSize: 9, color: fut ? C.text2 : C.accent1 });
  });
  // segundo nivel
  const sy = ry + bh + 0.35, sh = 0.82;
  const sub = [[0, 'Técnicos instaladores', '2 → 36 · dos por dúo', false], [2, 'Asistente de Postventa', '0 → 4 · desde el año 3', true], [4, 'Asistente de Administración', '0 → 1 · desde el año 4', true]];
  sub.forEach(([i, t, d, fut]) => {
    const x = ox + i * (bw + gap);
    linea(s, x + bw / 2, ry + bh, 0, sy - ry - bh, C.text2, 0.75);
    if (fut) cajaFutura(s, x, sy, bw, sh); else caja(s, x, sy, bw, sh);
    T(s, t, { x: x + 0.06, y: sy + 0.06, w: bw - 0.12, h: 0.44, align: 'center', valign: 'middle', fontSize: 10, bold: true });
    T(s, d, { x: x + 0.06, y: sy + 0.5, w: bw - 0.12, h: 0.26, align: 'center', valign: 'middle', fontSize: 8.5, color: fut ? C.text2 : C.accent1 });
  });
  mono(s, 'LÍNEA PUNTEADA: INGRESA DESPUÉS DE LA APERTURA', { x: ox, y: sy + sh + 0.18, w: ow, h: 0.2, fontSize: 7.5 });
  T(s, 'Servicios externos: contabilidad, formación en alta tensión, mutualidad, asesoría legal, aduana y transporte de baterías.', { x: ox, y: sy + sh + 0.42, w: ow, h: 0.3, fontSize: 10, color: C.text2 });
  // gráfico: dotación al cierre de cada año
  const cx = ox + ow + 0.45, cw = R - cx;
  mono(s, 'DOTACIÓN AL CIERRE · PERSONAS', { x: cx, y: y0, w: cw, h: 0.24, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Técnicos', labels: ['Preap.', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], values: [2, 8, 14, 24, 26, 36] },
    { name: 'Resto del equipo', labels: ['Preap.', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], values: [3, 5, 7, 9, 14, 20] },
  ], Object.assign({}, ejes, {
    x: cx - 0.1, y: y0 + 0.3, w: cw + 0.1, h: 3.45, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 45,
    chartColors: [HEX.accent1, HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 60, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<4]"";0', dataLabelFontSize: 9, dataLabelColor: HEX.lt1, dataLabelFontBold: true,
    catAxisLabelFontSize: 9, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 9, objectName: 'Dotación al cierre de cada año',
  }));
  const tots = ['5', '13', '21', '33', '40', '56'];
  T(s, [{ text: 'Total: ', options: { color: C.text2 } }, { text: tots.join(' · '), options: { bold: true } }], { x: cx, y: y0 + 3.82, w: cw, h: 0.3, fontSize: 11.5 });
  T(s, 'El salto del año 3 es el segundo taller; desde el año 4 pesa la red.', { x: cx, y: y0 + 4.12, w: cw, h: 0.45, fontSize: 10, color: C.text2 });
  return s;
};

// =====================================================================
// 3.2.3 Y 3.2.4 POLÍTICA Y PRESUPUESTO DE RECURSOS HUMANOS
// =====================================================================
D.rrhh = () => {
  const s = contenido('10', 'RECURSOS HUMANOS · POLÍTICA Y PRESUPUESTO', 'TÉCNICOS FORMADOS EN CASA,', 'costo a la mitad.');
  const y0 = 2.55, lw = 6.3;
  mono(s, 'LUMINE HABILITA · 39 COMPETENCIAS · 13 MÓDULOS · 392 HORAS', { x: M, y: y0, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  T(s, 'N1 a N4: niveles de habilitación del técnico, de aprendiz a formador.', { x: M, y: y0 + 0.26, w: lw, h: 0.26, fontSize: 10.5, color: C.text2 });
  // escalera de niveles: renta bruta mensual y bono único al validar
  const niv = [
    ['N1', 'Acompaña', '$750.000', null],
    ['N2', 'Instala supervisado', '$850.000', '$200.000'],
    ['N3', 'Trabaja solo', '$1.000.000', '$300.000'],
    ['N4', 'Forma y valida', '$1.150.000', '$350.000'],
  ];
  const gap = 0.12, sw = (lw - 3 * gap) / 4, base = y0 + 3.45;
  niv.forEach(([k, d, r, b], i) => {
    const x = M + i * (sw + gap), h = 1.75 + i * 0.37, y = base - h, hot = i === 3;
    if (hot) cajaHot(s, x, y, sw, h); else caja(s, x, y, sw, h);
    tag(s, k, x + 0.15, y + 0.15, { off: i < 2 });
    T(s, d, { x: x + 0.15, y: y + 0.5, w: sw - 0.3, h: 0.45, fontSize: 11, bold: true });
    numero(s, r, { x: x + 0.15, y: y + h - 0.95, w: sw - 0.3, h: 0.4, fontSize: 19, valign: 'top', color: hot ? C.accent1 : C.text1 });
    mono(s, b ? 'BONO ' + b : 'SIN BONO', { x: x + 0.15, y: y + h - 0.5, w: sw - 0.3, h: 0.2, fontSize: 7, color: b ? C.accent1 : C.text2, charSpacing: 0.8 });
    mono(s, 'RENTA BRUTA', { x: x + 0.15, y: y + h - 0.28, w: sw - 0.3, h: 0.18, fontSize: 6.5, charSpacing: 0.8 });
  });
  const ny = base + 0.2;
  const notas = [['~8 MESES', 'hasta el N4, con dos meses de formación intensiva'], ['DÚOS FIJOS', 'siempre con un N3 o N4; dos N1 nunca forman dúo'], ['24 MESES', 'revalidación del núcleo de seguridad']];
  const nw = (lw - 0.4) / 3;
  notas.forEach(([k, d], i) => {
    const x = M + i * (nw + 0.2);
    regla(s, ny, x, nw);
    mono(s, k, { x, y: ny + 0.08, w: nw, h: 0.22, fontSize: 8.5, color: C.accent1 });
    T(s, d, { x, y: ny + 0.32, w: nw, h: 0.5, fontSize: 10, color: C.text2 });
  });
  // gráfico: costo empresa de la nómina
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'COSTO EMPRESA · MILLONES DE $', { x: gx, y: y0, w: gw, h: 0.24, fontSize: 9, color: C.text1 });
  supuesto(s, 'SIN REAJUSTES · SUPUESTO', R - 2.4, y0 - 0.03, 2.4, { align: 'center', size: 7.5 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Costo empresa', labels: AÑOS, values: [152.0, 265.6, 430.4, 574.7, 755.1] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 2.75, barDir: 'col', barGapWidthPct: 50,
    chartColors: [HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 860, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 10.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 10, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Costo empresa de la nómina por año',
  }));
  // costo por instalación propia, alineado bajo cada año
  const cy = y0 + 3.15;
  regla(s, cy, gx, gw, C.accent1);
  mono(s, 'COSTO DE NÓMINA POR INSTALACIÓN PROPIA', { x: gx, y: cy + 0.08, w: gw, h: 0.22, fontSize: 8.5, color: C.accent1 });
  const cpi = ['$508.307', '$305.608', '$257.099', '$253.417', '$264.857'];
  const plotX = gx + 0.12, plotW = gw - 0.2, colW = plotW / 5;
  cpi.forEach((v, i) => {
    numero(s, v, { x: plotX + i * colW, y: cy + 0.36, w: colW, h: 0.36, fontSize: 15, valign: 'top', align: 'center', color: i === 3 ? C.accent1 : C.text1 });
  });
  T(s, 'Los cargos fijos se reparten en más autos; el año 5 sube porque abre el tercer taller y la red pide más personas.', { x: gx, y: cy + 0.78, w: gw, h: 0.5, fontSize: 10, color: C.text2 });
  return s;
};

// =====================================================================
// 3.3.1 FLUJO OPERACIONAL
// =====================================================================
D.flujo = () => {
  const s = contenido('11', 'OPERACIONES · FLUJO OPERACIONAL', 'EL NEGOCIO MIDE Y RECOMIENDA;', 'el cliente decide.');
  const y0 = 2.5, n = 5, gap = 0.16, cw = (CW - (n - 1) * gap) / n;
  const etapas = ['CAPTACIÓN', 'ASESORÍA Y DECISIÓN', 'TALLER', 'CERTIFICACIÓN', 'POSTVENTA'];
  etapas.forEach((e, i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    s.addText('', { shape: i === 0 ? S.homePlate : S.chevron, x, y: y0, w: cw + (i < n - 1 ? 0.12 : 0), h: 0.42, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    T(s, [{ text: '0' + (i + 1) + '  ', options: { color: hot ? C.background1 : C.accent1 } }, { text: e }], { x: x + 0.22, y: y0, w: cw - 0.3, h: 0.42, valign: 'middle', fontFace: F_MONO, fontSize: 8.5, bold: true, color: hot ? C.background1 : C.text1, charSpacing: 1 });
  });
  const X = i => M + i * (cw + gap), bw = cw - 0.1, bx = i => X(i) + 0.05;
  const t0 = y0 + 0.55, bh = 0.55, rh = 0.62, gp = 0.13, ob = 0.48;
  // 1 · captación
  paso(s, 'Cotiza en el sitio: el estimador da ahorro y plazo', bx(0), t0, bw, bh);
  flecha(s, bx(0) + bw / 2, t0 + bh, 0, gp, C.text2, 1);
  rombo(s, '¿Modelo elegible y calibrado?', bx(0) + 0.1, t0 + bh + gp, bw - 0.2, rh);
  flecha(s, bx(0) + bw / 2, t0 + bh + gp + rh, 0, gp, C.accent3, 1);
  mono(s, 'NO', { x: bx(0) + bw / 2 + 0.06, y: t0 + bh + gp + rh, w: 0.4, h: 0.17, fontSize: 7, color: C.accent3 });
  paso(s, 'Ingeniería de Calibración (IC) registra la demanda; el primer cliente puede ser piloto', bx(0), t0 + bh + 2 * gp + rh, bw, 0.68, { alerta: true, size: 10 });
  mono(s, 'SÍ →', { x: bx(0) + bw - 0.45, y: t0 + bh + gp + 0.08, w: 0.5, h: 0.18, fontSize: 7.5, color: C.accent1, align: 'right' });
  // 2 · asesoría y decisión
  paso(s, 'Asesoría: ahorro, intervalo y plazo por versión', bx(1), t0, bw, bh);
  flecha(s, bx(1) + bw / 2, t0 + bh, 0, gp, C.text2, 1);
  paso(s, 'Opcional: mide una semana con su celular', bx(1), t0 + bh + gp, bw, ob, { futuro: true, size: 10 });
  const r2 = t0 + bh + gp + ob + gp;
  flecha(s, bx(1) + bw / 2, t0 + bh + gp + ob, 0, gp, C.text2, 1);
  rombo(s, '¿Decide instalar?', bx(1) + 0.1, r2, bw - 0.2, rh);
  flecha(s, bx(1) + bw / 2, r2 + rh, 0, gp, C.accent1, 1);
  mono(s, 'SÍ', { x: bx(1) + bw / 2 + 0.06, y: r2 + rh, w: 0.4, h: 0.17, fontSize: 7, color: C.accent1 });
  paso(s, 'Paga o financia; orden de trabajo y agenda', bx(1), r2 + rh + gp, bw, 0.55, { size: 10 });
  mono(s, 'NO: QUEDA INFORMADO', { x: bx(1), y: r2 + rh + gp + 0.58, w: bw, h: 0.18, fontSize: 7, align: 'center' });
  // 3 · taller
  paso(s, 'Instalación en una jornada de 8,4 h', bx(2), t0, bw, bh, { hot: true, bold: true });
  flecha(s, bx(2) + bw / 2, t0 + bh, 0, gp, C.text2, 1);
  mono(s, 'CUATRO PUNTOS DE CONTROL', { x: bx(2), y: t0 + bh + gp + 0.02, w: bw, h: 0.2, fontSize: 7.5, align: 'center', color: C.accent1 });
  ['Vehículo apto', 'Masa ≤ 20% y ejes ≤ 10%', 'Aislación ≥ 100 Ω/V', 'Dinamómetro: asistencia y regeneración'].forEach((p, k) => {
    const y = t0 + bh + gp + 0.28 + k * 0.4;
    s.addShape(S.diamond, { x: bx(2) + 0.08, y: y + 0.08, w: 0.2, h: 0.2, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, p, { x: bx(2) + 0.36, y, w: bw - 0.4, h: 0.36, valign: 'middle', fontSize: 9.5 });
  });
  mono(s, 'SI FALLA: SE DETIENE', { x: bx(2), y: t0 + bh + gp + 1.9, w: bw, h: 0.18, fontSize: 7, align: 'center', color: C.accent3 });
  // 4 · certificación
  paso(s, 'El Responsable Técnico (RT) firma el Certificado Individual (art. 14)', bx(3), t0, bw, bh);
  flecha(s, bx(3) + bw / 2, t0 + bh, 0, gp, C.text2, 1);
  paso(s, 'Entrega y línea base de ahorro', bx(3), t0 + bh + gp, bw, ob, { size: 10 });
  flecha(s, bx(3) + bw / 2, t0 + bh + gp + ob, 0, gp, C.text2, 1);
  paso(s, 'El cliente verifica en planta de revisión y anota la alteración en el registro (arts. 16 y 17)', bx(3), t0 + bh + 2 * gp + ob, bw, 0.72, { futuro: true, size: 10 });
  mono(s, 'BORDE PUNTEADO: TERCEROS U OPCIONAL', { x: bx(3), y: t0 + bh + 2 * gp + ob + 0.76, w: bw, h: 0.3, fontSize: 6.5, align: 'center', charSpacing: 0.6 });
  // 5 · postventa
  paso(s, 'Telemetría e informe de ahorro a los 3 meses', bx(4), t0, bw, bh);
  flecha(s, bx(4) + bw / 2, t0 + bh, 0, gp, C.text2, 1);
  rombo(s, '¿Desviación sobre el umbral?', bx(4) + 0.1, t0 + bh + gp, bw - 0.2, rh);
  flecha(s, bx(4) + bw / 2, t0 + bh + gp + rh, 0, gp, C.accent1, 1);
  mono(s, 'SÍ', { x: bx(4) + bw / 2 + 0.06, y: t0 + bh + gp + rh, w: 0.4, h: 0.17, fontSize: 7, color: C.accent1 });
  paso(s, 'Recalibra; IC ajusta la biblioteca', bx(4), t0 + bh + 2 * gp + rh, bw, ob, { size: 10 });
  flecha(s, bx(4) + bw / 2, t0 + bh + 2 * gp + rh + ob, 0, gp, C.text2, 1);
  paso(s, 'Mantención, garantía y batería a reciclaje (Ley REP)', bx(4), t0 + bh + 3 * gp + rh + ob, bw, 0.55, { size: 10 });
  // recursos críticos
  const by = 6.12, iw = (CW - 0.6) / 3;
  regla(s, by - 0.1, M, CW, C.accent1);
  const rc = [['HORAS DE DÚO', '8,4 h por vehículo: el límite de capacidad.'], ['DINAMÓMETRO', '1,0 h por vehículo: 54% de uso con seis dúos; uno basta.'], ['BIBLIOTECA', 'Restringe el surtido de modelos, no las horas.']];
  rc.forEach(([k, d], i) => {
    const x = M + i * (iw + 0.3);
    punto(s, x, by + 0.08, i === 0 ? C.accent1 : C.text2);
    mono(s, k, { x: x + 0.17, y: by, w: iw, h: 0.24, valign: 'middle', fontSize: 8.5, color: C.text1 });
    T(s, d, { x, y: by + 0.27, w: iw, h: 0.45, fontSize: 10.5, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.3.2 CARTA GANTT (línea de tiempo dibujada)
// =====================================================================
D.gantt = () => {
  const s = contenido('12', 'OPERACIONES · CARTA GANTT DE IMPLEMENTACIÓN', 'ABRIR EN ENERO DE 2027', 'depende de un reglamento.');
  // eje: meses −3 a 12 en detalle; años 2 a 5 por trimestre (31 columnas iguales)
  const x0 = 4.3, xw = R - x0, u = xw / 31;
  const P = m => x0 + u * (m < 0 ? m + 3 : m <= 13 ? m + 2 : 15 + (m - 13) / 3); // inicio del mes m (mes 1 = enero 2027)
  const top = 2.8, rh = 0.205, gapG = 0.07;
  const grupos = [
    ['PREAPERTURA', [
      ['Investigación de mercado', [['bar', -3, 1, 'p', 'terreno, piloto y encuesta']]],
      ['Local, permisos y financiamiento', [['bar', -3, 1, 'p', 'a cargo de los socios']]],
      ['Homologación del primer modelo', [['bar', -2, 1, 'p', 'con el auto del cliente piloto']]],
      ['Formación del primer dúo', [['bar', -2, 1, 'p']]],
      ['Reglamento de la Ley 21.793', [['star', -1, 'debe estar vigente antes de vender']]],
    ]],
    ['TALLER 1', [
      ['Apertura comercial', [['hito', 1, 'enero 2027']]],
      ['Formación y entrada de dúos', [['bar', 4, 6, 'o'], ['hito', 6, '2'], ['bar', 10, 12, 'o'], ['hito', 12, '3'], ['bar', 12, 14, 'o'], ['hito', 14, '4'], ['bar', 16, 18, 'o'], ['hito', 18, '5'], ['bar', 18, 20, 'o'], ['hito', 20, '6']]],
    ]],
    ['BIBLIOTECA Y RED', [
      ['Calibración de modelos', [['bar', 1, 13, 'p', 'dos al mes', true], ['bar', 13, 61, 'o', 'uno al mes', true]]],
      ['Red certificada', [['bar', 13, 61, 'p'], ['n', 25, '3'], ['n', 37, '9'], ['n', 49, '20'], ['n', 61, '42']]],
      ['Flotas y convenios con colectivos', [['bar', 25, 61, 'o', 'desde el año 3', true]]],
    ]],
    ['TALLERES 2 Y 3', [
      ['Taller 2', [['bar', 22, 25, 'a'], ['bar', 25, 37, 'o', '6 dúos al mes 36', true], ['hito', 25]]],
      ['Taller 3', [['bar', 46, 49, 'a'], ['bar', 49, 61, 'o', '6 dúos al mes 60', true], ['hito', 49]]],
    ]],
    ['EQUIPO', [
      ['Ingresos por carga de trabajo', [['dot', 29, 'As. de Postventa', 'l'], ['dot', 37, '2.ª persona en Calibración y As. de Administración', 'b'], ['dot', 46, 'Com. de Empresas', 'r']]],
      ['', []],
    ]],
  ];
  const nFilas = grupos.reduce((a, g) => a + g[1].length, 0);
  const bottom = top + nFilas * rh + (grupos.length - 1) * gapG;
  // encabezado de años y separadores
  [['2026', -3, 1], ['AÑO 1 · 2027 (MESES)', 1, 13], ['AÑO 2', 13, 25], ['AÑO 3', 25, 37], ['AÑO 4', 37, 49], ['AÑO 5', 49, 61]].forEach(([t, a, b], i) => {
    mono(s, t, { x: P(a), y: top - 0.3, w: P(b) - P(a), h: 0.22, fontSize: 8, align: 'center', color: i === 1 ? C.accent1 : C.text1 });
    if (i > 0) linea(s, P(a), top - 0.06, 0, bottom - top + 0.12, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  // eje inferior: meses y trimestres
  const meses = ['oct', 'nov', 'dic', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  for (let c = 0; c < 31; c++) {
    const l = c < 15 ? meses[c] : 'T' + ((c - 15) % 4 + 1);
    mono(s, l, { x: x0 + c * u, y: bottom + 0.1, w: u, h: 0.18, fontSize: 6, align: 'center', charSpacing: 0 });
  }
  // filas
  let y = top;
  const col = { p: C.accent1, o: '1D4F66', a: C.accent3 };
  grupos.forEach(([g, filas], gi) => {
    if (gi) { regla(s, y + gapG / 2 - 0.01, M, CW, C.accent6); y += gapG; }
    mono(s, g, { x: M, y, w: 1.3, h: filas.length * rh, fontSize: 7.5, color: C.accent1, valign: filas.length > 1 ? 'top' : 'middle', charSpacing: 1 });
    filas.forEach(([nom, items]) => {
      if (nom) T(s, nom, { x: M + 1.2, y, w: x0 - M - 1.32, h: rh, align: 'right', valign: 'middle', fontSize: 9 });
      items.forEach(it => {
        const cy = y + rh / 2;
        if (it[0] === 'bar') {
          const [, a, b, c, txt, dentro] = it, bx = P(a), bw = P(b) - P(a);
          s.addShape(S.rect, { x: bx, y: y + 0.035, w: bw, h: rh - 0.07, fill: { color: col[c] }, line: { type: 'none' } });
          if (txt && dentro) T(s, txt, { x: bx, y, w: bw, h: rh, align: 'center', valign: 'middle', fontSize: 8, bold: true, color: c === 'p' ? C.background1 : C.text1 });
          else if (txt) T(s, txt, { x: bx + bw + 0.08, y, w: 3.2, h: rh, valign: 'middle', fontSize: 8.5, color: C.text2 });
        } else if (it[0] === 'hito') {
          const [, m, txt] = it, hx = P(m);
          s.addShape(S.diamond, { x: hx - 0.08, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: C.text1 }, line: { color: C.background1, width: 0.5 } });
          if (txt && txt.length > 2) T(s, txt, { x: hx + 0.14, y, w: 1.6, h: rh, valign: 'middle', fontSize: 8.5, color: C.text2 });
          else if (txt) mono(s, txt, { x: hx - 0.2, y: y - 0.16, w: 0.4, h: 0.16, fontSize: 7, align: 'center', color: C.text1 });
        } else if (it[0] === 'star') {
          const [, m, txt] = it, hx = P(m) + u / 2;
          s.addShape(S.star5, { x: hx - 0.11, y: cy - 0.11, w: 0.22, h: 0.22, fill: { color: C.accent3 }, line: { type: 'none' } });
          T(s, txt, { x: hx + 0.18, y, w: 3.4, h: rh, valign: 'middle', fontSize: 8.5, color: C.accent3, bold: true });
        } else if (it[0] === 'n') {
          const [, m, txt] = it;
          mono(s, txt, { x: P(m) - 0.45, y, w: 0.4, h: rh, fontSize: 7.5, align: 'right', valign: 'middle', color: C.background1, bold: true });
        } else if (it[0] === 'dot') {
          const [, m, txt, lado] = it, hx = P(m);
          s.addShape(S.ellipse, { x: hx - 0.06, y: cy - 0.06, w: 0.12, h: 0.12, fill: { color: C.accent1 }, line: { type: 'none' } });
          if (lado === 'l') T(s, txt, { x: hx - 1.5, y, w: 1.4, h: rh, align: 'right', valign: 'middle', fontSize: 8, color: C.text2 });
          else if (lado === 'b') T(s, txt, { x: hx - 1.4, y: y + rh * 0.8, w: 2.8, h: rh, align: 'center', valign: 'middle', fontSize: 8, color: C.text2 });
          else T(s, txt, { x: hx + 0.1, y, w: 1.3, h: rh, valign: 'middle', fontSize: 8, color: C.text2 });
        }
      });
      y += rh;
    });
  });
  // leyenda
  const ly = bottom + 0.38;
  const ley = [['rect', C.accent1, 'Actividad principal'], ['rect', '1D4F66', 'Operación o continuidad'], ['rect', C.accent3, 'Preapertura de taller'], ['diamond', C.text1, 'Hito'], ['star5', C.accent3, 'Hito crítico'], ['ellipse', C.accent1, 'Ingreso de personal']];
  let lx = M;
  ley.forEach(([sh, c, t]) => {
    s.addShape(S[sh], { x: lx, y: ly + 0.04, w: 0.14, h: 0.14, fill: { color: c }, line: { type: 'none' } });
    mono(s, t, { x: lx + 0.2, y: ly, w: 2.0, h: 0.22, fontSize: 7.5, valign: 'middle', charSpacing: 0.8 });
    lx += 2.02;
  });
  return s;
};

// =====================================================================
// 3.3.3 PRESUPUESTO DE OPERACIONES
// =====================================================================
D['presupuesto-ops'] = () => {
  const s = contenido('13', 'OPERACIONES · PRESUPUESTO Y RESULTADO', 'GANANCIA DESDE EL AÑO 2;', 'el riesgo es el dólar.');
  const y0 = 2.55, lw = 7.4;
  mono(s, 'RESULTADO REFERENCIAL POR LÍNEA · MILLONES DE PESOS', { x: M, y: y0, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Línea propia', labels: AÑOS, values: [-130.2, 159.9, 444.8, 694.7, 869.9] },
    { name: 'Red certificada', labels: AÑOS, values: [0, 142.1, 415.2, 1233.2, 2889.5] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.3, w: lw + 0.1, h: 3.45, barDir: 'col', barGapWidthPct: 50,
    chartColors: [HEX.accent1, HONDO], valAxisMinVal: -400, valAxisMaxVal: 3200, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0.0;-#,##0.0;;', dataLabelFontSize: 9.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 10.5, catAxisLabelColor: HEX.dk1, catAxisLabelPos: 'low', showLegend: true, legendPos: 't', objectName: 'Resultado referencial por línea de negocio',
  }));
  T(s, [{ text: 'Margen de la línea propia: ', options: { color: C.text2 } }, { text: '−11,0% · 4,6% · 6,7% · 7,7% · 7,7%', options: { bold: true } }, { text: '. La red rinde cerca de 10%.', options: { color: C.text2 } }], { x: M, y: y0 + 3.85, w: lw, h: 0.3, fontSize: 11 });
  supuesto(s, 'CÁLCULO REFERENCIAL: SIN IMPUESTOS, DEPRECIACIÓN NI FINANCIAMIENTO · 60% PLUS (SUPUESTO)', M, y0 + 4.12, lw, { size: 7.5, h: 0.24 });
  // inversión, gasto y sensibilidad al dólar
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 1.55);
  mono(s, 'INVERSIÓN POR LOCAL · SEIS PUESTOS', { x: cx + 0.22, y: y0 + 0.15, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  numero(s, '$81,3 M', { x: cx + 0.22, y: y0 + 0.38, w: 2.2, h: 0.6, fontSize: 32, valign: 'top' });
  T(s, 'Casi la mitad es el dinamómetro: $36,7 M. El kit es más del 90% del gasto operacional.', { x: cx + 2.35, y: y0 + 0.42, w: cw - 2.55, h: 1.0, fontSize: 10.5, color: C.text2 });
  const sy = y0 + 1.8;
  caja(s, cx, sy, cw, 2.45);
  visor(s, cx, sy, cw, 2.45);
  mono(s, 'RESULTADO PROPIO DEL AÑO 5 SEGÚN EL DÓLAR', { x: cx + 0.22, y: sy + 0.15, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  const sen = [['Dólar −10%', 1646.9, '14,6%'], ['Base: $965,71', 869.9, '7,7%'], ['Dólar +10%', 92.9, '0,8%']];
  const bx = cx + 1.55, bmax = cw - 2.95;
  sen.forEach(([k, v, m], i) => {
    const y = sy + 0.5 + i * 0.47;
    T(s, k, { x: cx + 0.22, y, w: 1.3, h: 0.42, valign: 'middle', fontSize: 10.5 });
    s.addShape(S.rect, { x: bx, y: y + 0.1, w: Math.max(0.04, bmax * v / 1646.9), h: 0.22, fill: { color: i === 2 ? C.accent4 : i === 1 ? C.accent1 : C.text2 }, line: { type: 'none' } });
    T(s, dec(v), { x: bx + bmax * v / 1646.9 + 0.08, y, w: 1.0, h: 0.42, valign: 'middle', fontFace: F_CON, bold: true, fontSize: 14 });
    mono(s, m, { x: cx + cw - 0.75, y, w: 0.55, h: 0.42, valign: 'middle', align: 'right', fontSize: 8.5 });
  });
  T(s, 'Cerca del 82% del costo del kit se paga en dólares; la red traslada la variación al taller.', { x: cx + 0.22, y: sy + 1.95, w: cw - 0.44, h: 0.42, fontSize: 9.5, color: C.text2 });
  return s;
};

// =====================================================================
// 3.4 CONCLUSIONES
// =====================================================================
D.conclusiones = () => {
  const s = contenido('14', 'CONCLUSIONES DEL CAPÍTULO', 'TRES CONCLUSIONES', 'y dos preguntas por resolver.');
  // tres conclusiones (guía: qué queda fundamentado), cada una con su cifra de respaldo
  const y0 = 2.55, n = 3, gap = 0.25, cw = (CW - (n - 1) * gap) / n, ch = 2.0;
  const cc = [
    ['LA OPORTUNIDAD EXISTE', '367 > 299', 'demanda atendible frente a instalaciones del año 1', 'Hay más demanda que capacidad desde el primer año: el crecimiento depende de técnicos y espacio.'],
    ['HAY ESPACIO COMPETITIVO', 'ÚNICA', 'alternativa que ahorra sin cambiar de auto ni límite de antigüedad', 'La red vende la calibración mientras sigue siendo exclusiva: 42 talleres al año 5.'],
    ['UN MISMO GATILLO', '80%', 'de la capacidad, dos meses seguidos', 'Suma un dúo, contrata cuando la carga lo justifica y abre un taller; cada línea gana desde el año 2.'],
  ];
  cc.forEach(([k, v, u, d], i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    tag(s, '0' + (i + 1), x + 0.2, y0 + 0.18);
    mono(s, k, { x: x + 0.68, y: y0 + 0.18, w: cw - 0.85, h: 0.27, valign: 'middle', fontSize: 9, color: hot ? C.accent1 : C.text1 });
    numero(s, v, { x: x + 0.2, y: y0 + 0.52, w: cw - 0.4, h: 0.6, fontSize: 36, valign: 'top', color: hot ? C.accent1 : C.text1 });
    mono(s, u.toUpperCase(), { x: x + 0.2, y: y0 + 1.1, w: cw - 0.4, h: 0.32, fontSize: 7, charSpacing: 0.8 });
    T(s, d, { x: x + 0.2, y: y0 + 1.4, w: cw - 0.4, h: 0.56, fontSize: 11 });
  });
  // hoja de ruta en tres tramos
  const ry = y0 + ch + 0.18;
  mono(s, 'HOJA DE RUTA A CINCO AÑOS', { x: M, y: ry, w: 5, h: 0.22, fontSize: 9, color: C.text1 });
  const tr = [['AÑO 1 · PROBAR', '299 instalaciones, 3 casos medidos y 2 modelos calibrados al mes.'], ['AÑOS 2 Y 3 · SUMAR LA RED', 'Regiones con ingresos recurrentes y el segundo taller propio.'], ['AÑOS 4 Y 5 · ESCALAR', 'Tres talleres propios, 42 certificados y 56 personas.']];
  const tw = (CW - 0.3) / 3, tyy = ry + 0.28;
  tr.forEach(([a, d], i) => {
    const x = M + i * (tw + 0.15);
    s.addText('', { shape: i === 0 ? S.homePlate : S.chevron, x, y: tyy, w: tw + 0.12, h: 0.34, fill: { color: i === 0 ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    mono(s, a, { x: x + 0.25, y: tyy, w: tw - 0.4, h: 0.34, valign: 'middle', fontSize: 8.5, bold: true, color: i === 0 ? C.background1 : C.text1 });
    T(s, d, { x, y: tyy + 0.4, w: tw - 0.15, h: 0.42, fontSize: 10.5, color: C.text2 });
  });
  // supuestos críticos como preguntas (guía: no como debilidades)
  const qy = 6.08;
  regla(s, qy - 0.1, M, CW, C.accent3);
  mono(s, 'POR RESOLVER EN LAS FASES SIGUIENTES', { x: M, y: qy, w: 5, h: 0.24, fontSize: 8.5, color: C.accent3 });
  const qq = ['¿El reglamento de la Ley 21.793 admitirá el kit aditivo, y desde cuándo?', '¿El ahorro medido y la encuesta confirman los precios y el 60% de Plus?'];
  const qw = (CW - 3.0) / 2;
  qq.forEach((q, i) => {
    const x = M + i * (qw + 0.3);
    T(s, q, { x, y: qy + 0.26, w: qw, h: 0.52, fontFace: F_SER, italic: true, fontSize: 15, color: C.text1 });
  });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 2.5, y: qy + 0.3, w: 2.5, h: 0.4, valign: 'middle', align: 'right', fontSize: 10.5, color: C.accent1 });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces
// =====================================================================
D.indice = (primera) => {
  const s = contenido('A', 'MATERIAL DE APOYO', 'ANEXO', 'para preguntas.');
  T(s, 'Estas diapositivas no se presentan. Si una pregunta toca uno de estos temas, se hace clic en él y se salta directo.', { x: M, y: 2.5, w: CW, h: 0.35, fontSize: 14, color: C.text2 });
  const colW = (CW - 0.5) / 2, rowH = 0.7, y0 = 3.1, porCol = Math.ceil(G.ANEXO.length / 2);
  G.ANEXO.forEach((a, i) => {
    const c = i < porCol ? 0 : 1, r = i % porCol, x = M + c * (colW + 0.5), y = y0 + r * rowH, n = primera + i;
    regla(s, y, x, colW);
    tag(s, a.codigo, x, y + 0.21, { w: 0.5 });
    s.addText(a.titulo, { x: x + 0.7, y, w: colW - 2.45, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 15.5, color: C.text1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('DIAPOSITIVA ' + n + ' →', { x: x + colW - 1.75, y, w: 1.75, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 8.5, color: C.accent1, charSpacing: 1.5, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    if (r === porCol - 1 || i === G.ANEXO.length - 1) regla(s, y + rowH, x, colW);
  });
  return s;
};

// A1 · hipótesis de la investigación (Tabla N° 3)
D['a-hipotesis'] = () => {
  const s = contenido('', 'INVESTIGACIÓN DE MERCADO · HIPÓTESIS', 'SEIS HIPÓTESIS', 'y su prueba.');
  const h = [
    ['H1', 'La intención de compra es mayor en el uso laboral que en el particular.', 'Z DE DOS PROPORCIONES'],
    ['H2', 'La intención no varía según edad ni género (se sostiene si no se rechaza H₀).', 'CHI-CUADRADO'],
    ['H3', 'El ahorro predomina, pero la mayoría de los interesados valora además otro motivo.', 'Z DE UNA PROPORCIÓN'],
    ['H4', 'La barrera principal es la confianza (daño, revisión técnica o seguro), no el precio.', 'Z DE UNA PROPORCIÓN'],
    ['H5', 'Los respaldos externos verificables generan más confianza que los atributos del taller.', 'T PARA MUESTRAS RELACIONADAS'],
    ['H6', 'Se prefiere hibridar antes que convertir a gas, cambiar de auto o no hacer nada.', 'Z DE UNA PROPORCIÓN'],
  ];
  const rh = 0.52, y0 = 2.6;
  mono(s, 'HIPÓTESIS', { x: M + 0.7, y: y0, w: 6, h: 0.22, fontSize: 8.5, color: C.text1 });
  mono(s, 'PRUEBA', { x: R - 3.2, y: y0, w: 3.2, h: 0.22, fontSize: 8.5, align: 'right', color: C.text1 });
  h.forEach(([k, t, p], i) => {
    const y = y0 + 0.3 + i * rh;
    regla(s, y, M, CW);
    tag(s, k, M, y + 0.15, { w: 0.48 });
    T(s, t, { x: M + 0.7, y, w: CW - 4.2, h: rh, valign: 'middle', fontSize: 13 });
    chip(s, p, R - 3.0, y + 0.12, 3.0, C.accent1, { align: 'center' });
  });
  regla(s, y0 + 0.3 + h.length * rh, M, CW);
  T(s, 'Significancia de 5%. Con una muestra por cuotas, no probabilística, los resultados son indicativos. La proporción de uso laboral que responda «definitivamente lo instalaría» se contrasta con los umbrales de 67%, 59% y 40% de la proyección.', { x: M, y: 6.15, w: CW, h: 0.6, fontSize: 11, color: C.text2 });
  return s;
};

// A2 · dudas del cliente (Tabla N° 4) y límites de la promesa
D['a-dudas'] = () => {
  const s = contenido('', 'POSICIONAMIENTO · DUDAS DEL CLIENTE', 'CUATRO DUDAS,', 'cuatro respaldos.');
  const d = [
    ['¿Funciona?', 'Hasta 20% menos bencina en ciudad con Plus y hasta 15% con Esencial, estimado antes de pagar.', 'Estimador con intervalo, medición opcional de una semana y telemetría.'],
    ['¿Le hace daño a mi auto?', 'No reemplaza el motor ni toca la transmisión ni la alimentación.', 'Se conservan el circuito hidráulico y el ABS; garantía del taller (art. 18).'],
    ['¿Pasa la revisión técnica?', 'El auto sale del taller con certificado.', 'Firmado por el RT y verificado en planta (arts. 14 y 16), sujeto al reglamento.'],
    ['¿Hay que enchufarlo?', 'No.', 'La batería se carga con el frenado.'],
  ];
  const n = 4, gap = 0.22, cw = (CW - (n - 1) * gap) / n, y0 = 2.55, ch = 2.85;
  d.forEach(([q, r, b], i) => {
    const x = M + i * (cw + gap);
    caja(s, x, y0, cw, ch);
    T(s, q, { x: x + 0.2, y: y0 + 0.16, w: cw - 0.4, h: 0.72, fontFace: F_SER, italic: true, fontSize: 19, color: C.accent1, valign: 'top' });
    T(s, r, { x: x + 0.2, y: y0 + 0.98, w: cw - 0.4, h: 0.88, fontSize: 11.5, bold: true });
    regla(s, y0 + 1.9, x + 0.2, cw - 0.4);
    mono(s, 'RESPALDO', { x: x + 0.2, y: y0 + 1.98, w: cw - 0.4, h: 0.2, fontSize: 7.5, color: C.accent1 });
    T(s, b, { x: x + 0.2, y: y0 + 2.2, w: cw - 0.4, h: 0.6, fontSize: 10, color: C.text2 });
  });
  const ly = 5.7;
  mono(s, 'LÍMITES DE LA PROMESA · LO QUE LA MARCA NO DICE', { x: M, y: ly, w: 6, h: 0.22, fontSize: 8.5, color: C.accent3 });
  const lim = ['«CERO EMISIONES»', '«ECOLÓGICO»', '«20% GARANTIZADO»', '«HOMOLOGADO» SIN REGLAMENTO', 'EXENCIÓN DE RESTRICCIÓN VEHICULAR'];
  const lw = [1.8, 1.3, 1.85, 2.8, 3.3];
  let x = M;
  lim.forEach((t, i) => { chip(s, t, x, ly + 0.32, lw[i], C.accent4); x += lw[i] + 0.14; });
  T(s, 'Protegen la credibilidad y evitan la publicidad engañosa que sanciona la Ley N° 19.496.', { x: M, y: ly + 0.72, w: CW, h: 0.3, fontSize: 10.5, color: C.text2 });
  return s;
};

// A3 · mezcla de marketing (Tabla N° 8)
D['a-mix'] = () => {
  const s = contenido('', 'MIX DE MARKETING · RESUMEN', 'DOS LÍNEAS,', 'una misma mezcla.');
  const filas = [
    ['PRODUCTO', 'Kit Esencial o Plus certificado en una jornada; servicios incluidos; traslado y desinstalación con cargo.', 'Licencia de patrones, kits, certificación anual y formación en Habilita.'],
    ['PRECIO', '$4.290.000 y $4.990.000 con IVA, de referencia; cuotas con convenio.', 'Paquete de entrada y cobros recurrentes por kit, certificación y técnico.'],
    ['PLAZA', 'Canal digital y talleres propios en la Región Metropolitana.', 'Talleres con exclusividad comunal en las regiones.'],
    ['PROMOCIÓN', 'Estimador, demostraciones, clientes piloto, casos medidos, referidos y mecánicos.', 'Visitas, ferias del rubro y casos de la red.'],
    ['PERSONAS, PROCESOS Y EVIDENCIA', 'Dúos con N3 o N4; flujo de cinco etapas; certificado, sello e informe de ahorro.', 'Técnicos validados por Lumine; proceso auditado cada año; sello de taller certificado.'],
  ];
  const kx = M, kw = 2.6, c1 = kx + kw + 0.2, cw = (R - c1 - 0.3) / 2, c2 = c1 + cw + 0.3, y0 = 2.55, rh = 0.78;
  mono(s, 'INSTALACIÓN AL CLIENTE FINAL', { x: c1, y: y0, w: cw, h: 0.22, fontSize: 8.5, color: C.accent1 });
  mono(s, 'RED CERTIFICADA', { x: c2, y: y0, w: cw, h: 0.22, fontSize: 8.5, color: C.accent1 });
  filas.forEach(([k, a, b], i) => {
    const y = y0 + 0.32 + i * rh;
    regla(s, y, M, CW);
    tag(s, '0' + (i + 1), kx, y + 0.12);
    mono(s, k, { x: kx + 0.5, y: y + 0.1, w: kw - 0.5, h: rh - 0.2, fontSize: 8.5, color: C.text1 });
    T(s, a, { x: c1, y: y + 0.1, w: cw, h: rh - 0.15, fontSize: 11.5 });
    T(s, b, { x: c2, y: y + 0.1, w: cw, h: rh - 0.15, fontSize: 11.5, color: C.text2 });
  });
  regla(s, y0 + 0.32 + filas.length * rh, M, CW);
  return s;
};

// A4 · cobros a la red (Tabla N° 7)
D['a-red'] = () => {
  const s = contenido('', 'MIX · PRECIO PARA LA RED', 'INGRESO RECURRENTE:', 'el 96% del margen al año 5.');
  const t = [
    ['PAQUETE DE ENTRADA', '$7.140.000', 'UNA VEZ', 'Exclusividad comunal, formación de dos técnicos y certificación del primer año: 15% menos que sus partes.'],
    ['KIT CON LICENCIA', '$3.808.783', 'POR INSTALACIÓN', 'Plus; Esencial a $3.328.153. Kit al costo más 6% de manejo y licencia de $200.000 o $300.000.'],
    ['CERTIFICACIÓN', '$2.400.000', 'ANUAL, DESDE EL AÑO 2', 'Renovación de la certificación del proceso, auditado cada año.'],
    ['LUMINE HABILITA', '$35.000', 'MENSUAL, POR TÉCNICO', 'Suscripción a la plataforma de formación y validación.'],
  ];
  const n = 4, gap = 0.22, cw = (CW - (n - 1) * gap) / n, y0 = 2.55, ch = 2.65;
  t.forEach(([k, v, f, d], i) => {
    const x = M + i * (cw + gap);
    if (i === 1) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    mono(s, k, { x: x + 0.2, y: y0 + 0.17, w: cw - 0.4, h: 0.22, fontSize: 8.5, color: C.accent1 });
    numero(s, v, { x: x + 0.2, y: y0 + 0.45, w: cw - 0.4, h: 0.6, fontSize: 30, valign: 'top' });
    mono(s, f, { x: x + 0.2, y: y0 + 1.07, w: cw - 0.4, h: 0.2, fontSize: 7.5 });
    regla(s, y0 + 1.37, x + 0.2, cw - 0.4, C.accent6);
    T(s, d, { x: x + 0.2, y: y0 + 1.47, w: cw - 0.4, h: 1.1, fontSize: 10.5, color: C.text2 });
  });
  const by = 5.55, bw = (CW - 0.3) / 2;
  [['POR KIT, AL PRECIO DE REFERENCIA', 'Al taller le quedan $276.889 (Esencial) y $384.494 (Plus) para su jornada y su margen; a Lumine, $377.065 y $498.610.'],
   ['AL QUINTO AÑO', '42 talleres y 7.773 kits, 2,7 veces las instalaciones propias, sin activos fijos.']].forEach(([k, d], i) => {
    const x = M + i * (bw + 0.3);
    regla(s, by, x, bw);
    punto(s, x, by + 0.17);
    mono(s, k, { x: x + 0.17, y: by + 0.08, w: bw - 0.2, h: 0.24, valign: 'middle', fontSize: 8.5, color: C.text1 });
    T(s, d, { x, y: by + 0.38, w: bw, h: 0.6, fontSize: 11.5, color: C.text2 });
  });
  return s;
};

// A5 · tamaño del mercado y adopción
D['a-mercado'] = () => {
  const s = contenido('', 'DEMANDA · MERCADO Y ADOPCIÓN', '162.780 VEHÍCULOS DE TECHO;', '11,1% adoptado al año 5.');
  const y0 = 2.55, lw = 5.6;
  mono(s, 'SEGMENTO LABORAL · REGIÓN METROPOLITANA', { x: M, y: y0, w: lw, h: 0.22, fontSize: 9, color: C.text1 });
  const seg = [['Conductores de aplicación', 126960, 'Estimación propia'], ['Taxis básicos y de turismo', 22838, 'INE (2025)'], ['Taxis colectivos', 12982, 'INE (2025)']];
  seg.forEach(([k, v, f], i) => {
    const y = y0 + 0.35 + i * 0.72;
    T(s, k, { x: M, y, w: 3.2, h: 0.28, fontSize: 12, bold: true });
    mono(s, f, { x: M, y: y + 0.28, w: 3.2, h: 0.2, fontSize: 7.5 });
    s.addShape(S.rect, { x: M, y: y + 0.5, w: Math.max(0.05, (lw - 1.3) * v / 126960), h: 0.12, fill: { color: i === 0 ? C.accent1 : C.text2 }, line: { type: 'none' } });
    numero(s, miles(v), { x: M + lw - 1.3, y: y + 0.18, w: 1.3, h: 0.45, fontSize: 20, align: 'right', valign: 'top' });
  });
  regla(s, y0 + 2.6, M, lw, C.accent1);
  T(s, [{ text: 'Total  ', options: { bold: true } }, { text: '162.780', options: { fontFace: F_CON, bold: true, fontSize: 22, color: C.accent1 } }], { x: M, y: y0 + 2.66, w: lw, h: 0.45, valign: 'middle', fontSize: 13 });
  T(s, 'Aplicaciones: 136.000 conductores de Uber y 115.000 de inDrive; DiDi y Cabify al 60% del promedio (supuesto). 401.600 cuentas ÷ 1,217 = 329.992 conductores; 38,47% en la RM.', { x: M, y: y0 + 3.2, w: lw, h: 0.9, fontSize: 10, color: C.text2 });
  // gráfico: adopción acumulada (Bass)
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'ADOPCIÓN ACUMULADA · BASS · p = 0,0026 · q = 0,709', { x: gx, y: y0, w: gw, h: 0.22, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.line, [
    { name: 'Adopción acumulada', labels: AÑOS, values: [0.0038, 0.0114, 0.0265, 0.0560, 0.1108] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 3.0, chartColors: [HEX.accent1], lineSize: 2.5, lineDataSymbol: 'circle', lineDataSymbolSize: 8,
    valAxisMinVal: 0, valAxisMaxVal: 0.14, valAxisMajorUnit: 0.04, valAxisLabelFormatCode: '0%',
    showValue: true, dataLabelPosition: 't', dataLabelFormatCode: '0.0%', dataLabelFontSize: 10, dataLabelFontBold: true,
    catAxisLabelFontSize: 10, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Adopción acumulada del segmento laboral',
  }));
  T(s, [{ text: 'Bajo el 16% de innovadores y adoptadores tempranos. ', options: { bold: true } }, { text: 'Si solo el 67%, 59% o 40% del segmento fuera adoptante, la demanda aún cubriría la capacidad de los años 3, 4 y 5.', options: { color: C.text2 } }], { x: gx, y: y0 + 3.4, w: gw, h: 0.75, fontSize: 11 });
  return s;
};

// A6 · perfiles de cargo (Tabla N° 13)
D['a-perfiles'] = () => {
  const s = contenido('', 'RECURSOS HUMANOS · PERFILES DE CARGO', 'CADA CARGO RESPONDE', 'por un resultado crítico.');
  const p = [
    ['Gerente General', 'Accionistas', 'Autorizar cada paso de crecimiento solo si la caja cubre nómina, kits e importaciones.'],
    ['Responsable Técnico', 'Gerencia', 'Armar los dúos, validar ascensos y firmar cada vehículo certificado.'],
    ['Ingeniería de Calibración', 'Gerencia', 'Certificado de aptitud del Centro de Control y Certificación Vehicular (3CV) por modelo y ahorro real dentro del intervalo.'],
    ['Comercial y Postventa', 'Gerencia', 'Convertir cotizaciones en instalaciones sin prometer más ahorro que el estimador.'],
    ['Administración y Personas', 'Gerencia', 'Que ninguna instalación espere un kit y que remuneraciones y cotizaciones estén al día.'],
    ['Técnico Instalador (N1 a N4)', 'Responsable Técnico', 'Cada instalación según el procedimiento, con las cinco reglas de oro en alta tensión.'],
    ['Comercial de Empresas', 'Gerencia', 'Incorporar solo talleres que cumplan el reglamento y la cláusula comunal.'],
    ['Asistente de Postventa', 'Comercial y Postventa', 'Que ninguna mantención ni garantía se pierda por falta de aviso o registro.'],
    ['Asistente de Administración', 'Administración', 'Despachar cada kit y batería con trazabilidad y documentación de carga peligrosa.'],
  ];
  const y0 = 2.55, rh = 0.44, c1 = M + 3.0, c2 = c1 + 2.25;
  mono(s, 'CARGO', { x: M, y: y0, w: 2.8, h: 0.22, fontSize: 8, color: C.text1 });
  mono(s, 'DEPENDE DE', { x: c1, y: y0, w: 2, h: 0.22, fontSize: 8, color: C.text1 });
  mono(s, 'RESPONSABILIDAD CRÍTICA', { x: c2, y: y0, w: 5, h: 0.22, fontSize: 8, color: C.text1 });
  p.forEach(([c, d, r], i) => {
    const y = y0 + 0.28 + i * rh;
    regla(s, y, M, CW, C.accent6);
    punto(s, M, y + rh / 2 - 0.04, i === 5 ? C.accent1 : C.text2);
    T(s, c, { x: M + 0.18, y, w: c1 - M - 0.25, h: rh, valign: 'middle', fontSize: 11.5, bold: true });
    T(s, d, { x: c1, y, w: 2.15, h: rh, valign: 'middle', fontSize: 10.5, color: C.accent1 });
    T(s, r, { x: c2, y, w: R - c2, h: rh, valign: 'middle', fontSize: 10.5, color: C.text2 });
  });
  regla(s, y0 + 0.28 + p.length * rh, M, CW, C.accent6);
  return s;
};

// A7 · rentas (Tabla N° 14) y bonos (Tabla N° 15)
D['a-rentas'] = () => {
  const s = contenido('', 'RECURSOS HUMANOS · COMPENSACIONES', 'EL SUPERIOR GANA MÁS;', 'entre áreas decide la escasez.');
  const y0 = 2.55, lw = 8.0;
  mono(s, 'RENTA BRUTA MENSUAL · MILES DE PESOS · OCTUBRE 2026', { x: M, y: y0, w: lw, h: 0.22, fontSize: 9, color: C.text1 });
  const cargos = ['Gerente General', 'Responsable Técnico', 'Ingeniería de Calibración', 'Técnico N4', 'Técnico N3', 'Administración y Personas', 'Comercial y Postventa*', 'Comercial de Empresas*', 'Técnico N2', 'Técnico N1', 'Asistentes'];
  const rentas = [2000, 1800, 1700, 1150, 1000, 900, 850, 850, 850, 750, 692];
  s.addChart(pres.ChartType.bar, [{ name: 'Renta bruta', labels: cargos, values: rentas }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.28, w: lw + 0.1, h: 3.95, barDir: 'bar', barGapWidthPct: 35, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.accent1, HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 2300, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 9.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 9.5, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Renta bruta mensual por cargo',
  }));
  mono(s, '* MÁS COMISIÓN · CELESTE: TÉCNICOS · INCLUYEN GRATIFICACIÓN LEGAL', { x: M, y: y0 + 4.25, w: lw, h: 0.2, fontSize: 7.5 });
  // bonos
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 3.1);
  visor(s, cx, y0, cw, 3.1);
  mono(s, 'BONO ÚNICO POR NIVEL VALIDADO', { x: cx + 0.22, y: y0 + 0.17, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  [['N2', '$200.000'], ['N3', '$300.000'], ['N4', '$350.000']].forEach(([k, v], i) => {
    const y = y0 + 0.5 + i * 0.52;
    regla(s, y, cx + 0.22, cw - 0.44, C.accent6);
    tag(s, k, cx + 0.22, y + 0.12);
    numero(s, v, { x: cx + 0.8, y, w: cw - 1.05, h: 0.52, fontSize: 20, align: 'right', valign: 'middle' });
  });
  const ty = y0 + 0.5 + 3 * 0.52;
  linea(s, cx + 0.22, ty, cw - 0.44, 0, C.accent1, 1);
  T(s, 'Total por técnico', { x: cx + 0.22, y: ty, w: 2, h: 0.5, valign: 'middle', fontSize: 12, bold: true });
  numero(s, '$850.000', { x: cx + 0.8, y: ty, w: cw - 1.05, h: 0.5, fontSize: 22, align: 'right', valign: 'middle', color: C.accent1 });
  T(s, '$929.730 con cargas (9,38%). Se paga solo con la validación presencial aprobada.', { x: cx + 0.22, y: ty + 0.55, w: cw - 0.44, h: 0.5, fontSize: 10, color: C.text2 });
  T(s, 'Ninguna renta deja el sueldo base bajo el ingreso mínimo de $553.553: los asistentes ganan $692.000, el piso legal con gratificación.', { x: cx, y: y0 + 3.3, w: cw, h: 0.9, fontSize: 10.5, color: C.text2 });
  return s;
};

// A8 · jornada de instalación (Anexo N° 8)
D['a-jornada'] = () => {
  const s = contenido('', 'OPERACIONES · JORNADA DE INSTALACIÓN', 'UN VEHÍCULO POR JORNADA:', '8,4 horas.');
  const b = [['0', 'Seguridad y preparación', 0.4], ['1', 'Recepción y diagnóstico', 0.4], ['2', 'Montaje mecánico y pesaje', 3.3], ['3', 'Integración y energización', 1.8], ['4', 'Calibración', 0.8], ['5', 'Pruebas', 1.0], ['6', 'Documentación y traspaso', 0.7]];
  const y0 = 2.6, total = 8.4;
  mono(s, 'DISTRIBUCIÓN DE LA JORNADA · HORAS · DÚO CON UN N3 Y UN N2 O SUPERIOR', { x: M, y: y0, w: CW, h: 0.22, fontSize: 9, color: C.text1 });
  let x = M;
  b.forEach(([k, t, h]) => {
    const w = CW * h / total, hot = k === '2' || k === '3';
    s.addShape(S.rect, { x: x + 0.02, y: y0 + 0.35, w: w - 0.04, h: 0.5, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    mono(s, k, { x, y: y0 + 0.35, w, h: 0.5, align: 'center', valign: 'middle', fontSize: 10, bold: true, color: hot ? C.background1 : C.text1 });
    T(s, dec(h), { x, y: y0 + 0.9, w, h: 0.3, align: 'center', fontFace: F_CON, bold: true, fontSize: 14, color: hot ? C.accent1 : C.text2 });
    x += w;
  });
  T(s, 'Montaje e integración (bloques 2 y 3) concentran 5,1 horas.', { x: M, y: y0 + 1.22, w: 7, h: 0.3, fontSize: 11, color: C.accent1 });
  // bloques
  const cw = (CW - 0.3) / 2, ly = y0 + 1.62;
  b.forEach(([k, t, h], i) => {
    const col = i < 4 ? 0 : 1, r = i < 4 ? i : i - 4, xx = M + col * (cw + 0.3), y = ly + r * 0.36;
    tag(s, k, xx, y + 0.05, { off: !(k === '2' || k === '3') });
    T(s, t, { x: xx + 0.5, y, w: cw - 1.3, h: 0.36, valign: 'middle', fontSize: 11.5 });
    mono(s, dec(h) + ' H', { x: xx + cw - 0.8, y, w: 0.8, h: 0.36, valign: 'middle', align: 'right', fontSize: 9 });
  });
  // puntos de control
  const py = 5.74;
  regla(s, py - 0.08, M, CW, C.accent1);
  mono(s, 'CUATRO PUNTOS DE CONTROL · SI NO SE CUMPLE, SE DETIENE', { x: M, y: py, w: CW, h: 0.22, fontSize: 8.5, color: C.accent1 });
  const pc = [['¿Vehículo apto para instalar?', 'Se reprograma; el cliente repara con su mecánico.'], ['¿Masa ≤ 20% y reparto entre ejes ≤ 10%?', 'Se detiene; IC revisa la configuración.'], ['¿Aislación ≥ 100 Ω/V, sin puntos calientes?', 'Desenergiza, corrige y repite la medición.'], ['¿Aprueba asistencia, regeneración y seguridad?', 'Corrige la calibración o el montaje.']];
  const pw = (CW - 0.45) / 4;
  pc.forEach(([q, a], i) => {
    const xx = M + i * (pw + 0.15);
    s.addShape(S.diamond, { x: xx, y: py + 0.33, w: 0.2, h: 0.2, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, q, { x: xx + 0.28, y: py + 0.28, w: pw - 0.3, h: 0.45, fontSize: 10.5, bold: true });
    T(s, a, { x: xx + 0.28, y: py + 0.74, w: pw - 0.3, h: 0.4, fontSize: 9.5, color: C.text2 });
  });
  return s;
};

// A9 · inversión (Tabla N° 18) y gasto operacional (Tabla N° 19)
D['a-inversion'] = () => {
  const s = contenido('', 'OPERACIONES · INVERSIÓN Y GASTO', 'LA INVERSIÓN SIGUE AL GATILLO;', 'el gasto, al kit.');
  const y0 = 2.55, gw = (CW - 0.5) / 2;
  mono(s, 'INVERSIÓN EN EQUIPAMIENTO · MILLONES DE PESOS', { x: M, y: y0, w: gw, h: 0.22, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Inversión', labels: AÑOS, values: [71.2, 10.1, 81.3, 0, 81.3] }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 2.9, barDir: 'col', barGapWidthPct: 55, chartColors: [HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 95, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0;;"—"', dataLabelFontSize: 11, dataLabelFontBold: true,
    catAxisLabelFontSize: 10, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Inversión en equipamiento por año',
  }));
  T(s, 'Total: $243,8 millones. Dinamómetro de chasis $36,7 M por local, a cotizar de nuevo; elevadores y herramientas entran con cada dúo.', { x: M, y: y0 + 3.3, w: gw, h: 0.75, fontSize: 10.5, color: C.text2 });
  const gx = M + gw + 0.5;
  mono(s, 'GASTO OPERACIONAL DE LA LÍNEA PROPIA · MILLONES', { x: gx, y: y0, w: gw, h: 0.22, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Kits instalados', labels: AÑOS, values: [958.8, 2786.5, 5367.7, 7272.4, 9141.8] },
    { name: 'Resto del gasto', labels: AÑOS, values: [105.3, 158.9, 290.2, 351.1, 464.0] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 2.9, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 55, chartColors: [HEX.dk2, HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 11000, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: false, catAxisLabelFontSize: 10, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 9.5, objectName: 'Gasto operacional por año',
  }));
  const tot = ['1.064,1', '2.945,4', '5.657,9', '7.623,5', '9.605,8'];
  const px = gx + 0.12, pw = gw - 0.2;
  tot.forEach((v, i) => numero(s, v, { x: px + i * pw / 5, y: y0 + 3.25, w: pw / 5, h: 0.3, fontSize: 12.5, align: 'center', valign: 'top' }));
  T(s, 'El kit explica más del 90% del gasto de cada año. Resto: arriendo, servicios, seguros, mantención, cursos, plataformas y garantía (3% del kit).', { x: gx, y: y0 + 3.6, w: gw, h: 0.7, fontSize: 10, color: C.text2 });
  return s;
};

// A10 · sensibilidad (Tabla N° 21)
D['a-sensibilidad'] = () => {
  const s = contenido('', 'OPERACIONES · SENSIBILIDAD', 'EL DÓLAR PESA MÁS', 'que el precio y la mezcla.');
  const y0 = 2.55, lw = 8.3;
  mono(s, 'RESULTADO DE LA LÍNEA PROPIA AL AÑO 5 · MILLONES DE PESOS', { x: M, y: y0, w: lw, h: 0.22, fontSize: 9, color: C.text1 });
  const esc = ['Dólar −10%', 'Precio +5%', 'Plus 80%', 'Base', 'Plus 40%', 'Precio −5%', 'Dólar +10%'];
  const val = [1646.9, 1433.0, 993.7, 869.9, 746.1, 306.9, 92.9];
  s.addChart(pres.ChartType.bar, [{ name: 'Resultado', labels: esc, values: val }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.28, w: lw + 0.1, h: 3.9, barDir: 'bar', barGapWidthPct: 35, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent4],
    valAxisMinVal: 0, valAxisMaxVal: 1900, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0.0', dataLabelFontSize: 10.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 10.5, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Sensibilidad del resultado al quinto año',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 2.2);
  visor(s, cx, y0, cw, 2.2);
  mono(s, 'MARGEN SOBRE VENTAS', { x: cx + 0.22, y: y0 + 0.17, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  [['Base', '7,7%'], ['Dólar +10%', '0,8%'], ['Dólar −10%', '14,6%']].forEach(([k, v], i) => {
    const y = y0 + 0.5 + i * 0.52;
    regla(s, y, cx + 0.22, cw - 0.44, C.accent6);
    T(s, k, { x: cx + 0.22, y, w: 2, h: 0.52, valign: 'middle', fontSize: 12 });
    numero(s, v, { x: cx + 2, y, w: cw - 2.22, h: 0.52, fontSize: 20, align: 'right', valign: 'middle', color: i === 1 ? C.accent4 : C.text1 });
  });
  T(s, 'Cada $10 de dólar mueve el costo del kit en $25.168 (Esencial) y $28.886 (Plus). El plan financiero deberá evaluar coberturas o precios indexados al dólar.', { x: cx, y: y0 + 2.4, w: cw, h: 1.3, fontSize: 10.5, color: C.text2 });
  return s;
};

// ---------- orden de la exposición (guion.js) y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · ${G.segundos(x.texto)} s\n\n${x.texto}`;
let quienAnterior = null, parte = 0;
G.PRINCIPAL.forEach(x => {
  if (x.quien !== quienAnterior) { abrirSeccion(`${++parte} · ${x.quien}`); quienAnterior = x.quien; }
  if (!D[x.d]) throw new Error('Falta la diapositiva ' + x.d);
  CLAVE = x.d;
  D[x.d]().addNotes(nota(x));
});
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

(async () => {
  await pres.writeFile({ fileName: OUT });
  await aplicarTema(OUT, THEME);
  console.log('listo', OUT, '·', G.PRINCIPAL.length, 'diapositivas +', G.ANEXO.length + 1, 'de anexo');
})();
