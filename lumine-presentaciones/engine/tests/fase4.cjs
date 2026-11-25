// Integración del contenido animado de Fase 4 con el visor compartido.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
global.window={};require('../../fase4/deck-data.js');const N=window.DECK.slides.length;
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const c=await b.newContext({viewport:{width:1440,height:900}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await p.goto(process.env.LUMINE_DECK_URL||'http://127.0.0.1:8765/lumine-presentaciones/fase4/');
 const ready=async n=>{
  await p.waitForFunction(n=>document.querySelector('#frame').dataset.slide===String(n)&&!document.querySelector('#frame').classList.contains('transitioning'),n);
  const f=await p.locator('.scene iframe').elementHandle();const doc=await f.contentFrame();
  await doc.waitForSelector('.lam.vis.on');await doc.evaluate(()=>document.fonts.ready);
  assert.equal(await doc.locator('.lam.vis').getAttribute('aria-label'),`Lámina ${n}`);
  assert.equal(await doc.locator('.cabeza').isVisible(),false);
  assert.equal(await doc.locator('.nota').isVisible(),false);
  return doc;
 };
 await ready(1);
 const box=await p.locator('#frame').boundingBox();assert.equal(box.width,1440);assert.equal(box.height,810);
 await p.screenshot({path:'/tmp/lumine-fase4-nueva.png'});
 const opened=c.waitForEvent('page');await p.keyboard.press('o');const speaker=await opened;await speaker.waitForLoadState();
 await speaker.waitForSelector('iframe#ic');assert.match(await speaker.locator('#ic').getAttribute('src'),/lamina-1$/);
 await p.mouse.click(1200,450);await ready(2);
 await speaker.waitForFunction(N=>document.querySelector('#cnt').textContent===`2 / ${N}`,N);
 for(let i=3;i<=N;i++){await p.keyboard.press('ArrowRight');await ready(i)}
 await p.keyboard.press('Home');await ready(1);
 await p.keyboard.press('p');await p.locator('#annex-search').fill('crédito');await p.keyboard.press('Enter');await ready(17);
 await p.keyboard.press('Escape');await ready(1);
 await p.keyboard.press('End');await ready(14);
 await p.keyboard.press('z');await p.mouse.click(1200,450);assert.match(await p.locator('.content').evaluate(e=>e.style.transform),/2.5/);await p.keyboard.press('Escape');
 await p.keyboard.press('f');await p.waitForFunction(()=>!!document.fullscreenElement);await p.keyboard.press('f');
 await p.goto('http://127.0.0.1:8765/lumine-presentaciones/fase4/#lamina-5');await ready(5);
 await p.setViewportSize({width:900,height:600});const resized=await p.locator('#frame').boundingBox();assert.equal(resized.width,900);
 await p.emulateMedia({reducedMotion:'reduce'});await p.keyboard.press('ArrowRight');await ready(6);
 assert.deepEqual(errors,[]);await b.close();console.log(`PASS Fase 4: ${N} láminas,`+' orador, anexos/retorno, fullscreen, lupa, tamaño y enlaces anteriores.');
})().catch(e=>{console.error(e);process.exit(1)});
