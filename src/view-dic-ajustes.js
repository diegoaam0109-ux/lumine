/* =====================================================================
   Vistas: Diccionario de competencias y Ajustes
   ===================================================================== */
'use strict';

/* ---------- DICCIONARIO (visible para todos) ---------- */
function detalleComp(c){
  const x = C[c];
  const mods = MODULOS.filter(m => m.cod.includes(c)).map(m => m.nombre);
  const curso = CURSOS_CORE.find(k => k.codigos.includes(c));
  openSheet(c + ' · ' + PRIORIDAD[x.p].l, () => h('div', { class:'stack', style:'--g:16px' },
    h('p', { class:'h3' }, x.t),
    h('div', { class:'tag-row' }, prioTag(x.p), critTag(x.k), badge(EVALUA[x.e], 'line'), badge('Valida ' + VALIDA[x.v].toLowerCase(), 'line')),
    h('dl', { class:'kv' },
      h('dt', null, 'Nivel'), h('dd', null, x.n + ' · ' + NIVEL[x.n].nombre),
      h('dt', null, 'Bloque'), h('dd', null, x.b),
      h('dt', null, 'Prioridad'), h('dd', null, PRIORIDAD[x.p].r),
      h('dt', null, 'Aprobación'), h('dd', null, CRITICIDAD[x.k].a + ' · ' + CRITICIDAD[x.k].d),
      h('dt', null, 'Se aprende en'), h('dd', null, mods.length ? mods.join(', ') : 'En el trabajo, observada en duo'),
      curso ? frag(h('dt', null, 'Curso core'), h('dd', null, curso.nombre)) : null,
      h('dt', null, 'Lo trae el mercado'), h('dd', null, MERCADO[x.m] + ' (estimación del informe 2, por confirmar con evidencia)')),
    h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Tareas del duo que la usan'), x.ta.map(t => h('div', { class:'crow' }, codeTag(t), h('span', { class:'ct' }, TAREAS[t]), h('span')))),
    x.p === 'oficio' ? notice('info', 'info', 'Se salta solo demostrándola en la jornada técnica' + (x.k === 'seg' ? ', sin error, porque es de seguridad.' : '.')) : null,
    (c === 'C25' || c === 'C26') ? notice('info', 'lock', 'La enseña y la valida Ingeniería de Calibración. La biblioteca de calibraciones no se guarda en la plataforma.') : null), { wide:true });
}
VIEWS.diccionario = function(){
  const f = ui('dic-f', { n:'', p:'', k:'', v:'', q:'' });
  const qq = f.q.trim().toLowerCase();
  const lista = COMP.filter(x => (!f.n || String(x.n) === f.n) && (!f.p || x.p === f.p) && (!f.k || x.k === f.k) && (!f.v || x.v === f.v) && (!qq || (x.c + ' ' + x.t).toLowerCase().includes(qq)));
  const matriz = h('div', { class:'tscroll dmatrix' }, h('table', { class:'t' }, h('thead', null, h('tr', null, h('th', null, 'Nivel'), h('th', null, 'Core'), h('th', null, 'Oficio'), h('th', null, 'Desarrollo'), h('th', null, 'Total'))),
    h('tbody', null, NIVELES.map(N => { const cs = COMP.filter(x => x.n === N.n); return h('tr', null, h('td', null, N.n + '. ' + N.nombre), ['core','oficio','desarrollo'].map(p => h('td', { class:'num' }, String(cs.filter(x => x.p === p).length))), h('td', { class:'num' }, h('b', null, String(cs.length)))); }),
      h('tr', null, h('td', null, h('b', null, 'Total')), ['core','oficio','desarrollo'].map(p => h('td', { class:'num' }, h('b', null, String(COMP.filter(x => x.p === p).length)))), h('td', { class:'num' }, h('b', null, '39'))))));
  const sel = (key, opts, label) => { const e = selectEl([['', label]].concat(opts), f[key], { 'aria-label': label }); e.addEventListener('change', () => { f[key] = e.value; render(true); }); return e; };
  const q = h('input', { class:'input', type:'search', placeholder:'Buscar código o texto', value:f.q, maxlength:'60', 'aria-label':'Buscar competencia' });
  q.addEventListener('keydown', e => { if(e.key === 'Enter'){ f.q = q.value; q.blur(); render(true); } });
  q.addEventListener('change', () => { f.q = q.value; render(true); });
  return page(
    phead({ eyebrow:'39 competencias · informes 2 y 3', eic:'book', title:'Diccionario de competencias', lead:'La prioridad dice si se cursa siempre, si se puede demostrar o si se aprende al subir de nivel. La criticidad dice con qué nota se aprueba. Son dos preguntas distintas.' }),
    h('div', { class:'grid g2', style:'--g:14px;margin-bottom:20px' }, matriz,
      h('div', { class:'grid', style:'--g:8px' }, Object.keys(PRIORIDAD).map(k => h('div', { class:'card', style:'--pad:12px 14px' }, h('div', { class:'row sb' }, prioTag(k), h('span', { class:'hint' }, PRIORIDAD[k].r)), h('p', { class:'small ink2', style:'margin-top:6px' }, PRIORIDAD[k].d))))),
    h('div', { class:'filters' }, h('div', { class:'searchbox' }, icon('search'), q),
      sel('n', NIVELES.map(N => [String(N.n), 'Nivel ' + N.n]), 'Todos los niveles'), sel('p', Object.keys(PRIORIDAD).map(k => [k, PRIORIDAD[k].l]), 'Toda prioridad'),
      sel('k', Object.keys(CRITICIDAD).map(k => [k, CRITICIDAD[k].l]), 'Toda criticidad'), sel('v', [['ext','Externa'],['int','Interna']], 'Toda validación'),
      h('span', { class:'hint' }, lista.length + ' de 39')),
    lista.length ? h('div', { class:'clist' }, lista.map(x => { const b = h('button', { type:'button', class:'citem' }, codeTag(x.c), h('span', null, h('span', { class:'small', style:'display:block;font-weight:500' }, x.t), h('span', { class:'hint' }, 'Nivel ' + x.n + ' · ' + EVALUA[x.e] + ' · valida ' + VALIDA[x.v].toLowerCase())), h('span', { class:'cb' }, prioTag(x.p), critTag(x.k))); b.addEventListener('click', () => detalleComp(x.c)); return b; }))
      : emptyState('search', 'Sin coincidencias', null),
    h('section', { class:'section stack', style:'--g:10px' },
      h('details', { class:'disc' }, h('summary', null, 'Las siete reglas de evaluación', icon('chevDown')), h('div', { class:'dbody' }, h('ol', { class:'rules' }, REGLAS_EVAL.map(([t, d]) => h('li', null, h('span', null, h('b', null, t + ' '), d)))))),
      h('details', { class:'disc' }, h('summary', null, 'Las cinco reglas de avance', icon('chevDown')), h('div', { class:'dbody' }, h('ol', { class:'rules' }, REGLAS_AVANCE.map(([t, d]) => h('li', null, h('span', null, h('b', null, t + ' '), d)))))),
      h('details', { class:'disc' }, h('summary', null, 'Reglas del diagnóstico', icon('chevDown')), h('div', { class:'dbody' }, h('ol', { class:'rules' }, REGLAS_DIAG.map(([t, d]) => h('li', null, h('span', null, h('b', null, t + ' '), d))))))));
};

