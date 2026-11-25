# Defensa final · material visual

Inventario de todo lo que podría hacer falta para armar la presentación, incluso lo dudoso. Se ordena por bloque
de la defensa. La columna «Estado» dice dónde está cada cosa:

- **Repo**: ya está en este repositorio (ruta indicada).
- **Drive**: está en la carpeta compartida «Integrador II» (subcarpeta indicada); se baja al repo solo lo que se use.
- **Código**: no es una imagen; se dibuja en HTML o SVG dentro de la lámina (gráficos, diagramas, íconos).
- **Falta**: hay que conseguirlo o producirlo.

Todo render o foto generada se rotula «Imagen ilustrativa» en la lámina, como en la Fase 3.
Las fotos de personas y los documentos del curso no se suben al repositorio (es público): van en una carpeta local
`defensa/privado/`, ignorada por git, que se copia al pendrive.

## 1. Lo que falta conseguir (prioridad)

| # | Material | Para qué | Especificación | Quién |
|---|---|---|---|---|
| F1 | ~~Foto de cada experto~~ | Recibidas (25-11): las cinco, uniformes (recorte circular, fondo blanco, 1254 px). En `privado/expertos/`, fuera de git | Pregunta: llegaron los cinco con nombre y foto; ¿sigue alguno citado solo por su cargo? | |
| F2 | Silueta para el experto citado solo por su cargo | Solo si la respuesta a F1 lo pide | Código | |
| F3 | ~~Logo de cada institución~~ | Recibidos (25-11): Movener, Santo Tomás, MTT, UNAB, INACAP; en `privado/expertos/`. Ver «Revisar» abajo | | |
| F4 | Confirmación escrita de que cada experto autorizó foto, nombre y logo | Respaldo; no se proyecta | Correo o audio ya existente | Equipo |
| F5 | Archivo de cifras maestras del informe final | Todas las cifras de las láminas | Una tabla única (JSON, CSV o Excel) con dato, valor, unidad y fuente | Equipo, al cerrar el informe |
| F6 | Resultados de la encuesta por hipótesis (H1 a H6), ya agregados | Láminas «medimos… y encontramos…» | Solo totales y porcentajes por grupo; nunca respuestas individuales | Equipo |
| F7 | Logos de competidores con nombre (conversión a gas, conversión eléctrica, híbrido nuevo, posible entrante) | Benchmarking, si se decide mostrarlos con logo | Uso académico; si no, se nombran en texto | Por decidir |
| F8 | ~~Foto o render del dinamómetro de chasis~~ | Resuelto: `lumine-17-banco-pruebas.jpg` muestra el auto sobre los rodillos de un dinamómetro | | |
| F9 | ~~Capturas de la página comercial~~ | Hechas (25-11): `material/capturas/pagina-01` a `08` (portada, kit, para quién, calculadora, verificador, proceso, confianza, agenda), 2560 × 1440 | Ver «Avisos» abajo | |
| F10 | ~~Capturas de Lumine Habilita~~ | Hechas (25-11): `material/capturas/habilita-01` a `05` (portada, el sistema, laboratorio, arma el kit, recorrido guiado), 2560 × 1440 | Ver «Avisos» abajo | |
| F11 | Foto del equipo (opcional) | Portada o cierre | Mismo estilo que las fichas | Equipo, opcional |

## Material recibido en «Defensa final › Material» (25-11)

| Qué | Dónde quedó | Estado |
|---|---|---|
| Fotos de los cinco expertos y logos de sus instituciones | `privado/expertos/` (git lo ignora), con `expertos.json` (nombre, cargo, institución, sacados de los nombres de las carpetas del Drive) | Listo para la ficha |
| Ocho escenarios y fondos en versión clara (zip «Escenarios claros», con su script) | `material/claros/` (`escenario-a/b/c-claro`, `fondo-portada/dato/cierre/rejilla/horizonte-claro`) | Listo para las láminas blancas |
| Ocho renders en versión de día o fondo blanco (WhatsApp) | `material/claros/`: auto en rayos X (dos vistas), despiece del kit, tríptico, bencinera y taxi con la cordillera de día, técnico de alta tensión, dúo en el taller | Listo; ver «Revisar» |
| Dos imágenes de WhatsApp con el logo antiguo (rayo en círculo, «Motors» con líneas) | No se copiaron | No usar: no es el logo vigente |
| Subcarpetas «2. Cifras y resultados», «3. Informe», «4. Defensa» y «5. Opcional» | Vacías al 25-11 | Pendientes (F5, F6 y la guía de la defensa) |

