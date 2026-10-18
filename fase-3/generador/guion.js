// Guion de la exposición: una sola fuente para GUION.md (guion-md.js) y las notas del orador (deck.js).
// `d` = clave de la diapositiva en deck.js; el orden de este arreglo es el orden de la presentación.
// Todas las cifras salen del informe de la Fase 3 (Capítulo III); lo que falta se dice «por confirmar».
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';

const PRINCIPAL = [
  { d: 'portada', quien: DIEGO, titulo: 'Portada', texto:
    'Buenos días. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo. En las fases anteriores presentamos Lumine Motors: un kit que suma tracción eléctrica en el eje trasero de autos a combustión, sin tocar el motor original. ' +
    'Esta fase responde cómo se lleva a la práctica: cómo vendemos, con quiénes y cómo operamos.' },
  { d: 'objetivos', quien: DIEGO, titulo: 'El primer año decide el resto', texto:
    'Nuestro objetivo general es ser, en cinco años, la referencia de la hibridación de posventa en Chile. ' +
    'Pero el primer año decide el resto: instalar 299 vehículos, publicar tres casos con ahorro medido, llegar a 80% de clientes satisfechos y a 15% por recomendación.' },
  { d: 'segmentacion', quien: DIEGO, titulo: 'El cliente se define por su auto', texto:
    '¿A quién le vendemos? El cliente no se define por su edad ni por su ingreso, sino por su auto: liviano, a combustión y de tracción delantera, porque el kit va en el eje trasero. ' +
    'De las cuatro variables, la que decide es la conductual: mientras más se usa el auto, antes se paga el kit. ' +
    'Por eso entramos por el uso laboral de la Región Metropolitana: colectivos, taxis y aplicaciones, 162.780 vehículos.' },
  { d: 'investigacion', quien: DIEGO, titulo: 'Validar antes de vender', texto:
    'Todo esto todavía es un supuesto, así que antes de vender validamos. Ya hicimos una entrevista exploratoria a un conductor de aplicaciones; ahora vienen tres etapas. ' +
    'Cuatro expertos, del Estado, la academia, la industria y un taller de híbridos, dirán si la propuesta es aceptable. ' +
    'Cinco entrevistas en profundidad cubrirán cada perfil de cliente. Y una encuesta por cuotas a 150 personas medirá la intención de compra y el precio; como no es aleatoria, sus resultados serán indicativos. ' +
    'La encuesta prueba seis hipótesis, y la que más decide es esta: que la barrera es la confianza y no el precio. Benjamín sigue con la estrategia.' },

  { d: 'oportunidad', quien: BENJA, titulo: 'Una oportunidad sin oferta en Chile', texto:
    'Gracias, Diego. En la matriz de Ansoff entramos por desarrollo de producto: los conductores ya quieren gastar menos, pero la hibridación aditiva no tiene oferta en Chile. ' +
    'Desde el año 2 sumamos penetración y vendemos calibraciones y kits a otros talleres, porque nuestra ventaja competitiva sostenible, la biblioteca de calibraciones, vale más mientras es exclusiva. En el tercero llegan flotas y regiones. ' +
    'En el mapa, Lumine es la única forma de ahorrar sin cambiar de auto y sin límite de antigüedad.' },
  { d: 'alternativas', quien: BENJA, titulo: 'Un mismo auto, dos alternativas', texto:
    'Hay dos versiones con la misma estructura. Esencial cuesta 4,29 millones con IVA y promete hasta 15% menos bencina en ciudad; Plus, 4,99 millones y hasta 20%. ' +
    'Plus cuesta 16% más, pero ahorra 24% más, por eso la recomendamos. Son ahorros simulados y precios que la encuesta debe validar.' },
  { d: 'mix', quien: BENJA, titulo: 'El ahorro se ve antes de pagar', texto:
    'Las siete P se ordenan en una sola promesa: el cliente conoce su ahorro antes de pagar y lo comprueba después. ' +
    'Llega por la web y el estimador, se instala en nuestro taller y, en regiones, en la red. Paga al contado o en cuotas con convenio, y la promoción parte con clientes piloto y casos medidos. ' +
    'La confianza la dan las personas, el proceso y la evidencia: un dúo con un técnico avanzado, la decisión siempre en manos del cliente y un informe mensual de ahorro.' },
  { d: 'demanda', quien: BENJA, titulo: 'Hay más demanda que capacidad', texto:
    '¿Cuánto vamos a vender? Con el modelo de Bass, el 11,1% del segmento adopta el kit al quinto año. ' +
    'Pero desde el primer año hay más demanda que capacidad, así que el pronóstico lo pone el taller: 299 vehículos el primer año y 2.851 el quinto. La diferencia la atiende la red.' },
  { d: 'presupuesto-mkt', quien: BENJA, titulo: 'El primer año se invierte en evidencia', texto:
    'El presupuesto se arma por objetivo y tarea. El primer año son 80,9 millones, y la mayor parte va a 25 clientes piloto, que pagan la mitad a cambio de su caso medido. En cinco años suman 575 millones. Le paso a Lukas.' },

  { d: 'personas', quien: LUKAS, titulo: 'De 13 a 56 personas', texto:
    'Gracias, Benjamín. La estructura es funcional, sin mandos intermedios, y cada cargo responde por un resultado: el Responsable Técnico firma cada auto y Calibración cuida que el ahorro real calce con el estimado. ' +
    'Nadie se contrata antes de que la carga lo justifique: pasamos de 13 a 56 personas, y 36 son técnicos en tres talleres propios.' },
  { d: 'habilita', quien: LUKAS, titulo: 'Lumine Habilita', texto:
    'Como el oficio escasea, los técnicos se forman en casa con Lumine Habilita: reclutamos, medimos la brecha, capacitamos y validamos por niveles. ' +
    'En unos ocho meses un técnico llega al nivel 4, con un bono por cada nivel. La nómina pasa de 152 a 755 millones, pero por auto baja a la mitad. Y la plataforma ya funciona: pueden probarla con el código.' },
  { d: 'proceso', quien: LUKAS, titulo: 'De la cotización a la postventa', texto:
    'La operación sigue al auto en cinco etapas, de la cotización a la postventa, y la decisión de instalar es siempre del cliente. ' +
    'En el taller, un auto por jornada de unas 8,4 horas, con cuatro controles: si uno falla, se detiene.' },
  { d: 'escalar', quien: LUKAS, titulo: 'Un dúo más cuando la demanda pasa el 80%', texto:
    'Crecemos con un gatillo: dos meses sobre el 80% de la capacidad y entra un dúo; con seis dúos, abre otro taller. Así llegamos a tres talleres propios y a 42 en la red. ' +
    'La condición externa es el reglamento de la Ley 21.793: sin él no hay venta legal.' },
  { d: 'presupuesto-ops', quien: LUKAS, titulo: 'La inversión sigue al gatillo; el gasto, al kit', texto:
    'La inversión sigue al gatillo: un local nuevo en los años 1, 3 y 5. El gasto crece con las instalaciones y el kit es más del 90%. ' +
    'Como el 82% del kit se paga en dólares, ese es el riesgo mayor: si sube 10%, el margen del quinto año baja de 7,7% a 0,8%.' },
  { d: 'conclusiones', quien: LUKAS, titulo: 'Tres planes que se mueven juntos', texto:
    'En resumen, tres planes que se mueven juntos con un mismo gatillo. Lo que sigue es el plan financiero, que debe responder si la encuesta confirma el precio y cómo nos cubrimos del dólar. Muchas gracias.' },
  { d: 'cierre', quien: LUKAS, titulo: 'Cierre', texto: '', nota: 'Queda en pantalla mientras responden las preguntas.' },
];

