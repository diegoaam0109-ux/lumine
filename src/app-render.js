/* =====================================================================
   Lumine Habilita · rutas, navegación y ciclo de render
   ===================================================================== */
'use strict';

const ROUTES = {
  inicio:       { t:'Producto',        ic:'home',      roles:['*'] },
  entrar:       { t:'Entrada',         ic:'swap',      roles:['admin'] },
  panel:        { t:'Panel',           ic:'grid',      roles:['admin'] },
  personas:     { t:'Personas',        ic:'users',     roles:['admin'] },
  persona:      { t:'Expediente',      ic:'user',      roles:['admin'], parent:'personas' },
  validaciones: { t:'Validaciones',    ic:'clipboard', roles:['admin'] },
  sesion:       { t:'Validación',      ic:'clipboard', roles:['admin'], parent:'validaciones' },
  kiosco:       { t:'Evaluación externa', ic:'shieldCheck', roles:['admin'] },
  duos:         { t:'Duos',            ic:'duo',       roles:['admin'] },
  indicadores:  { t:'Indicadores',     ic:'chart',     roles:['admin'] },
  diccionario:  { t:'Diccionario',     ic:'book',      roles:['*'] },
  laboratorio:  { t:'Laboratorio',     ic:'cube',      roles:['*'] },
  taller:       { t:'Arma el kit',     ic:'wrench',    roles:['*'] },
  login:        { t:'Iniciar sesión',  ic:'key',       roles:['*'] },
  ajustes:      { t:'Ajustes',         ic:'settings',  roles:['admin'] },
  ruta:         { t:'Mi ruta',         ic:'route',     roles:['tecnico'] },
  modulos:      { t:'Módulos',         ic:'layers',    roles:['tecnico','postulante'] },
  modulo:       { t:'Módulo',          ic:'layers',    roles:['tecnico','postulante'], parent:'modulos' },
  agenda:       { t:'Agenda',          ic:'calendar',  roles:['formador'] },
  postular:     { t:'Postular',        ic:'userPlus',  roles:['postulante'] }
};
const VIEWS = {}; // se registran en cada archivo de vista

function parseHash(){
  let raw = '';
  try { raw = decodeURIComponent((location.hash || '').slice(1)); } catch(e){ raw = ''; }
  const m = /^([a-z]+)(?:-([A-Za-z0-9_-]{1,64}))?$/.exec(raw);
  return m ? { id:m[1], arg:m[2] || null } : { id:'', arg:null };
}
function roleKeys(){
  const k = new Set(['*']);
  if(S.role === 'admin') k.add('admin');
  if(S.role === 'tecnico'){
    if(S.mine.expediente) k.add('tecnico'); else k.add('postulante');
    if(esFormador()) k.add('formador');
  }
  return k;
}
function puedeVer(id){ const r = ROUTES[id]; if(!r) return false; const k = roleKeys(); return r.roles.some(x => k.has(x)); }
function homeRoute(){
  if(S.kiosk) return 'kiosco';
  if(S.role === 'admin') return 'panel';
  if(S.role === 'tecnico'){ if(!S.loaded.has('expediente')) return 'ruta'; return S.mine.expediente ? 'ruta' : 'postular'; }
  return 'inicio';
}
function navItems(){
  const k = roleKeys();
  if(S.kiosk) return [];
  if(k.has('admin')) return ['panel','personas','validaciones','duos','indicadores','diccionario'];
  if(k.has('tecnico')) return ['ruta','modulos','laboratorio'].concat(k.has('formador') ? ['agenda'] : []).concat(['diccionario']);
  if(k.has('postulante')) return ['postular','laboratorio','diccionario'].concat(k.has('formador') ? ['agenda'] : []);
  return ['inicio','laboratorio','taller','diccionario'];
}
function moreItems(){
  const k = roleKeys();
  if(k.has('admin')) return ['entrar','ajustes','laboratorio','taller','inicio'];
  if(k.has('tecnico') || k.has('postulante')) return ['taller','inicio'];
  return [];
}
function go(hash){ if(location.hash === '#' + hash) render(); else location.hash = hash; }

