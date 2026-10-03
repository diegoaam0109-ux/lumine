/* =====================================================================
   Vista: Producto (portada estilo Cap, con el mundo Lumine adentro)
   ===================================================================== */
'use strict';

/* Perfiles tipo del informe 4 (hipótesis de diseño, no datos medidos) */
const HERO_PERFILES = [
  { id:'mecanico', l:'Mecánico', nombre:'Mecánico automotriz tradicional', skip:['C04','C08','C09','C12','C13','C17','C27'], niv:['NIV-E','NIV-X'], nota:'si demuestra sus 7 estaciones de oficio' },
  { id:'electricista', l:'Electricista', nombre:'Electricista con licencia SEC', skip:['C03','C04','C16','C19','C21'], niv:['NIV-M','NIV-X'], nota:'si demuestra sus 5 estaciones de oficio' },
  { id:'egresado', l:'Egresado', nombre:'Egresado de electromovilidad', skip:['C03','C09','C16','C19'], niv:[], nota:'ejemplo: depende de lo que demuestre en la jornada' }
];

let HERO_TIMER = null;
function heroMock(){
  let idx = 0, manual = false;
  const title = h('div', { class:'h4', style:'color:var(--lw-ink)' });
  const subt = h('div', { class:'lw-note' });
  const statCursar = h('b'), statOficio = h('b'), statNiv = h('b');
  const noteCursar = h('span');
  const tiles = {};
  const rows = [1,2,3,4].map(n => h('div', { class:'cmap-row' }, h('span', { class:'cmap-lv' }, 'N' + n),
    h('div', { class:'cmap-tiles' }, COMP.filter(x => x.n === n).map(x => { const t = tile(x.c); t.setAttribute('data-st', ''); tiles[x.c] = t; return t; }))));
  const chips = h('div', { class:'lw-chips', 'aria-live':'polite' });
  const seg = segmented(HERO_PERFILES.map((p, i) => ({ v:i, l:p.l })), 0, v => { manual = true; stop(); pintar(Number(v)); }, { label:'Perfil tipo' });
  function tween(el, to){
    const from = Number(el.dataset.v || to);
    el.dataset.v = to;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce || from === to){ el.textContent = String(to); return; }
    const t0 = performance.now(), dur = 420;
    const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if(k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function pintar(i){
    idx = i;
    const p = HERO_PERFILES[i];
    title.textContent = p.nombre;
    subt.textContent = 'Perfil tipo del informe 4 · ' + p.nota;
    const skip = new Set(p.skip);
    for(const c of Object.keys(tiles)){ tiles[c].classList.toggle('skip', skip.has(c)); }
    tween(statCursar, 39 - p.skip.length); tween(statOficio, p.skip.length); tween(statNiv, p.niv.length);
    noteCursar.textContent = 'de 39 competencias por cursar';
    clear(chips);
    if(!p.niv.length) chips.appendChild(h('span', { class:'lw-chip' }, icon('check', 's14'), 'Sin nivelación prevista'));
    for(const id of ['NIV-E','NIV-M','NIV-X']){ const on = p.niv.includes(id); if(on) chips.appendChild(h('span', { class:'lw-chip on' }, icon('plus', 's14'), MOD[id].nombre)); }
    Array.from(seg.children).forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
  }
  function stop(){ if(HERO_TIMER){ clearInterval(HERO_TIMER); HERO_TIMER = null; } }
  const box = h('div', { class:'mock', role:'group', 'aria-label':'Maqueta: plan personal según el perfil de entrada' },
    h('div', { class:'mock-bar' }, h('i'), h('i'), h('i'), h('span', { class:'mt' }, 'lumine-habilita · plan personal')),
    h('div', { class:'lw mock-body' },
      h('div', { class:'row sb', style:'gap:12px' }, h('span', { class:'lw-eyebrow' }, 'Plan personal'), seg),
      h('div', { class:'stack', style:'--g:2px' }, title, subt),
      h('div', { class:'lw-stats' },
        h('div', { class:'lw-stat' }, statCursar, noteCursar),
        h('div', { class:'lw-stat' }, statOficio, h('span', null, 'de 11 de oficio que podría saltar')),
        h('div', { class:'lw-stat' }, statNiv, h('span', null, 'módulos de nivelación'))),
      h('div', { class:'cmap', 'data-stagger':'22', 'data-rv':'' }, rows),
      h('div', { class:'cmap-legend' },
        h('span', null, h('i', { class:'tile core' }), 'Core Lumine'), h('span', null, h('i', { class:'tile oficio' }), 'Oficio'),
        h('span', null, h('i', { class:'tile desarrollo' }), 'Desarrollo'), h('span', null, h('i', { class:'tile oficio skip' }), 'Demostrada en la jornada')),
      chips));
  pintar(0);
  stop();
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){
    HERO_TIMER = setInterval(() => { if(manual || !document.body.contains(box)){ stop(); return; } pintar((idx + 1) % HERO_PERFILES.length); }, 4200);
    box.addEventListener('pointerenter', () => { manual = true; stop(); });
    box.addEventListener('focusin', () => { manual = true; stop(); });
  }
  return box;
}

