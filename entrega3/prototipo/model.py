"""
Modelo predictivo del estimador de ahorro (IA predictiva, aprendizaje supervisado).

Unidad de análisis: conductor. Entrada: su semana 1 (registro de diagnóstico) o sus datos
declarados (cotización). Objetivo: ahorro de combustible de su semana 2, simulado con el
escenario base del kit. Así el modelo predice uso FUTURO y no la misma semana que observa.

Versiones comparadas (iteración del modelo):
  M0  Cifra genérica del TIG: 25% para todos.
  M0b Cifra de laboratorio del ICCT para eje trasero: 15,5% para todos.
  M1  Nivel 1, cotización: datos declarados + gradient boosting.
  M2  Nivel 2, regresión lineal con dos variables (la de la Entrega 2).
  M3  Nivel 2, gradient boosting con variables del registro GPS y del vehículo.
Intervalos de predicción al 80% por predicción conforme (Angelopoulos & Bates, 2023):
cuantil de los residuos absolutos fuera de muestra (CV+ simplificado).
"""
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict, train_test_split

AQUI = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(AQUI, "resultados")
SEMILLA = 20261004
ALFA = 0.20  # intervalo al 80%

VARS_GPS = ["detenciones_km", "vel_mov_media", "vel_media", "pct_detenido", "acel_pos_media",
            "pct_sobre_60", "energia_cinetica_km", "desnivel_pos_km", "km_dia", "masa_kg", "cilindrada_l"]
VARS_E2 = ["detenciones_km", "vel_mov_media"]
VARS_DECL = ["perfil_colectivo", "perfil_aplicacion", "perfil_particular", "km_declarado",
             "horario_ord", "autopista_ord", "masa_kg", "cilindrada_l"]


def ahorro_ponderado(g, col="ahorro_base"):
    """Ahorro de la semana ponderado por litros (no promedio simple de porcentajes)."""
    return 100 * (g["litros_base"] * g[col] / 100).sum() / g["litros_base"].sum()


def tabla_conductores(js, seed=SEMILLA):
    rng = np.random.default_rng(seed)
    filas = []
    for cid, g in js.groupby("conductor"):
        s1, s2 = g[g.semana == 1], g[g.semana == 2]
        f = {"conductor": cid, "perfil": g.perfil.iloc[0]}
        for v in VARS_GPS:
            f[v] = s1[v].mean()
        f["masa_kg"] = g.masa_kg.iloc[0]
        f["cilindrada_l"] = g.cilindrada_l.iloc[0]
        for esc in ["conservador", "base", "optimista"]:
            f[f"y_{esc}"] = ahorro_ponderado(s2, f"ahorro_{esc}")
        f["ahorro_semana1"] = ahorro_ponderado(s1)
        f["litros_dia_s2"] = s2.litros_base.mean()
        f["km_dia_s2"] = s2.km_dia.mean()
        # datos declarados en el formulario (con error de memoria y redondeo)
        f["km_declarado"] = round(g.km_declarado_base.iloc[0] * rng.uniform(0.8, 1.2), -1)
        c = g.congestion_real.iloc[0] + rng.normal(0, 0.08)
        f["horario_ord"] = 2 if c > 0.65 else (1 if c > 0.45 else 0)   # punta / mixto / valle
        h = g.autopista_real.iloc[0] + rng.normal(0, 0.03)
        f["autopista_ord"] = 2 if h > 0.15 else (1 if h > 0.05 else 0)  # frecuente / a veces / casi nunca
        filas.append(f)
    t = pd.DataFrame(filas)
    for p in ["colectivo", "aplicacion", "particular"]:
        t[f"perfil_{p}"] = (t.perfil == p).astype(int)
    return t


def gbm():
    return GradientBoostingRegressor(n_estimators=300, max_depth=3, learning_rate=0.05,
                                     subsample=0.8, random_state=SEMILLA)


def conforme(modelo, X, y, X_test, alfa=ALFA, seed=SEMILLA):
    """Ajusta, calcula residuos fuera de muestra con 10 particiones y devuelve
    predicción e intervalo conforme para X_test."""
    kf = KFold(10, shuffle=True, random_state=seed)
    oof = cross_val_predict(modelo, X, y, cv=kf)
    res = np.abs(y - oof)
    n = len(res)
    q = np.quantile(res, min(1, np.ceil((n + 1) * (1 - alfa)) / n))
    modelo.fit(X, y)
    pred = modelo.predict(X_test)
    return pred, q, oof


