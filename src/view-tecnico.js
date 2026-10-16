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

/* ---------- lenguaje de taller: el técnico ve temas, no códigos ---------- */
function temaCorto(c){ const t = C[c] ? C[c].t : String(c); return t.length > 64 ? t.slice(0, 62).replace(/[ ,;:]+[^ ]*$/, '') + '…' : t; }
const EST_T = { skip:['Demostrada','ok'], done:['Aprobada','ok'], fail:['Repasar','crit'], lock:['Más adelante','line'], '':['Por aprender','info'] };
function avanceNivel(e, k){ const cs = COMP.filter(x => x.n === k); return { ok: cs.filter(x => ['done','skip'].includes(estadoMio(e, x.c))).length, total: cs.length }; }
function primeraFrase(t){ const i = String(t).indexOf('. '); return i > 0 ? t.slice(0, i + 1) : t; }

/* ---------- siguiente paso: una sola acción principal ---------- */
function siguientePaso(e){
  const n = e.nivel || 0, sig = n < 4 ? n + 1 : null;
  const prox = (e.proximas || [])[0];
  if(e.etapa === 'postulante') return { k:'info', ic:'clock', ey:'Diagnóstico', t:'Siguiente: jornada técnica presencial', d:'El Responsable Técnico te avisará la fecha. Mientras, conoce el kit en el laboratorio 3D.', cta:['Abrir el laboratorio', 'laboratorio'] };
  if(e.suspendidoAT) return { k:'crit', ic:'shieldX', ey:'Alta tensión suspendida', t:'Repasa la seguridad y revalida', d:'No bajas de nivel. Vuelves a trabajar con alta tensión cuando apruebes la revalidación de seguridad.', cta:['Repasar seguridad', 'modulo-N1-1'] };
  if(prox){ const dd = diffDays(S.hoy, prox.fecha); return { k:'ok', ic:'calendar', ey:'Próxima validación · ' + (dd === null ? '' : relDias(dd)), t: (TIPOS_SESION[prox.tipo] || { l:prox.tipo }).l, d: fechaLarga(prox.fecha) + '. Es presencial: llega con tu práctica al día.', cta:['Repasar mis módulos', 'modulos'] }; }
  if(e.repetir && e.repetir.length) return { k:'warn', ic:'refresh', ey:'Para tu próxima fecha', t: e.repetir.length === 1 ? 'Repasa un tema' : 'Repasa ' + e.repetir.length + ' temas', d: e.repetir.map(temaCorto).join(' · '), cta:['Repasar', 'modulos'] };
  if(sig){
    const lp = listoParaPresentarse(sig, planMio(e), miAv());
    if(!lp.listo){ const mid = lp.faltan[0]; const hechos = lp.total - lp.faltan.length; return { k:'action', ic:'play', ey:'Nivel ' + sig + ' · ' + hechos + ' de ' + lp.total + ' módulos', t:'Continúa con ' + MOD[mid].nombre, d: MOD[mid].resumen, cta:['Continuar', 'modulo-' + mid], prog: lp.total ? hechos / lp.total : 0 }; }
    return { k:'ok', ic:'check', ey:'Nivel ' + sig, t:'Ya puedes presentarte a tu validación', d:'Completaste la práctica online. Pide fecha al Responsable Técnico: ' + NIVEL[sig].valida.toLowerCase() + '.', cta:['Ver mi credencial', null], prog:1 };
  }
  return { k:'ok', ic:'grad', ey:'Nivel 4', t:'Eres formador', d:'Enseñas, validas a otros y firmas revisiones cruzadas.', cta: esFormador() ? ['Ver mi agenda', 'agenda'] : ['Ver mi credencial', null] };
}
function anillo(valor, total, etiqueta){
  const r = 54, L = 2 * Math.PI * r, frac = total ? valor / total : 0;
  const arco = s('circle', { class:'ring-v', cx:64, cy:64, r, 'stroke-dasharray': L.toFixed(1), 'stroke-dashoffset': L.toFixed(1) });
  setTimeout(() => { arco.style.strokeDashoffset = (L * (1 - frac)).toFixed(1); }, 80);
  return h('div', { class:'ring', role:'img', 'aria-label': valor + ' de ' + total + ' ' + etiqueta },
    s('svg', { viewBox:'0 0 128 128', 'aria-hidden':'true' }, s('circle', { class:'ring-b', cx:64, cy:64, r }), arco),
    h('div', { class:'ring-t', 'aria-hidden':'true' }, h('b', { class:'num' }, String(valor)), h('span', null, 'de ' + total)));
}

