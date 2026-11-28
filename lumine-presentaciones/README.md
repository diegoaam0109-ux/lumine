# Lumine Motors · Presentaciones

Sitio estático (GitHub Pages) con las presentaciones del Taller Integrador II (UNAB, Grupo 1).
No necesita compilar nada: es HTML, CSS y JavaScript puros.

```
index.html            portada con la lista de presentaciones
engine/deck.js        motor de diapositivas (compartido por todas las fases)
engine/deck.css       estilos del motor
fase3/index.html      presentación de la Fase 3
fase3/deck-data.js    contenido: imagen, guion, video y enlaces de cada lámina
fase3/slides/NN.jpg   láminas exportadas desde PowerPoint (1920 × 1080)
fase3/video/*.mp4     videos que se reproducen sobre la lámina
```

## Cómo se presenta

- Abrir `fase3/index.html` (o el link de GitHub Pages) en Chrome o Edge.
- `F` pantalla completa · `→`/`Espacio`/clicker siguiente · `←` anterior.
- `O` abre la vista del orador en otra ventana: lámina actual, siguiente, guion y reloj total y por lámina.
  Llevar esa ventana al notebook y la principal al proyector.
- `N` pantalla negra · escribir un número + `Enter` salta a esa lámina · `?` ayuda.
- Las láminas 23 a 37 son el anexo: el índice (lámina 22) tiene enlaces y cada anexo tiene «← índice».
- Sin internet: copiar la carpeta completa a un pendrive y abrir `fase3/index.html`. Funciona igual, con videos.

## Cómo actualizar láminas (por ejemplo, Diego con las láminas 4 a 6)

1. Editar el PowerPoint original.
2. En PowerPoint: Archivo › Exportar › Cambiar tipo de archivo › JPEG (o PNG), «Todas las diapositivas».
   Tamaño recomendado 1920 × 1080.
3. Renombrar las que cambiaron a `04.jpg`, `05.jpg`, `06.jpg` y reemplazarlas en `fase3/slides/`.
4. Si cambió el guion, editar el campo `notes` de esa lámina en `fase3/deck-data.js`.
5. Commit y push. GitHub Pages se actualiza en uno o dos minutos.

Importante: si se agregan o quitan láminas, renumerar las imágenes y ajustar `deck-data.js`
(y `mainSlides`, que es el número de láminas antes del anexo).

## Cómo agregar o cambiar un video

1. Copiar el archivo a `fase3/video/` (H.264, idealmente menos de 20 MB).
2. En `fase3/deck-data.js`, en la lámina que corresponda, poner `"video": { "src": "video/archivo.mp4", "box": {...} }`.
   `box` es la posición del recuadro. Las posiciones están en % del ancho y alto de la lámina.

Los videos parten solos al llegar a la lámina, sin sonido y en bucle. Clic sobre el video lo pausa.

## Nueva presentación (Fase 5)

Copiar la carpeta `fase3` como `fase5`, reemplazar `slides/` y `video/`, rehacer `deck-data.js`
con una entrada por lámina y activar la tarjeta de la Fase 5 en `index.html`.

## Controles de la presentación

- **Apertura:** sin hash, con `#0`, con `0 + Enter` o con `Inicio`, se reproduce `video/kit.mp4` una vez dentro del marco 16:9. Al terminar pasa a la lámina 1. `→` o clic la saltan. No cuenta en el progreso. En el orador aparece «Apertura» y la siguiente es la lámina 1.
- **Navegación:** `→`, `↓`, `Espacio`, `AvPág` o `Enter` avanzan; `←`, `↑` y `RePág` retroceden. `Fin` lleva al cierre (21). Se mantienen `F`, `O`, `N`, número + `Enter` y `?`.
- **Transición:** barrido celeste de 500 ms entre láminas consecutivas, 250 ms para saltos y fundido de 400 ms desde la apertura. Otra tecla completa el efecto inmediatamente.
- **Z · Lupa:** activa el cursor de lupa; clic amplía 2,5× la zona elegida, incluidos videos y enlaces. Otro clic cambia el foco. `Z` o `Esc` salen; las flechas cambian de lámina y apagan la lupa. El clic no navega mientras está activa.
- **L · Láser:** activa o apaga el punto celeste con una estela breve. Mientras está activo, el clic no navega. Lupa y láser se desactivan mutuamente.
- **P · Preguntas:** abre el buscador de los 15 anexos. Busca por código, título, pregunta o palabras clave, sin distinguir tildes ni mayúsculas. `↑` / `↓` seleccionan; `Enter` o clic abren el anexo. `Esc`, desde el buscador o el anexo, vuelve a la lámina donde abriste preguntas. El orador recuerda esa lámina de retorno.
- **Movimiento reducido:** si el sistema pide `prefers-reduced-motion`, los cambios son cortes, la lupa no anima y el láser no deja estela. Los videos mantienen su reproducción.
- **QR del cierre:** SVG local con corrección M, generado una sola vez. Abre en otra pestaña https://diegoaam0109-ux.github.io/lumine/ventas/. La presentación y el QR se ven sin internet; visitar la página comercial requiere conexión.

El motor usa únicamente APIs del navegador; no hay bibliotecas, CDN ni peticiones de red para abrir la presentación desde un pendrive. Copia la carpeta completa, incluido `fase3/qr-comercial.svg`.

## Fase 4 (propuesta visual, 15-11-2026)

