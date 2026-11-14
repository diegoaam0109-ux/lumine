# Auditoría de la v6 académica conciliada

14-11-2026. Fuente vigente: `Lumine_Plan_Financiero_Fase4 (3).xlsx`, recibido después del paquete operativo del 13 de noviembre. Esta auditoría sustituye como diagnóstico actual a `INFORME.md`, `financiera.md`, `operaciones.md` y `fuentes.md` de la base anterior. No confundir la Fase 3 de seis autos con este escenario de tres.

## Dictamen

El archivo recibido sí contenía evaluación financiera: TIR pura 11,38%, VAN $60,06 M a Ku 8,6529%, piloto de tres autos y $26,65 M de software. No correspondía seguir diciendo que faltaba toda la evaluación. La nueva v6 conserva sus operaciones y presenta los flujos en formato académico directo.

Tras corregir la conciliación del capital de trabajo y el calendario, la TIR pura es **13,42%** y el VAN **$86,05 M**. Son resultados de un escenario condicionado, **no evidencia suficiente para llamar sólido al negocio**. El costo del kit sigue siendo estimado y un alza de sólo 5% vuelve negativo el VAN. El tamaño de la inversión tampoco se resolvió haciendo desaparecer fondos: el máximo efectivo sigue en **$484,42 M**.

## 1. Qué permanece y qué cambió

Se conservan precios Esencial $4.590.000 / Plus $5.290.000 con IVA; kit $3.031.028 / $3.396.013; mezcla Plus 60%; piloto 1 Esencial + 2 Plus; embudo, compras, personal y calendario del último archivo. Las instalaciones resultan **291 / 516 / 660 / 660 / 804**, todas enteras. El costo del kit ponderado es $3.250.019; no es el costo medio artificial usado por la antigua v4.

La verificación compara 11.073 celdas numéricas de Mensual y Anual contra la fuente. Su valor no cambia. Los parámetros numéricos y las series exógenas se trasladaron a Datos; los motores referencian esas entradas. No se importó ningún precio, tecnología ni tasa del Excel antiguo del curso.

Cambios financieros explícitos:

- CTN contable por mes y variaciones reales, con presupuesto de caja separado.
- Capitalización de desembolsos anteriores a la apertura, con Ku o Ke según flujo. No es una factura de intereses ni un gasto fiscal deducible.
- Depreciación mensual desde entrada en servicio, incluida la ampliación de puestos.
- Pérdidas e impuesto por año calendario; pago en abril siguiente y liquidación de la obligación final al cerrar el horizonte.
- Crédito real indexado ilustrativo, principal calculado sobre la necesidad máxima; devengo mensual de interés y servicio anual. No es un contrato de cuota nominal CLP fija.
- Sensibilidad bidimensional de precio/Ku, precio de VAN=0, payback descontado, APV de referencia y puente entre caja mensual y flujos anuales.

## 2. Por qué $260 M no es igual a CTN recuperable

En el mes operativo 10, el motor recibido tiene CTN de $250,251 M frente a $61,200 M al abrir; además acumula EBITDA de −$70,935 M. Por lo tanto:

**Déficit operativo = (250,251 − 61,200) − (−70,935) = $259,986 M.**

Ese déficit es dinero requerido para atravesar la rampa. Parte se consume en pérdidas; no queda íntegramente como stock que se venda al final. El archivo recibido lo incorporaba como una inversión recuperable adicional y lo mezclaba con existencias iniciales y máximos anuales. Sus sumas internas cuadraban, pero faltaba un puente al balance operativo.

La v6 usa:

`CTN = inventario físico + tránsito/anticipos pagados + IVA remanente − anticipos netos de clientes`

`Flujo puro = EBITDA − impuesto pagado − capex − ΔCTN + recuperaciones finales`

Al abrir hay $61,20 M de CTN; al cerrar, $401,38 M. Su recuperación al 100% es una hipótesis de liquidación, editable en Datos!C34. No se recuperan adicionalmente los $260 M de déficit. Tampoco se descuenta dos veces el inventario inicial ni se cuenta una devolución automática del IVA.

## 3. Inversión y presupuesto de financiación

| Concepto | MM CLP reales |
|---|---:|
| Activos fijos previos | 50,202 |
| Puesta en marcha | 72,732 |
| Software estimado | 26,650 |
| CTN inicial (incluye IVA) | 61,200 |
| Depósito de arriendo | 3,600 |
| **Desembolso efectivo previo** | **214,384** |
| Costo de oportunidad a Ku hasta apertura | 5,402 |
| **Equivalente económico en t0** | **219,787** |
| **Necesidad máxima efectiva sin deuda** | **484,420** |

