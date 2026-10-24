"""
Cálculos y figuras nuevas del informe final (Entrega 5, que integra la Entrega 4).
Lee los resultados de la Entrega 3 y de mejoras_e4.py; no los modifica.
Escribe entrega5/analisis/cifras_finales.json y las figuras en entrega5/figuras/.
"""
import json
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np
import pandas as pd
from scipy.stats import norm
from sklearn.linear_model import RidgeCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
PRO = os.path.join(RAIZ, "entrega3", "prototipo")
RES = os.path.join(PRO, "resultados")
FIG = os.path.join(os.path.dirname(AQUI), "figuras")
sys.path.insert(0, PRO)
from model import VARS_GPS  # noqa: E402

NAVY, CYAN, INK, GRID, MUTED = "#2B4C9B", "#0E8FC9", "#1F2A44", "#E3E7EE", "#6B7280"
SOFT, ALT = "#E3F3FB", "#F3F6FA"
plt.rcParams.update({
    "font.family": "Liberation Sans", "font.size": 10.5, "axes.edgecolor": "#9AA3B2",
    "axes.labelcolor": INK, "xtick.color": "#4B5563", "ytick.color": "#4B5563", "axes.titlesize": 11.5,
    "axes.titlelocation": "left", "axes.titlecolor": INK, "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.8, "axes.axisbelow": True,
})
NOMBRES = {"detenciones_km": "Detenciones por km", "vel_mov_media": "Velocidad en movimiento",
           "vel_media": "Velocidad media", "pct_detenido": "Tiempo detenido (%)",
           "acel_pos_media": "Aceleración media", "pct_sobre_60": "Tiempo sobre 60 km/h",
           "energia_cinetica_km": "Energía cinética por km", "desnivel_pos_km": "Subida acumulada por km",
           "km_dia": "Kilómetros por día", "masa_kg": "Masa", "cilindrada_l": "Cilindrada"}


def coma(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def miles(x):
    return f"{int(round(x)):,}".replace(",", ".")


def guardar(fig, nombre):
    fig.savefig(os.path.join(FIG, nombre), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ------------------------------------------------------------------ 1. Ridge explicable
def ridge_explicable():
    t = pd.read_csv(os.path.join(RES, "conductores.csv"))
    m = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13))).fit(t[VARS_GPS].values, t.y_base.values)
    coef = m[-1].coef_
    tab = pd.DataFrame({"variable": VARS_GPS, "nombre": [NOMBRES[v] for v in VARS_GPS], "coef_pp_por_DE": coef})
    tab = tab.reindex(tab.coef_pp_por_DE.abs().sort_values(ascending=False).index)
    casos = {c["id"]: c for c in json.load(open(os.path.join(PRO, "pruebas", "casos.json"), encoding="utf-8"))}
    n1 = casos["N1"]["entrada"]
    pred_n1 = float(m.predict(np.array([[n1[v] for v in VARS_GPS]]))[0])
    return tab, float(m[-1].alpha_), float(m[-1].intercept_), pred_n1, casos["N1"]


# ------------------------------------------------------------------ 2. Variación del ahorro (H1)
def variacion():
    t = pd.read_csv(os.path.join(RES, "conductores.csv"))
    g = t.groupby("perfil").y_base.agg(["median", "mean", "std", lambda s: s.quantile(0.1), lambda s: s.quantile(0.9)])
    g.columns = ["mediana", "media", "de", "p10", "p90"]
    g["cv_pct"] = 100 * g.de / g.media
    cm = pd.read_csv(os.path.join(RES, "jornadas_cmap.csv"))
    cv_cmap = float(100 * cm.ahorro_base.std() / cm.ahorro_base.mean())
    total_cv = float(100 * t.y_base.std() / t.y_base.mean())
    # proporción de la varianza total explicada por el perfil (eta cuadrado)
    entre = sum(len(s) * (s.mean() - t.y_base.mean()) ** 2 for _, s in t.groupby("perfil").y_base)
    eta2 = float(entre / ((t.y_base - t.y_base.mean()) ** 2).sum())
    return g, cv_cmap, total_cv, eta2