/* ---------- MI RUTA ---------- */
VIEWS.ruta = function(){
  if(!cargado(['expediente','avance','params','solicitud'])) return vistaCargando();
  const e = miExp();
  if(!e) return page(phead({ title:'Aún no tienes expediente', lead:'Postula para empezar tu diagnóstico.' }), linkBtn('Postular', 'postular', { kind:'action', arrow:true }));
  revisarCelebracion(e);
  const n = e.nivel || 0, sig = n < 4 ? n + 1 : null;
  const paso = siguientePaso(e);
  const rv = e.revalidacion || { estado:'na' };
  const hecho = COMP.filter(x => ['done','skip'].includes(estadoMio(e, x.c))).length;
  const cta = paso.cta[1] ? linkBtn(paso.cta[0], paso.cta[1], { kind:'action', size:'lg', arrow:true }) : btn(paso.cta[0], { kind:'action', size:'lg', icon:'shieldCheck', onClick: abrirCredencial });
  const heroPaso = h('div', { class:'next-card ' + paso.k, 'data-rv':'' },
    h('div', { class:'row', style:'gap:10px' }, h('span', { class:'next-ic' }, icon(paso.ic, 's20')), h('span', { class:'next-ey' }, paso.ey)),
    h('h2', { class:'next-t' }, paso.t), h('p', { class:'next-d' }, paso.d),
    paso.prog !== undefined ? h('div', { class:'progress', role:'progressbar', 'aria-valuemin':'0', 'aria-valuemax':'100', 'aria-valuenow': String(Math.round(paso.prog * 100)), 'aria-label':'Avance de la práctica del nivel' }, h('i', { style:'width:' + Math.round(paso.prog * 100) + '%' })) : null,
    h('div', { class:'row' }, cta));
  const anilloCard = h('div', { class:'card ring-card', 'data-rv':'' }, anillo(hecho, COMP.length, 'competencias listas'),
    h('div', { class:'stack', style:'--g:8px;min-width:0;flex:1' }, h('b', null, 'Competencias listas'),
      [1,2,3,4].map(k => { const a = avanceNivel(e, k); return h('div', { class:'lvbar' + (k <= n ? ' ok' : k === sig ? ' now' : '') }, h('span', { class:'small' }, 'N' + k), h('span', { class:'progress' }, h('i', { style:'width:' + Math.round(100 * a.ok / a.total) + '%' })), h('span', { class:'xs muted num' }, a.ok + '/' + a.total)); })));
  const credMini = h('button', { type:'button', class:'card tile-card cred-mini', on:{ click: abrirCredencial } },
    h('span', { class:'label' }, 'Tu credencial'), e.credencial ? frag(h('span', { class:'row', style:'gap:8px' }, icon('shieldCheck', 's20'), h('b', null, 'Nivel ' + n)), h('span', { class:'hint mono' }, e.credencial)) : h('span', { class:'small muted' }, 'Se emite al validar el nivel 1.'), h('span', { class:'tile-go' }, 'Ver', icon('arrowRight', 's14')));
  const niveles = h('div', { class:'stack', style:'--g:8px' }, [1,2,3,4].map(k => { const a = avanceNivel(e, k);
    return h('details', { class:'disc lvl', open: k === (sig || 4) ? true : null },
      h('summary', null, h('span', { class:'row nw', style:'gap:12px;min-width:0;flex:1' }, h('span', { class:'lvl-n' + (k <= n ? ' ok' : '') }, k <= n ? icon('check', 's14') : String(k)), h('span', { class:'stack', style:'--g:2px;min-width:0' }, h('b', { class:'small' }, NIVEL[k].nombre), h('span', { class:'hint' }, a.ok + ' de ' + a.total + ' listas'))), icon('chevDown')),
      h('div', { class:'dbody stack', style:'--g:6px' }, COMP.filter(x => x.n === k).map(x => { const st = estadoMio(e, x.c); return h('div', { class:'crow tema' }, h('span', { class:'dot ' + (st === 'done' || st === 'skip' ? 'ok' : st === 'fail' ? 'crit' : st === 'lock' ? '' : 'spark') }), h('span', { class:'ct' }, x.t), badge(EST_T[st][0], EST_T[st][1])); }))); }));
  return page(
    h('header', { class:'ruta-hero' },
      h('div', { class:'stack', style:'--g:16px;min-width:0' },
        h('div', { class:'stack', style:'--g:8px' }, eyebrow(e.demo ? 'Expediente ficticio de demostración' : 'Tu ruta de habilitación', 'route'),
          h('h1', { class:'h1 xl' }, 'Hola, ' + (e.nombre || '').split(' ')[0]),
          h('div', { class:'row', style:'gap:8px' }, nivelBadge(n), n ? h('span', { class:'small ink2' }, primeraFrase(NIVEL[n].habilita)) : h('span', { class:'small ink2' }, 'Todos parten por el nivel 1.'))),
        heroPaso),
      anilloCard),
    h('div', { class:'card', style:'--pad:18px;margin:18px 0' }, trackNiveles(n, e.fechasNivel)),
    h('div', { class:'grid g4 keep2', style:'--g:12px' },
      h('div', { class:'card stack tile-card', style:'--g:8px' }, h('span', { class:'label' }, 'Tu duo', ayuda('Todo el trabajo técnico se hace en pareja: uno ejecuta y el otro es encargado de seguridad.')), e.duo ? frag(h('div', { class:'row nw', style:'gap:10px' }, avatar(e.duo.companero), h('div', { style:'min-width:0' }, h('b', { class:'small' }, e.duo.companero), h('div', { class:'hint' }, 'Nivel ' + e.duo.companeroNivel + ' · desde ' + fechaCorta(e.duo.desde)))), bloqueRotacion(e)) : frag(h('p', { class:'small muted' }, n >= 1 ? 'Sin duo asignado.' : 'Entras a un duo al validar el nivel 1.'), bloqueRotacion(e))),
      h('div', { class:'card stack tile-card', style:'--g:8px' }, h('span', { class:'label' }, 'Revalidación de seguridad', ayuda('Cada ' + params().revalidacionMeses + ' meses vuelves a demostrar lo esencial de seguridad. El resto de tu nivel no vence.')), rv.estado === 'na' ? h('p', { class:'small muted' }, 'Aplica desde el nivel 1.') : frag(h('b', { class:'h3' }, fechaCorta(rv.vence)), badge(rv.estado === 'vencida' ? 'Vencida' : rv.estado === 'pronto' ? 'Vence ' + relDias(rv.dias) : 'Vigente', rv.estado === 'vencida' ? 'crit' : rv.estado === 'pronto' ? 'warn' : 'ok'))),
      credMini,
      h('div', { class:'card stack tile-card', style:'--g:8px' }, h('span', { class:'label' }, 'Bono por avance', ayuda('Se paga por cada nivel que validas en el taller, nunca por la nota de la práctica online.')), (e.bono || []).length ? e.bono.map(b => h('div', { class:'row sb small' }, h('span', null, 'Nivel ' + b.n), h('b', null, b.monto === null ? 'Por definir' : clp(b.monto)))) : h('p', { class:'small muted' }, 'Se gana por nivel validado.'))),
    h('section', { class:'section' }, h('div', { class:'section-h' }, h('h2', { class:'h3' }, 'Lo que vas aprendiendo'), h('span', { class:'hint' }, hecho + ' de ' + COMP.length + ' listas')), niveles),
    (e.historial || []).length ? h('section', { class:'section' }, h('h2', { class:'h3', style:'margin-bottom:12px' }, 'Tu historial'), tablaDe(['Validación','Intento','Fecha','Resultado'], e.historial.slice().reverse().map(x => [TIPOS_SESION[x.tipo] ? TIPOS_SESION[x.tipo].l : x.tipo, x.intento === 1 ? '1 · primera nota' : String(x.intento), fechaCorta(x.fecha), badge(x.aprobado ? 'Aprobada' : 'Repasar ' + (x.fallidas || []).length + ((x.fallidas || []).length === 1 ? ' tema' : ' temas'), x.aprobado ? 'ok' : 'crit')]))) : null);
};

