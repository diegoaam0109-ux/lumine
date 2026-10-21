// Solemne 2 · Control de Gestión (ICMA901, UNAB) · De la estrategia al CMI de Lumine Motors (versión de coautoría, 20-10-2026)
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

// ---------- CMI en red revisado: una sola fuente para el mapa, las rutas y el anexo ----------
// eje: 1 Habilitación formal, 2 Acceso comercial, 3 Conocimiento y escala (presentación anterior); [] = nuevo o recuperado.
const OBJ = {
  A1: { n: 'Biblioteca de calibraciones', ind: 'Calibraciones registradas y controladas ÷ generadas', meta: '100% antes de reutilizar', regla: 'Crítico', resp: 'Ingeniería de Calibración', ini: 'Repositorio versionado con control de acceso', eje: [3] },
  A2: { n: 'Técnicos habilitados', ind: 'Técnicos con validación vigente ÷ asignados', meta: '100% antes de tareas críticas', regla: 'Crítico', resp: 'Responsable Técnico', ini: 'Ruta de habilitación en Lumine Habilita', eje: [3] },
  A3: { n: 'Protocolo de medición', ind: 'Protocolos de prueba aprobados', meta: '1 antes del primer piloto', regla: 'Hito', resp: 'Ingeniería de Calibración', ini: 'Protocolo antes y después con línea base del mismo auto', eje: [3] },
  A4: { n: 'Lumine Habilita', ind: 'Componentes de habilitación documentados ÷ definidos', meta: '100% del paquete mínimo antes de licenciar', regla: 'Crítico', resp: 'Responsable Técnico', ini: 'Paquete mínimo de formación y evaluación', eje: [3] },
  P1: { n: 'Vía legal', ind: 'Vía sectorial aplicable documentada', meta: '1 antes de la actividad comercial', regla: 'Hito', resp: 'Gerente General', ini: 'Plantear al MTT el precedente del gas licuado', eje: [1] },
  P2: { n: 'Par modelo-kit aprobado', ind: 'Pares modelo-kit formalmente aprobados', meta: '1 o más antes de instalar ese par', regla: 'Hito', resp: 'Ingeniería de Calibración', ini: 'Homologar primero los modelos más densos', eje: [1] },
  P3: { n: 'Instalación segura', ind: 'Órdenes con control técnico completo ÷ cerradas', meta: '100% de las órdenes', regla: 'Crítico', resp: 'Responsable Técnico', ini: 'Checklist técnico y acta de liberación', eje: [] },
  P4: { n: 'Medición y posventa', ind: 'Expedientes de medición y entrega completos ÷ exigibles', meta: '100% de los exigibles', regla: 'Crítico', resp: 'Ingeniería de Calibración', ini: 'Expediente único por vehículo', eje: [3] },
  P5: { n: 'Réplica en talleres', ind: 'Paquete de licencia validado', meta: 'Hito; fecha por definir', regla: 'Meta pendiente', resp: 'Gerente General', ini: 'Manual técnico y selección de talleres', eje: [3] },
  P6: { n: 'Alianzas que destraban', ind: 'Convenios vigentes: aseguradora, planta de revisión y financiera', meta: '1 de cada una antes del primer kit', regla: 'Hito', resp: 'Gerente General', ini: 'Convenios del cruce DA del FODA', eje: [1, 2] },
  C1: { n: 'Promesa técnica cumplida', ind: 'Servicios conformes ÷ entregas verificadas', meta: '100% de las entregas', regla: 'Crítico', resp: 'Responsable Técnico', ini: 'Acta de conformidad firmada', eje: [] },
  C2: { n: 'Ahorro acreditado', ind: 'Reportes comparativos completos ÷ exigibles', meta: '100% de los exigibles', regla: 'Crítico', resp: 'Comercial y Postventa', ini: 'Reporte con método, límites y acuse', eje: [3] },
  C3: { n: 'Confianza del cliente', ind: 'Confianza declarada después del servicio; reclamos por servicio', meta: 'Por definir con la primera muestra', regla: 'Meta pendiente', resp: 'Comercial y Postventa', ini: 'Encuesta posservicio y registro de reclamos', eje: [] },
  C4: { n: 'Segmento captado', ind: 'Consultas del segmento convertidas en instalaciones', meta: 'Por definir con la primera muestra', regla: 'Meta pendiente', resp: 'Comercial y Postventa', ini: 'Clasificar consultas por uso y seguir su conversión', eje: [2] },
  F1: { n: 'Rentabilidad sobre el costo de capital', ind: 'Antes de invertir: VAN > 0 y TIR > tasa exigida. Operando: retorno sobre el capital empleado frente a su costo', meta: 'Superar el costo de capital', regla: 'Retorno', resp: 'Gerente General', ini: 'Plan Financiero con tasa sustentada', eje: [] },
  F2: { n: 'Margen por servicio', ind: 'Margen de contribución unitario', meta: 'Por definir en el Plan Financiero', regla: 'Meta pendiente', resp: 'Gerente General', ini: 'Cobertura cambiaria y abastecimiento de largo plazo', eje: [] },
  F3: { n: 'Expansión y licencias', ind: 'Evaluación incremental por alternativa (taller o licencias)', meta: 'Umbral por definir en el Plan Financiero', regla: 'Meta pendiente', resp: 'Gerente General', ini: 'Evaluar cada alternativa antes de abrir', eje: [3] },
};
// tipo: hab = habilitante · ext = condición externa · hip = hipótesis por comprobar
const REL = [
  ['R01', 'A1', 'P2', 'hab', 'Calibraciones versionadas respaldan el expediente del par', 'El expediente usa una calibración aprobada', 1],
  ['R02', 'P1', 'P2', 'ext', 'La vía formal define los requisitos de aprobación del kit', 'Norma o criterio habilitante confirmado', 1],
  ['R03', 'P2', 'P3', 'hab', 'Solo pares aprobados se instalan comercialmente', 'La orden identifica un par aprobado', 1],
  ['R04', 'A2', 'P3', 'hab', 'Personal habilitado sostiene la ejecución segura', 'Asignaciones y checklists validados', 1],
  ['R05', 'P3', 'C1', 'hab', 'El control final verifica la promesa técnica', 'Acta de conformidad', 1],
  ['R06', 'P1', 'P5', 'ext', 'La réplica también exige viabilidad regulatoria', 'Aplicabilidad a terceros verificada', 1],
  ['R07', 'A3', 'P4', 'hab', 'Datos comparables permiten informes defendibles', 'Expedientes con línea base común', 2],
  ['R08', 'P3', 'P4', 'hip', 'Una instalación trazable permite el seguimiento', 'Componentes y línea base identificados', 2],
  ['R09', 'P4', 'C2', 'hab', 'Datos revisados habilitan un reporte confiable', 'Informe con método, límites y acuse', 2],
  ['R10', 'C1', 'C3', 'hip', 'Cumplir la promesa técnica reforzaría la confianza', 'Opinión posservicio y reclamos', 2],
  ['R11', 'C2', 'C3', 'hip', 'Evidencia comprensible del ahorro sumaría confianza', 'Opinión posservicio y reclamos', 2],
  ['R12', 'P6', 'C3', 'hip', 'El respaldo de aseguradoras y plantas suma confianza', 'Confianza con y sin respaldo', 2],
  ['R13', 'C3', 'C4', 'hip', 'Más confianza mejoraría la conversión de consultas', 'Conversión segmentada antes y después', 2],
  ['R14', 'P6', 'C4', 'hip', 'La cuota disponible destrabaría la compra', 'Conversión con y sin financiamiento', 2],
  ['R15', 'C4', 'F2', 'hip', 'Más volumen aporta solo con precio y costo controlados', 'Margen real y contribución total', 3],
  ['R16', 'P3', 'F2', 'hip', 'Menos retrabajo contendría el costo variable', 'Costo por orden y reprocesos', 3],
  ['R17', 'F2', 'F1', 'hip', 'El margen alimenta flujos descontables', 'Conciliación de costos, ventas y flujo', 3],
  ['R18', 'A4', 'P5', 'hip', 'Un método documentado hace replicable el servicio', 'Paquete de formación revisado', 3],
  ['R19', 'P5', 'F3', 'hip', 'El paquete permite evaluar la línea de licencias', 'Modelo de ingresos y costos aprobado', 3],
  ['R20', 'F3', 'F1', 'hip', 'Expandirse crea valor solo con evaluación positiva', 'VAN incremental por alternativa', 3],
];
// nombres cortos solo para el mapa completo (los nodos son angostos)
const CORTO = { A1: 'Biblioteca', P2: 'Par aprobado', C1: 'Promesa cumplida' };
const EJE = { 1: HEX.dk1, 2: HEX.accent1, 3: '0A6F9E' };
const EJE_NOMBRE = { 1: 'Habilitación formal', 2: 'Acceso comercial', 3: 'Conocimiento y escala' };
const LINEA = {
  hab: { color: C.accent1, width: 2 },
  ext: { color: C.text1, width: 3.25 },
  hip: { color: C.accent1, width: 1.5, dashType: 'dash' },
};
// polilínea con flecha en el último tramo; pts = [[x, y], ...]
function ruta(s, pts, tipo) {
  const st = LINEA[tipo];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], ult = i === pts.length - 2;
    s.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: Object.assign({}, st, ult ? { endArrowType: 'triangle' } : {}) });
  }
}
function leyendaLineas(s, x0 = R) {
  const items = [['hab', 'HABILITANTE'], ['ext', 'CONDICIÓN EXTERNA'], ['hip', 'HIPÓTESIS']];
  let x = x0;
  [...items].reverse().forEach(([t, k]) => {
    const w = k.length * (12 * 0.6 + 0.5) / 72 + 0.1;
    x -= w;
    mono(s, k, { x, y: 0.92, w, h: 0.3, fontSize: 12, color: C.text1, valign: 'middle', charSpacing: 0.5 });
    s.addShape(S.line, { x: x - 0.55, y: 1.07, w: 0.42, h: 0, line: Object.assign({}, LINEA[t]) });
    x -= 0.85;
  });
}
// barra superior de color según el eje estratégico de origen (dividida si viene de dos)
function barraEje(s, ejes, x, y, w, h = 0.07) {
  if (!ejes.length) return;
  const bw = w / ejes.length;
  ejes.forEach((e, i) => s.addShape(S.rect, { x: x + i * bw, y, w: bw, h, fill: { color: EJE[e] }, line: { type: 'none' } }));
}
// nodo del mapa: código arriba, nombre abajo
function nodo(s, id, x, y, w, h, o = {}) {
  const ob = OBJ[id], hot = !!o.hot;
  if (hot) { brillo(s, x, y, w, h, 0.4); cajaHot(s, x, y, w, h); } else caja(s, x, y, w, h, { line: { color: o.borde || C.text2, width: 0.75 } });
  barraEje(s, ob.eje, x, y, w);
  const size = o.size || 14;
  if (o.inline) {
    T(s, [{ text: id + '  ', options: { fontFace: F_MONO, fontSize: 12, bold: true, color: C.accent1 } }, { text: o.corto && CORTO[id] || ob.n, options: { bold: hot } }], { x: x + 0.1, y: y + 0.06, w: w - 0.16, h: h - 0.08, fontSize: size, valign: 'middle', lineSpacingMultiple: 0.88 });
    return;
  }
  mono(s, id, { x: x + 0.1, y: y + 0.08, w: 0.8, h: size >= 18 ? 0.3 : 0.2, fontSize: size >= 18 ? 15 : 12, bold: true, color: C.accent1 });
  T(s, ob.n, { x: x + 0.1, y: y + (size >= 18 ? 0.38 : 0.26), w: w - 0.16, h: h - (size >= 18 ? 0.44 : 0.3), fontSize: size, bold: hot, valign: 'top', lineSpacingMultiple: 0.88 });
}
// estado con forma y color: cumple = círculo · alerta = triángulo · no cumple = cuadrado · meta pendiente = cuadrado punteado · sin medir = anillo a trazos
function forma(s, tipo, x, y, d) {
  if (tipo === 'cumple') s.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color: VERDE }, line: { type: 'none' } });
  if (tipo === 'alerta') s.addShape(S.triangle, { x, y, w: d, h: d, fill: { color: AMBAR }, line: { type: 'none' } });
  if (tipo === 'nocumple') s.addShape(S.rect, { x: x + d * 0.08, y: y + d * 0.08, w: d * 0.84, h: d * 0.84, fill: { color: ROJO }, line: { type: 'none' } });
  if (tipo === 'pend') s.addShape(S.rect, { x: x + d * 0.08, y: y + d * 0.08, w: d * 0.84, h: d * 0.84, fill: { color: C.background1, transparency: 100 }, line: { color: GRIS, width: 1.5, dashType: 'sysDot' } });
  if (tipo === 'sin') s.addShape(S.ellipse, { x, y, w: d, h: d, fill: { color: C.background1, transparency: 100 }, line: { color: GRIS, width: 1.75, dashType: 'dash' } });
}
// rótulo de código (chip) para remitir a un objetivo del CMI
function chip(s, id, x, y, o = {}) {
  const w = o.w || (id.length * 0.13 + 0.3), h = o.h || 0.36;
  s.addShape(S.rect, { x, y, w, h, fill: { color: o.fill || C.accent5 }, line: { type: 'none' } });
  barraEje(s, (OBJ[id] || { eje: [] }).eje, x, y, w, 0.05);
  T(s, id, { x, y, w, h, fontFace: F_MONO, fontSize: o.size || 14, bold: true, align: 'center', valign: 'middle', color: C.text1 });
  return w;
}

