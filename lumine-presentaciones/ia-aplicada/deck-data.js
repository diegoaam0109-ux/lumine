window.DECK={
  "title": "Lumine Motors · Una promesa que se puede comprobar",
  "mainSlides": 12,
  "slides": [
    {
      "title": "¿Cuánto te vas a ahorrar?",
      "img": "slides/01.jpg?v=9502e96add20",
      "who": "Diego",
      "sec": 30,
      "notes": "<p>[Posición central, manos a la altura del abdomen, silencio de 2 segundos mirando a la comisión] ¿Cuánto te vas a ahorrar? / Esa es la pregunta que un conductor necesita responder antes de comprar un kit híbrido. Una promesa genérica no le alcanza. [PAUSA 1.5s] Buenos días, profesor. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, de Lumine Motors. Proponemos una estimación personal y verificable. Lo recorreremos en tres pasos: evidencia, herramienta y decisión.</p><p class=\"plan\">Informe final, §§1.2 y 9 · Estimador académico, noviembre de 2026.</p>"
    },
    {
      "title": "Una cifra para todos se equivoca.",
      "img": "slides/02.jpg?v=9502e96add20",
      "who": "Diego",
      "sec": 32,
      "notes": "<p>La promesa de hasta veinticinco por ciento falla por una razón concreta: el ahorro cambia con las detenciones y el uso del vehículo. [Clic: comparación de errores] En nuestra evaluación simulada, esa cifra tiene casi ocho puntos de error medio; Ridge, menos de uno. Es una mejora de aproximadamente diez veces. La comparación demuestra capacidad predictiva dentro de la simulación. Todavía no demuestra cuánto combustible ahorrará un kit físico.</p><p class=\"plan\">Informe final, resumen y §5.3 · Comparación con ahorro simulado; 10 particiones de conductores no vistos.</p>"
    },
    {
      "title": "Conducir es real. El ahorro se simula.",
      "img": "slides/03.jpg?v=9502e96add20",
      "who": "Diego",
      "sec": 32,
      "notes": "<p>Esta distinción define el alcance del trabajo. Entrenamos con trescientos conductores simulados y contrastamos con cuarenta y cinco jornadas reales de veintiún vehículos. Esas jornadas aportan patrones de conducción, pero su ahorro también se calcula con el simulador. Eliminamos el terreno propio por tiempo. Además, H1 se reformuló y H2 se cumplió parcialmente: cuatro variables no bastaron para explicar la variación prevista. Por eso conservamos las once.</p><p class=\"plan\">Informe final, tabla 4 y §§4.5, 5.7 · NREL/CMAP; no hay medición con kit instalado.</p>"
    },
    {
      "title": "Podemos estimar. Falta probar si vende.",
      "img": "slides/04.jpg?v=9502e96add20",
      "who": "Diego",
      "sec": 33,
      "notes": "<p>La pregunta de investigación tiene dos partes: estimar con precisión y comprobar si una estimación personal aumenta el agendamiento. La primera tiene evidencia computacional; la segunda sigue pendiente. Nuestra recomendación es implementar por fases, con ajustes, y medir antes de escalar. El resultado técnico sirve como punto de partida para el piloto. Para que llegue al cliente sin distorsionarse, hace falta controlar todo el recorrido de la cifra.</p><p class=\"plan\">Informe final, tablas 2–3 y §9 · OE2, OE3 y OE5 cumplidos; H3 pendiente.</p>"
    },
    {
      "title": "Cada cifra se calcula una sola vez.",
      "img": "slides/05.jpg?v=9502e96add20",
      "who": "Benjamín",
      "sec": 30,
      "notes": "<p>Ese recorrido tiene cuatro pasos. El simulador calcula la energía recuperable. Ridge estima el ahorro con once variables. El motor comercial convierte el resultado en pesos y plazo. Claude redacta con RAFA: rol, acción, formato y antecedentes. La frontera es explícita: el modelo de lenguaje recibe cifras cerradas y solo las copia. Un validador comprueba la salida y una persona supervisa el diagnóstico.</p><p class=\"plan\">Informe final, §§4.2 y 5.1–5.2 · Simulador → Ridge → motor comercial → RAFA.</p>"
    },
    {
      "title": "Una cifra que el conductor puede usar.",
      "img": "slides/06.jpg?v=9502e96add20",
      "who": "Benjamín",
      "sec": 44,
      "notes": "<p>El prototipo muestra un colectivo de doscientos trece kilómetros diarios. [Clic: caso N1] El ahorro estimado ronda el veinte por ciento, con su intervalo. Eso equivale a ciento cincuenta y nueve mil pesos mensuales y veintidós meses de recuperación conservadora. [Video: observar durante 12 segundos] La grabación muestra la página comercial; el resultado numérico corresponde al estimador. Es un ejemplo simulado del ramo. El mensaje del caso usa una plantilla de respaldo.</p><p class=\"plan\">Informe final, anexo G, figura G1 · Caso N1 sintético; Ridge. Mensaje del MVP: plantilla de respaldo.</p>",
      "video": {
        "src": "video/pagina-comercial.mp4?v=9502e96add20",
        "box": {
          "x": 5,
          "y": 39,
          "w": 46,
          "h": 46
        }
      }
    },
    {
      "title": "El intervalo también tiene que aprobar.",
      "img": "slides/07.jpg?v=9502e96add20",
      "who": "Benjamín",
      "sec": 34,
      "notes": "<p>La prueba externa mostró un límite. Con entrenamiento solo sintético, el intervalo cubría apenas un treinta y seis por ciento de las jornadas. Al incorporar datos reales, subió a setenta y ocho, cerca del ochenta previsto. La muestra viene de otra ciudad. Antes del diagnóstico comercial, necesitamos recalibrar con conducción de Santiago y contrastar la estimación con telemetría del kit instalado. Un error medio bajo, por sí solo, no basta.</p><p class=\"plan\">Informe final, §5.3 y tabla D2 · 45 jornadas secundarias; ahorro objetivo simulado, reajuste con datos reales.</p>"
    },
    {
      "title": "Las instrucciones también se probaron.",
      "img": "slides/08.jpg?v=9502e96add20",
      "who": "Benjamín",
      "sec": 33,
      "notes": "<p>También probamos la explicación. La primera versión del prompt no aprobó ningún caso; la versión final aprobó los doce. Diez ataques en ChatGPT intentaron cambiar cifras, revelar información o afirmar legalidad. La revisión humana los consideró resistidos, aunque el validador detectó dos falsos negativos. Son pruebas acotadas, con una ejecución por caso. Para sostener el resultado, hay que repetirlas ante cada cambio y dejar registro de quién lo aprobó.</p><p class=\"plan\">Informe final, §5.4 y anexo B · 12 casos; 10 ataques, revisión humana. Una ejecución por caso.</p>"
    },
    {
      "title": "Cada cambio deja una huella.",
      "img": "slides/09.jpg?v=9502e96add20",
      "who": "Lukas",
      "sec": 32,
      "notes": "<p>Ese registro está en GitHub. Claude Code desarrolló el simulador y el prototipo; Codex integró Ridge, pruebas y reproducción independiente. El equipo revisó los cambios antes de integrarlos. Cinco herramientas de IA auditaron partes distintas, y sus respuestas se contrastaron con el código. No todas acertaron. En la integración documentada, las veinte pruebas automáticas pasaron. La trazabilidad permite revisar qué cambió, por qué y con qué evidencia.</p><p class=\"plan\">Informe final, §§5.5–5.6 y anexo K · Evidencia histórica declarada: integración con 20/20 pruebas.</p>"
    },
    {
      "title": "Una persona conserva la decisión.",
      "img": "slides/10.jpg?v=9502e96add20",
      "who": "Lukas",
      "sec": 35,
      "notes": "<p>El uso responsable se vuelve concreto en tres controles. Primero, consentimiento específico y borrado de la ruta: el lenguaje recibe solo datos agregados. Segundo, el técnico puede aprobar, ajustar con motivo o bloquear la estimación. Tercero, hay una regla de suspensión por error, cobertura, brechas entre perfiles, fallas del validador o reclamos fundados. Legalidad, garantía y financiamiento quedan fuera de las respuestas automáticas. Así la empresa conserva la responsabilidad sobre lo que promete.</p><p class=\"plan\">Informe final, tablas 5 y 9; §6.2 · Medidas y responsabilidades propuestas, no operación desplegada.</p>"
    },
    {
      "title": "El piloto debe justificar la inversión.",
      "img": "slides/11.jpg?v=9502e96add20",
      "who": "Lukas",
      "sec": 36,
      "notes": "<p>La evaluación económica corresponde al estimador, no al taller completo. El primer año cuesta nueve millones de pesos. Bajo los supuestos del informe, necesita cerca de tres puntos adicionales de agendamiento para cubrirlos. Con cinco puntos, el retorno estimado sería sesenta y ocho por ciento. El efecto aún no se ha medido. Además, el A/B propuesto está diseñado para detectar quince puntos, no tres: conviene revisar su potencia antes de usarlo para decidir la rentabilidad.</p><p class=\"plan\">Informe final, §8 y supuestos S13–S16 · $9.005.200 año 1; equilibrio redondeado. Beneficio no medido.</p>"
    },
    {
      "title": "Una promesa que se puede comprobar.",
      "img": "slides/12.jpg?v=9502e96add20",
      "who": "Lukas",
      "sec": 32,
      "notes": "<p>Por eso proponemos tres decisiones: retirar la promesa genérica, medir el efecto comercial con un A/B y habilitar el diagnóstico cuando la evidencia de terreno respalde el intervalo. La cotización debe declarar que es una estimación; la instalación depende de la viabilidad técnica y regulatoria. Construimos una herramienta, encontramos sus límites y definimos cómo comprobarla. El siguiente paso es poner a prueba la promesa. / Gracias.</p><p class=\"plan\">Informe final, §§7 y 9 · H3 pendiente; diagnóstico condicionado a telemetría y viabilidad regulatoria.</p>"
    },
    {
      "title": "Qué respondimos y qué sigue pendiente.",
      "img": "slides/13.jpg?v=9502e96add20",
      "who": "",
      "sec": 0,
      "notes": "<p>Respaldo para preguntas.</p><p class=\"plan\">Informe final, tablas 2–3 y 4 · Alcance académico de IA, no Fase 4 financiera.</p>"
    },
    {
      "title": "La evidencia detrás del modelo.",
      "img": "slides/14.jpg?v=9502e96add20",
      "who": "",
      "sec": 0,
      "notes": "<p>Respaldo para preguntas.</p><p class=\"plan\">Informe final, tabla D1 y §5.3 · Valores medios de 10 particiones; objetivos simulados.</p>"
    },
    {
      "title": "RAFA: del dato cerrado al mensaje.",
      "img": "slides/15.jpg?v=9502e96add20",
      "who": "",
      "sec": 0,
      "notes": "<p>Respaldo para preguntas.</p><p class=\"plan\">Informe final, §5.2 y anexos A–B · Ejemplo N1 registrado en E3; distinto del Ridge actual del MVP.</p>"
    },
    {
      "title": "El retorno depende de supuestos.",
      "img": "slides/16.jpg?v=9502e96add20",
      "who": "",
      "sec": 0,
      "notes": "<p>Respaldo para preguntas.</p><p class=\"plan\">Informe final, §8, tabla 12 y anexo I · Supuestos económicos del ramo IA, por actualizar con el TIG.</p>"
    },
    {
      "title": "Cuándo se detiene el diagnóstico.",
      "img": "slides/17.jpg?v=9502e96add20",
      "who": "",
      "sec": 0,
      "notes": "<p>Respaldo para preguntas.</p><p class=\"plan\">Informe final, §6.2 · Umbrales propuestos; reactivar exige recalibración, pruebas y firma de gerencia.</p>"
    }
  ],
  "annex": [
    {
      "code": "A1",
      "title": "Qué respondimos y qué sigue pendiente.",
      "question": "Qué respondimos y qué sigue pendiente.",
      "slide": 13,
      "keywords": [
        "objetivos",
        "hipótesis",
        "H1",
        "H2",
        "H3",
        "datos"
      ]
    },
    {
      "code": "A2",
      "title": "La evidencia detrás del modelo.",
      "question": "La evidencia detrás del modelo.",
      "slide": 14,
      "keywords": [
        "Ridge",
        "error",
        "modelo",
        "validación"
      ]
    },
    {
      "code": "A3",
      "title": "RAFA: del dato cerrado al mensaje.",
      "question": "RAFA: del dato cerrado al mensaje.",
      "slide": 15,
      "keywords": [
        "RAFA",
        "prompt",
        "Claude",
        "JSON"
      ]
    },
    {
      "code": "A4",
      "title": "El retorno depende de supuestos.",
      "question": "El retorno depende de supuestos.",
      "slide": 16,
      "keywords": [
        "costo",
        "ROI",
        "A/B",
        "margen",
        "retorno",
        "economía"
      ]
    },
    {
      "code": "A5",
      "title": "Cuándo se detiene el diagnóstico.",
      "question": "Cuándo se detiene el diagnóstico.",
      "slide": 17,
      "keywords": [
        "privacidad",
        "riesgo",
        "suspensión",
        "gobernanza"
      ]
    }
  ]
};
