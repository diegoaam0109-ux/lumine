/* =====================================================================
   Lumine Habilita · estado, carga de datos y sesión
   ===================================================================== */
'use strict';

const S = {
  build: BUILD,                 // 'demo' | 'real'
  db: null, user: null, dl: null,
  mem: null, memUser: null,
  me: { id:null, name:'', level:'none', isOwner:false, canEdit:false },
  role: 'loading',              // admin | tecnico | postulante | anonimo | sindb | loading
  demoRole: (function(){ try { return sessionStorage.getItem('lh-demo-sesion') || 'visitante'; } catch(e){ return 'visitante'; } })(),
  kiosk: false,
  D: { personas:{}, sesiones:{}, duos:{}, registros:{}, params:null, gestion:null, contenido:null, avance:{}, marcas:{}, agenda:{}, expedientes:{}, bitacora:{}, solicitudes:{} },
  mine: { expediente:null, avance:null, agenda:null, marcas:null, solicitud:null },
  loaded: new Set(),
  unsub: [],
  readOnly: false,
  preview: null,                // vista previa de administración: { tipo, pid, nombre }
  salud: { perfiles:null },     // última falla de infraestructura que conviene mostrar
  hoy: hoyISO(),
  rev: 0
};
const UI = {};                  // estado de interfaz por vista (pestañas, filtros)
function ui(key, def){ if(!(key in UI)) UI[key] = def; return UI[key]; }

/* ---------- lecturas derivadas ---------- */
const arr = m => Object.values(m || {});
function params(){ return Object.assign({}, PARAMS_DEF, S.D.params || {}, { horasModulo: Object.assign({}, (S.D.params || {}).horasModulo || {}), horasValidacion: Object.assign({}, (S.D.params || {}).horasValidacion || {}), bonoNivel: Object.assign({}, (S.D.params || {}).bonoNivel || {}) }); }
function gestion(){ const g = S.D.gestion || {}; return Object.assign({}, GESTION_DEF, g, { costos: Object.assign({}, GESTION_DEF.costos, g.costos || {}), metas: Object.assign({}, g.metas || {}), instalaciones: Object.assign({}, g.instalaciones || {}), equipo: Object.assign({}, g.equipo || {}) }); }
function personas(){ return arr(S.D.personas).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es')); }
function duos(){ return arr(S.D.duos); }
function sesiones(){ return arr(S.D.sesiones).sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')) || String(b.creado || '').localeCompare(String(a.creado || ''))); }
function registros(){ return arr(S.D.registros).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))); }
function Pmap(){ return S.D.personas; }
function persona(id){ return S.D.personas[id] || null; }
function personaPorUid(uid){ return uid ? personas().find(p => p.uid === uid) || null : null; }
function postulaciones(){
  const linked = new Set(personas().map(p => p.uid).filter(Boolean));
  return Object.keys(S.D.avance).filter(uid => !linked.has(uid) && S.D.avance[uid] && S.D.avance[uid].postulacion && S.D.avance[uid].postulacion.enviada)
    .map(uid => Object.assign({ uid }, S.D.avance[uid].postulacion, { fundamentos: S.D.avance[uid].fundamentos || null }));
}
function ctx(extra){
  return Object.assign({ personas: personas(), duos: duos(), sesiones: sesiones(), registros: registros(), params: params(), gestion: gestion(), hoy: S.hoy, P: Pmap(), marcas: S.D.marcas, agenda: S.D.agenda, postulaciones: postulaciones() }, extra || {});
}
function rolEquipo(uid){
  const g = gestion();
  const r = g.equipo[uid] && g.equipo[uid].rol;
  if(r) return r;
  if(uid === S.me.id && S.me.isOwner) return 'rt';
  return S.me.canEdit && uid === S.me.id ? 'admin' : null;
}
function miRol(){ return rolEquipo(S.me.id); }
const ROL_L = { rt:'Responsable Técnico', ic:'Ingeniería de Calibración', formador:'Formador', admin:'Administración' };

