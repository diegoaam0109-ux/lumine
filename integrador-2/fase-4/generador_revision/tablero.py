#!/usr/bin/env python3
"""Tablero y hoja «Escenarios y cambios» sobre la v7 (formato del curso). No cambia números del modelo.

Uso: tablero.py ENTRADA SALIDA [--escenario Pesimista|Central|Optimista] [--base base.json] [--fotos fotos.json]

- Selectores (listas desplegables): escenario de demanda, flujo (puro o inversionista) y año. El escenario escribe el
  selector del modelo (Datos!C43), así que recalcula todo el libro; el flujo y el año solo cambian lo que se muestra.
- «Base»: foto de los indicadores con los supuestos vigentes al construir (escenario central). Cada tarjeta muestra
  cuánto cambió el indicador frente a esa base, para ver al instante el efecto de una corrección.
- Fotos de los tres escenarios: se calculan al construir (construir_v7.py) y quedan como valores en la hoja de escenarios.
"""
from pathlib import Path
import argparse, json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.hyperlink import Hyperlink
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.chart.text import RichText
from openpyxl.chart.data_source import NumFmt
from openpyxl.chart.marker import DataPoint, Marker
from openpyxl.chart.legend import Legend
from openpyxl.chart.series import SeriesLabel
from openpyxl.drawing.line import LineProperties
from openpyxl.drawing.text import Paragraph, ParagraphProperties, CharacterProperties, Font as DFont

ap = argparse.ArgumentParser()
ap.add_argument('entrada'); ap.add_argument('salida')
ap.add_argument('--escenario', default='Central')
ap.add_argument('--base'); ap.add_argument('--fotos')
args = ap.parse_args()
HERE = Path(__file__).resolve().parent

# Paleta del libro (la misma de las hojas 1 a 7): blanco, celeste Lumine y negro
BG, SURF, WELL, CTRL = 'FFFFFF', 'EAF7FD', 'F2F2F2', 'FFFFFF'
FG, MUTED, DIM, LINE, LINE2 = '000000', '595959', 'A6A6A6', 'D9D9D9', 'D9D9D9'
ACC, ONACC, OK, CRIT = '12AAE9', 'FFFFFF', '157A46', 'B42318'
F = 'Calibri'
M = 1000000
MM = r'"$ "#,##0.0,," M";"$ -"#,##0.0,," M";"$ 0"'
MMT = r'#,##0.0,,;\-#,##0.0,,;"-"'
PCT = '0.00%'
ANOS = '0.00 "años"'
DM = r'"▲ $"#,##0.0,," M vs base";"▼ $"#,##0.0,," M vs base";"= igual a la base"'
DPP = r'"▲ "0.00" pp vs base";"▼ "0.00" pp vs base";"= igual a la base"'
DAN = r'"▲ "0.00" años vs base";"▼ "0.00" años vs base";"= igual a la base"'
DX = r'"▲ "0.00" vs base";"▼ "0.00" vs base";"= igual a la base"'
DU = r'"▲ "#,##0" vs base";"▼ "#,##0" vs base";"= igual a la base"'

w = openpyxl.load_workbook(args.entrada)
BASE = json.load(open(args.base)) if args.base else {}
FOTOS = json.load(open(args.fotos)) if args.fotos else {}


def fila_de(hoja, etiqueta, inicio=False):
    for row in w[hoja].iter_rows(min_col=2, max_col=2):
        v = row[0].value
        if isinstance(v, str) and (v.startswith(etiqueta) if inicio else v == etiqueta):
            return row[0].row
    raise KeyError(f'{hoja}: {etiqueta}')


def q(h, ref):
    return f"'{h}'!{ref}"


def fnt(color=FG, size=11, bold=False, italic=False, name=F):
    return Font(name=name, size=size, bold=bold, italic=italic, color=color)


def pintar(s, rango, color):
    for row in s[rango]:
        for z in row:
            z.fill = PatternFill('solid', fgColor=color)


def put(s, ref, v, color=FG, size=11, bold=False, fmt=None, h=None, v_al='center', italic=False, wrap=False, fill=None):
    z = s[ref]
    z.value = v
    z.font = fnt(color, size, bold, italic)
    z.alignment = Alignment(horizontal=h, vertical=v_al, wrap_text=wrap)
    if fmt:
        z.number_format = fmt
    if fill:
        z.fill = PatternFill('solid', fgColor=fill)
    return z


def link(z, hoja):
    z.hyperlink = Hyperlink(ref=z.coordinate, location=f"'{hoja}'!A1", display=str(z.value))


# ------------------------------------------------------------------------------------------------
# Hoja auxiliar (oculta): series y escalares que alimentan tarjetas y gráficos. Base en columnas J:O / C.
d = w.create_sheet('Tablero datos')
d['A1'] = 'Serie (B:G = actual, años 0 a 5; J:O = base)'
d.sheet_state = 'hidden'
AN = 'CDEFGH'           # años 0..5 en las hojas de flujo
HB = 'BCDEFG'           # años 0..5 en esta hoja (actual)
HBASE = 'JKLMNO'        # años 0..5 (base)
SEL = {}
r = 3
for clave, f in [('esc', '=IF(Tablero!$M$3="Pesimista",1,IF(Tablero!$M$3="Optimista",3,2))'),
                 ('flujo', '=IF(Tablero!$P$3="Inversionista",2,1)'),
                 ('ano', '=MAX(1,MIN(5,VALUE(Tablero!$S$3&"")))')]:
    d.cell(r, 1, clave); d.cell(r, 2, f); SEL[clave] = f'$B${r}'; r += 1
