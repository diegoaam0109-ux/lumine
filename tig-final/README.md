# TIG · entrega final · Control de Gestión

Presentación de la entrega final del Trabajo Integrado de Gestión (TIG) de Control de Gestión (ICMA901, Sección 500,
NRC 4118, UNAB; profesor Leonardo Lizana Contreras). Recorre el informe final de Lumine Motors: problema y negocio,
diagnóstico, estrategia, objetivos, Cuadro de Mando Integral, análisis de la información, recomendaciones y conclusiones.
15 láminas (unos 12:00 a 130 palabras por minuto; el instructivo da de 10 a 15) y un anexo de 19 láminas con índice
enlazado.

| Archivo | Qué es |
|---|---|
| `Lumine_TIG_Final_Control_de_Gestion.pptx` | Presentación editable, con las tipografías incrustadas y el guion completo en las notas. |
| `Lumine_TIG_Final_Control_de_Gestion.pdf` | Versión para revisar o proyectar. |
| `GUION.md` y `Lumine_TIG_Final_Guion.docx` | Guion por expositor, con el tiempo de cada lámina y el apartado del informe que respalda. |
| `RESPALDO.md` | Decisiones del equipo y pendientes. |
| `generador/` | `deck.js` (pptxgenjs), `guion.js` (fuente única del guion y del anexo), `guion-md.js`, `guion-docx.js` y `render.sh`. |
| `fuentes/` | Tipografías de la marca (licencia OFL). |

Reparto: Diego Alarcón 1–5 y 15 (abre y cierra), Benjamín Torres 6–9 (diagnóstico, brechas, estrategia y objetivos),
Lukas Verdugo 10–14 (mapa, análisis de la información y recomendaciones).

## Regenerar

```bash
cd tig-final/generador
npm install
bash render.sh
```

`render.sh` arma el PPTX, el `GUION.md`, el Word del guion, el PDF (LibreOffice con configuración es-CL) y una imagen por
lámina en `r/`. En Windows, si `pdffonts` muestra Arial o DejaVu, las fuentes de `fuentes/` no están cargadas (ver CLAUDE.md).

El informe final (Word) y el Excel de datos y cálculos no se suben: el repositorio es público.
