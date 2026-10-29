---
name: tiktok-lumine
description: Método del equipo Lumine para hacer videos verticales cortos (TikTok, Reels, Shorts) de la marca con Remotion — guion, voz grabada por el equipo, limpieza de audio, subtítulos palabra por palabra sincronizados solos, escenas con el kit en 3D, música, render y control de calidad. Úsala siempre que haya que idear, guionizar, editar, sincronizar o renderizar un video corto de Lumine, o cuando llegue un audio para «sincronizar el video».
---

# TikTok de Lumine · método

Úsala junto con `lumine-marca` (colores, tipografías, voz) y, para dudas de Remotion, con `remotion-best-practices`
(la instala `videos/narracion/preparar.sh`; no se sube al repositorio). El primer video, «El kit, para el curioso»,
vive en `videos/src/tiktok/` y es la plantilla.

## Lo que el equipo ya decidió

- **La voz es humana.** Las voces sintéticas (Piper y Kokoro, varias) se rechazaron. Graba **Lukas**, o la genera o
  «tunea» él en ElevenLabs. Claude edita, sincroniza y renderiza. Nunca entregues un TikTok final con voz sintética
  salvo que lo pidan.
- **La pronunciación de la marca no está cerrada**: ni «Lu-mi-ne» ni «Lumin» convencen del todo; el equipo aceptó la del
  audio que eligió para el primer video. En `guion.json` va `Lumine|Lumin`; pregunta antes de cada video nuevo.
- **Mostrar la herramienta en uso**, no fotos con texto (lección del comercial: la versión con fotos «gusta pero no
  tanto»; la que muestra la página funcionando sí). El visor 3D del kit es lo que más convence.
- **Honestidad en pantalla**: el ahorro es «hasta 20% en ciudad, estimación de ingeniería, no medida en autos chilenos»;
  las fotos son «imagen conceptual»; el proceso es «propuesto»; al cierre, «Lumine Motors · proyecto en desarrollo».
  Nada de precios, garantías, plazos ni homologaciones que no existan (ver `CLAUDE.md`).
- Gratis y sin derechos de terceros: música y efectos sintetizados (`narracion/musica.py`); si suben el video con
  música de TikTok, que sea de la *Commercial Music Library* (cuenta de marca).

## Formato

- 1080 × 1920, 30 fps, H.264 + AAC, **30–70 s**. Volumen final cerca de **−16 LUFS**, picos bajo −1 dB.
- **Gancho en los primeros 2 s**: una pregunta o una imagen que no se entiende hasta el final de la frase.
- Una idea por escena; la escena cambia cuando cambia la frase (las escenas se anclan a la voz, no a segundos fijos).
- **Subtítulos** grandes (≈84 px, Archivo 800), 1–3 palabras por grupo, la palabra que se dice en celeste.
- **Zonas seguras**: nada importante arriba de y = 220 ni bajo y = 1500; deja libres los 150 px de la derecha entre
  y = 900 y 1500 (botones de TikTok). Subtítulos en y ≈ 1300–1500.
- Barra de partes arriba («Parte 2 de 4 · Cómo funciona») cuando el video explica algo en pasos.

## Flujo

1. **Idea y guion** (`videos/narracion/guion.json`): ≤ 150 palabras, frases cortas, segunda persona («tu auto»),
   español de Chile. Cada línea tiene su `escena`. Marca la pronunciación con `|` (ABS → `ABS|a_be_ese`,
   20% → `20%|veinte_por_ciento`). Las palabras que disparan animaciones se leen con `cuando(escena, palabra)` en el
   `.tsx`: si cambias el guion, revisa esas llamadas. **El equipo aprueba el guion antes de grabar.**
