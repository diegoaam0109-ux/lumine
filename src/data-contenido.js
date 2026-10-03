/* =====================================================================
   Lumine Habilita · contenido de los módulos online
   Contenido general de formación (no procedimientos propios del kit).
   Es la base editable: Ajustes › Contenido guarda ajustes del Responsable
   Técnico en config/contenido sin tocar este archivo.
   ===================================================================== */
'use strict';

/* Cada módulo: cápsulas (lo que se aprende), simulador o escenarios cuando aplica, y un banco de
   preguntas por caso. 'mostrar' = cuántas preguntas toma cada intento: se eligen al azar del banco
   y las alternativas se mezclan, así la posición de la respuesta no enseña nada.
   N1-1 y NIV-E vienen de la Fase 3. El resto es contenido base general, para revisar con la parte
   externa de seguridad (D5) y con Ingeniería de Calibración donde corresponde. */
const CONTENIDO = {
  'N1-1': {
    capsulas: [
      {t:'Tres riesgos que no avisan', c:'C01', puntos:[
        'Choque eléctrico: la corriente pasa por el cuerpo. En alta tensión basta un contacto para una lesión grave.',
        'Arco eléctrico: una descarga a través del aire que quema y proyecta metal fundido, incluso sin tocar el conductor.',
        'Incendio de batería: una celda dañada puede calentarse sola y volver a encenderse horas después.',
        'Los tres se previenen igual: sin energía, con el equipo correcto y con alguien vigilando.']},
      {t:'Las cinco reglas de oro', c:'C02', puntos:[
        'Cortar: separar todas las fuentes de energía.',
        'Bloquear y etiquetar: que nadie pueda volver a conectar mientras se trabaja.',
        'Verificar ausencia de tensión: con instrumento, nunca a ojo.',
        'Poner a tierra: cuando el procedimiento lo exige.',
        'Señalizar: delimitar la zona para que nadie entre sin saber.']},
      {t:'Verificar con instrumento', c:'C02', puntos:[
        'Antes de medir, prueba el instrumento en una fuente con tensión conocida.',
        'Mide en todos los puntos que indique el procedimiento.',
        'Después de medir, vuelve a probar el instrumento. Si no marca, la medición no vale.']},
      {t:'El encargado de seguridad', c:'C05', puntos:[
        'Es la segunda persona del duo: vigila, corta la energía y detiene el trabajo si algo no calza.',
        'La guía alemana DGUV 209-093 exige que tenga instrucción en alta tensión y primeros auxilios.',
        'Detener el trabajo es su derecho y su deber. Nadie discute una detención en el momento: se conversa después.']},
      {t:'Equipo dieléctrico y procedimiento', c:'C03', oficio:true, puntos:[
        'Guantes dieléctricos revisados antes de cada uso: sin cortes, sin desgaste, sin humedad.',
        'Herramientas aisladas para toda la zona de alta tensión.',
        'Un procedimiento escrito se sigue paso a paso, sin saltar ni reordenar pasos.']}
    ],
    reglas: ['Cortar','Bloquear y etiquetar','Verificar ausencia de tensión','Poner a tierra','Señalizar'],
    escenarios: [
      {q:'Tu compañero desconectó la energía y va a soltar un conector de alta tensión. Todavía nadie verificó ausencia de tensión.', a:'detener', x:'Sin verificación con instrumento no se toca nada. El encargado detiene y pide verificar.'},
      {q:'La zona está señalizada, la energía cortada y bloqueada, y la ausencia de tensión se verificó con el instrumento probado antes y después.', a:'seguir', x:'Se cumplieron las reglas de oro: se puede trabajar, con vigilancia.'},
      {q:'Aparece olor a quemado cerca del banco de baterías mientras el duo termina de ordenar herramientas.', a:'detener', x:'Cualquier señal de calentamiento detiene el trabajo y activa el procedimiento de emergencia.'}
    ],
    practica: [
      {c:'C01', q:'¿Cuál de estos riesgos puede lesionar a alguien aunque no toque el conductor?', o:['El arco eléctrico','La caída de tensión en la batería de 12 V','La humedad del piso','El ruido del compresor'], a:0, x:'El arco se produce a través del aire y proyecta calor y metal fundido.'},
      {c:'C02', q:'Cortaste la energía y bloqueaste el interruptor. ¿Qué viene antes de tocar un conductor?', o:['Poner a tierra y señalizar','Verificar ausencia de tensión con instrumento','Pedir al compañero que mire el tablero','Nada, ya está desconectado'], a:1, x:'Después de cortar y bloquear, se verifica con instrumento. Sin eso no hay certeza.'},
      {c:'C02', q:'Al terminar de medir, el instrumento no marca en la fuente de prueba. ¿Qué significa?', o:['Que la medición anterior no vale y hay que repetir con otro instrumento','Que no hay tensión en el auto','Que la batería del auto está descargada','Nada importante'], a:0, x:'Si el instrumento falla la prueba final, no se puede confiar en lo que midió.'},
      {c:'C05', q:'Como encargado de seguridad ves a tu compañero con un guante roto cerca de la zona de alta tensión. ¿Qué haces?', o:['Le avisas al terminar la tarea','Detienes el trabajo en el momento','Le prestas el tuyo y siguen','Lo anotas en el informe'], a:1, x:'El encargado detiene el trabajo apenas ve un riesgo. Se conversa después.'},
      {c:'C03', q:'Antes de usar los guantes dieléctricos, ¿qué corresponde?', o:['Revisarlos por cortes, desgaste y humedad','Nada si están guardados en su caja','Lavarlos con agua','Usarlos solo si llueve'], a:0, x:'Se revisan antes de cada uso. Un daño pequeño basta para que no aíslen.'},
      {c:'C04', q:'El procedimiento escrito dice desconectar el servicio de mantención antes de soltar la batería, pero tu compañero propone hacerlo al revés porque "es más rápido". ¿Qué haces?', o:['Lo hacen como propone si los dos están de acuerdo','Se sigue el procedimiento en el orden escrito','Se salta ese paso si la batería está fría','Se consulta después de terminar'], a:1, x:'Un procedimiento seguro se sigue paso a paso, sin saltar ni reordenar. Si un paso parece mal, se detiene y se consulta antes.'},
      {c:'C01', q:'Un banco de baterías golpeado no muestra humo ni olor. ¿Qué riesgo sigue presente?', o:['Ninguno si no hay humo','Solo el de ensuciarse con electrolito','Que una celda dañada se caliente sola y se encienda horas después','Que se descargue la batería de 12 V'], a:2, x:'El incendio de batería puede aparecer con retraso. Una batería golpeada se aísla y se vigila aunque se vea normal.'},
      {c:'C05', q:'¿Quién puede ser encargado de seguridad del duo durante un trabajo en alta tensión?', o:['Cualquier persona que esté cerca','Solo el Responsable Técnico','Quien ejecuta el trabajo, mientras trabaja','El segundo integrante, con instrucción en alta tensión y primeros auxilios'], a:3, x:'Es la segunda persona del duo: vigila, corta la energía y detiene. No puede ser quien tiene las manos en el trabajo.'},
      {c:'C02', q:'¿Por qué se bloquea y etiqueta el punto de corte?', o:['Para que nadie vuelva a conectar mientras se trabaja','Para que el auto quede más ordenado','Porque lo pide el seguro del taller','Para saber cuánto duró el trabajo'], a:0, x:'Bloquear y etiquetar impide que otra persona reconecte la energía sin saber que hay alguien trabajando.'}
    ],
    mostrar: 5
  },
  'NIV-E': {
    capsulas: [
      {t:'Ley de Ohm', puntos:['V = I × R: tensión igual a corriente por resistencia.','Con dos de los tres valores se calcula el tercero.','Más resistencia con la misma tensión significa menos corriente.']},
      {t:'Multímetro', puntos:['Tensión: en paralelo con lo que se mide.','Corriente: en serie, en la entrada de corriente.','Resistencia: siempre sin energía en el circuito.']},
      {t:'Diagramas', puntos:['En serie, la corriente es la misma y la tensión se reparte.','En paralelo, la tensión es la misma y la corriente se reparte.']}
    ],
    mostrar: 4,
    practica: [
      {c:null, q:'Un consumo de 3 Ω conectado a 12 V. ¿Cuánta corriente circula?', o:['4 A','36 A','0,25 A','15 A'], a:0, x:'I = V / R = 12 / 3 = 4 A.'},
      {c:null, q:'¿Cómo se mide una resistencia con multímetro?', o:['Con el circuito sin energía','Con el circuito encendido','En serie con la batería','No se puede medir'], a:0, x:'La resistencia se mide sin energía; con tensión la lectura es falsa y el instrumento se puede dañar.'},
      {c:null, q:'Dos resistencias de 6 Ω en paralelo. ¿Cuál es la resistencia equivalente?', o:['12 Ω','6 Ω','3 Ω','36 Ω'], a:2, x:'Dos resistencias iguales en paralelo equivalen a la mitad: 6 / 2 = 3 Ω.'},
      {c:null, q:'Para medir la corriente que consume una ampolleta, ¿cómo se conecta el multímetro?', o:['En paralelo con la ampolleta','En serie con la ampolleta, en la entrada de corriente','Entre el positivo y la carrocería','No importa cómo se conecte'], a:1, x:'La corriente se mide en serie: toda la corriente del circuito debe pasar por el instrumento.'},
      {c:null, q:'Mides 12,6 V en bornes de la batería y 9 V en la entrada de un consumo con el circuito funcionando. ¿Qué indica?', o:['Que el consumo está apagado','Que el multímetro está malo','Que la batería está sobrecargada','Una caída de tensión en el cableado o en una conexión'], a:3, x:'La diferencia de tensión con carga indica resistencia en el camino: un cable delgado, una conexión sulfatada o un contacto flojo.'},
      {c:null, q:'En un circuito en serie con dos consumos, ¿qué ocurre si uno se corta?', o:['Se apagan los dos','El otro funciona con más fuerza','No pasa nada','El otro funciona igual'], a:0, x:'En serie hay un solo camino para la corriente: si se abre en un punto, deja de circular por todo el circuito.'}
    ]
  }
  ,
  'NIV-M': {
    capsulas: [
      {t:'Torque: la fuerza justa', puntos:['El fabricante fija el torque de cada unión. Ni más ni menos.','Se aprieta con torquímetro en buen estado, nunca "a ojo" ni con llave de impacto.','Las ruedas y las tapas se aprietan en cruz y en dos pasadas para asentar parejo.','Un perno de seguridad que se soltó o se pasó de torque se reemplaza si el fabricante lo indica.']},
      {t:'Frenos', puntos:['Pastillas y discos tienen un espesor mínimo marcado por el fabricante: bajo ese valor se cambian.','Un disco con surcos profundos o alabeado produce vibración al frenar.','El líquido de frenos absorbe humedad con el tiempo y pierde eficacia: se revisa nivel y estado.','Después de intervenir frenos se prueba el pedal antes de mover el auto.']},
      {t:'Suspensión y levante', puntos:['El auto se levanta solo por los puntos de levante del fabricante.','Nunca se trabaja bajo un auto sostenido solo por la gata: se usan torres o elevador con traba.','Bujes rotos, rótulas con juego o amortiguadores con fuga se registran antes de instalar.']}
    ],
    practica: [
      {c:null, q:'Necesitas apretar los pernos de una rueda. ¿Cuál es la forma correcta?', o:['Con llave de impacto al máximo','En cruz, en dos pasadas, con torquímetro al valor del fabricante','En círculo, uno tras otro, hasta que no giren más','Con la llave de rueda y el pie'], a:1, x:'En cruz y por etapas se asienta la llanta pareja; el torquímetro asegura el valor indicado.'},
      {c:null, q:'Mides un disco de freno y está bajo el espesor mínimo grabado. ¿Qué corresponde?', o:['Rectificarlo para que quede liso','Usarlo hasta que haga ruido','Reemplazarlo','Cambiar solo las pastillas'], a:2, x:'Bajo el mínimo el disco no disipa bien el calor y puede fallar. Rectificarlo lo deja aún más delgado.'},
      {c:null, q:'El auto está en la gata hidráulica y necesitas revisar el eje trasero por debajo. ¿Qué haces primero?', o:['Entras rápido, es solo una mirada','Le pides a alguien que sujete la gata','Subes un poco más la gata','Pones torres de apoyo en los puntos indicados'], a:3, x:'La gata sirve para levantar, no para sostener. Sin torres o elevador trabado no se pone el cuerpo bajo el auto.'},
      {c:null, q:'Al revisar la suspensión trasera encuentras una rótula con juego. ¿Qué haces con ese hallazgo?', o:['Lo registras: puede impedir la instalación hasta repararse','Lo ignoras porque el kit va en el eje','Lo apuntas solo si el cliente pregunta','Aprietas la rótula y sigues'], a:0, x:'Lo que afecta al eje trasero, frenos o suspensión se registra en el diagnóstico: puede bloquear la instalación.'},
      {c:null, q:'¿Por qué no se usa llave de impacto para el apriete final de un perno de suspensión?', o:['Porque hace mucho ruido','Porque no controla el torque y puede dejarlo fuera de especificación','Porque gasta el aire del compresor','Porque está prohibido usarla en talleres'], a:1, x:'La llave de impacto sirve para soltar o aproximar. El valor final se da con torquímetro.'}
    ],
    mostrar: 4
  },
  'NIV-X': {
    capsulas: [
      {t:'Sensores', puntos:['Un sensor convierte algo físico (temperatura, velocidad, posición) en una señal eléctrica.','Resistivos: cambian su resistencia, como el de temperatura del refrigerante.','Inductivos y de efecto Hall: generan pulsos, como los de velocidad de rueda.','Antes de culpar al sensor se revisa su cableado y su conector.']},
      {t:'Redes del auto', puntos:['Los módulos del auto se comunican por redes, la más común es CAN, con dos cables trenzados: CAN alto y CAN bajo.','La red lleva una resistencia de terminación en cada extremo.','Con la batería desconectada, entre CAN alto y CAN bajo se suelen medir cerca de 60 Ω (dos resistencias de 120 Ω en paralelo).','Un código que empieza con U indica un problema de comunicación.']},
      {t:'OBD', puntos:['El conector OBD está bajo el tablero, cerca del volante.','Los códigos empiezan con P (tren motriz), B (carrocería), C (chasis) o U (red).','Los datos en vivo muestran lo que leen los sensores en este momento.','La imagen congelada guarda las condiciones del auto cuando apareció la falla.']}
    ],
    practica: [
      {c:null, q:'Un código empieza con la letra C. ¿A qué sistema corresponde?', o:['Al chasis, como frenos o dirección','A la carrocería','A la red de comunicación','Al tren motriz'], a:0, x:'C es chasis. P tren motriz, B carrocería, U red.'},
      {c:null, q:'Con la batería desconectada mides 120 Ω entre CAN alto y CAN bajo, cuando lo normal serían cerca de 60 Ω. ¿Qué sugiere?', o:['Que la red está perfecta','Que falta una de las dos resistencias de terminación o hay un corte','Que hay un cortocircuito entre los dos cables','Que el multímetro mide mal en ohmios'], a:1, x:'Dos resistencias de 120 Ω en paralelo dan 60 Ω. Medir 120 Ω indica que solo queda una conectada.'},
      {c:null, q:'El sensor de velocidad de una rueda marca cero en datos en vivo mientras el auto avanza. ¿Qué revisas antes de cambiarlo?', o:['El nivel de aceite','La presión de los neumáticos','El cableado y el conector del sensor','La batería del control remoto'], a:2, x:'Muchas fallas de sensor son de cableado o conector. Se revisan antes de cambiar la pieza.'},
      {c:null, q:'¿Para qué sirve la imagen congelada de un código de falla?', o:['Para borrar el código','Para ver una foto del motor','Para saber el kilometraje del próximo servicio','Para ver las condiciones del auto cuando apareció la falla'], a:3, x:'Muestra velocidad, temperatura y otras lecturas en el momento de la falla: ayuda a reproducirla.'},
      {c:null, q:'¿Qué tipo de señal entrega normalmente un sensor de efecto Hall de velocidad?', o:['Pulsos que se hacen más frecuentes con la velocidad','Una tensión fija de 12 V','Una señal de radio','Ninguna, solo enciende una luz'], a:0, x:'Entrega pulsos; la frecuencia aumenta con la velocidad de giro.'}
    ],
    mostrar: 4
  },
  'N1-2': {
    capsulas: [
      {t:'Incendio de batería', c:'C35', puntos:['Una batería de litio en llamas puede liberar gases tóxicos e inflamables y reencenderse aunque parezca apagada.','Primero las personas: evacuar la zona, cortar la energía si es seguro y llamar a Bomberos (132).','No acercarse con un extintor pequeño a una batería de tracción: se informa y se espera a Bomberos.','Una batería que se calentó o se golpeó queda aislada en un lugar abierto y vigilada por horas, aunque se vea normal.']},
      {t:'Contacto eléctrico', c:'C35', puntos:['Nunca se toca a una persona que sigue en contacto con la energía.','Primero se corta la energía. Si no se puede, se la separa con un elemento aislante seco, como una pértiga de rescate.','Se llama al SAMU (131) aunque la persona diga sentirse bien: la corriente puede dañar el corazón y órganos internos sin marcas visibles.','El encargado de seguridad es quien corta y quien rescata: por eso vigila sin tener las manos en el trabajo.']},
      {t:'Primeros auxilios y RCP', c:'C35', puntos:['Si la persona no responde y no respira normal: pedir ayuda, llamar al 131 y pedir un desfibrilador (DEA).','Compresiones en el centro del pecho, fuertes y rápidas: 100 a 120 por minuto, unos 5 cm de profundidad en un adulto.','Se sigue hasta que llegue ayuda o el DEA indique otra cosa. El DEA guía con su voz.','La práctica de RCP es presencial: aquí se repasa, en la validación se demuestra.']}
    ],
    escenarios: [
      {q:'Tu compañero quedó rígido tocando un conector de alta tensión. La energía sigue conectada y tienes la pértiga a mano.', a:'detener', x:'No se le toca con las manos. Se corta la energía o se le separa con la pértiga, y recién entonces se atiende.'},
      {q:'Después de un golpe al bajar el banco de baterías no se ve humo. El jefe de turno sugiere dejarlo en la bodega cerrada y seguir mañana.', a:'detener', x:'Una batería golpeada puede encenderse horas después. Se aísla en un lugar abierto y se vigila.'},
      {q:'La energía está cortada y bloqueada, el compañero que sufrió una descarga leve está consciente y ya se llamó al 131. Le acompañas mientras llega la ambulancia.', a:'seguir', x:'Correcto: se mantiene la vigilancia y se espera la evaluación médica aunque la persona diga que está bien.'}
    ],
    practica: [
      {c:'C35', q:'Encuentras a un compañero tendido junto al auto con un cable de alta tensión en la mano. ¿Qué haces primero?', o:['Lo tomas del brazo para alejarlo','Le echas agua para enfriarlo','Cortas la energía o lo separas con un elemento aislante','Empiezas la RCP de inmediato'], a:2, x:'Si sigue en contacto, tocarlo te pone en el mismo circuito. Primero cortar o separar con algo aislante.'},
      {c:'C35', q:'Un banco de baterías empieza a humear dentro del taller. ¿Qué corresponde?', o:['Evacuar, cortar la energía si es seguro y llamar a Bomberos (132)','Abrir la tapa para ver qué celda es','Taparlo con una manta y seguir trabajando','Moverlo con el elevador hacia la calle'], a:0, x:'Primero las personas. Los gases son tóxicos y el fuego puede crecer rápido.'},
      {c:'C35', q:'¿A qué ritmo se hacen las compresiones de RCP en un adulto?', o:['Unas 30 por minuto','Unas 60 por minuto','Lo más rápido posible, sin ritmo','Entre 100 y 120 por minuto'], a:3, x:'Entre 100 y 120 por minuto y unos 5 cm de profundidad, dejando que el pecho vuelva.'},
      {c:'C35', q:'Un compañero recibió una descarga, está consciente y dice que se siente bien. ¿Qué haces?', o:['Le das agua y sigue trabajando','Llamas al 131 para que lo evalúen igual','Esperas a ver si mañana se siente mal','Le pides que se vaya a su casa'], a:1, x:'La corriente puede dañar el corazón sin síntomas inmediatos. Siempre evaluación médica.'},
      {c:'C35', q:'Una batería se golpeó pero se ve normal. ¿Dónde la dejas?', o:['En la bodega con las demás','Dentro del auto','En un lugar abierto, aislada y vigilada','En la oficina para que nadie la toque'], a:2, x:'Puede encenderse con retraso. Lejos de otras cosas que puedan arder y con vigilancia.'}
    ],
    mostrar: 4
  },
  'N1-3': {
    capsulas: [
      {t:'Qué sistemas trae el auto', c:'C06', puntos:['ABS: evita que las ruedas se bloqueen al frenar. Sus sensores van en cada rueda, también en el eje trasero donde se instala el kit.','Control de estabilidad: frena ruedas por separado para corregir un derrape.','Airbags y pretensores: se activan con una carga pirotécnica en un choque.','Se registran al recibir el auto: qué sistemas trae y si tienen fallas previas.']},
      {t:'Trabajar cerca de un airbag', c:'C06', puntos:['Antes de intervenir cerca de airbags o pretensores se desconecta la batería de 12 V y se espera el tiempo que indique el fabricante: el módulo guarda energía.','Nunca se mide con multímetro el circuito de un airbag: la corriente del instrumento puede activarlo.','Un airbag suelto se guarda con la cara que se infla hacia arriba, lejos del calor y sin golpes.']},
      {t:'El kit no reemplaza a los frenos', c:'C06', puntos:['El freno, el ABS y el control de estabilidad originales siempre mandan sobre el kit.','Si al desmontar el tren trasero se mueve un sensor de ABS, se reinstala en su posición y se verifica en datos en vivo.','Cualquier testigo de ABS o airbag encendido después del trabajo detiene la entrega.']}
    ],
    escenarios: [
      {q:'Necesitas soltar un conector cerca del pretensor trasero. Desconectaste la batería de 12 V hace 30 segundos.', a:'detener', x:'Se espera el tiempo que indica el fabricante para que el módulo descargue su energía de reserva.'},
      {q:'Terminaste el montaje, el testigo de ABS está apagado y los datos en vivo muestran las cuatro ruedas con lecturas parejas.', a:'seguir', x:'El sistema original quedó funcionando. Se puede continuar con la integración.'}
    ],
    practica: [
      {c:'C06', q:'Vas a trabajar cerca de un pretensor del cinturón. ¿Qué haces antes?', o:['Nada, solo se activa en un choque','Mides su resistencia con el multímetro','Le pones cinta aislante al conector','Desconectas la batería de 12 V y esperas el tiempo del fabricante'], a:3, x:'El módulo guarda energía un tiempo después de desconectar. Se espera antes de intervenir.'},
      {c:'C06', q:'¿Por qué no se mide con multímetro el circuito de un airbag?', o:['Porque la corriente del instrumento puede activarlo','Porque el multímetro se daña','Porque la lectura siempre es cero','Porque no tiene cables'], a:0, x:'El detonador funciona con muy poca corriente. Se diagnostica con escáner, no con multímetro.'},
      {c:'C06', q:'Después de montar el kit se enciende el testigo de ABS. ¿Qué corresponde?', o:['Entregar el auto y avisar después','Borrar el código y entregar','Detener la entrega y revisar el sensor y su cableado en el eje trasero','Desconectar el testigo'], a:2, x:'El ABS original siempre manda. Un testigo encendido indica que algo se tocó y debe corregirse antes de entregar.'},
      {c:'C06', q:'¿Cómo se guarda un airbag desmontado?', o:['Con la cara que se infla hacia abajo','Con la cara que se infla hacia arriba, lejos del calor y sin golpes','Dentro del auto, en el asiento','En cualquier posición si está desconectado'], a:1, x:'Si se activara, saldría hacia arriba sin proyectarse contra el piso ni contra alguien.'}
    ],
    mostrar: 4
  },
  'N2-1': {
    capsulas: [
      {t:'Elegibilidad del kit', c:'C07', puntos:['Primero se verifica que el auto pueda recibir el kit: tracción delantera y modelo presente en la biblioteca de calibraciones.','Si el modelo no está en la biblioteca, no se instala: se deriva a Ingeniería de Calibración.','La elegibilidad se registra con evidencia (placa, modelo, año), no de memoria.']},
      {t:'Inspección y OBD', c:'C08', oficio:true, puntos:['Foco en eje trasero, frenos, suspensión y chasis: donde va el kit.','Óxido estructural, golpes en largueros o piezas con juego pueden impedir la instalación.','Antes de tocar nada se leen y registran las fallas previas del OBD: así nadie confunde una falla antigua con una nueva.']},
      {t:'Informe y estimador de ahorro', c:'C12', puntos:['Un buen informe dice qué se vio, con qué evidencia y qué se concluye, en palabras que el cliente entienda.','El estimador de ahorro depende de los datos de uso que entrega el cliente. Si son supuestos o están fuera de lo común, el resultado no es confiable y se dice.','Desaconsejar con evidencia también es un buen diagnóstico.']}
    ],
    practica: [
      {c:'C07', q:'El auto es de tracción delantera, pero su modelo no está en la biblioteca de calibraciones. ¿Qué corresponde?', o:['Usar la calibración de un modelo parecido','Instalar y calibrar después','Pedirle al cliente que espere en el taller','No instalar y derivar a Ingeniería de Calibración'], a:3, x:'Sin calibración del modelo no hay instalación. La calibración nueva es 100% interna (D19).'},
      {c:'C09', q:'¿Por qué se leen y registran las fallas del OBD antes de empezar a trabajar?', o:['Para separar fallas previas de las que podrían aparecer después','Porque el escáner lo pide','Para borrarlas y dejar el auto limpio','No hace falta registrarlas'], a:0, x:'Si después aparece un código, se sabe si ya estaba. Protege al cliente y al taller.'},
      {c:'C08', q:'En la inspección ves óxido que perfora un larguero trasero. ¿Qué haces?', o:['Lo pintas y sigues','Lo registras: puede impedir la instalación','Lo ignoras, el kit no va en el larguero','Lo comentas al final si hay tiempo'], a:1, x:'El chasis recibe cargas del kit. Un daño estructural se registra y puede bloquear la instalación.'},
      {c:'C10', q:'El cliente dice que maneja "más o menos" 100 km al día pero no sabe bien. ¿Cómo lees el estimador de ahorro?', o:['Como un dato exacto','Lo subes para que se vea mejor','Como una estimación poco confiable, y se lo dices al cliente','Lo ignoras'], a:2, x:'El estimador es tan bueno como sus datos. Si los datos son supuestos, se explica que el resultado es aproximado.'},
      {c:'C12', q:'¿Qué debe tener un informe de diagnóstico?', o:['Lo que se observó, la evidencia y la conclusión, claro para el cliente','Solo la conclusión','Términos técnicos para que se vea profesional','La opinión del técnico sobre el auto'], a:0, x:'Hecho, evidencia y conclusión. Si el cliente no lo entiende, el informe no cumplió su función.'}
    ],
    mostrar: 4
  },
  'N2-2': {
    capsulas: [
      {t:'Montaje mecánico', c:'C13', oficio:true, puntos:['El tren trasero se desmonta y monta con los torques del fabricante y del procedimiento Lumine, con torquímetro.','Cada pieza que se suelta se marca o fotografía para volver a montarla igual.','El motor eléctrico y el frenado regenerativo se instalan siguiendo el procedimiento Lumine paso a paso (lo enseña el formador en el taller).']},
      {t:'Banco de baterías', c:'C15', puntos:['Se mueve y monta siempre con elevador, nunca a mano entre varias personas.','Sin golpes: un golpe puede dañar una celda aunque no se vea.','Se trabaja con el banco sin conectar al resto del sistema.']},
      {t:'Cableado y pesaje', c:'C16', puntos:['El cableado de alta tensión (naranja) va por rutas alejadas de piezas móviles, calientes o con filo, con fijaciones y protecciones contra el roce.','En esta etapa se tiende sin conectar.','Al terminar se pesa el auto: masa total y masa por eje. El Responsable Técnico verifica los límites de homologación: 20% en masa y 10% entre ejes. Pasarse afecta el frenado y la estabilidad, y el auto no se certifica.']}
    ],
    practica: [
      {c:'C15', q:'Hay que subir el banco de baterías a su posición. Tienen elevador pero tarda en llegar. ¿Qué hacen?', o:['Lo suben entre cuatro personas','Esperan el elevador','Lo apoyan en una gata de carro','Lo suben por partes'], a:1, x:'El banco se mueve siempre con elevador: por el peso y porque un golpe puede dañar una celda.'},
      {c:'C16', q:'Al tender el cable de alta tensión, la ruta más corta pasa rozando el borde de una plancha. ¿Qué haces?', o:['Lo pasas igual con una vuelta de cinta','Lo pasas y lo revisas en la mantención','Lo amarras a la plancha','Buscas otra ruta o pones una protección contra roce y lo fijas'], a:3, x:'El roce desgasta la aislación con el tiempo. Se protege y se fija, o se cambia la ruta.'},
      {c:'C18', q:'El pesaje muestra que la masa aumentó más del 20%. ¿Qué significa?', o:['Que se pasó el límite de homologación y el auto no se certifica así','Que hay que inflar más los neumáticos','Que la balanza está mala','Nada, es un valor de referencia'], a:0, x:'Los límites de 20% en masa y 10% entre ejes protegen el frenado y la estabilidad, y son condición para certificar.'},
      {c:'C17', q:'¿Qué se registra al pesar el auto?', o:['Solo el peso total','La masa total y la masa por eje','El peso del banco de baterías','La presión de los neumáticos'], a:1, x:'Se necesitan las dos: la total para el límite de masa y por eje para la distribución.'},
      {c:'C13', q:'Terminas de montar el tren trasero. ¿Cómo se aprietan los pernos?', o:['Con llave de impacto','Hasta que no giren más','Con torquímetro al valor del procedimiento','Como estaban antes, a mano'], a:2, x:'Cada unión lleva su torque. El torquímetro es la única forma de saber que quedó bien.'}
    ],
    mostrar: 4
  },
  'N2-3': {
    capsulas: [
      {t:'Aislación', c:'C19', oficio:true, puntos:['Antes de energizar se mide la aislación con megóhmetro, con la tensión de prueba que indica el procedimiento.','Un valor bajo el mínimo significa que la corriente podría escapar a la carrocería: no se energiza y se busca la causa.','El megóhmetro genera tensión: se usa con el sistema cortado, bloqueado y con equipo dieléctrico.']},
      {t:'Energizar y observar', c:'C20', puntos:['Se energiza siguiendo la secuencia controlada del kit, sin saltar pasos.','Con la cámara termográfica se buscan puntos calientes: una conexión que se calienta más que las demás está floja o sucia.','Ante un punto caliente o un olor, se corta y se revisa antes de seguir.']},
      {t:'Unidad de control y capa de seguridad', c:'C22', puntos:['La unidad de control lee del auto la velocidad, el freno, el acelerador, el OBD y la batería. Se verifica que cada lectura sea correcta.','Capa de seguridad: el freno, el ABS y el control de estabilidad originales siempre mandan.','El torque del kit se corta ante patinaje, falla o sobretemperatura. Esto se comprueba, no se supone.']}
    ],
    escenarios: [
      {q:'La medición de aislación dio bajo el mínimo del procedimiento, pero el resto de la instalación está perfecta y el cliente espera.', a:'detener', x:'Con aislación baja no se energiza. Se busca la causa primero.'},
      {q:'La termografía muestra todas las conexiones a temperatura pareja y la unidad de control lee bien velocidad, freno y acelerador.', a:'seguir', x:'Se cumplió lo que pide esta etapa. Se continúa con la comprobación de la capa de seguridad.'}
    ],
    practica: [
      {c:'C19', q:'La aislación medida está bajo el mínimo del procedimiento. ¿Qué haces?', o:['Energizas y vuelves a medir después','No energizas y buscas la causa','Repites hasta que salga bien','Lo anotas y entregas'], a:1, x:'Aislación baja significa riesgo de fuga a la carrocería. No se energiza.'},
      {c:'C21', q:'En la termografía una conexión aparece bastante más caliente que las otras. ¿Qué indica?', o:['Que es la conexión principal y es normal','Que la cámara está mal calibrada','Que el auto está al sol','Que puede estar floja o sucia: se corta y se revisa'], a:3, x:'Más temperatura en una conexión significa más resistencia. Se corrige antes de seguir.'},
      {c:'C24', q:'¿Qué debe pasar con el torque del kit si una rueda patina?', o:['Debe cortarse','Debe aumentar para salir del patinaje','Debe mantenerse igual','Nada, el kit no detecta patinaje'], a:0, x:'La capa de seguridad corta el torque ante patinaje, falla o sobretemperatura.'},
      {c:'C23', q:'Si el conductor frena fuerte, ¿quién manda?', o:['La unidad de control del kit','Depende de la batería','El freno, el ABS y el control de estabilidad originales','El que reaccione primero'], a:2, x:'Los sistemas originales siempre mandan sobre el kit.'},
      {c:'C22', q:'La unidad de control muestra velocidad cero con el auto avanzando en el dinamómetro. ¿Qué haces?', o:['Sigues: la velocidad no es importante','Revisas la conexión de esa señal antes de seguir','Desconectas el ABS','Cambias la unidad de control'], a:1, x:'Si no lee bien la velocidad, la capa de seguridad no puede actuar bien. Se corrige la señal.'}
    ],
    mostrar: 4
  },
  'N2-4': {
    capsulas: [
      {t:'La biblioteca de calibraciones', c:'C25', puntos:['Las calibraciones no se guardan en esta plataforma: viven en la biblioteca, con acceso restringido.','Se carga la calibración del modelo exacto. Nunca la de un modelo "parecido".','Solo se hacen los ajustes que el procedimiento permite. Todo lo demás lo hace Ingeniería de Calibración.']},
      {t:'Registrar desviaciones', c:'C26', puntos:['Cuando el auto se comporta distinto a lo esperado, se registra en el formato de Ingeniería de Calibración: qué se observó, en qué condición y con qué datos.','Un buen registro permite mejorar la calibración para el próximo auto del mismo modelo.','Este módulo lo enseña y lo valida Ingeniería de Calibración.']}
    ],
    practica: [
      {c:'C25', q:'No encuentras la calibración del modelo exacto, pero hay una de la versión anterior. ¿Qué haces?', o:['Usas la de la versión anterior','Ajustas una calibración genérica','Detienes y consultas a Ingeniería de Calibración','Instalas sin calibración y la cargas después'], a:2, x:'Se carga solo la calibración del modelo exacto. Lo demás lo resuelve Ingeniería de Calibración.'},
      {c:'C26', q:'Durante la prueba la asistencia se siente más fuerte de lo esperado en subida. ¿Qué haces con eso?', o:['Nada, al cliente le va a gustar','Lo registras en el formato de Ingeniería de Calibración con la condición y los datos','Ajustas la calibración por tu cuenta','Lo comentas en el almuerzo'], a:1, x:'Las desviaciones se registran con datos para que Ingeniería de Calibración mejore la calibración.'},
      {c:'C25', q:'¿Qué ajustes de calibración puede hacer el técnico?', o:['Solo los que el procedimiento permite','Todos, si el cliente lo pide','Ninguno, nunca toca la calibración','Los que le parezcan razonables'], a:0, x:'El técnico carga y hace ajustes permitidos. Cambiar la calibración es tarea de Ingeniería de Calibración.'}
    ],
    mostrar: 3
  },
  'N2-5': {
    capsulas: [
      {t:'Dinamómetro', c:'C27', oficio:true, puntos:['El auto se fija según el procedimiento del dinamómetro antes de empezar.','La zona alrededor queda despejada y con ventilación.','Se mide la asistencia eléctrica y la regeneración, y se comparan con lo esperado.']},
      {t:'Pruebas previas a la certificación', c:'C28', puntos:['Antes de ir al 3CV se ejecuta el protocolo de pruebas completo, en el orden indicado.','Cada resultado se registra con fecha, valor medido y quién midió.','Un resultado fuera de rango se corrige y se vuelve a probar: no se lleva a certificar "para ver qué pasa".']},
      {t:'Registro e informe técnico', c:'C29', puntos:['El registro de instalación reúne todo: diagnóstico, montaje, mediciones, calibración aplicada y pruebas.','El informe técnico para la certificación lo firma el Responsable Técnico, así que debe quedar completo y claro.','Lo que no está registrado, para la certificación no pasó.']}
    ],
    practica: [
      {c:'C27', q:'Antes de partir la prueba en dinamómetro, ¿qué verificas?', o:['Que el auto esté lavado','Que el estanque esté lleno','Que la radio funcione','Que el auto esté fijado según el procedimiento y la zona despejada'], a:3, x:'Un auto mal fijado puede salir del dinamómetro. La zona despejada protege a las personas.'},
      {c:'C28', q:'Una prueba previa a la certificación salió fuera de rango. ¿Qué haces?', o:['La llevas igual al 3CV','La anotas como aprobada','Corriges la causa y repites la prueba','Borras ese resultado'], a:2, x:'Se corrige y se repite. El registro debe mostrar el resultado real.'},
      {c:'C29', q:'¿Por qué el registro de instalación debe quedar completo?', o:['Porque el Responsable Técnico firma el informe con esa información','Porque lo pide el cliente','Para ocupar el formulario','No es necesario si el auto funciona'], a:0, x:'La firma legal es del Responsable Técnico (D17): firma lo que el registro respalda.'},
      {c:'C28', q:'¿Qué datos lleva cada resultado de prueba?', o:['Solo si aprobó o no','Fecha, valor medido y quién midió','La opinión del técnico','El nombre del cliente'], a:1, x:'Con fecha, valor y responsable, el resultado se puede revisar y repetir.'}
    ],
    mostrar: 4
  },
  'N3-1': {
    capsulas: [
      {t:'Postventa', c:'C31', puntos:['La mantención programada incluye revisar conexiones, aislación y recalibrar cuando corresponde.','La telemetría permite comparar el ahorro real con el prometido. Si no calza, se busca la causa con el cliente.','Ante una falla, primero se diagnostica si es del kit o del auto. No se reemplaza nada "por si acaso".']},
      {t:'Batería retirada', c:'C34', puntos:['Una batería dañada se trata como posible fuente de incendio: se aísla, se vigila y se rotula.','Se retira con el mismo cuidado que se instala: elevador, sin golpes, equipo dieléctrico.','Su destino se gestiona según la Ley REP: no va a la basura ni a una bodega común.']},
      {t:'Autonomía', c:'C11', puntos:['El nivel 3 firma las verificaciones internas de su propio trabajo.','Desaconsejar una instalación con evidencia es parte del trabajo autónomo.','Al traspasar un caso a postventa, el registro va completo: quien lo recibe no debería tener que preguntar.','Ante un cliente, se explica sin prometer lo que el kit no asegura.']}
    ],
    practica: [
      {c:'C32', q:'La telemetría muestra un ahorro mucho menor que el prometido. ¿Qué haces primero?', o:['Le dices al cliente que maneja mal','Recalibras sin revisar','Revisas los datos de uso y el estado del sistema para encontrar la causa','Lo ignoras'], a:2, x:'Primero se entiende la causa: uso distinto al estimado, una falla o una calibración que revisar.'},
      {c:'C34', q:'Retiraste una batería dañada. ¿Dónde termina?', o:['Aislada, vigilada y gestionada según la Ley REP','En la basura industrial','En la bodega con repuestos','Se le devuelve al cliente'], a:0, x:'Puede encenderse y es un residuo regulado. Se aísla y se gestiona por la vía que fija la Ley REP.'},
      {c:'C11', q:'En el diagnóstico encuentras que el uso del cliente no le dará ahorro real. ¿Qué haces?', o:['Instalas igual, ya pagó el diagnóstico','Desaconsejas la instalación y muestras la evidencia','Le dices que lo piense','Subes el estimador'], a:1, x:'Desaconsejar con evidencia protege al cliente y a la marca.'},
      {c:'C33', q:'Un auto vuelve con una falla. ¿Qué haces antes de reemplazar piezas del kit?', o:['Cambias la unidad de control por si acaso','Cambias el banco de baterías','Llamas al cliente para que espere','Diagnosticas si la falla es del kit o del auto'], a:3, x:'Diagnosticar primero evita cambios innecesarios y garantías mal atribuidas.'},
      {c:'C30', q:'Traspasas un caso a postventa. ¿Qué entregas?', o:['El registro completo del caso','Un mensaje con el resumen','Nada, ellos revisan el auto','Solo el informe de diagnóstico'], a:0, x:'Quien recibe el caso debe poder seguir sin preguntar.'}
    ],
    mostrar: 4
  },
  'N4-1': {
    capsulas: [
      {t:'Enseñar un procedimiento', c:'C38', puntos:['Explicar para qué sirve, demostrar, practicar guiado y recién después practicar solo.','Un paso a la vez. Si el aprendiz se equivoca, se corrige en el momento y se repite.','Lo de seguridad se enseña con el porqué: así se recuerda.']},
      {t:'Evaluar a otro técnico', c:'C38', puntos:['Se evalúa con la pauta de sabe o no sabe, por competencia.','Durante la evaluación no se ayuda: se observa. La enseñanza fue antes.','Nadie evalúa a su compañero de duo: la plataforma lo bloquea.']},
      {t:'Revisiones cruzadas', c:'C38', puntos:['El nivel 4 firma revisiones cruzadas del trabajo de otros (propuesta D18).','Una revisión se firma solo si se verificó, no por confianza.','Lo que se encuentra se registra y se conversa con quien hizo el trabajo.']}
    ],
    practica: [
      {c:'C38', q:'Tu aprendiz se salta un paso durante su evaluación. ¿Qué haces?', o:['Le soplas el paso para que no repruebe','Detienes la evaluación y le enseñas','Lo marcas como no sabe en esa competencia; la enseñanza fue antes','Lo dejas pasar si el resultado final salió bien'], a:2, x:'En la evaluación se observa y se marca. Si es de seguridad y hay riesgo, se detiene el trabajo.'},
      {c:'C38', q:'¿Cuál es el orden más efectivo para enseñar un procedimiento?', o:['Explicar, demostrar, practicar guiado y practicar solo','Que lo haga solo y después corregir','Darle el manual para que lo lea','Demostrar una vez rápido'], a:0, x:'Pasar de ver a hacer con ayuda y luego solo consolida el aprendizaje.'},
      {c:'C38', q:'Te piden firmar la revisión cruzada de un trabajo que no alcanzaste a verificar. ¿Qué haces?', o:['Firmas porque confías en el técnico','No firmas hasta verificar','Firmas y revisas mañana','Le pides a otro que firme'], a:1, x:'Una firma dice "lo verifiqué". Sin verificación no se firma.'},
      {c:'C38', q:'Te asignan evaluar a tu compañero de duo. ¿Qué corresponde?', o:['Lo evalúas con más exigencia','Lo evalúas normal','Le pides que se evalúe solo','Rechazas: nadie valida a su compañero de duo'], a:3, x:'Es una regla del sistema: la validación la hace alguien de otro duo, el Responsable Técnico o la parte externa.'}
    ],
    mostrar: 4
  }
};
