/* =====================================================================
   Vistas de administración: Panel, Personas y Expediente
   ===================================================================== */
'use strict';

function phead(o){
  return h('header', { class:'phead' },
    h('div', { class:'ph-t' }, o.back ? h('a', { class:'back', href:'#' + o.back[0] }, icon('arrowLeft', 's16'), o.back[1]) : null,
      o.eyebrow ? eyebrow(o.eyebrow, o.eic) : null, h('h1', { class: o.big ? 'display' : 'h1' }, o.title), o.lead ? h('p', { class:'lead' }, o.lead) : null),
    o.actions && o.actions.length ? h('div', { class:'ph-a' }, o.actions) : null);
}
function page(...kids){ return h('div', { class:'wrap page' }, ...kids); }
function sinDatos(keys){ return !cargado(keys); }
const ETAPA = { postulante:['Postulante','info'], tecnico:['Técnico','ink'], salio:['Salió','line'], descartado:['Descartado','line'] };
function etapaBadge(e){ const x = ETAPA[e] || ['?','line']; return badge(x[0], x[1]); }
function perfilL(k){ return (PERFILES[k] || PERFILES.otro).l; }
function nombreP(pid){ const p = persona(pid); return p ? p.nombre : '(persona eliminada)'; }

/* ---------- próximo paso de una persona (vista de administración) ---------- */
function proximoPaso(p){
  const pr = params();
  if(p.etapa === 'postulante'){
    const d = estadoDiagnostico(p);
    const jt = sesionAbiertaDe(p.id, 'JT');
    if(!d.fundamentos) return { s:'info', t:'Falta la prueba de fundamentos', d:'Se rinde online. También se puede registrar aquí si la hizo en papel.', a:'fund' };
    if(!d.jornada && jt) return { s:'info', t:'Jornada técnica en curso', d: resumenSesion(jt).marcados + ' de ' + resumenSesion(jt).total + ' ítems marcados.', a:'sesion', sid: jt.id };
    if(!d.jornada) return { s:'info', t:'Programar la jornada técnica', d: mapaPreliminar(p.antecedentes).length + ' estaciones de oficio marcadas por su mapa preliminar.', a:'JT' };
    const r = resumenRuta(p, pr);
    return { s:'ok', t:'Diagnóstico completo: decidir ingreso', d:'Ruta de ' + r.cursar + ' competencias, ' + r.oficio + ' de oficio demostradas y ' + r.nivelacion + ' módulos de nivelación.', a:'ingreso' };
  }
  if(p.etapa !== 'tecnico') return null;
  if(p.suspendidoAT) return { s:'crit', t:'Suspendido de alta tensión', d:'Tuvo un incidente grave. Programa la revalidación del core de seguridad.', a:'REV' };
  const rv = revalidacion(p, pr, S.hoy);
  if(rv.estado === 'vencida') return { s:'crit', t:'Revalidación vencida', d:'Venció el ' + fechaLarga(rv.vence) + '.', a:'REV' };
  const sig = siguienteNivel(p);
  if(!sig) return { s:'ok', t:'Formador habilitado', d:'Puede enseñar, validar a otros y firmar revisiones cruzadas.', a:null };
  const abierta = sesionAbiertaDe(p.id, 'N' + sig);
  if(abierta) return { s:'info', t:'Validación del nivel ' + sig + ' en curso', d: resumenSesion(abierta).marcados + ' de ' + resumenSesion(abierta).total + ' ítems marcados.', a:'sesion', sid: abierta.id };
  const rep = repetir(p);
  if(rep.length) return { s:'warn', t:'Repetir: ' + rep.join(', '), d:'Se repite solo lo reprobado, no la validación completa.', a:'N' + sig };
  const lp = listoAdmin(p, sig);
  if(rv.estado === 'pronto') return { s:'warn', t:'Revalidación por vencer', d:'Vence el ' + fechaLarga(rv.vence) + '. Siguiente nivel: ' + sig + '.', a:'REV' };
  return { s: lp.listo === false ? 'info' : 'ok', t:'Siguiente: validación del nivel ' + sig, d: lp.txt, a:'N' + sig };
}
function listoAdmin(p, n){
  if(!p.uid) return { listo:null, txt:'Sin cuenta vinculada: la práctica online no se puede verificar.' };
  const plan = planPersonal(p, params());
  const r = listoParaPresentarse(n, plan, S.D.avance[p.uid]);
  return { listo:r.listo, txt: r.listo ? 'Completó la práctica online del nivel: tiene derecho a presentarse.' : 'Práctica online: faltan ' + r.faltan.length + ' de ' + r.total + ' módulos (' + r.faltan.join(', ') + ').', faltan:r.faltan };
}

/* ---------- avisos de infraestructura (no se esconden) ---------- */
function avisosSalud(){
  const out = [];
  const u = usoBase();
  if(u.aviso) out.push(notice('warn', 'database', h('b', null, 'La base va en ' + u.pct + '% de su capacidad. '), u.docs.toLocaleString('es-CL') + ' de ' + u.cap.toLocaleString('es-CL') + ' documentos. Exporta un respaldo y revisa Ajustes › Consistencia.'));
  if(S.salud.perfiles) out.push(notice('warn', 'users', h('b', null, 'No se pudieron cargar los nombres de las cuentas. '), 'Algunas personas aparecen como "Usuario sin nombre visible". Detalle: ' + S.salud.perfiles.msg + '. Si se repite, revisa los permisos del artifact en claude.ai.'));
  if(cargado(['personas','duos','sesiones','agenda','expedientes'])){
    const inc = revisarConsistencia(ctx({ expedientes: S.D.expedientes })).filter(x => !x.id.startsWith('exp-') || !RECON_CORRIENDO);
    if(inc.length) out.push(notice('warn', 'alert', h('b', null, inc.length === 1 ? 'Hay 1 dato inconsistente. ' : 'Hay ' + inc.length + ' datos inconsistentes. '), 'Suele quedar así cuando una operación de varios pasos se corta. ', h('a', { href:'#ajustes-consistencia' }, 'Revisar y reparar')));
  }
  return out.length ? h('div', { class:'stack', style:'--g:8px;margin-bottom:18px' }, out) : null;
}

/* ---------- ENTRADA DE ADMINISTRACIÓN ----------
   La identidad la entrega claude.ai: quien es dueño o Editor entra como administración.
   Esta pantalla deja elegir cómo seguir y ver la plataforma como la vería otra persona. */
VIEWS.entrar = function(){
  if(sinDatos(['personas'])) return vistaCargando();
  const tecs = personas().filter(p => p.etapa === 'tecnico' || p.etapa === 'postulante');
  const sel = selectEl(tecs.map(p => [p.id, p.nombre + ' · ' + (p.etapa === 'postulante' ? 'postulante con expediente' : nivelNombre(p.nivel || 0))]), tecs[0] ? tecs[0].id : '');
  const card = (ic, titulo, texto, accion, extra) => h('div', { class:'card stack entry-card', style:'--g:12px' }, h('span', { class:'entry-ic' }, icon(ic, 's20')), h('h2', { class:'h4' }, titulo), h('p', { class:'small ink2' }, texto), extra || null, h('div', { class:'row', style:'margin-top:auto' }, accion));
  return page(
    phead({ eyebrow:'Entrada', eic:'swap', title:'Hola' + (S.me.name ? ', ' + S.me.name.split(' ')[0] : ''), lead:'Entraste con tu cuenta de claude.ai como ' + (ROL_L[miRol()] || 'Administración').toLowerCase() + '. Elige cómo seguir.' }),
    h('div', { class:'grid g3', style:'--g:14px;align-items:stretch' },
      card('grid', 'Administración', 'Personas, validaciones, duos, indicadores y ajustes. Todo lo que hagas se guarda en la base.', linkBtn('Ir al panel', 'panel', { kind:'action', arrow:true })),
      card('userPlus', 'Ver como postulante', 'Recorre la postulación tal como la ve alguien que entra por primera vez: antecedentes, prueba de fundamentos y envío. Nada se guarda.', btn('Abrir vista previa', { kind:'ghost', icon:'eye', onClick: ev => busy(ev.currentTarget, () => iniciarVistaPrevia('postulante')) })),
      card('user', 'Ver como técnico', 'Mira la ruta, los módulos y la práctica de una persona real, con sus datos de hoy. Nada se guarda.', btn('Abrir vista previa', { kind:'ghost', icon:'eye', disabled: !tecs.length || null, onClick: ev => busy(ev.currentTarget, () => iniciarVistaPrevia('tecnico', sel.value)) }), tecs.length ? field('Persona', sel) : h('p', { class:'hint' }, 'Aún no hay técnicos ni postulantes con expediente.'))),
    h('section', { class:'card section', style:'margin-top:20px' }, h('h2', { class:'h4', style:'margin-bottom:10px' }, 'Cómo entra cada persona'),
      h('ol', { class:'steps-ol' },
        h('li', null, h('b', null, 'No hay usuario ni contraseña propios. '), 'La plataforma usa la cuenta de claude.ai de cada persona. Así nadie tiene que recordar otra clave y el acceso se quita desde un solo lugar.'),
        h('li', null, h('b', null, 'Postulantes y técnicos: '), 'compárteles el enlace con permiso de Colaborador. Al abrirlo, quien no tiene expediente ve la postulación; cuando creas su expediente desde la alerta de "Nueva postulación", ve su ruta.'),
        h('li', null, h('b', null, 'Administración: '), 'permiso de Editor. Los roles internos (Responsable Técnico, Ingeniería de Calibración, formador) se asignan en Ajustes › Equipo.'),
        h('li', null, h('b', null, 'Evaluador externo: '), 'no recibe cuenta. Usa el kiosco en un equipo de Lumine, que se abre con PIN desde Validaciones.'))));
};

