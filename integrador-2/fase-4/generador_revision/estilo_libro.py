#!/usr/bin/env python3
"""Formato del curso para las hojas de cálculo (motor), Datos, Controles y Notas. Solo formato y rótulos.

No cambia fórmulas existentes. Agrega: rótulos a las filas que no tenían nombre, encabezados de meses, totales por
fila en columnas libres (que nadie más lee) y la misma paleta y formatos de número de las hojas 1 a 7.
Uso: estilo_libro.py ENTRADA SALIDA
"""
import re
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L

ENT, SAL = sys.argv[1], sys.argv[2]
w = openpyxl.load_workbook(ENT)

CEL, CLARO, GRIS = '12AAE9', 'EAF7FD', '595959'
F = 'Calibri'
PESO = r'_ "$"* #,##0_ ;_ "$"* \-#,##0_ ;_ "$"* "-"_ ;_ @_ '
UNI = r'#,##0_ ;\-#,##0_ ;"-"_ '
DEC = r'#,##0.00_ ;\-#,##0.00_ ;"-"_ '
PCT = '0.00%'
LINEA = Side(style='thin', color=CEL)


def fuente(z, size=10, bold=False, italic=False, color='000000'):
    z.font = Font(name=F, size=size, bold=bold, italic=italic, color=color)


def banda(ws, fila, c1, c2):
    for c in range(c1, c2 + 1):
        z = ws.cell(fila, c)
        z.fill = PatternFill('solid', fgColor=CEL)
        fuente(z, 10, True, color='FFFFFF')
        z.alignment = Alignment(horizontal='left' if c <= 2 else 'center', vertical='center', wrap_text=c <= 2)


def seccion(ws, fila, c1, c2):
    for c in range(c1, c2 + 1):
        z = ws.cell(fila, c)
        z.fill = PatternFill('solid', fgColor=CLARO)
        z.border = Border(top=LINEA)
        fuente(z, 10, True, color=CEL)


def titulo(ws, ref, texto, bajada=None, ref_bajada=None):
    ws[ref] = texto
    fuente(ws[ref], 16, True, color=CEL)
    if bajada is not None:
        ws[ref_bajada] = bajada
        fuente(ws[ref_bajada], 10, italic=True, color=GRIS)
        ws[ref_bajada].alignment = Alignment(wrap_text=True, vertical='top')


def formato_unidad(u):
    u = str(u or '').strip().lower()
    if u.startswith('$'):
        return PESO
    if u == '%':
        return PCT
    if u == 'factor':
        return '0.0000'
    if u in ('jornadas',):
        return '0.00'
    if u in ('semanas',):
        return '0.0'
    return UNI


def preparar(ws, zoom=85):
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = zoom
    ws.sheet_properties.tabColor = '8B9598'


# ------------------------------------------------------------------------------------------------ Motor mensual
m = w['Motor mensual']
preparar(m, 80)
UC = m.max_column
banda(m, 1, 1, UC)
m['A1'] = 'Concepto (pesos de 2026, netos de IVA)'
m['C1'] = 'Total del período'
for c in range(4, UC + 1):
    z = m.cell(1, c, f'={L(c)}$4')
    z.number_format = 'mmm-yy'
for r in range(2, m.max_row + 1):
    a, b, d = m.cell(r, 1).value, m.cell(r, 2).value, m.cell(r, 4).value
    if a and b is None and d is None:
        seccion(m, r, 1, UC)
        continue
    fmt = formato_unidad(b)
    for c in range(3, UC + 1):
        z = m.cell(r, c)
        fuente(z, 10, italic=r <= 8, color=GRIS if r <= 8 else '000000')
        if r == 4:
            z.number_format = 'mmm-yy'
        elif r != 5:
            z.number_format = fmt
    fuente(m.cell(r, 1), 10, italic=r <= 8, color=GRIS if r <= 8 else '000000')
    fuente(m.cell(r, 2), 9, color=GRIS)
    etq = str(a or '')
    if any(etq.startswith(x) for x in ('Margen de contribución', 'Nómina y honorarios', 'Gasto de operación',
                                        'Marketing fijo', 'Resultado operativo', 'Flujo de caja del mes',
                                        'Inversión en equipamiento', 'Instalaciones')):
        for c in range(1, UC + 1):
            m.cell(r, c).font = Font(name=F, size=10, bold=True)
