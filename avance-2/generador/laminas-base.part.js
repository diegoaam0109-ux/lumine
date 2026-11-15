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
