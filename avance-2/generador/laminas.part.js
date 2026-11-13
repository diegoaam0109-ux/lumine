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