FLU = q('Tablero datos', SEL['flujo'])
ANO = q('Tablero datos', SEL['ano'])
r += 1

H4, H5 = '4 Flujo puro', '5 Flujo financiado'


def filas_flujo(h, financiado):
    g = lambda e, i=False: fila_de(h, e, i)
    fl = 'Flujo de caja del inversionista' if financiado else 'Flujo de caja libre (FCL)'
    return {
        'ing': [g('Total ingresos')], 'mc': [g('Margen de contribución')], 'eb': [g('EBITDA')],
        'ro': [g('Resultado operacional')], 'rai': [g('Resultado antes de impuesto')],
        'imp': [g('Impuesto a la renta')], 'rdi': [g('Resultado después de impuesto')],
        'fco': [g('Flujo de caja operacional')],
        'inv': list(range(g('Inversión dinamómetro', True), g('Costo financiero de la inversión previa') + 1)),
        'ct': [g('Capital de trabajo'), g('Garantía de arriendo')],
        'rec': [g('Recuperación del capital de trabajo'), g('Recuperación de la garantía de arriendo'),
                g('Valor de desecho (activos a valor libro)')],
        'prest': [g('Préstamo'), g('Amortización de capital del préstamo')] if financiado else [],
        'fcl': [g(fl)], 'acum': [g('Flujo descontado acumulado')],
        'van': g('VAN'), 'tir': g('TIR'), 'pbs': g('Payback simple'), 'pbd': g('Payback descontado'),
        'vsr': g('VAN sin recuperaciones de cierre (sensibilidad)'), 'tasa': g('Tasa de descuento', True)}


FP, FI = filas_flujo(H4, False), filas_flujo(H5, True)
SERIES = ['ing', 'cv', 'mc', 'cfg', 'eb', 'da', 'gf', 'imp', 'rdi', 'fco', 'inv', 'ct', 'rec', 'prest', 'fcl', 'acum']
DER = {'cv': ('mc', 'ing'), 'cfg': ('eb', 'mc'), 'da': ('ro', 'eb'), 'gf': ('rai', 'ro')}
ROW = {}
for k in SERIES:
    for var, h, fl in [('P', H4, FP), ('I', H5, FI)]:
        d.cell(r, 1, f'{k}_{var}')
        for y in range(6):
            col = AN[y]
            if k in DER:
                a, b = DER[k]
                f = f"={q(h, f'{col}{fl[a][0]}')}-{q(h, f'{col}{fl[b][0]}')}"
            elif not fl[k]:
                f = 0
            else:
                f = '=' + '+'.join(q(h, f'{col}{rr}') for rr in fl[k])
            d.cell(r, 2 + y, f)
        ROW[f'{k}_{var}'] = r
        r += 1
    d.cell(r, 1, f'{k}_S')
    for y in range(6):
        c = HB[y]
        d.cell(r, 2 + y, f"=CHOOSE({SEL['flujo']},{c}{ROW[f'{k}_P']},{c}{ROW[f'{k}_I']})")
    ROW[f'{k}_S'] = r
    r += 1
SERIE_FIN = r - 1
r += 1

