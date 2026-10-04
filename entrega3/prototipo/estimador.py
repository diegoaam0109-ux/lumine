"""
Motor del estimador: convierte la predicción del modelo en la salida comercial
(porcentaje con intervalo, pesos al mes, plazo de recuperación) y aplica las reglas
de la capa de control (estados y alertas) antes de llamar a la IA generativa.

Regla del TIG que el motor hace cumplir: ninguna cifra de ahorro sin su margen de error.
La IA generativa nunca calcula: recibe las cifras ya formateadas y solo las explica.
"""
import json
import os

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))

# Parámetros comerciales (todos con fuente o marcados como supuesto)
PRECIO_BENCINA = 1541          # $/l, bencina 93 en la RM tras el alza de marzo de 2026 (BioBioChile, 2026a)
PRECIO_KIT = 2_521_000         # $ neto, supuesto S7 heredado de la Entrega 1 (Plan Financiero pendiente)
REND_DEFECTO = 10.0            # km/l urbano, supuesto S3 del TIG
DIAS_MES = {"colectivo": 26, "aplicacion": 24, "particular": 22}
PLAZO_MAX_CONVIENE = 48        # meses; sobre esto el técnico desaconseja (vida útil supuesta de la batería)


def _predecir_gbm(m, x):
    total = m["init"]
    for a in m["arboles"]:
        nodo = 0
        while a["l"][nodo] != -1:
            nodo = a["l"][nodo] if x[a["f"][nodo]] <= a["t"][nodo] else a["r"][nodo]
        total += m["lr"] * a["v"][nodo]
    return total


def cargar_modelo():
    with open(os.path.join(AQUI, "app", "modelo.json")) as f:
        return json.load(f)


def pesos(n):
    return "$" + f"{int(round(n, -3)):,}".replace(",", ".")


def pct(n):
    return f"{n:.1f}".replace(".", ",") + "%"


