/* =====================================================================
   Vistas: aprender (Hoy, lecciones y repaso)
   Una lección es una secuencia corta de pantallas: cada una pide algo
   al técnico y responde al tiro (retroalimentación inmediata). Lo que
   se falla vuelve al final de la lección y entra al repaso espaciado.
   ===================================================================== */
'use strict';

function miAprende(){ return (S.mine.avance && S.mine.avance.aprende) || {}; }
function leccionHecha(lid){ return !!(miAprende().lecciones || {})[lid]; }
function fuenteChip(fid){
  const f = FUENTES_CONT[fid]; if(!f) return null;
  const b = h('button', { type:'button', class:'fuente ' + f.estado, 'aria-label':'Fuente: ' + f.t },
    h('span', { class:'fz' }, f.tipo || 'Fuente'), h('span', { class:'ft' }, f.org));
  b.addEventListener('click', ev => { ev.stopPropagation(); verFuente(fid); });
  return b;
}
function verFuente(fid){
  const f = FUENTES_CONT[fid]; if(!f) return;
  dialog({ title:'Fuente', icon:'book', iconKind:'info', confirm:'Entendido', noCancel:true,
    body: h('div', { class:'stack', style:'--g:10px' },
      h('p', { class:'fuente-t' }, f.t),
      h('p', { class:'small ink2' }, [f.org, f.ed].filter(Boolean).join(' · ')),
      badge((ESTADO_FUENTE[f.estado] || ESTADO_FUENTE['por-confirmar'])[0], (ESTADO_FUENTE[f.estado] || ESTADO_FUENTE['por-confirmar'])[1], f.estado === 'verificada' ? 'check' : null),
      f.nota ? h('p', { class:'small ink2' }, f.nota) : null,
      f.url ? h('a', { href:f.url, target:'_blank', rel:'noopener noreferrer' }, 'Ver la fuente') : null) });
}
function plano(o){
  o = o || {};
  const ns = (t, p, ...k) => s(t, p, ...k);
  const svg = ns('svg', { viewBox:'86 104 1028 286', class:'plano' + (o.cls ? ' ' + o.cls : ''), role: o.tocar ? 'group' : 'img', 'aria-label':'Plano del kit: auto en vista lateral con el motor original adelante, la unidad de control, el banco de baterías y el motor eléctrico en el eje trasero' });
  addKids(svg, [
    ns('line', { x1:40, y1:372, x2:1160, y2:372, class:'pl-suelo' }),
    ns('path', { d:'M110 330 L100 285 Q100 255 130 245 L420 212 Q470 160 540 132 Q560 126 600 125 L850 125 Q880 126 905 140 L1040 205 Q1080 215 1090 240 L1096 290 Q1096 330 1080 330 L1002 330 A72 72 0 0 0 858 330 L322 330 A72 72 0 0 0 178 330 Z', class:'pl-car' }),
    ns('path', { d:'M452 210 L548 145 Q560 138 590 137 L698 137 L698 210 Z', class:'pl-win' }),
    ns('path', { d:'M714 137 L846 137 Q868 138 886 148 L980 208 L714 210 Z', class:'pl-win' }),
    [250, 930].map(cx => ns('g', null, ns('circle', { cx, cy:320, r:52, class:'pl-rueda' }), ns('circle', { cx, cy:320, r:32, class:'pl-llanta' }))),
    ns('rect', { x:326, y:236, width:104, height:54, rx:4, class:'pl-motor' }),
    ns('path', { d:'M842 300 C870 300 872 318 886 318', class:'pl-cable' }),
    ns('path', { d:'M640 300 C606 300 604 270 582 270', class:'pl-cable' }),
    ns('rect', { x:522, y:254, width:60, height:32, rx:3, class:'pl-kit' }),
    ns('rect', { x:640, y:282, width:202, height:36, rx:3, class:'pl-kit' }),
    Array.from({ length:7 }, (_, k) => ns('line', { x1:665 + k * 25, y1:286, x2:665 + k * 25, y2:314, class:'pl-celda' })),
    ns('rect', { x:884, y:302, width:92, height:36, rx:8, class:'pl-kit fuerte' })
  ]);
  if(o.tocar){
    for(const z of Object.keys(PLANO_ZONAS)){
      const Z = PLANO_ZONAS[z];
      const estado = o.estado && o.estado(z);
      const r = ns('rect', { x:Z.x - 6, y:Z.y - 6, width:Z.w + 12, height:Z.h + 12, rx:8, class:'pl-zona' + (estado ? ' ' + estado : ''), tabindex:0, role:'button', 'aria-label':Z.l, 'data-k':'zona-' + z });
      r.addEventListener('click', () => o.tocar(z));
      r.addEventListener('keydown', ev => { if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); o.tocar(z); } });
      svg.appendChild(r);
    }
  }
  return svg;
}

/* ---------- ejercicios ----------
   Cada uno devuelve { el, listo, calificable, comprobar(), confianza }.
   Su estado vive en 'ex' (sobrevive a cada render). */