/* ---------- ciclo de render ---------- */
let RQ = false, DEFER = false, LAST = '', ULT_CARGANDO = false;
function scheduleRender(){
  if(RQ) return; RQ = true;
  requestAnimationFrame(() => { RQ = false; refrescar(); });
}
function escribiendo(){
  const ae = document.activeElement;
  return ae && $('#main') && $('#main').contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type !== 'checkbox' && ae.type !== 'radio';
}
function refrescar(){ if(escribiendo()){ DEFER = true; return; } render(true); }
document.addEventListener('focusout', () => { if(DEFER) setTimeout(() => { if(!escribiendo() && DEFER){ DEFER = false; render(true); } }, 60); });

function render(esRefresco){
  const main = $('#main'); if(!main) return;
  const { id, arg } = parseHash();
  const key = id + '|' + (arg || '');
  // Kiosco: mientras está activo no se navega a ninguna otra sección (ni cambiando la URL)
  if((S.kiosk || kioscoBloqueado()) && id !== 'kiosco' && S.role !== 'loading'){
    const ahora = Date.now();
    if(!S.avisoKiosco || ahora - S.avisoKiosco > 4000){ S.avisoKiosco = ahora; setTimeout(() => toast('El kiosco está activo: solo se navega dentro de él. Para salir, usa “Salir del kiosco”.', 'info'), 50); }
    location.replace('#kiosco'); return;
  }
  if(!id || !ROUTES[id]){ location.replace('#' + (S.build === 'demo' && S.role !== 'loading' && !S.kiosk ? (S.firstLoad ? 'inicio' : homeRoute()) : homeRoute())); S.firstLoad = false; return; }
  S.firstLoad = false;
  const nav = key !== LAST;
  if(S.role !== 'loading' && !puedeVer(id)){
    const listo = S.role !== 'tecnico' || S.loaded.has('expediente');
    if(listo){
      if(nav && !(S.cambioRol && Date.now() - S.cambioRol < 2500)) toast(id === 'postular' ? 'Ya tienes expediente: tu ruta está en Mi ruta' : 'Esa sección no está disponible para tu perfil', 'info');
      location.replace('#' + homeRoute()); return;
    }
  }
  const scrollY = window.scrollY;
  const fk = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
  hideTip();
  renderShell(id);
  renderFooter();
  // el kiosco tiene su propio scroll: se conserva al marcar (antes saltaba arriba)
  const kOld = main.querySelector('.kiosk'), kScroll = kOld ? kOld.scrollTop : 0;
  clear(main);
  let view;
  try { view = S.role === 'loading' ? vistaCargando() : (VIEWS[id] ? VIEWS[id](arg) : emptyState('info', 'En construcción', '')); }
  catch(e){ console.error(e); view = h('div', { class:'wrap page' }, notice('crit', 'alert', h('b', null, 'Algo falló al mostrar esta sección. '), 'Vuelve al inicio y reintenta. Si se repite, exporta un respaldo desde Ajustes.')); }
  main.appendChild(view);
  document.body.classList.toggle('kiosk-on', id === 'kiosco');
  if(nav){
    LAST = key;
    window.scrollTo(0, 0);
    const h1 = main.querySelector('h1');
    if(h1 && document.activeElement !== document.body && !SHEET){ h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll:true }); }
    view.classList && view.classList.add('view-enter');
  } else {
    window.scrollTo(0, scrollY);
    const kNew = main.querySelector('.kiosk'); if(kNew && kScroll) kNew.scrollTop = kScroll;
    if(fk){ const el = main.querySelector('[data-k="' + (window.CSS && CSS.escape ? CSS.escape(fk) : fk) + '"]'); if(el) el.focus({ preventScroll:true }); }
  }
  const animar = nav || ULT_CARGANDO;
  ULT_CARGANDO = !!(view && view.getAttribute && view.getAttribute('aria-busy') === 'true');
  if(typeof Motion !== 'undefined') Motion.tras(main, animar, id);
}
window.addEventListener('hashchange', () => render(false));

