"""Construye las hojas azules del Plan Financiero v4 de Lumine Motors (openpyxl, fórmulas vivas).

Uso: python construir.py SALIDA.xlsx [foto.json] [--caso CÓDIGO] [--escenario NOMBRE]
Las hojas grises del semestre anterior NO se generan aquí: injertar.py las conserva tal cual desde la v3.
"""
import json
import re
import sys
from datetime import date

from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.drawing.line import LineProperties
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, PatternFill
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

from estilo import (CELESTE8, B_CAJA, B_ENC, B_FILA, B_TARJETA_SUP, B_TITULO, B_TOTAL, CELESTE, CEN, CEN_W, DER, F_BANNER,
                    F_ENC, F_GRIS, FMT_AÑOS, FMT_DEC1, FMT_DEC2, FMT_ENTERO, FMT_FECHA, FMT_FECHA_D, FMT_MES, FMT_MILL,
                    FMT_PCT, FMT_PCT2, FMT_PCT3, FMT_PESOS, GRIS, IZQ, IZQ_W, RELLENO, TINTA, bloque, celda, col,
                    encabezado, fuente, hoja_base, titulo_hoja)

H_DASH, H_SUP, H_F3 = "Dashboard", "Supuestos", "Datos Fase 3"
H_MEN, H_ANU = "Mensual (años 0 a 5)", "Anual (años 0 a 5)"
H1, H2, H3 = "1. Inversión", "2. Ingresos y Costos", "3. Capital de Trabajo"
H4, H5, H6, H7 = "4. Flujo Puro", "5. Flujo Apalancado", "6. Tasa de Descuento", "7. Punto de Equilibrio"
H_ANX, H_PEN, H_REG = "Anexos", "Pendientes", "Registro de cambios"
ORDEN = [H_DASH, H_SUP, H_F3, H_MEN, H_ANU, H1, H2, H3, H4, H5, H6, H7, H_ANX, H_PEN, H_REG]
UNIDAD = "CLP netos de IVA, pesos constantes de noviembre de 2026"


def q(h):
    return "'" + h + "'"


class Libro:
    def __init__(self):
        self.wb = Workbook()
        self.wb.remove(self.wb.active)
        self.ws = {h: self.wb.create_sheet(h) for h in ORDEN}
        self.nombres = {}
        self.controles = []   # (descripción, hoja, rango) que deben dar 0
        self.enteros = []     # (descripción, hoja, rango) que deben ser enteros
        self.salidas = {}     # nombre -> (hoja, celda) de resultados clave

    def nombre(self, nom, hoja, ref):
        assert nom not in self.nombres, nom
        self.nombres[nom] = f"{q(hoja)}!{ref}"

    def control(self, desc, hoja, rango):
        self.controles.append((desc, hoja, rango))

    def entero(self, desc, hoja, rango):
        self.enteros.append((desc, hoja, rango))

    def guardar(self, ruta):
        for nom, ref in self.nombres.items():
            self.wb.defined_names[nom] = DefinedName(nom, attr_text=ref)
        self.wb.calculation.fullCalcOnLoad = True
        self.wb.save(ruta)


def _txt(tam=900, negrita=False, color="1D1D1F"):
    from openpyxl.chart.text import RichText
    from openpyxl.drawing.text import CharacterProperties, Font as DFont, Paragraph, ParagraphProperties
    cp = CharacterProperties(sz=tam, b=negrita, solidFill=color, latin=DFont(typeface="Calibri"))
    return RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), endParaRPr=cp)])


def estilo_grafico(g, titulo):
    """Título de 11 pt, ejes y etiquetas de 9 pt en Calibri, sin bordes pesados."""
    from openpyxl.chart.text import RichText, Text
    from openpyxl.chart.title import Title
    from openpyxl.drawing.text import CharacterProperties, Font as DFont, Paragraph, ParagraphProperties, RegularTextRun
    cp = CharacterProperties(sz=1100, b=True, solidFill="1D1D1F", latin=DFont(typeface="Calibri"))
    g.title = Title(tx=Text(rich=RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), r=[RegularTextRun(rPr=cp, t=titulo)])])),
                    overlay=False)
    g.x_axis.txPr = _txt(900)
    g.y_axis.txPr = _txt(900, color="5F6368")
    g.x_axis.tickLblPos = "low"          # etiquetas de categoría abajo (no se montan sobre barras negativas)
    g.roundedCorners = False             # bordes rectos (marca Lumine)
    g.graphical_properties = GraphicalProperties(ln=LineProperties(solidFill="DCDDE1"))
    for s_ in g.series:
        if hasattr(s_, "invertIfNegative"):
            s_.invertIfNegative = False  # Excel pinta en blanco las barras negativas si falta
    if g.legend is not None:
        g.legend.txPr = _txt(900)
    if getattr(g, "dataLabels", None) is not None:
        g.dataLabels.txPr = _txt(800, color="1D1D1F")


def absref(ref):
    m = re.match(r"([A-Z]+)(\d+)$", ref)
    return f"${m.group(1)}${m.group(2)}"


