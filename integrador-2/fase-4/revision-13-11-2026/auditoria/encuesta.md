> **Antecedente histórico de la base operativa anterior.** El último Excel financiero recibido y su revisión están en [actual_v6.md](actual_v6.md). Las cifras de seis autos/$490 M y las omisiones detectadas aquí no describen automáticamente la v6 vigente.

# Auditoría de encuesta y embudo comercial de Lumine

Fecha: 13-11-2026. Revisión de los archivos entregados; originales y repositorio sin cambios.

## Resultado principal

**Las dos diferencias declaradas como pendientes por el traspaso se pueden resolver con los archivos recibidos.** El informe Fase 3 sí reproduce 194 respuestas evaluables y 31,9%, bajo su convención conservadora de denominadores. El error está en el script de recálculo entregado: trata cualquier respuesta distinta de «Sí/Si» como un «No», aunque dos celdas de P29 contienen texto de otra pregunta.

No hace falta pedir una nueva encuesta ni excluir arbitrariamente observaciones para alcanzar las cifras del informe. Debe documentarse la validación de respuestas y aclarar cuándo se conserva una observación no evaluable en el denominador.

## Integridad de los archivos

- Los dos archivos originales `Encuesta_ uso del auto y ahorro de combustible.csv` son idénticos byte a byte, con 201 respuestas y 44 columnas. SHA-256: `69c4d4e94477381b9b2bede6c8149f25c6af2e3bdb0b48bf6671dd57a0e66926`.
- El CSV dentro del ZIP coincide exactamente con esos originales.
- `Encuesta_anonimizada.csv` tiene 201 respuestas y 43 columnas; coincide exactamente con el original una vez eliminada la primera columna, la marca temporal. No cambiaron las respuestas.
- No hay respuestas exactamente duplicadas al comparar las 43 columnas sin marca temporal. Esto no prueba que no exista repetición de participantes; solo descarta duplicados exactos.
- Todos los casos declaran disposición a contestar. No aparecen menores de 18 años en las categorías de edad.

## Reproducción y corrección

| Indicador | Resultado comprobado | Criterio |
|---|---:|---|
| Recibidas | 201 | Filas de datos |
| Pasan P4 | 198 | Excluye 3 que no conducen ni pagan gastos de un auto a combustión |
| Sin auto solo eléctrico | 197 | Excluye 1 adicional |
| Válidas generales | 196 | Excluye el caso de incompatibilidad descrito en el informe y en el script |
| Precio evaluable | **194** | P29 debe contener explícitamente Sí/Si/No; dos valores fuera del dominio |
| Aceptan $5.990.000 | **53** | P29 = Sí/Si |
| Solo aceptan $4.990.000 | **47** | P29 = No y P30 = Sí/Si |
| Rechazan ambos | **94** | P29 = No y P30 = No |
| Foco: aplicaciones y colectivos | 95 | P10 |
| Foco a bencina | 91 | P7; 91/95 = 95,7895% |
| Foco a bencina con precio evaluable | 90 | Uno de los dos precios no evaluables pertenece al foco a bencina |
| Foco a bencina, intención definitiva y precio aceptado | **29** | P21 definitiva y escalera de precios evaluable aceptada |
| Techo de adopción conservador del informe | **29/91 = 31,8681%** | Conserva la base completa de bencina, incluso un precio no evaluable |
| Techo entre precios evaluables | 29/90 = 32,2222% | Denominador alternativo; no sustituirlo sin explicitar el criterio |
| Intención definitiva del foco | 32 | Incluye un precio no evaluable |
| De esos 32, aceptan $5.990.000 | **25/32 = 78,125%** | Cociente conservador que usa el documento corregido |
| Mismo cociente, solo precio evaluable | 25/31 = 80,6452% | No usarlo para justificar retrospectivamente la frase antigua |

### Evidencia que explica los dos casos

Filas físicas del CSV, con encabezado en fila 1:

- Fila **18**: P29 contiene «Sabía que eran caros, pero no tanto»; P30 contiene «Si». Pertenece al foco a bencina y declara intención definitiva. El script original la transforma en rechazo del precio alto y aceptación del bajo, inflando de 29 a 30 el numerador de adopción.
- Fila **19**: P29 contiene «Sí, los conocía»; P30 está vacía. No pertenece al foco. El script original termina contándola como rechazo de ambos precios, inflando de 94 a 95 esa categoría.

Ambos textos corresponden semánticamente a la pregunta de conocimiento de precios, no a aceptar una reconversión por $5.990.000. Fase 3, párrafo que empieza «Cambio durante la recolección», ya declara 13 respuestas anteriores a la sección de referencia, **2 en transición** y 181 posteriores. Eso aporta una explicación documental congruente con la anomalía; no hace falta inventar una exclusión.

No reasigné respuestas a columnas ni supuse qué quiso decir cada persona. Se conservaron en la base general de 196 y se marcaron **no evaluables para la escalera de precios**.

