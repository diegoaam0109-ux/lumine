/* =====================================================================
   Lumine Habilita · datos del sistema (Fase 3, informes 1 a 6)
   Todo lo que está aquí sale de los informes. Nada es dato operativo.
   ===================================================================== */
'use strict';

/* p: core | oficio | desarrollo · k: seg | prod | comp · e: online | presencial | trabajo
   v: ext | int · m: lo trae el mercado (si | parcial | no, estimación del informe 2) */
const COMP = [
  {c:'C01', n:1, p:'core',       k:'seg',  e:'online',     v:'ext', b:'Antes de cada trabajo',      m:'parcial', ta:['0.1','0.2','0.3','0.4','8.1'], t:'Explicar los riesgos de la alta tensión vehicular: choque, arco e incendio de batería'},
  {c:'C02', n:1, p:'core',       k:'seg',  e:'presencial', v:'ext', b:'Antes de cada trabajo',      m:'no',      ta:['0.3'],        t:'Aplicar las cinco reglas de oro y verificar ausencia de tensión con instrumento'},
  {c:'C03', n:1, p:'oficio',     k:'seg',  e:'presencial', v:'ext', b:'Antes de cada trabajo',      m:'parcial', ta:['0.2'],        t:'Elegir, revisar y usar equipo dieléctrico y herramientas aisladas'},
  {c:'C04', n:1, p:'oficio',     k:'seg',  e:'presencial', v:'ext', b:'Antes de cada trabajo',      m:'si',      ta:['0.1'],        t:'Seguir un procedimiento de trabajo seguro paso a paso'},
  {c:'C05', n:1, p:'core',       k:'seg',  e:'presencial', v:'ext', b:'Antes de cada trabajo',      m:'no',      ta:['0.1','8.2'],  t:'Actuar como encargado de seguridad del duo: vigilar, cortar la energía y detener el trabajo'},
  {c:'C06', n:1, p:'desarrollo', k:'seg',  e:'online',     v:'ext', b:'Antes de cada trabajo',      m:'parcial', ta:['0.4','1.2'],  t:'Reconocer ABS, control de estabilidad, airbags y pretensores, y el riesgo de trabajar cerca'},
  {c:'C35', n:1, p:'core',       k:'seg',  e:'presencial', v:'ext', b:'Transversal',                m:'parcial', ta:['8.1'],        t:'Responder ante emergencias: incendio de batería, contacto eléctrico y primeros auxilios con RCP'},
  {c:'C36', n:2, p:'desarrollo', k:'comp', e:'trabajo',    v:'int', b:'Transversal',                m:'no',      ta:['8.2'],        t:'Trabajar en duo con roles alternados y comunicación clara'},
  {c:'C07', n:2, p:'core',       k:'prod', e:'online',     v:'int', b:'Recepción y diagnóstico',    m:'no',      ta:['1.1'],        t:'Aplicar los criterios de elegibilidad del kit'},
  {c:'C08', n:2, p:'oficio',     k:'prod', e:'presencial', v:'int', b:'Recepción y diagnóstico',    m:'si',      ta:['1.3'],        t:'Inspeccionar eje trasero, frenos, suspensión y chasis, y detectar lo que impide instalar'},
  {c:'C09', n:2, p:'oficio',     k:'comp', e:'presencial', v:'int', b:'Recepción y diagnóstico',    m:'si',      ta:['1.4'],        t:'Usar escáner OBD e interpretar fallas y datos en vivo'},
  {c:'C10', n:2, p:'desarrollo', k:'comp', e:'online',     v:'int', b:'Recepción y diagnóstico',    m:'no',      ta:['1.5'],        t:'Leer el estimador de ahorro y reconocer cuándo no es confiable'},
  {c:'C12', n:2, p:'oficio',     k:'comp', e:'presencial', v:'int', b:'Recepción y diagnóstico',    m:'parcial', ta:['1.6'],        t:'Redactar un informe de diagnóstico claro'},
  {c:'C13', n:2, p:'oficio',     k:'seg',  e:'presencial', v:'int', b:'Montaje sin energía',        m:'si',      ta:['2.1'],        t:'Desmontar y montar el tren trasero con los torques del fabricante'},
  {c:'C14', n:2, p:'core',       k:'prod', e:'presencial', v:'int', b:'Montaje sin energía',        m:'no',      ta:['2.2'],        t:'Instalar el motor eléctrico y el frenado regenerativo según el procedimiento Lumine'},
  {c:'C15', n:2, p:'desarrollo', k:'seg',  e:'presencial', v:'ext', b:'Montaje sin energía',        m:'no',      ta:['2.3','7.4'],  t:'Manipular y montar el banco de baterías con elevador, sin golpes ni riesgo'},
  {c:'C16', n:2, p:'oficio',     k:'seg',  e:'presencial', v:'ext', b:'Montaje sin energía',        m:'parcial', ta:['2.4'],        t:'Tender cableado de alta tensión y de señales: rutas, fijaciones y protecciones'},
  {c:'C17', n:2, p:'oficio',     k:'prod', e:'presencial', v:'int', b:'Montaje sin energía',        m:'parcial', ta:['2.5'],        t:'Pesar el auto y registrar la masa total y por eje'},
  {c:'C18', n:2, p:'desarrollo', k:'prod', e:'online',     v:'int', b:'Montaje sin energía',        m:'no',      ta:['2.5'],        t:'Explicar los límites de homologación (20% en masa, 10% entre ejes) y por qué importan'},
  {c:'C19', n:2, p:'oficio',     k:'seg',  e:'presencial', v:'ext', b:'Integración y energización', m:'parcial', ta:['3.1'],        t:'Medir aislación con megóhmetro e interpretar el resultado'},
  {c:'C20', n:2, p:'core',       k:'seg',  e:'presencial', v:'int', b:'Integración y energización', m:'no',      ta:['3.2'],        t:'Energizar el sistema siguiendo la secuencia controlada del kit'},
  {c:'C21', n:2, p:'oficio',     k:'seg',  e:'presencial', v:'ext', b:'Integración y energización', m:'parcial', ta:['3.2'],        t:'Detectar puntos calientes con cámara termográfica'},
  {c:'C22', n:2, p:'core',       k:'prod', e:'presencial', v:'int', b:'Integración y energización', m:'no',      ta:['3.3'],        t:'Conectar la unidad de control a velocidad, freno, acelerador, OBD y batería, y verificar que lee bien'},
  {c:'C23', n:2, p:'core',       k:'seg',  e:'online',     v:'int', b:'Integración y energización', m:'no',      ta:['3.4'],        t:'Explicar cómo funciona la capa de seguridad de la unidad de control'},
  {c:'C24', n:2, p:'core',       k:'seg',  e:'presencial', v:'int', b:'Integración y energización', m:'no',      ta:['3.4'],        t:'Comprobar que freno, ABS y control de estabilidad originales mandan y que el torque se corta ante falla'},
  {c:'C25', n:2, p:'core',       k:'prod', e:'presencial', v:'int', b:'Calibración',                m:'no',      ta:['4.1'],        t:'Cargar una calibración de la biblioteca y hacer los ajustes permitidos'},
  {c:'C26', n:2, p:'core',       k:'prod', e:'presencial', v:'int', b:'Calibración',                m:'no',      ta:['4.2','6.1'],  t:'Registrar desviaciones en el formato de Ingeniería de Calibración'},
  {c:'C27', n:2, p:'oficio',     k:'comp', e:'presencial', v:'int', b:'Pruebas',                    m:'parcial', ta:['5.1'],        t:'Operar el dinamómetro y medir asistencia y regeneración'},
  {c:'C28', n:2, p:'desarrollo', k:'prod', e:'presencial', v:'int', b:'Pruebas',                    m:'no',      ta:['5.2'],        t:'Ejecutar el protocolo de pruebas previas a la certificación y registrar los resultados'},
  {c:'C29', n:2, p:'core',       k:'prod', e:'presencial', v:'int', b:'Documentación y entrega',    m:'no',      ta:['6.1','6.2'],  t:'Completar el registro de instalación y el informe técnico para certificación'},
  {c:'C11', n:3, p:'desarrollo', k:'comp', e:'trabajo',    v:'int', b:'Recepción y diagnóstico',    m:'no',      ta:['1.5'],        t:'Desaconsejar una instalación con evidencia'},
  {c:'C30', n:3, p:'desarrollo', k:'comp', e:'trabajo',    v:'int', b:'Documentación y entrega',    m:'no',      ta:['6.3'],        t:'Traspasar el caso a postventa con un registro completo'},
  {c:'C31', n:3, p:'desarrollo', k:'prod', e:'presencial', v:'int', b:'Postventa',                  m:'no',      ta:['7.1'],        t:'Ejecutar la mantención programada del kit y la recalibración según pauta'},
  {c:'C32', n:3, p:'desarrollo', k:'comp', e:'online',     v:'int', b:'Postventa',                  m:'no',      ta:['7.2'],        t:'Leer la telemetría y comparar el ahorro real con el prometido'},
  {c:'C33', n:3, p:'desarrollo', k:'comp', e:'presencial', v:'int', b:'Postventa',                  m:'parcial', ta:['7.3'],        t:'Diagnosticar una falla y distinguir si viene del kit o del auto original'},
  {c:'C34', n:3, p:'desarrollo', k:'seg',  e:'presencial', v:'ext', b:'Postventa',                  m:'no',      ta:['7.4'],        t:'Retirar un banco de baterías, incluso dañado, y dejarlo seguro para la Ley REP'},
  {c:'C37', n:3, p:'desarrollo', k:'comp', e:'presencial', v:'int', b:'Transversal',                m:'no',      ta:['8.3'],        t:'Explicar el sistema a un cliente en lenguaje simple, sin prometer lo que no está verificado'},
  {c:'C39', n:3, p:'desarrollo', k:'prod', e:'trabajo',    v:'int', b:'Transversal',                m:'no',      ta:['8.5'],        t:'Firmar las verificaciones internas del trabajo propio'},
  {c:'C38', n:4, p:'desarrollo', k:'comp', e:'presencial', v:'int', b:'Transversal',                m:'no',      ta:['8.4'],        t:'Enseñar un procedimiento, evaluar a otro técnico y firmar revisiones cruzadas'}
];
const C = Object.fromEntries(COMP.map(x => [x.c, x]));
const CODES_SORTED = COMP.map(x => x.c).sort();

