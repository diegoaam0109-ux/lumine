// Guion de la Solemne 2 = Avance 2 del TIG de Control de Gestión (ICMA901), 17-11-2026: OVA, ejes, mapa y CMI.
// Una sola fuente para las notas del orador (deck.js) y el Word del guion (guion-docx.js).
// Cada lámina tiene una nota breve para exponer (idea, evidencia, concepto y transición) y un texto ampliado solo para ensayar.
// No se lee: la nota es un apoyo. Base de datos al 12-11-2026 (Fase 3 v7 y Fases 1 y 2 corregidas del plan del equipo).
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';
const PRINCIPAL = [
  { d: 'portada', quien: DIEGO, seccion: '1. Portada', titulo: 'Portada',
    idea: 'Presentamos cómo la estrategia de Lumine se traduce en objetivos, indicadores, metas y decisiones.',
    evidencia: 'Lumine todavía no vende: el tablero controla primero la preparación y después la operación.',
    concepto: 'Control de gestión: sistema que traduce la estrategia en acción medible.',
    transicion: 'Parto por el problema que justifica el negocio.',
    texto: 'Buenos días, profesor. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y presentamos el avance dos del TIG: cómo la estrategia de Lumine Motors se traduce en objetivos, indicadores, metas y decisiones. Lumine todavía no vende, así que el cuadro de mando que van a ver controla primero la preparación y después la operación.' },
  { d: 'contexto', quien: DIEGO, seccion: '4. Comprensión del negocio', titulo: 'Una necesidad clara y una restricción legal',
    idea: 'Hay una necesidad documentada, pero el kit todavía no tiene norma que permita venderlo.',
    evidencia: 'Bencina 93: $1.168,9 → $1.538,9; 3,5 usados por nuevo; el gas solo admite autos de hasta 7 años. Según el 3CV, el reglamento en trámite no alcanza al kit: la vía es un proyecto experimental (D.S. N° 67).',
    concepto: 'Empresa preoperativa: el control separa lo que depende de Lumine de lo que no.',
    transicion: '¿A qué apuesta Lumine? Lo formulamos como objetivo, ventaja y alcance.',
    texto: 'En marzo, la bencina noventa y tres subió en Santiago de mil ciento sesenta y ocho a mil quinientos treinta y ocho pesos el litro, y la gente conserva su auto: se transfieren tres coma cinco usados por cada nuevo. El gas solo admite autos de hasta siete años. Lumine instala dos motores eléctricos en las ruedas traseras y una batería que se carga al frenar, sin tocar el motor. La restricción es legal: según el secretario técnico del 3CV, el reglamento que se tramita no alcanza a este kit. La vía es un proyecto experimental, que permite circular pero no vender, y después una norma propia. Por eso el control debe separar lo que depende de Lumine de lo que no.' },
  { d: 'ova', quien: DIEGO, seccion: '7. Formulación de estrategia', titulo: 'Objetivo, ventaja y alcance',
    idea: 'La estrategia es diferenciación enfocada: competir con evidencia donde el ahorro vale más.',
    evidencia: 'Objetivo: 2.934 instalaciones acumuladas y 16 talleres en la red en 2032, con retorno sobre el costo del capital. Alcance: 73.908 vehículos de uso laboral en la RM. El kit cuesta 81% a 84% del precio neto: no se puede competir por costo.',
    concepto: 'OVA; diferenciación enfocada y renuncias (Porter, 1996).',
    transicion: 'Para llegar ahí hay tres brechas; cada una es un eje.',
    texto: 'El objetivo es llegar en dos mil treinta y dos a dos mil novecientas treinta y cuatro instalaciones acumuladas, con el ahorro verificado en cada auto, y a dieciséis talleres en la red, con un retorno superior al costo del capital. La ventaja es diferenciarnos por evidencia: el mismo auto, con un ahorro medido en el vehículo del cliente y una calibración hecha para su modelo. Distinguimos lo que existe de lo que falta: el estimador de ahorro y Lumine Habilita existen como prototipo y la vía regulatoria está identificada; la biblioteca de calibraciones, el ahorro medido y las autorizaciones están por desarrollar. El alcance son los conductores de uso laboral y alto kilometraje de la Región Metropolitana, unos setenta y cuatro mil vehículos, y regiones solo a través de la red. Renunciamos a competir por precio contra el gas, al conductor de bajo kilometraje y a la inmediatez.' },
  { d: 'ejes', quien: DIEGO, seccion: '7 y 8. Ejes y objetivos', titulo: 'Tres ejes, uno por brecha',
    idea: 'Cada eje cierra una brecha entre la Lumine de hoy y su objetivo.',
    evidencia: 'Habilitación formal (brecha legal) → P1, P2, P6. Acceso comercial (inercia y pago) → C4, P6. Conocimiento y escala (ahorro sin medir) → A1 a A4, P4, P5, C2, F3. Los 8 objetivos de los ejes se desagregan en 17.',
    concepto: 'Ejes estratégicos como pilares del mapa (Kaplan y Norton, 2008).',
    transicion: 'Benjamín muestra cómo se conectan los 17 objetivos.',
    texto: 'La estrategia se ordena en tres ejes, uno por brecha. Habilitación formal, contra la brecha legal: ejecutar el proyecto experimental, obtener la autorización del taller y de cada par kit-modelo, y el reconocimiento de aseguradoras y plantas. Acceso comercial, contra la inercia del conductor y su capacidad de pago: captar el alto kilometraje y ofrecer pago en cuotas con un financista. Conocimiento y escala, contra el ahorro sin medir: medir el ahorro, retener el conocimiento y crecer con la red. Esos ocho objetivos se desagregan en diecisiete, en las cuatro perspectivas. Cuatro no vienen de un eje, sino de la propuesta de valor: la instalación segura, la promesa técnica, la confianza del cliente y el margen por servicio. Benjamín muestra cómo se conectan.' },
  { d: 'mapa', quien: BENJA, seccion: '9.1 Mapa estratégico', titulo: '17 objetivos y 21 relaciones',
    idea: 'El mapa muestra la lógica causal; el CMI le pone indicador, meta, responsable e iniciativa.',
    evidencia: '7 relaciones habilitantes, 2 condiciones externas (la norma propia, fuera de las perspectivas) y 12 hipótesis. Tres cadenas: habilitación, evidencia y valor económico.',
    concepto: 'Mapa estratégico de Kaplan y Norton (2008): de los intangibles al resultado financiero.',
    transicion: 'Recorremos una cadena para ver cómo funciona.',
    texto: 'Gracias, Diego. El mapa se lee de abajo hacia arriba: el aprendizaje hace posibles los procesos, los procesos producen la propuesta de valor, y de ahí salen la confianza, la captación y la rentabilidad. Tiene diecisiete objetivos y veintiuna relaciones. Las continuas son habilitantes: sin la anterior, la siguiente no es posible. Las gruesas son condiciones externas, y salen de la norma propia, que dejamos fuera de las perspectivas porque no es un objetivo de Lumine. Las punteadas son hipótesis que el tablero debe comprobar. Hay tres cadenas. La de habilitación lleva del proyecto experimental, la biblioteca y los técnicos a la promesa técnica cumplida. La de evidencia va del protocolo de medición a la confianza y la captación. Y la de valor económico conecta la captación con el margen y la rentabilidad sobre el costo del capital. El mapa no mide nada: muestra la lógica. La medición está en la matriz del cuadro de mando, que vemos después.' },
  { d: 'cadena', quien: BENJA, seccion: '9.3 Relaciones causa-efecto', titulo: 'La cadena de evidencia',
    idea: 'Una relación vale si sabemos con qué dato se revisa y qué decidimos si falla.',
    evidencia: 'A3 protocolo → P4 expediente → C2 ahorro cumplido → C3 confianza → C4 conversión. Dos eslabones habilitantes y dos hipótesis.',
    concepto: 'Relación causa-efecto como hipótesis verificable; la clasificación no prueba causalidad.',
    transicion: 'Ahora, la matriz: primero aprendizaje y procesos.',
    texto: 'Tomemos la cadena de evidencia, la que sostiene la diferenciación. Parte en un protocolo de medición comparable, con una prueba controlada y un piloto con telemetría a cargo de un tercero. Con ese protocolo, cada servicio cierra con su expediente. Eso hace posible verificar si el cliente obtuvo el ahorro mínimo que se le informó. Hasta ahí, las relaciones son habilitantes. Después vienen dos hipótesis: que un ahorro cumplido genere confianza, y que la confianza mejore la conversión. Para cada una sabemos qué dato la revisa y qué decidimos si falla. Si el ahorro queda bajo la meta, corregimos el intervalo que se informa antes de gastar más en promoción. Si el ahorro se cumple y la conversión no sube, la barrera es el pago, y revisamos los convenios. Estas hipótesis son las primeras que se prueban, con los clientes del primer trimestre.' },
  { d: 'cmi1', quien: BENJA, seccion: '9.2 Indicadores · aprendizaje y procesos', titulo: 'CMI: aprendizaje y procesos',
    idea: 'La base del tablero son reglas de seguridad al 100% e hitos con fecha y documento.',
    evidencia: 'Críticos al 100%: A1, A2, P3, P4. Hitos: A3, P1, P2, P5, P6. P1: solicitud del proyecto experimental en el 1.er trimestre de 2027; Gerencia General.',
    concepto: 'Indicadores inductores; hito con documento que lo acredita.',
    transicion: 'Lukas sigue con clientes y finanzas.',
    texto: 'La matriz de aprendizaje y procesos tiene diez objetivos. En aprendizaje están las capacidades que sostienen la ventaja: la biblioteca de calibraciones, los técnicos habilitados, el protocolo de medición y Lumine Habilita. Si la biblioteca no se protege, la ventaja se copia; por eso A1 exige que todas las calibraciones queden registradas y protegidas antes de reutilizarse. Hay dos tipos de indicador. Cuatro se controlan al cien por ciento porque protegen la seguridad: en P3, un noventa y cinco por ciento significa que un auto salió sin verificar. Cinco son hitos, y cumplen solo con el documento que los acredita. El más importante hoy es P1, el proyecto experimental: la meta es presentar la solicitud en el primer trimestre de dos mil veintisiete y entregar el informe de resultados antes de abrir; lo responde la Gerencia General y su iniciativa viene del cruce FO2. P6 exige los tres convenios, con una aseguradora, una planta de revisión y un financista, antes del primer auto vendido. Cada iniciativa de la tabla viene de un cruce del FODA. Lukas sigue con clientes y finanzas.' },
  { d: 'cmi2', quien: LUKAS, seccion: '9.2 Indicadores · clientes y financiera', titulo: 'CMI: clientes y resultados financieros',
    idea: 'Cada indicador mide el resultado que nombra su objetivo; las metas sin dato son provisionales y tienen fecha.',
    evidencia: 'C2: 80% de clientes con el ahorro mínimo. C3: 80% de confianza 4 o 5, más reclamos. C4: conversión trimestral de 30%. F1: VAN antes de invertir; retorno sobre el capital operando. F2: kit bajo $2.866.010 y $3.211.125.',
    concepto: 'Indicadores de resultado; meta provisional con fundamento.',
    transicion: 'Desarrollo una ficha completa: C2.',
    texto: 'Gracias, Benjamín. En clientes, cada indicador mide lo que nombra su objetivo. C2 mide si el cliente obtuvo el ahorro mínimo que se le informó; C3 tiene una medida principal, la confianza con nota cuatro o cinco, y una complementaria, los reclamos; C4 es la conversión del trimestre: instalaciones sobre cotizaciones de modelos calibrados. C1, la promesa técnica, se controla al cien por ciento con el acta de conformidad. En finanzas, F1 cambia según la etapa: antes de invertir se decide con el valor actual neto del plan, y operando se controla con el retorno sobre el capital frente a su costo. F2 es el margen por servicio, y su primer dato no requiere operar: que la cotización del kit quede bajo el umbral de viabilidad. F3 es una regla de decisión: un taller entra a la red solo si su evaluación incremental es positiva. Cuatro metas son provisionales, y para cada una definimos qué dato falta, quién la fija y cuándo.' },
  { d: 'ficha', quien: LUKAS, seccion: '9.4 Fichas de indicadores', titulo: 'Un indicador completo: C2',
    idea: 'C2 une la promesa de valor con la medición; no se confunde entregar un informe con cumplir la promesa.',
    evidencia: 'Fórmula: clientes con ahorro ≥ mínimo informado ÷ clientes medidos. Fuente: unidad de control frente a la línea base. Trimestral. Meta 80% (provisional). Comercial y Postventa.',
    concepto: 'Ficha del indicador: fórmula, fuente, frecuencia, meta, responsable y acción.',
    transicion: '¿Qué pasa si C2 se desvía?',
    texto: 'Esta es la ficha de C2. La fórmula: clientes del trimestre cuyo ahorro medido a los tres meses iguala o supera el mínimo que se les informó al cotizar, sobre los clientes con medición completa. La fuente es el consumo que registra la unidad de control frente a la línea base del mismo auto. Se mide cada trimestre. La meta es ochenta por ciento, provisional hasta medir el ahorro en el proyecto experimental, y la responde Comercial y Postventa con los datos de Ingeniería de Calibración. Es un indicador creciente: cumple con ochenta por ciento o más, está en alerta entre setenta y dos y setenta y nueve, y no cumple bajo setenta y dos. Si un trimestre no tiene clientes medidos, no aplica todavía: no se pinta de rojo. Elegimos esta ficha porque une la promesa con la medición. El reporte que se entrega al cliente se exige en P4: así, entregar un informe no se confunde con cumplir lo prometido.' },
  { d: 'desviacion', quien: LUKAS, seccion: '9.5 Estados del tablero', titulo: 'De la desviación a la decisión',
    idea: 'Las reglas de estado no se superponen y cada estado dispara una decisión.',
    evidencia: 'Creciente: cumple ≥ meta; alerta 90% a 99%; no cumple bajo 90%. Crítico: solo 100%. Hito: cumplido, en curso o vencido. Hoy: 3 en curso, 2 no iniciados en plazo, 12 no aplican todavía.',
    concepto: 'Ciclo de control: observar, comparar, explicar, decidir y volver a medir.',
    transicion: 'Diego cierra con lo que el sistema permite gestionar.',
    texto: 'Las reglas dependen del tipo de indicador. Uno creciente cumple sobre la meta, está en alerta entre el noventa y el cien por ciento de ella, y no cumple bajo el noventa. Un crítico solo cumple al cien. Un hito está cumplido, en curso o vencido según su fecha. Ejemplo: si en un trimestre C2 llega a setenta y cinco por ciento, está en alerta. Primero explicamos si la causa es externa, del proceso o de la medición; después decidimos: revisar el intervalo que informa el estimador y recalibrar los autos bajo el mínimo, sin aumentar la promoción. Un hito como P1 queda vencido si pasa el primer trimestre de dos mil veintisiete sin la solicitud; entonces se recalendariza la apertura y no se compromete arriendo. Hoy, tres indicadores están en curso, dos no iniciados y en plazo, y doce no aplican todavía, porque no hay operación. Ninguno está vencido. Diego cierra.' },
  { d: 'cierre', quien: DIEGO, seccion: '9 y recomendaciones', titulo: 'Qué permite gestionar y qué falta validar',
    idea: 'El sistema dice qué cumplir antes de vender, qué medir primero y cuándo decidir invertir.',
    evidencia: 'Falta validar: la norma (externa), el ahorro real, el costo del kit, la tasa de costo de capital y las 12 hipótesis.',
    concepto: 'El CMI de una empresa preoperativa ordena decisiones antes de mostrar resultados.',
    transicion: 'Gracias; quedamos atentos a sus preguntas.',
    texto: 'Gracias, Lukas. Este sistema nos permite gestionar tres cosas: qué cumplir antes de vender, con cinco indicadores de preparación; qué medir primero, el ahorro en el proyecto experimental, porque sostiene la diferenciación; y cuándo decidir invertir, con norma vigente, ahorro cumplido, margen positivo y valor actual neto positivo. Lo que falta validar está identificado: la norma, que no depende de nosotros; el ahorro real; la cotización del kit; la tasa de costo de capital, y las doce hipótesis del mapa. Muchas gracias.' },
];

