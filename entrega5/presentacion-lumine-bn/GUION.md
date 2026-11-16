# Lumine Motors · Guion de defensa · 7 minutos

Supuestos: Diego → Benjamín → Lukas; profesor y comisión del ramo IA; estructura híbrida. Los nombres se presentan por apellido. Se usan exclusivamente las cifras del informe adjunto de este ramo.

| Orador | Láminas | Palabras habladas | Tiempo estimado |
|---|---:|---:|---:|
| Diego Alarcón | 1–4 | 255 | 2:07 |
| Benjamín Torres | 5–8 | 266 | 2:21 |
| Lukas Verdugo | 9–12 | 282 | 2:15 |

**Total: 803 palabras; 6:43 estimados. Margen hasta 7:00: 17 segundos.**

Cálculo: 130 palabras/minuto + 1,2 s por cambio de lámina + 1,2 s por cue adicional + 3,5 s de silencio inicial/pausa + 12 s de observación del video. Las pausas breves «/» se absorben en la cadencia. El tiempo es una estimación de escritorio: ensayar con cronómetro. Si el ensayo supera 7:00, aplicar los recortes de abajo.

## Preparación

Abrir la presentación y el caso N1 antes de empezar. En la lámina 6, el video comercial de Fase 3 se reproduce a la izquierda; el caso N1 está a la derecha. Reservar 12 s para observar la grabación, sin abrir otra pestaña. Si el video falla, continuar con el fotograma y el resultado estático. No esperar una API ni digitar frente al profesor. El ejemplo actual usa Ridge y plantilla; la batería RAFA registrada usa cifras de E3. La demo es opcional y ya está incluida en el tiempo.

MVP de referencia entregado por el equipo: https://claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx . Su disponibilidad externa no forma parte de las pruebas de estos archivos.

## Discurso

### Lámina 1 · ¿Cuánto te vas a ahorrar?
Diego · 55 palabras · 0:30

[Posición central, manos a la altura del abdomen, silencio de 2 segundos mirando a la comisión] ¿Cuánto te vas a ahorrar? / Esa es la pregunta que un conductor necesita responder antes de comprar un kit híbrido. Una promesa genérica no le alcanza. [PAUSA 1.5s] Buenos días, profesor. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, de Lumine Motors. Proponemos una estimación personal y verificable. Lo recorreremos en tres pasos: evidencia, herramienta y decisión.

### Lámina 2 · Una cifra para todos se equivoca.
Diego · 65 palabras · 0:32

La promesa de hasta veinticinco por ciento falla por una razón concreta: el ahorro cambia con las detenciones y el uso del vehículo. [Clic: comparación de errores] En nuestra evaluación simulada, esa cifra tiene casi ocho puntos de error medio; Ridge, menos de uno. Es una mejora de aproximadamente diez veces. La comparación demuestra capacidad predictiva dentro de la simulación. Todavía no demuestra cuánto combustible ahorrará un kit físico.

### Lámina 3 · Conducir es real. El ahorro se simula.
Diego · 67 palabras · 0:32

Esta distinción define el alcance del trabajo. Entrenamos con trescientos conductores simulados y contrastamos con cuarenta y cinco jornadas reales de veintiún vehículos. Esas jornadas aportan patrones de conducción, pero su ahorro también se calcula con el simulador. Eliminamos el terreno propio por tiempo. Además, H1 se reformuló y H2 se cumplió parcialmente: cuatro variables no bastaron para explicar la variación prevista. Por eso conservamos las once.

### Lámina 4 · Podemos estimar. Falta probar si vende.
Diego · 68 palabras · 0:33

La pregunta de investigación tiene dos partes: estimar con precisión y comprobar si una estimación personal aumenta el agendamiento. La primera tiene evidencia computacional; la segunda sigue pendiente. Nuestra recomendación es implementar por fases, con ajustes, y medir antes de escalar. El resultado técnico sirve como punto de partida para el piloto. Para que llegue al cliente sin distorsionarse, hace falta controlar todo el recorrido de la cifra.

