#!/usr/bin/env bash
# Prepara las herramientas de audio para editar TikTok de Lumine (todo gratis y sin conexión una vez descargado).
# Uso (desde cualquier carpeta): bash videos/narracion/preparar.sh
# Deja en ~/.cache/lumine-voz:
#   venv/        Python con sherpa-onnx (reconocimiento), piper-tts (fonética), soundfile, scipy y onnxruntime
#   parakeet/    Parakeet TDT 0.6b v3 int8: reconoce español con el tiempo de cada palabra (≈490 MB)
# y clona las skills oficiales de Remotion en .claude/skills (no se suben al repositorio).
# Hugging Face está bloqueado en la red de las sesiones: los modelos vienen del espejo de sherpa-onnx en GitHub.
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
CACHE="${LUMINE_VOZ:-$HOME/.cache/lumine-voz}"
mkdir -p "$CACHE"
if [ ! -x "$CACHE/venv/bin/python" ]; then
  python3 -m venv "$CACHE/venv"
  "$CACHE/venv/bin/pip" install -q sherpa-onnx soundfile scipy numpy onnxruntime piper-tts
fi
if [ ! -f "$CACHE/parakeet/tokens.txt" ]; then
  curl -sSL https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2 | tar xj -C "$CACHE"
  mv "$CACHE/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8" "$CACHE/parakeet"
fi
if [ ! -d "$RAIZ/.claude/skills/remotion-best-practices" ]; then
  tmp="$(mktemp -d)"
  GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/remotion-dev/skills "$tmp/skills"
  cp -r "$tmp/skills/skills/remotion-best-practices" "$RAIZ/.claude/skills/"
  rm -rf "$tmp"
fi
( cd "$RAIZ/videos" && [ -d node_modules ] || npm install --no-audit --no-fund )
echo "Listo. Python: $CACHE/venv/bin/python · Parakeet: $CACHE/parakeet"