# Escalares: (clave, etiqueta, fórmula, formato de valor, formato de cambio, ¿mejor si sube?)
CT3 = '3 Capital de trabajo'
EQ7 = '7 Punto de equilibrio'
IC2 = '2 Ingresos y costos'
T6 = '6 Tasa de descuento'
AM = '5.1 Tabla de amortización'
fila_inst = fila_de(IC2, 'Instalaciones')
ESC = [
    ('van_p', 'VAN flujo puro (a Ku)', f"={q(H4, 'C%d' % FP['van'])}", MM, DM, True),
    ('tir_p', 'TIR flujo puro', f"={q(H4, 'C%d' % FP['tir'])}", PCT, DPP, True),
    ('pbd_p', 'Payback descontado, flujo puro', f"={q(H4, 'C%d' % FP['pbd'])}", ANOS, DAN, False),
    ('van_i', 'VAN flujo inversionista (a Ke)', f"={q(H5, 'C%d' % FI['van'])}", MM, DM, True),
    ('tir_i', 'TIR flujo inversionista', f"={q(H5, 'C%d' % FI['tir'])}", PCT, DPP, True),
    ('pbd_i', 'Payback descontado, flujo inversionista', f"={q(H5, 'C%d' % FI['pbd'])}", ANOS, DAN, False),
    ('van_aj', 'VAN ajustado (VAN puro + VAN de la deuda)', f"={q(AM, 'C%d' % fila_de(AM, 'VAN ajustado', True))}", MM, DM, True),
    ('vsr', 'VAN puro sin recuperaciones de cierre', f"={q(H4, 'C%d' % FP['vsr'])}", MM, DM, True),
    ('ku', 'Ku (tasa del flujo puro)', '=Datos!C16', PCT, DPP, False),
    ('ke', 'Ke (tasa del flujo inversionista)', '=Datos!C18', PCT, DPP, False),
    ('kd', 'Kd real (costo de la deuda)', '=Datos!C19', PCT, DPP, False),
    ('wacc', 'WACC (referencia)', '=Datos!C21', PCT, DPP, False),
    ('dp', 'Deuda / patrimonio (D/P)', '=Datos!C9', PCT, DPP, None),
    ('bl', 'Beta apalancado (βl)', '=Datos!C17', '0.00', DX, None),
    ('inv0_p', 'Inversión equivalente en el año 0', f"=-{q(H4, 'C%d' % FP['fcl'][0])}", MM, DM, False),
    ('inv0_i', 'Aporte de los socios en el año 0', f"=-{q(H5, 'C%d' % FI['fcl'][0])}", MM, DM, False),
    ('finmax', 'Necesidad máxima de financiamiento sin deuda', f"={q(CT3, 'C%d' % fila_de(CT3, 'Necesidad máxima', True))}", MM, DM, False),
    ('aporte', 'Aportes de los socios con deuda (flujo mensual)', f"={q('Deuda', 'C42')}*{M}", MM, DM, False),
    ('prest', 'Préstamo', f"={q(AM, 'C4')}", MM, DM, None),
    ('ctmax', 'Capital de trabajo al cierre del año 5', f"={q(CT3, 'H%d' % fila_de(CT3, 'Capital de trabajo requerido al cierre'))}", MM, DM, False),
    ('inst', 'Instalaciones en 5 años', f"=SUM({q(IC2, 'D%d:H%d' % (fila_inst, fila_inst))})", '#,##0', DU, True),
    ('qe1', 'Punto de equilibrio año 1 (instalaciones)', f"={q(EQ7, 'C%d' % fila_de(EQ7, 'Mínimo de instalaciones enteras'))}", '#,##0', DU, False),
    ('ing1', 'Ingresos año 1', f"={q(IC2, 'D%d' % fila_de(IC2, 'Total ingresos'))}", MM, DM, True),
    ('ing5', 'Ingresos año 5', f"={q(IC2, 'H%d' % fila_de(IC2, 'Total ingresos'))}", MM, DM, True),
    ('eb1', 'EBITDA año 1', f"={q(IC2, 'D%d' % fila_de(IC2, 'Resultado antes de depreciación', True))}", MM, DM, True),
    ('eb5', 'EBITDA año 5', f"={q(IC2, 'H%d' % fila_de(IC2, 'Resultado antes de depreciación', True))}", MM, DM, True),
    ('pvan0', 'Cambio de precio que deja el VAN puro en cero', f"={q('Equilibrio', 'C19')}", PCT, DPP, False),
]
EROW = {}
d.cell(r, 1, 'Escalares: B = actual, C = base')
r += 1
for clave, et, f, *_ in ESC:
    d.cell(r, 1, clave); d.cell(r, 2, f)
    d.cell(r, 3, BASE.get(clave))
    EROW[clave] = r
    r += 1
# Base de las series (foto)
for k in SERIES:
    for var in 'PI':
        rr = ROW[f'{k}_{var}']
        vals = BASE.get(f'{k}_{var}', [None] * 6)
        for y in range(6):
            d.cell(rr, 10 + y, vals[y])
    rr = ROW[f'{k}_S']
    for y in range(6):
        c = HBASE[y]
        d.cell(rr, 10 + y, f"=CHOOSE({SEL['flujo']},{c}{ROW[f'{k}_P']},{c}{ROW[f'{k}_I']})")
r += 1


def serie_ano(k, base=False):
    cols = HBASE if base else HB
    rr = ROW[f'{k}_S']
    return f"INDEX({q('Tablero datos', f'${cols[0]}${rr}:${cols[-1]}${rr}')},1,{ANO}+1)"


def esc(clave, base=False):
    return q('Tablero datos', f"${'C' if base else 'B'}${EROW[clave]}")


# Cascada (año y flujo elegidos): inicio, fin y cuatro series apiladas
d.cell(r, 1, 'Cascada: categoría | inicio | fin | base+ | visible+ | base− | visible−')
r += 1
CAS0 = r
pasos = [('Ingresos', 'ing', True), ('C. variables', 'cv', False), ('Margen', 'mc', True),
         ('C. fijos y GAV', 'cfg', False), ('EBITDA', 'eb', True), ('Deprec. y amort.', 'da', False),
         ('G. financiero', 'gf', False), ('Impuesto', 'imp', False), ('Res. neto', 'rdi', True)]
for i, (et, k, total) in enumerate(pasos):
    rr = CAS0 + i
    val = serie_ano(k)
    d.cell(rr, 1, f'="{et}"&CHAR(10)&FIXED({val}/1000000,0)')
    d.cell(rr, 2, 0 if total else f'=C{rr - 1}')
    d.cell(rr, 3, f'={val}' if total else f'=B{rr}+{val}')
    d.cell(rr, 4, f'=IF(MIN(B{rr},C{rr})>0,MIN(B{rr},C{rr}),0)')
    d.cell(rr, 5, f'=MAX(MAX(B{rr},C{rr}),0)-MAX(MIN(B{rr},C{rr}),0)')
    d.cell(rr, 6, f'=IF(MAX(B{rr},C{rr})<0,MAX(B{rr},C{rr}),0)')
    d.cell(rr, 7, f'=MIN(MIN(B{rr},C{rr}),0)-MIN(MAX(B{rr},C{rr}),0)')
CAS1 = CAS0 + len(pasos) - 1
r = CAS1 + 2
# Años para los ejes
d.cell(r, 1, 'Años')
for y in range(6):
    d.cell(r, 2 + y, f'Año {y}')
