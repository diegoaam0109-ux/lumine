// Avance 2 del TIG (Solemne 2) · versión del equipo reconstruida + Declaraciones, Entorno, Cinco fuerzas y Cruces del FODA.
// Coherente con el informe del Avance 2 (15-11-2026). Generado por armar-base.sh: no editar a mano.
const path = require('path');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const JSZip = require('jszip');

const G = require('./guion-base.js');
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
pres.title = 'Lumine Motors · TIG Avance 2 · Control de Gestión';
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

// Láminas propias de la presentación base del Avance 2 (versión del equipo del 14-11), reconstruidas en el generador.
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SECCION });
  s.addImage({ path: A('unab-facultad-economia-negocios.png'), x: M, y: 0.55, w: 1.75, h: 1.75 * 309 / 899, altText: 'Facultad de Economía y Negocios, Universidad Andrés Bello' });
  mono(s, 'CONTROL DE GESTIÓN · ICMA901 · SECCIÓN 500 · NRC 4118', { x: M, y: 1.38, w: 6.5, h: 0.28, fontSize: 12 });
  s.addImage({ path: A('lumine-logo.png'), x: M, y: 1.95, w: 1.1, h: 1.1 * 390 / 530, altText: 'Lumine Motors' });
  T(s, 'LUMINE MOTORS', { x: M, y: 2.85, w: 6.0, h: 0.75, fontFace: F_TIT, fontSize: 38, valign: 'middle' });
  serif(s, 'un sistema de control de gestión para una empresa que todavía no opera', { x: M, y: 3.6, w: 5.6, h: 1.25, fontSize: 25, color: K.cel });
  mono(s, 'TIG · AVANCE 2 · SOLEMNE 2', { x: M, y: 5.0, w: 5, h: 0.3, fontSize: 14, bold: true, color: K.azul });
  T(s, 'Diego Alarcón · Benjamín Torres · Lukas Verdugo', { x: M, y: 5.35, w: 5.8, h: 0.36, fontSize: 17 });
  T(s, 'Profesor Leonardo Lizana Contreras', { x: M, y: 5.75, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
  T(s, 'Santiago, noviembre de 2026', { x: M, y: 6.07, w: 5.8, h: 0.3, fontSize: 15, color: K.gris });
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
  pieza(0.47, 0.61, 5.55, 'BATERÍA LTO', 'se carga al frenar', 1.75, true);
  pieza(0.70, 0.60, 5.55, 'DOS MOTORES', 'en las ruedas traseras', 1.95);
  return s;
};

D.via = () => {
  const s = contenido('03 · VÍA REGULATORIA', 'SIN NORMA PROPIA NO SE VENDE:', 'por eso planificamos sobre el escenario base.');
  serif(s, 'La Ley N° 21.793 autoriza «otras adaptaciones», pero el reglamento en trámite solo regula la conversión a eléctrico.', { x: M, y: Y0 + 0.05, w: 3.7, h: 1.35, fontSize: 20 });
  T(s, 'Según el 3CV, la vía disponible es un proyecto experimental: permite circular y medir, pero no vender. Sus resultados son el antecedente para una norma propia.', { x: M, y: Y0 + 1.55, w: 3.7, h: 1.3, fontSize: 15 });
  marca(s, 'SUPUESTO DE PLANIFICACIÓN · E1', M, Y0 + 3.4, { dash: 'sysDot' });
  const x0 = 4.7, g = 0.25, bw = (R - 4.7 - 2 * 0.25) / 3, by = Y0 - 0.05, bh = 1.35;
  [['01 · ENERO 2026', 'Ley N° 21.793', 'reglamento sin dictar', 'PREDETERMINADO', 'n'], ['02 · 2027', 'Proyecto experimental', 'D.S. N° 67: circular, no vender', 'LO CONTROLA LUMINE · P1', 'a'], ['03 · SUPUESTA EN 2028', 'Norma propia', 'para sistemas aditivos', 'CONDICIÓN EXTERNA', 'e']].forEach(([k, t, d, tag, tipo], i) => {
    const x = x0 + i * (bw + g);
    if (tipo === 'a') cajaAzul(s, x, by, bw, bh); else caja(s, x, by, bw, bh, tipo === 'e' ? { line: { color: K.tx, width: 1.5, dashType: 'dash' } } : {});
    mono(s, k, { x: x + 0.12, y: by + 0.08, w: bw - 0.2, h: 0.24, fontSize: 12, bold: true, color: K.azul, charSpacing: 0.5 });
    T(s, [{ text: t, options: { bold: true, breakLine: true } }, { text: d, options: { color: K.gris, fontSize: 12 } }], { x: x + 0.12, y: by + 0.32, w: bw - 0.16, h: 0.66, fontSize: 15 });
    mono(s, tag, { x: x + 0.12, y: by + bh - 0.32, w: bw - 0.2, h: 0.24, fontSize: 11, bold: true, color: tipo === 'a' ? K.azul : K.gris, charSpacing: 0.3 });
    if (i < 2) flecha(s, x + bw + 0.02, by + bh / 2, x + bw + g - 0.02, by + bh / 2, K.tx, 1.25);
  });
  const ry = Y0 + 1.55;
  mono(s, '¿QUÉ NORMA DICTA LA AUTORIDAD?', { x: x0, y: ry, w: 4.5, h: 0.26, bold: true, color: K.azul });
  marca(s, 'ESCENARIO BASE', 9.55, ry - 0.06, { dash: 'sysDot', color: K.azul, size: 11, h: 0.3 });
  flecha(s, x0 + 2 * (bw + g) + bw * 0.5, by + bh, x0 + 2 * (bw + g) + bw * 0.5, ry + 0.3, K.tx, 1.25);
  const rw = R - x0;
  [['E1', 'Norma amplia', 'Autorización por taller y por par kit-modelo; apertura en enero de 2028'], ['E2', 'Norma acotada', 'Excluye sistemas como ABS o airbag: mercado reducido al parque elegible'], ['E3', 'Sin norma propia', 'Solo autorizaciones experimentales: no se vende a escala'], ['E4', 'Sin vía', 'No procede ninguna autorización: el negocio no puede operar']].forEach(([c, t, d], i) => {
    const y = ry + 0.36 + i * 0.6;
    if (i === 0) cajaAzul(s, x0, y, rw, 0.5); else caja(s, x0, y, rw, 0.5);
    mono(s, c, { x: x0 + 0.12, y, w: 0.45, h: 0.5, fontSize: 14, bold: true, color: K.azul, valign: 'middle' });
    T(s, t, { x: x0 + 0.52, y, w: 2.05, h: 0.5, fontSize: 16, bold: true, valign: 'middle' });
    T(s, d, { x: x0 + 2.6, y, w: rw - 2.7, h: 0.5, fontSize: 13, valign: 'middle' });
  });
  fuente(s, 'Ley N° 21.793 (2026) · D.S. N° 67 (MTT, 2021) · Entrevista al 3CV (3-11-2026)');
  return s;
};

D.ova = () => {
  const s = contenido('09 · FORMULACIÓN DE LA ESTRATEGIA', 'OBJETIVO, VENTAJA Y ALCANCE:', 'diferenciación enfocada que compite con evidencia.');
  const g = 0.24, w = (CW - 2 * g) / 3, y = Y0, h = 3.5;
  const card = (i, k, q, grande, fuerte, sub, tag, azul, palabra) => {
    const x = M + i * (w + g);
    if (azul) cajaAzul(s, x, y, w, h); else caja(s, x, y, w, h);
    mono(s, k, { x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.28, fontSize: 14, bold: true, color: K.azul, charSpacing: 2 });
    serif(s, q, { x: x + 0.2, y: y + 0.5, w: w - 0.4, h: 0.36, fontSize: 17, color: K.gris });
    if (palabra) T(s, grande, { x: x + 0.2, y: y + 0.9, w: w - 0.4, h: 0.75, fontFace: F_TIT, fontSize: 34, color: K.azul, valign: 'middle' });
    else num(s, grande, { x: x + 0.2, y: y + 0.88, w: w - 0.4, h: 0.8, fontSize: 52, valign: 'middle' });
    T(s, fuerte, { x: x + 0.2, y: y + 1.66, w: w - 0.4, h: 0.78, fontSize: 14, bold: true });
    T(s, sub, { x: x + 0.2, y: y + 2.46, w: w - 0.4, h: 0.68, fontSize: 13, color: K.gris });
    mono(s, tag, { x: x + 0.2, y: y + h - 0.34, w: w - 0.3, h: 0.24, fontSize: 11, charSpacing: 0.3 });
  };
  card(0, 'OBJETIVO', '¿qué queremos lograr y para cuándo?', '2.934', 'instalaciones acumuladas con ahorro verificado hacia 2032', '16 talleres en la red y un retorno superior al costo del capital.', 'ESCENARIO CENTRAL · TASA POR FIJAR');
  card(1, 'VENTAJA', '¿por qué nos elegirían?', 'EVIDENCIA', 'el mismo auto, con un ahorro medido en el vehículo del cliente', 'y una calibración hecha para su modelo, sostenida por calibración, medición y Lumine Habilita.', 'POTENCIAL · BIBLIOTECA POR CONSTRUIR', true, true);
  card(2, 'ALCANCE', '¿dónde competimos?', '73.908', 'taxis, colectivos y autos de aplicación de jornada completa en la RM', 'Solo modelos calibrados. Regiones, a través de la red desde el tercer año.', 'INE (2025) · SUPUESTO DEL EQUIPO');
  const yb = y + h + 0.1;
  T(s, [{ text: 'ESTRATEGIA GENÉRICA   ', options: { fontFace: F_MONO, bold: true, color: K.azul, fontSize: 12, charSpacing: 2 } }, { text: 'Diferenciación enfocada. No podemos competir por costo: el kit cuesta entre 81% y 84% del precio neto.' }], { x: M, y: yb, w: 7.45, h: 0.6, fontSize: 15 });
  T(s, [{ text: 'RENUNCIAS   ', options: { fontFace: F_MONO, bold: true, color: K.azul, fontSize: 12, charSpacing: 2 } }, { text: 'precio contra el gas · bajo kilometraje · inmediatez' }], { x: 8.6, y: yb, w: R - 8.6, h: 0.6, fontSize: 15 });
  fuente(s, 'Kaplan y Norton (2008) · Porter (1996) · Plan del equipo al 12-11-2026');
  return s;
};

D.ejes = () => {
  const s = contenido('10 · EJES ESTRATÉGICOS', 'TRES BRECHAS,', 'tres ejes que sostienen el objetivo.');
  s.addShape(S.rect, { x: M, y: Y0 - 0.1, w: CW, h: 0.5, fill: { color: K.tx }, line: { type: 'none' } });
  T(s, [{ text: 'OBJETIVO 2032     ', options: { fontFace: F_MONO, bold: true, color: '9ED3F0', fontSize: 13, charSpacing: 2 } }, { text: '2.934 instalaciones con ahorro verificado · 16 talleres en red · retorno sobre el costo del capital', options: { color: K.blanco } }], { x: M + 0.2, y: Y0 - 0.1, w: CW - 0.3, h: 0.5, fontSize: 15, valign: 'middle' });
  const EJ = [
    ['EJE 1', 'Habilitación formal', 'Sin norma ni par autorizado no hay venta', ['01  Ejecutar el proyecto experimental', '02  Autorizar taller y par kit-modelo', '03  Respaldo de aseguradoras y plantas'], 'P1 · P2 · P6', 'P1 · solicitud en 2027'],
    ['EJE 2', 'Acceso comercial', 'La inercia del cliente y su capacidad de pago', ['04  Captar el alto kilometraje', '05  Financiar con terceros al vender'], 'C4 · P6', 'C4 · conversión'],
    ['EJE 3', 'Conocimiento y escala', 'Ahorro sin medir y conocimiento sin proteger', ['06  Medir el ahorro con línea base', '07  Retener el conocimiento técnico', '08  Crecer con la red de talleres'], 'A1–A4 · P4 · P5 · C2 · F3', 'A3 · protocolo'],
  ];
  const g = 0.2, x0 = M + 0.2, w = (CW - 0.4 - 2 * g) / 3, y = Y0 + 0.55, h = 3.0;
  EJ.forEach(([k, n, br, objs, cmi, av], i) => {
    const x = x0 + i * (w + g);
    caja(s, x, y, w, h);
    mono(s, k, { x: x + 0.18, y: y + 0.12, w: w - 0.3, h: 0.24, fontSize: 13, bold: true, color: K.azul, charSpacing: 2 });
    T(s, n, { x: x + 0.18, y: y + 0.36, w: w - 0.3, h: 0.38, fontSize: 19, bold: true, valign: 'middle' });
    serif(s, br, { x: x + 0.18, y: y + 0.78, w: w - 0.3, h: 0.52, fontSize: 14 });
    T(s, objs.map((t, n2) => ({ text: t, options: { breakLine: n2 < objs.length - 1 } })), { x: x + 0.18, y: y + 1.36, w: w - 0.3, h: 0.92, fontSize: 13, paraSpaceAfter: 1 });
    linea(s, x + 0.18, y + 2.33, w - 0.36, 0, K.linea, 1);
    T(s, [{ text: 'CMI  ', options: { fontFace: F_MONO, bold: true, color: K.gris, fontSize: 10 } }, { text: cmi, options: { fontFace: F_MONO, bold: true, color: K.azul, fontSize: 12 } }], { x: x + 0.18, y: y + 2.4, w: w - 0.3, h: 0.26, valign: 'middle' });
    T(s, [{ text: 'AVISA PRIMERO  ', options: { fontFace: F_MONO, bold: true, color: K.gris, fontSize: 10 } }, { text: av, options: { fontSize: 13 } }], { x: x + 0.18, y: y + 2.66, w: w - 0.3, h: 0.26, valign: 'middle' });
  });
  cajaAzul(s, M, y + h + 0.12, CW, 0.5);
  T(s, [{ text: 'BASE COMÚN     ', options: { fontFace: F_MONO, bold: true, color: K.azul, fontSize: 13, charSpacing: 2 } }, { text: 'propuesta de valor y fines: P3 · C1 · C3 · F2 · F1, transversales a los tres ejes' }], { x: M + 0.2, y: y + h + 0.12, w: CW - 0.3, h: 0.5, fontSize: 16, valign: 'middle' });
  fuente(s, 'Kaplan y Norton (2008) · Ocho objetivos de eje → 17 objetivos del CMI');
  return s;
};

D.mapa = () => {
  const s = contenido('11 · MAPA ESTRATÉGICO · SE LEE DE ABAJO HACIA ARRIBA', '17 OBJETIVOS, 21 RELACIONES', null);
  const w = 11.6, h = w * 1572 / 3660;
  s.addImage({ path: A('mapa-ejes.png'), x: (W - w) / 2, y: 1.55, w, h, altText: 'Mapa estratégico de Lumine Motors por ejes' });
  fuente(s, 'Kaplan y Norton (2008) · Relaciones R01 a R21: anexo A2');
  return s;
};

// Tabla del CMI con filas de perspectiva
function tablaCMIBase(s, grupos) {
  const cols = [['OBJ.', 0.6], ['OBJETIVO', 2.05], ['INDICADOR', 2.35], ['CÁLCULO', 3.25], ['META', 2.3], ['RESPONSABLE', CW - 10.55]];
  const sinB = { type: 'none' }, linB = { pt: 0.75, color: K.linea }, fuerte = { pt: 1.25, color: K.tx };
  const head = cols.map(([k]) => ({ text: k, options: { fontFace: F_MONO, fontSize: 10, color: K.gris, bold: true, fill: { color: K.blanco }, border: [sinB, sinB, fuerte, sinB] } }));
  const filas = [head];
  grupos.forEach(([titulo, rows]) => {
    filas.push([{ text: titulo, options: { colspan: 6, fontFace: F_MONO, fontSize: 11, bold: true, color: K.azul, charSpacing: 2, fill: { color: K.suave }, border: [sinB, sinB, linB, sinB] } }]);
    rows.forEach(r => filas.push(r.map((v, j) => ({ text: v, options: {
      fill: { color: K.blanco }, border: [sinB, sinB, linB, sinB],
      fontFace: j === 0 ? F_MONO : F_BODY, bold: j === 0 || j === 1, color: j === 0 ? K.azul : j === 3 ? K.gris : (j === 4 && ['C2', 'C3', 'C4', 'F1'].includes(r[0])) ? K.azul : K.tx,
      fontSize: j === 0 ? 12 : 11 } }))));
  });
  s.addTable(filas, { x: M, y: 1.5, w: CW, colW: cols.map(c => c[1]), fontFace: F_BODY, color: K.tx, margin: [0.01, 0.05, 0.01, 0.05], valign: 'middle', rowH: 0.26, autoPage: false });
}
D.cmiA = () => {
  const s = contenido('12 · CUADRO DE MANDO INTEGRAL', 'CUADRO DE MANDO:', 'financiera y clientes.', { unaLinea: true });
  tablaCMIBase(s, [
    ['FINANCIERA · ¿cómo creamos valor para los socios?', [
      ['F1', 'Rentar sobre el costo del capital', 'Antes de invertir: VAN del plan. Operando: retorno sobre el capital empleado', 'VAN a la tasa exigida · retorno sobre el capital − costo del capital', 'VAN > 0 antes de invertir; diferencia positiva desde el año 3', 'Gerencia General'],
      ['F2', 'Margen positivo por servicio', 'Margen de contribución por servicio', 'Precio neto − costo directo del servicio', 'Positivo; kit cotizado bajo $2.866.010 (Esencial) y $3.211.125 (Plus)', 'Gerencia General'],
      ['F3', 'Expandir la red solo con evaluación positiva', 'Talleres con VAN incremental positivo', 'Talleres incorporados con VAN incremental > 0 ÷ talleres incorporados × 100', '100%', 'Gerencia General'],
    ]],
    ['CLIENTES · ¿qué debe vivir el conductor?', [
      ['C1', 'Cumplir la promesa técnica', 'Entregas conformes', 'Entregas con acta de conformidad ÷ entregas × 100', '100%', 'Responsable Técnico'],
      ['C2', 'Cumplir la promesa de ahorro', 'Clientes con ahorro igual o superior al mínimo informado', 'Clientes con ahorro a 3 meses ≥ mínimo ÷ clientes medidos × 100', '80% (provisional)', 'Comercial y Postventa'],
      ['C3', 'Ganar la confianza del cliente', 'Confianza declarada; complementaria: reclamos', 'Clientes que califican 4 o 5 ÷ encuestados × 100 · reclamos por cada 100 entregas', '80% (provisional); reclamos: línea base del 1.er trimestre', 'Comercial y Postventa'],
      ['C4', 'Captar el segmento de alto kilometraje', 'Conversión de cotizaciones', 'Instalaciones ÷ cotizaciones de modelos calibrados del trimestre × 100', '30% (provisional)', 'Comercial y Postventa'],
    ]],
  ]);
  fuente(s, 'Kaplan y Norton (2008) · En azul: meta provisional, se confirma con el dato indicado');
  return s;
};
D.cmiB = () => {
  const s = contenido('13 · CUADRO DE MANDO INTEGRAL', 'CUADRO DE MANDO:', 'procesos y aprendizaje.', { unaLinea: true });
  tablaCMIBase(s, [
    ['PROCESOS INTERNOS · ¿en qué debemos ser excelentes?', [
      ['P1', 'Ejecutar el proyecto experimental', 'Avance del proyecto (hito)', 'Resolución + vehículos medidos + informe entregado al 3CV', 'Solicitud: 1.er trim. 2027; informe antes del mes −4', 'Gerencia General'],
      ['P2', 'Autorizar taller y primer par', 'Autorización vigente (hito)', 'Resolución del taller y del par kit-modelo', 'Ambas antes de vender ese modelo', 'Ingeniería de Calibración'],
      ['P3', 'Instalar con control técnico completo', 'Órdenes con control completo', 'Órdenes con los cuatro controles críticos ÷ órdenes cerradas × 100', '100%', 'Responsable Técnico'],
      ['P4', 'Cerrar cada servicio con su medición', 'Servicios con expediente y reporte', 'Servicios con expediente y reporte ÷ servicios con medición exigible × 100', '100%', 'Ingeniería de Calibración'],
      ['P5', 'Preparar la réplica en la red', 'Paquete de incorporación validado (hito)', 'Manual, formación y auditoría validados', 'Antes del primer taller de la red', 'Gerencia General'],
      ['P6', 'Formalizar alianzas', 'Convenios vigentes (hito)', 'Aseguradora + planta de revisión técnica + financista', 'Los tres antes del primer vehículo vendido', 'Gerencia General'],
    ]],
    ['APRENDIZAJE Y CRECIMIENTO · ¿qué capacidades lo sostienen?', [
      ['A1', 'Construir y proteger la biblioteca', 'Calibraciones protegidas', 'Calibraciones registradas y protegidas ÷ generadas × 100', '100% antes de reutilizar', 'Ingeniería de Calibración'],
      ['A2', 'Disponer de técnicos habilitados', 'Técnicos con validación vigente', 'Técnicos validados ÷ asignados a tareas críticas × 100', '100%', 'Responsable Técnico'],
      ['A3', 'Contar con protocolo de medición', 'Protocolo aprobado (hito)', 'Documento aprobado', 'Antes del primer vehículo experimental', 'Ingeniería de Calibración'],
      ['A4', 'Mantener el método en Habilita', 'Competencias con contenido validado', 'Competencias validadas ÷ competencias definidas × 100', '100% antes del primer taller', 'Responsable Técnico'],
    ]],
  ]);
  fuente(s, 'Kaplan y Norton (2008) · Hito: cumple solo con el documento que lo acredita');
  return s;
};

D.tablero = () => {
  const s = contenido('14 · LECTURA DEL TABLERO', 'SE ENCIENDE POR ETAPAS:', 'lo que aún no corresponde medir no se pinta.');
  const E = [['1', 'Preparación', 'hoy y 2027', 'A3 · A4 · P1 · P6 · F1 (VAN)', 'Proyecto autorizado, protocolo aprobado y VAN > 0'], ['2', 'Proyecto experimental', '2027', 'A1 · A2 · P4', 'Ahorro medido, informe entregado, norma y par (P2)'], ['3', 'Taller propio', 'desde 2028', 'P2 · P3 · C1–C4 · F2', 'C2 cumplida, margen positivo y conversión estable'], ['4', 'Red de talleres', 'desde el 3.er año', 'P5 · F3 · F1 (retorno)', 'VAN incremental positivo por cada taller']];
  E.forEach(([n, t, cu, ob, pasa], i) => {
    const y = Y0 + 0.05 + i * 1.03;
    s.addShape(S.chevron, { x: M, y, w: 1.0, h: 0.85, fill: { color: i === 0 ? K.cel : K.blanco }, line: { color: i === 0 ? K.cel : K.tx, width: 1.25 } });
    num(s, n, { x: M + 0.2, y, w: 0.6, h: 0.85, fontSize: 30, color: i === 0 ? K.blanco : K.tx, valign: 'middle', align: 'center' });
    T(s, [{ text: t + ' ', options: { bold: true } }, { text: cu, options: { fontFace: F_SER, italic: true, color: K.azul, fontSize: 18 } }], { x: M + 1.2, y: y + 0.12, w: 3.6, h: 0.36, fontSize: 17, valign: 'middle' });
    mono(s, ob, { x: M + 1.2, y: y + 0.48, w: 3.6, h: 0.26, fontSize: 12, bold: true, color: K.azul, charSpacing: 0.3 });
    T(s, [{ text: 'PASA SI   ', options: { fontFace: F_MONO, bold: true, color: K.gris, fontSize: 11 } }, { text: pasa }], { x: M + 4.85, y: y + 0.08, w: 3.35, h: 0.7, fontSize: 15, valign: 'middle' });
    if (i < 3) linea(s, M + 1.2, y + 0.95, 7.0, 0, K.linea, 0.75);
  });
  const xR = 9.0, wR = R - xR;
  mono(s, 'TIPOS DE INDICADOR', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul, charSpacing: 2 });
  [['7', 'críticos al 100%', 'protegen la seguridad o la promesa técnica', K.tx], ['5', 'hitos con fecha', 'cumplen solo con el documento', K.tx], ['4', 'metas provisionales', 'C2 · C3 · C4 · F1, con fundamento y fecha', K.cel]].forEach(([n, t, d, c], i) => {
    const y = Y0 + 0.4 + i * 0.86;
    num(s, n, { x: xR, y, w: 0.7, h: 0.75, fontSize: 48, color: c, valign: 'middle' });
    T(s, [{ text: t, options: { bold: true, breakLine: true } }, { text: d, options: { color: K.gris, fontSize: 14 } }], { x: xR + 0.8, y, w: wR - 0.8, h: 0.75, fontSize: 16, valign: 'middle' });
  });
  mono(s, '21 RELACIONES CAUSA-EFECTO', { x: xR, y: Y0 + 3.05, w: wR, h: 0.28, bold: true, color: K.azul, charSpacing: 2 });
  let xx = xR; const u = wR / 21;
  [[7, K.cel], [2, K.tx], [12, K.medio]].forEach(([n, c]) => { s.addShape(S.rect, { x: xx, y: Y0 + 3.42, w: n * u, h: 0.36, fill: { color: c }, line: { color: K.blanco, width: 1 } }); xx += n * u; });
  T(s, '7 habilitantes · 2 externas · 12 hipótesis', { x: xR, y: Y0 + 3.9, w: wR, h: 0.3, fontSize: 13, color: K.gris });
  fuente(s, 'Ciclo de control: observar · comparar · explicar · decidir · volver a medir');
  return s;
};

