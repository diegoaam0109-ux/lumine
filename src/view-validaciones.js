/* =====================================================================
   Vistas: Validaciones, pauta de una sesión, kiosco externo y agenda
   ===================================================================== */
'use strict';

/* ---------- hoja: programar validación ---------- */
function evaluadoresInternos(){
  const g = gestion();
  const out = [];
  for(const uid of Object.keys(g.equipo)){ const r = g.equipo[uid].rol; if(r === 'rt' || r === 'admin' || r === 'formador') out.push({ uid, rol:r }); }
  if(S.me.id && !out.some(x => x.uid === S.me.id) && S.role === 'admin') out.unshift({ uid:S.me.id, rol: miRol() || 'admin' });
  return out;
}
function hojaNuevaSesion(pidFijo, tipoFijo){
  const cand = personas().filter(p => tiposPosibles(p).length);
  if(!cand.length){ toast('No hay personas con una validación pendiente', 'info'); return; }
  const st = { pid: pidFijo && persona(pidFijo) ? pidFijo : cand[0].id, tipo: tipoFijo || null, fecha: S.hoy, asig:{}, override:'' };
  openSheet('Programar validación', close => {
    const box = h('div', { class:'stack', style:'--g:16px' });
    const pintar = () => {
      clear(box);
      const p = persona(st.pid);
      const tipos = tiposPosibles(p).filter(t => !sesionAbiertaDe(p.id, t));
      if(!tipos.includes(st.tipo)) st.tipo = tipos[0] || null;
      const selP = selectEl(cand.map(x => [x.id, x.nombre + ' · ' + (x.etapa === 'postulante' ? 'postulante' : nivelNombre(x.nivel || 0))]), st.pid);
      selP.addEventListener('change', () => { st.pid = selP.value; st.tipo = null; st.asig = {}; pintar(); });
      box.appendChild(field('Persona', selP));
      if(!st.tipo){ box.appendChild(notice('info', 'info', p.nombre + ' ya tiene abiertas todas las validaciones que le corresponden.')); return; }
      const selT = selectEl(tipos.map(t => [t, TIPOS_SESION[t].l + ' · ' + TIPOS_SESION[t].c]), st.tipo);
      selT.addEventListener('change', () => { st.tipo = selT.value; st.asig = {}; pintar(); });
      const fecha = inputEl({ type:'date', value: st.fecha, min: S.hoy });
      fecha.addEventListener('change', () => { if(parseISO(fecha.value)) st.fecha = fecha.value; });
      box.appendChild(h('div', { class:'grid g2', style:'--g:12px' }, field('Validación', selT), field('Fecha', fecha)));
      const codes = itemsParaNueva(p, st.tipo);
      const pre = preaprobadas(st.tipo, p);
      if(st.tipo !== 'JT' && !codes.length){ box.appendChild(notice('ok', 'check', 'No quedan competencias pendientes en este nivel.')); return; }
      // D8: la práctica online da derecho a presentarse
      let necesitaMotivo = false;
      if(/^N[1-4]$/.test(st.tipo)){
        const lp = listoAdmin(p, Number(st.tipo.slice(1)));
        if(lp.listo === false){ necesitaMotivo = true; box.appendChild(notice('warn', 'alert', h('b', null, 'Sin derecho a presentarse todavía. '), lp.txt + ' La práctica online da derecho a presentarse (D8).')); }
        else if(lp.listo === null) box.appendChild(notice('', 'info', lp.txt));
        else box.appendChild(notice('ok', 'check', lp.txt));
        if(Object.values(p.historial || {}).some(x => x.tipo === st.tipo)) box.appendChild(notice('info', 'refresh', 'Segundo intento o posterior: entra solo lo reprobado (regla de avance 1).'));
      }
      if(st.tipo === 'JT') box.appendChild(notice('info', 'info', 'Entran las estaciones que marcó su mapa preliminar, más la revisión de base en herramientas e instrumentos.'));
      const evs = evaluadoresInternos();
      const filas = codes.map(c => {
        const ev = evaluadorDe(c);
        let quien;
        if(ev === 'ext') quien = h('span', { class:'evtag ext' }, icon('shieldCheck', 's14'), 'Externa · banco genérico');
        else if(ev === 'ic') quien = h('span', { class:'evtag' }, icon('bolt', 's14'), 'Ingeniería de Calibración');
        else {
          const opts = [['', 'Quien valide (RT o administración)']].concat(evs.map(x => [x.uid, nombreUid(x.uid) + ' · ' + ROL_L[x.rol]]));
          quien = selectEl(opts, st.asig[c] || '', { 'aria-label':'Evaluador de ' + c, style:'min-height:34px;padding:5px 30px 5px 10px;font-size:13px;max-width:260px' });
          quien.addEventListener('change', () => {
            const v = quien.value;
            if(v){ const chk = puedeValidar(v, rolEquipo(v), p, Pmap(), duos(), personas(), c); if(!chk.ok){ toast(chk.motivo, 'warn'); quien.value = st.asig[c] || ''; return; } st.asig[c] = v; } else delete st.asig[c];
          });
        }
        return h('div', { class:'crow' }, codeTag(c), h('span', { class:'ct' }, C[c].t), quien);
      });
      box.appendChild(h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, codes.length + (st.tipo === 'JT' ? ' estaciones' : ' competencias a evaluar') + (pre.length ? ' · ' + pre.length + ' ya aprobadas o demostradas' : '')), filas));
      let motivo = null;
      if(necesitaMotivo){ motivo = h('textarea', { class:'textarea', maxlength:'300', placeholder:'Por qué se programa sin práctica completa' }); box.appendChild(field('Motivo (obligatorio para programar igual)', motivo)); }
      const ok = btn('Programar', { kind:'action', icon:'calendar' });
      ok.addEventListener('click', () => busy(ok, async () => {
        const ov = motivo ? motivo.value.trim() : '';
        if(necesitaMotivo && !motivoValido(ov)) throw new Error('Escribe el motivo para programar sin práctica completa (mínimo 5 caracteres)');
        const id = await crearSesion({ pid: st.pid, tipo: st.tipo, fecha: st.fecha, codes, asig: st.asig, override: ov || null });
        toast('Validación programada'); close(); go('sesion-' + id);
      }));
      box.appendChild(h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), ok));
    };
    pintar();
    return box;
  }, { wide:true });
}

