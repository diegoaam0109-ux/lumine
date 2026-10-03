/* =====================================================================
   Vistas: Duos e Indicadores
   ===================================================================== */
'use strict';

/* ---------- DUOS ---------- */
VIEWS.duos = function(){
  if(sinDatos(['personas','duos','solicitudes'])) return vistaCargando();
  const ps = personas(); const P = Pmap(); const pr = params();
  const sols = solicitudesRotacion();
  const act = duos().filter(d => d.activo);
  const hist = duos().filter(d => !d.activo).sort((a, b) => String(b.hasta || '').localeCompare(String(a.hasta || '')));
  const sinDuo = activos(ps).filter(p => !duoActivoDe(p.id, duos()));
  const mem = (p, r) => h('div', { class:'mem' + (r ? ' r' : '') }, avatar(p.nombre, colorDe(p)), h('div', { class:'mt' }, h('b', null, p.nombre), h('span', { class:'row', style:'gap:6px;' + (r ? 'justify-content:flex-end' : '') }, pips(p.nivel || 0), h('span', { class:'hint' }, 'N' + (p.nivel || 0)))));
  const cards = act.map(d => {
    const a = P[d.a], b = P[d.b];
    if(!a || !b) return null;
    const e = estadoDuo(d, P, ps, S.hoy, pr);
    const term = btn('Terminar duo', { kind:'ghost', size:'sm', onClick: async () => {
      const anticipado = !e.puedeRotar;
      const r = await dialog({ title:'Terminar duo', icon:'duo', danger: anticipado, confirm:'Terminar',
        body: anticipado ? 'Llevan menos de ' + pr.rotacionMinMeses + ' meses (rotación libre desde el ' + fechaLarga(e.rotacionLibre) + '). Antes de ese plazo, el Responsable Técnico solo los separa por seguridad o conflicto (D13).' : 'Cumplieron el plazo mínimo: la rotación es voluntaria.',
        motivo:{ label: anticipado ? 'Motivo (seguridad o conflicto)' : 'Motivo', required: anticipado, min: 5 } });
      if(!r) return;
      try { await terminarDuo(d.id, r.motivo || 'Rotación voluntaria'); toast('Duo terminado'); } catch(err){ toast(errMsg(err), 'crit'); }
    } });
    return h('div', { class:'card duo' + (e.valido ? ' okd' : '') },
      h('div', { class:'dm' }, mem(a), h('span', { class:'link', 'aria-hidden':'true' }, icon('duo', 's16')), mem(b, true)),
      h('div', { class:'tag-row' }, e.valido ? badge(e.supervisionRT ? 'Válido con supervisión del RT' : 'Válido', e.supervisionRT ? 'info' : 'ok', 'check') : null,
        e.alertas.filter(x => x.s !== 'info').map(x => badge(x.t, x.s, 'alert'))),
      h('div', { class:'row sb' }, h('span', { class:'hint' }, 'Desde ' + fechaCorta(d.desde) + ' · ' + (e.puedeRotar ? 'rotación libre' : 'rotación libre desde ' + fechaCorta(e.rotacionLibre))), term));
  });
  return page(
    phead({ eyebrow:'Organización del trabajo', eic:'duo', title:'Duos', lead:'Todo el trabajo técnico se hace en parejas fijas. La validación es en duo, con nota individual.',
      actions:[ btn('Formar duo', { kind:'action', icon:'plus', onClick: hojaFormarDuo }) ] }),
    h('div', { class:'card mist', style:'--pad:16px;margin-bottom:20px' }, h('ol', { class:'rules' },
      h('li', null, h('span', null, h('b', null, 'Todo duo lleva al menos un técnico de nivel 3 o 4. '), 'Mientras no exista nadie de nivel 3, trabajan bajo supervisión directa del Responsable Técnico.')),
      h('li', null, h('span', null, h('b', null, 'Rotación voluntaria cada ' + pr.rotacionMinMeses + ' meses como mínimo, por solicitud. '), 'El técnico explica por qué y el Responsable Técnico decide. Antes del plazo solo se separa por seguridad o conflicto (D13).')),
      h('li', null, h('span', null, h('b', null, 'Dos técnicos de nivel 1 nunca forman duo. '), 'El nivel 1 solo habilita a ser el segundo integrante, encargado de seguridad.')),
      h('li', null, h('span', null, h('b', null, 'Nadie valida a su compañero de duo. '), 'La plataforma bloquea la marca.')))),
    sols.length ? seccionSolicitudes(sols, pr) : null,
    act.length ? h('div', { class:'grid g2', style:'--g:14px' }, cards) : emptyState('duo', 'Sin duos activos', 'Forma el primero cuando haya técnicos con nivel 1 validado.'),
    sinDuo.length ? h('section', { class:'section' }, h('h2', { class:'h3', style:'margin-bottom:12px' }, 'Técnicos sin duo'), h('div', { class:'tag-row' }, sinDuo.map(p => badge(p.nombre + ' · N' + (p.nivel || 0), (p.nivel || 0) >= 1 ? 'warn' : 'line')))) : null,
    hist.length ? h('section', { class:'section' }, h('details', { class:'disc' }, h('summary', null, 'Historial de duos (' + hist.length + ')', icon('chevDown')),
      h('div', { class:'dbody' }, h('div', { class:'tscroll' }, h('table', { class:'t' }, h('thead', null, h('tr', null, h('th', null, 'Integrantes'), h('th', null, 'Desde'), h('th', null, 'Hasta'), h('th', null, 'Motivo'))),
        h('tbody', null, hist.map(d => h('tr', null, h('td', null, nombreP(d.a) + ' y ' + nombreP(d.b)), h('td', null, fechaCorta(d.desde)), h('td', null, fechaCorta(d.hasta)), h('td', null, d.motivoFin || '—'))))))))) : null);
};
function seccionSolicitudes(sols, pr){
  const item = x => {
    const sep = x.duo ? separacionAnticipada(x.duo, pr, S.hoy) : null;
    const comp = x.duo ? nombreP(x.duo.a === x.p.id ? x.duo.b : x.duo.a) : null;
    const req = [
      x.duo ? (sep.anticipado ? badge('Cumple ' + pr.rotacionMinMeses + ' meses el ' + fechaCorta(sep.libreDesde), 'warn', 'clock') : badge('Cumple ' + pr.rotacionMinMeses + ' meses en el duo', 'ok', 'check')) : badge('Ya no está en un duo', 'line'),
      badge('Motivo escrito', 'ok', 'check')
    ];
    const apr = btn('Aprobar y separar', { kind:'action', size:'sm', icon:'check', disabled: !x.duo || sep.anticipado || null, onClick: async () => {
      const r = await dialog({ title:'Aprobar la rotación', icon:'duo', confirm:'Aprobar', body:'Termina el duo de ' + x.p.nombre + ' y ' + comp + '. Después forma los nuevos duos: la plataforma exige al menos un técnico de nivel 3 o 4 y nunca dos de nivel 1.', motivo:{ label:'Comentario para ' + x.p.nombre.split(' ')[0] + ' (opcional)', required:false } });
      if(!r) return;
      try { await resolverSolicitudRotacion(x.uid, true, r.motivo || ''); toast('Rotación aprobada'); } catch(err){ toast(errMsg(err), 'crit'); }
    } });
    const rech = btn('Rechazar', { kind:'ghost', size:'sm', onClick: async () => {
      const r = await dialog({ title:'Rechazar la rotación', icon:'duo', confirm:'Rechazar', body:'El duo sigue igual. ' + x.p.nombre.split(' ')[0] + ' verá tu respuesta en su ruta.', motivo:{ label:'Respuesta', required:true, min:5 } });
      if(!r) return;
      try { await resolverSolicitudRotacion(x.uid, false, r.motivo); toast('Rotación rechazada'); } catch(err){ toast(errMsg(err), 'crit'); }
    } });
    return h('div', { class:'card stack', style:'--g:10px', 'data-solicitud': x.uid },
      h('div', { class:'row sb', style:'gap:10px' }, h('div', { class:'row', style:'gap:10px' }, avatar(x.p.nombre, colorDe(x.p)), h('div', null, h('b', null, x.p.nombre), h('div', { class:'hint' }, 'Nivel ' + (x.p.nivel || 0) + (comp ? ' · en duo con ' + comp + ' desde ' + fechaCorta(x.duo.desde) : '')))), h('span', { class:'hint' }, 'Enviada el ' + fechaCorta(x.sol.fecha))),
      h('blockquote', { class:'small', style:'margin:0;padding-left:12px;border-left:3px solid var(--line)' }, x.sol.motivo),
      x.sol.preferencia ? h('p', { class:'small ink2' }, h('b', null, 'Le gustaría trabajar con: '), x.sol.preferencia) : null,
      h('div', { class:'tag-row' }, req),
      h('div', { class:'row end', style:'gap:8px' }, rech, apr));
  };
  return h('section', { style:'margin-bottom:20px' }, h('h2', { class:'h3', style:'margin-bottom:12px' }, 'Solicitudes de rotación (' + sols.length + ')'), h('div', { class:'grid g2', style:'--g:14px' }, sols.map(item)));
}
function hojaFormarDuo(){
  const cand = activos(personas()).filter(p => (p.nivel || 0) >= 1 && !duoActivoDe(p.id, duos()));
  openSheet('Formar duo', close => {
    if(cand.length < 2) return emptyState('duo', 'No hay dos técnicos disponibles', 'Se necesitan dos técnicos con nivel 1 validado y sin duo activo.');
    const st = { a: cand[0].id, b: cand[1].id };
    const msg = h('div', { 'aria-live':'polite' });
    const opts = cand.map(p => [p.id, p.nombre + ' · N' + (p.nivel || 0)]);
    const sa = selectEl(opts, st.a), sb = selectEl(opts, st.b);
    const fecha = inputEl({ type:'date', value:S.hoy });
    const chk = () => { st.a = sa.value; st.b = sb.value; const r = puedeFormarDuo(st.a, st.b, Pmap(), duos(), personas()); clear(msg).appendChild(r.ok ? notice(r.aviso ? 'info' : 'ok', r.aviso ? 'info' : 'check', r.aviso || 'Duo válido.') : notice('crit', 'alert', r.motivo)); ok.disabled = !r.ok; };
    const ok = btn('Formar duo', { kind:'action', icon:'check' });
    ok.addEventListener('click', () => busy(ok, async () => { await formarDuo(st.a, st.b, parseISO(fecha.value) ? fecha.value : S.hoy); toast('Duo formado'); close(); }));
    sa.addEventListener('change', chk); sb.addEventListener('change', chk);
    setTimeout(chk, 0);
    return h('div', { class:'stack', style:'--g:16px' }, h('div', { class:'grid g2', style:'--g:12px' }, field('Integrante', sa), field('Integrante', sb)), field('Desde', fecha), msg, h('div', { class:'row end' }, btn('Cancelar', { kind:'ghost', onClick: close }), ok));
  });
}

