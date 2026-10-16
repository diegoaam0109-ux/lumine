---
name: lumine-marca
description: Sistema visual y voz de Lumine Motors (colores, tipografías, motivos, logo, plano del kit y tono). Úsala siempre que hagas o cambies algo con la marca Lumine — páginas, componentes, presentaciones, documentos, gráficos, imágenes o textos de venta — para que se vea y suene como la página comercial.
---

# Lumine Motors · sistema visual

La fuente de verdad es la página comercial: `ventas/src/index.css` (tokens y clases) y `ventas/src/components/`.
La presentación de Control de Gestión (`control-de-gestion/generador/deck.js`) aplica lo mismo en PowerPoint.

## Idea

Escenario negro cinematográfico, un solo acento celeste, el producto como protagonista.
Mezcla de referencias: Lamborghini y Ferrari (negro, titulares monumentales en mayúsculas, bordes rectos),
AWE (etiquetas mono de tablero, líneas finas, acentos en serif itálica) y Apple (sobriedad, modo claro limpio).

## Colores

| Token | Oscuro (por defecto) | Claro | Uso |
|---|---|---|---|
| `--bg` | `#020304` | `#f5f5f7` | Fondo del escenario |
| `--surface` | `#0a0d0f` | `#ffffff` | Tarjetas |
| `--well` | `#101417` | `#ebecef` | Pozos, casillas vacías |
| `--control` | `#1a1e22` | `#e3e5e8` | Píldoras, botones secundarios |
| `--fg` | `#ececec` | `#1d1d1f` | Texto |
| `--muted` | `#8b9598` | `#5f6368` | Texto secundario, etiquetas |
| `--dim` | `#4b5154` | `#a1a5aa` | Texto apagado |
| `--line` / `--line-2` | `#1f2427` / `#2e3438` | `#dcdde1` / `#c8cace` | Reglas finas y bordes |
| `--accent` | `#22B8F0` | `#22B8F0` (texto `#0A6F9E`) | El único acento: celeste Lumine |
| `--ok` / `--warn` / `--crit` | `#4ADE80` / `#F5B94A` / `#F87171` | `#157a46` / `#9a5b06` / `#b42318` | Estados (a favor, en espera, en contra) |

- Texto sobre el celeste: `#031015`. Cable de alta tensión en el plano: `#FF8A1F`.
- Una sola dominante (negro), un acento (celeste). Nada de degradados de colores ni azules genéricos.

## Tipografías (Google Fonts, libres)

| Rol | Fuente | Estilo |
|---|---|---|
| Titulares | Archivo 800, ancho 112% (en PowerPoint: "Archivo SemiExpanded ExtraBold") | MAYÚSCULAS, interletra −0,025em, interlínea 0,95 |
| Palabra monumental / números grandes | Archivo condensado 68–75%, 600–700 (en PowerPoint: "Archivo Condensed" negrita) | MAYÚSCULAS, interlínea 0,84 |
| Acento editorial | Instrument Serif itálica | minúsculas, en celeste, ~1,15× el tamaño del titular |
| Texto | Figtree 400/700 | 16 px base, interlínea 1,5 |
| Etiquetas de instrumento | IBM Plex Mono 400 | 10–12 px, MAYÚSCULAS, interletra 0,14em, color `--muted` |

Las `.ttf` listas para instalar están en `control-de-gestion/fuentes/`.

## Motivos (repetirlos, no inventar otros)

1. **Titular con acento**: palabras en Archivo mayúsculas + remate en serif itálica celeste.
   Ej.: "TU AUTO, *ahora*", "NO CAMBIES DE AUTO. *Hazlo híbrido.*", "LA FUERZA DOMINANTE: *no hacer nada.*"
2. **Etiqueta con índice**: `01 —— CÓMO FUNCIONA` (número en celeste, línea corta, texto mono gris). Encabeza cada sección.
3. **Esquinas de visor**: cuatro escuadras celestes de 1 px en las esquinas de la caja destacada (`.visor > i.esq`).
4. **Rótulos numerados**: cuadro celeste con número oscuro en mono (`01`, `02`…); el gris marca lo original del auto.
5. **«Por confirmar»**: marcador mono con borde punteado ámbar para todo dato que aún no existe.
6. **Rejilla y foco**: rejilla de 64 px casi invisible con máscara radial + brillo celeste suave detrás del protagonista.
7. **Palabra monumental** con desvanecido hacia abajo (portada) y **logotipo gigante** al cierre.
8. **Reglas finas** entre filas en vez de tablas con relleno; bordes rectos (radio 0) salvo píldoras de navegación.
9. **Números de tablero**: cifras grandes condensadas con su etiqueta mono debajo ("3,49 / PROMEDIO PONDERADO").

## Recursos

- Logo vectorial (emblema + palabra LUMINE con la I celeste): `ventas/src/components/logo-vectorial.tsx`.
- Plano técnico del kit (vista lateral, piezas 01–04): `ventas/src/components/plano.tsx`.
- PNG de alta resolución (logo, palabra, emblema, plano, fondos con foco): `control-de-gestion/generador/assets/`
  (se regeneran con `node assets.js`).
- Auto 3D propio sin librerías: `ventas/src/lib/lab3d.js`.

## Voz

- Español de Chile, frases cortas, segunda persona en la venta ("tu auto"), sin tecnicismos innecesarios.
- Promesas medibles y honestas: "hasta 20% menos bencina en ciudad (estimación)", "tu motor original queda intacto".
- Nunca inventar precios, porcentajes, garantías ni homologaciones: «Por confirmar».

## No hacer

- Fondo blanco por defecto o el estilo base del navegador.
- Más de un color de acento, emojis como íconos, sombras pesadas, esquinas muy redondeadas.
- Texto encima del 3D que se vuelva ilegible al hacer scroll.
- Imágenes de stock genéricas o de baja resolución: mejor dibujar el recurso (SVG o PNG a 2× o más).