// Anexo: no se expone. El índice enlaza a cada lámina y cada lámina vuelve al índice.
const ANEXO = [
  { codigo: 'A1', d: 'a-escenarios', titulo: '¿Qué pasa si no hay norma propia?', apoyo: 'Escenarios E1 a E4, señal temprana, efecto en el CMI y contingencia. E1 es un supuesto de planificación, no un pronóstico.' },
  { codigo: 'A2', d: 'a-lienzo', titulo: 'Lienzo de propuesta de valor', apoyo: 'Frustraciones de la investigación del equipo y sus aliviadores; el más fuerte: no reemplaza el auto.' },
  { codigo: 'A3', d: 'a-mefe', titulo: 'MEFE: oportunidades y amenazas', apoyo: 'Peso = relevancia ÷ suma; calificación 1 a 4. Total 2,03 hoy.' },
  { codigo: 'A4', d: 'a-mefi', titulo: 'MEFI: fortalezas y debilidades', apoyo: 'Total 2,32 hoy. Pesan D1 (gestión sin iniciar) y D2 (ahorro sin medir).' },
  { codigo: 'A5', d: 'a-porter', titulo: 'Cinco fuerzas', apoyo: 'Intensidad media (3,14). La inercia de no intervenir el auto se califica en clientes, no en sustitutos.' },
  { codigo: 'A6', d: 'a-recursos', titulo: 'Recursos y capacidades (Hitt)', apoyo: '3 potencialmente sostenibles, 7 temporales y 7 de igualdad.' },
  { codigo: 'A7', d: 'a-cruces', titulo: 'Cruces del FODA', apoyo: '11 estrategias, cada una con el objetivo del CMI que alimenta. Hoy van primero DO y DA.' },
  { codigo: 'A8', d: 'a-rel1', titulo: 'Las 21 relaciones causa-efecto', parte: 'habilitación y evidencia', apoyo: 'R01 a R15: mecanismo y dato que revisa cada relación.' },
  { codigo: 'A8', d: 'a-rel2', titulo: 'Las 21 relaciones causa-efecto', parte: 'valor económico y cadenas', apoyo: 'R16 a R21 y las tres cadenas decisivas con su decisión si fallan.' },
  { codigo: 'A9', d: 'a-fichas', titulo: 'Fichas de P1 y C4', apoyo: 'P1 lo defiende Diego; C4, Benjamín.' },
  { codigo: 'A10', d: 'a-metas', titulo: 'Ficha de F2 y metas provisionales', apoyo: 'F2 lo defiende Lukas. Cada meta provisional dice qué dato falta, quién la fija y cuándo.' },
  { codigo: 'A11', d: 'a-secuencia', titulo: 'Secuencia de activación y línea base', apoyo: 'Cuatro etapas con condición de paso; estado de los 17 indicadores al 12-11-2026.' },
  { codigo: 'A12', d: 'a-postura', titulo: '¿Qué permiten concluir MEFE y MEFI?', apoyo: 'Escenario de evaluación: MEFE 2,03 → 2,75; sin norma, 2,54. El puntaje no autoriza la ofensiva.' },
  { codigo: 'A13', d: 'a-cliente', titulo: '¿En cuánto recupera el kit el cliente?', apoyo: 'Una sola base: bencina a $1.538,9, 10 km/L y ahorro simulado por perfil. 26 a 35 meses.' },
  { codigo: 'A14', d: 'a-base', titulo: 'Base común de datos al 12-11-2026', apoyo: 'Qué es dato, resultado de la investigación, plan aprobado o provisional; demo de Lumine Habilita.' },
];

