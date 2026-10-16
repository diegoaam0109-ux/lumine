/* Motor 3D propio de Lumine (canvas 2D, sin librerías), traído de Lumine Habilita.
   Se usa tal cual: el mismo auto genérico con el kit en el eje trasero. */
/* eslint-disable */
function h(tag, props, ...kids){
  const el = document.createElement(tag);
  for(const k in (props || {})){
    const v = props[k];
    if(v === null || v === undefined || v === false) continue;
    if(k === 'class') el.setAttribute('class', v);
    else if(k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for(const c of kids.flat()) if(c !== null && c !== undefined && c !== false) el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
/* =====================================================================
   Lumine Habilita · motor 3D propio (canvas 2D, sin librerías)
   Auto genérico de baja poligonización con el kit en el eje trasero.
   Sin dependencias externas: funciona sin red y no agrega superficie
   de ataque. Respeta prefers-reduced-motion (sin giro automático).
   ===================================================================== */


/* Piezas del laboratorio. Textos tomados de los informes y de la ficha
   técnica del kit; sin especificaciones numéricas que no existen. */
const PIEZAS = [
  { id:'motor',    n:'Motor eléctrico',            sub:'Eje trasero · kit', comp:['C14','C13','C24'],
    d:'Agrega asistencia eléctrica en el eje trasero sin tocar el motor original. Se instala según el procedimiento Lumine.',
    cuida:['El tren trasero se desmonta y monta con los torques del fabricante.','Freno, ABS y control de estabilidad originales siempre mandan.'] },
  { id:'regen',    n:'Frenado regenerativo',       sub:'Eje trasero · kit', comp:['C14','C24'],
    d:'Recupera energía al frenar y la envía al banco de baterías.',
    cuida:['El freno original manda: el kit nunca lo reemplaza.','Se mide en dinamómetro junto con la asistencia (C27).'] },
  { id:'bateria',  n:'Banco de baterías',          sub:'Almacena la energía regenerada', comp:['C15','C34','C35'],
    d:'Guarda la energía que recupera el frenado y la entrega al motor eléctrico.',
    cuida:['Se manipula y monta con elevador, sin golpes.','Una batería golpeada se aísla en un lugar abierto y se vigila.'] },
  { id:'ecu',      n:'Unidad de control con IA',   sub:'Decide combustión o asistencia', comp:['C22','C23','C25'],
    d:'Decide en tiempo real cuándo asiste el motor eléctrico. Lee velocidad, freno, acelerador, OBD y batería.',
    cuida:['Su capa de seguridad corta el torque ante patinaje, falla o sobretemperatura.','Las calibraciones vienen de la biblioteca de Ingeniería de Calibración.'] },
  { id:'cables',   n:'Cableado de alta tensión',   sub:'Naranja por convención', comp:['C16','C19','C21','C20'],
    d:'Une el banco de baterías con el motor. Por convención de la industria, el cable de alta tensión es naranja.',
    cuida:['Rutas, fijaciones y protecciones antes de conectar.','Se mide la aislación con megóhmetro y se revisa con termografía al energizar.'] },
  { id:'combustion', n:'Motor a combustión original', sub:'Eje delantero · sin cambios', comp:['C07'],
    d:'El auto conserva su motor y su tracción delantera. El kit se suma, no reemplaza.',
    cuida:['El kit no se instala si el modelo no está en la biblioteca de calibraciones (C07).'] },
  { id:'obd',      n:'Puerto OBD',                 sub:'Diagnóstico del auto', comp:['C09','C22'],
    d:'Por aquí se leen las fallas previas antes de tocar nada y se conectan las señales a la unidad de control.',
    cuida:['Las fallas previas se registran antes de empezar: así nadie confunde una falla antigua con una nueva.'] }
];
const PIEZA = Object.fromEntries(PIEZAS.map(p => [p.id, p]));

const Lab3D = (() => {
  const inst = new Set();
  const reduce = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };
  const avg = pts => { const s = [0,0,0]; for(const p of pts){ s[0]+=p[0]; s[1]+=p[1]; s[2]+=p[2]; } return [s[0]/pts.length, s[1]/pts.length, s[2]/pts.length]; };

  /* ---------- primitivas ---------- */
  function box(x0, x1, y0, y1, z0, z1){
    const v = (x, y, z) => [x, y, z];
    return [
      [v(x0,y0,z1), v(x1,y0,z1), v(x1,y1,z1), v(x0,y1,z1)], [v(x1,y0,z0), v(x0,y0,z0), v(x0,y1,z0), v(x1,y1,z0)],
      [v(x0,y1,z0), v(x0,y1,z1), v(x1,y1,z1), v(x1,y1,z0)], [v(x0,y0,z0), v(x1,y0,z0), v(x1,y0,z1), v(x0,y0,z1)],
      [v(x0,y0,z0), v(x0,y0,z1), v(x0,y1,z1), v(x0,y1,z0)], [v(x1,y0,z1), v(x1,y0,z0), v(x1,y1,z0), v(x1,y1,z1)]
    ];
  }
  function extrude(prof, z0, z1){
    const f = [prof.map(([x, y]) => [x, y, z1]), prof.slice().reverse().map(([x, y]) => [x, y, z0])];
    for(let i = 0; i < prof.length; i++){ const [x1, y1] = prof[i], [x2, y2] = prof[(i+1) % prof.length]; f.push([[x1,y1,z0],[x2,y2,z0],[x2,y2,z1],[x1,y1,z1]]); }
    return f;
  }
  // cilindro a lo largo de Z, centrado en (cx,cy,cz)
  function cylZ(cx, cy, cz, r, len, seg){
    seg = seg || 14; const f = []; const z0 = cz - len/2, z1 = cz + len/2;
    const ring = z => Array.from({ length:seg }, (_, i) => { const a = i / seg * Math.PI * 2; return [cx + Math.cos(a)*r, cy + Math.sin(a)*r, z]; });
    const A = ring(z0), B = ring(z1);
    for(let i = 0; i < seg; i++){ const j = (i+1) % seg; f.push([A[i], A[j], B[j], B[i]]); }
    f.push(B.slice()); f.push(A.slice().reverse());
    return f;
  }
  // tubo entre dos puntos (sección cuadrada), para cables
  function tubo(a, b, w){
    const d = norm(sub(b, a)); let up = Math.abs(d[1]) > .9 ? [1,0,0] : [0,1,0];
    const s1 = norm(cross(d, up)), s2 = norm(cross(d, s1));
    const off = (p, i, j) => [p[0] + (s1[0]*i + s2[0]*j)*w, p[1] + (s1[1]*i + s2[1]*j)*w, p[2] + (s1[2]*i + s2[2]*j)*w];
    const c = [[-1,-1],[1,-1],[1,1],[-1,1]];
    const A = c.map(([i, j]) => off(a, i, j)), B = c.map(([i, j]) => off(b, i, j));
    const f = []; for(let i = 0; i < 4; i++){ const k = (i+1) % 4; f.push([A[i], A[k], B[k], B[i]]); }
    return f;
  }

  /* ---------- el auto ---------- */
  function construir(){
    const P = [];
    const parte = (id, grupo, color, faces, o) => P.push(Object.assign({ id, grupo, color, faces, alpha:1, ex:[0,0,0] }, o || {}));
    // carrocería: perfil lateral extruido (x = largo, y = alto, z = ancho)
    const baja = [[-2.12,0.30],[2.10,0.30],[2.16,0.62],[2.10,0.96],[1.60,1.00],[-1.00,0.93],[-2.02,0.80],[-2.16,0.60]];
    parte('carroceria', 'body', [104,118,126], extrude(baja, -0.84, 0.84));
    parte('cabina', 'glass', [92,140,160], extrude([[-1.00,0.93],[1.60,1.00],[0.92,1.42],[-0.30,1.42]], -0.72, 0.72), { alpha:.42 });
    // ruedas
    const rueda = (x, z, trasera) => parte('rueda' + x + z, trasera ? 'rear' : 'base', [26,30,33], cylZ(x, 0.32, z, 0.32, 0.22, 16));
    rueda(-1.36, -0.80); rueda(-1.36, 0.80); rueda(1.36, -0.80, 1); rueda(1.36, 0.80, 1);
    // motor original (adelante)
    parte('combustion', 'base', [96,106,112], box(-1.95, -1.15, 0.42, 0.82, -0.42, 0.42), { pick:'combustion', ex:[-0.25, 0.75, 0] });
    // eje trasero y kit
    parte('eje', 'rear', [70,80,86], cylZ(1.36, 0.32, 0, 0.05, 1.44, 8), { ex:[0, 0.55, 0] });
    parte('motor', 'kit', [34,184,240], cylZ(1.36, 0.32, 0, 0.17, 0.42, 16), { pick:'motor', ex:[0, 0.95, 0] });
    parte('regen1', 'kit', [120,214,247], cylZ(1.36, 0.32, -0.66, 0.22, 0.05, 16), { pick:'regen', ex:[0, 0.75, -0.25] });
    parte('regen2', 'kit', [120,214,247], cylZ(1.36, 0.32, 0.66, 0.22, 0.05, 16), { pick:'regen', ex:[0, 0.75, 0.25] });
    parte('bateria', 'kit', [24,150,205], box(0.55, 1.05, 0.40, 0.62, -0.55, 0.55), { pick:'bateria', ex:[0, 1.55, 0] });
    parte('ecu', 'kit', [230,244,250], box(-0.78, -0.48, 0.70, 0.84, 0.12, 0.40), { pick:'ecu', ex:[0, 1.35, 0.3] });
    const naranja = [242,140,40];
    parte('cable1', 'kit', naranja, tubo([1.05, 0.46, 0.2], [1.25, 0.40, 0.12], 0.028), { pick:'cables', ex:[0, 1.2, 0] });
    parte('cable2', 'kit', naranja, tubo([1.05, 0.46, -0.2], [1.25, 0.40, -0.12], 0.028), { pick:'cables', ex:[0, 1.2, 0] });
    parte('senal', 'kit', [150,170,180], tubo([-0.48, 0.74, 0.26], [0.55, 0.55, 0.3], 0.016), { pick:'ecu', ex:[0, 1.25, 0.3] });
    parte('obd', 'base', [200,210,214], box(-1.05, -0.92, 0.66, 0.74, 0.30, 0.42), { pick:'obd', ex:[0, 0.9, 0] });
    for(const p of P){
      const pts = p.faces.flat(); p.c = avg(pts);
      p.n = p.faces.map(f => { let n = norm(cross(sub(f[1], f[0]), sub(f[2], f[0]))); const fc = avg(f); if(dot(n, sub(fc, p.c)) < 0) n = [-n[0], -n[1], -n[2]]; return n; });
      p.fc = p.faces.map(avg);
    }
    return P;
  }
  const ANCLAS = { motor:[1.36,0.32,0], regen:[1.36,0.32,0.66], bateria:[0.8,0.62,0], ecu:[-0.63,0.84,0.26], cables:[1.15,0.44,0.16], combustion:[-1.55,0.82,0], obd:[-0.98,0.74,0.36] };

  /* ---------- instancia ---------- */
  function crear(host, opts){
    opts = Object.assign({ auto:true, hotspots:true, interactivo:true, xray:false, explode:false, visibles:null, foco:null, onSelect:null, etiqueta:'Modelo 3D del auto con el kit' }, opts || {});
    const parts = construir();
    const canvas = h('canvas', { class:'lab-canvas', role:'img', 'aria-label': opts.etiqueta });
    const capa = h('div', { class:'lab-hots' });
    host.appendChild(canvas); host.appendChild(capa);
    const ctx = canvas.getContext('2d');
    const st = { yaw:-0.75, pitch:0.32, dist:7.6, tYaw:-0.75, tPitch:0.32, tDist:7.6, ex:opts.explode ? 1 : 0, tEx:opts.explode ? 1 : 0, xray:opts.xray, sel:opts.foco, vis:opts.visibles ? new Set(opts.visibles) : null, ap:{}, idle:0, w:0, h:0, dpr:1, vivo:true, drag:null, t0:performance.now() };
    const hots = {};
    if(opts.hotspots){
      for(const p of PIEZAS){
        const b = h('button', { type:'button', class:'lab-hot', 'aria-label': p.n, dataset:{ id:p.id } }, h('span', { class:'lh-dot' }), h('span', { class:'lh-l' }, p.n));
        b.addEventListener('click', e => { e.stopPropagation(); api.enfocar(p.id); if(opts.onSelect) opts.onSelect(p.id); });
        capa.appendChild(b); hots[p.id] = b;
      }
    }
    function medir(){
      const r = host.getBoundingClientRect();
      st.dpr = Math.min(2, window.devicePixelRatio || 1);
      st.w = Math.max(10, r.width); st.h = Math.max(10, r.height);
      canvas.width = Math.round(st.w * st.dpr); canvas.height = Math.round(st.h * st.dpr);
      canvas.style.width = st.w + 'px'; canvas.style.height = st.h + 'px';
    }
    const ro = window.ResizeObserver ? new ResizeObserver(() => { medir(); pedir(); }) : null;
    if(ro) ro.observe(host);
    medir();
    // proyección
    function proyectar(p){
      const tx = p[0] - 0.05, ty = p[1] - 0.62, tz = p[2];
      const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      const x1 = tx * cy - tz * sy, z1 = tx * sy + tz * cy;
      const y2 = ty * cp - z1 * sp, z2 = ty * sp + z1 * cp + st.dist;
      const f = Math.min(st.w * 1.22, st.h * 1.6);
      return [st.w / 2 + x1 * f / z2, st.h * 0.54 - y2 * f / z2, z2, x1, y2];
    }
    const L = norm([-0.45, 0.85, -0.55]);
    function offset(p){
      const a = st.ap[p.pick || p.id];
      const ex = st.ex, k = p.ex;
      let dy = k[1] * ex, dx = k[0] * ex, dz = k[2] * ex;
      if(a !== undefined) dy += (1 - a) * 1.4;
      return [dx, dy, dz];
    }
    function visible(p){ if(!st.vis) return true; if(p.grupo !== 'kit') return true; return st.vis.has(p.pick || p.id); }
    function dibujar(){
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.clearRect(0, 0, st.w, st.h);
      // piso: grilla del taller
      ctx.lineWidth = 1;
      for(let i = -6; i <= 6; i++){
        for(const eje of [0, 1]){
          const a = eje ? proyectar([i * 0.6, 0, -3.6]) : proyectar([-3.6, 0, i * 0.6]);
          const b = eje ? proyectar([i * 0.6, 0, 3.6]) : proyectar([3.6, 0, i * 0.6]);
          if(a[2] <= 0.2 || b[2] <= 0.2) continue;
          ctx.strokeStyle = 'rgba(120,200,240,' + (i === 0 ? .14 : .06) + ')';
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
      }
      // sombra
      const s0 = proyectar([0, 0, 0]);
      const g = ctx.createRadialGradient(s0[0], s0[1], 4, s0[0], s0[1], Math.max(40, st.w * 0.32));
      g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(s0[0], s0[1], st.w * 0.34, st.h * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      // caras
      const lista = [];
      const t = (performance.now() - st.t0) / 1000;
      for(const p of parts){
        if(!visible(p)) continue;
        const off = offset(p);
        const ap = st.ap[p.pick || p.id];
        let alpha = p.alpha * (ap === undefined ? 1 : Math.max(0, Math.min(1, ap * 1.6)));
        const cuerpo = p.grupo === 'body' || p.grupo === 'glass';
        if(st.xray && cuerpo) alpha = p.grupo === 'glass' ? .05 : .08;
        if(st.ex > .01 && cuerpo) alpha = Math.min(alpha, 1 - st.ex * .86);
        if(alpha <= .01) continue;
        const elegido = st.sel && (p.pick === st.sel || p.id === st.sel);
        for(let i = 0; i < p.faces.length; i++){
          const f = p.faces[i].map(v => [v[0] + off[0], v[1] + off[1], v[2] + off[2]]);
          const pr = f.map(proyectar);
          if(pr.some(q => q[2] <= 0.2)) continue;
          // cara visible si la normal mira a la cámara (en espacio de pantalla)
          let area = 0; for(let k = 0; k < pr.length; k++){ const a = pr[k], b = pr[(k+1) % pr.length]; area += a[0] * b[1] - b[0] * a[1]; }
          const transp = alpha < .99;
          if(area >= 0 && !transp) continue;
          const z = pr.reduce((s, q) => s + q[2], 0) / pr.length;
          const luz = 0.34 + 0.66 * Math.max(0, dot(p.n[i], L));
          lista.push({ pr, z, p, luz, alpha, elegido, back: area >= 0 });
        }
      }
      lista.sort((a, b) => b.z - a.z);
      const pulso = 0.5 + 0.5 * Math.sin(t * 4);
      for(const it of lista){
        const c = it.p.color; let k = it.luz;
        if(it.elegido) k = Math.min(1.35, k + 0.25 + pulso * 0.15);
        const col = 'rgba(' + Math.min(255, c[0]*k|0) + ',' + Math.min(255, c[1]*k|0) + ',' + Math.min(255, c[2]*k|0) + ',' + (it.back ? it.alpha * .5 : it.alpha) + ')';
        ctx.beginPath(); ctx.moveTo(it.pr[0][0], it.pr[0][1]); for(let i = 1; i < it.pr.length; i++) ctx.lineTo(it.pr[i][0], it.pr[i][1]); ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        const cuerpo = it.p.grupo === 'body' || it.p.grupo === 'glass';
        if(cuerpo && (st.xray || st.ex > .01)){ ctx.strokeStyle = 'rgba(160,215,240,.22)'; ctx.lineWidth = 1; ctx.stroke(); }
        else if(it.elegido){ ctx.strokeStyle = 'rgba(120,225,255,.95)'; ctx.lineWidth = 1.4; ctx.stroke(); }
        else if(it.p.grupo === 'kit'){ ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = .8; ctx.stroke(); }
        else { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .6; ctx.stroke(); }
      }
      // marcadores (con separación mínima para que no se tapen entre sí)
      const pos = [];
      for(const id of Object.keys(hots)){
        const b = hots[id];
        const pieza = parts.find(p => (p.pick || p.id) === id);
        const vis = !st.vis || PIEZA[id] && (['combustion','obd'].includes(id) || st.vis.has(id));
        if(!vis || !pieza){ b.hidden = true; continue; }
        b.hidden = false;
        const off = offset(pieza); const a = ANCLAS[id];
        const q = proyectar([a[0] + off[0], a[1] + off[1], a[2] + off[2]]);
        let x = q[0], y = q[1];
        for(let it = 0; it < 3; it++){ for(const o of pos){ const dx = x - o[0], dy = y - o[1], d = Math.hypot(dx, dy); if(d < 26){ const k = (26 - d) / (d || 1); x += (d ? dx : 1) * k; y += (d ? dy : 1) * k; } } }
        x = Math.max(12, Math.min(st.w - 12, x)); y = Math.max(56, Math.min(st.h - 12, y));
        pos.push([x, y]);
        b.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
        b.classList.toggle('on', st.sel === id);
        b.classList.toggle('lejos', q[2] > st.dist + 0.9);
      }
    }
    let raf = 0;
    function cuadro(){
      raf = 0;
      if(!document.body.contains(host)){ destruir(); return; }
      const k = 0.14;
      st.yaw += (st.tYaw - st.yaw) * k; st.pitch += (st.tPitch - st.pitch) * k; st.dist += (st.tDist - st.dist) * k; st.ex += (st.tEx - st.ex) * 0.1;
      let anim = Math.abs(st.tYaw - st.yaw) > 1e-3 || Math.abs(st.tPitch - st.pitch) > 1e-3 || Math.abs(st.tDist - st.dist) > 1e-3 || Math.abs(st.tEx - st.ex) > 1e-3;
      for(const id of Object.keys(st.ap)){ if(st.ap[id] < 1){ st.ap[id] = Math.min(1, st.ap[id] + 0.045); anim = true; } }
      if(opts.auto && !reduce() && !st.drag && performance.now() - st.idle > 2500){ st.tYaw += 0.0035; anim = true; }
      if(st.sel) anim = true;
      dibujar();
      if(anim && enPantalla) pedir();
    }
    let enPantalla = true;
    const io = window.IntersectionObserver ? new IntersectionObserver(es => { enPantalla = es[0].isIntersecting; if(enPantalla) pedir(); }) : null;
    if(io) io.observe(host);
    function pedir(){ if(!raf && st.vivo) raf = requestAnimationFrame(cuadro); }
    // interacción: arrastrar para girar, rueda o pellizco para acercar, teclado
    if(opts.interactivo){
      canvas.tabIndex = 0;
      canvas.addEventListener('pointerdown', e => { st.drag = { x:e.clientX, y:e.clientY, yaw:st.tYaw, pitch:st.tPitch }; canvas.setPointerCapture(e.pointerId); st.idle = performance.now(); });
      canvas.addEventListener('pointermove', e => { if(!st.drag) return; st.tYaw = st.drag.yaw + (e.clientX - st.drag.x) * 0.008; st.tPitch = Math.max(-0.05, Math.min(1.1, st.drag.pitch + (e.clientY - st.drag.y) * 0.006)); pedir(); });
      const fin = () => { st.drag = null; st.idle = performance.now(); };
      canvas.addEventListener('pointerup', fin); canvas.addEventListener('pointercancel', fin);
      canvas.addEventListener('wheel', e => { if(!e.ctrlKey && !host.classList.contains('lab-zoom')) return; e.preventDefault(); st.tDist = Math.max(4.6, Math.min(11, st.tDist + e.deltaY * 0.004)); pedir(); }, { passive:false });
      canvas.addEventListener('keydown', e => {
        const m = { ArrowLeft:[-0.25,0], ArrowRight:[0.25,0], ArrowUp:[0,-0.1], ArrowDown:[0,0.1] }[e.key];
        if(m){ e.preventDefault(); st.tYaw += m[0]; st.tPitch = Math.max(-0.05, Math.min(1.1, st.tPitch + m[1])); st.idle = performance.now(); pedir(); }
        if(e.key === '+' || e.key === '='){ st.tDist = Math.max(4.6, st.tDist - 0.5); pedir(); }
        if(e.key === '-'){ st.tDist = Math.min(11, st.tDist + 0.5); pedir(); }
      });
    }
    function destruir(){ st.vivo = false; if(raf) cancelAnimationFrame(raf); if(ro) ro.disconnect(); if(io) io.disconnect(); inst.delete(api); }
    const VISTAS = { motor:[0.55,0.35,6.2], regen:[0.9,0.3,6.2], bateria:[0.35,0.62,6.4], ecu:[-2.0,0.45,6.0], cables:[0.6,0.5,6.0], combustion:[-2.3,0.35,6.6], obd:[-1.9,0.3,6.0] };
    const api = {
      el: host,
      enfocar(id){ st.sel = id; st.idle = performance.now() + 4000; const v = VISTAS[id]; if(v && opts.interactivo){ st.tYaw = v[0]; st.tPitch = v[1]; st.tDist = v[2]; } pedir(); },
      soltar(){ st.sel = null; st.tDist = 7.6; pedir(); },
      modo(m){ if('xray' in m) st.xray = !!m.xray; if('explode' in m) st.tEx = m.explode ? 1 : 0; pedir(); },
      mostrar(ids){ st.vis = ids ? new Set(ids) : null; pedir(); },
      aparecer(id){ st.ap[id] = 0; st.sel = id; if(st.vis) st.vis.add(id); pedir(); setTimeout(() => { if(st.sel === id){ st.sel = null; pedir(); } }, 1600); },
      vista(yaw, pitch, dist){ st.tYaw = yaw; st.tPitch = pitch; if(dist) st.tDist = dist; pedir(); },
      destruir
    };
    inst.add(api);
    pedir();
    return api;
  }
  return { crear, temaCambio(){ for(const i of inst) i.mostrar && null; } };
})();

export { Lab3D, PIEZAS };
