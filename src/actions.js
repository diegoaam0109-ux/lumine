/* =====================================================================
   Lumine Habilita · acciones (toda escritura pasa por aquí)
   Cada acción valida las reglas antes de escribir y deja rastro.
   ===================================================================== */
'use strict';

const nowISO = () => new Date().toISOString();
function stableStr(o){
  if(Array.isArray(o)) return '[' + o.map(stableStr).join(',') + ']';
  if(o && typeof o === 'object') return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + stableStr(o[k])).join(',') + '}';
  return JSON.stringify(o === undefined ? null : o);
}
function txt(v, max){ return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max || 200); }
function mustId(id){ if(!validId(id)) throw new Error('Identificador inválido'); return id; }
function requireAdmin(){ if(S.role !== 'admin') throw new Error('Solo administración puede hacer esto'); if(S.readOnly) throw new Error('Tu acceso cambió: la página quedó en solo lectura'); }

/* ---------- operaciones de varios pasos ----------
   La base de claude.ai no tiene transacciones (escrituras last-writer-wins).
   transaccion() guarda cómo estaba cada documento antes de tocarlo y, si un
   paso falla, deshace los anteriores en orden inverso. Si incluso deshacer
   falla, lo deja escrito en la bitácora y Ajustes › Consistencia lo detecta. */
async function leerDoc(path){ try { const s = await S.db.doc(path).get(); return s.exists ? JSON.parse(JSON.stringify(s.data())) : null; } catch(e){ return undefined; } }
async function transaccion(nombre, pasos){
  const hechos = [];
  for(const st of pasos){
    const antes = await leerDoc(st.path);
    try {
      if(st.op === 'set') await W.set(st.path, st.data);
      else if(st.op === 'update') await W.update(st.path, st.data);
      else if(st.op === 'upsert') await W.upsert(st.path, st.data, antes !== null && antes !== undefined);
      else if(st.op === 'del') await W.del(st.path);
      hechos.push({ path: st.path, antes });
    } catch(e){
      const sinDeshacer = [];
      for(const hx of hechos.reverse()){
        try { if(hx.antes === undefined) throw new Error('sin copia'); if(hx.antes === null) await W.del(hx.path); else await W.set(hx.path, hx.antes); }
        catch(e2){ sinDeshacer.push(hx.path); }
      }
      await logEvento('Operación revertida', null, nombre + ': ' + errMsg(e) + (sinDeshacer.length ? ' · sin deshacer: ' + sinDeshacer.join(', ') : ''));
      throw new Error(nombre + ' no se completó' + (hechos.length ? (sinDeshacer.length ? '. Algunos pasos no se pudieron deshacer: revisa Ajustes › Consistencia' : ' y se deshicieron los pasos anteriores') : '') + '. ' + errMsg(e));
    }
  }
}
/* Candado de negocio: una misma acción sobre el mismo objeto no corre dos veces a la vez,
   aunque se llame desde código (no solo desde un botón). */
const CANDADOS = new Set();
async function conCandado(clave, fn){
  if(CANDADOS.has(clave)) throw new Error('Ya se está guardando ese cambio');
  CANDADOS.add(clave);
  try { return await fn(); } finally { CANDADOS.delete(clave); }
}

/* ---------- bitácora (un documento por mes, eventos como mapa) ---------- */
async function logEvento(a, ref, d){
  if(S.role !== 'admin') return;
  const mes = S.hoy.slice(0, 7);
  const ev = { t: nowISO(), uid: S.me.id || null, a: txt(a, 120), ref: ref ? txt(ref, 80) : null, d: d ? txt(d, 240) : null };
  try { await W.upsert('bitacora/' + mes, { eventos: { [nid('e')]: ev } }, !!S.D.bitacora[mes]); }
  catch(e){ console.warn('bitácora', e); }
}

/* ---------- expedientes: proyección que lee cada técnico ---------- */
async function syncExpediente(pid){
  const p = persona(pid);
  if(!p || !p.uid || !validId(p.uid)) return;
  const pr = proyectarExpediente(p, ctx());
  const prev = S.D.expedientes[p.uid];
  if(prev && stableStr(prev) === stableStr(pr)) return;
  await W.set('expedientes/' + p.uid, pr);
}
async function syncMuchos(pids){ for(const id of uniq(pids.filter(Boolean))) await syncExpediente(id); }
async function syncTodos(){ requireAdmin(); let n = 0; for(const p of personas()) if(p.uid){ await syncExpediente(p.id); n++; } return n; }