// Fuente al pie de cada diapositiva. Solo materiales del proyecto, del curso y del paquete de la Solemne.
const PREV = 'presentación «Análisis estratégico» (Control de Gestión, octubre de 2026)';
const CMI = 'CMI en red revisado (propuesta del equipo para la Solemne 2)';
const FUENTES = {
  negocio: `Fuentes: contexto vigente de Lumine Motors; ${PREV}. El ahorro es una estimación de ingeniería, no medida en autos chilenos.`,
  identidad: `Fuente: ${PREV}, misión, visión y valores (texto resumido; versión literal en el anexo).`,
  cliente: `Fuente: ${PREV}, relaciones de valor con los clientes. Entrevistas (n = 3): resultado indicativo, no representativo.`,
  entorno: `Fuentes: ${PREV}, cinco fuerzas (instrumento 02, escala 0 a 5) y escenarios regulatorios; Ley N° 21.793 (14-01-2026), sin reglamento.`,
  interno: `Fuentes: ${PREV}, competencias (instrumento 05) y FODA cruzado; Lumine Habilita, versión de demostración (datos ficticios).`,
  estrategia: `Fuente: ${PREV}, declaración de la estrategia y ejes estratégicos.`,
  ejes: `Fuentes: ${PREV} (ejes y objetivos); CMI actualizado de las Fases 1 y 2; ${CMI}.`,
  clientes: `Fuentes: ${PREV} (atributos que valora el cliente); ${CMI}. Las metas de C3 y C4 se fijan con la primera muestra de clientes.`,
  mapa: `Fuente: ${CMI}: 17 objetivos y 20 relaciones. Las flechas son condiciones o hipótesis por comprobar, no causalidad demostrada.`,
  ruta1: `Fuentes: ${CMI}, relaciones R01 a R06; ${PREV}, FODA cruzado (iniciativas).`,
  ruta2: `Fuente: ${CMI}, relaciones R07 a R14. El ahorro es una estimación de ingeniería, no medida en autos chilenos.`,
  ruta3: `Fuentes: ${CMI}, relaciones R15 a R20; CMI original de Lumine (objetivo destacado por el profesor); módulo 4 del curso. Sin cifras: el Plan Financiero no existe aún.`,
  ficha: `Fuentes: ${CMI}, ficha de C2 y estados del tablero; material del curso «Sistemas de Control de Gestión: Indicadores».`,
  cierre: `Fuentes: ${CMI}, ciclo de decisión; material del curso «Sistemas de Control de Gestión: Indicadores».`,
  indice: 'Las fuentes de cada tema están al pie de su diapositiva.',
  'a-f1': 'Fuentes: CMI original de Lumine; módulo 4 del curso (creación de valor sobre el costo de capital). Sin cifras de Lumine.',
  'a-cmiA': `Fuente: ${CMI}. Responsables según la estructura de la Fase 3; metas propuestas por el equipo.`,
  'a-cmiP': `Fuente: ${CMI}. Responsables según la estructura de la Fase 3; metas propuestas por el equipo.`,
  'a-cmiC': `Fuente: ${CMI}. Responsables según la estructura de la Fase 3; metas propuestas por el equipo.`,
  'a-cmiF': `Fuente: ${CMI}. Sin cifras: el Plan Financiero no existe aún.`,
  'a-rel1': `Fuente: ${CMI}. Relaciones habilitantes, condiciones externas e hipótesis; ninguna es una correlación medida.`,
  'a-rel2': `Fuente: ${CMI}. Relaciones habilitantes, condiciones externas e hipótesis; ninguna es una correlación medida.`,
  'a-cambios': 'Fuentes: Excel «04_CMI_Red_Causal_y_Control» y dossier del CMI corregido (propuesta previa); decisiones del equipo del 20-10-2026.',
  'a-estados': `Fuentes: ${CMI}, hoja de seguimiento; material del curso «Sistemas de Control de Gestión: Indicadores». Umbrales propuestos.`,
  'a-iniciativas': `Fuentes: ${PREV}, FODA cruzado; ${CMI}. Sin presupuesto: es la siguiente etapa del plan.`,
  'a-foda': `Fuente: ${PREV}, FODA por perspectivas del CMI, y las fuentes citadas allí.`,
  'a-cadena': `Fuente: ${PREV}, cadena de valor (instrumento 06).`,
  'a-pest': `Fuente: ${PREV}, instrumentos 02 (cinco fuerzas) y 03 (PEST). Escalas propias, no comparables con las del informe de Integrador II.`,
  'a-identidad': `Fuente: ${PREV}, presentación de la organización.`,
  'a-origen': `Fuentes: contexto vigente de Lumine Motors; ${CMI}.`,
};

