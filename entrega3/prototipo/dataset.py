"""
Construcción de los datos de conducción del prototipo.

1) Jornadas reales secundarias: inventario de viajes con GPS de Chicago (CMAP, 2007),
   distribuido con FASTSim (NREL, 2026). Real, pero no chileno.
2) Biblioteca de microviajes: tramos entre dos detenciones extraídos de las jornadas
   CMAP y de ciclos estándar. Las detenciones de más de 180 s se tratan como
   estacionamiento y se excluyen (corrige una limitación de la Entrega 2).
3) Jornadas sintéticas de Santiago: concatenación de microviajes según el perfil de
   uso (colectivo, aplicación, particular), calibrada con el TomTom Traffic Index 2025
   para Santiago (18,5 km/h en hora punta; 65,3 km/h en autopista). SINTÉTICO.

Cada conductor sintético tiene dos semanas de cinco jornadas: la semana 1 simula el
registro de diagnóstico y la semana 2 el uso futuro que el estimador debe predecir.
"""
import glob
import json
import os

import numpy as np
import pandas as pd

from sim import ESCENARIOS, Vehiculo, simular

AQUI = os.path.dirname(os.path.abspath(__file__))
CICLOS = os.path.join(AQUI, "datos", "fastsim_cycles")
RES = os.path.join(AQUI, "resultados")
MPH = 0.44704
PARADA_MAX_S = 180
SEMILLA = 20261004


# ---------------------------------------------------------------- lectura
def jornadas_cmap(km_min=5.0):
    """Lista de (id_vehiculo, fecha, velocidad m/s) con huecos de registro eliminados."""
    out = []
    for f in sorted(glob.glob(os.path.join(CICLOS, "cmap_subset", "*", "*.csv"))):
        if f.endswith("trips.csv"):
            continue
        d = pd.read_csv(f)
        v = d["speed_mph"].fillna(0).values * MPH
        if v.sum() / 1000 < km_min:
            continue
        veh = os.path.basename(os.path.dirname(f))
        out.append((veh, os.path.basename(f)[:-4], v))
    return out


def ciclo_estandar(nombre):
    d = pd.read_csv(os.path.join(CICLOS, nombre + ".csv"))
    return d.iloc[:, 1].values.astype(float)


# ---------------------------------------------------------------- microviajes
def cortar_paradas(v, umbral=0.3, max_s=PARADA_MAX_S):
    """Recorta detenciones largas (estacionamiento) a cero y las largas de tránsito a max_s."""
    parado = v < umbral
    out = []
    i = 0
    n = len(v)
    while i < n:
        if parado[i]:
            j = i
            while j < n and parado[j]:
                j += 1
            largo = j - i
            if largo <= max_s:
                out.append(np.zeros(largo))
            else:
                out.append(np.zeros(min(30, largo)))  # estacionamiento: se deja un ralentí corto
            i = j
        else:
            j = i
            while j < n and not parado[j]:
                j += 1
            out.append(v[i:j])
            i = j
    return np.concatenate(out) if out else v


def microviajes(v, umbral=0.3):
    """Divide en microviajes: detención previa + tramo en movimiento hasta la siguiente."""
    v = cortar_paradas(v, umbral)
    parado = v < umbral
    cortes = [0]
    for i in range(1, len(v)):
        if parado[i - 1] and not parado[i]:
            cortes.append(i)
    cortes.append(len(v))
    out = []
    for a, b in zip(cortes[:-1], cortes[1:]):
        seg = v[a:b]
        km = seg.sum() / 1000
        if km < 0.05:
            continue
        out.append(seg)
    return out


def biblioteca():
    mv = []
    for veh, fecha, v in jornadas_cmap(km_min=1.0):
        for s in microviajes(v):
            mv.append(("cmap", s))
    for nombre in ["udds", "wltc_low_3", "wltc_medium_3b", "wltc_high_3b", "wltc_extrahigh_3", "hwfet", "us06"]:
        for s in microviajes(ciclo_estandar(nombre)):
            mv.append((nombre, s))
    filas = []
    for k, (fuente, s) in enumerate(mv):
        km = s.sum() / 1000
        vm = km / (len(s) / 3600)
        filas.append({"id": k, "fuente": fuente, "km": km, "seg": len(s), "vel_media": vm,
                      "vel_max": s.max() * 3.6})
    tab = pd.DataFrame(filas)
    tab["tipo"] = pd.cut(tab["vel_media"], [0, 12, 25, 40, 60, 200],
                         labels=["congestion", "urbano_lento", "urbano_fluido", "arterial", "autopista"])
    return tab, [s for _, s in mv]


