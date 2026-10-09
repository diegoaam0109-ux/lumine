"""
Mejoras de validación del modelo para la Entrega 4 (respuesta a la revisión cruzada con
ChatGPT y DeepSeek). No modifica los resultados de la Entrega 3: escribe en resultados/e4/.

  1. Robustez entre particiones: 10 semillas de división 70/30 (DeepSeek #8).
  2. Modelos simples con las mismas 11 variables: lineal y Ridge (DeepSeek #10).
  3. Intervalo de M0c con residuos fuera de muestra, igual que los demás (DeepSeek #9).
  4. Importancia por permutación promediada en 10 particiones (DeepSeek #6).
  5. Curva de aprendizaje y número de árboles (DeepSeek #10).
  6. Validación externa CMAP:
       a) calibración con GroupKFold por conductor (ChatGPT; DeepSeek #2);
       b) misma unidad de análisis: conductor/vehículo en ambos lados (ChatGPT; DeepSeek #5);
       c) reajuste con calibración ponderada y por vehículo, contra líneas base
          "solo sintéticas" y "solo CMAP" (ChatGPT; DeepSeek #4 y #7).
  7. Transferencia a una población simulada distinta (DeepSeek #1).
"""
import json
import os

import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import GroupKFold, KFold, learning_curve, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

import dataset
from model import (ALFA, RES, SEMILLA, VARS_DECL, VARS_E2, VARS_GPS, ahorro_ponderado, gbm,
                   metricas, tabla_conductores)

SALIDA = os.path.join(RES, "e4")
SEMILLAS = [SEMILLA + k for k in range(10)]


def q_conforme(res, alfa=ALFA):
    n = len(res)
    return float(np.quantile(res, min(1, np.ceil((n + 1) * (1 - alfa)) / n)))


def ajustar(fabrica, X, y, w=None):
    m = fabrica()
    if w is None:
        m.fit(X, y)
    else:
        m.fit(X, y, sample_weight=w)
    return m


def conforme(fabrica, X, y, Xt, grupos=None, w=None, folds=10, seed=SEMILLA):
    """Predicción conforme con residuos fuera de muestra. Si hay grupos, las particiones
    son por conductor (GroupKFold); si hay pesos, se usan igual en cada partición y en el
    modelo final, para que los residuos representen al modelo que se entrega."""
    cv = GroupKFold(folds) if grupos is not None else KFold(folds, shuffle=True, random_state=seed)
    oof = np.empty(len(y))
    for a, b in cv.split(X, y, grupos):
        oof[b] = ajustar(fabrica, X[a], y[a], None if w is None else w[a]).predict(X[b])
    m = ajustar(fabrica, X, y, w)
    return m.predict(Xt), oof, m


def lineal():
    return LinearRegression()


def ridge():
    return make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13)))


MODELOS = {  # nombre: (fábrica, variables)
    "M1 Nivel 1 cotización (GBM, declarados)": (gbm, VARS_DECL),
    "M2 Lineal 2 variables (Entrega 2)": (lineal, VARS_E2),
    "L11 Lineal 11 variables GPS": (lineal, VARS_GPS),
    "R11 Ridge 11 variables GPS": (ridge, VARS_GPS),
    "M3 Nivel 2 diagnóstico (GBM, GPS)": (gbm, VARS_GPS),
}


def m0c(tr, te, seed):
    """Promedio por perfil con intervalo calculado fuera de muestra."""
    y = tr.y_base.values
    oof = np.empty(len(tr))
    for a, b in KFold(10, shuffle=True, random_state=seed).split(tr):
        medias = tr.iloc[a].groupby("perfil").y_base.mean()
        oof[b] = tr.iloc[b].perfil.map(medias).values
    q = q_conforme(np.abs(y - oof))
    p = te.perfil.map(tr.groupby("perfil").y_base.mean()).values
    return p, q


