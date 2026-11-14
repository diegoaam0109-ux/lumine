#!/usr/bin/env python3
"""Deja el libro sin hojas ocultas y con las fórmulas reales en las hojas del curso.

Antes: las hojas 1 a 7 y los anexos eran espejos (×1.000.000) de hojas ocultas de la v6, que a su vez leían el motor.
Después: cada celda de las hojas del curso tiene la fórmula que antes estaba en la hoja oculta, traducida a pesos y
apuntando a celdas visibles. Las hojas duplicadas de la v6 se eliminan y el motor queda visible como «Motor ...».

Uso: transparentar.py ENTRADA SALIDA   (antes de recalcular; construir_v7.py verifica que los valores no cambien)

Reglas de unidades (la v6 trabaja en millones; el curso en pesos):
- Fórmula movida a una celda del curso con valor en pesos: se quitan los «/1000000», las referencias al motor en
  millones (hojas Calc) se multiplican por 1.000.000 y las referencias a otras celdas movidas quedan directas.
- Fórmulas que siguen en millones (motor, controles de la v6, Notas) o que ya convertían a pesos: la referencia a una
  celda del curso en pesos se divide por 1.000.000 y después se simplifica «(x/1000000)*1000000» = x.
"""
import re
import sys
from collections import defaultdict
import openpyxl
from openpyxl.formula.tokenizer import Tokenizer
from openpyxl.utils import range_boundaries, get_column_letter as L, column_index_from_string as CI
from openpyxl.styles import Font, PatternFill

ENT, SAL = sys.argv[1], sys.argv[2]
w = openpyxl.load_workbook(ENT)

PRES = ['Costos', 'Inversión', 'Calendario', 'Capital de trabajo', 'Flujo puro', 'Flujo inversionista', 'Deuda',
        'Impuestos', '3 años', 'CT mensual', 'Equilibrio', 'Sensibilidad', 'Resumen']
HOGAR = {'Costos': '2 Ingresos y costos', 'Inversión': '1 Inversión', 'Calendario': 'A1 Calendario inversión',
         'Capital de trabajo': '3 Capital de trabajo', 'Flujo puro': '4 Flujo puro',
         'Flujo inversionista': '5 Flujo financiado', 'Deuda': '5.1 Tabla de amortización', 'Impuestos': 'A4 Impuestos',
         '3 años': 'A2 Caja mensual 3 años', 'CT mensual': 'A3 Capital trabajo mensual',
         'Equilibrio': '7 Punto de equilibrio', 'Sensibilidad': 'A5 Sensibilidad', 'Resumen': '6 Tasa de descuento'}
MOTOR_MM = {'Calc inversión', 'Calc resultados', 'Calc depreciación', 'Calc financiero', 'Calc sensibilidad'}
CURSO = list(dict.fromkeys(HOGAR.values()))
RENOMBRE = {'Mensual': 'Motor mensual', 'Anual': 'Motor anual', 'Calc inversión': 'Motor inversión',
            'Calc resultados': 'Motor resultados', 'Calc depreciación': 'Motor depreciación',
            'Calc financiero': 'Motor financiero', 'Calc sensibilidad': 'Motor sensibilidad',
            'Tablero datos': 'Datos del tablero'}
M = 1000000
# Celdas de Datos expresadas en millones (columna Unidad = «MM CLP»)
DATOS_MM = {r for r in range(1, w['Datos'].max_row + 1) if str(w['Datos'].cell(r, 4).value or '').startswith('MM')}


# ------------------------------------------------------------------------------------------------ utilidades
def parse_ref(texto, hoja_actual):
    if '!' in texto:
        h, rg = texto.rsplit('!', 1)
        h = h[1:-1].replace("''", "'") if h.startswith("'") else h
    else:
        h, rg = hoja_actual, texto
    rg = rg.replace('$', '')
    if not re.fullmatch(r'[A-Z]{1,3}\d+(:[A-Z]{1,3}\d+)?', rg):
        return None
    c1, r1, c2, r2 = range_boundaries(rg if ':' in rg else f'{rg}:{rg}')
    return h, c1, r1, c2, r2


