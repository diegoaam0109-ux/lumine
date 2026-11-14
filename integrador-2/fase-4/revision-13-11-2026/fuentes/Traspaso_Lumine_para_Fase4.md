# Traspaso técnico y financiero de Lumine Motors para la Fase 4

13-11-2026. Preparado por Claude (sesión de Diego Alarcón) para la auditoría y reconstrucción de la Fase 4.

Convención: **[D]** dato publicado con fuente · **[R]** resultado de la investigación propia · **[E]** estimación calculada en la base · **[S]** supuesto · **[DE]** decisión del equipo · **[PC]** propuesta de Claude, sin confirmación expresa del equipo · **[P]** decisión pendiente · **[NR]** no recuperable desde esta sesión.

## 0. Resumen de decisiones vigentes

| Tema | Vigente en Fase 3 v10 | Tipo |
|---|---|---|
| Alcance de la Fase 3 | Llega a resultado operativo y flujo antes de financiamiento e impuesto a la renta. Sin tasa de descuento, VAN ni TIR | DE |
| Etapas | Piloto (12 meses) → decisión → transición → preapertura (3 meses desde la norma) → operación | DE |
| Calendario base | Piloto 2027; norma a comienzos de abril de 2028; apertura julio de 2028 | S (las dos últimas dependen de la autoridad) |
| Piloto | Espacio arrendado por uso y servicios; sin taller propio ni convenio confirmado | DE |
| Diseño del piloto | Un modelo, seis vehículos (2 Esencial, 4 Plus), un mes de línea base y seis con kit | PC (los seis vehículos venían de versiones previas) |
| Apertura | Gradual, con un dúo; un taller propio | DE |
| Regla de dúos | Nuevo dúo cuando los pedidos previstos superan 80% de la capacidad; decisión tres meses antes | PC |
| Segmento | Foco inicial: colectiveros y conductores de aplicación; taxis elegibles | DE |
| Red Lumine | Vende el método (entrada, cuota, Habilita por técnico), no kits. 3, 8 y 16 talleres en años 3 a 5 | DE (ritmo: PC) |
| Financiamiento al cliente | De terceros, sin crédito directo; pie de 30% | DE; convenio P |
| Financiamiento del proyecto | Por etapas; sin montos ni fuentes comprometidas | DE; fuentes P |
| Precio | Esencial $4.590.000 y Plus $5.290.000 con IVA. Diego pidió «subir un poco»; el monto (+$300.000) lo fijó Claude | DE (dirección) + PC (monto) |
| Pronóstico central | 290, 518, 662, 662, 806 instalaciones | E, con supuestos PC |
| Abastecimiento | Pedido mensual, dos meses de reposición, mínimo 10 kits; 10 en bodega y 10 en tránsito al abrir | PC |

## 1. Base de cálculo y versiones

Archivos entregados:

- `Lumine_Base_de_calculo_Fases_1_a_3.xlsx`: seis hojas (Supuestos, Mensual, Anual, Sensibilidad, Escenarios, Leeme), 8.360 fórmulas, 78 meses (enero de 2027 a junio de 2033). El selector `esc` de Supuestos cambia de escenario.
- `codigo_base/modelo.py`: genera el libro con openpyxl. `calc.sh` lo recalcula con LibreOffice para los tres escenarios; `final.py` copia los resultados a Escenarios y ejecuta las conciliaciones; `leer.py` lee los valores; `resultados.json` trae los valores mensuales y anuales de los tres escenarios.
- `Base_mensual_valores.csv`: la hoja Mensual en valores, con la clave de cada fila.

Qué reproduce: embudo de demanda, capacidad y dúos, pedidos, instalaciones y pendientes, compras, tránsito, inventario y pagos al proveedor, dotación y nómina, marketing, gasto de operación, inversión, IVA y caja. No calcula depreciación como gasto (solo deja la vida útil como criterio), ni impuesto a la renta, ni deuda.

Conciliaciones comprobadas en cada mes: pendientes, inventario, instalaciones ≤ capacidad y ≤ kits en bodega, caja acumulada.

### Cambios de diseño

**[NR] No tengo el modelo `v4_TIR20_kit_medio_credito30` ni `v5_presentacion`.** Nunca se cargaron en esta sesión y Diego indicó que no eran necesarios para cerrar la Fase 3. La base se reconstruyó desde las fuentes del informe y no está conciliada con v4. Lo que sí puedo documentar es el cambio entre versiones de la Fase 3:

