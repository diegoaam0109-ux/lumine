# Avance 2 del TIG = Solemne 2 · Control de Gestión (ICMA901) · 17-11-2026

Presentación de la Solemne 2: formulación OVA, ejes estratégicos, mapa y Cuadro de Mando Integral de Lumine Motors.
10 láminas más portada (unos 12 minutos), bibliografía y anexo de 14 temas con índice enlazado.

- `Lumine_Avance2_Solemne2_Control_de_Gestion.pptx` / `.pdf`: la presentación (tipografías incrustadas).
- `Lumine_Avance2_Solemne2_Guion.docx` / `.pdf`: notas breves por lámina, texto ampliado para ensayar, términos por integrante y banco de preguntas.
- `REGISTRO_CORRECCIONES.md`: qué cambió respecto del TIG final del 02-11 y dónde.
- `TIG_FINAL_INICIATIVAS_Y_STRATEX.md`: material reservado y pendientes para el TIG final del 24-11.

Cómo se genera (en `generador/`):

```bash
./armar.sh          # arma deck.js con las piezas comunes del TIG final + laminas.part.js + anexo.part.js
bash render2.sh     # PPTX, PDF y una imagen por lámina en r<fecha>/
node guion-docx.js  # Word del guion
```

El guion vive en `guion.js` (una sola fuente para las notas del orador y el Word). Los datos tienen corte al 12-11-2026:
Fase 3 v7 y Fases 1 y 2 corregidas (plan aprobado) y Plan Financiero de la Fase 4 en elaboración (provisional).
El informe (Word) del Avance 2 y del TIG final se genera localmente y no se sube: el repositorio es público.
