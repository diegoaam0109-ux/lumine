# Generador del Plan Financiero (Fase 4)

Arma el Excel `../excel/v4_*.xlsx` desde cero, con fórmulas vivas, y lo verifica con LibreOffice. Las hojas grises del
semestre anterior se copian byte a byte desde la v3 (no se tocan).

```bash
python generar.py              # construye, toma la foto de sensibilidades, verifica, deja valores en caché y exporta el PDF
python generar.py --sin-foto   # igual, pero reutiliza foto_sensibilidades.json (más rápido; la celda de control avisa si quedó vieja)
python espejo.py               # modelo espejo en Python puro: debe dar la misma TIR y el mismo VAN que el Excel
```

Requiere Python con `openpyxl` y LibreOffice (su Python trae UNO; en Windows se busca en `C:\Program Files\LibreOffice`,
en otro lugar se indica con la variable `LO_PYTHON`). Usa una copia temporal del perfil `fase-3/generador/lo_es` (es-CL).

## Archivos

| Archivo | Qué hace |
|---|---|
| `construir.py` | Las 15 hojas azules. Todos los datos de entrada están en Supuestos o en Datos Fase 3; las demás hojas solo tienen fórmulas (los rótulos de años también son fórmulas). |
| `estilo.py` | Formato: fondo blanco, celeste #12AAE9, números en negro, rellenos de entrada (con fuente, provisorio, supuesto). |
| `injertar.py` | Pone las hojas azules en el paquete de la v3, agrega sus estilos al final y comprueba que las partes de las hojas grises quedaron idénticas. |
| `lo_calcular.py` | Corre dentro de LibreOffice: `revisar` (errores, controles, enteros), `foto` (sensibilidades y escenarios), `valores` (caché) y `pdf`. |
| `generar.py` | Orquesta todo y se detiene si hay celdas con error, controles distintos de 0 o unidades no enteras. |
| `espejo.py` | El mismo modelo en Python, mes a mes, para verificar el Excel por un camino independiente. |
| `foto_sensibilidades.json` | Última foto de sensibilidades (VAN, TIR y payback de cada caso, de los escenarios y del puente v3 → v4). |
| `resultados_v4.json` | Resultados y detalle anual del archivo final, tal como los calculó LibreOffice. |

## Cómo está armado el modelo

- **Mensual (años 0 a 5)** es el motor: 72 columnas (meses −12 a −1 y 1 a 60) con la misma fórmula en toda la fila.
  **Anual** es su espejo (suma del año o saldo al cierre) y alimenta las hojas 1 a 7.
- Crédito directo como cartera: cuota = PAGO × colocaciones vigentes; interés = saldo × tasa (equivale a PAGOINT y
  PAGOPRIN por cohorte). La tasa del contrato (1,5% mensual nominal) se usa en real con Fisher.
- Capital de trabajo: saldo al cierre de cada año; el año 1, el mayor entre ese saldo y el déficit acumulado máximo del
  flujo operativo de los meses −12 a 12 (método de clase).
- Sensibilidades sin tabla de datos: cada supuesto sensible tiene sus alternativas A–C en Supuestos; el selector de
  Anexos activa un caso a la vez y `lo_calcular.py foto` guarda los resultados como valores, con una celda de control
  que avisa si la foto quedó desactualizada.
- Para cambiar un supuesto: editar el valor en `construir.py` (función `hoja_supuestos`) y volver a correr `generar.py`;
  o cambiarlo directo en la hoja Supuestos del Excel (el modelo recalcula, pero la foto de Anexos quedará marcada como
  desactualizada hasta volver a generarla).
