// Control 3 de Control de Gestión (ICMA901, UNAB) = Avance 1 del TIG · Lumine Motors Chile SpA · 27-10-2026
// Alcance: introducción, comprensión del negocio, declaraciones estratégicas compartidas y análisis estratégico
// (puntos 3 a 6 del instructivo del TIG). La formulación de la estrategia y el CMI son del Avance 2: el CMI solo aparece
// como respaldo rotulado en el anexo.
//
// Sistema visual: el de las presentaciones anteriores de Control de Gestión (titulares anchos en mayúsculas con acento en
// serif itálica, etiquetas mono y cifras condensadas) con la paleta pedida para este control: negro #000000, blanco,
// cian #12AAE9 y degradado azul marino #000C1D a #001B3C. Exposición sobre el degradado; anexo en negro puro.
// Legibilidad para sala grande: titulares de 34 pt, texto de 16 pt o más, etiquetas de 12 pt o más y fuentes al pie de
// 12 pt. Si algo no cabe, se quita texto; nunca se achica la letra. Sin animaciones.
// Reglas de contenido: Lumine es preoperativa; el ahorro es una estimación; las entrevistas (n = 3) son indicativas;
// la biblioteca de calibraciones es un potencial; no se nombra el gas licuado; la química de la batería no se nombra.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {}; // una función por diapositiva; el orden lo pone guion.js
const OUT = process.argv[2] || 'Lumine_Control3_Avance1.pptx';
const A = f => path.join(__dirname, 'assets', f);

// ---------- tema ----------
const [F_TIT, F_CON, F_BODY, F_MONO, F_SER] = ['Archivo SemiExpanded ExtraBold', 'Archivo Condensed', 'Figtree', 'IBM Plex Mono', 'Instrument Serif'];
const THEME = {
  name: 'Lumine',
  headFontFace: F_TIT,
  bodyFontFace: F_BODY,
  colors: {
    dk1: 'FFFFFF', lt1: '000000', dk2: '9AA8B6', lt2: '061428',
    accent1: '12AAE9', accent2: '9AA8B6', accent3: '3C4D60', accent4: 'FFFFFF',
    accent5: '22354B', accent6: '0A1A2E', hlink: '12AAE9', folHlink: '0A6F9E',
  },
};
const HEX = THEME.colors;
const HOT = '062A45';   // relleno de la caja destacada

const TX = { tit: 34, acento: 40, sub: 24, cuerpo: 20, etq: 16, marca: 14, inst: 12, cifra: 44 };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,333 × 7,5 in
pres.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo';
pres.company = 'Lumine Motors Chile SpA';
pres.title = 'Control 3 · Avance 1 del TIG · Análisis estratégico de Lumine Motors';
pres.subject = 'Control de Gestión · ICMA901 · UNAB';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const C = pres.SchemeColor;
const S = pres.ShapeType;

const W = 13.333, M = 0.6, CW = W - 2 * M, R = W - M;
const LOGO_H = 0.22, LOGO_W = LOGO_H * (2400 / 490);
const CURSO = 'CONTROL DE GESTIÓN · ICMA901 · CONTROL 3 · AVANCE 1 DEL TIG';
const Y0 = 2.62;   // inicio del contenido, bajo el titular
const YF = 6.78;   // fin del contenido, sobre la fuente al pie

// ---------- piezas del sistema visual ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: TX.cuerpo, color: C.text1, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: 13, color: C.text2, charSpacing: 1 }, o));
const serif = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_SER, italic: true, fontSize: 20, color: C.accent1 }, o));
function linea(s, x, y, w, h, color = C.accent5, width = 0.75, o = {}) {
  s.addShape(S.line, Object.assign({ x, y, w, h, line: { color, width } }, o));
}
function flecha(s, x, y, w, h, color = C.accent1, width = 1.75, dash) {
  s.addShape(S.line, { x, y, w, h, line: { color, width, endArrowType: 'triangle', dashType: dash || 'solid' } });
}
function visor(s, x, y, w, h, color = C.accent1, k = 0.17, d = 0.06) {
  const L = (a, b, c, e) => linea(s, a, b, c, e, color, 1.25);
  x -= d; y -= d; w += 2 * d; h += 2 * d;
  L(x, y, k, 0); L(x, y, 0, k);
  L(x + w - k, y, k, 0); L(x + w, y, 0, k);
  L(x, y + h, k, 0); L(x, y + h - k, 0, k);
  L(x + w - k, y + h, k, 0); L(x + w, y + h - k, 0, k);
}
function caja(s, x, y, w, h, o = {}) {
  s.addShape(S.rect, Object.assign({ x, y, w, h, fill: { color: C.background2, transparency: 15 }, line: { color: C.accent5, width: 0.75 } }, o));
}
const cajaHot = (s, x, y, w, h) => { caja(s, x, y, w, h, { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } }); visor(s, x, y, w, h); };
function tag(s, n, x, y, o = {}) {
  const w = o.w || 0.62, h = o.h || 0.38, on = !o.off;
  s.addShape(S.rect, { x, y, w, h, fill: { color: on ? C.accent1 : C.accent5 }, line: { type: 'none' } });
  T(s, n, { x, y, w, h, fontFace: F_MONO, fontSize: o.size || 14, bold: true, color: on ? C.background1 : C.text1, align: 'center', valign: 'middle' });
}
// rótulos de naturaleza del dato: est = estimación (raya), sup = supuesto o propuesta (puntos),
// pen = pendiente o por comprobar (línea), no = advertencia (blanco, raya)
const MARCA = {
  est: { color: C.text2, dash: 'dash' },
  sup: { color: C.text2, dash: 'sysDot' },
  pen: { color: C.text2, dash: 'solid' },
  no: { color: C.text1, dash: 'dash' },
  hot: { color: C.accent1, dash: 'solid' },
};
const anchoMarca = (t, size = TX.marca) => 0.34 + t.length * (size * 0.6 + 1) / 72;
function marca(s, tipo, text, x, y, o = {}) {
  const st = MARCA[tipo], size = o.size || 12, h = o.h || 0.34, w = o.w || anchoMarca(text, size);
  const xx = o.alignRight ? x - w : x;
  s.addShape(S.rect, { x: xx, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color: st.color, width: o.grueso ? 1.5 : 1, dashType: st.dash } });
  mono(s, text, { x: xx + 0.12, y, w: w - 0.24, h, fontSize: size, color: st.color, bold: !!o.bold, valign: 'middle', align: 'center', charSpacing: 1 });
  return w;
}
const brillo = (s, x, y, w, h, k = 0.9) => s.addImage({ path: A('brillo.png'), x: x - k, y: y - 0.7 * k, w: w + 2 * k, h: h + 1.4 * k, altText: '' });
const numero = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: TX.cifra, color: C.text1, valign: 'bottom' }, o));
const regla = (s, y, x = M, w = CW, color = C.accent5) => linea(s, x, y, w, 0, color, 0.75);
// medidor de 5 cuadros (puntajes de 1 a 5)
function medidor(s, v, x, y, o = {}) {
  const k = o.k || 0.16, g = o.g || 0.06;
  for (let i = 0; i < 5; i++) s.addShape(S.rect, { x: x + i * (k + g), y, w: k, h: k, fill: { color: i < v ? (o.color || C.accent1) : C.background1, transparency: i < v ? 0 : 100 }, line: { color: i < v ? (o.color || C.accent1) : C.accent3, width: 0.75 } });
}
// lista con viñeta cuadrada; el alto de cada ítem depende de las líneas estimadas (Figtree ≈ 0,46 em por carácter)
const lineas = (t, w, size) => Math.max(1, Math.ceil(t.length / (w * 72 / (size * 0.46))));
function lista(s, items, x, y, w, o = {}) {
  const size = o.size || 16, lh = size / 72 * 1.22, gap = o.gap ?? 0.12;
  items.forEach(t => {
    const n = lineas(t, w - 0.22, size), h = n * lh;
    s.addShape(S.rect, { x, y: y + lh / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: o.color || C.accent1 }, line: { type: 'none' } });
    T(s, t, { x: x + 0.22, y, w: w - 0.22, h, fontSize: size, valign: 'top', lineSpacingMultiple: 1.0 });
    y += h + gap;
  });
  return y;
}
// ejes de los gráficos editables
const EJES = {
  catAxisLabelFontFace: F_BODY, valAxisLabelFontFace: F_BODY, legendFontFace: F_BODY, dataLabelFontFace: F_CON,
  catAxisLineShow: false, valAxisLineShow: false, catAxisLabelColor: HEX.dk1, valAxisLabelColor: HEX.dk2, legendColor: HEX.dk1,
  valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, plotArea: { fill: { color: '000000', transparency: 100 } },
};

// ---------- marcos (layouts) ----------
const logo = { image: { path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' } };
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('portada-premium.jpg') },
  objects: [logo],
});
const marcoContenido = (title, background) => pres.defineSlideMaster({
  title,
  background,
  margin: [0.5, M, 0.6, M],
  objects: [
    logo,
    { text: { text: CURSO, options: { x: 5.6, y: 0.4, w: R - 5.6, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: TX.inst, color: HEX.dk2, charSpacing: 1.5, margin: 0 } } },
    { placeholder: { options: { name: 'etiqueta', type: 'body', x: M, y: 0.92, w: 8.6, h: 0.3, fontFace: F_MONO, fontSize: 13, color: HEX.dk2, charSpacing: 1.5, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.36, w: CW, h: 1.2, fontFace: F_TIT, fontSize: TX.tit, color: HEX.dk1, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.86 }, text: '' } },
  ],
  slideNumber: { x: R - 0.8, y: 7.0, w: 0.8, h: 0.28, fontFace: F_MONO, fontSize: 12, color: HEX.accent1, align: 'right', margin: 0 },
});
marcoContenido('CONTENIDO', { path: A('fondo-azul.jpg') });
marcoContenido('ANEXO', { color: '000000' });

