// Solemne 2 · Control de Gestión (ICMA901, UNAB) · Mapa estratégico y CMI de Lumine Motors
// Mismo sistema visual que las presentaciones de Control de Gestión y de la Fase 3: escenario negro, un solo acento
// celeste, titulares anchos en mayúsculas con acento en serif itálica, etiquetas mono y cifras condensadas.
//
// Reglas de esta presentación:
// - Lumine es preoperativa: ningún indicador tiene dato real. Se usa un solo sistema de estados:
//   SIN MEDIR (gris), HITO CRÍTICO PENDIENTE (rojo, solo cuando está comprobado que falta) y COMPLETADO (verde, con evidencia).
// - El ejemplo de EVA es del módulo 4 del curso («EJEMPLO DE CLASE · NO LUMINE») y el caso 8 de 10 es didáctico
//   («EJERCICIO HIPOTÉTICO»). Ambos rótulos quedan a la vista.
// - Escala de legibilidad de la Fase 3 (sala grande, alguien miope al fondo): titulares de 34 pt, cuerpo de 18 a 24 pt,
//   etiquetas de 12 pt o más, cifras de 30 a 48 pt. Si algo no cabe, se quita texto; nunca se achica la letra.
// - Sin animaciones ni transiciones.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {}; // una función por diapositiva; el orden lo pone guion.js
const OUT = process.argv[2] || 'Lumine_Solemne2_CMI.pptx';
const A = f => path.join(__dirname, 'assets', f);

// ---------- tema ----------
// Tipografía de la marca (juego A, el de la presentación anterior de Control de Gestión)
const [F_TIT, F_CON, F_BODY, F_MONO, F_SER] = ['Archivo SemiExpanded ExtraBold', 'Archivo Condensed', 'Figtree', 'IBM Plex Mono', 'Instrument Serif'];
const THEME = {
  name: 'Lumine',
  headFontFace: F_TIT,
  bodyFontFace: F_BODY,
  colors: {
    dk1: 'ECECEC', lt1: '020304', dk2: '8B9598', lt2: '0A0D0F',
    accent1: '22B8F0', accent2: '8B9598', accent3: '4A5257', accent4: 'ECECEC',
    accent5: '2E3438', accent6: '101417', hlink: '22B8F0', folHlink: '0A6F9E',
  },
};
const HEX = THEME.colors;
const HOT = '0B1A22';   // relleno de la caja destacada
// colores de estado de la paleta de Lumine (solo para el semáforo)
const GRIS = '8B9598', ROJO = 'F87171', VERDE = '4ADE80', AMBAR = 'F5B94A';

const TX = { tit: 34, acento: 40, sub: 24, cuerpo: 20, cuerpoL: 22, etq: 16, marca: 14, inst: 11, cifra: 44, cifraXL: 48, cifraM: 36, cifraS: 30 };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,333 × 7,5 in
pres.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo';
pres.company = 'Lumine Motors';
pres.title = 'Solemne 2 · Mapa estratégico y CMI · Lumine Motors';
pres.subject = 'Control de Gestión · ICMA901 · UNAB';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const C = pres.SchemeColor;
const S = pres.ShapeType;

const W = 13.333, M = 0.6, CW = W - 2 * M, R = W - M;
const LOGO_H = 0.22, LOGO_W = LOGO_H * (127.25 / 26);
const CURSO = 'CONTROL DE GESTIÓN · ICMA901 · SOLEMNE 2';
const Y0 = 2.62;   // inicio del contenido, bajo el titular
const YF = 6.82;   // fin del contenido, sobre la fuente al pie

// ---------- piezas del sistema visual ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: TX.cuerpo, color: C.text1, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: TX.etq, color: C.text2, charSpacing: 1 }, o));
const serif = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_SER, italic: true, fontSize: 18, color: C.accent1 }, o));
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
  s.addShape(S.rect, Object.assign({ x, y, w, h, fill: { color: C.background2 }, line: { color: C.accent5, width: 0.75 } }, o));
}
const cajaHot = (s, x, y, w, h) => { caja(s, x, y, w, h, { fill: { color: HOT }, line: { color: C.accent1, width: 1.25 } }); visor(s, x, y, w, h); };
function tag(s, n, x, y, o = {}) {
  const w = o.w || 0.62, h = o.h || 0.38, on = !o.off;
  s.addShape(S.rect, { x, y, w, h, fill: { color: on ? C.accent1 : C.accent5 }, line: { type: 'none' } });
  T(s, n, { x, y, w, h, fontFace: F_MONO, fontSize: o.size || TX.etq, bold: true, color: on ? C.background1 : C.text1, align: 'center', valign: 'middle' });
}
// rótulos de naturaleza del dato: est = estimación (raya), sup = supuesto o meta propuesta (puntos),
// pen = pendiente de definir (línea), no = ejemplo o ejercicio que NO es de Lumine (blanco, raya)
const MARCA = {
  est: { color: C.text2, dash: 'dash' },
  sup: { color: C.text2, dash: 'sysDot' },
  pen: { color: C.text2, dash: 'solid' },
  no: { color: C.text1, dash: 'dash' },
};
const anchoMarca = (t, size = TX.marca) => 0.34 + t.length * (size * 0.6 + 1) / 72;
function marca(s, tipo, text, x, y, o = {}) {
  const st = MARCA[tipo], size = o.size || TX.marca, h = o.h || 0.4, w = o.w || anchoMarca(text, size);
  const xx = o.alignRight ? x - w : x;
  s.addShape(S.rect, { x: xx, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color: st.color, width: o.grueso ? 1.5 : 1, dashType: st.dash } });
  mono(s, text, { x: xx + 0.12, y, w: w - 0.24, h, fontSize: size, color: st.color, bold: !!o.bold, valign: 'middle', align: 'center', charSpacing: 1 });
  return w;
}
// rótulo bien visible para lo que no es de Lumine (ejemplo de clase o ejercicio hipotético)
const noLumine = (s, text, x, y, o = {}) => marca(s, 'no', text, x, y, Object.assign({ size: 16, h: 0.46, bold: true, grueso: true }, o));
// estado de un indicador: punto de color y texto (el color nunca va solo)
const ESTADO = {
  sin: [GRIS, 'SIN MEDIR'],
  crit: [ROJO, 'HITO CRÍTICO PENDIENTE'],
  ok: [VERDE, 'COMPLETADO'],
  amb: [AMBAR, 'ÁMBAR'],
  rojo: [ROJO, 'ROJO'],
};
function estado(s, tipo, x, y, o = {}) {
  const [color, def] = ESTADO[tipo], text = o.text || def, size = o.size || TX.marca, h = o.h || 0.4;
  const w = anchoMarca(text, size) + 0.26, xx = o.alignRight ? x - w : x;
  s.addShape(S.rect, { x: xx, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color, width: 1.25 } });
  const d = Math.min(0.16, h * 0.4);
  s.addShape(S.ellipse, { x: xx + 0.15, y: y + (h - d) / 2, w: d, h: d, fill: { color }, line: { type: 'none' } });
  mono(s, text, { x: xx + 0.4, y, w: w - 0.5, h, fontSize: size, color, bold: true, valign: 'middle', charSpacing: 1 });
  return w;
}
const brillo = (s, x, y, w, h, k = 0.9) => s.addImage({ path: A('brillo.png'), x: x - k, y: y - 0.7 * k, w: w + 2 * k, h: h + 1.4 * k, altText: '' });
const numero = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: TX.cifra, color: C.text1, valign: 'bottom' }, o));
const regla = (s, y, x = M, w = CW, color = C.accent5) => linea(s, x, y, w, 0, color, 0.75);

