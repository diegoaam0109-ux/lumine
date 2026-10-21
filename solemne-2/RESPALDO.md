# Respaldo para la defensa · Solemne 2 · Control de Gestión

Lo que hay que saber para defender la presentación `Lumine_Solemne2_CMI_Control_de_Gestion.pptx`: qué es dato y qué no,
qué contradicciones aparecieron entre los materiales del paquete y qué riesgos o datos faltan.
Los archivos del paquete (dossier, guion, anexos y Excel) **no se suben al repositorio**, que es público.

## 1. Qué es cada cifra de las láminas

| Lámina | Cifra o afirmación | Naturaleza | Cómo aparece en pantalla |
|---|---|---|---|
| 2, 4 | Hasta 20% menos bencina en ciudad | Estimación de ingeniería, no medida en autos chilenos | «ESTIMACIÓN, NO MEDICIÓN» |
| 2, 5, 6 | Reglamento, autorización sectorial (P01) y homologación (P02) | Hecho comprobado: Ley N° 21.793 sin reglamento y ninguna homologación hecha | «HITO CRÍTICO PENDIENTE» (rojo) |
| 4, 6, 7, 9 | Metas de 100% (A01, A02, P03, C01) y «1 par» (P02) | Metas de diseño propuestas en el paquete; aún no aprobadas formalmente | «META» + «SIN MEDIR» |
| 7 | Más de 50% de consultas de uso intensivo (C03) | Meta orientativa de diseño | «ORIENTATIVA» |
| 8 | NOPAT US$150.000, capital US$1.000.000, WACC 12%, EVA US$30.000 | Ejemplo del módulo 4 del curso (empresa genérica) | «EJEMPLO DE CLASE · NO LUMINE» |
| 9 | Verde ≥90%, ámbar 70% a 89%, rojo <70%; críticos solo verdes al 100% | Umbrales de diseño propuestos | Fuente al pie: «Umbrales propuestos» |
| 10, 11 | 8 de 10 informes, 80%, −20 pp | Ejercicio didáctico | «EJERCICIO HIPOTÉTICO» |
| 12 | 0 ventas, homologaciones o EVA presentados como logros | Hecho: Lumine es preoperativa | — |

Ningún indicador tiene dato real: los doce están «SIN MEDIR» en el Excel. No se usan las cifras del CMI antiguo
(VAN a 10 años y otras), ni los rangos ICCT 9%–29% o SEG 25%–27%, ni sindicatos como clientes.

## 2. Contradicciones encontradas (señaladas, no corregidas en silencio)

Regla del encargo: si las fuentes se contradicen, manda el contexto vigente de Lumine.

1. **Duración del guion.** El paquete planifica 14:15, pero el guion tiene 1.373 palabras: unos 10:34 a ritmo normal
   (130 palabras por minuto) y unos 13:05 a ritmo pausado (105). Los tiempos por lámina del paquete no calzan con el texto
   (la lámina 1 pide 0:30 para 95 palabras; la 9, 1:35 para 120). **Se mantuvo el texto íntegro** y los tiempos de las notas
   se calcularon a 105 palabras por minuto. Hay que ensayar con cronómetro: si sale bajo 12 minutos, hablar más pausado.
2. **Reparto de expositores.** El plan del paquete daba a Diego las láminas 1 a 5 (unos 5:15) y a Lukas 10 a 12 (unos 3:15).
   Se cambió a **Diego 1–4, Benjamín 5–8, Lukas 9–12** (unos 4:15, 4:30 y 4:20), como el paquete permite. Si el equipo
   prefiere el reparto original, basta cambiar el campo `quien` en `generador/guion.js` y regenerar.
3. **Responsables del Excel (hoja MATRIZ_CMI) frente a la estructura de la Fase 3.** A02 dice «Gerencia / Personas»,
   P03 «Operaciones / Técnicos habilitados» y F03 «Administración y Finanzas». En la estructura vigente (Fase 3) la
   habilitación y las actas son del **Responsable Técnico** y el área es **Administración y Personas**; no hay áreas de
   «Operaciones» ni de «Finanzas». En las láminas solo aparece el responsable de C01 (Comercial y Postventa), que sí
   coincide. Conviene corregir el Excel antes de mostrarlo.
4. **Semáforo de C03.** El dossier usa la regla general (verde ≥90% de cumplimiento), pero la fórmula del Excel para C03
   pone verde solo si el valor supera la meta (>50%) y ámbar desde 70% de la meta. Son reglas distintas.