/* ---------- PANEL ---------- */
VIEWS.panel = function(){
  if(sinDatos(['personas','sesiones','duos','registros','params'])) return vistaCargando();
  const c = ctx();
  const al = alertas(c);
  const sols = solicitudesRotacion();
  if(sols.length) al.unshift({ s:'info', t: sols.length === 1 ? '1 solicitud de rotación por revisar' : sols.length + ' solicitudes de rotación por revisar', d: sols.map(x => x.p.nombre).join(', ') + '. Cada una explica por qué pide cambiar de duo.', ref:{ tipo:'duo' } });
  const act = activos(c.personas);
  const abiertas = c.sesiones.filter(x => x.estado === 'abierta').sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const post = c.personas.filter(p => p.etapa === 'postulante');
  const dAct = c.duos.filter(d => d.activo);
  const dVal = dAct.filter(d => estadoDuo(d, c.P, c.personas, S.hoy, c.params).valido).length;
  const porNivel = [0,1,2,3,4].map(n => act.filter(p => (p.nivel || 0) === n).length);
  const bit = Object.values(S.D.bitacora).flatMap(m => Object.values(m.eventos || {})).sort((a, b) => String(b.t).localeCompare(String(a.t))).slice(0, 6);
  resolverPerfiles(bit.map(e => e.uid));

  /* HOY: todo lo que pide una acción, en un solo lugar y ordenado por urgencia */
  const rank = { crit:0, warn:1, info:2 };
  const hoyItems = abiertas.filter(x => x.fecha && x.fecha <= S.hoy).map(sx => ({ s: sx.fecha < S.hoy ? 'warn' : 'info', t: TIPOS_SESION[sx.tipo].l + ' · ' + nombreP(sx.pid), d: sx.fecha < S.hoy ? 'Atrasada desde el ' + fechaCorta(sx.fecha) + '.' : 'Programada para hoy.', ref:{ tipo:'sesion', id:sx.id } }))
    .concat(al.filter(a => !(a.ref && a.ref.tipo === 'sesion' && abiertas.some(x => x.id === a.ref.id && x.fecha <= S.hoy))))
    .sort((a, b) => rank[a.s] - rank[b.s]);
  const todo = ui('panel-todo', false);
  const nCrit = hoyItems.filter(x => x.s === 'crit').length;
  const hoyCard = h('section', { class:'hoy-card' + (hoyItems.length ? (nCrit ? ' crit' : '') : ' ok'), 'aria-labelledby':'hoy-t' },
    h('div', { class:'hoy-h' },
      h('div', { class:'stack', style:'--g:6px;min-width:0' }, h('span', { class:'next-ey' }, 'Hoy · ' + fechaLarga(S.hoy)),
        h('h2', { class:'next-t', id:'hoy-t' }, hoyItems.length ? (hoyItems.length === 1 ? '1 cosa requiere tu atención' : hoyItems.length + ' cosas requieren tu atención') : 'Todo en orden por hoy')),
      h('div', { class:'hoy-n', 'aria-hidden':'true' }, hoyItems.length ? h('b', { class:'num' }, String(hoyItems.length)) : icon('checkCircle', 's32'))),
    hoyItems.length ? h('div', { class:'alerts' }, (todo ? hoyItems : hoyItems.slice(0, 5)).map(a => alertaItem(a))) : h('p', { class:'small ink2' }, 'Sin validaciones atrasadas ni alertas. Las reglas automáticas revisan duos, revalidaciones y suspensiones cada vez que cambia un dato.'),
    hoyItems.length > 5 ? h('div', { class:'row' }, btn(todo ? 'Ver menos' : 'Ver las ' + hoyItems.length, { kind:'quiet', size:'sm', icon: todo ? 'minus' : 'plus', onClick: () => { UI['panel-todo'] = !todo; render(true); } })) : null);

  const stats = h('div', { class:'grid g4 keep2', style:'--g:12px' },
    h('a', { class:'card stat link', href:'#personas' }, h('span', { class:'sl' }, icon('users', 's16'), 'Técnicos activos'), h('span', { class:'sv' }, String(act.length)),
      h('span', { class:'sd' }, porNivel.map((v, i) => (i === 0 ? 'formación ' : 'N' + i + ' ') + v).join(' · '))),
    h('a', { class:'card stat link', href:'#duos' }, h('span', { class:'sl' }, icon('duo', 's16'), 'Duos válidos', ayuda('Válido: tiene al menos un técnico de nivel 3 o 4 y nunca dos de nivel 1. En la primera generación trabajan con supervisión del Responsable Técnico.')), h('span', { class:'sv' }, String(dVal), h('small', null, 'de ' + dAct.length)), h('span', { class:'sd' }, 'con al menos un nivel 3 o 4')),
    h('a', { class:'card stat link', href:'#validaciones' }, h('span', { class:'sl' }, icon('clipboard', 's16'), 'Validaciones abiertas'), h('span', { class:'sv' }, String(abiertas.length)), h('span', { class:'sd' }, abiertas.filter(x => x.fecha <= S.hoy).length + ' para hoy o atrasadas')),
    h('a', { class:'card stat link', href:'#personas' }, h('span', { class:'sl' }, icon('userPlus', 's16'), 'Postulantes'), h('span', { class:'sv' }, String(post.length)), h('span', { class:'sd' }, post.filter(p => p.jornada && p.jornada.fecha).length + ' con diagnóstico completo')));

  const semana = abiertas.filter(x => x.fecha > S.hoy && diffDays(S.hoy, x.fecha) <= 14);
  const prox = semana.length ? h('div', { class:'stack', style:'--g:8px' }, semana.slice(0, 5).map(sx => sesionItem(sx))) : emptyState('calendar', 'Nada programado en las próximas dos semanas', null, btn('Programar validación', { kind:'ghost', size:'sm', icon:'plus', onClick: () => hojaNuevaSesion() }));
  const actividad = bit.length ? h('div', { class:'stack', style:'--g:0' }, bit.map(e => h('div', { class:'row nw', style:'gap:10px;padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start' },
    h('span', { class:'dot spark', style:'margin-top:7px' }), h('div', { class:'grow' }, h('div', { class:'small', style:'font-weight:600' }, e.a), h('div', { class:'hint' }, (e.d ? e.d + ' · ' : '') + nombreUid(e.uid) + ' · ' + fechaHora(e.t)))))) : h('p', { class:'hint' }, 'Aún no hay actividad este mes.');

  return page(
    phead({ eyebrow:'Panel · ' + (ROL_L[miRol()] || 'Administración'), eic:'grid', title:'Estado del taller',
      actions:[ btn('Nuevo postulante', { kind:'ghost', icon:'userPlus', onClick: hojaNuevoPostulante }), btn('Programar validación', { kind:'action', icon:'plus', onClick: () => hojaNuevaSesion() }) ] }),
    avisosSalud(),
    hoyCard,
    stats,
    h('div', { class:'grid', style:'grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:20px;margin-top:24px', id:'panel-cols' },
      h('section', { class:'stack', style:'--g:12px' }, h('div', { class:'section-h', style:'margin:0' }, h('h2', { class:'h3' }, 'Próximas dos semanas'), h('a', { href:'#validaciones', class:'small', on:{ click: () => { UI['val-tab'] = 'calendario'; } } }, 'Ver calendario')), prox),
      h('section', { class:'card' }, h('div', { class:'card-h' }, h('h2', { class:'h4' }, 'Actividad reciente'), h('a', { href:'#ajustes-bitacora', class:'small' }, 'Bitácora')), actividad)));
};
function alertaItem(a){
  let accion = null;
  if(a.ref && a.ref.tipo === 'postulacion') accion = btn('Crear expediente', { kind:'action', size:'sm', onClick: async ev => { await busy(ev.currentTarget, async () => { const id = await crearDesdePostulacion(a.ref.id); toast('Expediente creado'); go('persona-' + id); }); } });
  else if(a.accion === 'REV') accion = btn('Revalidar', { kind:'ghost', size:'sm', onClick: () => hojaNuevaSesion(a.ref.id, 'REV') });
  else if(a.ref) accion = linkBtn('Ver', a.ref.tipo === 'duo' ? 'duos' : a.ref.tipo === 'sesion' ? 'sesion-' + a.ref.id : 'persona-' + a.ref.id, { size:'sm' });
  return h('div', { class:'alert ' + a.s }, h('span', { class:'ai' }, icon(a.s === 'crit' ? 'alert' : a.s === 'warn' ? 'clock' : 'info', 's20')),
    h('div', null, h('div', { class:'at' }, a.t), a.d ? h('div', { class:'ad' }, a.d) : null), accion ? h('div', { class:'aa' }, accion) : null);
}
function sesionItem(sx){
  const p = persona(sx.pid);
  const rs = resumenSesion(sx);
  const pct = rs.total ? Math.round(100 * rs.marcados / rs.total) : 0;
  const recibidas = recibidasSinAceptar(sx, S.D.marcas, S.D.agenda).length;
  const b = h('a', { class:'card link', href:'#sesion-' + sx.id, style:'--pad:14px' },
    h('div', { class:'sess' },
      h('div', { class:'stack', style:'--g:6px;min-width:0' },
        h('div', { class:'row', style:'gap:8px' }, h('b', { class:'small' }, TIPOS_SESION[sx.tipo].l), sx.intento > 1 ? badge('Intento ' + sx.intento, 'warn') : null, recibidas ? badge('Resultados recibidos', 'info', 'download') : null),
        h('div', { class:'small ink2' }, (p ? p.nombre : '?') + ' · ' + fechaCorta(sx.fecha) + (sx.fecha < S.hoy ? ' · atrasada' : sx.fecha === S.hoy ? ' · hoy' : '')),
        h('div', { class:'progress', role:'progressbar', 'aria-valuenow':String(pct), 'aria-valuemin':'0', 'aria-valuemax':'100', 'aria-label':'Avance de la pauta' }, h('i', { style:'width:' + pct + '%' }))),
      h('span', { class:'small muted num' }, rs.marcados + '/' + rs.total)));
  return b;
}