function vistaCargando(){
  return h('div', { class:'wrap page', 'aria-busy':'true' },
    h('div', { class:'empty', style:'border:0;padding:80px 20px' },
      h('span', { class:'emblem', style:'width:44px;height:44px;color:var(--spark);animation:pulse 1.8s infinite;border-radius:50%' }),
      h('p', null, 'Cargando la plataforma…')));
}

/* ---------- navegación: píldora flotante, hoja y barra inferior ---------- */
function renderShell(activeId){
  const cur = ROUTES[activeId] && ROUTES[activeId].parent ? ROUTES[activeId].parent : activeId;
  // barra de demostración
  const db = $('#demobar'); clear(db);
  if(S.build === 'real' && S.role === 'sindb'){
    addKids(db, [badge('Sin base de datos', 'warn'), h('span', null, 'Esta vista no puede abrir los datos de Lumine. Ábrela desde claude.ai con tu cuenta de la organización.')]);
  }
  if(S.preview && activeId !== 'kiosco'){
    addKids(db, [badge('Vista previa', 'warn'), h('span', null, 'Ves la plataforma como ' + (S.preview.tipo === 'tecnico' ? S.preview.nombre + ' (técnico)' : 'un postulante nuevo') + '. Nada de lo que hagas aquí se guarda.'),
      h('button', { type:'button', class:'linkbtn', on:{ click: () => salirVistaPrevia() } }, 'Salir de la vista previa')]);
  } else if(S.build === 'demo' && activeId !== 'kiosco'){
    addKids(db, [badge('Demostración', 'demo'), h('span', null, 'Datos ficticios, guardados solo en este navegador'),
      h('button', { type:'button', class:'linkbtn', on:{ click: abrirRecorrido } }, 'Recorrido guiado')]);
  }
  // píldora
  const nav = $('#nav'); clear(nav);
  if(activeId === 'kiosco'){ return; }
  const items = navItems();
  const links = h('nav', { class:'navlinks', 'aria-label':'Secciones' }, items.map(id => h('a', { href:'#' + id, 'aria-current': id === cur ? 'page' : null }, icon(ROUTES[id].ic), ROUTES[id].t)));
  const brand = h('a', { class:'brand', href:'#' + (S.role === 'admin' || S.role === 'tecnico' ? homeRoute() : 'inicio'), 'aria-label':'Lumine Habilita, inicio' },
    h('span', { class:'emblem' }), h('span', { class:'wordmark', 'aria-hidden':'true' }), h('span', { class:'brand-sub' }, 'Habilita'));
  const menuB = h('button', { type:'button', class:'btn btn-quiet icon nav-menu-btn', 'aria-label':'Menú' }, icon('menu', 's20'));
  menuB.addEventListener('click', abrirMenu);
  const right = h('div', { class:'nav-right' }, rolChip(), menuB);
  nav.appendChild(h('div', { class:'topnav' }, h('div', { class:'pill' }, brand, links, h('span', { class:'nav-title' }, ROUTES[cur] ? ROUTES[cur].t : ''), right)));
  // barra inferior (teléfono)
  const tb = $('#tabbar'); clear(tb);
  const tbItems = items.slice(0, 4);
  for(const id of tbItems) tb.appendChild(h('a', { href:'#' + id, 'aria-current': id === cur ? 'page' : null }, icon(ROUTES[id].ic), h('span', null, ROUTES[id].tab || ROUTES[id].t)));
  const mas = h('button', { type:'button', 'aria-label':'Más secciones' }, icon('more'), h('span', null, 'Más'));
  mas.addEventListener('click', abrirMenu);
  tb.appendChild(mas);
}
function rolChip(){
  // demo sin sesión: botón para iniciar sesión en vez de un perfil
  if(S.build === 'demo' && !S.preview && S.demoRole === 'visitante'){
    return h('a', { class:'btn btn-action sm login-b', href:'#login' }, icon('key', 's16'), h('span', null, 'Iniciar sesión'));
  }
  let nombre, sub, color;
  if(S.preview){ nombre = S.preview.tipo === 'tecnico' ? S.preview.nombre : 'Postulante de prueba'; sub = 'Vista previa'; color = '#697177'; }
  else if(S.build === 'demo'){ const r = DEMO_ROLES.find(x => x.id === S.demoRole); nombre = (S.demoRole === 'postulante' && S.demoNombre) ? S.demoNombre : r.n.split(' · ')[0]; sub = r.kiosk ? 'Kiosco' : 'Sesión iniciada'; color = (DEMO_DIR[r.viewer.id] || {}).color; }
  else if(S.role === 'admin'){ nombre = S.me.name || 'Administración'; sub = ROL_L[miRol()] || 'Administración'; color = S.me.color; }
  else if(S.role === 'tecnico'){ nombre = S.me.name || 'Tu cuenta'; sub = S.mine.expediente ? nivelNombre(S.mine.expediente.nivel) : 'Postulante'; color = S.me.color; }
  else { nombre = 'Sin sesión'; sub = 'Visitante'; }
  const b = h('button', { type:'button', class:'rolechip', 'aria-label': sub + ': ' + nombre + '. Ver cuenta' },
    avatar(nombre, color), h('span', { class:'rl' }, h('small', null, sub), h('span', null, nombre)), icon('chevDown', 's14'));
  b.addEventListener('click', abrirCuenta);
  return b;
}
function cerrarSesionDemo(){ S.demoNombre = ''; return cambiarRolDemo('visitante').then(() => go('inicio')); }
function abrirMenu(){
  const cur = parseHash().id;
  openSheet('Menú', close => {
    const all = navItems().concat(moreItems());
    return frag(
      h('div', { class:'menu-list' }, all.map(id => h('a', { href:'#' + id, 'aria-current': id === cur ? 'page' : null, on:{ click: close } }, icon(ROUTES[id].ic), ROUTES[id].t))),
      h('div', { class:'menu-sep' }),
      h('div', { class:'menu-cap' }, 'Tema'),
      h('div', { style:'padding:4px 12px 8px' }, segmented([{ v:'dark', l:'Oscuro', ic:'moon' }, { v:'light', l:'Claro', ic:'sun' }], getTheme(), v => setTheme(v), { label:'Tema' })),
      S.build === 'demo' ? frag(h('div', { class:'menu-sep' }), h('div', { class:'menu-list' },
        S.demoRole === 'visitante' ? h('a', { href:'#login', on:{ click: close } }, icon('key'), 'Iniciar sesión') : h('button', { type:'button', on:{ click: () => { close(); cerrarSesionDemo(); } } }, icon('logout'), 'Cerrar sesión'),
        h('button', { type:'button', on:{ click: () => { close(); abrirRecorrido(); } } }, icon('play'), 'Recorrido guiado'),
        h('button', { type:'button', on:{ click: async () => { close(); const r = await dialog({ title:'¿Restablecer la demostración?', body:'Se borran los cambios hechos en este navegador y vuelven los datos ficticios iniciales.', confirm:'Restablecer', icon:'refresh' }); if(r) demoReset(); } } }, icon('refresh'), 'Restablecer demostración'))) : null
    );
  });
}
function abrirRoles(){
  openSheet('Ver la plataforma como…', close => frag(
    h('p', { class:'hint', style:'margin-bottom:14px' }, 'Cada perfil ve solo lo que le corresponde. Las reglas de acceso son las mismas que en la versión real: aquí se prueban sobre una base simulada.'),
    h('div', { class:'stack', style:'--g:8px' }, DEMO_ROLES.filter(r => !r.oculto).map(r => {
      const b = h('button', { type:'button', class:'role-opt', 'aria-pressed': r.id === S.demoRole ? 'true' : 'false' },
        h('span', { class:'av', style:'background:' + ((DEMO_DIR[r.viewer.id] || {}).color || '#52595e') }, icon(r.ic, 's16')),
        h('span', { class:'rt' }, h('b', null, r.n), h('span', null, r.d)));
      b.addEventListener('click', () => cambiarRolDemo(r.id));
      return b;
    })),
    h('div', { class:'menu-sep' }),
    h('div', { class:'row' }, btn('Restablecer demostración', { kind:'ghost', size:'sm', icon:'refresh', onClick: async () => {
      const r = await dialog({ title:'¿Restablecer la demostración?', body:'Se borran los cambios hechos en este navegador y vuelven los datos ficticios iniciales.', confirm:'Restablecer', icon:'refresh' });
      if(r){ close(); demoReset(); }
    } }))
  ));
}
function abrirCuenta(){
  if(S.build === 'demo' && !S.preview){
    const r = DEMO_ROLES.find(x => x.id === S.demoRole) || DEMO_ROLES[0];
    openSheet('Tu sesión', close => frag(
      h('div', { class:'row', style:'margin-bottom:14px' }, avatar(r.n, (DEMO_DIR[r.viewer.id] || {}).color, 'lg'), h('div', null, h('div', { class:'h4' }, (S.demoRole === 'postulante' && S.demoNombre) ? S.demoNombre : r.n), h('div', { class:'hint' }, r.d))),
      notice('info', 'info', 'Cuenta de prueba de la demostración. En producción cada persona entra con su correo y su contraseña, y el servidor decide qué puede ver.'),
      h('div', { class:'menu-sep' }),
      h('div', { class:'menu-list' },
        h('button', { type:'button', on:{ click: () => { close(); cerrarSesionDemo(); } } }, icon('logout'), 'Cerrar sesión'),
        h('button', { type:'button', on:{ click: () => { close(); cerrarSesionDemo().then(() => go('login')); } } }, icon('swap'), 'Entrar con otra cuenta'))));
    return;
  }
  if(S.preview){
    openSheet('Vista previa', close => frag(
      notice('warn', 'eye', 'Estás viendo la plataforma como ' + (S.preview.tipo === 'tecnico' ? S.preview.nombre + ', técnico' : 'un postulante nuevo') + '. Lo que hagas aquí no se guarda en la base.'),
      h('div', { class:'row end', style:'margin-top:14px' }, btn('Salir de la vista previa', { kind:'action', icon:'logout', onClick: () => { close(); salirVistaPrevia(); } }))));
    return;
  }
  openSheet('Tu cuenta', close => frag(
    h('div', { class:'row', style:'margin-bottom:14px' }, avatar(S.me.name || '?', S.me.color, 'lg'), h('div', null, h('div', { class:'h4' }, S.me.name || 'Sin nombre visible'), h('div', { class:'hint' }, S.role === 'admin' ? (ROL_L[miRol()] || 'Administración') : S.role === 'tecnico' ? (S.mine.expediente ? 'Técnico · ' + nivelNombre(S.mine.expediente.nivel) : 'Postulante') : 'Visitante'))),
    h('dl', { class:'kv' },
      h('dt', null, 'Acceso'), h('dd', null, S.me.isOwner ? 'Dueño de la plataforma' : S.me.canEdit ? 'Administración (Editor)' : 'Participante (Colaborador)'),
      h('dt', null, 'Qué ves'), h('dd', null, S.role === 'admin' ? 'Todo el sistema: personas, validaciones, duos, indicadores y ajustes.' : 'Solo tu expediente, tu avance y, si eres formador, tu agenda.')),
    S.role === 'admin' ? frag(h('div', { class:'menu-sep' }), h('div', { class:'menu-list' },
      h('button', { type:'button', on:{ click: () => { close(); iniciarVistaPrevia('postulante').catch(e => toast(errMsg(e), 'crit')); } } }, icon('userPlus'), 'Ver como postulante'),
      h('button', { type:'button', on:{ click: () => { close(); go('entrar'); } } }, icon('user'), 'Ver como un técnico…'))) : null,
    h('div', { class:'menu-sep' }),
    notice('info', 'info', 'Los perfiles se asignan desde el menú Compartir de claude.ai: Editor para administración y Colaborador para técnicos. Los roles internos (Responsable Técnico, Ingeniería de Calibración, formador) se asignan en Ajustes.')
  ));
}

