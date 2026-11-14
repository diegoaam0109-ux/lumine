# Fase 4 · Plan Financiero · Traspaso actualizado 14-11-2026

**Vigente: [excel/v6_academico_conciliado.xlsx](excel/v6_academico_conciliado.xlsx)**, construido sobre el último `Lumine_Plan_Financiero_Fase4 (3).xlsx` entregado por Diego. Leer primero [README.md](README.md), después §6 y [auditoría vigente](revision-13-11-2026/auditoria/actual_v6.md).

Las secciones 2–5 y 7–8 son antecedentes de v3–v5. Sus precios, calendario, CT, crédito propio y tasas no prevalecen sobre §6. Las hojas grises de esas versiones se conservan intactas.

## 1. Archivos

| Ruta | Estado |
|---|---|
| `excel/v6_academico_conciliado.xlsx` y `.pdf` | Modelo actual para revisión, con TIR/VAN calculados. |
| `generador_revision/` | Generación, recálculo, verificación independiente y escenarios. |
| `revision-13-11-2026/fuentes/base/Lumine_Plan_Financiero_Fase4_recibido.xlsx` | Original financiero vigente, conservado íntegro. |
| `revision-13-11-2026/auditoria/actual_v6.md` | Diagnóstico vigente y fuentes. |
| `revision-13-11-2026/fuentes/base/Lumine_Base_de_calculo_Fases_1_a_3.xlsx` | Base operativa anterior; antecedente. |
| `revision-13-11-2026/auditoria/INFORME.md` y auditorías temáticas | Antecedentes de esa base anterior; no aplicar mecánicamente al nuevo archivo. |
| `excel/v3_TIR6_actual.xlsx`, v4 y v5 | Históricos, sin modificación. |
| `excel/Costo_directo_kit_Lumine.xlsx` | Costeo histórico de otra especificación; no acredita la BOM actual. |

Se publica el modelo financiero con su fuente y código conforme a la solicitud del usuario. El Excel del curso usado como referencia, los informes DOCX y los CSV de encuesta no se incluyen en esta publicación.

## 2. Método de trabajo acordado

- Modelo en **pesos constantes, netos de IVA**. Inflación solo para deflactar depreciación/deuda y para Fisher.
- Flujo puro a **Ku** (CAPM con βU), inversionista a **Ke** (Hamada), VAN ajustado como verificación; WACC solo referencia.
- Capital de trabajo: **un solo método** (requerimiento = saldo al cierre; año 1 = máx(déficit acumulado máximo, saldo)).
- Valor de desecho: **contable** (decidido). El económico solo como referencia.
- Unidades enteras (kits, talleres, personas). Fondo blanco, celeste Lumine #12AAE9, números en negro.
- El complemento de Excel es bueno para fórmulas y malo para diseño: el diseño (Dashboard, formato) conviene hacerlo
  aparte. Trabajar **una hoja por vez** y revisar antes de seguir; los prompts gigantes generaron desorden.
- El complemento no puede crear tablas de datos (TABLE): las sensibilidades van con **selector de caso + foto de valores**
  y celda de control "FOTO DESACTUALIZADA".
- No ajustar supuestos para llegar a una TIR objetivo: cada supuesto debe tener fuente o quedar marcado como supuesto.
- Desde la v4 el libro se genera con `generador/generar.py` (openpyxl + LibreOffice), con fórmulas vivas y sin números
  escritos a mano en las hojas de cálculo; el complemento ya no hace falta. Las sensibilidades se toman igual: selector +
  foto de valores, ahora automática.

## 3. Datos históricos de la Fase 3 usados por v3–v5

- Precio de referencia con IVA: Esencial $4.290.000 / Plus $4.990.000 (neto $3.605.042 / $4.193.277). Mezcla 60% Plus.
  Precio "medio validado" por la encuesta (33 respuestas); se mantiene ligeramente sujeto a cambios.