// ---------- marcos (layouts) ----------
const logo = { image: { path: A('logo.png'), x: M, y: 0.42, w: LOGO_W, h: LOGO_H, altText: 'Lumine Motors' } };
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('portada-premium.jpg') },
  objects: [
    logo,
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.42, w: 9.6, h: 1.9, fontFace: F_TIT, fontSize: 54, color: C.text1, align: 'left', valign: 'top', margin: 0, lineSpacingMultiple: 0.9 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: C.background1 },
  margin: [0.5, M, 0.6, M],
  objects: [
    logo,
    { text: { text: CURSO, options: { x: 6.2, y: 0.4, w: R - 6.2, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: TX.inst, color: C.text2, charSpacing: 1.5, margin: 0 } } },
    { placeholder: { options: { name: 'etiqueta', type: 'body', x: M, y: 0.92, w: 7.6, h: 0.3, fontFace: F_MONO, fontSize: 12, color: C.text2, charSpacing: 1.5, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.36, w: CW, h: 1.2, fontFace: F_TIT, fontSize: TX.tit, color: C.text1, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.86 }, text: '' } },
  ],
  slideNumber: { x: R - 0.8, y: 7.02, w: 0.8, h: 0.26, fontFace: F_MONO, fontSize: 12, color: HEX.accent1, align: 'right', margin: 0 },
});

// Fuente al pie de cada diapositiva. Solo se citan los materiales del paquete de la Solemne, del curso y del proyecto.
const PAQ = 'Excel de la Solemne 2';
const FUENTES = {
  correccion: 'Fuentes: CMI de Lumine, versión original y versión actualizada a las Fases 1 y 2; retroalimentación del profesor, transcrita por el equipo.',
  valor: `Fuentes: contexto vigente de Lumine Motors (17-10-2026); ${PAQ}, indicador C01. El ahorro es una estimación de ingeniería, no medida en autos chilenos.`,
  mapa: `Fuentes: CMI de Lumine actualizado (Fases 1 y 2); ${PAQ}, hoja MATRIZ_CMI; módulos 2 y 3 del curso. Cada flecha es una hipótesis por verificar.`,
  hitos: `Fuentes: Ley N° 21.793 (publicada el 14-01-2026, sin reglamento); ${PAQ}, hoja MATRIZ_CMI (P01, P02 y P03).`,
  habilita: `Fuentes: Lumine Habilita, versión de demostración publicada por el equipo (datos ficticios); ${PAQ}, indicador A02.`,
  eva: `Fuentes: módulo 4 del curso (empresa genérica en US$, no Lumine); ${PAQ}, hoja EVA.`,
  ficha: `Fuente: ${PAQ}, hoja MATRIZ_CMI (C01). Responsable según la estructura de la Fase 3.`,
  semaforo: `Fuentes: material del curso «Sistemas de Control de Gestión: Indicadores»; ${PAQ}, hoja SEGUIMIENTO. Umbrales propuestos por el equipo.`,
  desviacion: `Fuente: ${PAQ}, hoja CASO_SIMULADO. Ejercicio didáctico: no son datos de Lumine.`,
  ciclo: `Fuentes: material del curso «Sistemas de Control de Gestión: Indicadores» (ciclo de seguimiento); ${PAQ}, hoja CASO_SIMULADO.`,
  conclusion: 'Fuente: elaboración propia. El WACC y la tolerancia de error del ahorro quedan por definir con antecedentes.',
  indice: 'Las fuentes de cada tema están al pie de su diapositiva.',
  'a-eva': `Fuentes: módulo 4 del curso (empresa genérica en US$, no Lumine); ${PAQ}, hoja EVA.`,
  'a-semaforo': `Fuente: ${PAQ}, hojas MATRIZ_CMI y SEGUIMIENTO. En el Excel, C03 usa otra regla: verde solo sobre la meta y ámbar desde 70% de ella.`,
  'a-matriz1': `Fuente: ${PAQ}, hoja MATRIZ_CMI. Responsables según la estructura de la Fase 3 (el Excel nombra otras áreas para A02 y P03).`,
  'a-matriz2': `Fuente: ${PAQ}, hoja MATRIZ_CMI. Responsables según la estructura de la Fase 3 (el Excel nombra otras áreas para F01 y F03).`,
  'a-cmi': 'Fuentes: CMI de Lumine, versión original y versión actualizada a las Fases 1 y 2; dossier de la Solemne 2.',
  'a-ahorro': 'Fuentes: contexto vigente de Lumine Motors (17-10-2026); dossier de la Solemne 2. El ahorro es una estimación de ingeniería, no medida en autos chilenos.',
  'a-apoyo': `Fuente: ${PAQ}, hoja MATRIZ_CMI (C02 y C03). La meta de C03 es orientativa.`,
  'a-financia': `Fuente: ${PAQ}, hoja MATRIZ_CMI (F02 y F03). El Plan Financiero de Lumine aún no existe.`,
  'a-naturaleza': 'Fuentes: contexto vigente de Lumine Motors (17-10-2026); dossier y Excel de la Solemne 2; módulo 4 del curso.',
};

let SEC = null, CLAVE = null, NUM = 0, ANEXO_ACTUAL = null, INDICE_ANEXO = null;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(etiqueta, titulo, acento) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SEC });
  let n;
  if (ANEXO_ACTUAL) {
    n = ANEXO_ACTUAL.codigo; etiqueta = 'ANEXO · ' + etiqueta;
    s.addText('VOLVER AL ÍNDICE DEL ANEXO', { x: 7.7, y: 0.7, w: R - 7.7, h: 0.26, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 12, color: C.accent1, charSpacing: 1, margin: 0, hyperlink: { slide: INDICE_ANEXO, tooltip: 'Volver al índice del anexo' } });
  } else n = CLAVE === 'indice' ? 'A' : String(++NUM).padStart(2, '0');
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  // si titular y acento no caben en una línea, el acento pasa entero a la segunda (nunca se corta a la mitad)
  const unaLinea = titulo.length * 0.345 + acento.length * 0.18 <= CW - 0.6;
  s.addText([{ text: unaLinea ? titulo + ' ' : titulo, options: { breakLine: !unaLinea } }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: TX.acento } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.94, w: R - M - 1.0, h: 0.42, valign: 'top', fontSize: TX.inst, color: C.text2 });
  return s;
}
// leyenda de estados (forma y color) en la esquina superior derecha, a la altura de la etiqueta
function leyendaEstados(s, tipos) {
  let x = R;
  [...tipos].reverse().forEach(t => {
    const [color, text] = ESTADO[t];
    const w = text.length * (12 * 0.6 + 0.5) / 72 + 0.2;
    x -= w;
    mono(s, text, { x, y: 0.92, w, h: 0.3, fontSize: 12, color, valign: 'middle', charSpacing: 0.5 });
    if (t === 'sin') s.addShape(S.rect, { x: x - 0.34, y: 0.98, w: 0.24, h: 0.18, fill: { color: C.background1, transparency: 100 }, line: { color: GRIS, width: 1, dashType: 'dash' } });
    else s.addShape(S.rect, { x: x - 0.34, y: 0.98, w: 0.24, h: 0.18, fill: { color: C.background1, transparency: 100 }, line: { color, width: 1.75 } });
    x -= 0.65;
  });
}
// borde de una caja según su estado: gris punteado = sin medir; rojo grueso = hito crítico pendiente
const borde = st => st === 'crit' ? { color: ROJO, width: 1.75 } : { color: GRIS, width: 1, dashType: 'dash' };

