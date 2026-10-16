/* =====================================================================
   Lumine Habilita · reglas, decisiones, trazabilidad y seguridad
   (informes 1, 3, 5 y 6). Datos de gobierno: no cambian el cálculo.
   ===================================================================== */
'use strict';

/* Reglas del sistema (informes 3 y 5) */
const REGLAS_EVAL = [
  ['La prioridad decide qué se cursa.', 'El core lo cursan todos; el oficio se puede saltar; el desarrollo se aprende al subir de nivel.'],
  ['Solo el oficio se salta, y solo con demostración presencial.', 'Lo online no permite saltar nada, y un certificado previo solo da acceso directo a la demostración.'],
  ['La criticidad decide la aprobación.', 'Seguridad y producto se aprueban con 100%; las complementarias, con 85%.'],
  ['El nivel se gana en la validación práctica.', 'Lo online sirve para aprender y se puede repetir sin límite; si alguien lo pasó copiando, se nota en el taller.'],
  ['Nadie valida a su compañero de duo.', 'La validación la hace alguien de otro duo, el Responsable Técnico o la parte externa.'],
  ['Lo reprobado se repite cuantas veces haga falta.', 'El contenido queda siempre abierto para repasar, el avance se desbloquea por nivel y la primera nota queda registrada como punto de partida.'],
  ['La validación externa cubre la seguridad eléctrica general y las emergencias.', 'Todo lo propio del kit se valida adentro, aunque sea de seguridad, porque la parte externa no conoce el producto ni debe acceder a él.']
];
const REGLAS_AVANCE = [
  ['Se repite solo lo reprobado.', 'Si alguien falla la estación de aislación, repite esa estación y no la validación completa.'],
  ['Todo duo lleva al menos un técnico de nivel 3 o 4.', 'El nivel 2 trabaja con supervisión, así que dos técnicos de nivel 2 no forman duo por su cuenta. Esta regla ordena también la rotación voluntaria de los duos (D13).'],
  ['La primera generación trabaja bajo el Responsable Técnico.', 'Mientras no exista nadie de nivel 3, los duos trabajan con supervisión directa suya, y las validaciones internas las hacen él e Ingeniería de Calibración en el módulo 4.'],
  ['Solo el core de seguridad se revalida.', 'Se repasa y se vuelve a demostrar cada cierto tiempo; el resto del nivel no vence. Como referencia, IMI TechSafe exige actualización en ciclos de tres años.'],
  ['Un incidente de seguridad grave obliga a revalidar.', 'Quien lo protagoniza vuelve a demostrar el core de seguridad antes de trabajar de nuevo con alta tensión. No baja de nivel: solo se suspende esa parte hasta revalidar.']
];
const REGLAS_DIAG = [
  ['Lo online solo agrega, nunca quita.', 'La prueba de fundamentos puede sumar nivelación, pero no salta nada. Copiar con IA solo hace perder una nivelación que se necesitaba.'],
  ['Solo el oficio se salta, y en la jornada técnica.', 'Un certificado sirve para que la plataforma marque la estación, no para evitarla.'],
  ['Todos entran por el nivel 1.', 'Cada nivel tiene competencias core que nadie trae, así que ningún currículum permite entrar directo a un nivel superior.'],
  ['El diagnóstico también sirve para seleccionar.', 'Entre dos postulantes, el que demostró más oficio y necesita menos nivelación tiene una ruta más corta y más barata. Se suma a la entrevista y no la reemplaza.'],
  ['O*NET se usa una sola vez.', 'Sirvió para construir el diccionario; por persona, la comparación se reduce a una prueba de fundamentos y una jornada.']
];