const EJ = {};
EJ.situacion = (p) => ({ el: h('div', { class:'ej ej-sit' },
  h('span', { class:'ej-k' }, icon('target', 's16'), 'Situación'),
  h('h2', { class:'ej-t' }, p.t), h('p', { class:'ej-x' }, p.x), p.visual === 'plano' ? h('div', { class:'ej-visual' }, plano()) : null), listo:true });
EJ.concepto = (p) => ({ el: h('div', { class:'ej ej-con' },
  h('span', { class:'ej-k' }, icon('book', 's16'), 'Concepto'),
  h('h2', { class:'ej-t' }, p.t),
  h('ol', { class:'con-lista' }, p.puntos.map((x, i) => h('li', null, h('span', { class:'cn' }, String(i + 1).padStart(2, '0')), h('span', null, x)))),
  p.nota ? h('p', { class:'con-nota' }, icon('info', 's16'), p.nota) : null,
  p.f ? h('div', { class:'ej-fuente' }, fuenteChip(p.f)) : null), listo:true });
EJ.revelar = (p, ex, upd) => {
  ex.abiertas = ex.abiertas || {};
  const todas = p.tarjetas.every((_, i) => ex.abiertas[i]);
  return { listo: todas, el: h('div', { class:'ej ej-rev' },
    h('span', { class:'ej-k' }, icon('eye', 's16'), 'Descubre'),
    h('h2', { class:'ej-t' }, p.t), p.d ? h('p', { class:'ej-d' }, p.d) : null,
    h('div', { class:'rev-grid' }, p.tarjetas.map((t, i) => {
      const ab = !!ex.abiertas[i];
      const b = h('button', { type:'button', class:'rev' + (ab ? ' ab' : ''), 'aria-expanded': ab ? 'true' : 'false', 'data-k':'rev' + i },
        h('span', { class:'rev-ic' }, icon(t.ic || 'info', 's20')), h('b', { class:'rev-t' }, t.t), ab ? h('span', { class:'rev-x' }, t.x) : h('span', { class:'rev-h' }, 'Toca para abrir'));
      b.addEventListener('click', () => { ex.abiertas[i] = true; upd(); });
      return b;
    })),
    p.f ? h('div', { class:'ej-fuente' }, fuenteChip(p.f)) : null) };
};
EJ.elegir = (p, ex, upd, st) => {
  if(!ex.orden) ex.orden = barajar(p.o.map((_, j) => j), semillaDe(p.id + ':' + st.seed));
  const b = h('div', { class:'opts big', role:'radiogroup', 'aria-label':'Alternativas' }, ex.orden.map((oi, j) => {
    const cls = ex.rev ? (oi === p.a ? ' ok' : (ex.sel === j ? ' bad' : '')) : '';
    const o = h('button', { type:'button', class:'opt' + cls, role:'radio', 'aria-checked': ex.sel === j ? 'true' : 'false', disabled: ex.rev || null, 'data-k':'op' + j }, h('span', { class:'ol' }, 'ABCD'[j]), h('span', null, p.o[oi]));
    o.addEventListener('click', () => { if(ex.rev) return; ex.sel = j; upd(); });
    return o;
  }));
  return { calificable:true, confianza:true, listo: ex.sel !== undefined && ex.sel !== null, tecla: j => { if(!ex.rev && j < ex.orden.length){ ex.sel = j; upd(); } },
    comprobar: () => ({ ok: ex.orden[ex.sel] === p.a }),
    el: h('div', { class:'ej ej-eleg' }, h('span', { class:'ej-k' }, icon('list', 's16'), 'Elige'), h('h2', { class:'ej-t' }, p.q), b) };
};
EJ.ordenar = (p, ex, upd, st) => {
  if(!ex.orden){ let a = barajar(p.items.map((_, i) => i), semillaDe(p.id + ':' + st.seed)); if(a.every((v, i) => v === i)) a = a.slice().reverse(); ex.orden = a; }
  const lista = h('ol', { class:'ord', 'aria-label':'Arrastra para ordenar' });
  const pintar = () => {
    clear(lista);
    ex.orden.forEach((ii, pos) => {
      const cls = ex.rev ? (ii === pos ? ' ok' : ' bad') : '';
      const sube = h('button', { type:'button', class:'ord-mv', 'aria-label':'Subir: ' + p.items[ii], disabled: ex.rev || pos === 0 || null }, icon('chevDown', 's16'));
      const baja = h('button', { type:'button', class:'ord-mv', 'aria-label':'Bajar: ' + p.items[ii], disabled: ex.rev || pos === ex.orden.length - 1 || null }, icon('chevDown', 's16'));
      sube.querySelector('svg').style.transform = 'rotate(180deg)';
      sube.addEventListener('click', () => { [ex.orden[pos - 1], ex.orden[pos]] = [ex.orden[pos], ex.orden[pos - 1]]; pintar(); lista.children[pos - 1].querySelector('.ord-mv').focus(); });
      baja.addEventListener('click', () => { [ex.orden[pos + 1], ex.orden[pos]] = [ex.orden[pos], ex.orden[pos + 1]]; pintar(); const bs = lista.children[pos + 1].querySelectorAll('.ord-mv'); bs[bs.length - 1].focus(); });
      const li = h('li', { class:'ord-it' + cls, 'data-i':String(ii) }, h('span', { class:'ord-h', 'aria-hidden':'true' }, h('i'), h('i'), h('i')), h('span', { class:'ord-n' }, String(pos + 1)), h('span', { class:'ord-t' }, p.items[ii]), h('span', { class:'ord-b' }, sube, baja));
      if(!ex.rev) arrastrable(li, lista, () => { ex.orden = Array.from(lista.children).map(x => Number(x.dataset.i)); pintar(); });
      lista.appendChild(li);
    });
  };
  pintar();
  return { calificable:true, listo:true, comprobar: () => ({ ok: ex.orden.every((v, i) => v === i) }),
    el: h('div', { class:'ej ej-ord' }, h('span', { class:'ej-k' }, icon('swap', 's16'), 'Ordena'), h('h2', { class:'ej-t' }, p.q), h('p', { class:'ej-d' }, 'Arrastra cada paso a su lugar, o usa las flechas.'), lista) };
};
/* arrastre con puntero (mouse, dedo o lápiz): reordena en vivo y confirma al soltar */
function arrastrable(li, lista, alSoltar){
  li.addEventListener('pointerdown', ev => {
    if(ev.target.closest('button') || ev.button > 0) return;
    ev.preventDefault();
    li.setPointerCapture(ev.pointerId);
    const r0 = li.getBoundingClientRect();
    const off = ev.clientY - (r0.top + r0.height / 2);
    let movio = false;
    li.classList.add('drag');
    const mover = e => {
      const centro = e.clientY - off;
      li.style.translate = '';
      let destino = null;
      for(const x of lista.children){ if(x === li) continue; const r = x.getBoundingClientRect(); if(centro < r.top + r.height / 2){ destino = x; break; } }
      if(destino !== li.nextSibling && destino !== li){ lista.insertBefore(li, destino); movio = true; }
      const r = li.getBoundingClientRect();
      li.style.translate = '0 ' + Math.round(centro - (r.top + r.height / 2)) + 'px';
      if(Math.abs(e.clientY - ev.clientY) > 3) movio = true;
    };
    const soltar = () => {
      li.removeEventListener('pointermove', mover); li.removeEventListener('pointerup', soltar); li.removeEventListener('pointercancel', soltar);
      li.classList.remove('drag'); li.style.translate = '';
      if(movio) alSoltar();
    };
    li.addEventListener('pointermove', mover); li.addEventListener('pointerup', soltar); li.addEventListener('pointercancel', soltar);
  });
}
EJ.emparejar = (p, ex, upd, st) => {
  if(!ex.izq){ ex.izq = barajar(p.pares.map((_, i) => i), semillaDe(p.id + ':i:' + st.seed)); ex.der = barajar(p.pares.map((_, i) => i), semillaDe(p.id + ':d:' + st.seed)); ex.hechos = {}; ex.err = 0; ex.sel = null; ex.malo = null; }
  const listo = Object.keys(ex.hechos).length === p.pares.length;
  const col = (lado, orden) => h('div', { class:'emp-col' }, orden.map(i => {
    const hecho = ex.hechos[i];
    const sel = ex.sel && ex.sel.lado === lado && ex.sel.i === i;
    const malo = ex.malo && ex.malo[lado] === i;
    const b = h('button', { type:'button', class:'emp' + (hecho ? ' ok' : '') + (sel ? ' sel' : '') + (malo ? ' bad' : ''), disabled: hecho ? true : null, 'aria-pressed': sel ? 'true' : 'false', 'data-k':'emp' + lado + i }, hecho ? h('span', { class:'emp-par', 'aria-label':'Par ' + hecho }, String(hecho)) : null, p.pares[i][lado === 'i' ? 0 : 1]);
    b.addEventListener('click', () => {
      ex.malo = null;
      if(!ex.sel || ex.sel.lado === lado){ ex.sel = { lado, i }; upd(); return; }
      const a = ex.sel.lado === 'i' ? ex.sel.i : i, d = ex.sel.lado === 'd' ? ex.sel.i : i;
      if(a === d){ ex.hechos[a] = Object.keys(ex.hechos).length + 1; }
      else { ex.err++; ex.malo = { i:a, d }; setTimeout(() => { if(ex.malo && ex.malo.i === a && ex.malo.d === d){ ex.malo = null; upd(); } }, 700); }
      ex.sel = null; upd();
    });
    return b;
  }));
  return { calificable:true, listo, auto:true, comprobar: () => ({ ok: ex.err === 0 }),
    el: h('div', { class:'ej ej-emp' }, h('span', { class:'ej-k' }, icon('swap', 's16'), 'Une'), h('h2', { class:'ej-t' }, p.q),
      h('p', { class:'ej-d' }, 'Toca un elemento de cada columna para unirlos.' + (ex.err ? ' Errores: ' + ex.err + '.' : '')),
      h('div', { class:'emp-grid' }, col('i', ex.izq), col('d', ex.der))) };
};
EJ.tocar = (p, ex, upd) => {
  const estado = z => ex.rev ? (z === p.zona ? 'ok' : (ex.sel === z ? 'bad' : '')) : (ex.sel === z ? 'sel' : '');
  const Z = ex.sel ? PLANO_ZONAS[ex.sel] : null;
  return { calificable:true, confianza:true, listo: !!ex.sel, comprobar: () => ({ ok: ex.sel === p.zona }),
    el: h('div', { class:'ej ej-toc' }, h('span', { class:'ej-k' }, icon('target', 's16'), 'Toca en el plano'), h('h2', { class:'ej-t' }, p.q),
      h('div', { class:'ej-visual tocable' }, plano({ tocar: z => { if(ex.rev) return; ex.sel = z; upd(); }, estado })),
      h('p', { class:'ej-d', 'aria-live':'polite' }, Z ? 'Elegiste: ' + Z.l + (ex.rev ? '. ' + Z.d : '') : 'Toca una pieza del auto.')) };
};
EJ.decidir = (p, ex, upd) => {
  if(!ex.camino){ ex.camino = []; ex.nodo = p.inicio; }
  const fin = ex.nodo === 'fin';
  const pasos = ex.camino.map(c => h('div', { class:'dec-paso' }, h('p', { class:'dec-q' }, p.nodos[c.n].t), h('div', { class:'dec-r ' + (c.ok ? 'ok' : 'bad') }, icon(c.ok ? 'check' : 'x', 's16'), h('div', null, h('b', null, c.l), h('p', null, c.x)))));
  const actual = !fin ? h('div', { class:'dec-paso actual' }, h('p', { class:'dec-q' }, p.nodos[ex.nodo].t), h('div', { class:'dec-op' }, p.nodos[ex.nodo].op.map((o, j) => {
    const b = h('button', { type:'button', class:'opt', 'data-k':'dec' + ex.camino.length + '-' + j }, h('span', { class:'ol' }, 'AB'[j] || String(j + 1)), h('span', null, o.l));
    b.addEventListener('click', () => { ex.camino.push({ n:ex.nodo, l:o.l, ok:o.ok, x:o.x }); ex.nodo = o.ir; upd(); });
    return b;
  }))) : null;
  return { calificable:true, listo: fin, auto:true, tecla: j => { const op = !fin && p.nodos[ex.nodo].op[j]; if(op){ ex.camino.push({ n:ex.nodo, l:op.l, ok:op.ok, x:op.x }); ex.nodo = op.ir; upd(); } },
    comprobar: () => ({ ok: ex.camino.every(c => c.ok) }),
    el: h('div', { class:'ej ej-dec' }, h('span', { class:'ej-k' }, icon('route', 's16'), 'Caso de taller'), h('h2', { class:'ej-t' }, 'Tú decides'), pasos, actual) };
};
EJ.rapido = (p, ex, upd) => {
  if(!ex.r) ex.r = [];
  const i = ex.r.length, fin = i >= p.items.length;
  const hechos = ex.r.map((r, k) => h('div', { class:'rap-hecho ' + (r === p.items[k].a ? 'ok' : 'bad') }, icon(r === p.items[k].a ? 'check' : 'x', 's16'), h('div', null, h('p', null, p.items[k].t), h('small', null, p.op[p.items[k].a] + ': ' + p.items[k].x))));
  const actual = fin ? null : h('div', { class:'rap-card' }, h('span', { class:'rap-n' }, (i + 1) + ' de ' + p.items.length), h('p', { class:'rap-t' }, p.items[i].t),
    h('div', { class:'rap-op' }, p.op.map((l, j) => { const b = h('button', { type:'button', class:'btn ' + (j === 0 ? 'btn-action' : 'btn-ghost') + ' lg', 'data-k':'rap' + i + '-' + j }, l); b.addEventListener('click', () => { ex.r.push(j); upd(); }); return b; })));
  return { calificable:true, listo: fin, auto:true, tecla: j => { if(!fin && j < p.op.length){ ex.r.push(j); upd(); } },
    comprobar: () => ({ ok: ex.r.every((r, k) => r === p.items[k].a) }),
    el: h('div', { class:'ej ej-rap' }, h('span', { class:'ej-k' }, icon('bolt', 's16'), 'Respuesta rápida'), h('h2', { class:'ej-t' }, p.q), actual, h('div', { class:'rap-lista' }, hechos.reverse())) };
};
EJ.cierre = (p) => ({ listo:true, el: h('div', { class:'ej ej-cie' },
  h('span', { class:'ej-k' }, icon('checkCircle', 's16'), 'Lo que te llevas'),
  h('h2', { class:'ej-t' }, p.t),
  h('ul', { class:'cie-lista' }, p.puntos.map(x => h('li', null, icon('check', 's16'), h('span', null, x)))),
  p.taller ? h('div', { class:'cie-taller' }, h('span', { class:'ej-k' }, icon('wrench', 's16'), 'En el taller'), h('p', null, p.taller)) : null) });