m.column_dimensions['A'].width = 62
m.column_dimensions['B'].width = 12
m.column_dimensions['C'].width = 17
for c in range(4, UC + 1):
    m.column_dimensions[L(c)].width = 14
m.freeze_panes = 'D2'

# ------------------------------------------------------------------------------------------------ Motor anual
a = w['Motor anual']
preparar(a)
banda(a, 1, 1, a.max_column)
a['A1'] = 'Concepto (suma o saldo de los meses de cada etapa)'
unidad_mensual = {r: m.cell(r, 2).value for r in range(1, m.max_row + 1)}
for r in range(2, a.max_row + 1):
    etq, f = a.cell(r, 1).value, a.cell(r, 2).value
    if etq and all(a.cell(r, c).value is None for c in range(2, a.max_column + 1)):
        seccion(a, r, 1, a.max_column)
        continue
    fmt = UNI
    texto = ' '.join(str(a.cell(r, c).value) for c in range(2, 4))
    ref = re.search(r"'Motor mensual'!\$D\$(\d+)", texto)
    if ref:
        fmt = formato_unidad(unidad_mensual.get(int(ref.group(1))))
    if '($' in str(etq) or 'Margen de contribución por instalación' in str(etq) or 'Financiamiento requerido' in str(etq):
        fmt = PESO
    if 'Uso de la capacidad' in str(etq):
        fmt = PCT
    for c in range(2, a.max_column + 1):
        a.cell(r, c).number_format = fmt
        fuente(a.cell(r, c), 10)
    fuente(a.cell(r, 1), 10, bold=str(etq) in ('Resultado operativo', 'Flujo de caja', 'Margen de contribución de las instalaciones'))
a.column_dimensions['A'].width = 62
for c in range(2, a.max_column + 1):
    a.column_dimensions[L(c)].width = 16
a.freeze_panes = 'B2'

# ------------------------------------------------------------------------------------------------ Motor depreciación
d = w['Motor depreciación']
preparar(d)
UC = d.max_column
titulo(d, 'A1', 'Motor de depreciación (mensual, por activo)',
       'Pesos de 2026. Depreciación lineal desde el mes en que cada equipo entra en servicio, según el valor y la vida '
       'útil de la hoja 1; los puestos nuevos suman su propia cuota. La hoja 4 suma estos meses por año.', 'A2')
d['B4'] = 'Mes'
d['B5'] = 'Mes de operación'
d['C4'] = 'Total'
for c in range(4, UC + 1):
    d.cell(4, c, f"='Motor mensual'!{L(c)}4").number_format = 'mmm-yy'
    d.cell(5, c, f"='Motor mensual'!{L(c)}7").number_format = UNI
banda(d, 4, 2, UC)
for c in range(2, UC + 1):
    fuente(d.cell(5, c), 9, italic=True, color=GRIS)
d['B14'] = 'Depreciación total del mes'
for r in list(range(6, 13)) + [14]:
    d.cell(r, 3, f'=SUM(D{r}:{L(UC)}{r})')
    for c in range(3, UC + 1):
        d.cell(r, c).number_format = PESO
        fuente(d.cell(r, c), 10, bold=r == 14)
    fuente(d.cell(r, 2), 10, bold=r == 14)
seccion(d, 14, 2, UC)
for c in range(2, UC + 1):
    d.cell(14, c).font = Font(name=F, size=10, bold=True)
d.column_dimensions['B'].width = 40
d.column_dimensions['C'].width = 17
for c in range(4, UC + 1):
    d.column_dimensions[L(c)].width = 13
d.freeze_panes = 'D6'

# ------------------------------------------------------------------------------------------------ Motor financiero
fz = w['Motor financiero']
preparar(fz)
UC = fz.max_column
titulo(fz, 'A1', 'Motor financiero (mensual)',
       'Pesos de 2026. Resultado tributario, impuesto, flujo puro, deuda y flujo del inversionista mes a mes '
       '(enero de 2027 = mes −17; cierre en el mes 60). Las hojas 4, 5, 5.1 y A4 resumen este cálculo por año.', 'A2')