function abrirPlataforma(){
  if(S.build === 'demo' && S.demoRole === 'visitante') return go('login');
  go(homeRoute());
}
function ctaPrincipal(){
  if(S.role === 'admin') return { l:'Abrir el panel', ic:'grid', fn: abrirPlataforma };
  if(S.role === 'tecnico') return { l: S.mine.expediente ? 'Ir a mi ruta' : 'Seguir mi postulación', ic:'route', fn: () => go(homeRoute()) };
  return { l:'Postular ahora', ic:'arrowRight', fn: probarDiagnostico };
}
function irA(id){ const el = document.getElementById(id); if(el) el.scrollIntoView({ behavior: Motion.quieto() ? 'auto' : 'smooth', block:'start' }); }
function probarDiagnostico(){
  if(S.build === 'demo' && S.demoRole === 'visitante') return go('login-registro');
  if(S.role === 'admin') return go('personas');
  go(homeRoute());
}

/* sección: cómo funciona el diagnóstico */
function secDiagnostico(){
  const pasos = [
    { n:1, t:'Antecedentes', where:'Online', ic:'file', d:'El postulante registra formación, certificados y experiencia. La plataforma los cruza con el diccionario.', dec:'Arma un mapa de qué oficio conviene revisar. No salta nada.' },
    { n:2, t:'Prueba de fundamentos', where:'Online', ic:'list', d:'Preguntas por caso de electricidad, mecánica y electrónica automotriz.', dec:'Define qué nivelación necesita. Solo agrega módulos, nunca los quita.' },
    { n:3, t:'Jornada técnica', where:'Presencial', ic:'wrench', pres:true, d:'Circuito de estaciones: herramientas e instrumentos reales, y demostración del oficio que marcó el mapa.', dec:'Confirma la nivelación y decide qué oficio se salta.' },
    { n:4, t:'Plan personal', where:'Online', ic:'route', d:'La plataforma junta los resultados y arma la ruta de cada técnico.', dec:'Cada competencia queda marcada como sabe o no sabe.' }
  ];
  return h('section', { class:'wrap lsec', id:'como', 'data-rv':'' },
    h('div', { class:'center-h' }, eyebrow('Diagnóstico de brecha', 'search'), h('h2', { class:'h1' }, 'Cuatro pasos. Solo uno es presencial.'),
      h('p', { class:'lead' }, 'Lo que se hace online solo puede sumar nivelación. Copiar con IA no sirve de nada: lo único que se consigue es llegar sin base a la validación del taller.')),
    h('div', { class:'steps' }, pasos.map(p => h('div', { class:'card step' + (p.pres ? ' pres' : ''), 'data-tilt':'4' },
      h('div', { class:'row sb' }, h('span', { class:'sn' }, String(p.n)), h('span', { class:'where' }, icon(p.where === 'Presencial' ? 'wrench' : 'monitor', 's14'), p.where)),
      h('h3', { class:'h3' }, p.t), h('p', { class:'small ink2' }, p.d), h('p', { class:'decide' }, p.dec)))),
    h('div', { class:'formula', 'aria-label':'Fórmula del plan personal' },
      h('span', { class:'fx hl' }, 'Plan personal'), h('span', { class:'op' }, '='), h('span', { class:'fx' }, 'Nivelación'), h('span', { class:'op' }, '+'),
      h('span', { class:'fx' }, 'Core completo'), h('span', { class:'op' }, '+'), h('span', { class:'fx' }, 'Oficio no demostrado'), h('span', { class:'op' }, '+'),
      h('span', { class:'fx' }, 'Desarrollo por nivel'), h('span', { class:'op' }, '+'), h('span', { class:'fx' }, 'Refuerzo en lo reprobado')));
}