/* Tareas del duo (informe 1) */
const TAREAS = {
  '0.1':'Revisar el procedimiento de trabajo seguro y asignar los roles del duo: ejecutor y encargado de seguridad',
  '0.2':'Preparar el equipo de protección dieléctrico y las herramientas aisladas, y delimitar la zona de trabajo',
  '0.3':'Aplicar las cinco reglas de oro al intervenir alta tensión: cortar, bloquear y etiquetar, verificar ausencia de tensión, poner a tierra y señalizar',
  '0.4':'Identificar los sistemas de seguridad del auto (ABS, control de estabilidad, airbags y pretensores) antes de trabajar cerca de ellos',
  '1.1':'Recibir el vehículo y verificar su elegibilidad técnica: tracción delantera y modelo presente en la biblioteca de calibraciones',
  '1.2':'Registrar qué sistemas de seguridad trae el auto de fábrica',
  '1.3':'Revisar el estado mecánico, con foco en eje trasero, frenos, suspensión y chasis',
  '1.4':'Leer los datos del puerto OBD y registrar las fallas previas',
  '1.5':'Revisar la estimación de ahorro del cliente: validarla, ajustarla dentro de los límites permitidos o desaconsejar la instalación con evidencia',
  '1.6':'Emitir el informe de diagnóstico',
  '2.1':'Desmontar parcialmente el tren trasero',
  '2.2':'Instalar el motor eléctrico y el sistema de frenado regenerativo en el eje trasero',
  '2.3':'Montar el banco de baterías con elevador',
  '2.4':'Tender el cableado de alta tensión sin conectar y el cableado de señales',
  '2.5':'Pesar el vehículo y registrar la masa total y la distribución entre ejes, para que el Responsable Técnico verifique los límites de 20% y 10%',
  '3.1':'Conectar el sistema de alta tensión y verificar la aislación con megóhmetro',
  '3.2':'Energizar de forma controlada y revisar con cámara termográfica',
  '3.3':'Integrar la unidad de control con las señales del auto: velocidad, freno, acelerador, OBD y gestión de la batería',
  '3.4':'Verificar la capa de seguridad: freno, ABS y control de estabilidad originales siempre mandan, y el torque se corta ante patinaje, falla o sobretemperatura',
  '4.1':'Cargar la calibración del modelo desde la biblioteca y ajustarla al vehículo',
  '4.2':'Registrar las desviaciones observadas para que la función de desarrollo mejore la calibración',
  '5.1':'Probar en dinamómetro la asistencia eléctrica y la regeneración',
  '5.2':'Ejecutar las pruebas previas a la certificación ante el 3CV',
  '6.1':'Registrar la calibración aplicada y los hallazgos en la biblioteca',
  '6.2':'Preparar el informe técnico para la certificación y la inscripción de la alteración, que firma el Responsable Técnico',
  '6.3':'Traspasar el caso a postventa con el registro completo',
  '7.1':'Ejecutar la mantención programada y la recalibración',
  '7.2':'Leer la telemetría y verificar el ahorro real frente al prometido',
  '7.3':'Diagnosticar y reparar fallas cubiertas por garantía',
  '7.4':'Reemplazar el banco de baterías y dejar segura la batería retirada para su gestión bajo la Ley REP',
  '8.1':'Aplicar los procedimientos de emergencia: incendio de batería, contacto eléctrico, corte de energía y primeros auxilios',
  '8.2':'Trabajar en duo con roles alternados y comunicación constante durante la tarea',
  '8.3':'Atender la consulta técnica de un cliente que ventas deriva, como experto de respaldo',
  '8.4':'Formar a otros técnicos, desde el nivel formador',
  '8.5':'Firmar verificaciones internas de calidad: el nivel autónomo firma su trabajo propio y el nivel formador las revisiones cruzadas (D18)'
};

