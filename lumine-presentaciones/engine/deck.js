/* Motor local Lumine: sin librerías, fetch ni dependencias de red. */
(function () {
  'use strict';
  const D = window.DECK, N = D.slides.length;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = i => Math.max(D.intro ? -1 : 0, Math.min(N - 1, i));
  const fromHash = () => {
    const value = location.hash.slice(1);
    return !value || value === '0' ? clamp(-1) : clamp((parseInt(value, 10) || 1) - 1);
  };
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  const fmt = seconds => pad(seconds / 60) + ':' + pad(seconds % 60);
  let cur = fromHash();
  document.title = D.title;

  if (new URLSearchParams(location.search).has('orador')) {
    document.body.className = 'speaker';
    document.body.innerHTML = `<div class="sp"><header>
      <div class="clock" id="clk">00:00</div><div class="slideclock" id="sclk">00:00</div>
      <div class="count" id="cnt"></div><button id="prev">◀ Anterior</button>
      <button id="next">Siguiente ▶</button><button id="reset">Reiniciar reloj</button><div class="who" id="who"></div>
      </header><div class="cur"><div class="label">Ahora</div><img id="ic" alt="Lámina actual">
      <video id="iv" muted playsinline preload="auto" hidden></video></div>
      <div class="side"><div class="nxt"><div class="label">Siguiente</div><img id="in" alt="Lámina siguiente"></div>
      <div id="return-note" role="status"></div><div class="label">Guion</div><div class="notes" id="nt"></div></div></div>`;
    const $ = id => document.getElementById(id);
    let t0 = Date.now(), ts = t0;
    const send = m => window.opener && window.opener.postMessage({lumine: m}, '*');
    function show(i, origin = null) {
      if (!Number.isInteger(i)) return;
      i = clamp(i);
      if (cur !== i) ts = Date.now();
      cur = i;
      const s = D.slides[i], nx = D.slides[i + 1];
      $('ic').hidden = i < 0; $('iv').hidden = i >= 0;
      if (s) { $('ic').src = s.img; $('iv').pause(); }
      else if (!$('iv').getAttribute('src')) $('iv').src = D.intro;
      if (nx) $('in').src = nx.img;
      else $('in').removeAttribute('src');
      $('in').style.visibility = nx ? 'visible' : 'hidden';
      $('cnt').textContent = s ? `${i + 1} / ${N}${i + 1 > D.mainSlides ? ' · ANEXO' : ''}` : 'Apertura';
      $('who').textContent = s?.who || '';
      $('nt').innerHTML = s ? `<h3>${s.title || ''}</h3>${s.notes || '<span class="plan">Sin notas.</span>'}${s.sec ? `<p class="plan">Tiempo previsto: ${s.sec} s</p>` : ''}` : '<h3>Apertura</h3><p>Video del kit. Al terminar continúa la lámina 1. → o clic para saltarlo.</p>';
      $('return-note').textContent = origin !== null && (D.annex || []).some(a => a.slide === i + 1) ? `Volver con Esc a ${origin < 0 ? 'la apertura' : 'la lámina ' + (origin + 1)}` : '';
    }
    window.addEventListener('message', e => {
      if (e.source !== window.opener) return;
      const m = e.data?.lumine;
      if (m?.type === 'goto') show(m.i, m.origin);
    });
    $('prev').onclick = () => send({type: 'step', d: -1});
    $('next').onclick = () => send({type: 'step', d: 1});
    $('reset').onclick = () => { t0 = ts = Date.now(); };
    document.addEventListener('keydown', e => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); send({type: 'step', d: 1}); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); send({type: 'step', d: -1}); }
      else if (['Escape', 'Home', 'End'].includes(e.key)) { e.preventDefault(); send({type: 'key', key: e.key}); }
    });
    setInterval(() => {
      $('clk').textContent = fmt((Date.now() - t0) / 1000);
      const elapsed = (Date.now() - ts) / 1000, plan = D.slides[cur]?.sec || 0;
      $('sclk').textContent = fmt(elapsed) + (plan ? ' / ' + fmt(plan) : '');
      $('sclk').classList.toggle('over', plan > 0 && elapsed > plan);
    }, 250);
    show(cur); send({type: 'hello'});
    return;
  }

  document.body.innerHTML = `<div id="stage"><div id="frame" tabindex="-1" aria-label="Presentación"></div></div>
    <button id="fs" title="Pantalla completa (F)">⛶ Pantalla completa</button><div id="black"></div>
    <div id="bar"><i></i></div><div id="hud" aria-live="polite"></div><div id="jump"></div>
    <div id="help" role="note"><b>→ / Espacio / AvPág</b> siguiente · saltar apertura<br><b>← / RePág</b> anterior<br>
    <b>O</b> vista del orador (guion y reloj)<br><b>F</b> pantalla completa<br><b>N</b> pantalla negra<br>
    <b>Número + Enter</b> ir a esa lámina (0: apertura)<br><b>Inicio / Fin</b> apertura / cierre<br>
    <b>Z</b> lupa: clic para ampliar o mover el foco; Z / Esc para salir<br>
    <b>L</b> activar / apagar puntero láser<br><b>P</b> buscar anexos; ↑↓ elegir, Enter abrir<br>
    <b>Esc</b> salir de lupa o volver desde preguntas a la lámina de origen<br><b>?</b> mostrar u ocultar esta ayuda</div>
    <dialog id="questions" aria-labelledby="questions-title"><div class="questions-head"><div>
      <span class="eyebrow">DEFENSA · 14 ANEXOS</span><h2 id="questions-title">Preguntas y respaldo</h2></div>
      <button id="questions-close" aria-label="Cerrar preguntas y volver">Esc · Volver</button></div>
      <label for="annex-search">Busca por tema, pregunta o código</label>
      <input id="annex-search" type="search" placeholder="Ej.: dólar, financiamiento, A5…" autocomplete="off" role="combobox" aria-controls="annex-list" aria-expanded="true" aria-autocomplete="list">
      <p id="annex-count" role="status"></p><div id="annex-list" role="listbox" aria-label="Anexos"></div>
      <p class="questions-hint">↑ ↓ Seleccionar · Enter Abrir · Esc Volver a la lámina de origen</p></dialog>`;
  const $ = id => document.getElementById(id), frame = $('frame');
  let scene = null, transition = null, speakerWin = null, typed = '';
  let zoom = false, laser = false, returnOrigin = null;
  const cached = new Map();
  const preload = i => { if (D.slides[i] && !cached.has(i)) { const img = new Image(); img.src = D.slides[i].img; cached.set(i, img); } };
  const place = (el, b) => Object.assign(el.style, {left: b.x + '%', top: b.y + '%', width: b.w + '%', ...(b.h ? {height: b.h + '%'} : {})});
  const notifySpeaker = () => { if (speakerWin && !speakerWin.closed) speakerWin.postMessage({lumine: {type: 'goto', i: cur, origin: returnOrigin}}, '*'); };
  const finishTransition = () => transition?.finish();
  function dispose(layer) { layer?.querySelectorAll('video').forEach(v => v.pause()); layer?.remove(); }
  function setZoom(on) {
    zoom = on && cur >= 0;
    frame.classList.toggle('zoom-mode', zoom);
    if (scene) { const c = scene.querySelector('.content'); c.style.transform = ''; c.style.transformOrigin = ''; }
  }
  function makeScene(i) {
    const layer = document.createElement('div'); layer.className = 'scene'; layer.dataset.slide = i + 1;
    const content = document.createElement('div'); content.className = 'content'; layer.appendChild(content);
    function video(src, intro) {
      const v = document.createElement('video');
      Object.assign(v, {src, muted: true, loop: !intro, playsInline: true, autoplay: true, preload: 'auto'});
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      if (intro) { v.className = 'intro-video'; v.onended = () => { if (scene === layer && cur < 0) go(0); }; }
      else { place(v, D.slides[i].video.box); v.onclick = () => v.paused ? v.play().catch(() => {}) : v.pause(); }
      content.appendChild(v); return v;
    }
    if (i < 0) video(D.intro, true);
    else {
      const s = D.slides[i], img = document.createElement('img');
      img.className = 'slide'; img.src = s.img; img.alt = s.title || `Lámina ${i + 1}`; img.draggable = false;
      content.appendChild(img);
      if (s.video?.src) video(s.video.src, false);
      for (const l of s.links || []) {
        const a = document.createElement('a'); a.className = 'hot'; a.href = '#' + l.to;
        a.title = a.ariaLabel = 'Ir a la lámina ' + l.to; place(a, l.box);
        a.onclick = e => { e.preventDefault(); go(l.to - 1, {jump: true}); }; content.appendChild(a);
      }
      if (s.qr) {
        const a = document.createElement('a'); a.className = 'closing-qr'; a.href = s.qr.url;
        a.target = '_blank'; a.rel = 'noopener noreferrer'; a.ariaLabel = 'Prueba la página comercial (abre otra pestaña)';
        place(a, s.qr.box);
        const q = document.createElement('img'); q.src = s.qr.src; q.alt = 'QR a la página comercial de Lumine';
        const label = document.createElement('span'); label.textContent = 'Prueba la página comercial';
        a.append(q, label); content.appendChild(a);
      }
    }
    return layer;
  }
  function go(i, {push = true, jump = false, immediate = false} = {}) {
    finishTransition(); i = clamp(i);
    if (scene && cur === i) { if (i < 0) { const v = scene.querySelector('video'); v.currentTime = 0; v.play().catch(() => {}); } return; }
    setZoom(false);
    const prev = cur, old = scene;
    old?.querySelectorAll('video').forEach(v => v.pause());
    cur = i; scene = makeScene(i); frame.insertBefore(scene, canvas);
    scene.querySelectorAll('video').forEach(v => v.play().catch(() => {}));
    if (push) history.replaceState(null, '', '#' + (i + 1));
    frame.dataset.slide = i + 1;
    $('hud').textContent = i < 0 ? 'Apertura' : `${i + 1} / ${N}${i + 1 > D.mainSlides ? ' · ANEXO' : ''}`;
    $('bar').firstElementChild.style.width = (i < 0 ? 0 : Math.min(i + 1, D.mainSlides) / D.mainSlides * 100) + '%';
    [i + 1, i + 2, i - 1].forEach(preload); notifySpeaker();
    if (!old || immediate || motion.matches) { dispose(old); return; }
    const fade = prev < 0 || i < 0, duration = fade ? 400 : (jump || Math.abs(i - prev) !== 1 ? 250 : 500);
    const forward = i > prev;
    const animations = [], next = scene;
    let line;
    if (fade) animations.push(next.animate([{opacity: 0}, {opacity: 1}], {duration, fill: 'both'}));
    else {
      animations.push(next.animate([{clipPath: forward ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)'}, {clipPath: 'inset(0 0 0 0)'}], {duration, fill: 'both'}));
      line = document.createElement('div'); line.className = 'sweep'; frame.insertBefore(line, canvas);
      animations.push(line.animate([{left: forward ? '0%' : '100%'}, {left: forward ? '100%' : '0%'}], {duration, fill: 'both'}));
    }
    let ended = false;
    const finish = () => {
      if (ended) return; ended = true;
      animations.forEach(a => a.cancel()); line?.remove(); dispose(old);
      frame.classList.remove('transitioning'); transition = null;
    };
    frame.classList.add('transitioning'); transition = {finish};
    animations[0].onfinish = finish;
  }
  const step = d => go(Math.max(0, cur + d));
  function toggleFs() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
  $('fs').onclick = toggleFs;
  frame.addEventListener('dblclick', e => { if (!zoom && !laser && cur >= 0) { e.preventDefault(); toggleFs(); } });
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('is-fs', !!document.fullscreenElement));
  function openSpeaker() { speakerWin = window.open(location.pathname + '?orador#' + (cur + 1), 'lumine-orador', 'width=1280,height=800'); }
  window.addEventListener('message', e => {
    if (!speakerWin || e.source !== speakerWin) return;
    const m = e.data?.lumine;
    if (m?.type === 'step' && [-1, 1].includes(m.d)) step(m.d);
    if (m?.type === 'hello') notifySpeaker();
    if (m?.type === 'key') {
      if (m.key === 'Home') go(-1, {jump: true});
      if (m.key === 'End') go(D.mainSlides - 1, {jump: true});
      if (m.key === 'Escape') returnFromQuestions();
    }
  });

  /* Lupa: transforma la capa completa, no solo la imagen. */
  frame.addEventListener('click', e => {
    finishTransition();
    if (cur < 0) { e.preventDefault(); e.stopPropagation(); go(0); return; }
    if (zoom) {
      e.preventDefault(); e.stopPropagation();
      const content = scene.querySelector('.content'), r = content.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
      const y = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
      content.style.transformOrigin = `${x}% ${y}%`; content.style.transform = 'scale(2.5)';
    } else if (laser) { e.preventDefault(); e.stopPropagation(); }
    else if (e.target.matches('img.slide')) {
      const r = frame.getBoundingClientRect(); step(e.clientX - r.left > r.width * 0.3 ? 1 : -1);
    }
  }, true);

  /* Láser: canvas local, sin interceptar enlaces ni eventos del marco. */
  const canvas = document.createElement('canvas'); canvas.id = 'laser'; canvas.ariaHidden = 'true'; frame.appendChild(canvas);
  const ctx = canvas.getContext('2d'); let point = null, trail = [], raf = 0;
  function sizeLaser() {
    const r = frame.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawLaser();
  }
  function drawLaser() {
    cancelAnimationFrame(raf); raf = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!laser || !point) return;
    const now = performance.now(); trail = motion.matches ? [] : trail.filter(p => now - p.t < 250);
    const dot = (p, radius, alpha) => {
      ctx.globalAlpha = alpha; ctx.fillStyle = '#12AAE9'; ctx.shadowColor = '#12AAE9'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
    };
    trail.forEach(p => dot(p, 4, (1 - (now - p.t) / 250) * 0.45));
    dot(point, 7, 1); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (trail.length) raf = requestAnimationFrame(drawLaser);
  }
  function setLaser(on) { laser = on; frame.classList.toggle('laser-mode', laser); trail = []; if (!on) point = null; drawLaser(); }
  frame.addEventListener('pointermove', e => {
    if (!laser) return;
    const r = frame.getBoundingClientRect();
    if (point && !motion.matches) trail.push({...point, t: performance.now()});
    trail = trail.slice(-12); point = {x: e.clientX - r.left, y: e.clientY - r.top}; drawLaser();
  });
  frame.addEventListener('pointerleave', () => { point = null; trail = []; drawLaser(); });
  new ResizeObserver(sizeLaser).observe(frame);
  motion.addEventListener('change', () => { finishTransition(); trail = []; drawLaser(); });

  /* Preguntas: índice independiente del contenido de las láminas. */
  const dialog = $('questions'), search = $('annex-search'), list = $('annex-list');
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let filtered = [], selected = 0;
  function select(index) {
    selected = Math.max(0, Math.min(filtered.length - 1, index));
    [...list.children].forEach((el, i) => el.setAttribute('aria-selected', String(i === selected)));
    const item = list.children[selected];
    if (item) { search.setAttribute('aria-activedescendant', item.id); item.scrollIntoView({block: 'nearest'}); }
    else search.removeAttribute('aria-activedescendant');
  }
  function filter() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    filtered = (D.annex || []).filter(a => terms.every(t => normalize([a.code, a.title, a.question, ...(a.keywords || [])].join(' ')).includes(t)));
    list.replaceChildren();
    filtered.forEach((a, index) => {
      const item = document.createElement('div'); item.id = 'annex-' + a.code; item.setAttribute('role', 'option');
      const code = document.createElement('span'); code.className = 'annex-code'; code.textContent = a.code;
      const content = document.createElement('div'), title = document.createElement('strong'), question = document.createElement('span');
      title.textContent = a.title; question.textContent = a.question; content.append(title, question); item.append(code, content);
      item.onclick = () => choose(index); list.appendChild(item);
    });
    $('annex-count').textContent = filtered.length ? (filtered.length === 1 ? '1 anexo disponible' : `${filtered.length} anexos disponibles`) : 'Sin resultados. Prueba con otra palabra.';
    select(0);
  }
  function openQuestions() {
    finishTransition(); setZoom(false); setLaser(false); document.body.classList.remove('show-help');
    if (returnOrigin === null) returnOrigin = cur;
    search.value = ''; dialog.showModal(); filter(); search.focus();
  }
  function choose(index) {
    const entry = filtered[index]; if (!entry) return;
    dialog.close(); frame.focus({preventScroll: true}); go(entry.slide - 1, {jump: true});
  }
  function returnFromQuestions() {
    if (dialog.open) dialog.close();
    if (returnOrigin !== null) { const origin = returnOrigin; returnOrigin = null; go(origin, {jump: true}); notifySpeaker(); }
    frame.focus({preventScroll: true});
  }
  search.addEventListener('input', filter);
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); select(selected + (e.key === 'ArrowDown' ? 1 : -1)); }
    if (e.key === 'Enter' && e.target === search) { e.preventDefault(); choose(selected); }
    if (e.key === 'Escape') { e.preventDefault(); returnFromQuestions(); }
    e.stopPropagation();
  });
  dialog.addEventListener('cancel', e => { e.preventDefault(); returnFromQuestions(); });
  $('questions-close').onclick = returnFromQuestions;

  document.addEventListener('keydown', e => {
    finishTransition();
    if (dialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key, lower = k.toLowerCase();
    if (/^[0-9]$/.test(k)) { typed += k; $('jump').textContent = 'Ir a ' + typed; $('jump').style.display = 'block'; return; }
    if (k === 'Enter' && typed) { go(parseInt(typed, 10) - 1, {jump: true}); typed = ''; $('jump').style.display = 'none'; return; }
    if (k === 'Escape') {
      if (typed) { typed = ''; $('jump').style.display = 'none'; }
      else if (zoom) setZoom(false);
      else if (returnOrigin !== null) returnFromQuestions();
      else document.body.classList.remove('show-help', 'blackout');
      return;
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); go(-1, {jump: true}); }
    else if (k === 'End') { e.preventDefault(); go(D.mainSlides - 1, {jump: true}); }
    else if (lower === 'z') { setLaser(false); setZoom(!zoom); }
    else if (lower === 'l') { setZoom(false); setLaser(!laser); }
    else if (lower === 'p') { e.preventDefault(); openQuestions(); }
    else if (lower === 'f') toggleFs();
    else if (['n', 'b', '.'].includes(lower)) document.body.classList.toggle('blackout');
    else if (['o', 's'].includes(lower)) openSpeaker();
    else if (['?', 'h'].includes(lower)) document.body.classList.toggle('show-help');
  });
  let idle, hudTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('idle'); document.body.classList.add('show-hud');
    clearTimeout(idle); clearTimeout(hudTimer);
    idle = setTimeout(() => document.body.classList.add('idle'), 2000);
    hudTimer = setTimeout(() => document.body.classList.remove('show-hud'), 2500);
  });
  window.addEventListener('hashchange', () => go(fromHash(), {push: false, jump: true}));
  go(cur, {push: false, immediate: true});
})();