| Variable | Fase 3 entregada (10-10) a v9 (13-11) | v10 (13-11) | Por qué |
|---|---|---|---|
| Instalaciones propias | 299 → 2.851 (informe del 10-10); 284 el año 1 en v9 | 290 → 806 | El pronóstico anterior era plano y perseguía una cifra; ahora sale de captación y conversión (comentarios de Diego y pauta de corrección) |
| Talleres propios | Tres | Uno | DE |
| Red | 42 talleres, 7.773 kits vendidos a la red | 16 talleres; ingresos por taller y técnico | DE: la red no vende kits |
| Dotación año 5 | 56 | 25 | Consecuencia de lo anterior |
| Apertura | Dos dúos (v9); enero y luego abril de 2028 | Un dúo; julio de 2028 | DE (gradual); fecha S |
| Inventario al abrir | Unos 70 kits, 227,6 millones | 20 kits, 43,5 millones pagados | PC, pedida por la pauta de corrección |
| Precio | $4.290.000 / $4.990.000 | $4.590.000 / $5.290.000 | DE del 13-11 |
| Piloto | Nueve meses, en taller propio | Doce meses con seis de circulación, espacio por uso | DE |

Parámetros que son propuesta mía y mueven el resultado: costo por cotización $10.000; 30 cotizaciones al mes por visitas; conversión 15% → 30% en doce meses; cancelación mensual de 5% de los pendientes; cobertura de la biblioteca 19% → 80% al sexto mes; pauta de $0,7 a $2,5 millones al mes; regla del 80%; recargo de flete en lotes chicos. Ninguno tiene dato observado.

## 2. Costeo del kit vigente

**[NR] No tengo la planilla que genera el Anexo 9.** En esta sesión solo recibí el informe con la tabla ya calculada; la fuente que el informe declara es «la planilla de costeo del equipo, con precios publicados consultados el 27 de septiembre de 2026 y dólar de $965,71». La bibliografía del informe no cita las páginas de los componentes (solo una referencia general de Toshiba SCiB). Por lo tanto no puedo entregar fabricante, modelo, URL, moneda ni impuestos por partida, ni acreditar que los precios correspondan a 71,3 V, 31 celdas de 30 Ah y motores de 4/6 kW.

Lo que hay, por versión y neto, es esto (Anexo 9):

| Partida | Esencial | Plus |
|---|---|---|
| Motores en rueda (2 × 4.000 W / 2 × 6.000 W) | 948.575 | 1.076.204 |
| Controladores (dos) | 460.572 | 692.028 |
| Celdas LTO (31 × 30 Ah) | 419.118 | 419.118 |
| Gestión de batería y contactor | 280.597 | 280.597 |
| Unidad de control, módulo inalámbrico y sensor de freno | 196.541 | 196.541 |
| Brida, soporte de pinza y pinzas traseras | 294.373 | 294.373 |
| Caja de batería, cables, protecciones y consumibles | 246.253 | 246.253 |
| Flete, cargos locales, carga peligrosa y courier | 125.059 | 125.059 |
| Alineación | 19.998 | 19.998 |
| Total al dólar de $965,71 | 2.991.086 | 3.350.171 |
| Total al dólar de $981,58 (el que usa la base) | 3.031.028 | 3.396.013 |

- **Descuento de 4,55% en motores y controladores: [NR].** El informe lo aplica sin fuente, cantidad mínima ni producto. Trátalo como descuento hipotético hasta ver la planilla.
- **Arancel:** la tabla no tiene una línea de derecho ad valorem. No sé si la planilla supone 0% por el tratado con China o lo omite. **[P]**
- **«Mejor caso del libro de costos» ($2.649.042 / $2.935.293):** el propio informe dice que no tiene cotización. No se usa en la base, salvo como fila de la hoja Sensibilidad.
- Un costeo anterior del equipo (USD 1.850 a 2.480) es de otra especificación: motores de 1.500 y 3.000 W y 21 celdas.

Pídele al equipo la planilla del 27-09-2026. Sin ella, el costo del kit es **[S]**, aunque el informe lo rotule como dato.

## 3. Prestaciones, compatibilidad y garantía

