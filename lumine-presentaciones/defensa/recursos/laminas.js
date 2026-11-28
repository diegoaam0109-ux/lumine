/* Láminas de la defensa: muestra la lámina del hash, escala el lienzo de 1920 × 1080, recibe los pasos (clics) desde
   el motor y hace contar las cifras cuando aparecen. Con ?todo muestra todo en su estado final (PDF y vista del orador). */
(function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const todo = q.has('todo');
  if (todo) document.documentElement.classList.add('todo');
  const quieto = todo || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = document.getElementById('escenario');
  const lams = [...document.querySelectorAll('.lam')];
  let actual = null;

  function ajustar() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    esc.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function contar(raiz) {
    raiz.querySelectorAll('[data-cuenta]').forEach(el => {
      if (el.dataset.hecho) return; el.dataset.hecho = '1';
      const fin = parseFloat(el.dataset.cuenta), dec = parseInt(el.dataset.dec || '0', 10);
      if (quieto) { el.textContent = fmt(fin, dec); return; }
      const dur = parseFloat(el.dataset.dur || '1.2') * 1000, t0 = performance.now() + parseFloat(el.dataset.espera || '0.2') * 1000;
      el.textContent = fmt(0, dec);
      (function paso(t) {
        const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(fin * e, dec);
        if (k < 1) requestAnimationFrame(paso);
      })(performance.now());
    });
  }
  /* Cuenta las cifras que no esperan un clic; las que están dentro de un paso cuentan al aparecer. */
  function contarVisibles(sec) {
    const fuera = [...sec.querySelectorAll('[data-cuenta]')].filter(el => !el.closest('[data-f]'));
    fuera.forEach(el => contar({querySelectorAll: () => [el]}));
  }
  function pasos(n) {
    if (!actual) return;
    actual.querySelectorAll('[data-f]').forEach(el => {
      const ver = todo || parseInt(el.dataset.f, 10) <= n;
      const antes = el.classList.contains('ver');
      el.classList.toggle('ver', ver);
      if (ver && !antes) contar(el);
    });
  }
  function mostrar() {
    const n = parseInt((location.hash.match(/\d+/) || ['1'])[0], 10);
    lams.forEach(l => l.classList.remove('vis', 'on'));
    actual = lams[n - 1] || lams[0];
    actual.classList.add('vis');
    actual.setAttribute('aria-label', 'Lámina ' + n);
    pasos(todo ? 99 : 0);
    document.fonts.ready.then(() => requestAnimationFrame(() => { actual.classList.add('on'); contarVisibles(actual); }));
  }
  addEventListener('message', e => {
    const m = e.data && e.data.lumine;
    if (m && m.type === 'frag') pasos(m.n);
  });
  addEventListener('resize', ajustar); addEventListener('hashchange', mostrar);
  ajustar(); mostrar();
})();