/* ---------- VALIDACIONES ---------- */
/* ---------- calendario mensual de validaciones ---------- */
const TIPO_COLOR = { JT:'jt', N1:'n', N2:'n', N3:'n', N4:'n', REV:'rev' };
function calendarioValidaciones(all){
  const mesBase = ui('cal-mes', S.hoy.slice(0, 7));
  const [y, m] = mesBase.split('-').map(Number);
  const primero = new Date(y, m - 1, 1);
  const dias = new Date(y, m, 0).getDate();
  const offset = (primero.getDay() + 6) % 7; // lunes primero
  const delMes = all.filter(x => x.fecha && x.fecha.slice(0, 7) === mesBase).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const porDia = {}; for(const x of delMes) (porDia[x.fecha] = porDia[x.fecha] || []).push(x);
  const mover = d => { const nd = new Date(y, m - 1 + d, 1); UI['cal-mes'] = nd.getFullYear() + '-' + pad2(nd.getMonth() + 1); render(true); };
  const celdas = [];
  for(let i = 0; i < offset; i++) celdas.push(h('div', { class:'cal-d vacio', 'aria-hidden':'true' }));
  for(let d = 1; d <= dias; d++){
    const f = mesBase + '-' + pad2(d), xs = porDia[f] || [];
    celdas.push(h('div', { class:'cal-d' + (f === S.hoy ? ' hoy' : '') + (xs.length ? ' con' : ''), role:'gridcell', 'aria-label': fechaLarga(f) + (xs.length ? ': ' + xs.length + ' validaciones' : '') },
      h('span', { class:'cal-num' }, String(d)),
      xs.map(x => h('a', { class:'cal-ev ' + (TIPO_COLOR[x.tipo] || 'n') + (x.estado !== 'abierta' ? ' cerrada' : ''), href:'#sesion-' + x.id, title: TIPOS_SESION[x.tipo].l + ' · ' + nombreP(x.pid) }, h('span', null, x.tipo + ' · ' + nombreP(x.pid).split(' ')[0])))));
  }
  const mesL = MESES[m - 1].replace(/^./, c => c.toUpperCase()) + ' ' + y;
  return h('div', { class:'stack', style:'--g:14px' },
    h('div', { class:'row sb' }, h('h2', { class:'h3' }, mesL),
      h('div', { class:'row', style:'gap:6px' }, btn('', { kind:'ghost', size:'sm', icon:'arrowLeft', cls:'icon', aria:'Mes anterior', onClick: () => mover(-1) }), btn('Hoy', { kind:'ghost', size:'sm', onClick: () => { UI['cal-mes'] = S.hoy.slice(0, 7); render(true); } }), btn('', { kind:'ghost', size:'sm', icon:'arrowRight', cls:'icon', aria:'Mes siguiente', onClick: () => mover(1) }))),
    h('div', { class:'cal', role:'grid', 'aria-label':'Calendario de ' + mesL },
      ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => h('div', { class:'cal-dow', role:'columnheader' }, d)), celdas),
    h('div', { class:'cmap-legend' }, h('span', null, h('i', { class:'cal-key jt' }), 'Jornada técnica'), h('span', null, h('i', { class:'cal-key n' }), 'Validación de nivel'), h('span', null, h('i', { class:'cal-key rev' }), 'Revalidación'), h('span', null, h('i', { class:'cal-key cerrada' }), 'Cerrada')),
    delMes.length ? h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Este mes'), delMes.map(x => x.estado === 'abierta' ? sesionItem(x) : h('a', { class:'card link', href:'#sesion-' + x.id, style:'--pad:12px 14px' }, h('div', { class:'row sb' }, h('span', { class:'small' }, h('b', null, TIPOS_SESION[x.tipo].l), ' · ' + nombreP(x.pid) + ' · ' + fechaCorta(x.fecha)), badge(x.estado === 'anulada' ? 'Anulada' : 'Cerrada', 'line'))))) : emptyState('calendar', 'Sin validaciones este mes', null, btn('Programar validación', { kind:'ghost', size:'sm', icon:'plus', onClick: () => hojaNuevaSesion() })));
}
VIEWS.validaciones = function(){
  if(sinDatos(['personas','sesiones'])) return vistaCargando();
  const tab = ui('val-tab', 'calendario');
  const all = sesiones();
  const ab = all.filter(x => x.estado === 'abierta').sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const ce = all.filter(x => x.estado !== 'abierta');
  const lista = tab === 'abiertas' ? ab : ce;
  return page(
    phead({ eyebrow:'Validaciones presenciales', eic:'clipboard', title:'Validaciones', lead:'Jornadas técnicas, niveles y revalidaciones. Sabe o no sabe, por competencia.',
      actions:[ btn('Modo evaluador externo', { kind:'ghost', icon:'shieldCheck', onClick: () => abrirKiosco() }), btn('Programar validación', { kind:'action', icon:'plus', onClick: () => hojaNuevaSesion() }) ] }),
    tabs([{ v:'calendario', l:'Calendario' }, { v:'abiertas', l:'Abiertas', n: ab.length }, { v:'cerradas', l:'Cerradas y anuladas', n: ce.length }], tab, v => { UI['val-tab'] = v; render(true); }),
    tab === 'calendario' ? calendarioValidaciones(all) : lista.length ? (tab === 'abiertas' ? h('div', { class:'grid g2', style:'--g:12px' }, lista.map(sesionItem))
      : h('div', { class:'tscroll' }, h('table', { class:'t' }, h('thead', null, h('tr', null, h('th', null, 'Validación'), h('th', null, 'Persona'), h('th', null, 'Fecha'), h('th', null, 'Resultado'))),
        h('tbody', null, lista.map(x => { const tr = h('tr', { class:'click', tabindex:'0' }, h('td', null, TIPOS_SESION[x.tipo].l + (x.intento > 1 ? ' · intento ' + x.intento : '')), h('td', null, nombreP(x.pid)), h('td', null, fechaCorta(x.fecha)),
          h('td', null, x.estado === 'anulada' ? badge('Anulada', 'line') : x.tipo === 'JT' ? badge(((x.resultado && x.resultado.demostradas) || []).length + ' demostradas', 'info') : badge(x.resultado && x.resultado.aprobado ? 'Aprobada' : 'Reprobada', x.resultado && x.resultado.aprobado ? 'ok' : 'crit')));
          tr.addEventListener('click', () => go('sesion-' + x.id)); tr.addEventListener('keydown', e => { if(e.key === 'Enter') go('sesion-' + x.id); }); return tr; })))))
      : emptyState('clipboard', tab === 'abiertas' ? 'Sin validaciones abiertas' : 'Sin historial todavía', null));
};

