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
// Criterio de diseño (profesor guía y equipo: «textos pequeños», «sobrecargada»):
// una idea por diapositiva, un solo visual y pocas palabras. Texto principal de 15 pt o más,
// etiquetas de 10,5 pt o más y cifras grandes. El detalle lo dice el orador o va al anexo.
// =====================================================================
const ETQ = 12; // tamaño mínimo de etiquetas mono (pensado para quien ve desde el fondo de la sala)
D.objetivos = () => {
  const s = contenido('01', 'PLAN DE MARKETING · OBJETIVOS', '299 VEHÍCULOS EL PRIMER AÑO,', 'la referencia al quinto.');
  T(s, [{ text: 'Meta a cinco años: ', options: { bold: true } }, { text: 'ser la referencia de la hibridación de posventa en Chile.', options: { color: C.text2 } }], { x: M, y: 2.45, w: CW, h: 0.42, fontSize: 18 });
  mono(s, 'METAS DEL PRIMER AÑO', { x: M, y: 3.05, w: 5, h: 0.26, fontSize: ETQ, color: C.text1 });
  porConfirmar(s, R - 2.6, 3.0, 2.6, { size: 11, h: 0.32, align: 'center' });
  mono(s, 'COTIZACIONES DIGITALES:', { x: R - 7.0, y: 3.03, w: 4.3, h: 0.28, fontSize: ETQ, align: 'right' });
  const n = 4, gap = 0.3, tw = (CW - (n - 1) * gap) / n, ty = 3.42, th = 1.65;
  [['299', 'instalaciones'], ['3', 'casos con ahorro medido'], ['80%', 'clientes satisfechos'], ['15%', 'llega por recomendación']].forEach(([v, k], i) => {
    const x = M + i * (tw + gap);
    if (i === 0) cajaHot(s, x, ty, tw, th); else caja(s, x, ty, tw, th);
    numero(s, v, { x: x + 0.25, y: ty + 0.12, w: tw - 0.5, h: 0.9, fontSize: 60, color: i === 0 ? C.accent1 : C.text1 });
    T(s, k, { x: x + 0.25, y: ty + 1.08, w: tw - 0.4, h: 0.45, fontSize: 16 });
  });
  const hy = 5.35;
  mono(s, 'INSTALACIONES PROPIAS POR AÑO', { x: M, y: hy, w: 6, h: 0.26, fontSize: ETQ, color: C.text1 });
  supuesto(s, 'PRONÓSTICO', R - 1.9, hy - 0.02, 1.9, { align: 'center', size: 10 });
  const lx = M + 0.2, lw = CW - 0.4, ly = hy + 0.72, step = lw / 4;
  linea(s, lx, ly, lw, 0, C.accent5, 1.25);
  [['AÑO 1', '299'], ['AÑO 2', '869'], ['AÑO 3', '1.674'], ['AÑO 4', '2.268'], ['AÑO 5', '2.851']].forEach(([a, v], i) => {
    const cx = lx + i * step, bw = 2.4, bx = Math.min(Math.max(cx - bw / 2, M), R - bw);
    const al = i === 0 ? 'left' : i === 4 ? 'right' : 'center';
    s.addShape(S.ellipse, { x: cx - 0.08, y: ly - 0.08, w: 0.16, h: 0.16, fill: { color: i === 0 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 1.25 } });
    mono(s, a, { x: bx, y: ly - 0.4, w: bw, h: 0.24, fontSize: ETQ, align: al, color: C.accent1 });
    numero(s, v, { x: bx, y: ly + 0.12, w: bw, h: 0.55, fontSize: 34, valign: 'top', align: al });
  });
  return s;
};

// =====================================================================
// 3.1.2 SEGMENTACIÓN
// =====================================================================
D.segmentacion = () => {
  const s = contenido('02', 'PLAN DE MARKETING · SEGMENTACIÓN', 'EL CLIENTE SE DEFINE POR SU AUTO,', 'no por su edad.');
  T(s, [{ text: 'Condición: ', options: { bold: true } }, { text: 'auto liviano, a combustión y con tracción delantera.', options: { color: C.text2 } }], { x: M, y: 2.45, w: CW, h: 0.42, fontSize: 18 });
  const n = 4, gap = 0.3, cw = (CW - (n - 1) * gap) / n, cy = 3.1, ch = 2.1;
  [['GEOGRÁFICA', '36,8%', 'del parque, en la Región Metropolitana (RM)'], ['DEMOGRÁFICA', '4 roles', 'usa, decide, paga o influye'], ['PSICOGRÁFICA', '5 motivos', 'el ahorro es uno de ellos'], ['CONDUCTUAL', '6 ejes', 'la intensidad de uso es la que manda']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap), hot = i === 3;
    if (hot) cajaHot(s, x, cy, cw, ch); else caja(s, x, cy, cw, ch);
    mono(s, k, { x: x + 0.22, y: cy + 0.18, w: cw - 0.44, h: 0.26, fontSize: ETQ, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: x + 0.22, y: cy + 0.5, w: cw - 0.44, h: 0.7, fontSize: 40, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.22, y: cy + 1.22, w: cw - 0.4, h: 0.8, fontSize: 16, color: C.text2 });
  });
  const by = 5.55;
  regla(s, by - 0.12, M, CW, C.accent1);
  mono(s, 'PUNTO DE ENTRADA', { x: M, y: by, w: 4, h: 0.26, fontSize: ETQ, color: C.accent1 });
  T(s, 'Uso laboral intensivo en la RM: colectivos, taxis y aplicaciones.', { x: M, y: by + 0.34, w: CW, h: 0.5, fontSize: 21, bold: true });
  return s;
};

// =====================================================================
// 3.1.3 INVESTIGACIÓN DE MERCADO
// =====================================================================
D.investigacion = () => {
  const s = contenido('03', 'PLAN DE MARKETING · INVESTIGACIÓN DE MERCADO', 'SEIS HIPÓTESIS', 'antes de fijar el precio.');
  const y0 = 2.55, n = 4, gap = 0.35, cw = (CW - (n - 1) * gap) / n, ch = 2.35;
  [['EXPLORATORIA', '1', 'conductor de aplicaciones', true], ['EXPERTOS', '4', 'expertos del rubro', false], ['CLIENTES', '5', 'perfiles de cliente', false], ['ENCUESTA', '150', 'encuestas por cuotas', false]].forEach(([k, v, u, hecho], i) => {
    const x = M + i * (cw + gap);
    caja(s, x, y0, cw, ch);
    if (i < n - 1) flecha(s, x + cw + 0.04, y0 + ch / 2, gap - 0.08, 0, C.accent1, 1.5);
    mono(s, k, { x: x + 0.22, y: y0 + 0.2, w: cw - 0.44, h: 0.26, fontSize: ETQ, color: hecho ? C.accent1 : C.text1 });
    numero(s, v, { x: x + 0.22, y: y0 + 0.5, w: cw - 0.44, h: 0.82, fontSize: 54, valign: 'top', color: hecho ? C.accent1 : C.text1 });
    T(s, u, { x: x + 0.22, y: y0 + 1.32, w: cw - 0.4, h: 0.5, fontSize: 15 });
    chip(s, hecho ? 'REALIZADA' : 'POR REALIZAR', x + 0.22, y0 + ch - 0.48, 1.9, hecho ? C.accent2 : C.accent3, { size: 10, h: 0.32 });
  });
  const by = 5.25;
  mono(s, 'LA HIPÓTESIS QUE MÁS DECIDE', { x: M, y: by, w: 6, h: 0.26, fontSize: ETQ, color: C.text1 });
  T(s, '«La barrera es la confianza, no el precio.»', { x: M, y: by + 0.32, w: CW, h: 0.65, fontFace: F_SER, italic: true, fontSize: 30, color: C.accent1 });
  T(s, 'Muestra por cuotas: resultados indicativos (±8% con 150 casos).', { x: M, y: by + 1.0, w: CW, h: 0.4, fontSize: 16, color: C.text2 });
  return s;
};

