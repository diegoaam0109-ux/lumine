// Avance 2 del TIG = Solemne 2 · Control de Gestión (ICMA901, UNAB) · Lumine Motors · 17-11-2026
// Contenidos evaluados: formulación OVA, ejes estratégicos, mapa y CMI. 10 láminas + portada (unos 12 minutos), bibliografía y anexo.
// Concepto visual del TIG final: «cuaderno de ingeniería». Base de datos al 12-11-2026. Generado por armar.sh: no editar a mano.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {};
const OUT = process.argv[2] || 'Lumine_Avance2.pptx';
const A = f => path.join(__dirname, 'assets', 'claro', f);
const AQ = f => path.join(__dirname, 'assets', f);

// ---------- tema ----------
const [F_TIT, F_CON, F_BODY, F_MONO, F_SER] = ['Archivo SemiExpanded ExtraBold', 'Archivo Condensed', 'Figtree', 'IBM Plex Mono', 'Instrument Serif'];
const THEME = {
  name: 'Lumine cuaderno',
  colors: {
    dk1: '1F2A30', lt1: 'FFFFFF', dk2: '5F6B70', lt2: 'FAFAF7',
    accent1: '1E9BD7', accent2: '0A6F9E', accent3: 'C9D6DE', accent4: 'EAF4FA', accent5: '8FA3AE', accent6: 'E8EEF1',
    hlink: '0A6F9E', folHlink: '5F6B70',
  },
};
const K = { tx: '1F2A30', gris: '5F6B70', cel: '1E9BD7', azul: '0A6F9E', linea: 'C9D6DE', suave: 'EAF4FA', papel: 'FAFAF7', blanco: 'FFFFFF', medio: '8FA3AE' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,333 × 7,5 in
pres.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo';
pres.company = 'Lumine Motors';
pres.title = 'TIG · Avance 2 · Solemne 2 · Lumine Motors';
pres.subject = 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const S = pres.ShapeType;

const W = 13.333, M = 0.75, R = W - M, CW = R - M;
const Y0 = 2.2, YF = 6.55;

// ---------- piezas ----------
function T(s, text, o = {}) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: F_BODY, fontSize: 20, color: K.tx, valign: 'top', lang: 'es-CL', paraSpaceAfter: 0 }, o));
}
const mono = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_MONO, fontSize: 13, color: K.gris, charSpacing: 1 }, o));
const serif = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_SER, italic: true, fontSize: 22, color: K.azul }, o));
const num = (s, text, o = {}) => T(s, text, Object.assign({ fontFace: F_CON, bold: true, fontSize: 48, color: K.tx, valign: 'bottom' }, o));
const linea = (s, x, y, w, h, color = K.tx, width = 1, o = {}) => s.addShape(S.line, Object.assign({ x, y, w, h, line: { color, width } }, o));
function flecha(s, x1, y1, x2, y2, color = K.cel, width = 1.75, o = {}) {
  const fh = x2 < x1, fv = y2 < y1;
  s.addShape(S.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: fh, flipV: fv,
    line: { color, width, endArrowType: 'triangle', beginArrowType: o.doble ? 'triangle' : undefined, dashType: o.dash || 'solid' } });
}
function caja(s, x, y, w, h, o = {}) {
  s.addShape(S.rect, Object.assign({ x, y, w, h, fill: { color: K.blanco }, line: { color: K.tx, width: 1 } }, o));
}
const cajaAzul = (s, x, y, w, h) => caja(s, x, y, w, h, { fill: { color: K.suave }, line: { color: K.cel, width: 1.75 } });
// rótulo de naturaleza del dato (estimación, supuesto, pendiente): marco a trazos, texto mono
const anchoMono = (t, size) => 0.36 + t.length * size * 0.68 / 72;
function marca(s, text, x, y, o = {}) {
  const size = o.size || 12, h = o.h || 0.34, w = o.w || anchoMono(text, size), xx = o.derecha ? x - w : x;
  s.addShape(S.rect, { x: xx, y, w, h, fill: { color: K.blanco }, line: { color: o.color || K.gris, width: 1, dashType: o.dash || 'dash' } });
  mono(s, text, { x: xx, y, w, h, fontSize: size, color: o.color || K.gris, bold: true, align: 'center', valign: 'middle', charSpacing: 0.5 });
  return w;
}
// foto pegada en el cuaderno: marco blanco, sombra suave y rótulo
function foto(s, archivo, x, y, w, h, rotulo = 'IMAGEN ILUSTRATIVA') {
  s.addShape(S.rect, { x, y, w, h, fill: { color: K.blanco }, line: { color: K.linea, width: 0.75 }, shadow: { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: 0.14 } });
  s.addImage({ path: A(archivo), x: x + 0.08, y: y + 0.08, w: w - 0.16, h: h - 0.16, altText: rotulo });
  mono(s, rotulo, { x, y: y + h + 0.05, w, h: 0.26, fontSize: 11, align: 'right' });
}
// cota: línea de medida con flechas en ambos extremos y su valor encima
function cota(s, x1, x2, y, texto, o = {}) {
  linea(s, x1, y - 0.14, 0, 0.28, o.color || K.azul, 1); linea(s, x2, y - 0.14, 0, 0.28, o.color || K.azul, 1);
  flecha(s, x1, y, x2, y, o.color || K.azul, 1.25, { doble: true });
  mono(s, texto, { x: x1, y: y - 0.42, w: x2 - x1, h: 0.28, fontSize: o.size || 14, bold: true, color: o.color || K.azul, align: 'center' });
}
// regla graduada para las matrices de David (1 a 4, promedio 2,5)
function regla(s, x, y, w, marcas, o = {}) {
  const v0 = 1, v1 = 4, X = v => x + (v - v0) / (v1 - v0) * w;
  linea(s, x, y, w, 0, K.tx, 1.5);
  for (let v = v0; v <= v1 + 1e-9; v += 0.25) {
    const may = Math.abs(v * 2 - Math.round(v * 2)) < 1e-9;
    linea(s, X(v), y, 0, may ? 0.2 : 0.1, K.tx, may ? 1.25 : 0.75);
    if (may) mono(s, v.toFixed(1).replace('.', ','), { x: X(v) - 0.3, y: y + 0.22, w: 0.6, h: 0.26, fontSize: 12, align: 'center', color: K.gris });
  }
  linea(s, X(2.5), y - (o.alto || 1.1), 0, (o.alto || 1.1) + 0.2, K.medio, 1.25, { line: { color: K.medio, width: 1.25, dashType: 'dash' } });
  mono(s, 'PROMEDIO', { x: X(2.5) - 0.6, y: y + 0.44, w: 1.2, h: 0.22, fontSize: 11, color: K.gris, align: 'center' });
  marcas.forEach(m => {
    const xx = X(m.v), col = m.color || K.tx;
    s.addShape(S.triangle, { x: xx - 0.12, y: y - 0.26, w: 0.24, h: 0.22, rotate: 180, fill: { color: m.hueco ? K.blanco : col }, line: { color: col, width: 1.25, dashType: m.dash || 'solid' } });
    const lx = m.izq ? xx - 2.2 : xx - 1.1;
    num(s, m.n, { x: lx, y: y - 0.95 - (m.alto || 0), w: 2.2, h: 0.62, fontSize: m.size || 34, color: col, align: m.izq ? 'right' : 'center' });
    mono(s, m.t, { x: lx, y: y - 0.33 - 0.03 - (m.alto || 0) - 0.62 - 0.26, w: 2.2, h: 0.26, fontSize: 12, color: col, bold: true, align: m.izq ? 'right' : 'center' });
  });
}
const fuente = (s, t) => { if (t.length > 84) console.warn('Fuente en dos líneas:', t); mono(s, t, { x: M, y: 6.78, w: 8.2, h: 0.3, fontSize: 11, valign: 'middle', charSpacing: 0 }); };

// ---------- marcos ----------
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { path: A('papel.png') },
  objects: [],
});
const CAJ_X = 9.05, CAJ_Y = 6.73, CAJ_H = 0.47;
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { path: A('papel.png') },
  margin: [0.5, M, 0.6, M],
  objects: [
    { rect: { x: CAJ_X, y: CAJ_Y, w: 13.03 - CAJ_X, h: CAJ_H, fill: { color: K.blanco }, line: { color: K.tx, width: 1 } } },
    { line: { x: CAJ_X + 1.45, y: CAJ_Y, w: 0, h: CAJ_H, line: { color: K.tx, width: 1 } } },
    { line: { x: CAJ_X + 3.05, y: CAJ_Y, w: 0, h: CAJ_H, line: { color: K.tx, width: 1 } } },
    { text: { text: 'LUMINE MOTORS', options: { x: CAJ_X, y: CAJ_Y, w: 1.45, h: CAJ_H, fontFace: F_MONO, fontSize: 11, bold: true, color: K.tx, align: 'center', valign: 'middle', margin: 0 } } },
    { text: { text: 'TIG · ICMA901 · UNAB', options: { x: CAJ_X + 1.45, y: CAJ_Y, w: 1.6, h: CAJ_H, fontFace: F_MONO, fontSize: 11, color: K.gris, align: 'center', valign: 'middle', margin: 0 } } },
    { text: { text: 'LÁM.', options: { x: CAJ_X + 3.1, y: CAJ_Y, w: 0.45, h: CAJ_H, fontFace: F_MONO, fontSize: 11, color: K.gris, valign: 'middle', margin: 0 } } },
    { placeholder: { options: { name: 'etiqueta', type: 'body', x: M, y: 0.52, w: 9.0, h: 0.3, fontFace: F_MONO, fontSize: 13, color: K.azul, charSpacing: 1.5, margin: 0, valign: 'middle', bold: true }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.86, w: CW, h: 1.2, fontFace: F_TIT, fontSize: 32, color: K.tx, align: 'left', margin: 0, valign: 'top', lineSpacingMultiple: 0.9 }, text: '' } },
  ],
  slideNumber: { x: CAJ_X + 3.5, y: CAJ_Y + 0.08, w: 0.45, h: 0.32, fontFace: F_MONO, fontSize: 13, bold: true, color: K.azul, align: 'center', margin: 0 },
});

