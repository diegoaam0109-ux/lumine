// Conceptos de la defensa: cada mazo recorre sus láminas, abre el orador, no pide nada fuera del sitio
// y, al avanzar rápido, nunca deja a la vista una lámina embebida sin cargar (el «apagón» de la Fase 4).
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.LUMINE_BASE||'http://127.0.0.1:8765/lumine-presentaciones/';
const mazos=(process.env.LUMINE_MAZOS||'defensa/conceptos/banco/,defensa/conceptos/plano/,defensa/conceptos/titular/,fase4/').split(',');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 for(const mazo of mazos){
  const c=await b.newContext({viewport:{width:1280,height:720}}),p=await c.newPage(),errores=[];
  p.on('pageerror',e=>errores.push(e.message));
  p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1')&&!r.url().startsWith('data:'))errores.push('externo '+r.url())});
  p.on('response',r=>{if(r.status()>=400)errores.push(`${r.status()} ${r.url()}`)});
  await p.goto(BASE+mazo);
  const N=await p.evaluate(()=>window.DECK.slides.length);
  await p.waitForFunction(()=>document.querySelector('#frame').dataset.slide==='1');
  // Vigía: en cada cuadro, la capa de arriba que está a la vista debe tener su lámina cargada.
  await p.evaluate(()=>{window.__vacios=0;window.__muestras=0;(function vigia(){
    const capas=[...document.querySelectorAll('#frame .scene')].filter(s=>s.style.visibility!=='hidden');
    const arriba=capas[capas.length-1],f=arriba&&arriba.querySelector('iframe');
    if(f){window.__muestras++;const d=f.contentDocument;if(!d||d.readyState!=='complete'||!d.querySelector('.lam.vis, .lam'))window.__vacios++;}
    requestAnimationFrame(vigia);})();});
  for(let i=2;i<=Math.min(N,6);i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(40);}
  await p.waitForFunction(n=>document.querySelector('#frame').dataset.slide===String(n)&&!document.querySelector('#frame').classList.contains('transitioning'),Math.min(N,6));
  await p.waitForTimeout(300);
  const {vacios,muestras}=await p.evaluate(()=>({vacios:window.__vacios,muestras:window.__muestras}));
  assert.ok(muestras>10,'el vigía no tomó muestras');
  assert.equal(vacios,0,`${mazo}: ${vacios} cuadros con la lámina sin cargar al avanzar rápido`);
  const abierto=c.waitForEvent('page');await p.keyboard.press('o');const orador=await abierto;await orador.waitForLoadState();
  await orador.waitForSelector('#ic');
  const quien=await orador.locator('#who').textContent();
  if(mazo.startsWith('defensa'))assert.ok(quien.length>0,'el orador no muestra quién habla');
  assert.deepEqual(errores,[],mazo);
  console.log(`PASS ${mazo}: ${N} láminas, avance rápido sin cuadros vacíos (${muestras} muestras), orador, sin red externa.`);
  await c.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
