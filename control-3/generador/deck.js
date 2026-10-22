// Control 3 · Avance 1 del TIG · Control de Gestión (ICMA901, UNAB) · Lumine Motors (22-10-2026)
// Puntos 3 a 6 del instructivo: introducción, comprensión del negocio, declaraciones estratégicas y análisis estratégico.
// El mapa del CMI queda solo como respaldo rotulado del Avance 2 (anexo A11).
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
pres.title = 'Control 3 · Avance 1 del TIG · Lumine Motors';
pres.subject = 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB';
pres.theme = { headFontFace: F_TIT, bodyFontFace: F_BODY };
const C = pres.SchemeColor;
const S = pres.ShapeType;

const W = 13.333, M = 0.6, CW = W - 2 * M, R = W - M;
const LOGO_H = 0.22, LOGO_W = LOGO_H * (127.25 / 26);
const CURSO = 'CONTROL DE GESTIÓN · ICMA901 · CONTROL 3 · AVANCE 1 TIG';
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

// Fuente al pie de cada diapositiva. Cifras públicas verificadas el 22-10-2026; resultados de instrumentos rotulados como del equipo.
const INST = n => `instrumento ${n} del equipo`;
const FUENTES = {
  contexto: 'Fuentes: CAVEM (2026), mercado automotor enero-agosto; CNE, Bencina en Línea, citado por Emol (24-03-2026); Banco Central de Chile (2026), IPoM de septiembre.',
  kit: 'Fuentes: presentación «Análisis estratégico» de Control de Gestión (octubre de 2026); contexto vigente del proyecto. Ilustración del kit, no un plano certificado.',
  valor: 'Fuentes: entrevistas del equipo (n = 3; evidencia indicativa); estimación de ingeniería del equipo, no medida en autos chilenos; Lumine Habilita, demostración con datos ficticios.',
  identidad: 'Fuente: declaraciones estratégicas del proyecto; textos literales en el anexo A7.',
  pest: `Fuentes: ${INST('03')} (PEST, escala 1 a 5); INE (2026), ENE junio-agosto; Banco Central de Chile (2026), dólar observado; BloombergNEF (2025).`,
  regulacion: 'Fuentes: Ley N° 21.793, Diario Oficial (14-01-2026); borrador de reglamento del MTT en consulta (diciembre de 2021); escenarios elaborados por el equipo.',
  porter: `Fuente: ${INST('02')} (cinco fuerzas de Porter): intensidad de 0 a 5 y ponderación propia del modelo; cálculo en el anexo A2.`,
  recursos: `Fuentes: ${INST('05')} (recursos y capacidades, criterios VRIO) e ${INST('06')} (factores críticos de éxito, escala 1 a 5).`,
  cadena: `Fuente: ${INST('06')} (cadena de valor y comparación con competidores estimada por el equipo, escala 1 a 5).`,
  foda: 'Fuentes: instrumentos 02, 03, 05 y 06 del equipo; CAVEM (2026); CNE (2026); INE (2026); Banco Central de Chile (2026); BloombergNEF (2025).',
  brechas: 'Fuente: elaboración propia a partir del diagnóstico de las láminas 6 a 11.',
  cierre: 'Fuente: elaboración propia. La formulación de estrategia, los objetivos y el Cuadro de Mando Integral corresponden al Avance 2 del TIG.',
  indice: 'Las fuentes de cada tema están al pie de su diapositiva.',
  'a-pest': `Fuentes: ${INST('03')}; Banco Central de Chile (2026); INE (2026); BloombergNEF (2025); CAVEM (2026).`,
  'a-porter': `Fuente: ${INST('02')}. La ponderación es un supuesto del modelo, no una medición del mercado.`,
  'a-vrio': `Fuente: ${INST('05')} (recursos y capacidades; criterios valioso, raro, costoso de imitar e insustituible).`,
  'a-fce': `Fuente: ${INST('06')}, factores críticos de éxito. Escala de 1 (gran debilidad) a 5 (gran fortaleza); en riesgo, un número bajo es riesgo alto.`,
  'a-competidores': `Fuente: ${INST('06')}. Los puntajes de los competidores son estimaciones del equipo; las marcadas con * operan fuera del segmento liviano y son referencia.`,
  'a-foda': 'Fuentes: instrumentos 02, 03, 05 y 06 del equipo y las fuentes públicas del anexo A8.',
  'a-identidad': 'Fuente: declaraciones estratégicas del proyecto (presentación «Análisis estratégico», octubre de 2026).',
  'a-fuentes': 'Verificación realizada el 22-10-2026. Las cifras de los instrumentos que no tienen fuente pública identificable no se usan en las láminas.',
  'a-supuestos': 'Fuente: elaboración propia.',
  'a-word': 'Fuente: elaboración propia; informe «Avance 1 · Control 3» (borrador del equipo).',
  'a-avance2': 'Respaldo del siguiente avance: propuesta preliminar del equipo, no forma parte de la evaluación del Avance 1.',
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
  const unaLinea = titulo.length * 0.345 + acento.length * 0.18 <= CW - 0.6;
  s.addText([{ text: unaLinea ? titulo + ' ' : titulo, options: { breakLine: !unaLinea } }, { text: acento, options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: TX.acento } }], { placeholder: 'title' });
  const f = FUENTES[CLAVE];
  if (!f) throw new Error('Falta la fuente de la diapositiva ' + CLAVE);
  T(s, f, { x: M, y: 6.94, w: R - M - 1.0, h: 0.42, valign: 'top', fontSize: TX.inst, color: C.text2 });
  return s;
}
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
      else T(s, String(v), { x: xx, y, w: w - 0.15, h: rh, fontSize: size, valign: 'middle', bold: !!(o.negrita && o.negrita.includes(j)), color: o.gris && o.gris.includes(j) ? C.text2 : C.text1, lineSpacingMultiple: 0.92, align: o.derecha && o.derecha.includes(j) ? 'right' : 'left' });
      xx += w;
    });
  });
  regla(s, y0 + 0.34 + filas.length * rh, M, CW);
}
const coma = n => String(n).replace('.', ',');

// =====================================================================
// 1 · PORTADA
// =====================================================================
D.portada = () => {
  const s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: SEC });
  mono(s, 'UNAB · OCTUBRE 2026', { x: 7.2, y: 0.4, w: R - 7.2, h: 0.26, align: 'right', valign: 'middle', fontSize: 12 });
  mono(s, [{ text: 'CONTROL 3 · AVANCE 1 DEL TIG', options: { color: C.accent1 } }, { text: '  ·  CONTROL DE GESTIÓN', options: { color: C.text2 } }], { x: M, y: 1.0, w: CW, h: 0.32, fontSize: 14, valign: 'middle' });
  s.addText([
    { text: 'LUMINE MOTORS', options: { breakLine: true, fontSize: 50 } },
    { text: 'comprensión del negocio y análisis estratégico', options: { fontFace: F_SER, italic: true, color: C.accent1, fontSize: 38 } },
  ], { placeholder: 'title' });
  linea(s, M, 3.05, 0.06, 0.86, C.accent1, 3);
  T(s, [{ text: 'Lumine es preoperativa: ', options: { bold: true } }, { text: 'este avance fundamenta el negocio; no presenta resultados.', options: { color: C.text2 } }],
    { x: M + 0.3, y: 3.03, w: 5.4, h: 0.9, fontSize: 21, valign: 'middle', lineSpacingMultiple: 1.05 });
  const iy = 5.3;
  linea(s, M, iy, 1.2, 0, C.accent1, 1.25);
  T(s, [
    { text: 'Control de Gestión · ICMA901', options: { breakLine: true, bold: true, color: C.text1 } },
    { text: 'Sección 500 · NRC 4118 · UNAB', options: { breakLine: true } },
    { text: 'Profesor: Leonardo Lizana Contreras', options: { breakLine: true } },
    { text: 'Diego Alarcón · Benjamín Torres · Lukas Verdugo' },
  ], { x: M, y: iy + 0.16, w: 3.75, h: 1.4, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.15 });
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
// 2 · INTRODUCCIÓN · el parque se conserva y usarlo cuesta cada vez más
// =====================================================================
D.contexto = () => {
  const s = contenido('3 · INTRODUCCIÓN · CONTEXTO Y PROBLEMA', 'EL PARQUE SE CONSERVA', 'y usarlo cuesta cada vez más.');
  const g = 0.35, w = (CW - 2 * g) / 3, y = Y0, h = 2.72;
  const datos = [
    ['SE CONSERVA EL AUTO', '3,5', 'autos usados transferidos por cada auto nuevo inscrito', 'Enero a agosto de 2026 · CAVEM', false],
    ['USARLO CUESTA MÁS', '+$370', 'por litro de bencina 93 en la RM con el alza de marzo ($1.169 a $1.539)', 'Marzo de 2026 · CNE, Bencina en Línea', true],
    ['LA ECONOMÍA SE FRENA', '0,25%–0,75%', 'crecimiento proyectado para 2026, recortado en parte por el alza de los combustibles', 'Septiembre de 2026 · Banco Central, IPoM', false],
  ];
  datos.forEach(([k, n, t, f, hot], i) => {
    const x = M + i * (w + g);
    if (hot) { brillo(s, x, y, w, h, 0.5); cajaHot(s, x, y, w, h); } else caja(s, x, y, w, h, { line: { color: C.text2, width: 0.75 } });
    mono(s, k, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.3, fontSize: 13, color: C.accent1 });
    numero(s, n, { x: x + 0.25, y: y + 0.5, w: w - 0.5, h: 0.85, fontSize: n.length > 6 ? 40 : 54, valign: 'middle', color: hot ? C.accent1 : C.text1 });
    T(s, t, { x: x + 0.25, y: y + 1.35, w: w - 0.5, h: 0.85, fontSize: 16, valign: 'top' });
    mono(s, f, { x: x + 0.25, y: y + h - 0.42, w: w - 0.5, h: 0.34, fontSize: 11, color: C.text2, valign: 'bottom' });
  });
  const by = y + h + 0.2;
  regla(s, by, M, CW, C.accent1);
  [['PROBLEMA', 'Quien depende de su auto paga cada vez más por usarlo y no puede cambiarlo.'], ['OBJETIVO DEL AVANCE', 'Entender si Lumine responde a ese problema y en qué condiciones.']].forEach(([k, t], i) => {
    const yy = by + 0.1 + i * 0.55;
    mono(s, k, { x: M, y: yy, w: 2.4, h: 0.48, fontSize: 13, color: i ? C.text2 : C.accent1, valign: 'middle' });
    T(s, t, { x: M + 2.45, y: yy, w: CW - 2.45, h: 0.48, fontSize: 18, bold: i === 0, valign: 'middle' });
  });
  return s;
};