# ---------------------------------------------------------------- perfiles sintéticos
PERFILES = {
    # km diarios (TIG: 150 a 250 km en colectivos y aplicaciones); proporción del TIEMPO en
    # autopista; nivel de congestión de la operación (0 = valle, 1 = punta permanente)
    "colectivo":  {"km": (150, 250), "autopista": (0.00, 0.05), "congestion": (0.50, 0.90),
                   "paradas_extra_km": (0.6, 1.4)},
    "aplicacion": {"km": (120, 250), "autopista": (0.05, 0.20), "congestion": (0.40, 0.80),
                   "paradas_extra_km": (0.0, 0.2)},
    "particular": {"km": (50, 120),  "autopista": (0.08, 0.25), "congestion": (0.30, 0.80),
                   "paradas_extra_km": (0.0, 0.1)},
}


def pesos_tipo(congestion, autopista):
    """Proporción del TIEMPO de conducción en cada tipo de microviaje."""
    urb = 1 - autopista
    c = congestion
    w = np.array([
        urb * (0.05 + 0.35 * c),          # congestion
        urb * (0.20 + 0.25 * c),          # urbano_lento
        urb * (0.40 - 0.30 * c),          # urbano_fluido
        urb * (0.35 - 0.30 * c),          # arterial
        autopista,                         # autopista
    ])
    w = np.clip(w, 0.001, None)
    return w / w.sum()


TIPOS = ["congestion", "urbano_lento", "urbano_fluido", "arterial", "autopista"]