/* ---------- PERSONAS ---------- */
VIEWS.personas = function(){
  if(sinDatos(['personas','duos','sesiones'])) return vistaCargando();
  const f = ui('personas-f', 'todos');
  const q = ui('personas-q', '');
  const ps = personas();
  const cnt = k => ps.filter(p => k === 'todos' ? p.etapa !== 'descartado' : p.etapa === k).length;
  const filtros = [['todos','Todos'],['postulante','Postulantes'],['tecnico','Técnicos'],['salio','Salidas'],['descartado','Descartados']];
  const qq = q.trim().toLowerCase();
  const lista = ps.filter(p => (f === 'todos' ? p.etapa !== 'descartado' : p.etapa === f) && (!qq || p.nombre.toLowerCase().includes(qq)));
  const listBox = h('div');
  function pintarLista(){
    clear(listBox);
    if(!lista.length){ listBox.appendChild(emptyState('users', 'Sin resultados', qq ? 'Nadie coincide con “' + q + '”.' : 'Aún no hay personas en esta etapa.')); return; }
    const t = h('div', { class:'tscroll only-desk' }, h('table', { class:'t' },
      h('thead', null, h('tr', null, h('th', null, 'Persona'), h('th', null, 'Etapa y nivel'), h('th', null, 'Próximo paso'), h('th', null, 'Duo'), h('th', null, 'Estado'))),
      h('tbody', null, lista.map(p => {
        const tr = h('tr', { class:'click', tabindex:'0', 'aria-label':'Abrir expediente de ' + p.nombre },
          h('td', null, h('div', { class:'row nw', style:'gap:10px' }, avatar(p.nombre, colorDe(p)), h('div', null, h('div', { style:'font-weight:600' }, p.nombre), h('div', { class:'hint' }, perfilL(p.perfil))))),
          h('td', null, h('div', { class:'stack', style:'--g:5px' }, etapaBadge(p.etapa), p.etapa === 'tecnico' ? h('span', { class:'row', style:'gap:6px' }, pips(p.nivel || 0), h('span', { class:'hint' }, nivelNombre(p.nivel || 0))) : null)),
          h('td', { style:'max-width:320px' }, pasoCorto(p)),
          h('td', null, duoCorto(p)),
          h('td', null, estadoTags(p)));
        const open = () => go('persona-' + p.id);
        tr.addEventListener('click', open); tr.addEventListener('keydown', e => { if(e.key === 'Enter') open(); });
        return tr;
      }))));
    const cards = h('div', { class:'stack only-mob', style:'--g:8px' }, lista.map(p => h('a', { class:'card link', href:'#persona-' + p.id, style:'--pad:14px' },
      h('div', { class:'row nw', style:'gap:12px;align-items:flex-start' }, avatar(p.nombre, colorDe(p)),
        h('div', { class:'grow stack', style:'--g:6px' }, h('div', { class:'row sb nw' }, h('b', null, p.nombre), p.etapa === 'tecnico' ? pips(p.nivel || 0) : etapaBadge(p.etapa)),
          h('div', { class:'hint' }, perfilL(p.perfil) + (p.etapa === 'tecnico' ? ' · ' + nivelNombre(p.nivel || 0) : '')), pasoCorto(p), estadoTags(p))))));
    listBox.appendChild(t); listBox.appendChild(cards);
  }
  const vista = ui('personas-vista', 'embudo');
  if(vista === 'embudo') listBox.appendChild(embudoPersonas(ps.filter(p => (p.etapa === 'postulante' || p.etapa === 'tecnico') && (!qq || p.nombre.toLowerCase().includes(qq)))));
  else pintarLista();
  const search = h('input', { class:'input', type:'search', placeholder:'Buscar por nombre', value:q, 'aria-label':'Buscar persona', maxlength:'60' });
  search.addEventListener('input', () => { UI['personas-q'] = search.value; });
  search.addEventListener('change', () => render(true));
  search.addEventListener('keydown', e => { if(e.key === 'Enter'){ UI['personas-q'] = search.value; search.blur(); render(true); } });
  const post = ps.filter(p => p.etapa === 'postulante' && p.jornada && p.jornada.fecha);
  return page(
    phead({ eyebrow:'Selección y seguimiento', eic:'users', title:'Personas', lead:'De postulante a formador. Toca a una persona para ver su expediente.',
      actions:[ btn('Comparar postulantes', { kind:'ghost', icon:'swap', disabled: post.length < 2 || null, onClick: hojaComparar }), btn('Nuevo postulante', { kind:'action', icon:'userPlus', onClick: hojaNuevoPostulante }) ] }),
    postulacionesPendientes(),
    h('div', { class:'filters' }, segmented([{ v:'embudo', l:'Embudo', ic:'layers' }, { v:'lista', l:'Lista', ic:'list' }], vista, v => { UI['personas-vista'] = v; render(true); }, { label:'Vista' }),
      vista === 'lista' ? filtros.map(([k, l]) => { const b = h('button', { type:'button', class:'chip', 'aria-pressed': f === k ? 'true' : 'false' }, l, h('span', { class:'n' }, String(cnt(k)))); b.addEventListener('click', () => { UI['personas-f'] = k; render(true); }); return b; }) : null,
      h('div', { class:'searchbox' }, icon('search'), search)),
    listBox);
};
/* Embudo: cada persona en la columna de su etapa, de postulante a formador */
function embudoPersonas(ps){
  const cols = [
    { t:'Postulantes', d:'Diagnóstico en curso', f: p => p.etapa === 'postulante' && !(p.jornada && p.jornada.fecha) },
    { t:'Diagnóstico listo', d:'Decidir ingreso', f: p => p.etapa === 'postulante' && p.jornada && p.jornada.fecha },
    { t:'En formación', d:'Hacia el nivel 1', f: p => p.etapa === 'tecnico' && !(p.nivel >= 1) }
  ].concat([1,2,3,4].map(n => ({ t:'Nivel ' + n, d: NIVEL[n].corto, f: p => p.etapa === 'tecnico' && p.nivel === n, n })));
  return h('div', { class:'embudo', role:'list', 'aria-label':'Personas por etapa' }, cols.map(c => {
    const xs = ps.filter(c.f);
    return h('section', { class:'emb-col', role:'listitem', 'aria-label': c.t + ': ' + xs.length },
      h('div', { class:'emb-h' }, h('div', null, h('b', null, c.t), h('span', { class:'hint', style:'display:block' }, c.d)), h('span', { class:'emb-n num' }, String(xs.length))),
      h('div', { class:'emb-list' }, xs.length ? xs.map(p => h('a', { class:'emb-card', href:'#persona-' + p.id },
        h('div', { class:'row nw', style:'gap:8px' }, avatar(p.nombre, colorDe(p)), h('b', { class:'small', style:'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, p.nombre)),
        pasoCorto(p), p.suspendidoAT ? badge('Suspendido AT', 'crit') : null)) : h('span', { class:'hint emb-vacio' }, 'Nadie aquí')));
  }));
}
function colorDe(p){ return p.uid && PROFILES[p.uid] && PROFILES[p.uid].color ? PROFILES[p.uid].color : null; }
function pasoCorto(p){
  const x = proximoPaso(p);
  if(!x) return h('span', { class:'hint' }, p.etapa === 'salio' && p.salida ? 'Salió el ' + fechaCorta(p.salida.fecha) : p.etapa === 'descartado' ? 'Descartado' : '—');
  return h('div', { class:'row nw', style:'gap:8px;align-items:flex-start' }, h('span', { class:'dot ' + (x.s === 'crit' ? 'crit' : x.s === 'warn' ? 'warn' : x.s === 'ok' ? 'ok' : 'spark'), style:'margin-top:7px' }), h('span', { class:'small' }, x.t));
}
function duoCorto(p){
  if(p.etapa !== 'tecnico') return h('span', { class:'hint' }, '—');
  const comp = companero(p.id, duos());
  return comp ? h('span', { class:'small' }, nombreP(comp)) : h('span', { class:'badge warn' }, 'Sin duo');
}
function estadoTags(p){
  const tags = [];
  if(p.suspendidoAT) tags.push(badge('Suspendido AT', 'crit', 'shieldX'));
  if(p.etapa === 'tecnico'){ const rv = revalidacion(p, params(), S.hoy); if(rv.estado === 'vencida') tags.push(badge('Revalidación vencida', 'crit')); else if(rv.estado === 'pronto') tags.push(badge('Revalida ' + relDias(rv.dias), 'warn')); }
  if(p.demo) tags.push(badge('Ficticio', 'demo'));
  return tags.length ? h('div', { class:'tag-row' }, tags) : h('span', { class:'hint' }, 'En orden');
}
function postulacionesPendientes(){
  const po = postulaciones();
  if(!po.length) return null;
  return h('div', { class:'stack', style:'--g:8px;margin-bottom:18px' }, po.map(x => alertaItem({ s:'info', t:'Nueva postulación: ' + (x.nombre || 'sin nombre'), d:(PERFILES[x.perfil] || PERFILES.otro).l + ' · enviada el ' + fechaHora(x.enviada) + (x.fundamentos ? ' · prueba de fundamentos rendida' : ' · sin prueba de fundamentos'), ref:{ tipo:'postulacion', id:x.uid } })));
}

/* ---------- formularios de antecedentes (reutilizado por postulante y administración) ---------- */
function formAntecedentes(estado, onChange){
  const a = estado;
  const mapaBox = h('div', { class:'tag-row', 'aria-live':'polite' });
  const pintarMapa = () => { clear(mapaBox); const m = mapaPreliminar(a); if(!m.length) mapaBox.appendChild(h('span', { class:'hint' }, 'Todavía no hay estaciones marcadas. Marca tu experiencia o certificados.')); m.forEach(c => mapaBox.appendChild(h('span', { class:'badge line', title: C[c].t }, c + ' · ' + C[c].t.split(' ').slice(0, 4).join(' ') + '…'))); if(onChange) onChange(); };
  const perfil = selectEl(Object.keys(PERFILES).map(k => [k, PERFILES[k].l]), a.perfil);
  perfil.addEventListener('change', () => { a.perfil = perfil.value; pintarMapa(); });
  const anos = inputEl({ type:'number', min:'0', max:'60', inputmode:'numeric', value: a.anos || 0 });
  anos.addEventListener('input', () => { a.anos = anos.value; });
  const form = inputEl({ maxlength:'140', value: a.formacion || '', placeholder:'Ej.: Técnico en mecánica automotriz' });
  form.addEventListener('input', () => { a.formacion = form.value; });
  const checks = (list, key, getId, getL) => h('div', { class:'grid g2', style:'--g:8px' }, list.map(x => {
    const id = getId(x);
    const cb = h('input', { type:'checkbox', checked: !!(a[key] && a[key][id]) });
    const lab = h('label', { class:'check' + (cb.checked ? ' on' : '') }, cb, h('span', { class:'small' }, getL(x)));
    cb.addEventListener('change', () => { a[key] = Object.assign({}, a[key] || {}); if(cb.checked) a[key][id] = true; else delete a[key][id]; lab.classList.toggle('on', cb.checked); pintarMapa(); });
    return lab;
  }));
  pintarMapa();
  return h('div', { class:'stack', style:'--g:16px' },
    h('div', { class:'grid g2', style:'--g:12px' }, field('Perfil de entrada', perfil), field('Años de experiencia', anos)),
    field('Formación', form),
    h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Certificados'), checks(CERTIFICADOS, 'certificados', x => x.id, x => x.l)),
    h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Experiencia'), checks(EXPERIENCIAS, 'experiencias', x => x.c, x => x.l)),
    h('div', { class:'card mist', style:'--pad:14px' }, h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Mapa preliminar: estaciones de oficio para la jornada'), mapaBox,
      h('span', { class:'hint' }, 'Un certificado o una experiencia marcan la estación. No la saltan: el oficio se salta solo demostrándolo en la jornada técnica.'))));
}
function formFundamentos(resp, onDone, opts){
  opts = opts || {};
  const box = h('div', { class:'stack', style:'--g:18px' });
  // opts.semilla: el postulante online ve las alternativas en otro orden (se guarda el índice original).
  // Sin semilla (administración transcribiendo una prueba en papel) se respeta el orden del dato.
  FUNDAMENTOS.forEach((q, i) => {
    const opts2 = h('div', { class:'opts', role:'radiogroup', 'aria-label':'Pregunta ' + (i + 1) });
    const orden = opts.semilla != null ? barajar(q.o.map((_, j) => j), opts.semilla + i * 7919) : q.o.map((_, j) => j);
    orden.forEach((j, pos) => {
      const o = q.o[j];
      const b = h('button', { type:'button', class:'opt', role:'radio', 'aria-checked': resp[q.id] === j ? 'true' : 'false', 'aria-pressed': resp[q.id] === j ? 'true' : 'false' }, h('span', { class:'ol' }, 'ABCD'[pos]), h('span', null, o));
      b.addEventListener('click', () => { resp[q.id] = j; for(const x of opts2.children){ x.setAttribute('aria-pressed', 'false'); x.setAttribute('aria-checked', 'false'); } b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-checked', 'true'); if(opts.onChange) opts.onChange(); });
      opts2.appendChild(b);
    });
    box.appendChild(h('div', { class:'q' }, h('div', { class:'row', style:'gap:8px' }, badge(AREAS[q.area], 'line'), h('span', { class:'hint' }, (i + 1) + ' de ' + FUNDAMENTOS.length)), h('p', { class:'h4', style:'font-weight:600' }, q.q), opts2));
  });
  return box;
}

/* ---------- hoja: nuevo postulante ---------- */
function hojaNuevoPostulante(){
  const st = { nombre:'', ant:{ perfil:'mecanico', anos:0, formacion:'', certificados:{}, experiencias:{} }, resp:{}, conFund:false };
  openSheet('Nuevo postulante', close => {
    const nom = inputEl({ maxlength:'120', placeholder:'Nombre y apellido', autofocus:true });
    nom.addEventListener('input', () => { st.nombre = nom.value; });
    const fundBox = h('div');
    const tg = h('input', { type:'checkbox' });
    tg.addEventListener('change', () => { st.conFund = tg.checked; clear(fundBox); if(tg.checked) fundBox.appendChild(formFundamentos(st.resp)); });
    const save = btn('Registrar postulante', { kind:'action', icon:'check' });
    save.addEventListener('click', () => busy(save, async () => {
      const id = await crearPostulante({ nombre: st.nombre, antecedentes: st.ant, respuestas: st.conFund ? st.resp : null });
      toast('Postulante registrado'); close(); go('persona-' + id);
    }));
    return h('div', { class:'stack', style:'--g:18px' },
      notice('info', 'info', 'Normalmente el postulante registra sus antecedentes y rinde la prueba desde su cuenta. Este formulario es para quien postula en persona.'),
      field('Nombre', nom),
      formAntecedentes(st.ant),
      h('label', { class:'check' }, tg, h('span', { class:'small' }, 'Registrar ahora la prueba de fundamentos (si la rindió en papel)')),
      fundBox,
      h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), save));
  }, { wide:true });
}

/* ---------- hoja: comparar postulantes (selección) ---------- */
function hojaComparar(){
  const cand = personas().filter(p => p.etapa === 'postulante' && p.jornada && p.jornada.fecha);
  const sel = new Set(cand.slice(0, 3).map(p => p.id));
  openSheet('Comparar postulantes', close => {
    const out = h('div');
    const pintar = () => {
      clear(out);
      const ps = cand.filter(p => sel.has(p.id));
      if(ps.length < 2){ out.appendChild(h('p', { class:'hint' }, 'Elige al menos dos postulantes.')); return; }
      const rs = ps.map(p => ({ p, r: resumenRuta(p, params()) }));
      const best = Math.min(...rs.map(x => x.r.cursar));
      out.appendChild(h('div', { class:'tscroll' }, h('table', { class:'t' },
        h('thead', null, h('tr', null, h('th', null, ''), rs.map(x => h('th', null, x.p.nombre)))),
        h('tbody', null,
          h('tr', null, h('td', null, 'Perfil de entrada'), rs.map(x => h('td', null, perfilL(x.p.perfil)))),
          h('tr', null, h('td', null, 'Oficio demostrado'), rs.map(x => h('td', { class:'num' }, x.r.oficio + ' de 11'))),
          h('tr', null, h('td', null, 'Nivelación'), rs.map(x => h('td', null, x.r.plan.nivelacion.length ? x.r.plan.nivelacion.map(id => MOD[id].nombre.replace('Nivelación ', '').replace('de ', '')).join(', ') : 'Ninguna'))),
          h('tr', null, h('td', null, 'Competencias por cursar'), rs.map(x => h('td', { class:'num' }, h('b', null, String(x.r.cursar)), x.r.cursar === best ? h('span', { class:'badge ok', style:'margin-left:8px' }, 'Ruta más corta') : null))),
          h('tr', null, h('td', null, 'Horas estimadas'), rs.map(x => h('td', { class:'num' }, x.r.horas === null ? h('span', { class:'hint' }, 'Faltan horas por módulo') : numCL(x.r.horas) + ' h'))),
          h('tr', null, h('td', null, 'Mapa'), rs.map(x => h('td', null, miniMapa(x.p))))))));
      out.appendChild(h('p', { class:'hint', style:'margin-top:10px' }, 'Es un criterio concreto que se suma a la entrevista y no la reemplaza (informe 4). La ruta más corta también es la más barata.'));
    };
    const chips = h('div', { class:'filters' }, cand.map(p => { const b = h('button', { type:'button', class:'chip', 'aria-pressed': sel.has(p.id) ? 'true' : 'false' }, p.nombre); b.addEventListener('click', () => { if(sel.has(p.id)) sel.delete(p.id); else if(sel.size < 3) sel.add(p.id); else { toast('Máximo tres a la vez', 'info'); return; } b.setAttribute('aria-pressed', sel.has(p.id) ? 'true' : 'false'); pintar(); }); return b; }));
    pintar();
    return h('div', { class:'stack', style:'--g:12px' }, h('span', { class:'label' }, 'Postulantes con jornada técnica cerrada'), chips, out);
  }, { wide:true });
}
function miniMapa(p){
  const skip = new Set(saltadas(p));
  return h('div', { class:'cmap-tiles', style:'gap:3px;max-width:180px' }, COMP.map(x => { const t = h('span', { class:'tile sm ' + x.p + (skip.has(x.c) ? ' skip' : ''), style:'width:11px;height:11px;border-radius:3px', title: x.c }); return t; }));
}

/* ---------- EXPEDIENTE ---------- */
VIEWS.persona = function(pid){
  if(sinDatos(['personas','duos','sesiones','registros','params'])) return vistaCargando();
  const p = persona(pid);
  if(!p) return page(phead({ back:['personas','Personas'], title:'Persona no encontrada' }), emptyState('user', 'No existe o fue eliminada', null, linkBtn('Volver a personas', 'personas')));
  if(p.uid) resolverPerfiles([p.uid]);
  const tab = ui('persona-tab-' + pid, p.etapa === 'postulante' ? 'diagnostico' : 'resumen');
  const setTab = v => { UI['persona-tab-' + pid] = v; render(true); };
  const acciones = accionesPersona(p);
  const tags = h('div', { class:'tag-row' }, etapaBadge(p.etapa), p.etapa === 'tecnico' ? nivelBadge(p.nivel || 0) : null, badge(perfilL(p.perfil), 'line'), p.suspendidoAT ? badge('Suspendido de alta tensión', 'crit', 'shieldX') : null, p.demo ? badge('Ficticio', 'demo') : null);
  const head = h('header', { class:'phead' },
    h('div', { class:'ph-t' }, h('a', { class:'back', href:'#personas' }, icon('arrowLeft', 's16'), 'Personas'),
      h('div', { class:'phero' }, avatar(p.nombre, colorDe(p), 'xl'), h('div', { class:'pm' }, h('h1', { class:'h1' }, p.nombre), tags))),
    h('div', { class:'ph-a' }, acciones));
  const cuerpo = tab === 'diagnostico' ? tabDiagnostico(p) : tab === 'plan' ? tabPlan(p) : tab === 'validaciones' ? tabValidaciones(p) : tab === 'registros' ? tabRegistros(p) : tabResumen(p);
  const nHist = Object.keys(p.historial || {}).length;
  const nReg = registros().filter(r => (r.pids || []).includes(p.id)).length;
  return page(head,
    p.etapa === 'tecnico' || p.etapa === 'salio' ? h('div', { class:'card', style:'--pad:18px;margin-bottom:22px' }, trackNiveles(p.nivel || 0, p.fechasNivel)) : null,
    tabs([{ v:'resumen', l:'Resumen' }, { v:'diagnostico', l:'Diagnóstico' }, { v:'plan', l:'Plan personal' }, { v:'validaciones', l:'Validaciones', n: nHist || null }, { v:'registros', l:'Registros', n: nReg || null }], tab, setTab),
    cuerpo);
};
function trackNiveles(n, fechas){
  const nodes = [];
  const lab = ['Ingreso','N1','N2','N3','N4'];
  for(let i = 0; i <= 4; i++){
    if(i > 0) nodes.push(h('span', { class:'tb' + (i <= n ? ' done' : '') }));
    const cls = i < n || (i === n && i === 4) ? 'done' : i === n ? 'done' : i === n + 1 ? 'now' : '';
    nodes.push(h('span', { class:'tn ' + (i === 0 ? 'done' : cls) }, h('span', { class:'tc' }, i === 0 ? icon('user', 's14') : (i <= n ? icon('check', 's14') : String(i))), h('span', { class:'tl' }, lab[i], i > 0 && fechas && fechas[i] ? h('span', { class:'td' }, fechaCorta(fechas[i]).replace(/ \d{4}$/, '')) : null)));
  }
  return h('div', { class:'track', role:'img', 'aria-label':'Avance: ' + nivelNombre(n) }, nodes);
}
function accionesPersona(p){
  const out = [];
  const paso = proximoPaso(p);
  if(p.etapa === 'postulante'){
    if(paso && paso.a === 'fund') out.push(btn('Registrar prueba', { kind:'ghost', icon:'list', onClick: () => hojaFundamentosAdmin(p) }));
    if(paso && paso.a === 'JT') out.push(btn('Programar jornada', { kind:'action', icon:'calendar', onClick: () => hojaNuevaSesion(p.id, 'JT') }));
    if(paso && paso.a === 'sesion') out.push(linkBtn('Abrir jornada', 'sesion-' + paso.sid, { kind:'action' }));
    if(paso && paso.a === 'ingreso') out.push(btn('Ingresar como técnico', { kind:'action', icon:'check', onClick: () => dlgIngreso(p) }));
  }
  if(p.etapa === 'tecnico'){
    if(paso && paso.a === 'sesion') out.push(linkBtn('Abrir validación', 'sesion-' + paso.sid, { kind:'action' }));
    else if(paso && paso.a && /^N[1-4]$/.test(paso.a)) out.push(btn('Programar nivel ' + paso.a.slice(1), { kind:'action', icon:'calendar', onClick: () => hojaNuevaSesion(p.id, paso.a) }));
    else if(paso && paso.a === 'REV') out.push(btn('Programar revalidación', { kind:'action', icon:'shieldCheck', onClick: () => hojaNuevaSesion(p.id, 'REV') }));
    out.push(btn('Registrar incidente', { kind:'ghost', icon:'flame', onClick: () => hojaIncidente([p.id]) }));
  }
  const mas = h('button', { type:'button', class:'btn btn-ghost icon', 'aria-label':'Más acciones' }, icon('more', 's20'));
  mas.addEventListener('click', () => openSheet('Acciones · ' + p.nombre, close => h('div', { class:'menu-list' },
    h('button', { type:'button', on:{ click: () => { close(); hojaEditarAntecedentes(p); } } }, icon('pen'), 'Editar antecedentes'),
    h('button', { type:'button', on:{ click: () => { close(); hojaVincular(p); } } }, icon('key'), p.uid ? 'Cambiar cuenta vinculada' : 'Vincular cuenta de la plataforma'),
    p.etapa === 'tecnico' ? h('button', { type:'button', on:{ click: () => { close(); hojaGarantia([p.id]); } } }, icon('wrench'), 'Registrar caso de garantía') : null,
    p.etapa === 'tecnico' ? h('button', { type:'button', on:{ click: () => { close(); dlgSalida(p); } } }, icon('logout'), 'Registrar salida') : null,
    p.etapa === 'postulante' ? h('button', { type:'button', on:{ click: () => { close(); dlgDescartar(p); } } }, icon('x'), 'Descartar postulante') : null,
    (p.etapa === 'postulante' || p.etapa === 'descartado') ? h('button', { type:'button', style:'color:var(--crit)', on:{ click: () => { close(); dlgEliminar(p); } } }, icon('trash'), 'Eliminar') : null)));
  out.push(mas);
  return out;
}
async function dlgIngreso(p){
  const r = resumenRuta(p, params());
  const f = inputEl({ type:'date', value:S.hoy, 'aria-label':'Fecha de ingreso' });
  const res = await dialog({ title:'Ingresar a ' + p.nombre + ' como técnico', icon:'check', iconKind:'info', confirm:'Ingresar',
    body: h('div', { class:'stack', style:'--g:12px' }, h('p', { class:'body', style:'font-size:15px' }, 'Entra por el nivel 1, como todos. Su ruta: ' + r.cursar + ' competencias por cursar, ' + r.oficio + ' de oficio ya demostradas y ' + r.nivelacion + ' módulos de nivelación.'), field('Fecha de ingreso', f)) });
  if(!res) return;
  try { await ingresar(p.id, parseISO(f.value) ? f.value : S.hoy); toast(p.nombre + ' ingresó como técnico'); } catch(e){ toast(errMsg(e), 'crit'); }
}
async function dlgDescartar(p){
  const r = await dialog({ title:'Descartar a ' + p.nombre, icon:'x', danger:true, confirm:'Descartar', body:'Queda registrado con el motivo. El expediente se conserva para trazabilidad.', motivo:{ label:'Motivo', required:true, min:5 } });
  if(!r) return;
  try { await descartar(p.id, r.motivo); toast('Postulante descartado'); } catch(e){ toast(errMsg(e), 'crit'); }
}
async function dlgEliminar(p){
  const r = await dialog({ title:'Eliminar a ' + p.nombre, icon:'trash', danger:true, confirm:'Eliminar definitivamente', body:'Se borra el expediente. No se puede deshacer, salvo restaurando un respaldo.', motivo:{ label:'Motivo', required:true, min:5 } });
  if(!r) return;
  try { await eliminarPersona(p.id, r.motivo); toast('Eliminado'); go('personas'); } catch(e){ toast(errMsg(e), 'crit'); }
}
async function dlgSalida(p){
  const f = inputEl({ type:'date', value:S.hoy });
  const r = await dialog({ title:'Registrar salida de ' + p.nombre, icon:'logout', danger:true, confirm:'Registrar salida',
    body: h('div', { class:'stack', style:'--g:12px' }, h('p', { class:'body', style:'font-size:15px' }, 'Su duo activo se termina. Si tiene nivel 3 o 4, cuenta en el indicador de rotación.'), field('Fecha de salida', f)),
    motivo:{ label:'Motivo', required:true, min:5 } });
  if(!r) return;
  try { await registrarSalida(p.id, { fecha: parseISO(f.value) ? f.value : S.hoy, motivo:r.motivo }); toast('Salida registrada'); } catch(e){ toast(errMsg(e), 'crit'); }
}
function hojaEditarAntecedentes(p){
  const st = JSON.parse(JSON.stringify(p.antecedentes || { perfil:p.perfil, anos:0, formacion:'', certificados:{}, experiencias:{} }));
  openSheet('Antecedentes · ' + p.nombre, close => {
    const nom = inputEl({ maxlength:'120', value:p.nombre });
    const save = btn('Guardar', { kind:'action', icon:'check' });
    save.addEventListener('click', () => busy(save, async () => { await editarAntecedentes(p.id, st, nom.value); toast('Antecedentes actualizados'); close(); }));
    return h('div', { class:'stack', style:'--g:18px' }, field('Nombre', nom), formAntecedentes(st),
      p.jornada ? notice('warn', 'info', 'La jornada técnica ya se cerró: cambiar el mapa no cambia las estaciones que se evaluaron.') : null,
      h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), save));
  }, { wide:true });
}
function hojaFundamentosAdmin(p){
  const resp = {};
  openSheet('Prueba de fundamentos · ' + p.nombre, close => {
    const save = btn('Guardar respuestas', { kind:'action', icon:'check' });
    save.addEventListener('click', () => busy(save, async () => {
      if(Object.keys(resp).length < FUNDAMENTOS.length) throw new Error('Faltan respuestas');
      await registrarFundamentosAdmin(p.id, resp); toast('Prueba registrada'); close();
    }));
    return h('div', { class:'stack', style:'--g:18px' }, notice('info', 'info', 'Solo puede sumar nivelación. No salta ninguna competencia.'), formFundamentos(resp), h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), save));
  }, { wide:true });
}
function hojaVincular(p){
  openSheet('Vincular cuenta', close => {
    const res = h('div', { class:'stack', style:'--g:6px' });
    const q = inputEl({ type:'search', placeholder:'Buscar por nombre en la organización', autofocus:true, maxlength:'60' });
    const buscar = async () => {
      if(!S.user || !S.user.search){ clear(res).appendChild(h('p', { class:'hint' }, 'La búsqueda de personas no está disponible en esta vista.')); return; }
      const hits = await S.user.search(q.value);
      clear(res);
      if(!hits.length){ res.appendChild(h('p', { class:'hint' }, 'Sin resultados. La persona debe ser parte de la organización.')); return; }
      for(const x of hits){
        PROFILES[x.id] = { name:x.name, color:x.color };
        const otra = personaPorUid(x.id);
        const b = h('button', { type:'button', class:'role-opt', disabled: otra && otra.id !== p.id ? true : null }, avatar(x.name, x.color), h('span', { class:'rt' }, h('b', null, x.name), h('span', null, otra ? 'Vinculada a ' + otra.nombre : 'Disponible')));
        b.addEventListener('click', () => busy(b, async () => { await vincularCuenta(p.id, x.id); toast('Cuenta vinculada: ahora ve su expediente'); close(); }));
        res.appendChild(b);
      }
    };
    q.addEventListener('input', buscar); q.addEventListener('focus', buscar);
    setTimeout(buscar, 50);
    return h('div', { class:'stack', style:'--g:14px' },
      h('p', { class:'small ink2' }, 'Al vincular una cuenta, esa persona ve su propio expediente, su plan y su avance. No ve nada de nadie más.'),
      q, res,
      p.uid ? btn('Desvincular cuenta actual', { kind:'danger', size:'sm', onClick: async ev => { await busy(ev.currentTarget, async () => { await vincularCuenta(p.id, null); toast('Cuenta desvinculada'); close(); }); } }) : null);
  });
}