// =====================================================================
// 3 · UN KIT QUE SE SUMA, NO REEMPLAZA
// =====================================================================
D.kit = () => {
  const s = contenido('4 · COMPRENSIÓN DEL NEGOCIO · LA SOLUCIÓN', 'UN KIT QUE SE SUMA,', 'no reemplaza.');
  const iw = 8.7, ih = iw * 740 / 2400;
  s.addImage({ path: A('plano.png'), x: M + 0.1, y: Y0 - 0.05, w: iw, h: ih, altText: 'Plano del kit: motor original adelante, unidad de control, banco de baterías y motor eléctrico en el eje trasero' });
  const ly = Y0 + ih + 0.05, pw = (iw + 0.2) / 4;
  regla(s, ly, M, iw + 0.2);
  [['01', 'MOTOR ORIGINAL', 'Intacto, con su tracción delantera'], ['02', 'UNIDAD DE CONTROL', 'Decide cuándo asistir y corta ante fallas'], ['03', 'BANCO DE BATERÍAS', 'Guarda la energía del frenado'], ['04', 'MOTOR ELÉCTRICO', 'En el eje trasero; no se enchufa']].forEach(([n, k, v], i) => {
    const x = M + i * pw;
    tag(s, n, x, ly + 0.16, { off: i === 0, w: 0.5, h: 0.34, size: 14 });
    mono(s, k, { x: x + 0.6, y: ly + 0.16, w: pw - 0.65, h: 0.34, fontSize: 12, color: C.text1, valign: 'middle' });
    T(s, v, { x, y: ly + 0.6, w: pw - 0.15, h: 0.7, fontSize: 16, color: C.text2 });
  });
  const rx = M + iw + 0.6, rw = R - rx;
  [['ESTADO', 'Preoperativa: sin taller, personal ni clientes', null], ['SEGURIDAD', 'Freno, ABS y control de estabilidad originales mandan sobre el kit', null], ['DISEÑO', 'Falta probarlo, homologarlo y documentarlo', 'POR VALIDAR']].forEach(([k, v, m], i) => {
    const y = Y0 + i * 1.32;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    mono(s, k, { x: rx, y: y + 0.1, w: rw, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, v, { x: rx, y: y + 0.42, w: rw, h: 0.85, fontSize: 17, valign: 'top' });
    if (m) marca(s, 'pen', m, R, y + 0.06, { alignRight: true, size: 12, h: 0.32 });
  });
  return s;
};

// =====================================================================
// 4 · EL CLIENTE COMPRA AHORRO SIN CAMBIAR DE AUTO, SI CONFÍA · propuesta de valor y modelo de negocio
// =====================================================================
D.valor = () => {
  const s = contenido('4 · COMPRENSIÓN DEL NEGOCIO · CLIENTE Y MODELO', 'EL CLIENTE COMPRA AHORRO', 'sin cambiar de auto, si confía.');
  mono(s, 'NECESIDAD', { x: M, y: Y0, w: 2, h: 0.4, fontSize: 13, valign: 'middle' });
  T(s, '«Dejar de pagar cada vez más por usar el auto, sin tener que reemplazarlo.»', { x: M + 1.6, y: Y0, w: CW - 1.6, h: 0.4, fontFace: F_SER, italic: true, fontSize: 22, valign: 'middle' });
  const g = 0.25, w = (CW - 3 * g) / 4, y = Y0 + 0.55, h = 1.32;
  [['Ahorrar hasta 20% sin cambiar de auto', 'ESTIMACIÓN'], ['Respaldo técnico verificable', null], ['Seguir usando el mismo vehículo', null], ['Transparencia en compatibilidad y costos', null]].forEach(([t, m], i) => {
    const x = M + i * (w + g);
    caja(s, x, y, w, h, { line: { color: i === 0 ? C.accent1 : C.text2, width: i === 0 ? 1.25 : 0.75 } });
    tag(s, String(i + 1), x + 0.18, y + 0.16, { off: i > 0, w: 0.38, h: 0.34, size: 14 });
    T(s, t, { x: x + 0.18, y: y + 0.56, w: w - 0.3, h: 0.6, fontSize: 16, bold: true, valign: 'top', lineSpacingMultiple: 0.95 });
    if (m) marca(s, 'est', m, x + w - 0.12, y + 0.14, { alignRight: true, size: 10, h: 0.3 });
  });
  const ey = y + h + 0.16;
  T(s, [{ text: 'Indicio cualitativo: ', options: { color: C.text2 } }, { text: 'el precio decide si se compra; la confianza, si uno se atreve.', options: { bold: true } }], { x: M, y: ey, w: CW - 2.6, h: 0.45, fontSize: 18, valign: 'middle' });
  marca(s, 'sup', 'INDICATIVO · n = 3', R, ey + 0.05, { alignRight: true, size: 12, h: 0.36 });
  const my = ey + 0.65, q = YF - my;
  regla(s, my, M, CW, C.accent1);
  mono(s, 'MODELO DE NEGOCIO', { x: M, y: my + 0.12, w: 4, h: 0.3, fontSize: 13, color: C.accent1 });
  const bw = (CW - q - 0.6) / 2;
  [['LÍNEA 1', 'Taller propio: diagnóstico, instalación, calibración y posventa', null], ['LÍNEA 2', 'Licencias de calibración y procedimiento, con Lumine Habilita', 'POTENCIAL']].forEach(([k, t, m], i) => {
    const x = M + i * (bw + 0.25);
    mono(s, k, { x, y: my + 0.48, w: 1.2, h: 0.3, fontSize: 12, color: C.text2 });
    T(s, t, { x, y: my + 0.8, w: bw - 0.1, h: q - 0.85, fontSize: 17, valign: 'top' });
    if (m) marca(s, 'sup', m, x + bw - 0.1, my + 0.45, { alignRight: true, size: 11, h: 0.3 });
  });
  s.addImage({ path: A('qr-habilita.png'), x: R - q + 0.1, y: my + 0.1, w: q - 0.1, h: q - 0.1, altText: 'Código QR a la demostración de Lumine Habilita' });
  return s;
};

// =====================================================================
// 5 · MISIÓN, VISIÓN Y VALORES QUE ORIENTAN DECISIONES
// =====================================================================
D.identidad = () => {
  const s = contenido('5 · DECLARACIONES ESTRATÉGICAS COMPARTIDAS', 'MISIÓN, VISIÓN Y VALORES', 'que orientan decisiones.');
  marca(s, 'sup', 'DECLARACIÓN DEL PROYECTO', R, 0.88, { alignRight: true, size: 11, h: 0.32 });
  [['MISIÓN', '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»', 1.05],
    ['VISIÓN', '«Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las compañías de seguros.»', 0.8]].forEach(([k, t, h], i) => {
    const y = Y0 + (i ? 0.98 : 0);
    mono(s, k, { x: M, y: y + 0.05, w: 1.3, h: 0.3, fontSize: 13, color: C.accent1 });
    T(s, t, { x: M + 1.35, y, w: CW - 1.35, h: i ? 0.66 : 0.92, fontFace: F_SER, italic: true, fontSize: 18, valign: 'top', lineSpacingMultiple: 0.95 });
  });
  const vy = Y0 + 1.72, w = (CW - 0.4) / 2;
  const col = [['VALORES ORGANIZACIONALES', [['Verificabilidad antes que afirmación', true], ['Formalidad como condición de operación', true], ['Trazabilidad del conocimiento técnico', false], ['Responsabilidad sobre el ciclo completo del componente', false]]],
    ['VALORES HUMANOS', [['Honestidad técnica en el diagnóstico', false], ['Seguridad de quien instala y de quien conduce', true], ['Responsabilidad individual sobre la instalación ejecutada', false], ['Reconocimiento del oficio técnico', false]]]];
  col.forEach(([k, items], c) => {
    const x = M + c * (w + 0.4);
    regla(s, vy, x, w, C.accent1);
    mono(s, k, { x, y: vy + 0.08, w, h: 0.3, fontSize: 12, color: C.accent1 });
    items.forEach(([t, hot], j) => {
      const y = vy + 0.42 + j * 0.52;
      s.addShape(S.rect, { x, y: y + 0.18, w: 0.14, h: 0.14, fill: { color: hot ? C.accent1 : C.accent5 }, line: { type: 'none' } });
      T(s, t, { x: x + 0.3, y, w: w - 0.3, h: 0.5, fontSize: 16, bold: hot, color: hot ? C.text1 : C.text2, valign: 'middle', lineSpacingMultiple: 0.9 });
    });
  });
  return s;
};

// =====================================================================
// 6 · PEST 2,82 · barras por dimensión con el neutro marcado
// =====================================================================
D.pest = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · ENTORNO GENERAL (PEST)', 'PEST 2,82:', 'el freno es económico y regulatorio.');
  const lw = 8.2, x0 = M + 2.75, bw = lw - 2.75 - 0.75, sx = v => x0 + (v - 1) / 4 * bw;
  mono(s, 'DIMENSIÓN · ESCALA 1 A 5 · 3 = NEUTRO', { x: M, y: Y0 - 0.05, w: lw, h: 0.3, fontSize: 12 });
  [1, 2, 3, 4, 5].forEach(v => mono(s, String(v), { x: sx(v) - 0.2, y: Y0 + 0.28, w: 0.4, h: 0.25, fontSize: 11, align: 'center', color: v === 3 ? C.text1 : C.text2 }));
  const dims = [['Económico', 2.38, 2.81, 'Ingreso disponible, desempleo 9,6%, dólar sobre $970'], ['Político-jurídico', 2.67, 2.78, 'Ley 21.793 sin reglamento'], ['Sociocultural', 3.00, 3.00, 'Se conserva el auto; aseguradoras excluyen modificados'], ['Tecnológico', 3.23, 3.38, 'Componentes maduros; LFP a US$81/kWh']];
  const rh = 0.86, y0 = Y0 + 0.62;
  dims.forEach(([k, hoy, fut, nota], i) => {
    const y = y0 + i * rh, malo = hoy < 3;
    T(s, k, { x: M, y, w: 2.6, h: 0.38, fontSize: 18, bold: true, valign: 'middle' });
    T(s, nota, { x: M, y: y + 0.38, w: lw - 0.1, h: 0.36, fontSize: 13, color: C.text2, valign: 'top' });
    s.addShape(S.rect, { x: sx(1), y: y + 0.07, w: sx(hoy) - sx(1), h: 0.22, fill: { color: malo ? C.text1 : C.accent1 }, line: { type: 'none' } });
    s.addShape(S.rect, { x: sx(1), y: y + 0.3, w: sx(fut) - sx(1), h: 0.06, fill: { color: GRIS }, line: { type: 'none' } });
    numero(s, coma(hoy.toFixed(2)), { x: sx(5) + 0.05, y, w: 0.75, h: 0.38, fontSize: 20, valign: 'middle', color: malo ? C.text1 : C.accent1 });
  });
  linea(s, sx(3), Y0 + 0.55, 0, 4 * rh + 0.05, C.accent1, 1.25, { line: { color: C.accent1, width: 1.25, dashType: 'dash' } });
  const ly = y0 + 4 * rh - 0.05;
  s.addShape(S.rect, { x: M, y: ly + 0.08, w: 0.3, h: 0.14, fill: { color: C.text1 }, line: { type: 'none' } });
  T(s, 'hoy', { x: M + 0.38, y: ly, w: 0.6, h: 0.3, fontSize: 12, color: C.text2, valign: 'middle' });
  s.addShape(S.rect, { x: M + 1.05, y: ly + 0.12, w: 0.3, h: 0.06, fill: { color: GRIS }, line: { type: 'none' } });
  T(s, 'a futuro', { x: M + 1.43, y: ly, w: 1.2, h: 0.3, fontSize: 12, color: C.text2, valign: 'middle' });
  const rx = M + lw + 0.5, rw = R - rx;
  brillo(s, rx, Y0, rw, 1.4, 0.5);
  mono(s, 'GLOBAL HOY', { x: rx, y: Y0 - 0.05, w: rw, h: 0.3, fontSize: 12, color: C.accent1 });
  numero(s, '2,82', { x: rx, y: Y0 + 0.25, w: rw, h: 1.1, fontSize: 72, valign: 'middle', color: C.accent1 });
  T(s, 'moderadamente desfavorable', { x: rx, y: Y0 + 1.35, w: rw, h: 0.35, fontSize: 15, color: C.text2 });
  const cy = Y0 + 2.0, tot = 51, cw = rw;
  mono(s, '51 FACTORES · A FUTURO 2,99', { x: rx, y: cy, w: rw, h: 0.28, fontSize: 12 });
  let cx = rx;
  const cuenta = [[13, 'oportunidades', C.accent1], [18, 'neutros', GRIS], [20, 'amenazas', C.text1]];
  cuenta.forEach(([n, k, color]) => {
    const w = cw * n / tot;
    s.addShape(S.rect, { x: cx, y: cy + 0.34, w: w - 0.04, h: 0.28, fill: { color }, line: { type: 'none' } });
    cx += w;
  });
  cuenta.forEach(([n, k, color], i) => {
    const yy = cy + 0.75 + i * 0.44;
    numero(s, String(n), { x: rx, y: yy, w: 0.7, h: 0.42, fontSize: 24, valign: 'middle', color });
    T(s, k, { x: rx + 0.75, y: yy, w: rw - 0.75, h: 0.42, fontSize: 16, valign: 'middle' });
  });
  return s;
};

