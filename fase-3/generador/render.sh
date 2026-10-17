#!/bin/bash
# Genera la presentación y el guion, exporta el PDF con configuración regional es-CL (decimales con coma)
# y deja una imagen por diapositiva en r/ para revisarla.
# Requiere: node, LibreOffice (soffice) con Impress y pdftoppm; las fuentes de ../fuentes instaladas.
# Funciona en Linux y en Git Bash para Windows.
set -e
cd "$(dirname "$0")"
NOMBRE=Lumine_Fase_3_Plan_de_Marketing_Operaciones_y_RRHH
node deck.js "../$NOMBRE.pptx"
node guion-md.js > ../GUION.md
SOFFICE=$(command -v soffice || echo "/c/Program Files/LibreOffice/program/soffice.exe")
PERFIL="$PWD/lo_run"
command -v cygpath >/dev/null && PERFIL="/$(cygpath -m "$PERFIL")"
rm -rf lo_run && cp -r lo_es lo_run
"$SOFFICE" "-env:UserInstallation=file://$PERFIL" --headless --convert-to pdf --outdir .. "../$NOMBRE.pptx" >/dev/null 2>&1
rm -rf lo_run r && mkdir -p r && pdftoppm -jpeg -r 80 "../$NOMBRE.pdf" r/s
echo "listo: $(ls r | wc -l) diapositivas"
