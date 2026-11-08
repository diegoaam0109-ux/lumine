# Fase 4 · Plan Financiero · Traspaso de contexto (08-11-2026)

Integrador II (UNAB, prof. Roberto Brito). Leer completo antes de tocar el Excel. Lo que dice este documento es lo
decidido por el equipo hasta el 08-11-2026; lo marcado **PENDIENTE** aún no se decide.

## 1. Archivos

| Archivo | Qué es |
|---|---|
| `excel/v1_base_inicial.xlsx` | Excel base del equipo (hojas azules + hojas grises del semestre anterior). Datos del negocio antiguo (EMC). |
| `excel/v2_TIR169_descartada.xlsx` | Primera reconstrucción con el complemento de Claude para Excel. TIR 169%: descartada (ver §5). |
| `excel/v3_TIR6_actual.xlsx` | Reconstrucción con el complemento. TIR 6%: extremo conservador (ver §6). Reemplazada por la v4; sus hojas grises son la fuente de las de la v4. |
| `excel/v4_TIR20_kit_medio_credito30.xlsx` (+ `.pdf`) | **Versión actual (08-11-2026). Es la base para seguir.** Kit al punto medio y 30% a crédito; TIR 20% (ver §6). |
| `generador/` | Genera y verifica la v4 (Python + LibreOffice): `python generar.py`. Ver `generador/README.md`. |
| `excel/Costo_directo_kit_Lumine.xlsx` | Libro de costeo del kit (especificación antigua 48 V; sirve de base de componentes). |
| `prompts/PROMPT_v3_completo.md` | Prompt con el que se generó la v3 (Partes A y B) + agregado de sensibilidades. Sigue siendo la guía de contenido. |

Las hojas de pestaña **gris oscuro** son del semestre anterior: no se tocan. El informe Fase 3 (.docx) no se sube al
repositorio (es público); sus cifras clave están en §3.

## 2. Método de trabajo acordado

- Modelo en **pesos constantes, netos de IVA**. Inflación solo para deflactar depreciación/deuda y para Fisher.
- Flujo puro a **Ku** (CAPM con βU), inversionista a **Ke** (Hamada), VAN ajustado como verificación; WACC solo referencia.
- Capital de trabajo: **un solo método** (requerimiento = saldo al cierre; año 1 = máx(déficit acumulado máximo, saldo)).
- Valor de desecho: **contable** (decidido). El económico solo como referencia.
- Unidades enteras (kits, talleres, personas). Fondo blanco, celeste Lumine #12AAE9, números en negro.
- El complemento de Excel es bueno para fórmulas y malo para diseño: el diseño (Dashboard, formato) conviene hacerlo
  aparte. Trabajar **una hoja por vez** y revisar antes de seguir; los prompts gigantes generaron desorden.
- El complemento no puede crear tablas de datos (TABLE): las sensibilidades van con **selector de caso + foto de valores**
  y celda de control "FOTO DESACTUALIZADA".
- No ajustar supuestos para llegar a una TIR objetivo: cada supuesto debe tener fuente o quedar marcado como supuesto.
- Desde la v4 el libro se genera con `generador/generar.py` (openpyxl + LibreOffice), con fórmulas vivas y sin números
  escritos a mano en las hojas de cálculo; el complemento ya no hace falta. Las sensibilidades se toman igual: selector +
  foto de valores, ahora automática.

## 3. Datos de la Fase 3 que se usan (informe entregado)

- Precio de referencia con IVA: Esencial $4.290.000 / Plus $4.990.000 (neto $3.605.042 / $4.193.277). Mezcla 60% Plus.
  Precio "medio validado" por la encuesta (33 respuestas); se mantiene ligeramente sujeto a cambios.
- Costo directo del kit Fase 3 (Anexo 9): $2.991.086 / $3.350.171 al dólar $965,71; +$25.168 / +$28.886 por cada $10 de dólar.
- Nómina Tabla 16 (control): 151,98 / 266,51 / 432,10 / 575,70 / 760,68 millones.
- Tabla 18 (equipamiento por local), Tabla 19 (gasto operacional: arriendo $3,6 M/mes por local, servicios $700 mil,
  seguros $600 mil, mantención 3%, cursos y EPP $750 mil por técnico nuevo, plataformas), Tabla 11 (marketing).
