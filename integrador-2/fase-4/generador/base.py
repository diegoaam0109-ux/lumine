"""Base del generador: nombres y orden de las hojas, libro, registro de controles y utilidades comunes."""
import re

from openpyxl import Workbook
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.drawing.line import LineProperties
from openpyxl.formatting.rule import FormulaRule
from openpyxl.workbook.defined_name import DefinedName

from estilo import ROJO, celda, col, fuente, DER

# ---- hojas visibles (en este orden) y hojas técnicas ocultas
H_IDX, H_DASH, H_SUPC = "Índice", "Dashboard", "Supuestos clave"
H1, H2, H3 = "1. Inversión", "2. Ingresos y Costos", "3. Capital de Trabajo"
H4, H5, H6, H7 = "4. Flujo Puro", "5. Flujo Apalancado", "6. Tasa de Descuento", "7. Punto de Equilibrio"
H_SENS, H_M02 = "Sensibilidades", "Mensual (años 0 a 2)"
H_SUP, H_F3, H_MEN, H_ANU = "Supuestos detalle", "Datos Fase 3", "Motor mensual (cálculo)", "Anual (cálculo)"
H_CTRL, H_PEN, H_REG = "Controles", "Pendientes", "Registro de cambios"
VISIBLES = [H_IDX, H_DASH, H_SUPC, H1, H2, H3, H4, H5, H6, H7, H_SENS, H_M02]
OCULTAS = [H_SUP, H_F3, H_MEN, H_ANU, H_CTRL, H_PEN, H_REG]
ORDEN = VISIBLES + OCULTAS
UNIDAD = "CLP netos de IVA, pesos constantes de noviembre de 2026"

# ---- motor mensual: 72 columnas, D = posición 1 (mes −12)
N = 72
C0 = 4


def mc(i):
    return col(C0 + i - 1)


def q(h):
    return "'" + h + "'"


class Libro:
    def __init__(self):
        self.wb = Workbook()
        self.wb.remove(self.wb.active)
        self.ws = {h: self.wb.create_sheet(h) for h in ORDEN}
        self.nombres = {}
        self.controles = []   # (descripción, hoja de origen, fórmula que debe dar 0): se calculan en la hoja Controles
        self.enteros = []     # (descripción, hoja, rango) que deben ser enteros
        self.salidas = {}

    def nombre(self, nom, hoja, ref):
        assert nom not in self.nombres, nom
        self.nombres[nom] = f"{q(hoja)}!{ref}"

    def control(self, desc, hoja, formula):
        self.controles.append((desc, hoja, formula))

    def entero(self, desc, hoja, rango):
        self.enteros.append((desc, hoja, rango))

    def guardar(self, ruta):
        for nom, ref in self.nombres.items():
            self.wb.defined_names[nom] = DefinedName(nom, attr_text=ref)
        self.wb.calculation.fullCalcOnLoad = True
        self.wb.active = 0
        for ws in self.wb.worksheets:
            ws.sheet_view.tabSelected = ws.title == H_IDX
            for s in ws.sheet_view.selection:
                s.activeCell = "A1"
                s.sqref = "A1"
        self.wb.save(ruta)


def A(L, k, y):
    """Celda de la hoja Anual (cálculo) para la fila k y el año y (C = año 0)."""
    return f"{q(H_ANU)}!{col(3 + y)}{L.filas_anu[k]}"


def rot_anio(y):
    """Rótulo de año siempre igual: «Año 0 (2027)»."""
    return f'="Año {y} ("&(Anio0+{y})&")"'


def indicador(ws, ref, hoja=None):
    """Indicador pequeño de controles en la esquina de cada hoja (el detalle está en la hoja Controles)."""
    cond = f'SUMIF(Ctrl_Hoja,"{hoja}",Ctrl_Valor)=0' if hoja else "Ctrl_Total=0"
    c = celda(ws, ref, f'=IF({cond},"Controles OK","Revisar controles")', tam=9, color="FF5F6368", alin=DER)
    ws.conditional_formatting.add(ref, FormulaRule(formula=[f'{ref.replace(ref.rstrip("0123456789"), "$" + ref.rstrip("0123456789") + "$")}<>"Controles OK"'],
                                                   font=fuente(9, True, ROJO)))
    return c


def _txt(tam=900, negrita=False, color="1D1D1F"):
    from openpyxl.chart.text import RichText
    from openpyxl.drawing.text import CharacterProperties, Font as DFont, Paragraph, ParagraphProperties
    cp = CharacterProperties(sz=tam, b=negrita, solidFill=color, latin=DFont(typeface="Calibri"))
    return RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), endParaRPr=cp)])


def estilo_grafico(g, titulo, borde=False, tam=900):
    """Título de 11 pt, ejes y leyenda de 9 pt (o tam) en Calibri; sin borde ni esquinas redondeadas."""
    from openpyxl.chart.text import RichText, Text
    from openpyxl.chart.title import Title
    from openpyxl.drawing.text import CharacterProperties, Font as DFont, Paragraph, ParagraphProperties, RegularTextRun
    cp = CharacterProperties(sz=max(1100, tam + 100), b=True, solidFill="1D1D1F", latin=DFont(typeface="Calibri"))
    g.title = Title(tx=Text(rich=RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), r=[RegularTextRun(rPr=cp, t=titulo)])])),
                    overlay=False)
    g.x_axis.txPr = _txt(tam)
    g.y_axis.txPr = _txt(tam, color="5F6368")
    g.x_axis.tickLblPos = "low"          # etiquetas de categoría abajo (no se montan sobre barras negativas)
    g.roundedCorners = False
    g.graphical_properties = GraphicalProperties(ln=LineProperties(solidFill="DCDDE1") if borde else LineProperties(noFill=True))
    for s_ in g.series:
        if hasattr(s_, "invertIfNegative"):
            s_.invertIfNegative = False  # Excel pinta en blanco las barras negativas si falta
    if g.legend is not None:
        g.legend.txPr = _txt(tam)


def absref(ref):
    m = re.match(r"([A-Z]+)(\d+)$", ref)
    return f"${m.group(1)}${m.group(2)}"
