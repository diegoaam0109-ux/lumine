"""Lumine Habilita · build
Une src/ en dos HTML autocontenidos:
  dist/lumine-habilita-demo.html  (base simulada, compartible)
  dist/lumine-habilita.html       (base real de claude.ai)
El orden de los archivos vive en manifest.json, que también usan las pruebas.
"""
import json, pathlib
R = pathlib.Path(__file__).parent
src = R / 'src'
MAN = json.loads((R / 'manifest.json').read_text())

def build(mode, out, title):
    js = [f for f in MAN['js'] if f != 'seed.js' or mode == 'demo']
    parts = [f'<title>{title}</title>',
             '<meta name="description" content="Selección y habilitación por competencias del técnico instalador de Lumine Motors.">',
             '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
             '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">',
             '<style>\n' + '\n'.join((src/f).read_text() for f in MAN['css']) + '\n</style>',
             (src/'markup.html').read_text(),
             '<script>\n"use strict";\nconst BUILD = ' + repr(mode) + ';\n' + '\n'.join((src/f).read_text() for f in js) + '\n</script>']
    (R/'dist').mkdir(exist_ok=True)
    (R/'dist'/out).write_text('\n'.join(parts))
    print(out, round((R/'dist'/out).stat().st_size/1024), 'KB')

if __name__ == '__main__':
    build('demo', 'lumine-habilita-demo.html', 'Lumine Habilita Demo')
    build('real', 'lumine-habilita.html', 'Lumine Habilita')