# ------------------------------------------------------------------ 3. Tamaño muestral del A/B (H3)
def muestra_ab(p1=0.40, p2=0.55, alfa=0.05, potencia=0.80):
    za, zb = norm.ppf(1 - alfa / 2), norm.ppf(potencia)
    pm = (p1 + p2) / 2
    n = (za * np.sqrt(2 * pm * (1 - pm)) + zb * np.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2
    # potencia que habría tenido la encuesta de 40 respuestas (20 por grupo)
    se = np.sqrt(p1 * (1 - p1) / 20 + p2 * (1 - p2) / 20)
    pot40 = float(norm.cdf((p2 - p1) / se - za))
    return int(np.ceil(n)), pot40


# ------------------------------------------------------------------ 4. Evaluación económica
SUP = {  # supuestos S13 a S16 (a reemplazar por el Plan Financiero del TIG)
    "cotizaciones_anio": 1000, "tasa_agenda_base": 0.30, "conversion_instalacion": 0.40,
    "precio_kit": 2_521_000, "margen_contribucion": 0.30, "dolar": 950,
}
COSTOS_1 = [  # concepto, monto año 1, monto anual desde el año 2
    ("Desarrollo e integración del estimador (240 h × $15.000)", 3_600_000, 0),
    ("Asesoría legal y de datos personales (consentimiento, política, registro)", 1_500_000, 300_000),
    ("Capacitación de asesores y técnicos (2 talleres)", 400_000, 200_000),
    ("Piloto A/B: difusión en redes y gremios", 300_000, 0),
    ("Hosting, dominio y monitoreo (12 × $20.000)", 240_000, 240_000),
    ("API de Claude (1.000 explicaciones × US$0,016)", 1000 * 0.016 * 950, 1000 * 0.016 * 950),
    ("Revisión del técnico (0,5 h × $10.000 por diagnóstico)", None, None),
    ("Auditoría y recalibración trimestral (4 × 20 h × $15.000)", 1_200_000, 1_200_000),
]


def economia():
    s = SUP
    margen = s["precio_kit"] * s["margen_contribucion"]
    diagn_base = s["cotizaciones_anio"] * s["tasa_agenda_base"]
    filas = []
    escenarios = {"Pesimista (sin efecto)": 0.0, "Base (+5 pp)": 0.05, "Optimista (H3, +15 pp)": 0.15}
    out = {}
    for nombre, delta in escenarios.items():
        diagn = s["cotizaciones_anio"] * (s["tasa_agenda_base"] + delta)
        costos = []
        for c, a1, a2 in COSTOS_1:
            if a1 is None:
                a1 = a2 = diagn * 0.5 * 10_000
            costos.append((c, a1, a2))
        c1 = sum(a for _, a, _ in costos)
        c2 = sum(b for _, _, b in costos)
        extra_inst = s["cotizaciones_anio"] * delta * s["conversion_instalacion"]
        beneficio = extra_inst * margen
        roi1 = (beneficio - c1) / c1
        van3 = sum((beneficio - (c1 if k == 0 else c2)) / 1.12 ** (k + 1) for k in range(3))
        out[nombre] = {"delta_pp": 100 * delta, "diagnosticos": diagn, "instalaciones_extra": extra_inst,
                       "beneficio": beneficio, "costo_1": c1, "costo_2": c2, "roi_1": roi1, "van_3_12pct": van3}
        if delta == 0.05:
            filas = costos
    costo_base = out["Base (+5 pp)"]["costo_1"]
    delta_eq = costo_base / (s["cotizaciones_anio"] * s["conversion_instalacion"] * margen)
    return out, filas, margen, delta_eq


# ------------------------------------------------------------------ figuras
def caja(ax, x, y, w, h, titulo, texto, color, fondo):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.006,rounding_size=0.015",
                                linewidth=1.4, edgecolor=color, facecolor=fondo))
    ax.text(x + w / 2, y + h - 0.035, titulo, ha="center", va="top", fontsize=10, fontweight="bold", color=color)
    ax.text(x + w / 2, y + h - 0.105, texto, ha="center", va="top", fontsize=8.4, color=INK, linespacing=1.35)