/* ---------- panel de seguridad (20 controles) ---------- */
const SEG_L = { ok:['Cubierto','ok'], plat:['Lo cubre claude.ai','info'], pend:['Pendiente de operación','warn'], na:['No aplica','line'] };
const HORAS_T = { norma:'Norma', mixta:'Norma y estimación', estimacion:'Estimación' };
function panelSeguridad(full){
  const cnt = k => SEGURIDAD.filter(x => x.s === k).length;
  return h('div', { class:'stack', style:'--g:16px' },
    h('div', { class:'tag-row' }, Object.keys(SEG_L).map(k => badge(cnt(k) + ' · ' + SEG_L[k][0], SEG_L[k][1]))),
    h('div', { class:'secgrid' }, SEGURIDAD.map(x => h('div', { class:'secitem ' + x.s }, h('span', { class:'sn' }, String(x.n)),
      h('div', null, h('div', { class:'st' }, h('b', null, x.t), badge(SEG_L[x.s][0], SEG_L[x.s][1])), h('p', null, x.d))))),
    full ? h('div', { class:'stack', style:'--g:8px' }, h('span', { class:'label' }, 'Reglas de acceso de la base (las aplica el servidor)'),
      tablaDe(['Ruta','Lee','Escribe'], DB_RULES.map(r => [r.path || '(raíz)', r.read, r.write])),
      h('p', { class:'hint' }, 'admin = Editor o dueño · interact = Colaborador · {self} = solo el propio usuario.')) : null);
}

