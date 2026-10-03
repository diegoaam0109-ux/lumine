/* =====================================================================
   Lumine Habilita · capa de datos
   MemDB replica el contrato de la base de claude.ai (rutas, reglas por
   nivel, {self}, snapshots congelados). La demostración corre sobre ella,
   así que las mismas reglas de acceso se prueban en ambos modos.
   ===================================================================== */
'use strict';

const LEVEL = { view:0, interact:1, admin:2, owner:3 };
/* Capacidad de la base de un artifact según el contrato de claude.ai (0.2.67): 25.000 documentos,
   256 KiB por documento. La simulación usa el mismo número para que la demo avise igual que la real. */
const DB_CAPACIDAD = 25000;
const DB_AVISO = 0.8;   // desde el 80% el panel avisa
const SEG_RE = /^(?!\.\.?$)[A-Za-z0-9_\-.~:@+]{1,200}$/;

function splitPath(p){ return p === '' ? [] : String(p).split('/'); }
function checkPath(p, parity){
  const s = splitPath(p);
  if(!s.length || s.length > 16 || s.some(x => !SEG_RE.test(x))) throw new TypeError('Ruta inválida: ' + p);
  if(parity === 'doc' && s.length % 2 !== 0) throw new TypeError('Un documento necesita un número par de segmentos: ' + p);
  if(parity === 'col' && s.length % 2 !== 1) throw new TypeError('Una colección necesita un número impar de segmentos: ' + p);
  return s;
}
function deepFreeze(o){ if(o && typeof o === 'object' && !Object.isFrozen(o)){ Object.freeze(o); for(const k of Object.keys(o)) deepFreeze(o[k]); } return o; }
function clone(o){ return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
function isPlainObj(o){ return !!o && typeof o === 'object' && !Array.isArray(o); }
function deepMerge(base, patch){
  const out = isPlainObj(base) ? Object.assign({}, base) : {};
  for(const k of Object.keys(patch)){
    const v = patch[k];
    if(isPlainObj(v) && isPlainObj(out[k])) out[k] = deepMerge(out[k], v);
    else out[k] = clone(v);
  }
  return out;
}

class MemDB {
  constructor(rules, viewer){
    this.store = new Map();          // ruta -> { data, v }
    this.rules = (rules || []).map(r => ({ segs: splitPath(r.path), read: r.read, write: r.write }));
    this.viewer = viewer || { level:'owner', id:'u_local' };
    this.subs = new Set();
    this.onChange = null;            // persistencia de la demo
  }
  setViewer(v){ this.viewer = v; this._notifyAll(); }
  /* nivel mínimo para leer o escribir en una ruta, según reglas y {self} */
  _need(segs, action){
    let best = { read:'view', write:'interact' }, depth = -1, bestR = null, bestW = null, bestRd = -1, bestWd = -1;
    let privateSibling = false;
    for(const r of this.rules){
      if(r.segs.length > segs.length) continue;
      let match = true, selfRule = false;
      for(let i = 0; i < r.segs.length; i++){
        if(r.segs[i] === '{self}'){ selfRule = true; if(segs[i] !== this.viewer.id){ match = false; } }
        else if(r.segs[i] !== segs[i]){ match = false; break; }
      }
      if(!match){
        // un {self} ajeno: el prefijo debe tener regla propia; si no, es privado
        if(selfRule){
          const pre = r.segs.slice(0, -1);
          const underPrefix = pre.every((s, i) => s === segs[i]) && segs.length > pre.length;
          if(underPrefix && !this.rules.some(x => x.segs.length === pre.length && x.segs.every((s, i) => s === pre[i]))) privateSibling = true;
        }
        continue;
      }
      const d = r.segs.length;
      if(r.read && d > bestRd){ bestR = r.read; bestRd = d; }
      if(r.write && d > bestWd){ bestW = r.write; bestWd = d; }
      if(d > depth) depth = d;
    }
    if(privateSibling) return 'never';
    const lvl = action === 'read' ? (bestR || best.read) : (bestW || best.write);
    return lvl;
  }
  can(path, action){
    const segs = splitPath(path);
    const need = this._need(segs, action);
    if(need === 'never') return false;
    const have = LEVEL[this.viewer.level] ?? -1;
    if(have < 0) return false;
    if(this.viewer.level === 'owner') return true;
    return have >= LEVEL[need];
  }
  _snap(path){
    const segs = splitPath(path);
    const id = segs[segs.length - 1];
    const rec = this.store.get(path);
    const visible = rec && this.can(path, 'read');
    const data = visible ? rec.frozen : undefined;
    return { id, exists: !!visible, data: () => data, metadata: { fromCache:false, hasPendingWrites:false } };
  }
  _write(path, fn){
    if(!this.can(path, 'write')) return Promise.reject({ code:'invalid_argument', message:'Sin permiso de escritura en ' + path });
    const rec = this.store.get(path);
    let next;
    try { next = fn(rec ? clone(rec.data) : undefined); } catch(e){ return Promise.reject(e); }
    if(next === null){ this.store.delete(path); }
    else {
      if(!isPlainObj(next)) return Promise.reject({ code:'invalid_argument', message:'El cuerpo debe ser un objeto' });
      const json = JSON.stringify(next);
      if(json.length > 262144) return Promise.reject({ code:'invalid_argument', message:'Documento sobre 256 KiB' });
      if(!rec && this.store.size >= DB_CAPACIDAD) return Promise.reject({ code:'quota_exceeded', message:'La base llegó a ' + DB_CAPACIDAD.toLocaleString('es-CL') + ' documentos' });
      const data = JSON.parse(json);
      this.store.set(path, { data, frozen: deepFreeze(clone(data)), v: (rec ? rec.v : 0) + 1 });
    }
    this._notify(path);
    if(this.onChange) this.onChange();
    return Promise.resolve();
  }
  _notify(path){
    for(const s of this.subs){
      if(s.kind === 'doc' && s.path === path) s.fire();
      if(s.kind === 'col'){ const segs = splitPath(path); if(segs.length === s.segs.length + 1 && s.segs.every((x, i) => x === segs[i])) s.fire(); }
    }
  }
  _notifyAll(){ for(const s of this.subs) s.fire(); }
  doc(path){
    checkPath(path, 'doc');
    const db = this;
    const ref = {
      id: splitPath(path).pop(), path,
      get(){ return Promise.resolve(db._snap(path)); },
      set(data){ if(!isPlainObj(data)) return Promise.reject({ code:'invalid_argument', message:'El cuerpo debe ser un objeto' }); return db._write(path, () => clone(data)); },
      update(data){
        if(!isPlainObj(data)) return Promise.reject({ code:'invalid_argument', message:'El cuerpo debe ser un objeto' });
        return db._write(path, cur => { if(cur === undefined) throw { code:'invalid_argument', message:'update requiere que el documento exista' }; return deepMerge(cur, data); });
      },
      delete(){ return db._write(path, () => null); },
      onSnapshot(next, err){
        const s = { kind:'doc', path, dead:false, fire(){ if(this.dead) return; const snap = db._snap(path); setTimeout(() => { if(!s.dead) next(snap); }, 0); } };
        db.subs.add(s); s.fire();
        return () => { s.dead = true; db.subs.delete(s); };
      },
      collection(sub){ return db.collection(path + '/' + sub); }
    };
    return ref;
  }
  collection(path){
    const segs = checkPath(path, 'col');
    const db = this;
    const list = () => {
      const docs = [];
      for(const [p] of db.store){
        const s = splitPath(p);
        if(s.length === segs.length + 1 && segs.every((x, i) => x === s[i])){ const sn = db._snap(p); if(sn.exists) docs.push(sn); }
      }
      docs.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      return docs;
    };
    const mk = docs => ({ docs, size: docs.length, empty: !docs.length, docChanges: () => docs.map((d, i) => ({ type:'added', doc:d, oldIndex:-1, newIndex:i })), metadata:{ fromCache:false, hasPendingWrites:false } });
    return {
      path,
      doc(id){ return db.doc(path + '/' + (id || nid('d'))); },
      add(data){ const r = db.doc(path + '/' + nid('d')); return r.set(data).then(() => r); },
      get(){ return Promise.resolve(mk(list())); },
      onSnapshot(next, err){
        const s = { kind:'col', segs, dead:false, fire(){ if(this.dead) return; const docs = list(); setTimeout(() => { if(!s.dead) next(mk(docs)); }, 0); } };
        db.subs.add(s); s.fire();
        return () => { s.dead = true; db.subs.delete(s); };
      },
      where(){ return this; }, orderBy(){ return this; }, limit(){ return this; }
    };
  }
  dump(){ const o = {}; for(const [p, r] of this.store) o[p] = r.data; return o; }
  load(obj){ this.store.clear(); for(const p of Object.keys(obj)){ const data = obj[p]; this.store.set(p, { data: clone(data), frozen: deepFreeze(clone(data)), v:1 }); } this._notifyAll(); }
}

/* Directorio simulado de la demostración (reemplaza a la capacidad user). */
class MemUser {
  constructor(dir, viewer){ this.dir = dir; this.viewer = viewer; }
  setViewer(v){ this.viewer = v; }
  async isOwner(){ return this.viewer.level === 'owner'; }
  async canEdit(){ return LEVEL[this.viewer.level] >= LEVEL.admin; }
  async can(n){ return n === 'data.write' ? LEVEL[this.viewer.level] >= LEVEL.interact : false; }
  async id(){ return this.viewer.id || null; }
  async me(){ const p = this.dir[this.viewer.id] || {}; return { id:this.viewer.id || null, name:p.name || '', avatarUrl:'', color:p.color || '#52595e', email:null, isOwner:this.viewer.level === 'owner', canEdit:LEVEL[this.viewer.level] >= LEVEL.admin }; }
  async profiles(ids){ const out = {}; for(const id of [].concat(ids)){ const p = this.dir[id]; out[id] = { id, name: p ? p.name : '', avatarUrl:'', color: p ? p.color : '#52595e', email:null, isMe: id === this.viewer.id, guest:false }; } return out; }
  async search(q){ q = String(q || '').toLowerCase().trim(); const all = Object.keys(this.dir).map(id => ({ id, name:this.dir[id].name, avatarUrl:'', color:this.dir[id].color, email:null, isMe:id === this.viewer.id, guest:false })); return (q ? all.filter(p => p.name.toLowerCase().includes(q)) : all).slice(0, 8); }
}

/* ---------- escrituras: una a la vez por documento, errores en español ---------- */
const DB_ERR = {
  invalid_argument: 'La base rechazó el cambio (sin permiso o dato inválido).',
  resource_exhausted: 'Demasiadas solicitudes seguidas. Espera un momento y vuelve a intentar.',
  quota_exceeded: 'La base llegó a su límite de documentos. Exporta un respaldo y elimina registros antiguos.',
  unavailable: 'La base no respondió. Vuelve a intentar en unos segundos.',
  revoked: 'Tu acceso cambió mientras la página estaba abierta.',
  not_granted: 'Esta vista no tiene acceso a la base.',
  capability_disabled: 'Esta vista no tiene acceso a la base.',
  capability_removed: 'Esta vista no tiene acceso a la base.',
  transform_error: 'El dato no se pudo preparar para guardarlo.'
};
function errMsg(e){ if(e && e.code && DB_ERR[e.code]) return DB_ERR[e.code]; if(e instanceof TypeError) return 'Ruta inválida.'; return (e && e.message) ? String(e.message) : 'No se pudo guardar.'; }

const W = {
  q: new Map(),
  pending: 0,
  _run(path, fn){
    const prev = this.q.get(path) || Promise.resolve();
    this.pending++;
    const run = async () => {
      try { return await fn(); }
      catch(e){
        if(e && e.code === 'unavailable'){ await new Promise(r => setTimeout(r, 400 + Math.random() * 600)); return await fn(); }
        throw e;
      }
    };
    const p = prev.catch(() => {}).then(run).finally(() => { this.pending--; if(this.q.get(path) === p) this.q.delete(path); });
    this.q.set(path, p);
    return p;
  },
  set(path, data){ return this._run(path, () => S.db.doc(path).set(data)); },
  update(path, data){ return this._run(path, () => S.db.doc(path).update(data)); },
  /* crea si no existe, mezcla si existe */
  upsert(path, data, exists){
    return this._run(path, async () => {
      if(exists) { try { return await S.db.doc(path).update(data); } catch(e){ if(!(e && e.code === 'invalid_argument')) throw e; } }
      const snap = await S.db.doc(path).get();
      if(snap.exists) return await S.db.doc(path).update(data);
      return await S.db.doc(path).set(data);
    });
  },
  del(path){ return this._run(path, () => S.db.doc(path).delete()); }
};