const PRIORIDAD = {
  core:       {l:'Core',       d:'Lo propio de Lumine y de su seguridad; nadie lo trae de afuera', r:'Lo cursan todos, nunca se salta'},
  oficio:     {l:'Oficio',     d:'Conocimiento general del rubro que el mercado sí entrega',        r:'Se salta solo con demostración presencial'},
  desarrollo: {l:'Desarrollo', d:'Lo que nadie trae, pero no hace falta para empezar',              r:'Se aprende al subir de nivel, muchas veces en el trabajo'}
};
const CRITICIDAD = {
  seg:  {l:'Seguridad',      d:'Se arriesga una persona: el técnico, su compañero o el futuro conductor', a:'100%'},
  prod: {l:'Producto',       d:'Falla la instalación, la certificación o la biblioteca de calibraciones', a:'100%'},
  comp: {l:'Complementaria', d:'Un error se corrige sin daño grave',                                      a:'85%'}
};
const EVALUA = { online:'Online', presencial:'Presencial', trabajo:'En el trabajo' };
const VALIDA = { ext:'Externa', int:'Interna' };
const MERCADO = { si:'Sí', parcial:'Parcial', no:'No' };

const NIVELES = [
  {n:1, nombre:'Aprendiz asistido',          corto:'Aprendiz',   ic:'shield',
   habilita:'Ser el segundo integrante del duo, encargado de seguridad. La guía alemana DGUV 209-093 exige a esa persona instrucción en alta tensión y primeros auxilios.',
   valida:'Circuito de seguridad', quien:'Externa',
   detalle:'Aplica las reglas de oro, usa el equipo dieléctrico, actúa como encargado de seguridad en un simulacro de falla y responde un simulacro de incendio de batería con primeros auxilios.'},
  {n:2, nombre:'Habilitado con supervisión', corto:'Supervisado', ic:'wrench',
   habilita:'Ejecutar la instalación completa con un técnico autónomo o formador al lado.',
   valida:'Instalación completa supervisada', quien:'Externa e interna',
   detalle:'Parte externa: batería, cableado, aislación y termografía en banco genérico. Parte interna: instala el kit completo en un auto real, desde el diagnóstico hasta el informe técnico.'},
  {n:3, nombre:'Autónomo',                   corto:'Autónomo',   ic:'route',
   habilita:'Instalar sin supervisión, ejecutar postventa, atender consultas de clientes y firmar las verificaciones internas del trabajo propio.',
   valida:'Período autónomo observado y caso de postventa', quien:'Interna, y externa para la batería',
   detalle:'Trabaja un período sin supervisión mientras se observa cómo desaconseja, traspasa casos y firma; resuelve un caso de postventa; retira una batería dañada en banco genérico; atiende una consulta de cliente.'},
  {n:4, nombre:'Formador',                   corto:'Formador',   ic:'grad',
   habilita:'Enseñar y validar a otros, firmar revisiones cruzadas y ser candidato a respaldo de Ingeniería de Calibración.',
   valida:'Módulo dictado a un aprendiz', quien:'Interna',
   detalle:'Dicta un módulo a un aprendiz y lo evalúa, observado por el Responsable Técnico.'}
];
const NIVEL = Object.fromEntries(NIVELES.map(x => [x.n, x]));

