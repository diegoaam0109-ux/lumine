> **Antecedente histórico de la base operativa anterior.** El último Excel financiero recibido y su revisión están en [actual_v6.md](actual_v6.md). Las cifras de seis autos/$490 M y las omisiones detectadas aquí no describen automáticamente la v6 vigente.

# Revisión del traspaso de Lumine para Fase 4
Fecha de revisión: 13 de noviembre de 2026.

## Dictamen de alcance
El paquete permite reproducir la base operativa y resolver pendientes de información. No constituye aún una evaluación de proyectos: no incluye impuesto a la renta, financiación, tasas de descuento, VAN, TIR ni desarrollo productivo de software. Los resultados son en pesos de 2026. Reproducir una cifra demuestra la trazabilidad del cálculo, no la validez comercial o técnica de sus supuestos.

Se revisaron el traspaso, la base Excel y sus exportaciones, el código recibido, los documentos de Fases 1–3 y cierre, la encuesta original/anonimizada y antecedentes de v4/v5 del repositorio. Las tesis adjuntas no se utilizaron para validar precios ni parámetros específicos de Lumine.

Verificación ejecutada en copias: modelo.py → calc.sh → final.py con LibreOffice. Los tres escenarios reprodujeron las series mensuales entregadas: 8.360 fórmulas, cero errores de cálculo y conciliaciones de pendientes, inventario, capacidad y caja correctas. Esto valida la ejecución del motor bajo sus supuestos actuales; los límites de sensibilidad y evidencia se detallan abajo.

## 1. Pendientes cerrados o acotados

| Pendiente declarado | Resultado de esta revisión | Estado |
|---|---|---|
| No se dispone de v4/v5 | Recuperadas desde la referencia local origin/fase4-plan-financiero. La v4 coincide byte a byte con la subida anteriormente. Los resultados financieros compartidos y series anuales de v4/v5 coinciden; cambian presentación y controles. | Cerrado: no volver a pedir estos archivos |
| Origen de $26,65 M de software | 900 h Habilita + 350 h web/estimador + 800 h control = 2.050 h × $13.000. Fuente: PROMPT_v3_partes_A_B.txt, línea 140; v4 Supuestos B215:B221 y v5 Supuestos detalle B216:B222. | Origen recuperado; costo vigente pendiente |
| Origen del 4,55% | Primer cuartil de 15 rangos de precios de Alibaba heterogéneos en el costeo histórico: Supuestos E31, Parametros B22. Exacto: 4,554865%. | Estimación histórica; no descuento comercial acreditado |
| 194 respuestas evaluables | 196 generales menos dos respuestas fuera del dominio Sí/No en P29 = 194. Se reproducen 53/47/94. | Cerrado con script corregido en copia |
| Adopción 31,9% | 29/91 = 31,8681%, como ya declara la Tabla 19. El script original contaba indebidamente un caso inválido como aceptación del precio bajo. | Cerrado, con denominador conservador explícito |
| $46,7 M de socios | Gestión no pagada, calculada con dedicaciones supuestas. No es software ni caja aportada. | Naturaleza aclarada; valorización sigue siendo supuesto |
| Costeo actual por componente | El libro recuperado es 48,3 V/21 celdas/1,5–3 kW; no valida 71,3 V/31 celdas/4–6 kW. | Pendiente: BOM actual, SKU, precio, flete, arancel y compatibilidad |

Los precios públicos son una fuente admisible para estimar costos si se conserva producto, especificación, fecha y condiciones. No se exige una cotización privada para cada partida; sí evitar presentar una estimación o un componente no equivalente como precio confirmado.

## 2. Encuesta reproducida
- 201 recibidas → 196 válidas generales → 194 evaluables para la escalera de precios.
- 53 aceptan $5.990.000; 47 solo aceptan $4.990.000; 94 rechazan ambos.
- Foco aplicaciones/colectivos: 95; a bencina: 91; intención definitiva con precio aceptado y evaluable: 29.
- Techo descriptivo: 73.908 × (91/95) × (29/91) = 22.561,389.
- 25/32 = 78,125% se reproduce. Un caso de precio no evaluable permanece en ese denominador y en el denominador 91; se trata como criterio conservador, no como rechazo observado. Solo evaluables darían 25/31 y 29/90: no cambiar de denominador para mejorar el resultado.
- En el foco, 38 prefieren tarjeta y 42 crédito bancario: 80/95 = 84,2% prefieren financiación; esto no acredita cupo ni aprobación crediticia.
- La muestra es no probabilística; intención y precios hipotéticos no acreditan ventas, conversión comercial ni mix 60% Plus.

