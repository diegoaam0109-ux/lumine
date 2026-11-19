#!/usr/bin/env python3
"""v7 · formato del curso sobre la v6, sin tocar números.

Toma excel/v6_academico_conciliado.xlsx (ya recalculado) y agrega una capa de presentación con el
formato de las clases de Evaluación de Proyectos: hojas 1 a 7 de la estructura de la Fase 4, tabla de
amortización como en la clase (período, cuota, interés, amortización, saldo), flujo con depreciación,
amortización e impuesto en el orden del curso, todo en pesos sin decimales.

Regla: cada cifra es una referencia a la celda de la v6 (multiplicada por 1.000.000 cuando la v6 está
en millones). Lo único que se calcula aquí son subtotales, VAN y TIR, y cada uno tiene un control contra
la v6 en la hoja Controles. Las hojas de la v6 quedan ocultas e intactas.
"""
from pathlib import Path
import sys
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'excel/v6_academico_conciliado.xlsx'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'excel/v7_formato_curso.xlsx'

M = 1000000
PESO = r'_ "$"* #,##0_ ;_ "$"* \-#,##0_ ;_ "$"* "-"_ ;_ @_ '   # formato de las planillas del profesor
UNI = r'#,##0_ ;\-#,##0_ ;"-"_ '
DEC = r'#,##0.00_ ;\-#,##0.00_ ;"-"_ '
PCT = r'0.00%;\-0.00%;"-"'
FAC = '0.0000'
ANOS = '0.00 "años"'
FECHA = 'mmm-yy'

CEL = '12AAE9'; CLARO = 'EAF7FD'; GRIS = '595959'
F = 'Arial'
LINEA = Side(style='thin', color=CEL)
DOBLE = Side(style='double', color='000000')

w = openpyxl.load_workbook(SRC)
v6_visibles = [s.title for s in w.worksheets if s.sheet_state == 'visible']
controles = []          # (etiqueta, fórmula de diferencia en pesos o unidades)


def q(sheet, ref):
    return f"'{sheet}'!{ref}"


def nueva(nombre, titulo, bajada, anchos):
    s = w.create_sheet(nombre)
    s.sheet_view.showGridLines = False
    s.sheet_properties.tabColor = CEL
    s['B1'] = titulo
    s['B1'].font = Font(name=F, size=16, bold=True, color=CEL)
    s['B2'] = bajada
    s['B2'].font = Font(name=F, size=10, italic=True, color=GRIS)
    s.column_dimensions['A'].width = 2
    for i, ancho in enumerate(anchos, start=2):
        s.column_dimensions[L(i)].width = ancho
    s.page_setup.orientation = 'landscape'
    s.page_setup.paperSize = s.PAPERSIZE_LETTER
    s.page_setup.fitToWidth = 1
    s.page_setup.fitToHeight = 0
    s.sheet_properties.pageSetUpPr.fitToPage = True
    s.page_margins.left = s.page_margins.right = 0.4
    s.page_margins.top = s.page_margins.bottom = 0.5
    s.oddFooter.center.text = 'Lumine Motors · Plan financiero · &A · &P de &N'
    s.oddFooter.center.size = 8
    return s


def put(s, r, c, v, fmt=None, bold=False, italic=False, color='000000', align=None, wrap=False, size=11):
    z = s.cell(r, c, v)
    z.font = Font(name=F, size=size, bold=bold, italic=italic, color=color)
    if fmt:
        z.number_format = fmt
    z.alignment = Alignment(horizontal=align, vertical='center', wrap_text=wrap)
    return z


def cabecera(s, r, etiquetas, c0=2):
    for i, t in enumerate(etiquetas):
        z = put(s, r, c0 + i, t, bold=True, color='FFFFFF', align='left' if i == 0 else 'center', wrap=True)
        z.fill = PatternFill('solid', fgColor=CEL)
    s.row_dimensions[r].height = 30


def estilo_fila(s, r, c1, c2, tipo):
    for c in range(c1, c2 + 1):
        z = s.cell(r, c)
        if tipo == 'sub':
            z.font = Font(name=F, size=11, bold=True)
            z.fill = PatternFill('solid', fgColor=CLARO)
            z.border = Border(top=LINEA)
        elif tipo == 'total':
            z.font = Font(name=F, size=11, bold=True)
            z.fill = PatternFill('solid', fgColor=CLARO)
            z.border = Border(top=Side(style='medium', color=CEL), bottom=DOBLE)
        elif tipo == 'memo':
            z.font = Font(name=F, size=10, italic=True, color=GRIS)


def seccion(s, r, texto, c2):
    put(s, r, 2, texto, bold=True, color=CEL)
    for c in range(2, c2 + 1):
        s.cell(r, c).border = Border(bottom=LINEA)


def fila(s, r, etiqueta, valores, fmt=PESO, tipo=None, c0=3, sangria=0):
    """valores: lista de fórmulas/valores, una por columna desde c0 (None deja la celda vacía)."""
    put(s, r, 2, ('   ' * sangria) + etiqueta)
    for i, val in enumerate(valores):
        if val is not None:
            put(s, r, c0 + i, val, fmt=fmt)
    if tipo:
        estilo_fila(s, r, 2, c0 + len(valores) - 1, tipo)
    return r


def nota(s, r, texto, c2, alto=None):
    s.merge_cells(start_row=r, start_column=2, end_row=r, end_column=c2)
    put(s, r, 2, texto, italic=True, color=GRIS, wrap=True, size=10)
    s.row_dimensions[r].height = alto or 30


REF = re.compile(r"(?<![!:'\w$])(\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?)")


def control(etiqueta, formula, hoja=None):
    """Las referencias sin hoja se entienden de la hoja en construcción (s)."""
    hoja = hoja or s.title
    controles.append((etiqueta, REF.sub(lambda m: f"'{hoja}'!{m.group(1)}", formula)))


AN = ['C', 'D', 'E', 'F', 'G', 'H']           # años 0 a 5 en las hojas de flujo de la v6 y en las nuevas
A15 = AN[1:]                                   # años 1 a 5
RES = {'1 Inversión': 9, '2 Ingresos y costos': 8, '3 Capital de trabajo': 7, '4 Flujo puro': 8,
       '5 Flujo financiado': 8, '6 Tasa de descuento': 7, '7 Punto de equilibrio': 7}   # filas del resumen arriba

# ---------------------------------------------------------------------------------------------
# Hoja 1 · Inversión
s = nueva('1 Inversión', '1. Requerimientos de inversión, depreciación y amortización',
          'Pesos de 2026, netos de IVA. Desembolsos anteriores a la apertura (año 0) y reinversiones de los años 1 a 5.',
          [42, 16, 16, 17, 16, 16, 16, 17, 17])
r = 4 + RES['1 Inversión']
seccion(s, r, 'Activo fijo (depreciable)', 10); r += 1
cabecera(s, r, ['Ítem', 'Cantidad', 'Valor unitario', 'Inversión inicial', 'Vida útil (años)',
                'Depreciación anual', 'Reinversiones años 1–5', 'Depreciación acumulada año 5', 'Valor libro año 5'])
r += 1
af0 = r
for i in range(7):
    ri, rd, rv = 6 + i, 28 + i, 47 + i     # fila en Inversión, depreciación y compra en Flujo puro
    put(s, r, 2, f"={q('Inversión', f'B{ri}')}")
    put(s, r, 3, f"={q('Inversión', f'D{ri}')}", UNI)
    put(s, r, 4, f"={q('Inversión', f'C{ri}')}*{M}", PESO)
    put(s, r, 5, f"={q('Inversión', f'E{ri}')}*{M}", PESO)
    put(s, r, 6, f"={q('Inversión', f'F{ri}')}", UNI)
    put(s, r, 7, f"={q('Inversión', f'H{ri}')}*{M}", PESO)
    put(s, r, 8, f"=-SUM({q('Flujo puro', f'D{rv}:H{rv}')})*{M}", PESO)
    put(s, r, 9, f"=-SUM({q('Flujo puro', f'D{rd}:H{rd}')})*{M}", PESO)
    put(s, r, 10, f'=E{r}+H{r}-I{r}', PESO)
    r += 1
af1 = r - 1
fila(s, r, 'Total activo fijo', [None, None, f'=SUM(E{af0}:E{af1})', None, f'=SUM(G{af0}:G{af1})',
                                 f'=SUM(H{af0}:H{af1})', f'=SUM(I{af0}:I{af1})', f'=SUM(J{af0}:J{af1})'], tipo='total')
af_tot = r
control('1 Inversión: activo fijo inicial', f"=E{af_tot}-{q('Inversión', 'E13')}*{M}")
control('1 Inversión: valor libro año 5 = valor de desecho', f"=J{af_tot}-{q('Flujo puro', 'H59')}*{M}")
r += 1
nota(s, r, 'Depreciación lineal sin valor residual, desde el mes en que cada equipo entra en servicio. La depreciación '
           'anual corresponde a la compra inicial; las reinversiones (puestos nuevos) agregan su propia cuota. Valor libro '
           '= inversión + reinversiones − depreciación acumulada (método contable del valor de desecho).', 10, 44)
r += 2

seccion(s, r, 'Activo nominal (amortizable): gastos de puesta en marcha y software', 10); r += 1
cabecera(s, r, ['Ítem', 'Piloto', 'Transición', 'Preapertura', 'Total'], 2)
r += 1
an0 = r
for ri in range(16, 24):
    put(s, r, 2, f"={q('Inversión', f'B{ri}')}")
    for c, col in zip(range(3, 7), 'CDEF'):
        put(s, r, c, f"={q('Inversión', f'{col}{ri}')}*{M}", PESO)
    r += 1