// ---------- fuentes al pie ----------
const INSTR = n => `instrumento ${n} del análisis estratégico del equipo (Control de Gestión, 2026)`;
const FUENTES = {
  oportunidad: `Fuentes: Ministerio de Energía (2021), Estrategia Nacional de Electromovilidad; ${INSTR('PEST (03)')}, que cita las fuentes primarias de transferencias y precios.`,
  negocio: 'Fuente: contexto vigente del proyecto Lumine Motors. Ilustración del kit, no plano de fabricación. El ahorro es una estimación de ingeniería, no medida en autos chilenos.',
  cliente: 'Fuentes: contexto vigente del proyecto; entrevistas en profundidad del equipo (n = 3): resultado indicativo, no representativo.',
  identidad: 'Fuente: informe del Avance 1, sección 5 (declaraciones estratégicas compartidas). Textos literales en el anexo A9.',
  pest: `Fuente: ${INSTR('PEST (03)')}, según Francés (2006). Escala 1 a 5, 3 = neutro. Detalle en los anexos A1, A2 y A4.`,
  porter: `Fuente: ${INSTR('de cinco fuerzas (02)')}, según Porter (2008). Intensidad 0 a 5, ponderada. Cálculo en el anexo A3.`,
  escenarios: 'Fuentes: Ley N° 21.793, Diario Oficial (14-01-2026); borrador de reglamento del MTT sometido a consulta en 2021, anterior a la ley. Árbol elaborado por el equipo.',
  recursos: `Fuente: ${INSTR('de competencias (05)')}, criterios de Hitt, Ireland y Hoskisson. Detalle en el anexo A5.`,
  cadena: `Fuente: ${INSTR('de cadena de valor (06)')}, según Porter (1985) y Francés (2006). Detalle en el anexo A6.`,
  foda: 'Fuente: síntesis del equipo a partir de los instrumentos 02, 03, 05 y 06. Cruces para el Avance 2 en el anexo A7.',
  brechas: 'Fuente: informe del Avance 1, sección 6.6 (diagnóstico integrado y prioridades).',
  indice: 'Este anexo no se expone. Cada tema enlaza a su lámina y cada lámina vuelve a este índice.',
  'a-metodo': 'Fuentes: instrumentos 02, 03, 05 y 06 del equipo; Francés (2006); Porter (1985, 2008); Hitt, Ireland y Hoskisson.',
  'a-pest': `Fuente: ${INSTR('PEST (03)')}. Antes de citar una cifra en el informe, agregar su fuente primaria en la bibliografía.`,
  'a-porter': `Fuente: ${INSTR('de cinco fuerzas (02)')}.`,
  'a-impacto': `Fuente: ${INSTR('PEST (03)')}, matriz de impacto e incertidumbre (Francés, 2006).`,
  'a-hitt': `Fuente: ${INSTR('de competencias (05)')}.`,
  'a-fce': `Fuente: ${INSTR('de cadena de valor (06)')}, factores críticos de éxito (Francés, 2006).`,
  'a-foda': 'Fuente: cruces del análisis estratégico del equipo, corregidos para el Avance 1. Son insumo de la formulación, no estrategia aprobada.',
  'a-cliente': 'Fuentes: supuestos del equipo para la derivación; entrevistas en profundidad (n = 3). Nada de esta lámina es una medición.',
  'a-identidad': 'Fuente: informe del Avance 1, secciones 5.1, 5.2 y 5.3.',
  'a-origen': 'Fuente: revisión del equipo de cada cifra usada en la exposición.',
  'a-correspondencia': 'Fuente: informe del Avance 1 (versión corregida) y esta presentación.',
  'a-biblio': 'Formato APA, 7.ª edición. Las fuentes primarias de los datos de entorno del instrumento 03 deben sumarse antes de entregar.',
  'a-cmi': 'Fuente: CMI de trabajo del equipo (Solemne 2, 20-10-2026). Se revisará en el Avance 2 con las correcciones del profesor.',
};

let SEC = null, CLAVE = null, NUM = 0, ANEXO_ACTUAL = null, INDICE_ANEXO = null;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(etiqueta, titulo, acento, o = {}) {
  const anexo = !!ANEXO_ACTUAL || CLAVE === 'indice';
  const s = pres.addSlide({ masterName: anexo ? 'ANEXO' : 'CONTENIDO', sectionTitle: SEC });
  let n;
  if (ANEXO_ACTUAL) {
    n = ANEXO_ACTUAL.codigo; etiqueta = 'ANEXO · ' + etiqueta;
    s.addText('VOLVER AL ÍNDICE DEL ANEXO', { x: 7.7, y: 0.7, w: R - 7.7, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 12, color: C.accent1, charSpacing: 1, margin: 0, hyperlink: { slide: INDICE_ANEXO, tooltip: 'Volver al índice del anexo' } });
  } else n = CLAVE === 'indice' ? 'A' : String(++NUM + 1).padStart(2, '0');
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  // si titular y acento no caben en una línea, el acento pasa entero a la segunda (nunca se corta a la mitad)
  const unaLinea = !o.dosLineas && titulo.length * 0.345 + acento.length * 0.18 <= CW - 0.6;
  s.addText([{ text: unaLinea ? titulo + ' ' : titulo, options: { breakLine: !unaLinea } }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: TX.acento } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.9, w: R - M - 1.0, h: 0.45, valign: 'top', fontSize: TX.inst, color: C.text2 });
  return s;
}