/* ---------- personas ---------- */
function personaBase(o){
  return Object.assign({
    id: nid('p'), nombre:'', perfil:'otro', uid:null, etapa:'postulante', creado: nowISO(), actualizado: nowISO(),
    ingreso:null, antecedentes:null, fundamentos:null, jornada:null, nivel:0, fechasNivel:{}, pauta:{}, historial:{},
    suspendidoAT:false, salida:null
  }, o);
}
function limpiarAntecedentes(a){
  a = a || {};
  const cert = {}; for(const c of CERTIFICADOS) if(a.certificados && a.certificados[c.id]) cert[c.id] = true;
  const exp = {}; for(const e of EXPERIENCIAS) if(a.experiencias && a.experiencias[e.c]) exp[e.c] = true;
  return { perfil: PERFILES[a.perfil] ? a.perfil : 'otro', anos: clamp(Math.round(Number(a.anos) || 0), 0, 60), formacion: txt(a.formacion, 140), certificados: cert, experiencias: exp, notas: txt(a.notas, 600) };
}
function limpiarRespuestas(r){
  const out = {};
  for(const q of FUNDAMENTOS){ const v = r && r[q.id]; if(Number.isInteger(v) && v >= 0 && v < q.o.length) out[q.id] = v; }
  return out;
}
async function crearPostulante(data){
  requireAdmin();
  const nombre = txt(data.nombre, 120);
  if(nombre.length < 3) throw new Error('Escribe el nombre completo');
  const ant = limpiarAntecedentes(data.antecedentes);
  const p = personaBase({ nombre, perfil: ant.perfil, antecedentes: ant });
  if(data.respuestas && Object.keys(data.respuestas).length) p.fundamentos = { respuestas: limpiarRespuestas(data.respuestas), fecha: S.hoy, registradoPor: S.me.id };
  await W.set('personas/' + p.id, p);
  await logEvento('Postulante registrado', p.id, nombre);
  return p.id;
}
async function crearDesdePostulacion(uid){
  requireAdmin(); mustId(uid);
  if(personaPorUid(uid)) throw new Error('Esa cuenta ya tiene expediente');
  const av = S.D.avance[uid];
  if(!av || !av.postulacion) throw new Error('No hay postulación de esa cuenta');
  const ant = limpiarAntecedentes(av.postulacion.antecedentes);
  const p = personaBase({ nombre: txt(av.postulacion.nombre, 120) || nombreUid(uid), perfil: ant.perfil, uid, antecedentes: ant });
  if(av.fundamentos && av.fundamentos.respuestas) p.fundamentos = { respuestas: limpiarRespuestas(av.fundamentos.respuestas), fecha: av.fundamentos.fecha || S.hoy, online:true };
  await W.set('personas/' + p.id, p);
  S.D.personas[p.id] = p;
  await syncExpediente(p.id);
  await logEvento('Expediente creado desde postulación', p.id, p.nombre);
  return p.id;
}
async function editarAntecedentes(pid, ant, nombre){
  requireAdmin(); mustId(pid);
  const a = limpiarAntecedentes(ant);
  const patch = { antecedentes: a, perfil: a.perfil, actualizado: nowISO() };
  if(nombre){ const n = txt(nombre, 120); if(n.length >= 3) patch.nombre = n; }
  await W.update('personas/' + pid, patch);
  await logEvento('Antecedentes actualizados', pid, persona(pid) ? persona(pid).nombre : '');
  await syncExpediente(pid);
}
async function registrarFundamentosAdmin(pid, respuestas){
  requireAdmin(); mustId(pid);
  await W.update('personas/' + pid, { fundamentos: { respuestas: limpiarRespuestas(respuestas), fecha: S.hoy, registradoPor: S.me.id }, actualizado: nowISO() });
  await logEvento('Prueba de fundamentos registrada', pid, persona(pid).nombre);
  await syncExpediente(pid);
}
async function ingresar(pid, fecha){
  requireAdmin(); mustId(pid);
  const p = persona(pid);
  if(!p || p.etapa !== 'postulante') throw new Error('Solo un postulante puede ingresar');
  if(!(p.jornada && p.jornada.fecha)) throw new Error('Primero se cierra la jornada técnica: sin ella no hay plan personal');
  await W.update('personas/' + pid, { etapa:'tecnico', ingreso: fecha || S.hoy, nivel:0, actualizado: nowISO() });
  await logEvento('Ingreso como técnico', pid, p.nombre + ' entra por el nivel 1');
  await syncExpediente(pid);
}
async function descartar(pid, motivo){
  requireAdmin(); mustId(pid);
  const p = persona(pid);
  await W.update('personas/' + pid, { etapa:'descartado', descarte:{ fecha:S.hoy, motivo: txt(motivo, 400), por:S.me.id }, actualizado: nowISO() });
  await logEvento('Postulante descartado', pid, p.nombre + ': ' + txt(motivo, 120));
  await syncExpediente(pid);
}
async function vincularCuenta(pid, uid){
  requireAdmin(); mustId(pid); if(uid) mustId(uid);
  const otro = uid && personaPorUid(uid);
  if(otro && otro.id !== pid) throw new Error('Esa cuenta ya está vinculada a ' + otro.nombre);
  const antes = persona(pid).uid;
  await W.update('personas/' + pid, { uid: uid || null, actualizado: nowISO() });
  S.D.personas[pid] = Object.assign({}, persona(pid), { uid: uid || null });
  if(antes && antes !== uid) await W.del('expedientes/' + antes);
  await syncExpediente(pid);
  await logEvento(uid ? 'Cuenta vinculada' : 'Cuenta desvinculada', pid, persona(pid).nombre);
}
async function eliminarPersona(pid, motivo){
  requireAdmin(); mustId(pid);
  const p = persona(pid);
  if(!p) return;
  if(p.etapa === 'tecnico' || p.etapa === 'salio') throw new Error('Un técnico con historial no se elimina: registra su salida. Así se conserva la trazabilidad.');
  if(sesiones().some(s => s.pid === pid && s.estado === 'abierta')) throw new Error('Anula primero sus validaciones abiertas');
  if(p.uid) await W.del('expedientes/' + p.uid);
  await W.del('personas/' + pid);
  await logEvento('Postulante eliminado', pid, p.nombre + (motivo ? ': ' + txt(motivo, 120) : ''));
}

/* ---------- validaciones ---------- */
function tiposPosibles(p){
  const out = [];
  if(!p) return out;
  if((p.etapa === 'postulante' || p.etapa === 'tecnico') && !(p.jornada && p.jornada.fecha)) out.push('JT');
  if(p.etapa === 'tecnico'){
    const sig = siguienteNivel(p); if(sig) out.push('N' + sig);
    if((p.nivel || 0) >= 1) out.push('REV');
  }
  return out;
}
function sesionAbiertaDe(pid, tipo){ return sesiones().find(s => s.pid === pid && s.estado === 'abierta' && (!tipo || s.tipo === tipo)) || null; }
function itemsParaNueva(p, tipo){
  if(tipo === 'JT') return mapaPreliminar(p.antecedentes);
  return itemsValidacion(tipo, p);
}
async function crearSesion(o){
  requireAdmin();
  const p = persona(mustId(o.pid));
  if(!p) throw new Error('Persona no encontrada');
  if(!tiposPosibles(p).includes(o.tipo)) throw new Error('Esa validación no corresponde a la etapa de ' + p.nombre);
  if(sesionAbiertaDe(p.id, o.tipo)) throw new Error(p.nombre + ' ya tiene una ' + TIPOS_SESION[o.tipo].l.toLowerCase() + ' abierta');
  const fecha = o.fecha || S.hoy;
  if(!fechaValida(fecha)) throw new Error('La fecha no es válida');
  const permitidos = itemsParaNueva(p, o.tipo);
  const codes = o.codes && o.codes.length ? uniq(o.codes) : permitidos;
  const ajenos = codes.filter(c => !permitidos.includes(c));
  if(ajenos.length) throw new Error('Estas competencias no corresponden a esa validación: ' + ajenos.join(', '));
  if(o.tipo !== 'JT' && !codes.length) throw new Error('No quedan competencias por validar en ese nivel');
  // D8 se valida aquí, no solo en la hoja: sin práctica completa hace falta un motivo escrito
  const d8 = requisitoD8(p, o.tipo, params(), p.uid ? S.D.avance[p.uid] : null);
  if(d8.aplica && d8.listo === false && !motivoValido(o.override)) throw new Error('Sin práctica online completa (faltan ' + d8.faltan.join(', ') + '). Para programar igual, escribe el motivo (D8).');
  const items = {};
  const asig = o.asig || {};
  for(const c of codes){
    if(!C[c]) continue;
    const ev = evaluadorDe(c);
    let a = ev === 'int' ? (asig[c] || null) : null;
    if(a){
      mustId(a);
      const chk = puedeValidar(a, rolEquipo(a), p, Pmap(), duos(), personas(), c);
      if(!chk.ok) throw new Error(C[c].c + ': ' + chk.motivo);
    }
    items[c] = { ev, asig: a, r: null };
  }
  const hist = Object.values(p.historial || {}).filter(h => h.tipo === o.tipo).length;
  const id = nid('s');
  const doc = { id, pid:p.id, tipo:o.tipo, intento: hist + 1, fecha, estado:'abierta', items, creado: nowISO(), creadoPor: S.me.id };
  if(o.tipo === 'JT') doc.basico = { electrica:null, mecanica:null, electronica:null };
  if(d8.aplica && d8.listo === false) doc.override = txt(o.override, 300);
  await W.set('sesiones/' + id, doc);
  S.D.sesiones[id] = doc;
  await publicarAgenda(doc);
  await logEvento('Validación programada', id, TIPOS_SESION[o.tipo].l + ' · ' + p.nombre + (doc.override ? ' · sin práctica completa: ' + doc.override : ''));
  return id;
}
/* Los formadores reciben en su agenda solo sus ítems y el nombre del técnico.
   'antes' son los formadores que tenían algo de esta sesión: si ya no les queda
   ningún ítem, su entrada se marca como reasignada para que no la sigan viendo pendiente. */