fila(s, r, 'Total gastos de puesta en marcha', [f'=SUM({c}{an0}:{c}{r-1})' for c in 'CDEF'], tipo='sub')
pm_tot = r; r += 1
fila(s, r, 'Software de gestión y calibración (horas × tarifa)', [None, None, None, f"={q('Inversión', 'F25')}*{M}"])
sw = r; r += 1
fila(s, r, 'Total activo nominal', [None, None, None, f'=F{pm_tot}+F{sw}'], tipo='total')
an_tot = r
control('1 Inversión: puesta en marcha', f"=F{pm_tot}-{q('Inversión', 'F24')}*{M}")
r += 2
cabecera(s, r, ['Amortización del activo nominal', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
fila(s, r, 'Amortización anual', [f"={q('Inversión', f'{c}38')}*{M}" for c in A15])
am = r; r += 1
fila(s, r, 'Saldo por amortizar al cierre', [f'=$F${an_tot}-SUM($C${am}:{c}{am})' for c in 'CDEFG'], tipo='sub')
control('1 Inversión: amortización completa en el horizonte', f'=G{r}')
r += 1
nota(s, r, '=CONCATENATE("Amortización lineal en ",Datos!C28," años desde la apertura.")', 10, 18)
r += 2

seccion(s, r, 'Inversión inicial (año 0)', 10); r += 1
cabecera(s, r, ['Concepto', 'Monto'])
r += 1
i0 = r
fila(s, r, 'Activo fijo', [f'=E{af_tot}']); r += 1
fila(s, r, 'Activo nominal (puesta en marcha y software)', [f'=F{an_tot}']); r += 1
fila(s, r, 'Capital de trabajo inicial (stock, anticipos e IVA)', [f"={q('Inversión', 'F27')}*{M}"]); r += 1
fila(s, r, 'Garantía de arriendo', [f"={q('Inversión', 'F28')}*{M}"]); r += 1
fila(s, r, 'Desembolso total antes de abrir', [f'=SUM(C{i0}:C{r-1})'], tipo='sub')
des = r
control('1 Inversión: desembolso previo', f"=C{des}-{q('Inversión', 'F29')}*{M}")
r += 1
fila(s, r, 'Costo financiero de la inversión previa (calendario de inversiones a Ku)', [f"={q('Inversión', 'F30')}*{M}"]); r += 1
fila(s, r, 'Inversión equivalente en el año 0', [f'=C{des}+C{r-1}'], tipo='sub'); ieq = r
r += 1
fila(s, r, 'Capital de trabajo adicional al abrir (déficit acumulado máximo)', [f"={q('Capital de trabajo', 'C20')}*{M}*Datos!$C$23"]); r += 1
fila(s, r, 'Inversión total del año 0 en el flujo de caja', [f'=C{ieq}+C{r-1}'], tipo='total')
control('1 Inversión: inversión del año 0 = flujo puro año 0', f"=C{r}+{q('Flujo puro', 'C64')}*{M}")
r += 1
nota(s, r, '=IF(Datos!$C$24=1,"Los desembolsos ocurren durante 18 meses antes de abrir (detalle en A1 Calendario inversión).",'
           '"Alcance: se evalúa la etapa comercial. El piloto y la espera del reglamento quedan fuera (selector en Datos) y se financiarían con un fondo público de I+D no adjudicado; el flujo parte con los 6 meses de preapertura (detalle en A1 Calendario inversión).")'
           '&" Cada desembolso se lleva al momento cero con la tasa del flujo."', 10, 30)
r += 2
cabecera(s, r, ['Reinversiones', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
fila(s, r, 'Puestos nuevos (elevador y herramientas)', [f"={q('Inversión', f'{c}35')}" for c in A15], fmt=UNI); r += 1
fila(s, r, 'Monto de la reinversión', [f"={q('Inversión', f'{c}36')}*{M}" for c in A15])
s.freeze_panes = 'C4'
s.print_title_rows = '1:2'

# ---------------------------------------------------------------------------------------------
# Hoja 2 · Ingresos y costos (años 1 a 5 en D:H; C = unidad)
s = nueva('2 Ingresos y costos', '2. Proyección de ingresos, costos y gastos (años 1 a 5)',
          'Pesos de 2026, netos de IVA. Costos con signo negativo. Año operativo de julio a junio; apertura en julio de 2028.',
          [52, 13, 17, 17, 17, 17, 17])
r = 4 + RES['2 Ingresos y costos']
cabecera(s, r, ['Ítem', 'Unidad', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
CO = ['E', 'F', 'G', 'H', 'I']    # años 1 a 5 en la hoja Costos de la v6


def fila2(r, etiqueta, unidad, refs, fmt=PESO, tipo=None, signo=''):
    put(s, r, 3, unidad, color=GRIS, size=10)
    return fila(s, r, etiqueta, [f'={signo}{x}' for x in refs], fmt=fmt, tipo=tipo, c0=4)


seccion(s, r, 'Cantidades y precios', 8); r += 1
fila2(r, 'Instalaciones', 'unidades', [q('Costos', f'{c}6') for c in CO], UNI); qrow = r; r += 1
fila2(r, 'Kit Esencial', 'unidades', [q('Costos', f'{c}7') for c in CO], UNI); r += 1
fila2(r, 'Kit Plus', 'unidades', [q('Costos', f'{c}8') for c in CO], UNI); r += 1
fila2(r, 'Talleres de la Red Lumine', 'talleres', [q('Costos', f'{c}9') for c in CO], UNI); r += 1
fila2(r, 'Precio neto de lista promedio por instalación', '$', [q('Flujo puro', f'{c}7') + f'*{M}' for c in A15]); r += 1
fila2(r, 'Costo variable promedio por instalación', '$', [q('Flujo puro', f'{c}8') + f'*{M}' for c in A15]); r += 1
r += 1
seccion(s, r, 'Ingresos', 8); r += 1
i1 = r
fila2(r, 'Ingresos por instalaciones', '$', [q('Costos', f'{c}12') + f'*{M}' for c in CO]); r += 1
fila2(r, 'Ingresos de la Red Lumine (entrada y suscripción)', '$', [q('Costos', f'{c}13') + f'*{M}' for c in CO]); r += 1
fila(s, r, 'Total ingresos', [f'=SUM({c}{i1}:{c}{r-1})' for c in 'DEFGH'], tipo='sub', c0=4); ing = r; r += 1
r += 1
seccion(s, r, 'Costos variables', 8); r += 1
v1 = r
for rr, et in [(17, 'Costo de los kits'), (18, 'Garantía (3% del costo del kit)'), (19, 'Comisión de medios de pago (ventas con tarjeta de crédito)'),
               (20, 'Comisión de venta, sello, referidos y flete'), (21, 'Comisión por incorporación de talleres')]:
    fila2(r, et, '$', [q('Costos', f'{c}{rr}') + f'*{M}' for c in CO], signo='-'); r += 1
fila(s, r, 'Total costos variables', [f'=SUM({c}{v1}:{c}{r-1})' for c in 'DEFGH'], tipo='sub', c0=4); cv = r; r += 1
fila(s, r, 'Margen de contribución', [f'={c}{ing}+{c}{cv}' for c in 'DEFGH'], tipo='total', c0=4); mc = r
control('2 Ingresos y costos: margen de contribución año 1', f"=D{mc}-{q('Costos', 'E23')}*{M}")
control('2 Ingresos y costos: margen de contribución año 5', f"=H{mc}-{q('Costos', 'I23')}*{M}")
r += 2
seccion(s, r, 'Costos fijos de operación', 8); r += 1
f1 = r
for rr, et in [(26, 'Remuneraciones de técnicos instaladores'), (27, 'Responsable Técnico e Ingeniería de Calibración'),
               (28, 'Arriendo del local'), (29, 'Servicios, seguros, mantención y cursos')]:
    fila2(r, et, '$', [q('Costos', f'{c}{rr}') + f'*{M}' for c in CO], signo='-'); r += 1
fila(s, r, 'Total costos fijos de operación', [f'=SUM({c}{f1}:{c}{r-1})' for c in 'DEFGH'], tipo='sub', c0=4); cf = r; r += 1
r += 1
seccion(s, r, 'Gastos de administración y ventas', 8); r += 1
g1 = r
for rr, et in [(33, 'Gerencia General y Administración'), (34, 'Área Comercial y postventa'), (35, 'Marketing'),
               (36, 'Plataformas y soporte de la red')]:
    fila2(r, et, '$', [q('Costos', f'{c}{rr}') + f'*{M}' for c in CO], signo='-'); r += 1
fila(s, r, 'Total gastos de administración y ventas', [f'=SUM({c}{g1}:{c}{r-1})' for c in 'DEFGH'], tipo='sub', c0=4); gav = r; r += 1
r += 1
fila(s, r, 'Resultado antes de depreciación, intereses e impuestos (EBITDA)',
     [f'={c}{mc}+{c}{cf}+{c}{gav}' for c in 'DEFGH'], tipo='total', c0=4); eb = r
control('2 Ingresos y costos: EBITDA año 1', f"=D{eb}-{q('Costos', 'E41')}*{M}")
control('2 Ingresos y costos: EBITDA año 5', f"=H{eb}-{q('Costos', 'I41')}*{M}")
control('2 Ingresos y costos: EBITDA = flujo puro', f"=SUM(D{eb}:H{eb})-SUM({q('Flujo puro', 'D26:H26')})*{M}")
r += 1
put(s, r, 3, '% ventas', color=GRIS, size=10)
fila(s, r, 'EBITDA sobre ingresos', [f'=IF({c}{ing}=0,0,{c}{eb}/{c}{ing})' for c in 'DEFGH'], fmt=PCT, tipo='memo', c0=4)
r += 2
seccion(s, r, 'Peso de las personas en la estructura de costos', 8); r += 1
fila2(r, 'Remuneraciones totales (técnicos, Responsable Técnico, Ingeniería, Gerencia, Administración y Comercial)', '$',
      [f'({c}{f1}+{c}{f1+1}+{c}{g1}+{c}{g1+1})' for c in 'DEFGH'], signo='-'); rem = r; r += 1
put(s, r, 3, '% ventas', color=GRIS, size=10)
fila(s, r, '% de los ingresos destinado a personas', [f'=IF({c}{ing}=0,0,{c}{rem}/{c}{ing})' for c in 'DEFGH'], fmt=PCT, tipo='sub', c0=4); r += 1
put(s, r, 3, '% costos', color=GRIS, size=10)
fila(s, r, '% de los costos totales destinado a personas',
     [f'=IF({c}{ing}-{c}{eb}=0,0,{c}{rem}/({c}{ing}-{c}{eb}))' for c in 'DEFGH'], fmt=PCT, c0=4); r += 1
put(s, r, 3, '% fijos', color=GRIS, size=10)
fila(s, r, '% de los costos fijos y gastos de administración destinado a personas',
     [f'=IF({c}{cf}+{c}{gav}=0,0,-{c}{rem}/({c}{cf}+{c}{gav}))' for c in 'DEFGH'], fmt=PCT, c0=4); r += 1
r += 1
nota(s, r, 'Las cantidades por modelo son una distribución ilustrativa de la mezcla (60% Plus). Los ingresos por instalación '
           'ya descuentan los pilotos comerciales de cada modelo nuevo. Todos los costos son permanentes en el año.', 8, 30)
s.freeze_panes = 'D5'
s.print_title_rows = '1:4'

# ---------------------------------------------------------------------------------------------
# Hoja 2.1 · Proyección de demanda: de dónde sale cada instalación
s = nueva('2.1 Proyección de demanda', '2.1 Proyección de demanda: de la pauta a las instalaciones',
          'Mercado de arriba hacia abajo (TAM, SAM, segmento y Bass) y embudo comercial de abajo hacia arriba (Motor mensual), '
          'por año de operación. Supuestos del embudo en Datos, filas 62 a 101.', [62, 13, 15, 15, 15, 15, 15, 16])
YR = ['D', 'E', 'F', 'G', 'H']
AA = ['F', 'G', 'H', 'I', 'J']      # años 1 a 5 en la hoja Anual
MES = lambda f: q('Mensual', f'$D${f}:$CC${f}')


def sumifs(f, n):
    return f"=SUMIFS({MES(f)},{MES(6)},{n})"


def fila3(r, etiqueta, unidad, vals, fmt=UNI, tipo=None, total=None):
    put(s, r, 3, unidad, color=GRIS, size=10)
    fila(s, r, etiqueta, vals + ([total] if total else []), fmt=fmt, tipo=tipo, c0=4)
    return r


r = 4
seccion(s, r, 'Resumen', 9); r += 1
cabecera(s, r, ['Indicador', 'Unidad', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5', 'Total'])
r += 1
res21 = r
r += 6
cabecera(s, r, ['Ítem', 'Unidad', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5', 'Total'])
cab21 = r
r += 1
# Tamaño de mercado y adopción (de arriba hacia abajo): TAM, SAM, segmento y curva de Bass
seccion(s, r, '1. Tamaño del mercado (de arriba hacia abajo): TAM, SAM y segmento de entrada', 9); r += 1
CEL_IN = PatternFill('solid', fgColor=CLARO)


def dato(r, etiqueta, unidad, valor, fuente, fmt=UNI):
    put(s, r, 3, unidad, color=GRIS, size=10)
    put(s, r, 2, etiqueta)
    z = put(s, r, 4, valor, fmt=fmt)
    z.fill = CEL_IN
    f_ = put(s, r, 5, fuente, italic=True, color=GRIS, size=10)
    s.merge_cells(start_row=r, start_column=5, end_row=r, end_column=9)
    f_.alignment = Alignment(wrap_text=True, vertical='top')
    s.row_dimensions[r].height = 15 * max(1, -(-len(fuente) // 70))
    return r


tam = dato(r, 'TAM: autos, station wagon, todo terreno y taxis del país, sin eléctricos ni híbridos', 'vehículos', 4409729,
           'INE (2025), Parque de vehículos en circulación 2024; tracción delantera supuesta como estándar del parque liviano.'); r += 1
sam = dato(r, 'SAM: la misma flota en la Región Metropolitana (alcance del taller propio)', 'vehículos', 1685930,
           'INE (2025), Parque de vehículos en circulación 2024.'); r += 1
tx = dato(r, 'Taxis básicos y de turismo, Región Metropolitana', 'vehículos', 22838, 'INE (2025).'); r += 1
co = dato(r, 'Taxis colectivos, Región Metropolitana', 'vehículos', 12982, 'INE (2025).'); r += 1
ap = dato(r, 'Conductores de aplicación, Región Metropolitana (estimación)', 'conductores', 126960,
          'Estimación del equipo: 136.000 cuentas activas de Uber y 115.000 de inDrive, más 60% de su promedio para DiDi y Cabify; '
          '÷ 1,217 por quienes usan dos plataformas; × participación de la Región Metropolitana en el parque.'); r += 1
fila3(r, 'Segmento de entrada: uso laboral en la Región Metropolitana', 'vehículos',
      [f'=D{tx}+D{co}+D{ap}'], tipo='sub'); seg = r; r += 1
fila3(r, 'Segmento sobre el SAM', '%', [f'=D{seg}/D{sam}'], PCT); r += 1
alto = dato(r, 'Autos de aplicación de alto kilometraje (jornada completa)', '%', 0.30,
            'Supuesto provisional del equipo (Fase 3): no hay registro de conductores de jornada completa; sensibilidad de 15% a 45%.',
            '0%'); r += 1
fila3(r, 'Mercado potencial: taxis y colectivos más autos de aplicación de alto kilometraje', 'vehículos',
      [f'=D{tx}+D{co}+D{ap}*D{alto}'], tipo='sub'); mpot = r; r += 1
comp = dato(r, 'Compatibles: conductores del foco que usan bencina', '%', '=91/95',
            'Encuesta del equipo (octubre de 2026): 91 de 95 colectiveros y conductores de aplicación.', '0.0%'); r += 1
adop = dato(r, 'Adoptantes potenciales: intención definitiva y precio aceptado', '%', '=29/91',
            'Encuesta del equipo: 29 de 91; el nivel de intención más exigente. Intención declarada, no compra.', '0.0%'); r += 1
fila3(r, 'Techo de adopción (adoptantes a lo largo de toda la curva)', 'vehículos',
      [f'=D{mpot}*D{comp}*D{adop}'], tipo='sub'); seg_techo = r; r += 1
bp = dato(r, 'Coeficiente de innovación de Bass (p), escenario central', 'coeficiente', 0.03,
          'Sultan, Farley y Lehmann (1990): promedio de 213 aplicaciones del modelo.', '0.0000'); r += 1
bq = dato(r, 'Coeficiente de imitación de Bass (q), escenario central', 'coeficiente', 0.38,
          'Sultan, Farley y Lehmann (1990). Contraste bajo de la Fase 3: auto híbrido, p = 0,0026 (Massiani y Gohs, 2015) y q = 0,53.',
          '0.000'); r += 1
r += 1
seccion(s, r, '2. Demanda del segmento (curva de Bass) y demanda que Lumine puede atender', 9); r += 1
FB = lambda t: f'(1-EXP(-($D${bp}+$D${bq})*{t}))/(1+$D${bq}/$D${bp}*EXP(-($D${bp}+$D${bq})*{t}))'
fila3(r, 'Adopción acumulada del techo (Bass)', '%', [f'={FB(n)}' for n in range(1, 6)], PCT); acu = r; r += 1
fila3(r, 'Demanda anual (nuevos adoptantes)', 'vehículos',
      [f'=$D${seg_techo}*({FB(n)}-{FB(n - 1) if n > 1 else 0})' for n in range(1, 6)], total=f'=SUM(D{r}:H{r})'); dseg = r; r += 1
cob_fila = r   # se llena después con la cobertura del embudo
r += 1
fila3(r, 'Demanda atendible (modelos calibrados)', 'vehículos', [f'={c}{dseg}*{c}{cob_fila}' for c in YR], tipo='sub',
      total=f'=SUM(D{r}:H{r})'); date = r; r += 2
seccion(s, r, '3. De la pauta digital y las visitas a las cotizaciones (de abajo hacia arriba: lo que el canal comercial alcanza)', 9); r += 1
fila3(r, 'Pauta digital', '$', [sumifs(10, n) for n in range(1, 6)], PESO, total=f'=SUM(D{r}:H{r})'); pauta = r; r += 1
fila3(r, 'Costo por cotización digital (escenario activo)', '$', ['=Datos!$C$65'] * 5, PESO); r += 1
fila3(r, 'Cotizaciones digitales (pauta / costo por cotización)', 'cotizaciones', [sumifs(11, n) for n in range(1, 6)], total=f'=SUM(D{r}:H{r})'); dig = r; r += 1
fila3(r, 'Cotizaciones por visitas a líneas de colectivos', 'cotizaciones', [sumifs(12, n) for n in range(1, 6)], total=f'=SUM(D{r}:H{r})'); vis = r; r += 1
fila3(r, 'Cotizaciones totales', 'cotizaciones', [f'={c}{dig}+{c}{vis}' for c in YR], tipo='sub', total=f'=SUM(D{r}:H{r})'); cot = r
control('2.1 Demanda: cotizaciones = motor anual', f"=I{cot}-SUM({q('Anual', 'F3:J3')})")
r += 2
seccion(s, r, '4. De las cotizaciones a los pedidos', 9); r += 1
fila3(r, 'Cotizaciones de modelos ya calibrados (cubiertas por la biblioteca)', 'cotizaciones',
      [f"=SUMPRODUCT(({MES(6)}={n})*{MES(13)}*{MES(14)})" for n in range(1, 6)], DEC, total=f'=SUM(D{r}:H{r})'); cub = r; r += 1
fila3(r, 'Cobertura promedio de la biblioteca', '%', [f'=IF({c}{cot}=0,0,{c}{cub}/{c}{cot})' for c in YR], PCT); cobr = r; r += 1
fila3(cob_fila, 'Cobertura de la biblioteca de calibraciones (la misma del embudo)', '%', [f'={c}{cobr}' for c in YR], PCT)
fila3(r, 'Pedidos nuevos', 'pedidos', [f"={q('Anual', f'{c}4')}" for c in AA], total=f'=SUM(D{r}:H{r})'); ped = r; r += 1
fila3(r, 'Conversión promedio de cotización cubierta a pedido', '%', [f'=IF({c}{cub}=0,0,{c}{ped}/{c}{cub})' for c in YR], PCT); r += 1
fila3(r, 'Cancelaciones de pedidos pendientes', 'pedidos', [f"={q('Anual', f'{c}5')}" for c in AA], total=f'=SUM(D{r}:H{r})'); r += 1
r += 1
seccion(s, r, '5. De los pedidos a las instalaciones: capacidad del taller', 9); r += 1
fila3(r, 'Dúos de técnicos en operación al cierre', 'dúos', [f"={q('Anual', f'{c}8')}" for c in AA]); r += 1
fila3(r, 'Capacidad operativa de los dúos', 'instalaciones', [f"={q('Anual', f'{c}9')}" for c in AA], total=f'=SUM(D{r}:H{r})'); cap = r; r += 1
fila3(r, 'Instalaciones (el menor entre pedidos, capacidad y kits disponibles, mes a mes)', 'instalaciones',
      [f"={q('Anual', f'{c}6')}" for c in AA], tipo='total', total=f'=SUM(D{r}:H{r})'); ins = r; r += 1
fila3(r, 'Uso de la capacidad', '%', [f'=IF({c}{cap}=0,0,{c}{ins}/{c}{cap})' for c in YR], PCT); uso = r; r += 1
fila3(r, 'Pedidos pendientes al cierre', 'pedidos', [f"={q('Anual', f'{c}7')}" for c in AA]); r += 1
fila3(r, 'Parque instalado acumulado', 'autos', [f"={q('Anual', f'{c}12')}" for c in AA]); r += 1
r += 1
seccion(s, r, '6. De las instalaciones a los ingresos', 9); r += 1
fila3(r, 'Instalaciones Plus (participación de Datos)', 'instalaciones', [f'={c}{ins}*Datos!$C$48' for c in YR], DEC, total=f'=SUM(D{r}:H{r})'); r += 1
fila3(r, 'Instalaciones Esencial', 'instalaciones', [f'={c}{ins}*(1-Datos!$C$48)' for c in YR], DEC, total=f'=SUM(D{r}:H{r})'); r += 1
fila3(r, 'Ingreso neto promedio por instalación (mezcla, sin IVA)', '$', ['=Datos!$C$49'] * 5, PESO); r += 1
fila3(r, 'Clientes piloto comerciales (50% de descuento, un modelo nuevo cada uno)', 'clientes', [f"={q('Anual', f'{c}11')}" for c in AA], total=f'=SUM(D{r}:H{r})'); r += 1
fila3(r, 'Ingresos por instalaciones', '$', [f"={q('Anual', f'{c}37')}" for c in AA], PESO, tipo='total', total=f'=SUM(D{r}:H{r})'); ingd = r
control('2.1 Demanda: ingresos = motor anual', f"=I{ingd}-{q('Anual', 'K37')}")
r += 2
seccion(s, r, '7. Contraste: participación de Lumine (SOM) frente al mercado', 9); r += 1
fila3(r, 'Instalaciones sobre la demanda atendible del segmento', '%', [f'=IF({c}{date}=0,0,{c}{ins}/{c}{date})' for c in YR], PCT); som1 = r; r += 1
fila3(r, 'Parque instalado sobre el techo de adopción', '%', [f"={q('Anual', f'{c}12')}/$D${seg_techo}" for c in AA], PCT); som2 = r; r += 1
fila3(r, 'Parque instalado sobre el segmento de entrada', '%', [f"={q('Anual', f'{c}12')}/$D${seg}" for c in AA], PCT); r += 1
fila3(r, 'Parque instalado sobre el SAM', '%', [f"={q('Anual', f'{c}12')}/$D${sam}" for c in AA], PCT); r += 1
r += 1
nota(s, r, 'Lectura: la curva de Bass y el TAM, SAM y segmento dicen cuánto mercado hay; el embudo comercial y la capacidad dicen '
           'cuánto de ese mercado alcanza Lumine con su pauta y sus dúos. El pronóstico usa el menor de los dos, mes a mes, porque '
           'el tamaño de un proyecto queda acotado por la demanda y por la capacidad (Sapag). La tasa de crecimiento compuesta (CAGR) no '
           'se usa: exige una serie histórica que un producto nuevo no tiene.', 9, 62)
r += 2
nota(s, r, 'Cómo se calcula cada mes: pedidos = (pauta ÷ costo por cotización + visitas) × cobertura de la biblioteca × conversión, '
           'que sube desde la conversión inicial hasta la de régimen en los meses de rampa (Datos, filas 62 a 79). Las instalaciones '
           'son el menor valor entre los pedidos acumulados, la capacidad de los dúos (Datos, filas 81 a 93) y los kits en bodega. '
           'El selector «Escenario de demanda» del Tablero cambia el costo por cotización, la conversión y la rampa.', 9, 62)
r += 2
nota(s, r, 'El techo es la cantidad de adoptantes a lo largo de toda la curva, no una tasa de compra anual: la muestra no es '
           'probabilística y la intención declarada sobrestima la compra. La curva de Bass reparte ese techo en el tiempo y solo acota '
           'el pronóstico; las ventas las fija el embudo comercial, la capacidad y los kits.', 9, 46)
# Resumen arriba
for i, (et, uni, fila_, fmt, tot) in enumerate([('Demanda atendible (Bass sobre el techo)', 'vehículos', date, UNI, True),
                                                 ('Instalaciones', 'instalaciones', ins, UNI, True),
                                                 ('Instalaciones sobre la demanda atendible', '%', som1, PCT, False),
                                                 ('Uso de la capacidad', '%', uso, PCT, False),
                                                 ('Ingresos por instalaciones', '$', ingd, PESO, True)]):
    rr = res21 + i
    put(s, rr, 3, uni, color=GRIS, size=10)
    fila(s, rr, et, [f'={c}{fila_}' for c in YR] + ([f'=I{fila_}'] if tot else []), fmt=fmt, tipo='sub', c0=4)
s.freeze_panes = f'D{cab21 + 1}'
s.print_title_rows = f'{cab21}:{cab21}'

# ---------------------------------------------------------------------------------------------
# Hoja 3 · Capital de trabajo
s = nueva('3 Capital de trabajo', '3. Inversión en capital de trabajo',
          'Pesos de 2026. Déficit acumulado máximo al abrir y aumentos por crecimiento desde el año 2; todo se recupera al cierre.',
          [70, 17, 17, 17, 17, 17, 17])
r = 4 + RES['3 Capital de trabajo']
cabecera(s, r, ['Ítem', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
k1 = r
fila(s, r, 'Inventario de kits en bodega', [f"={q('Capital de trabajo', f'{c}7')}*{M}" for c in AN]); r += 1
fila(s, r, 'Kits en tránsito y anticipos pagados a proveedores', [f"={q('Capital de trabajo', f'{c}8')}*{M}" for c in AN]); r += 1
fila(s, r, 'Crédito fiscal de IVA por recuperar', [f"={q('Capital de trabajo', f'{c}9')}*{M}" for c in AN]); r += 1
fila(s, r, '(−) Anticipos recibidos de clientes', [f"=-{q('Capital de trabajo', f'{c}10')}*{M}" for c in AN]); r += 1
fila(s, r, 'Saldo de capital de trabajo al cierre (inventario, tránsito e IVA)', [f'=SUM({c}{k1}:{c}{r-1})' for c in AN], tipo='sub'); kt = r
control('3 Capital de trabajo: saldo al cierre año 5', f"=H{kt}-{q('Capital de trabajo', 'H12')}*{M}")
r += 2
seccion(s, r, 'Método aplicado: déficit acumulado máximo más aumentos por crecimiento', 8); r += 1
fila(s, r, 'Capital de trabajo comprado antes de abrir (stock, tránsito e IVA)', [f'=C{kt}']); ca = r; r += 1
fila(s, r, 'Mayor déficit operativo acumulado desde la apertura', [f"={q('Capital de trabajo', 'C20')}*{M}"]); cd_ = r; r += 1
fila(s, r, 'Mes de operación en que se alcanza', [f"={q('Capital de trabajo', 'C21')}"], fmt=UNI); r += 1
fila(s, r, 'Capital de trabajo inicial (año 0)', [f'=C{ca}+Datos!$C$23*C{cd_}'], tipo='sub'); ci = r; r += 1
fila(s, r, 'Inversión en capital de trabajo',
     [f'=-C{ci}', f'=-(D{kt}-C{kt})*(1-Datos!$C$23)'] + [f'=-({c}{kt}-{p}{kt})' for p, c in zip('DEFG', 'EFGH')], tipo='total'); dk = r
control('3 Capital de trabajo: inversión = flujo puro', f"=SUM(C{dk}:H{dk})-SUM({q('Flujo puro', 'C55:H55')})*{M}")
r += 1
fila(s, r, 'Recuperación del capital de trabajo', [None] * 5 + [f"={q('Capital de trabajo', 'H17')}*{M}"]); rc = r
control('3 Capital de trabajo: se recupera todo lo invertido', f"=IF(Datos!$C$23=1,H{rc}+SUM(C{dk}:H{dk}),0)")
r += 1
fila(s, r, 'Necesidad máxima de financiamiento sin deuda (incluye inversión previa)', [f"={q('Capital de trabajo', 'C23')}*{M}"]); r += 1
r += 1
nota(s, r, 'Método del déficit acumulado máximo (Datos, fila 23): al abrir se invierte el stock comprado en la preapertura más '
           'el mayor déficit de la caja operativa acumulada desde la apertura (detalle mes a mes en A3). Ese déficit cubre el '
           'crecimiento del inventario y las pérdidas de los primeros meses. Desde el año 2 se suma solo el aumento del saldo de '
           'inventario, tránsito e IVA por crecimiento. Todo lo invertido se recupera al cierre del año 5.', 8, 62)
s.freeze_panes = 'C5'

# ---------------------------------------------------------------------------------------------
# Hojas 4 y 5 · Flujos de caja
NOMBRES_AF = ['Dinamómetro de chasis', 'Escáner automotriz', 'Herramientas de alta tensión', 'Elevador',
              'Habilitación del local', 'Bodega de baterías', 'Mobiliario y computadores']


def flujo(nombre, titulo, bajada, src, financiado):
    s = nueva(nombre, titulo, bajada, [58, 17, 17, 17, 17, 17, 17])
    S = lambda col, row: q(src, f'{col}{row}')
    r = 4 + RES[nombre]
    cabecera(s, r, ['Ítem', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
    r += 1

    def ref(row, signo='', cols=AN, desde=0):
        return [None] * desde + [f'={signo}{S(c, row)}*{M}' for c in cols[desde:]]

    i1 = r
    fila(s, r, 'Ingresos por instalaciones', ref(12, desde=1)); r += 1
    fila(s, r, 'Ingresos de la Red Lumine', ref(13, desde=1)); r += 1
    fila(s, r, 'Total ingresos', [None] + [f'=SUM({c}{i1}:{c}{r-1})' for c in A15], tipo='sub'); ing = r; r += 1
    v1 = r
    fila(s, r, 'Costo de los kits', ref(15, desde=1)); r += 1
    fila(s, r, 'Garantías', ref(16, desde=1)); r += 1
    fila(s, r, 'Comisión de medios de pago', ref(17, desde=1)); r += 1
    fila(s, r, 'Otros costos variables (comisiones, sello, referidos y flete)', ref(18, desde=1)); r += 1
    fila(s, r, 'Margen de contribución', [None] + [f'={c}{ing}+SUM({c}{v1}:{c}{r-1})' for c in A15], tipo='sub'); mc = r; r += 1
    f1 = r
    fila(s, r, 'Remuneraciones de técnicos instaladores', ref(21, desde=1)); r += 1
    fila(s, r, 'Responsable Técnico e Ingeniería de Calibración', ref(22, desde=1)); r += 1
    fila(s, r, 'Arriendo del local', ref(23, desde=1)); r += 1
    fila(s, r, 'Otros costos fijos', ref(24, desde=1)); r += 1
    fila(s, r, 'Gastos de administración y ventas', ref(25, desde=1)); r += 1
    fila(s, r, 'EBITDA', [None] + [f'={c}{mc}+SUM({c}{f1}:{c}{r-1})' for c in A15], tipo='sub'); eb = r; r += 1
    d1 = r
    for i, n in enumerate(NOMBRES_AF):
        fila(s, r, f'Depreciación {n.lower()}', ref(28 + i, desde=1)); r += 1
    d2 = r - 1
    fila(s, r, 'Amortización de intangibles (puesta en marcha y software)', ref(35, desde=1)); amr = r; r += 1
    fila(s, r, 'Resultado operacional', [None] + [f'={c}{eb}+SUM({c}{d1}:{c}{amr})' for c in A15], tipo='sub'); ro = r; r += 1
    if financiado:
        fila(s, r, 'Gasto financiero (intereses)', ref(37, desde=1)); gf = r; r += 1
        fila(s, r, 'Resultado antes de impuesto', [None] + [f'={c}{ro}+{c}{gf}' for c in A15], tipo='sub')
    else:
        fila(s, r, 'Resultado antes de impuesto', [None] + [f'={c}{ro}' for c in A15], tipo='sub')
    rai = r; r += 1
    fila(s, r, 'Impuesto a la renta', ref(43, desde=1)); imp = r; r += 1
    fila(s, r, 'Resultado después de impuesto', [None] + [f'={c}{rai}+{c}{imp}' for c in A15], tipo='sub'); rdi = r; r += 1
    fila(s, r, '(+) Depreciación', [None] + [f'=-SUM({c}{d1}:{c}{d2})' for c in A15]); pd = r; r += 1
    fila(s, r, '(+) Amortización de intangibles', [None] + [f'=-{c}{amr}' for c in A15]); pa = r; r += 1
    fila(s, r, 'Flujo de caja operacional', [None] + [f'={c}{rdi}+{c}{pd}+{c}{pa}' for c in A15], tipo='sub'); fco = r; r += 1
    fila(s, r, 'Pérdida tributaria de arrastre disponible (informativo)', ref(39, desde=1), tipo='memo'); r += 1
    seccion(s, r, 'Inversiones, capital de trabajo y valor de desecho', 8); r += 1
    x1 = r
    for i, n in enumerate(NOMBRES_AF):
        fila(s, r, f'Inversión {n.lower()}', ref(47 + i)); r += 1
    fila(s, r, 'Inversión en intangibles (puesta en marcha y software)', ref(54)); r += 1
    fila(s, r, 'Costo financiero de la inversión previa', ref(62)); r += 1
    fila(s, r, 'Capital de trabajo', ref(55)); r += 1
    fila(s, r, 'Garantía de arriendo', ref(56)); r += 1
    fila(s, r, 'Recuperación del capital de trabajo', ref(57)); r += 1
    fila(s, r, 'Recuperación de la garantía de arriendo', ref(58)); r += 1
    fila(s, r, 'Valor de desecho (activos a valor libro)', ref(59)); r += 1
    if financiado:
        fila(s, r, 'Préstamo', ref(60)); r += 1
        fila(s, r, 'Amortización de capital del préstamo', ref(61)); r += 1
    x2 = r - 1
    rotulo = 'Flujo de caja del inversionista' if financiado else 'Flujo de caja libre (FCL)'
    fila(s, r, rotulo, [f'=SUM(C{x1}:C{x2})'] + [f'={c}{fco}+SUM({c}{x1}:{c}{x2})' for c in A15], tipo='total'); fcl = r
    control(f'{nombre}: flujo de caja', f"=SUMPRODUCT(ABS(C{fcl}:H{fcl}-{q(src, 'C64:H64')}*{M}))", nombre)
    control(f'{nombre}: resultado antes de impuesto', f"=SUM(D{rai}:H{rai})-SUM({q(src, 'D38:H38')})*{M}", nombre)
    r += 1
    tasa_r = r + 5
    fila(s, r, 'Flujo descontado', [f'={c}{fcl}/(1+$C${tasa_r})^{n}' for n, c in enumerate(AN)]); fd = r; r += 1
    fila(s, r, 'Flujo descontado acumulado', [f'=SUM($C${fd}:{c}{fd})' for c in AN], tipo='memo'); acd = r; r += 1
    fila(s, r, 'Flujo acumulado (sin descontar)', [f'=SUM($C${fcl}:{c}{fcl})' for c in AN], tipo='memo'); acs = r; r += 2
    seccion(s, r, 'Evaluación', 8); r += 1
    etiqueta_tasa = 'Tasa de descuento: Ke (costo del patrimonio, CAPM con beta apalancado)' if financiado else \
        'Tasa de descuento: Ku (CAPM con beta desapalancado)'
    fila(s, r, etiqueta_tasa, ['=Datos!$C$18' if financiado else '=Datos!$C$16'], fmt=PCT); assert r == tasa_r; r += 1
    fila(s, r, 'VAN', [f'=NPV(C{tasa_r},D{fcl}:H{fcl})+C{fcl}'], tipo='sub')
    put(s, r, 4, f'=IF(C{r}>0,"VAN > 0: se acepta el proyecto","VAN < 0: no se acepta")', italic=True, color=GRIS)
    van = r
    control(f'{nombre}: VAN', f"=C{van}-{S('C', 70)}*{M}", nombre)
    r += 1
    rng = f'C{fcl}:H{fcl}'
    fila(s, r, 'TIR', [f'=IF(IFERROR(IRR({rng}),-9)>-0.99,IRR({rng}),IF(IFERROR(IRR({rng},-0.3),-9)>-0.99,IRR({rng},-0.3),'
                         f'IF(IFERROR(IRR({rng},-0.6),-9)>-0.99,IRR({rng},-0.6),"TIR no definida")))'], fmt=PCT, tipo='sub')
    put(s, r, 4, f'=IF(C{r}>C{tasa_r},"TIR > tasa de descuento: rentable","TIR < tasa de descuento")', italic=True, color=GRIS)
    control(f'{nombre}: TIR (puntos básicos)', f"=(C{r}-{S('C', 71)})*10000", nombre)
    r += 1
    hs, hd = r + 2, r + 3
    fila(s, r, 'Payback simple', [f'=IF(COUNT(D{hs}:H{hs})=0,"No recupera en 5 años",MIN(D{hs}:H{hs}))'], fmt=ANOS)
    put(s, r, 4, 'Año previo a la recuperación + saldo por recuperar ÷ flujo del año (filas de abajo)', italic=True, color=GRIS)
    pbs = r; r += 1
    fila(s, r, 'Payback descontado', [f'=IF(COUNT(D{hd}:H{hd})=0,"No recupera en 5 años",MIN(D{hd}:H{hd}))'], fmt=ANOS)
    put(s, r, 4, 'Mismo cálculo con los flujos descontados', italic=True, color=GRIS)
    r += 1
    fila(s, r, '   Cálculo del payback simple, por año', [None] + [
        f'=IF(AND({p}{acs}<0,{c}{acs}>=0,{c}{fcl}>0),{n}-{p}{acs}/{c}{fcl},"")'
        for n, (p, c) in enumerate(zip(AN[:-1], AN[1:]))], fmt=ANOS, tipo='memo'); r += 1
    fila(s, r, '   Cálculo del payback descontado, por año', [None] + [
        f'=IF(AND({p}{acd}<0,{c}{acd}>=0,{c}{fd}>0),{n}-{p}{acd}/{c}{fd},"")'
        for n, (p, c) in enumerate(zip(AN[:-1], AN[1:]))], fmt=ANOS, tipo='memo'); r += 1
    _ = pbs
    fila(s, r, 'VAN sin recuperaciones de cierre (sensibilidad)', [f"={S('C', 74)}*{M}"], tipo='memo'); r += 1
    s.freeze_panes = 'C5'
    s.print_title_rows = '1:4'
    return {'van': van, 'fcl': fcl, 'tasa': tasa_r}


p4 = flujo('4 Flujo puro', '4. Flujo de caja puro (proyecto sin deuda)',
           'Pesos de 2026, netos de IVA. Año 0 = inversión antes de abrir, llevada al momento cero. Se descuenta a Ku.',
           'Flujo puro', False)
p5 = flujo('5 Flujo financiado', '5. Flujo de caja financiado (proyecto apalancado)',
           'Mismo proyecto con el préstamo de la hoja 5.1: intereses deducibles, préstamo en el año 0 y amortización de capital. Se descuenta a Ke.',
           'Flujo inversionista', True)

# ---------------------------------------------------------------------------------------------
# Hoja 5.1 · Tabla de amortización (formato de la clase)
s = nueva('5.1 Tabla de amortización', '5.1 Préstamo y tabla de amortización',
          'Crédito propuesto, indexado (cuota constante en pesos de 2026). Tasa real por Fisher. Sin aprobación de un banco.',
          [40, 17, 17, 17, 17, 17, 17])
r = 4
put(s, r, 2, 'Monto'); put(s, r, 3, f"={q('Deuda', 'C6')}*{M}", PESO); monto = r; r += 1
put(s, r, 2, 'Plazo'); put(s, r, 3, '=Datos!C29', UNI); put(s, r, 4, 'años', color=GRIS); plazo = r; r += 1
put(s, r, 2, 'Período de gracia (solo intereses)'); put(s, r, 3, '=Datos!C30', UNI); put(s, r, 4, 'años', color=GRIS); gracia = r; r += 1
put(s, r, 2, 'Tasa (Kd real anual)'); put(s, r, 3, '=Datos!C19', PCT); tasa = r; r += 1
put(s, r, 2, 'Cuota (modelo francés)'); put(s, r, 3, f'=PMT(C{tasa},C{plazo}-C{gracia},-C{monto})', PESO, bold=True); cuota = r
control('5.1 Amortización: cuota PMT = servicio de deuda año 2', f"=C{cuota}-{q('Deuda', 'E12')}*{M}")
r += 2


def tabla(titulo, f0, aplicado):
    global r
    seccion(s, r, titulo + ('  ·  aplicado en el flujo financiado' if aplicado else '  ·  comparación'), 6); r += 1
    cabecera(s, r, ['Período', 'Cuota', 'Interés', 'Amortización', 'Saldo'])
    r += 1
    put(s, r, 2, 0, '0', align='left'); put(s, r, 6, f'=C{monto}', PESO); t0 = r; r += 1
    for n, c in enumerate(A15, start=1):
        put(s, r, 2, n, '0', align='left')
        put(s, r, 3, f"={q('Deuda', f'{c}{f0 + 4}')}*{M}", PESO)
        put(s, r, 4, f"={q('Deuda', f'{c}{f0 + 1}')}*{M}", PESO)
        put(s, r, 5, f"={q('Deuda', f'{c}{f0 + 2}')}*{M}", PESO)
        put(s, r, 6, f"={q('Deuda', f'{c}{f0 + 3}')}*{M}", PESO)
        r += 1
    fila(s, r, 'SUMAS', [f'=SUM(C{t0+1}:C{r-1})', f'=SUM(D{t0+1}:D{r-1})', f'=SUM(E{t0+1}:E{r-1})'], tipo='total')
    control(f'5.1 Amortización {titulo}: capital = monto', f'=E{r}-C{monto}')
    control(f'5.1 Amortización {titulo}: cuota = interés + amortización', f'=C{r}-D{r}-E{r}')
    sumas = r; r += 1
    put(s, r, 2, 'Gasto financiero total'); put(s, r, 3, f'=D{sumas}', PESO, bold=True); r += 2
    return sumas


tabla('Modelo francés (cuota constante)', 8, True)
tabla('Modelo alemán (amortización constante)', 21, False)
tabla('Modelo americano (solo intereses, capital al final)', 34, False)
seccion(s, r, 'Evaluación del financiamiento (valor económico del ahorro tributario)', 8); r += 1
cabecera(s, r, ['Ítem', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
e1 = r
fila(s, r, 'Préstamo', [f"={q('Deuda', 'C6')}*{M}"] + [None] * 5); r += 1
fila(s, r, 'Gasto financiero', [None] + [f"=-{q('Deuda', f'{c}9')}*{M}" for c in A15]); r += 1
fila(s, r, 'Ahorro tributario efectivo (menor impuesto pagado por los intereses)',
     [None] + [f"=({q('Flujo inversionista', f'{c}43')}-{q('Flujo puro', f'{c}43')})*{M}" for c in A15]); r += 1
fila(s, r, 'Amortización de capital', [None] + [f"=-{q('Deuda', f'{c}10')}*{M}" for c in A15]); r += 1
fila(s, r, 'Flujo neto de la deuda', [f'=SUM({c}{e1}:{c}{r-1})' for c in AN], tipo='sub'); fd = r
control('5.1 Financiamiento: flujo de la deuda', f"=SUMPRODUCT(ABS(C{fd}:H{fd}-{q('Deuda', 'C50:H50')}*{M}))")
r += 2
fila(s, r, 'VAN de la deuda (a Kd)', [f'=NPV(C{tasa},D{fd}:H{fd})+C{fd}']); vd = r
control('5.1 Financiamiento: VAN de la deuda', f"=C{vd}-{q('Deuda', 'C52')}*{M}")
r += 1
fila(s, r, 'VAN puro (hoja 4)', [f"='4 Flujo puro'!C{p4['van']}"]); r += 1
fila(s, r, 'VAN ajustado = VAN puro + VAN de la deuda', [f'=C{vd}+C{r-1}'], tipo='total')
control('5.1 Financiamiento: VAN ajustado', f"=C{r}-{q('Deuda', 'C53')}*{M}")
r += 1
nota(s, r, 'El ahorro tributario es el menor impuesto que efectivamente se paga por deducir los intereses; en los años con '
           'pérdida de arrastre no hay ahorro inmediato. El VAN ajustado (VAN puro más VAN de la deuda) no coincide con el VAN del '
           'flujo financiado a Ke de la hoja 5: el primero mide cuánto agrega la deuda al proyecto; el segundo, cuánto gana el '
           'socio sobre su aporte. Son dos preguntas distintas.', 8, 30)
s.freeze_panes = 'B4'

# ---------------------------------------------------------------------------------------------
# Hoja 6 · Tasa de descuento
s = nueva('6 Tasa de descuento', '6. Tasas de descuento del proyecto puro y financiado',
          'Tasas reales anuales. CAPM para el patrimonio, Hamada para apalancar el beta y Fisher para pasar de nominal a real.',
          [46, 14, 52, 70])
r = 4 + RES['6 Tasa de descuento']
cabecera(s, r, ['Parámetro', 'Valor', 'Fórmula', 'Fuente'])
r += 1
T = {}


def par(clave, etiqueta, valor, fmt, formula_txt='', fuente=None):
    global r
    put(s, r, 2, etiqueta)
    put(s, r, 3, valor, fmt)
    put(s, r, 4, formula_txt, color=GRIS, size=10)
    s.cell(r, 4).alignment = Alignment(horizontal='left', indent=2, vertical='center')
    if fuente:
        put(s, r, 5, fuente, color=GRIS, size=10, wrap=True)
    T[clave] = f'C{r}'
    r += 1


par('rf', 'Tasa libre de riesgo (Rf)', '=Datos!C6', PCT, '', '=Datos!F6')
par('prm', 'Premio por riesgo de mercado (Rm − Rf)', '=Datos!C7', PCT, '', '=Datos!F7')
par('w', 'Peso de autopartes en el ingreso por instalación (w)', '=Datos!C242', PCT, '', '=Datos!F242')
par('bu1', 'βu autopartes («Auto Parts»)', '=Datos!C243', DEC, '', '=Datos!F243')
par('bu2', 'βu comercio y servicio automotriz («Retail (Automotive)»)', '=Datos!C244', DEC, '', '=Datos!F244')
par('bu', 'Beta desapalancado ponderado (βu)', '=Datos!C8', DEC, 'βu = w × βu autopartes + (1 − w) × βu servicio', '=Datos!F8')
par('ku', 'Ku: costo del capital sin deuda', f"={T['rf']}+{T['bu']}*{T['prm']}", PCT, 'Ku = Rf + βu × (Rm − Rf)', 'Tasa del flujo puro (hoja 4)')
estilo_fila(s, r - 1, 2, 5, 'sub')
control('6 Tasas: Ku (puntos básicos)', f"=({T['ku']}-Datos!C16)*10000")
r += 1
par('dp1', 'D/P autopartes', '=Datos!C245', PCT, '', '=Datos!F245')
par('dp2', 'D/P comercio y servicio automotriz', '=Datos!C246', PCT, '', '=Datos!F246')
par('dp', 'Relación deuda / patrimonio ponderada (D/P)', '=Datos!C9', PCT, 'D/P = w × D/P autopartes + (1 − w) × D/P servicio', '=Datos!F9')
par('t', 'Tasa de impuesto (t)', '=Datos!C10', PCT, '', '=Datos!F10')
par('bl', 'Beta apalancado (βl)', f"={T['bu']}*(1+(1-{T['t']})*{T['dp']})", DEC, 'βl = βu × [1 + (1 − t) × D/P]  (Hamada)')
par('ke', 'Ke: costo del patrimonio', f"={T['rf']}+{T['bl']}*{T['prm']}", PCT, 'Ke = Rf + βl × (Rm − Rf)', 'Tasa del flujo financiado (hoja 5)')
estilo_fila(s, r - 1, 2, 5, 'sub')
control('6 Tasas: beta apalancado (x10.000)', f"=({T['bl']}-Datos!C17)*10000")
control('6 Tasas: Ke (puntos básicos)', f"=({T['ke']}-Datos!C18)*10000")
r += 1
par('kdn', 'Tasa de créditos comerciales, nominal', '=Datos!C11', PCT, '', '=Datos!F11')
par('rec', 'Recargo por empresa nueva', '=Datos!C12', PCT, '', '=Datos!F12')
par('pi', 'Inflación esperada (π)', '=Datos!C13', PCT, '', '=Datos!F13')
par('kd', 'Kd: costo real de la deuda', f"=(1+{T['kdn']}+{T['rec']})/(1+{T['pi']})-1", PCT, 'Kd = (1 + i nominal + recargo) / (1 + π) − 1  (Fisher)', 'Tasa de la tabla de amortización (hoja 5.1)')
estilo_fila(s, r - 1, 2, 5, 'sub')
control('6 Tasas: Kd (puntos básicos)', f"=({T['kd']}-Datos!C19)*10000")
r += 1
par('dv', 'Deuda / valor (D/V)', f"={T['dp']}/(1+{T['dp']})", PCT, 'D/V = (D/P) / (1 + D/P)')
par('pv', 'Patrimonio / valor (P/V)', f"=1-{T['dv']}", PCT, 'P/V = 1 − D/V')
par('wacc', 'WACC (referencia)', f"={T['pv']}*{T['ke']}+{T['dv']}*{T['kd']}*(1-{T['t']})", PCT,
    'WACC = P/V × Ke + D/V × Kd × (1 − t)', 'Solo referencia; el VAN se calcula con Ku y Ke')
estilo_fila(s, r - 1, 2, 5, 'sub')
control('6 Tasas: WACC (puntos básicos)', f"=({T['wacc']}-Datos!C21)*10000")
r += 1
seccion(s, r, 'Qué tasa usa cada flujo y su efecto', 5); r += 1
cabecera(s, r, ['Flujo', 'Tasa', 'VAN', 'TIR'])
s.cell(r, 5).alignment = Alignment(horizontal='left', vertical='center')
r += 1
put(s, r, 2, 'Flujo puro (hoja 4)'); put(s, r, 3, f"={T['ku']}", PCT)
put(s, r, 4, f"='4 Flujo puro'!C{p4['van']}", PESO); put(s, r, 5, f"='4 Flujo puro'!C{p4['van'] + 1}", PCT, align='left'); s.cell(r, 5).alignment = Alignment(horizontal='left', indent=2); r += 1
put(s, r, 2, 'Flujo financiado (hoja 5)'); put(s, r, 3, f"={T['ke']}", PCT)
put(s, r, 4, f"='5 Flujo financiado'!C{p5['van']}", PESO); put(s, r, 5, f"='5 Flujo financiado'!C{p5['van'] + 1}", PCT, align='left'); s.cell(r, 5).alignment = Alignment(horizontal='left', indent=2); r += 1
put(s, r, 2, 'Flujo puro a WACC (referencia)'); put(s, r, 3, f"={T['wacc']}", PCT)
put(s, r, 4, f"=NPV(C{r},'4 Flujo puro'!D{p4['fcl']}:H{p4['fcl']})+'4 Flujo puro'!C{p4['fcl']}", PESO)
control('6 Tasas: VAN a WACC', f"=D{r}-Resumen!D38*{M}")
r += 2
nota(s, r, 'El beta se apalanca con la estructura deuda/patrimonio de referencia del sector. Una tasa más alta para el '
           'inversionista refleja el riesgo financiero que agrega la deuda.', 5, 30)
s.column_dimensions['E'].width = 70
s.freeze_panes = 'B5'

# ---------------------------------------------------------------------------------------------
# Hoja 7 · Punto de equilibrio
s = nueva('7 Punto de equilibrio', '7. Punto de equilibrio en unidades y en ventas (años 1 a 5)',
          'Equilibrio contable: instalaciones que cubren los costos fijos, la depreciación y la amortización del año.',
          [62, 17, 17, 17, 17, 17])
r = 4 + RES['7 Punto de equilibrio']
cabecera(s, r, ['Ítem', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'])
r += 1
EQ = ['D', 'E', 'F', 'G', 'H']
fila(s, r, 'Instalaciones proyectadas', [f"={q('Equilibrio', f'{c}7')}" for c in EQ], fmt=UNI); qp = r; r += 1
fila(s, r, 'Ingreso neto promedio por instalación', [f"=IF({q('Flujo puro', f'{c}6')}=0,0,{q('Flujo puro', f'{c}12')}/{q('Flujo puro', f'{c}6')}*{M})" for c in A15]); pp = r; r += 1
fila(s, r, 'Margen de contribución unitario', [f"={q('Equilibrio', f'{c}8')}*{M}" for c in EQ]); mcu = r; r += 1
fila(s, r, 'Costos fijos + depreciación + amortización − aporte neto de la red', [f"={q('Equilibrio', f'{c}9')}*{M}" for c in EQ]); cft = r; r += 1
fila(s, r, 'Punto de equilibrio (instalaciones)', [f'=IF({c}{mcu}>0,{c}{cft}/{c}{mcu},0)' for c in 'CDEFG'], fmt=DEC, tipo='sub'); qe = r
control('7 Equilibrio: unidades año 1', f"=C{qe}-{q('Equilibrio', 'D11')}")
control('7 Equilibrio: unidades año 5', f"=G{qe}-{q('Equilibrio', 'H11')}")
r += 1
fila(s, r, 'Mínimo de instalaciones enteras', [f'=ROUNDUP({c}{qe},0)' for c in 'CDEFG'], fmt=UNI); r += 1
fila(s, r, 'Punto de equilibrio en ventas', [f'={c}{qe}*{c}{pp}' for c in 'CDEFG'], tipo='total'); r += 1
fila(s, r, 'Instalaciones proyectadas sobre (bajo) el equilibrio', [f'={c}{qp}-{c}{qe}' for c in 'CDEFG'], fmt=DEC, tipo='memo'); r += 2
nota(s, r, 'Q de equilibrio = costos fijos totales / margen de contribución unitario. Ventas de equilibrio = Q × ingreso '
           'neto promedio por instalación. El aporte neto de la Red Lumine se descuenta de los costos fijos.', 6, 30)
r += 2
seccion(s, r, 'Equilibrio financiero: precio que deja el VAN puro en cero', 6); r += 1
fila(s, r, 'Precio neto promedio que lleva el VAN a cero', [f"={q('Equilibrio', 'C18')}"]); r += 1
fila(s, r, 'Cambio de precio frente al caso base', [f"={q('Equilibrio', 'C19')}"], fmt=PCT); r += 1
fila(s, r, 'Tasa aplicada (Ku)', ['=Datos!$C$16'], fmt=PCT)
s.freeze_panes = 'C5'


# ---------------------------------------------------------------------------------------------
# Anexos: espejo en pesos de las hojas de respaldo de la v6
def espejo(src, nombre, titulo, bajada, cabeza, cols, filas, ancho_b=44, ancho=14, fmt_cab=None, col_b=None):
    s = nueva(nombre, titulo, bajada, [ancho_b] + [ancho] * len(cols))
    ws = w[src]
    r = 4
    cab = ['Ítem'] + [f"={q(src, f'{c}{cabeza}')}" for c in cols]
    cabecera(s, r, cab)
    if fmt_cab:
        for i in range(len(cols)):
            s.cell(r, 3 + i).number_format = fmt_cab
    r += 1
    for fr, tipo in filas:
        if tipo == 'blank':
            r += 1
            continue
        etiqueta = ws.cell(fr, 2).value
        if isinstance(etiqueta, (int, float)) or (isinstance(etiqueta, str) and etiqueta.startswith('=')):
            put(s, r, 2, f"={q(src, f'B{fr}')}", col_b or PCT, align='left')
        else:
            etiqueta = (etiqueta or '').replace('CTN operativo', 'Capital de trabajo').replace('Variación CTN', 'Variación del capital de trabajo')
            etiqueta = etiqueta.replace('ΔCTN', 'Δ capital de trabajo').replace('CTN', 'capital de trabajo')
            put(s, r, 2, etiqueta)
        fmt = {'peso': PESO, 'uni': UNI, 'pct': PCT, 'fac': FAC}[tipo.split('-')[0]]
        for i, c in enumerate(cols):
            if ws[f'{c}{fr}'].value is None:
                continue
            put(s, r, 3 + i, f"={q(src, f'{c}{fr}')}" + (f'*{M}' if tipo.startswith('peso') else ''), fmt)
        if tipo.endswith('-sub'):
            estilo_fila(s, r, 2, 2 + len(cols), 'sub')
        r += 1
    s.freeze_panes = 'C5'
    s.print_title_rows = '1:4'
    return s, r


_pre = next(c for c in range(4, w['Mensual'].max_column + 1) if w['Mensual'].cell(5, c).value == 'Preapertura')
cols = [L(c - 1) for c in range(_pre, 22)] + ['U']
s, r = espejo('Calendario', 'A1 Calendario inversión', 'Anexo 1. Calendario de inversiones antes de la apertura',
              'Pesos de 2026. Meses de la preapertura (−5 a 0); desembolsos al cierre del mes. Los factores llevan cada pago al '
              'momento cero con la tasa del flujo (Ku o Ke).',
              5, cols, [(6, 'peso'), (7, 'peso'), (8, 'peso'), (9, 'peso'), (10, 'peso'), (12, 'peso-sub'), (0, 'blank'),
                        (14, 'fac'), (15, 'peso-sub'), (0, 'blank'), (17, 'fac'), (18, 'peso-sub')], ancho=13, fmt_cab=UNI)
s.cell(4, 2 + len(cols)).number_format = 'General'
cols = [L(c) for c in range(4, 40)]
espejo('3 años', 'A2 Caja mensual 3 años', 'Anexo 2. Flujo de caja mensual de los primeros 36 meses',
       'Pesos de 2026. Rampa de instalaciones, inventario, impuesto y necesidad de aportes.',
       5, cols, [(7, 'uni'), (8, 'uni'), (0, 'blank'), (10, 'peso'), (11, 'peso'), (12, 'peso'), (13, 'peso-sub'), (0, 'blank'),
                 (15, 'peso'), (16, 'peso'), (17, 'peso-sub'), (0, 'blank'), (19, 'peso'), (20, 'peso'), (21, 'peso'),
                 (23, 'peso-sub'), (24, 'peso'), (0, 'blank'), (26, 'peso'), (27, 'peso'), (28, 'peso'), (29, 'peso-sub')],
       fmt_cab=FECHA)
cols = [L(c) for c in range(4, 64)]
espejo('CT mensual', 'A3 Capital trabajo mensual', 'Anexo 3. Capital de trabajo y caja operativa mensual (60 meses)',
       'Pesos de 2026. Caja operativa antes de inversiones e impuesto. El déficit acumulado dimensiona el financiamiento.',
       5, cols, [(7, 'uni'), (0, 'blank'), (9, 'peso'), (10, 'peso'), (11, 'peso'), (12, 'peso-sub'), (0, 'blank'),
                 (14, 'peso'), (15, 'peso'), (16, 'peso'), (17, 'peso-sub'), (18, 'peso'), (0, 'blank'),
                 (20, 'peso'), (21, 'peso'), (22, 'peso')], fmt_cab=FECHA)
cols = [L(c) for c in range(3, 10)]
espejo('Impuestos', 'A4 Impuestos', 'Anexo 4. Impuesto a la renta y pérdidas de arrastre por año calendario',
       'Pesos de 2026. Se determina por año comercial (enero a diciembre) y se paga en abril del año siguiente.',
       5, cols, [(6, 'pct'), (0, 'blank'), (8, 'peso'), (9, 'peso'), (10, 'peso'), (11, 'peso'), (12, 'peso-sub'), (13, 'peso'),
                 (0, 'blank'), (16, 'peso'), (17, 'peso'), (18, 'peso'), (19, 'peso'), (20, 'peso-sub'), (21, 'peso')],
       ancho=16, fmt_cab=r'0')
cols = [L(c) for c in range(3, 8)]
s, r = espejo('Sensibilidad', 'A5 Sensibilidad', 'Anexo 5. Sensibilidad del VAN puro al precio y a la tasa Ku',
              'Pesos de 2026. Filas: Ku real. Columnas: cambio del precio con el volumen constante.',
              5, cols, [(6, 'peso'), (7, 'peso'), (8, 'peso-sub'), (9, 'peso'), (10, 'peso'), (0, 'blank'), (13, 'peso'), (14, 'peso')],
              ancho_b=40, ancho=18, fmt_cab=PCT)
s['B4'] = 'Ku real \\ cambio de precio'
nota(s, r + 1, f"={q('Sensibilidad', 'B16')}", 7, 44)

# ---------------------------------------------------------------------------------------------
# Resumen al inicio de las hojas 1 a 7 (indicación del profesor: el resumen va arriba y el detalle debajo)
RESUMEN = {
    '1 Inversión': (['Resumen', 'Monto'], [('Activo fijo', 'Activo fijo', 'C'),
                                          ('Activo nominal (puesta en marcha y software)', 'Activo nominal (puesta en marcha y software)', 'C'),
                                          ('Capital de trabajo comprado antes de abrir', 'Capital de trabajo inicial (stock, anticipos e IVA)', 'C'),
                                          ('Inversión equivalente antes de abrir (año 0)', 'Inversión equivalente en el año 0', 'C'),
                                          ('Capital de trabajo adicional al abrir', 'Capital de trabajo adicional al abrir (déficit acumulado máximo)', 'C'),
                                          ('Inversión total del año 0', 'Inversión total del año 0 en el flujo de caja', 'C')]),
    '2 Ingresos y costos': (['Resumen', 'Unidad', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'],
                            [('Instalaciones', 'Instalaciones', 'CDEFGH'), ('Total ingresos', 'Total ingresos', 'DEFGH'),
                             ('Margen de contribución', 'Margen de contribución', 'DEFGH'),
                             ('EBITDA', 'Resultado antes de depreciación, intereses e impuestos (EBITDA)', 'DEFGH'),
                             ('% de los ingresos destinado a personas', '% de los ingresos destinado a personas', 'CDEFGH')]),
    '3 Capital de trabajo': (['Resumen', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'],
                             [('Capital de trabajo inicial (año 0)', 'Capital de trabajo inicial (año 0)', 'C'),
                              ('Inversión en capital de trabajo', 'Inversión en capital de trabajo', 'CDEFGH'),
                              ('Recuperación al cierre', 'Recuperación del capital de trabajo', 'H'),
                              ('Saldo de inventario, tránsito e IVA al cierre', 'Saldo de capital de trabajo al cierre (inventario, tránsito e IVA)', 'CDEFGH')]),
    '4 Flujo puro': (['Resumen', 'Valor'], [('Tasa de descuento (Ku)', 'Tasa de descuento: Ku (CAPM con beta desapalancado)', 'C'),
                                           ('VAN', 'VAN', 'C'), ('TIR', 'TIR', 'C'), ('Payback descontado', 'Payback descontado', 'C'),
                                           ('Inversión del año 0', 'Flujo de caja libre (FCL)', 'C')]),
    '5 Flujo financiado': (['Resumen', 'Valor'], [('Tasa de descuento (Ke)', 'Tasa de descuento: Ke (costo del patrimonio, CAPM con beta apalancado)', 'C'),
                                                 ('VAN', 'VAN', 'C'), ('TIR', 'TIR', 'C'), ('Payback descontado', 'Payback descontado', 'C'),
                                                 ('Aporte de los socios en el año 0', 'Flujo de caja del inversionista', 'C')]),
    '6 Tasa de descuento': (['Resumen', 'Valor'], [('Ku: flujo puro', 'Ku: costo del capital sin deuda', 'C'),
                                                  ('Ke: flujo financiado', 'Ke: costo del patrimonio', 'C'),
                                                  ('Kd real', 'Kd: costo real de la deuda', 'C'), ('WACC (referencia)', 'WACC (referencia)', 'C')]),
    '7 Punto de equilibrio': (['Resumen', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'],
                              [('Instalaciones proyectadas', 'Instalaciones proyectadas', 'CDEFG'),
                               ('Punto de equilibrio (instalaciones)', 'Punto de equilibrio (instalaciones)', 'CDEFG'),
                               ('Sobre (bajo) el equilibrio', 'Instalaciones proyectadas sobre (bajo) el equilibrio', 'CDEFG'),
                               ('Precio neto que lleva el VAN a cero', 'Precio neto promedio que lleva el VAN a cero', 'C')]),
}
for nombre, (cab_, items) in RESUMEN.items():
    s = w[nombre]
    k = RES[nombre]
    seccion(s, 4, 'Resumen', 1 + len(cab_))
    cabecera(s, 5, ['Indicador'] + cab_[1:])
    filas = {}
    for row in s.iter_rows(min_row=4 + k):
        b = row[1].value
        if isinstance(b, str) and b.strip() not in filas:
            filas[b.strip()] = row[1].row
    for i, (et, buscar, cols) in enumerate(items):
        rr = 6 + i
        assert buscar in filas, (nombre, buscar)
        put(s, rr, 2, et, bold=True)
        for col in cols:
            src = s[f'{col}{filas[buscar]}']
            put(s, rr, ord(col) - 64, f'={col}{filas[buscar]}', fmt=src.number_format, bold=True)
        estilo_fila(s, rr, 2, 1 + len(cab_), 'sub')
    assert 6 + len(items) <= 3 + k, nombre
    col_frz = 'D' if nombre == '2 Ingresos y costos' else 'C'
    s.freeze_panes = f'{col_frz}{5 + k}'
    s.print_title_rows = f'{4 + k}:{4 + k}'

# ---------------------------------------------------------------------------------------------
# Datos: formato de números según la unidad (solo formato, no valores)
d = w['Datos']
for row in d.iter_rows(min_row=6):
    z, u = row[2], row[3].value
    if z.value is None or isinstance(z.value, str) and not z.value.startswith('='):
        continue
    u = str(u or '').strip()
    if '%' in u:
        z.number_format = PCT
    elif 'MM' in u:
        z.number_format = DEC
    elif '$' in u or 'CLP' in u:
        z.number_format = PESO
    elif u == 'factor':
        z.number_format = FAC
    elif u == 'selector':
        z.number_format = '0'
    elif isinstance(z.value, (int, float)) and float(z.value).is_integer():
        z.number_format = UNI
    elif z.number_format.startswith('#,##0.00'):
        z.number_format = DEC

d['A1'].font = Font(name=F, size=16, bold=True, color=CEL)
for row in d.iter_rows(min_row=4):
    b = row[1]
    if b.value in ('Parámetro', 'Supuesto', 'Concepto') and row[2].value in ('Valor',):
        for z in row[1:7]:
            z.fill = PatternFill('solid', fgColor=CEL)
            z.font = Font(name=F, bold=True, color='FFFFFF')
    elif isinstance(b.value, str) and row[2].value is None and row[3].value is None and b.row > 5:
        b.font = Font(name=F, bold=True, color=CEL)

# ---------------------------------------------------------------------------------------------
# Controles de la nueva capa (al pie de la hoja Controles; no altera la suma de la v6)
c = w['Controles']
r0 = c.max_row + 3
c.cell(r0, 2, 'Controles de las hojas con el formato de la pauta (deben ser 0; pesos, unidades o puntos básicos)').font = Font(name=F, bold=True, color=CEL)
for i, (et, f) in enumerate(controles, start=1):
    c.cell(r0 + i, 2, et).font = Font(name=F)
    z = c.cell(r0 + i, 3, f)
    z.number_format = r'#,##0.000000;\-#,##0.000000;"0"'
total_r = r0 + len(controles) + 1
c.cell(total_r, 2, 'Suma absoluta de estos controles').font = Font(name=F, bold=True)
c.cell(total_r, 3, f'=SUMPRODUCT(ABS(C{r0+1}:C{r0+len(controles)}))').number_format = r'#,##0.000000'
c.cell(total_r, 3).font = Font(name=F, bold=True)

# Notas: orden de lectura nuevo
n = w['Notas y cambios']
for row in n.iter_rows():
    for z in row:
        if isinstance(z.value, str) and z.value.startswith('Cambiar inputs en Datos'):
            z.value = ('Cambiar supuestos solo en Datos y comprobar que Controles sea 0. Orden de lectura (v7, formato del curso): '
                       'Resumen → Datos → 1 Inversión → 2 Ingresos y costos → 3 Capital de trabajo → 4 Flujo puro → '
                       '5 Flujo financiado → 5.1 Tabla de amortización → 6 Tasa de descuento → 7 Punto de equilibrio → anexos A1 a A5. '
                       'Las hojas de cálculo de la v6 siguen en el libro, ocultas y sin cambios; las hojas visibles solo las leen.')

# ---------------------------------------------------------------------------------------------
# Visibilidad y orden
nuevas = ['1 Inversión', '1.1 Respaldo inversión', '1.2 Costo del kit', '2 Ingresos y costos', '2.1 Proyección de demanda', '3 Capital de trabajo', '4 Flujo puro', '5 Flujo financiado',
          '5.1 Tabla de amortización', '6 Tasa de descuento', '7 Punto de equilibrio', 'A1 Calendario inversión',
          'A2 Caja mensual 3 años', 'A3 Capital trabajo mensual', 'A4 Impuestos', 'A5 Sensibilidad']
visibles = ['Resumen', 'Datos'] + nuevas + ['Controles', 'Notas y cambios']
for ws in w.worksheets:
    ws.sheet_state = 'visible' if ws.title in visibles else 'hidden'
    ws.sheet_view.tabSelected = False
orden = visibles + [ws.title for ws in w.worksheets if ws.title not in visibles]
w._sheets = [w[t] for t in orden]
w.active = 0
w['Resumen'].sheet_view.tabSelected = True
w.calculation.fullCalcOnLoad = True
w.save(OUT)
print(f'Guardado {OUT} · {len(controles)} controles nuevos · ocultas de la v6: {[t for t in v6_visibles if t not in visibles]}')
