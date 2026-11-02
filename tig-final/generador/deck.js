// TIG · entrega final · Control de Gestión (ICMA901, UNAB) · Lumine Motors (versión posterior a la retroalimentación, 31-10-2026)
// Concepto visual: «cuaderno de ingeniería». Cada lámina es una hoja de plano: papel cuadriculado claro, marco con marcas de
// centrado y un cajetín abajo a la derecha con el número de lámina. Los datos se anotan como en un plano: cotas, reglas
// graduadas para las matrices, fotos pegadas con su rótulo y notas al margen en serif itálica azul.
// Reglas: fondo claro (pedido del profesor); titulares de 32 a 34 pt, cuerpo de 16 a 24 pt, etiquetas de 12 pt o más;
// escenario base E1; nada de datos simulados; ninguna fuente interna del equipo al pie; bibliografía antes del anexo.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion.js');
const D = {};
const OUT = process.argv[2] || 'Lumine_TIG_Final.pptx';
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
pres.title = 'TIG · Informe final · Lumine Motors';
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
  serif(s, 'un sistema de control de gestión para una empresa que todavía no opera', { x: M, y: 3.6, w: 5.6, h: 1.25, fontSize: 25, color: K.cel });
  mono(s, 'TIG · INFORME FINAL', { x: M, y: 5.0, w: 5, h: 0.3, fontSize: 14, bold: true, color: K.azul });
  T(s, 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', { x: M, y: 5.35, w: 5.8, h: 0.36, fontSize: 17 });
  T(s, 'Profesor Leonardo Lizana Contreras', { x: M, y: 5.75, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
  T(s, 'Santiago, noviembre de 2026', { x: M, y: 6.07, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
  // auto en rayos X con sus piezas acotadas
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
  pieza(0.47, 0.61, 5.55, 'BATERÍAS LFP', 'se cargan al frenar', 1.75, true);
  pieza(0.70, 0.60, 5.55, 'MOTOR ELÉCTRICO', 'en el eje trasero', 1.75);
  return s;
};

D.contexto = () => {
  const s = contenido('02 · EL PROBLEMA', 'USAR EL AUTO CUESTA MÁS', 'y nadie lo cambia.');
  mono(s, 'BENCINA 93 · REGIÓN METROPOLITANA · $ POR LITRO', { x: M, y: Y0 + 0.05, w: 6, h: 0.28, fontSize: 13 });
  num(s, '$1.168,9', { x: M, y: Y0 + 0.4, w: 2.7, h: 0.8, fontSize: 44, color: K.gris });
  num(s, '$1.538,9', { x: M + 3.05, y: Y0 + 0.3, w: 3.0, h: 0.9, fontSize: 54 });
  mono(s, 'ANTES DEL ALZA', { x: M, y: Y0 + 1.25, w: 2.4, h: 0.26, fontSize: 12 });
  mono(s, 'MARZO DE 2026', { x: M + 3.05, y: Y0 + 1.25, w: 2.8, h: 0.26, fontSize: 12, color: K.tx, bold: true });
  cota(s, M + 0.1, M + 5.6, Y0 + 1.95, '+ $370 POR LITRO', { size: 16 });
  num(s, '3,5', { x: M, y: Y0 + 2.25, w: 1.5, h: 1.0, fontSize: 64, color: K.cel });
  T(s, 'autos usados transferidos por cada nuevo inscrito, de enero a agosto de 2026', { x: M + 1.6, y: Y0 + 2.45, w: 4.3, h: 0.8, fontSize: 18, valign: 'middle' });
  serif(s, 'Quien trabaja con su auto paga más por kilómetro y no tiene el capital para cambiarlo.', { x: M, y: Y0 + 3.45, w: 5.9, h: 0.8, fontSize: 21 });
  foto(s, 'bencinera-santiago.jpg', 7.0, Y0 + 0.05, R - 7.0, (R - 7.0) * 9 / 16);
  fuente(s, 'Garretón (2026), con datos de la CNE · CNN Chile (2026), con datos de la CAVEM');
  return s;
};

D.arbol = () => {
  const s = contenido('03 · SUPUESTO DE PARTIDA', 'EL REGLAMENTO AÚN NO EXISTE:', 'partimos de E1.');
  const nodo = (x, y, w, h, t, o = {}) => { caja(s, x, y, w, h, o.caja || {}); T(s, t, { x: x + 0.12, y, w: w - 0.24, h, fontSize: o.size || 16, valign: 'middle', align: 'center', bold: o.bold }); };
  const cy = 4.3;
  nodo(M, cy - 0.5, 2.15, 1.0, 'Reglamento de la Ley N° 21.793', { bold: true });
  nodo(3.35, cy - 0.5, 2.4, 1.0, '¿Acepta conservar el motor?');
  nodo(6.45, 2.55, 2.6, 1.0, '¿Mantiene las exclusiones? (ABS, airbag)');
  nodo(6.45, 5.05, 2.6, 1.0, '¿Procede la alteración de características?');
  linea(s, M + 2.15, cy, 3.35 - M - 2.15, 0, K.tx, 1.25);
  // Q1 → Q2 (sí) y Q3 (no)
  linea(s, 5.75, cy, 0.35, 0, K.tx, 1.25); linea(s, 6.1, 3.05, 0, 2.5, K.tx, 1.25);
  linea(s, 6.1, 3.05, 0.35, 0, K.tx, 1.25); linea(s, 6.1, 5.55, 0.35, 0, K.tx, 1.25);
  mono(s, 'SÍ', { x: 5.8, y: 3.12, w: 0.3, h: 0.24, fontSize: 12, bold: true, color: K.tx });
  mono(s, 'NO', { x: 5.8, y: 5.2, w: 0.35, h: 0.24, fontSize: 12, bold: true, color: K.tx });
  const hoja = (y, cod, t, base) => {
    if (base) cajaAzul(s, 9.75, y, R - 9.75, 0.62); else caja(s, 9.75, y, R - 9.75, 0.62);
    T(s, [{ text: cod + '  ', options: { fontFace: F_MONO, bold: true, color: base ? K.azul : K.tx } }, { text: t, options: { bold: base } }], { x: 9.9, y, w: R - 9.9, h: 0.62, fontSize: 17, valign: 'middle' });
  };
  // Q2 → E1 (no) y E2 (sí); Q3 → E3 (sí) y E4 (no)
  const rama = (x0, y0, ya, yb, la, lb) => {
    linea(s, x0, y0, 0.3, 0, K.tx, 1.25); linea(s, x0 + 0.3, ya + 0.31, 0, yb - ya, K.tx, 1.25);
    linea(s, x0 + 0.3, ya + 0.31, 0.4, 0, K.tx, 1.25); linea(s, x0 + 0.3, yb + 0.31, 0.4, 0, K.tx, 1.25);
    mono(s, la, { x: x0 + 0.33, y: ya + 0.02, w: 0.4, h: 0.24, fontSize: 12, bold: true, color: K.tx });
    mono(s, lb, { x: x0 + 0.33, y: yb + 0.36, w: 0.4, h: 0.24, fontSize: 12, bold: true, color: K.tx });
  };
  rama(9.05, 3.05, 2.2, 3.0, 'NO', 'SÍ');
  hoja(2.2, 'E1', 'Vía amplia', true); hoja(3.0, 'E2', 'Vía acotada');
  rama(9.05, 5.55, 4.7, 5.5, 'SÍ', 'NO');
  hoja(4.7, 'E3', 'Vía alternativa'); hoja(5.5, 'E4', 'Sin vía');
  marca(s, 'ESCENARIO BASE', R, 1.86, { derecha: true, color: K.azul, dash: 'solid' });
  serif(s, 'La ley es posterior al borrador de 2021 y suma «otras adaptaciones»; el kit conserva los sistemas de seguridad.', { x: M, y: 2.25, w: 5.0, h: 1.0, fontSize: 19 });
  marca(s, 'SUPUESTO DECLARADO · SE MIDE EN P1', M, 5.6, {});
  fuente(s, 'Ley N° 21.793 (2026) · Subsecretaría de Transportes (2021) · Anexo A1');
  return s;
};

D.lienzo = () => {
  const s = contenido('04 · PROPUESTA DE VALOR', 'CADA FRUSTRACIÓN TIENE SU ALIVIADOR', null);
  const Z = 13, RH = 0.32;
  const item = (x, y, cod, t, w) => {
    mono(s, cod, { x, y, w: 0.34, h: RH, fontSize: 11, bold: true, color: K.cel, valign: 'middle' });
    T(s, t, { x: x + 0.34, y, w, h: RH, fontSize: Z, valign: 'middle' });
  };
  // cuadrado: mapa de valor (4,4 in, con 0,2 in de aire en el borde interior)
  const sx = M, sy = 2.15, sq = 4.4, cx = sx + sq / 2, cy = sy + sq / 2;
  mono(s, 'MAPA DE VALOR · LUMINE', { x: sx, y: 1.8, w: sq, h: 0.26, fontSize: 12, bold: true, color: K.azul, align: 'center' });
  s.addShape(S.rect, { x: sx, y: sy, w: sq, h: sq, fill: { color: K.blanco }, line: { color: K.tx, width: 2 } });
  linea(s, sx, sy, cx - 0.25 - sx, cy - 0.2 - sy, K.tx, 1.5);
  linea(s, sx, cy + 0.2, cx - 0.25 - sx, sy + sq - cy - 0.2, K.tx, 1.5, { flipV: true });
  linea(s, cx + 0.25, cy, sx + sq - cx - 0.25, 0, K.tx, 1.5);
  s.addShape(S.rect, { x: cx - 0.2, y: cy - 0.08, w: 0.4, h: 0.3, fill: { color: K.blanco }, line: { color: K.tx, width: 1.5 } });
  s.addShape(S.rect, { x: cx - 0.24, y: cy - 0.17, w: 0.48, h: 0.1, fill: { color: K.blanco }, line: { color: K.tx, width: 1.5 } });
  linea(s, cx, cy - 0.17, 0, 0.39, K.tx, 1.5);
  const tx0 = cx - 0.05, tw = sx + sq - 0.2 - tx0 - 0.34;
  mono(s, 'CREADORES DE ALEGRÍAS', { x: tx0, y: sy + 0.18, w: sx + sq - 0.1 - tx0, h: 0.24, fontSize: 11, bold: true, color: K.tx, charSpacing: 0 });
  [['C1', 'Reporte de consumo'], ['C2', 'Calibración propia'], ['C3', 'Cuota comparable'], ['C4', 'Garantía escrita']].forEach(([k, t], i) => item(tx0, sy + 0.55 + i * 0.36, k, t, tw));
  mono(s, 'ALIVIADORES', { x: cx + 0.34, y: cy + 0.1, w: 2, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  const yr = [cy + 0.42, cy + 0.78, cy + 1.14, cy + 1.5];
  [['R1', 'Hasta −20% bencina'], ['R2', 'No cambia de auto'], ['R3', 'Respaldo formal'], ['R4', 'Ahorro medido']].forEach(([k, t], i) => item(tx0, yr[i], k, t, tw));
  mono(s, 'PRODUCTOS', { x: sx + 0.2, y: cy - 0.55, w: 1.6, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['Kit e instalación', 'Diagnóstico', 'Medición'].forEach((t, i) => T(s, t, { x: sx + 0.2, y: cy - 0.27 + i * 0.3, w: 1.6, h: 0.28, fontSize: 13, valign: 'middle' }));
  // círculo: perfil del cliente
  const ox = 10.25, oy = cy, r = 2.2, a = 40 * Math.PI / 180;
  mono(s, 'PERFIL · CONDUCTOR DE USO INTENSIVO', { x: ox - r - 0.3, y: 1.8, w: 2 * r + 0.6, h: 0.26, fontSize: 12, bold: true, color: K.azul, align: 'center' });
  s.addShape(S.ellipse, { x: ox - r, y: oy - r, w: 2 * r, h: 2 * r, fill: { color: K.blanco }, line: { color: K.tx, width: 2 } });
  const ex = ox + r * Math.cos(a), eyU = oy - r * Math.sin(a), eyD = oy + r * Math.sin(a);
  linea(s, ox + 0.2, eyU, ex - ox - 0.2, oy - 0.12 - eyU, K.tx, 1.5, { flipV: true });
  linea(s, ox + 0.2, oy + 0.12, ex - ox - 0.2, eyD - oy - 0.12, K.tx, 1.5);
  linea(s, ox - r, oy, r - 0.22, 0, K.tx, 1.5);
  s.addShape(S.ellipse, { x: ox - 0.22, y: oy - 0.22, w: 0.44, h: 0.44, fill: { color: K.blanco }, line: { color: K.tx, width: 1.5 } });
  s.addShape(S.ellipse, { x: ox + 0.02, y: oy - 0.09, w: 0.06, h: 0.06, fill: { color: K.tx }, line: { type: 'none' } });
  const izq = y => ox - Math.sqrt(Math.max(0, r * r - (y - oy) ** 2));
  const xFila = y => Math.max(izq(y), izq(y + RH)) + 0.3; // 0,3 in de aire respecto del círculo
  mono(s, 'ALEGRÍAS', { x: xFila(oy - 2.0), y: oy - 2.0, w: 1.4, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['Ver el ahorro cada mes', 'Seguir con su auto', 'Cuota menor al ahorro', 'Taller que responde'].forEach((t, i) => {
    const y = oy - 1.7 + i * 0.36;
    item(xFila(y), y, `G${i + 1}`, t, 2.2);
  });
  mono(s, 'FRUSTRACIONES', { x: xFila(oy + 0.1), y: oy + 0.1, w: 1.8, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['La bencina sube', 'Sin capital para cambiar', 'Teme perder el seguro', 'No sabe cuánto ahorra'].forEach((t, i) => {
    const y = yr[i], x = xFila(y);
    item(x, y, `F${i + 1}`, t, 2.25);
    flecha(s, x - 0.08, y + RH / 2, sx + sq + 0.08, y + RH / 2, K.cel, 1.5);
  });
  // trabajos: en la parte ancha de la cuña derecha
  mono(s, 'TRABAJOS', { x: ox + 0.95, y: oy - 0.5, w: 1.0, h: 0.22, fontSize: 11, bold: true, color: K.tx });
  ['Muchos km', 'Costo por km'].forEach((t, i) => T(s, t, { x: ox + 0.95, y: oy - 0.22 + i * 0.3, w: 1.05, h: 0.28, fontSize: 12, valign: 'middle' }));
  flecha(s, sx + sq + 0.3, oy - 0.3, ox - r - 0.3, oy - 0.3, K.tx, 1.25, { doble: true });
  fuente(s, 'Adaptado de Osterwalder et al. (2014) · Entrevistas: indicio · R1: estimación');
  return s;
};

D.canvas = () => {
  const s = contenido('05 · MODELO DE NEGOCIO', 'TALLER PROPIO PRIMERO,', 'licencias después.');
  const x0 = M, y0 = Y0, w = CW / 5, hT = 3.35, hB = YF - y0 - hT;
  const bloque = (x, y, bw, bh, titulo, items, o = {}) => {
    s.addShape(S.rect, { x, y, w: bw, h: bh, fill: { color: o.azul ? K.suave : K.blanco }, line: { color: K.tx, width: 1 } });
    mono(s, titulo, { x: x + 0.1, y: y + 0.08, w: bw - 0.2, h: 0.26, fontSize: 12, bold: true, color: K.azul });
    T(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 3 } })), { x: x + 0.12, y: y + 0.38, w: bw - 0.26, h: bh - 0.5, fontSize: o.size || 14, bold: o.negrita });
  };
  bloque(x0, y0, w, hT, 'SOCIOS CLAVE', ['Proveedores del kit', 'Aseguradoras y plantas de revisión técnica', 'Entidad financiera', 'Talleres licenciados (año 2)']);
  bloque(x0 + w, y0, w, hT / 2, 'ACTIVIDADES', ['Diagnóstico', 'Instalación y calibración', 'Homologación por par'], { size: 13 });
  bloque(x0 + w, y0 + hT / 2, w, hT / 2, 'RECURSOS', ['Biblioteca de calibraciones', 'Estimador y Habilita', 'Técnicos de alta tensión'], { size: 13 });
  bloque(x0 + 2 * w, y0, w, hT, 'PROPUESTA DE VALOR', ['Ahorrar con el mismo auto, sin tocar el motor', 'Calibración para su modelo', 'Ahorro medido, no prometido', 'Respaldo ante seguro y revisión técnica'], { azul: true, size: 15 });
  bloque(x0 + 3 * w, y0, w, hT / 2, 'RELACIÓN', ['Diagnóstico y reporte de ahorro', 'Posventa con seguimiento'], { size: 13 });
  bloque(x0 + 3 * w, y0 + hT / 2, w, hT / 2, 'CANALES', ['Estimador web', 'Convenios con flotas', 'Taller propio, luego red'], { size: 13 });
  bloque(x0 + 4 * w, y0, w, hT, 'SEGMENTOS', ['Conductores de uso intensivo de la RM', 'Particulares de alto kilometraje', 'Talleres que licencian (2.ª línea)']);
  bloque(x0, y0 + hT, CW / 2, hB, 'COSTOS', ['Kit importado, pagado en dólares', 'Personal técnico, calibración y homologación']);
  bloque(x0 + CW / 2, y0 + hT, CW / 2, hB, 'INGRESOS', ['Venta e instalación del kit Esencial o Plus', 'Posventa, recalibración y licencias a la red']);
  fuente(s, 'Adaptado de Osterwalder y Pigneur (2010) · Socios y red: por formalizar');
  return s;
};

D.identidad = () => {
  const s = contenido('06 · DECLARACIONES', 'MISIÓN CON ALCANCE,', 'visión con cifra y plazo.');
  const xL = M, wL = 5.9;
  mono(s, 'MISIÓN', { x: xL, y: Y0, w: 3, h: 0.28, bold: true, color: K.azul });
  serif(s, '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, en Chile y partiendo por la Región Metropolitana, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»', { x: xL, y: Y0 + 0.32, w: wL, h: 2.1, fontSize: 19, color: K.tx });
  mono(s, 'FINES', { x: xL, y: Y0 + 2.4, w: 3, h: 0.28, bold: true, color: K.azul });
  T(s, 'Rentar sobre el costo del capital (F1) y crecer con la red, sin activos propios', { x: xL, y: Y0 + 2.68, w: wL, h: 0.6, fontSize: 17 });
  mono(s, 'VALORES COMO REGLAS', { x: xL, y: Y0 + 3.35, w: 4, h: 0.28, bold: true, color: K.azul });
  T(s, 'Verificabilidad antes que afirmación: un ahorro sin medir no se comunica', { x: xL, y: Y0 + 3.63, w: wL, h: 0.6, fontSize: 17 });
  const xR = 7.2, wR = R - xR;
  linea(s, xR - 0.35, Y0, 0, YF - Y0, K.linea, 1);
  mono(s, 'VISIÓN', { x: xR, y: Y0, w: 3, h: 0.28, bold: true, color: K.azul });
  T(s, 'Ser el taller de referencia en hibridación de vehículos en uso en Chile, reconocido por la autoridad, las plantas de revisión y las aseguradoras', { x: xR, y: Y0 + 0.35, w: wR, h: 1.45, fontSize: 18, bold: true });
  [['2031', 'PLAZO'], ['2.715', 'INSTALACIONES PROPIAS AL AÑO'], ['42', 'TALLERES CERTIFICADOS']].forEach(([n, t], i) => {
    const x = xR + i * (wR / 3);
    num(s, n, { x, y: Y0 + 1.95, w: wR / 3 - 0.1, h: 0.95, fontSize: 52, color: i ? K.tx : K.cel });
    linea(s, x, Y0 + 2.98, wR / 3 - 0.2, 0, K.tx, 1);
    mono(s, t, { x, y: Y0 + 3.05, w: wR / 3 - 0.15, h: 0.55, fontSize: 12, bold: true, color: K.tx });
  });
  marca(s, 'METAS DEL PLAN · POR REVISAR', xR, Y0 + 3.95, { dash: 'sysDot', size: 12 });
  fuente(s, 'Kovacevic y Reynoso (2010) · Francés (2006)');
  return s;
};

// ===================================================================== BENJAMÍN
D.entorno = () => {
  const s = contenido('07 · ENTORNO', 'HAY OPORTUNIDADES,', 'pero hoy no las aprovechamos.');
  mono(s, 'PEST · ESCALA 1 A 5 · NEUTRO 3', { x: M, y: Y0, w: 5, h: 0.28 });
  num(s, '2,82', { x: M, y: Y0 + 0.3, w: 2.0, h: 0.9, fontSize: 54 });
  T(s, 'moderadamente desfavorable', { x: M + 2.05, y: Y0 + 0.62, w: 3.0, h: 0.5, fontSize: 18, color: K.gris });
  const bx = M + 2.15, bw = 2.9, bU = bw / 5;
  [['Tecnológica', 3.23], ['Sociocultural', 3.00], ['Político-jurídica', 2.67], ['Económica', 2.38]].forEach(([k, v], i) => {
    const y = Y0 + 1.45 + i * 0.5;
    T(s, k, { x: M, y, w: 2.05, h: 0.4, fontSize: 16, valign: 'middle' });
    s.addShape(S.rect, { x: bx, y: y + 0.08, w: v * bU, h: 0.24, fill: { color: v >= 3 ? K.cel : K.medio }, line: { type: 'none' } });
    T(s, v.toFixed(2).replace('.', ','), { x: bx + v * bU + 0.08, y, w: 0.7, h: 0.4, fontSize: 16, bold: true, valign: 'middle' });
  });
  linea(s, bx + 3 * bU, Y0 + 1.4, 0, 2.0, K.tx, 1, { line: { color: K.tx, width: 1, dashType: 'dash' } });
  mono(s, 'NEUTRO', { x: bx + 3 * bU - 0.4, y: Y0 + 3.42, w: 0.8, h: 0.24, fontSize: 11, align: 'center' });
  serif(s, 'Ayuda la tecnología (LFP a US$81/kWh); frena la economía (desocupación de 9,6%).', { x: M, y: Y0 + 3.6, w: 5.6, h: 0.7, fontSize: 18 });
  // MEFE
  const xR = 7.0, wR = R - xR - 0.2;
  mono(s, 'MEFE · 7 OPORTUNIDADES Y 9 AMENAZAS NUMERADAS', { x: xR, y: Y0, w: wR + 0.2, h: 0.28, bold: true, color: K.azul });
  regla(s, xR + 0.1, Y0 + 2.35, wR - 0.2, [{ v: 2.03, n: '2,03', t: 'HOY' }, { v: 2.75, n: '2,75', t: 'CON HITOS', color: K.cel, hueco: true, dash: 'dash' }], { alto: 1.45 });
  T(s, [{ text: 'Mayor peso: ', options: { bold: true } }, { text: 'O3 vacío de oferta formal y A1 el borrador de 2021 (0,079 cada uno).' }], { x: xR, y: Y0 + 3.05, w: wR + 0.2, h: 0.65, fontSize: 16 });
  marca(s, 'CALIFICACIONES DEL EQUIPO · POR VALIDAR', xR, Y0 + 3.85, { dash: 'sysDot' });
  fuente(s, 'BloombergNEF (2025) · Banco Central (2026a) · INE (2026) · David (1997)');
  return s;
};

D.porter = () => {
  const s = contenido('08 · CINCO FUERZAS', 'LA INERCIA NO ES UN SUSTITUTO:', 'es poder del cliente.');
  const lx = M, bx = M + 3.2, bw = 4.6, U = bw / 5;
  mono(s, 'INTENSIDAD 0 A 5 · PESO', { x: lx, y: Y0, w: 4, h: 0.28 });
  [['Sustitutos', '30%', 3.67, 5.00], ['Nuevos entrantes', '20%', 3.75], ['Clientes', '25%', 2.83, 2.64], ['Proveedores', '15%', 2.67], ['Rivalidad', '10%', 1.83]].forEach(([k, p, v, antes], i) => {
    const y = Y0 + 0.4 + i * 0.72, cambia = antes !== undefined;
    T(s, k, { x: lx, y, w: 2.4, h: 0.5, fontSize: 18, bold: cambia, valign: 'middle' });
    mono(s, p, { x: lx + 2.4, y, w: 0.7, h: 0.5, fontSize: 13, valign: 'middle' });
    if (cambia) s.addShape(S.rect, { x: bx, y: y + 0.1, w: antes * U, h: 0.3, fill: { color: K.blanco, transparency: 100 }, line: { color: K.gris, width: 1, dashType: 'dash' } });
    s.addShape(S.rect, { x: bx, y: y + 0.1, w: v * U, h: 0.3, fill: { color: cambia ? K.cel : K.medio }, line: { type: 'none' } });
    T(s, v.toFixed(2).replace('.', ','), { x: bx + Math.max(v, antes || 0) * U + 0.1, y, w: 0.8, h: 0.5, fontSize: 18, bold: true, valign: 'middle' });
    if (cambia) mono(s, `ANTES ${antes.toFixed(2).replace('.', ',')}`, { x: bx + antes * U - 1.4, y: y + 0.42, w: 1.4, h: 0.22, fontSize: 11, align: 'right' });
  });
  const xR = 9.75, wR = R - xR;
  mono(s, 'INTENSIDAD PONDERADA', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  num(s, '3,14', { x: xR, y: Y0 + 0.3, w: wR, h: 1.0, fontSize: 60, color: K.cel });
  T(s, 'media · antes 3,49', { x: xR, y: Y0 + 1.3, w: wR, h: 0.36, fontSize: 17, color: K.gris });
  mono(s, 'SUSTITUTOS REALES', { x: xR, y: Y0 + 1.95, w: wR, h: 0.28, bold: true, color: K.azul });
  [['Gas', 'solo autos de hasta 7 años'], ['Híbrido usado', '$9,5 a $13 millones'], ['Eléctrico nuevo', 'desde $13.990.000']].forEach(([a, b], i) =>
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: K.gris } }], { x: xR, y: Y0 + 2.3 + i * 0.68, w: wR, h: 0.64, fontSize: 16 }));
  fuente(s, 'Porter (2008) · BioBioChile, KMcheck y Autofact (2026) · D. S. N° 55 (1988)');
  return s;
};

D.interno = () => {
  const s = contenido('09 · ANÁLISIS INTERNO', 'LA VENTAJA ES UN SISTEMA', 'que acumula conocimiento.');
  const cx = 4.05, cy = 4.4, rx = 2.15, ry = 1.65;
  const nodos = [['Instalación calibrada', 0], ['Medición con línea base', 1], ['Biblioteca y base de consumo', 1], ['Estimador que aprende', 1], ['Lumine Habilita', 2], ['Red que devuelve datos', 0]];
  const pos = nodos.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / nodos.length; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const bw = 2.15, bh = 0.62;
  const borde = (dx, dy) => Math.min(dx ? (bw / 2) / Math.abs(dx) : 1e9, dy ? (bh / 2) / Math.abs(dy) : 1e9);
  pos.forEach(([x, y], i) => {
    const [x2, y2] = pos[(i + 1) % pos.length];
    const dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy), t0 = borde(dx, dy) + 0.06 / L, t1 = borde(dx, dy) + 0.1 / L;
    flecha(s, x + dx * t0, y + dy * t0, x2 - dx * t1, y2 - dy * t1, K.azul, 1.75);
  });
  nodos.forEach(([t, c], i) => {
    const [x, y] = pos[i];
    if (c === 1) cajaAzul(s, x - bw / 2, y - bh / 2, bw, bh);
    else if (c === 2) caja(s, x - bw / 2, y - bh / 2, bw, bh, { fill: { color: K.tx }, line: { color: K.tx, width: 1 } });
    else caja(s, x - bw / 2, y - bh / 2, bw, bh);
    T(s, t, { x: x - bw / 2 + 0.06, y: y - bh / 2, w: bw - 0.12, h: bh, fontSize: 15, bold: c > 0, align: 'center', valign: 'middle', color: c === 2 ? K.blanco : K.tx });
  });
  serif(s, 'Un competidor puede comprar el kit; la historia de datos, no.', { x: cx - 1.3, y: cy - 0.42, w: 2.6, h: 0.9, fontSize: 17, align: 'center', valign: 'middle' });
  const xR = 7.75, wR = R - xR;
  mono(s, 'DOS COMPETENCIAS CENTRALES', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  s.addShape(S.rect, { x: xR, y: Y0 + 0.42, w: 0.32, h: 0.32, fill: { color: K.suave }, line: { color: K.cel, width: 1.5 } });
  T(s, 'Calibración y medición', { x: xR + 0.45, y: Y0 + 0.36, w: wR - 0.45, h: 0.44, fontSize: 17, bold: true, valign: 'middle' });
  s.addShape(S.rect, { x: xR, y: Y0 + 0.92, w: 0.32, h: 0.32, fill: { color: K.tx }, line: { color: K.tx, width: 1 } });
  T(s, 'Método Lumine Habilita', { x: xR + 0.45, y: Y0 + 0.86, w: wR - 0.45, h: 0.44, fontSize: 17, bold: true, valign: 'middle' });
  mono(s, '17 RECURSOS · CRITERIOS DE HITT', { x: xR, y: Y0 + 1.55, w: wR, h: 0.28, bold: true, color: K.azul });
  const segs = [[3, K.cel, '3 sostenibles (potencial)'], [7, K.medio, '7 temporales'], [7, K.linea, '7 de igualdad']];
  let xx = xR; const u = wR / 17;
  segs.forEach(([n, c, t], i) => {
    s.addShape(S.rect, { x: xx, y: Y0 + 1.92, w: n * u, h: 0.32, fill: { color: c }, line: { color: K.blanco, width: 1 } }); xx += n * u;
    const lx = xR + i * (wR / 3);
    s.addShape(S.rect, { x: lx, y: Y0 + 2.36, w: 0.18, h: 0.18, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.24, y: Y0 + 2.28, w: wR / 3 - 0.26, h: 0.5, fontSize: 13, color: K.tx });
  });
  T(s, 'La ingeniería de integración queda en igualdad: cualquiera con ingenieros la contrata.', { x: xR, y: Y0 + 2.75, w: wR, h: 0.7, fontSize: 16, color: K.gris });
  mono(s, 'MEFI', { x: xR, y: Y0 + 3.55, w: 1, h: 0.28, bold: true, color: K.azul });
  T(s, [{ text: '2,32', options: { fontFace: F_CON, bold: true, fontSize: 36 } }, { text: '  hoy  →  ', options: { color: K.gris, fontSize: 16 } }, { text: '2,96', options: { fontFace: F_CON, bold: true, fontSize: 36, color: K.cel } }, { text: '  con hitos', options: { color: K.gris, fontSize: 16 } }], { x: xR, y: Y0 + 3.8, w: wR, h: 0.6, valign: 'middle' });
  fuente(s, 'Hitt et al. (2004) · Porter (1996) · David (1997) · Anexos A3 y A5');
  return s;
};

D.cruces = () => {
  const s = contenido('10 · CRUCES DEL FODA', 'HOY DEFENSIVOS;', 'ofensivos cuando se cumplan los hitos.');
  const x0 = M + 0.55, y0 = Y0 + 0.35, cw = 3.4, ch = 1.95;
  mono(s, 'FORTALEZAS', { x: x0, y: Y0, w: cw, h: 0.28, bold: true, align: 'center', color: K.tx });
  mono(s, 'DEBILIDADES', { x: x0 + cw, y: Y0, w: cw, h: 0.28, bold: true, align: 'center', color: K.tx });
  mono(s, 'OPORTUNIDADES', { x: M - 0.62, y: y0 + ch / 2 - 0.14, w: 1.9, h: 0.28, bold: true, align: 'center', color: K.tx, rotate: 270 });
  mono(s, 'AMENAZAS', { x: M - 0.62, y: y0 + ch * 1.5 - 0.14, w: 1.9, h: 0.28, bold: true, align: 'center', color: K.tx, rotate: 270 });
  const celda = (i, j, cod, items, hoy) => {
    const x = x0 + j * cw, y = y0 + i * ch;
    if (hoy) caja(s, x, y, cw, ch, { fill: { color: K.blanco }, line: { color: K.tx, width: 1 } });
    else cajaAzul(s, x, y, cw, ch);
    mono(s, cod, { x: x + 0.15, y: y + 0.1, w: 1, h: 0.3, fontSize: 16, bold: true, color: hoy ? K.tx : K.azul });
    marca(s, hoy ? 'HOY' : 'CON E1 Y PILOTO', x + cw - 0.12, y + 0.1, { derecha: true, color: hoy ? K.tx : K.azul, dash: hoy ? 'solid' : 'dash', size: 11, h: 0.28 });
    T(s, items.map(([k, t], n) => ({ text: '', options: {} }) && [{ text: k + ' ', options: { fontFace: F_MONO, bold: true, fontSize: 12, color: K.azul } }, { text: t, options: { breakLine: n < items.length - 1 } }]).flat(), { x: x + 0.15, y: y + 0.48, w: cw - 0.3, h: ch - 0.55, fontSize: 14, paraSpaceAfter: 3 });
  };
  celda(0, 0, 'FO', [['FO1', 'Calibración para tu modelo'], ['FO2', 'Antecedentes al MTT'], ['FO3', 'Licenciar tras el piloto']], false);
  celda(0, 1, 'DO', [['DO1', 'Medir el ahorro en el piloto'], ['DO2', 'Expediente del primer par'], ['DO3', 'Cuota comparable al ahorro']], true);
  celda(1, 0, 'FA', [['FA1', 'Mismo auto, sin enchufe ni límite de antigüedad'], ['FA2', 'Habilita y franquicia SENCE']], false);
  celda(1, 1, 'DA', [['DA1', 'Cobertura cambiaria'], ['DA2', 'Convenios con casos piloto'], ['DA3', 'Proteger las calibraciones']], true);
  const xR = 8.35, wR = R - xR;
  caja(s, xR, y0, wR, 1.7);
  mono(s, 'HOY · DEFENSIVA', { x: xR + 0.2, y: y0 + 0.12, w: wR - 0.4, h: 0.28, bold: true, color: K.tx });
  T(s, [{ text: 'MEFE 2,03 · MEFI 2,32', options: { bold: true, breakLine: true } }, { text: 'ambas bajo 2,5: primero DO y DA', options: { color: K.gris } }], { x: xR + 0.2, y: y0 + 0.5, w: wR - 0.4, h: 1.0, fontSize: 18 });
  flecha(s, xR + wR / 2, y0 + 1.78, xR + wR / 2, y0 + 2.18, K.azul, 2);
  cajaAzul(s, xR, y0 + 2.25, wR, 1.65);
  mono(s, 'CON E1 Y PILOTO · OFENSIVA', { x: xR + 0.2, y: y0 + 2.37, w: wR - 0.3, h: 0.28, bold: true, color: K.azul, fontSize: 12 });
  T(s, [{ text: 'MEFE 2,75 · MEFI 2,96', options: { bold: true, breakLine: true } }, { text: 'sobre 2,5: FO en el nicho', options: { color: K.gris } }], { x: xR + 0.2, y: y0 + 2.75, w: wR - 0.4, h: 1.0, fontSize: 18 });
  fuente(s, 'David (1997) · Las 11 estrategias y su objetivo del CMI: anexo A6');
  return s;
};

D.estrategia = () => {
  const s = contenido('11 · ESTRATEGIA Y OBJETIVOS', 'DIFERENCIACIÓN ENFOCADA:', 'competir con evidencia.');
  serif(s, '«El mismo auto, ahora híbrido, con un ahorro medido y una calibración hecha para su modelo.»', { x: M, y: Y0, w: 7.6, h: 0.95, fontSize: 24, color: K.tx });
  foto(s, 'kit-tres-piezas.jpg', 9.0, Y0 - 0.15, R - 9.0, (R - 9.0) * 9 / 16);
  const ejes = [['EJE 1 · HABILITACIÓN FORMAL', 'Autorización, primer par y alianzas', 'P1 · P2 · P6'], ['EJE 2 · ACCESO COMERCIAL', 'Alto kilometraje, con crédito', 'C4 · P6'], ['EJE 3 · CONOCIMIENTO Y ESCALA', 'Biblioteca, medición y red', 'A1–A4 · P4 · P5 · C2 · F3']];
  const g = 0.25, w = (CW - 2 * g) / 3, y = Y0 + 2.2, h = 1.65;
  ejes.forEach(([k, t, o], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h);
    mono(s, k, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.28, fontSize: 12, bold: true, color: K.azul });
    T(s, t, { x: x + 0.15, y: y + 0.45, w: w - 0.3, h: 0.75, fontSize: 18, bold: true });
    mono(s, o, { x: x + 0.15, y: y + 1.25, w: w - 0.3, h: 0.3, fontSize: 14, bold: true, color: K.tx });
  });
  T(s, [{ text: '17 objetivos ', options: { bold: true } }, { text: 'con verbo y resultado verificable · ' }, { text: 'Renuncias: ', options: { bold: true } }, { text: 'precio bajo e inmediatez' }], { x: M, y: y + h + 0.12, w: CW, h: 0.38, fontSize: 17, valign: 'middle' });
  fuente(s, 'Porter (1996) · Kaplan y Norton (2008) · Imagen ilustrativa del kit');
  return s;
};

// ===================================================================== LUKAS
D.mapa = () => {
  const s = contenido('12 · CUADRO DE MANDO INTEGRAL', 'TRES RUTAS:', '17 objetivos y 20 relaciones', { unaLinea: true });
  const w = 10.9, h = w * 842 / 2048;
  s.addImage({ path: A('mapa.png'), x: (W - w) / 2, y: 1.85, w, h, altText: 'Mapa estratégico de Lumine Motors' });
  fuente(s, 'Kaplan y Norton (2008) · Indicador, meta y responsable: anexo A7');
  return s;
};

const SIMB = { sin: 'sin', pen: 'pen' };
function estadoIcono(s, tipo, x, y, d = 0.26) {
  if (tipo === 'sin') s.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color: K.blanco }, line: { color: K.gris, width: 1.5, dashType: 'dash' } });
  else s.addShape(S.rect, { x, y, w: d, h: d, fill: { color: K.blanco }, line: { color: K.gris, width: 1.5, dashType: 'sysDot' } });
}
D.tablero = () => {
  const s = contenido('13 · LÍNEA BASE', 'EL TABLERO ESTÁ SIN MEDIR,', 'no en rojo.');
  const filas = [['FINANCIERA', ['F1', 'F2', 'F3']], ['CLIENTES', ['C1', 'C2', 'C3', 'C4']], ['PROCESOS', ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']], ['APRENDIZAJE', ['A1', 'A2', 'A3', 'A4']]];
  const pend = ['P5', 'C3', 'C4', 'F2', 'F3'], hitos = ['A3', 'P1', 'P2', 'P6'];
  filas.forEach(([k, ids], i) => {
    const y = Y0 + 0.1 + i * 0.95;
    mono(s, k, { x: M, y, w: 1.7, h: 0.7, fontSize: 12, bold: true, valign: 'middle' });
    ids.forEach((id, j) => {
      const x = M + 1.75 + j * 0.88;
      caja(s, x, y, 0.8, 0.7, hitos.includes(id) ? { line: { color: K.azul, width: 2 } } : {});
      mono(s, id, { x, y: y + 0.04, w: 0.8, h: 0.3, fontSize: 14, bold: true, color: K.tx, align: 'center' });
      estadoIcono(s, pend.includes(id) ? 'pen' : 'sin', x + 0.27, y + 0.37, 0.26);
    });
  });
  const ly = Y0 + 3.95;
  estadoIcono(s, 'sin', M, ly + 0.05, 0.24); mono(s, 'SIN MEDIR', { x: M + 0.32, y: ly, w: 1.4, h: 0.34, fontSize: 12, valign: 'middle', bold: true });
  estadoIcono(s, 'pen', M + 1.8, ly + 0.05, 0.24); mono(s, 'META PENDIENTE', { x: M + 2.12, y: ly, w: 1.9, h: 0.34, fontSize: 12, valign: 'middle', bold: true });
  s.addShape(S.rect, { x: M + 4.1, y: ly + 0.04, w: 0.3, h: 0.26, fill: { color: K.blanco }, line: { color: K.azul, width: 2 } }); mono(s, 'HITO', { x: M + 4.5, y: ly, w: 0.8, h: 0.34, fontSize: 12, valign: 'middle', bold: true, color: K.azul });
  const xR = 8.0, wR = R - xR;
  [['12', 'SIN MEDIR'], ['5', 'META PENDIENTE'], ['0', 'CUMPLEN O INCUMPLEN']].forEach(([n, t], i) => {
    const x = xR + i * (wR / 3);
    num(s, n, { x, y: Y0, w: wR / 3 - 0.1, h: 0.9, fontSize: 54, color: i === 0 ? K.cel : K.tx });
    mono(s, t, { x, y: Y0 + 0.95, w: wR / 3 - 0.1, h: 0.5, fontSize: 12, bold: true, color: K.tx });
  });
  mono(s, '20 RELACIONES CAUSA-EFECTO', { x: xR, y: Y0 + 1.75, w: wR, h: 0.28, bold: true, color: K.azul });
  let xx = xR; const u = wR / 20;
  [[6, K.tx, 'Habilit. 30%'], [2, K.medio, 'Externas 10%'], [12, K.cel, 'Hipótesis 60%']].forEach(([n, c, t], i) => {
    s.addShape(S.rect, { x: xx, y: Y0 + 2.1, w: n * u, h: 0.42, fill: { color: c }, line: { color: K.blanco, width: 1 } }); xx += n * u;
    const lx = xR + i * (wR / 3);
    s.addShape(S.rect, { x: lx, y: Y0 + 2.66, w: 0.18, h: 0.18, fill: { color: c }, line: { type: 'none' } });
    T(s, t, { x: lx + 0.24, y: Y0 + 2.58, w: wR / 3 - 0.26, h: 0.34, fontSize: 13, color: i === 2 ? K.azul : K.tx, valign: 'middle' });
  });
  mono(s, 'SE ACTIVAN EN CUATRO ETAPAS', { x: xR, y: Y0 + 3.2, w: wR, h: 0.28, bold: true, color: K.azul });
  ['Preparar', 'Piloto', 'Taller', 'Red'].forEach((t, i) => {
    const w = (wR - 0.3) / 4, x = xR + i * (w + 0.1);
    s.addShape(S.chevron, { x, y: Y0 + 3.55, w, h: 0.55, fill: { color: i === 0 ? K.suave : K.blanco }, line: { color: i === 0 ? K.cel : K.tx, width: 1.25 } });
    T(s, t, { x: x + 0.15, y: Y0 + 3.55, w: w - 0.2, h: 0.55, fontSize: 13, bold: i === 0, align: 'center', valign: 'middle' });
  });
  fuente(s, 'Plan de comprobación de las 12 hipótesis: anexo A8');
  return s;
};

D.postura = () => {
  const s = contenido('14 · CUÁNDO CAMBIA LA POSTURA', 'EL REGLAMENTO MARCA', 'el paso a la ofensiva.');
  const x = M + 0.2, w = 7.6;
  mono(s, 'MEFE · FACTORES EXTERNOS', { x: M, y: Y0, w: 5, h: 0.28, bold: true, color: K.azul });
  regla(s, x, Y0 + 1.6, w, [{ v: 2.03, n: '2,03', t: 'HOY', izq: true }, { v: 2.34, n: '2,34', t: 'SIN E1', color: K.gris, hueco: true, dash: 'sysDot', alto: 0 }, { v: 2.75, n: '2,75', t: 'CON E1', color: K.cel }], { alto: 1.3 });
  mono(s, 'MEFI · FACTORES INTERNOS', { x: M, y: Y0 + 2.3, w: 5, h: 0.28, bold: true, color: K.azul });
  regla(s, x, Y0 + 3.85, w, [{ v: 2.32, n: '2,32', t: 'HOY', izq: true }, { v: 2.96, n: '2,96', t: 'HITOS PROPIOS', color: K.cel }], { alto: 1.3 });
  const xR = 8.85, wR = R - xR;
  mono(s, 'MEJORA DE LA MEFE: +0,72', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  const bh = 2.0, u = bh / 0.72;
  s.addShape(S.rect, { x: xR, y: Y0 + 0.45, w: 0.9, h: 0.42 * u, fill: { color: K.cel }, line: { color: K.blanco, width: 1 } });
  s.addShape(S.rect, { x: xR, y: Y0 + 0.45 + 0.42 * u, w: 0.9, h: 0.30 * u, fill: { color: K.medio }, line: { color: K.blanco, width: 1 } });
  T(s, [{ text: '0,42', options: { fontFace: F_CON, bold: true, fontSize: 32, color: K.cel, breakLine: true } }, { text: 'depende del reglamento (O5, A1, A5)', options: { fontSize: 15 } }], { x: xR + 1.05, y: Y0 + 0.45, w: wR - 1.05, h: 1.15 });
  T(s, [{ text: '0,30', options: { fontFace: F_CON, bold: true, fontSize: 28, breakLine: true } }, { text: 'hitos propios y convenios', options: { fontSize: 15 } }], { x: xR + 1.05, y: Y0 + 0.45 + 0.42 * u + 0.02, w: wR - 1.05, h: 0.85 });
  serif(s, 'La ofensiva la marca la publicación del reglamento, no el calendario.', { x: xR, y: Y0 + 2.75, w: wR, h: 1.0, fontSize: 21 });
  marca(s, 'CALIFICACIONES POR VALIDAR', xR, Y0 + 3.9, { dash: 'sysDot' });
  fuente(s, 'David (1997) · Aporte = peso × cambio de calificación · Anexos A2 y A3');
  return s;
};

D.umbral = () => {
  const s = contenido('15 · UMBRAL PARA EL CLIENTE', 'MÁS DE 16.000 LITROS', 'para pagar el kit.');
  mono(s, 'KIT PLUS · $4.990.000 · AHORRO 20% · BENCINA $1.538,9', { x: M, y: Y0, w: 7, h: 0.28 });
  num(s, '16.213', { x: M, y: Y0 + 0.3, w: 3.6, h: 1.1, fontSize: 72, color: K.cel });
  T(s, 'litros de consumo para que el ahorro iguale el precio', { x: M + 3.65, y: Y0 + 0.62, w: 3.2, h: 0.75, fontSize: 17, valign: 'middle' });
  mono(s, 'SI EL AHORRO REAL FUERA MENOR', { x: M, y: Y0 + 1.75, w: 6, h: 0.28, bold: true, color: K.azul });
  const bx = M + 1.2, bw = 4.2, mx = 32426;
  [['20%', 16213], ['15%', 21617], ['10%', 32426]].forEach(([k, v], i) => {
    const y = Y0 + 2.12 + i * 0.6;
    T(s, k, { x: M, y, w: 1.0, h: 0.46, fontSize: 18, bold: true, valign: 'middle' });
    s.addShape(S.rect, { x: bx, y: y + 0.08, w: v / mx * bw, h: 0.3, fill: { color: i === 0 ? K.cel : i === 2 ? K.tx : K.medio }, line: { type: 'none' } });
    T(s, v.toLocaleString('es-CL') + ' L', { x: bx + v / mx * bw + 0.1, y, w: 1.5, h: 0.46, fontSize: 16, bold: true, valign: 'middle' });
  });
  serif(s, 'Con la mitad del ahorro, el umbral se duplica.', { x: M, y: Y0 + 3.95, w: 6.5, h: 0.5, fontSize: 20 });
  const xR = 8.0, wR = R - xR;
  mono(s, 'MESES PARA RECUPERAR EL KIT (PLAN)', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  const tx = xR, tw = wR - 0.1, Mx = 48, ty = Y0 + 1.75, X = m => tx + m / Mx * tw;
  s.addShape(S.rect, { x: tx, y: ty - 0.12, w: tw, h: 0.24, fill: { color: K.suave }, line: { color: K.tx, width: 1 } });
  [0, 12, 24, 36, 48].forEach(m => { linea(s, X(m), ty + 0.12, 0, 0.15, K.tx, 1); mono(s, String(m), { x: X(m) - 0.3, y: ty + 0.3, w: 0.6, h: 0.24, fontSize: 12, align: 'center' }); });
  [[27.5, 'Plus · aplicación', -1], [34.3, 'Plus · colectivo', 1]].forEach(([m, t, lado]) => {
    s.addShape(S.ellipse, { x: X(m) - 0.11, y: ty - 0.11, w: 0.22, h: 0.22, fill: { color: K.cel }, line: { color: K.tx, width: 1 } });
    const yy = lado < 0 ? ty - 1.25 : ty + 0.65;
    if (lado < 0) linea(s, X(m), yy + 0.8, 0, ty - 0.11 - yy - 0.8, K.azul, 1); else linea(s, X(m), ty + 0.11, 0, yy - ty - 0.13, K.azul, 1);
    T(s, [{ text: m.toFixed(1).replace('.', ','), options: { fontFace: F_CON, bold: true, fontSize: 30, breakLine: true } }, { text: t, options: { fontSize: 13, color: K.gris } }], { x: X(m) - 0.9, y: yy, w: 1.8, h: 0.75, align: 'center' });
  });
  mono(s, 'CICLO DE RECAMBIO: 48 MESES', { x: tx, y: ty + 1.5, w: tw, h: 0.28, fontSize: 12, bold: true, align: 'right', color: K.tx });
  marca(s, 'ESTIMACIÓN · AHORRO SIN MEDIR', xR, Y0 + 3.95, {});
  T(s, 'Esencial: 28,9 y 36,6 meses', { x: xR, y: Y0 + 3.55, w: 4, h: 0.34, fontSize: 15, color: K.gris });
  fuente(s, 'Garretón (2026) · Umbral = precio ÷ (ahorro × litro) · Meses: plan del equipo');
  return s;
};

D.recomendaciones = () => {
  const s = contenido('16 · RECOMENDACIONES', 'CUATRO ACCIONES', 'que parten sin esperar el reglamento.');
  const rec = [['1', 'Preparar el expediente técnico y aportar antecedentes al MTT', 'P1 · P2', 'Gerente General'], ['2', 'Aprobar el protocolo de medición y hacer el piloto con el modelo más frecuente', 'A1 · A3 · P2 · C2', 'Ingeniería de Calibración'], ['3', 'Elaborar el Plan Financiero con una tasa de costo de capital sustentada', 'F1 · F2 · F3', 'Gerente General'], ['4', 'Firmar convenios con aseguradora, planta de revisión técnica y financiera', 'P6', 'Gerente General']];
  const g = 0.3, w = (CW - g) / 2, h = 1.85;
  rec.forEach(([n, t, o, r], i) => {
    const x = M + (i % 2) * (w + g), y = Y0 + Math.floor(i / 2) * (h + 0.22);
    caja(s, x, y, w, h);
    num(s, n, { x: x + 0.15, y: y + 0.08, w: 0.6, h: 0.85, fontSize: 48, color: K.cel, valign: 'top' });
    T(s, t, { x: x + 0.85, y: y + 0.15, w: w - 1.0, h: 0.95, fontSize: 18, bold: true });
    mono(s, o, { x: x + 0.85, y: y + 1.22, w: w - 1.0, h: 0.26, fontSize: 12, color: K.azul, bold: true });
    mono(s, r.toUpperCase(), { x: x + 0.85, y: y + 1.48, w: w - 1.0, h: 0.26, fontSize: 12, color: K.gris, bold: true });
  });
  T(s, [{ text: 'Además: ', options: { bold: true } }, { text: 'validar precio y cuota · cubrir el dólar · proteger las calibraciones · revisar el reglamento cada mes' }], { x: M, y: Y0 + 2 * h + 0.32, w: CW, h: 0.38, fontSize: 17, valign: 'middle' });
  fuente(s, 'Recomendaciones 1 a 8 del informe final, capítulo 12');
  return s;
};

// ===================================================================== DIEGO · CIERRE
D.cierre = () => {
  const s = contenido('17 · CONCLUSIONES', '¿QUÉ FALTA?', 'el primer auto del piloto.');
  const c = [['El mismo auto, ahora híbrido', 'responde a una necesidad documentada'], ['La ventaja es un sistema', 'que acumula conocimiento que nadie compra hecho'], ['El CMI ordena decisiones', 'qué cumplir antes de vender y cuándo pasar a la ofensiva']];
  c.forEach(([a, b], i) => {
    const y = Y0 + 0.1 + i * 1.3;
    num(s, String(i + 1), { x: M, y, w: 0.6, h: 0.8, fontSize: 44, color: K.cel, valign: 'top' });
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: K.gris } }], { x: M + 0.75, y: y + 0.05, w: 5.8, h: 1.1, fontSize: 21 });
  });
  foto(s, 'auto-costanera-cordillera.jpg', 7.4, Y0 + 0.1, R - 7.4, (R - 7.4) * 9 / 16);
  T(s, 'Muchas gracias.', { x: 7.4, y: Y0 + 3.75, w: R - 7.4, h: 0.5, fontSize: 22, bold: true, align: 'right' });
  fuente(s, 'Informe final del TIG, capítulo 11');
  return s;
};

