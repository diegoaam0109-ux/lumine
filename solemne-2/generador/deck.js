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

// Fuente al pie de cada diapositiva. Solo se citan los materiales del paquete de la Solemne y del curso.
const PAQ = 'dossier y Excel de la Solemne 2';
const FUENTES = {
  negocio: 'Fuente: contexto vigente de Lumine Motors (17-10-2026). El ahorro es una estimación de ingeniería, no medida en autos chilenos. Imagen ilustrativa del kit.',
  correccion: 'Fuentes: CMI de Lumine, versión original y versión actualizada a las Fases 1 y 2; retroalimentación del profesor, transcrita por el equipo.',
  valor: `Fuente: elaboración propia (${PAQ}, indicador C01). Meta de diseño propuesta; sin clientes no hay dato real.`,
  mapa: `Fuentes: CMI de Lumine actualizado (Fases 1 y 2); ${PAQ}; módulos 2 y 3 del curso. Cada flecha es una hipótesis de causa y efecto por verificar.`,
  capacidades: `Fuente: elaboración propia (${PAQ}, hoja MATRIZ_CMI: A01, A02, P02 y P03). Metas de diseño propuestas.`,
  clientes: `Fuente: elaboración propia (${PAQ}, hoja MATRIZ_CMI: C01, C02 y C03). La meta de C03 es orientativa.`,
  eva: 'Fuentes: módulo 4 del curso (empresa genérica en US$, no Lumine); Excel de la Solemne 2, hoja EVA.',
  ficha: 'Fuentes: material del curso «Sistemas de Control de Gestión: Indicadores»; Excel de la Solemne 2, hojas MATRIZ_CMI y SEGUIMIENTO. Umbrales propuestos.',
  desviacion: 'Fuente: Excel de la Solemne 2, hoja CASO_SIMULADO. Ejercicio didáctico: no son datos de Lumine.',
  ciclo: 'Fuentes: material del curso «Sistemas de Control de Gestión: Indicadores» (ciclo de seguimiento); Excel de la Solemne 2, hoja CASO_SIMULADO.',
  conclusion: `Fuente: elaboración propia (${PAQ}). El WACC y la tolerancia de error del ahorro quedan por definir con antecedentes.`,
};

let SEC = null, CLAVE = null, NUM = 0;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(etiqueta, titulo, acento) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SEC });
  const n = String(++NUM).padStart(2, '0');
  s.addText([{ text: n, options: { color: C.accent1 } }, { text: '  —— ', options: { color: C.accent5 } }, { text: etiqueta }], { placeholder: 'etiqueta' });
  s.addText([{ text: titulo + ' ' }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: TX.acento } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.94, w: R - M - 1.0, h: 0.42, valign: 'top', fontSize: TX.inst, color: C.text2 });
  return s;
}
// leyenda de estados en la esquina superior derecha (a la altura de la etiqueta)
function leyendaEstados(s, tipos) {
  let x = R;
  [...tipos].reverse().forEach(t => {
    const [color, text] = ESTADO[t];
    const w = text.length * (12 * 0.6 + 0.5) / 72 + 0.2;
    x -= w;
    mono(s, text, { x, y: 0.92, w, h: 0.3, fontSize: 12, color, valign: 'middle', charSpacing: 0.5 });
    s.addShape(S.ellipse, { x: x - 0.24, y: 0.99, w: 0.15, h: 0.15, fill: { color }, line: { type: 'none' } });
    x -= 0.6;
  });
}

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
  // premisa: lo que el tablero puede y no puede mostrar hoy
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
  // anotación de ingeniería sobre el auto de portada-premium.jpg (mismas coordenadas que en la Fase 3)
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
// 2 · EL NEGOCIO Y SUS CONDICIONES · qué es el kit y qué falta demostrar
// =====================================================================
D.negocio = () => {
  const s = contenido('CONTEXTO · EL NEGOCIO', 'EL NEGOCIO', 'y sus condiciones.');
  const iw = 4.9, ih = iw * 1065 / 1257;
  s.addImage({ path: A('producto-kit.jpg'), x: M, y: Y0, w: iw, h: ih, altText: 'Ilustración del kit: batería bajo el piso y motor eléctrico en el eje trasero' });
  s.addShape(S.rect, { x: M, y: Y0, w: iw, h: ih, fill: { color: C.background1, transparency: 100 }, line: { color: C.accent5, width: 0.75 } });
  mono(s, 'IMAGEN ILUSTRATIVA', { x: M + 0.18, y: Y0 + 0.14, w: 3, h: 0.26, fontSize: 12 });
  const x = M + iw + 0.5, w = R - x, rh = 0.7;
  const filas = [
    ['Asistencia eléctrica en el eje trasero, sin enchufe.', null],
    ['El motor original se mantiene.', null],
    ['Hasta 20% menos bencina en ciudad', ['est', 'ESTIMACIÓN, NO MEDICIÓN']],
    ['Reglamento y homologación', ['crit']],
    ['Ventas, clientes e instalaciones', ['sin', 'AÚN NO EXISTEN']],
  ];
  filas.forEach(([t, st], i) => {
    const y = Y0 + i * rh;
    if (i) regla(s, y, x, w);
    let pw = 0;
    if (st) {
      pw = st[0] === 'est' ? marca(s, 'est', st[1], R, y + (rh - 0.4) / 2, { alignRight: true })
        : estado(s, st[0], R, y + (rh - 0.4) / 2, { alignRight: true, text: st[1] });
    }
    T(s, t, { x, y, w: w - pw - 0.2, h: rh, fontSize: TX.cuerpo, valign: 'middle', bold: i < 2, color: i < 2 ? C.text1 : C.text1 });
  });
  const by = Y0 + 5 * rh;
  regla(s, by, x, w, C.accent1);
  T(s, [{ text: 'Cliente: ', options: { bold: true } }, { text: 'uso intensivo primero, sin excluir particulares ni flotas.', options: { color: C.text2 } }],
    { x, y: by + 0.12, w, h: 0.62, fontSize: 18, valign: 'top' });
  return s;
};

