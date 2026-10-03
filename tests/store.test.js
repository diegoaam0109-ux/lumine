/* Pruebas unitarias de MemDB: reglas por ruta, {self}, rutas límite y capacidad.
   Ejecutar: node tests/store.test.js  (o npm test) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = man.logic.concat(['store.js']);
const code = files.map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n') + `
;(async function(){
  let fails = 0, passes = 0;
  const ok = (v, m) => { if(v) passes++; else { fails++; console.log('FALLA:', m); } };
  const db = (lvl, id) => new MemDB(DB_RULES, { level:lvl, id });
  const tec = db('interact', 'u_a'), adm = db('admin', 'u_rt'), vis = db('view', 'u_v');
  // lectura por regla
  ok(tec.can('expedientes/u_a', 'read'), 'técnico lee su expediente');
  ok(!tec.can('expedientes/u_b', 'read'), 'técnico NO lee el expediente de otro ({self})');
  ok(!tec.can('expedientes/u_a', 'write'), 'técnico NO escribe su expediente (lo proyecta administración)');
  ok(tec.can('avance/u_a', 'write'), 'técnico escribe su avance');
  ok(!tec.can('avance/u_b', 'write'), 'técnico NO escribe el avance de otro');
  ok(!tec.can('personas/p1', 'read'), 'técnico NO lee personas');
  ok(!tec.can('sesiones/s1', 'read'), 'técnico NO lee sesiones');
  ok(tec.can('config/parametros', 'read'), 'técnico lee parámetros');
  ok(tec.can('config/contenido', 'read'), 'técnico lee el contenido editable');
  ok(!tec.can('config/contenido', 'write'), 'técnico NO edita contenido');
  ok(!tec.can('agenda/u_a', 'write'), 'formador NO escribe su agenda (la publica administración)');
  ok(tec.can('marcas/u_a', 'write'), 'formador escribe sus marcas');
  ok(!tec.can('marcas/u_b', 'read'), 'formador NO lee marcas ajenas');
  ok(adm.can('personas/p1', 'write') && adm.can('expedientes/u_a', 'write'), 'administración escribe todo lo de gestión');
  ok(!vis.can('avance/u_v', 'write'), 'un Viewer no escribe ni su propio avance');
  // rutas límite
  ok(!tec.can('ajustes/gestion', 'read'), 'técnico NO lee costos ni equipo');
  let tiro = false; try { tec.doc('expedientes'); } catch(e){ tiro = e instanceof TypeError; } ok(tiro, 'un documento con segmentos impares se rechaza');
  tiro = false; try { tec.doc('a/../b'); } catch(e){ tiro = true; } ok(tiro, 'segmentos ".." se rechazan');
  // escritura y snapshot congelado
  await adm.doc('personas/p1').set({ nombre:'X', n:{ a:1 } });
  const s = await adm.doc('personas/p1').get();
  ok(Object.isFrozen(s.data()) && Object.isFrozen(s.data().n), 'los snapshots llegan congelados');
  await adm.doc('personas/p1').update({ n:{ b:2 } });
  ok(JSON.stringify((await adm.doc('personas/p1').get()).data().n) === '{"a":1,"b":2}', 'update mezcla mapas anidados');
  await adm.doc('personas/p1').update({ n:{ a:null } });
  ok((await adm.doc('personas/p1').get()).data().n.a === null, 'null reemplaza el campo');
  // capacidad igual a la plataforma
  const big = db('owner', 'u_rt'); const o = {}; for(let i = 0; i < DB_CAPACIDAD; i++) o['c/d' + i] = { i }; big.load(o);
  let q = null; try { await big.doc('c/extra').set({ x:1 }); } catch(e){ q = e.code; } ok(q === 'quota_exceeded', 'sobre ' + DB_CAPACIDAD + ' documentos rechaza crear');
  let q2 = 'ok'; try { await big.doc('c/d1').set({ x:2 }); } catch(e){ q2 = e.code; } ok(q2 === 'ok', 'en el tope todavía se actualizan documentos existentes');
  let big2 = null; try { await adm.doc('x/y').set({ s:'a'.repeat(270000) }); } catch(e){ big2 = e.code; } ok(big2 === 'invalid_argument', 'documento sobre 256 KiB se rechaza');
  console.log('\\n' + passes + ' correctas, ' + fails + ' fallas');
  if(fails) process.exit(1);
})();`;
vm.runInNewContext(code, { console, process, setTimeout }, { filename:'store.test.js' });
