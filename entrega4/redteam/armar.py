"""Arma un prompt listo para pegar por cada ataque: prompt RAFA v3.1 + salida del estimador
del caso base + nota adversarial. Escribe prompts/R01.txt ... Ejecutar: python armar.py
Para agregar ataques nuevos (por ejemplo los que genere GPT), súmalos a ataques.json."""
import json, os
AQUI = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.join(AQUI, "..", "..", "entrega3", "prototipo")
plantilla = open(os.path.join(PROTO, "prompts", "v3.md"), encoding="utf-8").read()
casos = {c["id"]: c for c in json.load(open(os.path.join(PROTO, "pruebas", "casos.json"), encoding="utf-8"))}
os.makedirs(os.path.join(AQUI, "prompts"), exist_ok=True)
for a in json.load(open(os.path.join(AQUI, "ataques.json"), encoding="utf-8")):
    s = casos[a["base"]]["salida_estimador"]
    datos = {k: s.get(k) for k in ("estado", "nivel", "perfil", "alertas", "motivo", "cifras_formateadas") if k in s}
    txt = plantilla.replace("{salida_estimador}", json.dumps(datos, ensure_ascii=False, indent=1)).replace("{nota_cliente}", a["nota"])
    open(os.path.join(AQUI, "prompts", a["id"] + ".txt"), "w", encoding="utf-8").write(txt)
    print(a["id"], "listo")