// =====================================================================
// 7 · LA VÍA LEGAL DECIDE SI EL NEGOCIO EXISTE · árbol de escenarios
// =====================================================================
D.regulacion = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · ENTORNO REGULATORIO', 'LA VÍA LEGAL', 'decide si el negocio existe.');
  const lw = 4.15;
  caja(s, M, Y0, lw, 1.9, { line: { color: C.accent1, width: 1 } });
  mono(s, 'LEY N° 21.793 · 14-01-2026', { x: M + 0.22, y: Y0 + 0.15, w: lw - 0.4, h: 0.3, fontSize: 12, color: C.accent1 });
  T(s, 'Faculta al MTT para autorizar talleres que transformen la propulsión de vehículos en uso.', { x: M + 0.22, y: Y0 + 0.48, w: lw - 0.4, h: 0.95, fontSize: 16 });
  marca(s, 'pen', 'REGLAMENTO SIN PUBLICAR', M + 0.22, Y0 + 1.42, { size: 11, h: 0.32 });
  caja(s, M, Y0 + 2.1, lw, 2.0, { line: { color: C.text2, width: 0.75, dashType: 'dash' } });
  mono(s, 'BORRADOR MTT · DIC. 2021', { x: M + 0.22, y: Y0 + 2.25, w: lw - 0.4, h: 0.3, fontSize: 12, color: C.text2 });
  T(s, 'Anterior a la ley. Define transformación como reemplazar el motor y excluye autos con ABS, airbag o control de estabilidad.', { x: M + 0.22, y: Y0 + 2.58, w: lw - 0.4, h: 1.4, fontSize: 16, color: C.text2 });
  // árbol de decisión
  const tx = M + lw + 0.45, bw = 2.15, bh = 0.86, ew = R - (tx + 2 * (bw + 0.55)) + 0.3;
  const q1 = [tx, Y0 + 1.45], q2 = [tx + bw + 0.55, Y0 + 0.35], q3 = [tx + bw + 0.55, Y0 + 2.65];
  const ex = q2[0] + bw + 0.55;
  const E = [[ex, Y0 - 0.05, 'E1', 'Vía amplia: protege al primero que homologa'], [ex, Y0 + 0.9, 'E2', 'Vía acotada: solo parque sin esos sistemas'], [ex, Y0 + 2.3, 'E3', 'Vía alternativa: alteración de características'], [ex, Y0 + 3.3, 'E4', 'Sin vía legal: el negocio no opera']];
  const pregunta = ([x, y], t, hot) => { caja(s, x, y, bw, bh, { fill: { color: hot ? HOT : C.background2 }, line: { color: hot ? C.accent1 : C.text2, width: hot ? 1.5 : 0.75 } }); T(s, t, { x: x + 0.12, y, w: bw - 0.24, h: bh, fontSize: 15, bold: true, valign: 'middle', align: 'center', lineSpacingMultiple: 0.92 }); };
  const conector = (a, b, k, hot) => {
    const xm = a[0] + 0.27;
    s.addShape(S.line, { x: a[0], y: a[1], w: xm - a[0], h: 0, line: { color: hot ? C.accent1 : C.text2, width: hot ? 2.25 : 1 } });
    s.addShape(S.line, { x: xm, y: a[1], w: 0, h: b[1] - a[1], line: { color: hot ? C.accent1 : C.text2, width: hot ? 2.25 : 1 } });
    s.addShape(S.line, { x: xm, y: b[1], w: b[0] - xm, h: 0, line: { color: hot ? C.accent1 : C.text2, width: hot ? 2.25 : 1, endArrowType: 'triangle' } });
    mono(s, k, { x: xm + 0.04, y: b[1] - 0.27, w: 0.4, h: 0.24, fontSize: 11, color: hot ? C.accent1 : C.text2, bold: true });
  };
  pregunta(q1, '¿Acepta conservar el motor?', true);
  pregunta(q2, '¿Excluye ABS, airbag o estabilidad?', false);
  pregunta(q3, '¿Procede alterar características?', true);
  conector([q1[0] + bw, q1[1] + bh / 2], [q2[0], q2[1] + bh / 2], 'SÍ', false);
  conector([q1[0] + bw, q1[1] + bh / 2], [q3[0], q3[1] + bh / 2], 'NO', true);
  E.forEach(([x, y, k, t], i) => {
    const hot = i >= 2;
    caja(s, x, y, ew, 0.82, { line: { color: hot ? C.accent1 : C.text2, width: hot ? 1.5 : 0.75 } });
    tag(s, k, x + 0.12, y + 0.22, { off: !hot, w: 0.5, h: 0.36, size: 13 });
    T(s, t, { x: x + 0.72, y, w: ew - 0.8, h: 0.82, fontSize: 14, valign: 'middle', lineSpacingMultiple: 0.92 });
  });
  conector([q2[0] + bw, q2[1] + bh / 2], [ex, E[0][1] + 0.41], 'NO', false);
  conector([q2[0] + bw, q2[1] + bh / 2], [ex, E[1][1] + 0.41], 'SÍ', false);
  conector([q3[0] + bw, q3[1] + bh / 2], [ex, E[2][1] + 0.41], 'SÍ', true);
  conector([q3[0] + bw, q3[1] + bh / 2], [ex, E[3][1] + 0.41], 'NO', true);
  mono(s, 'HOY, CON EL BORRADOR:', { x: tx, y: Y0 + 2.42, w: bw + 0.2, h: 0.28, fontSize: 11, color: C.accent1 });
  mono(s, 'RAMA E3 O E4', { x: tx, y: Y0 + 2.7, w: bw + 0.2, h: 0.28, fontSize: 11, color: C.accent1, bold: true });
  T(s, [{ text: 'Condición de entrada: ', options: { bold: true } }, { text: 'no se promedia.', options: { color: C.text2 } }], { x: tx, y: Y0 + 3.55, w: bw + 0.3, h: 0.55, fontSize: 15, valign: 'top' });
  return s;
};

