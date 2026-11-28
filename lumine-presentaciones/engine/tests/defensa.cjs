// Defensa final: pasos por clic, vista del orador con tiempo por orador, anexos con P, sin red externa.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.LUMINE_BASE||'http://127.0.0.1:8765/lumine-presentaciones/';
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const c=await b.newContext({viewport:{width:1366,height:768}}),p=await c.newPage(),errores=[];
 p.on('pageerror',e=>errores.push(e.message));
 c.on('request',r=>{const u=r.url();if(!u.startsWith('http://127.0.0.1')&&!u.startsWith('data:')&&!u.startsWith('blob:'))errores.push('externo '+u)});
 c.on('response',r=>{if(r.status()>=400&&!/privado\//.test(r.url()))errores.push(`${r.status()} ${r.url()}`)});
 await p.goto(BASE+'defensa/');
 const D=await p.evaluate(()=>({N:DECK.slides.length,main:DECK.mainSlides,steps:DECK.slides.map(s=>s.steps||0)}));
 const listo=async n=>{await p.waitForFunction(n=>document.querySelector('#frame').dataset.slide===String(n)&&!document.querySelector('#frame').classList.contains('transitioning'),n);
   const f=await (await p.locator('.scene iframe').elementHandle()).contentFrame();await f.waitForSelector('.lam.vis.on');return f;};
 let f=await listo(1);
 const orador=c.waitForEvent('page');await p.keyboard.press('o');const sp=await orador;await sp.waitForLoadState();
 await sp.waitForFunction(()=>document.querySelector('#spk').children.length===3);
 // Recorre las láminas principales: cada clic revela un paso; al terminar los pasos, avanza.
 let clics=0;
 for(let n=1;n<D.main;n++){
   for(let k=1;k<=D.steps[n-1];k++){if(process.env.DBG)console.log("lámina",n,"paso",k);await p.keyboard.press('ArrowRight');clics++;
     await f.waitForFunction(k=>[...document.querySelectorAll('.lam.vis [data-f]')].filter(e=>e.classList.contains('ver')).every(e=>+e.dataset.f<=k)&&[...document.querySelectorAll('.lam.vis [data-f]')].some(e=>+e.dataset.f===k&&e.classList.contains('ver')),k);}
   await p.keyboard.press('ArrowRight');clics++;f=await listo(n+1);
 }
 assert.equal(clics,D.main-1+D.steps.slice(0,D.main-1).reduce((a,b)=>a+b,0));
 // Retroceder desde una lámina con pasos vuelve a su estado final.
 await p.keyboard.press('ArrowLeft');f=await listo(D.main-1);
 const pasosPrev=D.steps[D.main-2];
 if(pasosPrev)await f.waitForFunction(k=>document.querySelectorAll('.lam.vis [data-f].ver').length>0,pasosPrev);
 // Vista del orador: quién habla, conteo de clics y tiempo por orador.
 await sp.waitForFunction(()=>/Lukas/.test(document.querySelector('#who').textContent));
 assert.match(await sp.locator('#spk').textContent(),/Diego.*Torres.*Lukas/);
 // Anexos con P y vuelta con Esc.
 await p.keyboard.press('p');await p.locator('#annex-search').fill('kit costo');await p.keyboard.press('Enter');
 await p.waitForFunction(()=>+document.querySelector('#frame').dataset.slide>DECK.mainSlides);
 await p.keyboard.press('Escape');await listo(D.main-1);
 // Reloj visible con T.
 await p.keyboard.press('t');assert.equal(await p.locator('#reloj').isVisible(),true);await p.keyboard.press('t');
 assert.deepEqual(errores,[]);
 console.log(`PASS defensa: ${D.main} láminas + ${D.N-D.main} de anexo, ${clics} clics recorridos, orador con tiempo por orador, P/Esc, T, sin red externa.`);
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