/* ---------- pestañas del expediente ---------- */
function tabResumen(p){
  const paso = proximoPaso(p);
  const pr = params();
  const cards = [];
  if(paso) cards.push(h('div', { class:'card', style:'grid-column:1 / -1' }, h('div', { class:'stack', style:'--g:8px' }, eyebrow('Próximo paso', 'arrowRight'), h('div', { class:'h3' }, paso.t), h('p', { class:'small ink2' }, paso.d))));
  if(p.etapa === 'tecnico'){
    const comp = companero(p.id, duos());
    const d = duoActivoDe(p.id, duos());
    cards.push(h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Duo'), comp ? frag(h('div', { class:'row', style:'gap:10px' }, avatar(nombreP(comp), colorDe(persona(comp) || {})), h('div', null, h('b', null, nombreP(comp)), h('div', { class:'hint' }, nivelNombre((persona(comp) || {}).nivel || 0) + ' · desde ' + fechaCorta(d.desde))))) : h('p', { class:'small', style:'color:var(--warn)' }, 'Sin duo. Todo el trabajo técnico se hace en duos fijos.'), linkBtn('Ver duos', 'duos', { size:'sm' })));
    const rv = revalidacion(p, pr, S.hoy);
    cards.push(h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Revalidación de seguridad'),
      rv.estado === 'na' ? h('p', { class:'small muted' }, 'Aplica desde el nivel 1.') : frag(h('div', { class:'h3' }, fechaCorta(rv.vence)), badge(rv.estado === 'vencida' ? 'Vencida' : rv.estado === 'pronto' ? 'Vence ' + relDias(rv.dias) : 'Vigente', rv.estado === 'vencida' ? 'crit' : rv.estado === 'pronto' ? 'warn' : 'ok')),
      h('p', { class:'hint' }, 'Solo el core de seguridad se revalida, cada ' + pr.revalidacionMeses + ' meses.')));
    const bn = bono(p, pr);
    cards.push(h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Bono por avance validado'),
      bn.length ? h('div', { class:'stack', style:'--g:4px' }, bn.map(b => h('div', { class:'row sb small' }, h('span', null, 'Nivel ' + b.n + ' · ' + fechaCorta(b.fecha)), h('b', null, b.monto === null ? 'Monto por definir' : clp(b.monto))))) : h('p', { class:'small muted' }, 'Aún sin niveles validados.'),
      h('p', { class:'hint' }, 'Por avance validado, nunca por nota online (D11).')));
  }
  cards.push(h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Cuenta en la plataforma'),
    p.uid ? h('div', { class:'row', style:'gap:10px' }, avatar(nombreUid(p.uid), colorDe(p)), h('div', null, h('b', null, nombreUid(p.uid)), h('div', { class:'hint' }, 'Ve su expediente y su avance'))) : h('p', { class:'small muted' }, 'Sin cuenta vinculada. Sin cuenta no puede cursar módulos online ni ver su ruta.'),
    btn(p.uid ? 'Cambiar' : 'Vincular cuenta', { kind:'ghost', size:'sm', icon:'key', onClick: () => hojaVincular(p) })));
  const dl = h('dl', { class:'kv' },
    h('dt', null, 'Perfil de entrada'), h('dd', null, perfilL(p.perfil)),
    h('dt', null, 'Registrado'), h('dd', null, fechaHora(p.creado)),
    p.ingreso ? frag(h('dt', null, 'Ingreso'), h('dd', null, fechaLarga(p.ingreso))) : null,
    p.salida ? frag(h('dt', null, 'Salida'), h('dd', null, fechaLarga(p.salida.fecha) + ' · ' + p.salida.motivo)) : null,
    p.descarte ? frag(h('dt', null, 'Descarte'), h('dd', null, fechaLarga(p.descarte.fecha) + ' · ' + p.descarte.motivo)) : null);
  cards.push(h('div', { class:'card' }, dl));
  return h('div', { class:'grid g2', style:'--g:14px' }, cards);
}
function tabDiagnostico(p){
  const d = estadoDiagnostico(p);
  const pr = params();
  const pasos = [['Antecedentes', d.antecedentes], ['Prueba de fundamentos', d.fundamentos], ['Jornada técnica', d.jornada], ['Plan personal', d.plan]];
  const stepper = h('div', { class:'stepper', style:'margin-bottom:20px' }, pasos.map(([l, ok], i) => frag(i ? h('span', { class:'sl' }) : null, h('span', { class:'sd ' + (ok ? 'done' : (pasos.findIndex(x => !x[1]) === i ? 'on' : '')) }, h('i', null, ok ? '✓' : String(i + 1)), l))));
  const mapa = mapaPreliminar(p.antecedentes);
  const a = p.antecedentes || {};
  const antCard = h('div', { class:'card stack', style:'--g:12px' }, h('div', { class:'card-h', style:'margin:0' }, h('h3', { class:'h4' }, '1 · Antecedentes'), btn('Editar', { kind:'quiet', size:'sm', icon:'pen', onClick: () => hojaEditarAntecedentes(p) })),
    p.antecedentes ? h('dl', { class:'kv' },
      h('dt', null, 'Formación'), h('dd', null, a.formacion || '—'),
      h('dt', null, 'Experiencia'), h('dd', null, (a.anos || 0) + ' años'),
      h('dt', null, 'Certificados'), h('dd', null, CERTIFICADOS.filter(c => a.certificados && a.certificados[c.id]).map(c => c.l).join(', ') || 'Ninguno'),
      h('dt', null, 'Declara'), h('dd', null, EXPERIENCIAS.filter(e => a.experiencias && a.experiencias[e.c]).map(e => e.c).join(', ') || 'Nada específico')) : h('p', { class:'hint' }, 'Sin antecedentes registrados.'),
    h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Mapa preliminar: ' + mapa.length + ' estaciones'), h('div', { class:'tag-row' }, mapa.length ? mapa.map(c => h('span', { class:'badge line', title:C[c].t }, c)) : h('span', { class:'hint' }, 'Ninguna estación marcada.'))));
  const fundCard = h('div', { class:'card stack', style:'--g:12px' }, h('div', { class:'card-h', style:'margin:0' }, h('h3', { class:'h4' }, '2 · Prueba de fundamentos'), !d.fundamentos && p.etapa === 'postulante' ? btn('Registrar', { kind:'quiet', size:'sm', icon:'list', onClick: () => hojaFundamentosAdmin(p) }) : null),
    d.fundamentos ? frag(
      h('div', { class:'stack', style:'--g:10px' }, Object.entries(puntajeFundamentos(p.fundamentos.respuestas)).map(([ar, v]) => h('div', { class:'stack', style:'--g:4px' },
        h('div', { class:'row sb small' }, h('span', null, AREAS[ar]), h('b', { class:'num' }, v.ok + ' de ' + v.total), ),
        h('div', { class:'progress' }, h('i', { style:'width:' + Math.round(100 * v.ok / v.total) + '%;background:' + (v.ok < pr.umbralFund ? 'var(--warn)' : 'var(--action)') })),
        v.ok < pr.umbralFund ? h('span', { class:'hint', style:'color:var(--warn)' }, 'Suma ' + MOD[AREA_NIV[ar]].nombre.toLowerCase()) : null))),
      h('p', { class:'hint' }, 'Rendida el ' + fechaCorta(p.fundamentos.fecha) + (p.fundamentos.online ? ' en la plataforma' : '') + '. Umbral: ' + pr.umbralFund + ' de 3 por área.')) : h('p', { class:'hint' }, 'Pendiente.'));
  const j = p.jornada;
  const jt = sesionAbiertaDe(p.id, 'JT');
  const jorCard = h('div', { class:'card stack', style:'--g:12px' }, h('div', { class:'card-h', style:'margin:0' }, h('h3', { class:'h4' }, '3 · Jornada técnica'), jt ? linkBtn('Abrir', 'sesion-' + jt.id, { size:'sm', kind:'action' }) : (!j && p.etapa === 'postulante' ? btn('Programar', { kind:'quiet', size:'sm', icon:'calendar', onClick: () => hojaNuevaSesion(p.id, 'JT') }) : null)),
    j ? frag(
      h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Base: herramientas e instrumentos'), h('div', { class:'tag-row' }, Object.keys(AREAS).map(ar => badge(AREAS[ar] + ': ' + (j.basico && j.basico[ar] === 'nivelar' ? 'nivelar' : 'bien'), j.basico && j.basico[ar] === 'nivelar' ? 'warn' : 'ok')))),
      h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Estaciones de oficio'), h('div', { class:'stack', style:'--g:6px' }, Object.keys(j.estaciones || {}).sort().map(c => h('div', { class:'crow' + (j.estaciones[c] === 's' ? '' : ' skip') }, codeTag(c), h('span', { class:'ct' }, C[c].t), badge(j.estaciones[c] === 's' ? 'Demostrada: se salta' : 'No demostrada: la cursa', j.estaciones[c] === 's' ? 'ok' : 'line'))))),
      h('p', { class:'hint' }, 'Cerrada el ' + fechaCorta(j.fecha) + '.')) : h('p', { class:'hint' }, jt ? 'En curso.' : 'Pendiente.'));
  const plan = planPersonal(p, pr);
  const planCard = h('div', { class:'card stack', style:'--g:10px' }, h('h3', { class:'h4' }, '4 · Plan personal'),
    d.plan ? frag(h('p', { class:'small ink2' }, plan.total + ' competencias por cursar, ' + plan.saltadas.length + ' de oficio demostradas y ' + plan.nivelacion.length + ' módulos de nivelación.'), btn('Ver plan completo', { kind:'ghost', size:'sm', icon:'route', onClick: () => { UI['persona-tab-' + p.id] = 'plan'; render(true); } })) : h('p', { class:'hint' }, 'Se arma solo al cerrar la jornada técnica.'));
  return frag(stepper, h('div', { class:'grid g2', style:'--g:14px' }, antCard, fundCard, jorCard, planCard));
}
function estadoComp(p, c){
  const pt = (p.pauta || {})[c];
  const skip = p.jornada && p.jornada.estaciones && p.jornada.estaciones[c] === 's';
  if(skip || (pt && pt.r === 'j')) return 'skip';
  if(pt && pt.r === 's') return 'done';
  if(pt && pt.r === 'n') return 'fail';
  if(p.etapa === 'tecnico' && C[c].n > (p.nivel || 0) + 1) return 'lock';
  return '';
}
const EST_L = { skip:['Demostrada en jornada','ok'], done:['Aprobada','ok'], fail:['Repetir','crit'], lock:['Nivel futuro','line'], '':['Por cursar','info'] };
function tabPlan(p){
  const pr = params();
  const plan = planPersonal(p, pr);
  const f = h('div', { class:'plan-f' },
    h('div', { class:'pf' + (plan.nivelacion.length ? ' hl' : '') }, h('b', null, String(plan.nivelacion.length)), h('span', null, 'Nivelación' + (plan.nivelacion.length ? ': ' + plan.nivelacion.map(x => x.replace('NIV-', '')).join(', ') : ''))),
    h('div', { class:'pf' }, h('b', null, '13'), h('span', null, 'Core completo, siempre')),
    h('div', { class:'pf' }, h('b', null, String(plan.oficio.length)), h('span', null, 'Oficio no demostrado, de 11')),
    h('div', { class:'pf' }, h('b', null, '15'), h('span', null, 'Desarrollo por nivel')),
    h('div', { class:'pf' + (plan.refuerzo.length ? ' hl' : '') }, h('b', null, String(plan.refuerzo.length)), h('span', null, 'Refuerzo en lo reprobado')));
  const mapa = h('div', { class:'cmap', style:'margin-top:18px' }, [1,2,3,4].map(n => h('div', { class:'cmap-row' }, h('span', { class:'cmap-lv' }, 'N' + n), h('div', { class:'cmap-tiles' }, COMP.filter(x => x.n === n).map(x => { const e = estadoComp(p, x.c); const t = tile(x.c, (e === 'done' ? 'done' : e === 'skip' ? 'skip' : e === 'fail' ? 'fail' : e === 'lock' ? 'lock' : '') + ' lg'); if(e === 'done') t.appendChild(icon('check')); return t; })))));
  const leyenda = h('div', { class:'cmap-legend', style:'margin-top:12px' }, h('span', null, h('i', { class:'tile core' }), 'Core'), h('span', null, h('i', { class:'tile oficio' }), 'Oficio'), h('span', null, h('i', { class:'tile desarrollo' }), 'Desarrollo'), h('span', null, h('i', { class:'tile oficio skip' }), 'Demostrada en jornada'), h('span', null, h('i', { class:'tile core fail' }), 'Repetir'), h('span', null, h('i', { class:'tile core lock' }), 'Nivel futuro'));
  const horas = plan.horas === null ? notice('', 'clock', h('b', null, 'Horas estimadas: por definir. '), 'Faltan horas en ' + plan.faltanHoras.length + ' módulos. Se fijan en Ajustes cuando exista el procedimiento real del kit.') : notice('info', 'clock', h('b', null, 'Horas estimadas: ' + numCL(plan.horas) + ' h '), 'en ' + plan.modulos.length + ' módulos.');
  const porNivel = [1,2,3,4].map(n => h('details', { class:'disc', open: (p.etapa !== 'tecnico' && n === 1) || (p.etapa === 'tecnico' && n === (p.nivel || 0) + 1) ? true : null },
    h('summary', null, h('span', null, 'Nivel ' + n + ' · ' + NIVEL[n].nombre, h('span', { class:'hint', style:'margin-left:8px;font-weight:500' }, plan.porNivel[n].cursar.length + ' por cursar' + (plan.porNivel[n].saltadas.length ? ', ' + plan.porNivel[n].saltadas.length + ' saltadas' : ''))), icon('chevDown')),
    h('div', { class:'dbody cgroup' }, COMP.filter(x => x.n === n).map(x => { const e = estadoComp(p, x.c); return h('div', { class:'crow' + (e === 'skip' ? ' skip' : '') }, codeTag(x.c), h('span', { class:'ct' }, x.t, h('span', { class:'hint', style:'display:block' }, PRIORIDAD[x.p].l + ' · ' + CRITICIDAD[x.k].l + ' ' + CRITICIDAD[x.k].a)), badge(EST_L[e][0], EST_L[e][1])); }))));
  return h('div', { class:'stack', style:'--g:18px' },
    p.jornada ? null : notice('warn', 'info', 'Sin jornada técnica todavía: el plan asume que no demostró oficio. Se ajusta solo al cerrar la jornada.'),
    f, h('div', { class:'card' }, h('div', { class:'card-h' }, h('h3', { class:'h4' }, 'Mapa de las 39 competencias'), h('span', { class:'hint' }, 'Pasa el cursor o el foco por un cuadro para ver el detalle')), mapa, leyenda),
    horas, h('div', { class:'stack', style:'--g:8px' }, porNivel));
}
function tabValidaciones(p){
  const hist = Object.values(p.historial || {}).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const abiertas = sesiones().filter(x => x.pid === p.id && x.estado === 'abierta');
  const tipos = tiposPosibles(p);
  return h('div', { class:'stack', style:'--g:18px' },
    abiertas.length ? h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'En curso'), abiertas.map(sesionItem)) : null,
    tipos.length ? h('div', { class:'row' }, tipos.filter(t => !sesionAbiertaDe(p.id, t)).map(t => btn('Programar ' + TIPOS_SESION[t].l.toLowerCase(), { kind:'ghost', size:'sm', icon:'plus', onClick: () => hojaNuevaSesion(p.id, t) }))) : null,
    hist.length ? h('div', { class:'tscroll' }, h('table', { class:'t' }, h('thead', null, h('tr', null, h('th', null, 'Validación'), h('th', null, 'Intento'), h('th', null, 'Fecha'), h('th', null, 'Resultado'), h('th', null, 'Reprobadas'))),
      h('tbody', null, hist.map(x => h('tr', null, h('td', null, TIPOS_SESION[x.tipo] ? TIPOS_SESION[x.tipo].l : x.tipo), h('td', { class:'num' }, x.intento === 1 ? h('span', null, '1', h('span', { class:'hint' }, ' · primera nota')) : String(x.intento)), h('td', null, fechaCorta(x.fecha)),
        h('td', null, badge(x.aprobado ? 'Aprobada' : 'Reprobada', x.aprobado ? 'ok' : 'crit')), h('td', null, (x.fallidas || []).length ? h('div', { class:'tag-row' }, x.fallidas.map(codeTag)) : h('span', { class:'hint' }, '—')))))))
      : emptyState('clipboard', 'Sin validaciones cerradas', 'La primera nota queda registrada como punto de partida.'));
}
function tabRegistros(p){
  const rs = registros().filter(r => (r.pids || []).includes(p.id));
  return h('div', { class:'stack', style:'--g:12px' },
    p.etapa === 'tecnico' ? h('div', { class:'row' }, btn('Registrar incidente', { kind:'ghost', size:'sm', icon:'flame', onClick: () => hojaIncidente([p.id]) }), btn('Registrar caso de garantía', { kind:'ghost', size:'sm', icon:'wrench', onClick: () => hojaGarantia([p.id]) })) : null,
    rs.length ? h('div', { class:'stack', style:'--g:8px' }, rs.map(registroItem)) : emptyState('file', 'Sin registros', 'Incidentes de seguridad y casos de garantía de esta persona.'),
    p.salida ? notice('', 'logout', h('b', null, 'Salida: '), fechaLarga(p.salida.fecha) + ' · ' + p.salida.motivo + ' · nivel ' + p.salida.nivel) : null);
}
function registroItem(r){
  const inc = r.tipo === 'incidente';
  const kind = inc ? (r.grave ? 'crit' : 'warn') : (r.atribuible ? 'warn' : 'ok');
  return h('div', { class:'alert ' + kind }, h('span', { class:'ai' }, icon(inc ? 'flame' : 'wrench', 's20')),
    h('div', null, h('div', { class:'at' }, (inc ? (r.grave ? 'Incidente grave' : 'Incidente') : (r.atribuible ? 'Garantía atribuible a la instalación' : 'Garantía no atribuible')) + ' · ' + fechaCorta(r.fecha)),
      h('div', { class:'ad' }, r.detalle), h('div', { class:'ad' }, (r.pids || []).map(nombreP).join(', '))),
    h('div', { class:'aa' }, btn('', { kind:'quiet', size:'sm', icon:'trash', aria:'Eliminar registro', onClick: async () => { const x = await dialog({ title:'Eliminar registro', danger:true, icon:'trash', confirm:'Eliminar', body:'Afecta los indicadores. Queda en la bitácora con el motivo.', motivo:{ label:'Motivo', required:true } }); if(x){ try { await eliminarRegistro(r.id, x.motivo); toast('Registro eliminado'); } catch(e){ toast(errMsg(e), 'crit'); } } } })));
}