// =====================================================================
// 3 · LO QUE CORRIGIÓ EL CMI · observación del profesor → corrección
// =====================================================================
D.correccion = () => {
  const s = contenido('RETROALIMENTACIÓN · CMI ORIGINAL Y ACTUALIZADO', 'LO QUE CORRIGIÓ', 'el CMI.');
  const lw = 5.9, rx = M + lw + 0.75, rw = R - rx;
  mono(s, 'OBSERVACIÓN DEL PROFESOR', { x: M, y: Y0, w: lw, h: 0.3 });
  mono(s, 'CORRECCIÓN', { x: rx, y: Y0, w: rw, h: 0.3, color: C.accent1 });
  const filas = [
    ['Rentabilidad por sobre el costo de capital', 'DESTACADO', 'Se conserva y se mide con EVA'],
    ['Clientes descritos como canales y convenios', 'CRÍTICA', 'La propuesta de valor al centro, medida'],
    ['Objetivos poco coordinados entre sí', 'CRÍTICA', 'Flechas de causa y efecto con KPI y evidencia'],
  ];
  const rh = 0.98, g = 0.18;
  filas.forEach(([o, k, c], i) => {
    const y = Y0 + 0.45 + i * (rh + g);
    caja(s, M, y, lw, rh);
    const mw = k === 'DESTACADO'
      ? marca(s, 'est', k, M + lw - 0.2, y + (rh - 0.4) / 2, { alignRight: true })
      : marca(s, 'no', k, M + lw - 0.2, y + (rh - 0.4) / 2, { alignRight: true });
    T(s, o, { x: M + 0.25, y, w: lw - mw - 0.6, h: rh, fontSize: TX.cuerpo, color: C.text2, valign: 'middle' });
    flecha(s, M + lw + 0.12, y + rh / 2, 0.5, 0);
    if (i === 0) { cajaHot(s, rx, y, rw, rh); } else caja(s, rx, y, rw, rh, { line: { color: C.accent1, width: 1 } });
    T(s, c, { x: rx + 0.25, y, w: rw - 0.4, h: rh, fontSize: TX.cuerpoL, bold: true, valign: 'middle' });
  });
  T(s, 'Las cifras financieras del CMI original no se reutilizan sin conciliarlas.', { x: M, y: Y0 + 0.45 + 3 * (rh + g) + 0.04, w: CW, h: 0.4, fontSize: 18, color: C.text2 });
  return s;
};