// Banco de preguntas probables, con respuesta corta y quién la toma.
const PREGUNTAS = [
  { quien: DIEGO, p: '¿Por qué la vía regulatoria cambió respecto del avance 1?', r: 'Porque la entrevista al secretario técnico del 3CV precisó que el reglamento en trámite regula la conversión a eléctrico y no alcanza a un sistema que conserva el motor. La vía es un proyecto experimental bajo el D.S. N° 67, que permite circular pero no vender, y después una norma propia. Por eso P1 mide lo que Lumine controla y la norma queda como condición externa.' },
  { quien: DIEGO, p: '¿E1 no es un supuesto demasiado optimista?', r: 'E1 fija el calendario: apertura en enero de 2028. No reduce la incertidumbre; la separa. Lo que depende de Lumine se mide en P1, la norma se monitorea cada mes y E2, E3 y E4 tienen contingencia (anexo A1).' },
  { quien: DIEGO, p: '¿Cuál es la diferencia entre la ventaja y el alcance?', r: 'La ventaja es en qué nos diferenciamos: evidencia de ahorro y calibración por modelo, sostenidas por el sistema de calibración, medición y habilitación. El alcance es dónde competimos: uso laboral de alto kilometraje en la RM, con modelo calibrado; regiones solo por la red.' },
  { quien: DIEGO, p: '¿De dónde salen 2.934 instalaciones y 16 talleres?', r: 'Del escenario central del plan del equipo (Fase 3): 284 instalaciones el primer año y 807 el quinto, limitadas por la capacidad comercial, y la red desde el tercer año. Son metas del plan y se ajustan con el Plan Financiero.' },
  { quien: DIEGO, p: 'Defienda el indicador P1.', r: 'Hito con tres entregables: resolución, vehículos medidos e informe entregado al 3CV. Meta: solicitud en el primer trimestre de 2027 e informe antes del mes −4. Responsable: Gerencia General. Si la resolución se atrasa más de un trimestre, se recalendariza la apertura y no se compromete arriendo ni contrataciones.' },
  { quien: BENJA, p: '¿Por qué la norma no es un objetivo del mapa?', r: 'Porque no depende de Lumine. Un objetivo debe poder gestionarse; la norma es una condición externa que actúa por R03 y R07. Lo que Lumine sí controla, ejecutar el proyecto experimental y entregar sus resultados, es P1.' },
  { quien: BENJA, p: '¿Una relación habilitante prueba causalidad?', r: 'No. Habilitante significa condición necesaria: sin par autorizado no hay instalación. Las hipótesis son efectos esperados que se revisan con un dato definido (anexo A8). La clasificación dice qué tan probada está una relación, no que exista.' },
  { quien: BENJA, p: '¿Qué decisión cambia si la cadena de evidencia falla?', r: 'Si C2 queda bajo la meta, se corrige el intervalo que se informa al cotizar antes de aumentar la promoción. Si C2 cumple y C4 no sube, la barrera es el pago: se revisan los convenios con el financista (R15).' },
  { quien: BENJA, p: '¿Por qué tantos indicadores al 100%?', r: 'Porque protegen la seguridad o la promesa técnica: un 95% en P3 significa que un auto salió sin verificar. Para ellos no hay alerta: toda brecha es incumplimiento y se detiene la entrega afectada.' },
  { quien: BENJA, p: 'Defienda el indicador C4.', r: 'Instalaciones del trimestre sobre cotizaciones de modelos calibrados del mismo trimestre. Meta provisional de 30%, el supuesto del pronóstico; se confirma con el embudo de los tres primeros meses. Si queda bajo 30%, se corrige la meta de ventas antes de contratar el siguiente dúo. Responsable: Comercial y Postventa.' },
  { quien: LUKAS, p: '¿Por qué C2 no cuenta reportes entregados?', r: 'Porque contar reportes mide documentación, no el resultado para el cliente. C2 mide si el cliente obtuvo el ahorro mínimo que se le informó; el reporte se exige en P4.' },
  { quien: LUKAS, p: '¿Cómo fijan una meta sin datos?', r: 'No inventamos el resultado: proponemos una meta provisional con fundamento (por ejemplo, 80% en C2, del objetivo de marketing del plan) y declaramos qué dato la confirma, quién la fija y cuándo. Mientras tanto, el indicador se evalúa, pero su incumplimiento obliga a revisar la meta antes de decidir.' },
  { quien: LUKAS, p: '¿Por qué F1 tiene dos medidas?', r: 'Porque mezclar la evaluación de la inversión con el desempeño operando confunde decisiones distintas. Antes de invertir se decide con el VAN del Plan Financiero a la tasa exigida; operando, desde el año 3, se controla el retorno sobre el capital empleado frente a su costo.' },
  { quien: LUKAS, p: 'Defienda el indicador F2.', r: 'Margen de contribución por servicio: precio neto menos costo directo. Meta: positivo. Su primer dato es previo a operar: la cotización formal del kit debe quedar bajo $2.866.010 (Esencial) y $3.211.125 (Plus). Si la supera, no se invierte: se renegocia el kit o se revisa el precio. Responsable: Gerencia General.' },
  { quien: LUKAS, p: '¿Qué indican hoy los estados del tablero?', r: 'Tres indicadores en curso (A3, A4 y F1), dos no iniciados y en plazo (P1 y P6) y doce que no aplican todavía porque no hay operación. Ninguno vencido ni en incumplimiento. Que un indicador no aplique no es un incumplimiento.' },
  { quien: LUKAS, p: '¿Las matrices MEFE y MEFI deciden la postura ofensiva?', r: 'No. Un total bajo 2,5 justifica priorizar estrategias defensivas, pero un puntaje sobre 2,5 no autoriza invertir: sin norma, la MEFE del escenario llegaría a 2,54 y aun así no se podría vender. La ofensiva se decide con norma vigente, C2 cumplido, F2 positivo y VAN positivo (anexo A12).' },
];

