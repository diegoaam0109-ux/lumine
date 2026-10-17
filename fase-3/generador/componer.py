# Compone los fondos con imagen de la presentación (portada, aperturas de cada plan y cierre)
# a partir del kit de identidad de integrador-2/identidad/. El degradado va horneado en la imagen,
# así el texto siempre queda sobre negro y se lee igual en PowerPoint, LibreOffice y el PDF.
# Uso: python3 componer.py   (requiere Pillow). Deja los .jpg en assets/.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

AQUI = Path(__file__).resolve().parent
ID = AQUI.parent.parent / 'integrador-2' / 'identidad'
OUT = AQUI / 'assets'
W, H = 2400, 1350
NEGRO = (2, 3, 4)


def cubrir(img, w, h, fx=0.5, fy=0.5):
    """Recorta la imagen para cubrir w×h sin deformarla; fx y fy eligen el foco."""
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x = round((img.width - w) * fx)
    y = round((img.height - h) * fy)
    return img.crop((x, y, x + w, y + h))


def rampa(w, h, x0, x1, a0, a1, eje='x'):
    """Máscara con una rampa lineal de opacidad a0→a1 entre x0 y x1 (en píxeles del eje)."""
    m = Image.new('L', (w, h))
    d = ImageDraw.Draw(m)
    largo = w if eje == 'x' else h
    for i in range(largo):
        t = 0 if i <= x0 else 1 if i >= x1 else (i - x0) / (x1 - x0)
        v = round(255 * (a0 + (a1 - a0) * t))
        if eje == 'x':
            d.line([(i, 0), (i, h)], fill=v)
        else:
            d.line([(0, i), (w, i)], fill=v)
    return m


def oscurecer(lienzo, mascara):
    negro = Image.new('RGB', lienzo.size, NEGRO)
    return Image.composite(negro, lienzo, mascara)


def portada():
    lienzo = Image.new('RGB', (W, H), NEGRO)
    foto = Image.open(ID / 'imagenes' / 'lumine-01-rayos-x.jpg').convert('RGB')
    alto = round(H * 0.80)
    foto = foto.resize((round(foto.width * alto / foto.height), alto), Image.LANCZOS)
    x, y = 700, H - alto
    # bordes izquierdo y superior de la foto se funden con el negro
    m = Image.new('L', foto.size, 255)
    m = Image.composite(m, Image.new('L', foto.size, 0), rampa(*foto.size, 0, 380, 0, 1))
    m = Image.composite(m, Image.new('L', foto.size, 0), rampa(*foto.size, 0, 260, 0, 1, eje='y'))
    lienzo.paste(foto, (x, y), m)
    # pie oscuro para los datos del curso
    lienzo = oscurecer(lienzo, rampa(W, H, int(H * 0.74), int(H * 0.86), 0, 0.88, eje='y'))
    lienzo.save(OUT / 'portada-rayos.jpg', quality=90)


def apertura(nombre, archivo, fx=0.5, fy=0.5):
    """Foto en los dos tercios derechos, fundida hacia el negro de la izquierda donde va el texto."""
    lienzo = Image.new('RGB', (W, H), NEGRO)
    x0 = round(W * 0.40)
    foto = cubrir(Image.open(ID / 'imagenes' / archivo).convert('RGB'), W - x0, H, fx, fy)
    m = rampa(W - x0, H, 0, 560, 0, 1)
    lienzo.paste(foto, (x0, 0), m)
    # un velo suave en toda la foto y más oscuro abajo, para que no compita con el texto
    lienzo = oscurecer(lienzo, Image.new('L', (W, H), 46))
    lienzo = oscurecer(lienzo, rampa(W, H, int(H * 0.72), H, 0, 0.75, eje='y'))
    lienzo.save(OUT / nombre, quality=90)


def cierre():
    foto = cubrir(Image.open(ID / 'fondos' / 'escenario-c.jpg').convert('RGB'), W, H)
    foto.save(OUT / 'cierre-escenario.jpg', quality=90)


if __name__ == '__main__':
    portada()
    apertura('apertura-marketing.jpg', 'lumine-05-colectivero-santiago.jpg', fx=0.95)
    apertura('apertura-rrhh.jpg', 'lumine-14-capacitacion.jpg', fx=0.55)
    apertura('apertura-operaciones.jpg', 'lumine-16-taller.jpg', fx=0.5)
    cierre()
    print('listo:', ', '.join(p.name for p in sorted(OUT.glob('*.jpg'))))