// =====================================================================
// 4 · LA PROPUESTA DE VALOR SE DEBE MEDIR · qué compra el cliente y el KPI C01
// =====================================================================
D.valor = () => {
  const s = contenido('PERSPECTIVA DE CLIENTES · PROPUESTA DE VALOR', 'LA PROPUESTA DE VALOR', 'se debe medir.');
  const lw = 5.7;
  mono(s, 'LO QUE COMPRA EL CLIENTE', { x: M, y: Y0, w: lw, h: 0.3 });
  ['Modernizar su propio auto', 'Un procedimiento seguro y trazable', 'Evidencia de su consumo'].forEach((t, i) => {
    const y = Y0 + 0.5 + i * 0.86;
    tag(s, String(i + 1), M, y + 0.1, { off: i < 2, w: 0.5, h: 0.5, size: 20 });
    T(s, t, { x: M + 0.75, y, w: lw - 0.75, h: 0.7, fontSize: TX.cuerpoL, bold: i === 2, color: i === 2 ? C.accent1 : C.text1, valign: 'middle' });
  });
  // tarjeta del indicador C01
  const cx = M + lw + 0.6, cw = R - cx, cy = Y0, ch = 3.2;
  brillo(s, cx, cy, cw, ch, 0.6);
  cajaHot(s, cx, cy, cw, ch);
  mono(s, 'C01 · INDICADOR PROPUESTO', { x: cx + 0.3, y: cy + 0.2, w: cw - 0.6, h: 0.3, color: C.accent1 });
  T(s, 'Clientes con informe antes y después', { x: cx + 0.3, y: cy + 0.6, w: cw - 0.6, h: 0.42, fontSize: TX.cuerpo, bold: true, align: 'center', valign: 'middle' });
  linea(s, cx + 0.5, cy + 1.08, cw - 1.0, 0, C.accent1, 1.5);
  T(s, 'Clientes intervenidos', { x: cx + 0.3, y: cy + 1.14, w: cw - 0.6, h: 0.42, fontSize: TX.cuerpo, align: 'center', valign: 'middle' });
  regla(s, cy + 1.78, cx + 0.3, cw - 0.6);
  const hw = (cw - 0.6) / 2;
  mono(s, 'META', { x: cx + 0.3, y: cy + 1.92, w: hw, h: 0.28, fontSize: 14 });
  numero(s, '100%', { x: cx + 0.3, y: cy + 2.18, w: 1.7, h: 0.72, fontSize: TX.cifra, color: C.accent1 });
  marca(s, 'sup', 'DISEÑO', cx + 2.0, cy + 2.42, { size: 12, h: 0.34 });
  mono(s, 'REAL', { x: cx + 0.3 + hw + 0.1, y: cy + 1.92, w: hw, h: 0.28, fontSize: 14 });
  estado(s, 'sin', cx + 0.3 + hw + 0.1, cy + 2.38, { size: 16, h: 0.46 });
  const by = Y0 + ch + 0.42;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Entregar evidencia ', options: { bold: true } }, { text: 'no es lo mismo que prometer 20% de ahorro.', options: { bold: true, color: C.accent1 } }],
    { x: M, y: by + 0.14, w: CW, h: 0.5, fontSize: TX.sub, valign: 'middle' });
  return s;
};