def ref_txt(h, c1, r1, c2=None, r2=None):
    a = f'${L(c1)}${r1}'
    if c2 is not None and (c2, r2) != (c1, r1):
        a += f':${L(c2)}${r2}'
    return f"'{h}'!{a}"


def fila_de(hoja, etiqueta, inicio=False, col=2):
    for row in w[hoja].iter_rows(min_col=col, max_col=col):
        v = row[0].value
        if isinstance(v, str) and (v.startswith(etiqueta) if inicio else v == etiqueta):
            return row[0].row
    raise KeyError(f'{hoja}: {etiqueta}')


# ------------------------------------------------------------------------------------------------ 1) mapa
# MAPA[(hoja_v6, col, fila)] = lista de (hoja_curso, col, fila, signo, escala)
MAPA = defaultdict(list)
ESPEJO = {}      # celda del curso -> (hoja_v6, col, fila, signo, escala)
simple = re.compile(r"^=(-?)'([^']+)'!\$?([A-Z]+)\$?(\d+)(\*1000000)?$")
for h in CURSO:
    for row in w[h].iter_rows():
        for z in row:
            if isinstance(z.value, str):
                m = simple.match(z.value)
                if m and m.group(2) in PRES:
                    s = -1 if m.group(1) else 1
                    k = M if m.group(5) else 1
                    clave = (m.group(2), CI(m.group(3)), int(m.group(4)))
                    MAPA[clave].append((h, z.column, z.row, s, k))
                    ESPEJO[(h, z.column, z.row)] = clave + (s, k)


def equivalente(h6, celda6, h, celda, s=1, k=M):
    c, r = re.match(r'([A-Z]+)(\d+)', celda6).groups()
    cc, rr = re.match(r'([A-Z]+)(\d+)', celda).groups()
    MAPA[(h6, CI(c), int(r))].append((h, CI(cc), int(rr), s, k))


def fila_equiv(h6, fila6, cols6, h, fila, cols, s=1, k=M):
    for a, b in zip(cols6, cols):
        equivalente(h6, f'{a}{fila6}', h, f'{b}{fila}', s, k)


AN = 'CDEFGH'
for h6, h, fin in [('Flujo puro', '4 Flujo puro', 'Flujo de caja libre (FCL)'),
                   ('Flujo inversionista', '5 Flujo financiado', 'Flujo de caja del inversionista')]:
    fila_equiv(h6, 64, AN, h, fila_de(h, fin), AN)
    fila_equiv(h6, 26, AN[1:], h, fila_de(h, 'EBITDA'), AN[1:])
    fila_equiv(h6, 38, AN[1:], h, fila_de(h, 'Resultado antes de impuesto'), AN[1:])
    fila_equiv(h6, 65, AN, h, fila_de(h, 'Flujo descontado'), AN)
    fila_equiv(h6, 67, AN, h, fila_de(h, 'Flujo descontado acumulado'), AN)
    equivalente(h6, 'C70', h, f"C{fila_de(h, 'VAN')}")
    equivalente(h6, 'C71', h, f"C{fila_de(h, 'TIR')}", k=1)
    equivalente(h6, 'C69', h, f"C{fila_de(h, 'Tasa de descuento', True)}", k=1)