/* sección: la ruta por niveles (selector tipo Cap) */
function secRuta(){
  const st = ui('prod-nivel', 1);
  const cont = h('div');
  function pintar(n){
    UI['prod-nivel'] = n;
    const N = NIVEL[n];
    const cods = COMP.filter(x => x.n === n);
    const cnt = k => cods.filter(x => x.p === k).length;
    clear(cont).appendChild(h('div', { class:'lvfeat' },
      h('div', { class:'lf-t' },
        eyebrow('Nivel ' + n, N.ic),
        h('h3', { class:'h2' }, N.nombre),
        h('p', { class:'body' }, N.habilita),
        h('dl', { class:'kv' },
          h('dt', null, 'Se cierra con'), h('dd', null, N.valida),
          h('dt', null, 'Valida'), h('dd', null, N.quien),
          h('dt', null, 'Competencias'), h('dd', null, cods.length + ' · ' + cnt('core') + ' core, ' + cnt('oficio') + ' oficio, ' + cnt('desarrollo') + ' desarrollo')),
        h('p', { class:'small muted' }, N.detalle)),
      h('div', { class:'lf-v lw' },
        h('span', { class:'lw-eyebrow' }, cods.length + ' competencias del nivel'),
        h('div', { class:'stack', style:'--g:6px' }, cods.slice(0, n === 2 ? 9 : 8).map(x => h('div', { class:'ctag' + (x.p === 'core' ? ' core' : '') }, codeTag(x.c), h('span', null, x.t)))),
        n === 2 ? h('span', { class:'lw-note' }, 'y 14 más, repartidas en cinco módulos que siguen el orden de una instalación real.') : null)));
  }
  const seg = h('div', { class:'seg', role:'group', 'aria-label':'Nivel' }, NIVELES.map(N => {
    const b = h('button', { type:'button', 'aria-pressed': N.n === st ? 'true' : 'false' }, icon(N.ic, 's16'), 'Nivel ' + N.n);
    b.addEventListener('click', () => { for(const x of seg.children) x.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-pressed', 'true'); pintar(N.n); });
    return b;
  }));
  pintar(st);
  return h('section', { class:'wrap lsec', id:'ruta', 'data-rv':'' },
    h('div', { class:'center-h' }, eyebrow('Ruta de habilitación', 'route'), h('h2', { class:'h1' }, 'Cada nivel habilita algo concreto en el taller.'),
      h('p', { class:'lead' }, 'Todos entran por el nivel 1. Cada nivel se cierra con una sola validación presencial, y lo reprobado se repite solo en esa estación.')),
    h('div', { class:'lvsel' }, seg, cont));
}

/* sección: el nivel 2 sobre el auto (dibujo técnico interactivo) */
const MOD_AUTO = [
  { id:'N2-1', n:1, x:222, y:150, zona:[150,160,190,95] },
  { id:'N2-2', n:2, x:662, y:196, zona:[520,188,190,110] },
  { id:'N2-3', n:3, x:470, y:224, zona:[330,190,300,56] },
  { id:'N2-4', n:4, x:376, y:156, zona:[326,178,100,56] },
  { id:'N2-5', n:5, x:600, y:330, zona:[520,300,160,30] }
];
function secAuto(){
  const sel = ui('prod-mod', 'N2-1');
  const info = h('div', { class:'stack', style:'--g:12px', 'aria-live':'polite' });
  const listBtns = {};
  const hots = {}, zonas = {};
  function pintar(id){
    UI['prod-mod'] = id;
    const m = MOD[id];
    for(const k of Object.keys(hots)){ hots[k].classList.toggle('on', k === id); zonas[k].classList.toggle('on', k === id); listBtns[k].setAttribute('aria-pressed', k === id ? 'true' : 'false'); }
    const grupos = ['core','oficio','desarrollo'].map(p => [p, m.cod.filter(c => C[c].p === p)]).filter(g => g[1].length);
    clear(info).appendChild(frag(
      h('div', { class:'h3' }, 'Módulo ' + id.slice(3) + ' · ' + m.nombre),
      h('p', { class:'small ink2' }, m.resumen),
      grupos.map(([p, cs]) => h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, PRIORIDAD[p].l),
        cs.map(c => h('div', { class:'row nw', style:'align-items:flex-start;gap:8px' }, codeTag(c), h('span', { class:'small' }, C[c].t))))),
      m.ic ? notice('info', 'lock', h('b', null, 'La biblioteca de calibraciones no se guarda en la plataforma. '), 'El módulo enseña a cargarlas y registrarlas; las calibraciones viven fuera, bajo el control de Ingeniería de Calibración.') : null));
  }
  const svg = s('svg', { viewBox:'0 0 800 350', class:'car-svg', role:'img', 'aria-label':'Dibujo técnico del auto con los cinco módulos del nivel 2' },
    s('path', { class:'thin', d:'M30 300 H770' }),
    ...MOD_AUTO.map(z => { const r = s('rect', { class:'zone', x:z.zona[0], y:z.zona[1], width:z.zona[2], height:z.zona[3], rx:12 }); zonas[z.id] = r; return r; }),
    s('path', { class:'body', d:'M70 250 L70 212 Q72 188 102 178 L262 160 Q300 120 350 98 L560 96 Q600 98 640 128 L700 168 Q722 178 724 200 L726 250 L662 250 A62 62 0 0 0 538 250 L242 250 A62 62 0 0 0 118 250 Z' }),
    s('path', { class:'thin', d:'M292 156 L352 108 L450 106 L450 156 Z M466 106 L552 106 Q590 110 616 140 L620 156 L466 156 Z M458 160 L458 246' }),
    s('rect', { x:238, y:186, width:22, height:12, rx:3, fill:'none', stroke:'#8c9aa0', 'stroke-width':1.5 }),
    s('rect', { x:340, y:190, width:72, height:34, rx:7, fill:'#0b0f11', stroke:'#e7eef1', 'stroke-width':2.5 }),
    s('text', { x:376, y:212, 'text-anchor':'middle', fill:'#eef3f5', style:'font:700 13px var(--font)' }, 'ECU'),
    s('rect', { x:530, y:202, width:96, height:30, rx:6, fill:'rgba(34,184,240,.22)', stroke:'#22B8F0', 'stroke-width':2.5 }),
    s('path', { d:'M412 207 C 460 207, 480 220, 530 217', fill:'none', stroke:'#22B8F0', 'stroke-width':2, 'stroke-dasharray':'6 5' }),
    s('path', { d:'M578 232 L 600 250', fill:'none', stroke:'#22B8F0', 'stroke-width':2 }),
    s('g', { class:'front' }, s('circle', { class:'wheel', cx:180, cy:250, r:44 }), s('circle', { class:'hub', cx:180, cy:250, r:15 })),
    s('g', { class:'rear' }, s('circle', { class:'wheel', cx:600, cy:250, r:44 }), s('circle', { class:'hub', cx:600, cy:250, r:15 })),
    s('circle', { cx:578, cy:306, r:9, fill:'none', stroke:'#56666d', 'stroke-width':2 }), s('circle', { cx:622, cy:306, r:9, fill:'none', stroke:'#56666d', 'stroke-width':2 }),
    s('text', { class:'lbl', x:180, y:334, 'text-anchor':'middle' }, 'Eje delantero · combustión'),
    s('text', { class:'lbl', x:744, y:282, 'text-anchor':'end' }, 'Eje trasero · kit eléctrico'),
    ...MOD_AUTO.map(z => {
      const g = s('g', { class:'hot', tabindex:0, role:'button', 'aria-label':'Módulo ' + z.n + ': ' + MOD[z.id].nombre },
        s('circle', { class:'ring', cx:z.x, cy:z.y, r:16 }), s('text', { x:z.x, y:z.y + 4.5, 'text-anchor':'middle' }, String(z.n)));
      g.addEventListener('click', () => pintar(z.id));
      g.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pintar(z.id); } });
      hots[z.id] = g; return g;
    }));
  const lista = h('div', { class:'modlist', role:'group', 'aria-label':'Módulos del nivel 2' }, MOD_AUTO.map(z => {
    const b = h('button', { type:'button', 'aria-pressed':'false' }, h('span', { class:'mn' }, String(z.n)), MOD[z.id].nombre);
    b.addEventListener('click', () => pintar(z.id)); listBtns[z.id] = b; return b;
  }));
  pintar(sel);
  return h('section', { class:'wrap lsec', id:'auto', 'data-rv':'' },
    h('div', { class:'center-h' }, eyebrow('Nivel 2 en detalle', 'car'), h('h2', { class:'h1' }, 'Se aprende cada etapa justo antes de necesitarla.'),
      h('p', { class:'lead' }, 'El nivel 2 concentra 23 de las 39 competencias. Se divide en cinco módulos que siguen el mismo orden que una instalación real sobre el eje trasero.')),
    h('div', { class:'carsec' }, h('div', { class:'car-v lw' }, svg, h('span', { class:'lw-note', style:'text-align:center' }, 'Toca un número para ver el módulo. C36, trabajo en duo, se observa mientras trabaja.')),
      h('div', { class:'car-i' }, lista, h('hr', { class:'divider', style:'margin:4px 0' }), info)));
}