/* ---------- AJUSTES ---------- */
const AJ_GRUPOS = [
  { v:'reglas', l:'Reglas', ic:'settings', tabs:[['parametros','Parámetros'],['trazabilidad','Decisiones y fuentes']] },
  { v:'equipo', l:'Contenido y equipo', ic:'users', tabs:[['contenido','Contenido de módulos'],['equipo','Equipo evaluador']] },
  { v:'sistema', l:'Sistema', ic:'database', tabs:[['seguridad','Seguridad'],['respaldo','Respaldo'],['consistencia','Consistencia'],['bitacora','Bitácora']] }
];
VIEWS.ajustes = function(arg){
  if(sinDatos(['params','gestion','personas'])) return vistaCargando();
  const todas = AJ_GRUPOS.flatMap(g => g.tabs);
  if(arg && todas.some(t => t[0] === arg)) UI['aj-tab'] = arg;
  const tab = ui('aj-tab', 'parametros');
  const grupo = AJ_GRUPOS.find(g => g.tabs.some(t => t[0] === tab)) || AJ_GRUPOS[0];
  const set = v => { UI['aj-tab'] = v; if(parseHash().arg) location.replace('#ajustes'); else render(true); };
  const cuerpo = { parametros: ajParametros, contenido: ajContenido, equipo: ajEquipo, seguridad: () => panelSeguridad(true), respaldo: ajRespaldo, consistencia: ajConsistencia, bitacora: ajBitacora, trazabilidad: ajTrazabilidad }[tab]();
  return page(phead({ eyebrow:'Administración', eic:'settings', title:'Ajustes' }),
    h('div', { class:'aj-grupos', style:'margin-bottom:16px' }, segmented(AJ_GRUPOS.map(g => ({ v:g.v, l:g.l, ic:g.ic })), grupo.v, v => set(AJ_GRUPOS.find(g => g.v === v).tabs[0][0]), { label:'Grupo de ajustes' })),
    grupo.tabs.length > 1 ? tabs(grupo.tabs.map(([v, l]) => ({ v, l })), tab, set) : null, cuerpo);
};
function numIn(v, o){ return inputEl(Object.assign({ type:'number', inputmode:'decimal', value: v === null || v === undefined ? '' : v, placeholder:'Sin fijar', style:'max-width:160px' }, o || {})); }
function ajParametros(){
  const pr = params(); const g = gestion();
  const st = JSON.parse(JSON.stringify(pr)); const sg = JSON.parse(JSON.stringify({ costos:g.costos, metas:g.metas }));
  const bind = (el, obj, key) => { el.addEventListener('input', () => { obj[key] = el.value; }); return el; };
  const ex = exigenciaEfectiva(pr.umbralComp);
  const umb = bind(numIn(pr.umbralComp, { min:'50', max:'100' }), st, 'umbralComp');
  const save = btn('Guardar parámetros', { kind:'owner', icon:'check' });
  save.addEventListener('click', async () => {
    const sens = Number(st.umbralComp) !== pr.umbralComp || Number(st.umbralFund) !== pr.umbralFund || Number(st.revalidacionMeses) !== pr.revalidacionMeses;
    if(sens){ const r = await dialog({ title:'Cambiar reglas de aprobación', icon:'alert', iconKind:'warn', confirm:'Guardar', body:'Cambia cómo se evalúa a todos desde ahora. Lo ya cerrado no se recalcula. Queda en la bitácora.', motivo:{ label:'Motivo', required:true } }); if(!r) return; }
    await busy(save, async () => { await guardarParametros(st); await guardarGestion(sg); toast('Parámetros guardados'); });
  });
  const fila = (l, el, hint) => h('div', { class:'row sb', style:'padding:10px 0;border-bottom:1px solid var(--line);gap:12px' }, h('div', { style:'flex:1 1 260px' }, h('div', { class:'small', style:'font-weight:600' }, l), hint ? h('div', { class:'hint' }, hint) : null), el);
  return h('div', { class:'stack', style:'--g:20px' },
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:6px' }, 'Reglas de aprobación'),
      fila('Umbral de complementarias (%)', umb, 'D7: seguridad y producto siempre al 100%.'),
      h('div', { class:'notice warn', style:'margin:12px 0' }, icon('info'), h('div', null, h('b', null, 'Exigencia real con ' + pr.umbralComp + '%: '), ex.map(x => 'nivel ' + x.n + ' ' + x.req + ' de ' + x.total).join(' · ') + '. Con menos de ' + minimoParaQueImporte(pr.umbralComp) + ' complementarias en una validación, el umbral equivale a 100%. Hoy ninguna validación llega a ese número.')),
      fila('Fundamentos: correctas por área para no nivelar', bind(numIn(pr.umbralFund, { min:'1', max:'3' }), st, 'umbralFund'), 'De 3 preguntas por área. Solo puede sumar nivelación.'),
      fila('Revalidación del core de seguridad (meses)', bind(numIn(pr.revalidacionMeses, { min:'1', max:'60' }), st, 'revalidacionMeses'), 'Fijado por el equipo en 24 meses. Referencias: IMI TechSafe usa 36; la DGUV pide actualizar primeros auxilios cada 24.'),
      fila('Rotación mínima de duos (meses)', bind(numIn(pr.rotacionMinMeses, { min:'0', max:'24' }), st, 'rotacionMinMeses'), 'D13: por solicitud al Responsable Técnico, desde este plazo.'),
      fila('Período autónomo del nivel 3 (días)', bind(numIn(pr.periodoAutonomoDias, { min:'1', max:'365' }), st, 'periodoAutonomoDias'), 'Ventana de trabajo autónomo observado. Ninguna norma fija la ventana; 90 días caben dentro de un mismo duo (rotación cada 4 meses).'),
      fila('Firma por nivel (D18)', badge('Cerrada', 'ok'), 'Nivel 3 firma su trabajo propio; nivel 4 firma revisiones cruzadas. Lo legal lo firma solo el Responsable Técnico (D17).')),
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:6px' }, 'Horas por módulo'), h('p', { class:'hint' }, 'Aprender y practicar, en horas reloj. Lo de alta tensión sale de normas internacionales; lo propio del kit es estimación hasta tener el procedimiento real.'),
      MODULOS.map(m => { const r = HORAS_REF[m.id]; return fila(m.nombre, bind(numIn(pr.horasModulo[m.id], { min:'0', max:'500' }), st.horasModulo, m.id), r ? h('span', null, badge(HORAS_T[r.t], r.t === 'norma' ? 'ok' : r.t === 'mixta' ? 'info' : 'line'), ' ', m.id + ' · ' + r.h + ' h de referencia. ' + r.b) : m.id); })),
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:6px' }, 'Horas por validación'), Object.keys(TIPOS_SESION).map(t => fila(TIPOS_SESION[t].l, bind(numIn(pr.horasValidacion[t], { min:'0', max:'200' }), st.horasValidacion, t)))),
    tarjetaBonos(pr, st, fila, bind),
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:6px' }, 'Costos para el indicador de costo (CLP)'), h('p', { class:'hint' }, 'Los ingresa administración. Mientras falten, el indicador muestra qué falta en vez de inventar un número.'),
      fila('Costo por hora de formación', bind(numIn(g.costos.horaFormacion, { min:'0' }), sg.costos, 'horaFormacion')),
      fila('Costo por hora de validación interna', bind(numIn(g.costos.horaValidacionInterna, { min:'0' }), sg.costos, 'horaValidacionInterna')),
      fila('Costo de cada validación externa', bind(numIn(g.costos.validacionExterna, { min:'0' }), sg.costos, 'validacionExterna')),
      fila('Otros costos del período', bind(numIn(g.costos.otros, { min:'0' }), sg.costos, 'otros'))),
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:6px' }, 'Metas de los indicadores'), INDICADORES.map(i => fila(i.n, bind(numIn(g.metas[i.id], { min:'0' }), sg.metas, i.id)))),
    S.readOnly ? null : h('div', { class:'row end' }, save));
}
/* Bono por avance (D11) a partir de un presupuesto: finanzas fija cuánto hay, la plataforma
   reparte según cuántas personas se espera que validen cada nivel y cuánto vale cada nivel. */
