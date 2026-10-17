/* Pruebas de punta a punta de la página comercial (Playwright).
   Correr:  npm run build:artefacto && npm run e2e */
'use strict'
const { chromium } = require('playwright')
const path = require('path')
const URL = 'file://' + path.join(__dirname, '..', 'dist-artefacto', 'index.html')
let ok = 0, mal = 0
const chk = (v, m) => { if (v) ok++; else { mal++; console.log('FALLA:', m) } }
;(async () => {
  const b = await chromium.launch()
  for (const [vp, sz] of [['pc', { width: 1440, height: 900 }], ['telefono', { width: 390, height: 844 }]]) {
    const pg = await (await b.newContext({ viewport: sz })).newPage()
    const errs = []
    pg.on('pageerror', e => errs.push(String(e)))
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort())
    await pg.goto(URL); await pg.waitForTimeout(1500)
    chk(await pg.locator('h1').innerText().then(t => /HÍBRIDO/i.test(t)), vp + ': titular de la portada')
    chk(await pg.locator('#como-funciona canvas').count() >= 1, vp + ': recorrido 3D montado')
    // tema: oscuro por defecto aunque el visor fuerce fondo claro en body; el interruptor cambia y recuerda
    await pg.addStyleTag({ content: 'body{background:#faf9f5;color:#141413}' })
    const fondo = () => pg.evaluate(() => getComputedStyle(document.body).backgroundColor)
    chk(await pg.evaluate(() => document.documentElement.dataset.tema) === 'oscuro' && await fondo() === 'rgb(2, 3, 4)', vp + ': parte en negro')
    await pg.getByRole('button', { name: 'Cambiar a modo claro' }).click(); await pg.waitForTimeout(600)
    chk(await fondo() === 'rgb(245, 245, 247)' && await pg.evaluate(() => localStorage.getItem('lumine-tema')) === 'claro', vp + ': el interruptor pasa a claro y lo recuerda')
    await pg.getByRole('button', { name: 'Cambiar a modo oscuro' }).click(); await pg.waitForTimeout(600)
    chk(await fondo() === 'rgb(2, 3, 4)', vp + ': vuelve a oscuro')
    for (const id of ['para-quien', 'como-funciona', 'kit', 'ahorro', 'compatibilidad', 'proceso', 'confianza', 'preguntas', 'agendar']) {
      await pg.evaluate(x => document.getElementById(x).scrollIntoView(), id); await pg.waitForTimeout(400)
      chk(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), vp + ': sin desborde en #' + id)
    }
    // calculadora
    await pg.evaluate(() => document.getElementById('ahorro').scrollIntoView()); await pg.waitForTimeout(500)
    const antes = await pg.locator('#ahorro p.t-num').first().innerText()
    await pg.locator('#ahorro').getByRole('tab', { name: 'Mi flota' }).click(); await pg.waitForTimeout(900)
    chk((await pg.locator('#ahorro p.t-num').first().innerText()) !== antes, vp + ': la calculadora cambia con la flota')
    const txtAh = await pg.innerText('#ahorro')
    chk(/20% menos de combustible/i.test(txtAh) && /30 de septiembre de 2026/.test(txtAh), vp + ': calcula con 20% y muestra la fecha de los precios')
    await pg.locator('#ahorro').getByRole('button', { name: /Diésel/ }).click(); await pg.waitForTimeout(300)
    chk(await pg.inputValue('#c-precio') === '1393', vp + ': elegir diésel carga su precio de hoy')
    // recorrido 3D: el texto activo siempre se puede leer al bajar
    {
      const [ini, fin] = await pg.evaluate(() => { const e = document.getElementById('como-funciona'); const t = e.getBoundingClientRect().top + scrollY; return [t, t + e.offsetHeight - innerHeight] })
      let malas = 0; const vistos = new Set()
      for (let y = ini; y <= fin; y += 120) {
        await pg.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await pg.waitForTimeout(500)
        const r = await pg.evaluate(() => {
          const st = document.querySelector('#como-funciona .sticky').getBoundingClientRect()
          if (st.top > 125) return null
          const arriba = innerWidth < 1024 ? st.bottom : 0
          let act = -1, vis = 0
          document.querySelectorAll('#como-funciona [data-i]').forEach((el, i) => { const t = el.firstElementChild; if (t.hasAttribute('data-activo')) { act = i; const b = t.getBoundingClientRect(); vis = Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, arriba)) / b.height } })
          return { act, vis }
        })
        if (!r) continue
        vistos.add(r.act); if (r.act < 0 || r.vis < 0.6) malas++
      }
      chk(!malas && vistos.size === 6, vp + ': el texto del recorrido 3D se puede leer en todo momento (' + malas + ' malas, ' + vistos.size + ' pasos)')
    }
    // verificador
    await pg.evaluate(() => document.getElementById('compatibilidad').scrollIntoView()); await pg.waitForTimeout(1300)
    await pg.locator('#compatibilidad textarea').fill('Kia Rio 2018'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(1700)
    await pg.getByRole('button', { name: 'No, trasera o 4x4' }).click(); await pg.waitForTimeout(1100)
    chk(/por ahora, no/i.test(await pg.innerText('#compatibilidad [role=log]')), vp + ': tracción trasera no es candidata')
    await pg.locator('#compatibilidad').getByRole('button', { name: /Otro auto/ }).click(); await pg.waitForTimeout(1100)
    await pg.locator('#compatibilidad textarea').fill('Toyota Yaris 2016'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(1700)
    await pg.getByRole('button', { name: 'No sé' }).click(); await pg.waitForTimeout(1100)
    await pg.getByRole('button', { name: 'Menos de 30 km' }).click(); await pg.waitForTimeout(1100)
    await pg.getByRole('button', { name: 'Para mí' }).click(); await pg.waitForTimeout(1200)
    const log = await pg.innerText('#compatibilidad [role=log]')
    chk(/puede ser candidato/i.test(log) && log.includes('no instalamos'), vp + ': resultado honesto con poco uso')
    await pg.locator('#compatibilidad').getByRole('button', { name: /Agendar diagnóstico/ }).click(); await pg.waitForTimeout(1300)
    chk(await pg.inputValue('#f-auto') === 'Toyota Yaris 2016', vp + ': el verificador completa el formulario')
    // formulario
    await pg.locator('#agendar button[type=submit]').click(); await pg.waitForTimeout(300)
    chk(await pg.locator('#f-nombre-e').count() === 1, vp + ': el formulario valida el nombre')
    await pg.fill('#f-nombre', 'Ana Prueba'); await pg.fill('#f-telefono', '+56 9 1234 5678')
    await pg.locator('#agendar button[type=submit]').click(); await pg.waitForTimeout(700)
    chk((await pg.innerText('#agendar')).includes('demostración'), vp + ': sin conexión a ventas avisa que es demostración')
    // preguntas
    await pg.evaluate(() => document.getElementById('preguntas').scrollIntoView()); await pg.waitForTimeout(600)
    await pg.getByRole('button', { name: '¿Pierdo los frenos o el ABS de mi auto?' }).click(); await pg.waitForTimeout(500)
    chk((await pg.innerText('#preguntas')).includes('siempre mandan'), vp + ': el acordeón abre la respuesta')
    // fotos: todas cargan, con texto alternativo
    {
      const fotos = await pg.evaluate(async () => { const im = [...document.querySelectorAll('main img')]; im.forEach(i => { i.loading = 'eager' }); await Promise.all(im.map(i => i.decode().catch(() => null))); return im.map(i => ({ ok: i.naturalWidth > 0, alt: i.alt.length > 10 })) })
      chk(fotos.length >= 7 && fotos.every(f => f.ok && f.alt), vp + ': las ' + fotos.length + ' fotos cargan y tienen texto alternativo')
    }
    // explorador de componentes
    await pg.evaluate(() => document.getElementById('pz-panel').scrollIntoView({ block: 'center' })); await pg.waitForTimeout(600)
    await pg.getByRole('tab', { name: /Banco de baterías/ }).click(); await pg.waitForTimeout(700)
    chk(/Energía bajo el piso/i.test(await pg.innerText('#kit')), vp + ': el explorador cambia de pieza')
    // ayuda: se abre, responde sin inventar el precio y lleva a la sección
    await pg.evaluate(() => scrollTo(0, document.getElementById('proceso').getBoundingClientRect().top + scrollY)); await pg.waitForTimeout(800)
    await pg.getByRole('button', { name: /Te ayudamos|Abrir ayuda/ }).first().click(); await pg.waitForTimeout(600)
    const ayuda = pg.getByRole('dialog', { name: 'Ayuda Lumine' })
    chk(await ayuda.isVisible(), vp + ': la ayuda se abre')
    await ayuda.getByRole('button', { name: '¿Cuánto cuesta?' }).click(); await pg.waitForTimeout(400)
    chk(/Por confirmar/i.test(await ayuda.innerText()), vp + ': la ayuda no inventa el precio')
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(400)
    chk(!(await ayuda.isVisible()), vp + ': Escape cierra la ayuda')
    // la portada sigue legible en modo claro (foto oscura, texto claro)
    await pg.evaluate(() => { document.documentElement.dataset.tema = 'claro'; scrollTo(0, 0) }); await pg.waitForTimeout(500)
    chk(await pg.evaluate(() => getComputedStyle(document.querySelector('h1 .t-titulo')).color) === 'rgb(236, 236, 236)', vp + ': el titular se lee en modo claro')
    await pg.evaluate(() => { document.documentElement.dataset.tema = 'oscuro' })
    chk(new RegExp('© ' + new Date().getFullYear()).test(await pg.innerText('footer')), vp + ': el pie muestra el año actual')
    chk(!errs.length, vp + ': sin errores de página ' + errs.join(' | '))
    await pg.context().close()
  }
  await b.close()
  console.log('\n' + ok + ' correctas, ' + mal + ' fallas'); if (mal) process.exit(1)
})()