// Términos técnicos que cada integrante debe dominar.
const TERMINOS = {
  [DIEGO]: [
    ['OVA', 'Objetivo (qué lograr y cuándo), ventaja (en qué diferenciarse) y alcance (dónde competir).'],
    ['Diferenciación enfocada', 'Competir por un atributo valorado, la evidencia de ahorro, en un segmento acotado (Porter, 1996).'],
    ['Proyecto experimental (D.S. N° 67)', 'Autorización para circular con un vehículo modificado, sin venderlo; sus resultados sirven de antecedente para una norma.'],
    ['Ejes estratégicos', 'Pilares que agrupan los objetivos según la brecha que cierran.'],
    ['Hito', 'Indicador que cumple con un documento en una fecha comprometida.'],
  ],
  [BENJA]: [
    ['Mapa estratégico', 'Kaplan y Norton (2008): objetivos en cuatro perspectivas unidos por relaciones causa-efecto.'],
    ['Relación habilitante, externa e hipótesis', 'Condición necesaria; condición que no depende de la empresa; efecto esperado que se comprueba con datos.'],
    ['Cadena causal', 'Secuencia de relaciones que explica cómo un objetivo de base produce un resultado.'],
    ['Indicador inductor', 'Mide una causa (proceso o capacidad) que anticipa el resultado.'],
    ['Indicador crítico', 'Se controla al 100% porque protege la seguridad o la promesa.'],
  ],
  [LUKAS]: [
    ['Indicador de resultado', 'Mide el efecto que nombra el objetivo, como el ahorro cumplido o la conversión.'],
    ['Meta provisional', 'Meta con fundamento que se confirma con un dato definido, en una fecha y por un responsable.'],
    ['Ficha del indicador', 'Fórmula, fuente, frecuencia, meta, responsable y acción ante la brecha.'],
    ['Reglas de estado', 'Cumple, alerta y no cumple según el tipo de indicador; no aplica todavía y sin información.'],
    ['VAN y retorno sobre el capital', 'F1 antes de invertir (VAN a la tasa exigida) y operando (retorno sobre el capital frente a su costo).'],
  ],
};

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;
const mmss = x => { const s = Math.round(x); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

module.exports = { PRINCIPAL, ANEXO, PREGUNTAS, TERMINOS, DIEGO, BENJA, LUKAS, palabras, segundos, mmss, PALABRAS_POR_MINUTO };

if (require.main === module) {
  const por = {}; let tot = 0;
  PRINCIPAL.forEach(x => { const n = palabras(x.texto); tot += n; por[x.quien] = (por[x.quien] || 0) + n; console.log(x.d.padEnd(11), String(n).padStart(4), mmss(segundos(x.texto))); });
  Object.entries(por).forEach(([k, n]) => console.log(k, n, mmss(n / PALABRAS_POR_MINUTO * 60)));
  console.log('TOTAL', tot, mmss(tot / PALABRAS_POR_MINUTO * 60));
}
