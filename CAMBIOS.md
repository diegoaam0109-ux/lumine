# Cambios de esta versión

## Sexta ronda: diseño, sencillez y experiencia (03-10-2026)

**Técnico**
- Mi ruta rehecha: una sola acción principal ("Continúa con…", "Tu validación es el…"), anillo con las competencias listas y barras por nivel.
- Celebración a pantalla completa al validar un nivel, con confeti (se apaga con movimiento reducido) y lo que desde hoy puede hacer.
- Credencial digital con código QR propio (sin librerías), estado vigente o vencido, y descarga como imagen. El código cambia con cada nivel.
- Avisos con campana: validación programada, nivel nuevo, respuesta a la rotación, revalidación por vencer, temas por repasar.
- Lenguaje de taller: el técnico ya no ve códigos (C14, N2-3, D9); ve temas en palabras.
- El expediente ahora trae las próximas validaciones (tipo y fecha, nunca la pauta) y el código de credencial.

**Portada**
- De 11 secciones a 6: portada, recorrido del kit en 3D que se arma al bajar, cómo funciona, plan por perfil, laboratorio y taller, cierre.
- Un solo botón principal según quién mira (Postular, Ir a mi ruta, Abrir el panel).
- Nueva sección "El sistema" con niveles, nivel 2, pauta, permisos, indicadores y todas las fuentes.

**Administración**
- Panel con "Hoy": todo lo que pide acción, ordenado por urgencia.
- Personas en embudo (postulante → diagnóstico → nivel 1 … nivel 4), con vista de lista opcional.
- Calendario mensual de validaciones.
- Búsqueda rápida Ctrl+K o /: personas, validaciones, ajustes, módulos y competencias. Pegando un código LH… verifica la credencial.
- Ajustes en 3 grupos: Reglas, Contenido y equipo, Sistema.

**Detalles**
- Esqueletos de carga, ayudas "?" de una línea, botones de 48 px en pantallas táctiles (guantes), indicador animado en la barra inferior, transición entre vistas en teléfono, pie de página más corto.

## Quinta ronda: D13 cerrada, revalidación, horas y período autónomo con fuentes (03-10-2026)

- **D13, rotación de duos: cerrada.** Voluntaria, cada 4 meses como mínimo, por solicitud escrita al Responsable
  Técnico explicando por qué (al menos 20 caracteres). El técnico la pide desde *Mi ruta › Tu duo*, puede
  retirarla y ve la respuesta. El jefe la ve en *Duos* (y un aviso en el Panel), con los requisitos revisados, y
  la aprueba (se termina el duo, en una sola operación con deshacer) o la rechaza con respuesta. La solicitud vive
  en `solicitudes/{uid}`, lo único nuevo que escribe un técnico; la respuesta vive en `personas/`, que solo escribe
  administración, así que nadie se aprueba solo. Todo queda en la bitácora y en el respaldo.
- **Requisito nuevo del duo:** dos técnicos de nivel 1 nunca forman duo (el nivel 1 solo habilita a ser el segundo
  integrante). Única excepción: al arrancar, cuando nadie llegó al nivel 2, trabajan bajo el Responsable Técnico
  (regla de avance 3).
- **Revalidación del core de seguridad: 24 meses** (antes 12, provisorio). Sale de pendientes.
- **Horas por módulo con fuente** (`HORAS_REF`): 392 h si se cursa todo. Lo de alta tensión sale de DGUV 209-093,
  NF C 18-550, RD 281/2021 y DGUV 204-022; lo propio del kit es estimación y así se marca. Ajustes muestra la
  base de cada número. El plan personal y el costo por técnico ya calculan horas.
- **Período autónomo del nivel 3: 90 días.** Ninguna norma fija la ventana de observación; 90 días caben dentro
  de un mismo duo.
- **Consultas pendientes investigadas:** escasez de técnicos (estudio Ministerio de Energía, SENCE y Centro UC:
  cerrada con fuentes); licencia SEC (el borrador pide un instalador electricista SEC sin clase; por el D.S. 92
  sería C hasta 50 kW o B sobre eso, falta confirmación de la SEC); batería del kit (llega con carga: hasta 30%
  por avión, sin límite por mar; peso y montaje dependen del proveedor que se elija). 14 fuentes nuevas.
- Demo: clave de almacenamiento v5; Valentina tiene una solicitud de rotación pendiente.
- **Versión real:** hay que volver a publicar con `DB_RULES` actualizadas (incluye `solicitudes`).
- Pruebas: 137 de reglas, 27 de la base y 333 en navegador (24 nuevas del flujo de rotación).

## Cuarta ronda: D18 cerrada y revisión contra los informes (03-10-2026)

- **D18, firma por nivel: cerrada.** El nivel 3 (autónomo) firma su trabajo propio: checklist de pruebas y registro
  de calibración del propio duo. El nivel 4 (formador) firma revisiones cruzadas: calibración de otro duo y
  validaciones internas. Lo legal sigue siendo solo del Responsable Técnico (D17). Cambia el registro de
  decisiones, la tarea 8.5, el módulo N4-1 y Ajustes › Parámetros, donde ya no es una opción editable.
  Sale de la lista de pendientes.