/* ---------- gráfico de barras horizontales (una serie, un color) ---------- */
function barras(datos, o){
  o = o || {};
  const fmt = o.fmt || (v => numCL(v));
  const max = o.max || Math.max(1, ...datos.map(d => d.v || 0));
  const rowH = 34, labW = o.labW || 150, padR = 56, W = 560;
  const H = datos.length * rowH + 22;
  const plotW = W - labW - padR;
  const ticks = o.ticks || [0, max / 2, max];
  const svg = s('svg', { viewBox:'0 0 ' + W + ' ' + H, role:'img', 'aria-label': o.titulo || 'Gráfico de barras' });
  for(const t of ticks){ const x = labW + plotW * t / max; svg.appendChild(s('line', { class:'gl', x1:x, x2:x, y1:0, y2:H - 18 })); svg.appendChild(s('text', { class:'ax', x, y:H - 4, 'text-anchor':'middle' }, fmt(t))); }
  datos.forEach((d, i) => {
    const y = i * rowH + 6, bh = 20;
    const g = s('g', { class:'b', tabindex: d.v === null ? null : 0, role:'img', 'aria-label': d.l + ': ' + (d.v === null ? 'sin datos' : fmt(d.v) + (d.extra ? ', ' + d.extra : '')) });
    g.appendChild(s('text', { class:'axl', x: labW - 10, y: y + bh / 2 + 4, 'text-anchor':'end' }, d.l));
    if(d.v === null || d.v === undefined){ g.appendChild(s('text', { class:'ax', x: labW + 4, y: y + bh / 2 + 4 }, 'sin datos')); }
    else {
      const w = Math.max(d.v > 0 ? 3 : 0, plotW * d.v / max);
      const r = Math.min(4, w / 2);
      g.appendChild(s('path', { class:'bar' + (d.mut ? ' mut' : ''), d: 'M' + labW + ' ' + y + 'H' + (labW + w - r) + 'Q' + (labW + w) + ' ' + y + ' ' + (labW + w) + ' ' + (y + r) + 'V' + (y + bh - r) + 'Q' + (labW + w) + ' ' + (y + bh) + ' ' + (labW + w - r) + ' ' + (y + bh) + 'H' + labW + 'Z' }));
      g.appendChild(s('text', { class:'val', x: labW + w + 8, y: y + bh / 2 + 4 }, fmt(d.v)));
      const hit = s('rect', { class:'hit', x:0, y: y - 6, width:W, height:rowH });
      g.appendChild(hit);
      const tipC = () => frag(h('span', { class:'tv' }, fmt(d.v)), h('span', { class:'tl' }, d.l + (d.extra ? ' · ' + d.extra : '')));
      g.addEventListener('pointermove', ev => showTip(g, tipC(), { x: ev.clientX, y: ev.clientY }));
      g.addEventListener('pointerleave', hideTip); g.addEventListener('focus', () => showTip(g, tipC())); g.addEventListener('blur', hideTip);
    }
    svg.appendChild(g);
  });
  svg.appendChild(s('line', { class:'base', x1:labW, x2:labW, y1:0, y2:H - 18 }));
  return h('div', { class:'chart' }, svg);
}
function tablaDe(cols, filas){ return h('div', { class:'tscroll' }, h('table', { class:'t' }, h('thead', null, h('tr', null, cols.map((c, i) => h('th', { class: i ? 'r' : null }, c)))), h('tbody', null, filas.map(f => h('tr', null, f.map((c, i) => h('td', { class: i ? 'r num' : null }, c))))))); }
function indCard(def, cuerpo, tabla, meta){
  const k = 'ind-tabla-' + def.id;
  const verTabla = ui(k, false);
  const tg = btn(verTabla ? 'Ver gráfico' : 'Ver tabla', { kind:'quiet', size:'sm', icon: verTabla ? 'chart' : 'table', onClick: () => { UI[k] = !verTabla; render(true); } });
  return h('article', { class:'card ind-card' },
    h('div', { class:'row sb nw', style:'align-items:flex-start' }, h('div', null, h('h3', { class:'h4' }, def.n), h('p', { class:'iq' }, def.q)), tabla ? tg : null),
    verTabla && tabla ? tabla : cuerpo,
    h('div', { class:'ifoot' }, h('span', null, h('b', null, 'Cálculo: '), def.calc), h('span', null, h('b', null, 'Dato: '), def.src), meta !== null && meta !== undefined ? h('span', null, h('b', null, 'Meta: '), String(meta)) : h('span', null, h('b', null, 'Meta: '), 'sin fijar (no hay operación real para fijarla)')));
}
function heroInd(v, suf, sub){ return h('div', { class:'stack', style:'--g:4px' }, h('span', { class:'hero-num' }, v === null || v === undefined ? '—' : String(v), suf && v !== null && v !== undefined ? h('span', { class:'h3 muted', style:'margin-left:6px' }, suf) : null), sub ? h('span', { class:'hint' }, sub) : null); }