/* ---------- reproductor ---------- */
let LEC_ACTUAL = null;
document.addEventListener('keydown', ev => {
  const L = LEC_ACTUAL;
  if(!L || !document.querySelector('.lec') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if(document.querySelector('.dialog')) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
  const k = ev.key.toLowerCase();
  if(k === 'enter'){ if(document.activeElement && document.activeElement.tagName === 'BUTTON' && !document.activeElement.classList.contains('lec-cta')) return; ev.preventDefault(); L.principal(); }
  else if(k === 'escape'){ ev.preventDefault(); L.salir(); }
  else { const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k); if(i >= 0 && k.length === 1 && L.tecla){ ev.preventDefault(); L.tecla(i); } }
});
function reproductor(o){
  const st = ui(o.key, { seed: nuevaSemilla(), cola: o.pasos.map((_, i) => i), i:0, fase:'resp', res:{}, ex:{}, reint:{}, fin:false });
  const upd = () => render(true);
  const salir = async () => {
    if(st.fin){ delete UI[o.key]; go(o.volver); return; }
    const r = await dialog({ title:'¿Salir de la lección?', icon:'x', iconKind:'warn', confirm:'Salir', cancel:'Seguir aprendiendo', body:'Lo que llevas de esta lección no se guarda.' });
    if(r){ delete UI[o.key]; go(o.volver); }
  };
  const top = (pct) => h('div', { class:'lec-top' },
    h('button', { type:'button', class:'lec-x', 'aria-label':'Salir de la lección', on:{ click: salir } }, icon('x', 's20')),
    h('div', { class:'lec-bar', role:'progressbar', 'aria-valuemin':0, 'aria-valuemax':100, 'aria-valuenow':pct, 'aria-label':'Avance de la lección' }, h('i', { style:'width:' + pct + '%' })),
    h('span', { class:'lec-tt' }, o.titulo));

  if(st.fin) return pantallaFin(o, st, top(100), salir);

  const idx = st.cola[st.i];
  const p = o.pasos[idx];
  const ex = st.ex[st.i] = st.ex[st.i] || {};
  const E = EJ[p.k](p, ex, upd, st);
  const reintento = st.i >= o.pasos.length;
  const avanzar = () => {
    if(st.i + 1 >= st.cola.length){ st.fin = true; upd(); return; }
    st.i++; st.fase = 'resp'; upd(); window.scrollTo(0, 0);
  };
  const comprobar = (seguro) => {
    if(!E.listo) return;
    const r = E.comprobar();
    ex.rev = true; ex.ok = r.ok; ex.seguro = seguro;
    if(p.id && !(idx in st.res)) st.res[idx] = { ok: r.ok, seguro };
    if(!r.ok && p.id && !st.reint[idx]){ st.reint[idx] = true; st.cola.push(idx); }
    st.fase = 'fb'; upd();
  };
  const principal = () => {
    if(st.fase === 'fb') return avanzar();
    if(!E.calificable){ if(E.listo) avanzar(); return; }
    if(E.confianza) return; // se elige con los botones de confianza
    if(E.listo) comprobar(null);
  };
  LEC_ACTUAL = { principal, salir, tecla: E.tecla || null };

  let pie;
  if(st.fase === 'fb'){
    const ok = ex.ok;
    pie = h('div', { class:'lec-fb ' + (ok ? 'ok' : 'bad'), role:'status' },
      h('div', { class:'fb-in' },
        h('span', { class:'fb-ic' }, icon(ok ? 'check' : 'x', 's20')),
        h('div', { class:'fb-txt' }, h('b', null, ok ? (ex.seguro === false ? 'Correcto, aunque dudaste' : '¡Bien!') : (ex.seguro === true ? 'No, y lo diste por seguro' : 'No exactamente')),
          p.x ? h('p', null, p.x) : null,
          !ok && st.reint[idx] && !reintento ? h('small', null, 'Vuelve al final de la lección.') : null,
          ex.seguro === false && ok ? h('small', null, 'Lo vas a repasar pronto para que quede firme.') : null,
          p.f ? fuenteChip(p.f) : null),
        btn('Continuar', { kind:'action', cls:'lec-cta lg', icon:'arrowRight', onClick: avanzar })));
  } else if(E.calificable && E.confianza){
    pie = h('div', { class:'lec-pie' }, h('div', { class:'pie-in conf' },
      h('span', { class:'pie-q' }, E.listo ? '¿Qué tan seguro estás?' : 'Elige una respuesta'),
      h('div', { class:'pie-b' },
        btn('Creo que sí', { kind:'ghost', cls:'lg', disabled: !E.listo || null, onClick: () => comprobar(false) }),
        btn('Lo sé', { kind:'action', cls:'lec-cta lg', icon:'check', disabled: !E.listo || null, onClick: () => comprobar(true) }))));
    LEC_ACTUAL.principal = () => { if(E.listo) comprobar(true); };
  } else {
    const etiqueta = !E.calificable ? (p.k === 'cierre' ? 'Terminar' : 'Continuar') : (E.auto ? 'Comprobar' : 'Comprobar');
    pie = h('div', { class:'lec-pie' }, h('div', { class:'pie-in' },
      h('span', { class:'pie-q' }, reintento ? 'Segunda oportunidad' : (E.calificable && !E.listo ? (p.k === 'decidir' ? 'Elige qué haces' : p.k === 'rapido' ? 'Responde cada afirmación' : 'Une todos los pares') : '')),
      btn(etiqueta, { kind:'action', cls:'lec-cta lg', icon: E.calificable ? 'check' : 'arrowRight', disabled: !E.listo || null, onClick: principal })));
  }
  const total = o.pasos.length + Object.keys(st.reint).length;
  const pct = Math.round(100 * st.i / Math.max(1, total));
  return h('div', { class:'lec', 'data-tipo':p.k },
    top(pct),
    h('div', { class:'lec-body' }, reintento ? h('div', { class:'lec-reint' }, icon('refresh', 's16'), 'Repasemos lo que fallaste') : null, E.el),
    pie);
}
function pantallaFin(o, st, top, salir){
  LEC_ACTUAL = { principal: salir, salir, tecla:null };
  const ids = Object.keys(st.res);
  const aciertos = ids.filter(k => st.res[k].ok).length;
  const pts = puntosLeccion({ aciertos, total: ids.length });
  if(!st.guardado){
    st.guardado = 'guardando';
    const items = {};
    for(const k of ids){ const p = o.pasos[k]; if(p.id) items[p.id] = st.res[k]; }
    guardarAprendizaje(o.lid || null, { items, aciertos, total: ids.length })
      .then(() => { st.guardado = 'ok'; })
      .catch(e => { st.guardado = 'error'; st.error = errMsg(e); render(true); });
  }
  const r = racha((miAprende().dias || {}), S.hoy);
  const meta = metaDelDia(miAprende(), S.hoy);
  const fallos = ids.filter(k => !st.res[k].ok).map(k => o.pasos[k]);
  const dudas = ids.filter(k => st.res[k].ok && st.res[k].seguro === false).map(k => o.pasos[k]);
  return h('div', { class:'lec fin' }, top,
    h('div', { class:'lec-body' },
      h('div', { class:'fin-head' },
        h('span', { class:'ej-k' }, icon('grad', 's16'), o.lid ? 'Lección completa' : 'Repaso completo'),
        h('h1', { class:'fin-t' }, aciertos === ids.length ? 'TODO ' : 'BIEN ', h('em', null, aciertos === ids.length ? 'sin errores.' : 'hecho.')),
        h('p', { class:'ej-x' }, o.titulo)),
      h('div', { class:'fin-tiles' },
        h('div', { class:'fin-tile' }, h('b', null, '+' + pts), h('span', null, 'Puntos')),
        h('div', { class:'fin-tile' }, h('b', null, aciertos + '/' + ids.length), h('span', null, 'Al primer intento')),
        h('div', { class:'fin-tile racha' }, h('b', null, icon('flame', 's20'), String(Math.max(1, r.n))), h('span', null, Math.max(1, r.n) === 1 ? 'Día de racha' : 'Días de racha'))),
      h('div', { class:'fin-meta' }, h('div', { class:'row sb' }, h('span', { class:'small' }, 'Meta de hoy'), h('span', { class:'small num' }, Math.min(meta.hecho, meta.meta) + ' de ' + meta.meta + ' puntos')), h('div', { class:'barra' }, h('i', { style:'width:' + meta.pct + '%' }))),
      fallos.length || dudas.length ? h('div', { class:'fin-rep' }, h('span', { class:'ej-k' }, icon('refresh', 's16'), 'Vuelve en tu repaso'),
        h('ul', null, fallos.map(p => h('li', null, h('span', { class:'badge crit' }, 'Fallaste'), ' ', p.q || p.t || 'Caso de taller')), dudas.map(p => h('li', null, h('span', { class:'badge warn' }, 'Dudaste'), ' ', p.q || p.t)))) : null,
      st.guardado === 'error' ? notice('crit', 'alert', 'No se pudo guardar tu avance: ' + (st.error || '') + ' Vuelve a intentar desde la lección.') : null),
    h('div', { class:'lec-pie' }, h('div', { class:'pie-in' }, h('span'), btn('Continuar', { kind:'action', cls:'lec-cta lg', icon:'arrowRight', onClick: salir }))));
}

