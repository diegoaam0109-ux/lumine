/* Motor de presentaciones Lumine · reutilizable (Fase 3, Fase 5, ...)
   Cada presentación es una carpeta con: index.html, deck-data.js (window.DECK), slides/*.jpg y video/*.mp4.
   Funciona en GitHub Pages y también abriendo index.html sin internet (pendrive). */
(function () {
  const D = window.DECK, N = D.slides.length;
  const isSpeaker = new URLSearchParams(location.search).has('orador');
  let cur = 0;
  const clamp = i => Math.max(0, Math.min(N - 1, i));
  const fromHash = () => clamp((parseInt(location.hash.slice(1), 10) || 1) - 1);
  const pad = s => String(s).padStart(2, '0');
  const fmt = sec => pad(Math.floor(sec / 60)) + ':' + pad(Math.floor(sec % 60));
  document.title = D.title;

  /* ================= VISTA DEL ORADOR ================= */
  if (isSpeaker) {
    document.body.className = 'speaker';
    document.body.innerHTML = `
      <div class="sp">
        <header>
          <div class="clock" id="clk">00:00</div>
          <div class="slideclock" id="sclk">00:00</div>
          <div class="count" id="cnt"></div>
          <button id="prev">◀ Anterior</button><button id="next">Siguiente ▶</button><button id="reset">Reiniciar reloj</button>
          <div class="who" id="who"></div>
        </header>
        <div class="cur"><div class="label">Ahora</div><img id="ic" alt=""></div>
        <div class="side">
          <div class="nxt"><div class="label">Siguiente</div><img id="in" alt=""></div>
          <div class="label">Guion</div>
          <div class="notes" id="nt"></div>
        </div>
      </div>`;
    const $ = id => document.getElementById(id);
    let t0 = Date.now(), ts = Date.now();
    const send = m => window.opener && window.opener.postMessage({ lumine: m }, '*');
    function show(i) {
      cur = i; ts = Date.now();
      const s = D.slides[i], nx = D.slides[i + 1];
      $('ic').src = s.img; $('in').src = nx ? nx.img : '';
      $('in').style.visibility = nx ? 'visible' : 'hidden';
      $('cnt').textContent = (i + 1) + ' / ' + N + (i + 1 > D.mainSlides ? ' · ANEXO' : '');
      $('who').textContent = s.who || '';
      $('nt').innerHTML = '<h3>' + (s.title || '') + '</h3>' + (s.notes || '<span class="plan">Sin notas.</span>') +
        (s.sec ? '<p class="plan">Tiempo previsto: ' + s.sec + ' s</p>' : '');
    }
    window.addEventListener('message', e => { const m = e.data && e.data.lumine; if (m && m.type === 'goto') show(m.i); });
    $('prev').onclick = () => send({ type: 'step', d: -1 });
    $('next').onclick = () => send({ type: 'step', d: 1 });
    $('reset').onclick = () => { t0 = Date.now(); ts = Date.now(); };
    document.addEventListener('keydown', e => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); send({ type: 'step', d: 1 }); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); send({ type: 'step', d: -1 }); }
    });
    setInterval(() => {
      $('clk').textContent = fmt((Date.now() - t0) / 1000);
      const el = (Date.now() - ts) / 1000, plan = D.slides[cur].sec || 0;
      $('sclk').textContent = fmt(el) + (plan ? ' / ' + fmt(plan) : '');
      $('sclk').classList.toggle('over', plan > 0 && el > plan);
    }, 250);
    show(fromHash());
    send({ type: 'hello' });
    return;
  }

  /* ================= VISTA DE PRESENTACIÓN ================= */
  document.body.innerHTML = `
    <div id="stage"><div id="frame"><img class="slide" id="img" alt=""></div></div>
    <button id="fs" title="Pantalla completa (F)">⛶ Pantalla completa</button><div id="black"></div><div id="bar"><i></i></div><div id="hud"></div><div id="jump"></div>
    <div id="help">
      <b>→ / Espacio / Re Pág</b> siguiente<br><b>← / Av Pág</b> anterior<br>
      <b>O</b> abrir vista del orador (guion y reloj)<br><b>F</b> pantalla completa<br>
      <b>N</b> pantalla negra<br><b>número + Enter</b> ir a esa lámina<br><b>Inicio / Fin</b> primera / última<br>
      <b>?</b> mostrar u ocultar esta ayuda</div>`;
  const frame = document.getElementById('frame'), img = document.getElementById('img');
  const hud = document.getElementById('hud'), bar = document.querySelector('#bar i'), jump = document.getElementById('jump');
  let speakerWin = null, extras = [], typed = '';
  const cache = {};
  const preload = i => { if (i >= 0 && i < N && !cache[i]) { cache[i] = new Image(); cache[i].src = D.slides[i].img; } };
  const place = (el, b) => Object.assign(el.style, { left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' });

  function go(i, push = true) {
    i = clamp(i); cur = i;
    const s = D.slides[i];
    extras.forEach(el => { if (el.pause) el.pause(); el.remove(); }); extras = [];
    img.src = s.img;
    if (s.video && s.video.src) {
      const v = document.createElement('video');
      Object.assign(v, { src: s.video.src, muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
      v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
      place(v, s.video.box);
      v.onclick = () => (v.paused ? v.play() : v.pause());
      frame.appendChild(v); extras.push(v);
      v.play().catch(() => {});
    }
    (s.links || []).forEach(l => {
      const a = document.createElement('a'); a.className = 'hot'; a.title = 'Ir a la lámina ' + l.to;
      place(a, l.box); a.onclick = e => { e.preventDefault(); go(l.to - 1); };
      frame.appendChild(a); extras.push(a);
    });
    if (push) history.replaceState(null, '', '#' + (i + 1));
    hud.textContent = (i + 1) + ' / ' + N + (i + 1 > D.mainSlides ? ' · ANEXO' : '');
    bar.style.width = (Math.min(i + 1, D.mainSlides) / D.mainSlides * 100) + '%';
    [i + 1, i + 2, i - 1].forEach(preload);
    if (speakerWin && !speakerWin.closed) speakerWin.postMessage({ lumine: { type: 'goto', i } }, '*');
  }
  const step = d => go(cur + d);
  function toggleFs() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
  document.getElementById('fs').onclick = toggleFs;
  frame.addEventListener('dblclick', e => { e.preventDefault(); toggleFs(); });
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('is-fs', !!document.fullscreenElement));

  function openSpeaker() {
    const url = location.pathname + '?orador#' + (cur + 1);
    speakerWin = window.open(url, 'lumine-orador', 'width=1280,height=800');
  }
  window.addEventListener('message', e => {
    const m = e.data && e.data.lumine; if (!m) return;
    if (m.type === 'step') step(m.d);
    if (m.type === 'hello' && speakerWin) speakerWin.postMessage({ lumine: { type: 'goto', i: cur } }, '*');
  });

  document.addEventListener('keydown', e => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) { typed += k; jump.textContent = 'Ir a ' + typed; jump.style.display = 'block'; return; }
    if (k === 'Enter' && typed) { go(parseInt(typed, 10) - 1); typed = ''; jump.style.display = 'none'; return; }
    if (k === 'Escape' && typed) { typed = ''; jump.style.display = 'none'; return; }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(D.mainSlides - 1);
    else if (k === 'f' || k === 'F') toggleFs();
    else if (k === 'n' || k === 'N' || k === 'b' || k === 'B' || k === '.') document.body.classList.toggle('blackout');
    else if (k === 'o' || k === 'O' || k === 's' || k === 'S') openSpeaker();
    else if (k === '?' || k === 'h' || k === 'H') document.body.classList.toggle('show-help');
  });
  // Clic en el borde derecho o izquierdo de la lámina avanza o retrocede
  frame.addEventListener('click', e => {
    if (e.target !== img) return;
    const r = frame.getBoundingClientRect();
    step(e.clientX - r.left > r.width * 0.3 ? 1 : -1);
  });
  let idle;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('idle'); document.body.classList.add('show-hud');
    clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2000);
    setTimeout(() => document.body.classList.remove('show-hud'), 2500);
  });
  window.addEventListener('hashchange', () => { const i = fromHash(); if (i !== cur) go(i, false); });
  go(fromHash(), false);
})();
