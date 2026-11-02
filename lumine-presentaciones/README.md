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
- Las láminas 23 a 36 son el anexo: el índice (lámina 22) tiene enlaces y cada anexo tiene «← índice».
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
- **P · Preguntas:** abre el buscador de los 14 anexos. Busca por código, título, pregunta o palabras clave, sin distinguir tildes ni mayúsculas. `↑` / `↓` seleccionan; `Enter` o clic abren el anexo. `Esc`, desde el buscador o el anexo, vuelve a la lámina donde abriste preguntas. El orador recuerda esa lámina de retorno.
- **Movimiento reducido:** si el sistema pide `prefers-reduced-motion`, los cambios son cortes, la lupa no anima y el láser no deja estela. Los videos mantienen su reproducción.
- **QR del cierre:** SVG local con corrección M, generado una sola vez. Abre en otra pestaña https://diegoaam0109-ux.github.io/lumine/ventas/. La presentación y el QR se ven sin internet; visitar la página comercial requiere conexión.

El motor usa únicamente APIs del navegador; no hay bibliotecas, CDN ni peticiones de red para abrir la presentación desde un pendrive. Copia la carpeta completa, incluido `fase3/qr-comercial.svg`.