EJE = r
r += 2
# Ingresos, costos operacionales y EBITDA (años 1 a 5) · instalaciones y equilibrio
OPS = r
d.cell(r, 1, 'Ingresos'); d.cell(r + 1, 1, 'Costos operacionales'); d.cell(r + 2, 1, 'EBITDA')
d.cell(r + 3, 1, 'Instalaciones proyectadas'); d.cell(r + 4, 1, 'Punto de equilibrio')
fq = fila_de(EQ7, 'Instalaciones proyectadas'); fe = fila_de(EQ7, 'Punto de equilibrio (instalaciones)')
for y in range(1, 6):
    c = HB[y]
    d.cell(r, 1 + y, f"={c}{ROW['ing_P']}")
    d.cell(r + 1, 1 + y, f"={c}{ROW['ing_P']}-{c}{ROW['eb_P']}")
    d.cell(r + 2, 1 + y, f"={c}{ROW['eb_P']}")
    d.cell(r + 3, 1 + y, f"={q(EQ7, 'CDEFG'[y - 1] + str(fq))}")
    d.cell(r + 4, 1 + y, f"={q(EQ7, 'CDEFG'[y - 1] + str(fe))}")
d.column_dimensions['A'].width = 40

# ------------------------------------------------------------------------------------------------
# Estilo de gráficos oscuros


def rtxt(color=MUTED, size=900, bold=False):
    cp = CharacterProperties(sz=size, b=bold, solidFill=color, latin=DFont(typeface=F))
    return RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), endParaRPr=cp)])


def oscurecer(ch, leyenda=True, fmt='#,##0,,'):
    ch.graphical_properties = GraphicalProperties(solidFill='FFFFFF', ln=LineProperties(solidFill=LINE2))
    ch.plot_area.graphicalProperties = GraphicalProperties(noFill=True, ln=LineProperties(noFill=True))
    for ax in (ch.x_axis, ch.y_axis):
        ax.delete = False
        ax.txPr = rtxt()
        ax.spPr = GraphicalProperties(ln=LineProperties(solidFill=LINE2))
    ch.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill=LINE))
    ch.y_axis.numFmt = NumFmt(formatCode=fmt, sourceLinked=False)
    ch.x_axis.tickLblPos = 'low'
    if leyenda:
        ch.legend = Legend()
        ch.legend.position = 'b'
        ch.legend.txPr = rtxt(FG)
    else:
        ch.legend = None
    ch.title = None


def color_serie(sr, color, linea=False):
    if linea:
        sr.graphicalProperties.line.solidFill = color
        sr.graphicalProperties.line.width = 28575
        sr.marker = Marker(symbol='circle', size=6)
        sr.marker.graphicalProperties = GraphicalProperties(solidFill=color, ln=LineProperties(solidFill=color))
        sr.smooth = False
    else:
        sr.graphicalProperties = GraphicalProperties(solidFill=color, ln=LineProperties(noFill=True))


# ------------------------------------------------------------------------------------------------
# Hojas del tablero
NAV = [('Tablero', 'Tablero'), ('Escenarios y cambios', 'Escenarios y cambios'), ('Datos', 'Datos'),
       ('1  Inversión', '1 Inversión'), ('2  Ingresos y costos', '2 Ingresos y costos'),
       ('3  Capital de trabajo', '3 Capital de trabajo'), ('4  Flujo puro', '4 Flujo puro'),
       ('5  Flujo financiado', '5 Flujo financiado'), ('5.1  Amortización', '5.1 Tabla de amortización'),
       ('6  Tasas de descuento', '6 Tasa de descuento'), ('7  Punto de equilibrio', '7 Punto de equilibrio'),
       ('Anexos', 'A1 Calendario inversión'), ('Controles', 'Controles'), ('Motor de cálculo', 'Mensual')]


def lienzo(nombre, activo, alto=70, ancho_col='U'):
    s = w.create_sheet(nombre)
    s.sheet_view.showGridLines = False
    s.sheet_view.zoomScale = 90
    s.sheet_properties.tabColor = ACC
    pintar(s, f'A1:{ancho_col}{alto}', BG)
    pintar(s, 'B2:B46', SURF)
    s.column_dimensions['A'].width = 2
    s.column_dimensions['B'].width = 30
    s.column_dimensions['C'].width = 3
    put(s, 'B3', 'LUMINE MOTORS', ACC, 16, bold=True, fill=SURF)
    put(s, 'B6', 'PLAN FINANCIERO · FASE 4', MUTED, 8, fill=SURF)
    r0 = 8
    for i, (et, hoja) in enumerate(NAV):
        z = put(s, f'B{r0 + i * 2}', f'=HYPERLINK("#\'{hoja}\'!A1","   {et}")', ONACC if hoja == activo else FG, 10,
                bold=hoja == activo, fill=ACC if hoja == activo else CTRL)
        if hoja != activo:
            lado = Side(style='thin', color=ACC)
            z.border = Border(left=lado, right=lado, top=lado, bottom=lado)
        s.row_dimensions[r0 + i * 2].height = 20
    put(s, 'B40', 'Los selectores de arriba recalculan todo el libro (escenario) o cambian lo que se muestra (flujo y año).',
        MUTED, 8, wrap=True, v_al='top', fill=SURF)
    s.merge_cells('B40:B44')
    s.page_setup.orientation = 'landscape'
    s.page_setup.paperSize = s.PAPERSIZE_LETTER
    s.page_setup.fitToWidth = 1
    s.page_setup.fitToHeight = 1
    s.sheet_properties.pageSetUpPr.fitToPage = True
    s.page_margins.left = s.page_margins.right = s.page_margins.top = s.page_margins.bottom = 0.3
    return s


