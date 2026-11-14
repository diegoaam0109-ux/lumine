> **Antecedente histórico de la base operativa anterior.** El último Excel financiero recibido y su revisión están en [actual_v6.md](actual_v6.md). Las cifras de seis autos/$490 M y las omisiones detectadas aquí no describen automáticamente la v6 vigente.

# Auditoría financiera del nuevo traspaso de Lumine — 13-11-2026

## Alcance y resultado

Revisión de solo lectura de los originales identificados en `traspaso_nuevo_manifest.json` (archivo de trabajo de la revisión original): traspaso completo, base XLSX, ambos CSV, `modelo.py`, `leer.py`, `calc.sh`, `final.py` y `resultados.json`. Se copiaron y ejecutaron los scripts únicamente en `traspaso_audit_scratch` (archivo de trabajo de la revisión original). No se modificaron los originales ni el repositorio.

**Los cuatro importes solicitados son reproducibles dentro de este modelo**: piloto $75.948.303; caja previa a abrir $219.974.279; déficit adicional del primer año $268.845.975; necesidad máxima acumulada $489.781.482. Esto demuestra consistencia del cálculo con sus supuestos, no valida los precios, la conversión comercial ni la financiación efectiva. El máximo ocurre en mayo de 2029: mes calendario 29, mes comercial 11. El año 1 comercial comprende julio de 2028–junio de 2029, no el año calendario tributario.

La base es de **Fase 3**: contiene IVA simplificado y caja previa a financiación, pero no depreciación, impuesto a la renta, préstamo, costo del capital, VAN ni TIR. El 20,02% de la v4 corresponde a un proyecto anterior distinto y no se puede trasladar a estas cifras.

## 1. Reproducción y conciliaciones

### Importes centrales, sin redondeo editorial

| Concepto | Resultado CLP | Evidencia XLSX |
|---|---:|---|
| Piloto | 75.948.303,1406 | `Anual!B89` |
| Transición de tres meses | 1.260.000 | `Anual!C89`, signo negativo en la hoja |
| Preapertura de tres meses | 142.765.975,4 | `Anual!D89` |
| Caja acumulada antes de abrir | 219.974.278,5406 | `Anual!E89/E90` |
| Flujo adicional del año comercial 1 | −268.845.975,050689 | `Anual!F89` |
| Caja acumulada al terminar año 1 | −488.820.253,591289 | `Anual!F90` |
| Mínimo mensual de caja | −489.781.481,680054 | `Anual!B97`, `Mensual!AF143` |
| Mes calendario del mínimo | 29, mayo de 2029 | `Anual!B98`, `Mensual!AF2:AF7` |
| Mes comercial del mínimo | 11 | `Mensual!AF7` |
| Primer resultado operativo móvil de 12 meses positivo | mes comercial 15 | `Anual!B99` |
| Primer flujo móvil de 12 meses positivo | mes comercial 18 | `Anual!B100` |
| Caja acumulada al final de cinco años de operación | −20.956.699,7397617 | `Anual!J90`, `Mensual!CC143` |

Los $489,8 M **ya incluyen** los $220 M iniciales. No deben sumarse ambos. El déficit del primer año no es idéntico al déficit adicional máximo: el mínimo mensual ocurre un mes antes de cerrar el año y es $961.228 más negativo que la caja de cierre.

### Reconstrucción de los $220 M

| Bloque neto / temporal | CLP |
|---|---:|
| Gasto operativo y de etapas previas | 101.007.374,74 |
| Equipamiento adquirido | 50.202.170 |
| Garantía de arriendo recuperable | 3.600.000 |
| Pagos comerciales de kits y recargos de flete | 43.500.247 |
| Remanente de IVA financiado | 21.664.486,8006 |
| **Total** | **219.974.278,5406** |

No todo el desembolso de $43,5 M es inventario valorizado: $42.250.247 son bodega/anticipos al costo base y $1.250.000 son fletes adicionales. Al abrir hay 10 kits en bodega y 10 en tránsito; del segundo pedido solo está pagado 30%. Quedan $22.750.133 comprometidos con el proveedor. Evidencia: `Anual!E15:E23/E84`, `modelo.py:236-246`.

### Pruebas independientes

