# Fase 3 · Plan de Marketing, Operaciones y Recursos Humanos

Presentación del Capítulo III de Lumine Motors para **Integrador II: Taller de Empresas** · ICMA 1001 · Grupo 1 · Profesor Roberto Brito.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo.

| Archivo | Para qué |
|---|---|
| `Lumine_Fase_3_Plan_de_Marketing_Operaciones_y_RRHH.pdf` | Presentar desde cualquier computador: las tipografías van incrustadas. |
| `Lumine_Fase_3_Plan_de_Marketing_Operaciones_y_RRHH.pptx` | Editar en PowerPoint. Cada diapositiva trae **notas del orador** con lo que hay que decir. |
| `GUION.md` | Guion de la exposición: qué dice cada integrante, con tiempos por diapositiva y el traspaso. |
| `fuentes/` | Tipografías (Archivo, Figtree, IBM Plex Mono, Instrument Serif). Instálalas antes de abrir el PPT. |
| `generador/` | Script que arma la presentación. El guion vive en `generador/guion.js` y llega a las notas y a `GUION.md`. |

El informe de la Fase 3 (.docx) **no está en el repositorio** porque el repositorio es público. Todas las cifras de la
presentación salen de ese informe; lo que el informe deja pendiente se muestra como «Por confirmar».

## Contenido (máximo 10 minutos)

16 diapositivas para exponer (unos 9 minutos y medio, poco más de 3 por integrante) y un anexo de 10 que solo se usa si preguntan.
La diapositiva índice del anexo tiene un enlace a cada tema, y cada diapositiva del anexo tiene un enlace de vuelta al índice.

| Integrante | Diapositivas | Contenido |
|---|---|---|
| Diego Alarcón | 1 a 5 | Portada, objetivos, segmentación, investigación de mercado y matriz de Ansoff |
| Benjamín Torres | 6 a 10 | Posicionamiento, mix (producto y precio), demanda y pronóstico, presupuesto de marketing, estructura y dotación |
| Lukas Verdugo | 11 a 16 | Política y presupuesto de RR.HH., flujo operacional, Carta Gantt, presupuesto de operaciones, conclusiones y cierre |
| Anexo | 17 a 27 | Índice; hipótesis, dudas del cliente, mezcla de marketing, cobros a la red, mercado y adopción, perfiles de cargo, rentas y bonos, jornada de instalación, inversión y gasto, sensibilidad |

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
