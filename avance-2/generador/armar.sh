#!/bin/bash
# Arma deck.js: piezas comunes del TIG final + láminas de la Solemne 2 + anexo + tipografías incrustadas.
set -e
cd "$(dirname "$0")"
SRC=../../tig-final/generador/deck.js
{ echo "// Avance 2 del TIG = Solemne 2 · Control de Gestión (ICMA901, UNAB) · Lumine Motors · 17-11-2026"
  echo "// Contenidos evaluados: formulación OVA, ejes estratégicos, mapa y CMI. 10 láminas + portada (unos 12 minutos), bibliografía y anexo."
  echo "// Concepto visual del TIG final: «cuaderno de ingeniería». Base de datos al 12-11-2026. Generado por armar.sh: no editar a mano."
  sed -n '7,147p' $SRC; cat laminas.part.js anexo.part.js; echo; sed -n '789,869p' $SRC; } > deck.js
sed -i "s/pres.title = 'TIG · Informe final · Lumine Motors';/pres.title = 'TIG · Avance 2 · Solemne 2 · Lumine Motors';/; s/const OUT = process.argv\[2\] || 'Lumine_TIG_Final.pptx';/const OUT = process.argv[2] || 'Lumine_Avance2.pptx';/" deck.js
