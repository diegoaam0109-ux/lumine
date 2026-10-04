"""
Análisis para el informe técnico-matemático: ejemplo resuelto, balance de energía, sensibilidad
del kit, estadísticos por perfil, curvas de recuperación y tornado de sensibilidad.
Genera figuras tec_*.png y resultados/tecnico.json.
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from dataset import conductores_sinteticos, vehiculo_de
from estimador import DIAS_SEMANA, PRECIO_BENCINA, PRECIO_KIT, SEMANAS_MES
from figuras import CYAN, GRID, INK, MUTED, NAVY, COL, NOMBRE, coma, guardar
from sim import ESCENARIOS, LHV_KWH_POR_L, G, RHO, Kit, Vehiculo, simular

AQUI = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(AQUI, "resultados")
OUT = {}


# ------------------------------------------------------------------ 1. ejemplo resuelto
def detalle(v, veh=Vehiculo(), k=ESCENARIOS["base"], pend=None):
    """Versión en Python puro del simulador que guarda cada segundo (para el ejemplo)."""
    v = np.asarray(v, float); n = len(v)
    a = np.zeros(n); a[:-1] = np.diff(v)
    pend = np.zeros(n) if pend is None else pend
    ral = veh.ralenti_l_h * LHV_KWH_POR_L
    filas = []
    for con_kit in (False, True):
        m = veh.masa_kg + (k.masa_kg if con_kit else 0)
        soc = k.soc_inicial * k.bateria_kwh
        for i in range(n):
            vi = v[i]
            f = m * veh.factor_inercia * a[i] + (m * G * veh.crr if vi > 0.1 else 0) + 0.5 * RHO * veh.cda_m2 * vi ** 2 + (m * G * pend[i] if vi > 0.1 else 0)
            pr = f * vi / 1000
            preg = pas = 0.0
            if con_kit and vi > 0.1:
                soc = max(soc - k.parasito_w / 1000 / 3600, 0)
                if pr < 0 and vi * 3.6 > k.v_min_regen_kmh:
                    prec = min(-pr, k.p_motor_kw, m * k.desacel_max * vi / 1000)
                    preg = min(prec * k.eta_motor * k.eta_bateria, (k.bateria_kwh - soc) * 3600)
                    soc += preg / 3600
                elif pr > 0 and vi * 3.6 < k.v_max_asist_kmh and soc > 0:
                    pas = min(pr, k.p_motor_kw, soc * 3600 * k.eta_bateria * k.eta_motor)
                    soc -= pas / (k.eta_bateria * k.eta_motor) / 3600
            if vi < 0.3:
                pc = ral
            elif pr < 0:
                pc = 0 if vi * 3.6 > veh.v_corte_kmh else ral
            else:
                pc = max(veh.p0_kw + ((pr - pas) / veh.eta_trans + veh.aux_kw) / veh.e_marginal, ral)
            filas.append({"t": i, "kit": con_kit, "v_kmh": vi * 3.6, "p_rueda_kw": pr, "p_regen_kw": preg, "p_asist_kw": pas,
                          "soc_kwh": soc, "p_comb_kw": pc})
    return pd.DataFrame(filas)


def ejemplo():
    # un ciclo de colectivo: detenido 10 s, acelera a 50 km/h en 10 s, avanza 20 s, frena en 8 s, detenido 10 s
    v = np.concatenate([np.zeros(10), np.linspace(0, 50 / 3.6, 11)[1:], np.full(20, 50 / 3.6), np.linspace(50 / 3.6, 0, 9)[1:], np.zeros(10)])
    v = np.tile(v, 3)
    d = detalle(v)
    b, k = d[~d.kit].reset_index(drop=True), d[d.kit].reset_index(drop=True)
    m = 1300
    ek = 0.5 * m * 1.03 * (50 / 3.6) ** 2 / 3.6e6
    r = {"masa": m, "v": 50, "e_cinetica_kwh": ek, "e_cinetica_wh": ek * 1000,
         "e_freno_ciclo_wh": -b[b.p_rueda_kw < 0].p_rueda_kw.sum() / 3.6 / 3,
         "e_regen_ciclo_wh": k.p_regen_kw.sum() / 3.6 / 3, "e_asist_ciclo_wh": k.p_asist_kw.sum() / 3.6 / 3,
         "comb_base_ml": b.p_comb_kw.sum() / 3600 / LHV_KWH_POR_L * 1000 / 3,
         "comb_kit_ml": k.p_comb_kw.sum() / 3600 / LHV_KWH_POR_L * 1000 / 3}
    kit = ESCENARIOS["base"]; veh = Vehiculo()
    litros_por_kwh = kit.eta_bateria * kit.eta_motor / veh.eta_trans / veh.e_marginal / LHV_KWH_POR_L
    delta = k.soc_kwh.iloc[-1] - kit.soc_inicial * kit.bateria_kwh
    r["delta_soc_wh"] = delta * 1000
    r["comb_kit_ml"] -= delta * litros_por_kwh * 1000 / 3   # corrección de balance de carga
    r["ahorro_pct"] = 100 * (r["comb_base_ml"] - r["comb_kit_ml"]) / r["comb_base_ml"]
    r["p_pico_frenado_kw"] = -b.p_rueda_kw.min()
    r["p_pico_tracc_kw"] = b.p_rueda_kw.max()
    OUT["ejemplo"] = r
    # figura
    fig, ax = plt.subplots(3, 1, figsize=(12.5, 6.6), sharex=True, gridspec_kw={"height_ratios": [1, 1.3, 1]})
    t = k.t
    ax[0].plot(t, k.v_kmh, color=INK, lw=1.6); ax[0].set_ylabel("km/h"); ax[0].set_title("a) Velocidad: tres ciclos de partida, avance y detención", loc="left")
    ax[1].fill_between(t, 0, b.p_rueda_kw, where=b.p_rueda_kw > 0, color="#B8C4DA", label="Potencia de tracción en la rueda")
    ax[1].fill_between(t, 0, b.p_rueda_kw, where=b.p_rueda_kw < 0, color="#E8B4B4", label="Potencia de frenado en la rueda")
    ax[1].plot(t, -k.p_regen_kw, color=CYAN, lw=1.8, label="Energía que entra a la batería (negativo)")
    ax[1].plot(t, k.p_asist_kw, color=NAVY, lw=1.8, label="Asistencia del motor trasero")
    ax[1].axhline(0, color=MUTED, lw=.8); ax[1].set_ylabel("kW"); ax[1].legend(frameon=False, fontsize=8.5, ncol=2, loc="upper right")
    ax[1].set_title("b) El frenado alimenta la batería y la energía vuelve en la siguiente salida", loc="left")
    ax[2].plot(t, b.p_comb_kw, color="#9AA3B2", lw=1.4, label="Combustible sin kit")
    ax[2].plot(t, k.p_comb_kw, color=NAVY, lw=1.6, label="Combustible con kit")
    ax[2].set_ylabel("kW de bencina"); ax[2].set_xlabel("Segundos"); ax[2].legend(frameon=False, fontsize=8.5, loc="upper right")
    ax[2].set_title(f"c) Consumo: {coma(r['ahorro_pct'])}% menos en este ciclo; en detención el motor sigue en ralentí", loc="left")
    fig.tight_layout(); guardar(fig, "tec_ejemplo.png")


# ------------------------------------------------------------------ 2. balance de energía
def balance():
    meta, trazas, _ = conductores_sinteticos()
    filas = []
    for perfil in ["colectivo", "aplicacion", "particular"]:
        ids = meta[(meta.perfil == perfil) & (meta.semana == 1)].jornada.iloc[:60]
        acum = dict(ralenti=0, fijas=0, aux=0, traccion=0, total=0, ahorro=0, regen=0, freno=0)
        for jid in ids:
            r = meta[meta.jornada == jid].iloc[0]
            veh = vehiculo_de(r)
            v, pe = trazas[jid]
            a = np.zeros_like(v); a[:-1] = np.diff(v)
            m = veh.masa_kg
            pr = (m * veh.factor_inercia * a + np.where(v > .1, m * G * veh.crr, 0) + .5 * RHO * veh.cda_m2 * v ** 2 + np.where(v > .1, m * G * pe, 0)) * v / 1000
            ral = veh.ralenti_l_h * LHV_KWH_POR_L
            parado = v < .3
            corte = (pr < 0) & (v * 3.6 > veh.v_corte_kmh) & ~parado
            ralenti = parado | ((pr < 0) & ~corte)
            carga = ~parado & (pr >= 0)
            pc_carga = np.maximum(veh.p0_kw + (pr / veh.eta_trans + veh.aux_kw) / veh.e_marginal, ral)
            acum["ralenti"] += ral * ralenti.sum() / 3600
            acum["fijas"] += veh.p0_kw * carga.sum() / 3600
            acum["aux"] += veh.aux_kw / veh.e_marginal * carga.sum() / 3600
            acum["traccion"] += (pr[carga] / veh.eta_trans / veh.e_marginal).sum() / 3600
            acum["total"] += (ral * ralenti.sum() + pc_carga[carga].sum()) / 3600
            s = simular(v, veh, ESCENARIOS["base"], pe)
            acum["ahorro"] += s["litros_base"] * s["ahorro_pct"] / 100 * LHV_KWH_POR_L
            acum["regen"] += s["e_regen_kwh"]; acum["freno"] += s["e_freno_kwh"]
        tot = acum["total"]
        filas.append({"perfil": perfil, **{k: 100 * acum[k] / tot for k in ["ralenti", "fijas", "aux", "traccion", "ahorro"]},
                      "regen_sobre_freno": 100 * acum["regen"] / acum["freno"]})
    b = pd.DataFrame(filas)
    OUT["balance"] = b.round(2).to_dict("records")
    fig, ax = plt.subplots(figsize=(12.5, 3.6))
    partes = [("ralenti", "Ralentí (detenido o bajo 15 km/h)", "#C9CFDA"), ("fijas", "Pérdidas fijas del motor en marcha", "#9FB0D0"),
              ("aux", "Consumos auxiliares", "#D9DEE7"), ("traccion", "Tracción en las ruedas", NAVY)]
    y = np.arange(3)[::-1]
    for i, (_, r) in enumerate(b.iterrows()):
        izq = 0
        for k, nom, c in partes:
            ax.barh(y[i], r[k], left=izq, color=c, edgecolor="white", label=nom if i == 0 else None)
            if r[k] > 6:
                ax.text(izq + r[k] / 2, y[i], coma(r[k], 0) + "%", ha="center", va="center", fontsize=9, color="white" if k == "traccion" else INK)
            izq += r[k]
        ax.text(101, y[i], f"ahorro con kit: {coma(r['ahorro'])}% del combustible\n(regenera {coma(r['regen_sobre_freno'], 0)}% de la energía de frenado)", va="center", fontsize=9, color=INK)
    ax.set_yticks(y, [NOMBRE[p] for p in b.perfil]); ax.set_xlim(0, 150); ax.set_xticks([0, 20, 40, 60, 80, 100])
    ax.set_xlabel("Distribución del combustible de una jornada sin kit (%)"); ax.grid(axis="y", visible=False)
    ax.set_title("¿En qué se va la bencina? Solo la parte de tracción puede reducirse con el kit; el ralentí y las pérdidas fijas no", loc="left")
    ax.legend(frameon=False, fontsize=8.5, ncol=4, loc="lower left", bbox_to_anchor=(0, -0.42))
    fig.tight_layout(); guardar(fig, "tec_balance.png")


# ------------------------------------------------------------------ 3. sensibilidad del kit
def sensibilidad_kit():
    meta, trazas, _ = conductores_sinteticos()
    ids = meta[(meta.perfil == "colectivo") & (meta.semana == 1)].jornada.iloc[::10][:30]
    base = ESCENARIOS["base"]
    def media(**kw):
        p = dict(nombre="g", p_motor_kw=base.p_motor_kw, bateria_kwh=base.bateria_kwh, eta_motor=base.eta_motor, eta_bateria=base.eta_bateria,
                 desacel_max=base.desacel_max, v_min_regen_kmh=base.v_min_regen_kmh, v_max_asist_kmh=base.v_max_asist_kmh, masa_kg=base.masa_kg,
                 parasito_w=base.parasito_w)
        p.update(kw); k = Kit(**p); vals = []
        for jid in ids:
            r = meta[meta.jornada == jid].iloc[0]; v, pe = trazas[jid]
            vals.append(simular(v, vehiculo_de(r), k, pe)["ahorro_pct"])
        return float(np.mean(vals))
    P = [8, 12, 15, 19, 23, 27, 31, 35]
    A = [1.0, 1.5, 2.0, 2.5, 3.0]
    M = np.array([[media(p_motor_kw=p, desacel_max=a) for p in P] for a in A])
    E = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0]
    bat = [media(bateria_kwh=e) for e in E]
    ETA = [0.80, 0.85, 0.90, 0.95]
    eta = [media(eta_motor=x) for x in ETA]
    OUT["grid_kit"] = {"P_kw": P, "desacel": A, "ahorro": np.round(M, 2).tolist(), "bateria_kwh": E, "ahorro_bateria": np.round(bat, 2).tolist(),
                       "eta_motor": ETA, "ahorro_eta": np.round(eta, 2).tolist()}
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.3), gridspec_kw={"width_ratios": [1.7, 1]})
    im = ax[0].imshow(M, cmap="Blues", aspect="auto", origin="lower", vmin=M.min() - 2, vmax=M.max())
    for i in range(len(A)):
        for j in range(len(P)):
            ax[0].text(j, i, coma(M[i, j]), ha="center", va="center", fontsize=9, color="white" if M[i, j] > (M.min() + M.max()) / 2 else INK,
                       fontweight="bold" if P[j] == 23 and A[i] == 2.5 else None)
    ax[0].set_xticks(range(len(P)), [f"{p}" for p in P]); ax[0].set_yticks(range(len(A)), [coma(a) for a in A])
    ax[0].set_xlabel("Potencia del motor eléctrico trasero (kW)"); ax[0].set_ylabel("Desaceleración máxima del eje trasero (m/s²)"); ax[0].grid(False)
    ax[0].set_title("a) Ahorro medio de 30 jornadas de colectivo (%):\nla potencia rinde cada vez menos sobre 23 kW", loc="left")
    ax[1].plot(E, bat, "o-", color=NAVY, label="Energía de la batería (kWh)")
    ax2 = ax[1].twiny(); ax2.plot(ETA, eta, "s--", color=CYAN, label="Eficiencia del motor e inversor"); ax2.set_xlabel("Eficiencia del motor e inversor", color=CYAN)
    ax[1].set_xlabel("Energía útil de la batería (kWh)"); ax[1].set_ylabel("Ahorro medio (%)"); ax[1].set_ylim(15, 22)
    ax[1].set_title("b) La batería casi no importa;\nla eficiencia sí", loc="left", y=1.12)
    fig.tight_layout(); guardar(fig, "tec_grilla_kit.png")


# ------------------------------------------------------------------ 4. estadísticos
def estadisticos():
    t = pd.read_csv(os.path.join(RES, "conductores.csv"))
    js = pd.read_csv(os.path.join(RES, "jornadas_sinteticas.csv"))
    cm = pd.read_csv(os.path.join(RES, "jornadas_cmap.csv"))
    filas = []
    for p in ["colectivo", "aplicacion", "particular"]:
        for esc, col in [("conservador", "y_conservador"), ("referencia", "y_base"), ("ampliado", "y_optimista")]:
            x = t[t.perfil == p][col]
            filas.append({"perfil": NOMBRE[p], "escenario": esc, "n": len(x), "media": x.mean(), "de": x.std(), "cv": 100 * x.std() / x.mean(),
                          "min": x.min(), "p10": x.quantile(.1), "p25": x.quantile(.25), "mediana": x.median(), "p75": x.quantile(.75), "p90": x.quantile(.9), "max": x.max(),
                          "pct_20": 100 * (x >= 20).mean(), "pct_25": 100 * (x >= 25).mean()})
    x = cm.ahorro_base
    filas.append({"perfil": "Chicago real (jornadas)", "escenario": "referencia", "n": len(x), "media": x.mean(), "de": x.std(), "cv": 100 * x.std() / x.mean(),
                  "min": x.min(), "p10": x.quantile(.1), "p25": x.quantile(.25), "mediana": x.median(), "p75": x.quantile(.75), "p90": x.quantile(.9), "max": x.max(),
                  "pct_20": 100 * (x >= 20).mean(), "pct_25": 100 * (x >= 25).mean()})
    est = pd.DataFrame(filas); est.to_csv(os.path.join(RES, "estadisticos_ahorro.csv"), index=False)
    OUT["estadisticos"] = est.round(2).to_dict("records")
    vars_ = ["km_dia", "vel_media", "vel_mov_media", "detenciones_km", "pct_detenido", "acel_pos_media", "pct_sobre_60", "energia_cinetica_km", "desnivel_pos_km", "kml_base", "pct_energia_frenos"]
    perf = js.groupby("perfil")[vars_].agg(["mean", "median"]).round(2)
    OUT["variables_perfil"] = {p: {v: [float(perf.loc[p, (v, "mean")]), float(perf.loc[p, (v, "median")])] for v in vars_} for p in perf.index}
    cor = js[vars_ + ["ahorro_base"]].corr(method="spearman")["ahorro_base"].drop("ahorro_base").sort_values()
    OUT["spearman"] = cor.round(3).to_dict()
    zona = js.groupby(["perfil", "zona_relieve"]).ahorro_base.mean().round(2)
    OUT["zona"] = {f"{a}|{b}": float(v) for (a, b), v in zona.items()}
    # dispersión con las dos variables más importantes
    fig, ax = plt.subplots(1, 2, figsize=(12.5, 4.4), sharey=True)
    for p in ["colectivo", "aplicacion", "particular"]:
        g = js[js.perfil == p].sample(400, random_state=1)
        ax[0].scatter(g.energia_cinetica_km, g.ahorro_base, s=8, alpha=.5, color=COL[p], label=NOMBRE[p])
        ax[1].scatter(g.pct_detenido, g.ahorro_base, s=8, alpha=.5, color=COL[p])
    ax[0].set_xlabel("Energía cinética por km (kJ/kg·km)"); ax[1].set_xlabel("Tiempo detenido (%)"); ax[0].set_ylabel("Ahorro de la jornada (%)")
    ax[0].set_title(f"a) Más energía para frenar, más ahorro (ρ de Spearman = {coma(cor['energia_cinetica_km'], 2)})", loc="left")
    ax[1].set_title(f"b) Tiempo detenido (ρ = {coma(cor['pct_detenido'], 2)})", loc="left")
    ax[0].legend(frameon=False, fontsize=9, markerscale=2)
    fig.tight_layout(); guardar(fig, "tec_dispersion.png")


# ------------------------------------------------------------------ 5. comercial: recuperación y tornado
def comercial():
    t = pd.read_csv(os.path.join(RES, "conductores.csv"))
    mod = json.load(open(os.path.join(AQUI, "app", "modelo.json")))
    q1, razon = mod["nivel1"]["q80"], mod["razon_escenarios"]["conservador"]
    km = np.arange(20, 321, 5)
    fig, ax = plt.subplots(figsize=(12.5, 4.6))
    eq = {}
    for p in ["colectivo", "aplicacion", "particular"]:
        a = t[t.perfil == p].y_base.median()
        cons = (a - q1) * razon
        mes = km * DIAS_SEMANA[p] * SEMANAS_MES / 10 * PRECIO_BENCINA * cons / 100
        ax.plot(km, PRECIO_KIT / mes, color=COL[p], lw=2.2, label=f"{NOMBRE[p]} (ahorro conservador {coma(cons)}%)")
        eq[p] = {"ahorro_ref": a, "ahorro_cons": cons,
                 "km_24": PRECIO_KIT / (24 * DIAS_SEMANA[p] * SEMANAS_MES / 10 * PRECIO_BENCINA * cons / 100),
                 "km_36": PRECIO_KIT / (36 * DIAS_SEMANA[p] * SEMANAS_MES / 10 * PRECIO_BENCINA * cons / 100),
                 "km_48": PRECIO_KIT / (48 * DIAS_SEMANA[p] * SEMANAS_MES / 10 * PRECIO_BENCINA * cons / 100)}
        ax.plot(eq[p]["km_48"], 48, "o", color=COL[p])
        ax.annotate(f"{eq[p]['km_48']:.0f} km/día", (eq[p]["km_48"], 48), textcoords="offset points", xytext=(6, 6), fontsize=8.5, color=COL[p])
    ax.axhline(48, color=MUTED, ls=":"); ax.text(318, 49.5, "48 meses: límite para recomendar", ha="right", fontsize=8.5, color=MUTED)
    ax.axhline(24, color=MUTED, ls=":", lw=.8); ax.text(318, 25.5, "24 meses", ha="right", fontsize=8.5, color=MUTED)
    ax.set_ylim(0, 120); ax.set_xlim(20, 320)
    ax.set_xlabel("Kilómetros por día"); ax.set_ylabel("Meses para recuperar la inversión")
    ax.set_title("Plazo de recuperación conservador según kilometraje (kit de $2.521.000, bencina a $1.459/L, 10 km/L)", loc="left")
    ax.legend(frameon=False, fontsize=9)
    fig.tight_layout(); guardar(fig, "tec_recuperacion.png")
    OUT["equilibrio"] = {p: {k: round(v, 2) for k, v in d.items()} for p, d in eq.items()}
    # tornado sobre el plazo del caso N1 (colectivo de 213 km)
    casos = {c["id"]: c for c in json.load(open(os.path.join(AQUI, "pruebas", "casos.json")))}
    s = casos["N1"]["salida_estimador"]
    km0, a0, lo0 = casos["N1"]["entrada"]["km_dia"], s["ahorro_pct"], s["intervalo_80"][0]
    def plazo(kmd=km0, dias=6, rend=10.0, precio=PRECIO_BENCINA, kit=PRECIO_KIT, lo=lo0):
        return kit / (kmd * dias * SEMANAS_MES / rend * precio * lo * razon / 100)
    base = plazo()
    var = [("Precio del kit ±20%", plazo(kit=PRECIO_KIT * .8), plazo(kit=PRECIO_KIT * 1.2)),
           ("Rendimiento 8 / 12 km/L", plazo(rend=8), plazo(rend=12)),
           ("Km por día ±20%", plazo(kmd=km0 * 1.2), plazo(kmd=km0 * .8)),
           ("Precio de la bencina ±15%", plazo(precio=PRECIO_BENCINA * 1.15), plazo(precio=PRECIO_BENCINA * .85)),
           ("Días por semana 7 / 5", plazo(dias=7), plazo(dias=5)),
           ("Ahorro ±1,4 pp (intervalo)", plazo(lo=lo0 + 1.4), plazo(lo=lo0 - 1.4))]
    var.sort(key=lambda x: abs(x[2] - x[1]))
    OUT["tornado"] = {"base": base, "filas": [[n, a, b] for n, a, b in var]}
    fig, ax = plt.subplots(figsize=(12.5, 3.8))
    for i, (n, a, b) in enumerate(var):
        ax.barh(i, a - base, left=base, color=CYAN); ax.barh(i, b - base, left=base, color=NAVY)
        ax.text(min(a, b) - .4, i, f"{min(a, b):.0f}", ha="right", va="center", fontsize=9); ax.text(max(a, b) + .4, i, f"{max(a, b):.0f}", va="center", fontsize=9)
    ax.axvline(base, color=INK, lw=1)
    ax.set_yticks(range(len(var)), [v[0] for v in var]); ax.grid(axis="y", visible=False)
    ax.set_xlabel("Meses para recuperar la inversión (escenario conservador)")
    ax.set_title(f"Sensibilidad del plazo para un colectivo de 213 km/día: base {base:.0f} meses. Celeste: caso favorable; azul: desfavorable", loc="left")
    fig.tight_layout(); guardar(fig, "tec_tornado.png")


if __name__ == "__main__":
    ejemplo()
    balance()
    sensibilidad_kit()
    estadisticos()
    comercial()
    json.dump(OUT, open(os.path.join(RES, "tecnico.json"), "w"), ensure_ascii=False, indent=1, default=float)
    print(json.dumps({k: OUT[k] for k in ["ejemplo", "balance", "equilibrio", "tornado"]}, ensure_ascii=False, indent=1, default=float)[:3500])