- **Respaldado por el fabricante, según el informe:** pico de 8 kW y 200 Nm solo para el motor de 4.000 W. No tengo la ficha; el informe no la cita en la bibliografía. **[NR]**
- **Extrapolado [S]:** 12 kW y 300 Nm de Plus (misma proporción sobre la potencia nominal). Importa: el Anexo 6 atribuye la diferencia de ahorro de Plus a ese par.
- **Simulado [E]:** todo el ahorro (medianas de 11,8% a 18,0%). 300 conductores sintéticos; validación con 45 jornadas reales de Chicago, donde el intervalo de 80% contuvo el valor en solo 33% de los casos. Ningún kit se ha medido en un auto.
- **Inconsistencia abierta [P]:** el informe dice litio-titanato y dos motores en rueda; la identidad visual y la página comercial dicen LFP y un motor central.
- **Integración que puede cambiar el costo [P]:** bridas y soportes por modelo (hoy un valor único de $294.373), convivencia con ABS y ESP, calibración por modelo (unos dos modelos al mes por persona, supuesto), certificación de la batería ante la SEC, homologación de cada combinación de kit y modelo, durabilidad de motores en rueda de bajo costo (objeción de un experto).
- **Garantía propuesta:** kit e instalación 3 años o 200.000 km; batería 5 años o 300.000 km, «sujeta a la garantía del proveedor». **No existe garantía de proveedor cotizada.** Las referencias son comparables extranjeros (Twin-E, 36 meses; Transition-One, 5 años o 100.000 km en batería) y el mínimo legal chileno de seis meses.
- **Reemplazo de la batería:** $699.715 netos, que es solo celdas ($419.118) más gestión y contactor ($280.597). **No incluye** mano de obra, caja y cables, flete de carga peligrosa, retiro ni valorización de la Ley N° 20.920. Costo completo: **[P]**.
- **Provisión de garantía:** 3% del costo del kit, $97.501 por vehículo **[S]**, sin base actuarial. Equivale a reponer los componentes de una batería en uno de cada siete autos. Rango de trabajo 2% a 5%; cada punto son unos $32.500 por instalación y 2,6 millones al año con 806 instalaciones. La base la trata como costo del período, no como fondo con desembolsos fechados.

## 4. Piloto y caja antes de abrir

Detalle mes a mes en `Etapas_previas_mensual.csv`. Resumen en millones de pesos:

| Partida | Monto | Cálculo | Tipo |
|---|---|---|---|
| Kits de prueba | 22,7 | 2 Esencial + 4 Plus al costo del Anexo 9, +10% por compra unitaria, +5% repuestos; 30% en febrero y 70% en marzo de 2027 | S sobre S |
| Honorarios Responsable Técnico | parte de 19,9 | $1.700.000 × fracción: 0,5 (meses 1–3), 1 (4–5), 0,25 (6–10), 0,5 (11–12) | S |
| Honorarios Ingeniería de Calibración | parte de 19,9 | $1.500.000 × fracción: 1 (meses 1–5), 0,25 (6–12) | S |
| Ensayos controlados | 4,8 | 6 vehículos × 2 ensayos × $400.000 | S, sin cotización (rango $250.000–$600.000) |
| Medición independiente | 6,0 | Global: 30% / 40% / 30% | S, sin cotización (4 a 9 millones) |
| Puesto por uso | 4,2 | $900.000 en 4 meses de instalación y retiro; $150.000 en 4 de inspección | S (arriendo publicado ÷ 6 puestos + 50%) |
| Técnicos por servicio | 2,5 | 2 técnicos × 7 días × $60.000, tres veces | S |
| Telemetría | 1,1 | $60.000 por equipo + $15.000 al mes por vehículo | S |
| Seguro, trámites, compensación | 3,2 | Seguro $1.500.000; notaría $500.000; $50.000 por día sin auto, 4 días por vehículo | S |
| Formación y protección | 3,0 | 4 personas × $750.000 | S |
| Escáner y herramientas de alta tensión | 2,6 | Escáner $1.429.000 [D, Paris.cl]; herramientas $1.200.000 [S] | D + S |
| IVA remanente | 5,9 | 19% de las compras afectas; se recupera contra débitos al vender | E |
| **Piloto** | **75,9** | | |
| Transición | 1,3 | Tres meses: honorarios a 0,1 de jornada y bodegaje de $100.000 | S |
| Equipamiento | 47,6 | Dinamómetro $22.423.170 (referencia sin cotizar); habilitación $15.000.000; bodega $4.000.000; mobiliario $4.000.000; elevador $2.150.000 [D, Importadora JAK] | D parcial + S |
| Pagos por kits | 43,5 | Dos pedidos de 10: anticipo 30% y saldo al mes siguiente, con recargo de flete | S |
| Personas | 13,7 | Responsable Técnico e Ingeniería de Calibración tres meses; dos técnicos dos meses, con factor de costo empresa | E |
| Arriendo, servicios, seguros, cursos | 16,2 | Arriendo $3.600.000 al mes [D, aviso de PortalInmobiliario]; resto S | D + S |
| Garantía de arriendo, lanzamiento, trámites | 6,1 | Un mes de garantía; $1.500.000 de lanzamiento; $1.000.000 de trámites | S |
| IVA remanente | 15,7 | | E |
| **Preapertura** | **142,8** | | |
| **Total antes de abrir** | **220,0** | | |