/* sección: pauta sabe o no sabe (evaluación en vivo) */
function secPauta(){
  const items = [
    { c:'C15', r:'s' }, { c:'C16', r:'s' }, { c:'C19', r:'n' }, { c:'C21', r:'s' },
    { c:'C09', r:'s' }, { c:'C12', r:'s' }, { c:'C27', r:'s' }
  ];
  const est = ui('prod-pauta', Object.fromEntries(items.map(i => [i.c, i.r])));
  const verd = h('div', { 'aria-live':'polite' });
  function pintarV(){
    const ev = evaluar(items.map(i => ({ c:i.c, r: est[i.c] })), params().umbralComp);
    clear(verd).appendChild(h('div', { class:'verdict ' + (ev.aprobado ? 'ok' : 'crit') },
      h('span', { class:'vi' }, icon(ev.aprobado ? 'check' : 'refresh', 's20')),
      h('div', null, h('b', null, ev.aprobado ? 'Aprobado' : 'Repite solo: ' + ev.fallidas.join(', ')),
        h('div', { class:'small ink2' }, 'Seguridad y producto: ' + ev.crit.ok + ' de ' + ev.crit.total + ' (exige todas). Complementarias: ' + ev.comp.ok + ' de ' + ev.comp.total + ' (exige ' + ev.comp.req + ').'))));
  }
  const rows = items.map(i => {
    const x = C[i.c];
    const yn = h('div', { class:'yn', role:'group', 'aria-label':'Resultado de ' + i.c });
    const mk = (v, l, ic) => { const b = h('button', { type:'button', class:v, 'aria-pressed': est[i.c] === v ? 'true' : 'false' }, icon(ic, 's14'), l); b.addEventListener('click', () => { est[i.c] = v; for(const y of yn.children) y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); pintarV(); }); return b; };
    yn.appendChild(mk('s', 'Sabe', 'check')); yn.appendChild(mk('n', 'No sabe', 'x'));
    return h('div', { class:'prow' }, h('div', { class:'pt' }, codeTag(i.c), h('div', null, h('div', { class:'txt' }, x.t), h('div', { class:'meta' }, critTag(x.k), badge(VALIDA[x.v], 'line')))), yn);
  });
  pintarV();
  return h('section', { class:'wrap lsec', id:'pauta', 'data-rv':'' },
    h('div', { class:'grid g2', style:'--g:40px;align-items:start' },
      h('div', { class:'stack pauta-l', style:'--g:18px' },
        eyebrow('Validación presencial', 'clipboard'),
        h('h2', { class:'h1' }, 'Sabe o no sabe. Sin notas intermedias.'),
        h('p', { class:'body' }, 'Cada competencia se responde con un sí o un no. La criticidad decide cuánto se exige, y quien falla una estación repite esa estación, no la validación completa.'),
        h('div', { class:'rules3' },
          h('div', { class:'rule' }, h('b', null, '100%'), h('span', { class:'small ink2' }, 'Seguridad')),
          h('div', { class:'rule' }, h('b', null, '100%'), h('span', { class:'small ink2' }, 'Producto')),
          h('div', { class:'rule' }, h('b', null, params().umbralComp + '%'), h('span', { class:'small ink2' }, 'Complementarias'))),
        h('p', { class:'hint' }, 'Nadie valida a su compañero de duo. Lo externo se valida en banco genérico, así la parte externa nunca ve el producto.')),
      h('div', { class:'stack', style:'--g:12px' }, h('span', { class:'label' }, 'Prueba la pauta: ejemplo del nivel 2'), h('div', { class:'pauta' }, rows), verd)));
}

