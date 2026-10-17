# Fase 3 · Plan de Marketing, Operaciones y Recursos Humanos

Presentación del Capítulo III de Lumine Motors para **Integrador II: Taller de Empresas** · ICMA 1001 · Grupo 1 · Profesor Roberto Brito.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

| Archivo | Para qué |
|---|---|
| `Grupo_01_LumineMotors_Fase3.pdf` | Presentar desde cualquier computador: las tipografías van incrustadas. |
| `Grupo_01_LumineMotors_Fase3.pptx` | Editar en PowerPoint. Cada diapositiva trae **notas del orador** con lo que hay que decir. |
| `GUION.md` | Guion de la exposición: qué dice cada integrante, con tiempos por diapositiva y el traspaso. |
| `fuentes/` | Tipografías (Archivo, Figtree, IBM Plex Mono, Instrument Serif). Instálalas antes de abrir el PPT. |
| `generador/` | Script que arma la presentación. El guion vive en `generador/guion.js` y llega a las notas y a `GUION.md`. |

El informe de la Fase 3 (.docx) **no está en el repositorio** porque el repositorio es público. Todas las cifras de la
presentación salen de ese informe; lo que el informe deja pendiente se muestra como «Por confirmar».

## Contenido (máximo 10 minutos)

23 diapositivas para exponer (unos 9 minutos y medio, poco más de 3 por integrante): 19 con texto, una apertura con foto
por cada plan y un cierre con el logotipo gigante. Además, un anexo de 11 que solo se usa si preguntan.
La diapositiva índice del anexo tiene un enlace a cada tema, y cada diapositiva del anexo tiene un enlace de vuelta al índice.

| Integrante | Diapositivas | Contenido |
|---|---|---|
| Diego Alarcón | 1 a 6 | Portada, apertura de Marketing, objetivos, segmentación, investigación de mercado y matriz de Ansoff |
| Benjamín Torres | 7 a 13 | Posicionamiento, producto y precio, demanda y pronóstico, presupuesto de marketing, apertura de RR. HH., estructura y dotación |
| Lukas Verdugo | 14 a 23 | Lumine Habilita, nómina, apertura de Operaciones, flujo operacional, puntos de control, cronograma, resultados, sensibilidad al dólar, conclusiones y cierre |
| Anexo | 24 a 35 | Índice; hipótesis, dudas del cliente, mezcla de marketing, cobros a la red, mercado y adopción, perfiles de cargo, rentas y bonos, jornada de instalación, inversión y gasto, sensibilidad, Carta Gantt completa |

Las aperturas y el cierre no tienen texto en el guion: se pasan sin hablar.

## Imágenes

Vienen del kit de identidad (`integrador-2/identidad/`). `generador/componer.py` las combina con el negro de la marca
(degradado horneado, para que el texto siempre quede sobre fondo oscuro) y deja los fondos en `generador/assets/`:
portada (auto en rayos X), aperturas de Marketing (colectivero), Recursos Humanos (capacitación) y Operaciones (taller), y
cierre (`escenario-c`). Las fotos de taller y capacitación muestran la operación propuesta: se rotulan «Operación
proyectada · imagen ilustrativa». Las láminas con cifras no llevan fotos, para que no compitan con los datos.
Si cambias una imagen, corre `python3 componer.py` (requiere Pillow) antes de `./render.sh`.

## Legibilidad

La presentación se diseñó para leerse desde el fondo de una sala universitaria. La escala tipográfica está en `TX`
(`generador/deck.js`) y vale para todas las láminas:

| Elemento | Tamaño |
|---|---|
| Titulares (acento en serif) | 34 pt (40 pt) |
| Subtítulos y frases de cierre | 22–24 pt |
| Cuerpo | 20–22 pt |
| Etiquetas de gráficos y cajas | 16 pt o más |
| Cifras destacadas | 30–48 pt |
| Marcas de estado | 14 pt |
| Curso, fuente al pie y numeración | 11–12 pt |

Si un contenido no cabe con esos tamaños, se divide la lámina o se lleva al anexo; nunca se achica la letra.
Las marcas separan hechos de supuestos: **ESTIMACIÓN** (borde con raya), **SUPUESTO** o **REFERENCIA** (puntos),
**POR CONFIRMAR** o **PENDIENTE** (línea continua) y **REALIZADA** (verde). El detalle del rediseño, lo que se movió de lugar y
las inconsistencias que hay que revisar con el informe están en `REDISENO_LEGIBILIDAD.md`.

## Estándar del profesor

Sigue la guía de presentación de las Fases 1 y 2 de Integrador II (profesor Roberto Brito), que sirve de referencia mientras no
haya una para la Fase 3: portada con el nombre del proyecto y una frase de 15 a 20 palabras que explica qué hace, una idea por
diapositiva, **fuente al pie de cada diapositiva**, supuestos y estimaciones marcados en ámbar («Pronóstico», «Precio de
referencia», «Ahorro simulado», «Supuesto»), siglas explicadas la primera vez, conclusiones con los supuestos críticos como
preguntas, 16:9, entrega en PDF y nombre de archivo `Grupo_01_LumineMotors_Fase3`. La guía y el ejemplo no se suben al repositorio.

## Diseño

Mismo sistema visual que la presentación de Control de Gestión y la página comercial (skill `lumine-marca`): escenario negro,
un solo acento celeste, titulares que dicen la conclusión con remate en serif itálica, etiquetas mono con índice, esquinas de
visor, rótulos numerados y números condensados. Las cifras van en gráficos nativos de PowerPoint (se pueden editar); el
organigrama, el flujo operacional, la matriz de Ansoff, el mapa de posicionamiento y la Carta Gantt están dibujados con formas.

## Regenerar

```bash
cd generador
npm install
./render.sh            # PPTX, PDF y GUION.md en la carpeta de arriba, e imágenes de revisión en r/
```

`render.sh` funciona en Linux y en Git Bash para Windows. Necesita Node, LibreOffice con Impress, `pdftoppm` (Poppler) y las
fuentes de `fuentes/` instaladas; exporta con configuración regional es-CL para que los decimales salgan con coma. En Windows,
si las fuentes se acaban de instalar y el PDF sale con otra tipografía, cierra sesión y vuelve a entrar antes de exportar.
Los recursos gráficos de `generador/assets/` son los de `control-de-gestion/generador/assets/` (se regeneran allá con `node assets.js`).
