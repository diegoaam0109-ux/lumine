> **Antecedente histórico de la base operativa anterior.** El último Excel financiero recibido y su revisión están en [actual_v6.md](actual_v6.md). Las cifras de seis autos/$490 M y las omisiones detectadas aquí no describen automáticamente la v6 vigente.

# Auditoría documental y operativa del nuevo paquete Lumine

Fecha: 13-11-2026. Revisión de solo lectura; no se modificaron originales ni repositorio.

## 1. Versión que manda y correcciones comprobadas

- `fase3_principal` y `fase3_2` son duplicados byte a byte: SHA-256 `8f05f4662b9a299e84266f7b35c2f5c33ed09b4dbba58b84cbe1d3941e132f7d`.
- `fase3_1` es la versión anterior: SHA-256 `1dd1db26ff50ab80a880d1439b5d53e68e694aa8a36b636e85f22f0b764cf05f`. Su tamaño y contenido corresponden al DOCX auditado anteriormente.
- Diff de texto/tablas: `diff_fase3.txt` (archivo de trabajo de la revisión original). Son siete bloques modificados, sin cambio general del plan operativo:
  1. §3.2.6.2 Precio: reemplaza «más de ocho de cada diez» por «25 de los 32» (78,125%). La corrección textual existe; el agente de encuesta audita el denominador.
  2. Fuente de Tabla N.º 22: agrega que el redondeo de Esencial y Plus puede diferir en una unidad del total. No cambia las unidades subyacentes.
  3. Tabla N.º 10, Lumine: corrige precios a $4,59/$5,29 millones.
  4. Tabla N.º 27, porcentajes marketing: año 1 pasa 2,4%→2,5%; año 3 pasa 2,5%→2,4%.
  5. Tabla N.º 28, asistentes de postventa: pasa de 0/0/2/1/2 a 0/0/1/2/2. Así desaparece la reducción no explicada y cuadran los totales anuales de dotación.
  6. Tabla N.º 36, ingreso: elimina el rótulo de bono de financiamiento.
  7. Tabla N.º 36, medios de pago: elimina evaluación/incobrables y explica comisión de tarjeta o financista, supuesto 2%.

Los índices `Tn` de las extracciones son base cero: Tabla N.º 28 es T27; Tabla N.º 36 es T35. Las tablas de anexos no llevan numeración correlativa oficial; se identifican por anexo/título.

## 2. Qué sigue vigente y qué no está ratificado

Fuente prioritaria para el grado de aprobación: `Traspaso_Lumine_para_Fase4.md`, convención y §0–1. No confundir una cifra escrita en el informe con una aprobación individual del equipo.

**DE:** cinco etapas; piloto en espacio por uso sin taller propio; apertura gradual con un dúo y un taller; foco colectiveros/aplicación con taxis elegibles; red vende método y no kits; financiación al cliente por terceros sin cartera propia; financiación del proyecto por etapas sin montos/fuentes comprometidos.

**PC o S:** diseño específico de piloto de un modelo/seis vehículos; regla del 80%; ritmo de incorporación de red 3/5/8; monto concreto del alza de precios +$300.000; pedido mensual/mínimo 10 kits/10 en bodega y 10 en tránsito; costo por cotización, visitas, conversión, cancelaciones, cobertura, pauta y recargo de flete. La dirección de subir precios es DE, el monto es PC, aunque el registro de cierre y Supuestos C6:C7 lo rotulen como decisión. La tabla §0 es más específica que ese rótulo global.

El paquete ya responde varias preguntas anteriores: Claude NO tiene la planilla fuente del Anexo 9, NO tiene cotizaciones del piloto, NO tiene garantía de proveedor, NO tiene convenio financiero confirmado y NO presupuestó desarrollo productivo de software. No repetir esas preguntas como si faltara una respuesta: el trabajo es conseguir/reconstruir evidencia o formular rangos explícitos.

## 3. Coherencia entre los documentos

- Fases 1–2 alineadas: §1.3 describe dos motores en rueda y batería LTO 2,14 kWh; §1.5.7 excluye crédito directo; §2.10 mantiene etapas y crecimiento orgánico. Son coherentes con Fase 3 vigente, sin importar el contenido antiguo de identidad/web LFP y motor central. El traspaso §3 reconoce que esos otros recursos siguen desalineados.
- Cierre: pilotos $75,9 M; transición $1,3 M; preapertura $142,8 M; total antes de abrir $220,0 M. Escenarios de instalaciones y dotación son los de v10, no los de v4 financiera antigua. Señala correctamente que no incluye VAN/TIR/impuesto a la renta/deuda.
- Base `Anual!E89` = −$219.974.278,54 antes de abrir; `F89` = −$268.845.975,05 en año 1; `B97` = −$489.781.481,68 de mínimo acumulado. El cierre los redondea correctamente. No presentar $220 M como todo el financiamiento requerido.
- `Anual!J90` = −$20.956.699,74 al terminar los cinco años, antes de renta/deuda y sin recuperación terminal. No demuestra inviabilidad por sí solo ni recupero completo: la Fase 4 tiene que valorar impuestos, vida útil/valor residual, capital de trabajo, software y fechas.
- Fase 3 actual todavía muestra precios consultados de encuesta $4,99/$5,99 M; no son precios viejos que deban borrarse. La mezcla 60% Plus permanece supuesto.

## 4. Hallazgos operativos/costos nuevos o pendientes relevantes

### 4.1 Error aritmético de materialidad en el nuevo traspaso

Traspaso §3: «cada punto [de provisión de garantía] son unos $32.500 por instalación y 2,6 millones al año con 806 instalaciones». El segundo resultado está errado por factor 10:

`$3.250.019 × 1% × 806 = $26.195.153,14`.

