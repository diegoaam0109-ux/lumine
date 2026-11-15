# v7 · formato del curso: qué cambió y qué no calza con la metodología de clases

**Archivo:** `excel/v7_formato_curso.xlsx` (+ PDF de 36 páginas). Se genera con `generador_revision/construir_v7.py`.

> **14-11-2026, noche: cifras vigentes** (secciones «Decisiones del 14-11-2026», «Respaldo con fuentes primarias» y
> «Local, bodega, mobiliario y demanda de arriba hacia abajo» y «Correcciones de la revisión cruzada», al final): VAN puro
> $148,49 M y TIR pura 16,75%; inversionista $124,3 M a Ke y TIR 20,12%. Las cifras de las secciones anteriores
> son de antes de esos cambios; los criterios descritos siguen vigentes.

## Qué se hizo (solo formato)

- Hojas visibles con la estructura de la Fase 4: 1 Inversión, 2 Ingresos y costos, 3 Capital de trabajo, 4 Flujo puro,
  5 Flujo financiado, 5.1 Tabla de amortización, 6 Tasa de descuento y 7 Punto de equilibrio, más los anexos A1 a A5.
- Todo en pesos, sin decimales, con el formato contable de las planillas del profesor (`$ 1.000.000`).
- El flujo sigue el orden de clases: ingresos, costos variables, margen de contribución, costos fijos, depreciación por
  activo, amortización de intangibles, resultado operacional, gasto financiero, resultado antes de impuesto, impuesto,
  resultado después de impuesto, (+) depreciación, (+) amortización, inversiones, capital de trabajo, recuperación,
  valor de desecho, préstamo y amortización de capital.
- La tabla de amortización usa el formato de la clase: monto, plazo, tasa y cuota PMT arriba; período, cuota, interés,
  amortización y saldo; SUMAS y gasto financiero. Se incluyen los modelos francés (aplicado), alemán y americano.
- La hoja 1 tiene el cuadro de activos de clases: inversión, vida útil, depreciación anual, depreciación acumulada y
  valor libro al año 5 (valor de desecho contable).
- «CTN» pasa a llamarse capital de trabajo en todo el libro.
- La hoja Datos conserva sus valores; solo cambió el formato de los números según su unidad.

**Ningún número cambió.** Desde el 14-11-2026 (tarde) el libro no tiene hojas ocultas: ver la sección «Libro transparente».
Hay 39 controles nuevos al pie de la hoja Controles, y todos dan cero. Además, `construir_v7.py` compara los 19.533
valores numéricos de la v6 antes y después, y no encuentra diferencias. 

## Incongruencias con lo enseñado en clases (para decidir; no se cambió nada)

Las cifras de esta sección son de antes de las decisiones del 14-11-2026.

1. **Momento del capital de trabajo.** En clases el capital de trabajo se invierte un período antes de usarlo y se
   recupera al final. La v6 registra cada aumento en el mismo año en que ocurre (los $202 M del año 1 caen en el
   año 1). Si se adelanta al año 0, como en clases, el VAN baja aproximadamente $25 M (cálculo directo: cada aumento adelantado un año a Ku). Las opciones son mantener la v6
   y explicarlo como cálculo mensual, o seguir la regla de clases.
2. **Impuesto por año calendario.** La v6 determina la renta de enero a diciembre y la paga en abril del año
   siguiente, pero los años del proyecto van de julio a junio. Por eso el impuesto de cada año del flujo no es t × RAI
   de esa misma columna, y el año 5 incluye además la liquidación final. En clases es t × RAI del año, con pérdida de
   arrastre. El jurado lo puede preguntar. Las opciones son explicarlo en el informe o calcularlo como en clases.
3. **Depreciación en un flujo real.** En clases la depreciación se deflacta porque es nominal fija; el traspaso §2
   también lo había acordado. La v6 la deja constante en pesos reales y la justifica con la corrección monetaria del
   régimen general. Las opciones son mantenerla y citar la corrección monetaria, o deflactarla como en clases. Si se
   deflacta, el VAN baja levemente.
