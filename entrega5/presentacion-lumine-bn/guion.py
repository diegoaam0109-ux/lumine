from pathlib import Path
import json,re,html
from docx import Document
from docx.shared import Pt,Inches
P=Path(__file__).resolve().parent;OUT=P/'salida';d=json.loads((OUT/'contenido.json').read_text());S=d['slides'][:12]
def clock(sec):return f'{int(sec)//60}:{round(sec)%60:02d}'
rows=[]
for i,n in enumerate(d['authors']):
 g=S[i*4:i*4+4];rows.append([n,f'{i*4+1}–{i*4+4}',str(sum(x['words']for x in g)),clock(sum(x['seconds']for x in g))])
total=sum(s['seconds']for s in S)
lines=['# Lumine Motors · Guion de defensa · 7 minutos','', 'Supuestos: Diego → Benjamín → Lukas; profesor y comisión del ramo IA; estructura híbrida. Los nombres se presentan por apellido. Se usan exclusivamente las cifras del informe adjunto de este ramo.','', '| Orador | Láminas | Palabras habladas | Tiempo estimado |','|---|---:|---:|---:|']
lines+=['| '+' | '.join(r)+' |'for r in rows]
lines+=['',f'**Total: {sum(s["words"]for s in S)} palabras; {clock(total)} estimados. Margen hasta 7:00: {round(420-total)} segundos.**', '', 'Cálculo: 130 palabras/minuto + 1,2 s por cambio de lámina + 1,2 s por cue adicional + 3,5 s de silencio inicial/pausa + 12 s de demo. Las pausas breves «/» se absorben en la cadencia. El tiempo es una estimación de escritorio: ensayar con cronómetro. Si el ensayo supera 7:00, aplicar los recortes de abajo.', '', '## Preparación', '', 'Abrir la presentación y el caso N1 antes de empezar. En la lámina 6, mostrar únicamente el caso de 213 km/día durante un máximo de 12 s; usar la captura de la lámina si el MVP falla. No esperar una API ni digitar frente al profesor. El ejemplo actual usa Ridge y plantilla; la batería RAFA registrada usa cifras de E3. La demo es opcional y ya está incluida en el tiempo.', '', 'MVP de referencia entregado por el equipo: https://claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx . Su disponibilidad externa no forma parte de las pruebas de estos archivos.', '', '## Discurso']
for i,s in enumerate(S):
 lines+=['',f'### Lámina {i+1} · {s["title"]}',f'{s["who"]} · {s["words"]} palabras · {clock(s["seconds"])}','',s['script']]