La nueva generación del escenario central con `modelo.py` y su recálculo en LibreOffice coincide con todos los valores numéricos guardados examinados de `Supuestos`, `Mensual`, `Anual` y `Sensibilidad`: cero diferencias mayores a $0,00001. El XLSX original y el escenario central de `resultados.json` coinciden exactamente en sus series mensuales. Hay 8.360 fórmulas y ningún error de celda guardado en las seis hojas.

También se ejecutó en copia el proceso completo `calc.sh` → `final.py`, con LibreOffice, para los tres escenarios. Se reprodujeron las series mensuales suministradas, sin diferencias numéricas mayores a $0,00001; los mínimos son $666.963.052,213774 / $489.781.481,680054 / $707.896.639,099108. Las cuatro verificaciones originales de `final.py` terminaron verdaderas y el libro final regenerado tiene 8.360 fórmulas y cero errores.

Se comprobaron 78 meses con identidades independientes de las pruebas de `final.py`:

1. Pendientes: inicial − cancelaciones + pedidos − instalaciones = final.
2. Inventario: inicial + recepciones − instalaciones = final.
3. Caja: acumulado anterior + flujo = acumulado final.
4. Pagos acumulados a proveedor − fletes adicionales − costo de kits instalados = inventario valorizado + anticipos pagados.
5. Cobros acumulados − ingresos devengados = pies de pendientes netos de IVA.

Los residuos máximos son de punto flotante: aproximadamente $0,0000023 en la conciliación del proveedor y $0,0000019 en depósitos; no son diferencias monetarias materiales.

### Precisión de los CSV

`Base_mensual_valores.csv` redondea numerosos valores a dos decimales: por ejemplo el factor 1,0938 aparece como 1,09 y una conversión de 0,225 aparece como 0,23. Se encontraron 1.774 diferencias por redondeo entre 9.995 valores comparables, máximo absoluto 0,005. **Sirve para lectura, pero no como fuente exacta para recalcular nómina o embudo.** El CSV de etapas redondea a pesos enteros; su mayor diferencia mensual frente al XLSX es $0,48. Para reconstrucción usar fórmulas del XLSX o precisión de `resultados.json`.

## 2. Caja, resultado y capital de trabajo: qué explica el déficit

El resultado operativo anual central es −$55,603 M / +$83,368 M / +$143,775 M / +$140,986 M / +$245,860 M (`Anual!F80:J80`). Tener resultado operativo positivo desde el segundo año **no implica recuperar la caja inicial**. Se financian inventario, tránsito y anticipos crecientes.

La conciliación acumulada al final del horizonte es exacta:

```
Resultado operativo acumulado, incluyendo etapas previas      +457.379.129,889
Equipamiento                                                  −66.952.170,000
Garantía de arriendo                                            −3.600.000,000
Capital de trabajo al cierre                                  −404.658.659,628
Recargos de flete no incluidos en resultado/inventario           −3.125.000,000
= Caja acumulada final                                         −20.956.699,740
```

En el mínimo central (mes comercial 11), hay $258,408 M de CT, $164,397 M de pérdidas operativas acumuladas, $60,252 M de equipos, $3,6 M de garantía y $3,125 M de fletes: en conjunto explican los $489,781 M. No existe una cartera propia de clientes de varios años como en v4.

**Conclusión de financiación:** $489,8 M es el mínimo bajo este presupuesto y estas condiciones, antes de renta, financiación, software de producción, imprevistos y atrasos. No es una cotización de recursos disponibles ni un capital máximo seguro. La base no indica quién aportaría ese dinero ni cuándo.

## 3. Hallazgos materiales

### A. Las reglas de capacidad no reaccionan íntegramente a los inputs

`modelo.py:374-385` calcula una vez `plan_duos()` en Python y escribe las fechas como valores en `Supuestos`. Dentro de esa función repite números: cotizaciones por visita 30, capacidad 15, umbral 0,8, parámetros comerciales por escenario y prohibición de nuevos dúos antes del mes 6. No lee las celdas de supuestos. La hoja selecciona esos planes previamente calculados con `CHOOSE`.

La consecuencia es material: cambiar en Excel visitas, costo por cotización, conversión, capacidad o umbral cambia pedidos/instalaciones, pero **no recalcula automáticamente las fechas de contratación y equipos**. Algunas variaciones pueden ajustar ventas sin ajustar la dotación que deberían exigir. Los tres escenarios suministrados tienen planes calculados al generarlos; eso no acredita sensibilidades arbitrarias posteriores.

