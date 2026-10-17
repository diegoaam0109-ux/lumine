// Escribe GUION.md desde guion.js: node guion-md.js > ../GUION.md
// El mismo texto va a las notas del orador (deck.js), así que el guion tiene una sola fuente.
const g = require('./guion.js');
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const traspaso = {
  1: 'Termina pasándole la palabra a Benjamín.',
  2: 'Termina pasándole la palabra a Lukas.',
  3: 'Cierra la exposición y abre las preguntas.',
};
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const mmss = x => { const s = Math.round(x); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

let md = '# Guion · Fase 3 de Lumine Motors\n\n';
md += 'Integrador II: Taller de Empresas · ICMA 1001 · Grupo 1 · Profesor Roberto Brito. ';
md += 'Capítulo III: Plan de Marketing, Operaciones y Recursos Humanos.\n\n';
md += `Máximo 10 minutos: ${filas.length} diapositivas, unos ${mmss(total / g.PALABRAS_POR_MINUTO * 60)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto (${total} palabras). `;
md += `Cada integrante habla lo mismo, poco más de tres minutos. El anexo (${g.ANEXO.length} diapositivas) no se expone: se usa solo si preguntan.\n\n`;
md += '| Parte | Integrante | Diapositivas | Palabras | Tiempo |\n|---|---|---|---|---|\n';
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((a, x) => a + g.palabras(x.texto), 0);
  md += `| ${i + 1} | ${q} | ${f[0].n} a ${f[f.length - 1].n} | ${p} | ${mmss(p / g.PALABRAS_POR_MINUTO * 60)} |\n`;
});
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((a, x) => a + g.palabras(x.texto), 0);
  md += `\n## Parte ${i + 1} · ${q} · diapositivas ${f[0].n} a ${f[f.length - 1].n}\n\n`;
  md += `Unos ${mmss(p / g.PALABRAS_POR_MINUTO * 60)} (${p} palabras). ${traspaso[i + 1]}\n\n`;
  md += f.map(x => `### ${x.n} · ${x.titulo} · ${g.segundos(x.texto)} s\n\n${x.texto}`).join('\n\n') + '\n';
});
md += '\n## Anexo · solo si preguntan\n\n';
md += 'La diapositiva índice tiene un enlace a cada tema: se hace clic en el tema y se salta directo.\n\n';
md += g.ANEXO.map(a => `- **${a.codigo} · ${a.titulo}.** ${a.apoyo}`).join('\n') + '\n';
process.stdout.write(md);
