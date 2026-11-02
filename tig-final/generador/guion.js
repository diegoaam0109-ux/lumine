// Guion de la entrega final del TIG de Control de Gestión (ICMA901), versión posterior a la retroalimentación del Control 3.
// Una sola fuente para las notas del orador (deck.js), GUION.md (guion-md.js) y el Word con el banco de preguntas (guion-docx.js).
// 12 minutos a 130 palabras por minuto; hablan los tres (la nota es individual). Diego abre y cierra.
// Escenario base: E1 (el reglamento de la Ley N° 21.793 acepta conservar el motor). Sin datos simulados: Lumine es preoperativa.
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';
const PRINCIPAL = [
  { d: 'portada', quien: DIEGO, seccion: '1. Portada', titulo: 'Portada',
    texto: 'Buenos días, profesor. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y presentamos el informe final de nuestro trabajo: el sistema de control de gestión de Lumine Motors, una empresa que todavía no opera. Van a ver cómo una propuesta de valor se convierte en objetivos, indicadores y decisiones, sin inventar resultados.' },
  { d: 'contexto', quien: DIEGO, seccion: '3. Introducción', titulo: 'Usar el auto cuesta más y nadie lo cambia',
    texto: 'Partamos por el problema. En marzo, la bencina de noventa y tres en la Región Metropolitana subió de mil ciento sesenta y ocho a mil quinientos treinta y ocho pesos el litro. Y la gente conserva su auto: se transfieren tres coma cinco usados por cada nuevo. Quien trabaja con su auto paga cada vez más por kilómetro y no tiene el capital para cambiarlo. Ahí entra Lumine, con un kit de hibridación aditiva que se suma al auto que ya tiene.' },
  { d: 'arbol', quien: DIEGO, seccion: '4.1 Supuesto de partida', titulo: 'E1 es el escenario base',
    texto: 'Partimos de un supuesto explícito. La Ley veintiún mil setecientos noventa y tres autoriza talleres de transformación «y otras adaptaciones», pero no tiene reglamento. Dos preguntas ordenan el futuro: ¿el reglamento aceptará conservar el motor?, ¿mantendrá las exclusiones de autos con ABS o airbag? Salen cuatro escenarios. Tomamos E1, la vía amplia, como escenario base, porque la ley es posterior al borrador de dos mil veintiuno y amplía su objeto. No es un hecho: se mide en el objetivo P1 y tiene contingencia. Con ese supuesto, la pregunta pasa a ser por qué un conductor nos elegiría.' },
  { d: 'lienzo', quien: DIEGO, seccion: '4.2 Propuesta de valor', titulo: 'Cada frustración tiene su aliviador',
    texto: 'Para responderla usamos el lienzo de propuesta de valor de Osterwalder. El cliente es el conductor de uso intensivo. Sus frustraciones salieron de entrevistas exploratorias: la bencina sube, cambiar de auto exige un capital que no tiene, teme perder el seguro o la revisión técnica y no sabe cuánto ahorraría. Cada frustración tiene su aliviador, y el más fuerte es que el kit no reemplaza el auto. Además, la calibración hecha para su modelo crea una alegría de exclusividad. El veinte por ciento es una estimación de ingeniería.' },
  { d: 'canvas', quien: DIEGO, seccion: '4.2 Modelo de negocio (Anexo A del informe)', titulo: 'Taller propio primero, licencias después',
    texto: 'El lienzo alimenta el Canvas. La primera línea es el taller propio, que diagnostica, instala, calibra y mide. La segunda, desde el segundo año, licencia el método a otros talleres a cambio de los datos de cada instalación. El costo pesa en un kit importado que se paga en dólares.' },
  { d: 'identidad', quien: DIEGO, seccion: '5. Declaraciones estratégicas', titulo: 'Misión con alcance, visión con cifra y plazo',
    texto: 'La misión dice qué y dónde: reducir el combustible por kilómetro, en Chile y partiendo por la Región Metropolitana, sobre el auto que el cliente ya tiene. La visión pone cifra y plazo: hacia dos mil treinta y uno, dos mil setecientas quince instalaciones al año y cuarenta y dos talleres certificados. Los fines son rentar sobre el costo del capital y crecer con la red. Benjamín sigue con el diagnóstico.' },
  { d: 'entorno', quien: BENJA, seccion: '6.1 Entorno, oportunidades y amenazas', titulo: 'Hay oportunidades, pero hoy no las aprovechamos',
    texto: 'Gracias, Diego. El diagnóstico va de afuera hacia adentro. La matriz PEST da dos coma ochenta y dos sobre cinco: moderadamente desfavorable. Ayuda la tecnología, con baterías LFP a ochenta y un dólares el kilowatt hora; frena la economía, con un crecimiento bajo y un desempleo de nueve coma seis por ciento. El dólar pesa, pero es un riesgo cíclico que se cubre. Numeramos el FODA de afuera hacia adentro, siete oportunidades y nueve amenazas, y lo evaluamos con la matriz de factores externos de David. Da dos coma cero tres, bajo el promedio de dos coma cinco: las oportunidades existen, pero hoy Lumine no está en condiciones de aprovecharlas.' },
  { d: 'porter', quien: BENJA, seccion: '6.2 Cinco fuerzas', titulo: 'La inercia pasó de sustitutos a clientes',
    texto: 'En la industria corregimos la calificación de los sustitutos. Antes les poníamos cinco porque incluíamos no hacer nada, pero no hacer nada no es un producto: es inercia del cliente. La pasamos a la fuerza de los clientes. Los sustitutos quedan con lo que resuelve la misma necesidad: el gas, que solo admite autos de hasta siete años; el híbrido usado, desde nueve millones y medio, y el eléctrico nuevo, desde casi catorce. Sustitutos bajan a tres coma sesenta y siete, clientes suben a dos coma ochenta y tres, y la intensidad total queda en tres coma catorce: media.' },
  { d: 'interno', quien: BENJA, seccion: '6.3 Análisis interno y ventaja competitiva', titulo: 'La ventaja es un sistema que acumula conocimiento',
    texto: 'Hacia adentro aplicamos los cuatro criterios de Hitt: valioso, raro, costoso de imitar e insustituible. La ingeniería de integración no pasa, porque cualquiera con ingenieros la contrata. Lo que no se compra hecho es el conocimiento que el negocio acumula. De ahí salen dos competencias centrales: el conocimiento de calibración y medición, y el método Lumine Habilita. La ventaja es un sistema de actividades, como plantea Porter: cada auto instalado agrega una calibración y una medición, la medición mejora el estimador, lo aprendido entra a Habilita y la red devuelve sus datos. Un competidor puede comprar el kit; esa historia de datos, no. La matriz interna da dos coma treinta y dos.' },
  { d: 'cruces', quien: BENJA, seccion: '6.4 Cruces del FODA y postura', titulo: 'Hoy defensivos; ofensivos cuando se cumplan los hitos',
    texto: 'Con las dos matrices cruzamos el FODA: once estrategias numeradas, cada una amarrada a un objetivo del cuadro de mando. ¿Defensivos u ofensivos? Las dos matrices están bajo dos coma cinco, así que hoy somos defensivos: primero van las estrategias DO y DA, como preparar el expediente, medir el ahorro y cubrir el dólar. Cuando el reglamento resulte en E1 y el piloto mida el ahorro, las matrices suben a dos coma setenta y cinco y dos coma noventa y seis. Ahí se justifica la ofensiva en el nicho, con las estrategias FO.' },
  { d: 'estrategia', quien: BENJA, seccion: '7 y 8. Formulación y objetivos', titulo: 'Diferenciación enfocada: competir con evidencia',
    texto: 'La estrategia es la diferenciación enfocada. No podemos competir por costo: el kit es importado y el gas cuesta una fracción. Competimos con evidencia donde el ahorro vale más, en el alto kilometraje. Elegir es renunciar: no competimos por precio ni ofrecemos inmediatez. Tres ejes ordenan la estrategia, uno por brecha: habilitación formal, con la autorización y el primer par modelo-kit; acceso comercial, con la captación y el financiamiento, y conocimiento y escala, con la biblioteca, la medición y la red. Se traducen en diecisiete objetivos con verbo y resultado verificable. Lukas muestra cómo se conectan.' },
  { d: 'mapa', quien: LUKAS, seccion: '9. Cuadro de Mando Integral', titulo: 'Diecisiete objetivos y veinte relaciones',
    texto: 'Gracias, Benjamín. El mapa del cuadro de mando integral, de Kaplan y Norton, se lee de abajo hacia arriba: el aprendizaje habilita los procesos, los procesos producen la propuesta de valor, y de ahí salen la confianza, la captación y la rentabilidad sobre el costo de capital. Las veinte relaciones forman tres rutas: habilitación, evidencia y valor económico. Las líneas continuas son habilitantes, la gruesa es una condición externa, la vía legal, y las punteadas son hipótesis. Cada objetivo tiene indicador, meta, responsable e iniciativa, y cada iniciativa viene de un cruce del FODA: por ejemplo, la calibración para tu modelo, del cruce FO1, alimenta la captación. Así la estrategia queda medida, no solo escrita.' },
  { d: 'tablero', quien: LUKAS, seccion: '10.1 y 10.2 Línea base y solidez', titulo: 'El tablero está sin medir, no en rojo',
    texto: '¿Qué dice la información disponible? Doce indicadores están sin medir y cinco tienen la meta pendiente: ninguno cumple ni incumple, porque la empresa no opera. Pintarlo de rojo contradiría nuestro primer valor, la verificabilidad. Y doce de las veinte relaciones, el sesenta por ciento, son hipótesis. Por eso, al comienzo, el cuadro de mando comprueba hipótesis, y para cada una definimos con qué dato se prueba y qué decidimos si falla. Los objetivos se activan en cuatro etapas: preparación, piloto, taller propio y red de talleres. Cada etapa tiene una condición para pasar a la siguiente.' },
  { d: 'postura', quien: LUKAS, seccion: '10.3 Cuándo cambia la postura', titulo: 'El reglamento marca el paso a la ofensiva',
    texto: 'El hallazgo más importante es cuándo cambia la postura. De los cero coma setenta y dos puntos que sube la matriz externa, cero coma cuarenta y dos dependen del reglamento. Sin E1, aun con un piloto exitoso, llegaría a dos coma treinta y cuatro y seguiríamos defensivos. La matriz interna, en cambio, sube por hitos propios: el expediente, la medición y la primera calibración. La conclusión para la gestión es doble: la ofensiva la marca la publicación del reglamento, no el calendario, y mientras tanto el trabajo útil está en los hitos propios, que además preparan el expediente que el reglamento va a pedir.' },
  { d: 'umbral', quien: LUKAS, seccion: '10.5 Umbral y recuperación', titulo: 'Más de 16.000 litros para pagar el kit',
    texto: 'Para el cliente usamos cifras existentes. Con el precio de referencia del Plus y veinte por ciento de ahorro, el auto debe consumir más de dieciséis mil doscientos litros para pagar el kit. Por eso el foco es el alto kilometraje. Según el plan, se recupera en veintisiete a treinta y cuatro meses, dentro del ciclo de cuatro años de un conductor. Pero si el ahorro real fuera la mitad, el umbral se duplica: medir el ahorro es la información más valiosa del negocio.' },
  { d: 'recomendaciones', quien: LUKAS, seccion: '12. Recomendaciones', titulo: 'Cuatro acciones que parten sin esperar el reglamento',
    texto: 'Recomendamos cuatro acciones que pueden partir hoy: preparar el expediente técnico y aportar antecedentes al ministerio; aprobar el protocolo de medición y hacer el piloto con el modelo más frecuente; elaborar el Plan Financiero con una tasa sustentada, y firmar convenios con una aseguradora, una planta de revisión y una financiera. El informe agrega cuatro más: validar el precio y la cuota con la encuesta, cubrir el tipo de cambio, proteger las calibraciones dentro de la unidad de control y revisar cada mes el avance del reglamento. Mientras no operemos, el tablero se revisa mensualmente, centrado en los cuatro hitos. Diego cierra.' },
  { d: 'cierre', quien: DIEGO, seccion: '11. Conclusiones', titulo: '¿Qué falta? El primer auto del piloto',
    texto: 'Gracias, Lukas. Cerramos con tres ideas. Lumine responde a una necesidad documentada con un concepto simple: el mismo auto, ahora híbrido. La ventaja es un sistema que acumula conocimiento que nadie puede comprar hecho. Y en una empresa que no opera, el cuadro de mando ordena decisiones: qué cumplir antes de vender y cuándo pasar a la ofensiva. ¿Qué falta para que el tablero deje de estar sin medir? El primer auto del piloto. Muchas gracias.' },
];