// =====================================================================
// 8 · PORTER 3,49 · intensidad por fuerza y ponderación del modelo
// =====================================================================
D.porter = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · INDUSTRIA (CINCO FUERZAS)', 'PORTER 3,49:', 'el rival principal es posponer la inversión.');
  const lw = 8.2, x0 = M + 2.95, bw = lw - 2.95 - 0.85, sx = v => x0 + v / 5 * bw;
  mono(s, 'FUERZA · PESO', { x: M, y: Y0 - 0.05, w: 2.8, h: 0.3, fontSize: 12 });
  mono(s, 'INTENSIDAD · 0 A 5', { x: x0, y: Y0 - 0.05, w: bw, h: 0.3, fontSize: 12 });
  const f = [['Sustitutos', 30, 5.00], ['Nuevos entrantes', 20, 3.75], ['Proveedores', 15, 2.67], ['Clientes', 25, 2.64], ['Rivalidad', 10, 1.83]];
  const rh = 0.66, y0 = Y0 + 0.4;
  f.forEach(([k, p, v], i) => {
    const y = y0 + i * rh, top = i === 0;
    T(s, k, { x: M, y, w: 2.2, h: rh, fontSize: 18, bold: top, valign: 'middle' });
    mono(s, p + '%', { x: M + 2.1, y, w: 0.7, h: rh, fontSize: 13, color: C.text2, valign: 'middle', align: 'right' });
    s.addShape(S.rect, { x: x0, y: y + 0.2, w: sx(5) - x0, h: rh - 0.4, fill: { color: C.accent6 }, line: { type: 'none' } });
    s.addShape(S.rect, { x: x0, y: y + 0.2, w: sx(v) - x0, h: rh - 0.4, fill: { color: top ? C.accent1 : C.text2 }, line: { type: 'none' } });
    numero(s, coma(v.toFixed(2)), { x: sx(5) + 0.08, y, w: 0.85, h: rh, fontSize: 22, valign: 'middle', color: top ? C.accent1 : C.text1 });
  });
  const ny = y0 + 5 * rh + 0.12;
  T(s, [{ text: 'Sustitutos + clientes = 55% ', options: { bold: true } }, { text: 'del peso del modelo, no probabilidad de amenaza.', options: { color: C.text2 } }], { x: M, y: ny, w: lw, h: 0.42, fontSize: 15, valign: 'middle' });
  const rx = M + lw + 0.5, rw = R - rx;
  brillo(s, rx, Y0, rw, 1.4, 0.5);
  mono(s, 'PONDERADO · 0 A 5', { x: rx, y: Y0 - 0.05, w: rw, h: 0.3, fontSize: 12, color: C.accent1 });
  numero(s, '3,49', { x: rx, y: Y0 + 0.25, w: rw, h: 1.1, fontSize: 72, valign: 'middle', color: C.accent1 });
  T(s, 'industria moderadamente poco atractiva', { x: rx, y: Y0 + 1.35, w: rw, h: 0.4, fontSize: 15, color: C.text2 });
  cajaHot(s, rx, Y0 + 2.0, rw, YF - Y0 - 2.06);
  mono(s, 'SUSTITUTO PRINCIPAL', { x: rx + 0.22, y: Y0 + 2.15, w: rw - 0.4, h: 0.3, fontSize: 12, color: C.accent1 });
  T(s, 'Posponer la inversión', { x: rx + 0.22, y: Y0 + 2.48, w: rw - 0.4, h: 0.45, fontSize: 21, bold: true, valign: 'middle' });
  T(s, 'El cliente se ahorra el kit, pero sigue pagando toda su bencina.', { x: rx + 0.22, y: Y0 + 2.98, w: rw - 0.4, h: 1.0, fontSize: 16, color: C.text2, valign: 'top' });
  return s;
};

