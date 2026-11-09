"""Genera el Plan Financiero de punta a punta y lo verifica con LibreOffice (v5: presentación simplificada, mismos números).

Uso:  python generar.py [--sin-foto] [--salida NOMBRE.xlsx]
Requiere: Python con openpyxl; LibreOffice (su Python trae UNO). Funciona en Windows y Linux.

Pasos:
 1. construir.py arma las 19 hojas azules (12 visibles y 7 técnicas ocultas; fórmulas vivas, sin valores a mano).
 2. injertar.py las pone en el paquete de la v3: las 12 hojas grises quedan idénticas byte a byte.
 3. LibreOffice recorre cada caso de sensibilidad y los escenarios → foto_sensibilidades.json (valores).
 4. Se reconstruye con la foto y se verifica: sin errores, controles en 0, unidades enteras, foto vigente.
 5. Se dejan en caché los valores calculados (el libro muestra números aunque se abra en vista protegida).
 6. Regla de oro de la v5: todo resultado debe ser idéntico al de la v4 (resultados_v4.json, la foto anterior y espejo.py).
 7. PDF solo de las hojas visibles.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from datetime import date

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", "..", ".."))
EXCEL = os.path.join(AQUI, "..", "excel")
V3 = os.path.join(EXCEL, "v3_TIR6_actual.xlsx")
PERFIL = os.path.join(RAIZ, "fase-3", "generador", "lo_es")
LO_PY = os.environ.get("LO_PYTHON") or (r"C:\Program Files\LibreOffice\program\python.exe" if os.name == "nt" else "python3")
REFERENCIA = os.path.join(AQUI, "resultados_v4.json")   # números de la v4: la v5 no puede moverlos
TOL = 1e-6                                              # pesos (y fracciones en las tasas): «iguales al peso»

sys.path.insert(0, AQUI)
import construir  # noqa: E402
import injertar  # noqa: E402


def lo(modo, libro, man, salida, caso=None):
    env = dict(os.environ)
    if caso:
        env["CASO"] = caso
    r = subprocess.run([LO_PY, os.path.join(AQUI, "lo_calcular.py"), modo, libro, man, salida, PERFIL], env=env,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:])
        raise SystemExit(f"LibreOffice falló en el modo {modo}")
    return r.stdout


def revisar(rev):
    R = json.load(open(rev, encoding="utf-8"))
    problemas = []
    if R["errores"]:
        problemas.append(f"celdas con error: {R['errores']}")
    malos = [c for c in R["controles"] if c["max_abs"] > 0.5]
    if malos:
        problemas.append(f"controles distintos de 0: {[(c['desc'], c['max_abs']) for c in malos]}")
    ent = [e for e in R["enteros"] if e["no_enteros"]]
    if ent:
        problemas.append(f"unidades no enteras: {[(e['desc'], e['ejemplo']) for e in ent]}")
    return R, problemas


def _dif(a, b):
    """Diferencia máxima entre dos valores o listas (inf si no son comparables)."""
    if isinstance(a, list) and isinstance(b, list):
        return max([_dif(x, y) for x, y in zip(a, b)] or [0]) if len(a) == len(b) else float("inf")
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b)
    return 0.0 if a == b else float("inf")


def comparar_v4(R):
    """Resultados, detalle anual y controles contra la v4. Devuelve la lista de diferencias (vacía = mismos números)."""
    ref = json.load(open(REFERENCIA, encoding="utf-8"))
    malas = [(k, _dif(R["resultados"].get(k), v)) for k, v in ref["resultados"].items()]
    malas += [(f"anual.{k}", _dif(R["anual"].get(k), v)) for k, v in ref["anual"].items()]
    malas = [(k, d) for k, d in malas if d > TOL]
    if len(R["controles"]) != len(ref["controles"]):
        malas.append(("número de controles", f"{len(R['controles'])} contra {len(ref['controles'])}"))
    return malas


def comparar_foto(nueva, vieja):
    """Cada caso de sensibilidad y cada escenario de la foto nueva contra la foto de la v4."""
    if not vieja:
        return []
    malas = []
    v_casos = {c["codigo"]: c for c in vieja["casos"]}
    if [c["codigo"] for c in nueva["casos"]] != [c["codigo"] for c in vieja["casos"]]:
        malas.append(("lista de casos", "distinta"))
    for c in nueva["casos"]:
        v = v_casos.get(c["codigo"])
        for k in ("van", "tir", "pb", "inv0", "ct1", "pe1", "van_ke", "tir_inv"):
            d = _dif(c[k], v[k]) if v else float("inf")
            if d > TOL:
                malas.append((f"{c['codigo']}.{k}", d))
    for e, v in zip(nueva["escenarios"], vieja["escenarios"]):
        for k in ("van", "tir", "pb"):
            if _dif(e[k], v[k]) > TOL:
                malas.append((f"escenario {e['nombre']}.{k}", _dif(e[k], v[k])))
    return malas


def comparar_espejo(r):
    """El modelo espejo (Python puro, sin tocar) contra el libro: VAN, TIR, flujo, inversión y capital de trabajo."""
    import espejo
    import copy
    P = copy.deepcopy(espejo.BASE)
    E = espejo.evaluar(P, espejo.run(P))
    pares = [("VAN_Ku", r["VAN_Ku"], E["van_ku"]), ("VAN_WACC", r["VAN_WACC"], E["van_wacc"]), ("TIR_Puro", r["TIR_Puro"], E["tir"]),
             ("Inv0Cap", r["Inv0Cap"], E["inv0_cap"]), ("VD", r["VD"], E["vd"]), ("Ku", r["Ku"], E["ku"]), ("Ke", r["Ke"], E["ke"]),
             ("WACC", r["WACC"], E["wacc"])]
    pares += [(f"FC_Puro[{t}]", r["FC_Puro"][t], E["flujo"][t]) for t in range(6)]
    pares += [(f"CT_Req[{t}]", r["CT_Req"][t], E["req"][t]) for t in range(6)]
    pares += [(f"H2_EBITDA[{t}]", r["H2_EBITDA"][t - 1], E["ebitda"][t]) for t in range(1, 6)]
    tol = {"TIR_Puro": 1e-7}   # la TIR del espejo sale por bisección
    return [(k, abs(a - b)) for k, a, b in pares if abs(a - b) > tol.get(k, 0.5)], len(pares)


def main():
    sin_foto = "--sin-foto" in sys.argv
    nombre = sys.argv[sys.argv.index("--salida") + 1] if "--salida" in sys.argv else None
    tmp = tempfile.mkdtemp(prefix="lumine_v5_")
    man = os.path.join(tmp, "manifiesto.json")
    foto_ruta = os.path.join(AQUI, "foto_sensibilidades.json")
    foto_vieja = json.load(open(foto_ruta, encoding="utf-8")) if os.path.exists(foto_ruta) else None
    try:
        # 1-2 sin foto para tomar la foto nueva
        az0 = os.path.join(tmp, "azules0.xlsx")
        construir.construir(az0, None, manifiesto=man)
        v0 = os.path.join(tmp, "v5_0.xlsx")
        injertar.injertar(V3, az0, v0)
        R0, prob = revisar_lo(v0, man, tmp, "rev0")
        if prob:
            raise SystemExit("La versión sin foto tiene problemas: " + "; ".join(prob))
        if not sin_foto:
            print("· foto de sensibilidades (LibreOffice)...")
            print(lo("foto", v0, man, foto_ruta))
        foto = json.load(open(foto_ruta, encoding="utf-8")) if os.path.exists(foto_ruta) else None
        dif_foto = comparar_foto(foto, foto_vieja) if (foto and not sin_foto) else []
        if dif_foto:
            raise SystemExit(f"La foto nueva no calza con la anterior (un número se movió): {dif_foto[:10]}")
        # 4 reconstruye con la foto y verifica
        az1 = os.path.join(tmp, "azules1.xlsx")
        construir.construir(az1, foto, manifiesto=man)
        v1 = os.path.join(tmp, "v5_1.xlsx")
        injertar.injertar(V3, az1, v1)
        R1, prob = revisar_lo(v1, man, tmp, "rev1")
        if prob:
            raise SystemExit("La versión con foto tiene problemas: " + "; ".join(prob))
        estado = R1["resultados"]["Anx_Estado"]
        if foto and not str(estado).startswith("OK"):
            raise SystemExit(f"La foto no calza con el modelo en vivo: {estado}")
        # 5 valores en caché
        vals = os.path.join(tmp, "valores.json")
        lo("valores", v1, man, vals)
        r = R1["resultados"]
        tir = r["TIR_Puro"]
        if not nombre:
            nombre = f"v5_presentacion_{date.today():%d-%m-%Y}.xlsx"
        final = os.path.join(EXCEL, nombre)
        info = injertar.injertar(V3, az1, final, json.load(open(vals, encoding="utf-8")))
        R2, prob = revisar_lo(final, man, tmp, "rev_final")
        if prob:
            raise SystemExit("El archivo final tiene problemas: " + "; ".join(prob))
        # 6 mismos números que la v4
        dif = comparar_v4(R2)
        if dif:
            raise SystemExit(f"Un número se movió respecto de la v4 (se debe revertir): {dif[:10]}")
        dif_e, n_e = comparar_espejo(R2["resultados"])
        if dif_e:
            raise SystemExit(f"El libro no calza con espejo.py: {dif_e}")
        json.dump(dict(resultados=R2["resultados"], anual=R2["anual"], controles=R2["controles"]),
                  open(os.path.join(AQUI, "resultados_v5.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=str)
        # 7 PDF
        pdf = final[:-5] + ".pdf"
        lo("pdf", final, man, pdf)
        print(f"listo: {final}")
        print(f"      {pdf}")
        print(f"      TIR {tir:.2%} · VAN {r['VAN_Ku'] / 1e6:,.1f} M · inversión año 0 {r['Inv0_Total'] / 1e6:,.1f} M · "
              f"controles {r['Ctrl_OK']:.0f} de {r['Ctrl_N']:.0f} en 0 · hojas grises intactas: {len(info['grises'])}")
        n_ref = len(json.load(open(REFERENCIA, encoding="utf-8"))["resultados"])
        print(f"      igual a la v4: {n_ref} resultados y {len(R2['anual'])} filas anuales"
              + (f", {len(foto['casos'])} casos y {len(foto['escenarios'])} escenarios de la foto" if foto and not sin_foto else "")
              + f"; espejo.py: {n_e} cifras al peso")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def revisar_lo(libro, man, tmp, etiqueta):
    rev = os.path.join(tmp, etiqueta + ".json")
    lo("revisar", libro, man, rev)
    return revisar(rev)


if __name__ == "__main__":
    main()
