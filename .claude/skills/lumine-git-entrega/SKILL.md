---
name: lumine-git-entrega
description: Cómo trabajar con Git en el repositorio de Lumine junto a otros agentes (Claude, Codex) y personas, y cómo cerrar un bloque de trabajo (commit, push, zip con git archive, artefactos publicados). Úsala al empezar una tarea, antes de cada commit o push, y al terminar un bloque.
---

# Git y entrega en Lumine

En este repositorio trabajan tres personas y al menos dos agentes (Claude y Codex). El riesgo principal es pisarse.

## Al empezar

1. `git status` y `git log --oneline -15`: mira qué se hizo último y quién.
2. Lee `codex/BITACORA.md` (traspasos entre agentes) y `codex/REVISAR.md` (pendientes).
3. Trabaja en **una rama propia** (`codex/<tema>` para Codex; las sesiones de Claude usan `claude/<nombre>`).
   Nunca hagas commit directo en `main` ni en la rama de otro agente sin que te lo pidan.
4. Trae lo último: `git fetch origin && git merge origin/main` (merge, no rebase, si la rama ya está publicada).

## Durante

- Cambios chicos y enfocados en lo que se pidió. No reformatees archivos enteros ni renombres carpetas de pasada.
- No borres ni sobrescribas archivos generados a mano (PPTX, PDF, imágenes) sin regenerarlos con su script.
- Los archivos generados se regeneran con su herramienta, nunca a mano: `dist/*.html` con `python3 build.py`,
  `GUION.md` con `node guion-md.js`, el PPTX/PDF con `render.sh`, `package-lock.json` con `npm install`.

## Antes de cada commit

- Corre las pruebas de la parte que tocaste (tabla en `AGENTS.md`). Si fallan, no hagas commit «para arreglar después».
- `git diff --cached` completo. Revisa que no van secretos, `node_modules/`, `dist-artefacto/`, `.work/`, `r/` (renders)
  ni el informe .docx de Integrador.
- Mensaje en español, en presente y concreto, con el área al inicio cuando ayuda:
  `Fase 3: divide la lámina de demanda en dos`, `Página comercial: corrige el desborde del verificador en teléfono`.

## Push y pull requests

- `git push -u origin <tu-rama>`. Si falla por red, reintenta con espera creciente (2, 4, 8, 16 s).
- **No abras pull requests** salvo que el equipo lo pida. No hagas force-push sobre ramas ajenas.

## Al terminar un bloque

1. Commit y push en tu rama.
2. **Zip del código base** (lo pidió el equipo):
   `git archive --format=zip -o lumine-$(git rev-parse --short HEAD).zip HEAD`
3. **Artefactos publicados** (página comercial y Habilita, ver tabla en `CLAUDE.md`): solo se republican desde una sesión
   de Claude con permiso sobre la cuenta de Diego. Si cambiaste algo que va publicado, **anótalo en `codex/BITACORA.md`**
   con qué archivo hay que republicar (`ventas/dist-artefacto/index.html`, `dist/lumine-habilita*.html`) y si cambiaron
   las `DB_RULES`.
4. Una entrada en `codex/BITACORA.md`: fecha, rama, qué hiciste, cómo lo verificaste, qué quedó pendiente.
5. Resumen corto al equipo: qué cambió, cómo se probó, qué falta decidir.
