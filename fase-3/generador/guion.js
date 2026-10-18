// Guion de la exposición: una sola fuente para GUION.md (guion-md.js) y las notas del orador (deck.js).
// `d` = clave de la diapositiva en deck.js; el orden de este arreglo es el orden de la presentación.
// Todas las cifras salen del informe de la Fase 3 (Capítulo III); lo que falta se dice «por confirmar».
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';

const PRINCIPAL = [
  { d: 'portada', quien: DIEGO, titulo: 'Portada', texto:
    'Buenos días. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y les presentamos el capítulo tres de Lumine Motors: los planes de marketing, recursos humanos y operaciones. ' +
    'Lumine hibrida autos a combustión de tracción delantera sin cambiar el motor: suma motores eléctricos en las ruedas traseras, una batería bajo el piso y una unidad de control. ' +
    'Los tres planes comparten un mismo gatillo, así que un cambio en la demanda mueve el plan completo.' },
  { d: 'mercado', quien: DIEGO, titulo: 'El mercado y nuestra meta', texto:
    '¿A quién le vendemos y cuánto? El cliente no se define por su edad ni por su ingreso, sino por su auto: liviano, a combustión y con tracción delantera, porque el kit va en el eje trasero. ' +
    'De las cuatro variables, la decisiva es la conductual: la intensidad de uso fija en cuánto tiempo el ahorro paga la inversión. ' +
    'Por eso entramos por el uso laboral intensivo de la Región Metropolitana: colectivos, taxis y aplicaciones, 162.780 vehículos. ' +
    'La meta del primer año es instalar al menos 299 vehículos, publicar tres casos con ahorro medido en nueve meses, llegar a 80% de clientes satisfechos y a 15% de clientes por recomendación. ' +
    'A cinco años, queremos ser la referencia de la hibridación de posventa en Chile.' },
  { d: 'validar', quien: DIEGO, titulo: 'Validar antes de vender', texto:
    'Nada de esto se le ha preguntado aún a un conductor, así que antes de vender validamos. ' +
    'La investigación es mixta y secuencial: una entrevista en profundidad, ya realizada, entrevistas a cuatro expertos y a cinco perfiles de cliente, y una encuesta por cuotas a 150 personas. Como no es aleatoria, los resultados serán indicativos. ' +
    'Pone a prueba seis hipótesis; la que más decide es que la barrera principal es la confianza y no el precio. Es una hipótesis: la encuesta dirá si se cumple.' },
  { d: 'oportunidad', quien: DIEGO, titulo: 'Una oportunidad sin oferta en Chile', texto:
    'En la matriz de Ansoff entramos por desarrollo de producto: el mercado existe, porque los conductores ya buscan gastar menos, pero la hibridación aditiva no tiene oferta en Chile. ' +
    'Frente a las alternativas, Lumine ocupa un espacio vacío: la conversión a gas es barata, pero tiene límite de antigüedad, y el híbrido usado o el eléctrico nuevo obligan a cambiar de auto y cuestan sobre 9 millones. ' +
    'Desde el año 2 sumamos la penetración y, antes de lo habitual, la diversificación relacionada: vender calibraciones, kits y certificación a otros talleres, porque esa exclusividad se agota con el tiempo. En el año 3 llega el desarrollo de mercado. ' +
    'Nuestra ventaja competitiva sostenible es la biblioteca de calibraciones por modelo: crece con cada instalación y es lo más difícil de copiar. Le paso la palabra a Benjamín.' },

  { d: 'alternativas', quien: BENJA, titulo: 'Un mismo auto, dos alternativas', texto:
    'Gracias, Diego. El kit tiene dos versiones con la misma estructura. Esencial cuesta 4.290.000 pesos con IVA y promete hasta 15% menos bencina en ciudad; Plus cuesta 4.990.000 y hasta 20%. Esos son máximos simulados. ' +
    'Con el ahorro mediano simulado, un colectivo dejaría de gastar 117 mil pesos al mes con Esencial y 145 mil con Plus, y recuperaría la inversión en unos 37 y 34 meses. ' +
    'Plus cuesta 16% más, pero ahorra 24% más, así que cada punto de ahorro sale más barato. Son precios de referencia que la encuesta debe validar.' },
  { d: 'demanda', quien: BENJA, titulo: 'La demanda determina el crecimiento', texto:
    'El segmento laboral de la Región Metropolitana suma 162.780 vehículos. Con el modelo de Bass, la adopción llega a 11,1% al quinto año, por debajo del 16% de los primeros adoptantes. ' +
    'Pero el pronóstico es el menor entre demanda y capacidad, y desde el primer año la demanda atendible supera lo que podemos instalar: 299 vehículos el primer año y 2.851 al quinto. ' +
    'Lo que no alcanzamos a instalar lo atiende la red certificada, con 7.773 kits al quinto año.' },
  { d: 'canal', quien: BENJA, titulo: 'Cómo llegamos al cliente', texto:
    '¿Cómo llega el cliente? Empieza en el estimador digital, que calcula su ahorro y agenda la visita; sigue con una asesoría donde puede medir una semana su consumo antes de decidir; instala en el taller en una jornada, y después recibe un informe mensual de ahorro medido y la garantía. ' +
    'Al abrir, la promoción descansa en el estimador y en clientes piloto con 50% de descuento a cambio de su caso medido. ' +
    'El presupuesto se arma por objetivo y tarea: 80,9 millones el primer año, el 6,8% de los ingresos propios, y 575 millones en cinco años, cuando ya pesa 1,5%.' },
  { d: 'personas', quien: BENJA, titulo: 'De 13 a 56 personas', texto:
    'Para atender esa demanda, la estructura es funcional y sin mandos intermedios: cinco áreas bajo la Gerencia General. ' +
    'No cambia la estructura; cambia cuántas personas hay en cada cargo, y nadie se contrata antes de que la carga lo justifique. Ingeniería de Calibración depende de la Gerencia y no del taller, porque la biblioteca sostiene la ventaja. ' +
    'Así, el equipo pasa de 13 personas al cierre del primer año a 56 al quinto, y 36 de ellas son técnicos. Lukas sigue con las personas y las operaciones.' },

  { d: 'habilita', quien: LUKAS, titulo: 'Lumine Habilita', texto:
    'Gracias, Benjamín. El oficio escasea en Chile, así que los técnicos se forman en casa con Lumine Habilita: 39 competencias, cuatro niveles y 392 horas si se cursa todo. ' +
    'Con formación intensiva, un técnico nuevo llega al nivel 4 en unos ocho meses, y su renta sube de 750 mil a 1,15 millones. ' +
    'La nómina crece de 152 a 755 millones en cinco años, pero el costo por instalación baja de 508 mil a 253 mil pesos al cuarto año, porque los cargos fijos se reparten en más autos; el quinto sube un poco con el tercer taller.' },
  { d: 'proceso', quien: LUKAS, titulo: 'De la cotización a la postventa', texto:
    'El flujo sigue al vehículo desde la cotización hasta la postventa, en cinco etapas, con una regla: el negocio mide y recomienda, pero la decisión de instalar es siempre del cliente. ' +
    'La instalación toma una jornada estimada de 8,4 horas con cuatro puntos de control: vehículo apto, masa y ejes, aislación y dinamómetro. Si alguno falla, se detiene.' },
  { d: 'escalar', quien: LUKAS, titulo: 'Escalar sin adelantarse a la demanda', texto:
    'La Carta Gantt apunta a abrir en enero de 2027, pero el eslabón crítico es externo: el reglamento de la Ley 21.793 sigue pendiente, y sin él no hay certificado ni venta legal. ' +
    'Desde ahí crecemos con un gatillo: cuando la demanda supera el 80% de la capacidad durante dos meses, entra un dúo; cuando un taller llena sus seis dúos, abre el siguiente. ' +
    'Así, el segundo taller abre en el mes 25, el tercero en el 49, y la red crece de 3 a 42 talleres.' },
  { d: 'numeros', quien: LUKAS, titulo: 'Los números del crecimiento', texto:
    'Cada local requiere 81 millones de inversión, casi la mitad en el dinamómetro, y el kit explica más del 90% del gasto operacional. ' +
    'Proyectamos que la línea propia pierde 130 millones en el lanzamiento y gana desde el segundo año, hasta un margen de 7,7% al quinto; la red rinde cerca de 10%. ' +
    'El riesgo mayor es el dólar: un alza de 10% baja ese margen a 0,8%.' },
  { d: 'conclusiones', quien: LUKAS, titulo: 'Tres planes, un mismo gatillo', texto:
    'Para cerrar, tres conclusiones. Primero, la oportunidad existe: desde el primer año hay más demanda que capacidad. ' +
    'Segundo, la ventaja es la biblioteca de calibraciones, y la red la vende mientras sigue siendo exclusiva. ' +
    'Tercero, los tres planes se mueven con un mismo gatillo, la demanda sobre el 80% de la capacidad. ' +
    'Quedan dos preguntas: si el reglamento admitirá el kit y desde cuándo, y si el ahorro medido y la encuesta confirman los precios. ' +
    'Muchas gracias; quedamos atentos a sus preguntas.' },
  { d: 'cierre', quien: LUKAS, titulo: 'Cierre', texto: '', nota: 'Queda en pantalla mientras responden las preguntas.' },
];

