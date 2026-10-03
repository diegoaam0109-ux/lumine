const sharp = require('sharp'); const fs = require('fs');
const L = JSON.parse(fs.readFileSync('logo-paths.json')); const P = JSON.parse(fs.readFileSync('plano-paths.json'));
const FG = '#ECECEC', ACC = '#22B8F0', BG = '#020304', MUTED = '#8B9598', DIM = '#4B5154', LINE2 = '#2E3438', CONTROL = '#1A1E22';
const out = (svg, file, w) => sharp(Buffer.from(svg), { density: 300 }).resize({ width: w }).png().toFile('assets/' + file).then(() => console.log('ok', file));
(async () => {
  // logo: emblema 26 + 10 de separación + palabra 15 de alto (proporciones de la barra de la página)
  const ws = 15 / 96, wW = 584 * ws;
  const lockW = 26 + 10 + wW;
  await out(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lockW} 26" width="${lockW * 20}" height="${26 * 20}">
    <g transform="scale(${26 / 192})"><path d="${L.EMBLEMA}" fill="${FG}" fill-rule="evenodd"/></g>
    <g transform="translate(36 ${(26 - 15) / 2}) scale(${ws})"><path d="${L.LETRAS}" fill="${FG}" fill-rule="evenodd"/><path d="${L.ACENTO}" fill="${ACC}" fill-rule="evenodd"/></g></svg>`, 'logo.png', 2400);
  await out(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 584 96" width="5840" height="960"><path d="${L.LETRAS}" fill="${FG}" fill-rule="evenodd"/><path d="${L.ACENTO}" fill="${ACC}" fill-rule="evenodd"/></svg>`, 'palabra.png', 3600);
  await out(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="1920" height="1920"><path d="${L.EMBLEMA}" fill="${FG}" fill-rule="evenodd"/></svg>`, 'emblema.png', 800);
  await out(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="1920" height="1920"><path d="${L.EMBLEMA}" fill="${BG}" fill-rule="evenodd"/></svg>`, 'emblema-oscuro.png', 800);

  // fondos: escenario negro con rejilla enmascarada y foco celeste (como la portada de la página)
  const W = 2560, H = 1440, step = 80;
  let grid = ''; for (let x = 0; x <= W; x += step) grid += `M${x} 0V${H}`; for (let y = 0; y <= H; y += step) grid += `M0 ${y}H${W}`;
  const fondo = (cx, cy, rx, ry, glow, mcx, mcy) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="g" cx="${cx}" cy="${cy}" r="0.5" gradientTransform="translate(${cx} ${cy}) scale(${rx * 2} ${ry * 2}) translate(${-cx} ${-cy})"><stop offset="0" stop-color="${ACC}" stop-opacity="${glow}"/><stop offset="0.7" stop-color="${ACC}" stop-opacity="0"/></radialGradient>
      <radialGradient id="m" cx="${mcx}" cy="${mcy}" r="0.55"><stop offset="0.3" stop-color="#fff" stop-opacity="1"/><stop offset="0.75" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <mask id="mk"><rect width="${W}" height="${H}" fill="url(#m)"/></mask>
    </defs>
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <path d="${grid}" stroke="#BAD7F7" stroke-opacity="0.07" stroke-width="1.5" fill="none" mask="url(#mk)"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/></svg>`;
  await sharp(Buffer.from(fondo(0.5, 0.42, 0.6, 0.55, 0.30, 0.5, 0.45))).jpeg({ quality: 92 }).toFile('assets/fondo-portada.jpg');
  await sharp(Buffer.from(fondo(0.5, 1.0, 0.7, 0.6, 0.26, 0.5, 0.8))).jpeg({ quality: 92 }).toFile('assets/fondo-cierre.jpg');
  await sharp(Buffer.from(fondo(0.82, 0.08, 0.5, 0.5, 0.16, 0.8, 0.2))).jpeg({ quality: 92 }).toFile('assets/fondo-dato.jpg');
  console.log('ok fondos');
  // velo para el desvanecido del titular monumental
  await out(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="400"><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="${BG}" stop-opacity="0"/><stop offset="0.95" stop-color="${BG}" stop-opacity="0.9"/></linearGradient></defs><rect width="1000" height="400" fill="url(#v)"/></svg>`, 'velo.png', 1000);

  // plano técnico del kit (vista lateral), versión oscura sin textos: los rótulos van como texto en la diapositiva
  const piezas = [{ x: 372, y: 262, lx: 150 }, { x: 552, y: 268, lx: 470 }, { x: 742, y: 298, lx: 720 }, { x: 930, y: 318, lx: 960 }];
  const tags = piezas.map((p, i) => {
    const c = i ? ACC : MUTED, ty = 40 + (i % 2) * 34;
    return `<path d="M${p.x} ${p.y} V${ty + 16} H${p.lx + 18}" fill="none" stroke="${c}" stroke-opacity=".75" stroke-width="1.4"/>
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="${c}"/>
      <rect x="${p.lx - 22}" y="${ty}" width="40" height="32" fill="${i ? ACC : CONTROL}"/>
      <text x="${p.lx - 2}" y="${ty + 22}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="18" fill="${i ? '#031015' : FG}">0${i + 1}</text>`;
  }).join('');
  const ruedas = [250, 930].map(cx => `<circle cx="${cx}" cy="320" r="52" fill="${BG}" stroke="${FG}" stroke-opacity=".8" stroke-width="2.4"/><circle cx="${cx}" cy="320" r="32" fill="none" stroke="${FG}" stroke-opacity=".35" stroke-width="1.6"/><circle cx="${cx}" cy="320" r="7" fill="${FG}" fill-opacity=".6"/>`).join('');
  const baterias = Array.from({ length: 7 }, (_, k) => `<line x1="${665 + k * 25}" y1="286" x2="${665 + k * 25}" y2="314" stroke="${ACC}" stroke-opacity=".55"/>`).join('');
  const plano = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 20 1200 370" width="2400" height="740">
    <defs><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="${LINE2}" stop-opacity="0"/><stop offset=".5" stop-color="${MUTED}" stop-opacity=".6"/><stop offset="1" stop-color="${LINE2}" stop-opacity="0"/></linearGradient></defs>
    <line x1="40" y1="372" x2="1160" y2="372" stroke="url(#s)" stroke-width="1.6"/>
    <path d="${P.CARROCERIA}" fill="none" stroke="${FG}" stroke-opacity=".8" stroke-width="2.4" stroke-linejoin="round"/>
    ${P.VENTANAS.map(d => `<path d="${d}" fill="${FG}" fill-opacity=".05" stroke="${FG}" stroke-opacity=".45" stroke-width="1.6"/>`).join('')}
    ${P.LINEAS.map(d => `<path d="${d}" fill="none" stroke="${FG}" stroke-opacity=".3" stroke-width="1.3"/>`).join('')}
    ${ruedas}
    <rect x="326" y="236" width="104" height="54" rx="4" fill="${FG}" fill-opacity=".06" stroke="${FG}" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="5 4"/>
    <path d="M340 250 H416 M340 263 H416 M340 276 H416" stroke="${FG}" stroke-opacity=".28"/>
    <path d="M842 300 C870 300 872 318 886 318" fill="none" stroke="#FF8A1F" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M640 300 C606 300 604 270 582 270" fill="none" stroke="#FF8A1F" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="522" y="254" width="60" height="32" rx="3" fill="${ACC}" fill-opacity=".18" stroke="${ACC}" stroke-width="2"/>
    <path d="M532 264 H572 M532 272 H562" stroke="${ACC}" stroke-width="1.6"/>
    <rect x="640" y="282" width="202" height="36" rx="3" fill="${ACC}" fill-opacity=".14" stroke="${ACC}" stroke-width="2"/>${baterias}
    <rect x="884" y="302" width="92" height="36" rx="8" fill="${ACC}" fill-opacity=".3" stroke="${ACC}" stroke-width="2.2"/>
    <path d="M896 312 H964 M896 320 H964 M896 328 H964" stroke="${ACC}" stroke-opacity=".75"/>
    ${tags}</svg>`;
  await out(plano, 'plano.png', 2400);
})();