let SEC = null, CLAVE = null, NUM = 0, ANEXO_ACTUAL = null, INDICE_ANEXO = null;
const abrirSeccion = t => { pres.addSection({ title: t }); SEC = t; };
function contenido(etiqueta, titulo, acento) {
  const s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: SEC });
  let n;
  if (ANEXO_ACTUAL) {
    n = ANEXO_ACTUAL.codigo; etiqueta = 'ANEXO · ' + etiqueta + (ANEXO_ACTUAL.parte ? ' · ' + ANEXO_ACTUAL.parte.toUpperCase() : '');
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

// =====================================================================
// 1 · PORTADA
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 12 });
  mono(s, [{ text: 'SOLEMNE 2', options: { color: C.accent1 } }, { text: '  ·  DE LA ESTRATEGIA AL CUADRO DE MANDO INTEGRAL', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  s.addText([
    { text: '¿CÓMO SE CONTROLA', options: { breakLine: true, fontSize: 46 } },
    { text: 'una estrategia antes de operar?', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 44 } },
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
// 2 · UN KIT QUE SE SUMA, NO REEMPLAZA · plano del kit
// =====================================================================
D.negocio = () => {
  const s = contenido('CONTEXTO · LA EMPRESA', 'UN KIT QUE SE SUMA,', 'no reemplaza.');
  const iw = 8.7, ih = iw * 740 / 2400;
  s.addImage({ path: A('plano.png'), x: M + 0.1, y: Y0 - 0.05, w: iw, h: ih, altText: 'Plano del kit: motor original adelante, unidad de control, banco de baterías y motor eléctrico en el eje trasero' });
  const ly = Y0 + ih + 0.05, pw = (iw + 0.2) / 4;
  regla(s, ly, M, iw + 0.2);
  [['01', 'MOTOR ORIGINAL', 'Intacto, con su tracción delantera'], ['02', 'UNIDAD DE CONTROL', 'Decide cuándo asistir y corta ante fallas'], ['03', 'BANCO DE BATERÍAS', 'Guarda la energía del frenado'], ['04', 'MOTOR ELÉCTRICO', 'En el eje trasero, con freno regenerativo']].forEach(([n, k, v], i) => {
    const x = M + i * pw;
    tag(s, n, x, ly + 0.16, { off: i === 0, w: 0.5, h: 0.34, size: 14 });
    mono(s, k, { x: x + 0.6, y: ly + 0.16, w: pw - 0.65, h: 0.34, fontSize: 12, color: C.text1, valign: 'middle' });
    T(s, v, { x, y: ly + 0.6, w: pw - 0.15, h: 0.7, fontSize: 16, color: C.text2 });
  });
  const rx = M + iw + 0.6, rw = R - rx;
  [['PREOPERATIVA', 'Sin instalaciones, personal, clientes ni flujo de caja', null], ['SEGMENTO', 'Tracción delantera y alto kilometraje', null], ['PROMESA', 'Hasta 20% menos bencina en ciudad', 'ESTIMACIÓN']].forEach(([k, v, m], i) => {
    const y = Y0 + i * 1.32;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    mono(s, k, { x: rx, y: y + 0.1, w: rw, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, v, { x: rx, y: y + 0.42, w: rw, h: 0.8, fontSize: 17, valign: 'top' });
    if (m) marca(s, 'est', m, R, y + 0.06, { alignRight: true, size: 12, h: 0.32 });
  });
  return s;
};

// =====================================================================
// 3 · NUESTROS VALORES SON REGLAS DE CONTROL
// =====================================================================
D.identidad = () => {
  const s = contenido('LA ORGANIZACIÓN · MISIÓN, VISIÓN Y VALORES', 'NUESTROS VALORES', 'son reglas de control.');
  const lw = 5.0;
  [['MISIÓN', 'Reducir el combustible por kilómetro del auto que el cliente ya tiene, sin reemplazarlo ni intervenir su motor.'], ['VISIÓN 2031', 'El taller de referencia en hibridación de vehículos en uso, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las aseguradoras.']].forEach(([k, v], i) => {
    const y = Y0 + i * 2.15;
    regla(s, y, M, lw, C.accent1);
    mono(s, k, { x: M, y: y + 0.1, w: lw, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, v, { x: M, y: y + 0.45, w: lw, h: 1.6, fontFace: F_SER, italic: true, fontSize: 20, valign: 'top', lineSpacingMultiple: 1.0 });
  });
  const rx = M + lw + 0.6, rw = R - rx, kw = 2.9;
  mono(s, 'VALOR', { x: rx, y: Y0, w: kw, h: 0.3, fontSize: 13 });
  mono(s, 'REGLA DE CONTROL', { x: rx + kw + 0.55, y: Y0, w: rw - kw - 0.55, h: 0.3, fontSize: 13, color: C.accent1 });
  [['Verificabilidad antes que afirmación', 'Un dato sin medir no vale cero'], ['Formalidad como condición de operación', 'Compuertas que no se saltan'], ['Trazabilidad del conocimiento técnico', 'Cada calibración queda registrada'], ['Responsabilidad sobre el ciclo completo', 'El control sigue después de la entrega']].forEach(([v, c], i) => {
    const y = Y0 + 0.4 + i * 0.92;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    T(s, v, { x: rx, y, w: kw, h: 0.92, fontSize: 18, bold: true, valign: 'middle' });
    flecha(s, rx + kw + 0.1, y + 0.46, 0.35, 0);
    T(s, c, { x: rx + kw + 0.55, y, w: rw - kw - 0.55, h: 0.92, fontSize: 18, color: C.text2, valign: 'middle' });
  });
  return s;
};

// =====================================================================
// 4 · EL PRECIO DECIDE SI COMPRA; LA CONFIANZA, SI SE ATREVE
// =====================================================================
D.cliente = () => {
  const s = contenido('CLIENTE · PROPUESTA DE VALOR Y MODELO DE NEGOCIO', 'EL PRECIO DECIDE SI COMPRA;', 'la confianza, si se atreve.');
  marca(s, 'est', 'TENTATIVO · 3 ENTREVISTAS', R, Y0 - 0.02, { alignRight: true, size: 12, h: 0.34 });
  mono(s, 'NECESIDAD CENTRAL', { x: M, y: Y0, w: 5, h: 0.3, fontSize: 13 });
  T(s, '«Evitar pagar cada vez más por usar el auto.»', { x: M, y: Y0 + 0.32, w: CW, h: 0.55, fontFace: F_SER, italic: true, fontSize: 26, color: C.text1, valign: 'middle' });
  const cy = Y0 + 1.05, ch = 1.95, cw = (CW - 0.4) / 2;
  [['DECIDE SI COMPRA', 'PRECIO', 'Una cuota mensual comparable con el ahorro mensual, no un precio de lista.', false], ['DECIDE SI SE ATREVE', 'CONFIANZA', 'Certificación, garantía escrita, un caso exitoso y quién responde ante fallas.', true]].forEach(([k, t, v, hot], i) => {
    const x = M + i * (cw + 0.4);
    if (hot) { brillo(s, x, cy, cw, ch, 0.5); cajaHot(s, x, cy, cw, ch); } else caja(s, x, cy, cw, ch, { line: { color: C.text2, width: 0.75 } });
    mono(s, k, { x: x + 0.3, y: cy + 0.22, w: cw - 0.6, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, t, { x: x + 0.3, y: cy + 0.55, w: cw - 0.6, h: 0.55, fontFace: F_TIT, fontSize: 28, valign: 'middle' });
    T(s, v, { x: x + 0.3, y: cy + 1.15, w: cw - 0.6, h: 0.7, fontSize: 18, color: C.text2, valign: 'top' });
  });
  const my = cy + ch + 0.3;
  regla(s, my, M, CW);
  mono(s, 'MODELO DE NEGOCIO', { x: M, y: my + 0.14, w: 3, h: 0.3, fontSize: 13 });
  T(s, [{ text: 'Taller propio', options: { bold: true } }, { text: '   +   ', options: { color: C.accent1 } }, { text: 'licencias de calibración y procedimiento a otros talleres', options: { color: C.text2 } }], { x: M, y: my + 0.45, w: CW - 2.0, h: 0.45, fontSize: 19, valign: 'middle' });
  marca(s, 'sup', 'POTENCIAL', R, my + 0.5, { alignRight: true, size: 12, h: 0.34 });
  return s;
};

// =====================================================================
// 5 · COMPETIMOS CONTRA NO HACER NADA Y LA VÍA LEGAL DECIDE SI OPERAMOS
// =====================================================================
D.entorno = () => {
  const s = contenido('ANÁLISIS EXTERNO · CINCO FUERZAS Y ESCENARIOS', 'COMPETIMOS CONTRA NO HACER NADA,', 'y la vía legal decide si operamos.');
  const lw = 5.0;
  mono(s, 'CINCO FUERZAS · PONDERACIÓN', { x: M, y: Y0, w: lw, h: 0.3, fontSize: 13 });
  brillo(s, M, Y0 + 0.5, 2.4, 1.1, 0.5);
  numero(s, '55%', { x: M, y: Y0 + 0.35, w: lw, h: 1.3, fontSize: 80, valign: 'middle', color: C.accent1 });
  T(s, [{ text: 'Sustitutos y clientes: ', options: { bold: true } }, { text: 'seguir con el auto cuesta $0.', options: { color: C.text2 } }], { x: M, y: Y0 + 1.7, w: lw, h: 0.8, fontSize: 20, valign: 'top' });
  regla(s, Y0 + 2.6, M, lw);
  T(s, 'La cuota ataca la causa: la falta de liquidez.', { x: M, y: Y0 + 2.7, w: lw, h: 0.7, fontSize: 18, color: C.text2, valign: 'top' });
  const rx = M + lw + 0.6, rw = R - rx;
  mono(s, 'ESCENARIOS REGULATORIOS', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 13 });
  const esc = [['E1', 'Vía legal amplia', 'protege al primero que homologa'], ['E2', 'Vía acotada', 'solo parque sin ABS, airbag ni estabilidad'], ['E3', 'Vía alternativa', 'alteración de características'], ['E4', 'Sin vía legal', 'el negocio no opera']];
  const rh = 0.66, y0 = Y0 + 0.4;
  esc.forEach(([k, t, v], i) => {
    const y = y0 + i * rh, hoy = i >= 2;
    regla(s, y, rx + 0.35, rw - 0.35, i ? C.accent5 : C.accent1);
    tag(s, k, rx + 0.35, y + (rh - 0.36) / 2, { off: !hoy, w: 0.52, h: 0.36, size: 13 });
    T(s, t, { x: rx + 1.02, y, w: 2.25, h: rh, fontSize: 18, bold: true, valign: 'middle' });
    T(s, v, { x: rx + 3.3, y, w: rw - 3.3, h: rh, fontSize: 16, color: C.text2, valign: 'middle' });
  });
  // la rama vigente (E3 o E4), marcada por forma
  linea(s, rx + 0.12, y0 + 2 * rh + 0.08, 0, 2 * rh - 0.16, C.accent1, 3);
  mono(s, 'HOY', { x: rx - 0.55, y: y0 + 2 * rh, w: 0.6, h: 2 * rh, fontSize: 12, color: C.accent1, valign: 'middle' });
  const by = y0 + 4 * rh + 0.25;
  regla(s, by, rx, rw);
  T(s, 'Ley N° 21.793 publicada, sin reglamento', { x: rx, y: by + 0.06, w: rw - 2.4, h: 0.55, fontSize: 18, valign: 'middle' });
  marca(s, 'pen', 'RIESGO EXTERNO', R, by + 0.14, { alignRight: true, size: 12, h: 0.36 });
  return s;
};

// =====================================================================
// 6 · FORTALEZA DE DISEÑO, NO DE EJECUCIÓN · biblioteca, prueba Habilita y FODA cruzado
// =====================================================================
D.interno = () => {
  const s = contenido('ANÁLISIS INTERNO · COMPETENCIAS Y FODA CRUZADO', 'FORTALEZA DE DISEÑO, NO DE EJECUCIÓN:', 'el FODA dice qué demostrar.');
  const lw = 4.7, ch = 2.35;
  brillo(s, M, Y0, lw, ch, 0.5);
  cajaHot(s, M, Y0, lw, ch);
  mono(s, 'ÚNICA FUENTE DE EXCLUSIVIDAD', { x: M + 0.28, y: Y0 + 0.2, w: lw - 0.5, h: 0.3, fontSize: 13, color: C.accent1 });
  T(s, 'Biblioteca de calibraciones', { x: M + 0.28, y: Y0 + 0.55, w: lw - 0.5, h: 0.5, fontSize: 24, bold: true, valign: 'middle' });
  T(s, 'Hoy vacía; sostenible solo si se protege como secreto empresarial.', { x: M + 0.28, y: Y0 + 1.1, w: lw - 0.5, h: 0.7, fontSize: 16, color: C.text2 });
  marca(s, 'est', 'POTENCIAL, NO EFECTIVA', M + 0.28, Y0 + ch - 0.52, { size: 12, h: 0.34 });
  // prueba concreta de capacidad: Lumine Habilita
  const qy = Y0 + ch + 0.25, q = YF - qy - 0.02;
  s.addImage({ path: A('qr-habilita.png'), x: M, y: qy, w: q, h: q, altText: 'Código QR a la demostración de Lumine Habilita' });
  T(s, [{ text: 'Lumine Habilita', options: { bold: true, breakLine: true } }, { text: 'formación de técnicos por competencias', options: { color: C.text2 } }], { x: M + q + 0.2, y: qy, w: lw - q - 0.2, h: q - 0.4, fontSize: 16, valign: 'top' });
  marca(s, 'sup', 'DEMO · DATOS FICTICIOS', M + q + 0.2, qy + q - 0.36, { size: 11, h: 0.32 });
  const rx = M + lw + 0.55, rw = R - rx;
  mono(s, 'FODA CRUZADO: QUÉ DEMOSTRAR', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 13 });
  const cr = [['FO', 'Homologar primero los modelos más densos del segmento', ['P2']], ['DO', 'Plantear al MTT el precedente del gas licuado', ['P1']], ['DA', 'Convenios con aseguradora, planta de revisión y financiera antes del primer kit', ['P6']], ['DA', 'Cubrir la exposición al dólar de un kit importado', ['F2']]];
  const rh = 0.95;
  cr.forEach(([k, t, ids], i) => {
    const y = Y0 + 0.4 + i * rh;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    tag(s, k, rx, y + (rh - 0.36) / 2, { off: true, w: 0.55, h: 0.36, size: 13 });
    T(s, t, { x: rx + 0.75, y, w: rw - 2.0, h: rh, fontSize: 18, valign: 'middle' });
    chip(s, ids[0], R - 0.75, y + (rh - 0.36) / 2, { w: 0.75 });
    if (i === 3) mono(s, 'INICIATIVA', { x: R - 2.0, y: y + rh - 0.32, w: 1.2, h: 0.26, fontSize: 11, color: C.text2, align: 'right' });
  });
  return s;
};

// =====================================================================
// 7 · DIFERENCIACIÓN ENFOCADA · declaración, renuncias y tres ejes
// =====================================================================
D.estrategia = () => {
  const s = contenido('FORMULACIÓN · ESTRATEGIA, RENUNCIAS Y EJES', 'DIFERENCIACIÓN ENFOCADA:', 'competir con evidencia, no con precio.');
  linea(s, M, Y0 + 0.05, 0.06, 1.05, C.accent1, 3);
  T(s, '«Un servicio certificado que reduce el combustible del auto que el cliente ya tiene, para conductores de alto kilometraje, sostenido por un conocimiento de calibración que un competidor no puede comprar.»',
    { x: M + 0.3, y: Y0, w: CW - 0.3, h: 1.15, fontFace: F_SER, italic: true, fontSize: 21, valign: 'middle', lineSpacingMultiple: 1.0 });
  const ry = Y0 + 1.4;
  mono(s, 'RENUNCIAS', { x: M, y: ry, w: 2, h: 0.36, fontSize: 13, valign: 'middle' });
  let x = M + 1.75;
  ['NO COMPETIR POR PRECIO', 'NO ATENDER BAJO KILOMETRAJE', 'NO OFRECER INMEDIATEZ'].forEach(t => { x += marca(s, 'no', t, x, ry, { size: 12, h: 0.36 }) + 0.2; });
  const ey = ry + 0.7, eh = YF - ey, ew = (CW - 0.5) / 3;
  [[1, 'vía legal y terceros'], [2, 'capacidad de pago del cliente'], [3, 'ahorro todavía no medido']].forEach(([e, a], i) => {
    const xx = M + i * (ew + 0.25);
    caja(s, xx, ey, ew, eh, { line: { color: C.accent5, width: 0.75 } });
    barraEje(s, [e], xx, ey, ew, 0.1);
    mono(s, 'EJE ' + e, { x: xx + 0.25, y: ey + 0.25, w: ew - 0.5, h: 0.3, fontSize: 13, color: C.text2 });
    T(s, EJE_NOMBRE[e], { x: xx + 0.25, y: ey + 0.58, w: ew - 0.5, h: 0.5, fontSize: 22, bold: true, valign: 'middle' });
    T(s, [{ text: 'Ataca: ', options: { color: C.text2 } }, { text: a }], { x: xx + 0.25, y: ey + 1.15, w: ew - 0.5, h: eh - 1.3, fontSize: 17, valign: 'top' });
  });
  return s;
};

// =====================================================================
// 8 · LOS OCHO OBJETIVOS DE LA ESTRATEGIA LLEGAN AL CMI
// =====================================================================
D.ejes = () => {
  const s = contenido('DE LA ESTRATEGIA AL CMI · TRAZABILIDAD', 'LOS OCHO OBJETIVOS DE LA ESTRATEGIA', 'llegan al CMI.');
  const ew = (CW - 0.5) / 3, ey = Y0, eh = 3.05;
  const ejes = [[1, [['01', 'Autorización del taller', ['P1']], ['02', 'Homologación progresiva', ['P2']], ['03', 'Aseguradoras y plantas', ['P6']]]],
    [2, [['04', 'Consolidar el segmento', ['C4']], ['05', 'Financiamiento al cliente', ['P6']]]],
    [3, [['06', 'Demostrar el ahorro real', ['A3', 'P4', 'C2']], ['07', 'Retener el conocimiento', ['A1', 'A2', 'A4']], ['08', 'Ampliar capacidad', ['P5', 'F3']]]]];
  ejes.forEach(([e, objs], i) => {
    const x = M + i * (ew + 0.25);
    caja(s, x, ey, ew, eh, { line: { color: C.accent5, width: 0.75 } });
    barraEje(s, [e], x, ey, ew, 0.1);
    T(s, [{ text: 'EJE ' + e + '  ', options: { fontFace: F_MONO, fontSize: 12, color: C.text2 } }, { text: EJE_NOMBRE[e], options: { bold: true } }], { x: x + 0.2, y: ey + 0.18, w: ew - 0.4, h: 0.42, fontSize: 18, valign: 'middle' });
    objs.forEach(([n, t, ids], j) => {
      const y = ey + 0.72 + j * 0.76;
      regla(s, y, x + 0.2, ew - 0.4);
      mono(s, n, { x: x + 0.2, y: y + 0.08, w: 0.4, h: 0.3, fontSize: 12, color: C.accent1 });
      T(s, t, { x: x + 0.62, y: y + 0.04, w: ew - 0.84, h: 0.38, fontSize: 15, valign: 'top' });
      let cx = x + 0.62;
      ids.forEach(id => { cx += chip(s, id, cx, y + 0.42, { h: 0.28, size: 12, w: 0.5 }) + 0.08; });
    });
  });
  const by = ey + eh + 0.25;
  regla(s, by, M, CW, C.accent1);
  mono(s, 'NUEVOS POR LA RETROALIMENTACIÓN', { x: M, y: by + 0.14, w: 4.2, h: 0.3, fontSize: 13, color: C.accent1 });
  let cx = M;
  ['C1', 'C3', 'P3', 'F2', 'F1'].forEach(id => { cx += chip(s, id, cx, by + 0.52, { w: 0.62 }) + 0.12; });
  T(s, 'F1 se recupera del primer CMI', { x: cx + 0.1, y: by + 0.5, w: 3.4, h: 0.4, fontSize: 15, color: C.text2, valign: 'middle' });
  marca(s, 'pen', 'BRECHA CAMBIARIA: INICIATIVA EN F2', R, by + 0.5, { alignRight: true, size: 12, h: 0.38 });
  return s;
};

// =====================================================================
// 9 · LA PERSPECTIVA CLIENTES MIDE LO QUE EL CLIENTE COMPRA
// =====================================================================
D.clientes = () => {
  const s = contenido('CMI · PERSPECTIVA CLIENTES', 'LA PERSPECTIVA CLIENTES', 'mide lo que el cliente compra.');
  const c0 = M + 1.35, c1 = c0 + 3.25, c2 = c1 + 3.55, wq = 3.05, wo = 3.35, wi = R - c2;
  mono(s, 'EL CLIENTE QUIERE', { x: c0, y: Y0, w: wq, h: 0.3, fontSize: 13 });
  mono(s, 'OBJETIVO', { x: c1, y: Y0, w: wo, h: 0.3, fontSize: 13, color: C.accent1 });
  mono(s, 'INDICADOR', { x: c2, y: Y0, w: wi, h: 0.3, fontSize: 13 });
  const filas = [['C1', 'Que funcione sin tocar el motor'], ['C2', 'Saber cuánto ahorra'], ['C3', 'Atreverse a comprar'], ['C4', 'Comprar']];
  const rh = 0.76, y0 = Y0 + 0.4;
  filas.forEach(([id, q], i) => {
    const y = y0 + i * rh, ob = OBJ[id];
    regla(s, y, c0, R - c0, i ? C.accent5 : C.accent1);
    T(s, q, { x: c0, y, w: wq, h: rh, fontFace: F_SER, italic: true, fontSize: 20, valign: 'middle' });
    chip(s, id, c1, y + (rh - 0.36) / 2, { w: 0.62 });
    T(s, ob.n, { x: c1 + 0.75, y, w: wo - 0.8, h: rh, fontSize: 18, bold: true, valign: 'middle' });
    T(s, ob.ind, { x: c2, y, w: wi - (ob.regla === 'Meta pendiente' ? 0.45 : 0), h: rh, fontSize: 16, color: C.text2, valign: 'middle' });
    if (ob.regla === 'Meta pendiente') forma(s, 'pend', R - 0.32, y + (rh - 0.3) / 2, 0.3);
  });
  regla(s, y0 + 4 * rh, c0, R - c0);
  // agrupación por forma: propuesta de valor (C1, C2) y resultado (C3, C4)
  [['PROPUESTA', 'DE VALOR', 0], ['RESULTADO', '', 2]].forEach(([a, b, k]) => {
    const y = y0 + k * rh;
    linea(s, M + 1.15, y + 0.08, 0, 2 * rh - 0.16, k ? C.text1 : C.accent1, 3);
    T(s, [{ text: a, options: { breakLine: !!b } }, { text: b }], { x: M, y, w: 1.05, h: 2 * rh, fontFace: F_MONO, fontSize: 12, color: k ? C.text1 : C.accent1, valign: 'middle', align: 'right' });
  });
  const by = y0 + 4 * rh + 0.22;
  T(s, [{ text: 'Las alianzas pasan a procesos (P6): ', options: { bold: true } }, { text: 'son el medio, no el valor.', options: { color: C.text2 } }], { x: c0, y: by, w: R - c0 - 2.1, h: 0.5, fontSize: 19, valign: 'middle' });
  forma(s, 'pend', R - 1.95, by + 0.12, 0.26);
  mono(s, 'META PENDIENTE', { x: R - 1.6, y: by + 0.06, w: 1.6, h: 0.38, fontSize: 12, color: GRIS, valign: 'middle' });
  return s;
};

// =====================================================================
// 10 · CADA OBJETIVO EMPUJA A OTRO · mapa estratégico en red, editable
// =====================================================================
const MAPA = (() => {
  const NW = 1.5, X = i => 1.95 + i * (NW + 0.356);
  const nh = 0.62, Yr = { F: 2.55, Cu: 3.46, Cl: 4.37, P: 5.28, A: 6.19 };
  const pos = {
    P5: [X(0), Yr.P], P1: [X(1), Yr.P], P2: [X(2), Yr.P], P3: [X(3), Yr.P], P4: [X(4), Yr.P], P6: [X(5), Yr.P],
    A4: [X(0), Yr.A], A1: [X(2), Yr.A], A2: [X(3), Yr.A], A3: [X(4), Yr.A],
    C1: [7.85, Yr.Cl], C2: [9.6, Yr.Cl], C3: [8.75, Yr.Cu], C4: [10.6, Yr.Cu],
    F3: [X(0), Yr.F], F1: [5.5, Yr.F], F2: [10.4, Yr.F],
  };
  return { NW, X, nh, Yr, pos, w: id => id === 'F1' ? 2.4 : NW };
})();
D.mapa = () => {
  const s = contenido('CMI · MAPA ESTRATÉGICO EN RED', 'CADA OBJETIVO EMPUJA A OTRO:', 'tres rutas lo prueban.');
  leyendaLineas(s);
  const { nh, Yr, pos } = MAPA, W = MAPA.w;
  [['FINANCIERA', Yr.F, nh, ''], ['CLIENTES', Yr.Cu, 2 * nh + 0.29, ''], ['PROCESOS', Yr.P, nh, ''], ['APRENDIZAJE', Yr.A, nh, '']].forEach(([t, y, h]) => {
    linea(s, M, y, 0, h, C.accent1, 2);
    mono(s, t, { x: M + 0.12, y, w: 1.3, h, fontSize: 12, color: C.text1, valign: 'middle', charSpacing: 0.5 });
  });
  serif(s, 'resultado', { x: M + 0.12, y: Yr.Cu + 0.36, w: 1.3, h: 0.26, fontSize: 13, color: C.text2 });
  serif(s, 'propuesta de valor', { x: M + 0.12, y: Yr.Cl + 0.36, w: 1.3, h: 0.26, fontSize: 13, color: C.text2 });
  // relaciones (antes que los nodos, para que las flechas queden debajo)
  const L = id => pos[id][0], Tp = id => pos[id][1], B = id => pos[id][1] + nh, Mx = id => pos[id][0] + W(id) / 2, My = id => pos[id][1] + nh / 2, Rt = id => pos[id][0] + W(id);
  const v = (x, a, b, t) => ruta(s, [[x, a], [x, b]], t);
  v(Mx('A1'), Tp('A1'), B('P2'), 'hab');           // R01
  ruta(s, [[Rt('P1'), My('P1')], [L('P2'), My('P2')]], 'ext'); // R02
  ruta(s, [[Rt('P2'), My('P2')], [L('P3'), My('P3')]], 'hab'); // R03
  v(Mx('A2'), Tp('A2'), B('P3'), 'hab');           // R04
  v(8.5, Tp('P3'), B('C1'), 'hab');                // R05
  ruta(s, [[L('P1'), My('P1')], [Rt('P5'), My('P5')]], 'ext'); // R06
  v(Mx('A3'), Tp('A3'), B('P4'), 'hab');           // R07
  ruta(s, [[Rt('P3'), My('P3')], [L('P4'), My('P4')]], 'hip'); // R08
  v(10.2, Tp('P4'), B('C2'), 'hab');               // R09
  v(9.05, Tp('C1'), B('C3'), 'hip');               // R10
  v(9.9, Tp('C2'), B('C3'), 'hip');                // R11
  const yg2 = (B('C3') + Tp('C1')) / 2;
  ruta(s, [[11.45, Tp('P6')], [11.45, yg2], [10.1, yg2], [10.1, B('C3')]], 'hip'); // R12
  ruta(s, [[Rt('C3'), My('C3')], [L('C4'), My('C4')]], 'hip'); // R13
  v(11.85, Tp('P6'), B('C4'), 'hip');              // R14
  v(11.3, Tp('C4'), B('F2'), 'hip');               // R15
  const yg1 = (B('F1') + Tp('C3')) / 2;
  ruta(s, [[7.62, Tp('P3')], [7.62, yg1], [10.7, yg1], [10.7, B('F2')]], 'hip'); // R16
  ruta(s, [[L('F2'), My('F2')], [Rt('F1'), My('F1')]], 'hip'); // R17
  v(Mx('A4'), Tp('A4'), B('P5'), 'hip');           // R18
  v(2.7, Tp('P5'), B('F3'), 'hip');                // R19
  ruta(s, [[Rt('F3'), My('F3')], [L('F1'), My('F1')]], 'hip'); // R20
  Object.keys(pos).forEach(id => nodo(s, id, pos[id][0], pos[id][1], W(id), nh, { hot: id === 'F1', inline: true, corto: true }));
  // ventaja sostenible potencial: A1
  serif(s, 'ventaja sostenible (potencial)', { x: MAPA.X(1) - 0.1, y: Yr.A, w: 1.45, h: nh, fontSize: 14, align: 'right', valign: 'middle' });
  flecha(s, MAPA.X(1) + 1.38, Yr.A + nh / 2, MAPA.X(2) - MAPA.X(1) - 1.43, 0, C.accent1, 1);
  // leyenda de ejes en el hueco bajo P6
  const lx = MAPA.X(5);
  [[1, ''], [2, ''], [3, '']].forEach(([e, k], i) => {
    s.addShape(S.rect, { x: lx, y: Yr.A + 0.07 + i * 0.19, w: 0.22, h: 0.07, fill: { color: EJE[e] }, line: { type: 'none' } });
    T(s, 'eje ' + e, { x: lx + 0.3, y: Yr.A + i * 0.19, w: 1.2, h: 0.2, fontSize: 11, color: C.text2, valign: 'middle' });
  });
  return s;
};

// rutas ampliadas: nodos grandes con el mecanismo escrito sobre cada flecha
function nodoG(s, id, x, y, w = 2.35, h = 0.95, o = {}) { nodo(s, id, x, y, w, h, Object.assign({ size: 18 }, o)); }
const rot = (s, t, x, y, w, o = {}) => serif(s, t, Object.assign({ x, y, w, h: 0.32, fontSize: 16, align: 'center', valign: 'middle' }, o));

// =====================================================================
// 11 · RUTA 1 · HABILITACIÓN: sin vía legal ni par aprobado no se instala
// =====================================================================
D.ruta1 = () => {
  const s = contenido('RUTA 1 · HABILITACIÓN', 'SIN VÍA LEGAL NI PAR APROBADO', 'no se instala.');
  leyendaLineas(s);
  const w = 2.35, h = 0.95, g = 0.62, y1 = Y0 + 0.55, y2 = Y0 + 2.25;
  const x = i => M + 0.3 + i * (w + g);
  ['P1', 'P2', 'P3', 'C1'].forEach((id, i) => nodoG(s, id, x(i), y1, w, h, { hot: id === 'C1' }));
  [['ext', 'define requisitos'], ['hab', 'solo pares aprobados'], ['hab', 'verifica la promesa']].forEach(([t, k], i) => {
    ruta(s, [[x(i) + w, y1 + h / 2], [x(i + 1), y1 + h / 2]], t);
  });
  rot(s, 'define requisitos', x(0) + w - 0.6, y1 - 0.4, g + 1.2);
  rot(s, 'solo pares aprobados', x(1) + w - 0.6, y1 - 0.4, g + 1.2);
  rot(s, 'verifica la promesa', x(2) + w - 0.6, y1 - 0.4, g + 1.2);
  nodoG(s, 'P5', x(0), y2, w, h); nodoG(s, 'A1', x(1), y2, w, h); nodoG(s, 'A2', x(2), y2, w, h);
  ruta(s, [[x(0) + w / 2, y1 + h], [x(0) + w / 2, y2]], 'ext');
  ruta(s, [[x(1) + w / 2, y2], [x(1) + w / 2, y1 + h]], 'hab');
  ruta(s, [[x(2) + w / 2, y2], [x(2) + w / 2, y1 + h]], 'hab');
  rot(s, 'también exige vía legal', x(0) + w / 2 + 0.1, y1 + h + 0.18, 2.2, { align: 'left' });
  rot(s, 'respalda el expediente', x(1) + w / 2 + 0.1, y1 + h + 0.18, 2.2, { align: 'left' });
  rot(s, 'ejecución segura', x(2) + w / 2 + 0.1, y1 + h + 0.18, 2.2, { align: 'left' });
  const by = y2 + h + 0.22;
  regla(s, by, M, CW, C.accent1);
  mono(s, 'INICIATIVAS', { x: M, y: by + 0.14, w: 2, h: 0.36, fontSize: 13, color: C.accent1, valign: 'middle' });
  T(s, [{ text: 'P1 ', options: { fontFace: F_MONO, color: C.accent1 } }, { text: 'Precedente del gas licuado ante el MTT', options: { breakLine: true } }, { text: 'P2 ', options: { fontFace: F_MONO, color: C.accent1 } }, { text: 'Homologar primero los modelos más densos del segmento' }],
    { x: M + 1.9, y: by + 0.08, w: CW - 1.9, h: 0.68, fontSize: 17, valign: 'top' });
  return s;
};

// =====================================================================
// 12 · RUTA 2 · EVIDENCIA: el ahorro se acredita, no se promete
// =====================================================================
D.ruta2 = () => {
  const s = contenido('RUTA 2 · EVIDENCIA', 'EL AHORRO SE ACREDITA,', 'no se promete.');
  leyendaLineas(s);
  const w = 2.35, h = 0.95, g = 0.62, y1 = Y0 + 0.55, y2 = Y0 + 2.25;
  const x = i => M + 0.3 + i * (w + g);
  ['P4', 'C2', 'C3', 'C4'].forEach((id, i) => nodoG(s, id, x(i), y1, w, h, { hot: id === 'C2' }));
  [['hab', 'reporte confiable'], ['hip', 'evidencia'], ['hip', 'conversión']].forEach(([t, k], i) => {
    ruta(s, [[x(i) + w, y1 + h / 2], [x(i + 1), y1 + h / 2]], t);
    rot(s, k, x(i) + w - 0.6, y1 - 0.4, g + 1.2);
  });
  nodoG(s, 'A3', x(0), y2, w, h); nodoG(s, 'C1', x(1), y2, w, h);
  const p6x = x(2) + w / 2 + 0.2;
  nodoG(s, 'P6', p6x, y2, w, h);
  ruta(s, [[x(0) + w / 2, y2], [x(0) + w / 2, y1 + h]], 'hab');
  rot(s, 'datos comparables', x(0) + w / 2 + 0.1, y1 + h + 0.18, 2.2, { align: 'left' });
  ruta(s, [[x(1) + w, y2 + 0.15], [x(2) + 0.5, y1 + h]], 'hip');
  rot(s, 'promesa cumplida', x(1) + 0.6, y1 + h + 0.18, 1.7, { align: 'right' });
  ruta(s, [[p6x + 0.45, y2], [p6x + 0.45, y1 + h]], 'hip');
  ruta(s, [[p6x + w - 0.45, y2], [p6x + w - 0.45, y1 + h]], 'hip');
  rot(s, 'respaldo', p6x + 0.5, y1 + h + 0.18, 1.0, { align: 'left' });
  rot(s, 'cuota', p6x + w - 0.4, y1 + h + 0.18, 1.0, { align: 'left' });
  const by = y2 + h + 0.35;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'Reportes entregados no son litros ahorrados: ', options: { bold: true } }, { text: 'el ahorro se mide aparte, con línea base del mismo auto.', options: { color: C.text2 } }],
    { x: M, y: by + 0.1, w: CW - 3.0, h: 0.62, fontSize: 18, valign: 'middle' });
  marca(s, 'est', 'HASTA 20%: ESTIMACIÓN', R, by + 0.2, { alignRight: true, size: 12, h: 0.36 });
  return s;
};

// =====================================================================
// 13 · RUTA 3 · VALOR ECONÓMICO: la rentabilidad sobre el capital es la meta final
// =====================================================================
D.ruta3 = () => {
  const s = contenido('RUTA 3 · VALOR ECONÓMICO', 'LA RENTABILIDAD SOBRE EL CAPITAL', 'es la meta final; hoy no tiene cifra.');
  leyendaLineas(s);
  const w = 1.95, h = 1.0, cx = 7.95, cw = R - cx, gx = 2.7;
  const yC4 = Y0 + 0.3, yP3 = Y0 + 1.5, yF2 = Y0 + 0.9;
  nodoG(s, 'C4', M, yC4, w, h); nodoG(s, 'P3', M, yP3, w, h); nodoG(s, 'F2', M + gx, yF2, w, h);
  ruta(s, [[M + w, yC4 + h / 2], [M + gx, yF2 + 0.28]], 'hip');
  ruta(s, [[M + w, yP3 + h / 2], [M + gx, yF2 + h - 0.28]], 'hip');
  rot(s, 'volumen con margen', M, yC4 - 0.33, 3.0, { align: 'left' });
  rot(s, 'menos retrabajo', M, yP3 + h + 0.02, 3.0, { align: 'left' });
  const y3 = Y0 + 3.05;
  nodoG(s, 'A4', M, y3, w, h); nodoG(s, 'P5', M + gx, y3, w, h); nodoG(s, 'F3', M + 2 * gx, y3, w, h);
  ruta(s, [[M + w, y3 + h / 2], [M + gx, y3 + h / 2]], 'hip');
  ruta(s, [[M + gx + w, y3 + h / 2], [M + 2 * gx, y3 + h / 2]], 'hip');
  rot(s, 'método', M + w, y3 + h / 2 - 0.36, gx - w, { fontSize: 14 });
  rot(s, 'licencias', M + gx + w, y3 + h / 2 - 0.36, gx - w, { fontSize: 14 });
  ruta(s, [[M + gx + w, yF2 + h / 2], [cx, yF2 + h / 2]], 'hip');
  rot(s, 'flujos', M + gx + w, yF2 + h / 2 - 0.36, cx - M - gx - w);
  ruta(s, [[M + 2 * gx + w, y3 + h / 2], [cx, y3 + h / 2]], 'hip');
  // F1: protagonista, con su indicador en dos etapas
  const cy = Y0, ch = YF - Y0 - 0.06;
  brillo(s, cx, cy, cw, ch, 0.6);
  cajaHot(s, cx, cy, cw, ch);
  mono(s, 'F1 · RENTABILIDAD POR SOBRE EL COSTO DE CAPITAL', { x: cx + 0.28, y: cy + 0.2, w: cw - 0.5, h: 0.5, fontSize: 13, color: C.accent1 });
  [['1', 'ANTES DE INVERTIR', 'VAN > 0 y TIR > tasa exigida'], ['2', 'OPERANDO, CADA PERÍODO', 'Retorno sobre el capital empleado frente a su costo']].forEach(([n, k, t], i) => {
    const y = cy + 0.85 + i * 1.25;
    regla(s, y, cx + 0.28, cw - 0.56);
    tag(s, n, cx + 0.28, y + 0.14, { w: 0.42, h: 0.36, size: 15, off: i === 1 });
    mono(s, k, { x: cx + 0.82, y: y + 0.14, w: cw - 1.1, h: 0.36, fontSize: 13, color: C.text2, valign: 'middle' });
    T(s, t, { x: cx + 0.28, y: y + 0.55, w: cw - 0.56, h: 0.65, fontSize: 19, bold: true, valign: 'top', lineSpacingMultiple: 0.95 });
  });
  marca(s, 'pen', 'SIN CIFRA · FALTA EL PLAN FINANCIERO', cx + 0.28, cy + ch - 0.55, { size: 11, h: 0.36, w: cw - 0.56 });
  return s;
};

// =====================================================================
// 14 · UN INDICADOR VALE POR SU FICHA; SIN MEDIR NO ES NO CUMPLIR
// =====================================================================
D.ficha = () => {
  const s = contenido('CMI · FICHA DEL INDICADOR Y ESTADOS', 'UN INDICADOR VALE POR SU FICHA;', 'sin medir no es no cumplir.');
  const lw = 7.3;
  T(s, [{ text: 'FICHA · ', options: { color: C.text2 } }, { text: 'C2 AHORRO ACREDITADO' }], { x: M, y: Y0, w: lw, h: 0.3, fontFace: F_MONO, fontSize: 13, color: C.accent1 });
  const filas = [['FÓRMULA', 'Reportes completos ÷ reportes exigibles'], ['FUENTE', 'Expediente de medición y acta de entrega'], ['META PROPUESTA', '100% de los exigibles'], ['RESPONSABLE', 'Comercial y Postventa'], ['SI HAY BRECHA', 'Completar la prueba o transparentar por qué no se pudo']];
  const rh = 0.74, y0 = Y0 + 0.4;
  filas.forEach(([k, v], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, lw, i ? C.accent5 : C.accent1);
    mono(s, k, { x: M, y, w: 2.1, h: rh, fontSize: 13, valign: 'middle' });
    T(s, v, { x: M + 2.15, y, w: lw - 2.15, h: rh, fontSize: 18, bold: k === 'RESPONSABLE' || k === 'SI HAY BRECHA', valign: 'middle' });
  });
  regla(s, y0 + 5 * rh, M, lw);
  const rx = M + lw + 0.55, rw = R - rx;
  mono(s, 'ESTADOS', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 13, color: C.accent1 });
  const st = [['cumple', 'CUMPLE', VERDE], ['alerta', 'ALERTA', AMBAR], ['nocumple', 'NO CUMPLE', ROJO], ['pend', 'META PENDIENTE', GRIS], ['sin', 'SIN MEDIR', C.text1]];
  const sh = 0.6;
  st.forEach(([t, k, color], i) => {
    const y = y0 + i * sh;
    forma(s, t, rx, y + 0.13, 0.34);
    mono(s, k, { x: rx + 0.55, y, w: rw - 0.55, h: sh, fontSize: 16, bold: true, color, valign: 'middle' });
  });
  const hy = y0 + 5 * sh + 0.18, hh = YF - hy;
  cajaHot(s, rx, hy, rw, hh);
  T(s, [{ text: 'Hoy todo el tablero: ', options: { color: C.text2, breakLine: true } }, { text: 'sin medir, no en rojo.', options: { bold: true } }], { x: rx + 0.22, y: hy, w: rw - 0.4, h: hh, fontSize: 18, valign: 'middle' });
  return s;
};

