# Respaldo para la defensa · Solemne 2 · Control de Gestión

Lo que hay que saber para defender `Lumine_Solemne2_CMI_Control_de_Gestion.pptx`: qué es dato y qué no, qué contradicciones
aparecieron entre los materiales del paquete y qué riesgos o datos faltan. Las preguntas probables tienen su lámina en el
anexo (13 a 22). Los archivos del paquete (dossier, guion original, anexos y Excel) **no se suben al repositorio**, que es público.

## 1. Versión aprobada (20-10-2026)

- 12 láminas de exposición y un anexo de 9 temas con índice enlazado, ordenado por las preguntas más probables.
- Guion reescrito a 130 palabras por minuto: 1.556 palabras, unos 12:00 (máximo 15). Diego 1–4, Benjamín 5–8 y
  Lukas 9–12, unos 4:00 cada uno, con traspasos al final de las láminas 4 y 8.
- Cada titular es el mensaje de la lámina. Nada se dice dos veces: la meta de C01 se dice en la lámina 3 y se muestra en la
  ficha; el riesgo externo (ley sin reglamento) aparece solo en la 5.
- Respecto de la primera versión: salió la lámina del negocio (repetía la presentación anterior del curso); se fusionaron
  las dos de clientes (C02 y C03 pasaron al anexo); se separaron la ficha y el semáforo; se agregó el código QR a la demo de
  Lumine Habilita como prueba de que A02 se puede medir.
- No hay rúbrica con ponderaciones, solo los tres temas del comunicado. Se supuso igual peso: plan y desviaciones 200 s,
  indicadores 215 s y EVA con CMI 230 s.

## 2. Qué es cada cifra

| Lámina | Cifra o afirmación | Naturaleza | Cómo se ve |
|---|---|---|---|
| 3, A6 | Hasta 20% menos bencina en ciudad | Estimación de ingeniería, no medida en autos chilenos | «ESTIMACIÓN, NO MEDICIÓN» |
| 4, 5 | P01, P02, A03 y C02 pendientes | Hecho comprobado: ley sin reglamento; sin homologación, protocolo comparativo ni convenios | Borde rojo grueso (hito crítico pendiente) |
| 3, 4, A3, A4 | Indicadores que dependen de datos (A01, A02, P03, C01, C03, F01 a F03) | Sin datos: Lumine es preoperativa | Borde gris punteado (sin medir) |
| 3, 8, A3, A4 | Metas de 100%, «1 par», más de 50% en C03 | Metas de diseño del paquete, por aprobar | Fuente al pie y «META ORIENTATIVA» en C03 |
| 6 | 39 competencias y 4 niveles | Datos de la app Lumine Habilita (la demo usa datos ficticios) | «DEMO CON DATOS FICTICIOS» |
| 7, A1 | NOPAT US$150.000, capital US$1.000.000, WACC 12%, EVA US$30.000 | Ejemplo del módulo 4 (empresa genérica) | «EJEMPLO DE CLASE · NO LUMINE» |
| 9, A2 | Verde ≥90%, ámbar 70% a 89%, rojo <70%; críticos solo verdes al 100% | Umbrales de diseño propuestos | Fuente al pie |
| 10, 11 | 8 de 10 informes, 80%, −20 pp | Ejercicio didáctico | «EJERCICIO HIPOTÉTICO» |

No se usan las cifras del CMI antiguo (VAN a 10 años y otras), ni los rangos ICCT 9%–29% o SEG 25%–27%, ni sindicatos
como clientes.

## 3. Contradicciones encontradas (señaladas, no corregidas en silencio)

Regla del encargo: si las fuentes se contradicen, manda el contexto vigente de Lumine.

1. **Duración y guion.** El paquete planificaba 14:15 con su guion íntegro en las notas, pero ese guion dura 10:34 a 130
   palabras por minuto. Con el visto bueno del equipo se reescribió a 12:00, sin datos nuevos y sin repeticiones.
2. **«Exactamente 12 diapositivas».** Lo pedía el encargo del paquete. Se mantienen 12 de exposición y se suma un anexo
   que no se expone.
3. **Responsables del Excel (hoja MATRIZ_CMI) frente a la estructura de la Fase 3.** El Excel dice «Gerencia / Personas»
   (A02), «Operaciones / Técnicos habilitados» (P03), «Gerencia General / Finanzas» (F01) y «Administración y Finanzas»
   (F03). En las láminas se usan las áreas de la Fase 3: Responsable Técnico (A02 y P03), Gerente General (F01) y
   Administración y Personas (F03). La nota al pie de A3 y A4 lo dice. Conviene corregir el Excel antes de mostrarlo.
4. **Semáforo de C03.** El dossier usa la regla general (verde ≥90% de cumplimiento), pero la fórmula del Excel pone verde
   solo sobre la meta (>50%) y ámbar desde 70% de ella. Está anotado al pie de A2.
5. **Redondeo en CASO_SIMULADO.** La celda de la desviación muestra −19,999999999999996. Usar `=ROUND((B8-B5)*100;0)`.
6. **Informe «antes y después en condiciones comparables» (C01)** frente a la Fase 3, que acepta una línea base «medida o
   declarada». Si el consumo previo es declarado, el informe no es comparable. Hay que decidir cuál vale.
7. **C02 y A03 son hitos críticos.** El Excel los define así (C02, antes de vender; A03, primer protocolo). La primera versión
   los mostraba en gris; ahora van en rojo, como P01 y P02.
8. **Colores del encargo** (#000000, #12AAE9) frente a la paleta de la marca (#020304, #22B8F0): se usó la de la marca.
9. **Modalidad.** El comunicado diurno habla de «evaluación de aplicación práctica»; el equipo fue informado de una
   exposición de 15 minutos. La presentación trae los cálculos (EVA y 8 de 10) por si la evaluación es práctica.

## 4. Riesgos y datos que faltan

- **Aprobar los KPI y sus metas:** el Excel indica que los KPI complementarios, los umbrales y los ejemplos son propuestas
  de diseño que el equipo debe aprobar.
- **WACC de Lumine** y **tolerancia de error del ahorro:** no existen; se dicen como pendientes.
- **Química de la batería y número de motores:** siguen abiertos (LFP frente a LTO); las láminas no los nombran.
- **Licencia SEC del instalador:** sin confirmar (no aparece en las láminas).
- **Profesor y fecha:** la portada dice «Octubre 2026» y no nombra al profesor.
- **Código QR (lámina 6):** lleva a la demo pública de Habilita; probarlo con un teléfono antes de exponer. Si el profesor
  lo ve fuera de tema, se puede quitar y dar sus 40 s a la lámina 5.

## 5. Cálculos para responder en vivo

- **EVA (módulo 4, no Lumine):** 150.000 − 1.000.000 × 12% = 150.000 − 120.000 = **US$30.000**.
  Equivale a (ROIC − WACC) × capital = (15% − 12%) × 1.000.000 = 30.000.
- **Caso 8 de 10 (hipotético):** real = 80%; desviación = 80% − 100% = **−20 pp**; cumplimiento = 80%. Regla general:
  ámbar. Control crítico (informe obligatorio): rojo.

Las 20 preguntas del paquete, con sus respuestas, están en el Word de anexos.