D.cierre = () => {
  const s = contenido('15 · CONCLUSIONES', '¿QUÉ SIGUE?', 'convertir el tablero en iniciativas.');
  [['Una estrategia en una frase', 'objetivo 2032, ventaja por evidencia y alcance de alto kilometraje'], ['Tres ejes, tres brechas', 'legal, comercial y de conocimiento, cada una con su indicador adelantado'], ['El CMI separa lo propio de lo externo', 'ejecutar el proyecto experimental se controla; la norma se monitorea']].forEach(([a, b], i) => {
    const y = Y0 + i * 1.0;
    num(s, String(i + 1), { x: M, y, w: 0.55, h: 0.75, fontSize: 40, color: K.cel, valign: 'top' });
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: K.gris, fontSize: 16 } }], { x: M + 0.65, y: y + 0.02, w: 5.95, h: 0.95, fontSize: 19 });
  });
  mono(s, 'PRIORIDAD INMEDIATA', { x: M, y: Y0 + 3.05, w: 5, h: 0.26, bold: true, color: K.azul, charSpacing: 2 });
  serif(s, 'Preparar el proyecto experimental, aprobar el protocolo de medición y cotizar formalmente el kit.', { x: M, y: Y0 + 3.3, w: 6.2, h: 0.85, fontSize: 20 });
  foto(s, 'auto-costanera-cordillera.jpg', 7.5, Y0, R - 7.5, (R - 7.5) * 9 / 16);
  marca(s, 'AVANCE 3 · INICIATIVAS Y STRATEX', 7.5, Y0 + 3.6, { dash: 'sysDot', color: K.azul, size: 11, h: 0.3 });
  T(s, 'Muchas gracias.', { x: 7.5, y: Y0 + 3.85, w: R - 7.5, h: 0.45, fontSize: 21, bold: true, align: 'right' });
  fuente(s, 'Informe del Avance 2, capítulos 5 a 9');
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
  fuente(s, 'Adaptado de Osterwalder et al. (2014) · Investigación del equipo · R1: estimación');
  return s;
};