/* ---------- recorrido guiado de la demostración ---------- */
const RIDS = typeof DEMO_IDS !== 'undefined' ? DEMO_IDS : { sesionJT:'', felipe:'' };
const RECORRIDO = [
  { t:'Mira cómo cambia el plan según el perfil', d:'En la portada, alterna entre mecánico, electricista y egresado.', rol:'rt', go:'inicio' },
  { t:'Compara a los postulantes', d:'Andrés y Daniela ya tienen jornada: la plataforma muestra quién tiene la ruta más corta.', rol:'rt', go:'personas' },
  { t:'Evalúa como parte externa', d:'Identifícate, marca las estaciones de banco genérico de Felipe y entrega. El kiosco no deja salir a otra sección.', rol:'externo', go:'kiosco-' + RIDS.sesionJT },
  { t:'Evalúa como formadora', d:'Camila marca la estación interna que le asignaron (OBD).', rol:'formador', go:'agenda' },
  { t:'Acepta y cierra la jornada', d:'Como Responsable Técnico: acepta lo de Camila, marca la base y cierra.', rol:'rt', go:'sesion-' + RIDS.sesionJT },
  { t:'Revisa el plan de Felipe', d:'Nivelación, oficio saltado y ruta completa, calculados solos.', rol:'rt', go:'persona-' + RIDS.felipe },
  { t:'Revisa el tablero de indicadores', d:'Los ocho indicadores del informe 6, con vista de tabla.', rol:'rt', go:'indicadores' },
  { t:'Mira la ruta de un técnico', d:'Ignacio ve solo lo suyo: nivel, próximo paso, duo y revalidación.', rol:'tecnico', go:'ruta' },
  { t:'Prueba el módulo con simulador', d:'Aprende, practica con el simulador y rinde la práctica: una pregunta a la vez, alternativas mezcladas y sin el material a la vista.', rol:'tecnico', go:'modulo-N1-1' },
  { t:'Revisa los 20 controles de seguridad', d:'Qué cubre la plataforma, qué cubre claude.ai y qué queda pendiente.', rol:'rt', go:'ajustes-seguridad' }
];
function abrirRecorrido(){
  openSheet('Recorrido guiado', close => h('ol', { class:'stack', style:'--g:8px;list-style:none' }, RECORRIDO.map((p, i) => {
    const b = h('button', { type:'button', class:'role-opt' }, h('span', { class:'av', style:'background:var(--action)' }, String(i + 1)), h('span', { class:'rt' }, h('b', null, p.t), h('span', null, p.d)));
    b.addEventListener('click', async () => { close(); if(S.demoRole !== p.rol){ S.demoRole = p.rol; await iniciarDemo(); } go(p.go); });
    return h('li', null, b);
  })));
}

