"""Base musical y efectos del video vertical, sintetizados (sin pistas con derechos de autor).

Uso (desde videos/): python narracion/musica.py
Escribe public/audio/musica.wav (largo de la narración + 3 s), public/audio/barrido.wav y public/audio/golpe.wav.
Estilo: electrónica suave a 100 bpm, en la menor (Am · F · C · G), con pad, bajo, bombo suave y hi-hat.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, lfilter

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)


def guardar(nombre, audio):
    audio = audio / max(1e-9, np.max(np.abs(audio))) * 0.89
    if audio.ndim == 1:
        audio = np.stack([audio, audio], axis=1)
    with wave.open(str(RAIZ / 'public/audio' / nombre), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())


def filtro(x, corte, tipo='low', orden=2):
    b, a = butter(orden, corte / (SR / 2), btype=tipo)
    return lfilter(b, a, x)


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def sierra(f, n, desafinar=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * f * (1 + desafinar)) % 1) - 1


def base(duracion):
    n = int(duracion * SR)
    pulso = 60 / 100
    compas = 4 * pulso
    acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    izq, der = np.zeros(n), np.zeros(n)
    largo = int(2 * compas * SR)  # cada acorde dura dos compases
    for k in range(0, n, largo):
        m = min(largo, n - k)
        ac = acordes[(k // largo) % 4]
        pad_l = sum(sierra(nota(x), m, -0.004) + sierra(nota(x + 12), m, 0.003) * 0.4 for x in ac)
        pad_r = sum(sierra(nota(x), m, 0.004) + sierra(nota(x + 12), m, -0.003) * 0.4 for x in ac)
        env = np.minimum(1, np.arange(m) / (0.8 * SR)) * np.minimum(1, (m - np.arange(m)) / (0.3 * SR))
        izq[k:k + m] += pad_l * env
        der[k:k + m] += pad_r * env
    izq, der = filtro(izq, 1400), filtro(der, 1400)
    # bajo en corcheas con la raíz del acorde
    bajo = np.zeros(n)
    paso = int(pulso / 2 * SR)
    for k in range(0, n, paso):
        m = min(paso, n - k)
        raiz = acordes[(k // largo) % 4][0] - 24
        t = np.arange(m) / SR
        bajo[k:k + m] += np.sin(2 * np.pi * nota(raiz) * t) * np.exp(-t * 7)
    # bombo suave y hi-hat
    bombo = np.zeros(n)
    hat = np.zeros(n)
    for k in range(0, n, int(pulso * SR)):
        m = min(int(0.35 * SR), n - k)
        t = np.arange(m) / SR
        f = 45 + 75 * np.exp(-t * 30)
        bombo[k:k + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
        h = k + int(pulso / 2 * SR)
        if h < n:
            mh = min(int(0.05 * SR), n - h)
            hat[h:h + mh] += rng.standard_normal(mh) * np.exp(-np.arange(mh) / SR * 80)
    hat = filtro(hat, 7000, 'high')
    # bombeo del pad con el bombo
    bombeo = np.ones(n)
    for k in range(0, n, int(pulso * SR)):
        m = min(int(pulso * SR), n - k)
        bombeo[k:k + m] = 0.55 + 0.45 * np.minimum(1, np.arange(m) / (0.22 * SR))
    mezcla_l = izq * 0.10 * bombeo + bajo * 0.30 + bombo * 0.42 + hat * 0.05
    mezcla_r = der * 0.10 * bombeo + bajo * 0.30 + bombo * 0.42 + hat * 0.05
    fundido = np.minimum(1, np.arange(n) / (1.0 * SR)) * np.minimum(1, (n - np.arange(n)) / (2.5 * SR))
    return np.stack([mezcla_l * fundido, mezcla_r * fundido], axis=1)


def barrido():
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    # ruido filtrado que sube y baja, con un leve paneo
    salida = np.zeros(n)
    for i in range(0, n, 512):
        corte = 400 + 5000 * np.sin(np.pi * min(1, i / n)) ** 2
        seg = ruido[i:i + 512]
        salida[i:i + 512] = filtro(seg, corte)
    env = np.sin(np.pi * t / t[-1]) ** 1.5
    s = salida * env
    return np.stack([s * (1 - t / t[-1] * 0.5), s * (0.5 + t / t[-1] * 0.5)], axis=1)


def golpe():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    brillo = filtro(rng.standard_normal(n), 3000, 'high') * np.exp(-t * 25) * 0.3
    return sub + brillo


def main():
    tiempos = json.loads((RAIZ / 'src/tiktok/tiempos.json').read_text(encoding='utf-8'))
    (RAIZ / 'public/audio').mkdir(parents=True, exist_ok=True)
    guardar('musica.wav', base(tiempos['duracion'] + 3))
    guardar('barrido.wav', barrido())
    guardar('golpe.wav', golpe())
    print('musica.wav, barrido.wav y golpe.wav listos')


if __name__ == '__main__':
    main()