- Costo directo del kit Fase 3 (Anexo 9): $2.991.086 / $3.350.171 al dólar $965,71; +$25.168 / +$28.886 por cada $10 de dólar.
- Nómina Tabla 16 (control): 151,98 / 266,51 / 432,10 / 575,70 / 760,68 millones.
- Tabla 18 (equipamiento por local), Tabla 19 (gasto operacional: arriendo $3,6 M/mes por local, servicios $700 mil,
  seguros $600 mil, mantención 3%, cursos y EPP $750 mil por técnico nuevo, plataformas), Tabla 11 (marketing).
- Capacidad: dúo 15,75 vehículos/mes (15 desde mayo de 2028, jornada 40 h); 6 dúos por local; regla del 80%.

## 4. Decisiones históricas al 08-11-2026 (vigencia actual: ver §6)

**Calendario.** Año 0 = 2027 (meses −12 a −10 trámite D.S. 67; −9 a −4 Proyecto Experimental; −3 a −1 preapertura).
Ventas desde enero de 2028 (año 1), suponiendo reglamento propio vigente (su atraso va como escenario). Pilotos son
preoperativos (inversión inicial, no ingresos: el proyecto experimental permite probar, no vender).

**Impuestos.** 2027 12,5%, 2028 15% (Pro Pyme), desde 2029 23% (Ley 21.850, 17-10-2026). Arrastre de pérdidas.

**Tasas (PROVISORIAS, se deciden después).** Solo Damodaran EE.UU.: Rf BCU 10 años 2,69% (19-10-2026) − spread de
default 0,72% = 1,97%; PRM Chile 5,33%; βU Auto Parts 1,02 (alt. 1,13 corregido por caja); t 23%; 60/40; Kd 8,4% nominal
(BCCh, sept. 2026) → real con Fisher.

**Mercado.** Dólar base 981,58 (promedio octubre 2026, SII); forward 0,35% de diferencial a 2 años; euro 1.098,15;
AUD 679,49; real 195,89; UF 41.295,46 (9-11-2026). Inflación 2027 2,8%, 2028 3,0%, luego 3%.

**Demanda propia (Bass).** p = 0,0026 (Massiani y Gohs, 2015); q = 0,52 estimado por el equipo ajustando Bass a ventas
de híbridos convencionales en Chile (ANAC 2018–2025: 866, 850, 696, 1.796, 2.552, 3.766, 6.291, ~10.100), rango
0,47–0,60 (Gohs 2022: q robusto al potencial). Techo: segmento laboral RM 162.891 × **100% (optimista, elegido para
esta versión)**; 50% en Anexos. Cobertura de biblioteca 60% año 1, 80% después. Rampa = Bass mensual.

**Red de talleres (por taller, nunca por instalación).** Parte el año 3; talleres nuevos 3 / 5 / 8 (supuesto).
Paquete de entrada $6.000.000 (derecho $3 M ≈ Bosch Car Service Brasil 2026, adhesión R$15.000; formación de 2
técnicos $1,5 M c/u). Suscripción "Lumine Habilita Red": cuota base $250.000/mes (ref. Bosch fee R$810/mes ≈ $158.700)
+ Habilita $45.000 por técnico al mes (canasta de redcapacitacion.cl, 07-11-2026: $527.830/año). La unidad de control la
compra el taller; Lumine solo activa el patrón. Arancel 3CV al costo (no público; D.S. 33/2004).

**Cobros y crédito directo (decisión del equipo).** Pie 30% al agendar. Una parte de las ventas con crédito directo de
Lumine (sin financiera), 24 cuotas, 1,5% mensual, bono financiamiento 5%, incobrables 3%. **v3 usa 50% a crédito;
propuesta en revisión: 30%** (ver §6).

**Personal (rentas brutas).** GG $1,9 M; RT $1,7 M; Ingeniería de Calibración $1,5 M (evaluar $1,7 M); Adm. y Personas
$900 mil; comerciales $850 mil + comisión; técnicos N1–N4 $700 / 770 / 840 / 900 mil; asistentes $692 mil;
administrador de plataforma y red (honorarios part-time $450 mil, luego $900 mil); soporte de red 1 por 15 talleres.