D.identidad = () => {
  const s = contenido('05 · DECLARACIONES', 'MISIÓN CON ALCANCE,', 'visión con cifra y plazo.');
  const xL = M, wL = 5.9;
  mono(s, 'MISIÓN', { x: xL, y: Y0, w: 3, h: 0.28, bold: true, color: K.azul });
  serif(s, '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, en Chile y partiendo por la Región Metropolitana, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»', { x: xL, y: Y0 + 0.32, w: wL, h: 2.1, fontSize: 19, color: K.tx });
  mono(s, 'FINES', { x: xL, y: Y0 + 2.4, w: 3, h: 0.28, bold: true, color: K.azul });
  T(s, 'Rentar sobre el costo del capital (F1) y crecer en regiones con la red, sin activos propios', { x: xL, y: Y0 + 2.68, w: wL, h: 0.6, fontSize: 17 });
  mono(s, 'VALORES COMO REGLAS', { x: xL, y: Y0 + 3.35, w: 4, h: 0.28, bold: true, color: K.azul });
  T(s, 'Verificabilidad antes que afirmación: un ahorro sin medir no se comunica', { x: xL, y: Y0 + 3.63, w: wL, h: 0.6, fontSize: 17 });
  const xR = 7.2, wR = R - xR;
  linea(s, xR - 0.35, Y0, 0, YF - Y0, K.linea, 1);
  mono(s, 'VISIÓN', { x: xR, y: Y0, w: 3, h: 0.28, bold: true, color: K.azul });
  T(s, 'Ser la referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión y las aseguradoras', { x: xR, y: Y0 + 0.35, w: wR, h: 1.45, fontSize: 18, bold: true });
  [['2032', 'PLAZO'], ['2.934', 'INSTALACIONES ACUMULADAS'], ['16', 'TALLERES EN LA RED']].forEach(([n, t], i) => {
    const x = xR + i * (wR / 3);
    num(s, n, { x, y: Y0 + 1.95, w: wR / 3 - 0.1, h: 0.95, fontSize: 52, color: i ? K.tx : K.cel });
    linea(s, x, Y0 + 2.98, wR / 3 - 0.2, 0, K.tx, 1);
    mono(s, t, { x, y: Y0 + 3.05, w: wR / 3 - 0.15, h: 0.55, fontSize: 12, bold: true, color: K.tx });
  });
  marca(s, 'ESCENARIO CENTRAL DEL PLAN', xR, Y0 + 3.95, { dash: 'sysDot', size: 12 });
  fuente(s, 'Kovacevic y Reynoso (2010) · Francés (2006)');
  return s;
};

