"""Supuestos clave (visible), Supuestos detalle y Datos Fase 3 (ocultas).

Los valores de entrada viven en Supuestos clave o en Supuestos detalle (bloques A a O). Datos Fase 3 solo tiene fórmulas.
Los nombres definidos se conservan: si un supuesto pasó a Supuestos clave, su nombre apunta ahí y ninguna fórmula cambia.
"""
from datetime import date

from openpyxl.styles import PatternFill
from openpyxl.worksheet.hyperlink import Hyperlink

from base import H_DASH, H_F3, H_SUP, H_SUPC, UNIDAD, q, rot_anio
from estilo import (B_FILA, B_TOTAL, CEN, DER, F_GRIS, FMT_DEC1, FMT_DEC2, FMT_ENTERO, FMT_FECHA_D, FMT_MES, FMT_PCT, FMT_PCT2,
                    FMT_PCT3, FMT_PESOS, GRIS, IZQ, IZQ_W, RELLENO, TINTA, TIPO_TXT, CELESTE8, B_ENC, bloque, celda, col, encabezado,
                    fuente, hoja_base, titular)

# =====================================================================================================
# SUPUESTOS CLAVE (visible): una página con los supuestos que mueven el resultado
# =====================================================================================================
# ("#", sección) · ("p", nombre, rótulo, unidad, fuente corta) · ("f", rótulo, fórmula, formato, unidad, fuente) ·
# ("tax", índice, rótulo, unidad, fuente). El valor, el tipo y el formato de cada "p" los pone Supuestos detalle.
CLAVE = [
    ("#", "CALENDARIO"),
    ("p", "Anio0", "Año 0: preoperativo (12 meses)", "año", "Decisión del equipo (traspaso §4)"),
    ("p", "Atraso", "Atraso del reglamento propio", "meses", "Ley 21.793 sin reglamento: va como escenario"),
    ("#", "PRECIO Y COSTO DEL KIT"),
    ("p", "PE_IVA", "Precio Esencial (con IVA)", "$", "Fase 3; encuesta de 33 respuestas"),
    ("p", "PP_IVA", "Precio Plus (con IVA)", "$", "Fase 3; encuesta de 33 respuestas"),
    ("p", "Mix", "Mezcla de ventas: Plus", "% de ventas", "Supuesto del equipo (Fase 3)"),
    ("p", "PesoReal", "Kit: peso del costeo realista", "%", "50% = punto medio (decisión del 08-11-2026)"),
    ("f", "Costo del kit (mezcla, con forward)", "=KitMezcla", FMT_PESOS, "$ por kit", "Fórmula (Datos Fase 3)"),
    ("p", "Dolar", "Dólar observado", "$/US$", "SII, promedio de octubre de 2026"),
    ("#", "DEMANDA (MODELO DE BASS)"),
    ("p", "mRM", "Segmento laboral RM (techo 100%)", "vehículos", "Deducido de la Fase 3"),
    ("p", "Techo", "Techo de la demanda usado", "%", "Provisorio: validar con la encuesta"),
    ("p", "pBass", "p (innovación)", "", "Massiani y Gohs (2015)"),
    ("p", "qBass", "q (imitación)", "", "Ajuste propio a ANAC 2018–2025"),
    ("#", "CAPACIDAD"),
    ("p", "CapDuoA", "Capacidad por dúo (meses 1 a 4)", "veh. al mes", "Fase 3, Tabla 10"),
    ("p", "CapDuoB", "Capacidad por dúo (desde mayo de 2028)", "veh. al mes", "Fase 3, Tabla 10 (jornada de 40 h)"),
    ("p", "Util", "Regla de dúos: utilización máxima", "%", "Fase 3 (regla del 80%)"),
    ("#", "COBROS Y CRÉDITO DIRECTO"),
    ("p", "VtaCred", "Ventas con crédito directo", "% de ventas", "Decisión del equipo (08-11-2026)"),
    ("p", "TasaCredNom", "Tasa del crédito (nominal)", "% mensual", "Marcas: 0,99% a 1,89% mensual"),
    ("p", "Plazo", "Plazo del crédito", "meses", "Supuesto del equipo"),
    ("#", "RED DE TALLERES (SE COBRA POR TALLER)"),
    ("f", "Paquete de entrada (una vez)", "=RedPaquete", FMT_PESOS, "$ por taller", "Derecho + formación de 2 técnicos"),
    ("p", "RedCuota", "Cuota base mensual", "$ por taller", "Ref.: Bosch Car Service (R$810 al mes)"),
    ("p", "RedHab", "Lumine Habilita por técnico", "$ al mes", "Canasta de redcapacitacion.cl (07-11-2026)"),
    ("#", "IMPUESTO DE PRIMERA CATEGORÍA"),
    ("tax", 0, '="Año 0 ("&Anio0&")"', "% anual", "Pro Pyme"),
    ("tax", 1, '="Año 1 ("&(Anio0+1)&")"', "% anual", "Pro Pyme"),
    ("tax", 2, '="Desde el año 2 ("&(Anio0+2)&")"', "% anual", "Ley 21.850 (17-10-2026)"),
    ("#", "TASAS DE DESCUENTO (PROVISORIAS)"),
    ("p", "Rf", "Rf: BCU a 10 años (real)", "% anual", "Banco Central, 19-10-2026"),
    ("p", "SpreadCL", "Spread de default de Chile", "% anual", "Damodaran, enero de 2026"),
    ("p", "PRM", "Prima por riesgo de mercado", "% anual", "Damodaran, enero de 2026"),
    ("p", "BetaU", "βU (Auto Parts EE.UU.)", "", "Damodaran, enero de 2026"),
    ("p", "PctE", "Estructura: patrimonio (deuda 40%)", "%", "Supuesto del equipo"),
    ("p", "KdNom", "Kd nominal (crédito bancario)", "% anual", "Banco Central, septiembre de 2026"),
    ("f", "Ku: descuenta el flujo puro", "=Ku", FMT_PCT2, "% real", "CAPM con βU (hoja 6)"),
    ("f", "Ke: descuenta el flujo del inversionista", "=Ke", FMT_PCT2, "% real", "CAPM con βL de Hamada (hoja 6)"),
    ("f", "WACC (solo referencia)", "=WACC", FMT_PCT2, "% real", "Hoja 6"),
]


