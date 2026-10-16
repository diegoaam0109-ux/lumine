"""
Simulador de energía y combustible del kit de hibridación aditiva de Lumine Motors.

Modelo longitudinal a 1 Hz (Guzzella & Sciarretta, 2013; Ehsani et al., 2018):
    P_rueda = (m_ef * a + m * g * Crr + 0,5 * rho * CdA * v^2) * v
Motor a combustión con línea de Willans:
    P_comb = P0 + P_motor / e         (motor encendido y con carga)
    P_comb = P_ralenti                 (detenido o bajo 15 km/h sin carga)
    P_comb = 0                         (corte de inyección al desacelerar sobre 15 km/h)
Kit en el eje trasero (capas 1 y 2 de la unidad de control):
    - regeneración limitada por potencia del motor eléctrico, desaceleración
      máxima permitida en el eje trasero (el freno original y el ABS mandan),
      velocidad mínima y estado de carga;
    - asistencia en cuanto hay energía disponible y demanda positiva, bajo
      70 km/h, limitada por potencia y estado de carga;
    - el kit no apaga el motor en detención (limitación de la arquitectura).

Todos los parámetros del kit son SUPUESTOS (registro S1 y S2): no existe ficha
técnica de proveedor. Por eso se trabaja con tres escenarios.
"""
from dataclasses import dataclass, asdict, replace
import numpy as np
from numba import njit

G = 9.81
RHO = 1.2
LHV_KWH_POR_L = 8.9  # bencina, 32 MJ/l


@dataclass(frozen=True)
class Vehiculo:
    masa_kg: float = 1300.0        # sedán compacto cargado (mismo supuesto de la Entrega 2)
    cda_m2: float = 0.65
    crr: float = 0.010
    factor_inercia: float = 1.03
    eta_trans: float = 0.90
    aux_kw: float = 0.6
    p0_kw: float = 10.0            # pérdidas fijas con el motor en marcha (Willans)
    e_marginal: float = 0.40       # eficiencia marginal (calibrada contra FASTSim, Anexo C)
    ralenti_l_h: float = 0.65      # consumo en ralentí de un motor de 1,4 a 1,6 l
    v_corte_kmh: float = 15.0      # corte de inyección al desacelerar sobre esta velocidad


@dataclass(frozen=True)
class Kit:
    nombre: str = "base"
    p_motor_kw: float = 15.0       # potencia máxima del motor eléctrico trasero
    bateria_kwh: float = 1.0       # energía útil de la batería
    eta_motor: float = 0.88        # motor + inversor, por sentido
    eta_bateria: float = 0.95      # carga o descarga, por sentido
    desacel_max: float = 2.0       # m/s2 que puede absorber el eje trasero
    v_min_regen_kmh: float = 5.0
    v_max_asist_kmh: float = 70.0
    masa_kg: float = 45.0
    parasito_w: float = 40.0       # electrónica del kit en marcha
    soc_inicial: float = 0.5


# Escenarios del kit. El de referencia replica la potencia del motor trasero de 31 CV
# (23 kW) del Dacia Hybrid-G 150 4x4 (Álvarez, 2026); la batería es un supuesto (S1).
ESCENARIOS = {
    "conservador": Kit("conservador", 15.0, 1.0, 0.86, 0.94, 2.0, 7.0, 60.0, 50.0, 50.0),
    "base": Kit("referencia", 23.0, 1.5, 0.90, 0.95, 2.5, 5.0, 70.0, 55.0, 40.0),
    "optimista": Kit("optimista", 30.0, 2.0, 0.92, 0.97, 2.8, 3.0, 80.0, 60.0, 30.0),
}


@njit(cache=True)
def _simular(v, a, pend, masa, masa_kit, cda, crr, fi, eta_t, aux_kw, p0_kw, e_marg,
             ralenti_kw, v_corte, con_kit, p_m, e_bat, eta_m, eta_b, a_max,
             v_min_regen, v_max_asist, parasito_kw, soc0):
    n = v.shape[0]
    m = masa + (masa_kit if con_kit else 0.0)
    soc_kwh = soc0 * e_bat
    comb_kwh = 0.0
    e_regen = 0.0      # energía que entra a la batería (kWh)
    e_asist = 0.0      # energía entregada en la rueda por el kit (kWh)
    e_freno = 0.0      # energía de frenado total en la rueda (kWh)
    e_trac = 0.0       # energía de tracción positiva en la rueda (kWh)
    for i in range(n):
        vi = v[i]
        f = (m * fi * a[i] + (m * G * crr if vi > 0.1 else 0.0) + 0.5 * RHO * cda * vi * vi
             + (m * G * pend[i] if vi > 0.1 else 0.0))
        p_rueda = f * vi / 1000.0  # kW
        p_asist = 0.0
        if p_rueda < 0.0:
            e_freno += -p_rueda / 3600.0
        else:
            e_trac += p_rueda / 3600.0
        if con_kit and vi > 0.1:
            # electrónica del kit
            soc_kwh = max(soc_kwh - parasito_kw / 3600.0, 0.0)
            if p_rueda < 0.0 and vi * 3.6 > v_min_regen:
                # capa 1: el eje trasero solo absorbe hasta a_max; el resto va al freno original
                p_lim_eje = m * a_max * vi / 1000.0
                p_rec = min(-p_rueda, p_m, p_lim_eje)
                p_bat = p_rec * eta_m * eta_b
                hueco = (e_bat - soc_kwh) * 3600.0
                if p_bat > hueco:
                    p_bat = hueco
                soc_kwh += p_bat / 3600.0
                e_regen += p_bat / 3600.0
            elif p_rueda > 0.0 and vi * 3.6 < v_max_asist and soc_kwh > 0.0:
                p_disp = soc_kwh * 3600.0 * eta_b * eta_m
                p_asist = min(p_rueda, p_m, p_disp)
                soc_kwh -= p_asist / (eta_b * eta_m) / 3600.0
                e_asist += p_asist / 3600.0
        # motor a combustión
        if vi < 0.3:
            p_comb = ralenti_kw
        elif p_rueda < 0.0:
            p_comb = 0.0 if vi * 3.6 > v_corte else ralenti_kw
        else:
            p_motor = (p_rueda - p_asist) / eta_t + aux_kw
            p_comb = p0_kw + p_motor / e_marg
            if p_comb < ralenti_kw:
                p_comb = ralenti_kw
        comb_kwh += p_comb / 3600.0
    return comb_kwh, e_regen, e_asist, e_freno, e_trac, soc_kwh