// =====================================================================
// 5 · CUATRO PERSPECTIVAS, UNA CADENA CAUSAL · mapa estratégico con flechas rotuladas
// =====================================================================
D.mapa = () => {
  const s = contenido('MAPA ESTRATÉGICO · CAUSA Y EFECTO', 'CUATRO PERSPECTIVAS,', 'una cadena causal.');
  leyendaEstados(s, ['sin', 'crit']);
  const col = [2.55, 5.18, 7.81, 10.44], cw = 2.29, nh = 0.6, g = 0.32;
  const fila = { F: Y0 - 0.04 }; fila.K = fila.F + nh + g; fila.C = fila.K + nh + g; fila.P = fila.C + nh + g; fila.A = fila.P + nh + g;
  // nombres de las perspectivas
  [['FINANCIERA', fila.F, nh], ['CLIENTES', fila.K, 2 * nh + g], ['PROCESOS', fila.P, nh], ['APRENDIZAJE', fila.A, nh]].forEach(([t, y, h]) => {
    linea(s, M, y, 0, h, C.accent1, 2);
    mono(s, t, { x: M + 0.16, y, w: 1.8, h, fontSize: 14, color: C.text1, valign: 'middle' });
  });
  const nodo = (code, text, x, y, w, tipo) => {
    if (tipo === 'hot') { brillo(s, x, y, w, nh, 0.4); cajaHot(s, x, y, w, nh); }
    else caja(s, x, y, w, nh, { line: { color: tipo === 'crit' ? ROJO : GRIS, width: tipo === 'crit' ? 1.5 : 0.75 } });
    let tx = x + 0.14;
    if (code) { tag(s, code, x + 0.12, y + (nh - 0.32) / 2, { w: 0.58, h: 0.32, size: 13, off: tipo !== 'hot' }); tx = x + 0.82; }
    T(s, text, { x: tx, y, w: x + w - tx - 0.08, h: nh, fontSize: 16, bold: tipo === 'hot', valign: 'middle', lineSpacingMultiple: 0.88 });
  };
  const ancho = (a, b) => col[b] + cw - col[a];
  nodo('F01', 'EVA > 0: rentabilidad sobre el costo de capital', col[1], fila.F, ancho(1, 2), 'hot');
  // confianza: el resultado de la propuesta de valor en la perspectiva de clientes
  caja(s, col[0], fila.K, ancho(0, 3), nh, { line: { color: C.accent1, width: 1 } });
  T(s, 'Confianza: el cliente valora el resultado', { x: col[0], y: fila.K, w: ancho(0, 3), h: nh, fontSize: 18, bold: true, align: 'center', valign: 'middle' });
  nodo('C01', 'Informe individual antes y después', col[0], fila.C, ancho(0, 1), 'sin');
  nodo('C02', 'Respaldo de aseguradora y planta de revisión técnica', col[2], fila.C, ancho(2, 3), 'sin');
  nodo('P03', 'Actas de seguridad', col[1], fila.P, cw, 'sin');
  nodo('P02', 'Kit homologado', col[2], fila.P, cw, 'crit');
  nodo('P01', 'Autorización sectorial', col[3], fila.P, cw, 'crit');
  nodo('A03', 'Medición comparativa', col[0], fila.A, cw, 'sin');
  nodo('A02', 'Técnicos habilitados', col[1], fila.A, cw, 'sin');
  nodo('A01', 'Biblioteca de calibraciones', col[2], fila.A, cw, 'sin');
  // flechas de causa y efecto, siempre hacia arriba, con su rótulo a la derecha
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
// 6 · LAS CAPACIDADES SOSTIENEN PROCESOS SEGUROS · dos pares causa → efecto
// =====================================================================
D.capacidades = () => {
  const s = contenido('APRENDIZAJE Y PROCESOS · INDICADORES', 'LAS CAPACIDADES', 'sostienen procesos seguros.');
  leyendaEstados(s, ['sin', 'crit']);
  const lw = 5.25, gx = 1.1, rx = M + lw + gx, rw = R - rx, rh = 1.35, g = 0.2;
  mono(s, 'APRENDIZAJE', { x: M, y: Y0, w: lw, h: 0.3 });
  mono(s, 'PROCESOS', { x: rx, y: Y0, w: rw, h: 0.3 });
  const tarjeta = (code, text, meta, st, x, y, w) => {
    caja(s, x, y, w, rh, { line: { color: st === 'crit' ? ROJO : GRIS, width: st === 'crit' ? 1.5 : 0.75 } });
    tag(s, code, x + 0.22, y + 0.22, { w: 0.7, h: 0.4, size: 16, off: true });
    T(s, text, { x: x + 1.1, y: y + 0.12, w: w - 1.3, h: 0.66, fontSize: TX.cuerpo, bold: true, valign: 'middle', lineSpacingMultiple: 0.92 });
    mono(s, 'META', { x: x + 0.22, y: y + rh - 0.5, w: 0.7, h: 0.36, fontSize: 14, valign: 'middle' });
    numero(s, meta, { x: x + 0.92, y: y + rh - 0.58, w: 1.6, h: 0.5, fontSize: TX.cifraS, valign: 'middle' });
    estado(s, st, x + w - 0.22, y + rh - 0.55, { alignRight: true });
  };
  [
    ['A02', 'Técnicos habilitados antes de intervenir', '100%', 'sin', 'P03', 'Órdenes cerradas con actas de seguridad', '100%', 'sin', 'habilita el control'],
    ['A01', 'Calibraciones registradas en la biblioteca', '100%', 'sin', 'P02', 'Primer par modelo-kit homologado', '1 par', 'crit', 'permite homologar'],
  ].forEach(([c1, t1, m1, s1, c2, t2, m2, s2, rot], i) => {
    const y = Y0 + 0.42 + i * (rh + g);
    tarjeta(c1, t1, m1, s1, M, y, lw);
    tarjeta(c2, t2, m2, s2, rx, y, rw);
    flecha(s, M + lw + 0.12, y + rh / 2, gx - 0.24, 0);
    serif(s, rot, { x: M + lw, y: y + rh / 2 - 0.5, w: gx, h: 0.42, fontSize: 16, align: 'center', valign: 'bottom' });
  });
  const by = Y0 + 0.42 + 2 * (rh + g) + 0.04;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Un hito crítico no se compensa: ', options: { bold: true } }, { text: 'si falta, no se opera.', options: { bold: true, color: C.accent1 } }],
    { x: M, y: by + 0.12, w: CW, h: 0.5, fontSize: TX.sub, valign: 'middle' });
  return s;
};