Ningún precio del piloto es publicado, salvo el escáner. Busqué referencias públicas de ensayos y medición y no encontré nada utilizable.

Qué pasa a la operación: el escáner y las herramientas; los 20 kits de la preapertura (son inventario, no gasto); el equipamiento. Los seis kits del piloto se retiran al cerrar el proyecto y la base **no** les asigna valor de recuperación: es conservador y está por decidir **[P]**.

Qué incluyen los 220 millones: 21,6 de IVA recuperable, 43,5 de inventario y anticipos, 50,2 de activo fijo, 3,6 de garantía de arriendo y unos 101 de gasto. **Qué queda fuera:** el déficit del primer año (268,8), con lo que la necesidad máxima acumulada es 489,8 millones en el mes 11 de operación; el trabajo de los socios (46,7, no caja); cualquier desarrollo de software (sección 5); constitución de la sociedad; imprevistos; costo financiero; y todo atraso de la norma, que suma unos 0,4 millones al mes solo mientras no se haya arrendado el local.

## 5. Software y trabajo de los socios

- **Los 46,7 millones no son software.** Son tiempo de gestión de los tres socios, valorizado a la renta de Gerencia General ($2.470.000): 0,75 jornadas equivalentes entre los tres durante el piloto, 0,3 en la transición y 3 en la preapertura. Es **[PC]**: fracciones y tarifa las puse yo, sin registro de horas. No es desembolso.
- **Los $26,65 millones de desarrollo de software: [NR].** No aparecen en ningún archivo que yo tenga; vienen del modelo v4. No puedo conciliarlos.
- **La base v10 no presupuesta desarrollo de software.** Solo incluye «Plataformas: alojamiento y mantención», $375.000 al mes desde la apertura **[S]**, y una persona a honorarios de media jornada para la plataforma de la red desde el año 3. Es un vacío que la Fase 4 debe cerrar.
- **Qué existe hoy (prototipos, hechos por el equipo con IA; trabajo ya realizado, sin costo registrado):** Lumine Habilita (aplicación web sin servidor propio, 39 competencias, una parte de 13 módulos de contenido hecha); página comercial con verificador y calculadora; estimador de ahorro (simulador y modelo predictivo de las entregas del ramo de IA). Están en el repositorio público del equipo.
- **Qué no existe:** firmware de la unidad de control y calibraciones; telemetría en producción; Habilita con cuentas reales, respaldo y soporte; estimador conectado a datos medidos; licencias y alojamiento dimensionados. Actividades, horas, tarifas y fechas de pago: **[P]**, no hay estimación.
- Para no contar dos veces: si la Fase 4 valoriza software como aporte de los socios, debe ser adicional a los 46,7 (que son gestión) y separar lo ya hecho de lo por pagar.

## 6. Cuotas para el cliente sin crédito propio

- **Convenio confirmado: ninguno.** El informe lo declara como tarea de la preapertura.
- Referencias que usa el informe: crédito de consumo a 48 meses al 25,6% anual **[D, Banco Central, informe de mayo de 2026]**, cuota de Plus $118.700; y la línea que BancoEstado anunció en abril de 2026 para taxis y colectivos, 0,82% mensual a 72 meses **[D, nota de prensa]**, cuota $68.300. El informe ya advierte que esa línea no está confirmada para un kit de posventa; es para vehículos, y no debe usarse como condición del kit.
- Alternativas realmente aplicables hoy, sin convenio: tarjeta de crédito en cuotas (el banco emisor financia; Lumine recibe el abono del adquirente y paga su comisión) y crédito de consumo que el cliente gestiona por su cuenta (Lumine cobra al contado). Comisión del adquirente, plazo de abono, cuotas sin interés con cargo al comercio, contracargos y tasa de aprobación: **[P]**, no los verifiqué.
- En la base: 2% del ingreso como costo de medios de pago **[S]** y cobro al contado (pie de 30% al pedir, saldo al instalar). Sin incobrables, porque no hay cartera propia.
- **Rótulos heredados, corregidos hoy en v10:** la Tabla 36 decía «después de descuentos a pilotos y del bono por financiamiento» y «medios de pago, evaluación de crédito e incobrables». En la base no hay bono de financiamiento, evaluación ni incobrables: el ingreso solo descuenta el 50% a los clientes piloto y el costo es el 2% de medios de pago. Quedó «después del descuento a los clientes piloto» y «Medios de pago: comisión de tarjeta o del financista (supuesto: 2%)».

