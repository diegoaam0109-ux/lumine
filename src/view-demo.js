/* Dos recorridos de demostración. Solo navegación: no aprueban competencias. */
'use strict';
const DEMO_GUIAS = {
  participante: { rol:'tecnico', titulo:'Participante', persona:'Ignacio Pérez · persona ficticia', pasos:[
    { ruta:'hoy', titulo:'Tu siguiente paso', texto:'Mira la siguiente lección, tu meta del día y lo que necesitas repasar. La racha y el progreso son personales; no compites con otros técnicos.' },
    { ruta:'modulo-N1-1', titulo:'Un camino de lecciones', texto:'Abre Seguridad del kit · parte 1. Cada lección explica qué aprenderás y cita sus fuentes. Este es el primer módulo con el nuevo formato interactivo.' },
    { ruta:'leccion-N1-1-c', titulo:'Aprender haciendo', texto:'Lee la situación y pulsa Continuar. Descubre las tarjetas, ordena los pasos y responde una pregunta. Una respuesta incorrecta muestra una explicación y vuelve a aparecer para practicar. Puedes explorar la lección o continuar la guía.' },
    { ruta:'repaso', titulo:'Volver a lo que cuesta', texto:'Prueba el repaso de hoy. Usa lo que has respondido para volver sobre errores y dudas. Si ya completaste todo, verás que estás al día.' },
    { ruta:'ruta', titulo:'Aprender y habilitarse', texto:'Revisa Mi ruta y abre tu credencial. La práctica en línea prepara para la evaluación presencial; los puntos y la racha no otorgan una habilitación profesional.' }
  ]},
  administrador: { rol:'rt', titulo:'Administrador', persona:'Responsable Técnico · cuenta ficticia', pasos:[
    { ruta:'panel', titulo:'Qué necesita atención', texto:'Revisa el estado del equipo y los avisos del panel. Todos los nombres y resultados de esta demostración son ficticios.' },
    { ruta:'personas', titulo:'Cada persona, una ruta', texto:'Explora la lista de personas. Sus antecedentes y competencias demostradas determinan lo que cada una debe aprender.' },
    { ruta:'persona-p_felipe', titulo:'Del antecedente al expediente', texto:'Revisa el expediente de Felipe: nivel, plan y antecedentes. La administración consulta la preparación de cada persona antes de tomar decisiones.' },
    { ruta:'sesion-s_jt_felipe', titulo:'Revisar antes de habilitar', texto:'Mira la jornada técnica de Felipe y quién debe evaluar cada estación. Durante esta presentación basta con inspeccionar: la guía no aprueba ni modifica resultados.' },
    { ruta:'indicadores', titulo:'Seguimiento del sistema', texto:'Explora los indicadores y su vista de tabla. Son ejemplos con datos ficticios, no resultados comerciales ni evidencia de ahorro. Termina la guía para volver al selector.' }
  ]}
};
const GUIA_KEY = 'lh-guia-demo-v1';
let guiaDemo = (() => {
  if(BUILD !== 'demo') return null;
  try { const g=JSON.parse(sessionStorage.getItem(GUIA_KEY)); return g && DEMO_GUIAS[g.tipo] && Number.isInteger(g.paso) && g.paso>=0 && g.paso<DEMO_GUIAS[g.tipo].pasos.length ? g : null; } catch(e){ return null; }
})();
let guiaOcupada = false;
function guardarGuia(){ try { if(guiaDemo) sessionStorage.setItem(GUIA_KEY,JSON.stringify(guiaDemo)); else sessionStorage.removeItem(GUIA_KEY); } catch(e){} }
async function confirmarSalidaGuia(){
  if(!['leccion','repaso'].includes(parseHash().id)) return true;
  const keys=Object.keys(UI).filter(k=>k.startsWith('lec-') && UI[k] && !UI[k].fin);
  if(!keys.length) return true;
  const si=await dialog({title:'¿Cambiar de pantalla?',body:'El intento de práctica que no hayas terminado se reiniciará. Las lecciones ya completadas se conservan.',confirm:'Cambiar de pantalla',cancel:'Seguir practicando'});
  if(si){ keys.forEach(k=>delete UI[k]); delete UI['rep-sel']; }
  return si;
}
async function pasoGuia(tipo,paso,iniciar){
  if(S.build!=='demo'||guiaOcupada||!DEMO_GUIAS[tipo]) return;
  const g=DEMO_GUIAS[tipo];
  if(paso<0||paso>=g.pasos.length) return;
  guiaOcupada=true;
  try {
    if(!await confirmarSalidaGuia()) return;
    // Cada presentación puede mostrar el hito otra vez; retroceder dentro de la guía no lo repite.
    if(iniciar && g.rol==='tecnico'){
      const rol=DEMO_ROLES.find(r=>r.id===g.rol);
      try { if(rol && rol.viewer.id) localStorage.removeItem('lh-nivel-visto-'+rol.viewer.id); } catch(e){}
    }
    guiaDemo={tipo,paso}; guardarGuia();
    if(S.demoRole!==g.rol) await cambiarRolDemo(g.rol);
    go(g.pasos[paso].ruta);
  } catch(e){ toast(errMsg(e),'crit'); }
  finally { guiaOcupada=false; }
}
async function terminarGuia(volver){
  if(!await confirmarSalidaGuia()) return;
  guiaDemo=null; guardarGuia();
  if(volver) go('demo'); else render();
}
function pintarGuiaDemo(){
  let cont=document.getElementById('guia-demo');
  if(!cont){ cont=h('section',{id:'guia-demo',class:'wrap guia-demo','aria-label':'Guía de demostración'}); $('#main').before(cont); }
  clear(cont);
  if(S.build!=='demo'||!guiaDemo||S.kiosk||S.preview||parseHash().id==='demo'){ cont.hidden=true; return; }
  const g=DEMO_GUIAS[guiaDemo.tipo],i=guiaDemo.paso,p=g.pasos[i];
  if(!guiaOcupada && S.role!=='loading' && S.demoRole!==g.rol){ guiaDemo=null;guardarGuia();cont.hidden=true;return; }
  cont.hidden=false;
  const meta=h('div',{class:'guia-meta'},h('span',{class:'label'},g.titulo+' · Paso '+(i+1)+' de '+g.pasos.length),h('b',null,p.titulo));
  const details=h('details',{class:'guia-detalle'},h('summary',null,'Qué mirar en esta pantalla'),h('p',null,p.texto));
  if(!matchMedia('(max-width: 640px)').matches) details.open=true;
  const botones=h('div',{class:'guia-controles'},
    btn('Anterior',{kind:'ghost',size:'sm',onClick:()=>pasoGuia(guiaDemo.tipo,i-1)}),
    btn(i===g.pasos.length-1?'Terminar recorrido':'Siguiente paso',{kind:'action',size:'sm',onClick:()=>i===g.pasos.length-1?terminarGuia(true):pasoGuia(guiaDemo.tipo,i+1)}),
    btn('Salir de la guía',{kind:'quiet',size:'sm',onClick:()=>terminarGuia(false)}));
  botones.firstChild.disabled=i===0;
  cont.append(h('div',{class:'guia-card'},meta,details,botones));
}
VIEWS.demo=function(){
  if(S.build!=='demo') return VIEWS.inicio();
  return page(
    phead({eyebrow:'Lumine Habilita · demostración',eic:'play',title:'Dos miradas. Un mismo proceso.',lead:'Aprende como participante o explora la supervisión como administrador. Elige un recorrido de cinco pasos y prueba la plataforma a tu ritmo.'}),
    h('div',{class:'demo-eleccion'},Object.entries(DEMO_GUIAS).map(([id,g])=>h('section',{class:'card demo-camino'},
      h('span',{class:'label'},id==='participante'?'01 · Quiero capacitarme':'02 · Quiero supervisar'),
      h('h2',{class:'h3'},g.titulo),h('p',{class:'ink2'},id==='participante'?'Lecciones interactivas, repaso y tu ruta de formación.':'Personas, expedientes, validaciones e indicadores.'),
      h('ol',null,g.pasos.map(p=>h('li',null,p.titulo))),
      btn('Ver como '+id,{kind:'action',size:'lg',arrow:true,onClick:()=>pasoGuia(id,0,true)}),h('p',{class:'hint'},g.persona)))),
    notice('info','info','Datos ficticios guardados en este navegador. Puedes explorar libremente y volver aquí con “Recorrido guiado”. La práctica en línea no reemplaza la evaluación presencial.'),
    h('div',{class:'row',style:'margin-top:20px'},linkBtn('Explorar la portada','inicio',{kind:'ghost'}),
      btn('Restablecer datos de prueba',{kind:'ghost',icon:'refresh',onClick:async()=>{
        if(await dialog({title:'¿Restablecer la demostración?',body:'Se borran los cambios de esta demo en este navegador y vuelven los ejemplos iniciales. La celebración de nivel también queda lista para mostrarse de nuevo.',confirm:'Restablecer'})){
          for(const k of Object.keys(UI)) delete UI[k];
          try { Object.keys(DEMO_DIR).forEach(uid=>localStorage.removeItem('lh-nivel-visto-'+uid)); } catch(e){}
          guiaDemo=null;guardarGuia();demoReset();await cambiarRolDemo('visitante');go('demo');
        }
      }})))
};