def insertar_paradas(v, paradas_km, rng):
    """Paradas cortas de subida y bajada de pasajeros (colectivos): desaceleración a cero,
    detención de 5 a 20 s y nueva aceleración, insertadas en tramos bajo 50 km/h."""
    km = v.sum() / 1000
    n = rng.poisson(paradas_km * km)
    if n == 0:
        return v
    v = v.copy()
    cand = np.where((v > 4) & (v < 14))[0]
    if len(cand) == 0:
        return v
    pos = np.sort(rng.choice(cand, size=min(n, len(cand) // 40 + 1), replace=False))
    trozos, ult = [], 0
    for p in pos:
        if p - ult < 60:
            continue
        v0 = v[p]
        t_fren = max(int(v0 / 1.5), 2)
        t_acel = max(int(v0 / 1.2), 2)
        fren = np.linspace(v0, 0, t_fren + 1)[1:]
        stop = np.zeros(rng.integers(5, 21))
        acel = np.linspace(0, v0, t_acel + 1)[1:]
        trozos += [v[ult:p], fren, stop, acel]
        ult = p
    trozos.append(v[ult:])
    return np.concatenate(trozos)


RELIEVE = {
    # desnivel de la ruta entre su punto bajo y su punto alto (m). Santiago se ubica en torno a
    # 520 msnm y su piedemonte urbanizado llega a 800 a 1.000 msnm (Romero & Vásquez, 2005)
    "plano": (0.45, (5, 40)),
    "intermedio": (0.35, (60, 160)),
    "piedemonte": (0.20, (160, 300)),
}


def pendiente_ruta(v, desnivel_m, largo_km, rng):
    """Perfil de altura según la distancia recorrida: ida y vuelta entre el punto bajo y el alto
    de la ruta, más lomas locales. Devuelve la pendiente (fracción) en cada segundo."""
    d = np.cumsum(v) / 1000.0                      # km
    z = desnivel_m / 2 * (1 - np.cos(2 * np.pi * d / largo_km))
    for _ in range(2):
        amp, lam, fase = rng.uniform(0.5, 3.0), rng.uniform(1.0, 4.0), rng.uniform(0, 2 * np.pi)
        z = z + amp * np.sin(2 * np.pi * d / lam + fase)
    dz = np.diff(z, prepend=z[0])
    dd = np.maximum(v, 0.1)
    p = np.where(v > 0.3, dz / dd, 0.0)
    return np.clip(p, -0.08, 0.08)


def jornada_sintetica(tab, mvs, km_obj, congestion, autopista, paradas_km, estilo, rng):
    w_tiempo = pesos_tipo(congestion, autopista)
    usable = tab[tab["km"] <= 25]
    idx_por_tipo = {t: usable.index[usable["tipo"] == t].values for t in TIPOS}
    seg_medio = np.array([usable.loc[idx_por_tipo[t], "seg"].mean() for t in TIPOS])
    p = w_tiempo / seg_medio            # así la proporción esperada de tiempo es w_tiempo
    p = p / p.sum()
    partes, km = [], 0.0
    while km < km_obj:
        t = TIPOS[rng.choice(5, p=p)]
        i = rng.choice(idx_por_tipo[t])
        s = mvs[i] * estilo
        partes.append(s)
        km += s.sum() / 1000
    v = np.concatenate(partes)
    return insertar_paradas(v, paradas_km, rng)


def conductores_sinteticos(n_por_perfil=100, jornadas=10, seed=SEMILLA):
    rng = np.random.default_rng(seed)
    tab, mvs = biblioteca()
    filas, trazas = [], {}
    cid = 0
    for perfil, p in PERFILES.items():
        for _ in range(n_por_perfil):
            cid += 1
            km_c = rng.uniform(*p["km"])
            aut_c = rng.uniform(*p["autopista"])
            con_c = rng.uniform(*p["congestion"])
            par_c = rng.uniform(*p["paradas_extra_km"])
            estilo = rng.uniform(0.94, 1.06)  # conductor más o menos enérgico
            # vehículo del segmento: sedanes compactos y medianos de 1.000 a 1.350 kg en orden
            # de marcha, más conductor y carga (pasajeros en colectivos y aplicaciones)
            zonas = list(RELIEVE)
            zona = zonas[rng.choice(3, p=[RELIEVE[z][0] for z in zonas])]
            desnivel = rng.uniform(*RELIEVE[zona][1])
            largo_ruta = rng.uniform(16, 30) if perfil == "colectivo" else rng.uniform(15, 45)
            carga = {"colectivo": 190, "aplicacion": 150, "particular": 110}[perfil]
            masa_om = rng.uniform(1000, 1350)
            cil = 1.2 + (masa_om - 1000) / 350 * 0.8 + rng.normal(0, 0.1)   # litros
            vehc = {"masa_kg": masa_om + 75 + carga,
                    "cda_m2": rng.uniform(0.60, 0.72),
                    "ralenti_l_h": 0.40 * cil + rng.normal(0, 0.03),
                    "p0_kw": 6.5 * cil,
                    "cilindrada_l": cil}
            for j in range(jornadas):
                km_d = km_c * rng.uniform(0.85, 1.15)
                con_d = float(np.clip(con_c + rng.normal(0, 0.08), 0, 1))
                aut_d = float(np.clip(aut_c + rng.normal(0, 0.04), 0, 0.9))
                v = jornada_sintetica(tab, mvs, km_d, con_d, aut_d, par_c, estilo, rng)
                aux_d = rng.uniform(0.4, 1.6)   # aire acondicionado y consumos eléctricos: no observado
                jid = f"S{cid:03d}-{j+1:02d}"
                trazas[jid] = (v, pendiente_ruta(v, desnivel, largo_ruta, rng))
                filas.append({"jornada": jid, "conductor": f"S{cid:03d}", "perfil": perfil,
                              "semana": 1 if j < jornadas // 2 else 2, "dia": j + 1,
                              "km_declarado_base": km_c, "autopista_real": aut_c,
                              "congestion_real": con_c, "paradas_extra_km": par_c,
                              "estilo": estilo, "aux_kw": aux_d, "zona_relieve": zona,
                              "desnivel_ruta_m": desnivel, **vehc, "origen": "sintetico"})
    return pd.DataFrame(filas), trazas, tab


# ---------------------------------------------------------------- variables
def variables(v, pend=None):
    """Variables del diccionario de la Entrega 2 (Tabla G3), calculadas desde la velocidad
    y la altitud del registro GPS."""
    v = np.asarray(v, float)
    pend = np.zeros_like(v) if pend is None else np.asarray(pend, float)
    subida = (pend * v)[pend > 0].sum()
    km = v.sum() / 1000
    horas = len(v) / 3600
    parado = v < 0.3
    inicios = np.sum(parado[1:] & ~parado[:-1])
    mov = ~parado
    a = np.diff(v, prepend=v[0])
    vel_mov = (v[mov].mean() * 3.6) if mov.any() else 0.0
    # energía cinética específica: suma de aumentos de v^2/2 por km (proxy de frenado recuperable)
    dv2 = np.diff(v ** 2) / 2
    ke = dv2[dv2 > 0].sum() / km / 1000 if km > 0 else 0.0
    return {
        "km_dia": km,
        "horas_dia": horas,
        "detenciones_km": inicios / km if km > 0 else 0.0,
        "vel_mov_media": vel_mov,
        "vel_media": km / horas if horas > 0 else 0.0,
        "pct_detenido": 100 * parado.mean(),
        "acel_pos_media": a[a > 0.1].mean() if (a > 0.1).any() else 0.0,
        "pct_sobre_60": 100 * (v * 3.6 > 60).mean(),
        "energia_cinetica_km": ke,
        "desnivel_pos_km": subida / km / 1000 * 1000 if km > 0 else 0.0,   # m de subida por km
    }


def vehiculo_de(r):
    campos = ["masa_kg", "cda_m2", "ralenti_l_h", "p0_kw", "aux_kw"]
    kw = {c: float(r[c]) for c in campos if c in r and pd.notna(r[c])}
    return Vehiculo(**kw)


def simular_tabla(meta, trazas, escenarios=("conservador", "base", "optimista")):
    filas = []
    for _, r in meta.iterrows():
        veh = vehiculo_de(r)
        tr = trazas[r["jornada"]]
        v, pend = tr if isinstance(tr, tuple) else (tr, None)
        fila = dict(r)
        fila.update(variables(v, pend))
        for esc in escenarios:
            s = simular(v, veh, ESCENARIOS[esc], pend)
            fila[f"ahorro_{esc}"] = s["ahorro_pct"]
            if esc == "base":
                fila["litros_base"] = s["litros_base"]
                fila["kml_base"] = s["kml_base"]
                fila["e_freno_kwh"] = s["e_freno_kwh"]
                fila["e_regen_kwh"] = s["e_regen_kwh"]
                fila["e_asist_kwh"] = s["e_asist_kwh"]
                fila["pct_energia_frenos"] = 100 * s["e_freno_kwh"] / s["e_trac_kwh"]
        filas.append(fila)
    return pd.DataFrame(filas)


def main():
    os.makedirs(RES, exist_ok=True)
    # jornadas reales CMAP
    reales = jornadas_cmap(km_min=5.0)
    meta_r = pd.DataFrame([{"jornada": f"C-{veh}-{fecha}", "conductor": veh, "perfil": "cmap_real",
                            "semana": 0, "dia": 0, "origen": "real_secundario"}
                           for veh, fecha, v in reales])
    meta_r["masa_kg"], meta_r["cilindrada_l"] = 1300.0, 1.55
    trazas_r = {f"C-{veh}-{fecha}": cortar_paradas(v) for veh, fecha, v in reales}
    tab_r = simular_tabla(meta_r, trazas_r)
    tab_r.to_csv(os.path.join(RES, "jornadas_cmap.csv"), index=False)
    print("CMAP:", len(tab_r), "jornadas,", tab_r.conductor.nunique(), "vehículos,",
          round(tab_r.km_dia.sum()), "km")
    # ciclos estándar
    meta_c = pd.DataFrame([{"jornada": c, "conductor": c, "perfil": "ciclo", "semana": 0, "dia": 0,
                            "origen": "ciclo_estandar"}
                           for c in ["wltc_low_3", "wltc_medium_3b", "udds", "us06", "wltc_high_3b",
                                     "wltc_extrahigh_3", "hwfet", "wltc_3b"]])
    trazas_c = {c: ciclo_estandar(c) for c in meta_c.jornada}
    simular_tabla(meta_c, trazas_c).to_csv(os.path.join(RES, "ciclos_estandar.csv"), index=False)
    # sintéticas
    meta_s, trazas_s, tab = conductores_sinteticos()
    tab.drop(columns=[]).to_csv(os.path.join(RES, "biblioteca_microviajes.csv"), index=False)
    tab_s = simular_tabla(meta_s, trazas_s)
    tab_s.to_csv(os.path.join(RES, "jornadas_sinteticas.csv"), index=False)
    print("Sintéticas:", len(tab_s), "jornadas,", tab_s.conductor.nunique(), "conductores")
    print(tab_s.groupby("perfil")[["km_dia", "vel_media", "vel_mov_media", "detenciones_km",
                                     "pct_detenido", "kml_base", "ahorro_conservador",
                                     "ahorro_base", "ahorro_optimista"]].describe().T.round(2).to_string())
    # guardar trazas de tres jornadas ejemplo para el prototipo
    ej = {}
    for perfil in PERFILES:
        jid = meta_s[meta_s.perfil == perfil].jornada.iloc[0]
        ej[perfil] = {"kmh": np.round(trazas_s[jid][0] * 3.6, 1).tolist(),
                      "pendiente_pct": np.round(trazas_s[jid][1] * 100, 2).tolist()}
    with open(os.path.join(RES, "trazas_ejemplo.json"), "w") as f:
        json.dump(ej, f)


if __name__ == "__main__":
    main()
