/* =====================================================================
   Lumine Habilita · movimiento
   Microinteracciones con propósito: aparecer al hacer scroll, tarjetas
   con inclinación, botones magnéticos, barra de avance de lectura,
   cursor de foco y precarga breve. Todo se apaga con
   prefers-reduced-motion, y lo que depende del mouse solo corre con
   un puntero fino (nunca en teléfonos ni tablets táctiles).
   Estado de reposo siempre visible: nada queda oculto esperando
   a un observador.
   ===================================================================== */
'use strict';

const Motion = (() => {
  const mq = q => !!(window.matchMedia && matchMedia(q).matches);
  const quieto = () => mq('(prefers-reduced-motion: reduce)');
  const fino = () => mq('(hover: hover) and (pointer: fine)');

  /* ---------- aparecer al entrar en pantalla ----------
     El elemento parte visible. Al acercarse al viewport recibe una
     animación corta de entrada; si no hay observador, simplemente
     se queda como está. */
  let io = null;
  function observador(){
    if(io || !window.IntersectionObserver) return io;
    io = new IntersectionObserver(es => {
      for(const e of es){
        if(!e.isIntersecting) continue;
        const el = e.target; io.unobserve(el);
        el.classList.add('rv-in');
      }
    }, { rootMargin:'0px 0px 12% 0px', threshold:0 });
    return io;
  }
  function revelar(root, animar){
    const els = root.querySelectorAll('[data-rv]:not(.rv-in):not(.rv-done)');
    if(!els.length) return;
    if(!animar || quieto() || !fino() || !observador()){ els.forEach(el => el.classList.add('rv-done')); return; }
    const alto = window.innerHeight || 800;
    let k = 0;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      // lo que ya está en pantalla entra en cascada; lo de abajo, al llegar
      if(r.top < alto && r.bottom > 0){ el.style.setProperty('--rv-d', Math.min(k++, 8) * 70 + 'ms'); el.classList.add('rv-in'); }
      else io.observe(el);
    });
  }
  /* cascada dentro de un grupo: [data-stagger] reparte el retardo a sus hijos */
  function cascada(root){
    root.querySelectorAll('[data-stagger]').forEach(g => {
      const paso = Number(g.dataset.stagger) || 18;
      Array.from(g.querySelectorAll('[data-st]')).forEach((el, i) => el.style.setProperty('--st-d', Math.min(i * paso, 900) + 'ms'));
    });
  }

  /* ---------- inclinación de tarjetas ---------- */
  function inclinar(root){
    if(!fino() || quieto()) return;
    root.querySelectorAll('[data-tilt]:not([data-tilt-on])').forEach(el => {
      el.setAttribute('data-tilt-on', '');
      const max = Number(el.dataset.tilt) || 6;
      let raf = 0, px = 0, py = 0;
      const pintar = () => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const x = (px - r.left) / r.width, y = (py - r.top) / r.height;
        el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      };
      el.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; el.classList.add('tilting'); if(!raf) raf = requestAnimationFrame(pintar); });
      el.addEventListener('pointerleave', () => { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- botones magnéticos ---------- */
  function magnetizar(root){
    if(!fino() || quieto()) return;
    root.querySelectorAll('[data-mag]:not([data-mag-on])').forEach(el => {
      el.setAttribute('data-mag-on', '');
      const f = Number(el.dataset.mag) || 0.22;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * f).toFixed(1) + 'px,' + (dy * f * 1.2).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- paralaje suave ([data-px] = factor) ---------- */
  const PX = new Set();
  function paralaje(root){
    if(quieto() || !fino()) return;
    root.querySelectorAll('[data-px]').forEach(el => PX.add(el));
    moverPx();
  }
  function moverPx(){
    for(const el of PX){
      if(!document.body.contains(el)){ PX.delete(el); continue; }
      const r = el.getBoundingClientRect();
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty('--py', (c * -Number(el.dataset.px) * 60).toFixed(1) + 'px');
    }
  }

  /* ---------- barra de lectura ---------- */
  let barra = null;
  function progreso(){
    if(!barra){ barra = h('div', { class:'scrollbar-fx', 'aria-hidden':'true' }); document.body.appendChild(barra); }
    const max = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = 'scaleX(' + (max > 40 ? Math.min(1, scrollY / max) : 0).toFixed(4) + ')';
  }
  let rafS = 0;
  window.addEventListener('scroll', () => { if(rafS) return; rafS = requestAnimationFrame(() => { rafS = 0; progreso(); if(PX.size) moverPx(); }); }, { passive:true });
  window.addEventListener('resize', () => progreso(), { passive:true });

  /* ---------- cursor de foco (solo puntero fino, solo vistas públicas) ---------- */
  let cur = null, cx = -100, cy = -100, tx = -100, ty = -100, rafC = 0;
  function cursor(activo){
    document.body.classList.toggle('fx-cursor', !!activo && fino() && !quieto());
    if(!document.body.classList.contains('fx-cursor') || cur) return;
    cur = h('div', { class:'cursor-fx', 'aria-hidden':'true' });
    document.body.appendChild(cur);
    const mover = () => { rafC = 0; cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; if(Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) rafC = requestAnimationFrame(mover); };
    document.addEventListener('pointermove', e => {
      if(e.pointerType !== 'mouse'){ return; }
      tx = e.clientX; ty = e.clientY; cur.classList.add('vis');
      const t = e.target && e.target.closest ? e.target.closest('a,button,[role="button"],input,select,textarea,label,.lab-canvas') : null;
      cur.classList.toggle('on', !!t);
      cur.classList.toggle('drag', !!(t && t.classList && t.classList.contains('lab-canvas')));
      if(!rafC) rafC = requestAnimationFrame(mover);
    }, { passive:true });
    document.addEventListener('pointerdown', () => cur && cur.classList.add('down'), { passive:true });
    document.addEventListener('pointerup', () => cur && cur.classList.remove('down'), { passive:true });
    document.documentElement.addEventListener('pointerleave', () => { if(cur){ tx = ty = -100; cur.classList.remove('on'); } });
  }

  /* ---------- números que cuentan ---------- */
  function contar(el, a, dur){
    a = Number(a) || 0; dur = dur || 900;
    if(quieto()){ el.textContent = String(a); return; }
    const t0 = performance.now();
    const paso = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = String(Math.round(a * (1 - Math.pow(1 - k, 3)))); if(k < 1) requestAnimationFrame(paso); };
    el.textContent = '0';
    requestAnimationFrame(paso);
  }

  /* ---------- precarga: una vez por sesión, menos de un segundo ---------- */
  function precarga(){
    const pre = document.getElementById('pre');
    if(!pre) return;
    let visto = false;
    try { visto = sessionStorage.getItem('lh-pre') === '1'; sessionStorage.setItem('lh-pre', '1'); } catch(e){ visto = true; }
    if(visto || quieto()){ pre.remove(); return; }
    pre.classList.add('run');
    setTimeout(() => { pre.classList.add('out'); setTimeout(() => pre.remove(), 360); }, 760);
  }

  /* se llama después de cada render */
  const PUBLICAS = new Set(['inicio', 'laboratorio', 'taller']);
  function tras(root, nav, ruta){
    cascada(root);
    revelar(root, nav);
    inclinar(root);
    magnetizar(root);
    paralaje(root);
    cursor(PUBLICAS.has(ruta));
    progreso();
  }
  return { tras, contar, precarga, quieto, fino };
})();
