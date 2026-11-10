// Genera el guion de la presentación final a partir de las notas de generar_ppt.js. Uso: node generar_guion.js
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = require("docx");
const src = fs.readFileSync(path.join(__dirname, "..", "presentacion", "generar_ppt.js"), "utf8");
const diapos = [];
const re = /addSlide\([\s\S]*?addText\("([^"]+)", \{ placeholder: "title" \}\)[\s\S]*?addNotes\("([^"]+)"\)/g;
let m;
while ((m = re.exec(src))) {
  const [, titulo, nota] = m;
  const mm = nota.match(/^([A-ZÁÉÍÓÚ]+) \((\d+) s\)\. ([\s\S]*)$/);
  diapos.push({ titulo, quien: mm ? mm[1] : "", seg: mm ? +mm[2] : 0, texto: mm ? mm[3] : nota });
}
const total = diapos.reduce((a, d) => a + d.seg, 0);
const porPersona = {};
diapos.forEach((d, i) => { (porPersona[d.quien] ||= []).push(i + 1); });
const F = "Arial";
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, line: 276 }, alignment: o.align, children: [new TextRun({ text: t, font: F, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.color })] });
const cel = (t, w, head) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: head ? { type: ShadingType.CLEAR, fill: "1F2A44", color: "auto" } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: F, size: 19, bold: head, color: head ? "FFFFFF" : "111827" })] })] });
const b = { style: BorderStyle.SINGLE, size: 4, color: "C9D1DB" };
const resumen = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3120, 3120, 3120],
  borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b },
  rows: [new TableRow({ children: ["Integrante", "Diapositivas", "Tiempo"].map(t => cel(t, 3120, true)) }),
    ...Object.entries(porPersona).map(([q, ds]) => new TableRow({ children: [cel(q.charAt(0) + q.slice(1).toLowerCase(), 3120), cel(ds.join(", "), 3120),
      cel(Math.floor(diapos.filter(d => d.quien === q).reduce((a, d) => a + d.seg, 0) / 60) + " min " + (diapos.filter(d => d.quien === q).reduce((a, d) => a + d.seg, 0) % 60) + " s", 3120)] }))] });
const cuerpo = [
  P("Guion de la presentación final", { size: 36, bold: true, color: "1F2A44", after: 60 }),
  P("Lumine Motors · Grupo 1 · NRC 4153 · IA Aplicada al Marketing y los Negocios", { size: 20, color: "6B7280", after: 240 }),
  P(`Duración total estimada: ${Math.floor(total / 60)} min ${total % 60} s para ${diapos.length} diapositivas (máximo 7 minutos). Ensayar con cronómetro: si se pasan, acorten las diapositivas 9 y 10.`, { after: 160 }),
  resumen,
  P("Antes de presentar", { size: 26, bold: true, color: "2B4C9B", after: 80 }),
  P("1. Abrir el MVP (claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx) y el sitio (claude.ai/artifact/XGpgpuDtxJvtiAjbRDwJ2o) en pestañas del navegador, por si falla el video.", { after: 60 }),
  P("2. En la diapositiva 5, hacer clic en el video para reproducirlo (16 segundos) o cambiar a la pestaña del MVP y mostrar un caso en vivo.", { after: 60 }),
  P("3. Preguntas probables: ¿por qué el ahorro es simulado? (no hay kit instalado; se verificará con telemetría); ¿por qué no hicieron terreno? (por tiempo, y con 40 encuestas la potencia era de 16%); ¿qué hizo cada IA? (tabla del capítulo 5.5 del informe).", { after: 240 }),
];
diapos.forEach((d, i) => {
  cuerpo.push(P(`${i + 1}. ${d.titulo}`, { size: 24, bold: true, color: "1F2A44", after: 40 }));
  cuerpo.push(P(`${d.quien.charAt(0) + d.quien.slice(1).toLowerCase()} · ${d.seg} segundos`, { size: 19, italics: true, color: "0E8FC9", after: 80 }));
  cuerpo.push(P(d.texto, { after: 220 }));
});
const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 } } }, children: cuerpo }] });
Packer.toBuffer(doc).then(buf => { const out = path.join(__dirname, "..", "TIG_IA_Grupo01_LumineMotors_Guion.docx"); fs.writeFileSync(out, buf); console.log("ok", out, diapos.length, "diapositivas,", total, "s"); });
