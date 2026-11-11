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
| `.claude/skills/lumine-marca/` | Skill con el sistema visual de Lumine (colores, tipografías, motivos, recursos). | Úsala para cualquier pieza nueva con la marca. |
| `entrega3/`, `entrega4/` | **Trabajo final de IA aplicada** (UNAB, Grupo 1, NRC 4153): estimador de ahorro con IA, prototipo, informe técnico del modelo matemático y revisión cruzada con varias IA. | Pasos para reproducir en `entrega3/README.md`; resultados de la Entrega 4 en `entrega4/Resultados_mejoras_modelo_E4.md`. |
| `fase-3/` | **Presentación de la Fase 3** de Integrador II: Taller de Empresas (ICMA 1001, Grupo 1, profesor Roberto Brito): Capítulo III, Plan de Marketing, Operaciones y RR.HH. | Generador propio copiado del de Control de Gestión: `generador/deck.js` + `guion.js` + `render.sh` (también en Git Bash para Windows). El informe .docx no se sube. |
| `solemne-2/` | **Solemne 2 de Control de Gestión** (ICMA901): de la estrategia de Lumine a un CMI en red (17 objetivos, 20 relaciones). | `generador/deck.js` + `guion.js` + `render.sh` (mismo sistema que la Fase 3). `RESPALDO.md` tiene contradicciones, riesgos y respuestas para la defensa. El paquete del curso (docx, xlsx) no se sube. |


## Artefactos publicados (cuenta de Diego)

| Qué | Link | Se publica desde |
|---|---|---|
| Página comercial | https://claude.ai/artifact/XGpgpuDtxJvtiAjbRDwJ2o | `ventas/dist-artefacto/index.html` |
| Lumine Habilita (demo) | https://claude.ai/artifact/JpdUMVYztFtjQYkcAehELb | `dist/lumine-habilita-demo.html` |
| Lumine Habilita (real) | https://claude.ai/artifact/KrYbLr84sVrfJoRT2wvhP9 | `dist/lumine-habilita.html` (capacidades `db` con `DB_RULES`, `user` con `profile`, `downloads`) |
| Guion de la presentación | https://claude.ai/code/artifact/e0db2f29-05e7-42d1-b4a7-9cfcb5d1741b | documento editable |

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

**Solemne 2 de Control de Gestión** (20-10-2026, versión de coautoría; presentación oral confirmada, máximo 15 min):
- 15 láminas + anexo de 15 con índice enlazado. Guion a 130 palabras por minuto: 1.793 palabras, ~13:48; Diego 1–5,
  Benjamín 6–10, Lukas 11–15. Integra la presentación anterior del curso (negocio, misión-visión-valores como reglas de
  control, cliente, cinco fuerzas y escenarios regulatorios, biblioteca y FODA cruzado, diferenciación enfocada y ejes) y
  culmina en el CMI en red: clientes como propuesta de valor, mapa editable, tres rutas (habilitación, evidencia y valor
  económico), ficha y ciclo de decisión.
- CMI revisado (17 objetivos, 20 relaciones): F1 en dos etapas (VAN > 0 y TIR > tasa exigida antes de invertir; retorno
  sobre el capital empleado frente a su costo una vez operando); el financiamiento pasa a P6 «Alianzas que destraban la
  compra»; C3 se mide desde el cliente; C4 como conversión; la antigua F4 pasa a F3. Sin ejercicios numéricos (ni EVA,
  ni NOPAT, ni el caso 8 de 10). QR de Lumine Habilita en la lámina de capacidades.
- Forma y color: línea continua = habilitante, blanca gruesa = condición externa, punteada = hipótesis; color de los
  objetivos = eje estratégico de origen; estados cumple (círculo), alerta (triángulo), no cumple (cuadrado), meta
  pendiente (cuadrado punteado) y sin medir (anillo a trazos). Responsables según la estructura de la Fase 3.

**Informe final de Integrador II (Fase 5, noviembre de 2026; el .docx no se sube)**:
- **Principio rector: es un solo trabajo.** Un hilo argumental con varios capítulos: cada sección responde a la misma
  pregunta y retoma lo anterior (problema → necesidad → solución → Canvas → PESTEL → Porter → benchmarking → FCE → cadena
  de valor → FODA y cruce → estrategia). Nada suelto: cada dato o conclusión se usa más adelante o se saca.
- Se escribe como informe final, no por fases: nada de «en esta fase», «queda pendiente» ni «este informe supone». Lo que
  resuelve otra parte se enlaza por su nombre («se analiza en el Plan Financiero»), nunca por número de sección.
- Investigación de mercado: los capítulos I y II no adelantan sus resultados; solo dicen que una duda «se resolverá en la
  investigación de mercado». La vía del proyecto experimental se presenta como decreto público (D.S. N° 67), no como hallazgo.
  No citar entrevistas ni expertos (tampoco en la bibliografía): si una idea viene de un experto, se apoya en teoría
  publicada (p. ej., Rogers, 2003). No comparar con versiones o análisis anteriores.
- VRIO: categorías ventaja sostenible, temporal, paridad (costo de participación) o desventaja; nunca «frágil».
- Porter con el instrumento de Control de Gestión (escala de 0 a 5, promedio de factores): rivalidad 1,83, nuevos
  entrantes 3,75, sustitutos 3,67, proveedores 2,67, clientes 2,83; total 3,14, intensidad media. «No hacer nada» es
  inercia del cliente, no sustituto. PESTEL +1,50 (Legal −1: sin reglamento no se vende y hay que sostener con capital
  una etapa sin ingresos; una incertidumbre regulatoria que hoy perjudica no se puntúa neutra).
