> **Antecedente histórico de la base operativa anterior.** El último Excel financiero recibido y su revisión están en [actual_v6.md](actual_v6.md). Las cifras de seis autos/$490 M y las omisiones detectadas aquí no describen automáticamente la v6 vigente.

# Auditoría de evidencia: kit, costos por instalación y software

Revisión del paquete de traspaso de 13-11-2026. Trabajo de lectura; no se modificó el repositorio. Se revisaron el traspaso, la Fase 3 v10, el cierre de las Fases 1–3, la base Excel entregada, el generador `modelo.py` y el libro histórico de costeo disponible en el repositorio. No se buscaron componentes sustitutos en la web ni se verificaron precios actuales de proveedores.

## 1. Conclusión operativa

Se puede avanzar con la arquitectura financiera, la trazabilidad y las conciliaciones usando **$3.031.028 Esencial / $3.396.013 Plus como supuestos heredados, no como costos cotizados verificados**. La base calcula una mezcla de $3.250.019 con 60% Plus. Es reproducible la suma y el uso de esos valores; todavía no es reproducible el costeo de la especificación actual desde cantidades, SKU y precios de compra.

El archivo histórico recupera el origen metodológico del descuento de 4,55%, pero no acredita su disponibilidad comercial. Es de otra arquitectura y no permite validar el costo actual. El desarrollo de software a producción sigue fuera de la nueva base, aun cuando se haya recuperado el origen de la estimación antigua de $26,65 M.

## 2. Evidencia disponible y clasificación que corresponde

| Elemento | Evidencia disponible | Qué prueba | Clasificación para una Fase 4 defendible |
|---|---|---|---|
| Precios $4.590.000 / $5.290.000 con IVA | Fase 3 v10, Tabla 15; base `Supuestos!C6:C7`; traspaso §0 | Los importes están en los archivos vigentes. El traspaso precisa que la dirección de subir precio fue decisión del equipo y el incremento exacto lo fijó Claude. | Precio de planificación, monto PC; no precio comercial validado mediante compras. Mantener la distinción aunque la base lo llame decisión. |
| Kit $3.031.028 / $3.396.013 | Fase 3 v10, Tabla 14 y Anexo 9; base `Supuestos!C10:C12` | El informe declara los costos y la mezcla se reproduce. | S heredado / evidencia documental indirecta. El rótulo actual «Dato documentado» confunde existencia en el informe con respaldo de proveedor. |
| Componentes de kit actual | Anexo 9: 9 partidas agregadas por versión | Permite revisar suma y composición del presupuesto. | Falta BOM: SKU, cantidades detalladas, moneda, precio original, fecha, impuestos, proveedor, condiciones e Incoterm. |
| Arquitectura actual | Fase 3 v10, Tabla 14 y Anexo 10 | Dos motores en rueda, 4/6 kW nominales; LTO 31 celdas, 2,14 kWh y 71,3 V. | Especificación de planificación; fichas y compatibilidad pendientes. No sustituir por LFP/motor central para abaratar. |
| Garantía 3% del costo | Base `Supuestos!C13`; Fase 3 Tabla 36; traspaso §3 | Se aplica una provisión aritmética de $97.501 en la mezcla. | S sin experiencia de fallas ni garantía del proveedor. Separar provisión contable y pagos esperados; no llamar prima cotizada. |
| Medios de pago 2% | Base `Supuestos!C14`, Mensual fila `cmed` | Aplica 2% al ingreso neto del modelo, sin cartera ni incobrables propios. | S; pendiente base de comisión, cargo fijo, IVA, cobertura de ventas, abono, cuotas y contracargos. El rótulo heredado de crédito/incobrables debe corregirse. |
| Logística de pedidos chicos | `Supuestos!C75`: $62.500 por kit bajo 20 unidades | Es una hipótesis adicional al flete incluido en el kit. | S sin oferta logística. Conservar como supuesto separado y conciliar con proveedor para no omitir ni duplicar flete. |
| Software operativo | Base `Supuestos!C98`: $375.000/mes; `Anual!F58:J58`: $4,5 M/año | Presupuesta alojamiento y mantención desde apertura. | S operativo; no acredita desarrollo, validación, puesta en producción ni licencias dimensionadas. |
| Prototipos del equipo | Repositorio: Habilita, página comercial y estimador | Hay código y artefactos demostrables. | Existencia del prototipo no prueba firmware validado, operación con usuarios reales, respaldo, soporte ni datos medidos. |
| $26,65 M antiguos | Origen recuperado por la revisión principal: 900 h Habilita + 350 h web/estimador + 800 h control, a $13.000/h | Explica el número de la Fase 4 anterior. | S histórico de alcance/horas/tarifa; no presupuesto vigente automáticamente aprobado. |

