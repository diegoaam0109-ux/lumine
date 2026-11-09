"""Estilos del Plan Financiero de Lumine: fondo blanco, celeste #12AAE9, números en negro y Calibri (instalada en todo PC)."""
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

CELESTE = "12AAE9"
CELESTE8 = "FF12AAE9"
TINTA = "FF000000"
GRIS = "FF5F6368"
GRIS_LINEA = "FFDCDDE1"
GRIS_AZUL = "FF8497B0"   # pestaña de las hojas técnicas ocultas
ROJO = "FFB42318"
FUENTE = "Calibri"

# Rellenos de las celdas de entrada (solo en Supuestos clave y Supuestos detalle; las fórmulas van sin relleno)
F_FUENTE = PatternFill("solid", fgColor="FFE3F4FC")   # dato con fuente
F_PROV = PatternFill("solid", fgColor="FFFFF6CC")     # provisorio o por confirmar
F_SUP = PatternFill("solid", fgColor="FFFDE9D9")      # supuesto del equipo
F_ENC = PatternFill("solid", fgColor=CELESTE8)       # encabezado de tabla
F_GRIS = PatternFill("solid", fgColor="FFF2F3F5")     # tablas solo de comparación (no comparables)
F_BANNER = PatternFill("solid", fgColor="FFFFF6CC")
RELLENO = {"F": F_FUENTE, "P": F_PROV, "S": F_SUP}
TIPO_TXT = {"F": "Con fuente", "P": "Provisorio", "S": "Supuesto"}

FMT_PESOS = '#,##0;-#,##0;"-"'
FMT_ENTERO = '#,##0;-#,##0;"-"'
FMT_DEC1 = '#,##0.0;-#,##0.0;"-"'
FMT_DEC2 = '#,##0.00;-#,##0.00;"-"'
FMT_PCT = '0.0%;-0.0%;"-"'
FMT_PCT2 = '0.00%;-0.00%;"-"'
FMT_PCT3 = '0.000%'
FMT_MILL = '#,##0,,;-#,##0,,;"-"'
FMT_MM1 = '#,##0.0,,;-#,##0.0,,;"-"'      # millones con un decimal (el valor de la celda sigue en pesos)
FMT_MIL1 = '#,##0.0,;-#,##0.0,;"-"'       # miles con un decimal
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

IZQ = Alignment(horizontal="left", vertical="center")
IZQ_W = Alignment(horizontal="left", vertical="center", wrap_text=True)
DER = Alignment(horizontal="right", vertical="center")
CEN = Alignment(horizontal="center", vertical="center")
CEN_W = Alignment(horizontal="center", vertical="center", wrap_text=True)


def fuente(tam=10, negrita=False, color=TINTA, cursiva=False):
    return Font(name=FUENTE, size=tam, bold=negrita, color=color, italic=cursiva)


def col(n):
    return get_column_letter(n)


def titular(ws, titulo, subtitulo, ultima_col=8):
    """Fila 1: título de 16 pt en celeste; fila 2: subtítulo de una línea de 10 pt en gris."""
    c = ws.cell(row=1, column=1, value=titulo)
    c.font = fuente(16, True, CELESTE8)
    c.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 26
    for k in range(1, ultima_col + 1):
        ws.cell(row=1, column=k).border = B_TITULO
    c = ws.cell(row=2, column=1, value=subtitulo)
    c.font = fuente(10, False, GRIS)
    ws.row_dimensions[2].height = 16


def titulo_hoja(ws, texto, guia, ancho_cols=8):
    """Compatibilidad: título y solo la primera línea de la guía como subtítulo."""
    titular(ws, texto, guia[0] if guia else "", ancho_cols)


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


def plegar(ws, fila_titulo, fila_fin):
    """Agrupa y pliega las filas bajo un título de sección (el botón + queda en la fila del título)."""
    for r in range(fila_titulo + 1, fila_fin + 1):
        ws.row_dimensions[r].outlineLevel = 1
        ws.row_dimensions[r].hidden = True
    ws.row_dimensions[fila_titulo].collapsed = True
    sep = ws.row_dimensions[fila_fin + 1]       # fila en blanco entre secciones: angosta, para que los títulos plegados queden juntos
    if sep.height is None:
        sep.height = 6


def hoja_base(ws, zoom=90, visible=True):
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = zoom
    ws.sheet_properties.tabColor = CELESTE8 if visible else GRIS_AZUL
    ws.sheet_properties.outlinePr.summaryBelow = False   # el botón de cada grupo va arriba, en el título de la sección
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_LETTER
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = False
    ws.page_margins.left = ws.page_margins.right = 0.4
    ws.page_margins.top = 0.6
    ws.page_margins.bottom = 0.55
    ws.page_margins.header = 0.25
    ws.page_margins.footer = 0.25
    ws.oddHeader.left.text = "Lumine Motors · Plan Financiero"
    ws.oddHeader.left.size = 9
    ws.oddHeader.left.color = "5F6368"
    ws.oddHeader.left.font = "Calibri,Regular"     # si no, hereda la letra base del libro de la v3 (Aptos Narrow)
    ws.oddFooter.right.text = "Página &P de &N"
    ws.oddFooter.right.size = 9
    ws.oddFooter.right.color = "5F6368"
    ws.oddFooter.right.font = "Calibri,Regular"
    if not visible:
        ws.sheet_state = "hidden"


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
