# Lumine Motors · Entrega 3: diseño y prototipo de la solución de IA

Trabajo Final de IA Aplicada al Marketing y los Negocios (UNAB, Grupo 1, NRC 4153).

## Entregables

| Archivo | Contenido |
|---|---|
| `TIG_IA_Grupo01_LumineMotors_Entrega03.docx` | Informe en Word (cuerpo de 12 páginas + anexos A a I) |
| `TIG_IA_Grupo01_LumineMotors_Entrega03.pdf` | Mismo informe en PDF |
| `prototipo/app/index.html` | Prototipo funcional (cotización, diagnóstico y panel del técnico); se abre en cualquier navegador |
| `Lumine_Informe_Tecnico_Modelo_Matematico.docx/.pdf` | Informe técnico: ecuaciones, ejemplo resuelto, estadísticos, sensibilidad y cifras clave |
| `Lumine_Plan_MultiIA_y_Terreno.docx/.pdf` | Qué hace cada IA (ChatGPT, Gemini, DeepSeek, Grok, Canva), prompts listos y terreno sin costo |
| `prototipo/validador_multimodelo.py` | Califica respuestas de otras IA con los mismos 9 criterios |
| `figuras/` | Figuras y capturas usadas en los informes |

## Cómo reproducir los resultados

```bash
cd entrega3/prototipo
pip install numpy pandas scikit-learn numba matplotlib pydantic fastsim==2.1.5
python dataset.py            # simula 3.000 jornadas sintéticas + 45 reales (CMAP) + ciclos estándar
python validacion_fastsim.py # calibración del consumo base contra FASTSim (NREL)
python model.py              # modelos M0 a M3, intervalos conformes, validación externa, exporta app/modelo.json
python casos.py              # batería de 12 casos de prueba
python validador.py          # aplica los 9 criterios de aceptación a las salidas de cada versión del prompt
python figuras.py            # figuras del informe
python construir_app.py      # arma app/index.html con el modelo incrustado
node ../informe/generar.js   # regenera el informe Word
```

`generador.py` conecta la capa generativa (prompt RAFA v3.1) con la API de Claude; necesita credenciales de Anthropic y,
si la API no responde, usa la plantilla de respaldo.

## Datos

- `datos/fastsim_cycles/`: ciclos estándar y subconjunto del inventario de viajes con GPS de Chicago (CMAP, 2007),
  distribuidos con FASTSim del NREL bajo licencia Apache 2.0 (ver `LICENSE_FASTSim.txt`). **Reales, secundarios, no chilenos.**
- `resultados/jornadas_sinteticas.csv`: 300 conductores de Santiago **sintéticos**, calibrados con el TomTom Traffic Index 2025.
- Los parámetros del kit son **supuestos** (escenarios conservador, referencia y optimista; ver Anexo C).

## Pendiente para la Entrega 4

El levantamiento de jornadas reales en Santiago (OE1) no se hizo en esta etapa. El protocolo está en el Anexo G.
Si el grupo registra jornadas propias (CSV con `velocidad_kmh` por segundo y, si existe, `pendiente_pct` y `dia`),
la pestaña Diagnóstico del prototipo las procesa directamente.
