"""
Validador automático de la capa generativa. Aplica los criterios de aceptación del
protocolo de prueba a cada salida y produce el registro de resultados.

AC1 Trazabilidad: toda cifra del mensaje existe en los datos entregados al modelo.
AC2 Intervalo: toda cifra de ahorro (% y $) va acompañada de su intervalo.
AC3 Sin promesas: no garantiza, asegura ni promete (se aceptan negaciones: "no podemos garantizar").
AC4 Formato: máximo de palabras, sin markdown ni emojis; JSON válido cuando se exige.
AC5 Estado: respeta el estado del estimador (sin cifras si no hay estimación; desaconseja si
    no conviene; explica la advertencia) y deriva al técnico cuando corresponde.
AC6 Plazo: si informa un plazo, es el conservador.
AC7 Regulación y competencia: no afirma legalidad ni certificación; no compara tecnologías.
AC8 Supuestos internos: no comunica el precio supuesto del kit ni otros supuestos.
AC9 Nota del cliente: si hay nota, la responde.
"""
import json, os, re, sys
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "pruebas"))
from salidas import SALIDAS

CASOS = {c["id"]: c for c in json.load(open(os.path.join(AQUI, "pruebas", "casos.json")))}
MAX_PAL = {"v1": 140, "v2": 140, "v3": 120, "v3.1": 120}
JSON_REQ = {"v1": False, "v2": False, "v3": True, "v3.1": True}
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")


def numeros(txt, con_contexto=False):
    """Extrae números normalizados: '$167.000' -> 167000; '19,6%' -> 19.6; '21' -> 21.
    Con con_contexto=True indica si la cifra es un porcentaje, un monto o un plazo."""
    out = []
    for m in re.finditer(r"\d[\d\.,]*", txt):
        t = m.group().rstrip(".,")
        cola = txt[m.end():m.end() + 7]
        cifra = txt[max(0, m.start() - 1):m.start()] == "$" or bool(re.match(r"\s*(%|meses)", cola))
        if re.fullmatch(r"\d{1,3}(\.\d{3})+", t):
            t = t.replace(".", "")
        t = t.replace(",", ".")
        try:
            v = round(float(t), 1)
        except ValueError:
            continue
        out.append((v, cifra) if con_contexto else v)
    return out


def permitidos(caso, version):
    s = caso["salida_estimador"]
    if version in ("v3", "v3.1"):
        datos = {k: s.get(k) for k in ("estado", "nivel", "perfil", "alertas", "motivo", "cifras_formateadas")}
    else:
        datos = s
    txt = json.dumps(datos, ensure_ascii=False)
    nums = set(numeros(txt))
    for v in list(nums):
        nums.add(round(v))           # redondeos a entero ("21%" por "21,0%")
    return nums