// =====================================================================
// 3.1.4 MATRIZ DE ANSOFF Y VENTAJA COMPETITIVA
// =====================================================================
D.ansoff = () => {
  const s = contenido('04', 'PLAN DE MARKETING · MATRIZ DE ANSOFF', 'UN PRODUCTO NUEVO', 'en un mercado que ya existe.');
  const gx = M + 0.6, gw = 7.7, gapX = 0.55, gapY = 0.5, qw = (gw - gapX) / 2, gy = 2.92, qh = 1.68;
  mono(s, 'PRODUCTO EXISTENTE', { x: gx, y: 2.52, w: qw, h: 0.26, fontSize: ETQ, align: 'center', color: C.text1 });
  mono(s, 'PRODUCTO NUEVO', { x: gx + qw + gapX, y: 2.52, w: qw, h: 0.26, fontSize: ETQ, align: 'center', color: C.text1 });
  T(s, 'MERCADO EXISTENTE', { x: M - 0.8, y: gy + qh / 2 - 0.14, w: 2.0, h: 0.28, rotate: 270, fontFace: F_MONO, fontSize: 10, color: C.text1, charSpacing: 1.5, align: 'center' });
  T(s, 'MERCADO NUEVO', { x: M - 0.8, y: gy + qh + gapY + qh / 2 - 0.14, w: 2.0, h: 0.28, rotate: 270, fontFace: F_MONO, fontSize: 10, color: C.text1, charSpacing: 1.5, align: 'center' });
  [[0, 0, 'Penetración', 'AÑO 2', 'Más clientes, mismo mercado', 'normal'], [1, 0, 'Desarrollo de producto', 'AÑO 1 · ENTRADA', 'Sin oferta en Chile', 'hot'], [0, 1, 'Desarrollo de mercado', 'AÑO 3', 'Flotas y regiones', 'normal'], [1, 1, 'Diversificación', 'DESDE EL AÑO 2', 'Calibración y kits para talleres', 'futuro']].forEach(([c, r, t, a, d, st]) => {
    const x = gx + c * (qw + gapX), y = gy + r * (qh + gapY);
    if (st === 'hot') cajaHot(s, x, y, qw, qh);
    else if (st === 'futuro') caja(s, x, y, qw, qh, { fill: { color: HOT }, line: { color: C.accent1, width: 1, dashType: 'dash' } });
    else caja(s, x, y, qw, qh);
    mono(s, a, { x: x + 0.22, y: y + 0.18, w: qw - 0.44, h: 0.26, fontSize: ETQ, color: C.accent1 });
    T(s, t, { x: x + 0.22, y: y + 0.5, w: qw - 0.44, h: 0.42, fontSize: 18, bold: true });
    T(s, d, { x: x + 0.22, y: y + 0.98, w: qw - 0.44, h: 0.6, fontSize: 16, color: st === 'normal' ? C.text2 : C.text1 });
  });
  flecha(s, gx + qw + gapX - 0.05, gy + qh / 2, -(gapX - 0.1), 0, C.accent1, 1.5);
  flecha(s, gx + 0.45, gy + qh + 0.05, 0, gapY - 0.1, C.accent1, 1.5);
  flecha(s, gx + 2 * qw + gapX - 0.45, gy + qh + 0.05, 0, gapY - 0.1, C.accent1, 1.5, 'dash');
  // la ventaja competitiva, dicha explícitamente (observación del profesor guía)
  const cx = gx + gw + 0.45, cw = R - cx, cy = gy, ch = 2 * qh + gapY;
  cajaHot(s, cx, cy, cw, ch);
  mono(s, 'VENTAJA COMPETITIVA', { x: cx + 0.25, y: cy + 0.22, w: cw - 0.5, h: 0.26, fontSize: ETQ, color: C.accent1 });
  T(s, 'La biblioteca de calibraciones', { x: cx + 0.25, y: cy + 0.6, w: cw - 0.5, h: 0.95, fontSize: 24, bold: true });
  T(s, 'Sostenible: crece con cada instalación y es lo más difícil de copiar.', { x: cx + 0.25, y: cy + 1.62, w: cw - 0.5, h: 1.05, fontSize: 16, color: C.text2 });
  regla(s, cy + 2.75, cx + 0.25, cw - 0.5);
  T(s, 'Por eso la red parte en el año 2: se vende mientras es exclusiva.', { x: cx + 0.25, y: cy + 2.88, w: cw - 0.5, h: 0.95, fontSize: 16, color: C.text1 });
  return s;
};

