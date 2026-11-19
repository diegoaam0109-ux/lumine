#!/usr/bin/env python3
"""Revisión del 15-11-2026: controles independientes y conciliación de la recuperación del capital de trabajo.

1) Los controles de la hoja Controles que, tras quitar las hojas de la v6, comparaban una celda consigo misma (siempre 0)
   pasan a comparar dos cálculos por caminos distintos: detalle de la hoja 1 contra el calendario mensual (A1), EBITDA de la
   hoja 2 contra el armado del flujo puro, y la recuperación del capital de trabajo contra el saldo recuperable más la parte
   del déficit que financió pérdidas.
2) La hoja 3 suma la conciliación de la recuperación: saldo de activos operativos netos al cierre + parte del déficit
   inicial que no se convirtió en activos (pérdidas del arranque que el flujo del año 1 ya resta).

Uso: python3 controles.py entrada.xlsx salida.xlsx
"""
import copy
import sys
import openpyxl

ENT, SAL = sys.argv[1], sys.argv[2]
w = openpyxl.load_workbook(ENT)
c = w['Controles']
kt = w['3 Capital de trabajo']


def fila(ws, texto, col=2):
    for r in range(1, ws.max_row + 1):
        v = ws.cell(r, col).value
        if isinstance(v, str) and v.strip().startswith(texto):
            return r
    raise SystemExit(f'No se encontró «{texto}» en {ws.title}')


CT = "'3 Capital de trabajo'"
# ---------------------------------------------------------------- 1. Conciliación en la hoja 3
r0 = kt.max_row + 2
plantilla_t = kt.cell(fila(kt, 'Método aplicado'), 2)
plantilla_e = kt.cell(fila(kt, 'Capital de trabajo inicial (año 0)'), 2)
plantilla_v = kt.cell(fila(kt, 'Capital de trabajo inicial (año 0)'), 3)
kt.cell(r0, 2).value = 'Conciliación de la recuperación del capital de trabajo (año 5)'
kt.cell(r0, 2)._style = copy.copy(plantilla_t._style)
filas = [
    ('Saldo de activos operativos netos al cierre del año 5 (inventario, tránsito e IVA, menos anticipos de clientes)',
     f'={CT}!$H$16'),
    ('Parte del déficit inicial que no quedó como activo: financió las pérdidas de la caja operativa del arranque, que el flujo '
     'del año 1 ya resta (déficit máximo menos el aumento de activos del año 1)',
     f'=IF(Datos!$C$23=1,{CT}!$C$20-({CT}!$D$16-{CT}!$C$16),0)'),
    ('Recuperación registrada en el año 5 (método contable del valor de desecho, Sapag Chain et al., 2014: se recupera todo lo invertido)', f'={CT}!$H$24'),
    ('Diferencia (debe ser cero)', None),
]
for i, (et, f) in enumerate(filas, start=1):
    r = r0 + i
    kt.cell(r, 2).value = et
    kt.cell(r, 2)._style = copy.copy(plantilla_e._style)
    kt.cell(r, 3)._style = copy.copy(plantilla_v._style)
    kt.cell(r, 3).value = f if f else f'=C{r0 + 3}-Datos!$C$34*(C{r0 + 1}+C{r0 + 2})'
    kt.row_dimensions[r].height = 30
nota = r0 + 6
kt.cell(nota, 2).value = (
    'La segunda línea no es un saldo de caja que exista al cierre: es dinero que se gastó en las pérdidas del primer año. El '
    'método del déficit acumulado máximo (Sapag, 2014) lo cuenta como inversión en el año 0 y lo devuelve en el año 5, de modo '
    'que su costo neto en el VAN es el valor del dinero en el tiempo. Con Datos!C23 = 0 (método del saldo) el capital de trabajo '
    'sigue el saldo de activos año a año, las pérdidas quedan solo en el flujo operacional y se recupera exactamente el saldo de '
    'la primera línea. Recuperar solo la primera línea sin cambiar la inversión del año 0 contaría dos veces esas pérdidas.')
kt.cell(nota, 2)._style = copy.copy(kt.cell(fila(kt, 'Método del déficit acumulado máximo'), 2)._style)
kt.merge_cells(start_row=nota, start_column=2, end_row=nota, end_column=8)
kt.row_dimensions[nota].height = 92

# ---------------------------------------------------------------- 2. Controles independientes
INV, IC, FP, A1 = "'1 Inversión'", "'2 Ingresos y costos'", "'4 Flujo puro'", "'A1 Calendario inversión'"
fi = lambda t: fila(w['1 Inversión'], t)
ic = lambda t: fila(w['2 Ingresos y costos'], t)
fp = lambda t: fila(w['4 Flujo puro'], t)
a1 = lambda t: fila(w['A1 Calendario inversión'], t)
af = fi('Total activo fijo')
pm = fi('Total gastos de puesta en marcha')
de = fi('Desembolso total antes de abrir')
eb = ic('Resultado antes de depreciación, intereses e impuestos')
eb4 = fp('EBITDA')
fcl = fp('Flujo de caja libre (FCL)')
fco = fp('Flujo de caja operacional')
inv0 = fp('Inversión dinamómetro de chasis')
NUEVOS = {
    '1 Inversión: activo fijo inicial': (f"={INV}!E{af}-{A1}!I{a1('Activos fijos')}",
                                         'detalle de la hoja 1 contra el calendario mensual (A1)'),
    '1 Inversión: puesta en marcha': (f"={INV}!F{pm}-{A1}!I{a1('Puesta en marcha')}",
                                      'detalle anual contra el calendario mensual (A1)'),
    '1 Inversión: desembolso previo': (f"={INV}!C{de}-{A1}!I{a1('Desembolso sin capitalizar')}",
                                       'hoja 1 contra la suma mensual de la preapertura (A1)'),
    '2 Ingresos y costos: EBITDA año 1': (f"={IC}!D{eb}-{FP}!D{eb4}", 'hoja 2 contra el armado del flujo puro'),
    '2 Ingresos y costos: EBITDA año 5': (f"={IC}!H{eb}-{FP}!H{eb4}", 'hoja 2 contra el armado del flujo puro'),
    '3 Capital de trabajo: saldo al cierre año 5': (f'={CT}!C{r0 + 4}',
                                                   'recuperación contra saldo recuperable + pérdidas financiadas'),
    '4 Flujo puro: flujo de caja': (f"=SUM({FP}!C{fcl}:H{fcl})-SUM({FP}!D{fco}:H{fco})-SUM({FP}!C{inv0}:H{fcl - 1})",
                                    'total contra la suma de sus componentes'),
}
hechos = 0
for r in range(1, c.max_row + 1):
    et = c.cell(r, 2).value
    if isinstance(et, str) and et in NUEVOS:
        f, que = NUEVOS[et]
        c.cell(r, 3).value = f
        c.cell(r, 2).value = f'{et} ({que})'
        hechos += 1
assert hechos == len(NUEVOS), f'se reemplazaron {hechos} de {len(NUEVOS)} controles'
w.save(SAL)
print(f'controles independientes: {hechos}; conciliación del capital de trabajo en la hoja 3, fila {r0}')
