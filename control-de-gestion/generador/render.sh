#!/bin/bash
# Genera la presentación, la exporta a PDF con configuración regional es-CL (decimales con coma)
# y deja una imagen por diapositiva en r/ para revisarla.
# Requiere: node, LibreOffice (soffice) con Impress y pdftoppm; las fuentes de ../fuentes instaladas.
set -e
cd "$(dirname "$0")"
NOMBRE=Lumine_Analisis_Estrategico_Control_de_Gestion
node deck.js "../$NOMBRE.pptx"
rm -rf lo_run && cp -r lo_es lo_run
soffice "-env:UserInstallation=file://$PWD/lo_run" --headless --convert-to pdf --outdir .. "../$NOMBRE.pptx" >/dev/null 2>&1
rm -rf lo_run r && mkdir -p r && pdftoppm -jpeg -r 80 "../$NOMBRE.pdf" r/s
echo "listo: $(ls r | wc -l) diapositivas"