- Sustituto de referencia: híbrido **nuevo** (MG3 Hybrid, precio de lista $16.990.000, Autocosmos 2026; coincide con la tarjeta
  de la encuesta) y eléctrico nuevo desde $13.990.000; nunca «híbrido usado».
- En los capítulos I y II va el concepto, no las cifras operativas de la Fase 3 (horas de instalación, n.º de competencias,
  resultados de la simulación). La batería del kit es litio-titanato: no usar el precio LFP como argumento de costo.
- Descripción del problema (1.1): máximo 2 a 2,5 páginas, solo lo necesario.
- **Capítulo III (Fase 3) alineado (11-11-2026)**, sobre la versión entregada el 23-10-2026, con control de cambios:
  - Misma vía regulatoria que los capítulos I y II: proyecto experimental (D.S. N° 67) → reglamento propio → venta. La
    «etapa de prueba» (meses −12 a −4) es distinta de la preapertura (−3 a −1) y usa un equipo mínimo: los socios
    postulan, el Responsable Técnico entra en el mes −12 y un técnico de alta tensión en el −9; seis vehículos de prueba,
    ~33.000 km cada uno, medición por un tercero. La preapertura empieza con los resultados y el reglamento aprobado o en
    camino (decisión del equipo, 11-11). Mismo calendario que el Plan Financiero en curso (rama `fase4-plan-financiero`).
    El borrador de 2021 queda solo como referencia técnica: sin artículos ni anotación en el registro de vehículos.
  - Meses relativos: mes 1 = apertura comercial (ya no «enero de 2027»). Las cifras no se recalcularon; se declara que con
    una apertura posterior a abril de 2028 la jornada de 40 horas baja 4,8% la capacidad de los primeros 16 meses, y que
    la etapa de prueba se valoriza en el Plan Financiero.
  - Expertos: en el cuerpo (3.1.3.2) van la ficha con nombre y cargo, las conclusiones comunes y su efecto en el plan; el
    detalle por experto va en el anexo de instrumentos (letra d). **Sin notas al pie ni bibliografía para las entrevistas**
    (prohibición expresa del equipo). La entrevista exploratoria no se nombra. Encuesta y entrevistas en profundidad: sin
    resultados todavía; irán en un 3.1.3.3. No se inventan entrevistas.
  - Datos preliminares para el Plan Financiero en el Anexo 16 (costo de la etapa de prueba, local desde el mes −9, kits de
    prueba, efecto de la jornada de 40 horas y del aporte del empleador). La Red Lumine queda abierta: número de talleres,
    ritmo y cobros se fijan con el Plan Financiero.
  - Cifras compartidas con los capítulos I y II: bencina $1.538 (2-11-2026), MG3 Hybrid, gas hasta siete años desde la primera
    inscripción, 3,4 usados por cada nuevo, «Red Lumine». Colectivo de referencia de 213 km diarios como supuesto dentro del
    rango de 150 a 250 km del modelo de negocio; recuperación por kilometraje en la Tabla N° 9.
  - Para unir: Tablas N° 1–24, Figuras N° 1–6 (los capítulos I y II no numeran tablas) y Anexos 6–16 con el formato
    «Anexo 6»; el 3.4 se llama «Síntesis de los planes funcionales». Las figuras se redibujaron en el estilo claro de los
    anexos de los capítulos I y II.

## Pendientes y preguntas abiertas

- Informe final, Fases 1 y 2 **cerradas** (09-11-2026, archivo «Corregida1» revisado). Se reabren solo si el Plan
  Financiero o la versión final de la Fase 3 las contradicen (ahorro, financiamiento de la etapa sin ventas). Detalles que
  el equipo decidió no tocar: bencina citada a preciocombustible.cl (no a Bencina en Línea/CNE), nota de Movener sin enlace
  y cifra del gas de BioBioChile ($900.000 a $1,8 millones) sin confirmar. Actualizar el índice en Word antes de exportar.
- Capítulo III: confirmar los cargos de los expertos del Estado y de mecánica (no aparecen en la web); sumar los
  resultados de la encuesta (el análisis con GPT se pidió en otro chat) y de las entrevistas en profundidad; al cerrar el
  Plan Financiero, alinear lo que hoy difiere (apertura, red, rentas, costo del kit, dinamómetro, financiamiento al
  cliente) y reemplazar los datos preliminares del Anexo 16.

- Datos comerciales reales (precio, % de ahorro, garantía, tiempo de instalación, contacto): en proceso; no inventarlos.
- ¿Agregar un tutor con IA dentro de los módulos de Habilita? Sin respuesta.
- ¿Exigir 12 meses en nivel 2 antes de validar el nivel 3 (DGUV)? No implementar sin confirmación.
- Licencia SEC del instalador: según el D.S. 92 sería clase C hasta 50 kW o B sobre eso; falta confirmarlo con la SEC.
- Solemne 2: aprobar los 17 objetivos, metas y responsables; Plan Financiero (tasa, flujos, inversión) y tolerancia del
  ahorro sin definir; metas de C3 y C4 con la primera muestra; faltan la pauta de la Solemne y `2_Contexto_Lumine_Motors.md`.
  Detalle en `solemne-2/RESPALDO.md`.
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
