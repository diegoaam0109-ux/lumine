"""Calibración y validación del consumo base contra FASTSim 2 (NREL), Ford Focus 2012 (vehículo 28)."""
import numpy as np, pandas as pd, fastsim as fsim
from sim import simular, Vehiculo

def main():
    veh = fsim.vehicle.Vehicle.from_vehdb(28)
    filas = []
    for c in ["udds", "hwfet", "us06", "wltc_3b"]:
        v = pd.read_csv(f"datos/fastsim_cycles/{c}.csv").iloc[:, 1].values
        cyc = fsim.cycle.Cycle.from_dict({"time_s": np.arange(len(v)), "mps": v, "grade": np.zeros(len(v)), "road_type": np.zeros(len(v))})
        sd = fsim.simdrive.SimDrive(cyc, veh); sd.sim_drive()
        propio = simular(v, Vehiculo(masa_kg=veh.veh_kg, cda_m2=veh.drag_coef * veh.frontal_area_m2, crr=veh.wheel_rr_coef, aux_kw=0.7))["kml_base"]
        filas.append({"ciclo": c, "fastsim_kml": sd.mpgge * 0.4251, "propio_kml": propio})
    t = pd.DataFrame(filas); t["error_pct"] = 100 * (t.propio_kml / t.fastsim_kml - 1)
    t.to_csv("resultados/validacion_fastsim.csv", index=False)
    print(t.round(2), "RMSE %:", round(np.sqrt((t.error_pct ** 2).mean()), 1))

if __name__ == "__main__":
    main()
