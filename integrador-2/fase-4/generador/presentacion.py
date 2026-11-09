"""Índice, Dashboard, Sensibilidades y Mensual (años 0 a 2) visibles; Controles, Pendientes y Registro de cambios ocultas.

Impresión: cada hoja visible cabe en el ancho de una página Carta horizontal a 100%, así ninguna letra impresa queda bajo
9 pt. Eso da unas 128 unidades de ancho de Excel como máximo (7 px cada una; al imprimir, Excel la agranda ~9%).
"""
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.drawing.line import LineProperties
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.hyperlink import Hyperlink
from openpyxl.worksheet.pagebreak import Break

from base import (H1, H2, H3, H4, H5, H6, H7, H_CTRL, H_DASH, H_IDX, H_M02, H_MEN, H_PEN, H_REG, H_SENS, H_SUP, H_SUPC,
                  OCULTAS, UNIDAD, VISIBLES, _txt, estilo_grafico, indicador, mc, q, rot_anio)
from estilo import (B_CAJA, B_ENC, B_FILA, B_TARJETA_SUP, B_TITULO, B_TOTAL, CELESTE, CELESTE8, CEN, DER, F_BANNER, F_ENC, FMT_DEC1,
                    FMT_ENTERO, FMT_MM1, FMT_PCT, FMT_PESOS, GRIS, GRIS_LINEA, IZQ, IZQ_W, RELLENO, ROJO, TINTA, bloque, celda, col,
                    encabezado, fuente, hoja_base, plegar, titular)

FMT_GRAF = '#,##0.0,,;-#,##0.0,,;;'      # etiquetas de gráficos en millones, sin mostrar ceros
FMT_TARJ_MM = '"$"#,##0.0,," M";"−$"#,##0.0,," M";"$0 M"'
ROJO_SUAVE = PatternFill("solid", fgColor="FFFDE2E1")
CM_PX = 2.54 / 96                         # centímetros por píxel de Excel a 100%


def _etiquetas(tam=900):
    d = DataLabelList(showVal=True, showSerName=False, showCatName=False, showLegendKey=False, showPercent=False,
                      showBubbleSize=False, showLeaderLines=False)
    d.txPr = _txt(tam)
    return d


def _enc(ws, fila, valores, col_ini, tam=10, alto=None):
    """Encabezado celeste con texto blanco del tamaño pedido."""
    for k, v in enumerate(valores):
        c = ws.cell(row=fila, column=col_ini + k, value=v)
        c.fill = F_ENC
        c.font = fuente(tam, True, "FFFFFFFF")
        c.alignment = Alignment(horizontal="center" if k else "left", vertical="center", wrap_text=True)
    if alto:
        ws.row_dimensions[fila].height = alto


def _barras(ws, filas_series, cats, colores, apilado=True):
    g = BarChart()
    g.type = "col"
    if apilado:
        g.grouping = "stacked"
        g.overlap = 100
    g.gapWidth = 55
    for fila, c0, c1 in filas_series:
        g.add_data(Reference(ws, min_col=c0, max_col=c1, min_row=fila), titles_from_data=True, from_rows=True)
    g.set_categories(cats)
    for s_, color in zip(g.series, colores):
        s_.graphicalProperties = GraphicalProperties(solidFill=color)
        s_.graphicalProperties.line.solidFill = color
    g.y_axis.numFmt = '#,##0,,'
    g.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill="E6E7EA"))
    g.y_axis.delete = False
    g.x_axis.delete = False
    g.visible_cells_only = False          # los datos están en filas ocultas
    return g