// =====================================================================
// 1 · PORTADA
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · FACULTAD DE ECONOMÍA Y NEGOCIOS · OCTUBRE 2026', { x: 5.6, y: 0.4, w: R - 5.6, h: 0.26, align: 'right', valign: 'middle', fontSize: 12 });
  mono(s, [{ text: 'CONTROL 3', options: { color: C.accent1 } }, { text: '  ·  AVANCE 1 DEL TRABAJO DE INVESTIGACIÓN GRUPAL', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  T(s, [
    { text: 'LUMINE MOTORS', options: { breakLine: true, fontFace: F_TIT, fontSize: 54 } },
    { text: 'análisis estratégico de un proyecto preoperativo.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 40 } },
  ], { x: M, y: 1.45, w: 9.8, h: 1.6, lineSpacingMultiple: 0.9 });
  linea(s, M, 2.95, 0.06, 0.82, C.accent1, 3);
  T(s, [{ text: 'Introducción, comprensión del negocio, ', options: {} }, { text: 'declaraciones estratégicas y análisis estratégico.', options: { color: C.text2 } }],
    { x: M + 0.3, y: 2.92, w: 4.6, h: 0.88, fontSize: 17, valign: 'middle', lineSpacingMultiple: 1.05 });
  const iy = 4.95;
  linea(s, M, iy, 1.2, 0, C.accent1, 1.25);
  T(s, [
    { text: 'Control de Gestión · ICMA901', options: { breakLine: true, bold: true, color: C.text1 } },
    { text: 'Sección 500 · NRC 4118', options: { breakLine: true } },
    { text: 'Profesor Leonardo Lizana Contreras', options: { breakLine: true } },
    { text: 'Diego Alarcón · Benjamín Torres', options: { breakLine: true } },
    { text: 'Lukas Verdugo', options: { breakLine: true } },
    { text: 'Santiago, 27 de octubre de 2026' },
  ], { x: M, y: iy + 0.16, w: 3.5, h: 2.0, fontSize: 14, color: C.text2, lineSpacingMultiple: 1.12 });
  mono(s, 'ILUSTRACIÓN CONCEPTUAL DEL KIT', { x: R - 4.0, y: 6.95, w: 4.0, h: 0.26, align: 'right', fontSize: 12 });
  return s;
};

// =====================================================================
// 2 · EL PARQUE SE CONSERVA Y LA BENCINA PESA CADA VEZ MÁS
// =====================================================================
D.oportunidad = () => {
  const s = contenido('INTRODUCCIÓN · CONTEXTO GLOBAL Y NACIONAL', 'EL PARQUE SE CONSERVA', 'y la bencina pesa cada vez más.');
  const cols = [
    ['EL MUNDO Y CHILE', '2035', 'Desde ese año, los livianos nuevos que se vendan en Chile serían de cero emisiones.', 'META PÚBLICA'],
    ['EL PARQUE SE CONSERVA', '3,5', 'autos usados transferidos por cada auto nuevo (2026).', null],
    ['EL USO SE ENCARECE', '$1.541', 'por litro de bencina 93 en la RM, desde $1.149.', null],
  ];
  const g = 0.45, w = (CW - 2 * g) / 3, y = Y0 + 0.05;
  cols.forEach(([k, n, v, m], i) => {
    const x = M + i * (w + g);
    regla(s, y, x, w, i === 2 ? C.accent1 : C.accent5);
    mono(s, k, { x, y: y + 0.12, w, h: 0.3, color: i === 2 ? C.accent1 : C.text2 });
    if (i === 2) brillo(s, x, y + 0.5, 2.6, 1.1, 0.5);
    numero(s, n, { x, y: y + 0.4, w, h: 1.1, fontSize: 72, color: i === 2 ? C.accent1 : C.text1, valign: 'middle' });
    T(s, v, { x, y: y + 1.55, w: w - 0.1, h: 0.95, fontSize: 18, color: C.text2 });
    if (i < 2) flecha(s, x + w + 0.08, y + 0.95, g - 0.16, 0, C.accent3, 1.5);
  });
  const by = Y0 + 2.75, bh = YF - by - 0.05;
  cajaHot(s, M, by, CW, bh);
  mono(s, 'EL PROBLEMA', { x: M + 0.3, y: by + 0.18, w: 3, h: 0.3, color: C.accent1 });
  T(s, [{ text: 'Quien conserva su auto a combustión solo puede ', options: {} }, { text: 'seguir pagando la bencina o cambiar de auto.', options: { bold: true, color: C.accent1 } }],
    { x: M + 0.3, y: by + 0.48, w: CW - 0.6, h: bh - 0.58, fontSize: 22, valign: 'middle' });
  return s;
};

// =====================================================================
// 3 · UN KIT QUE SE SUMA, NO REEMPLAZA
// =====================================================================
D.negocio = () => {
  const s = contenido('COMPRENSIÓN DEL NEGOCIO · LA SOLUCIÓN', 'UN KIT QUE SE SUMA,', 'no reemplaza.');
  const iw = 7.7, ih = iw * 740 / 2400;
  s.addImage({ path: A('plano.png'), x: M + 0.1, y: Y0 - 0.05, w: iw, h: ih, altText: 'Ilustración del kit: motor original adelante, unidad de control, banco de baterías y motor eléctrico en el eje trasero' });
  const ly = Y0 + ih + 0.08, pw = (iw + 0.2) / 4;
  regla(s, ly, M, iw + 0.2);
  [['01', 'MOTOR ORIGINAL', 'Intacto, con su tracción'], ['02', 'UNIDAD DE CONTROL', 'Decide cuándo asistir'], ['03', 'BATERÍAS', 'Guardan energía al frenar'], ['04', 'MOTOR ELÉCTRICO', 'Asiste desde el eje trasero']].forEach(([n, k, v], i) => {
    const x = M + i * pw;
    tag(s, n, x, ly + 0.16, { off: i === 0, w: 0.5, h: 0.34, size: 14 });
    mono(s, k, { x: x + 0.6, y: ly + 0.16, w: pw - 0.62, h: 0.34, fontSize: 12, color: C.text1, valign: 'middle', charSpacing: 0.5 });
    T(s, v, { x, y: ly + 0.6, w: pw - 0.15, h: 0.55, fontSize: 16, color: C.text2 });
  });
  T(s, [{ text: 'Freno, ABS y control de estabilidad originales: ', options: {} }, { text: 'siempre mandan sobre el kit.', options: { color: C.accent1 } }], { x: M, y: YF - 0.36, w: iw + 0.6, h: 0.4, fontSize: 16, valign: 'middle' });
  const rx = M + iw + 0.65, rw = R - rx;
  [['PREOPERATIVA', 'Sin taller, personal, clientes ni ventas', null], ['CONTEMPLARÍA', 'Un taller que instala hibridación aditiva no enchufable', null], ['AHORRO POR COMPROBAR', 'Hasta 20% menos bencina en ciudad', 'ESTIMACIÓN']].forEach(([k, v, m], i) => {
    const y = Y0 + i * 1.38;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    mono(s, k, { x: rx, y: y + 0.1, w: rw, h: 0.3, color: i ? C.text2 : C.accent1 });
    T(s, v, { x: rx, y: y + 0.45, w: rw, h: 0.85, fontSize: 18, valign: 'top' });
    if (m) marca(s, 'est', m, rx, y + 1.2, { size: 12, h: 0.32 });
  });
  return s;
};

// =====================================================================
// 4 · EL CLIENTE COMPRARÍA AHORRO SIN CAMBIAR DE AUTO
// =====================================================================
D.cliente = () => {
  const s = contenido('COMPRENSIÓN DEL NEGOCIO · CLIENTE, PROPUESTA Y MODELO', 'EL CLIENTE COMPRARÍA AHORRO', 'sin cambiar de auto.');
  const g = 0.35, w1 = 3.45, w2 = 4.65, w3 = CW - w1 - w2 - 2 * g, y = Y0, h = 3.3;
  // cliente
  regla(s, y, M, w1, C.accent1);
  mono(s, 'CLIENTE', { x: M, y: y + 0.1, w: w1, h: 0.3, color: C.accent1 });
  T(s, 'Vehículos livianos', { x: M, y: y + 0.45, w: w1, h: 0.4, fontSize: 20, bold: true, valign: 'middle' });
  T(s, 'Prioridad: uso intensivo', { x: M, y: y + 0.88, w: w1, h: 0.35, fontSize: 17, color: C.text2, valign: 'middle' });
  const yl = lista(s, ['Conductores de aplicación', 'Taxis y colectivos', 'Particulares de trayecto largo'], M, y + 1.35, w1, { size: 17, gap: 0.14 });
  marca(s, 'sup', 'PRIORIDAD, NO EXCLUSIÓN', M, Math.max(yl + 0.05, y + 2.85), { size: 12, h: 0.34 });
  // propuesta de valor
  const x2 = M + w1 + g;
  brillo(s, x2, y, w2, h, 0.45);
  cajaHot(s, x2, y, w2, h);
  mono(s, 'PROPUESTA DE VALOR', { x: x2 + 0.25, y: y + 0.18, w: w2 - 0.5, h: 0.3, color: C.accent1 });
  marca(s, 'pen', 'POR COMPROBAR', x2 + w2 - 0.25, y + 0.16, { size: 12, h: 0.32, alignRight: true });
  ['Ahorrar sin comprar otro auto', 'Seguir con el mismo vehículo', 'Respaldo técnico verificable', 'Compatibilidad y costos claros'].forEach((t, i) => {
    const yy = y + 0.7 + i * 0.62;
    regla(s, yy, x2 + 0.25, w2 - 0.5);
    mono(s, String(i + 1).padStart(2, '0'), { x: x2 + 0.25, y: yy, w: 0.45, h: 0.62, fontSize: 13, color: C.accent1, valign: 'middle' });
    T(s, t, { x: x2 + 0.72, y: yy, w: w2 - 0.95, h: 0.62, fontSize: 18, valign: 'middle' });
  });
  // modelo de negocio
  const x3 = x2 + w2 + g;
  regla(s, y, x3, w3, C.accent1);
  mono(s, 'MODELO DE NEGOCIO', { x: x3, y: y + 0.1, w: w3, h: 0.3, color: C.accent1 });
  T(s, 'Taller propio', { x: x3, y: y + 0.45, w: w3, h: 0.4, fontSize: 19, bold: true, valign: 'middle' });
  marca(s, 'sup', 'DISEÑADO', x3, y + 0.9, { size: 12, h: 0.3 });
  T(s, 'Diagnóstico, instalación, verificación y posventa', { x: x3, y: y + 1.25, w: w3, h: 0.6, fontSize: 16, color: C.text2 });
  T(s, 'Licencias a talleres', { x: x3, y: y + 1.95, w: w3, h: 0.4, fontSize: 19, bold: true, valign: 'middle' });
  marca(s, 'est', 'POTENCIAL', x3, y + 2.4, { size: 12, h: 0.3 });
  T(s, 'Calibraciones, procedimiento y Lumine Habilita', { x: x3, y: y + 2.75, w: w3, h: 0.6, fontSize: 16, color: C.text2 });
  // entrevistas
  const by = y + h + 0.3;
  regla(s, by, M, CW);
  mono(s, 'ENTREVISTAS · n = 3', { x: M, y: by + 0.15, w: 2.6, h: 0.5, valign: 'middle' });
  T(s, [{ text: 'Antes que el precio, preocupa ', options: {} }, { text: 'quién responde si algo falla.', options: { bold: true } }], { x: M + 2.6, y: by + 0.15, w: CW - 5.0, h: 0.5, fontSize: 20, valign: 'middle', fontFace: F_SER, italic: true });
  marca(s, 'est', 'INDICATIVO', R, by + 0.23, { size: 12, h: 0.34, alignRight: true });
  return s;
};

// =====================================================================
// 5 · MISIÓN, VISIÓN Y VALORES QUE SE PUEDEN VERIFICAR
// =====================================================================
D.identidad = () => {
  const s = contenido('DECLARACIONES ESTRATÉGICAS COMPARTIDAS', 'MISIÓN, VISIÓN Y VALORES', 'que se pueden verificar.');
  const lw = 5.5;
  [['MISIÓN', '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»', 1.62],
    ['VISIÓN', '«Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las compañías de seguros.»', 1.3]].forEach(([k, v, hh], i) => {
    const y = i ? Y0 + 2.0 : Y0;
    regla(s, y, M, lw, C.accent1);
    mono(s, k, { x: M, y: y + 0.1, w: lw, h: 0.3, color: C.accent1 });
    T(s, v, { x: M, y: y + 0.42, w: lw, h: hh, fontSize: 16, valign: 'top', lineSpacingMultiple: 1.0 });
  });
  marca(s, 'no', 'PROYECTO · NO ES CERTIFICACIÓN OBTENIDA', M, YF - 0.34, { size: 12, h: 0.34 });
  const rx = M + lw + 0.5, rw = R - rx;
  let y = Y0;
  [['VALORES ORGANIZACIONALES', ['Verificabilidad antes que afirmación', 'Formalidad como condición de operación', 'Trazabilidad del conocimiento técnico', 'Responsabilidad sobre el ciclo completo del componente']],
    ['VALORES HUMANOS', ['Honestidad técnica en el diagnóstico', 'Seguridad de quien instala y de quien conduce', 'Responsabilidad individual sobre la instalación ejecutada', 'Reconocimiento del oficio técnico']]].forEach(([k, items], i) => {
    regla(s, y, rx, rw, C.accent1);
    mono(s, k, { x: rx, y: y + 0.1, w: rw, h: 0.3, color: C.accent1 });
    y = lista(s, items, rx, y + 0.48, rw, { size: 16, gap: 0.1, color: i ? C.text2 : C.accent1 }) + 0.15;
  });
  return s;
};

// =====================================================================
// 6 · PEST
// =====================================================================
D.pest = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · ENTORNO GENERAL · PEST', 'EL ENTORNO PESA EN CONTRA:', '20 amenazas frente a 13 oportunidades.');
  const lw = 7.0;
  mono(s, 'FACTORES POR DIMENSIÓN · 51 EN TOTAL', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  const labels = ['Político-jurídico', 'Económico', 'Sociocultural', 'Tecnológico'];
  s.addChart(pres.ChartType.bar, [
    { name: 'Oportunidades', labels, values: [2, 2, 2, 7] },
    { name: 'Neutros', labels, values: [3, 6, 7, 2] },
    { name: 'Amenazas', labels, values: [4, 8, 4, 4] },
  ], Object.assign({}, EJES, {
    x: M - 0.1, y: Y0 + 0.35, w: lw + 0.1, h: YF - Y0 - 0.35, barDir: 'bar', barGrouping: 'stacked', barGapWidthPct: 45,
    chartColors: [HEX.accent1, '4A5D72', 'FFFFFF'], catAxisOrientation: 'maxMin',
    showValue: true, dataLabelPosition: 'ctr', dataLabelColor: '000000', dataLabelFontBold: true, dataLabelFontSize: 16,
    valAxisHidden: true, catAxisLabelFontSize: 16, showLegend: true, legendPos: 'b', legendFontSize: 16, showTitle: false, objectName: 'Gráfico PEST por dimensión',
  }));
  const cx = M + lw + 0.5, cw = R - cx;
  brillo(s, cx, Y0 + 0.05, 2.0, 1.1, 0.5);
  numero(s, '2,82', { x: cx, y: Y0 - 0.1, w: 2.6, h: 1.3, fontSize: 80, color: C.accent1, valign: 'middle' });
  T(s, [{ text: 'GLOBAL HOY', options: { breakLine: true, fontFace: F_MONO, fontSize: 13, color: C.accent1 } }, { text: 'escala 1 a 5 · 3 = neutro', options: { color: C.text2 } }], { x: cx + 2.6, y: Y0 + 0.25, w: cw - 2.6, h: 0.7, fontSize: 16 });
  const filas = [['Político-jurídico', 2.67, 'Ley sin reglamento'], ['Económico', 2.38, 'Pago y costos importados'], ['Sociocultural', 3.0, 'Neutro'], ['Tecnológico', 3.23, 'Única sobre el neutro']];
  const rh = 0.66, y0 = Y0 + 1.4;
  filas.forEach(([k, v, l], i) => {
    const y = y0 + i * rh, top = v > 3;
    regla(s, y, cx, cw, C.accent5);
    T(s, k, { x: cx, y: y + 0.04, w: cw - 1.2, h: 0.32, fontSize: 17, bold: true, valign: 'middle' });
    T(s, l, { x: cx, y: y + 0.34, w: cw - 1.2, h: 0.3, fontSize: 16, color: C.text2, valign: 'middle' });
    numero(s, v.toFixed(2).replace('.', ','), { x: R - 1.2, y, w: 1.2, h: rh, fontSize: 30, align: 'right', valign: 'middle', color: top ? C.accent1 : v < 3 ? C.text1 : C.text2 });
  });
  regla(s, y0 + 4 * rh, cx, cw);
  return s;
};

// =====================================================================
// 7 · CINCO FUERZAS
// =====================================================================
D.porter = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · INDUSTRIA · CINCO FUERZAS', 'EL RIVAL ES POSPONER LA COMPRA,', 'no otro taller.');
  const lw = 7.2;
  mono(s, 'INTENSIDAD POR FUERZA · 0 A 5 · PESO DEL MODELO', { x: M, y: Y0, w: lw, h: 0.3, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Intensidad', labels: ['Sustitutos · 30%', 'Nuevos entrantes · 20%', 'Proveedores · 15%', 'Clientes · 25%', 'Rivalidad · 10%'], values: [5.0, 3.75, 2.67, 2.64, 1.83] },
  ], Object.assign({}, EJES, {
    x: M - 0.1, y: Y0 + 0.35, w: lw + 0.1, h: YF - Y0 - 0.35, barDir: 'bar', barGapWidthPct: 40, catAxisOrientation: 'maxMin',
    chartColors: [HEX.accent1, '4A5D72', '4A5D72', '4A5D72', '4A5D72'],
    valAxisMinVal: 0, valAxisMaxVal: 5.6, valAxisMajorUnit: 1, valAxisHidden: true,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.00', dataLabelFontSize: 18, dataLabelFontBold: true, dataLabelColor: HEX.dk1,
    catAxisLabelFontSize: 16, showLegend: false, showTitle: false, objectName: 'Gráfico cinco fuerzas',
  }));
  const cx = M + lw + 0.5, cw = R - cx;
  brillo(s, cx, Y0 + 0.05, 2.0, 1.1, 0.5);
  numero(s, '3,49', { x: cx, y: Y0 - 0.1, w: 2.6, h: 1.3, fontSize: 80, color: C.accent1, valign: 'middle' });
  T(s, [{ text: 'PROMEDIO PONDERADO', options: { breakLine: true, fontFace: F_MONO, fontSize: 13, color: C.accent1 } }, { text: 'industria poco atractiva', options: { color: C.text2 } }], { x: cx + 2.6, y: Y0 + 0.25, w: cw - 2.6, h: 0.7, fontSize: 16 });
  const by = Y0 + 1.4, bh = 2.05;
  cajaHot(s, cx, by, cw, bh);
  mono(s, 'SUSTITUTO PRINCIPAL', { x: cx + 0.25, y: by + 0.18, w: cw - 0.5, h: 0.3, color: C.accent1 });
  T(s, 'Seguir con el auto actual', { x: cx + 0.25, y: by + 0.5, w: cw - 0.5, h: 0.45, fontSize: 21, bold: true, valign: 'middle' });
  T(s, 'No paga el kit, pero sigue pagando toda su bencina. También compite el híbrido usado.', { x: cx + 0.25, y: by + 1.0, w: cw - 0.5, h: 0.95, fontSize: 17, color: C.text2 });
  marca(s, 'no', 'LOS PESOS NO SON % DE AMENAZA', cx, YF - 0.36, { size: 12, h: 0.34 });
  return s;
};

// =====================================================================
// 8 · ESCENARIOS REGULATORIOS
// =====================================================================
D.escenarios = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · ENTORNO REGULATORIO', 'LA VÍA LEGAL DECIDE', 'si el negocio opera.');
  const nodoP = (x, y, w, h, t, hot) => {
    caja(s, x, y, w, h, hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } } : { line: { color: C.text2, width: 0.75 } });
    T(s, t, { x: x + 0.18, y, w: w - 0.36, h, fontSize: 16, valign: 'middle', lineSpacingMultiple: 0.95 });
  };
  const ex = 8.45, ew = R - ex, eh = 0.78, yt = 2.32;
  const ys = [yt, yt + 0.92, yt + 2.12, yt + 3.04];
  const E = [['E1', 'Vía legal amplia', 'Premia al primero que homologa'], ['E2', 'Vía acotada', 'Solo parque sin ABS ni airbag'], ['E3', 'Vía alternativa', 'Alteración de características'], ['E4', 'Sin vía legal', 'El negocio no opera']];
  E.forEach(([k, t, v], i) => {
    const y = ys[i];
    caja(s, ex, y, ew, eh, { line: { color: i === 3 ? C.text1 : C.accent5, width: i === 3 ? 1.25 : 0.75, dashType: i === 3 ? 'dash' : 'solid' } });
    tag(s, k, ex + 0.15, y + (eh - 0.36) / 2, { off: i > 0, w: 0.55, h: 0.36, size: 14 });
    T(s, t, { x: ex + 0.85, y: y + 0.05, w: ew - 1.0, h: 0.36, fontSize: 18, bold: true, valign: 'middle' });
    T(s, v, { x: ex + 0.85, y: y + 0.4, w: ew - 1.0, h: 0.34, fontSize: 16, color: C.text2, valign: 'middle' });
  });
  const bx = 4.3, bw = 3.2, bh = 1.12;
  const yB = (ys[0] + ys[1] + eh) / 2 - bh / 2, yC = (ys[2] + ys[3] + eh) / 2 - bh / 2;
  nodoP(bx, yB, bw, bh, '¿Se excluyen los autos con ABS, airbag o control de estabilidad?', false);
  nodoP(bx, yC, bw, bh, '¿Procede inscribirlo como alteración de características?', false);
  const aw = 3.3, ah = 1.3, yA = (yB + bh / 2 + yC + bh / 2) / 2 - ah / 2;
  nodoP(M, yA, aw, ah, '¿El reglamento admitirá una transformación que conserva el motor?', true);
  const codo = (x1, y1, xm, y2, x2, col, wd, dash) => {
    const ln = { color: col, width: wd, dashType: dash || 'solid' };
    s.addShape(S.line, { x: x1, y: y1, w: xm - x1, h: 0, line: ln });
    s.addShape(S.line, { x: xm, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1), line: ln });
    s.addShape(S.line, { x: xm, y: y2, w: x2 - xm, h: 0, line: Object.assign({}, ln, { endArrowType: 'triangle' }) });
  };
  const aMid = yA + ah / 2, bMid = yB + bh / 2, cMid = yC + bh / 2, xm1 = (M + aw + bx) / 2;
  codo(M + aw, aMid, xm1, bMid, bx, C.text2, 1.25);
  codo(M + aw, aMid, xm1, cMid, bx, C.text2, 1.25);
  mono(s, 'SÍ', { x: xm1 - 0.5, y: bMid + 0.05, w: 0.42, h: 0.3, fontSize: 13, color: C.text1, align: 'right' });
  mono(s, 'NO', { x: xm1 - 0.5, y: cMid - 0.36, w: 0.42, h: 0.3, fontSize: 13, color: C.text1, align: 'right' });
  const xm2 = (bx + bw + ex) / 2;
  [[bMid, ys[0] + eh / 2, 'NO'], [bMid, ys[1] + eh / 2, 'SÍ'], [cMid, ys[2] + eh / 2, 'SÍ'], [cMid, ys[3] + eh / 2, 'NO']].forEach(([y1, y2, l]) => {
    codo(bx + bw, y1, xm2, y2, ex, C.text2, 1.25);
    mono(s, l, { x: xm2 + 0.1, y: y2 < y1 ? y2 + 0.04 : y2 - 0.34, w: 0.5, h: 0.3, fontSize: 13, color: C.text1 });
  });
  // situación vigente
  const sy = yA + ah + 0.25;
  regla(s, sy, M, aw, C.accent1);
  mono(s, 'SITUACIÓN VIGENTE', { x: M, y: sy + 0.1, w: aw, h: 0.3, color: C.accent1 });
  T(s, 'Ley N° 21.793 (14-01-2026), sin reglamento.', { x: M, y: sy + 0.42, w: aw, h: 0.55, fontSize: 16 });
  T(s, 'Borrador de 2021: transformar era cambiar el motor.', { x: M, y: sy + 0.98, w: aw, h: 0.55, fontSize: 16, color: C.text2 });
  marca(s, 'pen', 'NI HABILITADOS NI PROHIBIDOS: DEPENDE DEL REGLAMENTO', R, YF - 0.34, { size: 12, h: 0.34, alignRight: true });
  return s;
};