function tarjetaBonos(pr, st, fila, bind){
  const bp = st.bonoPresupuesto = Object.assign({ presupuesto:null, meses:12, paso:1000, esperados:{}, pesos:{} }, JSON.parse(JSON.stringify(pr.bonoPresupuesto || {})));
  const cand = candidatosPorNivel(personas());
  for(const n of [1,2,3,4]){ if(bp.esperados[n] === null || bp.esperados[n] === undefined) bp.esperados[n] = cand[n]; if(bp.pesos[n] === null || bp.pesos[n] === undefined) bp.pesos[n] = n; }
  const montoIn = {};
  const res = h('div', { 'aria-live':'polite' });
  const calcular = () => {
    const r = calcularBonos(bp);
    clear(res);
    if(r.error){ res.appendChild(notice('', 'info', r.error + '.')); return r; }
    res.appendChild(h('div', { class:'stack', style:'--g:10px' },
      tablaDe(['Nivel','Personas esperadas','Peso','Bono por persona','Subtotal'], [1,2,3,4].map(n => ['Nivel ' + n + ' · ' + NIVEL[n].corto, numCL(Number(bp.esperados[n]) || 0), numCL(Number(bp.pesos[n]) || 0, 1), clp(r.montos[n]), clp(r.montos[n] * (Number(bp.esperados[n]) || 0))])),
      h('div', { class:'row sb small' }, h('span', null, 'Comprometido ' + clp(r.comprometido) + ' de ' + clp(Number(bp.presupuesto)) + (bp.meses ? ' en ' + bp.meses + ' meses' : '')), h('span', { class:'muted' }, 'Queda sin asignar ' + clp(r.sobra) + ' por redondeo')),
      h('div', { class:'row end' }, btn('Usar estos montos', { kind:'action', size:'sm', icon:'check', onClick: () => { for(const n of [1,2,3,4]){ st.bonoNivel[n] = r.montos[n]; montoIn[n].value = r.montos[n]; } toast('Montos copiados. Guarda los parámetros para aplicarlos.', 'info'); } }))));
    return r;
  };
  const inp = (obj, key, o) => { const el = numIn(obj[key], Object.assign({ style:'max-width:120px' }, o || {})); el.addEventListener('input', () => { obj[key] = el.value; calcular(); }); return el; };
  const grilla = h('div', { class:'tscroll' }, h('table', { class:'t' },
    h('thead', null, h('tr', null, h('th', null, 'Nivel'), h('th', null, 'Personas esperadas'), h('th', null, 'Peso relativo'))),
    h('tbody', null, [1,2,3,4].map(n => h('tr', null, h('td', null, 'Nivel ' + n + ' · ' + NIVEL[n].nombre), h('td', null, inp(bp.esperados, n, { min:'0' })), h('td', null, inp(bp.pesos, n, { min:'0', step:'0.5' })))))));
  setTimeout(calcular, 0);
  return h('div', { class:'card stack', style:'--g:12px' },
    h('h3', { class:'h4' }, 'Bono por avance validado (CLP)'),
    h('p', { class:'hint' }, 'D11: por avance validado, nunca por nota online. Puedes escribir los montos o calcularlos desde el presupuesto que fije finanzas.'),
    h('div', null, [1,2,3,4].map(n => { const el = bind(numIn(pr.bonoNivel[n], { min:'0' }), st.bonoNivel, n); montoIn[n] = el; return fila('Nivel ' + n + ' · ' + NIVEL[n].nombre, el); })),
    h('details', { class:'calc', open: pr.bonoPresupuesto ? true : null },
      h('summary', null, icon('gauge', 's16'), 'Calcular según presupuesto'),
      h('div', { class:'stack', style:'--g:12px;margin-top:12px' },
        h('p', { class:'small ink2' }, 'Bono de cada nivel = presupuesto × peso del nivel ÷ suma de (personas esperadas × peso). Las personas esperadas parten de quienes hoy pueden validar cada nivel; ajústalas a tu plan de contratación.'),
        h('div', { class:'grid g3', style:'--g:12px' }, field('Presupuesto para bonos (CLP)', inp(bp, 'presupuesto', { min:'0', style:'max-width:none' })), field('Horizonte (meses)', inp(bp, 'meses', { min:'1', max:'60', style:'max-width:none' })), field('Redondear a', inp(bp, 'paso', { min:'1', style:'max-width:none' }))),
        grilla, res)));
}

