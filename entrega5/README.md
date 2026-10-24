# Informe final (Entrega 5, integra la Entrega 4)

## Qué subir
| Archivo | Para qué |
|---|---|
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.pdf` | Informe consolidado (desarrollo en las páginas 3 a 17; anexos A a J) |
| `TIG_IA_Grupo01_LumineMotors_InformeFinal.docx` | Misma versión en Word, si la piden |
| `TIG_IA_Grupo01_LumineMotors_Presentacion.pptx` | Presentación de 10 diapositivas (7 minutos) con notas del orador |
| Zip de anexos (opcional) | `entrega3/prototipo/` sin `__pycache__`, `entrega4/redteam/`, `entrega5/analisis/` y `entrega5/figuras/` |

## Reparto de la exposición (notas en cada diapositiva)
- Diego: diapositivas 1 a 3 y 10 (unos 2 min 25 s)
- Benjamín: 4 a 6 (unos 2 min 15 s)
- Lukas: 7 a 9 (unos 2 min 5 s)

## Cómo regenerar
```
python entrega3/prototipo/mejoras_e4.py        # validación corregida (unos 30 min)
python entrega5/analisis/analisis_final.py     # cifras y figuras del informe final
bash entrega5/informe/construir.sh             # Word, PDF e índice paginado
NODE_PATH=<módulos con pptxgenjs, react-icons, react, react-dom y sharp> node entrega5/presentacion/generar_ppt.js
```