def robustez(t):
    filas, imps, curvas_arboles = [], [], []
    for s in SEMILLAS:
        tr, te = train_test_split(t, test_size=0.3, random_state=s, stratify=t.perfil)
        y_tr, y_te = tr.y_base.values, te.y_base.values
        p, q = m0c(tr, te, s)
        filas.append({"semilla": s, "modelo": "M0c Promedio por perfil", **metricas(y_te, p, p - q, p + q)})
        for nombre, (fab, vs) in MODELOS.items():
            p, oof, m = conforme(fab, tr[vs].values, y_tr, te[vs].values, seed=s)
            q = q_conforme(np.abs(y_tr - oof))
            filas.append({"semilla": s, "modelo": nombre, **metricas(y_te, p, p - q, p + q)})
            if nombre.startswith("M3"):
                imp = permutation_importance(m, te[vs].values, y_te, n_repeats=5, random_state=s)
                imps.append(imp.importances_mean)
                curvas_arboles.append([mean_absolute_error(y_te, pk)
                                       for pk in m.staged_predict(te[vs].values)])
        filas.append({"semilla": s, "modelo": "Ref. Simulación directa semana 1",
                      **metricas(y_te, te.ahorro_semana1.values)})
    det = pd.DataFrame(filas)
    det.to_csv(os.path.join(SALIDA, "robustez_10_semillas_detalle.csv"), index=False)
    cols = ["MAE", "R2", "cobertura_80", "ancho_intervalo"]
    res = det.groupby("modelo", sort=False)[cols].agg(["mean", "std"])
    res.columns = [f"{a}_{b}" for a, b in res.columns]
    # cuántas veces M3 supera al lineal de 11 variables en la misma partición
    piv = det.pivot(index="semilla", columns="modelo", values="MAE")
    gana = int((piv["M3 Nivel 2 diagnóstico (GBM, GPS)"] < piv["L11 Lineal 11 variables GPS"]).sum())
    imp = pd.DataFrame({"variable": VARS_GPS, "importancia_media": np.mean(imps, 0),
                        "de_entre_particiones": np.std(imps, 0)}).sort_values("importancia_media", ascending=False)
    imp.to_csv(os.path.join(SALIDA, "importancia_10_particiones.csv"), index=False)
    arb = np.mean(curvas_arboles, 0)
    arboles = {str(k): float(arb[k - 1]) for k in (50, 100, 150, 200, 250, 300)}
    return res, gana, imp, arboles


def curva_aprendizaje(t):
    tam, _, val = learning_curve(gbm(), t[VARS_GPS].values, t.y_base.values,
                                 train_sizes=[0.2, 0.4, 0.6, 0.8, 1.0],
                                 cv=KFold(5, shuffle=True, random_state=SEMILLA),
                                 scoring="neg_mean_absolute_error")
    return {int(n): float(-v.mean()) for n, v in zip(tam, val)}


def por_conductor(df, col_id="conductor"):
    """Agrega jornadas a una fila por conductor/vehículo (misma unidad en ambos lados)."""
    filas = []
    for cid, g in df.groupby(col_id):
        f = {"conductor": cid, "jornadas": len(g), "y": ahorro_ponderado(g)}
        for v in VARS_GPS:
            f[v] = g[v].mean()
        filas.append(f)
    return pd.DataFrame(filas)