Evidencia de las exclusiones: filas físicas 18 y 19 del CSV contienen en P29 respuestas de otra pregunta. El documento ya menciona dos casos durante la transición del formulario. Se conservaron en la base general; no se reasignaron respuestas.

## 3. Cifras reproducidas de la base central
Millones de pesos de 2026; antes de financiación e impuesto a la renta.

| Concepto | Millones |
|---|---:|
| Piloto | 75,948 |
| Transición | 1,260 |
| Preapertura | 142,766 |
| Desembolso acumulado previo a abrir | 219,974 |
| Flujo del primer año operativo | -268,846 |
| Necesidad máxima acumulada | 489,781 |
| Caja acumulada al cerrar cinco años, sin liquidación | -20,957 |
| Capital de trabajo operativo al cierre del año 5 | 404,659 |

El máximo se produce en mayo de 2029, mes 11 de operación (mes 29 del calendario que parte en enero de 2027). Los $489,8 M incluyen los $220,0 M anteriores a la apertura; no deben sumarse otra vez.

Los $220 M no son el capital total necesario ni equivalen automáticamente a la inversión económica en momento cero. Los $489,8 M son una necesidad de financiación calculada con el alcance actual, no una fuente comprometida ni un monto definitivo.

| Año operativo | Instalaciones esperadas | Resultado operativo (M) | Flujo de caja (M) |
|---|---:|---:|---:|
| 1 | 290,390 | -55,603 | -268,846 |
| 2 | 518,400 | 83,368 | 11,442 |
| 3 | 662,400 | 143,775 | 151,575 |
| 4 | 662,400 | 140,986 | 65,811 |
| 5 | 806,400 | 245,860 | 239,035 |

La caja final negativa, antes de renta y software, no prueba por sí sola un VAN negativo: quedan activos y capital de trabajo. Sí impide afirmar que la operación ya devuelve todo lo desembolsado dentro de esos cinco años. Cualquier valor residual requiere un método explícito y una recuperación realizable, sin duplicación.

Conciliación independiente de la caja total, en millones:
457,379 resultado operativo acumulado − 66,952 equipos − 3,600 garantía de arriendo − 404,659 CT final − 3,125 fletes adicionales = −20,957.

