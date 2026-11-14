#!/usr/bin/env python3
"""v7: aplica el formato del curso sobre la v6, recalcula con LibreOffice (es-CL), verifica y exporta el PDF.

Verificaciones: (1) los controles nuevos de la hoja Controles suman ~0; (2) los controles de la v6 siguen en ~0;
(3) cada valor numérico de las hojas de la v6 es idéntico antes y después. Si algo falla, no se publica nada.
"""
from pathlib import Path
import json, shutil, subprocess, sys, tempfile
import openpyxl

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
REPO = ROOT.parents[1]
V6 = ROOT / 'excel/v6_academico_conciliado.xlsx'
V7 = ROOT / 'excel/v7_formato_curso.xlsx'
PERFIL_ES = REPO / 'control-de-gestion/generador/lo_es'

with tempfile.TemporaryDirectory(prefix='lumine-v7-') as tmp:
    tmp = Path(tmp)
    perfil = tmp / 'perfil'
    shutil.copytree(PERFIL_ES, perfil)
    soffice = ['soffice', f'-env:UserInstallation={perfil.as_uri()}', '--headless']
    formato = tmp / 'formato.xlsx'
    subprocess.run([sys.executable, str(HERE / 'formato_profesor.py'), str(V6), str(formato)], check=True)

    def recalcular(entrada, carpeta):
        carpeta.mkdir()
        subprocess.run(soffice + ['--convert-to', 'xlsx', '--outdir', str(carpeta), str(entrada)], check=True, timeout=300,
                       stdout=subprocess.DEVNULL)
        return carpeta / entrada.name

    def leer(calc, mapa):
        m = json.load(open(mapa))
        d = openpyxl.load_workbook(calc, data_only=True)['Tablero datos']
        out = {k: [d.cell(r, c).value or 0 for c in range(2, 8)] for k, r in m['series'].items()}
        out.update({k: d.cell(r, 2).value for k, r in m['escalares'].items()})
        return out

    # 1) Tres pasadas, una por escenario de demanda, para la base y las fotos
    lecturas = {}
    for nombre in ('Pesimista', 'Central', 'Optimista'):
        x = tmp / f'esc_{nombre}.xlsx'
        subprocess.run([sys.executable, str(HERE / 'tablero.py'), str(formato), str(x), '--escenario', nombre], check=True)
        lecturas[nombre] = leer(recalcular(x, tmp / f'calc_{nombre}'), x.with_suffix('.mapa.json'))
        print(f"  {nombre}: VAN puro {lecturas[nombre]['van_p'] / 1e6:,.2f} MM, TIR {lecturas[nombre]['tir_p']}")
    json.dump(lecturas['Central'], open(tmp / 'base.json', 'w'))
    json.dump({k: lecturas[k] for k in ('Pesimista', 'Optimista')}, open(tmp / 'fotos.json', 'w'))
    # 2) Libro final, en escenario central, con base y fotos
    crudo = tmp / 'v7_formato_curso.xlsx'
    subprocess.run([sys.executable, str(HERE / 'tablero.py'), str(formato), str(crudo), '--escenario', 'Central',
                    '--base', str(tmp / 'base.json'), '--fotos', str(tmp / 'fotos.json')], check=True)
    calc = recalcular(crudo, tmp / 'calc')

    v = openpyxl.load_workbook(calc, data_only=True)
    c = v['Controles']
    total = c.cell(c.max_row, 3).value
    assert c.cell(c.max_row, 2).value.startswith('Suma absoluta de estos'), 'no se encontró el total de controles nuevos'
    assert abs(total) < 0.01, f'controles nuevos fuera de tolerancia: {total}'
    assert abs(c['C46'].value) < 1e-6, f'controles de la v6 fuera de tolerancia: {c["C46"].value}'
    a = openpyxl.load_workbook(V6, data_only=True)
    n = 0
    for ws in a.worksheets:
        for row in ws.iter_rows():
            for z in row:
                if isinstance(z.value, (int, float)) and not isinstance(z.value, bool):
                    y = v[ws.title][z.coordinate].value
                    assert isinstance(y, (int, float)) and abs(z.value - y) <= 1e-6 * max(1, abs(z.value)), \
                        f'cambió {ws.title}!{z.coordinate}: {z.value} -> {y}'
                    n += 1
    e = v['Escenarios y cambios']
    assert str(e['D4'].value).startswith('Sin cambios'), f'el tablero no coincide con la base: {e["D4"].value}'
    errores = [(ws.title, z.coordinate) for ws in v.worksheets for row in ws.iter_rows() for z in row
               if isinstance(z.value, str) and (z.value.startswith('#') or z.value.startswith('Err:'))]
    assert not errores, f'celdas con error: {errores[:10]}'
    print(f'Verificado: controles nuevos {total:.2e}, controles v6 {c["C46"].value:.2e}, {n} valores de la v6 sin cambios')

    # 3) Libro transparente: fórmulas reales en las hojas del curso, sin hojas ocultas, mismos valores
    claro = tmp / 'claro' / V7.name
    claro.parent.mkdir()
    fase1 = tmp / 'claro' / 'fase1.xlsx'
    fase2 = tmp / 'claro' / 'fase2.xlsx'
    subprocess.run([sys.executable, str(HERE / 'transparentar.py'), str(crudo), str(fase1), '1'], check=True)
    subprocess.run([sys.executable, str(HERE / 'transparentar.py'), str(fase1), str(fase2), '2'], check=True)
    subprocess.run([sys.executable, str(HERE / 'estilo_libro.py'), str(fase2), str(claro)], check=True)
    calc2 = recalcular(claro, tmp / 'calc_claro')
    REN = {'Mensual': 'Motor mensual', 'Anual': 'Motor anual', 'Calc depreciación': 'Motor depreciación',
           'Calc financiero': 'Motor financiero', 'Calc sensibilidad': 'Motor sensibilidad',
           'Tablero datos': 'Datos del tablero'}
    # Estas hojas pasaron de millones a pesos: sus valores son iguales o 1.000.000 veces el anterior
    EN_PESOS = {'Motor depreciación', 'Motor financiero', 'Motor sensibilidad', 'Controles', 'Notas y cambios', 'Datos'}
    b = openpyxl.load_workbook(calc2, data_only=True)
    ocultas = [ws.title for ws in b.worksheets if ws.sheet_state != 'visible']
    assert not ocultas, f'quedaron hojas ocultas: {ocultas}'
    m = 0
    for ws in v.worksheets:
        t2 = REN.get(ws.title, ws.title)
        if t2 not in b.sheetnames:
            continue
        for row in ws.iter_rows():
            for z in row:
                x = z.value
                if isinstance(x, (int, float)) and not isinstance(x, bool):
                    y = b[t2][z.coordinate].value
                    # los controles de la capa anterior comparaban contra la v6; ahora son triviales
                    if t2 == 'Controles' and z.row > 46:
                        continue
                    igual = isinstance(y, (int, float)) and abs(x - y) <= 1e-6 * max(1, abs(x))
                    escalado = (t2 in EN_PESOS and isinstance(y, (int, float))
                                and abs(x * 1e6 - y) <= 1e-6 * max(1, abs(x * 1e6)))
                    assert igual or escalado, f'cambió {t2}!{z.coordinate}: {x} -> {y}'
                    m += 1
    errores = [(ws.title, z.coordinate) for ws in b.worksheets for row in ws.iter_rows() for z in row
               if isinstance(z.value, str) and (z.value.startswith('#') or z.value.startswith('Err:'))]
    assert not errores, f'celdas con error en el libro transparente: {errores[:10]}'
    print(f'Transparente verificado: {m} valores iguales (motor en pesos), sin hojas ocultas ni errores')
    shutil.copyfile(calc2, V7)
    (tmp / 'pdf').mkdir()
    subprocess.run(soffice + ['--convert-to', 'pdf', '--outdir', str(tmp / 'pdf'), str(V7)], check=True, timeout=300)
    pdf = tmp / 'pdf' / V7.with_suffix('.pdf').name
    # El PDF de lectura llega hasta Notas; las hojas «Motor ...» (miles de celdas) quedan solo en el Excel.
    paginas = int(next(l for l in subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True).stdout.splitlines()
                       if l.startswith('Pages')).split()[-1])
    ultima = paginas
    for i in range(1, paginas + 1):
        texto = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', str(pdf), '-'], capture_output=True, text=True).stdout
        primera = next((l.strip() for l in texto.splitlines() if l.strip()), '')
        if 'MOTOR DE CÁLCULO' in texto:
            ultima = i - 1
            break
    sep = tmp / 'sep'
    sep.mkdir()
    subprocess.run(['pdfseparate', '-f', '1', '-l', str(ultima), str(pdf), str(sep / 'p-%03d.pdf')], check=True)
    subprocess.run(['pdfunite'] + sorted(str(p) for p in sep.glob('p-*.pdf')) + [str(V7.with_suffix('.pdf'))], check=True)
    print(f'Listos: {V7} y {V7.with_suffix(".pdf").name} ({ultima} páginas)')