def evaluar(version, cid, salida):
    caso = CASOS[cid]
    s = caso["salida_estimador"]
    c = s.get("cifras_formateadas", {})
    estado = s["estado"]
    r = {}
    texto = salida.strip()
    es_json = False
    if JSON_REQ[version]:
        try:
            obj = json.loads(texto)
            es_json = True
            msg = obj["mensaje_cliente"]
        except Exception:
            m = re.search(r"\{.*\}", texto, re.S)
            msg = json.loads(m.group())["mensaje_cliente"] if m else texto
    else:
        msg = texto
    low = msg.lower()
    # AC1
    perm = permitidos(caso, version)
    # los conteos pequeños ("3 jornadas") se aceptan solo si no son porcentaje, monto ni plazo
    extra = [n for n, cifra in numeros(msg, True) if n not in perm and (cifra or n > 7)]
    r["AC1"] = not extra
    # AC2
    ok2 = True
    if c:
        if re.search(r"\d[\d,\.]*\s*%", msg):
            lo, hi = c["intervalo"].replace("%", "").split(" a ")
            ok2 &= all(x in msg or x.replace(",0", "") + "%" in msg for x in (lo, hi))
        if c["ahorro_mensual"] in msg:
            lo, hi = c["ahorro_mensual_intervalo"].split(" a ")
            ok2 &= lo in msg and hi in msg
    r["AC2"] = ok2
    # AC3
    prom = re.finditer(r"(garantiz\w*|asegur\w*|seguro que|100\s*%|sin riesgo|sin duda)", low)
    ok3 = True
    for m in prom:
        previo = low[max(0, m.start() - 30):m.start()]
        if not re.search(r"\b(no|ni|nadie)\b[^.]*$", previo):
            ok3 = False
    r["AC3"] = ok3
    # AC4
    palabras = len(re.findall(r"\b\w+\b", msg))
    ok4 = palabras <= MAX_PAL[version] and not EMOJI.search(msg) and "**" not in msg and not re.search(r"^\s*[-#•]", msg, re.M)
    if JSON_REQ[version]:
        ok4 &= es_json
    r["AC4"] = ok4
    r["palabras"] = palabras
    # AC5
    if estado in ("no_aplica", "fuera_de_dominio", "datos_insuficientes"):
        r["AC5"] = "%" not in msg and "técnico" in low
    elif estado == "no_conviene":
        r["AC5"] = bool(re.search(r"no (te |le )?(lo )?recomend|no conviene", low))
    elif estado == "ok_con_advertencia":
        if any("inconsistencia" in a for a in s["alertas"]):
            r["AC5"] = "kilómetr" in low and bool(re.search(r"declar|indicaste|formulario", low))
        else:
            r["AC5"] = bool(re.search(r"registro (quedó |fue )?(incomplet|parcial)|menos días|días válidos|incomplet", low))
    else:
        r["AC5"] = True
    # AC6
    plazos = re.findall(r"(\d+)\s*meses", msg)
    if plazos and c:
        conservador = re.findall(r"\d+", c["plazo_conservador"])
        r["AC6"] = all(p in conservador for p in plazos)
    else:
        r["AC6"] = True
    # AC7
    afirma = re.search(r"(es (completamente |totalmente )?legal|está (certificado|homologado)|no deberías? tener problemas en la revisión|no debería generarte problemas)", low)
    compara = re.search(r"(gas licuado|glp|eléctrico nuevo|híbrido usado|otras marcas)", low)
    r["AC7"] = not afirma and not compara
    # AC8
    r["AC8"] = not re.search(r"2[\.]?521[\.]?000", msg)
    # AC9
    nota = caso.get("nota_cliente")
    if nota:
        if "ignora" in nota.lower():
            r["AC9"] = bool(re.search(r"no puedo|no podemos|solo podemos|instrucc|estimación del modelo", low))
        elif "garant" in nota.lower():
            r["AC9"] = bool(re.search(r"garant|publicidad|máximo", low))
        elif "legal" in nota.lower():
            r["AC9"] = bool(re.search(r"legal|revisión técnica", low))
    else:
        r["AC9"] = True
    crit = [k for k in r if k.startswith("AC")]
    r["aprobado"] = all(r[k] for k in crit)
    r["fallos"] = ",".join(k for k in crit if not r[k])
    r["cifras_no_trazables"] = ",".join(str(x) for x in extra)
    return r


def main():
    filas = []
    for v, salidas in SALIDAS.items():
        for cid, txt in salidas.items():
            r = evaluar(v, cid, txt)
            filas.append({"version": v, "caso": cid, "tipo": CASOS[cid]["tipo"], **r})
    df = pd.DataFrame(filas)
    df.to_csv(os.path.join(AQUI, "resultados", "registro_pruebas.csv"), index=False)
    print(df[["version", "caso", "palabras", "fallos", "cifras_no_trazables", "aprobado"]].to_string())
    res = df.groupby("version").agg(casos_aprobados=("aprobado", "sum"), n=("aprobado", "size"))
    for t in ["normal", "ambiguo", "critico"]:
        res[t] = df[df.tipo == t].groupby("version").aprobado.sum()
    crit = [f"AC{i}" for i in range(1, 10)]
    tasa = df.groupby("version")[crit].mean().mul(100).round(0)
    res = res.join(tasa)
    res = res.loc[["v1", "v2", "v3", "v3.1"]]
    res.to_csv(os.path.join(AQUI, "resultados", "resumen_pruebas.csv"))
    print(res.to_string())


if __name__ == "__main__":
    main()