// =====================================================================
// 9 · RECURSOS Y CAPACIDADES
// =====================================================================
const HITT = [
  ['Biblioteca de calibraciones', 'Recurso', 4, 'POTENCIAL'],
  ['Ingeniería de integración y calibración', 'Capacidad', 4, 'POTENCIAL'],
  ['Formación interna en proceso y calibración', 'Capacidad', 3, 'TEMPORAL'],
  ['Homologación por par modelo-kit', 'Recurso', 2, 'TEMPORAL'],
  ['Autorización del taller', 'Recurso', 2, 'TEMPORAL'],
  ['Técnicos con licencia SEC', 'Recurso', 2, 'TEMPORAL'],
  ['Gestión regulatoria e institucional', 'Capacidad', 2, 'TEMPORAL'],
  ['Diagnóstico previo y posventa', 'Capacidad', 2, 'TEMPORAL'],
  ['Taller, kit, equipamiento y otros 4', '7 ítems', 1, 'IGUALDAD'],
];
function tablaHitt(s, tx, y0, rh, conTipo) {
  const tw = R - tx, cons = 1.55, vx = R - cons - 1.5, tipoW = conTipo ? 1.3 : 0;
  mono(s, 'RECURSO O CAPACIDAD', { x: tx, y: y0, w: 4, h: 0.3, fontSize: 12 });
  if (conTipo) mono(s, 'TIPO', { x: vx - tipoW, y: y0, w: tipoW, h: 0.3, fontSize: 12 });
  ['V', 'R', 'C', 'I'].forEach((k, j) => mono(s, k, { x: vx + j * 0.36, y: y0, w: 0.3, h: 0.3, fontSize: 12, align: 'center', color: C.text1 }));
  mono(s, 'RESULTADO', { x: R - cons, y: y0, w: cons, h: 0.3, fontSize: 12, align: 'right' });
  HITT.forEach(([n, t, v, c], i) => {
    const y = y0 + 0.34 + i * rh, top = v === 4;
    regla(s, y, tx, tw, i ? C.accent5 : C.accent1);
    T(s, n, { x: tx, y, w: vx - tx - tipoW - 0.1, h: rh, valign: 'middle', fontSize: 16, bold: top });
    if (conTipo) T(s, t, { x: vx - tipoW, y, w: tipoW, h: rh, valign: 'middle', fontSize: 16, color: C.text2 });
    for (let j = 0; j < 4; j++) s.addShape(S.rect, { x: vx + j * 0.36 + 0.08, y: y + rh / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: j < v ? (top ? C.accent1 : C.text2) : C.background1, transparency: j < v ? 0 : 100 }, line: { color: j < v ? (top ? C.accent1 : C.text2) : C.accent3, width: 0.75 } });
    mono(s, c, { x: R - cons, y, w: cons, h: rh, valign: 'middle', align: 'right', fontSize: 13, bold: top, color: top ? C.accent1 : c === 'TEMPORAL' ? C.text1 : C.text2 });
  });
  regla(s, y0 + 0.34 + HITT.length * rh, tx, tw);
  mono(s, 'V VALIOSO · R RARO · C COSTOSO DE IMITAR · I INSUSTITUIBLE', { x: tx, y: y0 + 0.42 + HITT.length * rh, w: tw, h: 0.28, fontSize: 12 });
}
D.recursos = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · RECURSOS Y CAPACIDADES', 'LA VENTAJA ES POTENCIAL:', '2 de 15 podrían sostenerla.');
  const stats = [['2', 'SOSTENIBLES EN POTENCIA', C.accent1], ['6', 'TEMPORALES', C.text1], ['7', 'IGUALDAD', C.text2], ['0', 'DESVENTAJAS', C.text2]];
  const sw = 1.85;
  stats.forEach(([n, k, col], i) => {
    const x = M + (i % 2) * (sw + 0.25), y = Y0 + Math.floor(i / 2) * 1.35;
    regla(s, y, x, sw, i ? C.accent5 : C.accent1);
    numero(s, n, { x, y: y + 0.05, w: sw, h: 0.9, fontSize: 60, valign: 'top', color: col });
    mono(s, k, { x, y: y + 0.95, w: sw + 0.2, h: 0.3, fontSize: 12, color: i === 0 ? C.accent1 : C.text2 });
  });
  const ty = Y0 + 2.85;
  T(s, [{ text: 'Biblioteca hoy vacía: ', options: { bold: true } }, { text: 'potencial de diferenciación sujeto a desarrollo y protección.', options: { color: C.text2 } }], { x: M, y: ty, w: 2 * sw + 0.25, h: 0.95, fontSize: 17 });
  marca(s, 'est', 'POTENCIAL, NO EFECTIVA', M, YF - 0.36, { size: 12, h: 0.34 });
  tablaHitt(s, M + 4.5, Y0, 0.38, false);
  return s;
};