// =====================================================================
// 7 · CLIENTES: EL VALOR LLEGA AL USUARIO · C01 al centro; C02 y C03 lo acompañan
// =====================================================================
D.clientes = () => {
  const s = contenido('PERSPECTIVA DE CLIENTES · INDICADORES', 'CLIENTES:', 'el valor llega al usuario.');
  leyendaEstados(s, ['sin']);
  const lw = 6.2, ch = 3.3, cy = Y0;
  brillo(s, M, cy, lw, ch, 0.6);
  cajaHot(s, M, cy, lw, ch);
  mono(s, 'C01 · VALOR ENTREGADO', { x: M + 0.3, y: cy + 0.22, w: lw - 0.6, h: 0.3, color: C.accent1 });
  T(s, 'Informe individual de ahorro, antes y después, en condiciones comparables', { x: M + 0.3, y: cy + 0.62, w: lw - 0.6, h: 1.2, fontSize: TX.cuerpoL, bold: true, valign: 'top', lineSpacingMultiple: 1.0 });
  T(s, 'Si el ahorro difiere, se revisan el dato base y la calibración, y se explica al cliente.', { x: M + 0.3, y: cy + 1.62, w: lw - 0.6, h: 0.62, fontSize: 18, color: C.text2 });
  mono(s, 'META', { x: M + 0.3, y: cy + ch - 0.66, w: 0.8, h: 0.46, fontSize: 14, valign: 'middle' });
  numero(s, '100%', { x: M + 1.05, y: cy + ch - 0.74, w: 1.5, h: 0.6, fontSize: TX.cifraM, valign: 'middle', color: C.accent1 });
  estado(s, 'sin', M + lw - 0.3, cy + ch - 0.68, { alignRight: true, size: 16, h: 0.46 });
  // tarjetas de apoyo
  const rx = M + lw + 0.5, rw = R - rx, sh = (ch - 0.3) / 2;
  [
    ['C02 · CONFIANZA', 'Protocolo con una aseguradora y una planta de revisión técnica', ['sin']],
    ['C03 · FOCO COMERCIAL', 'Más de 50% de consultas de uso intensivo, sin excluir particulares ni flotas', ['sup', 'ORIENTATIVA']],
  ].forEach(([k, t, st], i) => {
    const y = cy + i * (sh + 0.3);
    caja(s, rx, y, rw, sh, { line: { color: GRIS, width: 0.75 } });
    mono(s, k, { x: rx + 0.25, y: y + 0.18, w: rw - 0.5, h: 0.3, fontSize: 14 });
    if (st[0] === 'sin') estado(s, 'sin', rx + rw - 0.2, y + 0.12, { alignRight: true, size: 12, h: 0.36 });
    else marca(s, 'sup', st[1], rx + rw - 0.2, y + 0.12, { alignRight: true, size: 12, h: 0.36 });
    T(s, t, { x: rx + 0.25, y: y + 0.56, w: rw - 0.5, h: sh - 0.68, fontSize: 18, valign: 'top' });
  });
  const by = cy + ch + 0.36;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'El centro es lo que recibe el cliente, ', options: { bold: true } }, { text: 'no los canales ni los convenios.', options: { bold: true, color: C.accent1 } }],
    { x: M, y: by + 0.14, w: CW, h: 0.5, fontSize: TX.sub, valign: 'middle' });
  return s;
};

