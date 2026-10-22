// Escribe GUION.md desde guion.js: node guion-md.js > ../GUION.md
// El mismo texto va a las notas del orador (deck.js) y al Word (guion-docx.js): el guion tiene una sola fuente.
const g = require('./guion.js');
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const objetivo = { [g.DIEGO]: '≈ 4:00', [g.BENJA]: '≈ 4:00', [g.LUKAS]: '≈ 4:00' };
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x));
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const min = p => g.mmss(p / g.PALABRAS_POR_MINUTO * 60);
const suma = f => f.reduce((s, x) => s + g.palabras(x.texto), 0);
const mil = n => n.toLocaleString('es-CL');

// Tramos consecutivos de un mismo expositor (Diego abre y vuelve a cerrar).
const tramos = [];
filas.forEach(x => { const t = tramos[tramos.length - 1]; if (t && t.quien === x.quien) t.f.push(x); else tramos.push({ quien: x.quien, f: [x] }); });

let md = '# Guion · TIG · entrega final · Lumine Motors\n\n';
md += 'Control de Gestión · ICMA901 · Sección 500 · NRC 4118 · UNAB. Profesor Leonardo Lizana Contreras.\n\n';
md += 'Recorre el informe final: problema y negocio, diagnóstico, estrategia, objetivos, Cuadro de Mando Integral, análisis de la información, recomendaciones y conclusiones. ';
md += 'El instructivo da entre 10 y 15 minutos por equipo y califica a cada integrante.\n\n';
md += `Exposición de máximo 15 minutos: ${filas.length} láminas y ${mil(total)} palabras, unos ${min(total)} a ${g.PALABRAS_POR_MINUTO} palabras por minuto. `;
md += `El anexo de ${g.ANEXO.length} láminas no se expone. Diego abre y cierra; los cambios de expositor están escritos en el texto.\n\n`;
md += '| Integrante | Láminas | Palabras | Tiempo | Objetivo |\n|---|---|---|---|---|\n';
quienes.forEach(q => {
  const f = filas.filter(x => x.quien === q);
  md += `| ${q} | ${f.map(x => x.n).join(', ')} | ${suma(f)} | ${min(suma(f))} | ${objetivo[q]} |\n`;
});
md += `| **Total** | ${filas.length} | ${mil(total)} | ${min(total)} | 15:00 máx. |\n`;
md += '\n| Lámina | Expositor | Apartado del informe | Tiempo |\n|---|---|---|---|\n';
md += filas.map(x => `| ${x.n} · ${x.titulo} | ${x.quien.split(' ')[0]} | ${x.seccion} | ${g.mmss(g.segundos(x.texto))} |`).join('\n') + '\n';

tramos.forEach((t, i) => {
  const ini = t.f[0].n, fin = t.f[t.f.length - 1].n, p = suma(t.f);
  const rango = ini === fin ? `lámina ${ini}` : `láminas ${ini} a ${fin}`;
  const rol = i === 0 ? ' · abre' : i === tramos.length - 1 ? ' · cierre' : '';
  md += `\n## ${t.quien}${rol} · ${rango}\n\n`;
  md += `Unos ${min(p)} (${p} palabras).\n\n`;
  md += t.f.map(x => `### ${x.n} · ${x.titulo} · ${g.mmss(g.segundos(x.texto))}\n\n*Informe: ${x.seccion}*\n\n${x.texto}`).join('\n\n') + '\n';
});
md += '\n## Anexo · solo si preguntan\n\n';
md += `La lámina índice (${filas.length + 1}) tiene un enlace a cada pregunta; cada lámina del anexo tiene un enlace de vuelta al índice.\n\n`;
md += g.ANEXO.map(a => `- **${a.codigo} · ${a.titulo}${/[?.)]$/.test(a.titulo) ? '' : '.'}** ${a.apoyo}`).join('\n') + '\n';
md += '\nDecisiones y pendientes: `RESPALDO.md`.\n';
process.stdout.write(md);
