"""Extrae todas las cifras de laminas.html y deck-data.js y las busca tal cual en el texto del informe final.
También revisa los términos prohibidos de la defensa.

Uso: python3 verificar_cifras.py ruta/al/informe.txt   (texto plano del .docx; el informe no se sube al repositorio)
"""
import html, json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
DEF = os.path.dirname(AQUI)

def plano(t):
    t = re.sub(r'<script.*?</script>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    return html.unescape(t).replace(' ', ' ').replace(' ', ' ')

def norm(t):
    return t.replace('−', '-').replace('–', '-')

informe = norm(open(sys.argv[1], encoding='utf-8').read())
if len(sys.argv) > 2:
    informe += norm(open(sys.argv[2], encoding='utf-8').read())
lam = plano(open(os.path.join(DEF, 'laminas.html'), encoding='utf-8').read())
deck_js = open(os.path.join(DEF, 'deck-data.js'), encoding='utf-8').read()
datos = json.loads(deck_js[deck_js.index('{'):deck_js.index('};') + 1])
deck = plano(' '.join(s.get('notes', '') for s in datos['slides']))
fuentes = {'láminas': lam, 'guion': deck}

# Cifra: número con miles en punto y decimales en coma (con o sin $ y %).
PAT = re.compile(r'\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+,\d+|\d+')
IGNORAR = {str(n) for n in range(0, 13)} | {'2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2035', '1992', '2020'}

faltan = {}
for nombre, txt in fuentes.items():
    for m in PAT.finditer(norm(txt)):
        c = m.group(0)
        if c in IGNORAR:
            continue
        # se exige que la cifra aparezca en el informe sin dígitos pegados a sus lados
        if not re.search(r'(?<![\d.,])' + re.escape(c) + r'(?![\d]|,\d)', informe):
            ctx = norm(txt)[max(0, m.start() - 40):m.end() + 30].replace('\n', ' ')
            faltan.setdefault(c, (nombre, ' '.join(ctx.split())))

PROHIBIDOS = ['San Joaquín', 'EMC', 'dependencia estructural', '81%', 'desaconsej', 'telemetr', 'casi inelástic', 'inelástic', 'gas licuado', 'GLP']
hall = [(p, n) for n, t in fuentes.items() for p in PROHIBIDOS if p.lower() in t.lower()]

print(f'Cifras revisadas en láminas y guion. No aparecen tal cual en el informe: {len(faltan)}')
for c, (n, ctx) in sorted(faltan.items(), key=lambda x: x[0]):
    print(f'  {c:>12}  [{n}]  …{ctx}…')
print('Términos prohibidos encontrados:', hall or 'ninguno')
# ICCT y SEG nunca juntos en la misma frase
for n, t in fuentes.items():
    for frase in re.split(r'[.!?]', t):
        if 'ICCT' in frase and 'SEG' in frase:
            print('  ICCT y SEG en la misma frase:', frase.strip()[:120])