// =====================================================================
// 10 · CADENA DE VALOR Y FACTORES CRÍTICOS
// =====================================================================
const FCE = [
  ['Gestión regulatoria e institucional', '', 2, 2, 'Sin interlocución formal con la autoridad'],
  ['Financiamiento en el punto de venta', '', 3, 2, 'Sin convenio'],
  ['Ingeniería de integración y calibración', '', 4, 2, 'Diseñada; riesgo de incompatibilidad con la electrónica original'],
  ['Talento certificado en alta tensión', '', 2, 2, 'Perfil escaso; sin esquema de retención'],
  ['Logística de insumos críticos', '', 3, 2, 'Protocolo definido; carga peligrosa con plazos largos'],
  ['Estandarización y tiempo de taller', '', 4, 3, 'Cinco etapas definidas; no probadas'],
];
const FCE_CORTO = ['Regulación', 'Financiamiento', 'Integración', 'Alta tensión', 'Insumos críticos', 'Estandarización'];
D.cadena = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · CADENA DE VALOR Y FACTORES CRÍTICOS', 'FORTALEZA DE DISEÑO, NO DE EJECUCIÓN:', 'operaciones es el cuello de botella.');
  const dw = 8.15, mg = 0.42;
  const apoyo = [['INFRAESTRUCTURA', 'CONDICIÓN DE ENTRADA', 'pen'], ['RECURSOS HUMANOS', '', null], ['DESARROLLO TECNOLÓGICO', 'FUENTE DE DIFERENCIACIÓN', 'hot'], ['ADQUISICIONES', '', null]];
  const ah = 0.4, ag = 0.06, y0 = Y0;
  apoyo.forEach(([t, k, tipo], i) => {
    const y = y0 + i * (ah + ag), hot = tipo === 'hot';
    caja(s, M, y, dw - mg, ah, hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } } : { line: { color: tipo ? C.text2 : C.accent5, width: 0.75 } });
    mono(s, t, { x: M + 0.15, y, w: 3.6, h: ah, valign: 'middle', fontSize: 12, color: C.text1 });
    if (k) mono(s, k, { x: M + dw - mg - 3.75, y, w: 3.6, h: ah, valign: 'middle', align: 'right', fontSize: 12, bold: true, color: hot ? C.accent1 : C.text1 });
  });
  const py = y0 + 4 * (ah + ag) + 0.05, ph = 1.3, pg = 0.07, pw = (dw - mg - 4 * pg) / 5;
  const prim = [['Logística de entrada', 'COSTO'], ['Operaciones', 'CUELLO DE BOTELLA'], ['Logística de salida', ''], ['Marketing y ventas', ''], ['Posventa', '']];
  prim.forEach(([t, k], i) => {
    const x = M + i * (pw + pg), hot = i === 1;
    caja(s, x, py, pw, ph, hot ? { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } } : { line: { color: k ? C.text2 : C.accent5, width: 0.75 } });
    T(s, t, { x: x + 0.07, y: py + 0.1, w: pw - 0.12, h: 0.55, fontSize: 15, bold: true });
    if (k) mono(s, k, { x: x + 0.1, y: py + 0.72, w: pw - 0.2, h: 0.5, fontSize: 12, bold: true, color: hot ? C.accent1 : C.text1, charSpacing: 0 });
  });
  const mx = M + dw - mg + 0.07, mh = py + ph - y0;
  s.addShape(S.rect, { x: mx, y: y0, w: mg - 0.07, h: mh, fill: { color: C.accent6 }, line: { color: C.accent5, width: 0.75 } });
  T(s, 'MARGEN', { x: mx - (mh - (mg - 0.07)) / 2, y: y0 + mh / 2 - (mg - 0.07) / 2, w: mh, h: mg - 0.07, rotate: 270, align: 'center', valign: 'middle', fontFace: F_MONO, fontSize: 12, color: C.text2, charSpacing: 3 });
  // puntajes del instrumento 06
  const ny = py + ph + 0.18;
  [['3,00', 'HABILIDAD 1–5'], ['2,71', 'RIESGO 1–5'], ['−1,29 / −1,43', 'BRECHA CON UN LÍDER DE REFERENCIA']].forEach(([n, k], i) => {
    const x = M + [0, 1.8, 3.6][i], w = [1.7, 1.7, 4.4][i];
    numero(s, n, { x, y: ny - 0.05, w, h: 0.55, fontSize: 32, valign: 'middle', color: i === 2 ? C.text2 : C.text1 });
    mono(s, k, { x, y: ny + 0.5, w, h: 0.28, fontSize: 12 });
  });
  // factores críticos
  const cx = M + dw + 0.45, cw = R - cx;
  mono(s, 'FACTORES CRÍTICOS · 1 A 5', { x: cx, y: y0, w: cw, h: 0.3, color: C.text1 });
  const rh = 0.55;
  FCE.forEach((f, i) => {
    const y = y0 + 0.38 + i * rh, v = f[2], top = v >= 4;
    regla(s, y, cx, cw, i ? C.accent5 : C.accent1);
    T(s, FCE_CORTO[i], { x: cx, y, w: cw - 1.65, h: rh, fontSize: 16, bold: top, valign: 'middle' });
    medidor(s, v, R - 1.62, y + rh / 2 - 0.08, { color: top ? C.accent1 : C.text2 });
    numero(s, String(v), { x: R - 0.35, y, w: 0.35, h: rh, fontSize: 24, align: 'right', valign: 'middle', color: top ? C.accent1 : C.text1 });
  });
  regla(s, y0 + 0.38 + FCE.length * rh, cx, cw);
  marca(s, 'est', 'LOS DE 4: SIN PROBAR', cx, YF - 0.34, { size: 12, h: 0.34 });
  return s;
};

