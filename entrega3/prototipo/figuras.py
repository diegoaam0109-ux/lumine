"""Figuras del informe de la Entrega 3, con el estilo gráfico de la Entrega 2."""
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(AQUI, "resultados")
FIG = os.path.join(os.path.dirname(AQUI), "figuras")
NAVY, CYAN, INK, GRID, MUTED = "#2B4C9B", "#0E8FC9", "#1F2A44", "#E3E7EE", "#6B7280"
COL = {"colectivo": NAVY, "aplicacion": CYAN, "particular": "#8AA0C8"}
NOMBRE = {"colectivo": "Colectivo", "aplicacion": "Aplicación", "particular": "Particular"}
plt.rcParams.update({
    "font.family": "Liberation Sans", "font.size": 10.5, "axes.edgecolor": "#9AA3B2",
    "axes.labelcolor": INK, "xtick.color": "#4B5563", "ytick.color": "#4B5563", "axes.titlesize": 11.5,
    "axes.titlelocation": "left", "axes.titlecolor": INK, "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.8, "axes.axisbelow": True, "figure.dpi": 100,
})


def guardar(fig, nombre):
    fig.savefig(os.path.join(FIG, nombre), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def coma(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


# ------------------------------------------------------------ Figura: validación del simulador
def fig_simulador():
    c = pd.read_csv(os.path.join(RES, "ciclos_estandar.csv"))
    nombres = {"wltc_low_3": "WLTC baja", "wltc_medium_3b": "WLTC media", "udds": "UDDS (urbano)", "us06": "US06 (agresivo)",
               "wltc_high_3b": "WLTC alta", "wltc_3b": "WLTC completo", "wltc_extrahigh_3": "WLTC extra alta", "hwfet": "HWFET (carretera)"}
    c["n"] = c.jornada.map(nombres)
    c = c.sort_values("ahorro_base")
    fs = {"UDDS": (15.2, 15.5), "HWFET": (20.4, 19.2), "US06": (13.9, 14.1), "WLTC": (15.6, 15.6)}  # validacion_fastsim.py
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.6), gridspec_kw={"width_ratios": [1, 1.35]})
    x = np.arange(len(fs))
    ax[0].bar(x - 0.19, [v[0] for v in fs.values()], 0.38, color="#B8C4DA", label="FASTSim (NREL), Ford Focus 2012")
    ax[0].bar(x + 0.19, [v[1] for v in fs.values()], 0.38, color=NAVY, label="Simulador propio, mismo vehículo")
    for i, (a, b) in enumerate(fs.values()):
        ax[0].text(i + 0.19, b + 0.3, coma(b), ha="center", fontsize=9, color=INK)
        ax[0].text(i - 0.19, a + 0.3, coma(a), ha="center", fontsize=9, color=MUTED)
    ax[0].set_xticks(x, list(fs.keys()))
    ax[0].set_ylabel("Rendimiento sin kit (km/l)")
    ax[0].set_ylim(0, 24)
    ax[0].set_title("a) El consumo base reproduce a FASTSim\n(error cuadrático medio de 3,4% tras calibrar)")
    ax[0].legend(frameon=False, fontsize=9, loc="upper left")
    y = np.arange(len(c))
    ax[1].hlines(y, c.ahorro_conservador, c.ahorro_optimista, color="#B8C4DA", lw=6)
    ax[1].plot(c.ahorro_base, y, "o", color=NAVY, ms=7, label="Kit de referencia (23 kW, 1,5 kWh)")
    ax[1].plot(c.ahorro_conservador, y, "|", color=MUTED, ms=12, mew=2, label="Conservador / optimista")
    ax[1].plot(c.ahorro_optimista, y, "|", color=MUTED, ms=12, mew=2)
    for yi, v in zip(y, c.ahorro_base):
        ax[1].text(v, yi + 0.28, coma(v) + "%", ha="center", fontsize=8.5, color=INK)
    ax[1].axvline(15.5, color=CYAN, ls="--", lw=1.2)
    ax[1].text(15.8, 2.5, "ICCT, eje trasero\nen WLTC: 15,5%", color=CYAN, fontsize=9)
    ax[1].set_yticks(y, c.n)
    ax[1].set_xlim(0, 27)
    ax[1].set_xlabel("Ahorro de combustible simulado (%)")
    ax[1].set_title("b) El ahorro del kit cae a medida que el ciclo\nse vuelve más rápido y con menos detenciones")
    ax[1].legend(frameon=False, fontsize=9, loc="lower right")
    fig.tight_layout()
    guardar(fig, "fig_simulador.png")