// Anexo: no se expone. El índice enlaza a cada lámina y cada lámina vuelve al índice.
const ANEXO = [
  { codigo: 'A1', d: 'a-contingencia', titulo: '¿Qué pasa si el reglamento no resulta en E1?', apoyo: 'Señal temprana y respuesta para E2, E3 y E4; efecto de cada escenario en el CMI.' },
  { codigo: 'A2', d: 'a-mefe', titulo: 'MEFE completa: oportunidades y amenazas numeradas', apoyo: 'Peso = relevancia ÷ suma. Calificación 1 a 4, hoy y con hitos. Total 2,03 → 2,75.' },
  { codigo: 'A3', d: 'a-mefi', titulo: 'MEFI completa: fortalezas y debilidades numeradas', apoyo: 'Total 2,32 → 2,96. Pesan D1 (sin gestión iniciada) y D2 (ahorro sin medir).' },
  { codigo: 'A4', d: 'a-porter', titulo: '¿Cómo se recalificaron las cinco fuerzas?', apoyo: 'Factores de sustitutos y clientes con su justificación; C.a.6 inercia es nuevo.' },
  { codigo: 'A5', d: 'a-recursos', titulo: 'Los 17 recursos y capacidades con los criterios de Hitt', apoyo: '3 potencialmente sostenibles, 7 temporales y 7 de igualdad.' },
  { codigo: 'A6', d: 'a-cruces', titulo: 'Las 11 estrategias de los cruces del FODA', apoyo: 'Cada una con el objetivo del CMI que alimenta.' },
  { codigo: 'A7', d: 'a-cmi1', titulo: 'CMI completo: indicador, meta y responsable', parte: 'aprendizaje y procesos', apoyo: 'Metas propuestas por el equipo; responsables según la estructura del plan.' },
  { codigo: 'A7', d: 'a-cmi2', titulo: 'CMI completo', parte: 'clientes y financiera', apoyo: 'C3, C4, F2 y F3 con meta pendiente hasta tener el dato.' },
  { codigo: 'A8', d: 'a-relaciones', titulo: 'Las 20 relaciones causa-efecto y su plan de comprobación', apoyo: '6 habilitantes, 2 externas y 12 hipótesis, ordenadas por el momento en que habrá datos.' },
  { codigo: 'A9', d: 'a-fichas', titulo: '¿Cómo es la ficha de un indicador?', apoyo: 'Fichas de C2 (ahorro acreditado) y P2 (primer par modelo-kit).' },
  { codigo: 'A10', d: 'a-umbral', titulo: '¿Qué tan sensible es el umbral?', apoyo: 'Litros de umbral con 10%, 15% y 20% de ahorro, antes y después del alza; gasto mensual del cliente.' },
  { codigo: 'A11', d: 'a-evidencia', titulo: '¿Qué es dato, estimación o supuesto?', apoyo: 'Naturaleza de cada afirmación, entrevistas realizadas y la demo de Lumine Habilita.' },
];