ROT = {4: 'Mes', 5: 'Mes de operación (negativo = antes de abrir)', 6: 'Año de operación', 7: 'Año comercial',
       8: 'Resultado operativo devengado (EBITDA del mes)', 9: 'Caja operativa del mes (cobros − pagos + IVA)',
       10: 'Depreciación del mes', 11: 'Amortización de puesta en marcha y software',
       12: 'Resultado tributario sin deuda', 13: 'Intereses devengados del mes',
       14: 'Resultado tributario con deuda', 15: 'Impuesto pagado · proyecto sin deuda (abril y cierre)',
       16: 'Impuesto pagado · proyecto con deuda (abril y cierre)', 17: 'Inversión en equipamiento del mes',
       18: 'Capital de trabajo al cierre del mes', 19: 'Variación del capital de trabajo',
       20: 'Flujo operativo después de impuesto (desde la apertura)', 21: 'Desembolsos antes de abrir (mes 0 incluye software)',
       22: 'Flujo de caja puro del mes', 23: 'Flujo de caja puro acumulado',
       24: 'Financiamiento necesario sin deuda (déficit acumulado)',
       25: 'Préstamo: desembolso en el mes 0 y amortización anual', 26: 'Flujo de caja del inversionista del mes',
       27: 'Flujo del inversionista acumulado', 28: 'Impuesto determinado · sin deuda (cierre de cada año)',
       29: 'Impuesto determinado · con deuda (cierre de cada año)', 30: 'Intereses pagados (cierre de cada año del préstamo)'}
SECC = {8: 'Resultado tributario', 15: 'Impuesto y flujo puro', 25: 'Deuda y flujo del inversionista',
        28: 'Cierres anuales'}
for r, t in ROT.items():
    fz.cell(r, 2, t)
fz['C4'] = 'Total'
banda(fz, 4, 2, UC)
for c in range(4, UC + 1):
    fz.cell(4, c).number_format = 'mmm-yy'
SALDOS = {18, 23, 24, 27}
for r in range(5, 31):
    for c in range(3, UC + 1):
        z = fz.cell(r, c)
        fuente(z, 10, italic=r <= 7, color=GRIS if r <= 7 else '000000')
        z.number_format = '0' if r == 7 else (UNI if r <= 6 else PESO)
    fuente(fz.cell(r, 2), 10, italic=r <= 7, color=GRIS if r <= 7 else '000000')
    if r >= 8 and r not in SALDOS:
        fz.cell(r, 3, f'=SUM(D{r}:{L(UC)}{r})')
for r in (12, 14, 22, 26):
    seccion(fz, r, 2, UC)
    for c in range(2, UC + 1):
        fz.cell(r, c).font = Font(name=F, size=10, bold=True)
fz.column_dimensions['A'].width = 3
fz.column_dimensions['B'].width = 52
fz.column_dimensions['C'].width = 17
for c in range(4, UC + 1):
    fz.column_dimensions[L(c)].width = 14
fz.freeze_panes = 'D5'

# ------------------------------------------------------------------------------------------------ Motor sensibilidad
s = w['Motor sensibilidad']
preparar(s)
titulo(s, 'A1', 'Motor de sensibilidad del precio',
       'Pesos de 2026. Cada bloque vuelve a calcular el impuesto y el flujo puro con un cambio de precio, a volumen '
       'constante. Los primeros bloques alimentan la tabla del anexo A5; los siguientes buscan por bisección el cambio '
       'de precio que deja el VAN puro en cero (hoja 7).', 'A2')