5. **Redondeo en CASO_SIMULADO.** La celda de la desviación muestra −19,999999999999996. Usar
   `=ROUND((B8-B5)*100;0)` para que muestre −20 si se proyecta el Excel.
6. **Informe «antes y después en condiciones comparables» (C01)** frente a la Fase 3, que acepta una línea base «medida o
   declarada». Si el consumo previo es declarado por el cliente, el informe no es comparable. Hay que decidir cuál vale.
7. **Colores del encargo** (#000000, #12AAE9, azules #000C1D a #001B3C) frente a la paleta de la marca (#020304 y #22B8F0).
   Se usó la paleta de la marca, igual que en las presentaciones anteriores.
8. **Modalidad.** El comunicado de la jornada diurna habla de «evaluación de aplicación práctica»; el equipo fue informado
   de una exposición de 15 minutos. La presentación sirve para la exposición y trae cálculos breves (EVA y 8 de 10) por si
   la evaluación es práctica.

## 3. Riesgos y datos que faltan

- **Aprobar los KPI y sus metas.** El Excel indica que los KPI complementarios, los umbrales y los ejemplos son propuestas
  de diseño que el equipo debe aprobar antes de presentarlas como propias.
- **WACC de Lumine:** no existe. Sin Plan Financiero no hay estructura de capital ni costo de deuda o patrimonio.
- **Tolerancia de error del ahorro:** no definida; requiere primero mediciones comparables.
- **Estados en rojo (P01, P02 y «Reglamento y homologación»):** se marcaron como hito crítico pendiente porque su
  ausencia está comprobada. C02 (aseguradora y planta de revisión técnica) quedó en «SIN MEDIR» porque no es condición
  para operar. Si el profesor pregunta, ese es el criterio.
- **Química de la batería y número de motores:** siguen abiertos en el proyecto (LFP frente a LTO); las láminas no los nombran.
- **Licencia SEC del instalador:** sin confirmar con la SEC (no aparece en las láminas).
- **Profesor y fecha:** la portada dice «Octubre 2026» y no nombra al profesor; agregarlo si corresponde.
- **Texto por lámina:** el contenido principal está cerca del límite de 50 palabras; las láminas 8 (EVA) y 9 (ficha)
  quedan algo por encima si se cuentan las definiciones y la ficha completa.

## 4. Cálculos para responder en vivo

- **EVA (ejemplo del módulo 4, no Lumine):** EVA = NOPAT − capital × WACC = 150.000 − 1.000.000 × 12% = 150.000 − 120.000
  = **US$30.000**. Equivale a (ROIC − WACC) × capital = (15% − 12%) × 1.000.000 = 30.000.
- **Caso 8 de 10 (hipotético):** real = 8/10 = 80%; desviación = 80% − 100% = **−20 puntos porcentuales**;
  cumplimiento = 80%/100% = 80%. Regla general: ámbar (70% a 89%). Control crítico (informe obligatorio): rojo.

## 5. Preguntas probables

- **¿Por qué EVA y no la utilidad?** Una utilidad contable positiva puede no remunerar el capital invertido; el EVA descuenta
  el costo de ese capital y obliga a fundamentar la tasa.
- **¿EVA, VAN o TIR?** VAN y TIR evalúan el proyecto completo por sus flujos; EVA mide el valor creado en cada período.
  Se complementan.
- **¿Por qué «sin medir» no es rojo?** Rojo significa incumplido con evidencia; sin dato no se puede afirmar que se incumplió.
- **¿Por qué 80% es rojo si el semáforo general dice ámbar?** Porque el informe es parte obligatoria del servicio: en un
  control crítico estar cerca de la meta no basta.
- **¿Cómo se relaciona la perspectiva de clientes con la propuesta de valor?** El indicador central (C01) mide lo que el
  cliente recibe: evidencia de su propio consumo. Los convenios (C02) y el foco comercial (C03) son de apoyo.
- **¿Por qué no medir directamente el 20% de ahorro?** Porque aún no hay mediciones comparables; prometer un porcentaje y
  entregar evidencia son metas distintas. La tolerancia se define después de medir.
- **¿Qué pasa si no sale el reglamento?** P01 es un hito crítico: sin autorización no se opera, aunque los demás
  indicadores estén en verde.

Las 20 preguntas del paquete, con sus respuestas, están en el Word de anexos.
