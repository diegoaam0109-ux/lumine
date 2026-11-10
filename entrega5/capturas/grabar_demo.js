// Graba un video corto del MVP (diagnóstico de tres perfiles y panel del técnico). Uso: node grabar_demo.js
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const APP = "file://" + path.resolve(__dirname, "../../entrega3/prototipo/app/index.html");
const TMP = path.resolve(__dirname, "video_tmp");
(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, colorScheme: "dark", recordVideo: { dir: TMP, size: { width: 1280, height: 720 } } });
  const p = await ctx.newPage();
  await p.goto(APP);
  await p.waitForTimeout(1500);
  await p.locator("#herramienta").scrollIntoViewIfNeeded();
  await p.click("#tab-n1");
  await p.waitForTimeout(1500);
  for (const km of ["80", "150", "220"]) { await p.fill("#n1-km", km); await p.locator("#n1-km").dispatchEvent("input"); await p.waitForTimeout(900); }
  await p.click("#tab-n2");
  await p.waitForTimeout(800);
  const muestras = p.locator("#muestras .muestra");
  for (let i = 0; i < 3; i++) { await muestras.nth(i).click(); await p.waitForTimeout(1600); }
  await muestras.nth(0).click();
  await p.click("#tab-tec");
  await p.waitForTimeout(1000);
  await p.fill("#tec-ajuste", "-1");
  await p.fill("#tec-motivo", "Uso permanente del aire acondicionado");
  await p.click("#tec-adj");
  await p.waitForTimeout(2200);
  await ctx.close(); await b.close();
  const f = fs.readdirSync(TMP).find(x => x.endsWith(".webm"));
  console.log(path.join(TMP, f));
})();