# ------------------------------------------------------------ Figura: distribución del ahorro (SP1)
def fig_distribucion():
    t = pd.read_csv(os.path.join(RES, "conductores.csv"))
    cm = pd.read_csv(os.path.join(RES, "jornadas_cmap.csv"))
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.6), gridspec_kw={"width_ratios": [1.5, 1]})
    rng = np.random.default_rng(3)
    orden = ["colectivo", "aplicacion", "particular"]
    for i, p in enumerate(orden):
        g = t[t.perfil == p]
        for j, (col, color, alfa) in enumerate([("y_conservador", "#B8C4DA", 0.9), ("y_base", COL[p], 0.95), ("y_optimista", "#B8C4DA", 0.9)]):
            pos = i * 4 + j
            ax[0].scatter(pos + rng.uniform(-0.28, 0.28, len(g)), g[col], s=9, color=color, alpha=alfa, edgecolor="none")
            med = g[col].median()
            ax[0].hlines(med, pos - 0.38, pos + 0.38, color=INK, lw=2)
            ax[0].text(pos, g[col].max() + 0.6, coma(med), ha="center", fontsize=8.5, color=INK)
    ax[0].axhline(25, color=MUTED, ls=":", lw=1.2)
    ax[0].text(10.6, 25.4, "Cifra genérica del TIG: 25%", ha="right", fontsize=9, color=MUTED)
    ax[0].axhspan(20, 25, color=CYAN, alpha=0.07)
    ticks = [i * 4 + j for i in range(3) for j in range(3)]
    ax[0].set_xticks(ticks, ["Cons.", "Ref.", "Opt."] * 3, fontsize=8.5)
    for i, p in enumerate(orden):
        ax[0].text(i * 4 + 1, 5.3, NOMBRE[p], ha="center", fontsize=10, color=INK, fontweight="bold")
    ax[0].set_ylim(4, 28.5)
    ax[0].set_ylabel("Ahorro de la semana 2 (%)")
    ax[0].set_title("a) 300 conductores sintéticos de Santiago, por perfil y escenario del kit\n(la raya negra es la mediana; la franja celeste marca 20% a 25%)")
    ax[0].grid(axis="x", visible=False)
    # CMAP real
    ax[1].hist(cm.ahorro_base, bins=np.arange(0, 30, 2), color=NAVY, alpha=0.85, edgecolor="white")
    ax[1].axvline(cm.ahorro_base.median(), color=INK, lw=2)
    ax[1].text(cm.ahorro_base.median() + 0.4, 8.6, f"mediana {coma(cm.ahorro_base.median())}%", fontsize=9, color=INK)
    cv = cm.ahorro_base.std() / cm.ahorro_base.mean() * 100
    ax[1].text(22.6, 5.6, f"45 jornadas reales,\n21 vehículos,\n3.577 km\nCV = {coma(cv, 0)}%", fontsize=9, color=MUTED)
    ax[1].set_xlabel("Ahorro simulado con el kit de referencia (%)")
    ax[1].set_ylabel("Jornadas")
    ax[1].set_title("b) Jornadas reales de Chicago (CMAP, 2007),\nterreno plano y otro tránsito")
    fig.tight_layout()
    guardar(fig, "fig_distribucion.png")


