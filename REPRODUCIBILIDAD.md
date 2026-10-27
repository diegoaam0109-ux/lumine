# Reproducibilidad de Lumine

Revisión del 26-10-2026 (Chile). Rama `codex/mejoras-finales`, creada desde
`claude/quirky-darwin-326nn0` en `26eaa94a9e936804df10fae0e2c6638b9486c0e8`.

## Alcance y entorno

Se usaron clones limpios (`git clone --no-local --single-branch`) separados del checkout
de trabajo: uno de la base para seguir el flujo original de Entrega 3 y otro del commit
`c7e3197` para Entrega 5. Un tercer clon de `c7e3197` verificó las pruebas y la exportación
nueva. No se copiaron node_modules ni archivos locales a esos clones.
Los generadores escribieron únicamente en los clones descartables. No se cambiaron
`entrega5/` ni los archivos de `entrega3/prototipo/resultados/` en la rama entregada.

Entorno Linux x86_64, Python 3.12.14, Node 24.19.0, venv dedicado, dependencias Python de
`entrega3/prototipo/requirements.txt`; `pip check` no detectó incompatibilidades.
Se fijaron OPENBLAS_NUM_THREADS=1 y OMP_NUM_THREADS=1. Los flujos E3 y E5 se ejecutaron
en paralelo en clones distintos. Los tiempos son de pared por comando, no deben sumarse
para calcular el tiempo total. La comprobación pip de la tabla parte del venv ya instalado.

FASTSim 2.1.5 exige NumPy >=2.0,<2.1: el intento inicial con NumPy 2.1.3 fue rechazado
por el resolvedor; se corrigió a 2.0.2. No se desactivó la resolución de dependencias.

## Entrega 3: comandos del README

Directorio de ejecución: `entrega3/prototipo` del clon de la base.

| Comando | Segundos | Salida | Resultado |
|---|---:|---:|---|
| `pip install numpy pandas scikit-learn numba matplotlib pydantic fastsim==2.1.5` | 1.27 | 0 | Completado |
| `python dataset.py` | 58.53 | 0 | Completado |
| `python validacion_fastsim.py` | 4.09 | 0 | Completado |
| `python model.py` | 817.79 | 0 | Completado |
| `python casos.py` | 0.77 | 0 | Completado |
| `python validador.py` | 0.52 | 0 | Completado |
| `python figuras.py` | 4.46 | 0 | Completado |
| `python construir_app.py` | 52.59 | 0 | Completado |
| `node ../informe/generar.js` | 1.38 | 0 | Completado |

El validador ejecutó las cuatro versiones: v1 0/12, v2 4/12, v3 11/12 y v3.1 12/12.
Estos son resultados observados de las respuestas históricas, no llamadas nuevas a una API.
El flujo original reescribe resultados y fixtures; por eso se ejecutó fuera del checkout.

## Entrega 5: primera ejecución

Directorio: raíz del clon. Se ejecutaron los entrypoints indicados en `entrega5/README.md`.
El primer intento del PPT no tenía resuelto el placeholder NODE_PATH del README.

| Comando | Segundos | Salida del supervisor | Resultado |
|---|---:|---:|---|
| `python entrega3/prototipo/mejoras_e4.py` | 2400.01 | 124 | Límite de 40 min del supervisor |
| `python entrega5/analisis/analisis_final.py` | 28.93 | 0 | Completado con archivos disponibles al corte |
| `bash entrega5/informe/construir.sh` | 29.18 | 0 | Completado con archivos disponibles al corte |
| `node entrega5/presentacion/generar_ppt.js` | 0.17 | 1 | MODULE_NOT_FOUND: react; falta NODE_PATH |

El timeout fue del supervisor, no una excepción del código científico. Al ejecutar por
shell, el proceso hijo siguió después del límite y el log llegó al bloque final
«Degradación de MAE en población B». No se presenta ese paso como una ejecución supervisada
exitosa ni se convierte su código 124 en 0. Los primeros análisis/documentos podían mezclar
resultados versionados con salidas nuevas, así que se repitieron cuando terminó la actividad
científica y quedó completo el registro. Para repetir el flujo completo, reservar más de
40 minutos para mejoras_e4.py y supervisar directamente el proceso Python.

## Correcciones de entorno y repetición final de Entrega 5

