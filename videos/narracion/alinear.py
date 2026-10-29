"""Sincroniza el video vertical con una narración grabada (o generada en ElevenLabs u otro servicio).

Uso (desde videos/, después de bash narracion/preparar.sh):
    ~/.cache/lumine-voz/venv/bin/python narracion/alinear.py <audio (mp3, wav, m4a…)> [--sin-limpieza]

Hace tres cosas:
  1. Limpia el audio: cadena de voz para celular (RNNoise, ecualización, de-esser y compresión), quita el silencio
     de los extremos, normaliza el volumen (-16 LUFS) y lo deja en public/audio/narracion.wav. Con --sin-limpieza
     solo recorta y normaliza (para audio ya limpio, como el de ElevenLabs).
  2. Reconoce la voz con Parakeet TDT 0.6b v3 (multilingüe, con el tiempo de cada palabra; sin conexión).
  3. Alinea lo reconocido con narracion/guion.json y escribe src/tiktok/tiempos.json: así los subtítulos
     muestran el texto del guion (bien escrito) en el momento exacto en que Lukas dice cada palabra.

Si Lukas cambió alguna palabra al grabar, la alineación lo tolera; si cambió frases enteras, primero hay que
actualizar guion.json con lo que efectivamente dijo. Al final imprime las frases con baja coincidencia.

Modelo: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
"""
import argparse
import difflib
import json
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

RAIZ = Path(__file__).resolve().parent.parent
SR = 16000


def normalizar(p: str) -> str:
    p = unicodedata.normalize('NFD', p.lower())
    p = ''.join(c for c in p if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ]', '', p)