let N = 0, INDICE_ANEXO = null, ANEXO_ACTUAL = null;
function contenido(etq, titulo, acento, o = {}) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SECCION });
  s.addText(etq, { placeholder: 'etiqueta' });
  const runs = [{ text: titulo, options: { breakLine: !!acento && !o.unaLinea } }];
  if (acento) runs.push({ text: (o.unaLinea ? ' ' : '') + acento, options: { fontFace: F_SER, italic: true, color: K.cel, fontSize: 38 } });
  s.addText(runs, { placeholder: 'title' });
  if (ANEXO_ACTUAL) {
    s.addText('← ÍNDICE DEL ANEXO', { x: 9.6, y: 0.52, w: R - 9.6, h: 0.3, align: 'right', valign: 'middle', fontFace: F_MONO, fontSize: 12, bold: true, color: K.azul, margin: 0, hyperlink: { slide: INDICE_ANEXO, tooltip: 'Volver al índice del anexo' } });
  }
  return s;
}
let SECCION = 'Portada';
const abrirSeccion = t => { SECCION = t; pres.addSection({ title: t }); };

// tabla simple sobre el papel (encabezado celeste, filas blancas)
function tabla(s, cols, filas, y, o = {}) {
  const size = o.size || 14, x = o.x || M;
  const head = cols.map(([k]) => ({ text: k, options: { bold: true, color: K.azul, fill: { color: K.suave }, fontFace: F_MONO, fontSize: Math.max(11, size - 2) } }));
  const body = filas.map((f, i) => f.map((v, j) => ({ text: String(v), options: { bold: o.negrita && o.negrita(i, j), fill: { color: o.destacar && o.destacar(i) ? K.suave : K.blanco }, align: (o.centro || []).includes(j) ? 'center' : 'left' } })));
  s.addTable([head, ...body], { x, y, w: cols.reduce((a, c) => a + c[1], 0), colW: cols.map(c => c[1]), fontFace: F_BODY, fontSize: size, color: K.tx,
    border: { type: 'solid', pt: 0.75, color: K.linea }, margin: [0.03, 0.08, 0.03, 0.08], valign: 'middle', rowH: o.rh || 0.32, autoPage: false });
}

// ===================================================================== DIEGO
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SECCION });
  s.addImage({ path: A('unab-facultad-economia-negocios.png'), x: M, y: 0.55, w: 1.75, h: 1.75 * 309 / 899, altText: 'Facultad de Economía y Negocios, Universidad Andrés Bello' });
  mono(s, 'CONTROL DE GESTIÓN · ICMA901 · SECCIÓN 500 · NRC 4118', { x: M, y: 1.38, w: 6.5, h: 0.28, fontSize: 12 });
  s.addImage({ path: A('lumine-logo.png'), x: M, y: 1.95, w: 1.1, h: 1.1 * 390 / 530, altText: 'Lumine Motors' });
  T(s, 'LUMINE MOTORS', { x: M, y: 2.85, w: 6.0, h: 0.75, fontFace: F_TIT, fontSize: 38, valign: 'middle' });
  serif(s, 'de la estrategia al Cuadro de Mando Integral', { x: M, y: 3.6, w: 5.6, h: 1.25, fontSize: 26, color: K.cel });
  mono(s, 'TIG · AVANCE 2 · SOLEMNE 2', { x: M, y: 5.0, w: 5, h: 0.3, fontSize: 14, bold: true, color: K.azul });
  T(s, 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', { x: M, y: 5.35, w: 5.8, h: 0.36, fontSize: 17 });
  T(s, 'Profesor Leonardo Lizana Contreras', { x: M, y: 5.75, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
  T(s, 'Santiago, 17 de noviembre de 2026', { x: M, y: 6.07, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
  const ix = 6.55, iy = 1.75, iw = 6.35, ih = iw * 752 / 1344;
  s.addImage({ path: A('auto-rayos-x.jpg'), x: ix, y: iy, w: iw, h: ih, altText: 'Auto con el kit de hibridación a la vista' });
  mono(s, 'IMAGEN ILUSTRATIVA', { x: ix, y: iy - 0.3, w: iw, h: 0.26, fontSize: 11, align: 'right' });
  const P = (nx, ny) => [ix + nx * iw, iy + ny * ih];
  const pieza = (nx, ny, yl, t1, t2, w = 2.0, izq = false) => {
    const [px, py] = P(nx, ny);
    s.addShape(S.ellipse, { x: px - 0.07, y: py - 0.07, w: 0.14, h: 0.14, fill: { color: K.blanco }, line: { color: K.azul, width: 1.5 } });
    linea(s, px, Math.min(py, yl), 0, Math.abs(yl - py), K.azul, 1);
    const bx = izq ? px - 0.05 - w : px + 0.05, al = izq ? 'right' : 'left';
    s.addShape(S.rect, { x: bx, y: yl - 0.04, w, h: 0.58, fill: { color: K.blanco, transparency: 8 }, line: { type: 'none' } });
    mono(s, t1, { x: bx + 0.05, y: yl - 0.02, w: w - 0.1, h: 0.26, fontSize: 12, bold: true, color: K.azul, align: al, charSpacing: 0.5 });
    serif(s, t2, { x: bx + 0.05, y: yl + 0.22, w: w - 0.1, h: 0.3, fontSize: 15, align: al });
  };
  pieza(0.25, 0.47, 1.75, 'MOTOR ORIGINAL', 'queda intacto');
  pieza(0.42, 0.53, 2.4, 'UNIDAD DE CONTROL', 'decide cuándo asistir');
  pieza(0.47, 0.61, 5.55, 'BATERÍA', 'se carga al frenar', 1.75, true);
  pieza(0.70, 0.60, 5.55, 'DOS MOTORES', 'en las ruedas traseras', 1.95);
  return s;
};

D.contexto = () => {
  const s = contenido('01 · CONTEXTO', 'UNA NECESIDAD CLARA', 'y una restricción legal.');
  mono(s, 'BENCINA 93 · REGIÓN METROPOLITANA · $ POR LITRO', { x: M, y: Y0 + 0.05, w: 6, h: 0.28, fontSize: 13 });
  num(s, '$1.168,9', { x: M, y: Y0 + 0.4, w: 2.7, h: 0.8, fontSize: 44, color: K.gris });
  num(s, '$1.538,9', { x: M + 3.05, y: Y0 + 0.3, w: 3.0, h: 0.9, fontSize: 54 });
  mono(s, 'ANTES DEL ALZA', { x: M, y: Y0 + 1.25, w: 2.4, h: 0.26, fontSize: 12 });
  mono(s, 'MARZO DE 2026', { x: M + 3.05, y: Y0 + 1.25, w: 2.8, h: 0.26, fontSize: 12, color: K.tx, bold: true });
  cota(s, M + 0.1, M + 5.6, Y0 + 1.95, '+ $370 POR LITRO', { size: 16 });
  num(s, '3,5', { x: M, y: Y0 + 2.25, w: 1.5, h: 1.0, fontSize: 64, color: K.cel });
  T(s, 'autos usados transferidos por cada nuevo; el gas solo admite autos de hasta 7 años', { x: M + 1.6, y: Y0 + 2.4, w: 4.4, h: 0.9, fontSize: 18, valign: 'middle' });
  serif(s, 'El kit se suma al auto sin tocar su motor.', { x: M, y: Y0 + 3.5, w: 5.9, h: 0.6, fontSize: 22 });
  // la restricción: tres pasos
  const xR = 7.2, wR = R - xR;
  mono(s, 'LA VÍA REGULATORIA', { x: xR, y: Y0 + 0.05, w: wR, h: 0.28, bold: true, color: K.azul });
  const paso = (y, h, t1, t2, tipo) => {
    if (tipo === 'lumine') cajaAzul(s, xR, y, wR, h);
    else caja(s, xR, y, wR, h, tipo === 'externa' ? { line: { color: K.tx, width: 1.5, dashType: 'dash' } } : {});
    T(s, [{ text: t1, options: { bold: true, breakLine: true } }, { text: t2, options: { color: K.gris, fontSize: 15 } }], { x: xR + 0.18, y: y + 0.06, w: wR - 0.36, h: h - 0.12, fontSize: 17, valign: 'middle' });
  };
  paso(Y0 + 0.45, 0.95, 'Reglamento en trámite (Ley N° 21.793)', 'regula la conversión a eléctrico; no alcanza al kit', 'normal');
  flecha(s, xR + wR / 2, Y0 + 1.42, xR + wR / 2, Y0 + 1.7, K.tx, 1.5);
  paso(Y0 + 1.72, 0.95, 'Proyecto experimental (D.S. N° 67)', 'circular y medir, sin vender · lo controla Lumine: P1', 'lumine');
  flecha(s, xR + wR / 2, Y0 + 2.69, xR + wR / 2, Y0 + 2.97, K.tx, 1.5);
  paso(Y0 + 2.99, 0.95, 'Norma propia', 'permite vender · condición externa', 'externa');
  marca(s, 'SEGÚN EL SECRETARIO TÉCNICO DEL 3CV', xR, Y0 + 4.1, { dash: 'sysDot' });
  fuente(s, 'Garretón (2026) · CNN Chile (2026) · D. S. N° 55 (1988) · MTT (2021)');
  return s;
};

D.ova = () => {
  const s = contenido('02 · FORMULACIÓN · OVA', 'OBJETIVO, VENTAJA Y ALCANCE:', 'diferenciación enfocada.');
  const g = 0.25, w = (CW - 2 * g) / 3, y = Y0, h = 3.55;
  const col = (i, k, cuerpo) => { const x = M + i * (w + g); caja(s, x, y, w, h); s.addShape(S.rect, { x, y, w, h: 0.08, fill: { color: K.azul }, line: { type: 'none' } }); mono(s, k, { x: x + 0.18, y: y + 0.18, w: w - 0.36, h: 0.28, bold: true, color: K.azul, fontSize: 14 }); cuerpo(x + 0.18, w - 0.36); };
  col(0, 'OBJETIVO · QUÉ Y CUÁNDO', (x, ww) => {
    num(s, '2.934', { x, y: y + 0.5, w: ww, h: 0.85, fontSize: 52, color: K.cel, valign: 'top' });
    T(s, 'instalaciones acumuladas con ahorro verificado y 16 talleres en la red, en 2032', { x, y: y + 1.4, w: ww, h: 1.0, fontSize: 17 });
    T(s, 'con retorno superior al costo del capital', { x, y: y + 2.4, w: ww, h: 0.6, fontSize: 16, bold: true });
    marca(s, 'META DEL PLAN · PROVISIONAL', x, y + 3.05, { dash: 'sysDot', size: 11, h: 0.3 });
  });
  col(1, 'VENTAJA · POR QUÉ LUMINE', (x, ww) => {
    serif(s, '«El mismo auto, con un ahorro medido y una calibración para su modelo.»', { x, y: y + 0.5, w: ww, h: 1.15, fontSize: 21, color: K.tx });
    T(s, [{ text: 'Existe: ', options: { bold: true, color: K.azul } }, { text: 'estimador y Habilita (prototipos); vía identificada', options: { breakLine: true } },
      { text: 'Por desarrollar: ', options: { bold: true, color: K.azul } }, { text: 'biblioteca, ahorro medido y autorizaciones' }], { x, y: y + 1.75, w: ww, h: 1.65, fontSize: 16, paraSpaceAfter: 6 });
  });
  col(2, 'ALCANCE · DÓNDE COMPETIMOS', (x, ww) => {
    num(s, '73.908', { x, y: y + 0.5, w: ww, h: 0.85, fontSize: 52, color: K.cel, valign: 'top' });
    T(s, 'vehículos de uso laboral en la RM: taxis, colectivos y autos de aplicación de jornada completa', { x, y: y + 1.4, w: ww, h: 1.1, fontSize: 17 });
    T(s, 'Solo modelos calibrados; regiones por la red, desde el año 3', { x, y: y + 2.5, w: ww, h: 0.8, fontSize: 16, bold: true });
  });
  T(s, [{ text: 'Renunciamos a: ', options: { bold: true } }, { text: 'competir por precio contra el gas · el bajo kilometraje · la inmediatez' }], { x: M, y: y + h + 0.15, w: CW, h: 0.5, fontSize: 17, valign: 'middle' });
  fuente(s, 'Porter (1996) · Plan del equipo, escenario central al 12-11-2026');
  return s;
};

D.ejes = () => {
  const s = contenido('03 · EJES ESTRATÉGICOS', 'TRES EJES,', 'uno por cada brecha.');
  const EJ = [
    ['1F2A30', 'EJE 1 · HABILITACIÓN FORMAL', 'Brecha legal', ['01 Proyecto experimental', '02 Autorización por par', '03 Aseguradoras y plantas'], 'P1 · P2 · P6'],
    ['1E9BD7', 'EJE 2 · ACCESO COMERCIAL', 'Inercia y pago', ['04 Captar el alto kilometraje', '05 Pago en cuotas con un financista'], 'C4 · P6'],
    ['7A97AA', 'EJE 3 · CONOCIMIENTO Y ESCALA', 'Ahorro sin medir', ['06 Medir el ahorro', '07 Retener el conocimiento', '08 Crecer con la red'], 'A1–A4 · P4 · P5 · C2 · F3'],
  ];
  const g = 0.25, w = (CW - 2 * g) / 3, y = Y0, h = 3.45;
  EJ.forEach(([c, k, br, objs, cmi], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h);
    s.addShape(S.rect, { x, y, w, h: 0.14, fill: { color: c }, line: { type: 'none' } });
    mono(s, k, { x: x + 0.18, y: y + 0.25, w: w - 0.3, h: 0.28, fontSize: 13, bold: true, color: K.azul, charSpacing: 0.5 });
    T(s, [{ text: 'BRECHA  ', options: { fontFace: F_MONO, fontSize: 12, color: K.gris, bold: true } }, { text: br, options: { bold: true } }], { x: x + 0.18, y: y + 0.6, w: w - 0.3, h: 0.45, fontSize: 18, valign: 'middle' });
    T(s, objs.map((t, n) => ({ text: t, options: { breakLine: n < objs.length - 1 } })), { x: x + 0.18, y: y + 1.15, w: w - 0.3, h: 1.35, fontSize: 16, paraSpaceAfter: 4 });
    linea(s, x + 0.18, y + 2.6, w - 0.36, 0, K.linea, 1);
    mono(s, 'OBJETIVOS DEL CMI', { x: x + 0.18, y: y + 2.7, w: w - 0.3, h: 0.24, fontSize: 11, bold: true });
    mono(s, cmi, { x: x + 0.18, y: y + 2.95, w: w - 0.3, h: 0.34, fontSize: 15, bold: true, color: K.tx, charSpacing: 0 });
  });
  T(s, [{ text: '8 objetivos de los ejes → 17 en el CMI. ', options: { bold: true } }, { text: 'P3, C1, C3 y F2 vienen de la propuesta de valor; F1, de los fines.', options: { color: K.gris } }], { x: M, y: y + h + 0.15, w: CW, h: 0.5, fontSize: 16, valign: 'middle' });
  fuente(s, 'Kaplan y Norton (2008) · Tabla de objetivos: informe, punto 8');
  return s;
};

// ===================================================================== BENJAMÍN
D.mapa = () => {
  const s = contenido('04 · MAPA ESTRATÉGICO', '17 OBJETIVOS Y 21 RELACIONES', null);
  const w = 11.75, h = w * 842 / 2048;
  s.addImage({ path: A('mapa.png'), x: (W - w) / 2, y: 1.55, w, h, altText: 'Mapa estratégico de Lumine Motors' });
  fuente(s, 'Kaplan y Norton (2008) · 7 habilitantes · 2 externas · 12 hipótesis');
  return s;
};

D.cadena = () => {
  const s = contenido('05 · UNA CADENA DEL MAPA', 'LA CADENA DE EVIDENCIA', 'sostiene la diferenciación.');
  const N = [['A3', 'Protocolo de medición', 'Protocolo aprobado'], ['P4', 'Expediente y reporte', 'Expediente completo'], ['C2', 'Ahorro cumplido', 'Ahorro ≥ mínimo informado'], ['C3', 'Confianza', 'Confianza 4 o 5'], ['C4', 'Conversión', 'Instalaciones ÷ cotizaciones']];
  const REL = [['R08', 'hab'], ['R10', 'hab'], ['R12', 'hip'], ['R14', 'hip']];
  const nw = 1.95, gap = (CW - 5 * nw) / 4, ny = Y0 + 0.1, nh = 1.0;
  mono(s, 'DATO QUE LO REVISA', { x: M, y: ny + nh + 0.2, w: 3, h: 0.24, fontSize: 11, bold: true });
  N.forEach(([c, t, d], i) => {
    const x = M + i * (nw + gap);
    if (c === 'C2') cajaAzul(s, x, ny, nw, nh); else caja(s, x, ny, nw, nh);
    mono(s, c, { x: x + 0.12, y: ny + 0.08, w: 0.8, h: 0.3, fontSize: 15, bold: true, color: K.azul });
    T(s, t, { x: x + 0.12, y: ny + 0.38, w: nw - 0.24, h: 0.55, fontSize: 16, bold: true, valign: 'middle' });
    T(s, d, { x, y: ny + nh + 0.48, w: nw, h: 0.55, fontSize: 14, color: K.gris });
    if (i < 4) {
      const [r, tipo] = REL[i], x1 = x + nw + 0.04, x2 = x + nw + gap - 0.04;
      flecha(s, x1, ny + nh / 2, x2, ny + nh / 2, tipo === 'hab' ? K.azul : K.cel, 2.25, { dash: tipo === 'hab' ? 'solid' : 'dash' });
      mono(s, r, { x: x1 - 0.1, y: ny + nh / 2 - 0.36, w: gap + 0.12, h: 0.24, fontSize: 11, bold: true, align: 'center', color: tipo === 'hab' ? K.azul : K.cel, charSpacing: 0 });
    }
  });
  const yb = Y0 + 2.35, bw = (CW - 0.3) / 2, bh = 1.45;
  mono(s, 'SI FALLA, QUÉ DECIDIMOS', { x: M, y: yb - 0.32, w: 5, h: 0.26, fontSize: 12, bold: true, color: K.azul });
  [['C2 bajo la meta', 'Corregir el intervalo de ahorro que se informa al cotizar antes de aumentar la promoción'], ['C2 cumple y C4 no sube', 'La barrera es el pago: revisar los convenios con el financista (P6, R15)']].forEach(([a, b], i) => {
    const x = M + i * (bw + 0.3);
    caja(s, x, yb, bw, bh);
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b }], { x: x + 0.18, y: yb + 0.1, w: bw - 0.36, h: bh - 0.2, fontSize: 17, valign: 'middle' });
  });
  serif(s, 'Clasificar una relación no prueba que exista: las hipótesis se revisan con los clientes del primer trimestre.', { x: M, y: yb + bh + 0.12, w: CW, h: 0.6, fontSize: 19 });
  fuente(s, 'Kaplan y Norton (2008) · Las 21 relaciones: anexo A8');
  return s;
};

