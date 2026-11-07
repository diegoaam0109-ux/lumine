/* =====================================================================
   Lumine Habilita · lecciones (aprendizaje activo)
   Cada módulo se divide en lecciones de 3 a 5 minutos con un resultado
   medible (alineamiento constructivo). Cada lección sigue el ciclo
   problema → concepto → hacerlo tú → cierre (primeros principios de Merrill).
   Todo ejercicio con 'id' entra al repaso espaciado de su competencia 'c'.

   Fuentes: cada concepto y ejercicio cita una entrada de FUENTES_CONT, con
   su estado (ver ESTADO_FUENTE). Base: el informe «Fuentes para Lumine
   Habilita» (reports/). Una cláusula sin leer se marca como tal.

   Tipos de paso:
     situacion  problema real del taller con el que parte la lección
     revelar    tarjetas que se abren una a una (concepto en partes)
     concepto   una idea con su fuente
     elegir     alternativas + "¿qué tan seguro estás?"
     ordenar    secuencia que se arrastra (o se mueve con flechas)
     emparejar  unir cada elemento con su pareja
     tocar      tocar la pieza correcta en el plano del kit
     decidir    caso con decisiones encadenadas y consecuencias
     rapido     varias afirmaciones seguidas: una de dos respuestas
     cierre     qué te llevas y cómo se usa en el taller
   ===================================================================== */
'use strict';

const FUENTES_CONT = {
  en50110: { t:'EN 50110-1:2023, Operación de instalaciones eléctricas. Cláusula 6.2: trabajo sin tensión (las cinco reglas)', org:'CENELEC', tipo:'Norma', ed:'2023', estado:'catalogo', nota:'Edición y cláusula confirmadas en el índice oficial. La redacción exacta de cada regla falta leerla en la norma (de pago; existe UNE-EN 50110-1 en español).', url:'https://knowledge.bsigroup.com/products/bs-en-50110-1-2023-expert-commentary' },
  dguv209: { t:'DGUV Information 209-093: Calificación para trabajos en vehículos con sistemas de alta tensión', org:'DGUV (Alemania)', tipo:'Guía oficial', ed:'2021', estado:'catalogo', nota:'Gratuita, con versión oficial en inglés. Falta leer el texto completo de cada nivel.', url:'https://publikationen.dguv.de/widgets/pdf/download/article/3982' },
  iec60903: { t:'IEC 60903:2014, Trabajos en tensión. Guantes de material aislante', org:'IEC', tipo:'Norma', ed:'2014 (Ed. 3.0)', estado:'catalogo', nota:'Edición confirmada en el catálogo de IEC. El intervalo de reensayo no está confirmado.', url:'https://webstore.iec.ch/publication/3871' },
  iec60900: { t:'IEC 60900:2018, Trabajos en tensión. Herramientas manuales hasta 1000 V CA y 1500 V CC', org:'IEC', tipo:'Norma', ed:'2018', estado:'catalogo', url:'https://online.standard.no/en/nek-iec-60900-2018' },
  verificar: { t:'NFPA 70E-2024, 120.6(7): prueba de ausencia de tensión con el instrumento probado antes y después en una fuente conocida', org:'NFPA (EE. UU.)', tipo:'Norma', ed:'2024', estado:'por-confirmar', nota:'La cláusula viene de una fuente secundaria (documento técnico de un fabricante). Falta leerla en la norma.', url:null },
  lfp: { t:'NTSB SR-20/01: Riesgos para equipos de emergencia en incendios de baterías de ion-litio de vehículos eléctricos', org:'NTSB (EE. UU.)', tipo:'Informe oficial', ed:'2020', estado:'catalogo', nota:'Informe gratuito: energía remanente y reignición después de apagado.', url:'https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf' },
  fase3: { t:'Informe Fase 3, Lumine Motors (Plan de operaciones y RR.HH.)', org:'Lumine Motors', tipo:'Informe propio', ed:'2026', estado:'verificada', url:null }
};
/* estados: verificada (leída en el documento original) · catalogo (título y edición confirmados en un catálogo oficial;
   la cláusula o la redacción falta leerla) · por-confirmar (viene de una fuente secundaria o no se ha podido revisar) */