def fig_conexion(n1, pred_ridge):
    s = n1["salida_estimador"]
    e = n1["entrada"]
    c = s["cifras_formateadas"]
    fig, ax = plt.subplots(figsize=(13, 5.2))
    ax.set_xlim(-0.005, 1.005)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.grid(False)
    w, h, y = 0.146, 0.56, 0.2
    xs = [0.008 + i * 0.1665 for i in range(6)]
    pasos = [
        ("1. Registro (1 semana)", f"Velocidad a 1 Hz con\nconsentimiento; se recortan\n300 m por viaje y se borra\nla ruta.\n\nN1: colectivo, {coma(e['km_dia'], 0)} km/día,\n{coma(e['detenciones_km'])} detenciones/km,\níndice de energía\ncinética {coma(e['energia_cinetica_km'], 2)} por km", NAVY, ALT),
        ("2. Modelo predictivo", f"Aprendió de 3.000 jornadas\nsimuladas con física\n(Willans + kit + SAE J1711).\n\nPredice la semana 2:\n{c['ahorro']}\nIntervalo conforme 80%:\n{c['intervalo']}", NAVY, ALT),
        ("3. Motor comercial", f"Fórmulas deterministas:\ngasto = km × días × 4,33\n÷ 10 km/l × $1.459\n= {c['gasto_mensual']}/mes\nahorro = {c['ahorro_mensual']}/mes\nplazo = $2.521.000 ÷ ahorro\nconservador = {c['plazo_conservador']}\nEstado: \"{s['estado']}\"", NAVY, ALT),
        ("4. Salida del estimador", "JSON con contexto mínimo:\nestado, alertas y\n\"cifras_formateadas\".\n\nSin precio del kit, sin\nubicación, sin supuestos\ninternos.", CYAN, SOFT),
        ("5. Prompt RAFA v3.1", "Rol: asesor que no vende.\nAcción: copiar las cifras,\nno calcular; reglas por\nestado.\nFormato: JSON por esquema.\nAntecedentes: Ley 19.496\ny dos ejemplos.", CYAN, SOFT),
        ("6. Validador y técnico", "9 criterios automáticos:\ncada cifra del mensaje debe\nexistir en el paso 4.\nSi falla: plantilla de\nrespaldo.\n\nEl técnico aprueba, ajusta\n±2 pp o bloquea.", CYAN, SOFT),
    ]
    for x, (t, txt, col, fondo) in zip(xs, pasos):
        caja(ax, x, y, w, h, t, txt, col, fondo)
    for x in xs[:-1]:
        ax.annotate("", xy=(x + w + 0.0185, y + h / 2), xytext=(x + w + 0.002, y + h / 2),
                    arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=1.4))
    mid = xs[3] - 0.009
    ax.plot([mid, mid], [0.08, 0.86], ls="--", color="#C0392B", lw=1.3)
    ax.text(mid, 0.05, "Frontera: la IA generativa nunca calcula ni decide", ha="center", fontsize=9.5, color="#C0392B", fontweight="bold")
    ax.text((xs[0] + xs[2] + w) / 2, 0.91, "MATEMÁTICA: produce y respalda cada cifra", ha="center", fontsize=10.5, color=NAVY, fontweight="bold")
    ax.text((xs[3] + xs[5] + w) / 2, 0.91, "LENGUAJE: comunica sin alterar las cifras", ha="center", fontsize=10.5, color=CYAN, fontweight="bold")
    ax.text(0.5, 0.995, f"Caso N1 trazado de punta a punta. Ahorro simulado real de su semana 2: {coma(n1['ahorro_simulado_semana2'])}%; "
            f"el Ridge del nivel 2 propuesto predice {coma(pred_ridge)}%.", ha="center", va="top", fontsize=9, color=MUTED)
    guardar(fig, "fig_conexion_modelo_rafa.png")