Fechas centrales precomputadas: dúos 1/6/7/10/25/49. Las de cobertura, pauta, pilotos, red, etapa y factor de cargas también tienen valores y calendarios fuera de la tabla de inputs (`modelo.py:191-219/248-260/319-325`). No hay un selector general de meses de transición que desplace todas las dependencias. Cualquier escenario de atraso exige regenerar correctamente el calendario, no añadir solamente $420.000 por mes a una celda.

**Acción:** parametrizar las dependencias o regenerar y recalcular íntegramente cada caso con un proceso reproducible. Distinguir hipótesis confirmadas del equipo de propuestas de Claude; el traspaso señala expresamente varias PC mientras el libro las llama “Decisión”.

### B. Se vende y consume inventario fraccionado

La base declara que trabaja con promedios mensuales (`Leeme`; `modelo.py:468`). Es explícito, pero no satisface todavía el requisito de unidades enteras de la futura Fase 4. Hay 59 meses con pedidos fraccionados, 56 con instalaciones fraccionadas, 60 con inventario fraccionado y tres con pendientes fraccionados. Compras, recepciones y personas sí son enteras.

Ejemplos: mes 1 comercial = 2,85 instalaciones; año 1 = 290,390371; año 5 = 806,4. Las fechas de compra y plantilla tienen saltos discretos, por lo que redondear solo el informe no equivale a reconstruir un plan de unidades enteras. En escenario bajo el primer mes proyecta 1,71 instalaciones pero descuenta dos “clientes piloto” fijados por calendario (`npil`, `modelo.py:248-263`): muestra por qué el redondeo necesita una regla conjunta.

**Acción:** conservar demanda y conversión como expectativas, pero convertir pedidos, cancelaciones e instalaciones a unidades físicas conciliadas, con mínimos de inventario y descuento piloto limitado a clientes realmente instalados. No redondear cada subtotal por separado.

### C. El costo del kit aún no es un dato trazable

`Supuestos!C10:C11` y `modelo.py:48-49` lo llaman “Dato documentado”: $3.031.028 / $3.396.013. El nuevo traspaso §2 reconoce que no tiene el libro de costeo, fichas por modelo, URLs, moneda, impuestos ni trazabilidad del descuento de 4,55%, y pide tratarlo como supuesto. La base no resuelve esa carencia.

La materialidad es alta: con ventas y resto de inputs fijos, kit +10% reduce el resultado operativo del año 5 en **$269.943.978**, incluyendo garantía 3%, pasando de **+$245.859.879 a −$24.084.099**. Es una sensibilidad parcial exacta de las fórmulas actuales, no un VAN ni un escenario completo. El kit barato de v4 tampoco adquiere respaldo por estar entre dos extremos no cotizados.

**Acción:** recuperar las fuentes por componente y costos de internación; verificar especificación, cantidades, arancel y descuento. Mientras no se cierre, etiquetar costo estimado y rango, no precio de compra confirmado.

### D. Los recargos de flete están en caja pero fuera del resultado y del inventario

`Mensual!fila42` calcula el recargo por lotes pequeños; `fila43` lo agrega al pago del proveedor. `fila57` calcula costo vendido solo como instalaciones × costo medio base y `filas44:45` valoran inventario/anticipos sin ese recargo. `modelo.py:241-245/269/359-363` confirma la omisión.

Recargos centrales: $1,25 M antes de abrir y $1,875 M en los dos primeros meses comerciales; total $3,125 M. La caja sí paga esos montos. El resultado operativo y el valor del inventario no contienen su asignación. Las conciliaciones de `final.py` no detectan la diferencia porque prueban cantidades y sumas de caja, no costo completo devengado.

**Acción:** asignar el flete al costo de adquisición por lote y descargarlo al instalar, o declararlo gasto cuando corresponda y conciliarlo. No descontarlo otra vez de caja: ya está pagado allí. Su materialidad es baja frente al kit, pero importa al construir depreciación, impuestos y estados conciliados.

### E. IVA: aritmética consistente con una simplificación, no calendario fiscal completo

`Mensual!filas131:134`, `modelo.py:353-356`:

```
Débito = IVA × (cobros de instalaciones + ingresos de la red)
Crédito = IVA × (kits recibidos + flete extra + equipos + marketing
                  + kits del piloto + ensayos + telemetría)
Remanente final = MAX(0; remanente anterior + crédito − débito)
Efecto caja = remanente anterior − remanente final
```

