# Lumine Habilita

Selección y habilitación por competencias del Técnico Instalador de Lumine Motors.
Un solo código genera dos HTML autocontenidos:

| Archivo | Para qué | Base de datos |
|---|---|---|
| `dist/lumine-habilita-demo.html` | Mostrar y probar (compartible) | Simulada en el navegador (MemDB), se reinicia cada día |
| `dist/lumine-habilita.html` | Operación real dentro de claude.ai | Base del artifact (`db`), con las reglas de `DB_RULES` |

## Trabajar

```bash
python3 build.py          # une src/ en dist/
npm test                  # reglas (logic) + capa de datos (store), sin navegador
npm install && npx playwright install chromium   # una vez
npm run e2e               # PC, tablet y teléfono, claro y oscuro, flujos completos
```

El orden de los archivos está en `manifest.json` (lo usan el build y las pruebas).

## Estructura de `src/`

- `data.js` competencias, niveles, módulos, estaciones, parámetros por defecto
- `data-contenido.js` contenido base de los 13 módulos (cápsulas, simulador, escenarios, banco de preguntas)
- `data-gobierno.js` reglas, tareas, decisiones, pendientes, controles de seguridad y reglas de la base
- `logic.js` reglas puras (sin DOM): plan, evaluación, D8, D13, duos, indicadores, bonos, consistencia
- `store.js` MemDB (replica la base de claude.ai, 25.000 documentos), MemUser, cola de escrituras
- `seed.js` datos ficticios de la demo (`DEMO_IDS` con los identificadores fijos)
- `ui-core.js` `h()` seguro, eventos permitidos, diálogos, hojas, avisos, ayudas "?"
- `ui-qr.js` generador de códigos QR propio (sin librerías) para la credencial digital
- `ui-buscar.js` búsqueda rápida (Ctrl+K o /) y verificación de credenciales
- `app-state.js` estado, suscripciones, reconciliación de expedientes, kiosco con PIN, vista previa
- `actions.js` toda escritura: valida reglas, operaciones de varios pasos con deshacer, candados
- `app-render.js` rutas, navegación, encierro del kiosco
- `view-*.js` vistas
- `styles-xp.css` experiencia v2: Mi ruta, avisos, celebración, credencial, portada con recorrido, Hoy, embudo, calendario, búsqueda, esqueletos

## Publicar la versión real

Capacidades: `db` con `rules: DB_RULES`, `user` con `scopes:["profile"]` y `downloads`.
Cada vez que cambian las `DB_RULES` (por ejemplo, `solicitudes/{self}` para la rotación de duos) hay que volver a publicar.
Acceso: Editor = administración; Colaborador = postulante o técnico; el evaluador externo usa el kiosco.
