# Lumine Motors · contexto para Claude

Lee esto antes de trabajar. Resume lo que el equipo le fue enseñando a Claude en las sesiones anteriores:
la app de capacitación y la página comercial (chat "A") y la presentación de Control de Gestión.

## Quiénes y qué

- **Lumine Motors Chile SpA**: kit de hibridación aditiva para autos a combustión de **tracción delantera**. Suma un motor
  eléctrico en el **eje trasero**, un banco de baterías **LFP** y una unidad de control; el motor original, la transmisión
  y la alimentación quedan intactos. El freno, el ABS y el control de estabilidad originales siempre mandan sobre el kit.
- La empresa es **preoperativa**: sin taller, personal, clientes ni flujo de caja. No hay estados financieros (el Plan
  Financiero no existe aún).
- Equipo: **Diego Alarcón** (dueño de esta cuenta y del repositorio), **Benjamín Torres** y **Lukas Verdugo**. UNAB.
- Segmento: alto kilometraje, prioridad a colectiveros y conductores de aplicación; luego taxi básico y particular de
  trayecto largo. La página comercial vende a **particulares y flotas, nunca a talleres**.
- Ahorro: "hasta 20% menos bencina en ciudad" es una **estimación de ingeniería, no medida en autos chilenos**. Dilo así.
- Marco legal: Ley N° 21.793 publicada (14-01-2026) **sin reglamento**; la única referencia es el borrador del MTT de 2021.

## Cómo trabajar con el equipo

- Escribe siempre en **español** (Chile), directo y sin relleno.
- **Nunca inventes datos.** Lo que no existe se muestra como **«Por confirmar»** (precio, % de ahorro, garantía, tiempo de
  instalación, WhatsApp, correo: todos `null` en `ventas/src/lib/datos.ts`). Lo mismo con normas o cifras sin fuente.
- Tienes autorización amplia para mejorar diseño y experiencia ("te autorizo a hacer todo, mándate"), pero las decisiones
  de negocio abiertas (abajo) se preguntan.
- **Al terminar un bloque de trabajo**: actualiza los artefactos publicados **y** entrega el código base actualizado
  (zip con `git archive`). Lo pidieron explícitamente.
- Haz commit y push en la rama de la sesión. **No abras pull requests** salvo que lo pidan.
- El listón visual es alto: si algo se ve básico, de baja calidad o en "blanco nativo", lo rechazan. Crea los recursos
  visuales que hagan falta en alta resolución; verifica con capturas en PC y teléfono, modo oscuro y claro.
- **El repositorio es público.** No subas secretos, claves ni documentos internos del curso sin preguntar.

## Mapa del repositorio

