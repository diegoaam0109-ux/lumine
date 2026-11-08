# Instrucciones: simplificar la presentación del Excel v4 (08-11-2026)

**Objetivo.** Que el profesor entienda en 5 minutos que el proyecto es rentable y por qué. El Excel tiene que leerse
como un informe, no como un motor de cálculo.

**Regla de oro: NO CAMBIAR NINGÚN NÚMERO.** Los supuestos y resultados los está pivoteando el equipo aparte (Codex).
Esta tarea es solo de **orden, formato y visibilidad**. Al terminar, todo resultado debe ser idéntico al de la v4:
VAN a Ku $799.485.127, TIR 20,0%, inversión del año 0, capital de trabajo, EBITDA y flujos por año, iguales al peso a
`generador/resultados_v4.json`, y `espejo.py` debe seguir dando lo mismo. Si un cambio de orden mueve un número, se revierte.

Se trabaja en `generador/` (`construir.py`, `estilo.py`) y se regenera con `generar.py`. No se toca el modelo de
`espejo.py`. Las hojas grises del semestre anterior se mantienen byte a byte (`injertar.py` ya lo verifica).

## 1. Horizonte: 5 años en los flujos, detalle mensual solo de los años 0 a 2

- El flujo puro, el apalancado y el punto de equilibrio **siguen a 5 años**: los exige la estructura de la Fase 4.
- El motor de 72 columnas (meses −12 a 60) **se queda tal cual**, pero pasa al final del libro como hoja técnica oculta:
  `Motor mensual (cálculo)`. Las fórmulas no cambian; solo se mueve y se oculta.
- Hoja visible nueva **`Mensual (años 0 a 2)`**: 36 columnas (meses −12 a 24) que **solo enlazan** al motor, con unas
  25 filas clave: instalaciones, capacidad, ingresos, costos variables, nómina, gastos fijos, EBITDA, flujo operativo,
  saldo acumulado y capital de trabajo. Sirve para mostrar la rampa y el déficit acumulado máximo (método de clase).
- `Anual (años 0 a 5)` también pasa a hoja técnica oculta: las hojas 1 a 7 ya resumen por año.

## 2. Orden de las hojas (visibles primero)

1. **Índice** (nueva): título, una línea de resultado ("TIR 20,0% · VAN $799 M · payback 4,7 años"), una tabla con cada
   hoja, qué muestra e hipervínculo, la leyenda de colores (una sola vez en todo el libro) y el estado de los controles
   ("13 de 13 controles en 0").
2. **Dashboard**
3. **Supuestos clave**
4. **1. Inversión**
5. **2. Ingresos y Costos**
6. **3. Capital de Trabajo**
7. **4. Flujo Puro**
8. **5. Flujo Apalancado**
9. **6. Tasa de Descuento**
10. **7. Punto de Equilibrio**
11. **Sensibilidades** (hoy "Anexos")
12. **Mensual (años 0 a 2)**

Al final, con pestaña gris azulada y **ocultas**: `Supuestos detalle`, `Datos Fase 3`, `Motor mensual (cálculo)`,
`Anual (cálculo)`, `Controles`, `Pendientes`, `Registro de cambios`. Después, las hojas grises del semestre anterior,
sin tocar.

## 3. Supuestos: de 269 filas a una página

- **`Supuestos clave`** (visible, máximo ~45 filas, cabe en una pantalla): solo los supuestos que mueven el resultado o
  que el profesor va a preguntar. Calendario; precio Esencial y Plus; costo del kit (mezcla); dólar; demanda (p, q y
  techo); capacidad y regla de dúos; % a crédito, tasa y plazo; cobros de la red (paquete, cuota base y Habilita);
  impuesto por año; tasas (Rf, PRM, βU, Ku, Ke, WACC). Columnas: supuesto · valor · unidad · tipo (con fuente,
  provisorio o supuesto) · fuente y fecha en una línea corta.
- **`Supuestos detalle`** (oculta): todo lo demás, con las alternativas A–C de las sensibilidades, la canasta de
  Habilita, las rentas por cargo, la inversión por ítem y las referencias largas.
- **Clave técnica:** los valores se mueven, pero los **nombres definidos** (rangos con nombre) se conservan, para que
  ninguna fórmula cambie. Si `construir.py` referencia celdas por dirección, pasar primero a nombres y comprobar que los
  resultados no se mueven antes de reubicar.

## 4. Dashboard: que diga "es rentable" de un vistazo