const CURSOS_CORE = [
  {id:'SEG', nombre:'Seguridad en alta tensión del kit', codigos:['C01','C02','C05','C20','C23','C24'], nota:'Se dicta en dos partes: nivel 1 (C01, C02, C05) y nivel 2 (C20, C23, C24).'},
  {id:'EME', nombre:'Emergencias', codigos:['C35'], nota:'Va completo en el nivel 1.'},
  {id:'PRO', nombre:'Proceso Lumine', codigos:['C07','C14','C22','C25','C26','C29'], nota:'Va integrado en los módulos del nivel 2, en el orden en que se usa en el taller.'}
];
/* core de seguridad: lo único que se revalida (regla de avance 4) */
const CORE_SEG = COMP.filter(x => x.p === 'core' && x.k === 'seg').map(x => x.c);

const NIVELACION = [
  {id:'NIV-E', area:'electrica',   nombre:'Nivelación eléctrica',              cubre:'Ley de Ohm, uso de multímetro y lectura de diagramas', antes:1, quien:'El mecánico tradicional'},
  {id:'NIV-M', area:'mecanica',    nombre:'Nivelación mecánica',               cubre:'Herramientas, torques, frenos y suspensión',           antes:2, quien:'El electricista'},
  {id:'NIV-X', area:'electronica', nombre:'Nivelación de electrónica automotriz', cubre:'Sensores, redes del auto y OBD',                    antes:2, quien:'Ambos, en distinto grado'}
];
const AREAS = { electrica:'Eléctrica', mecanica:'Mecánica', electronica:'Electrónica automotriz' };
const AREA_NIV = { electrica:'NIV-E', mecanica:'NIV-M', electronica:'NIV-X' };

