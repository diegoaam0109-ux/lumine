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
  s.addText(text, { shape: S.diamond, x, y, w, h, fill: { color: hot ? HOT : C.background2 }, line: { color: C.accent1, width: 1 }, fontFace: F_BODY, fontSize: 10.5, color: C.text1, align: 'center', valign: 'middle', margin: 0, lang: 'es-CL' });
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
  ansoff: `Fuentes: Ansoff (1965); elaboración propia (${INF}, §3.1.4, §3.1.5.4, §3.2.1 y Figura N° 1).`,
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
// Tamaños mínimos (crítica del profesor guía: «demasiados textos pequeños»):
// texto principal 12,5 a 14 pt, etiquetas mono 9 pt o más, cifras condensadas grandes.
// =====================================================================
D.objetivos = () => {
  const s = contenido('01', 'PLAN DE MARKETING · OBJETIVOS', '299 VEHÍCULOS EL PRIMER AÑO,', 'la referencia al quinto.');
  const gx = M, gy = 2.55, gw = 3.9, gh = 2.42;
  cajaHot(s, gx, gy, gw, gh);
  mono(s, 'OBJETIVO GENERAL · CINCO AÑOS', { x: gx + 0.25, y: gy + 0.2, w: gw - 0.5, h: 0.24, color: C.accent1 });
  T(s, 'Ser la referencia de la hibridación de posventa en Chile.', { x: gx + 0.25, y: gy + 0.52, w: gw - 0.5, h: 0.9, fontSize: 17, bold: true });
  T(s, 'Tres talleres propios en la Región Metropolitana y una red certificada en todas las regiones.', { x: gx + 0.25, y: gy + 1.45, w: gw - 0.5, h: 0.85, fontSize: 13, color: C.text2 });
  // metas del primer año
  const mx = gx + gw + 0.4, mw = R - mx, n = 5, gap = 0.12, tw = (mw - (n - 1) * gap) / n;
  mono(s, 'METAS DEL PRIMER AÑO', { x: mx, y: gy - 0.02, w: mw, h: 0.24, color: C.text1 });
  const metas = [['299', 'vehículos instalados'], [null, 'cotizaciones digitales'], ['3', 'casos con ahorro medido'], ['80%', 'clientes satisfechos'], ['15%', 'clientes por recomendación']];
  metas.forEach(([v, k], i) => {
    const x = mx + i * (tw + gap), y = gy + 0.32, h = gh - 0.32;
    caja(s, x, y, tw, h);
    tag(s, '0' + (i + 1), x + 0.13, y + 0.15, { off: v === null });
    if (v) numero(s, v, { x: x + 0.13, y: y + 0.42, w: tw - 0.26, h: 0.72, fontSize: 44, color: i === 0 ? C.accent1 : C.text1 });
    else porConfirmar(s, x + 0.13, y + 0.75, tw - 0.26, { size: 7.5 });
    T(s, k, { x: x + 0.13, y: y + 1.24, w: tw - 0.2, h: 0.8, fontSize: 12.5, bold: true });
  });
  // hitos de los años 1 a 5
  const hy = 5.2;
  mono(s, 'INSTALACIONES PROPIAS Y RED POR AÑO', { x: M, y: hy, w: 6, h: 0.24, color: C.text1 });
  supuesto(s, 'PRONÓSTICO · ESCENARIO BASE', R - 2.8, hy - 0.03, 2.8, { align: 'center', size: 9 });
  const lx = M + 0.2, lw = CW - 0.4, ly = hy + 0.66;
  linea(s, lx, ly, lw, 0, C.accent5, 1.25);
  const hitos = [['AÑO 1', '299', 'Un taller, tres dúos'], ['AÑO 2', '869', 'Seis dúos · red de 3'], ['AÑO 3', '1.674', 'Taller 2 · red de 9'], ['AÑO 4', '2.268', 'Dos talleres · red de 20'], ['AÑO 5', '2.851', 'Taller 3 · red de 42']];
  const step = lw / (hitos.length - 1);
  hitos.forEach(([a, v, d], i) => {
    const cx = lx + i * step, bw = 2.7, bx = Math.min(Math.max(cx - bw / 2, M), R - bw);
    const al = i === 0 ? 'left' : i === hitos.length - 1 ? 'right' : 'center';
    s.addShape(S.ellipse, { x: cx - 0.07, y: ly - 0.07, w: 0.14, h: 0.14, fill: { color: i === 0 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.25 } });
    mono(s, a, { x: bx, y: ly - 0.37, w: bw, h: 0.22, align: al, color: C.accent1 });
    numero(s, v, { x: bx, y: ly + 0.1, w: bw, h: 0.46, fontSize: 28, valign: 'top', align: al });
    T(s, d, { x: bx, y: ly + 0.56, w: bw, h: 0.3, fontSize: 12.5, color: C.text2, align: al });
  });
  return s;
};