/* ---------- PAUTA DE UNA SESIÓN ---------- */
function ynBtns(cur, onSet, disabled, k){
  const g = h('div', { class:'yn', role:'group' });
  const mk = (v, l, ic) => { const b = h('button', { type:'button', class:v, 'aria-pressed': cur === v ? 'true' : 'false', disabled: disabled || null, 'data-k': k + '-' + v }, icon(ic, 's14'), l); b.addEventListener('click', () => onSet(cur === v ? null : v, b)); return b; };
  g.appendChild(mk('s', 'Sabe', 'check')); g.appendChild(mk('n', 'No sabe', 'x'));
  return g;
}
VIEWS.sesion = function(sid){
  if(sinDatos(['personas','sesiones','duos','marcas','agenda'])) return vistaCargando();
  const ses = S.D.sesiones[sid];
  if(!ses) return page(phead({ back:['validaciones','Validaciones'], title:'Validación no encontrada' }));
  const p = persona(ses.pid);
  const abierta = ses.estado === 'abierta';
  const rs = resumenSesion(ses);
  const recib = abierta ? recibidasSinAceptar(ses, S.D.marcas, S.D.agenda) : [];
  resolverPerfiles(Object.values(ses.items).map(i => i.asig).filter(Boolean));
  const codes = Object.keys(ses.items).sort();
  const grupos = [['ext', 'Parte externa · banco genérico'], ['ic', 'Ingeniería de Calibración'], ['int', 'Parte interna']].map(([ev, l]) => [l, codes.filter(c => ses.items[c].ev === ev), ev]).filter(g => g[1].length);
  const filas = grupos.map(([l, cs, ev]) => h('div', { class:'stack', style:'--g:8px' },
    h('div', { class:'row sb' }, h('span', { class:'label' }, l), ev === 'ext' && abierta ? (ses.externa && ses.externa.entregada ? btn('Reabrir externa', { kind:'quiet', size:'sm', icon:'refresh', onClick: async () => { const r = await dialog({ title:'Reabrir la evaluación externa', icon:'refresh', confirm:'Reabrir', body:'El evaluador externo podrá volver a marcar en el kiosco.', motivo:{ label:'Motivo', required:true } }); if(r){ try { await reabrirExterna(sid, r.motivo); toast('Evaluación externa reabierta'); } catch(e){ toast(errMsg(e), 'crit'); } } } }) : btn('Abrir kiosco', { kind:'ghost', size:'sm', icon:'tablet', onClick: () => abrirKiosco(sid) })) : null),
    h('div', { class:'pauta' }, cs.map(c => {
      const it = ses.items[c];
      const chk = abierta ? puedeMarcar(ses, c, 'admin') : { ok:false };
      let estadoQuien;
      if(it.r && it.por) estadoQuien = it.por.tipo === 'ext' ? 'Marcó: ' + (it.por.nombre || 'evaluador externo') + (it.por.institucion ? ' (' + it.por.institucion + ')' : '') : 'Marcó: ' + nombreUid(it.por.uid) + (it.por.tipo === 'formador' ? ' (formador)' : '');
      else if(it.asig) estadoQuien = 'Asignado a ' + nombreUid(it.asig);
      else estadoQuien = ev === 'ext' ? 'Lo marca el evaluador externo' : ev === 'ic' ? 'Lo marca Ingeniería de Calibración' : 'Lo marca quien valide';
      const set = (v, b) => busy(b, async () => { await marcarItem(sid, c, v, 'admin'); });
      return h('div', { class:'prow' }, h('div', { class:'pt' }, codeTag(c), h('div', null, h('div', { class:'txt' }, C[c].t), h('div', { class:'meta' }, critTag(C[c].k), h('span', { class:'hint' }, estadoQuien)))),
        abierta ? (chk.ok ? ynBtns(it.r, set, false, 'yn-' + c) : h('div', { class:'stack', style:'--g:4px;align-items:flex-end' }, it.r ? badge(it.r === 's' ? 'Sabe' : 'No sabe', it.r === 's' ? 'ok' : 'crit') : badge('Pendiente', 'line'), h('span', { class:'hint', style:'text-align:right;max-width:200px' }, chk.motivo)))
          : badge(it.r === 's' ? 'Sabe' : it.r === 'n' ? 'No sabe' : 'Sin marcar', it.r === 's' ? 'ok' : it.r === 'n' ? 'crit' : 'line'));
    }))));
  let basico = null;
  if(ses.tipo === 'JT'){
    const chkB = abierta ? puedeValidar(S.me.id, miRol(), p, Pmap(), duos(), personas()) : { ok:false };
    basico = h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Base: manejo real de herramientas e instrumentos'),
      h('div', { class:'pauta' }, Object.keys(AREAS).map(ar => {
        const cur = (ses.basico || {})[ar];
        const g = h('div', { class:'yn', role:'group' });
        const mk = (v, l) => { const b = h('button', { type:'button', class: v === 'ok' ? 's' : 'n', 'aria-pressed': cur === v ? 'true' : 'false', disabled: !abierta || !chkB.ok ? true : null, 'data-k':'b-' + ar + v }, l); b.addEventListener('click', () => busy(b, () => marcarBasico(sid, ar, cur === v ? null : v))); return b; };
        g.appendChild(mk('ok', 'Bien')); g.appendChild(mk('nivelar', 'Nivelar'));
        return h('div', { class:'prow' }, h('div', { class:'pt' }, h('div', null, h('div', { class:'txt' }, AREAS[ar]), h('div', { class:'meta' }, h('span', { class:'hint' }, 'Si no maneja la base, se suma ' + MOD[AREA_NIV[ar]].nombre.toLowerCase())))), g);
      })));
  }
  const pct = rs.total ? Math.round(100 * rs.marcados / rs.total) : 0;
  let verdict = null;
  if(ses.tipo !== 'JT' && rs.ev){
    const ev = rs.ev;
    verdict = h('div', { class:'verdict ' + (!ev.completo ? '' : ev.aprobado ? 'ok' : 'crit') }, h('span', { class:'vi' }, icon(!ev.completo ? 'clock' : ev.aprobado ? 'check' : 'refresh', 's20')),
      h('div', null, h('b', null, !ev.completo ? 'Faltan ítems por marcar' : ev.aprobado ? 'Aprueba el nivel' : 'Reprueba: repite ' + ev.fallidas.join(', ')),
        h('div', { class:'small ink2' }, 'Seguridad y producto ' + ev.crit.ok + ' de ' + ev.crit.total + ' (exige todas) · complementarias ' + ev.comp.ok + ' de ' + ev.comp.total + ' (exige ' + ev.comp.req + ', umbral ' + params().umbralComp + '%). Cuenta lo aprobado antes y lo demostrado en la jornada.')));
  } else if(ses.tipo === 'JT'){
    const dem = codes.filter(c => ses.items[c].r === 's').length;
    verdict = h('div', { class:'verdict' }, h('span', { class:'vi' }, icon('route', 's20')), h('div', null, h('b', null, dem + ' de ' + codes.length + ' estaciones demostradas hasta ahora'), h('div', { class:'small ink2' }, 'Lo demostrado se salta. Lo demás lo cursa. La jornada no se aprueba ni se reprueba: arma el plan.')));
  }
  const cerrar = btn('Cerrar validación', { kind:'owner', icon:'check', disabled: !rs.completo || null });
  cerrar.addEventListener('click', async () => {
    const r = await dialog({ title:'Cerrar ' + TIPOS_SESION[ses.tipo].l.toLowerCase(), icon:'clipboard', confirm:'Cerrar y aplicar', body:'El resultado se aplica al expediente de ' + p.nombre + ' y queda en la bitácora. Después no se puede editar.' });
    if(!r) return;
    await busy(cerrar, async () => { const out = await cerrarSesion(sid); toast(out.msg, out.resultado.aprobado === false ? 'warn' : 'ok'); });
  });
  const anular = btn('Anular', { kind:'danger', size:'sm', onClick: async () => { const r = await dialog({ title:'Anular validación', danger:true, icon:'x', confirm:'Anular', body:'No se aplica ningún resultado. Queda registrada con el motivo.', motivo:{ label:'Motivo', required:true } }); if(r){ try { await anularSesion(sid, r.motivo); toast('Validación anulada'); } catch(e){ toast(errMsg(e), 'crit'); } } } });
  return page(
    phead({ back:['validaciones','Validaciones'], eyebrow: TIPOS_SESION[ses.tipo].c + (ses.intento > 1 ? ' · intento ' + ses.intento : ''), eic:'clipboard', title: TIPOS_SESION[ses.tipo].l + ' · ' + (p ? p.nombre : '?'),
      lead: (abierta ? 'Programada para el ' : 'Del ') + fechaLarga(ses.fecha) + '. ' + (ses.estado === 'anulada' ? 'Anulada: ' + (ses.motivoAnula || '') : ''),
      actions: abierta ? [anular, cerrar] : [linkBtn('Ver expediente', 'persona-' + ses.pid)] }),
    ses.override ? notice('warn', 'alert', h('b', null, 'Programada sin práctica completa. '), 'Motivo: ' + ses.override) : null,
    ses.externa && ses.externa.entregada ? notice('ok', 'shieldCheck', h('b', null, 'Evaluación externa entregada. '), (ses.externa.nombre || '') + (ses.externa.institucion ? ' (' + ses.externa.institucion + ')' : '') + ' · ' + fechaHora(ses.externa.entregada)) : null,
    recib.length ? h('div', { class:'stack', style:'--g:8px;margin-bottom:16px' }, recib.map(rc => h('div', { class:'alert info' }, h('span', { class:'ai' }, icon('download', 's20')),
      h('div', null, h('div', { class:'at' }, nombreUid(rc.uid) + ' envió ' + rc.cods.length + ' resultado' + (rc.cods.length > 1 ? 's' : '')), h('div', { class:'ad' }, rc.cods.map(c => c + ': ' + (S.D.marcas[rc.uid].sesiones[sid].items[c] === 's' ? 'sabe' : 'no sabe')).join(' · ') + (rc.obs ? ' · “' + rc.obs + '”' : ''))),
      h('div', { class:'aa' }, btn('Aceptar', { kind:'action', size:'sm', onClick: ev => busy(ev.currentTarget, async () => { await aceptarMarcas(sid, rc.uid); toast('Resultados aceptados'); }) }))))) : null,
    h('div', { class:'card', style:'--pad:16px;margin-bottom:18px' }, h('div', { class:'row sb', style:'margin-bottom:8px' }, h('span', { class:'label' }, 'Avance de la pauta'), h('span', { class:'small num muted' }, rs.marcados + ' de ' + rs.total)), h('div', { class:'progress' }, h('i', { style:'width:' + pct + '%' }))),
    h('div', { class:'stack', style:'--g:20px' }, basico, filas, verdict,
      abierta ? h('p', { class:'hint' }, 'Nadie valida a su compañero de duo: la plataforma bloquea la marca. Lo externo solo se marca en el kiosco, en banco genérico.') : null));
};