D.entorno = () => {
  const s = contenido('06 · ENTORNO', 'HAY OPORTUNIDADES,', 'pero hoy no las aprovechamos.');
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
  serif(s, 'Ayuda la tecnología (baterías de litio a US$108/kWh); frena la economía (desocupación de 9,6%).', { x: M, y: Y0 + 3.6, w: 5.6, h: 0.7, fontSize: 18 });
  // MEFE
  const xR = 7.0, wR = R - xR - 0.2;
  mono(s, 'MEFE · 7 OPORTUNIDADES Y 9 AMENAZAS NUMERADAS', { x: xR, y: Y0, w: wR + 0.2, h: 0.28, bold: true, color: K.azul });
  regla(s, xR + 0.1, Y0 + 2.35, wR - 0.2, [{ v: 2.03, n: '2,03', t: 'HOY' }, { v: 2.75, n: '2,75', t: 'ESCENARIO', color: K.cel, hueco: true, dash: 'dash' }], { alto: 1.45 });
  T(s, [{ text: 'Mayor peso: ', options: { bold: true } }, { text: 'O3 vacío de oferta formal y A1 sin norma propia no se vende (0,079 cada uno).' }], { x: xR, y: Y0 + 3.05, w: wR + 0.2, h: 0.65, fontSize: 16 });
  marca(s, 'CALIFICACIONES DEL EQUIPO · POR VALIDAR', xR, Y0 + 3.85, { dash: 'sysDot' });
  fuente(s, 'BloombergNEF (2025) · Banco Central (2026a) · INE (2026) · David (1997)');
  return s;
};