/* sección: perfiles de usuario */
function secRoles(){
  return h('section', { class:'wrap lsec', id:'roles', 'data-rv':'' },
    h('div', { class:'center-h' }, eyebrow('Permisos', 'lock'), h('h2', { class:'h1' }, 'Cada uno ve solo lo que necesita.'),
      h('p', { class:'lead' }, 'Las reglas las aplica la base de datos, no la pantalla. Un técnico no puede leer el expediente de otro aunque lo intente.')),
    h('div', { class:'grid g4' }, ROLES_INFO.map(r => h('div', { class:'card rolecard', 'data-tilt':'5' },
      h('span', { class:'ri' }, icon(r.ic)), h('h3', { class:'h4' }, r.n), h('p', { class:'small ink2' }, r.hace),
      h('p', { class:'nv' }, icon(r.nove === 'No aplica' ? 'check' : 'eye', 's16'), h('span', null, r.nove === 'No aplica' ? 'Ve todo el sistema' : 'No ve: ' + r.nove.toLowerCase()))))),
    h('div', { class:'row', style:'justify-content:center;margin-top:22px' },
      btn('Ver los 20 controles de seguridad', { kind:'ghost', icon:'shieldCheck', onClick: () => openSheet('Seguridad antes de lanzar', () => panelSeguridad(true), { wide:true }) })));
}

/* sección: indicadores */
function secIndicadores(){
  return h('section', { class:'wrap lsec', id:'indicadores-prev', 'data-rv':'' },
    h('div', { class:'center-h' }, eyebrow('Indicadores', 'chart'), h('h2', { class:'h1' }, 'Ocho números para saber si el sistema funciona.'),
      h('p', { class:'lead' }, 'Todos salen de datos que la misma plataforma registra, y alimentan la perspectiva de aprendizaje y crecimiento del Cuadro de Mando Integral.')),
    h('div', { class:'grid g4' }, INDICADORES.map((ind, i) => h('div', { class:'card stack', style:'--g:8px', 'data-tilt':'4' },
      h('span', { class:'mono muted xs' }, String(i + 1).padStart(2, '0')), h('h3', { class:'h4' }, ind.n), h('p', { class:'small ink2' }, ind.q)))));
}