- Capacidad: dúo 15,75 vehículos/mes (15 desde mayo de 2028, jornada 40 h); 6 dúos por local; regla del 80%.

## 4. Decisiones vigentes (08-11-2026)

**Calendario.** Año 0 = 2027 (meses −12 a −10 trámite D.S. 67; −9 a −4 Proyecto Experimental; −3 a −1 preapertura).
Ventas desde enero de 2028 (año 1), suponiendo reglamento propio vigente (su atraso va como escenario). Pilotos son
preoperativos (inversión inicial, no ingresos: el proyecto experimental permite probar, no vender).

**Impuestos.** 2027 12,5%, 2028 15% (Pro Pyme), desde 2029 23% (Ley 21.850, 17-10-2026). Arrastre de pérdidas.

**Tasas (PROVISORIAS, se deciden después).** Solo Damodaran EE.UU.: Rf BCU 10 años 2,69% (19-10-2026) − spread de
default 0,72% = 1,97%; PRM Chile 5,33%; βU Auto Parts 1,02 (alt. 1,13 corregido por caja); t 23%; 60/40; Kd 8,4% nominal
(BCCh, sept. 2026) → real con Fisher.

**Mercado.** Dólar base 981,58 (promedio octubre 2026, SII); forward 0,35% de diferencial a 2 años; euro 1.098,15;
AUD 679,49; real 195,89; UF 41.295,46 (9-11-2026). Inflación 2027 2,8%, 2028 3,0%, luego 3%.

**Demanda propia (Bass).** p = 0,0026 (Massiani y Gohs, 2015); q = 0,52 estimado por el equipo ajustando Bass a ventas
de híbridos convencionales en Chile (ANAC 2018–2025: 866, 850, 696, 1.796, 2.552, 3.766, 6.291, ~10.100), rango
0,47–0,60 (Gohs 2022: q robusto al potencial). Techo: segmento laboral RM 162.891 × **100% (optimista, elegido para
esta versión)**; 50% en Anexos. Cobertura de biblioteca 60% año 1, 80% después. Rampa = Bass mensual.

**Red de talleres (por taller, nunca por instalación).** Parte el año 3; talleres nuevos 3 / 5 / 8 (supuesto).
Paquete de entrada $6.000.000 (derecho $3 M ≈ Bosch Car Service Brasil 2026, adhesión R$15.000; formación de 2
técnicos $1,5 M c/u). Suscripción "Lumine Habilita Red": cuota base $250.000/mes (ref. Bosch fee R$810/mes ≈ $158.700)
+ Habilita $45.000 por técnico al mes (canasta de redcapacitacion.cl, 07-11-2026: $527.830/año). La unidad de control la
compra el taller; Lumine solo activa el patrón. Arancel 3CV al costo (no público; D.S. 33/2004).

**Cobros y crédito directo (decisión del equipo).** Pie 30% al agendar. Una parte de las ventas con crédito directo de
Lumine (sin financiera), 24 cuotas, 1,5% mensual, bono financiamiento 5%, incobrables 3%. **v3 usa 50% a crédito;
propuesta en revisión: 30%** (ver §6).

**Personal (rentas brutas).** GG $1,9 M; RT $1,7 M; Ingeniería de Calibración $1,5 M (evaluar $1,7 M); Adm. y Personas
$900 mil; comerciales $850 mil + comisión; técnicos N1–N4 $700 / 770 / 840 / 900 mil; asistentes $692 mil;
administrador de plataforma y red (honorarios part-time $450 mil, luego $900 mil); soporte de red 1 por 15 talleres.

**Inversión y otros.** Dinamómetro AUD 30.000 + 10% (≈ $22,4 M, Mainline, por recotizar); arriendo del taller 1 desde
el mes −9 (el Proyecto Experimental necesita local); desarrollo de software valorizado a mercado (2.050 h × $13.000 =
$26,65 M); I+D $30 M (años 1–2) y $50 M (años 3–4), amortizado; CORFO Crea y Valida y Ley 20.241 (35%) solo como escenario.
Marketing fuerte en lanzamiento, primeros años y apertura de la red.