// =====================================================================
// 3.1.5 POSICIONAMIENTO
// =====================================================================
D.posicionamiento = () => {
  const s = contenido('05', 'PLAN DE MARKETING · POSICIONAMIENTO', 'EL ESPACIO VACÍO:', 'ahorrar sin cambiar de auto.');
  const px = 3.35, pw = R - px, rows = [[2.62, 1.4], [4.12, 0.95], [5.17, 1.25]];
  const lo = Math.log10(0.5), hi = Math.log10(26), x0 = px + 1.05, xw = pw - 1.2;
  const X = v => v === 0 ? px + 0.45 : x0 + (Math.log10(v) - lo) / (hi - lo) * xw;
  [['Conserva su auto', 'sin límite de edad'], ['Conserva su auto', 'con límite de edad'], ['Cambia de auto', '']].forEach(([a, b], i) => {
    const [y, h] = rows[i];
    s.addShape(S.rect, { x: px, y, w: pw, h, fill: { color: i === 0 ? HOT : C.background2 }, line: { type: 'none' } });
    T(s, b ? [{ text: a, options: { breakLine: true, bold: i === 0 } }, { text: b, options: { color: C.text2 } }] : a, { x: M, y, w: px - M - 0.2, h, align: 'right', valign: 'middle', fontSize: 15 });
  });
  supuesto(s, 'LUMINE: PRECIO DE REFERENCIA Y AHORRO SIMULADO', R - 5.2, 2.22, 5.2, { size: 10, align: 'center', h: 0.3 });
  const ay = 6.47;
  linea(s, px, ay, pw, 0, C.text2, 0.75);
  [[0, '$0'], [1, '$1 M'], [5, '$5 M'], [10, '$10 M'], [20, '$20 M']].forEach(([v, l]) => {
    linea(s, X(v), ay, 0, 0.06, C.text2, 0.75);
    mono(s, l, { x: X(v) - 0.6, y: ay + 0.07, w: 1.2, h: 0.26, fontSize: ETQ, align: 'center' });
  });
  const r1 = rows[0];
  s.addShape(S.rect, { x: X(0.62), y: r1[0] + 0.12, w: X(7.2) - X(0.62), h: r1[1] - 0.24, fill: { color: HOT, transparency: 100 }, line: { color: C.accent1, width: 0.75, dashType: 'sysDot' } });
  T(s, 'Espacio hoy sin oferta', { x: X(0.62) + 0.18, y: r1[0] + r1[1] - 0.58, w: 3.8, h: 0.36, fontSize: 16, color: C.accent1, bold: true });
  s.addShape(S.ellipse, { x: X(0) - 0.09, y: r1[0] + 0.3, w: 0.18, h: 0.18, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, 'No hacer nada', { x: X(0) - 0.42, y: r1[0] + 0.55, w: 0.84, h: 0.7, fontSize: 12.5, align: 'center', bold: true });
  const lyL = r1[0] + 0.45;
  s.addShape(S.rect, { x: X(4.29), y: lyL - 0.05, w: X(4.99) - X(4.29), h: 0.1, fill: { color: C.accent1 }, line: { type: 'none' } });
  [4.29, 4.99].forEach(v => s.addShape(S.ellipse, { x: X(v) - 0.11, y: lyL - 0.11, w: 0.22, h: 0.22, fill: { color: C.accent1 }, line: { type: 'none' } }));
  const bx = X(8.2), bw = R - bx - 0.15;
  cajaHot(s, bx, r1[0] + 0.18, bw, r1[1] - 0.36);
  T(s, 'LUMINE', { x: bx + 0.1, y: r1[0] + 0.26, w: bw - 0.2, h: 0.38, fontSize: 18, bold: true, align: 'center' });
  T(s, '$4,3–5,0 M', { x: bx + 0.1, y: r1[0] + 0.66, w: bw - 0.2, h: 0.4, fontSize: 16, color: C.accent1, align: 'center' });
  const r2 = rows[1];
  s.addShape(S.rect, { x: X(0.9), y: r2[0] + r2[1] - 0.3, w: X(1.8) - X(0.9), h: 0.12, fill: { color: C.text2 }, line: { type: 'none' } });
  T(s, [{ text: 'Gas  ', options: { bold: true } }, { text: '$0,9–1,8 M · solo autos de hasta 7 años', options: { color: C.text2 } }], { x: X(0.9) - 0.1, y: r2[0] + 0.1, w: 7.0, h: 0.38, fontSize: 15 });
  const r3 = rows[2];
  [['Híbrido usado', '$9,5–13 M', 9.5, 13], ['Eléctrico nuevo', 'desde $14 M', 13.99, 26]].forEach(([t, d, a, b], i) => {
    const y = r3[0] + 0.2 + i * 0.5;
    s.addShape(S.rect, { x: X(a), y: y + 0.12, w: X(b) - X(a), h: 0.12, fill: { color: C.text2 }, line: { type: 'none' } });
    s.addShape(S.ellipse, { x: X(a) - 0.08, y: y + 0.1, w: 0.16, h: 0.16, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, [{ text: t + '  ', options: { bold: true } }, { text: d, options: { color: C.text2 } }], { x: X(a) - 4.6, y: y - 0.02, w: 4.45, h: 0.38, fontSize: 16, align: 'right' });
  });
  return s;
};

// =====================================================================
// 3.1.6 MIX: PRODUCTO Y PRECIO
// =====================================================================
D.precio = () => {
  const s = contenido('06', 'PLAN DE MARKETING · MIX: PRODUCTO Y PRECIO', 'PLUS CUESTA 16% MÁS', 'y ahorra 24% más.');
  const y0 = 2.55, cw = 3.1, ch = 3.05, gap = 0.25;
  [['ESENCIAL', '$4.290.000', 'Hasta 15%', '$117.069', false], ['PLUS', '$4.990.000', 'Hasta 20%', '$145.327', true]].forEach(([k, p, prom, ah, hot], i) => {
    const x = M + i * (cw + gap);
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    mono(s, k, { x: x + 0.25, y: y0 + 0.2, w: cw - 0.5, h: 0.26, fontSize: ETQ, color: hot ? C.accent1 : C.text1 });
    numero(s, p, { x: x + 0.22, y: y0 + 0.5, w: cw - 0.44, h: 0.65, fontSize: 38, valign: 'top', color: hot ? C.accent1 : C.text1 });
    supuesto(s, 'REFERENCIA · CON IVA', x + 0.25, y0 + 1.18, 2.3, { size: 10, h: 0.3 });
    regla(s, y0 + 1.68, x + 0.25, cw - 0.5, C.accent6);
    T(s, [{ text: prom, options: { bold: true } }, { text: ' de ahorro', options: { color: C.text2 } }], { x: x + 0.25, y: y0 + 1.78, w: cw - 0.4, h: 0.4, fontSize: 17 });
    T(s, [{ text: ah, options: { bold: true } }, { text: ' al mes', options: { color: C.text2 } }], { x: x + 0.25, y: y0 + 2.3, w: cw - 0.4, h: 0.4, fontSize: 17 });
  });
  const gx = M + 2 * cw + gap + 0.5, gw = R - gx;
  mono(s, 'MESES PARA RECUPERAR LA INVERSIÓN', { x: gx, y: y0, w: gw, h: 0.26, fontSize: ETQ, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Esencial', labels: ['Colectivo', 'Aplicación'], values: [36.6, 28.9] },
    { name: 'Plus', labels: ['Colectivo', 'Aplicación'], values: [34.3, 27.5] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.32, w: gw + 0.1, h: 2.9, barDir: 'col', barGapWidthPct: 55,
    chartColors: [HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 44, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 18, dataLabelFontBold: true,
    catAxisLabelFontSize: 15, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 14, objectName: 'Meses para recuperar la inversión por versión',
  }));
  T(s, [{ text: 'Plus cuesta $700.000 más, ', options: { bold: true } }, { text: 'pero cada punto de ahorro sale más barato.', options: { color: C.text2 } }], { x: M, y: 5.95, w: CW, h: 0.5, fontSize: 18 });
  return s;
};

// =====================================================================
// 3.1.7 DEMANDA Y PRONÓSTICO
// =====================================================================
D.demanda = () => {
  const s = contenido('07', 'PLAN DE MARKETING · DEMANDA Y PRONÓSTICO DE VENTAS', 'MÁS DEMANDA QUE CAPACIDAD', 'desde el año 1.');
  const y0 = 2.55, lw = 3.6;
  mono(s, 'SEGMENTO LABORAL · RM', { x: M, y: y0, w: lw, h: 0.26, fontSize: ETQ, color: C.accent1 });
  numero(s, '162.780', { x: M, y: y0 + 0.3, w: lw, h: 0.8, fontSize: 50, valign: 'top' });
  T(s, 'vehículos de colectivos, taxis y aplicaciones', { x: M, y: y0 + 1.1, w: lw, h: 0.65, fontSize: 16, color: C.text2 });
  regla(s, y0 + 1.95, M, lw);
  mono(s, 'ADOPCIÓN AL AÑO 5', { x: M, y: y0 + 2.1, w: lw, h: 0.26, fontSize: ETQ, color: C.accent1 });
  numero(s, '11,1%', { x: M, y: y0 + 2.4, w: lw, h: 0.8, fontSize: 50, valign: 'top' });
  T(s, 'del segmento: bajo el 16% de los primeros adoptantes', { x: M, y: y0 + 3.2, w: lw, h: 0.65, fontSize: 16, color: C.text2 });
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'VEHÍCULOS POR AÑO', { x: gx, y: y0, w: gw, h: 0.26, fontSize: ETQ, color: C.text1 });
  supuesto(s, 'ESTIMACIÓN', R - 1.9, y0 - 0.03, 1.9, { align: 'center', size: 10 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Demanda atendible', labels: AÑOS, values: [367, 990, 1971, 3835, 7137] },
    { name: 'Instalaciones propias', labels: AÑOS, values: [299, 869, 1674, 2268, 2851] },
    { name: 'Kits a la red', labels: AÑOS, values: [0, 365, 1074, 3287, 7773] },
  ], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.32, w: gw + 0.1, h: 3.55, barDir: 'col', barGapWidthPct: 35, barOverlapPct: 0,
    chartColors: [HEX.accent5, HEX.accent1, HONDO], valAxisMinVal: 0, valAxisMaxVal: 8700, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '[<2000]"";#,##0', dataLabelFontSize: 13, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 14, objectName: 'Pronóstico de ventas por año',
  }));
  T(s, [{ text: 'El límite es físico: ', options: { bold: true } }, { text: 'técnicos y espacio. Lo demás lo atiende la red.', options: { color: C.text2 } }], { x: gx, y: y0 + 3.95, w: gw, h: 0.42, fontSize: 16 });
  return s;
};