// ===================================================================== BIBLIOGRAFÍA
const REFS = [
  'Autofact. (2026, 25 de marzo). Los autos eléctricos más baratos en Chile en 2026. https://www.autofact.cl/blog/comprar-auto/modelos/autos-electricos-mas-baratos',
  'Banco Central de Chile. (2026a). Informe de Política Monetaria, septiembre 2026. https://www.bcentral.cl/contenido/-/detalle/prensa/nota-de-prensa/bcch-publica-ipom-septiembre-2026',
  'Banco Central de Chile. (2026b). Tipo de cambio dólar observado [Serie diaria]. https://si3.bcentral.cl/Bdemovil/BDE/IndicadoresDiarios',
  'BioBioChile. (2026, 24 de marzo). GLP o bencina: lo que debes tener en cuenta si estás considerando cambiarte al gas vehicular. https://www.biobiochile.cl',
  'BloombergNEF. (2025, 9 de diciembre). Lithium-ion battery pack prices fall to $108 per kilowatt-hour despite rising metal prices. https://about.bnef.com',
  'CNN Chile. (2026, septiembre). Mercado automotriz nacional creció 2,9% en agosto y acumula casi un millón de operaciones este 2026. https://www.cnnchile.com',
  'David, F. R. (1997). Conceptos de administración estratégica (5.ª ed.). Prentice Hall Hispanoamericana.',
  'Decreto Supremo N° 55. (1988). Establece normas para la conversión de vehículos a gas. Ministerio de Transportes y Telecomunicaciones.',
  'Francés, A. (2006). Estrategia y planes para la empresa con el cuadro de mando integral. Pearson Educación.',
  'Garretón, M. (2026, 24 de marzo). Combustibles se disparan: Revisa cuánto costará llenar el estanque y los nuevos precios por región. Emol.',
  'Hitt, M. A., Ireland, R. D., y Hoskisson, R. E. (2004). Administración estratégica: competitividad y conceptos de globalización (5.ª ed.). Thomson.',
  'Instituto Nacional de Estadísticas. (2025). Parque de vehículos en circulación 2024 [Conjunto de datos].',
  'Instituto Nacional de Estadísticas. (2026, 30 de septiembre). Boletín estadístico: empleo trimestral, edición n.º 335 (junio-agosto 2026).',
  'Kaplan, R. S., y Norton, D. P. (2008). The execution premium: integrando la estrategia y las operaciones para lograr ventajas competitivas. Ediciones Deusto.',
  'KMcheck. (2026, 18 de abril). Los 5 autos híbridos usados más buscados en Chileautos y sus precios referenciales (2026). https://kmcheck.cl',
  'Kovacevic, A., y Reynoso, Á. (2010). El diamante de la excelencia organizacional. Aguilar Chilena de Ediciones.',
  'Ley N° 21.793. (2026, 14 de enero). Modifica la Ley N° 18.290, de Tránsito, para autorizar talleres de transformación de sistemas de propulsión y otras adaptaciones. Diario Oficial.',
  'Osterwalder, A., y Pigneur, Y. (2010). Business model generation. John Wiley & Sons.',
  'Osterwalder, A., Pigneur, Y., Bernarda, G., y Smith, A. (2014). Value proposition design. John Wiley & Sons.',
  'Porter, M. E. (1996). What is strategy? Harvard Business Review, 74(6), 61–78.',
  'Porter, M. E. (2008). The five competitive forces that shape strategy. Harvard Business Review, 86(1), 78–93.',
  'Subsecretaría de Transportes. (2021). Reglamento que establece requisitos para transformación de vehículos a propulsión eléctrica [Consulta pública]. Ministerio de Transportes y Telecomunicaciones.',
];
const biblio = (parte, refs) => () => {
  const s = contenido(`BIBLIOGRAFÍA · ${parte}`, 'BIBLIOGRAFÍA', null);
  T(s, refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1, paraSpaceAfter: 6, indentLevel: 0 } })), { x: M, y: 1.75, w: CW, h: 4.85, fontSize: 13, color: K.tx, lineSpacingMultiple: 1.0 });
  fuente(s, 'APA 7 · Enlaces completos en la bibliografía del informe final');
  return s;
};
D.biblio1 = biblio('1 DE 2', REFS.slice(0, 11));
D.biblio2 = biblio('2 DE 2', REFS.slice(11));