Esto concilia matemáticamente con cobros/pagos netos más IVA bruto y pago del impuesto **en el mismo mes**, siempre que los hechos gravados y bases sean los definidos. El IVA no desaparece del presupuesto: $21,664 M financiados antes de abrir se consumen contra débitos durante la operación; el remanente se agota en abril de 2029 (mes 28). El modelo implícitamente paga $255.132 al SII en ese mes y $6.568.028 en mayo. No representa el desfase de F29 ni un saldo separado de IVA por pagar.

No debe afirmarse que todo el crédito fiscal está legalmente acreditado. Faltan clasificación afecta/exenta, documentos de soporte y fechas por partida. El modelo otorga crédito sobre todo el costo medio de “kits recibidos”, que incluye partidas locales como alineación, y toma IVA del kit piloto conforme a sus anticipos/pagos sin un calendario de internación del piloto. No diferencia explícitamente una factura local, una importación y un anticipo al extranjero. Tampoco aplica IVA de manera explícita a comisiones de adquirencia, servicios básicos, plataformas o medición independiente; unas partidas requerirán IVA y otras dependen de su régimen/documentación.

**Acción:** construir auxiliar mensual de IVA con débito facturado/anticipos según regla aplicable, crédito respaldado por factura o importación, remanente, pago F29 en su fecha y eventual devolución solo si elegible. No sumar de nuevo $21,6 M a la necesidad máxima: ya están en ella. No asumir devolución anticipada total ni inmediata.

### F. Renta, años fiscales y beneficios están fuera del modelo

La exclusión está declarada en el traspaso y `Leeme`, y no hay una fórmula de renta oculta. Por tanto los resultados no son “después de impuestos”. Los años comerciales julio–junio no pueden usarse sin puente como ejercicios tributarios enero–diciembre. `fac` es carga patronal, no inflación ni impuesto a la renta.

**Acción:** antes de calcular VAN/TIR agregar calendario fiscal, régimen aplicable, base tributaria, pérdidas, depreciación/amortización y deducibilidad de garantías/gastos preoperativos. Un resultado operativo negativo no equivale automáticamente a igual pérdida tributaria. No importar sin verificar la tabla 12,5%/15%/23% del modelo anterior.

### G. Gastos y compromisos todavía sin presupuesto completo

El propio traspaso excluye software de producción, constitución societaria, contingencias, financiación y atraso regulatorio. Garantía 3% se paga como costo mensual inmediato (`cgar`) sin calendario de siniestros ni fondo conciliado; no es una estimación actuarial. El compromiso de garantía de batería es más largo que la evidencia disponible y el costo de reemplazo citado no cubre su costo completo.

El modelo compra equipos pero no programa reposiciones durante sus 78 meses. Por ejemplo, escáner y herramientas del piloto adquiridos en marzo de 2027 llevan vida útil de cinco años como criterio del equipo (`modelo.py:114-116`), que se alcanza en marzo de 2032, dentro del horizonte. Una vida fiscal agotada no obliga por sí sola a reemplazar el equipo, pero hace falta separar vida económica, vida fiscal, reposición técnica y valor residual. No considerar mantenimiento o software de $375.000/mes una cobertura automática de estos desembolsos.

**Acción:** cerrar alcance y presupuesto de lo imprescindible antes de presentar $489,8 M como recursos suficientes. Los $46,683 M de socios son gestión valorizada, no software y no salida de caja. Verificar que el costo económico alternativo sea pertinente y no confundirlo con gasto tributario automáticamente deducible.

## 4. Escenarios: más ventas puede exigir más caja

| Caso del archivo | Caja antes de abrir | Pico de recursos requerido | Mes calendario | Mes comercial del pico |
|---|---:|---:|---:|---:|
| Bajo | $209,480 M | $666,963 M | 66 | 48 |
| Central | $219,974 M | $489,781 M | 29 | 11 |
| Alto | $253,218 M | $707,897 M | 25 | 7 |

El alto no necesita menos dinero solo porque venda más. En su pico, acumula inventario y anticipos mientras contrata antes de convertir la demanda en instalaciones:

| Componente en el mínimo de cada caso | Central, mes comercial 11 | Alto, mes comercial 7 |
|---|---:|---:|
| CT neto | $258,408 M | $468,592 M |
| Pérdidas operativas acumuladas | $164,397 M | $173,578 M |
| Equipamiento | $60,252 M | $60,252 M |
| Garantía de arriendo | $3,600 M | $3,600 M |
| Fletes adicionales | $3,125 M | $1,875 M |
| **Necesidad acumulada** | **$489,781 M** | **$707,897 M** |

