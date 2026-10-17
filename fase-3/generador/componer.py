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


def portada_premium():
    """Portada tipo aviso: el auto en rayos X ocupa la mitad inferior derecha, con un halo celeste localizado bajo la
    batería, luz de borde fría y un reflejo discreto; arriba y a la izquierda queda negro para el texto."""
    from PIL import ImageChops, ImageEnhance
    lienzo = Image.new('RGB', (W, H), NEGRO)
    src = Image.open(ID / 'imagenes' / 'lumine-01-rayos-x.jpg').convert('RGB')
    k = 1.30                                   # escala: el auto mide ~8,4 in de largo en la lámina
    foto = src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)
    foto = foto.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    foto = ImageEnhance.Contrast(foto).enhance(1.10)
    x0, y0 = W - foto.width + 150, H - foto.height + 130   # el techo queda bajo la mitad de la lámina
    m = Image.new('L', foto.size, 255)
    m = Image.composite(m, Image.new('L', foto.size, 0), rampa(*foto.size, 120, 560, 0, 1))
    m = Image.composite(m, Image.new('L', foto.size, 0), rampa(*foto.size, 120, 420, 0, 1, eje='y'))
    lienzo.paste(foto, (x0, y0), m)
    # halo celeste localizado bajo la batería y el eje trasero (no una mancha detrás de todo)
    halo = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(halo)
    cx, cy = x0 + round(980 * k), y0 + round(600 * k)
    d.ellipse((cx - 620, cy - 120, cx + 620, cy + 120), fill=120)
    halo = halo.filter(ImageFilter.GaussianBlur(130))
    luz = Image.composite(Image.new('RGB', (W, H), (34, 184, 240)), Image.new('RGB', (W, H), (0, 0, 0)), halo)
    lienzo = ImageChops.screen(lienzo, luz)
    # luz de borde fría: un barrido blanco muy tenue que cae sobre el techo
    borde = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(borde)
    rx, ry = x0 + round(900 * k), y0 + round(300 * k)
    d.ellipse((rx - 700, ry - 90, rx + 700, ry + 90), fill=40)
    borde = borde.filter(ImageFilter.GaussianBlur(90))
    lienzo = ImageChops.screen(lienzo, Image.composite(Image.new('RGB', (W, H), (236, 236, 236)), Image.new('RGB', (W, H), 0), borde))
    # viñeta: el negro manda en las esquinas y en la franja del título
    v = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(v)
    d.ellipse((-300, -200, W + 500, H + 700), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(260))
    lienzo = Image.composite(lienzo, Image.new('RGB', (W, H), NEGRO), v)
    lienzo.save(OUT / 'portada-premium.jpg', quality=92)
    print('portada: auto en', x0, y0, 'escala', k)


def brillo():
    """Resplandor celeste suave (PNG con transparencia) para poner detrás del dato o del cuadrante protagonista."""
    w, h = 1600, 800
    a = Image.new('L', (w, h), 0)
    ImageDraw.Draw(a).ellipse((200, 200, w - 200, h - 200), fill=70)
    a = a.filter(ImageFilter.GaussianBlur(120))
    img = Image.new('RGBA', (w, h), (34, 184, 240, 0))
    img.putalpha(a)
    img.save(OUT / 'brillo.png')


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


def recorte(nombre, archivo, w, h, fx=0.5, fy=0.5, velo=30):
    """Foto recortada a la proporción exacta de su caja en la lámina (2× de resolución), apenas oscurecida."""
    foto = cubrir(Image.open(ID / 'imagenes' / archivo).convert('RGB'), round(w * 300), round(h * 300), fx, fy)
    oscurecer(foto, Image.new('L', foto.size, velo)).save(OUT / nombre, quality=90)


if __name__ == '__main__':
    portada()
    portada_premium()
    brillo()
    apertura('apertura-marketing.jpg', 'lumine-05-colectivero-santiago.jpg', fx=0.95)
    apertura('apertura-rrhh.jpg', 'lumine-14-capacitacion.jpg', fx=0.55)
    apertura('apertura-operaciones.jpg', 'lumine-16-taller.jpg', fx=0.5)
    cierre()
    # fotos complementarias dentro de las láminas (medidas en pulgadas, iguales a las de deck.js)
    for n, (archivo, fx, fy) in enumerate([
        ('lumine-12-maqueta.jpg', 0.5, 0.45),          # captación: cotiza en la web
        ('lumine-09-diagnostico.jpg', 0.35, 0.5),      # asesoría: medir antes de decidir
        ('lumine-08-duo-tecnicos.jpg', 0.5, 0.45),     # taller: el dúo instala
        ('lumine-21-entrega-cliente.jpg', 0.5, 0.5),   # certificación: sale certificado
        ('lumine-20-centro-control.jpg', 0.5, 0.4),    # postventa: ahorro medido
    ], 1):
        recorte(f'flujo-{n}.jpg', archivo, 1.3, 0.66, fx, fy)
    recorte('controles-banco.jpg', 'lumine-17-banco-pruebas.jpg', 3.6, 1.0, 0.5, 0.55)
    recorte('ansoff-unidad.jpg', 'lumine-06-unidad-control.jpg', 3.73, 0.95, 0.5, 0.55, velo=0)
    recorte('dotacion-equipo.jpg', 'lumine-18-equipo.jpg', 3.58, 1.15, 0.5, 0.55)
    print('listo:', ', '.join(p.name for p in sorted(OUT.glob('*.jpg'))))
