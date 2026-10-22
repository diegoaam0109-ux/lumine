# Control 3 · Avance 1 del TIG · Control de Gestión

Presentación del Avance 1 del Trabajo Integrado de Gestión (TIG) de Control de Gestión (ICMA901, Sección 500, NRC 4118,
UNAB; profesor Leonardo Lizana Contreras), martes 27 de octubre de 2026 a las 15:00. Cubre los puntos 3 a 6 del
instructivo: introducción, comprensión del negocio, declaraciones estratégicas compartidas y análisis estratégico de
Lumine Motors. 13 láminas (unos 13:49 a 130 palabras por minuto; máximo 15) y un anexo de 11 láminas con índice enlazado.
La formulación de la estrategia y el Cuadro de Mando Integral son el Avance 2 (base en `solemne-2/`).

| Archivo | Qué es |
|---|---|
| `Lumine_Control3_Avance1_TIG.pptx` | Presentación editable, con las tipografías incrustadas y el guion completo en las notas. |
| `Lumine_Control3_Avance1_TIG.pdf` | Versión para revisar o proyectar. |
| `GUION.md` y `Lumine_Control3_Guion.docx` | Guion por expositor con el tiempo de cada lámina y el apartado del informe que respalda. |
| Manual de defensa (fuera del repositorio) | `Lumine_Control3_Defensa_y_Coherencia.docx`: cómo leer cada matriz, origen de cada cifra, 15 preguntas difíciles, correspondencia lámina → informe y ajustes exactos al Word. Cita el borrador del informe, así que ni el archivo ni su generador (`defensa-docx.js`) se suben. |
| `RESPALDO.md` | Decisiones del equipo, diferencias entre fuentes y pendientes. |
| `generador/` | `deck.js` (pptxgenjs), `guion.js` (fuente única del guion y del anexo), `guion-md.js`, `guion-docx.js` y `render.sh`. |
| `fuentes/` | Tipografías de la marca (licencia OFL). |

Reparto: Diego Alarcón 1–5 y 13 (abre y cierra), Benjamín Torres 6–8 (entorno e industria), Lukas Verdugo 9–12
(capacidades internas, FODA y brechas).

## Regenerar

```bash
cd control-3/generador
npm install
bash render.sh
```

`render.sh` arma el PPTX, el `GUION.md`, los dos Word, el PDF (LibreOffice con configuración es-CL) y una imagen por lámina
en `r/`. En Windows, si `pdffonts` muestra Arial o DejaVu, las fuentes de `fuentes/` no están cargadas en la sesión (ver
CLAUDE.md). Para cambiar textos o el reparto, edita `generador/guion.js` y regenera.

El instructivo, el borrador del informe, los instrumentos y el prompt del curso no se suben: el repositorio es público.