/* ---------- hojas de registro ---------- */
function selectorPersonas(sel, filtro, multi){
  const ps = personas().filter(filtro);
  return h('div', { class:'filters', style:'margin:0' }, ps.map(p => { const b = h('button', { type:'button', class:'chip', 'aria-pressed': sel.has(p.id) ? 'true' : 'false' }, p.nombre); b.addEventListener('click', () => { if(!multi){ sel.clear(); for(const x of b.parentNode.children) x.setAttribute('aria-pressed', 'false'); } if(sel.has(p.id)) sel.delete(p.id); else sel.add(p.id); b.setAttribute('aria-pressed', sel.has(p.id) ? 'true' : 'false'); }); return b; }));
}
function hojaIncidente(pids){
  const sel = new Set(pids || []);
  openSheet('Registrar incidente de seguridad', close => {
    const fecha = inputEl({ type:'date', value:S.hoy, max:S.hoy });
    const grave = h('input', { type:'checkbox' });
    const det = h('textarea', { class:'textarea', maxlength:'600', placeholder:'Qué pasó, dónde y con qué consecuencia' });
    const save = btn('Registrar', { kind:'owner', icon:'check' });
    save.addEventListener('click', () => busy(save, async () => {
      if(grave.checked){ const ok = await dialog({ title:'Incidente grave', icon:'shieldX', danger:true, confirm:'Registrar y suspender', body:'Quien lo protagoniza queda suspendido de trabajar con alta tensión hasta aprobar la revalidación del core de seguridad. No baja de nivel.' }); if(!ok) return; }
      await registrarIncidente({ pids:[...sel], fecha: fecha.value, grave: grave.checked, detalle: det.value });
      toast(grave.checked ? 'Incidente grave registrado: suspensión activa' : 'Incidente registrado'); close();
    }));
    return h('div', { class:'stack', style:'--g:16px' },
      h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Involucra a'), selectorPersonas(sel, p => p.etapa === 'tecnico', true)),
      field('Fecha', fecha), field('Descripción', det),
      h('label', { class:'check' }, grave, h('span', { class:'small' }, h('b', null, 'Incidente grave. '), 'Obliga a revalidar el core de seguridad antes de volver a trabajar con alta tensión.')),
      h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), save));
  });
}
function hojaGarantia(pids){
  const sel = new Set(pids || []);
  if(pids && pids.length === 1){ const c = companero(pids[0], duos()); if(c) sel.add(c); }
  openSheet('Registrar caso de garantía', close => {
    const fecha = inputEl({ type:'date', value:S.hoy, max:S.hoy });
    const atr = h('input', { type:'checkbox', checked:true });
    const det = h('textarea', { class:'textarea', maxlength:'600', placeholder:'Falla, causa y registro de postventa' });
    const save = btn('Registrar', { kind:'owner', icon:'check' });
    save.addEventListener('click', () => busy(save, async () => { await registrarGarantia({ pids:[...sel], fecha:fecha.value, atribuible: atr.checked, detalle: det.value }); toast('Caso registrado'); close(); }));
    return h('div', { class:'stack', style:'--g:16px' },
      notice('info', 'info', 'El dato lo entrega postventa (D14: la gestiona otra área y la ejecuta el duo).'),
      h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Técnicos del caso'), selectorPersonas(sel, p => p.etapa === 'tecnico' || p.etapa === 'salio', true)),
      field('Fecha', fecha), field('Descripción', det),
      h('label', { class:'check on' }, atr, h('span', { class:'small' }, h('b', null, 'Atribuible a la instalación. '), 'Solo estos cuentan en el indicador de fallas.')),
      h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), save));
  });
}