fila_equiv('Flujo puro', 6, AN[1:], '2 Ingresos y costos', fila_de('2 Ingresos y costos', 'Instalaciones'), AN[1:], k=1)
fila_equiv('Flujo inversionista', 6, AN[1:], '2 Ingresos y costos', fila_de('2 Ingresos y costos', 'Instalaciones'), AN[1:], k=1)
i1 = '1 Inversión'
equivalente('Inversión', 'E13', i1, f"E{fila_de(i1, 'Total activo fijo')}")
equivalente('Inversión', 'H39', i1, f"J{fila_de(i1, 'Total activo fijo')}")
equivalente('Inversión', 'F24', i1, f"F{fila_de(i1, 'Total gastos de puesta en marcha')}")
equivalente('Inversión', 'F29', i1, f"C{fila_de(i1, 'Desembolso total antes de abrir')}")
equivalente('Inversión', 'F31', i1, f"C{fila_de(i1, 'Inversión equivalente en el año 0')}")
c3 = '3 Capital de trabajo'
fila_equiv('Capital de trabajo', 12, AN, c3, fila_de(c3, 'Capital de trabajo requerido al cierre'), AN)
fila_equiv('Capital de trabajo', 13, AN, c3, fila_de(c3, 'Inversión en capital de trabajo (aumento del saldo)'), AN, s=-1)
d5 = '5.1 Tabla de amortización'
fila_equiv('Deuda', 50, AN, d5, fila_de(d5, 'Flujo neto de la deuda'), AN)
equivalente('Deuda', 'C52', d5, f"C{fila_de(d5, 'VAN de la deuda (a Kd)')}")
equivalente('Deuda', 'C53', d5, f"C{fila_de(d5, 'VAN ajustado', True)}")
e7 = '7 Punto de equilibrio'
fila_equiv('Equilibrio', 11, 'DEFGH', e7, fila_de(e7, 'Punto de equilibrio (instalaciones)'), 'CDEFG', k=1)
c2 = '2 Ingresos y costos'
fila_equiv('Costos', 23, 'EFGHI', c2, fila_de(c2, 'Margen de contribución'), 'DEFGH')
fila_equiv('Costos', 41, 'EFGHI', c2, fila_de(c2, 'Resultado antes de depreciación', True), 'DEFGH')
t6 = '6 Tasa de descuento'
equivalente('Resumen', 'D38', t6, f"D{fila_de(t6, 'Flujo puro a WACC (referencia)')}")


def es_dinero(h6, c, r):
    """Unidad de una celda de la v6: por su espejo en el curso o, si no tiene, por su formato numérico."""
    for (_, _, _, s, k) in MAPA.get((h6, c, r), []):
        return k == M
    if str(w[h6].cell(r, 2).value or '').startswith('Payback'):
        return False                       # auxiliares del payback: años, no pesos
    fmt = w[h6].cell(r, c).number_format
    return not ('%' in fmt or fmt.startswith('#,##0;') or fmt == 'General')


# ------------------------------------------------------------------------------------------------ 2) celdas sin hogar
REF_RE = re.compile(r"(?:'(?:[^']|'')+'|[A-Za-zÁÉÍÓÚáéíóúÑñ_][\wÁÉÍÓÚáéíóúÑñ. ]*?)!\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?|\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?")


def refs_de(formula, hoja):
    out = []
    for t in Tokenizer(formula).items:
        if t.type == 'OPERAND' and t.subtype == 'RANGE':
            p = parse_ref(t.value, hoja)
            if p:
                out.append(p)
    return out


def celdas(p):
    h, c1, r1, c2, r2 = p
    return [(h, c, r) for r in range(r1, r2 + 1) for c in range(c1, c2 + 1)]


pendientes, sin_hogar = [], set()
for h in w.sheetnames:
    for row in w[h].iter_rows():
        for z in row:
            if not (isinstance(z.value, str) and z.value.startswith('=')):
                continue
            if h in PRES:
                continue
            if (h, z.column, z.row) in ESPEJO:
                h6, c, r, _, _ = ESPEJO[(h, z.column, z.row)]
                f6 = w[h6].cell(r, c).value
                if isinstance(f6, str) and f6.startswith('='):
                    pendientes.append((h6, f6))
                continue
            pendientes.append((h, z.value))
while pendientes:
    h, f = pendientes.pop()
    for p in refs_de(f, h):
        if p[0] not in PRES:
            continue
        for cel in celdas(p):
            if cel in MAPA or cel in sin_hogar:
                continue
            v = w[cel[0]].cell(cel[2], cel[1]).value
            if v is None:
                continue
            sin_hogar.add(cel)
            if isinstance(v, str) and v.startswith('='):
                pendientes.append((cel[0], v))

