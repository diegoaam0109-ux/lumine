#!/bin/bash
# Arma deck-base.js: presentación base del Avance 2 (versión del equipo) + láminas 05 a 08 del TIG final + anexo con el Canvas.
set -e
cd "$(dirname "$0")"
SRC=../../tig-final/generador/deck.js
{ echo "// Avance 2 del TIG (Solemne 2) · versión del equipo reconstruida + Declaraciones, Entorno, Cinco fuerzas y Cruces del FODA."
  echo "// Coherente con el informe del Avance 2 (15-11-2026). Generado por armar-base.sh: no editar a mano."
  sed -n '7,147p' $SRC | sed "s#require('./guion.js')#require('./guion-base.js')#"
  cat laminas-base.part.js extraidas-base.js anexo-base.part.js; echo; sed -n '789,869p' $SRC; } > deck-base.js
sed -i "s/pres.title = 'TIG · Informe final · Lumine Motors';/pres.title = 'Lumine Motors · TIG Avance 2 · Control de Gestión';/" deck-base.js
NOMBRE=Lumine_TIG_Avance2_Control_de_Gestion
node deck-base.js "../$NOMBRE.pptx"
SOFFICE="/c/Program Files/LibreOffice/program/soffice.exe"
P="$TEMP/lo_base_pp"; rm -rf "$P"; cp -r lo_es "$P"
"$SOFFICE" "-env:UserInstallation=file:///$(cygpath -m "$P")" --headless --convert-to pdf --outdir .. "../$NOMBRE.pptx" >/dev/null 2>&1
rm -rf "$P"
D=r$(date +%s); mkdir -p $D && pdftoppm -jpeg -r 60 "../$NOMBRE.pdf" $D/s && echo $D
