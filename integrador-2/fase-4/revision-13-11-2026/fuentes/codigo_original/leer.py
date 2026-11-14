"""Lee un libro recalculado y devuelve series mensuales y cifras anuales por clave."""
import json
from openpyxl import load_workbook
def leer(path, mp='base_raw.xlsx.map.json'):
    M = json.load(open(mp)); wb = load_workbook(path, data_only=True)
    wm, wa = wb['Mensual'], wb['Anual']
    mens = {k: [wm.cell(r, M['C0'] + c).value for c in range(M['N'])] for k, r in M['ROW'].items()}
    an = {k: [wa.cell(r, j).value for j in range(2, 12)] for k, r in M['AROW'].items()}   # Piloto,Trans,Preap,Año0,A1..A5,Total
    return mens, an, M
if __name__ == '__main__':
    import sys
    for e in sys.argv[1:]:
        mens, an, M = leer('out_e%s/tmp_e%s.xlsx' % (e, e))
        f = lambda v: 'None' if v is None else ('%.1f' % v if isinstance(v, (int, float)) else str(v))
        print('=== escenario', e)
        for k in ('ped', 'canc', 'inst', 'pfin', 'duos', 'espera', 'compra', 'ifin', 'n_tot', 'n_tec'):
            print('%-8s' % k, [f(v) for v in an[k][3:9]])
        for k in ('ing', 'ired', 'mc', 's_tot', 'o_tot', 'k_tot', 'x_tot', 'fijo', 'res', 'e_tot', 'flujo', 'acum', 's_soc'):
            print('%-8s' % k, ['%.1f' % ((v or 0) / 1e6) for v in an[k][:9]])
        print('mcu', [round(v or 0) for v in an['mcu'][4:9]], 'peq', [round(v or 0) for v in an['peq'][4:9]], 'uso', [round((v or 0), 2) for v in an['usoa'][4:9]])
        wa = __import__('openpyxl').load_workbook('out_e%s/tmp_e%s.xlsx' % (e, e), data_only=True)['Anual']
        print('fin requerido', wa.cell(M['AROW']['fin'], 2).value, 'mes cal', wa.cell(M['AROW']['finmes'], 2).value, 'eq mes', wa.cell(M['AROW']['eqmes'], 2).value, 'caja mes', wa.cell(M['AROW']['cajames'], 2).value)
        if e == '2':
            for k in ('cot', 'cob', 'conv', 'ped', 'cap', 'inst', 'pfin', 'espera', 'compra', 'recep', 'ifin', 'flujo', 'acum'):
                print('%-7s' % k, [f(v) if k not in ('flujo', 'acum') else '%.1f' % (v / 1e6) for v in mens[k][12:34]])