async function publicarAgenda(ses, estado, antes){
  const p = persona(ses.pid);
  const porUid = {};
  for(const c of Object.keys(ses.items || {})){ const it = ses.items[c]; if(it.asig && !it.r && rolEquipo(it.asig) === 'formador') (porUid[it.asig] = porUid[it.asig] || {})[c] = { t: C[c].t }; }
  for(const uid of Object.keys(porUid)){
    const prevItems = S.D.agenda[uid] && S.D.agenda[uid].sesiones && S.D.agenda[uid].sesiones[ses.id] && S.D.agenda[uid].sesiones[ses.id].items;
    // 'items' se reemplaza completo: un update anidado no borra claves viejas, así que primero se vacía
    if(prevItems) await W.update('agenda/' + uid, { sesiones: { [ses.id]: { items: null } } });
    await W.upsert('agenda/' + uid, { sesiones: { [ses.id]: { etiqueta: p ? p.nombre : '', tipo: ses.tipo, fecha: ses.fecha, items: porUid[uid], estado: estado || 'pendiente', asignado: nowISO() } } }, !!S.D.agenda[uid]);
  }
  for(const uid of (antes || [])){
    if(porUid[uid]) continue;
    const a = S.D.agenda[uid] && S.D.agenda[uid].sesiones && S.D.agenda[uid].sesiones[ses.id];
    if(a && a.estado === 'pendiente') await W.update('agenda/' + uid, { sesiones: { [ses.id]: { estado:'reasignado', items:null } } });
  }
}
async function cerrarAgenda(ses, estado){
  for(const uid of Object.keys(S.D.agenda)){
    const a = S.D.agenda[uid];
    if(a && a.sesiones && a.sesiones[ses.id]) await W.update('agenda/' + uid, { sesiones: { [ses.id]: { estado } } });
  }
}
function puedeMarcar(ses, code, modo){
  if(!ses || ses.estado !== 'abierta') return { ok:false, motivo:'La validación no está abierta' };
  if(S.readOnly) return { ok:false, motivo:'Solo lectura' };
  const it = ses.items[code]; if(!it) return { ok:false, motivo:'Ítem no encontrado' };
  const p = persona(ses.pid);
  if(it.ev === 'ext'){
    if(modo !== 'kiosco') return { ok:false, motivo:'Lo marca el evaluador externo en modo kiosco' };
    if(ses.externa && ses.externa.entregada) return { ok:false, motivo:'La evaluación externa ya se entregó. Solo el Responsable Técnico puede reabrirla.' };
    return { ok:true };
  }
  if(modo === 'kiosco') return { ok:false, motivo:'Ítem interno' };
  if(it.asig && it.asig !== S.me.id) return { ok:false, motivo:'Asignado a ' + nombreUid(it.asig) };
  const chk = puedeValidar(S.me.id, miRol(), p, Pmap(), duos(), personas(), code);
  return chk;
}
async function marcarItem(sid, code, r, modo, extra){
  return conCandado('marca:' + sid + ':' + code, () => marcarItem_(sid, code, r, modo, extra));
}
async function marcarItem_(sid, code, r, modo, extra){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  const chk = puedeMarcar(ses, code, modo);
  if(!chk.ok) throw new Error(chk.motivo);
  if(r !== 's' && r !== 'n' && r !== null) throw new Error('Resultado inválido');
  if(modo === 'kiosco' && txt(extra && extra.nombre, 80).length < 3) throw new Error('Falta el nombre del evaluador externo');
  const por = modo === 'kiosco' ? { tipo:'ext', nombre: txt(extra && extra.nombre, 80), institucion: txt(extra && extra.institucion, 80), registra: S.me.id } : { tipo:'int', uid: S.me.id, rol: miRol() };
  await W.update('sesiones/' + sid, { items: { [code]: { r, t: nowISO(), por } } });
}
/* Kiosco: el evaluador externo entrega y sus marcas quedan cerradas */
async function entregarExterna(sid, nombre, institucion){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta') throw new Error('La validación no está abierta');
  const ext = Object.keys(ses.items).filter(c => ses.items[c].ev === 'ext');
  if(!ext.length) throw new Error('Esta validación no tiene estaciones externas');
  const falt = ext.filter(c => !ses.items[c].r);
  if(falt.length) throw new Error('Faltan por marcar: ' + falt.join(', '));
  const n = txt(nombre, 80); if(n.length < 3) throw new Error('Falta el nombre del evaluador externo');
  await W.update('sesiones/' + sid, { externa: { entregada: nowISO(), nombre: n, institucion: txt(institucion, 80), registra: S.me.id } });
  await logEvento('Evaluación externa entregada', sid, n + (institucion ? ' (' + txt(institucion, 80) + ')' : '') + ' · ' + ext.length + ' estaciones');
}
async function reabrirExterna(sid, motivo){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta' || !(ses.externa && ses.externa.entregada)) throw new Error('No hay una entrega externa que reabrir');
  if(!motivoValido(motivo)) throw new Error('Escribe el motivo');
  await W.update('sesiones/' + sid, { externa: { entregada: null, reabierta: nowISO(), motivo: txt(motivo, 300) } });
  await logEvento('Evaluación externa reabierta', sid, txt(motivo, 160));
}
async function marcarBasico(sid, area, r){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta' || ses.tipo !== 'JT') throw new Error('No corresponde');
  if(!AREAS[area] || (r !== 'ok' && r !== 'nivelar' && r !== null)) throw new Error('Dato inválido');
  const p = persona(ses.pid);
  const chk = puedeValidar(S.me.id, miRol(), p, Pmap(), duos(), personas());
  if(!chk.ok) throw new Error(chk.motivo);
  await W.update('sesiones/' + sid, { basico: { [area]: r } });
}
async function asignarItem(sid, code, uid){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta') throw new Error('La validación no está abierta');
  const it = ses.items[code];
  if(!it || it.ev !== 'int') throw new Error('Solo los ítems internos se asignan');
  if(it.r) throw new Error('Ese ítem ya tiene resultado');
  if(uid){ mustId(uid); const chk = puedeValidar(uid, rolEquipo(uid), persona(ses.pid), Pmap(), duos(), personas(), code); if(!chk.ok) throw new Error(chk.motivo); }
  const anterior = it.asig || null;
  await W.update('sesiones/' + sid, { items: { [code]: { asig: uid || null } } });
  const nueva = Object.assign({}, ses, { items: Object.assign({}, ses.items, { [code]: Object.assign({}, it, { asig: uid || null }) }) });
  S.D.sesiones[sid] = nueva;
  await publicarAgenda(nueva, null, anterior && anterior !== uid ? [anterior] : []);
  if(anterior && anterior !== uid) await logEvento('Ítem reasignado', sid, code + ': ' + nombreUid(anterior) + ' → ' + (uid ? nombreUid(uid) : 'sin asignar'));
}
async function aceptarMarcas(sid, uid){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)]; mustId(uid);
  const rec = recibidasSinAceptar(ses, S.D.marcas, S.D.agenda).find(x => x.uid === uid);
  if(!rec) throw new Error('No hay resultados pendientes de esa persona');
  const chk = puedeValidar(uid, rolEquipo(uid), persona(ses.pid), Pmap(), duos(), personas());
  if(!chk.ok) throw new Error('No se aceptan: ' + chk.motivo);
  const m = S.D.marcas[uid].sesiones[sid];
  const patch = {};
  for(const c of rec.cods) patch[c] = { r: m.items[c], t: m.enviado || nowISO(), por:{ tipo:'formador', uid, acepta: S.me.id, obs: txt(m.obs, 300) } };
  await transaccion('Aceptar resultados', [
    { path:'sesiones/' + sid, op:'update', data:{ items: patch } },
    { path:'agenda/' + uid, op:'update', data:{ sesiones: { [sid]: { estado:'aceptado' } } } }
  ]);
  await logEvento('Resultados de formador aceptados', sid, nombreUid(uid) + ' · ' + rec.cods.join(', '));
}
function resumenSesion(ses){
  const p = persona(ses.pid);
  const items = Object.keys(ses.items || {});
  const marc = items.filter(c => ses.items[c].r === 's' || ses.items[c].r === 'n').length;
  const bas = ses.tipo === 'JT' ? Object.keys(ses.basico || {}).filter(a => ses.basico[a]).length : 0;
  const totalB = ses.tipo === 'JT' ? 3 : 0;
  let ev = null;
  if(p && /^N[1-4]$/.test(ses.tipo)){
    const n = Number(ses.tipo.slice(1));
    const pre = new Set(preaprobadas(ses.tipo, p));
    const all = COMP.filter(x => x.n === n).map(x => ({ c:x.c, r: ses.items[x.c] ? ses.items[x.c].r : (pre.has(x.c) ? ((p.pauta[x.c] || {}).r === 'j' ? 'j' : 's') : null) }));
    ev = evaluar(all, params().umbralComp);
  } else if(ses.tipo === 'REV'){
    ev = evaluar(items.map(c => ({ c, r: ses.items[c].r })), params().umbralComp);
  } else {
    ev = { completo: marc === items.length && bas === totalB, aprobado:true, fallidas: items.filter(c => ses.items[c].r === 'n') };
  }
  return { total: items.length + totalB, marcados: marc + bas, ev, completo: marc === items.length && bas === totalB };
}
async function cerrarSesion(sid){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta') throw new Error('La validación no está abierta');
  const p = persona(ses.pid);
  if(!p) throw new Error('Persona no encontrada');
  const rs = resumenSesion(ses);
  if(!rs.completo) throw new Error('Faltan ítems por marcar');
  const fecha = S.hoy;
  const codes = Object.keys(ses.items);
  const pautaPatch = {};
  const patch = { actualizado: nowISO() };
  let resultado;
  if(ses.tipo === 'JT'){
    const est = {}; for(const c of codes) est[c] = ses.items[c].r;
    for(const c of codes) if(est[c] === 's') pautaPatch[c] = { r:'j', t:fecha, sid };
    patch.jornada = { fecha, basico: Object.assign({}, ses.basico), estaciones: est, sesion: sid };
    const dem = codes.filter(c => est[c] === 's');
    resultado = { aprobado:true, demostradas: dem, fallidas: codes.filter(c => est[c] === 'n'), fecha };
  } else {
    const n = ses.tipo === 'REV' ? null : Number(ses.tipo.slice(1));
    if(n && (p.nivel || 0) !== n - 1) throw new Error(p.nombre + ' tiene nivel ' + (p.nivel || 0) + ': no corresponde validar el nivel ' + n);
    for(const c of codes) pautaPatch[c] = { r: ses.items[c].r, t: fecha, sid, n: ses.intento };
    const hid = nid('h');
    patch.historial = { [hid]: { tipo: ses.tipo, intento: ses.intento, fecha, aprobado: rs.ev.aprobado, fallidas: rs.ev.fallidas.filter(c => codes.includes(c)), externa: codes.some(c => ses.items[c].ev === 'ext'), sid } };
    if(rs.ev.aprobado && n){ patch.nivel = n; patch.fechasNivel = { [n]: fecha }; }
    if(rs.ev.aprobado && ses.tipo === 'REV') patch.suspendidoAT = false;
    resultado = { aprobado: rs.ev.aprobado, fallidas: rs.ev.fallidas, fecha, comp: rs.ev.comp };
  }
  patch.pauta = pautaPatch;
  const pasos = [
    { path:'personas/' + p.id, op:'update', data: patch },
    { path:'sesiones/' + sid, op:'update', data:{ estado:'cerrada', resultado, cerrado: nowISO(), cerradoPor: S.me.id } }
  ];
  for(const uid of Object.keys(S.D.agenda)){ const a = S.D.agenda[uid]; if(a && a.sesiones && a.sesiones[sid]) pasos.push({ path:'agenda/' + uid, op:'update', data:{ sesiones: { [sid]: { estado:'cerrada' } } } }); }
  await transaccion('Cierre de la validación', pasos);
  // estado local inmediato para la proyección
  const np = JSON.parse(JSON.stringify(p));
  np.pauta = Object.assign({}, np.pauta, pautaPatch);
  if(patch.historial) np.historial = Object.assign({}, np.historial, patch.historial);
  if(patch.jornada) np.jornada = patch.jornada;
  if(patch.nivel) np.nivel = patch.nivel;
  if(patch.fechasNivel) np.fechasNivel = Object.assign({}, np.fechasNivel, patch.fechasNivel);
  if(patch.suspendidoAT === false) np.suspendidoAT = false;
  S.D.personas[p.id] = np;
  await syncMuchos([p.id, companero(p.id, duos())]);
  const msg = ses.tipo === 'JT' ? 'Jornada cerrada: ' + resultado.demostradas.length + ' de ' + codes.length + ' estaciones demostradas'
    : resultado.aprobado ? TIPOS_SESION[ses.tipo].l + ' aprobada' : TIPOS_SESION[ses.tipo].l + ' reprobada: repite ' + resultado.fallidas.join(', ');
  await logEvento(ses.tipo === 'JT' ? 'Jornada técnica cerrada' : resultado.aprobado ? 'Validación aprobada' : 'Validación reprobada', sid, p.nombre + ' · ' + msg);
  return { resultado, msg };
}
async function anularSesion(sid, motivo){
  requireAdmin();
  const ses = S.D.sesiones[mustId(sid)];
  if(!ses || ses.estado !== 'abierta') throw new Error('La validación no está abierta');
  await W.update('sesiones/' + sid, { estado:'anulada', motivoAnula: txt(motivo, 300), cerrado: nowISO(), cerradoPor: S.me.id });
  await cerrarAgenda(ses, 'anulada');
  await logEvento('Validación anulada', sid, txt(motivo, 160));
}

