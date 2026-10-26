# Lumine Motors · instrucciones para Codex (y cualquier agente)

Codex lee este archivo solo. El contexto completo del proyecto está en **`CLAUDE.md`**: léelo entero antes de trabajar.
Vale igual para ti aunque diga «Claude»: las reglas, decisiones y pendientes son del equipo, no de una herramienta.

## Antes de empezar cualquier tarea

1. Lee `CLAUDE.md`, `codex/BITACORA.md` (qué hizo el último agente) y `codex/REVISAR.md` (lo que te toca mirar).
2. `git status` y `git log --oneline -15`. Crea tu rama: `codex/<tema>`. No trabajes en `main` ni en ramas `claude/*`.
3. Carga la skill que corresponde a la carpeta que vas a tocar (tabla abajo). Siempre: `lumine-reglas`.

## Diez reglas que no se rompen

1. **Nunca inventes datos.** Lo que no existe es «Por confirmar» (precio, garantía, instalación, contacto). El 20% de ahorro
   es una estimación de ingeniería, no una medición.
2. Nunca escribas «cero emisiones», «20% garantizado», «homologado» ni «exento de restricción».
3. Español de Chile, directo, sin relleno ni emojis.
4. **El repositorio es público**: sin claves, `.env`, datos personales, nombres de entrevistados ni los .docx de los informes.
5. Las decisiones de negocio abiertas (`CLAUDE.md` › Pendientes) **se preguntan**; el diseño y la calidad los decides tú.
6. Los archivos generados se regeneran con su script; nunca se editan a mano (`dist/`, `GUION.md`, PPTX, PDF).
7. Corre las pruebas de lo que tocaste antes de cada commit. Si fallan, no hay commit.
8. Lo visual se verifica con capturas en PC y teléfono, oscuro y claro. «Compila» no es «está listo».
9. Commit y push en tu rama. **No abras pull requests** ni hagas force-push salvo que te lo pidan.
10. Al terminar: entrada en `codex/BITACORA.md`, zip con `git archive`, y avisa si algo publicado hay que republicar
    (eso solo lo puede hacer una sesión de Claude con la cuenta de Diego).

## Qué skill usar

Las skills viven en `.claude/skills/` (fuente única) y tienen un acceso en `.agents/skills/` para Codex.

| Si vas a tocar… | Skills |
|---|---|
| Cualquier cosa | `lumine-reglas`, `lumine-git-entrega` |
| `src/`, `build.py`, `manifest.json`, `dist/`, `tests/` (Habilita) | `lumine-habilita`, `lumine-verificacion-visual`, `ui-ux-pro-max` |
| `ventas/` (página comercial) | `lumine-ventas`, `lumine-marca`, `lumine-verificacion-visual`, `ui-ux-pro-max` |
| `control-de-gestion/`, `fase-3/`, `integrador-2/presentacion/` | `presentaciones`, `lumine-generador-ppt`, `lumine-marca` |
| `entrega3/`, `entrega4/` | `lumine-entregas-ia`, `lumine-redaccion` |
| Informes, guiones, README, textos de venta | `lumine-redaccion`, `lumine-marca` (voz) |

Si creas o cambias una skill en `.claude/skills/`, corre `python3 codex/sincronizar-skills.py`.

## Pruebas por carpeta

| Carpeta | Comandos |
|---|---|
| Raíz (Habilita) | `python3 build.py && npm test && npm run e2e` |
| `ventas/` | `npm run typecheck && npm run lint && npm run build:artefacto && npm run e2e` |
| `*/generador/` | `./render.sh`, luego `pdffonts` y mirar cada `r/s-*.jpg` |
| `entrega3/prototipo/` | ver `entrega3/README.md` |
| Skills | `python3 codex/sincronizar-skills.py --revisar` |

## Trampas del entorno

- Playwright usa el Chromium ya instalado (`/opt/pw-browsers`): no ejecutes `playwright install` en la nube.
- En la nube están bloqueados Google Fonts, `ui.shadcn.com` y `preciocombustible.cl`; GitHub y npm funcionan
  (las fuentes salen de `@fontsource`).
- El visor de artefactos fuerza un fondo claro en `body`: los estilos base de `ventas/src/index.css` van fuera de `@layer`
  y con `!important`. No los «limpies».
- LibreOffice necesita las fuentes de `fuentes/` instaladas para el PDF; si `pdffonts` muestra Arial o DejaVu, está mal.

## Si no sabes algo

Pregunta en una línea, con la opción que recomiendas. No adivines cifras, normas ni decisiones del equipo.