// =====================================================================
// 15 · EL CMI DECIDE CUÁNDO AVANZAR, CORREGIR O DETENERSE
// =====================================================================
D.cierre = () => {
  const s = contenido('CONTROL · CICLO DE DECISIÓN Y CONCLUSIÓN', 'EL CMI DECIDE CUÁNDO AVANZAR,', 'corregir o detenerse.');
  const pasos = ['OBSERVAR', 'COMPARAR', 'EXPLICAR', 'DECIDIR', 'VOLVER A MEDIR'];
  const g = 0.32, pw = (CW - 4 * g) / 5, py = Y0, ph = 0.8;
  pasos.forEach((k, i) => {
    const x = M + i * (pw + g), hot = i === 3;
    if (hot) cajaHot(s, x, py, pw, ph); else caja(s, x, py, pw, ph, { line: { color: C.text2, width: 0.75 } });
    T(s, [{ text: String(i + 1) + '  ', options: { fontFace: F_MONO, color: C.accent1, fontSize: 14 } }, { text: k }], { x: x + 0.15, y: py, w: pw - 0.25, h: ph, fontSize: 17, bold: true, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    if (i < 4) flecha(s, x + pw + 0.04, py + ph / 2, g - 0.08, 0);
  });
  const ly = py + ph + 0.22, x1 = M + pw / 2, x5 = M + 4 * (pw + g) + pw / 2;
  linea(s, x5, py + ph, 0, ly - py - ph, C.accent1, 1.5);
  linea(s, x1, ly, x5 - x1, 0, C.accent1, 1.5);
  flecha(s, x1, ly, 0, py + ph - ly, C.accent1, 1.5);
  const ry = ly + 0.3, rh = 0.62;
  mono(s, 'REGLAS DE DECISIÓN', { x: M, y: ry, w: 4, h: 0.3, fontSize: 13, color: C.accent1 });
  [['una orden no tiene verificación', 'no se entrega'], ['una estimación no tiene respaldo', 'se corrige la información'], ['no hay vía legal', 'se detiene lo que depende de ella']].forEach(([a, b], i) => {
    const y = ry + 0.36 + i * rh;
    regla(s, y, M, CW, i ? C.accent5 : C.accent1);
    T(s, [{ text: 'Si ', options: { color: C.text2 } }, { text: a, options: { bold: true } }], { x: M, y, w: 5.6, h: rh, fontSize: 19, valign: 'middle' });
    flecha(s, M + 5.7, y + rh / 2, 0.5, 0);
    T(s, b, { x: M + 6.4, y, w: CW - 6.4, h: rh, fontSize: 19, color: C.text2, valign: 'middle' });
  });
  const by = ry + 0.36 + 3 * rh + 0.12;
  regla(s, by, M, CW);
  serif(s, 'hacia la visión 2031 · lo que sigue: iniciativas y presupuesto por hito', { x: M, y: by + 0.06, w: 8.5, h: 0.42, fontSize: 18, valign: 'middle' });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 4, y: by + 0.06, w: 4, h: 0.42, fontSize: 18, color: C.text1, align: 'right', valign: 'middle' });
  return s;
};

