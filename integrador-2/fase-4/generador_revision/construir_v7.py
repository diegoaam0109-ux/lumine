#!/usr/bin/env python3
"""v7: aplica el formato del curso sobre la v6, recalcula con LibreOffice (es-CL), verifica y exporta el PDF.

Verificaciones: (1) los controles nuevos de la hoja Controles suman ~0; (2) los controles de la v6 siguen en ~0;
(3) cada valor numérico de las hojas de la v6 es idéntico antes y después. Si algo falla, no se publica nada.
"""
from pathlib import Path
import shutil, subprocess, sys, tempfile
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
    crudo = tmp / 'v7_formato_curso.xlsx'
    subprocess.run([sys.executable, str(HERE / 'formato_profesor.py'), str(V6), str(crudo)], check=True)
    (tmp / 'calc').mkdir()
    subprocess.run(soffice + ['--convert-to', 'xlsx', '--outdir', str(tmp / 'calc'), str(crudo)], check=True, timeout=300)
    calc = tmp / 'calc' / crudo.name

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
    print(f'Verificado: controles nuevos {total:.2e}, controles v6 {c["C46"].value:.2e}, {n} valores de la v6 sin cambios')

    shutil.copyfile(calc, V7)
    (tmp / 'pdf').mkdir()
    subprocess.run(soffice + ['--convert-to', 'pdf', '--outdir', str(tmp / 'pdf'), str(V7)], check=True, timeout=300)
    pdf = tmp / 'pdf' / V7.with_suffix('.pdf').name
    # LibreOffice también imprime las hojas ocultas; se dejan solo las páginas de las hojas visibles (van primero).
    paginas = int(next(l for l in subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True).stdout.splitlines()
                       if l.startswith('Pages')).split()[-1])
    ultima = paginas
    for i in range(1, paginas + 1):
        texto = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', str(pdf), '-'], capture_output=True, text=True).stdout
        primera = next((l.strip() for l in texto.splitlines() if l.strip()), '')
        if primera.startswith('LUMINE · Ingresos y costos'):
            ultima = i - 1
            break
    sep = tmp / 'sep'
    sep.mkdir()
    subprocess.run(['pdfseparate', '-f', '1', '-l', str(ultima), str(pdf), str(sep / 'p-%03d.pdf')], check=True)
    subprocess.run(['pdfunite'] + sorted(str(p) for p in sep.glob('p-*.pdf')) + [str(V7.with_suffix('.pdf'))], check=True)
    print(f'Listos: {V7} y {V7.with_suffix(".pdf").name} ({ultima} páginas)')
