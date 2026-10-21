// Escribe GUION.md desde guion.js: node guion-md.js > ../GUION.md
// El mismo texto va a las notas del orador (deck.js), así que el guion tiene una sola fuente.
const g = require('./guion.js');
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const traspaso = {
  1: 'Termina pasándole la palabra a Benjamín (última frase de la lámina 4).',
  2: 'Termina pasándole la palabra a Lukas (última frase de la lámina 8).',
  3: 'Cierra la exposición y abre las preguntas.',
};
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);

let md = '# Guion · Solemne 2 de Control de Gestión · Lumine Motors\n\n';
md += 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB. Mapa estratégico y Cuadro de Mando Integral.\n\n';
md += `Máximo 15 minutos. Objetivo: ${min(total)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto (${total} palabras), con unos 3 minutos de margen. `;
md += `${filas.length} láminas de exposición y un anexo de ${g.ANEXO.length} temas que no se expone. `;
md += 'Los tres hablan lo mismo. El tiempo por lámina sigue los tres temas del comunicado de la Solemne (plan y desviaciones, ';
md += 'indicadores, y EVA con CMI), que se supusieron de igual peso porque no hay rúbrica con ponderaciones.\n\n';
md += '| Parte | Integrante | Láminas | Palabras | Tiempo |\n|---|---|---|---|---|\n';
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `| ${i + 1} | ${q} | ${f[0].n} a ${f[f.length - 1].n} | ${p} | ${min(p)} |\n`;
});
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `\n## Parte ${i + 1} · ${q} · láminas ${f[0].n} a ${f[f.length - 1].n}\n\n`;
  md += `Unos ${min(p)} (${p} palabras). ${traspaso[i + 1]}\n\n`;
  md += f.map(x => `### ${x.n} · ${x.titulo} · ${g.mmss(g.segundos(x.texto))}\n\n${x.texto}`).join('\n\n') + '\n';
});
md += '\n## Anexo · solo si preguntan\n\n';
md += 'La lámina índice (13) tiene un enlace a cada pregunta; cada lámina del anexo tiene un enlace de vuelta al índice.\n\n';
md += g.ANEXO.map(a => `- **${a.codigo} · ${a.titulo}** ${a.apoyo}`).join('\n') + '\n';
md += '\nRespaldo de cifras, contradicciones y riesgos: `RESPALDO.md`. Cálculos en vivo: Excel del paquete (hojas EVA y CASO_SIMULADO), que no se sube al repositorio.\n';
process.stdout.write(md);