/* Módulos online. El nivel 2 se divide en cinco módulos que siguen el orden de una instalación real (informe 5). */
const MODULOS = [
  {id:'NIV-E', nivel:0, nombre:'Nivelación eléctrica', cod:[], resumen:'Ley de Ohm, uso de multímetro y lectura de diagramas. Antes del nivel 1.'},
  {id:'NIV-M', nivel:0, nombre:'Nivelación mecánica', cod:[], resumen:'Herramientas, torques, frenos y suspensión. Antes del nivel 2.'},
  {id:'NIV-X', nivel:0, nombre:'Nivelación de electrónica automotriz', cod:[], resumen:'Sensores, redes del auto y OBD. Antes del nivel 2.'},
  {id:'N1-1', nivel:1, nombre:'Seguridad del kit · parte 1', cod:['C01','C02','C05','C03','C04'], resumen:'Riesgos de la alta tensión, reglas de oro, verificación de ausencia de tensión y rol del encargado de seguridad.'},
  {id:'N1-2', nivel:1, nombre:'Emergencias', cod:['C35'], resumen:'Incendio de batería, contacto eléctrico y primeros auxilios con RCP.'},
  {id:'N1-3', nivel:1, nombre:'Sistemas de seguridad del auto', cod:['C06'], resumen:'ABS, control de estabilidad, airbags y pretensores, y el riesgo de trabajar cerca.'},
  {id:'N2-1', nivel:2, nombre:'Diagnóstico', cod:['C07','C08','C09','C12','C10'], resumen:'Elegibilidad del kit, inspección, OBD, informe de diagnóstico y estimador de ahorro.'},
  {id:'N2-2', nivel:2, nombre:'Montaje', cod:['C14','C13','C16','C17','C15','C18'], resumen:'Motor eléctrico y frenado regenerativo, tren trasero, cableado, pesaje, banco de baterías y límites de homologación.'},
  {id:'N2-3', nivel:2, nombre:'Integración y energización', cod:['C20','C22','C23','C24','C19','C21'], resumen:'Secuencia controlada, unidad de control, capa de seguridad, aislación y termografía.'},
  {id:'N2-4', nivel:2, nombre:'Calibración', cod:['C25','C26'], resumen:'Cargar calibraciones de la biblioteca y registrar desviaciones. Lo enseña y lo valida Ingeniería de Calibración.', ic:true},
  {id:'N2-5', nivel:2, nombre:'Pruebas y documentación', cod:['C29','C27','C28'], resumen:'Registro de instalación, informe técnico, dinamómetro y pruebas previas a la certificación.'},
  {id:'N3-1', nivel:3, nombre:'Autonomía y postventa', cod:['C31','C32','C33','C34','C37','C11','C30','C39'], resumen:'Mantención y recalibración, telemetría, fallas del kit o del auto, retiro de baterías, clientes, traspasos y firma propia.'},
  {id:'N4-1', nivel:4, nombre:'Formación de formadores', cod:['C38'], resumen:'Enseñar un procedimiento, evaluar a otro técnico y firmar revisiones cruzadas.'}
];
const MOD = Object.fromEntries(MODULOS.map(x => [x.id, x]));
/* C36 no tiene módulo: se observa mientras trabaja en duo */
const TRANSVERSAL_N2 = ['C36'];