4. **VAN ajustado frente a VAN a Ke.** El método de clases (VAN puro + VAN de la deuda) da $92,8 M. El flujo financiado
   descontado a Ke da $64,4 M. Ambos aparecen en el libro y no coinciden. Hay que elegir cuál es la cifra oficial del
   inversionista y explicar la diferencia en el informe.
5. **Vidas útiles contradictorias en Datos.** Las notas de la sección de equipamiento dicen 5 años para el escáner, la
   habilitación, el mobiliario y las herramientas, y 10 para el elevador. Los valores aplicados son 6, 10, 7, 3 y 8. Hay
   que corregir las notas o los valores.
6. **Punto de equilibrio en ventas.** La estructura pide el equilibrio en unidades y en ventas. La v6 solo daba
   unidades, así que la hoja 7 agrega las ventas de equilibrio (Q de equilibrio × ingreso neto promedio). Es una cifra
   derivada, no un supuesto nuevo.

## Tablero (14-11-2026)

Las primeras dos hojas del libro son el Tablero y la hoja «Escenarios y cambios». El Resumen de la v6 quedó oculto.

- **Selectores:** son listas desplegables, una por cada opción que se puede cambiar.
  - *Escenario de demanda* (Pesimista, Central u Optimista): reemplaza el número que antes se escribía en Datos!C43 y
    recalcula todo el libro. Cambia el embudo comercial (Datos, filas 62 a 75); no toca precios, costo del kit ni tasas.
  - *Flujo* (Puro o Inversionista) y *Año* (1 a 5): solo cambian lo que se muestra.
- **Doce tarjetas:**
  - Primera fila: VAN, TIR, tasa (Ku o Ke), payback descontado, inversión o aporte del año 0, y financiamiento
    máximo o aportes totales.
  - Segunda fila, para el año elegido: ingresos, EBITDA, resultado neto y flujo de caja. Al final de esa fila van el
    WACC y la relación D/P (con βu y βl).
  - Cada tarjeta muestra el cambio frente a la base: verde si mejora y rojo si empeora.
- **Cuatro gráficos y una tabla:**
  - Flujo de caja con el acumulado descontado.
  - Cascada del ingreso al resultado neto del año elegido.
  - Ingresos, costos operacionales y EBITDA.
  - Instalaciones frente al punto de equilibrio.
  - Tabla del flujo elegido para los años 0 a 5.
- **Escenarios y cambios:** 27 indicadores con su valor actual, la base, el cambio y las fotos de los escenarios pesimista
  y optimista. Un aviso indica cuándo las fotos quedaron desactualizadas.
- **Menú lateral:** enlaces a todas las hojas. Cada hoja tiene un «◀ Volver al Tablero».

**Base y fotos.** Se calculan al construir, con `construir_v7.py`: tres recálculos, uno por escenario. Pesimista: VAN
−$441,87 M y TIR −26,15%, igual al `embudo_bajo` de `escenarios.json`. Central: VAN $86,05 M y TIR 13,42%.
Optimista: VAN $393,67 M y TIR 27,67%. Para fijar una nueva base después de una corrección, hay que reconstruir.

**Prueba de auditoría.** Con el kit un 5% más caro, el tablero muestra VAN −$226,32 M (▼ $312,4 M frente a la base) y
TIR −3,19%. Es el mismo resultado que `kit_mas_5pct` de Codex.

**Botones.** Un botón que cambia el escenario con un clic necesita macros (.xlsm), y Excel las bloquea en archivos
descargados o compartidos. Por eso los selectores son listas desplegables, que funcionan en Excel de escritorio, Excel
en la web y LibreOffice.

## Libro transparente (14-11-2026, tarde)

Diego observó que las hojas del curso leían de hojas ocultas: «3 Capital de trabajo» copiaba la hoja oculta «Capital de
trabajo» de la v6, y esa a su vez leía el motor. Con eso no se podía revisar el cálculo. `transparentar.py` lo corrige
así:

- **Fórmulas reales en el curso.** Cada celda de las hojas 1 a 7 y de los anexos A1 a A5 tiene ahora la fórmula real,
  en pesos. Por ejemplo, el inventario de «3 Capital de trabajo» es `='Motor mensual'!U45`. Son 2.656 fórmulas
  trasladadas.
- **Sin duplicados.** Se eliminaron las 12 hojas duplicadas de la v6 (Costos, Inversión, Calendario, Capital de
  trabajo, Flujo puro, Flujo inversionista, Deuda, Impuestos, 3 años, CT mensual, Equilibrio y Sensibilidad) y el
  Resumen antiguo.
- **Celdas auxiliares.** Las 65 celdas intermedias que usaban esas hojas (por ejemplo, los auxiliares del payback o los
  aportes de los socios) quedan al pie de su hoja del curso, bajo «Cálculos auxiliares».
- **Motor visible.** El motor de cálculo se ve y tiene nombres claros: Motor mensual, Motor anual, Motor inversión,
  Motor resultados, Motor depreciación, Motor financiero y Motor sensibilidad. Trabaja en millones y lee sus
  parámetros desde Datos y desde las hojas del curso (por ejemplo, la vida útil y el monto de cada activo salen de
  «1 Inversión»). «Datos del tablero» también quedó visible.
