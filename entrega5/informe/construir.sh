#!/bin/bash
# Genera el informe final, lo convierte a PDF y numera el índice (dos pasadas).
set -e
cd "$(dirname "$0")"
OUT=/tmp/render5; mkdir -p $OUT
for pasada in 1 2; do
  node generar_final.js
  soffice --headless --convert-to pdf ../TIG_IA_Grupo01_LumineMotors_InformeFinal.docx --outdir $OUT >/dev/null 2>&1
  python3 paginar_final.py $OUT/TIG_IA_Grupo01_LumineMotors_InformeFinal.pdf
done
node generar_final.js
soffice --headless --convert-to pdf ../TIG_IA_Grupo01_LumineMotors_InformeFinal.docx --outdir .. >/dev/null 2>&1
pdfinfo ../TIG_IA_Grupo01_LumineMotors_InformeFinal.pdf | grep Pages