**Revisar antes de proyectar:**

- Los renders de WhatsApp llegaron comprimidos (1600 × 900, unos 200 KB). Alcanzan para una lámina, pero si existen los originales sin comprimir, conviene subirlos (WhatsApp baja la calidad).
- Logos: el del MTT y el de la UNAB parecen versiones redibujadas dentro de un círculo (el del MTT no es el logotipo de gobierno con la barra de colores; el de la UNAB no trae el nombre). Para una ficha formal conviene usar las versiones oficiales de cada sitio; Movener, Santo Tomás e INACAP se ven fieles.
- Las cinco fotos tienen el mismo tratamiento (bien para la ficha uniforme que pidió Brito). Si fueron unificadas con IA, verifiquen que cada experto se reconozca.
- Los renders claros muestran un motor central en el eje trasero y la batería bajo el piso, igual que los oscuros: sigue abierta la química (LFP o LTO) y si es un motor o dos.

## Revisión del Drive (25-11)

Se revisaron las carpetas «Material visual general» (35 archivos) y «Fotos» (16) de «Integrador II».

- Las 25 imágenes que sirven ya están en el repositorio, idénticas o casi, en `integrador-2/identidad/imagenes/`
  y `fondos/` (rayos X, despiece, trípticos, diagnóstico, taller, dinamómetro, seguridad, capacitación, bodega, centro de
  control, entrega, equipo, bencinera, flota, taxi con la cordillera, fondos con cuadrícula y la maqueta de la página).
  Solo hay dos variantes leves que no están: «Fila de sedanes bajo luces nocturnas» (otra luz de la flota) y
  «Taxi nocturno bajo la lluvia y montañas-2» (otro encuadre del taxi).
- No hay fotos de los expertos ni logos de sus instituciones (F1 a F3 siguen pendientes).
- El video «Hibridación_Aditiva.mp4» (27 MB, agosto) no se revisó; es anterior a la marca actual.

**No usar** (piezas antiguas, con datos o marca que ya no corresponden):

| Archivo en Drive | Motivo |
|---|---|
| «Ficha de reconversión vehicular híbrida» | Precio $2.521.000 + IVA, recuperación de 12 a 14 meses, «ECU con IA», alianza con BancoEstado, homologación individual 3CV y 2,5 días de instalación: nada de eso coincide con el informe actual |
| «kit_spec_sheet» y «esquema-tecnico-tri-fuel» | Rotulan «unidad de control (IA)» y compatibilidad tri-fuel; el esquema lleva el nombre de otra empresa |
| «Taxi chile lumine» y «Luminr motors futurista» | Logo antiguo («Movilidad inteligente») y la marca de un fabricante visible |
| «Colash futurista» | Collage con «AI system active» y logo antiguo |
| «diferencia taxi» | Ilustración genérica en amarillo y rojo, fuera de la paleta |
| «taller lumine motors» | Taller blanco, otro estilo; podría servir solo como referencia de planta |
| «s00» | Captura antigua de la página comercial |
| Tres imágenes .jfif (inversor, banco de baterías y motor sobre fondo neutro) | Fotos de producto de terceros, origen sin confirmar; no subir al repositorio ni proyectar sin citar la fuente |

Utilizables con cuidado: «taller_illustration» y «car_silhouette_dark» (ilustraciones de línea, en la paleta, pero más
simples que el plano del repositorio) y «icon_sheet_preview» (íconos genéricos; se prefiere dibujarlos en código).

## Avisos para el equipo (no se cambió nada)

- La portada de la página comercial dice «una unidad de control con IA decide cuándo asistir», y el laboratorio de
  Habilita rotula «Unidad de control con IA». Conviene revisar si esa frase sigue vigente en el informe final.
- El verificador de compatibilidad de la página se ve como un chat. Brito pidió aclarar que es guiado y sin IA; si se
  muestra en la defensa, conviene decirlo así o rotularlo.

## 2. Marca y base