| Ruta | Qué es | Cómo se trabaja |
|---|---|---|
| `src/`, `build.py`, `manifest.json`, `dist/`, `tests/` | **Lumine Habilita**: app de capacitación y habilitación del técnico instalador (JS sin dependencias). | `python3 build.py`; `npm test`; `npm run e2e`. Detalle en `README.md` y decisiones en `CAMBIOS.md`. |
| `ventas/` | **Página comercial** (Vite + React 19 + TS + Tailwind 4 + framer-motion + Radix, estructura shadcn hecha a mano). | `npm run typecheck`, `npm run build:artefacto` (un HTML en `dist-artefacto/`), `npm run e2e`. Ver `ventas/README.md`. |
| `control-de-gestion/` | **Presentación del curso** Control de Gestión (Teoría, ICMA901, Sección 500, NRC 4118): PPT, PDF, `GUION.md`, `fuentes/`. | `generador/`: `deck.js` (pptxgenjs) + `guion.js` (fuente única del guion y las notas) + `render.sh`. |
| `integrador-2/` | **Integrador II: Taller de Empresas** (ICMA 1001, Grupo 1, prof. Roberto Brito), Fase 3 cap. III. `identidad/`: kit de marca listo (logo, fondos, 20 imágenes, fuentes, `paleta.css`). | Presentación en `presentacion/`, mismo método que `control-de-gestion/generador/`. El .docx del informe no se sube. |
| `.claude/skills/ui-ux-pro-max/` | Skill de diseño de interfaces (MIT). | `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --design-system` |
| `.claude/skills/presentaciones/` | Skill con el método de presentaciones del equipo: lámina como apoyo y no como guion, tiempo según la rúbrica, anexo para la defensa y un plan aprobado antes de construir. | Úsala con `lumine-marca` para cualquier presentación nueva. |
| `.claude/skills/lumine-marca/` | Skill con el sistema visual de Lumine (colores, tipografías, motivos, recursos). | Úsala para cualquier pieza nueva con la marca. |
| `.claude/skills/tiktok-lumine/` | Skill con el método para videos verticales de la marca (guion, voz de Lukas, sincronización, escenas, render y control de calidad, ideas de próximos videos). | Úsala con `lumine-marca`; `videos/narracion/preparar.sh` instala las herramientas y la skill oficial `remotion-best-practices` (no se sube). |
| `entrega3/`, `entrega4/` | **Trabajo final de IA aplicada** (UNAB, Grupo 1, NRC 4153): estimador de ahorro con IA, prototipo, informe técnico del modelo matemático y revisión cruzada con varias IA. | Pasos para reproducir en `entrega3/README.md`; resultados de la Entrega 4 en `entrega4/Resultados_mejoras_modelo_E4.md`. |
| `videos/` | **Videos** (Remotion): comercial de 20 s (lámina 8), Lumine Habilita de 18 s (lámina 14) y «El kit, para el curioso» vertical con narración; MP4 y portadas en `salida/`. | `bash render.sh [Tiktok]`; `npm run studio`; narración en `narracion/`. Detalle en `NOTA_PRODUCCION.md`. |
| `fase-3/` | **Presentación de la Fase 3** de Integrador II: Taller de Empresas (ICMA 1001, Grupo 1, profesor Roberto Brito): Capítulo III, Plan de Marketing, Operaciones y RR.HH. | Generador propio copiado del de Control de Gestión: `generador/deck.js` + `guion.js` + `render.sh` (también en Git Bash para Windows). El informe .docx no se sube. |


## Artefactos publicados (cuenta de Diego)

| Qué | Link | Se publica desde |
|---|---|---|
| Página comercial | https://claude.ai/artifact/XGpgpuDtxJvtiAjbRDwJ2o | `ventas/dist-artefacto/index.html` |
| Lumine Habilita (demo) | https://claude.ai/artifact/JpdUMVYztFtjQYkcAehELb | `dist/lumine-habilita-demo.html` |
| Lumine Habilita (real) | https://claude.ai/artifact/KrYbLr84sVrfJoRT2wvhP9 | `dist/lumine-habilita.html` (capacidades `db` con `DB_RULES`, `user` con `profile`, `downloads`) |
| Guion de la presentación | https://claude.ai/code/artifact/e0db2f29-05e7-42d1-b4a7-9cfcb5d1741b | documento editable |
| Guion y teleprompter del video vertical (para Lukas) | https://claude.ai/artifact/S3GGUnRgjajA8U7Ya2yLLJ | `videos/narracion/guion-lukas.html` |

Para republicar en el mismo link hay que publicar el mismo archivo desde una sesión con permiso de edición sobre el
artefacto. Si cambian las `DB_RULES` de Habilita, hay que volver a publicar la versión real.

## Decisiones ya tomadas

**Lumine Habilita** (detalle en `CAMBIOS.md`):
- 39 competencias, 35 tareas, 17 reglas, 8 indicadores, 4 tipos de usuario; 4 niveles (aprendiz a formador).
- D18: el nivel 3 firma su propio trabajo; el nivel 4 firma revisiones cruzadas; lo legal es solo del Responsable Técnico (D17).
- D13: rotación de duos voluntaria, cada 4 meses como mínimo, por solicitud escrita al Responsable Técnico.
- Dos técnicos de nivel 1 nunca forman duo (salvo el arranque, bajo el Responsable Técnico).
- Revalidación del core de seguridad cada 24 meses; período autónomo del nivel 3: 90 días; 392 h si se cursa todo.