// ===================================================================== ANEXO
const coma = (n, d = 2) => n.toFixed(d).replace('.', ',');
D.indice = () => {
  const s = contenido('ANEXO · NO SE EXPONE', 'ANEXO PARA PREGUNTAS', null);
  const vistos = new Set(); const items = G.ANEXO.filter(a => !vistos.has(a.codigo) && vistos.add(a.codigo));
  const col = Math.ceil(items.length / 2), w = (CW - 0.4) / 2;
  items.forEach((a, i) => {
    const x = M + Math.floor(i / col) * (w + 0.4), y = 1.85 + (i % col) * 0.75;
    caja(s, x, y, w, 0.62);
    mono(s, a.codigo, { x: x + 0.12, y, w: 0.7, h: 0.62, fontSize: 14, bold: true, color: K.azul, valign: 'middle' });
    s.addText(a.titulo, { x: x + 0.85, y, w: w - 0.95, h: 0.62, fontFace: F_BODY, fontSize: 13, color: K.tx, valign: 'middle', margin: 0, hyperlink: { slide: PRIMERA[a.codigo], tooltip: a.titulo } });
  });
  return s;
};
const CORTO = { A1: 'CONTINGENCIA REGULATORIA', A2: 'MEFE COMPLETA', A3: 'MEFI COMPLETA', A4: 'CINCO FUERZAS RECALIFICADAS', A5: 'RECURSOS Y CAPACIDADES', A6: 'CRUCES DEL FODA', A7: 'CUADRO DE MANDO INTEGRAL', A8: 'RELACIONES E HIPÓTESIS', A9: 'FICHAS DE INDICADORES', A10: 'SENSIBILIDAD DEL UMBRAL', A11: 'NATURALEZA DE LA EVIDENCIA' };
const anexo = () => { const a = ANEXO_ACTUAL; return contenido(`${a.codigo} · ANEXO${a.parte ? ' · ' + a.parte.toUpperCase() : ''}`, CORTO[a.codigo], null); };