// =====================================================================
// 3.1.8 PRESUPUESTO DE MARKETING
// =====================================================================
D['presupuesto-mkt'] = () => {
  const s = contenido('08', 'PLAN DE MARKETING · PRESUPUESTO', '$80,9 MILLONES EL PRIMER AÑO:', 'el 6,8% de los ingresos.');
  const y0 = 2.55, lw = 7.9;
  mono(s, 'MILLONES DE PESOS NETOS POR AÑO', { x: M, y: y0, w: lw, h: 0.26, fontSize: ETQ, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Clientes piloto', labels: AÑOS, values: [49.47, 23.75, 23.75, 23.75, 23.75] },
    { name: 'Pauta digital', labels: AÑOS, values: [14.40, 18.00, 24.00, 24.00, 30.00] },
    { name: 'Comisiones', labels: AÑOS, values: [4.92, 15.58, 30.30, 42.45, 56.98] },
    { name: 'Otras', labels: AÑOS, values: [12.15, 22.65, 38.22, 44.14, 52.96] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.32, w: lw + 0.1, h: 3.95, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 40,
    chartColors: [HEX.accent1, HONDO, HEX.dk2, HEX.accent5], valAxisMinVal: 0, valAxisMaxVal: 175, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'ctr', dataLabelFormatCode: '[<14]"";0', dataLabelFontSize: 13, dataLabelColor: HEX.lt1, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', legendFontSize: 14, objectName: 'Presupuesto de marketing por partida',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  cajaHot(s, cx, y0, cw, 4.27);
  mono(s, 'EN CINCO AÑOS', { x: cx + 0.25, y: y0 + 0.22, w: cw - 0.5, h: 0.26, fontSize: ETQ, color: C.accent1 });
  numero(s, '$575 M', { x: cx + 0.25, y: y0 + 0.52, w: cw - 0.5, h: 0.85, fontSize: 54, valign: 'top', color: C.accent1 });
  regla(s, y0 + 1.55, cx + 0.25, cw - 0.5);
  mono(s, '% DE LOS INGRESOS PROPIOS', { x: cx + 0.25, y: y0 + 1.7, w: cw - 0.5, h: 0.26, fontSize: ETQ });
  [['Año 1', '6,8%'], ['Año 2', '2,3%'], ['Año 5', '1,5%']].forEach(([a, p], i) => {
    const y = y0 + 2.05 + i * 0.55;
    T(s, a, { x: cx + 0.25, y, w: 1.5, h: 0.5, valign: 'middle', fontSize: 17 });
    numero(s, p, { x: cx + 1.6, y, w: cw - 1.85, h: 0.5, fontSize: 26, align: 'right', valign: 'middle', color: i === 0 ? C.accent1 : C.text1 });
  });
  return s;
};

// =====================================================================
// 3.2.1 ESTRUCTURA Y DOTACIÓN
// =====================================================================
D.estructura = () => {
  const s = contenido('09', 'RECURSOS HUMANOS · ESTRUCTURA Y DOTACIÓN', 'CRECE EL NÚMERO DE PERSONAS,', 'no la estructura.');
  const ox = M, ow = 7.9, y0 = 2.55;
  mono(s, 'ORGANIGRAMA · AL ABRIR → AÑO 5', { x: ox, y: y0, w: ow, h: 0.26, fontSize: ETQ, color: C.text1 });
  const n = 5, gap = 0.1, bw = (ow - (n - 1) * gap) / n, bh = 1.25;
  const gw = 3.2, gx = ox + (ow - gw) / 2, gy = y0 + 0.4, gh = 0.66;
  cajaHot(s, gx, gy, gw, gh);
  T(s, 'Gerencia General', { x: gx, y: gy, w: gw, h: gh, align: 'center', valign: 'middle', fontSize: 17, bold: true });
  const ry = gy + gh + 0.45, busY = gy + gh + 0.22;
  linea(s, gx + gw / 2, gy + gh, 0, busY - gy - gh, C.text2, 1);
  linea(s, ox + bw / 2, busY, ow - bw, 0, C.text2, 1);
  [['Responsable Técnico', '1 → 3'], ['Calibración', '1 → 4'], ['Comercial y Postventa', '1 → 4'], ['Comercial de Empresas', '0 → 2'], ['Administración', '1']].forEach(([t, d], i) => {
    const x = ox + i * (bw + gap), fut = i === 3;
    linea(s, x + bw / 2, busY, 0, ry - busY, C.text2, 1);
    if (fut) cajaFutura(s, x, ry, bw, bh); else caja(s, x, ry, bw, bh);
    T(s, t, { x: x + 0.05, y: ry + 0.08, w: bw - 0.1, h: 0.68, align: 'center', valign: 'middle', fontSize: 13, bold: true });
    numero(s, d, { x: x + 0.05, y: ry + 0.78, w: bw - 0.1, h: 0.4, align: 'center', valign: 'middle', fontSize: 22, color: fut ? C.text2 : C.accent1 });
  });
  const sy = ry + bh + 0.35, sh = 0.9;
  linea(s, ox + bw / 2, ry + bh, 0, sy - ry - bh, C.text2, 1);
  caja(s, ox, sy, bw * 2 + gap, sh);
  T(s, 'Técnicos', { x: ox + 0.15, y: sy, w: 1.5, h: sh, valign: 'middle', fontSize: 16, bold: true });
  numero(s, '2 → 36', { x: ox + 1.55, y: sy, w: bw * 2 + gap - 1.7, h: sh, align: 'right', valign: 'middle', fontSize: 28, color: C.accent1 });
  T(s, 'Punteado: se suma después de abrir.', { x: ox + bw * 2 + gap + 0.3, y: sy, w: ow - bw * 2 - gap - 0.3, h: sh, valign: 'middle', fontSize: 14, color: C.text2 });
  const cx = ox + ow + 0.45, cw = R - cx;
  mono(s, 'PERSONAS AL CIERRE', { x: cx, y: y0, w: cw, h: 0.26, fontSize: ETQ, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Dotación', labels: ['Pre', 'A1', 'A2', 'A3', 'A4', 'A5'], values: [5, 13, 21, 33, 40, 56] }], Object.assign({}, ejes, {
    x: cx - 0.1, y: y0 + 0.32, w: cw + 0.1, h: 3.95, barDir: 'col', barGapWidthPct: 35,
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1], valAxisMinVal: 0, valAxisMaxVal: 64, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 16, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Dotación al cierre de cada año',
  }));
  return s;
};

// =====================================================================
// 3.2.3 Y 3.2.4 POLÍTICA Y PRESUPUESTO DE RECURSOS HUMANOS
// =====================================================================
D.rrhh = () => {
  const s = contenido('10', 'RECURSOS HUMANOS · POLÍTICA Y PRESUPUESTO', 'TÉCNICOS FORMADOS EN CASA,', 'costo a la mitad.');
  const y0 = 2.55, lw = 6.4;
  mono(s, 'LUMINE HABILITA · RENTA BRUTA POR NIVEL', { x: M, y: y0, w: lw, h: 0.26, fontSize: ETQ, color: C.text1 });
  const gap = 0.12, sw = (lw - 3 * gap) / 4, base = y0 + 3.55;
  [['N1', 'Aprende', '$750 mil'], ['N2', 'Instala', '$850 mil'], ['N3', 'Autónomo', '$1,0 M'], ['N4', 'Forma', '$1,15 M']].forEach(([k, d, r], i) => {
    const x = M + i * (sw + gap), h = 1.6 + i * 0.5, y = base - h, hot = i === 3;
    if (hot) cajaHot(s, x, y, sw, h); else caja(s, x, y, sw, h);
    tag(s, k, x + 0.14, y + 0.16, { off: i < 2, w: 0.48, h: 0.32, size: 11 });
    T(s, d, { x: x + 0.14, y: y + 0.6, w: sw - 0.2, h: 0.4, fontSize: 16, bold: true });
    numero(s, r, { x: x + 0.1, y: y + h - 0.6, w: sw - 0.15, h: 0.45, fontSize: 22, valign: 'top', color: hot ? C.accent1 : C.text1 });
  });
  T(s, 'Del N1 al N4 en unos ocho meses, con bono por nivel.', { x: M, y: base + 0.2, w: lw, h: 0.6, fontSize: 16, color: C.text2 });
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'NÓMINA POR INSTALACIÓN · MILES DE $', { x: gx, y: y0, w: gw, h: 0.26, fontSize: ETQ, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Costo por instalación', labels: AÑOS, values: [508, 306, 257, 253, 265] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.32, w: gw + 0.1, h: 3.55, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2], valAxisMinVal: 0, valAxisMaxVal: 580, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0', dataLabelFontSize: 18, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Costo de nómina por instalación propia',
  }));
  T(s, 'Los cargos fijos se reparten en más autos.', { x: gx, y: y0 + 3.95, w: gw - 2.5, h: 0.42, fontSize: 16, color: C.text2 });
  supuesto(s, 'SIN REAJUSTES', R - 2.1, y0 + 4.0, 2.1, { align: 'center', size: 10, h: 0.3 });
  return s;
};

