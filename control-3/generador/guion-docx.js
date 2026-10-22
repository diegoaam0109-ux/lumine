// Escribe el guion del Control 3 en Word desde guion.js: node guion-docx.js ../Lumine_Control3_Guion.docx
// Misma fuente que las notas del orador. Tamaño carta, Arial: se lee y se imprime en cualquier equipo.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak, Footer, PageNumber, TabStopType } = require('docx');
const g = require('./guion.js');

const OUT = process.argv[2] || '../Lumine_Control3_Guion.docx';
const AZUL = '0A6F9E', GRIS = '5F6B70', LINEA = 'C9D3D8', FONDO = 'EAF5FB', ANCHO = 9360;
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const objetivo = { [g.DIEGO]: '4:42', [g.BENJA]: '4:30', [g.LUKAS]: '4:38' };
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);

const p = (text, o = {}) => new Paragraph({ spacing: { before: o.before || 0, after: o.after ?? 120, line: o.line ?? 300 }, alignment: o.align, children: [new TextRun({ text, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color })] });
const borde = { style: BorderStyle.SINGLE, size: 4, color: LINEA };
function tabla(cols, filasT, o = {}) {
  const celda = (t, w, head, bold) => new TableCell({
    borders: { top: borde, bottom: borde, left: borde, right: borde }, width: { size: w, type: WidthType.DXA },
    shading: head ? { fill: FONDO, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: String(t), bold: head || bold, size: 19, color: head ? AZUL : undefined })] })],
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: cols.map(c => c[1]),
    rows: [new TableRow({ tableHeader: true, children: cols.map(([k, w]) => celda(k, w, true)) }),
      ...filasT.map(f => new TableRow({ children: f.map((v, j) => celda(v, cols[j][1], false, o.negrita && o.negrita(f))) }))],
  });
}

const hijos = [];
hijos.push(p('LUMINE MOTORS · CONTROL DE GESTIÓN · ICMA901 · SECCIÓN 500 · NRC 4118', { size: 18, color: GRIS, after: 60 }));
hijos.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'Guion · Control 3 · Avance 1 del TIG' })] }));
hijos.push(p('Comprensión del negocio y análisis estratégico de Lumine Motors. Profesor Leonardo Lizana Contreras · martes 27 de octubre de 2026, 15:00.', { italics: true, color: AZUL, size: 22, after: 200 }));
hijos.push(p(`Exposición de máximo 15 minutos: ${filas.length} láminas y ${total.toLocaleString('es-CL')} palabras, unos ${min(total)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto, con algo más de un minuto de margen. Diego abre y cierra. Los cambios de expositor están escritos en el texto. El mismo guion va en las notas del orador del PowerPoint.`));
hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Hoja de control de tiempos' })] }));
hijos.push(tabla([['Lámina', 3300], ['Expositor', 1300], ['Apartado del informe', 2460], ['Palabras', 1150], ['Tiempo', 1150]],
  [...filas.map(x => [`${x.n} · ${x.titulo}`, x.quien.split(' ')[0], x.seccion, g.palabras(x.texto), g.mmss(g.segundos(x.texto))]),
    ['Total', '', '', total.toLocaleString('es-CL'), min(total)]], { negrita: f => f[0] === 'Total' }));
hijos.push(p('', { after: 80 }));
hijos.push(tabla([['Expositor', 2600], ['Láminas', 2160], ['Palabras', 1500], ['Tiempo estimado', 1600], ['Objetivo', 1500]],
  quienes.map(q => { const f = filas.filter(x => x.quien === q), pal = f.reduce((s, x) => s + g.palabras(x.texto), 0); return [q, f.map(x => x.n).join(', '), pal, min(pal), objetivo[q]]; })));
hijos.push(p('Cómo ensayar: cronometren el recorrido completo, con los cambios de turno incluidos. 130 palabras por minuto es un ritmo de conversación pausada; si alguien se pasa, recorta en su parte, no en la del siguiente. Las cifras se dicen como están en el guion (por ejemplo, «dos coma ochenta y dos»).', { color: GRIS, size: 20, before: 160 }));

let anterior = null;
filas.forEach(x => {
  if (x.quien !== anterior) {
    const f = filas.filter(y => y.quien === x.quien), pal = f.reduce((s, y) => s + g.palabras(y.texto), 0);
    hijos.push(new Paragraph({ children: [new PageBreak()] }));
    hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: x.quien + (anterior ? '' : ' · abre') + (x.d === 'cierre' ? ' · cierre' : '') })] }));
    if (x.d !== 'cierre') hijos.push(p(`Láminas ${f.filter(y => y.d !== 'cierre').map(y => y.n).join(', ')} · unos ${min(pal)} en total (${pal} palabras).`, { color: GRIS, size: 20, after: 160 }));
    anterior = x.quien;
  }
  hijos.push(new Paragraph({
    heading: HeadingLevel.HEADING_2, keepNext: true, tabStops: [{ type: TabStopType.RIGHT, position: ANCHO }],
    children: [new TextRun({ text: `${x.n} · ${x.titulo}` }), new TextRun({ text: `\t${g.mmss(g.segundos(x.texto))}`, color: GRIS, bold: false })],
  }));
  hijos.push(p(`Informe: ${x.seccion}`, { size: 18, color: GRIS, after: 60 }));
  hijos.push(new Paragraph({ spacing: { after: 240, line: 336 }, children: [new TextRun({ text: x.texto, size: 24 })] }));
});

const doc = new Document({
  creator: 'Diego Alarcón, Benjamín Torres y Lukas Verdugo', title: 'Guion · Control 3 · Avance 1 del TIG · Lumine Motors',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 44, bold: true, color: '111111' }, paragraph: { spacing: { after: 120 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: AZUL }, paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '111111' }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINEA, space: 4 } } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Guion · Control 3 · Lumine Motors · página ', size: 16, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS })] })] }) },
    children: hijos,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('listo', OUT); });