### Lámina 5 · Cada cifra se calcula una sola vez.
Benjamín · 63 palabras · 0:30

Ese recorrido tiene cuatro pasos. El simulador calcula la energía recuperable. Ridge estima el ahorro con once variables. El motor comercial convierte el resultado en pesos y plazo. Claude redacta con RAFA: rol, acción, formato y antecedentes. La frontera es explícita: el modelo de lenguaje recibe cifras cerradas y solo las copia. Un validador comprueba la salida y una persona supervisa el diagnóstico.

### Lámina 6 · Una cifra que el conductor puede usar.
Benjamín · 64 palabras · 0:44

El prototipo muestra un colectivo de doscientos trece kilómetros diarios. [Clic: caso N1] El ahorro estimado ronda el veinte por ciento, con su intervalo. Eso equivale a ciento cincuenta y nueve mil pesos mensuales y veintidós meses de recuperación conservadora. [Video: observar durante 12 segundos] La grabación muestra la página comercial; el resultado numérico corresponde al estimador. Es un ejemplo simulado del ramo. El mensaje del caso usa una plantilla de respaldo.

### Lámina 7 · El intervalo también tiene que aprobar.
Benjamín · 70 palabras · 0:34

La prueba externa mostró un límite. Con entrenamiento solo sintético, el intervalo cubría apenas un treinta y seis por ciento de las jornadas. Al incorporar datos reales, subió a setenta y ocho, cerca del ochenta previsto. La muestra viene de otra ciudad. Antes del diagnóstico comercial, necesitamos recalibrar con conducción de Santiago y contrastar la estimación con telemetría del kit instalado. Un error medio bajo, por sí solo, no basta.

### Lámina 8 · Las instrucciones también se probaron.
Benjamín · 69 palabras · 0:33

También probamos la explicación. La primera versión del prompt no aprobó ningún caso; la versión final aprobó los doce. Diez ataques en ChatGPT intentaron cambiar cifras, revelar información o afirmar legalidad. La revisión humana los consideró resistidos, aunque el validador detectó dos falsos negativos. Son pruebas acotadas, con una ejecución por caso. Para sostener el resultado, hay que repetirlas ante cada cambio y dejar registro de quién lo aprobó.

### Lámina 9 · Cada cambio deja una huella.
Lukas · 67 palabras · 0:32

Ese registro está en GitHub. Claude Code desarrolló el simulador y el prototipo; Codex integró Ridge, pruebas y reproducción independiente. El equipo revisó los cambios antes de integrarlos. Cinco herramientas de IA auditaron partes distintas, y sus respuestas se contrastaron con el código. No todas acertaron. En la integración documentada, las veinte pruebas automáticas pasaron. La trazabilidad permite revisar qué cambió, por qué y con qué evidencia.

### Lámina 10 · Una persona conserva la decisión.
Lukas · 73 palabras · 0:35

El uso responsable se vuelve concreto en tres controles. Primero, consentimiento específico y borrado de la ruta: el lenguaje recibe solo datos agregados. Segundo, el técnico puede aprobar, ajustar con motivo o bloquear la estimación. Tercero, hay una regla de suspensión por error, cobertura, brechas entre perfiles, fallas del validador o reclamos fundados. Legalidad, garantía y financiamiento quedan fuera de las respuestas automáticas. Así la empresa conserva la responsabilidad sobre lo que promete.

### Lámina 11 · El piloto debe justificar la inversión.
Lukas · 76 palabras · 0:36

La evaluación económica corresponde al estimador, no al taller completo. El primer año cuesta nueve millones de pesos. Bajo los supuestos del informe, necesita cerca de tres puntos adicionales de agendamiento para cubrirlos. Con cinco puntos, el retorno estimado sería sesenta y ocho por ciento. El efecto aún no se ha medido. Además, el A/B propuesto está diseñado para detectar quince puntos, no tres: conviene revisar su potencia antes de usarlo para decidir la rentabilidad.

