// Capturas del sitio comercial (copia local del artefacto publicado). Uso: node capturar_sitio.js <sitio.html>
const { chromium } = require("playwright");
const path = require("path");
const OUT = path.resolve(__dirname, "../figuras");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, colorScheme: "dark" });
  const errores = [];
  p.on("pageerror", e => errores.push(e.message));
  await p.goto("file://" + path.resolve(process.argv[2]), { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, "sitio_portada.png") });
  const s = p.locator("#ahorro");
  await s.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  await s.screenshot({ path: path.join(OUT, "sitio_calculadora.png") });
  console.log("errores JS:", errores.length ? errores.slice(0, 3) : "ninguno");
  await b.close();
})();