// =====================================================================
// 11 · FODA
// =====================================================================
const FODA = {
  F: ['Arquitectura que conserva el motor original', 'Proceso de instalación en cinco etapas', 'Segmento y requisitos técnicos delimitados'],
  D: ['Sin taller, casos medidos ni historial de marca', 'Biblioteca de calibraciones vacía', 'Talento en alta tensión escaso; sin convenios'],
  O: ['Parque que se conserva y envejece', 'Bencina al alza', 'Electrificación madura y baterías más baratas'],
  A: ['Reglamento pendiente de la Ley N° 21.793', 'Capacidad de pago y crédito caro', 'Dólar alto para un kit importado', 'Posponer la compra'],
};
D.foda = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · SÍNTESIS FODA', 'FODA: SABEMOS QUÉ HACER;', 'falta demostrarlo.');
  const yt = 2.3, lx = M + 0.5, g = 0.22, w = (R - lx - g) / 2, h = (YF - yt - 0.35 - g) / 2, y0 = yt + 0.35;
  mono(s, 'POSITIVO', { x: lx, y: yt, w, h: 0.3, color: C.text1, align: 'center' });
  mono(s, 'NEGATIVO', { x: lx + w + g, y: yt, w, h: 0.3, color: C.text1, align: 'center' });
  [['INTERNO', 0], ['EXTERNO', 1]].forEach(([k, i]) => {
    const y = y0 + i * (h + g);
    T(s, k, { x: M - (h - 0.4) / 2 + 0.02, y: y + h / 2 - 0.2, w: h, h: 0.4, rotate: 270, align: 'center', valign: 'middle', fontFace: F_MONO, fontSize: 13, color: C.text1, charSpacing: 2 });
  });
  const cuad = [['F', 'FORTALEZAS', 0, 0], ['D', 'DEBILIDADES', 1, 0], ['O', 'OPORTUNIDADES', 0, 1], ['A', 'AMENAZAS', 1, 1]];
  cuad.forEach(([k, t, c, r]) => {
    const x = lx + c * (w + g), y = y0 + r * (h + g), hot = k === 'A';
    if (hot) cajaHot(s, x, y, w, h); else caja(s, x, y, w, h, { line: { color: k === 'F' ? C.accent1 : C.accent5, width: 0.75 } });
    tag(s, k, x + 0.2, y + 0.18, { w: 0.42, h: 0.34, size: 14, off: !(k === 'F' || k === 'A') });
    mono(s, t, { x: x + 0.75, y: y + 0.18, w: 3, h: 0.34, valign: 'middle', color: k === 'F' || k === 'A' ? C.accent1 : C.text1 });
    if (k === 'F') marca(s, 'est', 'DE DISEÑO, NO PROBADAS', x + w - 0.2, y + 0.18, { size: 12, h: 0.32, alignRight: true });
    if (k === 'A') mono(s, 'DECIDEN EL NEGOCIO', { x: x + w - 3.2, y: y + 0.18, w: 3.0, h: 0.34, valign: 'middle', align: 'right', fontSize: 12, color: C.accent1 });
    const items = FODA[k], ih = (h - 0.65) / items.length;
    items.forEach((it, j) => {
      const yy = y + 0.6 + j * ih;
      s.addShape(S.rect, { x: x + 0.24, y: yy + ih / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: hot || k === 'F' ? C.accent1 : C.text2 }, line: { type: 'none' } });
      T(s, it, { x: x + 0.45, y: yy, w: w - 0.65, h: ih, fontSize: 17, valign: 'middle' });
    });
  });
  return s;
};

// =====================================================================
// 12 · TRES BRECHAS
// =====================================================================
D.brechas = () => {
  const s = contenido('ANÁLISIS ESTRATÉGICO · DIAGNÓSTICO INTEGRADO', 'TRES BRECHAS', 'que la estrategia debe cerrar.');
  const B = [
    ['01', 'HABILITAR', 'Una vía legal y técnica para instalar.', 'PEST, escenarios e infraestructura', 'Respuesta formal de la autoridad sobre la vía aplicable'],
    ['02', 'DEMOSTRAR', 'La promesa de ahorro, convertida en una prestación medible.', 'Cinco fuerzas y entrevistas', 'Medición antes y después en el mismo auto'],
    ['03', 'ACUMULAR', 'Conocimiento de calibración construido y protegido.', 'Competencias y cadena de valor', 'Calibraciones registradas, versionadas y protegidas'],
  ];
  const g = 0.3, w = (CW - 2 * g) / 3, y = 2.25, h = 4.0;
  B.forEach(([n, t, v, de, ev], i) => {
    const x = M + i * (w + g), hot = i === 1;
    if (hot) { brillo(s, x, y, w, h, 0.45); cajaHot(s, x, y, w, h); } else caja(s, x, y, w, h, { line: { color: C.text2, width: 0.75 } });
    mono(s, n, { x: x + 0.25, y: y + 0.2, w: 0.6, h: 0.3, color: C.accent1, fontSize: 14 });
    T(s, t, { x: x + 0.25, y: y + 0.5, w: w - 0.5, h: 0.5, fontFace: F_TIT, fontSize: 26, valign: 'middle' });
    T(s, v, { x: x + 0.25, y: y + 1.05, w: w - 0.5, h: 0.95, fontSize: 18 });
    regla(s, y + 2.05, x + 0.25, w - 0.5);
    mono(s, 'VIENE DE', { x: x + 0.25, y: y + 2.13, w: w - 0.5, h: 0.28, fontSize: 12 });
    T(s, de, { x: x + 0.25, y: y + 2.42, w: w - 0.5, h: 0.58, fontSize: 16, color: C.text2 });
    mono(s, 'LA CERRARÍA', { x: x + 0.25, y: y + 3.05, w: w - 0.5, h: 0.28, fontSize: 12, color: C.accent1 });
    T(s, ev, { x: x + 0.25, y: y + 3.34, w: w - 0.5, h: 0.6, fontSize: 16 });
  });
  const by = y + h + 0.12;
  T(s, [{ text: 'Entrada del Avance 2: ', options: { bold: true } }, { text: 'estrategia, objetivos y Cuadro de Mando Integral.', options: { color: C.text2 } }], { x: M, y: by, w: CW - 2.0, h: 0.45, fontSize: 18, valign: 'middle' });
  marca(s, 'sup', 'AVANCE 2', R, by + 0.06, { size: 12, h: 0.34, alignRight: true });
  return s;
};

