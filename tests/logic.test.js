/* Pruebas de reglas de Lumine Habilita.
   Se ejecutan solas:  node tests/logic.test.js   (o npm test)
   Cargan data*.js y logic.js según manifest.json en un contexto aislado. */
'use strict';
function correrPruebas(){
let fails = 0, passes = 0;
function eq(a, b, m){ const A = JSON.stringify(a), B = JSON.stringify(b); if(A !== B){ fails++; console.log('FALLA:', m, '\n obtenido:', A, '\n esperado:',
B); } else passes++; }
function ok(v, m){ if(!v){ fails++; console.log('FALLA:', m); } else passes++;
}
// --- conteos del informe 3 ---
const cnt = (f) => COMP.filter(f).length;
eq(COMP.length, 39, '39 competencias');
eq(new Set(COMP.map(x=>x.c)).size, 39, 'códigos únicos');
eq([1,2,3,4].map(n => cnt(x => x.n === n)), [7,23,8,1], 'competencias por nivel');
eq([1,2,3,4].map(n => [cnt(x=>x.n===n&&x.p==='core'), cnt(x=>x.n===n&&x.p==='oficio'), cnt(x=>x.n===n&&x.p==='desarrollo')]), [[4,2,1],[9,9,5],[0,0,8],[0,0,1]], 'matriz nivel x prioridad'); eq([cnt(x=>x.p==='core'), cnt(x=>x.p==='oficio'), cnt(x=>x.p==='desarrollo')], [13,11,15], 'totales por prioridad');
eq(cnt(x => x.v === 'ext'), 12, '12 competencias de validación externa'); eq(cnt(x => x.e === 'presencial'), 28, '28 presenciales (informe 2)');
eq(cnt(x => x.e === 'online'), 7, '7 online');
eq(cnt(x => x.e === 'trabajo'), 4, '4 en el trabajo');
eq([cnt(x=>x.m==='si'), cnt(x=>x.m==='parcial'), cnt(x=>x.m==='no')],
[4,11,24], 'mercado 4/11/24');
eq(CURSOS_CORE.flatMap(c=>c.codigos).sort(),COMP.filter(x=>x.p==='core').map(x=>x.c).sort(), 'cursos core cubren los 13'); eq(CORE_SEG.slice().sort(), ['C01','C02','C05','C20','C23','C24','C35'], 'core de seguridad');
eq(ESTACIONES.slice().sort(),
COMP.filter(x=>x.p==='oficio').map(x=>x.c).sort(), 'estaciones = 11 de oficio');
eq(ESTACIONES_EXT.slice().sort(),COMP.filter(x=>x.p==='oficio'&&x.v==='ext').map(x=>x.c).sort(), 'estaciones externas');
// módulos del nivel 2 cubren las 22 competencias de nivel 2 menos C36 (transversal)
const n2mods = MODULOS.filter(m=>m.nivel===2).flatMap(m=>m.cod).sort(); eq(n2mods, COMP.filter(x=>x.n===2 && x.c!=='C36').map(x=>x.c).sort(), 'módulos N2 = 22 competencias + C36 transversal'); eq(MODULOS.filter(m=>m.nivel===1).flatMap(m=>m.cod).sort(),COMP.filter(x=>x.n===1).map(x=>x.c).sort(), 'módulos N1 cubren nivel 1'); eq(MODULOS.filter(m=>m.nivel===3).flatMap(m=>m.cod).sort(),COMP.filter(x=>x.n===3).map(x=>x.c).sort(), 'módulo N3 cubre nivel 3'); eq(Object.keys(TAREAS).length, 35, '35 tareas');
ok(COMP.every(x => x.ta.every(t => TAREAS[t])), 'toda competencia remite a tareas existentes');
eq(DECISIONES.length, 19, '19 decisiones');
eq(DECISIONES.find(d => d[0] === 'D18')[3], 'Cerrada', 'D18 firma por nivel cerrada');
ok(!PENDIENTES.some(x => /firma por nivel/i.test(x)), 'D18 ya no figura en pendientes');
eq(SEGURIDAD.length, 20, '20 controles'); eq(FUNDAMENTOS.filter(q=>q.area==='electrica').length, 3, '3 preguntas eléctricas');

// --- diagnóstico con los perfiles del informe 4 ---
const mec = { perfil:'mecanico', antecedentes:{ perfil:'mecanico', certificados:{}, experiencias:{} } };
eq(mapaPreliminar(mec.antecedentes),['C04','C08','C09','C12','C13','C17','C27'], 'mapa mecánico: hasta 7');
const ele = { perfil:'electricista', certificados:{ sec:true }, experiencias:{} };
eq(mapaPreliminar(ele), ['C03','C04','C16','C19','C21'], 'mapa electricista: hasta 5');
eq(mapaPreliminar({ perfil:'electromovilidad', certificados:{}, experiencias:{ C03:true, C09:true } }), ['C03','C09'], 'mapa por experiencias');

// fundamentos solo agregan
// Respuestas por acierto, no por letra: la posición de la correcta varía entre preguntas
const BIEN = id => FUNDAMENTOS.find(f => f.id === id).a, MAL = id => (BIEN(id) + 1) % 4;
const respMec = { E1:MAL('E1'), E2:BIEN('E2'), E3:MAL('E3'), M1:BIEN('M1'), M2:BIEN('M2'), M3:BIEN('M3'), X1:MAL('X1'), X2:MAL('X2'), X3:BIEN('X3') }; // eléctrica 1/3, mecánica 3/3, electrónica 1/3
eq(nivelacionPorFundamentos({ respuestas: respMec, fecha:'2026-01-01' }, 2), ['electrica','electronica'], 'nivelación mecánico');
const pMec = { id:'p', perfil:'mecanico', etapa:'postulante', fundamentos:{ respuestas:respMec, fecha:'2026-01-01' }, jornada:{ fecha:'2026-01-05', basico: { electrica:'nivelar', mecanica:'ok', electronica:'ok' }, estaciones:{ C04:'n', C08:'s', C09:'s', C12:'n', C13:'s', C17:'s', C27:'s' } } };
const plan = planPersonal(pMec, PARAMS_DEF);
eq(plan.nivelacion, ['NIV-E','NIV-X'], 'plan: nivelación union'); eq(plan.saltadas, ['C08','C09','C13','C17','C27'], 'plan: 5 saltadas'); eq(plan.total, 34, 'plan: 39 - 5 = 34 por cursar');
eq(plan.core.length, 13, 'core completo siempre'); ok(plan.modulos.includes('NIV-E') && !plan.modulos.includes('NIV-M'), 'módulos de nivelación según plan');
eq(plan.horas, null, 'sin horas definidas: null');
const plan2 = planPersonal(pMec, Object.assign({}, PARAMS_DEF, { horasModulo: Object.fromEntries(MODULOS.map(m=>[m.id, 2])) }));
eq(plan2.horas, plan2.modulos.length * 2, 'horas con parámetros');
// jornada no puede saltar core ni desarrollo
const trampa = { perfil:'otro', jornada:{ fecha:'2026-01-01', estaciones:{ C01:'s', C14:'s', C36:'s', C19:'s' } } };
eq(saltadas(trampa), ['C19'], 'solo oficio se salta');

// --- evaluación y umbrales ---
eq(reqComp(5, 85), 5, '85% de 5 = 5');
eq(reqComp(7, 85), 6, '85% de 7 = 6');
eq(reqComp(20, 85), 17, '85% de 20 = 17');
eq(minimoParaQueImporte(85), 7, 'el 85% recién importa con 7 ítems'); eq(exigenciaEfectiva(85).map(x => [x.total, x.req]), [[0,0],[5,5],[5,5],[1,1]], 'exigencia efectiva por nivel');
const it = (arr) => arr.map(([c, r]) => ({ c, r })); ok(evaluar(it([['C19','s'],['C09','s']])).aprobado, 'aprueba todo sabe'); ok(!evaluar(it([['C19','n'],['C09','s']])).aprobado, 'seguridad no sabe reprueba');
eq(evaluar(it([['C19','n'],['C09','n']])).fallidas, ['C09','C19'], 'fallidas'); ok(!evaluar(it([['C19','s'],['C09',null]])).completo, 'incompleto'); ok(evaluar(it([['C19','j'],['C09','s']])).aprobado, 'demostrada en jornada cuenta como sabe');

// --- ítems de validación ---
const tec = { id:'t1', perfil:'mecanico', etapa:'tecnico', nivel:1, jornada: pMec.jornada, pauta:{ C19:{ r:'n' }, C24:{ r:'s' } } };
const n2 = itemsValidacion('N2', tec);
ok(!n2.includes('C08') && !n2.includes('C24') && n2.includes('C19') && n2.includes('C36'), 'N2 excluye saltadas y aprobadas');
eq(evaluadorDe('C25'), 'ic', 'C25 IC'); eq(evaluadorDe('C19'), 'ext', 'C19 externa'); eq(evaluadorDe('C24'), 'int', 'C24 interna'); eq(itemsValidacion('REV', { nivel:1 }).sort(), ['C01','C02','C05','C35'], 'REV nivel 1');
eq(itemsValidacion('REV', { nivel:3 }).sort(), ['C01','C02','C05','C20','C23','C24','C35'], 'REV nivel 3');
eq(repetir(tec), ['C19'], 'repetir solo lo reprobado');


// --- revalidación ---
const tr = { etapa:'tecnico', nivel:2, pauta:{ C01:{r:'s',t:'2025-10-01'}, C02: {r:'s',t:'2025-10-01'}, C05:{r:'s',t:'2025-10-01'}, C35:{r:'s',t:'2025-10-01'}, C20:{r:'s',t:'2026-03-01'} } };
const rv = revalidacion(tr, { revalidacionMeses:12 }, '2026-09-20'); eq([rv.vence, rv.estado], ['2026-10-01','pronto'], 'revalidación pronto'); eq(revalidacion(tr, { revalidacionMeses:12 }, '2026-10-05').estado, 'vencida', 'revalidación vencida');
eq(addMonths('2026-01-31', 1), '2026-02-28', 'suma de meses con fin de mes');

// --- duos ---
const ps = [
  { id:'a', nombre:'A', etapa:'tecnico', nivel:3 }, { id:'b', nombre:'B', etapa:'tecnico', nivel:2 },
  { id:'c', nombre:'C', etapa:'tecnico', nivel:2 }, { id:'d', nombre:'D', etapa:'tecnico', nivel:1 }, { id:'e', nombre:'E', etapa:'tecnico', nivel:0 }
];
const P = Object.fromEntries(ps.map(p=>[p.id,p])); ok(puedeFormarDuo('a','b',P,[],ps).ok, 'duo con nivel 3 válido'); ok(!puedeFormarDuo('b','c',P,[],ps).ok, 'dos nivel 2 no forman duo si existe nivel 3');
ok(!puedeFormarDuo('a','e',P,[],ps).ok, 'nivel 0 no entra a duo');
const ps1 = ps.map(p => Object.assign({}, p, { nivel: Math.min(p.nivel, 2) })); const P1 = Object.fromEntries(ps1.map(p=>[p.id,p]));
const r1 = puedeFormarDuo('b','c',P1,[],ps1);
ok(r1.ok && r1.aviso, 'primera generación: permitido con supervisión del RT'); const duos = [{ id:'d1', a:'a', b:'b', desde:'2026-08-01', activo:true }]; ok(!puedeFormarDuo('a','c',P,duos,ps).ok, 'no se puede estar en dos duos'); const ed = estadoDuo(duos[0], P, ps, '2026-09-27', { rotacionMinMeses:3 }); ok(ed.valido && !ed.puedeRotar && ed.rotacionLibre === '2026-11-01', 'rotación mínima 3 meses');


// --- quién valida ---
const pv = [{ id:'a', uid:'ua', etapa:'tecnico', nivel:4 }, { id:'b', uid:'ub', etapa:'tecnico', nivel:1 }, { id:'c', uid:'uc', etapa:'tecnico', nivel:4 }]; const PV = Object.fromEntries(pv.map(p=>[p.id,p]));
const dv = [{ id:'x', a:'a', b:'b', activo:true, desde:'2026-01-01' }]; ok(!puedeValidar('ua','formador',PV.b,PV,dv,pv).ok, 'no valida a su compañero de duo');
ok(puedeValidar('uc','formador',PV.b,PV,dv,pv).ok, 'formador de otro duo sí valida');
ok(!puedeValidar('ub','formador',PV.b,PV,dv,pv).ok, 'nadie se valida a sí mismo');
ok(!puedeValidar('urt','rt',PV.b,PV,dv,pv,'C25').ok, 'C25 solo Ingeniería de Calibración');
ok(puedeValidar('uic','ic',PV.b,PV,dv,pv,'C25').ok, 'IC valida C25');


// --- indicadores básicos ---
const pi = [
  { id:'1', nombre:'U', perfil:'mecanico', etapa:'tecnico', nivel:3, ingreso:'2026-01-01', fechasNivel:{1:'2026-02-01',2:'2026-04-01',3:'2026-06-30'}, historial:{ h1:{ tipo:'N1', intento:1, fecha:'2026-02-01', aprobado:true }, h2:{ tipo:'N2', intento:1, fecha:'2026-03-20', aprobado:false }, h3:{ tipo:'N2', intento:2, fecha:'2026-04-01', aprobado:true } }, jornada:{ fecha:'2025-12-20', estaciones:{ C08:'s', C09:'s' } } },
  { id:'2', nombre:'V', perfil:'electricista', etapa:'salio', nivel:3, salida:{ fecha:'2026-08-01', nivel:3 }, ingreso:'2026-01-01', fechasNivel:{3:'2026-05-31'}, historial:{} }
];
const ind = indicadores({ personas:pi, duos:[], registros:[{ tipo:'incidente', fecha:'2026-05-01' }, { tipo:'garantia', fecha:'2026-06-01', atribuible:true, pids:['1'] }], params:PARAMS_DEF, gestion:{ costos:{}, instalaciones:{ a:{ desde:'2026-01-01', hasta:'2026-06-30', cantidad:50 } } }, hoy:'2026-09-27', desde:null });
eq(ind.autonomia.porPerfil.find(x=>x.k==='mecanico').dias, 180, 'autonomía mecánico 180 días');
eq(ind.primer.porTipo.find(x=>x.k==='N2').pct, 0, 'N2 primer intento 0%'); eq(ind.primer.porTipo.find(x=>x.k==='N1').pct, 100, 'N1 primer intento 100%'); eq(ind.incidentes.tasa, 2, '1 incidente en 50 instalaciones = 2 por 100'); eq(ind.rotacion.pct, 50, 'rotación 1 de 2');
eq(ind.fallas.total, 1, 'una falla atribuible');
ok(ind.costo.faltan.length > 0 && ind.costo.valor === null, 'costo sin datos no inventa');


// ===== Correcciones de la revisión (ChatGPT, DeepSeek, Gemini y Diego) =====
// fechas estrictas
eq(parseISO('2026-02-31'), null, 'parseISO rechaza 31 de febrero');
eq(parseISO('2026-13-01'), null, 'parseISO rechaza mes 13');
ok(parseISO('2028-02-29') !== null, 'parseISO acepta 29 de febrero bisiesto');
eq(fechaValida('2026-02-30'), false, 'fechaValida rechaza 30 de febrero');
eq(fechaValida('2026-03-01'), true, 'fechaValida acepta fecha real');
// período cerrado en ambos extremos
eq(enPeriodo('2026-05-01', '2026-01-01', '2026-06-30'), true, 'enPeriodo dentro');
eq(enPeriodo('2027-01-01', '2026-01-01', '2026-06-30'), false, 'enPeriodo excluye fecha futura');
eq(enPeriodo('2025-12-31', '2026-01-01', '2026-06-30'), false, 'enPeriodo excluye antes del inicio');
eq(enPeriodo(null, null, null), false, 'enPeriodo: fecha vacía no entra');
// rotación 0 meses es válida
eq(rotacionMeses({ rotacionMinMeses:0 }), 0, 'rotación 0 meses se respeta');
eq(rotacionMeses({}), PARAMS_DEF.rotacionMinMeses, 'rotación sin dato usa el valor por defecto');
const dRot = { id:'d', a:'x', b:'y', desde:'2026-01-10', activo:true };
eq(separacionAnticipada(dRot, { rotacionMinMeses:0 }, '2026-01-10').anticipado, false, 'D13 con 0 meses: nunca anticipado');
eq(separacionAnticipada(dRot, { rotacionMinMeses:3 }, '2026-03-01').anticipado, true, 'D13: antes de 3 meses es anticipado');
eq(separacionAnticipada(dRot, { rotacionMinMeses:3 }, '2026-04-10').anticipado, false, 'D13: al cumplir 3 meses ya no');
const PA = { personas:[ { id:'a', nombre:'A', etapa:'tecnico', nivel:3 }, { id:'b', nombre:'B', etapa:'tecnico', nivel:3 } ] };
const eD = estadoDuo(dRot, { x:{ nivel:3, nombre:'X' }, y:{ nivel:3, nombre:'Y' } }, [], '2026-01-10', { rotacionMinMeses:0 });
eq(eD.puedeRotar, true, 'estadoDuo respeta 0 meses (antes caía a 3)');
// D8 en la regla, no solo en la pantalla
const pD8 = Object.assign({}, pMec, { id:'p8', uid:'u8', etapa:'tecnico', nivel:0 });
const r8 = requisitoD8(pD8, 'N1', PARAMS_DEF, null);
eq([r8.aplica, r8.listo], [true, false], 'D8: sin práctica no está listo');
eq(requisitoD8(pD8, 'JT', PARAMS_DEF, null).aplica, false, 'D8 no aplica a la jornada técnica');
eq(requisitoD8(Object.assign({}, pD8, { uid:null }), 'N1', PARAMS_DEF, null).listo, null, 'D8 sin cuenta vinculada: no verificable');
const av8 = { modulos: Object.fromEntries(modulosDelNivel(1, planPersonal(pD8, PARAMS_DEF)).map(id => [id, { aprobado:true }])) };
eq(requisitoD8(pD8, 'N1', PARAMS_DEF, av8).listo, true, 'D8: con la práctica del nivel completa está listo');
eq([motivoValido('abc'), motivoValido('  seguridad  ')], [false, true], 'motivo mínimo de 5 caracteres');
// práctica: orden aleatorio reproducible y sin patrón
const banco = CONTENIDO['N1-1'].practica;
const i1 = armarIntento(banco, 5, 123), i2 = armarIntento(banco, 5, 123), i3 = armarIntento(banco, 5, 999);
eq(i1, i2, 'misma semilla, mismo intento');
ok(JSON.stringify(i1) !== JSON.stringify(i3), 'otra semilla, otro intento');
eq(i1.length, 5, 'toma 5 preguntas del banco');
eq(new Set(i1.map(x => x.qi)).size, 5, 'sin preguntas repetidas en un intento');
ok(i1.every(x => x.orden.slice().sort().join() === banco[x.qi].o.map((_, j) => j).join()), 'cada intento conserva todas las alternativas');
const posCorrecta = {}; for(let s = 1; s <= 400; s++) for(const x of armarIntento(banco, 5, s)) { const p = x.orden.indexOf(banco[x.qi].a); posCorrecta[p] = (posCorrecta[p] || 0) + 1; }
ok([0,1,2,3].every(p => posCorrecta[p] > 350), 'la respuesta correcta cae en las cuatro posiciones (sin patrón A/B)');
// contenido: los 13 módulos tienen cápsulas y banco válido
ok(MODULOS.every(m => CONTENIDO[m.id] && CONTENIDO[m.id].capsulas.length >= 2), 'todos los módulos tienen contenido');
ok(MODULOS.every(m => CONTENIDO[m.id].practica.length >= (CONTENIDO[m.id].mostrar || 1)), 'cada banco alcanza para un intento');
ok(Object.values(CONTENIDO).every(c => c.practica.every(q => q.a >= 0 && q.a < q.o.length && (!q.c || C[q.c]))), 'respuestas y competencias del banco son válidas');
ok(MODULOS.every(m => CONTENIDO[m.id].practica.every(q => !q.c || m.cod.includes(q.c) || m.nivel === 0)), 'las preguntas evalúan competencias de su propio módulo');
eq(contenidoModulo('N1-2', { 'N1-2': { capsulas:[{ t:'X', puntos:['y'] }] } }).capsulas.length, 1, 'el contenido editado reemplaza al del código');
eq(contenidoModulo('N1-2', { 'N1-2': { capsulas:[{ t:'X', puntos:['y'] }] } }).escenarios.length, CONTENIDO['N1-2'].escenarios.length, 'los escenarios del código se conservan');
// navegación entre módulos
const pl = { modulos:['NIV-E','N1-1','N1-2','N1-3','N2-1','N2-2'] };
eq([vecinosModulo('N1-2', pl, 0).prev.id, vecinosModulo('N1-2', pl, 0).next.id], ['N1-1','N1-3'], 'anterior y siguiente en la misma línea');
eq(vecinosModulo('N1-3', pl, 0).next, null, 'no ofrece un módulo bloqueado');
eq(vecinosModulo('N1-3', pl, 1).next.id, 'N2-1', 'con nivel 1 validado, sigue al nivel 2');
eq([vecinosModulo('N1-2', pl, 0).pos, vecinosModulo('N1-2', pl, 0).de], [2, 3], 'posición dentro del nivel');
// bonos según presupuesto
const bo = calcularBonos({ presupuesto: 1000000, esperados:{1:4,2:3,3:2,4:1}, pesos:{1:1,2:2,3:3,4:4}, paso:1000 });
eq(bo.montos, {1:50000, 2:100000, 3:150000, 4:200000}, 'bonos proporcionales al peso');
eq(bo.comprometido, 1000000, 'el presupuesto se compromete completo cuando divide exacto');
ok(calcularBonos({ presupuesto: 999999, esperados:{1:3}, pesos:{1:1} }).comprometido <= 999999, 'el redondeo nunca pasa el presupuesto');
ok(calcularBonos({ presupuesto: 0, esperados:{1:3}, pesos:{1:1} }).error, 'sin presupuesto avisa');
ok(calcularBonos({ presupuesto: 100, esperados:{}, pesos:{1:1} }).error, 'sin personas esperadas avisa');
eq(candidatosPorNivel([{ etapa:'postulante' }, { etapa:'tecnico', nivel:0 }, { etapa:'tecnico', nivel:3 }, { etapa:'tecnico', nivel:4 }, { etapa:'salio', nivel:2 }]), {1:2,2:0,3:0,4:1}, 'candidatos por nivel');
// costo por técnico habilitado: misma cohorte arriba y abajo
const hmTodo = Object.fromEntries(MODULOS.map(m => [m.id, 10]));
const parC = Object.assign({}, PARAMS_DEF, { horasModulo: hmTodo, horasValidacion: { JT:2, N1:2, N2:2, N3:2, N4:2, REV:2 } });
const ges = { costos:{ horaFormacion:100, horaValidacionInterna:50, validacionExterna:1000, otros:0 } };
const tA = { id:'ta', nombre:'TA', perfil:'mecanico', etapa:'tecnico', nivel:3, ingreso:'2024-01-01', fechasNivel:{3:'2024-06-01'}, pauta:{}, historial:{ h:{ tipo:'N1', intento:1, fecha:'2024-02-01', aprobado:true } } };
const tB = Object.assign({}, tA, { id:'tb', nombre:'TB', fechasNivel:{3:'2026-09-01'}, historial:{ h:{ tipo:'N1', intento:1, fecha:'2026-03-01', aprobado:true } } });
const ix = d => indicadores({ personas:[tA, tB], duos:[], registros:[], params:parC, gestion:ges, hoy:'2026-10-01', desde:d }).costo;
const cTodo = ix(null), c6 = ix('2026-04-01');
eq([cTodo.llegan3, c6.llegan3], [2, 1], 'cohorte: 2 en total, 1 en los últimos 6 meses');
eq(c6.valor, cTodo.valor, 'cambiar el período no infla el costo por técnico (antes se duplicaba)');
ok(c6.total < cTodo.total, 'el costo total del período es solo el de su cohorte');
// consistencia
const incs = revisarConsistencia({ personas:[ Object.assign({}, tA, { etapa:'salio' }), tB ], duos:[ { id:'d1', a:'ta', b:'tb', activo:true, desde:'2026-01-01' } ], sesiones:[], agenda:{}, params:PARAMS_DEF, hoy:'2026-10-01', P:{ ta:tA, tb:tB } });
ok(incs.some(x => x.fix && x.fix.tipo === 'cerrarDuo'), 'detecta duo activo con un integrante que salió');
const sesV = { id:'s1', pid:'tb', estado:'abierta', items:{ C09:{ ev:'int', asig:'u_nuevo', r:null } } };
ok(revisarConsistencia({ personas:[tB], duos:[], sesiones:[sesV], agenda:{ u_viejo:{ sesiones:{ s1:{ estado:'pendiente' } } } }, params:PARAMS_DEF, hoy:'2026-10-01', P:{ tb:tB } }).some(x => x.fix && x.fix.estado === 'reasignado'), 'detecta agenda vieja tras reasignar');

// prueba de fundamentos: la correcta no se concentra en A o B
const posF = FUNDAMENTOS.map(q => q.a);
ok([0,1,2,3].every(k => posF.filter(x => x === k).length >= 2), 'fundamentos: la respuesta correcta está repartida en A, B, C y D');
ok(posF.filter(x => x <= 1).length <= 5, 'fundamentos: no más de 5 de 9 en A o B');
const ordF = s => FUNDAMENTOS.map((q, i) => barajar(q.o.map((_, j) => j), s + i).indexOf(q.a));
ok(JSON.stringify(ordF(11)) !== JSON.stringify(ordF(97)), 'fundamentos online: cada postulante ve otro orden de alternativas');
console.log(`\n${passes} correctas, ${fails} fallas`);
if(fails) process.exit(1);



}
if(typeof COMP !== 'undefined'){ correrPruebas(); }
else {
  const fs = require('fs'), path = require('path'), vm = require('vm');
  const root = path.join(__dirname, '..');
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const code = man.logic.map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n')
    + '\n' + fs.readFileSync(__filename, 'utf8');
  vm.runInNewContext(code, { console, process, require, __filename, __dirname }, { filename: 'logic.test.js' });
}