/* ---------- registros: incidentes, garantías, salidas ---------- */
async function registrarIncidente(o){
  requireAdmin();
  const pids = (o.pids || []).filter(id => validId(id) && persona(id));
  if(!pids.length) throw new Error('Elige a quién involucra');
  const id = nid('r');
  const doc = { id, tipo:'incidente', fecha: o.fecha || S.hoy, pids, grave: !!o.grave, detalle: txt(o.detalle, 600), creado: nowISO(), por: S.me.id };
  if(doc.detalle.length < 5) throw new Error('Describe el incidente');
  if(!fechaValida(doc.fecha)) throw new Error('La fecha no es válida');
  const pasos = [{ path:'registros/' + id, op:'set', data: doc }];
  if(doc.grave) for(const pid of pids) pasos.push({ path:'personas/' + pid, op:'update', data:{ suspendidoAT: { desde: doc.fecha, registro: id }, actualizado: nowISO() } });
  await transaccion('Registro del incidente', pasos);
  if(doc.grave) for(const pid of pids) S.D.personas[pid] = Object.assign({}, persona(pid), { suspendidoAT:{ desde: doc.fecha, registro:id } });
  await logEvento(doc.grave ? 'Incidente grave registrado' : 'Incidente registrado', id, pids.map(x => persona(x).nombre).join(', ') + (doc.grave ? ' · suspensión de alta tensión hasta revalidar' : ''));
  if(doc.grave) await syncMuchos(pids.flatMap(x => [x, companero(x, duos())]));
  return id;
}
async function registrarGarantia(o){
  requireAdmin();
  const pids = (o.pids || []).filter(id => validId(id) && persona(id));
  if(!pids.length) throw new Error('Elige a los técnicos del caso');
  const id = nid('r');
  const doc = { id, tipo:'garantia', fecha: o.fecha || S.hoy, pids, atribuible: !!o.atribuible, detalle: txt(o.detalle, 600), creado: nowISO(), por: S.me.id };
  if(doc.detalle.length < 5) throw new Error('Describe el caso');
  await W.set('registros/' + id, doc);
  await logEvento('Caso de garantía registrado', id, (doc.atribuible ? 'Atribuible a la instalación · ' : 'No atribuible · ') + pids.map(x => persona(x).nombre).join(', '));
  return id;
}
async function eliminarRegistro(id, motivo){
  requireAdmin(); mustId(id);
  const r = S.D.registros[id]; if(!r) return;
  await W.del('registros/' + id);
  await logEvento('Registro eliminado', id, r.tipo + ' del ' + r.fecha + ': ' + txt(motivo, 160));
}
async function registrarSalida(pid, o){
  requireAdmin(); mustId(pid);
  const p = persona(pid);
  if(!p || p.etapa !== 'tecnico') throw new Error('Solo un técnico activo registra salida');
  const d = duoActivoDe(pid, duos());
  const fecha = o.fecha || S.hoy;
  if(!fechaValida(fecha)) throw new Error('La fecha no es válida');
  const pasos = [{ path:'personas/' + pid, op:'update', data:{ etapa:'salio', salida:{ fecha, motivo: txt(o.motivo, 300), nivel: p.nivel || 0 }, actualizado: nowISO() } }];
  if(d) pasos.push({ path:'duos/' + d.id, op:'update', data:{ activo:false, hasta: fecha, motivoFin:'Salida de un integrante' } });
  await transaccion('Registro de la salida', pasos);
  if(d) S.D.duos[d.id] = Object.assign({}, d, { activo:false, hasta: fecha });
  S.D.personas[pid] = Object.assign({}, p, { etapa:'salio' });
  await logEvento('Salida registrada', pid, p.nombre + ' (nivel ' + (p.nivel || 0) + ')');
  await syncMuchos([pid, d ? (d.a === pid ? d.b : d.a) : null]);
}