def externa(js, cm):
    out = {}
    y_cm = cm.ahorro_base.values
    xj, yj, gj = js[VARS_GPS].values, js.ahorro_base.values, js.conductor.values
    # a) por jornada: KFold por fila (Entrega 3) contra GroupKFold por conductor
    for nombre, grupos in [("a) Por jornada, KFold por fila (como E3)", None),
                           ("a) Por jornada, GroupKFold por conductor", gj)]:
        p, oof, _ = conforme(gbm, xj, yj, cm[VARS_GPS].values, grupos=grupos)
        q = q_conforme(np.abs(yj - oof))
        out[nombre] = metricas(y_cm, p, p - q, p + q) | {"n_prueba": len(cm)}
    # b) misma unidad: un registro por conductor (300) y por vehículo CMAP (21)
    sj, sc = por_conductor(js), por_conductor(cm)
    p, oof, _ = conforme(gbm, sj[VARS_GPS].values, sj.y.values, sc[VARS_GPS].values)
    q = q_conforme(np.abs(sj.y.values - oof))
    out["b) Por conductor/vehículo (misma unidad)"] = metricas(sc.y.values, p, p - q, p + q) | {"n_prueba": len(sc)}
    # c) reajuste con 2/3 de los vehículos CMAP, 30 repeticiones, con líneas base
    vehs = cm.conductor.unique()
    rng = np.random.default_rng(SEMILLA)
    acum = {k: {"MAE": [], "cobertura_80": []} for k in
            ["c) Solo sintéticas", "c) Solo CMAP (2/3)", "c) Reajuste ×20, calibración E3",
             "c) Reajuste ×20, calibración ponderada por vehículo", "c) Cifra genérica 25%"]}
    for rep in range(30):
        prueba = rng.choice(vehs, size=len(vehs) // 3, replace=False)
        m_tr, m_te = cm[~cm.conductor.isin(prueba)], cm[cm.conductor.isin(prueba)]
        y_te, x_te = m_te.ahorro_base.values, m_te[VARS_GPS].values
        xm, ym, gm = m_tr[VARS_GPS].values, m_tr.ahorro_base.values, m_tr.conductor.values
        X = np.vstack([xj, xm])
        y = np.concatenate([yj, ym])
        g = np.concatenate([gj, gm])
        w = np.concatenate([np.ones(len(xj)), np.full(len(xm), 20.0)])
        casos = {}
        # solo sintéticas, calibrada por conductor
        p, oof, _ = conforme(gbm, xj, yj, x_te, grupos=gj)
        casos["c) Solo sintéticas"] = (p, q_conforme(np.abs(yj - oof)))
        # solo CMAP: GroupKFold con tantos grupos como vehículos permitan
        k = min(5, len(np.unique(gm)))
        p, oof, _ = conforme(gbm, xm, ym, x_te, grupos=gm, folds=k)
        casos["c) Solo CMAP (2/3)"] = (p, q_conforme(np.abs(ym - oof)))
        # reajuste como en la E3: pesos en el modelo, calibración sin pesos y por fila
        m = ajustar(gbm, X, y, w)
        oof = np.empty(len(y))
        for a, b in KFold(5, shuffle=True, random_state=rep).split(X):
            oof[b] = ajustar(gbm, X[a], y[a]).predict(X[b])
        casos["c) Reajuste ×20, calibración E3"] = (m.predict(x_te), float(np.quantile(np.abs(ym - oof[len(xj):]), 0.8)))
        # reajuste corregido: mismos pesos y particiones por conductor/vehículo
        p, oof, _ = conforme(gbm, X, y, x_te, grupos=g, w=w, folds=5)
        casos["c) Reajuste ×20, calibración ponderada por vehículo"] = (p, q_conforme(np.abs(ym - oof[len(xj):])))
        casos["c) Cifra genérica 25%"] = (np.full(len(y_te), 25.0), None)
        for nombre, (p, q) in casos.items():
            acum[nombre]["MAE"].append(mean_absolute_error(y_te, p))
            acum[nombre]["cobertura_80"].append(np.nan if q is None else 100 * np.mean(np.abs(y_te - p) <= q))
    for nombre, d in acum.items():
        out[nombre] = {"MAE": float(np.mean(d["MAE"])), "MAE_de": float(np.std(d["MAE"])),
                       "cobertura_80": float(np.nanmean(d["cobertura_80"])) if nombre != "c) Cifra genérica 25%" else np.nan}
    t = pd.DataFrame(out).T
    t.to_csv(os.path.join(SALIDA, "validacion_externa_corregida.csv"))
    return t


def poblacion_b(n_por_perfil=40, seed=SEMILLA + 777):
    """Población simulada distinta: otra semilla, más congestión, más paradas y menos
    autopista. Mide si el modelo aprendió a los conductores o solo a la población A."""
    original = {k: dict(v) for k, v in dataset.PERFILES.items()}
    try:
        for p in dataset.PERFILES.values():
            p["congestion"] = tuple(min(1.0, x + 0.10) for x in p["congestion"])
            p["paradas_extra_km"] = tuple(x * 1.3 + 0.05 for x in p["paradas_extra_km"])
            p["autopista"] = tuple(x * 0.7 for x in p["autopista"])
            p["km"] = tuple(x * 0.9 for x in p["km"])
        meta, trazas, _ = dataset.conductores_sinteticos(n_por_perfil=n_por_perfil, seed=seed)
    finally:
        dataset.PERFILES.clear()
        dataset.PERFILES.update(original)
    return dataset.simular_tabla(meta, trazas)


def transferencia(t, js_b):
    tb = tabla_conductores(js_b, seed=SEMILLA + 777)
    tb.to_csv(os.path.join(SALIDA, "conductores_poblacion_b.csv"), index=False)
    p, oof, _ = conforme(gbm, t[VARS_GPS].values, t.y_base.values, tb[VARS_GPS].values)
    q = q_conforme(np.abs(t.y_base.values - oof))
    res = {"M3 entrenado en A, probado en B": metricas(tb.y_base.values, p, p - q, p + q),
           "Ref. Simulación directa semana 1 en B": metricas(tb.y_base.values, tb.ahorro_semana1.values)}
    pl, oofl, _ = conforme(lineal, t[VARS_GPS].values, t.y_base.values, tb[VARS_GPS].values)
    ql = q_conforme(np.abs(t.y_base.values - oofl))
    res["L11 entrenado en A, probado en B"] = metricas(tb.y_base.values, pl, pl - ql, pl + ql)
    r = pd.DataFrame(res).T
    r.to_csv(os.path.join(SALIDA, "transferencia_poblacion_b.csv"))
    medias = {"A": float(t.y_base.mean()), "B": float(tb.y_base.mean())}
    return r, medias


def main():
    os.makedirs(SALIDA, exist_ok=True)
    js = pd.read_csv(os.path.join(RES, "jornadas_sinteticas.csv"))
    cm = pd.read_csv(os.path.join(RES, "jornadas_cmap.csv"))
    t = tabla_conductores(js)
    pd.set_option("display.width", 200)

    rob, gana, imp, arboles = robustez(t)
    rob.to_csv(os.path.join(SALIDA, "robustez_10_semillas.csv"))
    print("1-3) 10 particiones (media y DE)\n", rob.round(2).to_string())
    print(f"M3 supera a L11 en {gana} de 10 particiones")
    print("4) Importancia (10 particiones)\n", imp.round(3).to_string(index=False))
    curva = curva_aprendizaje(t)
    print("5) Curva de aprendizaje MAE:", {k: round(v, 2) for k, v in curva.items()})
    print("   MAE según número de árboles:", {k: round(v, 2) for k, v in arboles.items()})

    ext = externa(js, cm)
    print("6) Validación externa CMAP\n", ext.round(2).to_string())

    js_b = poblacion_b()
    js_b.to_csv(os.path.join(SALIDA, "jornadas_poblacion_b.csv"), index=False)
    tra, medias = transferencia(t, js_b)
    print("7) Transferencia a población B\n", tra.round(2).to_string(), "\n   ahorro medio:", medias)

    m3 = rob.loc["M3 Nivel 2 diagnóstico (GBM, GPS)"]
    resumen = {
        "robustez_10_semillas": json.loads(rob.round(3).to_json(orient="index")),
        "m3_supera_lineal11_en": gana,
        "importancia": json.loads(imp.round(4).to_json(orient="records")),
        "curva_aprendizaje_mae": curva,
        "mae_segun_arboles": arboles,
        "externa": json.loads(ext.round(3).to_json(orient="index")),
        "transferencia_b": json.loads(tra.round(3).to_json(orient="index")),
        "ahorro_medio_poblaciones": medias,
        "degradacion_mae_b_pct": float(100 * (tra.loc["M3 entrenado en A, probado en B", "MAE"] / m3["MAE_mean"] - 1)),
    }
    with open(os.path.join(SALIDA, "resumen_e4.json"), "w") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=1)
    print("Degradación de MAE en población B: %.0f%%" % resumen["degradacion_mae_b_pct"])


if __name__ == "__main__":
    main()
