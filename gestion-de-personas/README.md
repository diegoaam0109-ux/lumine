# Informe de Lumine Habilita para Gestión de Personas

El texto vive en el documento de Claude Docs <https://claude.ai/artifact/TjjPEZUvxSV6jx6mubNEJP>. El Word y el PDF que
se entregan se arman desde un markdown fuente (`informe_v2.md`, que no se sube porque el repositorio es público) así:

1. `python3 numerar.py informe_v2.md informe_num.md`: cambia cada `{{clave}}` por su nota numerada en orden de aparición
   y agrega la lista de fuentes (`fuentes.py`, con enlaces).
2. `python3 armar_v2.py informe_num.md informe.docx`: pandoc + portada UNAB, índice, estilos, tablas y número de página.
   Necesita `ishikawa.png` (captura del diagrama del documento) junto al markdown.
3. `soffice --headless --convert-to pdf informe.docx` y `python3 indice_v2.py informe.docx informe.pdf`: rellena el
   índice con las páginas reales. Se vuelve a convertir a PDF para la entrega.

Límite del profesor: 10 páginas sin contar portada, índice y fuentes (hoy: páginas 3 a 12).
`armar.py` e `indice.py` son de la versión anterior (25-10-2026).
