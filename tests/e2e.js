/* Pruebas de punta a punta con Playwright (demo y real).
   Instalar una vez:  npm install  &&  npx playwright install chromium
   Ejecutar:          npm run e2e   (antes: python3 build.py)
   Usa la dependencia del proyecto: ya no hay rutas de una máquina en particular. */
'use strict';
let chromium;
try { ({ chromium } = require('playwright')); }
catch(e){ console.error('Falta Playwright. Corre: npm install && npx playwright install chromium'); process.exit(2); }
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');
const url = (f, hash) => 'file://' + path.join(DIST, f) + (hash ? '#' + hash : '');
let fails = 0, passes = 0;
const ok = (v, m) => { if(v){ passes++; } else { fails++; console.log('FALLA:', m); } };
const VIEWPORTS = { pc:{ width:1280, height:900 }, tablet:{ width:820, height:1180 }, telefono:{ width:390, height:844 } };

async function abrir(browser, vp, scheme, f, hash, opts){
  const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], colorScheme: scheme });
  const pg = await ctx.newPage();
  // la celebración de nivel tapa la pantalla una vez: se prueba aparte (bloque 6)
  if(!(opts && opts.celebrar)) await pg.addInitScript(() => { try { localStorage.setItem('lh-sin-celebrar', '1'); } catch(e){} });
  pg.errores = [];
  pg.on('pageerror', e => pg.errores.push(String(e)));
  pg.on('console', m => { if(m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text())) pg.errores.push(m.text()); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await pg.goto(url(f || 'lumine-habilita-demo.html', hash)); await pg.waitForTimeout(700);
  await pg.evaluate(t => setTheme(t), scheme === 'light' ? 'light' : 'dark');
  // la demo parte sin sesión; las pruebas antiguas parten como Responsable Técnico
  if(!f || /demo/.test(f)){ await pg.evaluate(() => cambiarRolDemo('rt')); await pg.waitForTimeout(400); }
  return pg;
}
const sinDesborde = pg => pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function rol(pg, r){ await pg.evaluate(x => cambiarRolDemo(x), r); await pg.waitForTimeout(400); }
async function ir(pg, h){ await pg.evaluate(x => go(x), h); await pg.waitForTimeout(350); }