// Banco de preguntas probables, con respuesta corta y quién la toma (el que expuso el tema).
const PREGUNTAS = [
  { quien: DIEGO, p: '¿Por qué toman E1 como escenario base y no un escenario prudente?', r: 'Porque la Ley N° 21.793 es posterior al borrador de 2021 y amplía su objeto a «otras adaptaciones», el reglamento sigue en elaboración y nuestra arquitectura conserva los sistemas de seguridad originales. Es un supuesto declarado, no un hecho: lo medimos en P1 y, si el reglamento se acerca a E3 o E4, activamos la contingencia (anexo A1).' },
  { quien: DIEGO, p: '¿De dónde sale el 20% de ahorro?', r: 'Es una estimación de ingeniería, no una medición en autos chilenos, y así lo rotulamos. Se mide en el piloto con el protocolo A3: línea base del mismo auto antes y después. Si el ahorro real fuera 10%, el umbral se duplica (anexo A10).' },
  { quien: DIEGO, p: '¿Cuántas entrevistas respaldan el lienzo?', r: 'Tres exploratorias de las fases anteriores y una a un conductor de aplicación con casi veinte años en el rubro; además, una entrevista a experto ya realizada y tres agendadas, y una encuesta en curso. Es un indicio, no una validación: por eso el lienzo se contrasta con la encuesta.' },
  { quien: DIEGO, p: '¿Por qué 2.715 instalaciones y 42 talleres en la visión?', r: 'Salen del pronóstico del plan del equipo, que limita el crecimiento por la capacidad del taller propio y suma la red desde el segundo año. Son metas del plan y se revisarán con el Plan Financiero.' },
  { quien: DIEGO, p: '¿Cuál es la diferencia entre misión y fines?', r: 'Francés (2006) separa lo que la empresa hace para el cliente (misión) de lo que espera obtener a cambio (fines): rentabilidad sobre el costo de capital y crecimiento mediante la red.' },
  { quien: BENJA, p: '¿Por qué movieron «no hacer nada» de sustitutos a clientes?', r: 'Un sustituto es otro producto que cumple la misma función (Porter, 2008). Seguir igual no es un producto: es inercia del comprador, y por eso es un factor de poder del cliente (C.a.6). Sustitutos bajó de 5,00 a 3,67, clientes subió de 2,64 a 2,83 y el total pasó de 3,49 a 3,14.' },
  { quien: BENJA, p: '¿Cómo se calcularon los pesos de la MEFE y la MEFI?', r: 'El peso es la relevancia de 1 a 7 que el equipo asignó en su FODA, dividida por la suma, de modo que los pesos suman 1. La calificación de 1 a 4 es una propuesta del equipo, por validar. Un total sobre 2,5 está sobre el promedio (David, 1997).' },
  { quien: BENJA, p: '¿Cómo puede ser ventaja una biblioteca que está vacía?', r: 'Por sí sola no lo sería todavía. La ventaja es el sistema de actividades (Porter, 1996): instalación, calibración, medición, estimador, Habilita y la red que devuelve datos. El estimador y Habilita ya existen como prototipo; la biblioteca parte con el primer auto del piloto y sus patrones se protegen en la unidad de control.' },
  { quien: BENJA, p: '¿Por qué la ingeniería no es una competencia central?', r: 'Porque no pasa el criterio de rareza de Hitt: cualquier empresa con ingenieros puede contratarla. Lo que no se compra hecho es el conocimiento acumulado de calibración y medición.' },
  { quien: BENJA, p: '¿Cuál es la diferencia entre la ventaja competitiva y la estrategia?', r: 'La estrategia es la elección: diferenciación enfocada en el alto kilometraje. La ventaja sostenible es lo que hace difícil copiarla: el sistema de conocimiento. No son lo mismo.' },
  { quien: BENJA, p: '¿Por qué no compiten por precio contra el gas?', r: 'El kit es importado y cuesta varias veces una conversión a gas. Además, el gas solo admite taxis y colectivos de hasta siete años; Lumine compite donde el gas no llega y con evidencia medida.' },
  { quien: LUKAS, p: '¿Cuándo pasan de defensivos a ofensivos?', r: 'Cuando la MEFE y la MEFI superen 2,5. Eso ocurre con el reglamento en E1 y el piloto con ahorro medido (2,75 y 2,96). Sin E1, la MEFE llegaría a 2,34: por eso la ofensiva la marca la publicación del reglamento, no el calendario.' },
  { quien: LUKAS, p: '¿Por qué tantos indicadores al 100%?', r: 'Siete son críticos para la seguridad o la promesa al cliente: un 95% significa que alguien recibió un auto sin verificar. Se controlan como reglas que se cumplen o no. Los cuatro hitos son condiciones previas a vender.' },
  { quien: LUKAS, p: '¿No queda incompleto un CMI con metas pendientes?', r: 'Fijar un número sin dato sería inventarlo. Las cinco metas pendientes dependen de clientes y precios que todavía no existen y se fijan con la primera muestra o con el Plan Financiero.' },
  { quien: LUKAS, p: '¿Por qué no presentan VAN ni TIR?', r: 'El Plan Financiero no existe todavía. F1 se mide en dos etapas: antes de invertir, VAN positivo y TIR sobre la tasa exigida; operando, retorno sobre el capital empleado frente a su costo.' },
  { quien: LUKAS, p: '¿Cómo van a medir el ahorro sin sesgo?', r: 'Con el protocolo A3: línea base del mismo vehículo, mismas rutas y condiciones, antes y después de instalar. La ficha de C2 exige método, límites y acuse del cliente; si no se pudo medir, se informa y nunca se entrega una cifra sin respaldo.' },
  { quien: LUKAS, p: '¿Qué pasa con el dólar?', r: 'Es un riesgo cíclico que se cubre: estrategia DA1, cobertura cambiaria y abastecimiento de largo plazo, medido en el margen por servicio (F2).' },
];

