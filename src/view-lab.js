/* =====================================================================
   Vistas: Laboratorio 3D y Taller "Arma el kit"
   Familiarizarse con la tecnología antes de tocarla: el auto genérico
   con el kit en el eje trasero, pieza por pieza, y un juego de
   secuencia basado en las tareas del duo del informe 1.
   ===================================================================== */
'use strict';

function piezaModulos(p){ return MODULOS.filter(m => m.cod.some(c => p.comp.includes(c))); }
function modPiezas(mid){ const m = MOD[mid]; return m ? PIEZAS.filter(p => p.comp.some(c => m.cod.includes(c))) : []; }

/* botón de alternar con estado visible */
function toggleBtn(label, ic, on, fn){
  const b = h('button', { type:'button', class:'lab-tg', 'aria-pressed': on ? 'true' : 'false' }, icon(ic, 's16'), h('span', null, label));
  b.addEventListener('click', () => { const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); fn(v); });
  return b;
}
function zoomBtns(api, host){
  const z = (d) => { const e = new WheelEvent('wheel', { deltaY:d, ctrlKey:true, bubbles:true, cancelable:true }); host.querySelector('.lab-canvas').dispatchEvent(e); };
  return h('div', { class:'lab-zoom-b' },
    btn('', { kind:'quiet', size:'sm', icon:'plus', cls:'icon', aria:'Acercar', onClick: () => z(-140) }),
    btn('', { kind:'quiet', size:'sm', icon:'minus', cls:'icon', aria:'Alejar', onClick: () => z(140) }),
    btn('', { kind:'quiet', size:'sm', icon:'refresh', cls:'icon', aria:'Vista inicial', onClick: () => { api.soltar(); api.vista(-0.75, 0.32, 7.6); } }));
}