const ESTADO_FUENTE = { verificada:['Verificada','ok'], catalogo:['Edición confirmada','info'], 'por-confirmar':['Por confirmar','warn'] };

/* Plano del kit (vista lateral) para los ejercicios de tocar. Mismo dibujo de la página comercial. */
const PLANO_ZONAS = {
  motor:   { l:'Motor original', d:'Intacto, con su tracción delantera.', x:326, y:236, w:104, h:54 },
  control: { l:'Unidad de control', d:'Decide cuándo asistir y corta ante fallas.', x:516, y:248, w:72, h:44 },
  bateria: { l:'Banco de baterías', d:'Guarda la energía de alta tensión.', x:636, y:276, w:210, h:48 },
  cable:   { l:'Cable de alta tensión', d:'Naranjo: siempre alta tensión.', x:844, y:292, w:44, h:34 },
  electrico: { l:'Motor eléctrico', d:'En el eje trasero.', x:880, y:296, w:100, h:48 }
};

const LECCIONES = {
  'N1-1': [
    { id:'N1-1-a', t:'Tres riesgos que no avisan', c:['C01'], min:4,
      resultado:'Distinguir el choque eléctrico, el arco y el incendio de batería, y reconocer que ninguno avisa antes.',
      pasos:[
        { k:'situacion', t:'Llega un híbrido después de un choque leve', x:'No hay humo, no hay ruido y el tablero está apagado. Tu compañero dice: "está muerto, no hay peligro". Antes de seguir, piensa si estás de acuerdo. Al final de la lección lo vas a comprobar.', visual:'plano' },
        { k:'revelar', t:'Los tres riesgos de la alta tensión', d:'Toca cada tarjeta para abrirla.', f:'dguv209', tarjetas:[
          { t:'Choque eléctrico', ic:'bolt', x:'La corriente pasa por el cuerpo. En alta tensión basta un contacto para una lesión grave, y no se ve ni se escucha antes.' },
          { t:'Arco eléctrico', ic:'flame', x:'Una descarga a través del aire que quema y proyecta metal fundido, incluso sin tocar el conductor.' },
          { t:'Incendio de batería', ic:'battery', x:'Una celda dañada puede calentarse sola y volver a encenderse horas después de que parece apagada.' } ] },
        { k:'emparejar', id:'N1-1-a-1', c:'C01', q:'Une cada riesgo con cómo daña', f:'dguv209', pares:[
          ['Choque eléctrico', 'La corriente pasa por el cuerpo'],
          ['Arco eléctrico', 'Quema sin tocar el conductor'],
          ['Incendio de batería', 'Puede reencenderse horas después'] ],
          x:'Los tres se previenen igual: sin energía, con el equipo correcto y con alguien vigilando.' },
        { k:'elegir', id:'N1-1-a-2', c:'C01', q:'¿Cuál de estos riesgos puede lesionar a alguien aunque no toque el conductor?', f:'dguv209',
          o:['El arco eléctrico','La caída de tensión en la batería de 12 V','La humedad del piso','El ruido del compresor'], a:0,
          x:'El arco se produce a través del aire: quema y proyecta metal a distancia.' },
        { k:'tocar', id:'N1-1-a-3', c:'C01', q:'Toca la pieza que guarda la energía de alta tensión', zona:'bateria', f:'fase3',
          x:'El banco de baterías guarda la energía aunque el auto esté apagado. Por eso "apagado" no significa "sin tensión".' },
        { k:'elegir', id:'N1-1-a-4', c:'C01', q:'Un banco de baterías golpeado no muestra humo ni olor. ¿Qué riesgo sigue presente?', f:'lfp',
          o:['Ninguno si no hay humo','Que una celda dañada se caliente sola y se encienda horas después','Solo el de ensuciarse con electrolito','Que se descargue más rápido'], a:1,
          x:'El daño interno de una celda puede no notarse por horas. Una batería golpeada se trata como peligrosa hasta que se evalúa.' },
        { k:'cierre', t:'Tu compañero no tenía razón', puntos:['Sin humo ni ruido, los tres riesgos siguen ahí.','"Apagado" no es "sin tensión": la batería guarda energía.','Nadie toca alta tensión sin cortar, bloquear y verificar.'],
          taller:'Ante un auto chocado, primero se trata la batería como peligrosa y se avisa al encargado de seguridad del duo.' }
      ] },

    { id:'N1-1-b', t:'Las cinco reglas de oro', c:['C02'], min:5,
      resultado:'Aplicar en orden las cinco reglas antes de intervenir alta tensión y explicar por qué el orden importa.',
      pasos:[
        { k:'situacion', t:'Hay que soltar un conector del banco de baterías', x:'Tu duo va a intervenir la alta tensión. El auto está en el elevador y la llave afuera. ¿Qué haces primero, y qué viene después?', visual:'plano' },
        { k:'concepto', t:'Cinco reglas, siempre en el mismo orden', f:'en50110', puntos:[
          'Cortar: separar todas las fuentes de energía.',
          'Bloquear y etiquetar: que nadie pueda volver a conectar.',
          'Verificar ausencia de tensión: con instrumento, nunca a ojo.',
          'Poner a tierra: cuando el procedimiento lo exige.',
          'Señalizar: delimitar la zona para que nadie entre sin saber.' ],
          nota:'El orden no es un detalle: verificar antes de bloquear no sirve, porque alguien podría reconectar después de tu medición.' },
        { k:'ordenar', id:'N1-1-b-1', c:'C02', q:'Ordena las reglas como se aplican', f:'en50110',
          items:['Cortar','Bloquear y etiquetar','Verificar ausencia de tensión','Poner a tierra','Señalizar'],
          x:'Cortar, bloquear, verificar, poner a tierra y señalizar. Sin cortar y bloquear antes, la verificación no protege a nadie.' },
        { k:'elegir', id:'N1-1-b-2', c:'C02', q:'Cortaste la energía y bloqueaste el interruptor. ¿Qué viene antes de tocar un conductor?', f:'en50110',
          o:['Poner a tierra y señalizar','Verificar ausencia de tensión con instrumento','Pedir al compañero que mire el tablero','Nada, ya está desconectado'], a:1,
          x:'Después de cortar y bloquear se verifica con instrumento. El tablero o la palabra de alguien no reemplazan la medición.' },
        { k:'decidir', id:'N1-1-b-3', c:'C02', f:'en50110', inicio:'a', nodos:{
          a:{ t:'Tu compañero cortó la energía y va directo a soltar el conector. Nadie ha medido todavía.', op:[
            { l:'Lo detengo y pido verificar con instrumento', ok:true, ir:'b', x:'Bien: sin verificación nadie toca.' },
            { l:'Lo dejo: él sabe lo que hace', ok:false, ir:'fin', x:'Si quedó tensión, la lesión no se puede deshacer. La experiencia no reemplaza la medición.' } ] },
          b:{ t:'Te responde: "ya lo desconecté yo, no hace falta medir".', op:[
            { l:'Insisto: se bloquea, se etiqueta y se mide', ok:true, ir:'fin', x:'Correcto. Que la misma persona desconecte no prueba que no haya tensión: puede quedar energía o alguien puede reconectar.' },
            { l:'Le creo y seguimos', ok:false, ir:'fin', x:'Desconectar no es verificar. Las reglas existen justo para no depender de la memoria de nadie.' } ] } } },
        { k:'elegir', id:'N1-1-b-4', c:'C02', q:'¿Por qué se bloquea y etiqueta el punto de corte?', f:'en50110',
          o:['Para que el auto quede más ordenado','Para que nadie vuelva a conectar mientras se trabaja','Porque lo pide el seguro del taller','Para saber cuánto duró el trabajo'], a:1,
          x:'Bloquear y etiquetar evita que otra persona reconecte sin saber que hay alguien trabajando.' },
        { k:'cierre', t:'El orden es la protección', puntos:['Cortar, bloquear, verificar, poner a tierra y señalizar.','Verificar sin haber bloqueado no protege.','Si alguien se salta un paso, se detiene el trabajo.'],
          taller:'Antes de cada intervención en alta tensión, el duo recorre las cinco reglas en voz alta. El encargado de seguridad confirma cada una.' }
      ] },

    { id:'N1-1-c', t:'Verificar con instrumento', c:['C02'], min:4,
      resultado:'Verificar ausencia de tensión probando el instrumento antes y después de medir.',
      pasos:[
        { k:'situacion', t:'El instrumento marca 0 V', x:'Mediste el conector y el instrumento marca cero. ¿Ya puedes tocarlo? Piensa qué pasaría si el instrumento estuviera fallando.' },
        { k:'revelar', t:'Probar, medir y volver a probar', d:'Toca cada paso.', f:'verificar', tarjetas:[
          { t:'1. Probar', ic:'check', x:'Antes de medir, prueba el instrumento en una fuente con tensión conocida. Así sabes que funciona.' },
          { t:'2. Medir', ic:'gauge', x:'Mide en todos los puntos que indique el procedimiento, no solo en uno.' },
          { t:'3. Volver a probar', ic:'refresh', x:'Después de medir, prueba otra vez en la fuente conocida. Si ahora no marca, tu medición no vale.' } ] },
        { k:'ordenar', id:'N1-1-c-1', c:'C02', q:'Ordena la verificación', f:'verificar',
          items:['Probar el instrumento en una fuente conocida','Medir en todos los puntos del procedimiento','Volver a probar el instrumento'],
          x:'Un instrumento que falla marca cero aunque haya tensión. Probarlo antes y después es lo único que demuestra que el cero es real.' },
        { k:'elegir', id:'N1-1-c-2', c:'C02', q:'Al terminar de medir, el instrumento no marca en la fuente de prueba. ¿Qué significa?', f:'verificar',
          o:['Que no hay tensión en el auto','Que la medición anterior no vale y hay que repetirla con otro instrumento','Que la batería del auto está descargada','Que se puede seguir trabajando'], a:1,
          x:'Si el instrumento dejó de funcionar, no sabes en qué momento falló: la medición completa se repite con otro instrumento.' },
        { k:'rapido', id:'N1-1-c-3', c:'C02', q:'¿Vale la verificación?', f:'verificar', op:['Vale','No vale'], items:[
          { t:'Probé el instrumento antes y después, y medí en todos los puntos.', a:0, x:'Así se verifica.' },
          { t:'Medí en un solo punto porque los demás quedaban incómodos.', a:1, x:'Se mide en todos los puntos del procedimiento.' },
          { t:'El tablero del auto dice que el sistema está apagado.', a:1, x:'El tablero no es un instrumento de verificación.' },
          { t:'Probé el instrumento solo al final.', a:1, x:'Hay que probarlo antes y después.' } ] },
        { k:'cierre', t:'Un cero solo vale si el instrumento funciona', puntos:['Probar, medir y volver a probar.','Medir en todos los puntos.','Si el instrumento falla al final, se repite todo con otro.'],
          taller:'En la validación del nivel 1 el formador te va a pedir que digas en voz alta cada paso de la verificación.' }
      ] },

    { id:'N1-1-d', t:'El encargado de seguridad', c:['C05','C03'], min:5,
      resultado:'Actuar como encargado de seguridad del duo: vigilar, revisar el equipo y detener el trabajo cuando algo no calza.',
      pasos:[
        { k:'situacion', t:'Hoy eres el segundo del duo', x:'Tu compañero ejecuta y tú vigilas. En medio del trabajo ves algo que no te convence, pero él tiene más experiencia que tú. ¿Lo detienes?' },
        { k:'concepto', t:'Detener es su derecho y su deber', f:'dguv209', puntos:[
          'El encargado de seguridad vigila, corta la energía y detiene el trabajo si algo no calza.',
          'Necesita instrucción en alta tensión y en primeros auxilios.',
          'Una detención no se discute en el momento: se conversa después.' ] },
        { k:'rapido', id:'N1-1-d-1', c:'C05', q:'¿Detienes o sigues?', f:'dguv209', op:['Detener','Seguir'], items:[
          { t:'Tu compañero va a soltar un conector y nadie ha verificado ausencia de tensión.', a:0, x:'Sin verificación con instrumento no se toca nada.' },
          { t:'La zona está señalizada, la energía cortada y bloqueada, y se verificó con el instrumento probado antes y después.', a:1, x:'Se cumplieron las reglas: se trabaja, con vigilancia.' },
          { t:'Aparece olor a quemado cerca del banco de baterías.', a:0, x:'Cualquier señal de calentamiento detiene el trabajo y activa el procedimiento de emergencia.' },
          { t:'Tu compañero trabaja con un guante dieléctrico con un corte pequeño.', a:0, x:'Un guante dañado ya no aísla: se detiene y se cambia.' } ] },
        { k:'emparejar', id:'N1-1-d-2', c:'C03', q:'Une cada equipo con lo que exige', f:'iec60903', pares:[
          ['Guantes dieléctricos', 'Revisarlos antes de cada uso'],
          ['Herramientas aisladas', 'En toda la zona de alta tensión'],
          ['Procedimiento escrito', 'Paso a paso, sin reordenar'] ],
          x:'El equipo protege solo si está en buen estado y se usa como corresponde.' },
        { k:'elegir', id:'N1-1-d-3', c:'C05', q:'¿Quién puede ser encargado de seguridad del duo durante un trabajo en alta tensión?', f:'dguv209',
          o:['Cualquier persona que esté cerca','Solo el Responsable Técnico','Quien ejecuta el trabajo, mientras trabaja','El segundo integrante, con instrucción en alta tensión y primeros auxilios'], a:3,
          x:'Es el segundo integrante del duo, con la instrucción que corresponde. Quien ejecuta no puede vigilarse a sí mismo.' },
        { k:'tocar', id:'N1-1-d-4', c:'C05', q:'¿Qué indica siempre alta tensión? Tócalo en el plano', zona:'cable', f:'fase3',
          x:'Los cables de alta tensión son naranjos. Donde hay naranjo, aplican las cinco reglas.' },
        { k:'cierre', t:'Detenerse también es trabajar bien', puntos:['El encargado vigila, corta y detiene.','El equipo se revisa antes de cada uso.','Nadie discute una detención en el momento.'],
          taller:'En el duo, el nivel 1 parte siempre como encargado de seguridad. Es el primer rol que vas a validar.' }
      ] }
  ]
};

/* Catálogo de ítems de repaso: id → competencia */
const ITEM_COMP = (function(){
  const out = {};
  for(const mid of Object.keys(LECCIONES)) for(const l of LECCIONES[mid]) for(const p of l.pasos) if(p.id) out[p.id] = p.c;
  return out;
})();
/* id de ítem → { paso, leccion, modulo } */
const ITEM_PASO = (function(){
  const out = {};
  for(const mid of Object.keys(LECCIONES)) for(const l of LECCIONES[mid]) for(const p of l.pasos) if(p.id) out[p.id] = { paso:p, lid:l.id, mid };
  return out;
})();
const LECCION = (function(){ const out = {}; for(const mid of Object.keys(LECCIONES)) for(const l of LECCIONES[mid]) out[l.id] = Object.assign({ mid }, l); return out; })();
