/* Muestra una lámina según el hash (#lamina-N), escala el lienzo de 1920 × 1080 a la ventana
   y activa sus animaciones cuando las tipografías están listas. */
(function () {
  const esc = document.getElementById('escenario');
  const lams = [...document.querySelectorAll('.lam')];
  function ajustar() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    esc.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  function mostrar() {
    const n = parseInt((location.hash.match(/\d+/) || ['1'])[0], 10);
    lams.forEach((l, i) => { l.classList.toggle('vis', i === n - 1); l.classList.remove('on'); });
    const l = lams[n - 1] || lams[0];
    l.classList.add('vis');
    l.setAttribute('aria-label', 'Lámina ' + n);
    document.fonts.ready.then(() => requestAnimationFrame(() => l.classList.add('on')));
  }
  addEventListener('resize', ajustar); addEventListener('hashchange', mostrar);
  ajustar(); mostrar();
})();