# =====================================================================================================
# DASHBOARD: 6 tarjetas, tabla de 5 años y 2 gráficos; cabe en la pantalla de un notebook de 14" a 90%
# =====================================================================================================
def hoja_dashboard(L, escenario):
    ws = L.ws[H_DASH]
    hoja_base(ws, 90)
    ws.page_margins.left = ws.page_margins.right = 0.3
    ws.column_dimensions["A"].width = 1.5
    for k in range(2, 14):              # B a M: 12 columnas iguales; cada tarjeta ocupa 2
        ws.column_dimensions[col(k)].width = 10.5
    ws.column_dimensions["N"].width = 1.5
    altos = {1: 24, 2: 15, 3: 4, 4: 18, 5: 28, 6: 28, 7: 4, 8: 28, 9: 15.5, 10: 15.5, 11: 15.5, 12: 15.5, 13: 4, 24: 15}
    altos.update({r: 12 for r in range(14, 24)})   # total 350 pt: cabe en un notebook de 14" con la cinta de opciones abierta
    for r, h in altos.items():
        ws.row_dimensions[r].height = h
    celda(ws, "B1", "LUMINE MOTORS · PLAN FINANCIERO (FASE 4)", tam=16, negrita=True, color=CELESTE8)
    celda(ws, "B2", f"Flujo de caja puro · millones de $ · {UNIDAD}", tam=10, color=GRIS)
    for k in range(2, 14):
        ws.cell(row=1, column=k).border = B_TITULO
    # selector de escenario, arriba a la derecha
    celda(ws, "K1", "Escenario:", tam=10, negrita=True, color=GRIS, alin=DER, borde=B_TITULO)
    celda(ws, "L1", escenario, tam=11, negrita=True, alin=CEN, borde=B_CAJA)
    ws["M1"].border = B_CAJA
    ws.merge_cells("L1:M1")
    dv = DataValidation(type="list", formula1="EscNom", allow_blank=False, showDropDown=False, showErrorMessage=True)
    dv.error = "Elige Base, Pesimista u Optimista"
    ws.add_data_validation(dv)
    dv.add("L1")
    L.nombre("EscenarioSel", H_DASH, "$L$1")
    # seis tarjetas
    tarjetas = [("VAN (Ku)", "=VAN_Ku", FMT_TARJ_MM, '="a Ku "&FIXED(Ku*100,1)&"% real (tasa provisoria)"'),
                ("TIR", "=TIR_Puro", FMT_PCT, '="Inversionista (40% de deuda): "&IF(ISNUMBER(TIR_Inv),FIXED(TIR_Inv*100,1)&"%",TIR_Inv)'),
                ("PAYBACK DESCONTADO", "=PB_Desc", '0.0" años"', '="Simple: "&IF(ISNUMBER(PB_Simple),FIXED(PB_Simple,1)&" años",PB_Simple)'),
                ("INVERSIÓN AÑO 0", "=Inv0_Total", FMT_TARJ_MM,
                 '="Activos $"&FIXED(Inv0Cap/1000000,0)&" M + cap. de trabajo $"&FIXED(INDEX(CT_Inv,1)/1000000,0)&" M"'),
                ("EQUILIBRIO AÑO 1", "=INDEX(PE_Q,1)", '#,##0" veh."', '="Proyectadas: "&FIXED(INDEX(H2_Inst,1),0)&" instalaciones"'),
                ("EBITDA AÑO 5", "=INDEX(H2_EBITDA,5)", FMT_TARJ_MM, '="Margen EBITDA: "&FIXED(INDEX(H2_EBITDA,5)/INDEX(H2_Ing,5)*100,1)&"%"')]
    sep = Side(style="thin", color=GRIS_LINEA)
    for k, (et, f, fmt, sub) in enumerate(tarjetas):
        c0, c1 = col(2 + 2 * k), col(3 + 2 * k)
        izq = sep if k else None
        for r in (4, 5, 6):
            for cc in (c0, c1):
                top = B_TARJETA_SUP.top if r == 4 else None
                ws[f"{cc}{r}"].border = Border(top=top, left=izq if cc == c0 else None)
        celda(ws, f"{c0}4", et, tam=10, negrita=True, color=GRIS, alin=Alignment(vertical="bottom", indent=1))
        celda(ws, f"{c0}5", f, fmt, tam=20, negrita=True, alin=Alignment(horizontal="left", vertical="center", indent=1))
        celda(ws, f"{c0}6", sub, tam=10, color=GRIS, alin=Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1))
        for r in (4, 5, 6):
            ws.merge_cells(f"{c0}{r}:{c1}{r}")
    # tabla de 5 años (millones de $)
    _enc(ws, 8, ["Millones de $", ""] + [rot_anio(y) for y in range(1, 6)], 2, alto=28)
    ws.merge_cells("B8:C8")
    filas = [("Ingresos", "=INDEX(H2_Ing,{y})", False), ("EBITDA", "=INDEX(H2_EBITDA,{y})", False),
             ("Flujo de caja puro", "=INDEX(FC_Puro,{y1})", True), ("Flujo puro acumulado", "=INDEX(FP_Acum,{y1})", False)]
    for k, (et, f, tot) in enumerate(filas):
        r = 9 + k
        bd = B_TOTAL if tot else B_FILA
        celda(ws, f"B{r}", et, tam=10, negrita=tot, borde=bd)
        ws[f"C{r}"].border = bd
        ws.merge_cells(f"B{r}:C{r}")
        for y in range(1, 6):
            celda(ws, f"{col(3 + y)}{r}", f.format(y=y, y1=y + 1), FMT_MM1, tam=10, negrita=tot, borde=bd)
    celda(ws, "B24", "Versión de trabajo: tasas, reglamento y precio provisorios.", tam=10, color=GRIS, cursiva=True)
    # datos de los gráficos (filas ocultas; los gráficos los muestran igual)
    rd = 30
    celda(ws, f"B{rd}", "Datos de los gráficos", tam=9, color=GRIS)
    for y in range(6):
        celda(ws, f"{col(3 + y)}{rd}", rot_anio(y), tam=9, color=GRIS)
    datos = [("Flujo de caja puro", lambda c, y: f"=INDEX(FC_Puro,{y + 1})"),
             ("Valor de desecho", lambda c, y: "=VD" if y == 5 else "=0"),
             ("Flujo del año", lambda c, y: f"=MAX(0,{c}{rd + 1}-{c}{rd + 2})"),
             ("Flujo negativo", lambda c, y: f"=MIN(0,{c}{rd + 1}-{c}{rd + 2})")]
    for k, (et, fn) in enumerate(datos):
        celda(ws, f"B{rd + 1 + k}", et, tam=9, color=GRIS)
        for y in range(6):
            c = col(3 + y)
            celda(ws, f"{c}{rd + 1 + k}", fn(c, y), FMT_GRAF, tam=9, color=GRIS)
    rd2 = rd + 6
    for y in range(1, 6):
        celda(ws, f"{col(2 + y)}{rd2}", rot_anio(y), tam=9, color=GRIS)
    for k, (et, nom) in enumerate([("Taller propio", "H2_Prop"), ("Financiamiento a clientes", "H2_Fin"), ("Red de talleres", "H2_RedIng")]):
        celda(ws, f"B{rd2 + 1 + k}", et, tam=9, color=GRIS)
        for y in range(1, 6):
            celda(ws, f"{col(2 + y)}{rd2 + 1 + k}", f"=INDEX({nom},{y})", FMT_GRAF, tam=9, color=GRIS)
    for r in range(rd, rd2 + 4):
        ws.row_dimensions[r].hidden = True
    # gráfico 1 (derecha, alto): flujo puro por año, con el valor de desecho del año 5 aparte
    g1 = _barras(ws, [(rd + 3, 2, 8), (rd + 4, 2, 8), (rd + 2, 2, 8)], Reference(ws, min_col=3, max_col=8, min_row=rd),
                 (CELESTE, "8B9598", "A9DDF6"))
    g1.gapWidth = 35
    for s_ in g1.series:
        s_.dLbls = _etiquetas(1000)
        s_.dLbls.numFmt = FMT_GRAF
    g1.series[2].dLbls.numFmt = '"VD "#,##0.0,,;;;'   # la barra clara del año 5 se explica sola (sin leyenda)
    g1.legend = None
    estilo_grafico(g1, "Flujo de caja puro por año (millones de $)", tam=1000)
    g1.width, g1.height = 9.4, 7.45         # columnas I a M; filas 8 a 23 (214 pt)
    ws.add_chart(g1, "I8")
    # gráfico 2 (abajo a la izquierda): ingresos por línea
    g2 = _barras(ws, [(rd2 + 1, 2, 7), (rd2 + 2, 2, 7), (rd2 + 3, 2, 7)], Reference(ws, min_col=3, max_col=7, min_row=rd2),
                 (CELESTE, "1D1D1F", "A9DDF6"))
    g2.legend.position = "r"
    g2.legend.overlay = False
    estilo_grafico(g2, "Ingresos por línea (millones de $)", tam=1000)
    g2.width, g2.height = 13.0, 4.15        # columnas B a H; filas 14 a 23 (120 pt)
    ws.add_chart(g2, "B14")
    ws.print_area = "A1:N24"
    ws.page_setup.fitToHeight = 1
    ws.freeze_panes = "A3"