/* ---------- duos ---------- */
async function formarDuo(a, b, fecha){
  requireAdmin(); mustId(a); mustId(b);
  const chk = puedeFormarDuo(a, b, Pmap(), duos(), personas());
  if(!chk.ok) throw new Error(chk.motivo);
  const id = nid('d');
  if(fecha && !fechaValida(fecha)) throw new Error('La fecha no es válida');
  const doc = { id, a, b, desde: fecha || S.hoy, activo:true, creado: nowISO(), por: S.me.id };
  await W.set('duos/' + id, doc);
  S.D.duos[id] = doc;
  await logEvento('Duo formado', id, persona(a).nombre + ' y ' + persona(b).nombre + (chk.aviso ? ' · ' + chk.aviso : ''));
  await syncMuchos([a, b]);
  return chk;
}
async function terminarDuo(did, motivo){
  requireAdmin(); mustId(did);
  const d = S.D.duos[did]; if(!d || !d.activo) throw new Error('El duo no está activo');
  // D13 se calcula aquí con la fecha del duo y el parámetro vigente; no se confía en lo que diga la pantalla
  const { anticipado, libreDesde } = separacionAnticipada(d, params(), S.hoy);
  if(anticipado && !motivoValido(motivo)) throw new Error('Antes del ' + fechaLarga(libreDesde) + ' solo se separa por seguridad o conflicto: escribe el motivo (D13)');
  await W.update('duos/' + did, { activo:false, hasta: S.hoy, motivoFin: txt(motivo, 300), anticipado: !!anticipado });
  S.D.duos[did] = Object.assign({}, d, { activo:false, hasta:S.hoy });
  await logEvento(anticipado ? 'Duo separado antes del plazo' : 'Duo terminado', did, persona(d.a).nombre + ' y ' + persona(d.b).nombre + ': ' + txt(motivo, 140));
  await syncMuchos([d.a, d.b]);
  return { anticipado };
}

/* ---------- solicitudes de rotación (D13) ----------
   El técnico escribe su solicitud en su propio documento; la respuesta vive en personas/,
   que solo escribe administración. Así nadie se aprueba su propia rotación. */