/* nombre visible de un uid (en la demo, el directorio; en real, perfiles resueltos) */
const PROFILES = {};
function nombreUid(uid){
  if(!uid) return '';
  if(PROFILES[uid] && PROFILES[uid].name) return PROFILES[uid].name;
  const p = personaPorUid(uid); if(p) return p.nombre;
  if(uid === S.me.id) return S.me.name || 'Tú';
  return 'Usuario sin nombre visible';
}
async function resolverPerfiles(ids){
  ids = uniq(ids.filter(x => validId(x)));
  if(!S.user || !ids.length) return;
  try {
    const falt = ids.filter(id => !PROFILES[id]);
    if(!falt.length) return;
    const r = await S.user.profiles(falt);
    let changed = false;
    for(const id of Object.keys(r)){ PROFILES[id] = { name: r[id].name || '', color: r[id].color || null }; changed = true; }
    if(changed) scheduleRender();
    if(S.salud.perfiles){ S.salud.perfiles = null; scheduleRender(); }
  } catch(e){
    // No se silencia: queda en consola, en S.salud (Panel y Ajustes lo muestran) y se avisa una vez por sesión
    console.warn('perfiles', e);
    const primera = !S.salud.perfiles;
    S.salud.perfiles = { t: new Date().toISOString(), msg: (e && (e.message || e.code)) || 'sin detalle' };
    if(primera && S.role === 'admin'){ toast('No se pudieron cargar los nombres de las cuentas. Se muestran como "Usuario sin nombre visible".', 'warn'); scheduleRender(); }
  }
}

/* ---------- suscripciones ---------- */
function unsubscribeAll(){ for(const u of S.unsub) try { u(); } catch(e){} S.unsub = []; S.loaded = new Set(); }
function subCol(name, key){
  const un = S.db.collection(name).onSnapshot(snap => {
    const m = {}; for(const d of snap.docs) m[d.id] = d.data();
    S.D[key] = m; S.loaded.add(key); S.rev++; scheduleRender();
    if(key === 'personas' || key === 'duos' || key === 'expedientes' || key === 'sesiones') programarReconciliacion();
  }, err => onDbError(err));
  S.unsub.push(un);
}
function subDoc(path, setter, key){
  const un = S.db.doc(path).onSnapshot(snap => { setter(snap.exists ? snap.data() : null); S.loaded.add(key); S.rev++; scheduleRender(); }, err => onDbError(err));
  S.unsub.push(un);
}
function onDbError(e){
  if(e && (e.code === 'revoked' || e.code === 'not_granted' || e.code === 'capability_disabled' || e.code === 'capability_removed')){
    S.readOnly = true; toast(errMsg(e), 'crit'); scheduleRender(); return;
  }
  if(e && e.code === 'resource_exhausted'){ toast(errMsg(e), 'warn'); return; }
  console.warn('db', e);
}
function suscribir(){
  unsubscribeAll();
  if(S.role === 'admin'){
    subCol('personas', 'personas'); subCol('sesiones', 'sesiones'); subCol('duos', 'duos'); subCol('registros', 'registros');
    subCol('avance', 'avance'); subCol('marcas', 'marcas'); subCol('agenda', 'agenda'); subCol('expedientes', 'expedientes'); subCol('bitacora', 'bitacora'); subCol('solicitudes', 'solicitudes');
    subDoc('config/parametros', v => { S.D.params = v; }, 'params');
    subDoc('ajustes/gestion', v => { S.D.gestion = v; }, 'gestion');
    subDoc('config/contenido', v => { S.D.contenido = v; }, 'contenido');
  } else if(S.me.id && validId(S.me.id)){
    subDoc('config/parametros', v => { S.D.params = v; }, 'params');
    subDoc('config/contenido', v => { S.D.contenido = v; }, 'contenido');
    subDoc('expedientes/' + S.me.id, v => { S.mine.expediente = v; }, 'expediente');
    subDoc('avance/' + S.me.id, v => { S.mine.avance = v; }, 'avance');
    subDoc('agenda/' + S.me.id, v => { S.mine.agenda = v; }, 'agenda');
    subDoc('marcas/' + S.me.id, v => { S.mine.marcas = v; }, 'marcas');
    subDoc('solicitudes/' + S.me.id, v => { S.mine.solicitud = v; }, 'solicitud');
  }
}
function cargado(keys){ return keys.every(k => S.loaded.has(k)); }
/* contenido efectivo de un módulo: el del código, con los ajustes guardados en config/contenido */
function contenidoDe(mid){ return contenidoModulo(mid, S.D.contenido && S.D.contenido.modulos); }

/* ---------- expedientes: proyección determinista ----------
   Cada técnico lee una copia (expedientes/{uid}) porque no puede leer personas/.
   Cualquier administración con la página abierta la recalcula desde personas/ y
   escribe solo lo que difiere, así un cambio hecho por otra vía no deja al técnico
   viendo un estado viejo. Una escritura por documento y solo si cambió. */