// =====================================================================
// ANEXO · índice con enlaces (un renglón por tema) y láminas de respaldo
// =====================================================================
D.indice = (primeras) => {
  const s = contenido('MATERIAL DE APOYO', 'ANEXO', 'para preguntas.');
  const temas = [];
  G.ANEXO.forEach((a, i) => { if (!temas.find(t => t.codigo === a.codigo)) temas.push({ codigo: a.codigo, titulo: a.titulo, n: primeras + i, partes: G.ANEXO.filter(b => b.codigo === a.codigo).length }); });
  const rowH = 0.37, y0 = Y0 + 0.02;
  temas.forEach((t, i) => {
    const y = y0 + i * rowH;
    regla(s, y, M, CW);
    tag(s, t.codigo, M, y + 0.04, { w: 0.62, h: 0.29, size: 12 });
    const txt = t.titulo + (t.partes > 1 ? `  (${t.partes} láminas)` : '');
    s.addText(txt, { x: M + 0.8, y, w: CW - 2.0, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 17, color: C.text1, margin: 0, isTextBox: true, hyperlink: { slide: t.n, tooltip: 'Ir a ' + t.titulo } });
    s.addText('LÁM. ' + t.n, { x: R - 1.1, y, w: 1.1, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 13, color: C.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: t.n, tooltip: 'Ir a ' + t.titulo } });
  });
  regla(s, y0 + temas.length * rowH, M, CW);
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
      if (o.render && o.render[j]) o.render[j](v, xx, y, w, rh, i);
      else T(s, v, { x: xx, y, w: w - 0.15, h: rh, fontSize: size, valign: 'middle', bold: !!(o.negrita && o.negrita.includes(j)), color: o.gris && o.gris.includes(j) ? C.text2 : C.text1, lineSpacingMultiple: 0.92 });
      xx += w;
    });
  });
  regla(s, y0 + 0.34 + filas.length * rh, M, CW);
}

