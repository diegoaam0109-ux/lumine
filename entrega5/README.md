# Informe final (Entrega 5, integra la Entrega 4)

## Qué subir
| Archivo | Para qué |
|---|---|
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.pdf` | Informe consolidado (desarrollo en las páginas 3 a 18; anexos A a K) |
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.docx` | Misma versión en Word, si la piden |
| `TIG_IA_Grupo01_LumineMotors_Presentacion.pptx` | Presentación de 11 diapositivas (7 minutos) con notas del orador |
| Zip de anexos (opcional) | `entrega3/prototipo/` sin `__pycache__`, `entrega4/redteam/`, `entrega5/analisis/` y `entrega5/figuras/` |

## Reparto de la exposición (notas en cada diapositiva)
- Diego: diapositivas 1 a 3 y 11 (unos 2 min 20 s)
- Benjamín: 4 a 6 (unos 2 min 15 s)
- Lukas: 7 a 10 (unos 2 min 35 s)

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