// Términos técnicos que cada integrante debe nombrar (el profesor pidió exponer «con los términos que están detrás»).
const TERMINOS = {
  [DIEGO]: [
    ['Hibridación aditiva', 'El kit se suma al tren motriz original: no lo reemplaza ni lo interviene.'],
    ['Escenario base (E1)', 'Supuesto declarado: el reglamento acepta conservar el motor y no excluye autos con sistemas de seguridad.'],
    ['Lienzo de propuesta de valor', 'Osterwalder et al. (2014): perfil del cliente (trabajos, frustraciones, alegrías) frente al mapa de valor (productos, aliviadores, creadores).'],
    ['Aliviador / creador de alegría', 'El aliviador responde a una frustración; el creador produce una alegría, como la calibración propia que se ofrece como exclusividad.'],
    ['Modelo Canvas', 'Osterwalder y Pigneur (2010): los nueve bloques del modelo de negocio.'],
    ['Misión, visión y fines', 'Kovacevic y Reynoso (2010) y Francés (2006): la misión dice qué y dónde; la visión, cuánto y hasta cuándo; los fines, qué pide la empresa a cambio.'],
  ],
  [BENJA]: [
    ['Matriz PEST', 'Entorno político, económico, sociocultural y tecnológico; escala 1 a 5 con 3 como neutro.'],
    ['MEFE y MEFI', 'Matrices de David (1997): peso por calificación de 1 a 4; un total sobre 2,5 está sobre el promedio.'],
    ['Producto sustituto', 'Otro producto que cumple la misma función (Porter, 2008). La inercia es poder del comprador, no un sustituto.'],
    ['Criterios de Hitt', 'Valioso, raro, costoso de imitar e insustituible: deciden si un recurso da ventaja sostenible.'],
    ['Sistema de actividades', 'Porter (1996): actividades que se refuerzan entre sí y que un competidor no puede copiar por separado.'],
    ['Cruces FO, DO, FA y DA', 'Estrategias que combinan factores internos y externos; la postura se decide por los totales de MEFE y MEFI.'],
    ['Diferenciación enfocada', 'Competir por un atributo valorado (evidencia medida) en un segmento acotado (alto kilometraje).'],
  ],
  [LUKAS]: [
    ['Cuadro de Mando Integral', 'Kaplan y Norton (2008): objetivos en cuatro perspectivas con indicador, meta, responsable e iniciativa.'],
    ['Relación causa-efecto', 'Habilitante, condición externa o hipótesis; las hipótesis se comprueban con datos.'],
    ['Línea base', 'El estado inicial de cada indicador: hoy, sin medir o con meta pendiente.'],
    ['Hito e indicador crítico', 'El hito cumple solo con el documento; el crítico solo al 100%.'],
    ['Umbral de recuperación', 'Litros de consumo para que el ahorro pague el kit: precio ÷ (ahorro × precio del litro).'],
    ['Costo de capital, VAN y TIR', 'F1 se mide en dos etapas: antes de invertir (VAN y TIR) y operando (retorno sobre el capital frente a su costo).'],
  ],
};

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;
const mmss = x => { const s = Math.round(x); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

module.exports = { PRINCIPAL, ANEXO, PREGUNTAS, TERMINOS, DIEGO, BENJA, LUKAS, palabras, segundos, mmss, PALABRAS_POR_MINUTO };