/* Estaciones de oficio de la jornada técnica (informe 4) */
const ESTACIONES = ['C03','C04','C16','C19','C21','C08','C09','C12','C13','C17','C27'];
const ESTACIONES_EXT = ['C03','C04','C16','C19','C21'];

/* Antecedentes: perfil, certificados y experiencias marcan estaciones. Nunca las saltan. */
const PERFILES = {
  mecanico:        {l:'Mecánico automotriz',          marca:['C04','C08','C09','C12','C13','C17','C27']},
  electricista:    {l:'Electricista con licencia SEC', marca:['C03','C04','C16','C19','C21']},
  electromovilidad:{l:'Egresado de electromovilidad',  marca:[]},
  otro:            {l:'Otro perfil',                   marca:[]}
};
const CERTIFICADOS = [
  {id:'sec', l:'Licencia SEC',                           marca:['C03','C04','C16','C19','C21']},
  {id:'at',  l:'Curso de alta tensión vehicular',        marca:['C03','C04','C19']},
  {id:'pa',  l:'Primeros auxilios vigente',              marca:[]}
];
const EXPERIENCIAS = [
  {c:'C03', l:'He usado equipo dieléctrico y herramientas aisladas'},
  {c:'C04', l:'He trabajado con procedimientos de trabajo seguro escritos'},
  {c:'C08', l:'He inspeccionado ejes, frenos, suspensión y chasis'},
  {c:'C09', l:'He usado escáner OBD y leído datos en vivo'},
  {c:'C12', l:'He redactado informes de diagnóstico'},
  {c:'C13', l:'He desmontado y montado trenes traseros con torquímetro'},
  {c:'C16', l:'He tendido cableado de potencia o de alta tensión'},
  {c:'C17', l:'He pesado vehículos por eje'},
  {c:'C19', l:'He medido aislación con megóhmetro'},
  {c:'C21', l:'He usado cámara termográfica'},
  {c:'C27', l:'He operado un dinamómetro'}
];

