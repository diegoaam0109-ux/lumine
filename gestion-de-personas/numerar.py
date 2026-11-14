import re, sys
sys.path.insert(0, '.')
from fuentes import FUENTES
SUP = str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹')
s = open(sys.argv[1], encoding='utf-8').read()
orden = []
def rep(m):
    k = m.group(1)
    if k not in FUENTES: raise SystemExit('falta fuente ' + k)
    if k not in orden: orden.append(k)
    return str(orden.index(k) + 1).translate(SUP)
s = re.sub(r'\{\{(\w+)\}\}', rep, s)
s += '\n# Fuentes\n\n' + '\n'.join(f'{i+1}. {FUENTES[k]}' for i, k in enumerate(orden)) + '\n'
sin_uso = [k for k in FUENTES if k not in orden]
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print(len(orden), 'fuentes citadas; sin uso:', sin_uso)
