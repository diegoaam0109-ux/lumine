"""Arma plan-higgsfield.html desde la plantilla, con miniaturas de las referencias incrustadas."""
import base64, io, json
from pathlib import Path
from PIL import Image
AQUI = Path(__file__).parent
REFS = {'01': '01_rayos-x.jpg', '02': '02_kit-despiece.jpg', '03': '03_componentes.jpg', '04': '04_colectivo.jpg',
        '05': '05_taller.jpg', '06': '06_bencinera.jpg', '07': '07_tecnico-alta-tension.jpg'}
datos = {}
for k, f in REFS.items():
    im = Image.open(AQUI / 'referencias' / f).convert('RGB')
    im.thumbnail((480, 300))
    b = io.BytesIO()
    im.save(b, 'JPEG', quality=72)
    datos[k] = {'archivo': f, 'src': 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()}
t = (AQUI / 'plan-higgsfield.plantilla.html').read_text(encoding='utf-8')
(AQUI / 'plan-higgsfield.html').write_text(t.replace('/*REFS*/', json.dumps(datos)[1:-1]), encoding='utf-8')
