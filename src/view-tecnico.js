/* =====================================================================
   Vistas del técnico y del postulante (solo su propio expediente)
   ===================================================================== */
'use strict';

function miExp(){ return S.mine.expediente; }
function miAv(){ return S.mine.avance || {}; }
function estadoMio(e, c){
  const pt = (e.pauta || {})[c];
  if((e.plan.saltadas || []).includes(c) || (pt && pt.r === 'j')) return 'skip';
  if(pt && pt.r === 's') return 'done';
  if(pt && pt.r === 'n') return 'fail';
  if(C[c].n > (e.nivel || 0) + 1) return 'lock';
  return '';
}
function planMio(e){ return { modulos: e.plan.modulos || [], nivelacion: e.plan.nivelacion || [] }; }

/* ---------- MI RUTA ---------- */
VIEWS.ruta = function(){
  if(!cargado(['expediente','avance','params','solicitud'])) return vistaCargando();
  const e = miExp();
  if(!e) return page(phead({ title:'Aún no tienes expediente', lead:'Postula para empezar tu diagnóstico.' }), linkBtn('Postular', 'postular', { kind:'action', arrow:true }));
  const n = e.nivel || 0, sig = n < 4 ? n + 1 : null;
  const av = miAv();
  let paso;
  if(e.etapa === 'postulante') paso = { s:'info', ic:'clock', t: e.plan && (e.pauta && Object.values(e.pauta).some(x => x.r === 'j')) ? 'Diagnóstico listo: espera la decisión de ingreso' : 'Siguiente: jornada técnica presencial', d:'El Responsable Técnico te avisará la fecha. Mientras, puedes repasar los módulos de nivelación sugeridos.' };
  else if(e.suspendidoAT) paso = { s:'crit', ic:'shieldX', t:'Suspendido de alta tensión', d:'Tuviste un incidente grave. No bajas de nivel: vuelves a trabajar con alta tensión cuando apruebes la revalidación del core de seguridad.' };
  else if(e.repetir && e.repetir.length) paso = { s:'warn', ic:'refresh', t:'Repite solo: ' + e.repetir.join(', '), d:'No repites la validación completa. Repasa esos temas y pide una nueva fecha.' };
  else if(sig){ const lp = listoParaPresentarse(sig, planMio(e), av); paso = lp.listo ? { s:'ok', ic:'check', t:'Tienes derecho a presentarte al nivel ' + sig, d:'Completaste la práctica online. La validación es presencial: ' + NIVEL[sig].valida.toLowerCase() + '.' } : { s:'info', ic:'layers', t:'Completa tu práctica del nivel ' + sig, d:(lp.faltan.length === 1 ? 'Te falta 1 de ' : 'Te faltan ' + lp.faltan.length + ' de ') + lp.total + (lp.total === 1 ? ' módulo.' : ' módulos.') + ' La práctica online da derecho a presentarte; el nivel se gana en el taller.' }; }
  else paso = { s:'ok', ic:'grad', t:'Eres formador', d:'Puedes enseñar, validar a otros y firmar revisiones cruzadas.' };
  const rv = e.revalidacion || { estado:'na' };
  const mapa = h('div', { class:'cmap' }, [1,2,3,4].map(k => h('div', { class:'cmap-row' }, h('span', { class:'cmap-lv' }, 'N' + k), h('div', { class:'cmap-tiles' }, COMP.filter(x => x.n === k).map(x => { const st = estadoMio(e, x.c); const t = tile(x.c, (st || '') + ' lg'); if(st === 'done') t.appendChild(icon('check')); return t; })))));
  const hecho = COMP.filter(x => ['done','skip'].includes(estadoMio(e, x.c))).length;
  return page(
    phead({ eyebrow: e.demo ? 'Expediente ficticio de demostración' : 'Tu ruta de habilitación', eic:'route', title:'Hola, ' + (e.nombre || '').split(' ')[0], lead: n ? 'Eres ' + NIVEL[n].nombre.toLowerCase() + '. ' + NIVEL[n].habilita : 'Estás en formación hacia el nivel 1. Todos entran por el nivel 1.' }),
    h('div', { class:'card', style:'--pad:18px;margin-bottom:18px' }, trackNiveles(n, e.fechasNivel)),
    h('div', { class:'alert ' + paso.s, style:'margin-bottom:18px' }, h('span', { class:'ai' }, icon(paso.ic, 's20')), h('div', null, h('div', { class:'at' }, paso.t), h('div', { class:'ad' }, paso.d)), sig && !e.suspendidoAT ? h('div', { class:'aa' }, linkBtn('Ir a módulos', 'modulos', { size:'sm', kind:'action' })) : null),
    h('div', { class:'grid g3', style:'--g:14px' },
      h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Tu duo'), e.duo ? frag(h('div', { class:'row', style:'gap:10px' }, avatar(e.duo.companero), h('div', null, h('b', null, e.duo.companero), h('div', { class:'hint' }, 'Nivel ' + e.duo.companeroNivel + ' · desde ' + fechaCorta(e.duo.desde)))), bloqueRotacion(e)) : frag(h('p', { class:'small muted' }, n >= 1 ? 'Sin duo asignado.' : 'Entras a un duo al validar el nivel 1.'), bloqueRotacion(e))),
      h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Revalidación de seguridad'), rv.estado === 'na' ? h('p', { class:'small muted' }, 'Aplica desde el nivel 1.') : frag(h('div', { class:'h3' }, fechaCorta(rv.vence)), badge(rv.estado === 'vencida' ? 'Vencida' : rv.estado === 'pronto' ? 'Vence ' + relDias(rv.dias) : 'Vigente', rv.estado === 'vencida' ? 'crit' : rv.estado === 'pronto' ? 'warn' : 'ok'))),
      h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Bono por avance'), (e.bono || []).length ? e.bono.map(b => h('div', { class:'row sb small' }, h('span', null, 'Nivel ' + b.n), h('b', null, b.monto === null ? 'Monto por definir' : clp(b.monto)))) : h('p', { class:'small muted' }, 'Se gana por nivel validado, nunca por nota online.'))),
    h('section', { class:'section card' }, h('div', { class:'card-h' }, h('h2', { class:'h4' }, 'Tus 39 competencias'), h('span', { class:'hint' }, hecho + ' aprobadas o demostradas')), mapa,
      h('div', { class:'cmap-legend', style:'margin-top:12px' }, h('span', null, h('i', { class:'tile core' }), 'Core'), h('span', null, h('i', { class:'tile oficio' }), 'Oficio'), h('span', null, h('i', { class:'tile desarrollo' }), 'Desarrollo'), h('span', null, h('i', { class:'tile oficio skip' }), 'Demostrada'), h('span', null, h('i', { class:'tile core fail' }), 'Repetir'))),
    (e.historial || []).length ? h('section', { class:'section' }, h('h2', { class:'h3', style:'margin-bottom:12px' }, 'Tu historial'), tablaDe(['Validación','Intento','Fecha','Resultado'], e.historial.slice().reverse().map(x => [TIPOS_SESION[x.tipo] ? TIPOS_SESION[x.tipo].l : x.tipo, x.intento === 1 ? '1 · primera nota' : String(x.intento), fechaCorta(x.fecha), badge(x.aprobado ? 'Aprobada' : 'Repite ' + (x.fallidas || []).join(', '), x.aprobado ? 'ok' : 'crit')]))) : null);
};

/* ---------- rotación de duo (D13): se pide por escrito al Responsable Técnico ---------- */
function bloqueRotacion(e){
  const sol = solicitudPendienteMia();
  const res = e.rotacion && S.mine.solicitud && S.mine.solicitud.rotacion && e.rotacion.id === S.mine.solicitud.rotacion.id ? e.rotacion : null;
  const out = [];
  if(res) out.push(h('div', { class:'stack', style:'--g:4px', 'data-rotacion':res.estado },
    badge(res.estado === 'aprobada' ? 'Rotación aprobada' : 'Rotación rechazada', res.estado === 'aprobada' ? 'ok' : 'warn', res.estado === 'aprobada' ? 'check' : 'info'),
    h('span', { class:'hint' }, (res.estado === 'aprobada' ? 'El Responsable Técnico te asignará tu nuevo duo.' : 'Respuesta: ' + (res.respuesta || 'sin comentario')) + ' · ' + fechaCorta(res.fecha))));
  if(!e.duo) return out.length ? frag(out) : null;
  if(sol){
    const ret = btn('Retirar', { kind:'ghost', size:'sm', onClick: async () => {
      const r = await dialog({ title:'Retirar la solicitud', icon:'duo', confirm:'Retirar', body:'Sigues en tu duo actual. Puedes volver a pedir rotación cuando quieras.' });
      if(!r) return;
      try { await retirarSolicitudRotacion(); toast('Solicitud retirada'); } catch(err){ toast(errMsg(err), 'crit'); }
    } });
    out.push(h('div', { class:'row sb', style:'gap:8px', 'data-rotacion':'pendiente' }, h('div', { class:'stack', style:'--g:2px' }, badge('Rotación pedida', 'info', 'clock'), h('span', { class:'hint' }, 'Enviada el ' + fechaCorta(sol.fecha) + '. La revisa el Responsable Técnico.')), ret));
    return frag(out);
  }
  const chk = puedePedirRotacion(e.duo.desde, params(), S.hoy);
  if(!chk.ok){ out.push(h('span', { class:'hint' }, chk.motivo + '.')); return frag(out); }
  out.push(h('div', null, btn('Pedir rotación', { kind:'ghost', size:'sm', icon:'refresh', onClick: () => hojaRotacion(e) })));
  return frag(out);
}
function hojaRotacion(e){
  openSheet('Pedir rotación de duo', close => {
    const mot = h('textarea', { class:'textarea', maxlength:'600', autofocus:'', placeholder:'Qué no está funcionando o qué quieres aprender con otra persona' });
    const pref = inputEl({ maxlength:'200', placeholder:'Opcional' });
    const cuenta = h('span', { class:'hint', 'aria-live':'polite' });
    const env = btn('Enviar al Responsable Técnico', { kind:'action', icon:'arrowRight' });
    const upd = () => { const n = mot.value.trim().length; cuenta.textContent = n >= MIN_MOTIVO_ROTACION ? 'Listo para enviar.' : 'Faltan ' + (MIN_MOTIVO_ROTACION - n) + ' caracteres.'; env.disabled = n < MIN_MOTIVO_ROTACION; };
    mot.addEventListener('input', upd); setTimeout(upd, 0);
    env.addEventListener('click', () => busy(env, async () => { await enviarSolicitudRotacion(mot.value, pref.value); toast('Solicitud enviada'); close(); }));
    return h('div', { class:'stack', style:'--g:16px' },
      h('p', { class:'body ink2' }, 'Trabajas con ' + e.duo.companero + ' desde el ' + fechaLarga(e.duo.desde) + '. La rotación es voluntaria y es una vía abierta para mejorar cómo trabaja cada duo: explica por qué la pides.'),
      field('¿Por qué quieres rotar?', mot), cuenta,
      field('¿Con quién te gustaría trabajar?', pref, 'El Responsable Técnico decide la nueva pareja.'),
      h('div', { class:'card mist', style:'--pad:14px' }, h('b', { class:'small' }, 'Requisitos del nuevo duo'),
        h('ul', { class:'small ink2', style:'padding-left:18px;margin-top:6px;display:flex;flex-direction:column;gap:4px' },
          h('li', null, 'Al menos un técnico de nivel 3 o 4.'), h('li', null, 'Nunca dos técnicos de nivel 1.'), h('li', null, 'Nadie valida a su compañero de duo.'))),
      h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), env));
  });
}

