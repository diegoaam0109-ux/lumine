# v7 · formato del curso: qué cambió y qué no calza con la metodología de clases

**Archivo:** `excel/v7_formato_curso.xlsx` (+ PDF de 32 páginas). Se genera con `generador_revision/construir_v7.py`.

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

**Ningún número cambió.** Las hojas de la v6 siguen en el libro, ocultas y sin modificar. Las hojas nuevas solo las leen.
Hay 39 controles nuevos al pie de la hoja Controles, y todos dan cero. Además, `construir_v7.py` compara los 19.533
valores numéricos de la v6 antes y después, y no encuentra diferencias. 

## Incongruencias con lo enseñado en clases (para decidir; no se cambió nada)

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