/* ---------- KIOSCO DEL EVALUADOR EXTERNO ----------
   Corre en un equipo de Lumine con la sesión de administración abierta, así que:
   1) al abrirlo se define un PIN y la navegación queda encerrada en #kiosco;
   2) el evaluador avanza en tres pasos: identificarse, marcar, revisar y entregar;
   3) al entregar, sus marcas quedan cerradas (solo el Responsable Técnico reabre). */
function pinInput(ph){ return inputEl({ type:'password', inputmode:'numeric', autocomplete:'off', maxlength:'8', placeholder: ph || 'PIN de 4 a 8 dígitos', style:'max-width:220px;letter-spacing:.3em' }); }
async function abrirKiosco(sid){
  if(S.kiosk || kioscoBloqueado()){ go('kiosco' + (sid ? '-' + sid : '')); return; }
  const a = pinInput(), b = pinInput('Repite el PIN');
  const body = h('div', { class:'stack', style:'--g:12px' },
    h('p', { class:'body', style:'font-size:15px' }, 'Vas a entregar este equipo al evaluador externo. Mientras el kiosco esté activo no se puede ir a otra sección, ni cambiando la dirección. Para salir se pide este PIN.'),
    field('PIN', a), field('Confirmar PIN', b),
    S.build === 'demo' ? h('p', { class:'hint' }, 'En la demostración puedes usar 1234.') : h('p', { class:'hint' }, 'Si se olvida el PIN, cerrar la pestaña termina el kiosco.'));
  const r = await dialog({ title:'Activar modo kiosco', icon:'lock', confirm:'Activar y entregar el equipo', body });
  if(!r) return;
  if(!/^\d{4,8}$/.test(a.value)){ toast('El PIN debe tener entre 4 y 8 dígitos', 'warn'); return; }
  if(a.value !== b.value){ toast('Los PIN no coinciden', 'warn'); return; }
  activarKiosco(a.value, sid);
  go('kiosco' + (sid ? '-' + sid : ''));
}
async function salirKiosco(){
  if(S.build === 'demo' && S.kiosk){
    const r = await dialog({ title:'Salir del modo kiosco', body:'Vuelves a la vista del Responsable Técnico.', confirm:'Salir', icon:'logout' });
    if(r){ desactivarKiosco(); cambiarRolDemo('rt'); }
    return;
  }
  if(!kioscoBloqueado()){ go('validaciones'); return; }
  const pin = pinInput('PIN del Responsable Técnico');
  const r = await dialog({ title:'Salir del modo kiosco', icon:'lock', confirm:'Salir', body: h('div', { class:'stack', style:'--g:12px' }, h('p', { class:'body', style:'font-size:15px' }, 'Solo el Responsable Técnico sale del kiosco. Lo marcado ya quedó guardado.'), field('PIN', pin)) });
  if(!r) return;
  if(!pinKioscoOk(pin.value)){ toast('PIN incorrecto', 'crit'); return; }
  desactivarKiosco();
  toast('Kiosco cerrado');
  go('validaciones');
}
function extDe(ses){ return Object.keys(ses.items || {}).filter(c => ses.items[c].ev === 'ext').sort(); }
VIEWS.kiosco = function(arg){
  if(sinDatos(['personas','sesiones'])) return vistaCargando();
  // El paso va en la dirección (kiosco-<sesión>-p2): así el botón Atrás del navegador o del teléfono
  // retrocede un paso dentro del kiosco en vez de quedarse pegado.
  let sid = arg, pasoUrl = null;
  const mm = /^(.*)-p([123])$/.exec(arg || '');
  if(mm){ sid = mm[1]; pasoUrl = Number(mm[2]); }
  const salir = h('button', { type:'button', class:'btn btn-ghost sm', title:'Solo el Responsable Técnico sale del kiosco, con el PIN que fijó al entregarlo' }, icon('lock', 's16'), 'Salir del kiosco');
  salir.addEventListener('click', salirKiosco);
  const head = h('div', { class:'kh' }, h('div', { class:'kbrand' }, h('span', { class:'emblem' }), h('div', null, h('div', { class:'lw-eyebrow' }, 'Evaluación externa'), h('div', { class:'lw-muted small' }, 'Banco genérico · Lumine Habilita'))), salir);
  const wrap = body => h('div', { class:'kiosk lw' }, h('div', { class:'kin' }, head, body));
  // Un administrador que llega sin activar el kiosco primero lo activa (PIN)
  if(!S.kiosk && !kioscoBloqueado()){
    return wrap(frag(h('h1', null, 'Modo kiosco inactivo'),
      h('p', { class:'lw-muted' }, 'Activa el kiosco antes de entregar el equipo. Así el evaluador externo solo ve las estaciones de banco genérico.'),
      h('div', { class:'row' }, btn('Activar kiosco', { kind:'action', size:'lg', icon:'lock', onClick: () => abrirKiosco(sid) }), btn('Volver a validaciones', { kind:'ghost', onClick: () => go('validaciones') }))));
  }
  const ses = sid ? S.D.sesiones[sid] : null;
  if(!ses || ses.estado !== 'abierta' || !extDe(ses).length){
    const abiertas = sesiones().filter(x => x.estado === 'abierta' && extDe(x).length);
    return wrap(frag(h('h1', null, '¿A quién evalúas hoy?'),
      h('p', { class:'lw-muted' }, 'Elige la sesión. Solo verás las estaciones de banco genérico que te corresponden.'),
      abiertas.length ? h('div', { class:'stack', style:'--g:10px' }, abiertas.map(x => {
        const ext = extDe(x), m = ext.filter(c => x.items[c].r).length, ent = x.externa && x.externa.entregada;
        const b = h('button', { type:'button', class:'kcard kpick', disabled: ent ? true : null },
          h('div', { class:'row sb' }, h('b', null, nombreP(x.pid)), h('span', { class:'badge' + (ent ? ' ok' : '') }, ent ? 'Entregada' : m + ' de ' + ext.length)),
          h('div', { class:'lw-muted small' }, TIPOS_SESION[x.tipo].l + ' · ' + fechaCorta(x.fecha)));
        if(!ent) b.addEventListener('click', () => go('kiosco-' + x.id));
        return b; })) : h('div', { class:'kcard lw-muted' }, 'No hay estaciones externas pendientes.')));
  }
  const ext = extDe(ses);
  const ent = ses.externa && ses.externa.entregada;
  if(ent){
    return wrap(frag(h('div', { class:'kdone' }, h('span', { class:'kdone-ic' }, icon('checkCircle', 's32')), h('h1', null, 'Evaluación entregada'),
      h('p', { class:'lw-muted' }, 'Gracias, ' + (ses.externa.nombre || '') + '. Marcaste ' + ext.length + ' estaciones de ' + nombreP(ses.pid) + '. El Responsable Técnico cierra la validación.'),
      h('p', { class:'lw-muted small' }, 'Tus marcas quedaron cerradas. Si hay que corregir algo, avísale al Responsable Técnico.')),
      h('div', { class:'row', style:'justify-content:center' }, btn('Evaluar otra sesión', { kind:'ghost', onClick: () => go('kiosco') }))));
  }
  const st = ui('kiosco-' + sid, { paso:1, nombre:'', inst:'', acepta:false });
  const listos = ext.filter(c => ses.items[c].r).length;
  // se calcula al momento (no al dibujar): el nombre se escribe después de dibujar la pantalla
  const pasoMax = () => { const s2 = S.D.sesiones[sid]; const l2 = s2 ? ext.filter(c => s2.items[c] && s2.items[c].r).length : 0; return !(st.nombre.trim().length >= 3 && st.acepta) ? 1 : l2 < ext.length ? 2 : 3; };
  const maxPaso = pasoMax();
  const irPaso = k => { const d = Math.min(k, pasoMax()); go('kiosco-' + sid + (d > 1 ? '-p' + d : '')); };
  if(pasoUrl){ if(pasoUrl > maxPaso){ location.replace('#kiosco-' + sid + (maxPaso > 1 ? '-p' + maxPaso : '')); return vistaCargando(); } st.paso = pasoUrl; }
  else st.paso = 1;
  const pasos = h('ol', { class:'ksteps', 'aria-label':'Pasos' }, [['Identifícate', 1], ['Marca', 2], ['Revisa y entrega', 3]].map(([l, k]) => {
    const puede = k <= maxPaso && k !== st.paso;
    const b = h('button', { type:'button', class:'kstep', disabled: puede ? null : true, 'aria-current': st.paso === k ? 'step' : null }, h('i', null, st.paso > k ? '✓' : String(k)), l);
    if(puede) b.addEventListener('click', () => irPaso(k));
    return h('li', { class: st.paso === k ? 'on' : st.paso > k ? 'done' : '' }, b);
  }));
  const volverLista = h('button', { type:'button', class:'linkbtn kback' }, icon('arrowLeft', 's16'), 'Elegir otra persona');
  volverLista.addEventListener('click', () => go('kiosco'));
  const titulo = h('div', null, h('h1', null, nombreP(ses.pid)), h('p', { class:'lw-muted' }, TIPOS_SESION[ses.tipo].l + ' · ' + fechaLarga(ses.fecha)));
  let cuerpo;
  if(st.paso === 1){
    const nom = inputEl({ maxlength:'80', placeholder:'Nombre y apellido', value: st.nombre, autocomplete:'name' });
    const ins = inputEl({ maxlength:'80', placeholder:'Organismo o empresa', value: st.inst });
    const chk = h('input', { type:'checkbox', checked: st.acepta || null });
    nom.addEventListener('input', () => { st.nombre = nom.value; }); ins.addEventListener('input', () => { st.inst = ins.value; });
    chk.addEventListener('change', () => { st.acepta = chk.checked; });
    const seguir = btn('Comenzar', { kind:'action', size:'lg', icon:'arrowRight' });
    seguir.addEventListener('click', () => {
      if(st.nombre.trim().length < 3){ toast('Escribe tu nombre y apellido', 'warn'); nom.focus(); return; }
      if(!st.acepta){ toast('Confirma que evalúas de forma independiente', 'warn'); chk.focus(); return; }
      irPaso(2);
    });
    cuerpo = frag(notice('info', 'lock', 'Verás solo ' + ext.length + ' estaciones de seguridad eléctrica general en banco genérico. Nada del kit ni de la biblioteca de calibraciones.'),
      h('div', { class:'kcard stack', style:'--g:14px' }, h('div', { class:'grid g2', style:'--g:12px' }, field('Evaluador', nom), field('Institución', ins)),
        h('label', { class:'check' }, chk, h('span', { class:'small' }, 'Evalúo de forma independiente: no trabajo en duo con ' + nombreP(ses.pid) + ' ni lo formé.'))),
      h('div', { class:'row end' }, seguir));
  } else if(st.paso === 2){
    const items = ext.map((c, i) => {
      const it = ses.items[c];
      const g = h('div', { class:'kbtns' });
      const mk = (v, l, ic) => { const b = h('button', { type:'button', class:v, 'aria-pressed': it.r === v ? 'true' : 'false', 'data-k':'k-' + c + v }, icon(ic, 's20'), l);
        b.addEventListener('click', () => busy(b, () => marcarItem(sid, c, it.r === v ? null : v, 'kiosco', { nombre: st.nombre, institucion: st.inst })));
        return b; };
      g.appendChild(mk('s', 'Sabe', 'check')); g.appendChild(mk('n', 'No sabe', 'x'));
      return h('div', { class:'kitem' + (it.r ? ' marcado' : '') }, h('div', { class:'row sb', style:'gap:8px' }, h('div', { class:'row', style:'gap:8px' }, h('span', { class:'knum' }, (i + 1) + '/' + ext.length), codeTag(c), h('span', { class:'badge' }, CRITICIDAD[C[c].k].l)), it.r ? icon('check', 's16') : null), h('div', { class:'kt' }, C[c].t), g);
    });
    const rev = btn(listos < ext.length ? 'Faltan ' + (ext.length - listos) : 'Revisar y entregar', { kind:'action', size:'lg', icon:'arrowRight', disabled: listos < ext.length || null });
    rev.addEventListener('click', () => irPaso(3));
    cuerpo = frag(
      h('div', { class:'kprog' }, h('div', { class:'row sb small' }, h('span', null, 'Evalúa: ' + st.nombre.trim()), h('b', { class:'num' }, listos + ' de ' + ext.length)), h('div', { class:'progress' }, h('i', { style:'width:' + Math.round(100 * listos / ext.length) + '%' }))),
      items,
      h('div', { class:'row sb' }, btn('Volver', { kind:'ghost', icon:'arrowLeft', onClick: () => irPaso(1) }), rev));
  } else {
    const ok = ext.filter(c => ses.items[c].r === 's').length;
    const entregar = btn('Entregar evaluación', { kind:'action', size:'lg', icon:'check' });
    entregar.addEventListener('click', async () => {
      const r = await dialog({ title:'Entregar evaluación', icon:'check', confirm:'Entregar', body:'Después de entregar no puedes cambiar las marcas. ' + ok + ' de ' + ext.length + ' estaciones quedan como “sabe”.' });
      if(r) await busy(entregar, async () => { await entregarExterna(sid, st.nombre, st.inst); delete UI['kiosco-' + sid]; toast('Evaluación entregada. Gracias.'); });
    });
    cuerpo = frag(h('div', { class:'kcard stack', style:'--g:10px' }, h('div', { class:'row sb' }, h('b', null, 'Resumen'), h('span', { class:'small lw-muted' }, st.nombre.trim() + (st.inst.trim() ? ' · ' + st.inst.trim() : ''))),
        ext.map(c => h('div', { class:'ksum' }, codeTag(c), h('span', { class:'kt small' }, C[c].t), h('span', { class:'badge ' + (ses.items[c].r === 's' ? 'ok' : 'crit') }, ses.items[c].r === 's' ? 'Sabe' : 'No sabe')))),
      h('div', { class:'row sb' }, btn('Corregir', { kind:'ghost', icon:'arrowLeft', onClick: () => irPaso(2) }), entregar));
  }
  return wrap(frag(volverLista, pasos, titulo, cuerpo));
};

