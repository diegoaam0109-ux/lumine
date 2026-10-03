/* =====================================================================
   Vista: inicio de sesión
   Demo: credenciales de prueba por rol y creación de cuenta del
   postulante, simuladas en el navegador. Producción: el diseño de
   cuentas que vive en un servidor (PRODUCCION_AUTH). Un login hecho
   solo en la página no protege nada, por eso la demo no lo presenta
   como seguridad real.
   ===================================================================== */
'use strict';

const PRODUCCION_AUTH = [
  { ic:'userPlus', t:'El postulante crea su cuenta', d:'Con su correo y una contraseña, y confirma el correo con un enlace. Nadie necesita que le envíen un link especial.' },
  { ic:'key', t:'Contraseñas solo en el servidor', d:'Se guardan con un hash lento (Argon2 o bcrypt), nunca en la página. Mínimo 8 caracteres y se rechazan las conocidas por filtraciones, como recomienda NIST SP 800-63B.' },
  { ic:'route', t:'El rol cambia solo', d:'La misma cuenta pasa de postulante a técnico cuando el Responsable Técnico crea el expediente. Formador e Ingeniería de Calibración se asignan en Ajustes.' },
  { ic:'shieldCheck', t:'Doble factor para administración', d:'Quien ve datos de todos (Responsable Técnico, Ingeniería de Calibración) entra con contraseña y un código de una app de autenticación. Administración entra solo por invitación.' },
  { ic:'lock', t:'Bloqueo y vencimiento', d:'Bloqueo temporal tras varios intentos fallidos, sesión que vence por inactividad y opción de cerrar la sesión en todos los equipos.' },
  { ic:'refresh', t:'Recuperar la contraseña', d:'Llega un enlace al correo que sirve una sola vez y vence. Nadie de Lumine conoce ni puede ver tu contraseña.' },
  { ic:'clipboard', t:'Evaluador externo sin cuenta', d:'No entra a la plataforma. Marca en el kiosco de un equipo de Lumine, con un código de un solo uso para esa validación.' },
  { ic:'database', t:'Permisos en la base, no en la pantalla', d:'Las mismas ' + DB_RULES.length + ' reglas de acceso de esta versión se aplican en el servidor: cada técnico lee solo lo suyo. Cada ingreso queda en la bitácora.' }
];

function seccionProduccion(){
  return h('section', { class:'lg-prod', 'data-rv':'' },
    h('div', { class:'stack', style:'--g:8px;margin-bottom:16px' }, eyebrow('Así funciona en producción', 'shieldCheck'),
      h('h2', { class:'h3' }, 'Cuentas propias, con correo y contraseña.'),
      h('p', { class:'small ink2', style:'max-width:70ch' }, 'Las cuentas de una plataforma real viven en un servidor de identidad. Esta página publicada no puede conectarse a uno, así que la demo simula el inicio de sesión y la versión conectada usa la identidad de claude.ai. El diseño para el lanzamiento es este:')),
    h('div', { class:'lg-grid' }, PRODUCCION_AUTH.map(x => h('div', { class:'card lg-item', 'data-tilt':'3' },
      h('span', { class:'lg-ic' }, icon(x.ic, 's20')), h('b', null, x.t), h('p', { class:'small ink2' }, x.d)))),
    h('p', { class:'hint', style:'margin-top:12px' }, 'Los datos personales se tratan según la Ley 19.628 y su reforma, la Ley 21.719.'));
}