// =====================================================================
// 13 · CIERRE
// =====================================================================
D.cierre = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  s.addShape(S.rect, { x: 0, y: 0, w: W, h: 7.5, fill: { color: '000000', transparency: 35 }, line: { type: 'none' } });
  s.addImage({ path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' });
  mono(s, [{ text: '13', options: { color: C.accent1 } }, { text: '  ——  CONCLUSIÓN', options: { color: C.text2 } }], { x: M, y: 0.92, w: 6, h: 0.3, valign: 'middle' });
  T(s, [
    { text: 'LUMINE NO COMPITE CON OTROS TALLERES:', options: { breakLine: true, fontFace: F_TIT, fontSize: 30 } },
    { text: 'compite con la decisión de esperar.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 44 } },
  ], { x: M, y: 1.4, w: CW, h: 1.3, lineSpacingMultiple: 0.95 });
  const items = [['PROBLEMA', 'Real'], ['FORTALEZA', 'De diseño'], ['ENTORNO', 'En contra'], ['VÍA LEGAL', 'Pendiente']];
  const iw = 1.6;
  items.forEach(([k, v], i) => {
    const x = M + (i % 2) * (iw + 0.2), y = 3.0 + Math.floor(i / 2) * 0.95;
    regla(s, y, x, iw, i ? C.text2 : C.accent1);
    mono(s, k, { x, y: y + 0.08, w: iw, h: 0.3, color: i ? C.text2 : C.accent1 });
    T(s, v, { x, y: y + 0.4, w: iw, h: 0.42, fontSize: 20, bold: true, valign: 'middle' });
  });
  T(s, [{ text: 'Avance 2: ', options: { bold: true, color: C.text1 } }, { text: 'de las tres brechas a la estrategia, los objetivos y los indicadores.', options: { color: C.text2 } }], { x: M, y: 5.0, w: 3.4, h: 1.1, fontSize: 17 });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: M, y: 6.35, w: 5, h: 0.4, fontSize: 18, color: C.accent1, bold: true, valign: 'middle' });
  mono(s, 'DIEGO ALARCÓN · BENJAMÍN TORRES · LUKAS VERDUGO', { x: M, y: 6.8, w: 7, h: 0.3, fontSize: 12 });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces y láminas de respaldo
// =====================================================================
D.indice = (primeras) => {
  const s = contenido('MATERIAL DE APOYO · NO SE EXPONE', 'ANEXO', 'para preguntas.');
  const rowH = 0.32, y0 = Y0 - 0.12;
  G.ANEXO.forEach((a, i) => {
    const y = y0 + i * rowH, n = primeras + i;
    regla(s, y, M, CW);
    tag(s, a.codigo, M, y + 0.03, { w: 0.62, h: 0.26, size: 12, off: a.codigo === 'A13' });
    s.addText(a.titulo, { x: M + 0.8, y, w: CW - 2.0, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 16, color: a.codigo === 'A13' ? HEX.dk2 : HEX.dk1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('LÁM. ' + n, { x: R - 1.1, y, w: 1.1, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 13, color: HEX.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
  });
  regla(s, y0 + G.ANEXO.length * rowH, M, CW);
  return s;
};

function tabla(s, cols, filas, y0, o = {}) {
  const rh = o.rh || 0.6, size = o.size || 16;
  let x = M;
  cols.forEach(([k, w]) => { mono(s, k, { x, y: y0, w, h: 0.3, fontSize: 12, color: C.accent1 }); x += w; });
  filas.forEach((f, i) => {
    const y = y0 + 0.34 + i * rh;
    regla(s, y, M, CW, i ? C.accent5 : C.accent1);
    let xx = M;
    f.forEach((v, j) => {
      const w = cols[j][1];
      T(s, v, { x: xx, y, w: w - 0.15, h: rh, fontSize: size, valign: 'middle', bold: !!(o.negrita && o.negrita.includes(j)) || (o.filaNegrita === i), color: o.gris && o.gris.includes(j) ? C.text2 : (o.cian && o.cian.includes(j) ? C.accent1 : C.text1), lineSpacingMultiple: 0.92 });
      xx += w;
    });
  });
  regla(s, y0 + 0.34 + filas.length * rh, M, CW);
}

D['a-metodo'] = () => {
  const s = contenido('MÉTODO · ESCALAS DE CADA MATRIZ', 'CADA MATRIZ TIENE SU ESCALA:', 'así se leen.');
  tabla(s, [['INSTRUMENTO', 3.0], ['ESCALA', 3.0], ['CÓMO SE LEE', 3.9], ['RESULTADO', CW - 9.9]], [
    ['PEST (03) · Francés', '1 a 5 por factor; 3 = neutro', 'Bajo 3, entorno desfavorable', '2,82 hoy · 2,99 futuro'],
    ['Cinco fuerzas (02) · Porter', '0 a 5 por fuerza, ponderado', '5 = fuerza más intensa: industria menos atractiva', '3,49'],
    ['Competencias (05) · Hitt', 'Cuatro criterios: V, R, C, I', 'Los cuatro: sostenible; V y R: temporal; solo V: igualdad', '2 · 6 · 7 · 0'],
    ['Cadena de valor (06) · Porter', '1 a 5 en habilidad y en riesgo', 'En riesgo, un número bajo es riesgo alto', '3,00 · 2,71'],
    ['Factores críticos (06) · Francés', '1 a 5 (gran debilidad a gran fortaleza)', '4 = fortaleza leve; 2 = debilidad', 'de 2 a 4'],
  ], Y0, { rh: 0.68, size: 16, negrita: [0], cian: [3] });
  marca(s, 'no', 'ESCALAS DE CONTROL DE GESTIÓN · NO COMPARABLES CON INTEGRADOR II', M, YF - 0.36, { size: 12, h: 0.34 });
  return s;
};

D['a-pest'] = () => {
  const s = contenido('PEST · DETALLE', 'EL 2,82 EN DETALLE:', 'conteo, puntajes y evidencias.');
  tabla(s, [['DIMENSIÓN', 2.3], ['OPORT.', 1.0], ['NEUTROS', 1.15], ['AMEN.', 1.0], ['HOY', 0.85], ['FUTURO', 0.95]], [
    ['Político-jurídico', '2', '3', '4', '2,67', '2,78'],
    ['Económico', '2', '6', '8', '2,38', '2,81'],
    ['Sociocultural', '2', '7', '4', '3,00', '3,00'],
    ['Tecnológico', '7', '2', '4', '3,23', '3,38'],
    ['Global', '13', '18', '20', '2,82', '2,99'],
  ], Y0, { rh: 0.6, size: 17, filaNegrita: 4, cian: [4] });
  const rx = M + 7.65, rw = R - rx;
  mono(s, 'EVIDENCIAS DEL INSTRUMENTO 03', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 12, color: C.accent1 });
  ['PIB 2026 recortado a 0,25%–0,75%', 'Desempleo 9,5%; TPM 4,5%', 'Dólar cerca de $970', 'Bencina 93: de $1.149 a $1.541 por litro', 'Baterías LFP en US$81 por kWh', 'Empleo en transporte +9,7%', '3,5 usados por cada auto nuevo'].forEach((t, i) => {
    const y = Y0 + 0.34 + i * 0.47;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    T(s, t, { x: rx, y, w: rw, h: 0.47, fontSize: 16, valign: 'middle' });
  });
  marca(s, 'pen', 'VERIFICAR LA FUENTE PRIMARIA DE CADA EVIDENCIA ANTES DE CITARLA', M, YF - 0.34, { size: 12, h: 0.34 });
  return s;
};

D['a-porter'] = () => {
  const s = contenido('CINCO FUERZAS · CÁLCULO', 'EL 3,49 ES UNA SUMA PONDERADA,', 'no un porcentaje de amenaza.', { dosLineas: true });
  tabla(s, [['FUERZA', 2.5], ['PESO', 1.0], ['INTENSIDAD', 1.5], ['APORTE', 1.2], ['POR QUÉ', CW - 6.2]], [
    ['Sustitutos', '30%', '5,00', '1,50', 'Seguir con el auto actual o comprar un híbrido usado'],
    ['Nuevos entrantes', '20%', '3,75', '0,75', 'Si se abre la vía legal, otros con capital pueden homologar'],
    ['Clientes', '25%', '2,64', '0,66', 'Sensibles al precio y con liquidez limitada'],
    ['Proveedores', '15%', '2,67', '0,40', 'Componentes estandarizados; cambiar de proveedor obliga a rehomologar'],
    ['Rivalidad', '10%', '1,83', '0,18', 'Sin oferta directa identificada de hibridación de autos en uso'],
    ['Total', '100%', '', '3,49', 'Presión moderadamente alta: industria poco atractiva'],
  ], Y0 - 0.1, { rh: 0.56, size: 16, negrita: [0], cian: [3], filaNegrita: 5 });
  return s;
};

D['a-impacto'] = () => {
  const s = contenido('PEST · IMPACTO E INCERTIDUMBRE', 'CINCO FACTORES CRÍTICOS,', 'todos inciertos.');
  const g = 0.4, w = (CW - g) / 2;
  [['ALTO IMPACTO · ALTA INCERTIDUMBRE', 'Se tratan con escenarios', ['Reglamento de la Ley N° 21.793', 'Reconocimiento de aseguradoras y plantas', 'Precio de la bencina (volátil)', 'Tipo de cambio (kit 100% importado)', 'Ahorro real, sin medición propia'], true],
    ['ALTO IMPACTO · BAJA INCERTIDUMBRE', 'Tendencias para planificar', ['Parque que envejece y se conserva', 'Componentes estandarizados', 'Sustitutos: seguir con el auto o un híbrido usado', 'Metas de reciclaje (Ley REP) para baterías'], false]].forEach(([k, sub, items, hot], i) => {
    const x = M + i * (w + g), h = YF - Y0;
    if (hot) cajaHot(s, x, Y0, w, h); else caja(s, x, Y0, w, h);
    mono(s, k, { x: x + 0.25, y: Y0 + 0.2, w: w - 0.5, h: 0.3, color: hot ? C.accent1 : C.text1 });
    T(s, sub, { x: x + 0.25, y: Y0 + 0.52, w: w - 0.5, h: 0.4, fontSize: 18, fontFace: F_SER, italic: true, color: C.text2 });
    items.forEach((t, j) => {
      const y = Y0 + 1.05 + j * 0.56;
      regla(s, y, x + 0.25, w - 0.5);
      T(s, t, { x: x + 0.25, y, w: w - 0.5, h: 0.56, fontSize: 17, valign: 'middle' });
    });
  });
  return s;
};

D['a-hitt'] = () => {
  const s = contenido('COMPETENCIAS · 15 RECURSOS Y CAPACIDADES', 'UNA SOLA COMPETENCIA CENTRAL,', 'y todavía potencial.');
  tablaHitt(s, M, Y0 - 0.1, 0.38, true);
  return s;
};

D['a-fce'] = () => {
  const s = contenido('CADENA DE VALOR · FACTORES CRÍTICOS DE ÉXITO', 'LAS CONDICIONES DE ENTRADA', 'están entre las más débiles.');
  tabla(s, [['FACTOR CRÍTICO', 4.3], ['HABILIDAD', 1.45], ['RIESGO', 1.25], ['ESTADO', CW - 7.0]], FCE.map(f => [f[0], String(f[2]), String(f[3]), f[4]]), Y0 - 0.1, { rh: 0.56, size: 16, negrita: [0], cian: [1] });
  mono(s, 'ESCALA 1 (GRAN DEBILIDAD) A 5 (GRAN FORTALEZA) · EN RIESGO, UN NÚMERO BAJO ES RIESGO ALTO', { x: M, y: YF - 0.3, w: CW, h: 0.3, fontSize: 12 });
  return s;
};

D['a-foda'] = () => {
  const s = contenido('FODA · CRUCES PARA EL AVANCE 2', 'DEL FODA A LAS PREGUNTAS', 'de la formulación.');
  const C4 = [['FO', 'Homologar primero los modelos más frecuentes del segmento priorizado.'], ['DO', 'Pedir un pronunciamiento formal a la autoridad mientras se elabora el reglamento.'],
    ['FA', 'Mostrar el ahorro mensual estimado frente al costo del kit, con su método y sus límites.'], ['DA', 'Buscar acuerdos con aseguradoras, plantas de revisión técnica y una financiera antes de vender. Hoy no existen.']];
  const g = 0.3, w = (CW - g) / 2, h = 1.5;
  C4.forEach(([k, t], i) => {
    const x = M + (i % 2) * (w + g), y = Y0 - 0.25 + Math.floor(i / 2) * (h + 0.2);
    caja(s, x, y, w, h);
    tag(s, k, x + 0.22, y + 0.22, { w: 0.6, h: 0.36, size: 14, off: true });
    T(s, t, { x: x + 1.0, y: y + 0.15, w: w - 1.2, h: h - 0.3, fontSize: 18, valign: 'middle' });
  });
  const by = Y0 - 0.25 + 2 * (h + 0.2);
  T(s, [{ text: 'Quinto cruce (DA): ', options: { bold: true } }, { text: 'cobertura cambiaria y proveedor de largo plazo (cambiarlo obliga a rehomologar).', options: { color: C.text2 } }], { x: M, y: by, w: CW, h: 0.45, fontSize: 17, valign: 'middle' });
  marca(s, 'no', 'INSUMO PARA EL AVANCE 2 · NO ES ESTRATEGIA APROBADA', M, YF - 0.3, { size: 12, h: 0.34 });
  return s;
};

D['a-cliente'] = () => {
  const s = contenido('CLIENTE · AHORRO DERIVADO Y ENTREVISTAS', 'UN TECHO DE AHORRO,', 'no una medición.');
  const lw = 6.2;
  mono(s, '150–250 KM/DÍA · 24 DÍAS · 10 KM/L · $1.450/L', { x: M, y: Y0, w: lw, h: 0.3, fontSize: 12 });
  [['GASTO MENSUAL EN BENCINA', '$522.000 – $870.000', false], ['CON HASTA 20% MENOS', '$104.400 – $174.000', true]].forEach(([k, v, hot], i) => {
    const y = Y0 + 0.45 + i * 1.35;
    regla(s, y, M, lw, hot ? C.accent1 : C.accent5);
    mono(s, k, { x: M, y: y + 0.1, w: lw, h: 0.3, color: hot ? C.accent1 : C.text2 });
    numero(s, v, { x: M, y: y + 0.4, w: lw, h: 0.85, fontSize: 44, valign: 'middle', color: hot ? C.accent1 : C.text1 });
  });
  T(s, 'Ahorro mensual como techo, derivado de una estimación de ingeniería. No es un ahorro medido.', { x: M, y: Y0 + 3.25, w: lw, h: 0.65, fontSize: 16, color: C.text2 });
  marca(s, 'sup', 'SUPUESTOS DEL EQUIPO · NO ES MEDICIÓN', M, YF - 0.34, { size: 12, h: 0.34 });
  const rx = M + lw + 0.5, rw = R - rx;
  mono(s, 'ENTREVISTAS EN PROFUNDIDAD · n = 3', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 12, color: C.accent1 });
  [['01', 'No intervenir el motor ni la mecánica original'], ['02', 'Confianza: garantía escrita, quién responde ante fallas y un caso verificable'], ['03', 'Precio: no fue el temor dominante']].forEach(([n, t], i) => {
    const y = Y0 + 0.4 + i * 0.85;
    regla(s, y, rx, rw);
    mono(s, n, { x: rx, y: y + 0.1, w: 0.5, h: 0.3, color: C.accent1 });
    T(s, t, { x: rx + 0.55, y: y + 0.05, w: rw - 0.55, h: 0.78, fontSize: 17, valign: 'middle' });
  });
  T(s, 'Tensión: los instrumentos 02 y 03 muestran un cliente muy sensible al precio. Ambas cosas pueden ser ciertas; resolverlo exige una muestra aleatoria y cuantitativa.', { x: rx, y: Y0 + 3.0, w: rw, h: 1.15, fontSize: 16, color: C.text2 });
  return s;
};

D['a-identidad'] = () => {
  const s = contenido('DECLARACIONES ESTRATÉGICAS · TEXTO LITERAL', 'MISIÓN, VISIÓN Y VALORES', 'completos.');
  T(s, [{ text: 'MISIÓN  ', options: { fontFace: F_MONO, fontSize: 13, color: C.accent1 } }, { text: '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»' }], { x: M, y: Y0 - 0.05, w: CW, h: 0.95, fontSize: 17, valign: 'top' });
  T(s, [{ text: 'VISIÓN  ', options: { fontFace: F_MONO, fontSize: 13, color: C.accent1 } }, { text: '«Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las compañías de seguros.»' }], { x: M, y: Y0 + 0.98, w: CW, h: 0.7, fontSize: 17, valign: 'top' });
  const w = (CW - 0.4) / 2, y = Y0 + 1.85;
  [['VALORES ORGANIZACIONALES', ['Verificabilidad antes que afirmación', 'Formalidad como condición de operación', 'Trazabilidad del conocimiento técnico', 'Responsabilidad sobre el ciclo completo del componente']], ['VALORES HUMANOS', ['Honestidad técnica en el diagnóstico', 'Seguridad de quien instala y de quien conduce', 'Responsabilidad individual sobre la instalación ejecutada', 'Reconocimiento del oficio técnico']]].forEach(([k, items], i) => {
    const x = M + i * (w + 0.4);
    regla(s, y, x, w, C.accent1);
    mono(s, k, { x, y: y + 0.08, w, h: 0.3, color: C.accent1 });
    lista(s, items, x, y + 0.48, w, { size: 16, gap: 0.12 });
  });
  return s;
};

D['a-origen'] = () => {
  const s = contenido('TRANSPARENCIA · ORIGEN DE CADA AFIRMACIÓN', 'DATO, EVALUACIÓN, ESTIMACIÓN O FALTA:', 'cada cifra dice qué es.', { dosLineas: true });
  const cols = [['DATO PÚBLICO', ['Ley N° 21.793 sin reglamento', 'Meta 2035 de electromovilidad', 'Precios y transferencias (fuente primaria por adjuntar)'], { color: C.accent1, width: 1.25 }],
    ['EVALUACIÓN DEL EQUIPO', ['Puntajes de PEST, Porter, Hitt y cadena de valor', 'Escenarios E1 a E4', 'FODA y tres brechas'], { color: C.text2, width: 1, dashType: 'sysDot' }],
    ['ESTIMACIÓN', ['Hasta 20% menos bencina en ciudad', 'Ahorro mensual derivado', 'Señales de las entrevistas (n = 3)'], { color: C.text2, width: 1, dashType: 'dash' }],
    ['SIN DATO HOY', ['Precio del kit y costos', 'Ahorro medido en autos chilenos', 'Permisos, clientes y convenios'], { color: C.text1, width: 1.25, dashType: 'dash' }]];
  const g = 0.25, w = (CW - 3 * g) / 4, h = YF - Y0;
  cols.forEach(([k, items, ln], i) => {
    const x = M + i * (w + g);
    caja(s, x, Y0, w, h, { fill: { color: C.background1, transparency: 100 }, line: ln });
    mono(s, k, { x: x + 0.2, y: Y0 + 0.2, w: w - 0.4, h: 0.5, bold: true, color: i === 0 ? C.accent1 : C.text1 });
    items.forEach((t, j) => {
      const yy = Y0 + 0.8 + j * 1.05;
      regla(s, yy, x + 0.2, w - 0.4);
      T(s, t, { x: x + 0.2, y: yy + 0.06, w: w - 0.4, h: 0.92, fontSize: 17, valign: 'middle' });
    });
  });
  return s;
};

D['a-correspondencia'] = () => {
  const s = contenido('COHERENCIA CON EL INFORME ESCRITO', 'CADA LÁMINA TIENE SU SECCIÓN', 'en el informe.');
  const F = [
    ['02 · Contexto', '3. Introducción', 'A2 · A10'], ['03 · El kit', '4.1 Solución y funcionamiento', 'A10'], ['04 · Cliente y modelo', '4.2 Cliente · 4.3 Modelo de negocio', 'A8'],
    ['05 · Misión, visión, valores', '5.1 · 5.2 · 5.3', 'A9'], ['06 · PEST', '6.2 Entorno general', 'A1 · A2 · A4'], ['07 · Cinco fuerzas', '6.3 Industria', 'A3'],
    ['08 · Escenarios', '6.2 Entorno general (vía regulatoria)', 'Ley N° 21.793'], ['09 · Recursos', '6.4 Capacidades internas', 'A5'], ['10 · Cadena de valor', '6.4 Cadena de valor y factores críticos', 'A6'],
    ['11 · FODA', '6.5 Síntesis FODA', 'A7'], ['12 · Tres brechas', '6.6 Diagnóstico integrado', '—'],
  ];
  tabla(s, [['LÁMINA', 4.0], ['SECCIÓN DEL INFORME', 5.4], ['EVIDENCIA', CW - 9.4]], F.map(f => f), Y0 - 0.12, { rh: 0.355, size: 16, negrita: [0], cian: [2] });
  return s;
};

D['a-biblio'] = () => {
  const s = contenido('REFERENCIAS', 'BIBLIOGRAFÍA', 'en formato APA.');
  const refs = [
    'Francés, A. (2006). Estrategia y planes para la empresa: con el cuadro de mando integral. Pearson Educación.',
    'Hitt, M. A., Ireland, R. D. y Hoskisson, R. E. Administración estratégica: competitividad y globalización. Cengage Learning. [Confirmar la edición y el año usados].',
    'Kaplan, R. S. y Norton, D. P. (2008). The execution premium: integrando la estrategia y las operaciones para lograr ventajas competitivas. Deusto.',
    'Ley N° 21.793. (2026, 14 de enero). Diario Oficial de la República de Chile. [Completar con el título oficial].',
    'Ministerio de Energía. (2021). Estrategia Nacional de Electromovilidad. Gobierno de Chile.',
    'Porter, M. E. (1985). Competitive advantage: Creating and sustaining superior performance. Free Press.',
    'Porter, M. E. (2008). Las cinco fuerzas competitivas que le dan forma a la estrategia. Harvard Business Review América Latina, 86(1).',
  ];
  refs.forEach((r, i) => {
    const y = Y0 - 0.1 + i * 0.6;
    regla(s, y, M, CW, i ? C.accent5 : C.accent1);
    T(s, r, { x: M, y, w: CW, h: 0.6, fontSize: 16, valign: 'middle', color: /\[/.test(r) ? C.text2 : C.text1 });
  });
  return s;
};

D['a-cmi'] = () => {
  const s = contenido('RESPALDO · AVANCE 2 · NO SE EXPONE', 'CMI PRELIMINAR:', 'lo que viene en el Avance 2.');
  const P = [['FINANCIERA', ['Rentabilidad sobre el costo de capital', 'Margen por servicio', 'Expansión y licencias']],
    ['CLIENTES', ['Promesa técnica cumplida', 'Ahorro acreditado', 'Confianza del cliente', 'Segmento captado']],
    ['PROCESOS', ['Vía legal', 'Par modelo-kit aprobado', 'Instalación segura', 'Medición y posventa', 'Réplica en talleres', 'Acuerdos que destraban la compra']],
    ['APRENDIZAJE', ['Biblioteca de calibraciones', 'Técnicos habilitados', 'Protocolo de medición', 'Lumine Habilita']]];
  const rh = 0.88;
  P.forEach(([k, items], i) => {
    const y = Y0 + i * (rh + 0.1);
    linea(s, M, y, 0, rh, C.accent1, 2);
    mono(s, k, { x: M + 0.15, y, w: 1.8, h: rh, valign: 'middle', color: C.text1, fontSize: 12 });
    const cw = (R - M - 2.0) / items.length;
    items.forEach((t, j) => {
      const x = M + 2.0 + j * cw;
      caja(s, x, y + 0.08, cw - 0.12, rh - 0.16, { line: { color: C.accent5, width: 0.75, dashType: 'sysDot' } });
      T(s, t, { x: x + 0.1, y: y + 0.08, w: cw - 0.32, h: rh - 0.16, fontSize: 15, valign: 'middle', align: 'center', lineSpacingMultiple: 0.9 });
    });
  });
  marca(s, 'no', 'PROPUESTA DE TRABAJO · 17 OBJETIVOS SIN APROBAR', R, YF - 0.3, { size: 12, h: 0.34, alignRight: true });
  return s;
};

// ---------- orden de la exposición (guion.js), notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · ${G.mmss(G.segundos(x.texto))} a ${G.PALABRAS_POR_MINUTO} palabras por minuto (${G.palabras(x.texto)} palabras; asignado ${G.mmss(x.objetivo)})\n\n${x.texto}\n\n— Mensaje: ${x.mensaje}\n— Evidencia: ${x.evidencia}\n— Por qué importa: ${x.importa}\n— Transición: ${x.transicion}`;
let quienAnterior = null, parte = 0;
G.PRINCIPAL.forEach(x => {
  if (x.quien !== quienAnterior) { abrirSeccion(`${++parte} · ${x.quien}`); quienAnterior = x.quien; }
  if (!D[x.d]) throw new Error('Falta la diapositiva ' + x.d);
  CLAVE = x.d;
  D[x.d]().addNotes(nota(x));
});
abrirSeccion('Anexo · no se expone');
INDICE_ANEXO = G.PRINCIPAL.length + 1;
CLAVE = 'indice';
D.indice(INDICE_ANEXO + 1).addNotes('ANEXO · No se presenta. Cada pregunta tiene un enlace a su respuesta; cada lámina del anexo tiene un enlace de vuelta a este índice.');
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

// ---------- tipografías incrustadas ----------
// Sin esto, PowerPoint reemplaza las fuentes de la marca por Calibri o Arial en un computador que no las tenga.
// Se incrustan como lo hace PowerPoint (ppt/fonts/*.fntdata en EOT sin comprimir). Las cinco familias son OFL.
const FUENTES_PPTX = [
  [F_TIT, { regular: 'ArchivoSemiExpanded-ExtraBold.ttf' }],
  [F_CON, { regular: 'ArchivoCondensed-Regular.ttf', bold: 'ArchivoCondensed-Bold.ttf' }],
  [F_BODY, { regular: 'Figtree-Regular.ttf', bold: 'Figtree-Bold.ttf' }],
  [F_MONO, { regular: 'IBMPlexMono-Regular.ttf', bold: 'IBMPlexMono-Bold.ttf' }],
  [F_SER, { regular: 'InstrumentSerif-Regular.ttf', italic: 'InstrumentSerif-Italic.ttf' }],
];
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