/* ---------- LABORATORIO ---------- */
VIEWS.laboratorio = function(arg){
  const st = ui('lab', { sel: null, xray:false, explode:false, giro:true, quiz:null });
  if(arg && PIEZA[arg]) st.sel = arg;
  const stage = h('div', { class:'lab-stage', 'data-rv':'' });
  const panel = h('div', { class:'lab-panel-in', 'aria-live':'polite' });
  const lista = h('div', { class:'lab-list', role:'group', 'aria-label':'Piezas' });
  const prompt = h('div', { class:'lab-prompt', hidden:true, 'aria-live':'assertive' });
  let api;

  function pintarPanel(){
    clear(panel);
    for(const b of lista.children) b.setAttribute('aria-pressed', b.dataset.id === st.sel ? 'true' : 'false');
    const p = st.sel && PIEZA[st.sel];
    if(!p){
      panel.appendChild(frag(
        h('span', { class:'lab-k' }, 'Auto genérico · tracción delantera'),
        h('h2', { class:'h3' }, 'El kit se suma al auto. No reemplaza nada.'),
        h('p', { class:'small ink2' }, 'El motor a combustión queda adelante, igual que siempre. Atrás, en el eje trasero, se instala la parte eléctrica: motor, frenado regenerativo, banco de baterías y su cableado, coordinados por la unidad de control.'),
        h('p', { class:'hint' }, 'Toca un punto del auto o elige una pieza de la lista.')));
      return;
    }
    const mods = piezaModulos(p);
    panel.appendChild(frag(
      h('span', { class:'lab-k' }, p.sub),
      h('h2', { class:'h3' }, p.n),
      h('p', { class:'small ink2' }, p.d),
      h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Qué cuidar'),
        h('ul', { class:'lab-cuida' }, p.cuida.map(t => h('li', { class:'small' }, icon('shieldCheck', 's14'), h('span', null, t))))),
      h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Competencias'),
        h('div', { class:'tag-row' }, p.comp.map(c => h('button', { type:'button', class:'badge line lab-cb', title: C[c].t, on:{ click: () => detalleComp(c) } }, c + ' · ' + C[c].t.split(/[,:]/)[0])))),
      mods.length ? h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Se aprende en'),
        h('div', { class:'tag-row' }, mods.map(m => badge(m.nombre, 'info', 'layers')))) : null));
  }
  function elegir(id){
    if(st.quiz) return responderQuiz(id);
    st.sel = id; pintarPanel();
    if(api){ if(id) api.enfocar(id); else api.soltar(); }
  }
  for(const p of PIEZAS){
    const b = h('button', { type:'button', class:'lab-li', dataset:{ id:p.id }, 'aria-pressed':'false' }, h('i', { class:'lab-sw ' + p.id }), h('span', null, h('b', null, p.n), h('small', null, p.sub)));
    b.addEventListener('click', () => elegir(st.sel === p.id ? null : p.id));
    lista.appendChild(b);
  }

  /* ponte a prueba: identificar cada pieza en el modelo */
  const quizBox = h('div', { class:'card lab-quiz', 'data-rv':'' });
  function pintarQuiz(){
    clear(quizBox);
    const q = st.quiz;
    stage.classList.toggle('quiz', !!q);
    stage.querySelectorAll('.lab-hot').forEach((b, i) => b.setAttribute('aria-label', q ? 'Punto ' + (i + 1) : PIEZA[b.dataset.id].n));
    lista.hidden = !!q;
    if(!q){
      prompt.hidden = true;
      addKids(quizBox, [h('div', { class:'row sb', style:'gap:14px' },
        h('div', { class:'stack', style:'--g:4px' }, eyebrow('Ponte a prueba', 'target'), h('h3', { class:'h4' }, '¿Sabes dónde va cada pieza?'), h('p', { class:'small ink2' }, 'Se ocultan los nombres y te pedimos cada pieza en otro orden. Tócala en el modelo.')),
        btn(st.ultimo ? 'Repetir' : 'Empezar', { kind:'action', icon:'play', onClick: iniciarQuiz })),
        st.ultimo ? h('p', { class:'small muted' }, 'Último intento: ' + st.ultimo.ok + ' de ' + st.ultimo.total + (st.ultimo.ok === st.ultimo.total ? '. Todas a la primera.' : '. Repasa las que fallaste en la lista.')) : null]);
      return;
    }
    if(q.i >= q.orden.length){
      st.ultimo = { ok:q.ok, total:q.orden.length };
      const fin = h('b', { class:'lab-big' }, '0');
      addKids(quizBox, [h('div', { class:'row sb', style:'gap:14px' },
        h('div', { class:'row', style:'gap:14px' }, fin, h('div', { class:'stack', style:'--g:2px' }, h('b', null, 'de ' + q.orden.length + ' a la primera'), h('span', { class:'small ink2' }, q.fallos.length ? 'Repasa: ' + q.fallos.map(id => PIEZA[id].n).join(', ') + '.' : 'Reconoces todo el sistema.'))),
        h('div', { class:'row' }, btn('Salir', { kind:'ghost', onClick: () => { st.quiz = null; pintarQuiz(); } }), btn('Otra vez', { kind:'action', icon:'refresh', onClick: iniciarQuiz })))]);
      Motion.contar(fin, q.ok, 700);
      prompt.hidden = true;
      return;
    }
    const id = q.orden[q.i];
    prompt.hidden = false;
    clear(prompt).appendChild(frag(h('small', null, 'Pieza ' + (q.i + 1) + ' de ' + q.orden.length), h('b', null, 'Toca: ' + PIEZA[id].n)));
    addKids(quizBox, [h('div', { class:'row sb', style:'gap:14px' },
      h('div', { class:'stack', style:'--g:4px' }, eyebrow('Ponte a prueba', 'target'), h('h3', { class:'h4' }, 'Busca: ' + PIEZA[id].n), h('p', { class:'small ink2' }, q.msg || 'Gira el auto si no la ves. Puedes activar rayos X.')),
      h('div', { class:'row' }, h('span', { class:'badge info num' }, q.ok + ' bien'), btn('Salir', { kind:'ghost', size:'sm', onClick: () => { st.quiz = null; pintarQuiz(); } })))]);
  }
  function iniciarQuiz(){
    const orden = barajar(PIEZAS.map(p => p.id), nuevaSemilla());
    st.quiz = { orden, i:0, ok:0, fallos:[], intento:0, msg:'' };
    st.sel = null; pintarPanel(); if(api) api.soltar();
    pintarQuiz();
    stage.scrollIntoView({ behavior: Motion.quieto() ? 'auto' : 'smooth', block:'center' });
  }
  function responderQuiz(id){
    const q = st.quiz, meta = q.orden[q.i];
    if(id === meta){
      if(q.intento === 0) q.ok++; else q.fallos.push(meta);
      q.i++; q.intento = 0; q.msg = 'Bien: era ' + PIEZA[meta].n + '.';
      if(api) api.aparecer(meta);
    } else {
      q.intento++; q.msg = 'Eso es ' + PIEZA[id].n + '. Sigue buscando.';
      stage.classList.remove('nope'); void stage.offsetWidth; stage.classList.add('nope');
    }
    pintarQuiz();
  }

  const tools = h('div', { class:'lab-tools' },
    toggleBtn('Rayos X', 'eye', st.xray, v => { st.xray = v; api && api.modo({ xray:v }); }),
    toggleBtn('Despiece', 'layers', st.explode, v => { st.explode = v; api && api.modo({ explode:v }); }));
  const hint = h('div', { class:'lab-hint' }, icon('hand', 's14'), h('span', null, 'Arrastra para girar · Ctrl + rueda o los botones para acercar'));
  setTimeout(() => {
    if(!document.body.contains(stage)) return;
    api = Lab3D.crear(stage, { auto: st.giro && !st.sel, hotspots:true, interactivo:true, xray:st.xray, explode:st.explode, foco:st.sel, onSelect: id => elegir(id), etiqueta:'Modelo 3D de un auto genérico con el kit Lumine en el eje trasero. La lista de piezas junto al modelo ofrece la misma información.' });
    stage.appendChild(zoomBtns(api, stage));
    if(st.sel) api.enfocar(st.sel);
    pintarQuiz();
  }, 0);
  pintarPanel();
  pintarQuiz();

  return page(
    phead({ eyebrow:'Laboratorio 3D', eic:'cube', title:'Conoce el kit antes de tocarlo.', lead:'Gira el auto, mira a través de la carrocería y separa las piezas. Cada una dice qué hace, qué hay que cuidar y en qué competencias se aprende.' }),
    h('div', { class:'lab-grid' },
      h('div', { class:'lab-col' }, h('div', { class:'lab-frame' }, stage, tools, prompt, hint), quizBox),
      h('aside', { class:'lab-panel card', 'data-rv':'' }, panel, h('div', { class:'menu-sep' }), lista)),
    h('div', { class:'lab-note' }, icon('info', 's14'), h('span', null, 'Modelo esquemático de un auto genérico. Las posiciones son ilustrativas: el procedimiento y las medidas reales los entrega Lumine en el taller.')),
    h('section', { class:'lab-cta', 'data-rv':'' },
      h('div', { class:'stack', style:'--g:6px' }, eyebrow('Siguiente', 'wrench'), h('h2', { class:'h3' }, 'Ahora ármalo. En orden.'), h('p', { class:'small ink2' }, 'Diecinueve tareas del duo, de la asignación de roles al informe técnico. Si te saltas la seguridad, el taller te detiene.')),
      linkBtn('Ir al taller', 'taller', { kind:'action', arrow:true })));
};