/* Registro de decisiones (informe 1) */
const DECISIONES = [
  ['D1','Problema','El perfil que combina mecánica automotriz y alta tensión no existe formado en Chile; Lumine debe producir esa competencia puertas adentro','Cerrada'],
  ['D2','Alcance','Cargos incluidos: Técnico Instalador (núcleo) y Responsable Técnico. Ingeniería de Calibración se contrata por perfil de mercado con inducción y queda fuera de la ruta; sigue en el organigrama y trabaja con los duos','Cerrada'],
  ['D3','Solución','Sistema de selección y habilitación por competencias: primero se mide la brecha, después se arma la ruta','Cerrada'],
  ['D4','Cantidad de ítems','No se fija de antemano; sale del análisis de tareas','Cerrada'],
  ['D5','Primera generación','La forma una parte externa solo en seguridad y alta tensión; la calibración nunca se externaliza','Cerrada'],
  ['D6','Validación','Mixta: externa para seguridad y alta tensión; interna para proceso Lumine y calibración','Cerrada'],
  ['D7','Umbrales','Core y seguridad al 100%; el resto con 85% mínimo','Cerrada'],
  ['D8','Pruebas','La prueba online es de práctica y da derecho a presentarse; el nivel se otorga solo en validación presencial','Cerrada'],
  ['D9','Avance','El avance desbloquea sí o sí; el repaso queda siempre abierto; la primera nota queda registrada y se puede repetir para subirla','Cerrada'],
  ['D10','Diseño','Módulos cortos, prácticos, con simulador y elementos interactivos; preguntas planteadas como casos del taller','Cerrada'],
  ['D11','Bono','Por capacitación completa y avance validado, nunca por nota online; monto pendiente de finanzas','Cerrada'],
  ['D12','Organización','Todo el trabajo técnico en duos fijos; teoría individual; validación práctica en duo con nota individual','Cerrada'],
  ['D13','Rotación','Voluntaria, cada 4 meses como mínimo, por solicitud escrita al Responsable Técnico con los motivos: es una vía abierta para mejorar cómo trabajan los duos. El nuevo duo cumple los requisitos (al menos un técnico de nivel 3 o 4; nunca dos de nivel 1). El Responsable Técnico puede separar antes por seguridad o conflicto','Cerrada'],
  ['D14','Postventa','La gestiona otra área; la ejecuta el duo','Cerrada'],
  ['D15','Vehículos','Se incluyen autos con ABS, airbag y control de estabilidad, aunque el borrador de reglamento hoy los excluye','Cerrada'],
  ['D16','Comunicación','Ventas explica y convence; el técnico entra solo como experto de respaldo para quien quiera hablar con uno','Cerrada'],
  ['D17','Firma legal','El Responsable Técnico firma todo lo que exige la autoridad','Cerrada'],
  ['D18','Firma interna','Nivel 3 firma su trabajo propio (checklist de pruebas y registro de calibración del propio duo); nivel 4 firma revisiones cruzadas (calibración de otro duo y validaciones internas). Amarrada a C39 y C38','Cerrada'],
  ['D19','Calibración nueva','Calibración 100% interna; cargo de Ingeniería de Calibración desde la apertura, con acceso restringido a la biblioteca','Cerrada']
];
const PENDIENTES = [
  'Fijar el monto del bono por avance (finanzas)',
  'Elegir el proveedor del kit y confirmar el peso y el montaje del banco de baterías. Que llega con carga ya está respondido: por avión viaja con hasta 30% (IATA) y por mar sin límite, así que se trata como energizado desde que se recibe',
  'Confirmar con la SEC la clase de licencia. El borrador de reglamento pide al menos un instalador electricista autorizado por la SEC sin decir la clase; por la escala del D.S. 92 correspondería la clase C si el kit no pasa de 50 kW, o la B si pasa',
  'Definir el encuadre del sistema frente al reglamento futuro. El borrador ya pide lo que el sistema tiene: un Responsable Técnico ingeniero electricista, un instalador electricista SEC y un instalador mecánico con formación técnica',
  'Confirmar la columna de mercado del diccionario con los datos reales de la jornada técnica (indicador de oficio demostrado). La oferta revisada (Duoc UC, INACAP y el perfil ChileValora de 2021) respalda el "parcial" en seguridad de alta tensión'
];
const INFORMES = [
  ['Informe 1','Tareas del duo técnico','https://claude.ai/code/artifact/b2b2b149-ebc0-43c6-82fb-c79266bd8bae'],
  ['Informe 2','Competencias del técnico','https://claude.ai/code/artifact/c2c37e64-8e7e-413e-b2be-d102b66a5f86'],
  ['Informe 3','Diccionario de competencias','https://claude.ai/code/artifact/2582f90b-1205-4d69-a7f9-6cc7906dd3f6'],
  ['Informe 4','Diagnóstico de brecha','https://claude.ai/code/artifact/1b1032e2-07e0-406f-aca0-56f5912b3192'],
  ['Informe 5','Ruta de habilitación y reglas de avance','https://claude.ai/code/artifact/48ebfa82-3eed-4301-b7c4-f1404e988b2a'],
  ['Informe 6','Indicadores y especificación de la plataforma','https://claude.ai/code/artifact/3783e806-f7a0-4e31-9421-21216c3f51f7']
];
const FUENTES = [
  ['O*NET OnLine, 49-3023.00 Automotive Service Technicians and Mechanics','https://www.onetonline.org/link/summary/49-3023.00'],
  ['SEC, Pliego Técnico Normativo RIC N°17 (referencia: rige para instalaciones fijas)','https://www.sec.cl/sitio-web/wp-content/uploads/2021/01/RIC-N17-Operacion-y-Mantenimiento.pdf'],
  ['bbz Arnsberg, Hochvolt: Neue DGUV steht in den Startlöchern (DGUV 209-093)','https://www.bbz-arnsberg.de/blog/hochvolt-neue-dguv-steht-in-den-startloechern'],
  ['IMI, IMI TechSafe (ciclo de actualización de tres años)','https://www.theimi.org.uk/membership/imi-techsafe'],
  ['DGUV Information 209-093, Qualifizierung für Arbeiten an Fahrzeugen mit Hochvoltsystemen (2021)','https://www.bghm.de/fileadmin/user_upload/Arbeitsschuetzer/Gesetze_Vorschriften/Informationen/209-093.pdf'],
  ['TÜV SÜD, Qualifikationen nach DGUV Information 209-093 (unidades por etapa y punto de entrada)','https://www.tuvsud.com/INTERSHOP/static/WFS/BA-Academy-DE-Site/-/BA-Academy-DE/de_DE/PDF/AC360-HochVSys-mgr-w-22-03-16.pdf'],
  ['DGUV, FAQ Elektromobilität (primeros auxilios con RCP, 9 UE; actualización cada dos años)','https://www.dguv.de/medien/fb-holzundmetall/sachgebiete/fahrzeug/bilder/faq_elektromobilitaet.pdf'],
  ['INRS, Habilitation électrique: foire aux questions (NF C 18-550, recyclage cada 3 años)','https://www.inrs.fr/risques/electriques/habilitation-electrique-foire-aux-questions.html'],
  ['BOE, Real Decreto 281/2021, curso de especialización en mantenimiento de vehículos híbridos y eléctricos','https://www.boe.es/diario_boe/txt.php?id=BOE-A-2021-7687'],
  ['CFT Estatal de Valparaíso, Especialista en diagnóstico y mantenimiento de vehículos eléctricos (perfil ChileValora, 80 h)','https://tecnologicovalparaiso.cl/curso-especialista-en-diagnostico-y-mantenimiento-de-vehiculos-electricos/'],
  ['bia Stuttgart, Hochvolt Stufe 3S (un año de experiencia como 2S antes de trabajar con tensión)','https://www.bia-stuttgart.de/kurse/hochvolt-schulung-stufe-3s/'],
  ['Subsecretaría de Transportes, borrador de reglamento para la transformación de vehículos a propulsión eléctrica (consulta pública)','https://www.subtrans.gob.cl/wp-content/uploads/2025/09/Reglamento-Transformacio%CC%81n-de-Vehi%CC%81culos-a-Ele%CC%81ctricos-10_12_21-a-consulta-pu%CC%81blica-1.pdf'],
  ['SEC, Alcance de las licencias de instalador eléctrico (D.S. 92)','https://sec.custhelp.com/app/answers/detail/a_id/584/~/alcance-de-licencias-de-instalador-el%C3%A9ctrico'],
  ['SENCE, Estudio identifica el capital humano que requerirá la electromovilidad (Ministerio de Energía, Centro UC y OTIC SOFOFA)','https://sence.gob.cl/personas/noticias/estudio-identifica-el-capital-humano-que-se-requerira-para-la-implementacion-de-la-electromovilidad-en-el-pais'],
  ['Centro UC Políticas Públicas, Electromovilidad en Chile: escenarios de implementación y desarrollo de capital humano','https://politicaspublicas.uc.cl/publicacion/electromovilidad-en-chile-escenarios-de-implementacion-y-desarrollo-de-capital-humano/'],
  ['Ministerio de Energía, Chile avanza en formación y certificación para la electromovilidad junto a ChileValora','https://energia.gob.cl/noticias/nacional/chile-avanza-en-formacion-y-certificacion-para-la-electromovilidad-junto-chile-valora'],
  ['IATA, Dangerous Goods Regulations 2026: baterías de litio UN3480 con hasta 30% de carga','https://www.hazmatuniversity.com/news/lithium-battery-air-transport-2026-iata-and-icao-compliance-guide/']
];