/* ---------- rutas ---------- */
VIEWS.leccion = function(lid){
  const L = LECCION[lid];
  if(!L) return page(phead({ back:['modulos','Módulos'], title:'Lección no encontrada' }));
  if(!cargado(['expediente','avance'])) return vistaCargando();
  const e = miExp();
  if(e && MOD[L.mid] && !moduloDesbloqueado(MOD[L.mid], { nivel: e.nivel || 0 })) return page(phead({ back:['modulos','Módulos'], title:L.t }), notice('', 'lock', 'Se desbloquea al validar el nivel anterior.'));
  return reproductor({ key:'lec-' + lid, lid, titulo:L.t, pasos:L.pasos, volver:'modulo-' + L.mid });
};
VIEWS.repaso = function(){
  if(!cargado(['expediente','avance'])) return vistaCargando();
  const st = ui('rep-sel', { ids:null });
  if(!st.ids){ st.ids = itemsPorRepasar(miAprende().items, S.hoy, 8).filter(id => ITEM_PASO[id]); }
  if(!st.ids.length){ delete UI['rep-sel']; return page(phead({ back:['hoy','Hoy'], title:'Repaso' }), emptyState('checkCircle', 'Estás al día', 'No tienes nada por repasar hoy. Lo que aprendas vuelve justo antes de que se te olvide.', linkBtn('Volver a Hoy', 'hoy', { kind:'action' }))); }
  const pasos = st.ids.map(id => ITEM_PASO[id].paso);
  const v = reproductor({ key:'lec-repaso', lid:null, titulo:'Repaso de hoy', pasos, volver:'hoy' });
  if(UI['lec-repaso'] && UI['lec-repaso'].fin) delete UI['rep-sel'];
  return v;
};