// =====================================================================
// 9 · RECURSOS Y FACTORES CRÍTICOS · VRIO y FCE
// =====================================================================
D.recursos = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · RECURSOS, CAPACIDADES Y FCE', 'RECURSOS Y FACTORES CRÍTICOS:', 'la diferenciación es potencial.');
  const lw = 4.6;
  mono(s, 'VRIO · 15 RECURSOS Y CAPACIDADES', { x: M, y: Y0 - 0.05, w: lw, h: 0.3, fontSize: 12 });
  const cnt = [['2', 'sostenibles*', C.accent1], ['6', 'temporales', C.text1], ['7', 'igualdad', GRIS], ['0', 'desventaja', GRIS]];
  const cw = lw / 4;
  cnt.forEach(([n, k, color], i) => {
    numero(s, n, { x: M + i * cw, y: Y0 + 0.3, w: cw, h: 0.8, fontSize: 48, valign: 'middle', color });
    T(s, k, { x: M + i * cw, y: Y0 + 1.1, w: cw + 0.1, h: 0.3, fontSize: 13, color: C.text2 });
  });
  const by = Y0 + 1.6;
  cajaHot(s, M, by, lw, YF - by - 0.04);
  mono(s, '* POTENCIALMENTE SOSTENIBLES', { x: M + 0.22, y: by + 0.15, w: lw - 0.4, h: 0.3, fontSize: 12, color: C.accent1 });
  T(s, [{ text: 'Biblioteca de calibraciones', options: { bold: true, breakLine: true } }, { text: 'Ingeniería de integración', options: { bold: true } }], { x: M + 0.22, y: by + 0.5, w: lw - 0.4, h: 0.8, fontSize: 18, valign: 'top' });
  T(s, 'La biblioteca está vacía: solo sería sostenible si se protege como secreto empresarial.', { x: M + 0.22, y: by + 1.35, w: lw - 0.4, h: 0.9, fontSize: 15, color: C.text2, valign: 'top' });
  const rx = M + lw + 0.5, rw = R - rx;
  mono(s, 'FACTORES CRÍTICOS DE ÉXITO · 1 A 5', { x: rx, y: Y0 - 0.05, w: rw, h: 0.3, fontSize: 12 });
  mono(s, 'HABILIDAD', { x: R - 2.55, y: Y0 + 0.25, w: 1.3, h: 0.26, fontSize: 11, align: 'center' });
  mono(s, 'RIESGO', { x: R - 1.25, y: Y0 + 0.25, w: 1.25, h: 0.26, fontSize: 11, align: 'center' });
  const fce = [['Ingeniería de integración y calibración', 4, 2, false], ['Estandarización y tiempo de taller', 4, 3, false], ['Logística de insumos críticos', 3, 2, false], ['Financiamiento en el punto de venta', 3, 2, true], ['Gestión regulatoria e institucional', 2, 2, true], ['Talento certificado en alta tensión', 2, 2, false]];
  const rh = 0.55, y0 = Y0 + 0.55;
  fce.forEach(([k, h, r, entrada], i) => {
    const y = y0 + i * rh;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    if (entrada) s.addShape(S.rect, { x: rx, y: y + 0.18, w: 0.08, h: rh - 0.36, fill: { color: C.text1 }, line: { type: 'none' } });
    T(s, k, { x: rx + 0.2, y, w: rw - 2.8, h: rh, fontSize: 16, bold: entrada, valign: 'middle', lineSpacingMultiple: 0.92 });
    for (let j = 1; j <= 5; j++) s.addShape(S.rect, { x: R - 2.45 + (j - 1) * 0.22, y: y + rh / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: j <= h ? (h >= 4 ? C.accent1 : C.text1) : C.accent5 }, line: { type: 'none' } });
    numero(s, String(r), { x: R - 1.25, y, w: 1.25, h: rh, fontSize: 20, align: 'center', valign: 'middle', color: r <= 2 ? C.text1 : C.text2 });
  });
  regla(s, y0 + 6 * rh, rx, rw);
  s.addShape(S.rect, { x: rx, y: y0 + 6 * rh + 0.12, w: 0.08, h: 0.2, fill: { color: C.text1 }, line: { type: 'none' } });
  T(s, 'condición de entrada · en riesgo, un número bajo es riesgo alto', { x: rx + 0.2, y: y0 + 6 * rh + 0.06, w: rw - 0.2, h: 0.32, fontSize: 13, color: C.text2, valign: 'middle' });
  return s;
};

// =====================================================================
// 10 · CADENA DE VALOR · dónde nace la exclusividad, dónde está el costo y el cuello de botella
// =====================================================================
D.cadena = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · CADENA DE VALOR', 'LA CALIBRACIÓN DA EXCLUSIVIDAD;', 'operaciones, el cuello de botella.');
  const dw = CW, x = M, y = Y0 - 0.05;
  const apoyo = [['Infraestructura de la empresa', 'CONDICIÓN DE ENTRADA', 'ent'], ['Gestión de recursos humanos', '', ''], ['Desarrollo tecnológico', 'EXCLUSIVIDAD: LA CALIBRACIÓN', 'exc'], ['Adquisiciones', '', '']];
  const ah = 0.42;
  apoyo.forEach(([k, t, tipo], i) => {
    const yy = y + i * (ah + 0.06);
    caja(s, x, yy, dw - 0.6, ah, { fill: { color: tipo === 'exc' ? HOT : C.background2 }, line: { color: tipo === 'exc' ? C.accent1 : tipo === 'ent' ? C.text1 : C.accent5, width: tipo ? 1.25 : 0.75 } });
    T(s, k, { x: x + 0.18, y: yy, w: 4.0, h: ah, fontSize: 15, bold: !!tipo, valign: 'middle' });
    if (t) mono(s, t, { x: x + 4.2, y: yy, w: dw - 0.6 - 4.4, h: ah, fontSize: 12, color: tipo === 'exc' ? C.accent1 : C.text1, valign: 'middle', align: 'right' });
  });
  const py = y + 4 * (ah + 0.06) + 0.06, ph = 1.58, n = 5, pw = (dw - 0.6) / n;
  const prim = [['Logística de entrada', 'COSTO', 'Kit importado, Clase 9 y dólar', 'costo'], ['Operaciones', 'CUELLO DE BOTELLA', 'Homologación, internación y técnicos', 'cuello'], ['Logística de salida', '', '', ''], ['Marketing y ventas', '', '', ''], ['Servicio posventa', '', '', '']];
  prim.forEach(([k, t, d, tipo], i) => {
    const xx = x + i * pw;
    s.addShape(S.chevron, { x: xx, y: py, w: pw + 0.12, h: ph, fill: { color: tipo === 'cuello' ? HOT : C.background2 }, line: { color: tipo === 'cuello' ? C.accent1 : tipo === 'costo' ? C.text1 : C.accent5, width: tipo ? 1.25 : 0.75 } });
    T(s, k, { x: xx + 0.4, y: py + 0.1, w: pw - 0.6, h: 0.5, fontSize: 14, bold: !!tipo, valign: 'top', lineSpacingMultiple: 0.9 });
    if (t) mono(s, t, { x: xx + 0.4, y: py + 0.68, w: pw - 0.5, h: 0.26, fontSize: 11, color: tipo === 'cuello' ? C.accent1 : C.text1 });
    if (d) T(s, d, { x: xx + 0.4, y: py + 0.96, w: pw - 0.55, h: 0.6, fontSize: 13, color: C.text2, valign: 'top', lineSpacingMultiple: 0.9 });
  });
  s.addShape(S.rect, { x: x + dw - 0.55, y, w: 0.55, h: py + ph - y, fill: { color: C.accent6 }, line: { color: C.accent5, width: 0.75 } });
  T(s, 'MARGEN', { x: x + dw - 0.55, y, w: 0.55, h: py + ph - y, fontFace: F_MONO, fontSize: 11, color: C.text2, align: 'center', valign: 'middle', vert: 'vert270' });
  const ey = py + ph + 0.03;
  T(s, [{ text: 'Externalizable: ', options: { bold: true } }, { text: 'contabilidad, aduana, transporte peligroso y remuneraciones.', options: { color: C.text2 } }], { x, y: ey, w: dw, h: 0.34, fontSize: 15, valign: 'middle' });
  T(s, [{ text: 'Frente a competidores en operación: ', options: { bold: true } }, { text: '3,00 en habilidades y 2,71 en riesgo (1 a 5); brecha de −1,29 y −1,43 con el líder.', options: { color: C.text2 } }], { x, y: ey + 0.36, w: dw, h: 0.34, fontSize: 15, valign: 'middle' });
  return s;
};

