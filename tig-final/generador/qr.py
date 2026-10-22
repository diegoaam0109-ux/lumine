# Código QR de la lámina de Lumine Habilita: lleva a la demostración publicada (se abre sin cuenta).
# Uso: python3 qr.py   (requiere segno). Deja assets/qr-habilita.png.
from pathlib import Path
import segno

URL = 'https://claude.ai/artifact/JpdUMVYztFtjQYkcAehELb'
OUT = Path(__file__).resolve().parent / 'assets' / 'qr-habilita.png'
# módulos negros de la marca sobre blanco humo: el contraste alto asegura la lectura desde un teléfono
segno.make(URL, error='m').save(OUT, scale=24, border=2, dark='#020304', light='#ECECEC')
print('listo', OUT)