D.porter = () => {
  const s = contenido('07 · CINCO FUERZAS', 'LA INERCIA NO ES UN SUSTITUTO:', 'es poder del cliente.');
  const lx = M, bx = M + 3.2, bw = 4.6, U = bw / 5;
  mono(s, 'INTENSIDAD 0 A 5 · PESO', { x: lx, y: Y0, w: 4, h: 0.28 });
  [['Sustitutos', '30%', 3.67, true], ['Nuevos entrantes', '20%', 3.75], ['Clientes', '25%', 2.83, true], ['Proveedores', '15%', 2.67], ['Rivalidad', '10%', 1.83]].forEach(([k, p, v, clave], i) => {
    const y = Y0 + 0.4 + i * 0.68;
    T(s, k, { x: lx, y, w: 2.4, h: 0.5, fontSize: 18, bold: !!clave, valign: 'middle' });
    mono(s, p, { x: lx + 2.4, y, w: 0.7, h: 0.5, fontSize: 13, valign: 'middle' });
    s.addShape(S.rect, { x: bx, y: y + 0.1, w: v * U, h: 0.3, fill: { color: clave ? K.cel : K.medio }, line: { type: 'none' } });
    T(s, v.toFixed(2).replace('.', ','), { x: bx + v * U + 0.1, y, w: 0.8, h: 0.5, fontSize: 18, bold: true, valign: 'middle' });
  });
  serif(s, 'Seguir sin cambios no es un producto: es inercia del comprador.', { x: M, y: Y0 + 3.9, w: 8.3, h: 0.45, fontSize: 19 });
  const xR = 9.75, wR = R - xR;
  mono(s, 'INTENSIDAD PONDERADA', { x: xR, y: Y0, w: wR, h: 0.28, bold: true, color: K.azul });
  num(s, '3,14', { x: xR, y: Y0 + 0.3, w: wR, h: 1.0, fontSize: 60, color: K.cel });
  T(s, 'intensidad media', { x: xR, y: Y0 + 1.3, w: wR, h: 0.36, fontSize: 17, color: K.gris });
  mono(s, 'SUSTITUTOS REALES', { x: xR, y: Y0 + 1.95, w: wR, h: 0.28, bold: true, color: K.azul });
  [['Gas', 'solo autos de hasta 7 años'], ['Híbrido usado', '$9,5 a $13 millones'], ['Eléctrico nuevo', 'desde $13.990.000']].forEach(([a, b], i) =>
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: K.gris } }], { x: xR, y: Y0 + 2.3 + i * 0.68, w: wR, h: 0.64, fontSize: 16 }));
  fuente(s, 'Porter (2008) · BioBioChile, KMcheck y Autofact (2026) · D. S. N° 55 (1988)');
  return s;
};
D.cruces = () => {
  const s = contenido('08 · CRUCES DEL FODA', 'HOY, PRIMERO DO Y DA:', 'la ofensiva exige evidencia.');
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
    marca(s, hoy ? 'HOY' : 'CON EVIDENCIA', x + cw - 0.12, y + 0.1, { derecha: true, color: hoy ? K.tx : K.azul, dash: hoy ? 'solid' : 'dash', size: 11, h: 0.28 });
    T(s, items.map(([k, t], n) => ({ text: '', options: {} }) && [{ text: k + ' ', options: { fontFace: F_MONO, bold: true, fontSize: 12, color: K.azul } }, { text: t, options: { breakLine: n < items.length - 1 } }]).flat(), { x: x + 0.15, y: y + 0.48, w: cw - 0.3, h: ch - 0.55, fontSize: 14, paraSpaceAfter: 3 });
  };
  celda(0, 0, 'FO', [['FO1', 'Calibración para tu modelo'], ['FO2', 'Ejecutar el proyecto experimental'], ['FO3', 'Licenciar tras validar el piloto']], false);
  celda(0, 1, 'DO', [['DO1', 'Medir el ahorro en el piloto'], ['DO2', 'Expediente del primer par'], ['DO3', 'Cuotas con un financista']], true);
  celda(1, 0, 'FA', [['FA1', 'Mismo auto, sin enchufe ni límite de antigüedad'], ['FA2', 'Habilita y franquicia SENCE']], false);
  celda(1, 1, 'DA', [['DA1', 'Cobertura cambiaria'], ['DA2', 'Convenios con casos piloto'], ['DA3', 'Proteger las calibraciones']], true);
  const xR = 8.35, wR = R - xR;
  caja(s, xR, y0, wR, 1.7);
  mono(s, 'HOY · DEFENSIVA', { x: xR + 0.2, y: y0 + 0.12, w: wR - 0.4, h: 0.28, bold: true, color: K.tx });
  T(s, [{ text: 'MEFE 2,03 · MEFI 2,32', options: { bold: true, breakLine: true } }, { text: 'ambas bajo 2,5: primero DO y DA', options: { color: K.gris } }], { x: xR + 0.2, y: y0 + 0.5, w: wR - 0.4, h: 1.0, fontSize: 18 });
  flecha(s, xR + wR / 2, y0 + 1.78, xR + wR / 2, y0 + 2.18, K.azul, 2);
  cajaAzul(s, xR, y0 + 2.25, wR, 1.65);
  mono(s, 'PARA PASAR A FO', { x: xR + 0.2, y: y0 + 2.37, w: wR - 0.3, h: 0.28, bold: true, color: K.azul, fontSize: 12 });
  T(s, [{ text: 'Evidencia, no puntaje', options: { bold: true, breakLine: true } }, { text: 'norma vigente, ahorro medido (C2) y margen positivo (F2)', options: { color: K.gris } }], { x: xR + 0.2, y: y0 + 2.75, w: wR - 0.4, h: 1.0, fontSize: 18 });
  fuente(s, 'David (1997) · Las 11 estrategias y su objetivo del CMI: informe, Tabla E3');
  return s;
};
// ===================================================================== BIBLIOGRAFÍA
const REFS = [
  'Autofact. (2026, 25 de marzo). Los autos eléctricos más baratos en Chile en 2026.',
  'Banco Central de Chile. (2026a). Informe de Política Monetaria, septiembre 2026.',
  'BioBioChile. (2026, 24 de marzo). GLP o bencina: lo que debes tener en cuenta si estás considerando cambiarte al gas vehicular.',
  'BloombergNEF. (2025, 9 de diciembre). Lithium-ion battery pack prices fall to $108 per kilowatt-hour despite rising metal prices.',
  'CNN Chile. (2026, septiembre). Mercado automotriz nacional creció 2,9% en agosto y acumula casi un millón de operaciones este 2026.',
  'David, F. R. (1997). Conceptos de administración estratégica (5.ª ed.). Prentice Hall Hispanoamericana.',
  'Decreto Supremo N° 55. (1988). Establece normas para la conversión de vehículos a gas. Ministerio de Transportes y Telecomunicaciones.',
  'Francés, A. (2006). Estrategia y planes para la empresa con el cuadro de mando integral. Pearson Educación.',
  'Garretón, M. (2026, 24 de marzo). Combustibles se disparan: Revisa cuánto costará llenar el estanque y los nuevos precios por región. Emol.',
  'Instituto Nacional de Estadísticas. (2025). Parque de vehículos en circulación 2024 [Conjunto de datos].',
  'Instituto Nacional de Estadísticas. (2026, 30 de septiembre). Boletín estadístico: empleo trimestral, edición n.º 335 (junio-agosto 2026).',
  'Kaplan, R. S., y Norton, D. P. (2008). The execution premium: integrando la estrategia y las operaciones para lograr ventajas competitivas. Ediciones Deusto.',
  'KMcheck. (2026, 18 de abril). Los 5 autos híbridos usados más buscados en Chileautos y sus precios referenciales (2026).',
  'Kovacevic, A., y Reynoso, Á. (2010). El diamante de la excelencia organizacional. Aguilar Chilena de Ediciones.',
  'Ley N° 21.793. (2026, 14 de enero). Modifica la Ley N° 18.290, de Tránsito, para autorizar talleres de transformación de sistemas de propulsión y otras adaptaciones. Diario Oficial.',
  'Ministerio de Transportes y Telecomunicaciones. (2021, 24 de mayo). Decreto Supremo N° 67 de 2020: requisitos para la autorización de proyectos experimentales. Subsecretaría de Transportes.',
  'Osterwalder, A., y Pigneur, Y. (2010). Business model generation. John Wiley & Sons.',
  'Osterwalder, A., Pigneur, Y., Bernarda, G., y Smith, A. (2014). Value proposition design. John Wiley & Sons.',
  'Porter, M. E. (1996). What is strategy? Harvard Business Review, 74(6), 61–78.',
  'Porter, M. E. (2008). The five competitive forces that shape strategy. Harvard Business Review, 86(1), 78–93.',
];
const biblio = (parte, refs) => () => {
  const s = contenido(`BIBLIOGRAFÍA · APA 7 · ${parte}`, 'BIBLIOGRAFÍA', null);
  T(s, refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1, paraSpaceAfter: 7 } })), { x: M, y: 1.7, w: CW, h: 4.9, fontSize: 14, color: K.tx });
  fuente(s, 'APA 7 · Enlaces completos en la bibliografía del informe');
  return s;
};
D.biblio1 = biblio('1 DE 2', REFS.slice(0, 10));
D.biblio2 = biblio('2 DE 2', REFS.slice(10));

