# Para revisar

Lista viva. Quien resuelva un punto lo marca con `[x]`, pone fecha y el commit, y lo cuenta en `BITACORA.md`.
Lo que dice **Preguntar** no se resuelve sin el equipo: se investiga y se propone.

## Primera revisión (solo lectura, sin commits)

- [ ] **Datos comerciales.** `ventas/src/lib/datos.ts`: confirmar que `precio`, `garantia`, `instalacion`, `whatsapp` y
      `correo` siguen en `null` y que ninguna sección de `ventas/src/sections/` escribe un precio, garantía o contacto propio.
      Buscar: `grep -rnE '\$[0-9]|garant|whatsapp|569' ventas/src/sections`.
- [ ] **Ahorro como estimación.** Cada vez que aparece «20%» en `ventas/src/`, `src/`, `fase-3/generador/guion.js` y
      `control-de-gestion/generador/guion.js`, ¿se dice que es estimación? `ahorroPct` vale `20` en `datos.ts`
      («definido por Lumine Motors»): debe leerse siempre como estimación, no como medición.
- [ ] **Promesas prohibidas.** `grep -rniE 'cero emisi|garantizad|homologad|exent' --include=*.{ts,tsx,js,md} .`
      (fuera de `node_modules`). En `fase-3/generador/deck.js` aparecen a propósito como «lo que la marca no promete».
- [ ] **Secretos y datos personales** en todo el historial: `git log -p | grep -niE 'api[_-]?key|token|secret|password|sk-'`.
- [ ] **Pruebas.** `npm test` (raíz) y en `ventas/`: `npm run typecheck && npm run lint`. Reportar fallas con el error.
- [ ] **Skills sincronizadas.** `python3 codex/sincronizar-skills.py --revisar`.
- [ ] **Documentos que se contradicen.** `CLAUDE.md` › Artefactos y
      `README.md` › Habilita: ¿coinciden con lo que hace `build.py`? `integrador-2/presentacion/` está vacía y la presentación
      real está en `fase-3/`: ¿está claro en los README?

## Inconsistencias conocidas (Preguntar)

- [ ] **Química de la batería**: informe de Fase 3 = litio-titanato; identidad, página y Habilita = LFP.
      Ver `fase-3/REDISENO_PREMIUM.md`.
- [ ] **Motores**: informe = dos motores en las ruedas; render e identidad = un motor central en el eje trasero.
- [ ] **Meta de cotizaciones del primer año** (Fase 3): sigue «Por confirmar».
- [ ] Lista completa de la Fase 3: `fase-3/REDISENO_LEGIBILIDAD.md` y `fase-3/VERSION_7_MINUTOS.md`.

## Decisiones abiertas del equipo (Preguntar, no implementar)

- [ ] ¿Tutor con IA dentro de los módulos de Habilita?
- [ ] ¿Exigir 12 meses en nivel 2 antes de validar el nivel 3 (DGUV)?
- [ ] Licencia SEC del instalador: ¿clase C hasta 50 kW y B sobre eso (D.S. 92)? Falta confirmarlo con la SEC.
- [ ] Guion de Control de Gestión, diapositiva 14: ¿se deja, se reformula o se quita «Dos observaciones críticas…»?

## Puntos frágiles (si tocas esto, verifica dos veces)

- [ ] `ventas/src/index.css`: estilos base fuera de `@layer` con `!important` (visor de artefactos). Moverlos rompe la página.
- [ ] Recorrido 3D de `ventas/` (`#como-funciona`, `src/lib/lab3d.js`): texto legible en todo el scroll, en PC y teléfono.
- [ ] `src/data-gobierno.js` › `DB_RULES`: cambiarlas obliga a republicar Habilita real.
- [ ] `fase-3/generador/deck.js` › `incrustarFuentes`: sin eso PowerPoint muestra Calibri.
- [ ] `COMBUSTIBLES` en `datos.ts` (30-09-2026): revisar precios antes de publicar la página.

## Ideas de aporte (proponer antes de hacer)

- [ ] Una prueba automática que falle si aparece una promesa prohibida o un precio escrito fuera de `datos.ts`.
- [ ] Revisión de accesibilidad de `ventas/` y de Habilita (contraste, foco con teclado, textos alternativos, `aria`).
- [ ] Revisión de rendimiento de `ventas/dist-artefacto/index.html` (peso de imágenes y del HTML único).
- [ ] Prueba e2e de la calculadora (gasto actual y valor de cada 10% de ahorro) con los precios de `COMBUSTIBLES`.