# ------------------------------------------------------------ Figura: desempeño del modelo (SP2)
def fig_modelo():
    comp = pd.read_csv(os.path.join(RES, "comparacion_modelos.csv"), index_col=0)
    pred = pd.read_csv(os.path.join(RES, "predicciones_test.csv"))
    etiquetas = {"M0 Cifra genérica TIG (25%)": "M0 Cifra genérica 25%", "M0b Cifra ICCT eje trasero (15,5%)": "M0b Cifra ICCT 15,5%",
                 "M0c Promedio por perfil": "M0c Promedio por perfil", "M1 Nivel 1 cotización (GBM, declarados)": "M1 Cotización (declarados)",
                 "M2 Nivel 2 lineal, 2 variables (Entrega 2)": "M2 Lineal de la Entrega 2", "M3 Nivel 2 diagnóstico (GBM, registro GPS)": "M3 Diagnóstico (GPS)"}
    comp = comp.loc[list(etiquetas)]
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.7), gridspec_kw={"width_ratios": [1, 1.1]})
    y = np.arange(len(comp))[::-1]
    colores = ["#C9CFDA", "#C9CFDA", "#9FB0D0", CYAN, "#9FB0D0", NAVY]
    ax[0].barh(y, comp.MAE, color=colores)
    for yi, v in zip(y, comp.MAE):
        ax[0].text(v + 0.12, yi, coma(v, 2) + " pp", va="center", fontsize=9, color=INK)
    ax[0].axvline(3, color=MUTED, ls=":", lw=1.2)
    ax[0].text(3.1, 5.35, "meta OE2: 3 pp", fontsize=8.5, color=MUTED)
    ax[0].set_yticks(y, [etiquetas[i] for i in comp.index])
    ax[0].set_xlim(0, 9.4)
    ax[0].set_xlabel("Error absoluto medio en 90 conductores de prueba (puntos porcentuales)")
    ax[0].set_title("a) La cifra genérica falla por casi 8 puntos;\nel modelo de diagnóstico, por menos de 1")
    ax[0].grid(axis="y", visible=False)
    for p in ["colectivo", "aplicacion", "particular"]:
        g = pred[pred.perfil == p]
        ax[1].errorbar(g.y, g.p_M3, yerr=g.q_M3, fmt="o", ms=4, color=COL[p], ecolor=COL[p], elinewidth=0.8, alpha=0.75, label=NOMBRE[p])
    lim = [11, 24.5]
    ax[1].plot(lim, lim, color=MUTED, lw=1)
    ax[1].set_xlim(lim)
    ax[1].set_ylim(lim)
    cob = comp.loc["M3 Nivel 2 diagnóstico (GBM, registro GPS)", "cobertura_80"]
    r2 = comp.loc["M3 Nivel 2 diagnóstico (GBM, registro GPS)", "R2"]
    ax[1].text(17.3, 12.0, f"R² = {coma(r2, 2)}\nIntervalo al 80% contiene el valor\nsimulado en {coma(cob, 0)}% de los casos", fontsize=9, color=INK)
    ax[1].set_xlabel("Ahorro simulado de la semana 2 (%)")
    ax[1].set_ylabel("Predicción con la semana 1 (%)")
    ax[1].set_title("b) Modelo M3: predicción e intervalo frente al valor simulado")
    ax[1].legend(frameon=False, fontsize=9, loc="upper left")
    fig.tight_layout()
    guardar(fig, "fig_modelo.png")