(async () => {
  const browser = await chromium.launch();
  /* 1. Todas las vistas, por rol, en PC, tablet y teléfono, claro y oscuro */
  const RUTAS = { rt:['panel','personas','sistema','persona-' + 'p_felipe','validaciones','sesion-s_jt_felipe','duos','indicadores','diccionario','ajustes','ajustes-contenido','ajustes-consistencia','entrar','inicio'],
                  tecnico:['ruta','modulos','modulo-N1-1','modulo-N2-3','diccionario','laboratorio','laboratorio-bateria','taller'], formador:['agenda','ruta'], postulante:['postular','modulos','laboratorio','taller'], visitante:['inicio','sistema','login','login-registro','laboratorio','taller','diccionario'] };
  for(const vp of Object.keys(VIEWPORTS)) for(const scheme of ['light','dark']){
    const pg = await abrir(browser, vp, scheme);
    for(const r of Object.keys(RUTAS)){ await rol(pg, r); for(const h of RUTAS[r]){ await ir(pg, h); ok(await sinDesborde(pg), vp + '/' + scheme + ' ' + r + ' #' + h + ' sin desborde horizontal'); } }
    ok(!pg.errores.length, vp + '/' + scheme + ' sin errores de página: ' + pg.errores.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* 2. Kiosco: PIN, encierro, tres pasos, entrega, cierre de marcas */
  {
    const pg = await abrir(browser, 'telefono', 'light');
    await ir(pg, 'sesion-s_jt_felipe');
    await pg.getByRole('button', { name:'Abrir kiosco' }).click();
    const pins = pg.locator('.dialog input[type=password]');
    ok(await pins.first().isVisible(), 'el diálogo del PIN se ve sobre el kiosco');
    await pins.nth(0).fill('1234'); await pins.nth(1).fill('1234');
    await pg.getByRole('button', { name:'Activar y entregar el equipo' }).click(); await pg.waitForTimeout(400);
    await pg.evaluate(() => { location.hash = 'panel'; }); await pg.waitForTimeout(300);
    ok((await pg.evaluate(() => location.hash)).startsWith('#kiosco'), 'con el kiosco activo no se llega al panel cambiando la URL');
    await ir(pg, 'kiosco-s_jt_felipe');
    await pg.getByRole('button', { name:'Comenzar' }).click(); await pg.waitForTimeout(200);
    ok((await pg.locator('.kiosk .kbtns').count()) === 0, 'sin nombre no se avanza a marcar');
    await pg.fill('input[placeholder="Nombre y apellido"]', 'Juan Pérez'); await pg.check('.kiosk .check input');
    await pg.getByRole('button', { name:'Comenzar' }).click(); await pg.waitForTimeout(300);
    const n = await pg.locator('.kbtns button.s').count();
    for(let i = 0; i < n; i++){
      if(i === n - 1){ await pg.evaluate(() => { const k = document.querySelector('.kiosk'); k.scrollTop = k.scrollHeight; }); await pg.waitForTimeout(100); }
      const antes = await pg.evaluate(() => document.querySelector('.kiosk').scrollTop);
      await pg.locator('.kbtns button.s').nth(i).click(); await pg.waitForTimeout(250);
      if(i === n - 1) ok(antes > 50 && Math.abs(await pg.evaluate(() => document.querySelector('.kiosk').scrollTop) - antes) < 40, 'kiosco: marcar Sabe no salta arriba');
    }
    ok((await pg.evaluate(() => location.hash)).endsWith('-p2'), 'el paso de marcar queda en la dirección');
    await pg.goBack(); await pg.waitForTimeout(300);
    ok(await pg.locator('input[placeholder="Nombre y apellido"]').inputValue() === 'Juan Pérez', 'Atrás vuelve al paso 1 sin perder el nombre');
    await pg.goForward(); await pg.waitForTimeout(300);
    ok(await pg.locator('.kbtns').count() > 0, 'Adelante vuelve al paso 2');
    await pg.getByRole('button', { name:'Revisar y entregar' }).click(); await pg.waitForTimeout(200);
    await pg.locator('.kstep', { hasText:'Marca' }).click(); await pg.waitForTimeout(200);
    ok((await pg.evaluate(() => location.hash)).endsWith('-p2'), 'los pasos se pueden tocar para retroceder');
    await pg.goBack(); await pg.waitForTimeout(200);
    await pg.getByRole('button', { name:'Elegir otra persona' }).click(); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => location.hash) === '#kiosco', 'botón para volver a la lista de personas');
    await pg.goBack(); await pg.waitForTimeout(300);
    ok((await pg.evaluate(() => location.hash)).includes('s_jt_felipe'), 'Atrás desde la lista vuelve a la sesión');
    await ir(pg, 'kiosco-s_jt_felipe-p3'); await pg.waitForTimeout(200);
    await pg.getByRole('button', { name:'Entregar evaluación' }).click(); await pg.waitForTimeout(200);
    ok(await pg.locator('.dialog').isVisible(), 'el diálogo de entrega es visible (antes quedaba detrás del kiosco)');
    await pg.locator('.dialog').getByRole('button', { name:'Entregar' }).click(); await pg.waitForTimeout(400);
    ok((await pg.innerText('.kiosk')).includes('Evaluación entregada'), 'la entrega queda guardada');
    const bloqueado = await pg.evaluate(async () => { try { await marcarItem('s_jt_felipe', 'C03', 'n', 'kiosco', { nombre:'Otro' }); return false; } catch(e){ return true; } });
    ok(bloqueado, 'después de entregar, las marcas externas quedan cerradas');
    await pg.getByRole('button', { name:'Salir del kiosco' }).click(); await pg.fill('.dialog input[type=password]', '0000');
    await pg.locator('.dialog').getByRole('button', { name:'Salir' }).click(); await pg.waitForTimeout(300);
    ok((await pg.evaluate(() => location.hash)).startsWith('#kiosco'), 'PIN incorrecto no saca del kiosco');
    await pg.getByRole('button', { name:'Salir del kiosco' }).click(); await pg.fill('.dialog input[type=password]', '1234');
    await pg.locator('.dialog').getByRole('button', { name:'Salir' }).click(); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => location.hash) === '#validaciones', 'PIN correcto vuelve a Validaciones');
    ok(!pg.errores.length, 'kiosco sin errores: ' + pg.errores.join(' | '));
    await pg.context().close();
  }

  /* 2b. Prueba de fundamentos: alternativas mezcladas para el postulante */
  {
    const lecturas = [];
    for(let k = 0; k < 2; k++){
      const pg = await abrir(browser, 'pc', 'light');
      await rol(pg, 'postulante'); await ir(pg, 'postular');
      await pg.fill('input[placeholder="Nombre y apellido"]', 'Prueba Postulante');
      await pg.getByRole('button', { name:'Seguir' }).click(); await pg.waitForTimeout(300);
      await pg.locator('[data-k="pf-mecanico"]').click();
      await pg.getByRole('button', { name:'Seguir' }).click(); await pg.waitForTimeout(300);
      ok(await pg.locator('.rviva .rv-t.on').count() === 7, 'ruta viva: el perfil mecánico marca 7 estaciones');
      await pg.locator('[data-k="cx-C19"]').click();
      ok(await pg.locator('.rviva .rv-t.on').count() === 8, 'ruta viva: marcar experiencia suma la estación al momento');
      await pg.getByRole('button', { name:'Seguir a la prueba' }).click(); await pg.waitForTimeout(300);
      let orden = '';
      const pos = [];
      const nq = await pg.evaluate(() => FUNDAMENTOS.length);
      for(let i = 0; i < nq; i++){
        ok(await pg.locator('#onb-q').count() === 1 && await pg.locator('#onb-q .opt').count() === 4, 'fundamentos: una pregunta por pantalla (' + (i + 1) + ')');
        orden += await pg.locator('#onb-q .opts').innerText() + '|';
        pos.push(await pg.evaluate(i => [...document.querySelectorAll('#onb-q .opt span:last-child')].map(s => s.textContent).indexOf(FUNDAMENTOS[i].o[FUNDAMENTOS[i].a]), i));
        await pg.keyboard.press('1'); await pg.waitForTimeout(650);
      }
      lecturas.push(orden);
      await pg.waitForTimeout(400);
      ok(await pg.locator('.fin-stats').count() === 1, 'postulación: pantalla de resultado');
      ok(await pg.getByRole('button', { name:'Enviar postulación' }).count() === 1, 'postulación: botón de envío en el resultado');
      ok(new Set(pos).size >= 3, 'fundamentos: la correcta aparece en al menos 3 letras distintas (' + pos.join(',') + ')');
      ok(!pg.errores.length, 'postulación sin errores: ' + pg.errores.join(' | '));
      await pg.context().close();
    }
    ok(lecturas[0] !== lecturas[1], 'fundamentos: dos postulantes ven las alternativas en distinto orden');
  }

  /* 2c. Laboratorio 3D y taller: identificar piezas y armar el kit en orden */
  for(const vp of ['pc','telefono']){
    const pg = await abrir(browser, vp, 'dark');
    await ir(pg, 'laboratorio'); await pg.waitForTimeout(500);
    ok(await pg.locator('.lab-canvas').count() === 1 && await pg.locator('.lab-hot').count() === 7, vp + ' laboratorio: modelo y 7 puntos');
    await pg.locator('.lab-li[data-id="ecu"]').click(); await pg.waitForTimeout(200);
    ok((await pg.locator('.lab-panel-in h2').innerText()).includes('Unidad de control'), vp + ' laboratorio: la lista abre el detalle');
    await pg.getByRole('button', { name:'Empezar' }).click(); await pg.waitForTimeout(500);
    for(let i = 0; i < 7; i++){ const meta = await pg.evaluate(() => UI.lab.quiz.orden[UI.lab.quiz.i]); await pg.locator('.lab-hot[data-id="' + meta + '"]').click(); await pg.waitForTimeout(120); }
    ok((await pg.locator('.lab-quiz').innerText()).includes('de 7 a la primera'), vp + ' laboratorio: prueba de identificación completa');
    await ir(pg, 'taller'); await pg.waitForTimeout(400);
    let trampa = false;
    for(let k = 0; k < 90; k++){
      const st = await pg.evaluate(() => { const g = UI.taller; return { mano:g.mano, n:g.hecho.length, disp: TALLER_PASOS.filter(p => !g.hecho.includes(p.id) && p.req.every(r => g.hecho.includes(r))).map(p => p.id) }; });
      if(st.n === 19) break;
      let id = st.mano.find(x => st.disp.includes(x));
      const x = st.mano.find(c => c[0] === 'x');
      if(!trampa && x){ id = x; trampa = true; }
      await pg.locator('[data-k="tc-' + id + '"]').click(); await pg.waitForTimeout(60);
    }
    const r = await pg.locator('.t-result').innerText();
    ok(trampa ? /no la aprueba/.test(r) : /Instalación en orden/.test(r), vp + ' taller: el veredicto respeta las fallas (' + (trampa ? 'con atajo' : 'sin atajo') + ')');
    ok(await sinDesborde(pg), vp + ' taller sin desborde');
    ok(!pg.errores.length, vp + ' laboratorio y taller sin errores: ' + pg.errores.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* 2d. Inicio de sesión de la demo: error, bloqueo, entrar, recargar, salir y crear cuenta */
  for(const vp of ['pc','telefono']){
    const pg = await abrir(browser, vp, 'dark');
    await rol(pg, 'visitante'); await ir(pg, 'inicio');
    ok(await pg.locator('.login-b').count() === 1, vp + ' sin sesión se ve el botón Iniciar sesión');
    ok(await pg.evaluate(() => !puedeVer('panel')), vp + ' sin sesión no se ve el panel');
    await ir(pg, 'login');
    await pg.fill('input[autocomplete=username]', 'responsable'); await pg.fill('.lg-pw input', 'otra');
    await pg.getByRole('button', { name:'Entrar', exact:true }).click(); await pg.waitForTimeout(200);
    ok((await pg.locator('.lg-err').innerText()).includes('incorrectos'), vp + ' login: contraseña incorrecta rechazada');
    for(let i = 0; i < 4; i++){ await pg.fill('.lg-pw input', 'x' + i); await pg.getByRole('button', { name:'Entrar', exact:true }).click(); await pg.waitForTimeout(120); }
    await pg.fill('.lg-pw input', 'demo1234'); await pg.getByRole('button', { name:'Entrar', exact:true }).click(); await pg.waitForTimeout(200);
    ok((await pg.locator('.lg-err').innerText()).includes('Espera') && (await pg.evaluate(() => S.demoRole)) === 'visitante', vp + ' login: bloqueo tras 5 intentos');
    await pg.evaluate(() => { UI.login.hasta = 0; });
    await pg.getByRole('button', { name:'Entrar', exact:true }).click(); await pg.waitForTimeout(900);
    ok(await pg.evaluate(() => S.demoRole === 'rt' && location.hash === '#panel'), vp + ' login: entra al panel');
    await pg.reload(); await pg.waitForTimeout(1200);
    ok(await pg.evaluate(() => S.demoRole === 'rt'), vp + ' login: la sesión sigue al recargar');
    await pg.evaluate(() => cerrarSesionDemo()); await pg.waitForTimeout(800);
    ok(await pg.evaluate(() => S.demoRole === 'visitante' && location.hash === '#inicio'), vp + ' cerrar sesión vuelve a la portada');
    await ir(pg, 'login-registro');
    await pg.fill('input[autocomplete=name]', 'Valentina Soto'); await pg.fill('input[type=email]', 'mal');
    await pg.getByRole('button', { name:'Crear cuenta y postular' }).click(); await pg.waitForTimeout(150);
    ok((await pg.locator('.lg-err').innerText()).includes('correo'), vp + ' registro: valida el correo');
    await pg.fill('input[type=email]', 'vale@correo.cl'); const pw = pg.locator('.lg-pw input'); await pw.nth(0).fill('clave1234'); await pw.nth(1).fill('clave1234');
    await pg.getByRole('button', { name:'Crear cuenta y postular' }).click(); await pg.waitForTimeout(1000);
    ok(await pg.evaluate(() => S.demoRole === 'postulante' && location.hash === '#postular' && UI.postular.nombre === 'Valentina Soto'), vp + ' registro: entra a postular con su nombre');
    ok(await sinDesborde(pg), vp + ' login sin desborde');
    ok(!pg.errores.length, vp + ' login sin errores: ' + pg.errores.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* 3. Práctica: alternativas mezcladas, material oculto, navegación entre módulos */
  {
    const pg = await abrir(browser, 'pc', 'light');
    await rol(pg, 'tecnico'); await ir(pg, 'modulo-N1-2');
    ok(await pg.locator('.capsule').count() > 0, 'N1-2 ya no está "en preparación"');
    ok(await pg.locator('.modnav-a.next').count() === 1 && await pg.locator('.modnav-a.prev').count() === 1, 'botones de módulo anterior y siguiente');
    await pg.getByRole('tab', { name:'Rinde la práctica' }).click(); await pg.waitForTimeout(200);
    ok(await pg.locator('.capsule').count() === 0, 'durante la práctica el material no está en pantalla');
    ok(await pg.locator('.prac .opt').count() === 4 && await pg.locator('.prac .q').count() === 1, 'una pregunta a la vez');
    const orden1 = await pg.locator('.prac .opt').allInnerTexts();
    await pg.keyboard.press('2'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(150);
    ok(await pg.evaluate(() => UI['prac-N1-2'].idx) === 1, 'Enter avanza a la siguiente pregunta');
    await pg.getByRole('tab', { name:'Aprende' }).click(); await pg.waitForTimeout(200);
    ok(await pg.locator('.dialog').isVisible(), 'volver al material avisa que reinicia el intento');
    await pg.locator('.dialog').getByRole('button', { name:'Volver al material' }).click(); await pg.waitForTimeout(200);
    await pg.getByRole('tab', { name:'Rinde la práctica' }).click(); await pg.waitForTimeout(200);
    const orden2 = await pg.locator('.prac .opt').allInnerTexts();
    ok(await pg.evaluate(() => Object.keys(UI['prac-N1-2'].resp).length === 0), 'volver al material reinicia el intento');
    await pg.locator('.modnav-a.next').click(); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => location.hash) === '#modulo-N1-3', 'siguiente módulo sin volver a la lista');
    ok(!pg.errores.length, 'práctica sin errores: ' + pg.errores.join(' | '));
    await pg.context().close();
  }

  /* 4. Reglas en las acciones (no solo en la pantalla) */
  {
    const pg = await abrir(browser, 'pc', 'light');
    const r = await pg.evaluate(async () => {
      const out = {};
      try { await crearSesion({ pid:'p_ignacio', tipo:'N3' }); out.d8sin = 'creó'; } catch(e){ out.d8sin = e.message; }
      try { await crearSesion({ pid:'p_ignacio', tipo:'N3', override:'Fecha del evaluador externo' }); out.d8con = 'ok'; } catch(e){ out.d8con = e.message; }
      try { await crearSesion({ pid:'p_valentina', tipo:'REV', fecha:'2026-02-31' }); out.fecha = 'creó'; } catch(e){ out.fecha = e.message; }
      try { await terminarDuo('d_matias', ''); out.d13sin = 'terminó'; } catch(e){ out.d13sin = e.message; }
      await asignarItem('s_jt_felipe', 'C09', null); await new Promise(r => setTimeout(r, 100));
      out.agenda = S.D.agenda.u_camila.sesiones.s_jt_felipe.estado;
      const p = params(); p.rotacionMinMeses = 0; await guardarParametros(p); out.rot = params().rotacionMinMeses;
      try { await terminarDuo('d_matias', ''); out.d13cero = 'ok'; } catch(e){ out.d13cero = e.message; }
      return out;
    });
    ok(/D8/.test(r.d8sin), 'D8: la acción rechaza programar sin práctica ni motivo');
    ok(r.d8con === 'ok', 'D8: con motivo se programa');
    ok(/fecha/i.test(r.fecha), 'fecha imposible rechazada en la acción');
    ok(/D13/.test(r.d13sin), 'D13: la acción exige motivo antes del plazo');
    ok(r.agenda === 'reasignado', 'al reasignar, la formadora anterior deja de verlo pendiente');
    ok(r.rot === 0, 'rotación de 0 meses se guarda como 0');
    ok(r.d13cero === 'ok', 'con 0 meses la separación ya no es anticipada');
    await ir(pg, 'ajustes-consistencia');
    ok(await pg.locator('h3', { hasText:'Capacidad de la base' }).count() === 1, 'Ajustes muestra la capacidad de la base');
    /* contenido editable: el cambio lo ve el técnico */
    await ir(pg, 'ajustes-contenido');
    await pg.selectOption('select.select >> nth=0', 'N1-3'); await pg.waitForTimeout(250);
    await pg.locator('.edit-card input.input').first().fill('Cápsula editada en la prueba');
    await pg.getByRole('button', { name:'Guardar contenido' }).click(); await pg.waitForTimeout(400);
    await rol(pg, 'tecnico'); await ir(pg, 'modulo-N1-3');
    ok((await pg.innerText('#main')).includes('Cápsula editada en la prueba'), 'el técnico ve el contenido editado');
    /* vista previa */
    await rol(pg, 'rt'); await ir(pg, 'entrar');
    await pg.getByRole('button', { name:'Abrir vista previa' }).first().click(); await pg.waitForTimeout(500);
    ok(await pg.evaluate(() => location.hash === '#postular' && !!S.preview && S.role === 'tecnico'), 'vista previa como postulante');
    await pg.getByRole('button', { name:'Salir de la vista previa' }).click(); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => S.role) === 'admin', 'salir de la vista previa vuelve a administración');
    /* bonos */
    await ir(pg, 'ajustes-parametros');
    await pg.locator('details.calc summary').click();
    await pg.locator('details.calc input').first().fill('10000000'); await pg.waitForTimeout(200);
    ok((await pg.innerText('details.calc')).includes('Comprometido'), 'la calculadora reparte el presupuesto');
    ok(!pg.errores.length, 'administración sin errores: ' + pg.errores.join(' | '));
    await pg.context().close();
  }

  /* 4b. Rotación de duo por solicitud al Responsable Técnico (D13) */
  for(const vp of ['pc','telefono']){
    const pg = await abrir(browser, vp, 'light');
    const sol = await pg.evaluate(() => DEMO_IDS.solicitante);
    await ir(pg, 'duos');
    ok(await pg.locator('[data-solicitud="' + sol + '"]').count() === 1, vp + ' D13: el RT ve la solicitud pendiente de la demo');
    ok(await sinDesborde(pg), vp + ' D13: duos con solicitudes sin desborde horizontal');
    await rol(pg, 'tecnico'); await ir(pg, 'ruta');
    ok((await pg.innerText('#main')).includes('Puedes pedir rotación desde'), vp + ' D13: antes de 4 meses el técnico ve desde cuándo puede pedir');
    const antes = await pg.evaluate(async () => { try { await enviarSolicitudRotacion('Quiero aprender con otra persona del taller', ''); return 'envió'; } catch(e){ return e.message; } });
    ok(/desde/.test(antes), vp + ' D13: la acción rechaza pedir antes del plazo');
    await rol(pg, 'rt'); await pg.evaluate(async () => { const p = params(); p.rotacionMinMeses = 0; await guardarParametros(p); });
    await rol(pg, 'tecnico'); await ir(pg, 'ruta');
    await pg.getByRole('button', { name:'Pedir rotación' }).click(); await pg.waitForTimeout(250);
    const env = pg.getByRole('button', { name:'Enviar al Responsable Técnico' });
    ok(await env.isDisabled(), vp + ' D13: sin motivo explicado no se envía');
    await pg.locator('.sheet textarea').fill('Quiero aprender calibración con otra persona del taller');
    await env.click(); await pg.waitForTimeout(400);
    ok(await pg.locator('[data-rotacion="pendiente"]').count() === 1, vp + ' D13: el técnico ve su solicitud pendiente');
    const ajena = await pg.evaluate(async x => { try { await S.db.doc('solicitudes/' + x).set({ rotacion:null }); return 'escribió'; } catch(e){ return e.code || e.message; } }, sol);
    ok(ajena !== 'escribió', vp + ' D13: un técnico no toca la solicitud de otro');
    await rol(pg, 'rt'); await ir(pg, 'duos');
    ok(await pg.locator('[data-solicitud]').count() === 2, vp + ' D13: el RT ve las dos solicitudes');
    await pg.locator('[data-solicitud="u_ignacio"]').getByRole('button', { name:'Rechazar' }).click(); await pg.waitForTimeout(250);
    await pg.locator('.dialog textarea').fill('Matías recién empieza a formarte; lo vemos en dos meses');
    await pg.locator('.dialog').getByRole('button', { name:'Rechazar' }).click(); await pg.waitForTimeout(400);
    await pg.locator('[data-solicitud="' + sol + '"]').getByRole('button', { name:'Aprobar y separar' }).click(); await pg.waitForTimeout(250);
    await pg.locator('.dialog').getByRole('button', { name:'Aprobar' }).click(); await pg.waitForTimeout(500);
    const st = await pg.evaluate(() => ({ activo: S.D.duos.d_camila.activo, sols: solicitudesRotacion().length, bit: Object.values(S.D.bitacora).some(b => /Rotación aprobada/.test(b.a || b.accion || JSON.stringify(b))) }));
    ok(st.activo === false && st.sols === 0, vp + ' D13: aprobar separa el duo y vacía la lista');
    ok(st.bit, vp + ' D13: la decisión queda en la bitácora');
    await rol(pg, 'tecnico'); await ir(pg, 'ruta');
    ok(await pg.locator('[data-rotacion="rechazada"]').count() === 1 && (await pg.innerText('#main')).includes('lo vemos en dos meses'), vp + ' D13: el técnico ve la respuesta del RT');
    ok(!pg.errores.length, vp + ' D13 sin errores: ' + pg.errores.join(' | '));
    await pg.context().close();
  }

  /* 6. Experiencia v2: celebración, credencial con QR, avisos, búsqueda, embudo, calendario, ajustes, portada */
  for(const vp of ['pc', 'telefono']){
    const pg = await abrir(browser, vp, 'dark', null, null, { celebrar:true });
    await rol(pg, 'tecnico'); await ir(pg, 'ruta'); await pg.waitForTimeout(700);
    ok(await pg.locator('.celebra').count() === 1, vp + ' v2: al entrar se celebra el nivel recién validado');
    await pg.locator('.celebra').getByRole('button', { name:'Ver mi credencial' }).click(); await pg.waitForTimeout(400);
    ok(await pg.locator('.cred .cred-qr svg path').count() === 1, vp + ' v2: la credencial muestra su QR');
    const cod = await pg.locator('.cred').getAttribute('data-cred');
    ok(/^LH2-[0-9A-Z]{4}-[0-9A-Z]{3}$/.test(cod || ''), vp + ' v2: código de credencial con formato LH2-XXXX-XXX');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await ir(pg, 'inicio'); await ir(pg, 'ruta'); await pg.waitForTimeout(700);
    ok(await pg.locator('.celebra').count() === 0, vp + ' v2: la celebración no se repite');
    ok(await pg.locator('.next-card .btn').count() >= 1, vp + ' v2: Mi ruta tiene una acción principal');
    ok(!(await pg.innerText('#main')).match(/\bC\d\d\b/), vp + ' v2: el técnico no ve códigos de competencia en Mi ruta');
    await ir(pg, 'modulos');
    ok(!(await pg.innerText('#main')).match(/\bC\d\d\b|N2-3|\(D\d/), vp + ' v2: Módulos sin códigos internos');
    await pg.evaluate(() => { S.mine.expediente = Object.assign({}, S.mine.expediente, { proximas:[{ tipo:'N3', fecha: addDays(S.hoy, 2) }] }); scheduleRender(); }); await pg.waitForTimeout(400);
    ok(await pg.locator('.bell .bell-n').count() === 1, vp + ' v2: la campana cuenta los avisos nuevos');
    await pg.locator('.bell').click(); await pg.waitForTimeout(300);
    ok((await pg.innerText('.sheet')).includes('Validación programada'), vp + ' v2: el aviso de la validación aparece');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    ok(await pg.locator('.bell .bell-n').count() === 0, vp + ' v2: abrir los avisos los marca como leídos');
    await rol(pg, 'rt'); await ir(pg, 'panel');
    ok(await pg.locator('.hoy-card').count() === 1, vp + ' v2: el panel abre con Hoy');
    await pg.keyboard.press('Control+k'); await pg.waitForTimeout(200);
    await pg.locator('.cmdk-in').fill(cod); await pg.waitForTimeout(200);
    ok((await pg.innerText('.cmdk')).includes('Credencial válida: Ignacio'), vp + ' v2: Ctrl+K verifica la credencial');
    await pg.locator('.cmdk-in').fill('LH2-0000-000'); await pg.waitForTimeout(150);
    ok((await pg.innerText('.cmdk')).includes('Ningún técnico'), vp + ' v2: un código falso no se valida');
    await pg.locator('.cmdk-in').fill('valentina'); await pg.waitForTimeout(150); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
    ok((await pg.evaluate(() => location.hash)) === '#persona-p_valentina', vp + ' v2: Enter abre la persona buscada');
    await ir(pg, 'personas');
    ok(await pg.locator('.emb-col').count() === 7, vp + ' v2: el embudo tiene siete columnas');
    await ir(pg, 'validaciones');
    ok(await pg.locator('.cal .cal-ev').count() >= 3, vp + ' v2: el calendario muestra las validaciones del mes');
    await ir(pg, 'ajustes-bitacora');
    ok(await pg.locator('.aj-grupos button[aria-pressed="true"]').innerText() === 'Sistema', vp + ' v2: Ajustes abre el grupo correcto');
    await rol(pg, 'visitante'); await ir(pg, 'inicio');
    ok(await pg.locator('.hero .hero-ctas .btn').count() === 1 && await pg.locator('.ctacard .btn').count() === 1, vp + ' v2: la portada tiene un solo botón principal');
    ok(await pg.locator('.hist-paso').count() === 6, vp + ' v2: recorrido del kit en seis pasos');
    await pg.evaluate(() => document.querySelectorAll('.hist-paso')[3].scrollIntoView({ block: 'center' })); await pg.waitForTimeout(900);
    ok(await pg.locator('.hist-paso.on').count() === 1, vp + ' v2: al bajar se activa un paso del recorrido');
    ok(await sinDesborde(pg), vp + ' v2: portada sin desborde');
    ok(!pg.errores.length, vp + ' v2 sin errores: ' + pg.errores.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* 5. Versión real abierta fuera de claude.ai: avisa y no se rompe */
  {
    const pg = await abrir(browser, 'pc', 'light', 'lumine-habilita.html');
    await pg.waitForTimeout(800);
    ok((await pg.innerText('body')).length > 100, 'la versión real carga');
    ok(!pg.errores.length, 'la versión real sin errores: ' + pg.errores.join(' | '));
    await pg.context().close();
  }
  await browser.close();
  console.log('\n' + passes + ' correctas, ' + fails + ' fallas');
  if(fails) process.exit(1);
})();
