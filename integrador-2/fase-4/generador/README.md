# Generador del Plan Financiero (Fase 4)

Arma el Excel `../excel/v5_presentacion_<fecha>.xlsx` desde cero, con fórmulas vivas, y lo verifica con LibreOffice. Las
hojas grises del semestre anterior se copian byte a byte desde la v3 (no se tocan).

**v5 = v4 con presentación simplificada, mismos números.** `generar.py` se detiene si cualquier resultado se aparta de
`resultados_v4.json` (VAN, TIR, payback, inversión, capital de trabajo, EBITDA, flujos y las 140 filas anuales), de la
foto anterior de sensibilidades (34 casos y 3 escenarios) o de `espejo.py`.

```bash
python generar.py              # construye, toma la foto de sensibilidades, verifica, deja valores en caché y exporta el PDF
python generar.py --sin-foto   # igual, pero reutiliza foto_sensibilidades.json (más rápido; la celda de control avisa si quedó vieja)
python espejo.py               # modelo espejo en Python puro: debe dar la misma TIR y el mismo VAN que el Excel
```

Requiere Python con `openpyxl` y LibreOffice (su Python trae UNO; en Windows se busca en `C:\Program Files\LibreOffice`,
en otro lugar se indica con la variable `LO_PYTHON`). Usa una copia temporal del perfil `fase-3/generador/lo_es` (es-CL).

## Orden del libro

Visibles: Índice, Dashboard, Supuestos clave, 1. Inversión a 7. Punto de Equilibrio, Sensibilidades y Mensual (años 0 a 2).
Ocultas, con pestaña gris azulada: Supuestos detalle, Datos Fase 3, Motor mensual (cálculo), Anual (cálculo), Controles,
Pendientes y Registro de cambios. Después, las 12 hojas grises del semestre anterior.

## Archivos

| Archivo | Qué hace |
|---|---|
| `construir.py` | Ordena la construcción de las 19 hojas azules y escribe el manifiesto que usa LibreOffice. |
| `base.py` | Nombres y orden de las hojas, el libro (nombres definidos, controles, celdas enteras) y utilidades comunes. |
| `supuestos.py` | Supuestos clave (visible), Supuestos detalle y Datos Fase 3. Los datos de entrada viven solo aquí; los nombres definidos no cambian aunque el valor se haya movido a Supuestos clave. |
| `motor.py` | Motor mensual (72 columnas) y Anual: las mismas fórmulas de la v4, en hojas técnicas ocultas. |
| `hojas.py` | Hojas 1 a 7: tabla resumen arriba (millones de $) y el detalle en pesos agrupado y plegado. |
| `presentacion.py` | Índice, Dashboard, Sensibilidades, Mensual (años 0 a 2), Controles, Pendientes y Registro de cambios. |
| `estilo.py` | Formato: fondo blanco, Calibri, celeste #12AAE9, números en negro, rellenos de entrada, impresión Carta horizontal. |
| `injertar.py` | Pone las hojas azules en el paquete de la v3 (las que sobran, en partes nuevas antes de las grises), agrega sus estilos al final y comprueba que las partes de las hojas grises quedaron idénticas. |
| `lo_calcular.py` | Corre dentro de LibreOffice: `revisar` (errores, controles, enteros), `foto` (sensibilidades y escenarios), `valores` (caché) y `pdf` (solo hojas visibles). |
| `generar.py` | Orquesta todo y se detiene si hay celdas con error, controles distintos de 0, unidades no enteras o un número distinto del de la v4. |
| `espejo.py` | El mismo modelo en Python, mes a mes, para verificar el Excel por un camino independiente. |
| `foto_sensibilidades.json` | Última foto de sensibilidades (VAN, TIR y payback de cada caso, de los escenarios y del puente v3 → v4). |
| `resultados_v4.json`, `resultados_v5.json` | Resultados, detalle anual y controles de cada versión, tal como los calculó LibreOffice (la v5 debe ser igual a la v4). |

## Cómo está armado el modelo

- **Motor mensual (cálculo)**: 72 columnas (meses −12 a −1 y 1 a 60) con la misma fórmula en toda la fila.
  **Anual (cálculo)** es su espejo (suma del año o saldo al cierre) y alimenta las hojas 1 a 7. **Mensual (años 0 a 2)**
  solo enlaza al motor (meses −12 a 24) para mostrar la rampa y el déficit acumulado máximo.
- Crédito directo como cartera: cuota = PAGO × colocaciones vigentes; interés = saldo × tasa (equivale a PAGOINT y
  PAGOPRIN por cohorte). La tasa del contrato (1,5% mensual nominal) se usa en real con Fisher.
- Capital de trabajo: saldo al cierre de cada año; el año 1, el mayor entre ese saldo y el déficit acumulado máximo del
  flujo operativo de los meses −12 a 12 (método de clase).
- Controles: cada hoja registra sus controles con `L.control(...)`; se calculan en la hoja Controles y cada hoja muestra
  solo «Controles OK».
- Sensibilidades sin tabla de datos: cada supuesto sensible tiene sus alternativas A–C en Supuestos detalle; el selector
  de Sensibilidades activa un caso a la vez y `lo_calcular.py foto` guarda los resultados como valores, con una celda de
  control que avisa si la foto quedó desactualizada.
- Para cambiar un supuesto: editar el valor en `supuestos.py` y volver a correr `generar.py` (si el cambio es deliberado,
  la comparación con la v4 fallará: hay que cambiar `REFERENCIA` en `generar.py`). También se puede cambiar directo en
  Supuestos clave del Excel: el modelo recalcula, pero la foto de Sensibilidades queda marcada como desactualizada.

## Impresión

Carta horizontal. Cada hoja visible cabe en el ancho de una página a 100% (unas 128 unidades de ancho de Excel), así
ninguna letra impresa queda bajo 9 pt; Mensual (años 0 a 2) se imprime en dos páginas de 18 meses, con la columna de
rótulos repetida. El Dashboard cabe completo en la pantalla de un notebook de 14" (1280 × 720, cinta de opciones abierta).