function secCTA(){
  return h('section', { class:'wrap lsec', 'data-rv':'' }, h('div', { class:'ctawash' }, h('div', { class:'ctacard lw' },
    h('span', { class:'lw-eyebrow' }, 'Lumine Habilita'),
    h('h2', null, 'El técnico que Lumine necesita no se contrata. Se forma.'),
    h('p', null, 'El perfil que combina mecánica automotriz y alta tensión no existe formado en Chile. Esta plataforma lo produce adentro, midiendo primero la brecha y formando solo lo que falta.'),
    (() => { const c = ctaPrincipal(); return h('div', { class:'hero-ctas' }, h('span', { 'data-mag':'0.25' }, btn(c.l, { kind:'action', size:'lg', icon:c.ic, onClick: c.fn })), h('a', { class:'linkbtn', href:'#sistema' }, 'Conoce el sistema completo')); })(),
    h('span', { class:'em emblem', 'aria-hidden':'true' }))));
}

/* sección: franja en movimiento con el oficio */
function secMarquee(){
  const items = ['Alta tensión segura', 'Diagnóstico con OBD', 'Montaje en el eje trasero', 'Banco de baterías', 'Aislación con megóhmetro', 'Energización controlada', 'Termografía', 'Calibración desde la biblioteca', 'Dinamómetro', 'Trabajo en duo', 'Sabe o no sabe'];
  const fila = () => h('div', { class:'mq-row', 'aria-hidden':'true' }, items.map(t => h('span', { class:'mq-i' }, h('i', { class:'mq-dot' }), t)));
  return h('section', { class:'mq', 'aria-label':'Lo que aprende el técnico' }, h('p', { class:'sr' }, items.join(', ')), h('div', { class:'mq-track' }, fila(), fila()));
}

/* sección: el plan personal (maqueta animada por perfil) */
function secPlan(){
  return h('section', { class:'wrap lsec', id:'plan', 'data-rv':'' },
    h('div', { class:'grid g2 plan2', style:'--g:48px;align-items:center' },
      h('div', { class:'stack', style:'--g:16px' }, eyebrow('Plan personal', 'route'),
        h('h2', { class:'h1 xl' }, 'Cada técnico parte desde donde viene.'),
        h('p', { class:'body ink2' }, 'Un mecánico ya domina el tren trasero. Un electricista ya mide aislación. La plataforma marca qué oficio conviene demostrar en la jornada y solo forma lo que falta. Cambia el perfil y mira cómo se mueve el mapa de 39 competencias.'),
        h('p', { class:'hint' }, 'Perfiles tipo del informe 4. Son hipótesis de diseño, no datos medidos.')),
      h('div', { 'data-tilt':'3' }, heroMock())));
}

/* sección: aprender con las manos (laboratorio y taller) */
function secExperiencia(){
  const tarjeta = (o) => h('a', { class:'xp-card', href:'#' + o.go, 'data-tilt':'5', 'data-rv':'' },
    h('div', { class:'xp-art ' + o.art, 'aria-hidden':'true' }, o.arte),
    h('div', { class:'xp-t' }, h('span', { class:'xp-k' }, icon(o.ic, 's16'), o.k), h('h3', { class:'h2' }, o.t), h('p', { class:'small ink2' }, o.d),
      h('span', { class:'xp-go' }, o.cta, icon('arrowRight', 's16'))));
  const cartas = h('div', { class:'xp-mini' }, ['0.1 Roles', '1.1 Elegibilidad', '2.2 Motor', '3.1 Aislación'].map((t, i) => h('span', { style:'--i:' + i }, h('b', { class:'mono' }, t.split(' ')[0]), t.split(' ').slice(1).join(' '))));
  const POS = [[7,16],[50,10],[12,48],[54,42],[28,74]];
  const nodos = h('div', { class:'xp-nodes' }, PIEZAS.slice(0, 5).map((p, i) => h('span', { class:'xp-node', style:'--i:' + i + ';left:' + POS[i][0] + '%;top:' + POS[i][1] + '%' }, h('i'), p.n)));
  return h('section', { class:'wrap lsec', id:'aprender' },
    h('div', { class:'center-h', 'data-rv':'' }, eyebrow('Aprender con las manos', 'cube'), h('h2', { class:'h1 xl' }, 'Antes del taller, conoce la máquina.'),
      h('p', { class:'lead' }, 'Nadie aprende alta tensión leyendo una lista. Por eso la formación online trae un laboratorio 3D del kit y un taller para armarlo en orden, con las mismas reglas que se exigen en la validación.')),
    h('div', { class:'xp-grid' },
      tarjeta({ go:'laboratorio', art:'lab', arte:nodos, ic:'cube', k:'Laboratorio 3D', t:'Gira el auto. Mira a través.', d:'Rayos X, despiece y una prueba para encontrar cada pieza. Cada una muestra qué cuidar y en qué competencia se aprende.', cta:'Abrir el laboratorio' }),
      tarjeta({ go:'taller', art:'taller', arte:cartas, ic:'wrench', k:'Taller · Arma el kit', t:'Diecinueve tareas. Un orden.', d:'Juega las cartas en el orden del duo. Los atajos inseguros aparecen como trampas: uno solo y la instalación no se aprueba.', cta:'Entrar al taller' })));
}