def metricas(y, pred, lo=None, hi=None):
    m = {"MAE": mean_absolute_error(y, pred), "R2": r2_score(y, pred) if np.std(pred) > 0 else np.nan,
         "error_max": np.max(np.abs(y - pred)),
         "pct_error_mayor_3pp": 100 * np.mean(np.abs(y - pred) > 3)}
    if lo is not None:
        m["cobertura_80"] = 100 * np.mean((y >= lo) & (y <= hi))
        m["ancho_intervalo"] = np.mean(hi - lo)
    return m


def exportar_gbm(modelo, nombres):
    arboles = []
    for est in modelo.estimators_[:, 0]:
        t = est.tree_
        arboles.append({"f": t.feature.tolist(), "t": np.round(t.threshold, 6).tolist(),
                        "l": t.children_left.tolist(), "r": t.children_right.tolist(),
                        "v": np.round(t.value[:, 0, 0], 6).tolist()})
    return {"init": float(modelo.init_.constant_[0][0]), "lr": modelo.learning_rate,
            "vars": nombres, "arboles": arboles}


def main():
    js = pd.read_csv(os.path.join(RES, "jornadas_sinteticas.csv"))
    cm = pd.read_csv(os.path.join(RES, "jornadas_cmap.csv"))
    t = tabla_conductores(js)
    t.to_csv(os.path.join(RES, "conductores.csv"), index=False)
    tr, te = train_test_split(t, test_size=0.3, random_state=SEMILLA, stratify=t.perfil)
    y_tr, y_te = tr.y_base.values, te.y_base.values
    resultados, predicciones = {}, {"conductor": te.conductor.values, "perfil": te.perfil.values,
                                    "y": y_te}

    # M0 y M0b: cifras genéricas
    for nombre, cifra in [("M0 Cifra genérica TIG (25%)", 25.0), ("M0b Cifra ICCT eje trasero (15,5%)", 15.5)]:
        p = np.full_like(y_te, cifra)
        resultados[nombre] = metricas(y_te, p)
    # M0c: promedio por perfil (lo mínimo que haría un cotizador por segmento)
    medias = tr.groupby("perfil").y_base.mean()
    p = te.perfil.map(medias).values
    q = np.quantile(np.abs(y_tr - tr.perfil.map(medias).values), 0.8)
    resultados["M0c Promedio por perfil"] = metricas(y_te, p, p - q, p + q)
    # M1: Nivel 1, cotización con datos declarados
    p1, q1, _ = conforme(gbm(), tr[VARS_DECL].values, y_tr, te[VARS_DECL].values)
    resultados["M1 Nivel 1 cotización (GBM, declarados)"] = metricas(y_te, p1, p1 - q1, p1 + q1)
    predicciones.update({"p_M1": p1, "q_M1": q1})
    # M2: lineal de la Entrega 2
    p2, q2, _ = conforme(LinearRegression(), tr[VARS_E2].values, y_tr, te[VARS_E2].values)
    resultados["M2 Nivel 2 lineal, 2 variables (Entrega 2)"] = metricas(y_te, p2, p2 - q2, p2 + q2)
    # M3: GBM con todas las variables del registro
    m3 = gbm()
    p3, q3, oof3 = conforme(m3, tr[VARS_GPS].values, y_tr, te[VARS_GPS].values)
    resultados["M3 Nivel 2 diagnóstico (GBM, registro GPS)"] = metricas(y_te, p3, p3 - q3, p3 + q3)
    predicciones.update({"p_M2": p2, "q_M2": q2, "p_M3": p3, "q_M3": q3})
    # ahorro de la semana 1 simulada directamente (sin modelo): referencia de representatividad
    resultados["Ref. Simulación directa de la semana 1"] = metricas(y_te, te.ahorro_semana1.values)

    tab = pd.DataFrame(resultados).T
    tab.to_csv(os.path.join(RES, "comparacion_modelos.csv"))
    print(tab.round(2).to_string())
    pd.DataFrame(predicciones).to_csv(os.path.join(RES, "predicciones_test.csv"), index=False)

    # cobertura por perfil del modelo M3 (equidad del intervalo)
    te = te.assign(p3=p3, lo=p3 - q3, hi=p3 + q3, p1=p1)
    por_perfil = te.groupby("perfil").apply(
        lambda g: pd.Series({"MAE_M3": mean_absolute_error(g.y_base, g.p3),
                             "cobertura_M3": 100 * np.mean((g.y_base >= g.lo) & (g.y_base <= g.hi)),
                             "MAE_M1": mean_absolute_error(g.y_base, g.p1),
                             "n": len(g)}), include_groups=False)
    por_perfil.to_csv(os.path.join(RES, "metricas_por_perfil.csv"))
    print(por_perfil.round(2))

    # importancia por permutación (explicabilidad)
    imp = permutation_importance(m3, te[VARS_GPS].values, y_te, n_repeats=20, random_state=SEMILLA)
    imp_t = pd.DataFrame({"variable": VARS_GPS, "importancia": imp.importances_mean,
                          "de": imp.importances_std}).sort_values("importancia", ascending=False)
    imp_t.to_csv(os.path.join(RES, "importancia_variables.csv"), index=False)
    print(imp_t.round(3).to_string())

    # validación externa: modelo por jornada entrenado en sintéticas, probado en CMAP real
    xj = js[VARS_GPS].values
    mj = gbm()
    pj, qj, _ = conforme(mj, xj, js.ahorro_base.values, cm[VARS_GPS].values)
    ext = {"Modelo por jornada en CMAP real": metricas(cm.ahorro_base.values, pj, pj - qj, pj + qj),
           "Cifra genérica 25% en CMAP real": metricas(cm.ahorro_base.values, np.full(len(cm), 25.0))}
    # reajuste: se agregan 2/3 de los vehículos CMAP al entrenamiento (adaptación de dominio)
    vehs = cm.conductor.unique()
    rng = np.random.default_rng(SEMILLA)
    errs, cobs = [], []
    for rep in range(30):
        prueba = rng.choice(vehs, size=len(vehs) // 3, replace=False)
        m_tr = cm[~cm.conductor.isin(prueba)]
        m_te = cm[cm.conductor.isin(prueba)]
        X = np.vstack([xj, m_tr[VARS_GPS].values])
        y = np.concatenate([js.ahorro_base.values, m_tr.ahorro_base.values])
        w = np.concatenate([np.ones(len(xj)), np.full(len(m_tr), 20.0)])
        m = gbm().fit(X, y, sample_weight=w)
        pe = m.predict(m_te[VARS_GPS].values)
        res_tr = np.abs(m_tr.ahorro_base.values - cross_val_predict(gbm(), X, y, cv=KFold(5, shuffle=True, random_state=rep))[len(xj):])
        qa = np.quantile(res_tr, 0.8)
        errs.append(mean_absolute_error(m_te.ahorro_base.values, pe))
        cobs.append(100 * np.mean(np.abs(m_te.ahorro_base.values - pe) <= qa))
    ext["Modelo reajustado con 2/3 de CMAP (30 repeticiones)"] = {"MAE": np.mean(errs), "cobertura_80": np.mean(cobs)}
    ext_t = pd.DataFrame(ext).T
    ext_t.to_csv(os.path.join(RES, "validacion_externa_cmap.csv"))
    print(ext_t.round(2).to_string())
    cm.assign(pred_jornada=pj, q=qj).to_csv(os.path.join(RES, "cmap_predicciones.csv"), index=False)

    # modelos finales con todos los conductores, exportados al prototipo
    _, qf3, _ = conforme(gbm(), t[VARS_GPS].values, t.y_base.values, t[VARS_GPS].values[:1])
    mf3 = gbm().fit(t[VARS_GPS].values, t.y_base.values)
    _, qf1, _ = conforme(gbm(), t[VARS_DECL].values, t.y_base.values, t[VARS_DECL].values[:1])
    mf1 = gbm().fit(t[VARS_DECL].values, t.y_base.values)
    razones = {"conservador": float((t.y_conservador / t.y_base).mean()),
               "optimista": float((t.y_optimista / t.y_base).mean())}
    export = {"nivel2": exportar_gbm(mf3, VARS_GPS) | {"q80": float(qf3)},
              "nivel1": exportar_gbm(mf1, VARS_DECL) | {"q80": float(qf1)},
              "razon_escenarios": razones,
              "dominio": {v: [float(t[v].quantile(0.01)), float(t[v].quantile(0.99))] for v in VARS_GPS + ["km_declarado"]}}
    with open(os.path.join(AQUI, "app", "modelo.json"), "w") as f:
        json.dump(export, f)
    print("q80 final N2:", round(qf3, 2), "N1:", round(qf1, 2), razones)


if __name__ == "__main__":
    main()
