# Entrega 4 · Revisión cruzada con múltiples IA y mejoras del modelo

Script: `entrega3/prototipo/mejoras_e4.py` · Resultados: `entrega3/prototipo/resultados/e4/`
Los resultados de la Entrega 3 no se modifican.

## 1. Qué se pidió a cada IA y qué se hizo

| IA | Encargo | Hallazgo principal | Acción del equipo |
|---|---|---|---|
| Gemini | Verificar a mano 3 cálculos | Energía cinética 35,9 Wh; payback 99/123/157 km/día; cuantil 0,8038: todo coincide | Se deja como evidencia de verificación |
| ChatGPT | Revisar código (sim.py, model.py, prompt) | Validación externa mezcla conductor y jornada; calibración sin pesos ni grupos | Corregido (tabla 3) |
| DeepSeek | Auditar el diseño de validación | Una sola partición; sin modelo lineal de 11 variables; posible aprendizaje del simulador | Corregido (tablas 2 y 4) |
| Grok | 10 ataques al prompt RAFA v3.1 | Batería adversarial (2 notas ajustadas al contexto chileno) | Ejecutar en Claude y registrar resultado |
| Canva IA | Infografía de resultados | Cifras correctas; coordenadas de Madrid, relleno falso y textos que prometían de más | Corregida por el equipo |

Dos IA distintas (ChatGPT y DeepSeek) llegaron por separado al mismo problema de la validación externa.

## 2. Robustez: 10 particiones 70/30 (media ± DE)

| Modelo | MAE (pp) | R² | Cobertura 80% |
|---|---|---|---|
| M0c Promedio por perfil (intervalo fuera de muestra) | 1,08 ± 0,11 | 0,66 | 81% |
| M1 Nivel 1 cotización (GBM, declarados) | 1,12 ± 0,09 | 0,64 | 80% |
| M2 Lineal 2 variables (Entrega 2) | 1,24 ± 0,11 | 0,54 | 81% |
| **L11 Lineal 11 variables GPS** | **0,77 ± 0,08** | **0,83** | 81% |
| R11 Ridge 11 variables GPS | 0,77 ± 0,08 | 0,83 | 81% |
| M3 GBM 11 variables GPS (modelo E3) | 0,89 ± 0,08 | 0,77 | 83% |
| Ref. simulación directa semana 1 | 0,79 ± 0,05 | 0,82 | — |

- La cifra de la E3 (MAE 0,95; R² 0,80) venía de una sola partición; el promedio real es 0,89 ± 0,08.
- **El lineal de 11 variables supera al GBM en 10 de 10 particiones.** Con 210 conductores el GBM no aporta: se propone reemplazarlo por Ridge en el Nivel 2 (más simple, explicable y más preciso).
- Curva de aprendizaje (MAE GBM): 48 → 2,03; 96 → 0,98; 144 → 0,90; 192 → 0,88; 240 → 0,90. Se aplana desde ~150 conductores.
- Número de árboles: 100 bastan (MAE 0,88); 300 no mejora (0,89). No hay sobreajuste por árboles.
- Importancia (10 particiones): energía cinética por km 0,23 ± 0,07; cilindrada 0,14; desnivel 0,10; aceleración 0,10; % detenido 0,09. Velocidades y detenciones/km ≈ 0 (redundantes con energía cinética).

## 3. Validación externa con datos reales CMAP (21 vehículos, 45 jornadas)

| Diseño | MAE (pp) | Cobertura 80% |
|---|---|---|
| a) Por jornada, KFold por fila (E3) | 2,01 | 33% |
| a) Por jornada, GroupKFold por conductor | 2,01 | 36% |
| b) Por vehículo (misma unidad en ambos lados) | 2,65 | 5% |
| c) Solo sintéticas | 2,10 ± 0,62 | 36% |
| c) Solo CMAP (2/3 de vehículos) | 1,60 ± 0,49 | 81% |
| c) Reajuste ×20, calibración E3 | 1,28 ± 0,38 | 74% |
| **c) Reajuste ×20, calibración ponderada y por vehículo** | **1,28 ± 0,38** | **78%** |
| c) Cifra genérica 25% | 11,44 | — |

- Corregir la fuga (GroupKFold) cambia poco (33% → 36%): **la baja cobertura no era fuga sino diferencia de dominio** entre conductores sintéticos y reales.
- Con la calibración corregida, el modelo reajustado llega a 78% de cobertura (nominal 80%) y supera tanto a "solo sintéticas" como a "solo CMAP": el peso ×20 sí aporta.
- Conclusión: los datos de terreno de la E4 son la pieza que falta; con pocos vehículos reales el modelo ya se acerca a la cobertura prometida.

## 4. ¿El modelo aprende al conductor o al simulador? (DeepSeek #1)

Población B simulada con otra semilla, +10 pts de congestión, +30% de paradas, −30% de autopista y −10% de km (120 conductores).

| Modelo entrenado en A, probado en B | MAE (pp) | R² | Cobertura 80% |
|---|---|---|---|
| M3 GBM | 0,87 | 0,74 | 81% |
| L11 Lineal | 0,81 | 0,74 | 81% |
| Ref. simulación directa semana 1 | 0,82 | 0,72 | — |

- El MAE no se degrada en una población distinta (−2%): el modelo generaliza dentro del simulador.
- Límite honesto: A y B salen del mismo simulador, por lo que esta prueba no descarta que el simulador difiera de la realidad. Eso solo lo responde el terreno (CMAP ya mostró 2 pp de error sin reajuste).

## 5. Texto sugerido para el informe E4

> En la Entrega 4 se aplicó una revisión cruzada con cinco IA. Gemini verificó a mano los cálculos centrales sin encontrar diferencias. ChatGPT y DeepSeek, de forma independiente, detectaron debilidades en la validación externa y en el diseño de evaluación. Al corregirlas se obtuvo: (1) el error real del modelo, promediado en 10 particiones, es 0,89 ± 0,08 pp y no 0,95; (2) un modelo lineal regularizado con las mismas 11 variables es mejor (0,77 pp) en las 10 particiones, por lo que se adopta para el Nivel 2; (3) la baja cobertura externa de la E3 se debía a la diferencia entre conductores sintéticos y reales, no a fuga de información, y con calibración corregida y reajuste con datos reales la cobertura sube a 78%; (4) el modelo mantiene su error en una población simulada distinta, aunque solo los datos de terreno pueden validar el simulador mismo.