/* portada: escenario 3D con interfaz flotante */
function heroEscena(){
  const stage = h('div', { class:'lab-stage hero-stage' });
  const flot = (cls, px, ...kids) => h('div', { class:'float-ui ' + cls, 'data-px': px }, ...kids);
  const ui1 = flot('f1', '0.6', h('small', null, 'Kit Lumine'), h('b', null, 'Eje trasero'), h('span', null, 'El motor original queda intacto'));
  const ui2 = flot('f2', '1.1', h('small', null, 'Validación'), h('b', null, 'Sabe o no sabe'), h('span', { class:'f-yn' }, h('i', { class:'s' }, icon('check', 's14'), 'Sabe'), h('i', null, icon('x', 's14'), 'No sabe')));
  const ui3 = flot('f3', '0.85', h('small', null, 'Ruta'), h('b', { class:'num' }, '39 competencias'), h('span', { class:'f-lv' }, [1,2,3,4].map(n => h('i', { style:'--w:' + COMP.filter(x => x.n === n).length }, 'N' + n))));
  setTimeout(() => {
    if(!document.body.contains(stage)) return;
    const api = Lab3D.crear(stage, { auto:true, hotspots:false, interactivo:true, xray:true, etiqueta:'Modelo 3D de un auto genérico con el kit en el eje trasero, en vista de rayos X' });
    api.vista(-0.95, 0.28, 7.2);
  }, 0);
  return h('div', { class:'hero-vis', 'data-rv':'' },
    h('div', { class:'lab-frame hero-frame' }, stage, h('a', { class:'hero-3d', href:'#laboratorio' }, icon('cube', 's16'), 'Explorar en 3D')),
    ui1, ui2, ui3);
}

/* recorrido: el kit se arma en 3D mientras se baja por la página */
const HISTORIA = [
  { k:'El punto de partida', t:'El auto llega tal como es.', d:'Motor a combustión y tracción delantera, sin cambios. El kit se suma: no reemplaza nada del auto original.', piezas:[], foco:'combustion', vista:[-1.2, 0.3, 7.4] },
  { k:'Eje trasero', t:'Motor eléctrico y frenado regenerativo.', d:'Asisten al auto y recuperan energía al frenar. El freno, el ABS y el control de estabilidad originales siempre mandan.', piezas:['motor','regen'], foco:'motor' },
  { k:'Energía', t:'El banco de baterías.', d:'Se monta con elevador, sin golpes. Una batería golpeada se aísla y se vigila, aunque se vea normal.', piezas:['bateria'], foco:'bateria' },
  { k:'Alta tensión', t:'El cableado naranja.', d:'Rutas, fijaciones y protecciones antes de conectar. Se mide la aislación con megóhmetro y se revisa con termografía al energizar.', piezas:['cables'], foco:'cables' },
  { k:'El cerebro', t:'La unidad de control con IA.', d:'Decide cuándo asiste el motor eléctrico y corta el torque ante patinaje, falla o sobretemperatura.', piezas:['ecu'], foco:'ecu' },
  { k:'Sabe o no sabe', t:'Cada paso se aprende y se valida.', d:'39 competencias, cuatro niveles y una validación presencial por nivel. Lo online enseña; el nivel se gana en el taller.', piezas:[], foco:null, xray:true }
];
function secHistoria(){
  const stage = h('div', { class:'lab-stage hist-stage' });
  const pasos = HISTORIA.map((p, i) => h('div', { class:'hist-paso' + (i === 0 ? ' on' : ''), dataset:{ i:String(i) } },
    h('span', { class:'hist-n' }, String(i + 1).padStart(2, '0') + ' · ' + p.k), h('h3', { class:'hist-t' }, p.t), h('p', { class:'body ink2' }, p.d)));
  const dots = h('div', { class:'hist-dots', 'aria-hidden':'true' }, HISTORIA.map((_, i) => h('i', { class: i === 0 ? 'on' : '' })));
  let api = null, actual = -1;
  const activar = i => {
    if(i === actual || !api) return;
    actual = i;
    pasos.forEach((el, j) => el.classList.toggle('on', j === i));
    Array.from(dots.children).forEach((el, j) => el.classList.toggle('on', j <= i));
    const vis = HISTORIA.slice(0, i + 1).flatMap(x => x.piezas);
    api.mostrar(vis);
    HISTORIA[i].piezas.forEach((pz, k) => setTimeout(() => api.aparecer(pz), k * 300));
    api.modo({ xray: !!HISTORIA[i].xray || i > 0 && i < 5 });
    if(HISTORIA[i].foco){ api.enfocar(HISTORIA[i].foco); } else { api.soltar(); api.vista(-0.75, 0.32, 7.6); }
    if(HISTORIA[i].vista) api.vista(...HISTORIA[i].vista);
  };
  setTimeout(() => {
    if(!document.body.contains(stage)) return;
    api = Lab3D.crear(stage, { auto:false, hotspots:false, interactivo:true, visibles:[], etiqueta:'Recorrido 3D: el kit Lumine se arma pieza por pieza en el eje trasero de un auto genérico' });
    activar(0);
    if(window.IntersectionObserver){
      const io = new IntersectionObserver(es => { for(const e of es) if(e.isIntersecting) activar(Number(e.target.dataset.i)); }, { rootMargin: window.matchMedia && matchMedia('(max-width:860px)').matches ? '-66% 0px -24% 0px' : '-45% 0px -45% 0px' });
      pasos.forEach(p => io.observe(p));
    }
  }, 0);
  return h('section', { class:'wrap lsec hist', id:'historia' },
    h('div', { class:'center-h', 'data-rv':'' }, eyebrow('El kit, pieza por pieza', 'cube'), h('h2', { class:'h1 xl' }, 'Baja y míralo armarse.'),
      h('p', { class:'lead' }, 'Esto es lo que aprende a instalar un técnico de Lumine, en el mismo orden en que se hace en el taller.')),
    h('div', { class:'hist-grid' },
      h('div', { class:'hist-sticky' }, h('div', { class:'lab-frame' }, stage, dots)),
      h('div', { class:'hist-pasos' }, pasos)));
}

