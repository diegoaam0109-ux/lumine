/* =====================================================================
   Lumine Habilita · datos de demostración (FICTICIOS)
   Personas, fechas y resultados inventados para mostrar el sistema.
   No son datos medidos ni proyecciones. Sin montos: costos y bono
   quedan en blanco porque los fija finanzas.
   ===================================================================== */
'use strict';

/* Identificadores fijos del escenario de demostración. Las pruebas y el recorrido
   guiado los leen de aquí, así un cambio en el escenario no deja pruebas mintiendo. */
const DEMO_IDS = { sesionJT:'s_jt_felipe', felipe:'p_felipe', formadora:'u_camila', tecnico:'u_ignacio', postulante:'u_nuevo', rt:'u_rt', solicitante:'u_valentina' };
const DEMO_DIR = {
  u_rt:        { name:'Responsable Técnico', color:'#1f2326' },
  u_ic:        { name:'Ingeniería de Calibración', color:'#0A7AAD' },
  u_camila:    { name:'Camila Rojas', color:'#7c5cc4' },
  u_javiera:   { name:'Javiera Soto', color:'#b4541f' },
  u_matias:    { name:'Matías Fuentes', color:'#2e7d5b' },
  u_ignacio:   { name:'Ignacio Pérez', color:'#a33a5a' },
  u_tomas:     { name:'Tomás Herrera', color:'#5b6b2e' },
  u_valentina: { name:'Valentina Muñoz', color:'#1f6f8b' },
  u_nuevo:     { name:'Postulante nuevo', color:'#697177' }
};
const DEMO_ROLES = [
  { id:'visitante', viewer:{ level:'view', id:null }, n:'Visitante', d:'Sin sesión: portada, diccionario, laboratorio y taller.', ic:'eye', oculto:true },
  { id:'rt',        viewer:{ level:'owner',    id:'u_rt' },        n:'Responsable Técnico',                 d:'Administra personas, validaciones, duos, indicadores y ajustes.', ic:'settings' },
  { id:'ic',        viewer:{ level:'admin',    id:'u_ic' },        n:'Ingeniería de Calibración',           d:'Valida C25 y C26 del módulo 4 y ve el panel de administración.', ic:'bolt' },
  { id:'formador',  viewer:{ level:'interact', id:'u_camila' },    n:'Camila Rojas · formadora, nivel 4',   d:'Marca las estaciones internas que le asignan. No puede validar a su compañera de duo.', ic:'grad' },
  { id:'tecnico',   viewer:{ level:'interact', id:'u_ignacio' },   n:'Ignacio Pérez · técnico, nivel 2',    d:'Sigue su ruta, cursa módulos online y ve solo su propio expediente.', ic:'user' },
  { id:'postulante',viewer:{ level:'interact', id:'u_nuevo' },     n:'Postulante nuevo',                    d:'Registra antecedentes y rinde la prueba de fundamentos desde cero.', ic:'userPlus' },
  { id:'externo',   viewer:{ level:'owner',    id:'u_rt' },        n:'Evaluador externo',                   d:'Modo kiosco en un equipo de Lumine: solo estaciones de banco genérico, nada del kit.', ic:'shieldCheck', kiosk:true }
];

/* Cuentas de prueba de la demostración. Son ficticias y se muestran abiertas a propósito:
   el inicio de sesión de la demo simula el de producción, que vive en un servidor (ver PRODUCCION_AUTH). */
const DEMO_CUENTAS = [
  { u:'responsable', rol:'rt' },
  { u:'calibracion', rol:'ic' },
  { u:'formadora',   rol:'formador' },
  { u:'tecnico',     rol:'tecnico' }
];
const DEMO_CLAVE = 'demo1234';

