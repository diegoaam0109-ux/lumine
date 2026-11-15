// Word del guion de la Solemne 2 (versión del equipo + láminas 05 a 08): node guion-base-docx.js ../Lumine_TIG_Avance2_Guion.docx
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak, Footer, PageNumber, TabStopType } = require('docx');
const g = require('./guion-base.js');
const OUT = process.argv[2] || '../Lumine_TIG_Avance2_Guion.docx';
const AZUL = '0A6F9E', GRIS = '5F6B70', LINEA = 'C9D3D8', FONDO = 'EAF5FB', ANCHO = 9360;
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const p = (text, o = {}) => new Paragraph({ spacing: { before: o.before || 0, after: o.after ?? 120, line: o.line ?? 300 }, children: [new TextRun({ text, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color })] });
const borde = { style: BorderStyle.SINGLE, size: 4, color: LINEA };
const celda = (t, w, head, bold) => new TableCell({ borders: { top: borde, bottom: borde, left: borde, right: borde }, width: { size: w, type: WidthType.DXA },
  shading: head ? { fill: FONDO, type: ShadingType.CLEAR, color: 'auto' } : undefined, margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({ children: [new TextRun({ text: String(t), bold: head || bold, size: 20, color: head ? AZUL : undefined })] })] });
const tabla = (cols, fs2) => new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: cols.map(c => c[1]),
  rows: [new TableRow({ tableHeader: true, children: cols.map(([k, w]) => celda(k, w, true)) }), ...fs2.map(f => new TableRow({ children: f.map((v, j) => celda(v, cols[j][1], false, f[0] === 'Total')) }))] });

// bloques de expositor consecutivos
const bloques = [];
filas.forEach(x => { const b = bloques[bloques.length - 1]; if (b && b.quien === x.quien) b.f.push(x); else bloques.push({ quien: x.quien, f: [x] }); });
const pal = f => f.reduce((s, x) => s + g.palabras(x.texto), 0);

const H = [];
H.push(p('LUMINE MOTORS · CONTROL DE GESTIÓN · ICMA901 · SECCIÓN 500 · NRC 4118', { size: 18, color: GRIS, after: 60 }));
H.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'Guion · Solemne 2 · Avance 2 del TIG' })] }));
H.push(p('Versión con Declaraciones, Entorno, Cinco fuerzas y Cruces del FODA. Coherente con el informe del Avance 2 del 15-11-2026. Profesor Leonardo Lizana Contreras.', { italics: true, color: AZUL, after: 200 }));
H.push(p(`Guion listo para decir, lámina por lámina: ${filas.length} láminas y ${total.toLocaleString('es-CL')} palabras, unos ${min(total)} de texto a ${g.PALABRAS_POR_MINUTO} palabras por minuto y cerca de 13 minutos con los cambios de turno, dentro de los 15. La pauta pide no leer: ensayen con este texto y expongan con la nota breve que va en el PowerPoint.`));
H.push(tabla([['Expositor', 3000], ['Láminas', 2760], ['Palabras', 1600], ['Tiempo', 2000]],
  [...bloques.map(b => [b.quien, b.f.length > 1 ? `${b.f[0].n} a ${b.f[b.f.length - 1].n}` : String(b.f[0].n), pal(b.f), min(pal(b.f))]), ['Total', '', total, min(total)]]));
bloques.forEach((b, k) => {
  H.push(new Paragraph({ children: [new PageBreak()] }));
  const rango = b.f.length > 1 ? `láminas ${b.f[0].n} a ${b.f[b.f.length - 1].n}` : `lámina ${b.f[0].n}`;
  H.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `${b.quien} · ${rango} · ${min(pal(b.f))}` + (k === bloques.length - 1 ? ' · cierre' : '') })] }));
  b.f.forEach(x => {
    H.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, tabStops: [{ type: TabStopType.RIGHT, position: ANCHO }],
      children: [new TextRun({ text: `Lámina ${x.n} · ${x.titulo}` }), new TextRun({ text: `\t${g.mmss(g.segundos(x.texto))}`, color: GRIS, bold: false })] }));
    H.push(new Paragraph({ spacing: { after: 120, line: 336 }, children: [new TextRun({ text: x.texto, size: 24 })] }));
    const nb = (k2, t) => new Paragraph({ spacing: { after: 30, line: 260 }, indent: { left: 240 }, children: [new TextRun({ text: k2 + '  ', bold: true, size: 18, color: AZUL }), new TextRun({ text: t, size: 19, color: GRIS })] });
    H.push(nb('IDEA', x.idea), nb('EVIDENCIA', x.evidencia), nb('CONCEPTO', x.concepto), nb('TRANSICIÓN', x.transicion));
    H.push(p('', { after: 120 }));
  });
});
const doc = new Document({
  creator: 'Diego Alarcón, Benjamín Torres y Lukas Verdugo', title: 'Guion · Solemne 2 · Lumine Motors',
  styles: { default: { document: { run: { font: 'Arial', size: 22 } } }, paragraphStyles: [
    { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 44, bold: true, color: '111111' }, paragraph: { spacing: { after: 120 } } },
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: AZUL }, paragraph: { spacing: { before: 120, after: 160 }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '111111' }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINEA, space: 4 } } } },
  ] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Guion · Solemne 2 · Lumine Motors · página ', size: 16, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS })] })] }) },
    children: H }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('listo', OUT); });