## 5. Por qué se descartó la v2 (TIR 169%)

Inversión chica ($198 M) frente a volúmenes de la Fase 3 (2.715 propias + 7.909 de la red al año 5), kit en mejor caso,
red con licencia por instalación (margen 70%) y talleres fraccionados. No eran errores de fórmula sino supuestos generosos.

## 6. Estado actual: v4 (TIR 20%) con el punto medio aplicado (08-11-2026)

**Decidido (Diego, 08-11-2026):** se aplicó la propuesta de punto medio de la v3.
- Costo del kit al punto medio entre el costeo realista de la Fase 3 actualizado y el mejor caso (peso 50%): Esencial
  $2.840.035, Plus $3.165.652, mezcla **$3.035.406** al dólar base ($3.036.896 con forward) = 76,7% del precio neto.
  Los 6 kits del Proyecto Experimental siguen a costo realista (lote piloto).
- **30%** de las ventas con crédito directo.

Resultados de la v4 (caso base, tasas provisorias; todo en pesos constantes, netos de IVA):

| Indicador | v4 |
|---|---|
| TIR del flujo puro | **20,0%** |
| VAN del flujo puro a Ku 7,41% | **$799 M** (a WACC 7,73%: $770 M) |
| Payback descontado / simple | 4,7 / 4,6 años |
| Inversión del año 0 | **$467 M** = activos e intangibles capitalizados $196 M (nominal $189 M) + capital de trabajo $271 M |
| Capital de trabajo (requerimiento) | año 1 $271 M (déficit acumulado máximo, mes 12) · año 2 $598 M · año 3 $1.036 M · año 4 $1.710 M · año 5 $2.530 M |
| EBITDA del año 5 | $1.264 M (margen 9,6%) |
| Punto de equilibrio del año 1 | 412 vehículos (se proyectan 335: el año 1 cierra con EBITDA −$27 M) |
| Flujo del inversionista (40% deuda) | TIR 21,7% · VAN a Ke 10,2%: $597 M |

Por qué la TIR es 20%:
1. El kit pesa 77% del precio neto: el margen de contribución es ~$661 mil por vehículo. Por eso el costo del kit y el
   dólar son lo que más mueve el resultado.
2. El negocio crece rápido (Bass) y financia 30% de las ventas a 24 cuotas: el capital de trabajo sube todos los años
   (al año 5 es 100% cartera del crédito) y los flujos de los años 1 a 4 son negativos. El valor llega el año 5 con el
   valor de desecho contable ($2.844 M, de los cuales $2.530 M es la cartera recuperada). Sin valor de desecho, el VAN
   sería −$1.190 M. El valor de desecho económico (solo referencia) sería mucho mayor.
3. La demanda usa el techo de 100% (optimista): con 50%, la TIR baja a 8,4%.

Puente v3 → v4 (foto en Anexos; cada paso se puede activar con los casos «Puente»):

| Paso | TIR | VAN a Ku |
|---|---|---|
| v3 original (motor anterior) | 6,4% | −$90 M |
| Motor v4 con todos los supuestos de la v3 | 5,2% | −$202 M |
| + kit al punto medio | 15,9% | $785 M |
| + 30% de las ventas a crédito | 21,3% | $879 M |
| + tasa del crédito al cliente en real (Fisher) | 20,2% | $803 M |
| + capital de trabajo del año 1 con el déficit acumulado (método de clase) | 20,1% | $801 M |
| + equipamiento del taller 1 en el mes −9 (= v4) | 20,0% | $799 M |

Supuestos que más pesan (cambio de VAN contra la base): dólar ±10% (∓$1.190 M; TIR 1,3% / 38,8%), costo del kit
realista o mejor caso (−$994 M / +$988 M; TIR 4,4% / 35,6%), techo de demanda 50% (−$760 M; TIR 8,4%), reglamento con
12 meses de atraso (−$681 M; TIR 10,0%), q = 0,60 (+$425 M), 70% a crédito (−$290 M), regla de dúos al 100% (+$282 M),
sin crédito directo (+$214 M; TIR 50%). Red, Habilita y cuota mueven poco (±$60 M). Escenarios del Dashboard: pesimista
TIR −8,8%; optimista 46,6%.

