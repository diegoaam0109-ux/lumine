from pathlib import Path
import json,base64,html,re,shutil,zipfile
P=Path(__file__).resolve().parent;ROOT=P.parents[1];OUT=P/'salida';d=json.loads((OUT/'contenido.json').read_text())
css=(ROOT/'lumine-presentaciones/engine/deck.css').read_text()
js=(ROOT/'lumine-presentaciones/engine/deck.js').read_text()
data={'title':d['title'],'mainSlides':12,'slides':[],'annex':[]}
for i,s in enumerate(d['slides']):
 img='data:image/png;base64,'+base64.b64encode((OUT/'slides'/f'{i+1:02d}.png').read_bytes()).decode()
 notes=html.escape(s.get('script','Respaldo para preguntas.')).replace('\n','<br>')
 data['slides'].append({'title':s['title'],'img':img,'who':s.get('who',''),'sec':round(s.get('seconds',0)),'notes':'<p>'+notes+'</p><p class="plan">'+html.escape(s['source'])+'</p>'})
 if 'annex'in s:data['annex'].append({'code':s['annex'],'title':s['title'],'slide':i+1,'question':s['title'],'keywords':{'A1':['objetivos','hipótesis','H1','H2','H3','datos'],'A2':['Ridge','error','modelo','validación'],'A3':['RAFA','prompt','Claude','JSON'],'A4':['costo','ROI','A/B','margen','retorno','economía'],'A5':['privacidad','riesgo','suspensión','gobernanza']}[s['annex']]})
text='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(d['title'])+'</title><style>'+css+'</style></head><body><script>window.DECK='+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';</script><script>'+js+'</script></body></html>'
(OUT/'Lumine_IA_Presentacion.html').write_text(text)
notes='''LUMINE · IA APLICADA · 7 MINUTOS · DISEÑO V2

Presentación: 12 láminas principales y 5 anexos.
Guion: 6:45 estimados a 130 palabras/minuto, con 12 segundos de demo. Ensayar; incluye recortes y preguntas difíciles.

ARCHIVOS
- Lumine_IA_Presentacion.html: presentación completa en un archivo; se abre en Chrome/Edge sin instalar nada y sin internet.
- Lumine_IA_Presentacion_7_min.pptx: láminas como imágenes de alta resolución y guion en notas del orador.
- Lumine_IA_Presentacion_7_min.pdf: PDF vectorial del diseño de las 17 láminas.
- Lumine_IA_Guion.pdf / .docx / .md: texto de exposición, tiempos y defensa.

CONTROLES WEB
F: pantalla completa; también hay un botón visible. O: orador con guion y reloj. Flechas o espacio: avanzar. P: buscar anexos y Esc: volver al punto de origen. Fin: cierre. Número + Enter: saltar a una lámina. Z: lupa. L: puntero.

La presentación funciona sin consultar datos ni una IA en vivo. La demo externa opcional requiere conexión:
https://claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx
Mostrar el caso preparado; ante una falla, continuar con la lámina 6, que ya contiene el resultado.

EDICIÓN
Editar contenido.json y generar.py; no editar las imágenes finales.
Los datos pertenecen al informe de IA adjunto. No son cifras actualizadas de la Fase 4 financiera.
Las métricas de ahorro, pruebas e impacto comercial conservan sus límites explícitos.
'''
(OUT/'LEEME.txt').write_text(notes)
print('HTML autónomo listo:',len(text)//1024,'KB')