El máximo ocurre en abril de 2029. Incluye las etapas previas, software, ampliaciones y el calendario de impuesto modelado. No incluye un colchón arbitrario; tampoco es financiamiento comprometido. El nuevo flujo del primer año es −$269,122 M: por eso el menor importe en t0 no significa que el proyecto cueste $220 M en total.

Flujo puro anual en MM: **−219,787; −269,122; 18,094; 141,890; 33,446; 611,145**. El último incluye $401,377 M de CTN, $3,600 M de depósito y $33,528 M de activos a valor libro. No hay perpetuidad ni valor de empresa adicional.

Se conserva el costo de software de 2.050 h × $13.000, como estimación. No se atribuye una cotización ni un trabajo entregado. Se ubica en t0 por falta de cronograma de pagos; el aporte de gestión de los socios no lo reemplaza. El calendario explicita esta convención.

## 4. Tasas, deuda e impuestos

Ku real 8,6529%; Ke real 10,5757%; Kd real 7,8641%; WACC real 9,2508%. Se mantiene el criterio de flujo sin deuda a Ku; el WACC se muestra como referencia ($73,99 M de VAN) y el APV incorpora el escudo efectivamente aprovechado. El profesor adicional dio orientación, no cambió el criterio de evaluación de la cátedra. Ke/WACC constantes son referencias académicas basadas en D/E sectorial; la deuda aplicada se amortiza y ese cociente no se mantiene. El APV muestra por separado el escudo fiscal aprovechado.

Rf 2,63%, prima Chile 5,33%, beta desapalancada ajustada por caja 1,13 y D/E 41,46% provienen de la base vigente. La referencia sectorial no acredita una estructura de deuda alcanzable. El 3% adicional del archivo reciente sólo recarga el costo de deuda, no Ku/Ke.

D/V = 29,31% sobre la necesidad máxima produce deuda ilustrativa de $141,98 M. Las fuentes no contienen una aprobación bancaria. El máximo acumulado de aportes de patrimonio calculado con servicio de deuda es $377,34 M. CORFO, un ángel o fondos de socios no se anotan como ingresos asegurados. El esquema exige garantías, condiciones y capacidad de pago por verificar.

La tasa comercial 8,1% de mayo de 2026 se encontró en la fuente oficial, pero es promedio del sistema y se publica en base anual 360 días. El modelo la **asimila a tasa efectiva anual** al sumarle el recargo y usar Fisher: es una convención de trabajo, no una conversión contractual demostrada. Hace falta cotizar la periodicidad y reajustabilidad reales. La búsqueda ubicó el archivo oficial de informes diarios de octubre, pero no extrajo el PDF exacto que confirme 2,63% del 28/10; esa observación de Rf sigue sustentada en el archivo recibido, pendiente de adjuntar su página/serie.

La ley 21.850, artículo sexto transitorio, establece general 25,5% en 2027, 24% en 2028 y 23% desde 2029. No se mezcló con tasas Pro Pyme. Hay arrastre de pérdidas y ningún impuesto negativo. El año comercial julio–junio se cruza con ejercicios enero–diciembre.

Límites tributarios explícitos: sin PPM; impuesto anual pagado en abril; obligación final liquidada al cierre. Activos, depreciación y pérdidas reales suponen corrección monetaria perfecta; no se hizo una determinación tributaria nominal completa. Las vidas útiles normales del archivo y la amortización de gastos/software en tres años requieren validar la clasificación/deducibilidad de cada partida. No se sostiene que la tabla informativa de depreciación acelerada sea automáticamente aplicable.

El IVA mantiene el motor simplificado recibido. Falta formalizar desfase F29, documentos de importación y créditos de cada servicio. Los controles de caja confirman coherencia interna; no certifican el tratamiento fiscal.

## 5. Fragilidad cuantificada

| Ensayo completo, demás supuestos iguales | VAN, MM CLP |
|---|---:|
| Central | 86,05 |
| Kit +5% | −226,32 |
| Kit +10% | −604,01 |
| Precio −5% | −305,18 |
| Embudo bajo del archivo | −441,87 |
| Comisión equivalente a 2,35% del cobro bruto en todas las ventas | 27,55 |
| Recuperación de CTN al 75% | 19,79 |
| Sin deuda, flujo puro | 86,05 |