/* ---------- CONTENIDO DE LOS MÓDULOS ----------
   El Responsable Técnico ajusta cápsulas y banco de preguntas sin programar ni republicar.
   Se guarda en config/contenido; el original del código queda intacto y se puede restaurar. */
function ajContenido(){
  const mid = ui('cont-mid', MODULOS[3].id);
  const sel = selectEl(MODULOS.map(m => [m.id, m.id + ' · ' + m.nombre]), mid, { style:'max-width:420px' });
  sel.addEventListener('change', () => { UI['cont-mid'] = sel.value; render(true); });
  const m = MOD[mid];
  const editado = !!(S.D.contenido && S.D.contenido.modulos && S.D.contenido.modulos[mid]);
  const base = contenidoDe(mid) || { capsulas:[], practica:[] };
  const st = ui('cont-' + mid, JSON.parse(JSON.stringify({ resumen: base.resumen || '', mostrar: base.mostrar || '', capsulas: base.capsulas || [], practica: base.practica || [] })));
  const codOpts = [['', 'Sin competencia']].concat(m.cod.map(c => [c, c + ' · ' + C[c].t.slice(0, 50)]));
  const caps = st.capsulas.map((k, i) => {
    const ti = inputEl({ value:k.t, maxlength:'120', placeholder:'Título de la cápsula' }); ti.addEventListener('input', () => { k.t = ti.value; });
    const pu = h('textarea', { class:'textarea', maxlength:'2400', placeholder:'Un punto por línea', style:'min-height:110px' }); pu.value = (k.puntos || []).join('\n'); pu.addEventListener('input', () => { k.puntos = pu.value.split('\n').map(x => x.trim()).filter(Boolean); });
    const co = selectEl(codOpts, k.c || ''); co.addEventListener('change', () => { k.c = co.value || null; });
    return h('div', { class:'card stack edit-card', style:'--g:10px' }, h('div', { class:'row sb' }, h('b', { class:'small' }, 'Cápsula ' + (i + 1)), btn('Quitar', { kind:'quiet', size:'sm', icon:'trash', onClick: () => { st.capsulas.splice(i, 1); render(true); } })),
      h('div', { class:'grid g2', style:'--g:10px' }, field('Título', ti), field('Competencia', co)), field('Puntos', pu));
  });
  const preg = st.practica.map((q, i) => {
    q.o = (q.o || []).concat(['', '', '', '']).slice(0, Math.max(4, (q.o || []).length));
    const qi = h('textarea', { class:'textarea', maxlength:'400', placeholder:'Caso o pregunta', style:'min-height:64px' }); qi.value = q.q || ''; qi.addEventListener('input', () => { q.q = qi.value; });
    const name = 'ok-' + mid + '-' + i;
    const ops = q.o.slice(0, 4).map((o, j) => {
      const r = h('input', { type:'radio', name, checked: q.a === j || null, 'aria-label':'Correcta: alternativa ' + 'ABCD'[j] }); r.addEventListener('change', () => { q.a = j; });
      const oi = inputEl({ value:o, maxlength:'240', placeholder:'Alternativa ' + 'ABCD'[j] }); oi.addEventListener('input', () => { q.o[j] = oi.value; });
      return h('label', { class:'opt-edit' }, r, h('span', { class:'ol' }, 'ABCD'[j]), oi);
    });
    const xi = inputEl({ value:q.x || '', maxlength:'400', placeholder:'Explicación que se muestra al revisar' }); xi.addEventListener('input', () => { q.x = xi.value; });
    const co = selectEl(codOpts, q.c || ''); co.addEventListener('change', () => { q.c = co.value || null; });
    return h('div', { class:'card stack edit-card', style:'--g:10px' }, h('div', { class:'row sb' }, h('b', { class:'small' }, 'Pregunta ' + (i + 1)), btn('Quitar', { kind:'quiet', size:'sm', icon:'trash', onClick: () => { st.practica.splice(i, 1); render(true); } })),
      field('Competencia', co), field('Enunciado', qi), h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Alternativas · marca la correcta'), ops), field('Explicación', xi));
  });
  const mostrar = numIn(st.mostrar, { min:'1', max:'40' }); mostrar.addEventListener('input', () => { st.mostrar = mostrar.value; });
  const resumen = inputEl({ value: st.resumen, maxlength:'300', placeholder: m.resumen }); resumen.addEventListener('input', () => { st.resumen = resumen.value; });
  const guardar = btn('Guardar contenido', { kind:'owner', icon:'check' });
  guardar.addEventListener('click', () => busy(guardar, async () => {
    const limpio = { resumen: st.resumen, mostrar: st.mostrar, capsulas: st.capsulas, practica: st.practica.map(q => Object.assign({}, q, { o: q.o.filter(x => String(x || '').trim()) })) };
    for(const [i, q] of limpio.practica.entries()) if(!(q.a < q.o.length)) throw new Error('Pregunta ' + (i + 1) + ': la alternativa marcada como correcta está vacía');
    await guardarContenido(mid, limpio); delete UI['cont-' + mid]; toast('Contenido guardado. Los técnicos ya lo ven.');
  }));
  const restaurar = editado ? btn('Restaurar original', { kind:'ghost', icon:'refresh', onClick: async ev => { const r = await dialog({ title:'Restaurar contenido original', body:'Se borra lo editado de este módulo y vuelve el contenido del código.', confirm:'Restaurar', icon:'refresh' }); if(r) busy(ev.currentTarget, async () => { await restaurarContenido(mid); delete UI['cont-' + mid]; toast('Contenido restaurado'); }); } }) : null;
  return h('div', { class:'stack', style:'--g:16px' },
    notice('info', 'info', 'Aquí cambias textos, cápsulas y preguntas sin programar ni republicar. La estructura (competencias, niveles, módulos y reglas de evaluación) sigue en el código a propósito: de ella dependen las reglas y sus pruebas automáticas. Una estación o competencia nueva se agrega en src/ y se publica.'),
    h('div', { class:'row sb' }, field('Módulo', sel), editado ? badge('Editado · ' + fechaHora(S.D.contenido.modulos[mid].editado), 'info') : badge('Contenido del código', 'line')),
    h('div', { class:'grid g2', style:'--g:12px' }, field('Resumen (opcional)', resumen), field('Preguntas por intento', mostrar, 'Se eligen al azar del banco. Vacío = todas.')),
    h('div', { class:'section-h', style:'margin:8px 0 0' }, h('h3', { class:'h4' }, 'Cápsulas (' + st.capsulas.length + ')'), btn('Agregar cápsula', { kind:'ghost', size:'sm', icon:'plus', onClick: () => { st.capsulas.push({ t:'', c:null, puntos:[] }); render(true); } })),
    caps.length ? h('div', { class:'stack', style:'--g:10px' }, caps) : h('p', { class:'hint' }, 'Sin cápsulas: el módulo se muestra como "en preparación".'),
    h('div', { class:'section-h', style:'margin:8px 0 0' }, h('h3', { class:'h4' }, 'Banco de preguntas (' + st.practica.length + ')'), btn('Agregar pregunta', { kind:'ghost', size:'sm', icon:'plus', onClick: () => { st.practica.push({ c:null, q:'', o:['', '', '', ''], a:0, x:'' }); render(true); } })),
    preg.length ? h('div', { class:'stack', style:'--g:10px' }, preg) : h('p', { class:'hint' }, 'Sin preguntas: el módulo no tiene práctica evaluada.'),
    S.readOnly ? null : h('div', { class:'row end' }, restaurar, guardar));
}

/* ---------- CONSISTENCIA Y CAPACIDAD ---------- */
function ajConsistencia(){
  if(sinDatos(['agenda','expedientes','sesiones','duos'])) return vistaCargando();
  const inc = revisarConsistencia(ctx({ expedientes: S.D.expedientes }));
  const u = usoBase();
  const todo = btn('Reparar todo', { kind:'owner', icon:'wrench', disabled: !inc.some(x => x.fix) || null });
  todo.addEventListener('click', () => busy(todo, async () => { let n = 0; for(const x of inc) if(x.fix){ await repararConsistencia(x.fix); n++; } toast(n + ' reparaciones aplicadas'); }));
  return h('div', { class:'stack', style:'--g:18px' },
    h('div', { class:'card stack', style:'--g:10px' }, h('h3', { class:'h4' }, 'Capacidad de la base'),
      h('div', { class:'row sb small' }, h('span', null, u.docs.toLocaleString('es-CL') + ' de ' + u.cap.toLocaleString('es-CL') + ' documentos'), h('b', { class:'num' }, u.pct + '%')),
      h('div', { class:'progress' + (u.aviso ? ' warn' : '') }, h('i', { style:'width:' + Math.min(100, u.pct) + '%' })),
      h('p', { class:'hint' }, 'Límite de la base de un artifact en claude.ai: 25.000 documentos y 256 KiB por documento. La bitácora se agrupa por mes y la agenda y las marcas por persona, así que el uso crece con las personas y las validaciones, no con cada clic.')),
    S.salud.perfiles ? notice('warn', 'users', h('b', null, 'Falla al cargar nombres de cuentas: '), S.salud.perfiles.msg + ' · ' + fechaHora(S.salud.perfiles.t)) : null,
    h('div', { class:'card stack', style:'--g:10px' }, h('div', { class:'row sb' }, h('h3', { class:'h4' }, 'Datos inconsistentes'), todo),
      h('p', { class:'hint' }, 'La base de claude.ai no tiene transacciones. Las operaciones de varios pasos (cerrar una validación, registrar una salida, un incidente grave, aceptar resultados) deshacen lo hecho si un paso falla. Si incluso eso falla, aquí aparece lo que quedó a medias.'),
      inc.length ? h('div', { class:'stack', style:'--g:8px' }, inc.map(x => h('div', { class:'crow' }, icon('alert', 's16'), h('span', { class:'ct' }, x.t), x.fix ? btn('Reparar', { kind:'ghost', size:'sm', onClick: ev => busy(ev.currentTarget, async () => { await repararConsistencia(x.fix); toast('Reparado'); }) }) : badge('Revisar a mano', 'warn')))) : emptyState('checkCircle', 'Todo consistente', 'Duos, validaciones, agendas y expedientes calzan entre sí.')));
}

function ajEquipo(){
  const g = gestion();
  const ids = Object.keys(g.equipo);
  resolverPerfiles(ids);
  const res = h('div', { class:'stack', style:'--g:6px' });
  const rolSel = selectEl(Object.keys(ROL_L).map(k => [k, ROL_L[k]]), 'ic', { style:'max-width:240px' });
  const q = inputEl({ type:'search', placeholder:'Buscar persona de la organización', maxlength:'60' });
  const buscar = async () => { if(!S.user || !S.user.search) return; const hits = await S.user.search(q.value); clear(res); for(const x of hits){ PROFILES[x.id] = { name:x.name, color:x.color }; const b = h('button', { type:'button', class:'role-opt' }, avatar(x.name, x.color), h('span', { class:'rt' }, h('b', null, x.name), h('span', null, 'Asignar como ' + ROL_L[rolSel.value]))); b.addEventListener('click', () => busy(b, async () => { await setRolEquipo(x.id, rolSel.value); toast('Rol asignado'); })); res.appendChild(b); } };
  q.addEventListener('input', buscar); q.addEventListener('focus', buscar);
  return h('div', { class:'stack', style:'--g:18px' },
    notice('info', 'info', 'El nivel de acceso se da en el menú Compartir de claude.ai: Editor para administración, Colaborador para técnicos y formadores. Aquí se asigna el rol interno, que decide quién puede marcar qué.'),
    ids.length ? h('div', { class:'stack', style:'--g:8px' }, ids.map(uid => h('div', { class:'crow' }, avatar(nombreUid(uid), (PROFILES[uid] || {}).color), h('span', { class:'ct' }, h('b', null, nombreUid(uid)), h('span', { class:'hint', style:'display:block' }, ROL_L[g.equipo[uid].rol] + (g.equipo[uid].desde ? ' · desde ' + fechaCorta(g.equipo[uid].desde) : ''))),
      btn('Quitar', { kind:'quiet', size:'sm', onClick: async ev => { const r = await dialog({ title:'Quitar rol', body:'Deja de poder validar con ese rol.', confirm:'Quitar', danger:true }); if(r) busy(ev.currentTarget, async () => { await setRolEquipo(uid, null); toast('Rol retirado'); }); } })))) : emptyState('users', 'Sin roles asignados', 'El dueño de la plataforma actúa como Responsable Técnico.'),
    h('div', { class:'card stack', style:'--g:10px' }, h('h3', { class:'h4' }, 'Asignar rol'), h('div', { class:'row' }, rolSel, q), res,
      h('p', { class:'hint' }, 'Formador exige un técnico de nivel 4 con cuenta vinculada. C25 y C26 solo los marca Ingeniería de Calibración.')));
}
function ajRespaldo(){
  const out = h('div');
  const exp = btn('Exportar respaldo completo', { kind:'owner', icon:'download' });
  exp.addEventListener('click', () => busy(exp, async () => {
    const r = await exportarRespaldo();
    if(typeof r === 'string'){ const ta = h('textarea', { class:'textarea', readonly:true, style:'min-height:160px;font-family:var(--mono);font-size:12px' }); ta.value = r; clear(out).appendChild(h('div', { class:'stack', style:'--g:8px' }, notice('warn', 'info', 'Esta vista no permite descargas. Copia el respaldo y guárdalo como archivo .json.'), ta, btn('Copiar', { kind:'ghost', size:'sm', icon:'copy', onClick: () => copiar(r, ta) }))); }
  }));
  const file = h('input', { type:'file', accept:'.json,application/json', class:'input', 'aria-label':'Archivo de respaldo' });
  const reemp = h('input', { type:'checkbox' });
  const plan = h('div');
  file.addEventListener('change', () => {
    const f = file.files && file.files[0]; clear(plan);
    if(!f) return;
    if(f.size > 2 * 1024 * 1024){ plan.appendChild(notice('crit', 'alert', 'El archivo supera 2 MB.')); return; }
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const { o, writes } = validarRespaldo(String(rd.result));
        const pe = pruebaEnSeco(writes, reemp.checked);
        const ap = btn('Restaurar', { kind:'danger', cls:'solid', icon:'upload' });
        ap.addEventListener('click', async () => { const r = await dialog({ title:'Restaurar respaldo', danger:true, icon:'upload', confirm:'Restaurar', body:'Se escriben ' + (pe.nuevos.length + pe.cambian.length) + ' documentos' + (pe.borrar.length ? ' y se borran ' + pe.borrar.length : '') + '. Recomendado: exporta antes un respaldo del estado actual.' }); if(r) busy(ap, async () => { const n = await aplicarRespaldo(writes, pe); toast('Respaldo restaurado: ' + n + ' cambios'); clear(plan); }); });
        clear(plan).appendChild(h('div', { class:'card stack', style:'--g:10px' }, h('b', null, 'Prueba en seco · respaldo del ' + fechaHora(o.exportado)),
          h('div', { class:'tag-row' }, badge(pe.nuevos.length + ' nuevos', 'info'), badge(pe.cambian.length + ' cambian', 'warn'), badge(pe.iguales.length + ' iguales', 'line'), pe.borrar.length ? badge(pe.borrar.length + ' se borran', 'crit') : null),
          h('p', { class:'hint' }, 'Nada se escribió todavía.'), h('div', { class:'row end' }, ap)));
      } catch(e){ plan.appendChild(notice('crit', 'alert', errMsg(e))); }
    };
    rd.readAsText(f);
  });
  reemp.addEventListener('change', () => file.dispatchEvent(new Event('change')));
  return h('div', { class:'grid g2', style:'--g:14px;align-items:start' },
    h('div', { class:'card stack', style:'--g:12px' }, h('h3', { class:'h4' }, 'Exportar'), h('p', { class:'small ink2' }, 'Todo el sistema en un archivo JSON: personas, validaciones, duos, registros, avance, parámetros y bitácora.'), exp, out),
    h('div', { class:'card stack', style:'--g:12px' }, h('h3', { class:'h4' }, 'Restaurar'), h('p', { class:'small ink2' }, 'Solo .json de Lumine Habilita, hasta 2 MB. Se valida cada identificador y se muestra qué cambiaría antes de escribir.'), file,
      h('label', { class:'check' }, reemp, h('span', { class:'small' }, h('b', null, 'Reemplazar todo. '), 'Borra lo que no está en el respaldo.')), plan,
      S.build === 'demo' ? btn('Restablecer demostración', { kind:'ghost', size:'sm', icon:'refresh', onClick: async () => { const r = await dialog({ title:'¿Restablecer la demostración?', body:'Vuelven los datos ficticios iniciales.', confirm:'Restablecer' }); if(r) demoReset(); } }) : null));
}
function ajBitacora(){
  const meses = Object.keys(S.D.bitacora).sort().reverse();
  const mes = ui('bit-mes', meses[0] || S.hoy.slice(0, 7));
  const ev = Object.values((S.D.bitacora[mes] || {}).eventos || {}).sort((a, b) => String(b.t).localeCompare(String(a.t)));
  resolverPerfiles(ev.map(e => e.uid));
  return h('div', { class:'stack', style:'--g:14px' },
    h('div', { class:'filters', style:'margin:0' }, h('span', { class:'label' }, 'Mes'), meses.length ? segmented(meses.map(m => ({ v:m, l:m })), mes, v => { UI['bit-mes'] = v; render(true); }) : h('span', { class:'hint' }, 'Sin registros')),
    notice('', 'info', 'Registra quién hizo qué y cuándo. Límite: un administrador podría editarla; por eso viaja completa en cada respaldo.'),
    ev.length ? tablaDe(['Acción','Detalle','Quién','Cuándo'], ev.map(e => [e.a, e.d || '—', nombreUid(e.uid), fechaHora(e.t)])) : emptyState('history', 'Sin eventos este mes', null));
}
function ajTrazabilidad(){
  const est = { Cerrada:'ok', Propuesta:'warn', Pendiente:'crit' };
  return h('div', { class:'stack', style:'--g:18px' },
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:10px' }, 'Registro de decisiones (informe 1)'), tablaDe(['N°','Ámbito','Decisión','Estado'], DECISIONES.map(([n, a, d, e]) => [n, a, d, badge(e, est[e])]))),
    h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:10px' }, 'Pendientes abiertos'), h('ul', { style:'padding-left:18px;display:flex;flex-direction:column;gap:6px' }, PENDIENTES.map(x => h('li', { class:'small ink2' }, x)))),
    h('div', { class:'grid g2', style:'--g:14px' },
      h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:10px' }, 'Informes de la Fase 3'), h('ul', { style:'list-style:none;display:flex;flex-direction:column;gap:8px' }, INFORMES.map(([n, t, u]) => h('li', null, h('a', { href:u, target:'_blank', rel:'noopener noreferrer', class:'small' }, n + ': ' + t)))), h('p', { class:'hint', style:'margin-top:8px' }, 'Requieren acceso del equipo.')),
      h('div', { class:'card' }, h('h3', { class:'h4', style:'margin-bottom:10px' }, 'Fuentes'), h('ul', { style:'list-style:none;display:flex;flex-direction:column;gap:8px' }, FUENTES.map(([t, u]) => h('li', null, h('a', { href:u, target:'_blank', rel:'noopener noreferrer', class:'small' }, t)))))));
}
