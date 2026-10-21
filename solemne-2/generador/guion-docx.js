// Escribe el guion en Word desde guion.js: node guion-docx.js ../Lumine_Solemne2_Guion.docx
// Misma fuente que las notas del orador (deck.js) y GUION.md (guion-md.js). Tamaño carta, Arial (se lee en cualquier equipo).
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, PageBreak, Footer, PageNumber, LevelFormat, TabStopType,
} = require('docx');
const g = require('./guion.js');

const OUT = process.argv[2] || '../Lumine_Solemne2_Guion.docx';
const AZUL = '0A6F9E', GRIS = '5F6B70', LINEA = 'C9D3D8', FONDO = 'EAF5FB';
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const traspaso = {
  1: 'Termina pasándole la palabra a Benjamín (última frase de la lámina 5).',
  2: 'Termina pasándole la palabra a Lukas (última frase de la lámina 10).',
  3: 'Cierra la exposición y abre las preguntas.',
};

const p = (text, o = {}) => new Paragraph({ spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 }, alignment: o.align, children: [new TextRun({ text, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color })] });
const borde = { style: BorderStyle.SINGLE, size: 4, color: LINEA };
const bordes = { top: borde, bottom: borde, left: borde, right: borde };
const ANCHO = 9360; // carta con márgenes de 1": 12240 − 2 × 1440
function tabla(cols, filasT, cabecera = true) {
  const celda = (t, w, head) => new TableCell({
    borders: bordes, width: { size: w, type: WidthType.DXA },
    shading: head ? { fill: FONDO, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: String(t), bold: head, size: 20, color: head ? AZUL : undefined })] })],
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: cols.map(c => c[1]),
    rows: [
      ...(cabecera ? [new TableRow({ tableHeader: true, children: cols.map(([k, w]) => celda(k, w, true)) })] : []),
      ...filasT.map(f => new TableRow({ children: f.map((v, j) => celda(v, cols[j][1], false)) })),
    ],
  });
}

const hijos = [];
hijos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'LUMINE MOTORS · CONTROL DE GESTIÓN · ICMA901 · SOLEMNE 2', size: 18, color: GRIS, characterSpacing: 20 })] }));
hijos.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 120 }, children: [new TextRun({ text: 'Guion de la exposición' })] }));
hijos.push(p('¿Cómo se controla una estrategia antes de operar? De la estrategia de Lumine Motors a un Cuadro de Mando Integral en red.', { italics: true, color: AZUL, size: 24, after: 240 }));
hijos.push(p(`Presentación oral de máximo 15 minutos. ${filas.length} láminas y ${total} palabras: unos ${min(total)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto, con algo más de un minuto de margen. Los tres integrantes hablan lo mismo y los traspasos ya están escritos en el texto. El mismo guion va en las notas del orador del PowerPoint.`));
hijos.push(tabla([['Parte', 900], ['Integrante', 3060], ['Láminas', 1800], ['Palabras', 1800], ['Tiempo', 1800]],
  quienes.map((q, i) => {
    const f = filas.filter(x => x.quien === q), pal = f.reduce((s, x) => s + g.palabras(x.texto), 0);
    return [i + 1, q, `${f[0].n} a ${f[f.length - 1].n}`, pal, min(pal)];
  })));
hijos.push(p('Cómo ensayar: cronometren el recorrido completo, con los cambios de expositor incluidos. Lean en voz alta, sin apurar: 130 palabras por minuto es un ritmo de conversación. Si alguien se pasa, se acorta en su parte, no en la del siguiente.', { color: GRIS, size: 20, after: 120, before: 160 }));

quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), pal = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  hijos.push(new Paragraph({ children: [new PageBreak()] }));
  hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `Parte ${i + 1} · ${q}` })] }));
  hijos.push(p(`Láminas ${f[0].n} a ${f[f.length - 1].n} · unos ${min(pal)} (${pal} palabras). ${traspaso[i + 1]}`, { color: GRIS, size: 20, after: 200 }));
  f.forEach(x => {
    hijos.push(new Paragraph({
      heading: HeadingLevel.HEADING_2, keepNext: true,
      tabStops: [{ type: TabStopType.RIGHT, position: ANCHO }],
      children: [new TextRun({ text: `${x.n} · ${x.titulo}` }), new TextRun({ text: `\t${g.mmss(g.segundos(x.texto))}`, color: GRIS, bold: false })],
    }));
    hijos.push(new Paragraph({ spacing: { after: 240, line: 336 }, children: [new TextRun({ text: x.texto, size: 24 })] }));
  });
});

hijos.push(new Paragraph({ children: [new PageBreak()] }));
hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Anexo · solo si preguntan' })] }));
hijos.push(p('El anexo no se expone. En el PowerPoint, la lámina 16 es un índice: un clic en la pregunta lleva a la lámina de respuesta, y cada lámina del anexo tiene un enlace de vuelta al índice.', { after: 200 }));
const temas = [];
g.ANEXO.forEach(a => { const t = temas.find(t => t.codigo === a.codigo); if (t) t.partes.push(a.parte); else temas.push({ codigo: a.codigo, titulo: a.titulo, apoyo: a.apoyo, partes: a.parte ? [a.parte] : [] }); });
hijos.push(tabla([['Tema', 900], ['Pregunta', 3960], ['Qué responder', 4500]],
  temas.map(t => [t.codigo, t.titulo + (t.partes.length > 1 ? ` (${t.partes.join(', ')})` : ''), t.apoyo || '—'])));
hijos.push(p('Respaldo completo de decisiones, contradicciones entre fuentes, riesgos y preguntas para ensayar: RESPALDO.md, en la carpeta solemne-2 del repositorio.', { color: GRIS, size: 20, after: 0, before: 160 }));

const doc = new Document({
  creator: 'Diego Alarcón, Benjamín Torres y Lukas Verdugo',
  title: 'Guion · Solemne 2 · Control de Gestión · Lumine Motors',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 48, bold: true, color: '111111' }, paragraph: { spacing: { after: 120 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: AZUL }, paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '111111' }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINEA, space: 4 } } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Guion · Solemne 2 · Lumine Motors · página ', size: 16, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS })] })] }) },
    children: hijos,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('listo', OUT); });
