/* =====================================================================
   Lumine Habilita · núcleo de interfaz
   Regla de seguridad: todo dato se inserta con textContent (vía h()).
   innerHTML solo recibe constantes del propio código (íconos).
   ===================================================================== */
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const ICONS = {
  home:'<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
  users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.2 14.6c2.2.2 3.8 1.8 4.3 4.4"/>',
  user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.7 3.6-5.8 7-5.8s6.2 2.1 7 5.8"/>',
  userPlus:'<circle cx="10" cy="8.5" r="3.5"/><path d="M3.5 20c.8-3.7 3.4-5.8 6.5-5.8 1.4 0 2.7.4 3.8 1.2"/><path d="M18 14v6M15 17h6"/>',
  clipboard:'<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5v-.7c0-.5.4-.8.8-.8h4.4c.4 0 .8.3.8.8v.7"/><path d="m9 13 2 2 4-4.5"/>',
  duo:'<circle cx="8.5" cy="12" r="4.8"/><circle cx="15.5" cy="12" r="4.8"/>',
  chart:'<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6" rx="1"/><rect x="11" y="6" width="3" height="11" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>',
  book:'<path d="M12 6.5C10.3 5.2 8 4.5 4.5 4.5v13c3.5 0 5.8.7 7.5 2 1.7-1.3 4-2 7.5-2v-13c-3.5 0-5.8.7-7.5 2z"/><path d="M12 6.5v13"/>',
  settings:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
  layers:'<path d="m12 4 8 4-8 4-8-4z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/>',
  calendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  bolt:'<path d="M13 3 5.5 13.5H11l-1 7.5 7.5-10.5H12z"/>',
  shield:'<path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.8 7 9 4.1-1.2 7-4.7 7-9V6z"/>',
  shieldCheck:'<path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.8 7 9 4.1-1.2 7-4.7 7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  shieldX:'<path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.8 7 9 4.1-1.2 7-4.7 7-9V6z"/><path d="m9.5 9.5 5 5M14.5 9.5l-5 5"/>',
  wrench:'<path d="M15 4.5a4.5 4.5 0 0 0-4.2 6.1L4.6 16.8a2.1 2.1 0 1 0 3 3l6.2-6.2A4.5 4.5 0 0 0 19.5 9l-2.8 2.8-2.9-.6-.6-2.9L16 5.5c-.3-.6-.6-1-1-1z"/>',
  battery:'<rect x="3" y="7.5" width="16" height="9" rx="2"/><path d="M21 10.5v3M7 12h4M9 10v4"/>',
  car:'<path d="M3.5 16.5v-3.2c0-.9.5-1.7 1.3-2.1L7 10l1.8-3.3c.3-.6 1-1 1.7-1h3c.7 0 1.4.4 1.7 1L17 10l2.2 1.2c.8.4 1.3 1.2 1.3 2.1v3.2H3.5z"/><circle cx="7.5" cy="16.5" r="1.9"/><circle cx="16.5" cy="16.5" r="1.9"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  checkCircle:'<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/>',
  x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  xCircle:'<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  alert:'<path d="M10.3 4.6 3 17.5A2 2 0 0 0 4.7 20.5h14.6a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.5M12 17.2v.1"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.9v.1"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  unlock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.5"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  upload:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevDown:'<path d="m6 9 6 6 6-6"/>',
  chevRight:'<path d="m9 6 6 6-6 6"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  more:'<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>',
  sun:'<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  monitor:'<rect x="3.5" y="4.5" width="17" height="11.5" rx="2"/><path d="M9 20h6M12 16v4"/>',
  tablet:'<rect x="5.5" y="3" width="13" height="18" rx="2.2"/><path d="M11 18h2"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  flame:'<path d="M12 3.5c.5 3-2.5 4.5-2.5 7.5a2.5 2.5 0 0 0 5 0c0-.9-.3-1.7-.8-2.4 2.4 1.3 4.3 3.7 4.3 6.4a6 6 0 0 1-12 0c0-4.8 4.5-7 6-11.5z"/>',
  aid:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
  pen:'<path d="M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  database:'<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
  refresh:'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9"/><path d="M19.5 4.5V9H15"/>',
  trash:'<path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 13h9l1-13"/>',
  external:'<path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5"/>',
  play:'<path d="M8 5.5v13l10-6.5z"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
  grad:'<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.3 3.4 2 5.5 2s4-.7 5.5-2V11"/><path d="M21.5 9v5"/>',
  swap:'<path d="M7 7.5h12l-3.5-3.5M17 16.5H5l3.5 3.5"/>',
  copy:'<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  hand:'<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14a6.5 6.5 0 0 1-6.5 6.5c-2 0-3.4-.8-4.6-2.3L3.8 15.5a1.5 1.5 0 0 1 2.2-2L8 15"/>',
  file:'<path d="M6 3.5h8l4.5 4.5v12.5H6z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h6"/>',
  history:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4.5v4h4M12 8v4l2.5 1.5"/>',
  spark:'<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',
  gauge:'<path d="M4.2 16.5a8 8 0 1 1 15.6 0"/><path d="m12 15.5 3.5-5"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16.5 6.5l2 2M14 9l1.5 1.5"/>',
  stop:'<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
  logout:'<path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4M9.5 16.5 5 12l4.5-4.5M5 12h10"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  cube:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  table:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16M10 10v9"/>'
};
function icon(name, cls){
  const el = document.createElementNS(SVGNS, 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', '1.75');
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  el.setAttribute('class', 'ic' + (cls ? ' ' + cls : ''));
  el.innerHTML = ICONS[name] || ICONS.info; // constante, nunca dato
  return el;
}

/* ---------- h(): constructor de DOM seguro ---------- */
function addKids(el, kids){
  for(const k of kids.flat(Infinity)){
    if(k === null || k === undefined || k === false || k === true) continue;
    el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
function h(tag, props, ...kids){
  const el = document.createElement(tag);
  if(props) setProps(el, props);
  addKids(el, kids);
  return el;
}
function s(tag, props, ...kids){
  const el = document.createElementNS(SVGNS, tag);
  if(props) setProps(el, props);
  addKids(el, kids);
  return el;
}
/* Eventos permitidos en { on:{…} }. Un atributo on* (onclick="…") nunca se escribe:
   así, aunque algún día un dato llegue como nombre de propiedad, no se vuelve código. */
const EVENTOS_OK = new Set(['click','input','change','keydown','keyup','focus','blur','focusin','focusout','submit','pointerdown','pointerup','pointermove','pointerenter','pointerleave','dragstart','dragover','dragend','drop','touchstart','touchend','scroll','mouseenter','mouseleave']);
const ATRIB_BLOQ = /^(on|srcdoc$|formaction$)/i;
function setProps(el, props){
  for(const k in props){
    const v = props[k];
    if(v === null || v === undefined || v === false) continue;
    if(k === 'class') el.setAttribute('class', v);
    else if(k === 'on'){ for(const ev in v){ if(typeof v[ev] !== 'function') continue; if(!EVENTOS_OK.has(ev)){ console.warn('Evento no permitido:', ev); continue; } el.addEventListener(ev, v[ev]); } }
    else if(ATRIB_BLOQ.test(k)){ console.warn('Atributo bloqueado:', k); continue; }
    else if(k === 'text') el.textContent = v;
    else if(k === 'value' && ('value' in el) && el.namespaceURI !== SVGNS) el.value = v;
    else if(k === 'checked') el.checked = !!v;
    else if(k === 'dataset') Object.assign(el.dataset, v);
    else if(k === 'href'){ const sv = String(v); if(/^\s*javascript:/i.test(sv)) continue; el.setAttribute('href', sv); }
    else if(k === 'ref'){ v(el); }
    else el.setAttribute(k, v === true ? '' : String(v));
  }
}
const $ = (sel, root) => (root || document).querySelector(sel);
function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); return el; }
function frag(...kids){ const f = document.createDocumentFragment(); addKids(f, kids); return f; }

/* ---------- piezas reutilizables ---------- */
function btn(label, opts){
  opts = opts || {};
  const b = h('button', { type: opts.submit ? 'submit' : 'button', class:'btn ' + (opts.kind ? 'btn-' + opts.kind : 'btn-ghost') + (opts.size ? ' ' + opts.size : '') + (opts.cls ? ' ' + opts.cls : ''),
    'aria-label': opts.aria || null, title: opts.title || null, disabled: opts.disabled || null, on: opts.onClick ? { click: opts.onClick } : null },
    opts.icon ? icon(opts.icon, 's16') : null, label);
  return b;
}
function linkBtn(label, hash, opts){
  opts = opts || {};
  return h('a', { class:'btn ' + (opts.kind ? 'btn-' + opts.kind : 'btn-ghost') + (opts.size ? ' ' + opts.size : ''), href:'#' + hash }, opts.icon ? icon(opts.icon, 's16') : null, label, opts.arrow ? icon('arrowRight', 's16') : null);
}
/* Ejecuta una acción asíncrona bloqueando el botón (evita doble clic). */
async function busy(button, fn){
  if(button && button.classList.contains('busy')) return;
  if(button){ button.classList.add('busy'); button.setAttribute('aria-busy', 'true'); button.disabled = true; }
  try { return await fn(); }
  catch(e){ toast(errMsg(e), 'crit'); console.error(e); }
  finally { if(button){ button.classList.remove('busy'); button.removeAttribute('aria-busy'); button.disabled = false; } }
}
function badge(text, kind, ic){ return h('span', { class:'badge' + (kind ? ' ' + kind : '') }, ic ? icon(ic) : null, text); }
function codeTag(c){ return h('span', { class:'code' }, c); }
function eyebrow(text, ic, cls){ return h('span', { class:'eyebrow' + (cls ? ' ' + cls : '') }, ic ? icon(ic, 's16') : null, text); }
function avatar(name, color, cls){ const a = h('span', { class:'av' + (cls ? ' ' + cls : ''), 'aria-hidden':'true' }, iniciales(name)); if(color) a.style.background = color; return a; }
function emptyState(ic, title, text, action){ return h('div', { class:'empty' }, icon(ic), h('div', { class:'h4', style:'color:var(--ink)' }, title), text ? h('p', { class:'small' }, text) : null, action || null); }
function notice(kind, ic, ...kids){ return h('div', { class:'notice ' + (kind || ''), role: kind === 'crit' ? 'alert' : null }, icon(ic || 'info'), h('div', null, ...kids)); }
function prioTag(p){ return badge(PRIORIDAD[p].l, p === 'core' ? 'info' : p === 'oficio' ? 'ink' : 'line'); }
function critTag(k){ return badge(CRITICIDAD[k].l + ' · ' + CRITICIDAD[k].a, k === 'comp' ? 'line' : 'warn', k === 'seg' ? 'shield' : k === 'prod' ? 'bolt' : null); }
function pips(n){ return h('span', { class:'pips', 'aria-label':'Nivel ' + n + ' de 4', role:'img' }, [1,2,3,4].map(i => h('i', { class: i < n ? 'on' : i === n ? 'now' : '' }))); }
function nivelBadge(n){ return badge(n >= 1 ? 'Nivel ' + n + ' · ' + NIVEL[n].corto : 'En formación', n >= 3 ? 'ink' : n >= 1 ? 'info' : 'line'); }
function tile(c, extra){
  const x = C[c];
  const b = h('button', { type:'button', class:'tile ' + x.p + (extra ? ' ' + extra : ''), 'aria-label': c + ': ' + x.t + ' (' + PRIORIDAD[x.p].l + ', ' + CRITICIDAD[x.k].l + ')', dataset:{ c } });
  b.addEventListener('mouseenter', ev => showTip(b, tileTip(c, extra)));
  b.addEventListener('focus', ev => showTip(b, tileTip(c, extra)));
  b.addEventListener('mouseleave', hideTip);
  b.addEventListener('blur', hideTip);
  return b;
}
function tileTip(c, extra){
  const x = C[c];
  const st = /skip/.test(extra || '') ? 'Demostrada en la jornada técnica' : /fail/.test(extra || '') ? 'Reprobada: se repite' : /done/.test(extra || '') ? 'Aprobada' : null;
  return frag(h('b', null, c + ' · ' + PRIORIDAD[x.p].l), h('div', null, x.t), h('div', { class:'tl' }, 'Nivel ' + x.n + ' · ' + CRITICIDAD[x.k].l + ' ' + CRITICIDAD[x.k].a + ' · ' + EVALUA[x.e] + ' · ' + VALIDA[x.v]), st ? h('div', { class:'tl' }, st) : null);
}

/* ---------- tooltip único ---------- */
let TIP = null;
function showTip(anchor, content, pt){
  if(!TIP){ TIP = h('div', { class:'tip', role:'tooltip' }); document.body.appendChild(TIP); }
  clear(TIP); addKids(TIP, [content]);
  TIP.classList.add('on');
  const r = anchor.getBoundingClientRect();
  const tw = TIP.offsetWidth, th = TIP.offsetHeight;
  let x = pt ? pt.x - tw / 2 : r.left + r.width / 2 - tw / 2;
  let y = (pt ? pt.y : r.top) - th - 10;
  if(y < 8) y = (pt ? pt.y : r.bottom) + 12;
  x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
  TIP.style.left = x + 'px'; TIP.style.top = y + 'px';
}
function hideTip(){ if(TIP) TIP.classList.remove('on'); }

/* ---------- avisos ---------- */
function toast(msg, kind){
  let box = $('#toasts');
  if(!box){ box = h('div', { id:'toasts', class:'toasts', role:'status', 'aria-live':'polite' }); document.body.appendChild(box); }
  const t = h('div', { class:'toast ' + (kind || 'ok') }, icon(kind === 'crit' ? 'xCircle' : kind === 'warn' ? 'alert' : kind === 'info' ? 'info' : 'checkCircle'), h('span', null, msg));
  box.appendChild(t);
  setTimeout(() => { t.classList.add('leave'); setTimeout(() => t.remove(), 250); }, kind === 'crit' ? 6000 : 3400);
}

/* ---------- foco atrapado para diálogos y hojas ---------- */
function trapFocus(container, onEsc){
  const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const key = e => {
    if(e.key === 'Escape'){ e.preventDefault(); onEsc(); return; }
    if(e.key !== 'Tab') return;
    const f = Array.from(container.querySelectorAll(sel)).filter(x => x.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', key);
  return () => container.removeEventListener('keydown', key);
}

/* ---------- diálogo de confirmación (reemplaza confirm/prompt) ---------- */
function dialog(o){
  return new Promise(resolve => {
    const prev = document.activeElement;
    const wrap = h('div', { class:'dialog-wrap' });
    const scrim = h('div', { class:'scrim' });
    let motivoEl = null, extra = null;
    const close = (val) => { untrap(); wrap.remove(); scrim.remove(); document.body.style.overflow = ''; if(prev && prev.focus) prev.focus(); resolve(val); };
    if(o.motivo){
      motivoEl = h('textarea', { class:'textarea', id:'dlg-motivo', maxlength:'400', placeholder:o.motivo.placeholder || '' });
      extra = h('div', { class:'field', style:'margin-top:14px' }, h('label', { class:'label', for:'dlg-motivo' }, o.motivo.label || 'Motivo'), motivoEl, o.motivo.hint ? h('span', { class:'hint' }, o.motivo.hint) : null);
    }
    const ok = btn(o.confirm || 'Confirmar', { kind: o.danger ? 'danger' : (o.kind || 'owner'), cls: o.danger ? 'solid' : '' });
    const cancel = btn(o.cancel || 'Cancelar', { kind:'ghost' });
    const err = h('p', { class:'hint', style:'color:var(--crit);margin-top:8px', role:'alert' });
    ok.addEventListener('click', () => {
      const m = motivoEl ? motivoEl.value.trim() : '';
      if(o.motivo && o.motivo.required && m.length < (o.motivo.min || 5)){ err.textContent = 'Escribe el motivo (mínimo ' + (o.motivo.min || 5) + ' caracteres).'; motivoEl.focus(); return; }
      close({ ok:true, motivo:m });
    });
    cancel.addEventListener('click', () => close(null));
    scrim.addEventListener('click', () => close(null));
    const box = h('div', { class:'dialog' + (o.wide ? ' wide' : ''), role:'dialog', 'aria-modal':'true', 'aria-labelledby':'dlg-t' },
      o.icon ? h('div', { class:'dlg-ic ' + (o.danger ? 'crit' : o.iconKind || 'info') }, icon(o.icon, 's20')) : null,
      h('h2', { id:'dlg-t' }, o.title),
      o.body ? (o.body instanceof Node ? o.body : h('p', { class:'body', style:'font-size:15px' }, o.body)) : null,
      extra, err,
      h('div', { class:'dlg-actions' }, o.noCancel ? null : cancel, ok));
    wrap.appendChild(box);
    wrap.addEventListener('click', e => { if(e.target === wrap) close(null); });
    document.body.appendChild(scrim); document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    const untrap = trapFocus(box, () => close(null));
    setTimeout(() => (motivoEl || ok).focus(), 30);
  });
}

/* ---------- hoja lateral (tablet y PC) o inferior (teléfono) ---------- */
let SHEET = null;
function openSheet(title, build, opts){
  closeSheet();
  opts = opts || {};
  const prev = document.activeElement;
  const scrim = h('div', { class:'scrim' });
  const body = h('div', { class:'sheet-b' });
  const closeB = h('button', { type:'button', class:'btn btn-quiet icon sm', 'aria-label':'Cerrar' }, icon('x', 's20'));
  const panel = h('div', { class:'sheet' + (opts.wide ? ' wide' : ''), role:'dialog', 'aria-modal':'true', 'aria-label': title },
    h('div', { class:'sheet-grip' }),
    h('div', { class:'sheet-h' }, h('h2', { class:'h3' }, title), closeB), body);
  const close = () => { if(!SHEET) return; SHEET.untrap(); scrim.remove(); panel.remove(); document.body.style.overflow = ''; SHEET = null; if(prev && prev.focus && document.contains(prev)) prev.focus(); if(opts.onClose) opts.onClose(); };
  closeB.addEventListener('click', close); scrim.addEventListener('click', close);
  addKids(body, [build(close)]);
  document.body.appendChild(scrim); document.body.appendChild(panel);
  document.body.style.overflow = 'hidden';
  SHEET = { close, untrap: trapFocus(panel, close), body, rebuild: () => { clear(body); addKids(body, [build(close)]); } };
  setTimeout(() => { const f = panel.querySelector('[autofocus]') || closeB; f.focus(); }, 40);
  return close;
}
function closeSheet(){ if(SHEET) SHEET.close(); }

/* ---------- campos de formulario ---------- */
let FID = 0;
function field(label, input, hint){
  const id = input.id || ('f' + (++FID));
  input.id = id;
  return h('div', { class:'field' }, h('label', { class:'label', for:id }, label), input, hint ? h('span', { class:'hint' }, hint) : null);
}
function inputEl(o){ return h('input', Object.assign({ class:'input', type:'text', autocomplete:'off' }, o)); }
function selectEl(options, value, o){
  const sel = h('select', Object.assign({ class:'select' }, o || {}));
  for(const [v, l] of options){ const op = h('option', { value:v }, l); if(String(v) === String(value)) op.selected = true; sel.appendChild(op); }
  return sel;
}
function segmented(options, value, onChange, o){
  o = o || {};
  const wrap = h('div', { class:'seg', role:'group', 'aria-label': o.label || null });
  for(const opt of options){
    const b = h('button', { type:'button', 'aria-pressed': String(opt.v) === String(value) ? 'true' : 'false' }, opt.ic ? icon(opt.ic, 's16') : null, opt.l, opt.n !== undefined ? h('span', { class:'count' }, opt.n) : null);
    b.addEventListener('click', () => { for(const x of wrap.children) x.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-pressed', 'true'); onChange(opt.v); });
    wrap.appendChild(b);
  }
  return wrap;
}
function tabs(options, value, onChange){
  const wrap = h('div', { class:'tabs', role:'tablist' });
  for(const opt of options){
    const b = h('button', { type:'button', role:'tab', 'aria-selected': opt.v === value ? 'true' : 'false', tabindex: opt.v === value ? '0' : '-1' }, opt.l, opt.n !== undefined && opt.n !== null ? h('span', { class:'count' }, String(opt.n)) : null);
    b.addEventListener('click', () => onChange(opt.v));
    b.addEventListener('keydown', e => {
      if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const bs = Array.from(wrap.children); const i = bs.indexOf(b);
      const n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
    wrap.appendChild(b);
  }
  return wrap;
}

/* ---------- copiar al portapapeles (con respaldo) ---------- */
async function copiar(text, el){
  try { await navigator.clipboard.writeText(text); toast('Copiado'); }
  catch(e){ if(el && el.select){ el.focus(); el.select(); toast('Selecciona y copia con el teclado', 'info'); } else toast('No se pudo copiar', 'warn'); }
}

/* ---------- tema (preferencia local del visitante) ---------- */
function setTheme(t){
  const r = document.documentElement;
  if(t === 'light') r.setAttribute('data-lh', 'light'); else r.removeAttribute('data-lh');
  try { localStorage.setItem('lh-theme2', t === 'light' ? 'light' : 'dark'); } catch(e){}
  if(typeof Lab3D !== 'undefined') Lab3D.temaCambio();
}
function getTheme(){ try { return localStorage.getItem('lh-theme2') === 'light' ? 'light' : 'dark'; } catch(e){ return 'dark'; } }