# Filas auxiliares visibles al pie de la hoja del curso correspondiente (mismas columnas que en la v6)
AUX = defaultdict(lambda: defaultdict(list))
for (h6, c, r) in sin_hogar:
    AUX[h6][r].append(c)
for h6, filas in AUX.items():
    hc = w[HOGAR[h6]]
    r0 = hc.max_row + 3
    hc.cell(r0, 2, 'Cálculos auxiliares').font = Font(name='Calibri', bold=True, color='12AAE9')
    hc.cell(r0, 3, 'Celdas intermedias que usan las fórmulas de arriba; no requieren revisión aparte.').font = \
        Font(name='Calibri', italic=True, size=9, color='595959')
    rr = r0 + 1
    for r in sorted(filas):
        etq = w[h6].cell(r, 2).value or w[h6].cell(r, 1).value or f'Fila {r}'
        hc.cell(rr, 2, str(etq) if not str(etq).startswith('=') else f'Fila {r}').font = Font(name='Calibri', size=9, color='595959')
        for c in sorted(filas[r]):
            MAPA[(h6, c, r)].append((HOGAR[h6], c, rr, 1, M if es_dinero(h6, c, r) else 1))
            orig = w[h6].cell(r, c)
            z = hc.cell(rr, c)
            z.number_format = (r'_ "$"* #,##0_ ;_ "$"* \-#,##0_ ;_ "$"* "-"_ ;_ @_ ' if es_dinero(h6, c, r)
                               else orig.number_format)
            z.font = Font(name='Calibri', size=9, color='595959')
        rr += 1
print('Celdas auxiliares:', {h: sum(len(v) for v in f.values()) for h, f in AUX.items()})


# ------------------------------------------------------------------------------------------------ 3) traducción
def destino(cel, preferir=None):
    """Mejor espejo de una celda de la v6: signo +, y si se pide, en la hoja indicada."""
    ops = MAPA[cel]
    ops = sorted(ops, key=lambda o: (o[3] != 1, o[0] != (preferir or o[0])))
    return ops[0]


def traducir_rango(p, hoja_actual):
    """Devuelve (texto, escala_curso) para un rango de la v6, o None si no hay un rango equivalente contiguo."""
    cs = celdas(p)
    filas = sorted({r for _, _, r in cs}); cols = sorted({c for _, c, _ in cs})
    for cand in MAPA.get(cs[0], []):
        h, c0, r0, s, k = cand
        if s != 1:
            continue
        ok = True
        for (hh, c, r) in cs:
            esperado = (h, c0 + (c - cs[0][1]), r0 + (r - cs[0][2]), 1, k)
            if esperado not in MAPA.get((hh, c, r), []) and w[hh].cell(r, c).value is not None:
                ok = False
                break
        if ok:
            return ref_txt(h, c0, r0, c0 + (p[3] - p[1]), r0 + (p[4] - p[2])), k
    return None


FUNC_ESCALABLES = ('SUM(', 'MIN(', 'MAX(', 'INDEX(', 'NPV(', 'SUMIF(', 'CHOOSE(')


