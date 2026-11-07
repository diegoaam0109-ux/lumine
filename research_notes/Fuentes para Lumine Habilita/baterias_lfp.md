# Baterías de tracción LFP: peligros, manipulación, almacenamiento, transporte y respuesta a incendios (fuentes citables para Lumine Habilita)

> Notas de investigación al 07-11-2026. **Limitación de método:** en esta sesión la red bloqueó la lectura directa de casi todos
> los sitios primarios (lion.com, economiacircular.mma.gob.cl, pmc.ncbi.nlm.nih.gov, pubs.rsc.org, entre otros). Todo lo que sigue
> viene de resultados de búsqueda (fichas de catálogo, resúmenes, comunicados) y **no** de leer el texto completo de cada norma.
> Por eso cada fila trae un estado: **VERIFICADO (ficha oficial)**, **SECUNDARIO** (lo dice un tercero, falta contrastar con el
> original) o **POR CONFIRMAR**. No se inventaron cláusulas: donde no se pudo confirmar un número de sección, se deja «Por confirmar».
> Para cerrar las brechas hay que permitir en la red de la sesión: pmc.ncbi.nlm.nih.gov, pubs.rsc.org, economiacircular.mma.gob.cl,
> www.lion.com (y probablemente iata.org, nfpa.org, unece.org, bcn.cl/leychile.cl, anb.cl).

## 1. Peligros propios de LFP frente a otras químicas (fuga térmica, gases, reignición)

### Takeaway
LFP es térmicamente más estable que NMC/LCO (fuga térmica más tardía, menos calor y menos gas total), pero **no es inerte**: sus
gases de venteo son proporcionalmente más ricos en hidrógeno, más inflamables por volumen y emiten fluoruro de hidrógeno (HF) en
cantidades comparables; además, cualquier batería de ion-litio dañada puede reencenderse horas o días después.

### Tabla de fuentes

| Fuente (título exacto) | Emisor / autores | Año / edición | Sección | URL | Acceso | Español / Chile | Estado |
|---|---|---|---|---|---|---|---|
| *Toxic fluoride gas emissions from lithium-ion battery fires* | Larsson, Andersson, Blomqvist, Mellander (Chalmers / RISE), *Scientific Reports* 7, art. 10018 | 2017 (+ corrección de autores 2018) | Resumen; corrección del valor AEGL-3 | https://research.chalmers.se/en/publication/251555 · https://pmc.ncbi.nlm.nih.gov/articles/PMC5577247/ | Gratis (acceso abierto) | No hay versión en español | SECUNDARIO para el desglose por química (no se pudo abrir el texto completo) |
| *Thermal-runaway experiments on consumer Li-ion batteries with metal-oxide and olivin-type cathodes* (título según la revista; confirmar) | Golubkov et al., *RSC Advances* 4, número 7 | 2014 | Tablas de resultados (por confirmar) | https://pubs.rsc.org/en/content/articlelanding/2014/ra/c3ra45748f | Gratis (CC BY) | No | SECUNDARIO: cifras por química tomadas de un preprint que lo cita |
| Golubkov et al., estudio de seguimiento con celdas 18650 LFP y NCA | *RSC Advances*, número 70 | 2015 | Por confirmar | https://pubs.rsc.org/am/content/articlelanding/2015/ra/c5ra05897j | Gratis | No | SECUNDARIO |
| Meta-análisis de 60 artículos sobre gases de fuga térmica (LFP vs NMC) | Universidad de Sheffield (nota de prensa; artículo en *Journal of Energy Storage*, cita exacta por confirmar) | 2024–2025 (por confirmar) | — | https://sheffield.ac.uk/cmbe/news/new-research-paves-way-safer-batteries-reduced-fire-and-toxicity-risks | Nota gratis; artículo por confirmar | No | SECUNDARIO (nota de prensa) |
| Estudio de gases LFP vs NMC/LMO en atmósfera inerte | MDPI *Batteries* 5(3), 61 (DOI 10.3390/batteries5030061) | 2019 | — | https://doi.org/10.3390/batteries5030061 | Gratis | No | SECUNDARIO (citado por resumen de búsqueda) |
| *Safety Risks to Emergency Responders from Lithium-Ion Battery Fires in Electric Vehicles* (NTSB/SR-20/01) | National Transportation Safety Board (EE. UU.) | Nov. 2020 (comunicado 13-01-2021) | Hallazgos y recomendaciones | https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf · https://www.ntsb.gov/news/press-releases/Pages/NR20210113.aspx | Gratis | No | VERIFICADO (comunicado oficial) |

