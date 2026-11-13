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