function campoClave(o){
  const inp = inputEl(Object.assign({ type:'password', autocomplete:'current-password' }, o));
  const ver = h('button', { type:'button', class:'lg-eye', 'aria-label':'Mostrar contraseña', 'aria-pressed':'false' }, icon('eye', 's16'));
  ver.addEventListener('click', () => { const v = inp.type === 'password'; inp.type = v ? 'text' : 'password'; ver.setAttribute('aria-pressed', v ? 'true' : 'false'); ver.setAttribute('aria-label', v ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
  return { el: h('div', { class:'lg-pw' }, inp, ver), inp };
}

VIEWS.login = function(arg){
  if(S.build !== 'demo') return loginReal();
  if(S.demoRole !== 'visitante'){
    const r = DEMO_ROLES.find(x => x.id === S.demoRole);
    return page(phead({ eyebrow:'Sesión iniciada', eic:'key', title:'Ya entraste como ' + ((S.demoRole === 'postulante' && S.demoNombre) || r.n.split(' · ')[0]) + '.', lead:'Para usar otra cuenta, primero cierra esta sesión.' }),
      h('div', { class:'row' }, linkBtn('Ir a mi inicio', homeRoute(), { kind:'action', arrow:true }), btn('Cerrar sesión', { kind:'ghost', icon:'logout', onClick: () => cerrarSesionDemo().then(() => go('login')) })));
  }
  const st = ui('login', { tab: arg === 'registro' ? 'registro' : 'entrar', u:'', fallos:0, hasta:0, err:'' });
  if(arg === 'registro') st.tab = 'registro';
  const err = h('div', { class:'lg-err', role:'alert' }, st.err ? frag(icon('alert', 's16'), h('span', null, st.err)) : null);
  const ponerError = t => { st.err = t; clear(err); if(t){ err.appendChild(icon('alert', 's16')); err.appendChild(h('span', null, t)); } };
  let cuerpo;
  if(st.tab === 'entrar'){
    const u = inputEl({ value: st.u, placeholder:'Correo o usuario', autocomplete:'username', 'aria-label':'Correo o usuario', autocapitalize:'none', spellcheck:'false' });
    const pw = campoClave({ placeholder:'Contraseña', 'aria-label':'Contraseña' });
    u.addEventListener('input', () => { st.u = u.value; });
    const entrar = btn('Entrar', { kind:'action', size:'lg', icon:'arrowRight', submit:true, cls:'lg-go' });
    const form = h('form', { class:'stack', style:'--g:14px', novalidate:true },
      field('Correo o usuario', u), field('Contraseña', pw.el), err, entrar,
      h('div', { class:'row sb small' }, h('button', { type:'button', class:'linkbtn', on:{ click: () => ponerError('') || toast('En producción te llega un enlace al correo para crear una contraseña nueva. En la demo usa las cuentas de prueba.', 'info') } }, '¿Olvidaste tu contraseña?'),
        h('button', { type:'button', class:'linkbtn', on:{ click: () => { st.tab = 'registro'; st.err = ''; render(true); } } }, 'Crear cuenta de postulante')));
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const ahora = Date.now();
      if(st.hasta > ahora){ ponerError('Demasiados intentos. Espera ' + Math.ceil((st.hasta - ahora) / 1000) + ' segundos.'); return; }
      const id = u.value.trim().toLowerCase().replace(/@.*$/, '');
      const c = DEMO_CUENTAS.find(x => x.u === id);
      if(!c || pw.inp.value !== DEMO_CLAVE){
        st.fallos++; pw.inp.value = '';
        if(st.fallos >= 5){ st.hasta = ahora + 30000; st.fallos = 0; ponerError('Demasiados intentos. Se bloquea el ingreso por 30 segundos.'); }
        else ponerError('Usuario o contraseña incorrectos.');
        form.classList.remove('nope'); void form.offsetWidth; form.classList.add('nope');
        pw.inp.focus(); return;
      }
      busy(entrar, async () => { st.fallos = 0; st.err = ''; st.u = ''; await cambiarRolDemo(c.rol); });
    });
    cuerpo = form;
  } else {
    const nom = inputEl({ placeholder:'Nombre y apellido', autocomplete:'name', maxlength:'120' });
    const mail = inputEl({ type:'email', placeholder:'nombre@correo.cl', autocomplete:'email', autocapitalize:'none', spellcheck:'false', maxlength:'120' });
    const p1 = campoClave({ placeholder:'Mínimo 8 caracteres', autocomplete:'new-password', minlength:'8' });
    const p2 = campoClave({ placeholder:'Repite la contraseña', autocomplete:'new-password' });
    const crear = btn('Crear cuenta y postular', { kind:'action', size:'lg', icon:'arrowRight', submit:true, cls:'lg-go' });
    const form = h('form', { class:'stack', style:'--g:14px', novalidate:true },
      field('Nombre', nom), field('Correo', mail), field('Contraseña', p1.el), field('Confirmar contraseña', p2.el), err, crear,
      h('p', { class:'hint' }, 'Demo: la cuenta se simula en este navegador y no se guarda tu correo ni tu contraseña. En producción el correo se confirma con un enlace.'),
      h('div', { class:'row small' }, h('span', { class:'muted' }, '¿Ya tienes cuenta?'), h('button', { type:'button', class:'linkbtn', on:{ click: () => { st.tab = 'entrar'; st.err = ''; render(true); } } }, 'Entrar')));
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if(nom.value.trim().length < 3) return ponerError('Escribe tu nombre y apellido.');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) return ponerError('Revisa el correo.');
      if(p1.inp.value.length < 8) return ponerError('La contraseña debe tener al menos 8 caracteres.');
      if(p1.inp.value !== p2.inp.value) return ponerError('Las contraseñas no coinciden.');
      const nombre = nom.value.trim();
      p1.inp.value = ''; p2.inp.value = '';
      busy(crear, async () => {
        st.err = '';
        S.demoNombre = nombre;
        UI.postular = { i:1, dir:1, nombre, ant:{ perfil:'', anos:0, formacion:'', certificados:{}, experiencias:{} }, resp:{}, semilla: nuevaSemilla() };
        await cambiarRolDemo('postulante');
        toast('Cuenta creada. Sigue con tu postulación.', 'ok');
      });
    });
    cuerpo = form;
  }
  const tabsEl = h('div', { class:'seg lg-tabs', role:'tablist', 'aria-label':'Acceso' },
    [['entrar', 'Entrar'], ['registro', 'Crear cuenta']].map(([v, l]) => h('button', { type:'button', role:'tab', 'aria-selected': st.tab === v ? 'true' : 'false', on:{ click: () => { if(st.tab !== v){ st.tab = v; st.err = ''; render(true); } } } }, l)));
  const usar = c => { st.tab = 'entrar'; st.u = c.u; st.err = ''; render(true); setTimeout(() => { const p = document.querySelector('.lg-pw input'); if(p){ p.value = DEMO_CLAVE; const b = document.querySelector('.lg-go'); if(b) b.focus(); } }, 30); };
  const cuentas = h('div', { class:'card lg-demo', 'data-rv':'' },
    h('div', { class:'stack', style:'--g:4px' }, eyebrow('Cuentas de prueba', 'users'), h('p', { class:'small ink2' }, 'Todas usan la contraseña ', h('b', { class:'mono' }, DEMO_CLAVE), '. Son ficticias.')),
    h('div', { class:'lg-list' },
      DEMO_CUENTAS.map(c => { const r = DEMO_ROLES.find(x => x.id === c.rol); return h('div', { class:'lg-acc' },
        h('span', { class:'lg-aic' }, icon(r.ic, 's16')), h('div', { class:'lg-at' }, h('b', null, r.n.split(' · ')[0]), h('span', { class:'mono xs muted' }, c.u)),
        btn('Usar', { kind:'ghost', size:'sm', onClick: () => usar(c) })); }),
      h('div', { class:'lg-acc' }, h('span', { class:'lg-aic' }, icon('userPlus', 's16')), h('div', { class:'lg-at' }, h('b', null, 'Postulante'), h('span', { class:'xs muted' }, 'Crea su propia cuenta')),
        btn('Crear', { kind:'ghost', size:'sm', onClick: () => { st.tab = 'registro'; st.err = ''; render(true); } })),
      h('div', { class:'lg-acc' }, h('span', { class:'lg-aic' }, icon('shieldCheck', 's16')), h('div', { class:'lg-at' }, h('b', null, 'Evaluador externo'), h('span', { class:'xs muted' }, 'Sin cuenta: usa el kiosco')),
        btn('Ver kiosco', { kind:'ghost', size:'sm', onClick: () => cambiarRolDemo('externo') }))));
  return page(
    h('div', { class:'lg-wrap' },
      h('div', { class:'lg-main' },
        h('div', { class:'stack', style:'--g:10px' }, eyebrow('Lumine Habilita', 'key'), h('h1', { class:'onb-h' }, st.tab === 'entrar' ? 'Inicia sesión.' : 'Crea tu cuenta.'),
          h('p', { class:'body ink2' }, st.tab === 'entrar' ? 'Cada persona entra con su cuenta y ve solo lo que le corresponde.' : 'Para postular como técnico instalador. Después de la jornada técnica, la misma cuenta pasa a ser la de técnico.')),
        h('div', { class:'card lg-card' }, tabsEl, cuerpo)),
      cuentas),
    seccionProduccion());
};