- **Revisión contra los informes 1 a 6.** Las 39 competencias (nivel, prioridad, criticidad, forma de evaluar,
  quién valida y mercado), las 35 tareas, las 17 reglas, los 8 indicadores, los 4 tipos de usuario y las 4 reglas
  automáticas coinciden con los informes. No hubo otras diferencias.

## Tercera ronda: experiencia (03-10-2026)

- **Base oscura** con tema claro a elección (menú › Tema). La preferencia queda en el navegador.
- **Laboratorio 3D** (`#laboratorio`): auto genérico con el kit en el eje trasero, dibujado con un motor 3D propio
  (canvas, sin librerías externas). Girar, acercar, rayos X, despiece, ficha por pieza con sus competencias y
  módulos, lista accesible de piezas y prueba "¿dónde va cada pieza?". Posiciones ilustrativas, sin medidas.
- **Taller "Arma el kit"** (`#taller`): 19 cartas con tareas del duo del informe 1 y sus requisitos. Las cartas
  trampa son atajos de seguridad o de producto: uno solo y la instalación no se aprueba (regla del 100%).
  Sin puntos ni XP: tiempo, intentos y veredicto. El mejor tiempo queda solo en el navegador.
- **Portada**: titular grande, escena 3D con interfaz flotante, franja en movimiento, plan personal por perfil y
  sección "Aprender con las manos".
- **Postulación por pantallas**: nombre, tarjetas de perfil, experiencia con la ruta viva al lado, una pregunta
  de fundamentos por pantalla (avance automático, teclas 1 a 4) y resultado con números animados.
- **Módulos**: enlace "Míralo en el laboratorio 3D" a las piezas que trabaja cada módulo.
- **Movimiento** (`motion.js`): precarga breve una vez por sesión, apariciones, tarjetas con inclinación, botones
  magnéticos, barra de lectura y cursor de foco (solo con mouse). Todo se apaga con "reducir movimiento".
- Corregido: al cambiar de rol en la demo aparecía "Esa sección no está disponible" sin motivo.
- **Kiosco**: marcar Sabe o No sabe ya no devuelve la pantalla arriba (se conserva el scroll del kiosco).
- **Teléfono**: la columna de la pauta en la portada quedaba fija y se montaba sobre la lista al hacer scroll. Ahora
  solo es fija con dos columnas. En pantallas táctiles no hay animaciones de aparición ni paralaje, y el fondo
  fijo es más liviano, para que el texto no se vea raro al hacer scroll rápido.
- **Inicio de sesión en la demo**: la demo parte sin sesión (portada, diccionario, laboratorio y taller). Se entra con
  usuario y contraseña de prueba por rol (`responsable`, `calibracion`, `formadora`, `tecnico`; clave `demo1234`), con
  error genérico, bloqueo de 30 s tras 5 intentos, sesión que sigue al recargar y cerrar sesión. El postulante crea
  su propia cuenta (nombre, correo, contraseña) y entra directo a postular. El evaluador externo no tiene cuenta.
  Es una simulación: un login hecho solo en la página no protege datos, y así se dice en pantalla.
- **Así funciona en producción** (`#login`): diseño de cuentas para el lanzamiento (registro con correo, contraseñas
  con hash en el servidor, roles que cambian solos, doble factor para administración, bloqueo, recuperación,
  evaluador externo con código de un solo uso, permisos en la base).
- Pruebas e2e: 309 (laboratorio, taller y postulación nueva en PC y teléfono).

## Segunda ronda (03-10-2026)

- **Prueba de fundamentos con respuestas en A o B.** 8 de 9 respuestas correctas estaban en B. Ahora la correcta
  está repartida en A, B, C y D en el dato (para la prueba en papel que transcribe administración) y, en la
  postulación online, cada postulante ve las alternativas en otro orden. Se guarda la alternativa elegida, no la
  letra, así el puntaje no cambia.
- **Kiosco: no se podía navegar ni retroceder.** En la versión anterior los diálogos quedaban detrás del kiosco
  (corregido en la primera ronda). Ahora además el paso va en la dirección, así el botón Atrás del navegador o
  del teléfono retrocede un paso; los pasos se pueden tocar para volver; hay un botón "Elegir otra persona"; y si
  se intenta salir a otra sección, un aviso explica que el kiosco está activo y cómo salir.


Cada punto dice qué se pidió, qué causaba el problema y cómo quedó. Todo está cubierto por pruebas:
`npm test` (146 pruebas de reglas y datos) y `npm run e2e` (182 comprobaciones en navegador).

## Pedidos de Diego

**Kiosco "completamente roto".** Causa: la capa del kiosco tenía `z-index:120` y los diálogos 90/110, así que
"Salir del kiosco" y "Terminar y entregar" se abrían detrás, invisibles, con el foco atrapado. Además "Entregar"
no guardaba nada y, como el kiosco corre con la cuenta de administración, bastaba cambiar la URL para entrar al
panel. Ahora: capas corregidas; al abrir el kiosco se define un PIN y la navegación queda encerrada en `#kiosco`
(salir pide el PIN; cerrar la pestaña también lo termina); flujo en tres pasos (identificarse con declaración de
independencia, marcar con progreso fijo, revisar y entregar); la entrega se guarda en la sesión y cierra las
marcas externas; el Responsable Técnico ve quién entregó y puede reabrir con motivo.