// =====================================================================
// 1 · PORTADA · la pregunta y la premisa preoperativa
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 12 });
  mono(s, [{ text: 'SOLEMNE 2', options: { color: C.accent1 } }, { text: '  ·  MAPA ESTRATÉGICO Y CUADRO DE MANDO INTEGRAL', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  s.addText([
    { text: '¿CÓMO CONTROLAR', options: { breakLine: true } },
    { text: 'una empresa que aún no opera?', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 46 } },
  ], { placeholder: 'title' });
  linea(s, M, 3.0, 0.06, 0.86, C.accent1, 3);
  T(s, [{ text: 'Lumine es preoperativa: ', options: { bold: true } }, { text: 'el tablero mide lo que falta demostrar, no logros.', options: { color: C.text2 } }],
    { x: M + 0.3, y: 2.98, w: 5.6, h: 0.9, fontSize: 22, valign: 'middle', lineSpacingMultiple: 1.05 });
  const iy = 5.42;
  linea(s, M, iy, 1.2, 0, C.accent1, 1.25);
  T(s, [
    { text: 'Control de Gestión · ICMA901', options: { breakLine: true, bold: true, color: C.text1 } },
    { text: 'Sección 500 · NRC 4118 · UNAB', options: { breakLine: true } },
    { text: 'Diego Alarcón · Benjamín Torres · Lukas Verdugo' },
  ], { x: M, y: iy + 0.16, w: 3.75, h: 1.2, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.15 });
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
// 2 · EL CMI CONSERVA EL RETORNO Y CORRIGE LO CRITICADO · tres filas antes → después
// =====================================================================
D.correccion = () => {
  const s = contenido('RETROALIMENTACIÓN · CMI ORIGINAL Y ACTUALIZADO', 'EL CMI CONSERVA EL RETORNO', 'y corrige lo criticado.');
  // leyenda de forma: punto lleno = destacado; anillo = criticado
  const lx = R - 3.6;
  s.addShape(S.ellipse, { x: lx, y: 0.99, w: 0.16, h: 0.16, fill: { color: C.accent1 }, line: { type: 'none' } });
  mono(s, 'DESTACADO', { x: lx + 0.26, y: 0.92, w: 1.2, h: 0.3, fontSize: 12, color: C.text1, valign: 'middle' });
  s.addShape(S.ellipse, { x: lx + 1.7, y: 0.99, w: 0.16, h: 0.16, fill: { color: C.background1, transparency: 100 }, line: { color: C.text1, width: 1.5 } });
  mono(s, 'CRITICADO', { x: lx + 1.96, y: 0.92, w: 1.3, h: 0.3, fontSize: 12, color: C.text1, valign: 'middle' });
  const lw = 5.6, rx = M + lw + 0.95, rw = R - rx;
  mono(s, 'LO QUE DIJO EL PROFESOR', { x: M, y: Y0, w: lw, h: 0.3 });
  mono(s, 'LO QUE CAMBIAMOS', { x: rx, y: Y0, w: rw, h: 0.3, color: C.accent1 });
  const filas = [
    [true, 'Rentabilidad sobre el costo de capital', 'Se conserva y se mide con EVA'],
    [false, 'Clientes descritos como canales y convenios', 'El informe al cliente pasa al centro'],
    [false, 'Objetivos sin relación de causa y efecto', 'Flechas con mecanismo e indicador'],
  ];
  const rh = 1.0, g = 0.22;
  filas.forEach(([ok, o, c], i) => {
    const y = Y0 + 0.48 + i * (rh + g);
    caja(s, M, y, lw, rh);
    const d = 0.3;
    if (ok) s.addShape(S.ellipse, { x: M + 0.28, y: y + (rh - d) / 2, w: d, h: d, fill: { color: C.accent1 }, line: { type: 'none' } });
    else s.addShape(S.ellipse, { x: M + 0.28, y: y + (rh - d) / 2, w: d, h: d, fill: { color: C.background1, transparency: 100 }, line: { color: C.text1, width: 2 } });
    T(s, o, { x: M + 0.85, y, w: lw - 1.05, h: rh, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
    flecha(s, M + lw + 0.15, y + rh / 2, 0.65, 0);
    if (i === 0) { brillo(s, rx, y, rw, rh, 0.4); cajaHot(s, rx, y, rw, rh); } else caja(s, rx, y, rw, rh, { line: { color: C.accent1, width: 1 } });
    T(s, c, { x: rx + 0.3, y, w: rw - 0.45, h: rh, fontSize: TX.cuerpoL, bold: true, valign: 'middle' });
  });
  return s;
};

// =====================================================================
// 3 · EL CLIENTE COMPRA EVIDENCIA, NO UNA PROMESA DE 20% · fracción del indicador C01
// =====================================================================
D.valor = () => {
  const s = contenido('PERSPECTIVA DE CLIENTES · PROPUESTA DE VALOR', 'EL CLIENTE COMPRA EVIDENCIA,', 'no una promesa de 20%.');
  leyendaEstados(s, ['sin']);
  const lw = 5.0;
  mono(s, 'LO QUE COMPRA', { x: M, y: Y0, w: lw, h: 0.3 });
  ['Modernizar su propio auto', 'Un procedimiento seguro y trazable'].forEach((t, i) => {
    const y = Y0 + 0.5 + i * 0.9;
    tag(s, String(i + 1), M, y + 0.1, { off: true, w: 0.5, h: 0.5, size: 20 });
    T(s, t, { x: M + 0.75, y, w: lw - 0.75, h: 0.7, fontSize: TX.cuerpoL, valign: 'middle' });
  });
  // lo que NO compra: la cifra estimada, marcada como tal
  const ny = Y0 + 2.5;
  regla(s, ny, M, lw);
  mono(s, 'LO QUE NO SE PROMETE', { x: M, y: ny + 0.14, w: lw, h: 0.3 });
  T(s, 'Hasta 20% menos bencina', { x: M, y: ny + 0.5, w: lw, h: 0.5, fontSize: TX.cuerpoL, color: C.text2, valign: 'middle' });
  marca(s, 'est', 'ESTIMACIÓN, NO MEDICIÓN', M, ny + 1.06);
  // protagonista: la fracción del indicador
  const cx = M + lw + 0.7, cw = R - cx, cy = Y0, ch = YF - Y0 - 0.1;
  brillo(s, cx, cy, cw, ch, 0.6);
  cajaHot(s, cx, cy, cw, ch);
  s.addShape(S.rect, { x: cx + cw - 0.62, y: cy + 0.26, w: 0.3, h: 0.22, fill: { color: C.background1, transparency: 100 }, line: { color: GRIS, width: 1, dashType: 'dash' } });
  mono(s, 'C01 · INDICADOR CENTRAL DE CLIENTES', { x: cx + 0.35, y: cy + 0.24, w: cw - 1.2, h: 0.3, color: C.accent1 });
  T(s, 'Clientes con informe de consumo antes y después', { x: cx + 0.4, y: cy + 0.85, w: cw - 0.8, h: 1.1, fontSize: 28, bold: true, align: 'center', valign: 'middle' });
  linea(s, cx + 0.6, cy + 2.08, cw - 1.2, 0, C.accent1, 2.5);
  T(s, 'Clientes intervenidos', { x: cx + 0.4, y: cy + 2.22, w: cw - 0.8, h: 0.6, fontSize: 28, align: 'center', valign: 'middle' });
  T(s, 'en condiciones comparables', { x: cx + 0.4, y: cy + 3.2, w: cw - 0.8, h: 0.5, fontFace: F_SER, italic: true, fontSize: 24, color: C.accent1, align: 'center', valign: 'middle' });
  return s;
};

// =====================================================================
// 4 · CADA OBJETIVO CAUSA EL SIGUIENTE · mapa estratégico con flechas rotuladas
// =====================================================================
D.mapa = () => {
  const s = contenido('MAPA ESTRATÉGICO · CAUSA Y EFECTO', 'CADA OBJETIVO CAUSA EL SIGUIENTE:', 'del técnico al EVA.');
  leyendaEstados(s, ['sin', 'crit']);
  const col = [2.55, 5.18, 7.81, 10.44], cw = 2.29, nh = 0.6, g = 0.32;
  const fila = { F: Y0 - 0.04 }; fila.K = fila.F + nh + g; fila.C = fila.K + nh + g; fila.P = fila.C + nh + g; fila.A = fila.P + nh + g;
  [['FINANCIERA', fila.F, nh], ['CLIENTES', fila.K, 2 * nh + g], ['PROCESOS', fila.P, nh], ['APRENDIZAJE', fila.A, nh]].forEach(([t, y, h]) => {
    linea(s, M, y, 0, h, C.accent1, 2);
    mono(s, t, { x: M + 0.16, y, w: 1.8, h, fontSize: 14, color: C.text1, valign: 'middle' });
  });
  const nodo = (code, text, x, y, w, tipo) => {
    if (tipo === 'hot') { brillo(s, x, y, w, nh, 0.4); cajaHot(s, x, y, w, nh); }
    else caja(s, x, y, w, nh, { line: borde(tipo) });
    let tx = x + 0.14;
    if (code) { tag(s, code, x + 0.12, y + (nh - 0.32) / 2, { w: 0.58, h: 0.32, size: 13, off: tipo !== 'hot' }); tx = x + 0.82; }
    T(s, text, { x: tx, y, w: x + w - tx - 0.08, h: nh, fontSize: 16, bold: tipo === 'hot', valign: 'middle', lineSpacingMultiple: 0.88 });
  };
  const ancho = (a, b) => col[b] + cw - col[a];
  nodo('F01', 'EVA > 0: rentabilidad sobre el costo de capital', col[1], fila.F, ancho(1, 2), 'hot');
  caja(s, col[0], fila.K, ancho(0, 3), nh, { line: { color: C.accent1, width: 1 } });
  T(s, 'Confianza: el cliente valora el resultado', { x: col[0], y: fila.K, w: ancho(0, 3), h: nh, fontSize: 18, bold: true, align: 'center', valign: 'middle' });
  nodo('C01', 'Informe individual antes y después', col[0], fila.C, ancho(0, 1), 'sin');
  nodo('C02', 'Respaldo de aseguradora y planta de revisión técnica', col[2], fila.C, ancho(2, 3), 'crit');
  nodo('P03', 'Actas de seguridad', col[1], fila.P, cw, 'sin');
  nodo('P02', 'Kit homologado', col[2], fila.P, cw, 'crit');
  nodo('P01', 'Autorización sectorial', col[3], fila.P, cw, 'crit');
  nodo('A03', 'Medición comparativa', col[0], fila.A, cw, 'crit');
  nodo('A02', 'Técnicos habilitados', col[1], fila.A, cw, 'sin');
  nodo('A01', 'Biblioteca de calibraciones', col[2], fila.A, cw, 'sin');
  const sube = (c, de, a, texto, yt) => {
    const x = col[c] + 0.36;
    flecha(s, x, fila[de], 0, fila[a] + nh - fila[de]);
    serif(s, texto, { x: x + 0.12, y: yt !== undefined ? yt : fila[a] + nh, w: a === 'F' ? 3.5 : 2.0, h: yt !== undefined ? nh : g, fontSize: 17, valign: 'middle' });
  };
  sube(0, 'A', 'C', 'sustenta el informe', fila.P);
  sube(1, 'A', 'P', 'habilita el control');
  sube(2, 'A', 'P', 'permite homologar');
  sube(1, 'P', 'C', 'trazabilidad');
  sube(2, 'P', 'C', 'kit homologado');
  sube(3, 'P', 'C', 'autoriza operar');
  sube(0, 'C', 'K', 'evidencia');
  sube(2, 'C', 'K', 'respaldo');
  sube(1, 'K', 'F', 'valor captado y margen');
  return s;
};

// =====================================================================
// 5 · SIN AUTORIZACIÓN NI HOMOLOGACIÓN NO SE OPERA · la compuerta
// =====================================================================
D.hitos = () => {
  const s = contenido('PROCESOS · HITOS CRÍTICOS', 'SIN AUTORIZACIÓN NI HOMOLOGACIÓN', 'no se opera, aunque todo esté verde.');
  leyendaEstados(s, ['crit']);
  const y = Y0 + 0.05, h = 2.5;
  // lo demás, aunque estuviera listo
  const lw = 2.95;
  caja(s, M, y, lw, h, { line: { color: GRIS, width: 1, dashType: 'dash' } });
  mono(s, 'AUNQUE ESTÉN LISTOS', { x: M + 0.25, y: y + 0.24, w: lw - 0.5, h: 0.3, fontSize: 13 });
  T(s, 'Técnicos, biblioteca y clientes', { x: M + 0.25, y: y + 0.7, w: lw - 0.45, h: 1.4, fontSize: TX.cuerpoL, color: C.text2, valign: 'top' });
  // la compuerta: los dos hitos
  const gx = M + lw + 0.85, gw = 4.45, gh = (h - 0.24) / 2;
  flecha(s, M + lw + 0.12, y + h / 2, 0.6, 0, C.text2);
  [['P01', 'Autorización sectorial'], ['P02', 'Primer par modelo-kit homologado']].forEach(([k, t], i) => {
    const yy = y + i * (gh + 0.24);
    caja(s, gx, yy, gw, gh, { fill: { color: '1A0E10' }, line: { color: ROJO, width: 2 } });
    tag(s, k, gx + 0.25, yy + (gh - 0.44) / 2, { w: 0.72, h: 0.44, size: 18, off: true });
    T(s, t, { x: gx + 1.2, y: yy, w: gw - 1.35, h: gh, fontSize: TX.sub, bold: true, valign: 'middle', lineSpacingMultiple: 0.95 });
  });
  // lo que queda bloqueado
  const ox = gx + gw + 0.85, ow = R - ox;
  flecha(s, gx + gw + 0.12, y + h / 2, 0.6, 0, ROJO);
  caja(s, ox, y, ow, h, { fill: { color: C.background1 }, line: { color: ROJO, width: 1.25, dashType: 'dash' } });
  T(s, 'Vender e instalar', { x: ox + 0.2, y: y + 0.5, w: ow - 0.4, h: 1.0, fontSize: TX.sub, bold: true, color: C.text2, align: 'center', valign: 'middle' });
  linea(s, ox + 0.35, y + 1.0, ow - 0.7, 0, ROJO, 2.5);
  // apoyo: el riesgo externo (única vez) y las actas
  const ay = y + h + 0.35, rh = 0.62;
  [['Ley N° 21.793 publicada, sin reglamento', ['pen', 'RIESGO EXTERNO']], ['Actas de seguridad completas en cada orden', ['sin']]].forEach(([t, st], i) => {
    const yy = ay + i * rh;
    regla(s, yy, M, CW, i ? C.accent5 : C.accent1);
    T(s, t, { x: M, y: yy, w: CW - 3, h: rh, fontSize: TX.cuerpo, valign: 'middle' });
    if (st[0] === 'pen') marca(s, 'pen', st[1], R, yy + 0.11, { alignRight: true });
    else s.addShape(S.rect, { x: R - 0.4, y: yy + 0.2, w: 0.4, h: 0.24, fill: { color: C.background1, transparency: 100 }, line: { color: GRIS, width: 1, dashType: 'dash' } });
  });
  return s;
};

// =====================================================================
// 6 · LA HABILITACIÓN DE TÉCNICOS YA SE PUEDE MEDIR · código QR a la demo de Lumine Habilita
// =====================================================================
D.habilita = () => {
  const s = contenido('APRENDIZAJE · PRUEBA CONCRETA', 'LA HABILITACIÓN DE TÉCNICOS', 'ya se puede medir.');
  const q = 3.55, qx = M + 0.2, qy = Y0 + 0.05;
  brillo(s, qx, qy, q, q, 0.7);
  s.addImage({ path: A('qr-habilita.png'), x: qx, y: qy, w: q, h: q, altText: 'Código QR a la demostración de Lumine Habilita' });
  visor(s, qx, qy, q, q);
  mono(s, 'ESCANEA PARA ABRIR LA DEMO', { x: qx - 0.2, y: qy + q + 0.14, w: q + 0.4, h: 0.3, fontSize: 12, align: 'center', color: C.text1 });
  const x = qx + q + 0.85, w = R - x;
  T(s, 'Lumine Habilita', { x, y: Y0, w, h: 0.62, fontFace: F_TIT, fontSize: 30, valign: 'middle' });
  T(s, 'Habilitación por competencias del técnico instalador', { x, y: Y0 + 0.66, w, h: 0.45, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
  regla(s, Y0 + 1.3, x, w, C.accent1);
  [['39', 'competencias'], ['4', 'niveles']].forEach(([v, k], i) => {
    const xx = x + i * 2.3;
    numero(s, v, { x: xx, y: Y0 + 1.38, w: 2.1, h: 0.9, fontSize: TX.cifraXL + 6, valign: 'middle', color: C.accent1 });
    T(s, k, { x: xx, y: Y0 + 2.26, w: 2.1, h: 0.36, fontSize: 18, color: C.text2 });
  });
  regla(s, Y0 + 2.8, x, w);
  tag(s, 'A02', x, Y0 + 3.0, { w: 0.72, h: 0.42, size: 16, off: true });
  T(s, 'Técnicos habilitados ÷ técnicos asignados', { x: x + 0.9, y: Y0 + 2.92, w: w - 0.9, h: 0.58, fontSize: TX.cuerpo, bold: true, valign: 'middle' });
  marca(s, 'sup', 'DEMO CON DATOS FICTICIOS', x, Y0 + 3.66);
  return s;
};

// =====================================================================
// 7 · UNA UTILIDAD POSITIVA PUEDE NO PAGAR EL CAPITAL · EVA con el ejemplo del módulo 4
// =====================================================================
D.eva = () => {
  const s = contenido('PERSPECTIVA FINANCIERA · EVA', 'UNA UTILIDAD POSITIVA', 'puede no pagar el capital: por eso el EVA.');
  numero(s, [{ text: 'EVA', options: { color: C.accent1 } }, { text: '  =  NOPAT  −  CAPITAL INVERTIDO  ×  WACC' }], { x: M, y: Y0 - 0.06, w: CW, h: 0.7, fontSize: 40, valign: 'middle' });
  T(s, [{ text: 'NOPAT: ', options: { bold: true, color: C.text1 } }, { text: 'resultado operativo después de impuestos   ·   ' }, { text: 'WACC: ', options: { bold: true, color: C.text1 } }, { text: 'costo promedio ponderado del capital' }],
    { x: M, y: Y0 + 0.66, w: CW, h: 0.36, fontSize: 18, color: C.text2, valign: 'middle' });
  const cy = Y0 + 1.3, ch = YF - cy - 0.06, lw = 7.6;
  cajaHot(s, M, cy, lw, ch);
  noLumine(s, 'EJEMPLO DE CLASE · NO LUMINE', M + 0.3, cy + 0.24);
  const fila = (k, v, y, o = {}) => {
    T(s, k, { x: M + 0.3, y, w: 4.4, h: 0.5, fontSize: o.k || TX.cuerpo, bold: !!o.b, valign: 'middle', color: o.kc || C.text1 });
    numero(s, v, { x: M + 3.8, y, w: lw - 4.1, h: 0.5, fontSize: o.size || TX.cifraS, align: 'right', valign: 'middle', color: o.color || C.text1 });
  };
  fila('NOPAT', 'US$ 150.000', cy + 0.86);
  fila('Cargo por capital: 1.000.000 × 12%', '− US$ 120.000', cy + 1.4, { k: 18, kc: C.text2 });
  regla(s, cy + 2.0, M + 0.3, lw - 0.6, C.accent1);
  fila('EVA', 'US$ 30.000', cy + 2.12, { b: true, size: TX.cifra, color: C.accent1 });
  const rx = M + lw + 0.5, rw = R - rx;
  caja(s, rx, cy, rw, ch, { line: { color: GRIS, width: 1, dashType: 'dash' } });
  mono(s, 'LUMINE HOY', { x: rx + 0.3, y: cy + 0.3, w: rw - 0.6, h: 0.3, color: C.text1 });
  T(s, 'Sin NOPAT, capital invertido ni WACC respaldado', { x: rx + 0.3, y: cy + 0.8, w: rw - 0.6, h: 1.3, fontSize: TX.cuerpoL, bold: true, valign: 'top' });
  T(s, 'La fórmula queda definida; la cifra, pendiente.', { x: rx + 0.3, y: cy + 2.1, w: rw - 0.6, h: 0.7, fontSize: 18, color: C.text2, valign: 'top' });
  return s;
};

// =====================================================================
// 8 · UN INDICADOR SIN RESPONSABLE NI EVIDENCIA NO CONTROLA NADA · ficha de C01
// =====================================================================
D.ficha = () => {
  const s = contenido('CMI · FICHA DEL INDICADOR', 'SIN RESPONSABLE NI EVIDENCIA,', 'un indicador no controla nada.');
  const cy = Y0, ch = YF - Y0 - 0.06;
  caja(s, M, cy, CW, ch, { line: { color: C.accent5, width: 0.75 } });
  // cabecera de la ficha: indicador y fórmula
  mono(s, 'FICHA · C01 INFORME AL CLIENTE', { x: M + 0.35, y: cy + 0.26, w: 6, h: 0.3, color: C.accent1 });
  T(s, [{ text: 'Clientes con informe', options: { bold: true } }, { text: '  ÷  ', options: { color: C.accent1 } }, { text: 'clientes intervenidos' }],
    { x: M + 0.35, y: cy + 0.62, w: CW - 0.7, h: 0.6, fontSize: 26, valign: 'middle' });
  regla(s, cy + 1.42, M + 0.35, CW - 0.7);
  // protagonistas: las tres casillas que convierten un objetivo en control
  const cols = [['RESPONSABLE', 'Comercial y Postventa'], ['EVIDENCIA', 'Informe con sus límites y acuse firmado'], ['SI SE DESVÍA', 'Completar el informe y contactar al cliente']];
  const g = 0.3, w = (CW - 0.7 - 2 * g) / 3, yy = cy + 1.7, hh = ch - 1.95;
  cols.forEach(([k, v], i) => {
    const x = M + 0.35 + i * (w + g);
    if (i === 0) { brillo(s, x, yy, w, hh, 0.4); cajaHot(s, x, yy, w, hh); } else caja(s, x, yy, w, hh, { fill: { color: C.background1 }, line: { color: C.accent1, width: 1 } });
    mono(s, k, { x: x + 0.25, y: yy + 0.24, w: w - 0.5, h: 0.3, fontSize: 14, color: C.accent1 });
    T(s, v, { x: x + 0.25, y: yy + 0.7, w: w - 0.45, h: hh - 0.9, fontSize: TX.sub, bold: true, valign: 'top', lineSpacingMultiple: 1.0 });
  });
  return s;
};

// =====================================================================
// 9 · SIN MEDIR NO ES ROJO · semáforo con el gris aparte
// =====================================================================
D.semaforo = () => {
  const s = contenido('CMI · LECTURA DEL RESULTADO', 'SIN MEDIR', 'no es rojo.');
  const d = 1.45, y = Y0 + 0.35, g = 0.55;
  [[VERDE, 'VERDE', '90% o más'], [AMBAR, 'ÁMBAR', '70% a 89%'], [ROJO, 'ROJO', 'menos de 70%']].forEach(([color, k, v], i) => {
    const x = M + 0.1 + i * (d + g);
    s.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color }, line: { type: 'none' } });
    mono(s, k, { x: x - 0.3, y: y + d + 0.16, w: d + 0.6, h: 0.3, fontSize: 15, bold: true, color, align: 'center' });
    T(s, v, { x: x - 0.3, y: y + d + 0.5, w: d + 0.6, h: 0.4, fontSize: TX.cuerpo, align: 'center' });
  });
  // separador y el gris, protagonista
  const sx = M + 0.1 + 3 * (d + g) + 0.1;
  linea(s, sx, Y0, 0, 3.3, C.accent5, 1);
  const gd = 2.35, gx = sx + 0.75, gy = Y0 + 0.05;
  brillo(s, gx, gy, gd, gd, 0.5);
  s.addShape(S.ellipse, { x: gx, y: gy, w: gd, h: gd, fill: { color: '2A3034' }, line: { color: GRIS, width: 2.5, dashType: 'dash' } });
  T(s, 'SIN MEDIR', { x: gx, y: gy, w: gd, h: gd, fontFace: F_MONO, fontSize: 20, bold: true, color: C.text1, align: 'center', valign: 'middle' });
  T(s, [{ text: 'Celda vacía: ', options: { bold: true } }, { text: 'falta el dato, no se incumplió.', options: { color: C.text2 } }],
    { x: gx + gd + 0.4, y: gy + 0.5, w: R - gx - gd - 0.4, h: 1.4, fontSize: TX.cuerpoL, valign: 'middle' });
  const by = Y0 + 3.55;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Control crítico: ', options: { bold: true } }, { text: 'verde solo al 100%.', options: { bold: true, color: C.accent1 } }],
    { x: M, y: by + 0.12, w: CW, h: 0.5, fontSize: TX.sub, valign: 'middle' });
  return s;
};

// =====================================================================
// 10 · 8 DE 10 ES ROJO, NO ÁMBAR · ejercicio hipotético
// =====================================================================
D.desviacion = () => {
  const s = contenido('CONTROL · DESVIACIÓN DE UNA META', '8 DE 10 ES ROJO, NO ÁMBAR:', 'el informe es obligatorio.');
  noLumine(s, 'EJERCICIO HIPOTÉTICO', R, Y0 - 0.08, { alignRight: true });
  mono(s, 'INFORMES ENTREGADOS A 10 CLIENTES', { x: M, y: Y0, w: 8, h: 0.3 });
  const n = 10, g = 0.16, q = (CW - (n - 1) * g) / n, qy = Y0 + 0.5, qh = 0.9;
  for (let i = 0; i < n; i++) {
    const x = M + i * (q + g), ok = i < 8;
    if (ok) s.addShape(S.rect, { x, y: qy, w: q, h: qh, fill: { color: C.accent1 }, line: { type: 'none' } });
    else s.addShape(S.rect, { x, y: qy, w: q, h: qh, fill: { color: '1A0E10' }, line: { color: ROJO, width: 2, dashType: 'dash' } });
    T(s, String(i + 1), { x, y: qy, w: q, h: qh, fontFace: F_MONO, fontSize: 18, bold: true, align: 'center', valign: 'middle', color: ok ? C.background1 : ROJO });
  }
  const ny = qy + qh + 0.28;
  [['REAL', '80%', C.text1], ['DESVIACIÓN', '−20 pp', C.accent1]].forEach(([k, v, color], i) => {
    const x = M + i * 3.6;
    mono(s, k, { x, y: ny, w: 3.4, h: 0.3, fontSize: 14 });
    numero(s, v, { x, y: ny + 0.3, w: 3.4, h: 0.8, fontSize: TX.cifraXL, valign: 'middle', color });
  });
  // dos lecturas del mismo 80%: protagonista el veredicto crítico
  const cx = M + 7.3, cw = R - cx, half = 0.82;
  caja(s, cx, ny, cw, half, { fill: { color: C.background1 }, line: { color: AMBAR, width: 1, dashType: 'dash' } });
  T(s, 'Regla general', { x: cx + 0.25, y: ny, w: cw - 2.0, h: half, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
  estado(s, 'amb', cx + cw - 0.22, ny + (half - 0.44) / 2, { alignRight: true, size: 16, h: 0.44 });
  const y2 = ny + half + 0.2, h2 = YF - y2;
  cajaHot(s, cx, y2, cw, h2);
  T(s, 'Control crítico', { x: cx + 0.25, y: y2, w: cw - 2.0, h: h2, fontSize: TX.cuerpoL, bold: true, valign: 'middle' });
  estado(s, 'rojo', cx + cw - 0.22, y2 + (h2 - 0.5) / 2, { alignRight: true, size: 18, h: 0.5 });
  return s;
};

// =====================================================================
// 11 · LA DESVIACIÓN SE CIERRA CON EVIDENCIA · ciclo medir → explicar → corregir → verificar
// =====================================================================
D.ciclo = () => {
  const s = contenido('CONTROL · ACCIÓN CORRECTIVA', 'LA DESVIACIÓN SE CIERRA', 'con evidencia, no cambiando el color.');
  noLumine(s, 'EJERCICIO HIPOTÉTICO', R, Y0 - 0.08, { alignRight: true });
  mono(s, 'LOS 2 INFORMES QUE FALTAN', { x: M, y: Y0, w: 8, h: 0.3 });
  const pasos = [
    ['MEDIR', 'El corte mensual detecta la brecha'],
    ['EXPLICAR', '¿Faltó medir, validar o entregar?'],
    ['CORREGIR', 'Responsable y plazo para cerrarlos'],
    ['VERIFICAR', 'Informe firmado, entrega y acuse'],
  ];
  const g = 0.5, pw = (CW - 3 * g) / 4, py = Y0 + 0.58, ph = 1.95;
  pasos.forEach(([k, v], i) => {
    const x = M + i * (pw + g), hot = i === 3;
    if (hot) { brillo(s, x, py, pw, ph, 0.4); cajaHot(s, x, py, pw, ph); } else caja(s, x, py, pw, ph, { line: { color: C.text2, width: 0.75 } });
    tag(s, String(i + 1).padStart(2, '0'), x + 0.22, py + 0.22, { off: !hot, w: 0.6, h: 0.4, size: 16 });
    T(s, k, { x: x + 0.22, y: py + 0.72, w: pw - 0.44, h: 0.44, fontSize: TX.sub, bold: true, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    T(s, v, { x: x + 0.22, y: py + 1.18, w: pw - 0.4, h: 0.7, fontSize: 18, color: C.text2, valign: 'top' });
    if (i < 3) flecha(s, x + pw + 0.08, py + ph / 2, g - 0.16, 0);
  });
  const ly = py + ph + 0.32, x1 = M + pw / 2, x4 = M + 3 * (pw + g) + pw / 2;
  linea(s, x4, py + ph, 0, ly - py - ph, C.accent1, 1.75);
  linea(s, x1, ly, x4 - x1, 0, C.accent1, 1.75);
  flecha(s, x1, ly, 0, py + ph - ly);
  serif(s, 'nueva medición en el siguiente corte', { x: x1 + 0.3, y: ly + 0.04, w: 6, h: 0.4, fontSize: 18 });
  const by = ly + 0.62;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Si la falla se repite: ', options: { bold: true } }, { text: 'se rediseña el protocolo, no se culpa al técnico.', options: { color: C.text2 } }],
    { x: M, y: by + 0.12, w: CW, h: 0.5, fontSize: TX.cuerpoL, valign: 'middle' });
  return s;
};

// =====================================================================
// 12 · EL CMI DICE CUÁNDO AVANZAR · escalera, pendientes y la pregunta que sigue
// =====================================================================
D.conclusion = () => {
  const s = contenido('CONCLUSIÓN', 'EL CMI DICE CUÁNDO AVANZAR;', 'faltan el WACC y la tolerancia.');
  const lw = 7.3, gap = 0.16, sw = (lw - 3 * gap) / 4, base = YF - 0.05;
  [['APRENDIZAJE', 'Capacidades verificables'], ['PROCESOS', 'Procesos formales'], ['CLIENTES', 'Valor demostrado al cliente'], ['FINANCIERA', 'EVA mayor que cero']].forEach(([k, t], i) => {
    const x = M + i * (sw + gap), h = 1.75 + i * 0.8, y = base - h, hot = i === 3;
    if (hot) { brillo(s, x, y, sw, h, 0.5); cajaHot(s, x, y, sw, h); } else caja(s, x, y, sw, h, { line: { color: i ? C.text2 : C.accent5, width: 0.75 } });
    s.addShape(S.rect, { x, y, w: sw, h: 0.05, fill: { color: hot ? C.accent1 : C.text2 }, line: { type: 'none' } });
    tag(s, String(i + 1), x + 0.18, y + 0.2, { off: !hot, w: 0.46, h: 0.42, size: 18 });
    mono(s, k, { x: x + 0.18, y: y + 0.72, w: sw - 0.3, h: 0.28, fontSize: 12, color: hot ? C.accent1 : C.text2 });
    T(s, t, { x: x + 0.16, y: y + 1.0, w: sw - 0.22, h: 0.6, fontSize: 16, bold: true, lineSpacingMultiple: 0.95 });
  });
  const rx = M + lw + 0.55, rw = R - rx;
  mono(s, 'POR DEFINIR', { x: rx, y: Y0, w: rw, h: 0.3 });
  ['WACC de Lumine', 'Tolerancia de error del ahorro'].forEach((t, i) => {
    const y = Y0 + 0.42 + i * 0.8;
    regla(s, y, rx, rw);
    T(s, t, { x: rx, y, w: rw - 1.55, h: 0.8, fontSize: TX.cuerpo, valign: 'middle', lineSpacingMultiple: 0.95 });
    marca(s, 'pen', 'PENDIENTE', R, y + 0.22, { alignRight: true, size: 12, h: 0.36 });
  });
  const ny = Y0 + 2.14;
  regla(s, ny, rx, rw, C.accent1);
  mono(s, 'LO QUE SIGUE', { x: rx, y: ny + 0.14, w: rw, h: 0.3, color: C.accent1 });
  serif(s, '¿Qué iniciativas y presupuesto necesita cada hito?', { x: rx, y: ny + 0.5, w: rw, h: 1.0, fontSize: 24, color: C.text1 });
  regla(s, YF - 0.62, rx, rw);
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: rx, y: YF - 0.5, w: rw, h: 0.45, fontSize: 18, color: C.text1, valign: 'middle' });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces y nueve temas, en el orden de las preguntas más probables
// =====================================================================
D.indice = (primera) => {
  const s = contenido('MATERIAL DE APOYO', 'ANEXO', 'para preguntas.');
  T(s, 'No se presenta: clic en la pregunta para saltar a la respuesta.', { x: M, y: Y0 - 0.06, w: CW, h: 0.4, fontSize: 18, color: C.text2 });
  const rowH = 0.42, y0 = Y0 + 0.36;
  G.ANEXO.forEach((a, i) => {
    const y = y0 + i * rowH, n = primera + i;
    regla(s, y, M, CW);
    tag(s, a.codigo, M, y + 0.06, { w: 0.6, h: 0.32, size: 14 });
    s.addText(a.titulo, { x: M + 0.8, y, w: CW - 2.0, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 19, color: C.text1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('LÁM. ' + n, { x: R - 1.1, y, w: 1.1, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 14, color: C.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
  });
  regla(s, y0 + G.ANEXO.length * rowH, M, CW);
  return s;
};

// tabla simple del anexo: encabezado mono y filas con regla fina
function tabla(s, cols, filas, y0, o = {}) {
  const rh = o.rh || 0.6, size = o.size || 17;
  let x = M;
  cols.forEach(([k, w]) => { mono(s, k, { x, y: y0, w, h: 0.32, fontSize: 13, color: C.accent1 }); x += w; });
  filas.forEach((f, i) => {
    const y = y0 + 0.38 + i * rh;
    regla(s, y, M, CW, i ? C.accent5 : C.accent1);
    let xx = M;
    f.forEach((v, j) => {
      const w = cols[j][1];
      if (o.codigo && j === 0) {
        tag(s, v, xx, y + (rh - 0.32) / 2, { w: 0.56, h: 0.32, size: 13, off: true });
        if (o.estados) {
          const st = o.estados[i];
          s.addShape(S.rect, { x: xx + 0.64, y: y + (rh - 0.18) / 2, w: 0.2, h: 0.18, fill: { color: C.background1, transparency: 100 }, line: st === 'crit' ? { color: ROJO, width: 1.75 } : { color: GRIS, width: 1, dashType: 'dash' } });
        }
      } else T(s, v, { x: xx, y, w: w - 0.15, h: rh, fontSize: size, valign: 'middle', bold: !!(o.negrita && o.negrita.includes(j)), color: o.gris && o.gris.includes(j) ? C.text2 : C.text1, lineSpacingMultiple: 0.92 });
      xx += w;
    });
  });
  regla(s, y0 + 0.38 + filas.length * rh, M, CW);
}

D['a-eva'] = () => {
  const s = contenido('PERSPECTIVA FINANCIERA', 'EL EVA,', 'en dos fórmulas equivalentes.');
  noLumine(s, 'EJEMPLO DE CLASE · NO LUMINE', R, Y0 - 0.08, { alignRight: true });
  const lw = 6.6;
  numero(s, 'EVA = NOPAT − CAPITAL × WACC', { x: M, y: Y0 + 0.5, w: lw, h: 0.6, fontSize: TX.cifraS, valign: 'middle' });
  numero(s, [{ text: 'EVA = ', options: {} }, { text: '(ROIC − WACC) × CAPITAL' }], { x: M, y: Y0 + 1.15, w: lw, h: 0.6, fontSize: TX.cifraS, valign: 'middle' });
  regla(s, Y0 + 1.95, M, lw, C.accent1);
  numero(s, '(15% − 12%) × 1.000.000', { x: M, y: Y0 + 2.05, w: lw, h: 0.6, fontSize: TX.cifraS, valign: 'middle', color: C.text2 });
  numero(s, '= US$ 30.000', { x: M, y: Y0 + 2.65, w: lw, h: 0.75, fontSize: TX.cifra, valign: 'middle', color: C.accent1 });
  const rx = M + lw + 0.5, rw = R - rx, c1 = 1.4, c2 = (rw - c1) / 2;
  mono(s, 'VAN Y TIR', { x: rx + c1, y: Y0 + 0.5, w: c2, h: 0.32, fontSize: 14 });
  mono(s, 'EVA', { x: rx + c1 + c2, y: Y0 + 0.5, w: c2, h: 0.32, fontSize: 14, color: C.accent1 });
  [['Evalúa', 'El proyecto completo', 'Cada período'], ['Cuándo', 'Antes de invertir', 'Durante la operación'], ['Con qué', 'Flujos descontados', 'Resultado y capital']].forEach(([k, a, b], i) => {
    const y = Y0 + 0.9 + i * 0.78;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    mono(s, k.toUpperCase(), { x: rx, y, w: c1, h: 0.78, fontSize: 13, valign: 'middle' });
    T(s, a, { x: rx + c1, y, w: c2 - 0.1, h: 0.78, fontSize: 18, color: C.text2, valign: 'middle' });
    T(s, b, { x: rx + c1 + c2, y, w: c2 - 0.1, h: 0.78, fontSize: 18, bold: true, valign: 'middle' });
  });
  regla(s, Y0 + 0.9 + 3 * 0.78, rx, rw);
  return s;
};

D['a-semaforo'] = () => {
  const s = contenido('CMI · REGLAS DEL SEMÁFORO', 'CADA TIPO DE INDICADOR', 'tiene su regla.');
  tabla(s, [['TIPO', 2.9], ['INDICADORES', 3.4], ['VERDE', 3.0], ['ROJO', CW - 9.3]], [
    ['Ratio común', 'C03', '90% o más (ámbar 70% a 89%)', 'Menos de 70%'],
    ['Ratio o cobertura crítica', 'A01 · A02 · P03 · C01 · F03', '100% (o cobertura completa)', 'Bajo 100%'],
    ['Hito', 'A03 · P01 · P02 · C02 · F02', 'Cumplido, con documento', 'Pendiente comprobado (críticos)'],
    ['Valor económico', 'F01', 'EVA mayor que 0', 'EVA de 0 o menos'],
  ], Y0, { rh: 0.82, size: 18, negrita: [0] });
  T(s, [{ text: 'Sin dato, cualquier tipo queda en gris: ', options: { bold: true } }, { text: 'sin medir.', options: { color: C.text2 } }], { x: M, y: Y0 + 0.38 + 4 * 0.82 + 0.2, w: CW, h: 0.45, fontSize: TX.cuerpo, valign: 'middle' });
  return s;
};

const MATRIZ = [
  ['A01', 'Calibraciones registradas ÷ generadas', '100%', 'Trimestral', 'Ingeniería de Calibración', 'sin'],
  ['A02', 'Técnicos habilitados ÷ asignados', '100% antes de abrir', 'Mensual', 'Responsable Técnico', 'sin'],
  ['A03', 'Primer protocolo comparativo completo', '1 protocolo', 'Por piloto', 'Ingeniería de Calibración', 'crit'],
  ['P01', 'Autorización sectorial vigente', '1', 'Por evento', 'Gerente General', 'crit'],
  ['P02', 'Pares modelo-kit homologados', '1 o más antes de vender', 'Trimestral', 'Ingeniería de Calibración', 'crit'],
  ['P03', 'Órdenes con acta completa ÷ cerradas', '100%', 'Por instalación', 'Responsable Técnico', 'sin'],
  ['C01', 'Clientes con informe ÷ intervenidos', '100%', 'Por instalación', 'Comercial y Postventa', 'sin'],
  ['C02', 'Aseguradora y planta de revisión con protocolo', '1 de cada una antes de vender', 'Por evento', 'Gerente General', 'crit'],
  ['C03', 'Consultas de uso intensivo ÷ clasificadas', 'Más de 50% (orientativa)', 'Mensual', 'Comercial y Postventa', 'sin'],
  ['F01', 'EVA = NOPAT − capital × WACC', 'Mayor que 0 en régimen', 'Anual', 'Gerente General', 'sin'],
  ['F02', 'Convenios de financiamiento operativos', '1 o más antes de vender', 'Por evento', 'Comercial y Postventa', 'sin'],
  ['F03', 'Financiamiento disponible ÷ capital de trabajo', '1 o más', 'Mensual al operar', 'Administración y Personas', 'sin'],
];
const matriz = (filas, etiqueta, acento) => () => {
  const s = contenido('CMI · MATRIZ DE INDICADORES', 'LOS 12 INDICADORES:', acento);
  leyendaEstados(s, ['sin', 'crit']);
  tabla(s, [['ID', 1.05], ['INDICADOR', 4.25], ['META', 2.55], ['FRECUENCIA', 1.95], ['RESPONSABLE', CW - 9.8]],
    filas.map(f => f.slice(0, 5)), Y0, { rh: 0.62, size: 16, codigo: true, estados: filas.map(f => f[5]), gris: [3] });
  return s;
};
D['a-matriz1'] = matriz(MATRIZ.slice(0, 6), 'APRENDIZAJE Y PROCESOS', 'aprendizaje y procesos.');
D['a-matriz2'] = matriz(MATRIZ.slice(6), 'CLIENTES Y FINANCIERA', 'clientes y financiera.');

D['a-cmi'] = () => {
  const s = contenido('RETROALIMENTACIÓN · TRES VERSIONES', 'LO QUE SE CONSERVÓ', 'y lo que cambió.');
  tabla(s, [['', 1.9], ['CMI ORIGINAL', 3.3], ['CMI ACTUALIZADO', 3.3], ['SOLEMNE 2', CW - 8.5]], [
    ['Financiera', 'Rentabilidad sobre el costo de capital, con VAN, TIR y WACC', 'Convenios de financiamiento y expansión', 'Rentabilidad sobre el costo de capital, medida con EVA'],
    ['Clientes', 'Convenios gremiales, aseguradoras y penetración', 'Reconocimiento institucional y tipo de consulta', 'Informe individual antes y después al centro'],
    ['Mapa', 'Flechas solo verticales', 'Perspectivas ordenadas, sin relaciones', 'Flechas con mecanismo e indicador'],
  ], Y0, { rh: 1.15, size: 17, negrita: [0, 3], gris: [1, 2] });
  return s;
};

D['a-ahorro'] = () => {
  const s = contenido('PROPUESTA DE VALOR · MEDICIÓN DEL AHORRO', 'EL 20% SOLO SE PRUEBA', 'con un ensayo comparable.');
  T(s, 'Hasta 20% menos bencina en ciudad', { x: M, y: Y0, w: 6.5, h: 0.5, fontSize: TX.cuerpoL, bold: true, valign: 'middle' });
  marca(s, 'est', 'ESTIMACIÓN, NO MEDICIÓN', M + 6.6, Y0 + 0.05);
  mono(s, 'EL ENSAYO DEBE CONTROLAR', { x: M, y: Y0 + 0.85, w: 8, h: 0.3 });
  const items = ['Consumo base del mismo auto', 'Recorrido', 'Forma de conducir', 'Condiciones de la prueba', 'Método de medición'];
  const g = 0.2, w = (CW - 4 * g) / 5, y = Y0 + 1.25, h = 1.35;
  items.forEach((t, i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h, { line: { color: C.accent1, width: 1 } });
    tag(s, String(i + 1), x + 0.18, y + 0.18, { off: true, w: 0.42, h: 0.38, size: 16 });
    T(s, t, { x: x + 0.18, y: y + 0.64, w: w - 0.3, h: 0.66, fontSize: 18, bold: true, valign: 'top', lineSpacingMultiple: 0.95 });
  });
  const by = y + h + 0.3, rh = 0.6;
  [['A03 · Primer protocolo comparativo completo', 'crit'], ['Tolerancia de error aceptable', 'pen']].forEach(([t, st], i) => {
    const yy = by + i * rh;
    regla(s, yy, M, CW, i ? C.accent5 : C.accent1);
    T(s, t, { x: M, y: yy, w: CW - 3.5, h: rh, fontSize: TX.cuerpo, valign: 'middle' });
    if (st === 'crit') estado(s, 'crit', R, yy + 0.1, { alignRight: true });
    else marca(s, 'pen', 'POR DEFINIR', R, yy + 0.1, { alignRight: true });
  });
  return s;
};

D['a-apoyo'] = () => {
  const s = contenido('CLIENTES · APOYO', 'CONVENIOS Y FOCO COMERCIAL', 'apoyan la promesa.');
  leyendaEstados(s, ['sin', 'crit']);
  const g = 0.4, w = (CW - g) / 2, y = Y0, h = 3.5;
  [['C02 · CONFIANZA', 'Protocolo con al menos una aseguradora y una planta de revisión técnica', 'Antes de vender', 'crit'],
    ['C03 · FOCO COMERCIAL', 'Más de 50% de consultas de uso intensivo', 'Sin excluir particulares ni flotas', 'sin']].forEach(([k, t, a, st], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h, { line: borde(st) });
    mono(s, k, { x: x + 0.3, y: y + 0.26, w: w - 0.6, h: 0.3, fontSize: 14, color: C.accent1 });
    T(s, t, { x: x + 0.3, y: y + 0.72, w: w - 0.6, h: 1.5, fontSize: TX.sub, bold: true, valign: 'top' });
    regla(s, y + h - 0.95, x + 0.3, w - 0.6);
    T(s, a, { x: x + 0.3, y: y + h - 0.85, w: w - 0.6, h: 0.6, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
  });
  marca(s, 'sup', 'META ORIENTATIVA', R - 0.3, Y0 + 0.2, { alignRight: true, size: 12, h: 0.36 });
  return s;
};

D['a-financia'] = () => {
  const s = contenido('FINANCIERA · APOYO', 'EL FINANCIAMIENTO', 'tiene metas, pero aún no cifras.');
  marca(s, 'pen', 'PLAN FINANCIERO POR CONFIRMAR', R, Y0 - 0.08, { alignRight: true });
  const g = 0.4, w = (CW - g) / 2, y = Y0 + 0.5, h = 3.2;
  [['F02 · PAGO DEL CLIENTE', 'Al menos un convenio de financiamiento antes de la primera venta', 'El financiamiento verde para el kit no está confirmado'],
    ['F03 · CAPITAL DE TRABAJO', 'Financiamiento disponible igual o mayor que el capital de trabajo requerido', 'Sin asumir aportes que no existen']].forEach(([k, t, a], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h, { line: borde('sin') });
    mono(s, k, { x: x + 0.3, y: y + 0.26, w: w - 0.6, h: 0.3, fontSize: 14, color: C.accent1 });
    T(s, t, { x: x + 0.3, y: y + 0.72, w: w - 0.6, h: 1.4, fontSize: TX.sub, bold: true, valign: 'top' });
    regla(s, y + h - 0.95, x + 0.3, w - 0.6);
    T(s, a, { x: x + 0.3, y: y + h - 0.85, w: w - 0.6, h: 0.6, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
  });
  return s;
};

D['a-naturaleza'] = () => {
  const s = contenido('TRANSPARENCIA · ORIGEN DE CADA CIFRA', 'DATO, DISEÑO O EJEMPLO:', 'cada cifra dice qué es.');
  const g = 0.35, w = (CW - 2 * g) / 3, y = Y0, h = YF - Y0 - 0.06;
  [['DATO', ['Lumine es preoperativa', 'Ley N° 21.793 sin reglamento', 'Ninguna venta ni homologación'], { color: C.accent1, width: 1.25 }],
    ['DISEÑO O ESTIMACIÓN', ['Metas de 100% y umbrales 90/70', 'C03: más de 50%', 'Hasta 20% menos bencina'], { color: GRIS, width: 1, dashType: 'dash' }],
    ['EJEMPLO, NO LUMINE', ['EVA de US$30.000 (módulo 4)', 'Caso 8 de 10 informes'], { color: C.text1, width: 1.25, dashType: 'dash' }]].forEach(([k, items, ln], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h, { line: ln });
    mono(s, k, { x: x + 0.3, y: y + 0.26, w: w - 0.6, h: 0.3, fontSize: 14, color: ln.color === C.accent1 ? C.accent1 : C.text1, bold: true });
    items.forEach((t, j) => {
      const yy = y + 0.8 + j * 0.95;
      regla(s, yy, x + 0.3, w - 0.6);
      T(s, t, { x: x + 0.3, y: yy + 0.08, w: w - 0.6, h: 0.8, fontSize: TX.cuerpo, valign: 'middle' });
    });
  });
  return s;
};

// ---------- orden de la exposición (guion.js), notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · ${G.mmss(G.segundos(x.texto))} a ${G.PALABRAS_POR_MINUTO} palabras por minuto (${G.palabras(x.texto)} palabras)\n\n${x.texto}`;
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