/* Prueba de fundamentos: preguntas por caso. Solo agrega nivelación, nunca quita nada. */
const FUNDAMENTOS = [
  {id:'E1', area:'electrica', q:'Un circuito de 12 V alimenta una ampolleta que consume 2 A. ¿Qué resistencia tiene la ampolleta?', o:['24 Ω','10 Ω','6 Ω','0,17 Ω'], a:2, x:'Ley de Ohm: R = V / I = 12 / 2 = 6 Ω.'},
  {id:'E2', area:'electrica', q:'Necesitas medir la corriente que consume un accesorio. ¿Cómo conectas el multímetro?', o:['En serie con el circuito, en la entrada y escala de corriente','En paralelo con el accesorio, en la escala de voltaje','Entre el positivo y la masa del auto, en la escala de resistencia','Da lo mismo mientras el circuito esté encendido'], a:0, x:'La corriente se mide en serie: toda la corriente del circuito tiene que pasar por el instrumento.'},
  {id:'E3', area:'electrica', q:'En un diagrama ves dos consumos conectados en paralelo a una batería de 12 V. ¿Qué tensión recibe cada uno?', o:['6 V cada uno','Depende solo del largo de los cables','24 V en total','12 V cada uno'], a:3, x:'En paralelo, cada rama recibe la misma tensión de la fuente.'},
  {id:'M1', area:'mecanica', q:'El fabricante indica apretar una pieza con varios pernos en patrón de estrella. ¿Para qué sirve ese patrón?', o:['Para terminar más rápido','Para asentar la pieza en forma pareja y evitar deformaciones','Para que el torque final quede más alto','Solo sirve en ruedas de aleación'], a:1, x:'El patrón en estrella reparte la carga y asienta la pieza sin deformarla.'},
  {id:'M2', area:'mecanica', q:'Al probar los frenos el pedal se siente esponjoso y baja más de lo normal. ¿Cuál es la causa más probable?', o:['Pastillas nuevas','Batería descargada','Neumáticos con poca presión','Aire en el circuito hidráulico'], a:3, x:'El aire se comprime, por eso el pedal se siente blando. Hay que purgar el circuito.'},
  {id:'M3', area:'mecanica', q:'Un compañero apretó un perno de suspensión con llave de impacto, sin medir. ¿Qué corresponde hacer?', o:['Nada, la llave de impacto aprieta de sobra','Darle media vuelta más para asegurar','Soltarlo y apretarlo con torquímetro al valor del fabricante','Poner sellador de roscas y seguir'], a:2, x:'Sin torquímetro no hay forma de saber si quedó dentro de especificación; se corrige con el valor del fabricante.'},
  {id:'X1', area:'electronica', q:'El escáner OBD muestra un código que empieza con P. ¿Qué indica esa letra?', o:['Que la falla es del tren motriz','Que la falla es de la carrocería','Que es un código pendiente','Que la falla es de la red de comunicación'], a:0, x:'P corresponde a tren motriz (powertrain). B es carrocería, C chasis y U red.'},
  {id:'X2', area:'electronica', q:'El sensor de temperatura del refrigerante cambia su señal a medida que el motor se calienta. ¿Qué tipo de señal entrega normalmente?', o:['Digital de encendido y apagado','Analógica, una tensión que varía con la temperatura','Una señal de radiofrecuencia','Ninguna, solo enciende una luz del tablero'], a:1, x:'Es un sensor resistivo: la unidad de control lee una tensión que varía con la temperatura.'},
  {id:'X3', area:'electronica', q:'Dos módulos del auto dejan de comunicarse y aparecen códigos que empiezan con U. ¿Qué revisas primero?', o:['El nivel de aceite','El filtro de aire','La presión de los neumáticos','La red de comunicación entre módulos, como la red CAN'], a:3, x:'Los códigos U son de red. Se revisa la comunicación entre módulos: cableado, conectores y terminaciones de la red.'}
];


