#!/usr/bin/env bash
# Renderiza los dos videos de la Fase 3 y sus portadas (último cuadro) en salida/.
# Uso: bash render.sh            (los dos)
#      bash render.sh Comercial  (uno)
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
for id in "${@:-Comercial Habilita}"; do
  for v in $id; do
    case $v in
      Comercial) nombre=Video_01_Comercial_Lumine; ultimo=599 ;;
      Habilita)  nombre=Video_02_Lumine_Habilita; ultimo=539 ;;
      *) echo "Composición desconocida: $v"; exit 1 ;;
    esac
    npx remotion render src/index.ts "$v" "salida/$nombre.mp4" --log=error
    npx remotion still src/index.ts "$v" "salida/${nombre}_portada.png" --frame="$ultimo" --log=error
  done
done
ls -la salida