D['a-contingencia'] = () => {
  const s = anexo();
  tabla(s, [['ESCENARIO', 2.1], ['CONDICIÓN DEL REGLAMENTO', 3.0], ['EFECTO EN EL CMI', 2.9], ['RESPUESTA', CW - 8.0]], [
    ['E1 · Vía amplia (base)', 'Conserva el motor, sin exclusiones', 'Ninguno bloqueado', 'Avanzar par por par; postura ofensiva'],
    ['E2 · Vía acotada', 'Conserva el motor, con exclusiones', 'P2 y C4 al parque elegible', 'Priorizar modelos sin esos sistemas'],
    ['E3 · Vía alternativa', 'No conserva el motor; procede la alteración', 'P2 y P5 sujetos a otro trámite', 'Cambiar el indicador de P1 y recalendarizar'],
    ['E4 · Sin vía', 'No procede ninguna vía', 'P2, P3, P5 y lo que depende de ellos', 'Detener lo que depende de la vía legal y reevaluar'],
  ], 2.0, { size: 15, rh: 0.75, negrita: (i, j) => j === 0, destacar: i => i === 0 });
  T(s, 'Señal temprana: el texto final del reglamento. Se revisa cada mes (recomendación 8). La vía legal entra al mapa por las relaciones externas R02 y R06.', { x: M, y: 5.95, w: CW, h: 0.6, fontSize: 15, color: K.gris });
  fuente(s, 'Ley N° 21.793 (2026) · Subsecretaría de Transportes (2021)');
  return s;
};
const EXT = [['O1', 'El parque se conserva: 3,5 usados por nuevo', 6, 3, 3], ['O2', 'Alza de la bencina: $1.168,9 → $1.538,9', 5, 3, 3], ['O3', 'Vacío de oferta formal sin reemplazar el auto', 7, 3, 4], ['O4', 'Segmento laboral RM: 162.780 vehículos (est.)', 6, 2, 3], ['O5', 'Reglamento en elaboración: «otras adaptaciones»', 6, 1, 4], ['O6', 'Paquetes LFP a US$81/kWh', 5, 3, 3], ['O7', 'Talleres que podrían licenciar el método', 6, 2, 2], ['A1', 'Reglamento podría seguir el borrador de 2021', 7, 1, 3], ['A2', 'Menor ingreso: PIB 0,25%–0,75%; desocupación 9,6%', 6, 2, 2], ['A3', 'Sustitutos sin trámite: gas, híbrido, eléctrico', 6, 2, 2], ['A4', 'Aseguradoras y plantas sin protocolo', 7, 1, 3], ['A5', 'Homologación por par lenta y costosa', 5, 2, 3], ['A6', 'Déficit de técnicos en alta tensión', 5, 2, 2], ['A7', 'Crédito de consumo caro', 5, 2, 2], ['A8', 'Dólar a $970,46: riesgo cíclico que se cubre', 3, 2, 2], ['A9', 'Entrada de actores técnicos (Movener, Reborn)', 4, 2, 2]];
const INT = [['F1', 'Arquitectura en el eje trasero que se suma al auto', 7, 3, 4], ['F2', 'Sin enchufe: se carga al frenar', 5, 3, 3], ['F3', 'Conocimiento de calibración y medición', 6, 3, 4], ['F4', 'Proceso estandarizado con cuatro controles', 5, 3, 3], ['F5', 'Lumine Habilita (prototipo)', 6, 4, 4], ['F6', 'Modelo de red sin activos fijos', 5, 3, 3], ['D1', 'Sin gestión técnica ni regulatoria iniciada', 7, 1, 3], ['D2', 'Ahorro sin medir en autos chilenos', 7, 1, 3], ['D3', 'Biblioteca vacía; cada calibración es costo hundido', 6, 2, 3], ['D4', 'Investigación de mercado incompleta', 6, 2, 2], ['D5', 'Inversión alta para el cliente', 5, 2, 2], ['D6', 'Marca nueva, sin casos que mostrar', 5, 2, 3], ['D7', 'Compras en dólares sin cobertura', 6, 2, 2], ['D8', 'Conocimiento concentrado en pocas personas', 5, 2, 2]];
function matriz(filas) {
  const suma = filas.reduce((a, f) => a + f[2], 0);
  const rows = filas.map(f => [f[0], f[1], coma(f[2] / suma, 3), String(f[3]), coma(f[2] / suma * f[3], 3), String(f[4])]);
  const tot = k => filas.reduce((a, f) => a + f[2] / suma * f[k], 0);
  rows.push(['', 'Total ponderado', '1,000', '', coma(tot(3)), coma(tot(4))]);
  return rows;
}
const tablaMatriz = (s, filas) => tabla(s, [['N°', 0.6], ['FACTOR', 6.2], ['PESO', 1.0], ['CALIF. HOY', 1.15], ['POND. HOY', 1.1], ['CON HITOS', CW - 10.05]], matriz(filas), 1.75, { size: 12, rh: 0.265, centro: [0, 2, 3, 4, 5], negrita: (i, j) => i === filas.length || j === 0, destacar: i => i === filas.length });
D['a-mefe'] = () => { const s = anexo(); tablaMatriz(s, EXT); fuente(s, 'David (1997) · Peso = relevancia ÷ suma · Calificaciones del equipo, por validar'); return s; };
D['a-mefi'] = () => { const s = anexo(); tablaMatriz(s, INT); fuente(s, 'David (1997) · 1 = debilidad mayor, 4 = fortaleza mayor · Por validar'); return s; };
D['a-porter'] = () => {
  const s = anexo();
  tabla(s, [['FACTOR', 3.6], ['CALIF.', 0.9], ['JUSTIFICACIÓN', CW - 4.5]], [
    ['D.1 Precio relativo de los sustitutos', '4', 'Gas de $900.000 a $1,8 millones, solo autos de hasta 7 años; híbridos y eléctricos sobre $9,5 millones'],
    ['D.2 Costo de cambiarse al sustituto', '3', 'Bajo hacia el gas; alto hacia el híbrido o el eléctrico, que exigen vender el auto'],
    ['D.3 Propensión a sustituir', '4', 'El conductor de aplicación renueva su auto cerca de cada cuatro años'],
    ['Sustitutos (promedio)', '3,67', 'Antes 5,00, cuando incluía no hacer nada'],
    ['C.a.6 Inercia: no intervenir el auto', '5', 'Nuevo factor de clientes: seguir igual no tiene costo inmediato'],
    ['Clientes (promedio de 12 factores)', '2,83', 'Antes 2,64, con 11 factores'],
    ['Total ponderado de las cinco fuerzas', '3,14', 'Antes 3,49 · Entrantes 3,75, proveedores 2,67 y rivalidad 1,83 sin cambio'],
  ], 1.85, { size: 14, rh: 0.6, centro: [1], negrita: (i, j) => j === 0 || i === 6, destacar: i => i === 3 || i === 5 || i === 6 });
  fuente(s, 'Porter (2008) · Escala del instrumento: 0 no aplica a 5 alta');
  return s;
};
D['a-recursos'] = () => {
  const s = anexo();
  const R17 = [['Taller habilitado y equipamiento', 'T', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Kit híbrido (motor, baterías, unidad de control)', 'T', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Convenio de financiamiento', 'I', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Cartera de homologaciones por par', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Autorización del taller', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Biblioteca de calibraciones y base de consumo', 'I', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Técnicos con licencia SEC en alta tensión', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Reputación por evidencia publicada', 'I', 'Sí', 'Sí', 'Sí', 'No', 'Temporal'], ['Convenios con aseguradoras y plantas', 'I', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Estimador de ahorro que aprende', 'C', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Método Lumine Habilita', 'C', 'Sí', 'Sí', 'Sí', 'Sí', 'Sostenible (potencial)'], ['Integración del kit (ingeniería)', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Diagnóstico previo y posventa', 'C', 'Sí', 'Sí', 'No', 'No', 'Temporal'], ['Estandarización del proceso', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Logística de baterías (clase 9)', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Negociación de convenios financieros', 'C', 'Sí', 'No', 'No', 'No', 'Igualdad'], ['Red de talleres que devuelve datos', 'C', 'Sí', 'Sí', 'Sí', 'No', 'Temporal']];
  tabla(s, [['RECURSO O CAPACIDAD', 4.3], ['TIPO', 0.6], ['VALIOSO', 0.95], ['RARO', 0.75], ['COSTOSO DE IMITAR', 1.2], ['INSUSTIT.', 1.0], ['CONSECUENCIA', CW - 8.8]], R17, 1.72, { size: 12, rh: 0.255, centro: [1, 2, 3, 4, 5], negrita: (i, j) => j === 6 && R17[i][6].startsWith('Sost'), destacar: i => R17[i][6].startsWith('Sost') });
  fuente(s, 'Hitt et al. (2004) · T tangible · I intangible · C capacidad · 3 / 7 / 7');
  return s;
};
D['a-cruces'] = () => {
  const s = anexo();
  const CR = [['FO1', 'F1, F3 · O1, O3, O4', 'Ofrecer «calibración para tu modelo», partiendo por el modelo más frecuente', 'C4, P2'], ['FO2', 'F1 · O5', 'Aportar antecedentes técnicos al MTT para caber en «otras adaptaciones»', 'P1'], ['FO3', 'F5, F6 · O7', 'Licenciar el método y Habilita a talleres, validado el piloto', 'P5, F3'], ['DO1', 'D2 · O2, O6', 'Medir el ahorro en el piloto con línea base antes de comunicarlo', 'A3, P4, C2'], ['DO2', 'D1 · O5', 'Memoria de cálculo y expediente del primer par modelo-kit', 'P1, P2'], ['DO3', 'D5 · O2', 'Financiamiento con cuota comparable con el ahorro mensual', 'P6'], ['FA1', 'F1, F2 · A3', 'Mismo auto, sin enchufe y sin límite de antigüedad', 'C4'], ['FA2', 'F5 · A6', 'Formar técnicos con Habilita y la franquicia SENCE', 'A2'], ['DA1', 'D7 · A8', 'Cobertura cambiaria y abastecimiento de largo plazo', 'F2'], ['DA2', 'D6 · A4', 'Convenios con aseguradora y planta, con casos piloto', 'P6, C3'], ['DA3', 'D3, D8 · A9', 'Proteger las calibraciones y retener a los técnicos', 'A1, A2']];
  tabla(s, [['N°', 0.75], ['CRUCE', 2.1], ['ESTRATEGIA', CW - 4.35], ['OBJETIVO', 1.5]], CR, 1.75, { size: 13, rh: 0.4, centro: [0], negrita: (i, j) => j === 0, destacar: i => CR[i][0].startsWith('D') });
  fuente(s, 'David (1997) · Destacadas: estrategias DO y DA, las de la postura defensiva actual');
  return s;
};
const CMI = [['A1', 'Calibraciones registradas y protegidas ÷ generadas', '100% antes de reutilizar', 'Ingeniería de Calibración'], ['A2', 'Técnicos con validación vigente ÷ asignados', '100% antes de tareas críticas', 'Responsable Técnico'], ['A3', 'Protocolos de prueba aprobados', '1 antes del piloto', 'Ingeniería de Calibración'], ['A4', 'Competencias de Habilita documentadas ÷ definidas', '100% antes de licenciar', 'Responsable Técnico'], ['P1', 'Autorización vigente del taller', '1 antes de vender', 'Gerente General'], ['P2', 'Pares modelo-kit aprobados', '1 (piloto) antes de vender', 'Ingeniería de Calibración'], ['P3', 'Órdenes con control técnico completo ÷ cerradas', '100% de las órdenes', 'Responsable Técnico'], ['P4', 'Expedientes de medición completos ÷ exigibles', '100% de los exigibles', 'Ingeniería de Calibración'], ['P5', 'Paquete de licencia validado', 'Meta pendiente', 'Gerente General'], ['P6', 'Convenios vigentes: aseguradora, planta y financiera', '1 de cada una antes del primer kit', 'Gerente General'], ['C1', 'Servicios conformes ÷ entregas verificadas', '100% de las entregas', 'Responsable Técnico'], ['C2', 'Reportes comparativos completos ÷ exigibles', '100% de los exigibles', 'Comercial y Postventa'], ['C3', 'Confianza declarada después del servicio; reclamos', 'Meta pendiente', 'Comercial y Postventa'], ['C4', 'Consultas del segmento convertidas en instalaciones', 'Meta pendiente', 'Comercial y Postventa'], ['F1', 'VAN > 0 y TIR > tasa; operando, retorno sobre el capital frente a su costo', 'Superar el costo de capital', 'Gerente General'], ['F2', 'Margen de contribución unitario', 'Meta pendiente', 'Gerente General'], ['F3', 'Evaluación incremental por alternativa', 'Meta pendiente', 'Gerente General']];
const tablaCMI = (s, filas) => tabla(s, [['OBJ.', 0.7], ['INDICADOR', 5.6], ['META', 2.6], ['RESPONSABLE', CW - 8.9]], filas, 1.75, { size: 14, rh: 0.42, centro: [0], negrita: (i, j) => j === 0 });
D['a-cmi1'] = () => { const s = anexo(); tablaCMI(s, CMI.slice(0, 10)); fuente(s, 'Kaplan y Norton (2008) · Metas propuestas por el equipo'); return s; };
D['a-cmi2'] = () => { const s = anexo(); tablaCMI(s, CMI.slice(10)); T(s, 'Las iniciativas de cada objetivo vienen de los cruces del FODA (anexo A6).', { x: M, y: 5.0, w: CW, h: 0.4, fontSize: 16, color: K.gris }); fuente(s, 'Kaplan y Norton (2008) · La meta pendiente se fija con el dato que la respalde'); return s; };
D['a-relaciones'] = () => {
  const s = anexo();
  tabla(s, [['RUTA', 3.4], ['HABILITANTES', 1.9], ['EXTERNAS', 1.6], ['HIPÓTESIS', 1.6], ['TOTAL', CW - 8.5]], [['Habilitación (R01 a R06)', '4', '2', '0', '6'], ['Evidencia (R07 a R14)', '2', '0', '6', '8'], ['Valor económico (R15 a R20)', '0', '0', '6', '6'], ['Total', '6 (30%)', '2 (10%)', '12 (60%)', '20']], 1.75, { size: 14, rh: 0.36, centro: [1, 2, 3, 4], negrita: (i, j) => i === 3 || j === 0, destacar: i => i === 3 });
  mono(s, 'PLAN DE COMPROBACIÓN DE LAS 12 HIPÓTESIS', { x: M, y: 3.75, w: 8, h: 0.28, bold: true, color: K.azul });
  tabla(s, [['RELACIONES', 2.0], ['DATO QUE LAS PRUEBA', 4.3], ['CUÁNDO', 1.6], ['SI NO SE CUMPLEN', CW - 7.9]], [['R08', 'Expediente de cada vehículo del piloto', 'Piloto', 'Rediseñar el registro antes de abrir'], ['R10 a R12', 'Encuesta posservicio con y sin respaldo', 'Primeros clientes', 'Cambiar mensaje o respaldo'], ['R13 a R16', 'Conversión, costo y margen por orden', 'Año 1', 'Ajustar precio, cuota o proceso'], ['R17 a R20', 'Flujos reales y evaluación de cada licencia', 'Desde el año 2', 'No licenciar sin VAN incremental positivo']], 4.1, { size: 13, rh: 0.36, negrita: (i, j) => j === 0 });
  fuente(s, 'Informe final, tablas 6 y 13');
  return s;
};
D['a-fichas'] = () => {
  const s = anexo();
  const w = (CW - 0.3) / 2;
  [['C2 · AHORRO ACREDITADO', [['Indicador', 'Reportes comparativos completos ÷ exigibles'], ['Completo si', 'Línea base del mismo auto, consumo posterior, método, límites y acuse'], ['Fuente', 'Expediente de medición (P4); por entrega, consolidado mensual'], ['Meta', '100% · Comercial y Postventa'], ['Si hay brecha', 'Completar la prueba o informar; nunca una cifra sin respaldo']]],
    ['P2 · PRIMER PAR MODELO-KIT', [['Indicador', 'Pares modelo-kit con aprobación vigente'], ['Tipo', 'Hito: cumple solo con el documento'], ['Evidencia', 'Resolución de la autoridad y expediente técnico con calibración versionada (A1)'], ['Meta', 'Un par, el modelo más frecuente · Ingeniería de Calibración'], ['Si hay brecha', 'No vender el modelo; en E2, el modelo más frecuente sin exclusiones']]]].forEach(([k, filas], i) => {
    const x = M + i * (w + 0.3);
    mono(s, k, { x, y: 1.75, w, h: 0.3, bold: true, color: K.azul, fontSize: 14 });
    tabla(s, [['CAMPO', 1.5], ['DEFINICIÓN', w - 1.5]], filas, 2.1, { x, size: 13, rh: 0.66, negrita: (r, j) => j === 0 });
  });
  fuente(s, 'Estados: cumple · alerta (70% a 89%) · no cumple · meta pendiente · sin medir');
  return s;
};
D['a-umbral'] = () => {
  const s = anexo();
  const L = (p, a, b) => Math.round(p / (a * b)).toLocaleString('es-CL');
  const filas = [];
  [['Esencial', 4290000], ['Plus', 4990000]].forEach(([k, p]) => [0.10, 0.15, 0.20].forEach(a => filas.push([k, `${a * 100}%`, L(p, a, 1168.9), L(p, a, 1538.9)])));
  tabla(s, [['VERSIÓN', 1.5], ['AHORRO', 1.1], ['LITROS A $1.168,9', 2.3], ['LITROS A $1.538,9', 2.3]], filas, 1.75, { size: 14, rh: 0.4, centro: [1, 2, 3], negrita: (i, j) => j === 0, destacar: i => i === 5 });
  mono(s, 'GASTO MENSUAL (24 DÍAS, 10 KM/L)', { x: 8.6, y: 1.75, w: R - 8.2, h: 0.28, bold: true, color: K.azul });
  tabla(s, [['CONCEPTO', 1.75], ['150 KM/DÍA', 1.1], ['250 KM/DÍA', R - 8.6 - 2.85]], [['Litros al mes', '360', '600'], ['Gasto a $1.538,9', '$554.004', '$923.340'], ['Ahorro con 10%', '$55.400', '$92.334'], ['Ahorro con 20%', '$110.801', '$184.668']], 2.1, { x: 8.6, size: 13, rh: 0.42, centro: [1, 2], negrita: (i, j) => j === 0 });
  T(s, 'El alza de marzo bajó el umbral en 24%. Con la mitad del ahorro, el umbral se duplica.', { x: M, y: 4.9, w: 7.2, h: 0.6, fontSize: 16, color: K.gris });
  fuente(s, 'Garretón (2026) · Supuestos del equipo · Derivaciones aritméticas, no mediciones');
  return s;
};
D['a-evidencia'] = () => {
  const s = anexo();
  tabla(s, [['TIPO', 2.2], ['CONTENIDO', 6.3]], [['Dato público', 'Bencina, 3,5 usados por nuevo, PIB, desocupación, dólar, Ley N° 21.793, borrador de 2021, precio LFP, precios de sustitutos'], ['Evaluación del equipo', 'PEST, cinco fuerzas, MEFE, MEFI, recursos, factores críticos y cadena de valor'], ['Plan del equipo', 'Precios de referencia, pronóstico de instalaciones y talleres, meses de recuperación'], ['Estimación o indicio', 'Ahorro de hasta 15% y 20%; entrevistas exploratorias'], ['Por confirmar', 'Reglamento, convenios, homologaciones y resultados de la encuesta']], 1.75, { size: 13, rh: 0.6, negrita: (i, j) => j === 0 });
  mono(s, 'ENTREVISTAS', { x: M, y: 5.45, w: 3, h: 0.28, bold: true, color: K.azul });
  T(s, '3 exploratorias (fases 1 y 2) · 1 conductor de aplicación · 1 experto realizada · 3 agendadas · encuesta en curso', { x: M, y: 5.75, w: 8.5, h: 0.6, fontSize: 15 });
  mono(s, 'DEMO LUMINE HABILITA', { x: 9.9, y: 1.75, w: R - 9.9, h: 0.28, bold: true, color: K.azul, align: 'center', charSpacing: 0 });
  s.addShape(S.rect, { x: 10.15, y: 2.15, w: 2.35, h: 2.35, fill: { color: K.blanco }, line: { color: K.linea, width: 0.75 } });
  s.addImage({ path: AQ('qr-habilita.png'), x: 10.25, y: 2.25, w: 2.15, h: 2.15, altText: 'Código QR de la demostración de Lumine Habilita' });
  T(s, 'Formación por competencias del técnico instalador (prototipo)', { x: 9.95, y: 4.6, w: 2.75, h: 0.8, fontSize: 13, align: 'center', color: K.gris });
  fuente(s, 'Las personas entrevistadas no se nombran');
  return s;
};

// ---------- orden, notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · ${G.mmss(G.segundos(x.texto))} a ${G.PALABRAS_POR_MINUTO} palabras por minuto (${G.palabras(x.texto)} palabras) · Informe: ${x.seccion}\n\n${x.texto}`;
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