VIEWS.inicio = function(){
  const c = ctaPrincipal();
  const hero = h('section', { class:'wrap hero hero2' },
    h('div', { class:'hero-t', 'data-rv':'' },
      eyebrow('Técnico instalador · Lumine Motors', 'bolt'),
      h('h1', { class:'mega' }, h('span', { class:'mg-l' }, 'Forma solo'), h('span', { class:'mg-l' }, 'lo que ', h('span', { class:'sp' }, 'falta.'))),
      h('p', { class:'lead' }, 'Diagnosticamos lo que ya sabes, armamos tu ruta y validamos en el taller. Lo online enseña. El nivel se gana con las manos.'),
      h('div', { class:'hero-ctas' },
        h('span', { 'data-mag':'0.25' }, btn(c.l, { kind:'action', size:'lg', icon:c.ic, onClick: c.fn })),
        h('button', { type:'button', class:'linkbtn hero-ver', on:{ click: () => irA('historia') } }, icon('chevDown', 's16'), 'Mira cómo funciona')),
      h('div', { class:'trust' }, h('span', { class:'cap' }, 'Construido sobre referencias reales'),
        h('div', { class:'marks' }, h('span', { class:'mk' }, 'O*NET ', h('small', null, '49-3023.00')), h('span', { class:'mk' }, 'SEC ', h('small', null, 'RIC N°17')), h('span', { class:'mk' }, 'DGUV ', h('small', null, '209-093')), h('span', { class:'mk' }, 'IMI ', h('small', null, 'TechSafe'))))),
    heroEscena());
  return frag(hero, secMarquee(), secHistoria(), secDiagnostico(), secPlan(), secExperiencia(), secCTA());
};

/* Conoce el sistema: el detalle que antes alargaba la portada */
VIEWS.sistema = function(){
  return frag(
    h('div', { class:'wrap page', style:'padding-bottom:0' }, phead({ eyebrow:'Conoce el sistema', eic:'book', title:'Cómo funciona Lumine Habilita', lead:'Niveles, módulos del nivel 2, la pauta de validación, quién ve qué y los indicadores. Para quien quiere el detalle.',
      actions:[ linkBtn('Volver a la portada', 'inicio', { kind:'ghost' }) ] }),
      h('nav', { class:'filters', 'aria-label':'Secciones' }, [['ruta','Niveles'],['auto','Nivel 2'],['pauta','Validación'],['roles','Permisos'],['indicadores-prev','Indicadores']].map(([id, l]) => h('button', { type:'button', class:'chip', on:{ click: () => irA(id) } }, l)))),
    secRuta(), secAuto(), secPauta(), secRoles(), secIndicadores(),
    h('section', { class:'wrap lsec', 'data-rv':'' }, h('div', { class:'card' }, h('h2', { class:'h4', style:'margin-bottom:10px' }, 'Fuentes'), h('ul', { style:'list-style:none;display:flex;flex-direction:column;gap:8px' }, FUENTES.map(([t, u]) => h('li', null, h('a', { href:u, target:'_blank', rel:'noopener noreferrer', class:'small' }, t)))))),
    secCTA());
};