# =====================================================================================================
# SUPUESTOS
# =====================================================================================================
class Supuestos:
    """Hoja única de entradas. Columnas: A parámetro, B valor, C unidad, D valor usado, E–G alternativas, H fuente."""

    def __init__(self, L):
        self.L = L
        self.ws = L.ws[H_SUP]
        self.r = 8
        self.casos = []        # dict(nombre, codigo, parametro, base, valor, grupo)
        self.indice = []       # (texto, fila) para el índice de bloques

    def _fila(self):
        r = self.r
        self.r += 1
        return r

    def bloque(self, texto):
        self.r += 1
        r = self._fila()
        bloque(self.ws, r, texto)
        self.indice.append((texto, r))

    def enc(self, alternativas=True):
        r = self._fila()
        enc = ["Parámetro", "Valor", "Unidad", "Valor usado"]
        enc += ["Alternativa A", "Alternativa B", "Alternativa C"] if alternativas else ["", "", ""]
        enc += ["Fuente y fecha"]
        encabezado(self.ws, r, enc)

    def enc_anios(self, primera="Concepto", desde=0):
        r = self._fila()
        enc = [primera] + [f"Año {y} ({2027 + y})" if y >= desde else "" for y in range(6)] + ["Fuente y fecha"]
        encabezado(self.ws, r, enc)

    def nota(self, texto, tipo="P"):
        r = self._fila()
        c = self.ws.cell(row=r, column=1, value=texto)
        c.font = fuente(9, False, TINTA, True)
        c.fill = RELLENO[tipo]
        c.alignment = IZQ_W
        self.ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=8)
        self.ws.row_dimensions[r].height = 15

    def p(self, nom, etiqueta, valor, unidad, tipo, fuente_txt, fmt=FMT_PESOS, alts=None, extra=None, caso_grupo="sens"):
        """Parámetro escalar. alts = [(letra, valor_o_fórmula, nombre_del_caso)]; extra = {código: letra}."""
        ws, r = self.ws, self._fila()
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        es_formula = isinstance(valor, str) and valor.startswith("=")
        celda(ws, f"B{r}", valor, fmt, relleno=None if es_formula else RELLENO[tipo], borde=B_FILA)
        celda(ws, f"C{r}", unidad, color=GRIS, tam=9, borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        for k in "DEFG":
            ws[f"{k}{r}"].border = B_FILA
        if alts:
            self.L.nombre(nom + "_base", H_SUP, f"$B${r}")
            ramas = []
            for letra, v, nombre_caso in alts:
                colL = {"A": "E", "B": "F", "C": "G"}[letra]
                es_f = isinstance(v, str) and v.startswith("=")
                celda(ws, f"{colL}{r}", v, fmt, relleno=None if es_f else RELLENO["S"], borde=B_FILA)
                codigos = [f"{nom}_{letra}"] + [c for c, l in (extra or {}).items() if l == letra]
                cond = " , ".join(f'SensCod="{c}"' for c in codigos).replace(" , ", ",")
                ramas.append((f"OR({cond})" if len(codigos) > 1 else cond, f"{colL}{r}"))
                if nombre_caso:
                    self.casos.append(dict(nombre=nombre_caso, codigo=f"{nom}_{letra}", parametro=etiqueta,
                                           base=f"{q(H_SUP)}!$B${r}", valor=f"{q(H_SUP)}!${colL}${r}", fmt=fmt,
                                           grupo=caso_grupo))
            f = f"B{r}"
            for cond, ref in reversed(ramas):
                f = f"IF({cond},{ref},{f})"
            celda(ws, f"D{r}", "=" + f, fmt, negrita=True, borde=B_FILA)
            self.L.nombre(nom, H_SUP, f"$D${r}")
        else:
            self.L.nombre(nom, H_SUP, f"$B${r}")
        return r

    def f(self, nom, etiqueta, formula, unidad, fuente_txt, fmt=FMT_PESOS):
        ws, r = self.ws, self._fila()
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"B{r}", formula, fmt, borde=B_FILA)
        celda(ws, f"C{r}", unidad, color=GRIS, tam=9, borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        for k in "DEFG":
            ws[f"{k}{r}"].border = B_FILA
        if nom:
            self.L.nombre(nom, H_SUP, f"$B${r}")
        return r

    def y(self, nom, etiqueta, valores, tipo, fuente_txt, fmt=FMT_PESOS, desde=0):
        """Fila por año: valores[0..5] en B..G (desde=1 deja el año 0 vacío). El nombre apunta a los años usados."""
        ws, r = self.ws, self._fila()
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        for k, v in enumerate(valores):
            c = col(2 + k)
            if k < desde:
                ws[f"{c}{r}"].border = B_FILA
                continue
            es_f = isinstance(v, str) and str(v).startswith("=")
            celda(ws, f"{c}{r}", v, fmt, relleno=None if es_f else RELLENO[tipo], borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        if nom:
            self.L.nombre(nom, H_SUP, f"${col(2 + desde)}${r}:$G${r}")
        return r


def hoja_supuestos(L, caso_activo):
    S = Supuestos(L)
    ws = S.ws
    hoja_base(ws, 90)
    titulo_hoja(ws, "SUPUESTOS · Plan Financiero de Lumine Motors (Fase 4) · " + UNIDAD, [
        "Qué calcula: es la única página de entradas del modelo, por bloques (A a N); cada dato tiene su fuente y fecha en la columna H.",
        "De dónde toma: informe de la Fase 3, cotizaciones, leyes y fuentes públicas citadas; las alternativas A–C alimentan las sensibilidades de Anexos.",
        "A qué hoja entrega: a todas, por nombres definidos (la columna «Valor usado» es la que lee el modelo). La inflación no se aplica a precios ni costos.",
    ])
    for c, w in zip("ABCDEFGH", [60, 14, 15, 14, 13, 13, 13, 66]):
        ws.column_dimensions[c].width = w
    # leyenda
    r = 5
    celda(ws, f"A{r}", "Leyenda de las celdas de entrada:", tam=9, color=GRIS)
    for k, (t, txt) in enumerate([("F", "Dato con fuente"), ("P", "Provisorio o por confirmar"), ("S", "Supuesto del equipo")]):
        c = ws.cell(row=r, column=2 + k * 2, value=txt)
        c.fill = RELLENO[t]
        c.font = fuente(9)
        ws.merge_cells(start_row=r, start_column=2 + k * 2, end_row=r, end_column=3 + k * 2)
    c = ws.cell(row=r, column=8, value="Sin relleno = fórmula. Negrita en la columna D = valor que usa el modelo (cambia con la sensibilidad activa).")
    c.font = fuente(9, False, GRIS, True)
    r = 6
    celda(ws, f"A{r}", "Escenario activo (se elige en el Dashboard) y sensibilidad activa (se elige en Anexos):", tam=9, color=GRIS)
    celda(ws, f"B{r}", f"={q(H_DASH)}!$C$5", negrita=True, alin=CEN)
    celda(ws, f"D{r}", "=SensActiva", negrita=True)
    ws.merge_cells(f"D{r}:G{r}")
    S.r = 8

    # ---- Tabla de precios y cobros (enlaza a los bloques de abajo)
    bloque(ws, S.r, "PRECIOS Y COBROS DE LUMINE (enlace a los bloques E, H e I)")
    S.r += 1
    encabezado(ws, S.r, ["Concepto", "Neto de IVA", "Con IVA", "Unidad", "", "", "", "Nota"])
    S.r += 1
    precios = [
        ("Precio Esencial instalado (escenario activo)", "=PrecioE", "=PrecioE*(1+TasaIVA)", "$ por vehículo", "Bloque E"),
        ("Precio Plus instalado (escenario activo)", "=PrecioP", "=PrecioP*(1+TasaIVA)", "$ por vehículo", "Bloque E"),
        ("Paquete de entrada a la red (una vez)", "=RedPaquete", "=RedPaquete*(1+TasaIVA)", "$ por taller", "Bloque H: derecho + formación de 2 técnicos"),
        ("Cuota base mensual de la red", "=RedCuota", "=RedCuota*(1+TasaIVA)", "$ por taller al mes", "Bloque H"),
        ("Lumine Habilita por técnico", "=RedHab", "=RedHab*(1+TasaIVA)", "$ por técnico al mes", "Bloque H, canasta H1"),
        ("Suscripción «Lumine Habilita Red» por taller al mes (2 técnicos)", "=RedCuota+RedHab*RedTec", "=(RedCuota+RedHab*RedTec)*(1+TasaIVA)", "$ por taller al mes", "Cuota base + Habilita × técnicos"),
        ("Suscripción por taller al año", "=(RedCuota+RedHab*RedTec)*12", "=(RedCuota+RedHab*RedTec)*12*(1+TasaIVA)", "$ por taller al año", ""),
        ("Descuento al primer cliente de un modelo nuevo", "=DescPrimer", None, "% del precio", "Bloque E"),
        ("Bono financiamiento (solo ventas con crédito)", "=Bono", None, "% del precio", "Bloque I"),
        ("Tasa del crédito directo al cliente (nominal, contrato)", "=TasaCredNom", None, "% mensual", "Bloque I"),
        ("Tasa del crédito que usa el modelo (real, Fisher)", "=TasaCredReal", None, "% mensual", "Bloque I: el modelo está en pesos constantes"),
    ]
    for et, neto, iva, uni, nota in precios:
        r = S.r
        celda(ws, f"A{r}", et, borde=B_FILA)
        es_pct = "%" in uni
        celda(ws, f"B{r}", neto, FMT_PCT2 if es_pct else FMT_PESOS, borde=B_FILA)
        if iva:
            celda(ws, f"C{r}", iva, FMT_PESOS, borde=B_FILA)
        else:
            ws[f"C{r}"].border = B_FILA
        celda(ws, f"D{r}", uni, color=GRIS, tam=9, borde=B_FILA)
        for k in "EFG":
            ws[f"{k}{r}"].border = B_FILA
        celda(ws, f"H{r}", nota, color=GRIS, tam=9, borde=B_FILA)
        S.r += 1
    # índice de bloques (se completa al final)
    fila_indice = S.r + 1
    S.r = fila_indice + 2

    # ---- A. Calendario
    S.bloque("BLOQUE A. CALENDARIO")
    S.enc()
    S.p("Anio0", "Año calendario del año 0 (meses −12 a −1); el año 1 parte en enero (no existe mes 0)", 2027, "año", "S", "Decisión del equipo (traspaso §4)", "0")
    S.p("MesTramIni", "Trámite del Proyecto Experimental: primer mes (sin nómina: lo hacen los socios)", -12, "mes", "F", "D.S. 67/2020; la resolución tarda 30 días hábiles", FMT_MES)
    S.p("MesTramFin", "Trámite del Proyecto Experimental: último mes", -10, "mes", "F", "D.S. 67/2020", FMT_MES)
    S.p("MesPEIni", "Proyecto Experimental: primer mes (6 meses)", -9, "mes", "F", "D.S. 67/2020", FMT_MES)
    S.p("MesPEFin", "Proyecto Experimental: último mes", -4, "mes", "F", "D.S. 67/2020", FMT_MES)
    S.p("MesPreIni", "Preapertura: primer mes", -3, "mes", "S", "Decisión del equipo", FMT_MES)
    S.p("Atraso", "Atraso del reglamento propio (el caso base supone que está vigente al abrir)", 0, "meses", "P",
        "PROVISORIO: Ley 21.793 sin reglamento; su atraso va como escenario", FMT_MES,
        alts=[("A", 12, "Reglamento con 12 meses de atraso")])

    # ---- B. Mercado
    S.bloque("BLOQUE B. MERCADO (la inflación solo deflacta y convierte tasas; no se aplica a precios ni costos)")
    S.enc()
    S.p("DolarVar", "Variación del dólar para la sensibilidad", 0.10, "%", "S", "Supuesto del equipo (Anexos)", FMT_PCT)
    S.p("Dolar", "Dólar observado base", 981.58, "$/US$", "F", "SII, promedio de octubre de 2026 (último dato: 994,29 al 27-10-2026)", FMT_DEC2,
        alts=[("A", "=B{r}*(1+DolarVar)", "Dólar +10%"), ("B", "=B{r}*(1-DolarVar)", "Dólar −10%")])
    S.p("FwdDif", "Forward: diferencial de tasas a 2 años", 0.0035, "%", "F", "Diario Financiero, 2026", FMT_PCT2)
    S.p("FwdPlazo", "Forward: plazo de cobertura (pago al proveedor)", 2, "meses", "S", "Bloque I", "0")
    S.p("EUR_CLP", "Euro", 1098.15, "$/€", "F", "Libro de costos Fase 4 (07-11-2026)", FMT_DEC2)
    S.p("AUD_CLP", "Dólar australiano", 679.49, "$/AUD", "F", "13-10-2026", FMT_DEC2)
    S.p("BRL_CLP", "Real brasileño", 195.89, "$/R$", "F", "11-10-2026", FMT_DEC2)
    S.p("UF_CLP", "Unidad de Fomento", 41295.46, "$/UF", "F", "9-11-2026", FMT_DEC2)
    S.p("InflLP", "Inflación de largo plazo (meta del Banco Central)", 0.03, "% anual", "F", "Banco Central de Chile", FMT_PCT)
    S.enc_anios()
    S.y("Infl", "Inflación anual (solo deflactar depreciación, deuda y para Fisher)", [0.028, 0.03, "=InflLP", "=InflLP", "=InflLP", "=InflLP"], "F",
        "IPoM septiembre de 2026 (2027 y 2028); meta del Banco Central desde 2029", FMT_PCT)

    # ---- C. Impuesto
    S.bloque("BLOQUE C. IMPUESTO DE PRIMERA CATEGORÍA (por año calendario; arrastre de pérdidas activo)")
    S.enc_anios()
    S.y("Tax", "Tasa de impuesto", [0.125, 0.15, 0.23, 0.23, 0.23, 0.23], "F",
        "Pro Pyme 12,5% (2027) y 15% (2028); 23% desde 2029 (Ley 21.850, 17-10-2026), igual en ambos regímenes", FMT_PCT)
    r = S.y(None, "Control: ingresos del año en UF", [0] + [f"=INDEX(H2_Ing,{t})/UF_CLP" for t in range(1, 6)], "F", "Fórmula (hoja 2)", FMT_ENTERO)
    for k in range(6):
        ws.cell(row=r, column=2 + k).fill = PatternFill(None)
    r2 = S.y(None, "Aviso de salida de Pro Pyme (un año > 85.000 UF o promedio > 75.000 UF)",
             ["-"] + [f'=IF(OR({col(2 + t)}{r}>LimPPAnual,AVERAGE($C{r}:{col(2 + t)}{r})>LimPPProm),"SALE","OK")' for t in range(1, 6)], "F",
             "Fórmula. La tasa es 23% en ambos regímenes desde 2029", None)
    for k in range(6):
        ws.cell(row=r2, column=2 + k).fill = PatternFill(None)
        ws.cell(row=r2, column=2 + k).alignment = CEN
    S.enc()
    S.p("LimPPAnual", "Límite anual de ingresos Pro Pyme", 85000, "UF", "F", "LIR art. 14 D", FMT_ENTERO)
    S.p("LimPPProm", "Límite de ingresos promedio Pro Pyme", 75000, "UF", "F", "LIR art. 14 D", FMT_ENTERO)
    S.nota("Depreciación instantánea Pro Pyme y crédito por remuneraciones de la Ley 21.850: POR EVALUAR (no incluidos).", "P")

    # ---- D. Tasas
    S.bloque("BLOQUE D. TASAS · PROVISORIO, SE DECIDE DESPUÉS (solo Damodaran EE.UU.)")
    S.enc()
    S.p("Rf", "Rf: BCU/BTU a 10 años (real)", 0.0269, "% anual", "P", "Banco Central, 19-10-2026", FMT_PCT2)
    S.p("SpreadCL", "Spread de default de Chile", 0.0072, "% anual", "P", "Damodaran, enero de 2026", FMT_PCT2)
    S.f("RfL", "Rf limpia = Rf − spread", "=Rf-SpreadCL", "% anual", "Fórmula", FMT_PCT2)
    S.p("PRM", "Prima por riesgo de mercado para Chile", 0.0533, "% anual", "P", "Damodaran, enero de 2026", FMT_PCT2)
    S.p("BetaU", "βU Auto Parts EE.UU.", 1.02, "", "P", "Damodaran, enero de 2026 (alternativa 1,13 corregido por caja)", FMT_DEC2,
        alts=[("A", 1.13, "βU 1,13 (corregido por caja)")])
    S.p("TaxLP", "Tasa de impuesto de largo plazo", 0.23, "%", "F", "Ley 21.850", FMT_PCT)
    S.p("PctE", "Estructura objetivo: patrimonio", 0.60, "%", "P", "Supuesto del equipo", FMT_PCT)
    S.f("PctD", "Estructura objetivo: deuda", "=1-PctE", "%", "Fórmula", FMT_PCT)
    S.p("KdNom", "Kd nominal (crédito bancario)", 0.084, "% anual", "P", "Banco Central, septiembre de 2026", FMT_PCT2)
    S.f("KdReal", "Kd real = (1 + Kd nominal) / (1 + inflación de largo plazo) − 1", "=(1+KdNom)/(1+InflLP)-1", "% anual", "Fórmula (Fisher)", FMT_PCT2)
    S.p("CredAnios", "Plazo del crédito bancario (sistema francés, cuotas anuales)", 5, "años", "P", "Supuesto del equipo", "0")
    S.p("PrimasAd", "Primas cambiaria y de iliquidez", 0, "%", "P", "Sin primas (decisión provisoria)", FMT_PCT2)

    # ---- E. Comercial
    S.bloque("BLOQUE E. COMERCIAL (TALLER PROPIO)")
    S.enc()
    S.p("PE_IVA", "Precio de referencia Esencial con IVA", 4290000, "$", "P", "Fase 3. Ligeramente sujeto a la investigación (33 respuestas)")
    S.p("PP_IVA", "Precio de referencia Plus con IVA", 4990000, "$", "P", "Fase 3. Ligeramente sujeto a la investigación (33 respuestas)")
    S.p("TasaIVA", "IVA", 0.19, "%", "F", "D.L. 825", FMT_PCT)
    S.f("PrecioE", "Precio neto Esencial usado (× factor de precio del escenario)", "=PE_IVA/(1+TasaIVA)*FactPre", "$", "Fórmula")
    S.f("PrecioP", "Precio neto Plus usado (× factor de precio del escenario)", "=PP_IVA/(1+TasaIVA)*FactPre", "$", "Fórmula")
    S.p("Mix", "Mezcla de ventas: Plus", 0.60, "% de las instalaciones", "S", "Supuesto del equipo (Fase 3)", FMT_PCT,
        alts=[("A", 0.40, "Mezcla Plus 40%"), ("B", 0.80, "Mezcla Plus 80%")])
    S.p("DescPrimer", "Descuento al primer cliente de un modelo no homologado", 0.10, "% del precio", "S", "Supuesto del equipo", FMT_PCT)
    S.p("ModNuevos1", "Modelos nuevos en el año comercial 1", 18, "modelos", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("ModNuevos2", "Modelos nuevos por año desde el año comercial 2", 12, "modelos", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("SolMin", "Regla de entrada de un modelo: solicitudes mínimas", 10, "solicitudes", "S", "Supuesto del equipo (informativo)", FMT_ENTERO)
    S.p("ComInst", "Comisión por instalación cobrada (más cargas)", 15000, "$", "S", "Supuesto del equipo")
    S.p("ComTope", "Tope de comisión por persona", 1000000, "$ al mes", "S", "Supuesto del equipo")
    S.p("Sello", "Sello por vehículo", 5000, "$", "F", "Fase 3, Tabla 11")
    S.p("RefPct", "Referidos: % de las instalaciones", 0.15, "%", "F", "Fase 3, Tabla 11", FMT_PCT)
    S.p("RefMonto", "Referidos: premio por referido", 50000, "$", "F", "Fase 3, Tabla 11")
    S.p("GarPct", "Garantía: % del costo del kit", 0.03, "%", "S", "Supuesto del equipo", FMT_PCT)

    # ---- F. Demanda
    S.bloque("BLOQUE F. DEMANDA PROPIA (MODELO DE BASS, MENSUAL)")
    S.enc()
    S.p("mRM", "Segmento laboral de la Región Metropolitana (techo al 100%)", 162891, "vehículos", "F",
        "Deducido de la Fase 3: 615 / F(1) con los coeficientes de EE.UU.", FMT_ENTERO)
    S.p("Techo", "% del techo (caso base OPTIMISTA)", 1.0, "%", "P", "PROVISORIO: validar con las 33 respuestas de la encuesta", FMT_PCT,
        alts=[("A", 0.5, "Techo de la demanda 50%")])
    S.f("mBass", "Techo m usado = segmento × % del techo × factor de demanda del escenario", "=mRM*Techo*FactDem", "vehículos", "Fórmula", FMT_ENTERO)
    S.p("pBass", "p (innovación)", 0.0026, "", "F", "Massiani y Gohs (2015), híbridos en EE.UU.; p es inestable en series cortas", "0.0000")
    S.p("qBass", "q (imitación); rango 0,47 a 0,60", 0.52, "", "F",
        "Ajuste propio de Bass a híbridos en Chile (ANAC 2018–2025); Gohs (2022): q robusto al potencial", FMT_DEC2,
        alts=[("A", 0.47, "q = 0,47"), ("B", 0.60, "q = 0,60")])
    S.p("CobAnio1", "Cobertura de la biblioteca: año comercial 1", 0.60, "%", "S", "Supuesto del equipo", FMT_PCT)
    S.p("CobAnio2", "Cobertura de la biblioteca: desde el año comercial 2", 0.80, "%", "S", "Supuesto del equipo", FMT_PCT)
    S.f("CtrlF1", "Control: F(1) con p y q usados", "=(1-EXP(-(pBass+qBass)))/(1+(qBass/pBass)*EXP(-(pBass+qBass)))", "",
        "F(t) = (1 − e^(−(p+q)t)) / (1 + (q/p)·e^(−(p+q)t))", FMT_PCT3)

    # ---- G. Capacidad
    S.bloque("BLOQUE G. CAPACIDAD Y DÚOS")
    S.enc()
    S.p("CapDuoA", "Capacidad por dúo, meses 1 a 4", 15.75, "vehículos/mes", "F", "Fase 3, Tabla 10", FMT_DEC2)
    S.p("CapMesCambio", "Último mes con la capacidad anterior (abril de 2028)", 4, "mes", "F", "Jornada de 40 horas desde mayo de 2028", "0")
    S.p("CapDuoB", "Capacidad por dúo desde el mes 5", 15, "vehículos/mes", "F", "Fase 3, Tabla 10", FMT_DEC2)
    S.p("Util", "Regla del 80%: utilización máxima con que se planifican los dúos", 0.80, "%", "F",
        "Fase 3 (exige 25% de holgura sobre la demanda; ver sobredotación en Anexos)", FMT_PCT,
        alts=[("A", 0.90, "Regla de dúos al 90%"), ("B", 1.00, "Regla de dúos al 100% (sin holgura)")])
    S.p("MaxDuos", "Máximo de dúos por taller", 6, "dúos", "F", "Fase 3", "0")
    S.p("TecDuo", "Técnicos por dúo", 2, "personas", "F", "Fase 3", "0")
    S.p("AntTec", "Anticipo de ingreso de los técnicos de un dúo nuevo (formación intensiva)", 2, "meses", "S", "Supuesto del equipo", "0")
    S.p("AntRT", "Anticipo del Responsable Técnico de un taller nuevo", 3, "meses", "S", "Supuesto del equipo", "0")
    S.p("AntEq", "Anticipo de la compra del equipamiento de un taller nuevo", 3, "meses", "S", "Supuesto del equipo", "0")
    S.p("AntArr", "Anticipo del arriendo de un taller nuevo", 2, "meses", "F", "Fase 3, Tabla 19", "0")
    S.p("MesEqT1", "Equipamiento del taller 1 y del primer puesto: mes de compra", -9, "mes", "S",
        "v4: el Proyecto Experimental instala y mide 6 kits en el taller 1 (antes: mes −3)", FMT_MES,
        alts=[("A", -3, None)], extra={"P1": "A", "P2": "A", "P3": "A", "P4": "A", "P5": "A"})

    # ---- H. Red
    S.bloque("BLOQUE H. RED DE TALLERES (vende el proceso; se cobra POR TALLER, nunca por instalación)")
    S.enc_anios("Concepto", desde=1)
    S.y("RedNuevosBase", "Talleres nuevos por año comercial (limitado por la capacidad de Lumine para incorporar y formar)",
        ["", 0, 0, 3, 5, 8], "P", "PROVISORIO, supuesto del equipo", FMT_ENTERO, desde=1)
    rr = S.r
    S.y("RedNuevos", "Talleres nuevos usados (× factor de sensibilidad, enteros)",
        [""] + [f"=ROUND({col(2 + t)}{rr - 1}*RedFact,0)" for t in range(1, 6)], "F", "Fórmula", FMT_ENTERO, desde=1)
    S.enc()
    S.p("RedFact", "Factor de talleres de la red (sensibilidad)", 1, "×", "S", "Anexos", FMT_DEC1,
        alts=[("A", 0.5, "Talleres de la red: la mitad"), ("B", 2, "Talleres de la red: el doble")])
    S.p("RedDerecho", "Derecho de entrada", 3000000, "$ por taller", "S", "Ref.: Bosch Car Service Brasil 2026, adhesión R$15.000 ≈ $2.938.000")
    S.p("RedFormTec", "Formación inicial por técnico", 1500000, "$ por técnico", "S", "Rango de mercado $732.550 a $2.156.000 por las 392 h de la ruta")
    S.p("RedTec", "Técnicos por taller de la red", 2, "personas", "S", "Supuesto del equipo", "0")
    S.f("RedPaquete", "Paquete de entrada = derecho + formación × técnicos", "=RedDerecho+RedFormTec*RedTec", "$ por taller", "Fórmula")
    S.p("RedArancel", "Arancel del 3CV por autorización de taller y modelo (cobrado al costo; efecto neto cero)", 0, "$ por modelo", "P",
        "POR CONFIRMAR (D.S. 33/2004)", alts=[("A", 500000, "Arancel del 3CV $500.000 por modelo")])
    S.p("RedModelos", "Modelos autorizados por taller al entrar", 5, "modelos", "S", "Supuesto del equipo (solo para el arancel)", "0")
    S.p("RedCuota", "Cuota base mensual (biblioteca, activación, soporte, plataforma, auditoría, marca y sello)", 250000, "$ por taller al mes", "S",
        "Supuesto del equipo. Ref.: Bosch, fee R$810 al mes ≈ $158.700",
        alts=[("A", 200000, "Cuota base de la red $200.000"), ("B", 300000, "Cuota base de la red $300.000")])
    S.p("RedHab", "Lumine Habilita por técnico (precio fijado con la canasta H1)", 45000, "$ por técnico al mes", "S",
        "redcapacitacion.cl, 07-11-2026 (canasta H1)",
        alts=[("A", 35000, "Habilita $35.000"), ("B", 55000, "Habilita $55.000")])
    r = S.r
    encabezado(ws, r, ["H1. Canasta de Lumine Habilita", "Precio", "Veces al año", "Total al año", "", "", "", "Fuente y fecha"])
    S.r += 1
    canasta = [("Curso presencial largo", 350000, 1), ("Curso asincrónico", 33208, 4), ("Revalidación de alta tensión", 90000, 0.5)]
    r0 = S.r
    for et, pr, vz in canasta:
        r = S._fila()
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", pr, FMT_PESOS, relleno=RELLENO["F"], borde=B_FILA)
        celda(ws, f"C{r}", vz, FMT_DEC1, relleno=RELLENO["F"], borde=B_FILA)
        celda(ws, f"D{r}", f"=B{r}*C{r}", FMT_PESOS, borde=B_FILA)
        celda(ws, f"H{r}", "redcapacitacion.cl, consultado el 07-11-2026", color=GRIS, tam=9, borde=B_FILA)
    r = S._fila()
    celda(ws, f"A{r}", "Total de la canasta: al año (D) y al mes (B) → precio fijado $45.000", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=SUM(D{r0}:D{r - 1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    celda(ws, f"B{r}", f"=D{r}/12", FMT_PESOS, negrita=True, borde=B_TOTAL)
    S.enc()
    S.p("RedUCusd", "Unidad de control (la compra el taller al proveedor; no es ingreso de Lumine)", 124, "US$", "F", "Fase 3", FMT_ENTERO)
    S.p("RedCursoAT", "Costo Lumine: curso externo de alta tensión por técnico, al entrar", 750000, "$ por técnico", "F", "Fase 3")
    S.p("RedAudit", "Costo Lumine: auditoría anual con viaje", 600000, "$ por taller al año", "S", "Supuesto del equipo")
    S.p("RedComPct", "Comisión del Comercial de Empresas sobre el paquete (con cargas)", 0.05, "%", "S", "Supuesto del equipo", FMT_PCT)
    S.p("RedKitsA", "Kits al año de un taller de la red (control 1)", 60, "kits", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("RedKitsB", "Kits al año de un taller de la red (control 2)", 120, "kits", "S", "Supuesto del equipo", FMT_ENTERO)
    S.f(None, "Control: suscripción anual / ventas del taller con 60 kits (≈1,7%)",
        "=(RedCuota+RedHab*RedTec)*12/(RedKitsA*((1-Mix)*PrecioE+Mix*PrecioP))", "%", "Fórmula", FMT_PCT)
    S.f(None, "Control: suscripción anual / ventas del taller con 120 kits (≈0,9%)",
        "=(RedCuota+RedHab*RedTec)*12/(RedKitsB*((1-Mix)*PrecioE+Mix*PrecioP))", "%", "Fórmula", FMT_PCT)

    # ---- I. Cobros
    S.bloque("BLOQUE I. COBROS, CRÉDITO DIRECTO Y CAPITAL DE TRABAJO")
    S.enc()
    S.p("Pie", "Pie al agendar (un mes antes de instalar), todo cliente", 0.30, "% del precio", "S", "Supuesto del equipo", FMT_PCT)
    S.p("VtaCred", "Ventas financiadas con crédito directo de Lumine (el resto: contado o tarjeta)", 0.30, "% de las instalaciones", "S",
        "Decisión del equipo, 08-11-2026 (v3: 50%)", FMT_PCT,
        alts=[("A", 0.0, "Ventas a crédito 0% (sin crédito directo)"), ("B", 0.50, "Ventas a crédito 50% (v3)"), ("C", 0.70, "Ventas a crédito 70%")],
        extra={"P1": "B", "P2": "B"})
    S.p("ComMP", "Comisión de medio de pago sobre ventas al contado o con tarjeta", 0.02, "%", "S", "Supuesto del equipo (ref.: Transbank, julio de 2026)", FMT_PCT)
    S.p("Plazo", "Plazo del crédito directo (sistema francés)", 24, "meses", "S", "Supuesto del equipo", "0",
        alts=[("A", 12, "Plazo del crédito 12 meses"), ("B", 36, "Plazo del crédito 36 meses")])
    S.p("TasaCredNom", "Tasa del crédito directo (nominal, la del contrato)", 0.015, "% mensual", "P",
        "Rango 0,99% a 1,89% mensual del crédito automotriz publicado por las marcas, 2025–2026", FMT_PCT2)
    S.p("TasaRealFlag", "Convertir la tasa del crédito a real con Fisher (1 = sí; el modelo está en pesos constantes)", 1, "1 / 0", "S",
        "Método acordado (A0.2): tasas nominales a reales con Fisher. v3: 0", "0", alts=[("A", 0, None)],
        extra={"P1": "A", "P2": "A", "P3": "A"})
    S.f("TasaCredReal", "Tasa mensual que usa el modelo = (1 + nominal) / (1 + inflación LP)^(1/12) − 1",
        "=IF(TasaRealFlag=1,(1+TasaCredNom)/(1+InflLP)^(1/12)-1,TasaCredNom)", "% mensual", "Fórmula (Fisher)", FMT_PCT3)
    S.f("FactorCuota", "Cuota por cada $1 financiado = PAGO(tasa; plazo; −1)", "=PMT(TasaCredReal,Plazo,-1)", "$", "Fórmula", "0.000000")
    S.p("Bono", "Bono financiamiento (menor ingreso; solo ventas con crédito)", 0.05, "% del precio", "S", "Supuesto del equipo", FMT_PCT)
    S.p("Incob", "Provisión de incobrables (en el mes de la venta)", 0.03, "% del monto financiado", "P", "PROVISORIO", FMT_PCT,
        alts=[("A", 0.01, "Incobrables 1%"), ("B", 0.06, "Incobrables 6%")])
    S.p("EvalCred", "Costo de evaluación crediticia por solicitud", 5000, "$", "P", "PROVISORIO")
    S.p("ProvAnt", "Proveedor: anticipo al pedir (2 meses antes de instalar)", 0.30, "%", "F", "Condiciones del proveedor (Fase 3)", FMT_PCT)
    S.p("ProvDesde", "Proveedor: desde este pedido el 70% se paga a 30 días del embarque", 4, "n.º de pedido", "F",
        "Condiciones del proveedor (Fase 3). El primer pedido cubre los meses 1 y 2", "0")
    S.p("Holgura", "Holgura del capital de trabajo", 0, "%", "S", "Decisión del equipo", FMT_PCT)
    S.p("CTDefFlag", "Capital de trabajo del año 1: incluir el déficit acumulado máximo (1 = sí, método de clase)", 1, "1 / 0", "S",
        "Método acordado (traspaso §2). v3: tomaba solo el saldo", "0", alts=[("A", 0, None)],
        extra={"P1": "A", "P2": "A", "P3": "A", "P4": "A"})

    # ---- J. Personal
    S.bloque("BLOQUE J. PERSONAL (rentas brutas mensuales; gratificación incluida)")
    r = S._fila()
    encabezado(ws, r, ["Cargo", "Renta bruta", "Parámetro 1", "Parámetro 2", "", "", "", "Regla de dotación y fuente"])
    cargos = [
        ("R_GG", "Gerente General", 1900000, None, None, "S", "1 desde el mes 1. Decisión del equipo"),
        ("R_RT", "Responsable Técnico", 1700000, None, None, "S", "1 por taller: el taller 1 desde el mes −9 (Proyecto Experimental), los demás 3 meses antes de abrir"),
        ("R_Ing", "Ingeniería de Calibración", 1500000, ("IngSegAnio", 4, "0"), None, "P",
         "Desde el mes −9; la 2.ª persona desde el año del proyecto indicado en C. PROVISORIO: evaluar $1.700.000 por la firma"),
        ("R_Adm", "Administración y Personas", 900000, None, None, "S", "1 desde el mes −3"),
        ("R_Com", "Comercial y Postventa (+ comisión)", 850000, ("ComPorInst", 600, FMT_ENTERO), None, "S",
         "1 desde el mes comercial 1, más 1 por cada C instalaciones del año comercial (supuesto)"),
        ("R_AsPost", "Asistente de Postventa", 692000, ("AsPostUmbral", 1000, FMT_ENTERO), ("AsPostPaso", 1500, FMT_ENTERO), "S",
         "1 cuando el parque acumulado supera C vehículos, más 1 por cada D adicionales (supuesto)"),
        ("R_ComEmp", "Comercial de Empresas (+ comisión)", 850000, ("ComEmpUmbral", 5, "0"), None, "S", "1 cuando la red tiene C talleres (supuesto)"),
        ("R_PlatHon", "Administrador de plataforma y red: honorarios part-time (sin cargas)", 450000, ("AdmPlatUmbral", 10, "0"), None, "S",
         "Desde el primer taller de la red; pasa a jornada completa con C talleres"),
        ("R_PlatFull", "Administrador de plataforma y red: jornada completa", 900000, None, None, "S", "Desde los talleres indicados arriba"),
        ("R_Sop", "Soporte técnico de red", 900000, ("SopPaso", 15, "0"), None, "S", "1 por cada C talleres (REDONDEAR.MAS), desde el primer taller"),
        ("R_AsAdm", "Asistente de Administración", 692000, ("AsAdmUmbral", 25, "0"), None, "S", "1 cuando la dotación supera C personas"),
    ]
    for nom, et, renta, p1, p2, tipo, regla in cargos:
        r = S._fila()
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", renta, FMT_PESOS, relleno=RELLENO[tipo], borde=B_FILA)
        L.nombre(nom, H_SUP, f"$B${r}")
        for colp, pp in (("C", p1), ("D", p2)):
            if pp:
                celda(ws, f"{colp}{r}", pp[1], pp[2], relleno=RELLENO["S"], borde=B_FILA)
                L.nombre(pp[0], H_SUP, f"${colp}${r}")
            else:
                ws[f"{colp}{r}"].border = B_FILA
        for k in "EFG":
            ws[f"{k}{r}"].border = B_FILA
        celda(ws, f"H{r}", regla, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
    r = S._fila()
    encabezado(ws, r, ["Técnicos (trayectoria por niveles)", "Renta bruta", "Meses en el nivel", "Bono al validar", "", "", "", "Fuente"])
    niveles = [("N1", 700000, 2, None), ("N2", 770000, 3, 140000), ("N3", 840000, 3, 140000), ("N4", 900000, None, 170000)]
    for k, (n, renta, meses, bono) in enumerate(niveles, start=1):
        r = S._fila()
        celda(ws, f"A{r}", f"Técnico {n}", borde=B_FILA)
        celda(ws, f"B{r}", renta, FMT_PESOS, relleno=RELLENO["S"], borde=B_FILA)
        L.nombre(f"Renta{n}", H_SUP, f"$B${r}")
        if meses is not None:
            celda(ws, f"C{r}", meses, "0", relleno=RELLENO["S"], borde=B_FILA)
            L.nombre(f"Meses{n}", H_SUP, f"$C${r}")
        else:
            celda(ws, f"C{r}", "desde entonces", color=GRIS, tam=9, borde=B_FILA)
        if bono is not None:
            celda(ws, f"D{r}", bono, FMT_PESOS, relleno=RELLENO["S"], borde=B_FILA)
            L.nombre(f"Bono{n}", H_SUP, f"$D${r}")
        else:
            ws[f"D{r}"].border = B_FILA
        for kk in "EFG":
            ws[f"{kk}{r}"].border = B_FILA
        celda(ws, f"H{r}", "Decisión del equipo (Lumine Habilita, D18). Bono único al validar el nivel, con cargas", color=GRIS, tam=9, borde=B_FILA)
    S.enc(False)
    S.p("SeniorExtra", "Antigüedad adicional del técnico senior del primer dúo (abre como N3; el otro como N2)", 3, "meses", "S",
        "Decisión del equipo: el primer dúo entra en el mes −2", "0")
    r = S._fila()
    encabezado(ws, r, ["Factor de costo empresa (Ley 21.735)", "Desde", "Factor", "", "", "", "", "Fuente y fecha"])
    factores = [(date(2027, 1, 1), 1.0938, "F", "Ley 21.735; Fase 3, Tabla 16"), (date(2027, 8, 1), 1.1013, "F", "Ley 21.735"),
                (date(2028, 8, 1), 1.1088, "F", "Ley 21.735"), (date(2029, 8, 1), 1.1193, "P", "PROVISORIO: interpolado"),
                (date(2030, 8, 1), 1.1298, "F", "Ley 21.735; Fase 3, Tabla 16")]
    rf0 = S.r
    for k, (d, v, t, fu) in enumerate(factores, start=1):
        r = S._fila()
        celda(ws, f"A{r}", f"Tramo {k}", borde=B_FILA)
        celda(ws, f"B{r}", d, FMT_FECHA_D, relleno=RELLENO[t], borde=B_FILA)
        celda(ws, f"C{r}", v, "0.0000", relleno=RELLENO[t], borde=B_FILA)
        for kk in "DEFG":
            ws[f"{kk}{r}"].border = B_FILA
        celda(ws, f"H{r}", fu, color=GRIS, tam=9, borde=B_FILA)
    L.nombre("FactDesde", H_SUP, f"$B${rf0}:$B${S.r - 1}")
    L.nombre("FactValor", H_SUP, f"$C${rf0}:$C${S.r - 1}")
    S.nota("Los honorarios no llevan factor de costo empresa (gasto directo).", "S")

    # ---- K. Inversión
    S.bloque("BLOQUE K. INVERSIÓN, DESARROLLO, I+D Y VIDAS ÚTILES (SII, Resolución 43/2002)")
    r = S._fila()
    encabezado(ws, r, ["Ítem", "Valor", "Unidad", "Vida útil (años)", "", "", "", "Fuente y fecha"])
    items = [
        ("DinoAUD", "Dinamómetro de chasis: precio (Mainline Dyno, 2WD reacondicionado)", 30000, "AUD", ("V_Dino", 15), "P",
         "POR RECOTIZAR (aviso del 6-3-2024); arancel 0% por TLC Chile–Australia", FMT_ENTERO),
        ("DinoFlete", "Dinamómetro: flete e instalación", 0.10, "% del precio", None, "S", "Supuesto del equipo", FMT_PCT),
        ("Escaner", "Escáner automotriz", 1429000, "$ por taller", ("V_Esc", 6), "F", "Fase 3, Tabla 18", FMT_PESOS),
        ("Bodega", "Bodega de baterías clase 9", 4000000, "$ por taller", ("V_Bod", 10), "F", "Fase 3, Tabla 18", FMT_PESOS),
        ("Mobiliario", "Mobiliario y computadores", 4000000, "$ por taller", ("V_Mob", 6), "F", "Fase 3, Tabla 18", FMT_PESOS),
        ("Habilitacion", "Habilitación del local", 15000000, "$ por taller", ("V_Hab", 10), "P", "Fase 3, Tabla 18. PROVISORIO: desglose pendiente", FMT_PESOS),
        ("Elevador", "Elevador (por puesto, al activar cada dúo)", 2150000, "$ por puesto", ("V_Elev", 15), "F", "Fase 3, Tabla 18", FMT_PESOS),
        ("Herramientas", "Herramientas (por puesto; se reponen al cumplir su vida útil)", 1200000, "$ por puesto", ("V_Herr", 3), "F", "Fase 3, Tabla 18", FMT_PESOS),
    ]
    for nom, et, v, uni, vida, t, fu, fmt in items:
        r = S._fila()
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", v, fmt, relleno=RELLENO[t], borde=B_FILA)
        celda(ws, f"C{r}", uni, color=GRIS, tam=9, borde=B_FILA)
        L.nombre(nom, H_SUP, f"$B${r}")
        if vida:
            celda(ws, f"D{r}", vida[1], "0", relleno=RELLENO["F"], borde=B_FILA)
            L.nombre(vida[0], H_SUP, f"$D${r}")
        else:
            ws[f"D{r}"].border = B_FILA
        for kk in "EFG":
            ws[f"{kk}{r}"].border = B_FILA
        celda(ws, f"H{r}", fu + ("; vida útil: SII, Res. 43/2002" if vida else ""), color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
    S.enc(False)
    S.f("DinoCLP", "Dinamómetro en pesos = AUD × AUD/CLP × (1 + flete)", "=DinoAUD*AUD_CLP*(1+DinoFlete)", "$ por taller", "Fórmula (≈ $22.423.170)")
    S.f("EqTaller", "Equipamiento por taller (dinamómetro, escáner, bodega, mobiliario y habilitación)",
        "=DinoCLP+Escaner+Bodega+Mobiliario+Habilitacion", "$ por taller", "Fórmula")
    S.f("EqDuo", "Equipamiento por puesto de dúo (elevador y herramientas)", "=Elevador+Herramientas", "$ por puesto", "Fórmula")
    S.p("V_Int", "Amortización de intangibles (desarrollo, I+D, Proyecto Experimental y puesta en marcha)", 5, "años", "F", "LIR art. 31", "0")
    S.p("GarArrMeses", "Garantía de arriendo (recuperable)", 1, "meses de arriendo", "S", "Práctica de mercado", "0")
    S.p("Constitucion", "Constitución de la SpA y marca", 0, "$", "P", "POR DEFINIR")
    S.p("Arriendo", "Arriendo por local", 3600000, "$ al mes", "F", "Fase 3, Tabla 19")
    S.p("ArrT1Desde", "Taller 1: arriendo desde el mes (el Proyecto Experimental necesita local)", -9, "mes", "P", "PROVISORIO (traspaso §4)", FMT_MES)
    S.p("PEKits", "Proyecto Experimental: kits Plus a costo realista (lote piloto)", 6, "kits", "F",
        "Yaris Sedán, Rio, Sail, Versa, Onix, Soluto (Yapo.cl y BioBioChile, 1T-2025)", "0")
    S.p("PENotaria", "Proyecto Experimental: declaración jurada notarial", 30000, "$", "F", "Notaría")
    S.p("PESeguro", "Proyecto Experimental: seguro de responsabilidad civil", 0, "$", "P", "POR COTIZAR")
    S.p("SW_H1", "Desarrollo: Lumine Habilita", 900, "horas", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("SW_H2", "Desarrollo: web y estimador", 350, "horas", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("SW_H3", "Desarrollo: software de control", 800, "horas", "S", "Supuesto del equipo", FMT_ENTERO)
    S.p("SWTarifa", "Tarifa de mercado por hora", 13000, "$ por hora", "S", "Supuesto; ref.: desarrollador $1.172.239 al mes (Indeed, 14-09-2026)")
    S.f("SWDev", "Desarrollo de software valorizado a mercado", "=(SW_H1+SW_H2+SW_H3)*SWTarifa", "$", "Fórmula (= $26.650.000)")
    S.p("SWIni", "Desarrollo de software: primer mes de pago", -9, "mes", "S", "Supuesto del equipo", FMT_MES)
    S.p("SWFin", "Desarrollo de software: último mes de pago", -1, "mes", "S", "Supuesto del equipo", FMT_MES)
    S.p("SWMant", "Mantención del software", 0.15, "% anual del desarrollo", "F", "Fase 3", FMT_PCT)
    S.p("SWHostUSD", "Hosting", 45, "US$ al mes", "F", "Fase 3", FMT_ENTERO)
    S.p("SWResto", "Software y licencias: resto", 0, "$ al mes", "P", "POR COTIZAR")
    S.enc_anios("Concepto", desde=1)
    S.y("IDAnio", "I+D por año del proyecto (P1: durabilidad de motores y proveedor alternativo $30 M; P2: siguiente versión del kit $50 M)",
        ["", 15000000, 15000000, 25000000, 25000000, 0], "P", "PROVISORIO: montos estimados; cada proyecto repartido en dos años", FMT_PESOS, desde=1)
    S.enc()
    S.p("CorfoFlag", "Subsidio CORFO Crea y Valida y crédito tributario Ley 20.241 (1 = sí; solo en Anexos)", 0, "1 / 0", "S",
        "Caso base sin subsidio", "0", alts=[("A", 1, "I+D con CORFO y crédito de 35%")])
    S.p("CorfoPct", "CORFO Crea y Valida: cofinanciamiento", 0.80, "%", "F", "CORFO 2026, micro y pequeña empresa", FMT_PCT)
    S.p("CorfoTope", "CORFO: tope del cofinanciamiento", 180000000, "$", "F", "CORFO 2026")
    S.p("CredIDPct", "Crédito tributario I+D sobre el aporte propio (Ley 20.241, vigente hasta 2035)", 0.35, "%", "F", "Ley 20.241", FMT_PCT)
    S.f("IDSub", "Subsidio usado sobre el I+D", "=IF(CorfoFlag=1,MIN(CorfoPct,CorfoTope/SUM(IDAnio)),0)", "%", "Fórmula", FMT_PCT)
    S.f("IDCred", "Crédito tributario usado", "=IF(CorfoFlag=1,CredIDPct,0)", "%", "Fórmula", FMT_PCT)
    S.nota("Valor de desecho: MÉTODO CONTABLE (decisión del equipo) = valor libro + recuperación del capital de trabajo + garantías. "
           "El económico va solo como referencia (hoja 1).", "S")

    # ---- L. Operación
    S.bloque("BLOQUE L. GASTOS DE OPERACIÓN (Fase 3, Tabla 19, por local)")
    S.enc(False)
    S.p("Servicios", "Servicios básicos", 700000, "$ al mes por local", "F", "Fase 3, Tabla 19")
    S.p("Seguros", "Seguros", 600000, "$ al mes por local", "F", "Fase 3, Tabla 19")
    S.p("MantPct", "Mantención de equipos", 0.03, "% anual del equipamiento", "F", "Fase 3, Tabla 19", FMT_PCT)
    S.p("CursoTec", "Cursos externos y EPP por técnico nuevo propio", 750000, "$ por técnico", "F", "Fase 3, Tabla 19")

    # ---- M. Marketing
    S.bloque("BLOQUE M. MARKETING (Fase 3, Tabla 11, mismos totales; corre por año comercial)")
    S.enc_anios("Concepto", desde=1)
    mk = [("MkLanz", "Lanzamiento (meses 1 a 3 del año comercial 1)", [3000000, 0, 0, 0, 0], "F", "Fase 3, Tabla 11"),
          ("MkPauta", "Pauta digital", [14400000, 18000000, 24000000, 24000000, 30000000], "F", "Fase 3, Tabla 11"),
          ("MkCasos", "Casos con ahorro medido", [2400000, 4800000, 4800000, 4800000, 4800000], "F", "Fase 3, Tabla 11"),
          ("MkMat", "Material para mecánicos y paraderos", [3000000, 2000000, 3500000, 2000000, 3500000], "F", "Fase 3, Tabla 11"),
          ("MkConv", "Convenios con líneas de colectivos", [0, 0, 4000000, 4000000, 4000000], "F", "Fase 3, Tabla 11"),
          ("MkRed", "Marketing a talleres (red): $10 M al abrir la red y $5 M después", [0, 0, 10000000, 5000000, 5000000], "S", "Supuesto del equipo")]
    for nom, et, v, t, fu in mk:
        S.y(nom, et, [""] + v, t, fu, FMT_PESOS, desde=1)
    S.enc(False)
    S.p("PautaPct", "Pauta digital del año 1: % en los primeros meses (el resto parejo)", 0.5, "%", "S", "Supuesto del equipo", FMT_PCT)
    S.p("PautaMeses", "Pauta digital del año 1: n.º de primeros meses", 3, "meses", "S", "Supuesto del equipo", "0")
    S.p("CasosIni", "Casos medidos del año 1: primer mes", 4, "mes", "S", "Supuesto del equipo", "0")
    S.p("CasosFin", "Casos medidos del año 1: último mes", 6, "mes", "S", "Supuesto del equipo", "0")
    S.p("LanzMeses", "Lanzamiento: meses de duración", 3, "meses", "S", "Supuesto del equipo", "0")

    # ---- N. Escenarios
    S.bloque("BLOQUE N. ESCENARIOS (el selector está en el Dashboard) Y SENSIBILIDAD ACTIVA (el selector está en Anexos)")
    r = S._fila()
    encabezado(ws, r, ["Escenario", "Factor de demanda", "Factor de precio", "Factor de costo variable", "", "", "", "Fuente y fecha"])
    re0 = S.r
    for nom, a, b, c in [("Base", 1, 1, 1), ("Pesimista", 0.8, 0.95, 1.05), ("Optimista", 1.2, 1.05, 0.95)]:
        r = S._fila()
        celda(ws, f"A{r}", nom, borde=B_FILA)
        for k, v in zip("BCD", (a, b, c)):
            celda(ws, f"{k}{r}", v, "0.00", relleno=RELLENO["S"], borde=B_FILA)
        for kk in "EFG":
            ws[f"{kk}{r}"].border = B_FILA
        celda(ws, f"H{r}", "Supuesto del equipo (editable)", color=GRIS, tam=9, borde=B_FILA)
    L.nombre("EscNom", H_SUP, f"$A${re0}:$A${S.r - 1}")
    L.nombre("EscDem", H_SUP, f"$B${re0}:$B${S.r - 1}")
    L.nombre("EscPre", H_SUP, f"$C${re0}:$C${S.r - 1}")
    L.nombre("EscCos", H_SUP, f"$D${re0}:$D${S.r - 1}")
    S.enc(False)
    S.f("EscSel", "Escenario activo (enlace al selector del Dashboard)", f"={q(H_DASH)}!$C$5", "", "Fórmula", None)
    S.f("FactDem", "Factor de demanda usado", "=INDEX(EscDem,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f("FactPre", "Factor de precio usado", "=INDEX(EscPre,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f("FactCosto", "Factor de costo variable usado", "=INDEX(EscCos,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f(None, "Sensibilidad activa (enlace al selector de Anexos; «Base» para el caso base)", "=SensActiva", "", "Fórmula", None)
    S.f("SensCod", "Código de la sensibilidad activa", "=IFERROR(INDEX(Anx_Cod,MATCH(SensActiva,Anx_Caso,0)),\"BASE\")", "", "Fórmula", None)

    # índice de bloques con vínculos
    r = fila_indice
    celda(ws, f"A{r}", "Índice de bloques (clic para ir):", tam=9, color=GRIS)
    cortos = {"A": "Calendario", "B": "Mercado", "C": "Impuesto", "D": "Tasas", "E": "Comercial", "F": "Demanda", "G": "Capacidad",
              "H": "Red", "I": "Cobros", "J": "Personal", "K": "Inversión", "L": "Operación", "M": "Marketing", "N": "Escenarios"}
    textos = [(t.split(".")[0].replace("BLOQUE ", ""), f) for t, f in S.indice]
    textos = [(f"{x} · {cortos.get(x, x)}", f) for x, f in textos]
    for k, (t, f) in enumerate(textos):
        c = ws.cell(row=r + k // 7, column=2 + k % 7)
        c.value = f'=HYPERLINK("#{q(H_SUP)}!A{f}","{t}")'
        c.font = fuente(9, True, CELESTE8)
        c.alignment = CEN
    ws.freeze_panes = "B8"
    # resuelve las alternativas que dependen de su propia fila (dólar ±10%)
    for row in ws.iter_rows(min_row=8, max_row=S.r, min_col=5, max_col=7):
        for c in row:
            if isinstance(c.value, str) and "{r}" in c.value:
                c.value = c.value.replace("{r}", str(c.row))
    ws.print_title_rows = "1:7"
    return S


# =====================================================================================================
# DATOS FASE 3 (costo del kit y tablas de referencia)
# =====================================================================================================
def hoja_fase3(L):
    ws = L.ws[H_F3]
    hoja_base(ws, 90)
    titulo_hoja(ws, "DATOS FASE 3 · costo del kit y tablas de referencia · " + UNIDAD, [
        "Qué calcula: el costo directo del kit (punto medio entre el costeo realista de la Fase 3 actualizado y el mejor caso) con forward.",
        "De dónde toma: Informe de la Fase 3 (Anexo 9 y Tablas 7, 10, 11, 16, 18, 19 y 20), libro de costos de la Fase 4 y Supuestos (dólar, forward, escenario).",
        "A qué hoja entrega: Mensual (KitE, KitP) e Inversión (kits del Proyecto Experimental). Las tablas en gris son solo comparación.",
    ])
    for c, w in zip("ABCDEFGH", [62, 15, 15, 17, 13, 13, 16, 58]):
        ws.column_dimensions[c].width = w

    def fila(r, et, vals, fmt=FMT_PESOS, tipo=None, fu="", negrita=False, borde=B_FILA):
        celda(ws, f"A{r}", et, negrita=negrita, alin=IZQ_W, borde=borde)
        for k, v in enumerate(vals):
            if v is None:
                ws.cell(row=r, column=2 + k).border = borde
                continue
            es_f = isinstance(v, str) and v.startswith("=")
            celda(ws, f"{col(2 + k)}{r}", v, fmt, negrita=negrita,
                  relleno=None if (es_f or tipo is None) else RELLENO[tipo], borde=borde)
        for k in range(2 + len(vals), 8):
            ws.cell(row=r, column=k).border = borde
        celda(ws, f"H{r}", fu, color=GRIS, tam=9, alin=IZQ_W, borde=borde)

    r = 6
    bloque(ws, r, "1. COSTO DIRECTO DEL KIT · COSTEO REALISTA DE LA FASE 3, ACTUALIZADO AL DÓLAR BASE")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla (Plus según Supuestos)", "", "", "", "Fuente y fecha"])
    fila(8, "Costo directo de la Fase 3 al dólar de $965,71", [2991086, 3350171], tipo="F", fu="Informe Fase 3, Anexo 9 (costeo realista)")
    fila(9, "Dólar del costeo de la Fase 3", [965.71], FMT_DEC2, "F", "Informe Fase 3, Anexo 9")
    fila(10, "Alza del costo por cada $10 de alza del dólar", [25168, 28886], tipo="F", fu="Informe Fase 3 (coeficiente de sensibilidad)")
    fila(11, "Costo al dólar base, sin forward", ["=B8+(Dolar_base-$B$9)/10*B10", "=C8+(Dolar_base-$B$9)/10*C10", "=(1-Mix_base)*B11+Mix_base*C11"],
         fu="Fórmula")
    fila(12, "Valor esperado según las instrucciones (v3)", [3031028, 3396013, 3250019], tipo="F", fu="Instrucciones del equipo (Fase 4, v3)")
    fila(13, "Control: costo calculado − esperado (redondeado; debe dar 0)", ["=ROUND(B11-B12,0)", "=ROUND(C11-C12,0)", "=ROUND(D11-D12,0)"], fu="Control")
    L.control("Datos Fase 3: costo realista contra el valor esperado", H_F3, "B13:D13")
    fila(14, "Porción del costo en dólares", [0.82], FMT_PCT, "F", "Informe Fase 3")
    fila(15, "Factor forward = 1 + % en US$ × diferencial × plazo / 12", ["=1+B14*FwdDif*FwdPlazo/12"], "0.000000", fu="Fórmula (Supuestos, bloque B)")
    fila(16, "Costo realista al dólar usado, con forward", ["=(B8+(Dolar-$B$9)/10*B10)*$B$15", "=(C8+(Dolar-$B$9)/10*C10)*$B$15",
                                                         "=(1-Mix)*B16+Mix*C16"], fu="Fórmula")

    r = 18
    bloque(ws, r, "2. COSTO DIRECTO DEL KIT · MEJOR CASO (precios del libro de costos de la Fase 4)")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla", "", "", "", "Fuente y fecha"])
    fila(20, "Componente en dólares (US$ por kit)", [2314.15, 2605.77], FMT_DEC2, "F", "Libro de costos Fase 4, precios del 07-11-2026")
    fila(21, "Componente en euros (€ por kit)", [171.9, 171.9], FMT_DEC2, "F", "Libro de costos Fase 4, precios del 07-11-2026")
    fila(22, "Componente en pesos ($ por kit)", [188748, 188748], tipo="F", fu="Libro de costos Fase 4, precios del 07-11-2026")
    fila(23, "Costo al dólar base, sin forward", ["=B20*Dolar_base+B21*EUR_CLP+B22", "=C20*Dolar_base+C21*EUR_CLP+C22",
                                                  "=(1-Mix_base)*B23+Mix_base*C23"], fu="Fórmula")
    fila(24, "Valor de referencia (v3)", [2649042, 2935293], tipo="F", fu="Instrucciones del equipo (Fase 4, v3)")
    fila(25, "Control en miles de $ (debe dar 0)", ["=ROUND((B23-B24)/1000,0)", "=ROUND((C23-C24)/1000,0)"], fu="Control")
    L.control("Datos Fase 3: mejor caso contra el valor de referencia", H_F3, "B25:C25")
    fila(26, "Mejor caso al dólar usado, con forward en la parte en dólares",
         ["=B20*Dolar*(1+FwdDif*FwdPlazo/12)+B21*EUR_CLP+B22", "=C20*Dolar*(1+FwdDif*FwdPlazo/12)+C21*EUR_CLP+C22",
          "=(1-Mix)*B26+Mix*C26"], fu="Fórmula")

    r = 28
    bloque(ws, r, "3. COSTO DEL KIT DEL CASO BASE v4 · PUNTO MEDIO (decisión del equipo, 08-11-2026)")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla", "", "", "", "Fuente y fecha"])
    fila(30, "Peso del costeo realista en el costo del kit (50% = punto medio)", ["=PesoReal"], FMT_PCT,
         fu="Supuestos (abajo, fila 47); alternativas: 100% realista (v3) y 0% mejor caso")
    fila(31, "Punto medio al dólar base, sin forward (control: mezcla ≈ $3,03 M)",
         ["=$B$30*B11+(1-$B$30)*B23", "=$B$30*C11+(1-$B$30)*C23", "=(1-Mix_base)*B31+Mix_base*C31"], fu="Fórmula; «precios típicos de componentes»")
    fila(32, "Punto medio al dólar usado, con forward", ["=$B$30*B16+(1-$B$30)*B26", "=$B$30*C16+(1-$B$30)*C26", "=(1-Mix)*B32+Mix*C32"],
         fu="Fórmula")
    fila(33, "Costo del kit como % del precio neto", ["=B32/PrecioE", "=C32/PrecioP", "=D32/((1-Mix)*PrecioE+Mix*PrecioP)"], FMT_PCT, fu="Fórmula")

    r = 35
    bloque(ws, r, "4. COSTO DEL KIT USADO EN EL MODELO (escenario y sensibilidad activos)")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla", "", "", "", "Fuente y fecha"])
    fila(37, "Costo directo por kit usado (× factor de costo variable del escenario)", ["=B32*FactCosto", "=C32*FactCosto", "=(1-Mix)*B37+Mix*C37"],
         fu="Fórmula", negrita=True)
    fila(38, "Kit Plus del Proyecto Experimental (lote piloto: costo realista)", [None, "=C16*FactCosto"], fu="Fórmula (Supuestos, bloque K)")
    L.nombre("KitE", H_F3, "$B$37")
    L.nombre("KitP", H_F3, "$C$37")
    L.nombre("KitMezcla", H_F3, "$D$37")
    L.nombre("KitP_Real", H_F3, "$C$38")

    r = 40
    bloque(ws, r, "5. PESO DEL COSTEO REALISTA (dato de entrada con sus alternativas; la sensibilidad lo cambia)")
    encabezado(ws, r + 1, ["Parámetro", "Valor", "Unidad", "Valor usado", "Alternativa A", "Alternativa B", "", "Fuente y fecha"])
    rr = 42
    celda(ws, f"A{rr}", "Peso del costeo realista de la Fase 3 en el costo del kit", alin=IZQ_W, borde=B_FILA)
    celda(ws, f"B{rr}", 0.5, FMT_PCT, relleno=RELLENO["S"], borde=B_FILA)
    celda(ws, f"C{rr}", "%", color=GRIS, tam=9, borde=B_FILA)
    celda(ws, f"E{rr}", 1.0, "0.0%", relleno=RELLENO["S"], borde=B_FILA)
    celda(ws, f"F{rr}", 0.0, "0.0%", relleno=RELLENO["S"], borde=B_FILA)
    celda(ws, f"D{rr}", f'=IF(OR(SensCod="PesoReal_A",SensCod="P1"),E{rr},IF(SensCod="PesoReal_B",F{rr},B{rr}))', FMT_PCT, negrita=True,
          borde=B_FILA)
    ws[f"G{rr}"].border = B_FILA
    celda(ws, f"H{rr}", "Decisión del equipo (traspaso §6): punto medio entre el realista ($3,25 M) y el mejor caso ($2,82 M)",
          color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
    L.nombre("PesoReal", H_F3, f"$D${rr}")
    L.nombre("PesoReal_base", H_F3, f"$B${rr}")
    ws["H30"].value = "Fila 42 de esta hoja; alternativas: 100% realista (v3) y 0% mejor caso"

    r = 44
    bloque(ws, r, "6. TABLA 18 DE LA FASE 3 · EQUIPAMIENTO (referencia enlazada al bloque K)")
    encabezado(ws, r + 1, ["Partida", "Fase 3", "Modelo (Supuestos)", "Diferencia", "", "", "", "Fuente y fecha"])
    t18 = [("Dinamómetro de chasis (por taller)", 36749128, "=DinoCLP", "Fase 3, Tabla 18 (Dynojet 2016 + 6% arancel); modelo: Mainline Dyno"),
           ("Elevador (por puesto)", 2150000, "=Elevador", "Fase 3, Tabla 18 ($6.450.000 / 3 dúos)"),
           ("Herramientas (por puesto)", 1200000, "=Herramientas", "Fase 3, Tabla 18 ($3.600.000 / 3 dúos)"),
           ("Escáner automotriz (por taller)", 1429000, "=Escaner", "Fase 3, Tabla 18"),
           ("Bodega de baterías clase 9 (por taller)", 4000000, "=Bodega", "Fase 3, Tabla 18"),
           ("Habilitación del local (por taller)", 15000000, "=Habilitacion", "Fase 3, Tabla 18"),
           ("Mobiliario y computadores (por taller)", 4000000, "=Mobiliario", "Fase 3, Tabla 18")]
    r = 46
    for et, f3, mod, fu in t18:
        fila(r, et, [f3, mod, f"=C{r}-B{r}"], tipo="F", fu=fu)
        r += 1
    r += 1
    bloque(ws, r, "7. TABLA 19 DE LA FASE 3 · GASTOS DE OPERACIÓN (referencia enlazada al bloque L)")
    encabezado(ws, r + 1, ["Partida", "Fase 3", "Modelo (Supuestos)", "Diferencia", "", "", "", "Fuente y fecha"])
    r += 2
    t19 = [("Arriendo por local ($ al mes)", 3600000, "=Arriendo", "Fase 3, Tabla 19", FMT_PESOS),
           ("Servicios básicos por local ($ al mes)", 700000, "=Servicios", "Fase 3, Tabla 19 (año 1 / 14 meses)", FMT_PESOS),
           ("Seguros por local ($ al mes)", 600000, "=Seguros", "Fase 3, Tabla 19 (año 1 / 14 meses)", FMT_PESOS),
           ("Mantención de equipos (% anual)", 0.03, "=MantPct", "Fase 3, Tabla 19", FMT_PCT),
           ("Cursos externos y EPP por técnico nuevo ($)", 750000, "=CursoTec", "Fase 3, Tabla 19", FMT_PESOS),
           ("Plataformas: Habilita, estimador, telemetría ($ al año)", 500000, "=SWHostUSD*Dolar*12+SWResto*12",
            "Fase 3, Tabla 19; modelo: hosting (la mantención de 15% va aparte)", FMT_PESOS)]
    for et, f3, mod, fu, fmt in t19:
        fila(r, et, [f3, mod, f"=C{r}-B{r}"], fmt, "F", fu)
        r += 1
    r += 1
    bloque(ws, r, "8. TABLA 11 DE LA FASE 3 · MARKETING (referencia; el modelo usa el bloque M)")
    encabezado(ws, r + 1, ["Partida", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "Control: Supuestos − Fase 3", "Fuente y fecha"])
    r += 2
    t11 = [("Lanzamiento y demostraciones", [3000000, 0, 0, 0, 0], "MkLanz"),
           ("Pauta digital", [14400000, 18000000, 24000000, 24000000, 30000000], "MkPauta"),
           ("Casos con ahorro medido", [2400000, 4800000, 4800000, 4800000, 4800000], "MkCasos"),
           ("Material para mecánicos y paraderos", [3000000, 2000000, 3500000, 2000000, 3500000], "MkMat"),
           ("Convenios con líneas de colectivos", [0, 0, 4000000, 4000000, 4000000], "MkConv")]
    r0 = r
    for et, v, nom in t11:
        fila(r, et, v + [f"=SUM({nom})-SUM(B{r}:F{r})"], tipo="F", fu="Fase 3, Tabla 11")
        ws[f"G{r}"].fill = PatternFill(None)
        r += 1
    L.control("Datos Fase 3: marketing del modelo contra la Tabla 11", H_F3, f"G{r0}:G{r - 1}")
    fila(r, "Marketing a talleres (red): la Fase 3 tenía $5 M al año desde el año 2; v4: $10 M al abrir la red y $5 M después",
         [0, 5000000, 5000000, 5000000, 5000000], tipo="F", fu="Fase 3, Tabla 11 (cambia: supuesto del equipo)")
    r += 2
    bloque(ws, r, "9. TABLA 16 DE LA FASE 3 · NÓMINA ANUAL (solo control en la hoja 2)")
    encabezado(ws, r + 1, ["Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "", "Fuente y fecha"])
    r += 2
    fila(r, "Nómina anual, costo empresa (incluye bonos)", [151983675, 266509276, 432098841, 575703633, 760679112], tipo="F",
         fu="Informe Fase 3, Tabla 16")
    L.nombre("Tabla16", H_F3, f"$B${r}:$F${r}")
    r += 2
    bloque(ws, r, "10. TABLAS 10 Y 20 DE LA FASE 3 · NO COMPARABLE: la Fase 3 vendía kits a la red y usaba Bass de EE.UU.")
    encabezado(ws, r + 1, ["Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "", "Fuente y fecha"])
    r += 2
    t10 = [("Tabla 10: instalaciones propias", [299, 859, 1618, 2160, 2715]), ("Tabla 10: instalaciones de la red", [0, 375, 1130, 3395, 7909]),
           ("Tabla 10: talleres de la red acumulados", [0, 3, 9, 20, 42]),
           ("Tabla 20: línea propia, ingresos (millones de $)", [1133.9, 3376.2, 6380.3, 8525.5, 10722.2]),
           ("Tabla 20: línea propia, resultado (millones de $)", [-130.2, 152.7, 408, 627.1, 783.2]),
           ("Tabla 20: red, ingresos (millones de $)", [0, 1380.2, 4144.3, 12395.1, 28843.5]),
           ("Tabla 20: red, resultado (millones de $)", [0, 145.6, 435.1, 1270.6, 2933.8])]
    for et, v in t10:
        fila(r, et, v, FMT_DEC1 if "millones" in et else FMT_ENTERO, None, "Fase 3 (no comparable)")
        for k in range(1, 9):
            ws.cell(row=r, column=k).fill = F_GRIS
            ws.cell(row=r, column=k).font = fuente(9, False, GRIS)
        r += 1
    r += 1
    bloque(ws, r, "11. TABLA 7 DE LA FASE 3 · reemplazada por el bloque H de Supuestos")
    r += 1
    fila(r, "Suscripción Habilita de la Fase 3 ($ al mes por técnico)", [35000], tipo=None,
         fu="Fase 3, Tabla 7. Reemplazada por el bloque H ($45.000); corregir en la Fase 5")
    for k in range(1, 9):
        ws.cell(row=r, column=k).fill = F_GRIS
        ws.cell(row=r, column=k).font = fuente(9, False, GRIS)
    ws.freeze_panes = "B6"


# =====================================================================================================
# MENSUAL (motor de cálculo) y ANUAL (espejo)
# =====================================================================================================
N = 72
C0 = 4  # columna D = posición 1 (mes −12)


def mc(i):
    return col(C0 + i - 1)


MENSUAL = []  # (clave, etiqueta, unidad, plantilla, formato, tipo_anual) o ("#", título)


def S_(t):
    MENSUAL.append(("#", t))


def R_(k, et, uni, tpl, fmt=FMT_PESOS, kind="sum"):
    MENSUAL.append((k, et, uni, tpl, fmt, kind))


# ---- definición del motor (plantillas: {clave} = celda del mes; {clave^} = mes anterior; {clave:} = fila completa)
S_("1. CALENDARIO")
R_("mes", "Mes del proyecto (no existe mes 0)", "mes", "=IF({pos}<=12,{pos}-13,{pos}-12)", FMT_MES, "none")
R_("anio", "Año del proyecto", "año", "=IF({mes}<0,0,ROUNDUP({mes}/12,0))", "0", "none")
R_("fecha", "Fecha (mes calendario)", "", "=DATE(Anio0,{pos},1)", FMT_FECHA, "none")
R_("pos", "Posición (1 a 72)", "", "=COLUMN()-COLUMN($C$1)", "0", "none")
R_("mc", "Mes comercial (cuenta desde la apertura de ventas; cambia con el atraso del reglamento)", "mes", "=IF({mes}>=1+Atraso,{mes}-Atraso,0)", "0", "none")
R_("ac", "Año comercial", "año", "=IF({mc}=0,0,ROUNDUP({mc}/12,0))", "0", "none")
R_("kk", "Mes dentro del año comercial", "mes", "=IF({mc}=0,0,{mc}-12*({ac}-1))", "0", "none")
S_("2. DEMANDA (bloque F)")
R_("F", "F(t) acumulada de Bass, t = mes comercial / 12", "%",
   "=IF({mc}=0,0,(1-EXP(-(pBass+qBass)*{mc}/12))/(1+(qBass/pBass)*EXP(-(pBass+qBass)*{mc}/12)))", FMT_PCT3, "end")
R_("dem", "Demanda bruta del mes = m × [F(t) − F(t − 1)] (sin redondear)", "vehículos", "=mBass*({F}-N({F^}))", FMT_DEC1, "sum")
R_("cob", "Cobertura de la biblioteca", "%", "=IF({ac}=0,0,IF({ac}=1,CobAnio1,CobAnio2))", FMT_PCT, "none")
R_("dem_at", "Demanda atendible = demanda × cobertura", "vehículos", "={dem}*{cob}", FMT_DEC1, "sum")
S_("3. CAPACIDAD E INSTALACIONES (bloque G)")
R_("cap", "Capacidad por dúo", "veh./mes", "=IF({mes}<1,0,IF({mes}<=CapMesCambio,CapDuoA,CapDuoB))", FMT_DEC2, "none")
R_("nec", "Dúos necesarios = REDONDEAR.MAS(demanda / (capacidad × regla del 80%))", "dúos",
   "=IF({dem_at}=0,0,ROUNDUP({dem_at}/({cap}*Util),0))", FMT_ENTERO, "end")
R_("duos", "Dúos activos (nunca bajan)", "dúos", "=MAX(N({duos^}),{nec})", FMT_ENTERO, "end")
R_("talleres", "Talleres propios abiertos (máximo 6 dúos por taller)", "talleres", "=IF({duos}=0,0,ROUNDUP({duos}/MaxDuos,0))", FMT_ENTERO, "end")
R_("capm", "Capacidad nominal del mes = dúos × capacidad por dúo", "vehículos", "={duos}*{cap}", FMT_DEC1, "sum")
R_("cap80", "Capacidad planificada (regla del 80%)", "vehículos", "={capm}*Util", FMT_DEC1, "sum")
R_("inst", "Instalaciones = MIN(demanda atendible, capacidad), enteras", "vehículos", "=ROUND(MIN({dem_at},{capm}),0)", FMT_ENTERO, "sum")
R_("util", "Utilización de la capacidad nominal", "%", "=IF({capm}=0,0,{inst}/{capm})", FMT_PCT, "none")
R_("ie", "Instalaciones Esencial = REDONDEAR(instalaciones × (1 − mezcla Plus))", "vehículos", "=ROUND({inst}*(1-Mix),0)", FMT_ENTERO, "sum")
R_("ip", "Instalaciones Plus", "vehículos", "={inst}-{ie}", FMT_ENTERO, "sum")
R_("parque", "Parque instalado acumulado", "vehículos", "=N({parque^})+{inst}", FMT_ENTERO, "end")
R_("prim", "Primeros clientes de un modelo nuevo (enteros, repartidos en el año comercial)", "vehículos",
   "=IF({ac}=0,0,MIN({inst},ROUND(IF({ac}=1,ModNuevos1,ModNuevos2)*{kk}/12,0)-ROUND(IF({ac}=1,ModNuevos1,ModNuevos2)*({kk}-1)/12,0)))",
   FMT_ENTERO, "sum")
S_("4. VENTAS, COBROS Y CRÉDITO DIRECTO (bloques E e I)")
R_("bruto", "Ingreso bruto por instalaciones", "$", "={ie}*PrecioE+{ip}*PrecioP")
R_("descu", "Descuento de 10% al primer cliente de un modelo nuevo", "$", "=IF({inst}=0,0,{prim}*DescPrimer*{bruto}/{inst})")
R_("cred_u", "Ventas con crédito directo (enteras)", "vehículos", "=ROUND({inst}*VtaCred,0)", FMT_ENTERO, "sum")
R_("bono", "Bono financiamiento (5% del precio en las ventas con crédito)", "$", "=IF({inst}=0,0,({bruto}-{descu})*{cred_u}/{inst}*Bono)")
R_("neto", "Ingreso neto por instalaciones", "$", "={bruto}-{descu}-{bono}")
R_("v_cred", "Ventas con crédito (valor neto)", "$", "=IF({inst}=0,0,({bruto}-{descu})*{cred_u}/{inst}-{bono})")
R_("v_cont", "Ventas al contado o con tarjeta (valor neto)", "$", "={neto}-{v_cred}")
R_("abono", "Pie de 30% cobrado (de las instalaciones del mes siguiente)", "$", "=IF({pos}+1>NPos,0,Pie*INDEX({neto:},{pos}+1))")
R_("abono_s", "Abonos recibidos al cierre (pie de ventas aún no instaladas)", "$", "={abono}", FMT_PESOS, "end")
R_("saldo_cont", "Saldo de 70% cobrado a la entrega (contado o tarjeta)", "$", "=(1-Pie)*{v_cont}")
R_("coloc", "Monto financiado con crédito directo (colocación del mes)", "$", "=(1-Pie)*{v_cred}")
R_("cuota", "Cuotas programadas = PAGO × colocaciones vigentes (primera cuota el mes siguiente)", "$",
   '=FactorCuota*SUMIFS({coloc:},{pos:},">="&({pos}-Plazo),{pos:},"<"&{pos})')
R_("inter", "Intereses programados = saldo de la cartera al inicio × tasa real", "$", "=TasaCredReal*N({saldo_b^})")
R_("capi", "Capital programado = cuota − interés", "$", "={cuota}-{inter}")
R_("saldo_b", "Saldo bruto de la cartera de crédito directo", "$", "=N({saldo_b^})-{capi}+{coloc}", FMT_PESOS, "end")
R_("cap_cob", "Capital cobrado (neto de incobrables)", "$", "=(1-Incob)*{capi}")
R_("int_cob", "Ingreso por financiamiento a clientes (intereses cobrados)", "$", "=(1-Incob)*{inter}")
R_("prov", "Provisión de incobrables (3% del monto financiado, en el mes de la venta)", "$", "=Incob*{coloc}")
R_("cxc", "Cuentas por cobrar netas de provisión", "$", "=(1-Incob)*{saldo_b}", FMT_PESOS, "end")
R_("com_mp", "Comisión de medio de pago (2% de las ventas al contado o con tarjeta)", "$", "=ComMP*{v_cont}")
R_("cobrado", "Total cobrado a clientes", "$", "={abono}+{saldo_cont}+{cap_cob}+{int_cob}")
S_("5. COSTOS VARIABLES")
R_("kitc", "Kits instalados (costo directo del kit, punto medio con forward)", "$", "={ie}*KitE+{ip}*KitP")
R_("gar", "Garantía (3% del costo del kit)", "$", "=GarPct*{kitc}")
R_("comis", "Comisiones de venta (con cargas y tope por persona)", "$", "=MIN({inst}*ComInst,{com}*ComTope)*{fac}")
R_("sello", "Sello", "$", "=Sello*{inst}")
R_("refe", "Referidos (enteros)", "$", "=ROUND(RefPct*{inst},0)*RefMonto")
R_("evalc", "Evaluación crediticia", "$", "=EvalCred*{cred_u}")
R_("cv", "Total costos variables (incluye provisión de incobrables y comisión de medio de pago)", "$",
   "={kitc}+{gar}+{comis}+{sello}+{refe}+{evalc}+{prov}+{com_mp}")
S_("6. COMPRAS DE KITS Y PAGOS AL PROVEEDOR (bloque I)")
R_("ped_u", "Kits pedidos (2 meses antes de instalar; el primer pedido cubre los meses 1 y 2)", "kits",
   "=IF({pos}+2>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({inst:},{pos}+2)+IF({pos}+3>NPos,0,INDEX({inst:},{pos}+3)),"
   "IF(INDEX({mc:},{pos}+2)>=3,INDEX({inst:},{pos}+2),0)))", FMT_ENTERO, "sum")
R_("ped_v", "Valor del pedido (costo de los kits)", "$",
   "=IF({pos}+2>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({kitc:},{pos}+2)+IF({pos}+3>NPos,0,INDEX({kitc:},{pos}+3)),"
   "IF(INDEX({mc:},{pos}+2)>=3,INDEX({kitc:},{pos}+2),0)))")
R_("nro", "N.º de pedido", "", '=IF({ped_u}>0,COUNTIF($D${ped_u#}:{ped_u},">0"),0)', FMT_ENTERO, "none")
R_("pago30", "Pago del 30% al pedir", "$", "=ProvAnt*{ped_v}")
R_("pago70", "Pago del 70% (al embarque; desde el 4.º pedido, a 30 días)", "$",
   '=(1-ProvAnt)*(SUMIFS({ped_v:},{pos:},{pos}-1,{nro:},">0",{nro:},"<"&ProvDesde)+SUMIFS({ped_v:},{pos:},{pos}-2,{nro:},">="&ProvDesde))')
R_("pagoprov", "Total pagado al proveedor", "$", "={pago30}+{pago70}")
R_("ped_acum", "Kits pedidos acumulados", "kits", "=N({ped_acum^})+{ped_u}", FMT_ENTERO, "end")
R_("transito", "Kits en tránsito (pedidos y aún no instalados)", "kits",
   "=IF({pos}+1>NPos,0,INDEX({inst:},{pos}+1))+IF({pos}+2>NPos,0,INDEX({inst:},{pos}+2))"
   "+IF({pos}+3>NPos,0,IF(INDEX({mc:},{pos}+2)=1,INDEX({inst:},{pos}+3),0))", FMT_ENTERO, "end")
R_("ctrl_ped", "Control: pedidos acumulados − parque − tránsito (debe dar 0)", "kits", "={ped_acum}-{parque}-{transito}", FMT_ENTERO, "none")
R_("kits_pag", "Saldo de kits pagados y aún no instalados", "$", "=ROUND(N({kits_pag^})+{pagoprov}-{kitc},2)", FMT_PESOS, "end")
S_("7. NÓMINA POR CARGO (bloque J): personas y costo empresa")
R_("fac", "Factor de costo empresa (Ley 21.735)", "×", "=LOOKUP({fecha},FactDesde,FactValor)", "0.0000", "none")
R_("gg", "Gerente General", "personas", "=IF({mes}>=1,1,0)", FMT_ENTERO, "end")
R_("rt", "Responsable Técnico (taller 1 desde el mes −9; los demás 3 meses antes de abrir)", "personas",
   "=MAX(IF({mes}>=MesPEIni,1,0),INDEX({talleres:},MIN({pos}+AntRT,NPos)))", FMT_ENTERO, "end")
R_("ing", "Ingeniería de Calibración", "personas", "=IF({mes}<MesPEIni,0,IF({anio}>=IngSegAnio,2,1))", FMT_ENTERO, "end")
R_("adm", "Administración y Personas", "personas", "=IF({mes}>=MesPreIni,1,0)", FMT_ENTERO, "end")
R_("com", "Comercial y Postventa (1 + 1 por cada 600 instalaciones del año comercial)", "personas",
   "=IF({mc}<1,0,1+ROUNDDOWN(SUMIFS({inst:},{ac:},{ac})/ComPorInst,0))", FMT_ENTERO, "end")
R_("aspost", "Asistente de Postventa", "personas",
   "=IF({parque}>AsPostUmbral,1+ROUNDDOWN(({parque}-AsPostUmbral)/AsPostPaso,0),0)", FMT_ENTERO, "end")
R_("comemp", "Comercial de Empresas (red con 5 talleres o más)", "personas", "=IF({red_act}>=ComEmpUmbral,1,0)", FMT_ENTERO, "end")
R_("plat_h", "Administrador de plataforma y red: honorarios part-time", "personas",
   "=IF(AND({red_act}>=1,{red_act}<AdmPlatUmbral),1,0)", FMT_ENTERO, "end")
R_("plat_f", "Administrador de plataforma y red: jornada completa", "personas", "=IF({red_act}>=AdmPlatUmbral,1,0)", FMT_ENTERO, "end")
R_("sop", "Soporte técnico de red (1 por cada 15 talleres)", "personas", "=IF({red_act}=0,0,ROUNDUP({red_act}/SopPaso,0))", FMT_ENTERO, "end")
R_("hires", "Técnicos que ingresan (2 meses antes de que su dúo empiece a instalar)", "personas",
   "=TecDuo*(INDEX({duos:},MIN({pos}+AntTec,NPos))-INDEX({duos:},MIN({pos}+AntTec-1,NPos)))", FMT_ENTERO, "sum")
R_("first", "Posición del primer ingreso de técnicos", "", "=IF(N({first^})>0,N({first^}),IF({hires}>0,{pos},0))", "0", "none")
R_("tsen", "Meses desde el ingreso del primer dúo", "meses", "=IF({first}=0,-1,{pos}-{first})", "0", "none")
R_("gen", "Nivel genérico del técnico senior del primer dúo", "nivel",
   "=IF({tsen}<0,0,IF({tsen}<MesesN1,1,IF({tsen}<MesesN1+MesesN2,2,IF({tsen}<MesesN1+MesesN2+MesesN3,3,4))))", "0", "none")
R_("efe", "Nivel efectivo del técnico senior (abre como N3)", "nivel",
   "=IF({tsen}<0,0,IF({tsen}+SeniorExtra<MesesN1,1,IF({tsen}+SeniorExtra<MesesN1+MesesN2,2,IF({tsen}+SeniorExtra<MesesN1+MesesN2+MesesN3,3,4))))",
   "0", "none")
R_("N1", "Técnicos N1", "personas", '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1),{pos:},"<="&{pos})-({gen}=1)+({efe}=1)', FMT_ENTERO, "end")
R_("N2", "Técnicos N2", "personas",
   '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1-MesesN2),{pos:},"<="&({pos}-MesesN1))-({gen}=2)+({efe}=2)', FMT_ENTERO, "end")
R_("N3", "Técnicos N3", "personas",
   '=SUMIFS({hires:},{pos:},">"&({pos}-MesesN1-MesesN2-MesesN3),{pos:},"<="&({pos}-MesesN1-MesesN2))-({gen}=3)+({efe}=3)', FMT_ENTERO, "end")
R_("N4", "Técnicos N4", "personas", '=SUMIFS({hires:},{pos:},"<="&({pos}-MesesN1-MesesN2-MesesN3))-({gen}=4)+({efe}=4)', FMT_ENTERO, "end")
R_("tec", "Técnicos: total", "personas", "={N1}+{N2}+{N3}+{N4}", FMT_ENTERO, "end")
R_("ctrl_tec", "Control: técnicos − 2 × dúos que instalarán en 2 meses (debe dar 0)", "personas",
   "={tec}-TecDuo*INDEX({duos:},MIN({pos}+AntTec,NPos))", FMT_ENTERO, "none")
R_("asadm", "Asistente de Administración (dotación sobre 25)", "personas",
   "=IF({gg}+{rt}+{ing}+{adm}+{com}+{aspost}+{comemp}+{plat_h}+{plat_f}+{sop}+{tec}>AsAdmUmbral,1,0)", FMT_ENTERO, "end")
R_("dot", "Dotación total", "personas", "={gg}+{rt}+{ing}+{adm}+{com}+{aspost}+{comemp}+{plat_h}+{plat_f}+{sop}+{tec}+{asadm}", FMT_ENTERO, "end")
R_("c_gg", "Gerente General: costo empresa", "$", "={gg}*R_GG*{fac}")
R_("c_rt", "Responsable Técnico: costo empresa", "$", "={rt}*R_RT*{fac}")
R_("c_ing", "Ingeniería de Calibración: costo empresa", "$", "={ing}*R_Ing*{fac}")
R_("c_adm", "Administración y Personas: costo empresa", "$", "={adm}*R_Adm*{fac}")
R_("c_com", "Comercial y Postventa: costo empresa (sin comisión)", "$", "={com}*R_Com*{fac}")
R_("c_aspost", "Asistente de Postventa: costo empresa", "$", "={aspost}*R_AsPost*{fac}")
R_("c_asadm", "Asistente de Administración: costo empresa", "$", "={asadm}*R_AsAdm*{fac}")
R_("c_comemp", "Comercial de Empresas: costo empresa", "$", "={comemp}*R_ComEmp*{fac}")
R_("c_plat", "Administrador de plataforma y red: honorarios (sin factor) o costo empresa", "$", "={plat_h}*R_PlatHon+{plat_f}*R_PlatFull*{fac}")
R_("c_sop", "Soporte técnico de red: costo empresa", "$", "={sop}*R_Sop*{fac}")
R_("c_tec", "Técnicos N1 a N4: costo empresa", "$", "=({N1}*RentaN1+{N2}*RentaN2+{N3}*RentaN3+{N4}*RentaN4)*{fac}")
R_("c_bonos", "Bonos únicos al validar nivel (con cargas)", "$",
   "=(BonoN2*SUMIFS({hires:},{pos:},{pos}-MesesN1)+BonoN3*SUMIFS({hires:},{pos:},{pos}-MesesN1-MesesN2)"
   "+BonoN4*SUMIFS({hires:},{pos:},{pos}-MesesN1-MesesN2-MesesN3))*{fac}")
R_("nom_op", "Subtotal operación del taller propio (RT, Ingeniería, técnicos, bonos y postventa)", "$",
   "={c_rt}+{c_ing}+{c_tec}+{c_bonos}+{c_aspost}")
R_("nom_adm", "Subtotal administración (GG, Administración y Personas, asistente)", "$", "={c_gg}+{c_adm}+{c_asadm}")
R_("nom_ven", "Subtotal ventas del taller propio (Comercial y Postventa)", "$", "={c_com}")
R_("nom_red", "Subtotal red (Comercial de Empresas, plataforma y soporte)", "$", "={c_comemp}+{c_plat}+{c_sop}")
R_("nomina", "Total nómina", "$", "={nom_op}+{nom_adm}+{nom_ven}+{nom_red}")
S_("8. RED DE TALLERES (bloque H): se cobra por taller")
R_("red_ent", "Talleres incorporados en el año comercial hasta este mes (reparto parejo)", "talleres",
   "=IF({ac}=0,0,MIN(INDEX(RedNuevos,{ac}),MAX(0,ROUNDUP(ROUND(1+({kk}-0.5)*INDEX(RedNuevos,{ac})/12,9),0)-1)))", FMT_ENTERO, "none")
R_("red_n", "Talleres nuevos de la red en el mes", "talleres", "=IF({kk}<=1,{red_ent},{red_ent}-N({red_ent^}))", FMT_ENTERO, "sum")
R_("red_act", "Talleres de la red activos", "talleres", "=N({red_act^})+{red_n}", FMT_ENTERO, "end")
R_("red_paq", "Ingreso: paquetes de entrada (derecho + formación de 2 técnicos)", "$", "={red_n}*RedPaquete")
R_("red_cuota", "Ingreso: suscripción, cuota base", "$", "={red_act}*RedCuota")
R_("red_habi", "Ingreso: suscripción, Lumine Habilita (2 técnicos por taller)", "$", "={red_act}*RedHab*RedTec")
R_("red_aran", "Ingreso: arancel del 3CV cobrado al costo", "$", "={red_n}*RedModelos*RedArancel")
R_("red_ing", "Total ingresos de la red", "$", "={red_paq}+{red_cuota}+{red_habi}+{red_aran}")
R_("red_c_curso", "Costo: curso externo de alta tensión (2 técnicos al entrar)", "$", "={red_n}*RedTec*RedCursoAT")
R_("red_c_audit", "Costo: auditoría anual con viaje (proporcional al mes)", "$", "={red_act}*RedAudit/12")
R_("red_c_com", "Costo: comisión de 5% del paquete (con cargas)", "$", "=RedComPct*{red_paq}*{fac}")
R_("red_c_aran", "Costo: arancel del 3CV pagado", "$", "={red_aran}")
R_("red_cdir", "Total costos directos de la red (sin personal ni marketing)", "$", "={red_c_curso}+{red_c_audit}+{red_c_com}+{red_c_aran}")
S_("9. GASTOS FIJOS Y MARKETING (bloques K, L y M)")
R_("locales", "Locales con arriendo (taller 1 desde el mes −9; los demás 2 meses antes de abrir)", "locales",
   "=MAX(IF({mes}>=ArrT1Desde,1,0),INDEX({talleres:},MIN({pos}+AntArr,NPos)))", FMT_ENTERO, "end")
R_("arr", "Arriendo", "$", "={locales}*Arriendo")
R_("serv", "Servicios básicos", "$", "={locales}*Servicios")
R_("seg", "Seguros", "$", "={locales}*Seguros")
R_("mant", "Mantención de equipos (3% anual del equipamiento acumulado)", "$", "=IF({mes}<1,0,MantPct/12*N({eq_acum^}))")
R_("cursos", "Cursos externos y EPP de técnicos nuevos", "$", "=CursoTec*{hires}")
R_("soft", "Software: mantención 15% anual + hosting + resto", "$", "=IF({mes}<1,0,SWMant*SWDev/12+SWHostUSD*Dolar+SWResto)")
R_("lanz", "Marketing: lanzamiento", "$", "=IF(AND({ac}=1,{kk}<=LanzMeses),INDEX(MkLanz,1)/LanzMeses,0)")
R_("pauta", "Marketing: pauta digital (año comercial 1: 50% en los meses 1 a 3)", "$",
   "=IF({ac}=0,0,IF({ac}=1,IF({kk}<=PautaMeses,INDEX(MkPauta,1)*PautaPct/PautaMeses,INDEX(MkPauta,1)*(1-PautaPct)/(12-PautaMeses)),INDEX(MkPauta,{ac})/12))")
R_("casos", "Marketing: casos con ahorro medido (año comercial 1: meses 4 a 6)", "$",
   "=IF({ac}=0,0,IF({ac}=1,IF(AND({kk}>=CasosIni,{kk}<=CasosFin),INDEX(MkCasos,1)/(CasosFin-CasosIni+1),0),INDEX(MkCasos,{ac})/12))")
R_("mat", "Marketing: material para mecánicos y paraderos", "$", "=IF({ac}=0,0,INDEX(MkMat,{ac})/12)")
R_("conv", "Marketing: convenios con líneas de colectivos", "$", "=IF({ac}=0,0,INDEX(MkConv,{ac})/12)")
R_("mk", "Marketing del taller propio (total)", "$", "={lanz}+{pauta}+{casos}+{mat}+{conv}")
R_("mk_red", "Marketing a talleres (red)", "$", "=IF({ac}=0,0,INDEX(MkRed,{ac})/12)")
R_("fijos", "Total gastos fijos del taller propio (incluye marketing)", "$", "={arr}+{serv}+{seg}+{mant}+{cursos}+{soft}+{mk}")
S_("10. INVERSIÓN DEL MES (bloque K)")
R_("t_eq", "Talleres con equipamiento comprado (taller 1 en el mes −9; los demás 3 meses antes de abrir)", "talleres",
   "=MAX(IF({mes}>=MesEqT1,1,0),INDEX({talleres:},MIN({pos}+AntEq,NPos)))", FMT_ENTERO, "end")
R_("t_eq_n", "Talleres equipados en el mes", "talleres", "={t_eq}-N({t_eq^})", FMT_ENTERO, "sum")
R_("d_eq", "Puestos de dúo equipados (el primero, para el Proyecto Experimental)", "puestos", "=MAX(IF({mes}>=MesEqT1,1,0),{duos})", FMT_ENTERO, "end")
R_("d_eq_n", "Puestos equipados en el mes", "puestos", "={d_eq}-N({d_eq^})", FMT_ENTERO, "sum")
R_("inv_t", "Equipamiento de talleres", "$", "={t_eq_n}*EqTaller")
R_("inv_d", "Equipamiento de puestos (elevador y herramientas)", "$", "={d_eq_n}*EqDuo")
R_("repo", "Reposición de herramientas (al cumplir su vida útil)", "$", "=Herramientas*SUMIFS({d_eq_n:},{pos:},{pos}-V_Herr*12)")
R_("pe_kits", "Proyecto Experimental: kits Plus (lote piloto a costo realista)", "$", "=IF({mes}=MesPEIni,PEKits*KitP_Real,0)")
R_("pe_otros", "Proyecto Experimental: notaría y seguro de responsabilidad civil", "$", "=IF({mes}=MesTramIni,PENotaria+PESeguro,0)")
R_("sw", "Desarrollo de software (parejo entre los meses −9 y −1)", "$",
   '=IF(AND({mes}>=SWIni,{mes}<=SWFin),SWDev/COUNTIFS({mes:},">="&SWIni,{mes:},"<="&SWFin),0)')
R_("idm", "I+D (bruto)", "$", "=IF({mes}<1,0,INDEX(IDAnio,{anio})/12)")
R_("id_neto", "I+D neto de subsidio (CORFO solo si se activa en Anexos)", "$", "={idm}*(1-IDSub)")
R_("garr", "Garantía de arriendo de locales nuevos (recuperable)", "$", "=({locales}-N({locales^}))*GarArrMeses*Arriendo")
R_("const", "Constitución de la SpA y marca", "$", "=IF({pos}=1,Constitucion,0)")
R_("preop_nom", "Puesta en marcha: nómina de los meses negativos", "$", "=IF({mes}<1,{nomina},0)")
R_("preop_loc", "Puesta en marcha: arriendo, servicios y seguros previos", "$", "=IF({mes}<1,{arr}+{serv}+{seg},0)")
R_("preop_cur", "Puesta en marcha: cursos y EPP de técnicos previos", "$", "=IF({mes}<1,{cursos},0)")
R_("inv_mes", "Inversión total del mes", "$",
   "={inv_t}+{inv_d}+{repo}+{pe_kits}+{pe_otros}+{sw}+{id_neto}+{garr}+{const}+{preop_nom}+{preop_loc}+{preop_cur}")
R_("eq_acum", "Equipamiento acumulado (base de la mantención)", "$", "=N({eq_acum^})+{inv_t}+{inv_d}+{repo}", FMT_PESOS, "end")
S_("11. RESULTADO Y CAJA DE OPERACIÓN")
R_("ingresos", "Ingresos (instalaciones netas + financiamiento + red)", "$", "={neto}+{int_cob}+{red_ing}")
R_("costos_op", "Nómina, gastos fijos y costos de la red (desde el mes 1; antes se capitalizan)", "$",
   "=IF({mes}<1,0,{nomina}+{fijos}+{red_cdir}+{mk_red})")
R_("ebitda", "EBITDA del mes", "$", "={ingresos}-{cv}-{costos_op}")
R_("fco", "Flujo de caja operativo del mes (cobros − pagos)", "$",
   "={cobrado}+{red_ing}-{pagoprov}-({gar}+{comis}+{sello}+{refe}+{evalc}+{com_mp})-{costos_op}")
R_("acum", "Saldo acumulado de caja operativa (déficit si es negativo)", "$", "=N({acum^})+{fco}", FMT_PESOS, "end")
R_("ebitda_ac", "Composición: resultado acumulado (EBITDA)", "$", "=N({ebitda_ac^})+{ebitda}", FMT_PESOS, "end")
R_("ctrl_caja", "Control: saldo − (resultado − kits pagados − cuentas por cobrar + abonos) (debe dar 0)", "$",
   "=ROUND({acum}-({ebitda_ac}-{kits_pag}-{cxc}+{abono}),0)", FMT_PESOS, "none")
R_("saldo_ct", "Saldo de capital de trabajo = kits pagados + cuentas por cobrar − abonos", "$", "={kits_pag}+{cxc}-{abono}", FMT_PESOS, "end")


def hoja_mensual(L):
    ws = L.ws[H_MEN]
    hoja_base(ws, 85)
    ws.page_setup.fitToWidth = 6  # 12 meses por página al imprimir
    titulo_hoja(ws, f"MENSUAL (AÑOS 0 A 5) · meses −12 a −1 y 1 a 60 · {UNIDAD}", [
        "Qué calcula: mes a mes, la demanda (Bass), dúos, talleres, instalaciones, ventas y crédito directo, kits, nómina por cargo, red, gastos, inversión y caja.",
        "De dónde toma: Supuestos y Datos Fase 3 (nombres definidos). Todas las celdas de una fila tienen la misma fórmula.",
        "A qué hoja entrega: Anual (suma o saldo al cierre de cada año) y 3. Capital de Trabajo (meses −12 a 12).",
    ], 10)
    ws.column_dimensions["A"].width = 66
    ws.column_dimensions["B"].width = 10
    ws.column_dimensions["C"].width = 2
    for i in range(1, N + 1):
        ws.column_dimensions[mc(i)].width = 11.5
    filas, r = {}, 6
    for e in MENSUAL:
        if e[0] == "#":
            r += 1
            filas["#" + e[1]] = r
            r += 1
            continue
        filas[e[0]] = r
        r += 1
    L.filas_men = filas
    L.nombre("NPos", H_MEN, "$D$9:$BW$9")  # se redefine abajo como COLUMNS
    patron = re.compile(r"\{([A-Za-z0-9_]+)(\^|:|#)?\}")

    def render(tpl, i):
        def rep(m):
            k, suf = m.group(1), m.group(2)
            rr = filas[k]
            if suf == "^":
                return f"{mc(i - 1) if i > 1 else 'C'}{rr}"
            if suf == ":":
                return f"${mc(1)}${rr}:${mc(N)}${rr}"
            if suf == "#":
                return str(rr)
            return f"{mc(i)}{rr}"
        return patron.sub(rep, tpl)

    for e in MENSUAL:
        if e[0] == "#":
            bloque(ws, filas["#" + e[1]], e[1], 3)
            continue
        k, et, uni, tpl, fmt, kind = e
        rr = filas[k]
        ctrl = k.startswith("ctrl")
        total = k in ("neto", "cv", "nomina", "fijos", "inv_mes", "ebitda", "red_ing", "cobrado", "saldo_ct", "tec", "dot", "inst", "duos")
        celda(ws, f"A{rr}", et, negrita=total, alin=IZQ, borde=B_FILA)
        celda(ws, f"B{rr}", uni, color=GRIS, tam=9, borde=B_FILA)
        for i in range(1, N + 1):
            c = ws.cell(row=rr, column=C0 + i - 1, value=render(tpl, i))
            c.number_format = fmt
            c.font = fuente(9, total, TINTA)
            c.border = B_TOTAL if total else B_FILA
        if ctrl:
            L.control(f"Mensual: {et}", H_MEN, f"{mc(1)}{rr}:{mc(N)}{rr}")
        if fmt == FMT_ENTERO and uni != "$":  # unidades físicas (kits, vehículos, dúos, talleres, personas)
            L.entero(f"Mensual: {et}", H_MEN, f"{mc(1)}{rr}:{mc(N)}{rr}")
    # encabezados de calendario destacados
    for k in ("mes", "anio", "fecha"):
        for i in range(1, N + 1):
            c = ws.cell(row=filas[k], column=C0 + i - 1)
            c.font = fuente(9, True, "FFFFFFFF" if k == "mes" else TINTA)
            if k == "mes":
                c.fill = F_ENC
            c.alignment = CEN
    for k in ("pos", "mc", "ac", "kk", "first", "tsen", "gen", "efe", "red_ent"):
        ws.row_dimensions[filas[k]].outlineLevel = 1
    ws.freeze_panes = ws[f"D{filas['fecha'] + 1}"]
    del L.nombres["NPos"]
    L.nombres["NPos"] = f"COLUMNS({q(H_MEN)}!$D${filas['mes']}:$BW${filas['mes']})"
    # renombra la fila de posición para COLUMN(): usa $C$1 como origen (columna C)
    ws.print_title_cols = "A:B"
    ws.print_title_rows = f"{filas['mes']}:{filas['fecha']}"


def hoja_anual(L):
    ws = L.ws[H_ANU]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"ANUAL (AÑOS 0 A 5) · las mismas filas de Mensual, una columna por año · {UNIDAD}", [
        "Qué calcula: para cada fila de Mensual, la suma del año (flujos) o el saldo al cierre del año (personas, dúos, talleres, saldos).",
        "De dónde toma: Mensual (SUMAR.SI por año del proyecto o INDICE del último mes del año).",
        "A qué hoja entrega: 1. Inversión, 2. Ingresos y Costos, 3. Capital de Trabajo, 4 y 5. Flujos, 7. Punto de Equilibrio y Dashboard.",
    ], 9)
    ws.column_dimensions["A"].width = 66
    ws.column_dimensions["B"].width = 10
    for k in range(3, 9):
        ws.column_dimensions[col(k)].width = 15
    ws.column_dimensions["I"].width = 14
    fm = L.filas_men
    r = 5
    encabezado(ws, r, ["Concepto", "Unidad"] + [""] * 6 + ["Suma o cierre"])
    for y in range(6):
        c = ws.cell(row=r, column=3 + y, value="=COLUMN()-COLUMN($C$5)")
        c.number_format = '"Año "0'
    r = 6
    for y in range(6):
        celda(ws, f"{col(3 + y)}{r}", f"=Anio0+{col(3 + y)}5", "0", tam=9, color=GRIS, alin=CEN)
    filas = {}
    r = 7
    anio_rng = f"{q(H_MEN)}!$D${fm['anio']}:$BW${fm['anio']}"
    for e in MENSUAL:
        if e[0] == "#":
            r += 1
            bloque(ws, r, e[1], 9)
            r += 1
            continue
        k, et, uni, tpl, fmt, kind = e
        if kind == "none":
            continue
        filas[k] = r
        total = k in ("neto", "cv", "nomina", "fijos", "inv_mes", "ebitda", "red_ing", "cobrado", "saldo_ct", "tec", "dot", "inst", "duos")
        celda(ws, f"A{r}", et, negrita=total, borde=B_FILA)
        celda(ws, f"B{r}", uni, color=GRIS, tam=9, borde=B_FILA)
        rng = f"{q(H_MEN)}!$D${fm[k]}:$BW${fm[k]}"
        for y in range(6):
            cc = col(3 + y)
            if kind == "sum":
                f = f"=SUMIF({anio_rng},{cc}$5,{rng})"
            else:
                f = f"=INDEX({rng},12*{cc}$5+12)"
            celda(ws, f"{cc}{r}", f, fmt, negrita=total, borde=B_TOTAL if total else B_FILA)
        celda(ws, f"I{r}", "suma" if kind == "sum" else "cierre", color=GRIS, tam=8, alin=CEN, borde=B_FILA)
        if fmt == FMT_ENTERO and uni != "$":
            L.entero(f"Anual: {et}", H_ANU, f"C{r}:H{r}")
        r += 1
    # filas derivadas
    r += 1
    bloque(ws, r, "INDICADORES FÍSICOS DERIVADOS", 9)
    r += 1
    filas["util_a"] = r
    celda(ws, f"A{r}", "Utilización de la capacidad nominal (instalaciones / capacidad del año)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"=IF({cc}{filas['capm']}=0,0,{cc}{filas['inst']}/{cc}{filas['capm']})", FMT_PCT, borde=B_FILA)
    r += 1
    filas["util80_a"] = r
    celda(ws, f"A{r}", "Utilización de la capacidad planificada al 80% (instalaciones / capacidad al 80%)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"=IF({cc}{filas['cap80']}=0,0,{cc}{filas['inst']}/{cc}{filas['cap80']})", FMT_PCT, borde=B_FILA)
    r += 1
    filas["dif80"] = r
    celda(ws, f"A{r}", "Capacidad sobre la regla del 80% por dúos enteros (capacidad − instalaciones / 80%)", borde=B_FILA)
    for y in range(6):
        cc = col(3 + y)
        celda(ws, f"{cc}{r}", f"={cc}{filas['capm']}-{cc}{filas['inst']}/Util", FMT_ENTERO, borde=B_FILA)
    L.filas_anu = filas
    ws.freeze_panes = "C7"


def A(L, k, y):
    return f"{q(H_ANU)}!{col(3 + y)}{L.filas_anu[k]}"


# =====================================================================================================
# HOJA 1. INVERSIÓN
# =====================================================================================================
def hoja_1(L):
    ws = L.ws[H1]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"1. INVERSIÓN · año 0, reinversiones, depreciación y valor de desecho · {UNIDAD}", [
        "Qué calcula: la inversión del año 0 (meses −12 a −1) y las reinversiones de los años 1 a 5 por ítem, la depreciación y amortización deflactadas y el valor de desecho contable.",
        "De dónde toma: Anual (equipamiento, Proyecto Experimental, software, puesta en marcha, I+D y garantías), 3. Capital de Trabajo y Supuestos (vidas útiles, inflación, Ku).",
        "A qué hoja entrega: 4. Flujo Puro y 5. Flujo Apalancado. Solo desembolsos únicos de puesta en marcha: los gastos permanentes van a la hoja 2.",
    ], 10)
    for c, w in zip("ABCDEFGHIJ", [58, 10, 14, 15, 14, 14, 14, 14, 14, 15]):
        ws.column_dimensions[c].width = w
    r = 6
    celda(ws, "A6", "Año del proyecto", negrita=True, tam=9, color=GRIS)
    for y in range(6):
        celda(ws, f"{col(4 + y)}6", "=COLUMN()-COLUMN($D$6)", "0", negrita=True, tam=9, color=GRIS, alin=CEN)
    L.nombre("H1_Anios", H1, "$D$6:$I$6")
    r = 7
    bloque(ws, r, "A Y C. INVERSIÓN DEL AÑO 0 Y REINVERSIONES DE LOS AÑOS 1 A 5, POR ÍTEM (sin capitalizar)", 10)
    encabezado(ws, 8, ["Ítem", "Vida útil", "Clasificación"] + [f"Año {y}" for y in range(6)] + ["Total"])
    items = [
        ("dino", "Dinamómetro de chasis", "=V_Dino", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*DinoCLP"),
        ("esc", "Escáner automotriz", "=V_Esc", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Escaner"),
        ("bod", "Bodega de baterías clase 9", "=V_Bod", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Bodega"),
        ("hab", "Habilitación del local", "=V_Hab", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Habilitacion"),
        ("mob", "Mobiliario y computadores", "=V_Mob", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Mobiliario"),
        ("elev", "Elevadores (uno por puesto de dúo)", "=V_Elev", "Depreciable", lambda y: f"={A(L, 'd_eq_n', y)}*Elevador"),
        ("herr", "Herramientas (por puesto, con reposición a los 3 años)", "=V_Herr", "Depreciable",
         lambda y: f"={A(L, 'd_eq_n', y)}*Herramientas+{A(L, 'repo', y)}"),
        ("pek", "Proyecto Experimental: 6 kits Plus (lote piloto)", "=V_Int", "Amortizable", lambda y: f"={A(L, 'pe_kits', y)}"),
        ("peo", "Proyecto Experimental: notaría y seguro de RC", "=V_Int", "Amortizable", lambda y: f"={A(L, 'pe_otros', y)}"),
        ("sw", "Desarrollo de software (Habilita, web y estimador, control)", "=V_Int", "Amortizable", lambda y: f"={A(L, 'sw', y)}"),
        ("pnom", "Puesta en marcha: nómina de los meses negativos", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_nom', y)}"),
        ("ploc", "Puesta en marcha: arriendo, servicios y seguros previos", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_loc', y)}"),
        ("pcur", "Puesta en marcha: cursos y EPP de técnicos previos", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_cur', y)}"),
        ("const", "Constitución de la SpA y marca", "=V_Int", "Amortizable", lambda y: f"={A(L, 'const', y)}"),
        ("id", "I+D (neto de subsidio CORFO si se activa en Anexos)", "=V_Int", "Amortizable", lambda y: f"={A(L, 'id_neto', y)}"),
        ("garr", "Garantía de arriendo", None, "Recuperable", lambda y: f"={A(L, 'garr', y)}"),
    ]
    fi = {}
    r = 9
    for k, et, vida, cl, fn in items:
        fi[k] = r
        celda(ws, f"A{r}", et, borde=B_FILA)
        if vida:
            celda(ws, f"B{r}", vida, "0", alin=CEN, borde=B_FILA)
        else:
            ws[f"B{r}"].border = B_FILA
        celda(ws, f"C{r}", cl, tam=9, color=GRIS, alin=CEN, borde=B_FILA)
        for y in range(6):
            celda(ws, f"{col(4 + y)}{r}", fn(y), FMT_PESOS, borde=B_FILA)
        celda(ws, f"J{r}", f"=SUM(D{r}:I{r})", FMT_PESOS, borde=B_FILA)
        r += 1
    r_sub = r
    celda(ws, f"A{r}", "Subtotal activos, intangibles y garantías", negrita=True, borde=B_TOTAL)
    for y in range(7):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}9:{cc}{r - 1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    ws[f"B{r}"].border = ws[f"C{r}"].border = B_TOTAL
    L.nombre("Inv_Act", H1, f"$D${r}:$I${r}")
    r += 1
    r_ct = r
    celda(ws, f"A{r}", "Capital de trabajo (inversión al cierre del año; hoja 3)", borde=B_FILA)
    celda(ws, f"C{r}", "Recuperable", tam=9, color=GRIS, alin=CEN, borde=B_FILA)
    for y in range(6):
        celda(ws, f"{col(4 + y)}{r}", f"=INDEX(CT_Inv,{y + 1})", FMT_PESOS, borde=B_FILA)
    celda(ws, f"J{r}", f"=SUM(D{r}:I{r})", FMT_PESOS, borde=B_FILA)
    r += 1
    celda(ws, f"A{r}", "Total inversión del año (sin capitalizar)", negrita=True, borde=B_TOTAL)
    for y in range(7):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"={cc}{r_sub}+{cc}{r_ct}", FMT_PESOS, negrita=True, borde=B_TOTAL)
    r += 1
    celda(ws, f"A{r}", "Control: subtotal − inversión del mes de Mensual (debe dar 0)", tam=9, color=GRIS)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=ROUND({cc}{r_sub}-{A(L, 'inv_mes', y)},0)", FMT_PESOS, tam=9)
    L.control("1. Inversión: tabla por ítem contra Mensual", H1, f"D{r}:I{r}")
    r += 1
    celda(ws, f"A{r}", "Crédito tributario I+D, Ley 20.241 (solo si se activa en Anexos)", tam=9, color=GRIS)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=IDCred*{cc}{fi['id']}", FMT_PESOS, tam=9)
    L.nombre("CredID", H1, f"$D${r}:$I${r}")

    # ---- B. calendario año 0
    r += 2
    bloque(ws, r, "B. CALENDARIO DE DESEMBOLSOS DEL AÑO 0, CAPITALIZADO AL MES 0 CON Ku PROVISORIA (costo de oportunidad de la preinversión)", 16)
    r += 1
    rb = r
    encabezado(ws, r, ["Concepto"] + [""] * 2 + [f"Mes {m}" for m in range(-12, 0)] + ["Total"], 1)
    fm = L.filas_men
    r += 1
    celda(ws, f"A{r}", "Desembolso de inversión del mes (incluye puesta en marcha)", borde=B_FILA)
    for k in range(12):
        celda(ws, f"{col(4 + k)}{r}", f"={q(H_MEN)}!{mc(k + 1)}{fm['inv_mes']}", FMT_PESOS, borde=B_FILA)
    celda(ws, f"P{r}", f"=SUM(D{r}:O{r})", FMT_PESOS, negrita=True, borde=B_FILA)
    r_des = r
    r += 1
    celda(ws, f"A{r}", "Factor de capitalización = (1 + Ku)^(meses que faltan para el mes 0 / 12)", borde=B_FILA)
    for k in range(12):
        celda(ws, f"{col(4 + k)}{r}", f"=(1+Ku)^(-{q(H_MEN)}!{mc(k + 1)}{fm['mes']}/12)", "0.0000", borde=B_FILA)
    r_fac = r
    r += 1
    celda(ws, f"A{r}", "Desembolso capitalizado al mes 0", negrita=True, borde=B_TOTAL)
    for k in range(12):
        cc = col(4 + k)
        celda(ws, f"{cc}{r}", f"={cc}{r_des}*{cc}{r_fac}", FMT_PESOS, borde=B_TOTAL)
    celda(ws, f"P{r}", f"=SUM(D{r}:O{r})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Inv0Cap", H1, f"$P${r}")
    r_cap = r
    for k in range(13):
        ws.column_dimensions[col(11 + k)].width = max(ws.column_dimensions[col(11 + k)].width or 0, 13)
    r += 1
    celda(ws, f"A{r}", "Costo de oportunidad de la preinversión (capitalizado − nominal)", borde=B_FILA)
    celda(ws, f"P{r}", f"=P{r_cap}-P{r_des}", FMT_PESOS, borde=B_FILA)
    r += 1
    celda(ws, f"A{r}", "Control: total sin capitalizar − subtotal de activos del año 0 (debe dar 0)", tam=9, color=GRIS)
    celda(ws, f"P{r}", f"=ROUND(P{r_des}-D{r_sub},0)", FMT_PESOS, tam=9)
    L.control("1. Inversión: calendario del año 0 contra la tabla", H1, f"P{r}")
    r += 1
    celda(ws, f"A{r}", "INVERSIÓN DEL AÑO 0 PARA EL FLUJO = activos capitalizados + capital de trabajo", negrita=True, borde=B_TOTAL)
    celda(ws, f"P{r}", f"=Inv0Cap+INDEX(CT_Inv,1)", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Inv0_Total", H1, f"$P${r}")

    # ---- D. depreciación
    r += 2
    bloque(ws, r, "D. DEPRECIACIÓN Y AMORTIZACIÓN POR AÑO, DEFLACTADAS (lineal, desde el año siguiente a la compra; costo histórico llevado a pesos constantes)", 10)
    r += 1
    encabezado(ws, r, ["Ítem", "Vida útil", ""] + [f"Año {y}" for y in range(6)] + [""])
    r += 1
    r_idx = r
    celda(ws, f"A{r}", "Índice de precios (año 0 = 1)", borde=B_FILA)
    celda(ws, f"D{r}", "=1", "0.0000", borde=B_FILA)
    for y in range(1, 6):
        celda(ws, f"{col(4 + y)}{r}", f"={col(3 + y)}{r}*(1+INDEX(Infl,{y + 1}))", "0.0000", borde=B_FILA)
    L.nombre("IdxP", H1, f"$D${r}:$I${r}")
    r += 1
    dep_ini = r
    depr = ["dino", "esc", "bod", "hab", "mob", "elev", "herr"]
    amor = ["pek", "peo", "sw", "pnom", "ploc", "pcur", "const", "id"]
    fd = {}
    for k in depr + amor:
        fd[k] = r
        celda(ws, f"A{r}", f"=A{fi[k]}", borde=B_FILA)
        celda(ws, f"B{r}", f"=B{fi[k]}", "0", alin=CEN, borde=B_FILA)
        for y in range(6):
            cc = col(4 + y)
            celda(ws, f"{cc}{r}",
                  f"=SUMPRODUCT(($D$6:$I$6<{cc}$6)*(({cc}$6-$D$6:$I$6)<=$B{r})*$D{fi[k]}:$I{fi[k]}*$D${r_idx}:$I${r_idx})/$B{r}/{cc}${r_idx}",
                  FMT_PESOS, borde=B_FILA)
        r += 1
    celda(ws, f"A{r}", "Depreciación total (activos fijos)", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}{fd['dino']}:{cc}{fd['herr']})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Dep", H1, f"$D${r}:$I${r}")
    r += 1
    celda(ws, f"A{r}", "Amortización total (Proyecto Experimental, software, puesta en marcha, constitución e I+D)", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}{fd['pek']}:{cc}{fd['id']})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Amort", H1, f"$D${r}:$I${r}")

    # ---- E. valor de desecho
    r += 2
    bloque(ws, r, "E. VALOR DE DESECHO CONTABLE AL AÑO 5 = valor libro + recuperación del capital de trabajo + garantías (deflactados)", 10)
    r += 1
    encabezado(ws, r, ["Concepto", "", "", "Año 5", "", "", "", "", "", ""])
    r += 1
    vl0 = r
    for k in depr + amor:
        celda(ws, f"A{r}", f'="Valor libro: "&A{fi[k]}', borde=B_FILA)
        celda(ws, f"D{r}",
              f"=SUMPRODUCT($D{fi[k]}:$I{fi[k]}*$D${r_idx}:$I${r_idx}*(1-($I$6-$D$6:$I$6)/$B{fd[k]})*(($I$6-$D$6:$I$6)<$B{fd[k]}))/$I${r_idx}",
              FMT_PESOS, borde=B_FILA)
        r += 1
    celda(ws, f"A{r}", "Valor libro total", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=SUM(D{vl0}:D{r - 1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    r_vl = r
    r += 1
    celda(ws, f"A{r}", "Recuperación del capital de trabajo (hoja 3; incluye la cartera de crédito neta de provisión)", borde=B_FILA)
    celda(ws, f"D{r}", "=CT_Rec", FMT_PESOS, borde=B_FILA)
    r_ctr = r
    r += 1
    celda(ws, f"A{r}", "Recuperación de garantías de arriendo (depósitos nominales, deflactados)", borde=B_FILA)
    celda(ws, f"D{r}", f"=SUMPRODUCT(D{fi['garr']}:I{fi['garr']},D{r_idx}:I{r_idx})/I{r_idx}", FMT_PESOS, borde=B_FILA)
    r_gar = r
    r += 1
    celda(ws, f"A{r}", "VALOR DE DESECHO CONTABLE (año 5)", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=D{r_vl}+D{r_ctr}+D{r_gar}", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("VD", H1, f"$D${r}")
    r += 2
    celda(ws, f"A{r}", "Solo referencia: valor de desecho económico = EBIT del año 5 × (1 − t) / Ku (no se usa; decisión del equipo)",
          tam=9, color=GRIS, cursiva=True)
    celda(ws, f"D{r}", "=INDEX(FP_EBIT,6)*(1-TaxLP)/Ku", FMT_PESOS, tam=9, color=GRIS)
    L.nombre("VD_Eco", H1, f"$D${r}")
    ws.freeze_panes = "B9"


# =====================================================================================================
# HOJA 2. INGRESOS Y COSTOS (años 1 a 5)
# =====================================================================================================
def hoja_2(L):
    ws = L.ws[H2]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"2. INGRESOS Y COSTOS · años 1 a 5 · {UNIDAD}", [
        "Qué calcula: ingresos por línea, costos variables, costos fijos de operación y gastos de administración y ventas según su naturaleza; EBITDA, EBIT y márgenes.",
        "De dónde toma: Anual (sumas de Mensual) y 1. Inversión (depreciación y amortización). Los gastos del año 0 se capitalizan (hoja 1).",
        "A qué hoja entrega: 4. Flujo Puro, 7. Punto de Equilibrio, Dashboard y el control de Pro Pyme de Supuestos.",
    ], 7)
    ws.column_dimensions["A"].width = 70
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 16
    encabezado(ws, 6, ["Concepto"] + [f"Año {y}" for y in range(1, 6)] + ["Total 5 años"])
    for y in range(1, 6):
        celda(ws, f"{col(1 + y)}5", f"=Anio0+{y}", "0", tam=9, color=GRIS, alin=CEN)
    r = 7
    F = {}

    def fila(k, et, fn, fmt=FMT_PESOS, neg=False, tot=False, nota=None):
        nonlocal r
        F[k] = r
        celda(ws, f"A{r}", et, negrita=neg or tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(1, 6):
            celda(ws, f"{col(1 + y)}{r}", fn(y), fmt, negrita=neg or tot, borde=B_TOTAL if tot else B_FILA)
        if fmt in (FMT_PESOS, FMT_ENTERO):
            celda(ws, f"G{r}", f"=SUM(B{r}:F{r})", fmt, negrita=neg or tot, borde=B_TOTAL if tot else B_FILA)
        else:
            ws[f"G{r}"].border = B_FILA
        r += 1

    def titulo(t):
        nonlocal r
        bloque(ws, r, t, 7)
        r += 1

    def sumf(keys, sign=1):
        return lambda y: "=" + "+".join(f"{col(1 + y)}{F[k]}" for k in keys)

    titulo("INGRESOS")
    fila("i_prop", "Taller propio: instalaciones (netas de descuento y bono)", lambda y: f"={A(L, 'neto', y)}")
    fila("i_fin", "Ingreso por financiamiento a clientes (intereses del crédito directo)", lambda y: f"={A(L, 'int_cob', y)}")
    fila("i_paq", "Red: paquetes de entrada", lambda y: f"={A(L, 'red_paq', y)}")
    fila("i_cuota", "Red: suscripción, cuota base", lambda y: f"={A(L, 'red_cuota', y)}")
    fila("i_hab", "Red: suscripción, Lumine Habilita por técnico", lambda y: f"={A(L, 'red_habi', y)}")
    fila("i_aran", "Red: arancel del 3CV (cobrado al costo)", lambda y: f"={A(L, 'red_aran', y)}")
    fila("ing", "Total ingresos", sumf(["i_prop", "i_fin", "i_paq", "i_cuota", "i_hab", "i_aran"]), tot=True)
    fila("i_rec", "Ingreso recurrente «Lumine Habilita Red» (suscripción: cuota base + Habilita)", sumf(["i_cuota", "i_hab"]), neg=True)
    for k in range(1, 8):
        ws.cell(row=F["i_rec"], column=k).fill = PatternFill("solid", fgColor="FFE3F4FC")
    titulo("COSTOS VARIABLES")
    fila("c_kit", "Kits instalados", lambda y: f"={A(L, 'kitc', y)}")
    fila("c_gar", "Garantía", lambda y: f"={A(L, 'gar', y)}")
    fila("c_com", "Comisiones de venta", lambda y: f"={A(L, 'comis', y)}")
    fila("c_sello", "Sello", lambda y: f"={A(L, 'sello', y)}")
    fila("c_ref", "Referidos", lambda y: f"={A(L, 'refe', y)}")
    fila("c_eval", "Evaluación crediticia", lambda y: f"={A(L, 'evalc', y)}")
    fila("c_prov", "Provisión de incobrables", lambda y: f"={A(L, 'prov', y)}")
    fila("c_mp", "Comisión de medio de pago", lambda y: f"={A(L, 'com_mp', y)}")
    fila("c_red", "Red: curso de alta tensión, auditoría, comisión del paquete y arancel (por taller)", lambda y: f"={A(L, 'red_cdir', y)}")
    fila("cv", "Total costos variables", sumf(["c_kit", "c_gar", "c_com", "c_sello", "c_ref", "c_eval", "c_prov", "c_mp", "c_red"]), tot=True)
    fila("mc", "Margen de contribución", lambda y: f"={col(1 + y)}{F['ing']}-{col(1 + y)}{F['cv']}", neg=True)
    fila("mc_pct", "Margen de contribución (% de los ingresos)", lambda y: f"=IF({col(1 + y)}{F['ing']}=0,0,{col(1 + y)}{F['mc']}/{col(1 + y)}{F['ing']})", FMT_PCT)
    titulo("COSTOS FIJOS DE OPERACIÓN")
    fila("f_nop", "Nómina de operación del taller propio (RT, Ingeniería, técnicos, bonos y postventa)", lambda y: f"={A(L, 'nom_op', y)}")
    fila("f_nred", "Nómina de operación de la red (soporte técnico y plataforma)", lambda y: f"={A(L, 'c_sop', y)}+{A(L, 'c_plat', y)}")
    fila("f_arr", "Arriendo", lambda y: f"={A(L, 'arr', y)}")
    fila("f_serv", "Servicios básicos", lambda y: f"={A(L, 'serv', y)}")
    fila("f_seg", "Seguros", lambda y: f"={A(L, 'seg', y)}")
    fila("f_mant", "Mantención de equipos", lambda y: f"={A(L, 'mant', y)}")
    fila("f_cur", "Cursos externos y EPP de técnicos nuevos", lambda y: f"={A(L, 'cursos', y)}")
    fila("f_soft", "Software: mantención, hosting y licencias", lambda y: f"={A(L, 'soft', y)}")
    fila("cf", "Total costos fijos de operación", sumf(["f_nop", "f_nred", "f_arr", "f_serv", "f_seg", "f_mant", "f_cur", "f_soft"]), tot=True)
    titulo("GASTOS DE ADMINISTRACIÓN Y VENTAS")
    fila("g_adm", "Nómina de administración (GG, Administración y Personas, asistente)", lambda y: f"={A(L, 'nom_adm', y)}")
    fila("g_ven", "Nómina de ventas (Comercial y Postventa; Comercial de Empresas)", lambda y: f"={A(L, 'nom_ven', y)}+{A(L, 'c_comemp', y)}")
    fila("g_mk", "Marketing del taller propio", lambda y: f"={A(L, 'mk', y)}")
    fila("g_mkred", "Marketing a talleres (red)", lambda y: f"={A(L, 'mk_red', y)}")
    fila("gav", "Total gastos de administración y ventas", sumf(["g_adm", "g_ven", "g_mk", "g_mkred"]), tot=True)
    titulo("RESULTADO")
    fila("ebitda", "EBITDA", lambda y: f"={col(1 + y)}{F['mc']}-{col(1 + y)}{F['cf']}-{col(1 + y)}{F['gav']}", tot=True)
    fila("ebitda_pct", "Margen EBITDA", lambda y: f"=IF({col(1 + y)}{F['ing']}=0,0,{col(1 + y)}{F['ebitda']}/{col(1 + y)}{F['ing']})", FMT_PCT)
    fila("dep", "Depreciación", lambda y: f"=INDEX(Dep,{y + 1})")
    fila("amort", "Amortización", lambda y: f"=INDEX(Amort,{y + 1})")
    fila("ebit", "EBIT (resultado operacional)", lambda y: f"={col(1 + y)}{F['ebitda']}-{col(1 + y)}{F['dep']}-{col(1 + y)}{F['amort']}", tot=True)
    fila("ebit_pct", "Margen EBIT", lambda y: f"=IF({col(1 + y)}{F['ing']}=0,0,{col(1 + y)}{F['ebit']}/{col(1 + y)}{F['ing']})", FMT_PCT)
    fila("ctrl", "Control: EBITDA − EBITDA de Mensual (debe dar 0)", lambda y: f"=ROUND({col(1 + y)}{F['ebitda']}-{A(L, 'ebitda', y)},0)")
    L.control("2. Ingresos y Costos: EBITDA contra Mensual", H2, f"B{F['ctrl']}:F{F['ctrl']}")
    titulo("RESULTADO POR LÍNEA (a la red se le asignan su personal, sus costos por taller y el marketing a talleres)")
    fila("red_ing", "Red: ingresos", lambda y: f"={col(1 + y)}{F['i_paq']}+{col(1 + y)}{F['i_cuota']}+{col(1 + y)}{F['i_hab']}+{col(1 + y)}{F['i_aran']}")
    fila("red_cost", "Red: costos directos, personal y marketing a talleres",
         lambda y: f"={col(1 + y)}{F['c_red']}+{A(L, 'nom_red', y)}+{col(1 + y)}{F['g_mkred']}")
    fila("red_ebitda", "Red: EBITDA", lambda y: f"={col(1 + y)}{F['red_ing']}-{col(1 + y)}{F['red_cost']}", neg=True)
    fila("prop_ebitda", "Taller propio y financiamiento: EBITDA", lambda y: f"={col(1 + y)}{F['ebitda']}-{col(1 + y)}{F['red_ebitda']}", neg=True)
    titulo("CONTROL DE NÓMINA CONTRA LA TABLA 16 DE LA FASE 3 (no tiene que calzar: cambiaron las rentas y la demanda)")
    fila("nom", "Nómina total del modelo (costo empresa, con bonos)", lambda y: f"={A(L, 'nomina', y)}")
    fila("t16", "Nómina de la Fase 3, Tabla 16", lambda y: f"=INDEX(Tabla16,{y})")
    fila("dif16", "Diferencia (modelo − Fase 3)", lambda y: f"={col(1 + y)}{F['nom']}-{col(1 + y)}{F['t16']}")
    titulo("INDICADORES FÍSICOS")
    fila("inst", "Instalaciones propias", lambda y: f"={A(L, 'inst', y)}", FMT_ENTERO)
    fila("duos", "Dúos al cierre", lambda y: f"={A(L, 'duos', y)}", FMT_ENTERO)
    fila("talleres", "Talleres propios al cierre", lambda y: f"={A(L, 'talleres', y)}", FMT_ENTERO)
    fila("tec", "Técnicos al cierre", lambda y: f"={A(L, 'tec', y)}", FMT_ENTERO)
    fila("dot", "Dotación total al cierre", lambda y: f"={A(L, 'dot', y)}", FMT_ENTERO)
    fila("red", "Talleres de la red al cierre", lambda y: f"={A(L, 'red_act', y)}", FMT_ENTERO)
    fila("util", "Utilización de la capacidad nominal", lambda y: f"={A(L, 'util_a', y)}", FMT_PCT)
    for k in ("inst", "duos", "talleres", "tec", "dot", "red"):
        ws[f"G{F[k]}"].value = None if k != "inst" else ws[f"G{F[k]}"].value
    for nom, k in [("H2_Ing", "ing"), ("H2_CV", "cv"), ("H2_CF", "cf"), ("H2_GAV", "gav"), ("H2_EBITDA", "ebitda"), ("H2_Prop", "i_prop"),
                   ("H2_Fin", "i_fin"), ("H2_Rec", "i_rec"), ("H2_MC", "mc"), ("H2_RedIng", "red_ing")]:
        L.nombre(nom, H2, f"$B${F[k]}:$F${F[k]}")
    L.f2 = F
    ws.freeze_panes = "B7"


# =====================================================================================================
# HOJA 3. CAPITAL DE TRABAJO
# =====================================================================================================
def hoja_3(L):
    ws = L.ws[H3]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"3. CAPITAL DE TRABAJO · un solo método · {UNIDAD}", [
        "Qué calcula: el requerimiento de cada año = saldo al cierre (kits pagados no instalados + cartera del crédito directo neta − pies recibidos); el año 1, el mayor entre ese saldo y el déficit acumulado máximo.",
        "De dónde toma: Anual (saldos al cierre de cada año) y Mensual (meses −12 a 12: caja operativa, resultado y saldos).",
        "A qué hoja entrega: 1. Inversión y 4. Flujo Puro (inversión al cierre del año t − 1 y recuperación completa en el año 5).",
    ], 8)
    ws.column_dimensions["A"].width = 64
    for k in range(2, 9):
        ws.column_dimensions[col(k)].width = 16
    fm = L.filas_men
    r = 6
    bloque(ws, r, "A. REQUERIMIENTO E INVERSIÓN ANUAL (requerimiento = saldo al cierre; año 1 = MÁX(déficit acumulado máximo; saldo al cierre))", 8)
    r += 1
    encabezado(ws, r, ["Concepto"] + [f"Año {y}" for y in range(6)] + [""])
    r += 1
    G = {}

    def fa(k, et, fn, fmt=FMT_PESOS, tot=False):
        nonlocal r
        G[k] = r
        celda(ws, f"A{r}", et, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(6):
            celda(ws, f"{col(2 + y)}{r}", fn(y), fmt, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        r += 1

    fa("kits", "Kits pagados y no instalados (cierre)", lambda y: f"={A(L, 'kits_pag', y)}")
    fa("cxc", "Cartera del crédito directo, neta de provisión (cierre)", lambda y: f"={A(L, 'cxc', y)}")
    fa("ab", "(−) Abonos recibidos: pies de ventas aún no instaladas (cierre)", lambda y: f"={A(L, 'abono_s', y)}")
    fa("saldo", "Saldo de capital de trabajo al cierre", lambda y: f"={col(2 + y)}{G['kits']}+{col(2 + y)}{G['cxc']}-{col(2 + y)}{G['ab']}", tot=True)
    fa("req", "Requerimiento del año (con holgura)", lambda y: "=0", tot=True)  # años 1 a 5 se completan abajo
    fa("inv", "Inversión al cierre del año (= requerimiento del año siguiente − el del año; negativa = liberación)",
       lambda y: f"={col(3 + y)}{G['req']}-{col(2 + y)}{G['req']}" if y < 5 else "=0")
    fa("rec", "Recuperación del capital de trabajo (año 5 = requerimiento del año 5)", lambda y: f"=G{G['req']}" if y == 5 else "=0")
    fa("ctrl", "Control: saldo de Anual − saldo de Mensual (debe dar 0)", lambda y: f"=ROUND({col(2 + y)}{G['saldo']}-{A(L, 'saldo_ct', y)},0)")
    L.control("3. Capital de Trabajo: saldo anual contra Mensual", H3, f"B{G['ctrl']}:G{G['ctrl']}")
    celda(ws, f"A{r}", "Control: recuperación − suma de lo invertido (debe dar 0)", tam=9, color=GRIS)
    celda(ws, f"G{r}", f"=ROUND(G{G['rec']}-SUM(B{G['inv']}:G{G['inv']}),0)", FMT_PESOS, tam=9)
    L.control("3. Capital de Trabajo: recuperación contra lo invertido", H3, f"G{r}")
    r += 1
    fa("pct", "Requerimiento como % de los ingresos del año", lambda y: "=0" if y == 0 else f"=IFERROR({col(2 + y)}{G['req']}/INDEX(H2_Ing,{y}),0)", FMT_PCT)
    fa("pct_cxc", "Parte de la cartera del crédito en el saldo al cierre", lambda y: f"=IFERROR({col(2 + y)}{G['cxc']}/{col(2 + y)}{G['saldo']},0)", FMT_PCT)
    L.nombre("CT_Inv", H3, f"$B${G['inv']}:$G${G['inv']}")
    L.nombre("CT_Req", H3, f"$B${G['req']}:$G${G['req']}")
    L.nombre("CT_Rec", H3, f"$G${G['rec']}")
    r += 1
    celda(ws, f"A{r}", "Fundamento:", negrita=True, tam=9)
    r += 1
    r_fund = r
    r += 5
    # ---- B. detalle mensual (meses en filas)
    bloque(ws, r, "B. MESES −12 A 12: FLUJO OPERATIVO, DÉFICIT ACUMULADO MÁXIMO (método de clase) Y SALDO DE CAPITAL DE TRABAJO", 8)
    r += 1
    encabezado(ws, r, ["Mes del proyecto", "Flujo operativo del mes", "Saldo acumulado de caja", "Resultado acumulado (EBITDA)",
                       "Kits pagados no instalados", "Cartera del crédito, neta", "Abonos (pies)", "Saldo de capital de trabajo"], alto=30)
    r += 1
    m0 = r
    series = [("A", "mes"), ("B", "fco"), ("C", "acum"), ("D", "ebitda_ac"), ("E", "kits_pag"), ("F", "cxc"), ("G", "abono"), ("H", "saldo_ct")]
    for j in range(24):
        rr = m0 + j
        for cc, mk in series:
            fmt = '"Mes "0;"Mes −"0' if cc == "A" else FMT_PESOS
            c = celda(ws, f"{cc}{rr}", f"={q(H_MEN)}!{mc(j + 1)}{fm[mk]}", fmt, tam=9, negrita=cc in ("C", "H"), borde=B_FILA)
            if cc == "A":
                c.alignment = IZQ
    m1 = m0 + 23
    rng = lambda cc: f"${cc}${m0}:${cc}${m1}"
    r = m1 + 2
    F = {}
    pos_min = f"MATCH(MIN({rng('C')}),{rng('C')},0)"
    res = [("deficit", "Déficit acumulado máximo de caja operativa (meses −12 a 12)", f"=MAX(0,-MIN({rng('C')}))", FMT_PESOS),
           ("mes_def", "Mes del déficit máximo", f"=INDEX({rng('A')},{pos_min})", '"Mes "0;"Mes −"0'),
           ("c_res", "Composición: pérdidas acumuladas del arranque (− resultado acumulado)", f"=-INDEX({rng('D')},{pos_min})", FMT_PESOS),
           ("c_kits", "Composición: kits pagados y no instalados", f"=INDEX({rng('E')},{pos_min})", FMT_PESOS),
           ("c_cxc", "Composición: cartera del crédito, neta", f"=INDEX({rng('F')},{pos_min})", FMT_PESOS),
           ("c_ab", "Composición: (−) abonos recibidos", f"=-INDEX({rng('G')},{pos_min})", FMT_PESOS)]
    for k, et, f, fmt in res:
        F[k] = r
        celda(ws, f"A{r}", et, negrita=k == "deficit", borde=B_TOTAL if k == "deficit" else B_FILA)
        celda(ws, f"B{r}", f, fmt, negrita=k == "deficit", borde=B_TOTAL if k == "deficit" else B_FILA, alin=DER)
        r += 1
    celda(ws, f"A{r}", "Control: composición − déficit (debe dar 0)", tam=9, color=GRIS)
    celda(ws, f"B{r}", f"=IF(B{F['deficit']}=0,0,ROUND(SUM(B{F['c_res']}:B{F['c_ab']})-B{F['deficit']},0))", FMT_PESOS, tam=9)
    L.control("3. Capital de Trabajo: composición del déficit", H3, f"B{r}")
    L.nombre("CT_Def", H3, f"$B${F['deficit']}")
    # requerimientos (el año 1 usa el déficit acumulado máximo)
    for y in range(1, 6):
        c = ws[f"{col(2 + y)}{G['req']}"]
        c.value = (f"=IF(CTDefFlag=1,MAX($B${F['deficit']},C{G['saldo']}),C{G['saldo']})*(1+Holgura)" if y == 1
                   else f"={col(2 + y)}{G['saldo']}*(1+Holgura)")
    textos = [
        f'="El año 1 requiere $"&FIXED(C{G["req"]}/1000000,0)&" millones: "&IF(AND(CTDefFlag=1,$B${F["deficit"]}>C{G["saldo"]}),"manda el déficit acumulado máximo (mes "&$B${F["mes_def"]}&"), que suma las pérdidas del arranque a los kits y la cartera.","manda el saldo al cierre del año 1.")',
        f'="Al año 5 el saldo es $"&FIXED(G{G["saldo"]}/1000000,0)&" millones y la cartera del crédito directo es el "&FIXED(G{G["pct_cxc"]}*100,0)&"% de ese saldo ("&FIXED(VtaCred*100,0)&"% de las ventas a "&Plazo&" cuotas). Se recupera completo en el año 5 (valor de desecho)."',
        '="Kits: 30% al pedir y 70% al embarque (desde el 4.º pedido, a 30 días de embarcar). Cobros: pie de 30% un mes antes; contado a la entrega; crédito con cuotas desde el mes siguiente."',
        '="El horizonte termina en el mes 60: no hay pedidos ni pies de ventas posteriores, coherente con el valor de desecho contable."',
    ]
    for k, t in enumerate(textos):
        celda(ws, f"A{r_fund + k}", t, tam=9, color=GRIS, alin=IZQ)
        ws.merge_cells(f"A{r_fund + k}:H{r_fund + k}")
    ws.freeze_panes = "B8"


# =====================================================================================================
# HOJAS 4, 5 Y 6
# =====================================================================================================
def hoja_4(L):
    ws = L.ws[H4]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"4. FLUJO DE CAJA PURO · años 0 a 5 · {UNIDAD}", [
        "Qué calcula: ingresos − costos − depreciación − amortización = EBIT; impuesto con arrastre de pérdidas; + depreciación y amortización − inversión − capital de trabajo + valor de desecho.",
        "De dónde toma: 2. Ingresos y Costos, 1. Inversión, 3. Capital de Trabajo y Supuestos (impuesto, tasas provisorias).",
        "A qué hoja entrega: 5. Flujo Apalancado, 6. Tasa de Descuento (VAN ajustado) y Dashboard.",
    ], 7)
    ws.column_dimensions["A"].width = 66
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 16
    encabezado(ws, 6, ["Concepto"] + [f"Año {y}" for y in range(6)])
    for y in range(6):
        celda(ws, f"{col(2 + y)}5", "=COLUMN()-COLUMN($B$5)", "0", tam=9, color=GRIS, alin=CEN)
    r = 7
    F = {}

    def fila(k, et, fn, fmt=FMT_PESOS, tot=False, neg=False):
        nonlocal r
        F[k] = r
        celda(ws, f"A{r}", et, negrita=tot or neg, borde=B_TOTAL if tot else B_FILA)
        for y in range(6):
            celda(ws, f"{col(2 + y)}{r}", fn(y), fmt, negrita=tot or neg, borde=B_TOTAL if tot else B_FILA)
        r += 1

    c = lambda k, y: f"{col(2 + y)}{F[k]}"
    fila("ing", "Ingresos", lambda y: "=0" if y == 0 else f"=INDEX(H2_Ing,{y})")
    fila("cv", "(−) Costos variables", lambda y: "=0" if y == 0 else f"=-INDEX(H2_CV,{y})")
    fila("cf", "(−) Costos fijos de operación", lambda y: "=0" if y == 0 else f"=-INDEX(H2_CF,{y})")
    fila("gav", "(−) Gastos de administración y ventas", lambda y: "=0" if y == 0 else f"=-INDEX(H2_GAV,{y})")
    fila("ebitda", "EBITDA", lambda y: f"=SUM({c('ing', y)}:{c('gav', y)})", tot=True)
    fila("dep", "(−) Depreciación", lambda y: f"=-INDEX(Dep,{y + 1})")
    fila("amort", "(−) Amortización", lambda y: f"=-INDEX(Amort,{y + 1})")
    fila("ebit", "EBIT (resultado antes de impuesto)", lambda y: f"={c('ebitda', y)}+{c('dep', y)}+{c('amort', y)}", tot=True)
    fila("p_ini", "Pérdida tributaria de arrastre (inicio del año)", lambda y: "=0" if y == 0 else f"={col(1 + y)}{r + 2}")
    fila("base", "Base imponible = EBIT − pérdida de arrastre", lambda y: f"={c('ebit', y)}-{c('p_ini', y)}")
    fila("p_fin", "Pérdida tributaria de arrastre (cierre del año)", lambda y: f"=MAX(0,-{c('base', y)})")
    fila("tasa", "Tasa de impuesto del año (bloque C)", lambda y: f"=INDEX(Tax,{y + 1})", FMT_PCT)
    fila("imp0", "Impuesto de primera categoría (antes de créditos)", lambda y: f"=MAX(0,{c('base', y)})*{c('tasa', y)}")
    fila("cid_d", "Crédito I+D disponible (año + arrastre)", lambda y: "=INDEX(CredID,1)" if y == 0 else f"=INDEX(CredID,{y + 1})+{col(1 + y)}{r + 2}")
    fila("cid_u", "Crédito I+D usado", lambda y: f"=MIN({c('imp0', y)},{c('cid_d', y)})")
    fila("cid_a", "Crédito I+D de arrastre", lambda y: f"={c('cid_d', y)}-{c('cid_u', y)}")
    fila("imp", "(−) Impuesto", lambda y: f"=-({c('imp0', y)}-{c('cid_u', y)})")
    fila("un", "Utilidad neta", lambda y: f"={c('ebit', y)}+{c('imp', y)}", neg=True)
    fila("mdep", "(+) Depreciación", lambda y: f"=-{c('dep', y)}")
    fila("mam", "(+) Amortización", lambda y: f"=-{c('amort', y)}")
    fila("inv0", "(−) Inversión del año 0 en activos (capitalizada al mes 0)", lambda y: "=-Inv0Cap" if y == 0 else "=0")
    fila("reinv", "(−) Reinversiones (puestos, talleres, reposición de herramientas, I+D y garantías)", lambda y: "=0" if y == 0 else f"=-INDEX(Inv_Act,{y + 1})")
    fila("ct", "(−) Inversión en capital de trabajo", lambda y: f"=-INDEX(CT_Inv,{y + 1})")
    fila("vd", "(+) Valor de desecho contable (valor libro + capital de trabajo + garantías)", lambda y: "=VD" if y == 5 else "=0")
    fila("fc", "FLUJO DE CAJA PURO", lambda y: f"=SUM({c('un', y)}:{c('vd', y)})", tot=True)
    # corrige las referencias de arrastre (fila anterior del cierre)
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['p_ini']}"].value = f"={col(1 + y)}{F['p_fin']}"
        ws[f"{col(2 + y)}{F['cid_d']}"].value = f"=INDEX(CredID,{y + 1})+{col(1 + y)}{F['cid_a']}"
    r += 1
    fila("acum", "Flujo acumulado", lambda y: f"={c('fc', y)}" if y == 0 else f"={col(1 + y)}{r}+{c('fc', y)}")
    fila("desc", "Flujo descontado a Ku", lambda y: f"={c('fc', y)}/(1+Ku)^{col(2 + y)}$5")
    fila("dacum", "Flujo descontado acumulado", lambda y: f"={c('desc', y)}" if y == 0 else f"={col(1 + y)}{r}+{c('desc', y)}")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['acum']}"].value = f"={col(1 + y)}{F['acum']}+{c('fc', y)}"
        ws[f"{col(2 + y)}{F['dacum']}"].value = f"={col(1 + y)}{F['dacum']}+{c('desc', y)}"
    fila("pbs", "Payback simple: año de recuperación (interpolado)",
         lambda y: '=""' if y == 0 else f'=IF(AND({col(1 + y)}{F["acum"]}<0,{c("acum", y)}>=0),{col(1 + y)}$5+(-{col(1 + y)}{F["acum"]}/{c("fc", y)}),"")', FMT_DEC2)
    fila("pbd", "Payback descontado: año de recuperación (interpolado)",
         lambda y: '=""' if y == 0 else f'=IF(AND({col(1 + y)}{F["dacum"]}<0,{c("dacum", y)}>=0),{col(1 + y)}$5+(-{col(1 + y)}{F["dacum"]}/{c("desc", y)}),"")', FMT_DEC2)
    L.nombre("FC_Puro", H4, f"$B${F['fc']}:$G${F['fc']}")
    L.nombre("FP_EBIT", H4, f"$B${F['ebit']}:$G${F['ebit']}")
    L.nombre("FP_Imp", H4, f"$B${F['imp']}:$G${F['imp']}")
    r += 1
    bloque(ws, r, "INDICADORES DEL FLUJO PURO (tasas provisorias)", 7)
    r += 1
    encabezado(ws, r, ["Indicador", "A Ku (por decidir)", "A WACC (por decidir)", "", "", "", ""])
    r += 1
    ind = {}

    def fi(k, et, f1, f2=None, fmt=FMT_PESOS):
        nonlocal r
        ind[k] = r
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", f1, fmt, negrita=True, borde=B_FILA)
        if f2:
            celda(ws, f"C{r}", f2, fmt, negrita=True, borde=B_FILA)
        else:
            ws[f"C{r}"].border = B_FILA
        r += 1

    fc = f"$B${F['fc']}"
    fcs = f"$C${F['fc']}:$G${F['fc']}"
    fi("tasa", "Tasa de descuento (real)", "=Ku", "=WACC", FMT_PCT2)
    fi("van", "VAN del flujo puro", f"={fc}+NPV(B{r - 1},{fcs})", f"={fc}+NPV(C{r - 1},{fcs})")
    fi("tir", "TIR del flujo puro", f'=IFERROR(IRR($B${F["fc"]}:$G${F["fc"]}),"no existe")', f"=B{r - 1}" if False else None, FMT_PCT)
    ws[f"C{ind['tir']}"] = f"=B{ind['tir']}"
    ws[f"C{ind['tir']}"].number_format = FMT_PCT
    ws[f"C{ind['tir']}"].font = fuente(10, True)
    fi("pbs", "Payback simple (años)", f'=IF(COUNT(C{F["pbs"]}:G{F["pbs"]})=0,"> 5 años",MIN(C{F["pbs"]}:G{F["pbs"]}))', None, FMT_DEC1)
    fi("pbd", "Payback descontado a Ku (años)", f'=IF(COUNT(C{F["pbd"]}:G{F["pbd"]})=0,"> 5 años",MIN(C{F["pbd"]}:G{F["pbd"]}))', None, FMT_DEC1)
    fi("ir", "Índice de rentabilidad = VP de los flujos futuros / inversión del año 0", f"=NPV(B{ind['tasa']},{fcs})/-{fc}",
       f"=NPV(C{ind['tasa']},{fcs})/-{fc}", FMT_DEC2)
    fi("inv0", "Inversión del año 0 (activos capitalizados + capital de trabajo)", f"=-{fc}")
    r += 1
    bloque(ws, r, "DE DÓNDE VIENE EL VAN (para explicar la TIR)", 7)
    r += 1
    fi("vp_vd", "Valor presente del valor de desecho (año 5)", f"=VD/(1+Ku)^5")
    fi("vp_vd_ct", "   del cual: recuperación del capital de trabajo", f"=CT_Rec/(1+Ku)^5")
    fi("van_sin", "VAN sin valor de desecho", f"=B{ind['van']}-B{ind['vp_vd']}")
    fi("vp_ct", "Valor presente de la inversión en capital de trabajo (años 0 a 4)", f"=-INDEX(CT_Inv,1)-NPV(Ku,INDEX(CT_Inv,2),INDEX(CT_Inv,3),INDEX(CT_Inv,4),INDEX(CT_Inv,5),INDEX(CT_Inv,6))")
    fi("costo_ct", "Costo neto del capital de trabajo en VAN (invertir y recuperar al año 5)", f"=B{ind['vp_ct']}+B{ind['vp_vd_ct']}")
    L.nombre("VAN_Ku", H4, f"$B${ind['van']}")
    L.nombre("VAN_WACC", H4, f"$C${ind['van']}")
    L.nombre("TIR_Puro", H4, f"$B${ind['tir']}")
    L.nombre("PB_Simple", H4, f"$B${ind['pbs']}")
    L.nombre("PB_Desc", H4, f"$B${ind['pbd']}")
    L.nombre("IR_Ku", H4, f"$B${ind['ir']}")
    L.nombre("VAN_SinVD", H4, f"$B${ind['van_sin']}")
    L.nombre("CostoCT_VAN", H4, f"$B${ind['costo_ct']}")
    L.salidas.update(VAN_Ku=(H4, f"B{ind['van']}"), TIR_Puro=(H4, f"B{ind['tir']}"), PB_Desc=(H4, f"B{ind['pbd']}"),
                     PB_Simple=(H4, f"B{ind['pbs']}"), VAN_WACC=(H4, f"C{ind['van']}"), Inv0_Total=(H1, None))
    L.f4 = F
    L.ind4 = ind
    ws.freeze_panes = "B7"


def hoja_5(L):
    ws = L.ws[H5]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"5. FLUJO DE CAJA APALANCADO (del inversionista) · años 0 a 5 · {UNIDAD}", [
        "Qué calcula: crédito bancario de 40% de la inversión del año 0 a 5 años (sistema francés, Kd nominal, cuotas deflactadas) y el flujo del inversionista (aporte de socios + deuda).",
        "De dónde toma: 4. Flujo Puro (EBIT, inversiones, valor de desecho), 1. Inversión (índice de precios) y Supuestos (bloque D).",
        "A qué hoja entrega: 6. Tasa de Descuento (VAN ajustado) y Dashboard.",
    ], 7)
    ws.column_dimensions["A"].width = 66
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 16
    encabezado(ws, 6, ["Concepto"] + [f"Año {y}" for y in range(6)])
    for y in range(6):
        celda(ws, f"{col(2 + y)}5", "=COLUMN()-COLUMN($B$5)", "0", tam=9, color=GRIS, alin=CEN)
    r = 7
    F = {}

    def fila(k, et, fn, fmt=FMT_PESOS, tot=False):
        nonlocal r
        F[k] = r
        celda(ws, f"A{r}", et, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(6):
            v = fn(y)
            if v is None:
                ws[f"{col(2 + y)}{r}"].border = B_FILA
                continue
            celda(ws, f"{col(2 + y)}{r}", v, fmt, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        r += 1

    c = lambda k, y: f"{col(2 + y)}{F[k]}"
    bloque(ws, r, "A. CRÉDITO BANCARIO EN PESOS NOMINALES (sistema francés, cuotas anuales)", 7)
    r += 1
    fila("monto", "Monto del crédito = % de deuda × inversión del año 0 (activos + capital de trabajo)", lambda y: "=PctD*Inv0_Total" if y == 0 else None)
    fila("s_ini", "Saldo inicial (nominal)", lambda y: None if y == 0 else f"={col(1 + y)}{r + 4}")
    fila("int", "Interés (nominal)", lambda y: None if y == 0 else f"={c('s_ini', y)}*KdNom")
    fila("cuota", "Cuota (PAGO, nominal)", lambda y: None if y == 0 else f"=IF({col(2 + y)}$5<=CredAnios,PMT(KdNom,CredAnios,-$B${F['monto']}),0)")
    fila("amo", "Amortización (nominal)", lambda y: None if y == 0 else f"={c('cuota', y)}-{c('int', y)}")
    fila("s_fin", "Saldo final (nominal)", lambda y: f"=B{F['monto']}" if y == 0 else f"={c('s_ini', y)}-{c('amo', y)}")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['s_ini']}"].value = f"={col(1 + y)}{F['s_fin']}"
    fila("idx", "Índice de precios (año 0 = 1)", lambda y: f"=INDEX(IdxP,{y + 1})", "0.0000")
    fila("int_d", "Interés deflactado", lambda y: "=0" if y == 0 else f"={c('int', y)}/{c('idx', y)}")
    fila("amo_d", "Amortización deflactada", lambda y: "=0" if y == 0 else f"={c('amo', y)}/{c('idx', y)}")
    r += 1
    bloque(ws, r, "B. FLUJO DEL INVERSIONISTA (socios)", 7)
    r += 1
    fila("ebit", "EBIT del flujo puro", lambda y: f"=INDEX(FP_EBIT,{y + 1})")
    fila("mint", "(−) Intereses deflactados", lambda y: f"=-{c('int_d', y)}")
    fila("rai", "Resultado antes de impuesto", lambda y: f"={c('ebit', y)}+{c('mint', y)}")
    fila("p_ini", "Pérdida de arrastre (inicio)", lambda y: "=0")
    fila("base", "Base imponible", lambda y: f"={c('rai', y)}-{c('p_ini', y)}")
    fila("p_fin", "Pérdida de arrastre (cierre)", lambda y: f"=MAX(0,-{c('base', y)})")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['p_ini']}"].value = f"={col(1 + y)}{F['p_fin']}"
    fila("imp0", "Impuesto antes de créditos", lambda y: f"=MAX(0,{c('base', y)})*INDEX(Tax,{y + 1})")
    fila("cid_d", "Crédito I+D disponible", lambda y: "=INDEX(CredID,1)")
    fila("cid_u", "Crédito I+D usado", lambda y: f"=MIN({c('imp0', y)},{c('cid_d', y)})")
    fila("cid_a", "Crédito I+D de arrastre", lambda y: f"={c('cid_d', y)}-{c('cid_u', y)}")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['cid_d']}"].value = f"=INDEX(CredID,{y + 1})+{col(1 + y)}{F['cid_a']}"
    fila("imp", "(−) Impuesto", lambda y: f"=-({c('imp0', y)}-{c('cid_u', y)})")
    fila("un", "Utilidad neta", lambda y: f"={c('rai', y)}+{c('imp', y)}", tot=True)
    fila("da", "(+) Depreciación y amortización", lambda y: f"=INDEX(Dep,{y + 1})+INDEX(Amort,{y + 1})")
    fila("inv", "(−) Inversión, reinversiones y capital de trabajo",
         lambda y: "=-Inv0Cap-INDEX(CT_Inv,1)" if y == 0 else f"=-INDEX(Inv_Act,{y + 1})-INDEX(CT_Inv,{y + 1})")
    fila("vd", "(+) Valor de desecho", lambda y: "=VD" if y == 5 else "=0")
    fila("prest", "(+) Préstamo recibido", lambda y: f"=$B${F['monto']}" if y == 0 else "=0")
    fila("mamo", "(−) Amortización de la deuda (deflactada)", lambda y: f"=-{c('amo_d', y)}")
    fila("fi", "FLUJO DEL INVERSIONISTA", lambda y: f"={c('un', y)}+{c('da', y)}+{c('inv', y)}+{c('vd', y)}+{c('prest', y)}+{c('mamo', y)}", tot=True)
    fila("ahorro", "Ahorro tributario por intereses (impuesto puro − impuesto apalancado)", lambda y: f"={c('imp', y)}-INDEX(FP_Imp,{y + 1})")
    fila("deuda", "Flujo de la deuda para Lumine (préstamo − intereses − amortización + ahorro tributario)",
         lambda y: f"={c('prest', y)}+{c('mint', y)}+{c('mamo', y)}+{c('ahorro', y)}")
    fila("ctrl", "Control: flujo puro + flujo de la deuda − flujo del inversionista (debe dar 0)",
         lambda y: f"=ROUND(INDEX(FC_Puro,{y + 1})+{c('deuda', y)}-{c('fi', y)},0)")
    L.control("5. Flujo Apalancado: puro + deuda = inversionista", H5, f"B{F['ctrl']}:G{F['ctrl']}")
    L.nombre("FC_Inv", H5, f"$B${F['fi']}:$G${F['fi']}")
    L.nombre("FC_Deuda", H5, f"$B${F['deuda']}:$G${F['deuda']}")
    r += 1
    bloque(ws, r, "INDICADORES DEL INVERSIONISTA (provisorio)", 7)
    r += 1
    ind = {}
    for k, et, f, fmt in [("ke", "Ke (6. Tasa de Descuento)", "=Ke", FMT_PCT2),
                          ("van", "VAN del inversionista a Ke", f"=B{F['fi']}+NPV(Ke,C{F['fi']}:G{F['fi']})", FMT_PESOS),
                          ("tir", "TIR del inversionista", f'=IFERROR(IRR(B{F["fi"]}:G{F["fi"]}),"no existe")', FMT_PCT),
                          ("vand", "VAN de la deuda a Kd real (préstamo − VP de los pagos netos del ahorro tributario)",
                           f"=B{F['deuda']}+NPV(KdReal,C{F['deuda']}:G{F['deuda']})", FMT_PESOS),
                          ("aporte", "Aporte de los socios en el año 0", f"=-B{F['fi']}", FMT_PESOS)]:
        ind[k] = r
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", f, fmt, negrita=True, borde=B_FILA)
        r += 1
    L.nombre("VAN_Ke", H5, f"$B${ind['van']}")
    L.nombre("TIR_Inv", H5, f"$B${ind['tir']}")
    L.nombre("VAN_Deuda", H5, f"$B${ind['vand']}")
    L.nombre("Prestamo", H5, f"$B${F['monto']}")
    L.salidas.update(VAN_Ke=(H5, f"B{ind['van']}"), TIR_Inv=(H5, f"B{ind['tir']}"))
    ws.freeze_panes = "B7"


def hoja_6(L):
    ws = L.ws[H6]
    hoja_base(ws, 95)
    titulo_hoja(ws, "6. TASA DE DESCUENTO · PROVISORIO (Damodaran EE.UU.) · tasas reales, pesos constantes", [
        "Qué calcula: Ku (CAPM con βU) para el flujo puro, βL (Hamada) y Ke para el inversionista, Kd real y WACC (solo referencia), y la verificación del VAN ajustado.",
        "De dónde toma: Supuestos, bloque D (todo provisorio, se decide después), 4. Flujo Puro y 5. Flujo Apalancado.",
        "A qué hoja entrega: 1. Inversión (capitalización), 4. Flujo Puro (VAN a Ku y a WACC), 5. Flujo Apalancado (VAN a Ke) y Dashboard.",
    ], 3)
    ws.column_dimensions["A"].width = 62
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 70
    encabezado(ws, 6, ["Concepto", "Valor", "Método y fuente"])
    filas = [
        ("RfL_", "Rf limpia (real) = Rf − spread de default", "=RfL", FMT_PCT2, "BCU 10 años 2,69% − 0,72% (Damodaran)"),
        ("PRM_", "Prima por riesgo de mercado (Chile)", "=PRM", FMT_PCT2, "Damodaran, enero de 2026"),
        ("BU_", "βU (desapalancado): riesgo del negocio, sin deuda", "=BetaU", FMT_DEC2, "Auto Parts EE.UU. (alt. 1,13 corregido por caja)"),
        ("PA_", "Primas adicionales (cambiaria, iliquidez)", "=PrimasAd", FMT_PCT2, "Sin primas (provisorio)"),
        ("Ku", "Ku = Rf limpia + βU × PRM + primas → descuenta el FLUJO PURO", "=B7+B9*B8+B10", FMT_PCT2, "CAPM con βU"),
        ("DE_", "D/E (estructura objetivo)", "=PctD/PctE", FMT_DEC2, "40% deuda / 60% patrimonio"),
        ("T_", "Tasa de impuesto de largo plazo", "=TaxLP", FMT_PCT, "Ley 21.850"),
        ("BetaL", "βL = βU × (1 + (1 − t) × D/E)", "=B9*(1+(1-B13)*B12)", FMT_DEC2, "Hamada: la deuda sube el riesgo del patrimonio"),
        ("Ke", "Ke = Rf limpia + βL × PRM + primas → descuenta el FLUJO DEL INVERSIONISTA", "=B7+B14*B8+B10", FMT_PCT2, "CAPM con βL"),
        ("KdN_", "Kd nominal", "=KdNom", FMT_PCT2, "Banco Central, septiembre de 2026"),
        ("KdR_", "Kd real = (1 + Kd nominal) / (1 + inflación de largo plazo) − 1", "=KdReal", FMT_PCT2, "Fisher"),
        ("E_", "Patrimonio / (D + E)", "=PctE", FMT_PCT, ""),
        ("D_", "Deuda / (D + E)", "=PctD", FMT_PCT, ""),
        ("WACC", "WACC = E% × Ke + D% × Kd real × (1 − t) → solo referencia", "=B18*B15+B19*B17*(1-B13)", FMT_PCT2, "Supone deuda en proporción constante"),
    ]
    r = 7
    for nom, et, f, fmt, nota in filas:
        celda(ws, f"A{r}", et, negrita=nom in ("Ku", "Ke", "WACC", "BetaL"), borde=B_FILA)
        celda(ws, f"B{r}", f, fmt, negrita=nom in ("Ku", "Ke", "WACC", "BetaL"), borde=B_FILA)
        celda(ws, f"C{r}", nota, color=GRIS, tam=9, borde=B_FILA)
        if not nom.endswith("_"):
            L.nombre(nom, H6, f"$B${r}")
        r += 1
    r += 1
    bloque(ws, r, "VERIFICACIÓN: VAN AJUSTADO = VAN PURO + VAN DEL FINANCIAMIENTO, E IMPACTO DE CADA TASA EN EL FLUJO", 3)
    r += 1
    encabezado(ws, r, ["Concepto", "Valor", "Lectura"])
    r += 1
    ver = [
        ("VAN del flujo puro a Ku", "=VAN_Ku", FMT_PESOS, "Valor del negocio sin considerar cómo se financia"),
        ("VAN de la deuda (a Kd real)", "=VAN_Deuda", FMT_PESOS, "Ahorro tributario de los intereses menos el costo real de la deuda"),
        ("VAN ajustado = VAN puro + VAN de la deuda", f"=B{r}+B{r + 1}", FMT_PESOS, "Método de Myers (verificación)"),
        ("VAN del flujo puro a WACC", "=VAN_WACC", FMT_PESOS, "Referencia"),
        ("VAN del inversionista a Ke", "=VAN_Ke", FMT_PESOS, "Lo que ganan los socios con 40% de deuda"),
        ("Diferencia: VAN ajustado − VAN a WACC", f"=B{r + 2}-B{r + 3}", FMT_PESOS, "Se explica porque el WACC supone deuda constante y aquí se amortiza en 5 años"),
        ("Diferencia: VAN ajustado − VAN del inversionista", f"=B{r + 2}-B{r + 4}", FMT_PESOS, "Hamada y la deuda decreciente no calzan exactamente"),
        ("TIR del flujo puro", "=TIR_Puro", FMT_PCT, ""),
        ("TIR del inversionista", "=TIR_Inv", FMT_PCT, "Sube si la deuda es más barata que la TIR del proyecto"),
    ]
    for et, f, fmt, nota in ver:
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", f, fmt, negrita=True, borde=B_FILA)
        celda(ws, f"C{r}", nota, color=GRIS, tam=9, borde=B_FILA)
        r += 1
    r += 1
    celda(ws, f"A{r}", '="Impacto: con Ku de "&FIXED(Ku*100,1)&"% el VAN es $"&FIXED(VAN_Ku/1000000,0)&" millones; cada punto más de Ku cambia el VAN en cerca de $"&FIXED((VAN_Ku-(INDEX(FC_Puro,1)+NPV(Ku+0.01,INDEX(FC_Puro,2),INDEX(FC_Puro,3),INDEX(FC_Puro,4),INDEX(FC_Puro,5),INDEX(FC_Puro,6))))/1000000,0)&" millones."',
          tam=9, color=GRIS)
    ws.merge_cells(f"A{r}:C{r}")


# =====================================================================================================
# HOJA 7. PUNTO DE EQUILIBRIO
# =====================================================================================================
def hoja_7(L):
    ws = L.ws[H7]
    hoja_base(ws, 90)
    titulo_hoja(ws, f"7. PUNTO DE EQUILIBRIO · multiproducto (Esencial y Plus) y red · {UNIDAD}", [
        "Qué calcula: el punto de equilibrio contable y de caja del taller propio en vehículos y en pesos (años 1 a 5), con el margen de contribución ponderado por la mezcla.",
        "De dónde toma: Supuestos (precios, mezcla, cobros), Datos Fase 3 (costo del kit) y 2. Ingresos y Costos (costos fijos, depreciación, ingreso por financiamiento).",
        "A qué hoja entrega: Dashboard (equilibrio del año 1). La red se muestra aparte: cuántos talleres cubren sus costos fijos asignados.",
    ], 6)
    ws.column_dimensions["A"].width = 72
    for k in range(2, 7):
        ws.column_dimensions[col(k)].width = 16
    encabezado(ws, 6, ["Concepto"] + [f"Año {y}" for y in range(1, 6)])
    r = 7
    F = {}
    F2 = L.f2

    def fila(k, et, fn, fmt=FMT_PESOS, tot=False):
        nonlocal r
        F[k] = r
        celda(ws, f"A{r}", et, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(1, 6):
            celda(ws, f"{col(1 + y)}{r}", fn(y), fmt, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        r += 1

    c = lambda k, y: f"{col(1 + y)}{F[k]}"
    h2 = lambda k, y: f"{q(H2)}!{col(1 + y)}{F2[k]}"
    bloque(ws, r, "A. TALLER PROPIO: MARGEN DE CONTRIBUCIÓN UNITARIO (método multiproducto)", 6)
    r += 1
    fila("fac", "Factor de costo empresa promedio del año (comisiones con cargas)",
         lambda y: f"=AVERAGEIFS({q(H_MEN)}!$D${L.filas_men['fac']}:$BW${L.filas_men['fac']},{q(H_MEN)}!$D${L.filas_men['anio']}:$BW${L.filas_men['anio']},{y})", "0.0000")
    fila("e_ing", "Esencial: ingreso unitario neto (precio menos bono en las ventas con crédito)", lambda y: "=PrecioE*(1-VtaCred*Bono)")
    fila("e_cv", "Esencial: costo variable unitario (kit, garantía, sello, referidos, comisión, crédito y medio de pago)",
         lambda y: f"=KitE*(1+GarPct)+Sello+RefPct*RefMonto+ComInst*{c('fac', y)}+EvalCred*VtaCred+Incob*(1-Pie)*VtaCred*PrecioE*(1-Bono)+ComMP*(1-VtaCred)*PrecioE")
    fila("e_mc", "Esencial: margen de contribución unitario", lambda y: f"={c('e_ing', y)}-{c('e_cv', y)}")
    fila("p_ing", "Plus: ingreso unitario neto", lambda y: "=PrecioP*(1-VtaCred*Bono)")
    fila("p_cv", "Plus: costo variable unitario",
         lambda y: f"=KitP*(1+GarPct)+Sello+RefPct*RefMonto+ComInst*{c('fac', y)}+EvalCred*VtaCred+Incob*(1-Pie)*VtaCred*PrecioP*(1-Bono)+ComMP*(1-VtaCred)*PrecioP")
    fila("p_mc", "Plus: margen de contribución unitario", lambda y: f"={c('p_ing', y)}-{c('p_cv', y)}")
    fila("mix", "Mezcla Plus", lambda y: "=Mix", FMT_PCT)
    fila("mcp", "Margen de contribución ponderado por vehículo", lambda y: f"=(1-{c('mix', y)})*{c('e_mc', y)}+{c('mix', y)}*{c('p_mc', y)}", tot=True)
    fila("mcp_pct", "Margen de contribución ponderado (% del ingreso)",
         lambda y: f"={c('mcp', y)}/((1-{c('mix', y)})*{c('e_ing', y)}+{c('mix', y)}*{c('p_ing', y)})", FMT_PCT)
    r += 1
    bloque(ws, r, "B. TALLER PROPIO: PUNTO DE EQUILIBRIO (Q = costos fijos / margen ponderado; el ingreso por financiamiento se resta de los fijos)", 6)
    r += 1
    fila("cf_caja", "Costos fijos de caja del taller propio (operación, administración, ventas y marketing; sin la red)",
         lambda y: f"={h2('cf', y)}-{h2('f_nred', y)}+{h2('gav', y)}-{A(L, 'c_comemp', y)}-{h2('g_mkred', y)}")
    fila("da", "(+) Depreciación y amortización", lambda y: f"={h2('dep', y)}+{h2('amort', y)}")
    fila("fin", "(−) Ingreso por financiamiento del año (lo genera la cartera, no la venta del año)", lambda y: f"={h2('i_fin', y)}")
    fila("cf_cont", "Costos fijos contables netos a cubrir", lambda y: f"={c('cf_caja', y)}+{c('da', y)}-{c('fin', y)}", tot=True)
    fila("pe_q", "Punto de equilibrio contable (vehículos, REDONDEAR.MAS)", lambda y: f"=MAX(0,ROUNDUP({c('cf_cont', y)}/{c('mcp', y)},0))", FMT_ENTERO, True)
    fila("pe_e", "   de los cuales Esencial", lambda y: f"=ROUND({c('pe_q', y)}*(1-{c('mix', y)}),0)", FMT_ENTERO)
    fila("pe_p", "   de los cuales Plus", lambda y: f"={c('pe_q', y)}-{c('pe_e', y)}", FMT_ENTERO)
    fila("pe_v", "Punto de equilibrio contable en pesos (ingreso neto)", lambda y: f"={c('pe_e', y)}*{c('e_ing', y)}+{c('pe_p', y)}*{c('p_ing', y)}")
    fila("pe_caja", "Punto de equilibrio de caja (sin depreciación ni amortización, vehículos)",
         lambda y: f"=MAX(0,ROUNDUP(({c('cf_caja', y)}-{c('fin', y)})/{c('mcp', y)},0))", FMT_ENTERO)
    fila("inst", "Instalaciones proyectadas", lambda y: f"={A(L, 'inst', y)}", FMT_ENTERO)
    fila("ms", "Margen de seguridad = (instalaciones − equilibrio) / instalaciones", lambda y: f"=IFERROR(({c('inst', y)}-{c('pe_q', y)})/{c('inst', y)},0)", FMT_PCT)
    fila("cubre", "¿Las instalaciones cubren el equilibrio contable? (1 = sí)", lambda y: f"=IF({c('inst', y)}>={c('pe_q', y)},1,0)", "0")
    for k in ("pe_q", "pe_e", "pe_p", "pe_caja", "inst"):
        L.entero(f"7. Punto de Equilibrio: {k}", H7, f"B{F[k]}:F{F[k]}")
    r += 1
    bloque(ws, r, "C. RED DE TALLERES (aparte): talleres activos necesarios para cubrir sus costos fijos asignados", 6)
    r += 1
    fila("r_cf", "Costos fijos asignados a la red (personal de la red + marketing a talleres)", lambda y: f"={A(L, 'nom_red', y)}+{h2('g_mkred', y)}")
    fila("r_mg", "Margen anual por taller activo = suscripción anual − auditoría", lambda y: "=(RedCuota+RedHab*RedTec)*12-RedAudit")
    fila("r_pe", "Talleres activos necesarios (REDONDEAR.MAS)", lambda y: f"=IF({c('r_cf', y)}=0,0,ROUNDUP({c('r_cf', y)}/{c('r_mg', y)},0))", FMT_ENTERO, True)
    fila("r_act", "Talleres activos promedio del año (talleres-mes / 12)", lambda y: f"={A(L, 'red_cuota', y)}/RedCuota/12", FMT_DEC1)
    L.entero("7. Punto de Equilibrio: talleres de la red", H7, f"B{F['r_pe']}:F{F['r_pe']}")
    L.nombre("PE_Q", H7, f"$B${F['pe_q']}:$F${F['pe_q']}")
    r += 1
    celda(ws, f"A{r}", "Método y qué implica (primer año contable):", negrita=True, tam=9)
    r += 1
    for t in [
        f'="Q = costos fijos contables netos / margen de contribución ponderado (40% Esencial, 60% Plus). Año 1: "&FIXED(B{F["cf_cont"]}/1000000,0)&" millones / $"&FIXED(B{F["mcp"]},0)&" por vehículo = "&FIXED(B{F["pe_q"]},0)&" vehículos."',
        f'="Se proyectan "&FIXED(B{F["inst"]},0)&" instalaciones el año 1: "&IF(B{F["inst"]}>=B{F["pe_q"]},"se cubre el equilibrio contable (margen de seguridad de "&FIXED(B{F["ms"]}*100,0)&"%).","faltan "&FIXED(B{F["pe_q"]}-B{F["inst"]},0)&" para el equilibrio contable: el año 1 cierra con pérdida y la financia el capital de trabajo.")',
        f'="El equilibrio contable se alcanza en el "&IFERROR(INDEX($B$6:$F$6,MATCH(1,B{F["cubre"]}:F{F["cubre"]},0)),"(fuera del horizonte)")&". El margen por vehículo es bajo porque el kit pesa ~"&FIXED(KitMezcla/((1-Mix)*PrecioE+Mix*PrecioP)*100,0)&"% del precio neto."',
    ]:
        celda(ws, f"A{r}", t, tam=9, color=GRIS)
        ws.merge_cells(f"A{r}:F{r}")
        r += 1
    L.salidas.update(PE1=(H7, f"B{F['pe_q']}"))
    ws.freeze_panes = "B7"


# =====================================================================================================
# DASHBOARD
# =====================================================================================================
def hoja_dashboard(L, escenario):
    ws = L.ws[H_DASH]
    hoja_base(ws, 90)
    ws.sheet_properties.tabColor = CELESTE8
    ws.column_dimensions["A"].width = 2
    for k in range(2, 14):
        ws.column_dimensions[col(k)].width = 12.5
    ws.column_dimensions["N"].width = 2
    celda(ws, "B1", "LUMINE MOTORS · PLAN FINANCIERO (FASE 4)", tam=18, negrita=True, color=CELESTE8)
    ws.row_dimensions[1].height = 28
    celda(ws, "B2", f"Dashboard · {UNIDAD} · tasas reales", tam=9, color=GRIS)
    for k in range(2, 14):
        ws.cell(row=2, column=k).border = B_TITULO
    celda(ws, "B3", "VERSIÓN DE TRABAJO: demanda con techo 100% (optimista), tasas, reglamento y precio provisorios", tam=10, negrita=True,
          relleno=F_BANNER, alin=IZQ)
    ws.merge_cells("B3:M3")
    ws.row_dimensions[3].height = 20
    # selectores y estado
    celda(ws, "B5", "Escenario ▸", tam=10, negrita=True, color=GRIS, alin=DER)
    celda(ws, "C5", escenario, tam=11, negrita=True, relleno=RELLENO["S"], alin=CEN, borde=B_CAJA)
    ws.merge_cells("C5:D5")
    dv = DataValidation(type="list", formula1="EscNom", allow_blank=False, showDropDown=False, showErrorMessage=True)
    dv.error = "Elige Base, Pesimista u Optimista"
    ws.add_data_validation(dv)
    dv.add("C5")
    celda(ws, "F5", "Sensibilidad activa:", tam=9, color=GRIS, alin=DER)
    celda(ws, "G5", "=SensActiva", tam=9, negrita=True)
    ws.merge_cells("G5:I5")
    celda(ws, "J5", "Controles:", tam=9, color=GRIS, alin=DER)
    celda(ws, "K5", '=IF(Ctrl_Total=0,"OK (todos en 0)","REVISAR")', tam=9, negrita=True)
    ws.merge_cells("K5:M5")
    celda(ws, "J6", "Sensibilidades:", tam=9, color=GRIS, alin=DER)
    celda(ws, "K6", "=Anx_Estado", tam=9, negrita=True)
    ws.merge_cells("K6:M6")
    ws.conditional_formatting.add("K5", FormulaRule(formula=['$K$5<>"OK (todos en 0)"'], font=fuente(9, True, "FFB42318")))
    ws.conditional_formatting.add("K6", FormulaRule(formula=['LEFT($K$6,2)<>"OK"'], font=fuente(9, True, "FFB42318")))
    ws.conditional_formatting.add("G5", FormulaRule(formula=['$G$5<>"Base"'], font=fuente(9, True, "FFB42318"), fill=F_BANNER))

    def tarjeta(c0, fila, etiqueta, formula, fmt, sub):
        cc = [col(c0 + k) for k in range(4)]
        for k in range(4):
            ws[f"{cc[k]}{fila}"].border = B_TARJETA_SUP
        celda(ws, f"{cc[0]}{fila}", etiqueta.upper(), tam=9, negrita=True, color=GRIS)
        ws.merge_cells(f"{cc[0]}{fila}:{cc[3]}{fila}")
        celda(ws, f"{cc[0]}{fila + 1}", formula, fmt, tam=26, negrita=True, alin=IZQ)
        ws.merge_cells(f"{cc[0]}{fila + 1}:{cc[3]}{fila + 1}")
        ws.row_dimensions[fila + 1].height = 38
        celda(ws, f"{cc[0]}{fila + 2}", sub, tam=9, color=GRIS, alin=IZQ)
        ws.merge_cells(f"{cc[0]}{fila + 2}:{cc[3]}{fila + 2}")

    fmt_mm = '"$ "#,##0,," M";"−$ "#,##0,," M";"$ 0"'
    tarjeta(2, 8, "VAN del flujo puro (Ku)", "=VAN_Ku", fmt_mm, '="Ku "&FIXED(Ku*100,1)&"% real (provisoria) · a WACC: $"&FIXED(VAN_WACC/1000000,0)&" M"')
    tarjeta(6, 8, "TIR del flujo puro", "=TIR_Puro", FMT_PCT, '="Inversionista (40% deuda): "&IF(ISNUMBER(TIR_Inv),FIXED(TIR_Inv*100,1)&"%",TIR_Inv)')
    tarjeta(10, 8, "Payback descontado", "=PB_Desc", '0.0" años"', '="Simple: "&IF(ISNUMBER(PB_Simple),FIXED(PB_Simple,1)&" años",PB_Simple)')
    tarjeta(2, 12, "Inversión del año 0", "=Inv0_Total", fmt_mm, '="Activos $"&FIXED(Inv0Cap/1000000,0)&" M + capital de trabajo $"&FIXED(INDEX(CT_Inv,1)/1000000,0)&" M"')
    tarjeta(6, 12, "Punto de equilibrio año 1", "=INDEX(PE_Q,1)", '#,##0" vehículos"', '="Proyectadas: "&FIXED(INDEX(H2_Inst,1),0)&" instalaciones el año 1"')
    tarjeta(10, 12, "EBITDA del año 5", "=INDEX(H2_EBITDA,5)", fmt_mm, '="Margen EBITDA "&FIXED(INDEX(H2_EBITDA,5)/INDEX(H2_Ing,5)*100,1)&"%"')
    # tabla de ingresos
    r = 16
    celda(ws, f"B{r}", "INGRESOS POR LÍNEA (millones de $)", tam=10, negrita=True, color=CELESTE8)
    r = 17
    encabezado(ws, r, ["Línea", "", "", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "Total"], 2)
    ws.merge_cells(f"B{r}:D{r}")
    lineas = [("Taller propio (instalaciones netas)", "H2_Prop"), ("Financiamiento a clientes", "H2_Fin"),
              ("Red de talleres", "H2_RedIng"), ("   de la cual suscripción Lumine Habilita Red", "H2_Rec"), ("Total ingresos", "H2_Ing")]
    for k, (et, nom) in enumerate(lineas):
        rr = r + 1 + k
        tot = nom == "H2_Ing"
        bd = B_TOTAL if tot else B_FILA
        celda(ws, f"B{rr}", et, tam=9, negrita=tot, borde=bd, color=GRIS if "de la cual" in et else TINTA)
        ws[f"C{rr}"].border = ws[f"D{rr}"].border = bd
        ws.merge_cells(f"B{rr}:D{rr}")
        for y in range(1, 6):
            celda(ws, f"{col(4 + y)}{rr}", f"=INDEX({nom},{y})/1000000", '#,##0;-#,##0;"-"', tam=9, negrita=tot, borde=bd)
        celda(ws, f"J{rr}", f"=SUM(E{rr}:I{rr})", '#,##0;-#,##0;"-"', tam=9, negrita=True, borde=bd)
    # datos de los gráficos (debajo de los gráficos)
    rd = 46
    celda(ws, f"B{rd - 1}", "Datos de los gráficos (millones de $ y vehículos)", tam=9, negrita=True, color=GRIS)
    encabezado(ws, rd, ["Serie", "Año 0", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"], 2)
    series = [("Flujo de caja puro", lambda y: f"=INDEX(FC_Puro,{y + 1})/1000000"),
              ("Valor de desecho", lambda y: "=VD/1000000" if y == 5 else "=0"),
              ("Flujo positivo", lambda y: f"=MAX(0,{col(3 + y)}{rd + 1}-{col(3 + y)}{rd + 2})"),
              ("Flujo negativo", lambda y: f"=MIN(0,{col(3 + y)}{rd + 1}-{col(3 + y)}{rd + 2})")]
    for k, (et, fn) in enumerate(series):
        rr = rd + 1 + k
        celda(ws, f"B{rr}", et, tam=9, color=GRIS)
        for y in range(6):
            celda(ws, f"{col(3 + y)}{rr}", fn(y), FMT_DEC1, tam=9, color=GRIS)
    rd2 = rd + 6
    encabezado(ws, rd2, ["Serie", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"], 2)
    for k, (et, key) in enumerate([("Instalaciones propias", "inst"), ("Capacidad nominal", "capm"), ("Capacidad al 80% (regla)", "cap80")]):
        rr = rd2 + 1 + k
        celda(ws, f"B{rr}", et, tam=9, color=GRIS)
        for y in range(1, 6):
            celda(ws, f"{col(2 + y)}{rr}", f"=ROUND({A(L, key, y)},0)", FMT_ENTERO, tam=9, color=GRIS)

    def etiquetas(fmt):
        d = DataLabelList(showVal=True, showSerName=False, showCatName=False, showLegendKey=False, showPercent=False,
                          showBubbleSize=False, showLeaderLines=False)
        d.numFmt = fmt
        return d

    # gráfico 1: flujo de caja puro (el valor de desecho del año 5 aparte, en celeste claro)
    g1 = BarChart()
    g1.type = "col"
    g1.grouping = "stacked"
    g1.overlap = 100
    g1.gapWidth = 55
    for k in (3, 4, 2):
        g1.add_data(Reference(ws, min_col=2, max_col=8, min_row=rd + k), titles_from_data=True, from_rows=True)
    g1.set_categories(Reference(ws, min_col=3, max_col=8, min_row=rd))
    for s_, color in zip(g1.series, (CELESTE, "8B9598", "A9DDF6")):
        s_.graphicalProperties = GraphicalProperties(solidFill=color)
        s_.graphicalProperties.line.solidFill = color
        s_.dLbls = etiquetas('#,##0;-#,##0;;')
    g1.legend.position = "t"
    g1.y_axis.numFmt = '#,##0'
    g1.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill="E6E7EA"))
    g1.y_axis.delete = False
    g1.x_axis.delete = False
    g1.height, g1.width = 9.2, 14.6
    estilo_grafico(g1, "Flujo de caja puro por año (millones de $)")
    for s_ in g1.series:
        s_.dLbls.txPr = _txt(800)
    ws.add_chart(g1, "B24")
    # gráfico 2: instalaciones vs capacidad
    g2 = BarChart()
    g2.type = "col"
    g2.add_data(Reference(ws, min_col=2, max_col=7, min_row=rd2 + 1), titles_from_data=True, from_rows=True)
    g2.set_categories(Reference(ws, min_col=3, max_col=7, min_row=rd2))
    g2.series[0].graphicalProperties = GraphicalProperties(solidFill=CELESTE)
    g2.series[0].graphicalProperties.line.solidFill = CELESTE
    g2.series[0].dLbls = etiquetas('#,##0')
    g2.gapWidth = 70
    ln = LineChart()
    for k in (2, 3):
        ln.add_data(Reference(ws, min_col=2, max_col=7, min_row=rd2 + k), titles_from_data=True, from_rows=True)
    ln.series[0].graphicalProperties.line.solidFill = "1D1D1F"
    ln.series[0].graphicalProperties.line.width = 28000
    ln.series[1].graphicalProperties.line.solidFill = "8B9598"
    ln.series[1].graphicalProperties.line.dashStyle = "dash"
    ln.series[1].graphicalProperties.line.width = 22000
    for s_ in ln.series:
        s_.smooth = False
        s_.marker.symbol = "none"
    g2 += ln
    g2.legend.position = "t"
    g2.y_axis.numFmt = '#,##0'
    g2.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill="E6E7EA"))
    g2.y_axis.delete = False
    g2.x_axis.delete = False
    g2.height, g2.width = 9.2, 14.6
    estilo_grafico(g2, "Instalaciones propias contra la capacidad (vehículos)")
    g2.series[0].dLbls.txPr = _txt(800)
    ws.add_chart(g2, "H24")
    celda(ws, "B43", "Hojas: 1 Inversión · 2 Ingresos y Costos · 3 Capital de Trabajo · 4 Flujo Puro · 5 Apalancado · 6 Tasa · 7 Equilibrio · Anexos (sensibilidades)",
          tam=8, color=GRIS, cursiva=True)
    L.nombre("H2_Inst", H2, f"$B${L.f2['inst']}:$F${L.f2['inst']}")
    L.nombre("EscenarioSel", H_DASH, "$C$5")
    ws.print_area = "A1:N43"
    ws.page_setup.fitToHeight = 1


# =====================================================================================================
# ANEXOS (sensibilidades: selector + foto de valores + tornado)
# =====================================================================================================
PUENTE = [("P1", "Puente 1 · motor v4 con los supuestos de la v3 (kit realista, 50% a crédito, tasa nominal, CT = saldo, equipo en −3)"),
          ("P2", "Puente 2 · + kit al punto medio"),
          ("P3", "Puente 3 · + 30% de las ventas a crédito"),
          ("P4", "Puente 4 · + tasa del crédito en real (Fisher)"),
          ("P5", "Puente 5 · + capital de trabajo del año 1 con déficit acumulado (método de clase)")]
V3_ORIGINAL = dict(van=-89689831.33, tir=0.0644, pb="> 5 años")  # valores del archivo v3_TIR6_actual.xlsx (foto)


def hoja_anexos(L, S, foto, caso_activo):
    ws = L.ws[H_ANX]
    hoja_base(ws, 90)
    titulo_hoja(ws, "ANEXOS · sensibilidades del flujo puro (selector + foto de valores), puente v3 → v4 y escenarios", [
        "Qué calcula: el efecto de cada supuesto sensible en el VAN y la TIR del flujo puro. Un caso activo a la vez (selector); la tabla «foto» guarda los resultados como valores.",
        "De dónde toma: las alternativas A–C de Supuestos (columna E a G) y el peso del costeo del kit de Datos Fase 3. La foto la genera calcular.py con LibreOffice.",
        "A qué hoja entrega: Supuestos (código de la sensibilidad activa) y Dashboard (estado de la foto). Dejar el selector en «Base».",
    ], 9)
    for c, w in zip("ABCDEFGHI", [5, 66, 13, 17, 17, 13, 13, 17, 13]):
        ws.column_dimensions[c].width = w
    celda(ws, "B6", "Caso de sensibilidad activo  ▸", negrita=True, alin=DER)
    celda(ws, "C6", caso_activo, negrita=True, relleno=RELLENO["S"], alin=IZQ, borde=B_CAJA)
    ws.merge_cells("C6:E6")
    L.nombre("SensActiva", H_ANX, "$C$6")
    celda(ws, "F6", "Código:", tam=9, color=GRIS, alin=DER)
    celda(ws, "G6", "=SensCod", tam=9, negrita=True)
    ws.conditional_formatting.add("C6", FormulaRule(formula=['$C$6<>"Base"'], fill=F_BANNER, font=fuente(10, True, "FFB42318")))
    # lista de casos
    casos = [dict(nombre="Base", codigo="BASE", parametro="—", base=None, valor=None, fmt=None, grupo="base")]
    casos += [c for c in S.casos]
    casos.append(dict(nombre="Costo del kit: realista de la Fase 3 (v3)", codigo="PesoReal_A", parametro="Peso del costeo realista en el kit",
                      base="PesoReal_base", valor=f"{q(H_F3)}!$E$42", fmt=FMT_PCT, grupo="sens"))
    casos.append(dict(nombre="Costo del kit: mejor caso", codigo="PesoReal_B", parametro="Peso del costeo realista en el kit",
                      base="PesoReal_base", valor=f"{q(H_F3)}!$F$42", fmt=FMT_PCT, grupo="sens"))
    for cod, nom in PUENTE:
        casos.append(dict(nombre=nom, codigo=cod, parametro="Combinación (ver Supuestos: valores usados)", base=None, valor=None, fmt=None, grupo="puente"))
    L.casos = casos
    r = 8
    bloque(ws, r, "1. CASOS DE SENSIBILIDAD (el valor del caso es la alternativa de Supuestos; elige el caso en la celda C6)", 9)
    r += 1
    encabezado(ws, r, ["N.º", "Caso", "Código", "Supuesto que cambia", "Valor base", "Valor del caso", "", "", ""])
    r0 = r + 1
    for k, cdef in enumerate(casos):
        rr = r0 + k
        celda(ws, f"A{rr}", k, "0", tam=9, color=GRIS, alin=CEN, borde=B_FILA)
        celda(ws, f"B{rr}", cdef["nombre"], tam=9, borde=B_FILA)
        celda(ws, f"C{rr}", cdef["codigo"], tam=9, color=GRIS, borde=B_FILA)
        celda(ws, f"D{rr}", cdef["parametro"], tam=8, color=GRIS, borde=B_FILA)
        if cdef["base"]:
            celda(ws, f"E{rr}", "=" + cdef["base"], cdef["fmt"], tam=9, borde=B_FILA)
            celda(ws, f"F{rr}", "=" + cdef["valor"], cdef["fmt"], tam=9, negrita=True, borde=B_FILA)
        else:
            ws[f"E{rr}"].border = ws[f"F{rr}"].border = B_FILA
    r1 = r0 + len(casos) - 1
    L.nombre("Anx_Caso", H_ANX, f"$B${r0}:$B${r1}")
    L.nombre("Anx_Cod", H_ANX, f"$C${r0}:$C${r1}")
    dv = DataValidation(type="list", formula1="Anx_Caso", allow_blank=False, showErrorMessage=True)
    ws.add_data_validation(dv)
    dv.add("C6")
    # foto
    r = r1 + 2
    bloque(ws, r, "2. SENSIBILIDADES (FOTO DE VALORES: no se recalcula sola; volver a correr calcular.py si cambian los supuestos)", 9)
    r += 1
    ts = foto.get("fecha", "sin foto") if foto else "sin foto"
    celda(ws, f"B{r}", f"Foto tomada: {ts} · motor: LibreOffice {foto.get('motor', '') if foto else ''}", tam=9, color=GRIS)
    r += 1
    celda(ws, f"B{r}", "Control: VAN base de la foto − VAN base en vivo", tam=9, color=GRIS)
    van_foto = foto["base"]["van"] if foto else 0
    celda(ws, f"C{r}", van_foto, FMT_PESOS, tam=9, color=GRIS)
    celda(ws, f"D{r}", f'=IF(SensActiva<>"Base","SELECTOR FUERA DE BASE",IF(EscSel<>"Base","ESCENARIO "&UPPER(EscSel)&" ACTIVO: la foto es del escenario Base",IF(ROUND(C{r}-VAN_Ku,0)=0,"OK: foto vigente","FOTO DESACTUALIZADA: volver a correr las sensibilidades")))',
          tam=9, negrita=True)
    ws.merge_cells(f"D{r}:H{r}")
    ws.conditional_formatting.add(f"D{r}", FormulaRule(formula=[f'LEFT($D${r},2)<>"OK"'], fill=PatternFill("solid", fgColor="FFFDE2E1"),
                                                        font=fuente(9, True, "FFB42318")))
    L.nombre("Anx_Estado", H_ANX, f"$D${r}")
    r += 1
    encabezado(ws, r, ["", "Caso", "Valor del supuesto", "VAN flujo puro (Ku)", "TIR flujo puro", "Payback desc.", "Δ VAN vs base", "Δ TIR (pp)", ""])
    r += 1
    rf0 = r
    fsens = [c for c in (foto or {}).get("casos", []) if c["grupo"] in ("base", "sens")]
    for k, c in enumerate(fsens):
        rr = rf0 + k
        celda(ws, f"B{rr}", c["nombre"], tam=9, negrita=c["grupo"] == "base", borde=B_FILA)
        celda(ws, f"C{rr}", c.get("valor_txt", ""), tam=9, color=GRIS, alin=DER, borde=B_FILA)
        celda(ws, f"D{rr}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{rr}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{rr}", c["pb"], '0.0" años"', tam=9, borde=B_FILA, alin=DER)
        celda(ws, f"G{rr}", c["van"] - van_foto, FMT_PESOS, tam=9, borde=B_FILA)
        dt = (c["tir"] - foto["base"]["tir"]) * 100 if isinstance(c["tir"], (int, float)) and isinstance(foto["base"]["tir"], (int, float)) else None
        celda(ws, f"H{rr}", dt, '+0.0;-0.0;0.0', tam=9, borde=B_FILA)
    if not fsens:
        celda(ws, f"B{rf0}", "Sin foto: correr calcular.py", tam=9, color=GRIS)
    r = rf0 + max(1, len(fsens)) + 1
    # tornado
    bloque(ws, r, "3. TORNADO: variación del VAN del flujo puro por caso (millones de $; de mayor a menor impacto)", 9)
    r += 1
    rt0 = r
    encabezado(ws, r, ["", "Caso", "Δ VAN (MM$)", "Sube", "Baja", "", "", "", ""])
    tor = sorted([c for c in fsens if c["grupo"] == "sens"], key=lambda c: abs(c["van"] - van_foto), reverse=True)
    tor = [c for c in tor if abs(c["van"] - van_foto) >= 0.5e6]
    for k, c in enumerate(tor):  # de mayor a menor impacto (el gráfico invierte el eje de categorías)
        rr = rt0 + 1 + k
        d = (c["van"] - van_foto) / 1e6
        celda(ws, f"B{rr}", c["nombre"], tam=9, borde=B_FILA)
        celda(ws, f"C{rr}", d, FMT_DEC1, tam=9, borde=B_FILA)
        celda(ws, f"D{rr}", f"=MAX(0,C{rr})", FMT_DEC1, tam=9, color=GRIS, borde=B_FILA)
        celda(ws, f"E{rr}", f"=MIN(0,C{rr})", FMT_DEC1, tam=9, color=GRIS, borde=B_FILA)
    if tor:
        g = BarChart()
        g.type = "bar"
        g.grouping = "stacked"
        g.overlap = 100
        g.gapWidth = 40
        g.title = "Δ VAN del flujo puro contra la base (millones de $)"
        n = len(tor)
        g.add_data(Reference(ws, min_col=4, max_col=5, min_row=rt0, max_row=rt0 + n), titles_from_data=True)
        g.set_categories(Reference(ws, min_col=2, min_row=rt0 + 1, max_row=rt0 + n))
        for s, colr in zip(g.series, (CELESTE, "8B9598")):
            s.graphicalProperties = GraphicalProperties(solidFill=colr)
        g.legend.position = "t"
        g.x_axis.delete = False
        g.y_axis.delete = False
        g.y_axis.numFmt = '#,##0'
        g.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill="E6E7EA"))
        g.x_axis.scaling.orientation = "maxMin"
        g.height = max(9, 0.55 * n + 3)
        g.width = 24
        for s_ in g.series:
            s_.dLbls = DataLabelList(showVal=True, showSerName=False, showCatName=False, showLegendKey=False, showPercent=False,
                                     showBubbleSize=False, showLeaderLines=False)
            s_.dLbls.numFmt = '#,##0;-#,##0;;'
        estilo_grafico(g, "Δ VAN del flujo puro contra la base (millones de $)")
        for s_ in g.series:
            s_.dLbls.txPr = _txt(800)
        ws.add_chart(g, f"B{rt0 + n + 2}")
    alto = int(max(9, 0.55 * len(tor) + 3) * 2) + 2 if tor else 0
    r = rt0 + len(tor) + 3 + alto
    # escenarios
    bloque(ws, r, "4. ESCENARIOS DEL DASHBOARD (foto)", 9)
    r += 1
    encabezado(ws, r, ["", "Escenario", "Demanda × precio × costo", "VAN flujo puro (Ku)", "TIR flujo puro", "Payback desc.", "", "", ""])
    r += 1
    for c in (foto or {}).get("escenarios", []):
        celda(ws, f"B{r}", c["nombre"], tam=9, borde=B_FILA)
        celda(ws, f"C{r}", c.get("valor_txt", ""), tam=9, color=GRIS, borde=B_FILA)
        celda(ws, f"D{r}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{r}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{r}", c["pb"], '0.0" años"', tam=9, borde=B_FILA, alin=DER)
        r += 1
    r += 1
    bloque(ws, r, "5. PUENTE DE LA v3 A LA v4 (foto): qué cambió y cuánto mueve la TIR", 9)
    r += 1
    encabezado(ws, r, ["", "Paso", "", "VAN flujo puro (Ku)", "TIR flujo puro", "Payback desc.", "Δ TIR del paso (pp)", "", ""])
    r += 1
    celda(ws, f"B{r}", "v3 original (archivo v3_TIR6_actual.xlsx: motor anterior)", tam=9, borde=B_FILA)
    celda(ws, f"D{r}", V3_ORIGINAL["van"], FMT_PESOS, tam=9, borde=B_FILA)
    celda(ws, f"E{r}", V3_ORIGINAL["tir"], FMT_PCT, tam=9, borde=B_FILA)
    celda(ws, f"F{r}", V3_ORIGINAL["pb"], tam=9, alin=DER, borde=B_FILA)
    r += 1
    previo = V3_ORIGINAL["tir"]
    pasos = [c for c in (foto or {}).get("casos", []) if c["grupo"] == "puente"]
    if foto:
        pasos.append(dict(nombre="v4 base · + equipamiento del taller 1 en el mes −9 (Proyecto Experimental)", van=foto["base"]["van"],
                          tir=foto["base"]["tir"], pb=foto["base"]["pb"]))
    for c in pasos:
        celda(ws, f"B{r}", c["nombre"], tam=9, borde=B_FILA, negrita=c["nombre"].startswith("v4 base"))
        celda(ws, f"D{r}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{r}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{r}", c["pb"], '0.0" años"', tam=9, borde=B_FILA, alin=DER)
        if isinstance(c["tir"], (int, float)) and isinstance(previo, (int, float)):
            celda(ws, f"G{r}", (c["tir"] - previo) * 100, '+0.0;-0.0;0.0', tam=9, borde=B_FILA)
            previo = c["tir"]
        r += 1
    r += 1
    celda(ws, f"B{r}", "Sobredotación de técnicos (revisada): la regla del 80% exige 25% de holgura por diseño y los dúos son enteros; ver Anual, "
                       "«Utilización» y «Capacidad sobre la regla del 80%», y los casos «Regla de dúos al 90% / 100%».", tam=9, color=GRIS, alin=IZQ_W)
    ws.merge_cells(f"B{r}:I{r}")
    ws.row_dimensions[r].height = 26
    ws.freeze_panes = "A7"


# =====================================================================================================
# PENDIENTES Y REGISTRO
# =====================================================================================================
def hoja_pendientes(L):
    ws = L.ws[H_PEN]
    hoja_base(ws, 95)
    titulo_hoja(ws, "PENDIENTES · lo que falta decidir o cotizar (no se inventa: va marcado en amarillo en Supuestos)", [
        "Qué calcula: nada; lista las decisiones abiertas del Plan Financiero y dónde impactan.",
        "De dónde toma: traspaso de la Fase 4 (08-11-2026) y la revisión de la v4.",
        "A qué hoja entrega: a las que se indican en la columna «Dónde impacta».",
    ], 4)
    for c, w in zip("ABCD", [5, 80, 34, 40]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 6, ["N.º", "Pendiente", "Dónde impacta", "Cómo se resuelve"])
    pend = [
        ("Tasas: beta, riesgo de empresa nueva y si se descuenta con Ku o WACC", "6. Tasa, 4 y 5", "Decisión del equipo con el profesor"),
        ("Techo de la demanda con las 33 respuestas de la encuesta (hoy 100%, optimista)", "Supuestos F", "Análisis de la encuesta"),
        ("Arancel del 3CV (D.S. 33/2004)", "Supuestos H", "Solicitud por Ley de Transparencia"),
        ("Seguro de responsabilidad civil del Proyecto Experimental", "Supuestos K", "Cotización"),
        ("Desglose de la habilitación del local ($15 M)", "Supuestos K", "Cotización por partidas"),
        ("Software y licencias por cotizar", "Supuestos K", "Cotización"),
        ("Recotizar el dinamómetro (Mainline Dyno)", "Supuestos K", "Cotización actualizada"),
        ("Fuente y tasa del crédito bancario", "5. Flujo Apalancado", "Cotización bancaria o CORFO"),
        ("Crédito por remuneraciones (Ley 21.850) y depreciación instantánea Pro Pyme", "4. Flujo Puro", "Revisión tributaria"),
        ("Personal de la red y ritmo de incorporación de talleres (3, 5 y 8)", "Supuestos H y J", "Decisión del equipo"),
        ("Respaldar el costo del kit al punto medio ($3,04 M la mezcla) con cotizaciones de componentes", "Datos Fase 3", "Cotizaciones (el peso del costo en el VAN es el mayor)"),
        ("Regla de dúos al 80%: confirmar si la capacidad de 15,75 vehículos ya descuenta tiempos muertos (si es así, la holgura se duplica)", "Supuestos G", "Revisar el cálculo de la Fase 3"),
        ("Confirmar con qué equipamiento se hace el Proyecto Experimental (v4 compra el del taller 1 en el mes −9)", "Supuestos G y K", "Decisión del equipo"),
        ("Tasa del crédito directo: el contrato es 1,5% mensual nominal; el modelo usa su equivalente real (Fisher)", "Supuestos I", "Confirmar la tasa con referencias de mercado"),
        ("Fase 5: corregir la Tabla 7 y el texto de la Fase 3 que dice que Lumine distribuye kits a la red", "Informe Fase 3", "Redacción"),
        ("Informe Word de la Fase 4 (Carta, TNR 12, 1,5, márgenes 4/2,5, APA): objetivos y estrategias de financiamiento al final", "Informe", "Sección por sección"),
    ]
    for k, (p, d, c) in enumerate(pend, start=1):
        r = 6 + k
        celda(ws, f"A{r}", k, "0", alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", p, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"C{r}", d, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"D{r}", c, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
        ws.row_dimensions[r].height = 28


def hoja_registro(L):
    ws = L.ws[H_REG]
    hoja_base(ws, 95)
    titulo_hoja(ws, "REGISTRO DE CAMBIOS · v4 (08-11-2026)", [
        "Qué calcula: nada; anota cada cambio relevante (hoja, qué se hizo y por qué).",
        "De dónde toma: el traspaso de la Fase 4 y la revisión de la v3.",
        "A qué hoja entrega: —",
    ], 4)
    for c, w in zip("ABCD", [12, 26, 80, 60]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 6, ["Fecha", "Hoja", "Qué se hizo", "Motivo"])
    cambios = [
        ("Supuestos / Datos Fase 3", "Costo del kit al punto medio entre el costeo realista de la Fase 3 actualizado y el mejor caso (peso 50%): mezcla ≈ $3,04 M con forward (v3: $3,25 M).",
         "Decisión del equipo (traspaso §6). Los extremos van como sensibilidad."),
        ("Supuestos", "30% de las ventas con crédito directo (v3: 50%).", "Decisión del equipo (traspaso §6)."),
        ("Mensual / Anual", "El motor es mensual para los 60 meses (antes: meses −12 a 24 y años 3 a 5 anuales). Anual es el espejo de Mensual.",
         "Las mismas reglas todos los meses (dúos, talleres, red, crédito y capital de trabajo), sin aproximaciones anuales."),
        ("Mensual", "Crédito directo como cartera: cuota = PAGO × colocaciones vigentes; interés = saldo × tasa.",
         "Es idéntico a sumar PAGOINT y PAGOPRIN por cohorte (verificado con el modelo espejo), con 4 filas en vez de 48."),
        ("Supuestos (bloque I)", "La tasa del crédito al cliente (1,5% mensual nominal) se usa en real con Fisher (≈ 1,25% mensual).",
         "El modelo está en pesos constantes (A0.2: tasas nominales a reales con Fisher). Resta ~1 pp de TIR."),
        ("3. Capital de Trabajo", "El año 1 usa el déficit acumulado máximo del flujo operativo mensual (método de clase); la v3 tomaba el máximo del saldo.",
         "Método acordado (traspaso §2): requerimiento del año 1 = MÁX(déficit acumulado máximo; saldo al cierre)."),
        ("Supuestos (bloque G)", "El equipamiento del taller 1 y el primer puesto se compran en el mes −9.", "El Proyecto Experimental instala y mide 6 kits en el taller 1 (v3: mes −3)."),
        ("Anual / Anexos", "Sobredotación revisada: sin error de fórmula. Se agregan la capacidad al 80%, la utilización y los casos «Regla de dúos al 90% / 100%».",
         "Capacidad 486 contra 335 instalaciones el año 1: 25% de holgura por la regla del 80% más el salto a un tercer dúo en mayo (jornada de 40 horas)."),
        ("Supuestos", "Una sola página de entradas por bloques; alternativas A–C junto a cada supuesto sensible y columna «Valor usado».",
         "Ordenar las 273 filas de la v3; el modelo lee solo la columna «Valor usado»."),
        ("Dashboard", "Seis indicadores con formato, tabla de ingresos por línea y dos gráficos (flujo puro; instalaciones contra capacidad).", "Instrucción del equipo."),
        ("Anexos", "Foto de sensibilidades tomada con LibreOffice, tornado, escenarios y puente v3 → v4.", "PROMPT_sensibilidades: el complemento de Excel no crea tablas de datos."),
        ("1. Inversión", "Valor de desecho económico solo como referencia (no entra al flujo).", "Decisión del equipo: método contable."),
        ("Hojas grises", "Copiadas byte a byte desde la v3 (injertar.py).", "No se tocan las hojas del semestre anterior."),
    ]
    for k, (h, q_, m) in enumerate(cambios):
        r = 7 + k
        celda(ws, f"A{r}", "08-11-2026", tam=9, borde=B_FILA)
        celda(ws, f"B{r}", h, tam=9, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"C{r}", q_, tam=9, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"D{r}", m, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
        ws.row_dimensions[r].height = 30


# =====================================================================================================
def construir(salida, foto=None, caso="Base", escenario="Base", manifiesto=None):
    MENSUAL_OK = MENSUAL  # noqa
    L = Libro()
    S = hoja_supuestos(L, caso)
    hoja_fase3(L)
    hoja_mensual(L)
    hoja_anual(L)
    hoja_1(L)
    hoja_2(L)
    hoja_3(L)
    hoja_4(L)
    hoja_5(L)
    hoja_6(L)
    hoja_7(L)
    hoja_dashboard(L, escenario)
    hoja_anexos(L, S, foto, caso)
    hoja_pendientes(L)
    hoja_registro(L)
    # control total: suma de |controles|
    partes = []
    for desc, hoja, rango in L.controles:
        partes.append(f"SUMPRODUCT(ABS({q(hoja)}!{rango.replace(':', ':') if ':' in rango else rango}))")
    ws = L.ws[H_REG]
    fila = 7 + 14
    celda(ws, f"B{fila}", "Suma de |controles| del modelo (debe dar 0)", tam=9, color=GRIS)
    celda(ws, f"C{fila}", "=ROUND(" + "+".join(partes) + ",0)", FMT_PESOS, tam=9, negrita=True)
    L.nombre("Ctrl_Total", H_REG, f"$C${fila}")
    L.guardar(salida)
    if manifiesto:
        info = dict(hojas=ORDEN, controles=L.controles, enteros=L.enteros, casos=[dict(nombre=c["nombre"], codigo=c["codigo"], grupo=c["grupo"],
                    valor=c["valor"], fmt=c["fmt"]) for c in L.casos], filas_men=L.filas_men, filas_anu=L.filas_anu, nombres=L.nombres,
                    escenarios=["Base", "Pesimista", "Optimista"])
        with open(manifiesto, "w", encoding="utf-8") as fh:
            json.dump(info, fh, ensure_ascii=False, indent=1)
    return L


if __name__ == "__main__":
    args = sys.argv[1:]
    salida = args[0]
    foto = None
    caso, esc, man = "Base", "Base", None
    rest = args[1:]
    i = 0
    while i < len(rest):
        if rest[i] == "--caso":
            caso = rest[i + 1]; i += 2
        elif rest[i] == "--escenario":
            esc = rest[i + 1]; i += 2
        elif rest[i] == "--manifiesto":
            man = rest[i + 1]; i += 2
        else:
            with open(rest[i], encoding="utf-8") as fh:
                foto = json.load(fh)
            i += 1
    construir(salida, foto, caso, esc, man)
    print("ok", salida)