`fase4/index.html` es una presentación propia, hecha en HTML y SVG (no usa `engine/` ni láminas en JPG), para poder
animar los gráficos: 14 láminas y un anexo de defensa (A1 a A3). Se avanza con `→`, `←`, espacio o clic.
No lleva tablas del Excel: cada cifra sale del libro `integrador-2/fase-4/excel/v7_formato_curso.xlsx`.

Para cambiarla, editar `integrador-2/fase-4/presentacion/plantilla.html` y ejecutar
`python3 integrador-2/fase-4/presentacion/armar.py`, que vuelve a escribir `fase4/index.html` (fuentes en `fase4/fuentes/`,
imágenes en `fase4/img/`) y una versión de un solo archivo en `/tmp/propuesta_fase4.html` para el artefacto de Claude.
La curva de caja mensual se lee directo del libro; las demás cifras están en la plantilla.

## Fase 4: formato de exposición compartido

`fase4/index.html` usa el mismo motor de Fase 3. Sus 14 láminas principales y 3 anexos mantienen gráficos HTML/SVG animados, alojados en `renderer.html?embed` para aislar sus estilos. El escenario ocupa la pantalla conservando 16:9; las notas de diseño no se proyectan. La vista del orador las identifica como notas de diseño, no como guion.

Controles: flechas o espacio para avanzar; F pantalla completa; O orador; P buscar anexos; Esc volver; Z lupa; L láser; número + Enter para saltar. Se conservan enlaces anteriores `#lamina-N`. `renderer.html` sin parámetros conserva la vista de revisión.

Regenerar desde `integrador-2/fase-4/presentacion/armar.py`: produce el visor, los datos y el contenido, además del HTML autónomo de revisión en `/tmp/propuesta_fase4.html`. Editar la plantilla, no el renderer generado. Este cambio no modifica cifras, supuestos ni el Excel.

Verificar con un servidor HTTP desde la raíz del repositorio:

```sh
python -m http.server 8765 --bind 127.0.0.1
# En otra terminal, con Playwright disponible:
node lumine-presentaciones/engine/tests/fase4.cjs
LUMINE_DECK_URL=http://127.0.0.1:8765/lumine-presentaciones/fase3/ node lumine-presentaciones/engine/tests/deck.cjs
```

Publicación: el workflow de Pages sólo despliega `main`. Subir esta implementación a `fase4-plan-financiero` no cambia por sí solo el sitio público.

## Defensa final (diciembre de 2026)

`defensa/` es la presentación de la defensa del Taller Integrador II. Paso 2 de 3: tres conceptos visuales para elegir.

- `defensa/conceptos/index.html`: galería con las capturas y el enlace a cada concepto.
- `defensa/conceptos/<concepto>/index.html`: el concepto presentado con el motor (orador, lupa, láser, saltos).
- `defensa/conceptos/<concepto>/laminas.html#lamina-N`: las láminas en HTML y SVG, 1920 × 1080, con animaciones que
  corren al llegar a la lámina. `comun/` tiene el logo y el plano del auto en vector, la base tipográfica y los ayudantes.
- `defensa/fuentes/`: tipografías locales (licencia OFL), para que todo funcione sin internet.
- Textos y cifras de los conceptos son de ejemplo y están marcados así; las reales saldrán del archivo de cifras maestras.

Cambio en el motor (`engine/deck.js`): con láminas embebidas (Fase 4 y defensa), la lámina anterior se mantiene a la vista
hasta que la nueva termina de cargar, y una navegación nueva descarta la que aún carga. Antes, avanzar rápido dejaba un
cuadro vacío (lo notó el profesor Brito el 19-11). Prueba:

```sh
node lumine-presentaciones/engine/tests/defensa-conceptos.cjs   # conceptos y Fase 4: avance rápido sin cuadros vacíos
```

## Defensa final: presentación (primera propuesta, 28-11-2026)

`defensa/index.html` es la defensa de Integrador II con el concepto **Ruta 213** (el colectivo de referencia avanza por una
ruta de 213 km en la parte superior) y el sistema tipográfico de la Fase 4. 41 láminas en 19 minutos, índice de anexos y
15 anexos para las preguntas de la comisión.

- **Contenido único:** `defensa/generador/armar.py` (titulares, cifras, fuentes, pasos por clic, orador, tiempo y guion de
  cada lámina). Se edita ahí y se regenera con `python3 lumine-presentaciones/defensa/generador/armar.py`; escribe
  `laminas.html` y `deck-data.js`. Toda cifra sale del informe final.
- **Cifras:** `python3 defensa/generador/verificar_cifras.py informe.txt` busca cada cifra de las láminas y del guion, tal
  cual, en el texto del informe (que no se sube) y revisa los términos prohibidos.
- **Expertos:** las fotos, nombres y logos van en `defensa/privado/` (fuera de git). Sin esa carpeta, las fichas muestran el
  perfil y una silueta, y el guion dice «el especialista».
- **Imágenes provisionales:** `defensa/img/` guarda las que se reemplazan cuando estén las nuevas (`PROMPTS_IMAGENES.md`).
- **Motor:** pasos por clic dentro de una lámina (`steps`), vista previa en estado final para el orador (`preview`),
  tiempo por orador en la vista del orador (`oradores`, con alerta al pasarse), transición configurable (`transition`, 250 ms
  en la defensa) y la tecla **T** para mostrar un reloj de la exposición. Las Fases 3 y 4 no cambian.
- **Pruebas:** `node lumine-presentaciones/engine/tests/defensa.cjs` (recorre los 102 clics, orador, P y T, sin red).
