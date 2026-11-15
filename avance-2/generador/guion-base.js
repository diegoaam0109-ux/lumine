// Guion de la Solemne 2 = Avance 2 del TIG (versión del equipo + láminas 05 a 08). Coherente con el informe del 15-11-2026.
// Cada lámina tiene el texto para decir (texto) y una nota breve (idea, evidencia, concepto y transición) que va al PowerPoint.
// Diego 1–8 y 15 (las láminas 5 a 8 solo se nombran), Benjamín 9–11, Lukas 12–14. Bajo el máximo de 15 minutos.
const DIEGO = 'Diego Alarcón', BENJA = 'Benjamín Torres', LUKAS = 'Lukas Verdugo';
const n = (d, quien, seccion, titulo, idea, evidencia, concepto, transicion, texto) => ({ d, quien, seccion, titulo, idea, evidencia, concepto, transicion, texto });
const PRINCIPAL = [
  n('portada', DIEGO, '1. Portada', 'Portada',
    'Presentamos cómo la estrategia se traduce en objetivos, indicadores, metas y decisiones.', 'Lumine todavía no vende.', 'Control de gestión.', 'Parto por el problema.',
    'Buenos días, profesor. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y presentamos el Avance 2 del TIG de Lumine Motors: cómo formulamos la estrategia, en qué ejes la ordenamos y cómo la llevamos a un mapa y a un cuadro de mando. Un detalle explica todo lo demás: Lumine todavía no vende, así que el tablero controla primero la preparación y después la operación.'),
  n('contexto', DIEGO, '2. Resumen ejecutivo', 'Usar el auto cuesta más y nadie lo cambia',
    'Quien trabaja con su auto paga más por kilómetro y no puede cambiarlo.', 'Bencina 93: $1.168,9 → $1.538,9; 3,5 usados por nuevo.', 'Necesidad del cliente.', '¿Por qué nadie lo ofrece? Por una razón legal.',
    'En marzo, la bencina 93 en Santiago pasó de $1.168,9 a $1.538,9 el litro. Y la gente no cambia el auto: se transfirieron 3,5 usados por cada nuevo inscrito. Quien trabaja con su auto, un taxista o un conductor de aplicación, paga más por cada kilómetro y no tiene el capital para cambiarlo. Lumine hibrida el auto que el cliente ya tiene, sin tocar el motor. ¿Por qué nadie lo ofrece todavía? Por una razón legal.'),
  n('via', DIEGO, '4.1 Vía regulatoria y escenarios', 'Sin norma propia no se vende',
    'Separamos lo que depende de Lumine (P1) de lo que no (la norma).', 'Según el 3CV, el reglamento en trámite no alcanza al kit; la vía es el proyecto experimental (D.S. N° 67). E1 es supuesto de planificación.', 'Condición externa y escenarios.', 'Con esa vía, ¿qué ofrecemos?',
    'La Ley 21.793 autoriza talleres de transformación y «otras adaptaciones», pero el secretario técnico del 3CV nos explicó que el reglamento en trámite solo regula la conversión a eléctrico. La vía disponible es un proyecto experimental bajo el Decreto 67: permite circular y medir, pero no vender, y sus resultados son el antecedente para una norma propia. Aquí está la decisión de control más importante: separamos lo que depende de nosotros, el proyecto experimental, que medimos en P1, de lo que no, la norma. Planificamos sobre E1, con apertura en enero de 2028, y tenemos contingencia para los otros 3 escenarios.'),
  n('lienzo', DIEGO, '4.2 Solución y propuesta de valor', 'Cada frustración tiene su aliviador',
    'El aliviador más fuerte es que el kit no reemplaza el auto.', 'Investigación del equipo: 196 encuestas válidas, 5 expertos, 5 clientes. Al1 es el techo de ingeniería (20%); la mediana simulada es 14,5% y 18%.', 'Lienzo de propuesta de valor (Osterwalder et al., 2014).', 'Eso se declara en misión y visión.',
    'Esta es la propuesta de valor, construida con nuestra investigación. Cada frustración apunta a un aliviador. La más fuerte es que el conductor no tiene capital para cambiar de auto, y la respuesta es que no lo cambia. Teme perder el seguro, y le damos respaldo formal. No sabe cuánto ahorraría, y le entregamos el ahorro medido en su propio auto. El 20% es el techo de ingeniería; al cotizar informamos el mínimo del intervalo simulado. Y la investigación mostró un límite: el ahorro paga el kit solo con muchos kilómetros.'),
  n('identidad', DIEGO, '5. Declaraciones estratégicas', 'Misión y visión',
    'Se nombra al pasar: qué hacemos y hacia dónde vamos.', 'Visión 2032: 2.934 instalaciones acumuladas y 16 talleres en la red.', 'Misión, visión y fines.', 'Sigo con el diagnóstico.',
    'En corto, nuestras declaraciones: la misión es reducir el combustible por kilómetro del auto que el cliente ya tiene, y la visión pone la meta en 2032, que Benjamín cuantifica en la estrategia.'),
  n('entorno', DIEGO, '6.1 Entorno, oportunidades y amenazas', 'Hay oportunidades, pero hoy no las aprovechamos',
    'Se nombra al pasar: entorno desfavorable y respuesta débil.', 'PEST 2,82; MEFE 2,03, bajo 2,5.', 'PEST y MEFE (David, 1997).', 'La industria.',
    'El diagnóstico, rápido: el entorno es moderadamente desfavorable, con un PEST de 2,82, y la matriz externa da 2,03, bajo el promedio de 2,5. Hay oportunidades, pero todavía no respondemos a ellas.'),
  n('porter', DIEGO, '6.2 Cinco fuerzas', 'La inercia no es un sustituto',
    'Se nombra al pasar: el rival es la inercia.', 'Intensidad media: 3,14.', 'Cinco fuerzas (Porter, 2008).', 'Los cruces.',
    'En la industria, la intensidad es media, 3,14, y el rival principal no es otro producto, sino la inercia del conductor de no tocar su auto.'),
  n('cruces', DIEGO, '6.4 Cruces del FODA', 'Hoy, primero DO y DA',
    'Se nombra al pasar: hoy van primero las estrategias defensivas.', 'MEFE 2,03 y MEFI 2,32, bajo 2,5.', 'Cruces del FODA (David, 1997).', 'Benjamín formula la estrategia.',
    'Por eso, al cruzar el FODA, hoy van primero las estrategias DO y DA: medir el ahorro y preparar el expediente. Con este diagnóstico, Benjamín formula la estrategia.'),
  n('ova', BENJA, '7.1 y 7.2 Formulación', 'Objetivo, ventaja y alcance',
    'Diferenciación enfocada que compite con evidencia.', 'Objetivo: 2.934 instalaciones y 16 talleres en 2032. Ventaja: evidencia. Alcance: 73.908 vehículos. Kit = 81% a 84% del precio neto.', 'Declaración de estrategia (Kaplan y Norton, 2008; Collis y Rukstad, 2008).', 'Tres brechas separan a Lumine del objetivo.',
    'Gracias, Diego. Para formular la estrategia usamos la declaración de Kaplan y Norton, que retoman a Collis y Rukstad: objetivo, ventaja y alcance. El objetivo es llegar en 2032 a 2.934 instalaciones con ahorro verificado y a 16 talleres, con un retorno superior al costo del capital. En la ventaja descartamos el precio, porque el kit cuesta entre el 81% y el 84% del precio neto. Competimos con evidencia: el mismo auto, con un ahorro medido y una calibración para su modelo. El alcance son 73.908 taxis, colectivos y autos de aplicación de jornada completa en la Región Metropolitana.'),
  n('ejes', BENJA, '7.3 Ejes estratégicos', 'Tres brechas, tres ejes',
    'Cada eje cierra una brecha y tiene un indicador que avisa primero.', 'Legal → P1, P2, P6; comercial → C4, P6; conocimiento → A1 a A4, P4, P5, C2, F3. Base común: P3, C1, C3, F2, F1.', 'Temas estratégicos (Kaplan y Norton, 2008).', 'El mapa.',
    'Entre la Lumine de hoy y ese objetivo hay 3 brechas, y cada una es un eje. La legal, sin norma ni par autorizado no hay venta, es el eje de habilitación formal. La comercial, la inercia del conductor y su capacidad de pago, es el eje de acceso comercial. La de conocimiento, porque el ahorro todavía no está medido, es el eje de conocimiento y escala. Cada eje tiene un indicador que avisa primero: la solicitud del proyecto experimental, la conversión de cotizaciones y el protocolo de medición. Los 8 objetivos de eje se convierten en 17 objetivos del cuadro de mando, y así se conectan.'),
  n('mapa', BENJA, '9.1 Mapa estratégico', '17 objetivos, 21 relaciones',
    'El mapa muestra la lógica causal; cada columna es un eje.', '7 habilitantes, 2 externas (la norma propia, fuera de las columnas) y 12 hipótesis. Todo el aprendizaje es del eje 3 y se ubica bajo el proceso que habilita.', 'Mapa estratégico (Kaplan y Norton, 2008).', 'Lukas muestra cómo se mide.',
    'El mapa se lee de abajo hacia arriba y cada columna es un eje. Todo el aprendizaje pertenece al eje 3, pero cada objetivo está bajo el proceso que habilita. En el eje 1, el proyecto experimental lleva al taller y al par autorizados, eso permite una instalación segura, y la instalación cumple la promesa técnica. La norma propia está fuera de las columnas, con borde discontinuo: es la condición externa. En el eje 3, el protocolo permite medir y la medición verifica la promesa de ahorro. Las promesas generan confianza, la confianza capta clientes, y la captación crea valor solo si el margen es positivo. De las 21 relaciones, 12 son hipótesis que el tablero tiene que comprobar. Lukas les muestra cómo medimos cada objetivo.'),
  n('cmiA', LUKAS, '9.2 Indicadores · financiera y clientes', 'Cuadro de mando: financiera y clientes',
    'Cada indicador mide el resultado que nombra su objetivo.', 'F1 por etapa; F2: kit bajo $2.866.010 y $3.211.125; C2 80% provisional; complementarias de C4 y F3 siguen las 2.934 instalaciones y los 16 talleres.', 'Indicadores de resultado; meta provisional.', 'Procesos y aprendizaje.',
    'Gracias, Benjamín. El cuadro de mando le pone a cada objetivo un indicador, su cálculo, una meta y un responsable. F1 cambia según la etapa: antes de invertir decidimos con el VAN del plan, y en operación, con el retorno sobre el capital frente a su costo. F2 es el margen, y su primer dato no necesita operar: el kit tiene que cotizarse bajo $2.866.010 en la versión Esencial y bajo $3.211.125 en la Plus. En clientes, C1 es la promesa técnica, al 100%, y C2 la de ahorro: el 80% de los clientes debe ahorrar al menos el mínimo informado. El objetivo de la estrategia se sigue con las medidas complementarias de C4 y F3. Las metas en azul son provisionales.'),
  n('cmiB', LUKAS, '9.2 Indicadores · procesos y aprendizaje', 'Cuadro de mando: procesos y aprendizaje',
    'La base son hitos con fecha y controles al 100%.', 'P1: solicitud en el 1.er trimestre de 2027 (Gerencia General). P6: tres convenios antes de vender. A1: calibraciones protegidas.', 'Indicadores inductores e hitos.', '¿Cómo se lee el tablero?',
    'En procesos y aprendizaje están los inductores, lo que tiene que pasar antes de los resultados. Los hitos cumplen solo con un documento en una fecha. El más importante hoy es P1, el proyecto experimental: la solicitud va en el primer trimestre de 2027 y responde la Gerencia General. P6 exige 3 convenios antes de vender el primer auto. Los controles al 100% no tienen alerta: en P3, un 95% significa que un auto salió sin verificar. Y A1 exige proteger todas las calibraciones, porque esa biblioteca es lo que un competidor no puede copiar.'),
  n('tablero', LUKAS, '9.6 Estados y secuencia', 'Se enciende por etapas',
    'Lo que aún no corresponde medir no se pinta.', 'Cuatro etapas con condición de paso; P2 se activa en el proyecto experimental. 7 críticos, 5 hitos, 4 provisionales.', 'Ciclo de control; control diagnóstico e interactivo (Simons, 1995).', 'Diego cierra.',
    'Lumine no opera, así que no pintamos de rojo un tablero que todavía no se puede medir. Lo encendemos por etapas. Hoy estamos en la preparación: protocolo, Habilita, proyecto experimental, convenios y el VAN del plan. A la etapa siguiente se pasa solo con una condición: del proyecto experimental al taller propio, con el ahorro medido, el informe entregado, la norma vigente y el par autorizado. Si correspondía medir y falta el dato, es una alerta de gestión, no un cero. En términos de Simons, el tablero es control diagnóstico y el seguimiento de la norma, control interactivo. Diego cierra.'),
  n('cierre', DIEGO, 'Conclusiones del Avance 2', '¿Qué sigue?',
    'Lo que sigue es convertir el tablero en iniciativas (Avance 3).', 'Prioridad: preparar el proyecto experimental, aprobar el protocolo de medición y cotizar el kit.', 'Iniciativas y STRATEX.', 'Gracias.',
    'Gracias, Lukas. Nos quedamos con 3 ideas. La estrategia cabe en una frase: objetivo 2032, ventaja por evidencia y alcance en el alto kilometraje. Los ejes atacan brechas concretas: la legal, la comercial y la de conocimiento. Y el cuadro de mando separa lo que controlamos de lo que no. Lo inmediato es preparar el proyecto experimental, aprobar el protocolo de medición y cotizar formalmente el kit. En el Avance 3 vienen las iniciativas con su presupuesto y el STRATEX. Muchas gracias, quedamos atentos a sus preguntas.'),
];
const ANEXO = [
  { codigo: 'A1', d: 'a-contingencia', titulo: '¿Qué pasa si la norma no resulta en E1?', apoyo: 'Señal temprana, efecto en el CMI y respuesta (informe, anexo B).' },
  { codigo: 'A2', d: 'a-relaciones', titulo: 'Las 21 relaciones causa-efecto del mapa', apoyo: 'Mecanismo de cada relación (informe, anexo I).' },
  { codigo: 'A3', d: 'a-fichas', titulo: '¿Cómo es la ficha de un indicador?', apoyo: 'Fichas de C2 y P1 (informe, tablas 8 y 9).' },
  { codigo: 'A4', d: 'a-metas', titulo: 'Metas provisionales: fundamento y fecha', apoyo: 'Informe, Tabla 6.' },
  { codigo: 'A5', d: 'a-canvas', titulo: 'Modelo de negocio (Canvas)', apoyo: 'Informe, anexo A.' },
];
const PALABRAS_POR_MINUTO = 130;
// Las cifras van escritas en números, pero el tiempo se calcula con lo que se dice en voz alta
// («2.934» son seis palabras: dos mil novecientas treinta y cuatro).
const decir = n => { // palabras para decir un entero
  if (n < 30) return 1;
  if (n < 100) return n % 10 ? 3 : 1;
  if (n < 1000) return 1 + (n % 100 ? decir(n % 100) : 0);
  if (n < 1e6) { const k = Math.floor(n / 1000), r = n % 1000; return (k === 1 ? 1 : decir(k) + 1) + (r ? decir(r) : 0); }
  const m = Math.floor(n / 1e6), r = n % 1e6; return decir(m) + 1 + (r ? decir(r) : 0);
};
const cifra = w => {
  const t = w.replace(/[.,;:»«)(¿?¡!]+$/, '').replace(/^[«(¿¡]+/, '');
  const m = t.match(/^(\$)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(%)?$/);
  if (!m) return 1;
  let k = (m[1] ? 1 : 0) + decir(Number(m[2].replace(/\./g, ''))) + (m[4] ? 2 : 0);
  if (m[3]) k += 1 + (m[3][0] === '0' ? m[3].length : decir(Number(m[3])));
  return k;
};
const palabras = t => (t || '').split(/\s+/).filter(Boolean).reduce((a, w) => a + cifra(w), 0);
const segundos = t => Math.round(palabras(t) / PALABRAS_POR_MINUTO * 60 / 5) * 5;
const mmss = x => { const s = Math.round(x); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
module.exports = { PRINCIPAL, ANEXO, PREGUNTAS: [], TERMINOS: {}, DIEGO, BENJA, LUKAS, palabras, segundos, mmss, PALABRAS_POR_MINUTO };
if (require.main === module) {
  const por = {}; let tot = 0;
  PRINCIPAL.forEach((x, i) => { const w = palabras(x.texto); tot += w; por[x.quien] = (por[x.quien] || 0) + w; console.log(String(i + 1).padStart(2), x.d.padEnd(10), w, mmss(segundos(x.texto))); });
  Object.entries(por).forEach(([k, w]) => console.log(k, w, mmss(w / PALABRAS_POR_MINUTO * 60)));
  console.log('TOTAL', tot, mmss(tot / PALABRAS_POR_MINUTO * 60));
}