/* ---------- MÓDULOS ---------- */
function estadoModulo(id){ const m = (miAv().modulos || {})[id]; return m ? (m.aprobado ? 'aprobado' : m.revisado ? 'revisado' : 'iniciado') : 'nuevo'; }
VIEWS.modulos = function(){
  if(!cargado(['expediente','avance'])) return vistaCargando();
  const e = miExp();
  const plan = e ? planMio(e) : { modulos: MODULOS.filter(m => m.nivel === 0).map(m => m.id), nivelacion: [] };
  const n = e ? (e.nivel || 0) : 0;
  const grupos = [[0, 'Nivelación'], [1, 'Nivel 1'], [2, 'Nivel 2'], [3, 'Nivel 3'], [4, 'Nivel 4']];
  const card = m => {
    const locked = !moduloDesbloqueado(m, { nivel:n });
    const st = estadoModulo(m.id);
    const skipT = e ? m.cod.filter(c => (e.plan.saltadas || []).includes(c)) : [];
    const inner = h('div', { class:'modcard' },
      h('div', { class:'mh' }, h('div', null, h('span', { class:'mono xs muted' }, m.id), h('h3', { class:'h4' }, m.nombre)),
        locked ? badge('Bloqueado', 'line', 'lock') : st === 'aprobado' ? badge('Práctica aprobada', 'ok', 'check') : st === 'revisado' ? badge('Revisado', 'ok', 'check') : badge(st === 'iniciado' ? 'En curso' : 'Pendiente', 'info')),
      h('p', { class:'small ink2' }, m.resumen),
      m.cod.length ? h('div', { class:'tag-row' }, m.cod.map(c => h('span', { class:'badge ' + (skipT.includes(c) ? 'demo' : 'line'), title: skipT.includes(c) ? 'Demostrada en tu jornada' : C[c].t }, c))) : null,
      locked ? h('span', { class:'hint' }, 'Se desbloquea al validar el nivel ' + (m.nivel - 1) + '.') : null);
    return locked ? h('div', { class:'card modcard locked' }, inner) : h('a', { class:'card link', href:'#modulo-' + m.id }, inner);
  };
  return page(
    phead({ eyebrow:'Formación online', eic:'layers', title:'Tus módulos', lead:'Contenido corto, con casos del taller y simulador, repetible sin límite. El avance se desbloquea por nivel y el repaso queda siempre abierto (D9).' }),
    grupos.map(([lv, l]) => { const ms = MODULOS.filter(m => m.nivel === lv && plan.modulos.includes(m.id)); return ms.length ? h('section', { class:'section', style:'margin-top:22px' }, h('h2', { class:'h3', style:'margin-bottom:12px' }, l), h('div', { class:'grid g3', style:'--g:12px' }, ms.map(card))) : null; }));
};