// =====================================================================
// 11 · FODA · interno arriba, externo abajo
// =====================================================================
D.foda = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · SÍNTESIS FODA', 'FODA:', 'fortalezas de diseño frente a amenazas decisivas.');
  const lab = 0.55, g = 0.22, w = (CW - lab - g) / 2, h = (YF - Y0 - 0.35 - g) / 2, y0 = Y0 + 0.35;
  mono(s, 'A FAVOR', { x: M + lab, y: Y0, w, h: 0.3, fontSize: 12, color: C.accent1, align: 'center' });
  mono(s, 'EN CONTRA', { x: M + lab + w + g, y: Y0, w, h: 0.3, fontSize: 12, color: C.text1, align: 'center' });
  [['INTERNO', y0], ['EXTERNO', y0 + h + g]].forEach(([k, y]) => T(s, k, { x: M, y, w: 0.4, h, fontFace: F_MONO, fontSize: 12, color: C.text2, align: 'center', valign: 'middle', vert: 'vert270' }));
  const q = [['FORTALEZAS · DE DISEÑO', ['Arquitectura trasera que conserva el motor', 'Proceso de taller en cinco etapas', 'Segmento delimitado: uso intensivo'], C.accent1, false],
    ['DEBILIDADES · DE EJECUCIÓN', ['Sin ensayo ni homologación; biblioteca vacía', 'Técnicos escasos y sin retención', 'Inventario en dólares; marca sin casos'], C.text1, false],
    ['OPORTUNIDADES', ['Se conserva el auto: 3,5 usados por cada nuevo', 'La bencina 93 subió $370 por litro en marzo', 'Baterías LFP a US$81 por kWh'], C.accent1, true],
    ['AMENAZAS', ['Ley N° 21.793 sin reglamento', 'Dólar sobre $970 y kit 100% importado', 'Menor ingreso y opción de posponer'], C.text1, true]];
  q.forEach(([k, items, color, ext], i) => {
    const x = M + lab + (i % 2) * (w + g), y = y0 + Math.floor(i / 2) * (h + g);
    caja(s, x, y, w, h, { line: { color, width: i % 2 ? 0.75 : 1.25, dashType: ext ? 'solid' : 'solid' } });
    s.addShape(S.rect, { x, y, w, h: 0.06, fill: { color }, line: { type: 'none' } });
    mono(s, k, { x: x + 0.22, y: y + 0.15, w: w - 0.4, h: 0.3, fontSize: 13, color, bold: true });
    items.forEach((t, j) => {
      const yy = y + 0.5 + j * 0.42;
      s.addShape(S.rect, { x: x + 0.22, y: yy + 0.14, w: 0.12, h: 0.12, fill: { color }, line: { type: 'none' } });
      T(s, t, { x: x + 0.45, y: yy, w: w - 0.6, h: 0.4, fontSize: 16, valign: 'middle' });
    });
  });
  return s;
};

// =====================================================================
// 12 · TRES BRECHAS PRIORITARIAS · hallazgos, no objetivos
// =====================================================================
D.brechas = () => {
  const s = contenido('6 · ANÁLISIS ESTRATÉGICO · DIAGNÓSTICO INTEGRADO', 'TRES BRECHAS', 'deciden si el negocio funciona.');
  const g = 0.3, w = (CW - 2 * g) / 3, y = Y0, h = 3.55;
  const b = [['1', 'Habilitación formal', ['Vía legal aplicable', 'Aseguradoras y plantas de revisión'], 'PEST · LEY · FCE'],
    ['2', 'Valor frente a posponer', ['Ahorro medido en autos chilenos', 'Forma de pago que el cliente pueda asumir'], 'PORTER · PEST · FODA'],
    ['3', 'Capacidad de ejecución', ['Biblioteca de calibraciones con datos', 'Técnicos en alta tensión y kit protegido del dólar'], 'VRIO · FCE · CADENA']];
  b.forEach(([n, k, items, src], i) => {
    const x = M + i * (w + g);
    if (i === 0) { brillo(s, x, y, w, h, 0.4); cajaHot(s, x, y, w, h); } else caja(s, x, y, w, h, { line: { color: C.accent1, width: 1 } });
    tag(s, n, x + 0.25, y + 0.25, { w: 0.5, h: 0.44, size: 18 });
    T(s, k, { x: x + 0.25, y: y + 0.85, w: w - 0.45, h: 0.55, fontSize: 22, bold: true, valign: 'top' });
    items.forEach((t, j) => {
      const yy = y + 1.55 + j * 0.72;
      regla(s, yy, x + 0.25, w - 0.5);
      T(s, t, { x: x + 0.25, y: yy + 0.05, w: w - 0.45, h: 0.65, fontSize: 17, valign: 'middle' });
    });
    mono(s, 'VIENE DE · ' + src, { x: x + 0.25, y: y + h - 0.42, w: w - 0.45, h: 0.3, fontSize: 11, color: C.text2 });
  });
  const by = y + h + 0.22;
  T(s, [{ text: 'Son hallazgos del diagnóstico, ', options: { bold: true } }, { text: 'no objetivos: la formulación es el Avance 2.', options: { color: C.text2 } }], { x: M, y: by, w: CW, h: 0.45, fontSize: 18, valign: 'middle' });
  return s;
};

// =====================================================================
// 13 · CIERRE · fundamentado y por demostrar
// =====================================================================
D.cierre = () => {
  const s = contenido('CIERRE · DEL DIAGNÓSTICO AL AVANCE 2', 'LO FUNDAMENTADO', 'y lo que falta demostrar.');
  const g = 0.4, w = (CW - g) / 2, y = Y0, h = 3.0;
  [['FUNDAMENTADO', ['Una necesidad real y medible', 'Una propuesta coherente con la identidad', 'Un entorno moderadamente desfavorable, con causas claras'], false],
    ['POR DEMOSTRAR', ['La vía legal', 'El ahorro, medido en autos chilenos', 'La capacidad de ejecutar'], true]].forEach(([k, items, hot], i) => {
    const x = M + i * (w + g);
    if (hot) { brillo(s, x, y, w, h, 0.4); cajaHot(s, x, y, w, h); } else caja(s, x, y, w, h, { line: { color: C.text2, width: 0.75 } });
    mono(s, k, { x: x + 0.28, y: y + 0.22, w: w - 0.5, h: 0.3, fontSize: 14, color: C.accent1, bold: true });
    items.forEach((t, j) => {
      const yy = y + 0.7 + j * 0.72;
      regla(s, yy, x + 0.28, w - 0.56);
      T(s, t, { x: x + 0.28, y: yy + 0.05, w: w - 0.56, h: 0.65, fontSize: 20, bold: hot, valign: 'middle' });
    });
  });
  const by = y + h + 0.3;
  regla(s, by, M, CW, C.accent1);
  T(s, [{ text: 'AVANCE 2  ', options: { fontFace: F_MONO, fontSize: 13, color: C.accent1 } }, { text: 'Estrategia, objetivos y Cuadro de Mando Integral', options: { bold: true } }], { x: M, y: by + 0.12, w: 8.6, h: 0.45, fontSize: 18, valign: 'middle' });
  mono(s, 'GRACIAS · ¿PREGUNTAS?', { x: R - 4, y: by + 0.12, w: 4, h: 0.45, fontSize: 18, color: C.text1, align: 'right', valign: 'middle' });
  return s;
};

