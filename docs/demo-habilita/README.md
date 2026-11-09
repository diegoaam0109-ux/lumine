# Demo temporal de Lumine Habilita

- **Demo:** https://diegoaam0109-ux.github.io/lumine/habilita/
- **Guion de 7 minutos:** [GUION.md](GUION.md).
- **Revisión y límites:** [REVISION.md](REVISION.md).

La entrada permite elegir participante o administrador, cada uno con cinco pasos. Se puede retroceder, salir para explorar y volver al selector. Si se abandona una práctica sin terminar, la guía lo confirma. Los cambios son locales y ficticios; no se requiere una cuenta de Claude.

Para repetir la presentación ante otra persona, pulsa **Recorrido guiado → Ver como participante**: la celebración de nivel vuelve a aparecer y se conserva el avance de las lecciones. Retroceder dentro de la guía no repite la celebración. **Restablecer datos de prueba → Restablecer** devuelve los ejemplos iniciales y prepara también sus celebraciones.

## Construir y comprobar

```sh
python3 scripts/build_habilita_demo.py --output .work/habilita-publica
python3 -m http.server 8903 --directory .work/habilita-publica
# En otra terminal, con Playwright instalado y un navegador Chromium existente:
CHROMIUM_PATH=/ruta/a/chromium HABILITA_URL=http://127.0.0.1:8903/ node tests/habilita-demo.cjs
```

El directorio resultante contiene `index.html` y fuentes locales con sus licencias. El HTML y JavaScript del navegador pueden inspeccionarse. `noindex` pide que no se indexe; no limita acceso ni evita copias.

`python3 build.py` sigue generando los dos artefactos originales en `dist/`. El constructor público trabaja sobre una copia temporal, publica solo la demo y agrega el documento HTML completo, la entrada al selector y fuentes locales. No modifica el runtime de la versión real.

## Qué publica Pages

El workflow conserva las rutas existentes del estimador (`/lumine/`), las presentaciones (`/lumine/lumine-presentaciones/`) y ventas (`/lumine/ventas/`). Añade únicamente el directorio de publicación `/lumine/habilita/`. No publica `src/`, informes ni el artefacto real dentro de ese directorio.

El repositorio de origen ya es público. Esta entrega no cambia su visibilidad. Publicar solo el resultado de compilación en Pages no oculta lo que ya está en GitHub.

## Cuando Diego avise que terminó la reunión

No hay retiro programado. Antes de retirar: guardar un archivo del commit y un ZIP del sitio generado. Luego quitar del workflow la construcción y pruebas de `/habilita/`, volver a desplegar y verificar que esa ruta deje de servirse mientras las otras tres siguen funcionando. No basta con borrar archivos localmente ni dejar de ejecutar el build: hay que reemplazar el despliegue publicado.

Revisar por separado visibilidad del repositorio, releases, artefactos y enlaces compartidos. No volver privado todo `lumine` sin comprobar las consecuencias para sus otros sitios. Retirar la demo no elimina copias o cachés anteriores.