lines += ['', '## Versión recortable', '', '1. Omitir la demo en vivo y explicar el caso sobre la lámina 6: recupera 12 s sin perder evidencia.', '2. En la lámina 9, omitir «Cinco herramientas… No todas acertaron»: recupera unos 10 s. Conservar revisión humana y pruebas.', '3. En la lámina 3, dejar H1/H2 para A1 y terminar después de «tiempo»: recupera unos 12 s.', 'No cortar la distinción entre simulación y medición, H3 pendiente, las condiciones para escalar ni el cierre. Los anexos se abren solo en preguntas.', '', '## Preguntas difíciles · fuera de los 7 minutos', '', '### 1. «¿Validaron el ahorro real o solo aprendieron a reproducir su simulador?»', '**Responde Benjamín · respaldo A1/A2.** Las jornadas externas son reales, pero el ahorro objetivo se obtiene con simulación: todavía no validamos ahorro físico del kit. Contrastamos la transferencia a otros patrones de conducción; falta telemetría antes/después de instalaciones para comprobar la promesa comercial. **Por conseguir:** ficha del kit y protocolo de medición comparable en Santiago.', '', '### 2. «¿Cómo justifican el retorno si no midieron H3 y su A/B no detecta el punto de equilibrio?»', '**Responde Lukas · respaldo A4.** El retorno es un escenario condicionado a cotizaciones, conversión y margen del informe; no un beneficio observado. Los 173 casos por grupo se calcularon para 15 pp, y no permiten afirmar la misma potencia para 3 pp: antes de decidir la rentabilidad hay que ajustar el diseño y recalcular el costo variable de revisión técnica. **Por conseguir:** conversión real, margen vigente y tamaño muestral para el efecto mínimo relevante.', '', '### 3. «¿Diez ataques y doce casos garantizan que Claude nunca inventará?»', '**Responde Diego · respaldo A3/A5.** No: son los resultados de una batería acotada y una ejecución por caso. Por eso el lenguaje recibe cifras cerradas, se valida cada salida, existe una plantilla de respaldo y se repite la batería tras cada cambio. La revisión humana resolvió dos falsos negativos y detectó derivación excesiva al técnico en nueve ataques. **Por conseguir:** corridas repetidas y registro exacto de modelo/versión.', '', '## Decisiones editoriales y límites', '', '- Fondos claros y oscuros con acento celeste Lumine, según aclaración del equipo: negro para apertura, pregunta, caso, responsabilidad y decisión; blanco para evidencia.', '- La comparación de errores se limita a simulación. «Datos reales» no se presenta como medición de ahorro con kit.', '- El caso actual del MVP (19,7%, $159.000) se mantiene separado del ejemplo RAFA de E3 (19,6%, $158.000).', '- No se trasladan precios, tecnología ni márgenes de la Fase 4 de Integrador II a este ramo.', '- Los $9,0 M y el ROI de 68% se conservan como escenarios del informe, con su dependencia explícita.', '- Las 20 pruebas y los ataques son evidencia histórica documentada en el informe; no se afirma haber repetido el entrenamiento ni las llamadas a modelos en esta entrega.', '- No se recibió una rúbrica separada con ponderaciones. Se cubren los componentes del anexo J del informe sin inventar porcentajes de evaluación.', '- Skill aplicada: guion-defensa-grupal (adjunta). La pasada de estilo se hizo manualmente; la skill referenciada revisar-tics-ia no está disponible en este repositorio.', '']
md='\n'.join(lines);(P/'GUION.md').write_text(md);(OUT/'Lumine_IA_Guion.md').write_text(md)
# HTML imprimible del guion.
body=[]
for line in lines:
 if line.startswith('|'):
  if set(line.replace('|','').replace('-','').replace(':','').strip())==set():continue
  cells=[x.strip()for x in line.strip('|').split('|')];body.append('<div class="summary">'+' · '.join(html.escape(x)for x in cells)+'</div>');continue
 if not line:continue
 tag='h1'if line.startswith('# ')else 'h2'if line.startswith('## ')else 'h3'if line.startswith('### ')else 'p';txt=re.sub(r'^#{1,3} ','',line);txt=html.escape(txt);txt=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',txt);body.append(f'<{tag}>{txt}</{tag}>')
(OUT/'guion.html').write_text('''<!doctype html><html lang="es"><meta charset="utf-8"><title>Lumine · Guion de 7 minutos</title><style>@page{size:A4;margin:20mm 19mm}body{font:12pt/1.5 Arial,sans-serif;color:#171717;margin:0}h1{font-size:27pt;line-height:1.12;margin:0 0 22pt}h2{font-size:18pt;border-top:1px solid #aaa;padding-top:14pt;margin-top:24pt;break-after:avoid}h3{font-size:14pt;margin:22pt 0 5pt;break-after:avoid}p{margin:8pt 0;orphans:3;widows:3}.summary{padding:8pt;border-bottom:1px solid #ddd;font-size:11pt}b{font-weight:700}</style><body>'''+''.join(body)+'</body></html>')
doc=Document();doc.styles['Normal'].font.name='Arial';doc.styles['Normal'].font.size=Pt(11)
for line in lines:
 if not line:continue
 if line.startswith('# '):doc.add_heading(line[2:],0)
 elif line.startswith('## '):doc.add_heading(line[3:],1)
 elif line.startswith('### '):doc.add_heading(line[4:],2)
 elif line.startswith('|'):
  if '---'not in line:doc.add_paragraph(line.strip('|').replace('|',' · '))
 else:doc.add_paragraph(line.replace('**',''))
doc.save(OUT/'Lumine_IA_Guion.docx')
print(rows,'total',clock(total))
