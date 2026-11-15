#!/usr/bin/env python3
"""Limpieza final de textos (15-11-2026): el libro entregable no cita versiones internas ni archivos de trabajo, y las
referencias al capítulo anterior se escriben como en la tesis (Capítulo III). Solo cambia texto; ninguna fórmula ni valor.

Uso: textos.py ENTRADA SALIDA
"""
import re
import sys
import openpyxl

ENT, SAL = sys.argv[1:3]
w = openpyxl.load_workbook(ENT)

# Reemplazos exactos de celdas completas (hoja, celda) o por texto
POR_TEXTO = [
    (re.compile(r'^Calendario del Excel recibido; modificar duración exige revisar motor\.$'),
     'Calendario operativo del plan (Capítulo III).'),
    (re.compile(r'^Calendarios operativos recibidos'), 'Calendarios operativos'),
    (re.compile(r'^Piloto vigente: 1 Esencial y 2 Plus, según último Excel recibido\.$'),
     'Supuesto del equipo: piloto de 1 Esencial y 2 Plus.'),
    (re.compile(r'^Estimación heredada, sin cotización ni WBS$'),
     'Estimación del equipo: 2.050 horas de desarrollo, sin cotización ni desglose de tareas.'),
    (re.compile(r'^Supuesto heredado; no tarifa contratada$'), 'Supuesto del equipo; sin tarifa contratada.'),
    (re.compile(r'^Con 1 se recupera la evaluación anterior \(meses −17 a 0\)\.$'),
     'Con 1 se suman el piloto y la transición (meses −17 a −6).'),
    (re.compile(r'\. En la Fase 3: .*$'), '.'),
    (re.compile(r'^Fase 3: el arriendo parte con la preapertura$'), 'El arriendo parte con la preapertura.'),
    (re.compile(r'Reemplaza el 2% supuesto de la versión anterior\.'), ''),
    (re.compile(r'Cada indicador frente a la base \(supuestos vigentes al construir la v7, escenario central\)\. '
                r'Las columnas de escenario son fotos tomadas al construir\.'),
     'Cada indicador frente al escenario central con los supuestos de la hoja Datos. Las columnas de los escenarios '
     'pesimista y optimista se calculan al construir el libro.'),
    (re.compile(r'Supuesto provisional del equipo \(Fase 3\)'), 'Supuesto provisional del equipo (Capítulo III)'),
    (re.compile(r'Contraste bajo de la Fase 3'), 'Contraste bajo del Capítulo III'),
    (re.compile(r'la alternativa de dos dúos se compara en la Fase 3'), 'la alternativa de dos dúos se compara en el Capítulo III'),
    (re.compile(r'^Fase 3, (Tabla) (\d+)$'), r'Capítulo III, \1 N° \2'),
    (re.compile(r'^Fase 3, '), 'Capítulo III, '),
    (re.compile(r'^Fase 3$'), 'Capítulo III'),
    (re.compile(r'tomados del informe de la Fase 3'), 'tomados del Capítulo III'),
    (re.compile(r'reconstruir con construir_v7\.py'), 'reconstruir el libro'),
]
n = 0
for ws in w.worksheets:
    if ws.title.startswith('Motor'):
        continue
    for row in ws.iter_rows():
        for z in row:
            v = z.value
            if not isinstance(v, str) or v.startswith('=') and 'construir_v7' not in v:
                continue
            nuevo = v
            for pat, sub in POR_TEXTO:
                nuevo = pat.sub(sub, nuevo)
            nuevo = nuevo.replace('  ', ' ').strip() if nuevo != v else v
            if nuevo != v:
                z.value = nuevo
                n += 1
# La hoja Datos no lleva instrucciones de uso en su encabezado
d = w['Datos']
if isinstance(d['A2'].value, str) and d['A2'].value.startswith('Única hoja de entradas'):
    d['A2'] = None
# El registro de cambios entre versiones es un documento de trabajo: no va en el libro entregable
if 'Notas y cambios' in w.sheetnames:
    del w['Notas y cambios']
w.save(SAL)
print(f'Textos: {n} celdas corregidas')
