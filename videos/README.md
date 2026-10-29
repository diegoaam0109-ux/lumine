# Videos de la Fase 3 (Remotion)

Dos animaciones programadas para la presentación de la Fase 3:

- `salida/Video_01_Comercial_Lumine.mp4`: página comercial, 20 s (lámina 8).
- `salida/Video_02_Lumine_Habilita.mp4`: Lumine Habilita y el kit, 18 s (lámina 14).

- `salida/Video_03_Kit_Lumine_vertical.mp4`: «El kit, para el curioso», vertical 9:16 con narración, música y subtítulos (~63 s).

Cada uno trae su portada (último cuadro) en PNG para el PDF. 1920 × 1080, 30 fps, H.264, sin audio.

```bash
npm install
npm run studio   # vista previa
bash render.sh   # renderiza los dos de la Fase 3 (o: bash render.sh Comercial)
bash render.sh Tiktok   # el vertical (antes: narracion/narrar.py y narracion/musica.py)
```

Fuentes, supuestos numéricos y diferencias con los HTML: `NOTA_PRODUCCION.md`.