/* ---------- MÓDULO (contenido, simulador y práctica) ---------- */
function simuladorReglas(mid, reglas){
  const st = ui('sim-' + mid, { orden: null, revisado:false });
  if(!st.orden){ const a = reglas.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if(a.join() === reglas.join()) a.reverse(); st.orden = a; }
  const lista = h('div', { class:'sim', role:'list', 'aria-label':'Orden de las reglas' });
  const res = h('div', { 'aria-live':'polite' });
  const pintar = () => {
    clear(lista);
    st.orden.forEach((r, i) => {
      const cls = st.revisado ? (r === reglas[i] ? ' ok' : ' bad') : '';
      const up = btn('', { kind:'quiet', size:'sm', icon:'chevDown', aria:'Subir ' + r, cls:'icon', disabled: i === 0 || null });
      up.querySelector('svg').style.transform = 'rotate(180deg)';
      const dn = btn('', { kind:'quiet', size:'sm', icon:'chevDown', aria:'Bajar ' + r, cls:'icon', disabled: i === st.orden.length - 1 || null });
      up.addEventListener('click', () => { [st.orden[i - 1], st.orden[i]] = [st.orden[i], st.orden[i - 1]]; st.revisado = false; pintar(); lista.children[i - 1].querySelector('button').focus(); });
      dn.addEventListener('click', () => { [st.orden[i + 1], st.orden[i]] = [st.orden[i], st.orden[i + 1]]; st.revisado = false; pintar(); const b = lista.children[i + 1].querySelectorAll('button'); b[b.length - 1].focus(); });
      lista.appendChild(h('div', { class:'simrow' + cls, role:'listitem' }, h('span', { class:'sp' }, String(i + 1)), h('span', { class:'small', style:'font-weight:600' }, r), h('span', { class:'mv' }, up, dn)));
    });
  };
  const ok = btn('Revisar orden', { kind:'action', size:'sm', icon:'check' });
  ok.addEventListener('click', () => { st.revisado = true; pintar(); const bien = st.orden.every((r, i) => r === reglas[i]); clear(res).appendChild(notice(bien ? 'ok' : 'warn', bien ? 'check' : 'refresh', bien ? 'Orden correcto: cortar, bloquear, verificar, poner a tierra y señalizar.' : 'Hay reglas fuera de lugar (en rojo). Sin cortar y bloquear antes, la verificación no sirve.')); if(bien && S.mine.avance !== undefined) guardarSimulador(mid, { reglas:true, fecha:S.hoy }).catch(() => {}); });
  pintar();
  return h('div', { class:'card stack', style:'--g:12px' }, eyebrow('Simulador', 'play'), h('h3', { class:'h3' }, 'Ordena las cinco reglas de oro'), h('p', { class:'small ink2' }, 'Usa las flechas para dejarlas en el orden en que se aplican antes de intervenir alta tensión.'), lista, h('div', { class:'row' }, ok), res);
}
function escenarios(mid, esc){
  const st = ui('esc-' + mid, {});
  return h('div', { class:'card stack', style:'--g:12px' }, eyebrow('Encargado de seguridad', 'hand'), h('h3', { class:'h3' }, '¿Detienes o sigues?'),
    esc.map((x, i) => {
      const r = st[i];
      const fb = r ? notice(r === x.a ? 'ok' : 'crit', r === x.a ? 'check' : 'x', (r === x.a ? 'Bien. ' : 'No. ') + x.x) : null;
      const mk = (v, l, ic) => { const b = h('button', { type:'button', class:'btn ' + (r === v ? (v === x.a ? 'btn-action' : 'btn-danger solid') : 'btn-ghost') + ' sm', 'data-k':'esc' + i + v }, icon(ic, 's16'), l); b.addEventListener('click', () => { st[i] = v; render(true); }); return b; };
      return h('div', { class:'stack', style:'--g:8px;padding-top:10px;border-top:1px solid var(--line)' }, h('p', { class:'small' }, x.q), h('div', { class:'row' }, mk('detener', 'Detener', 'stop'), mk('seguir', 'Seguir', 'play')), fb);
    }));
}
/* ---------- PRÁCTICA EVALUADA ----------
   Una pregunta a la vez, tomadas al azar del banco y con las alternativas mezcladas
   en cada intento. El material no está en esta pantalla: volver a él reinicia el intento.
   La explicación aparece recién al revisar. Teclas: 1-4 o A-D eligen, Enter avanza. */
