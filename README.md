# Lumine Motors

Repositorio de Lumine Motors Chile SpA: kit de hibridación para autos de tracción delantera (motor eléctrico en el eje trasero, motor original intacto).
Equipo: Diego Alarcón, Benjamín Torres y Lukas Verdugo · UNAB.

| Carpeta | Qué es |
|---|---|
| `/` (`src/`, `dist/`, `build.py`, `tests/`) | **Lumine Habilita**: selección y habilitación por competencias del técnico instalador (app de capacitación). |
| `ventas/` | **Página comercial** para particulares y flotas (React + Tailwind + framer-motion). |
| `control-de-gestion/` | **Presentación del curso Control de Gestión**: PPT, PDF, guion y generador. |
| `integrador-2/` | **Curso Integrador II: Taller de Empresas** (Fase 3): kit de identidad visual (logo, fondos, imágenes, fuentes, paleta) y presentación. |
| `entrega3/`, `entrega4/` | **Trabajo final de IA aplicada**: estimador de ahorro con IA, prototipo, informes y revisión multi-IA. |
| `fase-3/` | **Presentación de la Fase 3 de Integrador II** (Capítulo III: marketing, operaciones y RR.HH.): PPT, PDF, guion y generador. |
| `solemne-2/` | **Solemne 2 de Control de Gestión**: mapa estratégico y CMI de Lumine (PPT, PDF, guion, respaldo y generador). |
| `control-3/` | **Control 3 de Control de Gestión** (Avance 1 del TIG): comprensión del negocio y análisis estratégico (PPT, PDF, guion, manual de defensa y generador). |
| `.claude/skills/` | Skills que Claude carga solo: `ui-ux-pro-max` (diseño de interfaces) y `lumine-marca` (sistema visual de Lumine). |
| `CLAUDE.md` | Contexto del proyecto para Claude: quién es quién, decisiones, preferencias y pendientes. |

### Para empezar una sesión de Claude

Abre una sesión nueva en claude.ai/code con este repositorio (rama `main`) y pega como primer mensaje:

```
Hola. Soy parte del equipo de Lumine Motors y voy a seguir el trabajo que hizo Diego con Claude en este repositorio.
Antes de hacer cualquier cosa, carga el contexto completo:
1. Lee CLAUDE.md entero: ahí están las reglas del equipo, las decisiones tomadas y los pendientes. Síguelas.
2. Lee README.md, CAMBIOS.md, ventas/README.md, control-de-gestion/README.md y control-de-gestion/GUION.md.
3. Revisa las skills de .claude/skills/ (lumine-marca y ui-ux-pro-max) y úsalas en todo lo que tenga diseño o la marca.
4. Mira git log para ver en qué quedó cada parte.
Cuando termines, respóndeme en español con un resumen corto: qué es cada parte del repositorio (Habilita, página comercial,
presentación y entregas 3 y 4), qué decisiones ya están tomadas, qué preguntas siguen abiertas y qué me recomiendas hacer
ahora. No cambies nada hasta que te diga qué quiero hacer.
```

### Para trabajar desde tu computador (Claude instalado)

Si tu Claude corre en tu computador y no tiene Git, pega esto primero; después usa el prompt de arriba:

```
Quiero dejar este computador listo para trabajar en el repositorio de Lumine con commit y push. Ve paso a paso y
avísame antes de cada instalación:
1. Detecta el sistema operativo.
2. Instala Git y GitHub CLI (gh). Windows: winget install --id Git.Git -e y winget install --id GitHub.cli -e.
   macOS: brew install git gh (o xcode-select --install para Git). Linux: el gestor de paquetes.
3. Configura mi nombre y correo de Git (pregúntamelos).
4. Inicia sesión en GitHub con gh auth login (por el navegador) y luego gh auth setup-git.
   Confirma con gh repo view diegoaam0109-ux/lumine --json viewerPermission que tengo permiso WRITE o ADMIN;
   si no, avísame: tengo que aceptar la invitación de colaborador que me mandó Diego.
5. Clona https://github.com/diegoaam0109-ux/lumine en una carpeta de trabajo nueva. Si hiciste cambios en la copia
   bajada como .zip, pásalos al clon y muéstramelos antes de guardar nada; después borra la copia del .zip.
6. Instala Node.js 20 o superior y Python 3 si faltan. Solo si voy a regenerar la presentación: LibreOffice con
   Impress y las fuentes de control-de-gestion/fuentes.
7. Comprueba que todo funciona: git status y npm test en la raíz del clon.
8. Vuelve a leer CLAUDE.md y sigue sus reglas. Trabaja siempre en una rama propia y pregúntame antes de pasar algo a main.
Al final dime en una lista corta qué quedó instalado y si algo falló.
```

## Lumine Habilita

Selección y habilitación por competencias del Técnico Instalador de Lumine Motors.
Un solo código genera dos HTML autocontenidos:

| Archivo | Para qué | Base de datos |
|---|---|---|
| `dist/lumine-habilita-demo.html` | Mostrar y probar (compartible) | Simulada en el navegador (MemDB), se reinicia cada día |
| `dist/lumine-habilita.html` | Operación real dentro de claude.ai | Base del artifact (`db`), con las reglas de `DB_RULES` |

### Trabajar

```bash
python3 build.py          # une src/ en dist/
npm test                  # reglas (logic) + capa de datos (store), sin navegador
npm install && npx playwright install chromium   # una vez
npm run e2e               # PC, tablet y teléfono, claro y oscuro, flujos completos
```

El orden de los archivos está en `manifest.json` (lo usan el build y las pruebas).

### Estructura de `src/`

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

### Publicar la versión real

Capacidades: `db` con `rules: DB_RULES`, `user` con `scopes:["profile"]` y `downloads`.
Cada vez que cambian las `DB_RULES` (por ejemplo, `solicitudes/{self}` para la rotación de duos) hay que volver a publicar.
Acceso: Editor = administración; Colaborador = postulante o técnico; el evaluador externo usa el kiosco.
