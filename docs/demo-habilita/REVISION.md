# Revisión de Habilita para la demo · 09-11-2026

Base revisada: `c7bb4e3`, última actualización de Habilita en `claude/create-lumine-presentaciones-repo-7ig568` al preparar esta entrega. Incluye las lecciones interactivas de `28fab75` y las correcciones de `6d5485b` y `c7bb4e3`.

La revisión se concentra en ejecución fuera de Claude, aprendizaje, recorridos, persistencia de la demo y publicación. No equivale a una auditoría completa de seguridad ni a validación de contenido técnico. Los hallazgos sobre código existente se documentan sin corregirlos; Diego pidió consultar antes de modificar un supuesto error o una regla.

## Error confirmado

### Guardado pendiente al recargar inmediatamente — gravedad baja en esta demo

- **Archivo y línea:** `src/app-state.js:238`–`240` (`demoStorageSave`).
- **Reproducción:** completar una lección; en cuanto el resultado aparece en `S.mine.avance.aprende`, recargar antes de los 400 ms del guardado diferido. El resultado existe en memoria, pero todavía no en `localStorage`. Después de recargar puede volver el estado anterior.
- **Evidencia:** la primera ejecución de `tests/habilita-demo.cjs` completó la lección y falló al comprobar el progreso tras una recarga inmediata. Esperando la escritura de `lh-demo-v6`, la misma comprobación pasa. La escritura diferida ya existe en la base de Claude.
- **Impacto:** pérdida del último cambio local si se recarga/cierra justo durante esa ventana. No es un fallo de validación presencial ni una pérdida de datos del runtime real.
- **Corrección propuesta, pendiente de autorización:** persistir inmediatamente al terminar una lección o vaciar el guardado pendiente en `pagehide`. Si falla `localStorage`, avisar y ofrecer exportación; hoy el `catch` silencia ese error.
- **Durante la reunión:** esperar un segundo tras terminar una lección antes de recargar o cerrar. La prueba automatizada espera la escritura real, no un tiempo supuesto.

## Decisiones y límites; no clasificados como errores

| Observación | Ubicación | Qué significa / propuesta |
|---|---|---|
| La demo reinicia sus ejemplos cuando cambia la fecha | `src/app-state.js:233` | `demoStorageLoad` solo recupera datos cuya fecha coincide con `S.hoy`. Parece intencional para mantener ejemplos relativos al día. Confirmar si se desea conservar un ensayo entre días antes de cambiarlo. |
| La versión real necesita el runtime de Claude | `src/app-state.js:279`, `src/app.js:16` | Se publica únicamente el modo demo, con `MemDB` y personas ficticias. No se presenta como un sistema de producción con cuentas reales. |
| Fuera de Claude no hay servicio de descargas de ese runtime | `src/view-tecnico.js:204`, `src/view-dic-ajustes.js:247` | La credencial se puede consultar; el botón de descarga depende del servicio. El respaldo interno ofrece texto JSON para copiar. Incorporar descarga nativa sería una mejora aparte. |
| Solo el primer módulo tiene el nuevo motor interactivo | `src/data-lecciones.js`, `CLAUDE.md:79` | Etapa declarada del proyecto; los otros 12 módulos siguen pendientes. El guion lo comunica. |
| Los roles de esta publicación son simulados | `src/seed.js:28`, `src/app-state.js:248` | Se usan para mostrar las dos experiencias. No son una barrera de seguridad ni deben usarse con datos personales reales. |

## Comprobaciones

- Base de Claude: **218 pruebas de lógica/almacenamiento** y **468 comprobaciones de navegador**, sin fallas. Incluyen escritorio, tablet, teléfono y temas claro/oscuro. Se ejecutó el mismo E2E sobre HTTP local usando Chromium instalado; las rutas `file://` se sustituyeron solo en el lanzador de pruebas, porque el navegador administrado restringe archivos locales.
- Recorridos nuevos: **64 comprobaciones** en escritorio oscuro y teléfono claro: selector, teclado, avance/retroceso, ejercicio completo con error deliberado, reintento, guardado, recarga, cambio de perfil, cinco pantallas del administrador, salida y restablecimiento confirmado/cancelado. Incluyen repetir la celebración al iniciar una nueva presentación sin borrar avance, y no repetirla al retroceder dentro de la guía.
- En ambos recorridos se comprueban errores JavaScript, respuestas HTTP fallidas, solicitudes fallidas y ausencia de recursos externos necesarios.
- El workflow ejecuta estas pruebas **antes** de publicar y las repite contra la URL pública en contextos nuevos sin sesión. Conserva las pruebas existentes de la página comercial y la presentación. Las capturas y el resultado del despliegue quedan en GitHub Actions.

No se modificaron las reglas de habilitación, las decisiones de negocio ni los hallazgos anteriores para hacer pasar las pruebas.
