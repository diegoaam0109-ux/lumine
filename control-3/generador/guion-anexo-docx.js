// Guion del anexo A11 (Cuadro de Mando Integral) en Word: node guion-anexo-docx.js ../Lumine_Control3_Guion_Anexo_CMI.docx
// Sale de guion.js (GUION_ANEXO_CMI), la misma fuente que las notas de la lámina A11.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Footer, PageNumber } = require('docx');
const g = require('./guion.js');

const OUT = process.argv[2] || '../Lumine_Control3_Guion_Anexo_CMI.docx';
const AZUL = '0A6F9E', GRIS = '5F6B70', LINEA = 'C9D3D8';
const ga = g.GUION_ANEXO_CMI;
const pal = g.palabras(ga.bloques.map(b => b.texto).join(' '));
const p = (text, o = {}) => new Paragraph({ spacing: { before: o.before || 0, after: o.after ?? 120, line: o.line ?? 300 }, children: [new TextRun({ text, size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color })] });

const H = [];
H.push(p('LUMINE MOTORS · CONTROL DE GESTIÓN · ICMA901 · CONTROL 3 · AVANCE 1 DEL TIG', { size: 18, color: GRIS, after: 60 }));
H.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: `Guion del anexo ${ga.codigo} · Cuadro de Mando Integral` })] }));
H.push(p(`${ga.cuando} Sugerido: ${ga.quien}. Unos ${g.mmss(pal / g.PALABRAS_POR_MINUTO * 60)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto (${pal} palabras).`, { italics: true, color: AZUL, after: 240 }));
ga.bloques.forEach((b, i) => {
  H.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun({ text: `${i + 1} · ${b.titulo}` })] }));
  H.push(p(b.senal, { size: 18, color: GRIS, italics: true, after: 60 }));
  H.push(new Paragraph({ spacing: { after: 240, line: 336 }, children: [new TextRun({ text: b.texto, size: 24 })] }));
});
H.push(p('El mapa es una propuesta preliminar: no se expone en el Avance 1 y sus metas, indicadores y responsables corresponden al Avance 2.', { size: 18, color: GRIS, before: 120 }));

const doc = new Document({
  creator: 'Diego Alarcón, Benjamín Torres y Lukas Verdugo', title: `Guion del anexo ${ga.codigo} · CMI · Lumine Motors`,
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 40, bold: true, color: '111111' }, paragraph: { spacing: { after: 120 } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '111111' }, paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 1, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINEA, space: 4 } } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Guion del anexo CMI · Control 3 · Lumine Motors · página ', size: 16, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS })] })] }) },
    children: H,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('listo', OUT); });
