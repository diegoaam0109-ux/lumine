// Imprime en Markdown la parte de un integrante del guion: node guion-md.js <1|2|3>
const g = require('./guion.js');
const quienes = [g.DIEGO, g.BENJA, g.LUKAS];
const parte = Number(process.argv[2]), quien = quienes[parte - 1];
const filas = g.PRINCIPAL.map((x, i) => Object.assign({ n: i + 1 }, x)).filter(x => x.quien === quien);
const total = filas.reduce((a, x) => a + g.palabras(x.texto), 0);
const sig = { 1: 'Termina pasándole la palabra a Benjamín.', 2: 'Termina pasándole la palabra a Lukas.', 3: 'Cierra la exposición y abre las preguntas.' }[parte];
let md = `## Parte ${parte} · ${quien} · diapositivas ${filas[0].n} a ${filas[filas.length - 1].n}\n\n`;
md += `Unos ${Math.round(total / g.PALABRAS_POR_MINUTO)} minutos (${total} palabras). ${sig}\n\n`;
md += filas.map(x => `### ${x.n} · ${x.titulo} · ${g.segundos(x.texto)} s\n\n${x.texto}`).join('\n\n');
process.stdout.write(md);