/* ---------- pie ---------- */
function renderFooter(){
  const f = $('#foot'); clear(f);
  if(parseHash().id === 'kiosco') return;
  addKids(f, [h('footer', { class:'footer' }, h('div', { class:'wrap' },
    h('div', { class:'fcols' },
      h('div', { class:'stack', style:'--g:12px' }, h('span', { class:'lockup', style:'width:150px;color:var(--ink)', role:'img', 'aria-label':'Lumine Motors' }), h('p', { class:'small muted', style:'max-width:36ch' }, 'Sistema de selección y habilitación por competencias del Técnico Instalador de Sistemas de Hibridación Vehicular.')),
      h('div', null, h('h4', null, 'Plataforma'), h('ul', null, ['inicio','diccionario'].concat(S.role === 'admin' ? ['indicadores','ajustes'] : []).map(id => h('li', null, h('a', { href:'#' + id }, ROUTES[id].t))))),
      h('div', null, h('h4', null, 'Referencias'), h('ul', null, FUENTES.map(([t, u]) => h('li', null, h('a', { href:u, target:'_blank', rel:'noopener noreferrer' }, t.split(',')[0]))))),
      h('div', null, h('h4', null, 'Equipo'), h('ul', null, ['Diego Alarcón','Benjamín Torres','Lukas Verdugo'].map(n => h('li', null, n)), h('li', null, 'Taller Integrador II · UNAB')))),
    h('div', { class:'legal' }, h('span', null, 'Lumine Motors · Fase 3, gestión de personas · 2026'), h('span', null, S.build === 'demo' ? 'Demostración: personas y resultados ficticios' : 'Versión de operación'))))]);
}