// =====================================================================
// ANEXO
// =====================================================================
D.indice = (primera) => {
  const s = contenido('MATERIAL DE APOYO', 'ANEXO', 'para preguntas.');
  const rowH = 0.37, y0 = Y0 - 0.02;
  G.ANEXO.forEach((a, i) => {
    const y = y0 + i * rowH, n = primera + i;
    regla(s, y, M, CW);
    tag(s, a.codigo, M, y + 0.04, { w: 0.62, h: 0.29, size: 12, off: a.d === 'a-avance2' });
    s.addText(a.titulo, { x: M + 0.8, y, w: CW - 2.0, h: rowH, valign: 'middle', fontFace: F_BODY, fontSize: 17, color: a.d === 'a-avance2' ? C.text2 : C.text1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
    s.addText('LÁM. ' + n, { x: R - 1.1, y, w: 1.1, h: rowH, valign: 'middle', align: 'right', fontFace: F_MONO, fontSize: 13, color: C.accent1, charSpacing: 1, margin: 0, isTextBox: true, hyperlink: { slide: n, tooltip: 'Ir a ' + a.titulo } });
  });
  regla(s, y0 + G.ANEXO.length * rowH, M, CW);
  return s;
};

D['a-pest'] = () => {
  const s = contenido('PEST · INSTRUMENTO 03', 'EL PEST POR DIMENSIÓN,', 'hoy y a futuro.');
  tabla(s, [['DIMENSIÓN', 2.3], ['HOY', 0.8], ['FUTURO', 1.0], ['A FAVOR', 3.95], ['EN CONTRA', CW - 8.05]], [
    ['Político-jurídico', '2,67', '2,78', 'Ley 21.455 de carbono neutralidad (oportunidad leve)', 'Ley 21.793 sin reglamento (gran amenaza); IVA completo'],
    ['Económico', '2,38', '2,81', 'Bencina más cara; baterías LFP a US$81/kWh', 'Ingreso disponible (gran amenaza); dólar sobre $970; PIB 2026 de 0,25% a 0,75%; desempleo 9,6%'],
    ['Sociocultural', '3,00', '3,00', '3,5 usados por cada nuevo (gran oportunidad)', 'Aseguradoras excluyen vehículos modificados; pago por sostenibilidad sesgado por ingreso'],
    ['Tecnológico', '3,23', '3,38', 'Componentes maduros y estandarizados', 'Sin proveedor local de baterías'],
    ['Global', '2,82', '2,99', '13 oportunidades', '20 amenazas · 18 neutros'],
  ], Y0 - 0.05, { rh: 0.78, size: 14, negrita: [0], gris: [3, 4], derecha: [1, 2] });
  return s;
};

D['a-porter'] = () => {
  const s = contenido('CINCO FUERZAS · INSTRUMENTO 02', 'EL 3,49', 'es peso por intensidad.');
  tabla(s, [['FUERZA', 2.6], ['PESO', 1.0], ['INTENSIDAD', 1.5], ['PESO × INTENSIDAD', 2.2], ['LECTURA', CW - 7.3]], [
    ['Sustitutos', '30%', '5,00', '1,50', 'Posponer la inversión; híbrido usado'],
    ['Nuevos entrantes', '20%', '3,75', '0,75', 'La barrera regulatoria hoy bloquea a todos por igual'],
    ['Clientes', '25%', '2,64', '0,66', 'Sensibles al precio por falta de liquidez'],
    ['Proveedores', '15%', '2,67', '0,40', 'Componentes estandarizados e importados'],
    ['Rivalidad', '10%', '1,83', '0,18', 'Nadie ofrece hoy el servicio'],
    ['Total', '100%', '—', '3,49', 'Industria moderadamente poco atractiva'],
  ], Y0 - 0.05, { rh: 0.62, size: 16, negrita: [0], gris: [4], derecha: [1, 2, 3] });
  return s;
};

D['a-vrio'] = () => {
  const s = contenido('RECURSOS Y CAPACIDADES · INSTRUMENTO 05', 'QUINCE RECURSOS Y CAPACIDADES,', 'cuatro filtros.');
  tabla(s, [['RECURSO O CAPACIDAD', 6.5], ['TIPO', 2.2], ['CONSECUENCIA', CW - 8.7]], [
    ['Biblioteca de calibraciones por marca y modelo', 'Recurso intangible', 'Sostenible (potencial)'],
    ['Ingeniería de integración y calibración', 'Capacidad', 'Sostenible (potencial)'],
    ['Formación interna en proceso y calibración', 'Capacidad', 'Temporal'],
    ['Homologación por par modelo-kit', 'Recurso', 'Temporal'],
    ['Autorización del taller', 'Recurso', 'Temporal'],
    ['Técnicos con licencia SEC', 'Recurso', 'Temporal'],
    ['Gestión regulatoria e institucional', 'Capacidad', 'Temporal'],
    ['Diagnóstico previo y posventa', 'Capacidad', 'Temporal'],
    ['Taller, kit, convenio financiero y cuatro más', '7 elementos', 'Igualdad'],
  ], Y0 - 0.1, { rh: 0.44, size: 15, gris: [1] });
  return s;
};

D['a-fce'] = () => {
  const s = contenido('FACTORES CRÍTICOS DE ÉXITO · INSTRUMENTO 06', 'SEIS FACTORES CRÍTICOS,', 'dos son condición de entrada.');
  tabla(s, [['FACTOR · LÍNEA DEL 06', 4.6], ['HAB.', 0.8], ['RIESGO', 1.0], ['ESTADO', CW - 6.4]], [
    ['Gestión regulatoria e institucional · infraestructura', '2', '2', 'Sin interlocución formal con la autoridad · condición de entrada'],
    ['Financiamiento en el punto de venta · finanzas', '3', '2', 'Sin convenio · condición de entrada'],
    ['Ingeniería de integración y calibración · fabricación', '4', '2', 'Diseñada; riesgo de incompatibilidad con la electrónica original'],
    ['Talento certificado en alta tensión · RR. HH.', '2', '2', 'Perfil escaso; sin esquema de retención'],
    ['Logística de insumos críticos · adquisiciones', '3', '2', 'Protocolo definido; Clase 9 con plazos largos'],
    ['Estandarización y tiempo de taller · procesos', '4', '3', 'Cinco etapas definidas; no probadas'],
  ], Y0 - 0.05, { rh: 0.64, size: 15, gris: [3], derecha: [1, 2] });
  return s;
};

D['a-competidores'] = () => {
  const s = contenido('COMPARACIÓN COMPETITIVA · INSTRUMENTO 06', 'FRENTE A COMPETIDORES EN OPERACIÓN,', 'todo sale debilidad.');
  const labels = ['Conversión GLP', 'Eléctricos nuevos', 'Reborn*', 'Movener*', 'Híbridos usados', 'Lumine', 'Líder'];
  s.addChart(pres.ChartType.bar, [
    { name: 'Habilidades', labels, values: [3.86, 3.86, 3.86, 3.71, 3.57, 3.00, 4.29] },
    { name: 'Factores de riesgo', labels, values: [4.00, 3.43, 3.71, 3.43, 3.43, 2.71, 4.14] },
  ], {
    x: M - 0.1, y: Y0 + 0.3, w: 8.4, h: 3.9, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60,
    chartColors: [HEX.accent1, HEX.dk2], valAxisMinVal: 1, valAxisMaxVal: 5,
    catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: F_BODY, catAxisLabelFontSize: 13,
    valAxisLabelColor: HEX.dk2, valAxisLabelFontSize: 12, valAxisLabelFontFace: F_BODY, valGridLine: { color: HEX.accent5, size: 0.5 }, catGridLine: { style: 'none' },
    showValue: true, dataLabelFontSize: 12, dataLabelFontFace: F_CON, dataLabelColor: HEX.dk1, dataLabelFormatCode: '0.00',
    showLegend: true, legendPos: 't', legendFontSize: 13, legendColor: HEX.dk1, legendFontFace: F_BODY,
    chartArea: { fill: { color: HEX.lt1 } }, plotArea: { fill: { color: HEX.lt1 } },
  });
  const rx = M + 8.6, rw = R - rx;
  [['Por qué todo sale debilidad', 'Se compara una empresa preoperativa con actores en operación.'], ['El líder no es real', 'Es el máximo de cada área entre los competidores.'], ['Qué se usa en el FODA', 'Las fortalezas puntuales (puntaje 4 o más), no el promedio.']].forEach(([k, t], i) => {
    const y = Y0 + 0.2 + i * 1.3;
    regla(s, y, rx, rw, i ? C.accent5 : C.accent1);
    mono(s, k.toUpperCase(), { x: rx, y: y + 0.1, w: rw, h: 0.3, fontSize: 11, color: C.accent1 });
    T(s, t, { x: rx, y: y + 0.42, w: rw, h: 0.8, fontSize: 15, valign: 'top' });
  });
  return s;
};

D['a-foda'] = () => {
  const s = contenido('FODA · CON SU EVIDENCIA', 'EL FODA COMPLETO,', 'factor por factor.');
  const q = [['FORTALEZAS', ['Arquitectura en el eje trasero que conserva el motor (diseño)', 'Proceso de taller en cinco etapas (definido, no probado)', 'Segmento delimitado y estrategia de producto única', 'Riesgos identificados con protocolo de contención']],
    ['DEBILIDADES', ['Sin ensayo ni homologación; biblioteca de calibraciones vacía', 'Técnicos escasos y sin esquema de retención', 'Patrimonio reducido; inventario en dólares sin cobertura', 'Marca sin casos; validación cualitativa con n = 3']],
    ['OPORTUNIDADES', ['3,5 usados transferidos por cada nuevo (CAVEM, ene-ago 2026)', 'Bencina 93 en la RM de $1.169 a $1.539 (CNE, marzo de 2026)', 'Baterías LFP a US$81/kWh (BloombergNEF, 2025)', 'Ocupación informal en transporte +8,6% en 12 meses (INE)']],
    ['AMENAZAS', ['Ley N° 21.793 sin reglamento; borrador de 2021 sin vía', 'Dólar observado sobre $970 con kit importado (Banco Central)', 'PIB 2026 de 0,25% a 0,75%; desempleo 9,6% (BCCh, INE)', 'Posponer la inversión; aseguradoras excluyen modificados']]];
  const g = 0.25, w = (CW - g) / 2, h = (YF - Y0 - g) / 2;
  q.forEach(([k, items], i) => {
    const x = M + (i % 2) * (w + g), y = Y0 + Math.floor(i / 2) * (h + g);
    caja(s, x, y, w, h, { line: { color: i % 2 ? C.text2 : C.accent1, width: 0.75 } });
    mono(s, k, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.28, fontSize: 12, color: C.accent1 });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })), { x: x + 0.2, y: y + 0.42, w: w - 0.35, h: h - 0.5, fontSize: 14, valign: 'top', paraSpaceAfter: 3 });
  });
  return s;
};