### Lámina 12 · Una promesa que se puede comprobar.
Lukas · 66 palabras · 0:32

Por eso proponemos tres decisiones: retirar la promesa genérica, medir el efecto comercial con un A/B y habilitar el diagnóstico cuando la evidencia de terreno respalde el intervalo. La cotización debe declarar que es una estimación; la instalación depende de la viabilidad técnica y regulatoria. Construimos una herramienta, encontramos sus límites y definimos cómo comprobarla. El siguiente paso es poner a prueba la promesa. / Gracias.

## Versión recortable

1. Omitir la demo en vivo y explicar el caso sobre la lámina 6: recupera 12 s sin perder evidencia.
2. En la lámina 9, omitir «Cinco herramientas… No todas acertaron»: recupera unos 10 s. Conservar revisión humana y pruebas.
3. En la lámina 3, dejar H1/H2 para A1 y terminar después de «tiempo»: recupera unos 12 s.
No cortar la distinción entre simulación y medición, H3 pendiente, las condiciones para escalar ni el cierre. Los anexos se abren solo en preguntas.

## Preguntas difíciles · fuera de los 7 minutos

### 1. «¿Validaron el ahorro real o solo aprendieron a reproducir su simulador?»
**Responde Benjamín · respaldo A1/A2.** Las jornadas externas son reales, pero el ahorro objetivo se obtiene con simulación: todavía no validamos ahorro físico del kit. Contrastamos la transferencia a otros patrones de conducción; falta telemetría antes/después de instalaciones para comprobar la promesa comercial. **Por conseguir:** ficha del kit y protocolo de medición comparable en Santiago.

### 2. «¿Cómo justifican el retorno si no midieron H3 y su A/B no detecta el punto de equilibrio?»
**Responde Lukas · respaldo A4.** El retorno es un escenario condicionado a cotizaciones, conversión y margen del informe; no un beneficio observado. Los 173 casos por grupo se calcularon para 15 pp, y no permiten afirmar la misma potencia para 3 pp: antes de decidir la rentabilidad hay que ajustar el diseño y recalcular el costo variable de revisión técnica. **Por conseguir:** conversión real, margen vigente y tamaño muestral para el efecto mínimo relevante.

### 3. «¿Diez ataques y doce casos garantizan que Claude nunca inventará?»
**Responde Diego · respaldo A3/A5.** No: son los resultados de una batería acotada y una ejecución por caso. Por eso el lenguaje recibe cifras cerradas, se valida cada salida, existe una plantilla de respaldo y se repite la batería tras cada cambio. La revisión humana resolvió dos falsos negativos y detectó derivación excesiva al técnico en nueve ataques. **Por conseguir:** corridas repetidas y registro exacto de modelo/versión.

## Decisiones editoriales y límites

- Fondos claros y oscuros con acento celeste Lumine, según aclaración del equipo: negro para apertura, pregunta, caso, responsabilidad y decisión; blanco para evidencia.
- La comparación de errores se limita a simulación. «Datos reales» no se presenta como medición de ahorro con kit.
- El caso actual del MVP (19,7%, $159.000) se mantiene separado del ejemplo RAFA de E3 (19,6%, $158.000).
- No se trasladan precios, tecnología ni márgenes de la Fase 4 de Integrador II a este ramo.
- Los $9,0 M y el ROI de 68% se conservan como escenarios del informe, con su dependencia explícita.
- Las 20 pruebas y los ataques son evidencia histórica documentada en el informe; no se afirma haber repetido el entrenamiento ni las llamadas a modelos en esta entrega.
- No se recibió una rúbrica separada con ponderaciones. Se cubren los componentes del anexo J del informe sin inventar porcentajes de evaluación.
- Skill aplicada: guion-defensa-grupal (adjunta). La pasada de estilo se hizo manualmente; la skill referenciada revisar-tics-ia no está disponible en este repositorio.
