"""Exporta Ridge de nivel 2 sin modificar resultados ni el GBM de nivel 1."""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import GroupKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def entrenar(tabla):
    from model import VARS_GPS
    x, y = tabla[VARS_GPS].to_numpy(), tabla.y_base.to_numpy()
    pipeline = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13)))
    # El escalador y Ridge se ajustan exclusivamente dentro de cada fold.
    cv = GroupKFold(n_splits=10)
    oof = cross_val_predict(pipeline, x, y, groups=tabla.conductor, cv=cv)
    residuos = np.abs(y - oof)
    cuantil = min(1, np.ceil((len(y) + 1) * .8) / len(y))
    q = float(np.quantile(residuos, cuantil, method="higher"))
    pipeline.fit(x, y)
    scaler, ridge = pipeline.steps[0][1], pipeline.steps[1][1]
    return {"vars": VARS_GPS, "medias": scaler.mean_.tolist(),
            "escalas": scaler.scale_.tolist(), "coeficientes": ridge.coef_.tolist(),
            "intercepto": float(ridge.intercept_), "alpha": float(ridge.alpha_),
            "q80": q, "calibracion": {"metodo": "GroupKFold", "grupos": "conductor",
            "folds": 10, "n": len(y), "mae_oof": float(residuos.mean()),
            "cuantil": cuantil, "interpolacion": "higher"}}


def main():
    raiz = Path(__file__).resolve().parent
    archivo = raiz / "app/modelo.json"
    modelo = json.loads(archivo.read_text())
    modelo["nivel2_ridge"] = entrenar(pd.read_csv(raiz / "resultados/conductores.csv"))
    archivo.write_text(json.dumps(modelo, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(modelo["nivel2_ridge"]["calibracion"], indent=2))


if __name__ == "__main__":
    main()