// =====================================================================
// 3.3.1 FLUJO OPERACIONAL
// =====================================================================
D.flujo = () => {
  const s = contenido('11', 'OPERACIONES · FLUJO OPERACIONAL', 'EL NEGOCIO MIDE Y RECOMIENDA;', 'el cliente decide.');
  const y0 = 2.55, n = 5, gap = 0.16, cw = (CW - (n - 1) * gap) / n;
  const et = [
    ['CAPTACIÓN', 'Cotiza en la web', 'El estimador da ahorro y plazo.'],
    ['ASESORÍA', 'El cliente decide', 'Puede medir una semana antes.'],
    ['TALLER', 'Una jornada', '8,4 horas y cuatro controles.'],
    ['CERTIFICACIÓN', 'Sale certificado', 'Firma del Responsable Técnico.'],
    ['POSTVENTA', 'Ahorro medido', 'Informe a los tres meses.'],
  ];
  et.forEach(([e, t, d], i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    s.addText('', { shape: i === 0 ? S.homePlate : S.chevron, x, y: y0, w: cw + (i < n - 1 ? 0.12 : 0), h: 0.5, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    T(s, [{ text: '0' + (i + 1) + '  ', options: { color: hot ? C.background1 : C.accent1 } }, { text: e }], { x: x + 0.26, y: y0, w: cw - 0.3, h: 0.5, valign: 'middle', fontFace: F_MONO, fontSize: 11, bold: true, color: hot ? C.background1 : C.text1, charSpacing: 1 });
    const cy = y0 + 0.72, ch = 2.15;
    if (hot) cajaHot(s, x, cy, cw, ch); else caja(s, x, cy, cw, ch);
    T(s, t, { x: x + 0.18, y: cy + 0.25, w: cw - 0.36, h: 0.85, fontSize: 19, bold: true, color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.18, y: cy + 1.15, w: cw - 0.36, h: 0.9, fontSize: 16, color: C.text2 });
  });
  const by = 5.72;
  regla(s, by - 0.12, M, CW, C.accent1);
  T(s, 'El límite de capacidad son las horas de los dúos.', { x: M, y: by, w: CW, h: 0.5, fontSize: 21, bold: true });
  T(s, 'Un dinamómetro por local basta, incluso con seis dúos.', { x: M, y: by + 0.52, w: CW, h: 0.4, fontSize: 16, color: C.text2 });
  return s;
};

// =====================================================================
// 3.3.2 CARTA GANTT (línea de tiempo dibujada)
// =====================================================================
D.gantt = () => {
  const s = contenido('12', 'OPERACIONES · CARTA GANTT DE IMPLEMENTACIÓN', 'ABRIR EN ENERO DE 2027', 'depende de un reglamento.');
  const x0 = 4.0, xw = R - x0, u = xw / 31;
  const P = m => x0 + u * (m < 0 ? m + 3 : m <= 13 ? m + 2 : 15 + (m - 13) / 3); // inicio del mes m (mes 1 = enero 2027)
  const top = 2.95, rh = 0.44;
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
    mono(s, t, { x: P(a), y: top - 0.38, w: P(b) - P(a), h: 0.28, fontSize: 11, align: 'center', color: i === 1 ? C.accent1 : C.text1 });
    if (i > 0) linea(s, P(a), top - 0.06, 0, bottom - top + 0.12, i === 1 ? C.text2 : C.accent5, 0.75);
  });
  let y = top;
  const col = { p: C.accent1, o: '1D4F66', a: C.accent3 };
  filas.forEach(([nom, items], fi) => {
    if (fi) regla(s, y, M, CW, C.accent6);
    T(s, nom, { x: M, y, w: x0 - M - 0.15, h: rh, align: 'right', valign: 'middle', fontSize: 14 });
    items.forEach(it => {
      const cy = y + rh / 2;
      if (it[0] === 'bar') {
        const [, a, b, c, txt] = it, bx = P(a), bw = P(b) - P(a);
        s.addShape(S.rect, { x: bx, y: y + 0.07, w: bw, h: rh - 0.14, fill: { color: col[c] }, line: { type: 'none' } });
        if (txt) T(s, txt, { x: bx, y, w: bw, h: rh, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: c === 'p' ? C.background1 : C.text1 });
      } else if (it[0] === 'hito') {
        const [, m, txt] = it, hx = P(m);
        s.addShape(S.diamond, { x: hx - 0.12, y: cy - 0.12, w: 0.24, h: 0.24, fill: { color: C.text1 }, line: { color: C.background1, width: 0.5 } });
        if (txt) mono(s, txt, { x: hx + 0.07, y: y - 0.03, w: 0.3, h: 0.2, fontSize: 10.5, color: C.text1 });
      } else if (it[0] === 'star') {
        const [, m, txt] = it, hx = P(m) + u / 2;
        s.addShape(S.star5, { x: hx - 0.16, y: cy - 0.16, w: 0.32, h: 0.32, fill: { color: C.accent3 }, line: { type: 'none' } });
        T(s, txt, { x: hx + 0.25, y, w: 5.5, h: rh, valign: 'middle', fontSize: 16, color: C.accent3, bold: true });
      } else if (it[0] === 'n') {
        const [, m, txt] = it;
        T(s, txt, { x: P(m) - 0.6, y, w: 0.52, h: rh, fontSize: 14, align: 'right', valign: 'middle', color: C.background1, bold: true });
      }
    });
    y += rh;
  });
  const ly = bottom + 0.3;
  let lx = M;
  [['rect', C.accent1, 'Actividad principal'], ['rect', '1D4F66', 'Operación'], ['rect', C.accent3, 'Preapertura de taller'], ['diamond', C.text1, 'Apertura o dúo nuevo'], ['star5', C.accent3, 'Hito crítico']].forEach(([sh, c, t]) => {
    s.addShape(S[sh], { x: lx, y: ly + 0.06, w: 0.2, h: 0.2, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.3, y: ly, w: 2.2, h: 0.32, fontSize: 13, valign: 'middle', color: C.text2 });
    lx += 2.45;
  });
  return s;
};

// =====================================================================
// 3.3.3 PRESUPUESTO DE OPERACIONES
// =====================================================================
D['presupuesto-ops'] = () => {
  const s = contenido('13', 'OPERACIONES · PRESUPUESTO Y RESULTADO', 'GANANCIA DESDE EL AÑO 2;', 'el riesgo es el dólar.');
  const y0 = 2.55, lw = 7.6;
  mono(s, 'RESULTADO POR LÍNEA · MILLONES DE PESOS', { x: M, y: y0, w: lw, h: 0.26, fontSize: ETQ, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Línea propia', labels: AÑOS, values: [-130.2, 159.9, 444.8, 694.7, 869.9] },
    { name: 'Red de talleres', labels: AÑOS, values: [0, 142.1, 415.2, 1233.2, 2889.5] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.32, w: lw + 0.1, h: 3.5, barDir: 'col', barGapWidthPct: 40,
    chartColors: [HEX.accent1, HONDO], valAxisMinVal: -500, valAxisMaxVal: 3400, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0;-#,##0;;', dataLabelFontSize: 13, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, catAxisLabelPos: 'low', showLegend: true, legendPos: 't', legendFontSize: 14, objectName: 'Resultado referencial por línea de negocio',
  }));
  supuesto(s, 'REFERENCIAL · 60% PLUS (SUPUESTO)', M, y0 + 3.95, 4.2, { size: 10, h: 0.3 });
  const cx = M + lw + 0.45, cw = R - cx;
  caja(s, cx, y0, cw, 1.9);
  mono(s, 'INVERSIÓN POR LOCAL', { x: cx + 0.25, y: y0 + 0.2, w: cw - 0.5, h: 0.26, fontSize: ETQ, color: C.accent1 });
  numero(s, '$81 M', { x: cx + 0.25, y: y0 + 0.5, w: cw - 0.5, h: 0.8, fontSize: 50, valign: 'top' });
  T(s, 'casi la mitad, el dinamómetro', { x: cx + 0.25, y: y0 + 1.32, w: cw - 0.5, h: 0.45, fontSize: 16, color: C.text2 });
  const sy = y0 + 2.15;
  cajaHot(s, cx, sy, cw, 2.12);
  mono(s, 'SI EL DÓLAR SUBE 10%', { x: cx + 0.25, y: sy + 0.2, w: cw - 0.5, h: 0.26, fontSize: ETQ, color: C.accent4 });
  numero(s, '870 → 93', { x: cx + 0.25, y: sy + 0.5, w: cw - 0.5, h: 0.8, fontSize: 46, valign: 'top' });
  T(s, 'millones de resultado propio al año 5', { x: cx + 0.25, y: sy + 1.32, w: cw - 0.5, h: 0.65, fontSize: 16, color: C.text2 });
  return s;
};

