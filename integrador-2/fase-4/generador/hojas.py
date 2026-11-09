"""Hojas 1 a 7: arriba una tabla resumen (lo que va al informe, en millones); abajo el detalle en pesos, agrupado y plegado.

Las fórmulas del detalle son las de la v4; los resúmenes solo enlazan o repiten la misma operación. Los controles salen de
estas hojas y se calculan en la hoja Controles (cada hoja muestra solo «Controles OK»).
"""
from openpyxl.styles import Alignment

from base import A, H1, H2, H3, H4, H5, H6, H7, H_ANU, H_MEN, indicador, mc, q, rot_anio
from estilo import (B_FILA, B_TOTAL, CEN, DER, F_ENC, FMT_DEC1, FMT_DEC2, FMT_ENTERO, FMT_MES, FMT_MIL1, FMT_MM1, FMT_PCT,
                    FMT_PCT2, FMT_PESOS, GRIS, IZQ, TINTA, bloque, celda, col, encabezado, fuente, hoja_base, plegar, titular)


FMT_MM1_POS = '#,##0.0,,;"-";"-"'   # cantidades no negativas: un residuo de −0,000000001 se ve «-», no «-0,0»


def _fila_resumen(ws, r, et, valores, fmt, cols, tot=False, merge=None):
    """Escribe una fila de una tabla resumen. valores: {columna: fórmula}."""
    bd = B_TOTAL if tot else B_FILA
    celda(ws, f"A{r}", et, negrita=tot, borde=bd)
    if merge:
        for c in merge[1:]:
            ws[f"{c}{r}"].border = bd
        ws.merge_cells(f"{merge[0]}{r}:{merge[-1]}{r}")
    for c in cols:
        v = valores.get(c)
        if v is None:
            ws[f"{c}{r}"].border = bd
            continue
        celda(ws, f"{c}{r}", v, fmt, negrita=tot, borde=bd)


def _nota(ws, r, texto, hasta):
    celda(ws, f"A{r}", texto, tam=9, color=GRIS, alin=IZQ)
    ws.merge_cells(f"A{r}:{hasta}{r}")