def preparar(v_ms, pendiente=None):
    v = np.asarray(v_ms, dtype=np.float64)
    a = np.zeros_like(v)
    a[:-1] = np.diff(v)
    p = np.zeros_like(v) if pendiente is None else np.asarray(pendiente, dtype=np.float64)
    return v, a, p


def simular(v_ms, veh: Vehiculo = Vehiculo(), kit: Kit = None, pendiente=None):
    """Devuelve un diccionario con consumo base, consumo con kit y ahorro.
    pendiente: fracción (0,02 = 2%) por segundo; positiva en subida."""
    v, a, p = preparar(v_ms, pendiente)
    km = v.sum() / 1000.0
    ral_kw = veh.ralenti_l_h * LHV_KWH_POR_L
    comunes = (veh.masa_kg, 0.0, veh.cda_m2, veh.crr, veh.factor_inercia, veh.eta_trans,
               veh.aux_kw, veh.p0_kw, veh.e_marginal, ral_kw, veh.v_corte_kmh)
    base = _simular(v, a, p, *comunes, False, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    out = {
        "km": km,
        "horas": len(v) / 3600.0,
        "litros_base": base[0] / LHV_KWH_POR_L,
        "l100_base": 100.0 * base[0] / LHV_KWH_POR_L / km if km > 0 else np.nan,
        "e_freno_kwh": base[3],
        "e_trac_kwh": base[4],
    }
    out["kml_base"] = 100.0 / out["l100_base"] if km > 0 else np.nan
    if kit is not None:
        k = kit
        res = _simular(v, a, p, veh.masa_kg, k.masa_kg, veh.cda_m2, veh.crr, veh.factor_inercia,
                       veh.eta_trans, veh.aux_kw, veh.p0_kw, veh.e_marginal, ral_kw,
                       veh.v_corte_kmh, True, k.p_motor_kw, k.bateria_kwh, k.eta_motor,
                       k.eta_bateria, k.desacel_max, k.v_min_regen_kmh, k.v_max_asist_kmh,
                       k.parasito_w / 1000.0, k.soc_inicial)
        # corrección de balance de carga (criterio de SAE J1711): la diferencia
        # entre la energía final e inicial de la batería se convierte a litros
        # equivalentes, para no premiar ni castigar la carga con que parte el día
        litros_kit = res[0] / LHV_KWH_POR_L
        delta_kwh = res[5] - k.soc_inicial * k.bateria_kwh
        litros_por_kwh = k.eta_bateria * k.eta_motor / veh.eta_trans / veh.e_marginal / LHV_KWH_POR_L
        litros_kit -= delta_kwh * litros_por_kwh
        out.update({
            "litros_kit": litros_kit,
            "ahorro_pct": 100.0 * (out["litros_base"] - litros_kit) / out["litros_base"],
            "e_regen_kwh": res[1],
            "e_asist_kwh": res[2],
        })
    return out


if __name__ == "__main__":
    import pandas as pd, os
    base_dir = os.path.join(os.path.dirname(__file__), "datos", "fastsim_cycles")
    for nombre in ["udds", "hwfet", "us06", "wltc_3b", "wltc_low_3", "wltc_medium_3b", "wltc_high_3b", "wltc_extrahigh_3"]:
        df = pd.read_csv(os.path.join(base_dir, nombre + ".csv"))
        v = df.iloc[:, 1].values * 0.44704 if "mps" not in df.columns[1].lower() else df.iloc[:, 1].values
        fila = {"ciclo": nombre}
        for esc, kit in ESCENARIOS.items():
            r = simular(v, kit=kit)
            fila["km"] = round(r["km"], 1)
            fila["kml_base"] = round(r["kml_base"], 1)
            fila[esc] = round(r["ahorro_pct"], 1)
        print(fila)
