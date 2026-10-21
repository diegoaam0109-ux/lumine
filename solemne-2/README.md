# Solemne 2 · Control de Gestión

Presentación oral de la Solemne 2 de Control de Gestión (ICMA901, Sección 500, NRC 4118, UNAB): de la estrategia de Lumine
Motors (presentación anterior del curso) a un CMI en red de 17 objetivos y 20 relaciones. 15 láminas (unos 13:48 a 130
palabras por minuto; máximo 15) y un anexo de 15 láminas con índice enlazado para la defensa.

| Archivo | Qué es |
|---|---|
| `Lumine_Solemne2_CMI_Control_de_Gestion.pptx` | Presentación editable, con las tipografías incrustadas y el guion completo en las notas. |
| `Lumine_Solemne2_CMI_Control_de_Gestion.pdf` | Versión para revisar o proyectar. |
| `GUION.md` | Guion por expositor, con tiempos y transiciones (se genera desde `generador/guion.js`). |
| `RESPALDO.md` | Decisiones del equipo, contradicciones entre fuentes, riesgos de la defensa y preguntas para ensayar. |
| `generador/` | `deck.js` (pptxgenjs), `guion.js` (fuente única del guion y del anexo), `guion-md.js`, `render.sh` y `qr.py` (código QR a la demo de Habilita). |
| `fuentes/` | Tipografías de la marca (licencia OFL). |

Reparto: Diego Alarcón 1–5, Benjamín Torres 6–10, Lukas Verdugo 11–15.

## Regenerar

```bash
cd solemne-2/generador
npm install
bash render.sh
```

`render.sh` arma el PPTX, el `GUION.md`, el PDF (LibreOffice con configuración es-CL) y una imagen por lámina en `r/`.
En Windows, si `pdffonts` muestra Arial o DejaVu, las fuentes de `fuentes/` no están cargadas en la sesión (ver CLAUDE.md).

Para cambiar textos del guion o el reparto, edita `generador/guion.js` y regenera. Los archivos del paquete de la Solemne
(dossier, guion original, anexos y Excel) no se suben: el repositorio es público.
