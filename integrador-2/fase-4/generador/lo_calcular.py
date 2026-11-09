"""Recalcula el Plan Financiero con LibreOffice (UNO) y toma la foto de sensibilidades.

Se ejecuta con el Python de LibreOffice:
  "C:/Program Files/LibreOffice/program/python.exe" lo_calcular.py MODO LIBRO.xlsx MANIFIESTO.json SALIDA [PERFIL]
Modos:
  revisar  → recalcula el caso base y escribe SALIDA.json con errores, controles, enteros, resultados y el detalle anual.
  foto     → recorre todos los casos de Sensibilidades y los escenarios del Dashboard; escribe SALIDA.json (foto de valores).
  valores  → escribe SALIDA.json con el valor de cada celda con fórmula de las hojas azules (para dejarlo en caché).
  pdf      → exporta SALIDA.pdf solo con las hojas visibles (manifiesto["visibles"]).
PERFIL es una carpeta con un perfil de LibreOffice en es-CL (se copia; nunca se usa directo).
Los nombres de las hojas técnicas y las celdas de los selectores vienen del manifiesto que escribe construir.py.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime

import uno
from com.sun.star.beans import PropertyValue

SOFFICE = os.environ.get("SOFFICE", r"C:\Program Files\LibreOffice\program\soffice.exe")


def pv(nombre, valor):
    p = PropertyValue()
    p.Name, p.Value = nombre, valor
    return p


def url(ruta):
    return uno.systemPathToFileUrl(os.path.abspath(ruta))


class Sesion:
    def __init__(self, perfil_base=None):
        self.tmp = tempfile.mkdtemp(prefix="lo_lumine_")
        perfil = os.path.join(self.tmp, "perfil")
        if perfil_base and os.path.isdir(perfil_base):
            shutil.copytree(perfil_base, perfil)
        else:
            os.makedirs(perfil)
        self._recalc_siempre(perfil)
        self.pipe = f"lumine{os.getpid()}"
        self.proc = subprocess.Popen([SOFFICE, f"-env:UserInstallation={url(perfil)}", "--headless", "--invisible", "--nologo",
                                      "--norestore", "--nodefault", "--nolockcheck", f"--accept=pipe,name={self.pipe};urp;"])
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
        for _ in range(120):
            try:
                self.ctx = resolver.resolve(f"uno:pipe,name={self.pipe};urp;StarOffice.ComponentContext")
                break
            except Exception:
                time.sleep(0.5)
        else:
            raise RuntimeError("No se pudo conectar con LibreOffice")
        self.desktop = self.ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", self.ctx)

    @staticmethod
    def _recalc_siempre(perfil):
        ruta = os.path.join(perfil, "user", "registrymodifications.xcu")
        os.makedirs(os.path.dirname(ruta), exist_ok=True)
        # recalcular siempre al abrir y sin cálculo en paralelo (resultados deterministas)
        extra = ('<item oor:path="/org.openoffice.Office.Calc/Formula/Load"><prop oor:name="OOXMLRecalcMode" oor:op="fuse">'
                 '<value>0</value></prop></item>\n'
                 '<item oor:path="/org.openoffice.Office.Calc/Formula/Calculation"><prop oor:name="UseThreadedCalculationForFormulaGroups" '
                 'oor:op="fuse"><value>false</value></prop></item>\n'
                 '<item oor:path="/org.openoffice.Office.Common/Misc"><prop oor:name="UseOpenCL" oor:op="fuse"><value>false</value></prop></item>\n')
        if os.path.exists(ruta):
            txt = open(ruta, encoding="utf-8").read()
            if "OOXMLRecalcMode" not in txt:
                txt = txt.replace("</oor:items>", extra + "</oor:items>")
        else:
            txt = ('<?xml version="1.0" encoding="UTF-8"?>\n<oor:items xmlns:oor="http://openoffice.org/2001/registry" '
                   'xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n'
                   + extra + "</oor:items>\n")
        open(ruta, "w", encoding="utf-8").write(txt)

    def abrir(self, ruta):
        doc = self.desktop.loadComponentFromURL(url(ruta), "_blank", 0, (pv("Hidden", True), pv("ReadOnly", True)))
        doc.calculateAll()
        doc.calculateAll()
        return doc

    def cerrar(self):
        try:
            self.desktop.terminate()
        except Exception:
            pass
        try:
            self.proc.wait(timeout=30)
        except Exception:
            self.proc.kill()
        shutil.rmtree(self.tmp, ignore_errors=True)


def version_lo(s):
    try:
        cp = s.ctx.ServiceManager.createInstanceWithContext("com.sun.star.configuration.ConfigurationProvider", s.ctx)
        acc = cp.createInstanceWithArguments("com.sun.star.configuration.ConfigurationAccess",
                                             (pv("nodepath", "/org.openoffice.Setup/Product"),))
        return acc.getByName("ooSetupVersionAboutBox")
    except Exception:
        return ""


def hoja(doc, nombre):
    return doc.Sheets.getByName(nombre)


def rango(doc, nombre_hoja, ref):
    return hoja(doc, nombre_hoja).getCellRangeByName(ref)


def selector(doc, man, cual):
    """Celda del selector de sensibilidad ("sens") o de escenario ("esc"), según el manifiesto."""
    h, ref = man["selectores"][cual]
    return rango(doc, h, ref)


def nombre_valor(doc, nombre):
    nr = doc.NamedRanges.getByName(nombre)
    cells = nr.getReferredCells()
    arr = cells.getDataArray()
    if len(arr) == 1 and len(arr[0]) == 1:
        return arr[0][0]
    return [v for fila in arr for v in fila]


def errores(doc, hojas):
    from com.sun.star.sheet.FormulaResult import ERROR
    out = []
    for h in hojas:
        sh = hoja(doc, h)
        rs = sh.queryFormulaCells(ERROR)
        txt = rs.getRangeAddressesAsString()
        if txt:
            muestra = []
            for parte in txt.split(";")[:8]:
                ref = parte.split(".")[-1].split(":")[0].replace("$", "")
                c = sh.getCellRangeByName(ref)
                muestra.append((ref, c.getError(), c.getFormula()[:120]))
            out.append(dict(hoja=h, rangos=txt[:400], muestra=muestra))
    return out


def resultados(doc):
    out = {}
    for n in ["VAN_Ku", "VAN_WACC", "TIR_Puro", "PB_Desc", "PB_Simple", "Inv0_Total", "Inv0Cap", "VD", "CT_Rec", "CT_Def", "VAN_Ke",
              "TIR_Inv", "VAN_Deuda", "Ku", "Ke", "WACC", "BetaL", "Ctrl_Total", "VAN_SinVD", "CostoCT_VAN", "VD_Eco", "Prestamo",
              "KitE", "KitP", "KitMezcla", "KitP_Real", "TasaCredReal", "FactorCuota", "SensCod", "Anx_Estado", "IR_Ku",
              "Ctrl_OK", "Ctrl_N"]:
        try:
            out[n] = nombre_valor(doc, n)
        except Exception as e:
            out[n] = f"ERROR {e}"
    for n in ["FC_Puro", "CT_Inv", "CT_Req", "Dep", "Amort", "Inv_Act", "H2_Ing", "H2_EBITDA", "H2_CV", "H2_CF", "H2_GAV", "H2_Prop",
              "H2_Fin", "H2_Rec", "H2_RedIng", "PE_Q", "FC_Inv", "IdxP", "H2_Inst"]:
        try:
            out[n] = nombre_valor(doc, n)
        except Exception as e:
            out[n] = f"ERROR {e}"
    return out


def resumen_caso(doc):
    r = {}
    for n in ("VAN_Ku", "TIR_Puro", "PB_Desc", "Inv0_Total", "VAN_Ke", "TIR_Inv"):
        r[n] = nombre_valor(doc, n)
    r["CT1"] = nombre_valor(doc, "CT_Req")[1]
    r["PE1"] = nombre_valor(doc, "PE_Q")[0]
    return r


def modo_revisar(s, libro, man, salida):
    doc = s.abrir(libro)
    caso = os.environ.get("CASO")  # opcional: revisar con un caso de sensibilidad activo
    if caso:
        selector(doc, man, "sens").setString(caso)
        doc.calculateAll()
        doc.calculateAll()
    out = dict(errores=errores(doc, man["hojas"]), resultados=resultados(doc), caso=caso or "Base")
    ctrl = []
    for desc, h, ref in man["controles"]:
        arr = rango(doc, h, ref).getDataArray()
        vals = [v for fila in arr for v in fila if isinstance(v, float)]
        mx = max([abs(v) for v in vals] or [0])
        ctrl.append(dict(desc=desc, hoja=h, ref=ref, max_abs=mx, n=len(vals)))
    out["controles"] = ctrl
    ent = []
    for desc, h, ref in man["enteros"]:
        arr = rango(doc, h, ref).getDataArray()
        malos = [v for fila in arr for v in fila if isinstance(v, float) and abs(v - round(v)) > 1e-9]
        ent.append(dict(desc=desc, hoja=h, ref=ref, no_enteros=len(malos), ejemplo=malos[:3]))
    out["enteros"] = ent
    # anual completo (para comparar con el modelo espejo)
    an = {}
    sh = hoja(doc, man["hoja_anual"])
    for k, r in man["filas_anu"].items():
        an[k] = list(sh.getCellRangeByName(f"C{r}:H{r}").getDataArray()[0])
    out["anual"] = an
    men = {}
    sh = hoja(doc, man["hoja_motor"])
    for k, r in man["filas_men"].items():
        if k.startswith("#"):
            continue
        men[k] = list(sh.getCellRangeByName(f"D{r}:BW{r}").getDataArray()[0])
    out["mensual"] = men
    doc.close(True)
    json.dump(out, open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=str)


def _fmt_valor(v, fmt):
    if v is None or isinstance(v, str):
        return v or ""
    if fmt and "%" in fmt:
        return f"{v * 100:.1f}%".replace(".", ",")
    if abs(v) >= 1000:
        return f"{v:,.0f}".replace(",", ".")
    if float(v).is_integer():
        return f"{v:.0f}"
    return f"{v:.2f}".replace(".", ",")


def modo_foto(s, libro, man, salida):
    doc = s.abrir(libro)
    sel = selector(doc, man, "sens")
    esc = selector(doc, man, "esc")
    casos = []
    for c in man["casos"]:
        sel.setString(c["nombre"])
        doc.calculateAll()
        doc.calculateAll()
        cod = nombre_valor(doc, "SensCod")
        assert cod == c["codigo"], (cod, c["codigo"])
        r = resumen_caso(doc)
        val = ""
        if c.get("valor"):
            ref = c["valor"]
            h, cel = ref.split("!")
            val = _fmt_valor(rango(doc, h.strip("'"), cel.replace("$", "")).getDataArray()[0][0], c.get("fmt"))
        casos.append(dict(nombre=c["nombre"], codigo=c["codigo"], grupo=c["grupo"], valor_txt=val, van=r["VAN_Ku"], tir=r["TIR_Puro"],
                          pb=r["PB_Desc"], inv0=r["Inv0_Total"], ct1=r["CT1"], pe1=r["PE1"], van_ke=r["VAN_Ke"], tir_inv=r["TIR_Inv"]))
        print(f"  {c['codigo']:14s} VAN {r['VAN_Ku'] / 1e6:10,.1f}  TIR {r['TIR_Puro'] if isinstance(r['TIR_Puro'], str) else round(r['TIR_Puro'] * 100, 2)}",
              flush=True)
    sel.setString("Base")
    escenarios = []
    for e in man["escenarios"]:
        esc.setString(e)
        doc.calculateAll()
        doc.calculateAll()
        r = resumen_caso(doc)
        f = [nombre_valor(doc, n) for n in ("FactDem", "FactPre", "FactCosto")]
        escenarios.append(dict(nombre=e, valor_txt=" × ".join(f"{x:.2f}".replace(".", ",") for x in f), van=r["VAN_Ku"],
                               tir=r["TIR_Puro"], pb=r["PB_Desc"]))
    esc.setString("Base")
    doc.calculateAll()
    base = resumen_caso(doc)
    ver = version_lo(s)
    out = dict(fecha=datetime.now().strftime("%d-%m-%Y %H:%M"), motor=ver, base=dict(van=base["VAN_Ku"], tir=base["TIR_Puro"],
               pb=base["PB_Desc"]), casos=casos, escenarios=escenarios)
    doc.close(True)
    json.dump(out, open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def modo_valores(s, libro, man, salida):
    """Valor calculado de cada celda con fórmula de las hojas azules: {hoja: {celda: [tipo, valor]}}."""
    from com.sun.star.sheet.CellFlags import FORMULA
    from com.sun.star.table.CellContentType import FORMULA as T_FORMULA  # noqa
    doc = s.abrir(libro)
    out = {}
    for h in man["hojas"]:
        sh = hoja(doc, h)
        celdas = {}
        rs = sh.queryContentCells(FORMULA)
        for direccion in rs.getRangeAddresses():
            rg = sh.getCellRangeByPosition(direccion.StartColumn, direccion.StartRow, direccion.EndColumn, direccion.EndRow)
            datos = rg.getDataArray()
            for i, fila in enumerate(datos):
                for j, v in enumerate(fila):
                    c = rg.getCellByPosition(j, i)
                    nombre = c.AbsoluteName.split(".")[-1].replace("$", "")
                    err = c.getError()
                    if err:
                        celdas[nombre] = ["e", "#N/A"]
                    elif isinstance(v, str):
                        celdas[nombre] = ["s", v]
                    else:
                        celdas[nombre] = ["n", v]
        out[h] = celdas
    doc.close(True)
    json.dump(out, open(salida, "w", encoding="utf-8"), ensure_ascii=False)


def modo_pdf(s, libro, man, salida):
    """PDF solo de las hojas visibles: se copia el libro a una carpeta temporal y se ocultan las demás."""
    copia = os.path.join(s.tmp, "para_pdf.xlsx")
    shutil.copy(libro, copia)
    doc = s.desktop.loadComponentFromURL(url(copia), "_blank", 0, (pv("Hidden", True),))
    try:
        doc.calculateAll()
        doc.calculateAll()
        quedan = man["visibles"]
        for nombre in list(doc.Sheets.ElementNames):
            if nombre not in quedan:
                doc.Sheets.getByName(nombre).IsVisible = False  # ocultar (borrar rompería las referencias)
        fd = uno.Any("[]com.sun.star.beans.PropertyValue", (pv("ExportBookmarks", True), pv("ExportNotes", False)))
        p = PropertyValue()
        p.Name, p.Value = "FilterData", fd
        uno.invoke(doc, "storeToURL", (url(salida), (pv("FilterName", "calc_pdf_Export"), p)))
    finally:
        doc.close(True)


def main():
    modo, libro, manif, salida = sys.argv[1:5]
    perfil = sys.argv[5] if len(sys.argv) > 5 else None
    man = json.load(open(manif, encoding="utf-8"))
    s = Sesion(perfil)
    try:
        {"revisar": modo_revisar, "foto": modo_foto, "valores": modo_valores, "pdf": modo_pdf}[modo](s, libro, man, salida)
    finally:
        s.cerrar()
    print("ok", modo, salida)


if __name__ == "__main__":
    main()
