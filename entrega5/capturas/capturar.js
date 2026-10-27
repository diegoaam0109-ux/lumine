// Capturas del prototipo con el modelo Ridge del nivel 2. Uso: node capturar.js
const { chromium } = require("playwright");
const path = require("path");
const APP = "file://" + path.resolve(__dirname, "../../entrega3/prototipo/app/index.html");
const OUT = path.resolve(__dirname, "../figuras");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: "dark" });
  const errores = [];
  p.on("pageerror", e => errores.push(e.message));
  await p.goto(APP);
  await p.click("#tab-n2");
  await p.locator("#muestras button, #muestras [role=button], #muestras .muestra").first().click();
  await p.waitForTimeout(800);
  await p.locator("#herramienta").screenshot({ path: path.join(OUT, "app_diagnostico_ridge.png") });
  await p.click("#tab-tec");
  await p.fill("#tec-ajuste", "-1");
  await p.fill("#tec-motivo", "Uso permanente del aire acondicionado");
  await p.click("#tec-adj");
  await p.waitForTimeout(500);
  await p.locator("#herramienta").screenshot({ path: path.join(OUT, "app_tecnico_ridge.png") });
  console.log("errores JS:", errores.length ? errores : "ninguno");
  await b.close();
})();