Cambios de método de la v4 (no son supuestos nuevos; están en el Registro de cambios del Excel):
- Motor mensual para los 60 meses (antes: mensual hasta el mes 24 y anual en los años 3 a 5); Anual es su espejo.
- Tasa del crédito al cliente en real con Fisher (1,5% nominal → 1,25% real mensual); la v3 usaba la nominal como real.
- Capital de trabajo del año 1 con el déficit acumulado máximo del flujo operativo; la v3 tomaba el máximo del saldo.
- Equipamiento del taller 1 y del primer puesto en el mes −9 (el Proyecto Experimental instala 6 kits); antes, mes −3.

Sobredotación de técnicos (revisada): no hay error de fórmula. Las 486 de capacidad contra 335 instalaciones del año 1
vienen de la regla del 80% (25% de holgura por diseño: 389 de capacidad planificada) y de los dúos enteros: el tercer
dúo entra en mayo de 2028 porque la jornada de 40 horas baja la capacidad de 15,75 a 15. La utilización sube de 69%
(año 1) a 79% (año 5). Con la regla al 90% la TIR sería 22,6%; al 100%, 24,7%. La regla es de la Fase 3: no se cambió.

Verificación de la v4: LibreOffice y Excel calculan lo mismo (VAN $799.485.127); sin celdas con error; 13 controles en
0; unidades enteras; 14.006 fórmulas y ningún número escrito a mano en las hojas de cálculo; las 12 hojas grises son
idénticas byte a byte a las de la v3. Un modelo espejo en Python (`generador/espejo.py`) da el mismo VAN, al peso, en
el caso base y en los 34 casos de sensibilidad.

v3 (histórico): TIR 6% por apilar kit realista ($3,25 M), 50% a crédito y red chica; sin errores de fórmula.

## 7. Pendientes

Tasas (beta, riesgo empresa nueva, Ku o WACC) · techo de demanda con las respuestas de la encuesta · arancel 3CV
(vía Ley de Transparencia) · seguro de RC del proyecto experimental · desglose de habilitación del local · software y
licencias por cotizar · recotizar dinamómetro · fuente y tasa del crédito bancario · crédito por remuneraciones
(Ley 21.850) y depreciación instantánea Pro Pyme · personal y ritmo de la red · Fase 5: corregir Tabla 7 y el texto
de la Fase 3 que dice que Lumine distribuye kits a la red · informe Word de la Fase 4 (Carta, TNR 12, 1,5, márgenes
4/2,5, APA), sección por sección; objetivos financieros y estrategias de financiamiento se escriben al final.

Nuevos con la v4: respaldar el kit al punto medio con cotizaciones de componentes (es el supuesto que más pesa junto
con el dólar) · confirmar si la capacidad de 15,75 vehículos por dúo ya descuenta tiempos muertos (si es así, la regla
del 80% duplica la holgura) · confirmar con qué equipamiento se hace el Proyecto Experimental (la v4 lo compra en el
mes −9) · confirmar la tasa del crédito directo (el contrato es nominal; el modelo la usa en real).

## 8. Fuentes principales usadas

Damodaran (Betas US, Country Risk Premiums, enero 2026) · Banco Central (Informativo diario 21-10-2026; Estadísticas
Monetarias sept. 2026; IPoM sept. 2026) · SII (dólar observado 2026; Res. 43/2002 vidas útiles) · Ley 21.850 (Buk, AZ) ·
ANAC (informes cero y bajas emisiones 2024–2025) · Massiani y Gohs (2015) · Gohs (2022, Marburg) · Talukdar, Sudhir y
Ainslie (2002) · Bosch Car Service, Manual do credenciado 2026 · redcapacitacion.cl · SENCE valores hora 2026 ·
Maxus y Mazda (términos y condiciones de financiamiento 2025–2026) · Transbank (comisiones, julio 2026) · Ley 20.241
(extensión a 2035) · CORFO Crea y Valida 2026 · Indeed y Chiletrabajos (sueldos 2026) · AIRe / La Tribune Auto (retrofit
en Francia: 400 vehículos en 2023).
