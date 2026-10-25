# Nota de producción · videos de la Fase 3

Dos videos para las láminas que los tienen reservados en la presentación de la Fase 3:
**lámina 8** («Del interés al diagnóstico», página comercial) y **lámina 14** («Formar solo lo que falta», Lumine Habilita).
Se hicieron con **Claude Code + Remotion** (animación programada en React, la misma idea del video de referencia),
sin grabar pantalla. Son deterministas: el mismo código produce siempre el mismo video.

| | Video 01 · Comercial | Video 02 · Lumine Habilita |
|---|---|---|
| Archivo | `salida/Video_01_Comercial_Lumine.mp4` | `salida/Video_02_Lumine_Habilita.mp4` |
| Duración | 20,0 s (600 cuadros) | 18,0 s (540 cuadros) |
| Formato | 1920 × 1080, 30 fps, H.264, yuv420p, **sin audio** | igual |
| Portada para el PDF | `salida/Video_01_Comercial_Lumine_portada.png` (último cuadro) | `salida/Video_02_Lumine_Habilita_portada.png` (último cuadro) |
| Fuente editable | `src/Comercial.tsx` | `src/Habilita.tsx` + `src/kit3d.ts` |

Comprobado con `ffprobe` (duración, resolución, cuadros, sin pista de audio) y `blackdetect` (sin cuadros negros).
Se revisaron cuadros de cada escena reducidos a la mitad para confirmar que se leen.

## Video 01 · página comercial (20 s) · versión 2

La versión 1 (fotos con texto encima) gustó pero no convenció: se veía como aviso y no como la página. La versión 2
**muestra la página funcionando** y sigue el mismo recorrido de la lámina 8, con una barra fija que marca el paso:
**01 Conoce → 02 Calcula → 03 Verifica → 04 Agenda**. La versión 1 quedó en el historial de git (commit 4e8a0f7).

| Tiempo | Paso | Componente recreado (ventas/src) | Imagen |
|---|---|---|---|
| 0–4 s | Conoce | Portada: un escaneo celeste recorre el auto y revela el kit; «Tu auto, *ahora* HÍBRIDO», las tres lecturas y los dos botones (se ilumina «Calcula tu gasto») | `portada` (rayos X) |
| 4–9,5 s | Calcula | Calculadora: «Mi auto», bencina 93 y los deslizadores que se mueven desde los valores iniciales de la página (40 km, 5 días, 12 km/L) hasta 180, 6 y 10; la lectura en vivo cambia con ellos | `bencinera` |
| 9,5–14,2 s | Verifica | Verificador guiado: «Toyota Yaris 2016» (el ejemplo de la página), tracción delantera, más de 80 km, para mí → «Buen candidato» y botón «Agendar diagnóstico» | `particulares` |
| 14,2–17,3 s | Agenda | Formulario «Empieza con un *diagnóstico.*» con el auto ya ingresado desde el verificador; nombre y teléfono vacíos; luego diagnóstico en taller → instalación y entrega | `taller` |
| 17,3–20 s | Cierre | «Estima tu ahorro. *Solicita un diagnóstico.*» | `portada` |

Transición principal: un barrido celeste de 0,6 s (la misma línea del escaneo de la portada). Grano fino de película
encima de todo. Tipografía Archivo variable (eje de ancho, como la página: 68% monumental, 75% cifras, 112% titulares).

**Fórmula** (igual a la calculadora de `ventas/`, `ahorroPct: 20`, base de 4,33 semanas al mes):

```
litros_mes = 180 × 6 × 4,33 / 10            = 467,64 L
gasto_mes  = 467,64 × $1.459                = $682.286,76  → $682.287
ahorro_mes = gasto_mes × 0,20               = $136.457,35  → $136.457
con_kit    = gasto_mes − ahorro_mes         = $545.829,41  → $545.829
ahorro_año = ahorro_mes × 12                = $1.637.488,22 → $1.637.488
```

Los valores se calculan en `src/Comercial.tsx` (no están escritos a mano) y se redondean a pesos solo al mostrarlos.
La cifra queda estable desde los 6,3 s: hay 3,2 s de lectura antes del cambio de escena. Los valores intermedios
mientras se mueven los deslizadores también salen de la fórmula (con el paso de 5 km de la página).