| Material | Estado | Dónde |
|---|---|---|
| Logo vectorial (emblema + palabra, la I en celeste) | Repo | `ventas/src/components/logo-vectorial.tsx`, ya en `defensa/conceptos/comun/marca.js` |
| Logo en PNG claro y oscuro | Repo y Drive | `integrador-2/identidad/logo/`; Drive «Fotos» («Logo png», «Logo negro») |
| Plano técnico del kit (vista lateral, piezas 01 a 04) | Repo | `ventas/src/components/plano.tsx`, ya en `marca.js`; PNG en `control-de-gestion/generador/assets/plano.png` |
| Tipografías (Archivo, Michroma, Instrument Serif, Figtree, IBM Plex Mono) | Repo | `defensa/fuentes/` |
| Paleta | Repo | `integrador-2/identidad/paleta.css` |
| Fondos con foco y rejilla | Repo y Drive | `integrador-2/identidad/fondos/`; Drive «Material visual general» (cuadrícula cian, fondo futurista) |
| Resplandor tras el dato protagonista | Repo | `fase-3/generador/assets/brillo.png` |
| Códigos QR (página comercial y demo de Habilita) | Repo | `fase3/qr-comercial.svg`; `fase-3/generador/qr.py` |

## 3. Por bloque de la defensa

### Apertura, portada y cierre

| Material | Estado | Dónde |
|---|---|---|
| Video de apertura del kit | Repo | `fase3/video/kit.mp4` |
| Video «Hibridación aditiva» | Drive | «Material visual general» |
| Auto en rayos X (ya usado en las Fases 3 y 4; usar con moderación) | Repo y Drive | `integrador-2/identidad/imagenes/lumine-01-rayos-x.jpg` |
| Portada y cierre compuestos de la Fase 3 | Repo | `fase-3/generador/assets/cierre-premium.jpg` y otras |

### Problema y contexto (Fases 1 y 2)

| Material | Estado | Dónde |
|---|---|---|
| Taxi o colectivo nocturno en Santiago con la cordillera | Repo y Drive | `lumine-05-colectivero-santiago.jpg`; Drive «Taxi nocturno bajo la lluvia y montañas» |
| Flota de sedanes | Repo y Drive | `lumine-07-flota.jpg`; Drive «Flota de sedanes bajo la lluvia nocturna», «Fila de sedanes» |
| Bencinera | Repo y Drive | `lumine-13-bencinera.jpg`; Drive «Estación nocturna bajo luces urbanas» |
| Edad del parque, autos usados por nuevo, precio de la bencina | Código | Gráficos o cifras grandes con su fuente |
| Fotos de Chile reales y no generadas (opcional, para que la portada no se vea genérica) | Falta | Fotos propias del equipo: un colectivo real, una bencinera |

### Solución y producto

| Material | Estado | Dónde |
|---|---|---|
| Despiece del tren motriz (unidad de control, baterías, motor en el eje) | Repo y Drive | `lumine-02-despiece.jpg`; Drive «Diagrama futurista de tren motriz eléctrico» |
| Tríptico de piezas (motor, baterías, unidad de control) | Drive | «Tríptico de componentes eléctricos EV» y otros dos trípticos |
| Piezas por separado | Repo | `lumine-06-motor-electrico.jpg`, `-baterias-lfp.jpg`, `-unidad-control.jpg`, `-componentes.jpg` |
| Ficha técnica del kit, ficha de reconversión | Drive | «Fotos» («kit_spec_sheet», «Ficha de reconversión vehicular híbrida») |
| Esencial frente a Plus | Código | Comparación lado a lado con el plano |
| Revisar antes de usar: química de la batería (LFP o LTO) y número de motores (uno o dos) | Por decidir | El rótulo de la imagen tiene que coincidir con el informe final |

### Entorno y estrategia (Fases 1 y 2)

| Material | Estado | Dónde |
|---|---|---|
| PESTEL y Porter (cifra resumen y factor decisivo) | Código | |
| Benchmarking con la fila que solo llena Lumine | Código | Idea rescatada de la Fase 1 y 2 (lámina 07) |
| Biblioteca de calibraciones como ventaja sostenible | Código | Diagrama propio: banco de pruebas → biblioteca → taller → red |
| Mapa estratégico del CMI | Código | Plantilla «mapa estratégico» del paso 3 |
| Proyecto experimental (D.S. 67): probar → normar → vender | Código | Línea de pasos |

