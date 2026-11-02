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