**Pruebas que se podían copiar, poco interactivas, respuestas A/B.** Las respuestas del módulo N1-1 seguían el
patrón A-B-A-B-A. Ahora cada módulo tiene tres pasos (Aprende → Practica → Rinde la práctica); la práctica va de
a una pregunta, toma preguntas al azar de un banco y mezcla las alternativas en cada intento (probado: la
correcta cae en las cuatro posiciones); el material no está en pantalla y volver a él reinicia el intento; las
explicaciones aparecen solo al revisar; atajos de teclado (1-4, Enter, flechas).

**Retroceder para avanzar entre módulos.** Botones "Anterior / Siguiente" al pie de cada módulo dentro de la
misma línea (salta los bloqueados), posición "módulo 2 de 3" y, al aprobar, botón directo al siguiente.

**Contenido excluido.** Los 11 módulos "en preparación" tienen ahora contenido base (cápsulas, escenarios de
detener o seguir donde hay seguridad, y banco de preguntas). Está marcado como contenido base a validar con la
parte externa (D5) e Ingeniería de Calibración. Además el Responsable Técnico lo puede editar en Ajustes ›
Contenido sin programar.

**Versión para el postulante / inicio de sesión de administración.** La identidad la entrega claude.ai (no se
puede poner usuario y contraseña propios en un artifact). Ahora administración entra por una pantalla de
Entrada: ir al panel, ver como postulante o ver como un técnico real. La vista previa usa una base en memoria
con permisos de Colaborador: nada se guarda. La pantalla explica cómo entra cada persona.

**Bonos según presupuesto.** Ajustes › Parámetros › Calcular según presupuesto: presupuesto, horizonte,
personas esperadas por nivel (parte de quienes hoy pueden validar cada nivel) y peso de cada nivel. Reparte
sin pasarse del presupuesto y copia los montos con un clic.

## Revisión de ChatGPT

1. **D8 y D13 solo en la interfaz.** `crearSesion()` recalcula D8 y rechaza sin motivo; `terminarDuo()` calcula
   el plazo con la fecha del duo y el parámetro vigente (ya no confía en el parámetro `anticipado`). También se
   valida que las competencias pedidas correspondan a esa validación.
2. **Agenda al reasignar.** `asignarItem()` marca como "reasignado" la entrada del formador anterior.
3. **Costo por técnico habilitado.** Numerador y denominador usan la misma cohorte (quienes llegaron a nivel 3
   en el período), solo con costos hasta su habilitación; `enPeriodo` tiene tope (hoy). Probado con el caso de
   la revisión: cambiar el período ya no duplica el valor.
4. **Rotación de 0 meses.** `0 || 3` guardaba 3; ahora 0 se respeta, también en `estadoDuo`.
5. **Pruebas.** `node tests/logic.test.js` corre solo (antes había que concatenar); E2E con Playwright como
   dependencia del proyecto, sin rutas de una máquina.
6. **Fechas imposibles.** `parseISO('2026-02-31')` ahora devuelve `null` y las acciones validan fechas.

## Revisión de DeepSeek

- `data.js` dividido en datos, contenido y gobierno.
- Expediente proyectado: cualquier administración abierta lo recalcula desde `personas/` y escribe solo lo que
  difiere; Ajustes › Consistencia muestra los desactualizados.
- Pruebas unitarias de MemDB: rutas `{self}`, rutas límite, snapshots congelados, mezcla anidada, capacidad.
- `setProps` con lista de eventos permitidos y bloqueo de atributos `on*`.
- Candado de negocio en `marcarItem` y `enviarMarcas` (no solo el botón).
- Demo: ya se reiniciaba cada día; la clave de almacenamiento cambió a v4 por el nuevo formato.
- Pruebas leen identificadores de `DEMO_IDS`.
- Pendiente consciente: textos en español de Chile sin capa de traducción (no es prioridad del proyecto).

## Revisión de Gemini

- **Atomicidad.** La base de claude.ai no tiene transacciones. Cerrar validación, registrar salida, incidente
  grave y aceptar resultados usan `transaccion()`: guarda el estado previo y deshace si un paso falla. Si deshacer
  también falla, queda en bitácora y Ajustes › Consistencia lo detecta y repara.
- **Escalabilidad.** El límite real de la plataforma es 25.000 documentos por artifact (contrato 0.2.67), no
  5.000. MemDB y el respaldo usan ese número; Panel y Ajustes muestran el uso y avisan desde el 80%.
- **Errores silenciados.** `resolverPerfiles` ya no tiene `catch` vacío: registra, avisa una vez y lo muestra en
  Panel y Ajustes.
- **Currículo rígido.** El contenido de los módulos se edita desde Ajustes. La estructura (competencias, niveles,
  reglas) sigue en el código a propósito: de ella dependen las reglas y sus pruebas.