const COLS_CMI = [['OBJ.', 0.6], ['INDICADOR', 4.15], ['META', 2.5], ['RESPONSABLE', 2.25], ['TIPO', 1.05], ['INICIATIVA', CW - 10.55]];
const tablaCMIp = (s, filas, y, dest) => tabla(s, COLS_CMI, filas, y, { size: 13, rh: 0.43, centro: [0, 5], negrita: (i, j) => j === 0, destacar: dest });
D.cmi1 = () => {
  const s = contenido('06 · CMI · APRENDIZAJE Y PROCESOS', 'LA BASE DEL TABLERO:', 'reglas e hitos', { unaLinea: true });
  const F = [
    ['A1', 'Calibraciones protegidas ÷ generadas', '100% antes de reutilizar', 'Ing. de Calibración', 'Crítico', 'FO1, DA3'],
    ['A2', 'Técnicos con validación vigente ÷ asignados', '100% en tareas críticas', 'Responsable Técnico', 'Crítico', 'FA2'],
    ['A3', 'Protocolo de medición aprobado', 'Antes del 1.er vehículo de prueba', 'Ing. de Calibración', 'Hito', 'DO1'],
    ['A4', 'Competencias validadas ÷ definidas', '100% antes de la red', 'Responsable Técnico', 'Creciente', 'FO3'],
    ['P1', 'Proyecto experimental: 3 entregables', 'Solicitud: 1.er trim. 2027', 'Gerencia General', 'Hito', 'FO2, DO2'],
    ['P2', 'Taller y primer par kit-modelo autorizados', 'Antes de vender ese modelo', 'Ing. de Calibración', 'Hito', 'FO1, DO2'],
    ['P3', 'Órdenes con control completo ÷ cerradas', '100%', 'Responsable Técnico', 'Crítico', 'Checklist'],
    ['P4', 'Servicios con expediente y reporte ÷ exigibles', '100%', 'Ing. de Calibración', 'Crítico', 'DO1'],
    ['P5', 'Paquete de incorporación a la red validado', 'Antes del 1.er taller de la red', 'Gerencia General', 'Hito', 'FO3'],
    ['P6', 'Convenios: aseguradora, planta y financista', 'Los 3 antes de la 1.ª venta', 'Gerencia General', 'Hito', 'DO3, DA2'],
  ];
  tablaCMIp(s, F, 1.72, i => i === 4);
  fuente(s, 'Kaplan y Norton (2008) · Iniciativa = cruce del FODA (anexo A7)');
  return s;
};
D.cmi2 = () => {
  const s = contenido('07 · CMI · CLIENTES Y FINANZAS', 'LOS RESULTADOS:', 'cliente y finanzas', { unaLinea: true });
  const F = [
    ['C1', 'Entregas conformes ÷ entregas', '100%', 'Responsable Técnico', 'Crítico', 'Acta'],
    ['C2', 'Clientes con ahorro ≥ mínimo ÷ medidos', '80% · provisional', 'Comercial y Postventa', 'Creciente', 'DO1'],
    ['C3', 'Confianza 4 o 5 ÷ encuestados · reclamos por cada 100', '80% · provisional', 'Comercial y Postventa', 'Creciente', 'DA2'],
    ['C4', 'Instalaciones ÷ cotizaciones de modelos calibrados (trimestre)', '30% · provisional', 'Comercial y Postventa', 'Creciente', 'FO1, FA1'],
    ['F1', 'Antes de invertir: VAN del plan. Operando: retorno − costo del capital', 'VAN > 0 · positivo desde el año 3', 'Gerencia General', 'Hito y creciente', 'Plan Fin.'],
    ['F2', 'Margen por servicio: precio neto − costo directo', 'Positivo; kit bajo $2,87 M y $3,21 M', 'Gerencia General', 'Creciente', 'DA1'],
    ['F3', 'Talleres con VAN incremental > 0 ÷ incorporados', '100%', 'Gerencia General', 'Crítico', 'FO3'],
  ];
  tablaCMIp(s, F, 1.72, i => i === 1);
  const y = 5.95;
  T(s, [{ text: 'C2 mide el resultado para el cliente; ', options: { bold: true } }, { text: 'el reporte que lo respalda se exige en P4.' }], { x: M, y, w: 7.0, h: 0.42, fontSize: 16, valign: 'middle' });
  marca(s, 'PROVISIONAL: SE CONFIRMA CON EL DATO · A10', R, y + 0.05, { derecha: true, dash: 'sysDot', size: 11, h: 0.32 });
  fuente(s, 'Kaplan y Norton (2008) · VAN = valor actual neto');
  return s;
};