def fig_robustez():
    rob = pd.read_csv(os.path.join(RES, "e4", "robustez_10_semillas.csv"), index_col=0)
    ext = pd.read_csv(os.path.join(RES, "e4", "validacion_externa_corregida.csv"), index_col=0)
    orden = ["M2 Lineal 2 variables (Entrega 2)", "M1 Nivel 1 cotización (GBM, declarados)", "M0c Promedio por perfil",
             "M3 Nivel 2 diagnóstico (GBM, GPS)", "Ref. Simulación directa semana 1", "R11 Ridge 11 variables GPS"]
    etiquetas = ["M2 lineal 2 var. (E2)", "M1 cotización (GBM)", "M0c promedio por perfil", "M3 GBM 11 var. (E3)",
                 "Simulación directa sem. 1", "R11 Ridge 11 var. (final)"]
    fig, ax = plt.subplots(1, 2, figsize=(12.8, 4.5), gridspec_kw={"width_ratios": [1.1, 1]})
    y = np.arange(len(orden))
    mae = rob.loc[orden, "MAE_mean"].values
    de = rob.loc[orden, "MAE_std"].values
    cols = [MUTED, MUTED, MUTED, "#8AA0C8", "#B8C4DA", NAVY]
    ax[0].barh(y, mae, xerr=de, color=cols, error_kw=dict(ecolor=INK, lw=1, capsize=3))
    for yi, v, d in zip(y, mae, de):
        ax[0].text(v + d + 0.03, yi, f"{coma(v, 2)} ± {coma(d, 2)}", va="center", fontsize=9, color=INK)
    ax[0].set_yticks(y, etiquetas)
    ax[0].set_xlim(0, 1.75)
    ax[0].set_xlabel("Error absoluto medio en conductores no vistos (puntos porcentuales)")
    ax[0].set_title("a) 10 particiones: el Ridge supera al GBM en 10 de 10\n(cifra genérica de 25%: 7,9 pp, fuera de escala)")
    filas = ["a) Por jornada, KFold por fila (como E3)", "a) Por jornada, GroupKFold por conductor", "c) Solo sintéticas",
             "c) Solo CMAP (2/3)", "c) Reajuste ×20, calibración E3", "c) Reajuste ×20, calibración ponderada por vehículo"]
    et2 = ["Sintético, por fila (E3)", "Sintético, por conductor", "Solo sintéticas (30 rep.)", "Solo reales CMAP",
           "Reajuste, calibración E3", "Reajuste, calibración corregida"]
    cob = ext.loc[filas, "cobertura_80"].values
    y2 = np.arange(len(filas))
    ax[1].barh(y2, cob, color=["#B8C4DA"] * 3 + [MUTED, "#8AA0C8", CYAN])
    ax[1].axvline(80, color="#C0392B", ls="--", lw=1.2)
    ax[1].text(80.5, len(filas) - 0.45, "meta 80%", color="#C0392B", fontsize=9)
    for yi, v, m in zip(y2, cob, ext.loc[filas, "MAE"].values):
        ax[1].text(v + 1, yi, f"{coma(v, 0)}%  (MAE {coma(m, 2)})", va="center", fontsize=9, color=INK)
    ax[1].set_yticks(y2, et2)
    ax[1].set_xlim(0, 118)
    ax[1].set_xlabel("Cobertura del intervalo al 80% en jornadas reales CMAP (%)")
    ax[1].set_title("b) Datos reales: la baja cobertura era de dominio,\nno de fuga; con datos reales llega a 78%")
    fig.tight_layout()
    guardar(fig, "fig_validacion_final.png")


def fig_hoja_ruta():
    fases = [
        ("F0 Preparación legal y nivel 1 en el sitio", 0, 1.5, MUTED),
        ("F1 Piloto A/B de la promesa (H3)", 1.5, 3, NAVY),
        ("F1 Nivel 2 con Ridge y 10 instalaciones piloto", 2, 4, NAVY),
        ("F2 Verificación posventa con telemetría (nivel 3)", 4, 8, CYAN),
        ("F2 Recalibración con datos de Santiago", 5, 8, CYAN),
        ("F3 Escalamiento y auditoría trimestral", 8, 12, "#8AA0C8"),
    ]
    hitos = [(1.5, "Consentimiento\ny política aprobados"), (4.5, "Decisión: ¿efecto ≥ 3 pp?"), (8, "Cobertura real\n75% a 85%"), (12, "Revisión anual")]
    fig, ax = plt.subplots(figsize=(12.5, 3.9))
    for i, (n, a, b, c) in enumerate(fases):
        ax.barh(len(fases) - 1 - i, b - a, left=a, color=c, height=0.55)
    for x, t in hitos:
        ax.axvline(x, color="#C0392B", ls=":", lw=1)
        ax.text(x, len(fases) - 0.35, t, ha="center", va="bottom", fontsize=8.3, color="#C0392B")
    ax.set_yticks(range(len(fases)), [f[0] for f in fases][::-1])
    ax.set_xticks(range(0, 13))
    ax.set_xlim(0, 12.6)
    ax.set_ylim(-0.6, len(fases) + 0.6)
    ax.set_xlabel("Mes desde la aprobación")
    ax.grid(axis="y", visible=False)
    guardar(fig, "fig_hoja_ruta.png")