function loginReal(){
  const dentro = S.role === 'admin' || S.role === 'tecnico';
  return page(
    phead({ eyebrow:'Acceso', eic:'key', title: dentro ? 'Entraste como ' + (S.me.name || 'tu cuenta') + '.' : 'Inicia sesión con tu cuenta.', lead:'En esta versión conectada, la identidad la entrega claude.ai: entras con tu propia cuenta y la base de datos aplica tus permisos.' }),
    h('div', { class:'grid g2', style:'--g:14px;margin-bottom:28px' },
      h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Tu acceso ahora'),
        h('b', null, S.role === 'admin' ? 'Administración' : S.role === 'tecnico' ? (S.mine.expediente ? 'Técnico' : 'Postulante') : 'Sin acceso a los datos'),
        h('p', { class:'small ink2' }, S.role === 'admin' || S.role === 'tecnico' ? 'Tus permisos los aplica la base, no la pantalla.' : 'Puedes ver la portada, el diccionario, el laboratorio y el taller. Para postular o administrar necesitas que Lumine te dé acceso.')),
      h('div', { class:'card stack', style:'--g:8px' }, h('span', { class:'label' }, 'Prueba la experiencia completa'),
        h('p', { class:'small ink2' }, 'La demostración simula el inicio de sesión con cuentas de prueba para cada rol, y la creación de cuenta del postulante.'))),
    seccionProduccion());
}