2. **Instrucciones para la voz**: actualiza `narracion/INSTRUCCIONES_NARRACION.md` y la página con teleprompter
   (`narracion/guion-lukas.html`, publicada en https://claude.ai/artifact/S3GGUnRgjajA8U7Ya2yLLJ) con el guion nuevo.
3. **Preparar herramientas** (una vez por sesión, ~2 min): `bash videos/narracion/preparar.sh`.
4. **Sincronizar** cuando llegue el audio:
   `~/.cache/lumine-voz/venv/bin/python narracion/alinear.py <audio>` (desde `videos/`).
   Limpia la voz (RNNoise «somnolent-hogwash», ecualización, de-esser, compresión; `--sin-limpieza` si viene de
   ElevenLabs), recorta, normaliza y escribe `src/tiktok/tiempos.json` con el tiempo de cada palabra (Parakeet TDT v3,
   sin conexión). Si avisa frases que no calzan, ajusta `guion.json` a lo que efectivamente se dijo y repite.
5. **Música**: `~/.cache/lumine-voz/venv/bin/python narracion/musica.py` (se ajusta al largo nuevo).
6. **Escenas**: piezas reutilizables en `src/tiktok/Tiktok.tsx` (`Titular`, `Chip`, `Foto`, `Velo`, `Rejilla`,
   `Capa3D` con `TOMAS` por escena, `Flujo` de energía entre piezas, `Subtitulos`, `Encabezado`). Fotos de la marca
   en `public/img/`; el 3D es el de Habilita (`src/kit3d.ts`). Para el segundo TikTok, separa estas piezas en
   `src/tiktok/kit/` y deja cada video en su carpeta con su guion y sus tiempos.
7. **Render**: `bash render.sh Tiktok` → `salida/Video_03_Kit_Lumine_vertical.mp4` y su portada.

## Trampas aprendidas

- **El primer cuadro no puede ser negro**: la primera escena parte en el cuadro 0 aunque la voz empiece después
  (en TikTok el primer cuadro es lo que se ve al deslizar y la miniatura).
- El reconocedor marca las palabras ~0,1 s antes (hasta 0,4 s tras una pausa); `alinear.py` ya las ancla al ataque
  real de la voz. Si un subtítulo se ve adelantado, revisa eso primero.
- Si la voz parte en el cuadro 0, las curvas de volumen con `interpolate` necesitan puntos estrictamente crecientes.
- El audio que mandan por WhatsApp llega como MP3 mono de 44,1 kHz: sirve igual; mide el ruido de fondo
  (`astats` → *Noise floor*) y usa `--sin-limpieza` si está bajo −70 dB (audio de ElevenLabs).
- Elementos que aparecen al final de la voz (lema, logo) deben esperar a que se vaya el último subtítulo (+0,25 s).

## Control de calidad (antes de entregar)

- Hoja de cuadros: `ffmpeg -i video.mp4 -vf "fps=1,scale=216:-1,tile=11x6" hoja.jpg` y mírala entera.
- `ffprobe`: 1080 × 1920, 30 fps, pista AAC, duración esperada. `blackdetect` sin cortes negros.
- Volumen: `ffmpeg -i video.mp4 -af ebur128 -f null -` → integrado cerca de −16 LUFS.
- Que se entienda: transcribe el MP4 final (Whisper o Parakeet) y compara con el guion.
- Revisa que ninguna palabra clave quede tapada por los botones de TikTok.
- Entrega: MP4, portada (el cuadro del gancho) y un texto sugerido para la descripción. Si la voz se hizo con
  ElevenLabs en plan gratis, revisa si exige mencionarlo.

## Ideas para los próximos videos (aprobar con el equipo antes de guionizar)

- «¿Y el freno?»: el freno, el ABS y el control de estabilidad del auto siempre mandan; qué hace la capa de seguridad.
- «¿Tengo que cambiar de auto?»: hibridación aditiva en 30 s (se suma, no reemplaza).
- «¿Cuánto gastas en bencina?»: la calculadora de la página con un caso de colectivero (escenario ilustrativo).
- «¿Mi auto sirve?»: tracción delantera y biblioteca de calibraciones; el diagnóstico decide.
- «Quién instala»: cómo se forma un técnico Lumine con Habilita (dúos, niveles, validación en taller).

## Licencias

Remotion es gratis para personas y empresas de hasta 3 empleados; si Lumine crece, necesita licencia de empresa
(remotion.dev/license). Voces y modelos: Parakeet (CC-BY-4.0), RNNoise «somnolent-hogwash» (sin derechos de autor),
tipografías OFL en `videos/public/fuentes/`.
