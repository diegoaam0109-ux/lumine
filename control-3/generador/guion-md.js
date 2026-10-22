// Escribe GUION.md desde guion.js: node guion-md.js > ../GUION.md
// El mismo texto va a las notas del orador (deck.js) y al guion en Word (guion-docx.js): el guion tiene una sola fuente.
const g = require('./guion.js');
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const traspaso = {
  1: 'Abre con el saludo, pasa la palabra a Benjamín al final de la lámina 5 y vuelve para el cierre (lámina 13).',
  2: 'Pasa la palabra a Lukas al final de la lámina 8.',
  3: 'Devuelve la palabra a Diego al final de la lámina 12.',
};
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);
const laminas = f => f.map(x => x.n).join(', ');

let md = '# Guion · Control 3 / Avance 1 del TIG · Control de Gestión · Lumine Motors\n\n';
md += 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB · profesor Leonardo Lizana Contreras · martes 27-10-2026, 15:00.\n\n';
md += `Exposición de máximo 15 minutos: ${filas.length} láminas y ${total} palabras, unos ${min(total)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto, `;
md += 'con algo más de un minuto de margen. Es un cálculo: el tiempo real se fija cronometrando el ensayo completo. ';
md += `Anexo de ${g.ANEXO.length} láminas con índice enlazado (lámina 14), que no se expone.\n\n`;
md += '| Parte | Integrante | Láminas | Palabras | Tiempo |\n|---|---|---|---|---|\n';
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `| ${i + 1} | ${q} | ${laminas(f)} | ${p} | ${min(p)} |\n`;
});
md += `| | **Total** | | **${total}** | **${min(total)}** |\n`;
md += '\n## Hoja de control de tiempos\n\n| Lámina | Expositor | Asignado | Palabras | Estimado | Acumulado |\n|---|---|---|---|---|---|\n';
let acum = 0;
filas.forEach(x => { const s = g.palabras(x.texto) / g.PALABRAS_POR_MINUTO * 60; acum += s; md += `| ${x.n} · ${x.titulo} | ${x.quien.split(' ')[0]} | ${g.mmss(x.objetivo)} | ${g.palabras(x.texto)} | ${g.mmss(s)} | ${g.mmss(acum)} |\n`; });
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `\n## Parte ${i + 1} · ${q} · láminas ${laminas(f)}\n\n`;
  md += `Unos ${min(p)} (${p} palabras). ${traspaso[i + 1]}\n\n`;
  md += f.map(x => `### ${x.n} · ${x.titulo} · ${g.mmss(g.segundos(x.texto))}\n\n${x.texto}\n\n` +
    `> **Mensaje:** ${x.mensaje}  \n> **Evidencia:** ${x.evidencia}  \n> **Por qué importa:** ${x.importa}  \n> **Transición:** ${x.transicion}`).join('\n\n') + '\n';
});
md += '\n## Anexo · solo si preguntan\n\n';
md += 'La lámina índice (14) tiene un enlace a cada pregunta; cada lámina del anexo tiene un enlace de vuelta al índice.\n\n';
md += g.ANEXO.map(a => `- **${a.codigo} · ${a.titulo}** ${a.apoyo}`).join('\n') + '\n';
md += '\nManual de defensa (escalas, origen de cada cifra y preguntas difíciles): `DEFENSA.md`.\n';
process.stdout.write(md);
