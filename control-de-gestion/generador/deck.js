// Presentación de Control de Gestión · Análisis Estratégico de Lumine Motors Chile SpA
// Sistema visual de la página comercial de Lumine: escenario negro, un solo acento celeste,
// titulares anchos en mayúsculas con acento en serif itálica, etiquetas mono de instrumento,
// esquinas de visor y números condensados.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const OUT = process.argv[2] || 'Lumine_Analisis_Estrategico_Control_de_Gestion.pptx';
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

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,333 × 7,5 in
pres.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo';
pres.company = 'Lumine Motors Chile SpA';
pres.title = 'Análisis Estratégico · Lumine Motors Chile SpA';
pres.subject = 'Control de Gestión · Teoría · ICMA901 · Sección 500 · NRC 4118';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const C = pres.SchemeColor;
const S = pres.ShapeType;

const W = 13.333, M = 0.6, CW = W - 2 * M, R = W - M;
const LOGO_H = 0.22, LOGO_W = LOGO_H * (127.25 / 26);

// ---------- piezas del sistema visual ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: 14, color: C.text1, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: 9.5, color: C.text2, charSpacing: 1.5 }, o));
function linea(s, x, y, w, h, color = C.accent5, width = 0.75, o = {}) {
  s.addShape(S.line, Object.assign({ x, y, w, h, line: { color, width } }, o));
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
  mono(s, text, { x: x + 0.1, y, w: w - 0.2, h, fontSize: o.size || 8.5, color, valign: 'middle', charSpacing: 1.2, fit: 'shrink' });
}
// punto de instrumento
const punto = (s, x, y, color = C.accent1, k = 0.075) => s.addShape(S.rect, { x, y, w: k, h: k, fill: { color }, line: { type: 'none' } });
// medidor de 5 casillas: 4-5 fortaleza (celeste), 3 equilibrio (gris), 1-2 debilidad (rojo)
function medidor(s, x, y, v, k = 0.15, gap = 0.05) {
  const col = v >= 4 ? C.accent1 : v === 3 ? C.text2 : C.accent4;
  for (let i = 0; i < 5; i++) s.addShape(S.rect, { x: x + i * (k + gap), y, w: k, h: k, fill: { color: i < v ? col : C.accent6 }, line: { color: i < v ? col : C.accent5, width: 0.5 } });
}
// número grande condensado (voz de tablero)
const numero = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: 54, color: C.text1, valign: 'bottom' }, o));

// ---------- marcos (layouts) ----------
const logo = { image: { path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' } };
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('fondo-portada.jpg') },
  objects: [
    logo,
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.72, w: CW, h: 1.95, fontFace: F_TIT, fontSize: 60, color: C.text1, align: 'center', valign: 'top', margin: 0, lineSpacingMultiple: 0.86 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: C.background1 },
  margin: [0.5, M, 0.6, M],
  objects: [
    logo,
    { text: { text: 'CONTROL DE GESTIÓN · ICMA901 · NRC 4118', options: { x: 6.2, y: 0.4, w: R - 6.2, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 9, color: C.text2, charSpacing: 1.5, margin: 0 } } },
    { text: { text: 'LUMINE MOTORS CHILE SPA · ANÁLISIS ESTRATÉGICO', options: { x: M, y: 6.98, w: 7, h: 0.24, valign: 'middle', fontFace: F_MONO, fontSize: 8, color: C.text2, charSpacing: 1.5, margin: 0 } } },
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

// diapositiva de contenido: etiqueta (índice + sección) y titular con acento en serif
function contenido(seccion, n, etiqueta, titulo, acento, notas) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: seccion });
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  s.addText([{ text: titulo + ' ' }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 35 } }], { placeholder: 'title' });
  if (notas) s.addNotes(notas);
  return s;
}
// fila de tabla con regla fina inferior
const regla = (s, y, x = M, w = CW, color = C.accent5) => linea(s, x, y, w, 0, color, 0.75);

const ejes = { // estilo común de gráficos: etiquetas mono grises, rejilla casi invisible
  catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: F_MONO, catAxisLabelFontSize: 10,
  valAxisLabelColor: HEX.dk2, valAxisLabelFontFace: F_MONO, valAxisLabelFontSize: 9,
  valGridLine: { color: '1F2427', size: 0.75 }, catGridLine: { style: 'none' },
  catAxisLineColor: HEX.accent5, valAxisLineShow: false,
  dataLabelFontFace: F_MONO, dataLabelFontSize: 10, dataLabelColor: HEX.dk1,
  legendFontFace: F_MONO, legendFontSize: 10, legendColor: HEX.dk2,
  chartArea: { fill: { color: HEX.lt1 } }, plotArea: { fill: { color: HEX.lt1 } },
};

