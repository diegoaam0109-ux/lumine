"""Genera la narración del video vertical y los tiempos de cada palabra para los subtítulos.

Uso (desde videos/):
    python narracion/narrar.py --voces <carpeta con vits-piper-*>

Lee narracion/guion.json y escribe:
    public/audio/narracion.wav   voz (Piper, sin conexión), normalizada a -16 LUFS
    src/tiktok/tiempos.json      inicio y fin de cada frase y de cada palabra

Cada frase se sintetiza por separado; dentro de una frase el tiempo de cada palabra se reparte según sus
fonemas (las comas suman una pausa). Es una aproximación: sirve para resaltar la palabra que se dice.
"""
import argparse
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

RAIZ = Path(__file__).resolve().parent.parent
PAUSA_COMA = 4  # fonemas equivalentes a la pausa de una coma


def recortar(audio: np.ndarray, sr: int, umbral=0.006):
    """Quita el silencio de los extremos; devuelve el audio y el desplazamiento en segundos."""
    activo = np.where(np.abs(audio) > umbral)[0]
    if len(activo) == 0:
        return audio, 0.0
    a = max(0, activo[0] - int(0.05 * sr))
    b = min(len(audio), activo[-1] + int(0.06 * sr))
    return audio[a:b], a / sr


def oraciones(tokens):
    """Agrupa los tokens en oraciones (terminan en . ? ! … o :)."""
    grupo = []
    for t in tokens:
        grupo.append(t)
        if re.search(r'[.?!…:]$', t['ver']):
            yield grupo
            grupo = []
    if grupo:
        yield grupo


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voces', required=True, help='carpeta con las voces vits-piper-*')
    ap.add_argument('--voz', help='nombre de la voz (por defecto, la del guion)')
    args = ap.parse_args()

    guion = json.loads((RAIZ / 'narracion/guion.json').read_text(encoding='utf-8'))
    nombre = args.voz or guion['voz']
    base = Path(args.voces) / f'vits-piper-{nombre}'
    voz = PiperVoice.load(str(base / f'{nombre}.onnx'), config_path=str(base / f'{nombre}.onnx.json'))
    sr = voz.config.sample_rate
    cfg = SynthesisConfig(length_scale=guion['velocidad'])

    def fonemas(texto):
        return sum(len([p for p in s if p.strip() and p not in ',.?!¿¡…:;']) for s in voz.phonemize(texto))

    pista, lineas, t = [], [], 0.25
    pista.append(np.zeros(int(0.25 * sr), dtype=np.float32))
    for linea in guion['lineas']:
        tokens = []
        for crudo in linea['texto'].split(' '):
            ver, _, decir = crudo.partition('|')
            decir = decir.replace('_', ' ') if decir else ver
            # la puntuación del subtítulo se conserva al pronunciar
            fin = re.search(r'[,.?!…:]+$', ver)
            if fin and not decir.endswith(fin.group(0)):
                decir += fin.group(0)
            tokens.append({'ver': ver, 'decir': decir})
        inicio_linea = t
        palabras = []
        for k, grupo in enumerate(oraciones(tokens)):
            texto = ' '.join(x['decir'] for x in grupo)
            audio = np.concatenate([c.audio_float_array for c in voz.synthesize(texto, cfg)])
            audio, _ = recortar(audio, sr)
            dur = len(audio) / sr
            pesos = [max(1, fonemas(x['decir'])) + (PAUSA_COMA if x['ver'].endswith(',') else 0) for x in grupo]
            total = sum(pesos)
            acum = 0
            for x, p in zip(grupo, pesos):
                i = t + dur * acum / total
                acum += p
                f = t + dur * acum / total
                palabras.append({'t': x['ver'], 'i': round(i, 3), 'f': round(f, 3)})
            pista.append(audio.astype(np.float32))
            t += dur
            hueco = 0.12
            pista.append(np.zeros(int(hueco * sr), dtype=np.float32))
            t += hueco
        lineas.append({'escena': linea['escena'], 'inicio': round(inicio_linea, 3), 'fin': round(t, 3), 'palabras': palabras})
        extra = guion['pausa']
        pista.append(np.zeros(int(extra * sr), dtype=np.float32))
        t += extra

    audio = np.concatenate(pista)
    salida = RAIZ / 'public/audio/narracion.wav'
    salida.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        crudo = Path(tmp) / 'crudo.wav'
        with wave.open(str(crudo), 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        # normaliza el volumen y lleva a 48 kHz (sin cambiar la duración)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(crudo), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', str(salida)], check=True)

    (RAIZ / 'src/tiktok').mkdir(parents=True, exist_ok=True)
    datos = {'voz': nombre, 'duracion': round(len(audio) / sr, 3), 'lineas': lineas}
    (RAIZ / 'src/tiktok/tiempos.json').write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{nombre}: {datos["duracion"]:.1f} s, {len(lineas)} frases → {salida.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