// =====================================================================
// 3.1.2 SEGMENTACIÓN
// =====================================================================
D.segmentacion = () => {
  const s = contenido('02', 'PLAN DE MARKETING · SEGMENTACIÓN', 'EL CLIENTE SE DEFINE POR SU AUTO,', 'no por su edad.');
  const lw = 4.6, y0 = 2.55, rh = 0.9;
  mono(s, 'SIN ESTO NO HAY COMPRA', { x: M, y: y0, w: lw, h: 0.24, color: C.text1 });
  const cond = [['Técnica', 'Liviano, a combustión y con tracción delantera.'], ['Acceso', 'Todo Chile, salvo Rapa Nui, Juan Fernández y la Antártica.'], ['Unidad', 'Persona natural vinculada a un auto compatible.']];
  cond.forEach(([t, d], i) => {
    const y = y0 + 0.36 + i * rh;
    regla(s, y, M, lw);
    tag(s, '0' + (i + 1), M, y + 0.13);
    T(s, t, { x: M + 0.55, y: y + 0.08, w: lw - 0.55, h: 0.32, fontSize: 15, bold: true });
    T(s, d, { x: M + 0.55, y: y + 0.4, w: lw - 0.55, h: 0.48, fontSize: 12.5, color: C.text2 });
  });
  regla(s, y0 + 0.36 + 3 * rh, M, lw);
  // cuatro variables
  const gx = M + lw + 0.4, gw = R - gx, gap = 0.2, cw = (gw - gap) / 2, ch = 1.45;
  const vars = [['GEOGRÁFICA', '36,8%', 'del parque, en la Región Metropolitana (RM).'], ['DEMOGRÁFICA', '4 roles', 'usuario, dueño, pagador e influyentes.'], ['PSICOGRÁFICA', '5 motivos', 'ahorro, ambiente, norma, innovación y apego.'], ['CONDUCTUAL', '6 dimensiones', 'la intensidad de uso define el valor.']];
  vars.forEach(([k, v, d], i) => {
    const x = gx + (i % 2) * (cw + gap), y = y0 + Math.floor(i / 2) * (ch + gap), hot = i === 3;
    if (hot) cajaHot(s, x, y, cw, ch); else caja(s, x, y, cw, ch);
    mono(s, k, { x: x + 0.2, y: y + 0.15, w: cw - 0.4, h: 0.22, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: x + 0.2, y: y + 0.38, w: cw - 0.4, h: 0.55, fontSize: 32, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.2, y: y + 0.96, w: cw - 0.4, h: 0.42, fontSize: 12.5, color: C.text2 });
  });
  // punto de entrada y empresas
  const by = 5.9;
  regla(s, by - 0.08, M, CW, C.accent1);
  punto(s, M, by + 0.1);
  mono(s, 'PUNTO DE ENTRADA', { x: M + 0.17, y: by, w: 3, h: 0.26, valign: 'middle', color: C.accent1 });
  T(s, 'Uso laboral intensivo en la RM: colectivos, taxis y aplicaciones.', { x: M, y: by + 0.3, w: 5.7, h: 0.6, fontSize: 14, bold: true });
  const ex = M + 6.2, ew = R - ex, eww = ew / 3;
  mono(s, 'MERCADO DE EMPRESAS', { x: ex, y: by, w: ew, h: 0.26, valign: 'middle', color: C.text1 });
  [['14.473', 'autos arrendados'], ['408', 'líneas de colectivos'], ['22.447', 'talleres mecánicos']].forEach(([v, d], i) => {
    numero(s, v, { x: ex + i * eww, y: by + 0.28, w: eww, h: 0.38, fontSize: 22, valign: 'top' });
    T(s, d, { x: ex + i * eww, y: by + 0.64, w: eww - 0.1, h: 0.26, fontSize: 12, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.1.3 INVESTIGACIÓN DE MERCADO
// =====================================================================
D.investigacion = () => {
  const s = contenido('03', 'PLAN DE MARKETING · INVESTIGACIÓN DE MERCADO', 'SEIS HIPÓTESIS', 'antes de fijar el precio.');
  const y0 = 2.55, n = 4, gap = 0.35, cw = (CW - (n - 1) * gap) / n, ch = 2.15;
  mono(s, 'CUATRO ETAPAS · PRIMERO CUALITATIVA, DESPUÉS ENCUESTA', { x: M, y: y0, w: CW, h: 0.24, color: C.text1 });
  const et = [['EXPLORATORIA', '1', 'conductor de aplicaciones', true], ['EXPERTOS', '4', 'Estado, academia, industria y mecánica', false], ['CLIENTES', '5', 'perfiles de conductor y dueño', false], ['ENCUESTA', '150', 'casos por cuotas (mínimo 100)', false]];
  et.forEach(([k, v, u, hecho], i) => {
    const x = M + i * (cw + gap), y = y0 + 0.34;
    caja(s, x, y, cw, ch);
    if (i < n - 1) flecha(s, x + cw + 0.04, y + ch / 2, gap - 0.08, 0, C.accent1, 1.25);
    tag(s, '0' + (i + 1), x + 0.18, y + 0.16, { off: !hecho });
    mono(s, k, { x: x + 0.65, y: y + 0.16, w: cw - 0.8, h: 0.27, valign: 'middle', color: C.text1 });
    numero(s, v, { x: x + 0.18, y: y + 0.5, w: 1.6, h: 0.62, fontSize: 40, valign: 'top', color: hecho ? C.accent1 : C.text1 });
    T(s, u, { x: x + 0.18, y: y + 1.12, w: cw - 0.36, h: 0.5, fontSize: 12.5, bold: true });
    chip(s, hecho ? 'REALIZADA' : 'POR REALIZAR', x + 0.18, y + ch - 0.42, 1.6, hecho ? C.accent2 : C.accent3, { size: 9 });
  });
  const by = 5.25, lw = 7.6;
  mono(s, 'QUÉ PONE A PRUEBA · 3 DE 6 (ANEXO A1)', { x: M, y: by, w: lw, h: 0.24, color: C.text1 });
  [['H1', 'El uso laboral compra más que el particular.'], ['H4', 'La barrera es la confianza, no el precio.'], ['H6', 'Se prefiere hibridar a gas, cambiar de auto o nada.']].forEach(([k, t], i) => {
    const y = by + 0.32 + i * 0.42;
    regla(s, y, M, lw, C.accent6);
    tag(s, k, M, y + 0.08, { w: 0.44 });
    T(s, t, { x: M + 0.62, y, w: lw - 0.62, h: 0.42, valign: 'middle', fontSize: 13.5 });
  });
  const cx = M + lw + 0.45, cw2 = R - cx;
  caja(s, cx, by, cw2, 1.58);
  mono(s, 'MUESTRA POR CUOTAS', { x: cx + 0.2, y: by + 0.14, w: cw2 - 0.4, h: 0.22, color: C.accent1 });
  numero(s, '±8,0%', { x: cx + 0.2, y: by + 0.42, w: 1.9, h: 0.62, fontSize: 36, valign: 'top' });
  T(s, 'Error con 150 casos: resultados indicativos.', { x: cx + 2.1, y: by + 0.45, w: cw2 - 2.3, h: 0.95, fontSize: 12.5, color: C.text2 });
  return s;
};

// =====================================================================
// 3.1.4 MATRIZ DE ANSOFF Y VENTAJA COMPETITIVA
// =====================================================================
D.ansoff = () => {
  const s = contenido('04', 'PLAN DE MARKETING · MATRIZ DE ANSOFF', 'UN PRODUCTO NUEVO', 'en un mercado que ya existe.');
  const gx = M + 0.55, gw = 8.0, gapX = 0.55, gapY = 0.5, qw = (gw - gapX) / 2, gy = 2.88, qh = 1.7;
  mono(s, 'PRODUCTO EXISTENTE', { x: gx, y: 2.52, w: qw, h: 0.24, align: 'center', color: C.text1 });
  mono(s, 'PRODUCTO NUEVO', { x: gx + qw + gapX, y: 2.52, w: qw, h: 0.24, align: 'center', color: C.text1 });
  T(s, 'MERCADO EXISTENTE', { x: M - 0.83, y: gy + qh / 2 - 0.13, w: 2.0, h: 0.26, rotate: 270, fontFace: F_MONO, fontSize: 9, color: C.text1, charSpacing: 1.5, align: 'center' });
  T(s, 'MERCADO NUEVO', { x: M - 0.83, y: gy + qh + gapY + qh / 2 - 0.13, w: 2.0, h: 0.26, rotate: 270, fontFace: F_MONO, fontSize: 9, color: C.text1, charSpacing: 1.5, align: 'center' });
  const q = [
    [0, 0, 'PENETRACIÓN', 'AÑO 2', 'Más clientes del mismo mercado: uso medio y recomendación.', 'normal'],
    [1, 0, 'DESARROLLO DE PRODUCTO', 'AÑO 1 · AQUÍ ENTRA LUMINE', 'Hibridación aditiva certificada, sin oferta en Chile.', 'hot'],
    [0, 1, 'DESARROLLO DE MERCADO', 'AÑO 3', 'Flotas y regiones, a través de la red certificada.', 'normal'],
    [1, 1, 'DIVERSIFICACIÓN', 'RELACIONADA · DESDE EL AÑO 2', 'Patrones de calibración, kits y certificación para otros talleres.', 'futuro'],
  ];
  q.forEach(([c, r, t, a, d, st]) => {
    const x = gx + c * (qw + gapX), y = gy + r * (qh + gapY);
    if (st === 'hot') cajaHot(s, x, y, qw, qh);
    else if (st === 'futuro') caja(s, x, y, qw, qh, { fill: { color: HOT }, line: { color: C.accent1, width: 1, dashType: 'dash' } });
    else caja(s, x, y, qw, qh);
    T(s, t, { x: x + 0.22, y: y + 0.16, w: qw - 0.44, h: 0.32, fontSize: 14, bold: true, charSpacing: 1 });
    mono(s, a, { x: x + 0.22, y: y + 0.5, w: qw - 0.44, h: 0.22, color: C.accent1 });
    T(s, d, { x: x + 0.22, y: y + 0.82, w: qw - 0.44, h: 0.8, fontSize: 13, color: st === 'normal' ? C.text2 : C.text1 });
  });
  const midY0 = gy + qh / 2;
  flecha(s, gx + qw + gapX - 0.05, midY0, -(gapX - 0.1), 0);
  flecha(s, gx + 0.45, gy + qh + 0.05, 0, gapY - 0.1);
  mono(s, 'AÑO 3', { x: gx + 0.55, y: gy + qh + 0.13, w: 0.9, h: 0.22, color: C.accent1 });
  flecha(s, gx + 2 * qw + gapX - 0.45, gy + qh + 0.05, 0, gapY - 0.1, C.accent1, 1.25, 'dash');
  mono(s, 'AÑO 2', { x: gx + 2 * qw + gapX - 1.45, y: gy + qh + 0.13, w: 0.9, h: 0.22, align: 'right', color: C.accent1 });
  // la ventaja competitiva, dicha explícitamente (observación del profesor guía)
  const cx = gx + gw + 0.45, cw = R - cx, cy = 2.88, ch = 2 * qh + gapY;
  cajaHot(s, cx, cy, cw, ch);
  mono(s, 'NUESTRA VENTAJA COMPETITIVA', { x: cx + 0.22, y: cy + 0.18, w: cw - 0.44, h: 0.22, color: C.accent1 });
  T(s, 'La biblioteca de calibraciones por modelo.', { x: cx + 0.22, y: cy + 0.48, w: cw - 0.44, h: 0.9, fontSize: 17, bold: true });
  T(s, 'Sostenible: crece con cada instalación y es lo más difícil de copiar.', { x: cx + 0.22, y: cy + 1.4, w: cw - 0.44, h: 0.9, fontSize: 13, color: C.text2 });
  regla(s, cy + 2.38, cx + 0.22, cw - 0.44);
  mono(s, 'RED DESDE EL AÑO 2', { x: cx + 0.22, y: cy + 2.48, w: cw - 0.44, h: 0.22, color: C.text1 });
  T(s, 'Su exclusividad se agota: se vende mientras vale, y la red devuelve sus datos.', { x: cx + 0.22, y: cy + 2.76, w: cw - 0.44, h: 1.1, fontSize: 13, color: C.text2 });
  return s;
};

// =====================================================================
// 3.1.5 POSICIONAMIENTO
// =====================================================================
D.posicionamiento = () => {
  const s = contenido('05', 'PLAN DE MARKETING · POSICIONAMIENTO', 'EL ESPACIO VACÍO:', 'ahorrar sin cambiar de auto.');
  const px = 3.25, pw = R - px, rows = [[2.58, 1.35], [4.03, 1.0], [5.13, 1.3]];
  // escala logarítmica de inversión (millones de pesos); $0 va aparte a la izquierda
  const lo = Math.log10(0.5), hi = Math.log10(26), x0 = px + 1.0, xw = pw - 1.15;
  const X = v => v === 0 ? px + 0.42 : x0 + (Math.log10(v) - lo) / (hi - lo) * xw;
  const etq = [['Conserva su auto', 'sin límite de antigüedad'], ['Conserva su auto', 'con límite de antigüedad'], ['Debe reemplazar', 'su auto']];
  rows.forEach(([y, h], i) => {
    s.addShape(S.rect, { x: px, y, w: pw, h, fill: { color: i === 0 ? HOT : C.background2 }, line: { type: 'none' } });
    T(s, [{ text: etq[i][0], options: { breakLine: true, bold: i === 0 } }, { text: etq[i][1], options: { color: C.text2 } }], { x: M, y, w: px - M - 0.2, h, align: 'right', valign: 'middle', fontSize: 13 });
  });
  mono(s, 'QUÉ EXIGE AL CONDUCTOR', { x: M, y: 2.28, w: 2.6, h: 0.22, align: 'right' });
  supuesto(s, 'LUMINE: PRECIO DE REFERENCIA · AHORRO SIMULADO', R - 4.6, 2.25, 4.6, { size: 9, align: 'center', h: 0.26 });
  const ay = 6.48;
  linea(s, px, ay, pw, 0, C.text2, 0.75);
  [[0, '$0'], [1, '$1 M'], [2, '$2 M'], [5, '$5 M'], [10, '$10 M'], [20, '$20 M']].forEach(([v, l]) => {
    linea(s, X(v), ay, 0, 0.06, C.text2, 0.75);
    mono(s, l, { x: X(v) - 0.5, y: ay + 0.07, w: 1.0, h: 0.2, fontSize: 9, align: 'center' });
  });
  mono(s, 'INVERSIÓN INICIAL · MILLONES DE PESOS · ESCALA LOGARÍTMICA', { x: px, y: ay + 0.27, w: pw, h: 0.2, fontSize: 9, align: 'center' });
  const r1 = rows[0];
  s.addShape(S.rect, { x: X(0.62), y: r1[0] + 0.12, w: X(7.2) - X(0.62), h: r1[1] - 0.24, fill: { color: HOT, transparency: 100 }, line: { color: C.accent1, width: 0.75, dashType: 'sysDot' } });
  T(s, 'Espacio hoy sin oferta', { x: X(0.62) + 0.15, y: r1[0] + r1[1] - 0.52, w: 3.6, h: 0.3, fontSize: 13, color: C.accent1, bold: true });
  s.addShape(S.ellipse, { x: X(0) - 0.08, y: r1[0] + 0.32, w: 0.16, h: 0.16, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'No hacer nada', options: { breakLine: true, bold: true } }, { text: 'sin ahorro', options: { color: C.text2 } }], { x: X(0) - 0.6, y: r1[0] + 0.55, w: 1.2, h: 0.55, fontSize: 11.5, align: 'center' });
  const lyL = r1[0] + 0.43;
  s.addShape(S.rect, { x: X(4.29), y: lyL - 0.04, w: X(4.99) - X(4.29), h: 0.08, fill: { color: C.accent1 }, line: { type: 'none' } });
  [4.29, 4.99].forEach(v => s.addShape(S.ellipse, { x: X(v) - 0.09, y: lyL - 0.09, w: 0.18, h: 0.18, fill: { color: C.accent1 }, line: { type: 'none' } }));
  mono(s, 'ESENCIAL · PLUS', { x: X(4.29) - 0.7, y: lyL + 0.14, w: 2.1, h: 0.22, align: 'center', color: C.accent1 });
  const bx = X(8.2), bw = R - bx - 0.15;
  cajaHot(s, bx, r1[0] + 0.18, bw, r1[1] - 0.36);
  T(s, 'LUMINE MOTORS', { x: bx + 0.1, y: r1[0] + 0.26, w: bw - 0.2, h: 0.32, fontSize: 14, bold: true, align: 'center' });
  T(s, [{ text: '$4,3 M y $5,0 M', options: { breakLine: true } }, { text: 'hasta 15% y 20%' }], { x: bx + 0.1, y: r1[0] + 0.6, w: bw - 0.2, h: 0.5, fontSize: 12, color: C.accent1, align: 'center' });
  const r2 = rows[1], gy = r2[0] + r2[1] - 0.3;
  s.addShape(S.rect, { x: X(0.9), y: gy, w: X(1.8) - X(0.9), h: 0.1, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'Conversión a gas  ', options: { bold: true } }, { text: '$0,9–1,8 M · hasta 35% · máx. 7 años', options: { color: C.text2 } }], { x: X(0.9) - 0.1, y: r2[0] + 0.12, w: 6.6, h: 0.32, fontSize: 12.5 });
  const r3 = rows[2];
  [['Híbrido usado', '$9,5–13 M', 9.5, 13], ['Híbrido nuevo', 'desde $12,0 M', 11.99, 16.49], ['Eléctrico nuevo', 'desde $14,0 M', 13.99, 26]].forEach(([t, d, a, b], i) => {
    const y = r3[0] + 0.16 + i * 0.37;
    s.addShape(S.rect, { x: X(a), y: y + 0.09, w: X(b) - X(a), h: 0.1, fill: { color: C.text2 }, line: { type: 'none' } });
    s.addShape(S.ellipse, { x: X(a) - 0.07, y: y + 0.07, w: 0.14, h: 0.14, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, [{ text: t + '  ', options: { bold: true } }, { text: d, options: { color: C.text2 } }], { x: X(a) - 4.15, y: y - 0.02, w: 4.0, h: 0.32, fontSize: 12.5, align: 'right' });
  });
  return s;
};

// =====================================================================
// 3.1.6 MIX: PRODUCTO Y PRECIO
// =====================================================================
D.precio = () => {
  const s = contenido('06', 'PLAN DE MARKETING · MIX: PRODUCTO Y PRECIO', 'PLUS CUESTA 16% MÁS', 'y ahorra 24% más.');
  const y0 = 2.55, cw = 3.05, ch = 3.3, gap = 0.25;
  const v = [['ESENCIAL', '$4.290.000', 'Hasta 15% menos bencina', '2 × 4.000 W', '$117.069', '$454.226', false], ['PLUS', '$4.990.000', 'Hasta 20% menos bencina', '2 × 6.000 W', '$145.327', '$683.376', true]];
  v.forEach(([k, p, prom, mot, ah, mg, hot], i) => {
    const x = M + i * (cw + gap);
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    mono(s, k, { x: x + 0.22, y: y0 + 0.18, w: 1.4, h: 0.24, color: hot ? C.accent1 : C.text1 });
    if (hot) chip(s, 'RECOMENDADA', x + cw - 1.55, y0 + 0.16, 1.35, C.accent1, { size: 9 });
    numero(s, p, { x: x + 0.2, y: y0 + 0.45, w: cw - 0.4, h: 0.6, fontSize: 34, valign: 'top', color: hot ? C.accent1 : C.text1 });
    supuesto(s, 'REFERENCIA · CON IVA', x + 0.22, y0 + 1.04, 2.1, { size: 8.5, h: 0.26 });
    [['PROMESA · SIMULADA', prom], ['MOTORES EN RUEDA', mot], ['AHORRO DEL COLECTIVO', ah + ' al mes'], ['MARGEN POR KIT', mg]].forEach(([a, b], j) => {
      const y = y0 + 1.42 + j * 0.46;
      regla(s, y, x + 0.22, cw - 0.44, C.accent6);
      mono(s, a, { x: x + 0.22, y: y + 0.03, w: cw - 0.44, h: 0.2, fontSize: 9 });
      T(s, b, { x: x + 0.22, y: y + 0.21, w: cw - 0.44, h: 0.25, fontSize: 13, bold: j >= 2 });
    });
  });
  const gx = M + 2 * cw + gap + 0.5, gw = R - gx;
  mono(s, 'MESES PARA RECUPERAR LA INVERSIÓN', { x: gx, y: y0, w: gw, h: 0.24, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Esencial', labels: ['Colectivo', 'Aplicación'], values: [36.6, 28.9] },
    { name: 'Plus', labels: ['Colectivo', 'Aplicación'], values: [34.3, 27.5] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 3.0, barDir: 'col', barGapWidthPct: 60,
    chartColors: [HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 42, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 14, dataLabelFontBold: true,
    catAxisLabelFontSize: 12.5, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 12, objectName: 'Meses para recuperar la inversión por versión',
  }));
  const by = 6.08, iw = (CW - 0.6) / 3;
  [['GARANTÍA', 'Kit: 3 años o 200.000 km. Batería: 5 años o 300.000 km.', C.accent1], ['FINANCIAMIENTO', 'Cuota de Plus a 48 meses: $159.967 (25,6% anual).', C.accent1], ['A VALIDAR', 'La encuesta ajusta los precios (Van Westendorp).', C.accent3]].forEach(([k, d, col], i) => {
    const x = M + i * (iw + 0.3);
    regla(s, by - 0.08, x, iw);
    punto(s, x, by + 0.08, col);
    mono(s, k, { x: x + 0.17, y: by, w: iw - 0.2, h: 0.24, valign: 'middle', color: C.text1 });
    T(s, d, { x, y: by + 0.27, w: iw, h: 0.52, fontSize: 12, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.1.7 DEMANDA Y PRONÓSTICO
// =====================================================================
D.demanda = () => {
  const s = contenido('07', 'PLAN DE MARKETING · DEMANDA Y PRONÓSTICO DE VENTAS', 'MÁS DEMANDA QUE CAPACIDAD', 'desde el año 1.');
  const y0 = 2.55, lw = 3.8;
  mono(s, 'TAMAÑO DEL MERCADO · VEHÍCULOS', { x: M, y: y0, w: lw, h: 0.24, color: C.text1 });
  [['TAM · TOTAL · CHILE', '4.409.729', 1.0], ['SAM · DISPONIBLE · RM', '1.685.930', 0.8], ['SEGMENTO LABORAL · RM', '162.780', 0.62]].forEach(([k, v, f], i) => {
    const y = y0 + 0.34 + i * 0.9, w = lw * f, hot = i === 2;
    caja(s, M, y, w, 0.8, hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } } : {});
    mono(s, k, { x: M + 0.15, y: y + 0.08, w: lw - 0.3, h: 0.22, fontSize: 9, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: M + 0.15, y: y + 0.3, w: w - 0.3, h: 0.46, fontSize: 26, valign: 'top' });
  });
  T(s, 'Aplicaciones: 126.960 (estimación propia).', { x: M, y: y0 + 3.08, w: lw, h: 0.3, fontSize: 12, color: C.text2 });
  regla(s, y0 + 3.48, M, lw);
  T(s, [{ text: '11,1% al año 5 ', options: { bold: true } }, { text: 'con el modelo de Bass: bajo el 16% de primeros adoptantes.', options: { color: C.text2 } }], { x: M, y: y0 + 3.58, w: lw, h: 0.72, fontSize: 12.5 });
  const gx = M + lw + 0.45, gw = R - gx;
  mono(s, 'VEHÍCULOS POR AÑO', { x: gx, y: y0, w: gw, h: 0.24, color: C.text1 });
  supuesto(s, 'ESTIMACIÓN · ESCENARIO BASE', R - 2.8, y0 - 0.03, 2.8, { align: 'center', size: 9 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
    { name: 'Kits a la red', labels: AÑOS, values: [0, 365, 1074, 3287, 7773] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 3.55, barDir: 'col', barGapWidthPct: 40, barOverlapPct: 0,
    chartColors: [HEX.accent5, HEX.accent1, HONDO], valAxisMinVal: 0, valAxisMaxVal: 8600, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;;', dataLabelFontSize: 10, dataLabelFontBold: true,
    catAxisLabelFontSize: 12, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 11.5, objectName: 'Pronóstico de ventas por año',
  }));
  T(s, [{ text: 'Pronóstico = el menor entre demanda y capacidad. ', options: { bold: true } }, { text: 'El resto lo atiende la red.', options: { color: C.text2 } }], { x: gx, y: y0 + 3.95, w: gw, h: 0.35, fontSize: 12.5 });
  return s;
};

// =====================================================================
// 3.1.8 PRESUPUESTO DE MARKETING
// =====================================================================
D['presupuesto-mkt'] = () => {
  const s = contenido('08', 'PLAN DE MARKETING · PRESUPUESTO', '$80,9 MILLONES EL PRIMER AÑO:', 'el 6,8% de los ingresos.');
  const y0 = 2.55, lw = 7.7;
  mono(s, 'POR PARTIDA · MILLONES DE PESOS NETOS', { x: M, y: y0, w: lw, h: 0.24, color: C.text1 });
  supuesto(s, 'PAUTA: DECISIÓN DE INVERSIÓN', M + lw - 2.9, y0 - 0.03, 2.9, { align: 'center', size: 9 });
  // Tabla N° 11 del informe, agrupada: clientes piloto, pauta digital, comisiones y el resto de las partidas
  s.addChart(pres.ChartType.bar, [
    { name: 'Clientes piloto', labels: AÑOS, values: [49.47, 23.75, 23.75, 23.75, 23.75] },
    { name: 'Pauta digital', labels: AÑOS, values: [14.40, 18.00, 24.00, 24.00, 30.00] },
    { name: 'Comisiones', labels: AÑOS, values: [4.92, 15.58, 30.30, 42.45, 56.98] },
    { name: 'Otras partidas', labels: AÑOS, values: [12.15, 22.65, 38.22, 44.14, 52.96] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.3, w: lw + 0.1, h: 3.95, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 45,
    chartColors: [HEX.accent1, HONDO, HEX.dk2, HEX.accent5], valAxisMinVal: 0, valAxisMaxVal: 180, valAxisMajorUnit: 40, valAxisLabelFontSize: 10.5,
    valAxisLabelFormatCode: '0', showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<9]"";0', dataLabelFontSize: 11, dataLabelColor: HEX.lt1, dataLabelFontBold: true,
    catAxisLabelFontSize: 12, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 11.5, objectName: 'Presupuesto de marketing por partida',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 4.25);
  visor(s, cx, y0, cw, 4.25);
  mono(s, 'TOTAL · MILLONES', { x: cx + 0.25, y: y0 + 0.18, w: 2.2, h: 0.22, color: C.accent1 });
  mono(s, '% INGRESOS', { x: cx + cw - 1.55, y: y0 + 0.18, w: 1.3, h: 0.22, align: 'right' });
  [['Año 1', '80,9', '6,8%'], ['Año 2', '80,0', '2,3%'], ['Año 3', '116,3', ''], ['Año 4', '134,3', ''], ['Año 5', '163,7', '1,5%']].forEach(([a, v, p], i) => {
    const y = y0 + 0.5 + i * 0.5;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent6);
    T(s, a, { x: cx + 0.25, y, w: 1.0, h: 0.5, valign: 'middle', fontSize: 14 });
    T(s, v, { x: cx + 1.2, y, w: 1.2, h: 0.5, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 21, color: i === 0 ? C.accent1 : C.text1 });
    T(s, p || '—', { x: cx + cw - 1.3, y, w: 1.05, h: 0.5, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 17, color: p ? C.text1 : C.accent5 });
  });
  const gy = y0 + 0.5 + 5 * 0.5;
  linea(s, cx + 0.25, gy, cw - 0.5, 0, C.accent1, 1);
  T(s, 'Cinco años', { x: cx + 0.25, y: gy, w: 1.4, h: 0.52, valign: 'middle', fontSize: 14, bold: true });
  T(s, '575,2', { x: cx + 1.2, y: gy, w: 1.2, h: 0.52, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 23, color: C.accent1 });
  T(s, 'Por objetivo y tarea, no por porcentaje de ventas.', { x: cx + 0.25, y: gy + 0.6, w: cw - 0.5, h: 0.55, fontSize: 12, color: C.text2 });
  return s;
};

// =====================================================================
// 3.2.1 ESTRUCTURA Y DOTACIÓN
// =====================================================================
D.estructura = () => {
  const s = contenido('09', 'RECURSOS HUMANOS · ESTRUCTURA Y DOTACIÓN', 'CRECE EL NÚMERO DE PERSONAS,', 'no la estructura.');
  const ox = M, ow = 7.75, y0 = 2.55;
  mono(s, 'ORGANIGRAMA · AL ABRIR → AÑO 5', { x: ox, y: y0, w: ow, h: 0.24, color: C.text1 });
  const n = 5, gap = 0.12, bw = (ow - (n - 1) * gap) / n, bh = 1.02;
  const gw = 2.9, gx = ox + (ow - gw) / 2, gy = y0 + 0.36, gh = 0.62;
  cajaHot(s, gx, gy, gw, gh);
  T(s, [{ text: 'Gerencia General', options: { bold: true, breakLine: true } }, { text: '1 · reporta a los accionistas', options: { color: C.accent1, fontSize: 11 } }], { x: gx, y: gy, w: gw, h: gh, align: 'center', valign: 'middle', fontSize: 13 });
  const ry = gy + gh + 0.42, busY = gy + gh + 0.2;
  linea(s, gx + gw / 2, gy + gh, 0, busY - gy - gh, C.text2, 0.75);
  linea(s, ox + bw / 2, busY, ow - bw, 0, C.text2, 0.75);
  [['Responsable Técnico', '1 → 3', false], ['Ingeniería de Calibración', '1 → 4', false], ['Comercial y Postventa', '1 → 4', false], ['Comercial de Empresas', '0 → 2', true], ['Admin. y Personas', '1', false]].forEach(([t, d, fut], i) => {
    const x = ox + i * (bw + gap);
    linea(s, x + bw / 2, busY, 0, ry - busY, C.text2, 0.75);
    if (fut) cajaFutura(s, x, ry, bw, bh); else caja(s, x, ry, bw, bh);
    T(s, t, { x: x + 0.05, y: ry + 0.06, w: bw - 0.1, h: 0.58, align: 'center', valign: 'middle', fontSize: 11.5, bold: true });
    numero(s, d, { x: x + 0.05, y: ry + 0.64, w: bw - 0.1, h: 0.32, align: 'center', valign: 'middle', fontSize: 16, color: fut ? C.text2 : C.accent1 });
  });
  const sy = ry + bh + 0.34, sh = 0.9;
  [[0, 'Técnicos instaladores', '2 → 36', false], [2, 'Asistente de Postventa', '0 → 4', true], [4, 'Asistente de Administración', '0 → 1', true]].forEach(([i, t, d, fut]) => {
    const x = ox + i * (bw + gap);
    linea(s, x + bw / 2, ry + bh, 0, sy - ry - bh, C.text2, 0.75);
    if (fut) cajaFutura(s, x, sy, bw, sh); else caja(s, x, sy, bw, sh);
    T(s, t, { x: x + 0.05, y: sy + 0.05, w: bw - 0.1, h: 0.52, align: 'center', valign: 'middle', fontSize: 11, bold: true });
    numero(s, d, { x: x + 0.05, y: sy + 0.56, w: bw - 0.1, h: 0.3, align: 'center', valign: 'middle', fontSize: 15, color: fut ? C.text2 : C.accent1 });
  });
  T(s, 'Punteado: ingresa después de abrir. Contabilidad, formación, legal y aduana son externos.', { x: ox, y: sy + sh + 0.16, w: ow, h: 0.5, fontSize: 12, color: C.text2 });
  const cx = ox + ow + 0.45, cw = R - cx;
  mono(s, 'DOTACIÓN AL CIERRE · PERSONAS', { x: cx, y: y0, w: cw, h: 0.24, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Técnicos', labels: ['Pre', 'A1', 'A2', 'A3', 'A4', 'A5'], values: [2, 8, 14, 24, 26, 36] },
    { name: 'Resto', labels: ['Pre', 'A1', 'A2', 'A3', 'A4', 'A5'], values: [3, 5, 7, 9, 14, 20] },
  ], Object.assign({}, ejes, {
    x: cx - 0.1, y: y0 + 0.3, w: cw + 0.1, h: 3.5, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
    chartColors: [HEX.accent1, HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 60, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<5]"";0', dataLabelFontSize: 11, dataLabelColor: HEX.lt1, dataLabelFontBold: true,
    catAxisLabelFontSize: 11, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 11, objectName: 'Dotación al cierre de cada año',
  }));
  T(s, [{ text: 'Total: ', options: { color: C.text2 } }, { text: '5 · 13 · 21 · 33 · 40 · 56', options: { bold: true } }], { x: cx, y: y0 + 3.88, w: cw, h: 0.32, fontSize: 13.5 });
  return s;
};

// =====================================================================
// 3.2.3 Y 3.2.4 POLÍTICA Y PRESUPUESTO DE RECURSOS HUMANOS
// =====================================================================
D.rrhh = () => {
  const s = contenido('10', 'RECURSOS HUMANOS · POLÍTICA Y PRESUPUESTO', 'TÉCNICOS FORMADOS EN CASA,', 'costo a la mitad.');
  const y0 = 2.55, lw = 6.3;
  mono(s, 'LUMINE HABILITA · RENTA BRUTA Y BONO POR NIVEL', { x: M, y: y0, w: lw, h: 0.24, color: C.text1 });
  T(s, 'N1 a N4: niveles de habilitación, de aprendiz a formador.', { x: M, y: y0 + 0.28, w: lw, h: 0.3, fontSize: 12, color: C.text2 });
  const niv = [['N1', 'Acompaña', '$750.000', null], ['N2', 'Instala supervisado', '$850.000', '$200.000'], ['N3', 'Trabaja solo', '$1.000.000', '$300.000'], ['N4', 'Forma y valida', '$1.150.000', '$350.000']];
  const gap = 0.12, sw = (lw - 3 * gap) / 4, base = y0 + 3.48;
  niv.forEach(([k, d, r, b], i) => {
    const x = M + i * (sw + gap), h = 1.75 + i * 0.36, y = base - h, hot = i === 3;
    if (hot) cajaHot(s, x, y, sw, h); else caja(s, x, y, sw, h);
    tag(s, k, x + 0.13, y + 0.15, { off: i < 2 });
    T(s, d, { x: x + 0.13, y: y + 0.5, w: sw - 0.2, h: 0.5, fontSize: 12.5, bold: true });
    numero(s, r, { x: x + 0.1, y: y + h - 0.78, w: sw - 0.15, h: 0.4, fontSize: 19, valign: 'top', color: hot ? C.accent1 : C.text1 });
    mono(s, b ? '+ BONO ' + b : 'SIN BONO', { x: x + 0.13, y: y + h - 0.36, w: sw - 0.2, h: 0.22, fontSize: 8.5, color: b ? C.accent1 : C.text2, charSpacing: 0.6 });
  });
  const ny = base + 0.18, nw = (lw - 0.4) / 3;
  [['~8 MESES', 'hasta el N4'], ['DÚOS FIJOS', 'siempre con N3 o N4'], ['24 MESES', 'revalidar seguridad']].forEach(([k, d], i) => {
    const x = M + i * (nw + 0.2);
    regla(s, ny, x, nw);
    mono(s, k, { x, y: ny + 0.08, w: nw, h: 0.22, color: C.accent1 });
    T(s, d, { x, y: ny + 0.33, w: nw, h: 0.3, fontSize: 12.5, color: C.text2 });
  });
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'NÓMINA · MILLONES DE $', { x: gx, y: y0, w: gw, h: 0.24, color: C.text1 });
  supuesto(s, 'SUPUESTO: SIN REAJUSTES', R - 2.4, y0 - 0.03, 2.4, { align: 'center', size: 8.5 });
  s.addChart(pres.ChartType.bar, [{ name: 'Costo empresa', labels: AÑOS, values: [152.0, 265.6, 430.4, 574.7, 755.1] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.3, w: gw + 0.1, h: 2.7, barDir: 'col', barGapWidthPct: 45,
    chartColors: [HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 880, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 12.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 12, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Costo empresa de la nómina por año',
  }));
  const cy = y0 + 3.1;
  regla(s, cy, gx, gw, C.accent1);
  mono(s, 'NÓMINA POR INSTALACIÓN PROPIA · MILES DE $', { x: gx, y: cy + 0.08, w: gw, h: 0.22, color: C.accent1 });
  const plotX = gx + 0.12, colW = (gw - 0.2) / 5;
  ['508', '306', '257', '253', '265'].forEach((v, i) => numero(s, v, { x: plotX + i * colW, y: cy + 0.36, w: colW, h: 0.42, fontSize: 22, valign: 'top', align: 'center', color: i === 3 ? C.accent1 : C.text1 }));
  T(s, 'Los cargos fijos se reparten en más autos.', { x: gx, y: cy + 0.84, w: gw, h: 0.3, fontSize: 12, color: C.text2 });
  return s;
};

// =====================================================================
// 3.3.1 FLUJO OPERACIONAL
// =====================================================================
D.flujo = () => {
  const s = contenido('11', 'OPERACIONES · FLUJO OPERACIONAL', 'EL NEGOCIO MIDE Y RECOMIENDA;', 'el cliente decide.');
  const y0 = 2.5, n = 5, gap = 0.16, cw = (CW - (n - 1) * gap) / n;
  ['CAPTACIÓN', 'ASESORÍA', 'TALLER', 'CERTIFICACIÓN', 'POSTVENTA'].forEach((e, i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    s.addText('', { shape: i === 0 ? S.homePlate : S.chevron, x, y: y0, w: cw + (i < n - 1 ? 0.12 : 0), h: 0.44, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    T(s, [{ text: '0' + (i + 1) + '  ', options: { color: hot ? C.background1 : C.accent1 } }, { text: e }], { x: x + 0.24, y: y0, w: cw - 0.3, h: 0.44, valign: 'middle', fontFace: F_MONO, fontSize: 10, bold: true, color: hot ? C.background1 : C.text1, charSpacing: 1 });
  });
  const bx = i => M + i * (cw + gap) + 0.04, bw = cw - 0.08, t0 = y0 + 0.62, bh = 0.72, g = 0.16, rh = 0.88;
  const abajo = (i, y, col = C.text2) => flecha(s, bx(i) + bw / 2, y, 0, g, col, 1);
  const p = (i, y, txt, o = {}) => paso(s, txt, bx(i), y, bw, o.h || bh, Object.assign({ size: 12 }, o));
  // 1 · captación
  p(0, t0, 'Cotiza con el estimador web'); abajo(0, t0 + bh);
  rombo(s, '¿Modelo calibrado?', bx(0) + 0.05, t0 + bh + g, bw - 0.1, rh);
  abajo(0, t0 + bh + g + rh, C.accent3);
  mono(s, 'NO', { x: bx(0) + bw / 2 + 0.07, y: t0 + bh + g + rh, w: 0.4, h: 0.18, fontSize: 9, color: C.accent3 });
  p(0, t0 + bh + 2 * g + rh, 'Se registra la demanda', { alerta: true, h: 0.62 });
  // 2 · asesoría y decisión
  p(1, t0, 'Asesoría por versión del kit'); abajo(1, t0 + bh);
  p(1, t0 + bh + g, 'Medición opcional de una semana', { futuro: true });
  abajo(1, t0 + 2 * bh + g);
  rombo(s, '¿Decide instalar?', bx(1) + 0.05, t0 + 2 * bh + 2 * g, bw - 0.1, rh);
  mono(s, 'NO: QUEDA INFORMADO', { x: bx(1), y: t0 + 2 * bh + 2 * g + rh + 0.04, w: bw, h: 0.22, fontSize: 9, align: 'center' });
  // 3 · taller
  p(2, t0, 'Una jornada: 8,4 horas', { hot: true, bold: true }); abajo(2, t0 + bh);
  mono(s, 'CUATRO CONTROLES', { x: bx(2), y: t0 + bh + g + 0.02, w: bw, h: 0.22, fontSize: 9, align: 'center', color: C.accent1 });
  ['Vehículo apto', 'Masa y ejes', 'Aislación', 'Dinamómetro'].forEach((c, k) => {
    const y = t0 + bh + g + 0.32 + k * 0.4;
    s.addShape(S.diamond, { x: bx(2) + 0.2, y: y + 0.09, w: 0.2, h: 0.2, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, c, { x: bx(2) + 0.5, y, w: bw - 0.55, h: 0.38, valign: 'middle', fontSize: 12.5 });
  });
  // 4 · certificación
  p(3, t0, 'El Responsable Técnico firma el certificado'); abajo(3, t0 + bh);
  p(3, t0 + bh + g, 'Entrega y línea base de ahorro'); abajo(3, t0 + 2 * bh + g);
  p(3, t0 + 2 * bh + 2 * g, 'Revisión técnica del cliente', { futuro: true });
  // 5 · postventa
  p(4, t0, 'Informe de ahorro a los 3 meses'); abajo(4, t0 + bh);
  rombo(s, '¿Se desvía del estimado?', bx(4) + 0.05, t0 + bh + g, bw - 0.1, rh);
  abajo(4, t0 + bh + g + rh, C.accent1);
  mono(s, 'SÍ', { x: bx(4) + bw / 2 + 0.07, y: t0 + bh + g + rh, w: 0.4, h: 0.18, fontSize: 9, color: C.accent1 });
  p(4, t0 + bh + 2 * g + rh, 'Recalibra y mejora la biblioteca', { h: 0.72 });
  // recursos críticos
  const by = 6.08, iw = (CW - 0.6) / 3;
  regla(s, by - 0.1, M, CW, C.accent1);
  [['LÍMITE DE CAPACIDAD', 'Las horas de los dúos.'], ['DINAMÓMETRO', 'Uno por local basta (54% con seis dúos).'], ['BIBLIOTECA', 'Limita qué modelos se venden.']].forEach(([k, d], i) => {
    const x = M + i * (iw + 0.3);
    punto(s, x, by + 0.08, i === 0 ? C.accent1 : C.text2);
    mono(s, k, { x: x + 0.17, y: by, w: iw, h: 0.24, valign: 'middle', color: C.text1 });
    T(s, d, { x, y: by + 0.28, w: iw, h: 0.32, fontSize: 12.5, color: C.text2 });
  });
  return s;
};

// =====================================================================
// 3.3.2 CARTA GANTT (línea de tiempo dibujada)
// =====================================================================
D.gantt = () => {
  const s = contenido('12', 'OPERACIONES · CARTA GANTT DE IMPLEMENTACIÓN', 'ABRIR EN ENERO DE 2027', 'depende de un reglamento.');
  // eje: meses −3 a 12 en detalle; años 2 a 5 por trimestre (31 columnas iguales)
  const x0 = 4.6, xw = R - x0, u = xw / 31;
  const P = m => x0 + u * (m < 0 ? m + 3 : m <= 13 ? m + 2 : 15 + (m - 13) / 3); // inicio del mes m (mes 1 = enero 2027)
  const top = 2.85, rh = 0.31, gapG = 0.1;
  const grupos = [
    ['PREAPERTURA', [
      ['Investigación de mercado', [['bar', -3, 1, 'p', 'terreno y encuesta']]],
      ['Local, permisos y financiamiento', [['bar', -3, 1, 'p', 'a cargo de los socios']]],
      ['Homologación y primer dúo', [['bar', -2, 1, 'p', 'con el auto del cliente piloto']]],
      ['Reglamento de la Ley 21.793', [['star', -1, 'debe estar vigente antes de vender']]],
    ]],
    ['TALLER 1', [
      ['Apertura y dúos 1 a 6', [['hito', 1, '1'], ['bar', 4, 6, 'o'], ['hito', 6, '2'], ['bar', 10, 12, 'o'], ['hito', 12, '3'], ['bar', 12, 14, 'o'], ['hito', 14, '4'], ['bar', 16, 18, 'o'], ['hito', 18, '5'], ['bar', 18, 20, 'o'], ['hito', 20, '6']]],
    ]],
    ['BIBLIOTECA Y RED', [
      ['Calibración de modelos', [['bar', 1, 13, 'p', 'dos al mes', true], ['bar', 13, 61, 'o', 'uno al mes', true]]],
      ['Red certificada', [['bar', 13, 61, 'p'], ['n', 25, '3'], ['n', 37, '9'], ['n', 49, '20'], ['n', 61, '42']]],
      ['Flotas y colectivos', [['bar', 25, 61, 'o', 'desde el año 3', true]]],
    ]],
    ['TALLERES 2 Y 3', [
      ['Taller 2', [['izq', 22, 'abre en el mes 25; seis dúos en el 36'], ['bar', 22, 25, 'a'], ['bar', 25, 37, 'o'], ['hito', 25]]],
      ['Taller 3', [['izq', 46, 'abre en el mes 49; seis dúos en el 60'], ['bar', 46, 49, 'a'], ['bar', 49, 61, 'o'], ['hito', 49]]],
    ]],
  ];
  const nFilas = grupos.reduce((a, g) => a + g[1].length, 0);
  const bottom = top + nFilas * rh + (grupos.length - 1) * gapG;
  [['2026', -3, 1], ['AÑO 1 · 2027', 1, 13], ['AÑO 2', 13, 25], ['AÑO 3', 25, 37], ['AÑO 4', 37, 49], ['AÑO 5', 49, 61]].forEach(([t, a, b], i) => {
    mono(s, t, { x: P(a), y: top - 0.32, w: P(b) - P(a), h: 0.24, fontSize: 9.5, align: 'center', color: i === 1 ? C.accent1 : C.text1 });
    if (i > 0) linea(s, P(a), top - 0.06, 0, bottom - top + 0.12, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  const meses = ['o', 'n', 'd', 'e', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];
  for (let c = 0; c < 31; c++) {
    const l = c < 15 ? meses[c] : 'T' + ((c - 15) % 4 + 1);
    mono(s, l, { x: x0 + c * u, y: bottom + 0.08, w: u, h: 0.22, fontSize: 8.5, align: 'center', charSpacing: 0 });
  }
  let y = top;
  const col = { p: C.accent1, o: '1D4F66', a: C.accent3 };
  grupos.forEach(([g, filas], gi) => {
    if (gi) { regla(s, y + gapG / 2 - 0.01, M, CW, C.accent6); y += gapG; }
    mono(s, g, { x: M, y, w: 1.25, h: filas.length * rh, fontSize: 8.5, color: C.accent1, valign: filas.length > 1 ? 'top' : 'middle', charSpacing: 1 });
    filas.forEach(([nom, items]) => {
      T(s, nom, { x: M + 1.2, y, w: x0 - M - 1.32, h: rh, align: 'right', valign: 'middle', fontSize: 11.5 });
      items.forEach(it => {
        const cy = y + rh / 2;
        if (it[0] === 'bar') {
          const [, a, b, c, txt, dentro] = it, bx = P(a), bw = P(b) - P(a);
          s.addShape(S.rect, { x: bx, y: y + 0.04, w: bw, h: rh - 0.08, fill: { color: col[c] }, line: { type: 'none' } });
          if (txt && dentro) T(s, txt, { x: bx, y, w: bw, h: rh, align: 'center', valign: 'middle', fontSize: 10, bold: true, color: c === 'p' ? C.background1 : C.text1 });
          else if (txt) T(s, txt, { x: bx + bw + 0.08, y, w: 3.4, h: rh, valign: 'middle', fontSize: 11, color: C.text2 });
        } else if (it[0] === 'hito') {
          const [, m, txt] = it, hx = P(m);
          s.addShape(S.diamond, { x: hx - 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: C.text1 }, line: { color: C.background1, width: 0.5 } });
          if (txt) mono(s, txt, { x: hx - 0.2, y: y - 0.15, w: 0.4, h: 0.17, fontSize: 9, align: 'center', color: C.text1 });
        } else if (it[0] === 'star') {
          const [, m, txt] = it, hx = P(m) + u / 2;
          s.addShape(S.star5, { x: hx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: C.accent3 }, line: { type: 'none' } });
          T(s, txt, { x: hx + 0.2, y, w: 4.2, h: rh, valign: 'middle', fontSize: 11, color: C.accent3, bold: true });
        } else if (it[0] === 'izq') {
          const [, m, txt] = it;
          T(s, txt, { x: P(m) - 4.1, y, w: 4.0, h: rh, align: 'right', valign: 'middle', fontSize: 11, color: C.text2 });
        } else if (it[0] === 'n') {
          const [, m, txt] = it;
          mono(s, txt, { x: P(m) - 0.5, y, w: 0.44, h: rh, fontSize: 9.5, align: 'right', valign: 'middle', color: C.background1, bold: true });
        }
      });
      y += rh;
    });
  });
  const ly = bottom + 0.42;
  let lx = M;
  [['rect', C.accent1, 'Actividad principal'], ['rect', '1D4F66', 'Operación'], ['rect', C.accent3, 'Preapertura de taller'], ['diamond', C.text1, 'Hito (dúo o apertura)'], ['star5', C.accent3, 'Hito crítico']].forEach(([sh, c, t]) => {
    s.addShape(S[sh], { x: lx, y: ly + 0.04, w: 0.16, h: 0.16, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.24, y: ly, w: 2.3, h: 0.24, fontSize: 11, valign: 'middle', color: C.text2 });
    lx += 2.45;
  });
  return s;
};

// =====================================================================
// 3.3.3 PRESUPUESTO DE OPERACIONES
// =====================================================================
D['presupuesto-ops'] = () => {
  const s = contenido('13', 'OPERACIONES · PRESUPUESTO Y RESULTADO', 'GANANCIA DESDE EL AÑO 2;', 'el riesgo es el dólar.');
  const y0 = 2.55, lw = 7.4;
  mono(s, 'RESULTADO POR LÍNEA · MILLONES DE PESOS', { x: M, y: y0, w: lw, h: 0.24, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Línea propia', labels: AÑOS, values: [-130.2, 159.9, 444.8, 694.7, 869.9] },
    { name: 'Red certificada', labels: AÑOS, values: [0, 142.1, 415.2, 1233.2, 2889.5] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.3, w: lw + 0.1, h: 3.4, barDir: 'col', barGapWidthPct: 45,
    chartColors: [HEX.accent1, HONDO], valAxisMinVal: -450, valAxisMaxVal: 3300, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;-#,##0;;', dataLabelFontSize: 11.5, dataLabelFontBold: true,
    catAxisLabelFontSize: 12, catAxisLabelColor: HEX.dk1, catAxisLabelPos: 'low', showLegend: true, legendPos: 't', legendFontSize: 12, objectName: 'Resultado referencial por línea de negocio',
  }));
  T(s, [{ text: 'Margen propio: ', options: { color: C.text2 } }, { text: '−11% → 7,7%', options: { bold: true } }, { text: ' · red: cerca de 10%', options: { color: C.text2 } }], { x: M, y: y0 + 3.78, w: lw, h: 0.32, fontSize: 13 });
  supuesto(s, 'REFERENCIAL: SIN IMPUESTOS NI DEPRECIACIÓN · 60% PLUS (SUPUESTO)', M, y0 + 4.14, lw, { size: 8.5, h: 0.26 });
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 1.55);
  mono(s, 'INVERSIÓN POR LOCAL', { x: cx + 0.22, y: y0 + 0.15, w: cw - 0.44, h: 0.22, color: C.accent1 });
  numero(s, '$81,3 M', { x: cx + 0.22, y: y0 + 0.42, w: 2.3, h: 0.62, fontSize: 34, valign: 'top' });
  T(s, 'Casi la mitad, en el dinamómetro.', { x: cx + 2.45, y: y0 + 0.46, w: cw - 2.65, h: 0.9, fontSize: 12.5, color: C.text2 });
  const sy = y0 + 1.78;
  caja(s, cx, sy, cw, 2.47);
  visor(s, cx, sy, cw, 2.47);
  mono(s, 'RESULTADO PROPIO AÑO 5', { x: cx + 0.22, y: sy + 0.15, w: cw - 0.44, h: 0.22, color: C.accent1 });
  const bx = cx + 1.65, bmax = cw - 3.05;
  [['Dólar −10%', 1646.9], ['Base', 869.9], ['Dólar +10%', 92.9]].forEach(([k, v], i) => {
    const y = sy + 0.5 + i * 0.5;
    T(s, k, { x: cx + 0.22, y, w: 1.4, h: 0.44, valign: 'middle', fontSize: 12.5 });
    s.addShape(S.rect, { x: bx, y: y + 0.1, w: Math.max(0.04, bmax * v / 1646.9), h: 0.24, fill: { color: i === 2 ? C.accent4 : i === 1 ? C.accent1 : C.text2 }, line: { type: 'none' } });
    T(s, dec(v), { x: bx + bmax * v / 1646.9 + 0.08, y, w: 1.2, h: 0.44, valign: 'middle', fontFace: F_CON, bold: true, fontSize: 16 });
  });
  T(s, 'El 82% del costo del kit está en dólares.', { x: cx + 0.22, y: sy + 2.0, w: cw - 0.44, h: 0.4, fontSize: 12, color: C.text2 });
  return s;
};

// =====================================================================
// 3.4 CONCLUSIONES
// =====================================================================
D.conclusiones = () => {
  const s = contenido('14', 'CONCLUSIONES DEL CAPÍTULO', 'TRES CONCLUSIONES', 'y dos preguntas por resolver.');
  const y0 = 2.55, n = 3, gap = 0.25, cw = (CW - (n - 1) * gap) / n, ch = 2.1;
  [['LA OPORTUNIDAD EXISTE', '367 > 299', 'Demanda atendible frente a instalaciones del año 1: crecer depende de técnicos y espacio.'],
   ['HAY ESPACIO COMPETITIVO', 'ÚNICA', 'Alternativa que ahorra sin cambiar de auto; la biblioteca es la ventaja y la red la escala.'],
   ['UN MISMO GATILLO', '80%', 'De capacidad: suma dúos, personas y talleres. Cada línea gana desde el año 2.']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    tag(s, '0' + (i + 1), x + 0.2, y0 + 0.18);
    mono(s, k, { x: x + 0.68, y: y0 + 0.18, w: cw - 0.85, h: 0.27, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    numero(s, v, { x: x + 0.2, y: y0 + 0.52, w: cw - 0.4, h: 0.62, fontSize: 38, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.2, y: y0 + 1.16, w: cw - 0.4, h: 0.88, fontSize: 12.5 });
  });
  const ry = y0 + ch + 0.22, tw = (CW - 0.3) / 3, tyy = ry;
  [['AÑO 1 · PROBAR', '299 instalaciones y 3 casos medidos.'], ['AÑOS 2 Y 3 · SUMAR LA RED', 'Regiones y segundo taller.'], ['AÑOS 4 Y 5 · ESCALAR', 'Tres talleres, red de 42, 56 personas.']].forEach(([a, d], i) => {
    const x = M + i * (tw + 0.15);
    s.addText('', { shape: i === 0 ? S.homePlate : S.chevron, x, y: tyy, w: tw + 0.12, h: 0.38, fill: { color: i === 0 ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    mono(s, a, { x: x + 0.25, y: tyy, w: tw - 0.4, h: 0.38, valign: 'middle', fontSize: 9.5, bold: true, color: i === 0 ? C.background1 : C.text1 });
    T(s, d, { x, y: tyy + 0.46, w: tw - 0.15, h: 0.32, fontSize: 12.5, color: C.text2 });
  });
  const qy = 5.98;
  regla(s, qy - 0.1, M, CW, C.accent3);
  mono(s, 'POR RESOLVER', { x: M, y: qy, w: 5, h: 0.24, color: C.accent3 });
  const qw = (CW - 3.0) / 2;
  ['¿El reglamento admitirá el kit aditivo, y desde cuándo?', '¿El ahorro medido y la encuesta confirman los precios?'].forEach((q, i) => {
    T(s, q, { x: M + i * (qw + 0.3), y: qy + 0.27, w: qw, h: 0.6, fontFace: F_SER, italic: true, fontSize: 17, color: C.text1 });
  });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 2.6, y: qy + 0.32, w: 2.6, h: 0.4, valign: 'middle', align: 'right', fontSize: 11, color: C.accent1 });
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