Resultados recalculados por LibreOffice desde copias del libro; parámetros exactos y métricas en `generador_revision/escenarios.json`. El caso de comisión es una prueba conservadora de todas las ventas a ese medio, no una mezcla observada.

El punto de equilibrio financiero por precio es aproximadamente **−1,195%** respecto del precio base, manteniendo volumen, mezcla y compras. Es una sensibilidad, no una recomendación para cambiar precio ni una estimación de elasticidad. La tabla bidimensional mantiene CTN constante y se controla que los anticipos de clientes al cierre sean cero en el escenario activo.

Sin liquidar CTN y activos al final, el VAN es **−$203,53 M**. El valor presente de recuperaciones representa alrededor del **52,31%** del valor presente de los flujos positivos. De ahí la importancia de justificar realización de inventario/tránsito y vida de los equipos.

## 6. Evidencia y límites para la defensa

Lo que aún no puede afirmarse como hecho: BOM del producto actual por fabricante/URL/precio; descuento 4,55%; arancel según origen y clasificación; compatibilidad técnica; garantía de baterías; seguro y autorizaciones; alcance del software productivo; convenios de crédito/pago y disponibilidad de capital.

Estos huecos no se resolvieron poniendo cotizaciones inventadas. El informe histórico identifica productos y anuncios que no necesariamente son equivalentes a la especificación de 71,3 V. Presupuesto es distinto de oferta firme. La prioridad es respaldar cada componente del kit y probar su tolerancia de costo, no bajar el costo para sostener un indicador.

El 2% de medios de pago se conserva como supuesto agregado sobre ingresos netos. Transbank distingue cuotas normales/emisor con abono completo y promociones con pagos parciales; no todas tienen el mismo calendario. El crédito sigue siendo de terceros, no una cartera directa de Lumine. La encuesta acredita preferencia declarada, no aprobación crediticia ni conversión comercial observada.

## 7. Fuentes consultadas

- [Ley 21.850, texto oficial BCN](https://www.bcn.cl/leychile/navegar?idNorma=1229250&idVersion=2026-10-17), artículo sexto transitorio y cambio permanente del régimen general.
- [SII: tasas de primera categoría](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_4708.htm) y [requisitos Pro Pyme](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7530.htm). La elegibilidad no se presume por ser un emprendimiento de estudiantes.
- [Damodaran: betas por industria](https://pages.stern.nyu.edu/adamodar/New_Home_Page/datafile/betas.htm), Auto Parts enero 2026: beta unlevered 1,02; ajustada por caja 1,13; D/E 41,46%. Se conserva la ajustada usada por el equipo.
- [BCCh: informe monetario y financiero mayo 2026](https://www.bcentral.cl/documents/d/banco-central/informe-mensual-de-estadisticas-monetarias-y-financieras-mayo-2026-pdf?download=true), promedio comercial 8,1%; no oferta a Lumine. [Tasas y metodología](https://www.bcentral.cl/areas/estadisticas/tasas-de-interes).
- [BCCh: archivo de informativos diarios](https://si3.bcentral.cl/estadisticas/Diario1/aplicaciones/Informativo/Anteriores.html), pendiente de adjuntar observación exacta de Rf.
- [Transbank: modalidades de cuotas](https://ayuda.transbank.cl/es//informacion-sobre-el-pago-en-cuotas) y [tarifas](https://ayuda.transbank.cl/es/tarifas-vender-transbank). Sirven para contrastar costos y abonos; no son un contrato de Lumine.
- [SII: devolución de IVA artículo 27 bis](https://www.sii.cl/ayudas/como_se_hace_para/guia_solicitar_devol_27_bis.pdf): condicionada; no se registró devolución automática de todo IVA inicial.

## 8. Verificación y reproducción

`construir.py` genera con openpyxl, recalcula con LibreOffice, compara la fuente y ejecuta un modelo financiero independiente desde las series operativas. Resultado: **38 controles** con tolerancia inferior a $1; **11.073 celdas operativas conservadas**; sin errores de Excel ni fórmulas financieras sin caché; flujos, VAN y TIR conciliados. La precisión residual máxima de los controles es inferior a $0,01.

Las tablas de precio son fórmulas vivas. Los ensayos completos se regeneran con `escenarios.py`; no deben confundirse con una actualización automática después de editar el XLSX. El PDF es sólo lectura. Las hojas grises y las antiguas versiones no se modifican.
