# Espacio de Codex

Carpeta para que Codex se sume al equipo sin pisar el trabajo de Claude ni de las personas.

| Archivo | Para qué |
|---|---|
| `PROMPT.md` | Mensaje para pegar al abrir Codex con este repositorio (primera vez y tareas siguientes). |
| `REVISAR.md` | Lo que Codex debe revisar: pendientes, inconsistencias conocidas y puntos frágiles, con dónde mirar. |
| `BITACORA.md` | Traspasos entre agentes: cada uno anota qué hizo, cómo lo verificó y qué quedó pendiente. |
| `sincronizar-skills.py` | Copia el acceso de cada skill de `.claude/skills/` a `.agents/skills/`, donde Codex las busca. |

Además, en la raíz:

- `AGENTS.md`: instrucciones que Codex lee solo (reglas, qué skill usar, pruebas, trampas). Remite a `CLAUDE.md`.
- `.claude/skills/`: las 11 skills del equipo (fuente única). `.agents/skills/`: el acceso para Codex (generado).

## Skills disponibles

| Skill | Qué enseña | Nueva |
|---|---|---|
| `lumine-reglas` | No inventar datos, promesas prohibidas, fuentes de verdad, qué se decide y qué se pregunta | sí |
| `lumine-git-entrega` | Ramas por agente, commits, push sin PR, zip, bitácora, republicar artefactos | sí |
| `lumine-habilita` | App de capacitación: build, pruebas, `DB_RULES`, decisiones D13/D17/D18 | sí |
| `lumine-ventas` | Página comercial: datos, build de artefacto, trampa del CSS, recorrido 3D | sí |
| `lumine-generador-ppt` | Presentaciones por código: `deck.js`, `guion.js`, `render.sh`, fuentes incrustadas, escala `TX` | sí |
| `lumine-verificacion-visual` | Capturas PC/teléfono, oscuro/claro, con el Chromium instalado; qué mirar | sí |
| `lumine-entregas-ia` | Estimador de ahorro: reproducir, datos sintéticos vs reales, no maquillar métricas | sí |
| `lumine-redaccion` | Español de Chile, estándar del profesor Brito, sin tics de IA | sí |
| `lumine-marca` | Sistema visual y voz de Lumine | ya existía |
| `presentaciones` | Método: una idea por lámina, tiempo según rúbrica, anexo para la defensa | ya existía |
| `ui-ux-pro-max` | Base de datos de diseño de interfaces (MIT) | ya existía |

## Si Codex no carga las skills solo

Algunas versiones de Codex buscan las skills en `~/.codex/skills/` o `~/.agents/skills/` en vez del repositorio.
Desde la raíz del repositorio (Git Bash en Windows):

```bash
mkdir -p ~/.agents/skills && cp -r .claude/skills/* ~/.agents/skills/
```
Igual funciona sin eso: `AGENTS.md` le dice a Codex qué `SKILL.md` leer en cada caso.
