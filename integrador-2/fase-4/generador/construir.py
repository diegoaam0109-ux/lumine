"""Construye las hojas azules del Plan Financiero de Lumine Motors (openpyxl, fórmulas vivas).

v5 = v4 con presentación simplificada y los mismos números. Este archivo solo ordena la construcción; las hojas están en:
  supuestos.py     Supuestos clave (visible), Supuestos detalle y Datos Fase 3 (ocultas)
  motor.py         Motor mensual (cálculo) y Anual (cálculo), ocultas: las mismas fórmulas de la v4
  hojas.py         1. Inversión a 7. Punto de Equilibrio (resumen arriba, detalle plegado)
  presentacion.py  Índice, Dashboard, Sensibilidades, Mensual (años 0 a 2), Controles, Pendientes y Registro de cambios
  base.py          nombres y orden de las hojas, libro, registro de controles; estilo.py: formato común

Uso: python construir.py SALIDA.xlsx [foto.json] [--caso NOMBRE] [--escenario NOMBRE] [--manifiesto MAN.json]
Las hojas grises del semestre anterior NO se generan aquí: injertar.py las conserva tal cual desde la v3.
"""
import json
import sys

from base import H_ANU, H_CTRL, H_DASH, H_MEN, H_SENS, OCULTAS, ORDEN, VISIBLES, Libro
from hojas import hoja_1, hoja_2, hoja_3, hoja_4, hoja_5, hoja_6, hoja_7
from motor import hoja_anual, hoja_motor
from presentacion import (hoja_controles, hoja_dashboard, hoja_indice, hoja_mensual02, hoja_pendientes, hoja_registro,
                          hoja_sensibilidades)
from supuestos import hoja_fase3, hoja_supuestos, hoja_supuestos_clave

ESCENARIOS = ["Base", "Pesimista", "Optimista"]
SELECTORES = dict(sens=[H_SENS, "C4"], esc=[H_DASH, "L1"])   # celdas de los dos selectores (las usa lo_calcular.py)


def construir(salida, foto=None, caso="Base", escenario="Base", manifiesto=None):
    L = Libro()
    K = hoja_supuestos_clave(L)
    S = hoja_supuestos(L, K)
    sin_valor = sorted((set(K.rows.values()) | set(K.tax.values())) - S._escritos)
    assert not sin_valor, f"Supuestos clave sin valor en las filas {sin_valor}"
    hoja_fase3(L, S)
    hoja_motor(L)
    hoja_anual(L)
    for h in (hoja_1, hoja_2, hoja_3, hoja_4, hoja_5, hoja_6, hoja_7):
        h(L)
    hoja_dashboard(L, escenario)
    hoja_sensibilidades(L, S, foto, caso)
    hoja_mensual02(L)
    hoja_controles(L)       # al final de las hojas que registran controles
    hoja_indice(L)
    hoja_pendientes(L)
    hoja_registro(L)
    L.guardar(salida)
    if manifiesto:
        info = dict(hojas=ORDEN, visibles=VISIBLES, ocultas=OCULTAS, hoja_motor=H_MEN, hoja_anual=H_ANU, selectores=SELECTORES,
                    controles=[(d, H_CTRL, f"D{r}") for (d, _h, _f), r in zip(L.controles, L.filas_controles)],
                    origen_controles=[h for _d, h, _f in L.controles], enteros=L.enteros,
                    casos=[dict(nombre=c["nombre"], codigo=c["codigo"], grupo=c["grupo"], valor=c["valor"], fmt=c["fmt"]) for c in L.casos],
                    filas_men=L.filas_men, filas_anu=L.filas_anu, nombres=L.nombres, escenarios=ESCENARIOS)
        with open(manifiesto, "w", encoding="utf-8") as fh:
            json.dump(info, fh, ensure_ascii=False, indent=1)
    return L


if __name__ == "__main__":
    args = sys.argv[1:]
    salida = args[0]
    foto = None
    caso, esc, man = "Base", "Base", None
    rest = args[1:]
    i = 0
    while i < len(rest):
        if rest[i] == "--caso":
            caso = rest[i + 1]; i += 2
        elif rest[i] == "--escenario":
            esc = rest[i + 1]; i += 2
        elif rest[i] == "--manifiesto":
            man = rest[i + 1]; i += 2
        else:
            with open(rest[i], encoding="utf-8") as fh:
                foto = json.load(fh)
            i += 1
    construir(salida, foto, caso, esc, man)
    print("ok", salida)