// =====================================================================
// 8 · ¿LA RENTABILIDAD SUPERA EL COSTO DE CAPITAL? · EVA con el ejemplo del módulo 4
// =====================================================================
D.eva = () => {
  const s = contenido('PERSPECTIVA FINANCIERA · EVA', '¿LA RENTABILIDAD SUPERA', 'el costo de capital?');
  // fórmula
  numero(s, [{ text: 'EVA', options: { color: C.accent1 } }, { text: '  =  NOPAT  −  CAPITAL INVERTIDO  ×  WACC' }], { x: M, y: Y0 - 0.06, w: CW, h: 0.7, fontSize: 40, valign: 'middle' });
  T(s, [{ text: 'NOPAT: ', options: { bold: true, color: C.text1 } }, { text: 'resultado operativo después de impuestos   ·   ' }, { text: 'WACC: ', options: { bold: true, color: C.text1 } }, { text: 'costo promedio ponderado del capital' }],
    { x: M, y: Y0 + 0.66, w: CW, h: 0.36, fontSize: 18, color: C.text2, valign: 'middle' });
  const cy = Y0 + 1.3, ch = YF - cy - 0.06, lw = 7.1;
  // ejemplo del curso
  cajaHot(s, M, cy, lw, ch);
  noLumine(s, 'EJEMPLO DE CLASE · NO LUMINE', M + 0.3, cy + 0.24);
  const fila = (k, v, y, o = {}) => {
    T(s, k, { x: M + 0.3, y, w: 4.2, h: 0.5, fontSize: o.k || TX.cuerpo, bold: !!o.b, valign: 'middle', color: o.kc || C.text1 });
    numero(s, v, { x: M + 3.6, y, w: lw - 3.9, h: 0.5, fontSize: o.size || TX.cifraS, align: 'right', valign: 'middle', color: o.color || C.text1 });
  };
  fila('NOPAT', 'US$ 150.000', cy + 0.86);
  fila('Cargo por capital: 1.000.000 × 12%', '− US$ 120.000', cy + 1.4, { k: 18, kc: C.text2 });
  regla(s, cy + 2.0, M + 0.3, lw - 0.6, C.accent1);
  fila('EVA', 'US$ 30.000', cy + 2.12, { b: true, size: TX.cifra, color: C.accent1 });
  // Lumine hoy
  const rx = M + lw + 0.5, rw = R - rx;
  caja(s, rx, cy, rw, ch, { line: { color: GRIS, width: 0.75 } });
  mono(s, 'LUMINE HOY', { x: rx + 0.3, y: cy + 0.28, w: rw - 0.6, h: 0.3, color: C.text1 });
  estado(s, 'sin', rx + 0.3, cy + 0.72, { text: 'SIN DATOS', size: 16, h: 0.46 });
  T(s, 'NOPAT, capital y WACC aún no existen.', { x: rx + 0.3, y: cy + 1.34, w: rw - 0.6, h: 0.7, fontSize: TX.cuerpo });
  regla(s, cy + 2.12, rx + 0.3, rw - 0.6);
  T(s, [{ text: 'VAN y TIR ', options: { bold: true, color: C.text1 } }, { text: 'evalúan el proyecto; ' }, { text: 'EVA ', options: { bold: true, color: C.text1 } }, { text: 'mide cada período.' }],
    { x: rx + 0.3, y: cy + 2.22, w: rw - 0.6, h: 0.7, fontSize: 18, color: C.text2 });
  return s;
};

// =====================================================================
// 9 · EL INDICADOR NECESITA RESPONSABLE Y EVIDENCIA · ficha de C01 y semáforo
// =====================================================================
D.ficha = () => {
  const s = contenido('CMI · FICHA DEL INDICADOR Y SEMÁFORO', 'EL INDICADOR NECESITA', 'responsable y evidencia.');
  const lw = 7.5;
  mono(s, 'FICHA · C01 INFORME AL CLIENTE', { x: M, y: Y0, w: lw, h: 0.3, color: C.accent1 });
  const filas = [
    ['FÓRMULA', 'Clientes con informe ÷ clientes intervenidos'],
    ['META', '100%, cuando existan clientes'],
    ['FRECUENCIA', 'Por instalación'],
    ['RESPONSABLE', 'Comercial y Postventa'],
    ['EVIDENCIA', 'Informe antes y después, con acuse de entrega'],
    ['SI SE DESVÍA', 'Completar el informe y contactar al cliente'],
  ];
  const rh = 0.6, y0 = Y0 + 0.4;
  filas.forEach(([k, v], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, lw, i ? C.accent5 : C.accent1);
    mono(s, k, { x: M, y, w: 2.0, h: rh, fontSize: 14, valign: 'middle' });
    T(s, v, { x: M + 2.05, y, w: lw - 2.05, h: rh, fontSize: 19, bold: k === 'RESPONSABLE' || k === 'EVIDENCIA', valign: 'middle' });
  });
  regla(s, y0 + filas.length * rh, M, lw);
  // semáforo
  const rx = M + lw + 0.55, rw = R - rx;
  mono(s, 'SEMÁFORO', { x: rx, y: Y0, w: rw, h: 0.3, color: C.accent1 });
  const luces = [
    [GRIS, 'SIN MEDIR', 'celda vacía: no es incumplido'],
    [VERDE, 'VERDE', '90% o más'],
    [AMBAR, 'ÁMBAR', '70% a 89%'],
    [ROJO, 'ROJO', 'menos de 70%'],
  ];
  const lh = 0.56;
  luces.forEach(([color, k, v], i) => {
    const y = y0 + i * lh;
    s.addShape(S.ellipse, { x: rx, y: y + (lh - 0.3) / 2, w: 0.3, h: 0.3, fill: { color }, line: { type: 'none' } });
    mono(s, k, { x: rx + 0.45, y, w: 1.6, h: lh, fontSize: 15, bold: true, color, valign: 'middle' });
    T(s, v, { x: rx + 1.95, y, w: rw - 1.95, h: lh, fontSize: 17, color: C.text2, valign: 'middle' });
  });
  const hy = y0 + 4 * lh + 0.2, hh = y0 + filas.length * rh - hy;
  cajaHot(s, rx, hy, rw, hh);
  T(s, [{ text: 'Hito crítico o de seguridad: ', options: { breakLine: true, color: C.text2 } }, { text: 'verde solo al 100%.', options: { bold: true } }],
    { x: rx + 0.25, y: hy, w: rw - 0.5, h: hh, fontSize: TX.cuerpo, valign: 'middle' });
  return s;
};