/* ---------- camino de lecciones de un módulo ---------- */
function caminoLecciones(mid){
  const ls = LECCIONES[mid] || [];
  const sig = ls.find(l => !leccionHecha(l.id));
  return h('ol', { class:'camino', 'aria-label':'Lecciones del módulo' }, ls.map((l, i) => {
    const hecha = leccionHecha(l.id), actual = sig && sig.id === l.id;
    const info = (miAprende().lecciones || {})[l.id];
    return h('li', { class:'cam-it' + (hecha ? ' hecha' : '') + (actual ? ' actual' : '') },
      h('a', { class:'cam-n', href:'#leccion-' + l.id, 'aria-label':'Lección ' + (i + 1) + ': ' + l.t }, hecha ? icon('check', 's20') : h('span', null, String(i + 1).padStart(2, '0'))),
      h('div', { class:'cam-c' },
        h('span', { class:'cam-k' }, 'Lección ' + (i + 1) + ' · ' + l.min + ' min' + (hecha && info ? ' · mejor ' + info.mejor + '%' : '')),
        h('a', { class:'cam-t', href:'#leccion-' + l.id }, l.t),
        h('p', { class:'cam-r' }, l.resultado),
        actual ? linkBtn(i === 0 && !hecha ? 'Empezar' : 'Continuar', 'leccion-' + l.id, { kind:'action', arrow:true }) : (hecha ? linkBtn('Repetir', 'leccion-' + l.id, { kind:'ghost', icon:'refresh' }) : null)));
  }));
}
function fuentesModulo(mid){
  const ids = uniq((LECCIONES[mid] || []).flatMap(l => l.pasos.map(p => p.f).filter(Boolean)));
  if(!ids.length) return null;
  return h('section', { class:'fuentes-mod' }, h('span', { class:'idx' }, h('b', null, '§'), h('i'), 'Fuentes de este módulo'),
    h('ol', null, ids.map(id => { const f = FUENTES_CONT[id]; return h('li', null, h('span', { class:'fm-t' }, f.t), h('span', { class:'fm-o' }, [f.org, f.ed].filter(Boolean).join(' · ')), badge((ESTADO_FUENTE[f.estado] || ESTADO_FUENTE['por-confirmar'])[0], (ESTADO_FUENTE[f.estado] || ESTADO_FUENTE['por-confirmar'])[1]), f.url ? h('a', { class:'fm-u', href:f.url, target:'_blank', rel:'noopener noreferrer' }, 'Ver la fuente') : null); })));
}