def reescribir(formula, hoja, mundo, dinero=True):
    """mundo='pesos' (fórmula movida al curso) o 'mm' (la fórmula sigue esperando millones)."""
    items = Tokenizer(formula).items
    out = []           # lista de [texto, prefijo, sufijo]
    pila = []          # índices de funciones abiertas
    envueltas = set()

    def envolver(j, sufijo):
        if j in envueltas or out[j][0].upper() not in FUNC_ESCALABLES:
            return
        envueltas.add(j)
        out[j][1] = '(' + out[j][1]
        out[j].append(('suf', sufijo))
    i = 0
    while i < len(items):
        t = items[i]
        txt = t.value
        if t.type == 'FUNC' and t.subtype == 'OPEN':
            pila.append(len(out))
            out.append([txt, '', ''])
            i += 1
            continue
        if t.type == 'FUNC' and t.subtype == 'CLOSE':
            j = pila.pop()
            out.append([txt, '', ''])
            out[j].append(len(out) - 1)      # índice de cierre
            i += 1
            continue
        if mundo == 'pesos' and dinero and t.type == 'OPERATOR-INFIX' and t.value == '/' and i + 1 < len(items) \
                and items[i + 1].type == 'OPERAND' and items[i + 1].value == '1000000':
            i += 2
            continue
        if t.type == 'OPERAND' and t.subtype == 'RANGE':
            p = parse_ref(t.value, hoja)
            if p and p[0] in PRES:
                unica = p[1] == p[3] and p[2] == p[4]
                if unica:
                    cel = (p[0], p[1], p[2])
                    h, c, r, s, k = destino(cel)
                    ref = ref_txt(h, c, r)
                    if s == -1:
                        ref = f'(-{ref})'
                    if mundo == 'mm' and k == M:
                        ref = f'({ref}/1000000)'
                    txt = ref
                else:
                    tr = traducir_rango(p, hoja)
                    if tr is None:
                        # sin rango equivalente: se expande a la lista de celdas (válido en SUM, MIN, MAX y NPV)
                        partes = []
                        for cel in celdas(p):
                            if w[cel[0]].cell(cel[2], cel[1]).value is None and cel not in MAPA:
                                continue
                            h, c, r, s, k = destino(cel)
                            ref = ref_txt(h, c, r)
                            ref = f'(-{ref})' if s == -1 else ref
                            partes.append(f'({ref}/1000000)' if (mundo == 'mm' and k == M) else ref)
                        fn = out[pila[-1]][0].upper() if pila else ''
                        if fn == 'INDEX(':
                            out[pila[-1]][0] = 'CHOOSE('
                            # INDEX(rango,1,k) -> CHOOSE(k, ...): se reordena al cerrar
                            out[pila[-1]].append(('choose', partes))
                            txt = '\x00'
                        else:
                            txt = ','.join(partes)
                    else:
                        txt, k = tr
                        if mundo == 'mm' and k == M:
                            if pila and out[pila[-1]][0].upper() in FUNC_ESCALABLES:
                                envolver(pila[-1], '/1000000)')
                            elif i + 2 < len(items) and items[i + 1].value == '*' and items[i + 2].value == '1000000':
                                out.append([txt, '', ''])      # rango ya en pesos: se omite el «*1000000» que seguía
                                i += 3
                                continue
            elif p and mundo == 'pesos' and dinero and (p[0] in MOTOR_MM or (p[0] == 'Datos' and p[2] in DATOS_MM)):
                unica = p[1] == p[3] and p[2] == p[4]
                if unica:
                    txt = f'({t.value}*1000000)'
                elif pila:
                    envolver(pila[-1], '*1000000)')
        out.append([txt, '', ''])
        i += 1
    # ensamblar con prefijos/sufijos de funciones
    sufijos = defaultdict(str)
    choose = {}
    for idx, e in enumerate(out):
        extras = e[3:]
        cierre = next((x for x in extras if isinstance(x, int)), None)
        for x in extras:
            if isinstance(x, tuple) and x[0] == 'suf' and cierre is not None:
                sufijos[cierre] += x[1]
            if isinstance(x, tuple) and x[0] == 'choose':
                choose[idx] = (cierre, x[1])
    texto = ''
    saltar = set()
    for idx, e in enumerate(out):
        if idx in saltar:
            continue
        if idx in choose:
            cierre, partes = choose[idx]
            # tokens entre el paréntesis: '\x00' , 1 , expr  -> CHOOSE(expr, partes)
            interior = ''.join(x[0] for x in out[idx + 1:cierre])
            args = interior.split(',', 2)
            texto += e[1] + 'CHOOSE(' + args[2] + ',' + ','.join(partes) + ')' + sufijos.get(cierre, '')
            saltar.update(range(idx + 1, cierre + 1))
            continue
        texto += e[1] + e[0] + sufijos.get(idx, '')
    return '=' + texto


