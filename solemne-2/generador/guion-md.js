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
const a = ppm => g.mmss(total / ppm * 60);

let md = '# Guion · Solemne 2 de Control de Gestión · Lumine Motors\n\n';
md += 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB. Mapa estratégico y Cuadro de Mando Integral.\n\n';
md += `Máximo 15 minutos; ideal entre 13 y 14. ${filas.length} diapositivas, ${total} palabras: unos ${a(g.PALABRAS_POR_MINUTO)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto `;
md += `(ritmo pausado de exposición) y unos ${a(130)} a 130 palabras por minuto (ritmo de conversación). `;
md += 'El texto es el del guion oral del paquete, sin cambios; las transiciones son sugeridas. ';
md += 'El reparto equilibra los tiempos (el paquete permite intercambiar diapositivas entre expositores).\n\n';
md += '| Parte | Integrante | Diapositivas | Palabras | Tiempo |\n|---|---|---|---|---|\n';
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `| ${i + 1} | ${q} | ${f[0].n} a ${f[f.length - 1].n} | ${p} | ${g.mmss(p / g.PALABRAS_POR_MINUTO * 60)} |\n`;
});
quienes.forEach((q, i) => {
  const f = filas.filter(x => x.quien === q), p = f.reduce((s, x) => s + g.palabras(x.texto), 0);
  md += `\n## Parte ${i + 1} · ${q} · diapositivas ${f[0].n} a ${f[f.length - 1].n}\n\n`;
  md += `Unos ${g.mmss(p / g.PALABRAS_POR_MINUTO * 60)} (${p} palabras). ${traspaso[i + 1]}\n\n`;
  md += f.map(x => `### ${x.n} · ${x.titulo} · ${g.mmss(g.segundos(x.texto))} (plan del paquete: ${x.tiempoPaquete})\n\n${x.texto}\n\n_Transición: ${x.transicion}_`).join('\n\n') + '\n';
});
md += '\n## Para la defensa\n\n';
md += '- Respaldo de cifras, consistencia y riesgos: `RESPALDO.md` en esta carpeta.\n';
md += '- Cálculos en vivo: Excel del paquete, hojas EVA y CASO_SIMULADO (no se sube al repositorio).\n';
md += '- Preguntas posibles y respuestas: Word de anexos del paquete (no se sube al repositorio).\n';
process.stdout.write(md);
