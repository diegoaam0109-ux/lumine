"""Construye solo la demo pública, con fuentes locales y sin servicios de Claude."""
import argparse
import importlib.util
import pathlib
import re
import shutil
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=pathlib.Path, required=True)
args = parser.parse_args()
out = args.output.resolve()
out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='lumine-habilita-') as tmp:
    stage = pathlib.Path(tmp)
    shutil.copytree(ROOT / 'src', stage / 'src')
    for name in ('manifest.json', 'build.py'):
        shutil.copy2(ROOT / name, stage / name)
    spec = importlib.util.spec_from_file_location('habilita_build', stage / 'build.py')
    build = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(build)
    build.build('demo', 'demo.html', 'Lumine Habilita · Demostración')
    html = (stage / 'dist/demo.html').read_text(encoding='utf-8')

html = re.sub(r'<link[^>]*https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '', html)
fonts = [
    ('Figtree-Regular.ttf', 'Figtree', '400', 'normal'),
    ('Figtree-Bold.ttf', 'Figtree', '600 900', 'normal'),
    ('ArchivoSemiExpanded-ExtraBold.ttf', 'Archivo', '500 900', 'normal'),
    ('InstrumentSerif-Italic.ttf', 'Instrument Serif', '400', 'italic'),
    ('IBMPlexMono-Regular.ttf', 'JetBrains Mono', '400', 'normal'),
]
(out / 'fonts').mkdir(exist_ok=True)
font_css = ''
for filename, family, weight, style in fonts:
    shutil.copy2(ROOT / 'control-de-gestion/fuentes' / filename, out / 'fonts' / filename)
    font_css += f'@font-face{{font-family:"{family}";src:url("fonts/{filename}") format("truetype");font-weight:{weight};font-style:{style};font-display:swap;}}\n'
for license_file in (ROOT / 'control-de-gestion/fuentes').glob('OFL-*.txt'):
    shutil.copy2(license_file, out / 'fonts' / license_file.name)
# El build original es un fragmento para artefactos; Pages necesita un documento completo.
split = html.index('<div id="pre"')
head, body = html[:split], html[split:]
entry = '<script>if(!location.hash)history.replaceState(null,"",location.pathname+location.search+"#demo");</script>'
document = ('<!doctype html><html lang="es-CL"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<meta name="robots" content="noindex,nofollow">'
            '<link rel="icon" href="data:,">'
            '<style>' + font_css + '</style>' + head + '</head><body>' + entry + body + '</body></html>')
(out / 'index.html').write_text(document, encoding='utf-8')
print('Demo pública:', out / 'index.html')