// Diapositivas de apoyo para la defensa: no se exponen; se muestran solo si una pregunta las pide.
const ANEXO = [
  { d: 'a-hipotesis', codigo: 'A1', titulo: 'Hipótesis de la investigación', apoyo: 'Las seis hipótesis con su prueba estadística (Tabla N° 3); significancia de 5%, resultados indicativos por la muestra por cuotas.' },
  { d: 'a-dudas', codigo: 'A2', titulo: 'Dudas del cliente y respaldo', apoyo: '¿Funciona?, ¿daña mi auto?, ¿pasa la revisión técnica?, ¿hay que enchufarlo? (Tabla N° 4) y los límites de la promesa.' },
  { d: 'a-mix', codigo: 'A3', titulo: 'Mezcla de marketing por línea', apoyo: 'Las variables de la mezcla para el cliente final y para la red certificada (Tabla N° 8).' },
  { d: 'a-red', codigo: 'A4', titulo: 'Cobros a la red de talleres', apoyo: 'Paquete de entrada, kit con licencia, certificación anual y suscripción a Habilita (Tabla N° 7).' },
  { d: 'a-mercado', codigo: 'A5', titulo: 'Tamaño del mercado y adopción', apoyo: 'TAM, SAM y segmento laboral (Tabla N° 9) y la curva de Bass con su respaldo (Anexo N° 4).' },
  { d: 'a-pronostico', codigo: 'A6', titulo: 'Pronóstico por línea', apoyo: 'Demanda atendible, instalaciones propias y kits a la red por año (Tabla N° 10); la red incluye las regiones: al año 5, 4.286 kits en la RM y 3.487 en regiones.' },
  { d: 'a-recuperacion', codigo: 'A7', titulo: 'Recuperación y financiamiento', apoyo: 'Meses para recuperar la inversión por versión y uso, precio por punto de ahorro y cuota del financiamiento (Tabla N° 6 y §3.1.6.2). Responde a «¿quién paga 4 millones?».' },
  { d: 'a-perfiles', codigo: 'A8', titulo: 'Perfiles de cargo', apoyo: 'Dependencia y responsabilidad crítica de cada cargo (Tabla N° 13).' },
  { d: 'a-rentas', codigo: 'A9', titulo: 'Rentas, bonos y nómina', apoyo: 'Renta bruta mensual por cargo (Tabla N° 14), bono único por nivel validado (Tabla N° 15) y nómina por instalación de cada año (Tabla N° 16).' },
  { d: 'a-jornada', codigo: 'A10', titulo: 'Jornada de instalación', apoyo: 'Los siete bloques de la jornada de 8,4 horas y sus cuatro puntos de control (Anexo N° 8). El límite de capacidad son las horas de los dúos: un dinamómetro por local basta, incluso con seis dúos (Tabla N° 17).' },
  { d: 'a-resultados', codigo: 'A11', titulo: 'Resultado referencial por línea', apoyo: 'Resultado por línea de negocio, inversión por local, gasto del año 5 y margen propio según el dólar (Tablas N° 18 a 21). Proyección referencial, sin impuestos.' },
  { d: 'a-sensibilidad', codigo: 'A12', titulo: 'Sensibilidad del resultado', apoyo: 'Resultado de la línea propia al quinto año con dólar, proporción de Plus y precio (Tabla N° 21).' },
  { d: 'a-gantt', codigo: 'A13', titulo: 'Carta Gantt detallada', apoyo: 'La Carta Gantt completa (Figura N° 5): preparación, entrada de cada dúo, calibración de modelos, preapertura y apertura de los talleres 2 y 3, y crecimiento de la red.' },
];

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;

module.exports = { PRINCIPAL, ANEXO, DIEGO, BENJA, LUKAS, palabras, segundos, PALABRAS_POR_MINUTO };
