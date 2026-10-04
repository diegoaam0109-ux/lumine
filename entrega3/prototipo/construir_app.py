"""Arma app/index.html: incrusta el modelo, tres registros de ejemplo, las salidas
generadas v3.1 aprobadas y el logo. También guarda un CSV de ejemplo para probar la carga."""
import base64, json, os, sys
import numpy as np, pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI); sys.path.insert(0, os.path.join(AQUI, "pruebas"))
from dataset import conductores_sinteticos
from salidas import V31

modelo = json.load(open(os.path.join(AQUI, "app", "modelo.json")))
for m in (modelo["nivel1"], modelo["nivel2"]):
    for a in m["arboles"]:
        a["t"] = [round(x, 5) for x in a["t"]]; a["v"] = [round(x, 5) for x in a["v"]]
t = pd.read_csv(os.path.join(AQUI, "resultados", "conductores.csv"))
p = pd.read_csv(os.path.join(AQUI, "resultados", "predicciones_test.csv"))
def mediano(perfil):
    g = p[p.perfil == perfil].copy(); g["d"] = (g.y - g.y.median()).abs(); return g.sort_values("d").conductor.iloc[0]
ids = {"colectivo": mediano("colectivo"), "aplicacion": mediano("aplicacion"), "particular": mediano("particular")}
meta, trazas, _ = conductores_sinteticos()
muestras = []
desc = {"colectivo": "Colectivo · ruta urbana con paradas de pasajeros", "aplicacion": "Conductor de aplicación · ciudad y algo de autopista",
        "particular": "Particular · traslados diarios con autopista"}
nombre = {"colectivo": "Registro de colectivo", "aplicacion": "Registro de aplicación", "particular": "Registro de particular"}
for perfil, cid in ids.items():
    r = t[t.conductor == cid].iloc[0]
    jid = meta[(meta.conductor == cid) & (meta.semana == 1)].jornada.iloc[0]
    v = trazas[jid][0][:3600] * 3.6
    muestras.append({"perfil": perfil, "nombre": nombre[perfil], "desc": f"{desc[perfil]} · {r.km_dia:.0f} km/día",
                     "vars": {k: float(r[k]) for k in modelo["nivel2"]["vars"]}, "traza": [round(float(x), 1) for x in v],
                     "conductor": cid})
casos = {c["id"]: c for c in json.load(open(os.path.join(AQUI, "pruebas", "casos.json")))}
generadas = []
for cid, txt in V31.items():
    s = casos[cid]["salida_estimador"]
    if casos[cid].get("nota_cliente"):
        continue  # las respuestas a notas no se muestran sin la nota
    generadas.append({"id": cid, "estado": s["estado"], "cifras": s.get("cifras_formateadas"),
                      "mensaje": json.loads(txt)["mensaje_cliente"]})
comp = pd.read_csv(os.path.join(AQUI, "resultados", "comparacion_modelos.csv"), index_col=0)
nombres = {"M0 Cifra genérica TIG (25%)": "Cifra genérica 25%", "M0b Cifra ICCT eje trasero (15,5%)": "Cifra ICCT 15,5%",
           "M2 Nivel 2 lineal, 2 variables (Entrega 2)": "Lineal de la Entrega 2", "M0c Promedio por perfil": "Promedio por perfil",
           "M1 Nivel 1 cotización (GBM, declarados)": "Cotización (nivel 1)", "M3 Nivel 2 diagnóstico (GBM, registro GPS)": "Diagnóstico (nivel 2)"}
errores = [{"nombre": v, "mae": round(float(comp.loc[k, "MAE"]), 2), "sel": k.startswith("M3") or k.startswith("M1")} for k, v in nombres.items()]
perfiles = []
for p, n in [("colectivo", "Colectivo"), ("aplicacion", "Aplicación"), ("particular", "Particular")]:
    g = t[t.perfil == p]
    q = lambda c: [round(float(g[c].quantile(x)), 1) for x in (0.1, 0.5, 0.9)]
    perfiles.append({"nombre": n, "ref": q("y_base"), "opt": q("y_optimista")})
masks = json.load(open(os.path.join(AQUI, "app", "logo_masks.json")))
datos = {"modelo": modelo, "muestras": muestras, "generadas": generadas, "errores": errores, "perfiles": perfiles}
html = open(os.path.join(AQUI, "app", "plantilla.html"), encoding="utf-8").read()
html = html.replace("/*__DATA__*/", json.dumps(datos, ensure_ascii=False, separators=(",", ":")))
html = (html.replace("__EMBLEM__", masks["logo-emblem"]).replace("__WMACC__", masks["logo-wm-acc"])
        .replace("__WM__", masks["logo-wm"]).replace("__RATIO__", masks["ratio"]))
open(os.path.join(AQUI, "app", "index.html"), "w", encoding="utf-8").write(html)
# CSV de ejemplo: tres jornadas del registro del conductor de aplicación
filas = []
for d, jid in enumerate(meta[(meta.conductor == ids["aplicacion"]) & (meta.semana == 1)].jornada.iloc[:3], 1):
    v, pe = trazas[jid]
    filas.append(pd.DataFrame({"dia": d, "velocidad_kmh": np.round(v * 3.6, 1), "pendiente_pct": np.round(pe * 100, 2)}))
pd.concat(filas).to_csv(os.path.join(AQUI, "app", "registro_ejemplo.csv"), index=False)
json.dump({m["perfil"]: m["vars"] for m in muestras}, open(os.path.join(AQUI, "resultados", "muestras_app.json"), "w"))
print("index.html", round(os.path.getsize(os.path.join(AQUI, "app", "index.html")) / 1024), "KB;", ids)