# =====================================================================================================
# SENSIBILIDADES: arriba la tabla de los 10 casos de mayor impacto y el tornado; el resto, plegado
# =====================================================================================================
PUENTE = [("P1", "Puente 1 · motor v4 con los supuestos de la v3"),
          ("P2", "Puente 2 · + kit al punto medio"),
          ("P3", "Puente 3 · + 30% de las ventas a crédito"),
          ("P4", "Puente 4 · + tasa del crédito en real (Fisher)"),
          ("P5", "Puente 5 · + capital de trabajo con déficit acumulado")]
V3_ORIGINAL = dict(van=-89689831.33, tir=0.0644, pb="> 5 años")  # valores del archivo v3_TIR6_actual.xlsx (foto)


def hoja_sensibilidades(L, S, foto, caso_activo):
    ws = L.ws[H_SENS]
    hoja_base(ws, 90)
    titular(ws, "SENSIBILIDADES", "Efecto de cada supuesto en el VAN y la TIR del flujo puro · foto de valores tomada con LibreOffice (generar.py)", 10)
    indicador(ws, "J1")
    for c, w in zip("ABCDEFGHIJ", [4, 40, 9, 10.5, 10.5, 10, 14, 8, 11, 11]):
        ws.column_dimensions[c].width = w
    # selector y estado de la foto
    celda(ws, "B4", "Caso activo (dejar en «Base»):", tam=10, negrita=True, color=GRIS, alin=DER)
    celda(ws, "C4", caso_activo, tam=10, negrita=True, alin=IZQ, borde=B_CAJA)
    for k in "DEFGHIJ":
        ws[f"{k}4"].border = B_CAJA
    ws.merge_cells("C4:J4")
    L.nombre("SensActiva", H_SENS, "$C$4")
    ws.conditional_formatting.add("C4", FormulaRule(formula=['$C$4<>"Base"'], fill=F_BANNER, font=fuente(10, True, ROJO)))
    celda(ws, "B5", "Foto de las sensibilidades:", tam=10, negrita=True, color=GRIS, alin=DER)
    # lista de casos (fuente del selector): sección D, plegada
    casos = [dict(nombre="Base", codigo="BASE", parametro="—", base=None, valor=None, fmt=None, grupo="base")]
    casos += [c for c in S.casos]
    fp = S.filas["PesoReal"]
    casos.append(dict(nombre="Costo del kit: realista de la Fase 3 (v3)", codigo="PesoReal_A", parametro="Peso del costeo realista en el kit",
                      base="PesoReal_base", valor=f"{q(H_SUP)}!$E${fp}", fmt=FMT_PCT, grupo="sens"))
    casos.append(dict(nombre="Costo del kit: mejor caso", codigo="PesoReal_B", parametro="Peso del costeo realista en el kit",
                      base="PesoReal_base", valor=f"{q(H_SUP)}!$F${fp}", fmt=FMT_PCT, grupo="sens"))
    for cod, nom in PUENTE:
        casos.append(dict(nombre=nom, codigo=cod, parametro="Combinación (ver Supuestos detalle)", base=None, valor=None, fmt=None, grupo="puente"))
    L.casos = casos
    van_foto = foto["base"]["van"] if foto else 0
    fsens = [c for c in (foto or {}).get("casos", []) if c["grupo"] in ("base", "sens")]
    tor = sorted([c for c in fsens if c["grupo"] == "sens"], key=lambda c: abs(c["van"] - van_foto), reverse=True)[:10]
    # ---------------- los 10 casos de mayor impacto (arriba) y el tornado al lado
    encabezado(ws, 7, ["N.º", "Los 10 supuestos que más mueven el VAN", "TIR", "VAN (M$)", "Δ VAN (M$)"], alto=28)
    for k in range(10):
        ws.row_dimensions[8 + k].height = 15
    for k, c in enumerate(tor):
        r = 8 + k
        celda(ws, f"A{r}", k + 1, "0", tam=10, color=GRIS, alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", c["nombre"], tam=10, borde=B_FILA)
        celda(ws, f"C{r}", c["tir"], FMT_PCT, tam=10, borde=B_FILA)
        celda(ws, f"D{r}", c["van"], FMT_MM1, tam=10, borde=B_FILA)
        celda(ws, f"E{r}", c["van"] - van_foto, FMT_MM1, tam=10, negrita=True, borde=B_FILA)
        celda(ws, f"R{r}", f"=MAX(0,E{r})", FMT_GRAF, tam=9, color=GRIS)
        celda(ws, f"S{r}", f"=MIN(0,E{r})", FMT_GRAF, tam=9, color=GRIS)
    if not tor:
        celda(ws, "B8", "Sin foto: correr generar.py", tam=10, color=GRIS)
    celda(ws, "R7", "Sube", tam=9, color=GRIS)
    celda(ws, "S7", "Baja", tam=9, color=GRIS)
    ws.column_dimensions["R"].hidden = True
    ws.column_dimensions["S"].hidden = True
    if tor:
        n = len(tor)
        g = BarChart()
        g.type = "bar"
        g.grouping = "stacked"
        g.overlap = 100
        g.gapWidth = 45
        g.add_data(Reference(ws, min_col=18, max_col=19, min_row=7, max_row=7 + n), titles_from_data=True)
        g.set_categories(Reference(ws, min_col=1, min_row=8, max_row=7 + n))   # N.º de la tabla
        for s_, colr in zip(g.series, (CELESTE, "8B9598")):
            s_.graphicalProperties = GraphicalProperties(solidFill=colr)
            s_.graphicalProperties.line.solidFill = colr
            s_.dLbls = _etiquetas()
        g.legend = None
        g.x_axis.delete = False
        g.y_axis.delete = False
        g.y_axis.numFmt = '#,##0,,'
        g.y_axis.majorGridlines.spPr = GraphicalProperties(ln=LineProperties(solidFill="E6E7EA"))
        g.x_axis.scaling.orientation = "maxMin"
        g.visible_cells_only = False
        estilo_grafico(g, "Δ VAN contra la base (millones de $)")
        g.width, g.height = 9.6, 6.2         # columnas F a J; filas 7 a 17
        ws.add_chart(g, "F7")
    # ---------------- A. todos los casos (foto), plegado
    r = 19
    rA = r
    bloque(ws, r, "A. Todos los casos (foto de valores; no se recalcula sola)", 10)
    r += 1
    ts = foto.get("fecha", "sin foto") if foto else "sin foto"
    celda(ws, f"B{r}", f"Foto tomada el {ts} con LibreOffice {foto.get('motor', '') if foto else ''}", tam=9, color=GRIS)
    celda(ws, f"C{r}", "VAN base:", tam=9, color=GRIS, alin=DER)
    celda(ws, f"D{r}", van_foto, FMT_PESOS, tam=9, color=GRIS)
    L.nombre("FotoVAN", H_SENS, f"$D${r}")
    r += 1
    encabezado(ws, r, ["", "Caso", "Valor del supuesto", "VAN (pesos)", "TIR", "Payback desc.", "Δ VAN (pesos)", "Δ TIR (pp)"], alto=28)
    r += 1
    for c in fsens:
        celda(ws, f"B{r}", c["nombre"], tam=9, negrita=c["grupo"] == "base", borde=B_FILA)
        celda(ws, f"C{r}", c.get("valor_txt", ""), tam=9, color=GRIS, alin=DER, borde=B_FILA)
        celda(ws, f"D{r}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{r}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{r}", c["pb"], '0.0" años"', tam=9, alin=DER, borde=B_FILA)
        celda(ws, f"G{r}", c["van"] - van_foto, FMT_PESOS, tam=9, borde=B_FILA)
        dt = (c["tir"] - foto["base"]["tir"]) * 100 if isinstance(c["tir"], (int, float)) and isinstance(foto["base"]["tir"], (int, float)) else None
        celda(ws, f"H{r}", dt, '+0.0;-0.0;0.0', tam=9, borde=B_FILA)
        r += 1
    plegar(ws, rA, r - 1)
    # ---------------- B. escenarios
    r += 1
    rB = r
    bloque(ws, r, "B. Escenarios del Dashboard (foto)", 10)
    r += 1
    encabezado(ws, r, ["", "Escenario (demanda × precio × costo)", "", "VAN (pesos)", "TIR", "Payback desc."], alto=28)
    r += 1
    for c in (foto or {}).get("escenarios", []):
        celda(ws, f"B{r}", f"{c['nombre']} ({c.get('valor_txt', '')})", tam=9, borde=B_FILA)
        ws[f"C{r}"].border = B_FILA
        celda(ws, f"D{r}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{r}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{r}", c["pb"], '0.0" años"', tam=9, alin=DER, borde=B_FILA)
        r += 1
    plegar(ws, rB, r - 1)
    # ---------------- C. puente v3 → v4
    r += 1
    rC = r
    bloque(ws, r, "C. Puente de la v3 a la v4 (foto): qué cambió y cuánto mueve la TIR", 10)
    r += 1
    celda(ws, f"B{r}", "Puente 1 = motor v4 con kit realista, 50% a crédito, tasa nominal, capital de trabajo = saldo y equipamiento en el mes −3.",
          tam=9, color=GRIS)
    r += 1
    encabezado(ws, r, ["", "Paso", "", "VAN (pesos)", "TIR", "Payback desc.", "Δ TIR del paso (pp)"], alto=28)
    r += 1
    celda(ws, f"B{r}", "v3 original (archivo v3_TIR6_actual.xlsx)", tam=9, borde=B_FILA)
    ws[f"C{r}"].border = B_FILA
    celda(ws, f"D{r}", V3_ORIGINAL["van"], FMT_PESOS, tam=9, borde=B_FILA)
    celda(ws, f"E{r}", V3_ORIGINAL["tir"], FMT_PCT, tam=9, borde=B_FILA)
    celda(ws, f"F{r}", V3_ORIGINAL["pb"], tam=9, alin=DER, borde=B_FILA)
    r += 1
    previo = V3_ORIGINAL["tir"]
    pasos = [c for c in (foto or {}).get("casos", []) if c["grupo"] == "puente"]
    if foto:
        pasos.append(dict(nombre="v4 base · + equipamiento del taller 1 en el mes −9", van=foto["base"]["van"], tir=foto["base"]["tir"],
                          pb=foto["base"]["pb"]))
    for c in pasos:
        celda(ws, f"B{r}", c["nombre"], tam=9, borde=B_FILA, negrita=c["nombre"].startswith("v4 base"))
        ws[f"C{r}"].border = B_FILA
        celda(ws, f"D{r}", c["van"], FMT_PESOS, tam=9, borde=B_FILA)
        celda(ws, f"E{r}", c["tir"], FMT_PCT, tam=9, borde=B_FILA)
        celda(ws, f"F{r}", c["pb"], '0.0" años"', tam=9, alin=DER, borde=B_FILA)
        if isinstance(c["tir"], (int, float)) and isinstance(previo, (int, float)):
            celda(ws, f"G{r}", (c["tir"] - previo) * 100, '+0.0;-0.0;0.0', tam=9, borde=B_FILA)
            previo = c["tir"]
        r += 1
    plegar(ws, rC, r - 1)
    # ---------------- D. lista de casos (fuente del selector)
    r += 1
    rD = r
    bloque(ws, r, "D. Casos y códigos (lista del selector; el valor del caso es la alternativa de Supuestos detalle)", 10)
    r += 1
    encabezado(ws, r, ["N.º", "Caso", "Código", "Valor base", "Valor del caso", "Supuesto que cambia"], alto=28)
    r += 1
    r0 = r
    for k, cdef in enumerate(casos):
        celda(ws, f"A{r}", k, "0", tam=9, color=GRIS, alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", cdef["nombre"], tam=9, borde=B_FILA)
        celda(ws, f"C{r}", cdef["codigo"], tam=9, color=GRIS, borde=B_FILA)
        if cdef["base"]:
            celda(ws, f"D{r}", "=" + cdef["base"], cdef["fmt"], tam=9, borde=B_FILA)
            celda(ws, f"E{r}", "=" + cdef["valor"], cdef["fmt"], tam=9, negrita=True, borde=B_FILA)
        else:
            ws[f"D{r}"].border = ws[f"E{r}"].border = B_FILA
        celda(ws, f"F{r}", cdef["parametro"], tam=9, color=GRIS)
        r += 1
    r1 = r - 1
    L.nombre("Anx_Caso", H_SENS, f"$B${r0}:$B${r1}")
    L.nombre("Anx_Cod", H_SENS, f"$C${r0}:$C${r1}")
    plegar(ws, rD, r1)
    dv = DataValidation(type="list", formula1="Anx_Caso", allow_blank=False, showErrorMessage=True)
    ws.add_data_validation(dv)
    dv.add("C4")
    # ---------------- E. nota
    r += 1
    rE = r
    bloque(ws, r, "E. Nota: sobredotación de técnicos", 10)
    r += 1
    celda(ws, f"B{r}", "Sin error de fórmula: la regla del 80% deja 25% de holgura y los dúos son enteros (casos «Regla de dúos al 90% y 100%»).",
          tam=9, color=GRIS)
    plegar(ws, rE, r)
    # estado de la foto (arriba; sin combinar, para que el texto largo se vea entero)
    celda(ws, "C5", '=IF(SensActiva<>"Base","SELECTOR FUERA DE BASE",IF(EscSel<>"Base","ESCENARIO "&UPPER(EscSel)&" ACTIVO: la foto es del escenario Base",IF(ROUND(FotoVAN-VAN_Ku,0)=0,"OK: foto vigente","FOTO DESACTUALIZADA: volver a correr generar.py")))',
          tam=10, negrita=True)
    ws.conditional_formatting.add("C5", FormulaRule(formula=['LEFT($C$5,2)<>"OK"'], fill=ROJO_SUAVE, font=fuente(10, True, ROJO)))
    L.nombre("Anx_Estado", H_SENS, "$C$5")
    ws.print_area = f"A1:J{r}"
    ws.freeze_panes = "A4"


# =====================================================================================================
# MENSUAL (AÑOS 0 A 2): 36 columnas que solo enlazan al motor; se imprime en 2 páginas de 18 meses
# =====================================================================================================
MESES_VISTA = 36
POR_PAGINA = 18
VISTA = [("#", "Operación"),
         ("dem_at", "Demanda atendible (veh.)", FMT_DEC1, False),
         ("duos", "Dúos activos", FMT_ENTERO, False),
         ("capm", "Capacidad nominal (veh.)", FMT_DEC1, False),
         ("inst", "Instalaciones (veh.)", FMT_ENTERO, True),
         ("util", "Utilización de la capacidad", FMT_PCT, False),
         ("tec", "Técnicos", FMT_ENTERO, False),
         ("dot", "Dotación total (personas)", FMT_ENTERO, False),
         ("#", "Resultado (millones de $)"),
         ("neto", "Ingresos por instalaciones", FMT_MM1, False),
         ("int_cob", "Ingresos por financiamiento", FMT_MM1, False),
         ("ingresos", "Total ingresos", FMT_MM1, True),
         ("cv", "Costos variables", FMT_MM1, False),
         ("nomina", "Nómina", FMT_MM1, False),
         ("fijos", "Gastos fijos (con marketing)", FMT_MM1, False),
         ("ebitda", "EBITDA", FMT_MM1, True),
         ("inv_mes", "Inversión y puesta en marcha", FMT_MM1, False),
         ("#", "Caja (millones de $)"),
         ("fco", "Flujo operativo del mes", FMT_MM1, False),
         ("acum", "Saldo acumulado de caja", FMT_MM1, True),
         ("kits_pag", "Kits pagados no instalados", FMT_MM1, False),
         ("cxc", "Cartera del crédito, neta", FMT_MM1, False),
         ("abono_s", "(−) Pies recibidos", FMT_MM1, False),
         ("saldo_ct", "Capital de trabajo", FMT_MM1, True)]


def hoja_mensual02(L):
    ws = L.ws[H_M02]
    hoja_base(ws, 90)
    ws.page_margins.left = ws.page_margins.right = 0.3
    ultima = col(1 + MESES_VISTA)                     # AK
    ws.column_dimensions["A"].width = 32                # la columna A se repite en la página 2: sus textos caben en ella
    for j in range(MESES_VISTA):
        ws.column_dimensions[col(2 + j)].width = 5.28
    celda(ws, "A1", "MENSUAL (AÑOS 0 A 2)", tam=16, negrita=True, color=CELESTE8)
    ws.row_dimensions[1].height = 26
    celda(ws, "A2", "Meses −12 a 24 · millones de $", tam=10, color=GRIS)
    for k in range(1, 2 + MESES_VISTA):
        ws.cell(row=1, column=k).border = B_TITULO
    fm = L.filas_men
    # fila 3: año; fila 4: mes del proyecto; fila 5: mes calendario
    for y, j in ((0, 0), (1, 12), (2, 24)):
        c = celda(ws, f"{col(2 + j)}3", rot_anio(y), tam=9, negrita=True, color=CELESTE8)
    sep = Side(style="thin", color=CELESTE8)
    for j in range(MESES_VISTA):
        cc = col(2 + j)
        c = celda(ws, f"{cc}4", f"={q(H_MEN)}!{mc(j + 1)}{fm['mes']}", '0;"−"0', tam=9, negrita=True, color="FFFFFFFF", alin=CEN)
        c.fill = F_ENC
        celda(ws, f"{cc}5", f"={q(H_MEN)}!{mc(j + 1)}{fm['fecha']}", "mmm", tam=9, color=GRIS, alin=CEN)
    c = celda(ws, "A4", "Mes del proyecto", tam=9, negrita=True, color="FFFFFFFF")
    c.fill = F_ENC
    celda(ws, "A5", "Mes calendario", tam=9, color=GRIS)
    r = 6
    r_acum = None
    for e in VISTA:
        if e[0] == "#":
            celda(ws, f"A{r}", e[1], tam=10, negrita=True, color=CELESTE8)
            for k in range(1, 2 + MESES_VISTA):
                ws.cell(row=r, column=k).border = B_ENC
            ws.row_dimensions[r].height = 18
            r += 1
            continue
        k, et, fmt, tot = e
        bd = B_TOTAL if tot else B_FILA
        celda(ws, f"A{r}", et, tam=9, negrita=tot, borde=bd)
        for j in range(MESES_VISTA):
            celda(ws, f"{col(2 + j)}{r}", f"={q(H_MEN)}!{mc(j + 1)}{fm[k]}", fmt, tam=9, negrita=tot, borde=bd)
        if fmt == FMT_ENTERO:
            L.entero(f"Mensual (años 0 a 2): {et}", H_M02, f"B{r}:{ultima}{r}")
        if k == "acum":
            r_acum = r
        r += 1
    # inicio de cada año: línea vertical celeste
    for j in (12, 24):
        for rr in range(3, r):
            c = ws.cell(row=rr, column=2 + j)
            c.border = Border(left=sep, top=c.border.top, bottom=c.border.bottom)
    # déficit acumulado máximo de los meses −12 a 12 (método de clase, el mismo de la hoja 3): en rojo
    fin_anio1 = col(1 + 24)                              # Y = mes 12
    rango = f"B{r_acum}:{fin_anio1}{r_acum}"
    ws.conditional_formatting.add(rango, FormulaRule(formula=[f"AND(CT_Def>0,B{r_acum}=-CT_Def)"], font=fuente(9, True, ROJO),
                                                     fill=ROJO_SUAVE))
    # notas en la columna B (no se repiten en la página 2)
    celda(ws, f"B{r + 1}", f'="Déficit acumulado máximo de los meses −12 a 12 (método de clase, hoja 3): $"&FIXED(CT_Def/1000000,1)&" M en el mes "&INDEX(B4:{fin_anio1}4,MATCH(-CT_Def,{rango},0))&", en rojo."',
          tam=9, color=GRIS)
    celda(ws, f"B{r + 2}", "Antes del mes 1 no hay EBITDA: la nómina y los gastos fijos de esos meses son puesta en marcha (inversión).",
          tam=9, color=GRIS)
    ws.freeze_panes = "B6"
    ws.print_title_cols = "A:A"
    ws.sheet_properties.pageSetUpPr.fitToPage = False   # 100%: 18 meses por página, corte manual
    ws.page_setup.scale = 100
    ws.col_breaks.append(Break(id=1 + POR_PAGINA))      # corte a la izquierda de la columna T (mes 7)
    ws.print_area = f"A1:{ultima}{r + 2}"


# =====================================================================================================
# CONTROLES (oculta)
# =====================================================================================================
def hoja_controles(L):
    ws = L.ws[H_CTRL]
    hoja_base(ws, 95, visible=False)
    titular(ws, "CONTROLES", "Cada control compara dos cálculos del modelo y debe dar 0. Las hojas muestran «Controles OK» si todos los suyos dan 0.", 5)
    for c, w in zip("ABCDE", [5, 64, 26, 18, 12]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 4, ["N.º", "Control", "Hoja de origen", "Valor (debe dar 0)", "Estado"])
    r = 5
    for k, (desc, hoja, formula) in enumerate(L.controles, start=1):
        celda(ws, f"A{r}", k, "0", tam=9, color=GRIS, alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", desc, tam=10, borde=B_FILA)
        celda(ws, f"C{r}", hoja, tam=9, color=GRIS, borde=B_FILA)
        celda(ws, f"D{r}", formula, FMT_PESOS, tam=10, borde=B_FILA)
        celda(ws, f"E{r}", f'=IF(D{r}=0,"OK","REVISAR")', tam=10, negrita=True, alin=CEN, borde=B_FILA)
        r += 1
    r1 = r - 1
    ws.conditional_formatting.add(f"E5:E{r1}", FormulaRule(formula=['E5<>"OK"'], font=fuente(10, True, ROJO)))
    L.nombre("Ctrl_Hoja", H_CTRL, f"$C$5:$C${r1}")
    L.nombre("Ctrl_Valor", H_CTRL, f"$D$5:$D${r1}")
    celda(ws, f"B{r}", "Suma de los controles (debe dar 0)", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=SUM(D5:D{r1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Ctrl_Total", H_CTRL, f"$D${r}")
    celda(ws, f"B{r + 1}", "Controles en 0", tam=9, color=GRIS)
    celda(ws, f"D{r + 1}", f'=COUNTIF(D5:D{r1},0)', "0", tam=9)
    L.nombre("Ctrl_OK", H_CTRL, f"$D${r + 1}")
    celda(ws, f"B{r + 2}", "Controles en total", tam=9, color=GRIS)
    celda(ws, f"D{r + 2}", f'=COUNT(D5:D{r1})', "0", tam=9)
    L.nombre("Ctrl_N", H_CTRL, f"$D${r + 2}")
    L.filas_controles = list(range(5, r1 + 1))


# =====================================================================================================
# ÍNDICE
# =====================================================================================================
DESCRIPCION = {
    H_DASH: "Seis indicadores, ingresos y flujo por año, y dos gráficos",
    H_SUPC: "Los supuestos que mueven el resultado, con su fuente",
    H1: "Inversión del año 0, reinversiones, depreciación y valor de desecho",
    H2: "Estado de resultados de 5 años: costos variables, fijos y GAV",
    H3: "Requerimiento por año y déficit acumulado máximo del año 1",
    H4: "Flujo de caja puro a 5 años: VAN, TIR y payback",
    H5: "Flujo del inversionista con 40% de deuda",
    H6: "Ku, βL, Ke, Kd y WACC (CAPM y Hamada)",
    H7: "Equilibrio en vehículos y en pesos, años 1 a 5",
    H_SENS: "Tornado y los 10 supuestos que más mueven el VAN",
    H_M02: "Rampa mes a mes y déficit acumulado del arranque",
}


def hoja_indice(L):
    ws = L.ws[H_IDX]
    hoja_base(ws, 90)
    titular(ws, "LUMINE MOTORS · PLAN FINANCIERO (FASE 4)",
            f"Integrador II (UNAB) · Capítulo IV: Plan Financiero · {UNIDAD}", 4)
    for c, w in zip("ABCD", [6, 28, 72, 10]):
        ws.column_dimensions[c].width = w
    celda(ws, "B4", '=IF(ISNUMBER(TIR_Puro),"TIR "&FIXED(TIR_Puro*100,1)&"% · VAN $"&FIXED(VAN_Ku/1000000,0)&" M · payback "&IF(ISNUMBER(PB_Desc),FIXED(PB_Desc,1)&" años",PB_Desc),"Revisar: la TIR no existe")',
          tam=18, negrita=True, color=TINTA)
    ws.merge_cells("B4:D4")
    ws.row_dimensions[4].height = 30
    celda(ws, "B5", '="Flujo de caja puro descontado a Ku "&FIXED(Ku*100,1)&"% real (provisoria) · inversión del año 0 $"&FIXED(Inv0_Total/1000000,0)&" M · escenario "&EscenarioSel',
          tam=10, color=GRIS)
    ws.merge_cells("B5:D5")
    celda(ws, "B6", '="Controles: "&Ctrl_OK&" de "&Ctrl_N&" en 0"', tam=10, negrita=True)
    ws.conditional_formatting.add("B6", FormulaRule(formula=["Ctrl_Total<>0"], font=fuente(10, True, ROJO)))
    celda(ws, "C6", '="Sensibilidades: "&Anx_Estado', tam=10, color=GRIS)
    ws.conditional_formatting.add("C6", FormulaRule(formula=['LEFT(Anx_Estado,2)<>"OK"'], font=fuente(10, True, ROJO)))
    ws.row_dimensions[6].height = 18
    encabezado(ws, 7, ["N.º", "Hoja", "Qué muestra", "Ir"])
    r = 8
    for k, h in enumerate([x for x in VISIBLES if x != H_IDX], start=1):
        celda(ws, f"A{r}", k, "0", tam=10, color=GRIS, alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", h, tam=11, negrita=True, borde=B_FILA)
        celda(ws, f"C{r}", DESCRIPCION[h], tam=10, borde=B_FILA)
        celda(ws, f"D{r}", "Ir", tam=10, negrita=True, color=CELESTE8, alin=CEN, borde=B_FILA)
        for cc in ("B", "D"):   # vínculo interno del archivo: Excel y LibreOffice lo siguen igual (la función HIPERVINCULO no)
            ws[f"{cc}{r}"].hyperlink = Hyperlink(ref=f"{cc}{r}", location=f"{q(h)}!A1", display=h)
        ws.row_dimensions[r].height = 16
        r += 1
    r += 1
    celda(ws, f"B{r}", "Celdas de entrada (solo en Supuestos)", tam=10, negrita=True, color=CELESTE8)
    r += 1
    for t, txt in [("F", "Dato con fuente citada"), ("P", "Provisorio o por confirmar"), ("S", "Supuesto o decisión del equipo")]:
        celda(ws, f"B{r}", {"F": "Con fuente", "P": "Provisorio", "S": "Supuesto"}[t], tam=10, relleno=RELLENO[t], alin=CEN, borde=B_FILA)
        celda(ws, f"C{r}", txt, tam=10, color=GRIS, borde=B_FILA)
        r += 1
    celda(ws, f"B{r}", "Sin relleno", tam=10, alin=CEN, borde=B_FILA)
    celda(ws, f"C{r}", "Fórmula (no se escribe a mano)", tam=10, color=GRIS, borde=B_FILA)
    r += 2
    celda(ws, f"B{r}", "Hojas técnicas ocultas (clic derecho en una pestaña → Mostrar): " + ", ".join(OCULTAS) + ".", tam=9, color=GRIS,
          alin=Alignment(horizontal="left", vertical="top", wrap_text=True))
    ws.merge_cells(f"B{r}:D{r}")
    ws.row_dimensions[r].height = 26
    ws.freeze_panes = "A4"
    ws.print_area = f"A1:D{r}"
    ws.page_setup.fitToHeight = 1


# =====================================================================================================
# PENDIENTES Y REGISTRO DE CAMBIOS (ocultas)
# =====================================================================================================
def hoja_pendientes(L):
    ws = L.ws[H_PEN]
    hoja_base(ws, 95, visible=False)
    titular(ws, "PENDIENTES", "Lo que falta decidir o cotizar (no se inventa: va marcado como provisorio en Supuestos)", 4)
    for c, w in zip("ABCD", [5, 80, 34, 40]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 4, ["N.º", "Pendiente", "Dónde impacta", "Cómo se resuelve"])
    pend = [
        ("Tasas: beta, riesgo de empresa nueva y si se descuenta con Ku o WACC", "6. Tasa, 4 y 5", "Decisión del equipo con el profesor"),
        ("Techo de la demanda con las 33 respuestas de la encuesta (hoy 100%, optimista)", "Supuestos clave", "Análisis de la encuesta"),
        ("Arancel del 3CV (D.S. 33/2004)", "Supuestos detalle H", "Solicitud por Ley de Transparencia"),
        ("Seguro de responsabilidad civil del Proyecto Experimental", "Supuestos detalle K", "Cotización"),
        ("Desglose de la habilitación del local ($15 M)", "Supuestos detalle K", "Cotización por partidas"),
        ("Software y licencias por cotizar", "Supuestos detalle K", "Cotización"),
        ("Recotizar el dinamómetro (Mainline Dyno)", "Supuestos detalle K", "Cotización actualizada"),
        ("Fuente y tasa del crédito bancario", "5. Flujo Apalancado", "Cotización bancaria o CORFO"),
        ("Crédito por remuneraciones (Ley 21.850) y depreciación instantánea Pro Pyme", "4. Flujo Puro", "Revisión tributaria"),
        ("Personal de la red y ritmo de incorporación de talleres (3, 5 y 8)", "Supuestos detalle H y J", "Decisión del equipo"),
        ("Respaldar el costo del kit al punto medio ($3,04 M la mezcla) con cotizaciones de componentes", "Supuestos clave", "Cotizaciones (el peso del costo en el VAN es el mayor)"),
        ("Regla de dúos al 80%: confirmar si la capacidad de 15,75 vehículos ya descuenta tiempos muertos (si es así, la holgura se duplica)", "Supuestos clave", "Revisar el cálculo de la Fase 3"),
        ("Confirmar con qué equipamiento se hace el Proyecto Experimental (v4 compra el del taller 1 en el mes −9)", "Supuestos detalle G y K", "Decisión del equipo"),
        ("Tasa del crédito directo: el contrato es 1,5% mensual nominal; el modelo usa su equivalente real (Fisher)", "Supuestos clave", "Confirmar la tasa con referencias de mercado"),
        ("Fase 5: corregir la Tabla 7 y el texto de la Fase 3 que dice que Lumine distribuye kits a la red", "Informe Fase 3", "Redacción"),
        ("Informe Word de la Fase 4 (Carta, TNR 12, 1,5, márgenes 4/2,5, APA): objetivos y estrategias de financiamiento al final", "Informe", "Sección por sección"),
    ]
    for k, (p, d, c) in enumerate(pend, start=1):
        r = 4 + k
        celda(ws, f"A{r}", k, "0", alin=CEN, borde=B_FILA)
        celda(ws, f"B{r}", p, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"C{r}", d, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
        celda(ws, f"D{r}", c, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
        ws.row_dimensions[r].height = 28


def hoja_registro(L):
    ws = L.ws[H_REG]
    hoja_base(ws, 95, visible=False)
    titular(ws, "REGISTRO DE CAMBIOS", "Cada cambio relevante: hoja, qué se hizo y por qué", 4)
    for c, w in zip("ABCD", [14, 26, 80, 60]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 4, ["Fecha", "Hoja", "Qué se hizo", "Motivo"])
    v5 = [
        ("Todo el libro", "v5: presentación simplificada, mismos números que la v4 (VAN, TIR, payback, inversión, capital de trabajo, EBITDA y "
                          "flujos al peso; también los 34 casos de la foto y espejo.py).",
         "INSTRUCCIONES_SIMPLIFICAR.md: que el profesor entienda en 5 minutos que el proyecto es rentable y por qué."),
        ("Índice", "Hoja nueva: resultado en una línea, hojas con hipervínculo, leyenda de colores (única en el libro) y estado de los controles.",
         "Orientar la lectura."),
        ("Supuestos clave / detalle", "Una página con los supuestos que mueven el resultado; el resto (con las alternativas A–C) en Supuestos detalle, oculta. "
         "Los nombres definidos se conservan, así que ninguna fórmula cambió.", "De 269 filas a una página."),
        ("Datos Fase 3", "Solo fórmulas: los datos de la Fase 3 pasaron a Supuestos detalle, bloque O.", "Las celdas de entrada viven solo en Supuestos."),
        ("Motor mensual / Anual / Mensual (años 0 a 2)", "El motor de 72 columnas y el anual pasan a hojas técnicas ocultas (mismas fórmulas). "
         "Hoja visible nueva con los meses −12 a 24, que solo enlaza al motor.", "Mostrar la rampa y el déficit acumulado máximo."),
        ("Hojas 1 a 7", "Tabla resumen arriba (millones de $) y el detalle en pesos agrupado y plegado; un subtítulo de una línea. "
         "En la hoja 1, el calendario del año 0 va un mes por fila.", "Leer el libro como un informe."),
        ("Controles", "Las filas de control salen de las hojas y se juntan en la hoja Controles; cada hoja muestra «Controles OK».", "Hojas más limpias."),
        ("Dashboard", "Seis tarjetas (millones con un decimal), tabla de 5 años y dos gráficos: flujo puro (año 5 con el valor de desecho aparte) "
         "e ingresos por línea. Cabe en la pantalla de un notebook de 14\".", "Que diga «es rentable» de un vistazo."),
        ("Sensibilidades", "Antes «Anexos»: los 10 casos de mayor impacto y el tornado arriba; el resto, los escenarios y el puente v3 → v4, plegados.",
         "Instrucción del equipo."),
        ("Impresión", "Carta horizontal a 100%: cada hoja visible en 1 o 2 páginas y ninguna letra bajo 9 pt; el PDF lleva solo las hojas visibles.",
         "Instrucción del equipo."),
        ("injertar.py", "Las hojas azules declaran su tipo de contenido en el paquete (en la v4 faltaba; Excel lo toleraba).", "Archivo válido."),
    ]
    v4 = [
        ("Supuestos / Datos Fase 3", "Costo del kit al punto medio entre el costeo realista de la Fase 3 actualizado y el mejor caso (peso 50%): mezcla ≈ $3,04 M con forward (v3: $3,25 M).",
         "Decisión del equipo (traspaso §6). Los extremos van como sensibilidad."),
        ("Supuestos", "30% de las ventas con crédito directo (v3: 50%).", "Decisión del equipo (traspaso §6)."),
        ("Motor mensual / Anual", "El motor es mensual para los 60 meses (antes: meses −12 a 24 y años 3 a 5 anuales). Anual es el espejo del motor.",
         "Las mismas reglas todos los meses (dúos, talleres, red, crédito y capital de trabajo), sin aproximaciones anuales."),
        ("Motor mensual", "Crédito directo como cartera: cuota = PAGO × colocaciones vigentes; interés = saldo × tasa.",
         "Es idéntico a sumar PAGOINT y PAGOPRIN por cohorte (verificado con el modelo espejo), con 4 filas en vez de 48."),
        ("Supuestos (bloque I)", "La tasa del crédito al cliente (1,5% mensual nominal) se usa en real con Fisher (≈ 1,25% mensual).",
         "El modelo está en pesos constantes (A0.2: tasas nominales a reales con Fisher). Resta ~1 pp de TIR."),
        ("3. Capital de Trabajo", "El año 1 usa el déficit acumulado máximo del flujo operativo mensual (método de clase); la v3 tomaba el máximo del saldo.",
         "Método acordado (traspaso §2): requerimiento del año 1 = MÁX(déficit acumulado máximo; saldo al cierre)."),
        ("Supuestos (bloque G)", "El equipamiento del taller 1 y el primer puesto se compran en el mes −9.", "El Proyecto Experimental instala y mide 6 kits en el taller 1 (v3: mes −3)."),
        ("Anual / Sensibilidades", "Sobredotación revisada: sin error de fórmula. Se agregan la capacidad al 80%, la utilización y los casos «Regla de dúos al 90% / 100%».",
         "Capacidad 486 contra 335 instalaciones el año 1: 25% de holgura por la regla del 80% más el salto a un tercer dúo en mayo (jornada de 40 horas)."),
        ("Sensibilidades", "Foto de sensibilidades tomada con LibreOffice, tornado, escenarios y puente v3 → v4.", "PROMPT_sensibilidades: el complemento de Excel no crea tablas de datos."),
        ("1. Inversión", "Valor de desecho económico solo como referencia (no entra al flujo).", "Decisión del equipo: método contable."),
        ("Hojas grises", "Copiadas byte a byte desde la v3 (injertar.py).", "No se tocan las hojas del semestre anterior."),
    ]
    r = 5
    for fecha, lista in (("09-11-2026 (v5)", v5), ("08-11-2026 (v4)", v4)):
        for h, q_, m in lista:
            celda(ws, f"A{r}", fecha, tam=9, borde=B_FILA)
            celda(ws, f"B{r}", h, tam=9, alin=IZQ_W, borde=B_FILA)
            celda(ws, f"C{r}", q_, tam=9, alin=IZQ_W, borde=B_FILA)
            celda(ws, f"D{r}", m, tam=9, color=GRIS, alin=IZQ_W, borde=B_FILA)
            ws.row_dimensions[r].height = 30
            r += 1