def simplificar(f):
    previo = None
    while previo != f:
        previo = f
        f = re.sub(r"\(('[^']+'!\$[A-Z]+\$\d+)/1000000\)\*1000000", r'\1', f)
        f = re.sub(r"\(\((-'[^']+'!\$[A-Z]+\$\d+)\)/1000000\)\*1000000", r'(\1)', f)
        f = re.sub(r"\(\((SUM|MIN|MAX|INDEX|NPV)\(([^()]*)\)/1000000\)\)\*1000000", r'\1(\2)', f)
        f = re.sub(r"\((SUM|MIN|MAX|INDEX|NPV)\(([^()]*)\)/1000000\)\*1000000", r'\1(\2)', f)
        f = re.sub(r"\(\(('[^']+'!\$[A-Z]+\$\d+)/1000000\)-\(('[^']+'!\$[A-Z]+\$\d+)/1000000\)\)\*1000000", r'(\1-\2)', f)
        f = re.sub(r"\(('[^']+'!\$[A-Z]+\$\d+)/1000000\)/('[^']+'!\$[A-Z]+\$\d+)\*1000000", r'\1/\2', f)
        f = re.sub(r"-\(-('[^']+'!\$[A-Z]+\$\d+)\)", r'+\1', f)
        f = f.replace('=+', '=').replace('(+', '(')
    return f


# Fórmulas movidas (espejos -> fórmula real) y celdas auxiliares
nuevas = {}
for (h, c, r), (h6, c6, r6, s, k) in ESPEJO.items():
    f6 = w[h6].cell(r6, c6).value
    if isinstance(f6, str) and f6.startswith('='):
        expr = reescribir(f6, h6, 'pesos', dinero=(k == M))[1:]
        nuevas[(h, c, r)] = '=' + (f'-({expr})' if s == -1 else expr)
    else:
        nuevas[(h, c, r)] = (f6 * s * k if isinstance(f6, (int, float)) and not isinstance(f6, bool) else f6)
for (h6, c6, r6) in sin_hogar:
    h, c, r, s, k = destino((h6, c6, r6), HOGAR[h6])
    f6 = w[h6].cell(r6, c6).value
    if isinstance(f6, str) and f6.startswith('='):
        nuevas[(h, c, r)] = '=' + reescribir(f6, h6, 'pesos', dinero=(k == M))[1:]
    else:
        nuevas[(h, c, r)] = f6 * (M if (k == M and isinstance(f6, (int, float))) else 1) if isinstance(f6, (int, float)) else f6

# Resto de fórmulas fuera de las hojas de la v6: referencias a la v6 -> curso (en millones donde corresponda)
for h in w.sheetnames:
    if h in PRES:
        continue
    for row in w[h].iter_rows():
        for z in row:
            if (h, z.column, z.row) in nuevas:
                continue
            if isinstance(z.value, str) and z.value.startswith('=') and any(f"{p}'!" in z.value or f"{p}!" in z.value for p in PRES):
                z.value = simplificar(reescribir(z.value, h, 'mm'))
for (h, c, r), v in nuevas.items():
    w[h].cell(r, c).value = simplificar(v) if isinstance(v, str) and v.startswith('=') else v

# Referencias a la propia hoja sin el nombre de la hoja (más fáciles de leer)
for ws in w.worksheets:
    pref = f"'{ws.title}'!"
    for row in ws.iter_rows():
        for z in row:
            if isinstance(z.value, str) and z.value.startswith('=') and pref in z.value and 'HYPERLINK' not in z.value:
                z.value = z.value.replace(pref, '')
