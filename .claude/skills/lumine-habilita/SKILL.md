---
name: lumine-habilita
description: Cómo trabajar en Lumine Habilita, la app de capacitación y habilitación del técnico instalador (JS sin dependencias en src/, build.py, dist/, tests/), incluidas sus reglas de negocio y la base de datos con DB_RULES. Úsala antes de tocar src/, build.py, manifest.json, dist/ o tests/.
---

# Lumine Habilita

App de selección y habilitación por competencias del técnico instalador. JavaScript **sin dependencias ni frameworks**:
no agregues React, npm de runtime ni CDNs. Detalle en `README.md` y el historial de decisiones en `CAMBIOS.md`.

## Cómo se arma

- `manifest.json` define el **orden** de los archivos de `src/`; `python3 build.py` los une en dos HTML autocontenidos:
  - `dist/lumine-habilita-demo.html`: base simulada (`MemDB`, se reinicia cada día), datos ficticios de `seed.js`.
  - `dist/lumine-habilita.html`: versión real dentro de claude.ai, base del artefacto con las reglas `DB_RULES`.
- Si creas un archivo en `src/`, agrégalo a `manifest.json` en el lugar correcto o no entra al build.
- **Nunca edites `dist/` a mano**: se sobrescribe. Edita `src/` y corre `python3 build.py`.

## Verificar

```bash
python3 build.py
npm test          # logic.test.js (reglas puras) + store.test.js (capa de datos)
npm run e2e       # PC, tablet y teléfono, claro y oscuro (Playwright)
```
Toda regla nueva en `logic.js` lleva su prueba en `tests/logic.test.js`.

## Mapa

- `data.js` competencias, niveles, módulos · `data-contenido.js` contenido de los 13 módulos
- `data-gobierno.js` reglas, tareas, decisiones, pendientes, controles y **`DB_RULES`**
- `logic.js` reglas puras (sin DOM) · `store.js` MemDB y cola de escrituras · `actions.js` toda escritura
- `ui-core.js` `h()` seguro (no uses `innerHTML` con datos del usuario) · `view-*.js` vistas · `styles-*.css`

## Reglas de negocio ya decididas (no cambiar sin el equipo)

- 39 competencias, 35 tareas, 17 reglas, 8 indicadores, 4 tipos de usuario, 4 niveles (aprendiz a formador).
- **D17**: lo legal es solo del Responsable Técnico. **D18**: el nivel 3 firma su propio trabajo; el nivel 4 firma
  revisiones cruzadas.
- **D13**: rotación de duos voluntaria, cada 4 meses como mínimo, por solicitud escrita (≥ 20 caracteres) al
  Responsable Técnico; vive en `solicitudes/{uid}` y la respuesta en `personas/` (nadie se aprueba solo).
- Dos técnicos de nivel 1 nunca forman duo (salvo el arranque, bajo el Responsable Técnico). Nadie valida a su compañero.
- Revalidación del core de seguridad cada 24 meses; período autónomo del nivel 3: 90 días; 392 h si se cursa todo.
- Seguridad en alta tensión según DGUV 209-093. Abiertas: 12 meses en nivel 2 antes del nivel 3; tutor con IA.

## Trampas

- Si cambias `DB_RULES`, la versión real **debe republicarse** (solo Claude puede): anótalo en `codex/BITACORA.md`.
- El técnico no ve códigos (C14, N2-3, D9): ve temas en palabras. Lenguaje de taller.
- Botones de 48 px en pantallas táctiles (se usan con guantes); respeta `prefers-reduced-motion`.
- Los datos de `seed.js` son ficticios y lo dicen; no uses nombres de personas reales.
