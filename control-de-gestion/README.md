# Control de Gestión · Análisis Estratégico de Lumine Motors

Presentación de apoyo para la exposición del curso **Control de Gestión (Teoría)** · ICMA901 · Sección 500 · NRC 4118.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

| Archivo | Para qué |
|---|---|
| `Lumine_Analisis_Estrategico_Control_de_Gestion.pdf` | Presentar desde cualquier computador: las tipografías van incrustadas y se ve igual en todos lados. |
| `Lumine_Analisis_Estrategico_Control_de_Gestion.pptx` | Editar en PowerPoint. Cada diapositiva trae **notas del orador** con lo que hay que decir. |
| `fuentes/` | Tipografías de la página (Archivo, Figtree, IBM Plex Mono, Instrument Serif). Instálalas antes de abrir el PPT. |
| `generador/` | Script que arma la presentación desde cero (por si hay que cambiar datos). |

## Contenido (25 diapositivas)

1. Portada · 2. Índice · 3. Lumine hoy (plano del kit)
4. 01 Propósito, fuentes y escenario
5–6. 02 Escáner de ventajas competitivas (tendencias y dogmas)
7–8. 03 Relaciones de valor con los clientes (atributos y precio)
9. 04 Redes de valor · 10. 05 Discontinuidades del entorno
11–13. 06 Análisis externo (PEST, matriz impacto-incertidumbre, escenarios regulatorios)
14. 07 Cinco fuerzas · 15–16. 08 Análisis interno (factores críticos y 7S)
17–19. 09 Competencias centrales, cadena de valor y ranking frente a competidores
20–22. 10 FODA por perspectivas del CMI, cruce estratégico y problemas clave
23–24. 11 Declaración de la estrategia y ejes · 25. Cierre

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
