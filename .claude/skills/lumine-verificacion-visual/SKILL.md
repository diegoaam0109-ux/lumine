---
name: lumine-verificacion-visual
description: Cómo verificar con capturas que un cambio visual de Lumine se ve bien (página comercial, Habilita, láminas) en PC y teléfono, modo oscuro y claro, con el Chromium y Playwright ya instalados. Úsala después de cualquier cambio de diseño, CSS, componentes, animaciones o láminas, y antes de decir que algo «está listo».
---

# Verificación visual

El equipo rechaza lo que se ve básico, de baja calidad o en «blanco nativo». Que compile no basta: hay que mirarlo.

## Entorno

- Playwright y Chromium ya están instalados (`require('playwright')`, `chromium.launch()` sin opciones).
  **No ejecutes `playwright install`.** Si un proyecto fija otra versión: `executablePath: '/opt/pw-browsers/chromium'`.
- En tu computador, si falta: `npm install` y `npx playwright install chromium` (una vez).

## Matriz mínima

| Vista | Tamaño | Temas |
|---|---|---|
| PC | 1440 × 900 | oscuro y claro |
| Teléfono | 390 × 844 | oscuro y claro |
| Tablet (Habilita) | 820 × 1180 | uno basta |

## Script base (guárdalo fuera del repo, por ejemplo en `.work/`, que está en `.gitignore`)

```js
const { chromium } = require('playwright')
const URL = 'file://' + process.argv[2]       // ruta absoluta al HTML construido
;(async () => {
  const b = await chromium.launch()
  for (const [n, vp] of [['pc', { width: 1440, height: 900 }], ['tel', { width: 390, height: 844 }]]) {
    for (const tema of ['oscuro', 'claro']) {
      const pg = await (await b.newContext({ viewport: vp, colorScheme: tema === 'claro' ? 'light' : 'dark' })).newPage()
      await pg.addInitScript(t => localStorage.setItem('lumine-tema', t), tema)
      await pg.goto(URL); await pg.waitForTimeout(1500)
      await pg.screenshot({ path: `.work/${n}-${tema}.png`, fullPage: true })
    }
  }
  await b.close()
})()
```
Para el recorrido 3D, toma varias capturas sin `fullPage` mientras haces scroll por `#como-funciona`.

## Qué mirar en cada captura

- Fondo de la marca (negro `#020304` / claro `#f5f5f7`), nunca el blanco del navegador ni la fuente del sistema.
- Texto legible: contraste, nada encima del 3D o de una foto sin velo, nada cortado ni montado.
- Sin desborde horizontal en teléfono; botones táctiles de 44–48 px; nada tapado por barras fijas.
- Un solo acento celeste; «Por confirmar» donde falta un dato.
- Imágenes nítidas (2× o más), sin estiramiento ni recortes raros.

## Láminas

Después de `render.sh`, abre cada `r/s-*.jpg`. Para ver más detalle: `pdftoppm -png -r 150 -f N -l N archivo.pdf salida`.

Describe en tu resumen qué capturas revisaste y qué corregiste. No digas «se ve bien» si no lo miraste.