def fig_roi(eco, delta_eq):
    s = SUP
    margen = s["precio_kit"] * s["margen_contribucion"]
    d = np.linspace(0, 0.16, 100)
    costo = eco["Base (+5 pp)"]["costo_1"]
    ben = s["cotizaciones_anio"] * d * s["conversion_instalacion"] * margen
    fig, ax = plt.subplots(figsize=(7.6, 3.9))
    ax.plot(100 * d, ben / 1e6, color=NAVY, lw=2.2, label="Margen adicional por mayor agendamiento")
    ax.axhline(costo / 1e6, color=MUTED, ls="--", lw=1.4, label=f"Costo del año 1 (${coma(costo / 1e6)} millones)")
    ax.axvline(100 * delta_eq, color="#C0392B", ls=":", lw=1.2)
    ax.text(100 * delta_eq + 0.2, 26, f"punto de equilibrio:\n+{coma(100 * delta_eq)} pp", color="#C0392B", fontsize=9)
    for n, v in eco.items():
        ax.plot(v["delta_pp"], v["beneficio"] / 1e6, "o", color=CYAN, ms=7)
        ax.text(v["delta_pp"] + 0.25, v["beneficio"] / 1e6 + (2.2 if v["delta_pp"] == 0 else -3.2), f"{n.split(' (')[0]}: ROI {coma(100 * v['roi_1'], 0)}%", fontsize=8.6, color=INK)
    ax.set_xlabel("Aumento de la tasa de agendamiento por la estimación personalizada (pp)")
    ax.set_ylabel("Millones de pesos, año 1")
    ax.legend(frameon=False, fontsize=8.6, loc="lower right")
    guardar(fig, "fig_roi.png")


def main():
    os.makedirs(FIG, exist_ok=True)
    tab, alfa, intercepto, pred_n1, n1 = ridge_explicable()
    g, cv_cmap, cv_total, eta2 = variacion()
    n_ab, pot40 = muestra_ab()
    eco, costos, margen, delta_eq = economia()
    e4 = json.load(open(os.path.join(RES, "e4", "resumen_e4.json"), encoding="utf-8"))
    fig_conexion(n1, pred_n1)
    fig_robustez()
    fig_hoja_ruta()
    fig_roi(eco, delta_eq)
    cifras = {
        "ridge": {"alfa": alfa, "intercepto": intercepto, "pred_N1": pred_n1, "N1_real_semana2": n1["ahorro_simulado_semana2"],
                  "coeficientes": tab.round(3).to_dict(orient="records")},
        "variacion_por_perfil": g.round(2).to_dict(orient="index"), "cv_cmap_pct": cv_cmap, "cv_total_sintetico_pct": cv_total,
        "eta2_perfil": eta2, "ab_n_por_grupo": n_ab, "potencia_encuesta_40": pot40,
        "economia": eco, "costos_base": [(c, a, b) for c, a, b in costos], "margen_por_kit": margen, "delta_equilibrio": delta_eq,
        "supuestos_economicos": SUP, "e4": e4,
    }
    with open(os.path.join(AQUI, "cifras_finales.json"), "w", encoding="utf-8") as f:
        json.dump(cifras, f, ensure_ascii=False, indent=1, default=float)
    print(tab.round(3).to_string(index=False))
    print("Ridge alfa", alfa, "N1 ridge", round(pred_n1, 2), "real", round(n1["ahorro_simulado_semana2"], 2))
    print(g.round(2).to_string())
    print("CV CMAP", round(cv_cmap, 1), "CV total sint", round(cv_total, 1), "eta2 perfil", round(eta2, 3))
    print("A/B n por grupo", n_ab, "potencia con 40", round(pot40, 2))
    for k, v in eco.items():
        print(k, {a: round(b) if abs(b) > 10 else round(b, 3) for a, b in v.items()})
    print("margen", margen, "delta equilibrio pp", round(100 * delta_eq, 2))


if __name__ == "__main__":
    main()