// ===================================================================== LUKAS
D.ficha = () => {
  const s = contenido('08 · UN INDICADOR COMPLETO', 'C2 · PROMESA DE AHORRO', null);
  const filas = [
    ['Objetivo', 'Cumplir la promesa de ahorro medida en el vehículo del cliente'],
    ['Fórmula', 'Clientes con ahorro a 3 meses ≥ mínimo informado ÷ clientes con medición completa'],
    ['Fuente', 'Unidad de control frente a la línea base del mismo auto (expediente P4)'],
    ['Frecuencia', 'Trimestral; por cliente a los tres meses de la instalación'],
    ['Meta', '80%, provisional hasta medir el ahorro en el proyecto experimental'],
    ['Responsable', 'Comercial y Postventa, con datos de Ingeniería de Calibración'],
    ['Ante la brecha', 'Revisar el intervalo del estimador; recalibrar los autos bajo el mínimo'],
  ];
  tabla(s, [['CAMPO', 1.75], ['DEFINICIÓN', 5.75]], filas, 1.75, { size: 15, rh: 0.6, negrita: (i, j) => j === 0 });
  const xR = 8.75, wR = R - xR, y0 = 1.75;
  mono(s, 'REGLA DE ESTADO · CRECIENTE', { x: xR, y: y0, w: wR, h: 0.28, bold: true, color: K.azul });
  const by = y0 + 0.5, bh = 3.15, bx = xR + 1.3, bw = 0.7, Yp = p => by + bh - (p - 50) / 50 * bh; // escala de 50% a 100%
  [[50, 72, K.tx, 'NO CUMPLE', '< 72%'], [72, 80, K.medio, 'ALERTA', '72% a 79%'], [80, 100, K.cel, 'CUMPLE', '≥ 80%']].forEach(([a, b, c, t, r]) => {
    s.addShape(S.rect, { x: bx, y: Yp(b), w: bw, h: Yp(a) - Yp(b), fill: { color: c }, line: { color: K.blanco, width: 1 } });
    T(s, [{ text: t, options: { fontFace: F_MONO, bold: true, fontSize: 12, breakLine: true } }, { text: r, options: { fontSize: 14 } }], { x: bx + bw + 0.12, y: (Yp(a) + Yp(b)) / 2 - 0.3, w: wR - bw - 1.45, h: 0.6, valign: 'middle' });
  });
  [50, 72, 80, 100].forEach(p => mono(s, p + '%', { x: xR, y: Yp(p) - 0.13, w: 1.2, h: 0.26, fontSize: 12, align: 'right' }));
  s.addShape(S.triangle, { x: bx - 0.32, y: Yp(75) - 0.12, w: 0.24, h: 0.24, rotate: 90, fill: { color: K.tx }, line: { color: K.tx, width: 1 } });
  mono(s, 'EJEMPLO: 75% → ALERTA', { x: xR, y: by + bh + 0.15, w: wR, h: 0.28, fontSize: 12, bold: true, color: K.tx });
  T(s, 'Sin clientes medidos en el trimestre: no aplica todavía.', { x: xR, y: by + bh + 0.45, w: wR, h: 0.5, fontSize: 14, color: K.gris });
  fuente(s, 'Ficha completa: informe, punto 9.4 · Fichas de P1, C4 y F2: anexos A9 y A10');
  return s;
};

D.desviacion = () => {
  const s = contenido('09 · DE LA DESVIACIÓN A LA DECISIÓN', 'CADA ESTADO', 'dispara una decisión.');
  tabla(s, [['TIPO', 1.55], ['CUMPLE', 1.45], ['ALERTA', 1.85], ['NO CUMPLE', 1.75]], [
    ['Creciente', '≥ meta', '90% a 99% de la meta', '< 90% de la meta'],
    ['Crítico', '100%', 'No existe', '< 100%: se detiene la entrega'],
    ['Decreciente', '≤ meta', 'Hasta 110% de la meta', '> 110% de la meta'],
    ['Hito', 'Documento recibido', '≤ 30 días para la fecha', 'Fecha vencida'],
  ], Y0, { size: 13, rh: 0.48, negrita: (i, j) => j === 0 });
  T(s, 'No aplica todavía: sin color. Sin información: alerta de gestión.', { x: M, y: Y0 + 2.62, w: 6.6, h: 0.36, fontSize: 14, color: K.gris });
  mono(s, 'LÍNEA BASE AL 12-11-2026', { x: M, y: Y0 + 3.1, w: 5, h: 0.26, fontSize: 12, bold: true, color: K.azul });
  [['3', 'EN CURSO', 'A3 · A4 · F1'], ['2', 'NO INICIADOS', 'P1 · P6, en plazo'], ['12', 'NO APLICAN', 'sin operación'], ['0', 'VENCIDOS', '']].forEach(([n, t, d], i) => {
    const x = M + i * 1.66;
    num(s, n, { x, y: Y0 + 3.32, w: 1.5, h: 0.6, fontSize: 36, color: i === 0 ? K.cel : K.tx });
    mono(s, t, { x, y: Y0 + 3.94, w: 1.6, h: 0.22, fontSize: 11, bold: true, color: K.tx, charSpacing: 0 });
    T(s, d, { x, y: Y0 + 4.14, w: 1.6, h: 0.3, fontSize: 12, color: K.gris });
  });
  const xR = 7.85, wR = R - xR;
  mono(s, 'CICLO DE CONTROL · EJEMPLO C2', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  const pasos = [['OBSERVAR', 'C2 = 75% en el trimestre'], ['COMPARAR', 'Meta 80%: alerta'], ['EXPLICAR', '¿Causa externa, del proceso o de la medición?'], ['DECIDIR', 'Revisar el intervalo y recalibrar, sin más promoción'], ['VOLVER A MEDIR', 'El trimestre siguiente']];
  pasos.forEach(([k, t], i) => {
    const y = Y0 + 0.4 + i * 0.86;
    (i === 3 ? cajaAzul : caja)(s, xR, y, wR, 0.7);
    mono(s, k, { x: xR + 0.15, y, w: 1.75, h: 0.7, fontSize: 12, bold: true, color: K.azul, valign: 'middle', charSpacing: 0 });
    T(s, t, { x: xR + 1.9, y, w: wR - 2.0, h: 0.7, fontSize: 15, valign: 'middle' });
    if (i < 4) flecha(s, xR + 0.95, y + 0.7, xR + 0.95, y + 0.86, K.tx, 1.25);
  });
  fuente(s, 'Estados por tipo de indicador: informe, punto 9.5 · Secuencia: anexo A11');
  return s;
};

// ===================================================================== DIEGO · CIERRE
D.cierre = () => {
  const s = contenido('10 · CONCLUSIÓN', 'QUÉ PERMITE GESTIONAR', 'y qué falta validar.');
  const wL = 6.6;
  mono(s, 'EL SISTEMA PERMITE DECIDIR', { x: M, y: Y0, w: wL, h: 0.28, bold: true, color: K.azul });
  [['Qué cumplir antes de vender', 'A3, A4, P1, P6 y F1'], ['Qué medir primero', 'el ahorro (C2) en el proyecto experimental'], ['Cuándo invertir', 'norma vigente, C2 cumplido, F2 positivo y VAN > 0']].forEach(([a, b], i) => {
    const y = Y0 + 0.4 + i * 1.2;
    num(s, String(i + 1), { x: M, y, w: 0.6, h: 0.8, fontSize: 44, color: K.cel, valign: 'top' });
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: K.gris } }], { x: M + 0.75, y: y + 0.05, w: wL - 0.75, h: 1.05, fontSize: 21 });
  });
  const xR = 8.0, wR = R - xR;
  linea(s, xR - 0.4, Y0, 0, 4.2, K.linea, 1);
  mono(s, 'FALTA VALIDAR', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  [['Norma propia', 'EXTERNA'], ['Ahorro real', 'PROYECTO EXPERIMENTAL'], ['Costo del kit', 'COTIZACIÓN'], ['Tasa de costo de capital', 'PLAN FINANCIERO'], ['12 hipótesis del mapa', 'PRIMEROS CLIENTES']].forEach(([a, b], i) => {
    const y = Y0 + 0.42 + i * 0.68;
    T(s, a, { x: xR, y, w: wR, h: 0.36, fontSize: 19, bold: true, valign: 'middle' });
    mono(s, b, { x: xR, y: y + 0.34, w: wR, h: 0.24, fontSize: 11, color: K.gris, bold: true });
  });
  T(s, 'Muchas gracias.', { x: xR, y: Y0 + 3.9, w: wR, h: 0.45, fontSize: 22, bold: true, align: 'right' });
  fuente(s, 'Informe del Avance 2, puntos 7 a 9');
  return s;
};
// ===================================================================== BIBLIOGRAFÍA
const REFS = [
  'Autofact. (2026, 25 de marzo). Los autos eléctricos más baratos en Chile en 2026. https://www.autofact.cl',
  'Banco Central de Chile. (2026a). Informe de Política Monetaria, septiembre 2026. https://www.bcentral.cl',
  'Banco Central de Chile. (2026b). Tipo de cambio dólar observado [Serie diaria]. https://si3.bcentral.cl',
  'BioBioChile. (2026, 24 de marzo). GLP o bencina: lo que debes tener en cuenta si estás considerando cambiarte al gas vehicular. https://www.biobiochile.cl',
  'BloombergNEF. (2025, 9 de diciembre). Lithium-ion battery pack prices fall to $108 per kilowatt-hour despite rising metal prices. https://about.bnef.com',
  'CNN Chile. (2026, septiembre). Mercado automotriz nacional creció 2,9% en agosto y acumula casi un millón de operaciones este 2026. https://www.cnnchile.com',
  'David, F. R. (1997). Conceptos de administración estratégica (5.ª ed.). Prentice Hall Hispanoamericana.',
  'Decreto Supremo N° 55. (1988). Establece normas para la conversión de vehículos a gas. Ministerio de Transportes y Telecomunicaciones.',
  'Garretón, M. (2026, 24 de marzo). Combustibles se disparan: Revisa cuánto costará llenar el estanque y los nuevos precios por región. Emol.',
  'Hitt, M. A., Ireland, R. D., y Hoskisson, R. E. (2004). Administración estratégica: competitividad y conceptos de globalización (5.ª ed.). Thomson.',
  'Instituto Nacional de Estadísticas. (2025). Parque de vehículos en circulación 2024 [Conjunto de datos].',
  'Instituto Nacional de Estadísticas. (2026, 30 de septiembre). Boletín estadístico: empleo trimestral, edición n.º 335 (junio-agosto 2026).',
  'Kaplan, R. S., y Norton, D. P. (2008). The execution premium: integrando la estrategia y las operaciones para lograr ventajas competitivas. Ediciones Deusto.',
  'KMcheck. (2026, 18 de abril). Los 5 autos híbridos usados más buscados en Chileautos y sus precios referenciales (2026). https://kmcheck.cl',
  'Ley N° 21.793. (2026, 14 de enero). Modifica la Ley N° 18.290, de Tránsito, para autorizar talleres de transformación de sistemas de propulsión y otras adaptaciones. Diario Oficial.',
  'Ministerio de Transportes y Telecomunicaciones. (2021, 24 de mayo). Decreto Supremo N° 67 de 2020: Establece requisitos técnicos y administrativos para la autorización de proyectos experimentales. Subsecretaría de Transportes.',
  'Osterwalder, A., Pigneur, Y., Bernarda, G., y Smith, A. (2014). Value proposition design. John Wiley & Sons.',
  'Porter, M. E. (1996). What is strategy? Harvard Business Review, 74(6), 61–78.',
  'Porter, M. E. (2008). The five competitive forces that shape strategy. Harvard Business Review, 86(1), 78–93.',
];
const biblio = (parte, refs) => () => {
  const s = contenido(`BIBLIOGRAFÍA · ${parte}`, 'BIBLIOGRAFÍA', null);
  T(s, refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1, paraSpaceAfter: 6, indentLevel: 0 } })), { x: M, y: 1.75, w: CW, h: 4.85, fontSize: 13, color: K.tx, lineSpacingMultiple: 1.0 });
  fuente(s, 'APA 7 · Enlaces completos en la bibliografía del informe');
  return s;
};
D.biblio1 = biblio('1 DE 2', REFS.slice(0, 10));
D.biblio2 = biblio('2 DE 2', REFS.slice(10));