# =====================================================================================================
# HOJA 1. INVERSIÓN
# =====================================================================================================
def hoja_1(L):
    ws = L.ws[H1]
    hoja_base(ws, 90)
    titular(ws, "1. INVERSIÓN", "Inversión del año 0, reinversiones, depreciación y valor de desecho · millones de $ (detalle en pesos, plegado)", 9)
    indicador(ws, "I1", H1)
    for c, w in zip("ABCDEFGHI", [36, 7, 11] + [12.3] * 6):   # cabe en una página Carta a 100% (letra de 9 pt o más)
        ws.column_dimensions[c].width = w
    # fila 3 (oculta): año del proyecto, la usan las fórmulas de depreciación
    celda(ws, "A3", "Año del proyecto (fila técnica)", tam=9, color=GRIS)
    for y in range(6):
        celda(ws, f"{col(4 + y)}3", "=COLUMN()-COLUMN($D$3)", "0", tam=9, color=GRIS, alin=CEN)
    ws.row_dimensions[3].hidden = True
    L.nombre("H1_Anios", H1, "$D$3:$I$3")
    YR = "$D$3:$I$3"

    # ---------------- A. inversión por ítem
    r = 16
    rA = r
    bloque(ws, r, "A. Inversión por ítem y año (pesos, sin capitalizar)", 9)
    r += 1
    encabezado(ws, r, ["Ítem", "Vida útil", "Clasificación"] + [rot_anio(y) for y in range(6)], alto=28)
    r += 1
    items = [
        ("dino", "Dinamómetro de chasis", "=V_Dino", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*DinoCLP"),
        ("esc", "Escáner automotriz", "=V_Esc", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Escaner"),
        ("bod", "Bodega de baterías clase 9", "=V_Bod", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Bodega"),
        ("hab", "Habilitación del local", "=V_Hab", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Habilitacion"),
        ("mob", "Mobiliario y computadores", "=V_Mob", "Depreciable", lambda y: f"={A(L, 't_eq_n', y)}*Mobiliario"),
        ("elev", "Elevadores (uno por puesto)", "=V_Elev", "Depreciable", lambda y: f"={A(L, 'd_eq_n', y)}*Elevador"),
        ("herr", "Herramientas (con reposición)", "=V_Herr", "Depreciable",
         lambda y: f"={A(L, 'd_eq_n', y)}*Herramientas+{A(L, 'repo', y)}"),
        ("pek", "Proyecto Experimental: 6 kits Plus", "=V_Int", "Amortizable", lambda y: f"={A(L, 'pe_kits', y)}"),
        ("peo", "Proyecto Experimental: notaría y seguro", "=V_Int", "Amortizable", lambda y: f"={A(L, 'pe_otros', y)}"),
        ("sw", "Desarrollo de software", "=V_Int", "Amortizable", lambda y: f"={A(L, 'sw', y)}"),
        ("pnom", "Puesta en marcha: nómina previa", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_nom', y)}"),
        ("ploc", "Puesta en marcha: local previo", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_loc', y)}"),
        ("pcur", "Puesta en marcha: cursos y EPP", "=V_Int", "Amortizable", lambda y: f"={A(L, 'preop_cur', y)}"),
        ("const", "Constitución de la SpA y marca", "=V_Int", "Amortizable", lambda y: f"={A(L, 'const', y)}"),
        ("id", "I+D (neto de subsidio)", "=V_Int", "Amortizable", lambda y: f"={A(L, 'id_neto', y)}"),
        ("garr", "Garantía de arriendo", None, "Recuperable", lambda y: f"={A(L, 'garr', y)}"),
    ]
    fi = {}
    r_ini_items = r
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
        r += 1
    r_sub = r
    celda(ws, f"A{r}", "Subtotal activos, intangibles y garantías", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}{r_ini_items}:{cc}{r - 1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    ws[f"B{r}"].border = ws[f"C{r}"].border = B_TOTAL
    L.nombre("Inv_Act", H1, f"$D${r}:$I${r}")
    r += 1
    r_ct = r
    celda(ws, f"A{r}", "Capital de trabajo (hoja 3)", borde=B_FILA)
    celda(ws, f"C{r}", "Recuperable", tam=9, color=GRIS, alin=CEN, borde=B_FILA)
    for y in range(6):
        celda(ws, f"{col(4 + y)}{r}", f"=INDEX(CT_Inv,{y + 1})", FMT_PESOS, borde=B_FILA)
    r += 1
    r_tot = r
    celda(ws, f"A{r}", "Total inversión del año (sin capitalizar)", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"={cc}{r_sub}+{cc}{r_ct}", FMT_PESOS, negrita=True, borde=B_TOTAL)
    r += 1
    celda(ws, f"A{r}", "Crédito tributario I+D, Ley 20.241 (solo si se activa)", tam=9, color=GRIS)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=IDCred*{cc}{fi['id']}", FMT_PESOS, tam=9)
    L.nombre("CredID", H1, f"$D${r}:$I${r}")
    plegar(ws, rA, r)
    L.control("1. Inversión: inversión por ítem contra el motor", H1,
              f"=SUMPRODUCT(ABS(ROUND({q(H1)}!D{r_sub}:I{r_sub}-{q(H_ANU)}!C{L.filas_anu['inv_mes']}:H{L.filas_anu['inv_mes']},0)))")

    # ---------------- B. calendario del año 0 (un mes por fila; las mismas operaciones que la v4)
    r += 2
    rB = r
    bloque(ws, r, "B. Calendario del año 0, capitalizado al mes 0 con Ku (costo de oportunidad de la preinversión)", 9)
    r += 1
    encabezado(ws, r, ["Mes del proyecto", "", "", "Desembolso", "Factor (1 + Ku)^(−mes/12)", "Capitalizado al mes 0"], alto=30)
    fm = L.filas_men
    r += 1
    m0 = r
    for k in range(12):
        celda(ws, f"A{r}", f"={q(H_MEN)}!{mc(k + 1)}{fm['mes']}", '"Mes "0;"Mes −"0', alin=IZQ, borde=B_FILA)
        celda(ws, f"D{r}", f"={q(H_MEN)}!{mc(k + 1)}{fm['inv_mes']}", FMT_PESOS, borde=B_FILA)
        celda(ws, f"E{r}", f"=(1+Ku)^(-A{r}/12)", "0.0000", borde=B_FILA)
        celda(ws, f"F{r}", f"=D{r}*E{r}", FMT_PESOS, borde=B_FILA)
        for c in "BC":
            ws[f"{c}{r}"].border = B_FILA
        r += 1
    m1 = r - 1
    r_des = r
    celda(ws, f"A{r}", "Total del año 0", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=SUM(D{m0}:D{m1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    celda(ws, f"F{r}", f"=SUM(F{m0}:F{m1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    for c in "BCE":
        ws[f"{c}{r}"].border = B_TOTAL
    L.nombre("Inv0Cap", H1, f"$F${r}")
    r_cap = r
    r += 1
    celda(ws, f"A{r}", "Costo de oportunidad de la preinversión", borde=B_FILA)
    celda(ws, f"F{r}", f"=F{r_cap}-D{r_des}", FMT_PESOS, borde=B_FILA)
    r += 1
    celda(ws, f"A{r}", "Inversión del año 0 en el flujo (capitalizada + capital de trabajo)", negrita=True, borde=B_TOTAL)
    celda(ws, f"F{r}", f"=Inv0Cap+INDEX(CT_Inv,1)", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Inv0_Total", H1, f"$F${r}")
    plegar(ws, rB, r)
    L.control("1. Inversión: calendario del año 0 contra la tabla por ítem", H1, f"=ABS(ROUND({q(H1)}!D{r_des}-{q(H1)}!D{r_sub},0))")

    # ---------------- C. depreciación y amortización
    r += 2
    rC = r
    bloque(ws, r, "C. Depreciación y amortización por ítem, deflactadas (lineal, desde el año siguiente a la compra)", 9)
    r += 1
    encabezado(ws, r, ["Ítem", "Vida útil", ""] + [rot_anio(y) for y in range(6)], alto=28)
    r += 1
    r_idx = r
    celda(ws, f"A{r}", "Índice de precios (año 0 = 1)", borde=B_FILA)
    celda(ws, f"D{r}", "=1", "0.0000", borde=B_FILA)
    for y in range(1, 6):
        celda(ws, f"{col(4 + y)}{r}", f"={col(3 + y)}{r}*(1+INDEX(Infl,{y + 1}))", "0.0000", borde=B_FILA)
    L.nombre("IdxP", H1, f"$D${r}:$I${r}")
    r += 1
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
                  f"=SUMPRODUCT(({YR}<{cc}$3)*(({cc}$3-{YR})<=$B{r})*$D{fi[k]}:$I{fi[k]}*$D${r_idx}:$I${r_idx})/$B{r}/{cc}${r_idx}",
                  FMT_PESOS, borde=B_FILA)
        r += 1
    r_dep = r
    celda(ws, f"A{r}", "Depreciación total (activos fijos)", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}{fd['dino']}:{cc}{fd['herr']})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Dep", H1, f"$D${r}:$I${r}")
    r += 1
    celda(ws, f"A{r}", "Amortización total (intangibles)", negrita=True, borde=B_TOTAL)
    for y in range(6):
        cc = col(4 + y)
        celda(ws, f"{cc}{r}", f"=SUM({cc}{fd['pek']}:{cc}{fd['id']})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("Amort", H1, f"$D${r}:$I${r}")
    plegar(ws, rC, r)

    # ---------------- D. valor de desecho
    r += 2
    rD = r
    bloque(ws, r, "D. Valor de desecho contable al año 5 = valor libro + capital de trabajo + garantías (deflactados)", 9)
    r += 1
    encabezado(ws, r, ["Concepto", "", "", rot_anio(5), "", "", "", "", ""])
    r += 1
    vl0 = r
    for k in depr + amor:
        celda(ws, f"A{r}", f'="Valor libro: "&A{fi[k]}', borde=B_FILA)
        celda(ws, f"D{r}",
              f"=SUMPRODUCT($D{fi[k]}:$I{fi[k]}*$D${r_idx}:$I${r_idx}*(1-($I$3-{YR})/$B{fd[k]})*(($I$3-{YR})<$B{fd[k]}))/$I${r_idx}",
              FMT_PESOS, borde=B_FILA)
        r += 1
    celda(ws, f"A{r}", "Valor libro total", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=SUM(D{vl0}:D{r - 1})", FMT_PESOS, negrita=True, borde=B_TOTAL)
    r_vl = r
    r += 1
    celda(ws, f"A{r}", "Recuperación del capital de trabajo (hoja 3)", borde=B_FILA)
    celda(ws, f"D{r}", "=CT_Rec", FMT_PESOS, borde=B_FILA)
    r_ctr = r
    r += 1
    celda(ws, f"A{r}", "Recuperación de garantías (deflactadas)", borde=B_FILA)
    celda(ws, f"D{r}", f"=SUMPRODUCT(D{fi['garr']}:I{fi['garr']},D{r_idx}:I{r_idx})/I{r_idx}", FMT_PESOS, borde=B_FILA)
    r_gar = r
    r += 1
    celda(ws, f"A{r}", "Valor de desecho contable (año 5)", negrita=True, borde=B_TOTAL)
    celda(ws, f"D{r}", f"=D{r_vl}+D{r_ctr}+D{r_gar}", FMT_PESOS, negrita=True, borde=B_TOTAL)
    L.nombre("VD", H1, f"$D${r}")
    r += 1
    celda(ws, f"A{r}", "Referencia: valor de desecho económico (no se usa)", tam=9, color=GRIS, cursiva=True)
    celda(ws, f"D{r}", "=INDEX(FP_EBIT,6)*(1-TaxLP)/Ku", FMT_PESOS, tam=9, color=GRIS)
    L.nombre("VD_Eco", H1, f"$D${r}")
    plegar(ws, rD, r)

    # ---------------- resumen (filas 4 a 13)
    encabezado(ws, 4, ["Concepto (millones de $)", "", ""] + [rot_anio(y) for y in range(6)], alto=28)
    ws.merge_cells("A4:C4")
    anios = [col(4 + y) for y in range(6)]
    cols = anios
    m = ["A", "B", "C"]

    def todos(fn):
        return {c: fn(c) for c in anios}

    filas = [
        ("Activos fijos (equipamiento)", lambda c: f"=SUM({c}{fi['dino']}:{c}{fi['herr']})", False),
        ("Intangibles y puesta en marcha", lambda c: f"=SUM({c}{fi['pek']}:{c}{fi['id']})", False),
        ("Garantías de arriendo", lambda c: f"={c}{fi['garr']}", False),
        ("Capital de trabajo", lambda c: f"={c}{r_ct}", False),
        ("Total inversión del año", lambda c: f"={c}{r_tot}", True),
    ]
    r = 5
    for et, fn, tot in filas:
        _fila_resumen(ws, r, et, todos(fn), FMT_MM1, cols, tot, m)
        r += 1
    _fila_resumen(ws, r, "Inversión del año 0 en el flujo (con capital de trabajo)", {"D": "=Inv0_Total"}, FMT_MM1, cols, True, m)
    r += 1
    _fila_resumen(ws, r, "Depreciación (deflactada)", todos(lambda c: f"={c}{r_dep}"), FMT_MM1, cols, False, m)
    r += 1
    _fila_resumen(ws, r, "Amortización (deflactada)", todos(lambda c: f"={c}{r_dep + 1}"), FMT_MM1, cols, False, m)
    r += 1
    _fila_resumen(ws, r, "Valor de desecho contable (año 5)", {"I": "=VD"}, FMT_MM1, cols, True, m)
    ws.freeze_panes = "D5"


# =====================================================================================================
# HOJA 2. INGRESOS Y COSTOS
# =====================================================================================================
def hoja_2(L):
    ws = L.ws[H2]
    hoja_base(ws, 90)
    titular(ws, "2. INGRESOS Y COSTOS", "Estado de resultados de los años 1 a 5 · millones de $ (desglose por partida en pesos, plegado)", 7)
    indicador(ws, "G1", H2)
    ws.column_dimensions["A"].width = 44
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 14
    F = {}
    r = 23   # el detalle parte bajo el resumen (filas 4 a 21)

    def fila(k, et, fn, fmt=FMT_PESOS, neg=False, tot=False):
        nonlocal r
        F[k] = r
        bd = B_TOTAL if tot else B_FILA
        celda(ws, f"A{r}", et, negrita=neg or tot, borde=bd)
        for y in range(1, 6):
            celda(ws, f"{col(1 + y)}{r}", fn(y), fmt, negrita=neg or tot, borde=bd)
        if fmt in (FMT_PESOS, FMT_ENTERO):
            celda(ws, f"G{r}", f"=SUM(B{r}:F{r})", fmt, negrita=neg or tot, borde=bd)
        else:
            ws[f"G{r}"].border = B_FILA
        r += 1

    def seccion(t):
        nonlocal r
        t0 = r
        bloque(ws, r, t, 7)
        r += 1
        encabezado(ws, r, ["Partida (pesos)"] + [rot_anio(y) for y in range(1, 6)] + ["Total 5 años"], alto=28)
        r += 1
        return t0

    def sumf(keys):
        return lambda y: "=" + "+".join(f"{col(1 + y)}{F[k]}" for k in keys)

    secciones = []
    t = seccion("A. Ingresos por partida")
    fila("i_prop", "Taller propio: instalaciones netas", lambda y: f"={A(L, 'neto', y)}")
    fila("i_fin", "Financiamiento a clientes (intereses)", lambda y: f"={A(L, 'int_cob', y)}")
    fila("i_paq", "Red: paquetes de entrada", lambda y: f"={A(L, 'red_paq', y)}")
    fila("i_cuota", "Red: suscripción, cuota base", lambda y: f"={A(L, 'red_cuota', y)}")
    fila("i_hab", "Red: suscripción, Lumine Habilita", lambda y: f"={A(L, 'red_habi', y)}")
    fila("i_aran", "Red: arancel del 3CV (al costo)", lambda y: f"={A(L, 'red_aran', y)}")
    fila("ing", "Total ingresos", sumf(["i_prop", "i_fin", "i_paq", "i_cuota", "i_hab", "i_aran"]), tot=True)
    fila("i_rec", "Ingreso recurrente «Lumine Habilita Red»", sumf(["i_cuota", "i_hab"]), neg=True)
    secciones.append((t, r - 1))
    r += 1
    t = seccion("B. Costos variables por partida")
    fila("c_kit", "Kits instalados", lambda y: f"={A(L, 'kitc', y)}")
    fila("c_gar", "Garantía", lambda y: f"={A(L, 'gar', y)}")
    fila("c_com", "Comisiones de venta", lambda y: f"={A(L, 'comis', y)}")
    fila("c_sello", "Sello", lambda y: f"={A(L, 'sello', y)}")
    fila("c_ref", "Referidos", lambda y: f"={A(L, 'refe', y)}")
    fila("c_eval", "Evaluación crediticia", lambda y: f"={A(L, 'evalc', y)}")
    fila("c_prov", "Provisión de incobrables", lambda y: f"={A(L, 'prov', y)}")
    fila("c_mp", "Comisión de medio de pago", lambda y: f"={A(L, 'com_mp', y)}")
    fila("c_red", "Red: curso, auditoría, comisión y arancel", lambda y: f"={A(L, 'red_cdir', y)}")
    fila("cv", "Total costos variables", sumf(["c_kit", "c_gar", "c_com", "c_sello", "c_ref", "c_eval", "c_prov", "c_mp", "c_red"]), tot=True)
    secciones.append((t, r - 1))
    r += 1
    t = seccion("C. Costos fijos de operación por partida")
    fila("f_nop", "Nómina de operación del taller propio", lambda y: f"={A(L, 'nom_op', y)}")
    fila("f_nred", "Nómina de operación de la red", lambda y: f"={A(L, 'c_sop', y)}+{A(L, 'c_plat', y)}")
    fila("f_arr", "Arriendo", lambda y: f"={A(L, 'arr', y)}")
    fila("f_serv", "Servicios básicos", lambda y: f"={A(L, 'serv', y)}")
    fila("f_seg", "Seguros", lambda y: f"={A(L, 'seg', y)}")
    fila("f_mant", "Mantención de equipos", lambda y: f"={A(L, 'mant', y)}")
    fila("f_cur", "Cursos externos y EPP", lambda y: f"={A(L, 'cursos', y)}")
    fila("f_soft", "Software: mantención, hosting y licencias", lambda y: f"={A(L, 'soft', y)}")
    fila("cf", "Total costos fijos de operación", sumf(["f_nop", "f_nred", "f_arr", "f_serv", "f_seg", "f_mant", "f_cur", "f_soft"]), tot=True)
    secciones.append((t, r - 1))
    r += 1
    t = seccion("D. Gastos de administración y ventas por partida")
    fila("g_adm", "Nómina de administración", lambda y: f"={A(L, 'nom_adm', y)}")
    fila("g_ven", "Nómina de ventas", lambda y: f"={A(L, 'nom_ven', y)}+{A(L, 'c_comemp', y)}")
    fila("g_mk", "Marketing del taller propio", lambda y: f"={A(L, 'mk', y)}")
    fila("g_mkred", "Marketing a talleres (red)", lambda y: f"={A(L, 'mk_red', y)}")
    fila("gav", "Total gastos de administración y ventas", sumf(["g_adm", "g_ven", "g_mk", "g_mkred"]), tot=True)
    secciones.append((t, r - 1))
    # ---------------- resumen (filas 4 a 21): estado de resultados
    encabezado(ws, 4, ["Concepto (millones de $)"] + [rot_anio(y) for y in range(1, 6)] + ["Total 5 años"], alto=28)
    R = {}
    rr = 5
    c = lambda k, y: f"{col(1 + y)}{R[k]}"
    d = lambda k, y: f"{col(1 + y)}{F[k]}"

    def res(k, et, fn, fmt=FMT_MM1, tot=False, total=True):
        nonlocal rr
        R[k] = rr
        v = {col(1 + y): fn(y) for y in range(1, 6)}
        v["G"] = f"=SUM(B{rr}:F{rr})" if total else None
        _fila_resumen(ws, rr, et, v, fmt, [col(1 + y) for y in range(1, 6)] + ["G"], tot)
        rr += 1

    res("i_prop", "Ingresos del taller propio", lambda y: f"={d('i_prop', y)}")
    res("i_fin", "Ingresos por financiamiento a clientes", lambda y: f"={d('i_fin', y)}")
    res("red_ing", "Ingresos de la red de talleres", lambda y: f"={d('i_paq', y)}+{d('i_cuota', y)}+{d('i_hab', y)}+{d('i_aran', y)}")
    res("ing", "Total ingresos", lambda y: f"={d('ing', y)}", tot=True)
    res("cv", "(−) Costos variables", lambda y: f"={d('cv', y)}")
    res("mc", "Margen de contribución", lambda y: f"={c('ing', y)}-{c('cv', y)}", tot=True)
    res("mc_pct", "   Margen de contribución (% de los ingresos)", lambda y: f"=IF({c('ing', y)}=0,0,{c('mc', y)}/{c('ing', y)})", FMT_PCT, total=False)
    res("cf", "(−) Costos fijos de operación", lambda y: f"={d('cf', y)}")
    res("gav", "(−) Gastos de administración y ventas", lambda y: f"={d('gav', y)}")
    res("ebitda", "EBITDA", lambda y: f"={c('mc', y)}-{c('cf', y)}-{c('gav', y)}", tot=True)
    res("ebitda_pct", "   Margen EBITDA", lambda y: f"=IF({c('ing', y)}=0,0,{c('ebitda', y)}/{c('ing', y)})", FMT_PCT, total=False)
    res("dep", "(−) Depreciación", lambda y: f"=INDEX(Dep,{y + 1})")
    res("amort", "(−) Amortización", lambda y: f"=INDEX(Amort,{y + 1})")
    res("ebit", "EBIT (resultado operacional)", lambda y: f"={c('ebitda', y)}-{c('dep', y)}-{c('amort', y)}", tot=True)
    res("ebit_pct", "   Margen EBIT", lambda y: f"=IF({c('ing', y)}=0,0,{c('ebit', y)}/{c('ing', y)})", FMT_PCT, total=False)
    # resultado por línea, control de nómina e indicadores físicos (detalle)
    r += 1
    t = r
    bloque(ws, r, "E. Resultado por línea (a la red se le asignan su personal, sus costos por taller y el marketing a talleres)", 7)
    r += 1
    encabezado(ws, r, ["Concepto (pesos)"] + [rot_anio(y) for y in range(1, 6)] + ["Total 5 años"], alto=28)
    r += 1
    fila("red_ing", "Red: ingresos", lambda y: f"={c('red_ing', y)}")
    fila("red_cost", "Red: costos directos, personal y marketing", lambda y: f"={d('c_red', y)}+{A(L, 'nom_red', y)}+{d('g_mkred', y)}")
    fila("red_ebitda", "Red: EBITDA", lambda y: f"={d('red_ing', y)}-{d('red_cost', y)}", neg=True)
    fila("prop_ebitda", "Taller propio y financiamiento: EBITDA", lambda y: f"={c('ebitda', y)}-{d('red_ebitda', y)}", neg=True)
    secciones.append((t, r - 1))
    r += 1
    t = r
    bloque(ws, r, "F. Nómina contra la Tabla 16 de la Fase 3 (no tiene que calzar: cambiaron las rentas y la demanda)", 7)
    r += 1
    encabezado(ws, r, ["Concepto (pesos)"] + [rot_anio(y) for y in range(1, 6)] + ["Total 5 años"], alto=28)
    r += 1
    fila("nom", "Nómina total del modelo", lambda y: f"={A(L, 'nomina', y)}")
    fila("t16", "Nómina de la Fase 3, Tabla 16", lambda y: f"=INDEX(Tabla16,{y})")
    fila("dif16", "Diferencia (modelo − Fase 3)", lambda y: f"={d('nom', y)}-{d('t16', y)}")
    secciones.append((t, r - 1))
    r += 1
    t = r
    bloque(ws, r, "G. Indicadores físicos", 7)
    r += 1
    encabezado(ws, r, ["Indicador"] + [rot_anio(y) for y in range(1, 6)] + ["Total 5 años"], alto=28)
    r += 1
    fila("inst", "Instalaciones propias", lambda y: f"={A(L, 'inst', y)}", FMT_ENTERO)
    fila("duos", "Dúos al cierre", lambda y: f"={A(L, 'duos', y)}", FMT_ENTERO)
    fila("talleres", "Talleres propios al cierre", lambda y: f"={A(L, 'talleres', y)}", FMT_ENTERO)
    fila("tec", "Técnicos al cierre", lambda y: f"={A(L, 'tec', y)}", FMT_ENTERO)
    fila("dot", "Dotación total al cierre", lambda y: f"={A(L, 'dot', y)}", FMT_ENTERO)
    fila("red", "Talleres de la red al cierre", lambda y: f"={A(L, 'red_act', y)}", FMT_ENTERO)
    fila("util", "Utilización de la capacidad nominal", lambda y: f"={A(L, 'util_a', y)}", FMT_PCT)
    for k in ("duos", "talleres", "tec", "dot", "red"):
        ws[f"G{F[k]}"].value = None
    secciones.append((t, r - 1))
    for t0, t1 in secciones:
        plegar(ws, t0, t1)
    for nom, k in [("H2_Ing", "ing"), ("H2_CV", "cv"), ("H2_CF", "cf"), ("H2_GAV", "gav"), ("H2_EBITDA", "ebitda"), ("H2_Prop", "i_prop"),
                   ("H2_Fin", "i_fin"), ("H2_MC", "mc"), ("H2_RedIng", "red_ing")]:
        L.nombre(nom, H2, f"$B${R[k]}:$F${R[k]}")
    L.nombre("H2_Rec", H2, f"$B${F['i_rec']}:$F${F['i_rec']}")
    L.nombre("H2_Inst", H2, f"$B${F['inst']}:$F${F['inst']}")
    L.control("2. Ingresos y Costos: EBITDA contra el motor", H2,
              f"=SUMPRODUCT(ABS(ROUND({q(H2)}!B{R['ebitda']}:F{R['ebitda']}-{q(H_ANU)}!D{L.filas_anu['ebitda']}:H{L.filas_anu['ebitda']},0)))")
    # claves que usan otras hojas (todas con el mismo valor que en la v4)
    L.f2 = dict(cf=R["cf"], gav=R["gav"], dep=R["dep"], amort=R["amort"], i_fin=R["i_fin"], f_nred=F["f_nred"], g_mkred=F["g_mkred"],
                inst=F["inst"])
    ws.freeze_panes = "B5"


# =====================================================================================================
# HOJA 3. CAPITAL DE TRABAJO
# =====================================================================================================
def hoja_3(L):
    ws = L.ws[H3]
    hoja_base(ws, 90)
    titular(ws, "3. CAPITAL DE TRABAJO",
            "Un solo método: saldo al cierre de cada año (kits pagados + cartera del crédito − pies); el año 1, con el déficit acumulado máximo · millones de $", 8)
    indicador(ws, "H1", H3)
    ws.column_dimensions["A"].width = 40
    for k in range(2, 9):
        ws.column_dimensions[col(k)].width = 12.5   # el detalle mensual usa 7 columnas de cifras (B a H)
    fm = L.filas_men
    encabezado(ws, 4, ["Concepto (millones de $)"] + [rot_anio(y) for y in range(6)] + [""], alto=28)
    G = {}
    r = 5

    def fa(k, et, fn, fmt=FMT_MM1, tot=False):
        nonlocal r
        G[k] = r
        celda(ws, f"A{r}", et, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(6):
            celda(ws, f"{col(2 + y)}{r}", fn(y), fmt, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        r += 1

    fa("kits", "Kits pagados y no instalados (cierre)", lambda y: f"={A(L, 'kits_pag', y)}", FMT_MM1_POS)
    fa("cxc", "Cartera del crédito directo, neta (cierre)", lambda y: f"={A(L, 'cxc', y)}")
    fa("ab", "(−) Pies de ventas aún no instaladas (cierre)", lambda y: f"={A(L, 'abono_s', y)}")
    fa("saldo", "Saldo de capital de trabajo al cierre", lambda y: f"={col(2 + y)}{G['kits']}+{col(2 + y)}{G['cxc']}-{col(2 + y)}{G['ab']}", tot=True)
    fa("req", "Requerimiento del año", lambda y: "=0", tot=True)  # años 1 a 5 se completan abajo
    fa("inv", "Inversión al cierre del año (negativa = liberación)", lambda y: f"={col(3 + y)}{G['req']}-{col(2 + y)}{G['req']}" if y < 5 else "=0")
    fa("rec", "Recuperación del capital de trabajo (año 5)", lambda y: f"=G{G['req']}" if y == 5 else "=0")
    fa("pct", "Requerimiento (% de los ingresos del año)", lambda y: "=0" if y == 0 else f"=IFERROR({col(2 + y)}{G['req']}/INDEX(H2_Ing,{y}),0)", FMT_PCT)
    fa("pct_cxc", "Cartera del crédito (% del saldo)", lambda y: f"=IFERROR({col(2 + y)}{G['cxc']}/{col(2 + y)}{G['saldo']},0)", FMT_PCT)
    L.nombre("CT_Inv", H3, f"$B${G['inv']}:$G${G['inv']}")
    L.nombre("CT_Req", H3, f"$B${G['req']}:$G${G['req']}")
    L.nombre("CT_Rec", H3, f"$G${G['rec']}")
    r_fund = r + 1
    # ---------------- detalle mensual (meses en filas), plegado
    r = r_fund + 3
    rB = r
    bloque(ws, r, "Déficit acumulado máximo, meses −12 a 12 (método de clase) · pesos", 8)
    r += 1
    encabezado(ws, r, ["Mes del proyecto", "Flujo operativo del mes", "Saldo acumulado de caja", "Resultado acumulado (EBITDA)",
                       "Kits pagados no instalados", "Cartera del crédito, neta", "Pies recibidos", "Saldo de capital de trabajo"], alto=30)
    r += 1
    m0 = r
    series = [("A", "mes"), ("B", "fco"), ("C", "acum"), ("D", "ebitda_ac"), ("E", "kits_pag"), ("F", "cxc"), ("G", "abono"), ("H", "saldo_ct")]
    for j in range(24):
        rr = m0 + j
        for cc, mk in series:
            fmt = '"Mes "0;"Mes −"0' if cc == "A" else FMT_PESOS
            cel = celda(ws, f"{cc}{rr}", f"={q(H_MEN)}!{mc(j + 1)}{fm[mk]}", fmt, tam=9, negrita=cc in ("C", "H"), borde=B_FILA)
            if cc == "A":
                cel.alignment = IZQ
    m1 = m0 + 23
    rng = lambda cc: f"${cc}${m0}:${cc}${m1}"
    r = m1 + 2
    F = {}
    pos_min = f"MATCH(MIN({rng('C')}),{rng('C')},0)"
    res = [("deficit", "Déficit acumulado máximo (meses −12 a 12)", f"=MAX(0,-MIN({rng('C')}))", FMT_PESOS),
           ("mes_def", "Mes del déficit máximo", f"=INDEX({rng('A')},{pos_min})", '"Mes "0;"Mes −"0'),
           ("c_res", "Composición: pérdidas del arranque", f"=-INDEX({rng('D')},{pos_min})", FMT_PESOS),
           ("c_kits", "Composición: kits pagados no instalados", f"=INDEX({rng('E')},{pos_min})", FMT_PESOS),
           ("c_cxc", "Composición: cartera del crédito", f"=INDEX({rng('F')},{pos_min})", FMT_PESOS),
           ("c_ab", "Composición: (−) pies recibidos", f"=-INDEX({rng('G')},{pos_min})", FMT_PESOS)]
    for k, et, f, fmt in res:
        F[k] = r
        celda(ws, f"A{r}", et, negrita=k == "deficit", borde=B_TOTAL if k == "deficit" else B_FILA)
        celda(ws, f"B{r}", f, fmt, negrita=k == "deficit", borde=B_TOTAL if k == "deficit" else B_FILA, alin=DER)
        r += 1
    L.nombre("CT_Def", H3, f"$B${F['deficit']}")
    plegar(ws, rB, r - 1)
    for y in range(1, 6):
        ws[f"{col(2 + y)}{G['req']}"].value = (f"=IF(CTDefFlag=1,MAX($B${F['deficit']},C{G['saldo']}),C{G['saldo']})*(1+Holgura)" if y == 1
                                               else f"={col(2 + y)}{G['saldo']}*(1+Holgura)")
    # dos líneas cortas: método y fundamento (lo pide la estructura de la Fase 4)
    _nota(ws, r_fund, f'="Año 1: $"&FIXED(C{G["req"]}/1000000,1)&" M; manda "&IF(AND(CTDefFlag=1,$B${F["deficit"]}>C{G["saldo"]}),"el déficit acumulado máximo (mes "&$B${F["mes_def"]}&"): suma las pérdidas del arranque.","el saldo al cierre.")', "H")
    _nota(ws, r_fund + 1, f'="Año 5: $"&FIXED(G{G["saldo"]}/1000000,1)&" M, "&FIXED(G{G["pct_cxc"]}*100,0)&"% es cartera del crédito ("&FIXED(VtaCred*100,0)&"% de las ventas a "&Plazo&" cuotas). Se recupera en el año 5."', "H")
    L.control("3. Capital de Trabajo: saldo anual contra el motor", H3,
              f"=SUMPRODUCT(ABS(ROUND({q(H3)}!B{G['saldo']}:G{G['saldo']}-{q(H_ANU)}!C{L.filas_anu['saldo_ct']}:H{L.filas_anu['saldo_ct']},0)))")
    L.control("3. Capital de Trabajo: recuperación contra lo invertido", H3, f"=ABS(ROUND({q(H3)}!G{G['rec']}-SUM({q(H3)}!B{G['inv']}:G{G['inv']}),0))")
    L.control("3. Capital de Trabajo: composición del déficit", H3,
              f"=IF({q(H3)}!B{F['deficit']}=0,0,ABS(ROUND(SUM({q(H3)}!B{F['c_res']}:B{F['c_ab']})-{q(H3)}!B{F['deficit']},0)))")
    ws.freeze_panes = "B5"


# =====================================================================================================
# HOJA 4. FLUJO PURO
# =====================================================================================================
def hoja_4(L):
    ws = L.ws[H4]
    hoja_base(ws, 90)
    titular(ws, "4. FLUJO DE CAJA PURO", "Años 0 a 5, descontado a Ku (real, provisoria) · millones de $ (el flujo completo, con el impuesto, plegado abajo)", 7)
    indicador(ws, "G1")
    ws.column_dimensions["A"].width = 40
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 14
    celda(ws, "A3", "Año del proyecto (fila técnica)", tam=9, color=GRIS)
    for y in range(6):
        celda(ws, f"{col(2 + y)}3", "=COLUMN()-COLUMN($B$3)", "0", tam=9, color=GRIS, alin=CEN)
    ws.row_dimensions[3].hidden = True
    # ---------------- A. flujo completo (detalle)
    r = 29
    rA = r
    bloque(ws, r, "A. Flujo de caja puro completo (pesos): estado de resultados, impuesto con arrastre de pérdidas y flujo", 7)
    r += 1
    encabezado(ws, r, ["Concepto (pesos)"] + [rot_anio(y) for y in range(6)], alto=28)
    r += 1
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
    fila("p_ini", "Pérdida de arrastre (inicio del año)", lambda y: "=0")
    fila("base", "Base imponible = EBIT − pérdida de arrastre", lambda y: f"={c('ebit', y)}-{c('p_ini', y)}")
    fila("p_fin", "Pérdida de arrastre (cierre del año)", lambda y: f"=MAX(0,-{c('base', y)})")
    fila("tasa", "Tasa de impuesto del año", lambda y: f"=INDEX(Tax,{y + 1})", FMT_PCT)
    fila("imp0", "Impuesto de primera categoría (antes de créditos)", lambda y: f"=MAX(0,{c('base', y)})*{c('tasa', y)}")
    fila("cid_d", "Crédito I+D disponible (año + arrastre)", lambda y: "=INDEX(CredID,1)")
    fila("cid_u", "Crédito I+D usado", lambda y: f"=MIN({c('imp0', y)},{c('cid_d', y)})")
    fila("cid_a", "Crédito I+D de arrastre", lambda y: f"={c('cid_d', y)}-{c('cid_u', y)}")
    fila("imp", "(−) Impuesto", lambda y: f"=-({c('imp0', y)}-{c('cid_u', y)})")
    fila("un", "Utilidad neta", lambda y: f"={c('ebit', y)}+{c('imp', y)}", neg=True)
    fila("mdep", "(+) Depreciación", lambda y: f"=-{c('dep', y)}")
    fila("mam", "(+) Amortización", lambda y: f"=-{c('amort', y)}")
    fila("inv0", "(−) Inversión del año 0 (capitalizada al mes 0)", lambda y: "=-Inv0Cap" if y == 0 else "=0")
    fila("reinv", "(−) Reinversiones (puestos, talleres, herramientas, I+D)", lambda y: "=0" if y == 0 else f"=-INDEX(Inv_Act,{y + 1})")
    fila("ct", "(−) Inversión en capital de trabajo", lambda y: f"=-INDEX(CT_Inv,{y + 1})")
    fila("vd", "(+) Valor de desecho contable", lambda y: "=VD" if y == 5 else "=0")
    fila("fc", "Flujo de caja puro", lambda y: f"=SUM({c('un', y)}:{c('vd', y)})", tot=True)
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['p_ini']}"].value = f"={col(1 + y)}{F['p_fin']}"
        ws[f"{col(2 + y)}{F['cid_d']}"].value = f"=INDEX(CredID,{y + 1})+{col(1 + y)}{F['cid_a']}"
    r += 1
    fila("acum", "Flujo acumulado", lambda y: f"={c('fc', y)}")
    fila("desc", "Flujo descontado a Ku", lambda y: f"={c('fc', y)}/(1+Ku)^{col(2 + y)}$3")
    fila("dacum", "Flujo descontado acumulado", lambda y: f"={c('desc', y)}")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['acum']}"].value = f"={col(1 + y)}{F['acum']}+{c('fc', y)}"
        ws[f"{col(2 + y)}{F['dacum']}"].value = f"={col(1 + y)}{F['dacum']}+{c('desc', y)}"
    fila("pbs", "Payback simple: año de recuperación (interpolado)",
         lambda y: '=""' if y == 0 else f'=IF(AND({col(1 + y)}{F["acum"]}<0,{c("acum", y)}>=0),{col(1 + y)}$3+(-{col(1 + y)}{F["acum"]}/{c("fc", y)}),"")', FMT_DEC2)
    fila("pbd", "Payback descontado: año de recuperación (interpolado)",
         lambda y: '=""' if y == 0 else f'=IF(AND({col(1 + y)}{F["dacum"]}<0,{c("dacum", y)}>=0),{col(1 + y)}$3+(-{col(1 + y)}{F["dacum"]}/{c("desc", y)}),"")', FMT_DEC2)
    plegar(ws, rA, r - 1)
    L.nombre("FC_Puro", H4, f"$B${F['fc']}:$G${F['fc']}")
    L.nombre("FP_EBIT", H4, f"$B${F['ebit']}:$G${F['ebit']}")
    L.nombre("FP_Imp", H4, f"$B${F['imp']}:$G${F['imp']}")
    L.nombre("FP_Acum", H4, f"$B${F['acum']}:$G${F['acum']}")
    L.filas_h4_fc = F["fc"]
    # ---------------- resumen del flujo (filas 4 a 14)
    encabezado(ws, 4, ["Flujo de caja puro (millones de $)"] + [rot_anio(y) for y in range(6)], alto=28)
    cols = [col(2 + y) for y in range(6)]
    filas = [("Ingresos", lambda y: f"={c('ing', y)}", False),
             ("(−) Costos y gastos (variables, fijos y GAV)", lambda y: f"={c('cv', y)}+{c('cf', y)}+{c('gav', y)}", False),
             ("EBITDA", lambda y: f"={c('ebitda', y)}", True),
             ("(−) Impuesto", lambda y: f"={c('imp', y)}", False),
             ("(−) Inversión del año 0 y reinversiones", lambda y: f"={c('inv0', y)}+{c('reinv', y)}", False),
             ("(−) Capital de trabajo", lambda y: f"={c('ct', y)}", False),
             ("(+) Valor de desecho (año 5)", lambda y: f"={c('vd', y)}", False),
             ("Flujo de caja puro", lambda y: f"={c('fc', y)}", True),
             ("Flujo acumulado", lambda y: f"={c('acum', y)}", False),
             ("Flujo descontado acumulado (Ku)", lambda y: f"={c('dacum', y)}", False)]
    rr = 5
    for et, fn, tot in filas:
        _fila_resumen(ws, rr, et, {cc: fn(y) for y, cc in enumerate(cols)}, FMT_MM1, cols, tot)
        rr += 1
    # ---------------- indicadores (filas 16 a 25)
    rr = 16
    encabezado(ws, rr, ["Indicador (tasas provisorias)", "A Ku", "A WACC", "", "", "", ""])
    ind = {}
    fc = f"$B${F['fc']}"
    fcs = f"$C${F['fc']}:$G${F['fc']}"

    def fi(k, et, f1, f2=None, fmt=FMT_MM1, neg=True):
        nonlocal rr
        rr += 1
        ind[k] = rr
        celda(ws, f"A{rr}", et, borde=B_FILA)
        celda(ws, f"B{rr}", f1, fmt, negrita=neg, borde=B_FILA)
        if f2:
            celda(ws, f"C{rr}", f2, fmt, negrita=neg, borde=B_FILA)
        else:
            ws[f"C{rr}"].border = B_FILA

    fi("tasa", "Tasa de descuento (real)", "=Ku", "=WACC", FMT_PCT2, False)
    fi("van", "VAN del flujo puro", f"={fc}+NPV(B{rr},{fcs})", f"={fc}+NPV(C{rr},{fcs})")
    fi("tir", "TIR del flujo puro", f'=IFERROR(IRR($B${F["fc"]}:$G${F["fc"]}),"no existe")', None, FMT_PCT)
    ws[f"C{ind['tir']}"] = f"=B{ind['tir']}"
    ws[f"C{ind['tir']}"].number_format = FMT_PCT
    ws[f"C{ind['tir']}"].font = fuente(10, True)
    fi("pbs", "Payback simple (años)", f'=IF(COUNT(C{F["pbs"]}:G{F["pbs"]})=0,"> 5 años",MIN(C{F["pbs"]}:G{F["pbs"]}))', None, FMT_DEC1)
    fi("pbd", "Payback descontado a Ku (años)", f'=IF(COUNT(C{F["pbd"]}:G{F["pbd"]})=0,"> 5 años",MIN(C{F["pbd"]}:G{F["pbd"]}))', None, FMT_DEC1)
    fi("ir", "Índice de rentabilidad (VP flujos / inversión)", f"=NPV(B{ind['tasa']},{fcs})/-{fc}", f"=NPV(C{ind['tasa']},{fcs})/-{fc}", FMT_DEC2)
    fi("vp_vd", "Valor presente del valor de desecho", "=VD/(1+Ku)^5")
    fi("van_sin", "VAN sin valor de desecho", f"=B{ind['van']}-B{ind['vp_vd']}")
    fi("costo_ct", "Costo del capital de trabajo en el VAN", "=0")
    # composición del VAN (detalle plegado)
    r += 1
    rB = r
    bloque(ws, r, "B. De dónde viene el VAN (pesos)", 7)
    r += 1
    celda(ws, f"A{r}", "Valor presente de la recuperación del capital de trabajo", borde=B_FILA)
    celda(ws, f"B{r}", "=CT_Rec/(1+Ku)^5", FMT_PESOS, borde=B_FILA)
    r_vpvdct = r
    r += 1
    celda(ws, f"A{r}", "Valor presente de la inversión en capital de trabajo", borde=B_FILA)
    celda(ws, f"B{r}", "=-INDEX(CT_Inv,1)-NPV(Ku,INDEX(CT_Inv,2),INDEX(CT_Inv,3),INDEX(CT_Inv,4),INDEX(CT_Inv,5),INDEX(CT_Inv,6))",
          FMT_PESOS, borde=B_FILA)
    r_vpct = r
    plegar(ws, rB, r)
    ws[f"B{ind['costo_ct']}"].value = f"=B{r_vpct}+B{r_vpvdct}"
    L.nombre("VAN_Ku", H4, f"$B${ind['van']}")
    L.nombre("VAN_WACC", H4, f"$C${ind['van']}")
    L.nombre("TIR_Puro", H4, f"$B${ind['tir']}")
    L.nombre("PB_Simple", H4, f"$B${ind['pbs']}")
    L.nombre("PB_Desc", H4, f"$B${ind['pbd']}")
    L.nombre("IR_Ku", H4, f"$B${ind['ir']}")
    L.nombre("VAN_SinVD", H4, f"$B${ind['van_sin']}")
    L.nombre("CostoCT_VAN", H4, f"$B${ind['costo_ct']}")
    ws.freeze_panes = "B5"


# =====================================================================================================
# HOJA 5. FLUJO APALANCADO
# =====================================================================================================
def hoja_5(L):
    ws = L.ws[H5]
    hoja_base(ws, 90)
    titular(ws, "5. FLUJO DE CAJA APALANCADO", "Flujo del inversionista con un crédito de 40% de la inversión del año 0 a 5 años · millones de $ (detalle plegado)", 7)
    indicador(ws, "G1", H5)
    ws.column_dimensions["A"].width = 40
    for k in range(2, 8):
        ws.column_dimensions[col(k)].width = 14
    celda(ws, "A3", "Año del proyecto (fila técnica)", tam=9, color=GRIS)
    for y in range(6):
        celda(ws, f"{col(2 + y)}3", "=COLUMN()-COLUMN($B$3)", "0", tam=9, color=GRIS, alin=CEN)
    ws.row_dimensions[3].hidden = True
    F = {}
    r = 21

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
    rA = r
    bloque(ws, r, "A. Crédito bancario en pesos nominales (sistema francés, cuotas anuales) y deflactado", 7)
    r += 1
    encabezado(ws, r, ["Concepto (pesos)"] + [rot_anio(y) for y in range(6)], alto=28)
    r += 1
    fila("monto", "Monto del crédito = % de deuda × inversión del año 0", lambda y: "=PctD*Inv0_Total" if y == 0 else None)
    fila("s_ini", "Saldo inicial (nominal)", lambda y: None if y == 0 else "=0")
    fila("int", "Interés (nominal)", lambda y: None if y == 0 else f"={c('s_ini', y)}*KdNom")
    fila("cuota", "Cuota (PAGO, nominal)", lambda y: None if y == 0 else f"=IF({col(2 + y)}$3<=CredAnios,PMT(KdNom,CredAnios,-$B${F['monto']}),0)")
    fila("amo", "Amortización (nominal)", lambda y: None if y == 0 else f"={c('cuota', y)}-{c('int', y)}")
    fila("s_fin", "Saldo final (nominal)", lambda y: f"=B{F['monto']}" if y == 0 else f"={c('s_ini', y)}-{c('amo', y)}")
    for y in range(1, 6):
        ws[f"{col(2 + y)}{F['s_ini']}"].value = f"={col(1 + y)}{F['s_fin']}"
    fila("idx", "Índice de precios (año 0 = 1)", lambda y: f"=INDEX(IdxP,{y + 1})", "0.0000")
    fila("int_d", "Interés deflactado", lambda y: "=0" if y == 0 else f"={c('int', y)}/{c('idx', y)}")
    fila("amo_d", "Amortización deflactada", lambda y: "=0" if y == 0 else f"={c('amo', y)}/{c('idx', y)}")
    plegar(ws, rA, r - 1)
    r += 1
    rB = r
    bloque(ws, r, "B. Flujo del inversionista completo (pesos)", 7)
    r += 1
    encabezado(ws, r, ["Concepto (pesos)"] + [rot_anio(y) for y in range(6)], alto=28)
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
    fila("fi", "Flujo del inversionista", lambda y: f"={c('un', y)}+{c('da', y)}+{c('inv', y)}+{c('vd', y)}+{c('prest', y)}+{c('mamo', y)}", tot=True)
    fila("ahorro", "Ahorro tributario por intereses", lambda y: f"={c('imp', y)}-INDEX(FP_Imp,{y + 1})")
    fila("deuda", "Flujo de la deuda para Lumine", lambda y: f"={c('prest', y)}+{c('mint', y)}+{c('mamo', y)}+{c('ahorro', y)}")
    plegar(ws, rB, r - 1)
    L.nombre("FC_Inv", H5, f"$B${F['fi']}:$G${F['fi']}")
    L.nombre("FC_Deuda", H5, f"$B${F['deuda']}:$G${F['deuda']}")
    L.control("5. Flujo Apalancado: flujo puro + deuda = inversionista", H5,
              f"=SUMPRODUCT(ABS(ROUND({q(H4)}!B{L.filas_h4_fc}:G{L.filas_h4_fc}+{q(H5)}!B{F['deuda']}:G{F['deuda']}-{q(H5)}!B{F['fi']}:G{F['fi']},0)))")
    # ---------------- resumen
    encabezado(ws, 4, ["Flujo del inversionista (millones de $)"] + [rot_anio(y) for y in range(6)], alto=28)
    cols = [col(2 + y) for y in range(6)]
    filas = [("Flujo de caja puro", lambda y: f"=INDEX(FC_Puro,{y + 1})", False),
             ("(+) Préstamo recibido", lambda y: f"={c('prest', y)}", False),
             ("(−) Intereses (deflactados)", lambda y: f"={c('mint', y)}", False),
             ("(+) Ahorro tributario por intereses", lambda y: f"={c('ahorro', y)}", False),
             ("(−) Amortización de la deuda (deflactada)", lambda y: f"={c('mamo', y)}", False),
             ("Flujo del inversionista", lambda y: f"={c('fi', y)}", True)]
    rr = 5
    for et, fn, tot in filas:
        _fila_resumen(ws, rr, et, {cc: fn(y) for y, cc in enumerate(cols)}, FMT_MM1, cols, tot)
        rr += 1
    rr = 12
    encabezado(ws, rr, ["Indicador del inversionista (provisorio)", "Valor", "", "", "", "", ""])
    ind = {}
    for k, et, f, fmt in [("ke", "Ke (6. Tasa de Descuento)", "=Ke", FMT_PCT2),
                          ("van", "VAN del inversionista a Ke", f"=B{F['fi']}+NPV(Ke,C{F['fi']}:G{F['fi']})", FMT_MM1),
                          ("tir", "TIR del inversionista", f'=IFERROR(IRR(B{F["fi"]}:G{F["fi"]}),"no existe")', FMT_PCT),
                          ("vand", "VAN de la deuda a Kd real", f"=B{F['deuda']}+NPV(KdReal,C{F['deuda']}:G{F['deuda']})", FMT_MM1),
                          ("monto", "Crédito (40% de la inversión del año 0)", f"=B{F['monto']}", FMT_MM1),
                          ("aporte", "Aporte de los socios en el año 0", f"=-B{F['fi']}", FMT_MM1)]:
        rr += 1
        ind[k] = rr
        celda(ws, f"A{rr}", et, borde=B_FILA)
        celda(ws, f"B{rr}", f, fmt, negrita=True, borde=B_FILA)
    L.nombre("VAN_Ke", H5, f"$B${ind['van']}")
    L.nombre("TIR_Inv", H5, f"$B${ind['tir']}")
    L.nombre("VAN_Deuda", H5, f"$B${ind['vand']}")
    L.nombre("Prestamo", H5, f"$B${F['monto']}")
    ws.freeze_panes = "B5"


# =====================================================================================================
# HOJA 6. TASA DE DESCUENTO
# =====================================================================================================
def hoja_6(L):
    ws = L.ws[H6]
    hoja_base(ws, 95)
    titular(ws, "6. TASA DE DESCUENTO", "Ku para el flujo puro, Ke para el inversionista (Hamada) y WACC solo como referencia · tasas reales, provisorias", 3)
    indicador(ws, "C1")
    ws.column_dimensions["A"].width = 46
    ws.column_dimensions["B"].width = 15
    ws.column_dimensions["C"].width = 52
    # ---------------- A. cálculo (detalle)
    r = 19
    rA = r
    bloque(ws, r, "A. Cálculo de las tasas (CAPM, Hamada, Fisher y WACC)", 3)
    r += 1
    encabezado(ws, r, ["Concepto", "Valor", "Método y fuente"])
    r += 1
    R = {}
    defs = [
        ("rfl", "Rf limpia (real) = Rf − spread de default", "=RfL", FMT_PCT2, "BCU 10 años − spread (Damodaran)"),
        ("prm", "Prima por riesgo de mercado (Chile)", "=PRM", FMT_PCT2, "Damodaran, enero de 2026"),
        ("bu", "βU (desapalancado)", "=BetaU", FMT_DEC2, "Auto Parts EE.UU. (alternativa 1,13)"),
        ("pa", "Primas adicionales (cambiaria, iliquidez)", "=PrimasAd", FMT_PCT2, "Sin primas (provisorio)"),
        ("ku", "Ku = Rf limpia + βU × PRM + primas", None, FMT_PCT2, "CAPM con βU"),
        ("de", "D/E (estructura objetivo)", "=PctD/PctE", FMT_DEC2, "40% deuda / 60% patrimonio"),
        ("t", "Tasa de impuesto de largo plazo", "=TaxLP", FMT_PCT, "Ley 21.850"),
        ("bl", "βL = βU × (1 + (1 − t) × D/E)", None, FMT_DEC2, "Hamada"),
        ("ke", "Ke = Rf limpia + βL × PRM + primas", None, FMT_PCT2, "CAPM con βL"),
        ("kdn", "Kd nominal", "=KdNom", FMT_PCT2, "Banco Central, septiembre de 2026"),
        ("kdr", "Kd real (Fisher)", "=KdReal", FMT_PCT2, "(1 + Kd nominal) / (1 + inflación LP) − 1"),
        ("e", "Patrimonio / (D + E)", "=PctE", FMT_PCT, ""),
        ("d", "Deuda / (D + E)", "=PctD", FMT_PCT, ""),
        ("wacc", "WACC = E% × Ke + D% × Kd real × (1 − t)", None, FMT_PCT2, "Supone deuda en proporción constante"),
    ]
    for k, *_ in defs:
        R[k] = r
        r += 1
    formulas = {"ku": f"=B{R['rfl']}+B{R['bu']}*B{R['prm']}+B{R['pa']}",
                "bl": f"=B{R['bu']}*(1+(1-B{R['t']})*B{R['de']})",
                "ke": f"=B{R['rfl']}+B{R['bl']}*B{R['prm']}+B{R['pa']}",
                "wacc": f"=B{R['e']}*B{R['ke']}+B{R['d']}*B{R['kdr']}*(1-B{R['t']})"}
    for k, et, f, fmt, nota in defs:
        rr = R[k]
        neg = k in ("ku", "bl", "ke", "wacc")
        celda(ws, f"A{rr}", et, negrita=neg, borde=B_FILA)
        celda(ws, f"B{rr}", f or formulas[k], fmt, negrita=neg, borde=B_FILA)
        celda(ws, f"C{rr}", nota, color=GRIS, tam=9, borde=B_FILA)
    L.nombre("Ku", H6, f"$B${R['ku']}")
    L.nombre("BetaL", H6, f"$B${R['bl']}")
    L.nombre("Ke", H6, f"$B${R['ke']}")
    L.nombre("WACC", H6, f"$B${R['wacc']}")
    plegar(ws, rA, r - 1)
    r += 1
    rB = r
    bloque(ws, r, "B. Verificación: VAN ajustado = VAN puro + VAN de la deuda", 3)
    r += 1
    for et, f, nota in [("Diferencia: VAN ajustado − VAN a WACC", "=VAN_Ku+VAN_Deuda-VAN_WACC", "El WACC supone deuda constante; aquí se amortiza en 5 años"),
                        ("Diferencia: VAN ajustado − VAN del inversionista", "=VAN_Ku+VAN_Deuda-VAN_Ke", "Hamada y la deuda decreciente no calzan exactamente")]:
        celda(ws, f"A{r}", et, borde=B_FILA)
        celda(ws, f"B{r}", f, FMT_MM1, borde=B_FILA)
        celda(ws, f"C{r}", nota, color=GRIS, tam=9, borde=B_FILA)
        r += 1
    plegar(ws, rB, r - 1)
    # ---------------- resumen
    encabezado(ws, 4, ["Tasa o indicador", "Valor", "Lectura"])
    resumen = [("Ku: descuenta el flujo puro", "=Ku", FMT_PCT2, "CAPM con βU: riesgo del negocio sin deuda", True),
               ("βU (riesgo del negocio, sin deuda)", "=BetaU", FMT_DEC2, "Auto Parts EE.UU. (Damodaran)", False),
               ("βL (con 40% de deuda, Hamada)", "=BetaL", FMT_DEC2, "La deuda sube el riesgo del patrimonio", False),
               ("Ke: descuenta el flujo del inversionista", "=Ke", FMT_PCT2, "CAPM con βL", True),
               ("Kd real (Fisher)", "=KdReal", FMT_PCT2, "Kd nominal 8,4% llevado a real", False),
               ("WACC (solo referencia)", "=WACC", FMT_PCT2, "Supone deuda constante", False),
               ("VAN del flujo puro a Ku (millones de $)", "=VAN_Ku", FMT_MM1, "Valor del negocio sin financiamiento", True),
               ("VAN ajustado = puro + deuda (millones de $)", "=VAN_Ku+VAN_Deuda", FMT_MM1, "Método de Myers (verificación)", False),
               ("VAN del flujo puro a WACC (millones de $)", "=VAN_WACC", FMT_MM1, "Referencia", False),
               ("VAN del inversionista a Ke (millones de $)", "=VAN_Ke", FMT_MM1, "Lo que ganan los socios con 40% de deuda", False)]
    rr = 5
    for et, f, fmt, nota, neg in resumen:
        celda(ws, f"A{rr}", et, negrita=neg, borde=B_FILA)
        celda(ws, f"B{rr}", f, fmt, negrita=neg, borde=B_FILA)
        celda(ws, f"C{rr}", nota, color=GRIS, tam=9, borde=B_FILA)
        rr += 1
    _nota(ws, rr + 1, '="Cada punto más de Ku cambia el VAN en cerca de $"&FIXED((VAN_Ku-(INDEX(FC_Puro,1)+NPV(Ku+0.01,INDEX(FC_Puro,2),INDEX(FC_Puro,3),INDEX(FC_Puro,4),INDEX(FC_Puro,5),INDEX(FC_Puro,6))))/1000000,0)&" millones."', "C")
    ws.freeze_panes = "B5"


# =====================================================================================================
# HOJA 7. PUNTO DE EQUILIBRIO
# =====================================================================================================
def hoja_7(L):
    ws = L.ws[H7]
    hoja_base(ws, 90)
    titular(ws, "7. PUNTO DE EQUILIBRIO", "Multiproducto (40% Esencial, 60% Plus) en vehículos y en pesos, años 1 a 5; la red aparte (talleres que cubren sus costos fijos)", 6)
    indicador(ws, "F1")
    ws.column_dimensions["A"].width = 50
    for k in range(2, 7):
        ws.column_dimensions[col(k)].width = 15
    F = {}
    F2 = L.f2
    r = 18

    def fila(k, et, fn, fmt=FMT_PESOS, tot=False):
        nonlocal r
        F[k] = r
        celda(ws, f"A{r}", et, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        for y in range(1, 6):
            celda(ws, f"{col(1 + y)}{r}", fn(y), fmt, negrita=tot, borde=B_TOTAL if tot else B_FILA)
        r += 1

    c = lambda k, y: f"{col(1 + y)}{F[k]}"
    h2 = lambda k, y: f"{q(H2)}!{col(1 + y)}{F2[k]}"
    rA = r
    bloque(ws, r, "A. Margen de contribución unitario por producto (pesos)", 6)
    r += 1
    encabezado(ws, r, ["Concepto"] + [rot_anio(y) for y in range(1, 6)], alto=28)
    r += 1
    fila("fac", "Factor de costo empresa promedio del año",
         lambda y: f"=AVERAGEIFS({q(H_MEN)}!$D${L.filas_men['fac']}:$BW${L.filas_men['fac']},{q(H_MEN)}!$D${L.filas_men['anio']}:$BW${L.filas_men['anio']},{y})", "0.0000")
    fila("e_ing", "Esencial: ingreso unitario neto", lambda y: "=PrecioE*(1-VtaCred*Bono)")
    fila("e_cv", "Esencial: costo variable unitario",
         lambda y: f"=KitE*(1+GarPct)+Sello+RefPct*RefMonto+ComInst*{c('fac', y)}+EvalCred*VtaCred+Incob*(1-Pie)*VtaCred*PrecioE*(1-Bono)+ComMP*(1-VtaCred)*PrecioE")
    fila("e_mc", "Esencial: margen de contribución", lambda y: f"={c('e_ing', y)}-{c('e_cv', y)}")
    fila("p_ing", "Plus: ingreso unitario neto", lambda y: "=PrecioP*(1-VtaCred*Bono)")
    fila("p_cv", "Plus: costo variable unitario",
         lambda y: f"=KitP*(1+GarPct)+Sello+RefPct*RefMonto+ComInst*{c('fac', y)}+EvalCred*VtaCred+Incob*(1-Pie)*VtaCred*PrecioP*(1-Bono)+ComMP*(1-VtaCred)*PrecioP")
    fila("p_mc", "Plus: margen de contribución", lambda y: f"={c('p_ing', y)}-{c('p_cv', y)}")
    fila("mix", "Mezcla Plus", lambda y: "=Mix", FMT_PCT)
    fila("mcp", "Margen de contribución ponderado por vehículo", lambda y: f"=(1-{c('mix', y)})*{c('e_mc', y)}+{c('mix', y)}*{c('p_mc', y)}", tot=True)
    fila("mcp_pct", "Margen ponderado (% del ingreso)",
         lambda y: f"={c('mcp', y)}/((1-{c('mix', y)})*{c('e_ing', y)}+{c('mix', y)}*{c('p_ing', y)})", FMT_PCT)
    plegar(ws, rA, r - 1)
    r += 1
    rB = r
    bloque(ws, r, "B. Costos fijos a cubrir y punto de equilibrio (pesos)", 6)
    r += 1
    encabezado(ws, r, ["Concepto"] + [rot_anio(y) for y in range(1, 6)], alto=28)
    r += 1
    fila("cf_caja", "Costos fijos de caja del taller propio (sin la red)",
         lambda y: f"={h2('cf', y)}-{h2('f_nred', y)}+{h2('gav', y)}-{A(L, 'c_comemp', y)}-{h2('g_mkred', y)}")
    fila("da", "(+) Depreciación y amortización", lambda y: f"={h2('dep', y)}+{h2('amort', y)}")
    fila("fin", "(−) Ingreso por financiamiento del año", lambda y: f"={h2('i_fin', y)}")
    fila("cf_cont", "Costos fijos contables netos a cubrir", lambda y: f"={c('cf_caja', y)}+{c('da', y)}-{c('fin', y)}", tot=True)
    fila("pe_q", "Punto de equilibrio contable (vehículos)", lambda y: f"=MAX(0,ROUNDUP({c('cf_cont', y)}/{c('mcp', y)},0))", FMT_ENTERO, True)
    fila("pe_e", "   de los cuales Esencial", lambda y: f"=ROUND({c('pe_q', y)}*(1-{c('mix', y)}),0)", FMT_ENTERO)
    fila("pe_p", "   de los cuales Plus", lambda y: f"={c('pe_q', y)}-{c('pe_e', y)}", FMT_ENTERO)
    fila("pe_v", "Punto de equilibrio contable en pesos", lambda y: f"={c('pe_e', y)}*{c('e_ing', y)}+{c('pe_p', y)}*{c('p_ing', y)}")
    fila("pe_caja", "Punto de equilibrio de caja (vehículos)", lambda y: f"=MAX(0,ROUNDUP(({c('cf_caja', y)}-{c('fin', y)})/{c('mcp', y)},0))", FMT_ENTERO)
    fila("inst", "Instalaciones proyectadas", lambda y: f"={A(L, 'inst', y)}", FMT_ENTERO)
    fila("ms", "Margen de seguridad", lambda y: f"=IFERROR(({c('inst', y)}-{c('pe_q', y)})/{c('inst', y)},0)", FMT_PCT)
    fila("cubre", "¿Las instalaciones cubren el equilibrio? (1 = sí)", lambda y: f"=IF({c('inst', y)}>={c('pe_q', y)},1,0)", "0")
    for k in ("pe_q", "pe_e", "pe_p", "pe_caja", "inst"):
        L.entero(f"7. Punto de Equilibrio: {k}", H7, f"B{F[k]}:F{F[k]}")
    plegar(ws, rB, r - 1)
    r += 1
    rC = r
    bloque(ws, r, "C. Red de talleres: talleres activos que cubren sus costos fijos", 6)
    r += 1
    encabezado(ws, r, ["Concepto"] + [rot_anio(y) for y in range(1, 6)], alto=28)
    r += 1
    fila("r_cf", "Costos fijos de la red (personal y marketing)", lambda y: f"={A(L, 'nom_red', y)}+{q(H2)}!{col(1 + y)}{F2['g_mkred']}")
    fila("r_mg", "Margen anual por taller activo", lambda y: "=(RedCuota+RedHab*RedTec)*12-RedAudit")
    fila("r_pe", "Talleres activos necesarios", lambda y: f"=IF({c('r_cf', y)}=0,0,ROUNDUP({c('r_cf', y)}/{c('r_mg', y)},0))", FMT_ENTERO, True)
    fila("r_act", "Talleres activos promedio del año", lambda y: f"={A(L, 'red_cuota', y)}/RedCuota/12", FMT_DEC1)
    L.entero("7. Punto de Equilibrio: talleres de la red", H7, f"B{F['r_pe']}:F{F['r_pe']}")
    plegar(ws, rC, r - 1)
    L.nombre("PE_Q", H7, f"$B${F['pe_q']}:$F${F['pe_q']}")
    # ---------------- resumen
    encabezado(ws, 4, ["Punto de equilibrio"] + [rot_anio(y) for y in range(1, 6)], alto=28)
    cols = [col(1 + y) for y in range(1, 6)]
    filas = [("Margen de contribución por vehículo (miles de $)", "mcp", FMT_MIL1, False),
             ("Costos fijos netos a cubrir (millones de $)", "cf_cont", FMT_MM1, False),
             ("Punto de equilibrio contable (vehículos)", "pe_q", FMT_ENTERO, True),
             ("Punto de equilibrio contable (millones de $)", "pe_v", FMT_MM1, False),
             ("Punto de equilibrio de caja (vehículos)", "pe_caja", FMT_ENTERO, False),
             ("Instalaciones proyectadas (vehículos)", "inst", FMT_ENTERO, True),
             ("Margen de seguridad", "ms", FMT_PCT, False),
             ("Talleres de la red necesarios", "r_pe", FMT_ENTERO, False),
             ("Talleres de la red activos (promedio del año)", "r_act", FMT_DEC1, False)]
    rr = 5
    for et, k, fmt, tot in filas:
        _fila_resumen(ws, rr, et, {cc: f"={cc}{F[k]}" for cc in cols}, fmt, cols, tot)
        rr += 1
    _nota(ws, rr + 1, "Método: Q = costos fijos contables netos ÷ margen de contribución ponderado; el ingreso por financiamiento se descuenta de los fijos.", "F")
    _nota(ws, rr + 2, f'="Año 1: equilibrio "&FIXED(B{F["pe_q"]},0)&" vehículos y se proyectan "&FIXED(B{F["inst"]},0)&": "&IF(B{F["inst"]}>=B{F["pe_q"]},"se cubre.","cierra con pérdida (la cubre el capital de trabajo). Se cubre desde el "&IFERROR(INDEX($B$4:$F$4,MATCH(1,B{F["cubre"]}:F{F["cubre"]},0)),"(fuera del horizonte)")&".")', "F")
    ws.freeze_panes = "B5"