**Página comercial**:
- Oscuro por defecto, con interruptor claro/oscuro visible; estilo cinematográfico (referencias Lamborghini, Ferrari, AWE y Apple)
  combinado con la marca.
- Verificador de compatibilidad **guiado y sin IA**. Calculadora con **20% de ahorro** y precios de combustible del día
  (RM: 93, 95, 97 y diésel; revisar en preciocombustible.cl antes de publicar).
- El recorrido 3D que se arma al bajar debe dejar el texto **legible en todo momento** (en PC y teléfono).
- Rediseño con fotos (propuesta de ChatGPT integrada al código): portada con el auto en rayos X, explorador del kit pieza por pieza
  (después del recorrido 3D, que se mantiene), fotos en Para quién, Ahorro, Proceso y Confianza, y ayuda comercial sin IA.
  Las fotos son conceptuales y la página lo dice.

**Presentación de Control de Gestión**:
- Máximo 15 minutos: 16 diapositivas + 9 de anexo para preguntas. Los tres hablan lo mismo (~500 palabras, ~4 min c/u):
  Diego 1–5, Benjamín 6–10, Lukas 11–16. Para cambiar textos, edita `generador/guion.js` y regenera.
- Fuente de los datos: informe *Análisis Estratégico* e instrumentos 02 (Industria), 03 (PEST), 05 (Competencias) y 06
  (Cadena de valor). Cifras clave: cinco fuerzas 3,49; PEST 2,82 hoy y 2,99 a futuro (20 amenazas, 13 oportunidades,
  18 neutros); 2 ventajas sostenibles de 15; cadena de valor 3,00 / 2,71 con brecha −1,29 / −1,43 frente al líder.
  Estrategia: diferenciación enfocada.

**Presentación de la Fase 3**:
- **Versión ejecutiva (18-10-2026)**: portada + 12 láminas + cierre (14) y anexo de 11 con índice enlazado; sin aperturas.
  01 Mercado y meta · 02 Validar · 03 Oportunidad (Ansoff + posicionamiento) · 04 Esencial y Plus · 05 Demanda · 06 Canal y
  presupuesto · 07 Personas · 08 Habilita · 09 Proceso y controles · 10 Escalar (Gantt + gatillo) · 11 Números · 12 Conclusiones.
  Diego portada–03, Benjamín 04–07, Lukas 08–cierre; ~9 minutos (1.172 palabras). La versión de 35 láminas quedó en el historial
  de git (commit 121dffb).
- Imágenes: portada y cierre con `lumine-01-rayos-x` (compuestos); acercamiento al kit en la lámina 04, unidad de control
  en la 03 y una foto por etapa en la 09 (rotuladas «imagen ilustrativa»). Se componen con `generador/componer.py`. La primera etapa de la investigación se llama «Profundidad» (entrevista en profundidad).
- Tipografía de la Fase 3: **opción C, titulares en Michroma** (el «%» va en Archivo) y el resto en la familia Archivo
  (acento Expanded Light itálica, texto Archivo, etiquetas SemiCondensed, cifras Condensed). El equipo la eligió frente a la
  B (todo Archivo) y a la de la marca (serif itálica + mono); `LUMINE_TIPO=A|B` las recupera. En objetivos se quitaron, a pedido, «Cotizaciones digitales: por confirmar» y
  la marca «Estimación · pronóstico».
- Rediseño de legibilidad (17-10-2026): escala fija en `TX` de `generador/deck.js` (titulares 34/40 pt, cuerpo 20–24, etiquetas
  de gráficos 16 o más, cifras 30–48, marcas de estado 14, institucional 11–12). Si algo no cabe, se divide la lámina; nunca se
  achica la letra. La versión ejecutiva fusiona temas en una lámina sin bajar
  de esos tamaños; la Carta Gantt completa está en el anexo (A11) y la exposición usa un cronograma ejecutivo. Marcas: ESTIMACIÓN (raya),
  SUPUESTO o REFERENCIA (puntos), POR CONFIRMAR o PENDIENTE (línea), REALIZADA (verde). Inconsistencias detectadas para
  revisar con el informe: `fase-3/REDISENO_LEGIBILIDAD.md`.