/* ---------- HOY ---------- */
function siguienteLeccion(){
  const e = miExp();
  const plan = e ? planMio(e) : { modulos: [] };
  const n = e ? (e.nivel || 0) : 0;
  const mods = MODULOS.filter(m => LECCIONES[m.id] && moduloDesbloqueado(m, { nivel:n }));
  // primero lo del plan personal; si el plan ya está completo, lo que quede pendiente igual sirve de repaso
  const orden = mods.filter(m => plan.modulos.includes(m.id)).concat(mods.filter(m => !plan.modulos.includes(m.id)));
  for(const m of orden){ const l = LECCIONES[m.id].find(x => !leccionHecha(x.id)); if(l) return Object.assign({ mid:m.id }, l); }
  return null;
}
VIEWS.hoy = function(){
  if(!cargado(['expediente','avance'])) return vistaCargando();
  const e = miExp();
  const ap = miAprende();
  const r = racha(ap.dias, S.hoy);
  const meta = metaDelDia(ap, S.hoy);
  const rep = itemsPorRepasar(ap.items, S.hoy, 50).filter(id => ITEM_PASO[id]);
  const seguros = Object.keys(ap.items || {}).filter(id => ap.items[id].errorSeguro && ITEM_PASO[id]);
  const sig = siguienteLeccion();
  const nombre = (e && e.nombre ? e.nombre : (S.me.name || '')).split(/\s+/)[0];
  // semana: lunes a domingo de la semana actual
  const d0 = parseISO(S.hoy); const dow = (d0.getDay() + 6) % 7; const lunes = addDays(S.hoy, -dow);
  const semana = Array.from({ length:7 }, (_, i) => { const f = addDays(lunes, i); return { f, l:'LMMJVSD'[i], v:(ap.dias || {})[f] || 0, hoy: f === S.hoy, futuro: f > S.hoy }; });
  const anillo = (pct) => { const R = 52, Cc = 2 * Math.PI * R; return s('svg', { viewBox:'0 0 120 120', class:'anillo', 'aria-hidden':'true' }, s('circle', { cx:60, cy:60, r:R, class:'an-f' }), s('circle', { cx:60, cy:60, r:R, class:'an-v', 'stroke-dasharray':Cc, 'stroke-dashoffset': Cc * (1 - pct / 100) })); };
  const comps = uniq(Object.values(ITEM_COMP));
  const dom = comps.map(c => Object.assign({ c }, dominioCompetencia(c, ap.items, ITEM_COMP, S.hoy))).filter(x => x.total);
  return page(
    h('header', { class:'hoy-head' },
      h('span', { class:'idx' }, h('b', null, '01'), h('i'), S.hoy ? fechaLarga(S.hoy) : ''),
      h('h1', { class:'hoy-t' }, 'HOY, ', h('em', null, nombre ? nombre.toLowerCase() === nombre ? nombre : nombre : 'a aprender.')),
      h('p', { class:'lead' }, sig ? 'Una lección corta, un repaso y listo. Cinco minutos al día hacen más que una tarde entera una vez al mes.' : 'Terminaste las lecciones disponibles. El repaso mantiene firme lo que aprendiste.')),
    h('div', { class:'hoy-grid' },
      h('section', { class:'hoy-card hoy-racha' },
        h('div', { class:'hr-num' }, h('span', { class:'flama' + (r.hoy ? ' on' : '') }, icon('flame', 's24')), h('b', null, String(r.n))),
        h('span', { class:'lbl' }, r.n === 1 ? 'Día de racha' : 'Días de racha'),
        h('p', { class:'small ink2' }, r.hoy ? 'Ya practicaste hoy.' : r.n ? 'Practica hoy para no cortarla.' : 'Empieza hoy tu racha.'),
        h('div', { class:'semana' }, semana.map(d => h('span', { class:'sd' + (d.v ? ' on' : '') + (d.hoy ? ' hoy' : '') + (d.futuro ? ' fut' : ''), title:d.f }, h('i'), d.l)))),
      h('section', { class:'hoy-card hoy-meta' },
        h('div', { class:'an-wrap' }, anillo(meta.pct), h('div', { class:'an-c' }, h('b', null, String(Math.min(meta.hecho, meta.meta))), h('small', null, 'de ' + meta.meta))),
        h('div', null, h('span', { class:'lbl' }, 'Meta de hoy'), h('p', { class:'small ink2' }, meta.cumplida ? 'Meta cumplida. Lo que sumes ahora es extra.' : 'Puntos por lección: 10 por terminar, 2 por cada acierto al primer intento.'))),
      sig ? h('section', { class:'hoy-card hoy-sig visor' }, h('i', { class:'esq a' }), h('i', { class:'esq b' }), h('i', { class:'esq c' }), h('i', { class:'esq d' }),
        h('span', { class:'idx' }, h('b', null, '02'), h('i'), 'Tu siguiente lección · ' + (MOD[sig.mid] ? MOD[sig.mid].nombre : '')),
        h('h2', { class:'hs-t' }, sig.t),
        h('p', { class:'hs-r' }, h('span', { class:'lbl' }, 'Al terminar podrás'), sig.resultado),
        h('div', { class:'row' }, linkBtn('Empezar · ' + sig.min + ' min', 'leccion-' + sig.id, { kind:'action', arrow:true }), linkBtn('Ver el módulo', 'modulo-' + sig.mid, { kind:'ghost' })))
        : h('section', { class:'hoy-card hoy-sig' }, h('span', { class:'idx' }, h('b', null, '02'), h('i'), 'Lecciones'), h('h2', { class:'hs-t' }, 'Al día con las lecciones'), h('p', { class:'small ink2' }, 'Las nuevas lecciones aparecen aquí apenas se publican.'), linkBtn('Ver módulos', 'modulos', { kind:'ghost' })),
      h('section', { class:'hoy-card hoy-rep' },
        h('span', { class:'idx' }, h('b', null, '03'), h('i'), 'Repaso espaciado'),
        h('div', { class:'rep-n' }, h('b', null, String(rep.length)), h('span', null, rep.length === 1 ? 'pregunta por repasar' : 'preguntas por repasar')),
        h('p', { class:'small ink2' }, rep.length ? 'Vuelven justo antes de que se te olviden. Primero lo que fallaste con seguridad.' : 'Nada pendiente. Lo que aprendas vuelve en 1, 3, 7, 16 y 35 días.'),
        rep.length ? linkBtn('Repasar ahora', 'repaso', { kind:'action', icon:'refresh' }) : null)),
    seguros.length ? notice('warn', 'alert', h('b', null, 'Errores dichos con seguridad: ' + seguros.length + '. '), 'Son los más peligrosos en alta tensión: creías saberlo y no era así. Vuelven primero en tu repaso.') : null,
    dom.length ? h('section', { class:'dominio' },
      h('span', { class:'idx' }, h('b', null, '04'), h('i'), 'Dominio por tema'),
      h('p', { class:'small ink2' }, 'Sube cuando aciertas con seguridad y baja si dejas pasar el repaso. No reemplaza la validación en el taller: te dice qué tan firme lo tienes.'),
      h('div', { class:'dom-lista' }, dom.map(x => h('div', { class:'dom-it' },
        h('div', { class:'row sb' }, h('span', { class:'dom-t' }, temaCorto(x.c)), h('span', { class:'dom-p num' }, x.vistos ? x.pct + '%' : 'Sin empezar')),
        h('div', { class:'barra' + (x.vencidos ? ' venc' : '') }, h('i', { style:'width:' + (x.pct || 0) + '%' })),
        x.vencidos ? h('small', { class:'warn-t' }, x.vencidos + ' por repasar') : null)))) : null
  );
};
