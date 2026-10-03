// Guion de la exposición: una sola fuente para el documento del guion y las notas del orador.
// `d` = número del bloque de diapositiva en deck.js; el orden de este arreglo es el orden de la presentación.
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';

const PRINCIPAL = [
  { d: 1, quien: DIEGO, titulo: 'Portada', texto:
    'Buenos días. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y les vamos a presentar el análisis estratégico de Lumine Motors Chile SpA. ' +
    'Lumine es una empresa que todavía no opera: propone convertir autos a combustión en híbridos, sumándoles un motor eléctrico en el eje trasero. ' +
    'Yo parto con el contexto y el entorno, Benjamín sigue con el análisis externo e interno, y Lukas cierra con la síntesis y la estrategia.' },
  { d: 3, quien: DIEGO, titulo: 'Un kit que se suma, no reemplaza', texto:
    'Primero, qué hace Lumine. Como ven en el plano, el motor original queda intacto, con su tracción delantera. ' +
    'Lo que se suma es una unidad de control, un banco de baterías de litio-ferrofosfato y un motor eléctrico en el eje trasero, que asiste al partir y recupera energía al frenar. ' +
    'El cliente objetivo son autos de tracción delantera con alto kilometraje, sobre todo colectiveros y conductores de aplicación. ' +
    'La promesa es hasta 20% menos bencina en ciudad, pero es una estimación de ingeniería, no una medición en autos chilenos. ' +
    'Y algo clave para leer todo lo que viene: Lumine es preoperativa. No tiene taller, personal, clientes ni flujo de caja.' },
  { d: 4, quien: DIEGO, titulo: 'Cuatro instrumentos, un solo escenario', texto:
    'El análisis se apoya en cuatro instrumentos del curso. El de industria da 3,49: un sector moderadamente poco atractivo. ' +
    'El PEST da 2,82, bajo el neutro, con 20 amenazas contra 13 oportunidades. ' +
    'Competencias centrales encuentra solo 2 ventajas sostenibles entre 15 recursos y capacidades. ' +
    'Y la cadena de valor da 3,00 en habilidades, 1,29 puntos bajo el líder. ' +
    'Todo se evalúa en un solo escenario: la Ley 21.793 está publicada pero no tiene reglamento, y la única referencia es un borrador de 2021. ' +
    'Como todavía no hay estados financieros, el análisis de ratios no aplica.' },
  { d: 5, quien: DIEGO, titulo: 'Sin ventaja competitiva efectiva, todavía', texto:
    'Con el escáner de Kovacevic y Reynoso, la primera conclusión es dura: Lumine no tiene hoy ninguna ventaja competitiva efectiva. ' +
    'Las tendencias sí juegan a favor: el parque se conserva, con 3,5 autos usados transferidos por cada nuevo; la bencina 93 subió de 1.149 a 1.541 pesos el litro, y las baterías LFP están en 81 dólares por kWh. ' +
    'En contra están la economía débil y el dólar cerca de 970 pesos, que encarece un kit que es todo importado. ' +
    'La única competencia central es saber calibrar el kit para cada marca y modelo. Pero esa biblioteca de calibraciones hoy está vacía, así que la ventaja es potencial, no real.' },
  { d: 8, quien: DIEGO, titulo: 'El valor es el combustible evitado', texto:
    '¿Por qué alguien compraría esto? Porque el cliente decide por margen, no por sostenibilidad. El valor es el combustible que deja de comprar. ' +
    'Un conductor que hace entre 150 y 250 kilómetros al día gasta entre 522 mil y 870 mil pesos al mes; con hasta 20% de ahorro, son entre 104 mil y 174 mil pesos mensuales. Es un techo, no una medición. ' +
    'Por eso el precio tiene que quedar muy por debajo de los 7 millones de un híbrido usado y cobrarse en cuotas. ' +
    'Las entrevistas agregan algo: el precio decide si compra, pero la confianza decide si se atreve. Piden certificación, garantía y saber quién responde si algo falla. ' +
    'Con esto le paso la palabra a Benjamín.' },

  { d: 11, quien: BENJA, titulo: '20 amenazas contra 13 oportunidades', texto:
    'Gracias, Diego. En el análisis externo, el PEST muestra un entorno desfavorable: 20 amenazas contra 13 oportunidades y un puntaje global de 2,82, bajo el neutro de 3. ' +
    'Lo económico es lo más débil, con 2,38: bajo ingreso disponible, dólar alto y una tasa de política monetaria de 4,5% que encarece las cuotas. ' +
    'Lo tecnológico es lo único sobre 3, porque estudios internacionales como los del ICCT documentan el ahorro y los componentes están estandarizados. ' +
    'La matriz de impacto e incertidumbre deja cinco factores críticos: el reglamento, las aseguradoras y plantas de revisión técnica, el precio de la bencina, el tipo de cambio y el ahorro real.' },
  { d: 13, quien: BENJA, titulo: 'La vía legal depende de la autoridad', texto:
    'El más crítico es el reglamento, por eso armamos este árbol. La primera pregunta es si la transformación puede conservar el motor. ' +
    'Si la respuesta es sí, queda la duda de si se excluyen los autos con ABS o airbag: sin exclusión hay una vía amplia, E1, donde la barrera protege al primero que homologa; con exclusión, la vía se acota, E2. ' +
    'Pero el borrador de 2021 apunta a la rama del no, en celeste, que lleva a una vía alternativa por alteración de características, E3, o a no tener vía legal, E4. ' +
    'Ninguna decisión comercial cambia de rama: eso lo decide la respuesta escrita de la autoridad.' },
  { d: 14, quien: BENJA, titulo: 'La fuerza dominante: no hacer nada', texto:
    'Las cinco fuerzas de Porter dan un promedio ponderado de 3,49. La fuerza dominante son los sustitutos, con 5 de 5: el principal competidor de Lumine no es otro taller, es no hacer nada, que cuesta cero pesos. ' +
    'Le siguen los nuevos entrantes, con 3,75, porque una vez abierta la vía cualquiera con presupuesto puede homologar. La rivalidad y los proveedores juegan a favor. ' +
    'Sustitutos y clientes suman 55% del peso y tienen la misma causa: el cliente puede quedarse con su auto. ' +
    'Como esa causa es la falta de liquidez, el financiamiento en cuotas ataca el problema de raíz.' },
  { d: 15, quien: BENJA, titulo: 'Fortaleza de diseño, no de ejecución', texto:
    'Pasando al análisis interno, la fortaleza de Lumine es de diseño, no de ejecución. ' +
    'De los seis factores críticos de éxito, solo dos llegan a fortaleza leve: la integración y calibración, y la estandarización del taller. Ninguno se ha probado en un auto real. ' +
    'Lo preocupante son los marcados en amarillo: la gestión regulatoria y el financiamiento son condiciones de entrada y están entre los más débiles, sin interlocución con la autoridad y sin convenio financiero. ' +
    'Además, el talento en alta tensión es escaso y no hay un esquema para retenerlo.' },
  { d: 17, quien: BENJA, titulo: 'Una sola competencia central', texto:
    'Con los criterios de Hitt evaluamos 15 recursos y capacidades. Solo dos cumplen los cuatro: la biblioteca de calibraciones y la ingeniería de integración. En el fondo son la misma competencia: saber calibrar el kit para cada modelo. ' +
    'Seis dan ventaja temporal, como la homologación, la autorización del taller o los técnicos con licencia SEC, porque un competidor puede conseguirlas con tiempo y presupuesto. Las otras siete son igualdad competitiva. ' +
    'La advertencia es que la ventaja sostenible depende de proteger la biblioteca como secreto empresarial. Lukas sigue con la síntesis.' },

  { d: 18, quien: LUKAS, titulo: 'El costo y la exclusividad no coinciden', texto:
    'Gracias, Benjamín. En la cadena de valor, el costo y la exclusividad no coinciden. ' +
    'El costo se acumula en la logística de entrada: el kit es importado, las baterías viajan como mercancía peligrosa y todo está en dólares. ' +
    'La exclusividad nace en el desarrollo tecnológico, que es la calibración, y se entrega en operaciones. ' +
    'Operaciones es además el cuello de botella: ahí se juntan la homologación por modelo, los plazos de importación y la falta de técnicos. ' +
    'Y la infraestructura es condición de entrada: sin autorización del taller, nada opera.' },
  { d: 20, quien: LUKAS, titulo: 'Fortalezas en procesos; amenazas en clientes', texto:
    'Ordenamos el FODA según las cuatro perspectivas del cuadro de mando integral, y el resultado es claro. ' +
    'Las fortalezas están en procesos internos: la arquitectura en el eje trasero y un proceso de cinco etapas bien diseñado. ' +
    'Pero las amenazas que deciden el negocio caen en clientes: bajo ingreso disponible, desempleo de 9,5% y la opción de no hacer nada a costo cero. ' +
    'Es decir, sabemos qué hacer técnicamente; el riesgo está en que el cliente pueda y quiera pagarlo.' },
  { d: 21, quien: LUKAS, titulo: 'Del FODA a las acciones', texto:
    'De ese FODA salen cuatro cruces. FO: homologar primero los modelos más comunes en el segmento priorizado, porque nadie ofrece hoy hibridación certificada. ' +
    'DO: plantear al Ministerio de Transportes, mientras escribe el reglamento, el precedente de la conversión a gas. ' +
    'FA: frente al híbrido usado y a no hacer nada, vender la cuota mensual contra el ahorro mensual. ' +
    'Y DA: cerrar convenios con aseguradoras, plantas de revisión técnica y una institución financiera antes de vender el primer kit. ' +
    'Los instrumentos agregan un quinto cruce: cubrir el riesgo cambiario.' },
  { d: 23, quien: LUKAS, titulo: 'Diferenciación enfocada', texto:
    'Con todo esto, la estrategia de Lumine es diferenciación enfocada: un servicio certificado que reduce el combustible del auto que el cliente ya tiene, para conductores de alto kilometraje. ' +
    'El objetivo es ser hacia 2031 el taller de referencia en hibridación. La ventaja es ser la única alternativa que reduce el consumo sin cambiar el auto, sin límite de antigüedad y con certificación. ' +
    'Las renuncias son claras: no competir en precio con el gas, no atender a quien maneja poco y no ofrecer inmediatez. ' +
    'Dos observaciones críticas: el objetivo no tiene una meta medible y la ventaja sigue siendo potencial.' },
  { d: 24, quien: LUKAS, titulo: 'Tres ejes, ocho objetivos', texto:
    'Los ocho objetivos se agrupan en tres ejes. Habilitación formal: la autorización del taller, las homologaciones y el reconocimiento de aseguradoras y plantas. ' +
    'Acceso comercial: consolidar el segmento y ofrecer financiamiento. Y conocimiento y escala: demostrar el ahorro real, retener a los técnicos y ampliar la capacidad. ' +
    'Cada eje se mide en perspectivas concretas del cuadro de mando. ' +
    'Pero encontramos una brecha: ningún eje aborda el riesgo cambiario, que el PEST marca como gran amenaza. Proponemos sumarlo al eje de acceso comercial o al plan financiero.' },
  { d: 25, quien: LUKAS, titulo: 'Cierre', texto:
    'Para cerrar: la prioridad de Lumine no es competir con otros talleres, es lograr que el ahorro supere al precio frente a la opción de no hacer nada. ' +
    'Para eso tiene que resolver cinco problemas: la vía legal, el reconocimiento de aseguradoras y plantas, la capacidad de pago del cliente, la medición del ahorro y el riesgo cambiario. ' +
    'Muchas gracias. Quedamos atentos a sus preguntas.' },
];

// Diapositivas de apoyo: no se exponen; se muestran solo si una pregunta las pide.
const ANEXO = [
  { d: 7, codigo: 'A1', titulo: 'Atributos que valora el cliente' },
  { d: 6, codigo: 'A2', titulo: 'Tres dogmas de la industria' },
  { d: 9, codigo: 'A3', titulo: 'Redes de valor' },
  { d: 10, codigo: 'A4', titulo: 'Discontinuidades del entorno' },
  { d: 12, codigo: 'A5', titulo: 'Matriz impacto-incertidumbre' },
  { d: 16, codigo: 'A6', titulo: '7S de McKinsey' },
  { d: 19, codigo: 'A7', titulo: 'Ranking frente a competidores' },
  { d: 22, codigo: 'A8', titulo: 'Cinco problemas clave' },
];

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;

module.exports = { PRINCIPAL, ANEXO, DIEGO, BENJA, LUKAS, palabras, segundos, PALABRAS_POR_MINUTO };