// ===================================================================== ANEXO
const coma = (n, d = 2) => n.toFixed(d).replace('.', ',');
D.indice = () => {
  const s = contenido('ANEXO · NO SE EXPONE', 'ANEXO PARA PREGUNTAS', null);
  const vistos = new Set(); const items = G.ANEXO.filter(a => !vistos.has(a.codigo) && vistos.add(a.codigo));
  const col = Math.ceil(items.length / 2), w = (CW - 0.4) / 2;
  items.forEach((a, i) => {
    const x = M + Math.floor(i / col) * (w + 0.4), y = 1.75 + (i % col) * 0.66;
    caja(s, x, y, w, 0.56);
    mono(s, a.codigo, { x: x + 0.12, y, w: 0.7, h: 0.56, fontSize: 14, bold: true, color: K.azul, valign: 'middle' });
    s.addText(a.titulo, { x: x + 0.85, y, w: w - 0.95, h: 0.56, fontFace: F_BODY, fontSize: 14, color: K.tx, valign: 'middle', margin: 0, hyperlink: { slide: PRIMERA[a.codigo], tooltip: a.titulo } });
  });
  return s;
};
const CORTO = { A1: 'ESCENARIOS Y CONTINGENCIA', A2: 'PROPUESTA DE VALOR', A3: 'MEFE', A4: 'MEFI', A5: 'CINCO FUERZAS', A6: 'RECURSOS Y CAPACIDADES', A7: 'CRUCES DEL FODA', A8: 'RELACIONES CAUSA-EFECTO', A9: 'FICHAS DE P1 Y C4', A10: 'FICHA DE F2 Y METAS PROVISIONALES', A11: 'SECUENCIA Y LÍNEA BASE', A12: 'QUÉ DICEN MEFE Y MEFI', A13: 'RECUPERACIÓN DEL KIT', A14: 'BASE COMÚN DE DATOS' };
const anexo = () => { const a = ANEXO_ACTUAL; return contenido(`${a.codigo} · ANEXO${a.parte ? ' · ' + a.parte.toUpperCase() : ''}`, CORTO[a.codigo], null); };