# ------------------------------------------------------------ Figura: iteración de prompts
def fig_prompts():
    r = pd.read_csv(os.path.join(RES, "resumen_pruebas.csv"), index_col=0)
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.2), gridspec_kw={"width_ratios": [1, 1.5]})
    x = np.arange(len(r))
    base = np.zeros(len(r))
    for t, color, nom in [("normal", NAVY, "Normales"), ("ambiguo", CYAN, "Ambiguos"), ("critico", "#8AA0C8", "Críticos")]:
        ax[0].bar(x, r[t], 0.6, bottom=base, color=color, label=nom, edgecolor="white")
        base += r[t].values
    for xi, v in zip(x, r.casos_aprobados):
        ax[0].text(xi, v + 0.25, f"{int(v)}/12", ha="center", fontsize=10, color=INK, fontweight="bold")
    ax[0].set_xticks(x, r.index)
    ax[0].set_ylim(0, 13.5)
    ax[0].set_ylabel("Casos que cumplen todos los criterios")
    ax[0].set_title("a) Casos aprobados por versión del prompt")
    ax[0].legend(frameon=False, fontsize=9, loc="upper left")
    ax[0].grid(axis="x", visible=False)
    crit = [f"AC{i}" for i in range(1, 10)]
    nombres = ["Cifras\ntrazables", "Intervalo", "Sin\npromesas", "Formato", "Respeta\nestado", "Plazo\nconserv.", "Regulación", "Sin\nsupuestos", "Responde\nnota"]
    m = r[crit].values
    im = ax[1].imshow(m, cmap="Blues", vmin=0, vmax=100, aspect="auto")
    for i in range(m.shape[0]):
        for j in range(m.shape[1]):
            ax[1].text(j, i, f"{int(m[i, j])}", ha="center", va="center", fontsize=9, color="white" if m[i, j] > 60 else INK)
    ax[1].set_xticks(range(len(crit)), nombres, fontsize=8.5)
    ax[1].set_yticks(range(len(r)), r.index)
    ax[1].grid(False)
    ax[1].set_title("b) Porcentaje de salidas que cumple cada criterio de aceptación")
    fig.tight_layout()
    guardar(fig, "fig_prompts.png")


# ------------------------------------------------------------ Figura: importancia y validación externa (anexo)
def fig_anexo_modelo():
    imp = pd.read_csv(os.path.join(RES, "importancia_variables.csv"))
    cm = pd.read_csv(os.path.join(RES, "cmap_predicciones.csv"))
    nombres = {"energia_cinetica_km": "Energía cinética por km", "pct_detenido": "Tiempo detenido", "desnivel_pos_km": "Subida acumulada por km",
               "cilindrada_l": "Cilindrada", "km_dia": "Kilómetros por día", "acel_pos_media": "Aceleración media", "masa_kg": "Masa con carga",
               "pct_sobre_60": "Tiempo sobre 60 km/h", "detenciones_km": "Detenciones por km", "vel_mov_media": "Velocidad en movimiento", "vel_media": "Velocidad media"}
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.4))
    imp = imp.sort_values("importancia")
    ax[0].barh(range(len(imp)), imp.importancia.clip(lower=0), xerr=imp.de, color=NAVY, ecolor=MUTED)
    ax[0].set_yticks(range(len(imp)), [nombres[v] for v in imp.variable])
    ax[0].set_xlabel("Caída del R² al permutar la variable")
    ax[0].set_title("a) Importancia por permutación (modelo M3)")
    ax[0].grid(axis="y", visible=False)
    ax[1].errorbar(cm.ahorro_base, cm.pred_jornada, yerr=cm.q, fmt="o", ms=4, color=CYAN, ecolor="#9FB0D0", elinewidth=0.8)
    lim = [0, 28]
    ax[1].plot(lim, lim, color=MUTED, lw=1)
    ax[1].set_xlim(lim)
    ax[1].set_ylim(lim)
    ax[1].set_xlabel("Ahorro simulado en la jornada real (%)")
    ax[1].set_ylabel("Predicción del modelo entrenado solo con datos sintéticos (%)")
    ax[1].set_title("b) Validación externa en 45 jornadas reales de Chicago:\nerror medio de 2 pp, pero el intervalo cubre solo 33%")
    fig.tight_layout()
    guardar(fig, "fig_anexo_modelo.png")


if __name__ == "__main__":
    os.makedirs(FIG, exist_ok=True)
    fig_simulador()
    fig_distribucion()
    fig_modelo()
    fig_prompts()
    fig_anexo_modelo()
    print("listo")