let PRAC_ACTUAL = null;
document.addEventListener('keydown', ev => {
  const P = PRAC_ACTUAL;
  if(!P || !document.getElementById('prac-box') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
  const k = ev.key.toLowerCase();
  const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
  if(i >= 0 && k.length === 1){ ev.preventDefault(); P.elegir(i); }
  else if(k === 'enter'){ ev.preventDefault(); P.siguiente(); }
  else if(k === 'arrowleft'){ P.anterior(); }
  else if(k === 'arrowright'){ P.siguiente(); }
});
function nuevaSemilla(){ return (Math.floor(Math.random() * 2147483647) ^ Date.now()) >>> 0; }
function practica(mid, ct){
  const banco = ct.practica;
  const st = ui('prac-' + mid, { seed: nuevaSemilla(), idx:0, resp:{}, enviado:false });
  const intento = armarIntento(banco, ct.mostrar || banco.length, st.seed);
  const n = intento.length;
  const pr = params();
  const correcta = k => st.resp[k] !== undefined && intento[k].orden[st.resp[k]] === banco[intento[k].qi].a;
  const okN = intento.filter((_, k) => correcta(k)).length;
  const ev = evaluar(intento.map((x, k) => ({ c: banco[x.qi].c || 'C01', r: st.resp[k] === undefined ? null : (correcta(k) ? 's' : 'n') })), pr.umbralComp);
  const m = (miAv().modulos || {})[mid] || {};
  const reiniciar = () => { st.seed = nuevaSemilla(); st.idx = 0; st.resp = {}; st.enviado = false; render(true); };
  const box = h('div', { id:'prac-box', class:'card stack prac', style:'--g:16px' });
  const notas = m.primera ? h('div', { class:'tag-row' }, badge('Primera nota: ' + m.primera.ok + ' de ' + m.primera.total, 'line'), m.mejor ? badge('Mejor: ' + m.mejor.ok + ' de ' + m.mejor.total, 'info') : null, m.aprobado ? badge('Aprobada', 'ok', 'check') : null) : null;
  if(st.enviado){
    PRAC_ACTUAL = null;
    const rev = intento.map((x, k) => {
      const q = banco[x.qi], mia = st.resp[k] === undefined ? null : x.orden[st.resp[k]], bien = mia === q.a;
      return h('div', { class:'prevq ' + (bien ? 'ok' : 'bad') }, h('div', { class:'row', style:'gap:8px' }, h('span', { class:'pn' }, icon(bien ? 'check' : 'x', 's14')), h('span', { class:'hint' }, 'Pregunta ' + (k + 1)), q.c ? codeTag(q.c) : null),
        h('p', { class:'small', style:'font-weight:600' }, q.q),
        bien ? null : h('p', { class:'small' }, h('span', { class:'muted' }, 'Tu respuesta: '), mia === null ? 'sin responder' : q.o[mia]),
        h('p', { class:'small' }, h('span', { class:'muted' }, 'Correcta: '), q.o[q.a]), q.x ? h('p', { class:'hint' }, q.x) : null);
    });
    const vec = vecinosModulo(mid, planMio(miExp() || { plan:{ modulos:[] } }), (miExp() || {}).nivel || 0);
    addKids(box, [eyebrow('Práctica por caso', 'list'), h('h3', { class:'h3' }, 'Resultado'), notas,
      h('div', { class:'verdict ' + (ev.aprobado ? 'ok' : 'crit') }, h('span', { class:'vi' }, icon(ev.aprobado ? 'check' : 'refresh', 's20')), h('div', null, h('b', null, okN + ' de ' + n + (ev.aprobado ? ' · aprobada' : ' · aún no')), h('div', { class:'small ink2' }, ev.aprobado ? 'Tienes derecho a presentarte con este módulo.' : 'Seguridad y producto exigen todas correctas. Revisa las explicaciones: el próximo intento trae otras preguntas y otro orden.'))),
      h('div', { class:'stack', style:'--g:10px' }, rev),
      h('div', { class:'row sb' }, btn('Nuevo intento', { kind:'ghost', icon:'refresh', onClick: reiniciar }), ev.aprobado && vec.next ? linkBtn('Siguiente: ' + vec.next.nombre, 'modulo-' + vec.next.id, { kind:'action', arrow:true }) : null)]);
    return box;
  }
  const k = Math.min(st.idx, n - 1);
  const x = intento[k], q = banco[x.qi];
  const respondidas = Object.keys(st.resp).length;
  const elegir = j => { if(j < 0 || j >= x.orden.length) return; st.resp[k] = j; render(true); };
  const siguiente = () => { if(st.resp[k] === undefined){ toast('Elige una alternativa', 'info'); return; } if(k < n - 1){ st.idx = k + 1; render(true); } else enviarF(); };
  const anterior = () => { if(k > 0){ st.idx = k - 1; render(true); } };
  const enviarF = () => {
    if(respondidas < n){ const f = intento.findIndex((_, i) => st.resp[i] === undefined); st.idx = f; render(true); toast('Te falta responder la pregunta ' + (f + 1), 'info'); return; }
    busy(enviar, async () => { st.enviado = true; try { await registrarPractica(mid, okN, n, ev.aprobado); } catch(e){ toast(errMsg(e), 'warn'); } render(true); });
  };
  PRAC_ACTUAL = { elegir, siguiente, anterior };
  const dots = h('div', { class:'pdots', role:'tablist', 'aria-label':'Preguntas' }, intento.map((_, i) => { const b = h('button', { type:'button', class:'pdot' + (i === k ? ' on' : '') + (st.resp[i] !== undefined ? ' done' : ''), 'aria-label':'Pregunta ' + (i + 1) + (st.resp[i] !== undefined ? ', respondida' : ''), 'aria-current': i === k ? 'step' : null }, String(i + 1)); b.addEventListener('click', () => { st.idx = i; render(true); }); return b; }));
  const opts = h('div', { class:'opts', role:'radiogroup', 'aria-label':'Alternativas' }, x.orden.map((oi, j) => {
    const b = h('button', { type:'button', class:'opt', role:'radio', 'aria-checked': st.resp[k] === j ? 'true' : 'false', 'aria-pressed': st.resp[k] === j ? 'true' : 'false', 'data-k':'p' + k + '-' + j }, h('span', { class:'ol' }, 'ABCD'[j] || String(j + 1)), h('span', null, q.o[oi]));
    b.addEventListener('click', () => elegir(j));
    return b;
  }));
  const enviar = btn(k < n - 1 ? 'Siguiente' : 'Revisar respuestas', { kind:'action', icon: k < n - 1 ? 'arrowRight' : 'check' });
  enviar.addEventListener('click', siguiente);
  addKids(box, [h('div', { class:'row sb' }, eyebrow('Práctica por caso', 'list'), h('span', { class:'small num muted' }, respondidas + ' de ' + n + ' respondidas')), notas,
    dots,
    h('div', { class:'q' }, h('div', { class:'row', style:'gap:8px' }, q.c ? codeTag(q.c) : null, q.c ? critTag(C[q.c].k) : null, h('span', { class:'hint' }, 'Caso ' + (k + 1) + ' de ' + n)), h('p', { class:'h4', style:'font-weight:600' }, q.q), opts),
    h('div', { class:'row sb' }, btn('Anterior', { kind:'ghost', icon:'arrowLeft', disabled: k === 0 || null, onClick: anterior }), enviar),
    h('p', { class:'hint' }, 'Atajos: 1 a 4 para elegir, Enter para avanzar. Cada intento trae preguntas y orden distintos.')]);
  return box;
}

/* ---------- MÓDULO: aprende → practica → rinde ---------- */
VIEWS.modulo = function(mid){
  const m = MOD[mid];
  PRAC_ACTUAL = null;
  if(!m) return page(phead({ back:['modulos','Módulos'], title:'Módulo no encontrado' }));
  if(!cargado(['expediente','avance'])) return vistaCargando();
  const e = miExp();
  if(e && !moduloDesbloqueado(m, { nivel: e.nivel || 0 })) return page(phead({ back:['modulos','Módulos'], title: m.nombre }), notice('', 'lock', 'Se desbloquea al validar el nivel ' + (m.nivel - 1) + '.'));
  const ct = contenidoDe(mid);
  const sk = e ? (e.plan.saltadas || []) : [];
  const est = estadoModulo(mid);
  const plan = e ? planMio(e) : { modulos: MODULOS.filter(x => x.nivel === 0).map(x => x.id) };
  const vec = vecinosModulo(mid, plan, e ? (e.nivel || 0) : 0);
  const revisar = btn(est === 'nuevo' || est === 'iniciado' ? 'Marcar como revisado' : 'Revisado', { kind: est === 'nuevo' || est === 'iniciado' ? 'action' : 'ghost', icon:'check', disabled: !(est === 'nuevo' || est === 'iniciado') || null });
  revisar.addEventListener('click', () => busy(revisar, async () => { await marcarRevisado(mid); toast('Módulo marcado como revisado'); }));
  const comps = m.cod.map(c => h('div', { class:'crow' + (sk.includes(c) ? ' skip' : '') }, codeTag(c), h('span', { class:'ct' }, C[c].t), sk.includes(c) ? badge('Ya la demostraste', 'ok') : prioTag(C[c].p)));
  // navegación entre módulos de la misma línea, sin volver a la lista
  const navMod = h('nav', { class:'modnav', 'aria-label':'Otros módulos' },
    vec.prev ? h('a', { class:'modnav-a prev', href:'#modulo-' + vec.prev.id }, icon('arrowLeft', 's16'), h('span', null, h('small', null, 'Anterior'), vec.prev.nombre)) : h('span'),
    vec.next ? h('a', { class:'modnav-a next', href:'#modulo-' + vec.next.id }, h('span', null, h('small', null, 'Siguiente'), vec.next.nombre), icon('arrowRight', 's16')) : h('span'));
  const pos = vec.de > 1 ? (m.nivel ? 'Nivel ' + m.nivel : 'Nivelación') + ' · módulo ' + vec.pos + ' de ' + vec.de : (m.nivel ? 'Nivel ' + m.nivel : 'Nivelación');
  const head = phead({ back:['modulos','Módulos'], eyebrow: pos + ' · ' + mid, eic:'layers', title: m.nombre, lead: (ct && ct.resumen) || m.resumen, actions: ct && ct.practica ? null : [revisar] });
  if(!ct || !(ct.capsulas || []).length){
    return page(head, comps.length ? h('div', { class:'stack', style:'--g:6px;margin-bottom:22px' }, h('span', { class:'label' }, 'Competencias del módulo'), comps) : null,
      h('div', { class:'stack', style:'--g:12px' }, emptyState('file', 'Contenido en preparación', 'El Responsable Técnico puede cargarlo desde Ajustes › Contenido. Mientras, repásalo con tu formador y márcalo como revisado.'), h('div', { class:'row', style:'justify-content:center' }, revisar)), navMod);
  }
  const tienePractica = !!(ct.reglas || ct.escenarios);
  const pasos = [['aprende', 'Aprende', 'book']].concat(tienePractica ? [['practica', 'Practica', 'play']] : []).concat(ct.practica && ct.practica.length ? [['rinde', 'Rinde la práctica', 'list']] : []);
  const st = ui('mod-' + mid, { paso:'aprende' });
  if(!pasos.some(x => x[0] === st.paso)) st.paso = 'aprende';
  const pst = UI['prac-' + mid];
  const intentoEnCurso = pst && !pst.enviado && Object.keys(pst.resp || {}).length > 0;
  const irA = async v => {
    if(v === st.paso) return;
    if(st.paso === 'rinde' && intentoEnCurso && v !== 'rinde'){
      const r = await dialog({ title:'¿Dejar la práctica?', icon:'refresh', iconKind:'warn', confirm:'Volver al material', body:'Si vuelves al material, este intento se reinicia con otras preguntas. Así la práctica mide lo que sabes, no lo que copias.' });
      if(!r) return;
      delete UI['prac-' + mid];
    }
    st.paso = v; render(true); window.scrollTo(0, 0);
  };
  const stepper = h('div', { class:'modsteps', role:'tablist', 'aria-label':'Pasos del módulo' }, pasos.map(([v, l, ic], i) => {
    const b = h('button', { type:'button', role:'tab', class:'modstep' + (st.paso === v ? ' on' : ''), 'aria-selected': st.paso === v ? 'true' : 'false' }, h('i', null, String(i + 1)), icon(ic, 's16'), l);
    b.addEventListener('click', () => irA(v)); return b; }));
  let cuerpo;
  if(st.paso === 'aprende'){
    const sig = pasos[1];
    cuerpo = h('div', { class:'stack', style:'--g:16px' },
      m.ic ? notice('info', 'lock', h('b', null, 'La biblioteca de calibraciones no se guarda en la plataforma. '), 'Este módulo enseña a cargarlas y registrarlas; lo enseña y lo valida Ingeniería de Calibración.') : null,
      comps.length ? h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Competencias del módulo'), comps) : null,
      modPiezas(mid).length ? h('div', { class:'lab-link' }, h('span', { class:'ll-ic' }, icon('cube', 's20')), h('div', { class:'stack', style:'--g:6px' }, h('b', { class:'small' }, 'Míralo en el laboratorio 3D'), h('div', { class:'tag-row' }, modPiezas(mid).map(p => h('a', { class:'badge info', href:'#laboratorio-' + p.id }, p.n))))) : null,
      notice('', 'info', (mid === 'N1-1' || mid === 'NIV-E') ? 'Contenido de la Fase 3. El contenido oficial se valida con la parte externa de seguridad (D5).' : 'Contenido base general. Se valida con la parte externa de seguridad (D5)' + (m.ic ? ' y con Ingeniería de Calibración.' : '.') + ' Lo propio del kit lo enseña tu formador en el taller.'),
      h('div', { class:'grid g2', style:'--g:12px' }, ct.capsulas.filter(k => !(k.oficio && sk.includes(k.c))).map((k, i) => h('div', { class:'card capsule' }, h('span', { class:'cn' }, String(i + 1)), h('div', { class:'stack', style:'--g:8px' }, h('h3', { class:'h4' }, k.t), h('ul', null, k.puntos.map(p => h('li', { class:'small' }, p))))))),
      h('div', { class:'row sb' }, est === 'nuevo' || est === 'iniciado' ? revisar : h('span'), sig ? btn('Seguir: ' + sig[1], { kind:'action', icon:'arrowRight', onClick: () => irA(sig[0]) }) : null));
  } else if(st.paso === 'practica'){
    cuerpo = h('div', { class:'stack', style:'--g:16px' }, ct.reglas ? simuladorReglas(mid, ct.reglas) : null, ct.escenarios ? escenarios(mid, ct.escenarios) : null,
      ct.practica ? h('div', { class:'row end' }, btn('Seguir: rinde la práctica', { kind:'action', icon:'arrowRight', onClick: () => irA('rinde') })) : null);
  } else {
    cuerpo = practica(mid, ct);
  }
  return page(head, stepper, cuerpo, navMod);
};

/* ---------- POSTULAR: una pantalla a la vez ----------
   Nombre → perfil → experiencia (con la ruta viva al lado) → una
   pregunta de fundamentos por pantalla → resultado y envío.
   Teclas en fundamentos: 1-4 o A-D eligen, flechas navegan. */
const PERFIL_IC = { mecanico:'wrench', electricista:'bolt', electromovilidad:'battery', otro:'user' };
const PERFIL_D = { mecanico:'Trabajas en mecánica automotriz: frenos, suspensión, trenes y diagnóstico.', electricista:'Tienes licencia SEC y experiencia en instalaciones eléctricas.', electromovilidad:'Estudiaste electromovilidad o vehículos eléctricos.', otro:'Vienes de otro oficio o recién empiezas.' };
let POST_ACTUAL = null;
document.addEventListener('keydown', ev => {
  const P = POST_ACTUAL;
  if(!P || !document.getElementById('onb-q') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
  const k = ev.key.toLowerCase();
  const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
  if(i >= 0 && k.length === 1){ ev.preventDefault(); P.elegir(i); }
  else if(k === 'arrowleft'){ P.atras(); }
  else if(k === 'arrowright' || k === 'enter'){ P.adelante(); }
});
function rutaViva(ant){
  const marcadas = new Set(mapaPreliminar(ant));
  const n = ESTACIONES.filter(c => marcadas.has(c)).length;
  const num = h('b', { class:'rv-n num' }, String(n));
  return h('div', { class:'rviva', 'aria-live':'polite' },
    h('div', { class:'row sb' }, h('span', { class:'label' }, 'Tu ruta, en vivo'), h('span', { class:'small muted num' }, n + ' de ' + ESTACIONES.length)),
    h('div', { class:'rv-head' }, num, h('span', { class:'small ink2' }, n === 1 ? 'estación de oficio para demostrar en la jornada' : 'estaciones de oficio para demostrar en la jornada')),
    h('div', { class:'rv-tiles' }, ESTACIONES.map(c => h('span', { class:'rv-t' + (marcadas.has(c) ? ' on' : ''), title: C[c].t }, h('b', { class:'mono' }, c), h('span', null, C[c].t)))),
    h('p', { class:'hint' }, 'Marcar una estación no la salta: el oficio se salta solo demostrándolo en el taller.'));
}
VIEWS.postular = function(){
  if(!cargado(['avance','params'])) return vistaCargando();
  POST_ACTUAL = null;
  const av = miAv();
  if(av.postulacion && av.postulacion.enviada){
    const ant = av.postulacion.antecedentes || {};
    const mapa = mapaPreliminar(ant);
    const niv = nivelacionPorFundamentos(av.fundamentos, params().umbralFund);
    return page(phead({ eyebrow:'Postulación enviada', eic:'checkCircle', title:'Gracias, ' + String(av.postulacion.nombre || '').split(' ')[0], lead:'Tu postulación llegó al Responsable Técnico. El siguiente paso es la jornada técnica presencial.' }),
      h('div', { class:'grid g2', style:'--g:14px' },
        h('div', { class:'card stack', style:'--g:10px', 'data-rv':'' }, h('h3', { class:'h4' }, 'Estaciones que revisarás en la jornada'), mapa.length ? h('div', { class:'stack', style:'--g:6px' }, mapa.map(c => h('div', { class:'crow' }, codeTag(c), h('span', { class:'ct' }, C[c].t), h('span')))) : h('p', { class:'small muted' }, 'Ninguna: tu ruta parte con el oficio completo.'), h('p', { class:'hint' }, 'Si demuestras una estación, esa competencia no la cursas.')),
        h('div', { class:'card stack', style:'--g:10px', 'data-rv':'' }, h('h3', { class:'h4' }, 'Nivelación sugerida'), av.fundamentos ? (niv.length ? h('div', { class:'tag-row' }, niv.map(a => badge(MOD[AREA_NIV[a]].nombre, 'info'))) : h('p', { class:'small' }, 'Por ahora, ninguna.')) : h('p', { class:'small muted' }, 'Sin prueba de fundamentos.'), h('p', { class:'hint' }, 'Solo suma módulos para que llegues con base. La jornada la confirma.'))),
      h('div', { class:'lab-cta', style:'margin-top:18px' }, h('div', { class:'stack', style:'--g:6px' }, eyebrow('Mientras esperas', 'cube'), h('h2', { class:'h3' }, 'Conoce el kit antes de la jornada.'), h('p', { class:'small ink2' }, 'Recorre el laboratorio 3D y prueba armar el kit en orden.')), linkBtn('Abrir el laboratorio', 'laboratorio', { kind:'action', arrow:true })));
  }
  const st = ui('postular', { i:0, dir:1, nombre:'', ant:{ perfil:'', anos:0, formacion:'', certificados:{}, experiencias:{} }, resp:{}, semilla: nuevaSemilla() });
  const PANT = ['tu', 'perfil', 'exp'].concat(FUNDAMENTOS.map((_, k) => 'f' + k)).concat(['fin']);
  st.i = Math.max(0, Math.min(PANT.length - 1, st.i));
  const cur = PANT[st.i];
  const ir = (d) => { const j = st.i + d; if(j < 0 || j >= PANT.length) return; st.dir = d > 0 ? 1 : -1; st.i = j; render(true); const t = $('#onb-top'); if(t && t.getBoundingClientRect().top < 0) t.scrollIntoView({ block:'start' }); };
  // barra de avance por etapas
  const etapas = [['Tú', ['tu']], ['Perfil', ['perfil']], ['Experiencia', ['exp']], ['Fundamentos', PANT.filter(x => /^f\d/.test(x))], ['Resultado', ['fin']]];
  const prog = h('div', { class:'onb-prog', id:'onb-top' },
    h('div', { class:'onb-bar', role:'progressbar', 'aria-valuemin':'0', 'aria-valuemax': String(PANT.length - 1), 'aria-valuenow': String(st.i), 'aria-label':'Avance de la postulación' }, h('i', { style:'width:' + (st.i / (PANT.length - 1) * 100).toFixed(1) + '%' })),
    h('div', { class:'onb-steps' }, etapas.map(([l, ps]) => { const idx = ps.map(p => PANT.indexOf(p)); const on = idx.includes(st.i), done = Math.max(...idx) < st.i; return h('span', { class:(on ? 'on' : '') + (done ? ' done' : '') }, done ? icon('check', 's14') : null, l); })));
  const atras = (l) => btn(l || 'Atrás', { kind:'ghost', icon:'arrowLeft', onClick: () => ir(-1) });
  let cuerpo;
  if(cur === 'tu'){
    const nom = inputEl({ maxlength:'120', value: st.nombre, placeholder:'Nombre y apellido', class:'input onb-in', autocomplete:'name' });
    const seguir = () => { if(st.nombre.trim().length < 3){ toast('Escribe tu nombre completo', 'warn'); nom.focus(); return; } ir(1); };
    nom.addEventListener('input', () => { st.nombre = nom.value; });
    nom.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); seguir(); } });
    cuerpo = h('div', { class:'onb-one' },
      h('span', { class:'onb-k' }, 'Postulación · técnico instalador'),
      h('h2', { class:'onb-h' }, '¿Cómo te llamas?'),
      h('p', { class:'body ink2' }, 'Son tres partes: de dónde vienes, qué has hecho y una prueba corta de fundamentos. Nada de esto te deja fuera: sirve para armar tu plan.'),
      field('Nombre', nom),
      h('div', { class:'onb-act' }, h('span'), btn('Seguir', { kind:'action', icon:'arrowRight', onClick: seguir })));
  } else if(cur === 'perfil'){
    const viva = h('div');
    const pintarViva = () => clear(viva).appendChild(rutaViva(st.ant));
    const cards = h('div', { class:'pf-grid', role:'radiogroup', 'aria-label':'Perfil de entrada' }, Object.keys(PERFILES).map(k => {
      const b = h('button', { type:'button', class:'pf-card', role:'radio', 'aria-checked': st.ant.perfil === k ? 'true' : 'false', 'data-tilt':'6', 'data-k':'pf-' + k },
        h('span', { class:'pf-ic' }, icon(PERFIL_IC[k], 's24')), h('b', null, PERFILES[k].l), h('span', { class:'small ink2' }, PERFIL_D[k]),
        PERFILES[k].marca.length ? h('span', { class:'pf-m' }, 'Marca ' + PERFILES[k].marca.length + ' estaciones') : h('span', { class:'pf-m mute' }, 'Sin estaciones por perfil'));
      b.addEventListener('click', () => { st.ant.perfil = k; for(const x of cards.children) x.setAttribute('aria-checked', x === b ? 'true' : 'false'); pintarViva(); });
      return b;
    }));
    pintarViva();
    cuerpo = h('div', { class:'onb-two' },
      h('div', { class:'stack', style:'--g:18px' },
        h('span', { class:'onb-k' }, 'Hola, ' + st.nombre.trim().split(' ')[0]),
        h('h2', { class:'onb-h' }, '¿De dónde vienes?'),
        cards,
        h('div', { class:'onb-act' }, atras(), btn('Seguir', { kind:'action', icon:'arrowRight', onClick: () => { if(!st.ant.perfil){ toast('Elige el perfil que más se parece al tuyo', 'warn'); return; } ir(1); } }))),
      h('aside', { class:'onb-side' }, viva));
  } else if(cur === 'exp'){
    const a = st.ant;
    const viva = h('div');
    const pintarViva = () => clear(viva).appendChild(rutaViva(a));
    const chips = (list, key, getId, getL) => h('div', { class:'chips' }, list.map(x => {
      const id = getId(x);
      const b = h('button', { type:'button', class:'chipt', 'aria-pressed': a[key] && a[key][id] ? 'true' : 'false', 'data-k':'cx-' + id }, icon('check', 's14'), h('span', null, getL(x)));
      b.addEventListener('click', () => { a[key] = Object.assign({}, a[key] || {}); const on = !a[key][id]; if(on) a[key][id] = true; else delete a[key][id]; b.setAttribute('aria-pressed', on ? 'true' : 'false'); pintarViva(); });
      return b;
    }));
    const anos = inputEl({ type:'number', min:'0', max:'60', inputmode:'numeric', value: a.anos || 0 });
    anos.addEventListener('input', () => { a.anos = anos.value; });
    const form = inputEl({ maxlength:'140', value: a.formacion || '', placeholder:'Ej.: Técnico en mecánica automotriz' });
    form.addEventListener('input', () => { a.formacion = form.value; });
    pintarViva();
    cuerpo = h('div', { class:'onb-two' },
      h('div', { class:'stack', style:'--g:18px' },
        h('span', { class:'onb-k' }, PERFILES[a.perfil] ? PERFILES[a.perfil].l : 'Tu experiencia'),
        h('h2', { class:'onb-h' }, '¿Qué has hecho con tus manos?'),
        h('p', { class:'body ink2' }, 'Marca solo lo que de verdad hiciste. En la jornada técnica lo vas a demostrar con herramientas reales.'),
        h('div', { class:'grid g2', style:'--g:12px' }, field('Años de experiencia', anos), field('Formación', form)),
        h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Certificados'), chips(CERTIFICADOS, 'certificados', x => x.id, x => x.l)),
        h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Experiencia'), chips(EXPERIENCIAS, 'experiencias', x => x.c, x => x.l)),
        h('div', { class:'onb-act' }, atras(), btn('Seguir a la prueba', { kind:'action', icon:'arrowRight', onClick: () => ir(1) }))),
      h('aside', { class:'onb-side' }, viva));
  } else if(cur !== 'fin'){
    const k = Number(cur.slice(1)), q = FUNDAMENTOS[k], n = FUNDAMENTOS.length;
    const orden = barajar(q.o.map((_, j) => j), st.semilla + k * 7919);
    let avanzando = 0;
    const elegir = pos => {
      if(pos < 0 || pos >= orden.length) return;
      st.resp[q.id] = orden[pos];
      for(const [j, b] of Array.from(opts.children).entries()){ const on = j === pos; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
      clearTimeout(avanzando);
      avanzando = setTimeout(() => { if(document.getElementById('onb-q') && PANT[st.i] === cur) ir(1); }, Motion.quieto() ? 120 : 420);
    };
    const adelante = () => { if(st.resp[q.id] === undefined){ toast('Elige una alternativa', 'info'); return; } ir(1); };
    POST_ACTUAL = { elegir, atras: () => ir(-1), adelante };
    const opts = h('div', { class:'opts', role:'radiogroup', 'aria-label':'Alternativas' }, orden.map((j, pos) => {
      const b = h('button', { type:'button', class:'opt', role:'radio', 'aria-checked': st.resp[q.id] === j ? 'true' : 'false', 'aria-pressed': st.resp[q.id] === j ? 'true' : 'false', 'data-k':'f' + k + '-' + pos }, h('span', { class:'ol' }, 'ABCD'[pos]), h('span', null, q.o[j]));
      b.addEventListener('click', () => elegir(pos));
      return b;
    }));
    cuerpo = h('div', { class:'onb-one q', id:'onb-q' },
      h('div', { class:'row sb' }, h('span', { class:'onb-k' }, 'Fundamentos · ' + AREAS[q.area]), h('span', { class:'small muted num' }, (k + 1) + ' de ' + n)),
      h('div', { class:'onb-dots', 'aria-hidden':'true' }, FUNDAMENTOS.map((x, i) => h('i', { class:(i === k ? 'on' : '') + (st.resp[x.id] !== undefined ? ' done' : '') }))),
      h('h2', { class:'onb-h q-h' }, q.q),
      opts,
      h('div', { class:'onb-act' }, atras(k === 0 ? 'Atrás' : 'Anterior'), btn(k < n - 1 ? 'Siguiente' : 'Ver mi resultado', { kind: st.resp[q.id] === undefined ? 'ghost' : 'action', icon:'arrowRight', onClick: adelante })),
      h('p', { class:'hint' }, k === 0 ? 'No te deja fuera ni te salta nada: solo dice si te conviene una nivelación antes de empezar. Atajos: 1 a 4 para elegir.' : 'Al elegir, pasas a la siguiente. Puedes volver con la flecha izquierda.'));
  } else {
    const faltan = FUNDAMENTOS.filter(q => st.resp[q.id] === undefined);
    if(faltan.length){ st.i = PANT.indexOf('f' + FUNDAMENTOS.indexOf(faltan[0])); setTimeout(() => { render(true); toast('Te falta responder ' + (faltan.length === 1 ? 'una pregunta' : faltan.length + ' preguntas'), 'info'); }, 0); return page(prog); }
    const p = puntajeFundamentos(st.resp);
    const umbral = params().umbralFund;
    const mapa = mapaPreliminar(st.ant);
    const niv = Object.keys(p).filter(a => p[a].ok < umbral);
    const nEst = h('b', { class:'num' }, '0'), nNiv = h('b', { class:'num' }, '0'), nOk = h('b', { class:'num' }, '0');
    const totOk = Object.values(p).reduce((s0, v) => s0 + v.ok, 0);
    setTimeout(() => { Motion.contar(nEst, mapa.length, 900); Motion.contar(nNiv, niv.length, 700); Motion.contar(nOk, totOk, 900); }, 120);
    const env = btn('Enviar postulación', { kind:'action', size:'lg', icon:'upload' });
    env.addEventListener('click', () => busy(env, async () => { await guardarFundamentosPropios(st.resp); await enviarPostulacion(st.nombre, st.ant); toast('Postulación enviada'); }));
    const set = new Set(mapa);
    cuerpo = h('div', { class:'onb-fin' },
      h('div', { class:'fin-hero' }, h('span', { class:'onb-k' }, 'Tu punto de partida'), h('h2', { class:'onb-h' }, st.nombre.trim().split(' ')[0] + ', así parte tu ruta.')),
      h('div', { class:'fin-stats' },
        h('div', { class:'fin-s' }, nEst, h('span', null, 'estaciones de oficio para demostrar en la jornada')),
        h('div', { class:'fin-s' }, nNiv, h('span', null, niv.length === 1 ? 'módulo de nivelación sugerido' : 'módulos de nivelación sugeridos')),
        h('div', { class:'fin-s' }, nOk, h('span', null, 'de ' + FUNDAMENTOS.length + ' respuestas correctas en fundamentos'))),
      h('div', { class:'grid g2', style:'--g:14px' },
        h('div', { class:'card stack', style:'--g:12px' }, h('h3', { class:'h4' }, 'Fundamentos por área'),
          Object.entries(p).map(([a, v]) => h('div', { class:'fbar' + (v.ok < umbral ? ' low' : '') },
            h('div', { class:'row sb small' }, h('span', null, AREAS[a]), h('b', { class:'num' }, v.ok + ' de ' + v.total)),
            h('div', { class:'fb' }, h('i', { style:'width:' + (v.total ? v.ok / v.total * 100 : 0) + '%' }), h('em', { style:'left:' + (v.total ? umbral / v.total * 100 : 0) + '%', title:'Umbral' })),
            v.ok < umbral ? h('span', { class:'hint' }, 'Te sugerimos ' + MOD[AREA_NIV[a]].nombre.toLowerCase() + '.') : null))),
        h('div', { class:'card stack', style:'--g:12px' }, h('h3', { class:'h4' }, 'Tus 39 competencias'),
          h('div', { class:'cmap', 'data-stagger':'14' }, [1,2,3,4].map(n => h('div', { class:'cmap-row' }, h('span', { class:'cmap-lv' }, 'N' + n), h('div', { class:'cmap-tiles' }, COMP.filter(x => x.n === n).map(x => { const t = tile(x.c, set.has(x.c) ? 'mk' : ''); t.setAttribute('data-st', ''); return t; }))))),
          h('div', { class:'cmap-legend' }, h('span', null, h('i', { class:'tile core' }), 'Core'), h('span', null, h('i', { class:'tile oficio' }), 'Oficio'), h('span', null, h('i', { class:'tile oficio mk' }), 'Para demostrar en la jornada')))),
      notice('info', 'info', h('b', null, 'Esto todavía no es tu plan. '), 'Lo online solo suma nivelación. El oficio se salta demostrándolo en la jornada técnica, y el nivel se gana en el taller.'),
      h('div', { class:'onb-act' }, atras('Revisar respuestas'), h('span', { 'data-mag':'0.2' }, env)));
  }
  const anim = st.anim !== cur; st.anim = cur;
  const scr = h('div', { class:'onb-scr' + (anim ? (st.dir > 0 ? ' fwd' : ' back') : ''), 'data-k':'scr-' + cur }, cuerpo);
  return h('div', { class:'wrap page onb' }, prog, scr);
};