D['a-escenarios'] = () => {
  const s = anexo();
  tabla(s, [['ESCENARIO', 2.4], ['RESPUESTA DE LA AUTORIDAD', 3.1], ['EFECTO EN EL CMI', 3.0], ['DECISIÓN', CW - 8.5]], [
    ['E1 · Norma amplia (supuesto de planificación)', 'Reconoce los sistemas aditivos sin exclusiones', 'Ninguno bloqueado; apertura en enero de 2028', 'Seguir la secuencia de activación'],
    ['E2 · Norma acotada', 'Con exclusiones (ABS, airbag u otras)', 'P2 y C4 al parque elegible', 'Priorizar modelos sin esos sistemas'],
    ['E3 · Sin norma propia', 'Solo autorizaciones experimentales o caso a caso', 'P2, P3 y lo que depende de ellos', 'Prolongar la preparación; no arrendar ni contratar'],
    ['E4 · Sin vía', 'No procede ninguna autorización', 'Toda la cadena de habilitación', 'Contingencia y reevaluar la continuidad'],
  ], 1.75, { size: 14, rh: 0.78, negrita: (i, j) => j === 0, destacar: i => i === 0 });
  T(s, 'La norma entra al mapa por R03 y R07: un cambio de escenario modifica metas y fechas, no la estructura. Se revisa cada mes.', { x: M, y: 5.75, w: CW, h: 0.6, fontSize: 15, color: K.gris });
  fuente(s, 'Ley N° 21.793 (2026) · MTT (2021), D. S. N° 67 · Entrevista al 3CV');
  return s;
};
D['a-lienzo'] = () => {
  const s = anexo();
  const Z = 13, RH = 0.32;
  const item = (x, y, cod, t, w) => { mono(s, cod, { x, y, w: 0.34, h: RH, fontSize: 11, bold: true, color: K.cel, valign: 'middle' }); T(s, t, { x: x + 0.34, y, w, h: RH, fontSize: Z, valign: 'middle' }); };
  const sx = M, sy = 2.15, sq = 4.4, cx = sx + sq / 2, cy = sy + sq / 2;
  mono(s, 'MAPA DE VALOR · LUMINE', { x: sx, y: 1.8, w: sq, h: 0.26, fontSize: 12, bold: true, color: K.azul, align: 'center' });
  s.addShape(S.rect, { x: sx, y: sy, w: sq, h: sq, fill: { color: K.blanco }, line: { color: K.tx, width: 2 } });
  linea(s, sx, sy, cx - 0.25 - sx, cy - 0.2 - sy, K.tx, 1.5);
  linea(s, sx, cy + 0.2, cx - 0.25 - sx, sy + sq - cy - 0.2, K.tx, 1.5, { flipV: true });
  linea(s, cx + 0.25, cy, sx + sq - cx - 0.25, 0, K.tx, 1.5);
  const tx0 = cx - 0.05, tw = sx + sq - 0.2 - tx0 - 0.34;
  mono(s, 'CREADORES DE ALEGRÍAS', { x: tx0, y: sy + 0.18, w: sx + sq - 0.1 - tx0, h: 0.24, fontSize: 11, bold: true, color: K.tx, charSpacing: 0 });
  [['C1', 'Reporte de consumo'], ['C2', 'Calibración propia'], ['C3', 'Pago en cuotas'], ['C4', 'Garantía escrita']].forEach(([k, t], i) => item(tx0, sy + 0.55 + i * 0.36, k, t, tw));
  mono(s, 'ALIVIADORES', { x: cx + 0.34, y: cy + 0.1, w: 2, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  const yr = [cy + 0.42, cy + 0.78, cy + 1.14, cy + 1.5];
  [['R1', 'Ahorro para su uso'], ['R2', 'No cambia de auto'], ['R3', 'Respaldo formal'], ['R4', 'Ahorro medido']].forEach(([k, t], i) => item(tx0, yr[i], k, t, tw));
  mono(s, 'PRODUCTOS', { x: sx + 0.2, y: cy - 0.55, w: 1.6, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['Kit e instalación', 'Diagnóstico', 'Medición'].forEach((t, i) => T(s, t, { x: sx + 0.2, y: cy - 0.27 + i * 0.3, w: 1.6, h: 0.28, fontSize: 13, valign: 'middle' }));
  const ox = 10.25, oy = cy, r = 2.2;
  mono(s, 'PERFIL · CONDUCTOR DE USO LABORAL', { x: ox - r - 0.3, y: 1.8, w: 2 * r + 0.6, h: 0.26, fontSize: 12, bold: true, color: K.azul, align: 'center' });
  s.addShape(S.ellipse, { x: ox - r, y: oy - r, w: 2 * r, h: 2 * r, fill: { color: K.blanco }, line: { color: K.tx, width: 2 } });
  linea(s, ox - r, oy, 2 * r, 0, K.tx, 1.5);
  const izq = y => ox - Math.sqrt(Math.max(0, r * r - (y - oy) ** 2));
  const xFila = y => Math.max(izq(y), izq(y + RH)) + 0.3;
  mono(s, 'ALEGRÍAS', { x: xFila(oy - 2.0), y: oy - 2.0, w: 1.4, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['Ver el ahorro cada mes', 'Seguir con su auto', 'Cuota menor al ahorro', 'Taller que responde'].forEach((t, i) => { const y = oy - 1.7 + i * 0.36; item(xFila(y), y, `G${i + 1}`, t, 2.2); });
  mono(s, 'FRUSTRACIONES', { x: xFila(oy + 0.1), y: oy + 0.1, w: 1.8, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['La bencina sube', 'Sin capital para cambiar', 'Teme perder el seguro', 'No sabe cuánto ahorra'].forEach((t, i) => {
    const y = yr[i], x = xFila(y);
    item(x, y, `F${i + 1}`, t, 2.25);
    flecha(s, x - 0.08, y + RH / 2, sx + sq + 0.08, y + RH / 2, K.cel, 1.5);
  });
  fuente(s, 'Adaptado de Osterwalder et al. (2014) · Investigación del equipo');
  return s;
};
const EXT = [['O1', 'El parque se conserva: 3,5 usados por nuevo', 6, 3, 3], ['O2', 'Alza de la bencina: $1.168,9 → $1.538,9', 5, 3, 3], ['O3', 'Vacío de oferta formal sin reemplazar el auto', 7, 3, 4], ['O4', 'Segmento laboral RM: 73.908 vehículos', 6, 2, 3], ['O5', 'Vía: proyecto experimental y norma propia', 6, 1, 4], ['O6', 'Baterías de litio a US$108/kWh', 5, 3, 3], ['O7', 'Talleres que podrían sumarse a la red', 6, 2, 2], ['A1', 'Reglamento en trámite no alcanza al kit', 7, 1, 3], ['A2', 'Menor ingreso: PIB 0,25%–0,75%; desocupación 9,6%', 6, 2, 2], ['A3', 'Sustitutos sin trámite: gas, híbrido, eléctrico', 6, 2, 2], ['A4', 'Aseguradoras y plantas sin protocolo', 7, 1, 3], ['A5', 'Homologación por par lenta y costosa', 5, 2, 3], ['A6', 'Déficit de técnicos en alta tensión', 5, 2, 2], ['A7', 'Crédito de consumo caro', 5, 2, 2], ['A8', 'Dólar a $970,46: riesgo cíclico que se cubre', 3, 2, 2], ['A9', 'Entrada de actores técnicos (Movener, Reborn)', 4, 2, 2]];
const INT = [['F1', 'Arquitectura trasera que se suma al auto', 7, 3, 4], ['F2', 'Sin enchufe: se carga al frenar', 5, 3, 3], ['F3', 'Conocimiento de calibración y medición', 6, 3, 4], ['F4', 'Proceso estandarizado con cuatro controles', 5, 3, 3], ['F5', 'Lumine Habilita (prototipo)', 6, 4, 4], ['F6', 'Modelo de red sin activos fijos', 5, 3, 3], ['D1', 'Sin gestión iniciada: proyecto experimental sin solicitar', 7, 1, 3], ['D2', 'Ahorro sin medir en autos chilenos', 7, 1, 3], ['D3', 'Biblioteca vacía; cada calibración es costo hundido', 6, 2, 3], ['D4', 'Sin compras observadas: intención no es compra', 6, 2, 2], ['D5', 'Inversión alta para el cliente', 5, 2, 2], ['D6', 'Marca nueva, sin casos que mostrar', 5, 2, 3], ['D7', 'Compras en dólares sin cobertura', 6, 2, 2], ['D8', 'Conocimiento concentrado en pocas personas', 5, 2, 2]];
function matriz(filas) {
  const suma = filas.reduce((a, f) => a + f[2], 0);
  const rows = filas.map(f => [f[0], f[1], coma(f[2] / suma, 3), String(f[3]), coma(f[2] / suma * f[3], 3), String(f[4])]);
  const tot = k => filas.reduce((a, f) => a + f[2] / suma * f[k], 0);
  rows.push(['', 'Total ponderado', '1,000', '', coma(tot(3)), coma(tot(4))]);
  return rows;
}
const tablaMatriz = (s, filas) => tabla(s, [['N°', 0.6], ['FACTOR', 6.2], ['PESO', 1.0], ['CALIF. HOY', 1.15], ['POND. HOY', 1.1], ['ESCENARIO', CW - 10.05]], matriz(filas), 1.75, { size: 12, rh: 0.265, centro: [0, 2, 3, 4, 5], negrita: (i, j) => i === filas.length || j === 0, destacar: i => i === filas.length });
D['a-mefe'] = () => { const s = anexo(); tablaMatriz(s, EXT); fuente(s, 'David (1997) · Peso = relevancia ÷ suma · Calificaciones del equipo, por validar'); return s; };
D['a-mefi'] = () => { const s = anexo(); tablaMatriz(s, INT); fuente(s, 'David (1997) · 1 = debilidad mayor, 4 = fortaleza mayor · Por validar'); return s; };
D['a-porter'] = () => {
  const s = anexo();
  tabla(s, [['FUERZA', 2.6], ['PESO', 1.0], ['INTENSIDAD', 1.4], ['LECTURA', CW - 5.0]], [
    ['Sustitutos', '30%', '3,67', 'Gas (solo autos de hasta 7 años), híbrido usado desde $9,5 millones, eléctrico nuevo desde $13.990.000'],
    ['Nuevos entrantes', '20%', '3,75', 'La barrera regulatoria pesa igual para todos'],
    ['Clientes', '25%', '2,83', 'Sensibles al precio; incluye la inercia de no intervenir el auto (C.a.6)'],
    ['Proveedores', '15%', '2,67', 'Componentes estandarizados e importados'],
    ['Rivalidad', '10%', '1,83', 'Sin competidores directos identificados'],
    ['Total ponderado', '100%', '3,14', 'Intensidad media: el rival principal es la decisión de no intervenir el auto'],
  ], 1.85, { size: 14, rh: 0.62, centro: [1, 2], negrita: (i, j) => j === 0 || i === 5, destacar: i => i === 5 });
  fuente(s, 'Porter (2008) · BioBioChile, KMcheck y Autofact (2026) · D. S. N° 55 (1988)');
  return s;
};
D['a-recursos'] = () => {
  const s = anexo();
  const R17 = [['Taller habilitado y equipamiento', 'T', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Kit (dos motores, batería, unidad de control)', 'T', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Convenio de financiamiento', 'I', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Cartera de homologaciones por par', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Autorización experimental y del taller', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Biblioteca de calibraciones y base de consumo', 'I', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Técnicos con licencia SEC en alta tensión', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Reputación por evidencia publicada', 'I', 'Sí', 'Sí', 'Sí', 'No', 'Temporal'], ['Convenios con aseguradoras y plantas', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Estimador de ahorro que aprende', 'C', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Método Lumine Habilita', 'C', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Integración del kit (ingeniería)', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Diagnóstico previo y posventa', 'C', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Estandarización del proceso', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Logística de baterías (clase 9)', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Negociación de convenios financieros', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Red de talleres que devuelve datos', 'C', 'Sí', 'Sí', 'Sí', 'No', 'Temporal']];
  tabla(s, [['RECURSO O CAPACIDAD', 4.3], ['TIPO', 0.6], ['VALIOSO', 0.95], ['RARO', 0.75], ['COSTOSO DE IMITAR', 1.2], ['INSUSTIT.', 1.0], ['CONSECUENCIA', CW - 8.8]], R17, 1.72, { size: 12, rh: 0.255, centro: [1, 2, 3, 4, 5], negrita: (i, j) => j === 6 && R17[i][6].startsWith('Sost'), destacar: i => R17[i][6].startsWith('Sost') });
  fuente(s, 'Hitt et al. (2004) · T tangible · I intangible · C capacidad · 3 / 7 / 7');
  return s;
};
D['a-cruces'] = () => {
  const s = anexo();
  const CR = [['FO1', 'F1, F3 · O1, O3, O4', 'Ofrecer «calibración para tu modelo», partiendo por el modelo más frecuente', 'C4, P2'], ['FO2', 'F1 · O5', 'Ejecutar el proyecto experimental y entregar sus resultados para una norma propia', 'P1'], ['FO3', 'F5, F6 · O7', 'Sumar talleres a la red con el método y Habilita, validado el proyecto experimental', 'P5, F3'], ['DO1', 'D2 · O2, O6', 'Medir el ahorro con línea base antes de comunicar cualquier cifra', 'A3, P4, C2'], ['DO2', 'D1 · O5', 'Memoria de cálculo y expediente del primer par kit-modelo', 'P1, P2'], ['DO3', 'D5 · O2', 'Pago en cuotas con un financista, sin crédito directo de Lumine', 'P6'], ['FA1', 'F1, F2 · A3', 'Mismo auto, sin enchufe y sin límite de antigüedad', 'C4'], ['FA2', 'F5 · A6', 'Formar técnicos con Habilita y la franquicia SENCE', 'A2'], ['DA1', 'D7 · A8', 'Cobertura cambiaria y abastecimiento del kit', 'F2'], ['DA2', 'D6 · A4', 'Convenios con aseguradora y planta, con casos medidos', 'P6, C3'], ['DA3', 'D3, D8 · A9', 'Proteger las calibraciones y retener a los técnicos', 'A1, A2']];
  tabla(s, [['N°', 0.75], ['CRUCE', 2.1], ['ESTRATEGIA', CW - 4.35], ['OBJETIVO', 1.5]], CR, 1.75, { size: 13, rh: 0.4, centro: [0], negrita: (i, j) => j === 0, destacar: i => CR[i][0].startsWith('D') });
  fuente(s, 'David (1997) · Destacadas: DO y DA, prioridad mientras MEFE y MEFI estén bajo 2,5');
  return s;
};
const REL = [['R01', 'A1 → P2', 'Habilitante', 'Calibraciones versionadas respaldan el expediente', 'Expediente con calibración aprobada'], ['R02', 'P1 → P2', 'Habilitante', 'Los ensayos del proyecto experimental forman el expediente', 'Informe aceptado por el 3CV'], ['R03', 'Norma → P2', 'Externa', 'Sin norma propia no se autoriza la venta', 'Publicación en el Diario Oficial'], ['R04', 'P2 → P3', 'Habilitante', 'Solo pares autorizados se instalan', 'Orden con par autorizado'], ['R05', 'A2 → P3', 'Habilitante', 'Personal habilitado sostiene la ejecución segura', 'Asignaciones validadas'], ['R06', 'P3 → C1', 'Habilitante', 'El control final verifica la promesa técnica', 'Acta de conformidad'], ['R07', 'Norma → P5', 'Externa', 'Cada taller de la red necesita su autorización', 'Aplicabilidad a terceros'], ['R08', 'A3 → P4', 'Habilitante', 'Datos comparables permiten reportes defendibles', 'Línea base común'], ['R09', 'P3 → P4', 'Hipótesis', 'Una instalación trazable permite el seguimiento', 'Componentes identificados'], ['R10', 'P4 → C2', 'Habilitante', 'Sin medición no se puede verificar la promesa', 'Expediente de cada cliente'], ['R11', 'C1 → C3', 'Hipótesis', 'Cumplir la promesa técnica reforzaría la confianza', 'Encuesta a los tres meses'], ['R12', 'C2 → C3', 'Hipótesis', 'Un ahorro verificado sumaría confianza', 'Confianza de quienes cumplen y no'], ['R13', 'P6 → C3', 'Hipótesis', 'El respaldo de aseguradoras y plantas suma confianza', 'Confianza con y sin respaldo'], ['R14', 'C3 → C4', 'Hipótesis', 'Más confianza mejoraría la conversión', 'Conversión por origen'], ['R15', 'P6 → C4', 'Hipótesis', 'Pagar en cuotas destrabaría la compra', 'Conversión con y sin financiamiento'], ['R16', 'C4 → F2', 'Hipótesis', 'Más volumen aporta solo con margen positivo', 'Margen real por servicio'], ['R17', 'P3 → F2', 'Hipótesis', 'Menos retrabajo contendría el costo directo', 'Costo por orden'], ['R18', 'F2 → F1', 'Hipótesis', 'El margen alimenta los flujos que se descuentan', 'Conciliación con el plan'], ['R19', 'A4 → P5', 'Hipótesis', 'Un método documentado hace replicable el servicio', 'Paquete revisado'], ['R20', 'P5 → F3', 'Hipótesis', 'El paquete permite evaluar cada incorporación', 'Modelo de ingresos de la red'], ['R21', 'F3 → F1', 'Hipótesis', 'Expandirse crea valor solo con evaluación positiva', 'VAN incremental por taller']];
const COLS_REL = [['N°', 0.6], ['RELACIÓN', 1.4], ['TIPO', 1.3], ['MECANISMO', 5.0], ['DATO QUE LA REVISA', CW - 8.3]];
D['a-rel1'] = () => { const s = anexo(); tabla(s, COLS_REL, REL.slice(0, 15), 1.72, { size: 12, rh: 0.29, centro: [0], negrita: (i, j) => j === 0, destacar: i => REL[i][2] === 'Externa' }); fuente(s, 'R01 a R07: habilitación · R08 a R15: evidencia · Norma: condición externa'); return s; };
D['a-rel2'] = () => {
  const s = anexo();
  tabla(s, COLS_REL, REL.slice(15), 1.72, { size: 13, rh: 0.36, centro: [0], negrita: (i, j) => j === 0 });
  mono(s, 'LAS TRES CADENAS DECISIVAS', { x: M, y: 4.35, w: 6, h: 0.26, bold: true, color: K.azul });
  tabla(s, [['CADENA', 3.3], ['SI FALLA', CW - 3.3]], [
    ['Habilitación: P1 → P2 → P3 → C1', 'Sin norma no se vende: se prolonga la preparación. Par rechazado: siguiente modelo'],
    ['Evidencia: A3 → P4 → C2 → C3 → C4', 'C2 bajo la meta: corregir el intervalo. C4 no sube: revisar convenios'],
    ['Valor: C4 → F2 → F1', 'Kit sobre el umbral: no invertir. Margen bajo el plan: no activar un dúo nuevo'],
  ], 4.68, { size: 13, rh: 0.42, negrita: (i, j) => j === 0 });
  fuente(s, 'R16 a R21: valor económico · 7 habilitantes, 2 externas y 12 hipótesis');
  return s;
};
const ficha = (s, k, filas, x, w) => { mono(s, k, { x, y: 1.75, w, h: 0.3, bold: true, color: K.azul, fontSize: 14 }); tabla(s, [['CAMPO', 1.45], ['DEFINICIÓN', w - 1.45]], filas, 2.1, { x, size: 13, rh: 0.6, negrita: (r, j) => j === 0 }); };
D['a-fichas'] = () => {
  const s = anexo(); const w = (CW - 0.3) / 2;
  ficha(s, 'P1 · PROYECTO EXPERIMENTAL (DIEGO)', [['Indicador', 'Resolución, vehículos medidos e informe entregado al 3CV'], ['Tipo', 'Hito: no iniciado, en curso, cumplido o vencido'], ['Evidencia', 'Resolución del MTT, protocolo aprobado (A3), registros e informe con acuse'], ['Meta', 'Solicitud en el 1.er trimestre de 2027; informe antes del mes −4'], ['Responsable', 'Gerencia General'], ['Si hay brecha', 'Atraso de más de un trimestre: recalendarizar la apertura; no comprometer arriendo']], M, w);
  ficha(s, 'C4 · CONVERSIÓN (BENJAMÍN)', [['Fórmula', 'Instalaciones del trimestre ÷ cotizaciones de modelos calibrados del trimestre'], ['Tipo', 'Creciente: cumple ≥ 30%; alerta 27% a 29%; no cumple < 27%'], ['Fuente', 'Plataforma comercial: cotizaciones con canal de origen'], ['Meta', '30%, provisional: supuesto del pronóstico; se confirma al tercer mes'], ['Responsable', 'Comercial y Postventa'], ['Si hay brecha', 'Corregir la meta de ventas antes de contratar el siguiente dúo']], M + w + 0.3, w);
  fuente(s, 'Fichas de los indicadores del CMI · Informe, punto 9.4');
  return s;
};
D['a-metas'] = () => {
  const s = anexo(); const w = 5.4;
  ficha(s, 'F2 · MARGEN POR SERVICIO (LUKAS)', [['Fórmula', 'Precio neto − costo directo del servicio'], ['Tipo', 'Creciente: cumple si es positivo'], ['Primer dato', 'Cotización formal del kit frente al umbral: $2.866.010 y $3.211.125'], ['Responsable', 'Gerencia General'], ['Si hay brecha', 'No invertir: renegociar el kit o revisar el precio']], M, w);
  const x = M + w + 0.3, ww = CW - w - 0.3;
  mono(s, 'METAS PROVISIONALES', { x, y: 1.75, w: ww, h: 0.3, bold: true, color: K.azul, fontSize: 14 });
  tabla(s, [['OBJ.', 0.6], ['DATO QUE FALTA · QUIÉN', 3.0], ['CUÁNDO SE FIJA', ww - 3.6]], [
    ['C2', 'Ahorro medido · Ing. de Calibración', 'Al cerrar el proyecto experimental'],
    ['C3', 'Primera encuesta · Comercial', 'Tras el primer trimestre de ventas'],
    ['C4', 'Embudo real · Comercial', 'Al tercer mes de ventas'],
    ['F1', 'Tasa y flujos · Gerencia General', 'Con el Plan Financiero, antes de invertir'],
  ], 2.1, { x, size: 13, rh: 0.6, centro: [0], negrita: (i, j) => j === 0 });
  T(s, 'Mientras tanto se evalúan igual, pero un incumplimiento obliga a revisar la meta antes de decidir.', { x, y: 5.3, w: ww, h: 0.8, fontSize: 15, color: K.gris });
  fuente(s, 'Informe, puntos 9.2 y 9.4');
  return s;
};
D['a-secuencia'] = () => {
  const s = anexo();
  tabla(s, [['ETAPA', 3.0], ['SE ACTIVAN', 3.0], ['CONDICIÓN PARA PASAR', CW - 6.0]], [
    ['1. Preparación (hoy y 2027)', 'A3, A4, P1, P6 y F1 (VAN)', 'Proyecto experimental autorizado, protocolo aprobado y VAN positivo'],
    ['2. Proyecto experimental (2027)', 'A1, A2 y P4', 'Ahorro medido, informe entregado, norma vigente y par autorizado'],
    ['3. Taller propio (desde 2028)', 'P2, P3, C1 a C4 y F2', 'C2 cumplido, margen positivo y conversión estable'],
    ['4. Red (desde el año 3)', 'P5, F3 y F1 operando', 'Evaluación incremental positiva por taller'],
  ], 1.75, { size: 14, rh: 0.6, negrita: (i, j) => j === 0, destacar: i => i === 0 });
  mono(s, 'LÍNEA BASE AL 12-11-2026', { x: M, y: 4.95, w: 6, h: 0.26, bold: true, color: K.azul });
  T(s, 'En curso: A3 (método identificado, protocolo por aprobar), A4 (39 competencias; contenido por validar) y F1 (Plan Financiero en elaboración). No iniciados, en plazo: P1 y P6. No aplican todavía: los 12 restantes.', { x: M, y: 5.25, w: CW, h: 1.0, fontSize: 15 });
  fuente(s, 'Informe, puntos 9.5 y 10.1 · Fechas según el plan del equipo');
  return s;
};
D['a-postura'] = () => {
  const s = anexo();
  const x = M + 0.2, w = 7.6;
  mono(s, 'MEFE · ESCENARIO DE EVALUACIÓN', { x: M, y: 1.8, w: 6, h: 0.28, bold: true, color: K.azul });
  regla(s, x, 3.45, w, [{ v: 2.03, n: '2,03', t: 'HOY', izq: true }, { v: 2.54, n: '', t: '', color: K.gris, hueco: true, dash: 'sysDot' }, { v: 2.75, n: '', t: '', color: K.cel }], { alto: 1.3 });
  const Xv = v => x + (v - 1) / 3 * w;
  num(s, '2,54', { x: Xv(2.54) - 1.2, y: 2.5, w: 1.1, h: 0.62, fontSize: 34, color: K.gris, align: 'right' });
  mono(s, 'SIN NORMA', { x: Xv(2.54) - 1.6, y: 2.21, w: 1.5, h: 0.26, fontSize: 12, bold: true, color: K.gris, align: 'right' });
  num(s, '2,75', { x: Xv(2.75) + 0.12, y: 2.5, w: 1.2, h: 0.62, fontSize: 34, color: K.cel, align: 'left' });
  mono(s, 'CON NORMA', { x: Xv(2.75) + 0.12, y: 2.21, w: 1.5, h: 0.26, fontSize: 12, bold: true, color: K.cel });
  mono(s, 'MEFI · ESCENARIO DE EVALUACIÓN', { x: M, y: 4.15, w: 6, h: 0.28, bold: true, color: K.azul });
  regla(s, x, 5.7, w, [{ v: 2.32, n: '2,32', t: 'HOY', izq: true }, { v: 2.96, n: '2,96', t: 'HITOS PROPIOS', color: K.cel }], { alto: 1.3 });
  const xR = 8.85, wR = R - xR;
  serif(s, 'Un puntaje sobre 2,5 no autoriza invertir: sin norma, 2,54 no cambia lo que Lumine puede vender.', { x: xR, y: 1.85, w: wR, h: 1.6, fontSize: 20 });
  mono(s, 'LA OFENSIVA SE DECIDE CON', { x: xR, y: 3.6, w: wR, h: 0.28, bold: true, color: K.azul });
  T(s, ['Norma vigente y par autorizado (P2)', 'Promesa de ahorro cumplida (C2)', 'Margen positivo medido (F2)', 'VAN positivo (F1)'].map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < 3 } })), { x: xR, y: 3.95, w: wR, h: 1.8, fontSize: 16, paraSpaceAfter: 4 });
  fuente(s, 'David (1997) · Calificaciones del equipo, por validar · Informe, punto 10.3');
  return s;
};
D['a-cliente'] = () => {
  const s = anexo();
  tabla(s, [['VERSIÓN', 1.4], ['PERFIL', 1.6], ['AHORRO SIMULADO', 1.9], ['AHORRO AL MES', 1.9], ['MESES', 1.2]], [
    ['Esencial', 'Colectivo', '14,5%', '$123.480', '34,7'], ['Esencial', 'Aplicación', '12,2%', '$156.455', '27,4'], ['Plus', 'Colectivo', '18,0%', '$153.286', '32,6'], ['Plus', 'Aplicación', '14,9%', '$191.080', '26,1'],
  ], 1.75, { size: 15, rh: 0.5, centro: [2, 3, 4], negrita: (i, j) => j === 0 });
  T(s, 'Base única: bencina a $1.538,9, 10 km/L (supuesto), ahorro mediano simulado; colectivo 213 km diarios, 6 días; aplicación 100.000 km al año. Sin costo financiero.', { x: M, y: 4.4, w: 8.0, h: 0.9, fontSize: 14, color: K.gris });
  const xR = 9.35, wR = R - xR;
  mono(s, 'SENSIBILIDAD · PLUS · LITROS DE UMBRAL', { x: xR, y: 1.75, w: wR, h: 0.28, bold: true, color: K.azul, fontSize: 12, charSpacing: 0 });
  [['20%', '16.213'], ['15%', '21.617'], ['10%', '32.426']].forEach(([a, l], i) => {
    const y = 2.15 + i * 0.75;
    T(s, a, { x: xR, y, w: 0.9, h: 0.6, fontSize: 20, bold: true, valign: 'middle' });
    num(s, l, { x: xR + 0.9, y, w: wR - 0.9, h: 0.6, fontSize: 32, color: i === 2 ? K.tx : K.cel, valign: 'middle' });
  });
  serif(s, 'Con la mitad del ahorro, el umbral se duplica.', { x: xR, y: 4.45, w: wR, h: 0.9, fontSize: 19 });
  fuente(s, 'Garretón (2026) · Umbral = precio ÷ (ahorro × litro) · Informe, punto 10.5');
  return s;
};
D['a-base'] = () => {
  const s = anexo();
  tabla(s, [['CLASE', 2.3], ['CONTENIDO AL 12-11-2026', 6.3]], [
    ['Dato público', 'Bencina, 3,5 usados por nuevo, PIB, desocupación, dólar, Ley N° 21.793, D.S. N° 67, precios de sustitutos'],
    ['Investigación del equipo', '4 entrevistas exploratorias, 5 a expertos y 5 a clientes; encuesta de 196 respuestas válidas (no probabilística)'],
    ['Plan aprobado (Fase 3)', 'Precios de referencia; kit con dos motores y batería de litio-titanato; apertura en 2028; 2.934 instalaciones y 16 talleres al año 5'],
    ['Provisional', 'Ahorro simulado; conversión de 30%; costo del kit por cotizar; Plan Financiero en elaboración'],
  ], 1.75, { size: 13, rh: 0.75, negrita: (i, j) => j === 0 });
  mono(s, 'DEMO LUMINE HABILITA', { x: 9.9, y: 1.75, w: R - 9.9, h: 0.28, bold: true, color: K.azul, align: 'center', charSpacing: 0 });
  s.addShape(S.rect, { x: 10.15, y: 2.15, w: 2.35, h: 2.35, fill: { color: K.blanco }, line: { color: K.linea, width: 0.75 } });
  s.addImage({ path: AQ('qr-habilita.png'), x: 10.25, y: 2.25, w: 2.15, h: 2.15, altText: 'Código QR de la demostración de Lumine Habilita' });
  T(s, 'Formación por competencias del técnico instalador (prototipo)', { x: 9.95, y: 4.6, w: 2.75, h: 0.8, fontSize: 13, align: 'center', color: K.gris });
  fuente(s, 'Las personas entrevistadas no se nombran');
  return s;
};

// ---------- orden, notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · unos ${G.mmss(G.segundos(x.texto))} · Informe: ${x.seccion}\n\nIDEA: ${x.idea}\nEVIDENCIA: ${x.evidencia}\nCONCEPTO: ${x.concepto}\nTRANSICIÓN: ${x.transicion}`;
let quienAnterior = null, parte = 0;
G.PRINCIPAL.forEach(x => {
  if (x.quien !== quienAnterior) { abrirSeccion(`${++parte} · ${x.quien}`); quienAnterior = x.quien; }
  if (!D[x.d]) throw new Error('Falta la diapositiva ' + x.d);
  D[x.d]().addNotes(nota(x));
});
abrirSeccion('Bibliografía');
D.biblio1().addNotes('BIBLIOGRAFÍA · No se expone.');
D.biblio2().addNotes('BIBLIOGRAFÍA · No se expone.');
abrirSeccion('Anexo');
INDICE_ANEXO = G.PRINCIPAL.length + 3;
const PRIMERA = {};
G.ANEXO.forEach((a, i) => { if (!(a.codigo in PRIMERA)) PRIMERA[a.codigo] = INDICE_ANEXO + 1 + i; });
D.indice().addNotes('ANEXO · No se expone. Cada tema tiene un enlace a su lámina; cada lámina vuelve a este índice.');
G.ANEXO.forEach(a => {
  ANEXO_ACTUAL = a;
  if (!D[a.d]) throw new Error('Falta la diapositiva ' + a.d);
  D[a.d]().addNotes(`ANEXO ${a.codigo} · Solo si preguntan.\n\n${a.apoyo}`);
});
ANEXO_ACTUAL = null;


// ---------- tema y tipografías incrustadas ----------
async function aplicarTema(archivo, tema) {
  const zip = await JSZip.loadAsync(fs.readFileSync(archivo));
  const parteT = 'ppt/theme/theme1.xml';
  const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const esquema = `<a:clrScheme name="${tema.name}">` + slots.map(k => `<a:${k}><a:srgbClr val="${tema.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const xml = (await zip.file(parteT).async('string')).replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => esquema);
  zip.file(parteT, xml);
  fs.writeFileSync(archivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
const FUENTES_PPTX = [
  [F_TIT, { regular: 'ArchivoSemiExpanded-ExtraBold.ttf' }],
  [F_CON, { regular: 'ArchivoCondensed-Regular.ttf', bold: 'ArchivoCondensed-Bold.ttf' }],
  [F_BODY, { regular: 'Figtree-Regular.ttf', bold: 'Figtree-Bold.ttf' }],
  [F_MONO, { regular: 'IBMPlexMono-Regular.ttf', bold: 'IBMPlexMono-Bold.ttf' }],
  [F_SER, { regular: 'InstrumentSerif-Regular.ttf', italic: 'InstrumentSerif-Italic.ttf' }],
];
function ttfAEot(ttf) {
  const tablas = {};
  for (let i = 0, n = ttf.readUInt16BE(4); i < n; i++) { const r = 12 + 16 * i; tablas[ttf.toString('latin1', r, r + 4)] = ttf.readUInt32BE(r + 8); }
  const os2 = tablas['OS/2'], head = tablas.head, name = tablas.name;
  const nombre = id => {
    const cuenta = ttf.readUInt16BE(name + 2), base = name + ttf.readUInt16BE(name + 4);
    for (let i = 0; i < cuenta; i++) {
      const r = name + 6 + 12 * i;
      if (ttf.readUInt16BE(r) === 3 && ttf.readUInt16BE(r + 2) === 1 && ttf.readUInt16BE(r + 4) === 0x409 && ttf.readUInt16BE(r + 6) === id) {
        return Buffer.from(ttf.subarray(base + ttf.readUInt16BE(r + 10), base + ttf.readUInt16BE(r + 10) + ttf.readUInt16BE(r + 8))).swap16();
      }
    }
    throw new Error('La fuente no tiene el nombre ' + id);
  };
  const familia = nombre(1), cadenas = [familia, nombre(2), nombre(5), nombre(4)];
  const fijo = Buffer.alloc(82);
  fijo.writeUInt32LE(ttf.length, 4); fijo.writeUInt32LE(0x00020001, 8);
  ttf.copy(fijo, 16, os2 + 32, os2 + 42);
  fijo.writeUInt8(1, 26); fijo.writeUInt8(ttf.readUInt16BE(os2 + 62) & 1, 27);
  fijo.writeUInt32LE(ttf.readUInt16BE(os2 + 4), 28); fijo.writeUInt16LE(ttf.readUInt16BE(os2 + 8), 32); fijo.writeUInt16LE(0x504C, 34);
  for (let i = 0; i < 4; i++) fijo.writeUInt32LE(ttf.readUInt32BE(os2 + 42 + 4 * i), 36 + 4 * i);
  for (let i = 0; i < 2; i++) fijo.writeUInt32LE(ttf.readUInt32BE(os2 + 78 + 4 * i), 52 + 4 * i);
  fijo.writeUInt32LE(ttf.readUInt32BE(head + 8), 60);
  const partes = [fijo];
  cadenas.forEach(c => { const t = Buffer.alloc(4); t.writeUInt16LE(c.length, 2); partes.push(t, c); });
  partes.push(Buffer.alloc(4), ttf);
  const eot = Buffer.concat(partes); eot.writeUInt32LE(eot.length, 0);
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
  pr = pr.replace(/<p:presentation\b/, '<p:presentation embedTrueTypeFonts="1"').replace(/(<p:notesSz[^>]*\/>)/, `$1<p:embeddedFontLst>${lista}</p:embeddedFontLst>`);
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
  console.log('listo', OUT, '·', G.PRINCIPAL.length, 'láminas + 2 de bibliografía +', G.ANEXO.length + 1, 'de anexo');
})();