### Investigación de mercado (Fase 3)

| Material | Estado | Dónde |
|---|---|---|
| Diseño de la investigación (exploratoria, expertos, profundidad, encuesta) | Código | |
| Fichas de los cinco expertos | Falta F1 a F4 | Plantilla «ficha de experto» del paso 3 |
| Conclusiones comunes de los cinco expertos | Código | Lámina propia (pedido de Brito) |
| Resultados por hipótesis | Falta F6 | Gráficos «medimos… y encontramos…» |
| Disposición a pagar (escalera de precios) | Código, con F6 | |

### Marketing, operaciones y personas (Fase 3)

| Material | Estado | Dónde |
|---|---|---|
| Segmento: colectivero, conductor de aplicación, taxi | Repo y Drive | `lumine-05`, `lumine-07`; Drive «Taxi negro bajo la lluvia nocturna» |
| Plataforma comercial | Repo | `defensa/material/capturas/pagina-01` a `08` |
| Video de la página comercial | Repo | `fase3/video/pagina.mp4` |
| Proceso en cinco etapas (cotiza, asesoría, instala, certifica, postventa) | Repo | `fase-3/generador/assets/flujo-1.jpg` a `flujo-5.jpg` |
| Diagnóstico con tablet bajo el auto | Repo y Drive | `lumine-09-diagnostico.jpg`; Drive «Diagnóstico EV bajo el vehículo» |
| Taller, bodega, banco de pruebas, seguridad de alta tensión | Repo | `lumine-16-taller.jpg`, `-19-bodega.jpg`, `-17-banco-pruebas.jpg`, `-15-seguridad-alta-tension.jpg` |
| Dúo de técnicos, capacitación, equipo | Repo | `lumine-08-duo-tecnicos.jpg`, `-14-capacitacion.jpg`, `-18-equipo.jpg` |
| Lumine Habilita | Repo | `fase3/video/habilita.mp4`; `defensa/material/capturas/habilita-01` a `05` |
| Organigrama y dotación | Código | |
| Carta Gantt con montos por etapa (la más elogiada) | Código | Plantilla «línea de tiempo» del paso 3 |
| Pronóstico en pesos (unidades × precio promedio, pedido de Brito) | Código, con F5 | |
| Entrega al cliente | Repo | `lumine-21-entrega-cliente.jpg` |

### Plan financiero (Fase 4)

| Material | Estado | Dónde |
|---|---|---|
| Inversión, capital de trabajo (curva del valle), de cada $100, flujo puro, tasa, VAN, TIR (aguja), equilibrio, escenarios, crédito | Código | Ya existen como referencia en `fase4/renderer.html`; se rehacen con las cifras maestras |
| Orden corregido: primero lo que necesita el proyecto y después quién pone la plata | Código | Observación de Brito del 19-11 |
| Sensibilidad con dos variables (costo del kit × conversión del primer año) | Código, con F5 | Matriz de calor; podría ser interactiva en el anexo |
| Contrato marco y forward (respuesta al riesgo del kit) | Código | Diagrama simple |
| Beta ponderado explicado «con peras y manzanas» | Código | Anexo |
| Centro de control (opcional, para el tablero) | Repo | `lumine-20-centro-control.jpg` |

### Anexos de defensa (navegables con P)

| Anexo | Material |
|---|---|
| Costo del kit pieza por pieza | Tabla corta en código, con F5 |
| Norma y proyecto experimental | Línea de pasos en código |
| Conversión del primer año | Gráfico en código, con F5 |
| Ahorro medido frente al simulado | Gráfico en código; ahorro siempre rotulado como estimación |
| Sensibilidad del VAN | Matriz en código, con F5 |
| Nombre de cada estrategia (precio, proceso, personas) | Tabla en código (Brito avisó que algunas comisiones lo preguntan) |

## 4. Entrega y respaldo

| Material | Estado |
|---|---|
| PDF de respaldo (16:9) exportado desde las láminas | Paso 3 |
| Carpeta completa para pendrive, probada sin internet | Paso 3 |
| Reloj visible para la comisión (Brito pidió un tiempo visible) | Paso 3, en el motor |