/* ---------- TALLER: ARMA EL KIT ----------
   Secuencia de referencia basada en las tareas del duo (informe 1).
   Cada carta es una tarea; solo se puede jugar si sus requisitos ya
   están hechos. Las cartas trampa son atajos que el taller no acepta. */
const TALLER_PASOS = [
  { id:'t01', ta:'0.1', t:'Asignar roles del duo', req:[] },
  { id:'t02', ta:'0.2', t:'Equipo dieléctrico y zona delimitada', req:['t01'] },
  { id:'t03', ta:'1.1', t:'Verificar elegibilidad del auto', req:['t01'] },
  { id:'t04', ta:'1.3', t:'Revisar eje trasero, frenos y chasis', req:['t03'] },
  { id:'t05', ta:'1.4', t:'Leer el OBD y registrar fallas previas', req:['t03'], foco:'obd' },
  { id:'t06', ta:'1.6', t:'Emitir el informe de diagnóstico', req:['t04','t05'] },
  { id:'t07', ta:'2.1', t:'Desmontar el tren trasero', req:['t06','t02'] },
  { id:'t08', ta:'2.2', t:'Instalar motor eléctrico y regenerativo', req:['t07'], pone:['motor','regen'] },
  { id:'t09', ta:'2.3', t:'Montar el banco de baterías con elevador', req:['t07'], pone:['bateria'] },
  { id:'t10', ta:'2.4', t:'Tender cableado de alta tensión, sin conectar', req:['t08','t09'], pone:['cables'] },
  { id:'t11', ta:'2.5', t:'Pesar el auto: masa total y por eje', req:['t08','t09'] },
  { id:'t12', ta:'3.1', t:'Conectar alta tensión y medir aislación', req:['t10'] },
  { id:'t13', ta:'3.2', t:'Energizar controlado y revisar con termografía', req:['t12'] },
  { id:'t14', ta:'3.3', t:'Integrar la unidad de control', req:['t13'], pone:['ecu'] },
  { id:'t15', ta:'3.4', t:'Verificar la capa de seguridad', req:['t14'] },
  { id:'t16', ta:'4.1', t:'Cargar la calibración desde la biblioteca', req:['t15'], foco:'ecu' },
  { id:'t17', ta:'5.1', t:'Probar en dinamómetro', req:['t16'] },
  { id:'t18', ta:'5.2', t:'Pruebas previas a la certificación', req:['t17','t11'] },
  { id:'t19', ta:'6.2', t:'Preparar el informe técnico', req:['t18'] }
];
const TALLER_TRAMPAS = [
  { id:'x1', k:'seg', t:'Energizar ya y medir la aislación después', x:'La aislación se verifica con megóhmetro al conectar, antes de energizar (tareas 3.1 y 3.2).' },
  { id:'x2', k:'prod', t:'Cargar la calibración de un modelo parecido', x:'La calibración es la del modelo, desde la biblioteca. Si el modelo no está, el auto no es elegible (tarea 1.1).' },
  { id:'x3', k:'seg', t:'Soltar un conector de alta tensión sin medir', x:'Antes de intervenir alta tensión van las cinco reglas de oro, incluida la verificación de ausencia de tensión con instrumento (tarea 0.3).' },
  { id:'x4', k:'prod', t:'Saltarse el pesaje para ganar tiempo', x:'Sin pesaje, el Responsable Técnico no puede verificar los límites de 20% y 10% (tarea 2.5).' },
  { id:'x5', k:'seg', t:'Partir sin encargado de seguridad', x:'El duo siempre trabaja con ejecutor y encargado de seguridad, que puede detener el trabajo (tarea 0.1).' }
];
const TPASO = Object.fromEntries(TALLER_PASOS.map(p => [p.id, p]));
function tallerMejor(){ try { const v = JSON.parse(localStorage.getItem('lh-taller') || 'null'); return v && typeof v.seg === 'number' ? v : null; } catch(e){ return null; } }
function tallerGuardar(v){ try { localStorage.setItem('lh-taller', JSON.stringify(v)); } catch(e){} }
function mmss(ms){ const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function nuevoJuego(){ return { hecho:[], errores:0, fallasSeg:0, fallasProd:0, trampasUsadas:[], t0:0, tFin:0, mano:[], msg:null, intentadas:[], log:[] }; }

VIEWS.taller = function(){
  const g = ui('taller', nuevoJuego());
  const stage = h('div', { class:'lab-stage taller-stage' });
  const mano = h('div', { class:'t-hand', role:'group', 'aria-label':'Cartas de tarea disponibles' });
  const feed = h('div', { class:'t-feed', 'aria-live':'polite' });
  const bita = h('ol', { class:'t-log', 'aria-label':'Bitácora de la instalación' });
  const reloj = h('b', { class:'num' }, '0:00');
  const cont = h('b', { class:'num' }, '0');
  const errs = h('b', { class:'num' }, '0');
  const seg = h('b', { class:'num' }, '0');
  const segBox = h('div', { class:'t-segc' }, h('small', null, 'Seguridad'), seg);
  const barra = h('i');
  const res = h('div');
  let api, tic = 0;

  const disponibles = () => TALLER_PASOS.filter(p => !g.hecho.includes(p.id) && p.req.every(r => g.hecho.includes(r)));
  const frontera = () => TALLER_PASOS.filter(p => !g.hecho.includes(p.id) && !p.req.every(r => g.hecho.includes(r)) && p.req.every(r => g.hecho.includes(r) || disponibles().some(d => d.id === r)));
  function repartir(){
    const disp = barajar(disponibles().map(p => p.id), nuevaSemilla());
    const cartas = disp.slice(0, Math.min(2, disp.length));
    const relleno = barajar(frontera().map(p => p.id).concat(TALLER_PASOS.filter(p => !g.hecho.includes(p.id) && !cartas.includes(p.id)).map(p => p.id).slice(0, 6)), nuevaSemilla());
    for(const id of relleno){ if(cartas.length >= 4) break; if(!cartas.includes(id)) cartas.push(id); }
    const trampas = TALLER_TRAMPAS.filter(x => !g.trampasUsadas.includes(x.id));
    if(trampas.length && g.hecho.length > 0 && Math.random() < 0.55) cartas.push(trampas[Math.floor(Math.random() * trampas.length)].id);
    else if(cartas.length < 5 && disp.length > cartas.filter(id => disp.includes(id)).length) cartas.push(disp.find(id => !cartas.includes(id)));
    g.mano = barajar(cartas.filter(Boolean), nuevaSemilla());
    g.intentadas = [];
  }
  function carta(id){
    const p = TPASO[id], x = p ? null : TALLER_TRAMPAS.find(t => t.id === id);
    const tried = g.intentadas.includes(id);
    const b = h('button', { type:'button', class:'t-card' + (tried ? ' tried' : '') + (x ? ' trap' : ''), 'data-k':'tc-' + id, disabled: tried || null },
      h('span', { class:'t-ta mono' }, p ? 'Tarea ' + p.ta : 'Atajo'),
      h('span', { class:'t-tt' }, p ? p.t : x.t),
      h('span', { class:'t-go' }, icon(tried ? 'x' : 'arrowRight', 's14')));
    b.addEventListener('click', () => jugar(id, b));
    return b;
  }
  function pintar(){
    const n = g.hecho.length, total = TALLER_PASOS.length;
    cont.textContent = String(n); errs.textContent = String(g.errores); seg.textContent = String(g.fallasSeg);
    segBox.classList.toggle('bad', g.fallasSeg > 0);
    barra.style.width = (n / total * 100).toFixed(1) + '%';
    clear(mano);
    if(n === total){ fin(); return; }
    if(!g.mano.length) repartir();
    g.mano.forEach(id => mano.appendChild(carta(id)));
    clear(feed);
    if(g.msg) feed.appendChild(h('div', { class:'t-msg ' + g.msg.k }, icon(g.msg.k === 'ok' ? 'checkCircle' : g.msg.k === 'seg' ? 'shieldX' : 'alert', 's16'), h('span', null, g.msg.t)));
    else feed.appendChild(h('div', { class:'t-msg' }, icon('info', 's16'), h('span', null, n ? 'Elige la siguiente tarea.' : 'El auto acaba de llegar al taller. ¿Por dónde parte el duo?')));
    clear(bita);
    g.log.slice(-6).forEach(l => bita.appendChild(h('li', null, h('span', { class:'mono xs' }, l.ta), h('span', null, l.t))));
    if(!g.log.length) bita.appendChild(h('li', { class:'muted' }, h('span', { class:'mono xs' }, '—'), h('span', null, 'Sin tareas todavía')));
  }
  function jugar(id, b){
    if(!g.t0){ g.t0 = Date.now(); correr(); }
    const p = TPASO[id];
    if(!p){
      const x = TALLER_TRAMPAS.find(t => t.id === id);
      g.trampasUsadas.push(id); g.errores++;
      if(x.k === 'seg') g.fallasSeg++; else g.fallasProd++;
      g.msg = { k: x.k === 'seg' ? 'seg' : 'warn', t: (x.k === 'seg' ? 'Falla de seguridad. ' : 'Falla de producto. ') + x.x };
      g.mano = g.mano.filter(c => c !== id);
      sacudir(b); pintar(); return;
    }
    const faltan = p.req.filter(r => !g.hecho.includes(r));
    if(faltan.length){
      g.errores++; g.intentadas.push(id);
      g.msg = { k:'warn', t:'Todavía no. Antes falta: ' + faltan.map(r => TPASO[r].t.toLowerCase()).join(' y ') + '.' };
      sacudir(b); pintar(); return;
    }
    g.hecho.push(id); g.log.push({ ta:p.ta, t:p.t });
    g.msg = { k:'ok', t:'Tarea ' + p.ta + ': ' + TAREAS[p.ta] + '.' };
    g.mano = [];
    if(api){
      if(p.pone) p.pone.forEach((pz, i) => setTimeout(() => api.aparecer(pz), i * 380));
      if(p.foco){ api.enfocar(p.foco); setTimeout(() => api.soltar(), 1500); }
      if(id === 't07') api.vista(0.6, 0.42, 6.8);
    }
    pintar();
  }
  function sacudir(b){ if(!b) return; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
  function correr(){
    clearInterval(tic);
    tic = setInterval(() => { if(!document.body.contains(reloj)){ clearInterval(tic); return; } reloj.textContent = mmss((g.tFin || Date.now()) - g.t0); }, 500);
  }
  function fin(){
    if(!g.tFin){ g.tFin = Date.now(); }
    clearInterval(tic);
    const ms = g.tFin - g.t0;
    reloj.textContent = mmss(ms);
    const aprobada = g.fallasSeg === 0 && g.fallasProd === 0;
    let mejor = tallerMejor();
    let record = false;
    if(aprobada && (!mejor || ms < mejor.seg * 1000)){ mejor = { seg: Math.round(ms / 1000), errores:g.errores }; tallerGuardar(mejor); record = true; }
    if(api){ api.modo({ xray:true }); }
    clear(feed); clear(bita); if(bita.parentElement) bita.parentElement.hidden = true;
    const big = h('b', { class:'lab-big' }, '0');
    clear(res).appendChild(h('div', { class:'t-result ' + (aprobada ? 'ok' : 'crit'), 'data-rv':'' },
      h('div', { class:'row', style:'gap:16px;align-items:center' }, h('span', { class:'vi' }, icon(aprobada ? 'checkCircle' : 'shieldX', 's24')),
        h('div', { class:'stack', style:'--g:2px' }, h('b', { class:'h3' }, aprobada ? 'Instalación en orden.' : 'Llegaste al final, pero el taller no la aprueba.'),
          h('span', { class:'small ink2' }, aprobada ? 'Sin fallas de seguridad ni de producto. Así se mide en la validación: esas dos exigen el 100%.' : 'Tuviste ' + (g.fallasSeg ? g.fallasSeg + ' falla' + (g.fallasSeg > 1 ? 's' : '') + ' de seguridad' : '') + (g.fallasSeg && g.fallasProd ? ' y ' : '') + (g.fallasProd ? g.fallasProd + ' de producto' : '') + '. En la validación real, seguridad y producto exigen el 100%.'))),
      h('div', { class:'t-stats' },
        h('div', null, big, h('span', null, 'tareas en orden')),
        h('div', null, h('b', { class:'num' }, mmss(ms)), h('span', null, record ? 'tu mejor tiempo' : 'tiempo')),
        h('div', null, h('b', { class:'num' }, String(g.errores)), h('span', null, 'intentos fuera de orden o atajos')),
        mejor && !record ? h('div', null, h('b', { class:'num' }, mmss(mejor.seg * 1000)), h('span', null, 'tu mejor tiempo aprobado')) : null),
      h('div', { class:'row' }, btn('Jugar de nuevo', { kind:'action', icon:'refresh', onClick: () => { UI.taller = nuevoJuego(); render(true); } }), linkBtn('Volver al laboratorio', 'laboratorio', { kind:'ghost' }))));
    Motion.contar(big, TALLER_PASOS.length, 900);
    mano.appendChild(res);
  }
  setTimeout(() => {
    if(!document.body.contains(stage)) return;
    const puestos = [];
    for(const id of g.hecho){ const p = TPASO[id]; if(p.pone) puestos.push(...p.pone); }
    api = Lab3D.crear(stage, { auto:true, hotspots:false, interactivo:true, visibles:puestos, etiqueta:'Modelo 3D del auto. Las piezas del kit aparecen a medida que completas las tareas.' });
    stage.appendChild(zoomBtns(api, stage));
    if(g.hecho.length === TALLER_PASOS.length) api.modo({ xray:true });
  }, 0);
  if(g.t0 && !g.tFin) correr();
  if(g.t0) reloj.textContent = mmss((g.tFin || Date.now()) - g.t0);
  pintar();
  const mejor = tallerMejor();

  return page(
    phead({ eyebrow:'Taller · Arma el kit', eic:'wrench', title:'Instala el kit en orden.', lead:'Cada carta es una tarea del duo. Juega la que corresponde: si le falta un paso previo, el taller te frena. Entre las cartas hay atajos que en un taller real terminan en accidente o en una instalación rechazada.',
      actions:[mejor ? h('span', { class:'badge info num' }, icon('clock'), 'Mejor tiempo ' + mmss(mejor.seg * 1000)) : null].filter(Boolean) }),
    h('div', { class:'t-grid' },
      h('div', { class:'t-left' },
        h('div', { class:'lab-frame' }, stage,
          h('div', { class:'t-hud' },
            h('div', null, h('small', null, 'Tareas'), h('span', null, cont, ' / ' + TALLER_PASOS.length)),
            h('div', null, h('small', null, 'Tiempo'), reloj),
            h('div', null, h('small', null, 'Errores'), errs),
            segBox),
          h('div', { class:'t-bar' }, barra)),
        feed),
      h('div', { class:'t-right' }, h('span', { class:'label' }, 'Tu mano'), mano, h('div', { class:'card t-logc', hidden: g.hecho.length === TALLER_PASOS.length || null }, h('span', { class:'label' }, 'Bitácora'), bita))),
    h('div', { class:'lab-note' }, icon('info', 's14'), h('span', null, 'Secuencia de referencia basada en las tareas del duo del informe 1. El procedimiento oficial y sus detalles los entrega Lumine en el taller.')));
};