**Inversión y otros.** Dinamómetro AUD 30.000 + 10% (≈ $22,4 M, Mainline, por recotizar); arriendo del taller 1 desde
el mes −9 (el Proyecto Experimental necesita local); desarrollo de software valorizado a mercado (2.050 h × $13.000 =
$26,65 M); I+D $30 M (años 1–2) y $50 M (años 3–4), amortizado; CORFO Crea y Valida y Ley 20.241 (35%) solo como escenario.
Marketing fuerte en lanzamiento, primeros años y apertura de la red.

## 5. Por qué se descartó la v2 (TIR 169%)

Inversión chica ($198 M) frente a volúmenes de la Fase 3 (2.715 propias + 7.909 de la red al año 5), kit en mejor caso,
red con licencia por instalación (margen 70%) y talleres fraccionados. No eran errores de fórmula sino supuestos generosos.

## 6. Estado vigente: v6 académica conciliada

El usuario pidió adoptar la claridad del Excel del curso, sin sus cifras, y luego entregó la base financiera más reciente. Esa base ya incluía piloto de tres autos, software y evaluación. **No seguir esperando esos archivos ni usar el 20% de v4.** La versión `v6_revision_13-11-2026.xlsx` anunciada en un borrador nunca fue la entrega terminada; usar `v6_academico_conciliado.xlsx`.

### 6.1. Resultados y escala

TIR pura **13,42%**; VAN **$86,05 M** a Ku real 8,6529%; desembolso previo $214,38 M; equivalente en t0 $219,79 M; necesidad máxima sin deuda **$484,42 M**. CTN al abrir $61,20 M y final $401,38 M. Payback descontado 4,79 años. TIR del inversionista 15,55% y VAN a Ke $64,42 M, con deuda ilustrativa y aportes posteriores explícitos.

Precios con IVA $4.590.000 / $5.290.000; kit estimado $3.031.028 / $3.396.013; Plus 60%. Piloto 1 Esencial + 2 Plus. Un taller, instalaciones **291 / 516 / 660 / 660 / 804**. Apertura julio de 2028. Cobro con anticipo 30% y saldo al instalar, financiado por terceros; sin cartera propia. Son los supuestos del último archivo, no ventas observadas ni cotizaciones nuevas.

### 6.2. Correcciones explícitas al método

Se reemplaza la mezcla de déficit de caja y activo recuperable por **CTN contable mensual y −ΔCTN**. El déficit operativo de $259,99 M se conserva como medida de financiación y no se recupera como otro activo. Los 38 controles concilian la caja al flujo y al balance de inventario, tránsito, IVA y anticipos.

Capitalización de desembolsos reales previos a Ku/Ke; depreciación mensual desde puesta en servicio; impuesto por calendario con pérdidas arrastradas y pago en abril; liquidación del impuesto del último ejercicio al cierre. Flujo puro a Ku y de patrimonio a Ke; WACC y APV como referencias. Valor de desecho contable, sin perpetuidad. Estas correcciones están informadas: no se modificaron precios, kit o demanda para mejorar la TIR.

El crédito se modela **indexado con cuota real**, no como cuota nominal fija convertida incorrectamente. El 3% de recargo del recibido es sólo para deuda. D/V sectorial no acredita acceso bancario. CORFO/ángel no se reconocen como fondos adjudicados.

### 6.3. Qué condiciona el resultado

**Kit +5%: VAN −$226,32 M. Precio −5%: VAN −$305,18 M. Embudo bajo: VAN −$441,87 M.** Una baja de precio de 1,20% aproximadamente agota el VAN con volumen fijo. Sin liquidar al final, VAN −$203,53 M; la realización de CTN/activos es material.

Software $26,65 M = 2.050 h × $13.000 está incorporado como estimación, no cotización. Persisten BOM vigente y sus fuentes, descuento/arancel, permisos, pruebas, garantía de baterías, alcance de desarrollo productivo y financiación concreta. Ver auditoría vigente: no repetir como actuales omisiones ya corregidas del paquete anterior.

Simplificaciones por validar: calendario F29 y créditos de IVA; PPM; clasificación tributaria de vidas útiles y software; corrección monetaria real aproximada; tasa de deuda agregada asimilada a efectiva anual; observación exacta de Rf por adjuntar. Se pueden evaluar escenarios con ellos identificados; no afirmar que todas las hipótesis están acreditadas.