// ===================================================================== ANEXO
D.indice = () => {
  const s = contenido('ANEXO · NO SE EXPONE', 'ANEXO PARA PREGUNTAS', null);
  const vistos = new Set(); const items = G.ANEXO.filter(a => !vistos.has(a.codigo) && vistos.add(a.codigo));
  items.forEach((a, i) => {
    const y = 1.85 + i * 0.86;
    caja(s, M, y, 8.5, 0.68);
    s.addText(a.codigo, { x: M + 0.2, y, w: 0.8, h: 0.68, fontFace: F_MONO, fontSize: 15, bold: true, color: K.azul, valign: 'middle', margin: 0, hyperlink: { slide: PRIMERA[a.codigo], tooltip: a.titulo } });
    s.addText(a.titulo, { x: M + 1.1, y, w: 7.2, h: 0.68, fontFace: F_BODY, fontSize: 17, color: K.tx, valign: 'middle', margin: 0, hyperlink: { slide: PRIMERA[a.codigo], tooltip: a.titulo } });
  });
  return s;
};
const CORTO = { A1: 'CONTINGENCIA REGULATORIA', A2: 'RELACIONES CAUSA-EFECTO', A3: 'FICHAS DE INDICADORES', A4: 'METAS PROVISIONALES', A5: 'MODELO DE NEGOCIO' };
const anexo = () => { const a = ANEXO_ACTUAL; return contenido(`${a.codigo} · ANEXO`, CORTO[a.codigo], null); };
const sinB = { type: 'none' };
function tablaLimpia(s, cols, filas, x, y, o = {}) {
  const lin = { pt: 0.75, color: K.linea }, fuerte = { pt: 1.25, color: K.tx };
  const head = cols.map(([k]) => ({ text: k, options: { fontFace: F_MONO, fontSize: 11, bold: true, color: K.gris, border: [sinB, sinB, fuerte, sinB] } }));
  const body = filas.map(f => f.map((v, j) => ({ text: v, options: { border: [sinB, sinB, lin, sinB], fontFace: j === 0 ? F_MONO : F_BODY, bold: j === 0, color: j === 0 ? K.azul : (o.gris && o.gris(f, j)) ? K.gris : K.tx, fontSize: o.size || 14 } })));
  s.addTable(o.sinTitulo ? body : [head, ...body], { x, y, w: cols.reduce((a, c) => a + c[1], 0), colW: cols.map(c => c[1]), fontFace: F_BODY, color: K.tx, margin: [0.02, 0.06, 0.02, 0.06], valign: 'middle', rowH: o.rh || 0.3, autoPage: false });
}
D['a-contingencia'] = () => {
  const s = anexo();
  tablaLimpia(s, [['ESCENARIO', 1.3], ['SEÑAL TEMPRANA', 3.6], ['EFECTO EN EL CMI', 3.2], ['RESPUESTA', CW - 8.1]], [
    ['E1 · base', 'Se publica una norma propia sin exclusiones', 'Ninguno bloqueado', 'Avanzar par por par; apertura en enero de 2028'],
    ['E2', 'El borrador de la norma mantiene exclusiones', 'P2 y C4 se limitan al parque elegible', 'Priorizar modelos sin esos sistemas y ajustar la meta de captación'],
    ['E3', 'Un año después del informe del proyecto experimental no hay tramitación', 'P2, P3 y lo que depende de ellos quedan sin activar', 'Prolongar la preparación sin arrendar ni contratar; buscar autorización caso a caso'],
    ['E4', 'La autoridad rechaza toda vía', 'Se detiene lo que depende de la vía legal', 'No subir metas comerciales y reevaluar la continuidad del proyecto'],
  ], M, 1.75, { size: 15, rh: 0.55 });
  serif(s, 'La norma entra al mapa por las relaciones externas R03 y R07 y se revisa cada mes.', { x: M, y: 4.85, w: CW, h: 0.5, fontSize: 21 });
  fuente(s, 'Ley N° 21.793 (2026) · D.S. N° 67 (MTT, 2021) · Informe, anexo B');
  return s;
};
const REL = [['R01', 'A1 → P2', 'Habilitante', 'Calibraciones versionadas respaldan el expediente del par'], ['R02', 'P1 → P2', 'Habilitante', 'Los ensayos del proyecto experimental forman el expediente'], ['R03', 'Norma → P2', 'Externa', 'Sin norma propia no se autoriza la venta'], ['R04', 'P2 → P3', 'Habilitante', 'Solo pares autorizados se instalan'], ['R05', 'A2 → P3', 'Habilitante', 'Personal habilitado sostiene la ejecución segura'], ['R06', 'P3 → C1', 'Habilitante', 'El control final verifica la promesa técnica'], ['R07', 'Norma → P5', 'Externa', 'Cada taller de la red necesita su propia autorización'], ['R08', 'A3 → P4', 'Habilitante', 'Datos comparables permiten reportes defendibles'], ['R09', 'P3 → P4', 'Hipótesis', 'Una instalación trazable permite el seguimiento'], ['R10', 'P4 → C2', 'Habilitante', 'Sin medición comparable no se verifica la promesa'], ['R11', 'C1 → C3', 'Hipótesis', 'Cumplir la promesa técnica reforzaría la confianza'], ['R12', 'C2 → C3', 'Hipótesis', 'Un ahorro verificado sumaría confianza'], ['R13', 'P6 → C3', 'Hipótesis', 'El respaldo de aseguradoras y plantas suma confianza'], ['R14', 'C3 → C4', 'Hipótesis', 'Más confianza y recomendación mejorarían la conversión'], ['R15', 'P6 → C4', 'Hipótesis', 'Pagar en cuotas destrabaría la compra'], ['R16', 'C4 → F2', 'Hipótesis', 'Más volumen aporta solo con margen positivo'], ['R17', 'P3 → F2', 'Hipótesis', 'Menos retrabajo contendría el costo directo'], ['R18', 'F2 → F1', 'Hipótesis', 'El margen alimenta los flujos que se descuentan'], ['R19', 'A4 → P5', 'Hipótesis', 'Un método documentado hace replicable el servicio'], ['R20', 'P5 → F3', 'Hipótesis', 'El paquete permite evaluar cada incorporación'], ['R21', 'F3 → F1', 'Hipótesis', 'Expandirse crea valor solo con evaluación positiva']];
D['a-relaciones'] = () => {
  const s = anexo(); const w = (CW - 0.3) / 2, cols = [['N°', 0.55], ['RELACIÓN', 1.25], ['TIPO', 1.05], ['MECANISMO', w - 2.85]];
  const gris = (f, j) => j === 2 && f[2] === 'Hipótesis';
  tablaLimpia(s, cols, REL.slice(0, 11), M, 1.6, { size: 11, rh: 0.34, gris });
  tablaLimpia(s, cols, REL.slice(11), M + w + 0.3, 1.6, { size: 11, rh: 0.34, gris });
  fuente(s, 'Informe, anexo I · Cadenas: habilitación R01–R07 · evidencia R08–R15 · valor R16–R21');
  return s;
};
D['a-fichas'] = () => {
  const s = anexo(); const w = (CW - 0.3) / 2;
  const ficha = (x, k, filas) => { mono(s, k, { x, y: 1.7, w, h: 0.3, bold: true, color: K.azul, fontSize: 14, charSpacing: 2 }); tablaLimpia(s, [['', 1.35], ['', w - 1.35]], filas, x, 2.05, { size: 13, rh: 0.5, sinTitulo: true }); };
  ficha(M, 'C2 · PROMESA DE AHORRO', [['INDICADOR', 'Clientes cuyo ahorro medido a los tres meses es igual o superior al mínimo informado al cotizar'], ['FÓRMULA', 'Clientes con ahorro ≥ límite inferior informado ÷ clientes con medición completa × 100'], ['REGLA', 'Cumple ≥ 80%; alerta de 72% a 79%; no cumple bajo 72%'], ['FUENTE', 'Unidad de control frente a la línea base del mismo auto (P4); trimestral'], ['META', '80% provisional · Comercial y Postventa'], ['SI HAY BRECHA', 'Revisar el estimador y el intervalo informado antes de aumentar la promoción']]);
  ficha(M + w + 0.3, 'P1 · PROYECTO EXPERIMENTAL', [['INDICADOR', 'Resolución que lo autoriza, vehículos medidos e informe entregado al 3CV'], ['TIPO', 'Hito: no iniciado · en curso · cumplido con documento · vencido'], ['EVIDENCIA', 'Resolución del MTT, protocolo aprobado (A3), registros e informe con acuse'], ['FUENTE', 'Registro de trámites; revisión mensual mientras esté abierto'], ['META', 'Solicitud en el 1.er trimestre de 2027 · Gerencia General'], ['SI HAY BRECHA', 'Si la resolución se atrasa más de un trimestre, recalendarizar y no comprometer arriendo']]);
  fuente(s, 'Informe, sección 9.5 · Estados: cumple · alerta · no cumple · no aplica todavía');
  return s;
};
D['a-metas'] = () => {
  const s = anexo();
  tablaLimpia(s, [['OBJ.', 0.7], ['META Y FUNDAMENTO', 3.9], ['DATO QUE FALTA Y QUIÉN', 3.5], ['CUÁNDO Y MIENTRAS TANTO', CW - 8.1]], [
    ['C2', '80%: objetivo de marketing del plan; el mínimo informado es el límite inferior del intervalo simulado', 'Ahorro medido en el proyecto experimental · Ingeniería de Calibración', 'Al cerrar el proyecto; hasta entonces se informa solo el intervalo, nunca una cifra puntual'],
    ['C3', '80% con 4 o 5: objetivo de satisfacción del plan', 'Primera medición a clientes · Comercial y Postventa', 'Tras el primer trimestre de ventas; los reclamos se registran desde la primera entrega'],
    ['C4', '30%: supuesto del pronóstico de ventas', 'Embudo de los tres primeros meses · Comercial y Postventa', 'Al tercer mes; bajo 30% se corrige la meta de ventas antes de contratar el siguiente dúo'],
    ['F1', 'VAN > 0 a la tasa exigida', 'Tasa de costo de capital y flujos aprobados · Gerencia General', 'Con el Plan Financiero; sin plan aprobado no se compromete inversión'],
  ], M, 1.75, { size: 14, rh: 0.6 });
  fuente(s, 'Informe, sección 9.3 · Objetivos de marketing y pronóstico del plan');
  return s;
};
D['a-canvas'] = () => {
  const s = anexo();
  const x0 = M, y0 = 1.6, w = CW / 5, hT = 3.45, hB = 6.55 - y0 - hT;
  const bloque = (x, y, bw, bh, titulo, items, o = {}) => {
    s.addShape(S.rect, { x, y, w: bw, h: bh, fill: { color: o.azul ? K.suave : K.blanco }, line: { color: K.tx, width: 1 } });
    mono(s, titulo, { x: x + 0.1, y: y + 0.08, w: bw - 0.2, h: 0.26, fontSize: 12, bold: true, color: K.azul });
    T(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 3 } })), { x: x + 0.12, y: y + 0.38, w: bw - 0.26, h: bh - 0.46, fontSize: o.size || 13 });
  };
  bloque(x0, y0, w, hT, 'SOCIOS CLAVE', ['Proveedores del kit (motores, batería de litio-titanato, unidad de control)', 'Aseguradoras y plantas de revisión técnica', 'Entidad financiera', 'Talleres licenciados (segunda etapa)']);
  bloque(x0 + w, y0, w, hT / 2, 'ACTIVIDADES', ['Diagnóstico de compatibilidad', 'Instalación y calibración por modelo', 'Homologación por par modelo-kit'], { size: 12 });
  bloque(x0 + w, y0 + hT / 2, w, hT / 2, 'RECURSOS', ['Biblioteca y base de consumo medido', 'Estimador y Lumine Habilita', 'Técnicos en alta tensión'], { size: 12 });
  bloque(x0 + 2 * w, y0, w, hT, 'PROPUESTA DE VALOR', ['Ahorrar combustible con el mismo auto, sin tocar el motor', 'Calibración para su modelo', 'Ahorro medido, no prometido', 'Respaldo formal ante el seguro y la revisión técnica'], { azul: true, size: 14 });
  bloque(x0 + 3 * w, y0, w, hT / 2, 'RELACIÓN', ['Diagnóstico previo y reporte de ahorro', 'Seguimiento posventa', 'Recomendación entre conductores'], { size: 12 });
  bloque(x0 + 3 * w, y0 + hT / 2, w, hT / 2, 'CANALES', ['Canal digital con estimador', 'Convenios con flotas y líneas de colectivos', 'Taller propio; luego la red'], { size: 12 });
  bloque(x0 + 4 * w, y0, w, hT, 'SEGMENTOS', ['Conductores de uso intensivo en la RM: aplicación, taxis y colectivos', 'Particulares de alto kilometraje', 'Talleres que licencian el método (segunda línea)']);
  bloque(x0, y0 + hT, CW / 2, hB, 'COSTOS', ['Kit importado, pagado en dólares · personal técnico y formación', 'Calibración y homologación por modelo · taller y reciclaje de baterías']);
  bloque(x0 + CW / 2, y0 + hT, CW / 2, hB, 'INGRESOS', ['Venta e instalación del kit Esencial o Plus', 'Posventa y recalibración · licencias y kits para la red de talleres']);
  fuente(s, 'Adaptado de Osterwalder y Pigneur (2010) · Informe, anexo A');
  return s;
};

// ---------- orden, notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · Informe: ${x.seccion}\n\nIDEA: ${x.idea}\nEVIDENCIA: ${x.evidencia}\nCONCEPTO: ${x.concepto}\nTRANSICIÓN: ${x.transicion}`;
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