s = lienzo('Tablero', 'Tablero', alto=70)
PAR = [('D', 'E'), ('G', 'H'), ('J', 'K'), ('M', 'N'), ('P', 'Q'), ('S', 'T')]
for c in 'DEGHJKMNPQST':
    s.column_dimensions[c].width = 10.5
for c in 'FILOR':
    s.column_dimensions[c].width = 1.6
s.column_dimensions['U'].width = 2

put(s, 'D2', 'PLAN FINANCIERO', ACC, 16, bold=True)
put(s, 'D3', 'Lumine Motors · tablero de evaluación · pesos de 2026, netos de IVA', MUTED, 10)
# Selectores
for etq, c1, c2, val, lista in [('ESCENARIO DE DEMANDA', 'M', 'N', args.escenario, '"Pesimista,Central,Optimista"'),
                                 ('FLUJO', 'P', 'Q', 'Puro', '"Puro,Inversionista"'),
                                 ('AÑO', 'S', 'T', 3, '"1,2,3,4,5"')]:
    put(s, f'{c1}2', etq, MUTED, 8, bold=True)
    s.merge_cells(f'{c1}3:{c2}3')
    z = put(s, f'{c1}3', val, ONACC, 12, bold=True, h='center', fill=ACC)
    s[f'{c2}3'].fill = PatternFill('solid', fgColor=ACC)
    dv = DataValidation(type='list', formula1=lista, allow_blank=False, showDropDown=False)
    dv.error = 'Elige una opción de la lista.'
    dv.prompt = 'Haz clic en la flecha para cambiar.'
    s.add_data_validation(dv)
    dv.add(f'{c1}3')
s.row_dimensions[3].height = 26
# Estado: controles y decisión
ctl = w['Controles']
fila_ctl = next(r for r in range(1, ctl.max_row + 1) if str(ctl.cell(r, 2).value).startswith('Suma absoluta de estos'))
s.merge_cells('D4:K4')
put(s, 'D4', f'=IF(ABS(Controles!C46)+ABS(Controles!C{fila_ctl})<0.01,"●  Controles del modelo: OK","●  Controles del modelo: REVISAR")',
    OK, 9, bold=True)
s.merge_cells('M4:T4')
put(s, 'M4', f'=IF({esc("van_p")}>0,"Flujo puro: VAN > 0, se acepta","Flujo puro: VAN < 0, se rechaza")&"   ·   "&IF({esc("van_i")}>0,"Inversionista: VAN > 0","Inversionista: VAN < 0")',
    FG, 9, h='right')
s.conditional_formatting.add('D4', FormulaRule(formula=['ISNUMBER(SEARCH("REVISAR",D4))'], font=Font(color=CRIT, bold=True)))


