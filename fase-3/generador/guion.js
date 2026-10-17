// Guion de la exposición: una sola fuente para GUION.md (guion-md.js) y las notas del orador (deck.js).
// `d` = clave de la diapositiva en deck.js; el orden de este arreglo es el orden de la presentación.
// Todas las cifras salen del informe de la Fase 3 (Capítulo III); lo que falta se dice «por confirmar».
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';

const PRINCIPAL = [
  { d: 'portada', quien: DIEGO, titulo: 'Portada', texto:
    'Buenos días. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y les presentamos el capítulo tres de Lumine Motors: los planes de marketing, recursos humanos y operaciones. ' +
    'Los tres comparten un mismo gatillo, así que un cambio en la demanda mueve el plan completo. ' +
    'Yo parto con los objetivos y el mercado, Benjamín sigue con la estrategia comercial y Lukas cierra con las personas y las operaciones.' },
  { d: 'objetivos', quien: DIEGO, titulo: '299 vehículos el primer año', texto:
    'El objetivo general es que en cinco años Lumine sea la referencia de la hibridación de posventa en Chile, con tres talleres propios en la Región Metropolitana y una red certificada en todas las regiones. ' +
    'Las metas del primer año siguen al cliente: instalar al menos 299 vehículos, publicar tres casos con ahorro medido en nueve meses, llegar a 80% de clientes satisfechos y a 15% de clientes por recomendación. ' +
    'La meta de cotizaciones está por confirmar, porque depende de la tasa de conversión que mida la investigación.' },
  { d: 'segmentacion', quien: DIEGO, titulo: 'El cliente se define por su auto', texto:
    '¿A quién le vendemos? El cliente no se define por su edad, su ingreso ni la antigüedad de su auto, sino por tener un vehículo compatible: liviano, a combustión y con tracción delantera, porque el kit va en el eje trasero. ' +
    'De las cuatro variables, la decisiva es la conductual: la intensidad y el tipo de uso fijan en cuánto tiempo el ahorro paga la inversión. ' +
    'Por eso entramos por el uso laboral de alta intensidad: colectivos, taxis y aplicaciones.' },
  { d: 'investigacion', quien: DIEGO, titulo: 'Seis hipótesis por probar', texto:
    'Nada de esto se le ha preguntado aún a un conductor, así que la investigación es mixta y secuencial: primero entrevistas a cuatro expertos y a cinco perfiles de clientes, después una encuesta por cuotas a 150 personas, con 100 como mínimo. ' +
    'Una muestra aleatoria exigiría 385 casos, así que los resultados serán indicativos. ' +
    'Pone a prueba seis hipótesis; por ejemplo, que la barrera principal es la confianza y no el precio. Hasta ahora hicimos la entrevista exploratoria; el resto está por realizar.' },
  { d: 'ansoff', quien: DIEGO, titulo: 'Entra por desarrollo de producto', texto:
    'En la matriz de Ansoff, Lumine entra por desarrollo de producto: el mercado existe, porque los conductores ya buscan gastar menos, pero la hibridación aditiva no tiene oferta en Chile. ' +
    'En el año 2 viene la penetración y, antes de lo habitual, la diversificación relacionada: vender patrones de calibración, kits y certificación a otros talleres, porque la exclusividad de la calibración se agota con el tiempo. ' +
    'En el año 3 llega el desarrollo de mercado, con flotas y regiones. Le paso la palabra a Benjamín.' },

  { d: 'posicionamiento', quien: BENJA, titulo: 'El espacio vacío', texto:
    'Gracias, Diego. Este mapa ordena las alternativas por inversión y por lo que exigen al conductor. ' +
    'El híbrido usado y el eléctrico nuevo obligan a cambiar de auto y cuestan sobre 9 millones. La conversión a gas es barata, pero tiene límite de antigüedad. No hacer nada no cuesta, pero tampoco ahorra. ' +
    'Lumine queda sola en el espacio vacío: gastar menos sin cambiar de auto y sin límite de antigüedad. ' +
    'El concepto: el mismo auto, ahora híbrido.' },
  { d: 'precio', quien: BENJA, titulo: 'Plus cuesta 16% más y ahorra 24% más', texto:
    'En el mix de marketing, el cliente conoce su ahorro antes de pagar y lo comprueba después. ' +
    'El kit tiene dos versiones. Esencial cuesta 4.290.000 pesos con IVA y promete hasta 15% menos bencina; Plus cuesta 4.990.000 y hasta 20%. ' +
    'Plus vale 16% más, pero ahorra 24% más al colectivo, así que cada punto de ahorro sale más barato, y el colectivo recupera la inversión en 34 meses. ' +
    'Son precios de referencia que la encuesta debe validar.' },
  { d: 'demanda', quien: BENJA, titulo: 'Más demanda que capacidad', texto:
    'El segmento laboral de la Región Metropolitana suma 162.780 vehículos. Con el modelo de Bass, la adopción llega a 11,1% al quinto año, por debajo del 16% de los primeros adoptantes. ' +
    'Pero el pronóstico es el menor entre demanda y capacidad, y desde el primer año la demanda atendible supera lo que podemos instalar: 299 vehículos el primer año y 2.851 al quinto. ' +
    'Lo que no alcanzamos a instalar lo atiende la red: 7.773 kits al quinto año.' },
  { d: 'presupuesto-mkt', quien: BENJA, titulo: '80,9 millones el primer año', texto:
    'El presupuesto de marketing se arma por objetivo y tarea, no como un porcentaje de ventas que aún no existen. ' +
    'El primer año invierte 80,9 millones de pesos, el 6,8% de los ingresos propios, porque concentra el lanzamiento y 25 clientes piloto con 50% de descuento a cambio de su caso medido. ' +
    'Desde el segundo año baja a 2,3% de los ingresos, y desde el tercero la partida mayor son las comisiones, que siguen a las instalaciones. ' +
    'En cinco años, el marketing suma 575 millones.' },
  { d: 'estructura', quien: BENJA, titulo: 'Crece el número, no la estructura', texto:
    'Para atender esa demanda, la estructura es funcional y sin mandos intermedios: cinco áreas que responden a la Gerencia General. ' +
    'La estructura no cambia con el crecimiento; cambia cuántas personas hay en cada cargo, y nadie se contrata antes de que la carga lo justifique. ' +
    'Ingeniería de Calibración depende de la Gerencia y no del taller, porque la biblioteca sostiene la ventaja. ' +
    'Así el equipo pasa de 13 personas al cierre del primer año a 56 al quinto, y casi dos de cada tres son técnicos. Lukas sigue con las personas y las operaciones.' },

  { d: 'rrhh', quien: LUKAS, titulo: 'Técnicos formados en casa, costo a la mitad', texto:
    'Gracias, Benjamín. El oficio escasea en Chile, así que los técnicos se forman en casa con Lumine Habilita: 39 competencias, cuatro niveles y 392 horas. ' +
    'Con formación intensiva, un técnico nuevo llega al nivel 4 en unos ocho meses. ' +
    'La nómina sube de 152 a 755 millones en cinco años, pero el costo por instalación cae a la mitad, de 508 mil pesos a 253 mil en el cuarto año, porque los cargos fijos se reparten en más autos.' },
  { d: 'flujo', quien: LUKAS, titulo: 'El cliente decide', texto:
    'El flujo sigue a un vehículo desde la cotización hasta el fin de vida de la batería, en cinco etapas. ' +
    'Una regla lo atraviesa: el negocio mide y recomienda, pero la decisión de instalar es siempre del cliente. Solo se detiene por razones técnicas. ' +
    'La instalación toma una jornada de 8,4 horas con cuatro puntos de control, y el límite de capacidad son las horas de los dúos: un dinamómetro por local alcanza incluso para seis dúos.' },
  { d: 'gantt', quien: LUKAS, titulo: 'Abrir en enero de 2027', texto:
    'La Carta Gantt apunta a abrir en enero de 2027. En los tres meses previos se homologa el primer modelo y se forma el primer dúo. ' +
    'Pero el eslabón crítico es externo: el reglamento de la Ley 21.793 sigue pendiente, y sin él no hay certificado ni venta legal. ' +
    'Los dúos entran según la demanda, del segundo en el mes 6 al sexto en el mes 20; el segundo taller abre en el mes 25, el tercero en el 49, y la red crece de 3 a 42 talleres.' },
  { d: 'presupuesto-ops', quien: LUKAS, titulo: 'Ganancia desde el año 2', texto:
    'Cada local con seis puestos requiere 81 millones de inversión, casi la mitad en el dinamómetro, y el kit explica más del 90% del gasto operacional. ' +
    'Con los tres presupuestos, la línea propia pierde 130 millones en el lanzamiento y gana desde el segundo año, hasta un margen de 7,7%. La red rinde cerca de 10%. ' +
    'El riesgo mayor es el dólar: un alza de 10% casi borra el resultado propio del quinto año.' },
  { d: 'conclusiones', quien: LUKAS, titulo: 'Un mismo gatillo', texto:
    'Para cerrar: los tres planes comparten un gatillo. Cuando la demanda supera el 80% de la capacidad, se suma un dúo, se contrata a una persona o se abre un taller. ' +
    'El primer año prueba el producto con 299 instalaciones; el segundo y el tercero suman la red y el segundo taller; el cuarto y el quinto escalan a tres talleres, 42 certificados y 56 personas. ' +
    'Quedan tres condiciones abiertas: el reglamento, el ahorro real y los precios que mida la encuesta.' },
  { d: 'cierre', quien: LUKAS, titulo: 'Cierre', texto:
    'Muchas gracias. Quedamos atentos a sus preguntas.' },
];