// Diapositivas de apoyo: no se exponen; se muestran solo si una pregunta las pide.
const ANEXO = [
  { d: 'a-hipotesis', codigo: 'A1', titulo: 'Hipótesis de la investigación', apoyo: 'Las seis hipótesis con su prueba estadística (Tabla N° 3); significancia de 5%, resultados indicativos por la muestra por cuotas.' },
  { d: 'a-dudas', codigo: 'A2', titulo: 'Dudas del cliente y respaldo', apoyo: '¿Funciona?, ¿daña mi auto?, ¿pasa la revisión técnica?, ¿hay que enchufarlo? (Tabla N° 4) y los límites de la promesa.' },
  { d: 'a-mix', codigo: 'A3', titulo: 'Mezcla de marketing', apoyo: 'Las siete variables para el cliente final y para la red certificada (Tabla N° 8).' },
  { d: 'a-red', codigo: 'A4', titulo: 'Cobros a la red de talleres', apoyo: 'Paquete de entrada, kit con licencia, certificación anual y suscripción a Habilita (Tabla N° 7).' },
  { d: 'a-mercado', codigo: 'A5', titulo: 'Tamaño del mercado y adopción', apoyo: 'TAM, SAM y segmento laboral (Tabla N° 9) y la curva de Bass con su respaldo (Anexo N° 4).' },
  { d: 'a-perfiles', codigo: 'A6', titulo: 'Perfiles de cargo', apoyo: 'Dependencia y responsabilidad crítica de cada cargo (Tabla N° 13).' },
  { d: 'a-rentas', codigo: 'A7', titulo: 'Rentas, bonos y nómina', apoyo: 'Renta bruta mensual por cargo frente al mercado (Tabla N° 14), bono único por nivel validado (Tabla N° 15) y nómina por instalación de cada año (Tabla N° 16).' },
  { d: 'a-jornada', codigo: 'A8', titulo: 'Jornada de instalación', apoyo: 'Los siete bloques de la jornada de 8,4 horas y sus cuatro puntos de control (Anexo N° 8). El límite de capacidad son las horas de los dúos: un dinamómetro por local basta, incluso con seis dúos (Tabla N° 17).' },
  { d: 'a-inversion', codigo: 'A9', titulo: 'Inversión y gasto operacional', apoyo: 'Inversión en equipamiento por año (Tabla N° 18) y gasto operacional de la línea propia (Tabla N° 19).' },
  { d: 'a-sensibilidad', codigo: 'A10', titulo: 'Sensibilidad del resultado', apoyo: 'Resultado de la línea propia al quinto año con dólar, proporción de Plus y precio (Tabla N° 21).' },
  { d: 'a-gantt', codigo: 'A11', titulo: 'Carta Gantt detallada', apoyo: 'La Carta Gantt completa (Figura N° 5): preparación, entrada de cada dúo, calibración de modelos, preapertura y apertura de los talleres 2 y 3, y crecimiento de la red.' },
];

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;

module.exports = { PRINCIPAL, ANEXO, DIEGO, BENJA, LUKAS, palabras, segundos, PALABRAS_POR_MINUTO };
