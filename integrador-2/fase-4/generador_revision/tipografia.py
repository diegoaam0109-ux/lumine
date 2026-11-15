#!/usr/bin/env python3
"""Tipografía del libro: Arial en todas las celdas, 12 pt como mínimo (los títulos y las cifras grandes del
Tablero conservan su tamaño mayor). Ensancha columnas y filas de alto fijo en la misma proporción para que
ningún número quede como ####. Solo formato.

Uso: tipografia.py ENTRADA SALIDA
"""
import copy
import sys
import openpyxl

ENT, SAL = sys.argv[1:3]
FUENTE, MINIMO = 'Arial', 12
# Arial es más ancha que Calibri y 12 pt es más grande que 10 u 11 pt
FACTOR = {'Motor': 1.3, 'Datos del tablero': 1.3}
w = openpyxl.load_workbook(ENT)
normal = next(s for s in w._named_styles if s.name == 'Normal')
normal.font = openpyxl.styles.Font(name=FUENTE, sz=MINIMO)
n = 0
for ws in w.worksheets:
    previo = []
    for row in ws.iter_rows():
        for z in row:
            if z.has_style or z.value is not None:
                f = copy.copy(z.font)
                f.name = FUENTE
                previo.append(f.sz or 11)
                if (f.sz or 11) < MINIMO:
                    f.sz = MINIMO
                z.font = f
                n += 1
    base = sum(previo) / len(previo) if previo else 11
    k = next((v for p, v in FACTOR.items() if ws.title.startswith(p)), 1.25 if base >= 10.5 else 1.3)
    for letra, dim in list(ws.column_dimensions.items()):
        if dim.width:
            dim.width = round(dim.width * k, 1)
    for r, dim in list(ws.row_dimensions.items()):
        if dim.height:
            dim.height = round(dim.height * 1.2, 1)
    ws.sheet_format.defaultRowHeight = 16
# Imagen ilustrativa del kit en la hoja 1.2 (debajo de su rótulo)
from pathlib import Path
from openpyxl.drawing.image import Image as XLImage
IMG = Path(__file__).resolve().parents[2] / 'identidad/imagenes/lumine-02-despiece.jpg'
if '1.2 Costo del kit' in w.sheetnames and IMG.exists():
    k = w['1.2 Costo del kit']
    fila = next(z.row for z in k['B'] if isinstance(z.value, str) and z.value.startswith('Imagen ilustrativa del kit'))
    im = XLImage(str(IMG))
    im.width, im.height = 480, 270
    k.add_image(im, f'C{fila + 1}')
    from openpyxl.worksheet.pagebreak import Break
    k.row_breaks.append(Break(id=fila - 1))
w.save(SAL)
print(f'Tipografía: {n} celdas en {FUENTE} con mínimo {MINIMO} pt')