/* Indicadores (informe 6) */
const INDICADORES = [
  {id:'autonomia',  n:'Tiempo hasta la autonomía',            q:'Cuánto demora formar a un técnico',        calc:'Días desde el ingreso hasta aprobar el nivel 3, por perfil de entrada', src:'Fechas de ingreso y de validación'},
  {id:'primer',     n:'Aprobación al primer intento',          q:'Si la capacitación prepara bien',          calc:'Aprobados a la primera en cada validación, sobre el total que se presenta', src:'Registro de validaciones'},
  {id:'oficio',     n:'Oficio demostrado',                     q:'Cuánto ahorra el diagnóstico',             calc:'Competencias de oficio saltadas por técnico, sobre 11', src:'Jornada técnica'},
  {id:'costo',      n:'Costo por técnico habilitado',          q:'Cuánto cuesta el sistema',                 calc:'Costo total de formación, sobre los técnicos que llegan al nivel 3', src:'Horas de módulos y validaciones, más costos que ingresa administración'},
  {id:'dotacion',   n:'Técnicos por nivel',                    q:'Si hay capacidad para operar',             calc:'Técnicos en cada nivel y duos válidos (con al menos uno de nivel 3 o 4)', src:'Nivel vigente de cada técnico'},
  {id:'incidentes', n:'Incidentes de seguridad',               q:'Si la formación en seguridad funciona',    calc:'Incidentes por cada 100 instalaciones', src:'Registro de incidentes'},
  {id:'fallas',     n:'Fallas atribuibles a la instalación',   q:'Calidad del trabajo',                      calc:'Casos de garantía causados por la instalación, por técnico', src:'Registro que entrega postventa'},
  {id:'rotacion',   n:'Rotación de técnicos habilitados',      q:'Si se pierde la inversión en formación',   calc:'Técnicos de nivel 3 o 4 que se van, sobre el total de ese nivel', src:'Registro de salidas'}
];

/* Usuarios de la plataforma (informe 6) */
const ROLES_INFO = [
  {id:'tecnico', n:'Postulante o técnico', ic:'user', hace:'Registra antecedentes, rinde la prueba de fundamentos, cursa sus módulos y sigue su avance', nove:'Resultados de otros técnicos'},
  {id:'int',     n:'Evaluador interno',    ic:'clipboard', hace:'Marca sabe o no sabe en las estaciones y validaciones internas', nove:'Las validaciones de su propio compañero de duo'},
  {id:'ext',     n:'Evaluador externo',    ic:'shieldCheck', hace:'Marca sabe o no sabe en las estaciones de banco genérico', nove:'Nada del kit ni de la biblioteca'},
  {id:'rt',      n:'Responsable Técnico',  ic:'settings', hace:'Administra parámetros, registra incidentes y salidas, revisa indicadores', nove:'No aplica'}
];

/* Parámetros por defecto. Los valores sin fijar quedan en null a propósito (informe 5). */
const PARAMS_DEF = {
  umbralComp: 85,          // % complementarias (D7)
  umbralFund: 2,           // respuestas correctas de 3 por área para no requerir nivelación
  revalidacionMeses: 12,   // provisorio: frecuencia por definir (referencia IMI TechSafe: 36)
  rotacionMinMeses: 3,     // D13 (propuesta)
  periodoAutonomoDias: null,
  horasModulo: {},         // {moduloId: horas}
  horasValidacion: {},     // {JT|N1..N4|REV: horas}
  bonoNivel: {},           // {1..4: monto CLP} pendiente de finanzas
  firmaPorNivel: 'propuesta',
  v: 1
};
const GESTION_DEF = {
  costos: { horaFormacion:null, horaValidacionInterna:null, validacionExterna:null, otros:null },
  metas: {},               // {indicadorId: valor}
  instalaciones: [],       // [{id, desde, hasta, cantidad}]
  equipo: {},              // {uid: {rol:'rt'|'ic'|'formador'|'admin', desde}}
  v: 1
};

/* Tipos de sesión de validación */
const TIPOS_SESION = {
  JT:  {l:'Jornada técnica', c:'Diagnóstico presencial'},
  N1:  {l:'Validación nivel 1', c:'Circuito de seguridad'},
  N2:  {l:'Validación nivel 2', c:'Instalación completa supervisada'},
  N3:  {l:'Validación nivel 3', c:'Período autónomo observado y caso de postventa'},
  N4:  {l:'Validación nivel 4', c:'Módulo dictado a un aprendiz'},
  REV: {l:'Revalidación de seguridad', c:'Core de seguridad'}
};
