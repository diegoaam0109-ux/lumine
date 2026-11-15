"""Arma la presentación web de la Fase 4.

Salidas:
  lumine-presentaciones/fase4/index.html  (sitio de GitHub Pages, con fuentes e imágenes como archivos)
  /tmp/propuesta_fase4.html               (una sola página con todo incrustado, para el artefacto de Claude)
La curva de caja mensual se lee del libro v7 (hoja A3 Capital trabajo mensual, fila 16).
"""
import base64, json, pathlib, shutil
import openpyxl

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]
FUENTES = RAIZ / 'fase-3' / 'fuentes'
SITIO = RAIZ / 'lumine-presentaciones' / 'fase4'
LIBRO = RAIZ / 'integrador-2' / 'fase-4' / 'excel' / 'v7_formato_curso.xlsx'

TTF = {'__F_MICHROMA__': 'Michroma-Regular.ttf', '__F_ACENTO__': 'ArchivoExpandedLight-Italic.ttf',
       '__F_ARCHIVO__': 'Archivo-Regular.ttf', '__F_ARCHIVOB__': 'Archivo-Bold.ttf',
       '__F_COND__': 'ArchivoCondensed-Bold.ttf', '__F_SEMIC__': 'ArchivoSemiCondensed-Medium.ttf',
       '__F_MONO__': 'IBMPlexMono-Regular.ttf'}
IMG = {'__LOGO_C__': 'logo-claro.png', '__LOGO_O__': 'logo-oscuro.png',
       '__PORTADA__': 'portada-rayos.jpg', '__CIERRE__': 'cierre-premium.jpg'}


def caja():
    ws = openpyxl.load_workbook(LIBRO, read_only=True, data_only=True)['A3 Capital trabajo mensual']
    fila = list(ws.iter_rows(min_row=16, max_row=16, values_only=True))[0]
    assert 'Caja operativa acumulada' in fila, fila[:3]
    datos = [round(x / 1e6, 2) for x in fila if isinstance(x, (int, float))]
    assert len(datos) == 60, len(datos)
    return datos


def b64(p, mime):
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode()


def main():
    base = (AQUI / 'plantilla.html').read_text(encoding='utf-8').replace('__CAJA__', json.dumps(caja()))
    sitio, unico = base, base
    for k, f in TTF.items():
        shutil.copy(FUENTES / f, SITIO / 'fuentes' / f)
        sitio = sitio.replace(k, 'fuentes/' + f)
        unico = unico.replace(k, b64(FUENTES / f, 'font/ttf'))
    for k, f in IMG.items():
        shutil.copy(AQUI / 'a' / f, SITIO / 'img' / f)
        sitio = sitio.replace(k, 'img/' + f)
        unico = unico.replace(k, b64(AQUI / 'a' / f, 'image/png' if f.endswith('png') else 'image/jpeg'))
    (SITIO / 'index.html').write_text(sitio, encoding='utf-8')
    pathlib.Path('/tmp/propuesta_fase4.html').write_text(unico, encoding='utf-8')
    print('ok', SITIO / 'index.html', len(sitio) // 1024, 'KB')


if __name__ == '__main__':
    main()
