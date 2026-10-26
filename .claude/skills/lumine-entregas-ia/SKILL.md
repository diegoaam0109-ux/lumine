---
name: lumine-entregas-ia
description: Cómo trabajar en el trabajo final de IA aplicada de Lumine (entrega3/ y entrega4/, UNAB NRC 4153): estimador de ahorro, prototipo, modelo matemático, datos sintéticos vs reales y revisión con varias IA. Úsala antes de tocar entrega3/, entrega4/ o de citar resultados del modelo de ahorro.
---

# Entregas 3 y 4 · estimador de ahorro con IA

Pasos completos en `entrega3/README.md`; resultados y mejoras de la Entrega 4 en `entrega4/Resultados_mejoras_modelo_E4.md`.

## Reproducir

```bash
cd entrega3/prototipo
pip install numpy pandas scikit-learn numba matplotlib pydantic fastsim==2.1.5
python dataset.py && python validacion_fastsim.py && python model.py
python casos.py && python validador.py && python figuras.py && python construir_app.py
node ../informe/generar.js     # regenera el informe Word
```
El prototipo final es `prototipo/app/index.html` (se abre sin servidor, con el modelo incrustado).

## Honestidad de los datos (lo más importante)

| Dato | Naturaleza |
|---|---|
| `resultados/jornadas_sinteticas.csv` | **Sintético**: 300 conductores de Santiago calibrados con TomTom Traffic Index 2025 |
| `datos/fastsim_cycles/` | **Real pero secundario y no chileno** (CMAP Chicago 2007, FASTSim/NREL, Apache 2.0) |
| Parámetros del kit | **Supuestos** (escenarios conservador, referencia y optimista; Anexo C) |
| Jornadas reales en Santiago | **No existen todavía** (protocolo en el Anexo G) |

- Nunca presentes una salida del modelo como ahorro medido. Siempre «estimado», con su escenario e intervalo.
- No cambies semillas, divisiones de datos ni criterios del validador para «mejorar» métricas. Si cambias el modelo,
  reporta antes y después con las mismas pruebas.
- `generador.py` usa la API de Claude: necesita credenciales que **no van en el repo**; sin ellas usa la plantilla de respaldo.
- Mantén la licencia de FASTSim (`LICENSE_FASTSim.txt`) y la cita de las fuentes.

## Documentos

Los .docx/.pdf de esta carpeta son entregables ya presentados: no los sobrescribas salvo que el equipo pida una versión
nueva, y en ese caso regenera desde `informe/generar.js`, no a mano.
