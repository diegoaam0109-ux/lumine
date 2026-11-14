#!/bin/bash
# genera el libro, lo recalcula con LibreOffice para cada escenario y deja Base_central.xlsx recalculado
set -e
cd "$(dirname "$0")"
python3 modelo.py base_raw.xlsx
for e in 1 3 2; do
  python3 - <<PY
from openpyxl import load_workbook
wb=load_workbook('base_raw.xlsx'); ws=wb['Supuestos']
for r in ws.iter_rows(min_row=2):
    if r[0].value=='esc': r[2].value=$e
wb.save('tmp_e$e.xlsx')
PY
  rm -rf out_e$e && mkdir out_e$e
  timeout 180 soffice --headless --convert-to xlsx --outdir out_e$e tmp_e$e.xlsx >/dev/null 2>&1
done
ls -la out_e*/