// Diapositivas de apoyo: no se exponen; se muestran solo si una pregunta las pide.
const ANEXO = [
  { d: 'a-hipotesis', codigo: 'A1', titulo: 'Hipótesis de la investigación', apoyo: 'Las seis hipótesis con su prueba estadística (Tabla N° 3); significancia de 5%, resultados indicativos por la muestra por cuotas.' },
  { d: 'a-dudas', codigo: 'A2', titulo: 'Dudas del cliente y respaldo', apoyo: '¿Funciona?, ¿daña mi auto?, ¿pasa la revisión técnica?, ¿hay que enchufarlo? (Tabla N° 4) y los límites de la promesa.' },
  { d: 'a-mix', codigo: 'A3', titulo: 'Mezcla de marketing', apoyo: 'Las siete variables para el cliente final y para la red certificada (Tabla N° 8).' },
  { d: 'a-red', codigo: 'A4', titulo: 'Cobros a la red de talleres', apoyo: 'Paquete de entrada, kit con licencia, certificación anual y suscripción a Habilita (Tabla N° 7).' },
  { d: 'a-mercado', codigo: 'A5', titulo: 'Tamaño del mercado y adopción', apoyo: 'TAM, SAM y segmento laboral (Tabla N° 9) y la curva de Bass con su respaldo (Anexo N° 4).' },
  { d: 'a-perfiles', codigo: 'A6', titulo: 'Perfiles de cargo', apoyo: 'Dependencia y responsabilidad crítica de cada cargo (Tabla N° 13).' },
  { d: 'a-rentas', codigo: 'A7', titulo: 'Rentas y bonos por nivel', apoyo: 'Renta bruta mensual por cargo frente al mercado (Tabla N° 14) y bono único por nivel validado (Tabla N° 15).' },
  { d: 'a-jornada', codigo: 'A8', titulo: 'Jornada de instalación', apoyo: 'Los siete bloques de la jornada de 8,4 horas y sus cuatro puntos de control (Anexo N° 8).' },
  { d: 'a-inversion', codigo: 'A9', titulo: 'Inversión y gasto operacional', apoyo: 'Inversión en equipamiento por año (Tabla N° 18) y gasto operacional de la línea propia (Tabla N° 19).' },
  { d: 'a-sensibilidad', codigo: 'A10', titulo: 'Sensibilidad del resultado', apoyo: 'Resultado de la línea propia al quinto año con dólar, proporción de Plus y precio (Tabla N° 21).' },
];

const PALABRAS_POR_MINUTO = 130;
const palabras = t => t.split(/\s+/).filter(Boolean).length;
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;

module.exports = { PRINCIPAL, ANEXO, DIEGO, BENJA, LUKAS, palabras, segundos, PALABRAS_POR_MINUTO };