/* ---------- avisos del técnico (se calculan de su expediente; lo leído queda en este navegador) ---------- */
function avisosTecnico(){
  const e = miExp(); if(!e) return [];
  const out = [];
  const n = e.nivel || 0;
  for(const p of (e.proximas || [])) out.push({ id:'val-' + p.tipo + '-' + p.fecha, ic:'calendar', k:'info', t:'Validación programada: ' + ((TIPOS_SESION[p.tipo] || {}).l || p.tipo), d: fechaLarga(p.fecha) + ' (' + relDias(diffDays(S.hoy, p.fecha)) + ').', go:'ruta' });
  if(n >= 1 && e.fechasNivel && e.fechasNivel[n] && diffDays(e.fechasNivel[n], S.hoy) <= 30) out.push({ id:'nivel-' + n, ic:'grad', k:'ok', t:'Validaste el nivel ' + n + ': ' + NIVEL[n].nombre, d:'Tu credencial ya muestra el nivel nuevo.', cred:true });
  if(e.rotacion && e.rotacion.fecha && diffDays(e.rotacion.fecha, S.hoy) <= 30) out.push({ id:'rot-' + e.rotacion.id + '-' + e.rotacion.estado, ic:'duo', k: e.rotacion.estado === 'aprobada' ? 'ok' : 'warn', t:'Tu solicitud de rotación fue ' + (e.rotacion.estado === 'aprobada' ? 'aprobada' : 'rechazada'), d: e.rotacion.respuesta || (e.rotacion.estado === 'aprobada' ? 'El Responsable Técnico te asignará tu nuevo duo.' : 'Sin comentario.'), go:'ruta' });
  const rv = e.revalidacion || {};
  if(rv.estado === 'vencida' || rv.estado === 'pronto') out.push({ id:'rev-' + rv.vence + '-' + rv.estado, ic:'shield', k: rv.estado === 'vencida' ? 'crit' : 'warn', t: rv.estado === 'vencida' ? 'Tu revalidación de seguridad venció' : 'Tu revalidación de seguridad vence ' + relDias(rv.dias), d:'Fecha: ' + fechaLarga(rv.vence) + '. Repasa los módulos de seguridad.', go:'modulo-N1-1' });
  if(e.suspendidoAT) out.push({ id:'susp', ic:'shieldX', k:'crit', t:'Estás suspendido de alta tensión', d:'Vuelves cuando apruebes la revalidación de seguridad.', go:'ruta' });
  if(e.repetir && e.repetir.length) out.push({ id:'rep-' + e.repetir.join('.'), ic:'refresh', k:'warn', t:'Tienes ' + (e.repetir.length === 1 ? 'un tema' : e.repetir.length + ' temas') + ' por repasar', d: e.repetir.map(temaCorto).join(' · '), go:'modulos' });
  return out;
}
const AVISOS_KEY = () => 'lh-avisos-' + (S.me.id || 'anon');
function avisosVistos(){ try { return new Set(JSON.parse(localStorage.getItem(AVISOS_KEY()) || '[]')); } catch(x){ return new Set(); } }
function marcarAvisosVistos(ids){ try { localStorage.setItem(AVISOS_KEY(), JSON.stringify(ids.slice(-60))); } catch(x){} }
function campanaAvisos(){
  const k = roleKeys();
  if(!(k.has('tecnico')) || !S.loaded.has('expediente')) return null;
  const av = avisosTecnico(), vistos = avisosVistos();
  const nuevos = av.filter(a => !vistos.has(a.id)).length;
  const b = h('button', { type:'button', class:'btn btn-quiet icon bell', 'aria-label': nuevos ? 'Avisos: ' + nuevos + ' nuevos' : 'Avisos' }, icon('bell', 's20'), nuevos ? h('span', { class:'bell-n', 'aria-hidden':'true' }, String(nuevos)) : null);
  b.addEventListener('click', () => {
    const lista = avisosTecnico();
    marcarAvisosVistos(lista.map(a => a.id));
    openSheet('Avisos', close => lista.length ? h('div', { class:'stack', style:'--g:8px' }, lista.map(a => {
      const ir = () => { close(); if(a.cred) abrirCredencial(); else go(a.go); };
      return h('button', { type:'button', class:'alert aviso ' + a.k + (vistos.has(a.id) ? '' : ' nuevo'), on:{ click: ir } }, h('span', { class:'ai' }, icon(a.ic, 's20')), h('div', null, h('div', { class:'at' }, a.t), h('div', { class:'ad' }, a.d)), vistos.has(a.id) ? null : h('span', { class:'dot spark', 'aria-label':'Nuevo' }));
    })) : emptyState('bell', 'Sin avisos', 'Aquí llegan tus validaciones, respuestas y vencimientos.'), { onClose: scheduleRender });
    scheduleRender();
  });
  return b;
}

