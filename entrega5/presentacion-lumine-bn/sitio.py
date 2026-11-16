"""Publica los recursos de IA con el visor compartido de las presentaciones Lumine."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil,html
P=Path(__file__).resolve().parent;ROOT=P.parents[1];OUT=P/'salida';WEB=ROOT/'lumine-presentaciones/ia-aplicada'
for folder in [WEB,WEB/'slides',WEB/'video',WEB/'descargas']:folder.mkdir(exist_ok=True)
d=json.loads((OUT/'contenido.json').read_text());v=hashlib.sha256((OUT/'contenido.json').read_bytes()+b''.join((OUT/'slides'/f'{i:02d}.png').read_bytes() for i in range(1,18))).hexdigest()[:12]
deck={'title':d['title'],'mainSlides':12,'slides':[],'annex':[]}
for i,s in enumerate(d['slides']):
 n=f'{i+1:02d}.jpg';Image.open(OUT/'slides'/f'{i+1:02d}.png').convert('RGB').save(WEB/'slides'/n,quality=94,subsampling=0)
 entry={'title':s['title'],'img':f'slides/{n}?v={v}','who':s.get('who',''),'sec':round(s.get('seconds',0)),'notes':'<p>'+html.escape(s.get('script','Respaldo para preguntas.'))+'</p><p class="plan">'+html.escape(s['source'])+'</p>'}
 if 'video'in s:entry['video']={'src':s['video']['src']+'?v='+v,'box':s['video']['box']}
 deck['slides'].append(entry)
 if 'annex'in s:deck['annex'].append({'code':s['annex'],'title':s['title'],'question':s['title'],'slide':i+1,'keywords':{'A1':['objetivos','hipótesis','H1','H2','H3','datos'],'A2':['Ridge','error','modelo','validación'],'A3':['RAFA','prompt','Claude','JSON'],'A4':['costo','ROI','A/B','margen','retorno','economía'],'A5':['privacidad','riesgo','suspensión','gobernanza']}[s['annex']]})
shutil.copy(P/'recursos/pagina-comercial.mp4',WEB/'video/pagina-comercial.mp4')
for a,b in [('Lumine_IA_Presentacion_7_min.pdf','Lumine_IA_7_min.pdf'),('Lumine_IA_Presentacion_7_min.pptx','Lumine_IA_7_min.pptx'),('Lumine_IA_Guion.pdf','Guion_IA_7_min.pdf')]:shutil.copy(OUT/a,WEB/'descargas'/b)
(WEB/'deck-data.js').write_text('window.DECK='+json.dumps(deck,ensure_ascii=False,indent=2)+';\n')
(WEB/'index.html').write_text(f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lumine · IA aplicada · 7 minutos</title><link rel="stylesheet" href="../engine/deck.css?v={v}"><style>#frame video{{object-fit:contain}}</style></head><body><script src="deck-data.js?v={v}"></script><script src="../engine/deck.js?v={v}"></script></body></html>''')
(WEB/'descargas.html').write_text(f'''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lumine · IA · Archivos</title><link rel="stylesheet" href="../engine/deck.css?v={v}"><body class="home"><main><h1>LUMINE · IA APLICADA</h1><p class="sub">12 láminas + 5 anexos · Guion de 7 minutos</p><a class="card" href="./"><b>ABRIR PRESENTACIÓN</b>Visor con transiciones y video comercial</a><a class="card" href="descargas/Lumine_IA_7_min.pdf?v={v}"><b>PDF CORREGIDO</b>Láminas con fondos RGB, sin transparencias PDF</a><a class="card" href="descargas/Lumine_IA_7_min.pptx?v={v}"><b>POWERPOINT</b>Con notas y video incrustado</a><a class="card" href="descargas/Guion_IA_7_min.pdf?v={v}"><b>GUION</b>Tiempos, relevos y preguntas difíciles</a></main></body></html>''')
(WEB/'README.md').write_text('''# IA Aplicada · Lumine\n\nGenerado con `python entrega5/presentacion-lumine-bn/sitio.py`. Editar la fuente de esa carpeta y regenerar. Usa el visor compartido de Fase 3; la lámina 6 reproduce la grabación comercial de 20 segundos, convertida a 1080p, sin alterar su contenido. El caso N1 aparece aparte; el video no se presenta como una nueva predicción. PDF corregido desde las imágenes verificadas, con colores RGB sin máscaras de transparencia PDF. `descargas.html` reúne los archivos.\n''')
print('Sitio preparado:',WEB,'versión',v)
