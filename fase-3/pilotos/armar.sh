#!/bin/bash
# Arma las tres láminas piloto del rediseño premium y sus vistas previas.
set -e
cd "$(dirname "$0")"
LUMINE_PILOTO=portada,ansoff,precio node ../generador/deck.js "$PWD/Lumine_Fase3_pilotos.pptx"
rm -rf lo_run && cp -r ../generador/lo_es lo_run
soffice "-env:UserInstallation=file://$PWD/lo_run" --headless --convert-to pdf Lumine_Fase3_pilotos.pptx >/dev/null 2>&1
rm -rf lo_run piloto-*.png && pdftoppm -png -r 110 Lumine_Fase3_pilotos.pdf piloto