La diferencia de $218,115 M se explica por +$210,184 M de CT, +$9,181 M de pérdidas y −$1,25 M de fletes. En el pico alto hay 88,31 kits en bodega, 100 en tránsito, $42,457 M de remanente IVA y $85,843 M de pies pendientes con IVA. Esto requiere controlar la pauta y el abastecimiento junto a la dotación; no basta con vender más.

No se volvió a investigar la diferencia entre el escenario bajo de captación y el escenario bajo de Bass descrito en el informe: es una conciliación comercial aparte que impide intercambiarlos por compartir nombre.

## 5. Depósitos y final del horizonte

Los pies cobrados y devueltos por cancelación están conciliados algebraicamente (`modelo.py:246/267`). La base usa anticipo de pedidos del mismo mes, no necesariamente “un mes antes de instalar”; con instalaciones inmediatas pie y saldo pueden cobrarse en el mismo mes. Con devolución, el código retorna el pie completo al precio medio. No existe cartera propia con incobrables pese a algunos rótulos heredados.

El horizonte continúa comprando para meses posteriores: al cierre hay 35,0096 kits en bodega, 135 en tránsito y $147,876 M comprometidos al proveedor. El CT final $404,659 M es bodega $113,782 M + pagos en tránsito $290,877 M; es una medida sobre importes ya pagados. **No se debe restar además el compromiso de proveedor a ese mismo CT**, porque el valor de anticipos ya excluye la porción no pagada. Si se valora tránsito completo, entonces sí debe reconocerse el pasivo correspondiente.

No hay recuperación terminal de inventario, anticipos, garantía ni equipos en esta base. Eso explica por qué no debe evaluarse la rentabilidad del proyecto tomando sin más sus 78 flujos. La futura Fase 4 deberá escoger continuidad o liquidación, tratar obligaciones abiertas y reconocer una sola vez el CT recuperable. Ni valor libro ni una compra futura equivalen automáticamente a caja disponible al cierre.

## 6. Diferencias frente a v4: no mezclar modelos

| Unidad | v4 previamente auditada | Nueva base Fases 1–3 |
|---|---|---|
| Crédito al cliente | 30% cartera propia, 24 cuotas | Terceros; caja prácticamente inmediata bajo supuesto |
| Escala año 5 | Cinco talleres; 3.270 instalaciones | Un taller; 806,4 instalaciones esperadas |
| Kit | Punto medio ~$3,04 M | Costeo heredado ~$3,25 M, trazabilidad pendiente |
| Precio con IVA | $4,29/$4,99 M | $4,59/$5,29 M, monto propuesto por Claude |
| Piloto | En taller propio | Puesto arrendado por uso |
| Apertura | Enero de 2028 | Julio de 2028 supuesto |
| IVA/caja | Evaluación real neta de IVA | Caja operativa con IVA simplificado |
| Financiación/depreciación/renta | Modeladas con limitaciones | No modeladas, explícitamente |
| TIR/VAN | 20,019% / $799,485 M bajo diseño anterior | No calculados; no deducibles de sus resultados parciales |

La mejora de diseño es real: menor compromiso preoperativo, sin cartera propia de años y crecimiento más gradual. No prueba que el proyecto nuevo tenga igual rentabilidad, y el costo de software no se ha eliminado del negocio porque no aparezca en esta base.

## 7. Prioridades para la Fase 4

1. Conservar la cadena de caja reproducida, pero cerrar costo del kit y software imprescindible.
2. Convertir operación física a enteros y hacer dependientes todas las fechas de capacidad/contratación.
3. Corregir costo por lote y auxiliar IVA con fechas fiscales; conciliar depósitos y obligaciones de proveedor.
4. Construir impuestos por ejercicio calendario y separarlos del año comercial.
5. Elaborar fuentes/usos y financiación por etapas sobre el mínimo mensual, con escenarios de atraso y crédito externo no aprobado.
6. Solo entonces incorporar inversión económica, depreciación, reinversiones, recuperación/continuidad y tasas, para recalcular VAN/TIR sin trasladar las antiguas.

No se construyó ni ajustó una TIR nueva en esta auditoría.