/* 20 controles de seguridad antes de lanzar (lista entregada por el equipo) */
const SEGURIDAD = [
  {n:1,  t:'Revisa los permisos', s:'ok', d:'Cuatro tipos de usuario con reglas de acceso que aplica el servidor, no la página: la raíz de la base solo la lee y escribe administración; cada técnico ve únicamente su expediente y su avance; los evaluadores ven solo su agenda.'},
  {n:2,  t:'Panel admin', s:'ok', d:'El panel, las personas, las validaciones, los duos, los indicadores y los ajustes existen solo para nivel administración (Editor o dueño). A cualquier otro la base le responde como si no hubiera datos.'},
  {n:3,  t:'Datos entre clientes', s:'ok', d:'Cada técnico lee solo su propio expediente (ruta con su identificador). Un evaluador recibe solo los ítems que le asignaron. Nadie ve resultados de otro técnico.'},
  {n:4,  t:'Blinda la base de datos', s:'ok', d:'Regla raíz cerrada para todo lo que no sea administración. Lo único que escribe un técnico es su propio avance online y su solicitud de rotación, y por diseño eso no habilita nada: toda autoridad vive en datos que solo escribe administración.'},
  {n:5,  t:'Claves privadas', s:'ok', d:'La página no guarda claves, tokens ni contraseñas, y no usa servicios con llave. La biblioteca de calibraciones no se guarda en la plataforma.'},
  {n:6,  t:'Asegura el inicio de sesión', s:'plat', d:'Se entra con la cuenta de la organización en claude.ai. La plataforma no maneja contraseñas propias.'},
  {n:7,  t:'Sesiones caducadas', s:'plat', d:'Las sesiones las administra claude.ai. Si se retira el acceso con la página abierta, la base corta la conexión y la página queda sin datos.'},
  {n:8,  t:'Doble factor', s:'pend', d:'Depende de la cuenta con que se entra. Pendiente de operación: exigir verificación en dos pasos a todas las cuentas de administración.'},
  {n:9,  t:'Inyecciones SQL', s:'ok', d:'No hay SQL: la base es de documentos y cada ruta se arma con identificadores validados (solo letras, números, guion y guion bajo).'},
  {n:10, t:'Código malicioso', s:'ok', d:'Todo dato se inserta como texto, nunca como HTML. El navegador bloquea scripts de terceros y la página no carga librerías externas.'},
  {n:11, t:'Acciones sensibles', s:'ok', d:'Cerrar validaciones, cambiar umbrales, terminar duos antes de plazo, eliminar y restaurar piden confirmación dentro de la página, y las que se salen de la regla exigen motivo. Todo queda en la bitácora.'},
  {n:12, t:'Archivos subidos', s:'ok', d:'Solo se aceptan respaldos .json de hasta 2 MB. Se valida la estructura y cada identificador antes de restaurar, con una prueba en seco que muestra qué cambiaría.'},
  {n:13, t:'Bloquea accesos internos', s:'ok', d:'La base es interna de la organización. El evaluador externo no recibe cuenta: marca en modo kiosco en un equipo de Lumine y solo ve ítems de banco genérico.'},
  {n:14, t:'Verifica webhooks', s:'na', d:'No aplica: la plataforma no recibe webhooks ni integraciones externas. La integración con sistemas de Lumine quedó fuera de alcance.'},
  {n:15, t:'Pagos duplicados', s:'na', d:'No aplica: no hay pagos. El bono por avance se calcula por nivel validado y queda como estado (una fecha por nivel), así que no se puede contar dos veces.'},
  {n:16, t:'Limita solicitudes', s:'plat', d:'claude.ai limita la tasa por usuario. La página escribe solo ante acciones, nunca en bucles, y bloquea el doble clic mientras guarda.'},
  {n:17, t:'Actualiza dependencias', s:'ok', d:'Cero dependencias de código de terceros. Solo se cargan tipografías desde Google Fonts.'},
  {n:18, t:'Paneles expuestos', s:'ok', d:'No hay consolas ni paneles de base de datos publicados. Las secciones de administración dependen del nivel que valida el servidor.'},
  {n:19, t:'Accesos sospechosos', s:'pend', d:'La bitácora registra quién hizo qué y cuándo, y viaja en cada respaldo. Límite honesto: un administrador podría editarla, y la detección de inicios de sesión sospechosos es de la cuenta de acceso.'},
  {n:20, t:'Prueba restaurar respaldos', s:'ok', d:'Exportación completa a JSON y restauración con prueba en seco. Pendiente de operación: calendario de respaldos y una prueba de restauración periódica.'}
];

/* Reglas de acceso de la base (versión real) */
const DB_RULES = [
  {path:'',                   read:'admin',    write:'admin'},
  {path:'config',             read:'interact', write:'admin'},
  {path:'expedientes',        read:'admin',    write:'admin'},
  {path:'expedientes/{self}', read:'interact', write:'admin'},
  {path:'avance',             read:'admin',    write:'admin'},
  {path:'avance/{self}',      read:'interact', write:'interact'},
  {path:'agenda',             read:'admin',    write:'admin'},
  {path:'agenda/{self}',      read:'interact', write:'admin'},
  {path:'marcas',             read:'admin',    write:'admin'},
  {path:'marcas/{self}',      read:'interact', write:'interact'},
  {path:'solicitudes',        read:'admin',    write:'admin'},
  {path:'solicitudes/{self}', read:'interact', write:'interact'}
];
