"""Genera el Plan Financiero v4 de punta a punta y lo verifica con LibreOffice.

Uso:  python generar.py [--sin-foto] [--salida NOMBRE.xlsx]
Requiere: Python con openpyxl; LibreOffice (su Python trae UNO). Funciona en Windows y Linux.

Pasos:
 1. construir.py arma las 15 hojas azules (fórmulas vivas, sin valores a mano en las hojas de cálculo).
 2. injertar.py las pone en el paquete de la v3: las 12 hojas grises quedan idénticas byte a byte.
 3. LibreOffice recorre cada caso de sensibilidad y los escenarios → foto.json (valores).
 4. Se reconstruye con la foto y se verifica: sin errores, controles en 0, unidades enteras, foto vigente.
 5. Se dejan en caché los valores calculados (el libro muestra números aunque se abra en vista protegida).
 6. PDF de las hojas azules (sin Mensual) para revisar sin abrir Excel.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", "..", ".."))
EXCEL = os.path.join(AQUI, "..", "excel")
V3 = os.path.join(EXCEL, "v3_TIR6_actual.xlsx")
PERFIL = os.path.join(RAIZ, "fase-3", "generador", "lo_es")
LO_PY = os.environ.get("LO_PYTHON") or (r"C:\Program Files\LibreOffice\program\python.exe" if os.name == "nt" else "python3")

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


def main():
    sin_foto = "--sin-foto" in sys.argv
    nombre = sys.argv[sys.argv.index("--salida") + 1] if "--salida" in sys.argv else None
    tmp = tempfile.mkdtemp(prefix="lumine_v4_")
    man = os.path.join(tmp, "manifiesto.json")
    foto_ruta = os.path.join(AQUI, "foto_sensibilidades.json")
    try:
        # 1-2 sin foto (o con la foto anterior) para tomar la foto nueva
        az0 = os.path.join(tmp, "azules0.xlsx")
        construir.construir(az0, None, manifiesto=man)
        v0 = os.path.join(tmp, "v4_0.xlsx")
        injertar.injertar(V3, az0, v0)
        R0, prob = revisar_lo(v0, man, tmp, "rev0")
        if prob:
            raise SystemExit("La versión sin foto tiene problemas: " + "; ".join(prob))
        if not sin_foto:
            print("· foto de sensibilidades (LibreOffice)...")
            print(lo("foto", v0, man, foto_ruta))
        foto = json.load(open(foto_ruta, encoding="utf-8")) if os.path.exists(foto_ruta) else None
        # 4 reconstruye con la foto y verifica
        az1 = os.path.join(tmp, "azules1.xlsx")
        construir.construir(az1, foto, manifiesto=man)
        v1 = os.path.join(tmp, "v4_1.xlsx")
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
            nombre = f"v4_TIR{round(tir * 100):d}_kit_medio_credito30.xlsx"
        final = os.path.join(EXCEL, nombre)
        info = injertar.injertar(V3, az1, final, json.load(open(vals, encoding="utf-8")))
        R2, prob = revisar_lo(final, man, tmp, "rev_final")
        if prob:
            raise SystemExit("El archivo final tiene problemas: " + "; ".join(prob))
        json.dump(dict(resultados=R2["resultados"], anual=R2["anual"], controles=R2["controles"]),
                  open(os.path.join(AQUI, "resultados_v4.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=str)
        # 6 PDF
        pdf = final[:-5] + ".pdf"
        lo("pdf", final, man, pdf)
        print(f"listo: {final}")
        print(f"      {pdf}")
        print(f"      TIR {tir:.2%} · VAN {r['VAN_Ku'] / 1e6:,.1f} M · inversión año 0 {r['Inv0_Total'] / 1e6:,.1f} M · "
              f"hojas grises intactas: {len(info['grises'])}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def revisar_lo(libro, man, tmp, etiqueta):
    rev = os.path.join(tmp, etiqueta + ".json")
    lo("revisar", libro, man, rev)
    return revisar(rev)


if __name__ == "__main__":
    main()
