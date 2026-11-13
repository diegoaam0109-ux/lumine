#!/bin/bash
# Render de prueba de la presentación: genera el PPTX, el PDF y una imagen por lámina en r2/.
set -e
cd "$(dirname "$0")"
NOMBRE=Lumine_Avance2_Solemne2_Control_de_Gestion
node deck.js "../$NOMBRE.pptx"
SOFFICE="/c/Program Files/LibreOffice/program/soffice.exe"
P="$TEMP/lo_tig_pp"; rm -rf "$P"; cp -r lo_es "$P"
"$SOFFICE" "-env:UserInstallation=file:///$(cygpath -m "$P")" --headless --convert-to pdf --outdir .. "../$NOMBRE.pptx" >/dev/null 2>&1
rm -rf "$P"
D=r$(date +%s); mkdir -p $D && pdftoppm -jpeg -r 60 "../$NOMBRE.pdf" $D/s && echo $D
