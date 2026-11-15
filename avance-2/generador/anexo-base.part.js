// ===================================================================== BIBLIOGRAFÍA
const REFS = [
  'Anthony, R. N., y Govindarajan, V. (2003). Sistemas de control de gestión. McGraw-Hill.',
  'Autofact. (2026, 25 de marzo). Los autos eléctricos más baratos en Chile en 2026.',
  'Banco Central de Chile. (2026a). Informe de Política Monetaria, septiembre 2026.',
  'BioBioChile. (2026, 24 de marzo). GLP o bencina: lo que debes tener en cuenta si estás considerando cambiarte al gas vehicular.',
  'BloombergNEF. (2025, 9 de diciembre). Lithium-ion battery pack prices fall to $108 per kilowatt-hour despite rising metal prices.',
  'CNN Chile. (2026, septiembre). Mercado automotriz nacional creció 2,9% en agosto y acumula casi un millón de operaciones este 2026.',
  'Collis, D. J., y Rukstad, M. G. (2008). Can you say what your strategy is? Harvard Business Review, 86(4), 82–90.',
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
  'Simons, R. (1995). Levers of control: How managers use innovative control systems to drive strategic renewal. Harvard Business School Press.',
];
const biblio = (parte, refs) => () => {
  const s = contenido(`BIBLIOGRAFÍA · APA 7 · ${parte}`, 'BIBLIOGRAFÍA', null);
  T(s, refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1, paraSpaceAfter: 7 } })), { x: M, y: 1.7, w: CW, h: 4.95, fontSize: 13, color: K.tx });
  fuente(s, 'APA 7 · Enlaces completos en la bibliografía del informe');
  return s;
};
D.biblio1 = biblio('1 DE 2', REFS.slice(0, 12));
D.biblio2 = biblio('2 DE 2', REFS.slice(12));

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
    ['E1 · base', 'Se publica una norma propia sin exclusiones', 'Ninguno bloqueado', 'Avanzar par por par; evaluar las estrategias FO con la evidencia del proyecto experimental'],
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
  bloque(x0, y0, w, hT, 'SOCIOS CLAVE', ['Proveedores del kit (motores, batería de litio-titanato, unidad de control)', 'Aseguradoras y plantas de revisión técnica', 'Entidad financiera', 'Talleres de la red (desde el tercer año)']);
  bloque(x0 + w, y0, w, hT / 2, 'ACTIVIDADES', ['Diagnóstico de compatibilidad', 'Instalación y calibración por modelo', 'Homologación por par modelo-kit'], { size: 12 });
  bloque(x0 + w, y0 + hT / 2, w, hT / 2, 'RECURSOS', ['Biblioteca y base de consumo medido', 'Estimador y Lumine Habilita', 'Técnicos en alta tensión'], { size: 12 });
  bloque(x0 + 2 * w, y0, w, hT, 'PROPUESTA DE VALOR', ['Ahorrar combustible con el mismo auto, sin tocar el motor', 'Calibración para su modelo', 'Ahorro medido, no prometido', 'Respaldo formal ante el seguro y la revisión técnica'], { azul: true, size: 14 });
  bloque(x0 + 3 * w, y0, w, hT / 2, 'RELACIÓN', ['Diagnóstico previo y reporte de ahorro', 'Seguimiento posventa', 'Recomendación entre conductores'], { size: 12 });
  bloque(x0 + 3 * w, y0 + hT / 2, w, hT / 2, 'CANALES', ['Canal digital con estimador', 'Acuerdos con líneas de colectivos', 'Taller propio; luego la red'], { size: 12 });
  bloque(x0 + 4 * w, y0, w, hT, 'SEGMENTOS', ['Conductores de uso laboral de la RM: taxis, colectivos y autos de aplicación de jornada completa', 'Talleres que licencian el método (segunda línea, desde el tercer año)']);
  bloque(x0, y0 + hT, CW / 2, hB, 'COSTOS', ['Kit importado, pagado en dólares · personal técnico y formación', 'Calibración y homologación por modelo · taller y reciclaje de baterías']);
  bloque(x0 + CW / 2, y0 + hT, CW / 2, hB, 'INGRESOS', ['Venta e instalación del kit Esencial o Plus · posventa y recalibración', 'Red de talleres: incorporación, cuota y Lumine Habilita, sin cobro por kit']);
  fuente(s, 'Adaptado de Osterwalder y Pigneur (2010) · Informe, anexo A');
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
