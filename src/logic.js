/* =====================================================================
   Lumine Habilita · reglas del sistema (funciones puras, sin DOM)
   ===================================================================== */
'use strict';

/* ---------- fechas (siempre locales, formato AAAA-MM-DD) ---------- */
const pad2 = n => String(n).padStart(2, '0');
function isoDate(d){ return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function hoyISO(){ return isoDate(new Date()); }
/* Fecha ISO estricta: rechaza fechas que JavaScript normalizaría (2026-02-31 no pasa a marzo). */
function parseISO(s){
  if(!s || typeof s !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if(!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if(mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  return (dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null;
}
function fechaValida(s){ return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !!parseISO(s); }
function addDays(s, n){ const d = parseISO(s); if(!d) return null; d.setDate(d.getDate() + n); return isoDate(d); }
function addMonths(s, n){ const d = parseISO(s); if(!d) return null; const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const last = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); d.setDate(Math.min(day, last)); return isoDate(d); }
function diffDays(a, b){ const A = parseISO(a), B = parseISO(b); if(!A || !B) return null; return Math.round((B - A) / 86400000); }
function monthsBetween(a, b){ const A = parseISO(a), B = parseISO(b); if(!A || !B) return null; let m = (B.getFullYear()-A.getFullYear())*12 + (B.getMonth()-A.getMonth()); if(B.getDate() < A.getDate()) m -= 1; return m; }

/* ---------- identificadores seguros para rutas de la base ---------- */
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
function validId(s){ return typeof s === 'string' && ID_RE.test(s); }
function nid(prefix){
  const a = new Uint8Array(9);
  globalThis.crypto.getRandomValues(a);
  let s = ''; for(const b of a) s += (b % 36).toString(36);
  return (prefix ? prefix + '_' : '') + Date.now().toString(36) + s;
}

/* ---------- utilidades ---------- */
const uniq = arr => Array.from(new Set(arr));
const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
function sortCodes(arr){ return uniq(arr).sort(byCode); }
function reqComp(total, umbral){ return total <= 0 ? 0 : Math.ceil(total * (umbral / 100) - 1e-9); }
function clamp(n, a, b){ return Math.min(b, Math.max(a, n)); }

/* ---------- diagnóstico ---------- */
function mapaPreliminar(ant){
  if(!ant) return [];
  const out = [];
  const pf = PERFILES[ant.perfil]; if(pf) out.push(...pf.marca);
  const certs = ant.certificados || {};
  for(const c of CERTIFICADOS) if(certs[c.id]) out.push(...c.marca);
  const exps = ant.experiencias || {};
  for(const e of EXPERIENCIAS) if(exps[e.c]) out.push(e.c);
  return sortCodes(out.filter(c => ESTACIONES.includes(c)));
}
function puntajeFundamentos(resp){
  const out = { electrica:{ok:0,total:0}, mecanica:{ok:0,total:0}, electronica:{ok:0,total:0} };
  if(!resp) return out;
  for(const q of FUNDAMENTOS){
    out[q.area].total++;
    if(resp[q.id] === q.a) out[q.area].ok++;
  }
  return out;
}
/* Solo agrega: un área queda para nivelación si no alcanza el umbral. */
function nivelacionPorFundamentos(fund, umbral){
  if(!fund || !fund.respuestas) return [];
  const p = puntajeFundamentos(fund.respuestas);
  return Object.keys(p).filter(a => p[a].ok < umbral);
}
function nivelacionPorJornada(jornada){
  if(!jornada || !jornada.basico) return [];
  return Object.keys(jornada.basico).filter(a => jornada.basico[a] === 'nivelar');
}
function nivelacionFinal(persona, params){
  const u = (params && params.umbralFund) || PARAMS_DEF.umbralFund;
  const areas = uniq([...nivelacionPorFundamentos(persona.fundamentos, u), ...nivelacionPorJornada(persona.jornada)]);
  return ['electrica','mecanica','electronica'].filter(a => areas.includes(a)).map(a => AREA_NIV[a]);
}
function saltadas(persona){
  const est = (persona.jornada && persona.jornada.estaciones) || {};
  return sortCodes(Object.keys(est).filter(c => est[c] === 's' && C[c] && C[c].p === 'oficio'));
}
function estadoDiagnostico(persona){
  return {
    antecedentes: !!persona.antecedentes,
    fundamentos: !!(persona.fundamentos && persona.fundamentos.fecha),
    jornada: !!(persona.jornada && persona.jornada.fecha),
    plan: !!(persona.jornada && persona.jornada.fecha)
  };
}

/* ---------- plan personal ----------
   nivelación + core completo + oficio no demostrado + desarrollo por nivel + refuerzo */
function refuerzo(persona){
  const p = persona.pauta || {};
  return sortCodes(Object.keys(p).filter(c => p[c] && p[c].r === 'n'));
}
function moduloAplica(m, cursarSet, nivelacion){
  if(m.nivel === 0) return nivelacion.includes(m.id);
  return m.cod.some(c => cursarSet.has(c));
}
function planPersonal(persona, params){
  const skip = saltadas(persona);
  const skipSet = new Set(skip);
  const core = COMP.filter(x => x.p === 'core').map(x => x.c);
  const oficio = COMP.filter(x => x.p === 'oficio' && !skipSet.has(x.c)).map(x => x.c);
  const desarrollo = COMP.filter(x => x.p === 'desarrollo').map(x => x.c);
  const cursar = [...core, ...oficio, ...desarrollo];
  const cursarSet = new Set(cursar);
  const nivelacion = nivelacionFinal(persona, params);
  const porNivel = {};
  for(const n of [1,2,3,4]) porNivel[n] = {
    cursar: COMP.filter(x => x.n === n && cursarSet.has(x.c)).map(x => x.c),
    saltadas: COMP.filter(x => x.n === n && skipSet.has(x.c)).map(x => x.c)
  };
  const modulos = MODULOS.filter(m => moduloAplica(m, cursarSet, nivelacion)).map(m => m.id);
  const hm = (params && params.horasModulo) || {};
  let horas = 0, faltanHoras = [];
  for(const id of modulos){ const h = Number(hm[id]); if(hm[id] === null || hm[id] === undefined || hm[id] === '' || !isFinite(h)) faltanHoras.push(id); else horas += h; }
  return {
    nivelacion, saltadas: skip, core, oficio, desarrollo, cursar, total: cursar.length,
    refuerzo: refuerzo(persona), porNivel, modulos,
    horas: faltanHoras.length ? null : horas, faltanHoras
  };
}

/* ---------- validaciones ---------- */
function evaluadorDe(code){
  if(code === 'C25' || code === 'C26') return 'ic';
  return C[code] && C[code].v === 'ext' ? 'ext' : 'int';
}
/* Ítems que entran a una validación. En un segundo intento solo entra lo que no está aprobado (regla de avance 1). */
function itemsValidacion(tipo, persona){
  const pauta = persona.pauta || {};
  if(tipo === 'REV'){
    return CORE_SEG.filter(c => C[c].n <= Math.max(1, persona.nivel || 0));
  }
  const n = Number(tipo.slice(1));
  if(!(n >= 1 && n <= 4)) return [];
  const skip = new Set(saltadas(persona));
  return COMP.filter(x => x.n === n && !skip.has(x.c) && !(pauta[x.c] && (pauta[x.c].r === 's' || pauta[x.c].r === 'j'))).map(x => x.c);
}
function preaprobadas(tipo, persona){
  if(!/^N[1-4]$/.test(tipo)) return [];
  const n = Number(tipo.slice(1));
  const pauta = persona.pauta || {};
  return COMP.filter(x => x.n === n && pauta[x.c] && (pauta[x.c].r === 's' || pauta[x.c].r === 'j')).map(x => x.c);
}
/* items: [{c, r}] donde r es 's' | 'n' | null. Se evalúa sobre el nivel completo (incluye lo ya aprobado). */
function evaluar(items, umbral){
  const u = umbral || PARAMS_DEF.umbralComp;
  let completo = true;
  const crit = { total:0, ok:0 }, comp = { total:0, ok:0 };
  const fallCrit = [], fallComp = [];
  for(const it of items){
    const k = C[it.c] ? C[it.c].k : 'seg';
    const r = it.r;
    if(r !== 's' && r !== 'n' && r !== 'j') completo = false;
    const ok = r === 's' || r === 'j';
    if(k === 'comp'){ comp.total++; if(ok) comp.ok++; else if(r === 'n') fallComp.push(it.c); }
    else { crit.total++; if(ok) crit.ok++; else if(r === 'n') fallCrit.push(it.c); }
  }
  comp.req = reqComp(comp.total, u);
  const aprobado = completo && fallCrit.length === 0 && comp.ok >= comp.req;
  return { completo, crit, comp, fallidas: sortCodes([...fallCrit, ...fallComp]), fallCrit, fallComp, aprobado };
}
/* Exigencia real del 85% en cada validación: con pocas complementarias equivale a 100%. */
function exigenciaEfectiva(umbral){
  return [1,2,3,4].map(n => {
    const tot = COMP.filter(x => x.n === n && x.k === 'comp').length;
    const req = reqComp(tot, umbral);
    return { n, total: tot, req, equivale100: tot === req };
  });
}
function minimoParaQueImporte(umbral){
  for(let t = 1; t <= 60; t++) if(reqComp(t, umbral) < t) return t;
  return null;
}

/* ---------- avance ---------- */
function nivelNombre(n){ return n >= 1 ? NIVEL[n].nombre : 'En formación'; }
function siguienteNivel(persona){ const n = persona.nivel || 0; return n >= 4 ? null : n + 1; }
function repetir(persona){
  const sig = siguienteNivel(persona); if(!sig) return [];
  const p = persona.pauta || {};
  return COMP.filter(x => x.n === sig && p[x.c] && p[x.c].r === 'n').map(x => x.c);
}
function modulosDelNivel(n, plan){
  const lista = MODULOS.filter(m => m.nivel === n && plan.modulos.includes(m.id)).map(m => m.id);
  const niv = NIVELACION.filter(x => x.antes === n && plan.nivelacion.includes(x.id)).map(x => x.id);
  return [...niv, ...lista];
}
function moduloCompleto(id, av){
  const m = av && av.modulos && av.modulos[id];
  if(!m) return false;
  return !!(m.aprobado || m.revisado);
}
/* D8: la práctica online da derecho a presentarse. */
function listoParaPresentarse(n, plan, avance){
  const mods = modulosDelNivel(n, plan);
  const faltan = mods.filter(id => !moduloCompleto(id, avance));
  return { listo: faltan.length === 0, faltan, total: mods.length };
}
function moduloDesbloqueado(m, persona){
  if(m.nivel === 0) return true;
  const n = persona.nivel || 0;
  return m.nivel <= n + 1;
}

/* ---------- revalidación del core de seguridad ---------- */
function revalidacion(persona, params, hoy){
  const meses = Number((params && params.revalidacionMeses) || PARAMS_DEF.revalidacionMeses);
  if(!persona || (persona.nivel || 0) < 1 || persona.etapa !== 'tecnico') return { estado:'na', vence:null, dias:null };
  const p = persona.pauta || {};
  const fechas = CORE_SEG.filter(c => C[c].n <= persona.nivel && p[c] && p[c].r === 's' && p[c].t).map(c => p[c].t).sort();
  if(!fechas.length) return { estado:'na', vence:null, dias:null };
  const vence = addMonths(fechas[0], meses);
  const dias = diffDays(hoy || hoyISO(), vence);
  return { estado: dias < 0 ? 'vencida' : dias <= 30 ? 'pronto' : 'ok', vence, dias, base: fechas[0] };
}

/* ---------- duos ---------- */
function activos(personas){ return personas.filter(p => p.etapa === 'tecnico'); }
function hayNivel3(personas){ return activos(personas).some(p => (p.nivel || 0) >= 3); }
function hayNivel2(personas){ return activos(personas).some(p => (p.nivel || 0) >= 2); }
/* El nivel 1 solo habilita a ser el segundo integrante (encargado de seguridad): dos de nivel 1 no tienen
   quien ejecute. Solo al arrancar, cuando nadie llegó al nivel 2, trabajan así bajo el Responsable Técnico. */
const DUO_N1_MOTIVO = 'Dos técnicos de nivel 1 no forman duo: el nivel 1 solo habilita a ser el segundo integrante, encargado de seguridad';
function duoActivoDe(pid, duos){ return duos.find(d => d.activo && (d.a === pid || d.b === pid)) || null; }
function companero(pid, duos){ const d = duoActivoDe(pid, duos); return d ? (d.a === pid ? d.b : d.a) : null; }
function estadoDuo(duo, P, personas, hoy, params){
  const a = P[duo.a], b = P[duo.b];
  const out = { valido:true, supervisionRT:false, alertas:[], max:0 };
  if(!a || !b){ out.valido = false; out.alertas.push({s:'crit', t:'Integrante no encontrado'}); return out; }
  out.max = Math.max(a.nivel || 0, b.nivel || 0);
  if((a.nivel || 0) < 1 || (b.nivel || 0) < 1){ out.valido = false; out.alertas.push({s:'crit', t:'Un integrante aún no valida el nivel 1'}); }
  if(out.max < 2 && hayNivel2(personas)){ out.valido = false; out.alertas.push({s:'crit', t:'Duo de dos técnicos de nivel 1'}); }
  if(out.max < 3){
    if(hayNivel3(personas)){ out.valido = false; out.alertas.push({s:'crit', t:'Duo sin técnico de nivel 3 o 4'}); }
    else { out.supervisionRT = true; out.alertas.push({s:'info', t:'Primera generación: supervisión directa del Responsable Técnico'}); }
  }
  for(const x of [a, b]) if(x.suspendidoAT) out.alertas.push({s:'crit', k:'susp', t: x.nombre + ' está suspendido de alta tensión hasta revalidar'});
  const meses = rotacionMeses(params);
  out.rotacionLibre = addMonths(duo.desde, meses);
  out.puedeRotar = diffDays(hoy || hoyISO(), out.rotacionLibre) <= 0;
  return out;
}
function puedeFormarDuo(aId, bId, P, duos, personas){
  const a = P[aId], b = P[bId];
  if(!a || !b) return { ok:false, motivo:'Elige a dos técnicos' };
  if(aId === bId) return { ok:false, motivo:'Elige a dos personas distintas' };
  for(const x of [a, b]){
    if(x.etapa !== 'tecnico') return { ok:false, motivo: x.nombre + ' no es técnico activo' };
    if((x.nivel || 0) < 1) return { ok:false, motivo: x.nombre + ' aún no valida el nivel 1' };
    if(duoActivoDe(x.id, duos)) return { ok:false, motivo: x.nombre + ' ya está en un duo activo' };
  }
  const max = Math.max(a.nivel, b.nivel);
  if(max < 2 && hayNivel2(personas)) return { ok:false, motivo: DUO_N1_MOTIVO };
  if(max < 3 && hayNivel3(personas)) return { ok:false, motivo:'Todo duo lleva al menos un técnico de nivel 3 o 4' };
  if(max < 3) return { ok:true, aviso:'Primera generación: el duo trabaja con supervisión directa del Responsable Técnico' };
  return { ok:true };
}

/* ---------- quién puede validar ---------- */
function puedeValidar(uid, rol, persona, P, duos, personas, code){
  if(!uid) return { ok:false, motivo:'Sin identidad de evaluador' };
  const evalPersona = personas.find(p => p.uid && p.uid === uid);
  if(evalPersona && evalPersona.id === persona.id) return { ok:false, motivo:'Nadie se valida a sí mismo' };
  if(evalPersona){
    const comp = companero(persona.id, duos);
    if(comp && comp === evalPersona.id) return { ok:false, motivo:'Es su compañero de duo. Nadie valida a su compañero de duo.' };
  }
  if(code && evaluadorDe(code) === 'ic' && rol !== 'ic') return { ok:false, motivo:'C25 y C26 los valida Ingeniería de Calibración' };
  if(rol === 'formador' && !(evalPersona && evalPersona.nivel >= 4)) return { ok:false, motivo:'Solo un formador de nivel 4 valida a otros' };
  return { ok:true };
}

/* ---------- bono por avance (D11) ---------- */
function bono(persona, params){
  const b = (params && params.bonoNivel) || {};
  const fn = persona.fechasNivel || {};
  return [1,2,3,4].filter(n => fn[n]).map(n => ({ n, fecha: fn[n], monto: (b[n] === null || b[n] === undefined || b[n] === '') ? null : Number(b[n]) }));
}

/* ---------- selección: comparar postulantes ---------- */
function resumenRuta(persona, params){
  const plan = planPersonal(persona, params);
  return { nivelacion: plan.nivelacion.length, oficio: plan.saltadas.length, cursar: plan.total, horas: plan.horas, plan };
}

/* ---------- alertas automáticas (informe 6) ---------- */
function alertas(ctx){
  const { personas, duos, sesiones, params, hoy, marcas, agenda, postulaciones } = ctx;
  const P = Object.fromEntries(personas.map(p => [p.id, p]));
  const out = [];
  for(const d of duos.filter(x => x.activo)){
    const e = estadoDuo(d, P, personas, hoy, params);
    for(const a of e.alertas){
      if(a.s === 'info' || a.k === 'susp') continue;
      out.push({ s:a.s, t:a.t, d:'Duo ' + ((P[d.a]||{}).nombre || '?') + ' y ' + ((P[d.b]||{}).nombre || '?'), ref:{ tipo:'duo', id:d.id } });
    }
  }
  for(const p of activos(personas)){
    if(!duoActivoDe(p.id, duos) && (p.nivel || 0) >= 1) out.push({ s:'warn', t: p.nombre + ' no tiene duo', d:'Todo el trabajo técnico se hace en duos fijos (D12).', ref:{ tipo:'persona', id:p.id } });
    const rv = revalidacion(p, params, hoy);
    if(rv.estado === 'vencida') out.push({ s:'crit', t:'Revalidación de seguridad vencida: ' + p.nombre, d:'Venció el ' + fechaLarga(rv.vence) + '. Solo el core de seguridad se revalida.', ref:{ tipo:'persona', id:p.id }, accion:'REV' });
    else if(rv.estado === 'pronto') out.push({ s:'warn', t:'Revalidación de seguridad por vencer: ' + p.nombre, d:'Vence el ' + fechaLarga(rv.vence) + ' (en ' + rv.dias + ' días).', ref:{ tipo:'persona', id:p.id }, accion:'REV' });
    if(p.suspendidoAT) out.push({ s:'crit', t: p.nombre + ' suspendido de alta tensión', d:'Tuvo un incidente grave. Vuelve a trabajar con alta tensión cuando apruebe la revalidación del core de seguridad.', ref:{ tipo:'persona', id:p.id }, accion:'REV' });
  }
  const abiertas = (sesiones || []).filter(s => s.estado === 'abierta');
  for(const s of abiertas){
    const pend = recibidasSinAceptar(s, marcas || {}, agenda || {});
    if(pend.length) out.push({ s:'info', t:'Resultados recibidos por aceptar', d: TIPOS_SESION[s.tipo].l + ' de ' + ((P[s.pid]||{}).nombre || '?'), ref:{ tipo:'sesion', id:s.id } });
  }
  for(const po of (postulaciones || [])) out.push({ s:'info', t:'Nueva postulación: ' + (po.nombre || 'sin nombre'), d:'Llegó por la plataforma. Crea su expediente para seguir con la jornada técnica.', ref:{ tipo:'postulacion', id:po.uid } });
  const rank = { crit:0, warn:1, info:2 };
  return out.sort((a, b) => rank[a.s] - rank[b.s]);
}
function recibidasSinAceptar(sesion, marcas, agenda){
  const out = [];
  const items = sesion.items || {};
  const porUid = {};
  for(const c of Object.keys(items)){ const it = items[c]; if(it.asig && !it.r) (porUid[it.asig] = porUid[it.asig] || []).push(c); }
  for(const uid of Object.keys(porUid)){
    const m = marcas[uid] && marcas[uid].sesiones && marcas[uid].sesiones[sesion.id];
    if(m && m.enviado){
      const cods = porUid[uid].filter(c => m.items && (m.items[c] === 's' || m.items[c] === 'n'));
      if(cods.length) out.push({ uid, cods, enviado: m.enviado, obs: m.obs || '' });
    }
  }
  return out;
}

/* ---------- indicadores (informe 6) ---------- */
/* Ventana [desde, hasta] cerrada en ambos extremos. Sin 'desde' = desde siempre;
   sin 'hasta' = sin tope (el llamador pasa hoy para excluir fechas futuras). Una fecha vacía no entra. */
function enPeriodo(fecha, desde, hasta){
  if(!fecha) return false;
  if(desde && fecha < desde) return false;
  if(hasta && fecha > hasta) return false;
  return true;
}
function indicadores(ctx){
  const { personas, duos, registros, params, gestion, hoy, desde } = ctx;
  const hasta = ctx.hasta || hoy || null;
  const inP = f => enPeriodo(f, desde, hasta);
  const P = Object.fromEntries(personas.map(p => [p.id, p]));
  const perfiles = Object.keys(PERFILES);
  const tecnicos = personas.filter(p => p.etapa === 'tecnico' || p.etapa === 'salio');
  const res = {};

  // 1. Tiempo hasta la autonomía
  const aut = {};
  for(const p of tecnicos){
    const f3 = p.fechasNivel && p.fechasNivel[3];
    if(p.ingreso && f3 && inP(f3)){ (aut[p.perfil] = aut[p.perfil] || []).push(diffDays(p.ingreso, f3)); }
  }
  res.autonomia = {
    porPerfil: perfiles.map(k => ({ k, l: PERFILES[k].l, n: (aut[k]||[]).length, dias: (aut[k]||[]).length ? Math.round((aut[k]).reduce((a,b)=>a+b,0) / aut[k].length) : null })),
    n: Object.values(aut).reduce((a, v) => a + v.length, 0)
  };
  const todos = Object.values(aut).flat();
  res.autonomia.promedio = todos.length ? Math.round(todos.reduce((a,b)=>a+b,0) / todos.length) : null;

  // 2. Aprobación al primer intento
  const prim = {};
  for(const p of personas){
    for(const h of Object.values(p.historial || {})){
      if(h.intento !== 1 || !inP(h.fecha)) continue;
      const k = h.tipo; prim[k] = prim[k] || { ok:0, total:0 }; prim[k].total++; if(h.aprobado) prim[k].ok++;
    }
  }
  res.primer = { porTipo: ['N1','N2','N3','N4','REV'].map(k => ({ k, l: k === 'REV' ? 'Revalidación' : 'Nivel ' + k.slice(1), ok:(prim[k]||{}).ok || 0, total:(prim[k]||{}).total || 0, pct: (prim[k] && prim[k].total) ? Math.round(100 * prim[k].ok / prim[k].total) : null })) };
  const pt = Object.values(prim).reduce((a, v) => ({ ok:a.ok+v.ok, total:a.total+v.total }), { ok:0, total:0 });
  res.primer.global = pt.total ? Math.round(100 * pt.ok / pt.total) : null;
  res.primer.total = pt.total;

  // 3. Oficio demostrado
  const ofi = {};
  for(const p of personas){
    if(!(p.jornada && p.jornada.fecha) || !inP(p.jornada.fecha)) continue;
    (ofi[p.perfil] = ofi[p.perfil] || []).push(saltadas(p).length);
  }
  const allOf = Object.values(ofi).flat();
  res.oficio = {
    porPerfil: perfiles.map(k => ({ k, l: PERFILES[k].l, n:(ofi[k]||[]).length, prom: (ofi[k]||[]).length ? +(ofi[k].reduce((a,b)=>a+b,0) / ofi[k].length).toFixed(1) : null })),
    promedio: allOf.length ? +(allOf.reduce((a,b)=>a+b,0) / allOf.length).toFixed(1) : null, n: allOf.length
  };

  // 4. Costo por técnico habilitado
  const costos = (gestion && gestion.costos) || {};
  const faltan = [];
  const hm = params.horasModulo || {}, hv = params.horasValidacion || {};
  const llegan3 = tecnicos.filter(p => p.fechasNivel && p.fechasNivel[3] && inP(p.fechasNivel[3]));
  /* Numerador y denominador usan la misma cohorte: quienes llegaron a nivel 3 dentro del período.
     Se suma lo que costó habilitar a esas personas (su plan completo y sus validaciones hasta el nivel 3). */
  let horasForm = 0, horasVal = 0, extCount = 0, faltaHm = false, faltaHv = false;
  const todosHab = tecnicos.filter(p => p.fechasNivel && p.fechasNivel[3]).length;
  for(const p of llegan3){
    const plan = planPersonal(p, params);
    if(plan.horas === null) faltaHm = true; else horasForm += plan.horas;
    for(const h of Object.values(p.historial || {})){
      if(h.fecha && p.fechasNivel[3] && h.fecha > p.fechasNivel[3]) continue; // lo posterior a habilitarse no es costo de habilitación
      const v = Number(hv[h.tipo]); if(hv[h.tipo] === null || hv[h.tipo] === undefined || hv[h.tipo] === '' || !isFinite(v)) faltaHv = true; else horasVal += v;
      if(h.externa) extCount++;
    }
  }
  const isNum = x => x !== null && x !== undefined && x !== '' && isFinite(Number(x));
  if(faltaHm) faltan.push('Horas de cada módulo');
  if(faltaHv) faltan.push('Horas de cada validación');
  if(!isNum(costos.horaFormacion)) faltan.push('Costo por hora de formación');
  if(!isNum(costos.horaValidacionInterna)) faltan.push('Costo por hora de validación interna');
  if(!isNum(costos.validacionExterna)) faltan.push('Costo de cada validación externa');
  let total = null;
  if(!faltan.length){
    const otros = isNum(costos.otros) && todosHab ? Number(costos.otros) * (llegan3.length / todosHab) : 0; // se reparte en proporción a la cohorte
    total = horasForm * Number(costos.horaFormacion) + horasVal * Number(costos.horaValidacionInterna) + extCount * Number(costos.validacionExterna) + otros;
  }
  res.costo = { faltan, total, llegan3: llegan3.length, valor: (total !== null && llegan3.length) ? Math.round(total / llegan3.length) : null, horasForm, horasVal, extCount };

  // 5. Técnicos por nivel y duos válidos
  const act = activos(personas);
  const porNivel = [0,1,2,3,4].map(n => ({ n, l: n === 0 ? 'En formación' : 'Nivel ' + n, v: act.filter(p => (p.nivel || 0) === n).length }));
  const dAct = duos.filter(d => d.activo);
  const validos = dAct.filter(d => estadoDuo(d, P, personas, hoy, params).valido).length;
  res.dotacion = { porNivel, total: act.length, duos: { validos, total: dAct.length } };

  // 6. Incidentes por cada 100 instalaciones
  const inc = registros.filter(r => r.tipo === 'incidente' && inP(r.fecha));
  const inst = Object.values((gestion && gestion.instalaciones) || {}).filter(x => inP(x.hasta || x.desde)).reduce((a, x) => a + (Number(x.cantidad) || 0), 0);
  res.incidentes = { n: inc.length, graves: inc.filter(r => r.grave).length, instalaciones: inst, tasa: inst > 0 ? +(100 * inc.length / inst).toFixed(1) : null };

  // 7. Fallas atribuibles a la instalación, por técnico
  const gar = registros.filter(r => r.tipo === 'garantia' && inP(r.fecha));
  const porTec = {};
  for(const g of gar.filter(r => r.atribuible)) for(const pid of (g.pids || [])) porTec[pid] = (porTec[pid] || 0) + 1;
  res.fallas = { total: gar.filter(r => r.atribuible).length, casos: gar.length, porTecnico: tecnicos.map(p => ({ id:p.id, l:p.nombre, v: porTec[p.id] || 0 })).sort((a,b) => b.v - a.v || byCode(a.l, b.l)) };

  // 8. Rotación de técnicos habilitados (nivel 3 o 4)
  const hab = personas.filter(p => (p.etapa === 'tecnico' && (p.nivel || 0) >= 3) || (p.etapa === 'salio' && p.salida && (p.salida.nivel || 0) >= 3));
  const salidos = hab.filter(p => p.etapa === 'salio' && inP(p.salida.fecha));
  res.rotacion = { salidos: salidos.length, total: hab.length, pct: hab.length ? Math.round(100 * salidos.length / hab.length) : null };

  return res;
}

/* ---------- reglas que también validan las acciones (no solo la interfaz) ---------- */
function numParam(v, def){ if(v === null || v === undefined || v === '') return def; const n = Number(v); return isFinite(n) ? n : def; }
/* D13: 0 meses es un valor válido (rotación libre desde el primer día) */
function rotacionMeses(params){ return numParam(params && params.rotacionMinMeses, PARAMS_DEF.rotacionMinMeses); }
function separacionAnticipada(duo, params, hoy){
  const libre = addMonths(duo.desde, rotacionMeses(params));
  const anticipado = !!libre && diffDays(hoy || hoyISO(), libre) > 0;
  return { anticipado, libreDesde: libre };
}
/* D13: la rotación se pide por escrito al Responsable Técnico, explicando por qué, y solo desde el plazo mínimo */
const MIN_MOTIVO_ROTACION = 20;
function puedePedirRotacion(duoDesde, params, hoy){
  if(!duoDesde) return { ok:false, motivo:'Necesitas estar en un duo activo para pedir rotación' };
  const libre = addMonths(duoDesde, rotacionMeses(params));
  if(libre && diffDays(hoy || hoyISO(), libre) > 0) return { ok:false, libreDesde: libre, motivo:'Puedes pedir rotación desde el ' + fechaLarga(libre) + ' (' + rotacionMeses(params) + ' meses en el duo)' };
  return { ok:true, libreDesde: libre };
}
function motivoRotacionValido(m){ return typeof m === 'string' && m.trim().length >= MIN_MOTIVO_ROTACION; }
/* D8: para programar una validación de nivel sin práctica completa se exige un motivo escrito */
function requisitoD8(persona, tipo, params, avance){
  if(!/^N[1-4]$/.test(tipo)) return { aplica:false, listo:true, faltan:[] };
  if(!persona.uid) return { aplica:true, verificable:false, listo:null, faltan:[] };
  const r = listoParaPresentarse(Number(tipo.slice(1)), planPersonal(persona, params), avance);
  return { aplica:true, verificable:true, listo:r.listo, faltan:r.faltan, total:r.total };
}
function motivoValido(m){ return typeof m === 'string' && m.trim().length >= 5; }

/* ---------- práctica: orden aleatorio reproducible ---------- */
function semillaDe(str){ let h = 2166136261; for(const ch of String(str)){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function barajar(arr, seed){ const a = arr.slice(); const r = rng(seed); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* Arma un intento: elige n preguntas del banco y mezcla las alternativas de cada una.
   Devuelve índices, así la respuesta correcta nunca depende de su posición en el dato. */
function armarIntento(banco, n, seed){
  const idx = barajar(banco.map((_, i) => i), seed).slice(0, Math.min(n || banco.length, banco.length));
  return idx.map((qi, k) => ({ qi, orden: barajar(banco[qi].o.map((_, j) => j), seed + 7919 * (k + 1)) }));
}

/* ---------- módulos: contenido efectivo y navegación ---------- */
function contenidoModulo(mid, overlay){
  const base = CONTENIDO[mid] || null;
  const o = overlay && overlay[mid];
  if(!o) return base;
  return Object.assign({}, base || {}, o);
}
function vecinosModulo(mid, plan, nivelPersona){
  const orden = MODULOS.filter(m => plan.modulos.includes(m.id) || m.id === mid);
  const i = orden.findIndex(m => m.id === mid);
  const ok = m => m && moduloDesbloqueado(m, { nivel: nivelPersona || 0 });
  let prev = null, next = null;
  for(let k = i - 1; k >= 0; k--) if(ok(orden[k])){ prev = orden[k]; break; }
  for(let k = i + 1; k < orden.length; k++) if(ok(orden[k])){ next = orden[k]; break; }
  const linea = orden.filter(m => m.nivel === (MOD[mid] || {}).nivel);
  return { prev, next, pos: linea.findIndex(m => m.id === mid) + 1, de: linea.length };
}

/* ---------- bono por avance según presupuesto (D11) ----------
   presupuesto: monto total disponible para bonos en el horizonte.
   esperados: cuántas personas se espera que validen cada nivel en ese horizonte.
   pesos: cuánto vale cada nivel respecto de los otros.
   Monto(n) = presupuesto × peso(n) / Σ(peso × esperados). Redondea hacia abajo a 'paso'. */
function calcularBonos(o){
  const pres = Number(o && o.presupuesto);
  const out = { montos:{1:null,2:null,3:null,4:null}, comprometido:0, sobra:0, error:null };
  if(!(pres > 0)){ out.error = 'Ingresa el presupuesto'; return out; }
  const paso = Number(o.paso) > 0 ? Number(o.paso) : 1000;
  let den = 0;
  for(const n of [1,2,3,4]){ const e = Math.max(0, Number((o.esperados || {})[n]) || 0), w = Math.max(0, Number((o.pesos || {})[n]) || 0); den += e * w; }
  if(!(den > 0)){ out.error = 'Indica cuántas personas esperas que validen al menos un nivel'; return out; }
  for(const n of [1,2,3,4]){
    const w = Math.max(0, Number((o.pesos || {})[n]) || 0);
    out.montos[n] = Math.floor((pres * w / den) / paso) * paso;
    out.comprometido += out.montos[n] * Math.max(0, Number((o.esperados || {})[n]) || 0);
  }
  out.sobra = pres - out.comprometido;
  return out;
}
/* personas que hoy podrían validar cada nivel (punto de partida para 'esperados') */
function candidatosPorNivel(personas){
  const out = {1:0,2:0,3:0,4:0};
  for(const p of personas){ if(p.etapa === 'postulante') out[1]++; else if(p.etapa === 'tecnico'){ const n = (p.nivel || 0) + 1; if(n <= 4) out[n]++; } }
  return out;
}

/* ---------- consistencia: detecta estados a medio escribir ----------
   La base no tiene transacciones; si una acción de varios pasos se corta,
   esto encuentra lo que quedó inconsistente y propone la reparación. */
function revisarConsistencia(c){
  const { personas, duos, sesiones, agenda, expedientes, params, hoy } = c;
  const P = Object.fromEntries(personas.map(p => [p.id, p]));
  const out = [];
  for(const d of duos.filter(x => x.activo)){
    for(const pid of [d.a, d.b]){
      const p = P[pid];
      if(!p) out.push({ id:'duo-huerfano-' + d.id, t:'Duo activo con un integrante que ya no existe', ref:d.id, fix:{ tipo:'cerrarDuo', did:d.id } });
      else if(p.etapa !== 'tecnico') out.push({ id:'duo-salio-' + d.id, t:'Duo activo con ' + p.nombre + ', que ya no es técnico activo', ref:d.id, fix:{ tipo:'cerrarDuo', did:d.id } });
    }
  }
  const vistos = {};
  for(const d of duos.filter(x => x.activo)) for(const pid of [d.a, d.b]){ if(vistos[pid]) out.push({ id:'duo-doble-' + pid, t:((P[pid] || {}).nombre || pid) + ' aparece en dos duos activos', ref:pid, fix:null }); vistos[pid] = true; }
  for(const s of sesiones){
    if(s.estado === 'cerrada' && s.tipo !== 'JT'){
      const p = P[s.pid];
      if(p && !Object.values(p.historial || {}).some(h => h.sid === s.id)) out.push({ id:'ses-sin-hist-' + s.id, t:'Validación cerrada sin registro en el historial de ' + p.nombre, ref:s.id, fix:{ tipo:'reabrirSesion', sid:s.id } });
    }
    if(s.estado !== 'abierta'){
      for(const uid of Object.keys(agenda || {})){ const a = agenda[uid] && agenda[uid].sesiones && agenda[uid].sesiones[s.id]; if(a && a.estado === 'pendiente') out.push({ id:'ag-' + uid + s.id, t:'Agenda de formador con una validación que ya no está abierta', ref:s.id, fix:{ tipo:'agenda', uid, sid:s.id, estado: s.estado === 'cerrada' ? 'cerrada' : 'anulada' } }); }
    } else {
      for(const uid of Object.keys(agenda || {})){
        const a = agenda[uid] && agenda[uid].sesiones && agenda[uid].sesiones[s.id];
        if(a && a.estado === 'pendiente'){ const tiene = Object.values(s.items || {}).some(it => it.asig === uid && !it.r); if(!tiene) out.push({ id:'ag-viejo-' + uid + s.id, t:'Agenda con una asignación que ya cambió', ref:s.id, fix:{ tipo:'agenda', uid, sid:s.id, estado:'reasignado' } }); }
      }
    }
  }
  if(expedientes){
    for(const p of personas){
      if(!p.uid) continue;
      const pr = proyectarExpediente(p, c);
      const cur = expedientes[p.uid];
      if(!cur || stableJSON(cur) !== stableJSON(pr)) out.push({ id:'exp-' + p.id, t:'Expediente de ' + p.nombre + ' desactualizado', ref:p.id, fix:{ tipo:'sync', pid:p.id } });
    }
  }
  return out;
}
function stableJSON(o){
  if(Array.isArray(o)) return '[' + o.map(stableJSON).join(',') + ']';
  if(o && typeof o === 'object') return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + stableJSON(o[k])).join(',') + '}';
  return JSON.stringify(o === undefined ? null : o);
}

/* ---------- proyección del expediente que ve el técnico ---------- */
function proyectarExpediente(persona, ctx){
  const { params, duos, P, hoy } = ctx;
  const plan = planPersonal(persona, params);
  const comp = companero(persona.id, duos);
  const d = duoActivoDe(persona.id, duos);
  const pauta = {};
  for(const c of Object.keys(persona.pauta || {})){ const x = persona.pauta[c]; pauta[c] = { r:x.r, t:x.t || null }; }
  const hist = Object.values(persona.historial || {}).map(h => ({ tipo:h.tipo, intento:h.intento, fecha:h.fecha, aprobado:!!h.aprobado, fallidas:(h.fallidas || []).slice() })).sort((a, b) => byCode(a.fecha || '', b.fecha || ''));
  return {
    v: 1,
    nombre: persona.nombre,
    etapa: persona.etapa,
    perfil: persona.perfil,
    nivel: persona.nivel || 0,
    ingreso: persona.ingreso || null,
    fechasNivel: Object.assign({}, persona.fechasNivel || {}),
    plan: { nivelacion: plan.nivelacion, saltadas: plan.saltadas, cursar: plan.cursar, modulos: plan.modulos, total: plan.total },
    pauta,
    historial: hist,
    repetir: repetir(persona),
    suspendidoAT: !!persona.suspendidoAT,
    revalidacion: revalidacion(persona, params, hoy),
    duo: d ? { companero: (P[comp] || {}).nombre || '', companeroNivel: (P[comp] || {}).nivel || 0, desde: d.desde, rotacionLibre: addMonths(d.desde, rotacionMeses(params)) } : null,
    rotacion: persona.rotacion ? { id: persona.rotacion.id, estado: persona.rotacion.estado, respuesta: persona.rotacion.respuesta || '', fecha: persona.rotacion.fecha } : null,
    bono: bono(persona, params),
    demo: !!persona.demo
  };
}

/* ---------- formato ---------- */
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_C = ['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic'];
function fechaLarga(s){ const d = parseISO(s); return d ? d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear() : '—'; }
function fechaCorta(s){ const d = parseISO(s); return d ? d.getDate() + ' ' + MESES_C[d.getMonth()] + ' ' + d.getFullYear() : '—'; }
function fechaHora(iso){ if(!iso) return '—'; const d = new Date(iso); if(isNaN(d)) return '—'; return d.getDate() + ' ' + MESES_C[d.getMonth()] + ' ' + d.getFullYear() + ', ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
function clp(n){ if(n === null || n === undefined || !isFinite(n)) return '—'; return '$' + Math.round(n).toLocaleString('es-CL'); }
function numCL(n, dec){ if(n === null || n === undefined || !isFinite(n)) return '—'; return Number(n).toLocaleString('es-CL', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
function iniciales(nombre){ const p = String(nombre || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + ((p[1] || '')[0] || '')).toUpperCase(); }
function relDias(dias){ if(dias === null || dias === undefined) return ''; if(dias === 0) return 'hoy'; if(dias === 1) return 'mañana'; if(dias === -1) return 'ayer'; return dias > 0 ? 'en ' + dias + ' días' : 'hace ' + (-dias) + ' días'; }

if(typeof module !== 'undefined') module.exports = { fechaValida, enPeriodo, rotacionMeses, separacionAnticipada, requisitoD8, motivoValido, barajar, armarIntento, contenidoModulo, vecinosModulo, calcularBonos, candidatosPorNivel, revisarConsistencia, stableJSON, isoDate, hoyISO, parseISO, addDays, addMonths, diffDays, monthsBetween, validId, nid, reqComp, mapaPreliminar, puntajeFundamentos, nivelacionPorFundamentos, nivelacionFinal, saltadas, planPersonal, evaluadorDe, itemsValidacion, preaprobadas, evaluar, exigenciaEfectiva, minimoParaQueImporte, repetir, modulosDelNivel, listoParaPresentarse, revalidacion, estadoDuo, puedeFormarDuo, puedeValidar, bono, resumenRuta, alertas, indicadores, proyectarExpediente, companero, duoActivoDe, fechaLarga, estadoDiagnostico, recibidasSinAceptar, hayNivel3, hayNivel2, puedePedirRotacion, motivoRotacionValido };