def numeros(p: str) -> list[str]:
    """El reconocedor puede escribir «20» o «veinte»; se comparan ambas formas."""
    return {'20': ['veinte'], '20%': ['veinte', 'por', 'ciento']}.get(p, [p])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio', help='narración grabada')
    ap.add_argument('--asr', default=str(Path.home() / '.cache/lumine-voz/parakeet'), help='carpeta de Parakeet (la deja narracion/preparar.sh)')
    ap.add_argument('--margen', type=float, default=0.35, help='silencio que se deja antes de la primera palabra (s)')
    ap.add_argument('--sin-limpieza', action='store_true', help='no procesar la voz (para audio ya limpio, p. ej. ElevenLabs)')
    args = ap.parse_args()

    guion = json.loads((RAIZ / 'narracion/guion.json').read_text(encoding='utf-8'))
    salida = RAIZ / 'public/audio/narracion.wav'
    with tempfile.TemporaryDirectory() as tmp:
        limpio = Path(tmp) / 'limpio.wav'
        # cadena de voz para grabaciones de celular: corta graves de manejo, quita ruido de fondo (RNNoise,
        # modelo «somnolent-hogwash» para voz grabada), resta zumbido residual, saca lo embarrado (200 Hz),
        # da presencia (3,5 kHz), suaviza las «s» y comprime suave para que todo se entienda parejo
        voz = '' if args.sin_limpieza else (
            'aresample=48000,highpass=f=80,'
            f'arnndn=m={RAIZ / "narracion/modelos/voz-grabada.rnnn"}:mix=0.85,'
            'afftdn=nr=6:nf=-42,'
            'equalizer=f=200:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1:g=2,'
            'deesser=i=0.35,'
            'acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2,'
        )
        # recorta silencios de los extremos y normaliza; deja un margen al inicio
        filtro = voz + (
            'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,'
            'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse,'
            f'adelay={int(args.margen * 1000)}:all=1,loudnorm=I=-16:TP=-1.5:LRA=11'
        )
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', args.audio, '-af', filtro, '-ar', '48000', '-ac', '1', str(limpio)], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(limpio), '-ar', '48000', str(salida)], check=True)
        audio, sr = sf.read(str(limpio), dtype='float32')
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    duracion = len(audio) / sr
    a16 = np.interp(np.linspace(0, len(audio) - 1, int(len(audio) * SR / sr)), np.arange(len(audio)), audio).astype(np.float32)

    d = Path(args.asr)
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(d / 'encoder.int8.onnx'), decoder=str(d / 'decoder.int8.onnx'), joiner=str(d / 'joiner.int8.onnx'),
        tokens=str(d / 'tokens.txt'), model_type='nemo_transducer', num_threads=4,
    )
    # en tramos de 20 s para no exceder la memoria; se juntan las palabras con su tiempo absoluto
    oidas = []  # (palabra normalizada, inicio, fin)
    paso = 20 * SR
    for k in range(0, len(a16), paso):
        st = rec.create_stream()
        st.accept_waveform(SR, a16[k:k + paso + SR // 2] if k + paso < len(a16) else a16[k:])
        rec.decode_stream(st)
        r = st.result
        durs = list(getattr(r, 'durations', []) or [])
        actual = None
        for i, (tok, t) in enumerate(zip(r.tokens, r.timestamps)):
            t = t + k / SR
            fin_tok = t + (durs[i] if i < len(durs) and durs[i] > 0 else 0.08)
            if tok.startswith('▁') or tok.startswith(' ') or actual is None:
                if actual and t < (k + paso) / SR + 0.01:
                    oidas.append(actual)
                actual = [tok.strip('▁ '), t, fin_tok]
            else:
                actual[0] += tok
                actual[2] = fin_tok
        if actual and actual[1] < (k + paso) / SR:
            oidas.append(actual)
    # quita duplicados del solape entre tramos
    limpias = []
    for w in oidas:
        if limpias and w[1] <= limpias[-1][1] + 0.02:
            continue
        limpias.append(w)
    oidas = [(normalizar(w), i, f) for w, i, f in limpias if normalizar(w)]

    # palabras del guion: lo que se ve (ver) y lo que se dice (decir, puede ser varias palabras)
    guion_pal = []  # (linea, indice_token, palabra dicha normalizada)
    tokens = []
    for li, l in enumerate(guion['lineas']):
        toks = []
        for crudo in l['texto'].split(' '):
            ver, _, decir = crudo.partition('|')
            decir = decir.replace('_', ' ') if decir else ver
            toks.append(ver)
            for pd in decir.split(' '):
                for n in numeros(pd):
                    if normalizar(n):
                        guion_pal.append((li, len(toks) - 1, normalizar(n)))
        tokens.append(toks)

    sm = difflib.SequenceMatcher(a=[g[2] for g in guion_pal], b=[o[0] for o in oidas], autojunk=False)
    tiempo = [None] * len(guion_pal)
    for bloque in sm.get_matching_blocks():
        for j in range(bloque.size):
            o = oidas[bloque.b + j]
            tiempo[bloque.a + j] = (o[1], o[2])
    # interpola las palabras que no se reconocieron
    conocidos = [i for i, t in enumerate(tiempo) if t]
    for i, t in enumerate(tiempo):
        if t:
            continue
        antes = max([c for c in conocidos if c < i], default=None)
        despues = min([c for c in conocidos if c > i], default=None)
        a = tiempo[antes][1] if antes is not None else args.margen
        b = tiempo[despues][0] if despues is not None else duracion
        n = (despues if despues is not None else len(tiempo)) - (antes if antes is not None else -1)
        u = (i - (antes if antes is not None else -1)) / n
        tiempo[i] = (a + (b - a) * u, a + (b - a) * u + 0.15)

    lineas, avisos = [], []
    for li, l in enumerate(guion['lineas']):
        idx = [k for k, g in enumerate(guion_pal) if g[0] == li]
        palabras = []
        for ti, ver in enumerate(tokens[li]):
            ks = [k for k in idx if guion_pal[k][1] == ti]
            if not ks:
                continue
            palabras.append({'t': ver, 'i': round(tiempo[ks[0]][0], 3), 'f': round(tiempo[ks[-1]][1], 3)})
        # el fin de cada palabra no pasa del inicio de la siguiente
        for a, b in zip(palabras, palabras[1:]):
            a['f'] = round(min(max(a['f'], a['i'] + 0.08), b['i']), 3)
        acierto = sum(1 for k in idx if any(blk.a <= k < blk.a + blk.size for blk in sm.get_matching_blocks())) / max(1, len(idx))
        if acierto < 0.6:
            avisos.append(f'  «{l["texto"][:50]}…»: coincide {acierto:.0%}')
        lineas.append({'escena': l['escena'], 'inicio': palabras[0]['i'], 'fin': round(palabras[-1]['f'] + 0.1, 3), 'palabras': palabras})

    datos = {'voz': 'grabación: ' + Path(args.audio).name, 'duracion': round(duracion, 3), 'lineas': lineas}
    (RAIZ / 'src/tiktok/tiempos.json').write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding='utf-8')
    total = sum(1 for t in tiempo if t) and sum(b.size for b in sm.get_matching_blocks()) / len(guion_pal)
    print(f'{Path(args.audio).name}: {duracion:.1f} s · {total:.0%} de las palabras del guion reconocidas en el audio')
    if avisos:
        print('Frases que no calzan con el guion (revisa si se dijeron distinto y corrige guion.json):')
        print('\n'.join(avisos))
    print('Listo: public/audio/narracion.wav y src/tiktok/tiempos.json. Ahora: bash render.sh Tiktok')


if __name__ == '__main__':
    main()
