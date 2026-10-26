#!/usr/bin/env python3
"""Crea en .agents/skills/ (donde Codex busca skills) un acceso a cada skill de .claude/skills/.

La fuente única de cada skill es .claude/skills/<nombre>/SKILL.md: Claude la carga desde ahí.
Codex recibe un SKILL.md corto con el mismo nombre y la misma descripción (para que se active igual)
que le dice leer el original. Así nunca hay dos versiones distintas y funciona en Windows (sin enlaces simbólicos).

Uso:  python3 codex/sincronizar-skills.py           # regenera
      python3 codex/sincronizar-skills.py --revisar # falla si .agents/skills está desactualizado
"""
import pathlib
import re
import shutil
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / '.claude' / 'skills'
DESTINO = RAIZ / '.agents' / 'skills'

PLANTILLA = """---
name: {nombre}
description: {descripcion}
---

<!-- Generado por codex/sincronizar-skills.py. No editar: edita .claude/skills/{nombre}/SKILL.md y vuelve a correr el script. -->

# {nombre}

Esta skill vive en `.claude/skills/{nombre}/` (la comparten Claude y Codex).

1. Lee completo `.claude/skills/{nombre}/SKILL.md` y síguelo como si estuviera aquí.
2. Las rutas relativas que mencione (scripts, data, references) son relativas a `.claude/skills/{nombre}/`.
"""


def frontmatter(texto):
    m = re.match(r'^---\n(.*?)\n---\n', texto, re.S)
    if not m:
        return None
    campos = {}
    for linea in m.group(1).splitlines():
        if ':' in linea:
            k, v = linea.split(':', 1)
            campos[k.strip()] = v.strip()
    return campos


def esperado():
    salida = {}
    for skill in sorted(ORIGEN.glob('*/SKILL.md')):
        fm = frontmatter(skill.read_text(encoding='utf-8'))
        if not fm or 'name' not in fm or 'description' not in fm:
            sys.exit(f'{skill}: falta name o description en el encabezado')
        salida[fm['name']] = PLANTILLA.format(nombre=fm['name'], descripcion=fm['description'])
    return salida


def main():
    skills = esperado()
    if '--revisar' in sys.argv:
        actuales = {p.parent.name: p.read_text(encoding='utf-8') for p in DESTINO.glob('*/SKILL.md')}
        if actuales != skills:
            sys.exit('.agents/skills está desactualizado: corre python3 codex/sincronizar-skills.py')
        print(f'ok: {len(skills)} skills sincronizadas')
        return
    if DESTINO.exists():
        shutil.rmtree(DESTINO)
    for nombre, contenido in skills.items():
        (DESTINO / nombre).mkdir(parents=True)
        (DESTINO / nombre / 'SKILL.md').write_text(contenido, encoding='utf-8')
    print(f'listo: {len(skills)} skills en {DESTINO.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
