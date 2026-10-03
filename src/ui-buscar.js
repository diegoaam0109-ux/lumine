/* =====================================================================
   Lumine Habilita · búsqueda rápida (Ctrl+K o /)
   Personas, validaciones, secciones, ajustes, módulos y competencias.
   Administración verifica aquí el código de una credencial (LH2-…).
   ===================================================================== */
'use strict';

function normTxt(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function resultadosBusqueda(q){
  const nq = normTxt(q).trim();
  const ok = t => !nq || normTxt(t).includes(nq);
  const out = [];
  const add = (grupo, t, sub, ic, fn) => out.push({ grupo, t, sub, ic, fn });
  const cod = String(q || '').toUpperCase().replace(/\s+/g, '');
  if(S.role === 'admin' && /^LH\d-/.test(cod)){
    const p = personas().find(x => codigoCredencial(x) === cod);
    if(p) add('Credencial', 'Credencial válida: ' + p.nombre, 'Nivel ' + p.nivel + ' · ' + NIVEL[p.nivel].nombre + ' · validado el ' + fechaCorta((p.fechasNivel || {})[p.nivel]) + (p.suspendidoAT ? ' · suspendido de alta tensión' : ''), p.suspendidoAT ? 'shieldX' : 'shieldCheck', () => go('persona-' + p.id));
    else add('Credencial', 'Ningún técnico tiene hoy esa credencial', 'Puede ser de un nivel anterior, de alguien que salió o estar mal escrita.', 'shieldX', null);
  }
  for(const id of uniq(navItems().concat(moreItems()))) if(ROUTES[id] && ok(ROUTES[id].t)) add('Ir a', ROUTES[id].t, null, ROUTES[id].ic, () => go(id));
  if(S.role === 'admin'){
    if(nq){
      for(const p of personas()) if(ok(p.nombre)) add('Personas', p.nombre, (ETAPA[p.etapa] || ['?'])[0] + (p.etapa === 'tecnico' ? ' · ' + nivelNombre(p.nivel || 0) : ''), 'user', () => go('persona-' + p.id));
      for(const x of sesiones().filter(x => x.estado === 'abierta')) if(ok(TIPOS_SESION[x.tipo].l + ' ' + nombreP(x.pid))) add('Validaciones abiertas', TIPOS_SESION[x.tipo].l + ' · ' + nombreP(x.pid), fechaCorta(x.fecha), 'clipboard', () => go('sesion-' + x.id));
    }
    if(typeof AJ_GRUPOS !== 'undefined') for(const g of AJ_GRUPOS) for(const [v, l] of g.tabs) if(nq && ok(l + ' ajustes')) add('Ajustes', l, g.l, 'settings', () => go('ajustes-' + v));
  } else if(S.role === 'tecnico' && nq){
    for(const m of MODULOS) if(ok(m.nombre + ' ' + m.resumen)) add('Módulos', m.nombre, m.nivel ? 'Nivel ' + m.nivel : 'Nivelación', 'layers', () => go('modulo-' + m.id));
  }
  if(nq.length >= 3) for(const x of COMP) if(ok(x.t) || (S.role === 'admin' && ok(x.c))) add('Competencias', x.t, 'Nivel ' + x.n + ' · ' + PRIORIDAD[x.p].l, 'book', () => detalleComp(x.c));
  return out.slice(0, 40);
}
let CMDK = null;
function abrirBusqueda(){
  if(CMDK || S.kiosk || kioscoBloqueado()) return;
  const prev = document.activeElement;
  const input = h('input', { class:'cmdk-in', type:'search', placeholder: S.role === 'admin' ? 'Busca una persona, una validación, un ajuste o un código LH…' : 'Busca una sección, un módulo o un tema…', 'aria-label':'Buscar', autocomplete:'off', role:'combobox', 'aria-expanded':'true', 'aria-controls':'cmdk-l' });
  const lista = h('div', { class:'cmdk-l', id:'cmdk-l', role:'listbox', 'aria-label':'Resultados' });
  let res = [], sel = 0;
  const elegir = i => { const r = res[i]; if(!r || !r.fn) return; cerrar(); r.fn(); };
  const pintar = () => {
    res = resultadosBusqueda(input.value);
    sel = Math.min(sel, Math.max(0, res.length - 1));
    clear(lista);
    if(!res.length){ lista.appendChild(h('p', { class:'hint', style:'padding:14px' }, 'Sin resultados para “' + input.value + '”.')); input.removeAttribute('aria-activedescendant'); return; }
    let grupo = null;
    res.forEach((r, i) => {
      if(r.grupo !== grupo){ grupo = r.grupo; lista.appendChild(h('div', { class:'cmdk-g', role:'presentation' }, grupo)); }
      const it = h('div', { class:'cmdk-it' + (i === sel ? ' on' : '') + (r.fn ? '' : ' muda'), id:'cmdk-' + i, role:'option', 'aria-selected': i === sel ? 'true' : 'false' },
        h('span', { class:'cmdk-ic' }, icon(r.ic || 'arrowRight', 's16')), h('span', { class:'cmdk-t' }, h('b', null, r.t), r.sub ? h('span', { class:'hint' }, r.sub) : null), r.fn ? icon('arrowRight', 's14') : null);
      it.addEventListener('click', () => elegir(i));
      it.addEventListener('mousemove', () => { if(sel !== i){ sel = i; marcar(); } });
      lista.appendChild(it);
    });
    marcar();
  };
  const marcar = () => { lista.querySelectorAll('.cmdk-it').forEach(el => { const on = el.id === 'cmdk-' + sel; el.classList.toggle('on', on); el.setAttribute('aria-selected', on ? 'true' : 'false'); }); const el = document.getElementById('cmdk-' + sel); if(el){ input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block:'nearest' }); } };
  input.addEventListener('input', () => { sel = 0; pintar(); });
  input.addEventListener('keydown', e => {
    if(e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(res.length - 1, sel + 1); marcar(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel - 1); marcar(); }
    else if(e.key === 'Enter'){ e.preventDefault(); elegir(sel); }
  });
  const box = h('div', { class:'cmdk', role:'dialog', 'aria-modal':'true', 'aria-label':'Búsqueda rápida' },
    h('div', { class:'cmdk-top' }, icon('search', 's20'), input, h('kbd', { class:'cmdk-kbd' }, 'Esc')), lista,
    h('div', { class:'cmdk-pie hint' }, '↑ ↓ para moverte · Enter para abrir' + (S.role === 'admin' ? ' · pega un código de credencial para verificarlo' : '')));
  const scrim = h('div', { class:'scrim' });
  const wrap = h('div', { class:'cmdk-wrap' }, box);
  const cerrar = () => { if(!CMDK) return; untrap(); wrap.remove(); scrim.remove(); document.body.style.overflow = ''; CMDK = null; if(prev && prev.focus && document.contains(prev)) prev.focus(); };
  wrap.addEventListener('click', e => { if(e.target === wrap) cerrar(); });
  scrim.addEventListener('click', cerrar);
  document.body.appendChild(scrim); document.body.appendChild(wrap); document.body.style.overflow = 'hidden';
  const untrap = trapFocus(box, cerrar);
  CMDK = { cerrar };
  pintar();
  setTimeout(() => input.focus(), 20);
}
function botonBuscar(){
  if(S.kiosk || (S.role !== 'admin' && S.role !== 'tecnico')) return null;
  const b = h('button', { type:'button', class:'btn btn-quiet icon nav-buscar', 'aria-label':'Buscar (Ctrl+K)', title:'Buscar (Ctrl+K)' }, icon('search', 's20'));
  b.addEventListener('click', abrirBusqueda);
  return b;
}
document.addEventListener('keydown', e => {
  const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') || (document.activeElement && document.activeElement.isContentEditable);
  if(((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !escribiendo && !SHEET && !document.querySelector('.dialog-wrap'))){
    if(S.role !== 'admin' && S.role !== 'tecnico') return;
    e.preventDefault();
    if(CMDK) CMDK.cerrar(); else abrirBusqueda();
  }
});