Se instalaron fuera del repositorio los módulos que pide el README, más docx para los informes:

```bash
npm install --prefix /tmp/lumine-doc-modules docx@9.5.1 pptxgenjs@4.0.1 \
  react@19.1.0 react-dom@19.1.0 react-icons@5.5.0 sharp@0.34.2
export NODE_PATH=/tmp/lumine-doc-modules/node_modules
export MPLCONFIGDIR=/tmp/lumine-mpl
export XDG_CACHE_HOME=/tmp/lumine-xdg
```

Las rutas de caché evitan los avisos de Matplotlib y Fontconfig sobre el HOME de solo lectura.
El entorno dispone de `soffice`, `pdfinfo` y `pdftoppm`; no se modificaron los generadores.

| Comando | Segundos | Salida | Resultado |
|---|---:|---:|---|
| `python entrega5/analisis/analisis_final.py` | 4.20 | 0 | Completado |
| `bash entrega5/informe/construir.sh` | 19.73 | 0 | Completado |
| `node entrega5/presentacion/generar_ppt.js` | 0.50 | 0 | Completado |

El PDF generado tiene **28 páginas**; el PDF versionado tiene **30**. Se obtuvo un PPTX
con 10 diapositivas. La generación funciona, pero no se demostró equivalencia visual o
binaria con los entregables publicados. No se sustituyeron los originales. La diferencia
de paginación queda pendiente de revisar con el entorno de fuentes/render original.

## Cambio Ridge y comprobaciones en clon limpio

```bash
python3 -m venv /tmp/lumine-venv
. /tmp/lumine-venv/bin/activate
pip install -r entrega3/prototipo/requirements.txt
python entrega3/prototipo/entrenar_ridge.py
python entrega3/prototipo/construir_app.py
python -m pytest entrega3/prototipo/tests -q
```

20 pruebas aprobadas (1,96 s en el clon limpio): simulador sin kit, WLTC de referencia,
energía disponible, fórmulas, estados, 12 salidas v3.1 y redteam 8/10; también equivalencia
con scikit-learn y entre Python y JavaScript. La segunda exportación de Ridge dejó
`modelo.json` idéntico byte a byte. El modelo de nivel 1 es idéntico al de la base.
Se comprobó N1 en Chromium en PC y teléfono, claro y oscuro, sin errores JavaScript ni
desborde horizontal. No se atribuyen al nuevo Ridge las métricas históricas del GBM.

| Caso N1 (diagnóstico de nivel 2) | Antes: GBM | Después: Ridge |
|---|---:|---:|
| Ahorro mostrado | 19,6% | 19,7% |
| Gasto mensual | $806.000 | $806.000 |
| Ahorro mensual | $158.000 | $159.000 |
| Recuperación conservadora | 22 meses | 22 meses |
| q80 | 1,40877 pp | 1,32823 pp |

Ridge usa StandardScaler + RidgeCV, alphas logspace(-3,3,13), las mismas 11 VARS_GPS y
los 300 conductores del CSV versionado. Alpha elegido: 0,31622777. Cada fold ajusta su
propio pipeline; GroupKFold separa conductores en 10 particiones. q80 usa residuos
absolutos fuera de muestra, cuantil ceil((n+1)*0,8)/n e interpolación higher.
MAE OOF: 0,77930 pp. No es directamente comparable con el MAE histórico de otro holdout;
la calibración aproximada no demuestra cobertura en conductores reales de Chile.

N1 produce 19,7025087%; $805.654,76 × 19,7025087% = $158.734,20, que redondea a
$159.000. Forzar $158.000 sería inconsistente con la fórmula. Se conserva una prueba
separada de la cifra histórica, sin alterar salidas.json ni resultados.

## GitHub

Se agregaron workflows de pytest y Pages. Pages requiere fuente GitHub Actions en
Settings → Pages y una regla del entorno github-pages que permita la rama elegida.
No se verificó publicación ni ejecución remota de Actions: la API GitHub devuelve
403 Forbidden, incluidos el intento de crear el PR y la consulta del repositorio.
El push Git sí funciona. El PR debe apuntar a `claude/quirky-darwin-326nn0`.
Durante el trabajo esa rama avanzó a `247a0ca`, añadiendo únicamente
`entrega5/registro_modelos.md`; no se editó ni se sobrescribió ese archivo.