function solicitudesRotacion(){
  return Object.entries(S.D.solicitudes || {})
    .map(([uid, doc]) => ({ uid, sol: doc && doc.rotacion, p: personaPorUid(uid) }))
    .filter(x => x.sol && x.sol.id && x.p && x.p.etapa === 'tecnico' && !(x.p.rotacion && x.p.rotacion.id === x.sol.id))
    .map(x => Object.assign(x, { duo: duoActivoDe(x.p.id, duos()) }))
    .sort((a, b) => String(a.sol.enviada || '').localeCompare(String(b.sol.enviada || '')));
}
async function resolverSolicitudRotacion(uid, aprobar, respuesta){
  requireAdmin(); mustId(uid);
  return conCandado('rotacion:' + uid, async () => {
    const x = solicitudesRotacion().find(s => s.uid === uid);
    if(!x) throw new Error('La solicitud ya no está pendiente');
    const r = txt(respuesta, 300);
    if(!aprobar && !motivoValido(r)) throw new Error('Explica por qué se rechaza');
    const res = { id: x.sol.id, estado: aprobar ? 'aprobada' : 'rechazada', respuesta: r, fecha: S.hoy, por: S.me.id };
    const pasos = [];
    if(aprobar){
      if(!x.duo) throw new Error(x.p.nombre + ' ya no está en un duo activo');
      // el plazo se revisa aquí con la fecha del duo, no con lo que diga la solicitud
      const sep = separacionAnticipada(x.duo, params(), S.hoy);
      if(sep.anticipado) throw new Error('El duo cumple ' + rotacionMeses(params()) + ' meses el ' + fechaLarga(sep.libreDesde) + ': antes no se rota por solicitud (D13)');
      pasos.push({ path:'duos/' + x.duo.id, op:'update', data:{ activo:false, hasta: S.hoy, motivoFin: txt('Rotación pedida por ' + x.p.nombre + ': ' + x.sol.motivo, 300), anticipado:false } });
    }
    pasos.push({ path:'personas/' + x.p.id, op:'update', data:{ rotacion: res, actualizado: nowISO() } });
    await transaccion(aprobar ? 'Aprobación de la rotación' : 'Rechazo de la rotación', pasos);
    if(aprobar) S.D.duos[x.duo.id] = Object.assign({}, x.duo, { activo:false, hasta: S.hoy });
    S.D.personas[x.p.id] = Object.assign({}, x.p, { rotacion: res });
    await logEvento(aprobar ? 'Rotación aprobada' : 'Rotación rechazada', x.p.id, x.p.nombre + (r ? ': ' + r : ''));
    await syncMuchos(aprobar ? [x.duo.a, x.duo.b] : [x.p.id]);
    return res;
  });
}

/* ---------- parámetros, gestión y equipo ---------- */
function numOrNull(v, min, max){ if(v === '' || v === null || v === undefined) return null; const n = Number(v); if(!isFinite(n)) return null; return clamp(n, min, max); }
async function guardarParametros(pp){
  requireAdmin();
  const clean = {
    // numParam: un 0 escrito a propósito no se pierde (antes '0 || 3' guardaba 3)
    umbralComp: clamp(Math.round(numParam(pp.umbralComp, 85)), 50, 100),
    umbralFund: clamp(Math.round(numParam(pp.umbralFund, 2)), 1, 3),
    revalidacionMeses: clamp(Math.round(numParam(pp.revalidacionMeses, 12)), 1, 60),
    rotacionMinMeses: clamp(Math.round(numParam(pp.rotacionMinMeses, 3)), 0, 24),
    periodoAutonomoDias: numOrNull(pp.periodoAutonomoDias, 1, 365),
    firmaPorNivel: 'confirmada', // D18 cerrada: ya no se edita
    horasModulo: {}, horasValidacion: {}, bonoNivel: {}, v:1
  };
  for(const m of MODULOS) clean.horasModulo[m.id] = numOrNull(pp.horasModulo && pp.horasModulo[m.id], 0, 500);
  for(const t of Object.keys(TIPOS_SESION)) clean.horasValidacion[t] = numOrNull(pp.horasValidacion && pp.horasValidacion[t], 0, 200);
  for(const n of [1,2,3,4]) clean.bonoNivel[n] = numOrNull(pp.bonoNivel && pp.bonoNivel[n], 0, 100000000);
  const bp = pp.bonoPresupuesto;
  if(bp){
    clean.bonoPresupuesto = { presupuesto: numOrNull(bp.presupuesto, 0, 1e12), meses: numOrNull(bp.meses, 1, 60), paso: numOrNull(bp.paso, 1, 1e6), esperados:{}, pesos:{} };
    for(const n of [1,2,3,4]){ clean.bonoPresupuesto.esperados[n] = numOrNull(bp.esperados && bp.esperados[n], 0, 10000); clean.bonoPresupuesto.pesos[n] = numOrNull(bp.pesos && bp.pesos[n], 0, 100); }
  }
  const prev = params();
  await W.set('config/parametros', clean);
  const cambios = ['umbralComp','umbralFund','revalidacionMeses','rotacionMinMeses','periodoAutonomoDias','firmaPorNivel'].filter(k => prev[k] !== clean[k]).map(k => k + ': ' + prev[k] + ' → ' + clean[k]);
  await logEvento('Parámetros actualizados', 'config/parametros', cambios.join('; ') || 'horas o bono');
  S.D.params = clean;
  await syncTodosSilencioso();
}
async function syncTodosSilencioso(){ for(const p of personas()) if(p.uid) await syncExpediente(p.id); }
async function guardarGestion(g){
  requireAdmin();
  const cur = gestion();
  const clean = {
    costos: {
      horaFormacion: numOrNull(g.costos.horaFormacion, 0, 1e9), horaValidacionInterna: numOrNull(g.costos.horaValidacionInterna, 0, 1e9),
      validacionExterna: numOrNull(g.costos.validacionExterna, 0, 1e9), otros: numOrNull(g.costos.otros, 0, 1e12)
    },
    metas: {}, instalaciones: cur.instalaciones, equipo: cur.equipo, v:1
  };
  for(const i of INDICADORES) clean.metas[i.id] = numOrNull(g.metas && g.metas[i.id], 0, 1e9);
  if(g.instalaciones) clean.instalaciones = g.instalaciones;
  if(g.equipo) clean.equipo = g.equipo;
  await W.set('ajustes/gestion', clean);
  S.D.gestion = clean;
  await logEvento('Costos y metas actualizados', 'ajustes/gestion', '');
}
async function agregarInstalaciones(desde, hasta, cantidad){
  requireAdmin();
  const n = Math.round(Number(cantidad));
  if(!(n >= 0 && n <= 100000)) throw new Error('Cantidad inválida');
  if(!parseISO(desde) || !parseISO(hasta) || hasta < desde) throw new Error('Revisa las fechas del período');
  const id = nid('i');
  await W.upsert('ajustes/gestion', { instalaciones: { [id]: { id, desde, hasta, cantidad:n, por:S.me.id, t: nowISO() } } }, !!S.D.gestion);
  await logEvento('Instalaciones registradas', id, n + ' entre ' + desde + ' y ' + hasta);
}
async function setRolEquipo(uid, rol){
  requireAdmin(); mustId(uid);
  if(rol && !ROL_L[rol]) throw new Error('Rol inválido');
  const g = gestion();
  const eq = Object.assign({}, g.equipo);
  if(rol === 'formador'){ const p = personaPorUid(uid); if(!p || (p.nivel || 0) < 4) throw new Error('Formador requiere un técnico de nivel 4 con cuenta vinculada'); }
  if(rol) eq[uid] = { rol, desde: S.hoy }; else delete eq[uid];
  const full = Object.assign({}, g, { equipo: eq });
  await W.set('ajustes/gestion', full);
  S.D.gestion = full;
  await logEvento(rol ? 'Rol asignado' : 'Rol retirado', uid, nombreUid(uid) + (rol ? ': ' + ROL_L[rol] : ''));
}

