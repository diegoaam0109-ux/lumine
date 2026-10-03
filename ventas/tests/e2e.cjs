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
    chk(await pg.locator('canvas').count() >= 2, vp + ': escenas 3D montadas')
    // tema: oscuro por defecto aunque el visor fuerce fondo claro en body; el interruptor cambia y recuerda
    await pg.addStyleTag({ content: 'body{background:#faf9f5;color:#141413}' })
    const fondo = () => pg.evaluate(() => getComputedStyle(document.body).backgroundColor)
    chk(await pg.evaluate(() => document.documentElement.dataset.tema) === 'oscuro' && await fondo() === 'rgb(2, 3, 4)', vp + ': parte en negro')
    await pg.getByRole('button', { name: 'Cambiar a modo claro' }).click(); await pg.waitForTimeout(600)
    chk(await fondo() === 'rgb(245, 245, 247)' && await pg.evaluate(() => localStorage.getItem('lumine-tema')) === 'claro', vp + ': el interruptor pasa a claro y lo recuerda')
    await pg.getByRole('button', { name: 'Cambiar a modo oscuro' }).click(); await pg.waitForTimeout(600)
    chk(await fondo() === 'rgb(2, 3, 4)', vp + ': vuelve a oscuro')
    for (const id of ['para-quien', 'como-funciona', 'ahorro', 'compatibilidad', 'proceso', 'confianza', 'preguntas', 'agendar']) {
      await pg.evaluate(x => document.getElementById(x).scrollIntoView(), id); await pg.waitForTimeout(400)
      chk(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), vp + ': sin desborde en #' + id)
    }
    // calculadora
    await pg.evaluate(() => document.getElementById('ahorro').scrollIntoView()); await pg.waitForTimeout(500)
    const antes = await pg.locator('#ahorro p.t-num').first().innerText()
    await pg.locator('#ahorro').getByRole('tab', { name: 'Mi flota' }).click(); await pg.waitForTimeout(900)
    chk((await pg.locator('#ahorro p.t-num').first().innerText()) !== antes, vp + ': la calculadora cambia con la flota')
    chk(/por confirmar/i.test(await pg.innerText('#ahorro')), vp + ': el ahorro del kit queda por confirmar, no se inventa')
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
    chk(!errs.length, vp + ': sin errores de página ' + errs.join(' | '))
    await pg.context().close()
  }
  await b.close()
  console.log('\n' + ok + ' correctas, ' + mal + ' fallas'); if (mal) process.exit(1)
})()
