# Control de Gestión · Análisis Estratégico de Lumine Motors

Presentación de apoyo para la exposición del curso **Control de Gestión (Teoría)** · ICMA901 · Sección 500 · NRC 4118.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

| Archivo | Para qué |
|---|---|
| `Lumine_Analisis_Estrategico_Control_de_Gestion.pdf` | Presentar desde cualquier computador: las tipografías van incrustadas y se ve igual en todos lados. |
| `Lumine_Analisis_Estrategico_Control_de_Gestion.pptx` | Editar en PowerPoint. Cada diapositiva trae **notas del orador** con lo que hay que decir. |
| `fuentes/` | Tipografías de la página (Archivo, Figtree, IBM Plex Mono, Instrument Serif). Instálalas antes de abrir el PPT. |
| `GUION.md` | Guion de la exposición: qué dice cada integrante en cada diapositiva. |
| `generador/` | Script que arma la presentación desde cero (por si hay que cambiar datos). El guion vive en `generador/guion.js`. |

## Contenido (máximo 15 minutos)

16 diapositivas para exponer (unos 13 minutos, 4 por integrante) y un anexo de 9 que solo se usa si preguntan.
El guion completo, con tiempos y preguntas probables, está en `GUION.md` y en las notas del orador del PPT.

| Integrante | Diapositivas | Contenido |
|---|---|---|
| Diego Alarcón | 1 a 5 | Portada, la empresa, instrumentos, escáner de ventajas y valor para el cliente |
| Benjamín Torres | 6 a 10 | PEST, escenarios regulatorios, cinco fuerzas, factores críticos y competencias centrales |
| Lukas Verdugo | 11 a 16 | Cadena de valor, FODA, cruces, declaración de la estrategia, ejes y cierre |
| Anexo | 17 a 25 | Atributos del cliente, dogmas, redes de valor, discontinuidades, matriz impacto-incertidumbre, 7S, ranking y problemas clave |

Todos los datos salen del *Análisis Estratégico* y de los instrumentos 03 (PEST), 05 (Competencias Centrales) y 06 (Cadena de Valor).

## Diseño

Mismo sistema visual que la página comercial (`ventas/` en la rama de la página): escenario negro, un solo acento celeste `#22B8F0`,
titulares anchos en mayúsculas con acento en serif itálica, etiquetas mono de instrumento, esquinas de visor y números condensados.
El logo y el plano del kit son los vectores de la página.

## Tipografías

El PPT usa estas familias; si el computador no las tiene, PowerPoint las reemplaza y se pierde el estilo (el PDF no tiene este problema).
Instala los `.ttf` de `fuentes/` (doble clic › Instalar) y vuelve a abrir PowerPoint:

- Archivo SemiExpanded ExtraBold (titulares) y Archivo Condensed (números grandes)
- Figtree (texto) · IBM Plex Mono (etiquetas) · Instrument Serif (acentos en itálica)

Son fuentes libres bajo la licencia SIL Open Font License 1.1 (incluida en `fuentes/`); los archivos traen solo el alfabeto latino.

## Regenerar

```bash
cd generador
npm install
python3 mkfonts.py     # crea las .ttf en fonts/ (requiere pip install fonttools brotli)
node assets.js         # logo, fondos y plano en assets/
./render.sh            # PPTX + PDF en la carpeta de arriba e imágenes de revisión en r/
```