/* ---------- AGENDA DEL FORMADOR (nivel interact) ---------- */
VIEWS.agenda = function(){
  if(!S.loaded.has('agenda') || !S.loaded.has('marcas')) return vistaCargando();
  const ag = (S.mine.agenda && S.mine.agenda.sesiones) || {};
  const mis = (S.mine.marcas && S.mine.marcas.sesiones) || {};
  const ids = Object.keys(ag).sort((a, b) => String(ag[a].fecha).localeCompare(String(ag[b].fecha)));
  const cards = ids.map(sid => {
    const a = ag[sid];
    const enviado = mis[sid] && mis[sid].enviado;
    const st = ui('ag-' + sid, Object.assign({}, (mis[sid] && mis[sid].items) || {}));
    const obs = h('textarea', { class:'textarea', maxlength:'300', placeholder:'Observación opcional', value: (mis[sid] && mis[sid].obs) || '' });
    const pend = a.estado === 'pendiente';
    const filas = Object.keys(a.items || {}).sort().map(c => h('div', { class:'prow' }, h('div', { class:'pt' }, codeTag(c), h('div', { class:'txt' }, a.items[c].t)),
      ynBtns(st[c], (v) => { st[c] = v; render(true); }, !pend, 'ag-' + sid + c)));
    const env = btn(enviado ? 'Reenviar resultados' : 'Enviar resultados', { kind:'action', icon:'upload', disabled: !pend || null });
    env.addEventListener('click', () => busy(env, async () => { await enviarMarcas(sid, st, obs.value); toast('Resultados enviados al Responsable Técnico'); }));
    return h('div', { class:'card stack', style:'--g:14px' },
      h('div', { class:'row sb' }, h('div', null, h('div', { class:'h4' }, a.etiqueta), h('div', { class:'hint' }, TIPOS_SESION[a.tipo].l + ' · ' + fechaCorta(a.fecha))),
        badge(a.estado === 'pendiente' ? (enviado ? 'Enviado, por aceptar' : 'Pendiente') : a.estado === 'aceptado' ? 'Aceptado' : a.estado === 'cerrada' ? 'Cerrada' : 'Anulada', a.estado === 'aceptado' || a.estado === 'cerrada' ? 'ok' : enviado ? 'info' : 'warn')),
      h('div', { class:'pauta' }, filas), pend ? field('Observación', obs) : null, pend ? h('div', { class:'row end' }, env) : null);
  });
  return page(phead({ eyebrow:'Formador', eic:'grad', title:'Agenda de evaluación', lead:'Solo ves los ítems que te asignaron y el nombre de quien evalúas. Tus resultados quedan en tu espacio y los acepta el Responsable Técnico.' }),
    cards.length ? h('div', { class:'stack', style:'--g:14px' }, cards) : emptyState('calendar', 'Sin evaluaciones asignadas', 'Cuando te asignen una estación, aparece aquí.'));
};