// =====================================================================
// 10 · CUANDO LA META SE INCUMPLE: 8 DE 10 · ejercicio hipotético
// =====================================================================
D.desviacion = () => {
  const s = contenido('CONTROL · DESVIACIÓN DE UNA META', 'CUANDO LA META SE INCUMPLE:', '8 de 10.');
  noLumine(s, 'EJERCICIO HIPOTÉTICO', R, Y0 - 0.08, { alignRight: true });
  mono(s, 'INFORMES ENTREGADOS · 10 CLIENTES INTERVENIDOS', { x: M, y: Y0, w: 8, h: 0.3 });
  // diez clientes: ocho con informe, dos sin informe
  const n = 10, g = 0.16, q = (CW - (n - 1) * g) / n, qy = Y0 + 0.5, qh = 0.78;
  for (let i = 0; i < n; i++) {
    const x = M + i * (q + g), ok = i < 8;
    if (ok) s.addShape(S.rect, { x, y: qy, w: q, h: qh, fill: { color: C.accent1 }, line: { type: 'none' } });
    else s.addShape(S.rect, { x, y: qy, w: q, h: qh, fill: { color: C.background1, transparency: 100 }, line: { color: ROJO, width: 1.5, dashType: 'dash' } });
    T(s, ok ? String(i + 1) : 'FALTA', { x, y: qy, w: q, h: qh, fontFace: F_MONO, fontSize: ok ? 18 : 14, bold: true, align: 'center', valign: 'middle', color: ok ? C.background1 : ROJO });
  }
  // las tres cifras
  const ny = qy + qh + 0.3, nw = CW / 3;
  [['REAL', '80%', C.text1], ['META', '100%', C.text1], ['DESVIACIÓN', '−20 pp', C.accent1]].forEach(([k, v, color], i) => {
    const x = M + i * nw;
    if (i === 2) brillo(s, x + 0.2, ny + 0.2, 2.6, 0.7, 0.5);
    mono(s, k, { x, y: ny, w: nw, h: 0.3, fontSize: 14 });
    numero(s, v, { x, y: ny + 0.3, w: nw - 0.2, h: 0.8, fontSize: TX.cifraXL, valign: 'middle', color });
  });
  // dos lecturas del mismo 80%
  const cy = ny + 1.32, ch = YF - cy, cw = (CW - 0.4) / 2;
  caja(s, M, cy, cw, ch, { line: { color: AMBAR, width: 1 } });
  mono(s, 'REGLA GENERAL', { x: M + 0.25, y: cy + 0.16, w: cw - 0.5, h: 0.3, fontSize: 14 });
  T(s, 'Entre 70% y 89%', { x: M + 0.25, y: cy + 0.5, w: cw - 2.2, h: 0.5, fontSize: TX.cuerpo, valign: 'middle' });
  estado(s, 'amb', M + cw - 0.25, cy + 0.52, { alignRight: true, size: 16, h: 0.46 });
  const x2 = M + cw + 0.4;
  cajaHot(s, x2, cy, cw, ch);
  mono(s, 'CONTROL CRÍTICO', { x: x2 + 0.25, y: cy + 0.16, w: cw - 0.5, h: 0.3, fontSize: 14, color: C.accent1 });
  T(s, 'El informe es obligatorio', { x: x2 + 0.25, y: cy + 0.5, w: cw - 2.0, h: 0.5, fontSize: TX.cuerpo, bold: true, valign: 'middle' });
  estado(s, 'rojo', x2 + cw - 0.25, cy + 0.52, { alignRight: true, size: 16, h: 0.46 });
  return s;
};