// =====================================================================
// 3.4 CONCLUSIONES
// =====================================================================
D.conclusiones = () => {
  const s = contenido('14', 'CONCLUSIONES DEL CAPÍTULO', 'TRES CONCLUSIONES', 'y dos preguntas por resolver.');
  const y0 = 2.55, n = 3, gap = 0.3, cw = (CW - (n - 1) * gap) / n, ch = 2.45;
  [['OPORTUNIDAD', '367 > 299', 'Más demanda que capacidad desde el año 1.'], ['VENTAJA', 'Biblioteca', 'Ahorra sin cambiar de auto y es difícil de copiar.'], ['UN GATILLO', '80%', 'De capacidad: suma dúos, personas y talleres.']].forEach(([k, v, d], i) => {
    const x = M + i * (cw + gap), hot = i === 2;
    if (hot) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    tag(s, '0' + (i + 1), x + 0.25, y0 + 0.22, { w: 0.48, h: 0.32, size: 11 });
    mono(s, k, { x: x + 0.85, y: y0 + 0.22, w: cw - 1.0, h: 0.32, valign: 'middle', fontSize: ETQ, color: hot ? C.accent1 : C.text1 });
    numero(s, v, { x: x + 0.25, y: y0 + 0.68, w: cw - 0.5, h: 0.8, fontSize: 46, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: x + 0.25, y: y0 + 1.5, w: cw - 0.5, h: 0.85, fontSize: 16 });
  });
  const qy = 5.3;
  regla(s, qy - 0.1, M, CW, C.accent3);
  mono(s, 'POR RESOLVER', { x: M, y: qy, w: 5, h: 0.26, fontSize: ETQ, color: C.accent3 });
  const qw = (CW - 0.4) / 2;
  ['¿El reglamento admitirá el kit, y desde cuándo?', '¿El ahorro medido confirma los precios?'].forEach((q, i) => {
    T(s, q, { x: M + i * (qw + 0.4), y: qy + 0.34, w: qw, h: 0.9, fontFace: F_SER, italic: true, fontSize: 24, color: C.text1 });
  });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 4, y: 6.52, w: 4, h: 0.3, valign: 'middle', align: 'right', fontSize: 12, color: C.accent1 });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces (mismo criterio: letra grande, poco texto)
