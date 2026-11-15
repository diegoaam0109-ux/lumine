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
    mono(s, cod, { x, y, w: 0.4, h: RH, fontSize: 11, bold: true, color: K.cel, valign: 'middle', charSpacing: 0 });
    T(s, t, { x: x + 0.4, y, w: w + 0.14, h: RH, fontSize: Z, valign: 'middle' });
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
  [['Cr1', 'Reporte de consumo'], ['Cr2', 'Calibración propia'], ['Cr3', 'Cuota comparable'], ['Cr4', 'Garantía escrita']].forEach(([k, t], i) => item(tx0, sy + 0.55 + i * 0.36, k, t, tw));
  mono(s, 'ALIVIADORES', { x: cx + 0.34, y: cy + 0.1, w: 2, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  const yr = [cy + 0.42, cy + 0.78, cy + 1.14, cy + 1.5];
  [['Al1', 'Hasta −20% bencina'], ['Al2', 'No cambia de auto'], ['Al3', 'Respaldo formal'], ['Al4', 'Ahorro medido']].forEach(([k, t], i) => item(tx0, yr[i], k, t, tw));
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
    item(xFila(y), y, `Ag${i + 1}`, t, 2.2);
  });
  mono(s, 'FRUSTRACIONES', { x: xFila(oy + 0.1), y: oy + 0.1, w: 1.8, h: 0.24, fontSize: 11, bold: true, color: K.tx });
  ['La bencina sube', 'Sin capital para cambiar', 'Teme perder el seguro', 'No sabe cuánto ahorra'].forEach((t, i) => {
    const y = yr[i], x = xFila(y);
    item(x, y, `Fr${i + 1}`, t, 2.25);
    flecha(s, x - 0.08, y + RH / 2, sx + sq + 0.08, y + RH / 2, K.cel, 1.5);
  });
  // trabajos: en la parte ancha de la cuña derecha
  mono(s, 'TRABAJOS', { x: ox + 0.95, y: oy - 0.5, w: 1.0, h: 0.22, fontSize: 11, bold: true, color: K.tx });
  ['Muchos km', 'Costo por km'].forEach((t, i) => T(s, t, { x: ox + 0.95, y: oy - 0.22 + i * 0.3, w: 1.05, h: 0.28, fontSize: 12, valign: 'middle' }));
  flecha(s, sx + sq + 0.3, oy - 0.3, ox - r - 0.3, oy - 0.3, K.tx, 1.25, { doble: true });
  fuente(s, 'Osterwalder et al. (2014) · Investigación del equipo · Al1: techo de ingeniería');
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
  mono(s, 'MEFE · 7 OPORTUNIDADES Y 9 AMENAZAS PRIORIZADAS', { x: xR, y: Y0, w: wR + 0.2, h: 0.28, bold: true, color: K.azul });
  regla(s, xR + 0.1, Y0 + 2.35, wR - 0.2, [{ v: 2.03, n: '2,03', t: 'HOY' }, { v: 2.75, n: '2,75', t: 'ESCENARIO', color: K.cel, hueco: true, dash: 'dash' }], { alto: 1.45 });
  T(s, [{ text: 'Mayor peso: ', options: { bold: true } }, { text: 'O3 vacío de oferta formal y Am1 sin norma propia no se vende (0,079 cada uno).' }], { x: xR, y: Y0 + 3.05, w: wR + 0.2, h: 0.65, fontSize: 16 });
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
  celda(0, 0, 'FO', [['FO1', 'Calibración para tu modelo'], ['FO2', 'Ejecutar el proyecto experimental'], ['FO3', 'Licenciar tras el proyecto experimental']], false);
  celda(0, 1, 'DO', [['DO1', 'Medir el ahorro en el proyecto experimental'], ['DO2', 'Expediente del primer par'], ['DO3', 'Cuotas con un financista']], true);
  celda(1, 0, 'FA', [['FA1', 'Mismo auto, sin enchufe ni límite de antigüedad'], ['FA2', 'Habilita y franquicia SENCE']], false);
  celda(1, 1, 'DA', [['DA1', 'Cobertura cambiaria'], ['DA2', 'Convenios con casos medidos'], ['DA3', 'Proteger las calibraciones']], true);
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