D['a-identidad'] = () => {
  const s = contenido('DECLARACIONES · TEXTOS LITERALES', 'MISIÓN, VISIÓN Y VALORES', 'completos.');
  T(s, [{ text: 'MISIÓN  ', options: { fontFace: F_MONO, fontSize: 12, color: C.accent1 } }, { text: '«Reducir el combustible que un vehículo liviano a combustión necesita por kilómetro, mediante la instalación certificada de un sistema de hibridación aditiva sobre el automóvil que el cliente ya tiene, sin reemplazarlo y sin intervenir su motor.»' }], { x: M, y: Y0, w: CW, h: 0.95, fontSize: 16, valign: 'top' });
  T(s, [{ text: 'VISIÓN  ', options: { fontFace: F_MONO, fontSize: 12, color: C.accent1 } }, { text: '«Ser hacia 2031 el taller de referencia en hibridación de vehículos en uso en Chile, con un procedimiento reconocido por la autoridad, las plantas de revisión técnica y las compañías de seguros.»' }], { x: M, y: Y0 + 1.0, w: CW, h: 0.75, fontSize: 16, valign: 'top' });
  const w = (CW - 0.4) / 2, y = Y0 + 1.9;
  [['VALORES ORGANIZACIONALES', ['Verificabilidad antes que afirmación', 'Formalidad como condición de operación', 'Trazabilidad del conocimiento técnico', 'Responsabilidad sobre el ciclo completo del componente']], ['VALORES HUMANOS', ['Honestidad técnica en el diagnóstico', 'Seguridad de quien instala y de quien conduce', 'Responsabilidad individual sobre la instalación ejecutada', 'Reconocimiento del oficio técnico']]].forEach(([k, items], i) => {
    const x = M + i * (w + 0.4);
    regla(s, y, x, w, C.accent1);
    mono(s, k, { x, y: y + 0.08, w, h: 0.3, fontSize: 12, color: C.accent1 });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })), { x, y: y + 0.45, w, h: 2.0, fontSize: 16, valign: 'top', paraSpaceAfter: 3 });
  });
  return s;
};

D['a-fuentes'] = () => {
  const s = contenido('FUENTES PÚBLICAS · APA', 'DE DÓNDE SALE', 'cada cifra pública.');
  const refs = [
    'Banco Central de Chile. (2026, 9 de septiembre). Informe de Política Monetaria, septiembre 2026. https://www.bcentral.cl',
    'Banco Central de Chile. (2026). Dólar observado, serie diaria (30-09-2026: $970,46). Base de Datos Estadísticos.',
    'BloombergNEF. (2025, 9 de diciembre). Lithium-ion battery pack prices fall to $108 per kilowatt-hour. https://about.bnef.com',
    'Cámara de Comercio Automotriz de Chile [CAVEM]. (2026). Informe del mercado automotor, enero a agosto de 2026 (citado en Redimin).',
    'Comisión Nacional de Energía [CNE]. (2026). Bencina en Línea. Citado en «Combustibles se disparan…», Emol, 24 de marzo de 2026.',
    'Instituto Nacional de Estadísticas [INE]. (2026, 30 de septiembre). Boletín estadístico: empleo trimestral, n.º 335 (junio-agosto 2026).',
    'Ley N° 21.793. (2026, 14 de enero). Diario Oficial de la República de Chile.',
  ];
  T(s, refs.map((t, j) => ({ text: t, options: { breakLine: j < refs.length - 1 } })), { x: M, y: Y0 - 0.05, w: CW, h: 3.6, fontSize: 14, valign: 'top', paraSpaceAfter: 6, lineSpacingMultiple: 0.98 });
  marca(s, 'no', 'NO SE USA: «EMPLEO EN TRANSPORTE +9,7%» · SIN FUENTE CHILENA VERIFICABLE', M, YF - 0.42, { size: 11, h: 0.36 });
  return s;
};

D['a-supuestos'] = () => {
  const s = contenido('TRANSPARENCIA · NATURALEZA DE CADA AFIRMACIÓN', 'DATO, INSTRUMENTO, ESTIMACIÓN', 'o por confirmar.');
  const cols = [['DATO PÚBLICO', ['Usados por cada nuevo', 'Precio de la bencina', 'Dólar, PIB y desempleo', 'Ley N° 21.793 sin reglamento'], { color: C.accent1, width: 1.25 }],
    ['INSTRUMENTO DEL EQUIPO', ['PEST 2,82 y Porter 3,49', 'VRIO 2 de 15 y FCE', 'Cadena de valor 3,00 / 2,71', 'Escenarios E1 a E4'], { color: C.text1, width: 1, dashType: 'sysDot' }],
    ['ESTIMACIÓN O INDICIO', ['Hasta 20% menos bencina en ciudad', 'Precio decide, confianza atreve (n = 3)'], { color: GRIS, width: 1, dashType: 'dash' }],
    ['POR CONFIRMAR', ['Convenios de financiamiento y seguros', 'Homologación y autorización', 'Precio y costos unitarios'], { color: C.text1, width: 1.25, dashType: 'dash' }]];
  const g = 0.25, w = (CW - 3 * g) / 4, h = YF - Y0 - 0.06;
  cols.forEach(([k, items, ln], i) => {
    const x = M + i * (w + g);
    caja(s, x, Y0, w, h, { line: ln });
    mono(s, k, { x: x + 0.2, y: Y0 + 0.2, w: w - 0.4, h: 0.5, fontSize: 12, bold: true, color: ln.color === C.accent1 ? C.accent1 : C.text1 });
    items.forEach((t, j) => {
      const yy = Y0 + 0.85 + j * 0.8;
      regla(s, yy, x + 0.2, w - 0.4);
      T(s, t, { x: x + 0.2, y: yy + 0.05, w: w - 0.4, h: 0.7, fontSize: 16, valign: 'middle' });
    });
  });
  return s;
};

D['a-word'] = () => {
  const s = contenido('COHERENCIA CON EL INFORME', 'CADA LÁMINA', 'tiene su apartado en el Word.');
  tabla(s, [['LÁMINA', 4.4], ['APARTADO DEL WORD', 3.3], ['EVIDENCIA O ANEXO', CW - 7.7]], [
    ['2 · Contexto y problema', '3. Introducción', 'A8 · fuentes públicas'],
    ['3 y 4 · Kit, cliente y modelo', '4.1 a 4.3', 'A9 · supuestos'],
    ['5 · Misión, visión y valores', '5.1 a 5.3', 'A7 · textos literales'],
    ['6 y 7 · PEST y regulación', '6.2 Entorno general', 'A1 · PEST'],
    ['8 · Cinco fuerzas', '6.3 Industria', 'A2 · cálculo'],
    ['9 · Recursos y FCE', '6.4 Capacidades', 'A3 · VRIO · A4 · FCE'],
    ['10 · Cadena de valor', '6.4 Cadena de valor', 'A5 · competidores'],
    ['11 y 12 · FODA y brechas', '6.5 y 6.6', 'A6 · FODA con evidencia'],
  ], Y0 - 0.08, { rh: 0.47, size: 15, gris: [2] });
  return s;
};

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
D['a-avance2'] = () => {
  const s = contenido('RESPALDO AVANCE 2', 'MAPA ESTRATÉGICO PRELIMINAR,', 'no se expone en el Avance 1.');
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


// ---------- orden de la exposición (guion.js), notas del orador y anexo ----------
const nota = x => `${x.quien.toUpperCase()} · ${G.mmss(G.segundos(x.texto))} a ${G.PALABRAS_POR_MINUTO} palabras por minuto (${G.palabras(x.texto)} palabras) · Informe: ${x.seccion}\n\n${x.texto}`;
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
D.indice(INDICE_ANEXO + 1).addNotes('ANEXO · No se expone. Cada pregunta tiene un enlace a su respuesta; cada lámina del anexo tiene un enlace de vuelta a este índice.');
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
