"""Escenarios de la presentación en formato blanco: el negro pasa a blanco y la luz (foco, rejilla, horizonte)
se convierte en celeste Lumine sobre blanco, con la misma forma y posición. Uso: python3 escenarios_claros.py salida"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SRC = [('../../../../integrador-2/identidad/fondos/', ['escenario-a.jpg', 'escenario-b.jpg', 'escenario-c.jpg',
        'fondo-portada.jpg', 'fondo-dato.jpg', 'fondo-cierre.jpg']),
       ('../../../../fase-3/generador/assets/', ['fondo-rejilla.jpg', 'fondo-horizonte.jpg'])]
def blur(m, s):
    # desenfoque gaussiano por FFT con borde reflejado (sin scipy)
    p = int(3 * s) + 1; h, w = m.shape
    M = np.pad(m, p, mode='reflect'); H, Wd = M.shape
    fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.rfftfreq(Wd)[None, :]
    G = np.exp(-2 * (np.pi ** 2) * (s ** 2) * (fx ** 2 + fy ** 2))
    return np.fft.irfft2(np.fft.rfft2(M) * G, s=M.shape)[p:p + h, p:p + w]

W = np.array([255., 255, 255]); CEL = np.array([34., 184, 240]); HONDO = np.array([10., 111, 158])  # #0A6F9E

for carpeta, archivos in SRC:
    for f in archivos:
        x = np.asarray(Image.open(carpeta + f).convert('RGB')).astype(float)
        L = x @ np.array([0.2126, 0.7152, 0.0722])
        base = np.percentile(L, 2)                       # negro del escenario
        top = max(np.percentile(L, 99.95), base + 150)   # un brillo tenue del original sigue tenue en blanco
        print(f, round(base,1), round(np.percentile(L, 99.95),1))
        t = np.clip((L - base) / (top - base), 0, 1) ** 0.85
        # separa el foco (baja frecuencia) de la rejilla (líneas finas) y suaviza el borde del foco
        h, w = t.shape
        fino = np.clip(t - blur(t, 6), 0, 1)
        foco = blur(t, w / 45)
        t = np.clip(foco + fino * 1.4, 0, 1)
        # luz suave → celeste claro; luz intensa → celeste pleno con un toque más hondo en el centro
        c = CEL * (1 - t[..., None] ** 3) + HONDO * (t[..., None] ** 3) * 0.35 + CEL * (t[..., None] ** 3) * 0.65
        a = (0.62 * t)[..., None]
        out = W * (1 - a) + c * a
        out += np.random.default_rng(3).uniform(-0.5, 0.5, out.shape)   # tramado contra escalones
        nombre = f.rsplit('.', 1)[0] + '-claro.png'
        Image.fromarray(np.clip(np.round(out), 0, 255).astype(np.uint8)).save(os.path.join(OUT, nombre))
        print(nombre, x.shape[1], 'x', x.shape[0])