- **Nada oculto.** Cualquier cifra se sigue con «Rastrear precedentes» o Ctrl + [ hasta su origen.
- **Verificación.** `construir_v7.py` compara 20.160 valores antes y después de transparentar: todos iguales, sin
  errores y sin hojas ocultas. Los selectores siguen funcionando. En pesimista, el VAN es −$441,87 M; con el kit un 5%
  más caro, −$226,32 M.
- **Colores del Tablero.** Quedaron fijos en el generador con la paleta del resto del libro (blanco, celeste y negro).
  La versión que retocó el complemento de Excel ya no hace falta.

## Todo el libro con el formato del curso (14-11-2026, tarde)

Diego observó que, aunque las hojas 1 a 7 ya estaban bien, el desglose de donde salían seguía siendo difícil de leer:
tablas antiguas, en millones y con filas sin nombre. Los cambios:

- **Todo en pesos.** El motor dejó de trabajar en millones, y ya no hay «/1000000» ni «*1000000» en las fórmulas
  (solo quedan dentro de las etiquetas del gráfico de cascada). El presupuesto de software en Datos también pasó a
  pesos.
- **Sin duplicados en el motor.** «Motor inversión» y «Motor resultados» eran otra vez las hojas 1 y 2 del archivo
  recibido, en millones. Se eliminaron y sus 255 fórmulas pasaron a «1 Inversión» y «2 Ingresos y costos», que ahora
  leen directo el «Motor anual».
- **Formato del curso en el motor.** Todas las hojas que quedan tienen títulos, encabezado celeste, secciones, pesos
  sin decimales y rótulos en todas las filas.
  - *Motor mensual:* encabezado con el mes en cada columna.
  - *Motor anual:* formato según la unidad de cada fila.
  - *Motor depreciación:* fila de meses y total por activo.
  - *Motor financiero:* las 27 filas, que no tenían nombre, ahora lo tienen (resultado tributario, impuesto pagado,
    flujo puro, préstamo, flujo del inversionista, cierres anuales), con una columna de total.
  - *Motor sensibilidad:* cada uno de sus 47 bloques indica si es un caso de la tabla A5 o un paso de la búsqueda del
    VAN = 0, y cada fila tiene su rótulo.
  - *Datos, Controles, Notas y Datos del tablero:* misma paleta.
- **Verificación.** `construir_v7.py` compara 19.935 valores: los de las hojas del curso y del Tablero son idénticos, y
  los del motor son iguales o exactamente 1.000.000 de veces el valor anterior (el paso de millones a pesos). Sin
  errores y sin hojas ocultas.

## Decisiones del 14-11-2026 (noche, tras la reunión con el profesor guía)

Se aplican con fórmulas sobre la v6 antes de dar formato (`generador_revision/decisiones.py`). La v6 decidida y
recalculada pasa a ser la referencia: `construir_v7.py` comprueba que el formato no cambia ninguno de sus 19.539 valores.

1. **El piloto y la transición quedan fuera de la evaluación.** Acuerdo con el profesor: el flujo parte con la
   preapertura, cuando ya existe el reglamento. El piloto (12 meses) y la espera del reglamento (3 meses) se
   financiarían aparte con un fondo público de investigación y desarrollo, sin afirmar que esté adjudicado (el que
   nombró el profesor es Startup Ciencia de ANID: hasta $134 millones por proyecto y exige una persona jurídica).
   - Selector en `Datos!C24` (0 = fuera; 1 = dentro, que recupera el cálculo anterior). En el motor mensual, los costos
     de esas etapas se multiplican por el selector (214 celdas).
   - El escáner y las herramientas de alta tensión, que compraba el piloto, se compran en el primer mes de preapertura
     (criterio conservador: el proyecto sigue pagando esos equipos).
   - La hoja 1 conserva las columnas Piloto y Transición, ahora en cero, para que se vea la decisión.
2. **Medios de pago ponderados por la encuesta.** El profesor indicó que no se ofrece crédito propio y que la alianza con
   una financiera no paga comisión: Lumine recibe el total. El 2% supuesto se reemplaza por un promedio ponderado
   (`Datos`, filas 37 a 40, y `C54`):
   - Encuesta del equipo, foco de aplicaciones y colectivos (95 casos), P32: 38 tarjeta de crédito en cuotas (40,0%),
     42 crédito bancario propio (44,2%) y 15 contado (15,8%). Son preferencias, no cupos ni aprobaciones.
   - Tarjeta de crédito: 2,19% + IVA, tarifa publicada por SumUp Chile («comisiones vigentes en 2026») para ventas sobre
     $15 millones al mes. Contraste: Mercado Pago Chile publica 2,69% bajo $2 millones al mes y ofrece comisión especial
     sobre $25 millones. Cuotas del emisor: el interés lo paga el cliente. El IVA de la comisión es crédito fiscal.
   - Crédito bancario y contado llegan por transferencia, sin comisión por venta.
   - Resultado: 40,0% × 2,19% = 0,88% de la venta neta.
3. **Tipografía.** Arial en todo el libro, 12 pt como mínimo; los títulos y las cifras grandes del Tablero conservan su
   tamaño. Columnas y filas de alto fijo se ensancharon en la misma proporción (`tipografia.py`).

| Indicador | Antes | Ahora |
|---|---:|---:|
| VAN puro (Ku 8,65%) | $86,05 M | $204,53 M |
| TIR pura | 13,42% | 20,99% |
| VAN inversionista (Ke) | $64,42 M | $178,68 M |
| TIR inversionista | 15,55% | 25,96% |
| Inversión equivalente en el año 0 | $219,79 M | $173,70 M |
| Fondos máximos sin deuda | $484,42 M | $435,62 M |
| Préstamo | $141,98 M | $127,67 M |
| Payback descontado | 4,79 años | 4,51 años |
| VAN sin recuperaciones de cierre | −$203,53 M | −$85,05 M |
| Pesimista (VAN / TIR) | −$441,87 M / −26,15% | −$348,62 M / −20,74% |
| Optimista (VAN / TIR) | $393,67 M / 27,67% | $537,23 M / 36,85% |
| Kit +3% / +5% | — / −$226,32 M | $26,86 M / −$93,15 M |
| Baja de precio que lleva el VAN a 0 | ~1,2% | 2,83% |

Descomposición: los medios de pago aportan $81,8 M de VAN (con el piloto dentro, el VAN sería $167,86 M) y sacar el
piloto y la transición, $36,7 M más.

**Pendiente de decisión:** si el escenario pesimista suma el alza del costo del kit (el profesor lo sugirió, justificado
con la historia del dólar) y con qué flujo se presentan los escenarios (el profesor pidió uno solo, el más realista).

## Respaldo con fuentes primarias, demanda y resúmenes (14-11-2026, noche)

Pedido del equipo después de la reunión: hacer todo lo conversado, sin dejar pendientes. Cambios:

1. **Hoja 1.1 Respaldo de la inversión.** Cada equipo con el eslabón más cercano al fabricante que publica precio, la moneda,
   el tipo de cambio, el arancel, la internación, el valor anterior y el método con su mes. Datos lee el valor de esta hoja.
   - Dinamómetro: Dynocom 2WD 5000 Series, US$29.995 de lista del fabricante, más US$750 de cargos locales; flete marítimo
     por confirmar. $30,27 M (antes $22,42 M).
   - Escáner: Launch X431 PRO V 5.0, US$679 en Alibaba (China). $0,67 M (antes $1,43 M de una tienda minorista).
   - Elevador: Importadora JAK, precio normal $2.390.000 + IVA (antes la oferta de $2.150.000, sin vigencia informada).
   - Herramientas de alta tensión por puesto: Wiha 91890 (US$693,31) y Fluke 1587 FC (US$1.080,55), tiendas oficiales.
     $1,75 M (antes $1,20 M). Los guantes y la protección personal ya estaban en el curso de alta tensión.
   - Bodega, habilitación y mobiliario: ver la sección «Local, bodega, mobiliario y demanda de arriba hacia abajo».
   - Las notas de vida útil que contradecían los valores aplicados (incongruencia 5) se reemplazaron.
2. **Hoja 1.2 Costo del kit, pieza por pieza**, para el kit de la Fase 3 (dos motores en las ruedas, 31 celdas de
   litio-titanato, 71,3 V): motores QS273 de 4.000 W (US$514,54) y 6.000 W (US$583,77) y controladores Fardriver ND72680
   (US$328,70), todos de QS Motor; celdas Yinlong (US$14, Gobel Power); BMS ANT de 32 series (US$149,28); el resto de las
   piezas, la logística y la puesta en regla con las fuentes del costeo de septiembre. Esencial $3,17 M (antes $3,03 M) y
   Plus $3,31 M (antes $3,40 M); la mezcla con 60% Plus queda en $3,26 M, 0,2% sobre la anterior: el costo **cuadra**.
   La hoja trae una imagen ilustrativa del kit, rotulada como conceptual.
3. **Tipos de cambio en Datos** (filas 14 y 15): dólar observado del 12-11-2026, $984,49 (SII), y euro del 11-11-2026,
   $1.089,61 (Banco Central).
4. **Hoja 2.1 Proyección de demanda**: de la pauta digital y las visitas a las cotizaciones, la cobertura de la biblioteca,
   la conversión, los pedidos, la capacidad de los dúos y las instalaciones, hasta los ingresos, por año y con total.
5. **Resúmenes arriba** en las hojas 1, 2, 3, 4, 5, 6 y 7; el detalle va debajo.
6. **Peso de las personas** en la hoja 2: 13,4% de los ingresos el año 1 y 8,6% a 9,6% después.
7. **Columna «Método»** en Datos para cada supuesto (dato publicado, encuesta, decisión, estimación o supuesto).
8. El Tablero suma enlaces a las hojas nuevas.

| Indicador | Tras las decisiones | Con fuentes primarias |
|---|---:|---:|
| VAN puro (Ku 8,65%) | $204,53 M | $185,53 M |
| TIR pura | 20,99% | 19,56% |
| VAN inversionista (Ke) | $178,68 M | $160,38 M |
| TIR inversionista | 25,96% | 23,98% |
| VAN ajustado (puro + deuda) | — | $192,09 M |
| Inversión equivalente en el año 0 | $173,70 M | $183,22 M |
| Fondos máximos sin deuda | $435,62 M | $447,94 M |
| Préstamo | $127,67 M | $131,29 M |
| Payback descontado | 4,51 años | 4,56 años |
| VAN sin recuperaciones de cierre | −$85,05 M | −$108,69 M |
| Pesimista (VAN / TIR) | −$348,62 M / −20,74% | −$362,73 M / −21,17% |
| Optimista (VAN / TIR) | $537,23 M / 36,85% | $514,23 M / 34,98% |
| Kit +3% / +5% | $26,86 M / −$93,15 M | $7,34 M / −$113,14 M |
| Baja de precio que lleva el VAN a 0 | 2,83% | 2,56% |

## Local, bodega, mobiliario y demanda de arriba hacia abajo (14-11-2026, noche)

Los tres ítems que seguían como supuesto ahora tienen respaldo en la hoja 1.1, con fuente y mes:

| Ítem | Antes | Ahora | Respaldo |
|---|---:|---:|---|
| Bodega de baterías clase 9 | $4,00 M | $17,03 M | Dos armarios asecos ION-STORE-90 (US$8.560 c/u, DENIOS) + arancel máximo de la autorización sanitaria de la SEREMI (D.S. N° 43, $177.300, ChileAtiende). La capacidad de dos armarios frente al inventario de kits no está verificada. |
| Habilitación del local | $15,00 M | $26,60 M | Piso epóxico 360 m² a $25.000/m² (Cronoshare), eléctrica e iluminación 400 m² a $9.000/m² (tope del rango de Jobbing), oficina 40 m² a $350.000/m² (Jobbing). El local se arrienda construido: no hay obra gruesa. |
| Mobiliario y computadores | $4,00 M | $11,56 M | Cinco ThinkPad E14 Gen 7 a $1.799.990 con IVA (Lenovo) + muebles $4,00 M (supuesto del equipo). |

Las notas de vida útil de Datos (filas 165 a 171) ahora citan la clase de la tabla del SII y remiten a la hoja 1.1.

**Demanda de arriba hacia abajo en la hoja 2.1.** Se agregó, antes del embudo, el tamaño de mercado del informe de la Fase 3:
TAM 4.409.729 vehículos (INE 2025), SAM Región Metropolitana 1.685.930, segmento laboral 162.780 (taxis 22.838, colectivos
12.982 y conductores de aplicación 126.960, estimación) y la curva de Bass con p = 0,0026 y q = 0,709 (Massiani y Gohs, 2015).
La demanda atendible (Bass × cobertura de la biblioteca) es 447, 990, 1.971, 3.835 y 7.137 vehículos; las instalaciones del
modelo (291, 516, 660, 660, 804) son el 65%, 52%, 33%, 17% y 11% de ella. El pronóstico sigue siendo el menor entre el embudo
comercial, la capacidad y los kits, mes a mes; Bass no entra por fórmula al flujo, sirve de techo y contraste. La CAGR no se usa
porque exige una serie histórica que un producto nuevo no tiene.

| Indicador | Con fuentes primarias | Con local, bodega y mobiliario |
|---|---:|---:|
| VAN puro (Ku 8,65%) | $185,53 M | $161,94 M |
| TIR pura | 19,56% | 17,51% |
| VAN inversionista (Ke) | $160,38 M | $137,0 M |
| TIR inversionista | 23,98% | 21,14% |
| VAN ajustado (puro + deuda) | $192,09 M | $169,0 M |
| Inversión equivalente en el año 0 | $183,22 M | $222,0 M |
| Fondos máximos sin deuda | $447,94 M | $483,1 M |
| Préstamo | $131,29 M | $141,6 M |
| Payback descontado | 4,56 años | 4,63 años |
| VAN sin recuperaciones de cierre | −$108,69 M | −$141,8 M |
| Pesimista (VAN / TIR) | −$362,73 M / −21,17% | −$390,56 M / −20,95% |
| Optimista (VAN / TIR) | $514,23 M / 34,98% | $490,74 M / 32,11% |
| Kit +3% / +5% | $7,34 M / −$113,14 M | −$16,41 M / −$137,14 M |
| Baja de precio que lleva el VAN a 0 | 2,56% | ≈2,2% (precio −2% da VAN $17,21 M) |

Lectura: el local, la bodega y los muebles suman $32,2 M a la inversión y bajan el VAN en $23,6 M (13%). Lo que manda sobre el
resultado sigue siendo el margen por kit: un alza de 3% en el costo del kit o una baja de 2,2% en el precio dejan el VAN en cero.

## Correcciones de la revisión cruzada (14-11-2026, noche)

Una revisión externa del libro encontró cuatro puntos; los cuatro se corrigieron:

1. **Comisión de tarjetas subestimada.** El 2,19% (+ IVA, que es crédito fiscal) se cobra sobre el monto pagado, que incluye
   el IVA de la venta. Sobre el ingreso neto, la tarjeta cuesta 2,19% × 1,19 = 2,61%; con 40% de ventas por tarjeta, el
   promedio pasa de 0,88% a **1,04%** (`Datos!C54 = C37*C40*(1+C44)`).
2. **TIR sin sentido económico.** La foto del pesimista mostraba una TIR inversionista de −929,28%: Excel y LibreOffice pueden
   devolver una raíz menor que −100%. La fórmula de TIR de las hojas 4 y 5 ahora solo acepta raíces mayores que −99% (prueba
   tres valores iniciales y, si ninguna sirve, dice «TIR no definida»), y `construir_v7.py` se detiene si una foto trae una TIR
   menor que −100%. Con los flujos vigentes, la TIR inversionista del pesimista es −34,08%.
3. **Alcance explícito.** Datos (fila 24), la nota de la hoja 1 y Notas dicen que se evalúa la etapa comercial, una vez
   terminado el piloto y publicado el reglamento; la etapa previa se financiaría con un fondo público de I+D no adjudicado, y
   una evaluación del desarrollo completo tendría que sumarla.
4. **Fletes y rótulos.** Dinamómetro: flete LCL estimado con las medidas máximas publicadas (1,24 m³) × US$180 por m³ (tope
   del rango 2026 de Suaid Global) más el seguro teórico de 2% del FOB; el transporte dentro de EE.UU. no está incluido.
   Escáner y herramientas: provisión de courier de 10% del precio, rotulada como supuesto. La columna «Método» de Datos ya no
   marca como «dato publicado» las estimaciones, los supuestos, el crédito ilustrativo, las convenciones del curso ni los
   sueldos tomados de la Fase 3.

| Indicador | Antes de la revisión | Después |
|---|---:|---:|
| VAN puro (Ku 8,65%) | $161,94 M | $148,49 M |
| TIR pura | 17,51% | 16,75% |
| VAN inversionista (Ke) | $137,0 M | $124,3 M |
| TIR inversionista | 21,14% | 20,12% |
| VAN ajustado (puro + deuda) | $169,0 M | $155,6 M |
| Inversión equivalente en el año 0 | $222,0 M | $223,3 M |
| Fondos máximos sin deuda | $483,1 M | $486,4 M |
| Préstamo | $141,6 M | $142,6 M |
| Payback descontado | 4,63 años | 4,66 años |
| VAN sin recuperaciones de cierre | −$141,8 M | −$155,7 M |
| Pesimista (VAN / TIR pura / TIR inversionista) | −$390,56 M / −20,95% / −929,28% (error) | −$399,08 M / −21,56% / −34,08% |
| Optimista (VAN / TIR) | $490,74 M / 32,11% | $473,45 M / 31,20% |
| Kit +3% / +5% | −$16,41 M / −$137,14 M | −$29,98 M / −$150,91 M |
| Baja de precio que lleva el VAN a 0 | ≈2,2% | ≈2,0% (precio −2% da VAN $3,89 M) |

Las capturas de las páginas de precios no se pueden guardar desde esta sesión; la hoja 1.1 indica proveedor, sitio y fecha
de consulta para que el equipo las tome.

