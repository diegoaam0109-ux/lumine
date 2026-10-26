# Prompt para Codex

## Primera vez (pegar tal cual)

```
Hola. Te sumas al equipo de Lumine Motors (Diego Alarcón, Benjamín Torres y Lukas Verdugo, UNAB). En este repositorio
ya trabaja Claude; tú vas a trabajar en paralelo, así que lo primero es no pisar nada.

Antes de cambiar cualquier cosa:
1. Lee AGENTS.md y CLAUDE.md completos. Son las reglas del equipo, las decisiones tomadas y los pendientes. Síguelas.
2. Lee codex/LEEME.md, codex/BITACORA.md y codex/REVISAR.md.
3. Lee todas las skills de .claude/skills/*/SKILL.md (empieza por lumine-reglas y lumine-git-entrega).
4. Mira git log --oneline -30 y README.md para ver en qué quedó cada parte.
5. Comprueba que el entorno funciona sin cambiar archivos del repositorio: npm test en la raíz y, en ventas/,
   npm install && npm run typecheck. Si algo falla, no lo arregles todavía: anótalo.

Después haz la revisión de codex/REVISAR.md, sección «Primera revisión»: solo lectura, sin commits.
Respóndeme en español de Chile, corto y directo:
- Qué entendiste de cada parte del repositorio (una línea por parte).
- Las 10 reglas que no vas a romper, en tus palabras.
- Lo que encontraste en la revisión: problema, archivo y línea, gravedad (alta/media/baja) y la corrección que propones.
- Lo que no te quedó claro o que choca entre documentos.
No cambies nada hasta que te diga qué quiero que hagas. Cuando te lo diga, trabaja en una rama codex/<tema>,
nunca en main ni en ramas claude/*, y no abras pull requests.
```

## Para cada tarea siguiente (plantilla)

```
Tarea: <qué quiero, en una o dos frases>.
Carpeta: <ventas/ | raíz (Habilita) | fase-3/ | ...>.
Antes: lee AGENTS.md, la última entrada de codex/BITACORA.md y las skills que AGENTS.md indica para esa carpeta.
Rama: codex/<tema> desde origin/main actualizado.
Reglas: no inventes datos («Por confirmar»), las decisiones de negocio abiertas se preguntan, corre las pruebas de la
carpeta y verifica con capturas si es visual (PC y teléfono, oscuro y claro).
Al terminar: commit y push en tu rama (sin pull request), una entrada en codex/BITACORA.md y un resumen de 5 líneas:
qué cambió, cómo lo probaste, qué hay que republicar y qué falta decidir.
```

## Para pedirle una revisión del trabajo de Claude

```
Revisa los últimos commits de la rama <rama> (git log origin/main..origin/<rama>) como un revisor exigente.
Busca: datos inventados o sin fuente, promesas prohibidas, errores de lógica, pruebas que faltan, textos que no son
español de Chile, problemas visuales (verifícalos con capturas) y secretos o datos personales.
No cambies nada: dame una lista con archivo y línea, gravedad y corrección propuesta. Anota el resumen en codex/BITACORA.md
solo si te lo pido.
```