let RECON_T = null, RECON_CORRIENDO = false;
function programarReconciliacion(){
  if(S.role !== 'admin' || S.preview || S.readOnly) return;
  clearTimeout(RECON_T);
  RECON_T = setTimeout(reconciliarExpedientes, 1500);
}
async function reconciliarExpedientes(){
  if(RECON_CORRIENDO || S.role !== 'admin' || S.preview || S.readOnly) return;
  if(!cargado(['personas','duos','expedientes','params','sesiones'])) return;
  RECON_CORRIENDO = true;
  try {
    const c = ctx();
    for(const p of c.personas){
      if(!p.uid || !validId(p.uid)) continue;
      const cur = S.D.expedientes[p.uid];
      if(!cur || stableJSON(cur) !== stableJSON(proyectarExpediente(p, c))) await syncExpediente(p.id);
    }
  } catch(e){ console.warn('reconciliación', e); }
  finally { RECON_CORRIENDO = false; }
}

/* ---------- kiosco bloqueado ----------
   El kiosco corre en un equipo de Lumine con la cuenta de administración abierta.
   Mientras está activo, la navegación queda encerrada en #kiosco y salir pide el PIN
   que definió el Responsable Técnico al abrirlo. Vive en sessionStorage: cerrar la
   pestaña lo termina. */
const KIOSK_KEY = 'lh-kiosco';
function hashPin(pin){ return String(semillaDe('lumine-kiosco:' + pin)); }
function kioscoBloqueado(){ try { return !!JSON.parse(sessionStorage.getItem(KIOSK_KEY) || 'null'); } catch(e){ return !!S.kioskMem; } }
function activarKiosco(pin, sid){
  const v = { h: hashPin(pin), sid: sid || null, desde: new Date().toISOString() };
  S.kioskMem = v;
  try { sessionStorage.setItem(KIOSK_KEY, JSON.stringify(v)); } catch(e){}
}
function pinKioscoOk(pin){ let v = null; try { v = JSON.parse(sessionStorage.getItem(KIOSK_KEY) || 'null'); } catch(e){} v = v || S.kioskMem; return !!v && v.h === hashPin(pin); }
function desactivarKiosco(){ S.kioskMem = null; try { sessionStorage.removeItem(KIOSK_KEY); } catch(e){} }

/* ---------- vista previa de administración ("ver como") ----------
   Quien administra no tiene otra cuenta para ver lo que ve un postulante o un técnico.
   La vista previa monta una base en memoria con los mismos permisos de un Colaborador
   (nivel interact) y una copia del expediente elegido: nada de lo que se haga ahí
   se escribe en la base real. */
async function iniciarVistaPrevia(tipo, pid){
  if(S.role !== 'admin' && !S.preview) throw new Error('Solo administración puede usar la vista previa');
  if(!S.preview) S.real = { db:S.db, user:S.user, me:S.me, D:S.D };
  const R = S.real;
  S.D = R.D; // ctx() se calcula sobre los datos reales
  const uid = 'u_vista_previa';
  const docs = {};
  if(R.D.params) docs['config/parametros'] = JSON.parse(JSON.stringify(R.D.params));
  if(R.D.contenido) docs['config/contenido'] = JSON.parse(JSON.stringify(R.D.contenido));
  let nombre = 'Postulante de prueba';
  if(tipo === 'tecnico'){
    const p = R.D.personas[pid]; if(!p) throw new Error('Persona no encontrada');
    nombre = p.nombre;
    const c = Object.assign(ctx(), { P: R.D.personas });
    docs['expedientes/' + uid] = proyectarExpediente(p, c);
    if(p.uid && R.D.avance[p.uid]) docs['avance/' + uid] = JSON.parse(JSON.stringify(R.D.avance[p.uid]));
  }
  const mem = new MemDB(DB_RULES, { level:'interact', id:uid });
  mem.load(docs);
  const dir = { [uid]: { name: nombre, color:'#697177' } };
  S.db = mem; S.user = new MemUser(dir, { level:'interact', id:uid });
  S.preview = { tipo, pid: pid || null, nombre };
  S.mine = { expediente:null, avance:null, agenda:null, marcas:null, solicitud:null };
  S.D = { personas:{}, sesiones:{}, duos:{}, registros:{}, params:null, gestion:null, contenido:null, avance:{}, marcas:{}, agenda:{}, expedientes:{}, bitacora:{}, solicitudes:{} };
  for(const k of Object.keys(UI)) if(/^(postular|prac-|esc-|sim-|mod-)/.test(k)) delete UI[k];
  await identificar();
  S.role = 'tecnico';
  suscribir();
  go(tipo === 'tecnico' ? 'ruta' : 'postular');
}
async function salirVistaPrevia(){
  if(!S.preview) return;
  const R = S.real; S.real = null; S.preview = null;
  S.db = R.db; S.user = R.user; S.me = R.me; S.D = R.D;
  S.mine = { expediente:null, avance:null, agenda:null, marcas:null, solicitud:null };
  S.role = 'admin';
  suscribir();
  go('entrar');
}