- Seis tarjetas grandes, **en millones con un decimal** ("$799,5 M", "20,0%", "4,7 años"): VAN, TIR, payback
  descontado, inversión del año 0, punto de equilibrio del año 1 y EBITDA del año 5.
- Una tabla de 5 años con 4 filas, en millones: ingresos, EBITDA, flujo puro y flujo acumulado.
- Dos gráficos limpios: flujo puro por año (columnas, con el año 5 diferenciado por el valor de desecho) e ingresos por
  línea (taller propio, financiamiento y red). Sin bordes ni leyendas sobrantes, ejes en millones.
- Selector de escenario arriba a la derecha. Una sola nota al pie en letra chica: "Versión de trabajo: tasas, reglamento
  y precio provisorios". Nada de párrafos.

## 5. Hojas 1 a 7: resumen arriba, detalle plegado

- Cada hoja parte con una **tabla resumen de máximo 10 filas** (lo que va al informe) y debajo el detalle, **agrupado y
  plegado** con el esquema de Excel (Datos → Agrupar), para que se abra solo si se necesita.
- La "Guía de lectura" se reduce a **un subtítulo de una línea**.
- **Las filas de control salen de las hojas** y se juntan en la hoja `Controles` (cada control con su hoja de origen y
  su valor, que debe ser 0). En cada hoja queda solo un indicador pequeño: "Controles OK".
- `2. Ingresos y Costos`: arriba, estado de resultados de 5 años en ~15 filas (ingresos por línea, costos variables,
  margen de contribución, costos fijos, GAV, EBITDA, depreciación y amortización, EBIT). El desglose por partida va plegado.
- `Sensibilidades`: arriba, el tornado y una tabla con los **10 casos de mayor impacto** (caso · TIR · VAN ·
  diferencia). Los otros casos y el puente v3 → v4, plegados debajo.

## 6. Formato (igual en todas las hojas)

- Fondo blanco, **sin líneas de cuadrícula** (Vista → quitar cuadrícula). Fuente **Calibri** (o Arial): las de la marca
  no están instaladas en el computador del profesor.
- Título de hoja de 16 pt en celeste #12AAE9; subtítulo de 10 pt en gris; encabezados de tabla con relleno celeste y
  texto blanco; filas de total en negrita con borde superior; números en negro.
- **Un solo formato numérico por tabla:** las tablas resumen y el Dashboard en millones ($ M, un decimal); el detalle en
  pesos con separador de miles; porcentajes con 1 decimal; unidades enteras.
- Rótulos de año siempre iguales: "Año 0 (2027)", "Año 1 (2028)", etc.
- **Inmovilizar paneles** (títulos y primera columna) en toda hoja con más de 15 filas o 8 columnas.
- Anchos de columna fijos y parejos (rótulos ~40, cifras ~14); nada de texto largo dentro de celdas: las notas largas
  van como comentario de celda o en `Supuestos detalle`.
- Colores de entrada (con fuente, provisorio, supuesto) solo en `Supuestos clave` y `Supuestos detalle`; en el resto de
  las hojas no hay celdas de entrada.
- Zoom de 90% a 100% y la celda A1 seleccionada al abrir. El libro abre en el `Índice`.
- **Impresión y PDF:** Carta horizontal, ajustado al ancho de una página; cada hoja visible en 1 o 2 páginas como
  máximo; encabezado con "Lumine Motors · Plan Financiero" y pie con el número de página. El PDF se exporta solo con las
  hojas visibles.

## 7. Verificación al terminar

1. `python generar.py` pasa sin errores: sin celdas con error, controles en 0 y unidades enteras.
2. Resultados idénticos a `resultados_v4.json` (VAN, TIR, payback, inversión, capital de trabajo, EBITDA y flujos por
   año), y `espejo.py` da lo mismo.
3. Las hojas grises son idénticas byte a byte.
4. Abrir en Excel y en LibreOffice: el libro abre en el Índice, los hipervínculos funcionan, los grupos se pliegan y el
   Dashboard se ve completo sin bajar la pantalla en un notebook de 14".
5. Revisar el PDF página por página: nada cortado ni con letra menor a 9 pt.
6. Guardar como `excel/v5_presentacion_<fecha>.xlsx` (y su PDF), actualizar la sección 6 del traspaso con una línea
   ("v5 = v4 con presentación simplificada, mismos números") y hacer commit y push en la rama `fase4-plan-financiero`.
