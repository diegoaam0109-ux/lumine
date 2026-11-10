# Informe final (Entrega 5, integra la Entrega 4)

## Qué subir
| Archivo | Para qué |
|---|---|
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.pdf` | Informe consolidado (desarrollo en las páginas 3 a 18; anexos A a K) |
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.docx` | Misma versión en Word, si la piden |
| `TIG_IA_Grupo01_LumineMotors_Presentacion.pptx` | Presentación de 13 diapositivas (7 minutos) con video del MVP y notas del orador |
| `TIG_IA_Grupo01_LumineMotors_Guion.docx` | Guion de la exposición por integrante y diapositiva |
| MVP | claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx (público) |
| Sitio comercial | claude.ai/artifact/XGpgpuDtxJvtiAjbRDwJ2o (público) |
| Zip de anexos (opcional) | `entrega3/prototipo/` sin `__pycache__`, `entrega4/redteam/`, `entrega5/analisis/` y `entrega5/figuras/` |

## Reparto de la exposición (notas en cada diapositiva)
- Diego: diapositivas 1 a 3, 12 y 13 (2 min 25 s)
- Benjamín: 4 a 6 (2 min)
- Lukas: 7 a 11 (2 min 35 s)

## Cómo regenerar
```
python entrega3/prototipo/mejoras_e4.py        # validación corregida (unos 30 min)
python entrega5/analisis/analisis_final.py     # cifras y figuras del informe final
python entrega5/analisis/fig_flujo.py          # figura del flujo de trabajo
NODE_PATH=<módulos con playwright> node entrega5/capturas/capturar.js   # capturas del prototipo con Ridge
python -m pytest entrega3/prototipo/tests -q   # 20 pruebas
bash entrega5/informe/construir.sh             # Word, PDF e índice paginado
NODE_PATH=<módulos con pptxgenjs, react-icons, react, react-dom y sharp> node entrega5/presentacion/generar_ppt.js
```