/* ---------- técnico y postulante (escriben solo su propio avance) ---------- */
function miAvancePath(){ if(!validId(S.me.id)) throw new Error('Sin identidad: no se puede guardar tu avance'); return 'avance/' + S.me.id; }
async function enviarPostulacion(nombre, ant){
  const n = txt(nombre, 120);
  if(n.length < 3) throw new Error('Escribe tu nombre completo');
  await W.upsert(miAvancePath(), { postulacion: { nombre:n, perfil: limpiarAntecedentes(ant).perfil, antecedentes: limpiarAntecedentes(ant), enviada: nowISO() } }, !!S.mine.avance);
}
async function guardarFundamentosPropios(resp){
  await W.upsert(miAvancePath(), { fundamentos: { respuestas: limpiarRespuestas(resp), fecha: S.hoy } }, !!S.mine.avance);
}
async function registrarPractica(mid, ok, total, aprobado){
  if(!MOD[mid]) throw new Error('Módulo inválido');
  const prev = (S.mine.avance && S.mine.avance.modulos && S.mine.avance.modulos[mid]) || {};
  const res = { ok, total, fecha: S.hoy };
  const m = { intentos: (prev.intentos || 0) + 1, revisado: true, aprobado: !!(prev.aprobado || aprobado) };
  if(!prev.primera) m.primera = res;
  if(!prev.mejor || ok / total > prev.mejor.ok / prev.mejor.total) m.mejor = res;
  await W.upsert(miAvancePath(), { modulos: { [mid]: m } }, !!S.mine.avance);
}
async function marcarRevisado(mid){
  if(!MOD[mid]) throw new Error('Módulo inválido');
  await W.upsert(miAvancePath(), { modulos: { [mid]: { revisado: true } } }, !!S.mine.avance);
}
async function guardarSimulador(mid, datos){
  await W.upsert(miAvancePath(), { modulos: { [mid]: { sim: datos } } }, !!S.mine.avance);
}
/* Solicitud de rotación: el técnico la escribe en su propio documento (D13) */
function miSolicitudPath(){ if(!validId(S.me.id)) throw new Error('Sin identidad: no se puede enviar la solicitud'); return 'solicitudes/' + S.me.id; }
function solicitudPendienteMia(){
  const sol = S.mine.solicitud && S.mine.solicitud.rotacion;
  if(!sol) return null;
  const e = S.mine.expediente;
  if(e && e.rotacion && e.rotacion.id === sol.id) return null; // ya tiene respuesta
  return sol;
}
async function enviarSolicitudRotacion(motivo, preferencia){
  return conCandado('rotacion:' + S.me.id, async () => {
    const e = S.mine.expediente;
    if(!e || !e.duo) throw new Error('Necesitas estar en un duo activo para pedir rotación');
    const chk = puedePedirRotacion(e.duo.desde, params(), S.hoy);
    if(!chk.ok) throw new Error(chk.motivo);
    if(solicitudPendienteMia()) throw new Error('Ya tienes una solicitud pendiente');
    const m = txt(motivo, 600);
    if(!motivoRotacionValido(m)) throw new Error('Explica por qué quieres rotar (al menos ' + MIN_MOTIVO_ROTACION + ' caracteres)');
    const doc = { rotacion: { id: nid('rot'), motivo: m, preferencia: txt(preferencia, 200), fecha: S.hoy, enviada: nowISO(), duoDesde: e.duo.desde } };
    await W.set(miSolicitudPath(), doc);
    S.mine.solicitud = doc;
  });
}
async function retirarSolicitudRotacion(){
  if(!solicitudPendienteMia()) throw new Error('No tienes una solicitud pendiente');
  await W.set(miSolicitudPath(), { rotacion: null, retirada: nowISO() });
  S.mine.solicitud = { rotacion: null };
}
async function enviarMarcas(sid, items, obs){
  return conCandado('envio:' + sid, () => enviarMarcas_(sid, items, obs));
}
async function enviarMarcas_(sid, items, obs){
  mustId(sid);
  if(!validId(S.me.id)) throw new Error('Sin identidad');
  const ag = S.mine.agenda && S.mine.agenda.sesiones && S.mine.agenda.sesiones[sid];
  if(!ag || ag.estado !== 'pendiente') throw new Error('Esa evaluación ya no está pendiente');
  const clean = {};
  for(const c of Object.keys(ag.items || {})) if(items[c] === 's' || items[c] === 'n') clean[c] = items[c];
  if(Object.keys(clean).length !== Object.keys(ag.items || {}).length) throw new Error('Marca todos los ítems');
  await W.upsert('marcas/' + S.me.id, { sesiones: { [sid]: { items: clean, obs: txt(obs, 300), enviado: nowISO() } } }, !!S.mine.marcas);
}

