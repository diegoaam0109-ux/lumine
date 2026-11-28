/* Cifras que cuentan desde cero cuando su lámina se activa. Formato chileno: miles con punto y decimales con coma. */
(function () {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function correr(el) {
    const fin = parseFloat(el.dataset.cuenta), dec = parseInt(el.dataset.dec || '0', 10);
    const dur = parseFloat(el.dataset.dur || '1.6') * 1000, espera = parseFloat(el.dataset.espera || '0.4') * 1000;
    if (quieto) { el.textContent = fmt(fin, dec); return; }
    el.textContent = fmt(0, dec);
    const t0 = performance.now() + espera;
    (function paso(t) {
      const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(fin * e, dec);
      if (k < 1) requestAnimationFrame(paso);
    })(performance.now());
  }
  new MutationObserver(ms => ms.forEach(m => {
    if (m.target.classList.contains('on')) m.target.querySelectorAll('[data-cuenta]').forEach(correr);
  })).observe(document.getElementById('escenario'), {subtree: true, attributes: true, attributeFilter: ['class']});
})();
