import json, subprocess, os, shutil
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill
from leer import leer
R = {}
for e in (1, 2, 3):
    mens, an, M = leer('out_e%d/tmp_e%d.xlsx' % (e, e))
    wa = load_workbook('out_e%d/tmp_e%d.xlsx' % (e, e), data_only=True)['Anual']
    R[e] = dict(mens=mens, an=an, fin=wa.cell(M['AROW']['fin'], 2).value, finmes=wa.cell(M['AROW']['finmes'], 2).value,
                eqmes=wa.cell(M['AROW']['eqmes'], 2).value, cajames=wa.cell(M['AROW']['cajames'], 2).value)
wb = load_workbook('base_raw.xlsx'); ws = wb['Escenarios']
H = PatternFill('solid', fgColor='0E2A47'); HF = Font(bold=True, color='FFFFFF')
ws.append(['Resultados por escenario (valores copiados tras recalcular el libro con cada selector; mismas reglas de capacidad, abastecimiento y dotación)'])
ws.append(['Concepto', 'Bajo', 'Central', 'Alto'])
for c in ws[2]: c.font = HF; c.fill = H
def add(label, f):
    ws.append([label] + [f(R[e]) for e in (1, 2, 3)])
add('Costo por cotización digital ($)', lambda r: None); ws.cell(ws.max_row, 2, 15000); ws.cell(ws.max_row, 3, 10000); ws.cell(ws.max_row, 4, 7500)
add('Conversión: primer mes → régimen (meses de rampa)', lambda r: None); ws.cell(ws.max_row, 2, '10% → 20% (12)'); ws.cell(ws.max_row, 3, '15% → 30% (12)'); ws.cell(ws.max_row, 4, '20% → 30% (6)')
for y in range(1, 6): add('Pedidos, año %d' % y, lambda r, y=y: round(r['an']['ped'][3 + y], 1))
for y in range(1, 6): add('Instalaciones, año %d' % y, lambda r, y=y: round(r['an']['inst'][3 + y], 1))
add('Instalaciones, cinco años', lambda r: round(sum(r['an']['inst'][4:9]), 1))
for y in range(1, 6): add('Dúos al cierre del año %d' % y, lambda r, y=y: r['an']['duos'][3 + y])
for y in range(1, 6): add('Dotación al cierre del año %d' % y, lambda r, y=y: r['an']['n_tot'][3 + y])
add('Espera máxima del primer año (semanas de capacidad)', lambda r: round(r['an']['espera'][4], 1))
for y in range(1, 6): add('Resultado operativo, año %d ($)' % y, lambda r, y=y: round(r['an']['res'][3 + y]))
for y in range(1, 6): add('Flujo de caja antes de financiamiento, año %d ($)' % y, lambda r, y=y: round(r['an']['flujo'][3 + y]))
add('Financiamiento requerido: mínimo del flujo acumulado ($)', lambda r: round(r['fin']))
add('Mes del calendario en que ocurre', lambda r: r['finmes'])
add('Primer mes de operación con resultado operativo positivo en doce meses (0 = no ocurre)', lambda r: r['eqmes'])
ws.column_dimensions['A'].width = 80
for c in 'BCD': ws.column_dimensions[c].width = 20
wb.save('base_final_raw.xlsx')
shutil.rmtree('out_f', ignore_errors=True); os.mkdir('out_f')
subprocess.run('timeout 180 soffice --headless --convert-to xlsx --outdir out_f base_final_raw.xlsx >/dev/null 2>&1', shell=True)
shutil.copy('out_f/base_final_raw.xlsx', 'Lumine_Base_de_calculo_Fases_1_a_3.xlsx')
# comprobaciones
mens, an, M = leer('Lumine_Base_de_calculo_Fases_1_a_3.xlsx')
wbf = load_workbook('Lumine_Base_de_calculo_Fases_1_a_3.xlsx'); nf = sum(1 for w in wbf for row in w.iter_rows() for c in row if isinstance(c.value, str) and c.value.startswith('='))
err = sum(1 for w in load_workbook('Lumine_Base_de_calculo_Fases_1_a_3.xlsx', data_only=True) for row in w.iter_rows() for c in row if isinstance(c.value, str) and c.value.startswith('#'))
print('fórmulas', nf, '| errores', err)
ok1 = all(abs((mens['pini'][i] - mens['canc'][i] + mens['ped'][i] - mens['inst'][i]) - mens['pfin'][i]) < 1e-6 for i in range(M['N']))
ok2 = all(abs((mens['iini'][i] + mens['recep'][i] - mens['inst'][i]) - mens['ifin'][i]) < 1e-6 for i in range(M['N']))
ok3 = all(mens['inst'][i] <= mens['cap'][i] + 1e-9 and mens['inst'][i] <= mens['iini'][i] + mens['recep'][i] + 1e-9 for i in range(M['N']))
ok4 = abs(sum(mens['flujo']) - mens['acum'][-1]) < 1
print('pendientes concilian', ok1, '| inventario concilia', ok2, '| instalaciones dentro de capacidad y kits', ok3, '| caja acumulada', ok4)
json.dump({str(e): {'an': R[e]['an'], 'fin': R[e]['fin'], 'finmes': R[e]['finmes'], 'eqmes': R[e]['eqmes'], 'cajames': R[e]['cajames'], 'mens': R[e]['mens']} for e in R}, open('resultados.json', 'w'))
