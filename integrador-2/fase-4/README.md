# Plan financiero de Lumine · versión para revisar

> **14-11-2026 · v7 con formato del curso:** [v7_formato_curso.xlsx](excel/v7_formato_curso.xlsx) · [PDF](excel/v7_formato_curso.pdf). Mismos números que la v6 (39 controles en cero y 19.533 valores comparados), presentados con las hojas 1 a 7 de la Fase 4, en pesos y con los formatos de clases. Incongruencias con la metodología del curso, pendientes de decisión: [OBSERVACIONES_V7.md](OBSERVACIONES_V7.md). Reproducir: `python integrador-2/fase-4/generador_revision/construir_v7.py`.


**Archivo vigente: [v6_academico_conciliado.xlsx](excel/v6_academico_conciliado.xlsx)** · [PDF de lectura](excel/v6_academico_conciliado.pdf).

Se construyó sobre **Lumine_Plan_Financiero_Fase4 (3).xlsx**, el último archivo entregado por el equipo. El Excel del curso se usó sólo como referencia de formato. Las antiguas v4/v5 y su TIR del 20% corresponden a otro modelo.

| Resultado del escenario de trabajo | Valor |
|---|---:|
| TIR pura | 13,42% |
| VAN puro a Ku real 8,6529% | $86,05 millones |
| Desembolsos efectivos antes de abrir | $214,38 millones |
| Equivalente económico de esos desembolsos en t0 | $219,79 millones |
| Necesidad máxima de caja sin deuda | $484,42 millones |
| CTN al abrir / al cierre | $61,20 / $401,38 millones |
| Payback descontado | 4,79 años |
| VAN sin recuperaciones finales | −$203,53 millones |

**La inversión en t0 no es el total de fondos que deben conseguirse.** El primer año sigue consumiendo caja. No sumar la necesidad máxima a los desembolsos anteriores: ya los incluye.

El modelo mejora su presentación y conciliación; todavía tiene escaso margen ante errores de los supuestos. Con kit 5% más caro, el VAN resulta −$226,32 millones. Una baja de precios de aproximadamente 1,20%, manteniendo volumen, lleva el VAN a cero. Cotización y validación técnica del kit son prioritarias.

## Orden de revisión

1. **Resumen:** seis indicadores y dos gráficos.
2. **Datos:** tasas primero; luego precios, costos, piloto, dotación y calendarios. Única hoja de entradas. Los calendarios se conservan del último archivo, con intervalos identificados.
3. **Costos, Inversión y Calendario:** unidades, costos unitarios/promedios mensuales, vida útil y desembolsos anteriores a abrir.
4. **Capital de trabajo:** distingue activo recuperable de presupuesto para cubrir el déficit.
5. **Flujo puro / Flujo inversionista:** mismas filas, inversiones y depreciaciones por activo, VAN, TIR y paybacks al pie.
6. **Deuda, Impuestos, 3 años y CT mensual:** respaldo de los flujos. Francés aplicado; alemán y americano como comparación.
7. **Equilibrio, Sensibilidad, Controles y Notas y cambios:** VAN=0, tabla bidimensional viva, conciliación con el recibido y límites.

Para dejarnos observaciones: indicar hoja/celda, cambio propuesto, motivo y fuente. Primero discutir kit, recuperación final, financiación y costos de pago; no buscar una TIR predeterminada.

## Cambios y respaldo

- [Auditoría vigente y fuentes](revision-13-11-2026/auditoria/actual_v6.md).
- [Traspaso para Claude, sección 6](TRASPASO_FASE4.md#6-estado-vigente-v6-académica-conciliada).
- [Original financiero recibido](revision-13-11-2026/fuentes/base/Lumine_Plan_Financiero_Fase4_recibido.xlsx), íntegro; SHA-256 en [manifest.json](generador_revision/manifest.json).
- [Verificación independiente](generador_revision/verificacion.json) y [escenarios completos recalculados](generador_revision/escenarios.json).

**Verificado:** LibreOffice sin errores de celda; 38 controles dentro de $1 de tolerancia; 11.073 valores operativos conservados; flujo financiero reconstruido de forma independiente en Python; VAN y TIR conciliados. No se alteraron hojas grises ni archivos v3–v5.

Esto no certifica cotizaciones, viabilidad técnica, autorización para comercializar, cobrabilidad ni disponibilidad de deuda. Las simplificaciones tributarias y de IVA están explícitas en Notas y en la auditoría.

## Reproducir

Requiere Python 3, `openpyxl` y LibreOffice (`soffice` en PATH). Desde la raíz del repositorio:

```bash
python integrador-2/fase-4/generador_revision/construir.py
```

Genera el XLSX con `generar_revision.py`, recalcula en un directorio temporal, conserva las cachés, verifica con `verificar_revision.py` y exporta el PDF. `escenarios.py` vuelve a calcular los ensayos completos sin modificar el caso base. Las sensibilidades de precio y tasa del libro son fórmulas, no capturas.

Se publican la base financiera, el modelo, código y auditorías. El Excel de referencia del curso, los DOCX y las encuestas quedan fuera de esta publicación. Los informes de auditoría anteriores en esta carpeta corresponden a la base operativa previa de seis autos; su cabecera los identifica como históricos.