- Rediseño visual premium (17-10-2026, `fase-3/REDISENO_PREMIUM.md`): solo la paleta de Lumine (sin ámbar, verde ni rojo;
  marcas de estado en gris acero), fondos `fondo-rejilla` (estrategia) y `fondo-horizonte` (procesos), resplandor `brillo.png`
  solo tras el dato protagonista, portada y cierre con el auto en rayos X (`componer.py`), posicionamiento en escala lineal. Se mantuvo la tipografía C a pedido del equipo.
- Estándar: la guía del profesor Brito para las Fases 1 y 2 (fuente al pie de cada lámina, supuestos marcados, siglas
  explicadas, conclusiones con preguntas pendientes, PDF 16:9, archivo `Grupo_01_LumineMotors_Fase3`).
- Datos solo del informe de la Fase 3 (10-10-2026): pronóstico 299 → 2.851 instalaciones propias, red de 42 talleres y 7.773
  kits al año 5, Esencial $4.290.000 y Plus $4.990.000 con IVA (referencia), dotación 13 → 56. La meta de cotizaciones del
  primer año sigue «Por confirmar».
- No se nombra a las personas entrevistadas (el repositorio es público).
- Versión de 7 minutos (18-10-2026, `fase-3/VERSION_7_MINUTOS.md`): 16 láminas + anexo de 13 para la defensa. Objetivo de
  7 min porque la presentación final de 20 min da ~7 por fase. Regla de Diego: la lámina es apoyo visual, no el guion
  (un mensaje, un protagonista, máximo tres datos de apoyo). El tiempo por lámina sigue el peso de la rúbrica del informe
  (investigación 15% y mix 15% pesan más). La ventaja competitiva ya no va en pantalla (Fases 1 y 2) pero el guion la nombra.
  La lámina 11 lleva un código QR a la demo de Habilita (`generador/qr.py`).
- Observaciones del profesor Brito (8-10-2026) que valen para toda presentación: **nada de textos pequeños ni láminas
  cargadas**, pensando en alguien miope al fondo de la sala: una idea y un visual por lámina, texto de 16 pt o más,
  etiquetas de 12 pt o más, cifras grandes; el detalle lo dice el orador o va al anexo. Decir explícitamente
  cuál es la **ventaja competitiva sostenible** (la biblioteca de calibraciones, activo intangible), sin confundirla con la
  estrategia; el FODA no va en la presentación final.

**Videos de la Fase 3** (24-10-2026, `videos/`):
- Hechos con Claude Code + Remotion a partir de un video de referencia (motion graphics programados) y de dos encargos del
  equipo. Sin audio; el equipo narra encima. Fundido de 0,5 s entre escenas; tipografías y paleta de la página comercial.
- Comercial **versión 2** (25-10-2026): la versión 1 (fotos con texto) «gusta pero no tanto»; Habilita sí convenció. La v2
  recrea la página funcionando con el recorrido de la lámina 8 (Conoce → Calcula → Verifica → Agenda): escaneo que revela
  el kit, deslizadores de la calculadora en movimiento, verificador guiado y agenda con el auto ya ingresado. Lección:
  mostrar la herramienta en uso, no fotos con texto.
- Comercial: escenario de 180 km/día, 6 días, 10 km/L y bencina 93 a $1.459 → ahorro $136.457 al mes y $1.637.488 al año,
  siempre con «Escenario ilustrativo con 20% de ahorro supuesto». Fotos de la página en su versión de mayor resolución.
- Habilita: visor recreado desde `src/engine3d.js` (`videos/src/kit3d.ts`); tres piezas con C14, C15 y C22; la marca de
  brecha es una selección ilustrativa; la validación aparece como etapa aparte.
- Rótulos neutros mientras siga abierta la inconsistencia con el informe: «Banco de baterías» (sin LFP) y «asistencia
  eléctrica trasera» (sin número de motores).