### 6.4. Revisión y reproducción

Hoja Datos única para entradas; flujos simétricos por activo, tablas francesa/alemana/americana, 36 meses de caja y 60 de CT. Resumen de seis indicadores y dos gráficos. Tabla viva precio/Ku y VAN=0 por bisección. Ver `generador_revision/construir.py`, `verificacion.json` y `escenarios.json`.

**Verificación:** sin errores de Excel, 38 controles a cero dentro de precisión numérica, 11.073 valores operativos conservados, flujo y rentabilidad reconstruidos independientemente en Python. No se tocaron las hojas grises ni v3–v5. Trabajar en `fase4-plan-financiero`; no abrir PR.

## 7. Pendientes históricos de v3–v5 (actuales: ver §6 y Decisiones)

Tasas (beta, riesgo empresa nueva, Ku o WACC) · techo de demanda con las respuestas de la encuesta · arancel 3CV
(vía Ley de Transparencia) · seguro de RC del proyecto experimental · desglose de habilitación del local · software y
licencias por cotizar · recotizar dinamómetro · fuente y tasa del crédito bancario · crédito por remuneraciones
(Ley 21.850) y depreciación instantánea Pro Pyme · personal y ritmo de la red · Fase 5: corregir Tabla 7 y el texto
de la Fase 3 que dice que Lumine distribuye kits a la red · informe Word de la Fase 4 (Carta, TNR 12, 1,5, márgenes
4/2,5, APA), sección por sección; objetivos financieros y estrategias de financiamiento se escriben al final.

Nuevos con la v4: respaldar el kit al punto medio con cotizaciones de componentes (es el supuesto que más pesa junto
con el dólar) · confirmar si la capacidad de 15,75 vehículos por dúo ya descuenta tiempos muertos (si es así, la regla
del 80% duplica la holgura) · confirmar con qué equipamiento se hace el Proyecto Experimental (la v4 lo compra en el
mes −9) · confirmar la tasa del crédito directo (el contrato es nominal; el modelo la usa en real).

## 8. Fuentes citadas por v3–v5 (sin revalidación en esta revisión)

Damodaran (Betas US, Country Risk Premiums, enero 2026) · Banco Central (Informativo diario 21-10-2026; Estadísticas
Monetarias sept. 2026; IPoM sept. 2026) · SII (dólar observado 2026; Res. 43/2002 vidas útiles) · Ley 21.850 (Buk, AZ) ·
ANAC (informes cero y bajas emisiones 2024–2025) · Massiani y Gohs (2015) · Gohs (2022, Marburg) · Talukdar, Sudhir y
Ainslie (2002) · Bosch Car Service, Manual do credenciado 2026 · redcapacitacion.cl · SENCE valores hora 2026 ·
Maxus y Mazda (términos y condiciones de financiamiento 2025–2026) · Transbank (comisiones, julio 2026) · Ley 20.241
(extensión a 2035) · CORFO Crea y Valida 2026 · Indeed y Chiletrabajos (sueldos 2026) · AIRe / La Tribune Auto (retrofit
en Francia: 400 vehículos en 2023).

## 9. v7 · formato del curso (14-11-2026)

`excel/v7_formato_curso.xlsx` es la v6 con una capa de presentación según las clases de Evaluación de Proyectos (hojas 1 a 7, pesos sin decimales, tabla de amortización y flujo en el orden del curso). No cambia números: las hojas de la v6 quedan ocultas e intactas y 39 controles nuevos dan cero. Se genera con `generador_revision/construir_v7.py` (`formato_profesor.py` + recálculo es-CL + verificación). Las decisiones de método abiertas están en `OBSERVACIONES_V7.md`. El Resumen se reemplazó por el Tablero y la hoja «Escenarios y cambios» (`tablero.py`; detalle en OBSERVACIONES_V7). Cualquier cambio en Datos se ve en el Tablero como diferencia frente a la base; la base y las fotos de escenarios se rehacen con `construir_v7.py`.