// =====================================================================
// 1 · PORTADA
// =====================================================================
{
  pres.addSection({ title: 'Apertura' });
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: 'Apertura' });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 9 });
  mono(s, 'DESARROLLO DE LA ESTRATEGIA · LUMINE MOTORS CHILE SPA', { x: M, y: 1.22, w: CW, h: 0.3, align: 'center', valign: 'middle', fontSize: 10 });
  s.addText([
    { text: 'ANÁLISIS', options: { breakLine: true } },
    { text: 'estratégico.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 76 } },
  ], { placeholder: 'title' });
  s.addImage({ path: A('plano.png'), x: (W - 7.4) / 2, y: 3.62, w: 7.4, h: 7.4 * 740 / 2400, altText: 'Plano del kit Lumine: auto en vista lateral con el motor eléctrico en el eje trasero' });
  linea(s, M, 6.05, CW, 0, C.accent5);
  const cols = [
    ['CURSO', 'Control de Gestión · Teoría', 2.75],
    ['CÓDIGO', 'ICMA901 · Sección 500', 2.45],
    ['NRC', '4118', 1.05],
    ['INTEGRANTES', 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', 5.88],
  ];
  let x = M;
  cols.forEach(([k, v, w]) => {
    mono(s, k, { x, y: 6.22, w, h: 0.24, fontSize: 8.5 });
    T(s, v, { x, y: 6.5, w, h: 0.36, fontSize: 15 });
    x += w;
  });
  s.addNotes('Presentamos el análisis estratégico de Lumine Motors Chile SpA para Control de Gestión (Teoría, ICMA901, sección 500, NRC 4118). ' +
    'Lumine es una empresa preoperativa que propone un kit de hibridación: suma un motor eléctrico en el eje trasero de autos a combustión de tracción delantera, sin tocar el motor original. ' +
    'El análisis aplica los marcos del documento 00 (Kovacevic y Reynoso, Francés, Hitt, Porter, Kaplan y Norton) sobre los cuatro instrumentos que completó el grupo.');
}

// =====================================================================
// 2 · ÍNDICE
// =====================================================================
{
  const s = contenido('Apertura', '00', 'ÍNDICE', 'DE LOS INSTRUMENTOS', 'a la estrategia.',
    'El recorrido va de lo externo a lo interno y termina en la síntesis: FODA por perspectivas del CMI y la declaración de la estrategia. ' +
    'Cada sección indica el marco teórico y el instrumento del curso del que salen los datos (02 Industria, 03 PEST, 05 Competencias Centrales, 06 Cadena de Valor).');
  const items = [
    ['01', 'Propósito, fuentes y escenario', 'INSTRUMENTOS 02 · 03 · 05 · 06'],
    ['02', 'Escáner de ventajas competitivas', 'KOVACEVIC Y REYNOSO'],
    ['03', 'Relaciones de valor con los clientes', 'KOVACEVIC Y REYNOSO'],
    ['04', 'Redes de valor', 'KOVACEVIC Y REYNOSO'],
    ['05', 'Discontinuidades del entorno', 'KOVACEVIC Y REYNOSO'],
    ['06', 'Análisis externo', 'FRANCÉS · PEST (03)'],
    ['07', 'Cinco fuerzas competitivas', 'PORTER · 02'],
    ['08', 'Análisis interno', 'FRANCÉS · 7S'],
    ['09', 'Recursos, competencias y cadena de valor', 'HITT · 05 · 06'],
    ['10', 'FODA por perspectivas del CMI', 'KAPLAN Y NORTON'],
    ['11', 'Declaración de la estrategia', 'OVA · EJES'],
  ];
  const colW = (CW - 0.5) / 2, rowH = 0.62, y0 = 2.62;
  items.forEach(([n, t, f], i) => {
    const c = i < 6 ? 0 : 1, r = i < 6 ? i : i - 6;
    const x = M + c * (colW + 0.5), y = y0 + r * rowH;
    regla(s, y, x, colW);
    mono(s, n, { x, y: y + 0.1, w: 0.5, h: 0.3, valign: 'middle', fontSize: 10, color: C.accent1 });
    T(s, t, { x: x + 0.55, y: y + 0.08, w: colW - 0.55, h: 0.3, valign: 'middle', fontSize: 16 });
    mono(s, f, { x: x + 0.55, y: y + 0.38, w: colW - 0.55, h: 0.2, valign: 'middle', fontSize: 7.5 });
    if (r === 5 || i === items.length - 1) regla(s, y + rowH, x, colW);
  });
}

// =====================================================================
// 3 · CONTEXTO: LUMINE HOY
// =====================================================================
{
  pres.addSection({ title: 'Contexto y fuentes' });
  const s = contenido('Contexto y fuentes', '00', 'CONTEXTO · LA EMPRESA', 'UN KIT QUE SE SUMA,', 'no reemplaza.',
    'Lumine suma un motor eléctrico en el eje trasero, un banco de baterías LFP y una unidad de control; el motor original, la transmisión y la alimentación quedan intactos. ' +
    'La empresa es preoperativa: no tiene instalaciones, personal, clientes ni flujo de caja. Por eso, al compararla con competidores en operación, todas sus áreas salen debilidad y sus fortalezas reales están en factores puntuales. ' +
    'El segmento son vehículos de tracción delantera con alto kilometraje, con prioridad en colectiveros y conductores de aplicación. El ahorro de hasta 20% de bencina en ciudad es una estimación de ingeniería, no una medición en autos chilenos.');
  const x = M, y = 2.5, w = CW, h = 3.45;
  caja(s, x, y, w, h);
  visor(s, x, y, w, h);
  punto(s, x + 0.25, y + 0.17);
  mono(s, 'PLANO · VISTA LATERAL', { x: x + 0.42, y: y + 0.08, w: 4, h: 0.26, valign: 'middle', fontSize: 9 });
  mono(s, 'LM—001 · KIT EJE TRASERO', { x: R - 4.25, y: y + 0.08, w: 4, h: 0.26, valign: 'middle', align: 'right', fontSize: 9, color: C.accent5 });
  regla(s, y + 0.42, x, w);
  const iw = 5.9, ih = iw * 740 / 2400;
  s.addImage({ path: A('plano.png'), x: x + (w - iw) / 2, y: y + 0.47, w: iw, h: ih, altText: 'Plano del kit: motor original adelante, unidad de control, banco de baterías y motor eléctrico en el eje trasero' });
  const ly = y + 0.5 + ih + 0.05;
  regla(s, ly, x, w);
  const piezas = [
    ['01', 'MOTOR ORIGINAL', 'Intacto, con su tracción delantera.'],
    ['02', 'UNIDAD DE CONTROL', 'Decide cuándo asistir y corta ante fallas.'],
    ['03', 'BANCO DE BATERÍAS', 'Baterías LFP: guardan la energía del frenado.'],
    ['04', 'MOTOR ELÉCTRICO', 'En el eje trasero, con freno regenerativo.'],
  ];
  const pw = w / 4;
  piezas.forEach(([n, t, d], i) => {
    const px = x + i * pw;
    if (i) linea(s, px, ly, 0, y + h - ly, C.accent5);
    tag(s, n, px + 0.22, ly + 0.15, { off: i === 0 });
    mono(s, t, { x: px + 0.7, y: ly + 0.15, w: pw - 0.8, h: 0.27, valign: 'middle', fontSize: 9, color: C.text1 });
    T(s, d, { x: px + 0.22, y: ly + 0.5, w: pw - 0.4, h: 0.45, fontSize: 12, color: C.text2 });
  });
  const hechos = [
    ['PREOPERATIVA', 'Sin instalaciones, personal, clientes ni flujo de caja.'],
    ['SEGMENTO', 'Tracción delantera y alto kilometraje: colectiveros y apps.'],
    ['PROMESA', 'Hasta 20% menos bencina en ciudad (estimación, sin medir).'],
  ];
  const hw = (CW - 0.6) / 3;
  hechos.forEach(([k, v], i) => {
    const hx = M + i * (hw + 0.3);
    punto(s, hx, 6.17, i === 2 ? C.accent3 : C.accent1);
    mono(s, k, { x: hx + 0.16, y: 6.07, w: hw - 0.2, h: 0.27, valign: 'middle', fontSize: 9, color: C.text1 });
    T(s, v, { x: hx, y: 6.36, w: hw, h: 0.48, fontSize: 12.5, color: C.text2 });
  });
}

// =====================================================================
// 4 · 01 PROPÓSITO, FUENTES Y ESCENARIO
// =====================================================================
{
  const s = contenido('Contexto y fuentes', '01', 'PROPÓSITO, FUENTES Y ESCENARIO', 'CUATRO INSTRUMENTOS,', 'un solo escenario.',
    'El análisis se basa en los cuatro instrumentos del curso; el informe de las fases 1 y 2 se usó solo como contexto, y cuando difieren priman los instrumentos, que son más recientes. ' +
    'Industria (02): promedio ponderado de 3,49, moderadamente poco atractiva. PEST (03): 2,82 hoy y 2,99 a futuro, con 13 oportunidades, 18 neutros y 20 amenazas. ' +
    'Competencias (05): 2 ventajas sostenibles, 6 temporales y 7 de igualdad. Cadena de valor (06): habilidades 3,00 y riesgo 2,71, con brecha de −1,29 y −1,43 frente al líder. ' +
    'Escenario único: la Ley N° 21.793 sin reglamento, con el borrador de 2021 como referencia. El instrumento 04 de ratios no aplica porque aún no hay estados financieros.');
  const tiles = [
    ['02 · INDUSTRIA', '3,49', 'PROMEDIO PONDERADO · 1 A 5', 'Cinco fuerzas: industria moderadamente poco atractiva.'],
    ['03 · PEST', '2,82', 'GLOBAL HOY · 3 = NEUTRO', '13 oportunidades, 18 neutros y 20 amenazas.'],
    ['05 · COMPETENCIAS', '2 / 15', 'VENTAJAS SOSTENIBLES', 'De 15 recursos y capacidades: 6 temporales y 7 de igualdad.'],
    ['06 · CADENA DE VALOR', '3,00', 'HABILIDADES · 1 A 5', 'Riesgo 2,71; brecha con el líder de −1,29 y −1,43.'],
  ];
  const tw = (CW - 3 * 0.25) / 4, ty = 2.55, th = 2.45;
  tiles.forEach(([k, v, u, d], i) => {
    const x = M + i * (tw + 0.25);
    caja(s, x, ty, tw, th);
    mono(s, k, { x: x + 0.22, y: ty + 0.18, w: tw - 0.4, h: 0.26, fontSize: 9, color: C.accent1 });
    numero(s, v, { x: x + 0.2, y: ty + 0.45, w: tw - 0.4, h: 0.95, fontSize: 58 });
    mono(s, u, { x: x + 0.22, y: ty + 1.42, w: tw - 0.4, h: 0.24, fontSize: 8 });
    T(s, d, { x: x + 0.22, y: ty + 1.75, w: tw - 0.44, h: 0.6, fontSize: 13, color: C.text2 });
  });
  const by = 5.3, bw = 6.6;
  caja(s, M, by, bw, 1.42, { fill: { color: C.accent6 } });
  visor(s, M, by, bw, 1.42);
  mono(s, 'ESCENARIO EVALUADO', { x: M + 0.25, y: by + 0.16, w: 4, h: 0.24, fontSize: 9, color: C.accent1 });
  T(s, [
    { text: 'Ley N° 21.793 sin reglamento publicado. ', options: { bold: true } },
    { text: 'Única referencia: el borrador que el MTT sometió a consulta en diciembre de 2021, anterior a la ley.', options: { color: C.text2 } },
  ], { x: M + 0.25, y: by + 0.47, w: bw - 0.5, h: 0.85, fontSize: 14 });
  const adv = [
    ['SIN ESTADOS FINANCIEROS', 'Ratios (04) y análisis financiero comparativo no aplican hasta el Plan Financiero.'],
    ['CRITERIO DE FUENTES', 'Si los antecedentes y los instrumentos difieren, priman los instrumentos.'],
  ];
  const ax = M + bw + 0.4, aw = R - ax;
  adv.forEach(([k, v], i) => {
    const y = by + i * 0.74;
    regla(s, y, ax, aw);
    punto(s, ax, y + 0.15, C.accent3);
    mono(s, k, { x: ax + 0.17, y: y + 0.07, w: aw - 0.2, h: 0.24, fontSize: 8.5, color: C.text1 });
    T(s, v, { x: ax, y: y + 0.33, w: aw, h: 0.4, fontSize: 12.5, color: C.text2 });
  });
}

// =====================================================================
// 5 · 02 ESCÁNER: TENDENCIAS
// =====================================================================
{
  pres.addSection({ title: 'Entorno externo' });
  const s = contenido('Entorno externo', '02', 'ESCÁNER DE VENTAJAS COMPETITIVAS · KOVACEVIC Y REYNOSO', 'SIN VENTAJA COMPETITIVA', 'efectiva, todavía.',
    'Lumine no tiene hoy ninguna ventaja competitiva efectiva. El instrumento 05 identifica una sola competencia central, el conocimiento de calibración por marca y modelo, pero la biblioteca que lo contiene está vacía y sin protección formal. ' +
    'Las tendencias favorecen el negocio: el parque se conserva, el combustible sube, la batería LFP baja y crece el cliente prioritario. En contra juegan la actividad débil y el dólar alto, que encarece el kit importado. ' +
    'Para mover los márgenes hay tres palancas, aún sin cuantificar: precio por valor percibido, calibración que se paga una vez por modelo e ingresos recurrentes sobre la base instalada.');
  const lw = 7.55, y0 = 2.55;
  mono(s, 'TENDENCIAS Y PROYECCIONES', { x: M, y: y0, w: 4, h: 0.26, fontSize: 9, color: C.text1 });
  const filas = [
    [1, 'El parque se conserva', '3,5 usados transferidos por cada auto nuevo (2026)'],
    [1, 'El combustible sube', 'Bencina 93 de $1.149 a $1.541 por litro en la RM'],
    [1, 'El insumo crítico baja', 'Baterías LFP en US$81 por kWh'],
    [1, 'Crece el cliente prioritario', 'Empleo en transporte +9,7%; cuenta propia +14,3%'],
    [0, 'La actividad se debilita', 'PIB 2026 recortado a 0,25%–0,75%; desempleo 9,5%'],
    [0, 'El kit se encarece', 'Dólar cerca de $970, en máximos de más de un año'],
  ];
  const rh = 0.6;
  filas.forEach(([fav, t, d], i) => {
    const y = y0 + 0.36 + i * rh;
    regla(s, y, M, lw);
    chip(s, fav ? 'A FAVOR' : 'EN CONTRA', M, y + 0.16, 1.15, fav ? C.accent2 : C.accent4);
    T(s, t, { x: M + 1.35, y: y + 0.06, w: lw - 1.35, h: 0.27, fontSize: 14, bold: true });
    T(s, d, { x: M + 1.35, y: y + 0.32, w: lw - 1.35, h: 0.26, fontSize: 12.5, color: C.text2 });
  });
  regla(s, y0 + 0.36 + filas.length * rh, M, lw);
  // tarjeta: la única competencia central
  const cx = M + lw + 0.45, cw = R - cx, cy = 2.55, ch = 4.2;
  caja(s, cx, cy, cw, ch);
  visor(s, cx, cy, cw, ch);
  mono(s, 'COMPETENCIA CENTRAL · 05', { x: cx + 0.25, y: cy + 0.2, w: cw - 0.5, h: 0.24, fontSize: 9, color: C.accent1 });
  T(s, 'Calibración por marca y modelo', { x: cx + 0.25, y: cy + 0.5, w: cw - 0.5, h: 0.62, fontSize: 19, bold: true });
  T(s, 'Recurso (biblioteca) y capacidad (ingeniería de integración).', { x: cx + 0.25, y: cy + 1.14, w: cw - 0.5, h: 0.45, fontSize: 12.5, color: C.text2 });
  chip(s, 'POTENCIAL, NO EFECTIVA', cx + 0.25, cy + 1.7, 2.3);
  regla(s, cy + 2.17, cx + 0.25, cw - 0.5);
  mono(s, 'TRES PALANCAS DE MARGEN', { x: cx + 0.25, y: cy + 2.3, w: cw - 0.5, h: 0.24, fontSize: 8.5, color: C.text1 });
  const pal = ['Precio según valor y kilometraje', 'Calibración pagada una vez por modelo', 'Ingresos recurrentes de posventa'];
  pal.forEach((p, i) => {
    regla(s, cy + 2.62 + i * 0.48, cx + 0.25, cw - 0.5, C.accent6);
    mono(s, '0' + (i + 1), { x: cx + 0.25, y: cy + 2.62 + i * 0.48, w: 0.4, h: 0.48, valign: 'middle', fontSize: 9, color: C.accent1 });
    T(s, p, { x: cx + 0.65, y: cy + 2.62 + i * 0.48, w: cw - 0.9, h: 0.48, valign: 'middle', fontSize: 13, color: C.text1 });
  });
}

// =====================================================================
// 6 · 02 ESCÁNER: DOGMAS
// =====================================================================
{
  const s = contenido('Entorno externo', '02', 'ESCÁNER · INDUSTRIA Y DOGMAS', 'TRES DOGMAS', 'por desafiar.',
    'La industria tiene tres dogmas. Primero, que reducir la huella exige reemplazar el vehículo: desafiarlo abre el mercado de quienes conservan su auto. ' +
    'Segundo, que intervenir la propulsión es intervenir la combustión, lo que justifica limitarla a autos de pocos años: la arquitectura en el eje trasero no altera la combustión. ' +
    'Tercero, que transformar es cambiar el motor por uno eléctrico, según el borrador de 2021: se puede plantear al MTT porque la ley habla de «otras adaptaciones y transformaciones». ' +
    'Lo que Lumine puede hacer y los demás no es reunir tres atributos: mejorar el vehículo sin reemplazarlo, no excluirlo por antigüedad y entregar una certificación reconocible.');
  const d = [
    ['Reducir la huella del vehículo propio exige reemplazarlo.', 'Abre el mercado de los propietarios que conservan su vehículo en vez de reemplazarlo.'],
    ['Intervenir la propulsión es intervenir la combustión: solo autos de pocos años.', 'Justifica la arquitectura sobre el eje trasero, que no altera la combustión.'],
    ['Transformar es reemplazar el motor por uno eléctrico (borrador de 2021).', 'Plantearlo al MTT mientras elabora el reglamento: la ley habla de «otras adaptaciones y transformaciones».'],
  ];
  const cw = (CW - 2 * 0.3) / 3, cy = 2.55, ch = 3.25;
  d.forEach(([dog, op], i) => {
    const x = M + i * (cw + 0.3);
    caja(s, x, cy, cw, ch);
    mono(s, 'DOGMA 0' + (i + 1), { x: x + 0.25, y: cy + 0.2, w: 2, h: 0.24, fontSize: 9 });
    T(s, dog, { x: x + 0.25, y: cy + 0.52, w: cw - 0.5, h: 1.15, fontSize: 18, fontFace: F_SER, italic: true, color: C.text1 });
    regla(s, cy + 1.78, x + 0.25, cw - 0.5);
    punto(s, x + 0.25, cy + 1.98);
    mono(s, 'OPORTUNIDAD', { x: x + 0.42, y: cy + 1.88, w: 2, h: 0.26, valign: 'middle', fontSize: 9, color: C.accent1 });
    T(s, op, { x: x + 0.25, y: cy + 2.22, w: cw - 0.5, h: 0.95, fontSize: 13.5, color: C.text1 });
  });
  const by = 6.0;
  mono(s, 'COMMODITIZACIÓN', { x: M, y: by, w: 2.4, h: 0.26, fontSize: 9, color: C.accent1 });
  T(s, [
    { text: 'Alta en el hardware, baja en el servicio. ', options: { bold: true } },
    { text: 'El valor se traslada de la pieza a la calibración y la certificación: por eso el kit no se vende por separado.', options: { color: C.text2 } },
  ], { x: M + 2.4, y: by - 0.02, w: CW - 2.4, h: 0.6, fontSize: 14 });
}

// =====================================================================
// 7 · 03 CLIENTES: ATRIBUTOS
// =====================================================================
{
  const s = contenido('Entorno externo', '03', 'RELACIONES DE VALOR CON LOS CLIENTES', 'EL PRECIO DECIDE SI COMPRA;', 'la confianza, si se atreve.',
    'La necesidad central es reducir de forma permanente el gasto en combustible del vehículo que ya se tiene, sin reemplazarlo. ' +
    'Las entrevistas sugieren un orden: primero, que no se intervenga el motor (lo pidieron los tres entrevistados); segundo, confianza institucional; tercero, el precio. ' +
    'Hay una tensión entre fuentes: los instrumentos 02 y 03 muestran un cliente muy sensible al precio, mientras las entrevistas ponen la confianza antes. Ambas cosas pueden ser ciertas. ' +
    'Con n = 3 y muestra por conveniencia, el orden es una hipótesis que exige validar con una muestra aleatoria y cuantitativa.');
  const lw = 6.9;
  mono(s, 'NECESIDAD CENTRAL', { x: M, y: 2.55, w: 4, h: 0.24, fontSize: 9, color: C.accent1 });
  T(s, '«Evitar pagar cada vez más por usar el auto.»', { x: M, y: 2.85, w: lw, h: 0.55, fontFace: F_SER, italic: true, fontSize: 26 });
  mono(s, 'ATRIBUTOS VALORADOS · ORDEN TENTATIVO', { x: M, y: 3.62, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  const at = [
    ['01', 'No intervenir el motor ni la mecánica original', 'Condición espontánea en los tres entrevistados.'],
    ['02', 'Confianza institucional', 'Certificación, garantía escrita, mantención, un caso exitoso y quién responde ante fallas.'],
    ['03', 'Precio', 'No fue el temor dominante en las entrevistas.'],
  ];
  at.forEach(([n, t, d], i) => {
    const y = 3.95 + i * 0.9;
    regla(s, y, M, lw);
    numero(s, n, { x: M, y: y + 0.08, w: 0.85, h: 0.7, fontSize: 40, valign: 'top', color: i === 2 ? C.text2 : C.accent1 });
    T(s, t, { x: M + 1.0, y: y + 0.1, w: lw - 1.0, h: 0.3, fontSize: 15, bold: true });
    T(s, d, { x: M + 1.0, y: y + 0.42, w: lw - 1.0, h: 0.4, fontSize: 12.5, color: C.text2 });
  });
  // tarjeta: tensión entre fuentes
  const cx = M + lw + 0.45, cw = R - cx, cy = 2.55, ch = 4.15;
  caja(s, cx, cy, cw, ch);
  visor(s, cx, cy, cw, ch);
  mono(s, 'TENSIÓN ENTRE FUENTES', { x: cx + 0.25, y: cy + 0.2, w: cw - 0.5, h: 0.24, fontSize: 9, color: C.accent1 });
  const hw = (cw - 0.75) / 2;
  [['INSTRUMENTOS 02 Y 03', 'Cliente muy sensible al precio', 'Sensibilidad al precio = 1, el factor de mercado peor evaluado.'],
   ['ENTREVISTAS (n = 3)', 'La confianza va antes que el precio', 'La barrera es la confianza institucional, no el precio de lista.']].forEach(([k, t, d], i) => {
    const x = cx + 0.25 + i * (hw + 0.25);
    mono(s, k, { x, y: cy + 0.6, w: hw, h: 0.24, fontSize: 8 });
    T(s, t, { x, y: cy + 0.9, w: hw, h: 0.62, fontSize: 15, bold: true });
    T(s, d, { x, y: cy + 1.55, w: hw, h: 0.8, fontSize: 12, color: C.text2 });
  });
  linea(s, cx + 0.25 + hw + 0.125, cy + 0.6, 0, 1.8, C.accent5);
  regla(s, cy + 2.6, cx + 0.25, cw - 0.5);
  T(s, [
    { text: 'Ambas pueden ser ciertas: ', options: { bold: true } },
    { text: 'el precio decide si compra y la confianza decide si se atreve. Validarlo exige una muestra aleatoria y cuantitativa.', options: { color: C.text2 } },
  ], { x: cx + 0.25, y: cy + 2.75, w: cw - 0.5, h: 1.2, fontSize: 13.5 });
}

// =====================================================================
// 8 · 03 CLIENTES: VALOR Y PRECIO
// =====================================================================
{
  const s = contenido('Entorno externo', '03', 'RELACIONES DE VALOR · ESTRATEGIA DE PRECIO', 'EL VALOR ES EL', 'combustible evitado.',
    'El valor para el cliente es el gasto en combustible que evita. Con 150 a 250 km diarios, 24 días al mes, 10 km por litro y $1.450 por litro, el gasto mensual va de $522.000 a $870.000. ' +
    'Con el ahorro que usan los instrumentos 03 y 06, hasta 20% menos bencina en ciudad, el ahorro mensual queda entre $104.400 y $174.000. Es un techo: supone el máximo de la estimación y todo el recorrido en ciudad. ' +
    'El precio debe quedar muy por debajo de los $7.000.000 del híbrido usado y bajo el ahorro acumulado en la vida útil restante; el piso lo fija el costo, en el Plan Financiero. Se cobraría en cuotas, aunque la TPM de 4,5% las encarece.');
  const lw = 6.6, x = M;
  mono(s, 'AHORRO MENSUAL DERIVADO · TECHO', { x, y: 2.55, w: lw, h: 0.24, fontSize: 9, color: C.accent1 });
  numero(s, '$104.400 – $174.000', { x, y: 2.8, w: lw, h: 0.95, fontSize: 60, color: C.accent1 });
  mono(s, 'AL MES · CON HASTA 20% MENOS BENCINA EN CIUDAD', { x, y: 3.78, w: lw, h: 0.24, fontSize: 8.5 });
  // barras al estilo de la calculadora de la página
  const by = 4.25, bw = lw;
  mono(s, 'HOY GASTAS', { x, y: by, w: 3, h: 0.24, fontSize: 8.5 });
  T(s, '$522.000 – $870.000', { x: x + bw - 3.2, y: by - 0.04, w: 3.2, h: 0.3, align: 'right', fontFace: F_CON, bold: true, fontSize: 18 });
  s.addShape(S.rect, { x, y: by + 0.32, w: bw, h: 0.13, fill: { color: 'D4D7D9' }, line: { type: 'none' } });
  mono(s, 'CON LUMINE', { x, y: by + 0.68, w: 3, h: 0.24, fontSize: 8.5 });
  T(s, '$417.600 – $696.000', { x: x + bw - 3.2, y: by + 0.64, w: 3.2, h: 0.3, align: 'right', fontFace: F_CON, bold: true, fontSize: 18 });
  s.addShape(S.rect, { x, y: by + 1.0, w: bw, h: 0.13, fill: { color: C.accent6 }, line: { type: 'none' } });
  s.addShape(S.rect, { x, y: by + 1.0, w: bw * 0.8, h: 0.13, fill: { color: C.accent1 }, line: { type: 'none' } });
  mono(s, '−20% DE COMBUSTIBLE', { x: x + bw - 3, y: by + 1.2, w: 3, h: 0.22, align: 'right', fontSize: 8, color: C.accent1 });
  regla(s, 5.85, x, lw);
  mono(s, 'SUPUESTOS · 150–250 KM/DÍA · 24 DÍAS · 10 KM/L · $1.450/L', { x, y: 5.95, w: lw, h: 0.24, fontSize: 8.5 });
  T(s, 'Derivaciones aritméticas, no mediciones: el ahorro no se ha verificado en autos chilenos.', { x, y: 6.23, w: lw, h: 0.5, fontSize: 12.5, color: C.text2 });
  // escalera de precio
  const cx = M + lw + 0.5, cw = R - cx, cy = 2.55;
  mono(s, 'CÓMO ALINEAR PRECIO Y VALOR', { x: cx, y: cy, w: cw, h: 0.24, fontSize: 9, color: C.text1 });
  const esc = [
    ['TECHO EXTERNO', 'Muy por debajo de los $7.000.000 del híbrido usado.', C.accent4],
    ['TECHO INTERNO', 'Bajo el ahorro acumulado en la vida útil restante del vehículo.', C.accent3],
    ['PISO', 'Costo de componentes e instalación, que fija el Plan Financiero.', C.text2],
    ['FORMA DE COBRO', 'Cuota mensual antes que precio de lista; la TPM de 4,5% encarece las cuotas.', C.accent1],
  ];
  const ey = cy + 0.4, eh = 0.95;
  linea(s, cx + 0.06, ey + 0.1, 0, 3 * eh, C.accent5, 1.25);
  esc.forEach(([k, v, col], i) => {
    const y = ey + i * eh;
    s.addShape(S.rect, { x: cx, y: y + 0.04, w: 0.12, h: 0.12, fill: { color: col }, line: { type: 'none' } });
    mono(s, k, { x: cx + 0.35, y, w: cw - 0.35, h: 0.22, fontSize: 9, color: col === C.text2 ? C.text1 : col });
    T(s, v, { x: cx + 0.35, y: y + 0.27, w: cw - 0.35, h: 0.62, fontSize: 13.5 });
  });
}

// =====================================================================
// 9 · 04 REDES DE VALOR
// =====================================================================
{
  const s = contenido('Entorno externo', '04', 'REDES DE VALOR', 'UNA RED MÁS INSTITUCIONAL', 'que comercial.',
    'Los socios que deciden si el servicio puede venderse son el regulador, las aseguradoras, las plantas de revisión técnica y la institución financiera; ninguno está formalizado (06, cuentas claves: riesgo 2). ' +
    'No se proponen alianzas hacia atrás: la cadena de proveedores es fragmentada y a la baja. Pero si la homologación es por par modelo-kit, cambiar de proveedor obliga a rehomologar cada modelo, así que conviene un acuerdo de abastecimiento de largo plazo. ' +
    'Para mejorar la cadena de suministro: protocolo de contención ante señales regulatorias adversas, consolidación de embarques con cobertura cambiaria y externalización de aduana y transporte Clase 9.');
  const socios = [
    ['INSUMO ESTANDARIZADO', 'Fabricantes de motor y baterías LFP', 'PROVEEDOR SIN VALIDAR', C.accent3],
    ['HABILITADOR REGULATORIO', '3CV y Subsecretaría de Transportes', 'SIN INTERLOCUCIÓN FORMAL', C.accent4],
    ['VALIDADOR DE LA COMPRA', 'Compañías de seguros', 'EXCLUYEN MODIFICACIONES', C.accent4],
    ['VALIDADOR DE CIRCULACIÓN', 'Plantas de Revisión Técnica', 'SIN PROTOCOLO', C.accent4],
    ['HABILITADOR DE ACCESO', 'Instituciones financieras', 'SIN CONVENIO', C.accent4],
    ['CANAL DE CAPTACIÓN', 'Talleres independientes', 'EXPANSIÓN POSTERIOR', C.text2],
  ];
  const cw = 4.2, ch = 1.18, gap = 0.17, y0 = 2.55;
  const cx0 = (W - 1.5) / 2, cyC = y0 + 1.05; // nodo central
  socios.forEach(([rol, nom, est, col], i) => {
    const c = i < 3 ? 0 : 1, r = i % 3;
    const x = c ? R - cw : M, y = y0 + r * (ch + gap);
    // conexión al nodo central
    const ex = c ? x : x + cw, ey = y + ch / 2, nx = c ? cx0 + 1.5 : cx0, ny = cyC + 0.75;
    const lx = Math.min(ex, nx), lw = Math.abs(nx - ex), ly = Math.min(ey, ny), lh = Math.abs(ny - ey);
    linea(s, lx, ly, lw, lh, C.accent5, 1, { flipV: (nx - ex) * (ny - ey) < 0 });
    caja(s, x, y, cw, ch);
    mono(s, rol, { x: x + 0.22, y: y + 0.14, w: cw - 0.44, h: 0.22, fontSize: 8, color: C.accent1 });
    T(s, nom, { x: x + 0.22, y: y + 0.38, w: cw - 0.44, h: 0.32, fontSize: 14, bold: true });
    chip(s, est, x + 0.22, y + 0.78, Math.min(cw - 0.44, 0.35 + est.length * 0.085), col, { h: 0.25, size: 8 });
  });
  // nodo central: Lumine
  s.addShape(S.ellipse, { x: cx0, y: cyC, w: 1.5, h: 1.5, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1.25 } });
  s.addImage({ path: A('emblema.png'), x: cx0 + 0.4, y: cyC + 0.4, w: 0.7, h: 0.7, altText: 'Emblema de Lumine' });
  mono(s, 'LUMINE', { x: cx0 - 0.5, y: cyC + 1.62, w: 2.5, h: 0.24, align: 'center', fontSize: 9, color: C.text1 });
  T(s, [
    { text: 'Ninguno está formalizado. ', options: { bold: true, color: C.text1 } },
    { text: 'Elegir el primer proveedor es casi irreversible: cambiarlo obliga a rehomologar cada modelo.', options: { color: C.text2 } },
  ], { x: cx0 - 0.95, y: cyC + 2.05, w: 3.4, h: 1.25, fontSize: 12.5, align: 'center' });
}

// =====================================================================
// 10 · 05 DISCONTINUIDADES
// =====================================================================
{
  const s = contenido('Entorno externo', '05', 'DISCONTINUIDADES DEL ENTORNO', 'LA DISCONTINUIDAD', 'es normativa.',
    'La Ley N° 21.793 abrió una vía formal para intervenir la propulsión de vehículos en uso, y su reglamento decidirá si esa vía incluye a Lumine. Es un cambio abrupto, por evento. ' +
    'El resto del entorno cambia lento, con una excepción: el deterioro macroeconómico de 2026 (PIB recortado, desempleo de 9,5% y dólar alto), que golpea la capacidad de pago del cliente. ' +
    'El nicho que ninguna oferta formal cubre son los vehículos de más de siete años: no pueden convertirse a gas. Y la meta de 100% de ventas cero emisiones al 2035 recae sobre autos nuevos, así que el parque usado sigue envejeciendo y el nicho crece.');
  const tw = 8.15, y0 = 2.55;
  const cols = [['DIMENSIÓN', 0, 2.1], ['VELOCIDAD DEL CAMBIO', 2.1, 2.45], ['EVIDENCIA', 4.55, tw - 4.55]];
  cols.forEach(([k, x, w]) => mono(s, k, { x: M + x, y: y0, w, h: 0.24, fontSize: 8.5 }));
  const filas = [
    ['Regulación', 4, 'ABRUPTA, POR EVENTO', C.accent3, 'Ley del 14-01-2026; reglamento sin publicar'],
    ['Macroeconomía', 3, 'RÁPIDA, ADVERSA', C.accent4, 'PIB 2026 a 0,25%–0,75%; desempleo 9,5%'],
    ['Tipo de cambio', 3, 'RÁPIDA, ADVERSA', C.accent4, 'Dólar cerca de $970, máximo en más de un año'],
    ['Combustible', 3, 'ALTA Y VOLÁTIL', C.accent3, 'Bencina 93: de $1.149 a $1.541 por litro'],
    ['Precio de baterías', 2, 'SOSTENIDA A LA BAJA', C.accent2, 'LFP en US$81 por kWh'],
    ['Empleo en transporte', 2, 'SOSTENIDA AL ALZA', C.accent2, '+9,7%; cuenta propia +14,3%'],
    ['Conducta de compra', 1, 'LENTA Y ESTABLE', C.accent2, '3,5 usados por cada auto nuevo'],
    ['Carga eléctrica', 1, 'LENTA', C.text2, '84 puntos nuevos en el primer cuatrimestre'],
  ];
  const rh = 0.49;
  filas.forEach(([d, v, vt, col, ev], i) => {
    const y = y0 + 0.3 + i * rh;
    regla(s, y, M, tw);
    T(s, d, { x: M, y, w: 2.05, h: rh, valign: 'middle', fontSize: 13.5, bold: i === 0 });
    for (let k = 0; k < 4; k++) s.addShape(S.rect, { x: M + 2.1 + k * 0.17, y: y + rh / 2 - 0.06, w: 0.13, h: 0.13, fill: { color: k < v ? col : C.accent6 }, line: { color: k < v ? col : C.accent5, width: 0.5 } });
    mono(s, vt, { x: M + 2.85, y, w: 1.7, h: rh, valign: 'middle', fontSize: 8, color: col, charSpacing: 0.8 });
    T(s, ev, { x: M + 4.55, y, w: tw - 4.55, h: rh, valign: 'middle', fontSize: 12, color: C.text2 });
  });
  regla(s, y0 + 0.3 + filas.length * rh, M, tw);
  const cx = M + tw + 0.45, cw = R - cx, cy = 2.55, ch = 4.2;
  caja(s, cx, cy, cw, ch);
  visor(s, cx, cy, cw, ch);
  mono(s, 'NICHO NO CUBIERTO', { x: cx + 0.25, y: cy + 0.2, w: cw - 0.5, h: 0.24, fontSize: 9, color: C.accent1 });
  numero(s, '+7 AÑOS', { x: cx + 0.25, y: cy + 0.45, w: cw - 0.5, h: 0.9, fontSize: 56, color: C.accent1 });
  T(s, 'Vehículos que no pueden convertirse a gas: a su dueño solo le queda reemplazarlos o seguir igual.', { x: cx + 0.25, y: cy + 1.4, w: cw - 0.5, h: 0.95, fontSize: 13.5 });
  regla(s, cy + 2.45, cx + 0.25, cw - 0.5);
  mono(s, 'EFECTO DE SEGUNDO ORDEN', { x: cx + 0.25, y: cy + 2.58, w: cw - 0.5, h: 0.24, fontSize: 8.5, color: C.text1 });
  T(s, 'La meta 2035 de ventas cero emisiones recae sobre autos nuevos: el parque usado sigue envejeciendo y el nicho crece.', { x: cx + 0.25, y: cy + 2.88, w: cw - 0.5, h: 1.15, fontSize: 12.5, color: C.text2 });
}

// =====================================================================
// 11 · 06 PEST
// =====================================================================
{
  const s = contenido('Entorno externo', '06', 'ANÁLISIS EXTERNO · PEST (03) · FRANCÉS', '20 AMENAZAS', 'contra 13 oportunidades.',
    'El resultado más claro del PEST es el conteo: 20 amenazas contra 13 oportunidades. El puntaje global lo confirma, 2,82 hoy y 2,99 a futuro, bajo el neutro de 3, pero subestima el desbalance porque la mayoría de los demás factores son neutros. ' +
    'Las oportunidades se concentran en lo tecnológico (7 de 13): ahorro documentado por ICCT y SEG, Francia legalizó la reconversión en 2020 y los componentes están estandarizados. ' +
    'Las amenazas decisivas son la regulatoria (borrador de 2021 sin vía para la hibridación) y la capacidad de pago del cliente. Lo económico es el sector peor evaluado: 2,38 hoy.');
  const lw = 7.3;
  mono(s, 'FACTORES POR SECTOR · OPORTUNIDAD · NEUTRO · AMENAZA', { x: M, y: 2.55, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Oportunidades', labels: ['Político-jurídico', 'Económico', 'Sociocultural', 'Tecnológico'], values: [2, 2, 2, 7] },
    { name: 'Neutros', labels: ['Político-jurídico', 'Económico', 'Sociocultural', 'Tecnológico'], values: [3, 6, 7, 2] },
    { name: 'Amenazas', labels: ['Político-jurídico', 'Económico', 'Sociocultural', 'Tecnológico'], values: [4, 8, 4, 4] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: 2.85, w: lw + 0.1, h: 3.85, barDir: 'bar', barGrouping: 'stacked', barGapWidthPct: 55,
    chartColors: [HEX.accent2, HEX.dk2, HEX.accent4], catAxisOrientation: 'maxMin',
    showValue: true, dataLabelPosition: 'ctr', dataLabelColor: HEX.lt1, dataLabelFontBold: true, dataLabelFontSize: 11,
    valAxisHidden: true, valGridLine: { style: 'none' }, catAxisLabelFontSize: 11, catAxisLabelColor: HEX.dk1,
    showLegend: true, legendPos: 't', showTitle: false, objectName: 'Gráfico PEST por sector',
  }));
  // puntajes
  const cx = M + lw + 0.5, cw = R - cx, cy = 2.55;
  mono(s, 'PUNTAJE · 1 A 5 · 3 = NEUTRO', { x: cx, y: cy, w: cw - 1.6, h: 0.24, fontSize: 9, color: C.text1 });
  mono(s, 'HOY', { x: R - 1.55, y: cy, w: 0.7, h: 0.24, fontSize: 8.5, align: 'right' });
  mono(s, 'FUTURO', { x: R - 0.8, y: cy, w: 0.8, h: 0.24, fontSize: 8.5, align: 'right' });
  const p = [['Político-jurídico', '2,67', '2,78'], ['Económico', '2,38', '2,81'], ['Sociocultural', '3,00', '3,00'], ['Tecnológico', '3,23', '3,38']];
  p.forEach(([k, a, f], i) => {
    const y = cy + 0.32 + i * 0.47;
    regla(s, y, cx, cw);
    T(s, k, { x: cx, y, w: cw - 1.6, h: 0.47, valign: 'middle', fontSize: 13.5 });
    T(s, a, { x: R - 1.55, y, w: 0.7, h: 0.47, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 17, color: Number(a.replace(',', '.')) < 3 ? C.accent4 : C.text1 });
    T(s, f, { x: R - 0.8, y, w: 0.8, h: 0.47, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 17, color: C.text2 });
  });
  const gy = cy + 0.32 + 4 * 0.47;
  linea(s, cx, gy, cw, 0, C.accent1, 1);
  T(s, 'Global', { x: cx, y: gy, w: cw - 1.6, h: 0.55, valign: 'middle', fontSize: 15, bold: true });
  T(s, '2,82', { x: R - 1.55, y: gy, w: 0.7, h: 0.55, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 22, color: C.accent1 });
  T(s, '2,99', { x: R - 0.8, y: gy, w: 0.8, h: 0.55, valign: 'middle', align: 'right', fontFace: F_CON, bold: true, fontSize: 22, color: C.text2 });
  T(s, 'Las oportunidades se concentran en lo tecnológico; las amenazas decisivas son la regulatoria y la capacidad de pago del cliente.', { x: cx, y: gy + 0.75, w: cw, h: 1.0, fontSize: 13, color: C.text2 });
}

// =====================================================================
// 12 · 06 MATRIZ IMPACTO-INCERTIDUMBRE
// =====================================================================
{
  const s = contenido('Entorno externo', '06', 'ANÁLISIS EXTERNO · IMPACTO E INCERTIDUMBRE', 'CINCO FACTORES CRÍTICOS,', 'todos inciertos.',
    'El instrumento 03 clasifica los factores por impacto comercial e incertidumbre. Según Francés, cada cuadrante pide una herramienta distinta: escenarios para los factores críticos, análisis proyectivo para las tendencias y análisis de eventos para lo que se monitorea. ' +
    'Los cinco factores críticos requieren escenarios alternos: el reglamento, el reconocimiento de aseguradoras y plantas, el precio de la bencina, el tipo de cambio y el ahorro real. ' +
    'Tres de ellos (reglamento, aseguradoras y plantas, y ahorro real) dependen de terceros o de una medición que aún no existe.');
  const gx = M + 0.8, gw = R - gx, gy = 2.5, gap = 0.18;
  const qw = (gw - gap) / 2, qh = 1.92;
  const q = [
    [0, 0, 'Monitorear', 'ANÁLISIS DE EVENTOS', ['Recuperación del PIB 2027', 'Ley N° 21.553 (registro de conductores)', 'TPM y costo del crédito']],
    [1, 0, 'Factores críticos', 'ESCENARIOS ALTERNOS', ['Reglamento de la Ley N° 21.793', 'Reconocimiento de aseguradoras y plantas', 'Precio de la bencina (volátil, MEPCO)', 'Tipo de cambio (kit 100% importado)', 'Ahorro real, sin medición propia']],
    [0, 1, 'Seguimiento menor', 'BAJA PRIORIDAD', ['Envejecimiento de la población', 'Sindicalización baja', 'Libre competencia (DL 211)', 'Jornada de 42 y 40 horas', 'Conciencia ambiental del consumidor']],
    [1, 1, 'Tendencias a planificar', 'ANÁLISIS PROYECTIVO', ['Parque que envejece y se conserva', 'Componentes estandarizados', 'Sustitutos: seguir con el auto o híbrido', 'Metas REP para baterías']],
  ];
  q.forEach(([c, r, t, sub, items]) => {
    const x = gx + c * (qw + gap), y = gy + r * (qh + gap), hot = c === 1 && r === 0;
    caja(s, x, y, qw, qh, hot ? { fill: { color: '0B1A22' }, line: { color: C.accent1, width: 1.25 } } : {});
    if (hot) visor(s, x, y, qw, qh);
    T(s, t, { x: x + 0.25, y: y + 0.14, w: qw - 3.0, h: 0.34, valign: 'middle', fontSize: 16, bold: true, color: hot ? C.accent1 : C.text1 });
    mono(s, sub, { x: x + qw - 2.75, y: y + 0.14, w: 2.5, h: 0.34, valign: 'middle', align: 'right', fontSize: 8, color: hot ? C.accent1 : C.text2 });
    items.forEach((it, k) => {
      const ix = x + 0.25, iy = y + 0.56 + k * 0.25;
      s.addShape(S.rect, { x: ix, y: iy + 0.095, w: 0.06, h: 0.06, fill: { color: hot ? C.accent1 : C.text2 }, line: { type: 'none' } });
      T(s, it, { x: ix + 0.18, y: iy, w: qw - 0.7, h: 0.25, valign: 'middle', fontSize: 12.5, color: hot ? C.text1 : C.text2 });
    });
  });
  // ejes
  mono(s, 'ALTA', { x: M + 0.2, y: gy + qh / 2 - 0.12, w: 0.55, h: 0.24, fontSize: 8, align: 'center' });
  mono(s, 'BAJA', { x: M + 0.2, y: gy + qh + gap + qh / 2 - 0.12, w: 0.55, h: 0.24, fontSize: 8, align: 'center' });
  T(s, 'INCERTIDUMBRE', { x: 0.62 - 1.8, y: gy + qh + gap / 2 - 0.13, w: 3.6, h: 0.26, rotate: 270, fontFace: F_MONO, fontSize: 8.5, color: C.text1, charSpacing: 2, align: 'center' });
  const ay = gy + 2 * qh + gap + 0.06;
  mono(s, 'BAJO', { x: gx, y: ay, w: qw, h: 0.22, fontSize: 8, align: 'center' });
  mono(s, 'ALTO', { x: gx + qw + gap, y: ay, w: qw, h: 0.22, fontSize: 8, align: 'center' });
  mono(s, 'IMPACTO COMERCIAL', { x: gx, y: ay + 0.2, w: gw, h: 0.22, fontSize: 8.5, align: 'center', color: C.text1, charSpacing: 2 });
}

// =====================================================================
// 13 · 06 ESCENARIOS REGULATORIOS
// =====================================================================
{
  const s = contenido('Entorno externo', '06', 'ANÁLISIS EXTERNO · ESCENARIOS REGULATORIOS', 'LA VÍA LEGAL DEPENDE', 'de la autoridad.',
    'El factor crítico de mayor impacto es el reglamento. Los escenarios salen de dos preguntas abiertas: si la hibridación aditiva cabe en la definición de transformación y si se mantiene la exclusión de vehículos con sistemas de seguridad. ' +
    'Con el borrador de 2021 como referencia, Lumine está en la rama «No» del primer nodo, que lleva a E3 o E4. Solo E1 convierte la barrera regulatoria en protección para el primero que homologa. ' +
    'Ninguna decisión comercial mueve el negocio de una rama a otra: lo hace la respuesta escrita de la autoridad.');
  const nodo = (x, y, w, h, text, hot) => {
    caja(s, x, y, w, h, { fill: { color: hot ? '0B1A22' : C.background2 }, line: { color: hot ? C.accent1 : C.accent5, width: hot ? 1.25 : 0.75 } });
    T(s, text, { x: x + 0.2, y, w: w - 0.4, h, fontSize: 14, align: 'center', valign: 'middle' });
  };
  const fin = (x, y, w, h, k, t, d, col, hot) => {
    caja(s, x, y, w, h, { line: { color: hot ? col : C.accent5, width: hot ? 1 : 0.75 } });
    s.addShape(S.rect, { x: x + 0.2, y: y + 0.2, w: 0.1, h: 0.1, fill: { color: col }, line: { type: 'none' } });
    mono(s, k, { x: x + 0.38, y: y + 0.12, w: 0.6, h: 0.26, valign: 'middle', fontSize: 9, color: col });
    T(s, t, { x: x + 0.85, y: y + 0.1, w: w - 1.0, h: 0.3, fontSize: 14.5, bold: true });
    T(s, d, { x: x + 0.38, y: y + 0.45, w: w - 0.55, h: 0.35, fontSize: 12, color: C.text2 });
  };
  const ex = 8.95, ew = R - ex, eh = 0.86;
  const E = [[2.55, 'E1', 'Vía legal amplia', 'Protege al primero que homologa', C.accent2, false],
             [3.51, 'E2', 'Vía legal acotada', 'Solo parque sin ABS ni airbag', C.accent3, false],
             [4.77, 'E3', 'Vía alternativa', 'Alteración de características', C.text2, true],
             [5.73, 'E4', 'Sin vía legal', 'El negocio no opera', C.accent4, true]];
  E.forEach(([y, k, t, d, col, hot]) => fin(ex, y, ew, eh, k, t, d, col, hot));
  const bx = 4.55, bw = 3.4, bh = 1.1;
  const yB = (2.55 + 3.51 + eh) / 2 - bh / 2, yC = (4.77 + 5.73 + eh) / 2 - bh / 2;
  nodo(bx, yB, bw, bh, '¿Se mantiene la exclusión de vehículos con ABS, airbag o estabilidad?', false);
  nodo(bx, yC, bw, bh, '¿Procede la inscripción general de alteración de características?', true);
  const aw = 3.25, ah = 1.25, yA = (yB + bh / 2 + yC + bh / 2) / 2 - ah / 2;
  nodo(M, yA, aw, ah, '¿La transformación incluye una intervención que conserva el motor?', true);
  // conectores en codo
  const codo = (x1, y1, xm, y2, x2, col, wd) => {
    linea(s, x1, y1, xm - x1, 0, col, wd);
    linea(s, xm, Math.min(y1, y2), 0, Math.abs(y2 - y1), col, wd);
    linea(s, xm, y2, x2 - xm, 0, col, wd);
  };
  const aMid = yA + ah / 2, bMid = yB + bh / 2, cMid = yC + bh / 2, xm1 = (M + aw + bx) / 2;
  codo(M + aw, aMid, xm1, bMid, bx, C.accent5, 1.25);
  codo(M + aw, aMid, xm1, cMid, bx, C.accent1, 2.25);
  mono(s, 'SÍ', { x: xm1 + 0.08, y: bMid + 0.08, w: 0.4, h: 0.22, fontSize: 8.5 });
  mono(s, 'NO', { x: xm1 + 0.08, y: cMid - 0.32, w: 0.4, h: 0.22, fontSize: 8.5, color: C.accent1 });
  const xm2 = (bx + bw + ex) / 2;
  [[bMid, 2.55 + eh / 2, 'NO'], [bMid, 3.51 + eh / 2, 'SÍ'], [cMid, 4.77 + eh / 2, 'SÍ'], [cMid, 5.73 + eh / 2, 'NO']].forEach(([y1, y2, l], i) => {
    const hot = i >= 2;
    codo(bx + bw, y1, xm2, y2, ex, hot ? C.accent1 : C.accent5, hot ? 1.75 : 1.25);
    mono(s, l, { x: xm2 + 0.08, y: y2 < y1 ? y2 + 0.04 : y2 - 0.27, w: 0.4, h: 0.22, fontSize: 8.5, color: hot ? C.accent1 : C.text2 });
  });
  mono(s, 'SITUACIÓN VIGENTE (02 Y 03)', { x: M, y: yA + ah + 0.25, w: aw, h: 0.22, fontSize: 8.5, color: C.accent1 });
  T(s, 'Rama «No» del primer nodo: E3 o E4. Solo E1 convierte la barrera en protección.', { x: M, y: yA + ah + 0.52, w: aw, h: 0.85, fontSize: 12.5, color: C.text2 });
}

// =====================================================================
// 14 · 07 CINCO FUERZAS
// =====================================================================
{
  const s = contenido('Entorno externo', '07', 'CINCO FUERZAS COMPETITIVAS · PORTER (02)', 'LA FUERZA DOMINANTE:', 'no hacer nada.',
    'La industria es moderadamente poco atractiva: promedio ponderado de 3,49 en una escala donde 5 es la fuerza más intensa. ' +
    'La presión viene de los sustitutos (5,00), porque no hacer nada cuesta $0, y de los nuevos entrantes (3,75), porque una vez abierta la vía cualquiera con presupuesto puede homologar. La rivalidad (1,83) y los proveedores (2,67) juegan a favor. ' +
    'Sustitutos y clientes suman 55% de la ponderación y operan por la misma causa. Siguiendo a Porter, la causa de la sensibilidad al precio no es el precio sino la falta de liquidez, por eso el financiamiento en cuotas actúa sobre la causa. ' +
    'Implicancias: posicionarse en conductores de alto kilometraje, incidir en el reglamento y acumular homologaciones.');
  const lw = 7.6;
  mono(s, 'PROMEDIO POR FUERZA · 0 A 5 · PONDERACIÓN', { x: M, y: 2.55, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  s.addChart(pres.ChartType.bar, [
    { name: 'Intensidad', labels: ['Sustitutos · 30%', 'Nuevos entrantes · 20%', 'Proveedores · 15%', 'Clientes · 25%', 'Rivalidad · 10%'], values: [5.0, 3.75, 2.67, 2.64, 1.83] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: 2.85, w: lw + 0.1, h: 3.9, barDir: 'bar', barGapWidthPct: 45, catAxisOrientation: 'maxMin',
    chartColors: [HEX.accent1, HEX.dk2, HEX.dk2, HEX.dk2, HEX.dk2],
    valAxisMinVal: 0, valAxisMaxVal: 5.4, valAxisMajorUnit: 1, valAxisHidden: true, valGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.00', dataLabelFontSize: 12, dataLabelFontBold: true,
    catAxisLabelFontSize: 11, catAxisLabelColor: HEX.dk1, showLegend: false, showTitle: false, objectName: 'Gráfico cinco fuerzas',
  }));
  const cx = M + lw + 0.5, cw = R - cx, cy = 2.55, ch = 4.2;
  caja(s, cx, cy, cw, ch);
  visor(s, cx, cy, cw, ch);
  mono(s, 'PROMEDIO PONDERADO', { x: cx + 0.25, y: cy + 0.2, w: cw - 0.5, h: 0.24, fontSize: 9, color: C.accent1 });
  numero(s, '3,49', { x: cx + 0.25, y: cy + 0.35, w: cw - 0.5, h: 1.25, fontSize: 92, color: C.accent1 });
  mono(s, '5 = FUERZA MÁS INTENSA', { x: cx + 0.25, y: cy + 1.62, w: cw - 0.5, h: 0.22, fontSize: 8 });
  T(s, 'Industria moderadamente poco atractiva.', { x: cx + 0.25, y: cy + 1.92, w: cw - 0.5, h: 0.32, fontSize: 14, bold: true });
  regla(s, cy + 2.4, cx + 0.25, cw - 0.5);
  T(s, [
    { text: 'Sustitutos y clientes suman 55% ', options: { bold: true } },
    { text: 'y operan por la misma causa: el cliente puede quedarse con su auto a costo $0. Las cuotas atacan la causa, la falta de liquidez.', options: { color: C.text2 } },
  ], { x: cx + 0.25, y: cy + 2.55, w: cw - 0.5, h: 1.5, fontSize: 13 });
}

// =====================================================================
// 15 · 08 FACTORES CRÍTICOS DE ÉXITO
// =====================================================================
{
  pres.addSection({ title: 'Entorno interno' });
  const s = contenido('Entorno interno', '08', 'ANÁLISIS INTERNO · FACTORES CRÍTICOS DE ÉXITO · FRANCÉS', 'FORTALEZA DE DISEÑO,', 'no de ejecución.',
    'La fortaleza interna de Lumine es de diseño, no de ejecución: la arquitectura, el proceso y la planificación están bien definidos, pero ninguno se ha probado en un vehículo real. ' +
    'De los seis factores críticos de éxito, cuatro están en nivel equilibrado o débil. Los dos que alcanzan fortaleza leve, integración y estandarización, son de diseño y no se han probado. ' +
    'Los dos factores que funcionan como condiciones de entrada, la gestión regulatoria y el financiamiento, están entre los más débiles. La capacidad medular que Lumine aspira a hacer extraordinariamente bien es la integración y calibración por marca y modelo.');
  const y0 = 2.55;
  const c = { f: [M, 4.35], h: [M + 4.45, 1.55], r: [M + 6.1, 1.55], e: [M + 7.75, CW - 7.75] };
  mono(s, 'FACTOR CRÍTICO · LÍNEA DEL 06', { x: c.f[0], y: y0, w: c.f[1], h: 0.24, fontSize: 8.5 });
  mono(s, 'HABILIDAD', { x: c.h[0], y: y0, w: c.h[1], h: 0.24, fontSize: 8.5 });
  mono(s, 'RIESGO', { x: c.r[0], y: y0, w: c.r[1], h: 0.24, fontSize: 8.5 });
  mono(s, 'ESTADO', { x: c.e[0], y: y0, w: c.e[1], h: 0.24, fontSize: 8.5 });
  const filas = [
    ['Gestión regulatoria e institucional', 'INFRAESTRUCTURA · LIDERAZGO', 2, 2, 'Sin interlocución formal con la autoridad', true],
    ['Financiamiento en el punto de venta', 'FINANZAS · COMUNIDAD FINANCIERA', 3, 2, 'Sin convenio', true],
    ['Ingeniería de integración y calibración', 'FABRICACIÓN · INTEGRACIÓN', 4, 2, 'Diseñada; riesgo de incompatibilidad con la electrónica original', false],
    ['Talento certificado en alta tensión', 'RR. HH. · SELECCIÓN Y COLOCACIÓN', 2, 2, 'Perfil escaso; sin esquema de retención', false],
    ['Logística de insumos críticos', 'ADQUISICIONES · MATERIALES', 3, 2, 'Protocolo definido; Clase 9 con plazos largos', false],
    ['Estandarización y tiempo de taller', 'FABRICACIÓN · TECNOLOGÍAS DE PROCESO', 4, 3, 'Cinco etapas definidas; no probadas', false],
  ];
  const rh = 0.6;
  filas.forEach(([f, l, h, r, e, entrada], i) => {
    const y = y0 + 0.32 + i * rh;
    regla(s, y);
    T(s, f, { x: c.f[0], y: y + 0.07, w: c.f[1], h: 0.28, fontSize: 14, bold: true });
    mono(s, l, { x: c.f[0], y: y + 0.36, w: c.f[1], h: 0.2, fontSize: 7.5 });
    medidor(s, c.h[0], y + rh / 2 - 0.075, h);
    T(s, String(h), { x: c.h[0] + 1.05, y, w: 0.4, h: rh, valign: 'middle', fontFace: F_CON, bold: true, fontSize: 18, color: h >= 4 ? C.accent1 : h === 3 ? C.text2 : C.accent4 });
    medidor(s, c.r[0], y + rh / 2 - 0.075, r);
    T(s, String(r), { x: c.r[0] + 1.05, y, w: 0.4, h: rh, valign: 'middle', fontFace: F_CON, bold: true, fontSize: 18, color: r >= 4 ? C.accent1 : r === 3 ? C.text2 : C.accent4 });
    T(s, e, { x: c.e[0], y, w: c.e[1] - (entrada ? 2.05 : 0), h: rh, valign: 'middle', fontSize: 12, color: C.text2 });
    if (entrada) chip(s, 'CONDICIÓN DE ENTRADA', R - 1.95, y + rh / 2 - 0.13, 1.95, C.accent3, { h: 0.26, size: 7.5 });
  });
  regla(s, y0 + 0.32 + filas.length * rh);
  mono(s, 'ESCALA 1 (GRAN DEBILIDAD) A 5 (GRAN FORTALEZA) · EN RIESGO, UN NÚMERO BAJO ES RIESGO ALTO', { x: M, y: y0 + 0.4 + filas.length * rh, w: CW, h: 0.22, fontSize: 7.5 });
}

// =====================================================================
// 16 · 08 7S DE MCKINSEY
// =====================================================================
{
  const s = contenido('Entorno interno', '08', 'ANÁLISIS INTERNO · 7S DE MCKINSEY', 'LAS S DURAS ESTÁN DISEÑADAS;', 'las blandas, débiles.',
    'Las 7S muestran un patrón claro. Las S duras, estrategia y sistemas, están diseñadas: hay misión, visión, ocho objetivos, un CMI y un proceso de taller de cinco etapas, aunque sin operar y sin línea base. ' +
    'Las S blandas que sostienen la ejecución son las más débiles: un estilo de gestión concentrado en fundadores sin trayectoria en la industria, un perfil técnico escaso (mecánica más alta tensión con licencia SEC) y ningún esquema para retener a los técnicos. ' +
    'Los puntajes vienen de las líneas equivalentes del instrumento 06 (habilidad / riesgo).');
  // diagrama: valores compartidos al centro, seis S alrededor
  const cxD = M + 2.95, cyD = 4.62, rad = 1.68, d = 1.18;
  const S7 = [
    ['Estrategia', '4 / 2', 4], ['Estructura', '3 / 3', 3], ['Sistemas', '3 / 3', 3],
    ['Personal', '2 / 2', 2], ['Capacidades', '2 / 2', 2], ['Estilo', '2 / 2', 2],
  ];
  const pts = S7.map((_, i) => { const a = (-90 + i * 60) * Math.PI / 180; return [cxD + rad * Math.cos(a), cyD + rad * Math.sin(a)]; });
  pts.forEach(([x, y]) => {
    const lx = Math.min(x, cxD), ly = Math.min(y, cyD), lw = Math.abs(x - cxD), lh = Math.abs(y - cyD);
    linea(s, lx, ly, lw, lh, C.accent5, 1, { flipV: (x < cxD) !== (y < cyD) });
  });
  for (let i = 0; i < 6; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 6];
    linea(s, Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1), C.accent5, 1, { flipV: (x2 < x1) !== (y2 < y1) });
  }
  const circ = (x, y, nombre, sc, v, dd) => {
    const fill = v >= 4 ? C.accent1 : C.accent6, ln = v >= 4 ? C.accent1 : v === 3 ? C.text2 : C.accent4;
    s.addShape(S.ellipse, { x: x - dd / 2, y: y - dd / 2, w: dd, h: dd, fill: { color: fill }, line: { color: ln, width: 1.25 } });
    T(s, nombre, { x: x - dd / 2, y: y - 0.25, w: dd, h: 0.28, align: 'center', valign: 'middle', fontSize: 11.5, bold: true, color: v >= 4 ? C.background1 : C.text1, fit: 'shrink' });
    T(s, sc, { x: x - dd / 2, y: y + 0.04, w: dd, h: 0.26, align: 'center', valign: 'middle', fontFace: F_MONO, fontSize: 10, color: v >= 4 ? C.background1 : v === 3 ? C.text2 : C.accent4 });
  };
  S7.forEach(([n, sc, v], i) => circ(pts[i][0], pts[i][1], n, sc, v, d));
  circ(cxD, cyD, 'Valores', '3 / 3', 3, 1.3);
  // lista
  const lx = M + 6.25, lw = R - lx;
  const grupos = [
    ['S DURAS', [['Estrategia', 'Plan explícito; sin respuesta a desenlaces adversos', '4 / 2'], ['Estructura', 'SpA liviana; sin roles regulatorios ni organigrama', '3 / 3'], ['Sistemas', 'CMI y proceso de taller diseñados, sin línea base', '3 / 3']]],
    ['S BLANDAS', [['Estilo', 'Fundadores sin trayectoria en el rubro', '2 / 2'], ['Capacidades', 'Técnico escaso: mecánica y alta tensión SEC', '2 / 2'], ['Personal', 'Sin incentivos para retener técnicos', '2 / 2'], ['Valores', 'Misión, visión y 8 valores; cultura en formación', '3 / 3']]],
  ];
  let y = 2.55;
  grupos.forEach(([g, filas], gi) => {
    mono(s, g, { x: lx, y, w: 3, h: 0.24, fontSize: 8.5, color: gi ? C.accent4 : C.accent1 });
    mono(s, gi ? '' : 'HAB. / RIESGO', { x: R - 1.6, y, w: 1.6, h: 0.24, fontSize: 7.5, align: 'right' });
    y += 0.3;
    filas.forEach(([n, dsc, sc]) => {
      regla(s, y, lx, lw);
      T(s, n, { x: lx, y, w: 1.45, h: 0.47, valign: 'middle', fontSize: 13, bold: true });
      T(s, dsc, { x: lx + 1.45, y, w: lw - 2.1, h: 0.47, valign: 'middle', fontSize: 12, color: C.text2 });
      mono(s, sc, { x: R - 0.65, y, w: 0.65, h: 0.47, valign: 'middle', align: 'right', fontSize: 10, color: sc.startsWith('2') ? C.accent4 : sc.startsWith('4') ? C.accent1 : C.text2 });
      y += 0.47;
    });
    regla(s, y, lx, lw);
    y += 0.2;
  });
}

// =====================================================================
// 17 · 09 COMPETENCIAS CENTRALES (VRIO)
// =====================================================================
{
  const s = contenido('Entorno interno', '09', 'RECURSOS Y COMPETENCIAS CENTRALES · HITT (05)', 'UNA SOLA COMPETENCIA', 'central.',
    'De 15 recursos y capacidades evaluados con los cuatro criterios de Hitt, solo dos cumplen todos: la biblioteca de calibraciones (recurso) y la ingeniería de integración y calibración (capacidad). Son dos expresiones de la misma competencia central. ' +
    'Seis dan ventaja temporal, como la homologación, la autorización del taller y los técnicos con licencia SEC, y siete son igualdad competitiva o condiciones de entrada. No hay desventajas. ' +
    'La formación interna cumple tres criterios y se clasifica como temporal porque concentra el conocimiento en pocas personas. Las dos ventajas sostenibles son potenciales: la biblioteca hoy no tiene contenido y su sostenibilidad depende de protegerla como secreto empresarial.');
  const stats = [['2', 'SOSTENIBLES', C.accent1], ['6', 'TEMPORALES', C.text1], ['7', 'IGUALDAD', C.text2], ['0', 'DESVENTAJA', C.text2]];
  const sw = 1.85;
  stats.forEach(([n, k, col], i) => {
    const x = M + (i % 2) * (sw + 0.2), y = 2.55 + Math.floor(i / 2) * 1.32;
    regla(s, y, x, sw);
    numero(s, n, { x, y: y + 0.08, w: sw, h: 0.9, fontSize: 64, valign: 'top', color: col });
    mono(s, k, { x, y: y + 0.98, w: sw, h: 0.22, fontSize: 8.5, color: i === 0 ? C.accent1 : C.text2 });
  });
  T(s, [
    { text: 'Conocimiento de calibración por marca y modelo. ', options: { bold: true } },
    { text: 'Sostenible solo si se protege como secreto empresarial.', options: { color: C.text2 } },
  ], { x: M, y: 5.35, w: 2 * sw + 0.2, h: 1.3, fontSize: 13.5 });
  // tabla VRIO
  const tx = M + 4.45, tw = R - tx, y0 = 2.55;
  const cV = tx + tw - 3.15;
  mono(s, 'RECURSO O CAPACIDAD', { x: tx, y: y0, w: 4, h: 0.24, fontSize: 8.5 });
  ['V', 'R', 'C', 'I'].forEach((k, j) => mono(s, k, { x: cV + j * 0.36, y: y0, w: 0.3, h: 0.24, fontSize: 8.5, align: 'center', color: C.text1 }));
  mono(s, 'CONSECUENCIA', { x: R - 1.55, y: y0, w: 1.55, h: 0.24, fontSize: 8.5, align: 'right' });
  const filas = [
    ['Biblioteca de calibraciones', 'RECURSO', 4, 'SOSTENIBLE'],
    ['Ingeniería de integración y calibración', 'CAPACIDAD', 4, 'SOSTENIBLE'],
    ['Formación interna en proceso y calibración', 'CAPACIDAD', 3, 'TEMPORAL'],
    ['Homologación por par modelo-kit', 'RECURSO', 2, 'TEMPORAL'],
    ['Autorización del taller', 'RECURSO', 2, 'TEMPORAL'],
    ['Técnicos con licencia SEC', 'RECURSO', 2, 'TEMPORAL'],
    ['Gestión regulatoria e institucional', 'CAPACIDAD', 2, 'TEMPORAL'],
    ['Diagnóstico previo y posventa', 'CAPACIDAD', 2, 'TEMPORAL'],
    ['Taller, kit, convenio financiero y 4 más', '7 ÍTEMS', 1, 'IGUALDAD'],
  ];
  const rh = 0.43;
  filas.forEach(([n, t, v, cons], i) => {
    const y = y0 + 0.3 + i * rh, top = v === 4;
    regla(s, y, tx, tw);
    T(s, n, { x: tx, y, w: cV - tx - 1.15, h: rh, valign: 'middle', fontSize: 12.5, bold: top, color: top ? C.text1 : C.text1 });
    mono(s, t, { x: cV - 1.12, y, w: 1.0, h: rh, valign: 'middle', fontSize: 7, align: 'right' });
    for (let j = 0; j < 4; j++) s.addShape(S.rect, { x: cV + j * 0.36 + 0.08, y: y + rh / 2 - 0.07, w: 0.14, h: 0.14, fill: { color: j < v ? (top ? C.accent1 : C.text2) : C.background1 }, line: { color: j < v ? (top ? C.accent1 : C.text2) : C.accent5, width: 0.75 } });
    mono(s, cons, { x: R - 1.55, y, w: 1.55, h: rh, valign: 'middle', align: 'right', fontSize: 8.5, color: top ? C.accent1 : cons === 'TEMPORAL' ? C.text1 : C.text2 });
  });
  regla(s, y0 + 0.3 + filas.length * rh, tx, tw);
  mono(s, 'V VALIOSO · R RARO · C CARO DE IMITAR · I ÚNICO E INIMITABLE', { x: tx, y: y0 + 0.38 + filas.length * rh, w: tw, h: 0.22, fontSize: 7.5 });
}

// =====================================================================
// 18 · 09 CADENA DE VALOR
// =====================================================================
{
  const s = contenido('Entorno interno', '09', 'CADENA DE VALOR · PORTER (06)', 'EL COSTO Y LA EXCLUSIVIDAD', 'no coinciden.',
    'Las directrices del costo y la fuente de exclusividad no coinciden. El costo se acumula en la logística de entrada (kit importado, mercancía peligrosa Clase 9 y dólar) y en las horas de operaciones; la exclusividad nace en el desarrollo tecnológico, la calibración, y se entrega en operaciones. ' +
    'Tres eslabones son decisivos: infraestructura, porque sin autorización no opera ningún eslabón; desarrollo tecnológico, única fuente de exclusividad; y operaciones, el cuello de botella donde convergen la homologación por modelo, los plazos de internación y la escasez de técnicos. ' +
    'Contabilidad, aduana, transporte de mercancía peligrosa y remuneraciones se pueden externalizar sin perder diferenciación.');
  const dx = M, dw = 8.25, mg = 0.55; // margen a la derecha
  const apoyo = [
    ['INFRAESTRUCTURA DE LA EMPRESA', 'CONDICIÓN DE ENTRADA', C.accent3],
    ['GESTIÓN DE RECURSOS HUMANOS', '', null],
    ['DESARROLLO TECNOLÓGICO', 'ÚNICA FUENTE DE EXCLUSIVIDAD', C.accent1],
    ['ADQUISICIONES', '', null],
  ];
  const ah = 0.5, ag = 0.08, y0 = 2.55;
  apoyo.forEach(([t, k, col], i) => {
    const y = y0 + i * (ah + ag), hot = col === C.accent1;
    s.addShape(S.rect, { x: dx, y, w: dw - mg, h: ah, fill: { color: hot ? '0B1A22' : C.background2 }, line: { color: col || C.accent5, width: col ? 1.25 : 0.75 } });
    mono(s, t, { x: dx + 0.2, y, w: 4.2, h: ah, valign: 'middle', fontSize: 9, color: C.text1 });
    if (k) mono(s, k, { x: dx + dw - mg - 3.6, y, w: 3.4, h: ah, valign: 'middle', align: 'right', fontSize: 8, color: col });
  });
  const py = y0 + 4 * (ah + ag) + 0.06, ph = 1.62, pg = 0.08, pw = (dw - mg - 4 * pg) / 5;
  const prim = [
    ['Logística de entrada', 'DIRECTRIZ DE COSTO', C.accent3, 'Kit importado, Clase 9, dólar'],
    ['Operaciones', 'CUELLO DE BOTELLA', C.accent4, 'Aquí se entrega la exclusividad'],
    ['Logística de salida', '', null, ''],
    ['Marketing y ventas', '', null, ''],
    ['Servicio posventa', '', null, ''],
  ];
  prim.forEach(([t, k, col, d], i) => {
    const x = dx + i * (pw + pg);
    s.addShape(S.rect, { x, y: py, w: pw, h: ph, fill: { color: C.background2 }, line: { color: col || C.accent5, width: col ? 1.25 : 0.75 } });
    T(s, t, { x: x + 0.12, y: py + 0.14, w: pw - 0.24, h: 0.55, fontSize: 12.5, bold: true });
    if (k) {
      mono(s, k, { x: x + 0.12, y: py + 0.78, w: pw - 0.24, h: 0.4, fontSize: 7.5, color: col });
      T(s, d, { x: x + 0.12, y: py + 1.15, w: pw - 0.24, h: 0.55, fontSize: 10.5, color: C.text2 });
    }
  });
  // margen
  const mx = dx + dw - mg + 0.08, mh = py + ph - y0;
  s.addShape(S.rect, { x: mx, y: y0, w: mg - 0.08, h: mh, fill: { color: C.accent6 }, line: { color: C.accent5, width: 0.75 } });
  T(s, 'MARGEN', { x: mx - (mh - (mg - 0.08)) / 2, y: y0 + mh / 2 - (mg - 0.08) / 2, w: mh, h: mg - 0.08, rotate: 90, align: 'center', valign: 'middle', fontFace: F_MONO, fontSize: 9, color: C.text2, charSpacing: 3 });
  // lectura
  const cx = dx + dw + 0.45, cw = R - cx;
  const lect = [
    ['INFRAESTRUCTURA', 'Sin autorización no opera ningún eslabón.', C.accent3],
    ['DESARROLLO TECNOLÓGICO', 'La calibración es la única fuente de exclusividad.', C.accent1],
    ['OPERACIONES', 'Convergen homologación por modelo, internación y escasez de técnicos (06: 2/2).', C.accent4],
    ['EXTERNALIZABLE', 'Contabilidad, aduana, transporte peligroso y remuneraciones.', C.text2],
  ];
  lect.forEach(([k, v, col], i) => {
    const y = y0 + i * 1.05;
    regla(s, y, cx, cw);
    punto(s, cx, y + 0.16, col);
    mono(s, k, { x: cx + 0.17, y: y + 0.08, w: cw - 0.2, h: 0.24, fontSize: 8.5, color: C.text1 });
    T(s, v, { x: cx, y: y + 0.38, w: cw, h: 0.65, fontSize: 12.5, color: C.text2 });
  });
}

// =====================================================================
// 19 · 09 RANKING FRENTE A COMPETIDORES
// =====================================================================
{
  const s = contenido('Entorno interno', '09', 'CAPACIDADES FRENTE A COMPETIDORES (06)', 'BRECHA CON EL LÍDER:', '−1,29 y −1,43.',
    'Frente a los competidores, Lumine obtiene 3,00 en habilidades y 2,71 en factores de riesgo. El líder, armado con el máximo de cada área entre GLP, híbridos usados y eléctricos nuevos, llega a 4,29 y 4,14: la brecha es de −1,29 y −1,43. ' +
    'Las siete áreas salen debilidad por dos razones de diseño que el instrumento declara: se compara una empresa preoperativa con actores en operación, y el líder no es un competidor real. Los puntajes de competidores son estimaciones del equipo. ' +
    'Por eso el insumo correcto para el FODA son las fortalezas puntuales, las líneas con puntaje 4 o más, y no el promedio. Tecnología es el área más fuerte en habilidades (3,33) y, junto con Finanzas, la de mayor riesgo.');
  const lw = 7.9;
  mono(s, 'PROMEDIO POR COMPETIDOR · 1 A 5', { x: M, y: 2.55, w: lw, h: 0.24, fontSize: 9, color: C.text1 });
  const labels = ['GLP', 'Eléctricos nuevos', 'Reborn*', 'Movener*', 'Híbridos usados', 'Lumine', 'Líder'];
  s.addChart(pres.ChartType.bar, [
    { name: 'Habilidades', labels, values: [3.86, 3.86, 3.86, 3.71, 3.57, 3.00, 4.29] },
    { name: 'Factores de riesgo', labels, values: [4.00, 3.43, 3.71, 3.43, 3.43, 2.71, 4.14] },
  ], Object.assign({}, ejes, {
    x: M - 0.1, y: 2.85, w: lw + 0.1, h: 3.65, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60, barOverlapPct: -10,
    chartColors: [HEX.accent1, HEX.accent5],
    valAxisMinVal: 0, valAxisMaxVal: 5, valAxisMajorUnit: 1, valAxisLabelFormatCode: '0',
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.00', dataLabelFontSize: 9,
    catAxisLabelFontSize: 9.5, catAxisLabelColor: HEX.dk1, showLegend: true, legendPos: 't', showTitle: false, objectName: 'Gráfico ranking de competidores',
  }));
  mono(s, '* REFERENCIA: OPERAN FUERA DEL SEGMENTO LIVIANO', { x: M, y: 6.5, w: lw, h: 0.22, fontSize: 7.5 });
  const cx = M + lw + 0.45, cw = R - cx, cy = 2.55;
  mono(s, 'POR QUÉ TODO SALE DEBILIDAD', { x: cx, y: cy, w: cw, h: 0.24, fontSize: 9, color: C.accent1 });
  [['01', 'Se compara una empresa preoperativa con actores en operación.'], ['02', 'El líder se arma con el máximo de cada área, no es un competidor real.']].forEach(([n, t], i) => {
    const y = cy + 0.35 + i * 0.85;
    regla(s, y, cx, cw);
    mono(s, n, { x: cx, y: y + 0.12, w: 0.4, h: 0.24, fontSize: 9, color: C.accent1 });
    T(s, t, { x: cx + 0.45, y: y + 0.09, w: cw - 0.45, h: 0.7, fontSize: 13 });
  });
  const by = cy + 2.15, bh = 1.95;
  caja(s, cx, by, cw, bh);
  visor(s, cx, by, cw, bh);
  mono(s, 'INSUMO PARA EL FODA', { x: cx + 0.22, y: by + 0.18, w: cw - 0.44, h: 0.22, fontSize: 8.5, color: C.accent1 });
  T(s, [
    { text: 'Las fortalezas puntuales ', options: { bold: true } },
    { text: '(11 líneas con puntaje 4), no el promedio: tecnología, procesos, mercado, planificación y gestión del riesgo.', options: { color: C.text2 } },
  ], { x: cx + 0.22, y: by + 0.5, w: cw - 0.44, h: 1.35, fontSize: 13 });
}

// =====================================================================
// 20 · 10 FODA POR PERSPECTIVAS DEL CMI
// =====================================================================
{
  pres.addSection({ title: 'Síntesis' });
  const s = contenido('Síntesis', '10', 'FODA POR PERSPECTIVAS DEL CMI · KAPLAN Y NORTON', 'FORTALEZAS EN PROCESOS;', 'amenazas en clientes.',
    'Ordenado por las cuatro perspectivas del Cuadro de Mando Integral, el FODA muestra dónde está el problema: las fortalezas se concentran en procesos internos, es decir, en el diseño técnico. ' +
    'Las amenazas decisivas caen en la perspectiva de clientes (capacidad de pago, desempleo y la opción de no hacer nada a costo $0) y en la habilitación regulatoria. ' +
    'Las fortalezas provienen de las líneas del instrumento 06 con puntaje 4 o más; las oportunidades y amenazas, de la matriz PEST (03) y de los antecedentes de referencia.');
  const hx = M, hw = 1.75, g = 0.09, x0 = M + hw + g, cw = (R - x0 - 3 * g) / 4;
  const head = [['FORTALEZAS', C.accent1], ['DEBILIDADES', C.text1], ['OPORTUNIDADES', C.accent2], ['AMENAZAS', C.accent4]];
  const y0 = 2.5;
  head.forEach(([k, col], j) => {
    const x = x0 + j * (cw + g);
    s.addShape(S.rect, { x, y: y0 + 0.08, w: 0.09, h: 0.09, fill: { color: col }, line: { type: 'none' } });
    mono(s, k, { x: x + 0.17, y: y0, w: cw - 0.17, h: 0.24, fontSize: 8.5, color: col });
  });
  const filas = [
    ['Financiera', ['Riesgos identificados y protocolo de contención (06: 4); ingresos recurrentes', 'Patrimonio reducido; inventario en dólares sin cobertura cambiaria', 'LFP a US$81/kWh; cada litro ahorrado ahorra impuesto específico', 'Dólar cerca de $970 con kit 100% importado; IVA completo; REP; TPM 4,5%']],
    ['Clientes', ['Segmento definido y estrategia de producto única (06: 4)', 'Marca sin casos; validación con n = 3; sin precio; línea acotada', '3,5 usados por nuevo; transporte +9,7%; bencina a $1.541', 'Bajo ingreso disponible; desempleo 9,5%; no hacer nada a $0; aseguradoras']],
    ['Procesos internos', ['Arquitectura en eje trasero; proceso de cinco etapas, calidad e integración (06: 4)', 'Sin ensayo ni homologación; biblioteca vacía; operaciones como cuello de botella', 'Ahorro documentado (ICCT, SEG); Francia 2020; OBD para medir consumo', 'Borrador 2021 sin vía para la hibridación; homologación por par modelo-kit']],
    ['Aprendizaje y crecimiento', ['Planificación (06: 4); estrategia horizontal de la tecnología (4)', 'Técnicos escasos; sin retención; liderazgo sin trayectoria en el rubro', 'Formación incipiente en alta tensión (INACAP); ecosistema francés', 'Jornada de 42 y 40 horas; I+D de 0,41% del PIB']],
  ];
  const rh = 0.9, ry0 = y0 + 0.3;
  filas.forEach(([p, cells], i) => {
    const y = ry0 + i * (rh + g);
    s.addShape(S.rect, { x: hx, y, w: hw, h: rh, fill: { color: C.accent6 }, line: { color: C.accent5, width: 0.75 } });
    T(s, p, { x: hx + 0.15, y, w: hw - 0.3, h: rh, valign: 'middle', fontSize: 13, bold: true });
    cells.forEach((t, j) => {
      const x = x0 + j * (cw + g);
      const hot = (i === 2 && j === 0) || (i === 1 && j === 3);
      caja(s, x, y, cw, rh, hot ? { fill: { color: j === 0 ? '0B1A22' : '1F1012' }, line: { color: j === 0 ? C.accent1 : C.accent4, width: 1.25 } } : {});
      T(s, t, { x: x + 0.13, y: y + 0.08, w: cw - 0.26, h: rh - 0.16, fontSize: 11, color: hot ? C.text1 : C.text2, valign: 'middle' });
    });
  });
}

// =====================================================================
// 21 · 10 CRUCE ESTRATÉGICO
// =====================================================================
{
  const s = contenido('Síntesis', '10', 'FODA · CRUCE ESTRATÉGICO', 'DEL FODA', 'a las acciones.',
    'Los cruces son coherentes con los instrumentos. FO: homologar primero los modelos de mayor densidad en el segmento priorizado, aprovechando que nadie ofrece hoy la hibridación certificada. ' +
    'DO: consultar al 3CV y plantear al MTT el precedente del gas licuado mientras elabora el reglamento. FA: frente al híbrido usado y a no hacer nada, vender la cuota mensual contra el ahorro mensual, no la sostenibilidad. ' +
    'DA: cerrar convenios con aseguradoras, plantas de revisión técnica y una institución financiera antes de vender el primer kit. Los instrumentos agregan un quinto cruce DA: cobertura cambiaria y abastecimiento de largo plazo.');
  const cr = [
    ['FO', 'Fortalezas × oportunidades', 'Homologar primero los modelos de mayor densidad en el segmento priorizado: nadie ofrece hoy la hibridación certificada.'],
    ['DO', 'Debilidades × oportunidades', 'Consultar al 3CV y plantear al MTT, mientras elabora el reglamento, el precedente del gas licuado.'],
    ['FA', 'Fortalezas × amenazas', 'Frente al híbrido usado y a no hacer nada, vender la cuota mensual contra el ahorro mensual, no la sostenibilidad.'],
    ['DA', 'Debilidades × amenazas', 'Cerrar convenios con aseguradoras, plantas de revisión técnica y una institución financiera antes de vender el primer kit.'],
  ];
  const cw = (CW - 0.3) / 2, ch = 1.65;
  cr.forEach(([k, sub, t], i) => {
    const x = M + (i % 2) * (cw + 0.3), y = 2.55 + Math.floor(i / 2) * (ch + 0.25);
    caja(s, x, y, cw, ch);
    numero(s, k, { x: x + 0.25, y: y + 0.18, w: 1.2, h: 0.85, fontSize: 52, valign: 'top', color: C.accent1 });
    mono(s, sub.toUpperCase(), { x: x + 0.27, y: y + 1.12, w: 1.6, h: 0.4, fontSize: 7, charSpacing: 1 });
    T(s, t, { x: x + 1.95, y: y + 0.18, w: cw - 2.2, h: ch - 0.36, fontSize: 15, valign: 'middle' });
  });
  const by = 2.55 + 2 * ch + 0.25 + 0.2;
  regla(s, by);
  mono(s, 'QUINTO CRUCE · DA', { x: M, y: by + 0.12, w: 2.4, h: 0.24, fontSize: 9, color: C.accent3 });
  T(s, 'Contratar cobertura cambiaria y un acuerdo de abastecimiento de largo plazo: el dólar sube y cambiar de proveedor obliga a rehomologar.', { x: M + 2.4, y: by + 0.08, w: CW - 2.4, h: 0.55, fontSize: 13.5, color: C.text2 });
}

// =====================================================================
// 22 · 10 PROBLEMAS CLAVE
// =====================================================================
{
  const s = contenido('Síntesis', '10', 'PROBLEMAS CLAVE DE LA ESTRATEGIA', 'CINCO PROBLEMAS', 'que deciden el negocio.',
    'Son cinco problemas clave. Uno, la vía legal: sin un reglamento que reconozca la hibridación aditiva, no hay negocio. Dos, el reconocimiento de terceros: aseguradoras y plantas pueden bloquear la venta aun con reglamento favorable. ' +
    'Tres, la capacidad de pago: ingreso disponible bajo, desempleo de 9,5% y crédito caro; sin financiamiento no hay conversión. Cuatro, el ahorro no medido: el 20% en ciudad es una estimación no verificada en autos chilenos. ' +
    'Cinco, la exposición cambiaria: todo el costo variable está en dólares y sin cobertura.');
  const p = [
    ['01', 'VÍA LEGAL', 'Sin un reglamento que reconozca la hibridación aditiva, no hay negocio.'],
    ['02', 'TERCEROS', 'Aseguradoras y plantas de revisión técnica pueden bloquear la venta aun con reglamento favorable.'],
    ['03', 'CAPACIDAD DE PAGO', 'Ingreso disponible bajo, desempleo de 9,5% y crédito caro: sin financiamiento no hay conversión.'],
    ['04', 'AHORRO NO MEDIDO', 'El 20% en ciudad es una estimación de ingeniería, no verificada en autos chilenos.'],
    ['05', 'EXPOSICIÓN CAMBIARIA', 'Todo el costo variable está en dólares, sin cobertura.'],
  ];
  const cw = CW / 5, y0 = 2.75;
  linea(s, M, y0, CW, 0, C.accent1, 1.5);
  p.forEach(([n, t, d], i) => {
    const x = M + i * cw;
    if (i) linea(s, x, y0, 0, 3.75, C.accent5);
    mono(s, 'PROBLEMA', { x: x + 0.2, y: y0 + 0.18, w: 1.2, h: 0.22, fontSize: 8 });
    mono(s, (i + 1) + ' / 5', { x: x + cw - 1.0, y: y0 + 0.18, w: 0.8, h: 0.22, fontSize: 8, align: 'right' });
    numero(s, n, { x: x + 0.2, y: y0 + 0.45, w: cw - 0.4, h: 1.0, fontSize: 60, valign: 'top' });
    T(s, t, { x: x + 0.2, y: y0 + 1.55, w: cw - 0.35, h: 0.62, fontFace: F_TIT, fontSize: 13, valign: 'bottom', lineSpacingMultiple: 0.95 });
    T(s, d, { x: x + 0.2, y: y0 + 2.3, w: cw - 0.4, h: 1.4, fontSize: 13, color: C.text2 });
  });
}

// =====================================================================
// 23 · 11 DECLARACIÓN DE LA ESTRATEGIA
// =====================================================================
{
  pres.addSection({ title: 'Estrategia' });
  const s = contenido('Estrategia', '11', 'DECLARACIÓN DE LA ESTRATEGIA · OVA', 'DIFERENCIACIÓN', 'enfocada.',
    'Lumine compite con diferenciación enfocada. La diferenciación descansa en el servicio y no en el hardware; el enfoque, en un segmento definido por kilometraje y por el peso del combustible en el costo por kilómetro. ' +
    'Objetivo: ser hacia 2031 el taller de referencia en hibridación, como el primer taller autorizado del país; tiene plazo pero no una meta cuantitativa. Ventaja: la única alternativa que reduce el consumo sin reemplazar el vehículo, sin límite de antigüedad y con certificación; es potencial mientras la biblioteca no exista. ' +
    'Las renuncias son coherentes: no competir por precio contra el gas, no atender al conductor de bajo kilometraje y no ofrecer inmediatez. La tensión es que se diferencia ante un cliente muy sensible al precio; se resuelve solo si el enfoque se respeta.');
  T(s, '«Un servicio certificado que reduce el combustible del auto que el cliente ya tiene, para conductores de alto kilometraje, sostenido por un conocimiento de calibración que un competidor no puede comprar.»',
    { x: M, y: 2.45, w: CW, h: 1.2, fontFace: F_SER, italic: true, fontSize: 22, lineSpacingMultiple: 0.98 });
  const ova = [
    ['OBJETIVO', 'Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso, como primer taller autorizado del país.', 'SIN META CUANTITATIVA'],
    ['VENTAJA', 'Única alternativa que reduce el consumo sin reemplazar el vehículo, sin límite de antigüedad y con certificación.', 'POTENCIAL: BIBLIOTECA VACÍA'],
    ['ALCANCE', 'Tracción delantera y alto kilometraje; RM, un taller propio; integra diagnóstico a posventa; no vende el kit suelto.', 'ABS O AIRBAG SIN CUANTIFICAR'],
  ];
  const cw = (CW - 0.6) / 3, cy = 3.88, ch = 2.15;
  ova.forEach(([k, t, w], i) => {
    const x = M + i * (cw + 0.3);
    caja(s, x, cy, cw, ch);
    mono(s, k, { x: x + 0.22, y: cy + 0.18, w: cw - 0.44, h: 0.24, fontSize: 9, color: C.accent1 });
    T(s, t, { x: x + 0.22, y: cy + 0.5, w: cw - 0.44, h: 1.1, fontSize: 13.5 });
    chip(s, w, x + 0.22, cy + ch - 0.45, cw - 0.44, C.accent3, { h: 0.26, size: 8 });
  });
  const ry = 6.25;
  mono(s, 'RENUNCIAS', { x: M, y: ry, w: 1.6, h: 0.3, valign: 'middle', fontSize: 9, color: C.text1 });
  const ren = ['No competir por precio contra el gas', 'No atender bajo kilometraje', 'No ofrecer inmediatez'];
  const rw = (CW - 1.6) / 3;
  ren.forEach((t, i) => {
    const x = M + 1.6 + i * rw;
    s.addShape(S.rect, { x, y: ry + 0.11, w: 0.08, h: 0.08, fill: { color: C.accent4 }, line: { type: 'none' } });
    T(s, t, { x: x + 0.18, y: ry, w: rw - 0.25, h: 0.3, valign: 'middle', fontSize: 12.5, color: C.text2 });
  });
}

// =====================================================================
// 24 · 11 EJES ESTRATÉGICOS
// =====================================================================
{
  const s = contenido('Estrategia', '11', 'EJES ESTRATÉGICOS', 'TRES EJES,', 'ocho objetivos.',
    'Los ocho objetivos se agrupan en tres ejes. Habilitación formal (objetivos 1 a 3) ataca la vía legal y el reconocimiento de terceros y se mide en procesos internos y clientes. ' +
    'Acceso comercial (4 y 5) ataca la capacidad de pago del cliente y se mide en clientes y en la perspectiva financiera. Conocimiento y escala (6 a 8) ataca el ahorro no medido y la rotación técnica, en aprendizaje y crecimiento. ' +
    'Hay una brecha: ningún eje ni objetivo aborda la exposición cambiaria, que los instrumentos 03 y 06 identifican como amenaza. Debería incorporarse al eje 2 o al Plan Financiero.');
  const ejesE = [
    ['EJE 1', 'Habilitación formal', [['01', 'Autorización del taller'], ['02', 'Homologación progresiva y biblioteca'], ['03', 'Reconocimiento de aseguradoras y plantas']], 'Vía legal y terceros', 'Procesos internos y clientes'],
    ['EJE 2', 'Acceso comercial', [['04', 'Consolidar el segmento priorizado'], ['05', 'Financiamiento en el punto de venta']], 'Capacidad de pago del cliente', 'Clientes y financiera'],
    ['EJE 3', 'Conocimiento y escala', [['06', 'Demostrar el ahorro real'], ['07', 'Retener el conocimiento técnico'], ['08', 'Ampliar capacidad']], 'Ahorro no medido y rotación', 'Aprendizaje y crecimiento'],
  ];
  const cw = (CW - 0.6) / 3, cy = 2.5, ch = 3.42;
  ejesE.forEach(([k, t, obj, ataca, cmi], i) => {
    const x = M + i * (cw + 0.3);
    caja(s, x, cy, cw, ch);
    mono(s, k, { x: x + 0.22, y: cy + 0.18, w: 1, h: 0.24, fontSize: 9, color: C.accent1 });
    T(s, t, { x: x + 0.22, y: cy + 0.45, w: cw - 0.44, h: 0.36, fontSize: 17, bold: true });
    obj.forEach(([n, o], j) => {
      const y = cy + 0.95 + j * 0.53;
      tag(s, n, x + 0.22, y + 0.02, { w: 0.4, h: 0.25, size: 8.5 });
      T(s, o, { x: x + 0.75, y, w: cw - 0.95, h: 0.46, fontSize: 12.5 });
    });
    regla(s, cy + 2.62, x + 0.22, cw - 0.44);
    mono(s, 'ATACA', { x: x + 0.22, y: cy + 2.74, w: 1, h: 0.22, fontSize: 7.5, valign: 'middle' });
    T(s, ataca, { x: x + 0.95, y: cy + 2.7, w: cw - 1.15, h: 0.3, valign: 'middle', fontSize: 12, color: C.text2 });
    mono(s, 'CMI', { x: x + 0.22, y: cy + 3.06, w: 1, h: 0.22, fontSize: 7.5, valign: 'middle' });
    T(s, cmi, { x: x + 0.95, y: cy + 3.02, w: cw - 1.15, h: 0.3, valign: 'middle', fontSize: 12, color: C.text2 });
  });
  const by = 6.1, bh = 0.66;
  s.addShape(S.rect, { x: M, y: by, w: CW, h: bh, fill: { color: '1F1012' }, line: { color: C.accent4, width: 0.75, dashType: 'dash' } });
  mono(s, 'BRECHA DEL PLAN', { x: M + 0.22, y: by, w: 2.2, h: bh, valign: 'middle', fontSize: 9, color: C.accent4 });
  T(s, [
    { text: 'Ningún eje aborda la exposición cambiaria ', options: { bold: true } },
    { text: '(03: gran amenaza hoy). Debería incorporarse al eje 2 o al Plan Financiero.', options: { color: C.text2 } },
  ], { x: M + 2.4, y: by, w: CW - 2.6, h: bh, valign: 'middle', fontSize: 13.5 });
}

// =====================================================================
// 25 · CIERRE
// =====================================================================
{
  pres.addSection({ title: 'Cierre' });
  const s = pres.addSlide({ masterName: 'CIERRE', sectionTitle: 'Cierre' });
  mono(s, 'CONTROL DE GESTIÓN · ICMA901 · NRC 4118', { x: 6.2, y: 0.4, w: R - 6.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 9 });
  s.addText([
    { text: '11', options: { color: C.accent1, fontFace: F_MONO, fontSize: 10, charSpacing: 1.5 } },
    { text: '  —— CONCLUSIÓN', options: { color: C.text2, fontFace: F_MONO, fontSize: 10, charSpacing: 1.5 } },
  ], { x: M, y: 1.0, w: CW, h: 0.28, isTextBox: true, margin: 0, valign: 'middle' });
  s.addText([
    { text: 'LA PRIORIDAD NO ES COMPETIR CON OTROS TALLERES: ' },
    { text: 'es que el ahorro supere al precio frente a no hacer nada.', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 38 } },
  ], { placeholder: 'title' });
  linea(s, M, 3.72, CW, 0, C.accent5);
  mono(s, 'INTEGRANTES', { x: M, y: 3.86, w: 2, h: 0.24, fontSize: 8.5 });
  T(s, 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', { x: M, y: 4.12, w: 7.5, h: 0.36, fontSize: 16 });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 4, y: 4.12, w: 4, h: 0.36, valign: 'middle', align: 'right', fontSize: 11, color: C.accent1 });
  mono(s, '© 2026 LUMINE MOTORS · CONTROL DE GESTIÓN · TEORÍA · ICMA901 · SECCIÓN 500', { x: M, y: 6.98, w: CW, h: 0.24, valign: 'middle', fontSize: 8 });
  s.addNotes('Cierre: como concluye el instrumento de cinco fuerzas, la prioridad no es competir con otros talleres sino lograr que el ahorro supere al precio frente a la opción de no hacer nada. ' +
    'Eso depende de tres cosas que hoy no están: la vía legal (reglamento), el reconocimiento de terceros (aseguradoras y plantas) y la medición del ahorro real. Gracias; quedamos atentos a sus preguntas.');
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

(async () => {
  await pres.writeFile({ fileName: OUT });
  await aplicarTema(OUT, THEME);
  console.log('listo', OUT);
})();