inicios = [r for r in range(1, s.max_row + 1) if s.cell(r, 2).value == 'Variación precio']
n_tabla = sum(1 for r in inicios if "'A5 Sensibilidad'" in str(s.cell(r, 3).value))
for i, r in enumerate(inicios):
    caso = f'Tabla A5 · caso {i + 1}' if i < n_tabla else f'Búsqueda del VAN = 0 · paso {i + 1 - n_tabla}'
    s.cell(r, 2, f'Variación del precio  ·  {caso}')
    s.cell(r, 3).number_format = PCT
    seccion(s, r, 2, 10)
    for rr in range(r + 1, r + 11):
        for c in range(2, 11):
            if s.cell(rr, c).font.b is not True:
                fuente(s.cell(rr, c), 10, color=GRIS if rr in (r + 1, r + 7) else '000000')
    s.cell(r + 1, 2, 'Año comercial')
    for c in range(4, 11):
        s.cell(r + 1, c).number_format = '0'
        fuente(s.cell(r + 1, c), 9, True, color=GRIS)
    for k, t in [(2, 'Resultado tributario con el precio ajustado'), (3, 'Pérdida tributaria al inicio del año'),
                 (4, 'Impuesto determinado'), (5, 'Pérdida tributaria al cierre del año')]:
        s.cell(r + k, 2, t)
        for c in range(4, 11):
            s.cell(r + k, c).number_format = PESO
    s.cell(r + 7, 2, 'Año del flujo')
    for j, c in enumerate(range(3, 9)):
        s.cell(r + 7, c, f'Año {j}')
        fuente(s.cell(r + 7, c), 9, True, color=GRIS)
        s.cell(r + 7, c).alignment = Alignment(horizontal='right')
    s.cell(r + 8, 2, 'Flujo de caja puro con el precio ajustado')
    s.cell(r + 10, 2, 'VAN a Ku')
    for c in range(3, 9):
        s.cell(r + 8, c).number_format = PESO
    s.cell(r + 10, 3).number_format = PESO
    fuente(s.cell(r + 10, 2), 10, True)
    fuente(s.cell(r + 10, 3), 10, True)
    if s.cell(r - 1, 3).value is not None and i >= n_tabla:
        s.cell(r - 1, 2, 'Intervalo de búsqueda (desde, hasta)')
        s.cell(r - 1, 3).number_format = PCT
        s.cell(r - 1, 4).number_format = PCT
        fuente(s.cell(r - 1, 2), 9, italic=True, color=GRIS)
s.column_dimensions['B'].width = 52
for c in range(3, 11):
    s.column_dimensions[L(c)].width = 17
s.freeze_panes = 'C4'

# ------------------------------------------------------------------------------------------------ Datos, Controles, Notas
for nombre, tit in [('Datos', 'Datos y supuestos'), ('Controles', 'Controles del modelo'),
                    ('Notas y cambios', 'Criterios y conciliación')]:
    h = w[nombre]
    h.sheet_view.showGridLines = False
    h['A1'] = tit
    fuente(h['A1'], 16, True, color=CEL)
    fuente(h['A2'], 10, italic=True, color=GRIS)
    h.sheet_properties.tabColor = CEL
c = w['Controles']
banda(c, 5, 2, 3)
for r in range(6, 47):
    c.cell(r, 3).number_format = r'#,##0.00_ ;\-#,##0.00_ ;"0"_ '
c['C5'] = 'Diferencia (debe ser 0)'
n = w['Notas y cambios']
for row in n.iter_rows():
    if row[1].value == 'Indicador':
        banda(n, row[1].row, 2, 4)
    if isinstance(row[1].value, str) and row[2].value is None and row[1].row > 4 and len(row[1].value) < 45:
        fuente(row[1], 11, True, color=CEL)
dt = w['Datos del tablero']
dt.sheet_view.showGridLines = False
dt['A1'] = 'Datos del tablero (series que alimentan las tarjetas y los gráficos; no se editan)'
fuente(dt['A1'], 12, True, color=CEL)
TASAS = {'tir_p', 'tir_i', 'ku', 'ke', 'kd', 'wacc', 'dp', 'pvan0'}
DECIM = {'pbd_p', 'pbd_i', 'bl'}
CUENTA = {'esc', 'flujo', 'ano', 'inst', 'qe1', 'Instalaciones proyectadas', 'Punto de equilibrio'}
for row in dt.iter_rows(min_row=2):
    clave = str(row[0].value or '')
    fmt = PCT if clave in TASAS else '0.00' if clave in DECIM else UNI if clave in CUENTA else PESO
    for z in row[1:]:
        if (isinstance(z.value, str) and z.value.startswith('=')) or isinstance(z.value, (int, float)):
            z.number_format = fmt
            z.font = Font(name=F, size=10)
dt.column_dimensions['A'].width = 44
for col in 'BCDEFGHIJKLMNO':
    dt.column_dimensions[col].width = 16

w.save(SAL)
print('Formato del curso aplicado a', SAL)
