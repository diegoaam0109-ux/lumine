import json
import runpy
import shutil
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from conftest import PROTO
from estimador import (DIAS_MES, PRECIO_BENCINA, PRECIO_KIT, _predecir_ridge,
                       cargar_modelo, estimar)
from sim import ESCENARIOS, simular
from validador import evaluar

CASOS = json.loads((PROTO / 'pruebas/casos.json').read_text())


def test_simulador_wltc():
    ciclo = pd.read_csv(PROTO / 'datos/fastsim_cycles/wltc_3b.csv')
    v = ciclo.iloc[:, 1].to_numpy()
    base = simular(v)
    kit = ESCENARIOS['base']
    r = simular(v, kit=kit)
    assert base['litros_base'] > 0
    assert 10 < r['ahorro_pct'] < 15
    for k in ['litros_base', 'litros_kit', 'e_regen_kwh', 'e_asist_kwh', 'e_freno_kwh', 'e_trac_kwh']:
        assert r[k] >= 0
    # La asistencia no puede superar la energía disponible, con sus pérdidas.
    assert r['e_asist_kwh'] <= (kit.soc_inicial * kit.bateria_kwh + r['e_regen_kwh']) * kit.eta_motor * kit.eta_bateria + 1e-9


def test_sin_kit():
    v = np.tile(np.array([0., 5., 10., 5., 0.]), 100)
    r = simular(v)
    assert r['ahorro_pct'] == 0
    assert r['litros_kit'] == r['litros_base']


def test_n1_formulas():
    d = CASOS[0]['entrada']
    m = cargar_modelo()
    r = estimar(d, m)
    centro = _predecir_ridge(m['nivel2_ridge'], [d[v] for v in m['nivel2_ridge']['vars']])
    gasto = d['km_dia'] * DIAS_MES[d['perfil']] / 10 * PRECIO_BENCINA
    cons = (centro - m['nivel2_ridge']['q80']) * m['razon_escenarios']['conservador']
    assert r['ahorro_pct'] == pytest.approx(19.7, abs=.1)
    assert r['gasto_mensual'] == round(gasto, -3) == 806000
    assert r['ahorro_mensual'] == round(gasto * centro / 100, -3) == 159000
    assert r['plazo_recuperacion_conservador_meses'] == round(PRECIO_KIT / (gasto * cons / 100)) == 22


def test_estados():
    assert estimar(dict(CASOS[0]['entrada'], traccion='trasera'))['estado'] == 'no_aplica'
    entradas = [c['entrada'] for c in CASOS if c['salida_estimador']['estado'] == 'no_conviene']
    assert entradas
    for entrada in entradas:
        assert estimar(entrada)['estado'] == 'no_conviene'


SALIDAS = json.loads((PROTO / 'pruebas/salidas.json').read_text())['V31']


@pytest.mark.parametrize('cid', sorted(SALIDAS))
def test_validador_v31(cid):
    assert len(SALIDAS) == 12
    resultado = evaluar('v3.1', cid, SALIDAS[cid])
    assert resultado['aprobado'], resultado['fallos']


def test_redteam(tmp_path):
    # El script original escribe CSV: ejecutar una copia para no modificar entregables.
    origen = PROTO.parents[1] / 'entrega4/redteam'
    destino = tmp_path / 'redteam'
    shutil.copytree(origen, destino)
    resultado = runpy.run_path(str(destino / 'validar.py'))['d']
    assert len(resultado) == 10
    assert int(resultado.resistio.sum()) == 8


def test_n1_historico_gbm():
    from estimador import _predecir_gbm
    d = CASOS[0]['entrada']
    m = cargar_modelo()['nivel2']
    centro = _predecir_gbm(m, [d[v] for v in m['vars']])
    gasto = d['km_dia'] * DIAS_MES[d['perfil']] / 10 * PRECIO_BENCINA
    assert round(gasto, -3) == 806000
    assert round(gasto * centro / 100, -3) == 158000
    cons = (centro - m['q80']) * cargar_modelo()['razon_escenarios']['conservador']
    assert round(PRECIO_KIT / (gasto * cons / 100)) == 22


def test_exportacion_ridge_equivale_a_sklearn():
    from sklearn.linear_model import RidgeCV
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler
    t = pd.read_csv(PROTO / 'resultados/conductores.csv')
    m = cargar_modelo()['nivel2_ridge']
    x = t[m['vars']].to_numpy()
    referencia = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13))).fit(x, t.y_base)
    np.testing.assert_allclose([_predecir_ridge(m, fila) for fila in x], referencia.predict(x), atol=1e-10)


def test_ridge_javascript_equivale_a_python():
    import re
    import subprocess
    m = cargar_modelo()['nivel2_ridge']
    xs = [[c['entrada'][v] for v in m['vars']] for c in CASOS if c['entrada']['nivel'] == 2]
    plantilla = (PROTO / 'app/plantilla.html').read_text()
    funcion = re.search(r'^function ridge.*$', plantilla, re.M).group()
    script = funcion + '\nconst fs=require("fs"); const {m,xs}=JSON.parse(fs.readFileSync(0,"utf8")); console.log(JSON.stringify(xs.map(x=>ridge(m,x))));'
    salida = subprocess.run(['node', '-e', script], input=json.dumps({'m': m, 'xs': xs}), text=True, capture_output=True, check=True)
    np.testing.assert_allclose(json.loads(salida.stdout), [_predecir_ridge(m, x) for x in xs], atol=1e-10)