### Cited Findings
- Larsson et al. midieron calor liberado y emisiones de fluoruro en incendios de **siete tipos de baterías de ion-litio comerciales**; el HF emitido fue de **20 a 200 mg/Wh** de capacidad nominal, y en algunos ensayos se midió además **POF₃ (fluoruro de fosforilo) de 15 a 22 mg/Wh**; también estudiaron el uso de agua nebulizada como agente extintor — [Chalmers research](https://research.chalmers.se/en/publication/251555); [PMC5577247](https://pmc.ncbi.nlm.nih.gov/articles/PMC5577247/)
- La corrección de 2018 del mismo artículo fija: IDLH del HF = **0,025 g/m³ (30 ppm)** y AEGL-3 de 10 minutos = **0,139 g/m³ (170 ppm)** (el texto original decía 0,0139 g/m³; citar el valor corregido) — [PMC5864737 (corrección)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5864737)
- Golubkov et al. (2014) llevaron a fuga térmica tres tipos de celdas 18650 comerciales en un reactor calefaccionado y analizaron los gases por cromatografía; reportan temperaturas de celda de **hasta 850 °C** y liberación de gas de **hasta 0,27 mol** — [RSC Advances 2014](https://pubs.rsc.org/en/content/articlelanding/2014/ra/c3ra45748f)
- Según un preprint que cita a Golubkov, el inicio de la fuga térmica sería **~195 °C (LFP), ~170 °C (NMC) y ~150 °C (LCO/NMC)**, con ~50, ~150 y ~270 mmol de gas respectivamente — [Preprints.org 201702.0033](https://www.preprints.org/manuscript/201702.0033/v1/download). **Cifras por confirmar contra la tabla original antes de usarlas en una pregunta de examen.**
- El estudio de 2015 del mismo grupo comparó celdas 18650 **LiFePO₄ y Li(Ni0,80Co0,15Al0,05)O₂ (NCA)** y reporta temperatura de la primera reacción exotérmica, temperatura máxima, cantidad y composición del gas de venteo — [RSC Advances 2015](https://pubs.rsc.org/am/content/articlelanding/2015/ra/c5ra05897j)
- Meta-análisis de Sheffield (60 artículos): las celdas NMC ventean **más gas total**, pero el gas de LFP es **más tóxico y más inflamable**; el límite inferior de inflamabilidad del gas de LFP es **6,2 %** frente a **7,9 %** para NMC (atmósfera inerte), por lo que LFP alcanza la concentración inflamable en un volumen **~18 % menor**; el gas de LFP tiene **más H₂** y el de NMC **más CO** — [Universidad de Sheffield](https://sheffield.ac.uk/cmbe/news/new-research-paves-way-safer-batteries-reduced-fire-and-toxicity-risks) (resumen secundario; las cifras vienen del resumen de búsqueda de la nota)
- Estudio MDPI *Batteries* (2019): volumen total de gas **780 L/kg (NMC/LMO) frente a 42 L/kg (LFP)**, pero **cantidad total de HF similar**, lo que implica que el HF de LFP está más concentrado — [MDPI Batteries 5(3) 61](https://doi.org/10.3390/batteries5030061) (secundario)
- Explicación propuesta: el H₂ es alto en LFP porque estas celdas tienden a **ventear sin encenderse**, mientras que en NMC el evento suele ser combustión — [pv magazine, «How safe are lithium iron phosphate batteries?»](https://pv-magazine.com/2024/04/10/how-safe-are-lithium-iron-phosphate-batteries) (prensa técnica; usar solo como apoyo)
- NTSB SR-20/01: los riesgos para los equipos de emergencia incluyen **choque eléctrico, fuga térmica, ignición y reignición de la batería, y energía remanente («stranded energy»)**; la energía remanente en una batería dañada es la fuente principal del peligro; las tres baterías dañadas en choques estudiadas **se reencendieron después de que bomberos extinguieran el fuego**; los remolcadores que trasladan el vehículo también quedan expuestos — [NTSB comunicado NR20210113](https://www.ntsb.gov/news/press-releases/Pages/NR20210113.aspx); [NTSB SR2001.pdf](https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf)
- NTSB revisó las guías de respuesta de emergencia de **36 fabricantes** y las encontró inadecuadas; recomendó incluir orientación específica sobre fuga térmica, reignición y **almacenamiento seguro de vehículos dañados** — [NTSB SR-20/01](https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf); [hstoday](https://www.hstoday.us/subject-matter-areas/transportation/risks-to-emergency-responders-from-high-voltage-lithium-ion-battery-fires-addressed-in-safety-report/)
- En 2022, NTSB informó que **ocho fabricantes** ya habían incorporado su recomendación sobre guías de emergencia — [NTSB NR20220601](https://www.ntsb.gov/news/press-releases/Pages/NR20220601.aspx)
- NHTSA respondió (abril 2021) que su investigación se centraría en gestionar la energía remanente en paquetes de baterías — [NHTSA](https://www.nhtsa.gov/document/nhtsa-ntsb-response-april-2021-stranded-energy-lithium-ion-batteries-ncap-improvements)

### Hechos enseñables (cápsulas / preguntas)
- «LFP tarda más en entrar en fuga térmica y libera menos gas que NMC, **pero su gas es más rico en hidrógeno y se vuelve inflamable en menor volumen**» (Sheffield; Golubkov — cifras por confirmar).
- «Un incendio de batería de ion-litio puede emitir HF (20–200 mg/Wh en ensayos de Chalmers). El HF es peligroso para la vida desde 30 ppm (IDLH)» (Larsson 2017 + corrección 2018).
- «Una batería dañada puede reencenderse después de apagada: la energía queda almacenada» (NTSB SR-20/01).

### Inferences
- Para un banco LFP en un taller cerrado, el riesgo dominante en un venteo sin llama sería la **acumulación de gas inflamable rico en H₂ y tóxico (HF)**, más que una llamarada inmediata; esto justifica enseñar ventilación y evacuación aunque «no haya fuego».
- Ninguna de las fuentes encontradas cuantifica «horas» exactas de reignición para LFP específicamente; NTSB habla de reignición tras la extinción sin dar un plazo químico-específico en lo recuperado.

### Gaps
- No se pudo abrir el texto completo de Larsson 2017 para extraer el valor de HF **específico de las celdas LFP** ni el efecto del estado de carga; queda «Por confirmar».
- No se confirmaron las temperaturas de inicio de Golubkov 2014 contra la tabla original (pubs.rsc.org bloqueado).
- **Sin hallazgos** de NREL, FM Global, UL Solutions (informes de UL 9540A) ni NFPA Fire Protection Research Foundation en esta sesión. UL 9540A (método de ensayo de propagación de fuga térmica) solo aparece mencionado de forma indirecta: NFPA 855 (2026) alinea sus ensayos de fuego y explosión con UL 9540A ([Energy-Storage.news](https://www.energy-storage.news/nfpa-855-2026-edition-updates-and-what-they-mean-for-energy-storage-projects/)). Edición vigente de UL 9540A: por confirmar.
- Sandia: solo apareció una presentación del foro ESSRF 2023 sobre códigos (https://www.sandia.gov/app/uploads/sites/163/2023/07/2023ESSRF_Session4.3_Searles_Chris.pdf), no un informe de química LFP.
- El dato «LFP emite ~10 veces más HF por kWh» circula en resúmenes secundarios y **no se pudo verificar**: no usarlo.

## 2. Manipulación y almacenamiento de baterías nuevas y dañadas (NFPA 855, DGUV, cuarentena)

### Takeaway
NFPA 855 edición 2026 es la vigente (reemplaza a la de 2023) y su capítulo 14 regula el almacenamiento de baterías de litio
nuevas y usadas; las guías alemanas (DGUV y VBG) son la mejor referencia práctica para talleres: separar o aislar la batería
dañada, área de cuarentena, y enfriar con agua para frenar la propagación. Ninguna tiene versión oficial en español.

### Tabla de fuentes

| Fuente (título exacto) | Emisor | Edición / año | Sección | URL | Acceso | Español / Chile | Estado |
|---|---|---|---|---|---|---|---|
| *NFPA 855, Standard for the Installation of Stationary Energy Storage Systems* | National Fire Protection Association | **2026** (vigente; publicada ~sept. 2025). **Superadas: 2023 y 2020** | Cap. 14 «Storage of Lithium Metal or Lithium-ion Batteries» (14.1 a 14.6); alcance 1.1/1.3 por confirmar | https://shop.iccsafe.org/nfpa-855-2026-standard-for-the-installation-of-stationary-energy-storage-systems.html · https://www.nfpa.org (lectura gratis en NFPA LiNK con registro, por confirmar) | Pagada (lectura en línea gratuita con registro, por confirmar) | No hay versión oficial en español conocida | SECUNDARIO (fichas y resúmenes de consultoras) |
| *DGUV Information 209-093 Qualifizierung für Arbeiten an Fahrzeugen mit Hochvoltsystemen* | DGUV (Seguro Social Alemán de Accidentes) | Edición vigente por confirmar | Apartado 5.3 (asistencia en accidentes y rescate de vehículos) | https://publikationen.dguv.de | Gratis | No (alemán) | SECUNDARIO |
| *FBHM-123 Herstellung von Hochvoltspeichern* | DGUV, Fachbereich Holz und Metall | 09-2024 | — | https://publikationen.dguv.de/regelwerk/publikationen-nach-fachbereich/holz-und-metall/fahrzeugbau-antriebssysteme-instandhaltung/4517/fbhm-123-herstellung-von-hochvoltspeichern?c=4 | Gratis | No | VERIFICADO (ficha oficial) |
| *FBHM-124 Umgang mit Hochvoltspeichern* | DGUV, Fachbereich Holz und Metall | Borrador 04-02-2022 (versión final por confirmar) | — | https://dguv.de/medien/fb-holzundmetall/publikationen/infoblaetter/infobl_deutsch/2020-0005-fbhm-124_umgang-mit-hochvoltspeichern_entwurf_2022-02-04.pdf | Gratis | No | SECUNDARIO (borrador) |
| *Umgang mit Hochvoltspeichern in Kfz-Werkstätten* (presentación, J. Müller, TAK) | DGUV, jornada técnica Hochvolt | 2024 y 2025 | — | https://dguv.de/medien/fb-holzundmetall/veranst/dokumente/2025/fav-hochvolt/06_umgang-mit-hochvoltspeichern-in-kfz-werkstaetten_j_mueller_tak_handout.pdf | Gratis | No | SECUNDARIO |
| *Muster-Gefährdungsbeurteilung „Arbeiten am HV-Energiespeicher“* | VBG (mutual alemana) | Por confirmar | — | https://cdn.vbg.de/media/43b63860e00d4b81b2e9fe7c27afad8b/dld:attachment/Projekt_Elektromobilitaet_Muster_GefBeurteilung_03_HVEnergiespeicher(1).docx | Gratis | No | SECUNDARIO |
| Guía interasociaciones para talleres sobre vehículos HV accidentados (recepción, almacenamiento, cuarentena) | Gremios del oficio automotriz alemán (título exacto por confirmar) | ~2024–2025 | — | https://www.deutsche-handwerks-zeitung.de/?p=373910 | Por confirmar | No | POR CONFIRMAR (solo nota de prensa) |

### Cited Findings
- NFPA 855 edición 2026: el Análisis de Mitigación de Peligros (HMA) pasa a exigirse en casi todas las instalaciones; se alinean los ensayos de fuego y explosión con **UL 9540A**; se agrega una sección de sistemas de energía de emergencia — [Energy-Storage.news](https://www.energy-storage.news/nfpa-855-2026-edition-updates-and-what-they-mean-for-energy-storage-projects/); [MeyerFire](https://www.meyerfire.com/blog/whats-new-in-nfpa-855-2026-edition) (resúmenes secundarios; los detalles difieren entre fuentes)
- El capítulo 14 de NFPA 855 cubre el almacenamiento de baterías de litio metálico o ion-litio; desde la edición 2023 abarca **unidades nuevas y usadas** (antes solo «usadas o fuera de especificación»). Subsecciones: 14.1 Baterías, 14.2 Lugares de acopio, 14.3 Almacenamiento interior, 14.4 Prevención y mitigación, 14.5 Protección contra explosión, 14.6 Almacenamiento exterior — [ACP, ESS Codes and Standards Overview (2023)](https://cleanpower.org/wp-content/uploads/2023/07/ACP-ES-Product-6-ESS-Codes-and-Standards-Overview-6.28.23.pdf); [fire-police-ems.com (índice NFPA 855-2026)](https://www.fire-police-ems.com/NFPA855-2026.shtml). Numeración por confirmar contra el texto 2026.
- La primera edición (NFPA 855-2020, dic. 2019) se publicó sin alcance; la de 2023 agregó uno — [ACP](https://cleanpower.org/wp-content/uploads/2023/07/ACP-ES-Product-6-ESS-Codes-and-Standards-Overview-6.28.23.pdf)
- NFPA 855 es una norma de **instalaciones estacionarias**; **no se pudo confirmar** si excluye expresamente a los vehículos. El NFPA Journal usa un VE de 75 kWh como ejemplo al discutir umbrales — [NFPA Journal mayo/junio 2019](https://nxtbook.com/nxtbooks/nfpa/journal_20190506/index.php?startid=85)
- DGUV I 209-093 trata la calificación para trabajar en vehículos con sistemas de alto voltaje y tiene un apartado 5.3 sobre asistencia en accidentes y rescate de vehículos; advierte que en celdas de ion-litio hay que contar con peligros ante **manipulación incorrecta, sobrecalentamiento, daño mecánico o falla interna** — [DGUV publikationen](https://publikationen.dguv.de/widgets/pdf/download/article/4518) (secundario)
- Presentación DGUV 2025 para talleres: ante un acumulador dañado, **retirarlo del área de trabajo o pasarlo a un contenedor de seguridad con función de transporte**; los acumuladores HV pueden **enfriarse con agua para impedir la propagación térmica** — [DGUV handout 2025](https://dguv.de/medien/fb-holzundmetall/veranst/dokumente/2025/fav-hochvolt/06_umgang-mit-hochvoltspeichern-in-kfz-werkstaetten_j_mueller_tak_handout.pdf)
- Evaluación de riesgos tipo VBG: almacenar baterías HV en **áreas separadas con protección contra incendio o a 5 m de distancia** de otros bienes o instalaciones (no se refiere específicamente a baterías dañadas) — [VBG](https://cdn.vbg.de/media/43b63860e00d4b81b2e9fe7c27afad8b/dld:attachment/Projekt_Elektromobilitaet_Muster_GefBeurteilung_03_HVEnergiespeicher(1).docx)
- Guía alemana interasociaciones para talleres: recomendaciones desde la recepción hasta el almacenamiento y la **cuarentena**, incluida la posible ubicación de la batería HV en un **área de cuarentena separada** — [Deutsche Handwerks Zeitung](https://www.deutsche-handwerks-zeitung.de/?p=373910) (nota de prensa)

### Hechos enseñables
- «Batería dañada: fuera del área de trabajo, a contenedor de seguridad o a cuarentena; vigilar y poder enfriar con agua» (DGUV 2025; guía de talleres).
- «Almacenamiento de baterías HV: sector separado con protección contra incendio o 5 m de distancia» (VBG; usar como buena práctica, no como norma chilena).
- «NFPA 855 vigente: edición 2026; capítulo 14 = almacenamiento de baterías de litio nuevas y usadas» (confirmar numeración).

### Inferences
- Para Chile no se encontró norma equivalente de almacenamiento de baterías de tracción en talleres; lo más defendible en la capacitación es citar NFPA 855 cap. 14 y DGUV como buenas prácticas internacionales, marcadas «referencia».

### Gaps
- No se encontró guía VDA específica sobre baterías HV dañadas (solo la recomendación VDA sobre el resumen de ensayo 38.3.5: https://www.vda.de/en/news/publications/publication/vda-recommendation-on-38.3.5-test-summary-for-lithium-batteries).
- Edición vigente exacta y texto de DGUV I 209-093 y versión final de FBHM-124: por confirmar en publikationen.dguv.de.
- Sin hallazgos sobre guías de fabricantes de celdas LFP (fichas de seguridad del fabricante del banco de Lumine: pedirlas al proveedor).
- Plazo de observación en cuarentena (horas/días): no se encontró una cifra con fuente primaria.

## 3. Transporte (UN 38.3, UN3480/3481/3171, IATA 2026, ADR/IMDG, Chile)

### Takeaway
UN 38.3 está en el *Manual de Pruebas y Criterios* Rev. 8 (2023) con su Enmienda 1 (2025). En aéreo, el 30 % de estado de carga
(SoC) ya era obligatorio para UN3480 (PI 965); desde el **1-01-2026** la DGR 67.ª edición lo vuelve obligatorio también para
baterías embaladas con equipos (PI 966) y para vehículos (PI 952), salvo aprobación de los Estados. En Chile rige el D.S. 298/1994
del MTT, cuyas referencias a NCh 2190 fueron reemplazadas por las Recomendaciones de la ONU.

### Tabla de fuentes

| Fuente (título exacto) | Emisor | Edición / año | Sección | URL | Acceso | Español / Chile | Estado |
|---|---|---|---|---|---|---|---|
| *Recommendations on the Transport of Dangerous Goods – Manual of Tests and Criteria* | ONU (UNECE, Subcomité de Expertos) | **Rev. 8 (2023) + Enmienda 1 a la Rev. 8 (2025, publicada sept. 2025)**. Superadas: Rev. 7 y anteriores | Sección 38.3 (ensayos de baterías de litio) y 38.3.5 (resumen de ensayo) | https://digitallibrary.un.org/record/638368 · https://unece.org (publicaciones de mercancías peligrosas) | Gratis (PDF en UNECE) | Existe versión oficial en español de la ONU (*Manual de Pruebas y Criterios*); confirmar enlace | SECUNDARIO (fecha de vigencia de Rev. 8 según laboratorio de ensayos) |
| *Dangerous Goods Regulations (DGR)* 67.ª edición y *Lithium Battery Guidance Document 2026* | IATA | 67.ª ed., vigente 1-01-2026 a 31-12-2026 | PI 965 (UN3480), PI 966/967 (UN3481), PI 952 (vehículos UN3556/3557/3558); Disposiciones especiales por confirmar | https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/ (por confirmar) | DGR pagada; guía de baterías gratis | DGR existe en español (pagada) | SECUNDARIO |
| *Lithium Battery Shipping Guide* (2026) | FAA (EE. UU.) | 2026 | — | https://www.faa.gov/sites/faa.gov/files/Lithium-Battery-Shipping-Guide_508_2026.pdf | Gratis | No | SECUNDARIO (no se leyó completo) |
| *Decreto N° 298 Reglamenta transporte de cargas peligrosas por calles y caminos* | Ministerio de Transportes y Telecomunicaciones (Chile) | 1994, con modificaciones | Art. 4 y art. 34 (modificados) | https://leap.unep.org/en/countries/cl/national-legislation/decreto-no-298-reglamenta-transporte-de-cargas-peligrosas-por · https://www.bcn.cl/leychile (texto refundido, por confirmar) | Gratis | Chile | VERIFICADO (ficha UNEP); modificación SECUNDARIO |
| Decreto modificatorio del D.S. 298 (reemplaza referencia a NCh 2190.Of93 por la Parte 5 del Vol. II de las Recomendaciones ONU) | MTT | Diario Oficial 21-07-2022 según URL (el resumen lo llama «Decreto 40»; número y año por confirmar) | Art. 4 y 34 | https://www.diariooficial.interior.gob.cl/publicaciones/2022/07/21/43307/01/2159117.pdf | Gratis | Chile | POR CONFIRMAR |
| NCh 382 (clasificación de sustancias peligrosas) | INN | NCh 382:2013 citada por D.S. 43 MINSAL; versión vigente (¿2017?) por confirmar | Clase 9 | https://iura.cl/dto-43-minsal/102.html (referencia indirecta) | Pagada (INN) | Chile | POR CONFIRMAR |

### Cited Findings
- El *Manual de Pruebas y Criterios* Rev. 8 rige desde el **27-11-2023** según un laboratorio alemán de ensayos — [lithium-batterie-service.de](https://www.lithium-batterie-service.de/en/service-information/service/un-38.3-test-series/); existe la **Enmienda 1 a la Rev. 8 (2025)**, publicada en septiembre de 2025, que modifica UN 38.3 — [Certifico](https://certifico.com/merci-pericolose/documenti-merci-pericolose/manuale-onu-prove-e-criteri-dg/un-manual-of-tests-and-criteria-rev-8-2023-and-amendment-1-to-rev-8-2025); [lithium-batterie-service.de blog](https://www.lithium-batterie-service.de/en/index.php/blog/33303600000000000000000000000000); registro en la biblioteca digital ONU — [UN Digital Library 638368](https://digitallibrary.un.org/record/638368)
- La VDA publicó una recomendación sobre el **resumen de ensayo 38.3.5** para baterías de litio — [VDA](https://www.vda.de/en/news/publications/publication/vda-recommendation-on-38.3.5-test-summary-for-lithium-batteries)
- Ion-litio de más de 100 Wh se asigna a **Clase 9** con todos los requisitos aplicables; litio metálico: UN3090 (sola) y UN3091 (con/en equipo) — [ICAO DGP working papers (español)](https://www.icao.int/safety/DangerousGoods/DGP%2024%20Working%20Papers/DGP.24.WP.041.5.sp.pdf) (contexto). Para ion-litio: **UN3480** (baterías solas) y **UN3481** (embaladas con equipo o contenidas en él) — [FAA 2026](https://www.faa.gov/sites/faa.gov/files/Lithium-Battery-Shipping-Guide_508_2026.pdf); [open-exam-prep (guía de estudio)](https://open-exam-prep.com/study-guides/ca-iata-dgr-air/ch04/ch04-sec04)
- IATA: el límite de **30 % SoC para UN3480 (PI 965) no es nuevo**, ya regía antes de 2026; en la DGR 2025 se introdujo como **recomendación** para baterías con equipos (PI 966) y vehículos, y desde **2026 es obligatorio** para ion-litio embaladas con equipo y para vehículos con baterías de ion-litio o de ion-sodio, salvo aprobación de los Estados — [Lion Technology, dic. 2025](https://www.lion.com/lion-news/december-2025/new-lithium-battery-state-of-charge-limit-in-effect-jan-1); [Lion, «What's new in the 2026 IATA DGR»](https://www.lion.com/lion-news/august-2025/what-s-new-in-the-2026-iata-dgr)
- Vehículos UN3556 (y UN3557/UN3558) bajo **PI 952**: con baterías de más de 100 Wh, SoC **≤30 % de la capacidad nominal o ≤25 % de la capacidad indicada**, salvo aprobación; recomendado en 2025, obligatorio en 2026 — [JAL Cargo, aviso 29-12-2025](https://www.jal.co.jp/jp/ja/jalcargo/news/20251229-02/); [Lion cheat sheet SoC 2026](https://www.lion.com/getmedia/34a1639d-f193-4c04-90b2-acc50fb051af/Cheat-Sheet-012-Lithium_SOC_2026.pdf)
- PI 966 obligatorio en 2026 para baterías **mayores de 2,7 Wh**; las de ≤2,7 Wh (PI 966 Sección II) solo con recomendación; los envíos sobre el límite requieren aprobación del **Estado de origen y del Estado del operador** — [FAA 2026 (según resumen)](https://www.faa.gov/sites/faa.gov/files/Lithium-Battery-Shipping-Guide_508_2026.pdf); [resumen 2025 (Google Docs)](https://docs.google.com/document/d/1WvHKK4U1d-aw6GUoU_b58vaoHx92VyLdlmjLUArCD1w/pub) (secundarios)
- Baterías contenidas en equipos (UN3481, PI 967): el 30 % sigue siendo **solo recomendación** — [Lion cheat sheet 2026](https://www.lion.com/getmedia/34a1639d-f193-4c04-90b2-acc50fb051af/Cheat-Sheet-012-Lithium_SOC_2026.pdf)
- **Contradicción:** algunas páginas de DHL presentan el 30 % para UN3480 como novedad de 2026 — [DHL checklist](https://www.dhl.com/discover/en-in/logistics-advice/import-export-advice/lithium-batteries-dangerous-goods-checklist); Lion y la guía FAA lo tratan como requisito previo. Tomar la versión de Lion/FAA y confirmar con la DGR.
- D.S. 298 (MTT, 1994) establece condiciones, normas y procedimientos para el transporte de cargas peligrosas por calles y caminos; fiscalizan Carabineros e inspectores municipales y fiscales — [UNEP LEAP](https://leap.unep.org/en/countries/cl/national-legislation/decreto-no-298-reglamenta-transporte-de-cargas-peligrosas-por); [FAOLEX](https://faolex.fao.org/docs/pdf/chi207396.pdf)
- Un decreto modificatorio reemplazó la cita a **NCh 2190.Of93** (art. 4 y art. 34 del D.S. 298) por la **Parte 5 del Volumen II de las Recomendaciones de la ONU** (marcado y etiquetado) — [Diario Oficial 21-07-2022](https://www.diariooficial.interior.gob.cl/publicaciones/2022/07/21/43307/01/2159117.pdf) (número y fecha del decreto: por confirmar)
- El D.S. 43 (MINSAL, almacenamiento de sustancias peligrosas) remite a las clases/divisiones 6.1, 8 y 9 de **NCh 382:2013** — [iura.cl, art. 102 D.S. 43](https://iura.cl/dto-43-minsal/102.html)

### Hechos enseñables
- «Una batería de tracción de ion-litio suelta viaja como **UN3480, Clase 9**; en o con un equipo, **UN3481**» (FAA/IATA).
- «Por avión, desde 2016 (fecha por confirmar) UN3480 viaja a ≤30 % SoC; desde 1-01-2026 también las embaladas con equipo (>2,7 Wh) y los vehículos (≤30 % nominal o ≤25 % indicado)» (Lion; JAL).
- «Antes de transportar, la batería debe tener aprobado su ensayo UN 38.3 y su resumen de ensayo (38.3.5)» (Manual ONU Rev. 8).
- «En Chile, por carretera, rige el D.S. 298 del MTT; el marcado sigue las Recomendaciones de la ONU (ya no NCh 2190)».

### Inferences
- Para Lumine, el transporte relevante es terrestre (proveedor → taller → cliente): D.S. 298 y, por referencia, las Recomendaciones ONU. El 30 % SoC es requisito aéreo; por carretera no se encontró un límite de SoC equivalente.

### Gaps
- No se recuperó el texto de **UN3171** (vehículo propulsado por batería) ni su situación tras la creación de UN3556/3557/3558 en las Recomendaciones ONU; por confirmar si UN3171 quedó solo para baterías de otras químicas.
- **ADR 2025 e IMDG (Enmienda 42-24)**: sin hallazgos en esta sesión; las disposiciones especiales para baterías dañadas/defectuosas (p. ej., SP 376 y P908/P911 en las Recomendaciones ONU, por confirmar) no se verificaron.
- Fecha exacta de entrada en vigor del 30 % obligatorio para PI 965 (se suele citar 1-04-2016): **no verificada** en esta sesión.
- Versión vigente de NCh 382 y NCh 2190 (posibles ediciones 2017/2019): por confirmar en el INN. Texto refundido del D.S. 298 en LeyChile: por confirmar.

## 4. Respuesta a emergencias e incendios (SAE J2990, ISO 17840, NFPA, CTIF, Bomberos de Chile)

### Takeaway
SAE J2990 vigente es la revisión de julio de 2019 (J2990_201907; la de 2012 está superada); ISO 17840-1:2022 define la hoja de
rescate. CTIF publicó en diciembre de 2025 una guía operativa en español sobre vehículos eléctricos. En Chile no se encontró una
guía oficial de Bomberos/ANB específica para incendios de vehículos eléctricos; hay un proyecto de ley (boletín 18042) en trámite.

### Tabla de fuentes

| Fuente (título exacto) | Emisor | Edición / año | Sección | URL | Acceso | Español / Chile | Estado |
|---|---|---|---|---|---|---|---|
| *J2990 Hybrid and EV First and Second Responder Recommended Practice* | SAE International | **J2990_201907** (revisada 29-07-2019, vigente). Superada: J2990_201211 | Por confirmar | https://saemobilus.sae.org/content/J2990_201907 | Pagada | No | VERIFICADO (ficha SAE Mobilus) |
| *J2990/1 Gaseous Hydrogen and Fuel Cell Vehicle First and Second Responder Recommended Practice* | SAE International | J2990/1_201606 (estado actual por confirmar) | — | https://shop.standards.ie/en-ie/standards/sae-j2990-1-201606-1027718_saig_sae_sae_2396523 | Pagada | No | No aplica a LFP (hidrógeno) |
| *ISO 17840-1:2022 Road vehicles — Information for first and second responders — Part 1: Rescue sheet for passenger cars and light commercial vehicles* | ISO (TC 22) | **2.ª ed., feb. 2022** (vigente). Superada: 2015 | Anexo C (páginas adicionales ligadas a la guía de respuesta de emergencia) | https://www.iso.org/standard/78461.html | Pagada (copia pública en law.resource.org) | No | VERIFICADO (ficha ISO) |
| ISO 17840-3:2019 (guía de respuesta de emergencia; pictogramas en Anexo B) e ISO 17840-4 (identificación de la propulsión) | ISO | 2019 / por confirmar | Anexo B | https://www.iso.org | Pagada | No | SECUNDARIO |
| *Guía operativa VE* (V1, 12-2025, español) | CTIF (Asociación Internacional de Servicios de Bomberos y Rescate) | Dic. 2025 | — | https://mail.ctif.org/sites/default/files/2025-12/Guia%20operativa%20VE%20V1%2012%202025%20ESP.pdf | Gratis | **Sí, en español** | SECUNDARIO (no se leyó completa) |
| *Safety Risks to Emergency Responders from Lithium-Ion Battery Fires in Electric Vehicles* (SR-20/01) | NTSB | 2020 | — | https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf | Gratis | No | VERIFICADO |
| «El enfoque híbrido» | Academia Nacional de Bomberos de Chile (ANB) | Adaptación de un artículo de 2012 | — | https://www.anb.cl/documentos_sitio/54670_El-enfoque-Hibrido.pdf | Gratis | **Chile** | SECUNDARIO (antiguo) |
| Proyecto de ley sobre seguridad contra incendios en estacionamientos de VE (boletín 18042) | Cámara de Diputadas y Diputados de Chile | Ene. 2026, en comisión | — | https://www.camara.cl/cms/2026/01/29/proponen-medidas-de-seguridad-en-estacionamientos-de-vehiculos-electricos/ | Gratis | Chile | VERIFICADO (nota oficial); no es norma vigente |

### Cited Findings
- SAE J2990 original: noviembre de 2012 (J2990_201211); revisión vigente **J2990_201907**, que incluye incidentes como incendios en garajes e inundaciones como eventos secundarios; los riesgos del hidrógeno van en J2990/1 — [SAE Mobilus J2990_201907](https://saemobilus.sae.org/content/J2990_201907); [BSI Knowledge](https://knowledge.bsigroup.com/products/hybrid-and-ev-first-and-second-responder-recommended-practice); [SAE Mobilus J2990_201211](https://saemobilus.sae.org/content/J2990_201211)
- ISO 17840-1:2022 (2.ª ed., feb. 2022) reemplazó a la de 2015; define contenido y diagramación de la hoja de rescate para turismos y comerciales livianos; los pictogramas se remiten a **ISO 17840-3:2019, Anexo B**; agrega comunicar la identificación de la propulsión según **ISO 17840-4**; el **Anexo C** fija encabezados para páginas adicionales ligadas a la guía de respuesta de emergencia (ISO 17840-3); no cubre identificación por bases de datos, VIN, eCall o QR — [ISO 78461](https://www.iso.org/standard/78461.html); [vista previa ANSI](https://webstore.ansi.org/preview-pages/ISO/preview_ISO+17840-1-2022.pdf); [law.resource.org](https://law.resource.org/pub/us/cfr/ibr/inc/iso/iso.17840-1.2022.pdf)
- CTIF publicó (dic. 2025) una guía operativa en español sobre intervención en vehículos eléctricos que distingue HEV, PHEV y BEV e incluye la hoja de rescate como herramienta — [CTIF Guía operativa VE](https://mail.ctif.org/sites/default/files/2025-12/Guia%20operativa%20VE%20V1%2012%202025%20ESP.pdf)
- ANB (Chile): recomienda tratar todo vehículo como si fuera híbrido/eléctrico y desconectar la batería de 12 V y el interruptor de alta tensión — [ANB, «El enfoque híbrido»](https://www.anb.cl/documentos_sitio/54670_El-enfoque-Hibrido.pdf)
- La ANB publica informativos de seguridad por modelo (ej. Cupra Formentor) — [ANB informativo Formentor](https://www.anb.cl/documentos_sitio/56345_Informativo_de_seguridad_Formentor.pdf)
- El Anexo 2 del Sistema de Comando de Incidentes de Bomberos de Chile lista un «Procedimiento de respuesta a incendio en vehículos», sin contenido específico de baterías en lo recuperado — [bomberos.cl](https://www.bomberos.cl/images/mini_sitio_sno/sci/descargas/Anexo%202%20-%20Procedimientos.pdf)
- Proyecto de ley (boletín 18042, ene. 2026) para exigir equipamiento de control y extinción en estacionamientos de VE y recintos con baterías de litio; menciona el riesgo de reactivación de un incendio que parecía extinto — [Cámara](https://www.camara.cl/cms/2026/01/29/proponen-medidas-de-seguridad-en-estacionamientos-de-vehiculos-electricos/); [Diario Constitucional](https://www.diarioconstitucional.cl/2026/01/12/proyecto-de-ley-busca-implementar-medidas-de-seguridad-contra-incendios-de-vehiculos-electricos/)
- Cuerpo de Bomberos de Santiago: el agua sigue siendo uno de los métodos más eficientes para incendios en VE (declaración del comandante Marcelo Cofré, en prensa) — [Autocosmos](https://noticias.autocosmos.cl/2021/08/29/por-que-los-bomberos-necesitan-hundir-los-autos-electricos-por-seguridad) (prensa; apoyo)

### Hechos enseñables
- «La hoja de rescate (ISO 17840-1:2022) le dice a bomberos dónde está la batería HV y cómo cortar el sistema»: para el kit Lumine, el auto modificado debería tener una hoja de rescate actualizada (inferencia; ver abajo).
- «Primera acción de bomberos según ANB: tratar el auto como eléctrico y cortar 12 V y el interruptor de alto voltaje».
- «Tras apagar el fuego, la batería puede reencenderse: el auto no se guarda junto a otros» (NTSB).

### Inferences
- Un auto a combustión con el kit Lumine **no tendría** hoja de rescate de fábrica que muestre el banco LFP trasero; es un riesgo para bomberos que conviene tratar en la capacitación (rotulado del vehículo y ficha propia según el formato ISO 17840). Decisión de negocio a consultar con el equipo.

### Gaps
- **NFPA «Electric Vehicle Emergency Field Guide»**: sin hallazgos en esta sesión (edición y año por confirmar).
- Euro NCAP / Euro Rescue: sin hallazgos.
- No se encontró guía oficial vigente de Bomberos de Chile o ANB específica para incendios de VE.

## 5. Fin de vida en Chile: Ley REP 20.920 y decreto de baterías (estado a 2026)

### Takeaway
Las baterías son producto prioritario de la Ley REP 20.920, pero su decreto de metas **no está vigente**: el MMA aprobó el
anteproyecto en febrero de 2026 (Res. Ex. 821/2026) y lo sometió a consulta pública. El decreto de **pilas y AEE** (D.S. 22/2025
MMA) sí se publicó el 7-05-2026.

### Tabla de fuentes

| Fuente (título exacto) | Emisor | Fecha | Sección | URL | Acceso | Chile | Estado |
|---|---|---|---|---|---|---|---|
| *Ley N° 20.920 Marco para la gestión de residuos, la responsabilidad extendida del productor y fomento al reciclaje* | Congreso de Chile / MMA | 2016 | Art. 10 (productos prioritarios; por confirmar) | https://www.bcn.cl/leychile (por confirmar) | Gratis | Sí | POR CONFIRMAR (no se abrió) |
| Res. Ex. 821/2026 «Aprueba anteproyecto de decreto supremo que establece metas de recolección y valorización… [baterías]» | Ministerio del Medio Ambiente | Feb. 2026 | Por confirmar | https://economiacircular.mma.gob.cl/wp-content/uploads/2026/02/1.-RE-821-2026-Aprueba-Anteproyecto-REP-Baterias.pdf | Gratis | Sí | SECUNDARIO (enlace oficial encontrado, no se pudo abrir) |
| Res. Ex. 2925/2025 y Res. Ex. 7995/2025 (amplían plazo del anteproyecto de baterías) | MMA | 08-05-2025 / dic. 2025 | — | https://economiacircular.mma.gob.cl/wp-content/uploads/2025/05/RE-2925-2025-Tercera-Ampliacion-de-plazo-AP-Baterias-08.05.2025.pdf · https://economiacircular.mma.gob.cl/wp-content/uploads/2025/12/RE-7995-2025-Amplia-plazo-AP-Baterias.pdf | Gratis | Sí | SECUNDARIO |
| D.S. 22/2025 MMA, metas de recolección y valorización de pilas y aparatos eléctricos y electrónicos | MMA | Diario Oficial 07-05-2026 | — | https://www.carey.cl/api/archivo/publican-decreto-que-establece-metas-de-recoleccion-y-valorizacion-de-residuos-de-pilas-y-aparatos-electricos-y-electronicos?lang=es | Gratis | Sí | SECUNDARIO (estudio jurídico) |

### Cited Findings
- El D.S. 22/2025 del MMA (pilas y AEE) se publicó en el Diario Oficial el **7-05-2026**; fija una meta general progresiva de **3 % el primer año hasta 45 %**, rige desde su publicación y limita mercurio y cadmio en pilas importadas — [Carey](https://www.carey.cl/api/archivo/publican-decreto-que-establece-metas-de-recoleccion-y-valorizacion-de-residuos-de-pilas-y-aparatos-electricos-y-electronicos?lang=es)
- El MMA aprobó en **febrero de 2026** el anteproyecto de decreto de metas de recolección y valorización de **baterías** y lo sometió a consulta pública (Res. Ex. 821/2026) — [MMA RE 821-2026](https://economiacircular.mma.gob.cl/wp-content/uploads/2026/02/1.-RE-821-2026-Aprueba-Anteproyecto-REP-Baterias.pdf)
- El plazo para elaborar el anteproyecto se amplió varias veces en 2025 (una prórroga hasta el **14-11-2025**) — [MMA RE 2925-2025](https://economiacircular.mma.gob.cl/wp-content/uploads/2025/05/RE-2925-2025-Tercera-Ampliacion-de-plazo-AP-Baterias-08.05.2025.pdf); [MMA RE 7995-2025](https://economiacircular.mma.gob.cl/wp-content/uploads/2025/12/RE-7995-2025-Amplia-plazo-AP-Baterias.pdf)
- El MMA será quien precise por decreto el alcance de las obligaciones (por ejemplo, para baterías de sistemas BESS) — [Prieto](https://www.prieto.cl/decreto-supremo-que-fija-las-metas-de-recoleccion-y-valorizacion-de-baterias-consideraciones-sobre-su-aplicacion-a-los-proyectos-bess/)
- Comité operativo ampliado (COA) de baterías sesionó en marzo de 2024 — [MMA, presentación COA baterías 28-03-2024](https://economiacircular.mma.gob.cl/wp-content/uploads/2024/04/Presentacion-N1-COA-Baterias-28-marzo-2024.pdf)

### Hechos enseñables
- «En Chile, las baterías son producto prioritario de la Ley REP, pero al 2026 su decreto de metas está en anteproyecto (Res. Ex. 821/2026 MMA): todavía no hay metas vigentes para baterías de tracción».

### Inferences
- Lumine, como importador de bancos LFP, probablemente quedará como «productor» bajo el futuro decreto; hasta su publicación, conviene enseñar la gestión de baterías fuera de uso como residuo peligroso (D.S. 148 MINSAL, por confirmar) y no prometer metas.

### Gaps
- No se pudo leer el anteproyecto: se desconoce si incluye categorías de **baterías de vehículos eléctricos/tracción**, metas y plazos. Por confirmar en economiacircular.mma.gob.cl.
- No se confirmó si el decreto de baterías se publicó entre febrero y noviembre de 2026.
- Aplicación del D.S. 148/2003 MINSAL (residuos peligrosos) a baterías de ion-litio: no investigado en esta sesión.