// =====================================================================
D.indice = (primera) => {
  const s = contenido('A', 'MATERIAL DE APOYO', 'ANEXO', 'para preguntas.');
  T(s, 'No se presenta: se hace clic en el tema y se salta directo.', { x: M, y: 2.45, w: CW, h: 0.4, fontSize: 17, color: C.text2 });
  const colW = (CW - 0.5) / 2, rowH = 0.74, y0 = 3.05, porCol = Math.ceil(G.ANEXO.length / 2);
  G.ANEXO.forEach((a, i) => {
    const c = i < porCol ? 0 : 1, r = i % porCol, x = M + c * (colW + 0.5), y = y0 + r * rowH, n = primera + i;
    regla(s, y, x, colW);
    tag(s, a.codigo, x, y + 0.2, { w: 0.6, h: 0.34, size: 11 });
    s.addText(a.titulo, { x: x + 0.8, y, w: colW - 2.0, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 18, color: C.text1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('LÁM. ' + n + ' →', { x: x + colW - 1.25, y, w: 1.25, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 12, color: C.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    if (r === porCol - 1 || i === G.ANEXO.length - 1) regla(s, y + rowH, x, colW);
  });
  return s;
};

// A1 · hipótesis de la investigación (Tabla N° 3)
D['a-hipotesis'] = () => {
  const s = contenido('', 'INVESTIGACIÓN DE MERCADO · HIPÓTESIS', 'SEIS HIPÓTESIS', 'y su prueba.');
  const h = [
    ['H1', 'El uso laboral tiene más intención de compra que el particular.', 'Z DOS PROPORCIONES'],
    ['H2', 'La intención no cambia con la edad ni el género.', 'CHI-CUADRADO'],
    ['H3', 'El ahorro predomina, pero la mayoría valora otro motivo.', 'Z UNA PROPORCIÓN'],
    ['H4', 'La barrera principal es la confianza, no el precio.', 'Z UNA PROPORCIÓN'],
    ['H5', 'Los respaldos externos dan más confianza que el taller.', 'T RELACIONADAS'],
    ['H6', 'Se prefiere hibridar antes que gas, cambiar de auto o nada.', 'Z UNA PROPORCIÓN'],
  ];
  const rh = 0.62, y0 = 2.55;
  h.forEach(([k, t, p], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, CW);
    tag(s, k, M, y + 0.15, { w: 0.58, h: 0.34, size: 11, off: i !== 3 });
    T(s, t, { x: M + 0.8, y, w: CW - 3.9, h: rh, valign: 'middle', fontSize: 17, bold: i === 3 });
    chip(s, p, R - 2.85, y + 0.15, 2.85, C.accent1, { align: 'center', size: 10, h: 0.32 });
  });
  regla(s, y0 + h.length * rh, M, CW);
  return s;
};

// A2 · dudas del cliente (Tabla N° 4) y límites de la promesa
D['a-dudas'] = () => {
  const s = contenido('', 'POSICIONAMIENTO · DUDAS DEL CLIENTE', 'CUATRO DUDAS,', 'cuatro respaldos.');
  const d = [
    ['¿Funciona?', 'Hasta 20% menos bencina en ciudad.', 'Estimador con intervalo y telemetría.'],
    ['¿Daña mi auto?', 'No toca el motor ni la transmisión.', 'Se conservan el circuito de freno y el ABS.'],
    ['¿Pasa la revisión?', 'Sale del taller con certificado.', 'Lo firma el Responsable Técnico.'],
    ['¿Se enchufa?', 'No.', 'La batería se carga al frenar.'],
  ];
  const n = 4, gap = 0.25, cw = (CW - (n - 1) * gap) / n, y0 = 2.55, ch = 3.0;
  d.forEach(([q, r, b], i) => {
    const x = M + i * (cw + gap);
    caja(s, x, y0, cw, ch);
    T(s, q, { x: x + 0.22, y: y0 + 0.2, w: cw - 0.4, h: 0.6, fontFace: F_SER, italic: true, fontSize: 25, color: C.accent1 });
    T(s, r, { x: x + 0.22, y: y0 + 0.9, w: cw - 0.4, h: 0.95, fontSize: 17, bold: true });
    regla(s, y0 + 1.95, x + 0.22, cw - 0.44);
    T(s, b, { x: x + 0.22, y: y0 + 2.05, w: cw - 0.4, h: 0.85, fontSize: 15, color: C.text2 });
  });
  const ly = 5.85;
  mono(s, 'LO QUE LA MARCA NO PROMETE', { x: M, y: ly, w: 6, h: 0.28, fontSize: 12, color: C.accent3 });
  let x = M;
  [['«CERO EMISIONES»', 2.05], ['«20% GARANTIZADO»', 2.2], ['«HOMOLOGADO»', 1.75], ['EXENCIÓN DE RESTRICCIÓN', 3.0]].forEach(([t, w]) => {
    chip(s, t, x, ly + 0.38, w, C.accent4, { size: 11, h: 0.36, align: 'center' });
    x += w + 0.2;
  });
  return s;
};

// A3 · mezcla de marketing (Tabla N° 8)
D['a-mix'] = () => {
  const s = contenido('', 'MIX DE MARKETING · RESUMEN', 'DOS LÍNEAS,', 'una misma mezcla.');
  const filas = [
    ['PRODUCTO', 'Kit Esencial o Plus en una jornada', 'Licencia, kits y certificación'],
    ['PRECIO', '$4,29 M y $4,99 M con IVA', 'Entrada y cobros recurrentes'],
    ['PLAZA', 'Web y talleres propios en la RM', 'Talleres con exclusividad comunal'],
    ['PROMOCIÓN', 'Estimador, pilotos y referidos', 'Visitas, ferias y casos'],
    ['PERSONAS', 'Dúos con un N3 o N4', 'Técnicos validados por Lumine'],
  ];
  const kw = 2.4, c1 = M + kw, cw = (R - c1 - 0.3) / 2, c2 = c1 + cw + 0.3, y0 = 2.5, rh = 0.74;
  mono(s, 'CLIENTE FINAL', { x: c1, y: y0, w: cw, h: 0.28, fontSize: 12, color: C.accent1 });
  mono(s, 'RED DE TALLERES', { x: c2, y: y0, w: cw, h: 0.28, fontSize: 12, color: C.accent1 });
  filas.forEach(([k, a, b], i) => {
    const y = y0 + 0.38 + i * rh;
    regla(s, y, M, CW);
    mono(s, k, { x: M, y, w: kw - 0.2, h: rh, valign: 'middle', fontSize: 12, color: C.text1 });
    T(s, a, { x: c1, y, w: cw, h: rh, valign: 'middle', fontSize: 17 });
    T(s, b, { x: c2, y, w: cw, h: rh, valign: 'middle', fontSize: 17, color: C.text2 });
  });
  regla(s, y0 + 0.38 + filas.length * rh, M, CW);
  return s;
};

// A4 · cobros a la red (Tabla N° 7)
D['a-red'] = () => {
  const s = contenido('', 'MIX · PRECIO PARA LA RED', 'INGRESO RECURRENTE:', 'el 96% del margen al año 5.');
  const t = [
    ['ENTRADA', '$7,14 M', 'una vez', 'Exclusividad comunal y formación'],
    ['KIT CON LICENCIA', '$3,81 M', 'por instalación', 'Plus; Esencial, $3,33 M'],
    ['CERTIFICACIÓN', '$2,4 M', 'cada año', 'Desde el segundo año'],
    ['HABILITA', '$35 mil', 'al mes por técnico', 'Formación y validación'],
  ];
  const n = 4, gap = 0.25, cw = (CW - (n - 1) * gap) / n, y0 = 2.55, ch = 2.85;
  t.forEach(([k, v, f, d], i) => {
    const x = M + i * (cw + gap);
    if (i === 1) cajaHot(s, x, y0, cw, ch); else caja(s, x, y0, cw, ch);
    mono(s, k, { x: x + 0.22, y: y0 + 0.2, w: cw - 0.44, h: 0.28, fontSize: 12, color: C.accent1 });
    numero(s, v, { x: x + 0.22, y: y0 + 0.55, w: cw - 0.44, h: 0.75, fontSize: 42, valign: 'top' });
    T(s, f, { x: x + 0.22, y: y0 + 1.32, w: cw - 0.44, h: 0.38, fontSize: 16, bold: true });
    T(s, d, { x: x + 0.22, y: y0 + 1.8, w: cw - 0.44, h: 0.9, fontSize: 15, color: C.text2 });
  });
  regla(s, 5.72, M, CW, C.accent1);
  T(s, [{ text: '42 talleres y 7.773 kits al año 5, ', options: { bold: true } }, { text: 'sin activos fijos.', options: { color: C.text2 } }], { x: M, y: 5.85, w: CW, h: 0.5, fontSize: 20 });
  supuesto(s, 'MONTOS NETOS · A VALIDAR CON LOS PRIMEROS TALLERES', M, 6.42, 5.6, { size: 10, h: 0.3 });
  return s;
};

// A5 · tamaño del mercado y adopción
D['a-mercado'] = () => {
  const s = contenido('', 'DEMANDA · MERCADO Y ADOPCIÓN', '162.780 VEHÍCULOS DE TECHO;', '11,1% adoptado al año 5.');
  const y0 = 2.55, lw = 4.6;
  [['TAM · CHILE', '4.409.729', 'autos y taxis a combustión'], ['SAM · RM', '1.685.930', 'lo que atiende el taller propio'], ['SEGMENTO LABORAL', '162.780', 'colectivos, taxis y aplicaciones']].forEach(([k, v, d], i) => {
    const y = y0 + i * 1.3, hot = i === 2;
    regla(s, y, M, lw, hot ? C.accent1 : C.accent5);
    mono(s, k, { x: M, y: y + 0.1, w: lw, h: 0.28, fontSize: 12, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: M, y: y + 0.38, w: 2.6, h: 0.6, fontSize: 34, valign: 'top', color: hot ? C.accent1 : C.text1 });
    T(s, d, { x: M + 2.6, y: y + 0.42, w: lw - 2.6, h: 0.8, fontSize: 15, color: C.text2 });
  });
  const gx = M + lw + 0.5, gw = R - gx;
  mono(s, 'ADOPCIÓN ACUMULADA · MODELO DE BASS', { x: gx, y: y0, w: gw, h: 0.28, fontSize: 12, color: C.text1 });
  s.addChart(pres.ChartType.line, [{ name: 'Adopción acumulada', labels: AÑOS, values: [0.0038, 0.0114, 0.0265, 0.0560, 0.1108] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.35, w: gw + 0.1, h: 3.1, chartColors: [HEX.accent1], lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 10,
    valAxisMinVal: 0, valAxisMaxVal: 0.14, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 't', dataLabelFormatCode: '0.0%', dataLabelFontSize: 15, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Adopción acumulada del segmento laboral',
  }));
  T(s, 'Aun si solo el 40% del segmento adoptara, la demanda cubre el año 5.', { x: gx, y: y0 + 3.55, w: gw, h: 0.7, fontSize: 16, color: C.text2 });
  return s;
};

// A6 · perfiles de cargo (Tabla N° 13)
D['a-perfiles'] = () => {
  const s = contenido('', 'RECURSOS HUMANOS · PERFILES DE CARGO', 'CADA CARGO RESPONDE', 'por un resultado crítico.');
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
  const y0 = 2.5, rh = 0.46, c2 = M + 3.7;
  p.forEach(([c, r], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, CW, C.accent6);
    T(s, c, { x: M, y, w: 3.6, h: rh, valign: 'middle', fontSize: 15, bold: true, color: i === 5 ? C.accent1 : C.text1 });
    T(s, r, { x: c2, y, w: R - c2, h: rh, valign: 'middle', fontSize: 16, color: C.text2 });
  });
  regla(s, y0 + p.length * rh, M, CW, C.accent6);
  return s;
};

// A7 · rentas (Tabla N° 14) y bonos (Tabla N° 15)
D['a-rentas'] = () => {
  const s = contenido('', 'RECURSOS HUMANOS · COMPENSACIONES', 'EL SUPERIOR GANA MÁS;', 'entre áreas decide la escasez.');
  const y0 = 2.55, lw = 7.9;
  mono(s, 'RENTA BRUTA MENSUAL · MILES DE PESOS', { x: M, y: y0, w: lw, h: 0.28, fontSize: 12, color: C.text1 });
  const cargos = ['Gerente General', 'Responsable Técnico', 'Calibración', 'Técnico N4', 'Técnico N3', 'Administración', 'Comercial', 'Técnico N1', 'Asistentes'];
  const rentas = [2000, 1800, 1700, 1150, 1000, 900, 850, 750, 692];
  s.addChart(pres.ChartType.bar, [{ name: 'Renta bruta', labels: cargos, values: rentas }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.32, w: lw + 0.1, h: 3.95, barDir: 'bar', barGapWidthPct: 30, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 2350, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 14, dataLabelFontBold: true,
    catAxisLabelFontSize: 13, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Renta bruta mensual por cargo',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  cajaHot(s, cx, y0, cw, 4.27);
  mono(s, 'BONO POR NIVEL VALIDADO', { x: cx + 0.25, y: y0 + 0.22, w: cw - 0.5, h: 0.28, fontSize: 12, color: C.accent1 });
  [['N2', '$200 mil'], ['N3', '$300 mil'], ['N4', '$350 mil']].forEach(([k, v], i) => {
    const y = y0 + 0.62 + i * 0.62;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent6);
    tag(s, k, cx + 0.25, y + 0.14, { w: 0.55, h: 0.34, size: 11 });
    numero(s, v, { x: cx + 0.9, y, w: cw - 1.15, h: 0.62, fontSize: 26, align: 'right', valign: 'middle' });
  });
  const ty = y0 + 0.62 + 3 * 0.62;
  linea(s, cx + 0.25, ty, cw - 0.5, 0, C.accent1, 1);
  T(s, 'Total', { x: cx + 0.25, y: ty, w: 1.5, h: 0.6, valign: 'middle', fontSize: 17, bold: true });
  numero(s, '$850 mil', { x: cx + 0.9, y: ty, w: cw - 1.15, h: 0.6, fontSize: 28, align: 'right', valign: 'middle', color: C.accent1 });
  T(s, 'Los comerciales suman comisión.', { x: cx + 0.25, y: ty + 0.7, w: cw - 0.5, h: 0.5, fontSize: 15, color: C.text2 });
  return s;
};

// A8 · jornada de instalación (Anexo N° 8)
D['a-jornada'] = () => {
  const s = contenido('', 'OPERACIONES · JORNADA DE INSTALACIÓN', 'UN VEHÍCULO POR JORNADA:', '8,4 horas.');
  const b = [['Seguridad', 0.4], ['Recepción', 0.4], ['Montaje y pesaje', 3.3], ['Integración', 1.8], ['Calibración', 0.8], ['Pruebas', 1.0], ['Cierre', 0.7]];
  const y0 = 2.55, total = 8.4;
  mono(s, 'HORAS POR BLOQUE · DÚO CON UN N3', { x: M, y: y0, w: CW, h: 0.28, fontSize: 12, color: C.text1 });
  let x = M;
  b.forEach(([t, h], i) => {
    const w = CW * h / total, hot = i === 2 || i === 3;
    s.addShape(S.rect, { x: x + 0.02, y: y0 + 0.4, w: w - 0.04, h: 0.8, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
    numero(s, dec(h), { x, y: y0 + 0.4, w, h: 0.8, align: 'center', valign: 'middle', fontSize: w > 0.9 ? 26 : 18, color: hot ? C.background1 : C.text1 });
    if (w > 1.2) T(s, t, { x, y: y0 + 1.28, w, h: 0.4, align: 'center', fontSize: 16, bold: hot, color: hot ? C.accent1 : C.text2 });
    x += w;
  });
  T(s, 'Montaje e integración concentran 5,1 de las 8,4 horas.', { x: M, y: y0 + 1.8, w: CW, h: 0.45, fontSize: 18, bold: true });
  const py = 5.05;
  regla(s, py - 0.1, M, CW, C.accent1);
  mono(s, 'CUATRO CONTROLES · SI FALLA, SE DETIENE', { x: M, y: py, w: CW, h: 0.28, fontSize: 12, color: C.accent1 });
  const pw = (CW - 0.6) / 4;
  ['¿Vehículo apto?', '¿Masa y ejes?', '¿Aislación?', '¿Dinamómetro?'].forEach((q, i) => {
    const xx = M + i * (pw + 0.2);
    caja(s, xx, py + 0.42, pw, 0.95);
    s.addShape(S.diamond, { x: xx + 0.22, y: py + 0.74, w: 0.3, h: 0.3, fill: { color: C.accent1 }, line: { type: 'none' } });
    T(s, q, { x: xx + 0.65, y: py + 0.42, w: pw - 0.75, h: 0.95, valign: 'middle', fontSize: 17, bold: true });
  });
  return s;
};

// A9 · inversión (Tabla N° 18) y gasto operacional (Tabla N° 19)
D['a-inversion'] = () => {
  const s = contenido('', 'OPERACIONES · INVERSIÓN Y GASTO', 'LA INVERSIÓN SIGUE AL GATILLO;', 'el gasto, al kit.');
  const y0 = 2.55, gw = (CW - 0.5) / 2;
  mono(s, 'INVERSIÓN · MILLONES DE $', { x: M, y: y0, w: gw, h: 0.28, fontSize: 12, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Inversión', labels: AÑOS, values: [71.2, 10.1, 81.3, 0, 81.3] }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.32, w: gw + 0.1, h: 3.1, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 95, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0;;"—"', dataLabelFontSize: 16, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Inversión en equipamiento por año',
  }));
  T(s, 'Un local nuevo en los años 1, 3 y 5.', { x: M, y: y0 + 3.55, w: gw, h: 0.5, fontSize: 16, color: C.text2 });
  const gx = M + gw + 0.5;
  mono(s, 'GASTO OPERACIONAL · MILLONES DE $', { x: gx, y: y0, w: gw, h: 0.28, fontSize: 12, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Gasto operacional', labels: AÑOS, values: [1064.1, 2945.4, 5657.9, 7623.5, 9605.8] }], Object.assign({}, ejes, {
    x: gx - 0.1, y: y0 + 0.32, w: gw + 0.1, h: 3.1, barDir: 'col', barGapWidthPct: 45, chartColors: [HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 11000, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 15, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Gasto operacional por año',
  }));
  T(s, 'El kit es más del 90% de cada año.', { x: gx, y: y0 + 3.55, w: gw, h: 0.5, fontSize: 16, color: C.text2 });
  return s;
};

// A10 · sensibilidad (Tabla N° 21)
D['a-sensibilidad'] = () => {
  const s = contenido('', 'OPERACIONES · SENSIBILIDAD', 'EL DÓLAR PESA MÁS', 'que el precio y la mezcla.');
  const y0 = 2.55, lw = 8.2;
  mono(s, 'RESULTADO PROPIO AL AÑO 5 · MILLONES DE $', { x: M, y: y0, w: lw, h: 0.28, fontSize: 12, color: C.text1 });
  s.addChart(pres.ChartType.bar, [{ name: 'Resultado', labels: ['Dólar −10%', 'Precio +5%', 'Plus 80%', 'Base', 'Plus 40%', 'Precio −5%', 'Dólar +10%'], values: [1646.9, 1433.0, 993.7, 869.9, 746.1, 306.9, 92.9] }], Object.assign({}, ejes, {
    x: M - 0.1, y: y0 + 0.32, w: lw + 0.1, h: 3.95, barDir: 'bar', barGapWidthPct: 30, catAxisOrientation: 'maxMin',
    chartColors: [HEX.dk2, HEX.dk2, HEX.dk2, HEX.accent1, HEX.dk2, HEX.dk2, HEX.accent4],
    valAxisMinVal: 0, valAxisMaxVal: 1950, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 15, dataLabelFontBold: true,
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1, showLegend: false, objectName: 'Sensibilidad del resultado al quinto año',
  }));
  const cx = M + lw + 0.45, cw = R - cx;
  cajaHot(s, cx, y0, cw, 2.6);
  mono(s, 'MARGEN SOBRE VENTAS', { x: cx + 0.25, y: y0 + 0.22, w: cw - 0.5, h: 0.28, fontSize: 12, color: C.accent1 });
  [['Base', '7,7%'], ['Dólar +10%', '0,8%'], ['Dólar −10%', '14,6%']].forEach(([k, v], i) => {
    const y = y0 + 0.62 + i * 0.6;
    regla(s, y, cx + 0.25, cw - 0.5, C.accent6);
    T(s, k, { x: cx + 0.25, y, w: 2, h: 0.6, valign: 'middle', fontSize: 16 });
    numero(s, v, { x: cx + 2, y, w: cw - 2.25, h: 0.6, fontSize: 26, align: 'right', valign: 'middle', color: i === 1 ? C.accent4 : C.text1 });
  });
  T(s, 'El 82% del costo del kit está en dólares: el plan financiero evaluará coberturas.', { x: cx, y: y0 + 2.8, w: cw, h: 1.2, fontSize: 16, color: C.text2 });
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
