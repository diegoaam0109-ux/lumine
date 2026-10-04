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
logo = base64.b64encode(open("/home/user/lumine/entrega3/figuras/logo_lumine.png", "rb").read()).decode()
datos = {"modelo": modelo, "muestras": muestras, "generadas": generadas}
html = open(os.path.join(AQUI, "app", "plantilla.html"), encoding="utf-8").read()
html = html.replace("/*__DATA__*/", json.dumps(datos, ensure_ascii=False, separators=(",", ":")))
html = html.replace("__LOGO__", "data:image/png;base64," + logo)
open(os.path.join(AQUI, "app", "index.html"), "w", encoding="utf-8").write(html)
# CSV de ejemplo: tres jornadas del registro del conductor de aplicación
filas = []
for d, jid in enumerate(meta[(meta.conductor == ids["aplicacion"]) & (meta.semana == 1)].jornada.iloc[:3], 1):
    v, pe = trazas[jid]
    filas.append(pd.DataFrame({"dia": d, "velocidad_kmh": np.round(v * 3.6, 1), "pendiente_pct": np.round(pe * 100, 2)}))
pd.concat(filas).to_csv(os.path.join(AQUI, "app", "registro_ejemplo.csv"), index=False)
json.dump({m["perfil"]: m["vars"] for m in muestras}, open(os.path.join(AQUI, "resultados", "muestras_app.json"), "w"))
print("index.html", round(os.path.getsize(os.path.join(AQUI, "app", "index.html")) / 1024), "KB;", ids)