/* ---------- respaldo: exportar y restaurar con prueba en seco ---------- */
const BK_COLS = ['personas','sesiones','duos','registros','avance','marcas','agenda','expedientes','bitacora','solicitudes'];
const BK_DOCS = ['config/parametros','config/contenido','ajustes/gestion'];
function armarRespaldo(){
  requireAdmin();
  const col = {};
  for(const c of BK_COLS) col[c] = JSON.parse(JSON.stringify(S.D[c] || {}));
  return { app:'lumine-habilita', v:1, modo: S.build, exportado: nowISO(), por: S.me.id,
    colecciones: col, documentos: { 'config/parametros': S.D.params ? JSON.parse(JSON.stringify(S.D.params)) : null, 'config/contenido': S.D.contenido ? JSON.parse(JSON.stringify(S.D.contenido)) : null, 'ajustes/gestion': S.D.gestion ? JSON.parse(JSON.stringify(S.D.gestion)) : null } };
}
async function exportarRespaldo(){
  const data = JSON.stringify(armarRespaldo(), null, 1);
  const nombre = 'lumine-habilita-respaldo-' + S.hoy + '.json';
  await logEvento('Respaldo exportado', null, Math.round(data.length / 1024) + ' KB');
  if(S.dl){
    try { await S.dl.save({ filename: nombre, data }); toast('Respaldo guardado'); return true; }
    catch(e){ if(e && e.code === 'declined') { toast('Descarga cancelada', 'info'); return false; } }
  }
  return data; // respaldo en texto si no hay descargas en esta vista
}
function depth(o, d){ if(d > 12) return d; if(o && typeof o === 'object') return Math.max(d, ...Object.values(o).map(v => depth(v, d + 1))); return d; }
function validarRespaldo(texto){
  if(typeof texto !== 'string' || texto.length > 2 * 1024 * 1024) throw new Error('El archivo supera 2 MB');
  let o; try { o = JSON.parse(texto); } catch(e){ throw new Error('No es un JSON válido'); }
  if(!o || o.app !== 'lumine-habilita' || o.v !== 1) throw new Error('No es un respaldo de Lumine Habilita');
  if(!isPlainObj(o.colecciones)) throw new Error('Respaldo sin colecciones');
  if(depth(o, 0) > 12) throw new Error('Estructura demasiado profunda');
  const writes = [];
  for(const c of Object.keys(o.colecciones)){
    if(!BK_COLS.includes(c)) throw new Error('Colección desconocida: ' + c);
    const m = o.colecciones[c];
    if(!isPlainObj(m)) throw new Error('Colección mal formada: ' + c);
    for(const id of Object.keys(m)){
      if(!validId(id)) throw new Error('Identificador inválido en ' + c + ': ' + id.slice(0, 40));
      if(!isPlainObj(m[id])) throw new Error('Documento mal formado: ' + c + '/' + id);
      if(c === 'personas'){
        const p = m[id];
        if(typeof p.nombre !== 'string' || p.nombre.length > 160) throw new Error('Persona sin nombre válido: ' + id);
        if(!['postulante','tecnico','salio','descartado'].includes(p.etapa)) throw new Error('Etapa inválida: ' + id);
        if(!(Number.isInteger(p.nivel) && p.nivel >= 0 && p.nivel <= 4)) throw new Error('Nivel inválido: ' + id);
      }
      writes.push({ path: c + '/' + id, data: m[id] });
    }
  }
  for(const d of BK_DOCS){ const v = o.documentos && o.documentos[d]; if(v !== null && v !== undefined){ if(!isPlainObj(v)) throw new Error('Documento mal formado: ' + d); writes.push({ path:d, data:v }); } }
  if(writes.length > DB_CAPACIDAD - 200) throw new Error('El respaldo tiene ' + writes.length + ' documentos y supera la capacidad de la base (' + DB_CAPACIDAD.toLocaleString('es-CL') + ')');
  for(const w of writes) if(JSON.stringify(w.data).length > 262144) throw new Error('Documento sobre 256 KiB: ' + w.path);
  return { o, writes };
}
function pruebaEnSeco(writes, reemplazar){
  const actual = {};
  for(const c of BK_COLS) for(const id of Object.keys(S.D[c] || {})) actual[c + '/' + id] = S.D[c][id];
  if(S.D.params) actual['config/parametros'] = S.D.params;
  if(S.D.gestion) actual['ajustes/gestion'] = S.D.gestion;
  if(S.D.contenido) actual['config/contenido'] = S.D.contenido;
  const nuevos = [], cambian = [], iguales = [], borrar = [];
  const inBk = new Set(writes.map(w => w.path));
  for(const w of writes){ if(!(w.path in actual)) nuevos.push(w.path); else if(stableStr(actual[w.path]) !== stableStr(w.data)) cambian.push(w.path); else iguales.push(w.path); }
  if(reemplazar) for(const p of Object.keys(actual)) if(!inBk.has(p)) borrar.push(p);
  return { nuevos, cambian, iguales, borrar };
}
async function aplicarRespaldo(writes, plan){
  requireAdmin();
  let n = 0;
  for(const w of writes){ if(plan.iguales.includes(w.path)) continue; await W.set(w.path, w.data); n++; }
  for(const p of plan.borrar){ await W.del(p); n++; }
  await logEvento('Respaldo restaurado', null, n + ' documentos escritos');
  return n;
}

/* ---------- contenido editable de los módulos (config/contenido) ----------
   El Responsable Técnico ajusta textos, cápsulas y preguntas sin programar.
   La estructura (competencias, niveles, reglas) sigue en el código a propósito:
   de ella dependen las 80+ pruebas y las reglas de evaluación. */
function limpiarContenido(mid, c){
  if(!MOD[mid]) throw new Error('Módulo inválido');
  const capsulas = (c.capsulas || []).slice(0, 12).map(k => ({ t: txt(k.t, 120), c: k.c && C[k.c] ? k.c : null, oficio: !!k.oficio, puntos: (k.puntos || []).map(x => txt(x, 400)).filter(Boolean).slice(0, 10) })).filter(k => k.t && k.puntos.length);
  const practica = (c.practica || []).slice(0, 40).map((q, i) => {
    const o = (q.o || []).map(x => txt(x, 240)).filter(Boolean).slice(0, 5);
    const a = Number(q.a);
    if(txt(q.q, 400).length < 8) throw new Error('Pregunta ' + (i + 1) + ': falta el enunciado');
    if(o.length < 2) throw new Error('Pregunta ' + (i + 1) + ': necesita al menos dos alternativas');
    if(!(Number.isInteger(a) && a >= 0 && a < o.length)) throw new Error('Pregunta ' + (i + 1) + ': marca la alternativa correcta');
    return { c: q.c && C[q.c] ? q.c : null, q: txt(q.q, 400), o, a, x: txt(q.x, 400) };
  });
  const out = { capsulas, practica, editado: nowISO(), por: S.me.id };
  if(c.mostrar) out.mostrar = clamp(Math.round(Number(c.mostrar) || 0), 1, 40);
  if(c.resumen) out.resumen = txt(c.resumen, 300);
  return out;
}
async function guardarContenido(mid, c){
  requireAdmin();
  const clean = limpiarContenido(mid, c);
  const base = CONTENIDO[mid] || {};
  if(base.reglas) clean.reglas = base.reglas;           // el simulador y los escenarios siguen siendo del código
  if(base.escenarios) clean.escenarios = base.escenarios;
  await W.upsert('config/contenido', { modulos: { [mid]: clean } }, !!S.D.contenido);
  await logEvento('Contenido de módulo editado', mid, MOD[mid].nombre + ' · ' + clean.capsulas.length + ' cápsulas, ' + clean.practica.length + ' preguntas');
}
async function restaurarContenido(mid){
  requireAdmin();
  if(!(S.D.contenido && S.D.contenido.modulos && S.D.contenido.modulos[mid])) return;
  await W.update('config/contenido', { modulos: { [mid]: null } });
  await logEvento('Contenido de módulo restaurado al original', mid, MOD[mid].nombre);
}

/* ---------- consistencia: reparar lo que dejó una operación cortada ---------- */
async function repararConsistencia(fix){
  requireAdmin();
  if(!fix) throw new Error('Este caso se revisa a mano');
  if(fix.tipo === 'cerrarDuo'){ await W.update('duos/' + mustId(fix.did), { activo:false, hasta:S.hoy, motivoFin:'Reparación de consistencia' }); }
  else if(fix.tipo === 'agenda'){ await W.update('agenda/' + mustId(fix.uid), { sesiones: { [mustId(fix.sid)]: { estado: fix.estado } } }); }
  else if(fix.tipo === 'sync'){ await syncExpediente(mustId(fix.pid)); }
  else if(fix.tipo === 'reabrirSesion'){ await W.update('sesiones/' + mustId(fix.sid), { estado:'abierta', resultado:null, cerrado:null, cerradoPor:null }); }
  else throw new Error('Reparación desconocida');
  await logEvento('Consistencia reparada', fix.did || fix.sid || fix.pid || null, fix.tipo);
}
function usoBase(){
  let n = 0;
  for(const c of BK_COLS) n += Object.keys(S.D[c] || {}).length;
  n += BK_DOCS.filter(d => d === 'config/parametros' ? S.D.params : d === 'config/contenido' ? S.D.contenido : S.D.gestion).length;
  return { docs: n, cap: DB_CAPACIDAD, pct: Math.round(1000 * n / DB_CAPACIDAD) / 10, aviso: n >= DB_CAPACIDAD * DB_AVISO };
}
