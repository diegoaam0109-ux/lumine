#!/usr/bin/env bash
# Renderiza los videos y sus portadas en salida/.
# Uso: bash render.sh                (los dos de la Fase 3, sin audio)
#      bash render.sh Tiktok         (el vertical con narración; antes: narracion/narrar.py y musica.py)
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
for id in "${@:-Comercial Habilita}"; do
  for v in $id; do
    case $v in
      Comercial) nombre=Video_01_Comercial_Lumine; ultimo=599; audio=--muted ;;
      Habilita)  nombre=Video_02_Lumine_Habilita; ultimo=539; audio=--muted ;;
      Tiktok)    nombre=Video_03_Kit_Lumine_vertical; ultimo=75; audio="--audio-codec=aac --audio-bitrate=192k" ;;
      *) echo "Composición desconocida: $v"; exit 1 ;;
    esac
    # shellcheck disable=SC2086
    npx remotion render src/index.ts "$v" "salida/$nombre.mp4" $audio --log=error
    npx remotion still src/index.ts "$v" "salida/${nombre}_portada.png" --frame="$ultimo" --log=error
  done
done
ls -la salida