Archivos actuales: `Lumine_Fase3_v10.docx`, `Lumine_Base_de_calculo_Fases_1_a_3.xlsx`, `Traspaso_Lumine_para_Fase4.md`, `Cierre_Fases_1_a_3_resultado_y_registro.docx`. Rutas exactas disponibles en `traspaso_nuevo_manifest.json` (archivo de trabajo de la revisión original).

## 3. Qué recupera realmente el libro histórico del kit

Archivo: `Costo_directo_kit_Lumine.xlsx` (archivo de trabajo de la revisión original).

### Comparabilidad

| Atributo | Libro histórico | Fase 3 v10 |
|---|---|---|
| Motor Esencial | Dos QS205 de 1.500 W | Dos motores de 4.000 W |
| Motor Plus | Dos QS205 de 3.000 W | Dos motores de 6.000 W |
| Batería | 21S LTO 30 Ah; 48,3 V; 1,45 kWh | 31S LTO 30 Ah; 71,3 V; 2,14 kWh |
| BMS documentado | JK-B1A24S15P, 8S–24S | No se identifica SKU para 31S |
| Costo base guardado | $2.102.165 Esencial / $2.389.912 Plus | $3.031.028 / $3.396.013 al dólar actualizado |
| Evidencia | Modelos y URLs por varias partidas; proxies y supuestos explícitos | Tabla agregada, sin planilla de la especificación actual |

Referencias del libro: `Resumen!B25:C28`, `Parametros!B19`, `Esencial!D5:D10`, `Plus!D5:D10`, `Esencial!M26`, `Plus!M26`.

La cantidad de celdas aumenta 47,6%, pero no es lícito multiplicar todo el costo del kit por ese factor ni conservar sin revisión controladores, BMS, caja, cableado, protecciones y logística. En particular, el BMS descrito hasta 24S no documenta control de un banco 31S. Esto pide identificación y validación técnica, no escoger automáticamente una alternativa.

Los $2.649.042 / $2.935.293 del «mejor caso» del informe tampoco coinciden con los totales base guardados en este archivo histórico. Podrían pertenecer a otra reconstrucción; no hay conciliación que permita tratarlos como costo del mismo producto con otra negociación. Evitar el promedio de ambos extremos como prueba de precio de mercado.

### Descuento de 4,55%: origen recuperado, condición comercial no acreditada

- `Supuestos!E15:E29`: bajas entre extremos de precios de 15 publicaciones heterogéneas de Alibaba.
- `Supuestos!E31 = QUARTILE(E15:E29,1)`: **4,554865424%**.
- `Parametros!B22` enlaza ese resultado.
- `Esencial!H5:I6` y `Plus!H5:I6` aplican `(1-Parametros!B22)` a precios de motores/controladores.
- El propio texto de `Supuestos!D6` reconoce que los rangos reflejan cantidades y, en algunos casos, variantes.
- Hay contradicción interna: `Escala!A2` dice que no se aplica descuento a los escenarios; las fórmulas citadas sí lo aplican.

Se recuperó el método de estimación, no una negociación con el proveedor del SKU actual. Clasificar S y evaluar caso sin descuento; ninguna tabla de rangos de otros productos demuestra que Lumine obtiene esa rebaja por un lote concreto.

### Arancel: se recupera hipótesis histórica, no tratamiento actual

`Parametros!B23=0%` para China con certificado de origen; `B24=6%` general en partidas de EE.UU./España. Las fórmulas históricas multiplican cada subtotal seleccionado por `(1+arancel)`. Esto no demuestra clasificación, origen preferencial, documentación ni base aduanera de todos los componentes del kit actual.

El Anexo 9 actual no separa ad valorem y el traspaso no puede establecer si está incluido. Se puede crear la columna de tratamiento arancelario y su control; no afirmar costo cero ni aplicar indiscriminadamente 6% a todo el kit. Requiere país de origen, partida, origen acreditado, Incoterm, seguro y base imponible aduanera por compra.

## 4. Magnitud del margen por instalación

**Estos importes son margen de contribución; no utilidad neta.** Faltan remuneraciones fijas del dúo y demás cargos, arriendo, marketing fijo, software, depreciación, renta y financiación. Para evitar doble conteo, no restar una vez más jornada técnica variable si ya se carga toda su nómina fija.

Mezcla de planificación: 40% Esencial / 60% Plus; precio bruto promedio $5.010.000; neto $4.210.084. Kit promedio $3.250.019.