## 7. Demanda y conciliación del informe

Archivos: `Encuesta_anonimizada.csv` (201 respuestas, sin la marca temporal; no tenía nombres ni correos) y `encuesta_calculo.py`, que reproduce la depuración.

Cadena del cálculo:

1. **Mercado [D + S]:** 35.820 taxis y colectivos (INE) + 30% de 126.960 autos de aplicación = 73.908. El 30% de jornada completa es supuesto.
2. **Techo [R]:** × 95,8% a bencina × 31,9% con intención definitiva y precio aceptado = 22.561. Es intención declarada en una muestra no probabilística, no compras.
3. **Curva de Bass [literatura]:** p = 0,03 y q = 0,38. Solo fija el techo anual («demanda atendible»); no determina las ventas.
4. **Ventas [E con supuestos PC]:** cotizaciones = pauta ÷ $10.000 + 30 visitas; × cobertura de la biblioteca; × conversión de 15% a 30%. La conversión no sale de la encuesta. Las ventas quedan bajo el techo los cinco años: las limita la pauta presupuestada.

Diferencias que encontré al recalcular desde el CSV:

| Cifra del informe | Recalculado | Lectura |
|---|---|---|
| 196 válidas (201 − 3 − 1 − 1) | 196 | Coincide. El caso «incompatible» es un taxi colectivo declarado como Ferrari diésel |
| 95,8% a bencina en el foco | 91 de 95 = 95,8% | Coincide |
| 31,9% | 30 de 95 = 31,6% (33,0% si la base son los 91 a bencina) | No lo reproduzco exacto. 31,9% equivale a 30 de 94. Efecto: techo de 22.330 en vez de 22.561, sin efecto en ventas |
| 194 evaluables: 53 / 47 / 94 | 196: 53 / 48 / 95 | Diferencia de dos casos que no sé explicar; el informe debió excluir dos por un criterio que no tengo |
| «Más de ocho de cada diez» conductores del foco con intención definitiva aceptaron $5.990.000 | 25 de 32 = 78% | **Error mío al justificar el alza de precio. Corregido hoy** en el informe, la base y el registro: «25 de los 32» |

Las tres diferencias que señalaron:

- **806 frente a 323 + 484 = 807:** redondeo. La base da 806,4 instalaciones (322,56 y 483,84). Agregué la nota a la fuente de la Tabla 22.
- **Asistente de postventa 2, 1, 2:** error de mi herramienta de edición al escribir celdas con valores repetidos, no de la base. La base da 0, 0, 1, 2, 2 y el total de dotación era correcto. El mismo error había invertido dos porcentajes de la Tabla 27 (2,4% y 2,5% en los años 1 y 3). Corregí la causa, reconstruí el documento y comparé todas las celdas: solo cambiaron esas dos filas.
- **Precios antiguos:** quedaba «$4,29 y $4,99 millones» en la tabla de alternativas del posicionamiento. Corregido. Los $4.990.000 y $5.990.000 que siguen en el texto son los montos que preguntó la encuesta y deben quedar.

Un riesgo que queda en el precio: la encuesta probó $5.990.000 y $4.990.000. Plus a $5.290.000 cae entre ambos, así que los 5 que aceptaron solo $4.990.000 respaldan Esencial, no Plus. La mezcla de 60% Plus es supuesto.

## Pendientes, en orden de impacto

1. Planilla de costeo del kit con fuentes por partida, descuento de 4,55% y arancel (77% del ingreso depende de ella).
2. Modelo v4 y v5 para conciliar; yo no los tengo.
3. Software: alcance, horas y costo de llevar los prototipos a producción; origen de los $26,65 millones.
4. Convenio o condiciones reales de medios de pago.
5. Garantía del proveedor de celdas y costo completo de reemplazo de batería.
6. Cotizaciones del piloto (ensayos, medición, seguro, puesto) y del dinamómetro.
7. Valor de recuperación de los seis kits del piloto.
8. Batería LTO o LFP y uno o dos motores: definir y alinear informe e identidad.
9. Régimen tributario y beneficios (Pro Pyme, IVA del activo fijo, I+D, Sence): no modelados.
10. Los parámetros comerciales marcados PC, que el equipo debería ratificar o cambiar.