/* ---------- celebración al validar un nivel ---------- */
function revisarCelebracion(e){
  const n = e.nivel || 0;
  if(n < 1 || !S.me.id || S.preview) return;
  const key = 'lh-nivel-visto-' + S.me.id;
  let visto;
  try { if(localStorage.getItem('lh-sin-celebrar')) return; visto = localStorage.getItem(key); localStorage.setItem(key, String(n)); } catch(x){ return; }
  const reciente = e.fechasNivel && e.fechasNivel[n] && diffDays(e.fechasNivel[n], S.hoy) <= 60;
  if(visto === null ? reciente : Number(visto) < n) setTimeout(() => celebrarNivel(n), 450);
}
function celebrarNivel(n){
  if(document.querySelector('.celebra')) return;
  const N = NIVEL[n];
  const prev = document.activeElement;
  const canvas = h('canvas', { class:'confeti', 'aria-hidden':'true' });
  let untrap = () => {};
  const cerrar = () => { untrap(); wrap.remove(); document.body.style.overflow = ''; if(prev && prev.focus && document.contains(prev)) prev.focus(); };
  const verCred = btn('Ver mi credencial', { kind:'action', size:'lg', icon:'shieldCheck', onClick: () => { cerrar(); abrirCredencial(); } });
  const seguir = btn('Seguir', { kind:'ghost', size:'lg', onClick: cerrar });
  const box = h('div', { class:'celebra-in', role:'dialog', 'aria-modal':'true', 'aria-labelledby':'cel-t' },
    h('div', { class:'cel-badge', 'aria-hidden':'true' }, h('span', { class:'cel-ring' }), h('b', null, String(n))),
    h('span', { class:'onb-k' }, '¡Validaste el nivel ' + n + '!'),
    h('h2', { id:'cel-t', class:'onb-h' }, N.nombre),
    h('p', { class:'lead' }, 'Desde hoy: ' + primeraFrase(N.habilita).replace(/^./, c => c.toLowerCase())),
    pips(n),
    h('div', { class:'row', style:'justify-content:center;margin-top:6px' }, seguir, verCred));
  const wrap = h('div', { class:'celebra' }, canvas, box);
  wrap.addEventListener('click', ev => { if(ev.target === wrap || ev.target === canvas) cerrar(); });
  document.body.appendChild(wrap); document.body.style.overflow = 'hidden';
  untrap = trapFocus(box, cerrar);
  setTimeout(() => verCred.focus(), 60);
  if(!Motion.quieto()) confeti(canvas);
}
function confeti(canvas){
  const ctx = canvas.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.width = innerWidth * dpr, H = canvas.height = innerHeight * dpr;
  const col = ['#22B8F0', '#78d6f7', '#ffffff', '#F5B94A', '#4ADE80'];
  const ps = Array.from({ length: 160 }, (_, i) => ({ x: W / 2 + (Math.random() - .5) * W * .2, y: H * .42, vx: (Math.random() - .5) * 18 * dpr, vy: (-Math.random() * 16 - 6) * dpr, r: (3 + Math.random() * 5) * dpr, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: col[i % col.length] }));
  const t0 = performance.now();
  const paso = t => {
    if(!document.body.contains(canvas)) return;
    const k = (t - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    for(const p of ps){ p.vy += .45 * dpr; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - k / 3.6); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); }
    if(k < 3.6) requestAnimationFrame(paso); else ctx.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(paso);
}

