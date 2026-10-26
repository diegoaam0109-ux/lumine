---
name: lumine-reglas
description: Reglas duras del equipo Lumine Motors y fuentes de verdad de cada dato (precio, ahorro, cifras de los informes, normas). Úsala antes de escribir o cambiar cualquier texto, cifra, afirmación legal o técnica, o de tomar una decisión de negocio, en cualquier parte del repositorio.
---

# Lumine · reglas que no se rompen

El contexto completo está en `CLAUDE.md` (raíz). Esta skill es la versión corta para no equivocarse.

## 1. Nunca inventar datos

- Lo que no existe se muestra como **«Por confirmar»**. No se rellena con un número «razonable», ni en código, ni en
  láminas, ni en informes, ni en ejemplos.
- Hoy siguen sin dato real: **precio, garantía, tiempo de instalación, WhatsApp y correo** (`null` en
  `ventas/src/lib/datos.ts`) y la meta de cotizaciones del primer año de la Fase 3.
- Ahorro: «**hasta 20% menos bencina en ciudad**» es una **estimación de ingeniería, no medida en autos chilenos**.
  En `datos.ts`, `ahorroPct` vale 20 porque el equipo lo definió así para la calculadora; se presenta siempre como estimación.
- Una cifra sin fuente no entra. Si la necesitas, pregunta o márcala como SUPUESTO / REFERENCIA / ESTIMACIÓN.

## 2. Lo que la marca no promete (nunca escribirlo)

«Cero emisiones», «20% garantizado», «homologado», «exento de restricción vehicular», «certificado por el MTT».
La Ley N° 21.793 (14-01-2026) **no tiene reglamento**; la única referencia es el borrador del MTT de 2021.

## 3. Hechos técnicos fijos

- Kit para autos a combustión de **tracción delantera**: motor eléctrico en el **eje trasero**, baterías **LFP**, unidad de
  control. Motor original, transmisión y alimentación intactos.
- El freno, el ABS y el control de estabilidad originales **siempre mandan** sobre el kit.
- La página comercial vende a **particulares y flotas, nunca a talleres**.
- Inconsistencia abierta (no la «arregles» sola): el informe de Fase 3 dice litio-titanato y dos motores en ruedas; la
  identidad dice LFP y un motor central. Ver `fase-3/REDISENO_PREMIUM.md`.

## 4. Fuentes de verdad

| Dato | Dónde vive | Quién lo cambia |
|---|---|---|
| Datos comerciales de la página | `ventas/src/lib/datos.ts` (`DATOS`, `HECHOS`, `COMBUSTIBLES`) | El equipo, con dato validado |
| Precios de combustible RM | `COMBUSTIBLES` en `datos.ts` (con fecha y fuente) | Revisar preciocombustible.cl antes de publicar |
| Reglas de Habilita (competencias, decisiones D1–D18) | `src/data.js`, `src/data-gobierno.js`, `CAMBIOS.md` | Solo con decisión del equipo |
| Guion y notas de las presentaciones | `*/generador/guion.js` (`GUION.md` se genera) | Editar `guion.js` y regenerar |
| Cifras de Control de Gestión | Informe *Análisis Estratégico* (resumen en `CLAUDE.md`) | No se recalculan |
| Cifras de Fase 3 | Informe de Fase 3 del 10-10-2026 (**no está en el repo**) | Se piden al equipo |
| Identidad visual | skill `lumine-marca`, `ventas/src/index.css`, `integrador-2/identidad/` | — |

## 5. Decisiones: cuáles se toman y cuáles se preguntan

- **Puedes decidir** diseño, experiencia, legibilidad, orden del código, pruebas, corrección de errores evidentes.
  El equipo dio autorización amplia («te autorizo a hacer todo, mándate»).
- **Debes preguntar** (están abiertas en `CLAUDE.md` › Pendientes): tutor con IA en Habilita, exigir 12 meses en nivel 2,
  licencia SEC del instalador, la frase «Dos observaciones críticas…» del guion, cualquier cambio de precio, segmento,
  canal, reglas de habilitación o cifras de un informe.
- Si una instrucción nueva choca con una decisión anterior de `CLAUDE.md`, **avisa y propone una salida**; no la pises.

## 6. Repositorio público

- Nada de claves, tokens, `.env`, correos o teléfonos personales, ni documentos internos del curso (los .docx de los
  informes de Integrador **no se suben**).
- No se nombra a las personas entrevistadas.
- Antes de cada commit: `git diff --cached` y busca `key|token|secret|password|@gmail|+569`.

## 7. Idioma y tono

Español de Chile, directo, sin relleno ni emojis. Términos en inglés solo si no hay uno común en español.
Ver skill `lumine-redaccion` para informes y textos largos.