Es una corrección documental, no un cambio de supuesto: el impacto de un punto es $26,2 M anuales a ese volumen. La base aplica directamente la tasa en `Mensual!fila 58` y no parece usar esa multiplicación errónea del texto.

### 4.2 Rótulos corregidos en DOCX, todavía heredados en base

El informe cambió Tabla 36, pero `Supuestos!B14` y `Mensual!A59` todavía dicen «Medios de pago, evaluación de crédito e incobrables». Las fórmulas son únicamente 2% del ingreso (`Mensual!V59 = Supuestos!$C$14*V51`), sin cartera ni evaluación. Es presentación desalineada, no tres costos escondidos en la fórmula. Renombrar al reconstruir.

### 4.3 Redondeo advertido, todavía no operativo en unidades enteras

`Leeme!A4` declara vehículos/kits con decimales como promedios mensuales. Ejemplos: `Mensual!V16` y `V32` = 2,85 pedidos/instalaciones; inventario `V39` = 7,15 kits; `Anual!J6` = 806,4 instalaciones. Compras sí se redondean por lotes con CEILING (`Mensual!V38` = 15 kits).

La nota de Tabla 22 soluciona la transparencia del redondeo impreso, no transforma 806,4 en un calendario ejecutable entero. Para Fase 4 construir reparto entero conciliado (Esencial+Plus=total, inventario/pendientes/control de capacidad), sin redondear por separado cada saldo monetario. No inventar una nueva demanda por hacer ese ajuste.

### 4.4 Gatillos de contratación no se recalculan endógenamente

`Supuestos!C45:C62` contiene las fechas de ingreso de los seis dúos por escenario como valores fijos, etiquetadas «Resultado de la regla». `C63:C68` solo selecciona el calendario con CHOOSE; `Mensual!filas 18:25` lo aplica.

Por tanto, cambiar costo por cotización, conversión o umbral 80% no vuelve a decidir automáticamente las fechas de contratación. Las cifras base pueden reproducirse, pero la sensibilidad no es un algoritmo general de decisiones salvo regeneración externa del calendario. Conservarlo como calendario explícito del escenario o volver a calcular el gatillo con sus anticipos y restricciones. No afirmar que la celda del 80% por sí sola mueve toda la dotación.

### 4.5 Dos reservas de capacidad, por confirmar su interpretación

`Supuestos!C41` justifica 15 vehículos con 126 h de 173 h al mes, dejando formación, postventa y retrabajos; `C44` agrega gatillo al 80%. Es visible y el traspaso lo clasifica PC. No es un error matemático automático, pero hay que confirmar si se quieren ambas reservas antes de atribuir toda la holgura a redondeo. El informe usa un dinamómetro por local: Anexo 14 indica 1 h por vehículo/90 h al mes con seis dúos.

### 4.6 Niveles de técnicos y bono N4 no totalmente alineados

§3.3.3.3 exige al menos un N3/N4 por dúo; `Mensual!fila 92` paga a los dos técnicos de cada dúo la misma trayectoria según una única antigüedad. En apertura `V75=3`, ambos quedan en tramo N2; no aparece un técnico senior con trayectoria distinta ni un control de dúos habilitados. El RT puede supervisar y algunos técnicos podrían llegar del piloto, pero hay que dejar explícito cómo se cumple la condición y su costo; la hoja de sueldo no demuestra la validación por competencias.

§3.3.3.4 dice bono N4 $120.000 + $50.000 de formador = $170.000. La base `Supuestos!C91` = $120.000 y `Mensual!fila 92` usa solo esa celda al llegar a antigüedad 12. Revisar si los $50.000 se omitieron o se deciden como pago separado; no están identificados en otra línea de la base.

### 4.7 Costos no respaldados/omitidos ya reconocidos

- Kit: el traspaso §2 desclasifica «dato documentado» de `Supuestos!E10:E11` a supuesto por fuente no recuperada; descuento 4,55% y arancel NR/P. No adoptar ese precio como cotización ni volver al promedio de v4 para sostener una TIR.
- Software: traspaso §5 enumera firmware/control, telemetría productiva, cuentas/backups/soporte y estimador con datos reales como no construidos, sin horas/costo. `Supuestos!C98` solo pone $375.000/mes de alojamiento/mantenimiento. $46,683 M de socios es gestión, no software; no agrega caja ni reemplaza la inversión pendiente.
- Garantía: 3% es supuesto de gasto, no fondo desembolsado por calendario; no existe garantía de proveedor. Reemplazo $699.715 solo suma celdas/BMS/contactor, sin servicio, caja/cables, flete DG, retiro/valorización.
- Fases 1–2 §1.5.9 declara costos de recolección/valorización por importar batería; la base no identifica un costo específico de REP ni la fase posterior al horizonte. No confundirlo con el 3% de garantía.
- Fases 1–2 §2.10 externaliza contabilidad, aduana, transporte DG y administración de remuneraciones. Aduana/DG figuran agregados en la BOM, pero no identifico línea recurrente específica de contabilidad/payroll; confirmar si está en el gasto general de servicios y documentarlo, evitando duplicar Administración y Personas.
- Piloto/medición/seguros/local/dinamómetro, condiciones proveedor y costos medios de pago son hipótesis con rangos, no cotizaciones. El traspaso ya lo reconoce; mantenerlos identificados y sensibilizarlos.

## 5. Material extraído

Extracciones sin modificar originales: `fase3_principal.txt` (archivo de trabajo de la revisión original), `fase3_1.txt`, `fase3_2.txt`, `cierre_doc.txt`, `fase12.txt`; diff en `diff_fase3.txt`.

El agente de demanda/encuesta revisa la reproducción estadística y el embudo; no duplico ese trabajo ni concluyo aprobación del precio por una muestra no probabilística.