D['a-f1'] = () => {
  const s = contenido('PERSPECTIVA FINANCIERA · F1', 'F1 SE MIDE EN DOS ETAPAS:', 'decidir invertir y controlar la operación.');
  const g = 0.4, w = (CW - g) / 2, y = Y0, h = 3.4;
  [['1 · ANTES DE INVERTIR', 'VAN > 0 y TIR > tasa exigida', [['Mide', 'si conviene invertir, con flujos proyectados'], ['Cuándo', 'una vez, con el Plan Financiero'], ['Falta', 'flujos, inversión inicial y tasa sustentada']]],
    ['2 · OPERANDO', 'Retorno sobre el capital empleado frente a su costo', [['Mide', 'si la operación rinde más que el capital'], ['Cuándo', 'cada ejercicio'], ['Falta', 'resultados, capital empleado y costo de capital']]]].forEach(([k, t, rows], i) => {
    const x = M + i * (w + g);
    if (i === 0) cajaHot(s, x, y, w, h); else caja(s, x, y, w, h, { line: { color: C.accent1, width: 1 } });
    mono(s, k, { x: x + 0.28, y: y + 0.2, w: w - 0.5, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, t, { x: x + 0.28, y: y + 0.55, w: w - 0.5, h: 0.75, fontSize: 21, bold: true, valign: 'top' });
    rows.forEach(([a, b], j) => {
      const yy = y + 1.45 + j * 0.62;
      regla(s, yy, x + 0.28, w - 0.56);
      mono(s, a.toUpperCase(), { x: x + 0.28, y: yy, w: 1.1, h: 0.62, fontSize: 12, valign: 'middle' });
      T(s, b, { x: x + 1.4, y: yy, w: w - 1.7, h: 0.62, fontSize: 16, color: C.text2, valign: 'middle' });
    });
  });
  T(s, [{ text: 'Un VAN positivo autoriza invertir; ', options: { bold: true } }, { text: 'no demuestra que la operación rinda.', options: { bold: true, color: C.accent1 } }], { x: M, y: y + h + 0.25, w: CW, h: 0.5, fontSize: 20, valign: 'middle' });
  return s;
};

const cmiPersp = (ids, acento) => () => {
  const s = contenido('CMI COMPLETO', 'EL CMI COMPLETO:', acento);
  const rh = ids.length > 4 ? 0.62 : 0.82;
  tabla(s, [['ID', 0.8], ['OBJETIVO · INDICADOR', 4.6], ['META · REGLA', 2.55], ['RESPONSABLE', 1.95], ['INICIATIVA', CW - 9.9]],
    ids.map(id => [id, id, id, OBJ[id].resp, OBJ[id].ini]), ids.length > 4 ? Y0 - 0.12 : Y0, {
      rh, size: 13, gris: [4],
      render: {
        0: (id, x, y, w, h) => chip(s, id, x, y + (h - 0.32) / 2, { w: 0.6, h: 0.32, size: 12 }),
        1: (id, x, y, w, h) => T(s, [{ text: OBJ[id].n, options: { bold: true, breakLine: true } }, { text: OBJ[id].ind, options: { color: C.text2 } }], { x, y, w: w - 0.15, h, fontSize: 13, valign: 'middle', lineSpacingMultiple: 0.92 }),
        2: (id, x, y, w, h) => T(s, [{ text: OBJ[id].meta, options: { breakLine: true } }, { text: OBJ[id].regla.toUpperCase(), options: { fontFace: F_MONO, fontSize: 11, color: C.accent1 } }], { x, y, w: w - 0.15, h, fontSize: 13, valign: 'middle', lineSpacingMultiple: 0.92 }),
      },
    });
  return s;
};
D['a-cmiA'] = cmiPersp(['A1', 'A2', 'A3', 'A4'], 'aprendizaje y crecimiento.');
D['a-cmiP'] = cmiPersp(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], 'procesos internos.');
D['a-cmiC'] = cmiPersp(['C1', 'C2', 'C3', 'C4'], 'clientes.');
D['a-cmiF'] = cmiPersp(['F1', 'F2', 'F3'], 'financiera.');

