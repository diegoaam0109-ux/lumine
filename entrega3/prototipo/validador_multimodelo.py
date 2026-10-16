"""Califica con los 9 criterios las respuestas de otros modelos (ChatGPT, Gemini, DeepSeek, Grok)
al prompt RAFA v3.1. Guardar cada respuesta en pruebas/otros_modelos/<modelo>/<caso>.txt
(N1.txt ... C4.txt) y ejecutar: python validador_multimodelo.py"""
import glob, os, pandas as pd
from validador import evaluar
AQUI = os.path.dirname(os.path.abspath(__file__))
filas = []
for f in sorted(glob.glob(os.path.join(AQUI, "pruebas", "otros_modelos", "*", "*.txt"))):
    modelo, caso = f.split(os.sep)[-2], os.path.basename(f)[:-4]
    r = evaluar("v3.1", caso, open(f, encoding="utf-8").read())
    filas.append({"modelo": modelo, "caso": caso, "aprobado": r["aprobado"], "fallos": r["fallos"]})
if not filas:
    print("No hay respuestas en pruebas/otros_modelos/<modelo>/<caso>.txt")
else:
    d = pd.DataFrame(filas); d.to_csv(os.path.join(AQUI, "resultados", "multimodelo.csv"), index=False)
    print(d.groupby("modelo").aprobado.agg(["sum", "size"]).rename(columns={"sum": "aprobados", "size": "casos"}))
    print(d[~d.aprobado].to_string(index=False))