def tarjeta(fila, par, etiqueta, valor, fmt, delta=None, fmt_delta=None, mejor=None, destaca=False, sub=None):
    a, b = par
    for rr in range(fila, fila + 3):
        for c in (a, b):
            s[f'{c}{rr}'].fill = PatternFill('solid', fgColor=SURF)
    for c in (a, b):
        s[f'{c}{fila}'].border = Border(top=Side(style='medium', color=ACC))
    s.merge_cells(f'{a}{fila}:{b}{fila}')
    put(s, f'{a}{fila}', etiqueta, MUTED, 8, bold=True, h='left', fill=SURF)
    s[f'{a}{fila}'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
    s.merge_cells(f'{a}{fila + 1}:{b}{fila + 1}')
    put(s, f'{a}{fila + 1}', valor, ACC if destaca else FG, 20, bold=True, fmt=fmt, h='center', fill=SURF)
    s.merge_cells(f'{a}{fila + 2}:{b}{fila + 2}')
    if sub is not None:
        put(s, f'{a}{fila + 2}', sub, MUTED, 8, h='center', fill=SURF)
    elif delta is not None:
        z = put(s, f'{a}{fila + 2}', delta, MUTED, 8, fmt=fmt_delta, h='center', fill=SURF)
        if mejor is not None:
            arriba, abajo = (OK, CRIT) if mejor else (CRIT, OK)
            s.conditional_formatting.add(z.coordinate, CellIsRule(operator='greaterThan', formula=['0'], font=Font(color=arriba)))
            s.conditional_formatting.add(z.coordinate, CellIsRule(operator='lessThan', formula=['0'], font=Font(color=abajo)))
    s.row_dimensions[fila].height = 18
    s.row_dimensions[fila + 1].height = 34
    s.row_dimensions[fila + 2].height = 16


def dif(act, base, escala=1, tol=0.5):
    return (f'=IF(AND(ISNUMBER({act}),ISNUMBER({base})),IF(ABS(({act})-({base}))*{escala}<{tol},0,'
            f'(({act})-({base}))*{escala}),0)')


def texto_si_no(x, texto):
    return f'=IF(ISNUMBER({x}),{x},"{texto}")'


sel2 = lambda kp, ki, base=False: f'CHOOSE({FLU},{esc(kp, base)},{esc(ki, base)})'
# Fila 1 de tarjetas: rentabilidad del flujo elegido
tarjeta(6, PAR[0], f'=IF({FLU}=1,"VAN · FLUJO PURO","VAN · INVERSIONISTA")', '=' + sel2('van_p', 'van_i'), MM,
        dif(sel2('van_p', 'van_i'), sel2('van_p', 'van_i', True)), DM, True, destaca=True)
tarjeta(6, PAR[1], f'=IF({FLU}=1,"TIR · FLUJO PURO","TIR · INVERSIONISTA")', texto_si_no(sel2('tir_p', 'tir_i'), 'No converge'), PCT,
        dif(sel2('tir_p', 'tir_i'), sel2('tir_p', 'tir_i', True), 100, 0.005), DPP, True, destaca=True)
tarjeta(6, PAR[2], f'=IF({FLU}=1,"TASA · KU","TASA · KE")', '=' + sel2('ku', 'ke'), PCT,
        dif(sel2('ku', 'ke'), sel2('ku', 'ke', True), 100, 0.005), DPP, False)
tarjeta(6, PAR[3], 'PAYBACK DESCONTADO', texto_si_no(sel2('pbd_p', 'pbd_i'), 'No recupera'), ANOS,
        dif(sel2('pbd_p', 'pbd_i'), sel2('pbd_p', 'pbd_i', True), 1, 0.005), DAN, False)
tarjeta(6, PAR[4], f'=IF({FLU}=1,"INVERSIÓN AÑO 0","APORTE SOCIOS AÑO 0")', '=' + sel2('inv0_p', 'inv0_i'), MM,
        dif(sel2('inv0_p', 'inv0_i'), sel2('inv0_p', 'inv0_i', True)), DM, False)
tarjeta(6, PAR[5], f'=IF({FLU}=1,"FINANCIAMIENTO MÁXIMO","APORTES TOTALES SOCIOS")', '=' + sel2('finmax', 'aporte'), MM,
        dif(sel2('finmax', 'aporte'), sel2('finmax', 'aporte', True)), DM, False)
# Fila 2: operación del año elegido y estructura de capital
act_ano = lambda k: '=' + serie_ano(k)
tarjeta(10, PAR[0], f'="INGRESOS · AÑO "&{ANO}', act_ano('ing'), MM, dif(serie_ano('ing'), serie_ano('ing', True)), DM, True)
tarjeta(10, PAR[1], f'="EBITDA · AÑO "&{ANO}', act_ano('eb'), MM, dif(serie_ano('eb'), serie_ano('eb', True)), DM, True)
tarjeta(10, PAR[2], f'="RESULTADO NETO · AÑO "&{ANO}', act_ano('rdi'), MM, dif(serie_ano('rdi'), serie_ano('rdi', True)), DM, True)
tarjeta(10, PAR[3], f'="FLUJO DE CAJA · AÑO "&{ANO}', act_ano('fcl'), MM, dif(serie_ano('fcl'), serie_ano('fcl', True)), DM, True)
tarjeta(10, PAR[4], 'WACC (REFERENCIA)', f'={esc("wacc")}', PCT, dif(esc('wacc'), esc('wacc', True), 100, 0.005), DPP, False)
tarjeta(10, PAR[5], 'DEUDA / PATRIMONIO', f'={esc("dp")}', PCT, sub=f'="βu "&FIXED(Datos!C8,2)&"  ·  βl "&FIXED({esc("bl")},2)')


def seccion(ref, num, texto, formula=False):
    put(s, ref, f'="{num}  ——  "&{texto}' if formula else f'{num}  ——  {texto}', ACC, 9, bold=True)


seccion('D14', '01', f'IF({FLU}=1,"FLUJO DE CAJA PURO Y ACUMULADO DESCONTADO (MM$)","FLUJO DEL INVERSIONISTA Y ACUMULADO DESCONTADO (MM$)")', True)
seccion('M14', '02', f'"DEL INGRESO AL RESULTADO NETO · AÑO "&{ANO}&" (MM$)"', True)
for rr in range(13, 54):
    s.row_dimensions[rr].height = 15
seccion('D33', '03', 'INGRESOS, COSTOS OPERACIONALES Y EBITDA (MM$)')
seccion('M33', '04', 'INSTALACIONES PROYECTADAS FRENTE AL PUNTO DE EQUILIBRIO')

# Gráfico 01: flujo elegido (barras) + acumulado descontado (línea)
b = BarChart(); b.type = 'col'; b.gapWidth = 60
b.add_data(Reference(d, min_col=2, max_col=7, min_row=ROW['fcl_S']), from_rows=True, titles_from_data=False)
b.set_categories(Reference(d, min_col=2, max_col=7, min_row=EJE))
b.series[0].tx = None
color_serie(b.series[0], ACC)
b.series[0].tx = SeriesLabel(v='Flujo de caja')
ln = LineChart()
ln.add_data(Reference(d, min_col=2, max_col=7, min_row=ROW['acum_S']), from_rows=True, titles_from_data=False)
ln.series[0].tx = SeriesLabel(v='Acumulado descontado')
color_serie(ln.series[0], FG, linea=True)
oscurecer(b)
b += ln
b.width, b.height = 13.6, 8.3
s.add_chart(b, 'D16')

# Gráfico 02: cascada del estado de resultados
c2 = BarChart(); c2.type = 'col'; c2.grouping = 'stacked'; c2.overlap = 100; c2.gapWidth = 40
for col in range(4, 8):
    c2.add_data(Reference(d, min_col=col, min_row=CAS0, max_row=CAS1), titles_from_data=False)
c2.set_categories(Reference(d, min_col=1, min_row=CAS0, max_row=CAS1))
for i, sr in enumerate(c2.series):
    if i in (0, 2):
        sr.graphicalProperties = GraphicalProperties(noFill=True, ln=LineProperties(noFill=True))
    else:
        color_serie(sr, DIM)
        for p, (_, _, total) in enumerate(pasos):
            if total:
                pt = DataPoint(idx=p)
                pt.graphicalProperties = GraphicalProperties(solidFill=ACC, ln=LineProperties(noFill=True))
                sr.dPt.append(pt)
oscurecer(c2, leyenda=False)
c2.x_axis.txPr = rtxt(MUTED, 700)
c2.width, c2.height = 13.6, 8.3
s.add_chart(c2, 'M16')

# Gráfico 03: ingresos y costos operacionales (barras) + EBITDA (línea)
c3 = BarChart(); c3.type = 'col'; c3.gapWidth = 80
c3.add_data(Reference(d, min_col=1, max_col=6, min_row=OPS, max_row=OPS + 1), from_rows=True, titles_from_data=True)
c3.set_categories(Reference(d, min_col=3, max_col=7, min_row=EJE))
color_serie(c3.series[0], ACC)
color_serie(c3.series[1], DIM)
l3 = LineChart()
l3.add_data(Reference(d, min_col=1, max_col=6, min_row=OPS + 2), from_rows=True, titles_from_data=True)
color_serie(l3.series[0], FG, linea=True)
oscurecer(c3)
c3 += l3
c3.width, c3.height = 13.6, 8.3
s.add_chart(c3, 'D35')

# Gráfico 04: instalaciones vs equilibrio
c4 = BarChart(); c4.type = 'col'; c4.gapWidth = 80
c4.add_data(Reference(d, min_col=1, max_col=6, min_row=OPS + 3), from_rows=True, titles_from_data=True)
c4.set_categories(Reference(d, min_col=3, max_col=7, min_row=EJE))
color_serie(c4.series[0], ACC)
l4 = LineChart()
l4.add_data(Reference(d, min_col=1, max_col=6, min_row=OPS + 4), from_rows=True, titles_from_data=True)
color_serie(l4.series[0], FG, linea=True)
oscurecer(c4, fmt='#,##0')
c4 += l4
c4.width, c4.height = 13.6, 8.3
s.add_chart(c4, 'M35')

# Tabla 05: flujo elegido, años 0 a 5 (etiquetas en la columna B, bajo el menú)
seccion('B54', '05', f'IF({FLU}=1,"FLUJO DE CAJA PURO POR AÑO (MM$)","FLUJO DEL INVERSIONISTA POR AÑO (MM$)")', True)
for y, (a, bb) in enumerate(PAR):
    s.merge_cells(f'{a}55:{bb}55')
    put(s, f'{a}55', f'Año {y}', ONACC, 10, bold=True, h='center', fill=ACC)
    s[f'{bb}55'].fill = PatternFill('solid', fgColor=ACC)
put(s, 'B55', 'Concepto', ONACC, 10, bold=True, fill=ACC)
filas_tabla = [('Ingresos', 'ing', False), ('EBITDA', 'eb', False), ('Resultado después de impuesto', 'rdi', False),
               ('Flujo de caja operacional', 'fco', False), ('Inversiones y costo financiero previo', 'inv', False),
               ('Capital de trabajo y garantía', 'ct', False), ('Recuperaciones y valor de desecho', 'rec', False),
               ('Préstamo neto de amortizaciones', 'prest', False), ('Flujo de caja', 'fcl', True),
               ('Flujo descontado acumulado', 'acum', False)]
for i, (et, k, tot) in enumerate(filas_tabla):
    rr = 56 + i
    put(s, f'B{rr}', et, FG, 10, bold=tot, fill=SURF if tot else None)
    for y, (a, bb) in enumerate(PAR):
        s.merge_cells(f'{a}{rr}:{bb}{rr}')
        z = put(s, f'{a}{rr}', f"={q('Tablero datos', HB[y] + str(ROW[k + '_S']))}", FG, 10,
                bold=tot, fmt=MMT, h='right')
        if tot:
            for c in (a, bb):
                s[f'{c}{rr}'].fill = PatternFill('solid', fgColor=SURF)
                s[f'{c}{rr}'].border = Border(top=Side(style='thin', color=ACC))
        else:
            for c in (a, bb):
                s[f'{c}{rr}'].border = Border(bottom=Side(style='thin', color=LINE))
    s[f'B{rr}'].border = Border(top=Side(style='thin', color=ACC)) if tot else Border(bottom=Side(style='thin', color=LINE))
put(s, 'B67', 'Cifras en millones de pesos de 2026. El detalle completo está en las hojas 4 y 5.', MUTED, 8, italic=True)
s.print_area = 'A1:U68'

# ------------------------------------------------------------------------------------------------
# Escenarios y cambios
e = lienzo('Escenarios y cambios', 'Escenarios y cambios', alto=60, ancho_col='K')
for c, wd in zip('DEFGHIJ', [46, 16, 16, 22, 22, 22, 2]):
    e.column_dimensions[c].width = wd
put(e, 'D2', 'ESCENARIOS Y CAMBIOS', ACC, 16, bold=True)
put(e, 'D3', 'Cada indicador frente a la base (supuestos vigentes al construir la v7, escenario central). Las columnas de '
             'escenario son fotos tomadas al construir.', MUTED, 10)
e.merge_cells('D4:J4')
put(e, 'D4', '=IF(Tablero!$M$3<>"Central","Escenario "&Tablero!$M$3&" activo en el Tablero: la columna Actual muestra ese escenario.",'
             f'IF(SUMPRODUCT(ABS(G8:G{7 + len(ESC)}))=0,"Sin cambios frente a la base. Fotos de escenarios vigentes.",'
             '"Hay cambios frente a la base: las fotos de escenarios quedaron desactualizadas (reconstruir con construir_v7.py)."))',
    ACC, 10, bold=True)
cab = ['Indicador', 'Actual', 'Base (central)', 'Cambio', 'Pesimista', 'Optimista']
for i, t in enumerate(cab):
    put(e, f'{"DEFGHI"[i]}7', t, ONACC, 10, bold=True, h='left' if i == 0 else 'center', fill=ACC)
fmt_cambio = {MM: DM.replace(' vs base', ''), PCT: DPP.replace(' vs base', ''), ANOS: DAN.replace(' vs base', ''),
              '0.00': DX.replace(' vs base', ''), '#,##0': DU.replace(' vs base', '')}
for i, (clave, et, _, fmt, fdel, mejor) in enumerate(ESC):
    rr = 8 + i
    put(e, f'D{rr}', et, FG, 10)
    put(e, f'E{rr}', f'={esc(clave)}', FG, 10, bold=True, fmt=fmt, h='right')
    put(e, f'F{rr}', f'={esc(clave, True)}', MUTED, 10, fmt=fmt, h='right')
    escala, tol = (100, 0.005) if fmt == PCT else (1, 0.5 if fmt == MM else 0.005)
    z = put(e, f'G{rr}', dif(f'E{rr}', f'F{rr}', escala, tol), MUTED, 10, fmt=fmt_cambio[fmt], h='right')
    if mejor is not None:
        arriba, abajo = (OK, CRIT) if mejor else (CRIT, OK)
        e.conditional_formatting.add(z.coordinate, CellIsRule(operator='greaterThan', formula=['0'], font=Font(color=arriba)))
        e.conditional_formatting.add(z.coordinate, CellIsRule(operator='lessThan', formula=['0'], font=Font(color=abajo)))
    for j, nombre in enumerate(['Pesimista', 'Optimista']):
        put(e, f'{"HI"[j]}{rr}', FOTOS.get(nombre, {}).get(clave), FG, 10, fmt=fmt, h='right')
    for c in 'DEFGHI':
        e[f'{c}{rr}'].border = Border(bottom=Side(style='thin', color=LINE))
# la fórmula del aviso usa la columna Cambio (G)
fin = 8 + len(ESC) + 1
e.merge_cells(f'D{fin}:I{fin + 2}')
put(e, f'D{fin}', 'Escenario de demanda: el modelo cambia el embudo comercial (costo por cotización, conversión del primer mes, '
                  'conversión de régimen y meses hasta alcanzarla) según Datos, filas 62 a 75. No cambia precios, costo del '
                  'kit ni tasas. Para fijar una nueva base después de una corrección, reconstruir con construir_v7.py.',
    MUTED, 9, wrap=True, v_al='top', italic=True)
e.print_area = f'A1:K{fin + 3}'

# ------------------------------------------------------------------------------------------------
# Datos!C43 (escenario) pasa a leerse desde el Tablero; botón de regreso en las hojas visibles
dd = w['Datos']
dd['C43'] = f"={q('Tablero datos', SEL['esc'])}"
dd['F43'] = 'Se elige en el Tablero (selector «Escenario de demanda»): 1 pesimista, 2 central, 3 optimista.'
volver = {'Datos': 'B4', 'Controles': 'B4', 'Notas y cambios': 'B4'}
for ws in w.worksheets:
    if ws.sheet_state != 'visible' or ws.title in ('Tablero', 'Escenarios y cambios', 'Resumen'):
        continue
    ref = volver.get(ws.title, 'B3')
    if ws[ref].value is None and type(ws[ref]).__name__ != 'MergedCell':
        z = ws[ref]
        z.value = '=HYPERLINK("#\'Tablero\'!A1","◀ Volver al Tablero")'
        z.font = Font(name=F, size=9, bold=True, color='0A6F9E', underline='single')

# Orden: los dos tableros primero; el Resumen de la v6 queda oculto
w['Resumen'].sheet_state = 'hidden'
primeras = ['Tablero', 'Escenarios y cambios']
visibles = primeras + [ws.title for ws in w.worksheets if ws.sheet_state == 'visible' and ws.title not in primeras]
ocultas = [ws.title for ws in w.worksheets if ws.title not in visibles]
w._sheets = [w[t] for t in visibles + ocultas]
for ws in w.worksheets:
    ws.sheet_view.tabSelected = False
w.active = 0
w['Tablero'].sheet_view.tabSelected = True
w.calculation.fullCalcOnLoad = True
w.save(args.salida)

# Mapa para leer resultados después del recálculo
json.dump({'series': {k: ROW[k] for k in ROW if not k.endswith('_S')}, 'escalares': EROW},
          open(Path(args.salida).with_suffix('.mapa.json'), 'w'))
print('Tablero listo:', args.salida)