class Clave:
    def __init__(self):
        self.rows = {}      # nombre -> fila en Supuestos clave
        self.tax = {}       # índice (0, 1, 2) -> fila
        self.anios = {}     # nombre de fila por año -> {año: fila de Supuestos clave}


def hoja_supuestos_clave(L):
    ws = L.ws[H_SUPC]
    hoja_base(ws, 100)
    titular(ws, "SUPUESTOS CLAVE",
            "Los supuestos que mueven el resultado. El resto (con las alternativas de las sensibilidades) está en «Supuestos detalle», hoja oculta.", 5)
    for c, w in zip("ABCDE", [40, 15, 14, 12, 44]):
        ws.column_dimensions[c].width = w
    encabezado(ws, 4, ["Supuesto", "Valor", "Unidad", "Tipo", "Fuente y fecha"])
    K = Clave()
    r = 5
    for e in CLAVE:
        if e[0] == "#":
            c = celda(ws, f"A{r}", e[1], tam=9, negrita=True, color=CELESTE8)
            for k in "ABCDE":
                ws[f"{k}{r}"].border = B_ENC
        elif e[0] == "p":
            _, nom, et, uni, fu = e
            K.rows[nom] = r
            celda(ws, f"A{r}", et, borde=B_FILA)
            celda(ws, f"C{r}", uni, tam=9, color=GRIS, borde=B_FILA)
            celda(ws, f"E{r}", fu, tam=9, color=GRIS, borde=B_FILA)
        elif e[0] == "f":
            _, et, f, fmt, uni, fu = e
            celda(ws, f"A{r}", et, borde=B_FILA)
            celda(ws, f"B{r}", f, fmt, negrita=True, alin=DER, borde=B_FILA)
            celda(ws, f"C{r}", uni, tam=9, color=GRIS, borde=B_FILA)
            celda(ws, f"D{r}", "Fórmula", tam=9, color=GRIS, borde=B_FILA)
            celda(ws, f"E{r}", fu, tam=9, color=GRIS, borde=B_FILA)
        elif e[0] == "tax":
            _, i, et, uni, fu = e
            K.tax[i] = r
            celda(ws, f"A{r}", et, borde=B_FILA)
            celda(ws, f"C{r}", uni, tam=9, color=GRIS, borde=B_FILA)
            celda(ws, f"E{r}", fu, tam=9, color=GRIS, borde=B_FILA)
        r += 1
    K.anios["Tax"] = {0: K.tax[0], 1: K.tax[1], 2: K.tax[2], 3: K.tax[2], 4: K.tax[2], 5: K.tax[2]}
    ws.freeze_panes = "B5"
    ws.print_title_rows = "4:4"
    L.fin_clave = r
    return K


