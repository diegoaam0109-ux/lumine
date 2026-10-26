---
name: lumine-generador-ppt
description: Cómo modificar y regenerar las presentaciones de Lumine hechas con código (control-de-gestion/generador y fase-3/generador; pptxgenjs + guion.js + render.sh + LibreOffice), con sus tipografías incrustadas y su escala de letra. Úsala antes de tocar deck.js, guion.js, componer.py, qr.py, render.sh o un PPTX/PDF/GUION.md del repositorio.
---

# Generadores de presentaciones

Las presentaciones **no se editan en PowerPoint**: se generan desde código. Si editas el PPTX a mano, el próximo render
borra tu cambio. Junto con esta skill usa `presentaciones` (método) y `lumine-marca` (identidad).

## Piezas

| Archivo | Para qué |
|---|---|
| `generador/deck.js` | Arma el PPTX con pptxgenjs. Escala de letra en `TX`. |
| `generador/guion.js` | **Fuente única** del guion: va a las notas del orador y a `GUION.md`. |
| `generador/guion-md.js` | Escribe `GUION.md` desde `guion.js`. No edites `GUION.md` a mano. |
| `generador/render.sh` | PPTX → PDF (LibreOffice, región es-CL para decimales con coma) → JPG por lámina en `r/`. |
| `fase-3/generador/componer.py` | Compone fondos e imágenes con el negro de la marca (Pillow). Correr antes de `render.sh` si cambia una imagen. |
| `fase-3/generador/qr.py` | QR a la demo de Habilita (segno). |
| `generador/mkfonts.py` | Crea los .ttf de Archivo por ancho. |

## Regenerar

```bash
cd fase-3/generador        # o control-de-gestion/generador
npm install
./render.sh                # PPTX + GUION.md + PDF + r/s-*.jpg
pdffonts ../Grupo_01_LumineMotors_Fase3.pdf   # deben salir Michroma/Archivo (o Figtree, Plex Mono, Instrument Serif)
```
- Requiere LibreOffice con Impress, `pdftoppm` y las fuentes de `fuentes/` **instaladas** en el sistema
  (LibreOffice 24.2 no lee las incrustadas). Si `pdffonts` muestra Arial o DejaVu, el PDF salió con reemplazos: no lo subas.
- En Windows, las fuentes instaladas para el usuario no llegan a LibreOffice hasta cerrar sesión. `render.sh` funciona en Git Bash.
- No subas `r/` ni `lo_run/`.

## Reglas de la Fase 3 (y de toda presentación nueva)

- Escala fija `TX`: titulares 34/40 pt, cuerpo 20–24, etiquetas ≥ 16, cifras 30–48, marcas 14, institucional 11–12.
  **Si no cabe, se divide la lámina o va al anexo; nunca se achica la letra.**
- Tipografía opción C (titulares Michroma, «%» en Archivo, resto familia Archivo). `LUMINE_TIPO=A|B` recupera las otras.
- El PPTX incrusta sus fuentes (`incrustarFuentes` en `deck.js`). No lo quites: sin eso PowerPoint muestra Calibri.
- Solo paleta Lumine; marcas de estado en gris acero: ESTIMACIÓN (raya), SUPUESTO/REFERENCIA (puntos),
  POR CONFIRMAR/PENDIENTE (línea), REALIZADA.
- Fuente al pie de cada lámina, siglas explicadas, PDF 16:9, archivo `Grupo_01_LumineMotors_Fase3`.
- Tiempo: guion a 130 palabras por minuto, los tres integrantes hablan parecido. Si cambias el guion, recalcula tiempos.

## Verificar

Mira **cada** JPG de `r/`: nada montado, cortado ni fuera de margen; titular = lo que muestra la lámina; legible desde el
fondo de la sala. Revisa también que las notas del orador coinciden con `GUION.md`.