/* ---------- credencial digital con QR ---------- */
function payloadCredencial(e){ return 'LUMINE HABILITA|' + e.credencial + '|N' + (e.nivel || 0) + '|' + String(e.nombre || '').slice(0, 40) + '|' + ((e.revalidacion || {}).vence || ''); }
function estadoCredencial(e){ const rv = e.revalidacion || {}; return e.suspendidoAT ? ['Alta tensión suspendida','crit'] : rv.estado === 'vencida' ? ['Revalidación vencida','crit'] : ['Vigente','ok']; }
function abrirCredencial(){
  const e = miExp(); if(!e) return;
  openSheet('Tu credencial', () => credencialCard(e));
}
function credencialCard(e){
  const n = e.nivel || 0;
  if(!e.credencial) return emptyState('shield', 'Aún sin credencial', 'Se emite al validar el nivel 1 en el taller.');
  const rv = e.revalidacion || {};
  const st = estadoCredencial(e);
  return h('div', { class:'stack', style:'--g:14px' },
    h('div', { class:'cred', 'data-cred': e.credencial },
      h('div', { class:'cred-top' }, h('span', { class:'row', style:'gap:8px' }, h('span', { class:'emblem' }), h('span', { class:'wordmark', 'aria-hidden':'true' })), h('span', { class:'cred-k' }, 'Técnico instalador')),
      h('div', { class:'cred-mid' }, h('span', { class:'cred-lv', 'aria-hidden':'true' }, String(n)), h('div', { class:'stack', style:'--g:4px;min-width:0' }, h('b', { class:'cred-n' }, e.nombre), h('span', { class:'cred-l' }, 'Nivel ' + n + ' · ' + NIVEL[n].nombre), pips(n))),
      h('div', { class:'cred-bot' },
        h('dl', { class:'cred-dl' }, h('dt', null, 'Estado'), h('dd', null, h('span', { class:'cred-st ' + st[1] }, st[0])), h('dt', null, 'Validado'), h('dd', null, fechaCorta((e.fechasNivel || {})[n])), h('dt', null, 'Revalida'), h('dd', null, rv.vence ? fechaCorta(rv.vence) : '—'), h('dt', null, 'Código'), h('dd', { class:'mono' }, e.credencial)),
        h('div', { class:'cred-qr' }, QR.svg(payloadCredencial(e), { label:'Código QR de la credencial ' + e.credencial })))),
    h('p', { class:'hint' }, 'Muéstrala en el taller. El Responsable Técnico la verifica buscando el código en la plataforma. El código cambia cada vez que validas un nivel.'),
    S.dl ? h('div', { class:'row' }, btn('Descargar credencial', { kind:'ghost', icon:'download', onClick: ev => busy(ev.currentTarget, () => descargarCredencial(e)) })) : null);
}
async function descargarCredencial(e){
  const n = e.nivel || 0, st = estadoCredencial(e), rv = e.revalidacion || {};
  const qr = QR.svg(payloadCredencial(e));
  qr.setAttribute('x', '440'); qr.setAttribute('y', '150'); qr.setAttribute('width', '170'); qr.setAttribute('height', '170');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const txt = (x, y, t, o) => '<text x="' + x + '" y="' + y + '" ' + (o || '') + '>' + esc(t) + '</text>';
  const data = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" font-family="Helvetica, Arial, sans-serif">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1a21"/><stop offset="1" stop-color="#070a0c"/></linearGradient></defs>'
    + '<rect width="640" height="360" rx="22" fill="url(#g)"/><rect x="0" y="0" width="640" height="6" fill="#22B8F0"/>'
    + txt(32, 52, 'LUMINE HABILITA', 'fill="#eef3f5" font-size="18" font-weight="700" letter-spacing="3"') + txt(608, 52, 'TÉCNICO INSTALADOR', 'fill="#8a9aa1" font-size="12" text-anchor="end" letter-spacing="2"')
    + txt(32, 128, String(n), 'fill="#22B8F0" font-size="64" font-weight="800"') + txt(92, 108, e.nombre, 'fill="#eef3f5" font-size="24" font-weight="700"') + txt(92, 134, 'Nivel ' + n + ' · ' + NIVEL[n].nombre, 'fill="#b9c7cd" font-size="15"')
    + txt(32, 200, 'Estado', 'fill="#8a9aa1" font-size="12"') + txt(130, 200, st[0], 'fill="' + (st[1] === 'ok' ? '#4ADE80' : '#F87171') + '" font-size="14" font-weight="700"')
    + txt(32, 230, 'Validado', 'fill="#8a9aa1" font-size="12"') + txt(130, 230, fechaCorta((e.fechasNivel || {})[n]), 'fill="#eef3f5" font-size="14"')
    + txt(32, 260, 'Revalida', 'fill="#8a9aa1" font-size="12"') + txt(130, 260, rv.vence ? fechaCorta(rv.vence) : '—', 'fill="#eef3f5" font-size="14"')
    + txt(32, 290, 'Código', 'fill="#8a9aa1" font-size="12"') + txt(130, 290, e.credencial, 'fill="#eef3f5" font-size="14" font-family="monospace"')
    + new XMLSerializer().serializeToString(qr) + '</svg>';
  try { await S.dl.save({ filename:'credencial-lumine-' + e.credencial + '.svg', data }); toast('Credencial guardada'); }
  catch(x){ if(x && x.code === 'declined') toast('Descarga cancelada', 'info'); else throw x; }
}

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
      h('div', { class:'mh' }, h('div', null, h('span', { class:'xs muted' }, m.nivel ? 'Nivel ' + m.nivel : 'Nivelación'), h('h3', { class:'h4' }, m.nombre)),
        locked ? badge('Bloqueado', 'line', 'lock') : st === 'aprobado' ? badge('Práctica aprobada', 'ok', 'check') : st === 'revisado' ? badge('Revisado', 'ok', 'check') : badge(st === 'iniciado' ? 'En curso' : 'Pendiente', 'info')),
      h('p', { class:'small ink2' }, m.resumen),
      m.cod.length ? h('span', { class:'hint' }, m.cod.length + (m.cod.length === 1 ? ' tema' : ' temas') + (skipT.length ? ' · ' + skipT.length + (skipT.length === 1 ? ' ya demostrado' : ' ya demostrados') : '')) : null,
      locked ? h('span', { class:'hint' }, 'Se desbloquea al validar el nivel ' + (m.nivel - 1) + '.') : null);
    return locked ? h('div', { class:'card modcard locked' }, inner) : h('a', { class:'card link', href:'#modulo-' + m.id }, inner);
  };
  return page(
    phead({ eyebrow:'Formación online', eic:'layers', title:'Tus módulos', lead:'Cortos, con casos reales del taller. Repítelos cuantas veces quieras: el nivel se gana en el taller.' }),
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
      return h('div', { class:'prevq ' + (bien ? 'ok' : 'bad') }, h('div', { class:'row', style:'gap:8px' }, h('span', { class:'pn' }, icon(bien ? 'check' : 'x', 's14')), h('span', { class:'hint' }, 'Pregunta ' + (k + 1))),
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
    h('div', { class:'q' }, h('div', { class:'row', style:'gap:8px' }, q.c ? critTag(C[q.c].k) : null, h('span', { class:'hint' }, 'Caso ' + (k + 1) + ' de ' + n)), h('p', { class:'h4', style:'font-weight:600' }, q.q), opts),
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
  const comps = m.cod.map(c => h('div', { class:'crow tema' + (sk.includes(c) ? ' skip' : '') }, h('span', { class:'dot ' + (sk.includes(c) ? 'ok' : 'spark') }), h('span', { class:'ct' }, C[c].t), sk.includes(c) ? badge('Ya la demostraste', 'ok') : (C[c].k === 'comp' ? null : badge(CRITICIDAD[C[c].k].l, 'warn'))));
  // navegación entre módulos de la misma línea, sin volver a la lista
  const navMod = h('nav', { class:'modnav', 'aria-label':'Otros módulos' },
    vec.prev ? h('a', { class:'modnav-a prev', href:'#modulo-' + vec.prev.id }, icon('arrowLeft', 's16'), h('span', null, h('small', null, 'Anterior'), vec.prev.nombre)) : h('span'),
    vec.next ? h('a', { class:'modnav-a next', href:'#modulo-' + vec.next.id }, h('span', null, h('small', null, 'Siguiente'), vec.next.nombre), icon('arrowRight', 's16')) : h('span'));
  const pos = vec.de > 1 ? (m.nivel ? 'Nivel ' + m.nivel : 'Nivelación') + ' · módulo ' + vec.pos + ' de ' + vec.de : (m.nivel ? 'Nivel ' + m.nivel : 'Nivelación');
  const head = phead({ back:['modulos','Módulos'], eyebrow: pos, eic:'layers', title: m.nombre, lead: (ct && ct.resumen) || m.resumen, actions: ct && ct.practica ? null : [revisar] });
  if(!ct || !(ct.capsulas || []).length){
    return page(head, comps.length ? h('div', { class:'stack', style:'--g:6px;margin-bottom:22px' }, h('span', { class:'label' }, 'Lo que aprendes aquí'), comps) : null,
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
      comps.length ? h('div', { class:'stack', style:'--g:6px' }, h('span', { class:'label' }, 'Lo que aprendes aquí'), comps) : null,
      modPiezas(mid).length ? h('div', { class:'lab-link' }, h('span', { class:'ll-ic' }, icon('cube', 's20')), h('div', { class:'stack', style:'--g:6px' }, h('b', { class:'small' }, 'Míralo en el laboratorio 3D'), h('div', { class:'tag-row' }, modPiezas(mid).map(p => h('a', { class:'badge info', href:'#laboratorio-' + p.id }, p.n))))) : null,
      notice('', 'info', 'Contenido de formación general' + (m.ic ? ', revisado con Ingeniería de Calibración.' : ', revisado con la parte externa de seguridad.') + ' Lo propio del kit lo enseña tu formador en el taller.'),
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
        h('div', { class:'card stack', style:'--g:10px', 'data-rv':'' }, h('h3', { class:'h4' }, 'Estaciones que revisarás en la jornada'), mapa.length ? h('div', { class:'stack', style:'--g:6px' }, mapa.map(c => h('div', { class:'crow tema' }, h('span', { class:'dot spark' }), h('span', { class:'ct' }, C[c].t), h('span')))) : h('p', { class:'small muted' }, 'Ninguna: tu ruta parte con el oficio completo.'), h('p', { class:'hint' }, 'Si demuestras una estación, esa competencia no la cursas.')),
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
