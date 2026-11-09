/* Recorre la demo pública con clics reales, sin una sesión de Claude o GitHub. */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const URL_DEMO = process.env.HABILITA_URL || 'http://127.0.0.1:8903/';
const capturas = process.env.HABILITA_SCREENSHOTS;
if(capturas) fs.mkdirSync(capturas, {recursive:true});
let checks = 0;
function ok(cond, texto){ assert(cond, texto); checks++; console.log('OK:', texto); }
async function captura(p, nombre){ if(capturas) await p.screenshot({path:path.join(capturas,nombre+'.png')}); }
async function ruta(p, hash){ await p.waitForFunction(h=>location.hash==='#'+h, hash); await p.waitForTimeout(150); }
async function sinDesborde(p, nombre){ ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), nombre+' sin desborde horizontal'); }
const guia = p => p.locator('#guia-demo');
async function siguiente(p, hash){ await guia(p).getByRole('button',{name:'Siguiente paso',exact:true}).click(); await ruta(p,hash); }
async function cerrarCelebracion(p){ await p.waitForTimeout(600); if(await p.locator('.celebra').count()) await p.locator('.celebra').getByRole('button',{name:'Seguir',exact:true}).click(); }
async function completarLeccion(p){
  let pasos=0, erro=false, orden=false;
  while(pasos++<30 && !await p.locator('.lec.fin').count()){
    const tipo=await p.locator('.lec').getAttribute('data-tipo');
    const dato=await p.evaluate(()=>{const s=UI['lec-N1-1-c']; return LECCION['N1-1-c'].pasos[s.cola[s.i]];});
    if(tipo==='revelar') for(const tarjeta of await p.locator('.rev').all()) await tarjeta.click();
    if(tipo==='ordenar'){
      orden=true;
      for(let k=0;k<30;k++){
        const textos=await p.locator('.ord-t').allInnerTexts();
        const i=textos.findIndex((x,j)=>x!==dato.items[j]);
        if(i<0) break;
        await p.locator('.ord-it').nth(textos.indexOf(dato.items[i])).locator('.ord-mv').first().click();
      }
    }
    if(tipo==='elegir'){
      const equivocarse=!erro && !await p.locator('.lec-reint').count();
      const objetivo=dato.o[equivocarse?(dato.a+1)%dato.o.length:dato.a];
      const textos=await p.locator('.lec .opt').allInnerTexts();
      await p.locator('.lec .opt').nth(textos.findIndex(t=>t.includes(objetivo))).click();
      await p.getByRole('button',{name:'Lo sé',exact:true}).click();
      if(equivocarse){ erro=true; ok(await p.locator('.lec-fb.bad').count()===1,'Error deliberado: explicación y reintento'); }
      await p.locator('.lec-cta').click(); continue;
    }
    if(tipo==='rapido') for(let i=0;i<dato.items.length;i++) await p.locator('[data-k="rap'+i+'-'+dato.items[i].a+'"]').click();
    await p.locator('.lec-cta').click();
    if(await p.locator('.lec-fb').count()) await p.locator('.lec-cta').click();
  }
  ok(orden && erro && await p.locator('.lec.fin').count()===1,'Lección completa: tarjetas, orden, pregunta, reintento y cierre');
  await p.waitForFunction(()=>!!S.mine.avance.aprende.lecciones['N1-1-c']);
  ok(await p.evaluate(()=>S.mine.avance.aprende.lecciones['N1-1-c'].veces===1),'El progreso guarda la lección una sola vez');
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  try {
    for(const v of [{nombre:'escritorio-oscuro',width:1440,height:1000,tema:'dark'},{nombre:'telefono-claro',width:390,height:844,tema:'light'}]){
      const ctx=await browser.newContext({viewport:{width:v.width,height:v.height}});
      const p=await ctx.newPage(), errores=[], externos=[];
      p.on('pageerror',e=>errores.push(e.message));
      p.on('console',m=>{if(m.type()==='error') errores.push(m.text());});
      p.on('response',r=>{if(r.status()>=400) errores.push(r.status()+' '+r.url());});
      p.on('requestfailed',r=>errores.push(r.failure().errorText+' '+r.url()));
      p.on('request',r=>{if(/^https?:/.test(r.url()) && new URL(r.url()).origin!==new URL(URL_DEMO).origin) externos.push(r.url());});
      await p.addInitScript(tema=>localStorage.setItem('lh-theme2',tema),v.tema);
      const respuesta=await p.goto(URL_DEMO,{waitUntil:'networkidle'});
      ok(!respuesta||respuesta.ok(),v.nombre+' carga con HTTP correcto');
      await p.getByRole('button',{name:'Ver como participante',exact:true}).waitFor();
      await p.locator('#pre').waitFor({state:'hidden'});
      ok(await p.getByRole('button',{name:'Ver como administrador',exact:true}).count()===1,'Dos perfiles disponibles');
      ok(!/claude/i.test(await p.locator('body').innerText()),'Entrada sin marca ni interfaz de Claude');
      await sinDesborde(p,'Selector '+v.nombre); await captura(p,v.nombre+'-selector');
      // Entrar también funciona con teclado.
      await p.getByRole('button',{name:'Ver como participante',exact:true}).focus(); await p.keyboard.press('Enter');
      await ruta(p,'hoy'); await cerrarCelebracion(p);
      ok(await p.evaluate(()=>S.demoRole==='tecnico'),'Participante usa su cuenta ficticia');
      ok(await guia(p).getByRole('button',{name:'Anterior',exact:true}).isDisabled(),'Primer paso no permite retroceder fuera de la guía');
      await sinDesborde(p,'Hoy '+v.nombre); await captura(p,v.nombre+'-participante');
      await siguiente(p,'modulo-N1-1');
      await guia(p).getByRole('button',{name:'Anterior',exact:true}).click(); await ruta(p,'hoy');
      await siguiente(p,'modulo-N1-1'); await siguiente(p,'leccion-N1-1-c');
      await guia(p).getByRole('button',{name:'Siguiente paso',exact:true}).click();
      await p.getByRole('button',{name:'Seguir practicando',exact:true}).click();
      ok(await p.evaluate(()=>location.hash==='#leccion-N1-1-c'),'Cancelar la salida conserva el ejercicio');
      await sinDesborde(p,'Lección '+v.nombre); await captura(p,v.nombre+'-leccion');
      await completarLeccion(p);
      // La demo existente persiste con un debounce de 400 ms.
      await p.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('lh-demo-v6')||'{"docs":{}}').docs).some(d=>d?.aprende?.lecciones?.['N1-1-c']));
      await p.reload({waitUntil:'networkidle'});
      ok(await p.evaluate(()=>S.demoRole==='tecnico'&&guiaDemo.paso===2&&!!S.mine.avance.aprende.lecciones['N1-1-c']),'Recargar conserva rol, paso de guía y progreso');
      // La lección abre un nuevo intento al recargar; la guía avisa antes de abandonarlo.
      await guia(p).getByRole('button',{name:'Siguiente paso',exact:true}).click();
      await p.getByRole('button',{name:'Cambiar de pantalla',exact:true}).click(); await ruta(p,'repaso');
      ok(await p.locator('.lec').count()===1,'Repaso ofrece las preguntas pendientes');
      await guia(p).getByRole('button',{name:'Siguiente paso',exact:true}).click();
      await p.getByRole('button',{name:'Cambiar de pantalla',exact:true}).click(); await ruta(p,'ruta');
      await cerrarCelebracion(p);
      await guia(p).getByRole('button',{name:'Terminar recorrido',exact:true}).click(); await ruta(p,'demo');
      ok(await p.evaluate(()=>guiaDemo===null),'Final del participante vuelve al selector');
      await p.getByRole('button',{name:'Ver como administrador',exact:true}).click(); await ruta(p,'panel');
      ok(await p.evaluate(()=>S.role==='admin'&&S.demoRole==='rt'),'Administrador usa el Responsable Técnico ficticio');
      await sinDesborde(p,'Panel '+v.nombre); await captura(p,v.nombre+'-administrador');
      for(const h of ['personas','persona-p_felipe','sesion-s_jt_felipe','indicadores']){
        await siguiente(p,h); await sinDesborde(p,h+' '+v.nombre);
      }
      await captura(p,v.nombre+'-indicadores');
      await guia(p).getByRole('button',{name:'Terminar recorrido',exact:true}).click(); await ruta(p,'demo');
      ok(await guia(p).isHidden(),'Final del administrador vuelve al selector');
      await p.getByRole('button',{name:'Ver como administrador',exact:true}).click(); await ruta(p,'panel');
      await guia(p).getByRole('button',{name:'Salir de la guía',exact:true}).click();
      ok(await guia(p).isHidden() && await p.evaluate(()=>location.hash==='#panel'),'Salir de la guía permite explorar sin abandonar la pantalla');
      await p.getByRole('button',{name:'Recorrido guiado',exact:true}).click(); await ruta(p,'demo');
      await p.getByRole('button',{name:'Restablecer datos de prueba',exact:true}).click();
      await p.getByRole('button',{name:'Cancelar',exact:true}).click();
      ok(await p.evaluate(()=>!!S.D.avance.u_ignacio?.aprende?.lecciones['N1-1-c']),'Cancelar restablecimiento conserva progreso');
      await p.getByRole('button',{name:'Restablecer datos de prueba',exact:true}).click();
      await p.getByRole('button',{name:'Restablecer',exact:true}).click(); await ruta(p,'demo');
      await p.waitForFunction(()=>S.demoRole==='visitante');
      ok(await p.evaluate(()=>guiaDemo===null),'Restablecer vuelve a datos iniciales y sale de la cuenta');
      ok(errores.length===0,v.nombre+' sin errores JavaScript, de red ni 404: '+errores.join('; '));
      ok(externos.length===0,v.nombre+' no necesita recursos externos: '+externos.join('; '));
      await ctx.close();
    }
    console.log('DEMO HABILITA: '+checks+' comprobaciones correctas.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