const relSlide = (desde, hasta, acento) => () => {
  const s = contenido('MAPA', 'LAS 20 RELACIONES:', acento);
  leyendaLineas(s);
  tabla(s, [['R', 1.25], ['DE · A', 1.4], ['MECANISMO', 5.4], ['CÓMO SE COMPRUEBA', CW - 8.05]],
    REL.slice(desde, hasta).map(r => [r, `${r[1]} a ${r[2]}`, r[4], r[5]]), Y0 - 0.08, {
      rh: 0.385, size: 13, gris: [3],
      render: {
        0: (r, x, y, w, h) => { mono(s, r[0], { x, y, w: 0.5, h, fontSize: 12, color: C.accent1, valign: 'middle' }); s.addShape(S.line, { x: x + 0.55, y: y + h / 2, w: 0.5, h: 0, line: Object.assign({}, LINEA[r[3]]) }); },
      },
    });
  return s;
};
D['a-rel1'] = relSlide(0, 10, 'R01 a R10.');
D['a-rel2'] = relSlide(10, 20, 'R11 a R20.');

D['a-cambios'] = () => {
  const s = contenido('DISEÑO DEL CMI · DECISIONES DEL EQUIPO', 'QUÉ CAMBIÓ', 'frente a la propuesta de 30 relaciones.');
  tabla(s, [['TEMA', 2.1], ['PROPUESTA PREVIA', 3.0], ['AHORA', 3.3], ['POR QUÉ', CW - 8.4]], [
    ['F1 · rentabilidad', 'VAN del proyecto', 'Dos etapas: VAN y TIR; luego retorno frente al costo de capital', 'El VAN autoriza invertir, no controla la operación'],
    ['Financiamiento', 'F3, en la perspectiva financiera', 'Parte de P6, alianzas en procesos', 'Es algo que Lumine hace; el cliente lo percibe como acceso'],
    ['C3 · confianza', 'Convenios institucionales firmados', 'Opinión del cliente y reclamos', 'La confianza se mide desde el cliente'],
    ['C4 · captación', 'Proporción de consultas de uso intensivo', 'Conversión de consultas del segmento', 'Un resultado, no una mezcla de consultas'],
    ['Relaciones', '30, con duplicados', '20, en tres rutas', 'Sin caminos repetidos ni flechas que no cambian decisiones'],
  ], Y0, { rh: 0.76, size: 15, negrita: [0, 2], gris: [1, 3] });
  return s;
};

D['a-estados'] = () => {
  const s = contenido('SEGUIMIENTO · ESTADOS DEL TABLERO', 'CADA ESTADO', 'tiene una regla.');
  const st = [['cumple', 'CUMPLE', VERDE, 'Alcanza la meta, con evidencia'], ['alerta', 'ALERTA', AMBAR, 'Indicador proporcional entre 70% y 89%'], ['nocumple', 'NO CUMPLE', ROJO, 'Bajo la meta, o rechazo formal documentado'], ['pend', 'META PENDIENTE', GRIS, 'La meta aún no está aprobada'], ['sin', 'SIN MEDIR', C.text1, 'Falta el dato o el documento: no vale cero']];
  const rh = 0.6, y0 = Y0;
  st.forEach(([t, k, color, v], i) => {
    const y = y0 + i * rh;
    regla(s, y, M, CW, i ? C.accent5 : C.accent1);
    forma(s, t, M, y + 0.13, 0.34);
    mono(s, k, { x: M + 0.55, y, w: 2.6, h: rh, fontSize: 15, bold: true, color, valign: 'middle' });
    T(s, v, { x: M + 3.2, y, w: CW - 3.2, h: rh, fontSize: 18, valign: 'middle' });
  });
  regla(s, y0 + 5 * rh, M, CW);
  T(s, [{ text: 'Críticos e hitos cumplen solo al 100% o con documento: ', options: { bold: true } }, { text: 'no existe el cumplimiento parcial de un requisito regulatorio.', options: { color: C.text2 } }], { x: M, y: y0 + 5 * rh + 0.2, w: CW, h: 0.8, fontSize: 18, valign: 'top' });
  return s;
};