### Techo de mercado

La Tabla 19 del documento (índice de tabla 18 en python-docx) ya dice expresamente **«29 de 91»**. Con los cocientes exactos:

`(35.820 + 0,30 × 126.960) × (91/95) × (29/91) = 22.561,389`

Reproduce **22.561 vehículos**. El 31,6% del traspaso es 30/95, una fracción distinta que incorpora el precio no evaluable como aceptación; no es la corrección adecuada del indicador publicado.

Si se prefiriera usar solo casos con precio evaluable, el techo sería 22.812,072 con 29/90. Es una elección metodológica distinta, de efecto pequeño, que debe declararse de antemano. Recomiendo conservar por ahora la convención conservadora reproducida y explicar que se usa el denominador completo con un caso no evaluable, sin denominarlo rechazo observado.

El cociente 25/32 también se reproduce. Su denominador incluye aquel mismo caso de precio no evaluable; por eso es conservador respecto de 25/31. No es una validación del mix de 60% Plus ni una estimación de compras reales.

## Implicaciones para demanda y financiamiento

La encuesta apoya que ofrecer cuotas es relevante: en el foco de 95 casos, **38 prefieren tarjeta, 42 crédito bancario y 15 contado**; 80/95 = 84,2% prefieren alguna financiación. Son preferencias, no tasas de aprobación, cupos disponibles ni capacidad efectiva de pago. No justifican por sí solas la tasa de conversión comercial ni la combinación de medios de cobro del modelo.

La muestra es no probabilística y las respuestas de precio son hipotéticas. El filtro general de una respuesta incompatible está declarado, pero debe conservarse su regla para que no parezca una exclusión escogida por efecto en la aceptación. No procede presentar intervalos de confianza poblacionales ni la intención como compras observadas sin justificar el diseño muestral.

Los precios actuales $4,59 M/$5,29 M no se preguntaron como dos versiones diferenciadas. No se puede deducir automáticamente la preferencia por Esencial/Plus ni una elasticidad entre $4,99 M y $5,99 M. El mix Plus 60%, el costo por cotización y la conversión siguen siendo supuestos.

## Embudo del modelo: un hallazgo adicional

`modelo.py` calcula pedidos como:

`(pauta digital / costo por cotización + visitas) × cobertura de modelos × conversión`

Luego limita instalaciones por capacidad, pendientes e inventario. **El techo Bass no está conectado mediante fórmula al motor mensual**; se contrasta externamente en el informe. La base tampoco incorpora una restricción explícita de aprobación crediticia. Antes de añadir una hay que definir si la conversión del embudo ya la incluye, para no descontarla dos veces.

En el escenario central la comparación anual sí resulta compatible con su techo atendible. Pero hay dos escenarios llamados «bajo» que no coinciden:

| Año | Demanda atendible baja del informe, Tabla 20 | Instalaciones bajas del Excel, Escenarios B10:B14 | Comparación |
|---|---:|---:|---|
| 1 | 56 | 142,1 | Supera el techo bajo |
| 2 | 104 | 249,6 | Supera el techo bajo |
| 3 | 174 | 313,6 | Supera el techo bajo |
| 4 | 288 | 313,6 | Supera el techo bajo |
| 5 | 469 | 377,6 | Bajo el techo |

Esto no invalida por sí mismo el escenario central. Sí exige **conciliar ambos escenarios bajos**, o nombrarlos como sensibilidades distintas: difusión de mercado baja frente a eficiencia comercial baja. No debe presentarse el Excel bajo como un escenario que respeta simultáneamente ambas hipótesis.

La base conserva instalaciones fraccionarias como valores esperados; la nota de redondeo explica el 806 frente a 807 al sumar versiones, pero no convierte el presupuesto operativo en unidades enteras. Fase 4 tendrá que establecer una regla de asignación de enteros y reconciliar totales.

El script original solo lista frecuencias de modelos sin normalización; no reproduce por sí mismo la cobertura de biblioteca del 62% ni su rampa 19%→80%. Esos resultados requieren un catálogo de equivalencias y reglas de compatibilidad. La existencia del CSV mejora la trazabilidad, pero no valida la compatibilidad mecánica de los modelos.

## Archivos de revisión

- `encuesta_calculo_corregido.py` (archivo de trabajo de la revisión original): copia de revisión independiente, sin modificar el script recibido.
- `encuesta_auditoria_resultados.json` (archivo de trabajo de la revisión original): resultados reproducidos.

Ejecutado con el CSV anonimizado. Conciliaciones verificadas: 194 = 53+47+94; 196 = 194+2 no evaluables; adoptantes como subconjunto de casos a bencina con precio evaluable; 25 ≤ 31 ≤ 32; identidad del techo con cocientes exactos. No se imprimieron marcas temporales ni datos de contacto.