/* ---------- identidad y rol ---------- */
async function identificar(){
  const u = S.user;
  if(!u){ S.me = { id:null, name:'', level:'none', isOwner:false, canEdit:false }; return; }
  const [isOwner, canEdit, me] = await Promise.all([u.isOwner(), u.canEdit(), u.me()]);
  S.me = { id: me.id, name: me.name || '', color: me.color, isOwner: !!isOwner, canEdit: !!canEdit, level: isOwner ? 'owner' : canEdit ? 'admin' : 'interact' };
  if(me.id) PROFILES[me.id] = { name: me.name || '', color: me.color };
}
function decidirRol(){
  if(!S.db) return 'sindb';
  if(S.me.canEdit || S.me.isOwner) return 'admin';
  if(!S.me.id || !validId(S.me.id)) return 'anonimo';
  return 'tecnico'; // técnico o postulante: se distingue al llegar el expediente
}
function esPostulante(){ return S.role === 'tecnico' && S.loaded.has('expediente') && !S.mine.expediente; }
function esFormador(){ return S.role === 'tecnico' && S.mine.agenda && Object.keys(S.mine.agenda.sesiones || {}).length > 0; }

/* ---------- arranque de cada modo ---------- */
function demoStorageLoad(){
  try { const raw = localStorage.getItem('lh-demo-v5'); if(!raw) return null; const o = JSON.parse(raw); if(o && o.hoy === S.hoy && o.docs) return o.docs; } catch(e){}
  return null;
}
let demoSaveT = null;
function demoStorageSave(){
  clearTimeout(demoSaveT);
  demoSaveT = setTimeout(() => { try { localStorage.setItem('lh-demo-v5', JSON.stringify({ hoy:S.hoy, docs:S.mem.dump() })); } catch(e){} }, 400);
}
function demoReset(){
  try { localStorage.removeItem('lh-demo-v5'); } catch(e){}
  S.mem.load(demoSeed(S.hoy));
  toast('Demostración restablecida');
}
async function iniciarDemo(){
  const role = DEMO_ROLES.find(r => r.id === S.demoRole) || DEMO_ROLES[0];
  if(!S.mem){
    S.mem = new MemDB(DB_RULES, role.viewer);
    const saved = demoStorageLoad();
    S.mem.load(saved || demoSeed(S.hoy));
    S.mem.onChange = demoStorageSave;
    S.memUser = new MemUser(DEMO_DIR, role.viewer);
    for(const id of Object.keys(DEMO_DIR)) PROFILES[id] = { name: DEMO_DIR[id].name, color: DEMO_DIR[id].color };
  }
  S.mem.setViewer(role.viewer); S.memUser.setViewer(role.viewer);
  S.db = S.mem; S.user = S.memUser;
  S.kiosk = !!role.kiosk;
  S.mine = { expediente:null, avance:null, agenda:null, marcas:null, solicitud:null };
  S.D = { personas:{}, sesiones:{}, duos:{}, registros:{}, params:null, gestion:null, contenido:null, avance:{}, marcas:{}, agenda:{}, expedientes:{}, bitacora:{}, solicitudes:{} };
  await identificar();
  S.role = decidirRol();
  suscribir();
}
async function cambiarRolDemo(id){
  S.demoRole = id;
  S.cambioRol = Date.now();
  try { if(id === 'visitante') sessionStorage.removeItem('lh-demo-sesion'); else sessionStorage.setItem('lh-demo-sesion', id); } catch(e){}
  closeSheet();
  await iniciarDemo();
  const home = S.kiosk ? 'kiosco' : homeRoute();
  if(location.hash === '#' + home) render(); else location.hash = home;
  const r = DEMO_ROLES.find(x => x.id === id);
  toast('Viendo como: ' + r.n, 'info');
}
async function iniciarReal(){
  if(!window.claude || typeof window.claude.use !== 'function'){ S.role = 'sindb'; return; }
  const [db, user, dl] = await Promise.all([window.claude.use('db'), window.claude.use('user'), window.claude.use('downloads')]);
  S.db = db; S.user = user; S.dl = dl;
  await identificar();
  S.role = decidirRol();
  if(S.role === 'sindb' || S.role === 'anonimo') return;
  suscribir();
}
