# Fase 3 · Plan de Marketing, Operaciones y Recursos Humanos

Presentación del Capítulo III de Lumine Motors para **Integrador II: Taller de Empresas** · ICMA 1001 · Grupo 1 · Profesor Roberto Brito.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

| Archivo | Para qué |
|---|---|
| `Grupo_01_LumineMotors_Fase3.pdf` | Presentar desde cualquier computador: las tipografías van incrustadas. |
| `Grupo_01_LumineMotors_Fase3.pptx` | Editar en PowerPoint. Cada diapositiva trae **notas del orador** con lo que hay que decir. |
| `GUION.md` | Guion de la exposición: qué dice cada integrante, con tiempos por diapositiva y el traspaso. |
| `fuentes/` | Tipografías: Michroma y la familia Archivo (expandida, normal, semicondensada y condensada) que usa la presentación, y las de la marca (Figtree, IBM Plex Mono, Instrument Serif) para la opción A. Ya van incrustadas en el PPTX. |
| `generador/` | Script que arma la presentación. El guion vive en `generador/guion.js` y llega a las notas y a `GUION.md`. |

El informe de la Fase 3 (.docx) **no está en el repositorio** porque el repositorio es público. Todas las cifras de la
presentación salen de ese informe; lo que el informe deja pendiente se muestra como «Por confirmar».

## Contenido (máximo 10 minutos)

Versión ejecutiva (18-10-2026): **14 láminas para exponer** (portada, 12 de contenido y cierre; unos 9 minutos) y un anexo
de 11 que solo se usa si preguntan. La lámina índice del anexo tiene un enlace a cada tema, y cada lámina del anexo tiene un
enlace de vuelta al índice. El detalle de qué se fusionó y dónde quedó cada dato está en `VERSION_EJECUTIVA.md`.

| Integrante | Láminas | Contenido |
|---|---|---|
| Diego Alarcón | Portada, 01 a 03 | El mercado y nuestra meta, validar antes de vender, una oportunidad sin oferta en Chile (Ansoff y posicionamiento) |
| Benjamín Torres | 04 a 07 | Esencial y Plus, la demanda, cómo llegamos al cliente (mix y presupuesto), de 13 a 56 personas |
| Lukas Verdugo | 08 a 12 y cierre | Lumine Habilita, de la cotización a la postventa, escalar sin adelantarse a la demanda, los números y las conclusiones |
| Anexo | 15 a 26 | Índice; hipótesis, dudas del cliente, mezcla de marketing, cobros a la red, mercado y adopción, perfiles de cargo, rentas, bonos y nómina, jornada de instalación, inversión y gasto, sensibilidad, Carta Gantt completa |

El cierre no tiene texto en el guion: queda en pantalla durante las preguntas.

## Imágenes

Vienen del kit de identidad (`integrador-2/identidad/`). `generador/componer.py` las combina con el negro de la marca
(degradado horneado, para que el texto siempre quede sobre fondo oscuro) y deja los fondos en `generador/assets/`:
portada y cierre (auto en rayos X, con halo celeste bajo el kit), el acercamiento al kit de la lámina 04, la unidad de control
de la 03, una foto por etapa en la 09 y los fondos `fondo-rejilla` (láminas de estrategia) y `fondo-horizonte` (láminas de
proceso). Las fotos de taller muestran la operación propuesta y se rotulan como imagen ilustrativa.
El detalle del rediseño visual premium y las observaciones académicas están en `REDISENO_PREMIUM.md`.
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
diapositiva, **fuente al pie de cada diapositiva**, supuestos y estimaciones marcados con un recuadro gris de borde punteado o de raya («Pronóstico», «Precio de
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

**Tipografía (opción C, «deportiva», elegida por el equipo el 17-10-2026):** titulares en Michroma (estilo Eurostile);
el «%» de los titulares va en Archivo porque el de Michroma se lee como «o/o». Acento en Archivo Expanded Light itálica
celeste, texto en Archivo, etiquetas en Archivo SemiCondensed y cifras en Archivo Condensed. Las otras opciones siguen
disponibles para comparar: `LUMINE_TIPO=B` (titulares en Archivo Expanded) o `LUMINE_TIPO=A` (la de la marca, con serif
itálica y mono). Los .ttf de Archivo se crean con `generador/mkfonts.py`; Michroma sale de `@fontsource/michroma`.

El PPTX trae sus tipografías **incrustadas** (`ppt/fonts/`), así se ve con la letra de la marca aunque el
computador no las tenga instaladas. Si PowerPoint mostrara Calibri o Arial, instala las de `fuentes/` (doble clic › Instalar)
y vuelve a abrirlo. El PDF siempre trae las fuentes.

`render.sh` funciona en Linux y en Git Bash para Windows. Necesita Node, LibreOffice con Impress, `pdftoppm` (Poppler) y las
fuentes de `fuentes/` instaladas; exporta con configuración regional es-CL para que los decimales salgan con coma. En Windows,
si las fuentes se acaban de instalar y el PDF sale con otra tipografía, cierra sesión y vuelve a entrar antes de exportar.
Los recursos gráficos de `generador/assets/` son los de `control-de-gestion/generador/assets/` (se regeneran allá con `node assets.js`).