// =====================================================================
// 11 · MEDIR, EXPLICAR, CORREGIR, VERIFICAR · ciclo cerrado sobre los 2 informes que faltan
// =====================================================================
D.ciclo = () => {
  const s = contenido('CONTROL · ACCIÓN CORRECTIVA', 'MEDIR, EXPLICAR,', 'corregir y verificar.');
  noLumine(s, 'EJERCICIO HIPOTÉTICO', R, Y0 - 0.08, { alignRight: true });
  mono(s, 'LOS 2 INFORMES QUE FALTAN', { x: M, y: Y0, w: 8, h: 0.3 });
  const pasos = [
    ['MEDIR', 'Corte: 8 de 10 informes'],
    ['EXPLICAR', '¿Faltó medir, validar o entregar?'],
    ['CORREGIR', 'Responsable y plazo para cerrarlos'],
    ['VERIFICAR', 'Informe firmado, entrega y acuse'],
  ];
  const g = 0.5, pw = (CW - 3 * g) / 4, py = Y0 + 0.58, ph = 1.85;
  pasos.forEach(([k, v], i) => {
    const x = M + i * (pw + g), hot = i === 3;
    if (hot) cajaHot(s, x, py, pw, ph); else caja(s, x, py, pw, ph, { line: { color: C.text2, width: 0.75 } });
    tag(s, String(i + 1).padStart(2, '0'), x + 0.22, py + 0.22, { off: !hot, w: 0.6, h: 0.4, size: 16 });
    T(s, k, { x: x + 0.22, y: py + 0.72, w: pw - 0.44, h: 0.44, fontSize: TX.sub, bold: true, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    T(s, v, { x: x + 0.22, y: py + 1.18, w: pw - 0.4, h: 0.7, fontSize: 18, color: C.text2, valign: 'top' });
    if (i < 3) flecha(s, x + pw + 0.08, py + ph / 2, g - 0.16, 0);
  });
  // vuelta: nueva medición en el siguiente corte
  const ly = py + ph + 0.3, x1 = M + pw / 2, x4 = M + 3 * (pw + g) + pw / 2;
  linea(s, x4, py + ph, 0, ly - py - ph, C.accent1, 1.75);
  linea(s, x1, ly, x4 - x1, 0, C.accent1, 1.75);
  flecha(s, x1, ly, 0, py + ph - ly);
  serif(s, 'nueva medición en el siguiente corte', { x: x1 + 0.3, y: ly + 0.04, w: 6, h: 0.4, fontSize: 18 });
  const by = ly + 0.54;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Sin evidencia de cierre, la desviación sigue abierta. ', options: { bold: true } }, { text: 'Si la falla se repite, se rediseña el protocolo; no se culpa al último técnico.', options: { color: C.text2 } }],
    { x: M, y: by + 0.12, w: CW, h: YF - by - 0.1, fontSize: TX.cuerpo, valign: 'top' });
  return s;
};

// =====================================================================
// 12 · EL CMI PERMITE DECIDIR CUÁNDO AVANZAR · escalera de la cadena causal y pendientes
// =====================================================================
D.conclusion = () => {
  const s = contenido('CONCLUSIÓN', 'EL CMI PERMITE DECIDIR', 'cuándo avanzar.');
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
  numero(s, '0', { x: rx, y: ny + 0.08, w: 0.8, h: 0.9, fontSize: 60, valign: 'middle', color: C.accent1 });
  T(s, 'ventas, homologaciones o EVA presentados como logros', { x: rx + 0.85, y: ny + 0.08, w: rw - 0.85, h: 1.0, fontSize: 18, valign: 'middle' });
  regla(s, YF - 0.62, rx, rw);
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: rx, y: YF - 0.5, w: rw, h: 0.45, fontSize: 18, color: C.text1, valign: 'middle' });
  return s;
};

// ---------- orden de la exposición (guion.js) con notas del orador ----------
// Notas: orador, tiempo estimado (y el del plan del paquete), texto íntegro del guion y transición sugerida.
const nota = x => `${x.quien.toUpperCase()} · ${G.mmss(G.segundos(x.texto))} estimados a ${G.PALABRAS_POR_MINUTO} palabras por minuto (plan del paquete: ${x.tiempoPaquete})\n\n${x.texto}\n\nTransición sugerida: ${x.transicion}`;
let quienAnterior = null, parte = 0;
G.PRINCIPAL.forEach(x => {
  if (x.quien !== quienAnterior) { abrirSeccion(`${++parte} · ${x.quien}`); quienAnterior = x.quien; }
  if (!D[x.d]) throw new Error('Falta la diapositiva ' + x.d);
  CLAVE = x.d;
  D[x.d]().addNotes(nota(x));
});

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
  console.log('listo', OUT, '·', G.PRINCIPAL.length, 'diapositivas');
})();
