/* =====================================================================
   Lumine Habilita · generador de códigos QR propio (sin librerías)
   Modo byte, corrección de errores M, versiones 1 a 6 (hasta 106 bytes).
   Basado en la norma ISO/IEC 18004: Reed-Solomon sobre GF(256),
   intercalado de bloques, ocho máscaras y elección por penalización.
   ===================================================================== */
'use strict';

const QR = (() => {
  /* [datos por bloque, corrección por bloque, bloques] con nivel M */
  const BLOQUES = { 1:[16,10,1], 2:[28,16,1], 3:[44,26,1], 4:[32,18,2], 5:[43,24,2], 6:[27,16,4] };
  const ALINEA = { 1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30], 6:[6,34] };
  const EXP = new Array(512), LOG = new Array(256);
  { let x = 1; for(let i = 0; i < 255; i++){ EXP[i] = x; LOG[x] = i; x <<= 1; if(x & 0x100) x ^= 0x11d; } for(let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
  const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  function generador(n){
    let g = [1];
    for(let i = 0; i < n; i++){ const ng = new Array(g.length + 1).fill(0); for(let j = 0; j < g.length; j++){ ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); } g = ng; }
    return g;
  }
  function correccion(datos, n){
    const g = generador(n), r = new Array(n).fill(0);
    for(const d of datos){ const f = d ^ r[0]; r.shift(); r.push(0); for(let j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f); }
    return r;
  }
  function bytesDe(texto){ return Array.from(new TextEncoder().encode(String(texto))); }

  function codificar(texto){
    const bytes = bytesDe(texto);
    let v = 1;
    while(v <= 6 && 4 + 8 + 8 * bytes.length > 8 * BLOQUES[v][0] * BLOQUES[v][2]) v++;
    if(v > 6) throw new Error('Texto demasiado largo para el código QR');
    const [porBloque, ecBloque, nb] = BLOQUES[v];
    const cap = porBloque * nb;
    // flujo de bits: modo byte (0100), largo (8 bits), datos, terminador y relleno
    const bits = [];
    const poner = (val, n) => { for(let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    poner(4, 4); poner(bytes.length, 8); for(const b of bytes) poner(b, 8);
    poner(0, Math.min(4, cap * 8 - bits.length));
    while(bits.length % 8) bits.push(0);
    const datos = [];
    for(let i = 0; i < bits.length; i += 8){ let b = 0; for(let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; datos.push(b); }
    for(let k = 0; datos.length < cap; k++) datos.push(k % 2 ? 0x11 : 0xEC);
    // bloques, corrección e intercalado
    const bl = [], ec = [];
    for(let i = 0; i < nb; i++){ const d = datos.slice(i * porBloque, (i + 1) * porBloque); bl.push(d); ec.push(correccion(d, ecBloque)); }
    const final = [];
    for(let i = 0; i < porBloque; i++) for(const d of bl) final.push(d[i]);
    for(let i = 0; i < ecBloque; i++) for(const e of ec) final.push(e[i]);
    return dibujar(v, final);
  }

  function dibujar(v, cw){
    const n = 17 + 4 * v;
    const m = Array.from({ length:n }, () => new Array(n).fill(false));
    const fn = Array.from({ length:n }, () => new Array(n).fill(false));
    const set = (x, y, on) => { m[y][x] = on; fn[y][x] = true; };
    for(let i = 0; i < n; i++){ set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const buscador = (cx, cy) => { for(let dy = -4; dy <= 4; dy++) for(let dx = -4; dx <= 4; dx++){ const x = cx + dx, y = cy + dy; if(x < 0 || y < 0 || x >= n || y >= n) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); set(x, y, d !== 2 && d !== 4); } };
    buscador(3, 3); buscador(n - 4, 3); buscador(3, n - 4);
    const al = ALINEA[v], u = al.length - 1;
    for(let i = 0; i < al.length; i++) for(let j = 0; j < al.length; j++){
      if((i === 0 && j === 0) || (i === 0 && j === u) || (i === u && j === 0)) continue;
      for(let dy = -2; dy <= 2; dy++) for(let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    formato(m, set, n, 0); // reserva las zonas de formato
    // datos en zigzag
    let k = 0;
    for(let der = n - 1; der >= 1; der -= 2){
      if(der === 6) der = 5;
      for(let vert = 0; vert < n; vert++) for(let j = 0; j < 2; j++){
        const x = der - j, arriba = ((der + 1) & 2) === 0, y = arriba ? n - 1 - vert : vert;
        if(!fn[y][x] && k < cw.length * 8){ m[y][x] = ((cw[k >>> 3] >>> (7 - (k & 7))) & 1) === 1; k++; }
      }
    }
    // elegir la máscara con menor penalización
    let mejor = null, mejorP = Infinity;
    for(let mk = 0; mk < 8; mk++){
      const c = m.map(r => r.slice());
      enmascarar(c, fn, mk, n);
      formato(c, (x, y, on) => { c[y][x] = on; }, n, mk);
      const p = penalizacion(c, n);
      if(p < mejorP){ mejorP = p; mejor = c; }
    }
    return mejor;
  }
  function formato(m, set, n, mascara){
    const datos = (0 << 3) | mascara; // nivel M = 00
    let r = datos;
    for(let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((datos << 10) | r) ^ 0x5412;
    const bit = i => ((b >>> i) & 1) === 1;
    for(let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for(let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for(let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
    for(let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
    set(8, n - 8, true);
  }
  function enmascarar(m, fn, k, n){
    for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){
      if(fn[y][x]) continue;
      let inv;
      switch(k){
        case 0: inv = (x + y) % 2 === 0; break;
        case 1: inv = y % 2 === 0; break;
        case 2: inv = x % 3 === 0; break;
        case 3: inv = (x + y) % 3 === 0; break;
        case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
        case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
        default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      }
      if(inv) m[y][x] = !m[y][x];
    }
  }
  function penalizacion(m, n){
    let p = 0, oscuros = 0;
    const corridas = get => { for(let a = 0; a < n; a++){ let run = 1; for(let b = 1; b < n; b++){ if(get(a, b) === get(a, b - 1)) run++; else { if(run >= 5) p += run - 2; run = 1; } } if(run >= 5) p += run - 2; } };
    corridas((a, b) => m[a][b]); corridas((a, b) => m[b][a]);
    for(let y = 0; y < n - 1; y++) for(let x = 0; x < n - 1; x++){ const c = m[y][x]; if(c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
    const patron = [true, false, true, true, true, false, true];
    const esPatron = (get, a, b) => { for(let i = 0; i < 7; i++) if(get(a, b + i) !== patron[i]) return false; return true; };
    for(let a = 0; a < n; a++) for(let b = 0; b + 7 <= n; b++){ if(esPatron((r, c) => m[r][c], a, b)) p += 40; if(esPatron((r, c) => m[c][r], a, b)) p += 40; }
    for(const r of m) for(const c of r) if(c) oscuros++;
    p += Math.floor(Math.abs(oscuros * 20 - n * n * 10) / (n * n)) * 10;
    return p;
  }

  /* SVG listo para insertar: módulos oscuros sobre fondo claro, con margen de 4 módulos */
  function svg(texto, o){
    o = o || {};
    const m = codificar(texto), n = m.length, q = 4, t = n + 2 * q;
    let d = '';
    for(let y = 0; y < n; y++) for(let x = 0; x < n; x++) if(m[y][x]) d += 'M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 ' + t + ' ' + t);
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', o.label || 'Código QR');
    el.setAttribute('shape-rendering', 'crispEdges');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', t); bg.setAttribute('height', t); bg.setAttribute('fill', '#ffffff');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('fill', o.color || '#0b0f11');
    el.appendChild(bg); el.appendChild(p);
    return el;
  }
  return { codificar, svg };
})();
if(typeof module !== 'undefined') module.exports = { QR };