## 4. Hallazgos que deben corregirse o documentarse
1. **Kit sin respaldo de especificación actual.** $3,031 M/$3,396 M reproducen la tabla pero no una lista auditable de componentes actuales. No convertirlos en dato confirmado ni promediarlos con un mejor caso para obtener una TIR.
2. **Software productivo omitido.** El presupuesto actual solo incluye $375.000/mes de plataformas y un rol posterior de la red. Deben separarse prototipos ya hechos, gestión de socios, desarrollo futuro y mantenimiento. No agregar automáticamente los $26,65 M antiguos.
3. **Margen sensible al kit.** Precio medio ordinario $5,010 M con IVA = $4,210 M netos. Contribución del año 5 $738.683/instalación, después de descuentos piloto y costos variables, antes de estructura e impuestos. Un kit 10% más caro más la garantía proporcional reduce aproximadamente $269,94 M el resultado del año 5 manteniendo ventas, precios y dotación; supera los $245,86 M centrales.
4. **Garantía: error textual por factor diez.** Un punto porcentual adicional sobre un kit medio de $3.250.019 cuesta $32.500/instalación; en 806 instalaciones son $26,2 M, no $2,6 M. La fórmula de la base aplica el porcentaje, no el cálculo textual errado.
5. **Calendarios de contratación fijos.** Supuestos C45:C62 contiene fechas calculadas externamente y C63:C68 las selecciona. Cambiar el umbral 80% o parámetros comerciales no vuelve a generar el calendario automáticamente en Excel. Las sensibilidades deben recalcular decisiones operativas o declarar que las mantienen fijas.
6. **Unidades fraccionarias.** La nota de redondeo explica 806 versus 807 en el informe; no resuelve inventarios, pedidos e instalaciones ejecutables. Implementar enteros conciliados sin redondear de forma independiente Esencial y Plus.
7. **Dos escenarios bajos diferentes.** Bass no está conectado por fórmula al motor mensual. El escenario bajo del Excel supera la demanda atendible baja del informe durante cuatro años; conciliarlos o identificarlos como sensibilidades distintas. El central respeta su comparación.
8. **Fletes y fechas de IVA.** Los $3,125 M de recargo de fletes están en caja, pero no en costo de kits vendidos ni valoración del inventario. Asignarlos correctamente sin volver a restarlos de caja. El pago de IVA se simplifica al mismo mes; falta el desfase real del F29.
9. **Habilitación y remuneraciones.** La trayectoria salarial de ambos técnicos es igual y al abrir ambos quedan N2; documentar cómo se cumple la exigencia de N3/N4 por dúo. El bono N4 del informe incluye $50.000 de formador que no aparece identificado en la base.
10. **Costos y compromisos pendientes.** Garantía de proveedor, reposición integral de batería, gestión de residuos, alcance de contabilidad/aduana/payroll, desarrollo productivo y condiciones de cobro requieren identificación; revisar inclusiones antes de sumar para evitar duplicar.
11. **Estado de aprobación.** El traspaso distingue DE de PC: monto exacto del precio, diseño detallado del piloto, ritmo de red, 80%, inventarios y embudo son propuestas/supuestos. Conservarlos como escenario de trabajo identificado; no atribuir al equipo aprobación no registrada.
12. **Precisión y calendario fiscal.** Base_mensual_valores.csv redondea parámetros como 1,0938 a 1,09; no usarlo como fuente exacta para reconstruir nómina o demanda. Usar fórmulas del XLSX o resultados.json. Los años de operación julio–junio requieren un puente a ejercicios tributarios enero–diciembre.

## 5. Secuencia concreta para construir Fase 4
1. Congelar la Fase 3 corregida como fuente operativa, con registro separado de decisiones, datos y supuestos. Conservar la v4/v5 como antecedentes auditados de una arquitectura distinta; su TIR 20% no corresponde a este escenario.
2. Cerrar el costo por instalación: BOM actual y costo puesto en taller, garantía/reposición, comisiones, componentes técnicos y costos variables. Preparar sensibilidad sin descuento de volumen y con distintas condiciones de importación.
3. Presupuestar desarrollo futuro por entregable: control/firmware, telemetría, producción de Habilita, datos medidos, soporte y seguridad. Separar recursos existentes de gastos incrementales.
4. Reparar el motor operativo: enteros, colas, capacidad por competencia, gatillos de dúos, compras/tránsito y escenarios coherentes. Definir en qué paso del embudo se aplica la aprobación financiera.
5. Conciliar caja mensual, activos, inventario, anticipos, IVA, provisiones y costos de oportunidad. Mantener un puente entre presupuesto de financiación y flujo económico; no sumar déficit y CT dos veces.
6. Incorporar régimen tributario, pérdidas arrastradas, depreciación/amortización aplicable y calendario de impuestos; definir pesos nominales/constantes y tasas coherentes.
7. Evaluar proyecto puro y financiación por etapas con fuentes condicionadas explícitas. Elegir y justificar Ku/APV o WACC según política de deuda; no trasladar una estructura bancaria ni una tasa sin revisar.
8. Calcular TIR/VAN, recuperación sin/con cierre y VAN=0 sobre el modelo completo. Mostrar los límites de precio, costo del kit, ventas, plazo de cobro y retraso regulatorio. El resultado determina la conclusión.

## 6. Archivos de revisión
- Auditoría financiera: ../traspaso_auditoria_financiera.md
- Auditoría de encuesta: ../traspaso_auditoria_encuesta.md
- Auditoría de operaciones/documentos: ../traspaso_auditoria_operaciones.md
- Auditoría de fuentes/costo: ../traspaso_auditoria_fuentes.md
- Script de encuesta corregido: encuesta_calculo_corregido.py
- Resultados de encuesta: encuesta_auditoria_resultados.json

Las correcciones de revisión se guardaron en copias y archivos nuevos. Los originales y el repositorio no se modificaron.