**Aclaraciones que aparecen en pantalla**: «Escenario ilustrativo con 20% de ahorro supuesto · estimación, no medición»;
«precio de ejemplo de la página, no verificado hoy»; «Imagen conceptual»; «Proceso propuesto»; y al cierre
«Ahorro: estimación de ingeniería con 20% supuesto, no medida en autos chilenos».

**Diferencias con el HTML**: es una recreación de los componentes, no una captura. Se agrandaron (alrededor de 2×)
para leerse en la sala y se dejaron solo los controles que explican el cálculo. El verificador abrevia el saludo del
bot; las preguntas, las opciones y el resultado son los de la página. El formulario no muestra nombres ni teléfonos
(quedan los textos de ejemplo) y no se envía nada: lo dice en pantalla. No hay cursor ni mensaje de éxito.
La unidad de control no se menciona «con IA», como en la versión 1.

## Video 02 · Lumine Habilita (18 s)

| Tiempo | Escena | Qué se reutiliza del HTML |
|---|---|---|
| 0–3 s | «Lumine Habilita» · «Del diagnóstico al aprendizaje aplicado», con la portada de la demo de fondo | Captura real de `dist/lumine-habilita-demo.html` (sin inicio de sesión) |
| 3–6 s | «Forma solo *lo que falta*»: mapa de las 39 competencias por nivel (N1 7 · N2 23 · N3 8 · N4 1), brecha marcada y ruta del nivel 2 | Conteos y nombres de `src/data.js`: bloques «Recepción y diagnóstico», «Montaje sin energía», «Integración y energización» |
| 6–14 s | Laboratorio 3D: el auto gira despacio, pasa a Rayos X, se separa (Despiece) y se destacan tres piezas con su competencia | Geometría, anclas y colores de `src/engine3d.js`; modos «Rayos X» y «Despiece» de `src/view-lab.js`; competencias C14, C15 y C22 |
| 14–18 s | El kit vuelve a armarse. «Identificar. Practicar. *Validar competencias.*» con la validación como etapa aparte | Flujo de la portada de Habilita: diagnosticar, armar la ruta, validar en el taller |

**Piezas y competencias** (de `src/data.js`):
asistencia eléctrica trasera → Montaje sin energía · C14; banco de baterías → Montaje sin energía · C15;
unidad de control → Integración y energización · C22.

**Diferencias con el HTML**:
- El visor es una **recreación para video** del motor 3D de Habilita (`src/kit3d.ts`): misma geometría y mismas
  piezas, pero la cámara se anima por cuadro en vez de responder al mouse, y se agregó un brillo celeste a las piezas
  del kit para que se lean desde el fondo de la sala.
- La separación es la vista didáctica «Despiece» del laboratorio, no un procedimiento de desmontaje (lo dice en pantalla).
- La marca de competencias dominadas y con brecha es una **selección ilustrativa** (rotulada así): no es el resultado de
  ningún técnico. No hay nombres, avances, certificados ni aprobaciones.
- La unidad de control se rotula «Unidad de control» (en el HTML, «Unidad de control con IA»), para no abrir una
  pregunta técnica en una lámina de RR.HH.

## Decisiones de contenido

- Rótulos neutros donde el informe y la identidad no coinciden (preguntas abiertas en `CLAUDE.md`): «Banco de
  baterías» en vez de «Baterías LFP» y «asistencia eléctrica trasera» sin decir cuántos motores.
- Tipografías de la marca, sin sustituciones: Archivo SemiExpanded ExtraBold (titulares), Archivo Condensed (cifras),
  Instrument Serif itálica (acento), Figtree (texto) e IBM Plex Mono (etiquetas). Las .ttf están en `public/fuentes/`.
- Paleta de la página comercial: fondo `#020304`, texto `#ececec`, acento único `#22B8F0`; ámbar punteado solo para el
  supuesto del ahorro y la selección ilustrativa.
- Márgenes de 84–96 px; texto de 30–46 px, etiquetas mono de 22–28 px, titulares de 72–124 px y cifra principal de 236 px.
- Una sola transición (fundido de 0,5 s) entre escenas; movimiento lento, sin destellos.

## Cómo volver a generarlos

```bash
cd videos
npm install
npm run studio        # vista previa interactiva (Remotion Studio)
bash render.sh        # los dos MP4 y sus portadas en salida/
```

`remotion.config.ts` usa el Chromium de las sesiones en la nube si existe; en otro equipo Remotion descarga el suyo.
Para cambiar el escenario de la calculadora, edita `ESCENARIO` en `src/Comercial.tsx`.