# =====================================================================================================
# SUPUESTOS DETALLE (oculta): todas las entradas por bloque, con alternativas A–C
# =====================================================================================================
class Supuestos:
    """Columnas: A parámetro, B valor, C unidad, D valor usado, E–G alternativas, H fuente."""

    def __init__(self, L, clave):
        self.L = L
        self.ws = L.ws[H_SUP]
        self.clave = clave
        self.wsc = L.ws[H_SUPC]
        self.r = 8
        self.casos = []        # dict(nombre, codigo, parametro, base, valor, grupo)
        self.indice = []       # (texto, fila) para el índice de bloques
        self.filas = {}        # nombre -> fila en Supuestos detalle
        self._escritos = set()

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
        enc = [primera] + [rot_anio(y) if y >= desde else "" for y in range(6)] + ["Fuente y fecha"]
        encabezado(self.ws, r, enc)

    def enc_datos(self, titulos):
        r = self._fila()
        t = list(titulos) + [""] * (7 - len(titulos))
        encabezado(self.ws, r, t[:7] + ["Fuente y fecha"])

    def nota(self, texto, tipo="P"):
        r = self._fila()
        c = self.ws.cell(row=r, column=1, value=texto)
        c.font = fuente(9, False, TINTA, True)
        c.fill = RELLENO[tipo]
        c.alignment = IZQ_W
        self.ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=8)
        self.ws.row_dimensions[r].height = 15

    def _a_clave(self, fila_c, valor, fmt, tipo):
        """Escribe el dato de entrada en Supuestos clave (una sola vez) y devuelve el enlace."""
        if fila_c not in self._escritos:
            celda(self.wsc, f"B{fila_c}", valor, fmt, relleno=RELLENO[tipo], alin=DER, borde=B_FILA)
            celda(self.wsc, f"D{fila_c}", TIPO_TXT[tipo], tam=9, color=GRIS, borde=B_FILA)
            self._escritos.add(fila_c)
        return f"={q(H_SUPC)}!$B${fila_c}"

    def p(self, nom, etiqueta, valor, unidad, tipo, fuente_txt, fmt=FMT_PESOS, alts=None, extra=None, caso_grupo="sens"):
        """Parámetro escalar. alts = [(letra, valor_o_fórmula, nombre_del_caso)]; extra = {código: letra}."""
        ws, r = self.ws, self._fila()
        self.filas[nom] = r
        fila_c = self.clave.rows.get(nom)
        if fila_c:
            valor_det = self._a_clave(fila_c, valor, fmt, tipo)
            fuente_txt = fuente_txt + " · se edita en Supuestos clave"
        else:
            valor_det = valor
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        es_formula = isinstance(valor_det, str) and valor_det.startswith("=")
        celda(ws, f"B{r}", valor_det, fmt, relleno=None if es_formula else RELLENO[tipo], borde=B_FILA)
        celda(ws, f"C{r}", unidad, color=GRIS, tam=9, borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        for k in "DEFG":
            ws[f"{k}{r}"].border = B_FILA
        hoja_base_nom, ref_base = (H_SUPC, f"$B${fila_c}") if fila_c else (H_SUP, f"$B${r}")
        if alts:
            self.L.nombre(nom + "_base", hoja_base_nom, ref_base)
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
            self.L.nombre(nom, hoja_base_nom, ref_base)
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
        enlaces = self.clave.anios.get(nom) if nom else None
        if enlaces:
            # varios años comparten una celda de Supuestos clave solo si el valor es idéntico (no cambia ningún número)
            for k, fc in enlaces.items():
                hermanos = [j for j, f2 in enlaces.items() if f2 == fc]
                assert len({valores[j] for j in hermanos}) == 1, (nom, hermanos)
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        for k, v in enumerate(valores):
            c = col(2 + k)
            if k < desde:
                ws[f"{c}{r}"].border = B_FILA
                continue
            if enlaces:
                v = self._a_clave(enlaces[k], v, fmt, tipo)
            es_f = isinstance(v, str) and str(v).startswith("=")
            celda(ws, f"{c}{r}", v, fmt, relleno=None if es_f else RELLENO[tipo], borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt + (" · se edita en Supuestos clave" if enlaces else ""), color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        if nom:
            self.L.nombre(nom, H_SUP, f"${col(2 + desde)}${r}:$G${r}")
        return r

    def dato(self, etiqueta, valores, fmt, tipo, fuente_txt):
        """Fila de datos del bloque O (hasta 6 valores en B..G) para la hoja Datos Fase 3. Devuelve la fila."""
        ws, r = self.ws, self._fila()
        celda(ws, f"A{r}", etiqueta, alin=IZQ_W, borde=B_FILA)
        for k in range(6):
            v = valores[k] if k < len(valores) else None
            if v is None:
                ws.cell(row=r, column=2 + k).border = B_FILA
                continue
            celda(ws, f"{col(2 + k)}{r}", v, fmt, relleno=RELLENO[tipo], borde=B_FILA)
        celda(ws, f"H{r}", fuente_txt, color=GRIS, tam=9, alin=IZQ_W, borde=B_FILA)
        return r


def hoja_supuestos(L, clave):
    S = Supuestos(L, clave)
    ws = S.ws
    hoja_base(ws, 90, visible=False)
    titular(ws, "SUPUESTOS DETALLE",
            "Todas las entradas por bloque (A a O), con su fuente y las alternativas A–C de las sensibilidades; los supuestos clave se editan en «Supuestos clave».")
    for c, w in zip("ABCDEFGH", [60, 14, 15, 14, 13, 13, 13, 66]):
        ws.column_dimensions[c].width = w
    # (la leyenda de colores está una sola vez en el libro: en el Índice)
    r = 5
    celda(ws, f"H{r}", "Negrita en la columna D = valor que usa el modelo (cambia con la sensibilidad activa).", tam=9, color=GRIS)
    r = 6
    celda(ws, f"A{r}", "Escenario activo (se elige en el Dashboard) y sensibilidad activa (se elige en Sensibilidades):", tam=9, color=GRIS)
    celda(ws, f"B{r}", "=EscenarioSel", negrita=True, alin=CEN)
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
    S.p("DolarVar", "Variación del dólar para la sensibilidad", 0.10, "%", "S", "Supuesto del equipo (Sensibilidades)", FMT_PCT)
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
    S.p("PesoReal", "Costo del kit: peso del costeo realista de la Fase 3 (50% = punto medio con el mejor caso)", 0.5, "%", "S",
        "Decisión del equipo (traspaso §6): punto medio entre el realista ($3,25 M) y el mejor caso ($2,82 M)", FMT_PCT,
        alts=[("A", 1.0, None), ("B", 0.0, None)], extra={"P1": "A"})

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
        "Fase 3 (exige 25% de holgura sobre la demanda; ver sobredotación en Sensibilidades)", FMT_PCT,
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
    S.p("RedFact", "Factor de talleres de la red (sensibilidad)", 1, "×", "S", "Sensibilidades", FMT_DEC1,
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
    S.p("CorfoFlag", "Subsidio CORFO Crea y Valida y crédito tributario Ley 20.241 (1 = sí; solo en Sensibilidades)", 0, "1 / 0", "S",
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
    S.bloque("BLOQUE N. ESCENARIOS (el selector está en el Dashboard) Y SENSIBILIDAD ACTIVA (el selector está en Sensibilidades)")
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
    S.f("EscSel", "Escenario activo (enlace al selector del Dashboard)", "=EscenarioSel", "", "Fórmula", None)
    S.f("FactDem", "Factor de demanda usado", "=INDEX(EscDem,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f("FactPre", "Factor de precio usado", "=INDEX(EscPre,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f("FactCosto", "Factor de costo variable usado", "=INDEX(EscCos,MATCH(EscSel,EscNom,0))", "×", "Fórmula", "0.00")
    S.f(None, "Sensibilidad activa (enlace al selector de Sensibilidades; «Base» para el caso base)", "=SensActiva", "", "Fórmula", None)
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
        c.value = t
        c.hyperlink = Hyperlink(ref=c.coordinate, location=f"{q(H_SUP)}!A{f}", display=t)
        c.font = fuente(9, True, CELESTE8)
        c.alignment = CEN
    ws.freeze_panes = "B8"
    # resuelve las alternativas que dependen de su propia fila (dólar ±10%)
    for row in ws.iter_rows(min_row=8, max_row=S.r, min_col=5, max_col=7):
        for c in row:
            if isinstance(c.value, str) and "{r}" in c.value:
                c.value = c.value.replace("{r}", str(c.row))
    ws.print_title_rows = "1:2"
    return S



def hoja_fase3(L, S):
    ws = L.ws[H_F3]
    hoja_base(ws, 90, visible=False)
    titular(ws, "DATOS FASE 3",
            "Costo directo del kit (punto medio realista y mejor caso, con forward) y tablas de la Fase 3. Solo fórmulas: los datos están en Supuestos detalle, bloque O.")
    S.bloque("BLOQUE O. DATOS DE LA FASE 3 (costeo del kit y tablas de referencia; los lee la hoja Datos Fase 3)")
    for c, w in zip("ABCDEFGH", [62, 15, 15, 17, 13, 13, 16, 58]):
        ws.column_dimensions[c].width = w

    def fila(r, et, vals, fmt=FMT_PESOS, tipo=None, fu="", negrita=False, borde=B_FILA):
        numeros = [v if (isinstance(v, (int, float)) and not isinstance(v, bool)) else None for v in vals]
        rd = S.dato(et, numeros, fmt, tipo or "F", fu) if any(x is not None for x in numeros) else None
        celda(ws, f"A{r}", et, negrita=negrita, alin=IZQ_W, borde=borde)
        for k, v in enumerate(vals):
            if v is None:
                ws.cell(row=r, column=2 + k).border = borde
                continue
            if numeros[k] is not None:
                v = f"={q(H_SUP)}!${col(2 + k)}${rd}"   # enlace al dato de Supuestos detalle
            celda(ws, f"{col(2 + k)}{r}", v, fmt, negrita=negrita, borde=borde)
        for k in range(2 + len(vals), 8):
            ws.cell(row=r, column=k).border = borde
        celda(ws, f"H{r}", fu, color=GRIS, tam=9, alin=IZQ_W, borde=borde)

    r = 6
    bloque(ws, r, "1. COSTO DIRECTO DEL KIT · COSTEO REALISTA DE LA FASE 3, ACTUALIZADO AL DÓLAR BASE")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla (Plus según Supuestos)", "", "", "", "Fuente y fecha"])
    S.enc_datos(["Costeo realista de la Fase 3", "Esencial", "Plus", "Mezcla"])
    fila(8, "Costo directo de la Fase 3 al dólar de $965,71", [2991086, 3350171], tipo="F", fu="Informe Fase 3, Anexo 9 (costeo realista)")
    fila(9, "Dólar del costeo de la Fase 3", [965.71], FMT_DEC2, "F", "Informe Fase 3, Anexo 9")
    fila(10, "Alza del costo por cada $10 de alza del dólar", [25168, 28886], tipo="F", fu="Informe Fase 3 (coeficiente de sensibilidad)")
    fila(11, "Costo al dólar base, sin forward", ["=B8+(Dolar_base-$B$9)/10*B10", "=C8+(Dolar_base-$B$9)/10*C10", "=(1-Mix_base)*B11+Mix_base*C11"],
         fu="Fórmula")
    fila(12, "Valor esperado según las instrucciones (v3)", [3031028, 3396013, 3250019], tipo="F", fu="Instrucciones del equipo (Fase 4, v3)")
    celda(ws, "A13", "(control: hoja Controles)", tam=9, color=GRIS, cursiva=True)
    L.control("Datos Fase 3: costo realista contra el valor esperado", H_F3,
              f"=SUMPRODUCT(ABS(ROUND({q(H_F3)}!B11:D11-{q(H_F3)}!B12:D12,0)))")
    fila(14, "Porción del costo en dólares", [0.82], FMT_PCT, "F", "Informe Fase 3")
    fila(15, "Factor forward = 1 + % en US$ × diferencial × plazo / 12", ["=1+B14*FwdDif*FwdPlazo/12"], "0.000000", fu="Fórmula (Supuestos, bloque B)")
    fila(16, "Costo realista al dólar usado, con forward", ["=(B8+(Dolar-$B$9)/10*B10)*$B$15", "=(C8+(Dolar-$B$9)/10*C10)*$B$15",
                                                         "=(1-Mix)*B16+Mix*C16"], fu="Fórmula")

    r = 18
    bloque(ws, r, "2. COSTO DIRECTO DEL KIT · MEJOR CASO (precios del libro de costos de la Fase 4)")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla", "", "", "", "Fuente y fecha"])
    S.enc_datos(["Mejor caso (libro de costos de la Fase 4)", "Esencial", "Plus"])
    fila(20, "Componente en dólares (US$ por kit)", [2314.15, 2605.77], FMT_DEC2, "F", "Libro de costos Fase 4, precios del 07-11-2026")
    fila(21, "Componente en euros (€ por kit)", [171.9, 171.9], FMT_DEC2, "F", "Libro de costos Fase 4, precios del 07-11-2026")
    fila(22, "Componente en pesos ($ por kit)", [188748, 188748], tipo="F", fu="Libro de costos Fase 4, precios del 07-11-2026")
    fila(23, "Costo al dólar base, sin forward", ["=B20*Dolar_base+B21*EUR_CLP+B22", "=C20*Dolar_base+C21*EUR_CLP+C22",
                                                  "=(1-Mix_base)*B23+Mix_base*C23"], fu="Fórmula")
    fila(24, "Valor de referencia (v3)", [2649042, 2935293], tipo="F", fu="Instrucciones del equipo (Fase 4, v3)")
    celda(ws, "A25", "(control: hoja Controles)", tam=9, color=GRIS, cursiva=True)
    L.control("Datos Fase 3: mejor caso contra el valor de referencia", H_F3,
              f"=SUMPRODUCT(ABS(ROUND(({q(H_F3)}!B23:C23-{q(H_F3)}!B24:C24)/1000,0)))")
    fila(26, "Mejor caso al dólar usado, con forward en la parte en dólares",
         ["=B20*Dolar*(1+FwdDif*FwdPlazo/12)+B21*EUR_CLP+B22", "=C20*Dolar*(1+FwdDif*FwdPlazo/12)+C21*EUR_CLP+C22",
          "=(1-Mix)*B26+Mix*C26"], fu="Fórmula")

    r = 28
    bloque(ws, r, "3. COSTO DEL KIT DEL CASO BASE v4 · PUNTO MEDIO (decisión del equipo, 08-11-2026)")
    encabezado(ws, r + 1, ["Concepto", "Esencial", "Plus", "Mezcla", "", "", "", "Fuente y fecha"])
    fila(30, "Peso del costeo realista en el costo del kit (50% = punto medio)", ["=PesoReal"], FMT_PCT,
         fu="Supuestos clave; alternativas en Supuestos detalle: 100% realista (v3) y 0% mejor caso")
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

    celda(ws, "A40", "5. El peso del costeo realista y sus alternativas están en Supuestos clave y Supuestos detalle (bloque E).",
          tam=9, color=GRIS, cursiva=True)

    r = 44
    bloque(ws, r, "6. TABLA 18 DE LA FASE 3 · EQUIPAMIENTO (referencia enlazada al bloque K)")
    encabezado(ws, r + 1, ["Partida", "Fase 3", "Modelo (Supuestos)", "Diferencia", "", "", "", "Fuente y fecha"])
    S.enc_datos(["Tabla 18 de la Fase 3 (equipamiento)", "Fase 3"])
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
    S.enc_datos(["Tabla 19 de la Fase 3 (gastos de operación)", "Fase 3"])
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
    encabezado(ws, r + 1, ["Partida", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "", "Fuente y fecha"])
    S.enc_datos(["Tabla 11 de la Fase 3 (marketing)", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"])
    r += 2
    t11 = [("Lanzamiento y demostraciones", [3000000, 0, 0, 0, 0], "MkLanz"),
           ("Pauta digital", [14400000, 18000000, 24000000, 24000000, 30000000], "MkPauta"),
           ("Casos con ahorro medido", [2400000, 4800000, 4800000, 4800000, 4800000], "MkCasos"),
           ("Material para mecánicos y paraderos", [3000000, 2000000, 3500000, 2000000, 3500000], "MkMat"),
           ("Convenios con líneas de colectivos", [0, 0, 4000000, 4000000, 4000000], "MkConv")]
    terminos = []
    for et, v, nom in t11:
        fila(r, et, v, tipo="F", fu="Fase 3, Tabla 11")
        terminos.append(f"ABS(SUM({nom})-SUM({q(H_F3)}!B{r}:F{r}))")
        r += 1
    L.control("Datos Fase 3: marketing del modelo contra la Tabla 11", H_F3, "=ROUND(" + "+".join(terminos) + ",0)")
    fila(r, "Marketing a talleres (red): la Fase 3 tenía $5 M al año desde el año 2; v4: $10 M al abrir la red y $5 M después",
         [0, 5000000, 5000000, 5000000, 5000000], tipo="F", fu="Fase 3, Tabla 11 (cambia: supuesto del equipo)")
    r += 2
    bloque(ws, r, "9. TABLA 16 DE LA FASE 3 · NÓMINA ANUAL (solo control en la hoja 2)")
    encabezado(ws, r + 1, ["Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "", "Fuente y fecha"])
    S.enc_datos(["Tabla 16 de la Fase 3 (nómina)", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"])
    r += 2
    fila(r, "Nómina anual, costo empresa (incluye bonos)", [151983675, 266509276, 432098841, 575703633, 760679112], tipo="F",
         fu="Informe Fase 3, Tabla 16")
    L.nombre("Tabla16", H_F3, f"$B${r}:$F${r}")
    r += 2
    bloque(ws, r, "10. TABLAS 10 Y 20 DE LA FASE 3 · NO COMPARABLE: la Fase 3 vendía kits a la red y usaba Bass de EE.UU.")
    encabezado(ws, r + 1, ["Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "", "Fuente y fecha"])
    S.enc_datos(["Tablas 10 y 20 de la Fase 3 (no comparables)", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"])
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
    S.enc_datos(["Tabla 7 de la Fase 3", "Valor"])
    r += 1
    fila(r, "Suscripción Habilita de la Fase 3 ($ al mes por técnico)", [35000], tipo=None,
         fu="Fase 3, Tabla 7. Reemplazada por el bloque H ($45.000); corregir en la Fase 5")
    for k in range(1, 9):
        ws.cell(row=r, column=k).fill = F_GRIS
        ws.cell(row=r, column=k).font = fuente(9, False, GRIS)
    ws.freeze_panes = "B6"