# Nota de lectura
for row in w['Notas y cambios'].iter_rows():
    for z in row:
        if isinstance(z.value, str) and z.value.startswith('Cambiar supuestos solo en Datos'):
            z.value = ('Cambiar supuestos solo en Datos (el escenario de demanda se elige en el Tablero) y comprobar que '
                       'Controles sea 0. No hay hojas ocultas: las hojas 1 a 7 y los anexos A1 a A5 tienen las fórmulas '
                       'reales en pesos; las hojas «Motor ...» (en millones) calculan la operación mes a mes y leen sus '
                       'parámetros desde Datos y desde las hojas del curso. Cada fórmula se puede seguir con «Rastrear '
                       'precedentes» o Ctrl + [.')

# ------------------------------------------------------------------------------------------------ 4) limpiar
for h in PRES:
    del w[h]
restos = [(ws.title, z.coordinate, z.value[:80]) for ws in w.worksheets for row in ws.iter_rows() for z in row
          if isinstance(z.value, str) and z.value.startswith('=') and any(p[0] in PRES for p in refs_de(z.value, ws.title))]
assert not restos, f'quedan referencias a hojas eliminadas: {restos[:5]}'


# Renombrar el motor (y actualizar todas las referencias, incluidas las de los enlaces y gráficos)
def renombrar_en(f):
    for viejo, nuevo in RENOMBRE.items():
        f = re.sub(rf"'{re.escape(viejo)}'!", f"'{nuevo}'!", f)
        if ' ' not in viejo:
            f = re.sub(rf"(?<![\w'#]){re.escape(viejo)}!", f"'{nuevo}'!", f)
    return f


for ws in w.worksheets:
    for row in ws.iter_rows():
        for z in row:
            if isinstance(z.value, str) and z.value.startswith('='):
                z.value = renombrar_en(z.value)
    for ch in ws._charts:
        for sr in ch.series:
            for ref in (sr.val.numRef if sr.val else None, sr.cat.strRef if sr.cat and sr.cat.strRef else None,
                        sr.cat.numRef if sr.cat and sr.cat.numRef else None,
                        sr.tx.strRef if sr.tx and sr.tx.strRef else None):
                if ref is not None and ref.f:
                    ref.f = renombrar_en(ref.f)
        for sub in getattr(ch, '_charts', []):
            for sr in sub.series:
                for ref in (sr.val.numRef if sr.val else None, sr.cat.strRef if sr.cat and sr.cat.strRef else None,
                            sr.cat.numRef if sr.cat and sr.cat.numRef else None,
                            sr.tx.strRef if sr.tx and sr.tx.strRef else None):
                    if ref is not None and ref.f:
                        ref.f = renombrar_en(ref.f)
for ws in w.worksheets:
    if ws.title in RENOMBRE:
        ws.title = RENOMBRE[ws.title]
for ws in w.worksheets:
    ws.sheet_state = 'visible'
    if ws.title.startswith('Motor') or ws.title == 'Datos del tablero':
        ws.sheet_properties.tabColor = '8B9598'
        ws.oddHeader.left.text = 'MOTOR DE CÁLCULO'
orden = ['Tablero', 'Escenarios y cambios', 'Datos'] + CURSO[:0] + [
    '1 Inversión', '2 Ingresos y costos', '3 Capital de trabajo', '4 Flujo puro', '5 Flujo financiado',
    '5.1 Tabla de amortización', '6 Tasa de descuento', '7 Punto de equilibrio', 'A1 Calendario inversión',
    'A2 Caja mensual 3 años', 'A3 Capital trabajo mensual', 'A4 Impuestos', 'A5 Sensibilidad', 'Controles',
    'Notas y cambios', 'Motor mensual', 'Motor anual', 'Motor inversión', 'Motor resultados', 'Motor depreciación',
    'Motor financiero', 'Motor sensibilidad', 'Datos del tablero']
assert sorted(orden) == sorted(w.sheetnames), set(w.sheetnames) ^ set(orden)
w._sheets = [w[t] for t in orden]
w.active = 0
w.calculation.fullCalcOnLoad = True
w.save(SAL)
print('Transparente:', SAL, '·', len(nuevas), 'fórmulas movidas a las hojas del curso')
