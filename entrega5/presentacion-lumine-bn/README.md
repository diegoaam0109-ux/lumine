# Lumine · IA Aplicada · Presentación de siete minutos

Presentación del ramo IA Aplicada al Marketing y los Negocios, NRC 4153, profesor Cristián R. Cisterna-Aravena. Grupo: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

La dirección visual final usa los logos, tipografías e imágenes de Fase 3 y Fase 4: fondos claros/oscuros y acento celeste. La primera prueba exclusivamente monocroma fue descartada por el equipo. Las imágenes del producto son ilustraciones conceptuales, identificadas como tales; no son evidencia de un kit instalado.

## Contenido y tiempo

12 láminas principales + 5 anexos. Guion de 803 palabras habladas: aproximadamente 6:43 a 130 palabras por minuto, incluidos cambios y 12 segundos de demo, con 17 segundos de margen hasta siete minutos. Reparto: Diego 2:07, Benjamín 2:21 y Lukas 2:15. Ensayar con cronómetro; GUION.md incluye recortes por prioridad y preguntas difíciles.

Se aplicó la skill `guion-defensa-grupal` entregada por el usuario: gancho antes del saludo, identidad alfabética, estructura híbrida, relevos enlazados, reparto equilibrado, cues y defensa. La pasada de estilo se hizo manualmente; no estaba disponible la skill secundaria `revisar-tics-ia`.

## Fuentes de esta versión

- `TIG_IA_Grupo01_LumineMotors_InformeFinal (1).pdf`, 33 páginas.
- `TIG_IA_Grupo01_LumineMotors_Presentacion (1).pdf`, 13 láminas.
- `TIG_IA_Grupo01_LumineMotors_Guion.pdf`.

Los originales adjuntos no se publican en esta carpeta. `contenido.json` conserva la fuente por lámina y el guion único. El trabajo no incorpora las cifras de la Fase 4 financiera del otro ramo.

## Decisiones que mejoran la defensa

- El ahorro es simulado, incluso cuando las jornadas de conducción son reales. Se declara en la evidencia y el guion.
- El caso actual de Ridge usa 19,7%, $159.000 y plantilla de respaldo. El ejemplo RAFA registrado usa 19,6% y $158.000. No se mezclan.
- Las pruebas de ataques se ejecutaron en ChatGPT con las instrucciones del estudio y revisión humana; no son garantía general de seguridad.
- La cobertura del intervalo se presenta como límite del modelo y condición para escalar.
- El ROI del estimador es un escenario con supuestos. El A/B fue dimensionado para 15 pp, no para el equilibrio aproximado de 3 pp. Se añade esa precisión, derivada de comparar los capítulos 4 y 8.
- Las 20 pruebas automáticas se presentan como resultado histórico de la integración documentada. En esta entrega no se repitió el entrenamiento ni se llamó a modelos generativos externos.

## Generar y revisar

Requiere Python con `python-docx`, Node con `playwright` y `pptxgenjs`, y Chromium. Las fuentes visuales se copian desde `fase-3/fuentes` y los recursos desde los directorios de marca del repositorio.

Desde la raíz, mantener un servidor local:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

En otra terminal:

```sh
python entrega5/presentacion-lumine-bn/generar.py
python entrega5/presentacion-lumine-bn/guion.py
node entrega5/presentacion-lumine-bn/renderizar.cjs
node entrega5/presentacion-lumine-bn/exportar.cjs
python entrega5/presentacion-lumine-bn/empaquetar.py
node entrega5/presentacion-lumine-bn/verificar.cjs
```

`renderizar.cjs` revisa las 17 láminas, carga fuentes, exporta PNG y PDF, y registra desbordes. `verificar.cjs` verifica navegación, orador, pantalla completa, retorno desde anexos y navegación sin conexión. Las métricas de los documentos originales se conservan; estas pruebas verifican los entregables, no la validez física del kit.

## Archivos y edición

- `contenido.json`: guion y datos de tiempo; una fuente para notas web, PowerPoint y guion.
- `diseno.py`: composición final Lumine de las doce láminas principales.
- `generar.py`: marco HTML/CSS, anexos y exportación de la fuente visual.
- `GUION.md`: guion, recortes, preguntas y límites.
- `salida/Lumine_IA_Presentacion.html`: presentación autónoma con los recursos incrustados. Funciona sin internet; la demo externa requiere conexión.
- `salida/Lumine_IA_Presentacion_7_min.pptx`: láminas renderizadas a alta resolución y notas del orador. Para editar gráficos y composición, cambiar la fuente y regenerar.
- `salida/Lumine_IA_Presentacion_7_min.pdf`: PDF de 17 láminas.
- `salida/Lumine_IA_Guion.pdf`, `.docx` y `.md`: guion de exposición y defensa.

Controles web: F o botón de pantalla completa; flechas y espacio; O orador; P anexos; Esc volver; Fin cierre; número + Enter saltar; Z lupa; L puntero. Si el navegador rechaza pantalla completa, se muestra un aviso.

## Publicación web y PDF compatible

`python entrega5/presentacion-lumine-bn/sitio.py` genera `lumine-presentaciones/ia-aplicada/` con el mismo visor de Fase 3. La lámina 6 reproduce automáticamente la grabación comercial de Fase 3, convertida a 1080p, junto al caso numérico del estimador. El guion incluye 12 s de observación. PowerPoint también incrusta el video.

`pdf_seguro.py` sustituye la exportación con máscaras de transparencia por un PDF de imágenes RGB verificadas: conserva las láminas a 1920×1080 y evita depender de cómo cada visor interpreta los degradados. Se verifican las 17 páginas renderizadas y se conserva una captura del cierre. El PDF presenta un fotograma del video; su reproducción ocurre en web y PowerPoint. Requiere `reportlab`, Pillow y PyMuPDF además de las dependencias anteriores.

Encuadres revisados: todos los recursos visuales conservan su proporción con `contain`, sin recorte de relleno. La unidad y los técnicos usan las versiones de mayor resolución disponibles en el repositorio. Apertura y cierre conservan el recurso completo a 16:9.