VIEWS.indicadores = function(){
  if(sinDatos(['personas','duos','registros','params','gestion'])) return vistaCargando();
  const per = ui('ind-per', 'todo');
  const desde = per === '12' ? addMonths(S.hoy, -12) : per === '6' ? addMonths(S.hoy, -6) : null;
  const g = gestion();
  const I = indicadores(ctx({ desde }));
  const D = Object.fromEntries(INDICADORES.map(x => [x.id, x]));
  const meta = id => g.metas[id];
  const cards = [];
  // 1 autonomía
  const aut = I.autonomia.porPerfil;
  cards.push(indCard(D.autonomia, I.autonomia.n ? h('div', { class:'stack', style:'--g:12px' }, heroInd(I.autonomia.promedio, 'días', 'promedio de ' + I.autonomia.n + ' técnicos'), barras(aut.map(x => ({ l:x.l, v:x.dias, extra: x.n + ' técnicos' })), { fmt: v => numCL(v) + ' d', labW:190, titulo:'Días hasta el nivel 3 por perfil' })) : emptyState('route', 'Nadie llega al nivel 3 en el período', null),
    tablaDe(['Perfil','Técnicos','Días promedio'], aut.map(x => [x.l, String(x.n), x.dias === null ? '—' : numCL(x.dias)])), meta('autonomia')));
  // 2 primer intento
  const pt = I.primer.porTipo.filter(x => x.total);
  cards.push(indCard(D.primer, I.primer.total ? h('div', { class:'stack', style:'--g:12px' }, heroInd(I.primer.global, '%', I.primer.total + ' primeras presentaciones'), barras(pt.map(x => ({ l:x.l, v:x.pct, extra: x.ok + ' de ' + x.total })), { max:100, fmt: v => Math.round(v) + '%', ticks:[0,50,100], titulo:'Aprobación al primer intento' })) : emptyState('clipboard', 'Sin validaciones en el período', null),
    tablaDe(['Validación','Aprobados','Se presentan','%'], I.primer.porTipo.map(x => [x.l, String(x.ok), String(x.total), x.pct === null ? '—' : x.pct + '%'])), meta('primer')));
  // 3 oficio
  const of = I.oficio.porPerfil;
  cards.push(indCard(D.oficio, I.oficio.n ? h('div', { class:'stack', style:'--g:12px' }, heroInd(I.oficio.promedio === null ? null : numCL(I.oficio.promedio, 1), 'de 11', 'promedio por persona diagnosticada'), barras(of.map(x => ({ l:x.l, v:x.prom, extra: x.n + ' personas' })), { max:11, fmt: v => numCL(v, v % 1 ? 1 : 0), ticks:[0,5.5,11], labW:190, titulo:'Oficio saltado por perfil' })) : emptyState('wrench', 'Sin jornadas en el período', null),
    tablaDe(['Perfil','Personas','Promedio saltado'], of.map(x => [x.l, String(x.n), x.prom === null ? '—' : numCL(x.prom, 1)])), meta('oficio')));
  // 4 costo
  const co = I.costo;
  cards.push(indCard(D.costo, co.faltan.length ? h('div', { class:'ind-miss' }, h('b', null, 'No se calcula sin estos datos (no se inventan):'), h('ul', { style:'padding-left:18px' }, co.faltan.map(f => h('li', null, f))), linkBtn('Ingresar en Ajustes', 'ajustes-parametros', { size:'sm' }))
    : h('div', { class:'stack', style:'--g:8px' }, heroInd(co.valor === null ? null : clp(co.valor), null, co.llegan3 + ' técnicos llegaron al nivel 3'), h('p', { class:'hint' }, numCL(co.horasForm) + ' h de formación · ' + numCL(co.horasVal) + ' h de validación · ' + co.extCount + ' validaciones con parte externa')), null, meta('costo')));
  // 5 dotación
  const dt = I.dotacion;
  cards.push(indCard(D.dotacion, h('div', { class:'stack', style:'--g:12px' }, heroInd(dt.duos.validos, 'de ' + dt.duos.total, 'duos válidos'), barras(dt.porNivel.map(x => ({ l:x.l, v:x.v })), { max: Math.max(1, ...dt.porNivel.map(x => x.v)), ticks:[0, Math.max(1, ...dt.porNivel.map(x => x.v))], titulo:'Técnicos por nivel' })),
    tablaDe(['Nivel','Técnicos'], dt.porNivel.map(x => [x.l, String(x.v)])), meta('dotacion')));
  // 6 incidentes
  const inc = I.incidentes;
  const instIn = inputEl({ type:'number', min:'0', inputmode:'numeric', placeholder:'Cantidad', style:'max-width:130px' });
  const instB = btn('Registrar', { kind:'ghost', size:'sm', onClick: ev => busy(ev.currentTarget, async () => { await agregarInstalaciones(desde || addMonths(S.hoy, -12), S.hoy, instIn.value); toast('Instalaciones registradas'); }) });
  cards.push(indCard(D.incidentes, h('div', { class:'stack', style:'--g:12px' },
    inc.tasa === null ? heroInd(inc.n, inc.n === 1 ? 'incidente' : 'incidentes', (inc.graves === 1 ? '1 grave' : inc.graves + ' graves') + ' · falta el total de instalaciones para la tasa') : heroInd(numCL(inc.tasa, 1), 'por 100', inc.n + ' incidentes en ' + numCL(inc.instalaciones) + ' instalaciones'),
    S.readOnly ? null : h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Instalaciones del período'), h('div', { class:'row' }, instIn, instB), h('span', { class:'hint' }, 'Lo ingresa administración: la plataforma no está integrada con la operación.'))), null, meta('incidentes')));
  // 7 fallas
  const fa = I.fallas;
  const faT = fa.porTecnico.filter(x => x.v > 0);
  cards.push(indCard(D.fallas, h('div', { class:'stack', style:'--g:12px' }, heroInd(fa.total, fa.total === 1 ? 'caso' : 'casos', 'atribuibles, de ' + fa.casos + ' registrados'), faT.length ? barras(faT.map(x => ({ l:x.l, v:x.v })), { max: Math.max(1, ...faT.map(x => x.v)), ticks:[0, Math.max(1, ...faT.map(x => x.v))], titulo:'Fallas por técnico' }) : h('p', { class:'hint' }, 'Sin fallas atribuibles.')),
    tablaDe(['Técnico','Casos atribuibles'], fa.porTecnico.map(x => [x.l, String(x.v)])), meta('fallas')));
  // 8 rotación
  const ro = I.rotacion;
  cards.push(indCard(D.rotacion, h('div', { class:'stack', style:'--g:8px' }, heroInd(ro.pct, '%', ro.salidos + ' de ' + ro.total + ' técnicos de nivel 3 o 4'), h('p', { class:'hint' }, 'Retención quedó fuera por decisión del equipo. Si este número sube, es la señal para retomarla.')), null, meta('rotacion')));
  return page(
    phead({ eyebrow:'Cuadro de Mando Integral · aprendizaje y crecimiento', eic:'chart', title:'Indicadores', lead:'Los ocho indicadores del informe 6. Todos salen de datos que la plataforma registra; las metas quedan como parámetros porque sin operación real no hay base para fijarlas.' }),
    S.build === 'demo' ? notice('info', 'info', h('b', null, 'Datos ficticios de demostración. '), 'Personas, fechas y resultados inventados para mostrar el cálculo. No son mediciones ni proyecciones.') : null,
    h('div', { class:'filters', style:'margin-top:16px' }, h('span', { class:'label' }, 'Período'), segmented([{ v:'todo', l:'Todo' }, { v:'12', l:'12 meses' }, { v:'6', l:'6 meses' }], per, v => { UI['ind-per'] = v; render(true); }, { label:'Período' })),
    h('div', { class:'grid g2', style:'--g:14px' }, cards));
};
