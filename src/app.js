/* =====================================================================
   Lumine Habilita · arranque
   ===================================================================== */
'use strict';
(function(){ if(getTheme() === 'light') document.documentElement.setAttribute('data-lh', 'light'); })();
async function boot(){
  if(typeof Motion !== 'undefined') Motion.precarga();
  const skip = h('button', { type:'button', class:'skiplink' }, 'Saltar al contenido');
  skip.addEventListener('click', () => $('#main').focus());
  document.body.insertBefore(skip, document.body.firstChild);
  const sinHash = !location.hash;
  S.firstLoad = sinHash;
  render();
  try {
    if(S.build === 'demo'){
      if(window.claude && typeof window.claude.use === 'function') S.dl = await window.claude.use('downloads').catch(() => null);
      await iniciarDemo();
    } else {
      await iniciarReal();
    }
  } catch(e){ console.error(e); S.role = S.build === 'demo' ? 'anonimo' : 'sindb'; }
  if(S.role === 'loading') S.role = 'anonimo';
  // En la versión real, administración entra por la pantalla de entrada (panel o vista previa)
  if(sinHash && S.build === 'real' && homeRoute() !== 'inicio') location.replace('#' + (S.role === 'admin' && !kioscoBloqueado() ? 'entrar' : homeRoute()));
  render();
  setInterval(() => { const h0 = hoyISO(); if(h0 !== S.hoy){ S.hoy = h0; scheduleRender(); } }, 60000);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