| Concepto, instalación ordinaria sin descuento piloto | CLP netos |
|---|---:|
| Ingreso | 4.210.084 |
| Kit | −3.250.019 |
| Garantía, 3% del kit | −97.501 |
| Medios, hipótesis actual 2% del ingreso neto | −84.202 |
| Resto tras esas tres deducciones | **778.363** |
| Comisión de $15.000 con factor empresa 1,1298, sello $5.000 y referido ponderado $7.500 | −29.447 |
| Contribución ordinaria ilustrativa | **748.916** |

La base guarda otra cifra correctamente distinta porque incluye el descuento a clientes piloto: `Anual!J37/J6` = $4.199.642 de ingreso efectivo por instalación y `J93` = **$738.683 de contribución**, 17,6% del ingreso. En el año 1 la contribución por unidad baja a **$671.088** (`F93`). Se debe explicar la diferencia entre precio de lista y promedio efectivamente realizado.

Por versión, con las mismas hipótesis ordinarias y factor 1,1298: Esencial contribuye aproximadamente $628.594 (16,3% del precio neto) y Plus $829.130 (18,7%). No implica que la mezcla Plus tenga ventas demostradas ni que el servicio de cuotas esté asegurado.

Sensibilidades aritméticas útiles, sin nuevos supuestos comerciales:

- Kit 10% más caro: pierde **$334.752 por instalación** incluyendo el aumento de la provisión del 3%. Con 806,4 instalaciones teóricas son **$269,94 M** en año 5, antes de otros efectos: supera el resultado operativo central de $245,86 M guardado en `Anual!J80`. No es una nueva proyección integral.
- Un punto adicional de provisión: **$32.500 por instalación**, aproximadamente $26,21 M con 806,4 unidades. El traspaso dice «2,6 millones» para 806 instalaciones: es un **error de factor diez**.
- Un punto adicional de comisión de medios sobre el ingreso neto efectivo del año 5: aproximadamente **$41.996 por instalación** y $33,87 M al año.
- Si el mismo 2% se cobra sobre el importe con IVA en lugar del neto, el costo adicional sería aproximadamente **$15.959 por instalación** y **$12,87 M al año 5**. Es una prueba de base de cobro, no una oferta real de un adquirente.

La base tiene unidades fraccionarias; estas sensibilidades usan sus 806,4 unidades para conciliar. El modelo financiero definitivo necesita escenario operativo entero y redondeo coherente.

## 5. Trabajo que puede avanzar sin pedir nuevas decisiones al equipo

1. Construir un registro de evidencia con archivo/hoja/celda, versión, unidad, fecha, tipo D/R/E/S/DE/PC/P/NR, estado de verificación y alcance técnico. Marcar el costo actual como S heredado conservando los valores de trabajo.
2. Recuperar las fuentes históricas y registrar descuento/arancel como hipótesis recuperadas. Separarlas del costo de la especificación actual; corregir contradicciones de rótulos sin alterar una decisión comercial.
3. Crear estructura BOM vacía para SKU/cantidad/moneda/precio/IVA/origen/Incoterm/lote/flete/arancel; mapear las nueve partidas del Anexo 9 y señalar qué se conoce y qué falta. No inventar precios para completar la tabla.
4. Separar margen de contribución, resultado operativo y caja; calcular precio realizado por descuentos; producir casos de sensibilidad de costo, garantía y medios como pruebas transparentes, no como supuestos aprobados.
5. Abrir capítulo de software: prototipo existente; trabajo pendiente de producto; firmware/calibración; backend/cuentas/seguridad/respaldo; telemetría; soporte/licencias. Separar gasto futuro en efectivo, aportes valorizados y trabajo ya realizado. No sumar automáticamente los $26,65 M antiguos ni confundirlos con $46,7 M de gestión de socios.
6. Cuantificar exposición de garantía con frecuencia/severidad de fallas y componentes del reemplazo, dejando cada parámetro pendiente; corregir la magnitud del error de factor diez. No prometer cobertura del proveedor donde no existe.
7. Preparar un paquete de requerimientos de cotización por SKU y un listado de preguntas técnicas; no enviar solicitudes a terceros sin autorización. La recepción futura de evidencias debe reemplazar los S en un único lugar y recalcular resultados.

No puede cerrarse todavía: costo cotizado instalado, margen neto definitivo, elección de componentes, presupuesto de software productivo, arancel actual por SKU, garantía comercial o una TIR/VAN final. Sí puede cerrarse la trazabilidad, la arquitectura de cálculo y la cuantificación de incertidumbres.
