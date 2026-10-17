# Integrador II · Taller de Empresas

Carpeta del curso **Integrador II: Taller de Empresas** · ICMA 1001 · Grupo 1 · Profesor Roberto Brito.
Integrantes: Diego Alarcón, Benjamín Torres y Lukas Verdugo · UNAB.
Entrega en curso: **Fase 3 · Capítulo III: Plan de Marketing, Operaciones y Recursos Humanos**.

| Carpeta | Qué hay |
|---|---|
| `identidad/` | Kit de identidad visual de Lumine listo para usar: logo, fondos, imágenes, tipografías y paleta. |
| `presentacion/` | Aquí va la presentación de la Fase 3 (PPT, PDF y su generador). |

El informe de la Fase 3 (.docx) **no se sube**: el repositorio es público. Pásalo directo a la sesión de Claude cuando lo necesites.

## Identidad visual

Mismo sistema que la página comercial (`ventas/`) y la presentación de Control de Gestión (`control-de-gestion/`).
El detalle completo está en la skill `.claude/skills/lumine-marca/SKILL.md`; Claude la carga sola.

**En una línea:** escenario negro, un solo acento celeste `#22B8F0`, titulares anchos en mayúsculas con remate en serif itálica
celeste ("NO CAMBIES DE AUTO. *Hazlo híbrido.*"), etiquetas mono de instrumento y cifras grandes condensadas.

### Colores

| Uso | Color |
|---|---|
| Fondo | `#020304` |
| Tarjetas / pozos | `#0A0D0F` / `#101417` |
| Texto / secundario | `#ECECEC` / `#8B9598` |
| Reglas finas | `#1F2427` / `#2E3438` |
| **Acento (único)** | `#22B8F0` (texto encima: `#031015`) |
| Alta tensión (solo plano e imágenes) | `#FF8A1F` |
| Estados: a favor / en espera / en contra | `#4ADE80` / `#F5B94A` / `#F87171` |

Los tokens para CSS están en `identidad/paleta.css`.

### Tipografías (`identidad/fuentes/`, licencia OFL)

Instálalas antes de abrir un PPT (doble clic › Instalar):
Archivo SemiExpanded ExtraBold (titulares) · Archivo Condensed (cifras) · Figtree (texto) · IBM Plex Mono (etiquetas) · Instrument Serif (acentos en itálica).

### Logo y recursos (`identidad/logo/`, PNG transparentes en alta resolución)

| Archivo | Uso |
|---|---|
| `logo.png` | Emblema + palabra LUMINE (la i en celeste), para fondo oscuro |
| `palabra.png` | Solo la palabra, para cierres con logotipo gigante |
| `emblema.png` / `emblema-oscuro.png` | Emblema solo, para fondo oscuro / claro |
| `plano.png` | Plano técnico del kit (vista lateral, piezas 01–04) |

### Fondos (`identidad/fondos/`)

| Archivo | Uso |
|---|---|
| `escenario-c.jpg` | **El recomendado.** Brillo en el horizonte y tercio superior negro para el titular |
| `escenario-b.jpg` | Diapositivas de contenido: rejilla amplia, texto abajo o a los costados |
| `escenario-a.jpg` | Respaldo |
| `fondo-portada.jpg`, `fondo-dato.jpg`, `fondo-cierre.jpg` | Fondos dibujados (rejilla y foco) de la presentación de Control de Gestión |
| `velo.png` | Degradado negro para oscurecer una foto y poner texto encima |

### Imágenes (`identidad/imagenes/`, hechas con IA y revisadas)

| Archivo | Sirve para |
|---|---|
| `lumine-01-rayos-x.jpg` | Portada: auto en rayos X con el kit en el eje trasero |
| `lumine-06-componentes.jpg` + `-motor-electrico`, `-baterias-lfp`, `-unidad-control` | Producto: las tres piezas del kit |
| `lumine-05-colectivero-santiago.jpg` | Segmento prioritario: colectiveros |
| `lumine-07-flota.jpg` | Segmento flotas |
| `lumine-08-duo-tecnicos.jpg` | Instalación en dúo |
| `lumine-09-diagnostico.jpg` | Diagnóstico y telemetría |
| `lumine-11-post-redes.jpg` | Redes sociales (cuadrada, mitad superior libre para el titular) |
| `lumine-12-maqueta.jpg` | Página web en notebook y teléfono |
| `lumine-13-bencinera.jpg` | Ahorro de combustible (Santiago de noche) |
| `lumine-14-capacitacion.jpg` | Capacitación de técnicos (RR. HH.) |
| `lumine-15-seguridad-alta-tension.jpg` | Seguridad en alta tensión (equipo de protección correcto) |
| `lumine-16-taller.jpg` | Operaciones: taller con elevadores |
| `lumine-17-banco-pruebas.jpg` | Pruebas previas a la certificación |
| `lumine-18-equipo.jpg` | Equipo de técnicos (RR. HH.) |
| `lumine-19-bodega.jpg` | Logística de entrada: bodega de componentes |
| `lumine-20-centro-control.jpg` | Telemetría del ahorro y gestión de flotas |
| `lumine-21-entrega-cliente.jpg` | Venta y postventa: entrega al cliente |

> **Importante:** Lumine es **preoperativa** (sin taller, personal ni clientes). Las imágenes de taller, bodega, equipo y centro de
> control muestran el **modelo de operación propuesto**: rotúlalas como "visión" u "operación proyectada", nunca como la situación actual.

## Reglas de contenido

- Nunca inventar datos: precio, % de ahorro, garantía, tiempo de instalación y contacto van como **«Por confirmar»**.
- Ahorro: "hasta 20% menos bencina en ciudad" es una **estimación de ingeniería, no medida en autos chilenos**.
- La venta es a **particulares y flotas, nunca a talleres**.

## Para empezar con Claude

Abre una sesión en claude.ai/code con este repositorio (rama `main`), adjunta el informe de la Fase 3 y pega:

```
Hola. Soy parte del equipo de Lumine Motors. Lee CLAUDE.md, integrador-2/README.md y la skill lumine-marca.
Te adjunto el informe de la Fase 3 de Integrador II (Capítulo III: Plan de Marketing, Operaciones y Recursos Humanos).
Necesito una presentación en PPT y PDF con la identidad visual de integrador-2/identidad/, siguiendo el mismo método que
control-de-gestion/generador/ (pptxgenjs + guion con notas del orador, todos hablan lo mismo). Guárdala en
integrador-2/presentacion/. No subas el .docx. Muéstrame las diapositivas antes de terminar.
```