D['a-iniciativas'] = () => {
  const s = contenido('CMI · INICIATIVAS ESTRATÉGICAS', 'LAS INICIATIVAS', 'que mueven los objetivos.');
  const ini = [['Plantear al MTT el precedente del gas licuado', 'P1', 'FODA · DO'], ['Homologar primero los modelos más densos del segmento', 'P2', 'FODA · FO'], ['Convenios con aseguradora, planta de revisión y financiera antes del primer kit', 'P6', 'FODA · DA'], ['Cobertura cambiaria y abastecimiento de largo plazo', 'F2', 'FODA · quinto cruce'], ['Protocolo antes y después con línea base del mismo auto', 'A3', 'CMI actualizado'], ['Repositorio versionado de calibraciones con control de acceso', 'A1', 'CMI en red'], ['Ruta de habilitación N1 a N4 en Lumine Habilita', 'A2', 'Lumine Habilita'], ['Encuesta posservicio y registro de reclamos', 'C3', 'Propuesta del equipo']];
  tabla(s, [['INICIATIVA', 8.0], ['OBJETIVO', 1.4], ['ORIGEN', CW - 9.4]], ini, Y0 - 0.05, {
    rh: 0.48, size: 16, gris: [2],
    render: { 1: (id, x, y, w, h) => chip(s, id, x, y + (h - 0.32) / 2, { w: 0.6, h: 0.32, size: 12 }) },
  });
  return s;
};

D['a-foda'] = () => {
  const s = contenido('DIAGNÓSTICO · FODA', 'EL FODA', 'que alimenta los objetivos.');
  const q = [['FORTALEZAS', ['Arquitectura en eje trasero y proceso de cinco etapas', 'Segmento definido y estrategia de producto única', 'Riesgos identificados y protocolo de contención']],
    ['DEBILIDADES', ['Sin ensayo ni homologación; biblioteca vacía', 'Técnicos escasos y sin esquema de retención', 'Inventario en dólares sin cobertura; marca sin casos']],
    ['OPORTUNIDADES', ['El parque se conserva: 3,5 usados por cada auto nuevo', 'Bencina 93 de $1.149 a $1.541 por litro en la RM', 'Baterías LFP en US$81 por kWh']],
    ['AMENAZAS', ['Ley N° 21.793 sin reglamento; borrador de 2021 sin vía', 'Dólar cerca de $970 con kit 100% importado', 'Desempleo de 9,5% y no hacer nada cuesta $0']]];
  const g = 0.3, w = (CW - g) / 2, h = (YF - Y0 - g) / 2;
  q.forEach(([k, items], i) => {
    const x = M + (i % 2) * (w + g), y = Y0 + Math.floor(i / 2) * (h + g);
    caja(s, x, y, w, h, { line: { color: i % 3 === 0 ? C.accent1 : C.text2, width: 0.75 } });
    mono(s, k, { x: x + 0.22, y: y + 0.12, w: w - 0.4, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })), { x: x + 0.22, y: y + 0.45, w: w - 0.4, h: h - 0.55, fontSize: 15, valign: 'top', paraSpaceAfter: 4 });
  });
  return s;
};

D['a-cadena'] = () => {
  const s = contenido('DIAGNÓSTICO · CADENA DE VALOR', 'LA CADENA DE VALOR:', 'el costo y la exclusividad no coinciden.');
  tabla(s, [['ESLABÓN', 3.0], ['LECTURA', CW - 3.0]], [
    ['Infraestructura', 'Condición de entrada: sin autorización no opera ningún eslabón'],
    ['Desarrollo tecnológico', 'Única fuente de exclusividad: la calibración'],
    ['Operaciones', 'Cuello de botella: homologación por modelo, internación y escasez de técnicos'],
    ['Adquisiciones', 'Directriz de costo: kit importado, carga Clase 9 y dólar'],
    ['Externalizable', 'Contabilidad, aduana, transporte peligroso y remuneraciones'],
  ], Y0, { rh: 0.7, size: 18, negrita: [0] });
  return s;
};

D['a-pest'] = () => {
  const s = contenido('DIAGNÓSTICO · MÉTODO DE LOS INSTRUMENTOS', 'PEST Y CINCO FUERZAS,', 'con su escala.');
  const lw = 5.6;
  mono(s, 'PEST · 1 A 5 · 3 = NEUTRO', { x: M, y: Y0, w: lw, h: 0.3, fontSize: 13 });
  const pest = [['Político-jurídico', '2,67', '2,78'], ['Económico', '2,38', '2,81'], ['Sociocultural', '3,00', '3,00'], ['Tecnológico', '3,23', '3,38'], ['Global', '2,82', '2,99']];
  mono(s, 'HOY', { x: M + 3.4, y: Y0 + 0.34, w: 1, h: 0.3, fontSize: 12, align: 'right' });
  mono(s, 'FUTURO', { x: M + 4.5, y: Y0 + 0.34, w: 1.1, h: 0.3, fontSize: 12, align: 'right' });
  pest.forEach(([k, a, b], i) => {
    const y = Y0 + 0.68 + i * 0.5;
    regla(s, y, M, lw, i ? C.accent5 : C.accent1);
    T(s, k, { x: M, y, w: 3.3, h: 0.5, fontSize: 17, bold: i === 4, valign: 'middle' });
    numero(s, a, { x: M + 3.4, y, w: 1, h: 0.5, fontSize: 22, align: 'right', valign: 'middle' });
    numero(s, b, { x: M + 4.5, y, w: 1.1, h: 0.5, fontSize: 22, align: 'right', valign: 'middle', color: C.text2 });
  });
  T(s, '20 amenazas, 13 oportunidades y 18 neutros', { x: M, y: Y0 + 3.3, w: lw, h: 0.4, fontSize: 16, color: C.text2 });
  const rx = M + lw + 0.6, rw = R - rx;
  mono(s, 'CINCO FUERZAS · 0 A 5 · PONDERACIÓN', { x: rx, y: Y0, w: rw, h: 0.3, fontSize: 13 });
  [['Sustitutos', '30%', '5,00'], ['Nuevos entrantes', '20%', '3,75'], ['Clientes', '25%', '2,64'], ['Proveedores', '15%', '2,67'], ['Rivalidad', '10%', '1,83'], ['Promedio ponderado', '', '3,49']].forEach(([k, p, v], i) => {
    const y = Y0 + 0.4 + i * 0.5;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    T(s, k, { x: rx, y, w: 3.2, h: 0.5, fontSize: 17, bold: i === 5, valign: 'middle' });
    mono(s, p, { x: rx + 3.2, y, w: 1, h: 0.5, fontSize: 14, valign: 'middle', align: 'right' });
    numero(s, v, { x: rx + 4.3, y, w: rw - 4.3, h: 0.5, fontSize: 22, align: 'right', valign: 'middle', color: i === 5 ? C.accent1 : C.text1 });
  });
  marca(s, 'sup', 'ESCALAS NO COMPARABLES CON INTEGRADOR II', rx, Y0 + 3.5, { size: 12, h: 0.36 });
  return s;
};

D['a-identidad'] = () => {
  const s = contenido('LA ORGANIZACIÓN · TEXTOS LITERALES', 'MISIÓN, VISIÓN Y VALORES', 'completos.');
  T(s, [{ text: 'MISIÓN  ', options: { fontFace: F_MONO, fontSize: 12, color: C.accent1 } }, { text: '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»' }], { x: M, y: Y0, w: CW, h: 0.95, fontSize: 16, valign: 'top' });
  T(s, [{ text: 'VISIÓN  ', options: { fontFace: F_MONO, fontSize: 12, color: C.accent1 } }, { text: '«Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las compañías de seguros.»' }], { x: M, y: Y0 + 1.0, w: CW, h: 0.75, fontSize: 16, valign: 'top' });
  const w = (CW - 0.4) / 2, y = Y0 + 1.9;
  [['VALORES ORGANIZACIONALES', ['Verificabilidad antes que afirmación', 'Formalidad como condición de operación', 'Trazabilidad del conocimiento técnico', 'Responsabilidad sobre el ciclo completo del componente']], ['VALORES HUMANOS', ['Honestidad técnica en el diagnóstico', 'Seguridad de quien instala y de quien conduce', 'Responsabilidad individual sobre la instalación ejecutada', 'Reconocimiento del oficio técnico']]].forEach(([k, items], i) => {
    const x = M + i * (w + 0.4);
    regla(s, y, x, w, C.accent1);
    mono(s, k, { x, y: y + 0.08, w, h: 0.3, fontSize: 12, color: C.accent1 });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })), { x, y: y + 0.45, w, h: 1.85, fontSize: 16, valign: 'top', paraSpaceAfter: 3 });
  });
  marca(s, 'no', 'NO ES UN VALOR: INNOVACIÓN', R, YF - 0.36, { size: 11, h: 0.34, alignRight: true });
  return s;
};

D['a-origen'] = () => {
  const s = contenido('TRANSPARENCIA · ORIGEN DE CADA AFIRMACIÓN', 'DATO, PROPUESTA, ESTIMACIÓN O FALTA:', 'cada cifra dice qué es.');
  const cols = [['DATO', ['Lumine es preoperativa', 'Ley N° 21.793 sin reglamento', 'Sin ventas, homologaciones ni convenios'], { color: C.accent1, width: 1.25 }],
    ['PROPUESTA DEL EQUIPO', ['17 objetivos y 20 relaciones', 'Metas de 100% y umbrales 90/70', 'Responsables e iniciativas'], { color: GRIS, width: 1, dashType: 'sysDot' }],
    ['ESTIMACIÓN', ['Hasta 20% menos bencina en ciudad', 'Orden de atributos (3 entrevistas)'], { color: GRIS, width: 1, dashType: 'dash' }],
    ['SIN DATO HOY', ['VAN, TIR y tasa', 'Margen y costos unitarios', 'Ahorro real, clientes y permisos'], { color: C.text1, width: 1.25, dashType: 'dash' }]];
  const g = 0.25, w = (CW - 3 * g) / 4, h = YF - Y0 - 0.06;
  cols.forEach(([k, items, ln], i) => {
    const x = M + i * (w + g);
    caja(s, x, Y0, w, h, { line: ln });
    mono(s, k, { x: x + 0.22, y: Y0 + 0.2, w: w - 0.4, h: 0.5, fontSize: 13, bold: true, color: ln.color === C.accent1 ? C.accent1 : C.text1 });
    items.forEach((t, j) => {
      const yy = Y0 + 0.85 + j * 0.95;
      regla(s, yy, x + 0.22, w - 0.44);
      T(s, t, { x: x + 0.22, y: yy + 0.06, w: w - 0.44, h: 0.82, fontSize: 17, valign: 'middle' });
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
  D[a.d]().addNotes(`ANEXO ${a.codigo}${a.parte ? ' · ' + a.parte : ''} · Solo si preguntan.\n\n${a.apoyo}`);
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