**Video vertical «El kit, para el curioso»** (29-10-2026, `videos/src/tiktok/`):
- 1080 × 1920, ~63 s, estilo TikTok: narración con voz neuronal Piper `es_MX-claude-high` (sin conexión), subtítulos palabra
  por palabra con la palabra hablada en celeste, música y efectos sintetizados (sin derechos de terceros), barra de 4 partes.
- El guion vive en `narracion/guion.json` (con `|` para la pronunciación); `narrar.py` genera la voz y los tiempos de cada
  palabra, y las escenas se sincronizan solas con la voz. Cierre: «Lumine Motors · proyecto en desarrollo».
- Trampa: la red bloquea Hugging Face; las voces Piper y Whisper se bajan del espejo de sherpa-onnx en GitHub
  (`k2-fsa/sherpa-onnx/releases`, `tts-models` y `asr-models`).
- **La voz sintética no gustó** (Piper ni Kokoro). **Lukas grabará la narración** (o la hará o «tuneará» en ElevenLabs) con el
  guion revisado de `guion.json`; instrucciones en `narracion/INSTRUCCIONES_NARRACION.md` y en la página con teleprompter.
  Cuando llegue su audio: `alinear.py` (Parakeet, tiempos por palabra) → `musica.py` → `bash render.sh Tiktok`.
- **La marca se pronuncia «Lumin»** (se escribe Lumine). Vale para toda narración o locución.
- **Hacer más TikTok para la marca** es el plan (29-10-2026). El equipo manda el audio y **Claude hace toda la edición**.
  Se pueden pedir skills o herramientas siempre que sean **gratis**. Método: skill `tiktok-lumine`.

## Pendientes y preguntas abiertas

- Datos comerciales reales (precio, % de ahorro, garantía, tiempo de instalación, contacto): en proceso; no inventarlos.
- ¿Agregar un tutor con IA dentro de los módulos de Habilita? Sin respuesta.
- ¿Exigir 12 meses en nivel 2 antes de validar el nivel 3 (DGUV)? No implementar sin confirmación.
- Licencia SEC del instalador: según el D.S. 92 sería clase C hasta 50 kW o B sobre eso; falta confirmarlo con la SEC.
- Guion: decidir si la frase "Dos observaciones críticas…" (diapositiva 14) se deja, se reformula o se quita.
- Fase 3: inconsistencias abiertas para revisar con el informe: química de la batería (informe: litio-titanato;
  identidad: LFP) y motores (informe: dos en las ruedas; render: uno central). Ver `fase-3/REDISENO_PREMIUM.md`.

## Trampas técnicas conocidas

- El visor de artefactos inyecta CSS sin capa en `body` (fondo claro y fuente del sistema). Los estilos base de la página
  van **fuera de `@layer`** y con `!important` (ver `ventas/src/index.css`); si no, la página sale en "blanco nativo".
- La red de las sesiones en la nube bloquea `ui.shadcn.com`, `preciocombustible.cl`, `latercera.com` y la descarga de Google
  Fonts. GitHub y npm sí funcionan (las tipografías se sacan de `@fontsource` en npm).
- Para convertir el PPT a PDF hay que instalar `libreoffice-impress` y las fuentes de `control-de-gestion/fuentes/`.
  `render.sh` exporta con configuración regional es-CL para que los decimales salgan con coma.
- Playwright usa el Chromium de `/opt/pw-browsers`; no ejecutes `playwright install`.
- El PPTX de la Fase 3 incrusta sus tipografías (EOT en `ppt/fonts/`, función `incrustarFuentes` de `deck.js`);
  sin eso, PowerPoint sin las fuentes instaladas muestra Calibri y «no se parece al estilo». LibreOffice 24.2 no lee fuentes
  incrustadas en PPTX, así que el render de prueba necesita las fuentes instaladas.
- En Windows, las fuentes instaladas para el usuario no llegan a LibreOffice hasta cerrar sesión: si `pdffonts` muestra
  Arial o DejaVu en vez de Archivo, Figtree, IBM Plex Mono e Instrument Serif, el PDF salió con fuentes de reemplazo.