def estimar(datos, modelo=None):
    """datos: dict con nivel (1 o 2), perfil, km_dia, vehiculo y, en nivel 2, variables GPS."""
    modelo = modelo or cargar_modelo()
    alertas = []
    estado = "ok"
    nivel = datos["nivel"]
    perfil = datos["perfil"]
    if datos.get("traccion", "delantera") != "delantera":
        return {"estado": "no_aplica", "motivo": "El kit solo se instala en autos de tracción delantera.",
                "alertas": ["traccion_no_compatible"], "nivel": nivel, "perfil": perfil}
    if nivel == 2:
        m = modelo["nivel2"]
        if datos.get("jornadas_validas", 5) < 3:
            return {"estado": "datos_insuficientes", "nivel": nivel, "perfil": perfil,
                    "motivo": "El registro tiene menos de tres jornadas válidas.", "alertas": ["registro_incompleto"]}
        x = [datos[v] for v in m["vars"]]
        fuera = []
        for v in m["vars"]:
            lo, hi = modelo["dominio"][v]
            margen = 0.10 * (hi - lo)
            if not (lo - margen <= datos[v] <= hi + margen):
                fuera.append(v)
        if fuera:
            return {"estado": "fuera_de_dominio", "nivel": nivel, "perfil": perfil,
                    "motivo": "La forma de conducir registrada está fuera del rango con que se entrenó el modelo.",
                    "alertas": ["fuera_de_dominio:" + ",".join(fuera)]}
        q = m["q80"]
        if datos.get("jornadas_validas", 5) < 5:
            q *= 1.5
            alertas.append("registro_parcial_intervalo_ampliado")
        km_decl = datos.get("km_declarado")
        if km_decl and abs(km_decl - datos["km_dia"]) / datos["km_dia"] > 0.4:
            alertas.append("inconsistencia_km_declarado_vs_registrado")
        km = datos["km_dia"]
    else:
        m = modelo["nivel1"]
        x = [datos.get(v, 0) for v in m["vars"]]
        q = m["q80"]
        km = datos["km_declarado"]
    centro = float(_predecir_gbm(m, x))
    lo, hi = centro - q, centro + q
    cons = lo * modelo["razon_escenarios"]["conservador"]
    rend = datos.get("rendimiento_kml") or REND_DEFECTO
    gasto = km * DIAS_MES[perfil] / rend * PRECIO_BENCINA
    ahorro_mes = gasto * centro / 100
    ahorro_mes_lo, ahorro_mes_hi = gasto * lo / 100, gasto * hi / 100
    ahorro_mes_cons = gasto * cons / 100
    plazo_cons = PRECIO_KIT / ahorro_mes_cons if ahorro_mes_cons > 0 else float("inf")
    if plazo_cons > PLAZO_MAX_CONVIENE:
        estado = "no_conviene"
        alertas.append("plazo_conservador_sobre_48_meses")
    elif alertas:
        estado = "ok_con_advertencia"
    return {
        "estado": estado, "nivel": nivel, "perfil": perfil, "alertas": alertas,
        "ahorro_pct": round(centro, 1), "intervalo_80": [round(lo, 1), round(hi, 1)],
        "ahorro_conservador_pct": round(cons, 1),
        "gasto_mensual": round(gasto, -3), "ahorro_mensual": round(ahorro_mes, -3),
        "ahorro_mensual_intervalo": [round(ahorro_mes_lo, -3), round(ahorro_mes_hi, -3)],
        "plazo_recuperacion_conservador_meses": None if np.isinf(plazo_cons) else round(plazo_cons),
        "supuestos": {"precio_bencina": PRECIO_BENCINA, "precio_kit_supuesto": PRECIO_KIT,
                      "rendimiento_kml": rend, "dias_mes": DIAS_MES[perfil]},
        "cifras_formateadas": {
            "ahorro": pct(centro), "intervalo": f"{pct(lo)} a {pct(hi)}",
            "ahorro_conservador": pct(cons),
            "gasto_mensual": pesos(gasto), "ahorro_mensual": pesos(ahorro_mes),
            "ahorro_mensual_intervalo": f"{pesos(ahorro_mes_lo)} a {pesos(ahorro_mes_hi)}",
            "plazo_conservador": "más de 48 meses" if plazo_cons > PLAZO_MAX_CONVIENE else f"{round(plazo_cons)} meses",
            "km_dia": f"{round(km)} km",
        },
    }


def plantilla_respaldo(res):
    """Salida determinista: se usa si la IA generativa no está disponible o si su texto
    no pasa el validador. Garantiza que el cliente nunca reciba una cifra sin intervalo."""
    c = res.get("cifras_formateadas", {})
    if res["estado"] in ("no_aplica", "fuera_de_dominio", "datos_insuficientes"):
        return (f"No podemos darte una estimación confiable todavía. {res['motivo']} "
                "Un técnico de Lumine revisará tu caso y te contactará con los pasos a seguir.")
    txt = (f"Con tu forma de manejar, estimamos un ahorro de combustible de {c['ahorro']} "
           f"(rango probable: {c['intervalo']}). Son cerca de {c['ahorro_mensual']} al mes "
           f"(rango: {c['ahorro_mensual_intervalo']}). Con el escenario conservador, recuperarías la "
           f"inversión en {c['plazo_conservador']}. ")
    if res["estado"] == "no_conviene":
        txt += "Con tu kilometraje actual el kit no se paga en un plazo razonable, así que no te lo recomendamos. "
    txt += "La cifra se verificará con los datos reales del kit después de instalarlo."
    return txt


if __name__ == "__main__":
    ejemplo = {"nivel": 1, "perfil": "colectivo", "km_declarado": 200, "horario_ord": 2, "autopista_ord": 0,
               "perfil_colectivo": 1, "perfil_aplicacion": 0, "perfil_particular": 0,
               "masa_kg": 1400, "cilindrada_l": 1.6}
    r = estimar(ejemplo)
    print(json.dumps(r, ensure_ascii=False, indent=1))
    print(plantilla_respaldo(r))