function demoSeed(hoy){
  const d = n => addDays(hoy, n);
  const ts = n => { const x = parseISO(d(n)); x.setHours(10, 30, 0, 0); return x.toISOString(); };
  const docs = {};
  const put = (p, v) => { docs[p] = v; };

  const resp = (e, m, x) => { // aciertos por área (0 a 3)
    const r = {};
    const set = (ids, k) => ids.forEach((id, i) => { const q = FUNDAMENTOS.find(f => f.id === id); r[id] = i < k ? q.a : (q.a + 1) % q.o.length; });
    set(['E1','E2','E3'], e); set(['M1','M2','M3'], m); set(['X1','X2','X3'], x);
    return r;
  };
  const persona = (o) => Object.assign({
    etapa:'tecnico', uid:null, nivel:0, fechasNivel:{}, pauta:{}, historial:{}, suspendidoAT:false, salida:null,
    creado: ts(-440), actualizado: ts(-1), demo:true
  }, o);
  const jornada = (fecha, basico, estaciones, p) => {
    p.jornada = { fecha, basico: Object.assign({ electrica:'ok', mecanica:'ok', electronica:'ok' }, basico || {}), estaciones };
    for(const c of Object.keys(estaciones)) if(estaciones[c] === 's') p.pauta[c] = { r:'j', t:fecha };
  };
  let hseq = 0;
  const aprobar = (p, n, intentos) => {
    // intentos: [{f: díaRelativo, fall: [...]}], el último es el aprobado
    const skip = new Set(saltadas(p));
    const cods = COMP.filter(x => x.n === n && !skip.has(x.c)).map(x => x.c);
    intentos.forEach((it, i) => {
      const last = i === intentos.length - 1;
      const f = d(it.f);
      p.historial['h' + (++hseq)] = { tipo:'N' + n, intento:i + 1, fecha:f, aprobado:last, fallidas: last ? [] : it.fall, externa: cods.some(c => C[c].v === 'ext') };
      const evaluadas = i === 0 ? cods : intentos[i-1].fall;
      for(const c of evaluadas){
        const r = (!last && it.fall.includes(c)) ? 'n' : 's';
        p.pauta[c] = { r, t:f, n:i + 1 };
      }
    });
    p.nivel = Math.max(p.nivel, n);
    p.fechasNivel[n] = d(intentos[intentos.length - 1].f);
  };
  const intento = (p, n, f, fall) => { // intento reprobado sin aprobar aún
    const skip = new Set(saltadas(p));
    const cods = COMP.filter(x => x.n === n && !skip.has(x.c)).map(x => x.c);
    p.historial['h' + (++hseq)] = { tipo:'N' + n, intento:1, fecha:d(f), aprobado:false, fallidas:fall, externa:true };
    for(const c of cods) p.pauta[c] = { r: fall.includes(c) ? 'n' : 's', t:d(f), n:1 };
  };
  const revalidar = (p, f) => {
    p.historial['h' + (++hseq)] = { tipo:'REV', intento:1, fecha:d(f), aprobado:true, fallidas:[], externa:true };
    for(const c of CORE_SEG) if(C[c].n <= p.nivel) p.pauta[c] = { r:'s', t:d(f), n:1 };
  };
  const ant = (perfil, anos, formacion, certs, exps) => ({ perfil, anos, formacion, certificados: Object.fromEntries(certs.map(c => [c, true])), experiencias: Object.fromEntries(exps.map(c => [c, true])), notas:'' });

  /* ---- primera generación (ingreso hace ~14 meses) ---- */
  const camila = persona({ id:'p_camila', nombre:'Camila Rojas', perfil:'electromovilidad', uid:'u_camila', ingreso:d(-420),
    antecedentes: ant('electromovilidad', 3, 'Técnico en electromovilidad', ['at','pa'], ['C03','C09','C16','C19','C21']),
    fundamentos:{ respuestas: resp(3,2,3), fecha:d(-440) } });
  jornada(d(-432), {}, { C03:'s', C04:'s', C09:'s', C16:'s', C19:'s', C21:'n' }, camila);
  aprobar(camila, 1, [{ f:-385 }]); aprobar(camila, 2, [{ f:-300 }]); aprobar(camila, 3, [{ f:-205 }]); aprobar(camila, 4, [{ f:-62 }]);
  revalidar(camila, -20);

  const javiera = persona({ id:'p_javiera', nombre:'Javiera Soto', perfil:'electricista', uid:'u_javiera', ingreso:d(-420),
    antecedentes: ant('electricista', 9, 'Técnico electricista', ['sec','pa'], ['C03','C04','C16','C19','C21']),
    fundamentos:{ respuestas: resp(3,1,1), fecha:d(-441) } });
  jornada(d(-433), { mecanica:'nivelar' }, { C03:'s', C04:'s', C16:'s', C19:'s', C21:'s' }, javiera);
  aprobar(javiera, 1, [{ f:-375 }]); aprobar(javiera, 2, [{ f:-285 }]); aprobar(javiera, 3, [{ f:-150 }]);
  revalidar(javiera, -10);

  const matias = persona({ id:'p_matias', nombre:'Matías Fuentes', perfil:'mecanico', uid:'u_matias', ingreso:d(-420),
    antecedentes: ant('mecanico', 12, 'Técnico en mecánica automotriz', [], ['C08','C09','C12','C13','C17']),
    fundamentos:{ respuestas: resp(0,3,2), fecha:d(-439) } });
  jornada(d(-431), { electrica:'nivelar' }, { C04:'s', C08:'s', C09:'s', C12:'s', C13:'s', C17:'s', C27:'n' }, matias);
  aprobar(matias, 1, [{ f:-360 }]); aprobar(matias, 2, [{ f:-270, fall:['C19'] }, { f:-258 }]); aprobar(matias, 3, [{ f:-120 }]);

  const rodrigo = persona({ id:'p_rodrigo', nombre:'Rodrigo Castillo', perfil:'mecanico', uid:null, ingreso:d(-420),
    antecedentes: ant('mecanico', 7, 'Mecánico automotriz', [], ['C08','C13']),
    fundamentos:{ respuestas: resp(1,3,1), fecha:d(-440) } });
  jornada(d(-430), { electrica:'nivelar', electronica:'nivelar' }, { C04:'s', C08:'s', C09:'n', C12:'s', C13:'s', C17:'s', C27:'s' }, rodrigo);
  aprobar(rodrigo, 1, [{ f:-372, fall:['C02'] }, { f:-365 }]); aprobar(rodrigo, 2, [{ f:-275 }]); aprobar(rodrigo, 3, [{ f:-95 }]);
  rodrigo.etapa = 'salio'; rodrigo.salida = { fecha:d(-25), motivo:'Aceptó una oferta de otra empresa', nivel:3 };

  /* ---- segunda generación (ingreso hace ~6 meses) ---- */
  const ignacio = persona({ id:'p_ignacio', nombre:'Ignacio Pérez', perfil:'mecanico', uid:'u_ignacio', ingreso:d(-170),
    antecedentes: ant('mecanico', 6, 'Técnico en mecánica automotriz', [], ['C08','C09','C13','C27']),
    fundamentos:{ respuestas: resp(1,3,1), fecha:d(-186) } });
  jornada(d(-178), { electrica:'nivelar', electronica:'nivelar' }, { C04:'s', C08:'s', C09:'s', C12:'n', C13:'s', C17:'n', C27:'s' }, ignacio);
  aprobar(ignacio, 1, [{ f:-125 }]); aprobar(ignacio, 2, [{ f:-52, fall:['C24'] }, { f:-40 }]);

  const tomas = persona({ id:'p_tomas', nombre:'Tomás Herrera', perfil:'electricista', uid:'u_tomas', ingreso:d(-170),
    antecedentes: ant('electricista', 5, 'Electricista', ['sec'], ['C03','C16','C19']),
    fundamentos:{ respuestas: resp(3,1,2), fecha:d(-185) } });
  jornada(d(-176), { mecanica:'nivelar' }, { C03:'s', C04:'s', C16:'s', C19:'s', C21:'s' }, tomas);
  aprobar(tomas, 1, [{ f:-118 }]); aprobar(tomas, 2, [{ f:-30 }]);
  tomas.suspendidoAT = { desde:d(-12), registro:'r_inc1' };

  const valentina = persona({ id:'p_valentina', nombre:'Valentina Muñoz', perfil:'electromovilidad', uid:'u_valentina', ingreso:d(-170),
    antecedentes: ant('electromovilidad', 1, 'Técnico en electromovilidad', ['at'], ['C03','C09','C16']),
    fundamentos:{ respuestas: resp(3,2,3), fecha:d(-184) } });
  jornada(d(-175), {}, { C03:'s', C04:'s', C09:'s', C16:'s', C19:'n' }, valentina);
  aprobar(valentina, 1, [{ f:-135 }]);
  intento(valentina, 2, -18, ['C19','C24']);

  /* ---- postulantes tipo del informe 4 ---- */
  const andres = persona({ id:'p_andres', nombre:'Andrés Contreras', perfil:'mecanico', etapa:'postulante', ingreso:null, creado:ts(-9),
    antecedentes: ant('mecanico', 8, 'Técnico en mecánica automotriz', [], ['C08','C09','C13']),
    fundamentos:{ respuestas: resp(1,3,1), fecha:d(-8) } });
  jornada(d(-3), { electrica:'nivelar', electronica:'nivelar' }, { C04:'n', C08:'s', C09:'s', C12:'n', C13:'s', C17:'s', C27:'s' }, andres);

  const daniela = persona({ id:'p_daniela', nombre:'Daniela Vergara', perfil:'electricista', etapa:'postulante', ingreso:null, creado:ts(-8),
    antecedentes: ant('electricista', 10, 'Técnico electricista', ['sec','pa'], ['C03','C04','C16','C19','C21']),
    fundamentos:{ respuestas: resp(3,1,1), fecha:d(-7) } });
  jornada(d(-2), { mecanica:'nivelar', electronica:'nivelar' }, { C03:'s', C04:'s', C16:'s', C19:'s', C21:'n' }, daniela);

  const felipe = persona({ id:'p_felipe', nombre:'Felipe Arancibia', perfil:'electromovilidad', etapa:'postulante', ingreso:null, creado:ts(-6),
    antecedentes: ant('electromovilidad', 1, 'Egresado de electromovilidad', ['at'], ['C03','C09','C16','C19']),
    fundamentos:{ respuestas: resp(3,2,3), fecha:d(-5) } });
  felipe.jornada = null;

  const personas = [camila, javiera, matias, rodrigo, ignacio, tomas, valentina, andres, daniela, felipe];
  for(const p of personas) put('personas/' + p.id, p);

  /* ---- duos ---- */
  const duos = [
    { id:'d_hist1', a:'p_camila', b:'p_javiera', desde:d(-360), hasta:d(-134), activo:false, motivoFin:'Rotación voluntaria' },
    { id:'d_hist2', a:'p_matias', b:'p_rodrigo', desde:d(-358), hasta:d(-120), activo:false, motivoFin:'Rotación voluntaria' },
    { id:'d_hist3', a:'p_rodrigo', b:'p_ignacio', desde:d(-120), hasta:d(-25), activo:false, motivoFin:'Salida de un integrante' },
    { id:'d_camila', a:'p_camila', b:'p_valentina', desde:d(-130), activo:true },
    { id:'d_javiera', a:'p_javiera', b:'p_tomas', desde:d(-110), activo:true },
    { id:'d_matias', a:'p_matias', b:'p_ignacio', desde:d(-24), activo:true }
  ];
  for(const x of duos) put('duos/' + x.id, Object.assign({ demo:true, creado:ts(-1) }, x));

  /* ---- registros ---- */
  const regs = [
    { id:'r_inc1', tipo:'incidente', fecha:d(-12), pids:['p_tomas'], grave:true, detalle:'Contacto con un conector de alta tensión sin verificar antes la ausencia de tensión. Sin lesiones.' },
    { id:'r_inc2', tipo:'incidente', fecha:d(-60), pids:['p_ignacio'], grave:false, detalle:'Herramienta sin aislación dentro de la zona de trabajo. La detectó el encargado de seguridad.' },
    { id:'r_gar1', tipo:'garantia', fecha:d(-45), pids:['p_rodrigo','p_ignacio'], atribuible:true, detalle:'Fijación del cableado de señales suelta en el soporte trasero.' },
    { id:'r_gar2', tipo:'garantia', fecha:d(-70), pids:['p_javiera','p_tomas'], atribuible:true, detalle:'Conector de la señal de freno mal asentado.' },
    { id:'r_gar3', tipo:'garantia', fecha:d(-30), pids:['p_camila','p_valentina'], atribuible:false, detalle:'Falla del alternador original del auto, ajena a la instalación.' }
  ];
  for(const r of regs) put('registros/' + r.id, Object.assign({ demo:true, creado:ts(-1), por:'u_rt' }, r));

  /* ---- sesiones ---- */
  const item = (ev, extra) => Object.assign({ ev, asig:null, r:null }, extra || {});
  put('sesiones/s_jt_felipe', { id:'s_jt_felipe', pid:'p_felipe', tipo:'JT', intento:1, fecha:hoy, estado:'abierta', demo:true,
    items:{ C03:item('ext'), C04:item('ext'), C16:item('ext'), C19:item('ext'), C09:item('int', { asig:'u_camila' }) },
    basico:{ electrica:null, mecanica:null, electronica:null }, creado:ts(-1), creadoPor:'u_rt' });
  put('sesiones/s_n2_valentina', { id:'s_n2_valentina', pid:'p_valentina', tipo:'N2', intento:2, fecha:d(2), estado:'abierta', demo:true,
    items:{ C19:item('ext'), C24:item('int') }, creado:ts(-2), creadoPor:'u_rt' });
  put('sesiones/s_rev_tomas', { id:'s_rev_tomas', pid:'p_tomas', tipo:'REV', intento:1, fecha:d(1), estado:'abierta', demo:true,
    items:{ C01:item('ext'), C02:item('ext'), C05:item('ext'), C35:item('ext'), C20:item('int'), C23:item('int'), C24:item('int') }, creado:ts(-11), creadoPor:'u_rt' });
  put('sesiones/s_jt_andres', { id:'s_jt_andres', pid:'p_andres', tipo:'JT', intento:1, fecha:d(-3), estado:'cerrada', demo:true,
    items: Object.fromEntries(Object.entries(andres.jornada.estaciones).map(([c, r]) => [c, item(evaluadorDe(c), { r, t:ts(-3), por:{ tipo: evaluadorDe(c) === 'ext' ? 'ext' : 'int', uid: evaluadorDe(c) === 'ext' ? null : 'u_rt', nombre: evaluadorDe(c) === 'ext' ? 'Evaluador externo (ficticio)' : null } })])),
    basico:{ electrica:'nivelar', mecanica:'ok', electronica:'nivelar' }, resultado:{ aprobado:true, fallidas:['C04','C12'], fecha:d(-3) }, creado:ts(-10), creadoPor:'u_rt', cerrado:ts(-3), cerradoPor:'u_rt' });
  put('sesiones/s_jt_daniela', { id:'s_jt_daniela', pid:'p_daniela', tipo:'JT', intento:1, fecha:d(-2), estado:'cerrada', demo:true,
    items: Object.fromEntries(Object.entries(daniela.jornada.estaciones).map(([c, r]) => [c, item('ext', { r, t:ts(-2), por:{ tipo:'ext', nombre:'Evaluador externo (ficticio)' } })])),
    basico:{ electrica:'ok', mecanica:'nivelar', electronica:'nivelar' }, resultado:{ aprobado:true, fallidas:['C21'], fecha:d(-2) }, creado:ts(-9), creadoPor:'u_rt', cerrado:ts(-2), cerradoPor:'u_rt' });

  /* ---- agenda de la formadora ---- */
  put('agenda/u_camila', { sesiones:{ s_jt_felipe:{ etiqueta:'Felipe Arancibia', tipo:'JT', fecha:hoy, items:{ C09:{ t:C.C09.t } }, estado:'pendiente', asignado:ts(-1) } } });

  /* ---- avance online (lo escribe cada técnico) ---- */
  const hecho = (ids, extra) => Object.fromEntries(ids.map(id => [id, Object.assign({ revisado:true, intentos:1 }, extra || {})]));
  put('avance/u_ignacio', { modulos: Object.assign(
    hecho(['NIV-E','NIV-X','N1-2','N1-3','N2-1','N2-2','N2-3','N2-4','N2-5']),
    { 'N1-1': { revisado:true, aprobado:true, intentos:2, primera:{ ok:4, total:5, fecha:d(-150) }, mejor:{ ok:5, total:5, fecha:d(-149) } },
      'N3-1': { revisado:false, intentos:0 } }), actualizado:ts(-2) });
  put('avance/u_valentina', { modulos: Object.assign(hecho(['N1-2','N1-3','N2-1','N2-2','N2-3','N2-4','N2-5']), { 'N1-1': { revisado:true, aprobado:true, intentos:1, primera:{ ok:5, total:5, fecha:d(-140) }, mejor:{ ok:5, total:5, fecha:d(-140) } } }), actualizado:ts(-5) });
  /* ---- solicitud de rotación (D13): la escribe la propia técnica ---- */
  put('solicitudes/u_valentina', { rotacion:{ id:'rot_demo1', fecha:d(-3), enviada:ts(-3), duoDesde:d(-130),
    motivo:'Con Camila aprendí mucho del proceso, pero reprobé aislación y la capa de seguridad. Me serviría trabajar con alguien que venga de la electricidad.',
    preferencia:'Javiera Soto' }, demo:true });
  put('avance/u_tomas', { modulos: hecho(['NIV-M','N1-1','N1-2','N1-3','N2-1','N2-2','N2-3','N2-4','N2-5']), actualizado:ts(-12) });

  /* ---- parámetros y gestión ---- */
  put('config/parametros', Object.assign({}, PARAMS_DEF, { demo:true }));
  put('ajustes/gestion', Object.assign({}, GESTION_DEF, { equipo:{ u_rt:{ rol:'rt' }, u_ic:{ rol:'ic' }, u_camila:{ rol:'formador' } }, demo:true }));

  /* ---- expedientes (proyección que ve cada técnico) ---- */
  const P = Object.fromEntries(personas.map(p => [p.id, p]));
  const sesionesSeed = Object.keys(docs).filter(k => k.startsWith('sesiones/')).map(k => docs[k]);
  const ctx = { params: PARAMS_DEF, duos, P, hoy, sesiones: sesionesSeed };
  for(const p of personas) if(p.uid && p.etapa === 'tecnico') put('expedientes/' + p.uid, proyectarExpediente(p, ctx));

  /* ---- bitácora ---- */
  const mes = hoy.slice(0, 7);
  put('bitacora/' + mes, { eventos:{
    e1:{ t:ts(-12), uid:'u_rt', a:'Incidente grave registrado', ref:'p_tomas', d:'Suspensión de alta tensión hasta revalidar' },
    e2:{ t:ts(-11), uid:'u_rt', a:'Revalidación programada', ref:'s_rev_tomas', d:'Tomás Herrera' },
    e3:{ t:ts(-3),  uid:'u_rt', a:'Jornada técnica cerrada', ref:'s_jt_andres', d:'Andrés Contreras: 5 de 7 estaciones demostradas' },
    e4:{ t:ts(-2),  uid:'u_rt', a:'Jornada técnica cerrada', ref:'s_jt_daniela', d:'Daniela Vergara: 4 de 5 estaciones demostradas' },
    e5:{ t:ts(-1),  uid:'u_rt', a:'Jornada técnica programada', ref:'s_jt_felipe', d:'Felipe Arancibia: 5 estaciones marcadas por el mapa' }
  } });
  return docs;
}
