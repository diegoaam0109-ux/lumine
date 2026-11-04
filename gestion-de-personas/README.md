# Informe de Lumine Habilita para Gestión de Personas

El texto vive en el documento de Claude Docs <https://claude.ai/artifact/TjjPEZUvxSV6jx6mubNEJP>. El Word que se entrega se arma así:

1. Exportar el documento a `.docx` desde Claude (el diagrama de Ishikawa y el de arquitectura salen como imágenes).
2. `python3 armar.py export.docx informe.docx`: portada UNAB, índice, encabezado, número de página, estilos y tablas.
3. `soffice --headless --convert-to pdf informe.docx` para obtener las páginas reales.
4. `python3 indice.py informe.docx informe.pdf`: rellena el índice con los títulos y sus páginas (Word lo puede actualizar igual).

El `.docx` no se sube al repositorio.
