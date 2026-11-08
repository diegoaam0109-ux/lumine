"""Estilos del Plan Financiero de Lumine: fondo blanco, celeste #12AAE9 y números en negro."""
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

CELESTE = "12AAE9"
CELESTE8 = "FF12AAE9"
TINTA = "FF000000"
GRIS = "FF5F6368"
GRIS_LINEA = "FFDCDDE1"
FUENTE = "Calibri"

# Rellenos de las celdas de entrada (las fórmulas van sin relleno)
F_FUENTE = PatternFill("solid", fgColor="FFE3F4FC")   # dato con fuente
F_PROV = PatternFill("solid", fgColor="FFFFF6CC")     # provisorio o por confirmar
F_SUP = PatternFill("solid", fgColor="FFFDE9D9")      # supuesto del equipo
F_ENC = PatternFill("solid", fgColor=CELESTE8)       # encabezado de tabla
F_GRIS = PatternFill("solid", fgColor="FFF2F3F5")     # tablas solo de comparación (no comparables)
F_BANNER = PatternFill("solid", fgColor="FFFFF6CC")
RELLENO = {"F": F_FUENTE, "P": F_PROV, "S": F_SUP}

FMT_PESOS = '#,##0;-#,##0;"-"'
FMT_ENTERO = '#,##0;-#,##0;"-"'
FMT_DEC1 = '#,##0.0;-#,##0.0;"-"'
FMT_DEC2 = '#,##0.00;-#,##0.00;"-"'
FMT_PCT = '0.0%;-0.0%;"-"'
FMT_PCT2 = '0.00%;-0.00%;"-"'
FMT_PCT3 = '0.000%'
FMT_MILL = '#,##0,,;-#,##0,,;"-"'
FMT_FECHA = 'mmm-yy'
FMT_FECHA_D = 'dd-mm-yyyy'
FMT_MES = '0;-0;0'
FMT_AÑOS = '0.0" años"'

_lin = Side(style="thin", color=GRIS_LINEA)
_cel = Side(style="thin", color=CELESTE8)
_cel_g = Side(style="medium", color=CELESTE8)
B_FILA = Border(bottom=_lin)
B_TOTAL = Border(top=_cel, bottom=_cel)
B_TITULO = Border(bottom=_cel_g)
B_ENC = Border(bottom=_cel)
B_CAJA = Border(left=_cel, right=_cel, top=_cel, bottom=_cel)
B_TARJETA_SUP = Border(top=Side(style="thick", color=CELESTE8))


def fuente(tam=10, negrita=False, color=TINTA, cursiva=False):
    return Font(name=FUENTE, size=tam, bold=negrita, color=color, italic=cursiva)


def col(n):
    return get_column_letter(n)


def titulo_hoja(ws, texto, guia, ancho_cols=8):
    """Fila 1: título; filas 2 a 4: guía de lectura (qué calcula, de dónde toma, a qué hoja entrega)."""
    ws["A1"] = texto
    ws["A1"].font = fuente(15, True, CELESTE8)
    ws.row_dimensions[1].height = 24
    for i, linea in enumerate(guia[:3]):
        c = ws.cell(row=2 + i, column=1, value=linea)
        c.font = fuente(9, False, GRIS, True)
    for c in range(1, ancho_cols + 1):
        ws.cell(row=1, column=c).border = B_TITULO


def bloque(ws, fila, texto, hasta_col=8):
    c = ws.cell(row=fila, column=1, value=texto)
    c.font = fuente(11, True, CELESTE8)
    for k in range(1, hasta_col + 1):
        ws.cell(row=fila, column=k).border = B_ENC
    ws.row_dimensions[fila].height = 18


def encabezado(ws, fila, valores, col_ini=1, alto=None):
    for k, v in enumerate(valores):
        c = ws.cell(row=fila, column=col_ini + k, value=v)
        c.fill = F_ENC
        c.font = fuente(9, True, "FFFFFFFF")
        c.alignment = Alignment(horizontal="center" if k else "left", vertical="center", wrap_text=True)
    if alto:
        ws.row_dimensions[fila].height = alto


def hoja_base(ws, zoom=90):
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = zoom
    ws.sheet_properties.tabColor = CELESTE8
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_LETTER
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = False
    ws.page_margins.left = ws.page_margins.right = 0.4
    ws.page_margins.top = ws.page_margins.bottom = 0.5


def celda(ws, ref, valor, fmt=None, negrita=False, tam=10, color=TINTA, relleno=None, alin=None, borde=None, cursiva=False):
    c = ws[ref]
    c.value = valor
    c.font = fuente(tam, negrita, color, cursiva)
    if fmt:
        c.number_format = fmt
    if relleno is not None:
        c.fill = relleno
    if alin:
        c.alignment = alin
    if borde is not None:
        c.border = borde
    return c


IZQ = Alignment(horizontal="left", vertical="center")
IZQ_W = Alignment(horizontal="left", vertical="center", wrap_text=True)
DER = Alignment(horizontal="right", vertical="center")
CEN = Alignment(horizontal="center", vertical="center")
CEN_W = Alignment(horizontal="center", vertical="center", wrap_text=True)
